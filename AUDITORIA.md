# Guía para el auditor del menú de La Barra

> La leen el auditor y el piloto de prueba (skill `auditar`) antes de usar el menú. No necesitan ver el código.

## Qué es
Menú digital de **La Barra** (hamburguesas, alitas y snacks en Guanajuato). Un cliente entra desde un QR o un link, elige sucursal, ve productos con precio, personaliza (salsa, bebida, cambiar hamburguesa), arma su pedido y lo manda. Lo usan personas de cualquier edad, casi siempre desde el celular. También debe verse bien en computadora.

## Cómo abrirlo
- Local (después de `npm run build && npx next start -p 3123` en `~/Proyectos/Menulabarra`): `http://localhost:3123`
- En línea: `https://menulabarra.vercel.app`
- Navegar: `node ~/second-brain/herramientas/auditor/navegar.mjs <url> <pasos.json> <capturas>`
- Medir legibilidad: `node ~/second-brain/herramientas/auditor/medir-legibilidad.mjs <url> "" <capturas>`

## ⚠️ Prohibido
**NO envíes un pedido real.** Los datos son reales: el pedido le llega a la cocina. Puedes llenar el formulario, pero NO toques el botón final de enviar o confirmar pedido.

## Reglas que siempre deben cumplirse
| Regla | Cómo revisarla |
|---|---|
| El precio se ve en cada producto, con `$` y sin ".00" | Captura del menú |
| Total del carrito = suma de (precio + extras) × cantidad | Agrega 2 productos con extras y compara los números |
| Un extra con costo (ej. "Cheese Bacon +$29") suma ese monto exacto | Antes y después de elegirlo |
| Las opciones obligatorias (bebida, salsa) no dejan agregar sin elegir, y dicen por qué | Intenta agregar sin elegir |
| Agotado se ve con texto, no solo en gris | Busca productos agotados |
| Al tocar una categoría arriba, el título de esa sección queda visible (no tapado) | Toca cada pestaña |
| Letra: texto ≥ 16 px (descripciones 15 px), contraste ≥ 4.5:1, botones ≥ 44 px | `medir-legibilidad.mjs` |
| Sin scroll de lado a 320 px ni con la letra al 200 % | `medir-legibilidad.mjs` |

## Tareas típicas de un cliente
1. Encontrar el precio de una hamburguesa Hawaiana.
2. Pedir 10 alitas Mango Habanero y unas papas.
3. Armar el Combo 1 con Coca-Cola y cambiarlo a Cheese Bacon. Revisar que el total suba $29.
4. Buscar "boneless" con el buscador.
5. Quitar un producto del carrito y cambiar cantidades.
6. Llegar al formulario de datos y leer qué pide (sin enviar).
7. Cambiar de sucursal.
