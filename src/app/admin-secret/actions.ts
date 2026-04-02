"use server";

import { cookies } from "next/headers";

export async function loginAction(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (password === correctPassword) {
    // Generate a secure but simple admin auth cookie
    // In a real app we'd sign this or use JWT, but a simple cookie match is enough for a basic password gate
    (await cookies()).set("admin_auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Senha incorreta" };
}

export async function logoutAction() {
  (await cookies()).delete("admin_auth");
}
