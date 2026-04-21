"use client";

import Link from "next/link";
import { useMemo } from "react";

import { MenuCard } from "@/components/customer/MenuCard";
import { useAppState } from "@/components/providers/AppProviders";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import type { Branch, Product } from "@/types";

function getPreviewBranch(branches: Branch[], activeBranch: Branch | null) {
  if (activeBranch) return activeBranch;
  return branches.find((branch) => branch.isPrimary) ?? branches[0] ?? null;
}

export default function HomePage() {
  const { branches, activeBranch, setBranch } = useAppState();

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
      <section className="space-y-5 rounded-shell border border-line bg-panel p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text">
              {previewBranch ? previewBranch.name : "Nuestros productos"}
            </h2>
            {previewBranch?.address && (
              <p className="mt-1 text-sm text-muted">{previewBranch.address}</p>
            )}
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
