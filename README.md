# La Barra PWA

Base white-label para restaurante con dos superficies:

- `Customer App`: menu interactivo con categorias, buscador, carrito flotante y actualizaciones en tiempo real.
- `Admin Dashboard`: gestion de productos, branding visual y seguimiento de pedidos.

## Stack

- Next.js + React + Tailwind CSS
- Firebase Auth + Firestore + Cloud Messaging
- ImgBB para hosting de imagenes
- PWA con `manifest.json` y un service worker unificado en `public/sw.js`

## Estructura

```text
src/
  app/
    admin/
    customer/
    login/
  components/
    admin/
    customer/
    providers/
    pwa/
  lib/
    firebase/
    hooks/
    services/
  types/
```

## Multi-tenancy

- La coleccion raiz es `sucursales`.
- Cada sucursal contiene subcolecciones `categories` y `products`.
- Cada producto guarda `sucursalID`.
- Los pedidos se guardan en `orders` y se filtran por `sucursalID`.
- El estado global limpia el carrito al cambiar de sucursal para evitar mezclar inventario.

## Arranque

1. Copia `.env.example` a `.env.local`.
2. Completa las credenciales de Firebase, VAPID y ImgBB.
3. Instala dependencias con `npm install`.
4. Ejecuta `npm run dev`.
5. Abre `http://localhost:3000`.

Si quieres abrirlo desde otro dispositivo en la misma red local, usa `npm run dev:network` y entra desde `http://TU_IP_LOCAL:3000`.

## Probar localmente

`Live Server` no es la forma correcta de probar este proyecto porque solo sirve archivos estaticos y esta app depende de Next.js, rutas de aplicacion y React.

Usa este flujo:

1. Instala Node.js 20 o superior.
2. En la carpeta del proyecto ejecuta `npm install`.
3. Crea `.env.local` desde `.env.example`.
4. Ejecuta `npm run dev`.
5. Abre `http://localhost:3000`.

Para validar produccion antes de subir:

1. Ejecuta `npm run build`.
2. Luego ejecuta `npm run start`.
3. Revisa la app otra vez en `http://localhost:3000`.

Si quieres una experiencia similar a recarga automatica, `npm run dev` ya reemplaza por completo a Live Server en este proyecto.

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. En Vercel crea un proyecto nuevo e importa el repositorio.
3. Vercel detectara `Next.js` automaticamente.
4. En la seccion de Environment Variables agrega las variables de `.env.example`.
5. Despliega.

Checklist rapido para que Vercel refleje tus avances en otros dispositivos:

1. Confirma que estas trabajando en la raiz del repo.
2. Haz `git status` antes de subir para verificar que los cambios correctos estan en la raiz.
3. Sube tus cambios con `git add .`, `git commit -m "mensaje"` y `git push origin main`.
4. En Vercel revisa que el `Root Directory` del proyecto sea la raiz del repositorio.
5. Verifica que todas las variables de `.env.example` tambien existan en Vercel.
6. Si la app tarda en reflejar cambios en un dispositivo, borra el sitio instalado o limpia los datos del navegador, porque el `service worker` puede mantener cache de la version anterior.

Archivo incluido:

- `vercel.json` con los comandos base de instalacion, build y desarrollo.

## Firebase Cloud Messaging

