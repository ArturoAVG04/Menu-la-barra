import { describeModifiers } from "@/features/customer/format";
import { currency } from "@/lib/utils";
import type { PublicTrackedOrder } from "@/types";

/** "Resumen de lo que pediste" dentro del seguimiento. */
export function TrackedOrderSummary({ order }: { order: PublicTrackedOrder }) {
  if (!order.items || order.items.length === 0) return null;

  return (
    <div className="rounded-card border border-line bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-line pb-2">
        <p className="font-semibold text-sm text-text">Resumen de lo que pediste</p>
        <span className="text-xs text-muted">{order.items.reduce((sum, item) => sum + item.quantity, 0)} ítems</span>
      </div>
      <div className="divide-y divide-line/40">
        {order.items.map((item, index) => (
          <div key={item.id || index} className="py-2 flex items-start justify-between text-sm gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-text">
                {item.quantity}x {item.name}
              </p>
              {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                <p className="text-xs text-muted mt-0.5">{describeModifiers(item.selectedModifiers)}</p>
              )}
            </div>
            <span className="font-semibold text-brand text-xs shrink-0">{currency(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-line pt-2 text-xs space-y-1 text-muted">
        {typeof order.subtotal === "number" && (
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{currency(order.subtotal)}</span>
          </div>
        )}
        {typeof order.tipAmount === "number" && order.tipAmount > 0 && (
          <div className="flex justify-between">
            <span>Propina</span>
            <span>{currency(order.tipAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm text-text pt-1.5 border-t border-line/40">
          <span>Total</span>
          <span className="text-brand">{currency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
