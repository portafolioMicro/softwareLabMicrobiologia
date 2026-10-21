import * as XLSX from "xlsx";

export const TECNICA_REMITIDA = "Se remite a otro laboratorio";
export const SEGUN_CLIENTE = "Según criterio del cliente";
const MAX_NOMBRE = 150; // límite de la columna nombre_norma

/* ---------- Tipos ---------- */

export interface FilaNorma {
  fila: number; // fila del Excel (para ubicar errores)
  analisis: string; // nombre unificado del análisis
  tecnica: string | null;
  valorReferencia: string | null;
}

export interface BloqueNorma {
  clave: string; // prefijo único para reconocer la norma en la base
  nombre: string; // nombre_norma
  categoria: string;
  descripcion: string;
  filas: FilaNorma[];
}

export interface Omitido {
  producto: string;
  filas: string;
  motivo: string;
}

export interface ResultadoParser {
  bloques: BloqueNorma[];
  omitidos: Omitido[];
  avisos: string[];
  porConfirmar: Map<string, { motivo: string; veces: number }>;
}

/* ---------- Categorías (capítulos de la Resolución 1407, nombres inferidos) ---------- */

export const CATEGORIA_POR_CAPITULO: Record<number, string> = {
  1: "Productos lácteos",
  2: "Helados",
  3: "Grasas y margarinas",
  4: "Aguas y bebidas",
  5: "Frutas, hortalizas y derivados",
  6: "Confitería, cacao y chocolate",
  7: "Cereales, harinas y leguminosas",
  8: "Panadería y galletería",
  9: "Productos de la pesca",
  10: "Huevos y ovoproductos",
  11: "Azúcares, miel y jarabes",
  12: "Condimentos, salsas y aderezos",
  13: "Sopas, caldos y mezclas en polvo",
  14: "Comidas y postres preparados",
  15: "Alimentos infantiles",
};

/* ---------- Utilidades ---------- */

function limpiar(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s+/g, " ").trim();
  return s === "" ? null : s;
}

/** Une los análisis que vienen escritos de varias formas en el Excel. */
export function nombreCanonico(original: string): string | null {
  const t = original
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const reglas: [RegExp, string][] = [
    [/salmonella/, "Salmonella spp."],
    [/\be\.?\s?coli\b|escherichia/, "Escherichia coli"],
    [/listeria/, "Listeria monocytogenes"],
    [/staphylococcus/, "Staphylococcus coagulasa positiva"],
    [/bacillus/, "Bacillus cereus"],
    [/enterobacteria/, "Enterobacterias"],
    [/pseudomonas/, "Pseudomonas aeruginosa"],
    [/parahemolyticus/, "Vibrio parahaemolyticus"],
    [/cholerae/, "Vibrio cholerae O1"],
    [/cronobacter/, "Cronobacter spp."],
    [/lactic/, "Bacterias ácido lácticas"],
    [/clostridium|espora/, "Clostridium sulfito reductor"],
    [/fecales/, "Coliformes fecales"],
    [/coliformes/, "Coliformes"],
    [/mesofilos/, "Aerobios mesófilos"],
    [/mohos/, "Mohos"],
    [/levaduras/, "Levaduras"],
  ];

  for (const [re, nombre] of reglas) if (re.test(t)) return nombre;
  return null;
}

/** Análisis que el laboratorio no hace y envía a otro laboratorio (confirmado por ellos). */
const REMITIDOS = new Set([
  "Clostridium sulfito reductor",
  "Vibrio parahaemolyticus",
  "Vibrio cholerae O1",
  "Cronobacter spp.",
  "Bacterias ácido lácticas",
]);

/** Técnica según la tabla Método → Técnica que envió el laboratorio (Hoja2). */
function tecnicaOficial(analisis: string, tecnicaFila: string | null, original: string): string | null {
  const fm = /\bF\.?M\b/i.test(original);
  const conFM = (t: string) => (fm ? `${t} (F.M)` : t);

  if (REMITIDOS.has(analisis)) return TECNICA_REMITIDA;

  switch (analisis) {
    case "Staphylococcus coagulasa positiva":
      return "ISO 6888-1:2021";
    case "Mohos":
    case "Levaduras":
      return "ISO 21527-2:2008";
    case "Bacillus cereus":
    case "Enterobacterias":
      return "ICMSF Vol. 1, 2.ª edición";
    case "Coliformes":
    case "Escherichia coli":
      return tecnicaFila && /ISO\s*9308/i.test(tecnicaFila) ? conFM("ISO 9308-1:2014") : "NTC 4458:2018";
    case "Aerobios mesófilos":
      return tecnicaFila && /SM\.?\s*9215/i.test(tecnicaFila) ? conFM("SM 9215 D") : "AOAC 966.23:2005";
    default:
      return tecnicaFila ? conFM(tecnicaFila) : null; // Salmonella, Listeria, Pseudomonas: tal como vienen
  }
}

