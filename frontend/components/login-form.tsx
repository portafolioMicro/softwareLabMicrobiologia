"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "./icon";
import { loginRequest } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginRequest(correo, password);
      const redirectTo = searchParams.get("redirect") ?? "/panel";
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-container-low flex items-center justify-center p-space-md">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-lg p-space-xl flex flex-col gap-space-md">
        <div className="flex flex-col items-center gap-space-xs text-center">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <Icon name="biotech" className="text-3xl" />
          </div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase mt-space-xs">
            Panel Interno
          </h1>
          <p className="font-body-sm text-body-sm text-secondary">
            Laboratorio de Microbiología · Universidad Libre Pereira
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-sm">
          <div className="flex flex-col gap-1">
            <label htmlFor="correo" className="font-label-md text-label-md text-on-surface font-semibold">
              Correo institucional
            </label>
            <input
              id="correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="font-body-md text-body-md border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="nombre@unilibre.edu.co"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-label-md text-label-md text-on-surface font-semibold">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-body-md text-body-md border border-outline-variant rounded-lg px-3 py-2.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container font-body-sm text-body-sm rounded-lg px-3 py-2 flex items-center gap-space-xs">
              <Icon name="error" className="text-lg" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-3 rounded-lg shadow-sm transition-all disabled:opacity-60 mt-space-xs"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}