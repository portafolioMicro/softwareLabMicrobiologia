import { notFound } from "next/navigation";
import { ConteosView } from "@/components/conteos-view";

export default async function ConteosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numero = Number(id);
  if (!Number.isInteger(numero)) notFound();

  return <ConteosView id={numero} />;
}