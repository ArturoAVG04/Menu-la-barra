import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/server/auth";
import { sendAdminTestNotification } from "@/lib/server/notifications";

// "Probar aviso": manda una notificación de prueba a todos los dispositivos admin registrados.
export async function POST(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "El servidor no está configurado." }, { status: 503 });
  }
  try {
    await requireAdminUser(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(await sendAdminTestNotification());
}
