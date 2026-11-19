import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ResultadosForm } from "@/components/resultados-form";

export default async function MuestraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numero = Number(id);
  if (!Number.isInteger(numero)) notFound();

  const usuario = await getSessionUser();
  return <ResultadosForm id={numero} rol={usuario.rol} />;
}