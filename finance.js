/* Keuangan keluarga — pengganti RuangKas yang terpisah.
   Dimuat setelah weather.js. Data di tabel family_transactions dan family_budgets (lihat
   supabase-finance.sql), terikat ke keluarga aktif dan hanya terbaca oleh anggotanya. */
(()=>{
/* ---- Sumber impor: database RuangKas lama (hanya dibaca, kunci anon publik). Hapus blok ini setelah migrasi selesai. ---- */
const OLD_URL='https://qwwelgiywnmdyplyjjqj.supabase.co',OLD_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3d2VsZ2l5d25tZHlwbHlqanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMzg3MzEsImV4cCI6MjA5NjYxNDczMX0.bVVDCIIrmyUFyJt53gmV1Y9OGaegiZKRRgXRtg3ee2Q';

const INCOME=['Gaji','Usaha','Bonus','Investasi','Hadiah','Lainnya'];
const EXPENSE=['Makan & Minum','Rumah Tangga','Transportasi','Kendaraan Mobil','Kendaraan Honda','Tagihan & Internet','Sedekah','Cicilan','Orang Tua','Anak','Kesehatan','Hiburan','Pakaian','Lainnya'];
const COLORS={'Makan & Minum':'#ff6b6b','Rumah Tangga':'#339af0','Transportasi':'#40c057','Kendaraan Mobil':'#7950f2','Kendaraan Honda':'#ff922b','Tagihan & Internet':'#15aabf','Sedekah':'#f5b301','Cicilan':'#3b5bdb','Orang Tua':'#f06595','Anak':'#22b8cf','Kesehatan':'#82c91e','Hiburan':'#cc5de8','Pakaian':'#c08457','Lainnya':'#868e96','Gaji':'#12a773','Usaha':'#0ca5b0','Bonus':'#f5a524','Investasi':'#5b4ef5','Hadiah':'#e8589a'};
const CAT_ICON={'Gaji':'banknote','Usaha':'store','Bonus':'award','Investasi':'trend','Hadiah':'gift','Makan & Minum':'utensils','Rumah Tangga':'basket','Transportasi':'bus','Kendaraan Mobil':'car','Kendaraan Honda':'bike','Tagihan & Internet':'wifi','Sedekah':'handHeart','Cicilan':'card','Orang Tua':'users','Anak':'baby','Kesehatan':'health','Hiburan':'film','Pakaian':'shirt','Lainnya':'grid'};
const PERSONS=['Suami','Istri','Bersama'];

Object.assign(icons,{
  banknote:svg('<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>'),
  store:svg('<path d="m3 9 1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9h18M9 20v-6h6v6"/>'),
  award:svg('<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>'),
  trend:svg('<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>'),
  gift:svg('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>'),
  utensils:svg('<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>'),
  basket:svg('<path d="m15 11-1 9M19 11l-4-7M2 11h20M3.5 11l1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4M4.5 15.5h15M5 11l4-7M9 11l1 9"/>'),
  bus:svg('<path d="M8 6v6M15 6v6M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>'),
  bike:svg('<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>'),
  wifi:svg('<path d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.86a10 10 0 0 1 14 0M8.5 16.43a5 5 0 0 1 7 0"/>'),
  handHeart:svg('<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12z"/>'),
  card:svg('<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>'),
  baby:svg('<path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>'),
  film:svg('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M3 7.5h4M3 12h18M3 16.5h4M17 3v18M17 7.5h4M17 16.5h4"/>'),
  shirt:svg('<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'),
  grid:svg('<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'),
  target:svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  download:svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>'),
  smile:svg('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>'),
  meh:svg('<circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/>'),
  frown:svg('<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01"/>'),
  sparkles:svg('<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>'),
  piggy:svg('<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"/><path d="M2 9v1c0 1.1.9 2 2 2h1M16 11h.01"/>')
});

configs.money.title='Keuangan';

/* ---- Helpers ---- */
const pad=n=>String(n).padStart(2,'0');
const localISO=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const nowMonth=()=>localISO().slice(0,7);
const fmt=v=>(v<0?'-':'')+'Rp'+Math.abs(Math.round(v)).toLocaleString('id-ID');
const compact=v=>state.lang==='en'?'Rp'+new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(Number(v)||0):new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',notation:'compact',maximumFractionDigits:1}).format(Number(v)||0);
const monthLabel=ym=>new Date(`${ym}-01T00:00:00`).toLocaleDateString(LOC(),{month:'long',year:'numeric'});
const dayLabel=iso=>{const y=new Date();y.setDate(y.getDate()-1);return iso===localISO()?'Hari ini':iso===localISO(y)?'Kemarin':new Date(`${iso}T00:00:00`).toLocaleDateString(LOC(),{weekday:'short',day:'2-digit',month:'short',year:'numeric'})};
const shortDate=iso=>new Date(`${iso}T00:00:00`).toLocaleDateString(LOC(),{day:'2-digit',month:'short'});
const money=v=>`<span class="money">${fmt(v)}</span>`;
const catTile=(cat,small)=>`<span class="cat-ico${small?' sm':''}" style="--c:${COLORS[cat]||'#868e96'}">${icons[CAT_ICON[cat]||'grid']}</span>`;
const prevMonth=ym=>{const [y,m]=ym.split('-').map(Number),d=new Date(y,m-2,1);return `${d.getFullYear()}-${pad(d.getMonth()+1)}`};
const shiftMonth=(ym,n)=>{const [y,m]=ym.split('-').map(Number),d=new Date(y,m-1+n,1);return `${d.getFullYear()}-${pad(d.getMonth()+1)}`};
const readFlag=k=>{try{return localStorage.getItem(k)}catch{return null}};
const writeFlag=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};

/* ---- State ---- */
const kindOfError=msg=>/schema cache|does not exist|PGRST205|42P01/i.test(msg)?'setup':/permission denied|row-level security|42501/i.test(msg)?'perm':'';
const fin={tx:[],budgets:{},familyId:null,loaded:false,loading:false,error:'',detail:'',tab:'ringkasan',rtab:'analisis',filter:'all',catFilter:null,drill:null,month:nowMonth(),armed:null,importing:false,
  private:readFlag('portalFinPrivacy')==='1'};
const importKey=()=>`portalFinImportHidden:${state.family?.id}`;

function resetFin(){Object.assign(fin,{tx:[],budgets:{},loaded:false,loading:false,error:'',drill:null,catFilter:null,armed:null,familyId:state.family?.id||null})}

/* ---- Data ---- */
async function finLoad(silent=false){
  if(!state.family||fin.loading)return;
  fin.loading=true;const fid=state.family.id;
  try{
    const rows=[];
    for(let from=0;;from+=1000){
      const page=await sb(`/rest/v1/family_transactions?select=*&family_id=eq.${fid}&order=date.desc,created_at.desc&limit=1000&offset=${from}`,{silent});
      rows.push(...page);if(page.length<1000)break;
    }
    const budgetRows=await sb(`/rest/v1/family_budgets?select=month,category,amount&family_id=eq.${fid}`,{silent});
    if(state.family?.id!==fid)return;
    fin.tx=rows.map(r=>({...r,amount:Number(r.amount)}));
    fin.budgets={};budgetRows.forEach(b=>{(fin.budgets[b.month]||(fin.budgets[b.month]={}))[b.category]=Number(b.amount)});
    fin.error='';fin.detail='';fin.loaded=true;
  }catch(error){
    fin.detail=error.message||'';fin.error=kindOfError(fin.detail)||fin.detail||'Gagal memuat';
    fin.loaded=true;
  }finally{fin.loading=false}
  if(state.page==='money'||(!state.page&&state.tab==='home'))render();
}

const inMonth=()=>fin.month?fin.tx.filter(t=>t.date&&t.date.startsWith(fin.month)):fin.tx;
const activeBudgets=()=>{
  if(fin.month)return fin.budgets[fin.month]||{};
  const all={};Object.values(fin.budgets).forEach(m=>Object.entries(m).forEach(([c,v])=>{all[c]=(all[c]||0)+v}));return all;
};
const totalBudget=()=>Object.values(activeBudgets()).reduce((s,v)=>s+v,0);
function totals(){
  const d=inMonth(),income=d.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),expense=d.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),
    charity=d.filter(t=>t.type==='expense'&&t.category==='Sedekah').reduce((s,t)=>s+t.amount,0);
  return {income,expense,charity,balance:income-expense};
}
const personIncome=p=>inMonth().filter(t=>t.type==='income'&&t.person===p).reduce((s,t)=>s+t.amount,0);
const expenseByCat=()=>inMonth().filter(t=>t.type==='expense').reduce((g,t)=>(g[t.category]=(g[t.category]||0)+t.amount,g),{});
const savingRate=d=>d.income>0?Math.max(0,Math.round(d.balance/d.income*100)):0;

