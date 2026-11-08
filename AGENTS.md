# AGENTS.md — Menulabarra

> Para cualquier IA o agente que trabaje en esta carpeta.
> **Contexto general de Arturo y de La Barra:** `/home/arturo/second-brain/AGENTS.md` (y `INDICE.md`).

## Regla obligatoria
Al terminar cualquier cambio o revisión aquí:
1. Agrega una entrada en la sección **Registro** de este archivo.
2. Agrega un resumen en `/home/arturo/second-brain/AGENTS.md` (sección 8).
3. Si tienes memoria propia, guárdalo ahí también.
Formato: `### AAAA-MM-DD · Qué se hizo — Agente` + qué se hizo, qué se aprendió y qué falta.

## Qué es
Menú digital de La Barra con pedidos, seguimiento, panel de admin y notificaciones push. Next.js 15 + React 19 + Tailwind + Firebase (proyecto `menulabarra`: `sucursales/*`, `orders`, `branding`). Desplegado en Vercel: https://menulabarra.vercel.app. Sucursales: La Barra (Linterna 10, Noria Alta), La Barra Presa, La Barra Salamanca (la maneja la mamá de Arturo).
- **Visión (Arturo, 2026-11-07):** se maneja aparte del Dashboard. A futuro, el menú absorberá lo mejor del Dashboard (ventas, cortes, métricas) para dejar de usar el Dashboard y quedarse solo con el menú, rediseñado con mejores ideas.

## Documentación existente
- `Markdown/arquitectura.md`, `Markdown/decisiones.md`, `Markdown/prelaunch-backlog.md`, `README.md`
- Revisión completa: `/home/arturo/second-brain/la-barra/SISTEMAS.md`

## Registro
### 2026-11-07 · Revisión + arreglo de reglas de Firestore — Claude
- Revisión de solo lectura (estado, seguridad, Admin SDK). Detalle en `second-brain/la-barra/SISTEMAS.md`.
- `firestore.rules`: se agregó `isAdmin()` (claim `role=="admin"` o `admin==true`, igual que `AppProviders.tsx`). Escritura y `list` de `orders` solo para admin; `get` de un pedido es público por su ID (para el seguimiento del cliente). Sin commit.
- Pendiente: desplegar las reglas; validar campos en `create` de `orders`; arreglar `FIREBASE_ADMIN_PRIVATE_KEY` en Vercel (JSON en base64); reescribir las descripciones genéricas de productos.

### 2026-11-07 · Reglas desplegadas — Claude
- Se instaló Firebase CLI en `~/.local/firebase-tools/node_modules/.bin/firebase` (sesión iniciada como la cuenta de Arturo). Se desplegó `firestore.rules` al proyecto `menulabarra`.
- Verificado: listar `orders` sin sesión da 403 y el menú (`sucursales`) sigue siendo público. Falta que Arturo pruebe el panel admin y el seguimiento de un pedido.

### 2026-11-07 · Aviso de privacidad, términos y consentimiento — Claude
- Nuevas páginas `/privacidad` (aviso integral conforme a la LFPDPPP: responsable, datos, finalidades, encargados [Firebase, Vercel, WhatsApp], conservación de 3 días, derechos ARCO por WhatsApp) y `/terminos` (pedidos, precios, pagos, cancelaciones, alérgenos, PROFECO). Los datos del responsable y `LEGAL_VERSION` están en `src/lib/legal.ts`.
- Checkout: casilla obligatoria "Acepto el Aviso de privacidad y los Términos". El pedido guarda `legalConsent: { version, acceptedAt }`.
- **Si cambias el aviso o los términos, sube `LEGAL_VERSION`.** Si cambia la retención (cron de 3 días en `src/lib/server/maintenance.ts`), actualiza el aviso.
- Pendiente: que un abogado lo revise; considerar exigir `legalConsent` en `firestore.rules` (create) cuando todos los clientes tengan la versión nueva; agregar un correo de contacto.

### 2026-11-07 · Modo oscuro sin parpadeo + barra del pedido con contraste — Claude
- Parpadeo blanco: `ThemeProvider` arrancaba en "light" y además sobrescribía el tema guardado antes de leerlo. Ahora un script en `<head>` (`src/lib/theme.ts`, `THEME_INIT_SCRIPT`) aplica el tema guardado (o el del sistema si no hay uno) antes de pintar, y el provider lee ese valor.
- Barra flotante del pedido activo: fondo `bg-brand` con texto `text-surface`, para que contraste en modo claro y oscuro.
- `sw.js`: el caché pasa a v5 para que las PWA instaladas tomen la versión nueva.
