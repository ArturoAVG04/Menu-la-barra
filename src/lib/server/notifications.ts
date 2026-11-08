import { createHash } from "node:crypto";

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
      url: "/"
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

  try {
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
  } catch (error) {
    console.error("Error al enviar notificaciones del pedido:", error);
  }
}

// ---------- Notificaciones para el admin ----------

const ADMIN_NOTIFICATION_COLLECTION = "adminNotificationTokens";
const INVALID_TOKEN_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered"
]);

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function saveAdminNotificationToken(token: string, uid: string) {
  const normalizedToken = token.trim();
  if (!normalizedToken) throw new Error("Missing notification token");

  await adminDb()
    .collection(ADMIN_NOTIFICATION_COLLECTION)
    .doc(hashToken(normalizedToken))
    .set(
      {
        token: normalizedToken,
        uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
}

/** Valida que el pedido exista y que el trackingToken coincida (solo lo conoce quien lo creó). */
export async function getOrderIfTokenMatches(orderId: string, trackingToken: string) {
  const snapshot = await adminDb().collection("orders").doc(orderId).get();
  if (!snapshot.exists) return null;
  const data = (snapshot.data() ?? {}) as { trackingToken?: string } & Record<string, unknown>;
  if (!data.trackingToken || data.trackingToken !== trackingToken) return null;
  return { ref: snapshot.ref, data };
}

/** Avisa a todos los dispositivos admin de un pedido nuevo. Solo se envía una vez por pedido. */
export async function notifyAdminsOfNewOrder(orderId: string, trackingToken: string) {
  const order = await getOrderIfTokenMatches(orderId, trackingToken);
  if (!order) return { ok: false as const, sent: 0 };

  const alreadyNotified = await adminDb().runTransaction(async (transaction) => {
    const fresh = await transaction.get(order.ref);
    if (fresh.get("adminNotifiedAt")) return true;
    transaction.update(order.ref, { adminNotifiedAt: Date.now() });
    return false;
  });
  if (alreadyNotified) return { ok: true as const, sent: 0 };

  const tokenSnapshot = await adminDb().collection(ADMIN_NOTIFICATION_COLLECTION).get();
  const tokens = tokenSnapshot.docs.map((doc) => doc.get("token") as string).filter(Boolean);
  if (!tokens.length) return { ok: true as const, sent: 0 };

  const data = order.data as {
    customerName?: string;
    total?: number;
    itemCount?: number;
    sucursalID?: string;
  };
  let branchName = "";
  if (data.sucursalID) {
    const branch = await adminDb().collection("sucursales").doc(data.sucursalID).get();
    branchName = (branch.get("name") as string | undefined) ?? "";
  }

  const parts = [
    data.customerName?.trim() || "Cliente sin nombre",
    typeof data.total === "number" ? `$${data.total}` : null,
    data.itemCount ? `${data.itemCount} producto${data.itemCount === 1 ? "" : "s"}` : null,
    branchName || null
  ].filter(Boolean);

  const response = await adminMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: `Nuevo pedido #${orderId.slice(-6).toUpperCase()}`,
      body: parts.join(" · ")
    },
    data: { url: "/admin" }
  });

  await Promise.all(
    response.responses.map((item, index) => {
      if (item.success || !item.error || !INVALID_TOKEN_CODES.has(item.error.code)) {
        return Promise.resolve();
      }
      return adminDb().collection(ADMIN_NOTIFICATION_COLLECTION).doc(hashToken(tokens[index])).delete();
    })
  );

  return { ok: true as const, sent: response.successCount };
}
