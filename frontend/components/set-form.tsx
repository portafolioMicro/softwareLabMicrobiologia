"use client";

import { useState, type FormEvent } from "react";
import { Field, FormFooter, errorMessage, inputClass } from "./ui-bits";
import type { Cliente, SetDetalle, SetInput } from "@/lib/api";
import { fromLocalInput, toDateInput, toLocalInput } from "@/lib/format";

export function SetForm({
  initial,
  clientes,
  onSubmit,
  onCancel,
}: {
  initial?: SetDetalle | null;
  clientes: Cliente[];
  onSubmit: (input: SetInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    id_cliente: initial ? String(initial.id_cliente) : "",
    solicitante: initial?.solicitante ?? "",
    causa_analisis: initial?.causa_analisis ?? "",
    responsable_toma: initial?.responsable_toma ?? "",
    lugar_toma: initial?.lugar_toma ?? "",
    direccion_muestreo: initial?.direccion_muestreo ?? "",
    fecha_hora_toma: toLocalInput(initial?.fecha_hora_toma),
    fecha_hora_recepcion: toLocalInput(initial ? initial.fecha_hora_recepcion : new Date().toISOString()),
    fecha_estimada_reporte: toDateInput(initial?.fecha_estimada_reporte),
    acreditado_onac: initial?.acreditado_onac ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiar = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));
  const opt = (v: string) => v.trim() || null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        id_cliente: Number(f.id_cliente),
        solicitante: opt(f.solicitante),
        causa_analisis: opt(f.causa_analisis),
        responsable_toma: opt(f.responsable_toma),
        lugar_toma: opt(f.lugar_toma),
        direccion_muestreo: opt(f.direccion_muestreo),
        fecha_hora_toma: fromLocalInput(f.fecha_hora_toma),
        fecha_hora_recepcion: fromLocalInput(f.fecha_hora_recepcion),
        fecha_estimada_reporte: f.fecha_estimada_reporte || null,
        acreditado_onac: f.acreditado_onac,
      });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-space-sm">
      <Field id="id_cliente" label="Cliente" required>
        <select id="id_cliente" required value={f.id_cliente} onChange={cambiar("id_cliente")} className={inputClass}>
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre_empresa} ({c.nit})
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Field id="solicitante" label="Solicitante">
          <input id="solicitante" value={f.solicitante} onChange={cambiar("solicitante")} className={inputClass} />
        </Field>
        <Field id="causa_analisis" label="Causa del análisis">
          <input id="causa_analisis" value={f.causa_analisis} onChange={cambiar("causa_analisis")} className={inputClass} />
        </Field>
        <Field id="responsable_toma" label="Responsable de la toma">
          <input id="responsable_toma" value={f.responsable_toma} onChange={cambiar("responsable_toma")} className={inputClass} />
        </Field>
        <Field id="lugar_toma" label="Lugar de la toma">
          <input id="lugar_toma" value={f.lugar_toma} onChange={cambiar("lugar_toma")} className={inputClass} />
        </Field>
      </div>

      <Field id="direccion_muestreo" label="Dirección de muestreo">
        <input id="direccion_muestreo" value={f.direccion_muestreo} onChange={cambiar("direccion_muestreo")} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        <Field id="fecha_hora_toma" label="Fecha y hora de toma">
          <input id="fecha_hora_toma" type="datetime-local" value={f.fecha_hora_toma} onChange={cambiar("fecha_hora_toma")} className={inputClass} />
        </Field>
        <Field id="fecha_hora_recepcion" label="Fecha y hora de recepción">
          <input id="fecha_hora_recepcion" type="datetime-local" value={f.fecha_hora_recepcion} onChange={cambiar("fecha_hora_recepcion")} className={inputClass} />
        </Field>
        <Field id="fecha_estimada_reporte" label="Fecha estimada de reporte">
          <input id="fecha_estimada_reporte" type="date" value={f.fecha_estimada_reporte} onChange={cambiar("fecha_estimada_reporte")} className={inputClass} />
        </Field>
      </div>

      <label className="flex items-center gap-space-xs font-body-md text-body-md">
        <input
          type="checkbox"
          checked={f.acreditado_onac}
          onChange={(e) => setF((prev) => ({ ...prev, acreditado_onac: e.target.checked }))}
        />
        Acreditado ONAC
      </label>

      <FormFooter error={error} saving={saving} onCancel={onCancel} />
    </form>
  );
}