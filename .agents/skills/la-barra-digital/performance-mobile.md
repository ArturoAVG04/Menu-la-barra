# Optimización Móvil y Rendimiento: La Barra Digital

Dado que más del 90% de los clientes accederán desde teléfonos mediante códigos QR, redes sociales y WhatsApp, la velocidad en redes móviles de velocidad moderada es vital.

---

## 1. Enfoque Mobile-First Pragmático

* **Zona del Pulgar:** Ubicar los elementos de mayor interacción (*Barra del Carrito*, *Buscador*, *Botonera de Selección*, *Confirmar Pedido*) en la mitad inferior de la pantalla.
* **Áreas Táctiles Cómodas:** Usar un objetivo táctil cómodo (referencia ~48px en botones principales de compra) para evitar toques erróneos. No convertir esta referencia en una restricción ciega para enlaces secundarios pequeños.
* **Scroll Natural:** Permitir un desplazamiento fluido sin modales superpuestos que bloqueen el scroll del cuerpo de la página (*body scroll lock* controlado).

---

## 2. Optimización de Imágenes

Las imágenes de comida son indispensables pero pueden ralentizar la carga si no se gestionan correctamente.

* **Formatos Modernos:** Servir imágenes comprimidas en `WebP` o `AVIF`.
* **Carga Diferida (*Lazy Loading*):**
  * Aplicar `priority` únicamente a las primeras 4 fotografías visibles de la primera categoría (*Hero*).
  * Usar `loading="lazy"` para el resto del catálogo.
* **Atributo `sizes` Correcto:** Configurar `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` para evitar descargar imágenes de alta resolución en pantallas de teléfonos de baja densidad.

---

## 3. Optimización del Bundle de JavaScript

* **Importación de Íconos:** Importar únicamente los íconos necesarios de `lucide-react` para permitir que el empaquetador elimine el código no utilizado (*tree-shaking*).
* **Evitar Dependencias Redundantes:** Usar utilidades nativas de JavaScript (`Intl`, `Fetch API`, `Math`) antes de instalar librerías pesadas de manipulación de fechas o formateo.

---

## 4. Métricas Clave de Rendimiento (Core Web Vitals)

Cualquier actualización debe mantener:

* **LCP (Largest Contentful Paint):** `< 2.5s` en conexiones 4G/3G.
* **FID / INP (Interaction to Next Paint):** Respuesta inmediata (`< 100ms`) al tocar productos o modificar ingredientes.
* **CLS (Cumulative Layout Shift):** Reservar espacio vertical en las tarjetas de productos para evitar saltos de pantalla mientras se cargan las fotos.
