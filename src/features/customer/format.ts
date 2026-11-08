import type { CartItem } from "@/types";

/** "Salsa: BBQ · Extras: Queso, Tocino" (solo grupos con opciones elegidas). */
export function describeModifiers(selectedModifiers: CartItem["selectedModifiers"]) {
  return selectedModifiers
    .map((modifier) =>
      modifier.optionNames?.length ? `${modifier.modifierName}: ${modifier.optionNames.join(", ")}` : null
    )
    .filter(Boolean)
    .join(" · ");
}
