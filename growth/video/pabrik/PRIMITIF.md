# Primitif adegan pabrik reels

Dibuat otomatis: `node growth/video/pabrik/bangun.mjs --daftar`. Satu adegan = satu blok VO = satu primitif.
Kolom: `teks<=N` (\n = baris baru), `angka`, `bool`, `aset` (id katalog), `pose`/`wajah` (nama pose/ekspresi tokoh, mis. `panik`, `kaget`), `pilih:a|b`, `daftar<=N:teks<=M` (string atau {teks,kata}); `!` = wajib.
Semua adegan juga menerima: `suasana` (masalah|solusi|malam|gelap|hangat), `latar` (id aset latar), `jam` (K1, "07.15"), `hari` (K1, 2 = hari kedua).
Elemen teks boleh `{"teks":"...","kata":"<kata VO>"}` agar muncul tepat saat kata itu diucapkan.

## `tokoh` (semua konsep)

Tokoh (badan kartun + wajah foto) di satu sisi + tempelan: judul (tag nama), sub, gelembung, stempel, prop, bintang. Adegan serbaguna (kenalan, keluhan, reaksi).

| opsi | tipe |
|---|---|
| pose | `pose` |
| wajah | `wajah[]<=3` |
| ganti | `teks<=20` |
| sisi | `pilih:kanan\|kiri` |
| judul | `teks<=20` |
| sub | `teks<=28` |
| bubble | `teks<=16` |
| stempel | `teks<=14` |
| prop | `aset` |
| bintang | `bool` |
| tokoh | `teks<=40` |
| latar | `aset` |
| suasana | `pilih:masalah\|solusi\|malam\|gelap\|hangat` |

## `meter` (semua konsep)

Meme meter: 1-2 bar persen (mis. SKILL MERAWAT 100%, SKILL ADMINISTRASI anjlok) + tokoh bingung + tanda tanya.

| opsi | tipe |
|---|---|
| meter | `meter!` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| ganti | `teks<=20` |
| tanya | `bool` |
| tokoh | `teks<=40` |
| suasana | `pilih:masalah\|solusi\|malam` |

## `tumpuk` (semua konsep)

Benda menumpuk/tumbuh besar (tumpukan berkas, kardus) + tokoh kewalahan + kartu tulisan tangan + tag.

| opsi | tipe |
|---|---|
| prop | `aset!` |
| kartu | `teks<=26` |
| tag | `teks<=20` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| ganti | `teks<=20` |
| tokoh | `teks<=40` |
| latar | `aset` |
| suasana | `pilih:masalah\|solusi\|malam` |

## `hitung` (semua konsep)

Kartu penghitung besar (CARI BERKAS 00:00 → 15:00, PASIEN 0 → 12, PESANAN 0 → 1.284) + tokoh + kertas beterbangan + gelembung.

| opsi | tipe |
|---|---|
| judul | `teks<=16!` |
| dari | `angka` |
| ke | `angka!` |
| format | `pilih:menit\|angka\|detik\|persen` |
| kata | `teks<=20` |
| prop | `aset` |
| terbang | `bool` |
| bubble | `teks<=20` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| ganti | `teks<=20` |
| tokoh | `teks<=40` |
| latar | `aset` |
| suasana | `pilih:masalah\|solusi\|malam\|gelap` |

## `kartu-tanya` (semua konsep)

Kartu tulisan tangan besar berisi pertanyaan menegangkan + bayangan maskot/benda turun dari atas (jelang twist).

| opsi | tipe |
|---|---|
| teks | `teks<=40!` |
| bayangan | `aset` |
| latar | `aset` |

## `reveal` (semua konsep)

Kemunculan besar dengan ledakan komik: subjek (maskot/benda/tokoh) + tag teriakan + stempel. Untuk twist 'Iya, AKU.' atau pelaku.

| opsi | tipe |
|---|---|
| subjek | `aset!` |
| label | `teks<=14` |
| teks | `teks<=14!` |
| stempel | `teks<=16` |
| wajah | `wajah[]<=1` |
| latar | `aset` |

## `derita` (semua konsep)

Maskot/benda menderita: 1-3 kejadian (stempel / tag / kartu) muncul bergantian + guncangan + prop (kopi tumpah, laci).

| opsi | tipe |
|---|---|
| maskot | `aset!` |
| label | `teks<=14` |
| item | `daftar<=3:teks<=16` |
| prop | `aset[]<=2` |
| latar | `aset` |

