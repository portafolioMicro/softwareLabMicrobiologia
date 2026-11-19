import { notFound } from "next/navigation";
import { ActaView } from "@/components/acta-view";

export default async function ActaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numero = Number(id);
  if (!Number.isInteger(numero)) notFound();

  return <ActaView id={numero} />;
}