import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EstadoSet, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateMuestraDto,
  CreateSetDto,
  GuardarResultadosDto,
  UpdateMuestraDto,
  UpdateSetDto,
  GuardarInformeDto,
} from "./dto/muestras.dto";

type Tx = Prisma.TransactionClient;

// undefined = no tocar, null o "" = borrar, texto = fecha
const aFecha = (v?: string | null) =>
  v === undefined ? undefined : v === null || v === "" ? null : new Date(v);

// undefined = no tocar, vacío = null
const aTexto = (v?: string | null) =>
  v === undefined ? undefined : v === null || v.trim() === "" ? null : v.trim();

@Injectable()
export class MuestrasService {
  constructor(private prisma: PrismaService) {}

  /* ---------- Sets ---------- */

  listSets(search?: string, estado?: string) {
    if (estado && !Object.values(EstadoSet).includes(estado as EstadoSet)) {
      throw new BadRequestException("Estado no válido");
    }
    const q = search?.trim();
    return this.prisma.set_Muestra.findMany({
      where: {
        ...(estado ? { estado_set: estado as EstadoSet } : {}),
        ...(q
          ? {
              OR: [
                { codigo_set: { contains: q, mode: "insensitive" } },
                { cliente: { nombre_empresa: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        cliente: { select: { id_cliente: true, nombre_empresa: true } },
        _count: { select: { muestras: true } },
      },
      orderBy: { id_set_muestra: "desc" },
    });
  }

  async getSet(id: number) {
    const set = await this.prisma.set_Muestra.findUnique({
      where: { id_set_muestra: id },
      include: {
        cliente: true,
        usuarioRecepcion: { select: { id_usuario: true, nombre_completo: true } },
        muestras: {
          orderBy: { codigo_muestra: "asc" },
          include: {
            norma: { select: { id_norma: true, nombre_norma: true } },
            _count: { select: { resultados: true } },
            resultados: {
              select: {
                id_resultado: true,
                resultado_final: true,
                metodo_utilizado: true,
                fecha_analisis: true,
                lote_medios_cultivo: true,
                analisis: { select: { nombre_analisis: true } },
              },
              orderBy: { analisis: { nombre_analisis: "asc" } },
            },
          },
        },
      },
    });
    if (!set) throw new NotFoundException("Set de muestras no encontrado");
    return set;
  }

  async createSet(dto: CreateSetDto, idUsuario: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id_cliente: dto.id_cliente } });
    if (!cliente) throw new NotFoundException("Cliente no encontrado");

    // Si dos personas crean a la vez y el código se repite, reintenta con el siguiente
    for (let intento = 0; intento < 5; intento++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const codigo_set = await this.siguienteCodigoSet(tx);
          return tx.set_Muestra.create({
            data: {
              codigo_set,
              id_cliente: dto.id_cliente,
              id_usuario_recepcion: idUsuario,
              solicitante: dto.solicitante,
              causa_analisis: dto.causa_analisis,
              responsable_toma: dto.responsable_toma,
              lugar_toma: dto.lugar_toma,
              direccion_muestreo: dto.direccion_muestreo,
              fecha_hora_toma: aFecha(dto.fecha_hora_toma),
              fecha_hora_recepcion: aFecha(dto.fecha_hora_recepcion) ?? new Date(),
              fecha_estimada_reporte: aFecha(dto.fecha_estimada_reporte),
              acreditado_onac: dto.acreditado_onac ?? false,
            },
          });
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
        throw e;
      }
    }
    throw new ConflictException("No se pudo generar un código único, intenta de nuevo");
  }

  async updateSet(id: number, dto: UpdateSetDto) {
    const { fecha_hora_toma, fecha_hora_recepcion, fecha_estimada_reporte, ...resto } = dto;
    try {
      return await this.prisma.set_Muestra.update({
        where: { id_set_muestra: id },
        data: {
          ...resto,
          fecha_hora_toma: aFecha(fecha_hora_toma),
          fecha_hora_recepcion: aFecha(fecha_hora_recepcion) ?? undefined,
          fecha_estimada_reporte: aFecha(fecha_estimada_reporte),
        },
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  async deleteSet(id: number) {
    try {
      return await this.prisma.set_Muestra.delete({ where: { id_set_muestra: id } });
    } catch (e) {
      this.handleError(e, "No se puede eliminar: el set todavía tiene muestras. Elimínalas primero");
    }
  }

  /* ---------- Muestras ---------- */

  /** Crea la muestra y, con la norma elegida, genera una fila de resultado por cada análisis de la norma. */
  async createMuestra(idSet: number, dto: CreateMuestraDto) {
    for (let intento = 0; intento < 5; intento++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const set = await tx.set_Muestra.findUnique({
            where: { id_set_muestra: idSet },
            select: { id_set_muestra: true },
          });
          if (!set) throw new NotFoundException("Set de muestras no encontrado");

          const norma = await tx.norma.findUnique({
            where: { id_norma: dto.id_norma },
            include: { analisis: { include: { analisis: true } } },
          });
          if (!norma) throw new NotFoundException("Norma no encontrada");
          if (!norma.activo) throw new BadRequestException("La norma está inactiva");

          const codigo_muestra = await this.siguienteCodigoMuestra(tx);

          const muestra = await tx.muestra.create({
            data: {
              id_set_muestra: idSet,
              id_norma: dto.id_norma,
              codigo_muestra,
              nombre_muestra: dto.nombre_muestra,
              proveedor_manipulador: dto.proveedor_manipulador,
              cantidad: dto.cantidad,
              tipo_matriz: dto.tipo_matriz,
              punto_muestreo: dto.punto_muestreo,
              tecnica_muestreo: dto.tecnica_muestreo,
              temp_toma: dto.temp_toma,
              temp_recepcion: dto.temp_recepcion,
              lote: dto.lote,
              fecha_produccion: aFecha(dto.fecha_produccion),
              fecha_vencimiento: aFecha(dto.fecha_vencimiento),
              estado_fisico: dto.estado_fisico,
            },
          });

          const aplicables = norma.analisis.filter((na) => na.analisis.activo);
          await tx.muestra_Analisis_Resultado.createMany({
            data: aplicables.map((na) => ({
              id_muestra: muestra.id_muestra,
              id_analisis: na.id_analisis,
              metodo_utilizado: na.tecnica_defecto,
              normativa_comparativa: norma.nombre_norma.slice(0, 150),
              valor_referencia: na.valor_referencia_defecto,
              // Si el límite es "Ausencia" se identifica; si es un recuento, se cuenta en placa
              tecnica: (na.valor_referencia_defecto ?? "").startsWith("Ausencia")
                ? "Identificación en placa"
                : "Recuento en placa",
            })),
          });

          return tx.muestra.findUnique({
            where: { id_muestra: muestra.id_muestra },
            include: {
              norma: { select: { id_norma: true, nombre_norma: true } },
              _count: { select: { resultados: true } },
            },
          });
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
        throw e;
      }
    }
    throw new ConflictException("No se pudo generar un código único, intenta de nuevo");
  }

  async updateMuestra(id: number, dto: UpdateMuestraDto) {
    const { fecha_produccion, fecha_vencimiento, ...resto } = dto;
    try {
      return await this.prisma.muestra.update({
        where: { id_muestra: id },
        data: {
          ...resto,
          fecha_produccion: aFecha(fecha_produccion),
          fecha_vencimiento: aFecha(fecha_vencimiento),
        },
        include: {
          norma: { select: { id_norma: true, nombre_norma: true } },
          _count: { select: { resultados: true } },
        },
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  async deleteMuestra(id: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.muestra_Analisis_Resultado.deleteMany({ where: { id_muestra: id } });
        return tx.muestra.delete({ where: { id_muestra: id } });
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  /* ---------- Resultados ---------- */

  async getResultados(id: number) {
    const muestra = await this.prisma.muestra.findUnique({
      where: { id_muestra: id },
      include: {
        norma: { select: { id_norma: true, nombre_norma: true } },
        set: {
          select: {
            id_set_muestra: true,
            codigo_set: true,
            estado_set: true,
            fecha_hora_toma: true,
            fecha_hora_recepcion: true,
            cliente: { select: { nombre_empresa: true, nit: true } },
          },
        },
        resultados: {
          include: { analisis: { select: { nombre_analisis: true } } },
          orderBy: { analisis: { nombre_analisis: "asc" } },
        },
      },
    });
    if (!muestra) throw new NotFoundException("Muestra no encontrada");
    return muestra;
  }

  async guardarResultados(id: number, dto: GuardarResultadosDto, idUsuario: number) {
    const muestra = await this.prisma.muestra.findUnique({
      where: { id_muestra: id },
      select: { id_set_muestra: true, resultados: { select: { id_resultado: true } } },
    });
    if (!muestra) throw new NotFoundException("Muestra no encontrada");

    const validos = new Set(muestra.resultados.map((r) => r.id_resultado));
    if (dto.resultados.some((r) => !validos.has(r.id_resultado))) {
      throw new BadRequestException("Hay resultados que no pertenecen a esta muestra");
    }

    const lote = aTexto(dto.lote_medios_cultivo);

    await this.prisma.$transaction(
      dto.resultados.map((r) => {
        const resultado = aTexto(r.resultado_final);
        return this.prisma.muestra_Analisis_Resultado.update({
          where: { id_resultado: r.id_resultado },
          data: {
            resultado_final: resultado,
            unidad_medida: aTexto(r.unidad_medida),
            tecnica: aTexto(r.tecnica),
            incertidumbre: aTexto(r.incertidumbre),
            acreditado: r.acreditado ?? false,
            fecha_analisis: aFecha(r.fecha_analisis),
            concepto: aTexto(r.concepto),
            lote_medios_cultivo: lote,
            id_analista: resultado ? idUsuario : null,
          },
        });
      }),
    );

    // Al digitar el primer resultado, el set pasa de "Registrado" a "En proceso"
    if (dto.resultados.some((r) => aTexto(r.resultado_final))) {
      await this.prisma.set_Muestra.updateMany({
        where: { id_set_muestra: muestra.id_set_muestra, estado_set: "Registrado" },
        data: { estado_set: "En_Proceso" },
      });
    }

    return this.getResultados(id);
  }



  /* ---------- Acta de toma y recepción (formato F-31) ---------- */

  async guardarActa(id: number, raw: unknown) {
    const acta = this.limpiarActa(raw);
    try {
      await this.prisma.set_Muestra.update({ where: { id_set_muestra: id }, data: { acta } });
    } catch (e) {
      this.handleError(e);
    }
    return this.getSet(id);
  }

  /** Solo guarda los campos conocidos del acta, con su tipo y largo máximo. */
  private limpiarActa(raw: unknown): Prisma.InputJsonObject {
    if (typeof raw !== "object" || raw === null) throw new BadRequestException("Acta no válida");
    const r = raw as Record<string, unknown>;

    const txt = (v: unknown, max = 1000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const fecha = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
    const cnc = (v: unknown) => (v === "C" || v === "NC" ? v : "");
    const sec = (v: unknown) => (typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {});

    const toma = sec(r.toma);
    const rec = sec(r.recepcion);
    const tra = sec(r.transporte);
    const ent = sec(r.entrega);
    const dis = sec(r.disposicion);

    return {
      contacto_telefono: txt(r.contacto_telefono, 30),
      contacto_correo: txt(r.contacto_correo, 100),
      toma: { cumple: cnc(toma.cumple), hallazgos: txt(toma.hallazgos), accion: txt(toma.accion) },
      recepcion: {
        responsable: txt(rec.responsable, 150),
        cumple: cnc(rec.cumple),
        hallazgos: txt(rec.hallazgos),
        accion: txt(rec.accion),
      },
      parametros_observaciones: txt(r.parametros_observaciones),
      transporte: {
        medio: txt(tra.medio, 100),
        temperatura: txt(tra.temperatura, 30),
        cumple: cnc(tra.cumple),
        cadena_frio: tra.cadena_frio === "SI" || tra.cadena_frio === "NO" ? tra.cadena_frio : "",
        hallazgos: txt(tra.hallazgos),
        accion: txt(tra.accion),
      },
      entrega: {
        fecha_entrega: fecha(ent.fecha_entrega),
        fecha_aprobacion: fecha(ent.fecha_aprobacion),
        fecha_emision: fecha(ent.fecha_emision),
        hallazgos: txt(ent.hallazgos),
        accion: txt(ent.accion),
      },
      disposicion: {
        fecha_ingreso: fecha(dis.fecha_ingreso),
        ubicacion: txt(dis.ubicacion, 150),
        fecha_eliminacion_tentativa: fecha(dis.fecha_eliminacion_tentativa),
        fecha_eliminacion_real: fecha(dis.fecha_eliminacion_real),
        hallazgos: txt(dis.hallazgos),
        accion: txt(dis.accion),
      },
      representante_laboratorio: txt(r.representante_laboratorio, 150),
      aprueba_servicio: txt(r.aprueba_servicio, 150),
    };
  }


    /* ---------- Datos generales de la hoja de conteos (formato F-11) ---------- */

  async guardarCondiciones(id: number, raw: unknown) {
    const condiciones = this.limpiarCondiciones(raw);
    try {
      await this.prisma.set_Muestra.update({
        where: { id_set_muestra: id },
        data: { condiciones_analisis: condiciones },
      });
    } catch (e) {
      this.handleError(e);
    }
    return this.getSet(id);
  }

  private limpiarCondiciones(raw: unknown): Prisma.InputJsonObject {
    if (typeof raw !== "object" || raw === null) throw new BadRequestException("Datos no válidos");
    const r = raw as Record<string, unknown>;
    const txt = (v: unknown, max = 150) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const fecha = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

    return {
      fecha_fin_analisis: fecha(r.fecha_fin_analisis),
      temperatura: txt(r.temperatura, 30),
      humedad_relativa: txt(r.humedad_relativa, 30),
      micropipeta: txt(r.micropipeta),
      incubadora: txt(r.incubadora),
      analista_alimentos: txt(r.analista_alimentos),
      analista_aguas: txt(r.analista_aguas),
      responsable_lectura: txt(r.responsable_lectura),
      observaciones: txt(r.observaciones, 1000),
      revisa: txt(r.revisa),
      fecha_revision: fecha(r.fecha_revision),
      aprueba: txt(r.aprueba),
      fecha_aprobacion: fecha(r.fecha_aprobacion),
    };
  }

    /* ---------- Resumen del panel de inicio ---------- */

  async resumen() {
    const REMITIDO = "Se remite a otro laboratorio";
    type Parcial = { resultado_final: string | null; metodo_utilizado: string | null };
    // Los análisis que se remiten a otro laboratorio no cuentan como pendientes
    const faltantes = (rs: Parcial[]) =>
      rs.filter((r) => !r.resultado_final && r.metodo_utilizado !== REMITIDO).length;

    const [grupos, abiertas, proximos, clientes, muestras] = await Promise.all([
      this.prisma.set_Muestra.groupBy({ by: ["estado_set"], _count: { _all: true } }),
      this.prisma.muestra.findMany({
        where: {
          resultados: { some: {} },
          OR: [{ numero_informe: null }, { resultados: { some: { resultado_final: null } } }],
        },
        select: {
          id_muestra: true,
          codigo_muestra: true,
          nombre_muestra: true,
          numero_informe: true,
          set: {
            select: {
              id_set_muestra: true,
              codigo_set: true,
              fecha_estimada_reporte: true,
              cliente: { select: { nombre_empresa: true } },
            },
          },
          resultados: { select: { resultado_final: true, metodo_utilizado: true } },
        },
        orderBy: { id_muestra: "desc" },
        take: 300,
      }),
      this.prisma.set_Muestra.findMany({
        where: { estado_set: { in: ["Registrado", "En_Proceso"] } },
        select: {
          id_set_muestra: true,
          codigo_set: true,
          estado_set: true,
          fecha_estimada_reporte: true,
          cliente: { select: { nombre_empresa: true } },
          _count: { select: { muestras: true } },
        },
        orderBy: [{ fecha_estimada_reporte: { sort: "asc", nulls: "last" } }, { id_set_muestra: "desc" }],
        take: 8,
      }),
      this.prisma.cliente.count(),
      this.prisma.muestra.count(),
    ]);

    const porEstado: Record<string, number> = { Registrado: 0, En_Proceso: 0, Finalizado: 0, Firmado: 0 };
    for (const g of grupos) porEstado[g.estado_set] = g._count._all;

    const pendientes: Array<{
      id_muestra: number;
      codigo_muestra: string;
      nombre_muestra: string;
      faltan: number;
      total: number;
      set: (typeof abiertas)[number]["set"];
    }> = [];
    const listas: Array<{
      id_muestra: number;
      codigo_muestra: string;
      nombre_muestra: string;
      total: number;
      set: (typeof abiertas)[number]["set"];
    }> = [];

    for (const m of abiertas) {
      const faltan = faltantes(m.resultados);
      const llenos = m.resultados.filter((r) => r.resultado_final).length;
      const base = {
        id_muestra: m.id_muestra,
        codigo_muestra: m.codigo_muestra,
        nombre_muestra: m.nombre_muestra,
        total: m.resultados.length,
        set: m.set,
      };
      if (faltan > 0) pendientes.push({ ...base, faltan });
      else if (!m.numero_informe && llenos > 0) listas.push(base);
    }

    // Las que tienen la fecha de reporte más cercana primero (sin fecha, al final)
    const t = (d: Date | null) => (d ? d.getTime() : Number.MAX_SAFE_INTEGER);
    pendientes.sort((a, b) => t(a.set.fecha_estimada_reporte) - t(b.set.fecha_estimada_reporte));

    return {
      porEstado,
      clientes,
      muestras,
      totalPendientes: pendientes.length,
      pendientes: pendientes.slice(0, 8),
      totalListas: listas.length,
      listas: listas.slice(0, 8),
      proximos,
    };
  }
    /* ---------- Informe (formato F-12) ---------- */

  async getInforme(id: number) {
    const muestra = await this.prisma.muestra.findUnique({
      where: { id_muestra: id },
      include: {
        norma: { select: { id_norma: true, nombre_norma: true } },
        set: { include: { cliente: true } },
        resultados: {
          include: { analisis: { select: { nombre_analisis: true } } },
          orderBy: { analisis: { nombre_analisis: "asc" } },
        },
        usuarioElabora: { select: { id_usuario: true, nombre_completo: true, cargo: true } },
        usuarioAutoriza: { select: { id_usuario: true, nombre_completo: true, cargo: true } },
      },
    });
    if (!muestra) throw new NotFoundException("Muestra no encontrada");
    return muestra;
  }

  listarFirmantes() {
    return this.prisma.usuario.findMany({
      where: { activo: true },
      select: { id_usuario: true, nombre_completo: true, cargo: true, rol: true },
      orderBy: { nombre_completo: "asc" },
    });
  }

  /** Guarda los datos del informe; la primera vez le asigna el número consecutivo. */
  async guardarInforme(id: number, dto: GuardarInformeDto, idUsuario: number) {
    const actual = await this.prisma.muestra.findUnique({
      where: { id_muestra: id },
      select: { numero_informe: true, id_usuario_elabora: true },
    });
    if (!actual) throw new NotFoundException("Muestra no encontrada");

    for (let intento = 0; intento < 5; intento++) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const numero =
            actual.numero_informe ??
            (dto.numero_informe
              ? this.formatearCodigo(parseInt(dto.numero_informe, 10))
              : await this.siguienteNumeroInforme(tx));

          await tx.muestra.update({
            where: { id_muestra: id },
            data: {
              numero_informe: numero,
              observaciones_tecnicas: aTexto(dto.observaciones_tecnicas),
              id_usuario_elabora:
                dto.id_usuario_elabora === undefined
                  ? (actual.id_usuario_elabora ?? idUsuario)
                  : dto.id_usuario_elabora,
              id_usuario_autoriza: dto.id_usuario_autoriza,
              fecha_emision: aFecha(dto.fecha_emision) ?? new Date(),
            },
          });
        });
        return this.getInforme(id);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
        throw e;
      }
    }
    throw new ConflictException("No se pudo asignar el número de informe (¿ya existe?). Intenta de nuevo");
  }

  private async siguienteNumeroInforme(tx: Tx) {
    const filas = await tx.muestra.findMany({
      where: { numero_informe: { not: null } },
      select: { numero_informe: true },
    });
    return this.formatearCodigo(this.mayor(filas.map((f) => f.numero_informe as string)) + 1);
  }
  /* ---------- Códigos (consecutivos simples, como en los formatos del laboratorio) ---------- */

  /** Número de servicio: 001, 002, 003... */
  private async siguienteCodigoSet(tx: Tx) {
    const filas = await tx.set_Muestra.findMany({ select: { codigo_set: true } });
    return this.formatearCodigo(this.mayor(filas.map((f) => f.codigo_set)) + 1);
  }

  /** Código de muestra: 001, 002, 003... (consecutivo general) */
  private async siguienteCodigoMuestra(tx: Tx) {
    const filas = await tx.muestra.findMany({ select: { codigo_muestra: true } });
    return this.formatearCodigo(this.mayor(filas.map((f) => f.codigo_muestra)) + 1);
  }

  // Ignora los códigos viejos de prueba (SM-2026-...) y toma solo los numéricos
  private mayor(codigos: string[]) {
    return codigos.reduce((max, c) => (/^\d+$/.test(c) ? Math.max(max, parseInt(c, 10)) : max), 0);
  }

  private formatearCodigo(n: number) {
    return String(n).padStart(3, "0");
  }

  private handleError(e: unknown, mensajeFK?: string): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") throw new ConflictException("Ya existe un registro con esos datos");
      if (e.code === "P2003") {
        throw new ConflictException(mensajeFK ?? "No se puede completar: hay datos relacionados");
      }
      if (e.code === "P2025") throw new NotFoundException("Registro no encontrado");
    }
    throw e;
  }
}