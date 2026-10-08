import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";

function extractJwtFromCookie(req: Request): string | null {
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: { sub: number; correo: string; rol: string; nombre: string }) {
    // Esto queda disponible como req.user en los controladores
    return {
      id_usuario: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
      nombre_completo: payload.nombre,
    };
  }
}