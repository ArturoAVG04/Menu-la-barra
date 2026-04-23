"use client";

import Image from "next/image";

import { currency } from "@/lib/utils";
import type { Product } from "@/types";

type MenuCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
};

export function MenuCard({ product, onSelect }: MenuCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      disabled={!product.available}
      className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-panel text-left shadow-glow transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-75"
    >
      <div className="relative h-44 shrink-0 overflow-hidden bg-surface">
        <Image
          src={product.imageUrl || "https://i.ibb.co/6w0pJ6L/placeholder-food.png"}
          alt={product.name}
          fill
          className="object-cover object-center transition duration-500 group-hover:scale-105"
        />
        {!product.available && (
          <div className="absolute inset-0 grid place-items-center bg-surface/85 text-sm font-semibold text-danger">
            Temporalmente no disponible
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 break-words min-h-[2.65rem] text-base font-semibold leading-[1.25] text-text md:text-lg">
              {product.name}
            </h3>
            <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
              {currency(product.salePrice || product.price)}
            </span>
          </div>

          <p className="line-clamp-2 break-words min-h-[2.2rem] text-sm leading-[1.3] text-muted">
            {product.description}
          </p>
        </div>
      </div>
    </button>
  );
}
