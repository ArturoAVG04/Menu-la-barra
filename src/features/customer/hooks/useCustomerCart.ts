"use client";

import { useMemo } from "react";

import type { MenuCatalog } from "@/domain/menu/MenuCatalog";
import { useCart } from "@/features/customer/hooks/useCart";

/**
 * Carrito guardado + menú actual: precios al día y líneas que ya no se pueden pedir.
 * (Lo guardado en el navegador puede tener precios viejos o productos borrados.)
 */
export function useCustomerCart(branchId: string | null, catalog: MenuCatalog) {
  const actions = useCart(branchId);
  const stored = actions.cart;

  const cart = useMemo(() => stored.repriced(catalog.finder), [stored, catalog]);
  // Solo se marca "no disponible" con el menú ya confirmado por Firestore.
  const unavailableIds = useMemo(
    () => (catalog.isLive ? cart.unavailableLineIds(catalog.finder) : []),
    [cart, catalog]
  );

  return { ...actions, cart, unavailableIds };
}

export type CustomerCart = ReturnType<typeof useCustomerCart>;
