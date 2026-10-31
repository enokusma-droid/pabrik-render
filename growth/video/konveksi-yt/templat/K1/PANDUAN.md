# PANDUAN templat K1 — video YouTube channel Konveksi (Elite Apron, Garmen Indonesia)

Video 16:9 1920x1080 30 fps, **2-3 menit**, berbasis 1 keyword, **JUALAN SOLUSI dengan trust (bukan edukasi)**. Turunan F1/F3 format-jasa: **setiap blok VO = satu adegan beranimasi relevan**,
foto ASLI produk dari `brands/konveksi/manifest-aset.json`, palet + font + logo + suara per brand (`brand/<slug>.json`), tanpa musik latar,
watermark WA + web kanan bawah. Pilot: EA001 (apron), GI003 (bordir komputer), 31 Okt 2026.

## Kode & keyword
- `EAnnn` = Elite Apron, keyword baris `nnn` di `seo/keyword-60-elite-apron.csv`; `GInnn` = Garmen Indonesia, `seo/keyword-60-garmen-indonesia.csv`.
- Kolom `url_target` = halaman garmenindonesia.com untuk link deskripsi (seo.mjs mengecek 200).

## Alur (dari `growth/video/konveksi-yt`)
1. Tulis `produksi/<KODE>/naskah.json` (struktur di bawah). Naskah = tugas bot/agent penulis (keputusan owner: produksi oleh bot Rakazo bermodel murah).
2. `node templat/K1/buat.mjs <KODE> --cek` → gerbang naskah + unduh foto (cepat, tanpa TTS).
3. `bash ci/batch.sh siapkan <KODE...>` → TTS (suara brand, 1 job) + whisper + proyek + kirim ke CI. Render CI ±25-35 mnt.
4. `bash ci/batch.sh selesai <KODE...>` → tarik mp4 + `seo/seo.mjs` + `thumb/buat.py` + `ci/qc.py`. LIHAT `frames/qc-adegan.jpg` + `thumbnail.png`.
- Revisi naskah yang sudah pernah dirender: `ULANG=1 bash ci/batch.sh siapkan <KODE...>` (TTS ulang + render ulang lewat workflow_dispatch).
- Opsi buat.mjs: `--ulang-vo` (naskah VO diubah), `--ulang-waktu`. Teks layar/foto boleh diubah tanpa TTS ulang (hanya `teks` yang mengunci VO).
- Render PC (cadangan bila CI mati): `node templat/K1/buat.mjs <KODE>` (maks 1 render + slot berat 2, owner: PC pernah mati kepanasan).

## STRUKTUR WAJIB: jual solusi, bukan edukasi (revisi owner 31 Okt 2026)
Owner: "pendekatannya jangan edukasi, tapi selling dengan trust, jual solusi bukan produk". Sudut pandang = PEMILIK USAHA yang punya masalah,
bukan pelajaran tentang produk. DILARANG: bagian "pengertian/apa itu", tabel jenis, checklist teori, "N langkah memilih".
| # | Bagian | Blok | Isi | anim yang cocok |
|---|---|---|---|---|
| 1 | Hook masalah | 1 | PERNYATAAN masalah/akibat bisnis + keyword utuh di kalimat 1 (tim tidak kompak di depan tamu, seragam kusam bikin usaha terlihat murahan, logo bordir pecah, vendor molor saat buka cabang) | `hook` |
| 2 | Perbesar akibat | 2-3 | Akibat ke bisnis: kesan tamu, foto pelanggan di medsos, citra brand, revisi berulang, waktu habis | `kartu-coret`, `ikon-masalah`, `foto` (wajah bingung) |
| 3 | Solusi = cara kerja brand | 5-7 | Konsultasi sesuai pekerjaan tim, kirim logo → contoh desain → disetujui baru produksi, bordir logo termasuk, bahan, mulai jumlah kecil, waktu produksi jelas di awal, kirim seluruh Indonesia | `foto-lebar`, `diagram-alur`, `foto`, `fitur-grid`, `angka-besar`, `daftar-centang`, `chip-niche` |
| 4 | Bukti / trust | 2-3 | Foto ASLI hasil produksi & tim memakai seragam, proses nyata (mesin bordir), keunggulan yang memang ada (bordir awet, file jahitan disimpan) | `foto-grid`, `foto`, `perbandingan` |
| 5 | Hasil + CTA | 2 | "Tim terlihat profesional" + "Kirim logo lewat WhatsApp, kami siapkan contoh desain. Konsultasi gratis, link ada di deskripsi." | `foto-lebar`, `cta` |
- Trust HANYA dari fakta sumber. DILARANG mengarang testimoni, jumlah klien, nama klien, rating, tahun berdiri, garansi, angka yang tidak ada di sumber.
  Foto hasil disebut "hasil produksi yang sudah dipakai tim kafe dan resto", tanpa nama usaha klien.
