/*
  Warnings:

  - A unique constraint covering the columns `[numero_informe]` on the table `muestra` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "muestra" ADD COLUMN     "fecha_emision" DATE,
ADD COLUMN     "id_usuario_autoriza" INTEGER,
ADD COLUMN     "id_usuario_elabora" INTEGER,
ADD COLUMN     "numero_informe" VARCHAR(20),
ADD COLUMN     "observaciones_tecnicas" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "muestra_numero_informe_key" ON "muestra"("numero_informe");

-- AddForeignKey
ALTER TABLE "muestra" ADD CONSTRAINT "muestra_id_usuario_elabora_fkey" FOREIGN KEY ("id_usuario_elabora") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muestra" ADD CONSTRAINT "muestra_id_usuario_autoriza_fkey" FOREIGN KEY ("id_usuario_autoriza") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
