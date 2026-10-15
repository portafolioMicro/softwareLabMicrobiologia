import { getSessionUser } from "@/lib/session";
import { ClientesManager } from "@/components/clientes-manager";

export default async function ClientesPage() {
  const usuario = await getSessionUser();
  return <ClientesManager rol={usuario.rol} />;
}