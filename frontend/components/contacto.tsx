import { Icon } from "./icon";
import { contactInfo } from "@/lib/site-data";

export function Contacto() {
  const { address, email, phone, whatsapp } = contactInfo;

  return (
    <section id="contacto" className="py-space-xl bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-space-xl">
        <div className="flex flex-col gap-space-xs max-w-3xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
            Canales Directos de Atención
          </span>
          <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface font-bold">
            Contacto y Ubicación Institucional
          </h2>
          <p className="font-body-lg text-body-lg text-secondary">
            Comuníquese directamente con nuestro equipo de profesionales
            para cotizaciones, envío de muestras o asesoría sobre normas
            microbiológicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Dirección */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between">
            <div className="flex flex-col gap-space-xs">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1">
                <Icon name="location_on" className="text-2xl" />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">
                {address.title}
              </h3>
              <p className="font-body-sm text-body-sm text-secondary">
                {address.lines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < address.lines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-semibold mt-4">
              {address.tag}
            </span>
          </div>

          {/* Correo */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between">
            <div className="flex flex-col gap-space-xs">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center mb-1">
                <Icon name="mail" className="text-2xl" />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">
                {email.title}
              </h3>
              <p className="font-body-sm text-body-sm text-secondary">
                {email.desc}
              </p>
              <a
                href={`mailto:${email.address}`}
                className="font-label-md text-label-md text-tertiary hover:underline font-semibold break-all pt-1"
              >
                {email.address}
              </a>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary font-semibold mt-4">
              {email.tag}
            </span>
          </div>

          {/* Teléfono */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between">
            <div className="flex flex-col gap-space-xs">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1">
                <Icon name="call" className="text-2xl" />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">
                {phone.title}
              </h3>
              <p className="font-body-sm text-body-sm text-secondary">
                {phone.desc}
              </p>
              <a
                href={phone.numberHref}
                className="font-label-lg text-label-lg text-on-surface font-bold hover:text-primary"
              >
                {phone.number}
              </a>
              <span className="font-label-sm text-label-sm text-secondary">
                Extensión: <strong>{phone.ext}</strong>
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary mt-4">
              {phone.schedule}
            </span>
          </div>

          {/* WhatsApp */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between">
            <div className="flex flex-col gap-space-xs">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center mb-1">
                <Icon name="chat" className="text-2xl" />
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">
                {whatsapp.title}
              </h3>
              <p className="font-body-sm text-body-sm text-secondary">
                {whatsapp.desc}
              </p>
              <div className="flex flex-col gap-1 pt-1">
                {whatsapp.lines.map((line) => (
                  <a
                    key={line.href}
                    href={line.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="font-label-md text-label-md text-tertiary hover:underline font-bold flex items-center gap-1"
                  >
                    <Icon name="send" className="text-base" /> {line.label}
                  </a>
                ))}
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary font-semibold mt-4">
              {whatsapp.tag}
            </span>
          </div>
        </div>

        {/* Barra de acreditación */}
        <div className="bg-surface-container p-space-md rounded-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xl flex-shrink-0">
              <Icon name="military_tech" className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-surface font-bold">
                Reacreditación Institucional Multicampus de Alta Calidad
                2021-2027
              </span>
              <span className="font-body-sm text-body-sm text-secondary">
                Resolución Ministerio de Educación Nacional n.° 015865
                (25-08-2021) • Vigilada Mineducación
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm text-secondary font-label-md text-label-md">
            <span className="font-semibold text-on-surface">
              Redes Oficiales:
            </span>
            <span className="bg-surface-container-lowest px-2 py-1 rounded text-primary font-bold">
              @unilibrepereira
            </span>
            <span className="bg-surface-container-lowest px-2 py-1 rounded text-primary font-bold">
              @labmicrobiologiaulp
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}