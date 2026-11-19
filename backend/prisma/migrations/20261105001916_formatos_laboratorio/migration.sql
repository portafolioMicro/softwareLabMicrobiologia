-- AlterTable
ALTER TABLE "muestra" ADD COLUMN     "punto_muestreo" VARCHAR(150),
ADD COLUMN     "tecnica_muestreo" VARCHAR(100);

-- AlterTable
ALTER TABLE "muestra_analisis_resultado" ADD COLUMN     "acreditado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tecnica" VARCHAR(50),
ALTER COLUMN "concepto" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "set_muestra" ADD COLUMN     "acta" JSONB,
ADD COLUMN     "condiciones_analisis" JSONB;
