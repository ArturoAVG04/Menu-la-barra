import type { MenuProduct } from "@/domain/menu/MenuProduct";
import { ProductSelection } from "@/domain/menu/ProductSelection";
import type { CartItem } from "@/types";

/** Máximo de piezas por línea (igual que el servidor). */
export const MAX_LINE_QUANTITY = 50;

type FindProduct = (productId: string) => MenuProduct | null;

const clampQuantity = (quantity: number) => Math.min(MAX_LINE_QUANTITY, Math.floor(quantity));

/** Línea guardada válida (el localStorage puede traer basura de versiones viejas). */
function isValidLine(value: unknown): value is CartItem {
  const line = value as Partial<CartItem> | null;
  return Boolean(
    line &&
      typeof line.id === "string" &&
      typeof line.productId === "string" &&
      typeof line.name === "string" &&
      Number.isFinite(line.quantity) &&
      (line.quantity as number) > 0 &&
      Number.isFinite(line.unitPrice) &&
      Array.isArray(line.selectedModifiers) &&
      line.selectedModifiers.every((modifier) => modifier && Array.isArray(modifier.optionIds))
  );
}

/**
 * Carrito inmutable: cada operación devuelve un Cart NUEVO.
 * (React detecta los cambios por referencia, por eso no se modifica el original.)
 */
export class Cart {
  private constructor(private readonly lines: readonly CartItem[]) {}

  static empty() {
    return new Cart([]);
  }

  /** Arma el carrito descartando líneas inválidas. */
  static from(items: unknown) {
    if (!Array.isArray(items)) return Cart.empty();
    return new Cart(
      items.filter(isValidLine).map((line) => ({ ...line, quantity: clampQuantity(line.quantity) }))
    );
  }

  /** Vuelve a armar un carrito con las líneas de un pedido anterior, con ids nuevos. */
  static reorder(items: readonly CartItem[], newId: () => string) {
    return new Cart(items.map((item) => ({ ...item, id: newId() })));
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
      this.lines.map((line, i) =>
        i === index ? { ...line, quantity: clampQuantity(line.quantity + item.quantity) } : line
      )
    );
  }

  replace(item: CartItem) {
    return new Cart(this.lines.map((line) => (line.id === item.id ? item : line)));
  }

  /** Cambia la cantidad (máximo 50); con 0 o menos, quita la línea. */
  setQuantity(lineId: string, quantity: number) {
    if (quantity <= 0) return this.remove(lineId);
    return new Cart(
      this.lines.map((line) => (line.id === lineId ? { ...line, quantity: clampQuantity(quantity) } : line))
    );
  }

  /** Precios y nombres al día con el menú actual (lo guardado puede ser viejo). */
  repriced(findProduct: FindProduct) {
    let changed = false;
    const lines = this.lines.map((line) => {
      const product = findProduct(line.productId);
      if (!product || !product.isAvailable) return line;
      const selection = ProductSelection.fromCartItem(product, line);
      if (line.unitPrice === selection.unitPrice && line.name === product.name) return line;
      changed = true;
      return { ...line, name: product.name, basePrice: selection.basePrice, unitPrice: selection.unitPrice };
    });
    return changed ? new Cart(lines) : this;
  }

  /** Ids de líneas cuyo producto ya no existe o no está disponible. */
  unavailableLineIds(findProduct: FindProduct): string[] {
    return this.lines
      .filter((line) => !findProduct(line.productId)?.isAvailable)
      .map((line) => line.id);
  }

  remove(lineId: string) {
    return new Cart(this.lines.filter((line) => line.id !== lineId));
  }

  /**
   * Primera línea a la que le falta un grupo obligatorio según el menú actual.
   * Si el producto ya no está en el menú se ignora (el servidor lo rechazará).
   */
  findIncompleteLine(findProduct: FindProduct) {
    return (
      this.lines.find((line) => {
        const product = findProduct(line.productId);
        return product ? product.firstMissingRequired(line.selectedModifiers) !== null : false;
      }) ?? null
    );
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
