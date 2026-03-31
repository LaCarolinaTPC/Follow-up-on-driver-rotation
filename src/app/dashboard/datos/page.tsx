import { FileSpreadsheet } from "lucide-react";

export default function DatosPage() {
  return (
    <div className="max-w-4xl mx-auto pt-16 text-center animate-fade-in">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-warning-bg flex items-center justify-center mb-6">
        <FileSpreadsheet className="w-7 h-7 text-warning" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
        Carga de Datos
      </h1>
      <p className="text-sm text-text-tertiary mt-2 max-w-md mx-auto">
        Sube los archivos Excel para actualizar la informacion de conductores,
        cierres diarios, viajes perdidos y ausentismo. Proximamente.
      </p>
    </div>
  );
}
