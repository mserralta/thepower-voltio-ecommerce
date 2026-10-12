import Form from "next/form";
import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/catalog";
import { parseFilters } from "@/lib/filters";

export const metadata: Metadata = { title: "Catálogo — Tienda Voltio" };

const inputClass = "w-full rounded border border-line bg-paper px-3 py-2 text-sm";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const [categories, products] = await Promise.all([getCategories(), getProducts(filters)]);
  const current = categories.find((c) => c.slug === filters.category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{current?.name ?? "Catálogo"}</h1>
      <p className="mt-1 text-sm text-muted">
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-[220px_1fr]">
        <Form action="/" className="space-y-5 text-sm" aria-label="Filtros">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted">Buscar</span>
            <input name="q" type="search" defaultValue={filters.q} maxLength={80} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-muted">Categoría</span>
            <select name="categoria" defaultValue={filters.category ?? ""} className={inputClass}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="grid grid-cols-2 gap-3">
            <legend className="mb-1 text-xs uppercase tracking-wide text-muted">Precio (€)</legend>
            <input
              name="min"
              type="number"
              min={0}
              placeholder="Mín."
              aria-label="Precio mínimo"
              defaultValue={filters.minCents !== undefined ? filters.minCents / 100 : ""}
              className={inputClass}
            />
            <input
              name="max"
              type="number"
              min={0}
              placeholder="Máx."
              aria-label="Precio máximo"
              defaultValue={filters.maxCents !== undefined ? filters.maxCents / 100 : ""}
              className={inputClass}
            />
          </fieldset>
          <div className="flex items-center gap-4">
            <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:opacity-90">
              Filtrar
            </button>
            <Link href="/" className="text-muted hover:text-ink">
              Limpiar
            </Link>
          </div>
        </Form>

        {products.length === 0 ? (
          <p className="text-muted">No hay productos que coincidan con los filters.</p>
        ) : (
          <div className="grid grid-cols-2 content-start gap-x-4 gap-y-8 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
