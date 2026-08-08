import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/server/auth";
import {
  updateOrderAndSendNotifications,
  type OrderStatusUpdatePayload
} from "@/lib/server/notifications";
import type { OrderStatus } from "@/types";

const allowedStatuses = new Set<OrderStatus>([
  "new",
  "preparing",
  "ready",
  "rejected",
  "delivered"
]);

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin SDK no está configurado" },
      { status: 503 }
    );
  }

  try {
    await requireAdminUser(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { orderId } = await context.params;
  const body = (await request.json().catch(() => null)) as OrderStatusUpdatePayload | null;

  if (!orderId || !body?.status) {
    return NextResponse.json(
      { error: "orderId y status son obligatorios" },
      { status: 400 }
    );
  }

  if (!allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Estado de pedido inválido" }, { status: 400 });
  }

  try {
    await updateOrderAndSendNotifications(orderId, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el pedido" },
      { status: 500 }
    );
  }
}
