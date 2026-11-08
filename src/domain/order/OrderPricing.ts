import { DomainError } from "@/domain/errors";
import { MenuProduct, type ModifierChoice } from "@/domain/menu/MenuProduct";
import type { CartItem, Product } from "@/types";

/** Lo que manda el cliente: solo ids y cantidades. Los precios los pone el servidor. */
export type OrderLineRequest = {
  productId: string;
  quantity: number;
  selectedModifiers?: ModifierChoice[];
  note?: string;
};

export type PricedOrder = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tipPercent: number;
  tipAmount: number;
  total: number;
};

const MAX_LINES = 50;
const MAX_QUANTITY_PER_LINE = 50;
const MAX_TIP_PERCENT = 100;

const roundMoney = (value: number) => Math.round(value * 100) / 100;

/**
 * Calcula el precio de un pedido usando SOLO los datos del menú.
 * Así nadie puede mandar un pedido con precios falsos desde su navegador.
 */
export class OrderPricing {
  private readonly productsById: Map<string, MenuProduct>;

  constructor(products: readonly Product[]) {
    this.productsById = new Map(products.map((product) => [product.id, MenuProduct.from(product)]));
  }

  price(lines: readonly OrderLineRequest[], tipPercent: number): PricedOrder {
    if (!Array.isArray(lines) || lines.length === 0) {
      throw new DomainError("Tu carrito está vacío.", "EMPTY_CART");
    }
    if (lines.length > MAX_LINES) {
      throw new DomainError("El pedido tiene demasiados productos.", "TOO_MANY_LINES");
    }

    const items = lines.map((line) => this.priceLine(line));
    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
    const safeTipPercent = OrderPricing.normalizeTipPercent(tipPercent);
    const tipAmount = roundMoney((subtotal * safeTipPercent) / 100);

    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tipPercent: safeTipPercent,
      tipAmount,
      total: roundMoney(subtotal + tipAmount)
    };
  }

  static normalizeTipPercent(value: number) {
    const tip = Math.round(Number(value) || 0);
    return Math.min(Math.max(tip, 0), MAX_TIP_PERCENT);
  }

  private priceLine(line: OrderLineRequest): CartItem {
    const product = this.productsById.get(line?.productId);
    if (!product) {
      throw new DomainError("Un producto de tu carrito ya no está en el menú.", "PRODUCT_NOT_FOUND");
    }
    if (!product.isAvailable) {
      throw new DomainError(`"${product.name}" no está disponible ahorita.`, "PRODUCT_UNAVAILABLE");
    }

    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      throw new DomainError(`Cantidad inválida para "${product.name}".`, "INVALID_QUANTITY");
    }

    const selections = product.resolveChoices(line.selectedModifiers ?? []);
    const note = typeof line.note === "string" ? line.note.trim().slice(0, 200) : "";

    return {
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      quantity,
      basePrice: product.currentPrice,
      unitPrice: roundMoney(product.unitPriceFor(selections)),
      ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
      ...(note ? { note } : {}),
      selectedModifiers: selections
    };
  }
}
