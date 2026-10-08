import { Icon } from "./icon";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface pt-space-xl pb-space-lg shadow-[0_-1px_6px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                <Icon name="school" className="text-lg" />
              </div>
              <span className="font-headline-sm text-headline-sm text-primary uppercase font-bold">
                UNIVERSIDAD LIBRE
              </span>
            </div>
            <p className="font-label-md text-label-md text-tertiary font-semibold tracking-wide uppercase">
              Scientia Fons Libertatis
            </p>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              Acreditación Institucional Multicampus de Alta Calidad por 6
              años mediante Resolución n.° 015865 del MEN. Vigilada
              Mineducación.
            </p>
            <div className="flex items-center gap-space-sm text-secondary pt-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                @unilibrepereira
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                @labmicrobiologiaulp
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-title-md text-title-md text-on-surface">
              Ubicación Institucional
            </h4>
            <p className="font-body-sm text-body-sm text-secondary">
              Campus Universitario Belmonte
              <br />
              Avenida Las Américas n.° 104-50
              <br />
              Pereira, Risaralda, Colombia
            </p>
            <p className="font-body-sm text-body-sm text-secondary">
              Laboratorio de Ensayos Microbiológicos
              <br />
              Edificio de Ciencias de la Salud, Piso 2
            </p>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-title-md text-title-md text-on-surface">
              Contacto y Asesoría
            </h4>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-secondary">
              {/* TODO: confirmar estos datos institucionales */}
              <li>PBX: +57 (606) 340 1081 Ext. 140 / 142</li>
              <li>Línea Directa: +57 (606) 340 1085</li>
              <li>Correo: lab.microbiologia.pei@unilibre.edu.co</li>
              <li>Recepción de Muestras: Lun a Vie 07:30 - 17:00</li>
            </ul>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-title-md text-title-md text-on-surface">
              Garantía y Acreditación
            </h4>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              Laboratorio bajo sistema de gestión de calidad conforme a
              requisitos de la norma ISO/IEC 17025:2017 para ensayos
              microbiológicos en alimentos, aguas y superficies.
            </p>
            <div className="flex items-center gap-space-xs pt-space-xs text-tertiary font-label-md text-label-md">
              <Icon name="verified" className="text-base" />
              <span>Ensayos de Aptitud Interlaboratorios</span>
            </div>
          </div>
        </div>

        <div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-center md:text-left">
          <p className="font-body-sm text-body-sm text-secondary">
            © {new Date().getFullYear()} Universidad Libre Seccional
            Pereira. Todos los derechos reservados. Información
            estrictamente confidencial bajo políticas institucionales de
            custodia de datos analíticos.
          </p>
          <div className="flex items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
            <a href="#politica-datos" className="hover:text-primary transition-colors">
              Política de Privacidad
            </a>
            <a href="#cadena-custodia" className="hover:text-primary transition-colors">
              Cadena de Custodia
            </a>
            <a href="#iso-17025" className="hover:text-primary transition-colors">
              Términos de Ensayos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}