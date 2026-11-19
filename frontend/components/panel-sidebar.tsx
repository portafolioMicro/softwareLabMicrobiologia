"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";
import type { Usuario } from "@/lib/api";

type Rol = Usuario["rol"];

const navItems: { href: string; label: string; icon: string; roles: Rol[] }[] = [
  { href: "/panel", label: "Inicio", icon: "dashboard", roles: ["Administrador", "Analista", "Tecnico"] },
  { href: "/panel/clientes", label: "Clientes", icon: "groups", roles: ["Administrador", "Analista", "Tecnico"] },
  { href: "/panel/catalogo", label: "Catálogo", icon: "science", roles: ["Administrador", "Analista", "Tecnico"] },
  { href: "/panel/sets", label: "Sets de muestras", icon: "inventory_2", roles: ["Administrador", "Analista", "Tecnico"] },
  { href: "/panel/usuarios", label: "Usuarios", icon: "manage_accounts", roles: ["Administrador"] },
  // Aquí iremos agregando: Sets de muestra, Muestras, Resultados, Normas, Usuarios...
];

export function PanelSidebar({ rol }: { rol: Rol }) {
  const pathname = usePathname();

  return (
    <aside className="no-print hidden md:flex w-64 flex-shrink-0 flex-col bg-inverse-surface text-inverse-on-surface">
      <div className="h-20 px-space-lg flex items-center gap-space-sm">
        
        {/* LOGO DE LA UNIVERSIDAD LIBRE */}
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1 shadow-sm">
          <img 
            src="/logo-unilibre.png" 
            alt="Logo Universidad Libre Pereira" 
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col leading-tight">
          <span className="font-headline-sm text-headline-sm text-on-primary uppercase">Unilibre</span>
          <span className="font-label-sm text-label-sm text-surface-dim">Laboratorio de Microbiología</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-space-sm">
        {navItems
          .filter((item) => item.roles.includes(rol))
          .map((item) => {
            const active =
              item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-lg text-label-lg transition-colors ${
                  active
                    ? "bg-primary-container text-on-primary"
                    : "text-inverse-on-surface hover:bg-surface-tint/30"
                }`}
              >
                <Icon name={item.icon} className="text-xl" />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}