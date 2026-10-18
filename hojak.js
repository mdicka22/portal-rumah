/* Ho Jak (bahasa Aceh: "pergi ke mana") — ceklis perlengkapan untuk tiap tujuan.
   Menggantikan modul Tagihan. Ketuk tujuan (mis. Ke Rumah Sakit) dan daftar barang yang perlu
   dibawa langsung terbuka, tinggal dicentang. Centang, barang tambahan, dan reset disimpan di
   tabel family_trips / family_trip_items (supabase-hojak.sql) dan dipakai bersama keluarga.
   Bila tabel belum ada, Ho Jak tetap berfungsi dan menyimpan di perangkat ini, lalu otomatis
   dipindahkan ke server begitu tabel tersedia. */
(()=>{
Object.assign(icons,{
  compass:svg('<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.8 5.41a2 2 0 0 1-1.27 1.27L7.76 16.24l1.8-5.41a2 2 0 0 1 1.27-1.27z"/>'),
  hospital:svg('<path d="M12 6v4M14 8h-4"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="M18 10h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2"/><path d="M18 5v17M6 5v17"/><circle cx="12" cy="9" r="2"/>'),
  plane:svg('<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'),
  briefcase:svg('<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>'),
  gradCap:svg('<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'),
  moonStar:svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/><path d="M19 3v4M17 5h4"/>'),
  tent:svg('<path d="M3.5 21 14 3M20.5 21 10 3M15.5 21 12 15l-3.5 6M2 21h20"/>'),
  list:svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  rotate:svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>')
});

const TEMPLATES=[
  {id:'hospital',title:'Ke Rumah Sakit',icon:'hospital',color:'#e5365a',items:['KTP','Kartu BPJS / asuransi','Kartu berobat / rekam medis','Surat rujukan','Hasil lab / rontgen sebelumnya','Daftar obat yang sedang diminum','Uang tunai & kartu ATM','Power bank & charger','Botol minum','Masker','Tisu & kantong plastik','Pakaian ganti & perlengkapan mandi (jika rawat inap)','Alat tulis untuk mencatat']},
  {id:'liburan',title:'Pergi Berlibur',icon:'plane',color:'#1a86d6',items:['KTP / SIM','Tiket & bukti pesanan hotel','Uang tunai & kartu ATM','Pakaian ganti','Perlengkapan mandi','Obat pribadi & P3K','Charger & power bank','Kamera / HP','Payung / jas hujan','Sandal & sepatu','Topi & kacamata hitam','Perlengkapan anak','Bekal & camilan','Kunci rumah dititipkan, listrik & gas dimatikan']},
  {id:'sekolah',title:'Anak ke Sekolah',icon:'gradCap',color:'#5145e5',items:['Seragam','Tas & buku pelajaran','Alat tulis','PR / tugas','Bekal makan','Botol minum','Uang jajan','Sepatu & kaus kaki','Kartu pelajar']},
  {id:'luarkota',title:'Dinas / Luar Kota',icon:'briefcase',color:'#3b5bdb',items:['KTP / SIM','Surat tugas','Dokumen kerja','Laptop & charger','Pakaian ganti','Perlengkapan mandi','Obat pribadi','Uang saku & kartu ATM','Power bank']},
  {id:'mudik',title:'Pulang Kampung',icon:'car',color:'#7950f2',items:['KTP / SIM & STNK','BBM penuh & cek ban','Pakaian ganti','Oleh-oleh','Amplop / uang untuk keluarga','Obat & P3K','Bekal perjalanan','Charger & power bank','Kunci rumah dititipkan, listrik & gas dimatikan']},
  {id:'pasar',title:'Ke Pasar',icon:'shop',color:'#e08a06',items:['Daftar belanja','Tas belanja','Uang tunai','Dompet & HP','Kantong plastik / wadah']},
  {id:'masjid',title:'Masjid / Pengajian',icon:'moonStar',color:'#0b9a8a',items:['Mukena / sarung & peci','Al-Qur\'an','Sajadah','Uang infaq','Botol minum','Sandal / kantong sepatu']},
  {id:'piknik',title:'Piknik / Pantai',icon:'tent',color:'#12a773',items:['Tikar','Makanan & minuman','Tabir surya','Pakaian ganti & handuk','Payung / topi','Kantong sampah','Mainan anak','Obat & P3K','Power bank']}
];
const tplById=id=>TEMPLATES.find(t=>t.id===id);
const CUSTOM={id:'custom',title:'Ho Jak Baru',icon:'list',color:'#3b4fe0',items:[]};
const look=kind=>tplById(kind)||CUSTOM;

/* open: {tpl:'hospital'} (tujuan bawaan) atau {trip:'<id>'} (buatan sendiri); mode: 'cloud' | 'local' */
const hj={trips:[],items:[],familyId:null,loaded:false,loading:false,error:'',detail:'',mode:'cloud',open:null,rt:null,rtFamily:null,virtual:{},busy:null};
/* Jenis galat: tabel belum dibuat, izin kurang, atau galat lain (ditampilkan apa adanya) */
const kindOfError=msg=>/schema cache|does not exist|PGRST205|42P01/i.test(msg)?'setup':/permission denied|row-level security|42501/i.test(msg)?'perm':'';
configs.hojak={title:'Ho Jak',sub:'',icon:'compass',list:'hojakTrips'};
TONES.compass='teal';

const uid=()=>crypto.randomUUID();
const localKey=()=>`portalHojak:${state.family?.id}`;
const readLocal=()=>{try{return JSON.parse(localStorage.getItem(localKey())||'null')}catch{return null}};
const saveLocal=()=>{try{localStorage.setItem(localKey(),JSON.stringify({trips:hj.trips,items:hj.items}))}catch{}};

function reset(){Object.assign(hj,{trips:[],items:[],loaded:false,loading:false,error:'',detail:'',mode:'cloud',open:null,virtual:{},busy:null,familyId:state.family?.id||null})}
const itemsOf=id=>hj.items.filter(i=>i.trip_id===id).sort((a,b)=>a.position-b.position||String(a.created_at).localeCompare(String(b.created_at)));
const primaryTrip=tplId=>hj.trips.filter(t=>t.kind===tplId).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)))[0]||null;
const currentTrip=()=>!hj.open?null:hj.open.trip?hj.trips.find(t=>t.id===hj.open.trip)||null:primaryTrip(hj.open.tpl);
const customTrips=()=>hj.trips.filter(t=>t.kind==='custom'||(tplById(t.kind)&&primaryTrip(t.kind)?.id!==t.id));
const tally=list=>{const done=list.filter(i=>i.checked).length;return {done,total:list.length,pct:list.length?Math.round(done/list.length*100):0}};
/* Daftar yang ditampilkan: milik server/lokal bila sudah ada, kalau belum, daftar bawaan (belum disimpan) */
function viewItems(){
  const trip=currentTrip();
  if(trip)return itemsOf(trip.id);
  if(hj.open?.tpl){const picked=hj.virtual[hj.open.tpl]||new Set();return tplById(hj.open.tpl).items.map((label,i)=>({id:`v:${i}`,label,checked:picked.has(i),position:i,virtual:true}))}
  return [];
}
const tplProgress=tplId=>{const trip=primaryTrip(tplId);return trip?tally(itemsOf(trip.id)):{done:0,total:tplById(tplId).items.length,pct:0,fresh:true}};

