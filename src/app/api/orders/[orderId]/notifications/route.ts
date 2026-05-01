import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { saveOrderNotificationToken } from "@/lib/server/notifications";

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
    | { token?: string; branchId?: string }
    | null;

  if (!orderId || !body?.token || !body.branchId) {
    return NextResponse.json(
      { error: "orderId, token y branchId son obligatorios" },
      { status: 400 }
    );
  }

  await saveOrderNotificationToken(orderId, body.token, body.branchId);
  return NextResponse.json({ ok: true });
}
