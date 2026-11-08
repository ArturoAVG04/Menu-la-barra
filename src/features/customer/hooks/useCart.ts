"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Cart } from "@/domain/cart/Cart";
import { LocalJsonStore } from "@/infrastructure/browser/LocalJsonStore";
import type { CartItem } from "@/types";

/** Cada sucursal tiene su propio carrito guardado, para que no se mezclen pedidos. */
const cartStore = (branchId: string) => new LocalJsonStore<CartItem[]>(`la-barra-cart:${branchId}`, []);

type CartState = { branchId: string | null; cart: Cart };

/**
 * Estado del carrito de la sucursal activa. Toda la lógica (juntar líneas iguales,
 * cantidades, totales) vive en la clase `Cart`; el hook solo la guarda y la persiste.
 */
export function useCart(branchId: string | null) {
  const [state, setState] = useState<CartState>({ branchId: null, cart: Cart.empty() });

  // Al cambiar de sucursal se carga su carrito guardado.
  useEffect(() => {
    if (!branchId) return;
    setState({ branchId, cart: Cart.from(cartStore(branchId).read()) });
  }, [branchId]);

  useEffect(() => {
    if (!state.branchId) return;
    cartStore(state.branchId).write([...state.cart.items]);
  }, [state]);

  /** Aplica una operación de `Cart` (que devuelve un carrito nuevo). */
  const update = useCallback((change: (cart: Cart) => Cart) => {
    setState((current) => (current.branchId ? { ...current, cart: change(current.cart) } : current));
  }, []);

  return useMemo(
    () => ({
      cart: state.cart,
      add: (item: CartItem) => update((cart) => cart.add(item)),
      replace: (item: CartItem) => update((cart) => cart.replace(item)),
      setQuantity: (lineId: string, quantity: number) => update((cart) => cart.setQuantity(lineId, quantity)),
      remove: (lineId: string) => update((cart) => cart.remove(lineId)),
      clear: () => update(() => Cart.empty()),
      restore: (cart: Cart) => update(() => cart)
    }),
    [state.cart, update]
  );
}

export type CartActions = ReturnType<typeof useCart>;