/* ---- Penyimpanan: server (cloud) atau perangkat ini (local) ---- */
const toDb={
  async createTrip(row){
    if(hj.mode==='local'){const trip={id:uid(),family_id:state.family.id,trip_date:null,created_by:session?.user?.id||null,created_at:new Date().toISOString(),...row};hj.trips.unshift(trip);saveLocal();return trip}
    const saved=await sb('/rest/v1/family_trips',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({family_id:state.family.id,created_by:session.user.id,trip_date:null,...row})});
    const trip=saved?.[0];if(!trip)throw new Error('Gagal menyimpan Ho Jak');hj.trips.unshift(trip);return trip;
  },
  async createItems(rows){
    if(!rows.length)return [];
    if(hj.mode==='local'){const made=rows.map(r=>({id:uid(),created_at:new Date().toISOString(),checked:false,...r}));hj.items.push(...made);saveLocal();return made}
    const made=await sb('/rest/v1/family_trip_items',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(rows.map(r=>({family_id:state.family.id,...r})))});
    hj.items.push(...(made||[]));return made||[];
  },
  async patchItem(id,patch){if(hj.mode==='local'){saveLocal();return}await sb(`/rest/v1/family_trip_items?id=eq.${id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(patch)})},
  async resetTrip(tripId){if(hj.mode==='local'){saveLocal();return}await sb(`/rest/v1/family_trip_items?trip_id=eq.${tripId}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({checked:false})})},
  async deleteItem(id){if(hj.mode==='local'){saveLocal();return}await sb(`/rest/v1/family_trip_items?id=eq.${id}`,{method:'DELETE',headers:{Prefer:'return=minimal'}})},
  async deleteTrip(id){if(hj.mode==='local'){saveLocal();return}await sb(`/rest/v1/family_trips?id=eq.${id}`,{method:'DELETE',headers:{Prefer:'return=minimal'}})}
};
const errorText=e=>{const kind=kindOfError(e.message||'');return kind==='setup'?'Tabel Ho Jak belum dibuat. Jalankan supabase-hojak.sql.':kind==='perm'?'Izin Ho Jak belum aktif. Jalankan ulang supabase-hojak.sql.':e.message};

