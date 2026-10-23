# Kontrak katalog aset pabrik reels (dibaca agen aset SEBELUM menulis katalog)

Pembaca katalog: `growth/video/pabrik/bangun.mjs` (agen mesin, 21 Okt 2026). Katalog = `growth/video/pabrik/aset/katalog-<brand>.json`
(brand `dentalcare` | `nusawebsite` | `umum`), array objek. bangun.mjs menggabung semua `katalog-*.json`.

## Field wajib (dari koordinator)
`{id, brand, jenis, tag:[...], ket, w, h, g3}` + `pose?`, `ekspresi?`, `tokoh?`, `kepala?`.
- `jenis` ∈ `tokoh-badan | wajah | tokoh-pendukung | maskot | props | latar | ui`
- `g3` = key LENGKAP di bucket `konten`, mis. `pabrik/aset/dentalcare/wajah/dc-sinta-wajah-kaget.png`
- PNG transparan (tokoh/props/maskot/wajah/pendukung potong), JPG (latar, foto penuh, screenshot UI).
- `w`,`h` = ukuran piksel berkas SEBENARNYA (dipakai untuk rasio).

## Tambahan yang DIBUTUHKAN mesin (mohon diikuti)
1. **`tokoh`** (string) wajib untuk `tokoh-badan` dan `wajah`, dan untuk foto potret tokoh utama:
   - DentalCare tokoh utama = `"dc-sinta"`; Nusawebsite model F = `"nw-f"`; detektif K5 = `"detektif"` (brand `umum`).
   - Tokoh pendukung boleh `tokoh` bebas (mis. `"resepsionis"`, `"kurir"`), opsional.
2. **`kepala`** untuk `tokoh-badan` kartun: `{x,y,w,h}` kotak RAMBUT/kepala di PNG (sama seperti `kepala.py`), koordinat piksel PNG itu sendiri.
   Badan TANPA `kepala` dianggap foto potong (ditampilkan apa adanya, tanpa tempel wajah).
3. **`pose`** untuk `tokoh-badan` = satu kata kunci pendek huruf kecil (mis. `presentasi`, `bawa-berkas`, `menulis`, `sorak`, `tunjuk`,
   `panik`, `yakin`, `lelah`, `tablet`, `jempol`, `bingung`, `lari`, `duduk-laptop`, `bawa-paket`). Unik per tokoh.
4. **`ekspresi`** untuk `wajah` (dan foto pose tokoh) = salah satu kosakata baku ini (pakai yang cocok, boleh tambah bila perlu):
   `senang, kesal, lelah, kaget, bingung, panik, lega, yakin, sedih, sebal, mikir, tertawa, cemas, tenang, curiga, serius, terharu, takut`.
   Unik per tokoh (mesin memilih wajah dengan `tokoh` + `ekspresi`).
5. **`label`** (opsional) untuk `maskot` yang punya area label kosong (map rekam medis): `{x,y,w,h}` kotak putih label → mesin menulis teks di sana.
6. **Logo**: id TETAP `dc-logo` (brand dentalcare) dan `nw-logo` (brand nusawebsite), `jenis:"ui"`, `tag:["logo"]`, PNG transparan.
7. **Foto potret tokoh utama** (untuk koran K0, polaroid, kartu tipe K4): `jenis:"tokoh-pendukung"`, `tokoh:"dc-sinta"`/`"nw-f"`,
   `tag:["foto-utama"]`, JPG/PNG setengah badan.
8. **Tag konsep** untuk latar khas konsep: tambahkan `"K5"` (papan gabus), `"K3"` (studio TV), `"K8"` (gelap/horor), `"malam"`, `"siang"`, `"klinik"`, `"toko"`.
9. **UI**: screenshot asli DentalCare `jenis:"ui"` tag nama layar (`odontogram`, `pasien`, `soap`, `dashboard`, `antrean`, `invoice`, `jadwal`).
   Nusawebsite: mesin membuat layar aplikasi HTML sendiri (tidak wajib PNG), tapi screenshot boleh ditambahkan dengan tag `app`.
10. `id` = huruf kecil `a-z0-9-`, unik lintas SEMUA katalog. Awalan disarankan: `dc-`, `nw-`, `um-`.

## Sudah dibuat agen mesin (Codex, sebelum pembagian kerja) — silakan dipakai, jangan generate ulang
Di `growth/video/pabrik/aset/gambar/` (lembar mentah latar abu, belum dipotong; prompt di `prompts.json` di folder yang sama):
- `dc-wajah-b.png` (2x2: bingung, panik, lega, yakin) · `dc-wajah-c.png` (2x2: sedih, sebal/kesal, mikir, tertawa) — drg. Sinta
- `nw-wajah-b.png` (2x2: bingung, lelah, lega, yakin) — model F
- `maskot-laptop.png` (4 pose laptop kasir: santai melambai, panik kepanasan, mati X, bangga jempol)
- `bg-dc-resepsionis.png` (latar diorama resepsionis klinik siang, 2:3, tanpa potong)
Codex akun owner kena usage limit 21 Okt ±22.20 WIB (reset "Oct 22 1:13 AM") → sisa prompt di prompts.json belum jadi.
