import type { Condiciones } from "./conteos";
import type { Acta } from "./acta";

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

/* ---------- Sets de muestra y muestras ---------- */

export type EstadoSet = "Registrado" | "En_Proceso" | "Finalizado" | "Firmado";

export interface SetResumen {
  id_set_muestra: number;
  codigo_set: string;
  estado_set: EstadoSet;
  acreditado_onac: boolean;
  fecha_hora_recepcion: string | null;
  fecha_estimada_reporte: string | null;
  causa_analisis: string | null;
  cliente: { id_cliente: number; nombre_empresa: string };
  _count: { muestras: number };
}

export interface MuestraItem {
  id_muestra: number;
  id_set_muestra: number;
  id_norma: number;
  codigo_muestra: string;
  nombre_muestra: string;
  proveedor_manipulador: string | null;
  cantidad: string | null;
  tipo_matriz: string | null;
  punto_muestreo: string | null;
  tecnica_muestreo: string | null;
  temp_toma: string | null;
  temp_recepcion: string | null;
  lote: string | null;
  fecha_produccion: string | null;
  fecha_vencimiento: string | null;
  estado_fisico: string | null;
  norma: { id_norma: number; nombre_norma: string };
  _count: { resultados: number };
  resultados?: {
    id_resultado: number;
    resultado_final: string | null;
    metodo_utilizado: string | null;
    fecha_analisis?: string | null;
    lote_medios_cultivo?: string | null;
    analisis: { nombre_analisis: string };
  }[];
}

export interface SetDetalle {
  id_set_muestra: number;
  codigo_set: string;
  id_cliente: number;
  solicitante: string | null;
  causa_analisis: string | null;
  responsable_toma: string | null;
  lugar_toma: string | null;
  direccion_muestreo: string | null;
  fecha_hora_toma: string | null;
  fecha_hora_recepcion: string | null;
  fecha_estimada_reporte: string | null;
  estado_set: EstadoSet;
  acreditado_onac: boolean;
  cliente: Cliente;
  usuarioRecepcion: { id_usuario: number; nombre_completo: string };
  muestras: MuestraItem[];
  acta: Acta | null;
  condiciones_analisis: Condiciones | null;
}

export interface SetInput {
  id_cliente: number;
  solicitante: string | null;
  causa_analisis: string | null;
  responsable_toma: string | null;
  lugar_toma: string | null;
  direccion_muestreo: string | null;
  fecha_hora_toma: string | null;
  fecha_hora_recepcion: string | null;
  fecha_estimada_reporte: string | null;
  acreditado_onac: boolean;
}

export interface MuestraInput {
  id_norma: number;
  nombre_muestra: string;
  proveedor_manipulador: string | null;
  cantidad: string | null;
  tipo_matriz: string | null;
  punto_muestreo: string | null;
  tecnica_muestreo: string | null;
  temp_toma: string | null;
  temp_recepcion: string | null;
  lote: string | null;
  fecha_produccion: string | null;
  fecha_vencimiento: string | null;
  estado_fisico: string | null;
}

export function listSets(search = "", estado = ""): Promise<SetResumen[]> {
  const p = new URLSearchParams();
  if (search) p.set("search", search);
  if (estado) p.set("estado", estado);
  const qs = p.toString();
  return apiFetch<SetResumen[]>(`/sets${qs ? `?${qs}` : ""}`);
}

export function getSet(id: number): Promise<SetDetalle> {
  return apiFetch<SetDetalle>(`/sets/${id}`);
}

export function createSet(input: SetInput): Promise<{ id_set_muestra: number; codigo_set: string }> {
  return apiFetch(`/sets`, { method: "POST", body: JSON.stringify(input) });
}

