"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Recarga la página (datos del servidor) cada pocos segundos, hasta `maxTries` veces. */
export default function AutoRefresh({ everyMs = 3000, maxTries = 10 }: { everyMs?: number; maxTries?: number }) {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      if (++tries > maxTries) return clearInterval(id);
      router.refresh();
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs, maxTries]);
  return null;
}