/* Pindahkan data yang tersimpan di perangkat ke server begitu tabel tersedia. */
async function migrateLocal(){
  const local=readLocal();if(!local?.trips?.length)return;
  try{
    for(const trip of local.trips){
      const saved=await sb('/rest/v1/family_trips',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({family_id:state.family.id,created_by:session.user.id,title:trip.title,kind:trip.kind,trip_date:trip.trip_date||null}),silent:true});
      const created=saved?.[0];if(!created)continue;
      const rows=(local.items||[]).filter(i=>i.trip_id===trip.id).map(i=>({trip_id:created.id,family_id:state.family.id,label:i.label,checked:!!i.checked,position:i.position||0}));
      if(rows.length)await sb('/rest/v1/family_trip_items',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(rows),silent:true});
    }
    try{localStorage.removeItem(localKey())}catch{}
    toast('Data Ho Jak di perangkat ini dipindahkan ke server');
  }catch(error){console.warn('[hojak] migrasi gagal',error)}
}

async function load(silent=true){
  if(!state.family||hj.loading)return;
  hj.loading=true;const fid=state.family.id;
  try{
    const [trips,items]=await Promise.all([
      sb(`/rest/v1/family_trips?select=*&family_id=eq.${fid}&order=created_at.desc`,{silent}),
      sb(`/rest/v1/family_trip_items?select=*&family_id=eq.${fid}&order=position.asc,created_at.asc&limit=5000`,{silent})]);
    if(state.family?.id!==fid)return;
    hj.mode='cloud';hj.trips=trips;hj.items=items;hj.error='';hj.detail='';
    if(readLocal()?.trips?.length){await migrateLocal();const [t2,i2]=await Promise.all([sb(`/rest/v1/family_trips?select=*&family_id=eq.${fid}&order=created_at.desc`,{silent:true}),sb(`/rest/v1/family_trip_items?select=*&family_id=eq.${fid}&order=position.asc,created_at.asc&limit=5000`,{silent:true})]);hj.trips=t2;hj.items=i2}
    if(hj.open?.trip&&!hj.trips.some(t=>t.id===hj.open.trip))hj.open=null;
  }catch(error){
    const kind=kindOfError(error.message||'');
    hj.detail=error.message||'';
    if(kind){ // tabel/izin belum siap: tetap bisa dipakai, disimpan di perangkat ini
      const local=readLocal()||{trips:[],items:[]};
      hj.mode='local';hj.trips=local.trips||[];hj.items=local.items||[];hj.error='';
    }else hj.error=hj.detail||'Gagal memuat';
  }
  finally{hj.loading=false;hj.loaded=true}
  if(state.page==='hojak')render();
}

/* ---- Tampilan ---- */
const toneStyle=color=>`style="--c:${color}"`;
const kindChip=kind=>{const t=look(kind);return `<span class="cat-ico" ${toneStyle(t.color)}>${icons[t.icon]}</span>`};

