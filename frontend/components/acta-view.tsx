"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { Icon } from "./icon";
import { ErrorBox, Field, errorMessage, inputClass } from "./ui-bits";
import { getSet, saveActa, type SetDetalle } from "@/lib/api";
import { formatFecha, formatFechaHora, toLocalInput } from "@/lib/format";
import { NOTA_CLIENTE, NOTA_CUMPLE, NOTA_TIPOS, completarActa, type Acta, type CNC } from "@/lib/acta";

const th = "border border-black px-1.5 py-1 font-bold bg-neutral-100 text-left align-middle";
const td = "border border-black px-1.5 py-1 align-top";
const lado = "border border-black px-1 py-1 font-bold bg-neutral-100 text-center align-middle w-24";

const marca = (v: boolean) => (v ? "☒" : "☐");
const fechaOVacio = (f: string) => (f ? formatFecha(f) : "");

/* ---------- Piezas del formulario ---------- */

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-sm">
      <h3 className="font-title-md text-title-md text-on-surface font-bold">{titulo}</h3>
      {children}
    </div>
  );
}

function Campo({
  etiqueta,
  valor,
  onChange,
  tipo = "text",
  filas,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  tipo?: string;
  filas?: number;
}) {
  const id = useId();
  return (
    <Field id={id} label={etiqueta}>
      {filas ? (
        <textarea id={id} rows={filas} value={valor} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      ) : (
        <input id={id} type={tipo} value={valor} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </Field>
  );
}

function Opciones({
  etiqueta,
  valor,
  onChange,
  opciones,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <Field id={id} label={etiqueta}>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Sin evaluar</option>
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

const CNC_OPCIONES = [
  { value: "C", label: "Cumple (C)" },
  { value: "NC", label: "No cumple (NC)" },
];

/* ---------- Piezas de la hoja ---------- */

function Bloque({ titulo, cabeceras, valores }: { titulo: string; cabeceras: string[]; valores: ReactNode[] }) {
  return (
    <table className="w-full border-collapse mt-1">
      <tbody>
        <tr>
          <th rowSpan={2} className={lado}>
            {titulo}
          </th>
          {cabeceras.map((h) => (
            <th key={h} className={`${th} text-center`}>
              {h}
            </th>
          ))}
        </tr>
        <tr>
          {valores.map((v, i) => (
            <td key={i} className={`${td} ${cabeceras[i] === "C" || cabeceras[i] === "NC" ? "text-center" : ""}`}>
              {v}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

/* ---------- Pantalla ---------- */

export function ActaView({ id }: { id: number }) {
  const [set, setSet] = useState<SetDetalle | null>(null);
  const [acta, setActa] = useState<Acta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const aplicar = useCallback((s: SetDetalle) => {
    setSet(s);
    setActa(
      completarActa(s.acta, {
        responsableRecepcion: s.usuarioRecepcion.nombre_completo,
        fechaIngreso: s.fecha_hora_recepcion ? toLocalInput(s.fecha_hora_recepcion).slice(0, 10) : "",
      }),
    );
  }, []);

  useEffect(() => {
    getSet(id)
      .then(aplicar)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, aplicar]);

  // Cambia un campo de primer nivel del acta
  function poner<K extends keyof Acta>(clave: K, valor: Acta[K]) {
    setAviso(null);
    setActa((a) => (a ? { ...a, [clave]: valor } : a));
  }

  // Cambia un campo dentro de una sección (toma, recepcion, transporte, entrega, disposicion)
  function ponerEn(seccion: "toma" | "recepcion" | "transporte" | "entrega" | "disposicion", campo: string, valor: string) {
    setAviso(null);
    setActa((a) => (a ? ({ ...a, [seccion]: { ...a[seccion], [campo]: valor } } as Acta) : a));
  }

  async function guardar() {
    if (!acta) return;
    setSaving(true);
    setError(null);
    setAviso(null);
    try {
      aplicar(await saveActa(id, acta));
      setAviso("Acta guardada");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-body-md text-secondary">Cargando...</p>;
  if (!set || !acta) return <ErrorBox message={error ?? "No se encontró el set"} />;

  const cliente = set.cliente;
  const parametros = [
    ...new Set(set.muestras.flatMap((m) => (m.resultados ?? []).map((r) => r.analisis.nombre_analisis))),
  ].sort((a, b) => a.localeCompare(b, "es"));
  const fechaRecepcion = set.fecha_hora_recepcion ? formatFecha(toLocalInput(set.fecha_hora_recepcion).slice(0, 10)) : "";

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
            Acta de toma y recepción · Servicio {set.codigo_set}
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            La fecha y hora de toma, el lugar, el responsable y la recepción se editan con el botón Editar del servicio.
            Las muestras y los parámetros salen de las muestras registradas.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <Seccion titulo="Contacto del solicitante">
              <Campo etiqueta={`Teléfono (si es distinto a ${cliente.telefono ?? "—"})`} valor={acta.contacto_telefono} onChange={(v) => poner("contacto_telefono", v)} />
              <Campo etiqueta={`Correo (si es distinto a ${cliente.correo ?? "—"})`} valor={acta.contacto_correo} onChange={(v) => poner("contacto_correo", v)} />
            </Seccion>

            <Seccion titulo="Condiciones de toma de la muestra">
              <Opciones etiqueta="Cumple / No cumple" valor={acta.toma.cumple} onChange={(v) => ponerEn("toma", "cumple", v as CNC)} opciones={CNC_OPCIONES} />
              <Campo etiqueta="Descripción de hallazgos" valor={acta.toma.hallazgos} onChange={(v) => ponerEn("toma", "hallazgos", v)} filas={2} />
              <Campo etiqueta="Acción a realizar" valor={acta.toma.accion} onChange={(v) => ponerEn("toma", "accion", v)} filas={2} />
            </Seccion>

            <Seccion titulo="Condiciones de recepción de la muestra">
              <Campo etiqueta="Responsable de recepción" valor={acta.recepcion.responsable} onChange={(v) => ponerEn("recepcion", "responsable", v)} />
              <Opciones etiqueta="Cumple / No cumple" valor={acta.recepcion.cumple} onChange={(v) => ponerEn("recepcion", "cumple", v)} opciones={CNC_OPCIONES} />
              <Campo etiqueta="Descripción de hallazgos" valor={acta.recepcion.hallazgos} onChange={(v) => ponerEn("recepcion", "hallazgos", v)} filas={2} />
              <Campo etiqueta="Acción a realizar" valor={acta.recepcion.accion} onChange={(v) => ponerEn("recepcion", "accion", v)} filas={2} />
            </Seccion>

            <Seccion titulo="Registro de parámetros a analizar">
              <div className="flex flex-wrap gap-1">
                {parametros.length === 0 && (
                  <span className="font-body-sm text-body-sm text-secondary">Todavía no hay muestras con análisis.</span>
                )}
                {parametros.map((p) => (
                  <span key={p} className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface">
                    {p}
                  </span>
                ))}
              </div>
              <Campo etiqueta="Observaciones" valor={acta.parametros_observaciones} onChange={(v) => poner("parametros_observaciones", v)} filas={2} />
            </Seccion>

            <Seccion titulo="Condiciones ambientales de toma y transporte">
              <Campo etiqueta="Medio de transporte" valor={acta.transporte.medio} onChange={(v) => ponerEn("transporte", "medio", v)} />
              <Campo etiqueta="Condiciones ambientales (°C)" valor={acta.transporte.temperatura} onChange={(v) => ponerEn("transporte", "temperatura", v)} />
              <Opciones etiqueta="Cumple / No cumple" valor={acta.transporte.cumple} onChange={(v) => ponerEn("transporte", "cumple", v)} opciones={CNC_OPCIONES} />
              <Opciones
                etiqueta="Cadena de frío"
                valor={acta.transporte.cadena_frio}
                onChange={(v) => ponerEn("transporte", "cadena_frio", v)}
                opciones={[
                  { value: "SI", label: "Sí" },
                  { value: "NO", label: "No" },
                ]}
              />
              <Campo etiqueta="Descripción de hallazgos" valor={acta.transporte.hallazgos} onChange={(v) => ponerEn("transporte", "hallazgos", v)} filas={2} />
              <Campo etiqueta="Acción a realizar" valor={acta.transporte.accion} onChange={(v) => ponerEn("transporte", "accion", v)} filas={2} />
            </Seccion>

            <Seccion titulo="Fecha de entrega de resultados">
              <Campo etiqueta="Fecha de entrega de resultados" tipo="date" valor={acta.entrega.fecha_entrega} onChange={(v) => ponerEn("entrega", "fecha_entrega", v)} />
              <Campo etiqueta="Fecha de aprobación de resultados" tipo="date" valor={acta.entrega.fecha_aprobacion} onChange={(v) => ponerEn("entrega", "fecha_aprobacion", v)} />
              <Campo etiqueta="Fecha de emisión de resultados" tipo="date" valor={acta.entrega.fecha_emision} onChange={(v) => ponerEn("entrega", "fecha_emision", v)} />
              <Campo etiqueta="Descripción de hallazgos" valor={acta.entrega.hallazgos} onChange={(v) => ponerEn("entrega", "hallazgos", v)} filas={2} />
              <Campo etiqueta="Acción a realizar" valor={acta.entrega.accion} onChange={(v) => ponerEn("entrega", "accion", v)} filas={2} />
            </Seccion>

            <Seccion titulo="Disposición final de muestras">
              <Campo etiqueta="Fecha de ingreso" tipo="date" valor={acta.disposicion.fecha_ingreso} onChange={(v) => ponerEn("disposicion", "fecha_ingreso", v)} />
              <Campo etiqueta="Ubicación" valor={acta.disposicion.ubicacion} onChange={(v) => ponerEn("disposicion", "ubicacion", v)} />
              <Campo etiqueta="Fecha de eliminación tentativa" tipo="date" valor={acta.disposicion.fecha_eliminacion_tentativa} onChange={(v) => ponerEn("disposicion", "fecha_eliminacion_tentativa", v)} />
              <Campo etiqueta="Fecha de eliminación real" tipo="date" valor={acta.disposicion.fecha_eliminacion_real} onChange={(v) => ponerEn("disposicion", "fecha_eliminacion_real", v)} />
              <Campo etiqueta="Descripción de hallazgos" valor={acta.disposicion.hallazgos} onChange={(v) => ponerEn("disposicion", "hallazgos", v)} filas={2} />
              <Campo etiqueta="Acción a realizar" valor={acta.disposicion.accion} onChange={(v) => ponerEn("disposicion", "accion", v)} filas={2} />
            </Seccion>

            <Seccion titulo="Autorizado por">
              <Campo etiqueta="Representante Laboratorio Prestación de Servicios" valor={acta.representante_laboratorio} onChange={(v) => poner("representante_laboratorio", v)} />
              <Campo etiqueta="Nombre de quien aprueba el servicio" valor={acta.aprueba_servicio} onChange={(v) => poner("aprueba_servicio", v)} />
            </Seccion>
          </div>

          <div className="flex flex-wrap gap-space-sm">
            <button
              onClick={guardar}
              disabled={saving}
              className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-60 flex items-center gap-space-xs"
            >
              <Icon name="save" className="text-lg" />
              {saving ? "Guardando..." : "Guardar acta"}
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

      {/* ---- Hoja del acta (formato F-31) ---- */}
      <div className="hoja-acta bg-white text-black w-full max-w-[1100px] mx-auto p-5 shadow-sm print:shadow-none print:p-0 print:max-w-none text-[10px] leading-snug">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={`${td} w-20 text-center align-middle`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-unilibre.png" alt="Universidad Libre" className="h-14 mx-auto" />
              </td>
              <td className={`${td} text-center align-middle font-bold text-[13px] leading-tight`}>
                FORMATO ACTA DE TOMA Y RECEPCIÓN DE MUESTRAS
                <br />
                LABORATORIO PRESTACIÓN DE SERVICIOS
              </td>
              <td className={`${td} w-32 text-center align-middle`}>
                <div className="font-bold">F-31</div>
                <div>Versión 2</div>
                <div>2026-07-01</div>
                <div>Página 1 de 1</div>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              {["Número de servicio", "Nombre de la empresa", "NIT de la empresa", "Solicitante", "Dirección de muestreo", "Número de contacto", "Correo electrónico", "Fecha de ingreso de la muestra"].map((h) => (
                <th key={h} className={`${th} text-center`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {[
                set.codigo_set,
                cliente.nombre_empresa,
                cliente.nit,
                set.solicitante ?? cliente.nombre_responsable,
                set.direccion_muestreo ?? "",
                acta.contacto_telefono || cliente.telefono || "",
                acta.contacto_correo || cliente.correo || "",
                fechaRecepcion,
              ].map((v, i) => (
                <td key={i} className={td}>
                  {v || "N.A."}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <Bloque
          titulo="CONDICIONES DE TOMA DE LA MUESTRA"
          cabeceras={["Fecha y hora de toma", "Lugar / Punto de muestreo", "Responsable de toma de muestra", "C", "NC", "Descripción de hallazgos", "Acción a realizar"]}
          valores={[
            set.fecha_hora_toma ? formatFechaHora(set.fecha_hora_toma) : "",
            set.lugar_toma ?? "",
            set.responsable_toma ?? "",
            marca(acta.toma.cumple === "C"),
            marca(acta.toma.cumple === "NC"),
            acta.toma.hallazgos,
            acta.toma.accion,
          ]}
        />

        <Bloque
          titulo="CONDICIONES DE RECEPCIÓN DE LA MUESTRA"
          cabeceras={["Fecha y hora de recepción", "Responsable de recepción de muestra", "C", "NC", "Descripción de hallazgos", "Acción a realizar"]}
          valores={[
            set.fecha_hora_recepcion ? formatFechaHora(set.fecha_hora_recepcion) : "",
            acta.recepcion.responsable,
            marca(acta.recepcion.cumple === "C"),
            marca(acta.recepcion.cumple === "NC"),
            acta.recepcion.hallazgos,
            acta.recepcion.accion,
          ]}
        />

        <table className="w-full border-collapse mt-1">
          <tbody>
            <tr>
              <th rowSpan={set.muestras.length + 1} className={lado}>
                IDENTIFICACIÓN Y CANTIDAD DE MUESTRAS POR TIPO
              </th>
              {["Código de muestra", "Tipo de muestra", "Nombre de muestra", "Punto / Área muestreada", "Lote", "Fecha de producción", "Fecha de vencimiento", "Estado del envase", "Cantidad / Volumen tomado", "Temp. toma (°C)", "Temp. recepción (°C)", "Técnica de muestreo"].map((h) => (
                <th key={h} className={`${th} text-center`}>
                  {h}
                </th>
              ))}
            </tr>
            {set.muestras.map((m) => (
              <tr key={m.id_muestra}>
                <td className={td}>{m.codigo_muestra}</td>
                <td className={`${td} text-center`}>{m.tipo_matriz ?? "N.A."}</td>
                <td className={td}>{m.nombre_muestra}</td>
                <td className={td}>{m.punto_muestreo ?? "N.A."}</td>
                <td className={td}>{m.lote ?? "N.A."}</td>
                <td className={td}>{m.fecha_produccion ? formatFecha(m.fecha_produccion) : "N.A."}</td>
                <td className={td}>{m.fecha_vencimiento ? formatFecha(m.fecha_vencimiento) : "N.A."}</td>
                <td className={td}>{m.estado_fisico ?? "N.A."}</td>
                <td className={td}>{m.cantidad ?? "N.A."}</td>
                <td className={td}>{m.temp_toma ?? "N.A."}</td>
                <td className={td}>{m.temp_recepcion ?? "N.A."}</td>
                <td className={td}>{m.tecnica_muestreo ?? "N.A."}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border border-black border-t-0 px-1.5 py-0.5 font-bold">{NOTA_TIPOS}</div>

        <Bloque
          titulo="REGISTRO DE PARÁMETROS A ANALIZAR"
          cabeceras={["Parámetros microbiológicos", "Observaciones", "N° total de muestras"]}
          valores={[parametros.join(", "), acta.parametros_observaciones, String(set.muestras.length)]}
        />

        <Bloque
          titulo="CONDICIONES AMBIENTALES DE TOMA Y TRANSPORTE"
          cabeceras={["Medio de transporte", "Cond. amb. °C", "C", "NC", "Cadena de frío SI", "Cadena de frío NO", "Descripción de hallazgos", "Acción a realizar"]}
          valores={[
            acta.transporte.medio,
            acta.transporte.temperatura,
            marca(acta.transporte.cumple === "C"),
            marca(acta.transporte.cumple === "NC"),
            marca(acta.transporte.cadena_frio === "SI"),
            marca(acta.transporte.cadena_frio === "NO"),
            acta.transporte.hallazgos,
            acta.transporte.accion,
          ]}
        />

        <Bloque
          titulo="FECHA DE ENTREGA DE RESULTADOS"
          cabeceras={["Fecha de entrega de resultados", "Fecha de aprobación de resultados", "Fecha de emisión de resultados", "Descripción de hallazgos", "Acción a realizar"]}
          valores={[
            fechaOVacio(acta.entrega.fecha_entrega),
            fechaOVacio(acta.entrega.fecha_aprobacion),
            fechaOVacio(acta.entrega.fecha_emision),
            acta.entrega.hallazgos,
            acta.entrega.accion,
          ]}
        />

        <Bloque
          titulo="DISPOSICIÓN FINAL DE MUESTRAS"
          cabeceras={["Fecha de ingreso", "Ubicación", "Fecha de eliminación tentativa", "Fecha de eliminación real", "Descripción de hallazgos", "Acción a realizar"]}
          valores={[
            fechaOVacio(acta.disposicion.fecha_ingreso),
            acta.disposicion.ubicacion,
            fechaOVacio(acta.disposicion.fecha_eliminacion_tentativa),
            fechaOVacio(acta.disposicion.fecha_eliminacion_real),
            acta.disposicion.hallazgos,
            acta.disposicion.accion,
          ]}
        />

        <div className="border border-black border-t-0 px-1.5 py-0.5 font-bold">{NOTA_CUMPLE}</div>
        <div className="border border-black border-t-0 px-1.5 py-1">{NOTA_CLIENTE}</div>

        <table className="w-full border-collapse mt-1">
          <tbody>
            <tr>
              <th className={lado}>Autorizado por:</th>
              <td className={`${td} h-16 text-center align-bottom`}>
                <div>{acta.representante_laboratorio}</div>
                <div className="font-bold">Representante Laboratorio Prestación de Servicios</div>
              </td>
              <td className={`${td} h-16 text-center align-bottom`}>
                <div>{acta.aprueba_servicio}</div>
                <div className="font-bold">Nombre de quien aprueba el servicio</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}