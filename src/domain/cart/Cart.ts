import type { CartItem } from "@/types";

/**
 * Carrito inmutable: cada operación devuelve un Cart NUEVO.
 * (React detecta los cambios por referencia, por eso no se modifica el original.)
 */
export class Cart {
  private constructor(private readonly lines: readonly CartItem[]) {}

  static empty() {
    return new Cart([]);
  }

  static from(items: readonly CartItem[] | null | undefined) {
    return new Cart(Array.isArray(items) ? items : []);
  }

  get items(): readonly CartItem[] {
    return this.lines;
  }

  get isEmpty() {
    return this.lines.length === 0;
  }

  /** Número total de piezas (suma de cantidades). */
  get itemCount() {
    return this.lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  /** Subtotal estimado en el navegador (el definitivo lo calcula el servidor). */
  get subtotal() {
    return this.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  }

  tipFor(tipPercent: number) {
    return (this.subtotal * tipPercent) / 100;
  }

  totalWithTip(tipPercent: number) {
    return this.subtotal + this.tipFor(tipPercent);
  }

  find(lineId: string) {
    return this.lines.find((line) => line.id === lineId) ?? null;
  }

  /** Agrega una línea; si ya hay una igual (mismo producto y mismas opciones), suma la cantidad. */
  add(item: CartItem) {
    const index = this.lines.findIndex((line) => Cart.isSameSelection(line, item));
    if (index === -1) return new Cart([...this.lines, item]);
    return new Cart(
      this.lines.map((line, i) => (i === index ? { ...line, quantity: line.quantity + item.quantity } : line))
    );
  }

  replace(item: CartItem) {
    return new Cart(this.lines.map((line) => (line.id === item.id ? item : line)));
  }

  /** Cambia la cantidad; con 0 o menos, quita la línea. */
  setQuantity(lineId: string, quantity: number) {
    if (quantity <= 0) return this.remove(lineId);
    return new Cart(this.lines.map((line) => (line.id === lineId ? { ...line, quantity } : line)));
  }

  remove(lineId: string) {
    return new Cart(this.lines.filter((line) => line.id !== lineId));
  }

  /** Dos líneas son "la misma" si son del mismo producto con exactamente las mismas opciones. */
  static isSameSelection(a: CartItem, b: CartItem) {
    if (a.productId !== b.productId) return false;
    if (a.selectedModifiers.length !== b.selectedModifiers.length) return false;
    return a.selectedModifiers.every((modifier) => {
      const other = b.selectedModifiers.find((item) => item.modifierId === modifier.modifierId);
      return (
        !!other &&
        other.optionIds.length === modifier.optionIds.length &&
        modifier.optionIds.every((id) => other.optionIds.includes(id))
      );
    });
  }
}
