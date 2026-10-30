// Gerbang ANTI-TEMPLATE + PEMERAN + JURI (owner 22 Okt 2026: "terasa template/monoton" + "cerita mengada-ada").
// Dipakai bangun.mjs (--periksa, --juri, --nilai). Riwayat = spec di antrean/ (urut nomor kode, revisi -rN menggantikan aslinya).
//   1. pembuka: spec.pembuka = id pola di pembuka.json (konsep sama); id tidak dipakai 10 video terakhir brand; keluarga tidak dipakai 3 terakhir;
//      5 kata pertama VO tidak sama dengan 20 video terakhir (semua brand); 3 kata pertama tidak sama dengan 10 terakhir brand.
//   2. adegan 1: kunci (primitif + gambar/foto/maskot/latar/tokoh/pose) tidak sama dengan 10 terakhir brand; primitif adegan 1 beda dari video
//      terakhir berkonsep sama di brand itu.
//   3. pemeran: spec.pemeran {utama, pendukung[]} dari pemeran.json; maks 2 tokoh manusia; selain utama wajib diperkenalkan (kunci nama di VO/teks
//      layar adegan tempat ia muncul atau sebelumnya); utama beda dari video sebelumnya & maks 5 dari 10 terakhir brand.
//   4. juri: spec.juri {skor:{logika,pembuka,tokoh,relevansi,humor}, rata, catatan, naskah_hash}; tiap butir >= 8; hash = naskah saat dinilai.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

export const BUTIR_JURI = ["logika", "pembuka", "tokoh", "relevansi", "humor"];
export const MIN_JURI = 8;
export const UTAMA_DEFAULT = { dentalcare: "dc-sinta", nusawebsite: "nw-f", "ratu-bawang": "rb-ayu", "elite-apron": "ea-nadia" };
// deskripsi produk + dunia masalah per brand (untuk juri)
export const BRAND_JURI = {
  dentalcare: { nama: "DentalCare (aplikasi klinik gigi: rekam medis, odontogram, jadwal, antrean, data pasien, invoice, obat)", dunia: "klinik gigi" },
  nusawebsite: { nama: "Nusawebsite (jasa aplikasi custom untuk UMKM: pesanan, stok, laporan, dll.)", dunia: "UMKM Indonesia" },
  "ratu-bawang": { nama: "Ratu Bawang (pemasok bawang merah, bawang putih, bawang bombay di Jogja untuk hotel/resto/kafe: tangan pertama dari petani/pengepul, ecer & grosir, bayar saat barang sampai (COD), gratis ongkir Jogja; bukan aplikasi)", dunia: "dapur hotel/resto/kafe (HOREKA) di Jogja" },
  "elite-apron": { nama: "Elite Apron (konveksi custom seragam HORECA: apron, baju/jaket chef, seragam waiter/barista/hotel, polo; bordir logo usaha sudah termasuk; produksi 1-4 minggu tergantung DP; pesan lewat WhatsApp; bukan aplikasi)", dunia: "kafe, resto, hotel, villa di Bali/Jakarta (pemilik/manajer usaha F&B dan hospitality)" },
};
const JENIS_ORANG = ["tokoh-badan", "wajah", "tokoh-pendukung"];

const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
export const kataAwal = (spec, n) => norm(spec.adegan?.[0]?.teks).slice(0, n).join(" ");

export function bacaJSON(f) { return JSON.parse(fs.readFileSync(f, "utf8")); }
export function muatBank(DIR) { return bacaJSON(path.join(DIR, "pembuka.json")); }
export function muatPemeran(DIR) { return bacaJSON(path.join(DIR, "pemeran.json")); }

// nomor & revisi dari kode: dc-k0-031 → {num:31, rev:1, dasar:"dc-k0-031"}; dc-k4-005-r2 → {num:5, rev:2}; tanpa nomor (uji) → num 0
export function urai(kode) {
  const m = String(kode).match(/^(.*?-(\d{3}))(?:-r(\d+))?$/);
  return m ? { dasar: m[1], num: +m[2], rev: m[3] ? +m[3] : 1 } : { dasar: String(kode).replace(/-r\d+$/, ""), num: 0, rev: +(String(kode).match(/-r(\d+)$/)?.[1] || 1) };
}

