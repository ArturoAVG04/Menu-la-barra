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
            ? `linear-gradient(180deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.7)), url(${branch.menuCoverImageUrl})`
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
                  <h2 className="mt-1 text-2xl font-semibold text-white md:text-3xl">{branch.name}</h2>
                  {branch.address && <p className="mt-2 max-w-2xl text-base text-white">{branch.address}</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide",
                    isOpen ? "bg-green-700 text-white" : "bg-red-700 text-white"
                  ].join(" ")}
                >
                  {isOpen ? "Sucursal abierta" : "Sucursal cerrada"}
                </span>
                {branch.isPrimary && (
                  <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-white">
                    Principal
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button
                type="button"
                onClick={onChangeBranch}
                className="inline-flex min-h-11 items-center justify-center rounded-card border border-white/20 bg-white/10 px-4 py-3 text-base font-semibold text-white backdrop-blur"
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

          <label className="block cursor-text rounded-card border border-white/30 bg-black/40 px-4 backdrop-blur">
            <span className="sr-only">Buscar en el menú</span>
            <div className="flex items-center gap-3">
              <Search size={18} className="text-white" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                type="search"
                enterKeyHint="search"
                placeholder="¿Qué se te antoja hoy?"
                className="min-h-12 w-full bg-transparent py-3 text-base text-white outline-none placeholder:text-white/80"
              />
            </div>
          </label>
        </div>
      </div>
    </header>
  );
}
