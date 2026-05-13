import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Barra Menu",
  description: "Menu interactivo y carrito para clientes de La Barra",
  manifest: "/manifest-customer.json",
  appleWebApp: {
    capable: true,
    title: "La Barra Menu",
    statusBarStyle: "black-translucent"
  }
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
