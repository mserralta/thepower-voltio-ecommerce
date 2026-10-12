import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Acceso admin — Tienda Voltio" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Acceso al panel</h1>
      <LoginForm />
    </div>
  );
}
