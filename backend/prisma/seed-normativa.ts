import { PrismaClient } from "@prisma/client";
import * as path from "path";
import { parsearNormativa } from "./normativa-parser";

const prisma = new PrismaClient();
const EXCEL = path.join(__dirname, "data", "Normativa_1407.xlsx");
// Con --actualizar también se corrigen las normas y asignaciones que ya existían
const ACTUALIZAR = process.argv.includes("--actualizar");

export async function main() {
  const r = parsearNormativa(EXCEL);

  // 1. Categorías
  const idCategoria = new Map<string, number>();
  for (const nombre of [...new Set(r.bloques.map((b) => b.categoria))]) {
    const cat = await prisma.categoria_Matriz.upsert({
      where: { nombre_categoria: nombre },
      update: {},
      create: { nombre_categoria: nombre },
    });
    idCategoria.set(nombre, cat.id_categoria);
  }

  // 2. Análisis
  const idAnalisis = new Map<string, number>();
  for (const nombre of [...new Set(r.bloques.flatMap((b) => b.filas.map((f) => f.analisis)))].sort()) {
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

  for (const b of r.bloques) {
    let norma = await prisma.norma.findFirst({ where: { nombre_norma: { startsWith: b.clave } } });
    const datos = {
      id_categoria: idCategoria.get(b.categoria)!,
      nombre_norma: b.nombre,
      descripcion: b.descripcion,
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

    for (const f of b.filas) {
      const id_analisis = idAnalisis.get(f.analisis)!;
      const existente = await prisma.norma_Analisis.findUnique({
        where: { id_norma_id_analisis: { id_norma: norma.id_norma, id_analisis } },
      });
      const valores = { tecnica_defecto: f.tecnica, valor_referencia_defecto: f.valorReferencia };

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
  console.log(`\n=== Normativa cargada${ACTUALIZAR ? " (modo --actualizar)" : ""} ===`);
  console.log(`Normas: ${normasNuevas} nuevas, ${normasActualizadas} actualizadas, ${normasSinCambio} sin tocar`);
  console.log(`Análisis por norma: ${asignNuevas} nuevos, ${asignActualizadas} actualizados, ${asignSinCambio} sin tocar`);

  if (r.omitidos.length) {
    console.log("\n=== NO cargado ===");
    r.omitidos.forEach((o) => console.log(` - ${o.producto} (filas ${o.filas}): ${o.motivo}`));
  }
  if (r.porConfirmar.size) {
    console.log("\n=== Técnicas por confirmar con el laboratorio (se cargaron como venían) ===");
    for (const [k, v] of r.porConfirmar) console.log(` - ${k} (${v.veces} filas): ${v.motivo}`);
  }
  if (r.avisos.length) {
    console.log("\n=== Avisos ===");
    r.avisos.forEach((a) => console.log(" - " + a));
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