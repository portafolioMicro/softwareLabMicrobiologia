"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./icon";
import { ErrorBox, errorMessage } from "./ui-bits";
import { EstadoBadge } from "./estado-badge";
import { getResultados, saveResultados, type ResultadosMuestra, type Usuario } from "@/lib/api";
import { formatFechaHora, fromLocalInput, toLocalInput } from "@/lib/format";
import { REMITIDO, TECNICAS, UNIDADES, sugerirConcepto, unidadSugerida } from "@/lib/concepto";

interface Fila {
  id_resultado: number;
  parametro: string;
  metodo: string | null;
  referencia: string | null;
  remitido: boolean;
  resultado: string;
  unidad: string;
  tecnica: string;
  uexp: string;
  acreditado: boolean;
  fecha: string;
  concepto: string;
  conceptoManual: boolean; // si el analista lo escribió, no se sobrescribe solo
}

const celda =
  "font-body-sm text-body-sm border border-outline-variant rounded-lg px-2 py-1.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary w-full disabled:opacity-60";

function armarFilas(d: ResultadosMuestra): Fila[] {
  return d.resultados.map((r) => ({
    id_resultado: r.id_resultado,
    parametro: r.analisis.nombre_analisis,
    metodo: r.metodo_utilizado,
    referencia: r.valor_referencia,
    remitido: r.metodo_utilizado === REMITIDO,
    resultado: r.resultado_final ?? "",
    unidad: r.unidad_medida ?? unidadSugerida(r.valor_referencia),
    tecnica: r.tecnica ?? "",
    uexp: r.incertidumbre ?? "",
    acreditado: r.acreditado,
    fecha: toLocalInput(r.fecha_analisis),
    concepto: r.concepto ?? "",
    conceptoManual: !!r.concepto,
  }));
}

