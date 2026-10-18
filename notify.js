/* Notifikasi: banner di dalam aplikasi (gaya WhatsApp), pengaturan notifikasi, uji, dan
   pemeliharaan langganan push. Notifikasi sistem (saat aplikasi ditutup) dikirim server lewat
   Edge Function push-notify dan ditampilkan service-worker.js. Dimuat setelah edit.js. */
(()=>{
const PREFS_KEY='portalNotif',ENDPOINT_KEY='portalPushEndpoint';
const prefs=(()=>{try{return {banner:true,sound:true,muted:[],...JSON.parse(localStorage.getItem(PREFS_KEY)||'{}')}}catch{return {banner:true,sound:true,muted:[]}}})();
const savePrefs=()=>{try{localStorage.setItem(PREFS_KEY,JSON.stringify(prefs))}catch{}};
const GROUPS=[
  {id:'chat',label:'Pesan keluarga',hint:'Chat dari anggota lain',types:['chat'],icon:'chat',tone:'sky'},
  {id:'agenda',label:'Agenda & tugas',hint:'Agenda baru dan tugas untuk kamu',types:['agenda','tugas'],icon:'agenda',tone:'blue'},
  {id:'belanja',label:'Belanja',hint:'Barang baru di daftar belanja',types:['belanja'],icon:'shop',tone:'amber'},
  {id:'keuangan',label:'Keuangan',hint:'Transaksi baru dicatat (tanpa nominal)',types:['keuangan'],icon:'money',tone:'green'},
  {id:'hojak',label:'Ho Jak',hint:'Ceklis perjalanan baru',types:['hojak'],icon:'compass',tone:'teal'}
];
const KIND={chat:['chat','sky'],agenda:['agenda','blue'],tugas:['quest','violet'],belanja:['shop','amber'],hojak:['compass','teal'],keuangan:['money','green']};
const isMuted=type=>prefs.muted.includes(type);
const groupMuted=g=>g.types.every(isMuted);

/* ================= Umpan balik: getar & suara ================= */
let audio;
function ding(){
  try{
    audio=audio||new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume();
    const t=audio.currentTime;
    [[880,0],[1318,.1]].forEach(([freq,delay])=>{
      const osc=audio.createOscillator(),gain=audio.createGain();
      osc.type='sine';osc.frequency.value=freq;
      gain.gain.setValueAtTime(.0001,t+delay);gain.gain.exponentialRampToValueAtTime(.16,t+delay+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+delay+.4);
      osc.connect(gain).connect(audio.destination);osc.start(t+delay);osc.stop(t+delay+.45);
    });
  }catch{}
}
const feedback=()=>{if(!prefs.sound)return;try{navigator.vibrate?.([70,40,70])}catch{}ding()};

/* ================= Banner di dalam aplikasi ================= */
let stack;const banners=new Map();
function dismiss(key){
  const item=banners.get(key);if(!item)return;
  clearTimeout(item.timer);banners.delete(key);item.el.classList.add('out');setTimeout(()=>item.el.remove(),260);
}
function showBanner({key,kind,title,body,open}){
  if(!prefs.banner)return;
  if(!stack){stack=document.createElement('div');stack.id='bannerStack';stack.setAttribute('aria-live','polite');document.body.append(stack)}
  const existing=banners.get(key);
  if(existing){
    existing.count+=1;existing.body=body;
    existing.el.querySelector('.bn-title').textContent=kind==='chat'?`${existing.title} (${existing.count} pesan)`:existing.title;
    existing.el.querySelector('.bn-body').textContent=body;
    clearTimeout(existing.timer);existing.timer=setTimeout(()=>dismiss(key),6000);return;
  }
  const [icon,tone]=KIND[kind]||['bell','blue'],el=document.createElement('div');
  el.className=`banner tone-${tone}`;el.setAttribute('role','status');
  el.innerHTML=`<button type="button" class="bn-main"><i class="chip">${icons[icon]}</i><span class="bn-text"><b class="bn-title"></b><small class="bn-body"></small></span><em>Sekarang</em></button><button type="button" class="bn-x" aria-label="Tutup">${icons.close||'×'}</button>`;
  el.querySelector('.bn-title').textContent=title;el.querySelector('.bn-body').textContent=body;
  const item={el,title,body,count:1,timer:setTimeout(()=>dismiss(key),6000)};banners.set(key,item);
  el.querySelector('.bn-main').onclick=()=>{dismiss(key);open();save();render()};
  el.querySelector('.bn-x').onclick=e=>{e.stopPropagation();dismiss(key)};
  stack.prepend(el);
  while(banners.size>3){dismiss(banners.keys().next().value)}
}

const seen=new Set(),recent=[];
const who=id=>(state.members||[]).find(m=>m.user_id===id)?.display_name||'Anggota keluarga';
const goPage=page=>()=>{state.tab='home';state.page=page};
const goAgenda=()=>{state.tab='agenda';state.page=null};
/* Satu pintu untuk semua kabar baru dari anggota lain (dari realtime). */
window.notifyIncoming=function(table,row){
  if(!state.logged||!state.family||!row||!row.id)return;
  const me=session?.user?.id,uid=`${table}:${row.id}`;
  if(seen.has(uid))return;seen.add(uid);
  let ev=null;
  if(table==='family_messages'){
    if(row.sender_id===me||state.page==='chat')return;
    ev={kind:'chat',title:who(row.sender_id),body:String(row.message||'').slice(0,140),open:goPage('chat'),key:`chat:${row.sender_id}`};
  }else if(table==='family_tasks'){
    if(row.created_by===me)return;
    ev={kind:'tugas',title:`${who(row.created_by)} memberi tugas`,body:String(row.title||''),open:goAgenda};
  }else if(table==='family_records'){
    if(row.created_by===me)return;
    if(row.record_type==='agenda')ev={kind:'agenda',title:`${who(row.created_by)} menambah agenda`,body:String(row.title||''),open:goAgenda};
    else if(row.record_type==='shopping')ev={kind:'belanja',title:`${who(row.created_by)} menambah belanjaan`,body:String(row.title||''),open:goPage('shop')};
  }else if(table==='family_trips'){
    if(row.created_by===me)return;
    ev={kind:'hojak',title:`${who(row.created_by)} membuat Ho Jak`,body:String(row.title||''),open:goPage('hojak')};
  }else if(table==='family_transactions'){
    if(row.created_by===me||row.legacy_id)return;
    ev={kind:'keuangan',title:`${who(row.created_by)} mencatat ${row.type==='income'?'pemasukan':'pengeluaran'}`,body:String(row.title||''),open:goPage('money')};
  }
  if(!ev||isMuted(ev.kind)||document.visibilityState!=='visible')return;
  const now=Date.now();while(recent.length&&now-recent[0]>3000)recent.shift();
  if(recent.length>=4)return;recent.push(now);   // banjir kabar (mis. impor) cukup ditampilkan sebagian
  feedback();showBanner({...ev,key:ev.key||uid});
};

/* Realtime: kabar baru dari anggota keluarga lain */
let channel=null,channelFamily=null;
function subscribeNotify(){
  if(!window.supabaseClient||!state.family||channelFamily===state.family.id)return;
  if(channel)window.supabaseClient.removeChannel(channel);
  const id=state.family.id;channelFamily=id;
  const ch=window.supabaseClient.channel(`notify-${id}`);
  ['family_messages','family_tasks','family_records','family_trips','family_transactions'].forEach(table=>
    ch.on('postgres_changes',{event:'INSERT',schema:'public',table,filter:`family_id=eq.${id}`},payload=>window.notifyIncoming(table,payload.new)));
  ch.subscribe();channel=ch;
}

/* ================= Notifikasi sistem: langganan push ================= */
const pushSupported=()=>'serviceWorker' in navigator&&'PushManager' in window&&typeof Notification!=='undefined';
async function currentSubscription(){try{const reg=await navigator.serviceWorker.ready;return await reg.pushManager.getSubscription()}catch{return null}}
async function upsertSubscription(sub){
  const json=sub.toJSON(),row={family_id:state.family.id,user_id:session.user.id,endpoint:json.endpoint,p256dh:json.keys.p256dh,auth_key:json.keys.auth};
  const post=body=>sb('/rest/v1/push_subscriptions?on_conflict=endpoint',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(body),silent:true});
  try{await post({...row,muted:prefs.muted})}catch(error){if(/muted/i.test(error.message))await post(row);else throw error}
  try{localStorage.setItem(ENDPOINT_KEY,json.endpoint)}catch{}
}
/* Perbarui langganan secara berkala: iPhone/Android bisa mengganti alamat push tanpa kabar. */
async function refreshPush(){
  if(!state.family||!session?.user||!pushSupported()||Notification.permission!=='granted')return;
  const stamp=`portalPushRefresh:${session.user.id}:${state.family.id}`;
  try{if(Date.now()-Number(localStorage.getItem(stamp)||0)<6*3600e3)return}catch{}
  try{
    const reg=await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
    await upsertSubscription(sub);
    try{localStorage.setItem(stamp,String(Date.now()))}catch{}
    if(!state.pushEnabled){state.pushEnabled=true;save()}
  }catch(error){console.warn('[push] refresh gagal',error)}
}
async function syncMuted(){
  const sub=await currentSubscription();if(!sub||!session?.user)return;
  try{await sb(`/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({muted:prefs.muted}),silent:true})}catch{}
}
/* Setelah mengaktifkan notifikasi (fungsi lama di app.js), catat alamat perangkat & jenis yang dibisukan. */
const enableBase=enablePushNotifications;
enablePushNotifications=async function(...args){
  await enableBase.apply(this,args);
  const sub=await currentSubscription();
  if(sub){try{localStorage.setItem(ENDPOINT_KEY,sub.endpoint)}catch{}await syncMuted()}
  diag.checked=false;render();
};
/* Keluar akun: hapus perangkat ini dari daftar penerima (dipanggil app.js sebelum sesi dihapus). */
window.beforeLogout=function(){
  try{
    const endpoint=localStorage.getItem(ENDPOINT_KEY),token=session?.access_token;
    if(endpoint&&token)fetch(`${SB_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,{method:'DELETE',headers:{apikey:SB_KEY,Authorization:`Bearer ${token}`,Prefer:'return=minimal'},keepalive:true}).catch(()=>{});
  }catch{}
};
/* Aplikasi dibuka: tutup notifikasi sistem & hapus angka di ikon */
function clearSystem(){try{navigator.serviceWorker?.controller?.postMessage({type:'clear'})}catch{}try{navigator.clearAppBadge?.()}catch{}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)clearSystem()});
clearSystem();

