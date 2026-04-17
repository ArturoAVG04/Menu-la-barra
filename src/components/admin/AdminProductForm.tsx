"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Palette, Percent, Tag } from "lucide-react";

import { useAppState } from "@/components/providers/AppProviders";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import {
  saveBranding,
  saveBranch,
  saveCategory,
  saveProduct,
  subscribeBranding
} from "@/lib/services/menu";
import { uploadToImgBB } from "@/lib/services/imgbb";
import { currency } from "@/lib/utils";
import type { Branch, BrandingSettings, Category, Product } from "@/types";

const colorPresets = [
  { label: "Bosque suave", primaryRgb: "55 101 94", accentRgb: "180 140 92" },
  { label: "Océano humo", primaryRgb: "67 87 122", accentRgb: "132 161 178" },
  { label: "Arcilla cálida", primaryRgb: "141 94 76", accentRgb: "211 168 120" },
  { label: "Noche oliva", primaryRgb: "87 108 74", accentRgb: "193 177 120" }
] as const;

const initialProduct: Product = {
  id: "",
  sucursalID: "",
  categoryId: "",
  name: "",
  description: "",
  price: 0,
  salePrice: 0,
  discountPercent: 0,
  available: true,
  modifiers: []
};

export function AdminProductForm({
  branch,
  section,
  onNotify
}: {
  branch: Branch | null;
  section: "menu" | "themes";
  onNotify: (message: string) => void;
}) {
  const { branding, setBranding } = useAppState();
  const { categories, products } = useRealtimeMenu(branch?.id);
  const [product, setProduct] = useState<Product>(initialProduct);
  const [categoryName, setCategoryName] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingMenuCover, setIsUploadingMenuCover] = useState(false);

  useEffect(() => {
    setProduct(initialProduct);
    setCategoryName("");
  }, [branch?.id]);

  useEffect(() => {
    if (!branch) return;

    return subscribeBranding(branch.id, (settings) => {
      if (settings) {
        setBranding(settings);
      }
    });
  }, [branch?.id, setBranding]);

  const productCountByCategory = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      total: products.filter((productItem) => productItem.categoryId === category.id).length
    }));
  }, [categories, products]);

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

  async function handleSaveProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!branch) return;

    setIsSavingProduct(true);
    try {
      await saveProduct(branch.id, {
        ...product,
        id: product.id || crypto.randomUUID(),
        sucursalID: branch.id,
        salePrice: product.discountPercent
          ? Math.max(product.price - (product.price * product.discountPercent) / 100, 0)
          : undefined
      });
      setProduct(initialProduct);
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
      const updatedBranch: Branch =
        kind === "branch"
          ? { ...branch, coverImageUrl: imageUrl }
          : { ...branch, menuCoverImageUrl: imageUrl };

      await saveBranch(updatedBranch);
      onNotify(kind === "branch" ? "Portada de sucursal guardada" : "Portada de menú guardada");
    } finally {
      if (kind === "branch") setIsUploadingCover(false);
      if (kind === "menu") setIsUploadingMenuCover(false);
    }
  }

  function applyPreset(preset: BrandingSettings) {
    setBranding(preset);
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
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand">Temas</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Tema</h2>
          </div>

          <div className="grid gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset({ ...preset, shape: branding.shape })}
                className="flex items-center justify-between rounded-card border border-line bg-surface px-4 py-4 text-left transition hover:border-brand/50"
              >
                <div>
                  <p className="font-semibold text-text">{preset.label}</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className="h-8 w-8 rounded-full border border-white/30"
                    style={{ backgroundColor: `rgb(${preset.primaryRgb})` }}
                  />
                  <span
                    className="h-8 w-8 rounded-full border border-white/30"
                    style={{ backgroundColor: `rgb(${preset.accentRgb})` }}
                  />
                </div>
              </button>
            ))}
          </div>

          <label className="block space-y-2 text-sm text-text">
            <span>Forma de las tarjetas</span>
            <select
              value={branding.shape}
              onChange={(event) =>
                setBranding({
                  ...branding,
                  shape: event.target.value as "rounded" | "square"
                })
              }
              className="w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
            >
              <option value="rounded">Suave y redondeada</option>
              <option value="square">Recta y moderna</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => void handleSaveBranding()}
            disabled={isSavingBranding}
            className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          >
            {isSavingBranding ? "Guardando..." : "Guardar tema"}
          </button>
        </section>

        <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand/10 p-3 text-brand">
              <Palette size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand">Portadas</p>
              <h2 className="mt-1 text-2xl font-semibold text-text">Imágenes</h2>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-text">
            <ImagePlus size={18} className="text-brand" />
            <span>{isUploadingCover ? "Subiendo portada..." : "Subir portada de la sucursal"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleUploadCover(event.target.files?.[0], "branch")}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-text">
            <ImagePlus size={18} className="text-brand" />
            <span>{isUploadingMenuCover ? "Subiendo portada..." : "Subir portada general del menú"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleUploadCover(event.target.files?.[0], "menu")}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-text">Portada de sucursal</p>
              <p className="mt-2 text-sm text-muted break-all">
                {branch.coverImageUrl || "Sin imagen"}
              </p>
            </div>
            <div className="rounded-card border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-text">Portada del menú</p>
              <p className="mt-2 text-sm text-muted break-all">
                {branch.menuCoverImageUrl || "Sin imagen"}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <aside className="space-y-5 rounded-shell border border-line bg-panel p-6">
        <section className="space-y-4 rounded-card border border-line bg-surface p-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand">Categorías</p>
            <h2 className="mt-2 text-xl font-semibold text-text">Crear categoría</h2>
          </div>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <label className="block space-y-2 text-sm text-text">
              <span>Nombre</span>
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className="w-full rounded-card border border-line bg-panel px-4 py-3 outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={!categoryName.trim() || isSavingCategory}
              className="w-full rounded-full border border-brand px-5 py-3 text-sm font-semibold text-brand disabled:border-line disabled:text-muted"
            >
              {isSavingCategory ? "Creando..." : "Crear categoría"}
            </button>
          </form>
        </section>

        <section className="rounded-card border border-line bg-surface p-4">
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Estructura</p>
          <div className="mt-4 space-y-3">
            {productCountByCategory.length ? (
              productCountByCategory.map((category) => (
                <div key={category.id} className="rounded-card border border-line bg-panel px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-text">{category.name}</p>
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                      {category.total} productos
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Crea tu primera categoría para organizar el menú.</p>
            )}
          </div>
        </section>
      </aside>

      <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Menú</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Productos</h2>
        </div>

        <form onSubmit={handleSaveProduct} className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-text">
            <span>Nombre del producto</span>
            <input
              value={product.name}
              onChange={(event) => setProduct((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
            />
          </label>

          <label className="space-y-2 text-sm text-text">
            <span>Categoría</span>
            <select
              value={product.categoryId}
              onChange={(event) =>
                setProduct((current) => ({ ...current, categoryId: event.target.value }))
              }
              className="w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              className="w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
            />
          </label>

          <label className="space-y-2 text-sm text-text">
            <span>Descuento</span>
            <div className="relative">
              <Percent className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
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
                className="w-full rounded-card border border-line bg-surface px-10 py-3 outline-none"
              />
            </div>
          </label>

          <label className="space-y-2 text-sm text-text lg:col-span-2">
            <span>Personalizaciones</span>
            <textarea
              placeholder='[{"id":"extras","name":"Extras","type":"multiple","required":false,"options":[{"id":"queso","name":"Queso extra","priceDelta":20}]}]'
              value={JSON.stringify(product.modifiers)}
              onChange={(event) => {
                try {
                  setProduct((current) => ({
                    ...current,
                    modifiers: JSON.parse(event.target.value || "[]")
                  }));
                } catch {
                  return;
                }
              }}
              className="min-h-32 w-full rounded-card border border-line bg-surface px-4 py-3 font-mono text-xs outline-none"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-text lg:col-span-2">
            <ImagePlus size={18} className="text-brand" />
            <span>Subir imagen del producto</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const imageUrl = await uploadToImgBB(file);
                setProduct((current) => ({ ...current, imageUrl }));
              }}
            />
          </label>

          <label className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm text-text lg:col-span-2">
            <input
              type="checkbox"
              checked={product.available}
              onChange={(event) =>
                setProduct((current) => ({ ...current, available: event.target.checked }))
              }
            />
            Producto disponible
          </label>

          <div className="lg:col-span-2 flex flex-col gap-4 rounded-card border border-line bg-surface p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-2 font-semibold text-text">
                <Tag size={16} />
                Vista rápida
              </p>
              <p className="text-sm text-muted">
                Precio final:{" "}
                {product.discountPercent
                  ? currency(Math.max(product.price - (product.price * product.discountPercent) / 100, 0))
                  : currency(product.price || 0)}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingProduct || !product.name.trim() || !product.categoryId}
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
            >
              {isSavingProduct ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>

        <section className="rounded-card border border-line bg-surface p-4">
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Productos creados</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {products.length ? (
              products.map((item) => (
                <article key={item.id} className="rounded-card border border-line bg-panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-text">{item.name}</h3>
                      <p className="mt-1 text-sm text-muted">{item.description || "Sin descripción"}</p>
                    </div>
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                      {currency(item.salePrice || item.price)}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-muted">Aún no hay productos cargados en esta sucursal.</p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
