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
  "from-rose-950 via-stone-950 to-amber-950 text-rose-100",
  "from-emerald-950 via-zinc-950 to-lime-950 text-emerald-100",
  "from-orange-950 via-neutral-950 to-red-950 text-orange-100",
  "from-fuchsia-950 via-stone-950 to-rose-950 text-fuchsia-100",
  "from-teal-950 via-zinc-950 to-emerald-950 text-teal-100",
  "from-yellow-950 via-neutral-950 to-stone-950 text-yellow-100"
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
    <div className={`relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br ${palette}`}>
      <div className="absolute inset-x-6 top-0 h-px bg-white/25" />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-white/10" />
      <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full border border-white/10" />
      <div className="grid place-items-center gap-2 text-center">
        <div
          className={[
            "grid place-items-center rounded-full border border-white/15 bg-white/10 shadow-glow backdrop-blur",
            compact ? "h-20 w-20" : "h-24 w-24"
          ].join(" ")}
        >
          <Icon size={compact ? 36 : 44} strokeWidth={1.8} />
        </div>
        {initials && (
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
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
