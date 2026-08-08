# Principios de UX y Conversión: La Barra Digital

La función primordial del Menú Digital es servir como herramienta de ventas ágil y sin fricción.

---

## 1. El Flujo Sagrado de Conversión

Cualquier cambio en la interfaz debe respaldar esta secuencia de 4 etapas:

```text
  [ DESCUBRIMIENTO ] ──► Entrar a la sucursal correcta y ver qué vende La Barra.
           │
           ▼
     [ ANTOJO ]      ──► Observar hamburguesas apetitosas, fotos sangradas y promociones.
           │
           ▼
     [ DECISIÓN ]    ──► Personalizar ingredientes, elegir combo/bebida y ver precio claro.
           │
           ▼
      [ PEDIDO ]     ──► Confirmar datos mínimos y enviar sin dudas ni bloqueos.
```

---

## 2. La Pregunta de Evaluación de Pantalla

Antes de diseñar o modificar una pantalla o modal, responde:

> **¿Qué necesita hacer el cliente exactamente aquí?**

Si un botón, banner, texto o animación no ayuda al usuario a **comprender, elegir, personalizar, comprar o rastrear su pedido**, debe cuestionarse su inclusión.

---

## 3. Reducción de Fricción en Pasos Clave

### A. Selección de Sucursal
* Si el cliente entra por un QR de sucursal específica, autoseleccionar esa sucursal.
* Si el usuario cambia de sucursal y tiene productos en el carrito, informarle de forma transparente que el inventario se actualizará para esa ubicación.

### B. Navegación por Categorías
* Barra de navegación de categorías fija (*sticky*) al deslizar el catálogo.
* Permitir desplazarse entre categorías mediante toques (*scroll-into-view*) o desplazamiento natural del pulgar.

### C. Personalización de Modificadores (Extras/Combos)
* Los modificadores obligatorios (ej. *Término de la carne*, *Salsa principal*) deben indicarse claramente antes de permitir agregar al carrito.
* Mostrar el impacto económico de cada opción de forma inmediata (ej. `+ $25.00`).
* No esconder los controles dentro de modales anidados complejos.

### D. Transparencia en el Carrito y Checkout
* El usuario debe ver en todo momento:
  1. Ítems seleccionados y sus modificadores.
  2. Subtotal de productos.
  3. Propina sugerida (con opción de ajustar o remover).
  4. Gran Total definitivo.
* No solicitar datos innecesarios (únicamente Nombre, Teléfono y Notas de entrega/mesa).