// semua spec antrean (hanya revisi tertinggi per kode dasar), urut lama → baru
// PABRIK_RIWAYAT=git (dipasang cloud.sh periksa/rakit di PC, 23 Okt 2026): riwayat = sumber yang sama dengan CI, yaitu spec antrean di commit HEAD
// minus publik/tahan.txt (publik.py ekspor), ditambah kode di PABRIK_IKUT (batch yang sedang diperiksa/dikirim, dibaca dari working tree).
// Draf lokal yang belum dikirim TIDAK dihitung (dulu lolos di PC tapi gagal di CI).
function sumberRiwayat(DIR) {
  const dir = path.join(DIR, "antrean");
  if (process.env.PABRIK_RIWAYAT !== "git") return fs.readdirSync(dir).filter((x) => x.endsWith(".json")).map((f) => () => bacaJSON(path.join(dir, f)));
  const git = (args, input) => execFileSync("git", args, { cwd: DIR, input, maxBuffer: 1 << 28 });
  const rel = git(["rev-parse", "--show-prefix"]).toString().trim() + "antrean/";
  let tahan = new Set();
  try { tahan = new Set(fs.readFileSync(path.join(DIR, "publik", "tahan.txt"), "utf8").split(/\r?\n/).map((x) => x.trim()).filter((x) => x && !x.startsWith("#"))); } catch {}
  const ikut = new Set(String(process.env.PABRIK_IKUT || "").split(/[,\s]+/).filter(Boolean));
  const nama = git(["ls-tree", "--full-tree", "--name-only", "HEAD", rel]).toString().split("\n").map((p) => path.posix.basename(p)).filter((f) => f.endsWith(".json") && !tahan.has(f.slice(0, -5)) && !ikut.has(f.slice(0, -5)));
  const out = git(["cat-file", "--batch"], nama.map((f) => `HEAD:${rel}${f}`).join("\n") + "\n");
  const isi = []; let i = 0;
  while (i < out.length) {
    const nl = out.indexOf(10, i); const kepala = out.slice(i, nl).toString().split(" "); i = nl + 1;
    if (kepala[1] !== "blob") continue; const n = +kepala[2];
    const b = out.slice(i, i + n).toString("utf8"); i += n + 1; isi.push(() => JSON.parse(b));
  }
  for (const k of ikut) { const f = path.join(dir, `${k}.json`); if (fs.existsSync(f)) isi.push(() => bacaJSON(f)); }
  return isi;
}
export function muatRiwayat(DIR) {
  const per = {};
  for (const baca of sumberRiwayat(DIR)) {
    let s; try { s = baca(); } catch { continue; }
    if (!s.kode || !s.brand || !Array.isArray(s.adegan) || !s.adegan.length) continue;
    const u = urai(s.kode); const lama = per[u.dasar];
    if (!lama || u.rev > lama.rev) per[u.dasar] = { ...u, kode: s.kode, spec: s };
  }
  return Object.values(per).sort((a, b) => a.num - b.num || a.kode.localeCompare(b.kode));
}
// riwayat sebelum spec ini (nomor lebih kecil, kode dasar beda), opsional per brand, n terakhir (terbaru di akhir)
export function sebelum(riwayat, spec, { brand, n } = {}) {
  const u = urai(spec.kode);
  const r = riwayat.filter((x) => x.dasar !== u.dasar && x.num < u.num && (!brand || x.spec.brand === brand));
  return n ? r.slice(-n) : r;
}

export const utamaDari = (spec) => spec.pemeran?.utama || UTAMA_DEFAULT[spec.brand];

// pola pembuka: field spec.pembuka, atau dikenali dari regex pola di konsep yang sama (video lama)
export function pembukaDari(spec, bank) {
  if (spec.pembuka) return spec.pembuka;
  const teks = String(spec.adegan?.[0]?.teks || "").trim();
  for (const p of bank.pola[spec.konsep] || []) if (p.regex && new RegExp(p.regex, "i").test(teks)) return p.id;
  return null;
}
export const polaById = (bank, id) => Object.values(bank.pola).flat().find((p) => p.id === id) || null;

