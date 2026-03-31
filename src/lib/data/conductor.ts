import { createClient } from "@supabase/supabase-js";

export async function getConductorProfile(cedula: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: conductor, error: condError } = await supabase
    .from("conductores_con_grupo")
    .select("*")
    .eq("cedula", cedula)
    .single();

  if (condError || !conductor) return null;

  let cierres: Record<string, unknown>[] = [];
  if (conductor.codigo) {
    const { data } = await supabase
      .from("cierres_diarios")
      .select("fecha, ruta, vehiculo, viajes, timbradas, diff_tim, prom_tim, pct_indiv, pct_grupo, pct_total")
      .eq("cod_conductor", conductor.codigo)
      .order("fecha", { ascending: true });
    cierres = data || [];
  }

  const { data: viajes_perdidos } = await supabase
    .from("viajes_perdidos")
    .select("*")
    .eq("cedula_conductor", cedula)
    .order("fecha", { ascending: false });

  const { data: ausentismo } = await supabase
    .from("ausentismo")
    .select("consecutivo_incapacidad, dias_it_pagados, origen, fecha_inicio, fecha_fin, diagnostico, eps, indicador_prorroga, cie10, genero, edad, antiguedad, vinculacion, cargo")
    .eq("cedula", cedula)
    .order("fecha_inicio", { ascending: false });

  const { data: familia } = await supabase
    .from("familia")
    .select("nombre_familiar, parentesco, edad")
    .eq("cedula_empleado", cedula);

  const vp = viajes_perdidos || [];
  const vpConductor = vp.filter((v: Record<string, unknown>) => (v.tipologia as string)?.toUpperCase() === "CONDUCTOR");

  const totalTimbradas = (cierres || []).reduce((sum: number, c: Record<string, unknown>) => sum + Number(c.timbradas || 0), 0);
  const diasTrabajados = new Set((cierres || []).map((c: Record<string, unknown>) => c.fecha)).size;

  const kpis = {
    dias_trabajados: diasTrabajados,
    total_timbradas: Math.round(totalTimbradas),
    total_vp: vpConductor.length,
    accidentes: vp.filter((v: Record<string, unknown>) => (v.novedad as string)?.toUpperCase().includes("ACCIDENTE")).length,
    incapacidades: (ausentismo || []).length,
    dias_incapacidad: (ausentismo || []).reduce((sum: number, a: Record<string, unknown>) => sum + Number(a.dias_it_pagados || 0), 0),
    familiares: (familia || []).length,
  };

  return {
    conductor,
    cierres: cierres || [],
    viajes_perdidos: vp,
    ausentismo: ausentismo || [],
    familia: familia || [],
    kpis,
  };
}