/* ---- Potongan tampilan ---- */
function donut(entries,total,selected){
  const stroke=22,r=100-stroke/2-4,c=2*Math.PI*r;
  let out=`<circle cx="100" cy="100" r="${r}" fill="none" stroke="#e8ebf6" stroke-width="${stroke}"/>`;
  if(!entries.length||total<=0)return out;
  const gap=entries.length>1?3:0;let offset=0;
  entries.forEach(([cat,amount])=>{
    const len=amount/total*c,dash=Math.max(len-gap,.8),dim=selected&&selected!==cat?' opacity=".22"':'';
    out+=`<circle class="seg" data-fin-cat="${esc(cat)}" cx="100" cy="100" r="${r}" fill="none" stroke="${COLORS[cat]||'#868e96'}" stroke-width="${stroke}" stroke-dasharray="${dash} ${c-dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 100 100)"${dim}/>`;
    offset+=len;
  });
  return out;
}
const donutBox=(entries,total,selected,big,label)=>`<div class="donut"><svg viewBox="0 0 200 200" aria-hidden="true">${donut(entries,total,selected)}</svg><div class="donut-c"><b>${big}</b><small>${label}</small></div></div>`;

function txRow(t,{del=false,date=false}={}){
  const income=t.type==='income',parts=[t.category,t.person];if(date)parts.push(shortDate(t.date));if(t.note)parts.push(t.note);
  const armed=fin.armed===t.id;
  return `<article class="tx ${t.type}">${catTile(t.category)}<div class="tx-main" data-fin-edit="${esc(t.id)}" role="button" tabindex="0"><b>${esc(t.title)}</b><small>${esc(parts.join(' · '))}</small></div><div class="tx-end"><b class="amt ${income?'masuk':''}">${income?'+':'-'}${money(t.amount)}</b>${del?`<button type="button" class="tx-del${armed?' armed':''}" data-fin-del="${esc(t.id)}" aria-label="Hapus transaksi">${icons.trash}${armed?'<span>Hapus?</span>':''}</button>`:''}</div></article>`;
}

