import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getOrderIfTokenMatches, InvalidSubscriptionError, saveOrderNotificationToken } from "@/lib/server/notifications";

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

  const { orderId } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { token?: string; branchId?: string; trackingToken?: string }
    | null;

  if (!orderId || typeof body?.token !== "string" || typeof body.branchId !== "string" || typeof body.trackingToken !== "string") {
    return NextResponse.json(
      { error: "orderId, token, branchId y trackingToken son obligatorios" },
      { status: 400 }
    );
  }

  // Solo quien creó el pedido (conoce su trackingToken) puede suscribirse a sus avisos
  const order = await getOrderIfTokenMatches(orderId, body.trackingToken);
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  try {
    await saveOrderNotificationToken(orderId, body.token, body.branchId);
  } catch (error) {
    if (error instanceof InvalidSubscriptionError) return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}
