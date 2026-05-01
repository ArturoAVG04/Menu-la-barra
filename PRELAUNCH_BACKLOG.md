# Backlog de Pre-Lanzamiento

Backlog tecnico accionable para cerrar el proyecto antes de salida real. Esta version refleja el estado actual del repo y evita re-implementar piezas que ya existen.

## Resumen Ejecutivo

### Ya existe

- Base PWA con `manifest.json` y registro de service workers.
- Base Firebase Cloud Messaging en cliente.
- Seguimiento de pedidos y cambio de estados desde admin.
- Horarios semanales por sucursal.
- WhatsApp por sucursal.
- Banner principal con overlay y blur inicial.

### Parcial

- PWA offline estable en produccion.
- Push notifications reales de punta a punta.
- UX de permisos para notificaciones.
- Legibilidad del banner cuando la portada trae texto incrustado.

### Faltante

- Zona horaria fija de Ciudad de Mexico para abierto/cerrado.
- Ticket automatico por WhatsApp con carrito y total.
- Geolocalizacion con recomendacion de sucursal.
- Persistencia y envio real de tokens FCM.

## Fase 1: Salida Segura

### Tarea 1. Unificar estrategia de service worker

Prioridad: Alta

Objetivo:
- Evitar conflictos entre `sw.js` y `firebase-messaging-sw.js`.
- Dejar una sola estrategia clara para cache offline y push.

Archivos a revisar:
- [src/components/pwa/PWARegistration.tsx](/home/arturo/Proyectos/Menulabarra/src/components/pwa/PWARegistration.tsx:8)
- [public/sw.js](/home/arturo/Proyectos/Menulabarra/public/sw.js:1)
- [public/firebase-messaging-sw.js](/home/arturo/Proyectos/Menulabarra/public/firebase-messaging-sw.js:1)
- [next.config.ts](/home/arturo/Proyectos/Menulabarra/next.config.ts:1)

Trabajo esperado:
- Decidir si se mantiene un solo service worker custom o si se migra a una integracion mas formal.
- Ajustar el registro para no pisar scopes innecesariamente.
- Validar cache de app shell y actualizacion de version.
- Confirmar que en desarrollo se limpien caches sin romper el flujo.

Criterio de salida:
- La app instala PWA correctamente.
- La app funciona con cache basico offline.
- No hay comportamiento inconsistente por doble service worker.

Riesgo:
- Alto. Hoy es el punto mas sensible porque mezcla PWA y FCM.

### Tarea 2. Completar push notifications reales con FCM

Prioridad: Alta

Objetivo:
- Convertir la base actual de notificaciones en un flujo real de mercado.

Archivos a revisar:
- [src/components/pwa/PWARegistration.tsx](/home/arturo/Proyectos/Menulabarra/src/components/pwa/PWARegistration.tsx:37)
- [src/lib/firebase/config.ts](/home/arturo/Proyectos/Menulabarra/src/lib/firebase/config.ts:1)
- [src/components/admin/AdminShell.tsx](/home/arturo/Proyectos/Menulabarra/src/components/admin/AdminShell.tsx:211)
- [src/lib/services/menu.ts](/home/arturo/Proyectos/Menulabarra/src/lib/services/menu.ts:144)
- [public/firebase-messaging-sw.js](/home/arturo/Proyectos/Menulabarra/public/firebase-messaging-sw.js:1)

Trabajo esperado:
- Guardar token FCM de cliente en Firestore.
- Definir modelo de asociacion de token:
  - por pedido
  - por sesion
  - o por cliente recurrente
- Agregar backend seguro para enviar push cuando cambia el estado.
- Disparar notificacion para:
  - pedido aceptado
  - pedido listo
  - opcional: pedido rechazado
- Mantener notificacion local como fallback si la app esta abierta.

Dependencias:
- Requiere decidir si se usaran Cloud Functions o backend externo.

Criterio de salida:
- Un pedido cambia de estado en admin y el cliente recibe push real fuera del primer plano.

Riesgo:
- Alto. Sin backend seguro no debe enviarse FCM desde cliente.

### Tarea 3. Fijar logica horaria a `America/Mexico_City`

Prioridad: Alta

Objetivo:
- Hacer que "abierta/cerrada" dependa del reloj del negocio y no del celular del cliente.

Archivos a revisar:
- [src/lib/branchHours.ts](/home/arturo/Proyectos/Menulabarra/src/lib/branchHours.ts:1)
- [src/components/customer/BranchSelector.tsx](/home/arturo/Proyectos/Menulabarra/src/components/customer/BranchSelector.tsx:1)
- [src/components/customer/CustomerShell.tsx](/home/arturo/Proyectos/Menulabarra/src/components/customer/CustomerShell.tsx:571)
- [src/components/admin/AdminShell.tsx](/home/arturo/Proyectos/Menulabarra/src/components/admin/AdminShell.tsx:530)
- [package.json](/home/arturo/Proyectos/Menulabarra/package.json:1)

Trabajo esperado:
- Instalar `date-fns-tz`.
- Reescribir la lectura de dia y hora actual usando `America/Mexico_City`.
- Centralizar esta logica en `branchHours.ts`.
- Confirmar comportamiento en cruces de medianoche.

Criterio de salida:
- Todas las vistas muestran abierto/cerrado igual aunque el dispositivo del cliente tenga otra zona horaria.

Riesgo:
- Medio-alto. Afecta disponibilidad real y conversion.

### Tarea 4. Generar ticket automatico para WhatsApp

Prioridad: Alta

