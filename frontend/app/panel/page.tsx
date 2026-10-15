import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { Icon } from "@/components/icon";

export default async function PanelPage() {
  const usuario = await getSessionUser();

  return (
    <div className="flex flex-col gap-space-lg max-w-5xl">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
          Bienvenido, {usuario.nombre_completo}
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          Selecciona un módulo para empezar a trabajar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
        <Link
          href="/panel/clientes"
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-space-sm"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="groups" className="text-3xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-on-surface font-bold">Clientes</span>
            <span className="font-body-sm text-body-sm text-secondary">Empresas y responsables</span>
          </div>
        </Link>
      </div>
    </div>
  );
}