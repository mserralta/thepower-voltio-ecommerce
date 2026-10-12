import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Productos — Tienda Voltio" };

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({ orderBy: { name: "asc" }, include: { category: true } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Productos</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="py-2 pr-4 font-medium">Producto</th>
              <th className="py-2 pr-4 font-medium">Categoría</th>
              <th className="py-2 pr-4 text-right font-medium">Precio</th>
              <th className="py-2 pr-4 text-right font-medium">Stock</th>
              <th className="py-2 pr-4 font-medium">Visible</th>
              <th className="py-2 font-medium"><span className="sr-only">Editar</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-4">{p.name} <span className="font-mono text-xs text-muted">{p.sku}</span></td>
                <td className="py-3 pr-4">{p.category.name}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(p.priceCents)}</td>
                <td className={`py-3 pr-4 text-right tabular-nums ${p.stock === 0 ? "text-brand" : ""}`}>{p.stock}</td>
                <td className="py-3 pr-4">{p.active ? "Sí" : "No"}</td>
                <td className="py-3"><Link href={`/admin/productos/${p.id}`} className="underline">Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