function listView(){
  const tiles=TEMPLATES.map(t=>{
    const p=tplProgress(t.id),state_=p.fresh?'':p.total&&p.done===p.total?'Siap berangkat':`${p.done}/${p.total} siap`;
    return `<button type="button" class="hj-tile${p.total&&p.done===p.total&&!p.fresh?' ready':''}" data-hj-tpl="${t.id}" ${toneStyle(t.color)}><i>${icons[t.icon]}</i><span>${t.title}</span>${state_?`<small>${state_}</small>`:''}</button>`;
  }).join('')+`<button type="button" class="hj-tile hj-blank" data-hj-new ${toneStyle(CUSTOM.color)}><i>${icons.plus}</i><span>Buat sendiri</span></button>`;
  const mine=customTrips().map(t=>{const p=tally(itemsOf(t.id));
    return `<button type="button" class="row hj-card" data-hj-trip="${t.id}">${kindChip(t.kind)}<span class="row-main"><b>${esc(t.title)}</b><small>${p.total?`${p.done} dari ${p.total} siap`:'Belum ada barang'}</small><span class="bar thin ${p.total&&p.done===p.total?'ok':''}"><i style="width:${p.pct}%"></i></span></span>${icons.next}</button>`}).join('');
  return `${sectionLabel('Mau pergi ke mana?')}<div class="hj-tiles">${tiles}</div>${mine?`${sectionLabel('Buatanmu')}<div class="list">${mine}</div>`:''}`;
}

function detailView(){
  const trip=currentTrip(),isTpl=!!hj.open.tpl,list=viewItems(),p=tally(list),ready=p.total>0&&p.done===p.total;
  const sorted=[...list].sort((a,b)=>Number(a.checked)-Number(b.checked)||a.position-b.position);
  const note=hj.mode==='local'?`<p class="hj-local">${icons.alert}<span>Tersimpan di perangkat ini saja. Jalankan supabase-hojak.sql agar tersinkron antar anggota keluarga. <button type="button" class="link" data-hj-retry>Coba hubungkan lagi</button></span></p>`:'';
  return `${note}<section class="card hj-progress ${ready?'ready':''}"><div class="hj-pr-top"><b>${ready?'Siap berangkat!':`${p.done} dari ${p.total} siap`}</b>${ready?`<i class="chip sm tone-green">${icons.sparkles}</i>`:`<strong>${p.pct}%</strong>`}</div><div class="bar ${ready?'ok':''}"><i style="width:${p.pct}%"></i></div></section>
  <div class="list">${sorted.length?sorted.map(i=>`<article class="row"><label class="check"><input type="checkbox" data-hj-check="${i.id}" ${i.checked?'checked':''}><i class="tick">${icons.check}</i></label><span class="row-main"><b class="${i.checked?'strike':''}">${esc(i.label)}</b></span>${delBtn(`data-hj-del-item="${i.id}"`)}</article>`).join(''):emptyState('list','Ceklis masih kosong','Tambahkan barang yang perlu dibawa.')}</div>
  <form id="hjAddForm" class="hj-add"><input name="label" required maxlength="120" placeholder="Tambah barang" autocomplete="off"><button aria-label="Tambah">${icons.plus}</button></form>
  <div class="hj-actions"><button type="button" class="pill-btn soft" data-hj-reset>${icons.rotate}<span>Reset ceklis</span></button>${trip?`<button type="button" class="link-btn danger-text" data-hj-del-trip>${isTpl?'Kembalikan ke bawaan':'Hapus Ho Jak ini'}</button>`:''}</div>`;
}

window.hojakPage=function(){
  let body;
  if(!hj.loaded)body='<div class="mini skeleton"></div>';
  else if(hj.error)body=`<div class="card wx-note"><i class="chip tone-rose">${icons.alert}</i><span class="row-main"><b>Data belum bisa dimuat</b><small class="err-detail">${esc(hj.error)}</small></span><button type="button" class="pill-btn soft" data-hj-retry>Coba lagi</button></div>`;
  else body=hj.open?detailView():listView();
  if(hj.open&&hj.loaded&&!hj.error){
    const trip=currentTrip(),title=hj.open.tpl?tplById(hj.open.tpl).title:trip?trip.title:'Ho Jak',p=tally(viewItems());
    return shell(`<header class="page-head"><button type="button" class="icon-btn" data-hj-back aria-label="Kembali">${icons.back}</button><span class="ph-text"><h1>${esc(title)}</h1><p>${p.total?`${p.done} dari ${p.total} siap`:'Belum ada barang'}</p></span></header><main class="content page-content hj-page">${body}</main>`);
  }
  return shell(`${hdr('hojak','Mau pergi ke mana?',hj.loaded&&!hj.error?addBtn('data-hj-new','Buat'):'')}<main class="content page-content hj-page">${body}</main>`);
};