// kunci visual adegan 1
const KOLOM_VISUAL = ["foto", "gambar", "maskot", "subjek", "reporter", "saksi", "prop", "latar", "tokoh", "pose", "suasana"];
export function kunciAdegan1(spec, REG) {
  const a = spec.adegan[0], o = a.opsi || {}, kol = REG[a.primitif]?.kolom || {};
  const bag = [a.primitif];
  for (const k of KOLOM_VISUAL) if (o[k] != null && o[k] !== "") bag.push(`${k}=${[].concat(o[k]).join("+")}`);
  if (!o.tokoh && ("pose" in kol || "tokoh" in kol)) bag.push(`tokoh=${utamaDari(spec)}`);
  if (a.primitif === "koran" && !o.foto) bag.push(`foto=${utamaDari(spec)}`);
  return bag.join(" | ");
}

export function hashNaskah(spec) {
  const isi = JSON.stringify([spec.judul, spec.pembuka || null, spec.pemeran || null, spec.adegan.map((a) => [a.teks, a.primitif, a.opsi || {}])]);
  return crypto.createHash("sha1").update(isi).digest("hex").slice(0, 12);
}

// ---------- gerbang 1+2+rotasi utama (tanpa bangun) ----------
export function cekRiwayat(spec, { bank, riwayat, REG, pemeran }) {
  const err = [], info = [];
  const brandR = sebelum(riwayat, spec, { brand: spec.brand });
  const pola = bank.pola[spec.konsep] || [];
  const ids = pola.map((p) => p.id);
  const pakaiPola = brandR.slice(-10).map((x) => ({ kode: x.kode, id: pembukaDari(x.spec, bank) })).filter((x) => x.id);
  const larang = new Map(pakaiPola.map((x) => [x.id, x.kode]));
  const kel3 = new Map(brandR.slice(-3).map((x) => { const id = pembukaDari(x.spec, bank); return [polaById(bank, id)?.keluarga, x.kode]; }).filter((x) => x[0]));
  const bolehPola = pola.filter((p) => !larang.has(p.id) && !kel3.has(p.keluarga)).map((p) => p.id);
  // 1a. field pembuka
  if (!spec.pembuka) err.push(`pembuka: field "pembuka" wajib (id pola ${spec.konsep} di pembuka.json). Yang boleh sekarang: ${bolehPola.join(", ") || "(tidak ada, pilih konsep lain)"}`);
  else if (!ids.includes(spec.pembuka)) err.push(`pembuka: "${spec.pembuka}" bukan pola konsep ${spec.konsep}. Pilihan: ${ids.join(", ")}`);
  else {
    if (larang.has(spec.pembuka)) err.push(`pembuka: pola "${spec.pembuka}" sudah dipakai di 10 video terakhir ${spec.brand} (${larang.get(spec.pembuka)}). Yang boleh: ${bolehPola.join(", ")}`);
    const kel = polaById(bank, spec.pembuka).keluarga;
    if (kel3.has(kel)) err.push(`pembuka: keluarga "${kel}" sudah dipakai di 3 video terakhir ${spec.brand} (${kel3.get(kel)}). Yang boleh: ${bolehPola.join(", ")}`);
  }
  // 1b. teks pembuka cocok regex pola lain (label tidak jujur / pola lama terselip)
  const t0 = String(spec.adegan[0].teks || "").trim();
  if (spec.pembuka) for (const p of pola) if (p.regex && p.id !== spec.pembuka && new RegExp(p.regex, "i").test(t0)) err.push(`pembuka: kalimat pertama "${t0.slice(0, 60)}" berpola "${p.id}" (${p.pola}), bukan "${spec.pembuka}". Tulis ulang kalimat pertama sesuai pola yang dipilih.`);
  // 1c. kata pertama
  const k5 = kataAwal(spec, 5), k3 = kataAwal(spec, 3);
  for (const x of [...new Set(riwayat.map((r) => r.spec.brand))].flatMap((b) => sebelum(riwayat, spec, { brand: b, n: 20 })))
    if (k5 && kataAwal(x.spec, 5) === k5) err.push(`pembuka: 5 kata pertama VO "${k5}" sama persis dengan ${x.kode} (20 video terakhir)`);
  for (const x of brandR.slice(-10)) if (k3 && kataAwal(x.spec, 3) === k3) err.push(`pembuka: 3 kata pertama VO "${k3}" sama dengan ${x.kode} (10 video terakhir ${spec.brand})`);
  // 2. adegan 1
  const kunci = kunciAdegan1(spec, REG);
  for (const x of brandR.slice(-10)) if (kunciAdegan1(x.spec, REG) === kunci) err.push(`adegan 1: kombinasi visual "${kunci}" sama dengan ${x.kode} (10 video terakhir ${spec.brand}). Ganti primitif/gambar/foto/latar/pose/tokoh.`);
  const samaKonsep = brandR.filter((x) => x.spec.konsep === spec.konsep).at(-1);
  if (samaKonsep && samaKonsep.spec.adegan[0].primitif === spec.adegan[0].primitif)
    err.push(`adegan 1: primitif "${spec.adegan[0].primitif}" sama dengan video ${spec.konsep} terakhir ${spec.brand} (${samaKonsep.kode}). Buka dengan primitif lain (saran pola: ${pola.find((p) => p.id === spec.pembuka)?.awal?.join("/") || "lihat pembuka.json"}).`);
  // 3a. rotasi tokoh utama
  const ut = utamaDari(spec), prev = brandR.at(-1);
  if (prev && utamaDari(prev.spec) === ut) err.push(`pemeran: tokoh utama "${ut}" sama dengan video sebelumnya ${spec.brand} (${prev.kode}). Pilih utama lain dari pemeran.json: ${(pemeran[spec.brand] || []).filter((p) => p.utama && p.id !== ut && (!p.konsep || p.konsep.includes(spec.konsep))).map((p) => p.id).join(", ")}`);
  // hitung hanya video era pemeran (punya field pemeran); 60 video lama semuanya default (Sinta/model F) dan akan mengunci rotasi selamanya
  const n10 = brandR.slice(-10).filter((x) => x.spec.pemeran && utamaDari(x.spec) === ut).length;
  if (n10 >= 5) err.push(`pemeran: tokoh utama "${ut}" sudah jadi utama di ${n10} dari 10 video terakhir ${spec.brand} (maks 5 termasuk ini). Pilih utama lain.`);
  info.push(`pembuka=${spec.pembuka || "-"} | adegan1=${kunci} | utama=${ut} | 5kata="${k5}"`);
  return { err, info };
}

