# Backlog de Pre-Lanzamiento

Backlog técnico accionable para cerrar el proyecto antes de salida real. Esta versión refleja el estado actual del repositorio y evita re-implementar piezas que ya existen.

---

## Resumen Ejecutivo

### Ya existe
- Base PWA con `manifest.json` y registro de service workers.
- Base Firebase Cloud Messaging en cliente.
- Seguimiento de pedidos y cambio de estados desde admin.
- Horarios semanales por sucursal.
- WhatsApp por sucursal.
- Banner principal con overlay y blur inicial.

### Parcial
- PWA offline estable en producción.
- Push notifications reales de punta a punta.
- UX de permisos para notificaciones.
- Legibilidad del banner cuando la portada trae texto incrustado.

### Faltante
- Zona horaria fija de Ciudad de México para abierto/cerrado.
- Ticket automático por WhatsApp con carrito y total.
- Geolocalización con recomendación de sucursal.
- Persistencia y envío real de tokens FCM.

---

## Fase 1: Salida Segura

### Tarea 1. Unificar estrategia de service worker
* **Prioridad:** Alta
* **Objetivo:** Evitar conflictos entre `sw.js` y `firebase-messaging-sw.js` dejando una sola estrategia clara para caché offline y push.
* **Archivos:** `src/components/pwa/PWARegistration.tsx`, `public/sw.js`, `next.config.ts`.

### Tarea 2. Completar push notifications reales con FCM
* **Prioridad:** Alta
* **Objetivo:** Guardar token FCM de cliente en Firestore y notificar cuando cambie el estado del pedido.
* **Archivos:** `src/components/pwa/PWARegistration.tsx`, `src/lib/firebase/config.ts`, `src/lib/services/menu.ts`.

### Tarea 3. Fijar lógica horaria a `America/Mexico_City`
* **Prioridad:** Alta
* **Objetivo:** Garantizar que la disponibilidad Abierto/Cerrado dependa del reloj del negocio y no de la zona horaria del cliente.
* **Archivos:** `src/lib/branchHours.ts`, `src/components/customer/BranchSelector.tsx`, `src/components/customer/CustomerShell.tsx`.

### Tarea 4. Generar ticket automático para WhatsApp
* **Prioridad:** Alta
* **Objetivo:** Generar un mensaje estructurado con desglose completo del pedido para envío rápido al WhatsApp de la sucursal.
* **Archivos:** `src/components/customer/CustomerShell.tsx`, `src/lib/services/menu.ts`.

---

## Fase 2: Optimización Comercial

### Tarea 5. Geolocalización y recomendación de sucursal
* **Prioridad:** Media
* **Objetivo:** Sugerir la sucursal abierta más cercana para reducir fricción inicial.

### Tarea 6. Rediseñar banner principal para legibilidad robusta
* **Prioridad:** Media
* **Objetivo:** Separar la imagen de portada de los textos en HTML para garantizar lectura limpia.

### Tarea 7. Afinar UX de permisos y mensajes
* **Prioridad:** Media
* **Objetivo:** Mover la solicitud de permiso de notificaciones a un momento de alta intención (post-pedido o al abrir el rastreador).
