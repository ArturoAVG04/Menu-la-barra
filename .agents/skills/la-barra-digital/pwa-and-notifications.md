# PWA y Notificaciones Push: La Barra Digital

La Progressive Web App (PWA) y el sistema de notificaciones son herramientas de retención para convertir visitantes en clientes frecuentes.

---

## 1. Estrategia de Service Worker Unificado

Para evitar conflictos de scope o fallas en dispositivos móviles, se debe utilizar un **único Service Worker** (`public/sw.js`):

* **Cacheo Estático (App Shell):** Guardar en caché activos estáticos (`manifest.json`, íconos, tipografías, CSS estático).
* **Estrategia para Datos de Menú:** *Network First* (red primero, fallback a caché). El cliente siempre debe ver los productos y precios actualizados si hay conexión; la caché solo se utiliza como respaldo offline.
* **Segundo Plano (Push):** Manejar los eventos `push` y `notificationclick` dentro del mismo Service Worker unificado.

---

## 2. Lógica y Moderación de Notificaciones Push (FCM)

### Criterio Anti-Spam
> **Nunca enviar notificaciones Push por el simple hecho de tener la capacidad técnica.**

Cualquier notificación debe cumplir con:
1. **Relevancia:** Información directa sobre la compra actual del cliente.
2. **Contexto:** Envíos oportunos (ej. *"Tu hamburguesa está lista en mostrador"*).
3. **Frecuencia Moderada:** Prohibido saturar con promociones automáticas diarias.

---

## 3. Momentos Correctos para Solicitar Permisos de Notificación

* **Incorrecto:** Disparar la ventana emergente de permisos del navegador inmediatamente al cargar la página por primera vez.
* **Correcto:** Solicitar permiso únicamente cuando exista una intención clara del cliente:
  * Al confirmar el envío de un pedido.
  * Al ingresar a la pantalla de seguimiento (*Order Tracker*).
  * Después de guardar la PWA en la pantalla de inicio del teléfono.

---

## 4. Matriz de Notificaciones Válidas

| Tipo de Notificación | Disparador | Canal | Impacto en Cliente |
| :--- | :--- | :--- | :--- |
| **Pedido Aceptado** | Cocina cambia estado a `preparing` | Push / Local | Tranquilidad y confirmación |
| **Pedido Listo** | Cocina cambia estado a `ready` | Push / Local | Acción inmediata para recoger/recibir |
| **Re-Orden Frecuente** | 7 a 14 días después del último pedido | Push (Opcional) | Recordatorio de antojo exclusivo |

---

## 5. Compatibilidad con iOS (Apple Web Push)

* En iOS (Safari), las notificaciones Push web **solo funcionan si la PWA ha sido agregada a la Pantalla de Inicio** (*Add to Home Screen*) y el usuario otorga permiso explícito.
* El código debe detectar si el dispositivo es iOS y orientar suavemente al usuario para instalar la PWA antes de solicitar el permiso de notificación.
