"use client";

import { useRouter } from "next/navigation";
import { logoutRequest } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutRequest();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg w-fit transition-colors"
    >
      Cerrar sesión
    </button>
  );
}