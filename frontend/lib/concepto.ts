export const REMITIDO = "Se remite a otro laboratorio";

export const TECNICAS = ["Recuento en placa", "Identificación en placa"];

export const UNIDADES = [
  "U.F.C. / g",
  "U.F.C. / mL",
  "U.F.C. / 100 mL",
  "U.F.C. / cm²",
  "N.M.P. / g",
  "N.M.P. / 100 mL",
  "Presencia / Ausencia en 25 g",
  "Presencia / Ausencia en 25 mL",
];

type Medida = { valor: number; menorQue: boolean } | "AUS" | "PRES" | null;

export function leerResultado(texto: string): Medida {
  const t = texto.trim().toLowerCase();
  if (!t) return null;
  if (/^(ausencia|ausente)/.test(t)) return "AUS";
  if (/^presencia/.test(t)) return "PRES";
  if (/^(incontable|tntc|>)/.test(t)) return { valor: Infinity, menorQue: false };

  const menorQue = t.startsWith("<");
  const limpio = t.replace(/^[<≤]\s*/, "");
  const cientifica = /^(\d+(?:[.,]\d+)?)\s*[x×*]\s*10\s*\^?\s*(\d+)$/.exec(limpio);
  if (cientifica) {
    return { valor: parseFloat(cientifica[1].replace(",", ".")) * 10 ** Number(cientifica[2]), menorQue };
  }
  const n = parseFloat(limpio.replace(",", "."));
  return Number.isFinite(n) ? { valor: n, menorQue } : null;
}

type Referencia =
  | { tipo: "ausencia" }
  | { tipo: "limites"; m?: number; mEstricto: boolean; M?: number }
  | null;

export function leerReferencia(texto: string | null): Referencia {
  if (!texto) return null;
  if (/^ausencia/i.test(texto.trim())) return { tipo: "ausencia" };

  const num = (s?: string) => (s === undefined ? undefined : parseFloat(s.replace(",", ".")));
  const m = /m:\s*(<?)\s*(\d+(?:[.,]\d+)?)/.exec(texto);
  const M = /M:\s*(\d+(?:[.,]\d+)?)/.exec(texto);
  const max = /Máx:\s*(\d+(?:[.,]\d+)?)/.exec(texto);
  if (!m && !M && !max) return null; // por ejemplo, la clasificación de la NTC 5230

  return {
    tipo: "limites",
    m: num(m?.[2]),
    mEstricto: m?.[1] === "<",
    M: num(M?.[1] ?? max?.[1]),
  };
}

/** Sugiere el concepto del informe. El analista siempre puede editarlo. */
export function sugerirConcepto(
  resultado: string,
  referencia: string | null,
  analisis: string,
  remitido: boolean,
): string {
  if (remitido) return "";
  const r = leerResultado(resultado);
  if (!r) return "";
  const ref = leerReferencia(referencia);

  if (ref?.tipo === "ausencia") {
    if (r === "AUS") return "Conforme";
    if (r === "PRES") return "No conforme";
    return "";
  }

  if (ref?.tipo === "limites") {
    if (typeof r === "string") return r === "AUS" ? "Conforme" : "No conforme";
    const limite = ref.M ?? ref.m;
    if (limite === undefined) return "";
    const estricto = ref.M === undefined && ref.mEstricto;
    if (r.menorQue) return r.valor <= limite ? "Conforme" : ""; // "<x" con x mayor al límite no permite concluir
    return (estricto ? r.valor < limite : r.valor <= limite) ? "Conforme" : "No conforme";
  }

  // Sin valor de referencia: se describe si hubo desarrollo, como en los informes del laboratorio
  if (typeof r === "string") {
    return r === "AUS"
      ? "La muestra analizada no evidencia desarrollo del microorganismo analizado"
      : `La muestra analizada evidencia desarrollo de ${analisis}`;
  }
  const sinCrecimiento = r.menorQue ? r.valor <= 1 : r.valor === 0;
  return sinCrecimiento
    ? "La muestra analizada no evidencia desarrollo del microorganismo analizado"
    : `La muestra analizada evidencia desarrollo de ${analisis}`;
}

/** Unidad según el valor de referencia; si es ambigua ("g o mL") la deja vacía. */
export function unidadSugerida(referencia: string | null): string {
  if (!referencia) return "";
  if (/UFC\/g o mL/.test(referencia)) return "";
  const m = /(UFC|NMP)\/(100 mL|250 mL|50 mL|cm²|g|mL)/.exec(referencia);
  if (!m) return "";
  return `${m[1] === "UFC" ? "U.F.C." : "N.M.P."} / ${m[2]}`;
}