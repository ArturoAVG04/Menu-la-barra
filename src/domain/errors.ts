/**
 * Error de dominio: una regla del negocio no se cumple (producto agotado, opción inválida, etc.).
 * Las rutas API lo convierten en un 400 con un mensaje que se le puede mostrar al cliente.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "DomainError";
  }
}
