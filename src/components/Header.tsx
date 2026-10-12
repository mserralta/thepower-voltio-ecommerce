import Link from "next/link";
import CartCount from "@/components/CartCount";

const nav = [
  { href: "/", label: "Catálogo" },
  { href: "/carrito", label: "Carrito" },
  { href: "/admin", label: "Admin" },
];

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Tienda Voltio<span className="text-brand">.</span>
        </Link>
        <nav className="flex gap-6 text-sm">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted hover:text-ink">
              {item.label}
              {item.href === "/carrito" && <CartCount />}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
