import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-session";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS, parseOrderStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Pedidos — Tienda Voltio" };

type Props = { searchParams: Promise<{ estado?: string | string[] }> };

export default async function AdminPage({ searchParams }: Props) {
  await requireAdmin();
  const raw = (await searchParams).estado;
  const status = parseOrderStatus(Array.isArray(raw) ? raw[0] : raw);

  const orders = await prisma.order.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Pedidos</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-muted underline hover:text-ink">Salir</button>
        </form>
      </div>

      <nav aria-label="Filtrar por estado" className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className={`rounded-full border border-line px-3 py-1 ${!status ? "bg-ink text-paper" : ""}`}>Todos</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin?estado=${s}`} className={`rounded-full border border-line px-3 py-1 ${status === s ? "bg-ink text-paper" : ""}`}>
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-8 text-muted">No hay pedidos.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Fecha</th>
                <th className="py-2 pr-4 font-medium">Cliente</th>
                <th className="py-2 pr-4 font-medium">Estado</th>
                <th className="py-2 pr-4 font-medium">Líneas</th>
                <th className="py-2 pr-4 text-right font-medium">Total</th>
                <th className="py-2 font-medium"><span className="sr-only">Detalle</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 pr-4 tabular-nums">{o.createdAt.toLocaleString("es-ES")}</td>
                  <td className="py-3 pr-4">{o.customerName ?? o.email ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {STATUS_LABELS[o.status]}
                    {o.stockIssue && <span className="ml-2 text-brand">⚠ stock</span>}
                  </td>
                  <td className="py-3 pr-4">{o._count.items}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(o.totalCents)}</td>
                  <td className="py-3"><Link href={`/admin/pedidos/${o.id}`} className="underline">Ver</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
