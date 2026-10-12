"use client";

import { selectItemCount, useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

export default function CartCount() {
  const count = useCart(selectItemCount);
  const hydrated = useHydrated();
  if (!hydrated || count === 0) return null;
  return (
    <span
      aria-label={`${count} artículos en el carrito`}
      className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-xs font-semibold text-on-accent"
    >
      {count}
    </span>
  );
}
