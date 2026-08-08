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
      className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-panel text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-75"
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-surface">
        <ProductVisual product={product} priority={priority} />
        {!product.available && (
          <div className="absolute inset-0 grid place-items-center bg-surface/85 text-sm font-semibold text-danger">
            Temporalmente no disponible
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-3.5 md:p-4">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 min-h-[2.5rem] break-words text-base font-semibold leading-tight text-text">
            {product.name}
          </h3>

          <p className="line-clamp-2 min-h-[2.2rem] break-words text-sm leading-[1.3] text-muted">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            {hasSale && (
              <p className="text-xs font-medium text-muted line-through">
                {currency(product.price)}
              </p>
            )}
            <p className="text-base font-bold text-brand">
              {currency(product.salePrice || product.price)}
            </p>
          </div>
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-brand px-2.5 text-white transition group-hover:bg-accent">
            <Plus size={18} />
          </span>
        </div>
      </div>
    </button>
  );
}
