import { NextResponse, type NextRequest } from "next/server";

import { isFirebaseAdminConfigured, adminDb } from "@/lib/firebase/admin";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin SDK no está configurado" },
      { status: 503 }
    );
  }

  const { orderId } = await context.params;
  const trackingToken = request.nextUrl.searchParams.get("token")?.trim();

  if (!orderId || !trackingToken) {
    return NextResponse.json({ error: "orderId y token son obligatorios" }, { status: 400 });
  }

  const snapshot = await adminDb().collection("orders").doc(orderId).get();
  if (!snapshot.exists) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const order = snapshot.data() as {
    trackingToken?: string;
    items?: unknown;
    customerName?: string;
    customerPhone?: string;
    orderNote?: string;
    subtotal?: number;
    tipPercent?: number;
    tipAmount?: number;
    total?: number;
    status?: string;
    estimatedMinutes?: number;
    estimatedReadyAt?: number;
    statusMessage?: string;
    createdAt?: number;
  };

  if (!order.trackingToken || order.trackingToken !== trackingToken) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: snapshot.id,
    items: order.items ?? [],
    customerName: order.customerName ?? "",
    customerPhone: order.customerPhone ?? "",
    orderNote: order.orderNote ?? "",
    subtotal: order.subtotal ?? 0,
    tipPercent: order.tipPercent ?? 0,
    tipAmount: order.tipAmount ?? 0,
    total: order.total ?? 0,
    status: order.status ?? "new",
    estimatedMinutes: order.estimatedMinutes,
    estimatedReadyAt: order.estimatedReadyAt,
    statusMessage: order.statusMessage ?? "",
    createdAt: order.createdAt ?? Date.now()
  });
}
