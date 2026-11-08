import { randomUUID } from "node:crypto";

import { DomainError } from "@/domain/errors";
import { CustomerInfo } from "@/domain/order/CustomerInfo";
import { OrderPricing, type OrderLineRequest } from "@/domain/order/OrderPricing";
import { isBranchOpenAt } from "@/lib/branchHours";
import type { Branch, Product } from "@/types";

export type PlaceOrderRequest = {
  branchId: string;
  items: OrderLineRequest[];
  customerName?: string;
  customerPhone?: string;
  orderNote?: string;
  tipPercent?: number;
  legalConsent?: { version?: string };
};

/** Lo que el servicio necesita del mundo exterior (Firestore, push). Se inyecta para poder probarlo. */
export interface OrderGateway {
  findBranch(branchId: string): Promise<Branch | null>;
  findProducts(branchId: string): Promise<Product[]>;
  saveOrder(order: Record<string, unknown>): Promise<string>;
  notifyAdmins(orderId: string, trackingToken: string): Promise<void>;
}

/**
 * Caso de uso "hacer un pedido": valida sucursal, cliente y consentimiento,
 * recalcula precios con el menú real y guarda el pedido.
 */
export class PlaceOrderService {
  constructor(
    private readonly gateway: OrderGateway,
    private readonly legalVersion: string,
    private readonly now: () => Date = () => new Date()
  ) {}

  async execute(request: PlaceOrderRequest) {
    if (!request?.branchId || typeof request.branchId !== "string") {
      throw new DomainError("Elige una sucursal.", "BRANCH_REQUIRED");
    }
    if (request.legalConsent?.version !== this.legalVersion) {
      throw new DomainError("Acepta el aviso de privacidad para enviar tu pedido.", "LEGAL_CONSENT_REQUIRED");
    }

    const branch = await this.gateway.findBranch(request.branchId);
    if (!branch) {
      throw new DomainError("La sucursal no existe.", "BRANCH_NOT_FOUND");
    }
    if (!isBranchOpenAt(branch, this.now())) {
      throw new DomainError("La sucursal está cerrada en este momento.", "BRANCH_CLOSED");
    }

    const customer = CustomerInfo.create({
      name: request.customerName,
      phone: request.customerPhone,
      note: request.orderNote
    });
    const pricing = new OrderPricing(await this.gateway.findProducts(branch.id));
    const priced = pricing.price(request.items, request.tipPercent ?? 0);

    const timestamp = this.now().getTime();
    const trackingToken = `${randomUUID()}${randomUUID().replaceAll("-", "")}`;

    const orderId = await this.gateway.saveOrder({
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

    // El aviso al admin no debe tumbar el pedido si falla
    await this.gateway.notifyAdmins(orderId, trackingToken).catch((error) => {
      console.error("No se pudo avisar al admin:", error);
    });

    return { id: orderId, trackingToken, total: priced.total };
  }
}
