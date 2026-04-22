# La Barra PWA

Base white-label para restaurante con dos superficies:

- `Customer App`: menu interactivo con categorias, buscador, carrito flotante y actualizaciones en tiempo real.
- `Admin Dashboard`: gestion de productos, branding visual y seguimiento de pedidos.

## Stack

- Next.js + React + Tailwind CSS
- Firebase Auth + Firestore + Cloud Messaging
- ImgBB para hosting de imagenes
- PWA con `manifest.json` y `public/sw.js`

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

- El proyecto ya incluye `public/firebase-messaging-sw.js` para notificaciones en segundo plano.
- Antes de usarlo, reemplaza los placeholders del archivo por tus credenciales publicas de Firebase.
- En Vercel tambien debes definir `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
- En iOS web push solo funciona cuando la PWA esta instalada en pantalla de inicio.

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
