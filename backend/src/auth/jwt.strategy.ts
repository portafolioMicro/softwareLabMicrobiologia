import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";

function extractJwtFromCookie(req: Request): string | null {
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: { sub: number }) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: payload.sub },
      select: { id_usuario: true, correo: true, rol: true, nombre_completo: true, activo: true },
    });
    if (!usuario || !usuario.activo) throw new UnauthorizedException();

    // Esto queda disponible como req.user en los controladores
    return {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre_completo: usuario.nombre_completo,
    };
  }
}