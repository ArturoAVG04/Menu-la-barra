"use client";

import Image from "next/image";
import {
  Beef,
  CakeSlice,
  Coffee,
  CupSoda,
  Drumstick,
  Fish,
  Flame,
  IceCreamBowl,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Utensils
} from "lucide-react";

import type { Product } from "@/types";

const palettes = [
  "bg-rose-100 text-rose-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-900",
  "bg-sky-100 text-sky-800",
  "bg-teal-100 text-teal-800",
  "bg-stone-200 text-stone-800"
];

const iconRules = [
  { words: ["cafe", "coffee", "capuccino", "latte", "espresso"], icon: Coffee },
  { words: ["refresco", "soda", "agua", "jugo", "limonada", "bebida"], icon: CupSoda },
  { words: ["pizza"], icon: Pizza },
  { words: ["hamburguesa", "burger", "carne", "res", "steak", "arrachera"], icon: Beef },
  { words: ["pollo", "alita", "boneless", "nugget"], icon: Drumstick },
  { words: ["pescado", "fish", "atun", "camaron", "marisco"], icon: Fish },
  { words: ["ensalada", "salad", "verde"], icon: Salad },
  { words: ["sandwich", "torta", "panini", "bocadillo"], icon: Sandwich },
  { words: ["sopa", "caldo", "ramen", "consome"], icon: Soup },
  { words: ["helado", "nieve", "malteada"], icon: IceCreamBowl },
  { words: ["pastel", "cake", "pay", "postre", "brownie", "galleta"], icon: CakeSlice },
  { words: ["taco", "burrito", "quesadilla", "gringa", "nacho"], icon: Flame }
] as const;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getHash(value: string) {
  return [...value].reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function getProductIcon(product: Product) {
  const haystack = normalize(`${product.name} ${product.description}`);
  return iconRules.find((rule) => rule.words.some((word) => haystack.includes(word)))?.icon ?? Utensils;
}

export function ProductImagePlaceholder({
  product,
  compact = false
}: {
  product: Product;
  compact?: boolean;
}) {
  const Icon = getProductIcon(product);
  const palette = palettes[getHash(product.name || product.id || "producto") % palettes.length];
  const initials = normalize(product.name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`grid h-full w-full place-items-center overflow-hidden ${palette}`}>
      <div className="grid place-items-center gap-2 text-center">
        <div
          className={[
            "grid place-items-center rounded-full border border-current/15 bg-white/55",
            compact ? "h-20 w-20" : "h-24 w-24"
          ].join(" ")}
        >
          <Icon size={compact ? 36 : 44} strokeWidth={1.8} />
        </div>
        {initials && (
          <span className="text-xs font-bold uppercase tracking-wide opacity-70">
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}

export function ProductVisual({
  product,
  compact = false,
  priority = false
}: {
  product: Product;
  compact?: boolean;
  priority?: boolean;
}) {
  if (!product.imageUrl) {
    return <ProductImagePlaceholder product={product} compact={compact} />;
  }

  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      fill
      sizes={compact ? "(max-width: 768px) 100vw, 576px" : "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"}
      priority={priority}
      className="object-cover object-center"
    />
  );
}
