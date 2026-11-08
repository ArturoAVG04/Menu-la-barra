import { MenuProduct } from "@/domain/menu/MenuProduct";
import type { Category, Product } from "@/types";

/** `position` es el lugar de la categoría en el menú completo (aunque otras queden vacías). */
export type MenuSection = { category: Category; position: number; products: Product[] };

/**
 * El menú de una sucursal (categorías + productos) con sus consultas:
 * búsqueda, secciones por categoría y búsqueda de un producto por id.
 */
export class MenuCatalog {
  constructor(
    readonly categories: readonly Category[],
    readonly products: readonly Product[]
  ) {}

  /** Categorías que tienen al menos un producto (para las pestañas). */
  get categoriesWithProducts(): Category[] {
    return this.categories.filter((category) =>
      this.products.some((product) => product.categoryId === category.id)
    );
  }

  /** Productos disponibles que coinciden por nombre, descripción o categoría. */
  search(term: string): Product[] {
    const normalized = term.trim().toLowerCase();

    return this.products.filter((product) => {
      if (!product.available) return false;
      if (!normalized) return true;

      const category = this.categories.find((item) => item.id === product.categoryId);
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized) ||
        Boolean(category?.name.toLowerCase().includes(normalized))
      );
    });
  }

  /** Agrupa una lista de productos por categoría, sin secciones vacías. */
  sectionsFor(products: readonly Product[]): MenuSection[] {
    return this.categories
      .map((category, position) => ({
        category,
        position,
        products: products.filter((product) => product.categoryId === category.id)
      }))
      .filter((section) => section.products.length > 0);
  }

  findProduct(productId: string): MenuProduct | null {
    const product = this.products.find((item) => item.id === productId);
    return product ? MenuProduct.from(product) : null;
  }
}
