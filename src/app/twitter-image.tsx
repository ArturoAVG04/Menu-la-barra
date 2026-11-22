import { OG_SIZE, renderOgImage } from "@/lib/ogImage";

export const alt = "La Barra: hamburguesas, alitas y burritos en Guanajuato";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
