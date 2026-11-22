import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_HOST, ADMIN_URL, LINK_HOST, MENU_HOST, MENU_URL } from "@/lib/hosts";

// Rutas que funcionan igual en ambas direcciones (legales, assets, API).
const SHARED_PREFIXES = ["/api", "/privacidad", "/terminos", "/manifest", "/icons", "/icon.svg", "/sw.js"];

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname, search } = request.nextUrl;

  // Dirección de ligas editables: "/" usa el enlace "emprende"; "/otro" usa el enlace "otro".
  if (host === LINK_HOST && !pathname.startsWith("/ir/")) {
    const slug = pathname.split("/")[1] || "emprende";
    return NextResponse.rewrite(new URL(`/ir/${slug}`, request.url));
  }

  if (SHARED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Dirección del admin: la raíz abre el panel y el menú de clientes vive en la otra dirección.
  if (host === ADMIN_HOST) {
    if (pathname === "/") return NextResponse.redirect(new URL("/admin", request.url));
    if (!pathname.startsWith("/admin")) return NextResponse.redirect(`${MENU_URL}${pathname}${search}`);
    return NextResponse.next();
  }

  // Dirección del menú: el panel se abre en su propia dirección (otra app instalable).
  if (host === MENU_HOST && (pathname.startsWith("/admin") || pathname === "/login")) {
    const target = pathname === "/login" ? "/admin/login" : pathname;
    return NextResponse.redirect(`${ADMIN_URL}${target}${search}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
