import Image from "next/image";
import { Icon } from "./icon";
import { trustReasons } from "@/lib/site-data";

export function QuienesSomos() {
  return (
    <section id="quienes-somos" className="py-space-xl bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
          {/* Caja roja institucional */}
          <div className="lg:col-span-5 bg-primary-container text-on-primary p-space-lg lg:p-space-xl rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 opacity-10">
              <Icon name="biotech" className="text-[180px]" />
            </div>
            <div className="relative z-10 flex flex-col gap-space-md">
              <div className="inline-flex items-center gap-space-xs bg-primary/60 px-3 py-1 rounded w-fit">
                <Icon name="hub" className="text-on-primary-container text-sm" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container font-semibold">
                  Identidad Institucional
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg uppercase font-bold tracking-tight">
                ¿Quiénes Somos?
              </h2>
              <p className="font-body-lg text-body-lg text-on-primary leading-relaxed font-normal">
                Somos un laboratorio especializado en análisis
                microbiológicos que opera bajo un sistema de gestión de
                calidad alineado con la norma{" "}
                <strong>ISO/IEC 17025:2017</strong>, garantizando la
                competencia técnica, la trazabilidad y la confiabilidad de
                los resultados.
              </p>
            </div>
            <div className="relative z-10 pt-space-lg">
              <div className="bg-primary/40 p-space-sm rounded-lg flex items-center gap-space-sm">
                <Icon name="policy" className="text-on-primary-container text-2xl" />
                <span className="font-body-sm text-body-sm text-on-primary font-medium">
                  Resolución MEN n.° 015865 • Seccional Pereira
                </span>
              </div>
            </div>
          </div>

          {/* Feature + 6 pilares */}
          <div className="lg:col-span-7 flex flex-col gap-space-md justify-between">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row gap-space-md items-center">
              <div className="w-full sm:w-48 h-36 rounded-lg overflow-hidden flex-shrink-0 relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC4OKWnA20XcvXBHaDFOa0EQ_9kVwqaNmq_E6GqtokK41fSBaEwsqoGEmOhfWr6CpGl-qInD2427bBT2lq4LWO-bcejh1DfE787nXu79LPhC1MeAb529bWoJGEoiou1DUEK2QZQlEP25HmAbyOC073xg1ex6TyWNfloMN6lgwJvgtBmqn2H7pb05Jvn8eUl0i3Ta99PhwnFffr09iwp3ey837bWtOquCZm_XIytzf4"
                  alt="Manos con guantes de nitrilo morados sosteniendo caja de Petri con cultivo bacteriano"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                  Aseguramiento de Calidad
                </span>
                <h3 className="font-title-lg text-title-lg text-on-surface">
                  Capacidad Diagnóstica &amp; Validación
                </h3>
                <p className="font-body-sm text-body-sm text-secondary">
                  Aplicamos metodologías analíticas normalizadas (ISO,
                  AOAC, Standard Methods, INVIMA) garantizando
                  reproducibilidad y detección oportuna de microorganismos
                  alterantes y patógenos.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase font-bold tracking-tight">
                  ¿Por Qué Confiar en Nosotros?
                </h3>
                <span className="font-label-sm text-label-sm text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded font-semibold">
                  6 Pilares Clave
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {trustReasons.map((reason) => (
                  <div key={reason.title} className="flex items-start gap-space-xs">
                    <Icon
                      name={reason.icon}
                      className={`text-xl flex-shrink-0 mt-0.5 ${
                        reason.color === "primary" ? "text-primary" : "text-tertiary"
                      }`}
                    />
                    <div>
                      <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                        {reason.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-secondary">
                        {reason.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}