import webpush from "web-push";

import { adminDb } from "@/lib/firebase/admin";

type VapidKeys = { publicKey: string; privateKey: string };

export type PushPayload = { title: string; body: string; url: string };

const CONFIG_DOC = { collection: "serverConfig", id: "webPush" } as const;
const SUBJECT = "https://menulabarra.vercel.app/privacidad";

/**
 * Envía notificaciones con el estándar Web Push (sin depender del SDK de Firebase
 * en el navegador, que marcaba "no compatible" en algunos Chrome).
 *
 * Las llaves VAPID se leen de variables de entorno si existen; si no, el servidor las
 * genera una sola vez y las guarda en Firestore (`serverConfig/webPush`), colección que
 * las reglas no dejan leer desde el navegador.
 */
export class WebPushSender {
  private static keysPromise: Promise<VapidKeys> | null = null;

  static getKeys(): Promise<VapidKeys> {
    if (!WebPushSender.keysPromise) {
      WebPushSender.keysPromise = WebPushSender.loadKeys().catch((error) => {
        WebPushSender.keysPromise = null;
        throw error;
      });
    }
    return WebPushSender.keysPromise;
  }

  private static async loadKeys(): Promise<VapidKeys> {
    const envPublic = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY?.trim();
    const envPrivate = process.env.WEB_PUSH_PRIVATE_KEY?.trim();
    if (envPublic && envPrivate) return { publicKey: envPublic, privateKey: envPrivate };

    const ref = adminDb().collection(CONFIG_DOC.collection).doc(CONFIG_DOC.id);
    return adminDb().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const stored = snapshot.data() as Partial<VapidKeys> | undefined;
      if (stored?.publicKey && stored.privateKey) {
        return { publicKey: stored.publicKey, privateKey: stored.privateKey };
      }
      const generated = webpush.generateVAPIDKeys();
      transaction.set(ref, { ...generated, createdAt: Date.now() });
      return generated;
    });
  }

  /** Envía a varias suscripciones. Devuelve cuántas llegaron y cuáles ya no sirven (para borrarlas). */
  async send(tokens: readonly string[], payload: PushPayload) {
    const keys = await WebPushSender.getKeys();
    const invalidTokens: string[] = [];
    let successCount = 0;

    await Promise.all(
      tokens.map(async (token) => {
        let subscription: webpush.PushSubscription;
        try {
          subscription = JSON.parse(token) as webpush.PushSubscription;
          if (!subscription?.endpoint) throw new Error("sin endpoint");
        } catch {
          invalidTokens.push(token);
          return;
        }

        try {
          await webpush.sendNotification(subscription, JSON.stringify(payload), {
            vapidDetails: { subject: SUBJECT, publicKey: keys.publicKey, privateKey: keys.privateKey },
            TTL: 60 * 60,
            urgency: "high"
          });
          successCount += 1;
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) invalidTokens.push(token);
          else console.error("Error al enviar Web Push:", statusCode, (error as Error).message);
        }
      })
    );

    return { successCount, invalidTokens };
  }
}
