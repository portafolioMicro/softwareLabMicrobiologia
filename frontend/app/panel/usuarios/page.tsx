import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { UsuariosManager } from "@/components/usuarios-manager";

export default async function UsuariosPage() {
  const usuario = await getSessionUser();
  if (usuario.rol !== "Administrador") redirect("/panel");
  return <UsuariosManager yoId={usuario.id_usuario} />;
}