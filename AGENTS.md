# AGENTS.md — Menulabarra

> Para cualquier IA o agente que trabaje en esta carpeta.
> **Contexto general de Arturo y de La Barra:** `/home/arturo/second-brain/AGENTS.md` (y `INDICE.md`).

## Regla obligatoria
Al terminar cualquier cambio o revisión aquí:
1. Agrega una entrada en la sección **Registro** de este archivo.
2. Agrega un resumen al final de `/home/arturo/second-brain/log.md`.
3. Si tienes memoria propia, guárdalo ahí también.
Formato: `### AAAA-MM-DD · Qué se hizo — Agente` + qué se hizo, qué se aprendió y qué falta.

## Qué es
Menú digital de La Barra con pedidos, seguimiento, panel de admin y notificaciones push. Next.js 15 + React 19 + Tailwind + Firebase (proyecto `menulabarra`: `sucursales/*`, `orders`, `branding`). Desplegado en Vercel: https://menulabarra.vercel.app. Sucursales: La Barra (Linterna 10, Noria Alta), La Barra Presa, La Barra Salamanca (la maneja la mamá de Arturo).
- **Visión (Arturo, 2026-11-07):** se maneja aparte del Dashboard. A futuro, el menú absorberá lo mejor del Dashboard (ventas, cortes, métricas) para dejar de usar el Dashboard y quedarse solo con el menú, rediseñado con mejores ideas.

## Documentación existente
- `Markdown/arquitectura.md`, `Markdown/decisiones.md`, `Markdown/prelaunch-backlog.md`, `README.md`
- Revisión completa: `/home/arturo/second-brain/04-software/SISTEMAS.md`

## Registro
### 2026-11-22 · SEO para Google — Claude
- `page.tsx` (ISR `revalidate = 3600`) ahora pinta en el servidor `MenuIntro`: un solo `<h1>`, intro (qué es La Barra, dónde, horario) y lista visible de categorías y productos con precio de la sucursal principal (`src/lib/server/publicMenu.ts`, firebase-admin; si falla devuelve vacío). El h1 de `BranchHero` pasó a `h2` para no duplicar. JSON-LD `Restaurant` en `src/lib/seo.ts` (sin calle; solo Guanajuato/Gto./MX; Instagram en `sameAs`, falta URL de Facebook).
- Metadata con plantilla y canonical por página (layout ya no fija canonical). `opengraph-image.tsx` y `twitter-image.tsx` (PNG 1200x630 vía `src/lib/ogImage.tsx`), `favicon.ico`, `not-found.tsx` en español, `robots.ts`, `sitemap.ts` (/, /privacidad, /terminos).
- `middleware.ts`: robots.txt/sitemap/favicon/og pasan en ambos hosts; admin y emprende-hoy responden `X-Robots-Tag: noindex` y su robots.txt es `Disallow: /`. `/admin` tiene `robots: noindex`.
- Pendiente (Arturo): agregar la propiedad en Search Console y enviar el sitemap; poner la URL de Facebook en `sameAs`; enlazar el sitio desde el Perfil de Negocio.

