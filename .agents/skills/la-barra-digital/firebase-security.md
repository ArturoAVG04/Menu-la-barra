# Seguridad, Autenticación y Firebase: La Barra Digital

La seguridad de los datos de los clientes y la integridad del sistema del restaurante son prioritarias. Ocultar componentes en el frontend NO constituye seguridad.

---

## 1. Reglas de Seguridad en Firestore (`firestore.rules`)

Las reglas de Firestore deben validar el token de autenticación y los *custom claims* de administración en el servidor de Firebase.

### Especificación Estricta de Reglas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper para verificar si la solicitud proviene de un administrador autenticado
    function isAdmin() {
      return request.auth != null && request.auth.token.role == 'admin';
    }

    // Sucursales y Catálogo (Lectura pública, Escritura solo Administrador)
    match /sucursales/{branchId} {
      allow read: if true;
      allow write: if isAdmin();

      match /{document=**} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }

    // Pedidos (Creación pública, Lectura/Modificación reservada para Admin)
    // El cliente público consulta su pedido a través de la API segura /api/orders/[orderId]/track
    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Configuración de Branding (Lectura pública, Escritura solo Admin)
    match /branding/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

---

## 2. Manejo de Claves Secretas y Variables de Entorno

* **Prohibición de `NEXT_PUBLIC_` para Llaves Privadas:**
  * Ninguna clave de servicio de backend (ImgBB API key, Firebase Admin private key, Gemini API key, FCM server key) puede prefijarse con `NEXT_PUBLIC_`.
* **Subida Segura de Imágenes:**
  * Mover la carga de imágenes a ImgBB a un endpoint interno (`POST /api/admin/upload-image`), donde la clave viva exclusivamente en las variables de entorno del servidor Vercel / Node.

---

## 3. Validación de Roles y Custom Claims en Endpoints (API Routes)

Cualquier endpoint que realice operaciones administrativas (ej. cambiar estados de pedidos, generar descripciones con AI, modificar productos) debe seguir este patrón de verificación en `src/lib/server/auth.ts`:

```typescript
import { adminAuth } from "@/lib/firebase/admin";

export async function verifyAdminRequest(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No se proporcionó token de autenticación.");
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await adminAuth().verifyIdToken(idToken);

  if (decodedToken.role !== "admin") {
    throw new Error("Acceso denegado: se requieren permisos de administrador.");
  }

  return decodedToken;
}
```

---

## 4. Consulta Segura de Pedidos por el Cliente (Tracking Token)

* La lectura pública de un pedido por parte del cliente no debe exponer la base de datos completa.
* Al crear un pedido, el servidor genera un `trackingToken` único.
* La PWA consulta el pedido mediante `GET /api/orders/[orderId]/track?token=TRACKING_TOKEN`, retornando únicamente los campos públicos (`PublicTrackedOrder`) sin datos sensibles de la infraestructura.
