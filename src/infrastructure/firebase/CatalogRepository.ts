import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Firestore
} from "firebase/firestore";

import { FirestoreRepository, type Unsubscribe } from "@/infrastructure/firebase/FirestoreRepository";
import type { Category, ModifierTemplate, Product } from "@/types";

/** Catálogo de una sucursal: categorías, productos y plantillas de opciones. */
export class CatalogRepository extends FirestoreRepository {
  constructor(private readonly db: Firestore) {
    super();
  }

  private branchCollection(branchId: string, name: "categories" | "products" | "modifiers") {
    return collection(this.db, "sucursales", branchId, name);
  }

  subscribeCategories(branchId: string, callback: (categories: Category[]) => void): Unsubscribe {
    return onSnapshot(this.branchCollection(branchId, "categories"), (snapshot) => {
      callback(this.sortBySortOrder(snapshot.docs.map((item) => this.toEntity<Category>(item))));
    });
  }

  subscribeProducts(branchId: string, callback: (products: Product[]) => void): Unsubscribe {
    return onSnapshot(this.branchCollection(branchId, "products"), (snapshot) => {
      callback(this.sortBySortOrder(snapshot.docs.map((item) => this.toEntity<Product>(item))));
    });
  }

  subscribeModifiers(branchId: string, callback: (modifiers: ModifierTemplate[]) => void): Unsubscribe {
    const ref = query(this.branchCollection(branchId, "modifiers"), orderBy("name", "asc"));
    return onSnapshot(ref, (snapshot) => {
      callback(snapshot.docs.map((item) => this.toEntity<ModifierTemplate>(item)));
    });
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
