import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ClientesService } from "./clientes.service";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { UpdateClienteDto } from "./dto/update-cliente.dto";

@Controller("clientes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll(@Query("search") search?: string) {
    return this.clientesService.findAll(search);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(":id")
  @Roles("Administrador")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}