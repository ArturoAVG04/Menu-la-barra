import { collection, deleteDoc, doc, onSnapshot, query, where, type Firestore } from "firebase/firestore";

import { FirestoreRepository, type Unsubscribe } from "@/infrastructure/firebase/FirestoreRepository";
import type { Order } from "@/types";

/** Lectura en tiempo real de pedidos (el admin ve todos los de su sucursal; el cliente, solo el suyo). */
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

  subscribe(orderId: string, callback: (order: Order | null) => void): Unsubscribe {
    return onSnapshot(
      doc(this.db, "orders", orderId),
      (snapshot) => callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Order) : null),
      (error) => console.error("Error al escuchar cambios del pedido:", error)
    );
  }

  delete(orderId: string) {
    return deleteDoc(doc(this.db, "orders", orderId));
  }
}
