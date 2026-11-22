// Datos públicos del negocio para Google (metadata y JSON-LD). Sin dirección de calle: es una casa particular.
import { MENU_URL } from "@/lib/hosts";

export const SITE_NAME = "La Barra";
export const SITE_TITLE = "La Barra · Hamburguesas, alitas y burritos en Guanajuato";
export const SITE_DESCRIPTION =
  "Hamburguesas, alitas, boneless, burritos y papas en Guanajuato capital. Universidad entre semana, La Presa los fines de semana. Pide por WhatsApp o en línea.";
export const SITE_PHONE = "+52 473 165 0241";
export const INSTAGRAM_URL = "https://www.instagram.com/labarraguanajuato";

export function buildRestaurantJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${MENU_URL}/#restaurant`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: MENU_URL,
    menu: MENU_URL,
    image: `${MENU_URL}/opengraph-image`,
    logo: `${MENU_URL}/icons/icon-512.png`,
    telephone: SITE_PHONE,
    servesCuisine: ["Hamburguesas", "Alitas", "Boneless", "Burritos", "Papas"],
    priceRange: "$",
    acceptsReservations: false,
    areaServed: "Guanajuato, Guanajuato, MX",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Guanajuato",
      addressRegion: "Gto.",
      addressCountry: "MX"
    },
    sameAs: [INSTAGRAM_URL],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "15:00",
        closes: "21:00"
      },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "13:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "13:00", closes: "19:00" }
    ]
  };
}
