import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { SetDetalleView } from "@/components/set-detalle";

export default async function SetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numero = Number(id);
  if (!Number.isInteger(numero)) notFound();

  const usuario = await getSessionUser();
  return <SetDetalleView id={numero} rol={usuario.rol} />;
}