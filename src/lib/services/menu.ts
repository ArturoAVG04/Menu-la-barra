/**
 * @deprecated Fachada temporal mientras se migra a la arquitectura POO.
 * Usa `@/infrastructure` (branchRepository, catalogRepository, orderRepository, orderApi).
 * Se borrará cuando ningún componente la importe.
 */
import type { User } from "firebase/auth";

import { branchRepository, catalogRepository, orderApi, orderRepository } from "@/infrastructure";
import type { CreateOrderInput, OrderStatusUpdate } from "@/infrastructure";
import type { Branch, BrandingSettings, Category, ModifierTemplate, Order, Product } from "@/types";

export type { CreateOrderInput };

export const subscribeBranches = (cb: (b: Branch[]) => void) => branchRepository.subscribeAll(cb);
export const saveBranch = (branch: Branch) => branchRepository.save(branch);
export const deleteBranch = (id: string) => branchRepository.delete(id);
export const subscribeBranding = (id: string, cb: (s: BrandingSettings | null) => void) =>
  branchRepository.subscribeBranding(id, cb);
export const saveBranding = (id: string, s: BrandingSettings) => branchRepository.saveBranding(id, s);

export const subscribeCategories = (id: string, cb: (c: Category[]) => void) => catalogRepository.subscribeCategories(id, cb);
export const subscribeProducts = (id: string, cb: (p: Product[]) => void) => catalogRepository.subscribeProducts(id, cb);
export const subscribeModifiers = (id: string, cb: (m: ModifierTemplate[]) => void) => catalogRepository.subscribeModifiers(id, cb);
export const saveCategory = (id: string, c: Category) => catalogRepository.saveCategory(id, c);
export const deleteCategory = (id: string, cid: string) => catalogRepository.deleteCategory(id, cid);
export const saveProduct = (id: string, p: Product) => catalogRepository.saveProduct(id, p);
export const deleteProduct = (id: string, pid: string) => catalogRepository.deleteProduct(id, pid);
export const saveModifier = (id: string, m: ModifierTemplate) => catalogRepository.saveModifier(id, m);
export const deleteModifier = (id: string, mid: string) => catalogRepository.deleteModifier(id, mid);

export const subscribeOrders = (id: string, cb: (o: Order[]) => void) => orderRepository.subscribeByBranch(id, cb);
export const subscribeOrder = (id: string, cb: (o: Order | null) => void) => orderRepository.subscribe(id, cb);
export const deleteOrder = (id: string) => orderRepository.delete(id);

export const createOrder = (input: CreateOrderInput) => orderApi.create(input);
export const fetchTrackedOrder = (id: string, token: string) => orderApi.track(id, token);
export const updateOrderStatusFromAdmin = (user: User, id: string, update: OrderStatusUpdate) =>
  orderApi.updateStatusAsAdmin(user, id, update);
export const registerOrderNotificationToken = (orderId: string, branchId: string, token: string, trackingToken: string) =>
  orderApi.registerCustomerPushToken(orderId, branchId, token, trackingToken);
export const registerAdminNotificationToken = (user: User, token: string) => orderApi.registerAdminPushToken(user, token);
