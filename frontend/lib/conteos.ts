export interface Condiciones {
  fecha_fin_analisis: string;
  temperatura: string;
  humedad_relativa: string;
  micropipeta: string;
  incubadora: string;
  analista_alimentos: string;
  analista_aguas: string;
  responsable_lectura: string;
  observaciones: string;
  revisa: string;
  fecha_revision: string;
  aprueba: string;
  fecha_aprobacion: string;
}

export const CONDICIONES_VACIAS: Condiciones = {
  fecha_fin_analisis: "",
  temperatura: "",
  humedad_relativa: "",
  micropipeta: "",
  incubadora: "",
  analista_alimentos: "",
  analista_aguas: "",
  responsable_lectura: "",
  observaciones: "",
  revisa: "",
  fecha_revision: "",
  aprueba: "",
  fecha_aprobacion: "",
};

export function completarCondiciones(guardadas?: Partial<Condiciones> | null): Condiciones {
  return { ...CONDICIONES_VACIAS, ...guardadas };
}

/** Columnas fijas del F-11 y el análisis del catálogo que va en cada una. */
export const COLUMNAS: { titulo: string; analisis: string }[] = [
  { titulo: "Rto. Mesófilos", analisis: "Aerobios mesófilos" },
  { titulo: "Rto. Coliformes Totales", analisis: "Coliformes" },
  { titulo: "Rto. E. coli", analisis: "Escherichia coli" },
  { titulo: "Rto. S. aureus coag. (+)", analisis: "Staphylococcus coagulasa positiva" },
  { titulo: "Rto. Mohos", analisis: "Mohos" },
  { titulo: "Rto. Levaduras", analisis: "Levaduras" },
  { titulo: "Bacillus cereus", analisis: "Bacillus cereus" },
  { titulo: "Pseudomonas aeruginosa", analisis: "Pseudomonas aeruginosa" },
  { titulo: "Clostridium sulfito reductor (R)", analisis: "Clostridium sulfito reductor" },
  { titulo: "Salmonella", analisis: "Salmonella spp." },
  { titulo: "Listeria monocytogenes (R)", analisis: "Listeria monocytogenes" },
];