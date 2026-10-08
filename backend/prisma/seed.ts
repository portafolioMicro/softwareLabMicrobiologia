import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  const admin = await prisma.usuario.upsert({
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

  console.log("Usuario de prueba creado:", admin.correo);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });