"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCartLines, type CartLine } from "@/app/carrito/actions";
import CheckoutButton from "@/components/CheckoutButton";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { computeTotals, maxQuantityFor } from "@/lib/pricing";
import { useHydrated } from "@/lib/use-hydrated";

export default function CartView() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  const [lines, setLines] = useState<Map<string, CartLine>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);

  // Solo se vuelve a pedir al servidor cuando cambia el conjunto de productos, no las cantidades.
  const idsKey = useMemo(() => items.map((i) => i.productId).sort().join(","), [items]);

  useEffect(() => {
    if (!hydrated) return;
    if (!idsKey) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    getCartLines(idsKey.split(",")).then((result) => {
      if (cancelled) return;
      const byId = new Map(result.map((l) => [l.productId, l]));
      const found: string[] = [];
      for (const item of useCart.getState().items) {
        const line = byId.get(item.productId);
        if (!line) {
          remove(item.productId);
          found.push("Un producto del carrito ya no está disponible y se ha quitado.");
          continue;
        }
        const max = maxQuantityFor(line.stock);
        if (item.quantity > max) {
          setQuantity(item.productId, max);
          found.push(
            max === 0
              ? `«${line.name}» se ha agotado y se ha quitado.`
              : `«${line.name}»: solo quedan ${max} uds. y se ha ajustado la cantidad.`,
          );
        }
      }
      setLines(byId);
      setNotices(found);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, idsKey, remove, setQuantity]);

  if (!hydrated || !loaded) return <p className="mt-8 text-muted">Cargando carrito…</p>;

  const rows = items.flatMap((item) => {
    const line = lines.get(item.productId);
    return line ? [{ ...line, quantity: item.quantity }] : [];
  });

  if (rows.length === 0) {
    return (
      <div className="mt-8">
        {notices.map((n) => (
          <p key={n} role="status" className="mb-2 text-sm text-brand">{n}</p>
        ))}
        <p className="text-muted">Tu carrito está vacío.</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">Ver el catálogo</Link>
      </div>
    );
  }

  const totals = computeTotals(rows.map((r) => ({ unitPriceCents: r.priceCents, quantity: r.quantity })));

  return (
    <div className="mt-8">
      {notices.map((n) => (
        <p key={n} role="status" className="mb-2 text-sm text-brand">{n}</p>
      ))}
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.productId} className="flex flex-wrap items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-muted">{row.brand}</p>
              <Link href={`/producto/${row.slug}`} className="font-medium hover:underline">{row.name}</Link>
              <p className="text-sm tabular-nums text-muted">{formatPrice(row.priceCents)} / ud.</p>
            </div>
            <label className="text-sm">
              <span className="sr-only">Cantidad de {row.name}</span>
              <select
                value={row.quantity}
                onChange={(e) => setQuantity(row.productId, Number(e.target.value))}
                className="rounded border border-line bg-paper px-3 py-2"
              >
                {Array.from({ length: maxQuantityFor(row.stock) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <p className="w-24 text-right tabular-nums">{formatPrice(row.priceCents * row.quantity)}</p>
            <button
              type="button"
              onClick={() => remove(row.productId)}
              className="text-sm text-muted underline hover:text-ink"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <dl className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatPrice(totals.subtotalCents)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd className="tabular-nums">{totals.shippingCents === 0 ? "Gratis" : formatPrice(totals.shippingCents)}</dd></div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total (IVA incl.)</dt><dd className="tabular-nums">{formatPrice(totals.totalCents)}</dd></div>
      </dl>

      <div className="mt-6 ml-auto max-w-xs">
        <CheckoutButton items={items} />
      </div>
    </div>
  );
}
