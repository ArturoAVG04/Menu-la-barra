import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getOrderIfTokenMatches, saveOrderNotificationToken } from "@/lib/server/notifications";

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

  if (!orderId || !body?.token || !body.branchId || !body.trackingToken) {
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

  await saveOrderNotificationToken(orderId, body.token, body.branchId);
  return NextResponse.json({ ok: true });
}
