/* Lapisan tampilan Portal Rumah (redesign).
   Dimuat setelah app.js. Semua fungsi view (beranda, halaman modul, login, profil, dll.)
   diganti di sini. Logika data, sinkronisasi Supabase, dan event handler tetap di app.js:
   atribut data-* (data-page, data-add, data-list, data-delete, dst.) sengaja dipertahankan. */

/* ===== Ikon (gaya garis, 24px) ===== */
Object.assign(icons,{
  home:svg('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  agenda:svg('<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="3"/><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>'),
  money:svg('<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
  health:svg('<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.1 3 5.5l7 7z"/><path d="M3.2 12h6.3l.5-1 2 4.5 2-7 1.5 3.5h5.3"/>'),
  shop:svg('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
  archive:svg('<rect width="20" height="5" x="2" y="3" rx="1.5"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>'),
  bill:svg('<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>'),
  car:svg('<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>'),
  history:svg('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>'),
  profile:svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  quest:svg('<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'),
  map:svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
  chat:svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>'),
  emergency:svg('<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1M2 12h1M12 2v1M4.9 4.9l.7.7M19.1 4.9l-.7.7M12 12v6"/>'),
  folder:svg('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>'),
  file:svg('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>'),
  image:svg('<rect width="18" height="18" x="3" y="3" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>'),
  pencil:svg('<path d="M21.2 6.8a1 1 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8l-1.3 4.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5z"/><path d="m15 5 4 4"/>'),
  trash:svg('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6M14 11v6"/>'),
  plus:svg('<path d="M5 12h14M12 5v14"/>'),
  back:svg('<path d="m15 18-6-6 6-6"/>'),
  next:svg('<path d="m9 18 6-6-6-6"/>'),
  bell:svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
  check:svg('<path d="M20 6 9 17l-5-5"/>'),
  checkCircle:svg('<path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/>'),
  alert:svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'),
  send:svg('<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>'),
  mail:svg('<rect width="20" height="16" x="2" y="4" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  lock:svg('<rect width="18" height="11" x="3" y="11" rx="3"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  eye:svg('<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff:svg('<path d="M10.73 5.08a10.74 10.74 0 0 1 11.21 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49"/><path d="M14.08 14.16a3 3 0 0 1-4.24-4.24"/><path d="M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14"/><path d="m2 2 20 20"/>'),
  upload:svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>'),
  settings:svg('<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>'),
  globe:svg('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>'),
  logout:svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>'),
  userPlus:svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>'),
  users:svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
  camera:svg('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>'),
  phone:svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
  external:svg('<path d="M7 7h10v10M7 17 17 7"/>'),
  arrowUp:svg('<path d="m5 12 7-7 7 7M12 19V5"/>'),
  arrowDown:svg('<path d="M12 5v14m7-7-7 7-7-7"/>'),
  glasses:svg('<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>')
});

/* Daftar menu beranda (urutan 3 × 3). Semua modul tetap ada. */
quick.splice(0,quick.length,
  ['emergency','emergency','Darurat'],['money','money','Keuangan'],['health','health','Kesehatan & Anak'],
  ['shop','shop','Belanja'],['archive','archive','Arsip'],['bill','bill','Tagihan'],
  ['quest','quest','Tugas Pasangan'],['map','map','Peta Keluarga'],['chat','chat','Chat Keluarga']);
configs.chat.icon='chat';

/* Warna ikon per modul */
const TONES={agenda:'blue',money:'green',health:'pink',shop:'amber',archive:'indigo',bill:'orange',car:'sky',home:'teal',quest:'violet',map:'teal',chat:'sky',emergency:'rose',history:'blue'};
const tone=key=>`tone-${TONES[key]||'blue'}`;

/* ===== Potongan markup yang dipakai berulang ===== */
const esc=value=>safeText(value);
const chip=(icon,key=icon)=>`<i class="chip ${tone(key)}">${icons[icon]}</i>`;
const addBtn=(attrs,label,icon='plus')=>`<button type="button" class="pill-btn" ${attrs}>${icons[icon]}<span>${label}</span></button>`;
const delBtn=attrs=>`<button type="button" class="icon-btn ghost danger" ${attrs} aria-label="Hapus">${icons.trash}</button>`;
const emptyState=(icon,title,text='')=>`<div class="empty-state">${icons[icon]}<b>${title}</b>${text?`<span>${text}</span>`:''}</div>`;
const sectionLabel=(text,extra='')=>`<div class="section-label"><span>${text}</span>${extra}</div>`;
const pendingText=(n,word)=>n?`${n} ${word}`:'Semua beres';
const hdr=(key,sub,action='')=>header({...configs[key],sub},action);

logo=function(){return `<div class="logo">${svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M12 16.5s-3-1.8-3-3.9a1.8 1.8 0 0 1 3-1.3 1.8 1.8 0 0 1 3 1.3c0 2.1-3 3.9-3 3.9z"/>')}</div>`};

shell=function(content,nav=true){return `<div class="app-bg"><section class="phone-app ${nav?'has-nav':'no-nav'}"><div class="viewport">${content}</div>${nav?bottom():''}</section></div>`};

avatar=function(){const initial=((typeof currentMember==='function'&&currentMember().display_name)||'A').slice(0,1).toUpperCase();return `<button type="button" class="avatar" data-action="avatar" aria-label="Ganti foto profil">${state.avatar?`<img src="${state.avatar}" alt="Foto profil">`:`<span>${esc(initial)}</span>`}<em>${icons.camera}</em></button>`};

bottom=function(){const en=state.lang==='en',L=en?{home:'Home',agenda:'Calendar',history:'History',profile:'Profile',add:'Add event'}:{home:'Beranda',agenda:'Kalender',history:'Riwayat',profile:'Profil',add:'Tambah agenda'},tab=key=>`<button type="button" data-tab="${key}" class="${state.tab===key?'active':''}" ${state.tab===key?'aria-current="page"':''}>${icons[key]}<span>${L[key]}</span></button>`;return `<nav class="bottom">${tab('home')}${tab('agenda')}<button type="button" class="fab" data-add="agenda" aria-label="${L.add}">${icons.plus}</button>${tab('history')}${tab('profile')}</nav>`};

/* Header halaman: pita biru dengan tombol kembali, judul, info singkat, dan aksi utama */
header=function(c,action=''){const back=state.page?`<button type="button" class="icon-btn" data-action="back" aria-label="Kembali">${icons.back}</button>`:'';return `<header class="page-head">${back}<span class="ph-text"><h1>${c.title}</h1>${c.sub?`<p>${c.sub}</p>`:''}</span>${action}</header>`};

/* ===== Masuk / daftar / hubungkan keluarga ===== */
login=function(){const signup=state.authMode==='signup',eye=`<span class="eye-on">${icons.eye}</span><span class="eye-off">${icons.eyeOff}</span>`;return shell(`<section class="login"><div class="auth-hero"><img class="family-art" src="assets/login-interior-coral.png" alt="Keluarga bahagia di ruang keluarga"><div class="auth-brand">${logo()}<h1>${signup?'Buat Akun':'Portal Rumah'}</h1><p>${signup?'Gunakan email aktif untuk keluarga kamu':'Untuk keluarga yang lebih baik'}</p></div></div><form class="auth-sheet" id="${signup?'signupForm':'loginForm'}"><label class="field">${icons.mail}<input name="email" required type="email" placeholder="Email aktif" autocomplete="email"></label><label class="field">${icons.lock}<input id="password" name="password" required minlength="6" type="password" placeholder="Kata sandi, minimal 6 karakter" autocomplete="${signup?'new-password':'current-password'}"><button type="button" class="field-btn" data-action="password" aria-label="Tampilkan kata sandi">${eye}</button></label>${signup?`<label class="field">${icons.lock}<input name="confirm" required minlength="6" type="password" placeholder="Ulangi kata sandi" autocomplete="new-password"></label><p class="signup-help">Kami akan mengirim tautan konfirmasi ke emailmu.</p>`:`<div class="login-row"><label class="remember"><input type="checkbox"><span>Ingat saya</span></label><button type="button" class="link" data-action="forgot">Lupa kata sandi?</button></div>`}<button class="primary">${signup?'Daftar dan Kirim Konfirmasi':'Masuk'}</button><p class="switch-auth">${signup?'Sudah punya akun?':'Belum punya akun?'} <button type="button" class="link" data-auth-mode="${signup?'login':'signup'}">${signup?'Masuk':'Daftar'}</button></p></form></section>`,false)};

onboarding=function(){return shell(`<section class="login onboarding"><div class="auth-hero compact"><div class="auth-brand">${logo()}<h1>Hubungkan Keluarga</h1><p>Buat ruang keluarga baru, atau masukkan kode undangan dari pasangan.</p></div></div><div class="auth-sheet"><form id="familyForm"><label class="field">${icons.profile}<input name="name" required placeholder="Nama kamu, contoh: Ayah"></label><label class="field">${icons.home}<input name="family" placeholder="Nama keluarga, contoh: Keluarga Andrian"></label><button class="primary" name="mode" value="create">Buat Keluarga Baru</button><div class="or"><span>atau gabung dengan kode</span></div><label class="field">${icons.userPlus}<input name="code" maxlength="8" autocapitalize="characters" placeholder="Kode undangan 8 karakter"></label><button class="secondary" name="mode" value="join">Gabung dengan Kode</button></form><button type="button" class="onboarding-logout" data-action="logout">Keluar / ganti akun</button></div></section>`,false)};

/* ===== Beranda ===== */
home=function(){
  const agenda=state.agenda||[],scope=agenda.filter(x=>['today','missed'].includes(agendaStatus(x))),done=scope.filter(x=>x[3]).length,pct=scope.length?Math.round(done/scope.length*100):0,
    C=2*Math.PI*18,offset=C*(1-pct/100),entries=checklistItems().slice(0,5),
    vehicles=(state.vehicleRecords||[]).length,houses=(state.homeRecords||[]).length;
  const rows=entries.length?entries.map(({item,index,status})=>`<label class="task"><input type="checkbox" data-list="agenda" data-index="${index}" data-done="3" ${item[3]?'checked':''}><i class="tick">${icons.check}</i><span class="row-main"><b class="${item[3]?'strike':''}">${esc(item[0])}</b><small class="${status==='missed'?'danger-text':''}">${esc(item[1]||'Rutinitas')}${status==='missed'?' · terlewat':''}</small></span></label>`).join(''):'<div class="empty-inline">Belum ada aktivitas untuk filter ini.</div>';
  return shell(`<header class="hero"><div class="hello"><div class="hello-text"><p>${timeGreeting()}</p><h1>${esc(state.family?.name||'Keluarga Saya')}</h1></div><button type="button" class="notice" aria-label="Notifikasi">${icons.bell}<i></i></button>${avatar()}</div><button type="button" class="today-card" data-tab="agenda"><span class="ring"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="ring-bg" cx="22" cy="22" r="18"/><circle class="ring-fg" cx="22" cy="22" r="18" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/></svg><b>${pct}%</b></span><span class="tc-text"><b>Progres hari ini</b><small>${scope.length?`${done} dari ${scope.length} aktivitas selesai`:'Belum ada aktivitas hari ini'}</small></span><span class="tc-go">${icons.next}</span></button></header>
  <main class="content sheet">
    <section><div class="section-head"><h2>Menu</h2></div><div class="quick">${quick.map(([p,i,l])=>`<button type="button" class="tile ${tone(i)}" data-page="${p}"><i>${icons[i]}</i><span>${l}</span></button>`).join('')}</div></section>
    ${typeof weatherSection==='function'?weatherSection():''}
    <section class="section"><div class="section-head"><h2>Agenda Keluarga</h2><button type="button" class="link-btn" data-tab="agenda">Lihat kalender</button></div><div class="chips">${checklistFilterButton('today','Hari ini')}${checklistFilterButton('upcoming','Mendatang')}${checklistFilterButton('all','Semua')}${checklistFilterButton('done','Selesai')}</div><div class="card tasks">${rows}</div></section>
    <section class="section"><div class="section-head"><h2>Rumah &amp; Kendaraan</h2></div><div class="pair">${summaryRow('car','Kendaraan',vehicles?`${vehicles} catatan`:'Belum diisi','car')}${summaryRow('home','Rumah',houses?`${houses} catatan`:'Belum diisi','house')}</div></section>
  </main>`)};

summaryRow=function(icon,title,sub,page){return `<button type="button" class="mini summary-row ${tone(icon)}" data-page="${page}"><i>${icons[icon]}</i><span><b>${title}</b><small>${sub}</small></span></button>`};

/* ===== Daftar sederhana: kesehatan & tagihan ===== */
listPage=function(name,list,meta){
  const c=configs[name],doneIndex=name==='health'?2:name==='bill'?3:1,entries=sortPendingFirstEntries(list,doneIndex),pending=entries.filter(e=>!e.item[doneIndex]).length,
    word=name==='bill'?'belum dibayar':'belum selesai';
  return shell(`${hdr(name,pendingText(pending,word),addBtn(`data-add="${name}"`,'Tambah'))}<main class="content page-content"><div class="list">${entries.length?entries.map(({item:x,index:i})=>`<article class="row"><label class="check"><input type="checkbox" data-list="${c.list}" data-index="${i}" data-done="${doneIndex}" ${x[doneIndex]?'checked':''}><i class="tick">${icons.check}</i></label><span class="row-main"><b class="${x[doneIndex]?'strike':''}">${esc(x[0])}</b><small>${esc(meta(x))}</small></span>${delBtn(`data-delete="${name}" data-index="${i}"`)}</article>`).join(''):emptyState(c.icon,'Belum ada data','Ketuk Tambah untuk mulai mencatat.')}</div></main>`)};

/* ===== Kalender ===== */
agendaPage=function(){
  const now=new Date(),ym=state.calendarMonth||`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,[y,m]=ym.split('-').map(Number),
    monthName=new Date(y,m-1,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'}),cells=monthMatrix(y,m-1),agenda=state.agenda||[],
    withAgenda=new Set(agenda.map(x=>x.date).filter(Boolean)),selected=state.calendarSelected,today=todayIso(),dayNames=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const grid=`<section class="card calendar"><header class="cal-head"><button type="button" class="icon-btn soft" data-cal-nav="-1" aria-label="Bulan sebelumnya">${icons.back}</button><b>${monthName}</b><button type="button" class="icon-btn soft" data-cal-nav="1" aria-label="Bulan berikutnya">${icons.next}</button></header><div class="calendar-grid">${dayNames.map(d=>`<span class="cal-dow">${d}</span>`).join('')}${cells.map(d=>{if(!d)return '<span class="cal-empty"></span>';const iso=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;return `<button type="button" class="cal-day${withAgenda.has(iso)?' has-agenda':''}${selected===iso?' selected':''}${iso===today?' today':''}" data-cal-date="${iso}">${d}</button>`}).join('')}</div></section>`;
  const entries=sortPendingFirstEntries(agenda,3).filter(entry=>!selected||entry.item.date===selected),pending=agenda.filter(x=>!x[3]).length,
    label=selected?displayDate(selected):'Semua agenda';
  return shell(`${hdr('agenda',pendingText(pending,'belum selesai'),addBtn('data-add="agenda"','Tambah'))}<main class="content page-content">${grid}${sectionLabel(label,selected?'<button type="button" data-cal-clear class="link-btn">Tampilkan semua</button>':'')}<div class="list">${entries.length?entries.map(({item,index})=>`<article class="row"><label class="check"><input type="checkbox" data-list="agenda" data-index="${index}" data-done="3" ${item[3]?'checked':''}><i class="tick">${icons.check}</i></label><span class="row-main"><b class="${item[3]?'strike':''}">${esc(item[0])}</b><small>${esc(item[1])} · ${esc(item[2])}</small></span>${delBtn(`data-delete="agenda" data-index="${index}"`)}</article>`).join(''):emptyState('agenda','Belum ada agenda',selected?'Tidak ada agenda di tanggal ini.':'Ketuk Tambah untuk membuat agenda.')}</div></main>`)};

/* ===== Belanja ===== */
shoppingPage=function(){
  const entries=sortPendingFirstEntries(state.shopping||[],1),pending=entries.filter(e=>!e.item[1]).length;
  return shell(`${hdr('shop',pendingText(pending,'belum dibeli'),addBtn('data-add="shop"','Tambah'))}<main class="content page-content"><div class="list shopping-list">${entries.length?entries.map(({item,index})=>`<article class="row"><label class="check"><input type="checkbox" data-list="shopping" data-index="${index}" data-done="1" ${item[1]?'checked':''}><i class="tick">${icons.check}</i></label><button type="button" class="shopping-detail-trigger" data-shop-detail="${index}"><span class="row-main"><b class="${item[1]?'strike':''}">${esc(item[0])}</b><small>${esc(shoppingMeta(item))}</small></span>${icons.next}</button>${delBtn(`data-delete="shop" data-index="${index}"`)}</article>`).join(''):emptyState('shop','Belum ada daftar belanja','Ketuk Tambah untuk mencatat kebutuhan rumah.')}</div></main>`)};

/* ===== Keuangan (sebagian besar dialihkan ke aplikasi kas) ===== */
moneyPage=function(){
  const masuk=state.money.filter(x=>x[2]==='masuk').reduce((s,x)=>s+x[1],0),keluar=state.money.filter(x=>x[2]==='keluar').reduce((s,x)=>s+x[1],0);
  return shell(`${hdr('money','Pemasukan dan pengeluaran',addBtn('data-add="money"','Tambah'))}<main class="content page-content"><section class="balance"><small>Saldo bulan ini</small><h2>${idr(masuk-keluar)}</h2><div><span>${icons.arrowUp} ${idr(masuk)}</span><span>${icons.arrowDown} ${idr(keluar)}</span></div></section><div class="list">${state.money.length?state.money.map((x,i)=>`<article class="row"><i class="chip ${x[2]==='masuk'?'tone-green':'tone-rose'}">${x[2]==='masuk'?icons.arrowUp:icons.arrowDown}</i><span class="row-main"><b>${esc(x[0])}</b><small class="${x[2]}">${x[2]==='masuk'?'+':'-'} ${idr(x[1])}</small></span>${delBtn(`data-delete="money" data-index="${i}"`)}</article>`).join(''):emptyState('money','Belum ada transaksi')}</div></main>`)};

/* ===== Arsip ===== */
archivePage=function(){
  const docs=state.cloudDocs||[],folders=state.docFolders||[],active=state.archiveFolder?folders.find(f=>String(f.id)===String(state.archiveFolder)):null,
    scoped=active?docs.filter(x=>String(x.folder_id)===String(active.id)):docs.filter(x=>!x.folder_id),countIn=id=>docs.filter(x=>String(x.folder_id)===String(id)).length;
  const folderGrid=!active?`<div class="folder-grid">${folders.map(f=>`<button type="button" class="folder-card" data-folder-open="${f.id}"><i>${icons.folder}</i><b>${esc(f.name)}</b><small>${countIn(f.id)} file</small></button>`).join('')}<button type="button" class="folder-card folder-new" data-folder-new><i>${icons.plus}</i><b>Folder baru</b></button></div>`:'';
  const folderPath=active?`<div class="folder-path"><button type="button" class="link-btn" data-folder-back>${icons.back} Arsip</button><b>${esc(active.name)}</b><button type="button" class="icon-btn ghost danger" data-folder-delete="${active.id}" aria-label="Hapus folder">${icons.trash}</button></div>`:'';
  const label=active?'':(folders.length&&scoped.length?sectionLabel('Tanpa folder'):'');
  const kb=x=>Math.max(1,Math.round((x.file_size||0)/1024));
  const sub=active?`${scoped.length} file di folder ini`:`${docs.length} dokumen tersimpan`;
  return shell(`${hdr('archive',sub,addBtn('data-archive-upload','Unggah','upload'))}<main class="content page-content">${folderGrid}${folderPath}${label}<div class="list archive-list">${scoped.length?scoped.map(x=>`<article class="row document-row"><button type="button" class="document-main" data-doc-preview="${x.id}" aria-label="Lihat ${esc(x.file_name)}"><i class="chip ${tone('archive')}">${icons[/\.(png|jpe?g|webp|gif)$/i.test(x.file_name||'')?'image':'file']}</i><span class="row-main"><b>${esc(x.file_name)}</b><small>${esc(x.category)} · ${kb(x)} KB</small></span></button><button type="button" class="icon-btn ghost" data-doc-rename="${x.id}" aria-label="Ubah nama arsip">${icons.pencil}</button></article>`).join(''):(active||!folders.length?emptyState('archive',active?'Folder masih kosong':'Belum ada arsip','Unggah KTP, KK, STNK, atau dokumen penting lainnya.'):'')}</div></main>`)};

/* ===== Tugas pasangan ===== */
questPage=function(){
  const quests=(state.cloudTasks||[]).slice().sort((a,b)=>Number(!!a.completed)-Number(!!b.completed)),pending=quests.filter(t=>!t.completed).length;
  return shell(`${hdr('quest',pendingText(pending,'menunggu dikerjakan'),addBtn('data-cloud-add','Tugas'))}<main class="content page-content"><div class="list">${quests.length?quests.map(x=>`<article class="row"><label class="check"><input type="checkbox" data-cloud-task="${x.id}" ${x.completed?'checked':''}><i class="tick">${icons.check}</i></label><span class="row-main"><b class="${x.completed?'strike':''}">${esc(x.title)}</b><small>${x.completed?'Selesai · tersinkron':esc(x.category||'Tugas Pasangan')}</small></span>${delBtn(`data-cloud-delete="${x.id}"`)}</article>`).join(''):emptyState('quest','Belum ada tugas','Ketuk Tugas untuk memberi tugas ke pasanganmu.')}</div></main>`)};

/* ===== Peta keluarga ===== */
mapPage=function(){
  const places=(state.places||[]).filter(p=>(p.detail||{}).lat&&(p.detail||{}).lng),mine=places.find(p=>p.created_by===session?.user?.id),
    rows=places.map(p=>{const d=p.detail||{},url=`https://www.google.com/maps?q=${d.lat},${d.lng}`;return `<article class="row" data-map-focus="${p.id}" role="button" tabindex="0">${chip('map')}<span class="row-main"><b>${esc(p.title||'Lokasi keluarga')}</b><small>Diperbarui ${new Date(p.updated_at||p.created_at).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})}</small></span><a class="icon-btn ghost" href="${url}" target="_blank" rel="noopener" onclick="event.stopPropagation()" aria-label="Buka di Google Maps">${icons.external}</a></article>`}).join('');
  return shell(`${hdr('map',places.length?`${places.length} lokasi dibagikan`:'Belum ada lokasi',addBtn('data-share-location',mine?'Perbarui':'Bagikan','map'))}<main class="content page-content"><section class="family-map"><div id="familyMapCanvas" style="width:100%;height:100%"></div>${places.length?'':`<div class="map-empty-overlay">${icons.map}<b>Belum ada lokasi</b><small>Lokasi muncul setelah anggota keluarga membagikannya.</small></div>`}</section><div class="list">${rows}</div></main>`)};

/* ===== Chat keluarga (layar penuh, tanpa bilah navigasi) ===== */
chatPage=function(){
  const messages=state.messages||[],me=session?.user?.id,nameOf=id=>(state.members||[]).find(m=>m.user_id===id)?.display_name||'Anggota keluarga';
  return shell(`${hdr('chat',`${(state.members||[]).length||1} anggota`)}<main class="content page-content chat-page"><div class="chat-list">${messages.length?messages.map(m=>`<div class="bubble ${m.sender_id===me?'mine':''}">${m.sender_id===me?'':`<b>${esc(nameOf(m.sender_id))}</b>`}<span>${esc(m.message)}</span><small>${new Date(m.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</small></div>`).join(''):emptyState('chat','Belum ada pesan','Mulai percakapan keluarga di sini.')}</div><form id="chatForm" class="chat-form"><input name="message" maxlength="1000" required placeholder="Tulis pesan untuk keluarga" autocomplete="off"><button aria-label="Kirim">${icons.send}</button></form></main>`,false)};

/* ===== Kendaraan & rumah ===== */
infoPage=function(name){
  const rows=name==='car'?(state.vehicleRecords||[]):(state.homeRecords||[]),icon=name==='car'?'car':'home',word=name==='car'?'kendaraan':'catatan';
  return shell(`${hdr(name,rows.length?`${rows.length} ${word} tercatat`:'Belum ada catatan',addBtn(`data-add="${name}"`,'Tambah'))}<main class="content page-content"><div class="list">${rows.length?rows.map((row,index)=>`<article class="row">${chip(icon)}<span class="row-main"><b>${esc(row.title)}</b><small>${esc((row.detail||{}).note||'Tersimpan untuk keluarga')}</small></span>${delBtn(`data-delete="${name}" data-index="${index}"`)}</article>`).join(''):emptyState(icon,name==='car'?'Belum ada kendaraan':'Belum ada catatan rumah','Ketuk Tambah untuk mulai mencatat.')}</div></main>`)};

/* ===== Kontak darurat ===== */
emergencyPage=function(){
  const rows=state.emergencyRecords||[];
  return shell(`${hdr('emergency',rows.length?`${rows.length} kontak tersimpan`:'Simpan nomor penting keluarga',addBtn('data-add="emergency"','Tambah'))}<main class="content page-content"><div class="list">${rows.length?rows.map((row,index)=>{const d=row.detail||{},phone=d.phone||'';return `<article class="row">${chip('emergency')}<span class="row-main"><b>${esc(row.title)}</b><small>${esc(d.category||'Darurat')}${d.note?' · '+esc(d.note):''}</small>${phone?`<small class="phone-line">${esc(phone)}</small>`:''}</span>${phone?`<a class="icon-btn call" href="tel:${esc(phone)}" aria-label="Telepon ${esc(row.title)}">${icons.phone}</a>`:''}${delBtn(`data-delete="emergency" data-index="${index}"`)}</article>`}).join(''):emptyState('emergency','Belum ada kontak darurat','RS, dokter, satpam, tetangga, sekolah, PLN, PDAM, atau bengkel.')}</div></main>`)};

/* ===== Notifikasi ===== */
notificationPage=function(){
  const notes=state.notifications||[];
  return shell(`${header({title:'Notifikasi',sub:notes.length?`${notes.filter(isUnreadNotification).length} belum dibaca`:''})}<main class="content page-content">${notes.length?`<div class="list">${notes.map(note=>`<article class="row notification-card${isUnreadNotification(note)?' unread':''}">${chip('bell','agenda')}<span class="row-main"><b>${esc(note.title)}</b>${note.body?`<p>${esc(note.body)}</p>`:''}<small>${new Date(note.created_at).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})}</small></span></article>`).join('')}</div>`:emptyState('bell','Belum ada notifikasi')}</main>`)};

/* ===== Riwayat ===== */
historyPage=function(){
  const agendaItems=(state.agenda||[]).map(i=>({title:i[0],meta:i[1],done:i[3],reason:i.detail?.incomplete_reason,type:'Agenda'})),
    taskItems=(state.cloudTasks||[]).map(i=>({title:i.title,meta:i.category||'Tugas pasangan',done:i.completed,reason:i.reason||'',type:'Tugas'})),
    billItems=(state.bills||[]).map(i=>({title:i[0],meta:displayDate(i[1]),done:i[3],reason:i.detail?.incomplete_reason,type:'Tagihan'})),
    items=[...agendaItems,...taskItems,...billItems],done=items.filter(i=>i.done).length,missed=items.length-done,
    score=Math.max(0,Math.round((done*10-missed*2)/Math.max(1,items.length*10)*100));
  return shell(`<header class="page-head"><span class="ph-text"><h1>Riwayat Aktivitas</h1><p>Selesai, belum selesai, dan alasannya</p></span></header><main class="content page-content"><section class="score-card"><div><span>Skor keluarga</span><b>${score}</b><small>${done} selesai · ${missed} perlu evaluasi</small></div><div class="score-ring" style="--p:${score}"><i>${icons.checkCircle}</i></div></section><div class="list history-list">${items.length?items.map(i=>`<article class="row"><i class="chip ${i.done?'tone-green':'tone-rose'}">${i.done?icons.checkCircle:icons.alert}</i><span class="row-main"><b>${esc(i.title)}</b><small>${esc(i.type)} · ${esc(i.meta||'')}</small>${i.done?'':`<small class="danger-text">${i.reason?'Alasan: '+esc(i.reason):'Alasan belum diisi'}</small>`}</span></article>`).join(''):emptyState('history','Belum ada aktivitas keluarga')}</div></main>`)};

/* ===== Profil ===== */
profile=function(){
  const members=state.members||[],me=currentMember(),name=me.display_name||'Pengguna',familyName=state.family?.name||'Keluarga Saya',email=session?.user?.email||'Belum ada email';
  return shell(`<header class="profile-hero">${avatar()}<h1>${esc(name)}</h1><p>${esc(familyName)} · ${esc(email)}</p><div class="profile-actions"><button type="button" data-action="avatar">${icons.camera}Ganti Foto</button><button type="button" data-edit-profile>${icons.pencil}Ubah Nama</button></div></header>
  <main class="content page-content"><section class="card members"><header class="card-head"><h2>Anggota Keluarga</h2><button type="button" class="pill-btn soft" data-share-code>${icons.userPlus}<span>Undang</span></button></header>${members.length?members.map(m=>`<div class="member-row"><i>${esc((m.display_name||'A').slice(0,1).toUpperCase())}</i><span class="row-main"><b>${esc(m.display_name)}</b><small>${m.role==='owner'?'Pemilik keluarga':'Anggota keluarga'}</small></span></div>`).join(''):'<div class="empty-inline">Belum ada anggota. Undang pasangan dengan kode keluarga.</div>'}<div class="invite"><span>Kode keluarga</span><b>${esc(state.family?.invite_code||'-')}</b></div></section>
  <div class="list settings"><button type="button" class="row setting" data-enable-push>${chip('bell','agenda')}<span class="row-main"><b>Notifikasi Push</b><small>${state.pushEnabled?'Aktif di perangkat ini':'Ketuk untuk mengaktifkan'}</small></span>${icons.next}</button><button type="button" class="row setting" data-language-toggle><i class="chip tone-violet">${icons.globe}</i><span class="row-main"><b>Bahasa / Language</b><small>${state.lang==='en'?'English':'Bahasa Indonesia'}</small></span>${icons.next}</button><button type="button" class="row setting logout" data-action="logout"><i class="chip tone-rose">${icons.logout}</i><span class="row-main"><b>Keluar</b></span></button></div></main>`)};

/* ===== Pemetaan halaman ===== */
page=name=>({agenda:agendaPage,shop:shoppingPage,health:()=>listPage('health',state.health,x=>`Jadwal ${displayDate(x[1])}`),bill:()=>listPage('bill',state.bills,x=>`${displayDate(x[1])} · ${idr(x[2])}`),money:moneyPage,archive:archivePage,quest:questPage,map:mapPage,chat:chatPage,car:()=>infoPage('car'),house:()=>infoPage('house'),emergency:emergencyPage,notifications:notificationPage})[name]?.();

/* Ikon kata sandi: tukar mata terbuka/tertutup (jenis input sudah diganti oleh app.js) */
document.addEventListener('click',event=>{const toggle=event.target.closest('[data-action="password"]');if(toggle)toggle.classList.toggle('is-shown')},true);

render();
