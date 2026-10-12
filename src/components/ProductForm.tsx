"use client";

import { useActionState } from "react";
import { updateProduct, type ProductFormState } from "@/app/admin/actions";

type Props = {
  product: { id: string; name: string; brand: string; description: string; priceCents: number; stock: number; active: boolean; categoryId: string };
  categories: { id: string; name: string }[];
};

const field = "mt-1 w-full rounded border border-line bg-paper px-3 py-2";

export default function ProductForm({ product, categories }: Props) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(updateProduct, {});
  // Solo para rellenar el campo: el valor se vuelve a validar y convertir en el servidor.
  const price = `${Math.floor(product.priceCents / 100)},${String(product.priceCents % 100).padStart(2, "0")}`;

  return (
    <form action={action} className="mt-6 space-y-4 text-sm">
      <input type="hidden" name="productId" value={product.id} />
      <label className="block">Nombre
        <input name="name" required maxLength={120} defaultValue={product.name} className={field} />
      </label>
      <label className="block">Marca
        <input name="brand" required maxLength={80} defaultValue={product.brand} className={field} />
      </label>
      <label className="block">Descripción
        <textarea name="description" required maxLength={2000} rows={4} defaultValue={product.description} className={field} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">Precio con IVA (€)
          <input name="price" required inputMode="decimal" defaultValue={price} className={field} />
        </label>
        <label className="block">Stock
          <input name="stock" required inputMode="numeric" defaultValue={product.stock} className={field} />
        </label>
      </div>
      <label className="block">Categoría
        <select name="categoryId" defaultValue={product.categoryId} className={field}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="active" defaultChecked={product.active} /> Visible en la tienda
      </label>
      <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-3 font-medium text-paper disabled:opacity-40">
        Guardar cambios
      </button>
      {state.error && <p role="alert" className="text-brand">{state.error}</p>}
      {state.saved && <p role="status" className="text-ok">Cambios guardados.</p>}
    </form>
  );
}
