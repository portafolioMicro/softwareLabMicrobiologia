import { Icon } from "./icon";
import { whatsappFloatHref } from "@/lib/site-data";

export function WhatsappFloat() {
  return (
    <aside className="fixed bottom-6 right-6 z-40 flex items-center group">
      <a
        href={whatsappFloatHref}
        rel="noopener noreferrer"
        target="_blank"
        className="relative flex items-center gap-space-xs bg-tertiary-container hover:bg-tertiary text-on-tertiary px-space-md py-space-sm rounded-full shadow-[0_4px_16px_rgba(0,101,154,0.3)] transition-all hover:scale-105"
      >
        <Icon name="chat" className="text-2xl" />
        <div className="flex flex-col text-left">
          <span className="font-label-sm text-label-sm text-on-tertiary-container font-semibold uppercase tracking-wider">
            Atención Directa
          </span>
          <span className="font-label-lg text-label-lg text-on-tertiary font-bold">
            WhatsApp Asesor
          </span>
        </div>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed-dim opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-container" />
        </span>
      </a>
    </aside>
  );
}