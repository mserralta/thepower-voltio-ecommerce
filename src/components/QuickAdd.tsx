"use client";

import { useId, useState } from "react";
import { useAddToCart } from "@/lib/use-add-to-cart";

type Props = { productId: string; productName: string; stock: number };

const stepClass =
  "flex h-8 w-8 items-center justify-center text-base leading-none text-ink hover:bg-line/60 disabled:cursor-not-allowed disabled:opacity-30";

/**
 * Compra rápida desde el catálogo: stepper (− / input / +) y botón de añadir.
 * En dispositivos con cursor aparece al pasar el ratón por la tarjeta (o al enfocar con teclado);
 * en táctiles se ve siempre.
 */
export default function QuickAdd({ productId, productName, stock }: Props) {
  const { max, soldOutInCart, message, submit, clearFeedback } = useAddToCart(productId, stock);
  const id = useId();
  const [text, setText] = useState("1");

  if (max === 0) return null;

  const clamp = (n: number) => (Number.isFinite(n) ? Math.min(max, Math.max(1, Math.trunc(n))) : 1);
  const quantity = clamp(Number(text));
  const change = (n: number) => {
    setText(String(clamp(n)));
    clearFeedback();
  };

  return (
    <div
      className="mt-3 transition-opacity duration-150
        [@media(hover:hover)]:opacity-0
        [@media(hover:hover)]:group-hover/card:opacity-100
        [@media(hover:hover)]:group-focus-within/card:opacity-100"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center overflow-hidden rounded-full border border-line bg-paper">
          <button type="button" onClick={() => change(quantity - 1)} disabled={quantity <= 1} aria-label="Menos unidades" className={stepClass}>
            −
          </button>
          <label htmlFor={id} className="sr-only">
            Cantidad de {productName}
          </label>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={text}
            onChange={(e) => {
              setText(e.target.value.replace(/\D/g, "").slice(0, 2));
              clearFeedback();
            }}
            onBlur={() => change(Number(text))}
            className="w-8 bg-transparent text-center text-sm tabular-nums outline-none"
          />
          <button type="button" onClick={() => change(quantity + 1)} disabled={quantity >= max} aria-label="Más unidades" className={stepClass}>
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            submit(quantity);
            setText(String(quantity));
          }}
          disabled={soldOutInCart}
          aria-label={`Añadir ${quantity} de ${productName} al carrito`}
          className="h-8 flex-1 rounded-full bg-ink px-3 text-sm font-medium text-paper hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Añadir
        </button>
      </div>
      <p role="status" className={`mt-1 min-h-4 text-xs ${message?.tone === "warn" ? "text-warn" : "text-ok"}`}>
        {message?.text ?? ""}
      </p>
    </div>
  );
}
