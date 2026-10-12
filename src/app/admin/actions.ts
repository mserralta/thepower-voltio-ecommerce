"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, createAdminToken, passwordMatches } from "@/lib/admin-token";
import { requireAdmin } from "@/lib/admin-session";
import { canTransition, parseOrderStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

const ORDER_ID = /^[a-z0-9]{20,32}$/;

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = process.env.ADMIN_PASSWORD;
  const input = formData.get("password");
  if (typeof input !== "string" || input.length > 200) return { error: "Contraseña incorrecta." };
  if (!password) return { error: "El panel no está configurado (falta ADMIN_PASSWORD)." };
  if (!(await passwordMatches(input, password))) return { error: "Contraseña incorrecta." };

  (await cookies()).set(ADMIN_COOKIE, await createAdminToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

/** Cambia el estado de un pedido si la transición está permitida. */
export async function changeOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const orderId = formData.get("orderId");
  const next = parseOrderStatus(formData.get("status"));
  if (typeof orderId !== "string" || !ORDER_ID.test(orderId) || !next) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order || !canTransition(order.status, next)) return;

  // Condición en el where: si otro cambió el estado entretanto, no se pisa.
  await prisma.order.updateMany({ where: { id: orderId, status: order.status }, data: { status: next } });
  revalidatePath("/admin");
  revalidatePath(`/admin/pedidos/${orderId}`);
}
