import type { Cart } from "@/domain/cart/Cart";
import { LocalJsonStore } from "@/infrastructure/browser/LocalJsonStore";

type PendingOrder = { clientOrderId: string; signature: string };

const pendingStore = new LocalJsonStore<PendingOrder | null>("la-barra-pending-order", null);

/** Huella del pedido: si no cambió, un reintento usa el mismo id y no se duplica. */
function signatureOf(branchId: string, cart: Cart, tipPercent: number) {
  const lines = cart.items.map((item) => [
    item.productId,
    item.quantity,
    item.selectedModifiers.map((modifier) => [modifier.modifierId, [...modifier.optionIds].sort()])
  ]);
  return JSON.stringify([branchId, tipPercent, lines]);
}

/** Id del pedido por enviar (se guarda para reintentos aunque se recargue la página). */
export function pendingOrderId(branchId: string, cart: Cart, tipPercent: number) {
  const signature = signatureOf(branchId, cart, tipPercent);
  const stored = pendingStore.read();
  if (stored && stored.signature === signature && typeof stored.clientOrderId === "string") {
    return stored.clientOrderId;
  }
  const clientOrderId = crypto.randomUUID();
  pendingStore.write({ clientOrderId, signature });
  return clientOrderId;
}

/** El pedido ya se creó: el siguiente será otro. */
export function clearPendingOrder() {
  pendingStore.clear();
}
