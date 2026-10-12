"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/** Vacía el carrito al volver de Stripe. */
export default function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => clear(), [clear]);
  return null;
}
