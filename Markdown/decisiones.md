# Bitácora de Decisiones de Proyecto: La Barra Digital

Registro de decisiones técnicas, comerciales y de arquitectura tomadas durante la evolución del producto.

---

## Decisiones Principales

1. **Ubicación de la Skill Especializada:**
   * La Skill `la-barra-digital` reside exclusivamente dentro de `.agents/skills/la-barra-digital/` para ser consumida directamente por los agentes de IA (Antigravity / Codex).
   * La documentación general del proyecto reside dentro de la carpeta `Markdown/`.

2. **Identidad Cromática:**
   * **Rojo:** Color principal y fondo dominante.
   * **Amarillo:** Énfasis, CTAs, precios e indicadores.
   * **Café / Beige:** Superficie para tarjetas de comida y modales de contenido.
   * **Negro:** Estructura, peso visual y contraste.

3. **Canales de Interacción:**
   * **WhatsApp:** Dudas, incidencias y envío del ticket estructurado de pedido.
   * **Instagram:** Canal visual de marca y promociones.
   * **Chat Interno:** No implementar a menos que resuelva un problema no cubierto por WhatsApp.

4. **Flujo de Seguridad:**
   * Las reglas de Firestore deben validar el rol `admin` para modificaciones y lecturas privilegiadas.
   * La consulta pública de pedidos se realiza mediante endpoint protegido con token de rastreo único (`trackingToken`).