/* ================= Halaman Pengaturan Notifikasi ================= */
const diag={checked:false,loading:false,rows:[],granted:false,registered:false,hasSub:false,result:''};
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
configs.pushsettings={title:'Pengaturan Notifikasi',sub:'',icon:'bell'};

async function runDiagnostics(){
  if(diag.loading)return;diag.loading=true;
  const rows=[],support=pushSupported();
  rows.push(['Perangkat mendukung notifikasi',support?'ok':'bad',support?'':'Gunakan Safari (iOS 16.4 ke atas) atau Chrome terbaru.']);
  if(isIOS){const inApp=standalone();rows.push(['Dibuka dari ikon di layar utama',inApp?'ok':'bad',inApp?'':'Di iPhone/iPad notifikasi hanya bekerja bila aplikasi dipasang: Safari → Bagikan → Tambah ke Layar Utama, lalu buka dari ikon itu.'])}
  const permission=support?Notification.permission:'denied';
  rows.push(['Izin notifikasi',permission==='granted'?'ok':permission==='denied'?'bad':'warn',permission==='granted'?'':permission==='denied'?'Izin ditolak. Ubah di Pengaturan perangkat → Notifikasi → Portal Rumah.':'Belum diminta. Ketuk "Aktifkan notifikasi".']);
  let sub=null,registered=false;
  if(support){sub=await currentSubscription();
    if(sub&&session?.user){try{const found=await sb(`/rest/v1/push_subscriptions?select=id&endpoint=eq.${encodeURIComponent(sub.endpoint)}`,{silent:true});registered=Array.isArray(found)&&found.length>0}catch{}}}
  rows.push(['Perangkat terdaftar di server',registered?'ok':'warn',registered?'':sub?'Terdaftar di perangkat tapi belum di server. Ketuk "Aktifkan notifikasi".':'Belum terdaftar. Ketuk "Aktifkan notifikasi".']);
  Object.assign(diag,{rows,granted:permission==='granted',registered,hasSub:!!sub,checked:true,loading:false});
  if(state.page==='pushsettings')render();
}

