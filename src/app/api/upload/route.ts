import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  processConductores,
  processCierres,
  processViajesPerdidos,
  processAusentismo,
  processFamilia,
} from "@/lib/upload/processors";
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

    // Parse FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Error leyendo el archivo. Puede que exceda el limite de tamaño (max ~4.5 MB)" },
        { status: 413 }
      );
    }

    const fileType = formData.get("fileType") as FileType;
    const files = formData.getAll("files") as File[];

    const config = FILE_TYPE_CONFIG[fileType];
    if (!config) {
      return NextResponse.json({ error: "Tipo de archivo no valido" }, { status: 400 });
    }
    if (files.length === 0) {
      return NextResponse.json({ error: "No se enviaron archivos" }, { status: 400 });
    }
    if (!config.multiple && files.length > 1) {
      return NextResponse.json({ error: "Solo se permite un archivo" }, { status: 400 });
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

    const results: UploadResult[] = [];

    for (const file of files) {
      const data = new Uint8Array(await file.arrayBuffer());
      let processed;

      try {
        switch (fileType) {
          case "conductores_activos":
            processed = processConductores(data, "ACTIVO");
            break;
          case "conductores_retirados":
            processed = processConductores(data, "RETIRADO");
            break;
          case "cierres_diarios":
            processed = processCierres(data, file.name);
            break;
          case "viajes_perdidos":
            processed = processViajesPerdidos(data, file.name);
            break;
          case "ausentismo":
            processed = processAusentismo(data, file.name);
            break;
          case "familia":
            processed = processFamilia(data);
            break;
        }
      } catch (e) {
        results.push({
          success: false,
          fileName: file.name,
          rowsProcessed: 0,
          rowsErrors: 0,
          errors: [`Error procesando archivo: ${(e as Error).message}`],
        });
        continue;
      }

      // For periodo_replace: delete existing records for the periodos in this file
      if (config.strategy === "periodo_replace" && processed.periodos?.length) {
        for (const periodo of processed.periodos) {
          await supabase.from(config.table).delete().eq("periodo", periodo);
        }
      }

      // Insert/upsert in chunks
      let rowsProcessed = 0;
      let rowsErrors = 0;
      const chunkErrors: string[] = [...processed.errors];

      for (let i = 0; i < processed.records.length; i += 200) {
        const chunk = processed.records.slice(i, i + 200);

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
        file_name: file.name,
        file_type: fileType,
        rows_processed: rowsProcessed,
        rows_errors: rowsErrors,
        periodo: processed.periodos?.join(", ") || null,
        status: rowsErrors === 0 ? "completed" : "completed_with_errors",
        uploaded_by: user.email,
        error_log: chunkErrors.length > 0 ? chunkErrors.slice(0, 20) : null,
      });

      results.push({
        success: rowsErrors === 0,
        fileName: file.name,
        rowsProcessed,
        rowsErrors,
        errors: chunkErrors.slice(0, 5),
      });
    }

    return NextResponse.json({ results });
  } catch (e) {
    console.error("Upload API error:", e);
    return NextResponse.json(
      { error: `Error interno del servidor: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
