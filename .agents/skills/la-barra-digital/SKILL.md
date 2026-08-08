---
name: la-barra-digital
description: Skill especializada para el diseño, desarrollo, UX, arquitectura, rendimiento, seguridad y gestión del producto digital de La Barra (Menú Digital, Pedidos, PWA y Panel de Administración).
---

# Skill Especializada: La Barra Digital

Esta Skill define los conocimientos, principios visuales, UX, reglas de desarrollo, arquitectura y procesos de revisión que utilizará una IA al diseñar, desarrollar, mantener o auditar el producto digital de **La Barra**.

---

## 1. Definición del Producto

La Barra Digital es el **sistema digital integral de un negocio de hamburguesas y comida rápida**. Sus superficies principales son:

1. **Menú Digital Público (Customer App):** Canal interactivo enfocado en móvil.
2. **Sistema de Pedidos y Seguimiento:** Flujo de creación de pedido y tracking en tiempo real.
3. **PWA y Canal de Retención:** Instalación, notificaciones contextuales y pedidos frecuentes.
4. **Panel de Gestión del Restaurante (Admin Dashboard):** Administración de catálogo, sucursales, horarios, ofertas y cocina.

### El Objetivo Fundamental

> **MOSTRAR → PROVOCAR ANTOJO → FACILITAR LA ELECCIÓN → PERMITIR PEDIR → INFORMAR DEL PEDIDO → FOMENTAR QUE EL CLIENTE VUELVA.**

---

## 2. Filosofía y Criterio de Selección

### Cadena de Prioridades de Diseño
```text
  CLARIDAD ──► IDENTIDAD ──► CONVERSIÓN ──► USABILIDAD ──► RENDIMIENTO
```

### Principio Central
> **No diseñes para demostrar capacidades técnicas. Diseña para resolver los problemas del usuario y representar la identidad visual de La Barra.**

* Si un elemento o animación no acelera la compra ni provoca antojo, cuestiona su necesidad.
* Si una librería no aporta un beneficio directo claro, no la instales.
* Dividir componentes cuando existan responsabilidades claramente diferentes, no por métricas o números de líneas arbitrarios.
* Mantener funcionalidades existentes útiles (como la selección de propinas, estimación de tiempos de preparación y notificaciones de pedido) como herramientas valiosas a optimizar.

---

## 3. Mapa de Documentos Especializados

Para mantener un contexto eficiente, la Skill organiza sus especificaciones en documentos auxiliares:

| Documento | Ámbito de Especialización |
| :--- | :--- |
| [visual-direction.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/visual-direction.md) | **Dirección Visual.** Rojo como fondo principal, amarillo para acentos/CTAs, café/beige para tarjetas, negro para estructura y fotografía de alimentos. |
| [design-system.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/design-system.md) | **Sistema de Diseño.** Tokens de color, fuentes sans-serif, botones y recomendaciones para evitar patrones genéricos de IA. |
| [ux-principles.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/ux-principles.md) | **UX y Conversión.** Principios para reducir fricción en navegación, personalización de ingredientes, carrito y confirmación. |
| [product-experience.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/product-experience.md) | **Experiencia de Producto.** Canales (QR/WhatsApp/Instagram), seguimiento post-pedido, canales sociales y criterios para chat o finanzas. |
| [frontend-architecture.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/frontend-architecture.md) | **Arquitectura Frontend.** Descomposición modular de monolitos por responsabilidad única y manejo limpio de estado. |
| [firebase-security.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/firebase-security.md) | **Seguridad e Infraestructura.** Reglas de Firestore (`role: admin`), protección de secrets y endpoints de servidor en Next.js. |
| [pwa-and-notifications.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/pwa-and-notifications.md) | **PWA y Notificaciones.** Service Worker unificado (`sw.js`), notificaciones push oportunas y retención sin spam. |
| [performance-mobile.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/performance-mobile.md) | **Optimización Móvil.** Enfoque Mobile-First, zonas del pulgar, compresión WebP/AVIF y Core Web Vitals. |
| [restaurant-admin.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/restaurant-admin.md) | **Panel del Restaurante.** Preservar catálogo, modificadores, tiempos de cocina, branding y asistente Gemini AI. |
| [workflow.md](file:///home/arturo/Proyectos/Menulabarra/.agents/skills/la-barra-digital/workflow.md) | **Protocolo de Trabajo.** Algoritmo obligatorio de 10 pasos antes de editar código y filtro de evaluación de cambios. |

---

## 4. Principios Fundamentales

1. **Mobile-First Real:** Priorizar la navegación táctil con una mano y visualización óptima en celulares.
2. **Protagonismo del Alimento:** Fotografías grandes, jugosas y sangradas (*full-bleed*). Evitar encerrar hamburguesas en recuadros pequeños con padding.
3. **Identidad Cromática:** Fondo rojo vibrante, acentos y CTAs en amarillo, contenedores de contenido en café/beige y detalles en negro.
4. **Seguridad Robusta:** Validar permisos administrativos (`role == 'admin'`) en Firestore y nunca exponer claves privadas en el cliente.
5. **Arquitectura Modular:** Separación clara de submódulos manteniendo la simplicidad y la mantenibilidad.
