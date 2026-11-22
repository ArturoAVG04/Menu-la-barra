import type { MetadataRoute } from "next";

import { MENU_URL } from "@/lib/hosts";
import { LEGAL_VERSION } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${MENU_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${MENU_URL}/privacidad`, lastModified: LEGAL_VERSION, changeFrequency: "yearly", priority: 0.2 },
    { url: `${MENU_URL}/terminos`, lastModified: LEGAL_VERSION, changeFrequency: "yearly", priority: 0.2 }
  ];
}
