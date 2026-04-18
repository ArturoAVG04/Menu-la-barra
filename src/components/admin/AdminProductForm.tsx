"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, Palette, Percent, Plus, Tag } from "lucide-react";

import { MenuCard } from "@/components/customer/MenuCard";
import { useAppState } from "@/components/providers/AppProviders";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import {
  saveBranding,
  saveBranch,
  saveCategory,
  saveModifier,
  saveProduct,
  subscribeBranding,
  subscribeModifiers
} from "@/lib/services/menu";
import { uploadToImgBB } from "@/lib/services/imgbb";
import { currency } from "@/lib/utils";
import type {
  Branch,
  BrandingSettings,
  Category,
  ModifierTemplate,
  Product
} from "@/types";

const colorPresets = [
  { label: "Bosque", primaryRgb: "55 101 94", accentRgb: "180 140 92" },
  { label: "Océano", primaryRgb: "67 87 122", accentRgb: "132 161 178" },
  { label: "Arcilla", primaryRgb: "141 94 76", accentRgb: "211 168 120" },
  { label: "Oliva", primaryRgb: "87 108 74", accentRgb: "193 177 120" }
] as const;

const initialProduct: Product = {
  id: "",
  sucursalID: "",
  branchIds: [],
  categoryId: "",
  name: "",
  description: "",
  price: 0,
  salePrice: 0,
  discountPercent: 0,
  available: true,
  modifiers: []
};

const initialModifier: ModifierTemplate = {
  id: "",
  name: "",
  type: "multiple",
  required: false,
  options: [{ id: crypto.randomUUID(), name: "", priceDelta: 0 }]
};

