"use client";

import { useMemo, useState } from "react";

import { useAppState } from "@/components/providers/AppProviders";
import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { CustomerOverlays } from "@/features/customer/CustomerOverlays";
import { BranchHero } from "@/features/customer/components/BranchHero";
import { CategoryTabs } from "@/features/customer/components/CategoryTabs";
import { FloatingBar } from "@/features/customer/components/FloatingBar";
import { LegalFooter } from "@/features/customer/components/LegalFooter";
import { NoticeToast } from "@/features/customer/components/NoticeToast";
import { ProductGrid } from "@/features/customer/components/ProductGrid";
import { useBranchLinks } from "@/features/customer/hooks/useBranchLinks";
import { useCheckout } from "@/features/customer/hooks/useCheckout";
import { useCustomerCart } from "@/features/customer/hooks/useCustomerCart";
import { useCustomerDetails } from "@/features/customer/hooks/useCustomerDetails";
import { useCustomerPanels } from "@/features/customer/hooks/useCustomerPanels";
import { useMenuCatalog } from "@/features/customer/hooks/useMenuCatalog";
import { useNotice } from "@/features/customer/hooks/useNotice";
import { useNow } from "@/features/customer/hooks/useNow";
import { useProductEditor } from "@/features/customer/hooks/useProductEditor";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { useScrollToTopOnChange } from "@/lib/hooks/useScrollToTopOnChange";
import { isBranchOpenAt } from "@/lib/branchHours";
import type { Product } from "@/types";

/**
 * Contenedor del menú del cliente: conecta los hooks (estado y reglas) con los
 * componentes (que solo pintan). Aquí no se calculan precios ni estados.
 */
export function CustomerApp() {
  const { activeBranch, branches, branding, setBranch } = useAppState();
  const branchId = activeBranch?.id ?? null;
  const catalog = useMenuCatalog(activeBranch?.id);
  const { notice, showNotice } = useNotice();
  const cartState = useCustomerCart(branchId, catalog);
  const { cart } = cartState;
  const details = useCustomerDetails();
  const [search, setSearch] = useState("");
  const [tipPercent, setTipPercent] = useState(0); // propina voluntaria: empieza en 0

  const now = useNow();
  const nowDate = useMemo(() => new Date(now), [now]);
  const branchOpen = useMemo(() => isBranchOpenAt(activeBranch, nowDate), [activeBranch, nowDate]);

  // Al cambiar de sucursal también se cierran el editor y el seguimiento.
  const panels = useCustomerPanels(branchId, cart.isEmpty, () => {
    editor.close();
    checkout.tracking.closeTracking();
  });
  const editor = useProductEditor(catalog, cart, {
    onAdd: (item, productName) => {
      cartState.add(item);
      showNotice(`"${productName}" agregado al carrito`);
    },
    onReplace: cartState.replace
  });
  const checkout = useCheckout({
    branch: activeBranch,
    branchOpen,
    catalog,
    cartState,
    details,
    tipPercent,
    panels,
    editor,
    showNotice
  });
  const { tracking, submission } = checkout;
  const { activeOrder } = tracking;

  useBodyScrollLock(
    panels.cartOpen || panels.branchPickerOpen || tracking.trackingOpen || editor.isOpen || submission.state === "success"
  );
  useScrollToTopOnChange([activeBranch?.id]);

  const searchResults = useMemo(() => catalog.search(search), [catalog, search]);
  const sections = useMemo(() => catalog.sectionsFor(searchResults), [catalog, searchResults]);
  const countdownLabel = activeOrder ? OrderLifecycle.countdownLabel(activeOrder, now) : null;
  const links = useBranchLinks({ branch: activeBranch, cart, tipPercent, details, activeOrder });

  function openProduct(product: Product) {
    if (activeOrder && OrderLifecycle.blocksNewItems(activeOrder.status)) {
      showNotice("Ya tienes una orden en curso. Si necesitas cambios, manda mensaje por WhatsApp.");
      return;
    }
    panels.closeCart();
    editor.openForProduct(product);
  }

  if (!activeBranch) {
    return (
      <div className="rounded-shell border border-dashed border-line bg-panel p-6 text-base text-muted">
        Selecciona una sucursal para cargar el menú.
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-40 md:pb-32">
      <NoticeToast message={notice} />

      <BranchHero
        branch={activeBranch}
        logoUrl={branding.logoUrl}
        isOpen={branchOpen}
        search={search}
        onSearchChange={setSearch}
        onChangeBranch={panels.openBranchPicker}
      />
      {!branchOpen && (
        <p role="status" className="rounded-card border border-danger/40 bg-danger/10 px-4 py-3 text-base font-semibold text-danger">
          Esta sucursal está cerrada ahora. Puedes ver el menú, pero no recibe pedidos por el momento.
        </p>
      )}
      <CategoryTabs categories={catalog.categoriesWithProducts} />
      <ProductGrid sections={sections} isEmpty={!searchResults.length} onSelect={openProduct} />
      <LegalFooter />

      <FloatingBar
        whatsappHref={links.whatsappHref}
        instagramHref={links.instagramHref}
        activeOrder={activeOrder}
        countdownLabel={countdownLabel}
        cart={cart}
        onOpenTracking={tracking.openTracking}
        onOpenCart={panels.openCart}
      />

      <CustomerOverlays
        branch={activeBranch}
        branches={branches}
        onSelectBranch={setBranch}
        now={nowDate}
        branchOpen={branchOpen}
        tipPercent={tipPercent}
        onTipChange={setTipPercent}
        countdownLabel={countdownLabel}
        cartState={cartState}
        details={details}
        panels={panels}
        editor={editor}
        checkout={checkout}
        links={links}
      />
    </div>
  );
}
