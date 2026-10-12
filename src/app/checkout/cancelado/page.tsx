import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pago cancelado — Tienda Voltio" };

export default function CancelledPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Pago cancelado</h1>
      <p className="mt-3 text-muted">No se ha hecho ningún cargo. Tu carrito sigue como lo dejaste.</p>
      <Link href="/carrito" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper">
        Volver al carrito
      </Link>
    </div>
  );
}
