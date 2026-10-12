import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { changeOrderStatus } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-session";
import { formatPrice } from "@/lib/format";
import { STATUS_LABELS, allowedTransitions } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Detalle del pedido — Tienda Voltio" };

type Props = { params: Promise<{ id: string }> };

function addressLines(address: unknown): string[] {
  if (!address || typeof address !== "object" || Array.isArray(address)) return [];
  const a = address as Record<string, unknown>;
  return [a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(" "), a.state, a.country]
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}

export default async function AdminOrderPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[a-z0-9]{20,32}$/.test(id)) notFound();
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const next = allowedTransitions(order.status);
  const address = addressLines(order.shippingAddress);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/admin" className="text-sm text-muted hover:text-ink">← Pedidos</Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pedido <span className="font-mono text-xl">{order.id}</span></h1>
      <p className="mt-2">Estado: <strong>{STATUS_LABELS[order.status]}</strong></p>
      {order.stockIssue && (
        <p role="alert" className="mt-2 text-sm text-brand">⚠ El pago llegó cuando ya no quedaba stock de algún producto: revisar a mano.</p>
      )}

      {next.length > 0 && (
        <form action={changeOrderStatus} className="mt-4 flex gap-2">
          <input type="hidden" name="orderId" value={order.id} />
          {next.map((s) => (
            <button key={s} type="submit" name="status" value={s} className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper">
              Marcar como {STATUS_LABELS[s].toLowerCase()}
            </button>
          ))}
        </form>
      )}

      <section className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <h2 className="font-semibold">Cliente</h2>
          <p className="mt-1">{order.customerName ?? "—"}</p>
          <p className="text-muted">{order.email ?? "—"}</p>
        </div>
        <div>
          <h2 className="font-semibold">Dirección de envío</h2>
          {address.length ? address.map((l) => <p key={l} className="mt-1 first:mt-1">{l}</p>) : <p className="mt-1 text-muted">—</p>}
        </div>
      </section>

      <ul className="mt-8 divide-y divide-line border-y border-line text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-4 py-3">
            <span>{i.nameSnapshot} <span className="font-mono text-xs text-muted">{i.skuSnapshot}</span> × {i.quantity}</span>
            <span className="tabular-nums">{formatPrice(i.unitPriceCents * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotalCents)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd className="tabular-nums">{formatPrice(order.shippingCents)}</dd></div>
        <div className="flex justify-between font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.totalCents)}</dd></div>
      </dl>
    </div>
  );
}
