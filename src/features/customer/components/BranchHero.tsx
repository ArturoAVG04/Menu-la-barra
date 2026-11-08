"use client";

import Image from "next/image";
import { MoonStar, Search, Store, SunMedium } from "lucide-react";

import { useTheme } from "@/components/providers/ThemeProvider";
import type { Branch } from "@/types";

type BranchHeroProps = {
  branch: Branch;
  logoUrl?: string;
  isOpen: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onChangeBranch: () => void;
};

/** Portada de la sucursal: logo, nombre, estado, cambiar sucursal/tema y buscador. */
export function BranchHero({ branch, logoUrl, isOpen, search, onSearchChange, onChangeBranch }: BranchHeroProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="overflow-hidden rounded-shell border border-line bg-panel shadow-sm">
      <div
        className="relative p-5 md:p-6"
        style={{
          backgroundImage: branch.menuCoverImageUrl
            ? `linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.45)), url(${branch.menuCoverImageUrl})`
            : "linear-gradient(135deg, rgb(var(--brand) / 0.94), rgb(37 48 47 / 0.92))",
          backgroundSize: "cover",
          backgroundPosition: "center center"
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
                {logoUrl ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-card border border-white/20 bg-white/90 p-2 shadow-sm">
                    <Image src={logoUrl} alt="Logo" fill className="object-contain p-2" />
                  </div>
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-card bg-white/15 text-white backdrop-blur">
                    <Store size={20} />
                  </div>
                )}

                <div>
                  <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">{branch.name}</h1>
                  {branch.address && <p className="mt-2 max-w-2xl text-sm text-white/80">{branch.address}</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                    isOpen ? "bg-success/20 text-white" : "bg-danger/20 text-white"
                  ].join(" ")}
                >
                  {isOpen ? "Sucursal abierta" : "Sucursal cerrada"}
                </span>
                {branch.isPrimary && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Principal
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button
                type="button"
                onClick={onChangeBranch}
                className="inline-flex min-h-11 items-center justify-center rounded-card border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur"
              >
                Cambiar sucursal
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur"
                aria-label="Cambiar tema"
              >
                {theme === "light" ? <MoonStar size={18} /> : <SunMedium size={18} />}
              </button>
            </div>
          </div>

          <div className="rounded-card border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <Search size={18} className="text-white/70" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="¿Que se te antoja hoy?"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
