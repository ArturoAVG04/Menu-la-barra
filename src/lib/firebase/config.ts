import { getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

function sanitizeEnv(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, "") ?? "";
}

const firebaseConfig = {
  apiKey: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

if (typeof window !== "undefined") {
  void setPersistence(auth, browserLocalPersistence);
}

export async function getMessagingClient() {
  const vapidKey = sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
  if (!vapidKey) return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getMessaging(app);
}

export function getFirebaseVapidKey() {
  return sanitizeEnv(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
}
