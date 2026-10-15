import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre de la categoría es obligatorio" })
  @MaxLength(100)
  nombre_categoria: string;
}
export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}

export class CreateNormaDto {
  @IsInt({ message: "Selecciona una categoría" })
  id_categoria: number;

  @IsString()
  @IsNotEmpty({ message: "El nombre de la norma es obligatorio" })
  @MaxLength(150)
  nombre_norma: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
export class UpdateNormaDto extends PartialType(CreateNormaDto) {}

export class CreateAnalisisDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre del análisis es obligatorio" })
  @MaxLength(150)
  nombre_analisis: string;

  @IsOptional()
  @IsString()
  descripcion?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  metodo_referencia?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  unidad_medida_defecto?: string | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
export class UpdateAnalisisDto extends PartialType(CreateAnalisisDto) {}

export class AsignarAnalisisDto {
  @IsInt({ message: "Selecciona un análisis" })
  id_analisis: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  tecnica_defecto?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  valor_referencia_defecto?: string | null;
}

export class UpdateNormaAnalisisDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  tecnica_defecto?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  valor_referencia_defecto?: string | null;
}