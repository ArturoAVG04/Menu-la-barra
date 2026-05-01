import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { deleteExpiredOrders } from "@/lib/server/maintenance";

function isAuthorizedCronRequest(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");

  if (!secret) {
    return false;
  }

  return authorization === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin SDK no está configurado" },
      { status: 503 }
    );
  }

  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await deleteExpiredOrders();
  return NextResponse.json({
    ok: true,
    ...result
  });
}
