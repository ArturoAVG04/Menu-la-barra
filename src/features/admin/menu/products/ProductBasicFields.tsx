"use client";

import type { Category, Product } from "@/types";

const inputClass = "min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 text-left outline-none";

/** Datos básicos: nombre, categoría y prioridad dentro de la categoría. */
export function ProductBasicFields({
  values,
  categories,
  onChange
}: {
  values: Readonly<Product>;
  categories: Category[];
  onChange: (patch: Partial<Product>) => void;
}) {
  return (
    <>
      <label className="space-y-2 text-sm text-text">
        <span>Nombre</span>
        <input value={values.name} onChange={(event) => onChange({ name: event.target.value })} className={inputClass} />
      </label>

      <label className="space-y-2 text-sm text-text">
        <span>Categoría</span>
        <select
          value={values.categoryId}
          onChange={(event) => onChange({ categoryId: event.target.value })}
          className={inputClass}
        >
          <option value="">Selecciona</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm text-text">
        <span>Prioridad en la categoría</span>
        <input
          type="number"
          min="1"
          step="1"
          value={values.sortOrder || ""}
          onChange={(event) => onChange({ sortOrder: Number(event.target.value) || 0 })}
          className={inputClass}
          placeholder="1"
        />
      </label>
    </>
  );
}
