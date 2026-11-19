import type { ResultadoFila } from "./api";

export const TIPOS_MUESTRA: Record<string, string> = {
  A: "Agua",
  AL: "Alimento",
  MA: "Manipulador",
  S: "Superficie",
  AM: "Ambiente",
};

export const OBSERVACIONES_TECNICAS_FIJAS = [
  "El Laboratorio de Prestación de Servicios de la Universidad Libre – Sede Belmonte, cuenta con seguimiento de la Secretaría de Salud de Risaralda, conforme a lo establecido en la Resolución 1619 de 2015, para la realización de análisis microbiológicos en alimentos destinados al consumo humano.",
  "Los ensayos en matrices de alimentos se realizan bajo métodos normalizados (ISO-NTC aplicables, Standard Methods for the Examination of Water and Wastewater y métodos oficiales de AOAC International), garantizando competencia técnica y trazabilidad metrológica cuando aplica.",
  "La incertidumbre expandida (Uexp) se reporta para resultados cuantitativos superiores al límite de detección del método. Para resultados inferiores a dicho límite, no se reporta incertidumbre.",
  "Cuando el muestreo es realizado por el cliente, el laboratorio no asume responsabilidad sobre la representatividad, condiciones de transporte ni conservación de la muestra. La información suministrada sobre la muestra es responsabilidad del cliente.",
];

export const OBSERVACIONES_GENERALES = [
  "Los resultados consignados aplican únicamente a las muestras e ítems ensayados.",
  "La reproducción total o parcial de este informe requiere autorización escrita del laboratorio.",
  "La información contenida en este informe es confidencial y se entrega exclusivamente al cliente o a autoridades competentes cuando sea requerido legalmente.",
  "El laboratorio no se responsabiliza por el uso inadecuado de la información ni por decisiones tomadas con base en muestras no representativas o información suministrada por el cliente.",
];

export const ABREVIATURAS =
  "N.R.: No reporta, N.E.: No establecido, N: No acreditado, Uexp: Incertidumbre expandida, L.D.: Límite de detección, *: Resultado por fuera del parámetro establecido, N.A.: No Aplica";

export const PIE = [
  "Pereira, Campus Belmonte",
  "Avenida Las Américas Carrera 28 No. 96-102.",
  "Tel.(606) 340 1043 - Ext. 6882",
];

/** Arma la observación técnica a partir de los conceptos: "La muestra analizada evidencia desarrollo de A y B" */
export function sugerirObservaciones(resultados: ResultadoFila[]): string {
  const prefijo = "La muestra analizada evidencia desarrollo de ";
  const nombres = resultados
    .map((r) => r.concepto ?? "")
    .filter((c) => c.startsWith(prefijo))
    .map((c) => c.slice(prefijo.length));
  if (nombres.length === 0) return "";
  const lista =
    nombres.length === 1
      ? nombres[0]
      : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
  return prefijo + lista;
}

/** Fecha de hoy en hora local, formato AAAA-MM-DD */
export function hoy() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}