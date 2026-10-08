import { Icon } from "./icon";
import { qualityPrinciples } from "@/lib/site-data";

export function Calidad() {
  return (
    <section
      id="calidad"
      className="py-space-xl bg-inverse-surface text-inverse-on-surface relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-tertiary/10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-gutter relative z-10 flex flex-col gap-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
          <div className="lg:col-span-5 flex flex-col gap-space-sm">
            <div className="w-12 h-1 bg-primary mb-2" />
            <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-widest font-semibold">
              Marco Institucional de Excelencia
            </span>
            <h2 className="font-headline-lg text-headline-lg font-bold uppercase tracking-tight text-on-primary">
              Política de Calidad
            </h2>
            <p className="font-body-lg text-body-lg text-surface-container-high leading-relaxed">
              Nuestro <strong>compromiso con la calidad</strong> es el eje
              central de todas nuestras actividades. Contamos con un
              sistema de gestión que garantiza la{" "}
              <strong>confiabilidad, precisión y trazabilidad</strong> de
              los resultados, asegurando la satisfacción de nuestros
              clientes.
            </p>
            <div className="flex items-center gap-space-xs text-primary-fixed-dim font-label-md text-label-md pt-space-xs">
              <Icon name="workspace_premium" className="text-lg" />
              <span>Conformidad estricta ISO/IEC 17025:2017</span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              {qualityPrinciples.map((principle, i) => (
                <div
                  key={principle.label}
                  className="bg-surface-container-lowest/10 backdrop-blur-sm p-space-sm rounded-lg flex flex-col items-center text-center gap-2"
                >
                  <Icon
                    name={principle.icon}
                    className={`text-3xl ${i % 2 === 0 ? "text-primary-fixed" : "text-on-tertiary-container"}`}
                  />
                  <span className="font-label-md text-label-md text-on-primary font-semibold">
                    {principle.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}