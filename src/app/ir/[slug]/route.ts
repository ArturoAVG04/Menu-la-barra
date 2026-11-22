import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";

/**
 * Liga editable para QR impresos o tarjetas NFC: /ir/<slug> manda a la URL guardada en
 * Firestore `enlaces/<slug>` (campo `url`). Se cambia el destino sin reimprimir el QR.
 * Si no existe o no es https, manda al menú.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = new URL("/", request.url);
  if (!/^[a-z0-9-]{1,40}$/i.test(slug)) return NextResponse.redirect(fallback, 307);
  try {
    const doc = await adminDb().collection("enlaces").doc(slug.toLowerCase()).get();
    const url = String(doc.get("url") ?? "").trim();
    if (/^https:\/\/\S+$/i.test(url)) return NextResponse.redirect(url, 307);
  } catch (error) {
    console.error("Enlace editable:", error);
  }
  return NextResponse.redirect(fallback, 307);
}
