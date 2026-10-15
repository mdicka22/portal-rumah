import webpush from "npm:web-push@3.6.7";

function normalizeBase64Url(value: string | undefined) {
  return (value || "").trim().replace(/^["']|["']$/g, "").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
const VAPID_PUBLIC = normalizeBase64Url(Deno.env.get("VAPID_PUBLIC_KEY"));
const VAPID_PRIVATE = normalizeBase64Url(Deno.env.get("VAPID_PRIVATE_KEY"));
const PUSH_TRIGGER_SECRET = Deno.env.get("PUSH_TRIGGER_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
function getServiceKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return keys.default || Object.values(keys)[0] || "";
  } catch {
    return "";
  }
}
const SERVICE_ROLE = String(getServiceKey());

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const cleanSecret = (value: string | null | undefined) => (value || "").trim().replace(/^["']+|["']+$/g, "").trim();
    const suppliedSecret = cleanSecret(req.headers.get("x-push-secret"));
    const expectedSecret = cleanSecret(PUSH_TRIGGER_SECRET);
    if (!expectedSecret || suppliedSecret !== expectedSecret) {
      return Response.json({ error: "Unauthorized webhook", version: "push-v3", receivedLength: suppliedSecret.length, expectedLength: expectedSecret.length }, { status: 401 });
    }
    const missing = [!VAPID_PUBLIC && "VAPID_PUBLIC_KEY", !VAPID_PRIVATE && "VAPID_PRIVATE_KEY", !SUPABASE_URL && "SUPABASE_URL", !SERVICE_ROLE && "Supabase secret/service role key"].filter(Boolean);
    if (missing.length) return Response.json({ error: "Secret belum lengkap", missing }, { status: 500 });
    if (VAPID_PRIVATE.length !== 43) return Response.json({ error: "VAPID_PRIVATE_KEY tidak valid", expected: "43 karakter Base64 URL-safe", actualLength: VAPID_PRIVATE.length }, { status: 500 });
    if (VAPID_PUBLIC.length !== 87) return Response.json({ error: "VAPID_PUBLIC_KEY tidak valid", expected: "87 karakter Base64 URL-safe", actualLength: VAPID_PUBLIC.length }, { status: 500 });
    webpush.setVapidDetails("https://portal-rumah.vercel.app", VAPID_PUBLIC, VAPID_PRIVATE);

    const incoming = await req.json();
  const source = incoming?.record ? { ...incoming.record, ...incoming } : incoming;
  const { family_id, actor_id, type, title, body } = source;
    if (!family_id) return Response.json({ ok: true, sent: 0 });

  const filter = actor_id
    ? `family_id=eq.${family_id}&user_id=neq.${actor_id}`
    : `family_id=eq.${family_id}`;
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?${filter}&select=endpoint,p256dh,auth_key`,
    { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
  );
    if (!response.ok) return Response.json({ error: "Gagal membaca push_subscriptions", status: response.status, detail: await response.text() }, { status: 500 });

  const subscriptions = await response.json();
  let sent = 0;
  let removed = 0;
  const deliveryErrors: Array<{ status: number | null; message: string }> = [];
  const results = await Promise.allSettled(subscriptions.map(async (subscription: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } },
        JSON.stringify({
          title: title || "Portal Rumah",
          body: body || "Ada kabar baru dari keluarga",
          tag: `${type || "keluarga"}-${family_id}`,
          url: type === "chat" ? "./?open=chat" : type === "agenda" ? "./?open=agenda" : "./?open=quest",
        }),
      );
      sent += 1;
    } catch (error: any) {
      const detail = {
        status: typeof error?.statusCode === "number" ? error.statusCode : null,
        message: String(error?.body || error?.message || "Push gagal").slice(0, 240),
      };
      deliveryErrors.push(detail);
      console.error("push delivery failed", detail);
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(subscription.endpoint)}`, {
          method: "DELETE",
          headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
        });
        removed += 1;
      }
      throw error;
    }
  }));

    return Response.json({
    ok: true,
    subscriptions: subscriptions.length,
    sent,
    failed: results.filter((result) => result.status === "rejected").length,
    removed,
    deliveryErrors,
    });
  } catch (error) {
    console.error("push-notify failed", error);
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
