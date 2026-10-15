import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const categorias = [
  "Productos lácteos",
  "Frutas, vegetales y bebidas",
  "Panadería, cereales y confitería",
  "Productos pecuarios y marinos",
  "Agua de proceso",
  "Equipos y utensilios",
  "Ambientes de proceso",
  "Material de empaque",
  "Manipuladores de alimentos",
  "Superficies de contacto",
];

const analisis = [
  "Coliformes",
  "Escherichia coli",
  "Salmonella spp.",
  "Staphylococcus aureus",
  "Mohos",
  "Levaduras",
  "Bacillus cereus",
  "Enterobacterias",
  "Microorganismos indicadores",
];

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.usuario.upsert({
    where: { correo: "admin@unilibre.edu.co" },
    update: {},
    create: {
      nombre_completo: "Administrador de Prueba",
      correo: "admin@unilibre.edu.co",
      cargo: "Coordinador de Laboratorio",
      rol: "Administrador",
      password_hash: passwordHash,
      activo: true,
    },
  });

  for (const nombre_categoria of categorias) {
    await prisma.categoria_Matriz.upsert({
      where: { nombre_categoria },
      update: {},
      create: { nombre_categoria },
    });
  }

  for (const nombre_analisis of analisis) {
    await prisma.analisis.upsert({
      where: { nombre_analisis },
      update: {},
      create: { nombre_analisis },
    });
  }

  console.log("Seed listo: usuario admin, categorías y análisis del portafolio");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });