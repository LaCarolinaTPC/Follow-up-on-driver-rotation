import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { FILE_TYPE_CONFIG, type FileType } from "@/lib/upload/types";

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { action, fileType, fileName, records, periodos } = body as {
      action: "prepare" | "chunk" | "finish";
      fileType: FileType;
      fileName: string;
      records?: Record<string, unknown>[];
      periodos?: string[];
    };

    const config = FILE_TYPE_CONFIG[fileType];
    if (!config) {
      return NextResponse.json({ error: "Tipo de archivo no valido" }, { status: 400 });
    }

    // PREPARE: delete existing data if strategy requires it
    if (action === "prepare") {
      if (config.strategy === "delete_insert") {
        const { error } = await supabase.from(config.table).delete().not("id", "is", null);
        if (error) {
          return NextResponse.json({ error: `Error limpiando tabla: ${error.message}` }, { status: 500 });
        }
      }
      if (config.strategy === "periodo_replace" && periodos?.length) {
        for (const periodo of periodos) {
          await supabase.from(config.table).delete().eq("periodo", periodo);
        }
      }
      return NextResponse.json({ ok: true });
    }

    // CHUNK: insert/upsert a batch of records
    if (action === "chunk" && records?.length) {
      let error;
      if (config.strategy === "upsert" && config.onConflict) {
        ({ error } = await supabase
          .from(config.table)
          .upsert(records, { onConflict: config.onConflict }));
      } else {
        ({ error } = await supabase.from(config.table).insert(records));
      }

      if (error) {
        return NextResponse.json({ ok: false, error: error.message, failed: records.length });
      }
      return NextResponse.json({ ok: true, inserted: records.length });
    }

    // FINISH: log the upload
    if (action === "finish") {
      const { rowsProcessed, rowsErrors, errors: uploadErrors } = body as {
        rowsProcessed: number;
        rowsErrors: number;
        errors: string[];
      };

      await supabase.from("data_uploads").insert({
        file_name: fileName,
        file_type: fileType,
        rows_processed: rowsProcessed,
        rows_errors: rowsErrors,
        periodo: periodos?.join(", ") || null,
        status: rowsErrors === 0 ? "completed" : "completed_with_errors",
        uploaded_by: user.email,
        error_log: uploadErrors?.length > 0 ? uploadErrors.slice(0, 20) : null,
      });

      return NextResponse.json({
        results: [{
          success: rowsErrors === 0,
          fileName,
          rowsProcessed,
          rowsErrors,
          errors: (uploadErrors || []).slice(0, 5),
        }],
      });
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
  } catch (e) {
    console.error("Upload-records API error:", e);
    return NextResponse.json(
      { error: `Error interno del servidor: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