- Contoh lulus owner-brief: `produksi/EA001/naskah.json` (apron), `produksi/GI003/naskah.json` (bordir komputer), keduanya 31 Okt revisi.
- Thumbnail menyorot MASALAH/HASIL (sebelum-sesudah, "tim terlihat profesional", "logo pecah bikin seragam murahan"), bukan "N langkah".

## Fakta & bahasa (gerbang buat.mjs menolak otomatis)
- Fakta HANYA dari `E:/WP-Project/garmenindonesia.com/DNA-BISNIS.md`, `brands/konveksi/elite-apron/brand.json`, dan artikel
  `E:/WP-Project/garmenindonesia.com/konten/rds/<slug>/article.md` yang qa.md-nya PASS (+ `fakta.json` untuk kutipan bersumber). Catat di `meta.sumber`.
- Kalimat 1 = HOOK PERNYATAAN berisi keyword UTUH (pola `growth/video/format-jasa/templat/HOOK.md`, catat `meta.hook_pola`), bukan pertanyaan.
- DILARANG: harga/biaya/tarif/murah/diskon/rb/ribu/juta, persen (termasuk DP %), "tanpa maksa/paksa", em/en dash, riba (cicilan/kredit/bunga/pinjam),
  nama mitra produksi/reseller, klaim kosong (terbesar/termurah/terbaik/nomor satu), URL/nomor diucapkan. Kata "bunga" juga ditolak (riba) → pakai "motif flora".
- Brand ditulis persis **Elite Apron** / **Garmen Indonesia**, dan wajib disebut di VO. Blok terakhir = `cta` ("Konsultasi desain gratis ... link ada di deskripsi").
- Boleh: "bordir logo sudah termasuk" (pesan utama brand, tanpa angka), minimal order (1 potong apron chef, 2 jaket chef, 6 mayoritas), "waktu produksi disampaikan sejak awal", "dikirim ke seluruh Indonesia".
- Panjang: 15-20 blok / 280-360 kata (2-3 menit; Nika ±2,2 kata/dtk, Fola ±2,3). Blok 1-2 kalimat, ≥ 2 dtk.

## Foto (orang asli)
- Hanya `boleh_dipakai=true`, bukan `getapron`, bukan poster/mockup, bukan daftar HINDARI owner (GA0751, GA0819, GA0824, HF1332, HF1349, HF1498, GA1023, FC0087).
- Utamakan `logo_terlihat` "tidak ada/tidak terbaca". Logo/nama usaha klien yang TERBACA (dada polo, papan nama, nama di punggung) WAJIB disamarkan:
  `meta.samar = {"GA1981": [[x0,y0,x1,y1], ...]}` (pecahan foto asli) → berlaku di video DAN thumbnail. Close-up bordir berlogo klien (mis. GA1428) jangan dipakai. Orang default wanita.
- Foto HF*/sebagian folder Directus 403 untuk token → pilih ID lain. Pilih dengan `python` filter manifest (produk, adegan, mutu ≥ 4) + lihat `brands/konveksi/kurasi/_hasil/thumb/<ID>.jpg`.
- Crop: `"ID:x0,y0,x1,y1"` (pecahan), mis. `"FC0104:0,0,1,0.62"` membuang logo perusahaan di bawah. Variasikan foto: jangan 1 foto > 2 kali.

