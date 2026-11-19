"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { Icon } from "./icon";
import { ErrorBox, Field, errorMessage, inputClass } from "./ui-bits";
import {
  getSet,
  listFirmantes,
  saveCondiciones,
  type Firmante,
  type MuestraItem,
  type SetDetalle,
} from "@/lib/api";
import { COLUMNAS, completarCondiciones, type Condiciones } from "@/lib/conteos";
import { formatFecha } from "@/lib/format";
import { REMITIDO } from "@/lib/concepto";

const th = "border border-black px-1 py-1 font-bold bg-neutral-100 text-center align-middle";
const td = "border border-black px-1 py-1 align-middle";

// "5x10^3" se muestra como 5x10³
function Exponente({ texto }: { texto: string }) {
  const partes = texto.split(/\^(\d+)/);
  return <>{partes.map((p, i) => (i % 2 === 1 ? <sup key={i}>{p}</sup> : p))}</>;
}

const fechaLocal = (iso: string) => new Date(iso).toLocaleDateString("es-CO", { dateStyle: "medium" });
const horaLocal = (iso: string) => new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

const resultadosDe = (m: MuestraItem) => m.resultados ?? [];

function ultimaFecha(m: MuestraItem): string | null {
  const fechas = resultadosDe(m).map((r) => r.fecha_analisis).filter(Boolean) as string[];
  return fechas.length ? fechas.sort()[fechas.length - 1] : null;
}

// Lo que va en la celda de un análisis: el resultado, "R" si se remite y aún no hay, o N.A. si no aplica
function celda(m: MuestraItem, analisis: string): string {
  const r = resultadosDe(m).find((x) => x.analisis.nombre_analisis === analisis);
  if (!r) return "N.A.";
  if (r.resultado_final) return r.resultado_final;
  return r.metodo_utilizado === REMITIDO ? "R" : "";
}

// Análisis que no tienen columna en el formato (Enterobacterias, Vibrio, etc.)
const conocidos = new Set(COLUMNAS.map((c) => c.analisis));
function otros(m: MuestraItem): string {
  return resultadosDe(m)
    .filter((r) => !conocidos.has(r.analisis.nombre_analisis))
    .map((r) => `${r.analisis.nombre_analisis}: ${r.resultado_final ?? (r.metodo_utilizado === REMITIDO ? "R" : "—")}`)
    .join("; ");
}

