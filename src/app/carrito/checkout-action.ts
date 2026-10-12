"use server";

import { redirect } from "next/navigation";
import { parseCheckoutItems } from "@/lib/cart-input";
import { computeTotals } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export type CheckoutResult = { error: string };

const SESSION_MINUTES = 30; // mínimo que permite Stripe

/**
 * Crea el pedido PENDING y la sesión de Stripe Checkout. El navegador solo manda ids y cantidades:
 * precios y stock se leen aquí, de la base de datos.
 */
export async function createCheckout(input: unknown): Promise<CheckoutResult> {
  const items = parseCheckoutItems(input);
  if (!items) return { error: "El carrito no es válido." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return { error: "El pago no está configurado todavía." };

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) return { error: "Algún producto del carrito ya no está disponible." };
    if (product.stock < item.quantity) {
      return { error: `No hay stock suficiente de «${product.name}» (quedan ${product.stock}).` };
    }
  }

  const lines = items.map((item) => ({ product: byId.get(item.productId)!, quantity: item.quantity }));
  const totals = computeTotals(lines.map((l) => ({ unitPriceCents: l.product.priceCents, quantity: l.quantity })));

  const order = await prisma.$transaction((tx) =>
    tx.order.create({
      data: {
        ...totals,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            skuSnapshot: l.product.sku,
            nameSnapshot: l.product.name,
            unitPriceCents: l.product.priceCents,
            quantity: l.quantity,
          })),
        },
      },
    }),
  );

  let url: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      locale: "es",
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      expires_at: Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60,
      shipping_address_collection: { allowed_countries: ["ES"] },
      line_items: [
        ...lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: "eur",
            unit_amount: l.product.priceCents,
            product_data: { name: l.product.name },
          },
        })),
        ...(totals.shippingCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "eur",
                  unit_amount: totals.shippingCents,
                  product_data: { name: "Envío" },
                },
              },
            ]
          : []),
      ],
      success_url: `${siteUrl}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancelado`,
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeCheckoutSessionId: session.id } });
    url = session.url;
  } catch (e) {
    console.error("No se pudo crear la sesión de Stripe:", e);
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return { error: "No se pudo iniciar el pago. Inténtalo de nuevo en unos minutos." };
  }

  if (!url) return { error: "No se pudo iniciar el pago." };
  redirect(url); // fuera del try/catch: redirect() lanza una excepción interna
}
