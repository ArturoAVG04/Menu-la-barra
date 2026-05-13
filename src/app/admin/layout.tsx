import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Barra Admin",
  description: "Panel administrativo de La Barra",
  manifest: "/manifest-admin.json",
  appleWebApp: {
    capable: true,
    title: "La Barra Admin",
    statusBarStyle: "black-translucent"
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