## `poster` (semua konsep)

Poster DICARI / pengumuman kertas tua berisi gambar + stempel besar (mis. 3 HARI) + tag temuan.

| opsi | tipe |
|---|---|
| judul | `teks<=10` |
| gambar | `aset!` |
| label | `teks<=14` |
| keterangan | `teks<=22` |
| stempel | `teks<=10` |
| tag | `teks<=26` |
| latar | `aset` |

## `logo` (semua konsep)

Titik balik: logo produk + stempel (PINDAH!/AKHIRNYA) + maskot/tokoh melompat senang. Pembuka solusi.

| opsi | tipe |
|---|---|
| stempel | `teks<=12` |
| kiri | `aset` |
| label | `teks<=14` |
| pose | `pose` |
| wajah | `wajah[]<=1` |
| kata | `teks<=20` |
| tokoh | `teks<=40` |

## `layar` (semua konsep)

Solusi: layar aplikasi ASLI. DentalCare = 1-3 screenshot UI (aset ui) berbingkai; Nusawebsite = layar aplikasi HTML (app: judul, baris [nama, ket, status]). + stempel RAPI ✓.

| opsi | tipe |
|---|---|
| layar | `layar[]<=3` |
| app | `app` |
| stempel | `teks<=12` |
| pose | `pose` |
| wajah | `wajah[]<=1` |
| tokoh | `teks<=40` |

## `daftar` (semua konsep)

Daftar/checklist 2-4 baris (jadwal tersusun, notifikasi rapi, hasil) muncul satu per satu dengan ✓ + stempel + tokoh kecil.

| opsi | tipe |
|---|---|
| judul | `teks<=22!` |
| item | `daftar<=4:teks<=26!` |
| stempel | `teks<=14` |
| pose | `pose` |
| wajah | `wajah[]<=1` |
| tokoh | `teks<=40` |
| suasana | `pilih:masalah\|solusi` |

## `bentrok` (semua konsep)

Dua kartu (jadwal/pesanan) meluncur dari kiri-kanan lalu bertabrakan + stempel BENTROK + tokoh kaget.

| opsi | tipe |
|---|---|
| kiri | `pasangan!` |
| kanan | `pasangan!` |
| stempel | `teks<=12` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| ganti | `teks<=20` |
| tokoh | `teks<=40` |

## `chat` (semua konsep)

Ponsel berisi chat WhatsApp (2-5 pesan, satu bisa disorot) + tokoh/foto bereaksi + stempel (??? / TENGGELAM).

| opsi | tipe |
|---|---|
| judul | `teks<=18` |
| sub | `teks<=20` |
| pesan | `pesan[]<=5!` |
| foto | `aset` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| ganti | `teks<=20` |
| stempel | `teks<=12` |
| tokoh | `teks<=40` |
| latar | `aset` |
| suasana | `pilih:masalah\|malam\|gelap` |

## `haru` (semua konsep)

Penutup cerita hangat: maskot/tokoh terharu + kartu ucapan + tag (PENSIUN TENANG / KASUS DITUTUP) + bintang.

| opsi | tipe |
|---|---|
| kartu | `teks<=24` |
| tag | `teks<=18` |
| maskot | `aset` |
| label | `teks<=14` |
| pose | `pose` |
| wajah | `wajah[]<=1` |
| tokoh | `teks<=40` |
| latar | `aset` |

## `cta` (semua konsep)

Penutup WAJIB (adegan terakhir): logo + kartu ajakan sopan + tombol 'Tanya lewat WhatsApp di profil' berdenyut + maskot/tokoh.

| opsi | tipe |
|---|---|
| ajakan | `teks<=40` |
| maskot | `aset` |
| label | `teks<=14` |
| pose | `pose` |
| wajah | `wajah[]<=1` |
| tokoh | `teks<=40` |

## `koran` (semua konsep)

Hook halaman koran: nama koran, judul besar ('Kenalin, ini drg. Sinta'), subjudul, foto tokoh dilingkari spidol merah, kamera zoom.

| opsi | tipe |
|---|---|
| koran | `teks<=14` |
| rubrik | `teks<=16` |
| judul | `teks<=26!` |
| sub | `teks<=56` |
| foto | `aset` |
| kata | `teks<=20` |

## `kalender` (konsep K1)

