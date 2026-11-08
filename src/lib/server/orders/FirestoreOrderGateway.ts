import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import type { OrderGateway } from "@/lib/server/orders/PlaceOrderService";
import { notifyAdminsOfNewOrder } from "@/lib/server/notifications";
import type { Branch, Product } from "@/types";

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

  async saveOrder(order: Record<string, unknown>): Promise<string> {
    const reference = await adminDb()
      .collection("orders")
      .add({ ...order, serverCreatedAt: FieldValue.serverTimestamp() });
    return reference.id;
  }

  async notifyAdmins(orderId: string, trackingToken: string): Promise<void> {
    await notifyAdminsOfNewOrder(orderId, trackingToken);
  }
}
