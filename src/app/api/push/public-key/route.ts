import { NextResponse } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { WebPushSender } from "@/lib/server/push/WebPushSender";

// Llave pública VAPID: el navegador la necesita para suscribirse a las notificaciones.
export async function GET() {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "El servidor no está configurado." }, { status: 503 });
  }
  try {
    const { publicKey } = await WebPushSender.getKeys();
    return NextResponse.json({ publicKey }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch (error) {
    console.error("Error al obtener llave de Web Push:", error);
    return NextResponse.json({ error: "No se pudo preparar las notificaciones." }, { status: 500 });
  }
}
