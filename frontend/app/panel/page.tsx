import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function PanelPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: `access_token=${token ?? ""}` },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  const { usuario } = await res.json();

  return (
    <main className="min-h-screen bg-surface-container-low p-space-lg">
      <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          Bienvenido, {usuario.nombre_completo}
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          Rol: <strong>{usuario.rol}</strong> · Correo: {usuario.correo}
        </p>
        <LogoutButton />
      </div>
    </main>
  );
}