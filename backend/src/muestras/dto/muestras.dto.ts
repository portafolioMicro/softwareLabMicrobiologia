import { EstadoSet } from "@prisma/client";
import { OmitType, PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  Matches,
} from "class-validator";

export class CreateSetDto {
  @IsInt({ message: "Selecciona un cliente" })
  id_cliente: number;

  @IsOptional() @IsString() @MaxLength(100)
  solicitante?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  causa_analisis?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  responsable_toma?: string | null;

  @IsOptional() @IsString() @MaxLength(150)
  lugar_toma?: string | null;

  @IsOptional() @IsString() @MaxLength(200)
  direccion_muestreo?: string | null;

  @IsOptional() @IsDateString()
  fecha_hora_toma?: string | null;

  @IsOptional() @IsDateString()
  fecha_hora_recepcion?: string | null;

  @IsOptional() @IsDateString()
  fecha_estimada_reporte?: string | null;

  @IsOptional() @IsBoolean()
  acreditado_onac?: boolean;
}

export class UpdateSetDto extends PartialType(CreateSetDto) {
  @IsOptional()
  @IsEnum(EstadoSet, { message: "Estado no válido" })
  estado_set?: EstadoSet;
}

export class CreateMuestraDto {
  @IsInt({ message: "Selecciona una norma" })
  id_norma: number;

  @IsString()
  @IsNotEmpty({ message: "El nombre de la muestra es obligatorio" })
  @MaxLength(150)
  nombre_muestra: string;

  @IsOptional() @IsString() @MaxLength(100)
  proveedor_manipulador?: string | null;

  @IsOptional() @IsString() @MaxLength(30)
  cantidad?: string | null;

  // A: Agua, AL: Alimento, MA: Manipulador, S: Superficie, AM: Ambiente
  @IsOptional()
  @IsIn(["A", "AL", "MA", "S", "AM"], { message: "Tipo de muestra no válido" })
  tipo_matriz?: string | null;

  @IsOptional() @IsString() @MaxLength(150)
  punto_muestreo?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  tecnica_muestreo?: string | null;

  @IsOptional() @IsString() @MaxLength(20)
  temp_toma?: string | null;

  @IsOptional() @IsString() @MaxLength(20)
  temp_recepcion?: string | null;

  @IsOptional() @IsString() @MaxLength(50)
  lote?: string | null;

  @IsOptional() @IsDateString()
  fecha_produccion?: string | null;

  @IsOptional() @IsDateString()
  fecha_vencimiento?: string | null;

  @IsOptional() @IsString() @MaxLength(50)
  estado_fisico?: string | null; // "Estado del envase" en el formato F-31
}

// La norma no se cambia después de crear la muestra (sus resultados ya se generaron con esa norma)
export class UpdateMuestraDto extends PartialType(OmitType(CreateMuestraDto, ["id_norma"] as const)) {}

/* ---------- Resultados (formatos F-11 y F-12) ---------- */

export class ResultadoItemDto {
  @IsInt()
  id_resultado: number;

  @IsOptional() @IsString() @MaxLength(100)
  resultado_final?: string | null;

  @IsOptional() @IsString() @MaxLength(30)
  unidad_medida?: string | null;

  @IsOptional() @IsString() @MaxLength(50)
  tecnica?: string | null;

  @IsOptional() @IsString() @MaxLength(50)
  incertidumbre?: string | null;

  @IsOptional() @IsBoolean()
  acreditado?: boolean;

  @IsOptional() @IsDateString()
  fecha_analisis?: string | null;

  @IsOptional() @IsString() @MaxLength(200)
  concepto?: string | null;
}

export class GuardarResultadosDto {
  @IsOptional() @IsString() @MaxLength(100)
  lote_medios_cultivo?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultadoItemDto)
  resultados: ResultadoItemDto[];
}

/* ---------- Informe (formato F-12) ---------- */

export class GuardarInformeDto {
  // Solo para continuar el consecutivo del laboratorio la primera vez; si no, se asigna solo
  @IsOptional()
  @Matches(/^\d{1,6}$/, { message: "El número de informe debe ser numérico (ej. 017)" })
  numero_informe?: string | null;

  @IsOptional() @IsString() @MaxLength(3000)
  observaciones_tecnicas?: string | null;

  @IsOptional() @IsInt()
  id_usuario_elabora?: number | null;

  @IsOptional() @IsInt()
  id_usuario_autoriza?: number | null;

  @IsOptional() @IsDateString()
  fecha_emision?: string | null;
}