import { SetsManager } from "@/components/sets-manager";

export default async function SetsPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  return <SetsManager estadoInicial={estado ?? ""} />;
}