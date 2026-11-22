import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Imagen para compartir (WhatsApp, Facebook, X): PNG 1200×630 con la marca. */
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #37655e, #25302f)",
          color: "#ffffff"
        }}
      >
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4 }}>La Barra</div>
        <div style={{ fontSize: 54, marginTop: 16 }}>Hamburguesas, alitas y burritos</div>
        <div style={{ fontSize: 38, marginTop: 24, color: "#79c497" }}>Guanajuato · Pide por WhatsApp</div>
      </div>
    ),
    OG_SIZE
  );
}
