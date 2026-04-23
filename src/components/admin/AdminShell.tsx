"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  LayoutGrid,
  Menu,
  LogOut,
  MoonStar,
  Palette,
  Plus,
  Settings2,
  ShieldCheck,
  Store,
  SunMedium,
  Trash2
} from "lucide-react";

import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { OrderTracker } from "@/components/admin/OrderTracker";
import { useAppState } from "@/components/providers/AppProviders";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  deleteBranch,
  deleteOrder,
  saveBranch,
  subscribeBranches,
  subscribeOrders,
  updateOrderStatus
} from "@/lib/services/menu";
import {
  WEEK_DAYS,
  defaultWeeklyHours,
  isBranchOpenAt,
  normalizeWeeklyHours,
  type NormalizedWeeklyHoursSlot
} from "@/lib/branchHours";
import type { Branch, Order } from "@/types";

const initialBranchDraft = {
  name: "",
  slug: "",
  address: "",
  whatsapp: "",
  instagram: "",
  isPrimary: false,
  isOpen: true
};

function defaultOrderSettings() {
  return {
    baseItemThreshold: 3,
    baseMinutes: 20,
    extraItemStep: 2,
    extraMinutesPerStep: 5
  };
}

function defaultSchedule() {
  return defaultWeeklyHours();
}

function getEstimatedMinutes(branch: Branch, order: Order) {
  const settings = branch.orderSettings ?? defaultOrderSettings();
  const itemCount = order.itemCount ?? order.items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount <= settings.baseItemThreshold) {
    return settings.baseMinutes;
  }

  const extraItems = itemCount - settings.baseItemThreshold;
  const extraBlocks = Math.ceil(extraItems / Math.max(settings.extraItemStep, 1));
  return settings.baseMinutes + extraBlocks * settings.extraMinutesPerStep;
}

type Notice = {
  id: string;
  message: string;
};

type Section = "overview" | "business" | "menu" | "themes" | "orders";

