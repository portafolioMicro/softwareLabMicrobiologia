import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CambiarPasswordDto, CreateUsuarioDto, UpdateUsuarioDto } from "./dto/usuarios.dto";

// Nunca se devuelve el hash de la contraseña
const SELECT = {
  id_usuario: true,
  nombre_completo: true,
  correo: true,
  cargo: true,
  rol: true,
  activo: true,
  fecha_creacion: true,
} as const;

const aTexto = (v?: string | null) =>
  v === undefined ? undefined : v === null || v.trim() === "" ? null : v.trim();

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.usuario.findMany({
      select: SELECT,
      orderBy: [{ activo: "desc" }, { nombre_completo: "asc" }],
    });
  }

  async create(dto: CreateUsuarioDto) {
    try {
      return await this.prisma.usuario.create({
        data: {
          nombre_completo: dto.nombre_completo.trim(),
          correo: dto.correo.trim().toLowerCase(),
          cargo: aTexto(dto.cargo),
          rol: dto.rol,
          password_hash: await bcrypt.hash(dto.password, 10),
          activo: true,
        },
        select: SELECT,
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  async update(id: number, dto: UpdateUsuarioDto, idActual: number) {
    const actual = await this.prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!actual) throw new NotFoundException("Usuario no encontrado");

    // Evita que el sistema se quede sin administradores
    const dejaDeSerAdmin =
      actual.rol === "Administrador" &&
      actual.activo &&
      ((dto.rol !== undefined && dto.rol !== "Administrador") || dto.activo === false);

    if (dejaDeSerAdmin) {
      if (id === idActual) {
        throw new BadRequestException("No puedes quitarte el rol de Administrador ni desactivarte a ti mismo");
      }
      const otros = await this.prisma.usuario.count({
        where: { rol: "Administrador", activo: true, id_usuario: { not: id } },
      });
      if (otros === 0) throw new BadRequestException("Debe quedar al menos un Administrador activo");
    }

    try {
      return await this.prisma.usuario.update({
        where: { id_usuario: id },
        data: {
          nombre_completo: dto.nombre_completo?.trim(),
          correo: dto.correo?.trim().toLowerCase(),
          cargo: aTexto(dto.cargo),
          rol: dto.rol,
          activo: dto.activo,
          ...(dto.password ? { password_hash: await bcrypt.hash(dto.password, 10) } : {}),
        },
        select: SELECT,
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  async cambiarPassword(id: number, dto: CambiarPasswordDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!usuario) throw new NotFoundException("Usuario no encontrado");

    if (!(await bcrypt.compare(dto.actual, usuario.password_hash))) {
      throw new BadRequestException("La contraseña actual no es correcta");
    }
    await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { password_hash: await bcrypt.hash(dto.nueva, 10) },
    });
    return { message: "Contraseña actualizada" };
  }

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") throw new ConflictException("Ya existe un usuario con ese correo");
      if (e.code === "P2025") throw new NotFoundException("Usuario no encontrado");
    }
    throw e;
  }
}