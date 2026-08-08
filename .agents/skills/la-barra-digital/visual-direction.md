# Dirección Visual e Identidad: La Barra Digital

Este documento establece el criterio estético, la composición visual y las directrices de diseño específicas para transmitir la personalidad auténtica de **La Barra**.

---

## 1. Personalidad Visual

La Barra es un negocio de hamburguesas y comida rápida mexicana. Su presencia visual debe sentirse:

* **Apetitosa:** La comida es el foco central. Las imágenes deben provocar hambre de forma inmediata.
* **Energética:** Colores vivos, contrastes potentes y dinamismo comercial.
* **Moderna y Directa:** Sin rodeos, limpia, fácil de navegar y orientada a la acción.
* **Local y Mexicana:** Auténtica, cercana a la comunidad y con carácter comercial accesible.

### Lo que NO debe sentirse:
* Ni plantilla SaaS ni dashboard administrativo estéril.
* Ni cafetería artesanal minimalista ni salón de té gourmet.
* Ni diseño robótico o genérico generado por IA.

---

## 2. Paleta Cromática y Jerarquía de Uso

### 🔴 ROJO (Fondo Principal y Presencia de Marca)
* **Función:** Es el color dominante y la base cromática de la marca.
* **Aplicación:** Fondos de pantalla principales, encabezados de impacto y elementos estructurales clave.
* **Criterio:** Usarse para generar reconocimiento y fuerza visual. Se debe acompañar de áreas neutras de descanso para evitar la fatiga visual.

### 🟡 AMARILLO (Contraste, Énfasis y Llamadas a la Acción)
* **Función:** Captar la atención inmediata en puntos de alta conversión.
* **Aplicación:** Botones principales de compra (*Agregar al carrito*, *Confirmar pedido*), precios importantes, bordes destacados, ofertas y estados visuales activos.
* **Criterio:** Utilizarse como contraste vibrante sobre el fondo rojo o negro. No saturar toda la pantalla con amarillo.

### 🟤 CAFÉ / BEIGE (Superficies de Alimentos y Contenido)
* **Función:** Dar calidez, evocar el pan recién horneado y la carne a la parrilla, y separar la información del fondo rojo.
* **Aplicación:** Fondo de tarjetas de producto, contenedores de modificadores de ingredientes, modales y listas de opciones.

### ⬛ NEGRO (Estructura, Texto y Peso Visual)
* **Función:** Aportar legibilidad, contraste y estructura limpia.
* **Aplicación:** Barras de navegación fijas (*sticky nav*), textos principales, pies de página y elementos de acuadre.

---

## 3. Fotografía y Tratamiento de Alimentos

* **Fotos Sangradas (*Full-Bleed*):** Las fotografías de hamburguesas deben ocupar el ancho completo del contenedor en las tarjetas de producto.
* **Sin Rellenos Reductores:** Prohibido encerrar las fotos de hamburguesas en recuadros pequeños con padding interior (`object-contain p-2`), lo que hace que parezcan íconos de software.
* **Fallback de Fotografía:** Cuando un producto no disponga de fotografía, utilizar una superficie neutra y limpia de la marca con tipografía clara (evitando gradientes abstractos morados/azules con íconos vectoriales genéricos).

---

## 4. Elementos de Composición y Estilos

* **Tipografía:** Sans-serif moderna, sólida y comercial (ej. `Inter` o `Roboto`). Evitar fuentes Serif.
* **Espaciado y Densidad:** Densidad de información equilibrada. Los productos deben respirar en móvil sin exigir desplazamientos excesivos.
* **Bordes y Sombras:** Bordes sutiles y definidos (`border-line`) con sombras suaves para dar profundidad sin suciedad visual.
* **Productos Destacados y Promociones:** Destacar hamburguesas insignia con bordes amarillos o insignias discretas sin saturar la tarjeta.
* **Estados Visuales:** Retroalimentación inmediata en estados `hover`, `active`, de carga (*loading*) y estados deshabilitados (*agotado*).

---

## 5. Qué EVITAR (Anti-Patrones Visuales)

Evitar por defecto los siguientes recursos cuando se utilicen únicamente por tendencia y no aporten una razón funcional o estética clara:

* **Glassmorphism y `backdrop-blur` desmedido:** Dificultan la visibilidad en exteriores y bajo el sol.
* **Gradientes abstractos violeta / cian:** Propios de plataformas SaaS, no de hamburgueserías.
* **Badges y botones flotantes descontrolados:** Generan ruido visual y distraen del alimento.
* **Sombras gigantescas o brillantes:** Desconectadas de la estética comercial de restaurante.
* **Exceso de esquinas totalmente circulares (`rounded-full`) en tarjetas:** Usar esquinas redondeadas naturales (`rounded-xl` / `rounded-2xl`).

> **Principio Central:** Evitar un recurso cuando se utiliza únicamente por moda. Si existe una justificación clara de UX o identidad, puede emplearse con criterio.