K1: lembar kalender HARI 1 disobek → HARI 2, latar berganti warna solusi, logo produk muncul. Pasang opsi hari:2 di adegan ini.

| opsi | tipe |
|---|---|
| dari | `teks<=8` |
| ke | `teks<=8` |
| logo | `bool` |
| kata | `teks<=20` |
| hari | `angka` |
| jam | `teks<=5` |

## `banding` (konsep K2)

K2: layar terbelah garis sobekan. Kiri DULU (kacau, sepia), kanan SEKARANG (rapi, terang); kejadian sama bersamaan. Tiap sisi: pose+wajah+tempelan.

| opsi | tipe |
|---|---|
| kiri | `sisi!` |
| kanan | `sisi!` |
| label_kiri | `teks<=10` |
| label_kanan | `teks<=10` |

## `studio` (konsep K3)

K3: studio berita: reporter (foto potong) + papan BERITA TERKINI + judul berita besar + lower third nama reporter.

| opsi | tipe |
|---|---|
| reporter | `aset` |
| judul | `teks<=30!` |
| label | `teks<=16` |
| nama | `teks<=24` |
| jabatan | `teks<=28` |

## `wawancara` (konsep K3)

K3: wawancara saksi/pakar: foto/tokoh dalam bingkai + lower third nama & keterangan + kutipan gelembung + mikrofon.

| opsi | tipe |
|---|---|
| saksi | `aset!` |
| nama | `teks<=22!` |
| ket | `teks<=30` |
| kutipan | `teks<=40` |
| stempel | `teks<=12` |

## `tipe-hook` (konsep K4)

K4 pembuka: angka besar 'N TIPE' + judul + sub + kartu tertutup dibagikan + gelembung 'Kamu yang mana?'.

| opsi | tipe |
|---|---|
| jumlah | `angka!` |
| judul | `teks<=18!` |
| sub | `teks<=30` |
| tanya | `teks<=18` |

## `kartu-tipe` (konsep K4)

K4: kartu karakter ala game (rarity COMMON/RARE/EPIC/LEGENDARY, foto, 4 bar statistik, SKILL/KELEMAHAN) + 1 gag: turun (bar anjlok), chat (banjir chat), galat (dialog error), notif (notifikasi rapi + Zzz), lupa (gelembung ingatan hilang).

| opsi | tipe |
|---|---|
| no | `angka!` |
| nama | `teks<=24!` |
| rarity | `pilih:COMMON\|RARE\|EPIC\|LEGENDARY` |
| foto | `aset!` |
| stat | `stat!` |
| skill | `teks<=34!` |
| lemah | `teks<=34!` |
| gag | `gag` |

## `tipe-pilih` (konsep K4)

K4 penutup: kartu mini semua tipe (diambil otomatis dari adegan kartu-tipe) + kolom komentar mengetik 'Aku tipe nomor ...'.

| opsi | tipe |
|---|---|
| komentar | `teks<=24` |

## `berkas-kasus` (konsep K5)

K5 pembuka noir: map BERKAS KASUS di bawah lampu sorot + tulisan nomor berkas mengetik + polaroid barang bukti + stempel HILANG / LAGI.

| opsi | tipe |
|---|---|
| judul | `teks<=14` |
| nomor | `teks<=26!` |
| gambar | `aset!` |
| label | `teks<=12` |
| stempel | `daftar<=2:teks<=10!` |

## `penyelidikan` (konsep K5)

K5: papan gabus + detektif wanita + catatan kuning hitungan kasus (turus) + pita garis polisi PENYELIDIKAN meluncur.

| opsi | tipe |
|---|---|
| catatan | `teks<=12` |
| jumlah | `angka` |
| sub | `teks<=14` |
| pita | `teks<=16` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| ganti | `teks<=20` |

## `tersangka` (konsep K5)

K5: polaroid TERSANGKA #n di papan gabus + label nama + catatan kuning + 0-2 stempel (ALIBI KUAT / LACI MACET) + detektif kecil.

| opsi | tipe |
|---|---|
| no | `angka!` |
| gambar | `aset!` |
| label | `teks<=18!` |
| catatan | `teks<=30` |
| stempel | `daftar<=2:teks<=14` |
| detektif | `bool` |

## `benang` (konsep K5)

K5: 3 polaroid tersangka di papan tersambung benang merah ke kartu '?' di tengah + detektif berpikir (menjelang reveal).