export function AdminProductForm({
  branch,
  allBranches,
  section,
  onNotify
}: {
  branch: Branch | null;
  allBranches: Branch[];
  section: "menu" | "themes";
  onNotify: (message: string) => void;
}) {
  const { branding, setBranding } = useAppState();
  const { categories, products } = useRealtimeMenu(branch?.id);
  const [menuTab, setMenuTab] = useState<"products" | "categories" | "modifiers">("products");
  const [product, setProduct] = useState<Product>(initialProduct);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [modifierDraft, setModifierDraft] = useState<ModifierTemplate>(initialModifier);
  const [modifiers, setModifiers] = useState<ModifierTemplate[]>([]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingModifier, setIsSavingModifier] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingMenuCover, setIsUploadingMenuCover] = useState(false);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);

  useEffect(() => {
    setProduct({
      ...initialProduct,
      branchIds: branch ? [branch.id] : []
    });
    setCategoryName("");
    setExpandedProductId(null);
  }, [branch?.id]);

  useEffect(() => {
    if (!branch) return;

    const unsubscribeBranding = subscribeBranding(branch.id, (settings) => {
      if (settings) setBranding(settings);
    });
    const unsubscribeModifiers = subscribeModifiers(branch.id, setModifiers);

    return () => {
      unsubscribeBranding();
      unsubscribeModifiers();
    };
  }, [branch?.id, setBranding]);

  const selectedModifierIds = useMemo(
    () => new Set(product.modifiers.map((modifier) => modifier.id)),
    [product.modifiers]
  );

  const previewProduct = useMemo<Product>(
    () => ({
      ...product,
      id: product.id || "preview",
      sucursalID: branch?.id || "",
      name: product.name || "Nombre del producto",
      description: product.description || "La vista previa cambia mientras escribes.",
      price: product.price || 0,
      salePrice: product.discountPercent
        ? Math.max(product.price - (product.price * product.discountPercent) / 100, 0)
        : undefined,
      available: product.available
    }),
    [branch?.id, product]
  );

  async function handleCreateCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!branch || !categoryName.trim()) return;

    setIsSavingCategory(true);
    try {
      const category: Category = {
        id: crypto.randomUUID(),
        sucursalID: branch.id,
        name: categoryName.trim(),
        sortOrder: categories.length + 1
      };
      await saveCategory(branch.id, category);
      setCategoryName("");
      setProduct((current) => ({ ...current, categoryId: category.id }));
      onNotify("Categoría guardada");
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleSaveModifier(event: React.FormEvent) {
    event.preventDefault();
    if (!branch || !modifierDraft.name.trim()) return;

    setIsSavingModifier(true);
    try {
      const cleanModifier: ModifierTemplate = {
        ...modifierDraft,
        id: modifierDraft.id || crypto.randomUUID(),
        options: modifierDraft.options
          .filter((option) => option.name.trim())
          .map((option) => ({
            ...option,
            id: option.id || crypto.randomUUID()
          }))
      };

      await saveModifier(branch.id, cleanModifier);
      setModifierDraft({
        ...initialModifier,
        id: "",
        options: [{ id: crypto.randomUUID(), name: "", priceDelta: 0 }]
      });
      onNotify("Personalización guardada");
    } finally {
      setIsSavingModifier(false);
    }
  }

  async function handleSaveProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!branch || !product.name.trim() || !product.categoryId) return;

    const selectedBranchIds = product.branchIds?.length ? product.branchIds : [branch.id];

    setIsSavingProduct(true);
    try {
      const payload: Product = {
        ...product,
        id: product.id || crypto.randomUUID(),
        sucursalID: branch.id,
        branchIds: selectedBranchIds,
        salePrice: product.discountPercent
          ? Math.max(product.price - (product.price * product.discountPercent) / 100, 0)
          : undefined
      };

      await Promise.all(
        selectedBranchIds.map((branchId) =>
          saveProduct(branchId, {
            ...payload,
            sucursalID: branchId
          })
        )
      );

      setProduct({
        ...initialProduct,
        branchIds: [branch.id]
      });
      setExpandedProductId(null);
      onNotify("Producto guardado");
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleSaveBranding() {
    if (!branch) return;
    setIsSavingBranding(true);
    try {
      await saveBranding(branch.id, branding);
      onNotify("Tema guardado");
    } finally {
      setIsSavingBranding(false);
    }
  }

  async function handleUploadCover(file?: File, kind: "branch" | "menu" = "branch") {
    if (!branch || !file) return;

    if (kind === "branch") setIsUploadingCover(true);
    if (kind === "menu") setIsUploadingMenuCover(true);

    try {
      const imageUrl = await uploadToImgBB(file);
      const updatedBranch =
        kind === "branch"
          ? { ...branch, coverImageUrl: imageUrl }
          : { ...branch, menuCoverImageUrl: imageUrl };
      await saveBranch(updatedBranch);
      onNotify(kind === "branch" ? "Portada guardada" : "Portada del menú guardada");
    } finally {
      if (kind === "branch") setIsUploadingCover(false);
      if (kind === "menu") setIsUploadingMenuCover(false);
    }
  }

  function applyPreset(preset: BrandingSettings) {
    setBranding(preset);
  }

  function loadProductIntoEditor(item: Product) {
    setProduct({
      ...item,
      branchIds: item.branchIds?.length ? item.branchIds : [item.sucursalID]
    });
    setExpandedProductId(item.id);
  }

  if (!branch) {
    return (
      <section className="rounded-shell border border-line bg-panel p-6 text-sm text-muted">
        Selecciona una sucursal.
      </section>
    );
  }

  if (section === "themes") {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand/10 p-3 text-brand">
              <Palette size={18} />
            </div>
            <h2 className="text-2xl font-semibold text-text">Tema</h2>
          </div>

          <div className="grid gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset({ ...preset, shape: branding.shape })}
                className="flex min-h-11 items-center justify-between rounded-card border border-line bg-surface px-4 py-4 text-left transition hover:border-brand/50"
              >
                <span className="font-semibold text-text">{preset.label}</span>
                <span className="flex gap-2">
                  <span
                    className="h-8 w-8 rounded-full border border-white/30"
                    style={{ backgroundColor: `rgb(${preset.primaryRgb})` }}
                  />
                  <span
                    className="h-8 w-8 rounded-full border border-white/30"
                    style={{ backgroundColor: `rgb(${preset.accentRgb})` }}
                  />
                </span>
              </button>
            ))}
          </div>

          <label className="block space-y-2 text-sm text-text">
            <span>Forma</span>
            <select
              value={branding.shape}
              onChange={(event) =>
                setBranding({
                  ...branding,
                  shape: event.target.value as "rounded" | "square"
                })
              }
              className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
            >
              <option value="rounded">Redondeada</option>
              <option value="square">Recta</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => void handleSaveBranding()}
            disabled={isSavingBranding}
            className="min-h-11 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          >
            {isSavingBranding ? "Guardando..." : "Guardar cambios"}
          </button>
        </section>

        <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
          <h2 className="text-2xl font-semibold text-text">Portadas</h2>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-text">
            <ImagePlus size={18} className="text-brand" />
            <span>{isUploadingCover ? "Subiendo..." : "Portada sucursal"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleUploadCover(event.target.files?.[0], "branch")}
            />
          </label>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-text">
            <ImagePlus size={18} className="text-brand" />
            <span>{isUploadingMenuCover ? "Subiendo..." : "Portada menú"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleUploadCover(event.target.files?.[0], "menu")}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
              {branch.coverImageUrl || "Sin imagen"}
            </div>
            <div className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
              {branch.menuCoverImageUrl || "Sin imagen"}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {[
          { id: "products", label: "PRODUCTOS" },
          { id: "categories", label: "CATEGORÍAS" },
          { id: "modifiers", label: "PERSONALIZACIONES" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMenuTab(tab.id as typeof menuTab)}
            className={[
              "min-h-11 rounded-full px-4 py-3 text-sm font-semibold transition",
              menuTab === tab.id ? "bg-brand text-white" : "border border-line text-text"
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {menuTab === "products" && (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-text">Producto</h2>
              {expandedProductId && (
                <button
                  type="button"
                  onClick={() =>
                    setProduct({
                      ...initialProduct,
                      branchIds: [branch.id]
                    })
                  }
                  className="min-h-11 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
                >
                  Nuevo
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-text">
                <span>Nombre</span>
                <input
                  value={product.name}
                  onChange={(event) => setProduct((current) => ({ ...current, name: event.target.value }))}
                  className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm text-text">
                <span>Categoría</span>
                <select
                  value={product.categoryId}
                  onChange={(event) =>
                    setProduct((current) => ({ ...current, categoryId: event.target.value }))
                  }
                  className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                >
                  <option value="">Selecciona</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-text">
                <span>Precio base</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={(event) =>
                    setProduct((current) => ({ ...current, price: Number(event.target.value) }))
                  }
                  className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm text-text">
                <span>Descuento</span>
                <div className="relative">
                  <Percent
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={product.discountPercent || 0}
                    onChange={(event) =>
                      setProduct((current) => ({
                        ...current,
                        discountPercent: Number(event.target.value)
                      }))
                    }
                    className="min-h-11 w-full rounded-card border border-line bg-surface px-10 py-3 outline-none"
                  />
                </div>
              </label>

              <label className="space-y-2 text-sm text-text lg:col-span-2">
                <span>Descripción</span>
                <textarea
                  value={product.description}
                  onChange={(event) =>
                    setProduct((current) => ({ ...current, description: event.target.value }))
                  }
                  className="min-h-28 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                />
              </label>

              <div className="space-y-2 text-sm text-text lg:col-span-2">
                <span>Sucursales</span>
                <div className="grid gap-3 md:grid-cols-2">
                  {allBranches.map((item) => {
                    const checked = product.branchIds?.includes(item.id) ?? false;
                    return (
                      <label
                        key={item.id}
                        className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setProduct((current) => ({
                              ...current,
                              branchIds: event.target.checked
                                ? [...new Set([...(current.branchIds || []), item.id])]
                                : (current.branchIds || []).filter((branchId) => branchId !== item.id)
                            }))
                          }
                        />
                        {item.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 text-sm text-text lg:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <span>Personalizaciones</span>
                  <button
                    type="button"
                    onClick={() => setMenuTab("modifiers")}
                    className="min-h-11 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
                  >
                    Crear nueva
                  </button>
                </div>
                <div className="grid gap-3">
                  {modifiers.length ? (
                    modifiers.map((modifier) => {
                      const checked = selectedModifierIds.has(modifier.id);
                      return (
                        <label
                          key={modifier.id}
                          className="flex min-h-11 items-start gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              setProduct((current) => ({
                                ...current,
                                modifiers: event.target.checked
                                  ? [...current.modifiers, modifier]
                                  : current.modifiers.filter((item) => item.id !== modifier.id)
                              }))
                            }
                          />
                          <div>
                            <p className="font-semibold text-text">{modifier.name}</p>
                            <p className="text-muted">{modifier.options.length} opciones</p>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="rounded-card border border-dashed border-line bg-surface p-4 text-sm text-muted">
                      Sin personalizaciones.
                    </div>
                  )}
                </div>
              </div>

              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-text lg:col-span-2">
                <ImagePlus size={18} className="text-brand" />
                <span>{isUploadingProductImage ? "Subiendo..." : "Imagen"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setIsUploadingProductImage(true);
                    try {
                      const imageUrl = await uploadToImgBB(file);
                      setProduct((current) => ({ ...current, imageUrl }));
                    } finally {
                      setIsUploadingProductImage(false);
                    }
                  }}
                />
              </label>

              {product.imageUrl && (
                <div className="lg:col-span-2 rounded-card border border-line bg-surface p-4 text-sm text-muted">
                  {product.imageUrl}
                </div>
              )}

              <label className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text lg:col-span-2">
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={(event) =>
                    setProduct((current) => ({ ...current, available: event.target.checked }))
                  }
                />
                Disponible
              </label>

              <div className="lg:col-span-2 flex flex-col gap-4 rounded-card border border-line bg-surface p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="inline-flex items-center gap-2 font-semibold text-text">
                    <Tag size={16} />
                    {product.discountPercent
                      ? currency(Math.max(product.price - (product.price * product.discountPercent) / 100, 0))
                      : currency(product.price || 0)}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProduct || !product.name.trim() || !product.categoryId}
                  className="min-h-11 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
                >
                  {isSavingProduct ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>

          <div className="space-y-6">
            <section className="space-y-4 rounded-shell border border-line bg-panel p-6">
              <h2 className="text-2xl font-semibold text-text">Vista previa</h2>
              <MenuCard product={previewProduct} onSelect={() => undefined} />
            </section>

            <section className="space-y-4 rounded-shell border border-line bg-panel p-6">
              <h2 className="text-2xl font-semibold text-text">Productos</h2>
              <div className="space-y-3">
                {products.length ? (
                  products.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => loadProductIntoEditor(item)}
                      className={[
                        "block w-full rounded-card border px-4 py-4 text-left transition",
                        expandedProductId === item.id
                          ? "border-brand bg-brand/10"
                          : "border-line bg-surface hover:border-brand/40"
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text">{item.name}</p>
                          <p className="mt-1 text-sm text-muted">{item.description || "Sin descripción"}</p>
                        </div>
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                          {currency(item.salePrice || item.price)}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-card border border-dashed border-line bg-surface p-4 text-sm text-muted">
                    Sin productos.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {menuTab === "categories" && (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-4 rounded-shell border border-line bg-panel p-6">
            <h2 className="text-2xl font-semibold text-text">Nueva categoría</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                placeholder="Nombre"
              />
              <button
                type="submit"
                disabled={!categoryName.trim() || isSavingCategory}
                className="min-h-11 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
              >
                {isSavingCategory ? "Guardando..." : "+ Nueva categoría"}
              </button>
            </form>
          </section>

          <section className="space-y-4 rounded-shell border border-line bg-panel p-6">
            <h2 className="text-2xl font-semibold text-text">Categorías</h2>
            <div className="space-y-3">
              {categories.length ? (
                categories.map((category) => (
                  <div key={category.id} className="rounded-card border border-line bg-surface px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-text">{category.name}</p>
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                        {products.filter((productItem) => productItem.categoryId === category.id).length}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-card border border-dashed border-line bg-surface p-4 text-sm text-muted">
                  Sin categorías.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {menuTab === "modifiers" && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-4 rounded-shell border border-line bg-panel p-6">
            <h2 className="text-2xl font-semibold text-text">Nueva personalización</h2>

            <form onSubmit={handleSaveModifier} className="space-y-4">
              <input
                value={modifierDraft.name}
                onChange={(event) =>
                  setModifierDraft((current) => ({ ...current, name: event.target.value }))
                }
                className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                placeholder="Nombre"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={modifierDraft.type}
                  onChange={(event) =>
                    setModifierDraft((current) => ({
                      ...current,
                      type: event.target.value as ModifierTemplate["type"]
                    }))
                  }
                  className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                >
                  <option value="multiple">Múltiple</option>
                  <option value="single">Única</option>
                </select>

                <label className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={modifierDraft.required}
                    onChange={(event) =>
                      setModifierDraft((current) => ({
                        ...current,
                        required: event.target.checked
                      }))
                    }
                  />
                  Obligatoria
                </label>
              </div>

              <div className="space-y-3">
                {modifierDraft.options.map((option, index) => (
                  <div key={option.id} className="grid gap-3 md:grid-cols-[1fr_160px]">
                    <input
                      value={option.name}
                      onChange={(event) =>
                        setModifierDraft((current) => ({
                          ...current,
                          options: current.options.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, name: event.target.value } : item
                          )
                        }))
                      }
                      className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                      placeholder="Opción"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={option.priceDelta}
                      onChange={(event) =>
                        setModifierDraft((current) => ({
                          ...current,
                          options: current.options.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, priceDelta: Number(event.target.value) }
                              : item
                          )
                        }))
                      }
                      className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
                      placeholder="Precio"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setModifierDraft((current) => ({
                    ...current,
                    options: [
                      ...current.options,
                      { id: crypto.randomUUID(), name: "", priceDelta: 0 }
                    ]
                  }))
                }
                className="min-h-11 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} />
                  Agregar opción
                </span>
              </button>

              <button
                type="submit"
                disabled={isSavingModifier || !modifierDraft.name.trim()}
                className="min-h-11 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
              >
                {isSavingModifier ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </section>

          <section className="space-y-4 rounded-shell border border-line bg-panel p-6">
            <h2 className="text-2xl font-semibold text-text">Personalizaciones</h2>
            <div className="space-y-3">
              {modifiers.length ? (
                modifiers.map((modifier) => (
                  <div key={modifier.id} className="rounded-card border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-text">{modifier.name}</p>
                      {modifier.required && (
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                          Requerida
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      {modifier.options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between gap-3 text-sm text-muted">
                          <span className="inline-flex items-center gap-2">
                            <Check size={14} />
                            {option.name}
                          </span>
                          <span>{option.priceDelta ? currency(option.priceDelta) : "Gratis"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-card border border-dashed border-line bg-surface p-4 text-sm text-muted">
                  Sin personalizaciones.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
