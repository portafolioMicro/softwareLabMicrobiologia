import { RolUsuario } from "@prisma/client";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre es obligatorio" })
  @MaxLength(150)
  nombre_completo: string;

  @IsEmail({}, { message: "El correo no es válido" })
  @MaxLength(100)
  correo: string;

  @IsOptional() @IsString() @MaxLength(100)
  cargo?: string | null;

  @IsEnum(RolUsuario, { message: "Rol no válido" })
  rol: RolUsuario;

  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @MaxLength(72)
  password: string;
}

export class UpdateUsuarioDto {
  @IsOptional() @IsString() @IsNotEmpty({ message: "El nombre no puede quedar vacío" }) @MaxLength(150)
  nombre_completo?: string;

  @IsOptional() @IsEmail({}, { message: "El correo no es válido" }) @MaxLength(100)
  correo?: string;

  @IsOptional() @IsString() @MaxLength(100)
  cargo?: string | null;

  @IsOptional() @IsEnum(RolUsuario, { message: "Rol no válido" })
  rol?: RolUsuario;

  @IsOptional() @IsBoolean()
  activo?: boolean;

  // Si viene, el administrador restablece la contraseña de ese usuario
  @IsOptional()
  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @MaxLength(72)
  password?: string;
}

export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty({ message: "Escribe tu contraseña actual" })
  actual: string;

  @IsString()
  @MinLength(8, { message: "La contraseña nueva debe tener al menos 8 caracteres" })
  @MaxLength(72)
  nueva: string;
}