/* ---- Buat Ho Jak sendiri ---- */
function openNewSheet(){
  document.querySelector('#recordModal')?.remove();
  const modal=document.createElement('div');modal.id='recordModal';modal.className='record-modal';
  modal.innerHTML=`<form class="record-card"><header><b>Ho Jak Sendiri</b><button type="button" data-close-modal>×</button></header><input name="title" required maxlength="80" placeholder="Mau pergi ke mana? Contoh: Ke Rumah Nenek"><button class="primary">Buat Ceklis</button></form>`;
  document.body.append(modal);
  const form=modal.querySelector('form');setTimeout(()=>form.elements.title.focus(),50);
  form.onsubmit=async e=>{e.preventDefault();const btn=form.querySelector('.primary');btn.disabled=true;btn.textContent='Menyimpan…';
    try{const trip=await toDb.createTrip({title:form.elements.title.value.trim(),kind:'custom'});hj.open={trip:trip.id};modal.remove();render();toast('Ho Jak dibuat')}
    catch(error){btn.disabled=false;btn.textContent='Buat Ceklis';toast(errorText(error))}};
}
window.hojakNew=()=>openNewSheet();

/* Daftar bawaan baru disimpan saat pertama kali diubah (centang/tambah/hapus). */
async function ensureTrip(tplId,tweak){
  const existing=primaryTrip(tplId);if(existing)return existing;
  if(hj.busy)return hj.busy.then(()=>primaryTrip(tplId));
  hj.busy=(async()=>{
    const tpl=tplById(tplId),trip=await toDb.createTrip({kind:tplId,title:tpl.title});
    let rows=tpl.items.map((label,i)=>({trip_id:trip.id,family_id:state.family.id,label,position:i,checked:(hj.virtual[tplId]||new Set()).has(i)}));
    if(tweak)rows=tweak(rows);
    await toDb.createItems(rows);delete hj.virtual[tplId];return trip;
  })();
  try{return await hj.busy}finally{hj.busy=null}
}
const realOfVirtual=(tplId,vid)=>{const idx=Number(String(vid).slice(2)),trip=primaryTrip(tplId);return trip?itemsOf(trip.id).find(i=>i.position===idx):null};

/* ---- Aksi ---- */
async function toggleItem(id,checked){
  try{
    if(String(id).startsWith('v:')){
      const tplId=hj.open.tpl,idx=Number(id.slice(2)),picked=hj.virtual[tplId]||(hj.virtual[tplId]=new Set());
      checked?picked.add(idx):picked.delete(idx);render();
      if(!primaryTrip(tplId))await ensureTrip(tplId);
      const real=realOfVirtual(tplId,id);
      if(real&&real.checked!==checked){real.checked=checked;await toDb.patchItem(real.id,{checked})}
      render();return;
    }
    const item=hj.items.find(i=>i.id===id);if(!item)return;
    const before=item.checked;item.checked=checked;render();
    try{await toDb.patchItem(id,{checked})}catch(error){item.checked=before;render();throw error}
  }catch(error){toast(errorText(error))}
}
async function addItem(label){
  if(!hj.open||!label)return;
  try{
    const trip=hj.open.tpl?await ensureTrip(hj.open.tpl):currentTrip();if(!trip)return;
    const pos=Math.max(-1,...itemsOf(trip.id).map(i=>i.position))+1;
    await toDb.createItems([{trip_id:trip.id,family_id:state.family.id,label,position:pos}]);render();
    requestAnimationFrame(()=>document.querySelector('#hjAddForm input')?.focus());
  }catch(error){toast(errorText(error))}
}
async function delItem(id){
  try{
    if(String(id).startsWith('v:')){
      const idx=Number(id.slice(2));await ensureTrip(hj.open.tpl,rows=>rows.filter((_,i)=>i!==idx));render();return;
    }
    const before=hj.items;hj.items=hj.items.filter(i=>i.id!==id);render();
    try{await toDb.deleteItem(id);if(hj.mode==='local')saveLocal()}catch(error){hj.items=before;render();throw error}
  }catch(error){toast(errorText(error))}
}
async function resetList(){
  if(!hj.open)return;
  if(hj.open.tpl&&!primaryTrip(hj.open.tpl)){hj.virtual[hj.open.tpl]=new Set();render();toast('Ceklis di-reset');return}
  const trip=currentTrip();if(!trip)return;
  const changed=itemsOf(trip.id).filter(i=>i.checked);if(!changed.length){toast('Ceklis sudah kosong');return}
  changed.forEach(i=>{i.checked=false});render();
  try{await toDb.resetTrip(trip.id);toast('Ceklis di-reset')}catch(error){changed.forEach(i=>{i.checked=true});render();toast(errorText(error))}
}
async function deleteList(){
  const trip=currentTrip();if(!trip)return;const isTpl=!!hj.open.tpl;
  const ok=await confirmSheet(isTpl
    ?{title:'Kembalikan ke bawaan?',message:`Daftar "${trip.title}" akan kembali ke isi bawaan: barang tambahan dan centang dihapus untuk semua anggota keluarga.`,confirm:'Kembalikan',danger:true}
    :{title:'Hapus Ho Jak ini?',message:`"${trip.title}" dan seluruh ceklisnya akan dihapus untuk semua anggota keluarga.`,confirm:'Hapus',danger:true});
  if(!ok)return;
  try{await toDb.deleteTrip(trip.id);hj.trips=hj.trips.filter(t=>t.id!==trip.id);hj.items=hj.items.filter(i=>i.trip_id!==trip.id);if(hj.mode==='local')saveLocal();if(!isTpl)hj.open=null;render();toast(isTpl?'Dikembalikan ke bawaan':'Ho Jak dihapus')}
  catch(error){toast(errorText(error))}
}

