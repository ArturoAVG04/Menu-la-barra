const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs");
const path = require("path");

// Cargar variables de .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

function getPrivateKey() {
  const value = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
  return value.replace(/\\n/g, "\n");
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = getPrivateKey();

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Error: Faltan variables de Firebase Admin en .env.local.");
  console.error("Asegúrate de definir FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY en tu .env.local.");
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey
  }),
  projectId
});

const adminAuth = getAuth(app);

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.log("Uso: node scripts/set-admin.js correo@ejemplo.com");
  process.exit(1);
}

async function setAdminRole() {
  try {
    const user = await adminAuth.getUserByEmail(targetEmail);
    await adminAuth.setCustomUserClaims(user.uid, { role: "admin" });
    console.log(`✅ ¡Éxito! Se ha asignado el rol 'admin' al usuario: ${user.email} (UID: ${user.uid})`);
    console.log("Nota: Cierra sesión e inicia sesión nuevamente en la aplicación para refrescar el token.");
  } catch (error) {
    console.error("❌ Error al asignar el rol admin:", error.message);
  }
}

setAdminRole();
