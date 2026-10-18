import type { OrderStatus } from "@/generated/prisma/client";

export const ORDER_STATUSES: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

/** Transiciones permitidas desde el admin: PAID→SHIPPED→DELIVERED y PENDING→CANCELLED. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function allowedTransitions(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Valida un estado que llega por la URL o un formulario. */
export function parseOrderStatus(value: unknown): OrderStatus | undefined {
  return ORDER_STATUSES.find((s) => s === value);
}

/** Pedidos con el pago confirmado: se les puede reenviar el email. */
export function isConfirmed(status: OrderStatus): boolean {
  return status === "PAID" || status === "SHIPPED" || status === "DELIVERED";
}
