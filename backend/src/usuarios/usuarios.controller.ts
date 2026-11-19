import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UsuariosService } from "./usuarios.service";
import { CambiarPasswordDto, CreateUsuarioDto, UpdateUsuarioDto } from "./dto/usuarios.dto";

@Controller("usuarios")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  // Cualquier usuario con sesión puede cambiar su propia contraseña
  @Post("yo/password")
  cambiarPassword(@Body() dto: CambiarPasswordDto, @Req() req: Request) {
    const yo = req.user as { id_usuario: number };
    return this.usuarios.cambiarPassword(yo.id_usuario, dto);
  }

  @Get()
  @Roles("Administrador")
  list() {
    return this.usuarios.list();
  }

  @Post()
  @Roles("Administrador")
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuarios.create(dto);
  }

  @Patch(":id")
  @Roles("Administrador")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto, @Req() req: Request) {
    const yo = req.user as { id_usuario: number };
    return this.usuarios.update(id, dto, yo.id_usuario);
  }
}