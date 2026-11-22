import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
  type Firestore
} from "firebase/firestore";

import {
  FirestoreRepository,
  logListenError,
  type ListenError,
  type Unsubscribe
} from "@/infrastructure/firebase/FirestoreRepository";
import type { Category, ModifierTemplate, Product } from "@/types";

/** Catálogo de una sucursal: categorías, productos y plantillas de opciones. */
export class CatalogRepository extends FirestoreRepository {
  constructor(private readonly db: Firestore) {
    super();
  }

  private branchCollection(branchId: string, name: "categories" | "products" | "modifiers") {
    return collection(this.db, "sucursales", branchId, name);
  }

  subscribeCategories(branchId: string, callback: (categories: Category[]) => void, onError: ListenError = logListenError): Unsubscribe {
    return onSnapshot(this.branchCollection(branchId, "categories"), (snapshot) => {
      callback(this.sortBySortOrder(snapshot.docs.map((item) => this.toEntity<Category>(item))));
    }, onError);
  }

  /** Lectura única de las categorías de otra sucursal (para copiar productos). */
  async getCategories(branchId: string): Promise<Category[]> {
    const snapshot = await getDocs(this.branchCollection(branchId, "categories"));
    return this.sortBySortOrder(snapshot.docs.map((item) => this.toEntity<Category>(item)));
  }

  subscribeProducts(branchId: string, callback: (products: Product[]) => void, onError: ListenError = logListenError): Unsubscribe {
    return onSnapshot(this.branchCollection(branchId, "products"), (snapshot) => {
      callback(this.sortBySortOrder(snapshot.docs.map((item) => this.toEntity<Product>(item))));
    }, onError);
  }

  subscribeModifiers(branchId: string, callback: (modifiers: ModifierTemplate[]) => void, onError: ListenError = logListenError): Unsubscribe {
    const ref = query(this.branchCollection(branchId, "modifiers"), orderBy("name", "asc"));
    return onSnapshot(ref, (snapshot) => {
      callback(snapshot.docs.map((item) => this.toEntity<ModifierTemplate>(item)));
    }, onError);
  }

  /**
   * Guarda varios cambios de una sola vez (todo o nada). Evita que escrituras en paralelo
   * sobre el mismo producto se pisen entre sí.
   */
  async saveMany(changes: {
    categories?: Category[];
    products?: Product[];
    modifiers?: { branchId: string; template: ModifierTemplate }[];
    deleteProducts?: { branchId: string; productId: string }[];
  }) {
    const batch = writeBatch(this.db);
    changes.categories?.forEach((c) => batch.set(doc(this.branchCollection(c.sucursalID, "categories"), c.id), c, { merge: true }));
    changes.products?.forEach((p) => batch.set(doc(this.branchCollection(p.sucursalID, "products"), p.id), p, { merge: true }));
    changes.modifiers?.forEach(({ branchId, template }) =>
      batch.set(doc(this.branchCollection(branchId, "modifiers"), template.id), template, { merge: true })
    );
    changes.deleteProducts?.forEach(({ branchId, productId }) => batch.delete(doc(this.branchCollection(branchId, "products"), productId)));
    await batch.commit();
  }

  saveCategory(branchId: string, category: Category) {
    return setDoc(doc(this.branchCollection(branchId, "categories"), category.id), category, { merge: true });
  }

  deleteCategory(branchId: string, categoryId: string) {
    return deleteDoc(doc(this.branchCollection(branchId, "categories"), categoryId));
  }

  saveProduct(branchId: string, product: Product) {
    return setDoc(doc(this.branchCollection(branchId, "products"), product.id), product, { merge: true });
  }

  deleteProduct(branchId: string, productId: string) {
    return deleteDoc(doc(this.branchCollection(branchId, "products"), productId));
  }

  saveModifier(branchId: string, modifier: ModifierTemplate) {
    return setDoc(doc(this.branchCollection(branchId, "modifiers"), modifier.id), modifier, { merge: true });
  }

  deleteModifier(branchId: string, modifierId: string) {
    return deleteDoc(doc(this.branchCollection(branchId, "modifiers"), modifierId));
  }
}
