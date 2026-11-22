import { createHash } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import type { ExistingOrder, OrderGateway } from "@/lib/server/orders/PlaceOrderService";
import { RateLimitWindow } from "@/lib/server/orders/RateLimitWindow";
import { notifyAdminsOfNewOrder } from "@/lib/server/notifications";
import type { Branch, Product } from "@/types";

const ordersWindow = new RateLimitWindow(5, 10 * 60_000);

/** Implementación de OrderGateway con Firebase Admin (solo corre en el servidor). */
export class FirestoreOrderGateway implements OrderGateway {
  async findBranch(branchId: string): Promise<Branch | null> {
    const snapshot = await adminDb().collection("sucursales").doc(branchId).get();
    return snapshot.exists ? ({ id: snapshot.id, ...snapshot.data() } as Branch) : null;
  }

  async findProducts(branchId: string): Promise<Product[]> {
    const snapshot = await adminDb().collection("sucursales").doc(branchId).collection("products").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product);
  }

  async findOrder(orderId: string): Promise<ExistingOrder | null> {
    const snapshot = await adminDb().collection("orders").doc(orderId).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data() ?? {};
    return {
      id: snapshot.id,
      trackingToken: String(data.trackingToken ?? ""),
      subtotal: Number(data.subtotal) || 0,
      tipAmount: Number(data.tipAmount) || 0,
      total: Number(data.total) || 0
    };
  }

  /** `create()` falla si el id ya existe: así dos reintentos simultáneos no duplican el pedido. */
  async saveOrder(orderId: string, order: Record<string, unknown>): Promise<boolean> {
    try {
      await adminDb()
        .collection("orders")
        .doc(orderId)
        .create({ ...order, serverCreatedAt: FieldValue.serverTimestamp() });
      return true;
    } catch (error) {
      if ((error as { code?: number }).code === 6) return false; // ALREADY_EXISTS
      throw error;
    }
  }

  /** Cuenta pedidos por IP (guardada como hash) en `rateLimits`. */
  async allowOrderFrom(clientKey: string, now: number): Promise<boolean> {
    const id = createHash("sha256").update(clientKey).digest("hex");
    const ref = adminDb().collection("rateLimits").doc(id);
    return adminDb().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const { allowed, hits } = ordersWindow.hit(snapshot.get("hits"), now);
      if (allowed) {
        transaction.set(ref, { hits, expiresAt: new Date(now + ordersWindow.windowMs) });
      }
      return allowed;
    });
  }

  async notifyAdmins(orderId: string, trackingToken: string): Promise<void> {
    await notifyAdminsOfNewOrder(orderId, trackingToken);
  }
}
