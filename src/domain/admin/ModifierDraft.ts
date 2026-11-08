import type { ModifierOption, ModifierTemplate } from "@/types";

const blankOption = (): ModifierOption => ({ id: crypto.randomUUID(), name: "", priceDelta: 0 });

/**
 * Borrador inmutable de una plantilla de opciones (ej. "Salsas").
 * Sabe agregar/editar opciones y "limpiarse" antes de guardarse.
 */
export class ModifierDraft {
  private constructor(private readonly data: ModifierTemplate) {}

  /** Plantilla nueva con una opción en blanco para empezar a escribir. */
  static empty() {
    return new ModifierDraft({
      id: "",
      name: "",
      type: "multiple",
      required: false,
      sortOrder: 0,
      options: [blankOption()]
    });
  }

  static fromTemplate(template: ModifierTemplate) {
    return new ModifierDraft(template);
  }

  get values(): Readonly<ModifierTemplate> {
    return this.data;
  }

  get isNew() {
    return !this.data.id;
  }

  get canSave() {
    return Boolean(this.data.name.trim());
  }

  with(patch: Partial<ModifierTemplate>) {
    return new ModifierDraft({ ...this.data, ...patch });
  }

  updateOption(index: number, patch: Partial<ModifierOption>) {
    return this.with({
      options: this.data.options.map((option, itemIndex) => (itemIndex === index ? { ...option, ...patch } : option))
    });
  }

  addOption() {
    return this.with({ options: [...this.data.options, blankOption()] });
  }

  /**
   * Plantilla lista para guardar: quita opciones sin nombre y asigna ids que falten.
   * La prioridad se conserva si ya existía; si es nueva, va al final.
   */
  toTemplate(existing: readonly ModifierTemplate[], newId: string = crypto.randomUUID()): ModifierTemplate {
    return {
      ...this.data,
      id: this.data.id || newId,
      sortOrder: this.data.id
        ? existing.find((item) => item.id === this.data.id)?.sortOrder || 0
        : existing.length + 1,
      options: this.data.options
        .filter((option) => option.name.trim())
        .map((option) => ({ ...option, id: option.id || crypto.randomUUID() }))
    };
  }
}
