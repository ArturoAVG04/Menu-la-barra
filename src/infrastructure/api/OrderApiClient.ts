import type { User } from "firebase/auth";

import type { CartItem, OrderStatus, PublicTrackedOrder } from "@/types";

export type CreateOrderInput = {
  branchId: string;
  items: readonly CartItem[];
  customerName: string;
  customerPhone: string;
  orderNote: string;
  tipPercent: number;
  legalVersion: string;
};

export type OrderStatusUpdate = {
  status: OrderStatus;
  estimatedMinutes?: number;
  estimatedReadyAt?: number;
  statusMessage?: string;
};

/** Cliente HTTP de las rutas /api del menú. Centraliza el manejo de errores. */
export class OrderApiClient {
  private async request<T>(url: string, init: RequestInit, fallbackError: string): Promise<T> {
    const response = await fetch(url, init);
    const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!response.ok) {
      throw new Error(body?.error || fallbackError);
    }
    return body as T;
  }

  private json(body: unknown, idToken?: string): RequestInit {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify(body)
    };
  }

  /** Solo manda ids, cantidades y opciones: el servidor recalcula los precios. */
  async create(input: CreateOrderInput) {
    const result = await this.request<{ id: string; trackingToken: string; total?: number }>(
      "/api/orders",
      this.json({
        branchId: input.branchId,
        items: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(item.note ? { note: item.note } : {}),
          selectedModifiers: item.selectedModifiers.map((modifier) => ({
            modifierId: modifier.modifierId,
            optionIds: modifier.optionIds
          }))
        })),
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        orderNote: input.orderNote,
        tipPercent: input.tipPercent,
        legalConsent: { version: input.legalVersion }
      }),
      "No pudimos enviar tu pedido. Intenta nuevamente."
    );
    if (!result?.id || !result.trackingToken) throw new Error("No pudimos enviar tu pedido. Intenta nuevamente.");
    return result;
  }

  async track(orderId: string, trackingToken: string): Promise<PublicTrackedOrder | null> {
    const search = new URLSearchParams({ token: trackingToken });
    const response = await fetch(`/api/orders/${orderId}/track?${search}`, { cache: "no-store" });
    if (response.status === 404) return null;
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error || "No se pudo consultar el pedido");
    return body as PublicTrackedOrder;
  }

  async updateStatusAsAdmin(user: User, orderId: string, update: OrderStatusUpdate) {
    await this.request(
      `/api/orders/${orderId}/status`,
      this.json(update, await user.getIdToken()),
      "No se pudo actualizar el pedido"
    );
  }

  async registerCustomerPushToken(orderId: string, branchId: string, token: string, trackingToken: string) {
    await this.request(
      `/api/orders/${orderId}/notifications`,
      this.json({ token, branchId, trackingToken }),
      "No se pudo registrar el token de notificaciones"
    );
  }

  async registerAdminPushToken(user: User, token: string) {
    await this.request(
      "/api/admin/notification-token",
      this.json({ token }, await user.getIdToken()),
      "No se pudo activar las notificaciones"
    );
  }
}