// ---------- gerbang 3 (setelah bangun: tokoh yang benar-benar tampil) ----------
// pakai = {tokoh: indeks adegan pertama tampil}; katalog untuk jenis
export function cekPemeran(spec, { pemeran, pakai }) {
  const err = [], warn = [];
  const daftar = pemeran[spec.brand] || []; const byId = Object.fromEntries(daftar.map((p) => [p.id, p]));
  const pm = spec.pemeran;
  if (!pm || !pm.utama) { err.push(`pemeran: field "pemeran": {"utama": "<id>", "pendukung": ["<id>"]} wajib. Daftar ${spec.brand}: ${daftar.map((p) => `${p.id} (${p.nama}, ${p.peran})`).join("; ")}`); return { err, warn }; }
  const dekl = [pm.utama, ...[].concat(pm.pendukung || [])];
  for (const id of dekl) {
    const p = byId[id];
    if (!p) { err.push(`pemeran: "${id}" bukan pemeran tetap ${spec.brand} (pemeran.json)`); continue; }
    if (p.konsep && !p.konsep.includes(spec.konsep)) err.push(`pemeran: "${id}" (${p.nama}) hanya untuk konsep ${p.konsep.join(",")}`);
  }
  if (byId[pm.utama] && !byId[pm.utama].utama) err.push(`pemeran: "${pm.utama}" (${byId[pm.utama].nama}) tidak boleh jadi tokoh utama`);
  if (new Set(dekl).size > 2) err.push(`pemeran: maks 2 tokoh per video (utama + 1 pendukung), dideklarasikan ${dekl.length}: ${dekl.join(", ")}`);
  const tampil = Object.keys(pakai);
  for (const t of tampil) {
    if (!byId[t]) err.push(`pemeran: tokoh "${t}" tampil di adegan ${pakai[t] + 1} tapi bukan pemeran tetap ${spec.brand} (lihat pemeran.json "bukan_pemeran") → ganti aset/tokoh`);
    else if (!dekl.includes(t)) err.push(`pemeran: tokoh "${t}" (${byId[t].nama}) tampil di adegan ${pakai[t] + 1} tapi tidak ada di spec.pemeran`);
  }
  if (tampil.length > 2) err.push(`pemeran: ${tampil.length} tokoh manusia tampil (${tampil.join(", ")}); maks 2 per video. Ganti tersangka/saksi/foto dengan benda/maskot.`);
  if (!tampil.includes(pm.utama)) err.push(`pemeran: tokoh utama "${pm.utama}" tidak tampil di adegan mana pun`);
  for (const id of [].concat(pm.pendukung || [])) if (!tampil.includes(id)) warn.push(`pemeran: pendukung "${id}" dideklarasikan tapi tidak tampil`);
  // perkenalan: kunci nama/peran di VO adegan 0..i atau teks layar adegan i
  const str = (o, out = []) => { if (o == null) return out; if (typeof o === "string") out.push(o); else if (Array.isArray(o)) o.forEach((x) => str(x, out)); else if (typeof o === "object") Object.entries(o).forEach(([k, v]) => { if (!["gambar", "foto", "maskot", "subjek", "prop", "latar", "tokoh", "pose", "wajah", "reporter", "saksi", "ui", "kiri"].includes(k) || typeof v !== "string") str(v, out); }); return out; };
  const ada = (teks, kunci) => { const w = norm(teks).join(" "); return kunci.some((k) => new RegExp(`\\b${k}\\b`).test(w)); };
  for (const t of tampil) {
    const p = byId[t]; if (!p) continue; const i = pakai[t];
    const vo = spec.adegan.slice(0, i + 1).map((a) => a.teks).join(" "), layar = str(spec.adegan[i].opsi || {}).join(" ");
    if (t === pm.utama) { if (!ada(spec.adegan.map((a) => a.teks).join(" "), p.kunci)) warn.push(`pemeran: nama tokoh utama ${p.nama} tidak pernah disebut di VO`); continue; }
    if (!ada(vo + " " + layar, p.kunci)) err.push(`pemeran: ${p.nama} (${t}) muncul di adegan ${i + 1} tanpa diperkenalkan. Sebut "${p.kunci[0]}" di VO adegan itu/sebelumnya atau di teks layarnya (mis. "ini ${p.nama}, ${p.peran.split(" (")[0]}").`);
  }
  return { err, warn };
}

