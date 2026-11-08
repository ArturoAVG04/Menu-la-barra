// Dos direcciones del mismo proyecto para poder instalar DOS apps (PWA) separadas:
// Android no deja instalar una app dentro del alcance (scope) de otra del mismo dominio.
export const MENU_HOST = "menulabarra.vercel.app";
export const ADMIN_HOST = "labarra-admin.vercel.app";
export const MENU_URL = `https://${MENU_HOST}`;
export const ADMIN_URL = `https://${ADMIN_HOST}`;
