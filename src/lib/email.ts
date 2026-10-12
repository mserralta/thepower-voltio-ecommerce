import "server-only";
import { Resend } from "resend";
import { formatPrice } from "./format";

export type OrderEmailData = {
  id: string;
  email: string | null;
  customerName: string | null;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  items: { nameSnapshot: string; unitPriceCents: number; quantity: number }[];
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function renderOrderEmail(order: OrderEmailData): string {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.nameSnapshot)}</td><td align="right">${i.quantity} × ${formatPrice(i.unitPriceCents)}</td></tr>`,
    )
    .join("");
  const greeting = order.customerName ? `Hola, ${escapeHtml(order.customerName)}:` : "Hola:";
  return `<div style="font-family:sans-serif;max-width:560px">
<h1>Gracias por tu compra en Tienda Voltio</h1>
<p>${greeting} hemos recibido tu pago. Pedido <strong>${escapeHtml(order.id)}</strong>.</p>
<table width="100%" cellpadding="6">${rows}</table>
<p>Subtotal: ${formatPrice(order.subtotalCents)}<br>Envío: ${order.shippingCents === 0 ? "Gratis" : formatPrice(order.shippingCents)}<br><strong>Total (IVA incl.): ${formatPrice(order.totalCents)}</strong></p>
</div>`;
}

/** Envía la confirmación. Nunca lanza: si falla, el pedido sigue pagado. Devuelve si se envió. */
export async function sendOrderConfirmation(order: OrderEmailData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  // En pruebas todo va a EMAIL_PRUEBAS (sin dominio verificado Resend solo entrega a la cuenta propietaria).
  const to = process.env.EMAIL_PRUEBAS || order.email;
  if (!apiKey || !to) {
    console.warn("Email de confirmación omitido: falta RESEND_API_KEY o destinatario.");
    return false;
  }
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: "Tienda Voltio <onboarding@resend.dev>",
      to,
      subject: `Pedido confirmado · Tienda Voltio`,
      html: renderOrderEmail(order),
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (e) {
    console.error("No se pudo enviar el email de confirmación:", e);
    return false;
  }
}
