"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Palette,
  Percent,
  Plus,
  Tag,
  Trash2,
  Edit2,
  Type
} from "lucide-react";

import { MenuCard } from "@/components/customer/MenuCard";
import { useAppState } from "@/components/providers/AppProviders";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import {
  saveBranding,
  saveBranch,
  saveCategory,
  saveModifier,
  saveProduct,
  deleteProduct,
  deleteModifier,
  subscribeBranding,
  deleteCategory,
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

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
};

const rgbToHex = (rgb: string) => {
  const parts = (rgb || "0 0 0").split(" ").map(Number);
  return "#" + parts.map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
};

const initialProduct: Product = {
  id: "",
  sucursalID: "",
  branchIds: [],
  categoryId: "",
  sortOrder: 0,
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
  sortOrder: 0,
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
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [modifierDraft, setModifierDraft] = useState<ModifierTemplate>(initialModifier);
  const [modifiers, setModifiers] = useState<ModifierTemplate[]>([]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingModifier, setIsSavingModifier] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingMenuCover, setIsUploadingMenuCover] = useState(false);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showModifierForm, setShowModifierForm] = useState(false);

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
      sortOrder: product.sortOrder || 0,
      name: product.name || "Nombre del producto",
      description: product.description || "La vista previa cambia mientras escribes.",
      price: product.price || 0,
      salePrice: product.discountPercent && product.discountPercent > 0
        ? Math.max(product.price - (product.price * product.discountPercent) / 100, 0)
        : product.price,
      available: product.available
    }),
    [branch?.id, product]
  );

  async function syncModifierInProducts(
    modifierId: string,
    transform: (product: Product) => Product
  ) {
    if (!branch) return;

    const affectedProducts = products.filter((item) =>
      item.modifiers.some((modifier) => modifier.id === modifierId)
    );

    await Promise.all(
      affectedProducts.map((item) => saveProduct(branch.id, transform(item)))
    );
  }

  async function clearDeletedCategoryFromProducts(categoryId: string) {
    if (!branch) return;

    const affectedProducts = products.filter((item) => item.categoryId === categoryId);

    await Promise.all(
      affectedProducts.map((item) =>
        saveProduct(branch.id, {
          ...item,
          categoryId: ""
        })
      )
    );
  }

  async function handleSaveCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!branch || !categoryName.trim()) return;

    setIsSavingCategory(true);
    try {
      const category: Category = {
        id: editingCategoryId || crypto.randomUUID(),
        sucursalID: branch.id,
        name: categoryName.trim(),
        sortOrder: editingCategoryId 
          ? (categories.find(c => c.id === editingCategoryId)?.sortOrder || 0)
          : categories.length + 1
      };
      await saveCategory(branch.id, category);
      setCategoryName("");
      setEditingCategoryId(null);
      setShowCategoryForm(false);
      if (!editingCategoryId) {
        setProduct((current) => ({ ...current, categoryId: category.id }));
      }
      onNotify("Categoría guardada");
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function moveCategory(categoryId: string, direction: "up" | "down") {
    if (!branch) return;

    const index = categories.findIndex((category) => category.id === categoryId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    await Promise.all(
      reordered.map((category, orderIndex) =>
        saveCategory(branch.id, { ...category, sortOrder: orderIndex + 1 })
      )
    );
    onNotify("Orden de categorías actualizado");
  }

  async function handleDeleteCategory(id: string) {
    if (!branch || !confirm("¿Eliminar categoría? Los productos asociados quedarán sin categoría.")) return;

    try {
      // Si la categoría que estamos borrando es la que está en el formulario, limpiamos el formulario
      if (editingCategoryId === id) {
        setEditingCategoryId(null);
        setCategoryName("");
        setShowCategoryForm(false);
      }
      // Si el producto que estamos editando pertenece a esta categoría, le quitamos la categoría
      if (product.categoryId === id) {
        setProduct((current) => ({ ...current, categoryId: "" }));
      }

      await clearDeletedCategoryFromProducts(id);
      await deleteCategory(branch.id, id);
      onNotify("Categoría eliminada");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      onNotify("Error al eliminar la categoría");
    }
  }

  async function handleDeleteModifier(id: string) {
    if (!branch || !confirm("¿Eliminar personalización?")) return;
    try {
      if (modifierDraft.id === id) {
        setModifierDraft({
          ...initialModifier,
          options: [{ id: crypto.randomUUID(), name: "", priceDelta: 0 }]
        });
      }
      await syncModifierInProducts(id, (item) => ({
        ...item,
        modifiers: item.modifiers.filter((modifier) => modifier.id !== id)
      }));
      await deleteModifier(branch.id, id);
      onNotify("Personalización eliminada");
    } catch (error) {
      onNotify("Error al eliminar personalización");
    }
  }

  async function moveModifier(modifierId: string, direction: "up" | "down") {
    if (!branch) return;

    const sortedModifiers = [...modifiers].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const index = sortedModifiers.findIndex((m) => m.id === modifierId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= sortedModifiers.length) return;

    const reordered = [...sortedModifiers];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    await Promise.all(
      reordered.map(async (mod, orderIndex) => {
        const updated = { ...mod, sortOrder: orderIndex + 1 };
        await saveModifier(branch.id, updated);
        await syncModifierInProducts(mod.id, (item) => ({
          ...item,
          modifiers: item.modifiers.map((m) => (m.id === mod.id ? updated : m))
        }));
      })
    );
    onNotify("Orden de personalizaciones actualizado");
  }

  async function handleSaveModifier(event: React.FormEvent) {
    event.preventDefault();
    if (!branch || !modifierDraft.name.trim()) return;

    setIsSavingModifier(true);
    try {
      const cleanModifier: ModifierTemplate = {
        ...modifierDraft,
        id: modifierDraft.id || crypto.randomUUID(),
        sortOrder: modifierDraft.id 
          ? (modifiers.find(m => m.id === modifierDraft.id)?.sortOrder || 0)
          : modifiers.length + 1,
        options: modifierDraft.options
          .filter((option) => option.name.trim())
          .map((option) => ({
            ...option,
            id: option.id || crypto.randomUUID()
          }))
      };

      await saveModifier(branch.id, cleanModifier);
      await syncModifierInProducts(cleanModifier.id, (item) => ({
        ...item,
        modifiers: item.modifiers.map((modifier) =>
          modifier.id === cleanModifier.id ? cleanModifier : modifier
        )
      }));
      setModifierDraft({
        ...initialModifier,
        id: "",
        options: [{ id: crypto.randomUUID(), name: "", priceDelta: 0 }]
      });
      setShowModifierForm(false);
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
      const currentCategoryProducts = products.filter(
        (item) => item.categoryId === product.categoryId && item.id !== product.id
      );
      const payload: Product = {
        ...product,
        id: product.id || crypto.randomUUID(),
        sucursalID: branch.id,
        branchIds: selectedBranchIds,
        sortOrder:
          typeof product.sortOrder === "number" && product.sortOrder > 0
            ? product.sortOrder
            : currentCategoryProducts.length + 1,
        salePrice: product.discountPercent && product.discountPercent > 0
          ? Math.max(product.price - (product.price * product.discountPercent) / 100, 0)
          : product.price
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
      setShowProductForm(false);
      onNotify("Producto guardado");
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function moveProduct(productId: string, direction: "up" | "down") {
    if (!branch) return;

    const currentProduct = products.find((item) => item.id === productId);
    if (!currentProduct) return;

    const categoryProducts = products.filter((item) => item.categoryId === currentProduct.categoryId);
    const index = categoryProducts.findIndex((item) => item.id === productId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= categoryProducts.length) return;

    const reordered = [...categoryProducts];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    await Promise.all(
      reordered.map((item, orderIndex) =>
        saveProduct(branch.id, {
          ...item,
          sortOrder: orderIndex + 1
        })
      )
    );
    onNotify("Orden de productos actualizado");
  }

  async function handleDeleteProduct(id: string) {
    if (!branch || !confirm("¿Eliminar producto?")) return;
    try {
      if (expandedProductId === id) {
        setShowProductForm(false);
        setExpandedProductId(null);
        setProduct({ ...initialProduct, branchIds: [branch.id] });
      }
      await deleteProduct(branch.id, id);
      onNotify("Producto eliminado");
    } catch (error) {
      onNotify("Error al eliminar el producto");
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

  async function handleUploadLogo(file?: File) {
    if (!branch || !file) return;
    setIsUploadingLogo(true);
    try {
      const imageUrl = await uploadToImgBB(file);
      const updatedBranding = { ...branding, logoUrl: imageUrl };
      setBranding(updatedBranding);
      await saveBranding(branch.id, updatedBranding);
      onNotify("Logotipo actualizado");
    } finally {
      setIsUploadingLogo(false);
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

  function loadProductIntoEditor(item: Product) {
    setProduct({
      ...item,
      branchIds: item.branchIds?.length ? item.branchIds : [item.sucursalID]
    });
    setExpandedProductId(item.id);
    setShowProductForm(true);
  }

  if (!branch) {
    return (
      <section className="rounded-shell border border-line bg-panel p-6 text-center text-sm text-muted">
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
          <h2 className="text-2xl font-semibold text-text">Personalización visual</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-medium text-text">Color principal</span>
            <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-2">
              <input
                type="color"
                value={rgbToHex(branding.primaryRgb || "55 101 94")}
                onChange={(e) => setBranding({ ...branding, primaryRgb: hexToRgb(e.target.value) })}
                className="h-10 w-10 cursor-pointer overflow-hidden rounded-md border-none bg-transparent"
              />
              <span className="text-xs font-mono text-muted uppercase">{rgbToHex(branding.primaryRgb || "55 101 94")}</span>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-text">Color de acento</span>
            <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-2">
              <input
                type="color"
                value={rgbToHex(branding.accentRgb || "180 140 92")}
                onChange={(e) => setBranding({ ...branding, accentRgb: hexToRgb(e.target.value) })}
                className="h-10 w-10 cursor-pointer overflow-hidden rounded-md border-none bg-transparent"
              />
              <span className="text-xs font-mono text-muted uppercase">{rgbToHex(branding.accentRgb || "180 140 92")}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm text-text">
            <span>Estilo de bordes</span>
            <select
              value={branding.shape}
              onChange={(event) => setBranding({ ...branding, shape: event.target.value as any })}
              className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
            >
              <option value="rounded">Suave (Redondeado)</option>
              <option value="square">Clásico (Recto)</option>
              <option value="pill">Moderno (Cápsula)</option>
            </select>
          </label>

          <label className="block space-y-2 text-sm text-text">
            <span>Tipografía</span>
            <div className="flex items-center gap-2 min-h-11 w-full rounded-card border border-line bg-surface px-4">
              <Type size={16} className="text-muted" />
              <select
                value={branding.fontFamily || "sans"}
                onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                className="flex-1 bg-transparent outline-none"
              >
                <option value="sans">Moderna (Sans-serif)</option>
                <option value="serif">Elegante (Serif)</option>
              </select>
            </div>
          </label>
        </div>

          <button
            type="button"
            onClick={() => void handleSaveBranding()}
            disabled={isSavingBranding}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          >
            {isSavingBranding ? "Guardando..." : "Guardar cambios"}
          </button>
        </section>

        <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
        <h2 className="text-2xl font-semibold text-text">Branding e Imágenes</h2>

        <label className="flex min-h-11 cursor-pointer items-center justify-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-text">
          <ImagePlus size={18} className="text-brand" />
          <span>{isUploadingLogo ? "Subiendo..." : "Subir Logotipo"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleUploadLogo(event.target.files?.[0])}
          />
        </label>

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
      <div className="flex flex-wrap gap-2">
        {[
          { id: "products", label: "PRODUCTOS" },
          { id: "categories", label: "CATEGORÍAS" },
          { id: "modifiers", label: "PERSONALIZACIONES" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMenuTab(tab.id as typeof menuTab);
              setShowProductForm(false);
              setShowCategoryForm(false);
              setShowModifierForm(false);
            }}
            className={[
              "inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition",
              menuTab === tab.id ? "bg-brand text-white" : "border border-line text-text"
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {menuTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-text">
              {showProductForm ? (expandedProductId ? "Editar producto" : "Nuevo producto") : "Productos"}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (showProductForm) {
                  setShowProductForm(false);
                  setExpandedProductId(null);
                  setProduct({ ...initialProduct, branchIds: [branch.id] });
                } else {
                  setShowProductForm(true);
                }
              }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              {showProductForm ? "Cerrar" : "+ Agregar"}
            </button>
          </div>

          {showProductForm ? (
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
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
                    <span>Prioridad en la categoría</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={product.sortOrder || ""}
                      onChange={(event) =>
                        setProduct((current) => ({
                          ...current,
                          sortOrder: Number(event.target.value) || 0
                        }))
                      }
                      className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                      placeholder="1"
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
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
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

                  <label className="flex min-h-11 cursor-pointer items-center justify-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-4 text-sm text-text lg:col-span-2">
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
                    <div className="lg:col-span-2 flex items-center gap-4 rounded-card border border-line bg-surface p-2">
                      <img src={product.imageUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                      <span className="text-xs text-muted truncate flex-1">
                        {product.imageUrl}
                      </span>
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
                    <div className="flex flex-wrap items-center gap-4">
                      <p className="inline-flex items-center gap-2 font-semibold text-text">
                        <Tag size={16} />
                        {product.discountPercent
                          ? currency(Math.max(product.price - (product.price * product.discountPercent) / 100, 0))
                          : currency(product.price || 0)}
                      </p>

                      {expandedProductId && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteProduct(expandedProductId)}
                          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-danger/30 px-4 text-xs font-bold text-danger transition hover:bg-danger/10"
                        >
                          <Trash2 size={14} />
                          Eliminar producto
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingProduct || !product.name.trim() || !product.categoryId}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
                    >
                      {isSavingProduct ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="space-y-4 rounded-shell border border-line bg-panel p-6">
                <h2 className="text-2xl font-semibold text-text">Vista previa</h2>
                <MenuCard product={previewProduct} onSelect={() => undefined} />
              </section>
            </div>
          ) : (
            <section className="rounded-shell border border-line bg-panel p-6">
              <div className="space-y-5">
                {categories.length ? (
                  categories.map((category) => {
                    const categoryProducts = products.filter((item) => item.categoryId === category.id);

                    if (!categoryProducts.length) return null;

                    return (
                      <div key={category.id} className="rounded-card border border-line bg-surface p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-text">{category.name}</p>
                            <p className="text-sm text-muted">Ordena cómo aparecerán en el menú</p>
                          </div>
                          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                            {categoryProducts.length} productos
                          </span>
                        </div>

                        <div className="space-y-3">
                          {categoryProducts.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex flex-col gap-3 rounded-card border border-line bg-panel px-4 py-4 md:flex-row md:items-center md:justify-between"
                            >
                              <button
                                type="button"
                                onClick={() => loadProductIntoEditor(item)}
                                className="flex min-w-0 flex-1 items-start text-left"
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-text">{item.name}</p>
                                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                                      #{item.sortOrder || index + 1}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-muted line-clamp-2">
                                    {item.description || "Sin descripción"}
                                  </p>
                                </div>
                              </button>

                              <div className="flex items-center justify-between gap-3 md:justify-end">
                                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                                  {currency(item.salePrice || item.price)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => void moveProduct(item.id, "up")}
                                    disabled={index === 0}
                                    className="rounded-full border border-line p-2 text-text disabled:text-muted disabled:opacity-50"
                                    title="Subir"
                                  >
                                    <ArrowUp size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void moveProduct(item.id, "down")}
                                    disabled={index === categoryProducts.length - 1}
                                    className="rounded-full border border-line p-2 text-text disabled:text-muted disabled:opacity-50"
                                    title="Bajar"
                                  >
                                    <ArrowDown size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteProduct(item.id)}
                                    className="rounded-full border border-line p-2 text-muted hover:text-danger"
                                    title="Eliminar producto"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full rounded-card border border-dashed border-line bg-surface p-12 text-center text-muted">
                    No hay productos en esta sucursal.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {menuTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-text">Categorías</h2>
            <button
              type="button"
              onClick={() => {
                if (showCategoryForm) {
                  setShowCategoryForm(false);
                  setEditingCategoryId(null);
                  setCategoryName("");
                } else {
                  setShowCategoryForm(true);
                }
              }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              {showCategoryForm ? "Cerrar" : "+ Agregar"}
            </button>
          </div>

          {showCategoryForm ? (
            <section className="max-w-xl space-y-4 rounded-shell border border-line bg-panel p-6">
              <h2 className="text-xl font-semibold text-text">
                {editingCategoryId ? "Editar categoría" : "Nueva categoría"}
              </h2>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <input
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none focus:border-brand"
                  placeholder="Nombre"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!categoryName.trim() || isSavingCategory}
                    className="inline-flex flex-1 min-h-[44px] items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line"
                  >
                    {isSavingCategory ? "Guardando..." : editingCategoryId ? "Actualizar" : "+ Agregar"}
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="rounded-shell border border-line bg-panel p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.length ? (
                  categories.map((category, index) => (
                    <div key={category.id} className="group rounded-card border border-line bg-surface px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-text">{category.name}</p>
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                            {products.filter((p) => p.categoryId === category.id).length} ítems
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => void moveCategory(category.id, "up")}
                            disabled={index === 0}
                            className="p-2 text-muted hover:text-brand disabled:opacity-50"
                            title="Subir"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void moveCategory(category.id, "down")}
                            disabled={index === categories.length - 1}
                            className="p-2 text-muted hover:text-brand disabled:opacity-50"
                            title="Bajar"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(category.id);
                              setCategoryName(category.name);
                              setShowCategoryForm(true);
                            }}
                            className="p-2 text-muted hover:text-brand"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteCategory(category.id)}
                            className="p-2 text-muted hover:text-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-card border border-dashed border-line bg-surface p-12 text-center text-muted">
                    Sin categorías.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {menuTab === "modifiers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-text">Personalizaciones</h2>
            <button
              type="button"
              onClick={() => {
                if (showModifierForm) {
                  setShowModifierForm(false);
                  setModifierDraft({
                    ...initialModifier,
                    id: "",
                    options: [{ id: crypto.randomUUID(), name: "", priceDelta: 0 }]
                  });
                } else {
                  setShowModifierForm(true);
                }
              }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              {showModifierForm ? "Cerrar" : "+ Agregar"}
            </button>
          </div>

          {showModifierForm ? (
            <section className="max-w-2xl space-y-4 rounded-shell border border-line bg-panel p-6">
              <h2 className="text-xl font-semibold text-text">
                {modifierDraft.id ? "Editar personalización" : "Nueva personalización"}
              </h2>
              <form onSubmit={handleSaveModifier} className="space-y-4">
                <input
                  value={modifierDraft.name}
                  onChange={(event) =>
                    setModifierDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                  placeholder="Nombre"
                />

                <label className="space-y-2 text-sm text-text">
                  <span>Prioridad</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={modifierDraft.sortOrder || ""}
                    onChange={(event) =>
                      setModifierDraft((current) => ({
                        ...current,
                        sortOrder: Number(event.target.value) || 0
                      }))
                    }
                    className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
                    placeholder="Ej: 1"
                  />
                </label>

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
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus size={16} />
                    Agregar opción
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingModifier || !modifierDraft.name.trim()}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
                >
                  {isSavingModifier ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </section>
          ) : (
            <section className="rounded-shell border border-line bg-panel p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {modifiers.length ? (
                  [...modifiers]
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((modifier, index, array) => (
                    <div key={modifier.id} className="group relative rounded-card border border-line bg-surface p-4 transition hover:border-brand/40">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text">{modifier.name} <span className="text-[10px] text-brand ml-1">#{modifier.sortOrder || index + 1}</span></p>
                          <p className="text-[10px] text-muted uppercase tracking-wider">{modifier.type === 'single' ? 'Única' : 'Múltiple'}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => void moveModifier(modifier.id, "up")}
                            disabled={index === 0}
                            className="p-1.5 text-muted hover:text-brand disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void moveModifier(modifier.id, "down")}
                            disabled={index === array.length - 1}
                            className="p-1.5 text-muted hover:text-brand disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModifierDraft(modifier);
                              setShowModifierForm(true);
                            }}
                            className="inline-flex items-center justify-center p-2 text-muted hover:text-brand"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteModifier(modifier.id)}
                            className="inline-flex items-center justify-center p-2 text-muted hover:text-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {modifier.options.map((option) => (
                          <div key={option.id} className="flex items-center justify-between gap-3 text-sm text-muted">
                            <span className="inline-flex items-center gap-2">
                              <Check size={14} />
                              {option.name}
                            </span>
                            <span className={option.priceDelta > 0 ? "text-text font-medium" : "text-success font-bold"}>
                              {option.priceDelta ? `+ ${currency(option.priceDelta)}` : "Gratis"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-card border border-dashed border-line bg-surface p-12 text-center text-muted">
                    No hay personalizaciones configuradas.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
