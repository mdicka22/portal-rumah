/* Interaksi tambahan: dialog dalam aplikasi (pengganti prompt/confirm), tombol "+" kontekstual,
   edit data, tugas yang digabung ke Kalender, hapus belanjaan yang sudah dibeli, dan pencarian arsip.
   Dimuat setelah ui.js; dipakai juga oleh handler di app.js (askText, confirmSheet). */
(()=>{
const $q=(s,p=document)=>p.querySelector(s);

/* ================= Dialog dalam aplikasi ================= */
function openDialog(html){
  $q('#dialogSheet')?.remove();
  const modal=document.createElement('div');modal.id='dialogSheet';modal.className='record-modal dialog-sheet';
  modal.innerHTML=html;document.body.append(modal);return modal;
}
window.confirmSheet=function({title,message='',confirm='OK',cancel='Batal',danger=false}){
  return new Promise(resolve=>{
    const modal=openDialog(`<div class="record-card dialog-card" role="alertdialog" aria-modal="true"><header><b>${esc(title)}</b></header>${message?`<p class="dialog-msg">${esc(message)}</p>`:''}<div class="dialog-actions"><button type="button" class="secondary" data-dlg="no">${esc(cancel)}</button><button type="button" class="primary${danger?' danger':''}" data-dlg="yes">${esc(confirm)}</button></div></div>`);
    const finish=value=>{modal.remove();document.removeEventListener('keydown',onKey,true);resolve(value)};
    const onKey=e=>{if(e.key==='Escape'){e.stopPropagation();finish(false)}};
    document.addEventListener('keydown',onKey,true);
    modal.addEventListener('click',e=>{const b=e.target.closest('[data-dlg]');if(b)finish(b.dataset.dlg==='yes');else if(e.target===modal)finish(false)});
    modal.querySelector('[data-dlg="yes"]').focus();
  });
};
window.askText=function({title,label='',placeholder='',value='',confirm='Simpan',cancel='Batal',required=true,multiline=false}){
  return new Promise(resolve=>{
    const field=multiline?`<textarea name="v" rows="3" placeholder="${esc(placeholder)}" ${required?'required':''}>${esc(value)}</textarea>`:`<input name="v" placeholder="${esc(placeholder)}" value="${esc(value)}" maxlength="200" ${required?'required':''} autocomplete="off">`;
    const modal=openDialog(`<form class="record-card dialog-card"><header><b>${esc(title)}</b></header>${label?`<p class="dialog-msg">${esc(label)}</p>`:''}${field}<div class="dialog-actions"><button type="button" class="secondary" data-dlg="no">${esc(cancel)}</button><button class="primary">${esc(confirm)}</button></div></form>`);
    const form=modal.querySelector('form'),finish=v=>{modal.remove();document.removeEventListener('keydown',onKey,true);resolve(v)};
    const onKey=e=>{if(e.key==='Escape'){e.stopPropagation();finish(null)}};
    document.addEventListener('keydown',onKey,true);
    form.onsubmit=e=>{e.preventDefault();const v=form.elements.v.value.trim();if(required&&!v)return;finish(v)};
    modal.addEventListener('click',e=>{if(e.target.closest('[data-dlg="no"]')||e.target===modal)finish(null)});
    setTimeout(()=>form.elements.v.focus(),50);
  });
};

/* ================= Tombol "+" kontekstual ================= */
function openQuickChooser(){
  const modal=openDialog(`<div class="record-card quick-card"><header><b>Tambah apa?</b><button type="button" data-dlg="no" aria-label="Tutup">×</button></header><div class="quick-grid">
    <button type="button" data-qa="agenda"><i class="chip tone-blue">${icons.agenda}</i><span>Agenda / Tugas</span></button>
    <button type="button" data-qa="money"><i class="chip tone-green">${icons.money}</i><span>Transaksi</span></button>
    <button type="button" data-qa="shop"><i class="chip tone-amber">${icons.shop}</i><span>Belanja</span></button>
    <button type="button" data-qa="hojak"><i class="chip tone-teal">${icons.compass}</i><span>Ho Jak</span></button></div></div>`);
  modal.addEventListener('click',e=>{
    const b=e.target.closest('[data-qa]');
    if(!b){if(e.target===modal||e.target.closest('[data-dlg]'))modal.remove();return}
    modal.remove();const what=b.dataset.qa;
    if(what==='agenda')openRecordModal('agenda');
    else if(what==='shop')openRecordModal('shop');
    else if(what==='money'){state.page='money';save();render();window.finOpenAdd?.()}
    else if(what==='hojak'){state.page='hojak';save();render();window.hojakNew?.()}
  });
}
document.addEventListener('click',event=>{
  if(!event.target.closest('[data-quick-add]'))return;
  event.preventDefault();
  const p=state.page;
  if(p==='money'&&window.finOpenAdd)return window.finOpenAdd();
  if(['shop','health','car','house','emergency'].includes(p))return openRecordModal(p);
  if(p==='hojak'&&window.hojakNew)return window.hojakNew();
  if(p==='archive')return $q('[data-archive-upload]')?.click();
  if(p==='map')return $q('[data-share-location]')?.click();
  openQuickChooser();
},true);

/* ================= Edit data ================= */
const MEMBER_NAMES=()=>{const names=(state.members||[]).map(m=>m.display_name).filter(Boolean);return ['Keluarga',...names.filter((n,i)=>names.indexOf(n)===i)]};
const personOptions=current=>{const list=MEMBER_NAMES();if(current&&!list.includes(current))list.push(current);return list.map(n=>`<option value="${esc(n)}"${n===current?' selected':''}>${esc(n)}</option>`).join('')};

const EDIT={
  agenda:{title:'Ubah Agenda',get:i=>state.agenda?.[i],name:r=>r[0],detail:r=>r.detail||{},
    fields:d=>`<input required name="title" placeholder="Judul agenda" value="${esc(d.title)}">${d.repeat==='daily'?'':`<label class="calendar-field">Tanggal<input required type="date" name="date" value="${esc(d.date||'')}"></label>`}<label class="calendar-field">Waktu<input type="time" name="time" value="${/^\d\d:\d\d$/.test(d.time||'')?d.time:''}"></label><label class="calendar-field">Untuk<select name="person">${personOptions(d.person)}</select></label>`,
    build:(f,old)=>({title:f.get('title').trim(),detail:{...old,...(old.repeat==='daily'?{}:{date:f.get('date')}),time:f.get('time')||'--:--',person:f.get('person')}})},
  shop:{title:'Ubah Belanja',get:i=>state.shopping?.[i],name:r=>r[0],detail:r=>r.detail||{},
    fields:d=>`<input required name="title" placeholder="Nama belanja, contoh: Obat" value="${esc(d.title)}"><input name="qty" placeholder="Jumlah/rincian, contoh: Paracetamol 2 strip" value="${esc(d.qty||'')}"><textarea name="note" rows="3" placeholder="Catatan lengkap, contoh: beli yang tablet, untuk demam anak">${esc(d.note||'')}</textarea>`,
    build:(f,old)=>({title:f.get('title').trim(),detail:{...old,qty:f.get('qty').trim(),note:f.get('note').trim()}})},
  health:{title:'Ubah Kesehatan & Anak',get:i=>state.health?.[i],name:r=>r[0],detail:r=>r.detail||{},
    fields:d=>`<input required name="title" placeholder="Kegiatan kesehatan" value="${esc(d.title)}"><label class="calendar-field">Tanggal<input required type="date" name="date" value="${/^\d{4}-/.test(d.date||'')?d.date:''}"></label>`,
    build:(f,old)=>({title:f.get('title').trim(),detail:{...old,date:f.get('date')}})},
  car:{title:'Ubah Kendaraan',get:i=>state.vehicleRecords?.[i],name:r=>r.title,detail:r=>r.detail||{},
    fields:d=>`<input required name="title" placeholder="Nama kendaraan" value="${esc(d.title)}"><input name="note" placeholder="Catatan servis" value="${esc(d.note||'')}">`,
    build:(f,old)=>({title:f.get('title').trim(),detail:{...old,note:f.get('note').trim()}})},
  house:{title:'Ubah Catatan Rumah',get:i=>state.homeRecords?.[i],name:r=>r.title,detail:r=>r.detail||{},
    fields:d=>`<input required name="title" placeholder="Pemeriksaan rumah" value="${esc(d.title)}"><input name="note" placeholder="Catatan" value="${esc(d.note||'')}">`,
    build:(f,old)=>({title:f.get('title').trim(),detail:{...old,note:f.get('note').trim()}})},
  emergency:{title:'Ubah Kontak Darurat',get:i=>state.emergencyRecords?.[i],name:r=>r.title,detail:r=>r.detail||{},
    fields:d=>{const cats=['Rumah Sakit','Dokter','Sekolah','Keamanan','Tetangga','PLN / PDAM','Bengkel','Lainnya'];return `<input required name="title" placeholder="Nama kontak, contoh: RS terdekat" value="${esc(d.title)}"><input required name="phone" inputmode="tel" placeholder="Nomor telepon" value="${esc(d.phone||'')}"><select name="category">${cats.map(c=>`<option${c===d.category?' selected':''}>${c}</option>`).join('')}</select><input name="note" placeholder="Catatan singkat, contoh: terima BPJS" value="${esc(d.note||'')}">`},
    build:(f,old)=>({title:f.get('title').trim(),detail:{...old,phone:f.get('phone').trim(),category:f.get('category'),note:f.get('note').trim()}})}
};

function openEditRecord(kind,index){
  const spec=EDIT[kind],row=spec?.get(index);if(!row)return;
  const id=row.rid||row.id;if(!id)return;
  const old=spec.detail(row);
  $q('#recordModal')?.remove();
  const modal=document.createElement('div');modal.id='recordModal';modal.className='record-modal';
  modal.innerHTML=`<form class="record-card"><header><b>${spec.title}</b><button type="button" data-close-modal>×</button></header>${spec.fields({...old,title:spec.name(row)})}<button class="primary">Simpan Perubahan</button></form>`;
  document.body.append(modal);
  const form=modal.querySelector('form');
  form.onsubmit=async e=>{
    e.preventDefault();const btn=form.querySelector('.primary');btn.disabled=true;
    const built=spec.build(new FormData(form),old);
    try{
      await sb(`/rest/v1/family_records?id=eq.${id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({title:built.title,detail:built.detail,updated_at:new Date().toISOString()})});
      await loadRecords();recordActivity(`Mengubah ${built.title}`);modal.remove();render();toast('Perubahan tersimpan');
    }catch(error){btn.disabled=false;toast(error.message)}
  };
}
document.addEventListener('click',event=>{
  const el=event.target.closest('[data-edit]');if(!el)return;
  const [kind,index]=el.dataset.edit.split(':');openEditRecord(kind,Number(index));
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;const el=event.target.closest?.('[data-edit]');
  if(el&&el.getAttribute('role')==='button'){event.preventDefault();const [kind,index]=el.dataset.edit.split(':');openEditRecord(kind,Number(index))}
});
/* Belanja: ketuk item membuka form ubah (menggantikan jendela detail baca-saja) */
openShoppingDetail=function(item){const index=(state.shopping||[]).indexOf(item);if(index>=0)openEditRecord('shop',index)};

/* ================= Agenda & tugas dalam satu form ================= */
async function createTask(title,assignee){
  const saved=await sb('/rest/v1/family_tasks',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({family_id:state.family.id,title,category:assignee||'Keluarga',created_by:session.user.id})});
  const task=saved?.[0];if(task)state.cloudTasks=[task,...(state.cloudTasks||[]).filter(i=>i.id!==task.id)];
  save();render();
  try{
    const notes=await sb('/rest/v1/family_notifications',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({family_id:state.family.id,actor_id:session.user.id,title:'Tugas baru untuk keluarga',body:assignee&&assignee!=='Keluarga'?`${title} · untuk ${assignee}`:title})});
    const note=notes?.[0];
    if(note)await sb('/rest/v1/family_notification_reads?on_conflict=notification_id,user_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({notification_id:note.id,user_id:session.user.id})});
  }catch{}
  loadCloudTasks(true).then(()=>{save();render()}).catch(()=>{});
}
openAgendaModal=function(){
  $q('#recordModal')?.remove();
  const modal=document.createElement('div');modal.id='recordModal';modal.className='record-modal';
  modal.innerHTML=`<form class="record-card fin-form"><header><b>Tambah Agenda</b><button type="button" data-close-modal>×</button></header>
    <div class="seg"><button type="button" class="active" data-mode="agenda">Agenda</button><button type="button" data-mode="task">Tugas</button></div>
    <input required name="title" placeholder="Judul agenda atau rutinitas">
    <div class="mode-agenda"><select name="repeat"><option value="">Agenda tanggal tertentu</option><option value="daily">Rutinitas harian</option></select><label class="calendar-field" data-date-field>Tanggal<input type="date" name="date"></label><label class="calendar-field">Waktu<input type="time" name="time"></label></div>
    <label class="calendar-field">Untuk<select name="person">${personOptions('Keluarga')}</select></label>
    <p class="mode-task dialog-msg" hidden>Tugas tidak punya tanggal. Semua anggota akan mendapat pemberitahuan.</p>
    <button class="primary">Simpan Agenda</button></form>`;
  document.body.append(modal);
  const form=modal.querySelector('form');let mode='agenda';
  const sync=()=>{
    form.querySelector('.mode-agenda').hidden=mode==='task';form.querySelector('.mode-task').hidden=mode!=='task';
    const daily=form.elements.repeat.value==='daily';form.querySelector('[data-date-field]').hidden=daily;
    form.querySelector('.primary').textContent=mode==='task'?'Simpan Tugas':'Simpan Agenda';
    form.elements.title.placeholder=mode==='task'?'Tugas apa yang ingin diberikan?':'Judul agenda atau rutinitas';
  };
  form.addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;mode=b.dataset.mode;form.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));sync()});
  form.elements.repeat.addEventListener('change',sync);
  form.onsubmit=async e=>{
    e.preventDefault();const d=new FormData(form),title=d.get('title').trim(),person=d.get('person'),btn=form.querySelector('.primary');if(!title)return;
    btn.disabled=true;
    try{
      if(mode==='task'){await createTask(title,person);modal.remove();toast('Tugas terkirim dan notifikasi dibuat');return}
      const repeat=d.get('repeat'),date=d.get('date'),time=d.get('time')||'--:--';
      if(!repeat&&!date){btn.disabled=false;toast('Pilih tanggal agenda atau jadikan rutinitas harian');return}
      await sb('/rest/v1/family_records',{method:'POST',body:JSON.stringify({family_id:state.family.id,record_type:'agenda',title,detail:{date,repeat,time,person},created_by:session.user.id})});
      await loadRecords();await recordActivity(`Menambahkan agenda ${title}`);modal.remove();render();toast(repeat==='daily'?'Rutinitas harian tersimpan':'Agenda tersimpan');
    }catch(error){btn.disabled=false;toast(error.message)}
  };
  sync();
};

/* ================= Belanja: hapus yang sudah dibeli ================= */
document.addEventListener('click',async event=>{
  if(!event.target.closest('[data-clear-bought]'))return;
  const bought=(state.shopping||[]).filter(x=>x[1]&&x.rid);if(!bought.length)return;
  const ok=await confirmSheet({title:'Hapus yang sudah dibeli?',message:`${bought.length} barang yang sudah dicentang akan dihapus untuk semua anggota keluarga.`,confirm:'Hapus',danger:true});
  if(!ok)return;
  try{
    await sb(`/rest/v1/family_records?id=in.(${bought.map(x=>x.rid).join(',')})`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    await loadRecords();render();toast(`${bought.length} barang dihapus`);
  }catch(error){toast(/permission|policy|row-level/i.test(error.message)?'Izin hapus belum aktif. Jalankan SQL sinkronisasi terbaru.':error.message)}
},true);

/* ================= Arsip: pencarian & urutan ================= */
document.addEventListener('input',event=>{
  const input=event.target.closest('#archiveSearch');if(!input)return;
  const q=input.value.trim().toLowerCase(),box=$q('#archiveResults'),normal=$q('#archiveNormal');if(!box||!normal)return;
  if(!q){box.hidden=true;normal.hidden=false;return}
  const docs=(state.cloudDocs||[]).filter(d=>`${d.file_name} ${d.category}`.toLowerCase().includes(q)),kb=x=>Math.max(1,Math.round((x.file_size||0)/1024));
  normal.hidden=true;box.hidden=false;
  box.innerHTML=docs.length?`<div class="list archive-list">${docs.map(x=>`<article class="row document-row"><button type="button" class="document-main" data-doc-preview="${x.id}"><i class="chip tone-indigo">${icons[/\.(png|jpe?g|webp|gif)$/i.test(x.file_name||'')?'image':'file']}</i><span class="row-main"><b>${esc(x.file_name)}</b><small>${esc(x.category)} · ${kb(x)} KB</small></span></button><button type="button" class="icon-btn ghost danger" data-doc-delete="${x.id}" aria-label="Hapus arsip">${icons.trash}</button></article>`).join('')}</div>`:emptyState('archive','Tidak ditemukan','Coba kata kunci lain.');
});
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-archive-sort]');if(!b)return;
  state.archiveSort=b.dataset.archiveSort;save();render();
});

/* ================= Arsip: pratinjau lebih cepat & hapus file ================= */
/* Tautan aman file disimpan sementara (berlaku 1 jam), sehingga membuka ulang file tidak
   meminta tautan ke server lagi. Tautan semua file di halaman Arsip diminta sekaligus
   dalam satu panggilan begitu halaman terbuka, jadi saat file diketuk langsung dimuat. */
const signCache=new Map();
const signBase=signPrivateFile;
signPrivateFile=async function(bucket,path,expiresIn=86400){
  const key=bucket+'|'+path,hit=signCache.get(key);
  if(hit&&hit.exp>Date.now())return hit.url;
  const url=await signBase(bucket,path,expiresIn);
  signCache.set(key,{url,exp:Date.now()+expiresIn*800});
  return url;
};
const absoluteSigned=signed=>signed.startsWith('http')?signed:SB_URL+'/storage/v1'+(signed.startsWith('/')?'':'/')+signed;
let prefetching=false;
async function prefetchDocumentUrls(){
  if(prefetching||state.page!=='archive'||!session?.access_token)return;
  const fresh=path=>{const hit=signCache.get('family-documents|'+path);return hit&&hit.exp>Date.now()};
  const docs=(state.cloudDocs||[]).filter(d=>d.file_path&&!fresh(d.file_path)).slice(0,80);
  if(!docs.length)return;
  prefetching=true;
  try{
    const request=token=>fetch(SB_URL+'/storage/v1/object/sign/family-documents',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({expiresIn:3600,paths:docs.map(d=>d.file_path)})});
    let res=await request(session.access_token);
    if(res.status===401){await renewSession();res=await request(session.access_token)}
    if(!res.ok)return;
    (await res.json()).forEach(item=>{const signed=item.signedURL||item.signedUrl;if(signed&&item.path)signCache.set('family-documents|'+item.path,{url:absoluteSigned(signed),exp:Date.now()+3600*800})});
  }catch{}finally{prefetching=false}
}
/* Jari menyentuh file: untuk gambar, mulai unduh lebih awal. */
document.addEventListener('pointerdown',event=>{
  const el=event.target.closest('[data-doc-preview]');if(!el)return;
  const doc=(state.cloudDocs||[]).find(d=>String(d.id)===String(el.dataset.docPreview));
  const hit=doc&&signCache.get('family-documents|'+doc.file_path);
  if(hit&&hit.exp>Date.now()&&/\.(jpe?g|png|webp|gif)$/i.test(doc.file_name||''))new Image().src=hit.url;
},{passive:true});

/* Pratinjau: indikator "Memuat dokumen…" sampai isinya benar-benar tampil, plus tombol Hapus. */
const previewBase=openDocumentPreview;
openDocumentPreview=async function(doc){
  await previewBase(doc);
  const modal=$q('#documentPreview');if(!modal)return;
  const footer=$q('footer',modal);
  if(footer&&!footer.querySelector('[data-doc-delete]'))footer.insertAdjacentHTML('afterbegin','<button type="button" class="secondary doc-delete" data-doc-delete="'+esc(doc.id)+'">'+icons.trash+'<span>Hapus</span></button>');
  const media=$q('.document-preview-body img, .document-preview-body iframe',modal);
  if(media&&!(media.tagName==='IMG'&&media.complete&&media.naturalWidth)){
    const loader=document.createElement('div');loader.className='document-loading overlay';loader.innerHTML='<i></i><span>Memuat dokumen…</span>';
    media.parentElement.append(loader);
    const finish=()=>loader.remove();
    media.addEventListener('load',finish,{once:true});media.addEventListener('error',finish,{once:true});setTimeout(finish,20000);
  }
};

/* Hapus file: pastikan benar-benar terhapus (sebelumnya hasilnya tidak diperiksa). */
deleteFamilyDocument=async function(doc){
  if(!await confirmSheet({title:'Hapus dokumen?',message:'"'+doc.file_name+'" akan dihapus permanen.',confirm:'Hapus',danger:true}))return;
  try{
    const gone=await sb('/rest/v1/family_documents?id=eq.'+encodeURIComponent(doc.id),{method:'DELETE',headers:{Prefer:'return=representation'}});
    if(!Array.isArray(gone)||!gone.length)throw new Error('Izin hapus arsip belum aktif. Jalankan SQL supabase-archive-delete.sql terlebih dahulu.');
    let fileRemoved=false;
    try{
      const res=await fetch(SB_URL+'/storage/v1/object/family-documents',{method:'DELETE',headers:{apikey:SB_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({prefixes:[doc.file_path]})});
      fileRemoved=res.ok&&(await res.json()).length>0;
    }catch{}
    signCache.delete('family-documents|'+doc.file_path);
    state.cloudDocs=(state.cloudDocs||[]).filter(item=>String(item.id)!==String(doc.id));
    save();$q('#documentPreview')?.remove();render();
    toast(fileRemoved?'Dokumen dihapus':'Dokumen dihapus. File fisiknya mungkin masih tersimpan; jalankan supabase-archive-delete.sql.');
  }catch(error){toast(/permission|policy|row-level/i.test(error.message)?'Izin hapus arsip belum aktif. Jalankan SQL supabase-archive-delete.sql terlebih dahulu.':error.message)}
};
const renderBeforeArchive=render;
render=function(){renderBeforeArchive();if(state.page==='archive')prefetchDocumentUrls()};

/* ================= Tombol kembali melayang ================= */
const BACK_SELECTOR='.page-head [data-action="back"],.page-head [data-hj-back],.page-head [data-tab="home"],.hero-back';
function setupFloatBack(){
  document.querySelectorAll('.float-back').forEach(b=>b.remove());
  const app=$q('.phone-app'),view=$q('.viewport'),original=$q(BACK_SELECTOR);
  if(!app||!view||!original||$q('.chat-head'))return;   // chat sudah punya header yang menempel
  const button=document.createElement('button');
  button.type='button';button.className='float-back';button.setAttribute('aria-label','Kembali');button.innerHTML=icons.back;
  button.onclick=()=>original.click();
  app.append(button);
  const update=()=>button.classList.toggle('visible',view.scrollTop>140);
  view.addEventListener('scroll',update,{passive:true});
  requestAnimationFrame(()=>requestAnimationFrame(update));
}
const renderBeforeFloatBack=render;
render=function(){renderBeforeFloatBack();setupFloatBack()};

render();
})();
