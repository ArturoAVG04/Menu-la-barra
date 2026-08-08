# Experiencia del Producto y Canales: La Barra Digital

Este documento define la interacción del cliente antes, durante y después del pedido, así como los criterios para canales sociales, retención y futuras integraciones.

---

## 1. Canales de Entrada del Cliente

El menú debe adaptarse sin problemas según el punto de entrada:

* **Código QR (En Mesa / mostrador):** Autoselecciona la sucursal y la mesa si viene parametrizado en la URL.
* **Enlace de Instagram / WhatsApp:** Carga el menú optimizado para la sucursal principal o sugiere la más cercana.
* **PWA Instalada:** Abre directamente la aplicación sin barras del navegador, manteniendo la sucursal previa en memoria.

---

## 2. Reducción de Incertidumbre Post-Pedido

Una vez confirmado el pedido, la interfaz debe comunicar el estado de forma transparente para eliminar la ansiedad del cliente:

```text
  [ Pedido Recibido ] ──► Registrado en Firestore y enviado a la cocina.
           │
           ▼
  [ Pedido Aceptado ] ──► La cocina confirmó la recepción y los tiempos.
           │
           ▼
    [ Preparando ]    ──► La hamburguesa está en la plancha (con contador estimado en min).
           │
           ▼
       [ Listo ]      ──► Listo para recoger en mostrador o entrega a mesa.
           │
           ▼
     [ Entregado ]    ──► Pedido completado exitosamente.
```

---

## 3. Retención del Cliente y PWA

La PWA debe servir como el canal de fidelización de La Barra para clientes frecuentes:

* **Recordar elecciones previas:** Permitir la opción de reordenar pedidos pasados con un solo toque (*"¿Pedir de nuevo tu BBQ Bacon Burger?"*).
* **Notificaciones útiles con consentimiento:** Avisar cuando el pedido esté listo o enviar promociones exclusivas con frecuencia moderada.
* **Personalización no invasiva:** Recomendar aderezos o acompañamientos basados en el historial sin dar la sensación de vigilancia agresiva.

---

## 4. Roles Claros para Canales de Contacto

No saturar la pantalla con íconos flotantes de redes sociales. Cada canal tiene un propósito exclusivo:

* **WhatsApp:** Canal principal para dudas inmediatas, soporte de pedidos, incidencias y envío del ticket estructurado del pedido.
* **Instagram:** Canal visual para conocer la marca, ver fotos de la comunidad y enterarse de promociones.

---

## 5. Criterio de Evaluación de Chat Interno

Existe la posibilidad futura de incorporar un chat en vivo dentro de la app. **NO implementar esta funcionalidad por simple sugerencia.**

Antes de escribir código para un chat interno, responder:

1. ¿Qué problema resuelve exactamente que WhatsApp no resuelva ya?
2. ¿Aumentará la carga operativa del personal del restaurante al exigir atender dos plataformas?
3. ¿Requiere infraestructura de servidores, moderación, storage y seguridad adicional?

> **Regla:** Si WhatsApp resuelve la comunicación de forma más simple y eficiente para el cliente y el restaurante, **se debe mantener WhatsApp y descartar el chat interno.**

---

## 6. Integración Futura con Dashboard Financiero

Existe un proyecto independiente para el control financiero de La Barra.

* **Estado Actual:** NO implementar conectores ni tablas financieras dentro del Menú Digital en este momento.
* **Lineamiento Arquitectónico:** Diseñar los modelos de pedidos y ventas de forma limpia (`total`, `subtotal`, `items`, `timestamp`, `sucursalID`) para que en el futuro puedan consumirse vía API pública sin necesidad de refactorizar la base de datos del menú.
