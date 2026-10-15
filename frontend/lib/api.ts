const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  rol: "Administrador" | "Analista" | "Tecnico";
  cargo?: string | null;
}

export interface Cliente {
  id_cliente: number;
  nit: string;
  nombre_empresa: string;
  nombre_responsable: string;
  ciudad: string | null;
  direccion: string | null;
  correo: string | null;
  telefono: string | null;
  fecha_registro: string;
}

export interface ClienteInput {
  nit: string;
  nombre_empresa: string;
  nombre_responsable: string;
  ciudad: string | null;
  direccion: string | null;
  correo: string | null;
  telefono: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // para que viaje la cookie httpOnly
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = Array.isArray(data?.message)
      ? data.message.join(". ")
      : (data?.message ?? "Ocurrió un error inesperado");
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

/* ---------- Auth ---------- */

export async function loginRequest(correo: string, password: string): Promise<Usuario> {
  const data = await apiFetch<{ usuario: Usuario }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ correo, password }),
  });
  return data.usuario;
}

export async function logoutRequest(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}

/* ---------- Clientes ---------- */

export function listClientes(search = ""): Promise<Cliente[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<Cliente[]>(`/clientes${qs}`);
}

export function createCliente(input: ClienteInput): Promise<Cliente> {
  return apiFetch<Cliente>("/clientes", { method: "POST", body: JSON.stringify(input) });
}

export function updateCliente(id: number, input: ClienteInput): Promise<Cliente> {
  return apiFetch<Cliente>(`/clientes/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteCliente(id: number): Promise<Cliente> {
  return apiFetch<Cliente>(`/clientes/${id}`, { method: "DELETE" });
}
/* ---------- Catálogo ---------- */

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}
export interface CategoriaInput {
  nombre_categoria: string;
}

export interface Norma {
  id_norma: number;
  id_categoria: number;
  nombre_norma: string;
  descripcion: string | null;
  activo: boolean;
  categoria?: Categoria;
}
export interface NormaInput {
  id_categoria: number;
  nombre_norma: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Analisis {
  id_analisis: number;
  nombre_analisis: string;
  descripcion: string | null;
  metodo_referencia: string | null;
  unidad_medida_defecto: string | null;
  activo: boolean;
}
export interface AnalisisInput {
  nombre_analisis: string;
  descripcion: string | null;
  metodo_referencia: string | null;
  unidad_medida_defecto: string | null;
  activo: boolean;
}

export interface NormaAnalisis {
  id_norma_analisis: number;
  id_norma: number;
  id_analisis: number;
  tecnica_defecto: string | null;
  valor_referencia_defecto: string | null;
  analisis: Analisis;
}
export interface NormaAnalisisInput {
  tecnica_defecto: string | null;
  valor_referencia_defecto: string | null;
}

export interface Crud<T, I> {
  list(): Promise<T[]>;
  create(input: I): Promise<T>;
  update(id: number, input: Partial<I>): Promise<T>;
  remove(id: number): Promise<T>;
}

function crud<T, I>(base: string): Crud<T, I> {
  return {
    list: () => apiFetch<T[]>(base),
    create: (input) => apiFetch<T>(base, { method: "POST", body: JSON.stringify(input) }),
    update: (id, input) =>
      apiFetch<T>(`${base}/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id) => apiFetch<T>(`${base}/${id}`, { method: "DELETE" }),
  };
}

export const categoriasApi = crud<Categoria, CategoriaInput>("/catalogo/categorias");
export const normasApi = crud<Norma, NormaInput>("/catalogo/normas");
export const analisisApi = crud<Analisis, AnalisisInput>("/catalogo/analisis");

export function listNormaAnalisis(idNorma: number): Promise<NormaAnalisis[]> {
  return apiFetch<NormaAnalisis[]>(`/catalogo/normas/${idNorma}/analisis`);
}

export function addNormaAnalisis(
  idNorma: number,
  input: NormaAnalisisInput & { id_analisis: number },
): Promise<NormaAnalisis> {
  return apiFetch<NormaAnalisis>(`/catalogo/normas/${idNorma}/analisis`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateNormaAnalisis(id: number, input: NormaAnalisisInput): Promise<NormaAnalisis> {
  return apiFetch<NormaAnalisis>(`/catalogo/norma-analisis/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function removeNormaAnalisis(id: number): Promise<NormaAnalisis> {
  return apiFetch<NormaAnalisis>(`/catalogo/norma-analisis/${id}`, { method: "DELETE" });
}