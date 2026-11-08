"use client";

import { Bell, BellRing, Menu, MoonStar, SunMedium } from "lucide-react";

import { useTheme } from "@/components/providers/ThemeProvider";
import type { PushPermission } from "@/features/admin/hooks/useAdminPush";
import { MENU_URL } from "@/lib/hosts";

type AdminHeaderProps = {
  title: string;
  pushPermission: PushPermission;
  onEnablePush: () => void;
  onOpenDrawer: () => void;
};

/** Encabezado fijo: menú móvil, botón de avisos, tema claro/oscuro y "Ver menú". */
export function AdminHeader({ title, pushPermission, onEnablePush, onOpenDrawer }: AdminHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const pushActive = pushPermission === "granted";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-panel/95 px-4 py-3 text-left backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-text xl:hidden"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-text">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {pushPermission !== "unsupported" && (
          <button
            type="button"
            onClick={onEnablePush}
            title={
              pushActive
                ? "Avisos de pedidos activos en este dispositivo (toca para volver a registrar)"
                : "Activar avisos de pedidos nuevos"
            }
            className={[
              "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold",
              pushActive ? "border border-line bg-surface text-text" : "bg-brand text-surface"
            ].join(" ")}
          >
            {pushActive ? <BellRing size={16} /> : <Bell size={16} />}
            <span className="hidden sm:inline">{pushActive ? "Avisos activos" : "Activar avisos"}</span>
          </button>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold text-text"
        >
          {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
          <span className="hidden sm:inline">{theme === "dark" ? "Claro" : "Oscuro"}</span>
        </button>
        <a
          href={MENU_URL}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold text-text"
        >
          Ver menú
        </a>
      </div>
    </header>
  );
}
