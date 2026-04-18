import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type {
  BrandingSettings,
  Branch,
  CartItem,
  Category,
  ModifierTemplate,
  Order,
  Product
} from "@/types";

export function subscribeBranches(callback: (branches: Branch[]) => void) {
  return onSnapshot(collection(db, "sucursales"), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Branch)));
  });
}

export function subscribeCategories(
  branchId: string,
  callback: (categories: Category[]) => void
) {
  const ref = query(
    collection(db, "sucursales", branchId, "categories"),
    orderBy("sortOrder", "asc")
  );
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Category)));
  });
}

export function subscribeProducts(
  branchId: string,
  callback: (products: Product[]) => void
) {
  const ref = query(collection(db, "sucursales", branchId, "products"), orderBy("name", "asc"));
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Product)));
  });
}

export function subscribeModifiers(
  branchId: string,
  callback: (modifiers: ModifierTemplate[]) => void
) {
  const ref = query(collection(db, "sucursales", branchId, "modifiers"), orderBy("name", "asc"));
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as ModifierTemplate)));
  });
}

export function subscribeOrders(branchId: string, callback: (orders: Order[]) => void) {
  const ref = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(ref, (snapshot) => {
    const scoped = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as Order))
      .filter((order) => order.sucursalID === branchId);

    callback(scoped);
  });
}

export async function createOrder(branchId: string, items: CartItem[], customerName: string) {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return addDoc(collection(db, "orders"), {
    sucursalID: branchId,
    items,
    total,
    customerName,
    status: "new",
    createdAt: Date.now(),
    serverCreatedAt: serverTimestamp()
  });
}

export async function saveProduct(branchId: string, product: Product) {
  const ref = doc(db, "sucursales", branchId, "products", product.id);
  return setDoc(ref, product, { merge: true });
}

export async function saveBranch(branch: Branch) {
  return setDoc(
    doc(db, "sucursales", branch.id),
    {
      ...branch
    },
    { merge: true }
  );
}

export async function deleteBranch(branchId: string) {
  return deleteDoc(doc(db, "sucursales", branchId));
}

export async function saveCategory(branchId: string, category: Category) {
  return setDoc(doc(db, "sucursales", branchId, "categories", category.id), category, {
    merge: true
  });
}

export async function saveModifier(branchId: string, modifier: ModifierTemplate) {
  return setDoc(doc(db, "sucursales", branchId, "modifiers", modifier.id), modifier, {
    merge: true
  });
}

export function subscribeBranding(
  branchId: string,
  callback: (settings: BrandingSettings | null) => void
) {
  return onSnapshot(doc(db, "branding", branchId), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as BrandingSettings) : null);
  });
}

export async function saveBranding(branchId: string, settings: BrandingSettings) {
  return setDoc(doc(db, "branding", branchId), settings, { merge: true });
}
