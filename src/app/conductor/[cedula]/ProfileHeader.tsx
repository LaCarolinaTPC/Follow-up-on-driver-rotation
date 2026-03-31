import { getInitials } from "@/lib/utils/format";
import { GrupoBadge, TipoBadge, EstadoBadge } from "@/components/ui/Badge";
import type { ConductorConGrupo } from "@/types/database";

export default function ProfileHeader({
  conductor,
}: {
  conductor: ConductorConGrupo;
}) {
  return (
    <div className="bg-surface-raised rounded-2xl border border-border-subtle shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-text-primary to-text-secondary text-gold-400 flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0">
        {getInitials(conductor.nombre)}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary truncate">
          {conductor.nombre}
        </h1>
        <p className="text-sm text-text-tertiary mt-1">
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
  );
}
