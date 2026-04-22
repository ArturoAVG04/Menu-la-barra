"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Instagram,
  LoaderCircle,
  Minus,
  MoonStar,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Store,
  SunMedium,
  Trash2,
  MessageCircle,
  X
} from "lucide-react";

import { MenuCard } from "@/components/customer/MenuCard";
import { useAppState } from "@/components/providers/AppProviders";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import { isBranchOpenAt } from "@/lib/branchHours";
import { createOrder, subscribeOrder } from "@/lib/services/menu";
import { currency } from "@/lib/utils";
import type { Branch, CartItem, Order, Product } from "@/types";

type ModifierSelectionMap = Record<string, string[]>;
const DEFAULT_WHATSAPP_LINK = "https://wa.me/message/JRC557CVY6LP1";
const ACTIVE_ORDER_STORAGE_KEY = "la-barra-active-order";
const CUSTOMER_DETAILS_STORAGE_KEY = "la-barra-customer-details";
const orderStatusLabels = {
  new: "Pendiente de confirmación",
  preparing: "En cocina",
  ready: "Listo para entrega",
  rejected: "Pedido rechazado",
  delivered: "Pedido entregado"
} as const;

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 448 512" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-190.9 101.5-190.9 226.9 0 43.2 10.8 85.5 31.5 122.5L32 501.7l133.2-34.7c35.4 19.3 75.2 29.5 115.4 29.5 125.4 0 227.3-101.9 227.3-227.3.1-59.2-23-114.9-64.8-156.9zm-157 375.4c-36.6 0-72.5-9.8-103.6-28.4l-7.4-4.4-77.1 20.1 20.4-75.1-4.8-7.7c-20.4-32.4-31.2-70.1-31.2-108.9 0-113.8 102.3-195 210.6-195 54.3 0 105.3 21.2 143.6 59.5s59.5 89.5 59.5 143.8c0 113.8-102.4 195.1-210.6 195.1zm115.7-158.4c-6.3-3.1-37.5-18.5-43.3-20.6-5.8-2.1-10.1-3.1-14.3 3.1-4.2 6.3-16.4 20.6-20.1 24.8-3.7 4.2-7.4 4.8-13.7 1.6s-26.8-9.9-51-31.5c-18.8-16.8-31.6-37.6-35.3-43.9-3.7-6.3-.4-9.8 2.8-12.9 2.9-2.8 6.3-7.4 9.5-11.1 3.2-3.7 4.2-6.3 6.3-10.6 2.1-4.2 1.1-7.9-.5-11.1-1.6-3.1-14.3-34.4-19.5-46.6-5.1-12.2-10.7-10.5-14.3-10.5-3.1 0-7.4-.5-11.6-.5-4.2 0-11.1 1.6-17 7.9-5.8 6.3-22.2 21.7-22.2 52.9s22.8 61.3 25.9 65.6c3.2 4.2 44.9 34.3 108.8 61.8 15.2 6.5 27 10.4 36.3 13.1 15.6 4.9 29.8 4.2 41.1 2.5 12.6-1.9 37.5-15.3 42.8-30.1s5.3-27.5 3.7-30.1c-1.5-2.8-5.7-4.2-12.1-7.4z" />
    </svg>
  );
}

function createModifierMap(item?: CartItem) {
  return Object.fromEntries(
    (item?.selectedModifiers ?? []).map((modifier) => [modifier.modifierId, modifier.optionIds])
  ) as ModifierSelectionMap;
}

function getSocialHref(value?: string, platform: "whatsapp" | "instagram" = "whatsapp") {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (platform === "whatsapp") {
    const digits = trimmed.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : null;
  }

  if (platform === "instagram") {
    return `https://instagram.com/${trimmed.replace("@", "")}`;
  }

  return null;
}

