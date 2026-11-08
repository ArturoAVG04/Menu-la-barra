"use client";

import { ChevronsLeft, ChevronsRight, LogOut, ShieldCheck } from "lucide-react";

import { NAV_ITEMS, type AdminSection } from "@/features/admin/layout/navigation";
import type { Branch } from "@/types";

type AdminSidebarProps = {
  collapsed: boolean;
  branches: Branch[];
  adminBranchId: string;
  section: AdminSection;
  onToggleCollapsed: () => void;
  onSelectBranch: (branchId: string) => void;
  onSelectSection: (section: AdminSection) => void;
  onLogout: () => void;
};

/** Barra lateral: sucursal activa, navegación y cerrar sesión. Se usa fija (escritorio) y en el drawer (móvil). */
export function AdminSidebar({
  collapsed,
  branches,
  adminBranchId,
  section,
  onToggleCollapsed,
  onSelectBranch,
  onSelectSection,
  onLogout
}: AdminSidebarProps) {
  return (
    <div
      className={[
        "flex h-full flex-col transition-all duration-300",
        collapsed ? "items-center px-3 py-5" : "p-6"
      ].join(" ")}
    >
      <div className={collapsed ? "w-full border-b border-line pb-4" : "border-b border-line pb-4"}>
        <div className={collapsed ? "flex justify-center" : "flex items-center justify-between gap-3"}>
          {!collapsed && (
            <div className="space-y-3 text-left">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-brand">La Barra</p>
                <h1 className="mt-2 text-xl font-semibold text-text">Admin</h1>
              </div>
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-success/15 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-success">
                <ShieldCheck size={16} />
                Sesión Activa
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-text transition hover:border-brand/40 hover:text-brand xl:inline-flex"
            aria-label={collapsed ? "Expandir barra lateral" : "Ocultar barra lateral"}
            title={collapsed ? "Expandir" : "Ocultar"}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto py-6 scrollbar-none">
        {!collapsed && (
          <div className="mb-6 space-y-2 text-left">
            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted">Sucursal activa</span>
            <select
              value={adminBranchId}
              onChange={(event) => onSelectBranch(event.target.value)}
              className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 text-left text-sm text-text outline-none transition focus:border-brand"
            >
              <option value="">Selecciona</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className={[
          "transition-all duration-300",
          !collapsed
            ? "space-y-1 rounded-card border border-line bg-surface/40 p-1.5 text-left shadow-inner"
            : "flex w-full flex-col items-center gap-3"
        ].join(" ")}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={[
                  "inline-flex min-h-[44px] w-full items-center justify-start gap-3 rounded-card px-4 py-3 text-left text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-brand text-white shadow-glow"
                    : "border border-transparent text-text hover:border-line hover:bg-surface/80",
                  collapsed ? "h-12 w-12 items-center justify-center rounded-full px-0 py-0" : ""
                ].join(" ")}
                title={item.label}
              >
                <Icon size={18} />
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={collapsed ? "mt-auto w-full border-t border-line pt-4" : "mt-auto border-t border-line pt-4"}>
        <div className={collapsed ? "flex flex-col items-center gap-4" : "flex flex-col gap-3"}>
          <button
            type="button"
            onClick={onLogout}
            className={[
              "inline-flex min-h-[44px] items-center justify-center rounded-full border border-line text-sm font-semibold text-text transition hover:bg-surface",
              collapsed ? "h-12 w-12 rounded-full px-0" : "w-full px-4 py-3"
            ].join(" ")}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            {collapsed ? <LogOut size={18} /> : "Cerrar Sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
