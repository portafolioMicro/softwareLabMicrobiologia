import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CatalogoService } from "./catalogo.service";
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

@Controller("catalogo")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  /* Categorías */
  @Get("categorias")
  listCategorias() {
    return this.catalogo.listCategorias();
  }
  @Post("categorias")
  @Roles("Administrador")
  createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.catalogo.createCategoria(dto);
  }
  @Patch("categorias/:id")
  @Roles("Administrador")
  updateCategoria(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateCategoriaDto) {
    return this.catalogo.updateCategoria(id, dto);
  }
  @Delete("categorias/:id")
  @Roles("Administrador")
  deleteCategoria(@Param("id", ParseIntPipe) id: number) {
    return this.catalogo.deleteCategoria(id);
  }

  /* Normas */
  @Get("normas")
  listNormas() {
    return this.catalogo.listNormas();
  }
  @Post("normas")
  @Roles("Administrador")
  createNorma(@Body() dto: CreateNormaDto) {
    return this.catalogo.createNorma(dto);
  }
  @Patch("normas/:id")
  @Roles("Administrador")
  updateNorma(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateNormaDto) {
    return this.catalogo.updateNorma(id, dto);
  }
  @Delete("normas/:id")
  @Roles("Administrador")
  deleteNorma(@Param("id", ParseIntPipe) id: number) {
    return this.catalogo.deleteNorma(id);
  }

  /* Análisis */
  @Get("analisis")
  listAnalisis() {
    return this.catalogo.listAnalisis();
  }
  @Post("analisis")
  @Roles("Administrador")
  createAnalisis(@Body() dto: CreateAnalisisDto) {
    return this.catalogo.createAnalisis(dto);
  }
  @Patch("analisis/:id")
  @Roles("Administrador")
  updateAnalisis(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateAnalisisDto) {
    return this.catalogo.updateAnalisis(id, dto);
  }
  @Delete("analisis/:id")
  @Roles("Administrador")
  deleteAnalisis(@Param("id", ParseIntPipe) id: number) {
    return this.catalogo.deleteAnalisis(id);
  }

  /* Análisis asignados a cada norma */
  @Get("normas/:id/analisis")
  listNormaAnalisis(@Param("id", ParseIntPipe) id: number) {
    return this.catalogo.listNormaAnalisis(id);
  }
  @Post("normas/:id/analisis")
  @Roles("Administrador")
  asignarAnalisis(@Param("id", ParseIntPipe) id: number, @Body() dto: AsignarAnalisisDto) {
    return this.catalogo.asignarAnalisis(id, dto);
  }
  @Patch("norma-analisis/:id")
  @Roles("Administrador")
  updateNormaAnalisis(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateNormaAnalisisDto) {
    return this.catalogo.updateNormaAnalisis(id, dto);
  }
  @Delete("norma-analisis/:id")
  @Roles("Administrador")
  quitarAnalisis(@Param("id", ParseIntPipe) id: number) {
    return this.catalogo.quitarAnalisis(id);
  }
}