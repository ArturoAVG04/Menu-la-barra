import { randomUUID } from "node:crypto";

import { DomainError } from "@/domain/errors";
import { CustomerInfo } from "@/domain/order/CustomerInfo";
import { OrderPricing, type OrderLineRequest } from "@/domain/order/OrderPricing";
import { isBranchOpenAt } from "@/lib/branchHours";
import type { Branch, Product } from "@/types";

export type PlaceOrderRequest = {
  branchId: string;
  /** Id generado en el navegador; si se reintenta, se devuelve el mismo pedido. */
  clientOrderId?: string;
  items: OrderLineRequest[];
  customerName?: string;
  customerPhone?: string;
  orderNote?: string;
  tipPercent?: number;
  legalConsent?: { version?: string };
};

/** Lo que se le regresa al cliente (también al reintentar). */
export type ExistingOrder = { id: string; trackingToken: string; subtotal: number; tipAmount: number; total: number };

/** Lo que el servicio necesita del mundo exterior (Firestore, push). Se inyecta para poder probarlo. */
export interface OrderGateway {
  findBranch(branchId: string): Promise<Branch | null>;
  findProducts(branchId: string): Promise<Product[]>;
  findOrder(orderId: string): Promise<ExistingOrder | null>;
  /** Guarda con ese id; devuelve false si ya existía. */
  saveOrder(orderId: string, order: Record<string, unknown>): Promise<boolean>;
  /** true si este cliente (IP) aún puede pedir. */
  allowOrderFrom(clientKey: string, now: number): Promise<boolean>;
  notifyAdmins(orderId: string, trackingToken: string): Promise<void>;
}

const CLIENT_ORDER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Caso de uso "hacer un pedido": valida sucursal, cliente y consentimiento,
 * recalcula precios con el menú real y guarda el pedido (una sola vez por `clientOrderId`).
 */
export class PlaceOrderService {
  constructor(
    private readonly gateway: OrderGateway,
    private readonly legalVersion: string,
    private readonly now: () => Date = () => new Date()
  ) {}

  async execute(request: PlaceOrderRequest, clientKey = "unknown"): Promise<ExistingOrder> {
    this.validateBasics(request);
    const orderId = PlaceOrderService.orderIdFrom(request.clientOrderId);

    // Reintento del mismo pedido: se devuelve el que ya existe.
    const existing = await this.gateway.findOrder(orderId);
    if (existing) return existing;

    const branch = await this.openBranch(request.branchId);
    const customer = CustomerInfo.create({
      name: request.customerName,
      phone: request.customerPhone,
      note: request.orderNote
    });
    const pricing = new OrderPricing(await this.gateway.findProducts(branch.id));
    const priced = pricing.price(request.items, request.tipPercent ?? 0);

    const timestamp = this.now().getTime();
    if (!(await this.gateway.allowOrderFrom(clientKey, timestamp))) {
      throw new DomainError("Hiciste varios pedidos seguidos. Espera unos minutos.", "RATE_LIMITED");
    }

    const trackingToken = `${randomUUID()}${randomUUID().replaceAll("-", "")}`;
    const created = await this.gateway.saveOrder(orderId, {
      sucursalID: branch.id,
      ...priced,
      customerName: customer.name,
      customerPhone: customer.phone,
      ...(customer.note ? { orderNote: customer.note } : {}),
      status: "new",
      legalConsent: { version: this.legalVersion, acceptedAt: timestamp },
      createdAt: timestamp,
      updatedAt: timestamp,
      trackingToken
    });
    if (!created) {
      const duplicate = await this.gateway.findOrder(orderId);
      if (duplicate) return duplicate;
    }

    // El aviso al admin no debe tumbar el pedido si falla
    await this.gateway.notifyAdmins(orderId, trackingToken).catch((error) => {
      console.error("No se pudo avisar al admin:", error);
    });

    return { id: orderId, trackingToken, subtotal: priced.subtotal, tipAmount: priced.tipAmount, total: priced.total };
  }

  /** Usa el id del navegador si es un UUID válido; si no viene (versión vieja), crea uno. */
  static orderIdFrom(clientOrderId: unknown) {
    if (clientOrderId === undefined || clientOrderId === null || clientOrderId === "") return randomUUID();
    if (typeof clientOrderId !== "string" || !CLIENT_ORDER_ID.test(clientOrderId)) {
      throw new DomainError("Pedido inválido. Recarga la página.", "INVALID_ORDER_ID");
    }
    return clientOrderId.toLowerCase();
  }

  private validateBasics(request: PlaceOrderRequest) {
    if (!request?.branchId || typeof request.branchId !== "string") {
      throw new DomainError("Elige una sucursal.", "BRANCH_REQUIRED");
    }
    if (request.legalConsent?.version !== this.legalVersion) {
      throw new DomainError("Acepta el aviso de privacidad para enviar tu pedido.", "LEGAL_CONSENT_REQUIRED");
    }
  }

  private async openBranch(branchId: string) {
    const branch = await this.gateway.findBranch(branchId);
    if (!branch) {
      throw new DomainError("La sucursal no existe.", "BRANCH_NOT_FOUND");
    }
    if (!isBranchOpenAt(branch, this.now())) {
      throw new DomainError("La sucursal está cerrada en este momento.", "BRANCH_CLOSED");
    }
    return branch;
  }
}
