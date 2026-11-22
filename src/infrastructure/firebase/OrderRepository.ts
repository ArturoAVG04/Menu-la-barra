import { collection, deleteDoc, doc, onSnapshot, query, where, type Firestore } from "firebase/firestore";

import { FirestoreRepository, type Unsubscribe } from "@/infrastructure/firebase/FirestoreRepository";
import type { Order } from "@/types";

/** Lectura en tiempo real de pedidos (solo admin; el cliente usa /api/orders/[id]/track). */
export class OrderRepository extends FirestoreRepository {
  constructor(private readonly db: Firestore) {
    super();
  }

  subscribeByBranch(branchId: string, callback: (orders: Order[]) => void): Unsubscribe {
    const ref = query(collection(this.db, "orders"), where("sucursalID", "==", branchId));
    return onSnapshot(ref, (snapshot) => {
      callback(
        snapshot.docs.map((item) => this.toEntity<Order>(item)).sort((a, b) => b.createdAt - a.createdAt)
      );
    });
  }

  delete(orderId: string) {
    return deleteDoc(doc(this.db, "orders", orderId));
  }
}
