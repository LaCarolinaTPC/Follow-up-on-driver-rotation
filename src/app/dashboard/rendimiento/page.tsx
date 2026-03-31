import { BarChart3 } from "lucide-react";
import RendimientoDashboard from "./RendimientoDashboard";

async function getRendimientoData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/rendimiento`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function RendimientoPage() {
  const data = await getRendimientoData();

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto pt-16 text-center animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
          <BarChart3 className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary">
          Error cargando datos
        </h1>
        <p className="text-sm text-text-tertiary mt-2">
          No se pudieron obtener las metricas de rendimiento.
        </p>
      </div>
    );
  }

  return <RendimientoDashboard data={data} />;
}
