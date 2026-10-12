export type ProductInput = {
  name: string;
  brand: string;
  description: string;
  priceCents: number;
  stock: number;
  active: boolean;
  categoryId: string;
};

/** "12,95" o "12.95" → 1295, sin pasar por floats. `null` si no es un importe válido (máx. 2 decimales). */
export function parsePriceToCents(value: string): number | null {
  const m = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(value.trim());
  if (!m) return null;
  const cents = Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0") || 0);
  return cents > 0 ? cents : null;
}

function text(value: FormDataEntryValue | null, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length > 0 && v.length <= max ? v : null;
}

/** Valida el formulario de edición de producto. Devuelve el error en español o los datos limpios. */
export function parseProductForm(form: FormData): { error: string } | { data: ProductInput } {
  const name = text(form.get("name"), 120);
  const brand = text(form.get("brand"), 80);
  const description = text(form.get("description"), 2000);
  const categoryId = text(form.get("categoryId"), 40);
  const priceCents = parsePriceToCents(String(form.get("price") ?? ""));
  const stockRaw = String(form.get("stock") ?? "").trim();
  const stock = /^\d{1,6}$/.test(stockRaw) ? Number(stockRaw) : null;

  if (!name) return { error: "El nombre es obligatorio (máx. 120 caracteres)." };
  if (!brand) return { error: "La marca es obligatoria." };
  if (!description) return { error: "La descripción es obligatoria (máx. 2000 caracteres)." };
  if (priceCents === null) return { error: "El precio no es válido (ej. 12,95)." };
  if (stock === null) return { error: "El stock debe ser un entero de 0 o más." };
  if (!categoryId) return { error: "Elige una categoría." };
  return { data: { name, brand, description, priceCents, stock, active: form.get("active") === "on", categoryId } };
}