function advice(){
  const d=totals(),groups=expenseByCat(),items=[],bud=activeBudgets(),totalTarget=totalBudget(),saving=d.income>0?Math.round(d.balance/d.income*100):0;
  const ref=new Date(),[sy,sm]=fin.month?fin.month.split('-').map(Number):[ref.getFullYear(),ref.getMonth()+1],lastDay=new Date(sy,sm,0).getDate();
  const daysLeft=sy===ref.getFullYear()&&sm===ref.getMonth()+1?Math.max(1,lastDay-ref.getDate()+1):lastDay;
  Object.keys(bud).forEach(cat=>{
    const budget=bud[cat],spent=groups[cat]||0,ratio=spent/budget;
    if(ratio>1)items.push({lv:0,cls:'danger',cat,text:`Kurangi ${cat} minimal ${fmt(spent-budget)} agar kembali sesuai target.`});
    else if(ratio>=.8)items.push({lv:1,cls:'warn',cat,text:`Batas aman ${cat} sampai akhir bulan sekitar ${fmt(Math.max(0,budget-spent)/daysLeft)} per hari.`});
  });
  if(d.income>0&&d.expense>d.income)items.push({lv:0,cls:'danger',text:`Tahan pengeluaran berikutnya. Arus kas perlu dikurangi ${fmt(d.expense-d.income)} agar kembali seimbang.`});
  else if(d.income>0&&saving<20)items.push({lv:1,cls:'warn',text:`Sisihkan lagi ${fmt(Math.max(0,d.income*.2-d.balance))} untuk mencapai tabungan 20% bulan ini.`});
  const ranked=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  if(d.expense>0&&ranked.length){const [top,val]=ranked[0],share=Math.round(val/d.expense*100);if(share>=35)items.push({lv:1,cls:'warn',cat:top,text:`${top} mengambil ${share}% pengeluaran. Periksa transaksi terbesarnya sebelum belanja lagi.`})}
  if(!items.length){
    if(!d.income&&!d.expense)items.push({lv:2,cls:'ok',text:'Catat pemasukan dan pengeluaran pertama agar saran keuangan bisa muncul.'});
    else if(!totalTarget)items.push({lv:2,cls:'ok',text:'Arus kas masih aman. Buat target kategori agar batas belanja bisa dipantau otomatis.'});
    else items.push({lv:2,cls:'ok',text:`Semua target aman. Pertahankan pengeluaran harian dan tabungan ${saving}% bulan ini.`});
  }
  items.sort((a,b)=>a.lv-b.lv);
  const mood=items.some(i=>i.cls==='danger')?['frown','rose']:items.some(i=>i.cls==='warn')?['meh','amber']:saving>=20?['sparkles','green']:['smile','green'];
  return {items:items.slice(0,4),mood};
}

/* ---- Tab Ringkasan ---- */
function importCard(){
  if(!state.family||fin.tx.some(t=>t.legacy_id)||readFlag(importKey())==='1')return '';
  return `<section class="card fin-import"><i class="chip tone-indigo">${icons.download}</i><span class="row-main"><b>Pindahkan data RuangKas</b><small>Salin semua transaksi dari aplikasi RuangKas lama ke keluarga ini. Aman diulang, data tidak akan ganda.</small></span><div class="fin-import-btns"><button type="button" class="pill-btn soft" data-fin-import ${fin.importing?'disabled':''}>${fin.importing?'Memindahkan…':'Pindahkan'}</button><button type="button" class="link-btn" data-fin-import-hide>Sembunyikan</button></div></section>`;
}

