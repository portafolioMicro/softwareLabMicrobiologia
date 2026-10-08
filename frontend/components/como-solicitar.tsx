import { steps } from "@/lib/site-data";

const numberBg = {
  primary: "bg-primary-container text-on-primary",
  tertiary: "bg-tertiary-container text-on-tertiary",
  secondary: "bg-secondary text-on-secondary",
} as const;

const tagColor = {
  primary: "text-primary",
  tertiary: "text-tertiary",
  secondary: "text-secondary",
} as const;

export function ComoSolicitar() {
  return (
    <section className="py-space-xl bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs text-center max-w-2xl mx-auto">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            Protocolo de Atención al Usuario
          </span>
          <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface font-bold">
            ¿Cómo Solicitar un Servicio?
          </h2>
          <p className="font-body-md text-body-md text-secondary">
            Flujo sistemático de cinco etapas estandarizadas para
            garantizar la trazabilidad analítica y la entrega formal de
            certificados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-space-sm items-stretch">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between"
            >
              <div className="flex flex-col gap-space-xs">
                <div
                  className={`w-10 h-10 rounded-lg font-headline-sm text-headline-sm flex items-center justify-center font-bold mb-2 ${numberBg[step.color]}`}
                >
                  {step.number}
                </div>
                <h3 className="font-title-md text-title-md text-on-surface font-bold">
                  {step.title}
                </h3>
                <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
              <span className={`font-label-sm text-label-sm font-semibold mt-4 ${tagColor[step.color]}`}>
                {step.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}