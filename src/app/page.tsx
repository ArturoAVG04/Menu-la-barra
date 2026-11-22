import type { Metadata } from "next";

import { MenuIntro } from "@/components/seo/MenuIntro";
import { CustomerApp } from "@/features/customer/CustomerApp";
import { MENU_URL } from "@/lib/hosts";
import { buildRestaurantJsonLd, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { getPublicMenu } from "@/lib/server/publicMenu";

// ISR: el menú del servidor (SEO) se regenera cada hora; el cliente sigue en tiempo real.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION, url: MENU_URL, siteName: "La Barra", locale: "es_MX", type: "website" },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION }
};

export default async function HomePage() {
  const sections = await getPublicMenu();
  const jsonLd = JSON.stringify(buildRestaurantJsonLd()).replace(/</g, "\\u003c");
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 py-4 sm:px-4 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <CustomerApp />
      <MenuIntro sections={sections} />
    </main>
  );
}
