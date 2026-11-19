"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./icon";
import { ErrorBox, Modal, TableShell, errorMessage, inputClass } from "./ui-bits";
import { SetForm } from "./set-form";
import { EstadoBadge } from "./estado-badge";
import { createSet, listClientes, listSets, type Cliente, type SetInput, type SetResumen } from "@/lib/api";
import { ESTADOS, formatFecha, formatFechaHora } from "@/lib/format";

export function SetsManager({ estadoInicial = "" }: { estadoInicial?: string }) {
  const router = useRouter();
  const [sets, setSets] = useState<SetResumen[]>([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState(estadoInicial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const cargar = useCallback(async (q: string, e: string) => {
    setLoading(true);
    setError(null);
    try {
      setSets(await listSets(q, e));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => cargar(search.trim(), estado), 300);
    return () => clearTimeout(t);
  }, [search, estado, cargar]);

  async function abrirNuevo() {
    setNuevo(true);
    if (clientes.length === 0) {
      try {
        setClientes(await listClientes());
      } catch (err) {
        setError(errorMessage(err));
      }
    }
  }

  async function crear(input: SetInput) {
    const creado = await createSet(input);
    router.push(`/panel/sets/${creado.id_set_muestra}`);
  }

  return (
    <div className="flex flex-col gap-space-md max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Sets de muestras</h1>
          <p className="font-body-md text-body-md text-secondary">
            Cada set agrupa las muestras que un cliente entrega en una misma recepción.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-space-xs"
        >
          <Icon name="add" className="text-lg" />
          <span>Nuevo set</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-space-sm">
        <div className="relative w-full max-w-md">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xl" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o cliente"
            className={`${inputClass} pl-10`}
          />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={`${inputClass} max-w-[200px]`}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorBox message={error} />}

      <TableShell
        heads={["Código", "Cliente", "Estado", "Recepción", "Reporte estimado", "Muestras"]}
        loading={loading}
        isEmpty={sets.length === 0}
        emptyText={search || estado ? "No hay sets con esos filtros." : "Todavía no hay sets registrados."}
      >
        {sets.map((s) => (
          <tr key={s.id_set_muestra} className="border-t border-surface-variant hover:bg-surface-container-low">
            <td className="px-space-md py-3 whitespace-nowrap">
              <Link href={`/panel/sets/${s.id_set_muestra}`} className="font-semibold text-primary hover:underline">
                {s.codigo_set}
              </Link>
              {s.acreditado_onac && <span className="ml-2 font-label-sm text-label-sm text-tertiary">ONAC</span>}
            </td>
            <td className="px-space-md py-3">{s.cliente.nombre_empresa}</td>
            <td className="px-space-md py-3">
              <EstadoBadge estado={s.estado_set} />
            </td>
            <td className="px-space-md py-3 whitespace-nowrap">{formatFechaHora(s.fecha_hora_recepcion)}</td>
            <td className="px-space-md py-3 whitespace-nowrap">{formatFecha(s.fecha_estimada_reporte)}</td>
            <td className="px-space-md py-3">{s._count.muestras}</td>
          </tr>
        ))}
      </TableShell>

      {nuevo && (
        <Modal title="Nuevo set de muestras" onClose={() => setNuevo(false)} wide>
          <SetForm clientes={clientes} onSubmit={crear} onCancel={() => setNuevo(false)} />
        </Modal>
      )}
    </div>
  );
}