export function CustomerShell() {
  const {
    activeBranch,
    branches,
    branding,
    cart,
    cartItemsCount,
    cartTotal,
    setBranch,
    addToCart,
    replaceCartItem,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    restoreCart
  } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const { categories, products } = useRealtimeMenu(activeBranch?.id);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tipPercent, setTipPercent] = useState(10);
  const [cartOpen, setCartOpen] = useState(false);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [editorProductId, setEditorProductId] = useState<string | null>(null);
  const [editorSelections, setEditorSelections] = useState<ModifierSelectionMap>({});
  const [editorQuantity, setEditorQuantity] = useState(1);
  const [editorError, setEditorError] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [lastNotifiedStatus, setLastNotifiedStatus] = useState<string | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());
  const [addNotice, setAddNotice] = useState("");
  const editorPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const shouldLock =
      cartOpen ||
      branchPickerOpen ||
      trackingOpen ||
      Boolean(editingCartItemId) ||
      Boolean(editorProductId);
    const previousOverflow = document.body.style.overflow;

    if (shouldLock) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [branchPickerOpen, cartOpen, editingCartItemId, editorProductId, trackingOpen]);

  useEffect(() => {
    if (!cart.length) {
      setCartOpen(false);
      setEditingCartItemId(null);
    }
  }, [cart.length]);

  useEffect(() => {
    const storedOrderId = window.localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
    if (storedOrderId) {
      setActiveOrderId(storedOrderId);
    }

    try {
      const storedCustomer = window.localStorage.getItem(CUSTOMER_DETAILS_STORAGE_KEY);
      if (!storedCustomer) return;
      const parsed = JSON.parse(storedCustomer) as {
        customerName?: string;
        customerPhone?: string;
        orderNote?: string;
      };
      setCustomerName(parsed.customerName ?? "");
      setCustomerPhone(parsed.customerPhone ?? "");
      setOrderNote(parsed.orderNote ?? "");
    } catch {
      // ignore invalid local storage
    }
  }, []);

  useEffect(() => {
    setEditingCartItemId(null);
    setEditorProductId(null);
    setCartOpen(false);
    setBranchPickerOpen(false);
    setTrackingOpen(false);
  }, [activeBranch?.id]);

  useEffect(() => {
    if (!activeOrderId) {
      setActiveOrder(null);
      setLastNotifiedStatus(null);
      setTrackingOpen(false);
      return;
    }

    return subscribeOrder(activeOrderId, (order) => {
      setActiveOrder(order);

      if (order?.status === "delivered") {
        setAddNotice("Pedido entregado");
        setTrackingOpen(false);
        setActiveOrder(null);
        setLastNotifiedStatus(null);
        window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
        setActiveOrderId(null);
        return;
      }

      if (!order) {
        window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
        setActiveOrder(null);
        setActiveOrderId(null);
        setTrackingOpen(false);
        setLastNotifiedStatus(null);
      }
    });
  }, [activeOrderId]);

  useEffect(() => {
    if (!activeOrder) return;
    if (lastNotifiedStatus === null) {
      setLastNotifiedStatus(activeOrder.status);
      return;
    }
    if (activeOrder.status === lastNotifiedStatus) return;

    setLastNotifiedStatus(activeOrder.status);
    if (activeOrder.status !== "new" && activeOrder.status !== "delivered") {
      setTrackingOpen(true);
    }
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (activeOrder.status === "new") return;

    const notification = new Notification("Actualización de tu pedido", {
      body:
        activeOrder.statusMessage ||
        `Tu pedido ahora está en estado: ${orderStatusLabels[activeOrder.status]}.`
    });

    notification.onclick = () => window.focus();
  }, [activeOrder, lastNotifiedStatus]);

  useEffect(() => {
    window.localStorage.setItem(
      CUSTOMER_DETAILS_STORAGE_KEY,
      JSON.stringify({ customerName, customerPhone, orderNote })
    );
  }, [customerName, customerPhone, orderNote]);

  useEffect(() => {
    if (!addNotice) return;
    const timeoutId = window.setTimeout(() => setAddNotice(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [addNotice]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      if (!product.available) return false;
      if (!term) return true;

      return (
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  const tipAmount = useMemo(() => (cartTotal * tipPercent) / 100, [cartTotal, tipPercent]);
  const orderTotal = cartTotal + tipAmount;
  const whatsappHref = useMemo(
    () => getSocialHref(activeBranch?.whatsapp, "whatsapp") ?? DEFAULT_WHATSAPP_LINK,
    [activeBranch?.whatsapp]
  );
  const instagramHref = useMemo(
    () => getSocialHref((activeBranch as any)?.instagram, "instagram"),
    [activeBranch]
  );
  const shouldRecommendWhatsapp =
    activeOrder?.status === "preparing" ||
    activeOrder?.status === "ready" ||
    activeOrder?.status === "rejected";
  const sortedBranches = useMemo(
    () =>
      [...branches].sort((left, right) => {
        if (left.isPrimary === right.isPrimary) {
          return left.name.localeCompare(right.name, "es", { sensitivity: "base" });
        }
        return left.isPrimary ? -1 : 1;
      }),
    [branches]
  );

  const editingCartItem = useMemo(
    () => cart.find((item) => item.id === editingCartItemId) ?? null,
    [cart, editingCartItemId]
  );
  const editingProduct = useMemo(
    () =>
      editingCartItem
        ? products.find((product) => product.id === editingCartItem.productId) ?? null
        : editorProductId
            ? products.find((product) => product.id === editorProductId) ?? null
        : null,
    [editingCartItem, editorProductId, products]
  );

  const editorSelectionsDetail = useMemo(() => {
    if (!editingProduct) return [];

    return [...(editingProduct.modifiers as any[])]
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((modifier) => {
      const selectedIds = editorSelections[modifier.id] ?? [];
      const options = modifier.options.filter((option) => selectedIds.includes(option.id));

      return {
        modifierId: modifier.id,
        modifierName: modifier.name,
        required: modifier.required,
        type: modifier.type,
        optionIds: selectedIds,
        optionNames: options.map((option) => option.name),
        priceDelta: options.reduce((sum, option) => sum + option.priceDelta, 0)
      };
    });
  }, [editingProduct, editorSelections]);

  const editorBasePrice = editingProduct ? editingProduct.salePrice || editingProduct.price : 0;
  const editorExtrasTotal = editorSelectionsDetail.reduce(
    (sum, modifier) => sum + modifier.priceDelta,
    0
  );
  const editorUnitPrice = editorBasePrice + editorExtrasTotal;
  const editorTotal = editorUnitPrice * editorQuantity;

  useEffect(() => {
    if (!editingProduct) return;

    if (editingCartItem) {
      setEditorSelections(createModifierMap(editingCartItem));
      setEditorQuantity(editingCartItem.quantity);
    } else {
      setEditorSelections({});
      setEditorQuantity(1);
    }
    setEditorError("");
  }, [editingCartItem, editingProduct]);

  useEffect(() => {
    if ((!editingCartItemId && !editorProductId) || !editorPanelRef.current) return;
    editorPanelRef.current.scrollTo({ top: 0, behavior: "auto" });
  }, [editingCartItemId, editorProductId]);

  function openProductEditor(product: Product) {
    if (activeOrder && (activeOrder.status === "preparing" || activeOrder.status === "rejected")) {
      setAddNotice("Ya tienes una orden en curso. Si necesitas cambios, manda mensaje por WhatsApp.");
      return;
    }

    setCartOpen(false);
    setEditingCartItemId(null);
    setEditorProductId(product.id);
    setEditorError("");
  }

  function toggleEditorOption(
    modifierId: string,
    optionId: string,
    type: "single" | "multiple"
  ) {
    setEditorError("");
    setEditorSelections((current) => {
      const selected = current[modifierId] ?? [];

      if (type === "single") {
        return { ...current, [modifierId]: [optionId] };
      }

      const next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];

      return { ...current, [modifierId]: next };
    });
  }

  function openCartEditor(itemId: string) {
    setCartOpen(true);
    setEditorProductId(null);
    setEditingCartItemId(itemId);
  }

  function closeEditor() {
    setEditingCartItemId(null);
    setEditorProductId(null);
    setEditorError("");
  }

  function clearActiveOrderFlow() {
    window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    setActiveOrder(null);
    setActiveOrderId(null);
    setTrackingOpen(false);
    setLastNotifiedStatus(null);
  }

  function handleDismissRejectedOrder() {
    clearActiveOrderFlow();
  }

  function handleRetryRejectedOrder() {
    if (!activeOrder) return;

    const restoredItems = activeOrder.items.map((item) => ({
      ...item,
      id: crypto.randomUUID()
    }));

    restoreCart(restoredItems);
    setOrderNote(activeOrder.orderNote ?? "");
    clearActiveOrderFlow();
    setCartOpen(true);
  }

  function saveCartItemChanges() {
    if (!editingProduct) return;

    const missingRequired = editingProduct.modifiers.find((modifier) => {
      if (!modifier.required) return false;
      return !(editorSelections[modifier.id] ?? []).length;
    });

    if (missingRequired) {
      setEditorError(`Selecciona una opción en ${missingRequired.name}.`);
      return;
    }

    const normalizedModifiers = editorSelectionsDetail
      .filter((modifier) => modifier.optionIds.length)
      .map((modifier) => ({
        modifierId: modifier.modifierId,
        modifierName: modifier.modifierName,
        optionIds: modifier.optionIds,
        optionNames: modifier.optionNames,
        priceDelta: modifier.priceDelta
      }));

    if (editingCartItem) {
      replaceCartItem({
        ...editingCartItem,
        quantity: editorQuantity,
        note: undefined,
        basePrice: editorBasePrice,
        unitPrice: editorUnitPrice,
        selectedModifiers: normalizedModifiers
      });
    } else {
      const item: CartItem = {
        id: crypto.randomUUID(),
        productId: editingProduct.id,
        name: editingProduct.name,
        quantity: editorQuantity,
        basePrice: editorBasePrice,
        unitPrice: editorUnitPrice,
        imageUrl: editingProduct.imageUrl,
        selectedModifiers: normalizedModifiers
      };

      addToCart(item);
      setAddNotice(`"${editingProduct.name}" agregado al carrito`);
    }

    closeEditor();
  }

  async function submitOrder() {
    if (
      !activeBranch ||
      !activeBranchOpen ||
      !cart.length ||
      !customerName.trim() ||
      !customerPhone.trim()
    ) {
      return;
    }

    const invalidItem = cart.find((item) => {
      const product = products.find((productEntry) => productEntry.id === item.productId);
      if (!product) return false;

      return product.modifiers.some(
        (modifier) =>
          modifier.required &&
          !(item.selectedModifiers.find((selected) => selected.modifierId === modifier.id)?.optionIds
            .length ?? 0)
      );
    });

    if (invalidItem) {
      setCartOpen(true);
      setEditingCartItemId(invalidItem.id);
      setEditorError("Completa las personalizaciones obligatorias antes de enviar.");
      return;
    }

    try {
      setSubmitState("sending");
      setSubmitMessage("");

      const order = await createOrder(
        activeBranch.id,
        cart,
        customerName.trim(),
        customerPhone.trim(),
        orderNote.trim(),
        tipPercent,
        tipAmount
      );
      clearCart();
      setCartOpen(false);
      closeEditor();
      setActiveOrderId(order.id);
      window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, order.id);
      setTrackingOpen(true);
      setSubmitState("success");
      setSubmitMessage("Tu pedido fue enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar pedido:", error);
      setSubmitState("error");
      setSubmitMessage("No pudimos enviar tu pedido. Intenta nuevamente.");
      setCartOpen(true);
    }
  }

  useEffect(() => {
    setCurrentTimestamp(Date.now());
    const intervalId = window.setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeOrderCountdownLabel = useMemo(() => {
    if (!activeOrder || activeOrder.status !== "preparing") return null;

    if (typeof activeOrder.estimatedReadyAt === "number") {
      const remainingMinutes = Math.max(
        0,
        Math.ceil((activeOrder.estimatedReadyAt - currentTimestamp) / 60_000)
      );
      return remainingMinutes > 0
        ? `Pedido listo en aproximadamente ${remainingMinutes} min`
        : "Pedido listo en cualquier momento";
    }

    if (typeof activeOrder.estimatedMinutes === "number") {
      return `Pedido listo en aproximadamente ${activeOrder.estimatedMinutes} min`;
    }

    return null;
  }, [activeOrder, currentTimestamp]);
  const activeDateTime = useMemo(() => new Date(currentTimestamp), [currentTimestamp]);
  const activeBranchOpen = useMemo(
    () => isBranchOpenAt(activeBranch, activeDateTime),
    [activeBranch, activeDateTime]
  );

  if (!activeBranch) {
    return (
      <div className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
        Selecciona una sucursal para cargar el menú.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-40 md:pb-32">
      {addNotice && (
        <div className="pointer-events-none fixed left-1/2 top-4 z-[80] -translate-x-1/2 px-4">
          <div className="min-w-[240px] rounded-full border border-success/30 bg-panel px-6 py-3 text-center text-sm font-semibold text-success shadow-glow">
            {addNotice}
          </div>
        </div>
      )}

      <header className="overflow-hidden rounded-shell border border-line bg-panel">
        <div
          className="relative p-5 md:p-6"
          style={{
            backgroundImage: activeBranch.menuCoverImageUrl
              ? `linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.45)), url(${activeBranch.menuCoverImageUrl})`
              : "linear-gradient(135deg, rgb(var(--brand) / 0.88), rgb(var(--accent) / 0.72))",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-accent/15" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
                  {branding.logoUrl ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/20 bg-white/90 p-2 shadow-glow">
                      <Image
                        src={branding.logoUrl}
                        alt="Logo"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                      <Store size={20} />
                    </div>
                  )}

                  <div>
                    <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
                      {activeBranch.name}
                    </h1>
                    {activeBranch.address && (
                      <p className="mt-2 max-w-2xl text-sm text-white/80">
                        {activeBranch.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      activeBranchOpen
                        ? "bg-success/20 text-white"
                        : "bg-danger/20 text-white"
                    ].join(" ")}
                  >
                    {activeBranchOpen ? "Sucursal abierta" : "Sucursal cerrada"}
                  </span>
                  {activeBranch.isPrimary && (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      Principal
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => setBranchPickerOpen(true)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur"
                >
                  Cambiar sucursal
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur"
                  aria-label="Cambiar tema"
                >
                  {theme === "light" ? <MoonStar size={18} /> : <SunMedium size={18} />}
                </button>
              </div>
            </div>

            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-white/70" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="¿Que se te antoja hoy?"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="scrollbar-subtle flex gap-2 overflow-x-auto whitespace-nowrap pb-2 lg:gap-3">
        {categories.map((category) => (
          <a
            key={category.id}
            href={`#category-${category.id}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-line bg-panel px-4 py-3 text-center text-sm font-semibold text-text transition hover:border-brand/40 hover:bg-brand/5"
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
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-text">{category.name}</h2>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {sectionProducts.length} opciones
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-4">
                {sectionProducts.map((product) => (
                  <MenuCard key={product.id} product={product} onSelect={openProductEditor} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {!filteredProducts.length && (
        <section className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
          No encontramos productos con esa búsqueda en esta sucursal.
        </section>
      )}

      <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2.5">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#25D366]/30 bg-[#25D366] text-white shadow-glow md:hidden"
              aria-label="Enviar mensaje por WhatsApp"
            >
              <WhatsAppLogo className="h-7 w-7" />
            </a>
          )}

          {instagramHref && (
            <a
              href={instagramHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-pink-500/30 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-glow md:hidden"
              aria-label="Seguir en Instagram"
            >
              <Instagram size={28} />
            </a>
          )}

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-[56px] items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-glow md:inline-flex"
            >
              <WhatsAppLogo className="h-5 w-5" />
              WhatsApp
            </a>
          )}

          {instagramHref && (
            <a
              href={instagramHref}
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-[56px] items-center justify-center gap-2 rounded-full border border-pink-500/30 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-6 py-3 text-sm font-semibold text-white shadow-glow md:inline-flex"
            >
              <Instagram size={18} />
              Instagram
            </a>
          )}
        </div>

        {activeOrder ? (
          <button
            type="button"
            onClick={() => setTrackingOpen(true)}
            className="flex w-full items-center justify-between rounded-full border border-line bg-panel px-4 py-3 text-left shadow-glow md:ml-auto md:max-w-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-brand/10 p-3 text-brand">
                <Clock3 size={18} />
              </div>
              <div>
                <p className="font-semibold text-text">Seguimiento de pedido</p>
                <p className="text-sm text-muted">
                  {orderStatusLabels[activeOrder.status]}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        ) : cart.length > 0 && (
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-full border border-line bg-panel px-4 py-3 text-left shadow-glow md:ml-auto md:max-w-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-brand/10 p-3 text-brand">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="font-semibold text-text">Tu carrito</p>
                <p className="text-sm text-muted">
                  {cartItemsCount} items · {currency(cartTotal)}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        )}
      </div>

      {branchPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-3xl items-end md:items-center">
            <div className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-shell border border-line bg-panel p-5 shadow-glow md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-brand">Sucursales</p>
                  <h2 className="mt-2 text-2xl font-semibold text-text">
                    Cambia sin salir del menú
                  </h2>
                  <p className="mt-2 text-center text-sm text-muted md:text-left">
                    Tu carrito se mantiene separado por sucursal para que no se mezclen pedidos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBranchPickerOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-text"
                  aria-label="Cerrar selector de sucursal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 overflow-y-auto">
                <div className="grid gap-4 md:grid-cols-2">
                  {sortedBranches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => {
                        setBranch(branch);
                        setBranchPickerOpen(false);
                      }}
                      className={[
                        "overflow-hidden rounded-shell border text-left transition",
                        branch.id === activeBranch.id
                          ? "border-brand bg-brand/10"
                          : "border-line bg-surface hover:border-brand/40"
                      ].join(" ")}
                    >
                      <div
                        className="relative min-h-40 p-5"
                        style={
                          branch.coverImageUrl
                            ? {
                                backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.58)), url(${branch.coverImageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                              }
                            : {
                                background:
                                  "linear-gradient(135deg, rgb(var(--brand) / 0.16), rgb(var(--accent) / 0.18))"
                              }
                        }
                      >
                        <div className="flex h-full flex-col justify-between gap-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                              {isBranchOpenAt(branch, activeDateTime) ? "Abierta" : "Cerrada"}
                            </span>
                            {branch.isPrimary && (
                              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                Principal
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-xl font-semibold text-white">{branch.name}</p>
                            <p className="mt-2 text-sm text-white/80">{branch.address}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-2xl items-end md:items-stretch">
            <aside className="flex h-[88vh] w-full flex-col overflow-hidden rounded-t-shell border border-line bg-panel shadow-glow md:h-full md:rounded-none md:rounded-l-shell">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
                >
                  <ArrowLeft size={16} />
                  Volver
                </button>

                <div className="text-right">
                  <p className="font-semibold text-text">Tu pedido</p>
                  <p className="text-sm text-muted">
                    {cartItemsCount} items · {currency(cartTotal)}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-6">
                  <section className="space-y-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-brand">Productos</p>
                      <h3 className="mt-2 text-2xl font-semibold text-text">
                        Revisa tu pedido
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {cart.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-card border border-line bg-surface p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-text">{item.name}</p>
                              {item.selectedModifiers.length > 0 && (
                                <p className="mt-1 text-sm text-muted">
                                  {item.selectedModifiers
                                    .map((modifier) =>
                                      modifier.optionNames?.length
                                        ? `${modifier.modifierName}: ${modifier.optionNames.join(", ")}`
                                        : null
                                    )
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                              <p className="mt-2 text-sm font-semibold text-brand">
                                {currency(item.unitPrice)} c/u
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
                              aria-label={`Eliminar ${item.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="min-w-8 text-center font-semibold text-text">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => openCartEditor(item.id)}
                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
                              >
                                Editar
                              </button>
                              <p className="font-semibold text-text">
                                {currency(item.unitPrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-brand">Datos</p>
                      <h3 className="mt-2 text-2xl font-semibold text-text">
                        Completa tu pedido
                      </h3>
                    </div>

                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Nombre para el pedido"
                      className="min-h-11 w-full rounded-full border border-line bg-surface px-4 py-3 text-sm text-text outline-none"
                    />
                    <input
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="Numero de telefono"
                      inputMode="tel"
                      className="min-h-11 w-full rounded-full border border-line bg-surface px-4 py-3 text-sm text-text outline-none"
                    />
                    <textarea
                      value={orderNote}
                      onChange={(event) => setOrderNote(event.target.value)}
                      rows={1}
                      placeholder="Nota general para el restaurante"
                      className="min-h-11 max-h-11 w-full resize-none overflow-hidden rounded-full border border-line bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-muted"
                    />

                    <div className="rounded-card border border-line bg-surface p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text">Propina</p>
                          <p className="text-sm text-muted">
                            Ajusta el porcentaje para este pedido
                          </p>
                        </div>
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                          {tipPercent}%
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[0, 10, 15, 20].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setTipPercent(preset)}
                            className={[
                              "inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold",
                              tipPercent === preset
                                ? "bg-brand text-white"
                                : "border border-line text-text"
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
                        onChange={(event) => setTipPercent(Number(event.target.value))}
                        className="mt-4 w-full accent-[rgb(var(--brand))]"
                      />

                      <div className="mt-4 space-y-2 text-sm text-text">
                        <div className="flex items-center justify-between">
                          <span>Subtotal</span>
                          <span>{currency(cartTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Propina</span>
                          <span>{currency(tipAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between font-semibold">
                          <span>Total</span>
                          <span>{currency(orderTotal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={clearCart}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
                      >
                        Vaciar carrito
                      </button>
                      <button
                        type="button"
                        onClick={() => void submitOrder()}
                        disabled={
                          !customerName.trim() ||
                          !customerPhone.trim() ||
                          !activeBranchOpen ||
                          submitState === "sending"
                        }
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
                      >
                        {submitState === "sending" ? (
                          <span className="inline-flex items-center gap-2">
                            <LoaderCircle size={16} className="animate-spin" />
                            Enviando pedido...
                          </span>
                        ) : activeBranchOpen
                          ? `Enviar pedido ${currency(orderTotal)}`
                          : "Sucursal cerrada"}
                      </button>
                    </div>

                    {submitState === "error" && submitMessage && (
                      <p className="text-sm font-medium text-danger">{submitMessage}</p>
                    )}

                    {!activeBranchOpen && (
                      <div className="space-y-3 rounded-card border border-danger/20 bg-danger/5 p-4 text-center">
                        <p className="text-sm font-medium text-danger">
                          Esta sucursal está cerrada. Puedes revisar el menú y tu carrito, pero no enviar pedidos por ahora.
                        </p>
                        {whatsappHref && (
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366] px-4 py-3 text-center text-sm font-semibold text-white"
                          >
                            <MessageCircle size={16} />
                            Mandar mensaje por WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {trackingOpen && activeOrder && (
        <div className="fixed inset-0 z-[65] bg-black/55 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-2xl items-end md:items-center">
            <div className="max-h-[88vh] w-full overflow-y-auto rounded-shell border border-line bg-panel p-5 shadow-glow md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-brand">Seguimiento</p>
                  <h3 className="mt-2 text-2xl font-semibold text-text">
                    {orderStatusLabels[activeOrder.status]}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackingOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-text"
                  aria-label="Cerrar seguimiento del pedido"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand/10 px-3 py-2 text-sm font-semibold text-brand">
                    Pedido #{activeOrder.id.slice(-6).toUpperCase()}
                  </span>
                  {shouldRecommendWhatsapp && whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"
                    >
                      <MessageCircle size={16} />
                      Mandar mensaje al restaurante
                    </a>
                  )}
                </div>

                {activeOrder.statusMessage && (
                  <div className="rounded-card border border-line bg-surface p-4">
                    <p className="text-center text-sm text-text">{activeOrder.statusMessage}</p>
                  </div>
                )}

                {activeOrderCountdownLabel && (
                  <div className="rounded-card border border-brand/30 bg-brand/10 p-4">
                    <p className="text-center text-sm font-semibold text-brand">{activeOrderCountdownLabel}</p>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { key: "new", label: "Recibido", icon: ShoppingBag },
                    { key: "preparing", label: "En cocina", icon: Clock3 },
                    { key: "ready", label: "Listo", icon: PackageCheck },
                    { key: "delivered", label: "Entregado", icon: CheckCircle2 }
                  ].map((step) => {
                    const Icon = step.icon;
                    const activeIndex = ["new", "preparing", "ready", "delivered", "rejected"].indexOf(
                      activeOrder.status
                    );
                    const currentIndex = ["new", "preparing", "ready", "delivered"].indexOf(step.key);
                    const isActive =
                      activeOrder.status === "rejected" ? step.key === "new" : currentIndex <= activeIndex;

                    return (
                      <div
                        key={step.key}
                        className={[
                          "rounded-card border p-4",
                          isActive ? "border-brand bg-brand/10" : "border-line bg-surface"
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              "grid h-10 w-10 place-items-center rounded-full",
                              isActive ? "bg-brand text-white" : "bg-panel text-muted"
                            ].join(" ")}
                          >
                            <Icon size={18} />
                          </div>
                          <p className="text-sm font-semibold text-text">{step.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {activeOrder.status === "rejected" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleDismissRejectedOrder}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line px-4 py-3 text-center text-sm font-semibold text-text"
                    >
                      Borrar
                    </button>
                    <button
                      type="button"
                      onClick={handleRetryRejectedOrder}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Volver a pedir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[60] bg-black/55 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-2xl items-end md:items-center">
            <div
              ref={editorPanelRef}
              className="max-h-[88vh] w-full overflow-y-auto rounded-shell border border-line bg-panel p-5 shadow-glow md:max-w-xl md:p-6"
            >
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-text"
                  aria-label="Cerrar edición del producto"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5">
                {editingProduct.imageUrl && (
                  <div className="relative mb-4 h-52 overflow-hidden rounded-card bg-surface">
                    <Image
                      src={editingProduct.imageUrl}
                      alt={editingProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-text">{editingProduct.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{editingProduct.description}</p>
                <p className="mt-3 text-sm font-semibold text-brand">
                  Base {currency(editorBasePrice)}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {[...(editingProduct.modifiers as any[])]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((modifier) => (
                  <div key={modifier.id} className="rounded-card border border-line p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-text">{modifier.name}</p>
                      {modifier.required && (
                        <span className="text-xs font-bold uppercase tracking-wide text-brand">
                          Obligatorio
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      {modifier.options.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center justify-between gap-3 rounded-card border border-line px-3 py-3 text-sm text-text"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type={modifier.type === "single" ? "radio" : "checkbox"}
                              name={`modifier-${modifier.id}`}
                              checked={(editorSelections[modifier.id] ?? []).includes(option.id)}
                              onChange={() =>
                                toggleEditorOption(modifier.id, option.id, modifier.type)
                              }
                              className="h-4 w-4 accent-[rgb(var(--brand))]"
                            />
                            <span>{option.name}</span>
                          </div>
                          <span>
                            {option.priceDelta ? `+${currency(option.priceDelta)}` : "Incluido"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="rounded-card border border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-text">Cantidad</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditorQuantity((current) => Math.max(1, current - 1))}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-8 text-center font-semibold text-text">
                        {editorQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditorQuantity((current) => current + 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2 rounded-card bg-surface/50 px-4 py-4 text-sm text-text border border-line/50">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Extras</span>
                      <span className="font-medium text-text">{currency(editorExtrasTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-line pt-2 font-bold text-base">
                      <span>Total</span>
                      <span className="text-brand">{currency(editorTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {editorError && (
                <p className="mt-4 text-sm font-medium text-danger">{editorError}</p>
              )}

              <div className="mt-6 flex">
                <button
                  type="button"
                  onClick={saveCartItemChanges}
                  className="inline-flex min-h-[52px] w-full items-center justify-between rounded-full bg-brand px-6 py-3 text-base font-bold text-white shadow-glow transition active:scale-[0.98]"
                >
                  <span>{editingCartItem ? "Guardar cambios" : "Agregar al carrito"}</span>
                  <span className="border-l border-white/20 pl-4">{currency(editorTotal)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {submitState === "success" && (
        <div className="fixed inset-0 z-[70] bg-black/45 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-lg items-center">
            <div className="w-full rounded-shell border border-line bg-panel p-7 shadow-glow">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 size={28} />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-2xl font-semibold text-text">Pedido enviado</h3>
                <p className="mt-2 text-sm text-muted">
                  {submitMessage || "Tu pedido ya quedó registrado para esta sucursal."}
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitState("idle");
                    setSubmitMessage("");
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                >
                  Seguir explorando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
