import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import QuickAdd from "@/components/QuickAdd";
import type { Product } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock === 0;

  return (
    <div className="group/card">
      <Link href={`/producto/${product.slug}`} className="group block">
        <div className="relative">
          <ProductImage name={product.name} sku={product.sku} className="aspect-square transition group-hover:opacity-90" />
          {soldOut && (
            <span className="absolute left-3 top-3 rounded bg-ink px-2 py-1 text-xs text-paper">
              Agotado
            </span>
          )}
        </div>
        <p className="mt-3 text-xs uppercase tracking-wide text-muted">{product.brand}</p>
        <h3 className="mt-1 text-sm font-medium group-hover:underline">{product.name}</h3>
        <p className="mt-1 text-sm tabular-nums">{formatPrice(product.priceCents)}</p>
      </Link>
      <QuickAdd productId={product.id} productName={product.name} stock={product.stock} />
    </div>
  );
}
