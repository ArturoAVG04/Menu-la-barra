import { FieldValue } from "firebase-admin/firestore";

import { adminDb, adminMessaging } from "@/lib/firebase/admin";
import type { OrderStatus } from "@/types";

export type OrderStatusUpdatePayload = {
  status: OrderStatus;
  estimatedMinutes?: number;
  estimatedReadyAt?: number;
  statusMessage?: string;
};

type NotificationTokenRecord = {
  token: string;
};

const ORDER_NOTIFICATION_COLLECTION = "orderNotificationTokens";

function getNotificationTokenDocumentId(orderId: string, token: string) {
  return `${orderId}_${encodeURIComponent(token)}`;
}

function buildNotificationPayload(orderId: string, payload: OrderStatusUpdatePayload) {
  if (payload.status === "delivered") {
    return null;
  }

  const statusLabels: Partial<Record<OrderStatus, string>> = {
    preparing: "En cocina",
    ready: "Listo para entrega",
    rejected: "Pedido rechazado"
  };

  return {
    notification: {
      title: "Actualización de tu pedido",
      body:
        payload.statusMessage ||
        `Tu pedido ${orderId.slice(-6).toUpperCase()} ahora está en estado: ${statusLabels[payload.status] ?? payload.status}.`
    },
    data: {
      url: "/customer"
    }
  };
}

export async function saveOrderNotificationToken(orderId: string, token: string, branchId: string) {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    throw new Error("Missing notification token");
  }

  const docId = getNotificationTokenDocumentId(orderId, normalizedToken);
  await adminDb().collection(ORDER_NOTIFICATION_COLLECTION).doc(docId).set(
    {
      orderId,
      branchId,
      token: normalizedToken,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

export async function updateOrderAndSendNotifications(
  orderId: string,
  payload: OrderStatusUpdatePayload
) {
  const orderRef = adminDb().collection("orders").doc(orderId);
  await orderRef.update({
    status: payload.status,
    updatedAt: Date.now(),
    ...(typeof payload.estimatedMinutes === "number"
      ? { estimatedMinutes: payload.estimatedMinutes }
      : {}),
    ...(typeof payload.estimatedReadyAt === "number"
      ? { estimatedReadyAt: payload.estimatedReadyAt }
      : {}),
    ...(payload.statusMessage ? { statusMessage: payload.statusMessage } : {})
  });

  const pushPayload = buildNotificationPayload(orderId, payload);
  if (!pushPayload) {
    return;
  }

  const tokenSnapshot = await adminDb()
    .collection(ORDER_NOTIFICATION_COLLECTION)
    .where("orderId", "==", orderId)
    .get();

  const tokens = tokenSnapshot.docs
    .map((document) => document.data() as NotificationTokenRecord)
    .map((item) => item.token)
    .filter(Boolean);

  if (!tokens.length) {
    return;
  }

  const response = await adminMessaging().sendEachForMulticast({
    tokens,
    notification: pushPayload.notification,
    data: pushPayload.data
  });

  const invalidCodes = new Set([
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered"
  ]);

  await Promise.all(
    response.responses.map((item, index) => {
      if (item.success) return Promise.resolve();
      if (!item.error || !invalidCodes.has(item.error.code)) return Promise.resolve();

      const invalidToken = tokens[index];
      if (!invalidToken) return Promise.resolve();

      return adminDb()
        .collection(ORDER_NOTIFICATION_COLLECTION)
        .doc(getNotificationTokenDocumentId(orderId, invalidToken))
        .delete();
    })
  );
}
