"use server";

import { isValidProductId } from "@/lib/filters";
import { MAX_LINES } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  priceCents: number;
  stock: number;
};

/** Devuelve los datos actuales (precio, stock) de los productos pedidos. Solo recibe ids: los precios salen de la base de datos. */
export async function getCartLines(productIds: unknown): Promise<CartLine[]> {
  if (!Array.isArray(productIds) || productIds.length > MAX_LINES) return [];
  const ids = [...new Set(productIds.filter(isValidProductId))];
  if (ids.length === 0) return [];

  return prisma.product.findMany({
    where: { id: { in: ids }, active: true },
    select: { id: true, slug: true, name: true, brand: true, priceCents: true, stock: true },
  }).then((rows) => rows.map(({ id, ...rest }) => ({ productId: id, ...rest })));
}
