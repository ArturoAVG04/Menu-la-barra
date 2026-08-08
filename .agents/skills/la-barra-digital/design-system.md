# Sistema de Diseño Visual: La Barra Digital

Este documento especifica la identidad cromática, tipografía, composición, tratamiento fotográfico y reglas anti-diseño genérico para el producto digital de La Barra.

---

## 1. Paleta de Colores de la Marca

La identidad cromática de La Barra transmite antojo, energía, velocidad y autenticidad comercial mexicana.

### 🟥 ROJO (Fondo Dominante y Color Principal)
* **Propósito:** Es el tono de marca primario. Genera presencia, dinamismo y reconocimiento inmediato.
* **Uso:** Encabezados principales, banners de impacto, fondos de la aplicación y acentos de marca principales.
* **Cuidado:** Garantizar suficiente espacio en blanco/neutro y contraste de texto para evitar fatiga visual en sesiones de navegación prolongadas.

### 🟨 AMARILLO (Énfasis, Precios y CTAs)
* **Propósito:** Captar la atención del usuario en puntos de alta conversión.
* **Uso:** Precios importantes, botones de compra (*Add to Cart* / *Checkout*), indicadores de promoción, líneas divisorias destacadas, badges de estatus de pedido ("Listo").
* **Regla:** Utilizarse como contraste vibrante contra el rojo y el negro. **No pintar toda la interfaz de amarillo.**

### 🟫 CAFÉ / BEIGE (Superficies de Contenedores de Comida)
* **Propósito:** Transmitir calidez, conexión con el pan horneado y la carne asada, y separar la información del fondo rojo.
* **Uso:** Tarjetas de productos, fondos de modales, paneles de modificadores de ingredientes y contenedores de información.
* **Regla:** Mantenerlo como superficie secundaria para dar soporte al producto.

### ⬛ NEGRO (Estructura y Contraste)
* **Propósito:** Dar peso visual, elegancia comercial y lectura limpia.
* **Uso:** Barras de navegación fijas (*sticky nav*), textos principales de alto contraste, pies de página y estructuras del layout.

---

## 2. Tipografía y Jerarquía

* **Estilo:** Sans-serif moderna, limpia, de trazos sólidos y alta legibilidad comercial (ej. `Inter`, `Outfit` o `Roboto`).
* **Prohibición:** Eliminar el uso de fuentes Serif (`Palatino`, `Georgia`, `Iowan Old Style`) en la experiencia del usuario. Las serifas restan velocidad y carácter a un negocio de comida rápida.
* **Pesos y Tamaños:**
  * Precios de productos: `font-bold` o `font-extrabold`, con contraste inmediato.
  * Títulos de hamburguesas: `font-semibold` o `font-bold`, leading apretado para evitar saltos de línea excesivos.
  * Leyendas secundarias (descripciones e ingredientes): `text-sm`, tono legible de alto contraste.

---

## 3. Fotografía de Productos ("Craving-First")

La comida es el vendedor #1 del menú digital.

* **Fotos Sangradas (*Full-Bleed*):** Las fotografías de hamburguesas y combos deben ocupar el ancho completo del área asignada en la tarjeta, sin bordes ni rellenos internos (`padding`) que reduzcan el tamaño del alimento.
* **Prohibido `object-contain p-2`:** Las fotos no son íconos de software; deben verse doradas, jugosas y apetitosas.
* **Fallback para Productos sin Fotografía:**
  * **Incorrecto:** Renderizar una tarjeta con gradiente abstracto azul/morado y un ícono vectorial de tenedor o pierna de pollo.
  * **Correcto:** Mostrar una tarjeta limpia con textura sobria de marca, logo o iniciales en tonos café/negro con tipografía clara del producto.

---

## 4. Reglas Anti-Diseño Genérico / Plantillas IA

La IA que trabaje en La Barra debe **EVITAR POR DEFECTO**:

1. **Glassmorphism y `backdrop-blur` desmedido:** No aplicar efectos de cristal esmerilado que oscurezcan la pantalla o dificulten la visibilidad en exteriores.
2. **Gradientes abstractos de startup SaaS:** Prohibidos los gradientes violeta, verde neón o azul cian.
3. **Píldoras y Badges descontrolados (`rounded-full` en todo):** Usar esquinas redondeadas naturales (`rounded-xl` o `rounded-2xl`) para tarjetas de alimentos.
4. **Íconos como sustitutos de alimentos:** No usar íconos SVG como elementos principales si el cliente necesita ver la hamburguesa real.
5. **Sombras exageradas (`shadow-glow` pesadas):** Las sombras deben ser sutiles para dar profundidad sin suciedad visual.
6. **Interfaces simétricas aburridas:** Variar visualmente productos destacados o promociones especiales para romper la monotonía del grid.

> **Regla Excepcional:** Si existe una razón funcional o estética fuerte para usar alguno de estos elementos en un punto específico, puede justificarse. Nunca utilizarlos por moda.
