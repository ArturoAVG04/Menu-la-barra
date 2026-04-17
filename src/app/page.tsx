"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { BranchSelector } from "@/components/customer/BranchSelector";
import { MenuCard } from "@/components/customer/MenuCard";
import { useAppState } from "@/components/providers/AppProviders";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import { subscribeBranches } from "@/lib/services/menu";
import type { Branch, Product } from "@/types";

function getPreviewBranch(branches: Branch[], activeBranch: Branch | null) {
  if (activeBranch) return activeBranch;
  return branches.find((branch) => branch.isPrimary) ?? branches[0] ?? null;
}

export default function HomePage() {
  const { branches, activeBranch, setBranch, setBranches } = useAppState();

  useEffect(() => {
    return subscribeBranches(setBranches);
  }, [setBranches]);

  const previewBranch = useMemo(
    () => getPreviewBranch(branches, activeBranch),
    [activeBranch, branches]
  );
  const { categories, products } = useRealtimeMenu(previewBranch?.id);

  const featuredProducts = useMemo(() => {
    return products
      .filter((product) => product.available)
      .slice(0, 4);
  }, [products]);

  function handlePreviewSelect(product: Product) {
    if (previewBranch) {
      setBranch(previewBranch);
    }
    void product;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-8 md:px-6">
      <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-shell border border-line bg-panel p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-brand">La Barra</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-text">
            Menú digital listo para ordenar desde la sucursal principal.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            Los clientes entran directo al menú. Si quieren cambiar de sede, pueden hacerlo desde la
            sección de sucursales sin perder claridad.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">
              Ver menú
            </Link>
          </div>

          {previewBranch && (
            <div className="mt-8 rounded-card border border-line bg-surface p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-brand">Vista previa activa</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-text">{previewBranch.name}</h2>
                {previewBranch.isPrimary && (
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    Sucursal principal
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">{previewBranch.address}</p>
              <p className="mt-1 text-sm text-muted">{previewBranch.whatsapp || "WhatsApp no configurado"}</p>
            </div>
          )}
        </div>

        <BranchSelector
          branches={branches}
          selectedBranchId={previewBranch?.id}
          onSelect={setBranch}
        />
      </section>

      <section className="space-y-5 rounded-shell border border-line bg-panel p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand">Menú</p>
            <h2 className="mt-2 text-3xl font-semibold text-text">
              {previewBranch ? `Lo que verá el cliente en ${previewBranch.name}` : "Vista previa del menú"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {categories.length
                ? `${categories.length} categorías disponibles en esta sucursal.`
                : "Aún no hay categorías cargadas en la sucursal seleccionada."}
            </p>
          </div>

          <Link href="/menu" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-text">
            Abrir experiencia completa
          </Link>
        </div>

        {featuredProducts.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {featuredProducts.map((product) => (
              <MenuCard key={product.id} product={product} onSelect={handlePreviewSelect} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-line bg-surface p-6 text-sm text-muted">
            Cuando cargues categorías y productos en el admin, aquí se mostrará la vista previa del menú.
          </div>
        )}
      </section>
    </main>
  );
}
