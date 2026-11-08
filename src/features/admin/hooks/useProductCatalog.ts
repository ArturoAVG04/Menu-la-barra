"use client";

import { useEffect, useMemo, useState } from "react";

import type { ModifierDraft } from "@/domain/admin/ModifierDraft";
import type { ProductDraft } from "@/domain/admin/ProductDraft";
import { SortOrder, type MoveDirection } from "@/domain/admin/SortOrder";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { catalogRepository } from "@/infrastructure";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import type { Branch, Category, ModifierTemplate, Product } from "@/types";

/**
 * Catálogo de la sucursal (productos, categorías y plantillas de opciones) y sus
 * operaciones de guardado. No guarda estado de formularios: eso es de los editores.
 */
export function useProductCatalog(branch: Branch | null, notify: Notify) {
  const branchId = branch?.id;
  const { categories, products } = useRealtimeMenu(branchId);
  const [modifiers, setModifiers] = useState<ModifierTemplate[]>([]);
  const sortedModifiers = useMemo(() => SortOrder.byPriority(modifiers), [modifiers]);

  useEffect(() => {
    if (!branchId) return;
    return catalogRepository.subscribeModifiers(branchId, setModifiers);
  }, [branchId]);

  /** Los productos guardan una copia de sus opciones: al cambiar una plantilla hay que actualizarlos. */
  async function syncModifierInProducts(modifierId: string, transform: (product: Product) => Product) {
    if (!branchId) return;
    const affected = products.filter((item) => item.modifiers.some((modifier) => modifier.id === modifierId));
    await Promise.all(affected.map((item) => catalogRepository.saveProduct(branchId, transform(item))));
  }

  // ---- Categorías ----

  async function saveCategory(name: string, editingId: string | null): Promise<Category | null> {
    if (!branchId) return null;
    const category: Category = {
      id: editingId || crypto.randomUUID(),
      sucursalID: branchId,
      name: name.trim(),
      sortOrder: editingId
        ? categories.find((item) => item.id === editingId)?.sortOrder || 0
        : categories.length + 1
    };
    await catalogRepository.saveCategory(branchId, category);
    notify("Categoría guardada");
    return category;
  }

  async function moveCategory(categoryId: string, direction: MoveDirection) {
    if (!branchId) return;
    const reordered = SortOrder.move(categories, categoryId, direction);
    if (!reordered) return;
    await Promise.all(reordered.map((category) => catalogRepository.saveCategory(branchId, category)));
    notify("Orden de categorías actualizado");
  }

  /** Al borrar una categoría, sus productos quedan sin categoría. */
  async function deleteCategory(categoryId: string) {
    if (!branchId) return;
    try {
      const affected = products.filter((item) => item.categoryId === categoryId);
      await Promise.all(affected.map((item) => catalogRepository.saveProduct(branchId, { ...item, categoryId: "" })));
      await catalogRepository.deleteCategory(branchId, categoryId);
      notify("Categoría eliminada");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      notify("Error al eliminar la categoría");
    }
  }

  // ---- Productos ----

  /** Guarda el producto en cada sucursal elegida. */
  async function saveProduct(draft: ProductDraft) {
    if (!branchId) return;
    const copies = draft.toBranchCopies({ branchId, catalog: products });
    await Promise.all(copies.map((copy) => catalogRepository.saveProduct(copy.sucursalID, copy)));
    notify("Producto guardado");
  }

  /** Mueve un producto dentro de su categoría. */
  async function moveProduct(productId: string, direction: MoveDirection) {
    if (!branchId) return;
    const current = products.find((item) => item.id === productId);
    if (!current) return;
    const reordered = SortOrder.move(
      products.filter((item) => item.categoryId === current.categoryId),
      productId,
      direction
    );
    if (!reordered) return;
    await Promise.all(reordered.map((item) => catalogRepository.saveProduct(branchId, item)));
    notify("Orden de productos actualizado");
  }

  async function deleteProduct(productId: string) {
    if (!branchId) return;
    try {
      await catalogRepository.deleteProduct(branchId, productId);
      notify("Producto eliminado");
    } catch {
      notify("Error al eliminar el producto");
    }
  }

  // ---- Plantillas de opciones ----

  async function saveModifier(draft: ModifierDraft) {
    if (!branchId) return;
    const template = draft.toTemplate(modifiers);
    await catalogRepository.saveModifier(branchId, template);
    await syncModifierInProducts(template.id, (item) => ({
      ...item,
      modifiers: item.modifiers.map((modifier) => (modifier.id === template.id ? template : modifier))
    }));
    notify("Personalización guardada");
  }

  async function moveModifier(modifierId: string, direction: MoveDirection) {
    if (!branchId) return;
    const reordered = SortOrder.move(sortedModifiers, modifierId, direction);
    if (!reordered) return;
    await Promise.all(
      reordered.map(async (template) => {
        await catalogRepository.saveModifier(branchId, template);
        await syncModifierInProducts(template.id, (item) => ({
          ...item,
          modifiers: item.modifiers.map((modifier) => (modifier.id === template.id ? template : modifier))
        }));
      })
    );
    notify("Orden de personalizaciones actualizado");
  }

  async function deleteModifier(modifierId: string) {
    if (!branchId) return;
    try {
      await syncModifierInProducts(modifierId, (item) => ({
        ...item,
        modifiers: item.modifiers.filter((modifier) => modifier.id !== modifierId)
      }));
      await catalogRepository.deleteModifier(branchId, modifierId);
      notify("Personalización eliminada");
    } catch {
      notify("Error al eliminar personalización");
    }
  }

  return {
    categories,
    products,
    modifiers: sortedModifiers,
    saveCategory,
    moveCategory,
    deleteCategory,
    saveProduct,
    moveProduct,
    deleteProduct,
    saveModifier,
    moveModifier,
    deleteModifier
  };
}

export type ProductCatalog = ReturnType<typeof useProductCatalog>;
