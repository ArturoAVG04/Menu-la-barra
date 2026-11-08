import { DomainError } from "@/domain/errors";
import { Modifier, type ResolvedModifierSelection } from "@/domain/menu/Modifier";
import type { Product } from "@/types";

export type ModifierChoice = { modifierId: string; optionIds: string[] };

/**
 * Producto del menú con su comportamiento: precio vigente, promoción y cálculo
 * del precio unitario según las opciones elegidas.
 */
export class MenuProduct {
  private readonly modifiers: Modifier[];

  private constructor(private readonly data: Product) {
    this.modifiers = (data.modifiers ?? []).map((modifier) => Modifier.from(modifier));
  }

  static from(data: Product) {
    return new MenuProduct(data);
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get categoryId() {
    return this.data.categoryId;
  }

  /** Datos originales (solo lectura) para los componentes que pintan el producto. */
  toData(): Readonly<Product> {
    return this.data;
  }

  get imageUrl() {
    return this.data.imageUrl;
  }

  get isAvailable() {
    return this.data.available !== false;
  }

  /** Precio normal (sin promoción). */
  get regularPrice() {
    return Number(this.data.price) || 0;
  }

  /** Precio que se cobra: el de promoción si existe, si no el normal. */
  get currentPrice() {
    const sale = Number(this.data.salePrice);
    return sale > 0 ? sale : this.regularPrice;
  }

  get isOnSale() {
    return this.currentPrice < this.regularPrice;
  }

  get modifierList(): readonly Modifier[] {
    return this.modifiers;
  }

  /** Grupos de opciones en el orden en que se muestran (por `sortOrder`). */
  get sortedModifiers(): readonly Modifier[] {
    return [...this.modifiers].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /** Primer grupo obligatorio que quedó sin elegir, o null si todo está completo. */
  firstMissingRequired(choices: readonly ModifierChoice[]): Modifier | null {
    return (
      this.modifiers.find(
        (modifier) =>
          modifier.isRequired &&
          !(choices.find((choice) => choice.modifierId === modifier.id)?.optionIds.length ?? 0)
      ) ?? null
    );
  }

  /**
   * Valida las opciones elegidas (obligatorias, una sola, que existan) y devuelve
   * la selección resuelta con precios del menú. Ignora grupos sin opciones elegidas
   * que no son obligatorios.
   */
  resolveChoices(choices: readonly ModifierChoice[]): ResolvedModifierSelection[] {
    for (const choice of choices) {
      if (!this.modifiers.some((modifier) => modifier.id === choice.modifierId)) {
        throw new DomainError(`"${this.name}" cambió sus opciones; vuelve a agregarlo.`, "MODIFIER_NOT_FOUND");
      }
    }

    return this.modifiers
      .map((modifier) => {
        const choice = choices.find((item) => item.modifierId === modifier.id);
        return modifier.resolve(choice?.optionIds ?? []);
      })
      .filter((selection) => selection.optionIds.length > 0);
  }

  /** Precio unitario = precio vigente + lo que suman las opciones. */
  unitPriceFor(selections: readonly ResolvedModifierSelection[]) {
    return this.currentPrice + selections.reduce((sum, selection) => sum + selection.priceDelta, 0);
  }
}
