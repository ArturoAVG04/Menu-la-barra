import { describe, expect, it } from "vitest";

import { BranchDirectory } from "@/domain/branch/BranchDirectory";
import { OrderLifecycle } from "@/domain/order/OrderStatus";
import type { Branch } from "@/types";

describe("OrderLifecycle (vista del cliente)", () => {
  it("bloquea agregar productos con un pedido en cocina o rechazado", () => {
    expect(OrderLifecycle.blocksNewItems("preparing")).toBe(true);
    expect(OrderLifecycle.blocksNewItems("rejected")).toBe(true);
    expect(OrderLifecycle.blocksNewItems("new")).toBe(false);
    expect(OrderLifecycle.blocksNewItems("ready")).toBe(false);
  });

  it("sugiere el ticket por WhatsApp solo cuando el restaurante ya respondió", () => {
    expect(OrderLifecycle.suggestsWhatsappTicket("new")).toBe(false);
    expect(OrderLifecycle.suggestsWhatsappTicket("ready")).toBe(true);
  });

  it("marca los pasos alcanzados del seguimiento", () => {
    expect(OrderLifecycle.hasReachedStep("ready", "preparing")).toBe(true);
    expect(OrderLifecycle.hasReachedStep("ready", "delivered")).toBe(false);
    expect(OrderLifecycle.hasReachedStep("rejected", "new")).toBe(true);
    expect(OrderLifecycle.hasReachedStep("rejected", "preparing")).toBe(false);
  });

  it("calcula la cuenta regresiva solo en cocina", () => {
    const now = 1_000_000;
    expect(OrderLifecycle.countdownLabel({ status: "new", estimatedMinutes: 20 }, now)).toBeNull();
    expect(OrderLifecycle.countdownLabel({ status: "preparing", estimatedReadyAt: now + 90_000 }, now)).toBe(
      "Pedido listo en aproximadamente 2 min"
    );
    expect(OrderLifecycle.countdownLabel({ status: "preparing", estimatedReadyAt: now - 1 }, now)).toBe(
      "Pedido listo en cualquier momento"
    );
    expect(OrderLifecycle.countdownLabel({ status: "preparing", estimatedMinutes: 25 }, now)).toBe(
      "Pedido listo en aproximadamente 25 min"
    );
    expect(OrderLifecycle.countdownLabel({ status: "preparing" }, now)).toBeNull();
  });
});

describe("BranchDirectory", () => {
  const branch = (id: string, name: string, isPrimary = false) =>
    ({ id, name, isPrimary, slug: id, address: "", isOpen: true }) as Branch;

  it("pone la principal primero y luego ordena por nombre sin acentos", () => {
    const sorted = BranchDirectory.sortForPicker([branch("s", "Salamanca"), branch("p", "Presa"), branch("l", "Ágora", true)]);
    expect(sorted.map((item) => item.id)).toEqual(["l", "p", "s"]);
  });

  it("elige la principal por defecto, o la primera", () => {
    expect(BranchDirectory.preferred([branch("a", "A"), branch("b", "B", true)])?.id).toBe("b");
    expect(BranchDirectory.preferred([branch("a", "A")])?.id).toBe("a");
    expect(BranchDirectory.preferred([])).toBeNull();
  });
});
