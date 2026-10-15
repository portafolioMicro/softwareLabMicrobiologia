import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  AsignarAnalisisDto,
  CreateAnalisisDto,
  CreateCategoriaDto,
  CreateNormaDto,
  UpdateAnalisisDto,
  UpdateCategoriaDto,
  UpdateNormaAnalisisDto,
  UpdateNormaDto,
} from "./dto/catalogo.dto";

@Injectable()
export class CatalogoService {
  constructor(private prisma: PrismaService) {}

  /* ---------- Categorías ---------- */

  listCategorias() {
    return this.prisma.categoria_Matriz.findMany({ orderBy: { nombre_categoria: "asc" } });
  }
  createCategoria(dto: CreateCategoriaDto) {
    return this.run(() => this.prisma.categoria_Matriz.create({ data: dto }));
  }
  updateCategoria(id: number, dto: UpdateCategoriaDto) {
    return this.run(() =>
      this.prisma.categoria_Matriz.update({ where: { id_categoria: id }, data: dto }),
    );
  }
  deleteCategoria(id: number) {
    return this.run(() => this.prisma.categoria_Matriz.delete({ where: { id_categoria: id } }));
  }

  /* ---------- Normas ---------- */

  listNormas() {
    return this.prisma.norma.findMany({
      include: { categoria: true },
      orderBy: { nombre_norma: "asc" },
    });
  }
  createNorma(dto: CreateNormaDto) {
    return this.run(() => this.prisma.norma.create({ data: dto }));
  }
  updateNorma(id: number, dto: UpdateNormaDto) {
    return this.run(() => this.prisma.norma.update({ where: { id_norma: id }, data: dto }));
  }
  deleteNorma(id: number) {
    return this.run(() => this.prisma.norma.delete({ where: { id_norma: id } }));
  }

  /* ---------- Análisis ---------- */

  listAnalisis() {
    return this.prisma.analisis.findMany({ orderBy: { nombre_analisis: "asc" } });
  }
  createAnalisis(dto: CreateAnalisisDto) {
    return this.run(() => this.prisma.analisis.create({ data: dto }));
  }
  updateAnalisis(id: number, dto: UpdateAnalisisDto) {
    return this.run(() => this.prisma.analisis.update({ where: { id_analisis: id }, data: dto }));
  }
  deleteAnalisis(id: number) {
    return this.run(() => this.prisma.analisis.delete({ where: { id_analisis: id } }));
  }

  /* ---------- Norma <-> Análisis ---------- */

  listNormaAnalisis(idNorma: number) {
    return this.prisma.norma_Analisis.findMany({
      where: { id_norma: idNorma },
      include: { analisis: true },
      orderBy: { analisis: { nombre_analisis: "asc" } },
    });
  }
  asignarAnalisis(idNorma: number, dto: AsignarAnalisisDto) {
    return this.run(() =>
      this.prisma.norma_Analisis.create({ data: { id_norma: idNorma, ...dto } }),
    );
  }
  updateNormaAnalisis(id: number, dto: UpdateNormaAnalisisDto) {
    return this.run(() =>
      this.prisma.norma_Analisis.update({ where: { id_norma_analisis: id }, data: dto }),
    );
  }
  quitarAnalisis(id: number) {
    return this.run(() => this.prisma.norma_Analisis.delete({ where: { id_norma_analisis: id } }));
  }

  /* ---------- Manejo de errores de Prisma ---------- */

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new ConflictException("Ya existe un registro con esos datos");
        }
        if (e.code === "P2003") {
          throw new ConflictException(
            "No se puede completar: el registro está relacionado con otros datos (o la categoría/análisis elegido no existe)",
          );
        }
        if (e.code === "P2025") {
          throw new NotFoundException("Registro no encontrado");
        }
      }
      throw e;
    }
  }
}