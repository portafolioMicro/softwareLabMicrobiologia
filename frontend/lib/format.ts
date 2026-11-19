import type { EstadoSet } from "./api";

export const ESTADOS: { value: EstadoSet; label: string }[] = [
  { value: "Registrado", label: "Registrado" },
  { value: "En_Proceso", label: "En proceso" },
  { value: "Finalizado", label: "Finalizado" },
  { value: "Firmado", label: "Firmado" },
];

export const estadoLabel = (e: EstadoSet) => ESTADOS.find((x) => x.value === e)?.label ?? e;

export function formatFechaHora(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

// Las fechas sin hora llegan como medianoche UTC; se muestran sin correrse de día
export function formatFecha(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso.slice(0, 10) + "T12:00:00").toLocaleDateString("es-CO", { dateStyle: "medium" });
}

/** ISO -> valor para <input type="datetime-local"> (hora local) */
export function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** valor de <input type="datetime-local"> -> ISO (o null si está vacío) */
export function fromLocalInput(v: string) {
  return v ? new Date(v).toISOString() : null;
}

/** ISO -> valor para <input type="date"> */
export function toDateInput(iso?: string | null) {
  return iso ? iso.slice(0, 10) : "";
}