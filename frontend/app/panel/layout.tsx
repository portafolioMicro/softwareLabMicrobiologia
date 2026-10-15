import { getSessionUser } from "@/lib/session";
import { PanelSidebar } from "@/components/panel-sidebar";
import { LogoutButton } from "@/components/logout-button";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getSessionUser();

  return (
    <div className="min-h-screen flex bg-surface-container-low">
      <PanelSidebar rol={usuario.rol} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-surface-container-lowest shadow-sm px-space-lg flex items-center justify-between gap-space-md">
          <div className="flex flex-col leading-tight">
            <span className="font-title-md text-title-md text-on-surface">{usuario.nombre_completo}</span>
            <span className="font-label-md text-label-md text-secondary">{usuario.rol}</span>
          </div>
          <LogoutButton />
        </header>

        <main className="flex-1 p-space-lg">{children}</main>
      </div>
    </div>
  );
}