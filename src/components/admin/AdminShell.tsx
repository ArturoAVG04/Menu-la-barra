"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  LayoutGrid,
  Menu,
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
import { deleteBranch, saveBranch, subscribeBranches, subscribeOrders } from "@/lib/services/menu";
import type { Branch, Order } from "@/types";

const weekDays = [
  { id: "monday", label: "Lunes" },
  { id: "tuesday", label: "Martes" },
  { id: "wednesday", label: "Miércoles" },
  { id: "thursday", label: "Jueves" },
  { id: "friday", label: "Viernes" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" }
] as const;

const initialBranchDraft = {
  name: "",
  slug: "",
  address: "",
  whatsapp: "",
  isPrimary: false,
  isOpen: true
};

function defaultSchedule() {
  return weekDays.map((day) => ({
    day: day.label,
    enabled: day.id !== "sunday",
    open: "13:00",
    close: "22:00"
  }));
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
      current && branches.some((branch) => branch.id === current) ? current : branches[0].id
    );
  }, [branches]);

  useEffect(() => {
    setBranchEditor(selectedBranch ? { ...selectedBranch } : null);
  }, [selectedBranch]);

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
        isPrimary: branchDraft.isPrimary,
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

  function renderSidebar() {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-line pb-4">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-brand">La Barra</p>
                <h1 className="mt-2 text-xl font-semibold text-text">Admin</h1>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="hidden min-h-11 min-w-11 rounded-full border border-line bg-surface text-text xl:inline-flex xl:items-center xl:justify-center"
            >
              {sidebarCollapsed ? ">" : "<"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {!sidebarCollapsed && (
            <label className="block space-y-2 text-sm text-text">
              <span>Sucursal</span>
              <select
                value={adminBranchId}
                onChange={(event) => setAdminBranchId(event.target.value)}
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
              >
                <option value="">Selecciona</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <nav className="mt-6 space-y-2">
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
                  "flex min-h-11 w-full items-center gap-3 rounded-card px-4 py-3 text-left text-sm font-semibold transition",
                  active
                    ? "bg-brand text-white shadow-glow"
                    : "border border-transparent text-text hover:border-line hover:bg-surface",
                  sidebarCollapsed ? "justify-center px-0" : ""
                ].join(" ")}
              >
                <Icon size={18} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-sm font-semibold text-success">
                <ShieldCheck size={16} />
                Activa
              </div>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              className="min-h-11 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
            >
              {sidebarCollapsed ? "X" : "Salir"}
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
    <div className="relative">
      <div className="pointer-events-none fixed right-4 top-20 z-50 space-y-2">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="pointer-events-auto rounded-card border border-success/30 bg-success/15 px-4 py-3 text-sm font-semibold text-success shadow-glow"
          >
            {notice.message}
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-40 mb-6 flex items-center justify-between rounded-shell border border-line bg-panel/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-surface text-text xl:hidden"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-lg font-semibold text-text">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 py-3 text-sm font-semibold text-text"
          >
            {theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
            {theme === "dark" ? "Claro" : "Oscuro"}
          </button>
          <a
            href="/menu"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
          >
            Ver menú
          </a>
        </div>
      </header>

      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar menú"
          />
          <div className="absolute left-0 top-0 h-full w-[86vw] max-w-[320px] border-r border-line bg-panel p-4 shadow-glow">
            {renderSidebar()}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[auto_minmax(0,1fr)]">
        <aside
          className={[
            "hidden h-[calc(100vh-120px)] sticky top-[96px] rounded-shell border border-line bg-panel p-4 xl:block",
            sidebarCollapsed ? "w-[88px]" : "w-[288px]"
          ].join(" ")}
        >
          {renderSidebar()}
        </aside>

        <main className="space-y-6">
          {section === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-text">Sucursales</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateBranch(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white"
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
                        className="rounded-card border border-line bg-surface px-4 py-4"
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
                                branch.isOpen ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                              ].join(" ")}
                            >
                              {branch.isOpen ? "Abierta" : "Cerrada"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminBranchId(branch.id);
                                setSection("business");
                              }}
                              className="min-h-11 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteBranch(branch.id)}
                              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-danger/30 px-4 py-3 text-sm font-semibold text-danger"
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
                    <h3 className="text-lg font-semibold text-text">Horarios</h3>
                    <div className="space-y-3">
                      {(branchEditor.weeklyHours || defaultSchedule()).map((item, index) => (
                        <div
                          key={`${item.day}-${index}`}
                          className="grid gap-3 rounded-card border border-line bg-surface p-4 md:grid-cols-[120px_1fr_140px_24px_140px]"
                        >
                          <label className="flex min-h-11 items-center gap-3 text-sm text-text">
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              onChange={(event) =>
                                setBranchEditor((current) =>
                                  current
                                    ? {
                                        ...current,
                                        weeklyHours: (current.weeklyHours || defaultSchedule()).map(
                                          (hourItem, hourIndex) =>
                                            hourIndex === index
                                              ? { ...hourItem, enabled: event.target.checked }
                                              : hourItem
                                        )
                                      }
                                    : current
                                )
                              }
                            />
                            {item.day}
                          </label>
                          <div className="hidden md:block" />
                          <input
                            type="time"
                            value={item.open}
                            disabled={!item.enabled}
                            onChange={(event) =>
                              setBranchEditor((current) =>
                                current
                                  ? {
                                      ...current,
                                      weeklyHours: (current.weeklyHours || defaultSchedule()).map(
                                        (hourItem, hourIndex) =>
                                          hourIndex === index
                                            ? { ...hourItem, open: event.target.value }
                                            : hourItem
                                      )
                                    }
                                  : current
                              )
                            }
                            className="min-h-11 rounded-card border border-line bg-panel px-4 py-3 text-sm text-text outline-none disabled:text-muted"
                          />
                          <div className="flex min-h-11 items-center justify-center text-sm text-muted">
                            a
                          </div>
                          <input
                            type="time"
                            value={item.close}
                            disabled={!item.enabled}
                            onChange={(event) =>
                              setBranchEditor((current) =>
                                current
                                  ? {
                                      ...current,
                                      weeklyHours: (current.weeklyHours || defaultSchedule()).map(
                                        (hourItem, hourIndex) =>
                                          hourIndex === index
                                            ? { ...hourItem, close: event.target.value }
                                            : hourItem
                                      )
                                    }
                                  : current
                              )
                            }
                            className="min-h-11 rounded-card border border-line bg-panel px-4 py-3 text-sm text-text outline-none disabled:text-muted"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingBranch}
                    className="min-h-11 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
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
              <OrderTracker orders={orders} />
            ) : (
              <section className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
                Selecciona una sucursal.
              </section>
            )
          )}
        </main>
      </div>

      {showCreateBranch && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="w-full max-w-xl rounded-shell border border-line bg-panel p-6 shadow-glow">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-text">Nueva sucursal</h2>
              <button
                type="button"
                onClick={() => setShowCreateBranch(false)}
                className="min-h-11 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
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
                className="min-h-11 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
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
