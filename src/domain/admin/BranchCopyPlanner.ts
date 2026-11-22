import { SortOrder } from "@/domain/admin/SortOrder";
import type { Category, Product } from "@/types";

export type BranchCopyPlan = {
  /** Copias del producto, una por sucursal, cada una con la categoría de ESA sucursal. */
  copies: Product[];
  /** Categorías que hay que crear en otras sucursales (no existía una con el mismo nombre). */
  newCategories: Category[];
  /** Sucursales de donde hay que borrar el producto (se quitaron al editar). */
  removeFrom: string[];
};

const sameName = (a: string, b: string) => a.localeCompare(b, "es", { sensitivity: "base" }) === 0;

/**
 * Guardar un producto en varias sucursales: cada sucursal tiene sus propias categorías
 * (con ids distintos), así que la copia se liga a la categoría con el MISMO NOMBRE
 * en esa sucursal, o se crea si no existe.
 */
export class BranchCopyPlanner {
  static plan(input: {
    product: Product;
    sourceBranchId: string;
    sourceCategories: readonly Category[];
    categoriesByBranch: Readonly<Record<string, readonly Category[]>>;
    previousBranchIds?: readonly string[];
    newId?: () => string;
  }): BranchCopyPlan {
    const { product, sourceBranchId } = input;
    const newId = input.newId ?? (() => crypto.randomUUID());
    const categoryName = input.sourceCategories.find((c) => c.id === product.categoryId)?.name?.trim() ?? "";
    const branchIds = product.branchIds?.length ? product.branchIds : [sourceBranchId];
    const newCategories: Category[] = [];

    const copies = branchIds.map((branchId) => {
      if (branchId === sourceBranchId || !product.categoryId) return { ...product, sucursalID: branchId };
      const existing = input.categoriesByBranch[branchId] ?? [];
      let target = categoryName ? existing.find((c) => sameName(c.name, categoryName)) : undefined;
      if (!target && categoryName) {
        target = { id: newId(), sucursalID: branchId, name: categoryName, sortOrder: SortOrder.next(existing) };
        newCategories.push(target);
      }
      return { ...product, sucursalID: branchId, categoryId: target?.id ?? "" };
    });

    const removeFrom = (input.previousBranchIds ?? []).filter((id) => !branchIds.includes(id));
    return { copies, newCategories, removeFrom };
  }
}
