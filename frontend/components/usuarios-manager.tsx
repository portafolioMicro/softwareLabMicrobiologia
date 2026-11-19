"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Icon } from "./icon";
import {
  ActiveBadge,
  ErrorBox,
  Field,
  FormFooter,
  Modal,
  RowActions,
  TableShell,
  errorMessage,
  inputClass,
} from "./ui-bits";
import {
  createUsuario,
  listUsuarios,
  updateUsuario,
  type Usuario,
  type UsuarioAdmin,
} from "@/lib/api";

type Rol = Usuario["rol"];

const ROLES: { value: Rol; label: string; ayuda: string }[] = [
  { value: "Administrador", label: "Administrador", ayuda: "Acceso total: usuarios, catálogo y eliminar registros" },
  { value: "Analista", label: "Analista", ayuda: "Registra muestras, digita resultados y emite informes" },
  { value: "Tecnico", label: "Técnico", ayuda: "Registra muestras y consulta resultados" },
];

const rolLabel = (r: Rol) => ROLES.find((x) => x.value === r)?.label ?? r;

const vacio = { nombre_completo: "", correo: "", cargo: "", rol: "Analista" as Rol, password: "", activo: true };

export function UsuariosManager({ yoId }: { yoId: number }) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "nuevo" | UsuarioAdmin>(null);
  const [form, setForm] = useState(vacio);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsuarios(await listUsuarios());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function abrirNuevo() {
    setForm(vacio);
    setFormError(null);
    setModal("nuevo");
  }

  function abrirEditar(u: UsuarioAdmin) {
    setForm({
      nombre_completo: u.nombre_completo,
      correo: u.correo,
      cargo: u.cargo ?? "",
      rol: u.rol,
      password: "",
      activo: u.activo,
    });
    setFormError(null);
    setModal(u);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    setFormError(null);
    try {
      const cargo = form.cargo.trim() || null;
      if (modal === "nuevo") {
        await createUsuario({
          nombre_completo: form.nombre_completo.trim(),
          correo: form.correo.trim(),
          cargo,
          rol: form.rol,
          password: form.password,
        });
      } else {
        await updateUsuario(modal.id_usuario, {
          nombre_completo: form.nombre_completo.trim(),
          correo: form.correo.trim(),
          cargo,
          rol: form.rol,
          activo: form.activo,
          ...(form.password ? { password: form.password } : {}),
        });
      }
      setModal(null);
      await cargar();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function alternarActivo(u: UsuarioAdmin) {
    const accion = u.activo ? "desactivar" : "activar";
    if (!window.confirm(`¿Quieres ${accion} a ${u.nombre_completo}?`)) return;
    try {
      await updateUsuario(u.id_usuario, { activo: !u.activo });
      await cargar();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const cambiar = (k: keyof typeof vacio) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const editando = modal !== null && modal !== "nuevo";

  return (
    <div className="flex flex-col gap-space-md max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Usuarios</h1>
          <p className="font-body-md text-body-md text-secondary">
            Cuentas del personal del laboratorio. Un usuario desactivado no puede iniciar sesión, pero sus informes se conservan.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-space-xs"
        >
          <Icon name="person_add" className="text-lg" />
          <span>Nuevo usuario</span>
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      <TableShell
        heads={["Nombre", "Correo", "Cargo", "Rol", "Estado", ""]}
        loading={loading}
        isEmpty={usuarios.length === 0}
        emptyText="No hay usuarios."
      >
        {usuarios.map((u) => (
          <tr key={u.id_usuario} className={`border-t border-surface-variant ${u.activo ? "" : "opacity-60"}`}>
            <td className="px-space-md py-3 font-semibold">
              {u.nombre_completo}
              {u.id_usuario === yoId && <span className="ml-2 font-label-sm text-label-sm text-tertiary">(tú)</span>}
            </td>
            <td className="px-space-md py-3">{u.correo}</td>
            <td className="px-space-md py-3">{u.cargo ?? "—"}</td>
            <td className="px-space-md py-3">{rolLabel(u.rol)}</td>
            <td className="px-space-md py-3">
              <ActiveBadge activo={u.activo} />
            </td>
            <td className="px-space-md py-3">
              <RowActions
                extra={
                  u.id_usuario !== yoId && (
                    <button
                      onClick={() => alternarActivo(u)}
                      title={u.activo ? "Desactivar" : "Activar"}
                      className="p-2 rounded-lg hover:bg-surface-container text-secondary"
                    >
                      <Icon name={u.activo ? "block" : "check_circle"} className="text-xl" />
                    </button>
                  )
                }
                onEdit={() => abrirEditar(u)}
              />
            </td>
          </tr>
        ))}
      </TableShell>

      {modal && (
        <Modal title={editando ? "Editar usuario" : "Nuevo usuario"} onClose={() => setModal(null)}>
          <form onSubmit={guardar} className="flex flex-col gap-space-sm">
            <Field id="nombre_completo" label="Nombre completo" required>
              <input id="nombre_completo" required value={form.nombre_completo} onChange={cambiar("nombre_completo")} className={inputClass} />
            </Field>
            <Field id="correo" label="Correo (con el que inicia sesión)" required>
              <input id="correo" type="email" required value={form.correo} onChange={cambiar("correo")} className={inputClass} />
            </Field>
            <Field id="cargo" label="Cargo (aparece en las firmas del informe)">
              <input
                id="cargo"
                list="cargos"
                value={form.cargo}
                onChange={cambiar("cargo")}
                placeholder="Ej: Microbióloga / Analista"
                className={inputClass}
              />
              <datalist id="cargos">
                <option value="Microbiólogo(a) / Analista" />
                <option value="Coordinador(a)" />
                <option value="Líder técnico" />
              </datalist>
            </Field>
            <Field id="rol" label="Rol" required>
              <select id="rol" value={form.rol} onChange={cambiar("rol")} className={inputClass}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="font-body-sm text-body-sm text-secondary">
                {ROLES.find((r) => r.value === form.rol)?.ayuda}
              </span>
            </Field>
            <Field id="password" label={editando ? "Restablecer contraseña (opcional)" : "Contraseña inicial"} required={!editando}>
              <input
                id="password"
                type="text"
                required={!editando}
                minLength={8}
                maxLength={72}
                value={form.password}
                onChange={cambiar("password")}
                autoComplete="new-password"
                placeholder={editando ? "Déjala vacía para no cambiarla" : "Mínimo 8 caracteres"}
                className={inputClass}
              />
            </Field>
            {editando && (
              <label className="flex items-center gap-space-xs font-body-md text-body-md">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                />
                Usuario activo
              </label>
            )}
            <FormFooter error={formError} saving={saving} onCancel={() => setModal(null)} />
          </form>
        </Modal>
      )}
    </div>
  );
}