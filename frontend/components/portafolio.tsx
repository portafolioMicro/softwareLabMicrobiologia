import { Icon } from "./icon";
import { portfolioPdfUrl } from "@/lib/site-data";

export function Portafolio() {
  return (
    <section id="portafolio" className="py-space-xl bg-surface">
      <div className="max-w-7xl mx-auto px-gutter">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg lg:p-space-xl shadow-md flex flex-col lg:flex-row items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="w-16 h-20 bg-primary-fixed rounded-lg flex flex-col items-center justify-center text-primary-container flex-shrink-0 shadow-sm">
              <Icon name="picture_as_pdf" className="text-4xl" />
              <span className="font-label-sm text-[10px] font-bold uppercase mt-1">
                PDF OFICIAL
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wide">
                Documentación Institucional
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Portafolio Oficial de Servicios Microbiológicos
              </h3>
              <p className="font-body-md text-body-md text-secondary max-w-xl">
                Consulte la versión digitalizada completa del folleto de
                servicios, alcances analíticos, especificaciones de ensayo
                y recomendaciones de toma de muestras.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm w-full lg:w-auto justify-end">
            <a
              href="#contacto"
              className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-5 py-3 rounded-lg font-semibold transition-colors flex items-center gap-space-xs"
            >
              <Icon name="help" className="text-lg" />
              <span>Requisitos de Muestra</span>
            </a>
            <a
              href={portfolioPdfUrl}
              download
              className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-space-xs shadow-sm"
            >
              <Icon name="download" className="text-lg" />
              <span>Descargar Portafolio (PDF)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}