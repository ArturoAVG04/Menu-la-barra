import type { Metadata } from "next";

import { PWARegistration } from "@/components/pwa/PWARegistration";
import { AppProviders } from "@/components/providers/AppProviders";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MENU_URL } from "@/lib/hosts";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(MENU_URL),
  title: { default: SITE_TITLE, template: "%s | La Barra" },
  description: SITE_DESCRIPTION,
  manifest: "/manifest-customer.json",
  icons: {
    icon: [{ url: "/icons/icon-192.png", type: "image/png" }, { url: "/icon.svg" }],
    apple: "/icons/icon-192.png"
  },
  openGraph: { siteName: "La Barra", locale: "es_MX", type: "website" },
  twitter: { card: "summary_large_image" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AppProviders>
            <PWARegistration />
            {children}
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