function formatearBase(base: string | null): string | null {
  if (!base) return null;
  return base.replace(/^(\d+)\s*(ml|g)$/i, "$1 $2").replace(/\bml\b/i, "mL");
}

/** Arma el texto del valor, p. ej. "M: 1000 UFC/g o mL" o "Ausencia/25 g o mL". */
function formatearValor(
  tipo: string | null,
  valor: string | null,
  unidad: string | null,
  base: string | null,
): string | null {
  if (!valor && !tipo) return null;
  const esAusencia = (s: string | null) => (s ?? "").toLowerCase().startsWith("ausencia");
  if (esAusencia(valor) || esAusencia(tipo)) return esAusencia(valor) ? valor : tipo;
  if (!valor) return null;
  const t = tipo ?? (valor.startsWith("<") ? "m" : null); // "<10" sin letra: la norma no permite presencia → m
  const u = unidad && unidad.toLowerCase() !== "no aplica" ? unidad : null;
  const medida = [u, formatearBase(base)].filter(Boolean).join("/");
  return `${t ? t + ": " : ""}${valor}${medida ? " " + medida : ""}`.trim();
}

function rangos(filas: number[]): string {
  const orden = [...new Set(filas)].sort((a, b) => a - b);
  const partes: string[] = [];
  let ini = orden[0];
  let prev = orden[0];
  for (let i = 1; i <= orden.length; i++) {
    const n = orden[i];
    if (n !== prev + 1) {
      partes.push(ini === prev ? `${ini}` : `${ini}-${prev}`);
      ini = n;
    }
    prev = n;
  }
  return partes.join(", ");
}

function recortar(texto: string) {
  return texto.length <= MAX_NOMBRE ? texto : texto.slice(0, MAX_NOMBRE - 1).trimEnd() + "…";
}

/* ---------- Parser ---------- */

