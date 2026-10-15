import { PrismaClient } from "@prisma/client";
import * as path from "path";
import { CATEGORIA_POR_CAPITULO, parsearNormativa } from "./normativa-parser";

const prisma = new PrismaClient();
const EXCEL = path.join(__dirname, "data", "Normativa_1407.xlsx");
const MAX_NOMBRE = 150; // límite de la columna nombre_norma

function prefijoNorma(item: string) {
  return `Res. 1407/2022 Ítem ${item} – `;
}

function nombreNorma(item: string, producto: string) {
  const completo = prefijoNorma(item) + producto;
  return completo.length <= MAX_NOMBRE ? completo : completo.slice(0, MAX_NOMBRE - 1).trimEnd() + "…";
}

export async function main() {
  const r = parsearNormativa(EXCEL);

  // 1. Categorías (una por capítulo de la Resolución 1407)
  const idCategoria = new Map<number, number>();
  for (const cap of [...new Set(r.bloques.map((b) => b.capitulo))].sort((a, b) => a - b)) {
    const nombre = CATEGORIA_POR_CAPITULO[cap];
    const cat = await prisma.categoria_Matriz.upsert({
      where: { nombre_categoria: nombre },
      update: {},
      create: { nombre_categoria: nombre },
    });
    idCategoria.set(cap, cat.id_categoria);
  }

  // 2. Análisis (nombres ya unificados)
  const idAnalisis = new Map<string, number>();
  const nombresAnalisis = [...new Set(r.bloques.flatMap((b) => b.filas.map((f) => f.analisis)))].sort();
  for (const nombre of nombresAnalisis) {
    const a = await prisma.analisis.upsert({
      where: { nombre_analisis: nombre },
      update: {},
      create: { nombre_analisis: nombre },
    });
    idAnalisis.set(nombre, a.id_analisis);
  }

  // 3. Normas y sus análisis. Solo crea lo que falta: no pisa lo que ya editaste en la pantalla.
  let normasNuevas = 0;
  let normasExistentes = 0;
  let asignNuevas = 0;
  let asignExistentes = 0;

  for (const b of r.bloques) {
    let norma = await prisma.norma.findFirst({
      where: { nombre_norma: { startsWith: prefijoNorma(b.item) } },
    });

    if (norma) {
      normasExistentes++;
    } else {
      norma = await prisma.norma.create({
        data: {
          id_categoria: idCategoria.get(b.capitulo)!,
          nombre_norma: nombreNorma(b.item, b.producto),
          descripcion: `Resolución 1407 de 15 de agosto de 2022, ítem ${b.item}: ${b.producto}`,
          activo: true,
        },
      });
      normasNuevas++;
    }

    for (const f of b.filas) {
      const id_analisis = idAnalisis.get(f.analisis)!;
      const existente = await prisma.norma_Analisis.findUnique({
        where: { id_norma_id_analisis: { id_norma: norma.id_norma, id_analisis } },
      });
      if (existente) {
        asignExistentes++;
        continue;
      }
      await prisma.norma_Analisis.create({
        data: {
          id_norma: norma.id_norma,
          id_analisis,
          tecnica_defecto: f.tecnica,
          valor_referencia_defecto: f.valorReferencia,
        },
      });
      asignNuevas++;
    }
  }

  // 4. Resumen
  console.log("\n=== Normativa cargada ===");
  console.log(`Normas: ${normasNuevas} nuevas, ${normasExistentes} ya existían`);
  console.log(`Análisis asignados a normas: ${asignNuevas} nuevos, ${asignExistentes} ya existían`);

  if (r.omitidos.length) {
    console.log("\n=== NO cargado (revisar con el laboratorio) ===");
    for (const o of r.omitidos) {
      console.log(` - ${o.producto} (filas ${o.filas} del Excel): ${o.motivo}`);
    }
  }

  if (r.metodosSospechosos.size) {
    console.log("\n=== Métodos a confirmar (se cargaron tal cual venían) ===");
    for (const [m, v] of r.metodosSospechosos) {
      console.log(` - "${m}" (${v.veces} veces): ${v.motivo}`);
    }
  }

  if (r.avisos.length) {
    console.log("\n=== Avisos ===");
    r.avisos.forEach((a) => console.log(" - " + a));
  }

  const catsSinUso = await prisma.categoria_Matriz.findMany({ where: { normas: { none: {} } } });
  const anaSinUso = await prisma.analisis.findMany({
    where: { normas: { none: {} }, resultados: { none: {} } },
  });
  if (catsSinUso.length || anaSinUso.length) {
    console.log("\n=== Sin uso (los puedes borrar desde Catálogo si no los necesitas) ===");
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