export function ResultadosForm({ id, rol }: { id: number; rol: Usuario["rol"] }) {
  const puedeEditar = rol === "Administrador" || rol === "Analista";
  const [datos, setDatos] = useState<ResultadosMuestra | null>(null);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [lote, setLote] = useState("");
  const [fechaTodas, setFechaTodas] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const aplicar = useCallback((d: ResultadosMuestra) => {
    setDatos(d);
    setFilas(armarFilas(d));
    setLote(d.resultados.find((r) => r.lote_medios_cultivo)?.lote_medios_cultivo ?? "");
  }, []);

  useEffect(() => {
    getResultados(id)
      .then(aplicar)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, aplicar]);

  function cambiar(idResultado: number, parche: Partial<Fila>) {
    setAviso(null);
    setFilas((prev) => prev.map((f) => (f.id_resultado === idResultado ? { ...f, ...parche } : f)));
  }

  function cambiarResultado(f: Fila, valor: string) {
    cambiar(f.id_resultado, {
      resultado: valor,
      ...(f.conceptoManual
        ? {}
        : { concepto: sugerirConcepto(valor, f.referencia, f.parametro, f.remitido) }),
    });
  }

  function aplicarFechaATodas() {
    if (!fechaTodas) return;
    setFilas((prev) => prev.map((f) => ({ ...f, fecha: fechaTodas })));
  }

  async function guardar() {
    setSaving(true);
    setError(null);
    setAviso(null);
    try {
      const actualizado = await saveResultados(id, {
        lote_medios_cultivo: lote.trim() || null,
        resultados: filas.map((f) => ({
          id_resultado: f.id_resultado,
          resultado_final: f.resultado.trim() || null,
          unidad_medida: f.unidad.trim() || null,
          tecnica: f.tecnica || null,
          incertidumbre: f.uexp.trim() || null,
          acreditado: f.acreditado,
          fecha_analisis: fromLocalInput(f.fecha),
          concepto: f.concepto.trim() || null,
        })),
      });
      aplicar(actualizado);
      setAviso("Resultados guardados");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-body-md text-secondary">Cargando...</p>;
  if (!datos) return <ErrorBox message={error ?? "No se encontró la muestra"} />;

  const conResultado = filas.filter((f) => f.resultado.trim()).length;

  return (
    <div className="flex flex-col gap-space-md">
      <Link
        href={`/panel/sets/${datos.set.id_set_muestra}`}
        className="font-label-lg text-label-lg text-tertiary hover:underline flex items-center gap-1 w-fit"
      >
        <Icon name="arrow_back" className="text-lg" /> Servicio {datos.set.codigo_set}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
            Muestra {datos.codigo_muestra}
          </h1>
          <EstadoBadge estado={datos.set.estado_set} />
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <Link
            href={`/panel/muestras/${id}/informe`}
            className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs"
          >
            <Icon name="description" className="text-lg" /> Ver informe
          </Link>
          {puedeEditar && (
            <button
              onClick={guardar}
              disabled={saving}
              className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-space-xs"
            >
              <Icon name="save" className="text-lg" />
              {saving ? "Guardando..." : "Guardar resultados"}
            </button>
          )}
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {aviso && (
        <div className="bg-tertiary-fixed text-on-tertiary-fixed font-body-sm text-body-sm rounded-lg px-3 py-2 flex items-center gap-space-xs">
          <Icon name="check_circle" className="text-lg" />
          <span>{aviso}</span>
        </div>
      )}
      {!puedeEditar && (
        <p className="font-body-sm text-body-sm text-secondary">
          Tu rol solo permite consultar los resultados.
        </p>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {[
          ["Muestra", datos.nombre_muestra],
          ["Cliente", `${datos.set.cliente.nombre_empresa} (${datos.set.cliente.nit})`],
          ["Norma", datos.norma.nombre_norma],
          ["Lote", datos.lote ?? "—"],
          ["Toma", formatFechaHora(datos.set.fecha_hora_toma)],
          ["Recepción", formatFechaHora(datos.set.fecha_hora_recepcion)],
        ].map(([etiqueta, valor]) => (
          <div key={etiqueta} className="flex flex-col">
            <span className="font-label-sm text-label-sm text-secondary uppercase">{etiqueta}</span>
            <span className="font-body-md text-body-md text-on-surface">{valor}</span>
          </div>
        ))}
      </div>

      {puedeEditar && (
        <div className="flex flex-wrap items-end gap-space-md">
          <div className="flex flex-col gap-1">
            <label htmlFor="lote_medios" className="font-label-md text-label-md text-on-surface font-semibold">
              Lote interno de medios de cultivo
            </label>
            <input id="lote_medios" value={lote} onChange={(e) => setLote(e.target.value)} className={`${celda} w-64`} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="fecha_todas" className="font-label-md text-label-md text-on-surface font-semibold">
              Fecha y hora de análisis
            </label>
            <div className="flex gap-space-xs">
              <input id="fecha_todas" type="datetime-local" value={fechaTodas} onChange={(e) => setFechaTodas(e.target.value)} className={`${celda} w-52`} />
              <button
                type="button"
                onClick={aplicarFechaATodas}
                className="font-label-md text-label-md bg-surface-container hover:bg-surface-variant text-on-surface px-3 rounded-lg transition-colors whitespace-nowrap"
              >
                Aplicar a todos
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Análisis</h2>
        <span className="font-body-sm text-body-sm text-secondary">
          {conResultado} de {filas.length} con resultado
        </span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container font-label-md text-label-md text-on-surface-variant uppercase">
              {["Parámetro", "Método", "Valor de referencia", "Resultado", "Unidad", "Técnica", "Uexp", "Acred.", "Fecha y hora", "Concepto"].map((h) => (
                <th key={h} className="px-space-sm py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm text-on-surface align-top">
            {filas.length === 0 && (
              <tr>
                <td colSpan={10} className="px-space-md py-6 text-center text-secondary">
                  Esta muestra no tiene análisis asignados.
                </td>
              </tr>
            )}
            {filas.map((f) => (
              <tr key={f.id_resultado} className="border-t border-surface-variant">
                <td className="px-space-sm py-2 font-semibold min-w-[150px]">{f.parametro}</td>
                <td className="px-space-sm py-2 min-w-[150px]">
                  {f.remitido ? (
                    <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-semibold">
                      Se remite
                    </span>
                  ) : (
                    (f.metodo ?? "—")
                  )}
                </td>
                <td className="px-space-sm py-2 min-w-[170px] text-secondary">{f.referencia ?? "N.R."}</td>
                <td className="px-space-sm py-2 min-w-[130px]">
                  <input
                    disabled={!puedeEditar}
                    value={f.resultado}
                    maxLength={100}
                    onChange={(e) => cambiarResultado(f, e.target.value)}
                    placeholder="17, <1, 5x10^3"
                    className={celda}
                  />
                </td>
                <td className="px-space-sm py-2 min-w-[170px]">
                  <input
                    disabled={!puedeEditar}
                    list="unidades"
                    value={f.unidad}
                    maxLength={30}
                    onChange={(e) => cambiar(f.id_resultado, { unidad: e.target.value })}
                    className={celda}
                  />
                </td>
                <td className="px-space-sm py-2 min-w-[170px]">
                  <select
                    disabled={!puedeEditar}
                    value={f.tecnica}
                    onChange={(e) => cambiar(f.id_resultado, { tecnica: e.target.value })}
                    className={celda}
                  >
                    <option value="">—</option>
                    {TECNICAS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-space-sm py-2 min-w-[80px]">
                  <input
                    disabled={!puedeEditar}
                    value={f.uexp}
                    maxLength={50}
                    onChange={(e) => cambiar(f.id_resultado, { uexp: e.target.value })}
                    placeholder="N.R"
                    className={celda}
                  />
                </td>
                <td className="px-space-sm py-2 text-center">
                  <input
                    type="checkbox"
                    disabled={!puedeEditar}
                    checked={f.acreditado}
                    onChange={(e) => cambiar(f.id_resultado, { acreditado: e.target.checked })}
                  />
                </td>
                <td className="px-space-sm py-2 min-w-[190px]">
                  <input
                    disabled={!puedeEditar}
                    type="datetime-local"
                    value={f.fecha}
                    onChange={(e) => cambiar(f.id_resultado, { fecha: e.target.value })}
                    className={celda}
                  />
                </td>
                <td className="px-space-sm py-2 min-w-[280px]">
                  <div className="flex gap-1">
                    <input
                      disabled={!puedeEditar}
                      list="conceptos"
                      value={f.concepto}
                      maxLength={200}
                      onChange={(e) => cambiar(f.id_resultado, { concepto: e.target.value, conceptoManual: true })}
                      className={celda}
                    />
                    {puedeEditar && (
                      <button
                        type="button"
                        title="Sugerir concepto según el resultado"
                        onClick={() =>
                          cambiar(f.id_resultado, {
                            concepto: sugerirConcepto(f.resultado, f.referencia, f.parametro, f.remitido),
                            conceptoManual: false,
                          })
                        }
                        className="px-2 rounded-lg hover:bg-surface-container text-tertiary"
                      >
                        <Icon name="auto_fix_high" className="text-lg" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <datalist id="unidades">
        {UNIDADES.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      <datalist id="conceptos">
        <option value="Conforme" />
        <option value="No conforme" />
      </datalist>
    </div>
  );
}