| opsi | tipe |
|---|---|
| gambar | `aset[]<=3!` |
| tanya | `teks<=3` |
| ganti | `teks<=20` |

## `pelaku` (konsep K5)

K5 reveal: ledakan + polaroid PELAKU besar + stempel nama pelaku (mis. SISTEM KERTAS) + wajah detektif kaget.

| opsi | tipe |
|---|---|
| gambar | `aset!` |
| label | `teks<=10` |
| stempel | `teks<=16!` |

## `modus` (konsep K5, K0, K3, K7, K8)

3 panel komik bernomor (MODUS OPERANDI / kronologi): tiap panel judul + gambar opsional, muncul mengikuti VO.

| opsi | tipe |
|---|---|
| judul | `teks<=18` |
| panel | `panel[]<=3!` |

## `vonis` (konsep K5)

K5 solusi: stempel VONIS + logo + layar aplikasi (UI asli DC / app HTML NW) dengan kolom cari mengetik + timer detik + stempel KETEMU ✓.

| opsi | tipe |
|---|---|
| vonis | `teks<=8` |
| ui | `aset` |
| judul | `teks<=18` |
| cari | `teks<=18` |
| app | `app` |
| detik | `angka` |
| ok | `teks<=12` |

## `surat-buka` (konsep K6)

K6 pembuka: kertas surat bergaris, 'Surat Terbuka' tulisan tangan merah + baris untuk/dari + hati + maskot penulis surat.

| opsi | tipe |
|---|---|
| judul | `teks<=16` |
| untuk | `teks<=26!` |
| dari | `teks<=26!` |
| maskot | `aset` |

## `surat` (konsep K6)

K6 isi surat: 1-3 baris tulisan tangan muncul per baris mengikuti VO + opsional angka menghitung besar + maskot/foto/prop + stempel.

| opsi | tipe |
|---|---|
| baris | `daftar<=3:teks<=26!` |
| angka | `angka` |
| gambar | `aset` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| stempel | `teks<=12` |
| tokoh | `teks<=40` |
| suasana | `pilih:masalah\|solusi` |

## `surat-tutup` (konsep K6)

K6 penutup surat: salam + tanda tangan tulisan tangan + maskot pensiun/terharu + stempel (PENSIUN / TERIMA KASIH) + hati.

| opsi | tipe |
|---|---|
| salam | `teks<=22` |
| ttd | `teks<=22!` |
| maskot | `aset` |
| stempel | `teks<=14` |

## `tutorial-hook` (konsep K7)

K7 pembuka: label ▶ TUTORIAL + kartu judul besar 'CARA BIKIN ... ' + kata kunci raksasa (KACAU) + pil 'N LANGKAH' + tokoh ceria.

| opsi | tipe |
|---|---|
| judul | `teks<=24!` |
| kunci | `teks<=10!` |
| jumlah | `angka!` |
| pose | `pose` |
| wajah | `wajah[]<=1` |

## `langkah` (konsep K7)

K7 langkah: progres N segmen + lingkaran nomor besar + kartu judul langkah + prop + tokoh ceria (ironis) + gelembung + cap BERHASIL ✓. bonus:true = langkah bonus (solusi: logo + cap hijau).

| opsi | tipe |
|---|---|
| no | `angka!` |
| total | `angka` |
| judul | `teks<=34!` |
| prop | `aset` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| ganti | `teks<=20` |
| bubble | `teks<=16` |
| cap | `teks<=14` |
| bonus | `bool` |
| tokoh | `teks<=40` |

## `horor` (konsep K8)

K8: adegan gelap bergaya CCTV: lampu berkedip, teks menegangkan muncul satu per satu (huruf merah), objek/tokoh dalam remang + getaran.

| opsi | tipe |
|---|---|
| teks | `daftar<=2:teks<=18!` |
| gambar | `aset` |
| pose | `pose` |
| wajah | `wajah[]<=2` |
| ganti | `teks<=20` |
| tokoh | `teks<=40` |
| latar | `aset` |

## `kejut` (konsep K8)

K8 jump-scare lucu: kilat putih + subjek (kucing/benda) melompat besar + tag lucu ('...cuma kucing') + guncangan kamera.

| opsi | tipe |
|---|---|
| subjek | `aset!` |
| teks | `teks<=20!` |
| stempel | `teks<=12` |
