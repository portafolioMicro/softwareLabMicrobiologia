"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./icon";
import { Field, FormFooter, Modal, errorMessage, inputClass } from "./ui-bits";
import { cambiarPassword } from "@/lib/api";

export function CambiarPasswordButton() {
  const [abierto, setAbierto] = useState(false);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  function abrir() {
    setActual("");
    setNueva("");
    setRepetir("");
    setError(null);
    setOk(false);
    setAbierto(true);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (nueva !== repetir) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    setSaving(true);
    try {
      await cambiarPassword(actual, nueva);
      setOk(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={abrir}
        title="Cambiar mi contraseña"
        className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors flex items-center gap-space-xs"
      >
        <Icon name="key" className="text-lg" />
        <span className="hidden sm:inline">Contraseña</span>
      </button>

      {abierto && (
        <Modal title="Cambiar mi contraseña" onClose={() => setAbierto(false)}>
          {ok ? (
            <div className="flex flex-col gap-space-md">
              <div className="bg-tertiary-fixed text-on-tertiary-fixed font-body-md text-body-md rounded-lg px-3 py-3 flex items-center gap-space-xs">
                <Icon name="check_circle" className="text-xl" />
                <span>Contraseña actualizada.</span>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg w-fit self-end"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={guardar} className="flex flex-col gap-space-sm">
              <Field id="pw_actual" label="Contraseña actual" required>
                <input id="pw_actual" type="password" required value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" className={inputClass} />
              </Field>
              <Field id="pw_nueva" label="Contraseña nueva (mínimo 8 caracteres)" required>
                <input id="pw_nueva" type="password" required minLength={8} maxLength={72} value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" className={inputClass} />
              </Field>
              <Field id="pw_repetir" label="Repite la contraseña nueva" required>
                <input id="pw_repetir" type="password" required value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" className={inputClass} />
              </Field>
              <FormFooter error={error} saving={saving} onCancel={() => setAbierto(false)} />
            </form>
          )}
        </Modal>
      )}
    </>
  );
}