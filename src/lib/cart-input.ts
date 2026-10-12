import { isValidProductId } from "./filters";
import { MAX_LINES, MAX_QUANTITY } from "./pricing";

export type CheckoutItem = { productId: string; quantity: number };

/** Valida lo que manda el navegador (solo ids y cantidades) y junta líneas repetidas. Devuelve `null` si no es válido. */
export function parseCheckoutItems(input: unknown): CheckoutItem[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_LINES) return null;
  const merged = new Map<string, number>();
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) return null;
    const { productId, quantity } = raw as Record<string, unknown>;
    if (!isValidProductId(productId)) return null;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return null;
    }
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  const items = [...merged].map(([productId, quantity]) => ({ productId, quantity }));
  return items.every((i) => i.quantity <= MAX_QUANTITY) ? items : null;
}
