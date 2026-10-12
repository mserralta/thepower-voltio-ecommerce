import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { isAdmin } from "@/lib/admin-session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAdmin();
  return (
    <>
      {authenticated && (
        <div className="border-b border-line bg-surface">
          <nav aria-label="Administración" className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2 text-sm">
            <span className="font-semibold">Admin</span>
            <Link href="/admin" className="text-muted hover:text-ink">Pedidos</Link>
            <Link href="/admin/productos" className="text-muted hover:text-ink">Productos</Link>
            <form action={logout} className="ml-auto">
              <button type="submit" className="text-muted underline hover:text-ink">Salir</button>
            </form>
          </nav>
        </div>
      )}
      {children}
    </>
  );
}
