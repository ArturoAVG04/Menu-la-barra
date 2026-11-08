import type { Metadata } from "next";

import { PWARegistration } from "@/components/pwa/PWARegistration";
import { AppProviders } from "@/components/providers/AppProviders";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://menulabarra.vercel.app"),
  title: "La Barra",
  description: "Descubre todos los productos que la barra tiene para ti",
  manifest: "/manifest-customer.json",
  icons: {
    icon: [{ url: "/icons/icon-192.png", type: "image/png" }, { url: "/icon.svg" }],
    apple: "/icons/icon-192.png"
  },
  openGraph: {
    title: "La Barra",
    description: "Descubre todos los productos que la barra tiene para ti",
    url: "https://menulabarra.vercel.app",
    siteName: "La Barra",
    images: [{ url: "/icon.svg" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
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
