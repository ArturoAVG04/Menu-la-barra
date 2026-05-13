import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "@/lib/firebase/config";
import type {
  BrandingSettings,
  Branch,
  CartItem,
  Category,
  ModifierTemplate,
  Order,
  OrderStatus,
  PublicTrackedOrder,
  Product
} from "@/types";

function sortBySortOrder<T extends { sortOrder?: number; name?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const left = typeof a.sortOrder === "number" ? a.sortOrder : Number.MAX_SAFE_INTEGER;
    const right = typeof b.sortOrder === "number" ? b.sortOrder : Number.MAX_SAFE_INTEGER;

    if (left !== right) return left - right;
    return (a.name ?? "").localeCompare(b.name ?? "", "es", { sensitivity: "base" });
  });
}

export function subscribeBranches(callback: (branches: Branch[]) => void) {
  return onSnapshot(collection(db, "sucursales"), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Branch)));
  });
}

export function subscribeCategories(
  branchId: string,
  callback: (categories: Category[]) => void
) {
  const ref = collection(db, "sucursales", branchId, "categories");
  return onSnapshot(ref, (snapshot) => {
    callback(
      sortBySortOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Category)))
    );
  });
}

export function subscribeProducts(
  branchId: string,
  callback: (products: Product[]) => void
) {
  const ref = collection(db, "sucursales", branchId, "products");
  return onSnapshot(ref, (snapshot) => {
    callback(
      sortBySortOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Product)))
    );
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
  const ref = query(collection(db, "orders"), where("sucursalID", "==", branchId));
  return onSnapshot(ref, (snapshot) => {
    callback(
      snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() } as Order))
        .sort((a, b) => b.createdAt - a.createdAt)
    );
  });
}

export function subscribeOrder(orderId: string, callback: (order: Order | null) => void) {
  return onSnapshot(doc(db, "orders", orderId), (snapshot) => {
    callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Order) : null);
  });
}

function createTrackingToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
  }

  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function normalizeCartItems(items: CartItem[]) {
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    ...(typeof item.basePrice === "number" ? { basePrice: item.basePrice } : {}),
    ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
    ...(item.note ? { note: item.note } : {}),
    selectedModifiers: item.selectedModifiers.map((modifier) => ({
      modifierId: modifier.modifierId,
      optionIds: modifier.optionIds,
      ...(modifier.modifierName ? { modifierName: modifier.modifierName } : {}),
      ...(modifier.optionNames?.length ? { optionNames: modifier.optionNames } : {}),
      ...(typeof modifier.priceDelta === "number" ? { priceDelta: modifier.priceDelta } : {})
    }))
  }));
}

export async function createOrder(
  branchId: string,
  items: CartItem[],
  customerName: string,
  customerPhone: string,
  orderNote: string,
  tipPercent: number,
  tipAmount: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal + tipAmount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const trackingToken = createTrackingToken();

  const reference = await addDoc(collection(db, "orders"), {
    sucursalID: branchId,
    items: normalizeCartItems(items),
    itemCount,
    subtotal,
    tipPercent,
    tipAmount,
    total,
    customerName,
    customerPhone,
    ...(orderNote ? { orderNote } : {}),
    status: "new",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverCreatedAt: serverTimestamp(),
    trackingToken
  });

  return {
    id: reference.id,
    trackingToken
  };
}

export async function updateOrderStatus(
  orderId: string,
  payload: {
    status: OrderStatus;
    estimatedMinutes?: number;
    estimatedReadyAt?: number;
    statusMessage?: string;
  }
) {
  return updateDoc(doc(db, "orders", orderId), {
    status: payload.status,
    updatedAt: Date.now(),
    ...(typeof payload.estimatedMinutes === "number"
      ? { estimatedMinutes: payload.estimatedMinutes }
      : {}),
    ...(typeof payload.estimatedReadyAt === "number"
      ? { estimatedReadyAt: payload.estimatedReadyAt }
      : {}),
    ...(payload.statusMessage ? { statusMessage: payload.statusMessage } : {})
  });
}

export async function updateOrderStatusFromAdmin(
  currentUser: User,
  orderId: string,
  payload: {
    status: OrderStatus;
    estimatedMinutes?: number;
    estimatedReadyAt?: number;
    statusMessage?: string;
  }
) {
  const token = await currentUser.getIdToken();
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "No se pudo actualizar el pedido");
  }
}

export async function registerOrderNotificationToken(
  orderId: string,
  branchId: string,
  token: string
) {
  const response = await fetch(`/api/orders/${orderId}/notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token,
      branchId
    })
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "No se pudo registrar el token de notificaciones");
  }
}

export async function fetchTrackedOrder(orderId: string, trackingToken: string) {
  const search = new URLSearchParams({ token: trackingToken });
  const response = await fetch(`/api/orders/${orderId}/track?${search.toString()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "No se pudo consultar el pedido");
  }

  return (await response.json()) as PublicTrackedOrder;
}

export async function deleteOrder(orderId: string) {
  return deleteDoc(doc(db, "orders", orderId));
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

export async function deleteProduct(branchId: string, productId: string) {
  return deleteDoc(doc(db, "sucursales", branchId, "products", productId));
}

export async function deleteCategory(branchId: string, categoryId: string) {
  return deleteDoc(doc(db, "sucursales", branchId, "categories", categoryId));
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

export async function deleteModifier(branchId: string, modifierId: string) {
  return deleteDoc(doc(db, "sucursales", branchId, "modifiers", modifierId));
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
