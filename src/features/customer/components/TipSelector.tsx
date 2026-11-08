import type { Cart } from "@/domain/cart/Cart";
import { currency } from "@/lib/utils";

const TIP_PRESETS = [0, 10, 15, 20];

type TipSelectorProps = {
  cart: Cart;
  tipPercent: number;
  onChange: (tipPercent: number) => void;
};

/** Propina (botones rápidos + barra) y el resumen de subtotal, propina y total. */
export function TipSelector({ cart, tipPercent, onChange }: TipSelectorProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-text">Propina</p>
          <p className="text-sm text-muted">Ajusta el porcentaje para este pedido</p>
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">{tipPercent}%</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TIP_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={[
              "inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold",
              tipPercent === preset ? "bg-brand text-white" : "border border-line text-text"
            ].join(" ")}
          >
            {preset}%
          </button>
        ))}
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={tipPercent}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-[rgb(var(--brand))]"
      />

      <div className="mt-4 space-y-2 text-sm text-text">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{currency(cart.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Propina</span>
          <span>{currency(cart.tipFor(tipPercent))}</span>
        </div>
        <div className="flex items-center justify-between font-semibold">
          <span>Total</span>
          <span>{currency(cart.totalWithTip(tipPercent))}</span>
        </div>
      </div>
    </div>
  );
}
