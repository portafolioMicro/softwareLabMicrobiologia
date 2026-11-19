"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Icon } from "./icon";
import { ErrorBox, errorMessage, inputClass } from "./ui-bits";
import {
  getInforme,
  listFirmantes,
  saveInforme,
  type Firmante,
  type InformeMuestra,
  type Usuario,
} from "@/lib/api";
import { formatFecha, formatFechaHora, toDateInput } from "@/lib/format";
import {
  ABREVIATURAS,
  OBSERVACIONES_GENERALES,
  OBSERVACIONES_TECNICAS_FIJAS,
  PIE,
  TIPOS_MUESTRA,
  hoy,
  sugerirObservaciones,
} from "@/lib/informe";

const th = "border border-black px-1.5 py-1 font-bold bg-neutral-100 text-left align-middle";
const td = "border border-black px-1.5 py-1 align-middle";

// "5x10^3" se muestra como 5x10³
function Exponente({ texto }: { texto: string }) {
  const partes = texto.split(/\^(\d+)/);
  return (
    <>
      {partes.map((p, i) => (i % 2 === 1 ? <sup key={i}>{p}</sup> : p))}
    </>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <tr>
      <th className={`${th} w-[42%]`}>{etiqueta}</th>
      <td className={td}>{children || "N.A."}</td>
    </tr>
  );
}

function Firma({ titulo, firmante }: { titulo: string; firmante?: { nombre_completo: string; cargo: string | null } }) {
  return (
    <td className={`${td} text-center align-bottom h-28 w-1/2`}>
      <div className="font-bold">{titulo}</div>
      <div className="mt-10">_______________________________</div>
      <div className="font-bold uppercase">{firmante?.nombre_completo ?? "Nombre"}</div>
      <div>{firmante?.cargo ?? ""}</div>
      <div>Laboratorio de Prestación de Servicios</div>
    </td>
  );
}

