import { adminDb } from "@/lib/firebase/admin";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export async function deleteExpiredOrders() {
  const cutoffTimestamp = Date.now() - THREE_DAYS_MS;
  const ordersCollection = adminDb().collection("orders");
  const expiredSnapshot = await ordersCollection
    .where("status", "in", ["delivered", "rejected"])
    .where("createdAt", "<=", cutoffTimestamp)
    .get();

  if (expiredSnapshot.empty) {
    return {
      deletedOrders: 0,
      deletedNotificationTokens: 0
    };
  }

  let deletedNotificationTokens = 0;

  for (const orderDocument of expiredSnapshot.docs) {
    const tokenSnapshot = await adminDb()
      .collection("orderNotificationTokens")
      .where("orderId", "==", orderDocument.id)
      .get();

    deletedNotificationTokens += tokenSnapshot.size;

    const batch = adminDb().batch();
    batch.delete(orderDocument.ref);

    tokenSnapshot.docs.forEach((tokenDocument) => {
      batch.delete(tokenDocument.ref);
    });

    await batch.commit();
  }

  return {
    deletedOrders: expiredSnapshot.size,
    deletedNotificationTokens
  };
}
