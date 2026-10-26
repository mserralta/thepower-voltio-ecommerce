import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { maxQuantityFor, MAX_LINES, MAX_QUANTITY } from "@/lib/pricing";
import { useHydrated } from "@/lib/use-hydrated";

export type AddFeedback = { text: string; tone: "ok" | "warn" };

/** Lógica común de "añadir al carrito": respeta el stock contando lo que ya hay en el carrito y avisa al usuario. */
export function useAddToCart(productId: string, stock: number) {
  const max = maxQuantityFor(stock);
  const hydrated = useHydrated();
  const inCartRaw = useCart((s) => s.items.find((i) => i.productId === productId)?.quantity ?? 0);
  const inCart = hydrated ? inCartRaw : 0;
  const add = useCart((s) => s.add);
  const [feedback, setFeedback] = useState<AddFeedback | null>(null);

  const soldOutInCart = inCart >= max;
  // Con más stock que el tope por línea, el límite que se alcanza no es el stock.
  const cappedByLimit = stock > MAX_QUANTITY;
  const limitText = (count: number) =>
    cappedByLimit
      ? `Máximo ${MAX_QUANTITY} unidades de cada producto por pedido: ya tienes ${count} en el carrito.`
      : `No hay más stock: ya tienes ${count} en el carrito.`;

  function submit(quantity: number) {
    const added = add(productId, quantity, max);
    if (added === 0) {
      setFeedback({
        text:
          inCart >= max
            ? limitText(inCart)
            : `El carrito está lleno (máximo ${MAX_LINES} productos distintos).`,
        tone: "warn",
      });
    } else if (added < quantity) {
      setFeedback({
        text: `Solo se han añadido ${added}. ${limitText(inCart + added)}`,
        tone: "warn",
      });
    } else {
      setFeedback({ text: "Añadido al carrito.", tone: "ok" });
    }
  }

  /** Sin mensaje puntual, si ya está todo el stock en el carrito se avisa de forma persistente. */
  const message: AddFeedback | null =
    feedback ?? (soldOutInCart && hydrated ? { text: limitText(inCart), tone: "warn" } : null);

  return { max, inCart, soldOutInCart, message, submit, clearFeedback: () => setFeedback(null) };
}
