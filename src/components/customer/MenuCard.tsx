"use client";

import Image from "next/image";
import { Plus } from "lucide-react";

import { currency } from "@/lib/utils";
import type { Product } from "@/types";

type MenuCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
};

export function MenuCard({ product, onSelect }: MenuCardProps) {
  return (
    <article className="group overflow-hidden rounded-card border border-line bg-panel shadow-glow transition hover:-translate-y-1">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={product.imageUrl || "https://i.ibb.co/6w0pJ6L/placeholder-food.png"}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {!product.available && (
          <div className="absolute inset-0 grid place-items-center bg-surface/85 text-sm font-semibold text-danger">
            Temporalmente no disponible
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text">{product.name}</h3>
            <p className="mt-1 text-sm text-muted">{product.description}</p>
          </div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
            {currency(product.salePrice || product.price)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(product)}
          disabled={!product.available}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>
    </article>
  );
}
