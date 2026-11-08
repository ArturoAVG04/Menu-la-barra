"use client";

import { useEffect, useMemo, useState } from "react";

import { useAppState } from "@/components/providers/AppProviders";
import { Cart } from "@/domain/cart/Cart";
import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { BranchHero } from "@/features/customer/components/BranchHero";
import { BranchPickerModal } from "@/features/customer/components/BranchPickerModal";
import { CartDrawer } from "@/features/customer/components/CartDrawer";
import { CategoryTabs } from "@/features/customer/components/CategoryTabs";
import { CheckoutForm } from "@/features/customer/components/CheckoutForm";
import { DetailsPromptModal } from "@/features/customer/components/DetailsPromptModal";
import { FloatingBar } from "@/features/customer/components/FloatingBar";
import { NoticeToast } from "@/features/customer/components/NoticeToast";
import { OrderSuccessModal } from "@/features/customer/components/OrderSuccessModal";
import { ProductEditorModal } from "@/features/customer/components/ProductEditorModal";
import { ProductGrid } from "@/features/customer/components/ProductGrid";
import { TrackingPanel } from "@/features/customer/components/TrackingPanel";
import { useActiveOrder } from "@/features/customer/hooks/useActiveOrder";
import { useBranchLinks } from "@/features/customer/hooks/useBranchLinks";
import { useCart } from "@/features/customer/hooks/useCart";
import { useCustomerDetails } from "@/features/customer/hooks/useCustomerDetails";
import { useMenuCatalog } from "@/features/customer/hooks/useMenuCatalog";
import { useNotice } from "@/features/customer/hooks/useNotice";
import { useNow } from "@/features/customer/hooks/useNow";
import { useOrderSubmission } from "@/features/customer/hooks/useOrderSubmission";
import { useProductEditor } from "@/features/customer/hooks/useProductEditor";
import { usePushNotifications } from "@/features/customer/hooks/usePushNotifications";
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
  const cartState = useCart(branchId);
  const { cart } = cartState;
  const details = useCustomerDetails();
  const tracking = useActiveOrder(showNotice);
  const { activeOrder } = tracking;
  const push = usePushNotifications(
    tracking.orderRef && branchId
      ? { orderId: tracking.orderRef.id, branchId, trackingToken: tracking.orderRef.trackingToken }
      : null,
    showNotice
  );

  const [search, setSearch] = useState("");
  const [tipPercent, setTipPercent] = useState(10);
  const [cartOpen, setCartOpen] = useState(false);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);

  const now = useNow();
  const nowDate = useMemo(() => new Date(now), [now]);
  const branchOpen = useMemo(() => isBranchOpenAt(activeBranch, nowDate), [activeBranch, nowDate]);

  const editor = useProductEditor(catalog, cart, {
    onAdd: (item, productName) => {
      cartState.add(item);
      showNotice(`"${productName}" agregado al carrito`);
    },
    onReplace: cartState.replace
  });

  const submission = useOrderSubmission({
    branch: activeBranch,
    branchOpen,
    cart,
    catalog,
    details,
    tipPercent,
    onSubmitTap: push.askOnSubmit,
    onIncompleteLine: (lineId, message) => {
      setCartOpen(true);
      editor.openForCartItem(lineId, message);
    },
    onSuccess: (order, orderBranchId) => {
      cartState.clear();
      setCartOpen(false);
      editor.close();
      tracking.start(order.id, order.trackingToken);
      void push.linkTokenToOrder({ orderId: order.id, branchId: orderBranchId, trackingToken: order.trackingToken });
    },
    onError: () => setCartOpen(true)
  });

  useBodyScrollLock(
    cartOpen ||
      branchPickerOpen ||
      tracking.trackingOpen ||
      editor.isOpen ||
      submission.state === "success" ||
      submission.detailsPromptOpen
  );
  useScrollToTopOnChange([activeBranch?.id]);

  // Carrito vacío: se cierra el panel.
  useEffect(() => {
    if (cart.isEmpty) setCartOpen(false);
  }, [cart.isEmpty]);

  // Al cambiar de sucursal se cierran todos los paneles.
  useEffect(() => {
    editor.close();
    setCartOpen(false);
    setBranchPickerOpen(false);
    tracking.closeTracking();
  }, [activeBranch?.id]);

  const searchResults = useMemo(() => catalog.search(search), [catalog, search]);
  const sections = useMemo(() => catalog.sectionsFor(searchResults), [catalog, searchResults]);
  const countdownLabel = activeOrder ? OrderLifecycle.countdownLabel(activeOrder, now) : null;

  const links = useBranchLinks({ branch: activeBranch, cart, tipPercent, details, activeOrder });

  function openProduct(product: Product) {
    if (activeOrder && OrderLifecycle.blocksNewItems(activeOrder.status)) {
      showNotice("Ya tienes una orden en curso. Si necesitas cambios, manda mensaje por WhatsApp.");
      return;
    }
    setCartOpen(false);
    editor.openForProduct(product);
  }

  function retryRejectedOrder() {
    if (!activeOrder) return;
    cartState.restore(Cart.reorder(activeOrder.items, () => crypto.randomUUID()));
    details.setOrderNote(activeOrder.orderNote ?? "");
    tracking.clear();
    setCartOpen(true);
  }

  if (!activeBranch) {
    return (
      <div className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
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
        onChangeBranch={() => setBranchPickerOpen(true)}
      />
      <CategoryTabs categories={catalog.categoriesWithProducts} />
      <ProductGrid sections={sections} isEmpty={!searchResults.length} onSelect={openProduct} />

      <FloatingBar
        whatsappHref={links.whatsappHref}
        instagramHref={links.instagramHref}
        activeOrder={activeOrder}
        countdownLabel={countdownLabel}
        cart={cart}
        onOpenTracking={tracking.openTracking}
        onOpenCart={() => setCartOpen(true)}
      />

      {branchPickerOpen && (
        <BranchPickerModal
          branches={branches}
          activeBranchId={activeBranch.id}
          now={nowDate}
          onSelect={(branch) => {
            setBranch(branch);
            setBranchPickerOpen(false);
          }}
          onClose={() => setBranchPickerOpen(false)}
        />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={cartState.remove}
          onQuantityChange={cartState.setQuantity}
          onEdit={(lineId) => {
            setCartOpen(true);
            editor.openForCartItem(lineId);
          }}
        >
          <CheckoutForm
            cart={cart}
            details={details}
            tipPercent={tipPercent}
            onTipChange={setTipPercent}
            branchOpen={branchOpen}
            submission={submission}
            whatsappTicketHref={links.cartTicketHref}
            onClearCart={cartState.clear}
          />
        </CartDrawer>
      )}

      {tracking.trackingOpen && activeOrder && (
        <TrackingPanel
          order={activeOrder}
          countdownLabel={countdownLabel}
          whatsappTicketHref={links.activeOrderTicketHref}
          showNotificationPrompt={push.permission !== "granted"}
          showIOSHint={push.isIOS && !push.isStandalone}
          onEnableNotifications={push.enable}
          onClose={tracking.closeTracking}
          onDismissRejected={tracking.clear}
          onRetryRejected={retryRejectedOrder}
        />
      )}

      {editor.selection && (
        <ProductEditorModal
          selection={editor.selection}
          isEditingCartItem={editor.isEditingCartItem}
          error={editor.error}
          onToggleOption={editor.toggleOption}
          onChangeQuantity={editor.changeQuantity}
          onSave={editor.save}
          onClose={editor.close}
        />
      )}

      {submission.state === "success" && (
        <OrderSuccessModal
          message={submission.message}
          whatsappHref={submission.whatsappHref}
          onContinue={() => {
            submission.reset();
            tracking.closeTracking();
          }}
        />
      )}

      {submission.detailsPromptOpen && (
        <DetailsPromptModal
          onWriteDetails={submission.dismissDetailsPrompt}
          onSubmitWithoutDetails={submission.submitWithoutDetails}
        />
      )}
    </div>
  );
}