## naskah.json
```json
{ "meta": { "keyword": "apron", "judul": "<= 70 huruf, diawali keyword", "hook_pola": "1 pelajari sebelum", "sumber": "...", "tag": ["4-8 tag"],
            "thumb": { "l1": "Tim terlihat", "sorot": "PROFESIONAL", "l2": "dengan apron berlogo", "stiker": "BORDIR|LOGO|TERMASUK", "foto": "GA1592",
                       "posisi": "50% 22%", "label_foto": "Sesudah", "inset": "GA1435:0.1,0.08,0.9,0.5", "label_inset": "Sebelum" },
            "samar": { "GA2057": [[0.42,0.47,0.61,0.53]] } },
  "blok": [ { "teks": "kalimat VO", "anim": "hook", "param": { ... } }, ... ] }
```
Contoh lengkap: `produksi/EA001/naskah.json`, `produksi/GI003/naskah.json`. Elemen muncul TEPAT saat kata pertamanya diucapkan → tulis label memakai kata dari VO.

## Katalog anim (15)
| anim | param | visual |
|---|---|---|
| `hook` | pill (keyword), judul (`*sorot*`), sub, foto, foto2?, posisi?, ukuran? | pil keyword, judul per kata, kartu foto miring + Ken Burns |
| `foto` | foto, sisi kanan/kiri, kicker?, nomor?, judul, ket?, poin[]?, label?, posisi?, fokus?, zoom?, sorot? | foto asli besar + teks/poin bercentang muncul saat disebut |
| `foto-grid` | kicker?, judul, foto[{id, label, posisi?}] 2-4 | kartu foto muncul saat labelnya disebut |
| `foto-lebar` | foto (LANSKAP), kicker?, judul | foto lebar + judul putih di atas gradasi |
| `tabel` | kicker?, judul, kolom[2-3], baris[[..]] 2-5, kata[]? | baris tabel muncul saat kata pemicu disebut |
| `kartu-coret` | kicker?, judul, kartu[{ikon, judul, ket}] 2-3, coret, akibat[] | cara salah dicoret merah |
| `ikon-masalah` | kicker?, judul, sub?, masalah[{ikon, teks}] 2-3 | segitiga peringatan + kartu masalah |
| `daftar-centang` | kicker?, judul, item[] 2-6, gambar? (true = kartu kanan) | centang hijau per item |
| `perbandingan` | judul?, kiri{judul, item[]}, kanan{judul, item[]}, pemicu | X vs centang, VS berputar |
| `diagram-alur` | kicker?, judul, langkah[{ikon, teks}] 3-5 | kotak + panah tergambar |
| `angka-besar` | angka (bukan statistik/harga), kicker?, label, ket?, item[]? | lingkaran tergambar + angka naik |
| `fitur-grid` | kicker?, judul, fitur[{ikon, teks, ket?}] 2-6 | kartu ikon memantul |
| `chip-niche` | kicker?, judul, pusat, ikonPusat, chip[{ikon, teks}] 3-6 | hub + chip (kota, jenis pakaian) |
| `kutipan-sorot` | teks (`*sorot*`), atribusi | kutipan, kata mengikuti VO (fakta bersumber) |
| `cta` | kicker (brand), judul, sub, tombol "Chat WhatsApp", catatan "Link ada di deskripsi" | tombol berdenyut + kursor klik |
Ikon: buku excel chat kertas jam stok laporan user toko gudang sekolah klinik kode hp web cek x kalender gembok gear roket grafik cari alert layar layer truk resto sync bintang printer rumah pena.
Variasikan urutan anim antar video; jangan > 3 blok `foto` berturut-turut.

## Gaya (per brand, `brand/<slug>.json`)
- Elite Apron: krem #F4F1EA + hitam #111 + emas #8C6A2F/#C9A25A, judul Cormorant Garamond, isi Montserrat, suara **Nika** (gaya hotel ad, dikunci owner 29 Okt).
- Garmen Indonesia: putih/#F8F7F5 + merah #931A1D/#EF4444 + teks #1F2937, League Spartan + Inter, suara sementara **Fola** (belum dikunci owner).
- Warna di `anim.mjs` = warna dasar F1 (oranye/navy) yang ditukar `buat.mjs` lewat peta `warna`. Area kanan bawah (x > 1440, y > 880) kosong untuk watermark.
- Thumbnail (`thumb/buat.py`): neo-brutalism + foto orang asli + latar putih, logo kiri atas, kata kunci di blok aksen, stiker bulat, inset close-up bordir. Logo klien terbaca → `samar`.
