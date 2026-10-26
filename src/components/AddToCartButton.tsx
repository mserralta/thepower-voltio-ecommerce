"use client";

import { useState } from "react";
import { useAddToCart } from "@/lib/use-add-to-cart";

type Props = { productId: string; stock: number };

export default function AddToCartButton({ productId, stock }: Props) {
  const { max, soldOutInCart, message, submit, clearFeedback } = useAddToCart(productId, stock);
  const [quantity, setQuantity] = useState(1);

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
          onChange={(e) => {
            setQuantity(Number(e.target.value));
            clearFeedback();
          }}
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
          submit(quantity);
        }}
        disabled={soldOutInCart}
        className="mt-4 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Añadir al carrito
      </button>
      <p role="status" className={`mt-2 min-h-5 text-sm ${message?.tone === "warn" ? "text-warn" : "text-ok"}`}>
        {message?.text ?? ""}
      </p>
    </div>
  );
}