### 2026-11-21 · Cliente: arreglos de bugs, privacidad y abuso de pedidos — Claude (worktree)
- Horario nocturno (`branchHours`): sábado 01:00 ya cuenta el turno del viernes aunque el sábado también tenga turno. Pruebas en `src/lib/branchHours.test.ts`.
- Privacidad: el cliente ya no lee `orders/{id}` en Firestore; consulta `/api/orders/[id]/track` cada 10 s (pausa con la pestaña oculta). La ruta ya no devuelve teléfono ni token. `firestore.rules`: `get` de `orders` solo admin (**falta desplegar las reglas**).
- `/api/orders`: límite de 5 pedidos / 10 min por IP (colección `rateLimits`, doc = sha256(IP), 429); nombre y teléfono de 10 dígitos obligatorios (`CustomerInfo`, se quitó "Pedir sin datos"); `clientOrderId` (UUID guardado en `la-barra-pending-order`) es el id del documento: un reintento devuelve el mismo pedido. La respuesta trae `subtotal`, `tipAmount` y `total`.
- Carrito: precios al día con el menú (`Cart.repriced`), "Ya no disponible" bloquea el envío, máximo 50 por línea, líneas guardadas inválidas se descartan. No se puede mandar otro pedido con uno en curso. Ticket de WhatsApp con número de pedido y total del servidor.
- Propina empieza en 0 % y máximo 30 % (también en el servidor). Enlaces "Aviso de privacidad · Términos" al final del menú. Accesibilidad: modales con `role="dialog"` y Escape, etiquetas en los campos.
- Hidratación (#418): `AppProviders` se dividió en `useBranchSelection`, `useBranchBranding`, `useAuthRole` y lee el localStorage después de montar (layout effect). Si la sucursal guardada ya no existe, usa la preferida. `CustomerApp` se dividió (`CustomerOverlays`, `useCheckout`, `useCustomerPanels`, `useCustomerCart`).
- Pendiente: desplegar `firestore.rules`; opcional TTL de Firestore sobre `rateLimits.expiresAt`.

### 2026-11-07 · Revisión + arreglo de reglas de Firestore — Claude
- Revisión de solo lectura (estado, seguridad, Admin SDK). Detalle en `second-brain/04-software/SISTEMAS.md`.
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
- Revisión general (pendientes priorizados) en `second-brain/04-software/SISTEMAS.md`.

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

### 2026-11-07 · Cliente refactorizado a POO (rama de worktree sobre `refactor-poo`) — Claude
- `CustomerShell.tsx` (1860 líneas) se dividió en `src/features/customer/`: `CustomerApp.tsx` (contenedor), 10 hooks y 21 componentes pequeños. `src/app/page.tsx` usa `CustomerApp`. Se borró `BranchSelector.tsx` (no se usaba).
- El carrito salió de `AppProviders` (ahora `useCart` con la clase `Cart`); el contexto del admin no cambió.
- Dominio nuevo con pruebas: `ProductSelection`, `MenuCatalog`, `BranchDirectory`, métodos de cliente en `OrderLifecycle`. Infraestructura: `LocalJsonStore<T>`.
- **Ojo:** `tailwind.config.ts` ahora escanea `src/features/**`; sin eso se pierden estilos.
- Verificado con puppeteer: editor y carrito idénticos píxel por píxel al original. El error de hidratación #418 ya existía antes.

### 2026-11-07 · Admin refactorizado a POO (rama refactor-poo) — Claude
- `AdminShell` (1140 líneas), `AdminProductForm` (1570) y `OrderTracker` (540) se dividieron en `src/features/admin/` (layout, orders, branches, menu/{products,categories,modifiers}, branding, images, hooks). Ningún archivo pasa de ~170 líneas. `AdminLogin` y `ProtectedAdmin` también se movieron ahí.
- Hooks con una responsabilidad: `useAdminOrders`, `useAdminPush`, `useBranchEditor`, `useBranchManager`, `useProductCatalog`, `useProductEditor`/`useCategoryEditor`/`useModifierEditor`, `useBrandingEditor`, `useImageUpload`, `useImageLibrary`, etc. Todo usa `@/infrastructure`.
- Dominio nuevo con pruebas: `ProductDraft`, `ModifierDraft`, `SortOrder` (`domain/admin`), `OrderBoard`, `OrderStatusChange` (`domain/order`), `BranchFactory` (`domain/branch`), `RgbColor` (`domain/branding`).
- Misma apariencia y flujos. Falta: migrar `useRealtimeMenu` (compartido con el cliente) a `@/infrastructure`.
### 2026-11-07 · Inicio del refactor POO (rama `refactor-poo`) — Claude
- Rama `refactor-poo` (push a origin): `src/domain/` (Cart, OrderLifecycle, BranchContact + los anteriores), `src/infrastructure/` (FirestoreRepository abstracta → BranchRepository, CatalogRepository, OrderRepository; OrderApiClient; instancias en `index.ts`). `lib/services/menu.ts` queda como fachada temporal. La guía está en `Markdown/arquitectura-poo.md`.
- Dos agentes en worktrees separados están dividiendo los componentes del cliente y del admin en `src/features/{customer,admin}/`. Después se integran en `refactor-poo` y se revisan con un preview de Vercel antes de pasar a `main`.

### 2026-11-07 · Notificaciones con Web Push estándar (sin SDK de Firebase en el navegador) — Claude
- En el celular de Arturo, `firebase/messaging` `isSupported()` daba false ("no compatible"). Ahora se usa el **Push API estándar + librería `web-push`** en el servidor (`src/lib/server/push/WebPushSender.ts`).
- Llaves VAPID: de `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`/`WEB_PUSH_PRIVATE_KEY` si existen; si no, el servidor las genera una vez y las guarda en Firestore `serverConfig/webPush` (las reglas no permiten leerlo desde el cliente). Pública en `GET /api/push/public-key`.
- El "token" que se guarda (`orderNotificationTokens`, `adminNotificationTokens`) es ahora la suscripción Web Push serializada en JSON; los ids de documento son el hash sha256. Las firmas de `requestPushToken` y de las rutas no cambiaron.

### 2026-11-07 · Integración del refactor POO — Claude
- Se integraron en `refactor-poo` las ramas de los agentes del cliente (`src/features/customer/`, CustomerApp + 10 hooks + 21 componentes) y del admin (`src/features/admin/`, 57 archivos, 11 hooks), más `main` (Web Push).
- Se migró `useRealtimeMenu` a `catalogRepository` y se **borró la fachada `lib/services/menu.ts`**. 56 pruebas pasan, tsc y build sin errores, y menú y login del admin renderizan sin errores de consola.
- Pendiente antes de pasar a `main`: que Arturo pruebe el preview de Vercel (pedido completo, admin con sesión, edición de productos).

### 2026-11-07 · Refactor POO en producción + botón "Probar aviso" — Claude
- `refactor-poo` se fusionó a `main` (tag de respaldo `antes-refactor-poo`). Producción verificada: menú y admin cargan sin errores.
- Avisos del admin: con puppeteer se comprobó la cadena completa (servidor → FCM 201 → el SW del dominio admin muestra la notificación). En el celular de Arturo no aparecen, así que lo más probable es el permiso a nivel Android de la WebAPK "La Barra Admin" o la batería.
- Nuevo `POST /api/admin/push-test` y botón **"Probar aviso"** (`useAdminPush.test`): primero lanza una notificación local (si no aparece, el sistema la bloquea) y luego una real vía servidor; dice a cuántos dispositivos llegó. En el SW, los avisos del admin usan `requireInteraction` (se quedan en pantalla). SW v9.

### 2026-11-07 · Avisos del admin funcionando + campanita — Claude
- En el celular de Arturo el problema era Chrome (permisos y batería); ya llegan los avisos del admin.
- "Probar aviso" ya no lanza la notificación local: solo manda una por el servidor, para no duplicar.
- `useNewOrderSound`: el beep anterior era un WAV vacío (no sonaba). Ahora es una campanita de 3 notas con Web Audio + vibración, mientras el panel está abierto. El sonido de las notificaciones del sistema no se puede cambiar desde la web: se cambia en los ajustes de Android de la app/Chrome.

### 2026-11-21 · Auditoría legal (skill `legal`) — Claude
- Nueva skill `~/.claude/skills/legal/SKILL.md` (LFPDPPP 2025, LFPC/PROFECO, NMX-COE). Auditoría de solo lectura, sin cambios en código.
- Hallazgos clave: propina preseleccionada en 10 % (`CustomerApp.tsx:57`); el cron solo borra pedidos `delivered`/`rejected` (los demás quedan para siempre, contra "se borran a los 3 días"); el aviso no nombra a la Secretaría Anticorrupción y Buen Gobierno ni da plazos ARCO (20+15 días); falta aviso simplificado completo junto al formulario; push usa servicios de Google/Apple/Mozilla, no Firebase; no hay liga a aviso/términos fuera del checkout; "Linterna 10 s/n" es contradictorio.
- Pendiente: Arturo decide qué arreglar; subir `LEGAL_VERSION` al cambiar textos.

### 2026-11-21 · Revisión completa (3 agentes revisores + legal) — admin, seguridad y textos legales — Claude
- Admin/servidor: cambio de estado en `runTransaction` validando `OrderLifecycle.canTransition` (409 si otro dispositivo ya lo cambió); suscripciones push validadas con `domain/push/PushSubscriptionPolicy` (solo https de Google/Mozilla/Apple/Microsoft, ≤4 KB, sin SSRF); `DELETE /api/admin/notification-token` al cerrar sesión; `adminNotifiedAt` se quita si falla el envío; el cron borra TODO pedido de >3 días (antes los "nuevo/en cocina" quedaban para siempre).
- ImgBB por servidor: `POST /api/admin/upload` (admin, ≤8 MB, solo imágenes). Se borró `lib/services/imgbb.ts`; la llave ya no va en el JS. El servidor usa `IMGBB_API_KEY` y, si no existe, `NEXT_PUBLIC_IMGBB_API_KEY` (no se expone porque ningún código del navegador la usa). Recomendado: rotar la llave y renombrar la variable en Vercel.
- Borrar sucursal: `confirm()` + `DELETE /api/admin/branches/[id]` con `recursiveDelete` (productos, categorías, personalizaciones, branding).
- `next.config.ts`: headers de seguridad (X-Frame-Options DENY, CSP frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy, HSTS). Verificado en producción.
- Catálogo: `useProductCatalog` (150 líneas) → `hooks/catalog/{useCategoryActions,useProductActions,useModifierActions}`; escrituras con `CatalogRepository.saveMany` (writeBatch) para que no se pisen; `BranchCopyPlanner` liga cada copia de producto a la categoría con el mismo nombre en cada sucursal (la crea si falta) y la borra de sucursales quitadas; `SortOrder.next` (máximo+1). Listeners con callback de error. `useBranchEditor` ya no pierde lo escrito si llega una actualización de otro dispositivo. Campanita por ids de pedido, en todo el panel, AudioContext único desbloqueado al primer toque.
- Legal (skill nueva `legal`): aviso con Secretaría Anticorrupción y Buen Gobierno, plazos ARCO 20+15 días, proveedores reales (Web Push), alergias, sin la frase falsa de "conservamos registro de venta", aviso simplificado con responsable; términos: precios finales con impuestos, propina empieza en 0 %. `LEGAL_VERSION` 2026-11-21.
- Pruebas: 79 pasan, tsc y build OK. Producción verificada con puppeteer: menú sin errores de consola, pie con ligas legales, aviso nuevo, `/api/admin/upload` sin sesión = 401. Tag de respaldo `antes-revision-2026-11-21`.
- Reglas desplegadas 2026-11-21 con autorización de Arturo (leer pedido sin sesión = 403). **Pendiente:** domicilio con CP y aclarar "Linterna 10 s/n"; rotar llave ImgBB; probar en el admin: subir imagen, aceptar pedido, borrar sucursal de prueba.

## 2026-11-21 · Liga editable para QR/NFC — Claude
- `src/app/ir/[slug]/route.ts`: `/ir/<slug>` redirige (307) a la URL del campo `url` de Firestore `enlaces/<slug>` (solo https; si no, al menú). Las reglas no abren `enlaces` (solo lo lee el servidor). Se crea o edita desde la consola de Firebase.
- `enlaces/video` creado para el QR del cartel (por ahora apunta al menú). Probado en producción: al cambiar la URL cambia el destino.
- Dirección extra **https://emprende-hoy.vercel.app** (proyecto escolar de Comunicación de negocios): el middleware reescribe `/` a `/ir/emprende` y `/<x>` a `/ir/<x>`. Se agregó con `vercel domains add <dominio> menulabarra` (sin el nombre del proyecto da `invalid_domain`). Si el enlace no existe, el fallback va a `MENU_URL` y no a la misma dirección (evita un ciclo).

### 2026-11-22 · SEO: "snacks" en lugar de "burritos" + Facebook — Claude
- Los burritos solo se venden en la Uni: Arturo no quiere que se anuncien en Google. Los textos SEO, el JSON-LD y la imagen OG ahora dicen "hamburguesas, alitas y snacks". Se agregó `FACEBOOK_URL` (facebook.com/la.barra.guanajuato) a `sameAs`.

### 2026-11-25 · QR escolar apuntando al video final — Claude
- `enlaces/emprende` → `https://youtu.be/p-Zjg7oRYLs` (entrevista editada). Verificado: emprende-hoy.vercel.app responde 307 al video.
- Cómo cambiar un enlace sin consola: `node --env-file=.env.local scripts-enlace.cjs <slug> <url>` (usa firebase-admin con las credenciales de `.env.local`; no subir a git si cambia a leer secretos de otra forma).

## 2026-11-25 · Medición de legibilidad (sin cambios en el código) — Claude
- `node ~/second-brain/herramientas/auditor/medir-legibilidad.mjs https://menulabarra.vercel.app` → descripciones de 12 px (line-height 1.25), input del buscador de 14 px (zoom en iPhone), precios de 14 px con contraste 4.35:1, ligas del pie de 14 px de alto, categorías de 42 px, y con la letra al 200 %: scroll de lado (519 px) y 26 textos cortados. Las reglas están en `~/second-brain/herramientas/auditor/LEGIBILIDAD.md`.

## 2026-11-25 · Legibilidad, descripciones y arreglos de auditoría (piloto + auditor) — Claude
- Tipografía por defecto: fuente del sistema (estilo iPhone) en lugar de serif (`useBranchBranding`, default `sans`; el admin aún puede elegir serif). `body` con line-height 1.5 y `overflow-wrap:anywhere` (ya no hay scroll de lado con la letra al 200 %).
- Cliente: text-xs→text-sm y text-sm→text-base (salvo etiquetas en mayúsculas), botones de 44 px como mínimo, buscador de 16 px y 48 px de alto, ligas legales de 44 px, tarjetas con nombre de 16/18 px, descripción de 15 px (3 líneas) y precio de 18 px en color de texto. Precios sin ".00" (`currency`). `scroll-mt-24` para que las pestañas no tapen el título de la sección.
- Marca: `RgbColor.readableOnWhite` oscurece lo mínimo el color principal para llegar a un contraste de 4.5:1 (el rojo 242 7 19 daba 4.35). Tiene pruebas.
- Arreglos de la auditoría: el doble toque en "Agregar" ya no duplica (`savedRef`); el aviso de opción obligatoria se lleva a la vista; "Vaciar carrito" pide confirmación y quedó como liga abajo del botón de enviar; los campos del formulario tienen etiquetas visibles; "1 producto / N productos"; aviso arriba cuando la sucursal está cerrada; encabezado con capa más oscura; botones de WhatsApp e Instagram de 48 px.
- Firestore: 19 descripciones nuevas (`scripts/descripciones-2026-11-25.cjs`) y nombres de opciones corregidos: Elije→Elige, "Coca-Cola 400 ml", sin espacios sobrantes (`scripts/nombres-opciones-2026-11-25.cjs`). Respaldo previo en `second-brain/03-la-barra/datos/respaldo-productos-2026-11-25.json` (`scripts/respaldo-productos.cjs`).
- Nueva guía `AUDITORIA.md`: prohíbe enviar pedidos reales al probar.
- Pendiente: confirmar con Arturo qué incluyen los combos 2 y 3, decir cómo se paga y entrega, poner fotos a los productos de Presa y revisar "AD" en la imagen de horchata.
