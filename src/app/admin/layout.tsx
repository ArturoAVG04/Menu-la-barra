import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Barra Admin",
  description: "Panel administrativo de La Barra",
  manifest: "/manifest-admin.json",
  icons: {
    icon: "/icons/admin/icon-192.png",
    apple: "/icons/admin/icon-192.png"
  },
  appleWebApp: {
    capable: true,
    title: "La Barra Admin",
    statusBarStyle: "black-translucent"
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
