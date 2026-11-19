"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./icon";
import { EstadoBadge } from "./estado-badge";
import { ErrorBox, errorMessage } from "./ui-bits";
import { getResumen, type Resumen, type ResumenMuestra, type Usuario } from "@/lib/api";
import { ESTADOS, formatFecha } from "@/lib/format";
import { hoy } from "@/lib/informe";

function Panel({
  titulo,
  total,
  vacio,
  children,
}: {
  titulo: string;
  total?: number;
  vacio: string;
  children: ReactNode;
}) {
  const sinDatos = total === 0;
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-title-md text-title-md text-on-surface font-bold">{titulo}</h2>
        {total !== undefined && (
          <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded font-semibold">{total}</span>
        )}
      </div>
      {sinDatos ? <p className="font-body-sm text-body-sm text-secondary">{vacio}</p> : children}
    </div>
  );
}

function FilaMuestra({ m, href, detalle }: { m: ResumenMuestra; href: string; detalle: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-space-sm rounded-lg px-2 py-2 hover:bg-surface-container-low transition-colors"
    >
      <div className="min-w-0">
        <div className="font-body-md text-body-md text-on-surface font-semibold truncate">
          {m.codigo_muestra} · {m.nombre_muestra}
        </div>
        <div className="font-body-sm text-body-sm text-secondary truncate">
          {m.set.cliente.nombre_empresa} · Servicio {m.set.codigo_set}
        </div>
      </div>
      <span className="font-label-sm text-label-sm text-tertiary whitespace-nowrap">{detalle}</span>
    </Link>
  );
}

const acceso = (href: string, icono: string, texto: string) => (
  <Link
    key={href}
    href={href}
    className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-space-sm"
  >
    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
      <Icon name={icono} className="text-2xl" />
    </div>
    <span className="font-title-md text-title-md text-on-surface font-bold">{texto}</span>
  </Link>
);

export function InicioView({ nombre, rol }: { nombre: string; rol: Usuario["rol"] }) {
  const [r, setR] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResumen()
      .then(setR)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const hoyStr = hoy();

  return (
    <div className="flex flex-col gap-space-lg max-w-6xl">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Bienvenido, {nombre}</h1>
        <p className="font-body-md text-body-md text-secondary">Resumen del laboratorio.</p>
      </div>

      {error && <ErrorBox message={error} />}

      {/* Servicios por estado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        {ESTADOS.map((e) => (
          <Link
            key={e.value}
            href={`/panel/sets?estado=${e.value}`}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1"
          >
            <span className="font-label-md text-label-md text-secondary uppercase">{e.label}</span>
            <span className="font-display-sm text-display-sm text-on-surface">{r ? r.porEstado[e.value] : "—"}</span>
            <span className="font-body-sm text-body-sm text-secondary">servicios</span>
          </Link>
        ))}
      </div>

      {r && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
            <Panel titulo="Muestras con análisis pendientes" total={r.totalPendientes} vacio="No hay análisis pendientes. ¡Todo al día!">
              <div className="flex flex-col">
                {r.pendientes.map((m) => (
                  <FilaMuestra
                    key={m.id_muestra}
                    m={m}
                    href={`/panel/muestras/${m.id_muestra}`}
                    detalle={`Faltan ${m.faltan} de ${m.total}`}
                  />
                ))}
              </div>
              {r.totalPendientes > r.pendientes.length && (
                <p className="font-body-sm text-body-sm text-secondary">
                  Mostrando las {r.pendientes.length} con fecha de reporte más cercana.
                </p>
              )}
            </Panel>

            <Panel titulo="Listas para emitir informe" total={r.totalListas} vacio="No hay muestras esperando informe.">
              <div className="flex flex-col">
                {r.listas.map((m) => (
                  <FilaMuestra
                    key={m.id_muestra}
                    m={m}
                    href={`/panel/muestras/${m.id_muestra}/informe`}
                    detalle="Emitir informe"
                  />
                ))}
              </div>
            </Panel>
          </div>

          <Panel titulo="Servicios activos por fecha de reporte" total={r.proximos.length} vacio="No hay servicios en curso.">
            <div className="flex flex-col">
              {r.proximos.map((s) => {
                const fecha = s.fecha_estimada_reporte?.slice(0, 10) ?? null;
                const vencido = !!fecha && fecha < hoyStr;
                return (
                  <Link
                    key={s.id_set_muestra}
                    href={`/panel/sets/${s.id_set_muestra}`}
                    className="flex flex-wrap items-center justify-between gap-space-sm rounded-lg px-2 py-2 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-body-md text-body-md text-on-surface font-semibold">
                        Servicio {s.codigo_set} · {s.cliente.nombre_empresa}
                      </div>
                      <div className="font-body-sm text-body-sm text-secondary">{s._count.muestras} muestra(s)</div>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <EstadoBadge estado={s.estado_set} />
                      <span
                        className={`font-label-md text-label-md whitespace-nowrap ${vencido ? "text-error font-bold" : "text-secondary"}`}
                      >
                        {fecha ? (vencido ? `Vencido: ${formatFecha(fecha)}` : formatFecha(fecha)) : "Sin fecha de reporte"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Panel>

          <p className="font-body-sm text-body-sm text-secondary">
            En total: {r.clientes} cliente(s) y {r.muestras} muestra(s) registradas.
          </p>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {acceso("/panel/sets", "inventory_2", "Sets de muestras")}
        {acceso("/panel/clientes", "groups", "Clientes")}
        {acceso("/panel/catalogo", "science", "Catálogo")}
        {rol === "Administrador" && acceso("/panel/usuarios", "manage_accounts", "Usuarios")}
      </div>
    </div>
  );
}