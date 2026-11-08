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

### 2026-11-07 · Tema persistente, PWA admin separada y notificaciones push — Claude
- **Tema:** la hidratación de React borraba `data-theme` de `<html>` y el provider guardaba "light". Ahora `resolveInitialTheme()` lee localStorage o el sistema, y el script de `<head>` tiene un MutationObserver que vuelve a poner el atributo. Verificado con puppeteer: alternar el tema y recargar lo conserva.
- **Checkout:** la aceptación del aviso se guarda con los datos del cliente (`legalVersion`); solo vale si coincide con `LEGAL_VERSION`.
- **PWA admin:** `manifest-admin.json` con `scope: "/admin"`. El login se movió a `/admin/login` (`/login` redirige), para que la app admin no se salga de su scope. Íconos PNG: `public/icons/` para clientes (fondo blanco) y `public/icons/admin/` para el admin (fondo negro con "ADMIN"), más `badge-96.png`. El service worker está en v6.
- **Push del cliente:** el permiso se pide al tocar "Enviar pedido". El token se liga al pedido cuando hay permiso. `/api/orders/[id]/notifications` ahora exige `trackingToken`. Antes de esto no había ni un token registrado (había 14 pedidos).
- **Push del admin (nuevo):** el botón "Activar avisos" en el panel llama a `POST /api/admin/notification-token` (requiere `requireAdminUser`) y guarda el token en `adminNotificationTokens`. Al crear un pedido, el cliente llama a `POST /api/orders/[id]/created` con su `trackingToken`; el servidor avisa a todos los admins una sola vez (`adminNotifiedAt`). Al tocar la notificación se abre `/admin`.
- `.env.local`: `NEXT_PUBLIC_FIREBASE_VAPID_KEY` tiene por error la API key (39 caracteres). En Vercel sí está bien (87). Solo afecta las pruebas locales.
- Revisión general (pendientes priorizados) en `second-brain/la-barra/SISTEMAS.md`.

### 2026-11-07 · Precios calculados en el servidor + quitar IA + inicio de arquitectura POO — Claude
- **Nuevo `src/domain/`** (clases puras, sin Firebase): `DomainError`, `Modifier`, `MenuProduct`, `OrderPricing` y `CustomerInfo`. Tienen pruebas en `src/domain/order/OrderPricing.test.ts` (Vitest: `npm test`).
- **`POST /api/orders`**: `PlaceOrderService` (caso de uso con `OrderGateway` inyectado) + `FirestoreOrderGateway` (Admin SDK). Valida sucursal abierta, consentimiento, cliente y opciones, **recalcula precios con el menú real**, guarda el pedido y avisa al admin. El cliente solo manda ids, cantidades y opciones.
- `firestore.rules`: `orders` `create` solo para admin, porque los pedidos ya no se crean desde el navegador.
- Se quitó por completo la "IA" de descripciones (la ruta `generate-description`, el botón y el autollenado al salir del campo, que era el origen de las descripciones genéricas) y la ruta `/created` (el aviso al admin ahora va dentro de `PlaceOrderService`).
- Sin probar en producción la escritura real de un pedido (se bloqueó escribir en la base desde aquí). Las validaciones sí se probaron en local.

### 2026-11-07 · Dirección propia para el admin (2 PWA) — Claude
- Android no deja instalar la PWA del admin (`/admin`) dentro del scope de la del menú (`/`) en el mismo dominio. Solución: dominio aparte **https://labarra-admin.vercel.app** en el mismo proyecto de Vercel (agregado con Vercel CLI en `~/.local/vercel-cli`, sesión de `arturoavg04`; el proyecto quedó enlazado en `.vercel/`).
- `src/lib/hosts.ts` + `src/middleware.ts`: en el host del admin, `/` lleva a `/admin` y las rutas del cliente se mandan al menú. En el host del menú, `/admin` y `/login` se mandan al admin. `/api`, las páginas legales y los assets funcionan en ambos. Localhost y previews no redirigen.
- "Ver menú" en el admin apunta a `MENU_URL`.

### 2026-11-07 · Inicio del refactor POO (rama `refactor-poo`) — Claude
- Rama `refactor-poo` (push a origin): `src/domain/` (Cart, OrderLifecycle, BranchContact + los anteriores), `src/infrastructure/` (FirestoreRepository abstracta → BranchRepository, CatalogRepository, OrderRepository; OrderApiClient; instancias en `index.ts`). `lib/services/menu.ts` queda como fachada temporal. La guía está en `Markdown/arquitectura-poo.md`.
- Dos agentes en worktrees separados están dividiendo los componentes del cliente y del admin en `src/features/{customer,admin}/`. Después se integran en `refactor-poo` y se revisan con un preview de Vercel antes de pasar a `main`.

### 2026-11-07 · Notificaciones con Web Push estándar (sin SDK de Firebase en el navegador) — Claude
- En el celular de Arturo, `firebase/messaging` `isSupported()` daba false ("no compatible"). Ahora se usa el **Push API estándar + librería `web-push`** en el servidor (`src/lib/server/push/WebPushSender.ts`).
- Llaves VAPID: de `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`/`WEB_PUSH_PRIVATE_KEY` si existen; si no, el servidor las genera una vez y las guarda en Firestore `serverConfig/webPush` (las reglas no permiten leerlo desde el cliente). Pública en `GET /api/push/public-key`.
- El "token" que se guarda (`orderNotificationTokens`, `adminNotificationTokens`) es ahora la suscripción Web Push serializada en JSON; los ids de documento son el hash sha256. Las firmas de `requestPushToken` y de las rutas no cambiaron.
