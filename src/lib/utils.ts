import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    // $70 en lugar de $70.00; los centavos solo cuando existen ($70.50).
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}

