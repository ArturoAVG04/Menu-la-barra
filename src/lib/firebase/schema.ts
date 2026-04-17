export const collections = {
  sucursales: "sucursales",
  orders: "orders",
  branding: "branding"
} as const;

export const schemaNotes = {
  sucursales: {
    description: "Coleccion raiz para cada sucursal",
    nested: ["categories", "products", "modifiers"]
  }
};

