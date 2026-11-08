"use client";

import { useMemo, useState } from "react";

import type { Cart } from "@/domain/cart/Cart";
import type { MenuCatalog } from "@/domain/menu/MenuCatalog";
import { ProductSelection } from "@/domain/menu/ProductSelection";
import type { CartItem, Product } from "@/types";

/** Qué se está editando: un producto nuevo o una línea que ya está en el carrito. */
type EditorTarget = { productId: string; cartItemId: string | null };

type EditorCallbacks = {
  onAdd: (item: CartItem, productName: string) => void;
  onReplace: (item: CartItem) => void;
};

/**
 * Editor de un producto (opciones y cantidad). Los precios y la validación los
 * calcula `ProductSelection` con ayuda de `MenuProduct`; aquí solo se guarda el estado.
 */
export function useProductEditor(catalog: MenuCatalog, cart: Cart, callbacks: EditorCallbacks) {
  const [target, setTarget] = useState<EditorTarget | null>(null);
  const [draft, setDraft] = useState<ProductSelection | null>(null);
  const [error, setError] = useState("");

  const editingCartItem = target?.cartItemId ? cart.find(target.cartItemId) : null;
  const liveProduct = useMemo(
    () => (target ? catalog.findProduct(target.productId) : null),
    [catalog, target]
  );

  // El editor se cierra solo si el producto desaparece del menú o la línea del carrito se borra.
  const isOpen = Boolean(liveProduct && draft && (!target?.cartItemId || editingCartItem));
  const selection = isOpen && liveProduct && draft ? draft.withProduct(liveProduct) : null;

  function openForProduct(product: Product) {
    const menuProduct = catalog.findProduct(product.id);
    if (!menuProduct) return;
    setTarget({ productId: product.id, cartItemId: null });
    setDraft(ProductSelection.start(menuProduct));
    setError("");
  }

  /** Abre una línea del carrito; `message` permite explicar por qué se abrió. */
  function openForCartItem(cartItemId: string, message = "") {
    const item = cart.find(cartItemId);
    const menuProduct = item ? catalog.findProduct(item.productId) : null;
    if (!item || !menuProduct) return;
    setTarget({ productId: item.productId, cartItemId });
    setDraft(ProductSelection.fromCartItem(menuProduct, item));
    setError(message);
  }

  function close() {
    setTarget(null);
    setDraft(null);
    setError("");
  }

  function toggleOption(modifierId: string, optionId: string) {
    setError("");
    setDraft((current) => current?.toggle(modifierId, optionId) ?? null);
  }

  function changeQuantity(delta: number) {
    setDraft((current) => current?.withQuantity(current.quantity + delta) ?? null);
  }

  function save() {
    if (!selection) return;

    const missing = selection.missingRequired();
    if (missing) {
      setError(`Selecciona una opción en ${missing.name}.`);
      return;
    }

    if (editingCartItem) {
      callbacks.onReplace(selection.applyTo(editingCartItem));
    } else {
      callbacks.onAdd(selection.toCartItem(crypto.randomUUID()), selection.product.name);
    }
    close();
  }

  return {
    isOpen,
    selection,
    isEditingCartItem: Boolean(editingCartItem),
    error,
    openForProduct,
    openForCartItem,
    close,
    toggleOption,
    changeQuantity,
    save
  };
}

export type ProductEditor = ReturnType<typeof useProductEditor>;