function summaryTab(){
  const d=totals(),target=totalBudget(),percent=target>0?Math.min(Math.round(d.expense/target*100),999):0,groups=expenseByCat(),
    entries=Object.entries(groups).sort((a,b)=>b[1]-a[1]),total=entries.reduce((s,[,v])=>s+v,0),adv=advice(),
    latest=[...inMonth()].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4),
    cls=target>0&&percent>100?'over':target>0&&percent>=80?'warn':'';
  return `${importCard()}
  <section class="fin-balance"><div class="fb-top"><span>Saldo tersisa</span><button type="button" class="fb-eye" data-fin-privacy aria-pressed="${fin.private}" aria-label="${fin.private?'Tampilkan nominal':'Sembunyikan nominal'}">${icons[fin.private?'eyeOff':'eye']}</button></div><h2>${money(d.balance)}</h2>
    <div class="fb-stats"><div><i>${icons.arrowUp}</i><span>Pemasukan</span><b>${money(d.income)}</b></div><div><i>${icons.arrowDown}</i><span>Pengeluaran</span><b>${money(d.expense)}</b></div><div><i>${icons.handHeart}</i><span>Sedekah</span><b>${money(d.charity)}</b></div></div></section>
  <section class="card fin-card"><div class="card-head"><h2>Target pengeluaran</h2><strong class="fin-pct ${cls}">${target>0?percent+'%':'-'}</strong></div><div class="bar ${cls}"><i style="width:${Math.min(percent,100)}%"></i></div>${target>0?`<div class="bar-meta">${money(d.expense)}<span>target ${money(target)}</span></div>`:`<div class="bar-meta"><span>Isi target per kategori di tab Laporan</span><button type="button" class="link-btn" data-fin-goto="laporan:target">Atur target</button></div>`}</section>
  <section class="card fin-card"><div class="card-head"><h2>Saran keuangan</h2><i class="chip sm tone-${adv.mood[1]}">${icons[adv.mood[0]]}</i></div><div class="advice">${adv.items.map(i=>i.cat?`<button type="button" class="advice-item ${i.cls}" data-fin-advice="${esc(i.cat)}"><span class="advice-dot"></span><span>${esc(i.text)}</span>${icons.next}</button>`:`<div class="advice-item ${i.cls}"><span class="advice-dot"></span><span>${esc(i.text)}</span></div>`).join('')}</div></section>
  <section class="card fin-card"><div class="card-head"><h2>Pengeluaran</h2></div>${entries.length?`<div class="fin-donut-row">${donutBox(entries,total,null,compact(total),'total')}<div class="mini-list">${entries.slice(0,3).map(([cat,amount])=>`<div class="mini-row" style="--c:${COLORS[cat]||'#868e96'}"><span class="dot"></span><span>${esc(cat)}</span><b>${Math.round(amount/total*100)}%</b></div>`).join('')}</div></div>`:'<div class="empty-inline">Belum ada pengeluaran pada periode ini.</div>'}</section>
  <section><div class="section-head"><h2>Transaksi terbaru</h2><button type="button" class="link-btn" data-fin-goto="riwayat">Lihat semua</button></div>${latest.length?`<div class="card flush">${latest.map(t=>txRow(t,{date:true})).join('')}</div>`:emptyState('money','Belum ada transaksi','Ketuk Tambah untuk mencatat pemasukan atau pengeluaran.')}</section>`;
}

/* ---- Tab Laporan ---- */
function reportTab(){
  const sub=`<div class="seg-tabs sm"><button type="button" class="${fin.rtab==='analisis'?'active':''}" data-fin-rtab="analisis">Analisis</button><button type="button" class="${fin.rtab==='target'?'active':''}" data-fin-rtab="target">Target</button></div>`;
  return sub+(fin.rtab==='target'?targetPane():analysisPane());
}
function analysisPane(){
  const d=totals(),groups=expenseByCat(),entries=Object.entries(groups).sort((a,b)=>b[1]-a[1]),total=entries.reduce((s,[,v])=>s+v,0);
  if(fin.drill&&!groups[fin.drill])fin.drill=null;
  const centerBig=fin.drill?`${Math.round(groups[fin.drill]/total*100)}%`:entries.length?`${savingRate(d)}%`:'0%',centerLabel=fin.drill?fin.drill:entries.length?'tabungan':'Belum ada data';
  let drill='';
  if(fin.drill){
    const rows=inMonth().filter(t=>t.type==='expense'&&t.category===fin.drill).sort((a,b)=>b.date.localeCompare(a.date)),sum=rows.reduce((s,t)=>s+t.amount,0);
    drill=`<section class="card fin-card"><div class="card-head"><h2>${catTile(fin.drill,true)} ${esc(fin.drill)}</h2><button type="button" class="link-btn" data-fin-drill-back>Tutup</button></div><div class="drill-stats"><div><small>Total</small><b>${money(sum)}</b></div><div><small>Transaksi</small><b>${rows.length}</b></div><div><small>Rata-rata</small><b>${money(rows.length?sum/rows.length:0)}</b></div></div><div class="flush-list">${rows.map(t=>txRow(t,{date:true})).join('')}</div></section>`;
  }
  return `<div class="fin-stats3"><div class="card stat"><small>Pemasukan Suami</small><b>${money(personIncome('Suami'))}</b></div><div class="card stat"><small>Pemasukan Istri</small><b>${money(personIncome('Istri'))}</b></div><div class="card stat"><small>Terbesar</small><b>${entries.length?esc(entries[0][0]):'-'}</b></div></div>
  <section class="card fin-card"><div class="card-head"><h2>Per kategori</h2><strong>${money(total)}</strong></div>${entries.length?`<div class="donut-big">${donutBox(entries,total,fin.drill,centerBig,esc(centerLabel))}</div><div class="cat-list">${entries.map(([cat,amount])=>{const pct=Math.round(amount/total*100);return `<button type="button" class="cat-row${fin.drill===cat?' active':''}" data-fin-cat="${esc(cat)}" style="--c:${COLORS[cat]||'#868e96'}">${catTile(cat,true)}<span class="cr-main"><b>${esc(cat)}</b><span class="bar thin"><i style="width:${pct}%"></i></span></span><span class="cr-val">${money(amount)}<small>${pct}%</small></span></button>`}).join('')}</div>`:'<div class="empty-inline">Belum ada pengeluaran yang tercatat.</div>'}</section>${drill}`;
}
function targetPane(){
  const groups=expenseByCat(),bud=activeBudgets(),cats=[...EXPENSE].sort((a,b)=>{const oa=bud[a]>0&&(groups[a]||0)>bud[a]?1:0,ob=bud[b]>0&&(groups[b]||0)>bud[b]?1:0;return oa!==ob?ob-oa:(groups[b]||0)-(groups[a]||0)});
  const target=totalBudget(),spent=Object.values(groups).reduce((s,v)=>s+v,0),canCopy=fin.month&&target===0&&Object.keys(fin.budgets[prevMonth(fin.month)]||{}).length;
  return `<section class="card fin-card"><div class="card-head"><h2>Target per kategori</h2></div><p class="fin-hint">${!fin.month?'Pilih satu bulan untuk mengatur target.':target>0?`${money(spent)} dari target ${money(target)}`:'Isi target tiap kategori untuk mulai memantau.'}</p>${canCopy?'<button type="button" class="pill-btn soft fin-copy" data-fin-copy-budget>Salin target bulan lalu</button>':''}<div class="bud-list">${cats.map(cat=>{
    const sp=groups[cat]||0,b=bud[cat]||0,ratio=b>0?sp/b:0,width=b>0?Math.min(ratio*100,100):(sp>0?100:0);
    const [badge,cls]=!b?['Tanpa target','none']:ratio>1?[`Over ${Math.round((ratio-1)*100)}%`,'over']:ratio>=.8?[`${Math.round(ratio*100)}%`,'warn']:[`${Math.round(ratio*100)}%`,'ok'];
    return `<div class="bud-row">${catTile(cat)}<b class="bud-name">${esc(cat)}</b><input class="bud-input" type="number" min="0" step="50000" inputmode="numeric" placeholder="Target" value="${b||''}" data-fin-budget="${esc(cat)}" aria-label="Target ${esc(cat)}"${fin.month?'':' disabled'}><div class="bud-bar"><div class="bar thin ${cls}"><i style="width:${width}%"></i></div><div class="bud-meta">${money(sp)}<span class="badge ${cls}">${badge}</span></div></div></div>`;
  }).join('')}</div></section>`;
}

