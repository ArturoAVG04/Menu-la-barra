import { NextResponse, type NextRequest } from "next/server";

import { DomainError } from "@/domain/errors";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { LEGAL_VERSION } from "@/lib/legal";
import { FirestoreOrderGateway } from "@/lib/server/orders/FirestoreOrderGateway";
import { PlaceOrderService, type PlaceOrderRequest } from "@/lib/server/orders/PlaceOrderService";

/** IP del cliente (primera de x-forwarded-for, que pone Vercel). */
function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

// Crear pedido: el servidor recalcula los precios con el menú real.
export async function POST(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "El servidor no está configurado." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as PlaceOrderRequest | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  try {
    const service = new PlaceOrderService(new FirestoreOrderGateway(), LEGAL_VERSION);
    const result = await service.execute(body, clientIp(request));
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      const status = error.code === "RATE_LIMITED" ? 429 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("Error al crear pedido:", error);
    return NextResponse.json({ error: "No pudimos enviar tu pedido. Intenta de nuevo." }, { status: 500 });
  }
}
