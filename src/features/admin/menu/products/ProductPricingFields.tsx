"use client";

import { Percent } from "lucide-react";

import type { Product } from "@/types";

/** Precio base y porcentaje de descuento (el precio final lo calcula `ProductDraft`). */
export function ProductPricingFields({
  values,
  onChange
}: {
  values: Readonly<Product>;
  onChange: (patch: Partial<Product>) => void;
}) {
  return (
    <>
      <label className="space-y-2 text-sm text-text">
        <span>Precio base</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(event) => onChange({ price: Number(event.target.value) })}
          className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 text-left outline-none"
        />
      </label>

      <label className="space-y-2 text-sm text-text">
        <span>Descuento</span>
        <div className="relative">
          <Percent
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={values.discountPercent || 0}
            onChange={(event) => onChange({ discountPercent: Number(event.target.value) })}
            className="min-h-11 w-full rounded-card border border-line bg-surface px-10 py-3 text-left outline-none"
          />
        </div>
      </label>
    </>
  );
}