/* ---- Tab Riwayat ---- */
function historyTab(){
  const base=inMonth().filter(t=>fin.filter==='all'||t.type===fin.filter),sums={};base.forEach(t=>{sums[t.category]=(sums[t.category]||0)+t.amount});
  const cats=Object.entries(sums).sort((a,b)=>b[1]-a[1]).map(([c])=>c);if(fin.catFilter&&!cats.includes(fin.catFilter))fin.catFilter=null;
  let rows=[...base].sort((a,b)=>b.date.localeCompare(a.date));if(fin.catFilter)rows=rows.filter(t=>t.category===fin.catFilter);
  const days=[];rows.forEach(t=>{let d=days[days.length-1];if(!d||d.date!==t.date){d={date:t.date,items:[]};days.push(d)}d.items.push(t)});
  const chips=(k,l)=>`<button type="button" class="${fin.filter===k?'active':''}" data-fin-filter="${k}">${l}</button>`;
  return `<div class="chips fin-chips">${chips('all','Semua')}${chips('income','Pemasukan')}${chips('expense','Pengeluaran')}</div>
  ${cats.length?`<div class="chips fin-chips cat">${`<button type="button" class="${fin.catFilter?'':'active'}" data-fin-catfilter="all">Semua</button>`}${cats.map(c=>`<button type="button" class="${fin.catFilter===c?'active':''}" data-fin-catfilter="${esc(c)}" style="--c:${COLORS[c]||'#868e96'}"><span class="dot"></span>${esc(c)}</button>`).join('')}</div>`:''}
  <div class="section-label"><span>${rows.length} transaksi</span><button type="button" class="link-btn" data-fin-export>${icons.download} Ekspor CSV</button></div>
  ${days.length?days.map(d=>`<h3 class="day-head">${esc(dayLabel(d.date))}</h3><div class="card flush">${d.items.map(t=>txRow(t,{del:true})).join('')}</div>`).join(''):emptyState('history','Belum ada transaksi','Tidak ada transaksi untuk filter ini.')}`;
}

