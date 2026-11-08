"use client";

import { useEffect, useState } from "react";

import { ProductDraft } from "@/domain/admin/ProductDraft";
import type { Product } from "@/types";

/** Estado del formulario de producto: borrador, si está abierto y qué producto se edita. */
export function useProductEditor(branchId?: string) {
  const [draft, setDraft] = useState(() => ProductDraft.empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDraft(ProductDraft.empty(branchId));
    setEditingId(null);
  }, [branchId]);

  return {
    draft,
    editingId,
    isOpen,
    /** Recibe una función que transforma el borrador (los borradores son inmutables). */
    update: (change: (draft: ProductDraft) => ProductDraft) => setDraft(change),
    open: () => setIsOpen(true),
    edit(product: Product) {
      setDraft(ProductDraft.fromProduct(product));
      setEditingId(product.id);
      setIsOpen(true);
    },
    /** Cierra y limpia el formulario. */
    close() {
      setIsOpen(false);
      setEditingId(null);
      setDraft(ProductDraft.empty(branchId));
    },
    /** Solo oculta el formulario (al cambiar de pestaña conserva lo escrito). */
    hide: () => setIsOpen(false)
  };
}

export type ProductEditor = ReturnType<typeof useProductEditor>;
