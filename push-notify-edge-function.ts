// Supabase Edge Function: push-notify (v4)
// Cara deploy: Supabase Dashboard -> Edge Functions -> push-notify -> Code ->
// tempel isi file ini -> Deploy. Verify JWT harus OFF (keamanan lewat header x-push-secret).
//
// Secrets (Edge Functions -> Secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_TRIGGER_SECRET.
// SUPABASE_URL dan kunci service role sudah otomatis tersedia di Edge Function.
//
// Dipanggil oleh trigger database (supabase-push-setup.sql). Isi payload:
//   family_id, actor_id, type, title, body, sender, target_user_id (opsional, untuk uji)
// type: chat | tugas | agenda | belanja | hojak | keuangan | test
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

// Halaman yang dibuka saat notifikasi diketuk.
const TYPE_URL: Record<string, string> = {
  chat: "./?open=chat",
  agenda: "./?open=agenda",
  tugas: "./?open=agenda",
  belanja: "./?open=shop",
  hojak: "./?open=hojak",
  keuangan: "./?open=money",
  test: "./",
};

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const cleanSecret = (value: string | null | undefined) => (value || "").trim().replace(/^["']+|["']+$/g, "").trim();
    const suppliedSecret = cleanSecret(req.headers.get("x-push-secret"));
    const expectedSecret = cleanSecret(PUSH_TRIGGER_SECRET);
    if (!expectedSecret || suppliedSecret !== expectedSecret) {
      return Response.json({ error: "Unauthorized webhook", version: "push-v4", receivedLength: suppliedSecret.length, expectedLength: expectedSecret.length }, { status: 401 });
    }
    const missing = [!VAPID_PUBLIC && "VAPID_PUBLIC_KEY", !VAPID_PRIVATE && "VAPID_PRIVATE_KEY", !SUPABASE_URL && "SUPABASE_URL", !SERVICE_ROLE && "Supabase secret/service role key"].filter(Boolean);
    if (missing.length) return Response.json({ error: "Secret belum lengkap", missing }, { status: 500 });
    if (VAPID_PRIVATE.length !== 43) return Response.json({ error: "VAPID_PRIVATE_KEY tidak valid", expected: "43 karakter Base64 URL-safe", actualLength: VAPID_PRIVATE.length }, { status: 500 });
    if (VAPID_PUBLIC.length !== 87) return Response.json({ error: "VAPID_PUBLIC_KEY tidak valid", expected: "87 karakter Base64 URL-safe", actualLength: VAPID_PUBLIC.length }, { status: 500 });
    webpush.setVapidDetails("https://portal-rumah.vercel.app", VAPID_PUBLIC, VAPID_PRIVATE);

    const incoming = await req.json();
    const source = incoming?.record ? { ...incoming.record, ...incoming } : incoming;
    const { family_id, actor_id, type, title, body, sender, target_user_id } = source;
    if (!family_id) return Response.json({ ok: true, sent: 0 });
    const kind = String(type || "keluarga");

    // Penerima: satu keluarga, kecuali pelaku sendiri; untuk uji, hanya perangkat pengguna itu.
    let filter = `family_id=eq.${family_id}`;
    if (target_user_id) filter += `&user_id=eq.${target_user_id}`;
    else if (actor_id) filter += `&user_id=neq.${actor_id}`;
    const headers = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };
    const select = "&select=endpoint,p256dh,auth_key";

    // Lewati perangkat yang sudah membisukan jenis notifikasi ini (kolom muted dari SQL v2).
    let response = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?${filter}&muted=not.cs.${encodeURIComponent(`{${kind}}`)}${select}`, { headers });
    if (response.status === 400) {
      // Kolom muted belum ada (SQL v2 belum dijalankan): kirim ke semua perangkat.
      response = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?${filter}${select}`, { headers });
    }
    if (!response.ok) {
      return Response.json({ error: "Gagal membaca push_subscriptions", status: response.status, detail: await response.text() }, { status: 500 });
    }

    const subscriptions = await response.json();
    const payload = JSON.stringify({
      title: title || "Portal Rumah",
      body: body || "Ada kabar baru dari keluarga",
      type: kind,
      sender: sender || "",
      tag: kind,
      url: TYPE_URL[kind] || "./",
      ts: Date.now(),
    });

    let sent = 0;
    let removed = 0;
    const deliveryErrors: Array<{ status: number | null; message: string }> = [];
    const results = await Promise.allSettled(subscriptions.map(async (subscription: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } },
          payload,
          { TTL: 60 * 60 * 24, urgency: kind === "chat" || kind === "test" ? "high" : "normal" },
        );
        sent += 1;
      } catch (error: any) {
        const detail = {
          status: typeof error?.statusCode === "number" ? error.statusCode : null,
          message: String(error?.body || error?.message || "Push gagal").slice(0, 240),
        };
        deliveryErrors.push(detail);
        console.error("push delivery failed", detail);
        // Perangkat sudah tidak berlaku (aplikasi dihapus / izin dicabut): bersihkan.
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(subscription.endpoint)}`, { method: "DELETE", headers });
          removed += 1;
        }
        throw error;
      }
    }));

    return Response.json({
      ok: true,
      version: "push-v4",
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
