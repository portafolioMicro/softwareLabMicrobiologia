import { getSessionUser } from "@/lib/session";
import { InicioView } from "@/components/inicio-view";

export default async function PanelPage() {
  const usuario = await getSessionUser();
  return <InicioView nombre={usuario.nombre_completo} rol={usuario.rol} />;
}