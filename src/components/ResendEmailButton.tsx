"use client";

import { useActionState } from "react";
import { resendConfirmationEmail, type ResendState } from "@/app/admin/actions";

export default function ResendEmailButton({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState<ResendState, FormData>(resendConfirmationEmail, {});
  return (
    <form action={action} className="mt-4 flex flex-wrap items-center gap-3 text-sm">
      <input type="hidden" name="orderId" value={orderId} />
      <button type="submit" disabled={pending} className="rounded-full border border-line px-5 py-2 font-medium hover:bg-surface disabled:opacity-40">
        {pending ? "Enviando…" : "Reenviar email de confirmación"}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-ok" : "text-brand"}>{state.message}</p>
      )}
    </form>
  );
}
