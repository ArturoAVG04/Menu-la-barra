import type { CartItem } from "@/types";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);

/** Arma los enlaces de contacto de una sucursal (WhatsApp, Instagram) y el ticket por WhatsApp. */
export class BranchContact {
  static whatsappHref(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//.test(trimmed)) return trimmed;
    const digits = trimmed.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : null;
  }

  static instagramHref(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//.test(trimmed)) return trimmed;
    return `https://instagram.com/${trimmed.replace("@", "")}`;
  }

  /** Enlace de WhatsApp con el pedido escrito, para que el cliente lo comparta. */
  static whatsappTicketHref(params: {
    whatsapp?: string;
    branchName?: string;
    customerName?: string;
    customerPhone?: string;
    orderNote?: string;
    items: ReadonlyArray<Pick<CartItem, "name" | "quantity" | "unitPrice" | "selectedModifiers">>;
    subtotal: number;
    tipAmount: number;
    total: number;
    orderId?: string;
  }) {
    const base = BranchContact.whatsappHref(params.whatsapp);
    if (!base) return null;

    const itemLines = params.items.map((item) => {
      const modifiers = item.selectedModifiers
        .map((modifier) =>
          modifier.optionNames?.length ? ` (${modifier.modifierName}: ${modifier.optionNames.join(", ")})` : ""
        )
        .join("");
      return `- ${item.quantity}x ${item.name}${modifiers} - ${formatMoney(item.unitPrice * item.quantity)}`;
    });

    const message = [
      "Hola, quiero compartir mi pedido.",
      params.branchName ? `Sucursal: ${params.branchName}` : null,
      params.orderId ? `Pedido: #${params.orderId.slice(-6).toUpperCase()}` : null,
      params.customerName ? `Cliente: ${params.customerName}` : null,
      params.customerPhone ? `Telefono: ${params.customerPhone}` : null,
      "",
      "Detalle:",
      ...itemLines,
      "",
      `Subtotal: ${formatMoney(params.subtotal)}`,
      `Propina: ${formatMoney(params.tipAmount)}`,
      `Total: ${formatMoney(params.total)}`,
      params.orderNote ? "" : null,
      params.orderNote ? `Nota: ${params.orderNote}` : null
    ]
      .filter((line) => line !== null)
      .join("\n");

    return `${base}${base.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;
  }
}
