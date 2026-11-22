import { NextResponse, type NextRequest } from "next/server";

import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { requireAdminUser } from "@/lib/server/auth";

type RouteContext = { params: Promise<{ branchId: string }> };

// Borra una sucursal con TODO lo que tiene dentro (productos, categorías, personalizaciones).
// Desde el navegador solo se podía borrar el documento y las subcolecciones quedaban huérfanas.
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin SDK no está configurado" }, { status: 503 });
  }
  try {
    await requireAdminUser(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { branchId } = await context.params;
  if (!branchId || !/^[\w-]{1,128}$/.test(branchId)) {
    return NextResponse.json({ error: "Sucursal no válida" }, { status: 400 });
  }
  await adminDb().recursiveDelete(adminDb().collection("sucursales").doc(branchId));
  await adminDb().collection("branding").doc(branchId).delete();
  return NextResponse.json({ ok: true });
}
