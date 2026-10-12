"use client";

import { useState, useTransition } from "react";
import { createCheckout } from "@/app/carrito/checkout-action";
import type { CartItem } from "@/lib/cart-store";

export default function CheckoutButton({ items }: { items: CartItem[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={items.length === 0 || pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            // Si todo va bien la acción redirige a Stripe y no devuelve nada.
            const result = await createCheckout(items);
            if (result) setError(result.error);
          })
        }
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-40"
      >
        {pending ? "Redirigiendo a Stripe…" : "Pagar"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-brand">
          {error}
        </p>
      )}
    </div>
  );
}
