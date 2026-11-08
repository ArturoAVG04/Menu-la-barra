import { CheckCircle2, Clock3, PackageCheck, ShoppingBag, type LucideIcon } from "lucide-react";

import { OrderLifecycle, type TrackingStep } from "@/domain/order/OrderStatus";
import type { OrderStatus } from "@/types";

const STEPS: { key: TrackingStep; label: string; icon: LucideIcon }[] = [
  { key: "new", label: "Recibido", icon: ShoppingBag },
  { key: "preparing", label: "En cocina", icon: Clock3 },
  { key: "ready", label: "Listo", icon: PackageCheck },
  { key: "delivered", label: "Entregado", icon: CheckCircle2 }
];

/** Los 4 pasos del pedido; se resaltan los que ya se alcanzaron. */
export function TrackingSteps({ status }: { status: OrderStatus }) {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
      {STEPS.map(({ key, label, icon: Icon }) => {
        const isActive = OrderLifecycle.hasReachedStep(status, key);

        return (
          <div
            key={key}
            className={["rounded-card border p-3 md:p-4", isActive ? "border-brand bg-brand/10" : "border-line bg-surface"].join(" ")}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={[
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  isActive ? "bg-brand text-white" : "bg-panel text-muted"
                ].join(" ")}
              >
                <Icon size={16} />
              </div>
              <p className="text-xs md:text-sm font-semibold text-text">{label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
