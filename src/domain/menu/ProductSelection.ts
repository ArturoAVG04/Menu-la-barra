import type { MenuProduct, ModifierChoice } from "@/domain/menu/MenuProduct";
import type { Modifier, ResolvedModifierSelection } from "@/domain/menu/Modifier";
import type { CartItem } from "@/types";

type ChosenOptions = Readonly<Record<string, readonly string[]>>;

/**
 * Lo que el cliente va eligiendo en el editor de un producto: opciones y cantidad.
 * Es inmutable (cada cambio devuelve una selección nueva) y le pregunta los precios
 * a `MenuProduct`, así el componente solo pinta y nunca calcula nada.
 */
export class ProductSelection {
  private constructor(
    readonly product: MenuProduct,
    private readonly chosen: ChosenOptions,
    readonly quantity: number
  ) {}

  /** Selección vacía para agregar un producto nuevo. */
  static start(product: MenuProduct) {
    return new ProductSelection(product, {}, 1);
  }

  /** Selección a partir de una línea del carrito (para editarla). */
  static fromCartItem(product: MenuProduct, item: CartItem) {
    const chosen = Object.fromEntries(
      item.selectedModifiers.map((modifier) => [modifier.modifierId, modifier.optionIds])
    );
    return new ProductSelection(product, chosen, item.quantity);
  }

  optionIdsFor(modifierId: string): readonly string[] {
    return this.chosen[modifierId] ?? [];
  }

  isSelected(modifierId: string, optionId: string) {
    return this.optionIdsFor(modifierId).includes(optionId);
  }

  /** Opción única: reemplaza. Opción múltiple: agrega o quita. */
  toggle(modifierId: string, optionId: string) {
    const modifier = this.product.modifierList.find((item) => item.id === modifierId);
    if (!modifier) return this;

    const current = this.optionIdsFor(modifierId);
    const next = !modifier.allowsMultiple
      ? [optionId]
      : current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];

    return new ProductSelection(this.product, { ...this.chosen, [modifierId]: next }, this.quantity);
  }

  /** La cantidad mínima es 1. */
  withQuantity(quantity: number) {
    return new ProductSelection(this.product, this.chosen, Math.max(1, quantity));
  }

  get choices(): ModifierChoice[] {
    return this.product.sortedModifiers.map((modifier) => ({
      modifierId: modifier.id,
      optionIds: [...this.optionIdsFor(modifier.id)]
    }));
  }

  /** Detalle por grupo (nombres y precio) en el orden en que se muestran. */
  get details(): ResolvedModifierSelection[] {
    return this.product.sortedModifiers.map((modifier) => modifier.preview(this.optionIdsFor(modifier.id)));
  }

  get basePrice() {
    return this.product.currentPrice;
  }

  get extrasTotal() {
    return this.details.reduce((sum, detail) => sum + detail.priceDelta, 0);
  }

  get unitPrice() {
    return this.product.unitPriceFor(this.details);
  }

  get total() {
    return this.unitPrice * this.quantity;
  }

  /** Primer grupo obligatorio sin elegir (o null si se puede guardar). */
  missingRequired(): Modifier | null {
    return this.product.firstMissingRequired(this.choices);
  }

  private cartModifiers(): CartItem["selectedModifiers"] {
    return this.details.filter((detail) => detail.optionIds.length > 0);
  }

  /** Crea una línea nueva de carrito con esta selección. */
  toCartItem(id: string): CartItem {
    return {
      id,
      productId: this.product.id,
      name: this.product.name,
      quantity: this.quantity,
      basePrice: this.basePrice,
      unitPrice: this.unitPrice,
      imageUrl: this.product.imageUrl,
      selectedModifiers: this.cartModifiers()
    };
  }

  /** Aplica esta selección sobre una línea existente (al editar desde el carrito). */
  applyTo(item: CartItem): CartItem {
    return {
      ...item,
      quantity: this.quantity,
      note: undefined,
      basePrice: this.basePrice,
      unitPrice: this.unitPrice,
      selectedModifiers: this.cartModifiers()
    };
  }
}
