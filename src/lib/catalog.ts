import type { Prisma } from "@/generated/prisma/client";
import type { Filters } from "./filters";
import { prisma } from "./prisma";

export function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export function getProducts({ q, category, minCents, maxCents }: Filters) {
  return prisma.product.findMany({
    where: {
      active: true,
      name: q ? { contains: q, mode: "insensitive" } : undefined,
      category: category ? { slug: category } : undefined,
      priceCents: { gte: minCents, lte: maxCents },
    },
    orderBy: { name: "asc" },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: { category: true },
  });
}

/** Las especificaciones se guardan como JSON; aquí las convertimos en pares clave/valor. */
export function specsToEntries(specs: Prisma.JsonValue): [string, string][] {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  return Object.entries(specs).map(([k, v]) => [k, String(v)]);
}
