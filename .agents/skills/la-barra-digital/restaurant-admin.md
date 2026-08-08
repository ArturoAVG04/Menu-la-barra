# Panel de Gestión del Restaurante: La Barra Digital

El panel administrativo (`/admin`) es la herramienta operativa del personal de cocina, caja y gerencia de La Barra.

---

## 1. Funcionalidades Existentes a Preservar

Antes de modificar el código del administrador, asegurar que no se rompan las capacidades actuales:

1. **Gestión del Catálogo:** Creación, edición, eliminación y cambio de orden (*sortOrder*) de productos, categorías y modificadores.
2. **Control de Disponibilidad:** Botón de activación/desactivación instantánea para productos o ingredientes agotados.
3. **Gestión de Sucursales:** Edición de dirección, teléfonos de WhatsApp/Instagram, estado Abierto/Cerrado manual y horarios semanales con zonas horarias.
4. **Calculadora de Tiempos Estimados:** Configuración de minutos base por pedido e incrementos por cantidad de ítems.
5. **Generador de Descripciones con Gemini AI:** Llamada al backend seguro (`/api/admin/generate-description`) para redactar descripciones comerciales apetitosas.
6. **Gestión de Pedidos en Tiempo Real:** Subscripción activa a la cola de pedidos con actualización de estados (`new` → `preparing` → `ready` → `delivered` / `rejected`).

---

## 2. Seguridad y Acceso Administrativo

* **Protección en Cliente (`ProtectedAdmin.tsx`):** Redirigir a `/login` si el usuario de Firebase no posee el custom claim `role: admin`.
* **Refresco de Token Idempotente:** Antes de realizar llamadas sensibles a las API Routes de backend, ejecutar `currentUser.getIdToken(true)` para asegurar que los claims recién otorgados estén vigentes.
* **Confirmaciones para Acciones Destructivas:** Solicitar confirmación previa antes de eliminar productos, categorías o sucursales.

---

## 3. Experiencia Operativa de Cocina

* El listado de pedidos debe diseñarse para pantallas de tabletas o computadoras en área de caja/cocina.
* Usar indicadores visuales claros y alertas sonoras opcionales al ingresar un pedido nuevo (`new`).
* Mantener botones de acción grandes para cambiar de estado rápidamente de **En Cocina** a **Listo para Entrega**.
