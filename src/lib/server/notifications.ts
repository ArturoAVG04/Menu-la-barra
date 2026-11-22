import { createHash } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { PushSubscriptionPolicy } from "@/domain/push/PushSubscriptionPolicy";
import { adminDb } from "@/lib/firebase/admin";
import { WebPushSender } from "@/lib/server/push/WebPushSender";
import type { OrderStatus } from "@/types";

/** La suscripción push no es de un servicio conocido o viene dañada. */
export class InvalidSubscriptionError extends Error {}

/** Otro dispositivo ya cambió el pedido a un estado que no permite este cambio. */
export class StatusConflictError extends Error {}

/** Valida la suscripción o lanza InvalidSubscriptionError. */
function requireValidSubscription(token: string) {
  const normalized = PushSubscriptionPolicy.normalize(token);
  if (!normalized) throw new InvalidSubscriptionError("Suscripción de avisos no válida");
  return normalized;
}

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
  return `${orderId}_${createHash("sha256").update(token).digest("hex")}`;
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
  const normalizedToken = requireValidSubscription(token);

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
  // Se valida contra el estado ACTUAL en una transacción: si dos dispositivos cambian el
  // pedido al mismo tiempo (uno acepta y otro rechaza), el segundo recibe un error en vez de pisar.
  await adminDb().runTransaction(async (transaction) => {
    const fresh = await transaction.get(orderRef);
    if (!fresh.exists) throw new StatusConflictError("El pedido ya no existe");
    const current = fresh.get("status") as OrderStatus;
    if (current !== payload.status && !OrderLifecycle.canTransition(current, payload.status)) {
      throw new StatusConflictError(`El pedido ya está "${OrderLifecycle.label(current)}"`);
    }
    transaction.update(orderRef, {
      status: payload.status,
      updatedAt: Date.now(),
      ...(typeof payload.estimatedMinutes === "number" ? { estimatedMinutes: payload.estimatedMinutes } : {}),
      ...(typeof payload.estimatedReadyAt === "number" ? { estimatedReadyAt: payload.estimatedReadyAt } : {}),
      ...(payload.statusMessage ? { statusMessage: payload.statusMessage.slice(0, 300) } : {})
    });
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
    const { invalidTokens } = await new WebPushSender().send(tokens, {
      title: pushPayload.notification.title,
      body: pushPayload.notification.body,
      url: pushPayload.data.url
    });
    await Promise.all(
      invalidTokens.map((invalidToken) =>
        adminDb()
          .collection(ORDER_NOTIFICATION_COLLECTION)
          .doc(getNotificationTokenDocumentId(orderId, invalidToken))
          .delete()
      )
    );
  } catch (error) {
    console.error("Error al enviar notificaciones del pedido:", error);
  }
}

// ---------- Notificaciones para el admin ----------

const ADMIN_NOTIFICATION_COLLECTION = "adminNotificationTokens";
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function saveAdminNotificationToken(token: string, uid: string) {
  const normalizedToken = requireValidSubscription(token);

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

/** Al cerrar sesión: este dispositivo deja de recibir avisos de pedidos. */
export async function deleteAdminNotificationToken(token: string) {
  const normalized = PushSubscriptionPolicy.normalize(token);
  await Promise.all(
    [token.trim(), normalized].filter((t): t is string => !!t).map((t) =>
      adminDb().collection(ADMIN_NOTIFICATION_COLLECTION).doc(hashToken(t)).delete()
    )
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

  let result: { successCount: number; invalidTokens: string[] };
  try {
    result = await new WebPushSender().send(tokens, {
      title: `Nuevo pedido #${orderId.slice(-6).toUpperCase()}`,
      body: parts.join(" · "),
      url: "/admin"
    });
  } catch (error) {
    // Si el envío falla, se quita la marca para que se pueda reintentar.
    await order.ref.update({ adminNotifiedAt: FieldValue.delete() }).catch(() => undefined);
    throw error;
  }
  const { successCount, invalidTokens } = result;

  await Promise.all(
    invalidTokens.map((invalidToken) =>
      adminDb().collection(ADMIN_NOTIFICATION_COLLECTION).doc(hashToken(invalidToken)).delete()
    )
  );

  return { ok: true as const, sent: successCount };
}

/** Notificación de prueba para todos los admins. Devuelve cuántos dispositivos hay y a cuántos llegó. */
export async function sendAdminTestNotification() {
  const snapshot = await adminDb().collection(ADMIN_NOTIFICATION_COLLECTION).get();
  const tokens = snapshot.docs.map((doc) => doc.get("token") as string).filter(Boolean);
  if (!tokens.length) return { devices: 0, sent: 0, removed: 0 };

  const { successCount, invalidTokens } = await new WebPushSender().send(tokens, {
    title: "Prueba de aviso",
    body: "Si ves esto, los avisos de pedidos nuevos funcionan en este dispositivo.",
    url: "/admin"
  });
  await Promise.all(
    invalidTokens.map((token) => adminDb().collection(ADMIN_NOTIFICATION_COLLECTION).doc(hashToken(token)).delete())
  );
  return { devices: tokens.length, sent: successCount, removed: invalidTokens.length };
}
