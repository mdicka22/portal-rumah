/* Cuaca & kualitas udara (Open-Meteo, tanpa kunci API).
   Dimuat setelah ui.js. Lokasi diambil dari izin lokasi perangkat (dibulatkan ±1 km)
   dan disimpan hanya di perangkat ini; dihapus saat keluar akun atau ganti keluarga. */

Object.assign(icons,{
  sun:svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
  moon:svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>'),
  cloud:svg('<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>'),
  cloudSun:svg('<path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.95 12.65a4 4 0 0 0-5.93-4.13"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z"/>'),
  cloudRain:svg('<path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/><path d="M16 14v6M8 14v6M12 16v6"/>'),
  cloudLightning:svg('<path d="M6 16.33A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.97"/><path d="m13 12-3 5h4l-3 5"/>'),
  cloudFog:svg('<path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/><path d="M16 17H7M17 21H9"/>'),
  wind:svg('<path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2"/>'),
  refresh:svg('<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>')
});

const WX_KEY='portalWeather',WX_TTL=30*60*1000;
const wx={status:'idle',data:null,loc:null,checked:false};
try{const saved=JSON.parse(localStorage.getItem(WX_KEY)||'null');if(saved?.lat!=null){wx.data=saved;wx.loc={lat:saved.lat,lng:saved.lng}}}catch{}

const weatherLook=(code,day)=>code===0?(day?['Cerah','sun','amber']:['Cerah','moon','indigo']):code<=2?['Cerah berawan',day?'cloudSun':'cloud',day?'amber':'indigo']:code===3?['Berawan','cloud','sky']:code<=48?['Berkabut','cloudFog','indigo']:code<=57?['Gerimis','cloudRain','sky']:code<=67||(code>=80&&code<=82)?['Hujan','cloudRain','sky']:code>=95?['Badai petir','cloudLightning','violet']:['Berawan','cloud','sky'];
/* Skala US AQI dari Open-Meteo */
const aqiLook=v=>v<=50?['Baik','green','Aman untuk beraktivitas di luar ruangan.']:v<=100?['Sedang','amber','Orang yang sensitif sebaiknya kurangi aktivitas berat di luar.']:v<=150?['Kurang sehat','orange','Anak, lansia, dan penderita asma sebaiknya di dalam ruangan.']:v<=200?['Tidak sehat','rose','Pakai masker saat berada di luar ruangan.']:v<=300?['Sangat tidak sehat','violet','Hindari aktivitas di luar ruangan.']:['Berbahaya','rose','Tetap di dalam ruangan.'];

function weatherRerender(){if(state.logged&&!state.page&&state.tab==='home'&&!document.querySelector('#recordModal'))render()}
function weatherSave(){try{localStorage.setItem(WX_KEY,JSON.stringify(wx.data))}catch{}}
const weatherJson=url=>fetch(url).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.json()});

async function weatherLoad(){
  const loc=wx.loc;if(!loc)return;
  wx.status='loading';if(!wx.data)weatherRerender();
  const q=`latitude=${loc.lat}&longitude=${loc.lng}`,keepPlace=wx.data&&wx.data.lat===loc.lat&&wx.data.lng===loc.lng?wx.data.place:'';
  const [w,a,g]=await Promise.allSettled([
    weatherJson(`https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=precipitation_probability_max&timezone=auto&forecast_days=1`),
    weatherJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}&current=us_aqi,pm2_5&timezone=auto`),
    keepPlace?Promise.resolve(null):weatherJson(`https://api.bigdatacloud.net/data/reverse-geocode-client?${q}&localityLanguage=id`)
  ]);
  if(w.status==='rejected'&&a.status==='rejected'){wx.status='error';weatherRerender();return}
  const cw=w.value?.current,ca=a.value?.current,gv=g.value;
  wx.data={lat:loc.lat,lng:loc.lng,t:Date.now(),place:keepPlace||gv?.city||gv?.locality||gv?.principalSubdivision||'',
    w:cw?{temp:Math.round(cw.temperature_2m),feels:Math.round(cw.apparent_temperature),code:cw.weather_code,day:cw.is_day!==0,rain:w.value.daily?.precipitation_probability_max?.[0]??null}:null,
    a:ca&&ca.us_aqi!=null?{aqi:Math.round(ca.us_aqi),pm25:ca.pm2_5!=null?Math.round(ca.pm2_5):null}:null};
  wx.status='ready';weatherSave();weatherRerender();
}

