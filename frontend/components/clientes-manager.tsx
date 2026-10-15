"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Icon } from "./icon";
import {
  createCliente,
  deleteCliente,
  listClientes,
  updateCliente,
  type Cliente,
  type ClienteInput,
  type Usuario,
} from "@/lib/api";

const emptyForm = {
  nit: "",
  nombre_empresa: "",
  nombre_responsable: "",
  ciudad: "",
  direccion: "",
  correo: "",
  telefono: "",
};
type FormState = typeof emptyForm;

function toPayload(form: FormState): ClienteInput {
  const opt = (v: string) => v.trim() || null;
  return {
    nit: form.nit.trim(),
    nombre_empresa: form.nombre_empresa.trim(),
    nombre_responsable: form.nombre_responsable.trim(),
    ciudad: opt(form.ciudad),
    direccion: opt(form.direccion),
    correo: opt(form.correo),
    telefono: opt(form.telefono),
  };
}

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Ocurrió un error inesperado";
}

const inputClass =
  "font-body-md text-body-md border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary w-full";

export function ClientesManager({ rol }: { rol: Usuario["rol"] }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // null = modal cerrado, "nuevo" = creando, Cliente = editando
  const [modal, setModal] = useState<null | "nuevo" | Cliente>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      setClientes(await listClientes(q));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca 300 ms después de que el usuario deja de escribir
  useEffect(() => {
    const t = setTimeout(() => cargar(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search, cargar]);

  function abrirNuevo() {
    setForm(emptyForm);
    setFormError(null);
    setModal("nuevo");
  }

  function abrirEditar(c: Cliente) {
    setForm({
      nit: c.nit,
      nombre_empresa: c.nombre_empresa,
      nombre_responsable: c.nombre_responsable,
      ciudad: c.ciudad ?? "",
      direccion: c.direccion ?? "",
      correo: c.correo ?? "",
      telefono: c.telefono ?? "",
    });
    setFormError(null);
    setModal(c);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    setFormError(null);
    try {
      const payload = toPayload(form);
      if (modal === "nuevo") {
        await createCliente(payload);
      } else {
        await updateCliente(modal.id_cliente, payload);
      }
      setModal(null);
      await cargar(search.trim());
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(c: Cliente) {
    if (!window.confirm(`¿Eliminar a "${c.nombre_empresa}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteCliente(c.id_cliente);
      await cargar(search.trim());
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function campo(name: keyof FormState, label: string, props: { required?: boolean; type?: string } = {}) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={name} className="font-label-md text-label-md text-on-surface font-semibold">
          {label}
          {props.required && <span className="text-error"> *</span>}
        </label>
        <input
          id={name}
          type={props.type ?? "text"}
          required={props.required}
          value={form[name]}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-md max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Clientes</h1>
          <p className="font-body-md text-body-md text-secondary">
            Empresas y personas que solicitan servicios al laboratorio.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-space-xs"
        >
          <Icon name="add" className="text-lg" />
          <span>Nuevo cliente</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xl" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por NIT, empresa o responsable"
          className={`${inputClass} pl-10`}
        />
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container font-body-sm text-body-sm rounded-lg px-3 py-2 flex items-center gap-space-xs">
          <Icon name="error" className="text-lg" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container font-label-md text-label-md text-on-surface-variant uppercase">
              <th className="px-space-md py-3">NIT</th>
              <th className="px-space-md py-3">Empresa</th>
              <th className="px-space-md py-3">Responsable</th>
              <th className="px-space-md py-3">Ciudad</th>
              <th className="px-space-md py-3">Contacto</th>
              <th className="px-space-md py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface">
            {loading && (
              <tr>
                <td colSpan={6} className="px-space-md py-6 text-center text-secondary">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && clientes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-space-md py-6 text-center text-secondary">
                  {search ? "No hay clientes que coincidan con la búsqueda." : "Todavía no hay clientes registrados."}
                </td>
              </tr>
            )}
            {!loading &&
              clientes.map((c) => (
                <tr key={c.id_cliente} className="border-t border-surface-variant">
                  <td className="px-space-md py-3 whitespace-nowrap">{c.nit}</td>
                  <td className="px-space-md py-3 font-semibold">{c.nombre_empresa}</td>
                  <td className="px-space-md py-3">{c.nombre_responsable}</td>
                  <td className="px-space-md py-3">{c.ciudad ?? "—"}</td>
                  <td className="px-space-md py-3 text-body-sm">
                    <div>{c.correo ?? "—"}</div>
                    <div className="text-secondary">{c.telefono ?? ""}</div>
                  </td>
                  <td className="px-space-md py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => abrirEditar(c)}
                        title="Editar"
                        className="p-2 rounded-lg hover:bg-surface-container text-tertiary"
                      >
                        <Icon name="edit" className="text-xl" />
                      </button>
                      {rol === "Administrador" && (
                        <button
                          onClick={() => eliminar(c)}
                          title="Eliminar"
                          className="p-2 rounded-lg hover:bg-error-container text-error"
                        >
                          <Icon name="delete" className="text-xl" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 flex items-center justify-center p-space-md">
          <form
            onSubmit={guardar}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {modal === "nuevo" ? "Nuevo cliente" : "Editar cliente"}
              </h2>
              <button type="button" onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-surface-container">
                <Icon name="close" className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {campo("nit", "NIT", { required: true })}
              {campo("nombre_empresa", "Nombre de la empresa", { required: true })}
              {campo("nombre_responsable", "Responsable", { required: true })}
              {campo("ciudad", "Ciudad")}
              {campo("direccion", "Dirección")}
              {campo("telefono", "Teléfono")}
              <div className="sm:col-span-2">{campo("correo", "Correo electrónico", { type: "email" })}</div>
            </div>

            {formError && (
              <div className="bg-error-container text-on-error-container font-body-sm text-body-sm rounded-lg px-3 py-2 flex items-center gap-space-xs">
                <Icon name="error" className="text-lg" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-space-sm">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}