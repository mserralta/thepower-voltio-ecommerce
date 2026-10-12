import { useEffect, useState } from "react";

/** `false` en el servidor y en el primer render del cliente; evita desajustes con localStorage. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