export function InformeView({ id, rol }: { id: number; rol: Usuario["rol"] }) {
  const puedeEditar = rol === "Administrador" || rol === "Analista";
  const [d, setD] = useState<InformeMuestra | null>(null);
  const [firmantes, setFirmantes] = useState<Firmante[]>([]);
  const [numero, setNumero] = useState("");
  const [obs, setObs] = useState("");
  const [elabora, setElabora] = useState("");
  const [autoriza, setAutoriza] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback((inf: InformeMuestra) => {
    setD(inf);
    setObs(inf.observaciones_tecnicas ?? sugerirObservaciones(inf.resultados));
    setElabora(inf.usuarioElabora ? String(inf.usuarioElabora.id_usuario) : "");
    setAutoriza(inf.usuarioAutoriza ? String(inf.usuarioAutoriza.id_usuario) : "");
    setFecha(inf.fecha_emision ? toDateInput(inf.fecha_emision) : hoy());
  }, []);

  useEffect(() => {
    Promise.all([getInforme(id), listFirmantes().catch(() => [] as Firmante[])])
      .then(([inf, f]) => {
        cargar(inf);
        setFirmantes(f);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, cargar]);

  async function guardar() {
    setSaving(true);
    setError(null);
    setAviso(null);
    try {
      const inf = await saveInforme(id, {
        numero_informe: !d?.numero_informe && numero.trim() ? numero.trim() : null,
        observaciones_tecnicas: obs.trim() || null,
        id_usuario_elabora: elabora ? Number(elabora) : undefined,
        id_usuario_autoriza: autoriza ? Number(autoriza) : null,
        fecha_emision: fecha || null,
      });
      cargar(inf);
      setAviso(`Informe No. ${inf.numero_informe} guardado`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-body-md text-secondary">Cargando...</p>;
  if (!d) return <ErrorBox message={error ?? "No se encontró la muestra"} />;

  const cliente = d.set.cliente;
  const fElabora = firmantes.find((f) => String(f.id_usuario) === elabora) ?? d.usuarioElabora ?? undefined;
  const fAutoriza = firmantes.find((f) => String(f.id_usuario) === autoriza) ?? d.usuarioAutoriza ?? undefined;
  const fechas = d.resultados.map((r) => r.fecha_analisis).filter(Boolean) as string[];
  const fechaAnalisis = fechas.length ? fechas.sort()[fechas.length - 1] : null;
  const faltan = d.resultados.filter((r) => !r.resultado_final).length;
  const lineasObs = obs.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-space-md">
      {/* ---- Panel de edición (no se imprime) ---- */}
      <div className="no-print flex flex-col gap-space-md max-w-[900px] w-full mx-auto">
        <Link
          href={`/panel/muestras/${id}`}
          className="font-label-lg text-label-lg text-tertiary hover:underline flex items-center gap-1 w-fit"
        >
          <Icon name="arrow_back" className="text-lg" /> Resultados de la muestra {d.codigo_muestra}
        </Link>

        {error && <ErrorBox message={error} />}
        {aviso && (
          <div className="bg-tertiary-fixed text-on-tertiary-fixed font-body-sm text-body-sm rounded-lg px-3 py-2 flex items-center gap-space-xs">
            <Icon name="check_circle" className="text-lg" />
            <span>{aviso}</span>
          </div>
        )}
        {faltan > 0 && (
          <div className="bg-error-container text-on-error-container font-body-sm text-body-sm rounded-lg px-3 py-2 flex items-center gap-space-xs">
            <Icon name="warning" className="text-lg" />
            <span>Faltan {faltan} análisis sin resultado. Complétalos antes de emitir el informe.</span>
          </div>
        )}

        {puedeEditar && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {d.numero_informe ? `Informe No. ${d.numero_informe}` : "Informe sin emitir"}
            </h2>

            {!d.numero_informe && (
              <div className="flex flex-col gap-1 max-w-xs">
                <label htmlFor="num_informe" className="font-label-md text-label-md text-on-surface font-semibold">
                  Número de informe (opcional)
                </label>
                <input
                  id="num_informe"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Vacío = siguiente consecutivo"
                  className={inputClass}
                />
                <span className="font-body-sm text-body-sm text-secondary">
                  Úsalo solo para continuar la numeración que ya llevan en papel.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="obs" className="font-label-md text-label-md text-on-surface font-semibold">
                  Observaciones técnicas (una por línea)
                </label>
                <button
                  type="button"
                  onClick={() => setObs(sugerirObservaciones(d.resultados))}
                  className="font-label-md text-label-md text-tertiary hover:underline flex items-center gap-1"
                >
                  <Icon name="auto_fix_high" className="text-base" /> Sugerir según los conceptos
                </button>
              </div>
              <textarea id="obs" rows={3} value={obs} onChange={(e) => setObs(e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <div className="flex flex-col gap-1">
                <label htmlFor="elabora" className="font-label-md text-label-md text-on-surface font-semibold">
                  Elabora análisis
                </label>
                <select id="elabora" value={elabora} onChange={(e) => setElabora(e.target.value)} className={inputClass}>
                  <option value="">Yo (quien guarda)</option>
                  {firmantes.map((f) => (
                    <option key={f.id_usuario} value={f.id_usuario}>
                      {f.nombre_completo}
                      {f.cargo ? ` — ${f.cargo}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="autoriza" className="font-label-md text-label-md text-on-surface font-semibold">
                  Autoriza informe
                </label>
                <select id="autoriza" value={autoriza} onChange={(e) => setAutoriza(e.target.value)} className={inputClass}>
                  <option value="">Sin definir</option>
                  {firmantes.map((f) => (
                    <option key={f.id_usuario} value={f.id_usuario}>
                      {f.nombre_completo}
                      {f.cargo ? ` — ${f.cargo}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="fecha_emision" className="font-label-md text-label-md text-on-surface font-semibold">
                  Fecha de emisión
                </label>
                <input id="fecha_emision" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex flex-wrap gap-space-sm">
              <button
                onClick={guardar}
                disabled={saving}
                className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-space-xs"
              >
                <Icon name="save" className="text-lg" />
                {saving ? "Guardando..." : d.numero_informe ? "Guardar cambios" : "Guardar y emitir"}
              </button>
              <button
                onClick={() => window.print()}
                className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs"
              >
                <Icon name="print" className="text-lg" /> Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        )}

        {!puedeEditar && (
          <button
            onClick={() => window.print()}
            className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs w-fit"
          >
            <Icon name="print" className="text-lg" /> Imprimir / Guardar PDF
          </button>
        )}
      </div>

      {/* ---- Hoja del informe (formato F-12) ---- */}
      <div className="bg-white text-black max-w-[900px] w-full mx-auto p-6 shadow-sm print:shadow-none print:p-0 print:max-w-none text-[11px] leading-snug">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={`${td} w-24 text-center`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-unilibre.png" alt="Universidad Libre" className="h-16 mx-auto" />
              </td>
              <td className={`${td} text-center font-bold text-[13px] leading-tight`}>
                INFORME DE RESULTADOS
                <br />
                LABORATORIO PRESTACIÓN DE SERVICIOS
                <br />
                UNIVERSIDAD LIBRE - SEDE PEREIRA
                <br />
                <span className="text-[15px]">INFORME No. {d.numero_informe ?? "(sin emitir)"}</span>
              </td>
              <td className={`${td} w-32 text-center`}>
                <div className="font-bold">F-12</div>
                <div>Versión 3</div>
                <div>2026-02-15</div>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th colSpan={2} className={`${th} text-center`}>
                INFORMACIÓN DEL CLIENTE
              </th>
            </tr>
          </thead>
          <tbody>
            <Dato etiqueta="No. de servicio">{d.set.codigo_set}</Dato>
            <Dato etiqueta="Razón social">{cliente.nombre_empresa}</Dato>
            <Dato etiqueta="NIT o CC">{cliente.nit}</Dato>
            <Dato etiqueta="Dirección">{cliente.direccion}</Dato>
            <Dato etiqueta="Ciudad">{cliente.ciudad}</Dato>
            <Dato etiqueta="Nombre del solicitante">{d.set.solicitante ?? cliente.nombre_responsable}</Dato>
            <Dato etiqueta="Teléfono/Fax">{cliente.telefono}</Dato>
            <Dato etiqueta="Correo electrónico">{cliente.correo}</Dato>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-1 mt-1">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th colSpan={2} className={`${th} text-center`}>
                  INFORMACIÓN DE LA MUESTRA
                </th>
              </tr>
            </thead>
            <tbody>
              <Dato etiqueta="Tipo de muestra">{TIPOS_MUESTRA[d.tipo_matriz ?? ""] ?? d.tipo_matriz}</Dato>
              <Dato etiqueta="Descripción de la muestra">{d.nombre_muestra}</Dato>
              <Dato etiqueta="Código de la muestra">{d.codigo_muestra}</Dato>
              <Dato etiqueta="Cantidad de muestra (g o mL)">{d.cantidad}</Dato>
              <Dato etiqueta="Fecha de producción">{d.fecha_produccion ? formatFecha(d.fecha_produccion) : ""}</Dato>
              <Dato etiqueta="Lote">{d.lote}</Dato>
              <Dato etiqueta="Fecha de vencimiento">{d.fecha_vencimiento ? formatFecha(d.fecha_vencimiento) : ""}</Dato>
            </tbody>
          </table>
          <table className="w-full border-collapse self-start">
            <thead>
              <tr>
                <th colSpan={2} className={`${th} text-center`}>
                  DATOS DE TOMA Y RECEPCIÓN
                </th>
              </tr>
            </thead>
            <tbody>
              <Dato etiqueta="Fecha y hora de toma">{d.set.fecha_hora_toma ? formatFechaHora(d.set.fecha_hora_toma) : ""}</Dato>
              <Dato etiqueta="Muestra tomada por">{d.set.responsable_toma}</Dato>
              <Dato etiqueta="Temperatura de toma">{d.temp_toma}</Dato>
              <Dato etiqueta="Fecha y hora de recepción">
                {d.set.fecha_hora_recepcion ? formatFechaHora(d.set.fecha_hora_recepcion) : ""}
              </Dato>
              <Dato etiqueta="Temperatura de recepción">{d.temp_recepcion}</Dato>
              <Dato etiqueta="Causa del análisis">{d.set.causa_analisis}</Dato>
              <Dato etiqueta="Fecha de análisis">{fechaAnalisis ? formatFecha(fechaAnalisis) : ""}</Dato>
            </tbody>
          </table>
        </div>

        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th colSpan={9} className={`${th} text-center`}>
                ANÁLISIS MICROBIOLÓGICO
              </th>
            </tr>
            <tr>
              {["PARÁMETROS", "RESULTADO", "UNIDADES", "MÉTODO", "TÉCNICA", "Uexp", "ACREDITADO", "VALOR DE REFERENCIA", "CONCEPTO"].map((h) => (
                <th key={h} className={`${th} text-center`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.resultados.length === 0 && (
              <tr>
                <td colSpan={9} className={`${td} text-center`}>
                  Esta muestra no tiene análisis asignados.
                </td>
              </tr>
            )}
            {d.resultados.map((r) => (
              <tr key={r.id_resultado}>
                <td className={td}>{r.analisis.nombre_analisis}</td>
                <td className={`${td} text-center`}>{r.resultado_final ? <Exponente texto={r.resultado_final} /> : "—"}</td>
                <td className={td}>{r.unidad_medida ?? "N.A."}</td>
                <td className={td}>{r.metodo_utilizado ?? "N.R."}</td>
                <td className={td}>{r.tecnica ?? "N.A."}</td>
                <td className={`${td} text-center`}>{r.incertidumbre ?? "N.R"}</td>
                <td className={`${td} text-center`}>{r.acreditado ? "S" : "N"}</td>
                <td className={td}>{r.valor_referencia ?? "N.R."}</td>
                <td className={td}>{r.concepto ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border border-black border-t-0 px-1.5 py-1">
          <div className="font-bold">OBSERVACIONES TÉCNICAS</div>
          {lineasObs.map((l, i) => (
            <p key={`o${i}`}>- {l}</p>
          ))}
          {OBSERVACIONES_TECNICAS_FIJAS.map((l, i) => (
            <p key={`f${i}`}>- {l}</p>
          ))}
          <div className="font-bold mt-2">OBSERVACIONES GENERALES</div>
          {OBSERVACIONES_GENERALES.map((l, i) => (
            <p key={`g${i}`}>- {l}</p>
          ))}
          <div className="font-bold mt-2">ABREVIATURAS</div>
          <p>- {ABREVIATURAS}</p>
        </div>

        <table className="w-full border-collapse mt-1">
          <tbody>
            <tr>
              <Firma titulo="Elabora análisis" firmante={fElabora} />
              <Firma titulo="Autoriza informe" firmante={fAutoriza} />
            </tr>
          </tbody>
        </table>

        <div className="border border-black border-t-0 px-1.5 py-1 font-bold">FECHA DE EMISIÓN DEL INFORME: {fecha}</div>
        <div className="border border-black border-t-0 px-1.5 py-1 text-center">
          {PIE.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
        <div className="text-center mt-2 font-bold">……..FIN DEL INFORME …….</div>
      </div>
    </div>
  );
}