import Link from "next/link";
import { Icon } from "./icon";
import { navLinks } from "@/lib/site-data";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      <div className="h-20 max-w-7xl mx-auto px-gutter flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm flex-shrink-0">
            <Icon name="biotech" className="text-2xl" />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm tracking-tight text-primary uppercase">
                UNILIBRE
              </span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-tertiary font-semibold">
                PEREIRA
              </span>
            </div>
            <span className="font-title-md text-[13px] leading-tight text-on-surface font-semibold">
              Laboratorio de Microbiología
            </span>
            <span className="font-label-sm text-label-sm text-secondary">
              Facultad de Ciencias de la Salud, Exactas y Naturales
            </span>
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-space-md">
          {navLinks.map((link) => {
            return (
              <a
                key={link.href}
                href={link.href}
                className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors px-2 py-1"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-space-sm">
          <Link
            href="#contacto"
            className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-all text-center flex items-center gap-space-xs"
          >
            <Icon name="request_quote" className="text-lg" />
            <span>Solicitar Cotización</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Icon name="person" className="text-on-primary text-[18px]" />
          </div>
        </div>
      </div>
    </header>
  );
}