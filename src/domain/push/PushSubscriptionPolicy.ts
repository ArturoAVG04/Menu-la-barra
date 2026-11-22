/**
 * Revisa que una suscripción Web Push sea de un servicio real (Google, Mozilla, Apple, Microsoft)
 * antes de guardarla. Así nadie puede hacer que el servidor mande peticiones a cualquier URL
 * ni llenar la base con textos enormes.
 */
export class PushSubscriptionPolicy {
  static readonly MAX_LENGTH = 4096;

  private static readonly ALLOWED_HOSTS = [
    /(^|\.)fcm\.googleapis\.com$/,
    /(^|\.)android\.googleapis\.com$/,
    /(^|\.)push\.services\.mozilla\.com$/,
    /(^|\.)push\.apple\.com$/,
    /(^|\.)notify\.windows\.com$/
  ];

  /** Devuelve la suscripción normalizada (texto JSON) o null si no es válida. */
  static normalize(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const text = raw.trim();
    if (!text || text.length > PushSubscriptionPolicy.MAX_LENGTH) return null;
    let parsed: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
    try {
      parsed = JSON.parse(text);
    } catch {
      return null;
    }
    if (typeof parsed?.endpoint !== "string") return null;
    if (typeof parsed.keys?.p256dh !== "string" || typeof parsed.keys?.auth !== "string") return null;
    let url: URL;
    try {
      url = new URL(parsed.endpoint);
    } catch {
      return null;
    }
    if (url.protocol !== "https:") return null;
    if (!PushSubscriptionPolicy.ALLOWED_HOSTS.some((host) => host.test(url.hostname))) return null;
    return JSON.stringify({ endpoint: parsed.endpoint, keys: { p256dh: parsed.keys.p256dh, auth: parsed.keys.auth } });
  }
}
