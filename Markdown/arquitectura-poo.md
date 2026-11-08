# Arquitectura orientada a objetos del menú

> Guía para entender (y explicar en clase) cómo está organizado el código. Rama: `refactor-poo`.

## Capas

```
src/
├── domain/            ← REGLAS DEL NEGOCIO. Clases puras de TypeScript, sin React ni Firebase.
│   ├── admin/         ProductDraft, ModifierDraft, SortOrder (formularios del admin)
│   ├── branding/      RgbColor
│   ├── menu/          Modifier, MenuProduct
│   ├── cart/          Cart (inmutable)
│   ├── order/         OrderPricing, OrderLifecycle, CustomerInfo, OrderBoard, OrderStatusChange
│   ├── branch/        BranchContact, BranchFactory
│   └── errors.ts      DomainError
├── infrastructure/    ← CÓMO se guardan/leen los datos (Firestore, API HTTP).
│   ├── firebase/      FirestoreRepository (base abstracta) → BranchRepository, CatalogRepository, OrderRepository
│   ├── api/           OrderApiClient
│   └── index.ts       instancias únicas: branchRepository, catalogRepository, orderRepository, orderApi
├── lib/server/        ← SOLO servidor: casos de uso (PlaceOrderService) y gateways con Firebase Admin.
├── features/          ← UI por funcionalidad (componentes pequeños + hooks que usan el dominio).
│   ├── customer/
│   └── admin/         AdminShell + layout/, orders/, branches/, menu/, branding/, images/, hooks/
└── app/               ← Rutas de Next.js (páginas y /api). Solo arman piezas, sin lógica.
```

**Regla de dependencia:** `app → features → infrastructure → domain`. El dominio no importa nada de las otras capas.

## Conceptos de POO aplicados

| Concepto | Dónde |
|---|---|
| **Encapsulamiento** | `MenuProduct` guarda los datos en privado y expone `currentPrice`, `isOnSale`, `unitPriceFor()`. Nadie calcula precios "a mano" fuera de la clase. |
| **Abstracción** | `OrderGateway` (interfaz): `PlaceOrderService` no sabe si los datos vienen de Firestore o de una prueba. |
| **Herencia** | `FirestoreRepository` (clase abstracta) → `BranchRepository`, `CatalogRepository`, `OrderRepository`. |
| **Polimorfismo** | Cualquier objeto que implemente `OrderGateway` sirve (Firestore real o uno falso en pruebas). |
| **Inmutabilidad / objetos de valor** | `Cart` devuelve un carrito nuevo en cada operación; `CustomerInfo` es un objeto de valor validado. En el admin, `ProductDraft` y `ModifierDraft` son borradores inmutables que se guardan tal cual en el estado de React. |
| **Inyección de dependencias** | `new PlaceOrderService(gateway, legalVersion, now)`. |
| **Responsabilidad única** | Cada clase hace una cosa: `OrderPricing` calcula, `OrderApiClient` habla con la API, los componentes solo pintan. |

## Diagrama de clases

```mermaid
classDiagram
  class Modifier { +id +name +isRequired +allowsMultiple +resolve(optionIds) }
  class MenuProduct { +currentPrice +isOnSale +isAvailable +resolveChoices() +unitPriceFor() }
  class Cart { +items +itemCount +subtotal +add() +replace() +setQuantity() +remove() +totalWithTip() }
  class OrderPricing { +price(lines, tipPercent) PricedOrder }
  class OrderLifecycle { +label() +canTransition() +estimatedMinutes() }
  class CustomerInfo { +name +phone +note +create() }
  class PlaceOrderService { +execute(request) }
  class OrderGateway { <<interface>> findBranch() findProducts() saveOrder() notifyAdmins() }
  class FirestoreOrderGateway
  class FirestoreRepository { <<abstract>> #toEntity() #sortBySortOrder() }
  MenuProduct *-- Modifier
  OrderPricing --> MenuProduct
  PlaceOrderService --> OrderPricing
  PlaceOrderService --> CustomerInfo
  PlaceOrderService --> OrderGateway
  FirestoreOrderGateway ..|> OrderGateway
  FirestoreRepository <|-- BranchRepository
  FirestoreRepository <|-- CatalogRepository
  FirestoreRepository <|-- OrderRepository
```

## Reglas del proyecto
1. La lógica de negocio va en `domain/` con pruebas (`npm test`). Los componentes no calculan precios ni estados.
2. Los componentes no importan `firebase/*` directamente: usan `@/infrastructure`.
3. Componentes de máximo ~250 líneas; si crecen, se dividen. Un hook por responsabilidad (`useCart`, `useActiveOrder`…).
4. Nombres en inglés para código, textos de la UI en español.
5. `lib/services/menu.ts` es una fachada vieja: no usarla en código nuevo.
