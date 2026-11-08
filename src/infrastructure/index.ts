import { db } from "@/lib/firebase/config";
import { OrderApiClient } from "@/infrastructure/api/OrderApiClient";
import { BranchRepository } from "@/infrastructure/firebase/BranchRepository";
import { CatalogRepository } from "@/infrastructure/firebase/CatalogRepository";
import { OrderRepository } from "@/infrastructure/firebase/OrderRepository";

/**
 * Punto único donde se crean los repositorios (instancias compartidas).
 * Los componentes importan desde aquí y no saben si los datos vienen de Firestore o de la API.
 */
export const branchRepository = new BranchRepository(db);
export const catalogRepository = new CatalogRepository(db);
export const orderRepository = new OrderRepository(db);
export const orderApi = new OrderApiClient();

export type { CreateOrderInput, OrderStatusUpdate } from "@/infrastructure/api/OrderApiClient";
