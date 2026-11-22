"use client";

import { BranchPickerModal } from "@/features/customer/components/BranchPickerModal";
import { CartDrawer } from "@/features/customer/components/CartDrawer";
import { CheckoutForm } from "@/features/customer/components/CheckoutForm";
import { OrderSuccessModal } from "@/features/customer/components/OrderSuccessModal";
import { ProductEditorModal } from "@/features/customer/components/ProductEditorModal";
import { TrackingPanel } from "@/features/customer/components/TrackingPanel";
import type { BranchLinks } from "@/features/customer/hooks/useBranchLinks";
import type { Checkout } from "@/features/customer/hooks/useCheckout";
import type { CustomerCart } from "@/features/customer/hooks/useCustomerCart";
import type { CustomerDetails } from "@/features/customer/hooks/useCustomerDetails";
import type { CustomerPanels } from "@/features/customer/hooks/useCustomerPanels";
import type { ProductEditor } from "@/features/customer/hooks/useProductEditor";
import type { Branch } from "@/types";

type CustomerOverlaysProps = {
  branch: Branch;
  branches: readonly Branch[];
  onSelectBranch: (branch: Branch) => void;
  now: Date;
  branchOpen: boolean;
  tipPercent: number;
  onTipChange: (tipPercent: number) => void;
  countdownLabel: string | null;
  cartState: CustomerCart;
  details: CustomerDetails;
  panels: CustomerPanels;
  editor: ProductEditor;
  checkout: Checkout;
  links: BranchLinks;
};

/** Todos los modales y paneles del menú (solo pintan lo que dicen los hooks). */
export function CustomerOverlays(props: CustomerOverlaysProps) {
  const { cartState, panels, editor, checkout, links } = props;
  const { tracking, push, submission } = checkout;

  return (
    <>
      {panels.branchPickerOpen && (
        <BranchPickerModal
          branches={props.branches}
          activeBranchId={props.branch.id}
          now={props.now}
          onSelect={(branch) => {
            props.onSelectBranch(branch);
            panels.closeBranchPicker();
          }}
          onClose={panels.closeBranchPicker}
        />
      )}

      {panels.cartOpen && (
        <CartDrawer
          cart={cartState.cart}
          unavailableIds={cartState.unavailableIds}
          onClose={panels.closeCart}
          onRemove={cartState.remove}
          onQuantityChange={cartState.setQuantity}
          onEdit={(lineId) => editor.openForCartItem(lineId)}
        >
          <CheckoutForm
            cart={cartState.cart}
            details={props.details}
            tipPercent={props.tipPercent}
            onTipChange={props.onTipChange}
            branchOpen={props.branchOpen}
            submission={submission}
            whatsappTicketHref={links.cartTicketHref}
            showPushHint={push.willAsk}
            onClearCart={cartState.clear}
          />
        </CartDrawer>
      )}

      {tracking.trackingOpen && tracking.activeOrder && (
        <TrackingPanel
          order={tracking.activeOrder}
          countdownLabel={props.countdownLabel}
          whatsappTicketHref={links.activeOrderTicketHref}
          showNotificationPrompt={push.permission !== "granted"}
          showIOSHint={push.isIOS && !push.isStandalone}
          onEnableNotifications={push.enable}
          onClose={tracking.closeTracking}
          onDismissRejected={tracking.clear}
          onRetryRejected={checkout.retryRejectedOrder}
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
    </>
  );
}
