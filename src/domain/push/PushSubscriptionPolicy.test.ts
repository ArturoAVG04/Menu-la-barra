import { describe, expect, it } from "vitest";

import { PushSubscriptionPolicy } from "./PushSubscriptionPolicy";

const keys = { p256dh: "abc", auth: "def" };
const sub = (endpoint: string, extra: object = {}) => JSON.stringify({ endpoint, keys, ...extra });

describe("PushSubscriptionPolicy", () => {
  it("acepta servicios push conocidos y quita campos de más", () => {
    const out = PushSubscriptionPolicy.normalize(sub("https://fcm.googleapis.com/fcm/send/x", { extra: 1 }));
    expect(out).toBe(JSON.stringify({ endpoint: "https://fcm.googleapis.com/fcm/send/x", keys }));
    expect(PushSubscriptionPolicy.normalize(sub("https://updates.push.services.mozilla.com/wpush/v2/x"))).not.toBeNull();
    expect(PushSubscriptionPolicy.normalize(sub("https://web.push.apple.com/x"))).not.toBeNull();
  });

  it("rechaza URLs arbitrarias, http, JSON roto y textos enormes", () => {
    expect(PushSubscriptionPolicy.normalize(sub("https://evil.example.com/x"))).toBeNull();
    expect(PushSubscriptionPolicy.normalize(sub("https://fcm.googleapis.com.evil.com/x"))).toBeNull();
    expect(PushSubscriptionPolicy.normalize(sub("http://fcm.googleapis.com/x"))).toBeNull();
    expect(PushSubscriptionPolicy.normalize("{no json")).toBeNull();
    expect(PushSubscriptionPolicy.normalize(JSON.stringify({ endpoint: "https://fcm.googleapis.com/x" }))).toBeNull();
    expect(PushSubscriptionPolicy.normalize("x".repeat(5000))).toBeNull();
    expect(PushSubscriptionPolicy.normalize(42)).toBeNull();
  });
});
