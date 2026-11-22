import { DomainError } from "@/domain/errors";

/** Datos de contacto del cliente, ya limpios y validados (objeto de valor inmutable). */
export class CustomerInfo {
  private constructor(
    public readonly name: string,
    public readonly phone: string,
    public readonly note: string
  ) {}

  /** Nombre (mín. 2 letras) y teléfono de 10 dígitos son obligatorios. */
  static create(input: { name?: unknown; phone?: unknown; note?: unknown }) {
    const name = CustomerInfo.clean(input.name, 60);
    const phone = CustomerInfo.normalizePhone(CustomerInfo.clean(input.phone, 20));
    const note = CustomerInfo.clean(input.note, 300);

    if (name.length < 2) {
      throw new DomainError("Escribe tu nombre.", "NAME_REQUIRED");
    }
    if (!phone) {
      throw new DomainError("Escribe un teléfono de 10 dígitos.", "INVALID_PHONE");
    }

    return new CustomerInfo(name, phone, note);
  }

  /** Mensaje de error para mostrar antes de enviar, o null si los datos sirven. */
  static problemWith(input: { name?: unknown; phone?: unknown }) {
    try {
      CustomerInfo.create(input);
      return null;
    } catch (error) {
      return error instanceof DomainError ? error.message : "Revisa tus datos.";
    }
  }

  /** Deja solo los 10 dígitos de un número de México (quita +52 / 521). O "" si no es válido. */
  static normalizePhone(value: string) {
    const digits = value.replace(/\D/g, "");
    let local = digits;
    if (digits.length === 12 && digits.startsWith("52")) local = digits.slice(2);
    if (digits.length === 13 && digits.startsWith("521")) local = digits.slice(3);
    return /^\d{10}$/.test(local) ? local : "";
  }

  private static clean(value: unknown, maxLength: number) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  }
}
