"use client";

import { BranchCopyPlanner } from "@/domain/admin/BranchCopyPlanner";
import type { ProductDraft } from "@/domain/admin/ProductDraft";
import { SortOrder, type MoveDirection } from "@/domain/admin/SortOrder";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { catalogRepository } from "@/infrastructure";
import type { Category, Product } from "@/types";

/** Guardar (en una o varias sucursales), ordenar y borrar productos. */
export function useProductActions(branchId: string | undefined, categories: Category[], products: Product[], notify: Notify) {
  /** Guarda el producto en cada sucursal elegida, con la categoría correcta de cada una. */
  async function saveProduct(draft: ProductDraft) {
    if (!branchId) return;
    try {
      const product = draft.toProduct({ branchId, catalog: products });
      const previous = products.find((item) => item.id === product.id);
      const others = (product.branchIds ?? []).filter((id) => id !== branchId);
      const lists = await Promise.all(others.map((id) => catalogRepository.getCategories(id)));
      const plan = BranchCopyPlanner.plan({
        product,
        sourceBranchId: branchId,
        sourceCategories: categories,
        categoriesByBranch: Object.fromEntries(others.map((id, i) => [id, lists[i]])),
        previousBranchIds: previous?.branchIds
      });
      await catalogRepository.saveMany({
        categories: plan.newCategories,
        products: plan.copies,
        deleteProducts: plan.removeFrom.map((id) => ({ branchId: id, productId: product.id }))
      });
      notify("Producto guardado");
    } catch (error) {
      notify(error instanceof Error ? `No se pudo guardar: ${error.message}` : "No se pudo guardar el producto");
    }
  }

  /** Mueve un producto dentro de su categoría. */
  async function moveProduct(productId: string, direction: MoveDirection) {
    if (!branchId) return;
    const current = products.find((item) => item.id === productId);
    if (!current) return;
    const reordered = SortOrder.move(products.filter((item) => item.categoryId === current.categoryId), productId, direction);
    if (!reordered) return;
    await catalogRepository.saveMany({ products: reordered });
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

  return { saveProduct, moveProduct, deleteProduct };
}