const switchRow=(attrs,checked,label,hint,icon,tone)=>`<label class="row setting-switch"><i class="chip tone-${tone}">${icons[icon]}</i><span class="row-main"><b>${label}</b><small>${hint}</small></span><span class="switch"><input type="checkbox" ${attrs} ${checked?'checked':''}><i></i></span></label>`;
window.pushSettingsPage=function(){
  const mark={ok:icons.check,bad:icons.close||'×',warn:icons.alert};
  const rows=diag.checked?diag.rows.map(([label,status,hint])=>`<div class="diag ${status}"><i>${mark[status]}</i><span><b>${label}</b>${hint?`<small>${hint}</small>`:''}</span></div>`).join(''):'<div class="empty-inline">Memeriksa…</div>';
  const needEnable=pushSupported()&&(!diag.granted||!diag.registered);
  return shell(`${hdr('pushsettings','Atur kabar yang masuk ke perangkat ini')}<main class="content page-content ps-page">
    <section class="card ps-card"><div class="card-head"><h2>Status perangkat ini</h2></div><div class="diag-list">${rows}</div>
      <div class="ps-actions">${needEnable?`<button type="button" class="primary" data-enable-push>Aktifkan notifikasi</button>`:''}
        <div class="ps-test"><button type="button" class="pill-btn soft" data-push-test-local>${icons.bell}<span>Uji di perangkat</span></button><button type="button" class="pill-btn soft" data-push-test-server ${diag.registered?'':'disabled'}>${icons.send}<span>Uji dari server</span></button></div>
        ${diag.result?`<p class="ps-result">${diag.result}</p>`:''}</div></section>
    <section class="card ps-card"><div class="card-head"><h2>Jenis notifikasi</h2></div><div class="list ps-list">${GROUPS.map(g=>switchRow(`data-push-group="${g.id}"`,!groupMuted(g),g.label,g.hint,g.icon,g.tone)).join('')}</div><p class="ps-note">Berlaku untuk perangkat ini saja.</p></section>
    <section class="card ps-card"><div class="card-head"><h2>Saat aplikasi terbuka</h2></div><div class="list ps-list">${switchRow('data-push-pref="banner"',prefs.banner,'Banner kabar baru','Muncul di atas layar seperti WhatsApp',"bell",'indigo')}${switchRow('data-push-pref="sound"',prefs.sound,'Suara & getar','Nada singkat saat banner muncul','chat','violet')}</div></section>
  </main>`);
};

