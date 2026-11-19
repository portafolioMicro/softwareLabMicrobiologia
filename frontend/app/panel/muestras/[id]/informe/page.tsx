import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { InformeView } from "@/components/informe-view";

export default async function InformePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numero = Number(id);
  if (!Number.isInteger(numero)) notFound();

  const usuario = await getSessionUser();
  return <InformeView id={numero} rol={usuario.rol} />;
}