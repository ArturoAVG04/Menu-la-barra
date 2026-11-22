import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/server/auth";
import { deleteAdminNotificationToken, InvalidSubscriptionError, saveAdminNotificationToken } from "@/lib/server/notifications";

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
  if (typeof body?.token !== "string") {
    return NextResponse.json({ error: "token es obligatorio" }, { status: 400 });
  }

  try {
    await saveAdminNotificationToken(body.token, uid);
  } catch (error) {
    if (error instanceof InvalidSubscriptionError) return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}

// Al cerrar sesión: este dispositivo deja de recibir avisos (no pide sesión: solo borra la suscripción que manda).
export async function DELETE(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin SDK no está configurado" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  if (typeof body?.token !== "string" || body.token.length > 4096) {
    return NextResponse.json({ error: "token es obligatorio" }, { status: 400 });
  }
  await deleteAdminNotificationToken(body.token);
  return NextResponse.json({ ok: true });
}