function Campo({
  etiqueta,
  valor,
  onChange,
  tipo = "text",
  lista,
  filas,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  tipo?: string;
  lista?: string;
  filas?: number;
}) {
  const id = useId();
  return (
    <Field id={id} label={etiqueta}>
      {filas ? (
        <textarea id={id} rows={filas} value={valor} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      ) : (
        <input id={id} type={tipo} list={lista} value={valor} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </Field>
  );
}

export function ConteosView({ id }: { id: number }) {
  const [set, setSet] = useState<SetDetalle | null>(null);
  const [c, setC] = useState<Condiciones | null>(null);
  const [firmantes, setFirmantes] = useState<Firmante[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const aplicar = useCallback((s: SetDetalle) => {
    setSet(s);
    setC(completarCondiciones(s.condiciones_analisis));
  }, []);

  useEffect(() => {
    Promise.all([getSet(id), listFirmantes().catch(() => [] as Firmante[])])
      .then(([s, f]) => {
        aplicar(s);
        setFirmantes(f);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, aplicar]);

  function poner(campo: keyof Condiciones, valor: string) {
    setAviso(null);
    setC((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  }

  async function guardar() {
    if (!c) return;
    setSaving(true);
    setError(null);
    setAviso(null);
    try {
      aplicar(await saveCondiciones(id, c));
      setAviso("Datos guardados");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-body-md text-secondary">Cargando...</p>;
  if (!set || !c) return <ErrorBox message={error ?? "No se encontró el set"} />;

  const lotes = [
    ...new Set(set.muestras.flatMap((m) => resultadosDe(m).map((r) => r.lote_medios_cultivo)).filter(Boolean) as string[]),
  ].join(", ");
  const fechaIngreso = set.fecha_hora_recepcion ? fechaLocal(set.fecha_hora_recepcion) : "";

  return (
    <div className="flex flex-col gap-space-md">
      {/* ---- Formulario (no se imprime) ---- */}
      <div className="no-print flex flex-col gap-space-md max-w-[1100px] w-full mx-auto">
        <Link
          href={`/panel/sets/${id}`}
          className="font-label-lg text-label-lg text-tertiary hover:underline flex items-center gap-1 w-fit"
        >
          <Icon name="arrow_back" className="text-lg" /> Servicio {set.codigo_set}
        </Link>

        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
            Hoja de conteos · Servicio {set.codigo_set}
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Completa los datos generales del análisis. Los resultados de la tabla salen de lo que se digitó en cada muestra
            y el lote de medios de cultivo, de la pantalla de Resultados.
          </p>
        </div>

        {error && <ErrorBox message={error} />}
        {aviso && (
          <div className="bg-tertiary-fixed text-on-tertiary-fixed font-body-sm text-body-sm rounded-lg px-3 py-2 flex items-center gap-space-xs">
            <Icon name="check_circle" className="text-lg" />
            <span>{aviso}</span>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
          <h2 className="font-title-md text-title-md text-on-surface font-bold">Datos generales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
            <Campo etiqueta="Fecha fin de análisis" tipo="date" valor={c.fecha_fin_analisis} onChange={(v) => poner("fecha_fin_analisis", v)} />
            <Campo etiqueta="Temperatura" valor={c.temperatura} onChange={(v) => poner("temperatura", v)} />
            <Campo etiqueta="% Humedad relativa" valor={c.humedad_relativa} onChange={(v) => poner("humedad_relativa", v)} />
            <Campo etiqueta="Micropipeta" valor={c.micropipeta} onChange={(v) => poner("micropipeta", v)} />
            <Campo etiqueta="Incubadora" valor={c.incubadora} onChange={(v) => poner("incubadora", v)} />
            <div />
            <Campo etiqueta="Analista alimentos" lista="personal" valor={c.analista_alimentos} onChange={(v) => poner("analista_alimentos", v)} />
            <Campo etiqueta="Analista aguas" lista="personal" valor={c.analista_aguas} onChange={(v) => poner("analista_aguas", v)} />
            <Campo etiqueta="Responsable de lectura" lista="personal" valor={c.responsable_lectura} onChange={(v) => poner("responsable_lectura", v)} />
          </div>
          <Campo etiqueta="Observaciones" valor={c.observaciones} onChange={(v) => poner("observaciones", v)} filas={2} />

          <h2 className="font-title-md text-title-md text-on-surface font-bold">Firmas de revisión y aprobación</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <Campo etiqueta="Revisa" lista="personal" valor={c.revisa} onChange={(v) => poner("revisa", v)} />
            <Campo etiqueta="Fecha de revisión" tipo="date" valor={c.fecha_revision} onChange={(v) => poner("fecha_revision", v)} />
            <Campo etiqueta="Aprueba" lista="personal" valor={c.aprueba} onChange={(v) => poner("aprueba", v)} />
            <Campo etiqueta="Fecha de aprobación" tipo="date" valor={c.fecha_aprobacion} onChange={(v) => poner("fecha_aprobacion", v)} />
          </div>

          <datalist id="personal">
            {firmantes.map((f) => (
              <option key={f.id_usuario} value={f.nombre_completo} />
            ))}
          </datalist>

          <div className="flex flex-wrap gap-space-sm">
            <button
              onClick={guardar}
              disabled={saving}
              className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-space-xs"
            >
              <Icon name="save" className="text-lg" />
              {saving ? "Guardando..." : "Guardar datos"}
            </button>
            <button
              onClick={() => window.print()}
              className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs"
            >
              <Icon name="print" className="text-lg" /> Imprimir / Guardar PDF
            </button>
          </div>
        </div>
      </div>

      {/* ---- Hoja de conteos (formato F-11) ---- */}
      <div className="hoja-conteos bg-white text-black w-full max-w-[1100px] mx-auto p-5 shadow-sm print:shadow-none print:p-0 print:max-w-none text-[9px] leading-snug">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={`${td} w-20 text-center`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-unilibre.png" alt="Universidad Libre" className="h-12 mx-auto" />
              </td>
              <td className={`${td} text-center font-bold text-[12px] leading-tight`}>
                LABORATORIO DE PRESTACIÓN DE SERVICIOS
                <br />
                FORMATO DE CONTEOS - ANÁLISIS MICROBIOLÓGICOS
              </td>
              <td className={`${td} w-32 text-center`}>
                <div className="font-bold">Código: F-11</div>
                <div>Versión: 2</div>
                <div>Fecha: 2026-07-03</div>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th colSpan={6} className={th}>
                DATOS GENERALES
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                ["Fecha de ingreso de muestra:", fechaIngreso],
                ["Fecha fin de análisis:", c.fecha_fin_analisis ? formatFecha(c.fecha_fin_analisis) : ""],
                ["Temperatura:", c.temperatura],
              ],
              [
                ["% Humedad relativa:", c.humedad_relativa],
                ["Micropipeta:", c.micropipeta],
                ["Incubadora:", c.incubadora],
              ],
              [
                ["Analista alimentos:", c.analista_alimentos],
                ["Responsable de lectura:", c.responsable_lectura],
                ["Analista aguas:", c.analista_aguas],
              ],
            ].map((fila, i) => (
              <tr key={i}>
                {fila.map(([etiqueta, valor]) => (
                  <>
                    <th key={`e-${etiqueta}`} className={`${th} text-left w-[16%]`}>
                      {etiqueta}
                    </th>
                    <td key={`v-${etiqueta}`} className={`${td} w-[17%]`}>
                      {valor}
                    </td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th colSpan={7 + COLUMNAS.length} className={th}>
                REGISTRO DE RESULTADOS MICROBIOLÓGICOS (Resultados en UFC/g o UFC/mL, o Presencia/Ausencia según el parámetro)
              </th>
            </tr>
            <tr>
              {["Código de muestra", "Nombre de muestra", "Normativa de análisis", "Fecha de análisis", "Hora de análisis"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
              {COLUMNAS.map((col) => (
                <th key={col.titulo} className={th}>
                  {col.titulo}
                </th>
              ))}
              <th className={th}>Otros análisis</th>
              <th className={th}>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {set.muestras.length === 0 && (
              <tr>
                <td colSpan={7 + COLUMNAS.length} className={`${td} text-center`}>
                  Este servicio todavía no tiene muestras.
                </td>
              </tr>
            )}
            {set.muestras.map((m) => {
              const f = ultimaFecha(m);
              return (
                <tr key={m.id_muestra}>
                  <td className={`${td} text-center`}>{m.codigo_muestra}</td>
                  <td className={td}>{m.nombre_muestra}</td>
                  <td className={td}>{m.norma.nombre_norma}</td>
                  <td className={td}>{f ? fechaLocal(f) : ""}</td>
                  <td className={td}>{f ? horaLocal(f) : ""}</td>
                  {COLUMNAS.map((col) => {
                    const v = celda(m, col.analisis);
                    return (
                      <td key={col.titulo} className={`${td} text-center`}>
                        <Exponente texto={v} />
                      </td>
                    );
                  })}
                  <td className={td}>{otros(m)}</td>
                  <td className={td}></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th colSpan={2} className={th}>
                INFORMACIÓN COMPLEMENTARIA
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className={`${th} text-left w-[22%]`}>Lote interno de medios de cultivo:</th>
              <td className={td}>{lotes}</td>
            </tr>
          </tbody>
        </table>

        <div className="border border-black border-t-0 px-1 py-1 min-h-14">
          <div className="font-bold">OBSERVACIONES</div>
          <div className="whitespace-pre-line">{c.observaciones}</div>
        </div>

        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th colSpan={4} className={th}>
                FIRMAS DE REVISIÓN Y APROBACIÓN
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${td} h-14 align-bottom`}>
                <div className="font-bold">Revisa:</div>
                <div>{c.revisa}</div>
              </td>
              <td className={`${td} align-bottom`}>
                <div className="font-bold">Fecha revisión:</div>
                <div>{c.fecha_revision ? formatFecha(c.fecha_revision) : ""}</div>
              </td>
              <td className={`${td} align-bottom`}>
                <div className="font-bold">Aprueba:</div>
                <div>{c.aprueba}</div>
              </td>
              <td className={`${td} align-bottom`}>
                <div className="font-bold">Fecha aprobación:</div>
                <div>{c.fecha_aprobacion ? formatFecha(c.fecha_aprobacion) : ""}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}