"use client";

import { SortOrder, type MoveDirection } from "@/domain/admin/SortOrder";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { catalogRepository } from "@/infrastructure";
import type { Category, Product } from "@/types";

/** Guardar, ordenar y borrar categorías de la sucursal. */
export function useCategoryActions(branchId: string | undefined, categories: Category[], products: Product[], notify: Notify) {
  async function saveCategory(name: string, editingId: string | null): Promise<Category | null> {
    if (!branchId) return null;
    const category: Category = {
      id: editingId || crypto.randomUUID(),
      sucursalID: branchId,
      name: name.trim(),
      sortOrder: editingId ? categories.find((item) => item.id === editingId)?.sortOrder || 0 : SortOrder.next(categories)
    };
    await catalogRepository.saveCategory(branchId, category);
    notify("Categoría guardada");
    return category;
  }

  async function moveCategory(categoryId: string, direction: MoveDirection) {
    if (!branchId) return;
    const reordered = SortOrder.move(categories, categoryId, direction);
    if (!reordered) return;
    await catalogRepository.saveMany({ categories: reordered });
    notify("Orden de categorías actualizado");
  }

  /** Al borrar una categoría, sus productos quedan sin categoría. */
  async function deleteCategory(categoryId: string) {
    if (!branchId) return;
    try {
      const affected = products.filter((item) => item.categoryId === categoryId);
      await catalogRepository.saveMany({ products: affected.map((item) => ({ ...item, categoryId: "" })) });
      await catalogRepository.deleteCategory(branchId, categoryId);
      notify("Categoría eliminada");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      notify("Error al eliminar la categoría");
    }
  }

  return { saveCategory, moveCategory, deleteCategory };
}
