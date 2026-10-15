import * as XLSX from "xlsx";

/* ---------- Tipos ---------- */

export interface FilaNorma {
  fila: number; // número de fila en el Excel (para ubicar errores)
  analisis: string; // nombre canónico del análisis
  analisisOriginal: string;
  tecnica: string | null;
  valorReferencia: string | null;
}

export interface BloqueNorma {
  item: string; // "1,4"
  capitulo: number; // 1
  producto: string;
  filas: FilaNorma[];
}

export interface Omitido {
  producto: string;
  norma: string;
  filas: string; // "519-521, 551-552"
  motivo: string;
}

export interface ResultadoParser {
  bloques: BloqueNorma[];
  omitidos: Omitido[];
  avisos: string[];
  metodosSospechosos: Map<string, { motivo: string; veces: number }>;
}

/* ---------- Nombres de categoría por capítulo (inferidos de los productos) ---------- */

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

function formatearBase(base: string | null): string | null {
  if (!base) return null;
  return base.replace(/^(\d+)\s*(ml|g)$/i, "$1 $2").replace(/\bml\b/i, "mL");
}

/** Arma el texto del valor de referencia, p. ej. "M: 1000 UFC/g o mL" o "Ausencia/25 g o mL". */
function formatearValor(
  tipo: string | null,
  valor: string | null,
  unidad: string | null,
  base: string | null,
): string | null {
  if (!valor && !tipo) return null;
  if ((valor ?? "").toLowerCase().startsWith("ausencia") || (tipo ?? "").toLowerCase().startsWith("ausencia")) {
    return valor && valor.toLowerCase().startsWith("ausencia") ? valor : tipo;
  }
  if (!valor) return null;
  const u = unidad && unidad.toLowerCase() !== "no aplica" ? unidad : null;
  const b = formatearBase(base);
  const medida = [u, b].filter(Boolean).join("/");
  return `${tipo ? tipo + ": " : ""}${valor}${medida ? " " + medida : ""}`.trim();
}

function limpiarMetodo(m: string | null): string | null {
  if (!m) return null;
  return m.replace(/[.,;\s]+$/g, "").trim() || null;
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

/* ---------- Parser ---------- */

export function parsearNormativa(rutaExcel: string): ResultadoParser {
  const wb = XLSX.readFile(rutaExcel);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rango = XLSX.utils.decode_range(ws["!ref"] as string);
  rango.s.r = 0; // forzar que el índice 0 sea la fila 1 del Excel
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

  // Las filas 1-4 son encabezados; los datos empiezan en la fila 5 (índice 4)
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

  // Agrupar por producto + norma (en el orden en que aparecen)
  const grupos = new Map<string, Cruda[]>();
  for (const r of crudas) {
    const clave = `${r.producto}||${r.norma}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave)!.push(r);
  }

  const bloques: BloqueNorma[] = [];
  const omitidos: Omitido[] = [];
  const avisos: string[] = [];
  const metodosSospechosos = new Map<string, { motivo: string; veces: number }>();
  const itemsVistos = new Set<string>();

  const marcarMetodo = (m: string | null) => {
    if (!m) return;
    let motivo: string | null = null;
    if (/NTC 4458:\d{5}/.test(m)) motivo = "año de 5 dígitos (¿error de digitación?)";
    else if (/ISO\s*\d{6,}/.test(m)) motivo = "número de ISO que parece mal escrito";
    else if (/^remitir/i.test(m)) motivo = "dice 'Remitir' (¿se envía a otro laboratorio?)";
    else if (/AOC\b/.test(m)) motivo = "dice 'AOC' (¿AOAC?)";
    if (!motivo) return;
    const previo = metodosSospechosos.get(m);
    metodosSospechosos.set(m, { motivo, veces: (previo?.veces ?? 0) + 1 });
  };

  for (const filas of grupos.values()) {
    const { producto: prod, norma: nor } = filas[0];
    const detalleFilas = rangos(filas.map((x) => x.fila));

    const m = /^resolucion\s+1407.*item\s*([\d,]+)/i.exec(nor);
    if (!m) {
      let motivo = "Norma no reconocida";
      if (/^resolucion\s+1215/i.test(nor)) motivo = "Agua potable (dice Resolución 1215): confirmar con el laboratorio";
      else if (/sugerid|suguerid/i.test(nor)) motivo = "Marcado como 'Sugerido' (borrador con datos por revisar)";
      omitidos.push({ producto: prod, norma: nor, filas: detalleFilas, motivo });
      continue;
    }

    const item = m[1];
    if (itemsVistos.has(item)) {
      omitidos.push({
        producto: prod,
        norma: nor,
        filas: detalleFilas,
        motivo: `El ítem ${item} ya se cargó con otro producto`,
      });
      continue;
    }
    itemsVistos.add(item);

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

      let metodo = limpiarMetodo(r.metodo);
      if (metodo && /podria ser/i.test(metodo)) {
        avisos.push(`Fila ${r.fila} (${prod}): el método dice "${metodo}", se deja vacío`);
        metodo = null;
      }
      if (!metodo) avisos.push(`Fila ${r.fila} (${prod} · ${canon}): sin método`);
      marcarMetodo(metodo);

      // El método de la fila F.M (filtración por membrana) se conserva en la técnica
      if (metodo && /\bF\.?M\b/i.test(r.analisis)) metodo = `${metodo} (F.M)`;

      const valor = formatearValor(r.tipo, r.valor, r.unidad, r.base);
      if (!valor) avisos.push(`Fila ${r.fila} (${prod} · ${canon}): sin valor de referencia`);
      else if (!r.tipo) avisos.push(`Fila ${r.fila} (${prod} · ${canon}): el valor no trae tipo M/m`);

      filasLimpias.push({
        fila: r.fila,
        analisis: canon,
        analisisOriginal: r.analisis,
        tecnica: metodo,
        valorReferencia: valor,
      });
    }

    bloques.push({
      item,
      capitulo: parseInt(item.split(",")[0], 10),
      producto: prod,
      filas: filasLimpias,
    });
  }

  return { bloques, omitidos, avisos, metodosSospechosos };
}