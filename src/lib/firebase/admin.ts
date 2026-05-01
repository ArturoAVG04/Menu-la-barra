import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

function sanitizeEnv(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, "") ?? "";
}

function getPrivateKey() {
  const value = sanitizeEnv(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  return value.replace(/\\n/g, "\n");
}

function getFirebaseAdminConfig() {
  const projectId =
    sanitizeEnv(process.env.FIREBASE_ADMIN_PROJECT_ID) ||
    sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const clientEmail = sanitizeEnv(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey
  };
}

export function isFirebaseAdminConfigured() {
  return getFirebaseAdminConfig() !== null;
}

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const config = getFirebaseAdminConfig();
  if (!config) {
    throw new Error(
      "Firebase Admin SDK no está configurado. Define FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert(config),
    projectId: config.projectId
  });
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminMessaging() {
  return getMessaging(getAdminApp());
}