// ---------- gerbang 4: juri ----------
export function cekJuri(spec) {
  const err = [], j = spec.juri;
  const h = hashNaskah(spec);
  if (!j || typeof j !== "object" || !j.skor) { err.push(`juri: field "juri" wajib. Jalankan sub-agent JURI independen: \`cloud.sh juri <kode>\` → beri keluarannya SAJA ke sub-agent → simpan hasil dengan \`cloud.sh nilai <kode> '<json juri>'\` (CLOUD.md langkah JURI)`); return { err, hash: h }; }
  for (const b of BUTIR_JURI) {
    const v = j.skor[b];
    if (typeof v !== "number" || v < 0 || v > 10) err.push(`juri: skor.${b} wajib angka 0-10`);
    // 30 Okt 2026: owner boleh meloloskan naskah di bawah ambang untuk dinilai langsung (spec.juri.izin_owner = "<tanggal> — alasan"); skor asli tetap tercatat
    else if (v < MIN_JURI && !j.izin_owner) err.push(`juri: ${b} = ${v} (< ${MIN_JURI}) → TULIS ULANG naskah sesuai catatan juri lalu nilai ulang. Catatan: ${String(j.catatan || "").slice(0, 300)}`);
  }
  if (j.naskah_hash !== h) err.push(`juri: naskah berubah setelah dinilai (hash ${j.naskah_hash || "-"} ≠ ${h}) → nilai ulang dengan sub-agent juri baru`);
  return { err, hash: h };
}

