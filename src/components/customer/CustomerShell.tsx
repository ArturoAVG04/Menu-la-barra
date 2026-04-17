"use client";

import { useEffect, useMemo, useState } from "react";
import { MoonStar, Search, ShoppingBag, SunMedium } from "lucide-react";

import { MenuCard } from "@/components/customer/MenuCard";
import { useAppState } from "@/components/providers/AppProviders";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import { createOrder } from "@/lib/services/menu";
import { currency } from "@/lib/utils";
import type { Product } from "@/types";

export function CustomerShell() {
  const { activeBranch, cart, addToCart, clearCart } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const { categories, products } = useRealtimeMenu(activeBranch?.id);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    setSelectedProduct(null);
  }, [activeBranch?.id]);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();
    return products.filter(
      (product) =>
        product.available &&
        (product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term))
    );
  }, [products, search]);

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  async function submitOrder() {
    if (!activeBranch || !cart.length || !customerName) return;
    await createOrder(activeBranch.id, cart, customerName);
    clearCart();
    setCustomerName("");
  }

  if (!activeBranch) {
    return (
      <div className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
        Selecciona una sucursal para cargar el menu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-shell border border-line bg-panel p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand">Menu en vivo</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">{activeBranch.name}</h1>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-line bg-surface p-3 text-text"
            aria-label="Cambiar tema"
          >
            {theme === "light" ? <MoonStar size={18} /> : <SunMedium size={18} />}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar pasta, burgers o bebidas"
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
        </div>
      </header>

      <nav className="flex gap-3 overflow-x-auto pb-1">
        {categories.map((category) => (
          <a
            key={category.id}
            href={`#category-${category.id}`}
            className="whitespace-nowrap rounded-full border border-line bg-panel px-4 py-2 text-sm text-text"
          >
            {category.name}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {categories.map((category) => {
          const sectionProducts = filteredProducts.filter(
            (product) => product.categoryId === category.id
          );

          if (!sectionProducts.length) return null;

          return (
            <section key={category.id} id={`category-${category.id}`} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-text">{category.name}</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sectionProducts.map((product) => (
                  <MenuCard key={product.id} product={product} onSelect={setSelectedProduct} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-4 md:items-center md:justify-center">
          <div className="w-full max-w-lg rounded-shell bg-panel p-5">
            <h3 className="text-xl font-semibold text-text">{selectedProduct.name}</h3>
            <p className="mt-2 text-sm text-muted">{selectedProduct.description}</p>

            <div className="mt-4 space-y-4">
              {selectedProduct.modifiers.map((modifier) => (
                <div key={modifier.id} className="rounded-card border border-line p-4">
                  <p className="font-medium text-text">{modifier.name}</p>
                  <div className="mt-3 space-y-2">
                    {modifier.options.map((option) => (
                      <label key={option.id} className="flex items-center justify-between text-sm text-text">
                        <span>{option.name}</span>
                        <span>{option.priceDelta ? `+${currency(option.priceDelta)}` : "Incluido"}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex-1 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCart({
                    id: `${selectedProduct.id}-${Date.now()}`,
                    productId: selectedProduct.id,
                    name: selectedProduct.name,
                    quantity: 1,
                    unitPrice: selectedProduct.salePrice || selectedProduct.price,
                    selectedModifiers: selectedProduct.modifiers.map((modifier) => ({
                      modifierId: modifier.id,
                      optionIds: modifier.options.slice(0, 1).map((option) => option.id)
                    }))
                  });
                  setSelectedProduct(null);
                }}
                className="flex-1 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white"
              >
                Agregar {currency(selectedProduct.salePrice || selectedProduct.price)}
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="sticky bottom-4 z-40 rounded-shell border border-line bg-panel p-4 shadow-glow">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand/10 p-3 text-brand">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="font-semibold text-text">Carrito flotante</p>
              <p className="text-sm text-muted">
                {cart.length} items · {currency(total)}
              </p>
            </div>
          </div>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Nombre"
            className="w-28 rounded-full border border-line bg-surface px-3 py-2 text-sm text-text outline-none md:w-40"
          />
          <button
            type="button"
            onClick={() => void submitOrder()}
            disabled={!cart.length || !customerName}
            className="rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          >
            Enviar pedido
          </button>
        </div>
      </aside>
    </div>
  );
}
