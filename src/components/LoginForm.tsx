"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm">
        Contraseña
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded border border-line bg-paper px-3 py-2"
        />
      </label>
      <button type="submit" disabled={pending} className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper disabled:opacity-40">
        Entrar
      </button>
      {state.error && <p role="alert" className="text-sm text-brand">{state.error}</p>}
    </form>
  );
}
