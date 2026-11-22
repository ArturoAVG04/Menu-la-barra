import { NextResponse, type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/server/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

// Sube una imagen a ImgBB desde el servidor: la llave ya no viaja en el JavaScript del navegador.
export async function POST(request: NextRequest) {
  try {
    await requireAdminUser(request);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.IMGBB_API_KEY ?? process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Falta IMGBB_API_KEY en el servidor." }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  if (!image) return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });

  const outgoing = new FormData();
  if (typeof image === "string") {
    // Liga https o imagen en base64 (lo que acepta ImgBB).
    if (image.length > MAX_BYTES * 1.4 || !/^(https:\/\/|data:image\/)/.test(image)) {
      return NextResponse.json({ error: "Imagen no válida" }, { status: 400 });
    }
    outgoing.append("image", image);
  } else {
    if (image.size > MAX_BYTES) return NextResponse.json({ error: "La imagen pesa más de 8 MB" }, { status: 413 });
    if (!IMAGE_TYPES.has(image.type)) return NextResponse.json({ error: "Solo imágenes JPG, PNG, WebP, GIF o AVIF" }, { status: 400 });
    outgoing.append("image", image);
  }

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: outgoing });
  const payload = (await response.json().catch(() => null)) as { data?: { url?: string } } | null;
  if (!response.ok || !payload?.data?.url) {
    return NextResponse.json({ error: "No se pudo subir la imagen a ImgBB." }, { status: 502 });
  }
  return NextResponse.json({ url: payload.data.url });
}
