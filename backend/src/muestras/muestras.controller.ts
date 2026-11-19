import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { MuestrasService } from "./muestras.service";
import {
  CreateMuestraDto,
  CreateSetDto,
  GuardarResultadosDto,
  UpdateMuestraDto,
  UpdateSetDto,
  GuardarInformeDto,
} from "./dto/muestras.dto";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MuestrasController {
  constructor(private readonly muestras: MuestrasService) {}

  /* Sets */
  @Get("sets")
  listSets(@Query("search") search?: string, @Query("estado") estado?: string) {
    return this.muestras.listSets(search, estado);
  }

  @Get("sets/:id")
  getSet(@Param("id", ParseIntPipe) id: number) {
    return this.muestras.getSet(id);
  }

  @Post("sets")
  createSet(@Body() dto: CreateSetDto, @Req() req: Request) {
    const usuario = req.user as { id_usuario: number };
    return this.muestras.createSet(dto, usuario.id_usuario);
  }

  @Patch("sets/:id")
  updateSet(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateSetDto) {
    return this.muestras.updateSet(id, dto);
  }

  @Delete("sets/:id")
  @Roles("Administrador")
  deleteSet(@Param("id", ParseIntPipe) id: number) {
    return this.muestras.deleteSet(id);
  }

  /* Muestras */
  @Post("sets/:id/muestras")
  createMuestra(@Param("id", ParseIntPipe) id: number, @Body() dto: CreateMuestraDto) {
    return this.muestras.createMuestra(id, dto);
  }

  @Patch("muestras/:id")
  updateMuestra(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMuestraDto) {
    return this.muestras.updateMuestra(id, dto);
  }

  @Delete("muestras/:id")
  @Roles("Administrador")
  deleteMuestra(@Param("id", ParseIntPipe) id: number) {
    return this.muestras.deleteMuestra(id);
  }

    /* Resultados */
  @Get("muestras/:id/resultados")
  getResultados(@Param("id", ParseIntPipe) id: number) {
    return this.muestras.getResultados(id);
  }

  @Put("muestras/:id/resultados")
  @Roles("Administrador", "Analista")
  guardarResultados(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: GuardarResultadosDto,
    @Req() req: Request,
  ) {
    const usuario = req.user as { id_usuario: number };
    return this.muestras.guardarResultados(id, dto, usuario.id_usuario);
  }

    /* Informe */
  @Get("muestras/:id/informe")
  getInforme(@Param("id", ParseIntPipe) id: number) {
    return this.muestras.getInforme(id);
  }

  @Put("muestras/:id/informe")
  @Roles("Administrador", "Analista")
  guardarInforme(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: GuardarInformeDto,
    @Req() req: Request,
  ) {
    const usuario = req.user as { id_usuario: number };
    return this.muestras.guardarInforme(id, dto, usuario.id_usuario);
  }

  @Get("firmantes")
  listarFirmantes() {
    return this.muestras.listarFirmantes();
  }
    /* Acta de toma y recepción */
  @Put("sets/:id/acta")
  guardarActa(@Param("id", ParseIntPipe) id: number, @Body("acta") acta: unknown) {
    return this.muestras.guardarActa(id, acta);
  }
    /* Datos generales de la hoja de conteos */
  @Put("sets/:id/condiciones")
  guardarCondiciones(@Param("id", ParseIntPipe) id: number, @Body("condiciones") condiciones: unknown) {
    return this.muestras.guardarCondiciones(id, condiciones);
  }
}