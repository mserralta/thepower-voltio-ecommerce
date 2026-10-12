import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidAdminToken } from "./admin-token";

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return isValidAdminToken(token, process.env.ADMIN_PASSWORD);
}

/** Cada Server Action y página del admin lo llama: el middleware no es la única barrera. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
