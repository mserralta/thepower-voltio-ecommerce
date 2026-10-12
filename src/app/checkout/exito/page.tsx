import type { Metadata } from "next";
import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import ClearCart from "@/components/ClearCart";
import { isValidCheckoutSessionId } from "@/lib/filters";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Pedido — Tienda Voltio" };

type Props = { searchParams: Promise<{ session_id?: string | string[] }> };

export default async function SuccessPage({ searchParams }: Props) {
  const raw = (await searchParams).session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;
  const order = isValidCheckoutSessionId(sessionId)
    ? await prisma.order.findUnique({
        where: { stripeCheckoutSessionId: sessionId },
        include: { items: true },
      })
    : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">No encontramos tu pedido</h1>
        <p className="mt-3 text-muted">Comprueba el enlace o vuelve al catálogo.</p>
        <Link href="/" className="mt-6 inline-block text-sm underline">Ver el catálogo</Link>
      </div>
    );
  }

  // Esta página solo lee: el pago lo confirma el webhook.
  const paid = order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ClearCart />
      {paid ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight">Pago confirmado</h1>
          <p className="mt-3 text-muted">Gracias por tu compra. Pedido <span className="font-mono">{order.id}</span>.</p>
        </>
      ) : order.status === "CANCELLED" ? (
        <h1 className="text-3xl font-semibold tracking-tight">Pedido cancelado</h1>
      ) : (
        <>
          <AutoRefresh />
          <h1 className="text-3xl font-semibold tracking-tight">Procesando pago…</h1>
          <p role="status" className="mt-3 text-muted">Estamos esperando la confirmación de Stripe. Esta página se actualiza sola.</p>
        </>
      )}

      <ul className="mt-8 divide-y divide-line border-y border-line text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3">
            <span>{item.nameSnapshot} × {item.quantity}</span>
            <span className="tabular-nums">{formatPrice(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd className="tabular-nums">{order.shippingCents === 0 ? "Gratis" : formatPrice(order.shippingCents)}</dd></div>
        <div className="flex justify-between font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.totalCents)}</dd></div>
      </dl>
      <Link href="/" className="mt-8 inline-block text-sm underline">Seguir comprando</Link>
    </div>
  );
}
