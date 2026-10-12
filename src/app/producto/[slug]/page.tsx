import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductImage from "@/components/ProductImage";
import { specsToEntries, getProductBySlug } from "@/lib/catalog";
import { isValidSlug } from "@/lib/filters";
import { formatPrice } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string) {
  return isValidSlug(slug) ? getProductBySlug(slug) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await loadProduct((await params).slug);
  return { title: product ? `${product.name} — Tienda Voltio` : "Producto no encontrado" };
}

export default async function ProductPage({ params }: Props) {
  const product = await loadProduct((await params).slug);
  if (!product) notFound();

  const specs = specsToEntries(product.specs);
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Migas de pan" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Catálogo</Link>
        {" / "}
        <Link href={`/?categoria=${product.category.slug}`} className="hover:text-ink">
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ProductImage name={product.name} className="aspect-square" />

        <div>
          <p className="text-sm uppercase tracking-wide text-muted">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-1 font-mono text-xs text-muted">Ref. {product.sku}</p>

          <p className="mt-6 text-2xl tabular-nums">
            {formatPrice(product.priceCents)}
            <span className="ml-2 text-sm text-muted">IVA incluido</span>
          </p>
          <p className={`mt-2 text-sm ${inStock ? "text-ok" : "text-brand"}`}>
            {inStock ? `En stock (${product.stock} uds.)` : "Agotado"}
          </p>

          <AddToCartButton productId={product.id} stock={product.stock} />

          <p className="mt-8 leading-relaxed">{product.description}</p>

          {specs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold">Especificaciones técnicas</h2>
              <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
                {specs.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4 py-2">
                    <dt className="text-muted">{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
