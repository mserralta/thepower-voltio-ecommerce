import "server-only";
import type Stripe from "stripe";
import type { Prisma } from "@/generated/prisma/client";
import { sendOrderConfirmation } from "./email";
import { prisma } from "./prisma";

const ORDER_ID = /^[a-z0-9]{20,32}$/;

function orderIdOf(session: Stripe.Checkout.Session): string | null {
  const id = session.metadata?.orderId;
  return id && ORDER_ID.test(id) ? id : null;
}

/** Apunta el evento en `StripeEvent` dentro de la transacción. `false` si ya se había procesado. */
async function claimEvent(tx: Prisma.TransactionClient, event: Stripe.Event): Promise<boolean> {
  const { count } = await tx.stripeEvent.createMany({
    data: [{ id: event.id, type: event.type }],
    skipDuplicates: true,
  });
  return count === 1;
}

/** `checkout.session.completed` pagado: PAID + stock + datos del cliente, una sola vez. */
export async function handleSessionPaid(event: Stripe.Event, session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return; // pago asíncrono pendiente: llegará async_payment_succeeded
  const orderId = orderIdOf(session);

  const order = await prisma.$transaction(async (tx) => {
    if (!(await claimEvent(tx, event))) return null; // duplicado: no hacer nada
    if (!orderId) {
      console.error(`Evento ${event.id}: sesión sin orderId válido`);
      return null;
    }
    const current = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!current || (current.status !== "PENDING" && current.status !== "CANCELLED")) {
      if (!current) console.error(`Evento ${event.id}: el pedido ${orderId} no existe`);
      return null;
    }
    if (session.amount_total !== current.totalCents) {
      console.error(`Pedido ${orderId}: Stripe cobró ${session.amount_total} y el pedido era ${current.totalCents}`);
    }

    // Sin reserva de stock: si ya no queda, se acepta el pago y se marca para revisión manual.
    let stockIssue = false;
    for (const item of current.items) {
      const { count } = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (count === 0) {
        stockIssue = true;
        await tx.product.updateMany({ where: { id: item.productId }, data: { stock: 0 } });
      }
    }

    const shipping = session.collected_information?.shipping_details;
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stockIssue,
        email: session.customer_details?.email ?? null,
        customerName: shipping?.name ?? session.customer_details?.name ?? null,
        shippingAddress: shipping?.address ? { ...shipping.address } : undefined,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      },
      include: { items: true },
    });
  });

  // Fuera de la transacción: si el email falla, el pedido sigue pagado.
  if (order) await sendOrderConfirmation(order);
}

/** `checkout.session.expired`: el pedido pendiente pasa a CANCELLED. */
export async function handleSessionExpired(event: Stripe.Event, session: Stripe.Checkout.Session) {
  const orderId = orderIdOf(session);
  await prisma.$transaction(async (tx) => {
    if (!(await claimEvent(tx, event)) || !orderId) return;
    await tx.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
  });
}
