import { PrismaClient } from "@prisma/client";
import * as path from "path";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();
const EXCEL = path.join(__dirname, "data", "Catalogo_normas.xlsx");
// Con --actualizar también se corrigen las normas y asignaciones que ya existían
const ACTUALIZAR = process.argv.includes("--actualizar");

interface Fila {
  excelFila: number;
  categoria: string;
  clave: string;
  norma: string;
  descripcion: string | null;
  analisis: string;
  tecnica: string | null;
  valor: string | null;
  observacion: string | null;
}

function texto(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s+/g, " ").trim();
  return s === "" ? null : s;
}

function leerExcel(): Fila[] {
  const wb = XLSX.readFile(EXCEL);
  const ws = wb.Sheets["Catalogo"] ?? wb.Sheets[wb.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
  const errores: string[] = [];
  const resultado: Fila[] = [];

  filas.forEach((f, i) => {
    const n = i + 2; // fila en el Excel (la 1 es el encabezado)
    const analisis = texto(f["Análisis"]);
    if (!analisis) return;
    const fila: Fila = {
      excelFila: n,
      categoria: texto(f["Categoría"]) ?? "",
      clave: texto(f["Clave"]) ?? "",
      norma: texto(f["Norma"]) ?? "",
      descripcion: texto(f["Descripción"]),
      analisis,
      tecnica: texto(f["Técnica"]),
      valor: texto(f["Valor de referencia"]),
      observacion: texto(f["Observación"]),
    };
    if (!fila.categoria || !fila.clave || !fila.norma) errores.push(`Fila ${n}: falta categoría, clave o norma`);
    if (fila.norma.length > 150) errores.push(`Fila ${n}: el nombre de la norma pasa de 150 caracteres`);
    if ((fila.tecnica ?? "").length > 150) errores.push(`Fila ${n}: la técnica pasa de 150 caracteres`);
    if ((fila.valor ?? "").length > 100) errores.push(`Fila ${n}: el valor de referencia pasa de 100 caracteres`);
    resultado.push(fila);
  });

  if (errores.length) throw new Error("Hay filas con problemas en el Excel:\n" + errores.join("\n"));
  return resultado;
}

export async function main() {
  const filas = leerExcel();

  // Agrupar por norma, en el orden del Excel
  const normas = new Map<string, Fila[]>();
  for (const f of filas) {
    if (!normas.has(f.clave)) normas.set(f.clave, []);
    normas.get(f.clave)!.push(f);
  }

  // 0. Limpieza: la versión anterior creó "Ambientes de proceso – criterio definido por el cliente"
  //    y ahora los ambientes van por la NTC 5230:2017
  const viejas = await prisma.norma.findMany({ where: { nombre_norma: { startsWith: "Ambientes de proceso – " } } });
  for (const v of viejas) {
    try {
      await prisma.norma_Analisis.deleteMany({ where: { id_norma: v.id_norma } });
      await prisma.norma.delete({ where: { id_norma: v.id_norma } });
      console.log(`Se eliminó la norma anterior: ${v.nombre_norma}`);
    } catch {
      console.log(`No se pudo eliminar "${v.nombre_norma}" (tiene datos asociados); bórrala desde Catálogo`);
    }
  }

  // 1. Categorías
  const idCategoria = new Map<string, number>();
  for (const nombre of new Set(filas.map((f) => f.categoria))) {
    const cat = await prisma.categoria_Matriz.upsert({
      where: { nombre_categoria: nombre },
      update: {},
      create: { nombre_categoria: nombre },
    });
    idCategoria.set(nombre, cat.id_categoria);
  }

  // 2. Análisis
  const idAnalisis = new Map<string, number>();
  for (const nombre of [...new Set(filas.map((f) => f.analisis))].sort()) {
    const a = await prisma.analisis.upsert({
      where: { nombre_analisis: nombre },
      update: {},
      create: { nombre_analisis: nombre },
    });
    idAnalisis.set(nombre, a.id_analisis);
  }

  // 3. Normas y sus análisis
  let normasNuevas = 0;
  let normasActualizadas = 0;
  let normasSinCambio = 0;
  let asignNuevas = 0;
  let asignActualizadas = 0;
  let asignSinCambio = 0;

  for (const [clave, grupo] of normas) {
    const base = grupo[0];
    let norma = await prisma.norma.findFirst({ where: { nombre_norma: { startsWith: clave } } });
    const datos = {
      id_categoria: idCategoria.get(base.categoria)!,
      nombre_norma: base.norma,
      descripcion: base.descripcion,
    };

    if (!norma) {
      norma = await prisma.norma.create({ data: { ...datos, activo: true } });
      normasNuevas++;
    } else if (ACTUALIZAR) {
      norma = await prisma.norma.update({ where: { id_norma: norma.id_norma }, data: datos });
      normasActualizadas++;
    } else {
      normasSinCambio++;
    }

    for (const f of grupo) {
      const id_analisis = idAnalisis.get(f.analisis)!;
      const existente = await prisma.norma_Analisis.findUnique({
        where: { id_norma_id_analisis: { id_norma: norma.id_norma, id_analisis } },
      });
      const valores = { tecnica_defecto: f.tecnica, valor_referencia_defecto: f.valor };

      if (!existente) {
        await prisma.norma_Analisis.create({ data: { id_norma: norma.id_norma, id_analisis, ...valores } });
        asignNuevas++;
      } else if (ACTUALIZAR) {
        await prisma.norma_Analisis.update({ where: { id_norma_analisis: existente.id_norma_analisis }, data: valores });
        asignActualizadas++;
      } else {
        asignSinCambio++;
      }
    }
  }

  // 4. Resumen
  console.log(`\n=== Catálogo cargado${ACTUALIZAR ? " (modo --actualizar)" : ""} ===`);
  console.log(`Normas: ${normasNuevas} nuevas, ${normasActualizadas} actualizadas, ${normasSinCambio} sin tocar`);
  console.log(`Análisis por norma: ${asignNuevas} nuevos, ${asignActualizadas} actualizados, ${asignSinCambio} sin tocar`);

  const conObs = filas.filter((f) => f.observacion);
  if (conObs.length) {
    console.log(`\n=== ${conObs.length} filas con observación (columna "Observación" del Excel) ===`);
    const conteo = new Map<string, number>();
    conObs.forEach((f) => conteo.set(f.observacion!, (conteo.get(f.observacion!) ?? 0) + 1));
    for (const [o, n] of conteo) console.log(` - ${n} × ${o}`);
  }

  const catsSinUso = await prisma.categoria_Matriz.findMany({ where: { normas: { none: {} } } });
  const anaSinUso = await prisma.analisis.findMany({ where: { normas: { none: {} }, resultados: { none: {} } } });
  if (catsSinUso.length || anaSinUso.length) {
    console.log("\n=== Sin uso (puedes borrarlos desde Catálogo si no los necesitas) ===");
    if (catsSinUso.length) console.log(" Categorías: " + catsSinUso.map((c) => c.nombre_categoria).join("; "));
    if (anaSinUso.length) console.log(" Análisis: " + anaSinUso.map((a) => a.nombre_analisis).join("; "));
  }
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}