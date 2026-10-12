"use client";

import type { CartItem } from "@/lib/cart-store";

// Se conecta a la Server Action de pago en la fase 4.
export default function CheckoutButton({ items }: { items: CartItem[] }) {
  return (
    <button
      type="button"
      disabled={items.length === 0}
      className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper disabled:opacity-40"
    >
      Pagar
    </button>
  );
}
