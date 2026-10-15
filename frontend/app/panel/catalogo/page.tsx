import { getSessionUser } from "@/lib/session";
import { CatalogoManager } from "@/components/catalogo-manager";

export default async function CatalogoPage() {
  const usuario = await getSessionUser();
  return <CatalogoManager rol={usuario.rol} />;
}