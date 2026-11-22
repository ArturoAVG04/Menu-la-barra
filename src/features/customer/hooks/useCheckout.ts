"use client";

import { Cart } from "@/domain/cart/Cart";
import type { MenuCatalog } from "@/domain/menu/MenuCatalog";
import { useActiveOrder } from "@/features/customer/hooks/useActiveOrder";
import type { CustomerCart } from "@/features/customer/hooks/useCustomerCart";
import type { CustomerDetails } from "@/features/customer/hooks/useCustomerDetails";
import type { CustomerPanels } from "@/features/customer/hooks/useCustomerPanels";
import { useOrderSubmission } from "@/features/customer/hooks/useOrderSubmission";
import type { ProductEditor } from "@/features/customer/hooks/useProductEditor";
import { usePushNotifications } from "@/features/customer/hooks/usePushNotifications";
import type { Branch } from "@/types";

type CheckoutInput = {
  branch: Branch | null;
  branchOpen: boolean;
  catalog: MenuCatalog;
  cartState: CustomerCart;
  details: CustomerDetails;
  tipPercent: number;
  panels: CustomerPanels;
  editor: ProductEditor;
  showNotice: (message: string) => void;
};

/** Envío del pedido + seguimiento + notificaciones, conectados entre sí. */
export function useCheckout(input: CheckoutInput) {
  const { branch, cartState, details, panels, editor } = input;
  const branchId = branch?.id ?? null;
  const tracking = useActiveOrder(input.showNotice);
  const push = usePushNotifications(
    tracking.orderRef && branchId
      ? { orderId: tracking.orderRef.id, branchId, trackingToken: tracking.orderRef.trackingToken }
      : null,
    input.showNotice
  );

  const submission = useOrderSubmission({
    branch,
    branchOpen: input.branchOpen,
    cart: cartState.cart,
    unavailableIds: cartState.unavailableIds,
    catalog: input.catalog,
    details,
    tipPercent: input.tipPercent,
    hasOrderInProgress: tracking.hasOrderInProgress,
    onSubmitTap: push.askOnSubmit,
    onIncompleteLine: (lineId, message) => {
      panels.openCart();
      editor.openForCartItem(lineId, message);
    },
    onSuccess: (order, orderBranchId) => {
      cartState.clear();
      panels.closeCart();
      editor.close();
      tracking.start(order.id, order.trackingToken);
      void push.linkTokenToOrder({ orderId: order.id, branchId: orderBranchId, trackingToken: order.trackingToken });
    },
    onError: panels.openCart
  });

  /** "Volver a pedir" un pedido rechazado. */
  function retryRejectedOrder() {
    const order = tracking.activeOrder;
    if (!order) return;
    cartState.restore(Cart.reorder(order.items, () => crypto.randomUUID()));
    details.setOrderNote(order.orderNote ?? "");
    tracking.clear();
    panels.openCart();
  }

  return { tracking, push, submission, retryRejectedOrder };
}

export type Checkout = ReturnType<typeof useCheckout>;
