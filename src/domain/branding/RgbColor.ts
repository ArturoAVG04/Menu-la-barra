/**
 * Convierte colores entre el formato del input de color ("#37655e")
 * y el que guarda el branding para Tailwind ("55 101 94").
 */
export class RgbColor {
  static fromHex(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  }

  static toHex(rgb: string) {
    const parts = (rgb || "0 0 0").split(" ").map(Number);
    return "#" + parts.map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("");
  }

  /** Contraste WCAG entre dos colores "r g b" (1 a 21). */
  static contrast(a: string, b: string) {
    const lum = (rgb: string) => {
      const [r, g, bl] = rgb.split(" ").map(Number).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  /** Oscurece el color lo mínimo para que el texto blanco encima (y él sobre blanco) se lea: contraste ≥ 4.5. */
  static readableOnWhite(rgb: string, min = 4.6) {
    let parts = (rgb || "0 0 0").split(" ").map(Number);
    for (let i = 0; i < 40 && RgbColor.contrast(parts.join(" "), "255 255 255") < min; i++) {
      parts = parts.map((v) => Math.max(0, Math.round(v * 0.96)));
    }
    return parts.join(" ");
  }
}
