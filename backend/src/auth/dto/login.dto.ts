import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "El correo no es válido" })
  correo: string;

  @IsNotEmpty({ message: "La contraseña es obligatoria" })
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password: string;
}