export function updateSet(id: number, input: Partial<SetInput> & { estado_set?: EstadoSet }) {
  return apiFetch(`/sets/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteSet(id: number) {
  return apiFetch(`/sets/${id}`, { method: "DELETE" });
}

export function createMuestra(idSet: number, input: MuestraInput): Promise<MuestraItem> {
  return apiFetch<MuestraItem>(`/sets/${idSet}/muestras`, { method: "POST", body: JSON.stringify(input) });
}

export function updateMuestra(id: number, input: Omit<MuestraInput, "id_norma">): Promise<MuestraItem> {
  return apiFetch<MuestraItem>(`/muestras/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteMuestra(id: number) {
  return apiFetch(`/muestras/${id}`, { method: "DELETE" });
}

/* ---------- Resultados ---------- */

export interface ResultadoFila {
  id_resultado: number;
  id_analisis: number;
  analisis: { nombre_analisis: string };
  metodo_utilizado: string | null;
  valor_referencia: string | null;
  resultado_final: string | null;
  unidad_medida: string | null;
  tecnica: string | null;
  incertidumbre: string | null;
  acreditado: boolean;
  fecha_analisis: string | null;
  concepto: string | null;
  lote_medios_cultivo: string | null;
}

export interface ResultadosMuestra {
  id_muestra: number;
  codigo_muestra: string;
  nombre_muestra: string;
  tipo_matriz: string | null;
  lote: string | null;
  norma: { id_norma: number; nombre_norma: string };
  set: {
    id_set_muestra: number;
    codigo_set: string;
    estado_set: EstadoSet;
    fecha_hora_toma: string | null;
    fecha_hora_recepcion: string | null;
    cliente: { nombre_empresa: string; nit: string };
  };
  resultados: ResultadoFila[];
}

export interface ResultadoGuardar {
  id_resultado: number;
  resultado_final: string | null;
  unidad_medida: string | null;
  tecnica: string | null;
  incertidumbre: string | null;
  acreditado: boolean;
  fecha_analisis: string | null;
  concepto: string | null;
}

export function getResultados(idMuestra: number): Promise<ResultadosMuestra> {
  return apiFetch<ResultadosMuestra>(`/muestras/${idMuestra}/resultados`);
}

export function saveResultados(
  idMuestra: number,
  body: { lote_medios_cultivo: string | null; resultados: ResultadoGuardar[] },
): Promise<ResultadosMuestra> {
  return apiFetch<ResultadosMuestra>(`/muestras/${idMuestra}/resultados`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/* ---------- Informe (F-12) ---------- */

export interface Firmante {
  id_usuario: number;
  nombre_completo: string;
  cargo: string | null;
  rol: Usuario["rol"];
}

type UsuarioFirma = { id_usuario: number; nombre_completo: string; cargo: string | null };

export interface InformeMuestra {
  id_muestra: number;
  codigo_muestra: string;
  nombre_muestra: string;
  tipo_matriz: string | null;
  cantidad: string | null;
  lote: string | null;
  fecha_produccion: string | null;
  fecha_vencimiento: string | null;
  temp_toma: string | null;
  temp_recepcion: string | null;
  numero_informe: string | null;
  fecha_emision: string | null;
  observaciones_tecnicas: string | null;
  usuarioElabora: UsuarioFirma | null;
  usuarioAutoriza: UsuarioFirma | null;
  norma: { id_norma: number; nombre_norma: string };
  set: {
    id_set_muestra: number;
    codigo_set: string;
    solicitante: string | null;
    causa_analisis: string | null;
    responsable_toma: string | null;
    fecha_hora_toma: string | null;
    fecha_hora_recepcion: string | null;
    cliente: Cliente;
  };
  resultados: ResultadoFila[];
}

export interface InformeInput {
  numero_informe: string | null;
  observaciones_tecnicas: string | null;
  id_usuario_elabora?: number | null;
  id_usuario_autoriza: number | null;
  fecha_emision: string | null;
}

export function getInforme(idMuestra: number): Promise<InformeMuestra> {
  return apiFetch<InformeMuestra>(`/muestras/${idMuestra}/informe`);
}

export function saveInforme(idMuestra: number, input: InformeInput): Promise<InformeMuestra> {
  return apiFetch<InformeMuestra>(`/muestras/${idMuestra}/informe`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function listFirmantes(): Promise<Firmante[]> {
  return apiFetch<Firmante[]>(`/firmantes`);
}

/* ---------- Usuarios ---------- */

export interface UsuarioAdmin {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  cargo: string | null;
  rol: Usuario["rol"];
  activo: boolean;
  fecha_creacion: string;
}

export interface UsuarioCrear {
  nombre_completo: string;
  correo: string;
  cargo: string | null;
  rol: Usuario["rol"];
  password: string;
}

export interface UsuarioActualizar {
  nombre_completo: string;
  correo: string;
  cargo: string | null;
  rol: Usuario["rol"];
  activo: boolean;
  password?: string;
}

export function listUsuarios(): Promise<UsuarioAdmin[]> {
  return apiFetch<UsuarioAdmin[]>(`/usuarios`);
}

export function createUsuario(input: UsuarioCrear): Promise<UsuarioAdmin> {
  return apiFetch<UsuarioAdmin>(`/usuarios`, { method: "POST", body: JSON.stringify(input) });
}

export function updateUsuario(id: number, input: Partial<UsuarioActualizar>): Promise<UsuarioAdmin> {
  return apiFetch<UsuarioAdmin>(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function cambiarPassword(actual: string, nueva: string): Promise<{ message: string }> {
  return apiFetch(`/usuarios/yo/password`, { method: "POST", body: JSON.stringify({ actual, nueva }) });
}
export function saveActa(idSet: number, acta: Acta): Promise<SetDetalle> {
  return apiFetch<SetDetalle>(`/sets/${idSet}/acta`, { method: "PUT", body: JSON.stringify({ acta }) });
}
export function saveCondiciones(idSet: number, condiciones: Condiciones): Promise<SetDetalle> {
  return apiFetch<SetDetalle>(`/sets/${idSet}/condiciones`, {
    method: "PUT",
    body: JSON.stringify({ condiciones }),
  });
}
/* ---------- Resumen del panel de inicio ---------- */

export interface ResumenMuestra {
  id_muestra: number;
  codigo_muestra: string;
  nombre_muestra: string;
  faltan?: number;
  total: number;
  set: {
    id_set_muestra: number;
    codigo_set: string;
    fecha_estimada_reporte: string | null;
    cliente: { nombre_empresa: string };
  };
}

export interface Resumen {
  porEstado: Record<EstadoSet, number>;
  clientes: number;
  muestras: number;
  totalPendientes: number;
  pendientes: ResumenMuestra[];
  totalListas: number;
  listas: ResumenMuestra[];
  proximos: {
    id_set_muestra: number;
    codigo_set: string;
    estado_set: EstadoSet;
    fecha_estimada_reporte: string | null;
    cliente: { nombre_empresa: string };
    _count: { muestras: number };
  }[];
}

export function getResumen(): Promise<Resumen> {
  return apiFetch<Resumen>(`/resumen`);
}