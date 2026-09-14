// Supabase Edge Function: push-notify
// Cara deploy: Supabase Dashboard -> Edge Functions -> Create a new function
// -> nama "push-notify" -> tempel isi file ini -> Deploy.
//
// Lalu di Edge Functions -> push-notify -> Settings -> Secrets, isi:
//   VAPID_PUBLIC_KEY      = BA9C0Ba3Pw8QIdWq1V7bIEwrhc5wVfwWgZUe7Do2X1FpE7yshExQPZCFhi21IwrzdvOe_4F6koBzppr-_UJN-Wk
//   VAPID_PRIVATE_KEY     = kdldLNA5yWhVNYyLmEF6o8rhx05t32WUInLneUdyZsk
//   PUSH_TRIGGER_SECRET   = (buat string rahasia sendiri, bebas — nanti dipakai
//                            juga sebagai <PUSH_TRIGGER_SECRET> di file SQL)
// SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah otomatis tersedia di Edge
// Function, tidak perlu diisi manual.
//
// PENTING soal kunci VAPID di atas: dua kunci ini sudah aku generate khusus
// buat kamu dan HANYA dipakai project ini. Simpan VAPID_PRIVATE_KEY dan
// PUSH_TRIGGER_SECRET hanya di Secrets Edge Function — jangan taruh di kode
// frontend. VAPID_PUBLIC_KEY sudah tertanam di app.js (aman untuk publik).

import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const PUSH_TRIGGER_SECRET = Deno.env.get("PUSH_TRIGGER_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails("mailto:portalrumah@example.com", VAPID_PUBLIC, VAPID_PRIVATE);

Deno.serve(async (req) => {
  if (req.headers.get("authorization") !== `Bearer ${PUSH_TRIGGER_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { family_id, actor_id, type, title, body } = await req.json();
  if (!family_id) return new Response("ok");

  const filter = actor_id
    ? `family_id=eq.${family_id}&user_id=neq.${actor_id}`
    : `family_id=eq.${family_id}`;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?${filter}&select=endpoint,p256dh,auth_key`,
    { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
  );
  const subs: { endpoint: string; p256dh: string; auth_key: string }[] = await res.json();

  await Promise.allSettled(
    (subs || []).map((s) =>
      webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
          JSON.stringify({ title, body, tag: type })
        )
        .catch(async (err: any) => {
          // Endpoint sudah mati (device uninstall/expired) -> bersihkan.
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(s.endpoint)}`,
              { method: "DELETE", headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
            );
          }
        })
    )
  );

  return new Response("ok");
});
