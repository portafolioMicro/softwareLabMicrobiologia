"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Icon } from "./icon";
import { ErrorBox, Modal, RowActions, TableShell, errorMessage, inputClass } from "./ui-bits";
import { SetForm } from "./set-form";
import { MuestraForm } from "./muestra-form";
import { EstadoBadge } from "./estado-badge";
import {
  createMuestra,
  deleteMuestra,
  deleteSet,
  getSet,
  listClientes,
  normasApi,
  updateMuestra,
  updateSet,
  type Cliente,
  type EstadoSet,
  type MuestraInput,
  type MuestraItem,
  type Norma,
  type SetDetalle,
  type SetInput,
  type Usuario,
} from "@/lib/api";
import { ESTADOS, formatFecha, formatFechaHora } from "@/lib/format";

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="font-label-sm text-label-sm text-secondary uppercase">{label}</span>
      <span className="font-body-md text-body-md text-on-surface">{children || "—"}</span>
    </div>
  );
}

export function SetDetalleView({ id, rol }: { id: number; rol: Usuario["rol"] }) {
  const router = useRouter();
  const esAdmin = rol === "Administrador";
  const [set, setSet] = useState<SetDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [normas, setNormas] = useState<Norma[]>([]);
  const [modal, setModal] = useState<null | "set" | "nueva" | MuestraItem>(null);

  const cargar = useCallback(async () => {
    try {
      setSet(await getSet(id));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function abrirEditarSet() {
    setModal("set");
    if (clientes.length === 0) setClientes(await listClientes().catch(() => []));
  }

  async function abrirMuestra(m: "nueva" | MuestraItem) {
    setModal(m);
    if (normas.length === 0) setNormas(await normasApi.list().catch(() => []));
  }

  async function cambiarEstado(estado: EstadoSet) {
    try {
      await updateSet(id, { estado_set: estado });
      await cargar();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function guardarSet(input: SetInput) {
    await updateSet(id, input);
    setModal(null);
    await cargar();
  }

  async function guardarMuestra(input: MuestraInput) {
    if (modal === "nueva") {
      await createMuestra(id, input);
    } else if (modal && modal !== "set") {
      const { id_norma: _omitida, ...resto } = input;
      await updateMuestra(modal.id_muestra, resto);
    }
    setModal(null);
    await cargar();
  }

  async function eliminarMuestra(m: MuestraItem) {
    if (!window.confirm(`¿Eliminar la muestra "${m.codigo_muestra}" y sus resultados?`)) return;
    try {
      await deleteMuestra(m.id_muestra);
      await cargar();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function eliminarSet() {
    if (!set || !window.confirm(`¿Eliminar el set "${set.codigo_set}"?`)) return;
    try {
      await deleteSet(id);
      router.push("/panel/sets");
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (loading) return <p className="font-body-md text-secondary">Cargando...</p>;
  if (!set) return <ErrorBox message={error ?? "No se encontró el set"} />;

  return (
    <div className="flex flex-col gap-space-md max-w-6xl">
      <Link href="/panel/sets" className="font-label-lg text-label-lg text-tertiary hover:underline flex items-center gap-1 w-fit">
        <Icon name="arrow_back" className="text-lg" /> Sets de muestras
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">{set.codigo_set}</h1>
          <EstadoBadge estado={set.estado_set} />
          {set.acreditado_onac && (
            <span className="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded font-semibold">
              ONAC
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <select
            value={set.estado_set}
            onChange={(e) => cambiarEstado(e.target.value as EstadoSet)}
            className={`${inputClass} w-auto`}
            title="Cambiar estado"
          >
            {ESTADOS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Link
            href={`/panel/sets/${id}/acta`}
            className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs"
          >
            <Icon name="assignment" className="text-lg" /> Acta F-31
          </Link>
                    <Link
            href={`/panel/sets/${id}/conteos`}
            className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs"
          >
            <Icon name="table_chart" className="text-lg" /> Conteos F-11
          </Link>
          <button
            onClick={abrirEditarSet}
            className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs"
          >
            <Icon name="edit" className="text-lg" /> Editar
          </button>
          {esAdmin && (
            <button
              onClick={eliminarSet}
              className="font-label-lg text-label-lg bg-error-container hover:opacity-80 text-on-error-container px-space-md py-2.5 rounded-lg transition-opacity flex items-center gap-space-xs"
            >
              <Icon name="delete" className="text-lg" /> Eliminar
            </button>
          )}
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
        <Dato label="Cliente">{set.cliente.nombre_empresa}</Dato>
        <Dato label="NIT">{set.cliente.nit}</Dato>
        <Dato label="Solicitante">{set.solicitante}</Dato>
        <Dato label="Causa del análisis">{set.causa_analisis}</Dato>
        <Dato label="Responsable de la toma">{set.responsable_toma}</Dato>
        <Dato label="Lugar de la toma">{set.lugar_toma}</Dato>
        <Dato label="Dirección de muestreo">{set.direccion_muestreo}</Dato>
        <Dato label="Toma">{formatFechaHora(set.fecha_hora_toma)}</Dato>
        <Dato label="Recepción">{formatFechaHora(set.fecha_hora_recepcion)}</Dato>
        <Dato label="Reporte estimado">{formatFecha(set.fecha_estimada_reporte)}</Dato>
        <Dato label="Recibido por">{set.usuarioRecepcion.nombre_completo}</Dato>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Muestras ({set.muestras.length})</h2>
        <button
          onClick={() => abrirMuestra("nueva")}
          className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-space-xs"
        >
          <Icon name="add" className="text-lg" /> Agregar muestra
        </button>
      </div>

      <TableShell

        heads={["Código", "Muestra", "Norma", "Tipo", "Análisis", ""]}
        loading={false}
        isEmpty={set.muestras.length === 0}
        emptyText="Este set todavía no tiene muestras."
      >
        {set.muestras.map((m) => {
          const lista = m.resultados ?? [];
          const hechos = lista.filter((r) => r.resultado_final).length;
          return (
            <tr key={m.id_muestra} className="border-t border-surface-variant">
              <td className="px-space-md py-3 whitespace-nowrap">
                <Link href={`/panel/muestras/${m.id_muestra}`} className="font-semibold text-primary hover:underline">
                  {m.codigo_muestra}
                </Link>
              </td>
              <td className="px-space-md py-3">
                <div className="font-semibold">{m.nombre_muestra}</div>
                {m.lote && <div className="text-body-sm text-secondary">Lote {m.lote}</div>}
              </td>
              <td className="px-space-md py-3 text-body-sm">{m.norma.nombre_norma}</td>
              <td className="px-space-md py-3">{m.tipo_matriz ?? "—"}</td>
              <td className="px-space-md py-3">
                <div className="flex flex-wrap gap-1 max-w-sm">
                  {lista.map((r) => (
                    <span
                      key={r.id_resultado}
                      title={r.metodo_utilizado ?? ""}
                      className={`font-label-sm text-label-sm px-2 py-0.5 rounded ${
                        r.resultado_final
                          ? "bg-tertiary-fixed text-on-tertiary-fixed"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {r.analisis.nombre_analisis}
                    </span>
                  ))}
                </div>
                <div className="text-body-sm text-secondary mt-1">
                  {hechos} de {lista.length} con resultado
                </div>
              </td>
              <td className="px-space-md py-3">
                <RowActions
                  extra={
                    <Link
                      href={`/panel/muestras/${m.id_muestra}`}
                      title="Resultados"
                      className="p-2 rounded-lg hover:bg-surface-container text-primary"
                    >
                      <Icon name="biotech" className="text-xl" />
                    </Link>
                  }
                  onEdit={() => abrirMuestra(m)}
                  onDelete={esAdmin ? () => eliminarMuestra(m) : undefined}
                />
              </td>
            </tr>
          );
        })}
      </TableShell>
      

      {modal === "set" && (
        <Modal title="Editar set" onClose={() => setModal(null)} wide>
          <SetForm initial={set} clientes={clientes} onSubmit={guardarSet} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal !== null && modal !== "set" && (
        <Modal title={modal === "nueva" ? "Agregar muestra" : `Editar ${modal.codigo_muestra}`} onClose={() => setModal(null)} wide>
          <MuestraForm
            initial={modal === "nueva" ? null : modal}
            normas={normas}
            onSubmit={guardarMuestra}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}