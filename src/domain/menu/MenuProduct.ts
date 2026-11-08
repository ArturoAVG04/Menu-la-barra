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
