import { describe, expect, it } from "vitest";

import { CustomerInfo } from "@/domain/order/CustomerInfo";

describe("CustomerInfo", () => {
  it("acepta 10 dígitos con espacios o lada +52", () => {
    expect(CustomerInfo.create({ name: "Ana", phone: "462 123 4567" }).phone).toBe("4621234567");
    expect(CustomerInfo.create({ name: "Ana", phone: "+52 462 123 4567" }).phone).toBe("4621234567");
    expect(CustomerInfo.create({ name: "Ana", phone: "5214621234567" }).phone).toBe("4621234567");
  });

  it("exige nombre y teléfono válido", () => {
    expect(() => CustomerInfo.create({ name: "", phone: "4621234567" })).toThrow("nombre");
    expect(() => CustomerInfo.create({ name: "Ana", phone: "" })).toThrow("10 dígitos");
    expect(() => CustomerInfo.create({ name: "Ana", phone: "12345" })).toThrow("10 dígitos");
  });

  it("problemWith devuelve el mensaje o null", () => {
    expect(CustomerInfo.problemWith({ name: "Ana", phone: "4621234567" })).toBeNull();
    expect(CustomerInfo.problemWith({ name: "Ana", phone: "1" })).toMatch(/teléfono/);
  });
});
