import { DomainError } from "@/domain/errors";
import type { ModifierOption, ProductModifier } from "@/types";

/** Opción seleccionada ya resuelta (con nombre y precio reales del menú). */
export type ResolvedModifierSelection = {
  modifierId: string;
  modifierName: string;
  optionIds: string[];
  optionNames: string[];
  priceDelta: number;
};

/**
 * Un grupo de opciones de un producto (ej. "Salsa", "Extras").
 * Sabe validar una selección y calcular cuánto suma al precio.
 */
export class Modifier {
  private constructor(private readonly data: ProductModifier) {}

  static from(data: ProductModifier) {
    return new Modifier({ ...data, options: data.options ?? [] });
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get isRequired() {
    return this.data.required;
  }

  get allowsMultiple() {
    return this.data.type === "multiple";
  }

  get options(): readonly ModifierOption[] {
    return this.data.options;
  }

  get sortOrder() {
    return this.data.sortOrder || 0;
  }

  /**
   * Vista previa tolerante (para el editor mientras el cliente elige): no lanza errores,
   * solo toma las opciones que existen y suma su precio. La validación estricta es `resolve()`.
   */
  preview(optionIds: readonly string[]): ResolvedModifierSelection {
    const chosen = this.data.options.filter((option) => optionIds.includes(option.id));
    return {
      modifierId: this.id,
      modifierName: this.name,
      optionIds: chosen.map((option) => option.id),
      optionNames: chosen.map((option) => option.name),
      priceDelta: chosen.reduce((sum, option) => sum + (Number(option.priceDelta) || 0), 0)
    };
  }

  /** Valida los ids elegidos y devuelve la selección con nombres y precio sacados del menú (no del cliente). */
  resolve(optionIds: readonly string[]): ResolvedModifierSelection {
    const uniqueIds = [...new Set(optionIds)];

    if (this.isRequired && uniqueIds.length === 0) {
      throw new DomainError(`Elige una opción en "${this.name}".`, "MODIFIER_REQUIRED");
    }
    if (!this.allowsMultiple && uniqueIds.length > 1) {
      throw new DomainError(`Solo puedes elegir una opción en "${this.name}".`, "MODIFIER_SINGLE");
    }

    const chosen = uniqueIds.map((optionId) => {
      const option = this.data.options.find((item) => item.id === optionId);
      if (!option) {
        throw new DomainError(`Una opción de "${this.name}" ya no existe.`, "MODIFIER_OPTION_NOT_FOUND");
      }
      return option;
    });

    return {
      modifierId: this.id,
      modifierName: this.name,
      optionIds: chosen.map((option) => option.id),
      optionNames: chosen.map((option) => option.name),
      priceDelta: chosen.reduce((sum, option) => sum + (Number(option.priceDelta) || 0), 0)
    };
  }
}
