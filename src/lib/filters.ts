export type Filters = {
  q?: string;
  category?: string;
  minCents?: number;
  maxCents?: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const MAX_Q = 80;
const SLUG = /^[a-z0-9-]{1,40}$/;
const EUROS = /^\d{1,6}$/;
const SLUG_PRODUCT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Los euros llegan por la URL como entero; se convierten a céntimos sin pasar por decimales. */
function eurosToCents(value: string | undefined): number | undefined {
  const v = value?.trim();
  return v && EUROS.test(v) ? Number(v) * 100 : undefined;
}

/** Valida `?q=&categoria=&min=&max=` (la URL va en español; internamente se usa `category`): lo que no es válido se ignora. */
export function parseFilters(sp: SearchParams): Filters {
  const q = first(sp.q)?.trim().slice(0, MAX_Q) || undefined;
  const cat = first(sp.categoria);
  const category = cat && SLUG.test(cat) ? cat : undefined;
  let minCents = eurosToCents(first(sp.min));
  let maxCents = eurosToCents(first(sp.max));
  if (minCents !== undefined && maxCents !== undefined && minCents > maxCents) {
    [minCents, maxCents] = [maxCents, minCents];
  }
  return { q, category, minCents, maxCents };
}

/** Slugs de producto: descarta cualquier otra cosa antes de consultar la base de datos. */
export function isValidSlug(slug: string): boolean {
  return slug.length <= 120 && SLUG_PRODUCT.test(slug);
}
