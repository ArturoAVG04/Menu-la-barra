import type { MetadataRoute } from "next";

import { MENU_URL } from "@/lib/hosts";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/api/", "/ir/"] },
    sitemap: `${MENU_URL}/sitemap.xml`,
    host: MENU_URL
  };
}