Objetivo:
- Permitir que el pedido tambien llegue como mensaje estructurado al restaurante.

Archivos a revisar:
- [src/components/customer/CustomerShell.tsx](/home/arturo/Proyectos/Menulabarra/src/components/customer/CustomerShell.tsx:65)
- [src/lib/services/menu.ts](/home/arturo/Proyectos/Menulabarra/src/lib/services/menu.ts:113)
- [src/types/index.ts](/home/arturo/Proyectos/Menulabarra/src/types/index.ts:95)

Trabajo esperado:
- Crear helper para construir el texto del ticket.
- Incluir:
  - sucursal
  - cliente
  - telefono
  - productos
  - modificadores
  - nota
  - subtotal
  - propina
  - total
- Generar `wa.me/<numero>?text=<mensaje>`.
- Integrar un CTA claro desde carrito o confirmacion.

Criterio de salida:
- El usuario puede abrir WhatsApp con el pedido precargado en formato legible.

Riesgo:
- Medio. Hay que cuidar longitud, encoding y casos sin telefono configurado.

## Fase 2: Optimización Comercial

### Tarea 5. Geolocalizacion y recomendacion de sucursal

Prioridad: Media

Objetivo:
- Sugerir la sucursal abierta mas cercana para reducir friccion inicial.

Archivos a revisar:
- [src/components/customer/CustomerShell.tsx](/home/arturo/Proyectos/Menulabarra/src/components/customer/CustomerShell.tsx:1)
- [src/components/customer/BranchSelector.tsx](/home/arturo/Proyectos/Menulabarra/src/components/customer/BranchSelector.tsx:1)
- [src/types/index.ts](/home/arturo/Proyectos/Menulabarra/src/types/index.ts:1)
- [src/components/admin/AdminShell.tsx](/home/arturo/Proyectos/Menulabarra/src/components/admin/AdminShell.tsx:44)

Trabajo esperado:
- Agregar `latitude` y `longitude` al modelo de sucursal.
- Permitir editar esas coordenadas desde admin.
- Pedir geolocalizacion con contexto y fallback amable.
- Implementar Haversine.
- Filtrar primero sucursales abiertas.
- Autoseleccionar o destacar la mejor opcion.

Criterio de salida:
- La primera visita recomienda la mejor sucursal sin bloquear al usuario si niega permisos.

Riesgo:
- Medio. Requiere datos limpios de coordenadas por sucursal.

### Tarea 6. Rediseñar banner principal para legibilidad robusta

Prioridad: Media

Objetivo:
- Evitar choque entre texto HTML y texto incrustado dentro de la imagen.

Archivos a revisar:
- [src/components/customer/CustomerShell.tsx](/home/arturo/Proyectos/Menulabarra/src/components/customer/CustomerShell.tsx:595)

Trabajo esperado:
- Separar visualmente la imagen de la bandeja textual.
- Reforzar contraste para nombre, direccion y estado.
- Ajustar alto y espaciado en mobile.
- Mantener branding actual sin romper el look existente.

Recomendacion de diseño:
- Imagen arriba.
- Bandeja oscura o cristal abajo para contenido.
- Evitar depender solo del blur para legibilidad.

Criterio de salida:
- El encabezado sigue siendo legible incluso con una portada visualmente cargada.

Riesgo:
- Medio-bajo. Es mas de UX que de arquitectura.

### Tarea 7. Afinar UX de permisos y mensajes

Prioridad: Media

Objetivo:
- Pedir permisos de notificacion en el mejor momento posible.

Archivos a revisar:
- [src/components/pwa/PWARegistration.tsx](/home/arturo/Proyectos/Menulabarra/src/components/pwa/PWARegistration.tsx:37)
- [src/components/customer/CustomerShell.tsx](/home/arturo/Proyectos/Menulabarra/src/components/customer/CustomerShell.tsx:214)

Trabajo esperado:
- Evaluar si pedir permiso al cargar sigue siendo buena idea.
- Mover la solicitud a un momento de mayor intencion:
  - despues del primer pedido
  - al abrir tracking
  - o tras instalar la PWA
- Mejorar textos visibles para el usuario.

Criterio de salida:
- Mejor tasa de aceptacion de permisos sin empeorar conversion.

Riesgo:
- Medio. Impacta UX, no bloquea salida tecnica.

## Dependencias y Decisiones Previas

Antes de implementar, conviene cerrar estas decisiones:

1. Si FCM se enviara con Cloud Functions de Firebase o con backend externo.
2. Si el ticket de WhatsApp se abre como paso opcional o como parte del flujo principal tras crear el pedido.
3. Si la geolocalizacion autoselecciona sucursal o solo la recomienda.
4. Si el banner se corrige por codigo solamente o tambien se impondran lineamientos para subir portadas sin texto.

## Orden Recomendado

1. Tarea 1. Unificar strategy de service worker.
2. Tarea 2. Completar push notifications reales.
3. Tarea 3. Fijar zona horaria.
4. Tarea 4. Ticket automatico por WhatsApp.
5. Tarea 5. Geolocalizacion.
6. Tarea 6. Rediseño del banner.
7. Tarea 7. UX de permisos.

## Primer Sprint Sugerido

Si queremos avanzar ya, el primer sprint deberia cubrir solo esto:

1. Resolver arquitectura PWA + FCM.
2. Implementar backend seguro para push.
3. Corregir zona horaria.
4. Dejar ticket WhatsApp listo.

Eso nos deja una version mucho mas cercana a uso real sin esperar el bloque de optimizacion visual y geolocalizacion.
