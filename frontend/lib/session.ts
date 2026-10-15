import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Usuario } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const getSessionUser = cache(async (): Promise<Usuario> => {
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
  return usuario as Usuario;
});