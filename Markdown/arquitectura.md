# Documentación de Arquitectura: La Barra Digital

Documento de referencia general sobre la estructura del proyecto, superficies y servicios integrados.

---

## 1. Stack Tecnológico

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.
* **Backend & Firestore:** Firebase Auth, Firestore Database, Firebase Admin SDK, Firebase Cloud Messaging.
* **Imágenes:** ImgBB API (Servicio de hosting para imágenes subidas desde el panel de administración).
* **PWA:** Service Worker unificado (`public/sw.js`) con soporte para caché offline y notificaciones Web Push.

---

## 2. Superficies de la Aplicación

```text
src/app/
├── page.tsx               # Superficie de Cliente (Menú Digital)
├── admin/                 # Panel Administrativo protegida por autenticación
├── login/                 # Iniciar sesión de Administrador
└── api/                   # Rutas de API en servidor (Gemini AI, Estado de Pedidos, Cron)
```

---

## 3. Modelo de Datos en Firestore

```text
sucursales/{branchId}
  ├── name, slug, address, whatsapp, instagram, weeklyHours, orderSettings, coverImageUrl
  ├── categories/{categoryId} -> name, sortOrder
  ├── products/{productId} -> name, description, price, imageUrl, available, modifiers[]
  └── modifiers/{modifierId} -> name, type, required, options[]

branding/{branchId}
  └── primaryRgb, accentRgb, shape, fontFamily, logoUrl

orders/{orderId}
  └── sucursalID, customerName, customerPhone, items[], subtotal, tipAmount, total, status, createdAt, trackingToken
```
