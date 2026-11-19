export type CNC = "C" | "NC" | "";

export interface Acta {
  contacto_telefono: string;
  contacto_correo: string;
  toma: { cumple: CNC; hallazgos: string; accion: string };
  recepcion: { responsable: string; cumple: CNC; hallazgos: string; accion: string };
  parametros_observaciones: string;
  transporte: {
    medio: string;
    temperatura: string;
    cumple: CNC;
    cadena_frio: "SI" | "NO" | "";
    hallazgos: string;
    accion: string;
  };
  entrega: {
    fecha_entrega: string;
    fecha_aprobacion: string;
    fecha_emision: string;
    hallazgos: string;
    accion: string;
  };
  disposicion: {
    fecha_ingreso: string;
    ubicacion: string;
    fecha_eliminacion_tentativa: string;
    fecha_eliminacion_real: string;
    hallazgos: string;
    accion: string;
  };
  representante_laboratorio: string;
  aprueba_servicio: string;
}

export const ACTA_VACIA: Acta = {
  contacto_telefono: "",
  contacto_correo: "",
  toma: { cumple: "", hallazgos: "", accion: "" },
  recepcion: { responsable: "", cumple: "", hallazgos: "", accion: "" },
  parametros_observaciones: "",
  transporte: { medio: "", temperatura: "", cumple: "", cadena_frio: "", hallazgos: "", accion: "" },
  entrega: { fecha_entrega: "", fecha_aprobacion: "", fecha_emision: "", hallazgos: "", accion: "" },
  disposicion: {
    fecha_ingreso: "",
    ubicacion: "",
    fecha_eliminacion_tentativa: "",
    fecha_eliminacion_real: "",
    hallazgos: "",
    accion: "",
  },
  representante_laboratorio: "",
  aprueba_servicio: "",
};

/** Completa el acta guardada con valores por defecto (quien recibió, fecha de ingreso). */
export function completarActa(
  guardada: Partial<Acta> | null | undefined,
  defecto: { responsableRecepcion: string; fechaIngreso: string },
): Acta {
  const g = guardada ?? {};
  return {
    contacto_telefono: g.contacto_telefono ?? "",
    contacto_correo: g.contacto_correo ?? "",
    toma: { ...ACTA_VACIA.toma, ...g.toma },
    recepcion: {
      ...ACTA_VACIA.recepcion,
      ...g.recepcion,
      responsable: g.recepcion?.responsable || defecto.responsableRecepcion,
    },
    parametros_observaciones: g.parametros_observaciones ?? "",
    transporte: { ...ACTA_VACIA.transporte, ...g.transporte },
    entrega: { ...ACTA_VACIA.entrega, ...g.entrega },
    disposicion: {
      ...ACTA_VACIA.disposicion,
      ...g.disposicion,
      fecha_ingreso: g.disposicion?.fecha_ingreso || defecto.fechaIngreso,
    },
    representante_laboratorio: g.representante_laboratorio || defecto.responsableRecepcion,
    aprueba_servicio: g.aprueba_servicio ?? "",
  };
}

export const NOTA_TIPOS = "NOTA: Tipo de muestra Agua (A); Alimento (AL); Manipulador (MA); Superficie (S); Ambiente (AM)";

export const NOTA_CUMPLE =
  "NOTA: Cumple (C); No Cumple (NC); SI/NO: marque con una X en el recuadro correspondiente; MRC: Material de Referencia Certificado.";

export const NOTA_CLIENTE =
  "El cliente es responsable de la recolección, almacenamiento y transporte cuando envía la muestra al laboratorio. *Los resultados derivados de los análisis son válidos únicamente para la muestra analizada. El proceso técnico de actividades de confirmación o reconfirmación no garantizan que un resultado preliminar concuerde con un resultado final. El valor definitivo de un resultado estará únicamente determinado por el reporte final debidamente avalado por la coordinadora técnica del laboratorio de microbiología.";