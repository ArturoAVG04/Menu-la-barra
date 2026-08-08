"use client";

import { Plus } from "lucide-react";

import { ProductVisual } from "@/components/customer/ProductVisual";
import { currency } from "@/lib/utils";
import type { Product } from "@/types";

type MenuCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
  priority?: boolean;
};

export function MenuCard({ product, onSelect, priority = false }: MenuCardProps) {
  const hasSale = Boolean(product.salePrice && product.salePrice < product.price);

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      disabled={!product.available}
      className="group relative flex w-full items-stretch justify-between overflow-hidden rounded-card border border-line bg-panel p-3 md:p-3.5 text-left shadow-sm transition hover:border-brand/40 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-75 gap-3"
    >
      <div className="flex flex-1 flex-col justify-between min-w-0 pr-1 py-0.5">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm md:text-base font-bold leading-snug text-text">
            {product.name}
          </h3>

          <p className="line-clamp-2 text-xs text-muted leading-tight">
            {product.description}
          </p>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          {hasSale && (
            <p className="text-xs font-medium text-muted line-through">
              {currency(product.price)}
            </p>
          )}
          <p className="text-sm md:text-base font-bold text-brand">
            {currency(product.salePrice || product.price)}
          </p>
        </div>
      </div>

      <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28 overflow-hidden rounded-card bg-surface border border-line/50">
        <ProductVisual product={product} priority={priority} />

        {!product.available && (
          <div className="absolute inset-0 grid place-items-center bg-surface/90 text-center text-xs font-bold text-danger p-1">
            Agotado
          </div>
        )}

        {product.available && (
          <div className="absolute bottom-1 right-1">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-glow transition group-hover:scale-110 group-hover:bg-accent active:scale-95">
              <Plus size={16} />
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