/* ---- Halaman ---- */
moneyPage=function(){
  const tabs=[['ringkasan','Ringkasan'],['laporan','Laporan'],['riwayat','Riwayat']];
  const monthBar=`<div class="fin-month"><button type="button" class="icon-btn soft" data-fin-month="-1" ${fin.month?'':'disabled'} aria-label="Bulan sebelumnya">${icons.back}</button><b>${fin.month?monthLabel(fin.month):'Semua bulan'}</b><button type="button" class="icon-btn soft" data-fin-month="1" ${fin.month?'':'disabled'} aria-label="Bulan berikutnya">${icons.next}</button><button type="button" class="chips-btn ${fin.month?'':'active'}" data-fin-all>Semua</button></div>`;
  let body;
  if(!fin.loaded)body=`<div class="pair"><div class="mini skeleton"></div><div class="mini skeleton"></div></div>`;
  else if(fin.error==='setup')body=`<div class="card wx-note"><i class="chip tone-amber">${icons.alert}</i><span class="row-main"><b>Tabel keuangan belum dibuat</b><small>Jalankan file supabase-finance.sql di SQL Editor Supabase, lalu muat ulang aplikasi.</small>${fin.detail?`<small class="err-detail">${esc(fin.detail)}</small>`:''}</span><button type="button" class="pill-btn soft" data-fin-retry>Coba lagi</button></div>`;
  else if(fin.error==='perm')body=`<div class="card wx-note"><i class="chip tone-amber">${icons.alert}</i><span class="row-main"><b>Izin keuangan belum aktif</b><small>Jalankan ulang supabase-finance.sql (bagian izin dan kebijakan), lalu muat ulang aplikasi.</small>${fin.detail?`<small class="err-detail">${esc(fin.detail)}</small>`:''}</span><button type="button" class="pill-btn soft" data-fin-retry>Coba lagi</button></div>`;
  else if(fin.error)body=`<div class="card wx-note"><i class="chip tone-rose">${icons.alert}</i><span class="row-main"><b>Data belum bisa dimuat</b><small class="err-detail">${esc(fin.error)}</small></span><button type="button" class="pill-btn soft" data-fin-retry>Coba lagi</button></div>`;
  else body=fin.tab==='laporan'?reportTab():fin.tab==='riwayat'?historyTab():summaryTab();
  return shell(`${hdr('money','',addBtn('data-fin-add','Tambah'))}<main class="content page-content fin-page${fin.private?' is-private':''}">${monthBar}<div class="seg-tabs">${tabs.map(([k,l])=>`<button type="button" class="${fin.tab===k?'active':''}" data-fin-tab="${k}">${l}</button>`).join('')}</div>${body}</main>`);
};

