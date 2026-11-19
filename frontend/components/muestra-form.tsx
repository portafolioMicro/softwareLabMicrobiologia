"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Field, FormFooter, errorMessage, inputClass } from "./ui-bits";
import { listNormaAnalisis, type MuestraInput, type MuestraItem, type Norma, type NormaAnalisis } from "@/lib/api";
import { toDateInput } from "@/lib/format";

const REMITIDO = "Se remite a otro laboratorio";

export function MuestraForm({
  initial,
  normas,
  onSubmit,
  onCancel,
}: {
  initial?: MuestraItem | null;
  normas: Norma[];
  onSubmit: (input: MuestraInput) => Promise<void>;
  onCancel: () => void;
}) {
  const editando = !!initial;
  const [f, setF] = useState({
    id_norma: initial ? String(initial.id_norma) : "",
    nombre_muestra: initial?.nombre_muestra ?? "",
    proveedor_manipulador: initial?.proveedor_manipulador ?? "",
    cantidad: initial?.cantidad ?? "",
    tipo_matriz: initial?.tipo_matriz ?? "",
    punto_muestreo: initial?.punto_muestreo ?? "",
    tecnica_muestreo: initial?.tecnica_muestreo ?? "",
    estado_fisico: initial?.estado_fisico ?? "",
    temp_toma: initial?.temp_toma ?? "",
    temp_recepcion: initial?.temp_recepcion ?? "",
    lote: initial?.lote ?? "",
    fecha_produccion: toDateInput(initial?.fecha_produccion),
    fecha_vencimiento: toDateInput(initial?.fecha_vencimiento),

  });
  const [filtro, setFiltro] = useState("");
  const [analisis, setAnalisis] = useState<NormaAnalisis[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiar = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));
  const opt = (v: string) => v.trim() || null;

  const opciones = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return normas
      .filter((n) => n.activo && (!q || n.nombre_norma.toLowerCase().includes(q)))
      .sort((a, b) => a.nombre_norma.localeCompare(b.nombre_norma, "es", { numeric: true }));
  }, [normas, filtro]);

  // Vista previa de los análisis que se van a generar al elegir la norma
  useEffect(() => {
    if (!f.id_norma) {
      setAnalisis([]);
      return;
    }
    let activo = true;
    listNormaAnalisis(Number(f.id_norma))
      .then((r) => activo && setAnalisis(r.filter((a) => a.analisis.activo)))
      .catch(() => activo && setAnalisis([]));
    return () => {
      activo = false;
    };
  }, [f.id_norma]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        id_norma: Number(f.id_norma),
        nombre_muestra: f.nombre_muestra.trim(),
        proveedor_manipulador: opt(f.proveedor_manipulador),
        cantidad: opt(f.cantidad),
        tipo_matriz: opt(f.tipo_matriz),
        temp_toma: opt(f.temp_toma),
        temp_recepcion: opt(f.temp_recepcion),
        lote: opt(f.lote),
        fecha_produccion: f.fecha_produccion || null,
        fecha_vencimiento: f.fecha_vencimiento || null,
        estado_fisico: opt(f.estado_fisico),
        punto_muestreo: opt(f.punto_muestreo),
        tecnica_muestreo: opt(f.tecnica_muestreo),
      });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  const remitidos = analisis.filter((a) => a.tecnica_defecto === REMITIDO).length;

  return (
    <form onSubmit={submit} className="flex flex-col gap-space-sm">
      {editando ? (
        <Field id="norma_fija" label="Norma (no se puede cambiar)">
          <input id="norma_fija" disabled value={initial!.norma.nombre_norma} className={`${inputClass} opacity-70`} />
        </Field>
      ) : (
        <>
          <Field id="filtro_norma" label="Buscar norma">
            <input
              id="filtro_norma"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Ej: arequipe, 1,13, agua potable"
              className={inputClass}
            />
          </Field>
          <Field id="id_norma" label={`Norma (${opciones.length})`} required>
            <select id="id_norma" required value={f.id_norma} onChange={cambiar("id_norma")} className={inputClass}>
              <option value="">Selecciona una norma</option>
              {opciones.map((n) => (
                <option key={n.id_norma} value={n.id_norma}>
                  {n.nombre_norma}
                </option>
              ))}
            </select>
          </Field>
          {f.id_norma && (
            <div className="bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-body-sm text-secondary">
              {analisis.length === 0 ? (
                "Esta norma no tiene análisis asignados: la muestra se creará sin filas de resultados."
              ) : (
                <>
                  Se generarán <strong>{analisis.length}</strong> análisis:{" "}
                  {analisis.map((a) => a.analisis.nombre_analisis).join(", ")}.
                  {remitidos > 0 && ` ${remitidos} se remite(n) a otro laboratorio.`}
                </>
              )}
            </div>
          )}
        </>
      )}

      <Field id="nombre_muestra" label="Nombre de la muestra" required>
        <input id="nombre_muestra" required value={f.nombre_muestra} onChange={cambiar("nombre_muestra")} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Field id="proveedor_manipulador" label="Proveedor / manipulador">
          <input id="proveedor_manipulador" value={f.proveedor_manipulador} onChange={cambiar("proveedor_manipulador")} className={inputClass} />
        </Field>
        <Field id="cantidad" label="Cantidad">
          <input id="cantidad" value={f.cantidad} onChange={cambiar("cantidad")} className={inputClass} />
        </Field>

        <Field id="tipo_matriz" label="Tipo de muestra">
          <select id="tipo_matriz" value={f.tipo_matriz} onChange={cambiar("tipo_matriz")} className={inputClass}>
            <option value="">—</option>
            <option value="A">Agua (A)</option>
            <option value="AL">Alimento (AL)</option>
            <option value="MA">Manipulador (MA)</option>
            <option value="S">Superficie (S)</option>
            <option value="AM">Ambiente (AM)</option>
          </select>
        </Field>
        <Field id="estado_fisico" label="Estado del envase">
          <input id="estado_fisico" value={f.estado_fisico} onChange={cambiar("estado_fisico")} className={inputClass} />
        </Field>
        <Field id="punto_muestreo" label="Punto / área muestreada">
          <input id="punto_muestreo" value={f.punto_muestreo} onChange={cambiar("punto_muestreo")} className={inputClass} />
        </Field>
        <Field id="tecnica_muestreo" label="Técnica de muestreo">
          <input id="tecnica_muestreo" value={f.tecnica_muestreo} onChange={cambiar("tecnica_muestreo")} className={inputClass} />
        </Field>


        <Field id="temp_toma" label="Temperatura de toma">
          <input id="temp_toma" value={f.temp_toma} onChange={cambiar("temp_toma")} className={inputClass} />
        </Field>
        <Field id="temp_recepcion" label="Temperatura de recepción">
          <input id="temp_recepcion" value={f.temp_recepcion} onChange={cambiar("temp_recepcion")} className={inputClass} />
        </Field>
        <Field id="lote" label="Lote">
          <input id="lote" value={f.lote} onChange={cambiar("lote")} className={inputClass} />
        </Field>
        <div />
        <Field id="fecha_produccion" label="Fecha de producción">
          <input id="fecha_produccion" type="date" value={f.fecha_produccion} onChange={cambiar("fecha_produccion")} className={inputClass} />
        </Field>
        <Field id="fecha_vencimiento" label="Fecha de vencimiento">
          <input id="fecha_vencimiento" type="date" value={f.fecha_vencimiento} onChange={cambiar("fecha_vencimiento")} className={inputClass} />
        </Field>
      </div>

      <FormFooter error={error} saving={saving} onCancel={onCancel} />
    </form>
  );
}