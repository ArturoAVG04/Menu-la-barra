import type { Metadata } from "next";

import { PWARegistration } from "@/components/pwa/PWARegistration";
import { AppProviders } from "@/components/providers/AppProviders";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "La Barra",
  description: "Descubre todos los productos que la barra tiene para ti",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
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
