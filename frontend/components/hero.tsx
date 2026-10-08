import Image from "next/image";
import { Icon } from "./icon";
import { heroPillars } from "@/lib/site-data";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-surface py-space-xl lg:py-24"
    >
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 bg-tertiary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-gutter relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="inline-flex items-center gap-space-xs bg-surface-container px-3 py-1.5 rounded-full self-start shadow-sm">
              <Icon name="verified" className="text-primary text-base" />
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-semibold">
                Norma ISO/IEC 17025:2017 • Alta Calidad Multicampus
              </span>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-primary uppercase font-bold tracking-tight">
                Facultad de Ciencias de la Salud, Exactas y Naturales
              </span>
              <h1 className="font-display-lg text-display-lg text-on-surface uppercase tracking-tight">
                Portafolio de Servicios de{" "}
                <span className="text-primary-container">Microbiología</span>
              </h1>
              <p className="font-title-lg text-title-lg text-secondary font-medium mt-space-xs">
                Universidad Libre Seccional Pereira
              </p>
            </div>

            <p className="font-body-lg text-body-lg text-secondary leading-relaxed max-w-2xl">
              Transformamos los resultados microbiológicos en información
              útil para la toma de decisiones con el más alto rigor
              científico, competencia técnica y respaldo universitario.
            </p>

            <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
              <a
                href="#especialidades"
                className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-6 py-3.5 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-space-xs"
              >
                <Icon name="science" className="text-lg" />
                <span>Ver Portafolio de Especialidades</span>
              </a>
              <a
                href="#contacto"
                className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-6 py-3.5 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-space-xs"
              >
                <Icon name="contact_support" className="text-lg text-primary" />
                <span>Canales de Contacto Directo</span>
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-lg">
              {heroPillars.map((pillar) => {
                return (
                  <div
                    key={pillar.title}
                    className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm flex flex-col gap-1"
                  >
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center mb-1 ${
                        pillar.color === "primary"
                          ? "bg-primary/10 text-primary"
                          : "bg-tertiary/10 text-tertiary"
                      }`}
                    >
                      <Icon name={pillar.icon} className="text-xl" />
                    </div>
                    <span className="font-label-md text-label-md text-on-surface font-bold uppercase">
                      {pillar.title}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary leading-tight">
                      {pillar.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-surface-container-lowest">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuIcGdDso212zDxWwIJnQ0pyM2wcAU-Od6cSOTenxRy92W5YOH4NnrVipF_bb8QfMJSJCrmcRCtjpIMppLWcShWfJraeLnYsU2G-VygNscPpcNU8Y-9fkG5HPJXxAt8WEWHDEAfPx1WdHDxc3ZNKLjoIGRo-0Qoud32GUZekOsuXifvRNpioeeZBD6xThQPdB8l9cUnbElyMC38rGs1hyfLs90H6R17TxYRh3qmmNy"
                alt="Microbióloga con traje estéril analizando cultivos celulares en microscopio de alta precisión"
                width={800}
                height={460}
                className="w-full h-[460px] object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex flex-col justify-end p-space-lg text-on-primary">
                <div className="flex items-center gap-space-xs mb-1">
                  <Icon
                    name="medical_services"
                    className="text-primary-fixed-dim text-lg"
                  />
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary-fixed">
                    Campus Belmonte • Pereira
                  </span>
                </div>
                <p className="font-title-md text-title-md font-bold">
                  Unidad de Ensayos Microbiológicos
                </p>
                <p className="font-body-sm text-body-sm text-surface-container leading-relaxed">
                  Infraestructura analítica certificada para matrices de
                  alimentos, agua, saneamiento y superficies industriales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}