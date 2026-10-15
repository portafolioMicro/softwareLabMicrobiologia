import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty({ message: "El NIT es obligatorio" })
  @MaxLength(20, { message: "El NIT no puede pasar de 20 caracteres" })
  nit: string;

  @IsString()
  @IsNotEmpty({ message: "El nombre de la empresa es obligatorio" })
  @MaxLength(150)
  nombre_empresa: string;

  @IsString()
  @IsNotEmpty({ message: "El nombre del responsable es obligatorio" })
  @MaxLength(100)
  nombre_responsable: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  direccion?: string | null;

  @IsOptional()
  @IsEmail({}, { message: "El correo no es válido" })
  @MaxLength(100)
  correo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string | null;
}