import { DomainError } from "@/domain/errors";

/** Datos de contacto del cliente, ya limpios y validados (objeto de valor inmutable). */
export class CustomerInfo {
  private constructor(
    public readonly name: string,
    public readonly phone: string,
    public readonly note: string
  ) {}

  static create(input: { name?: unknown; phone?: unknown; note?: unknown }) {
    const name = CustomerInfo.clean(input.name, 60);
    const phone = CustomerInfo.clean(input.phone, 20);
    const note = CustomerInfo.clean(input.note, 300);

    if (phone && !/^[+\d\s()-]{7,20}$/.test(phone)) {
      throw new DomainError("Revisa tu número de teléfono.", "INVALID_PHONE");
    }

    return new CustomerInfo(name, phone, note);
  }

  private static clean(value: unknown, maxLength: number) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  }
}