document.addEventListener('click',event=>{
  const t=event.target,hit=s=>t.closest(s);let el;
  if(hit('[data-hj-new]')){event.preventDefault();openNewSheet();return}
  if(el=hit('[data-hj-tpl]')){hj.open={tpl:el.dataset.hjTpl};render();return}
  if(el=hit('[data-hj-trip]')){hj.open={trip:el.dataset.hjTrip};render();return}
  if(hit('[data-hj-back]')){hj.open=null;render();return}
  if(hit('[data-hj-reset]')){resetList();return}
  if(hit('[data-hj-del-trip]')){deleteList();return}
  if(el=hit('[data-hj-del-item]')){delItem(el.dataset.hjDelItem);return}
  if(hit('[data-hj-retry]')){hj.loaded=false;hj.error='';render();return}
});
document.addEventListener('change',e=>{const box=e.target.closest('[data-hj-check]');if(box)toggleItem(box.dataset.hjCheck,box.checked)});
document.addEventListener('submit',e=>{if(e.target.id!=='hjAddForm')return;e.preventDefault();const input=e.target.elements.label,label=input.value.trim();input.value='';addItem(label)},true);

/* ---- Pemuatan data & realtime ---- */
function subscribe(){
  if(hj.mode!=='cloud'||!window.supabaseClient||!state.family||hj.rtFamily===state.family.id)return;
  if(hj.rt)window.supabaseClient.removeChannel(hj.rt);
  const id=state.family.id;hj.rtFamily=id;let timer;
  const channel=window.supabaseClient.channel(`hojak-${id}`);
  ['family_trips','family_trip_items'].forEach(table=>channel.on('postgres_changes',{event:'*',schema:'public',table,filter:`family_id=eq.${id}`},()=>{clearTimeout(timer);timer=setTimeout(()=>{if(hj.loaded&&!hj.error&&hj.mode==='cloud')load(true)},250)}));
  channel.subscribe();hj.rt=channel;
}
const renderBeforeHojak=render;
render=function(){
  renderBeforeHojak();
  if(!state.logged||!state.family)return;
  if(hj.familyId!==state.family.id)reset();
  if(state.page!=='hojak'&&hj.open)hj.open=null;   // keluar dari Ho Jak lalu kembali: mulai dari daftar tujuan
  if(state.page==='hojak'&&!hj.loaded&&!hj.loading)load(true);
  if(hj.loaded)subscribe();
};
const clearBeforeHojak=clearFamilyCache;
clearFamilyCache=function(){clearBeforeHojak();if(hj.rt&&window.supabaseClient){window.supabaseClient.removeChannel(hj.rt)}hj.rt=null;hj.rtFamily=null;reset();hj.familyId=null};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.page==='hojak'&&hj.loaded&&!hj.error&&hj.mode==='cloud')load(true)});

render();
})();
