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
}
