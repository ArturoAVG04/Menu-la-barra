"use client";

import { useState } from "react";

import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { useBrandingSubscription } from "@/features/admin/hooks/useBrandingSubscription";
import { useCategoryEditor } from "@/features/admin/hooks/useCategoryEditor";
import { useModifierEditor } from "@/features/admin/hooks/useModifierEditor";
import { useProductCatalog } from "@/features/admin/hooks/useProductCatalog";
import { useProductEditor } from "@/features/admin/hooks/useProductEditor";
import { CategoriesTab } from "@/features/admin/menu/categories/CategoriesTab";
import { ModifiersTab } from "@/features/admin/menu/modifiers/ModifiersTab";
import { ProductsTab } from "@/features/admin/menu/products/ProductsTab";
import { useScrollToTopOnChange } from "@/lib/hooks/useScrollToTopOnChange";
import type { Branch } from "@/types";

type MenuTab = "products" | "categories" | "modifiers";

const TABS: { id: MenuTab; label: string }[] = [
  { id: "products", label: "PRODUCTOS" },
  { id: "categories", label: "CATEGORÍAS" },
  { id: "modifiers", label: "PERSONALIZACIONES" }
];

/**
 * Sección "Menú". Los editores viven aquí (y no en cada pestaña) para que lo escrito
 * se conserve al cambiar de pestaña, igual que antes.
 */
export function MenuPanel({ branch, allBranches, notify }: { branch: Branch | null; allBranches: Branch[]; notify: Notify }) {
  const [menuTab, setMenuTab] = useState<MenuTab>("products");
  const catalog = useProductCatalog(branch, notify);
  const productEditor = useProductEditor(branch?.id);
  const categoryEditor = useCategoryEditor(branch?.id);
  const modifierEditor = useModifierEditor();

  useBrandingSubscription(branch?.id);
  useScrollToTopOnChange([
    menuTab,
    productEditor.isOpen,
    categoryEditor.isOpen,
    modifierEditor.isOpen,
    productEditor.editingId
  ]);

  function selectTab(tab: MenuTab) {
    setMenuTab(tab);
    productEditor.hide();
    categoryEditor.hide();
    modifierEditor.hide();
  }

  if (!branch) {
    return (
      <section className="rounded-shell border border-line bg-panel p-6 text-center text-sm text-muted">
        Selecciona una sucursal.
      </section>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap justify-start gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={[
              "inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition",
              menuTab === tab.id ? "bg-brand text-white" : "border border-line text-text"
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {menuTab === "products" && (
        <ProductsTab
          branch={branch}
          allBranches={allBranches}
          catalog={catalog}
          editor={productEditor}
          notify={notify}
          onCreateModifier={() => setMenuTab("modifiers")}
        />
      )}

      {menuTab === "categories" && (
        <CategoriesTab catalog={catalog} editor={categoryEditor} productEditor={productEditor} />
      )}

      {menuTab === "modifiers" && <ModifiersTab catalog={catalog} editor={modifierEditor} />}
    </div>
  );
}