- El proyecto usa el mismo `public/sw.js` para cache offline basico y recepcion de push en segundo plano.
- En Vercel tambien debes definir `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
- Para envio seguro de push desde backend tambien debes definir `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` y `FIREBASE_ADMIN_PRIVATE_KEY`.
- Para tareas automaticas de servidor debes definir `CRON_SECRET`. Vercel lo enviara como `Authorization: Bearer <CRON_SECRET>` al cron de limpieza.
- En iOS web push solo funciona cuando la PWA esta instalada en pantalla de inicio.
- El cambio de estado del pedido desde admin ahora pasa por `API` protegida y dispara push real a los tokens asociados al pedido cuando la configuracion Admin SDK esta presente.

## Limpieza automática de pedidos

- `vercel.json` programa un cron diario hacia `/api/cron/delete-expired-orders`.
- El cron elimina de Firestore los pedidos `delivered` y `rejected` con mas de 3 dias de antigüedad.
- Tambien elimina los tokens FCM asociados a esos pedidos.
- La programacion del cron en Vercel usa horario UTC.

## Generacion de descripciones con Gemini

- El boton de descripcion del admin llama a `POST /api/admin/generate-description` desde `src/components/admin/AdminProductForm.tsx`.
- El endpoint vive en `src/app/api/admin/generate-description/route.ts` y usa `GEMINI_API_KEY` solo desde backend.
- En local, agrega `GEMINI_API_KEY` en `.env.local` y reinicia `npm run dev` despues de cambiar variables de entorno.
- En Vercel, agrega `GEMINI_API_KEY` en Project Settings > Environment Variables.
- Opcionalmente puedes definir `GEMINI_MODEL`; si no existe, el backend prueba modelos fallback compatibles.
- El endpoint requiere un token Firebase valido con custom claim `role: admin` en `Authorization: Bearer <idToken>`.
- Si acabas de asignar `role: admin`, cierra sesion o recarga el admin; el frontend fuerza refresh del token antes de llamar Gemini.
- El texto del prompt esta en `buildPrompt()` dentro del endpoint.
- Si se vuelve a generar una descripcion, el frontend manda la descripcion anterior como `previousDescription` para pedir una version distinta.

## Firestore sugerido

```text
sucursales/{branchId}
  name
  slug
  address
  isOpen

sucursales/{branchId}/categories/{categoryId}
  name
  sortOrder
  sucursalID

sucursales/{branchId}/products/{productId}
  name
  description
  price
  categoryId
  imageUrl
  available
  sucursalID
  modifiers[]

branding/{branchId}
  primaryRgb
  accentRgb
  shape

orders/{orderId}
  sucursalID
  customerName
  items[]
  total
  status
  createdAt
```

## Notificaciones PWA

- Android: soporta `service worker` + `push` con Firebase Cloud Messaging.
- iOS: las notificaciones web push solo funcionan si la PWA fue instalada en pantalla de inicio y el usuario concede permiso. La app ya evita pedir permiso antes de estar instalada en ese caso.
- El admin ya queda protegido en cliente y redirige a `/login` si no hay sesion con `role: admin`.

## Siguientes pasos recomendados

- Crear seed inicial para `sucursales`, categorias y productos.
- Configurar custom claims de Firebase para `role: admin`.
- Agregar acciones de cambio de estado del pedido desde el tablero.
- Reemplazar `public/icon.svg` por iconos finales de marca si quieres una instalacion mas pulida.

## Backlog de pre-lanzamiento

- Revisa [Markdown/prelaunch-backlog.md](file:///home/arturo/Proyectos/Menulabarra/Markdown/prelaunch-backlog.md) para el plan técnico actualizado antes de salir a mercado.

## Bitacora tecnica

### 2026-05-26 - Diagnostico Gemini y documentacion

- Se reviso el historial reciente con `git log --oneline` y el estado del worktree.
- Se detecto que el admin de cliente permitia entrar con sesion Firebase, pero el endpoint de backend exigia custom claim `role: admin`; se alineo el helper de backend para aceptar una sesion Firebase verificada, consistente con el modelo actual del panel.
- Se agregaron modelos fallback para Gemini: `GEMINI_MODEL`, `gemini-1.5-flash`, `gemini-1.5-flash-latest` y `gemini-2.0-flash`.
- Se documento el flujo de generacion de descripciones, variables de entorno y archivos relevantes en este README.

### 2026-05-26 - Rehabilitar role admin y refresh de token

- Se volvio a exigir custom claim `role: admin` en `src/lib/server/auth.ts`.
- `ProtectedAdmin` ahora bloquea el panel si el usuario no tiene `role: admin`.
- La llamada de Gemini en `AdminProductForm` usa `currentUser.getIdToken(true)` para refrescar el token y tomar claims recien asignados.
- `AppProviders` fuerza refresh del token al detectar sesion para actualizar `role`.

### 2026-05-26 - Diagnostico de errores Gemini y puertos locales

- Se mejoraron los mensajes de error del endpoint de Gemini para distinguir falta de token, token sin `role: admin` y errores de modelo/API de Gemini.
- Se mantuvo la regla operativa de usar solo `localhost:3000` para desarrollo local de este proyecto.
- Se agrego manejo de errores al refrescar tokens en `AppProviders` para no dejar `authReady` atorado si Firebase falla.