/* ---- Tambah transaksi ---- */
function openAddModal(type='expense',edit=null){
  $('#recordModal')?.remove();
  if(edit)type=edit.type;
  const modal=document.createElement('div');modal.id='recordModal';modal.className='record-modal';
  const catGrid=(t,selected)=>{const list=t==='income'?INCOME:EXPENSE,pick=list.includes(selected)?selected:list[0];return list.map(c=>`<label class="cat-opt" style="--c:${COLORS[c]||'#5b4ef5'}"><input type="radio" name="category" value="${esc(c)}"${c===pick?' checked':''}>${catTile(c)}<em>${esc(c)}</em></label>`).join('')};
  modal.innerHTML=`<form class="record-card fin-form"><header><b>${edit?'Ubah Transaksi':'Tambah Transaksi'}</b><button type="button" data-close-modal>×</button></header>
    <div class="seg"><button type="button" class="${type==='income'?'active':''}" data-fin-type="income">Pemasukan</button><button type="button" class="${type==='expense'?'active':''}" data-fin-type="expense">Pengeluaran</button></div>
    <input name="amount" type="number" required min="1" step="1" inputmode="numeric" placeholder="Nominal (Rp)" value="${edit?Math.round(edit.amount):''}"><input name="title" required maxlength="120" placeholder="Nama transaksi" value="${edit?esc(edit.title):''}">
    <div class="cat-grid" id="finCatGrid">${catGrid(type,edit?.category)}</div>
    <div class="seg3">${PERSONS.map(p=>`<label><input type="radio" name="person" value="${p}"${p===(edit?edit.person:PERSONS[0])?' checked':''}><span>${p}</span></label>`).join('')}</div>
    <label class="calendar-field">Tanggal<input type="date" name="date" required value="${edit?edit.date:localISO()}"></label><input name="note" maxlength="200" placeholder="Catatan (opsional)" value="${edit?esc(edit.note||''):''}"><button class="primary">${edit?'Simpan Perubahan':'Simpan'}</button></form>`;
  document.body.append(modal);
  const form=$('form',modal),idleLabel=edit?'Simpan Perubahan':'Simpan';let current=type;
  form.addEventListener('click',e=>{const bt=e.target.closest('[data-fin-type]');if(!bt||bt.dataset.finType===current)return;current=bt.dataset.finType;$$('[data-fin-type]',form).forEach(x=>x.classList.toggle('active',x===bt));$('#finCatGrid',form).innerHTML=catGrid(current,edit?.category)});
  form.onsubmit=async e=>{
    e.preventDefault();const d=new FormData(form),btn=$('.primary',form);btn.disabled=true;btn.textContent='Menyimpan…';
    const fields={type:current,title:String(d.get('title')).trim(),amount:Number(d.get('amount')),person:d.get('person'),category:d.get('category'),date:d.get('date'),note:String(d.get('note')).trim()};
    try{
      if(edit){
        await sb(`/rest/v1/family_transactions?id=eq.${encodeURIComponent(edit.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(fields)});
        const row=fin.tx.find(t=>t.id===edit.id);if(row)Object.assign(row,fields);
      }else{
        const saved=await sb('/rest/v1/family_transactions',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({...fields,family_id:state.family.id,created_by:session.user.id})});
        if(saved?.[0])fin.tx.unshift({...saved[0],amount:Number(saved[0].amount)});
      }
      if(fields.date.slice(0,7)!==fin.month&&fin.month)fin.month=fields.date.slice(0,7);
      modal.remove();render();toast(edit?'Perubahan tersimpan':'Transaksi tersimpan');
    }catch(error){btn.disabled=false;btn.textContent=idleLabel;toast(kindOfError(error.message)==='setup'?'Tabel keuangan belum dibuat. Jalankan supabase-finance.sql.':/permission|policy|row-level/i.test(error.message)?'Izin ubah belum aktif. Jalankan ulang supabase-finance.sql.':error.message)}
  };
}
window.finOpenAdd=()=>openAddModal();

/* ---- Aksi ---- */
async function saveBudget(cat,value){
  if(!fin.month)return;const fid=state.family.id,month=fin.month,current=fin.budgets[month]||(fin.budgets[month]={}),before=current[cat];
  if(value>0)current[cat]=value;else delete current[cat];
  if(!Object.keys(current).length)delete fin.budgets[month];
  render();
  try{
    if(value>0)await sb('/rest/v1/family_budgets?on_conflict=family_id,month,category',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({family_id:fid,month,category:cat,amount:value,updated_by:session.user.id,updated_at:new Date().toISOString()})});
    else await sb(`/rest/v1/family_budgets?family_id=eq.${fid}&month=eq.${month}&category=eq.${encodeURIComponent(cat)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
  }catch(error){
    (fin.budgets[month]||(fin.budgets[month]={}));if(before)fin.budgets[month][cat]=before;else delete fin.budgets[month][cat];render();toast(error.message);
  }
}
async function copyBudget(){
  const src=fin.budgets[prevMonth(fin.month)];if(!src)return;
  const rows=Object.entries(src).map(([category,amount])=>({family_id:state.family.id,month:fin.month,category,amount,updated_by:session.user.id}));
  try{
    await sb('/rest/v1/family_budgets?on_conflict=family_id,month,category',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});
    fin.budgets[fin.month]={...src};render();toast('Target tersalin');
  }catch(error){toast(error.message)}
}
async function deleteTx(id){
  try{
    await sb(`/rest/v1/family_transactions?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    fin.tx=fin.tx.filter(t=>t.id!==id);fin.armed=null;render();toast('Transaksi dihapus');
  }catch(error){fin.armed=null;render();toast(/permission|policy|row-level/i.test(error.message)?'Izin hapus belum aktif. Jalankan supabase-finance.sql.':error.message)}
}
function exportCsv(){
  const header=['tanggal','jenis','nama','nominal','dicatat_oleh','kategori','catatan'],rows=fin.tx.map(t=>[t.date,t.type,t.title,t.amount,t.person,t.category,t.note]);
  const csv=[header,...rows].map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
  a.href=url;a.download='keuangan-keluarga.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
async function importOld(){
  if(fin.importing||!state.family)return;
  if(!await confirmSheet({title:'Pindahkan data RuangKas?',message:'Semua transaksi dari RuangKas lama akan disalin ke keluarga ini. Data lama tidak diubah atau dihapus, dan mengulang tidak akan menggandakan data.',confirm:'Pindahkan'}))return;
  fin.importing=true;render();
  try{
    const res=await fetch(`${OLD_URL}/rest/v1/transactions?select=*&order=date.asc,created_at.asc&limit=10000`,{headers:{apikey:OLD_KEY,Authorization:`Bearer ${OLD_KEY}`}});
    if(!res.ok)throw new Error('RuangKas lama tidak bisa dibaca');
    const old=await res.json();if(!Array.isArray(old))throw new Error('Format data RuangKas tidak dikenali');
    const rows=old.filter(r=>r.id&&(r.type==='income'||r.type==='expense')&&r.date&&Number(r.amount)>=0).map(r=>({legacy_id:r.id,family_id:state.family.id,type:r.type,title:String(r.title||'Tanpa nama'),amount:Number(r.amount),person:PERSONS.includes(r.person)?r.person:'Bersama',category:String(r.category||'Lainnya'),date:r.date,note:String(r.note||''),created_at:r.created_at||new Date().toISOString(),created_by:session.user.id}));
    for(let i=0;i<rows.length;i+=100)await sb('/rest/v1/family_transactions?on_conflict=family_id,legacy_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(rows.slice(i,i+100))});
    fin.importing=false;fin.loaded=false;await finLoad(true);
    toast(`${rows.length} transaksi dipindahkan`);
  }catch(error){fin.importing=false;render();toast(kindOfError(error.message)==='setup'?'Tabel keuangan belum dibuat. Jalankan supabase-finance.sql.':error.message)}
}

/* ---- Event ---- */
document.addEventListener('click',event=>{
  const t=event.target,hit=sel=>t.closest(sel);let el;
  if(hit('[data-fin-add]')){event.preventDefault();openAddModal();return}
  if(el=hit('[data-fin-edit]')){const tx=fin.tx.find(x=>x.id===el.dataset.finEdit);if(tx)openAddModal(null,tx);return}
  if(el=hit('[data-fin-tab]')){fin.tab=el.dataset.finTab;fin.drill=null;render();return}
  if(el=hit('[data-fin-goto]')){const [tab,sub]=el.dataset.finGoto.split(':');fin.tab=tab;if(sub)fin.rtab=sub;render();return}
  if(el=hit('[data-fin-rtab]')){fin.rtab=el.dataset.finRtab;render();return}
  if(el=hit('[data-fin-month]')){if(fin.month){fin.month=shiftMonth(fin.month,Number(el.dataset.finMonth));fin.drill=null;render()}return}
  if(hit('[data-fin-all]')){fin.month=fin.month?null:nowMonth();fin.drill=null;render();return}
  if(el=hit('[data-fin-filter]')){fin.filter=el.dataset.finFilter;render();return}
  if(el=hit('[data-fin-catfilter]')){fin.catFilter=el.dataset.finCatfilter==='all'?null:el.dataset.finCatfilter;render();return}
  if(el=hit('[data-fin-cat]')){fin.drill=fin.drill===el.dataset.finCat?null:el.dataset.finCat;fin.tab='laporan';fin.rtab='analisis';render();return}
  if(el=hit('[data-fin-advice]')){fin.drill=el.dataset.finAdvice;fin.tab='laporan';fin.rtab='analisis';render();return}
  if(hit('[data-fin-drill-back]')){fin.drill=null;render();return}
  if(hit('[data-fin-privacy]')){fin.private=!fin.private;writeFlag('portalFinPrivacy',fin.private?'1':'0');render();return}
  if(el=hit('[data-fin-del]')){
    const id=el.dataset.finDel;
    if(fin.armed===id){deleteTx(id)}else{fin.armed=id;render();setTimeout(()=>{if(fin.armed===id){fin.armed=null;if(state.page==='money')render()}},3000)}
    return;
  }
  if(hit('[data-fin-export]')){exportCsv();return}
  if(hit('[data-fin-copy-budget]')){copyBudget();return}
  if(hit('[data-fin-import-hide]')){writeFlag(importKey(),'1');render();return}
  if(hit('[data-fin-import]')){importOld();return}
  if(hit('[data-fin-retry]')){fin.loaded=false;fin.error='';render();return}
});
document.addEventListener('change',event=>{
  const input=event.target.closest('[data-fin-budget]');if(!input)return;
  saveBudget(input.dataset.finBudget,Math.max(0,Math.round(Number(input.value||0))));
});

/* ---- Kartu ringkas di beranda ---- */
window.finHomeCard=function(variant){
  const hero=variant==='hero';
  if(!state.family||fin.error)return '';
  if(!fin.loaded)return hero?'<div class="fin-hero skeleton-glass"></div>':'<section class="section"><div class="card fin-mini skeleton-strip"></div></section>';
  const ym=nowMonth(),d=fin.tx.filter(t=>t.date&&t.date.startsWith(ym)),income=d.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),expense=d.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const eye=`<button type="button" class="fm-eye" data-fin-privacy aria-pressed="${fin.private}" aria-label="${fin.private?'Tampilkan nominal':'Sembunyikan nominal'}">${icons[fin.private?'eyeOff':'eye']}</button>`;
  const body=`<button type="button" class="fm-body" data-page="money"><b class="fm-bal">${money(income-expense)}</b><span class="fm-row"><span class="up">${icons.arrowUp}<em>Pemasukan</em>${money(income)}</span><span class="down">${icons.arrowDown}<em>Pengeluaran</em>${money(expense)}</span></span></button>`;
  if(hero)return `<div class="fin-hero${fin.private?' is-private':''}"><div class="fm-top"><span>Saldo ${monthLabel(ym)}</span>${eye}</div>${body}</div>`;
  return `<section class="section"><div class="section-head"><h2>Keuangan</h2><button type="button" class="link-btn" data-page="money">Buka</button></div><div class="card fin-mini${fin.private?' is-private':''}"><div class="fm-top"><span>Saldo ${monthLabel(ym)}</span>${eye}</div>${body}</div></section>`;
};

/* ---- Pemuatan data ---- */
let finChannel=null,finChannelFamily=null,finTimer;
function subscribeFin(){
  if(!window.supabaseClient||!state.family||finChannelFamily===state.family.id)return;
  if(finChannel)window.supabaseClient.removeChannel(finChannel);
  const id=state.family.id;finChannelFamily=id;
  const channel=window.supabaseClient.channel(`finance-${id}`);
  ['family_transactions','family_budgets'].forEach(table=>channel.on('postgres_changes',{event:'*',schema:'public',table,filter:`family_id=eq.${id}`},()=>{clearTimeout(finTimer);finTimer=setTimeout(()=>{if(fin.loaded&&!fin.error)finLoad(true)},250)}));
  channel.subscribe();finChannel=channel;
}
const renderBeforeFinance=render;
render=function(){
  renderBeforeFinance();
  if(!state.logged||!state.family)return;
  if(fin.familyId!==state.family.id)resetFin();
  if((state.page==='money'||(!state.page&&state.tab==='home'))&&!fin.loaded&&!fin.loading)finLoad(true);
  subscribeFin();
};
setInterval(()=>{if(state.page==='money'&&fin.loaded&&!fin.error&&!document.hidden&&!$('#recordModal')&&!document.activeElement?.matches?.('input,textarea,select'))finLoad(true)},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.page==='money'&&fin.loaded)finLoad(true)});
const clearFamilyCacheBeforeFinance=clearFamilyCache;
clearFamilyCache=function(){clearFamilyCacheBeforeFinance();if(finChannel&&window.supabaseClient)window.supabaseClient.removeChannel(finChannel);finChannel=null;finChannelFamily=null;resetFin();fin.familyId=null};

render();
})();
