import Image from "next/image";
import { Icon } from "./icon";
import { specialties } from "@/lib/site-data";

const colorMap = {
  primary: "bg-primary-container text-on-primary",
  tertiary: "bg-tertiary-container text-on-tertiary",
  secondary: "bg-secondary text-on-secondary",
} as const;

const titleColorMap = {
  primary: "text-primary",
  tertiary: "text-tertiary",
  secondary: "text-on-surface",
} as const;

export function Especialidades() {
  return (
    <section id="especialidades" className="py-space-xl bg-surface">
      <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-xs max-w-3xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            Líneas Analíticas Principales
          </span>
          <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface font-bold">
            Somos Especialistas en:
          </h2>
          <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
            El acompañamiento a empresas e instituciones en el control
            microbiológico de sus productos, procesos y ambientes,
            permitiendo prevenir riesgos, cumplir la normatividad vigente y
            garantizar la calidad de sus operaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {specialties.map((item) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center gap-space-md relative overflow-hidden group"
            >
              <div className="w-full sm:w-44 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container relative">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col gap-space-xs w-full">
                <div className="flex items-center gap-space-xs">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[item.color]}`}
                  >
                    <Icon name={item.icon} className="text-base" />
                  </div>
                  <span
                    className={`font-title-md text-title-md font-bold ${titleColorMap[item.color]}`}
                  >
                    {item.title}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-secondary leading-relaxed">
                  {item.desc}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}