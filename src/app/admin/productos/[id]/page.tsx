import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Editar producto — Tienda Voltio" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[a-z0-9]{20,32}$/.test(id)) notFound();
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin/productos" className="text-sm text-muted hover:text-ink">← Productos</Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editar producto</h1>
      <p className="mt-1 text-sm text-muted">
        Ref. <span className="font-mono">{product.sku}</span> · URL <span className="font-mono">/producto/{product.slug}</span> (no se puede cambiar)
      </p>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