function weatherLocate(){
  if(!navigator.geolocation){wx.status='error';weatherRerender();return}
  wx.status='loading';if(!wx.data)weatherRerender();
  navigator.geolocation.getCurrentPosition(
    pos=>{wx.loc={lat:Number(pos.coords.latitude.toFixed(2)),lng:Number(pos.coords.longitude.toFixed(2))};weatherLoad()},
    err=>{if(wx.loc){weatherLoad();return}wx.status=err.code===1?'denied':'error';weatherRerender()},
    {timeout:12000,maximumAge:600000});
}

/* Dipanggil setelah beranda tampil: ambil data bila belum ada atau sudah lewat 30 menit */
function weatherEnsure(){
  if(wx.status==='loading'||wx.status==='error'||wx.status==='denied')return;
  if(wx.loc){if(!wx.data||Date.now()-wx.data.t>WX_TTL)weatherLoad();return}
  if(wx.checked)return;
  wx.checked=true;
  navigator.permissions?.query({name:'geolocation'}).then(p=>{if(p.state==='granted')weatherLocate()}).catch(()=>{});
}

/* Strip cuaca & udara satu baris di beranda */
function weatherSection(){
  const d=wx.data,
    note=(icon,title,text,action)=>`<section class="wx-wrap"><div class="card wx-note"><i class="chip tone-sky">${icons[icon]}</i><span class="row-main"><b>${title}</b><small>${text}</small></span>${action}</div></section>`,
    retry=label=>`<button type="button" class="pill-btn soft" data-weather-refresh>${label}</button>`;
  if(d&&(d.w||d.a)){
    const wl=d.w?weatherLook(d.w.code,d.w.day):null,al=d.a?aqiLook(d.a.aqi):null,
      time=new Date(d.t).toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit'}),
      tip=[al?al[2]:'',d.w&&d.w.rain>=60?'Kemungkinan hujan tinggi, siapkan payung.':''].filter(Boolean).join(' ');
    return `<section class="wx-wrap"><div class="card wx-strip">
      ${d.w?`<div class="wx-cell tone-${wl[2]}"><i>${icons[wl[1]]}</i><span><b class="wx-big">${d.w.temp}°</b><small>${wl[0]}${d.w.rain!=null?` · hujan ${d.w.rain}%`:''}</small></span></div>`:''}
      ${d.a?`<div class="wx-cell tone-${al[1]}"><i>${icons.wind}</i><span><b class="wx-big">${d.a.aqi}<em>AQI</em></b><small class="wx-level">${al[0]}</small></span></div>`:''}
      <button type="button" class="icon-btn ghost wx-refresh" data-weather-refresh aria-label="Perbarui cuaca">${icons.refresh}</button>
      <p class="wx-foot">${tip?`${tip}<br>`:''}<span>${d.place?safeText(d.place)+' · ':''}diperbarui ${time}</span></p></div></section>`;
  }
  if(wx.status==='loading')return `<section class="wx-wrap"><div class="card wx-strip skeleton-strip"></div></section>`;
  if(wx.status==='denied')return note('map','Izin lokasi ditolak','Aktifkan izin lokasi di pengaturan browser, lalu coba lagi.',retry('Coba lagi'));
  if(wx.status==='error')return note('alert','Data belum bisa dimuat','Periksa koneksi internet lalu coba lagi.',retry('Coba lagi'));
  return note('cloudSun','Cuaca hari ini','Izinkan lokasi untuk melihat cuaca dan udara.',retry('Izinkan'));
}

document.addEventListener('click',event=>{if(event.target.closest('[data-weather-refresh]')){event.preventDefault();weatherLocate()}},true);

const renderBeforeWeather=render;
render=function(){renderBeforeWeather();if(state.logged&&!state.page&&state.tab==='home')weatherEnsure()};

const clearFamilyCacheBeforeWeather=clearFamilyCache;
clearFamilyCache=function(){clearFamilyCacheBeforeWeather();try{localStorage.removeItem(WX_KEY)}catch{}wx.data=null;wx.loc=null;wx.status='idle';wx.checked=false};

render();
