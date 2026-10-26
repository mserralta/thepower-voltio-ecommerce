import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_LINES, MAX_QUANTITY } from "./pricing";

export type CartItem = { productId: string; quantity: number };

type CartState = {
  items: CartItem[];
  /** Suma `quantity` a la línea sin pasar de `max` (stock). Devuelve las unidades realmente añadidas. */
  add: (productId: string, quantity: number, max: number) => number;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

// Solo se guardan las líneas; el total y el nº de artículos se calculan (selectores de abajo).
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId, quantity, max) => {
        const before = get().items.find((i) => i.productId === productId)?.quantity ?? 0;
        set((state) => {
          const cap = Math.min(max, MAX_QUANTITY);
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId ? { ...i, quantity: Math.min(i.quantity + quantity, cap) } : i,
              ),
            };
          }
          if (state.items.length >= MAX_LINES || cap < 1) return state;
          return { items: [...state.items, { productId, quantity: Math.min(quantity, cap) }] };
        });
        return (get().items.find((i) => i.productId === productId)?.quantity ?? 0) - before;
      },
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "voltio-cart", partialize: (state) => ({ items: state.items }) },
  ),
);

export const selectItemCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);