document.addEventListener('change',event=>{
  const group=event.target.closest('[data-push-group]');
  if(group){
    const g=GROUPS.find(x=>x.id===group.dataset.pushGroup);if(!g)return;
    prefs.muted=prefs.muted.filter(t=>!g.types.includes(t));if(!group.checked)prefs.muted.push(...g.types);
    savePrefs();syncMuted();return;
  }
  const pref=event.target.closest('[data-push-pref]');
  if(pref){prefs[pref.dataset.pushPref]=pref.checked;savePrefs();if(pref.dataset.pushPref==='sound'&&pref.checked)feedback()}
});
document.addEventListener('click',async event=>{
  if(event.target.closest('[data-push-test-local]')){
    event.preventDefault();
    if(!pushSupported()||Notification.permission!=='granted'){toast('Aktifkan notifikasi dulu');return}
    try{
      const reg=await navigator.serviceWorker.ready;
      await reg.showNotification('Notifikasi uji Portal Rumah',{body:'Kalau ini muncul, perangkat kamu siap menerima notifikasi.',icon:'./assets/apple-touch-icon.png',badge:'./assets/apple-touch-icon.png',tag:'uji-lokal',vibrate:[120,60,120],data:{url:'./'}});
      diag.result='Notifikasi uji dikirim ke perangkat ini. Kalau tidak terlihat, cek mode Fokus/Jangan Ganggu.';render();
    }catch(error){toast(error.message)}
    return;
  }
  if(event.target.closest('[data-push-test-server]')){
    event.preventDefault();diag.result='Mengirim dari server…';render();
    try{
      const res=await sb('/rest/v1/rpc/send_test_push',{method:'POST',body:'{}'});
      diag.result=res?.ok===false?(res.reason||'Server menolak permintaan uji.'):'Permintaan terkirim. Notifikasi dari server akan muncul dalam beberapa detik.';
    }catch(error){diag.result=/send_test_push|function|schema cache/i.test(error.message)?'Fungsi uji belum ada di Supabase. Jalankan supabase-push-setup.sql terbaru.':error.message}
    render();
  }
},true);

/* ================= Sambungan ke render ================= */
const renderBeforeNotify=render;
render=function(){
  renderBeforeNotify();
  if(!state.logged||!state.family)return;
  subscribeNotify();refreshPush();
  if(state.page==='pushsettings'&&!diag.checked&&!diag.loading)runDiagnostics();
};
const clearBeforeNotify=clearFamilyCache;
clearFamilyCache=function(){clearBeforeNotify();if(channel&&window.supabaseClient)window.supabaseClient.removeChannel(channel);channel=null;channelFamily=null;diag.checked=false;seen.clear()};

render();
})();
