/* Akun & keluarga: pemulihan kata sandi lewat email, layar kata sandi baru, ganti kode undangan,
   keluarkan anggota, dan keluar dari keluarga. Dimuat setelah edit.js. */
(()=>{
const authFetch=(path,options={})=>fetch(SB_URL+path,{...options,headers:{apikey:SB_KEY,'Content-Type':'application/json',...(options.headers||{})}});
const errorMessage=async res=>{const e=await res.json().catch(()=>({}));return e.msg||e.message||e.error_description||'Terjadi kesalahan'};
const friendly=message=>/once every|rate limit|too many|429/i.test(message)?'Terlalu sering meminta tautan. Coba lagi sebentar lagi.':message;

/* ================= Lupa kata sandi ================= */
async function requestRecovery(){
  const field=document.querySelector('#loginForm [name="email"]');
  let email=(field?.value||'').trim();
  if(!email)email=(await askText({title:'Pulihkan kata sandi',label:'Masukkan email akunmu. Kami kirim tautan untuk membuat kata sandi baru.',placeholder:'Email aktif',confirm:'Kirim tautan'}))||'';
  email=email.trim();if(!email)return;
  if(!/^\S+@\S+\.\S+$/.test(email)){toast('Format email tidak valid');return}
  try{
    const res=await authFetch('/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+location.pathname),{method:'POST',body:JSON.stringify({email})});
    if(!res.ok)throw new Error(friendly(await errorMessage(res)));
    toast('Tautan pemulihan dikirim ke '+email+'. Cek inbox atau folder Spam.');
  }catch(error){toast(error.message)}
}
document.addEventListener('click',event=>{
  if(!event.target.closest('[data-action="forgot"]'))return;
  event.preventDefault();event.stopImmediatePropagation();requestRecovery();
},true);

/* ================= Layar kata sandi baru (dari tautan email) ================= */
let recovery=null;
window.recoveryScreen=function(){
  const eye=`<span class="eye-on">${icons.eye}</span><span class="eye-off">${icons.eyeOff}</span>`;
  return shell(`<section class="login"><div class="auth-hero compact"><div class="auth-brand">${logo()}<h1>Kata Sandi Baru</h1><p>Buat kata sandi baru untuk akunmu.</p></div></div><form class="auth-sheet" id="recoveryForm"><label class="field">${icons.lock}<input id="password" name="password" required minlength="6" type="password" placeholder="Kata sandi baru, minimal 6 karakter" autocomplete="new-password"><button type="button" class="field-btn" data-action="password" aria-label="Tampilkan kata sandi">${eye}</button></label><label class="field">${icons.lock}<input name="confirm" required minlength="6" type="password" placeholder="Ulangi kata sandi" autocomplete="new-password"></label><button class="primary">Simpan Kata Sandi Baru</button><p class="switch-auth"><button type="button" class="link" data-auth-mode="login">Batal</button></p></form></section>`,false);
};
document.addEventListener('submit',async event=>{
  if(event.target.id!=='recoveryForm')return;
  event.preventDefault();event.stopImmediatePropagation();
  const data=new FormData(event.target),password=String(data.get('password')||''),confirmation=String(data.get('confirm')||''),button=event.target.querySelector('.primary');
  if(password!==confirmation){toast('Ulangi kata sandi harus sama');return}
  if(!recovery){toast('Tautan pemulihan sudah tidak berlaku. Minta tautan baru.');return}
  button.disabled=true;
  try{
    const res=await authFetch('/auth/v1/user',{method:'PUT',headers:{Authorization:'Bearer '+recovery.access_token},body:JSON.stringify({password})});
    if(!res.ok)throw new Error(await errorMessage(res));
    const user=await res.json();
    session={access_token:recovery.access_token,refresh_token:recovery.refresh_token,token_type:'bearer',expires_in:3600,user:user.user||user};
    localStorage.portalSession=JSON.stringify(session);
    recovery=null;clearFamilyCache();state.logged=true;state.authMode='login';
    await loadFamily();save();render();toast('Kata sandi berhasil diubah');
  }catch(error){button.disabled=false;toast(error.message)}
},true);

/* Membaca tautan dari email (token ada di bagian # alamat) */
(function readRecoveryLink(){
  const hash=new URLSearchParams(location.hash.replace(/^#/,''));
  if(!hash.get('access_token')&&!hash.get('error'))return;
  const clean=()=>{try{history.replaceState(null,'',location.pathname+location.search)}catch{}};
  if(hash.get('type')==='recovery'&&hash.get('access_token')){
    recovery={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')||''};
    state.logged=false;state.authMode='recovery';clean();render();return;
  }
  if(hash.get('error')){
    clean();
    const expired=/expired|invalid/i.test((hash.get('error_description')||'')+(hash.get('error_code')||''));
    setTimeout(()=>toast(expired?'Tautan pemulihan sudah kedaluwarsa. Minta tautan baru lewat "Lupa kata sandi?".':'Tautan tidak bisa dipakai. Coba lagi.'),600);
  }
})();

/* ================= Kelola keluarga ================= */
const rpc=(name,body)=>sb('/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(body)});
const needsSql=error=>/function|schema cache|PGRST202|does not exist/i.test(error.message)?'Fitur ini butuh SQL baru. Jalankan supabase-family-admin.sql di Supabase.':error.message;
document.addEventListener('click',async event=>{
  if(!state.family)return;
  if(event.target.closest('[data-regen-code]')){
    event.preventDefault();
    if(!await confirmSheet({title:'Buat kode undangan baru?',message:'Kode lama langsung tidak berlaku. Anggota yang sudah bergabung tidak terpengaruh.',confirm:'Buat kode baru'}))return;
    try{
      const code=await rpc('regenerate_invite_code',{target_family:state.family.id});
      state.family.invite_code=String(code||'').replace(/"/g,'');save();render();toast('Kode baru: '+state.family.invite_code);
    }catch(error){toast(needsSql(error))}
    return;
  }
  const remove=event.target.closest('[data-member-remove]');
  if(remove){
    event.preventDefault();const name=remove.dataset.memberName||'anggota ini';
    if(!await confirmSheet({title:'Keluarkan '+name+'?',message:'Ia tidak akan bisa melihat data keluarga lagi. Catatan yang sudah dibuatnya tetap ada.',confirm:'Keluarkan',danger:true}))return;
    try{
      await rpc('remove_family_member',{target_family:state.family.id,target_user:remove.dataset.memberRemove});
      await loadMembers(true);save();render();toast(name+' dikeluarkan dari keluarga');
    }catch(error){toast(needsSql(error))}
    return;
  }
  if(event.target.closest('[data-leave-family]')){
    event.preventDefault();
    if(!await confirmSheet({title:'Keluar dari keluarga?',message:'Kamu tidak akan bisa melihat data keluarga lagi kecuali diundang kembali dengan kode.',confirm:'Ya, keluar',danger:true}))return;
    try{
      const familyId=state.family.id;
      await rpc('leave_family',{target_family:familyId});
      try{localStorage.removeItem(activeFamilyKey())}catch{}
      clearFamilyCache();state.onboarding=true;save();render();toast('Kamu sudah keluar dari keluarga');
    }catch(error){toast(needsSql(error))}
  }
},true);

/* ================= Pemuatan pustaka luar tanpa menahan tampilan pertama ================= */
/* Supabase (realtime) dimuat belakangan; begitu siap, sambungkan realtime lalu render ulang agar modul lain ikut terhubung. */
function onSupabaseReady(){if(state.logged&&state.family){try{subscribeRealtime(state.family.id)}catch{}render()}}
window.addEventListener('supabase-ready',onSupabaseReady);
if(window.supabase)onSupabaseReady();
/* Peta (Leaflet ~150 KB) hanya dimuat saat halaman Peta Keluarga dibuka. */
function ensureLeaflet(){
  if(typeof L!=='undefined'||document.getElementById('leafletJs'))return;
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';document.head.append(css);
  const script=document.createElement('script');script.id='leafletJs';script.src='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';script.async=true;document.head.append(script);
}
const renderBeforeLeaflet=render;
render=function(){renderBeforeLeaflet();if(state.page==='map')ensureLeaflet()};

render();
})();
