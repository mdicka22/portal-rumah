const CACHE_NAME='portal-rumah-v31';const APP_SHELL=['./','./index.html','./app.js?v=31','./ui.js?v=31','./weather.js?v=31','./finance.js?v=31','./hojak.js?v=31','./edit.js?v=31','./notify.js?v=31','./i18n.js?v=31','./styles.css?v=31','./assets/login-interior-coral.webp','./assets/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))))});
/* ---- Notifikasi push gaya WhatsApp ----
   Judul = nama pengirim, pesan beruntun digabung ("3 pesan baru"), getar, dan angka di ikon aplikasi.
   Saat aplikasi sedang terbuka, notifikasi sistem disenyapkan lalu ditutup (banner di dalam aplikasi
   yang menampilkannya); iOS tetap mewajibkan setiap push memunculkan notifikasi, jadi tidak dilewati. */
const BADGE_ICON='./assets/apple-touch-icon.png';
async function updateBadge(){
  try{
    const open=await self.registration.getNotifications();
    if(open.length&&self.navigator.setAppBadge)await self.navigator.setAppBadge(open.length);
    else if(self.navigator.clearAppBadge)await self.navigator.clearAppBadge();
  }catch{}
}
self.addEventListener('push',event=>{
  event.waitUntil((async()=>{
    let data={};
    try{data=event.data?event.data.json():{}}catch{data={body:event.data?event.data.text():''}}
    const type=data.type||'keluarga',tag=data.tag||type,sender=data.sender||'';
    const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
    const foreground=windows.some(w=>w.visibilityState==='visible');
    const previous=await self.registration.getNotifications({tag});
    const count=(previous[0]?.data?.count||0)+1;
    let title=data.title||'Portal Rumah';
    if(type==='chat'&&count>1)title=(sender||title)+' ('+count+' pesan)';
    await self.registration.showNotification(title,{
      body:data.body||'Ada kabar baru dari keluarga',
      icon:BADGE_ICON,badge:BADGE_ICON,tag,renotify:true,silent:foreground,
      vibrate:foreground?undefined:[120,60,120],timestamp:data.ts||Date.now(),
      data:{url:data.url||'./',count,type},
      actions:[{action:'open',title:'Buka'}]
    });
    if(foreground){
      await new Promise(resolve=>setTimeout(resolve,1200));
      (await self.registration.getNotifications({tag})).forEach(n=>n.close());
    }else await updateBadge();
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'./',self.location.origin).href;
  event.waitUntil((async()=>{
    await updateBadge();
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of list){
      if('navigate' in client)await client.navigate(target);
      if('focus' in client)return client.focus();
    }
    if(clients.openWindow)return clients.openWindow(target);
  })());
});
/* Aplikasi dibuka kembali: tutup semua notifikasi dan hapus angka di ikon. */
self.addEventListener('message',event=>{
  if(event.data?.type!=='clear')return;
  event.waitUntil((async()=>{
    (await self.registration.getNotifications()).forEach(n=>n.close());
    try{if(self.navigator.clearAppBadge)await self.navigator.clearAppBadge()}catch{}
  })());
});
