import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });

    // Mensaje genérico a propósito: no revelamos si falló el correo o la contraseña
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException("Correo o contraseña incorrectos");
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.password_hash);
    if (!passwordValida) {
      throw new UnauthorizedException("Correo o contraseña incorrectos");
    }

    const payload = {
      sub: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre_completo,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        rol: usuario.rol,
        cargo: usuario.cargo,
      },
    };
  }
}