import { ClipboardList, LayoutGrid, Palette, Settings2, Store } from "lucide-react";

export type AdminSection = "overview" | "business" | "menu" | "themes" | "orders";

export const NAV_ITEMS: { id: AdminSection; label: string; icon: typeof Store }[] = [
  { id: "orders", label: "Pedidos", icon: ClipboardList },
  { id: "overview", label: "General", icon: Settings2 },
  { id: "business", label: "Datos", icon: Store },
  { id: "menu", label: "Menú", icon: LayoutGrid },
  { id: "themes", label: "Temas", icon: Palette }
];
