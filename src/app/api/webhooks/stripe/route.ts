import type Stripe from "stripe";
import { handleSessionExpired, handleSessionPaid } from "@/lib/fulfillment";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Webhook de Stripe: única fuente de verdad del pago. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Falta la firma", { status: 400 });

  // La firma se calcula sobre el cuerpo crudo: hay que leerlo como texto, no como JSON.
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Firma no válida", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleSessionPaid(event, event.data.object);
        break;
      case "checkout.session.expired":
        await handleSessionExpired(event, event.data.object);
        break;
      default:
        break; // eventos que no manejamos: 200 para que Stripe no reintente
    }
  } catch (e) {
    console.error(`Error procesando el evento ${event.id}:`, e);
    return new Response("Error interno", { status: 500 }); // Stripe reintentará
  }
  return new Response(null, { status: 200 });
}
