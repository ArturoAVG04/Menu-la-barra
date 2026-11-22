import { BranchDirectory } from "@/domain/branch/BranchDirectory";
import { MenuCatalog } from "@/domain/menu/MenuCatalog";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { Branch, Category, Product } from "@/types";

export type PublicMenuSection = { id: string; name: string; items: { id: string; name: string; price: number }[] };

/** Menú de la sucursal por defecto para el HTML del servidor (SEO). Si falla, devuelve []. */
export async function getPublicMenu(): Promise<PublicMenuSection[]> {
  if (!isFirebaseAdminConfigured()) return [];
  try {
    const db = adminDb();
    const branchSnap = await db.collection("sucursales").get();
    const branches = branchSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Branch);
    const branch = BranchDirectory.preferred(branches);
    if (!branch) return [];

    const base = db.collection("sucursales").doc(branch.id);
    const [catSnap, prodSnap] = await Promise.all([base.collection("categories").get(), base.collection("products").get()]);
    const categories = catSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Category)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const products = prodSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Product)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const catalog = new MenuCatalog(categories, products, true);
    return catalog
      .sectionsFor(catalog.search(""))
      .map(({ category, products: list }) => ({
        id: category.id,
        name: category.name,
        items: list
          .filter((p) => p.name && Number.isFinite(Number(p.salePrice ?? p.price)))
          .map((p) => ({ id: p.id, name: p.name, price: Number(p.salePrice ?? p.price) }))
      }))
      .filter((section) => section.items.length > 0);
  } catch (error) {
    console.error("Menú público (SEO):", error);
    return [];
  }
}
