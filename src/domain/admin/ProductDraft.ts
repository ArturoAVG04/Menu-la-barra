import type { Product, ProductModifier } from "@/types";

const EMPTY_PRODUCT: Product = {
  id: "",
  sucursalID: "",
  branchIds: [],
  categoryId: "",
  sortOrder: 0,
  name: "",
  description: "",
  price: 0,
  salePrice: 0,
  discountPercent: 0,
  available: true,
  modifiers: []
};

type SaveContext = { branchId: string; catalog: readonly Product[]; newId?: string };

/**
 * Borrador del formulario de producto (objeto inmutable, como `Cart`):
 * cada cambio devuelve un borrador nuevo, así React detecta el cambio.
 * Aquí viven las reglas que antes estaban regadas en el componente:
 * precio con descuento, si se puede guardar y cómo se arma el producto final.
 */
export class ProductDraft {
  private constructor(private readonly data: Product) {}

  /** Borrador vacío, ya asignado a la sucursal actual (si hay). */
  static empty(branchId?: string) {
    return new ProductDraft({ ...EMPTY_PRODUCT, branchIds: branchId ? [branchId] : [] });
  }

  /** Carga un producto existente; si no tiene sucursales, usa la suya. */
  static fromProduct(product: Product) {
    return new ProductDraft({
      ...product,
      branchIds: product.branchIds?.length ? product.branchIds : [product.sucursalID]
    });
  }

  /** Datos actuales (solo lectura) para pintar el formulario. */
  get values(): Readonly<Product> {
    return this.data;
  }

  with(patch: Partial<Product>) {
    return new ProductDraft({ ...this.data, ...patch });
  }

  /** Precio final: aplica el porcentaje de descuento y nunca baja de 0. */
  get salePrice() {
    const { price, discountPercent } = this.data;
    return discountPercent && discountPercent > 0 ? Math.max(price - (price * discountPercent) / 100, 0) : price;
  }

  /** Se puede guardar si tiene nombre y categoría. */
  get canSave() {
    return Boolean(this.data.name.trim() && this.data.categoryId);
  }

  hasBranch(branchId: string) {
    return this.data.branchIds?.includes(branchId) ?? false;
  }

  toggleBranch(branchId: string, selected: boolean) {
    const current = this.data.branchIds || [];
    return this.with({
      branchIds: selected ? [...new Set([...current, branchId])] : current.filter((id) => id !== branchId)
    });
  }

  hasModifier(modifierId: string) {
    return this.data.modifiers.some((modifier) => modifier.id === modifierId);
  }

  toggleModifier(modifier: ProductModifier, selected: boolean) {
    return this.with({
      modifiers: selected
        ? [...this.data.modifiers, modifier]
        : this.data.modifiers.filter((item) => item.id !== modifier.id)
    });
  }

  /** Producto "de muestra" para la vista previa: rellena lo vacío con textos de ejemplo. */
  preview(branchId: string): Product {
    return {
      ...this.data,
      id: this.data.id || "preview",
      sucursalID: branchId,
      sortOrder: this.data.sortOrder || 0,
      name: this.data.name || "Nombre del producto",
      description: this.data.description || "La vista previa cambia mientras escribes.",
      price: this.data.price || 0,
      salePrice: this.salePrice,
      available: this.data.available
    };
  }

  /** Sucursales donde se guardará; si no eligió ninguna, la actual. */
  targetBranchIds(currentBranchId: string) {
    return this.data.branchIds?.length ? this.data.branchIds : [currentBranchId];
  }

  /**
   * Producto listo para guardar. Si no tiene prioridad, va al final de su categoría
   * (se cuentan los productos de esa categoría sin contarse a sí mismo).
   */
  toProduct({ branchId, catalog, newId = crypto.randomUUID() }: SaveContext): Product {
    const siblings = catalog.filter(
      (item) => item.categoryId === this.data.categoryId && item.id !== this.data.id
    );
    const { sortOrder } = this.data;

    return {
      ...this.data,
      id: this.data.id || newId,
      sucursalID: branchId,
      branchIds: this.targetBranchIds(branchId),
      sortOrder: typeof sortOrder === "number" && sortOrder > 0 ? sortOrder : siblings.length + 1,
      salePrice: this.salePrice
    };
  }

  /** Una copia del producto por cada sucursal elegida (cada una con su `sucursalID`). */
  toBranchCopies(context: SaveContext): Product[] {
    const product = this.toProduct(context);
    return (product.branchIds ?? []).map((branchId) => ({ ...product, sucursalID: branchId }));
  }
}