export function AdminShell() {
  const { branches, currentUser, logout, setBranches } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [section, setSection] = useState<Section>("overview");
  const [adminBranchId, setAdminBranchId] = useState("");
  const [branchDraft, setBranchDraft] = useState(initialBranchDraft);
  const [branchEditor, setBranchEditor] = useState<Branch | null>(null);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [isUpdatingBranch, setIsUpdatingBranch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === adminBranchId) ?? null,
    [adminBranchId, branches]
  );

  function notify(message: string) {
    const id = crypto.randomUUID();
    setNotices((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id));
    }, 2600);
  }

  useEffect(() => subscribeBranches(setBranches), [setBranches]);

  useEffect(() => {
    if (!branches.length) {
      setAdminBranchId("");
      return;
    }

    setAdminBranchId((current) =>
      current && branches.some((branch) => branch.id === current)
        ? current
        : (branches.find((branch) => branch.isPrimary) ?? branches[0]).id
    );
  }, [branches]);

  useEffect(() => {
    setBranchEditor(
      selectedBranch
        ? { ...selectedBranch, weeklyHours: normalizeWeeklyHours(selectedBranch.weeklyHours) }
        : null
    );
  }, [selectedBranch]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTimestamp(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!selectedBranch || !currentUser) {
      setOrders([]);
      return;
    }

    return subscribeOrders(selectedBranch.id, setOrders);
  }, [currentUser, selectedBranch?.id]);

  async function unsetOtherPrimary(branchId: string) {
    await Promise.all(
      branches
        .filter((branch) => branch.id !== branchId && branch.isPrimary)
        .map((branch) => saveBranch({ ...branch, isPrimary: false }))
    );
  }

  async function handleCreateBranch(event: React.FormEvent) {
    event.preventDefault();
    if (!branchDraft.name.trim()) return;

    setIsCreatingBranch(true);
    try {
      const newBranch: Branch = {
        id: crypto.randomUUID(),
        name: branchDraft.name.trim(),
        slug: branchDraft.slug.trim() || branchDraft.name.toLowerCase().replaceAll(" ", "-"),
        address: branchDraft.address.trim(),
        whatsapp: branchDraft.whatsapp.trim(),
        instagram: branchDraft.instagram?.trim() || "",
        isPrimary: branchDraft.isPrimary,
        orderSettings: defaultOrderSettings(),
        weeklyHours: defaultSchedule(),
        isOpen: branchDraft.isOpen
      };

      if (newBranch.isPrimary) {
        await unsetOtherPrimary(newBranch.id);
      }

      await saveBranch(newBranch);
      setAdminBranchId(newBranch.id);
      setBranchDraft(initialBranchDraft);
      setShowCreateBranch(false);
      notify("Sucursal guardada");
    } finally {
      setIsCreatingBranch(false);
    }
  }

  async function handleUpdateBranch(event: React.FormEvent) {
    event.preventDefault();
    if (!branchEditor) return;

    setIsUpdatingBranch(true);
    try {
      if (branchEditor.isPrimary) {
        await unsetOtherPrimary(branchEditor.id);
      }
      await saveBranch(branchEditor);
      notify("Cambios guardados");
    } finally {
      setIsUpdatingBranch(false);
    }
  }

  async function handleDeleteBranch(branchId: string) {
    await deleteBranch(branchId);
    notify("Sucursal eliminada");
  }

  async function handleAcceptOrder(order: Order) {
    if (!selectedBranch) return;

    const estimatedMinutes = getEstimatedMinutes(selectedBranch, order);
    await updateOrderStatus(order.id, {
      status: "preparing",
      estimatedMinutes,
      estimatedReadyAt: Date.now() + estimatedMinutes * 60_000,
      statusMessage:
        "Tu pedido fue aceptado. Te recomendamos mandar mensaje al restaurante por cualquier detalle o para recibir actualizaciones."
    });
    notify("Pedido aceptado");
  }

  async function handleRejectOrder(order: Order) {
    await updateOrderStatus(order.id, {
      status: "rejected",
      statusMessage:
        "Tu pedido fue rechazado. Te recomendamos mandar mensaje al restaurante para revisar cualquier detalle."
    });
    notify("Pedido rechazado");
  }

  async function handleReadyOrder(order: Order) {
    await updateOrderStatus(order.id, {
      status: "ready",
      statusMessage:
        "Tu pedido está listo. Te recomendamos mandar mensaje al restaurante para coordinar cualquier detalle."
    });
    notify("Pedido listo");
  }

  async function handleDeliveredOrder(order: Order) {
    await updateOrderStatus(order.id, {
      status: "delivered",
      statusMessage: "Pedido entregado"
    });
    notify("Pedido entregado");
  }

  async function handleDeleteOrder(order: Order) {
    try {
      await deleteOrder(order.id);
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
    }
  }

  function updateScheduleSlot(
    slotIndex: number,
    updater: (slot: NormalizedWeeklyHoursSlot) => NormalizedWeeklyHoursSlot
  ) {
    setBranchEditor((current) =>
      current
        ? {
            ...current,
            weeklyHours: normalizeWeeklyHours(current.weeklyHours).map((slot, index) =>
              index === slotIndex ? updater(slot) : slot
            )
          }
        : current
    );
  }

  function toggleScheduleDay(slotIndex: number, dayLabel: string) {
    updateScheduleSlot(slotIndex, (slot) => {
      const hasDay = slot.days.includes(dayLabel);
      const nextDays = hasDay
        ? slot.days.filter((day) => day !== dayLabel)
        : [...slot.days, dayLabel];

      return { ...slot, days: nextDays };
    });
  }

  function addScheduleSlot() {
    setBranchEditor((current) =>
      current
        ? {
            ...current,
            weeklyHours: [...normalizeWeeklyHours(current.weeklyHours), { days: [], open: "13:00", close: "22:00" }]
          }
        : current
    );
  }

  function removeScheduleSlot(slotIndex: number) {
    setBranchEditor((current) => {
      if (!current) return current;

      const nextSlots = normalizeWeeklyHours(current.weeklyHours).filter((_, index) => index !== slotIndex);

      return {
        ...current,
        weeklyHours: nextSlots.length ? nextSlots : defaultSchedule()
      };
    });
  }

  function renderSidebar() {
    return (
      <div className="flex h-full flex-col p-6">
        <div className="border-b border-line pb-4">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-brand">La Barra</p>
                  <h1 className="mt-2 text-xl font-semibold text-text">Admin</h1>
                </div>
                <div className="flex items-center gap-2 self-start rounded-full bg-success/15 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-success">
                  <ShieldCheck size={16} />
                  Sesión Activa
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-text xl:inline-flex"
            >
              {sidebarCollapsed ? ">" : "<"}
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-6 scrollbar-none">
          {!sidebarCollapsed && (
            <div className="mb-6 space-y-2">
              <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted">Sucursal activa</span>
              <select
                value={adminBranchId}
                onChange={(event) => setAdminBranchId(event.target.value)}
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-brand"
              >
                <option value="">Selecciona</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <nav className={[
            "space-y-1 transition-all duration-300",
            !sidebarCollapsed ? "rounded-card border border-line bg-surface/40 p-1.5 shadow-inner" : "flex flex-col items-center gap-3"
          ].join(" ")}>
            {[
              { id: "overview", label: "General", icon: Settings2 },
              { id: "business", label: "Datos", icon: Store },
              { id: "menu", label: "Menú", icon: LayoutGrid },
              { id: "themes", label: "Temas", icon: Palette },
              { id: "orders", label: "Pedidos", icon: ClipboardList }
            ].map((item) => {
              const Icon = item.icon;
              const active = section === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id as Section);
                    setMobileDrawerOpen(false);
                  }}
                  className={[
                    "inline-flex min-h-[44px] w-full items-center gap-3 rounded-card px-4 py-3 text-left text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-brand text-white shadow-glow"
                      : "border border-transparent text-text hover:border-line hover:bg-surface/80",
                    sidebarCollapsed ? "justify-center px-0 h-11 w-11" : ""
                  ].join(" ")}
                  title={item.label}
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-line pt-4">
          <div className={sidebarCollapsed ? "flex flex-col items-center gap-4" : "flex flex-col gap-3"}>
            <button
              type="button"
              onClick={() => void logout()}
              className={[
                "inline-flex min-h-[44px] items-center justify-center rounded-full border border-line text-sm font-semibold text-text transition hover:bg-surface",
                sidebarCollapsed ? "w-11 px-0" : "w-full px-4 py-3"
              ].join(" ")}
            >
              {sidebarCollapsed ? <LogOut size={18} /> : "Cerrar Sesión"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
        Inicia sesión.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-panel text-text">
      {/* Notificaciones Toasts - Siempre arriba del todo en z-index */}
      <div className="pointer-events-none fixed bottom-10 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="pointer-events-auto min-w-[220px] rounded-full border border-success/30 bg-panel px-6 py-3 text-center text-sm font-bold text-success shadow-2xl backdrop-blur-md"
          >
            {notice.message}
          </div>
        ))}
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar Fija para Desktop */}
        <aside
          className={[
            "hidden xl:block h-screen sticky top-0 border-r border-line bg-panel transition-all duration-300",
            sidebarCollapsed ? "w-[88px]" : "w-[288px]"
          ].join(" ")}
        >
          {renderSidebar()}
        </aside>

        {/* Área de Contenido */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-panel/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-text xl:hidden"
              >
                <Menu size={18} />
              </button>
              <h1 className="text-lg font-bold tracking-tight text-text">
                {sidebarCollapsed || mobileDrawerOpen ? "La Barra" : (section === 'overview' ? 'La Barra' : 'Admin')}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold text-text"
              >
                {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
                <span className="hidden sm:inline">{theme === "dark" ? "Claro" : "Oscuro"}</span>
              </button>
              <a
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold text-text"
              >
                Ver menú
              </a>
            </div>
          </header>

          {/* Drawer para Móvil - Overlay */}
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setMobileDrawerOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-[280px] border-r border-line bg-panel shadow-2xl">
                {renderSidebar()}
              </div>
            </div>
          )}

          <main className="p-4 md:p-8 space-y-6">
            {section === "overview" && (
              <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-text">Sucursales</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateBranch(true)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white"
                >
                  <Plus size={16} /> Agregar sucursal
                </button>
              </div>

              <section className="rounded-shell border border-line bg-panel p-4">
                <div className="space-y-3">
                  {branches.length ? (
                    branches.map((branch) => (
                      <div
                        key={branch.id}
                        className="rounded-card border border-line bg-surface p-3 sm:px-4 sm:py-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-text">{branch.name}</p>
                            <p className="text-sm text-muted">{branch.address || "Sin dirección"}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {branch.isPrimary && (
                              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                                Principal
                              </span>
                            )}
                            <span
                              className={[
                                "rounded-full px-3 py-1 text-xs font-semibold",
                                isBranchOpenAt(branch, new Date(currentTimestamp))
                                  ? "bg-success/15 text-success"
                                  : "bg-danger/15 text-danger"
                              ].join(" ")}
                            >
                              {isBranchOpenAt(branch, new Date(currentTimestamp)) ? "Abierta" : "Cerrada"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminBranchId(branch.id);
                                setSection("business");
                              }}
                              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-text"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteBranch(branch.id)}
                              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger"
                            >
                              <Trash2 size={16} />
                              Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-card border border-dashed border-line bg-surface p-5 text-sm text-muted">
                      Sin sucursales.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {section === "business" && (
            <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-text">
                  {branchEditor ? branchEditor.name : "Datos"}
                </h2>
              </div>

              {branchEditor ? (
                <form onSubmit={handleUpdateBranch} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={branchEditor.name}
                      onChange={(event) =>
                        setBranchEditor((current) =>
                          current ? { ...current, name: event.target.value } : current
                        )
                      }
                      className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                      placeholder="Nombre"
                    />
                    <input
                      value={branchEditor.slug}
                      onChange={(event) =>
                        setBranchEditor((current) =>
                          current ? { ...current, slug: event.target.value } : current
                        )
                      }
                      className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                      placeholder="Slug"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={branchEditor.address}
                      onChange={(event) =>
                        setBranchEditor((current) =>
                          current ? { ...current, address: event.target.value } : current
                        )
                      }
                      className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                      placeholder="Dirección"
                    />
                    <input
                      value={branchEditor.whatsapp || ""}
                      onChange={(event) =>
                        setBranchEditor((current) =>
                          current ? { ...current, whatsapp: event.target.value } : current
                        )
                      }
                      className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                      placeholder="WhatsApp"
                    />
                    <input
                      value={branchEditor.instagram || ""}
                      onChange={(event) =>
                        setBranchEditor((current) =>
                          current ? { ...current, instagram: event.target.value } : current
                        )
                      }
                      className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                      placeholder="Instagram (link o usuario)"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text">
                      <input
                        type="checkbox"
                        checked={branchEditor.isOpen}
                        onChange={(event) =>
                          setBranchEditor((current) =>
                            current ? { ...current, isOpen: event.target.checked } : current
                          )
                        }
                      />
                      Abierta
                    </label>
                    <label className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text">
                      <input
                        type="checkbox"
                        checked={branchEditor.isPrimary || false}
                        onChange={(event) =>
                          setBranchEditor((current) =>
                            current ? { ...current, isPrimary: event.target.checked } : current
                          )
                        }
                      />
                      Principal
                    </label>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text">Tiempos de preparación</h3>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <label className="space-y-2 text-sm text-text">
                        <span>Hasta cuántos productos</span>
                        <input
                          type="number"
                          min="1"
                          value={branchEditor.orderSettings?.baseItemThreshold ?? 3}
                          onChange={(event) =>
                            setBranchEditor((current) =>
                              current
                                ? {
                                    ...current,
                                    orderSettings: {
                                      ...(current.orderSettings ?? defaultOrderSettings()),
                                      baseItemThreshold: Number(event.target.value) || 1
                                    }
                                  }
                                : current
                            )
                          }
                          className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-text">
                        <span>Minutos base</span>
                        <input
                          type="number"
                          min="1"
                          value={branchEditor.orderSettings?.baseMinutes ?? 20}
                          onChange={(event) =>
                            setBranchEditor((current) =>
                              current
                                ? {
                                    ...current,
                                    orderSettings: {
                                      ...(current.orderSettings ?? defaultOrderSettings()),
                                      baseMinutes: Number(event.target.value) || 1
                                    }
                                  }
                                : current
                            )
                          }
                          className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-text">
                        <span>Cada cuántos extras</span>
                        <input
                          type="number"
                          min="1"
                          value={branchEditor.orderSettings?.extraItemStep ?? 2}
                          onChange={(event) =>
                            setBranchEditor((current) =>
                              current
                                ? {
                                    ...current,
                                    orderSettings: {
                                      ...(current.orderSettings ?? defaultOrderSettings()),
                                      extraItemStep: Number(event.target.value) || 1
                                    }
                                  }
                                : current
                            )
                          }
                          className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-text">
                        <span>Minutos extra</span>
                        <input
                          type="number"
                          min="1"
                          value={branchEditor.orderSettings?.extraMinutesPerStep ?? 5}
                          onChange={(event) =>
                            setBranchEditor((current) =>
                              current
                                ? {
                                    ...current,
                                    orderSettings: {
                                      ...(current.orderSettings ?? defaultOrderSettings()),
                                      extraMinutesPerStep: Number(event.target.value) || 1
                                    }
                                  }
                                : current
                            )
                          }
                          className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-muted">
                      Ejemplo: hasta {branchEditor.orderSettings?.baseItemThreshold ?? 3} productos son{" "}
                      {branchEditor.orderSettings?.baseMinutes ?? 20} min; luego sumas{" "}
                      {branchEditor.orderSettings?.extraMinutesPerStep ?? 5} min por cada{" "}
                      {branchEditor.orderSettings?.extraItemStep ?? 2} productos extra.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-text">Horarios</h3>
                    <div className="space-y-3">
                      {normalizeWeeklyHours(branchEditor.weeklyHours).map((slot, index) => (
                        <div
                          key={`schedule-slot-${index}`}
                          className="space-y-4 rounded-card border border-line bg-surface p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-text">Bloque {index + 1}</p>
                              <p className="text-xs text-muted">
                                Elige los días que comparten este horario.
                              </p>
                            </div>
                            {normalizeWeeklyHours(branchEditor.weeklyHours).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeScheduleSlot(index)}
                                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger"
                              >
                                <Trash2 size={16} />
                                Borrar
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
                            {WEEK_DAYS.map((day) => {
                              const selected = slot.days.includes(day.label);

                              return (
                                <button
                                  key={`${index}-${day.id}`}
                                  type="button"
                                  onClick={() => toggleScheduleDay(index, day.label)}
                                  className={[
                                    "inline-flex min-h-[44px] items-center justify-center rounded-card border px-3 py-3 text-sm font-semibold transition",
                                    selected
                                      ? "border-brand bg-brand text-white"
                                      : "border-line bg-panel text-text hover:border-brand/40"
                                  ].join(" ")}
                                >
                                  {day.shortLabel}
                                </button>
                              );
                            })}
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm text-text">
                              <span>Hora de inicio</span>
                              <input
                                type="time"
                                value={slot.allDay ? "00:00" : slot.open}
                                disabled={slot.allDay}
                                onChange={(event) =>
                                  updateScheduleSlot(index, (current) => ({
                                    ...current,
                                    open: event.target.value
                                  }))
                                }
                                className="min-h-11 w-full rounded-card border border-line bg-panel px-4 py-3 outline-none disabled:opacity-50"
                              />
                            </label>
                            <label className="space-y-2 text-sm text-text">
                              <span>Hora de finalización</span>
                              <input
                                type="time"
                                value={slot.allDay ? "23:59" : slot.close}
                                disabled={slot.allDay}
                                onChange={(event) =>
                                  updateScheduleSlot(index, (current) => ({
                                    ...current,
                                    close: event.target.value
                                  }))
                                }
                                className="min-h-11 w-full rounded-card border border-line bg-panel px-4 py-3 outline-none disabled:opacity-50"
                              />
                            </label>
                          </div>

                          <label className="flex min-h-11 items-center justify-center gap-3 rounded-card border border-line bg-panel px-4 py-3 text-center text-sm text-text">
                            <input
                              type="checkbox"
                              checked={slot.allDay || false}
                              onChange={(event) =>
                                updateScheduleSlot(index, (current) => ({
                                  ...current,
                                  allDay: event.target.checked,
                                  open: event.target.checked ? "00:00" : current.open,
                                  close: event.target.checked ? "23:59" : current.close
                                }))
                              }
                            />
                            Abierto las 24 horas
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addScheduleSlot}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-text transition hover:bg-surface"
                    >
                      Agregar más días y horarios
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingBranch}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
                  >
                    {isUpdatingBranch ? "Guardando..." : "Guardar cambios"}
                  </button>
                </form>
              ) : (
                <div className="rounded-card border border-dashed border-line bg-surface p-5 text-sm text-muted">
                  Selecciona una sucursal.
                </div>
              )}
            </section>
          )}

          {section === "menu" && (
            <AdminProductForm
              branch={selectedBranch}
              allBranches={branches}
              section="menu"
              onNotify={notify}
            />
          )}

          {section === "themes" && (
            <AdminProductForm
              branch={selectedBranch}
              allBranches={branches}
              section="themes"
              onNotify={notify}
            />
          )}

          {section === "orders" && (
            selectedBranch ? (
              <OrderTracker
                orders={orders}
                onAccept={handleAcceptOrder}
                onReject={handleRejectOrder}
                onReady={handleReadyOrder}
                onDelivered={handleDeliveredOrder}
                onDelete={handleDeleteOrder}
              />
            ) : (
              <section className="rounded-shell border border-dashed border-line bg-panel p-6 text-center text-sm text-muted">
                Selecciona una sucursal.
              </section>
            )
          )}
        </main>
      </div>
      </div>

      {showCreateBranch && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="w-full max-w-xl rounded-shell border border-line bg-panel p-6 shadow-glow">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-text">Nueva sucursal</h2>
              <button
                type="button"
                onClick={() => setShowCreateBranch(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="mt-5 space-y-4">
              <input
                value={branchDraft.name}
                onChange={(event) =>
                  setBranchDraft((current) => ({ ...current, name: event.target.value }))
                }
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                placeholder="Nombre"
              />
              <input
                value={branchDraft.slug}
                onChange={(event) =>
                  setBranchDraft((current) => ({ ...current, slug: event.target.value }))
                }
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                placeholder="Slug"
              />
              <input
                value={branchDraft.address}
                onChange={(event) =>
                  setBranchDraft((current) => ({ ...current, address: event.target.value }))
                }
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                placeholder="Dirección"
              />
              <input
                value={branchDraft.whatsapp}
                onChange={(event) =>
                  setBranchDraft((current) => ({ ...current, whatsapp: event.target.value }))
                }
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                placeholder="WhatsApp"
              />
              <input
                value={branchDraft.instagram || ""}
                onChange={(event) =>
                  setBranchDraft((current) => ({ ...current, instagram: event.target.value }))
                }
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                placeholder="Instagram"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={branchDraft.isOpen}
                    onChange={(event) =>
                      setBranchDraft((current) => ({ ...current, isOpen: event.target.checked }))
                    }
                  />
                  Abierta
                </label>
                <label className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={branchDraft.isPrimary}
                    onChange={(event) =>
                      setBranchDraft((current) => ({ ...current, isPrimary: event.target.checked }))
                    }
                  />
                  Principal
                </label>
              </div>
              <button
                type="submit"
                disabled={isCreatingBranch || !branchDraft.name.trim()}
                className="inline-flex min-h-11 items-center justify-center self-center rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
              >
                {isCreatingBranch ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
