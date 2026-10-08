const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  rol: "Administrador" | "Analista" | "Tecnico";
  cargo?: string | null;
}

export async function loginRequest(correo: string, password: string): Promise<Usuario> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // necesario para que viaje/reciba la cookie httpOnly
    body: JSON.stringify({ correo, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "No se pudo iniciar sesión");
  }

  const data = await res.json();
  return data.usuario as Usuario;
}

export async function logoutRequest(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}