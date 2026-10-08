import { Icon } from "./icon";
import { sectors, matrixBlocks, extraMatrices } from "@/lib/site-data";

const colorMap = {
  primary: "text-primary",
  tertiary: "text-tertiary",
  secondary: "text-secondary",
} as const;

export function Sectores() {
  return (
    <section id="sectores" className="py-space-xl bg-surface">
      <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs max-w-3xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            Cobertura Productiva Integral
          </span>
          <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface font-bold">
            Sectores que Impulsamos
          </h2>
          <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
            Ofrecemos soluciones microbiológicas adaptadas a diferentes
            sectores productivos, alineadas con sus necesidades técnicas y
            requisitos normativos nacionales e internacionales.
          </p>
        </div>

        {/* Íconos de sectores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-space-sm">
          {sectors.map((sector) => (
            <div
              key={sector.label}
              className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm flex flex-col items-center text-center gap-1"
            >
              <Icon name={sector.icon} className={`text-2xl ${colorMap[sector.color]}`} />
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {sector.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bloques de matrices (Lácteos / Frutas-Vegetales) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {matrixBlocks.map((block) => (
            <div
              key={block.title}
              className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between"
            >
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <Icon name={block.icon} className={`text-2xl ${colorMap[block.color]}`} />
                  <h3 className={`font-headline-sm text-headline-sm uppercase font-bold ${colorMap[block.color]}`}>
                    {block.title}
                  </h3>
                </div>
                <p className="font-body-md text-body-md text-secondary">
                  {block.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                  <div className="bg-surface-container-low p-space-sm rounded-lg">
                    <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider block mb-2">
                      Matrices Analizadas:
                    </span>
                    <ul className="flex flex-col gap-1 font-body-sm text-body-sm text-secondary">
                      {block.products.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-surface-container-low p-space-sm rounded-lg">
                    <span
                      className={`font-label-md text-label-md font-bold uppercase tracking-wider block mb-2 ${colorMap[block.color]}`}
                    >
                      Controles Microbiológicos:
                    </span>
                    <ul className="flex flex-col gap-1 font-body-sm text-body-sm text-secondary">
                      {block.controls.map((c) => (
                        <li key={c.text}>
                          •{" "}
                          {c.italic ? (
                            <span className="italic font-medium text-on-surface">
                              {c.text}
                            </span>
                          ) : (
                            c.text
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-space-md pt-space-sm flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary">
                  {block.footerNote}
                </span>
                <span className="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded font-semibold">
                  {block.footerBadge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Cárnicos / Panadería / Superficies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {extraMatrices.map((matrix) => (
            <div
              key={matrix.title}
              className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-xs"
            >
              <div className={`flex items-center gap-space-xs ${colorMap[matrix.color]}`}>
                <Icon name={matrix.icon} className="text-xl" />
                <h4 className="font-title-md text-title-md font-bold">
                  {matrix.title}
                </h4>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                {matrix.desc}
              </p>
              <div className="text-xs text-secondary mt-1">
                <strong>Indicadores:</strong> {matrix.indicators}
              </div>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div className="bg-surface-container p-space-md rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
              <Icon name="info" className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-title-md text-title-md text-on-surface font-bold uppercase">
                ¿No encuentra su producto en la lista?
              </h4>
              <p className="font-body-sm text-body-sm text-secondary">
                Le orientamos técnicamente para seleccionar el ensayo
                microbiológico más adecuado según su proceso y
                normatividad aplicable.
              </p>
            </div>
          </div>
          <a
            href="#contacto"
            className="font-label-md text-label-md bg-on-surface text-surface px-5 py-2.5 rounded-lg font-semibold hover:bg-primary transition-colors flex-shrink-0"
          >
            Consultar con Especialista
          </a>
        </div>
      </div>
    </section>
  );
}