import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { FILE_TYPE_CONFIG, type FileType, type UploadResult } from "@/lib/upload/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Admin client for writes
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { fileType, fileName, records, errors: parseErrors, periodos } = body as {
      fileType: FileType;
      fileName: string;
      records: Record<string, unknown>[];
      errors: string[];
      periodos?: string[];
    };

    const config = FILE_TYPE_CONFIG[fileType];
    if (!config) {
      return NextResponse.json({ error: "Tipo de archivo no valido" }, { status: 400 });
    }
    if (!records || records.length === 0) {
      return NextResponse.json({ error: "No se encontraron registros en el archivo" }, { status: 400 });
    }

    // For delete_insert strategy: clear table first
    if (config.strategy === "delete_insert") {
      const { error: delError } = await supabase.from(config.table).delete().not("id", "is", null);
      if (delError) {
        return NextResponse.json(
          { error: `Error limpiando tabla: ${delError.message}` },
          { status: 500 }
        );
      }
    }

    // For periodo_replace: delete existing records for the periodos
    if (config.strategy === "periodo_replace" && periodos?.length) {
      for (const periodo of periodos) {
        await supabase.from(config.table).delete().eq("periodo", periodo);
      }
    }

    // Insert/upsert in chunks
    let rowsProcessed = 0;
    let rowsErrors = 0;
    const chunkErrors: string[] = [...(parseErrors || [])];

    for (let i = 0; i < records.length; i += 200) {
      const chunk = records.slice(i, i + 200);

      let error;
      if (config.strategy === "upsert" && config.onConflict) {
        ({ error } = await supabase
          .from(config.table)
          .upsert(chunk, { onConflict: config.onConflict }));
      } else {
        ({ error } = await supabase.from(config.table).insert(chunk));
      }

      if (error) {
        chunkErrors.push(`Chunk ${i}: ${error.message}`);
        rowsErrors += chunk.length;
      } else {
        rowsProcessed += chunk.length;
      }
    }

    // Log upload
    await supabase.from("data_uploads").insert({
      file_name: fileName,
      file_type: fileType,
      rows_processed: rowsProcessed,
      rows_errors: rowsErrors,
      periodo: periodos?.join(", ") || null,
      status: rowsErrors === 0 ? "completed" : "completed_with_errors",
      uploaded_by: user.email,
      error_log: chunkErrors.length > 0 ? chunkErrors.slice(0, 20) : null,
    });

    const result: UploadResult = {
      success: rowsErrors === 0,
      fileName,
      rowsProcessed,
      rowsErrors,
      errors: chunkErrors.slice(0, 5),
    };

    return NextResponse.json({ results: [result] });
  } catch (e) {
    console.error("Upload-records API error:", e);
    return NextResponse.json(
      { error: `Error interno del servidor: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
