// Cálculo de importes en céntimos (enteros). Lo usan el carrito y el checkout.

/** Envío gratis a partir de 50 €. */
export const FREE_SHIPPING_FROM_CENTS = 5000;
/** Coste del envío por debajo del umbral: 4,95 €. */
export const SHIPPING_CENTS = 495;
/** Tope de unidades por línea, además del stock. */
export const MAX_QUANTITY = 20;
/** Tope de líneas distintas en un carrito. */
export const MAX_LINES = 50;

export type PricedLine = { unitPriceCents: number; quantity: number };

export type Totals = {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

export function computeTotals(lines: PricedLine[]): Totals {
  const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
  return { subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

/** Cantidad máxima que se puede comprar de un producto. */
export function maxQuantityFor(stock: number): number {
  return Math.max(0, Math.min(stock, MAX_QUANTITY));
}