// format konsep (skill video-kolase-cerita) — diberikan ke juri agar tidak menghukum ciri format (mis. twist narator benda di K0)
export const KONSEP_DESK = {
  K0: "roasting sayang: tokoh dipuji lalu kelemahan lucunya dibongkar; twist: narator ternyata BENDA yang paling menderita ('Iya, aku.'), lalu benda pensiun setelah klinik/toko pindah ke produk.",
  K1: "sehari dalam hidup: kartu jam berjalan, kejadian per jam, kalender disobek ke HARI 2 setelah pindah ke produk, hari kedua dibandingkan.",
  K2: "dulu vs sekarang: layar terbelah, kiri versi lama (manual) dan kanan versi baru (pakai produk) mengalami kejadian yang sama bersamaan.",
  K3: "parodi berita TV: studio, reporter, wawancara saksi/pakar, ticker; kejadian sehari-hari diberitakan dramatis.",
  K4: "tipe-tipe ala kartu game: beberapa tipe orang menghadapi situasi yang sama, tiap kartu punya statistik & kelemahan, penonton diajak memilih.",
  K5: "detektif noir: kasus kecil (berkas/jadwal hilang) diselidiki detektif wanita, tersangka diperiksa, pelaku ternyata sistem manual, solusi produk.",
  K6: "surat terbuka dari BENDA (orang pertama, haru-lucu) kepada pemiliknya: keluh kesah lalu pensiun setelah pindah ke produk.",
  K7: "tutorial salah (ironi): host ceria mengajarkan langkah-langkah yang justru bikin kacau, langkah bonus = solusi produk.",
  K8: "horor-komedi 'sebelum terlambat': suasana CCTV gelap, ketegangan dari masalah nyata, satu jump-scare lucu yang ternyata hal biasa, lalu hangat setelah pakai produk.",
};

