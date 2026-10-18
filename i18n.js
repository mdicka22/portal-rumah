/* Bahasa Inggris untuk seluruh aplikasi.
   Bahasa dipilih di Profil (state.lang = 'id' | 'en'). Saat 'en', teks tampilan Indonesia
   diterjemahkan di layar: teks halaman, placeholder, label aksesibilitas, jendela, toast,
   dan dialog prompt/confirm. Data yang disimpan di database tidak berubah (kategori,
   nama Suami/Istri, dll. tetap Indonesia di database). Dimuat paling akhir. */
(()=>{
const isEn=()=>state?.lang==='en';

/* ---- Kamus kalimat tetap ---- */
const D={
  /* navigasi & umum */
  'Beranda':'Home','Kalender':'Calendar','Riwayat':'History','Profil':'Profile','Tambah agenda':'Add event','Kembali':'Back','Tutup':'Close','Simpan':'Save','Tambah':'Add','Hapus':'Delete','Hapus?':'Delete?','Semua':'All','Selesai':'Done','Coba lagi':'Try again','Lihat semua':'See all','Sembunyikan':'Hide','Perbarui':'Refresh','Unggah':'Upload','Bagikan':'Share','Download':'Download','Kirim':'Send','Tugas':'Task','Tanggal':'Date','Waktu':'Time','Catatan':'Notes','Total':'Total','Transaksi':'Transactions','Rata-rata':'Average','Terbesar':'Largest','Target':'Target','Lainnya':'Other','Menu':'Menu','Notifikasi':'Notifications','Keluar':'Sign out','Undang':'Invite','Izinkan':'Allow','Pindahkan':'Move','Menyinkronkan':'Syncing','Menyiapkan rumahmu':'Getting your home ready',
  'PORTAL RUMAH':'PORTAL RUMAH','Hari ini':'Today','Kemarin':'Yesterday','Mendatang':'Upcoming','Rutinitas':'Routine','Setiap hari':'Every day','terlewat':'overdue','Tampilkan semua':'Show all',
  /* login */
  'Untuk keluarga yang lebih baik':'For a better family','Untuk Keluarga yang Lebih Baik':'For a Better Family','Buat Akun':'Create Account','Gunakan email aktif untuk keluarga kamu':'Use an active email for your family','Email aktif':'Active email','Kata sandi, minimal 6 karakter':'Password, at least 6 characters','Kata Sandi, minimal 6 karakter':'Password, at least 6 characters','Ulangi kata sandi':'Repeat password','Tampilkan kata sandi':'Show password','Ingat saya':'Remember me','Lupa kata sandi?':'Forgot password?','Masuk':'Sign in','Daftar':'Sign up','Daftar dan Kirim Konfirmasi':'Sign up and send confirmation','Belum punya akun?':"Don't have an account?",'Sudah punya akun?':'Already have an account?','Kami akan mengirim tautan konfirmasi ke emailmu.':'We will send a confirmation link to your email.','Setelah daftar, cek inbox atau folder Spam untuk mengonfirmasi email.':'After signing up, check your inbox or Spam folder to confirm your email.','Keluarga bahagia di ruang keluarga':'Happy family in the living room',
  'Hubungkan Keluarga':'Connect Your Family','Buat ruang keluarga baru, atau masukkan kode undangan dari pasangan.':'Create a new family space, or enter the invite code from your partner.','Nama kamu, contoh: Ayah':'Your name, e.g. Dad','Nama keluarga, contoh: Keluarga Andrian':'Family name, e.g. The Andrian Family','Buat Keluarga Baru':'Create New Family','atau gabung dengan kode':'or join with a code','Kode undangan 8 karakter':'8-character invite code','Gabung dengan Kode':'Join with Code','Keluar / ganti akun':'Sign out / switch account',
  /* beranda */
  'Selamat Pagi,':'Good morning,','Selamat Siang,':'Good afternoon,','Selamat Sore,':'Good evening,','Selamat Malam,':'Good evening,','Keluarga Saya':'My Family','Progres hari ini':"Today's progress",'Belum ada aktivitas hari ini':'No activities today','Agenda Keluarga':'Family Agenda','Lihat kalender':'View calendar','Belum ada aktivitas untuk filter ini.':'No activities for this filter.','Rumah & Kendaraan':'Home & Vehicles','Kendaraan':'Vehicle','Rumah':'Home','Belum diisi':'Not filled in yet','Semua beres':'All clear','Notifikasi Push':'Push Notifications',
  'Darurat':'Emergency','Keuangan':'Finance','Kesehatan & Anak':'Health & Kids','Belanja':'Shopping','Arsip':'Archive','Tagihan':'Bills','Tugas Pasangan':'Partner Tasks','Peta Keluarga':'Family Map','Chat Keluarga':'Family Chat',
  /* judul halaman */
  'Kalender Keluarga':'Family Calendar','Daftar Belanja':'Shopping List','Arsip Keluarga':'Family Archive','Tagihan Rumah':'Home Bills','Kendaraan Keluarga':'Family Vehicles','Kondisi Rumah':'Home Condition','Kontak Darurat':'Emergency Contacts','Riwayat Aktivitas':'Activity History','Keuangan Rumah':'Home Finance',
  /* cuaca */
  'Cuaca & Udara':'Weather & Air','Cuaca hari ini':"Today's weather",'Izinkan lokasi untuk melihat cuaca dan kualitas udara di sekitarmu.':'Allow location to see the weather and air quality around you.','Memuat…':'Loading…','Izin lokasi ditolak':'Location permission denied','Aktifkan izin lokasi di pengaturan browser, lalu coba lagi.':'Enable location permission in your browser settings, then try again.','Data belum bisa dimuat':"Data couldn't be loaded",'Periksa koneksi internet lalu coba lagi.':'Check your internet connection and try again.','Perbarui cuaca':'Refresh weather','Kualitas udara':'Air quality',
  'Cerah':'Clear','Cerah berawan':'Partly cloudy','Berawan':'Cloudy','Berkabut':'Foggy','Gerimis':'Drizzle','Hujan':'Rain','Badai petir':'Thunderstorm',
  'Baik':'Good','Sedang':'Moderate','Kurang sehat':'Unhealthy (sensitive)','Tidak sehat':'Unhealthy','Sangat tidak sehat':'Very unhealthy','Berbahaya':'Hazardous',
  'Aman untuk beraktivitas di luar ruangan.':'Safe for outdoor activities.','Orang yang sensitif sebaiknya kurangi aktivitas berat di luar.':'Sensitive people should limit heavy outdoor activity.','Anak, lansia, dan penderita asma sebaiknya di dalam ruangan.':'Children, the elderly, and people with asthma should stay indoors.','Pakai masker saat berada di luar ruangan.':'Wear a mask when outdoors.','Hindari aktivitas di luar ruangan.':'Avoid outdoor activities.','Tetap di dalam ruangan.':'Stay indoors.','Kemungkinan hujan tinggi, siapkan payung.':'High chance of rain, bring an umbrella.',
  /* agenda, kalender */
  'Min':'Sun','Sen':'Mon','Sel':'Tue','Rab':'Wed','Kam':'Thu','Jum':'Fri','Sab':'Sat','Bulan sebelumnya':'Previous month','Bulan berikutnya':'Next month','Semua agenda':'All events','Belum ada agenda':'No events yet','Tidak ada agenda di tanggal ini.':'No events on this date.','Ketuk Tambah untuk membuat agenda.':'Tap Add to create an event.','Tanggal belum dipilih':'Date not selected',
  /* daftar umum */
  'Belum ada data':'No data yet','Ketuk Tambah untuk mulai mencatat.':'Tap Add to start recording.','Belum ada daftar belanja':'No shopping list yet','Ketuk Tambah untuk mencatat kebutuhan rumah.':'Tap Add to note household needs.','Ketuk untuk lihat catatan':'Tap to see notes','Belum ada kendaraan':'No vehicles yet','Belum ada catatan rumah':'No home notes yet','Belum ada catatan':'No notes yet','Tersimpan untuk keluarga':'Saved for the family','Belum ada tugas':'No tasks yet','Ketuk Tugas untuk memberi tugas ke pasanganmu.':'Tap Task to give your partner a task.','Selesai · tersinkron':'Done · synced','Belum ada kontak darurat':'No emergency contacts yet','RS, dokter, satpam, tetangga, sekolah, PLN, PDAM, atau bengkel.':'Hospital, doctor, security guard, neighbor, school, electricity, water, or workshop.','Simpan nomor penting keluarga':"Save the family's important numbers",'Belum ada notifikasi':'No notifications yet','Belum ada aktivitas keluarga':'No family activity yet','Alasan belum diisi':'Reason not provided','Telp':'Call',
  /* arsip, peta, chat */
  'Folder baru':'New folder','Folder Baru':'New Folder','Tanpa folder':'No folder','Tanpa Folder':'No folder','TANPA FOLDER':'NO FOLDER','Belum ada arsip':'No files yet','Folder masih kosong':'This folder is empty','Unggah KTP, KK, STNK, atau dokumen penting lainnya.':'Upload ID card, family card, vehicle registration, or other important documents.','Ubah nama arsip':'Rename file','Dokumen':'Document','Kartu Keluarga':'Family Card','Sertifikat':'Certificate','Sekolah':'School','Keamanan':'Security','Tetangga':'Neighbor','Bengkel':'Workshop','Dokter':'Doctor','Rumah Sakit':'Hospital','PLN / PDAM':'Electricity / Water','Belum ada lokasi':'No locations yet','Lokasi muncul setelah anggota keluarga membagikannya.':'Locations appear once family members share them.','Bagikan lokasi saya':'Share my location','Perbarui lokasi saya':'Update my location','Buka di Google Maps':'Open in Google Maps','Lokasi keluarga':'Family location','Belum ada pesan':'No messages yet','Mulai percakapan keluarga di sini.':'Start the family conversation here.','Tulis pesan untuk keluarga':'Write a message to the family','Anggota keluarga':'Family member','Preview tidak tersedia':'Preview unavailable','Menyiapkan preview…':'Preparing preview…','Dokumen belum dapat ditampilkan':'Document cannot be displayed yet','Buka penuh':'Open full',
  /* riwayat, profil */
  'Selesai, belum selesai, dan alasannya':'Done, not done, and the reasons','Skor keluarga':'Family score','Ganti Foto':'Change photo','Ganti foto profil':'Change profile photo','Foto profil':'Profile photo','Ubah Nama':'Edit name','Anggota Keluarga':'Family Members','Pemilik keluarga':'Family owner','Kode keluarga':'Family code','Kode keluarga:':'Family code:','Aktif di perangkat ini':'Active on this device','Ketuk untuk mengaktifkan':'Tap to enable','Ketuk untuk aktifkan':'Tap to enable','Belum ada anggota. Undang pasangan dengan kode keluarga.':'No members yet. Invite your partner with the family code.','Pengguna':'User','Belum ada email':'No email yet','Pengaturan Aplikasi':'App Settings','Ubah Profil':'Edit Profile','Nama kamu':'Your name','Nama keluarga':'Family name','Nama keluarga hanya bisa diubah pemilik keluarga.':'Only the family owner can change the family name.',
  /* modal tambah */
  'Judul agenda':'Event title','Judul agenda atau rutinitas':'Event or routine title','Jam atau tanggal':'Time or date','Penanggung jawab':'Person in charge','Penanggung jawab, contoh: Ayah':'Person in charge, e.g. Dad','Agenda tanggal tertentu':'Event on a specific date','Rutinitas harian':'Daily routine','Nama barang':'Item name','Kegiatan kesehatan':'Health activity','Nama tagihan':'Bill name','Jatuh tempo':'Due date','Nominal':'Amount','Nama kendaraan':'Vehicle name','Catatan servis':'Service notes','Pemeriksaan rumah':'Home check','Nama aktivitas/item':'Activity/item name','Nama belanja, contoh: Obat':'Shopping item, e.g. Medicine','Jumlah/rincian, contoh: Paracetamol 2 strip':'Quantity/details, e.g. Paracetamol 2 strips','Catatan lengkap, contoh: beli yang tablet, untuk demam anak':"Full notes, e.g. buy the tablet kind, for the child's fever",'Jumlah/Rincian':'Quantity/Details','Belum ada catatan tambahan.':'No additional notes yet.','Nama kontak, contoh: RS terdekat':'Contact name, e.g. nearest hospital','Nomor telepon':'Phone number','Catatan singkat, contoh: terima BPJS':'Short note, e.g. accepts BPJS','Rename Arsip':'Rename File','Nama dokumen':'Document name','Catatan (opsional)':'Notes (optional)','Nama transaksi':'Transaction name','Nominal (Rp)':'Amount (Rp)',
  /* keuangan */
  'Ringkasan':'Summary','Laporan':'Report','Analisis':'Analysis','Pemasukan':'Income','Pengeluaran':'Expenses','Sedekah':'Charity','Saldo tersisa':'Balance left','Saldo bulan ini':"This month's balance",'Target pengeluaran':'Expense target','Isi target per kategori di tab Laporan':'Set category targets in the Report tab','Atur target':'Set target','Saran keuangan':'Financial tips','Transaksi terbaru':'Recent transactions','Belum ada pengeluaran pada periode ini.':'No expenses in this period.','Belum ada transaksi':'No transactions yet','Ketuk Tambah untuk mencatat pemasukan atau pengeluaran.':'Tap Add to record income or expenses.','Pemasukan Suami':"Husband's income",'Pemasukan Istri':"Wife's income",'Per kategori':'By category','Belum ada pengeluaran yang tercatat.':'No expenses recorded yet.','Target per kategori':'Targets by category','Pilih satu bulan untuk mengatur target.':'Pick a single month to set targets.','Isi target tiap kategori untuk mulai memantau.':'Fill in each category target to start tracking.','Salin target bulan lalu':"Copy last month's targets",'Tanpa target':'No target','Belum ada transaksi untuk filter ini.':'No transactions for this filter.','Tidak ada transaksi untuk filter ini.':'No transactions for this filter.','Ekspor CSV':'Export CSV','Semua bulan':'All months','Sembunyikan nominal':'Hide amounts','Tampilkan nominal':'Show amounts','Hapus transaksi':'Delete transaction','Hapus folder':'Delete folder','Hapus arsip':'Delete file','Pindahkan data RuangKas':'Move RuangKas data','Salin semua transaksi dari aplikasi RuangKas lama ke keluarga ini. Aman diulang, data tidak akan ganda.':'Copy all transactions from the old RuangKas app into this family. Safe to repeat; data will not be duplicated.','Memindahkan…':'Moving…','Tabel keuangan belum dibuat':'Finance tables not created yet','Jalankan file supabase-finance.sql di SQL Editor Supabase, lalu muat ulang aplikasi.':'Run supabase-finance.sql in the Supabase SQL Editor, then reload the app.','Gagal memuat':'Failed to load','Tambah Transaksi':'Add Transaction',
  'Suami':'Husband','Istri':'Wife','Bersama':'Together','Gaji':'Salary','Usaha':'Business','Bonus':'Bonus','Investasi':'Investment','Hadiah':'Gift','Makan & Minum':'Food & Drink','Rumah Tangga':'Household','Transportasi':'Transport','Kendaraan Mobil':'Car','Kendaraan Honda':'Motorbike','Tagihan & Internet':'Bills & Internet','Cicilan':'Installments','Orang Tua':'Parents','Anak':'Kids','Kesehatan':'Health','Hiburan':'Entertainment','Pakaian':'Clothing','tabungan':'savings',
  /* toast & pesan */
  'Login berhasil':'Signed in','Email atau password salah':'Wrong email or password','Invalid login credentials':'Wrong email or password','Akun berhasil dibuat':'Account created','Konfirmasi akun dari emailmu, lalu masuk':'Confirm your account from your email, then sign in','Ulangi kata sandi harus sama':'Passwords must match','Keluarga berhasil dibuat':'Family created','Berhasil bergabung dengan keluarga':'Joined the family','Tautan pemulihan siap dikirim':'Recovery link ready to send','Data keluarga tersimpan':'Family data saved','Data keluarga belum dapat dimuat':"Family data couldn't be loaded",'Agenda tersimpan':'Event saved','Belanja tersimpan':'Shopping item saved','Kontak darurat tersimpan':'Emergency contact saved','Rutinitas harian tersimpan':'Daily routine saved','Transaksi tersimpan':'Transaction saved','Transaksi dihapus':'Transaction deleted','Data dihapus':'Data deleted','Item dihapus':'Item deleted','Item berhasil ditambahkan':'Item added','Dokumen dihapus':'File deleted','Dokumen tersimpan aman':'File saved safely','Download dimulai':'Download started','Tautan dokumen disalin':'Document link copied','Folder dibuat':'Folder created','Folder dihapus':'Folder deleted','Nama folder itu sudah ada':'That folder name already exists','Nama folder baru':'New folder name','Nama arsip diperbarui':'File name updated','Profil diperbarui':'Profile updated','Foto profil tersimpan di semua perangkat':'Profile photo saved on all devices','Ukuran foto maksimal 5 MB':'Maximum photo size is 5 MB','Pilih file foto JPG, PNG, atau WebP':'Choose a JPG, PNG, or WebP photo','Upload foto profil gagal':'Profile photo upload failed','Upload dokumen gagal':'File upload failed','Masuk dan buat keluarga terlebih dahulu':'Sign in and create a family first','Kode undangan belum tersedia':'Invite code not available yet','Lokasi berhasil dibagikan':'Location shared','Izin lokasi belum diberikan':'Location permission not granted','Lokasi tidak dapat ditemukan':'Location could not be found','Meminta izin lokasi…':'Requesting location permission…','Perangkat ini belum mendukung lokasi':"This device doesn't support location",'Perangkat/browser ini belum mendukung notifikasi push':"This device/browser doesn't support push notifications",'Izin notifikasi ditolak':'Notification permission denied','Notifikasi keluarga aktif di perangkat ini':'Family notifications active on this device','Gagal mengaktifkan notifikasi':'Failed to enable notifications','Tugas terkirim dan notifikasi dibuat':'Task sent and notification created','Tugas dihapus untuk seluruh keluarga':'Task deleted for the whole family','Status tersinkron':'Status synced','Tugas apa yang ingin diberikan?':'What task would you like to give?','Hapus tugas':'Delete task','Alasan wajib diisi kalau belum selesai':'A reason is required if not done','Pilih tanggal agenda atau jadikan rutinitas harian':'Pick an event date or make it a daily routine','Sesi sudah berakhir. Silakan masuk kembali.':'Your session has expired. Please sign in again.','Koneksi gagal':'Connection failed','Target tersalin':'Targets copied','Koneksi':'Connection','RuangKas lama tidak bisa dibaca':'The old RuangKas could not be read','Format data RuangKas tidak dikenali':'Unrecognized RuangKas data format','Tabel keuangan belum dibuat. Jalankan supabase-finance.sql.':'Finance tables not created yet. Run supabase-finance.sql.','Izin hapus belum aktif. Jalankan supabase-finance.sql.':'Delete permission not active yet. Run supabase-finance.sql.','Chat belum aktif. Jalankan SQL perbaikan chat terlebih dahulu.':'Chat is not active yet. Run the chat fix SQL first.','Izin hapus belum aktif. Jalankan SQL sinkronisasi terbaru.':'Delete permission not active yet. Run the latest sync SQL.','Izin hapus tugas belum aktif. Jalankan SQL sinkronisasi terbaru.':'Task delete permission not active yet. Run the latest sync SQL.','Izin hapus arsip belum aktif. Jalankan SQL supabase-archive-delete.sql terlebih dahulu.':'File delete permission not active yet. Run supabase-archive-delete.sql first.','Izin rename arsip belum aktif. Jalankan SQL sinkronisasi terbaru.':'File rename permission not active yet. Run the latest sync SQL.','Izin ubah profil belum aktif di Supabase':'Edit-profile permission is not active in Supabase','Penyimpanan foto belum aktif. Jalankan SQL sinkronisasi terbaru.':'Photo storage not active yet. Run the latest sync SQL.','Notifikasi push belum aktif. Jalankan SQL setup push terlebih dahulu.':'Push notifications not active yet. Run the push setup SQL first.','Status baca belum aktif. Jalankan SQL sinkronisasi terbaru.':'Read status not active yet. Run the latest sync SQL.','Dokumen tidak dapat dimuat':'File could not be loaded','File profil tidak dapat dibuka':'Profile file could not be opened','Tautan profil tidak tersedia':'Profile link not available','Keluarga berhasil dibuat, tetapi data keluarga belum diterima. Coba muat ulang.':'Family created, but its data was not received yet. Try reloading.','Language set to English':'Language set to English','Bahasa diubah ke Indonesia':'Language changed to Indonesian',
  'Tugas baru untuk keluarga':'New task for the family','Memuat Portal Rumah':'Loading Portal Rumah','Kontak':'Contact','dari target':'of target','Perubahan':'Changes','Nama':'Name','Keluarga':'Family','Hapus arsip ini':'Delete this file','Memperbarui lokasi keluarga':'Updating family location'
};


/* ---- v2: Ho Jak, dialog, edit, arsip ---- */
Object.assign(D,{
  'Izinkan lokasi untuk melihat cuaca dan udara.':'Allow location to see the weather and air.',
  'Ho Jak':'Ho Jak','Mau pergi ke mana?':'Where are you headed?','Sedang disiapkan':'In preparation','Mulai ho jak baru':'Start a new Ho Jak','Baru':'New','Buat sendiri':'Make your own','Ho Jak Baru':'New Ho Jak','Buat Ho Jak':'Create Ho Jak','Tanggal berangkat (opsional)':'Departure date (optional)','Nama, contoh: Ke Rumah Sakit':'Name, e.g. To the Hospital','Tambah barang':'Add item','Belum ada barang':'No items yet','Siap berangkat!':'Ready to go!','Reset ceklis':'Reset checklist','Hapus Ho Jak ini':'Delete this Ho Jak','Hapus Ho Jak ini?':'Delete this Ho Jak?','Ceklis masih kosong':'Checklist is empty','Tambahkan barang yang perlu dibawa.':'Add the things you need to bring.','Ho Jak dibuat':'Ho Jak created','Ho Jak dihapus':'Ho Jak deleted','Ceklis di-reset':'Checklist reset','Ceklis sudah kosong':'Checklist is already clear','Tabel Ho Jak belum dibuat':'Ho Jak tables not created yet','Jalankan file supabase-hojak.sql di SQL Editor Supabase, lalu muat ulang aplikasi.':'Run supabase-hojak.sql in the Supabase SQL Editor, then reload the app.','Tabel Ho Jak belum dibuat. Jalankan supabase-hojak.sql.':'Ho Jak tables not created yet. Run supabase-hojak.sql.','Gagal membuat Ho Jak':'Failed to create Ho Jak','Besok':'Tomorrow','Buka':'Open','Buka profil':'Open profile',
  /* template Ho Jak */
  'Ke Rumah Sakit':'To the Hospital','Pergi Berlibur':'Going on Vacation','Anak ke Sekolah':'Kids to School','Dinas / Luar Kota':'Work Trip / Out of Town','Pulang Kampung':'Going Home (Village)','Ke Pasar':'To the Market','Masjid / Pengajian':'Mosque / Religious Study','Piknik / Pantai':'Picnic / Beach',
  'KTP':'ID card (KTP)','Kartu BPJS / asuransi':'BPJS / insurance card','Kartu berobat / rekam medis':'Patient card / medical record','Surat rujukan':'Referral letter','Hasil lab / rontgen sebelumnya':'Previous lab / X-ray results','Daftar obat yang sedang diminum':'List of current medicines','Uang tunai & kartu ATM':'Cash & ATM card','Power bank & charger':'Power bank & charger','Botol minum':'Water bottle','Masker':'Mask','Tisu & kantong plastik':'Tissues & plastic bags','Pakaian ganti & perlengkapan mandi (jika rawat inap)':'Spare clothes & toiletries (if admitted)','Alat tulis untuk mencatat':'Pen & paper for notes',
  'KTP / SIM':'ID card / driving license','Tiket & bukti pesanan hotel':'Tickets & hotel booking proof','Pakaian ganti':'Spare clothes','Perlengkapan mandi':'Toiletries','Obat pribadi & P3K':'Personal medicine & first aid','Charger & power bank':'Charger & power bank','Kamera / HP':'Camera / phone','Payung / jas hujan':'Umbrella / raincoat','Sandal & sepatu':'Sandals & shoes','Topi & kacamata hitam':'Hat & sunglasses','Perlengkapan anak':'Kids\' supplies','Bekal & camilan':'Food & snacks','Kunci rumah dititipkan, listrik & gas dimatikan':'House key left with someone, electricity & gas off',
  'Seragam':'Uniform','Tas & buku pelajaran':'Bag & textbooks','Alat tulis':'Stationery','PR / tugas':'Homework / assignments','Bekal makan':'Packed lunch','Uang jajan':'Pocket money','Sepatu & kaus kaki':'Shoes & socks','Kartu pelajar':'Student card',
  'Surat tugas':'Assignment letter','Dokumen kerja':'Work documents','Laptop & charger':'Laptop & charger','Obat pribadi':'Personal medicine','Uang saku & kartu ATM':'Pocket money & ATM card','Power bank':'Power bank',
  'KTP / SIM & STNK':'ID / license & vehicle registration','BBM penuh & cek ban':'Full tank & tire check','Oleh-oleh':'Gifts to bring','Amplop / uang untuk keluarga':'Envelopes / money for family','Obat & P3K':'Medicine & first aid','Bekal perjalanan':'Travel food','Pakaian ganti & handuk':'Spare clothes & towel',
  'Daftar belanja':'Shopping list','Tas belanja':'Shopping bag','Uang tunai':'Cash','Dompet & HP':'Wallet & phone','Kantong plastik / wadah':'Plastic bags / containers',
  'Mukena / sarung & peci':'Prayer garments','Al-Qur\'an':'Qur\'an','Sajadah':'Prayer mat','Uang infaq':'Donation money','Sandal / kantong sepatu':'Sandals / shoe bag',
  'Tikar':'Mat','Makanan & minuman':'Food & drinks','Tabir surya':'Sunscreen','Payung / topi':'Umbrella / hat','Kantong sampah':'Trash bags','Mainan anak':'Kids\' toys',
  /* dialog & sheet */
  'Batal':'Cancel','Buat':'Create','Tambah apa?':'Add what?','Agenda / Tugas':'Event / Task','Untuk':'For','Tugas tidak punya tanggal. Semua anggota akan mendapat pemberitahuan.':'Tasks have no date. All members will be notified.','Tugas apa yang ingin diberikan?':'What task would you like to give?','Kenapa belum selesai?':'Why is it not done?','Isi alasan singkat supaya masuk Riwayat.':'Write a short reason so it appears in History.','Alasan singkat':'Short reason','Contoh: Kendaraan':'e.g. Vehicles','Hapus folder ini?':'Delete this folder?','Dokumen di dalamnya tidak ikut terhapus, hanya dipindah ke "Tanpa folder".':'Files inside are not deleted, just moved to "No folder".','Hapus dokumen?':'Delete file?','Hapus yang sudah dibeli?':'Clear purchased items?','Pindahkan data RuangKas?':'Move RuangKas data?','Semua transaksi dari RuangKas lama akan disalin ke keluarga ini. Data lama tidak diubah atau dihapus, dan mengulang tidak akan menggandakan data.':'All transactions from the old RuangKas will be copied to this family. The old data is not changed or deleted, and repeating will not duplicate anything.',
  /* edit */
  'Ubah Agenda':'Edit Event','Ubah Belanja':'Edit Shopping Item','Ubah Kesehatan & Anak':'Edit Health & Kids','Ubah Kendaraan':'Edit Vehicle','Ubah Catatan Rumah':'Edit Home Note','Ubah Kontak Darurat':'Edit Emergency Contact','Ubah Transaksi':'Edit Transaction','Simpan Perubahan':'Save Changes','Perubahan tersimpan':'Changes saved','Izin ubah belum aktif. Jalankan ulang supabase-finance.sql.':'Edit permission not active yet. Re-run supabase-finance.sql.','Judul agenda':'Event title','Siapa yang mengerjakan?':'Who will do it?',
  /* arsip */
  'Cari dokumen':'Search files','Terbaru':'Newest','Ukuran':'Size','Tidak ditemukan':'Not found','Coba kata kunci lain.':'Try another keyword.'
});

/* ---- v3: notifikasi ---- */
Object.assign(D,{
  'Pengaturan Notifikasi':'Notification Settings','Atur kabar yang masuk ke perangkat ini':'Choose what reaches this device','Status perangkat ini':'This device status','Memeriksa…':'Checking…',
  'Perangkat mendukung notifikasi':'Device supports notifications','Gunakan Safari (iOS 16.4 ke atas) atau Chrome terbaru.':'Use Safari (iOS 16.4 or newer) or a recent Chrome.',
  'Dibuka dari ikon di layar utama':'Opened from the Home Screen icon','Di iPhone/iPad notifikasi hanya bekerja bila aplikasi dipasang: Safari → Bagikan → Tambah ke Layar Utama, lalu buka dari ikon itu.':'On iPhone/iPad, notifications only work when the app is installed: Safari → Share → Add to Home Screen, then open it from that icon.',
  'Izin notifikasi':'Notification permission','Izin ditolak. Ubah di Pengaturan perangkat → Notifikasi → Portal Rumah.':'Permission denied. Change it in device Settings → Notifications → Portal Rumah.','Belum diminta. Ketuk "Aktifkan notifikasi".':'Not requested yet. Tap "Enable notifications".',
  'Perangkat terdaftar di server':'Device registered on server','Terdaftar di perangkat tapi belum di server. Ketuk "Aktifkan notifikasi".':'Registered on the device but not on the server. Tap "Enable notifications".','Belum terdaftar. Ketuk "Aktifkan notifikasi".':'Not registered yet. Tap "Enable notifications".',
  'Aktifkan notifikasi':'Enable notifications','Aktifkan notifikasi dulu':'Enable notifications first','Uji di perangkat':'Test on device','Uji dari server':'Test from server',
  'Notifikasi uji dikirim ke perangkat ini. Kalau tidak terlihat, cek mode Fokus/Jangan Ganggu.':'A test notification was sent to this device. If you cannot see it, check Focus / Do Not Disturb mode.','Mengirim dari server…':'Sending from server…','Permintaan terkirim. Notifikasi dari server akan muncul dalam beberapa detik.':'Request sent. The server notification should appear within a few seconds.','Server menolak permintaan uji.':'The server rejected the test request.','Perangkat ini belum terdaftar. Aktifkan notifikasi dulu.':'This device is not registered yet. Enable notifications first.','Fungsi uji belum ada di Supabase. Jalankan supabase-push-setup.sql terbaru.':'The test function is missing in Supabase. Run the latest supabase-push-setup.sql.',
  'Jenis notifikasi':'Notification types','Pesan keluarga':'Family messages','Chat dari anggota lain':'Chats from other members','Agenda & tugas':'Events & tasks','Agenda baru dan tugas untuk kamu':'New events and tasks for you','Barang baru di daftar belanja':'New items on the shopping list','Transaksi baru dicatat (tanpa nominal)':'New transactions recorded (no amounts)','Ceklis perjalanan baru':'New trip checklists','Berlaku untuk perangkat ini saja.':'Applies to this device only.',
  'Saat aplikasi terbuka':'While the app is open','Banner kabar baru':'New-activity banner','Muncul di atas layar seperti WhatsApp':'Appears at the top of the screen like WhatsApp','Suara & getar':'Sound & vibration','Nada singkat saat banner muncul':'A short tone when a banner appears','Sekarang':'Now','Belum aktif · ketuk untuk mengatur':'Not active · tap to set up','Anggota keluarga ':'Family member'
});

Object.assign(D,{'Izin Ho Jak belum aktif':'Ho Jak permission not active yet','Jalankan ulang supabase-hojak.sql (bagian izin dan kebijakan), lalu muat ulang aplikasi.':'Re-run supabase-hojak.sql (the permissions and policies part), then reload the app.','Izin Ho Jak belum aktif. Jalankan ulang supabase-hojak.sql.':'Ho Jak permission not active yet. Re-run supabase-hojak.sql.','Izin keuangan belum aktif':'Finance permission not active yet','Jalankan ulang supabase-finance.sql (bagian izin dan kebijakan), lalu muat ulang aplikasi.':'Re-run supabase-finance.sql (the permissions and policies part), then reload the app.'});

Object.assign(D,{'Buatanmu':'Your own','Ho Jak Sendiri':'Your Own Ho Jak','Mau pergi ke mana? Contoh: Ke Rumah Nenek':'Where to? e.g. To Grandma\'s House','Buat Ceklis':'Create Checklist','Siap berangkat':'Ready to go','Kembalikan ke bawaan':'Restore defaults','Kembalikan ke bawaan?':'Restore defaults?','Kembalikan':'Restore','Dikembalikan ke bawaan':'Restored to defaults','Tersimpan di perangkat ini saja. Jalankan supabase-hojak.sql agar tersinkron antar anggota keluarga.':'Saved on this device only. Run supabase-hojak.sql to sync between family members.','Coba hubungkan lagi':'Try connecting again','Data Ho Jak di perangkat ini dipindahkan ke server':'Ho Jak data on this device was moved to the server'});
/* ---- Pola kalimat dinamis ---- */
const R=[
  [/^(\d+) belum selesai$/,'$1 pending'],[/^(\d+) belum dibeli$/,'$1 to buy'],[/^(\d+) belum dibayar$/,'$1 unpaid'],[/^(\d+) menunggu dikerjakan$/,'$1 to do'],
  [/^(\d+) kontak tersimpan$/,'$1 contacts saved'],[/^(\d+) lokasi dibagikan$/,'$1 locations shared'],[/^(\d+) anggota$/,'$1 members'],[/^(\d+) dokumen tersimpan$/,'$1 files saved'],
  [/^(\d+) file di folder ini$/,'$1 files in this folder'],[/^(\d+) file$/,'$1 files'],[/^(\d+) kendaraan tercatat$/,'$1 vehicles recorded'],[/^(\d+) catatan tercatat$/,'$1 notes recorded'],
  [/^(\d+) belum dibaca$/,'$1 unread'],[/^(\d+) belum selesai atau belum dibaca$/,'$1 pending or unread'],[/^(\d+) transaksi dipindahkan$/,'$1 transactions moved'],[/^(\d+) transaksi$/,'$1 transactions'],[/^(\d+) catatan$/,'$1 notes'],[/^(\d+) selesai$/,'$1 done'],[/^(\d+) perlu evaluasi$/,'$1 need review'],[/^(\d+) perlu alasan\/evaluasi$/,'$1 need a reason/review'],
  [/^(\d+) dari (\d+) aktivitas selesai$/,'$1 of $2 activities done'],[/^(\d+) aktivitas menanti$/,'$1 activities waiting'],
  [/^Jadwal (.+)$/,'Scheduled $1'],[/^Agenda (\d.+)$/,'Events on $1'],[/^Diperbarui (.+)$/,'Updated $1'],[/^diperbarui (.+)$/,'updated $1'],
  [/^Terasa (.+)$/,'Feels like $1'],[/^hujan (\d+%)$/,'rain $1'],[/^Alasan: (.+)$/,'Reason: $1'],[/^Over (\d+%)$/,'Over $1'],
  [/^target (.+)$/,'target $1'],[/^(.+) dari target (.+)$/,'$1 of $2 target'],
  [/^Tambah (.+)$/,(m,x)=>'Add '+tr(x)],[/^Simpan (.+)$/,(m,x)=>'Save '+tr(x)],[/^Lihat (.+)$/,'View $1'],[/^Unggah Dokumen ke "(.+)"$/,'Upload file to "$1"'],[/^Unggah Dokumen$/,'Upload File'],
  [/^Kode undangan: (.+)$/,'Invite code: $1'],[/^Kode (\S+) sudah disalin\. Kirim ke pasanganmu\.$/,'Code $1 copied. Send it to your partner.'],[/^Sinkron otomatis · Kode (.+)$/,'Auto-sync · Code $1'],
  [/^Selamat datang, (.+)$/,'Welcome, $1'],[/^Format (.+) dapat dibuka penuh atau di-download\.$/,'The $1 format can be opened in full or downloaded.'],[/^Preview (.+)$/,'Preview $1'],
  [/^Target (.+)$/,'Target $1'],[/^Hapus "(.+)"\? Tindakan ini tidak bisa dibatalkan\.$/,'Delete "$1"? This cannot be undone.'],
  [/^Hapus folder ini\? .*$/,'Delete this folder? Files inside are not deleted, just moved to "No folder".'],
  [/^Salin semua transaksi dari RuangKas lama ke keluarga ini\?[\s\S]*$/,'Copy all transactions from the old RuangKas into this family?\n\nThe old data is not changed or deleted, and repeating this will not duplicate anything.'],
  [/^Kenapa belum selesai\? .*$/,'Why is it not done? Write a short reason so it appears in History.'],
  /* saran keuangan */
  [/^Kurangi (.+) minimal (.+) agar kembali sesuai target\.$/,(m,c,a)=>`Cut ${tr(c)} by at least ${a} to get back on target.`],
  [/^Batas aman (.+) sampai akhir bulan sekitar (.+) per hari\.$/,(m,c,a)=>`Safe limit for ${tr(c)} until month-end is about ${a} per day.`],
  [/^Tahan pengeluaran berikutnya\. Arus kas perlu dikurangi (.+) agar kembali seimbang\.$/,'Hold off on the next expenses. Cash flow needs to be cut by $1 to rebalance.'],
  [/^Sisihkan lagi (.+) untuk mencapai tabungan 20% bulan ini\.$/,'Set aside $1 more to reach 20% savings this month.'],
  [/^(.+) mengambil (\d+)% pengeluaran\. Periksa transaksi terbesarnya sebelum belanja lagi\.$/,(m,c,p)=>`${tr(c)} accounts for ${p}% of expenses. Check its biggest transactions before spending again.`],
  [/^Catat pemasukan dan pengeluaran pertama agar saran keuangan bisa muncul\.$/,'Record your first income and expense so tips can appear.'],
  [/^Arus kas masih aman\. Buat target kategori agar batas belanja bisa dipantau otomatis\.$/,'Cash flow is still healthy. Set category targets so spending limits are tracked automatically.'],
  [/^Semua target aman\. Pertahankan pengeluaran harian dan tabungan (\d+)% bulan ini\.$/,'All targets are safe. Keep up daily spending and $1% savings this month.']
];
R.push([/^Hapus (.+)$/,'Delete $1']);
/* ---- v3: pola notifikasi ---- */
R.unshift(
  [/^(.+) memberi tugas$/,'$1 gave a task'],
  [/^(.+) menambah agenda$/,'$1 added an event'],
  [/^(.+) menambah belanjaan$/,'$1 added a shopping item'],
  [/^(.+) membuat Ho Jak$/,'$1 created a Ho Jak'],
  [/^(.+) mencatat pemasukan$/,'$1 recorded income'],
  [/^(.+) mencatat pengeluaran$/,'$1 recorded an expense'],
  [/^(.+) \((\d+) pesan\)$/,'$1 ($2 messages)']
);

/* ---- v2: pola tambahan ---- */
R.unshift(
  [/^(\d+)\/(\d+) siap$/,'$1/$2 ready'],
  [/^Daftar "(.+)" akan kembali ke isi bawaan: barang tambahan dan centang dihapus untuk semua anggota keluarga\.$/,'The "$1" list will return to its defaults: extra items and ticks are removed for all family members.'],
  [/^(\d+) dari (\d+) siap$/,'$1 of $2 ready'],
  [/^\+(\d+) lagi$/,'+$1 more'],
  [/^Untuk (.+)$/,(m,x)=>'For '+tr(x)],
  [/^Ubah (.+)$/,(m,x)=>'Edit '+tr(x)],
  [/^Saldo (\D.+)$/,'Balance $1'],
  [/^Hapus yang sudah dibeli \((\d+)\)$/,'Clear purchased ($1)'],
  [/^(\d+) barang dihapus$/,'$1 items deleted'],
  [/^(\d+) barang yang sudah dicentang akan dihapus untuk semua anggota keluarga\.$/,'$1 checked items will be deleted for the whole family.'],
  [/^"(.+)" dan seluruh ceklisnya akan dihapus untuk semua anggota keluarga\.$/,'"$1" and its whole checklist will be deleted for all family members.'],
  [/^"(.+)" akan dihapus permanen\.$/,'"$1" will be permanently deleted.'],
  [/^Ho Jak (.+)$/,(m,x)=>D['Ho Jak '+x]?D['Ho Jak '+x]:m]
);

const MON={Januari:'January',Februari:'February',Maret:'March',Juni:'June',Juli:'July',Agustus:'August',Oktober:'October',Desember:'December',Mei:'May',Agu:'Aug',Okt:'Oct',Des:'Dec'};
const monthRe=new RegExp('\\b(\\d{1,2} )?('+Object.keys(MON).join('|')+')\\b','g');
const fixMonths=s=>s.replace(monthRe,(m,d,mo)=>(d||'')+MON[mo]);

function tr(str){
  if(!str)return str;
  const lead=str.match(/^\s*/)[0],trail=str.match(/\s*$/)[0],core=str.trim();
  if(!core)return str;
  let out=core;
  if(Object.prototype.hasOwnProperty.call(D,core)&&D[core])out=D[core];
  else{
    if(core.includes(' · '))out=core.split(' · ').map(tr).join(' · ');
    else{
      let done=false;
      for(const [re,rep] of R){if(re.test(core)){out=core.replace(re,rep);done=true;break}}
      if(!done&&/\.\s+\S/.test(core))out=core.split(/(?<=\.)\s+/).map(tr).join(' ');
    }
  }
  return lead+fixMonths(out)+trail;
}
window.i18nTr=tr;

/* ---- Penerjemah DOM ---- */
const ATTRS=['placeholder','aria-label','title','alt'];
function localizeNode(node){
  if(node.nodeType===3){const t=tr(node.nodeValue);if(t!==node.nodeValue)node.nodeValue=t;return}
  if(node.nodeType!==1)return;
  const tag=node.tagName.toLowerCase();
  if(tag==='script'||tag==='style')return;
  if(tag==='option'&&!node.hasAttribute('value'))node.setAttribute('value',node.textContent);
  ATTRS.forEach(a=>{if(node.hasAttribute(a)){const v=node.getAttribute(a),t=tr(v);if(t!==v)node.setAttribute(a,t)}});
  if(tag==='textarea'||tag==='input'||tag==='svg')return;
  node.childNodes.forEach(localizeNode);
}
let observer;
function startObserver(){
  observer=new MutationObserver(records=>{
    if(!isEn())return;
    observer.disconnect();
    try{records.forEach(r=>{
      if(r.type==='characterData')localizeNode(r.target);
      else r.addedNodes.forEach(localizeNode);
    })}finally{observer.observe(document.body,{childList:true,subtree:true,characterData:true})}
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}
function applyAll(){if(isEn()){observer?.disconnect();localizeNode(document.body);observer?.observe(document.body,{childList:true,subtree:true,characterData:true})}}

/* dialog bawaan browser */
['prompt','confirm','alert'].forEach(name=>{const orig=window[name];window[name]=function(message,...rest){return orig.call(window,isEn()?tr(String(message)):message,...rest)}});

/* tombol bahasa di Profil: app.js sudah mengganti state.lang & render ulang */
document.addEventListener('click',event=>{
  if(!event.target.closest('[data-language-toggle]'))return;
  setTimeout(()=>{applyAll();document.documentElement.lang=state.lang},0);
});

startObserver();
applyAll();
})();
