-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('Administrador', 'Analista', 'Tecnico');

-- CreateEnum
CREATE TYPE "estado_set" AS ENUM ('Registrado', 'En_Proceso', 'Finalizado', 'Firmado');

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "cargo" VARCHAR(100),
    "rol" "RolUsuario" NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nit" VARCHAR(20) NOT NULL,
    "nombre_empresa" VARCHAR(150) NOT NULL,
    "nombre_responsable" VARCHAR(100) NOT NULL,
    "ciudad" VARCHAR(100),
    "direccion" VARCHAR(150),
    "correo" VARCHAR(100),
    "telefono" VARCHAR(20),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "set_muestra" (
    "id_set_muestra" SERIAL NOT NULL,
    "codigo_set" VARCHAR(50) NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_usuario_recepcion" INTEGER NOT NULL,
    "solicitante" VARCHAR(100),
    "causa_analisis" VARCHAR(100),
    "responsable_toma" VARCHAR(100),
    "lugar_toma" VARCHAR(150),
    "direccion_muestreo" VARCHAR(200),
    "fecha_hora_toma" TIMESTAMP(3),
    "fecha_hora_recepcion" TIMESTAMP(3),
    "fecha_estimada_reporte" DATE,
    "estado_set" "estado_set" NOT NULL DEFAULT 'Registrado',
    "acreditado_onac" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "set_muestra_pkey" PRIMARY KEY ("id_set_muestra")
);

-- CreateTable
CREATE TABLE "muestra" (
    "id_muestra" SERIAL NOT NULL,
    "id_set_muestra" INTEGER NOT NULL,
    "id_norma" INTEGER NOT NULL,
    "codigo_muestra" VARCHAR(50) NOT NULL,
    "nombre_muestra" VARCHAR(150) NOT NULL,
    "proveedor_manipulador" VARCHAR(100),
    "cantidad" VARCHAR(30),
    "tipo_matriz" VARCHAR(20),
    "temp_toma" VARCHAR(20),
    "temp_recepcion" VARCHAR(20),
    "lote" VARCHAR(50),
    "fecha_produccion" DATE,
    "fecha_vencimiento" DATE,
    "estado_fisico" VARCHAR(50),

    CONSTRAINT "muestra_pkey" PRIMARY KEY ("id_muestra")
);

-- CreateTable
CREATE TABLE "analisis" (
    "id_analisis" SERIAL NOT NULL,
    "nombre_analisis" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "metodo_referencia" VARCHAR(150),
    "unidad_medida_defecto" VARCHAR(30),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "analisis_pkey" PRIMARY KEY ("id_analisis")
);

-- CreateTable
CREATE TABLE "categoria_matriz" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" VARCHAR(100) NOT NULL,

    CONSTRAINT "categoria_matriz_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "norma" (
    "id_norma" SERIAL NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "nombre_norma" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "norma_pkey" PRIMARY KEY ("id_norma")
);

-- CreateTable
CREATE TABLE "norma_analisis" (
    "id_norma_analisis" SERIAL NOT NULL,
    "id_norma" INTEGER NOT NULL,
    "id_analisis" INTEGER NOT NULL,
    "tecnica_defecto" VARCHAR(150),
    "valor_referencia_defecto" VARCHAR(100),

    CONSTRAINT "norma_analisis_pkey" PRIMARY KEY ("id_norma_analisis")
);

-- CreateTable
CREATE TABLE "muestra_analisis_resultado" (
    "id_resultado" SERIAL NOT NULL,
    "id_muestra" INTEGER NOT NULL,
    "id_analisis" INTEGER NOT NULL,
    "id_analista" INTEGER,
    "metodo_utilizado" VARCHAR(150),
    "normativa_comparativa" VARCHAR(150),
    "valor_referencia" VARCHAR(100),
    "incertidumbre" VARCHAR(50),
    "resultado_1" VARCHAR(100),
    "resultado_2" VARCHAR(100),
    "resultado_3" VARCHAR(100),
    "resultado_4" VARCHAR(100),
    "resultado_5" VARCHAR(100),
    "resultado_final" VARCHAR(100),
    "unidad_medida" VARCHAR(30),
    "concepto" VARCHAR(100),
    "fecha_analisis" TIMESTAMP(3),
    "lote_medios_cultivo" VARCHAR(100),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "muestra_analisis_resultado_pkey" PRIMARY KEY ("id_resultado")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_nit_key" ON "cliente"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "set_muestra_codigo_set_key" ON "set_muestra"("codigo_set");

-- CreateIndex
CREATE UNIQUE INDEX "muestra_codigo_muestra_key" ON "muestra"("codigo_muestra");

-- CreateIndex
CREATE UNIQUE INDEX "analisis_nombre_analisis_key" ON "analisis"("nombre_analisis");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_matriz_nombre_categoria_key" ON "categoria_matriz"("nombre_categoria");

-- CreateIndex
CREATE UNIQUE INDEX "norma_analisis_id_norma_id_analisis_key" ON "norma_analisis"("id_norma", "id_analisis");

-- AddForeignKey
ALTER TABLE "set_muestra" ADD CONSTRAINT "set_muestra_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_muestra" ADD CONSTRAINT "set_muestra_id_usuario_recepcion_fkey" FOREIGN KEY ("id_usuario_recepcion") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muestra" ADD CONSTRAINT "muestra_id_set_muestra_fkey" FOREIGN KEY ("id_set_muestra") REFERENCES "set_muestra"("id_set_muestra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muestra" ADD CONSTRAINT "muestra_id_norma_fkey" FOREIGN KEY ("id_norma") REFERENCES "norma"("id_norma") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "norma" ADD CONSTRAINT "norma_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria_matriz"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "norma_analisis" ADD CONSTRAINT "norma_analisis_id_norma_fkey" FOREIGN KEY ("id_norma") REFERENCES "norma"("id_norma") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "norma_analisis" ADD CONSTRAINT "norma_analisis_id_analisis_fkey" FOREIGN KEY ("id_analisis") REFERENCES "analisis"("id_analisis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muestra_analisis_resultado" ADD CONSTRAINT "muestra_analisis_resultado_id_muestra_fkey" FOREIGN KEY ("id_muestra") REFERENCES "muestra"("id_muestra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muestra_analisis_resultado" ADD CONSTRAINT "muestra_analisis_resultado_id_analisis_fkey" FOREIGN KEY ("id_analisis") REFERENCES "analisis"("id_analisis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muestra_analisis_resultado" ADD CONSTRAINT "muestra_analisis_resultado_id_analista_fkey" FOREIGN KEY ("id_analista") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
