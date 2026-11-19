import type { EstadoSet } from "@/lib/api";
import { estadoLabel } from "@/lib/format";

const colores: Record<EstadoSet, string> = {
  Registrado: "bg-surface-variant text-on-surface-variant",
  En_Proceso: "bg-tertiary-fixed text-on-tertiary-fixed",
  Finalizado: "bg-secondary-container text-on-secondary-container",
  Firmado: "bg-primary-fixed text-on-primary-fixed",
};

export function EstadoBadge({ estado }: { estado: EstadoSet }) {
  return (
    <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold ${colores[estado]}`}>
      {estadoLabel(estado)}
    </span>
  );
}