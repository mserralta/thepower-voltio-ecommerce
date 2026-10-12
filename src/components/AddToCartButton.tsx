"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { maxQuantityFor } from "@/lib/pricing";

type Props = { productId: string; stock: number };

export default function AddToCartButton({ productId, stock }: Props) {
  const max = maxQuantityFor(stock);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  if (max === 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper disabled:cursor-not-allowed disabled:opacity-40"
      >
        Agotado
      </button>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-muted">
          Cantidad
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded border border-line bg-paper px-3 py-2 text-sm"
        >
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => {
          add(productId, quantity, max);
          setAdded(true);
        }}
        className="mt-4 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:opacity-90"
      >
        Añadir al carrito
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-ok">
        {added ? "Añadido al carrito." : ""}
      </p>
    </div>
  );
}
