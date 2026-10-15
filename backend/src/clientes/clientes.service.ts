import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { UpdateClienteDto } from "./dto/update-cliente.dto";

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  findAll(search?: string) {
    const q = search?.trim();
    return this.prisma.cliente.findMany({
      where: q
        ? {
            OR: [
              { nombre_empresa: { contains: q, mode: "insensitive" } },
              { nombre_responsable: { contains: q, mode: "insensitive" } },
              { nit: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { nombre_empresa: "asc" },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id_cliente: id } });
    if (!cliente) throw new NotFoundException("Cliente no encontrado");
    return cliente;
  }

  async create(dto: CreateClienteDto) {
    try {
      return await this.prisma.cliente.create({ data: dto });
    } catch (e) {
      this.handleError(e);
    }
  }

  async update(id: number, dto: UpdateClienteDto) {
    try {
      return await this.prisma.cliente.update({ where: { id_cliente: id }, data: dto });
    } catch (e) {
      this.handleError(e);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.cliente.delete({ where: { id_cliente: id } });
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        throw new ConflictException("Ya existe un cliente con ese NIT");
      }
      if (e.code === "P2003") {
        throw new ConflictException(
          "No se puede eliminar: el cliente tiene sets de muestra asociados",
        );
      }
      if (e.code === "P2025") {
        throw new NotFoundException("Cliente no encontrado");
      }
    }
    throw e;
  }
}