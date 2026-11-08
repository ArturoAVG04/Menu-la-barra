import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/server/auth";
import { saveAdminNotificationToken } from "@/lib/server/notifications";

// Registra el dispositivo del admin para recibir avisos de pedidos nuevos.
export async function POST(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin SDK no está configurado" }, { status: 503 });
  }

  let uid: string;
  try {
    uid = (await requireAdminUser(request)).uid;
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  if (!body?.token) {
    return NextResponse.json({ error: "token es obligatorio" }, { status: 400 });
  }

  await saveAdminNotificationToken(body.token, uid);
  return NextResponse.json({ ok: true });
}
