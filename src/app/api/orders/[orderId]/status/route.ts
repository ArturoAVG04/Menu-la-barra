import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/server/auth";
import {
  updateOrderAndSendNotifications,
  type OrderStatusUpdatePayload
} from "@/lib/server/notifications";

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

  await updateOrderAndSendNotifications(orderId, body);
  return NextResponse.json({ ok: true });
}
