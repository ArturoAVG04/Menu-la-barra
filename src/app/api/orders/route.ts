import { NextResponse, type NextRequest } from "next/server";

import { DomainError } from "@/domain/errors";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { LEGAL_VERSION } from "@/lib/legal";
import { FirestoreOrderGateway } from "@/lib/server/orders/FirestoreOrderGateway";
import { PlaceOrderService, type PlaceOrderRequest } from "@/lib/server/orders/PlaceOrderService";

// Crear pedido: el servidor recalcula los precios con el menú real.
export async function POST(request: NextRequest) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "El servidor no está configurado." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as PlaceOrderRequest | null;
  if (!body) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  try {
    const service = new PlaceOrderService(new FirestoreOrderGateway(), LEGAL_VERSION);
    const result = await service.execute(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error("Error al crear pedido:", error);
    return NextResponse.json({ error: "No pudimos enviar tu pedido. Intenta de nuevo." }, { status: 500 });
  }
}