// ---------- paket untuk juri (naskah saja + rubrik, TANPA alasan penulis) ----------
// 23 Okt 2026 (audit boros token): juri BORONGAN = 1 sub-agen menilai banyak naskah sekaligus → rubrik sekali (rubrikJuri) + blok per naskah (blokJuri).
export function rubrikJuri(brands) {
  const L = [];
  L.push("Kamu JURI NASKAH independen untuk Reel komedi paper 9:16 (±40 dtk). Produk per brand:");
  for (const b of brands) L.push(`- ${b}: ${(BRAND_JURI[b] || BRAND_JURI.nusawebsite).nama}; dunia masalah: ${(BRAND_JURI[b] || BRAND_JURI.nusawebsite).dunia}`);
  L.push("Nilai HANYA dari naskah. Kamu tidak tahu niat penulis; jangan menebak maksud yang tidak tertulis. Galak tapi adil. Tiap naskah dinilai sendiri-sendiri.");
  L.push("", "RUBRIK (tiap butir 0-10, 8 = layak tayang, < 8 = wajib tulis ulang):");
  L.push("- logika: sebab-akibat tiap adegan nyambung ke adegan berikutnya; tidak ada kejadian acak, kebetulan absurd, atau lompatan; masalah → akibat → solusi masuk akal di dunia nyata.");
  L.push("- pembuka: kalimat pertama memancing dan TIDAK mirip pembuka video terakhir brand itu (daftar per naskah); bukan klise. Riwayat = HANYA daftar \"Pembuka N video terakhir\" milik naskah itu; naskah lain di paket ini BUKAN riwayat (jangan bilang \"sudah dipakai\" bila kalimatnya tidak ada di daftar itu).");
  L.push("  WAJIB langsung jelas dalam 3 detik: penonton paham siapa/apa masalahnya tanpa menafsirkan. Kiasan/teka-teki yang perlu ditafsirkan (mis. \"Kue Sari tidak pernah miring\") = maks 5.");
  L.push("- tokoh: setiap orang yang tampil jelas siapa (nama/peran disebut sebelum/saat muncul), maks 2 tokoh, perannya konsisten dan wajar di tempat itu.");
  L.push("- relevansi: masalahnya NYATA di dunia brand itu; fitur/layanan produk yang ditunjukkan benar-benar menjawab masalah yang diceritakan; tidak menjanjikan hal di luar produk/layanan.");
  L.push("- humor: lucu karena situasinya relate/ironi, bukan karena hal mustahil atau dipaksakan; nada sopan.");
  L.push("FORMAT KONSEP (disetujui owner; nilai cerita DI DALAM format, format itu sendiri bukan kesalahan):");
  return L;
}
export function blokJuri(spec, { riwayat, pemeran, tokohAdegan, asetAdegan, katalog }, { pembukaN = 10 } = {}) {
  const byId = Object.fromEntries((pemeran[spec.brand] || []).map((p) => [p.id, p]));
  const str = (o, out = []) => { if (o == null) return out; if (typeof o === "string") { if (!katalog[o]) out.push(o); } else if (Array.isArray(o)) o.forEach((x) => str(x, out)); else if (typeof o === "object") Object.entries(o).forEach(([k, v]) => { if (!["pose", "wajah", "tokoh", "suasana", "format", "rarity", "jenis", "sisi"].includes(k)) str(v, out); }); return out; };
  const L = [];
  L.push(`### ${spec.kode} | brand ${spec.brand} | konsep ${spec.konsep} | judul "${spec.judul}"`);
  L.push(`Pembuka ${pembukaN} video terakhir ${spec.brand}: ` + sebelum(riwayat, spec, { brand: spec.brand, n: pembukaN }).map((x) => `"${String(x.spec.adegan[0].teks).slice(0, 70)}"`).join(" / "));
  const pm = spec.pemeran || {}; L.push(`Pemeran: ${[pm.utama, ...[].concat(pm.pendukung || [])].filter(Boolean).map((id) => byId[id] ? `${byId[id].nama} (${byId[id].peran.split(" (")[0]})` : id).join("; ")}`);
  spec.adegan.forEach((a, i) => {
    const orang = [...(tokohAdegan[i] || [])].map((t) => byId[t]?.nama || t);
    const benda = [...(asetAdegan[i] || [])].map((id) => katalog[id]).filter((e) => e && !JENIS_ORANG.includes(e.jenis) && e.jenis !== "latar").map((e) => e.ket.split(/[,(]/)[0].trim()).slice(0, 3);
    L.push(`${i + 1}. [${a.primitif}${orang.length ? "; tampil: " + orang.join(", ") : ""}${benda.length ? "; gambar: " + benda.join(" / ") : ""}] VO: "${a.teks}"${str(a.opsi || {}).length ? ` | layar: ${str(a.opsi).map((s) => `"${s}"`).join(", ")}` : ""}`);
  });
  return L;
}
export const JAWAB_JURI_BATCH = "Balas HANYA JSON array, satu objek per naskah: [{\"kode\":\"...\",\"skor\":{\"logika\":n,\"pembuka\":n,\"tokoh\":n,\"relevansi\":n,\"humor\":n},\"catatan\":\"masalah terpenting + saran konkret per adegan (maks 300 huruf)\"}]";
// paket satu naskah (jalur lama, tetap didukung)
export function paketJuri(spec, ctx) {
  const L = rubrikJuri([spec.brand]);
  L.push(`- ${spec.konsep}: ${KONSEP_DESK[spec.konsep] || "-"}`, "", ...blokJuri(spec, ctx));
  L.push("", "Balas HANYA JSON satu baris: {\"skor\":{\"logika\":n,\"pembuka\":n,\"tokoh\":n,\"relevansi\":n,\"humor\":n},\"catatan\":\"masalah paling penting + saran perbaikan konkret per adegan (maks 400 huruf)\"}");
  return L.join("\n");
}
