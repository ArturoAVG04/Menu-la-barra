import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { notifyAdminsOfNewOrder } from "@/lib/server/notifications";

type RouteContext = { params: Promise<{ orderId: string }> };

// Lo llama el cliente justo después de crear su pedido para avisar al admin.
export async function POST(request: NextRequest, context: RouteContext) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin SDK no está configurado" }, { status: 503 });
  }

  const { orderId } = await context.params;
  const body = (await request.json().catch(() => null)) as { trackingToken?: string } | null;
  if (!orderId || !body?.trackingToken) {
    return NextResponse.json({ error: "orderId y trackingToken son obligatorios" }, { status: 400 });
  }

  try {
    const result = await notifyAdminsOfNewOrder(orderId, body.trackingToken);
    if (!result.ok) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al avisar al admin del pedido:", error);
    return NextResponse.json({ error: "No se pudo enviar el aviso" }, { status: 500 });
  }
}