export function parsearNormativa(rutaExcel: string): ResultadoParser {
  const wb = XLSX.readFile(rutaExcel);
  const ws = wb.Sheets[wb.SheetNames[0]]; // Hoja1
  const rango = XLSX.utils.decode_range(ws["!ref"] as string);
  rango.s.r = 0; // el índice 0 del arreglo es la fila 1 del Excel
  rango.s.c = 0;
  const matriz = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null, raw: true, range: rango });

  // Columnas (A=0): A producto · C norma · E análisis · G método · H tipo · I valor · J unidad · K base
  type Cruda = {
    fila: number;
    producto: string;
    norma: string;
    analisis: string | null;
    metodo: string | null;
    tipo: string | null;
    valor: string | null;
    unidad: string | null;
    base: string | null;
  };

  const crudas: Cruda[] = [];
  let producto: string | null = null;
  let norma: string | null = null;

  for (let i = 4; i < matriz.length; i++) {
    const f = matriz[i] ?? [];
    const a = limpiar(f[0]);
    const c = limpiar(f[2]);
    if (a) producto = a; // las celdas combinadas solo traen el valor en la primera fila
    if (c) norma = c;

    const e = limpiar(f[4]);
    const g = limpiar(f[6]);
    const h = limpiar(f[7]);
    const iv = limpiar(f[8]);
    const j = limpiar(f[9]);
    const k = limpiar(f[10]);
    if (!e && !g && !h && !iv && !j && !k) continue;

    crudas.push({
      fila: i + 1,
      producto: producto ?? "(sin producto)",
      norma: norma ?? "(sin norma)",
      analisis: e,
      metodo: g,
      tipo: h,
      valor: iv,
      unidad: j,
      base: k,
    });
  }

  const grupos = new Map<string, Cruda[]>();
  for (const r of crudas) {
    const clave = `${r.producto}||${r.norma}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave)!.push(r);
  }

  const bloques: BloqueNorma[] = [];
  const omitidos: Omitido[] = [];
  const avisos: string[] = [];
  const porConfirmar = new Map<string, { motivo: string; veces: number }>();
  const itemsVistos = new Set<string>();

  const marcar = (analisis: string, tecnica: string | null) => {
    if (!tecnica) return;
    let motivo: string | null = null;
    if (analisis === "Salmonella spp." && /ENMIENDA 1:2021/i.test(tecnica))
      motivo = "Salmonella: unas filas dicen Enmienda 1:2020 y otras 1:2021; la tabla del laboratorio dice solo ISO 6579:2017";
    else if (analisis === "Listeria monocytogenes" && /CHROMagar/i.test(tecnica))
      motivo = "Listeria: las filas traen CHROMagar, pero la tabla del laboratorio dice 'no se define técnica aún'";
    else if (analisis === "Pseudomonas aeruginosa")
      motivo = "Pseudomonas: filas con ISO 16266-2006; la tabla del laboratorio dice 'ISO 16266-2:20118'";
    if (!motivo) return;
    const clave = `${analisis} · ${tecnica}`;
    porConfirmar.set(clave, { motivo, veces: (porConfirmar.get(clave)?.veces ?? 0) + 1 });
  };

  for (const filas of grupos.values()) {
    const { producto: prod, norma: nor } = filas[0];
    const detalleFilas = rangos(filas.map((x) => x.fila));

    /* Decidir a qué norma pertenece el bloque */
    let clave: string;
    let nombre: string;
    let categoria: string;
    let descripcion: string;
    let valorFijo: string | null = null;

    const m1407 = /^resolucion\s+1407.*item\s*([\d,]+)/i.exec(nor);
    if (m1407) {
      const item = m1407[1];
      if (itemsVistos.has(item)) {
        omitidos.push({ producto: prod, filas: detalleFilas, motivo: `El ítem ${item} ya se cargó con otro producto (pendiente de aclarar)` });
        continue;
      }
      itemsVistos.add(item);
      clave = `Res. 1407/2022 Ítem ${item} – `;
      nombre = recortar(clave + prod);
      categoria = CATEGORIA_POR_CAPITULO[parseInt(item.split(",")[0], 10)];
      descripcion = `Resolución 1407 de 5 de agosto de 2022, ítem ${item}: ${prod}`;
    } else if (/^resolucion\s+1215/i.test(nor) && /agua potable/i.test(prod)) {
      // El laboratorio confirmó que es la Resolución 2115 de 2007
      clave = "Res. 2115/2007 – ";
      nombre = clave + "Agua potable";
      categoria = "Agua potable";
      descripcion = "Resolución 2115 de 2007: calidad del agua para consumo humano";
    } else if (/sugerid|suguerid/i.test(nor) && /^ambiente/i.test(prod)) {
      // El laboratorio confirmó que en ambientes los valores los define cada cliente
      clave = "Ambientes de proceso – ";
      nombre = clave + "criterio definido por el cliente";
      categoria = "Ambientes de proceso";
      descripcion = "Los límites los define cada cliente según su proceso; las técnicas son las del laboratorio";
      valorFijo = SEGUN_CLIENTE;
    } else {
      const motivo = /sugerid|suguerid/i.test(nor)
        ? "Pendiente: el laboratorio enviará la norma de referencia, el método y el valor límite"
        : "Norma no reconocida";
      omitidos.push({ producto: prod, filas: detalleFilas, motivo });
      continue;
    }

    /* Limpiar las filas del bloque */
    const vistos = new Set<string>();
    const filasLimpias: FilaNorma[] = [];

    for (const r of filas) {
      if (!r.analisis) {
        avisos.push(`Fila ${r.fila} (${prod}): sin nombre de análisis, se omite`);
        continue;
      }
      const canon = nombreCanonico(r.analisis);
      if (!canon) {
        avisos.push(`Fila ${r.fila} (${prod}): análisis no reconocido "${r.analisis}", se omite`);
        continue;
      }
      if (vistos.has(canon)) {
        avisos.push(`Fila ${r.fila} (${prod}): "${canon}" repetido en la misma norma, se usa el primero`);
        continue;
      }
      vistos.add(canon);

      const tecnica = tecnicaOficial(canon, r.metodo, r.analisis);
      marcar(canon, tecnica);

      const valor = valorFijo ?? formatearValor(r.tipo, r.valor, r.unidad, r.base);
      if (!valor) avisos.push(`Fila ${r.fila} (${prod} · ${canon}): sin valor de referencia`);

      filasLimpias.push({ fila: r.fila, analisis: canon, tecnica, valorReferencia: valor });
    }

    bloques.push({ clave, nombre, categoria, descripcion, filas: filasLimpias });
  }

  return { bloques, omitidos, avisos, porConfirmar };
}