"use client";

import type { ReactNode } from "react";
import { Icon } from "./icon";

export const inputClass =
  "font-body-md text-body-md border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary w-full";

export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Ocurrió un error inesperado";
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-error-container text-on-error-container font-body-sm text-body-sm rounded-lg px-3 py-2 flex items-center gap-space-xs">
      <Icon name="error" className="text-lg" />
      <span>{message}</span>
    </div>
  );
}

export function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-label-md text-label-md text-on-surface font-semibold">
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  wide,
  children,
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/60 flex items-center justify-center p-space-md">
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormFooter({
  error,
  saving,
  onCancel,
}: {
  error: string | null;
  saving: boolean;
  onCancel: () => void;
}) {
  return (
    <>
      {error && <ErrorBox message={error} />}
      <div className="flex justify-end gap-space-sm">
        <button
          type="button"
          onClick={onCancel}
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
    </>
  );
}

export function TableShell({
  heads,
  loading,
  isEmpty,
  emptyText,
  children,
}: {
  heads: string[];
  loading: boolean;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container font-label-md text-label-md text-on-surface-variant uppercase">
            {heads.map((h, i) => (
              <th key={i} className="px-space-md py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-body-md text-body-md text-on-surface">
          {loading ? (
            <tr>
              <td colSpan={heads.length} className="px-space-md py-6 text-center text-secondary">
                Cargando...
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={heads.length} className="px-space-md py-6 text-center text-secondary">
                {emptyText}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function RowActions({
  onEdit,
  onDelete,
  extra,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex justify-end gap-1">
      {extra}
      {onEdit && (
        <button onClick={onEdit} title="Editar" className="p-2 rounded-lg hover:bg-surface-container text-tertiary">
          <Icon name="edit" className="text-xl" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} title="Eliminar" className="p-2 rounded-lg hover:bg-error-container text-error">
          <Icon name="delete" className="text-xl" />
        </button>
      )}
    </div>
  );
}

export function ActiveBadge({ activo }: { activo: boolean }) {
  return (
    <span
      className={`font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold ${
        activo ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-variant text-on-surface-variant"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}