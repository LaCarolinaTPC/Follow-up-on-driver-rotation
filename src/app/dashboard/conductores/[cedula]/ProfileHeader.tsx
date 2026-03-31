import Link from "next/link";
import { getInitials } from "@/lib/utils/format";
import { GrupoBadge, TipoBadge, EstadoBadge } from "@/components/ui/Badge";
import { ChevronLeft } from "lucide-react";
import type { ConductorConGrupo } from "@/types/database";

export default function ProfileHeader({
  conductor,
}: {
  conductor: ConductorConGrupo;
}) {
  return (
    <div>
      <Link
        href="/dashboard/conductores"
        className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary transition-colors mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al buscador
      </Link>

      <div className="bg-surface-raised rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0">
          {getInitials(conductor.nombre)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary truncate">
            {conductor.nombre}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            CC {conductor.cedula}
            {conductor.codigo && ` · Cod. ${conductor.codigo}`}
            {conductor.meses_antiguedad != null &&
              ` · ${Math.round(conductor.meses_antiguedad)} meses`}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <TipoBadge tipo={conductor.tipo_conductor} />
            <GrupoBadge grupo={conductor.grupo_antiguedad} />
            <EstadoBadge estado={conductor.estado} />
          </div>
        </div>
      </div>
    </div>
  );
}
