# Arquitectura Frontend y Modularización: La Barra Digital

Este documento establece las pautas para estructurar el código React / Next.js, combatir archivos monolíticos y mantener una separación limpia de responsabilidades.

---

## 1. Principio de Descomposición por Responsabilidad

Durante la auditoría se encontraron componentes gigantescos (ej. `CustomerShell.tsx` con 1,654 líneas y `AdminProductForm.tsx` con 69 KB).

### La Regla de Modulación
* **Evitar límites de líneas arbitrarios** (ej. *"ningún archivo puede superar exactamente 200 líneas"*).
* **Dividir componentes cuando tengan responsabilidades claramente diferentes** o cuando la acumulación de lógica (`useState`, `useEffect`) dificulte la comprensión y mantenimiento.

---

## 2. Jerarquía de Componentes Recomendada

El menú del cliente y el panel de administración deben organizarse en subcomponentes especializados:

```text
src/components/customer/
├── CustomerShell.tsx          # Contenedor orquestador principal
├── Header.tsx                 # Banner de sucursal, portada, logo, estado abierto/cerrado
├── SearchBar.tsx              # Input de búsqueda con filtrado
├── CategoryNav.tsx            # Navegación fija de categorías (Sticky Tabs)
├── ProductGrid.tsx            # Renderizado de secciones por categoría
├── ProductCard.tsx            # Tarjeta individual del producto (fotos sangradas, precio)
├── ModifierModal.tsx          # Modal de personalización de ingredientes y extras
├── CartDrawer.tsx             # Panel deslizable del carrito y desglose de costos
├── CheckoutForm.tsx           # Captura de datos mínimos del cliente y envío
├── OrderTrackerModal.tsx      # Seguimiento del pedido activo en tiempo real
└── BranchPickerModal.tsx      # Selector modal de sucursales

src/components/admin/
├── AdminShell.tsx             # Orquestador del panel de administración
├── OrderQueue.tsx             # Tablero de pedidos entrantes para cocina
├── ProductManager.tsx         # Listado y tabla de productos
├── ProductFormModal.tsx       # Formulario de creación/edición de productos
├── BranchSettings.tsx         # Configuración de horarios y datos de sucursal
└── BrandingEditor.tsx         # Ajuste de colores y tipografía de la sucursal
```

---

## 3. Manejo de Estado (Global vs. Local)

* **Estado Global (`AppProviders.tsx`):**
  * Sucursal activa (`activeBranch`).
  * Lista de sucursales (`branches`).
  * Carrito de compras (`cart`).
  * Sesión del usuario y rol (`currentUser`, `role`).
  * Tokens de branding inyectados en variables CSS (`branding`).

* **Estado Local (Dentro de cada componente):**
  * Apertura/cierre de modales (`isCartOpen`, `isBranchPickerOpen`).
  * Texto de búsqueda (`searchQuery`).
  * Selección de opciones en el editor de modificadores (`editorSelections`).
  * Mensajes de notificación flotantes locales (*toasts*).

---

## 4. Convenciones de Código y Hooks

* Usar TypeScript estricto. Prohibido el uso de `any`.
* Centralizar llamadas a Firebase y API Routes en la capa de servicios (`src/lib/services/`).
* Mantener los componentes presentacionales puros siempre que sea posible, delegando la lógica compleja a custom hooks (`useRealtimeMenu`, `useOrderStatus`, etc.).
