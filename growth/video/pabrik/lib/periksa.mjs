// Gerbang spec pabrik reels: skema, larangan brand, konsep, aset katalog, jumlah kata. Dipakai bangun.mjs (--periksa) dan kirim.py.
import { REG } from "./primitif.mjs";

export const KONSEP_VALID = ["K0", "K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8"];
export const MUSIK_VALID = ["ceria", "ceria2", "tegang", "horor", "haru", "promo", "upbeat", "cerita"];
// larangan brand (skill video-kolase-cerita + tts.mjs): harga/biaya/diskon/cicilan/kredit/rupiah/angka uang, riba, "tanpa maksa/paksa", em/en dash
export const LARANGAN = [
  [/harga|biaya|diskon|cicilan|kredit|rupiah|\briba\b|\bdp\b|\bpromo\b/i, "kata harga/biaya/diskon/cicilan/kredit/rupiah/riba/DP/promo"],
  [/\brp\.?\s?\d|\d+([.,]\d+)?\s?(rb|ribu|jt|juta|k)\b(?!\s*(pesanan|pasien|chat|berkas|orang|kali|data))/i, "angka uang"],
  [/(tanpa|tidak|nggak|gak|ga)\s+(maksa|paksa|memaksa|dipaksa)/i, "frasa 'tanpa maksa/paksa'"],
  [/[—–]/, "em/en dash (pakai koma/titik)"],
];
// 21 Okt uji: VO Fola nyata ±2,1 kata/dtk (76 kata = 35 dtk, 81 = 38 dtk, 84 = 45 dtk) → 80-90 kata agar 40-45 dtk
export const KATA_MIN = 80, KATA_MAX = 90;
export const jumlahKata = (spec) => spec.adegan.reduce((n, a) => n + String(a.teks || "").trim().split(/\s+/).filter(Boolean).length, 0);

const UTAMA = { dentalcare: "dc-sinta", nusawebsite: "nw-f", "ratu-bawang": "rb-ayu", "elite-apron": "ea-nadia" };

// 23 Okt (audit boros token): kata yang sulit dibaca TTS Fola di VO → ditolak SEBELUM juri, bukan ketahuan setelah render (cocok VO < 80%)
export const LAFAL = [
  [/\bkak\s+[a-z]/i, "'Kak <Nama>' terbaca menyatu ('kaksari'); pakai nama saja ('Sari') atau 'Kakak Sari'"],
  [/\bdrg\b\.?/i, "'drg.' dieja huruf; tulis 'Dokter Sinta' / 'dokter gigi'"],
  [/\d/, "angka digit di VO; tulis dengan kata ('dua belas', 'jam sepuluh')"],
  [/[&%/@#+=]/, "simbol (& % / @ # + =) dibaca aneh; tulis dengan kata"],
  [/\b(yg|dgn|utk|tdk|sdh|blm|gak|ga|nggak)\b/i, "singkatan/kata gaul ('yg', 'gak') dibaca kaku; tulis baku ('yang', 'tidak')"],
];
export function cekLafal(teks, dimana, err) {
  for (const [re, nama] of LAFAL) if (re.test(teks)) err.push(`${dimana}: sulit dibaca TTS: ${nama}: "${teks.slice(0, 70)}"`);
}

function cekLarangan(teks, dimana, err) {
  for (const [re, nama] of LARANGAN) if (re.test(teks)) err.push(`${dimana}: melanggar larangan brand (${nama}): "${teks.slice(0, 80)}"`);
}
const semuaString = (o, out = []) => { if (o == null) return out; if (typeof o === "string") out.push(o); else if (Array.isArray(o)) o.forEach((x) => semuaString(x, out)); else if (typeof o === "object") Object.values(o).forEach((x) => semuaString(x, out)); return out; };

// validasi satu nilai kolom DSL
function cekKolom(nama, dsl, v, ctx, err) {
  const wajib = dsl.endsWith("!"); const d = wajib ? dsl.slice(0, -1) : dsl;
  if (v == null || v === "") { if (wajib) err.push(`${ctx}: opsi.${nama} wajib`); return; }
  const teksDari = (x) => (typeof x === "object" && x ? x.teks : x);
  let m;
  if ((m = d.match(/^teks<=(\d+)$/))) { const t = String(teksDari(v) ?? ""); if (t.replace(/\n/g, "").length > +m[1]) err.push(`${ctx}: opsi.${nama} terlalu panjang (${t.length} > ${m[1]} huruf): "${t}"`); return; }
  if (d === "angka") { if (typeof v !== "number" || !isFinite(v)) err.push(`${ctx}: opsi.${nama} harus angka`); return; }
  if (d === "bool") { if (typeof v !== "boolean") err.push(`${ctx}: opsi.${nama} harus true/false`); return; }
  if ((m = d.match(/^pilih:(.+)$/))) { if (!m[1].split("|").includes(v)) err.push(`${ctx}: opsi.${nama} harus salah satu ${m[1]}`); return; }
  if (d === "aset") { ctx.aset.push([nama, v]); return; }
  if ((m = d.match(/^aset\[\]<=(\d+)$/))) { const a = [].concat(v); if (a.length > +m[1]) err.push(`${ctx}: opsi.${nama} maks ${m[1]} aset`); a.forEach((x) => ctx.aset.push([nama, x])); return; }
  if (d === "pose") { ctx.pose.push(v); return; }
  if ((m = d.match(/^wajah\[\]<=(\d+)$/))) { const a = [].concat(v); if (a.length > +m[1]) err.push(`${ctx}: opsi.${nama} maks ${m[1]} wajah`); a.forEach((x) => ctx.wajah.push(x)); return; }
  if ((m = d.match(/^daftar<=(\d+):teks<=(\d+)$/))) {
    const a = [].concat(v); if (a.length > +m[1]) err.push(`${ctx}: opsi.${nama} maks ${m[1]} butir`);
    a.forEach((x, k) => { const t = String(teksDari(x) ?? ""); if (!t) err.push(`${ctx}: opsi.${nama}[${k}] kosong`); if (t.length > +m[2]) err.push(`${ctx}: opsi.${nama}[${k}] terlalu panjang (${t.length} > ${m[2]}): "${t}"`); });
    return;
  }
  // tipe khusus
  const L = (arr, maks, f) => { const a = [].concat(arr); if (a.length > maks) err.push(`${ctx}: opsi.${nama} maks ${maks}`); a.forEach(f); };
  const pjg = (t, n, w) => { if (String(t ?? "").length > n) err.push(`${ctx}: opsi.${nama} ${w} terlalu panjang (> ${n}): "${t}"`); };
  switch (d) {
    case "meter": L(v, 2, (x) => { if (!x?.judul) err.push(`${ctx}: opsi.meter[].judul wajib`); pjg(x?.judul, 22, "judul"); if (x?.ke != null && typeof x.ke !== "number") err.push(`${ctx}: opsi.meter[].ke harus angka`); }); return;
    case "stat": L(v, 4, (x) => { const [lab, nil] = Array.isArray(x) ? x : [x?.label, x?.nilai]; pjg(lab, 14, "stat label"); if (typeof nil !== "number" || nil < 0 || nil > 100) err.push(`${ctx}: opsi.stat nilai 0-100`); }); if ([].concat(v).length < 3) err.push(`${ctx}: opsi.stat minimal 3 baris`); return;
    case "gag": if (v.jenis && !["galat", "chat", "lupa", "notif"].includes(v.jenis)) err.push(`${ctx}: opsi.gag.jenis = galat|chat|lupa|notif`); pjg(v.teks, 40, "gag.teks"); semuaString(v.item).forEach((t) => pjg(t, 26, "gag.item")); if (v.turun != null && typeof v.turun !== "number") err.push(`${ctx}: gag.turun = indeks stat (angka)`); return;
    case "layar[]<=3": L(v, 3, (x) => { if (!x?.ui) err.push(`${ctx}: opsi.layar[].ui wajib (id aset ui)`); else ctx.aset.push(["layar.ui", x.ui]); pjg(x?.judul, 18, "layar.judul"); }); return;
    case "app": pjg(v.judul, 20, "app.judul"); pjg(v.lencana, 10, "app.lencana"); L(v.baris || [], 4, (r) => { const [a, b, c] = [].concat(r); pjg(a, 16, "app.baris nama"); pjg(b, 26, "app.baris ket"); pjg(c, 12, "app.baris status"); }); return;
    case "pasangan": { const a = [].concat(v); if (a.length !== 2) err.push(`${ctx}: opsi.${nama} = [jam/label <=6, nama <=10]`); pjg(a[0], 6, "[0]"); pjg(a[1], 10, "[1]"); return; }
    case "pesan[]<=5": L(v, 5, (x) => { const t = teksDari(x); if (!t) err.push(`${ctx}: opsi.pesan[].teks kosong`); pjg(t, 28, "pesan.teks"); }); return;
    case "panel[]<=3": L(v, 3, (x) => { pjg(teksDari(x), 14, "panel.teks"); if (x?.gambar) ctx.aset.push(["panel.gambar", x.gambar]); }); return;
    case "sisi": ["pose"].forEach((k) => v[k] && ctx.pose.push(v[k])); [].concat(v.wajah || []).forEach((w) => ctx.wajah.push(w)); if (v.prop) ctx.aset.push(["sisi.prop", v.prop]); pjg(v.stempel, 12, "sisi.stempel"); pjg(v.bubble, 16, "sisi.bubble"); return;
    default: err.push(`${ctx}: tipe kolom tak dikenal ${d}`);
  }
}

// periksa spec terhadap registry + katalog. Kembalikan {err:[], peringatan:[]}
export function periksa(spec, katalog) {
  const err = [], warn = [];
  if (!/^[a-z0-9][a-z0-9-]{2,40}$/.test(spec.kode || "")) err.push("kode wajib: huruf kecil/angka/'-', 3-41 karakter (mis. dc-k5-007)");
  if (!UTAMA[spec.brand]) err.push(`brand harus ${Object.keys(UTAMA).join(" | ")}`);
  if (!KONSEP_VALID.includes(spec.konsep)) err.push(`konsep harus salah satu ${KONSEP_VALID.join(",")}`);
  if (!spec.judul || spec.judul.length > 80) err.push("judul wajib, maks 80 huruf");
  if (!spec.caption || spec.caption.length > 2000) err.push("caption wajib (caption IG/TikTok), maks 2000 huruf");
  if (spec.musik && !MUSIK_VALID.includes(spec.musik)) err.push(`musik harus salah satu ${MUSIK_VALID.join(",")} (kosongkan = default konsep)`);
  if (!Array.isArray(spec.adegan) || spec.adegan.length < 7 || spec.adegan.length > 16) err.push("adegan wajib 7-16 butir");
  if (err.length) return { err, peringatan: warn };
  const nk = jumlahKata(spec);
  if (nk < KATA_MIN || nk > KATA_MAX) err.push(`jumlah kata VO ${nk} (wajib ${KATA_MIN}-${KATA_MAX} kata ≈ 40-45 dtk; VO Fola ±2,1 kata/dtk)`);
  cekLarangan(spec.judul, "judul", err); cekLarangan(spec.caption, "caption", err);
  const utama = UTAMA[spec.brand], lawan = Object.values(UTAMA).filter((x) => x !== utama);
  spec.adegan.forEach((a, i) => {
    const ctx = Object.assign(new String(`adegan ${i + 1} (${a.primitif})`), { aset: [], pose: [], wajah: [] });
    if (!a.teks || !String(a.teks).trim()) err.push(`${ctx}: teks VO kosong`);
    else { cekLarangan(a.teks, `${ctx} teks`, err); cekLafal(a.teks, `${ctx} VO`, err); const n = a.teks.trim().split(/\s+/).length; if (n > 16) warn.push(`${ctx}: ${n} kata di satu adegan (ideal 4-12; adegan > 6 dtk terasa lambat)`); }
    const P = REG[a.primitif];
    if (!P) { err.push(`${ctx}: primitif tidak dikenal (lihat PRIMITIF.md)`); return; }
    if (P.konsep && !P.konsep.includes(spec.konsep)) err.push(`${ctx}: primitif ${a.primitif} hanya untuk konsep ${P.konsep.join(",")}`);
    const o = a.opsi || {};
    for (const k of Object.keys(o)) if (!(k in P.kolom) && !["jam", "hari", "hari_label", "suasana", "latar", "kata"].includes(k)) warn.push(`${ctx}: opsi.${k} tidak dipakai primitif ini`);
    for (const [k, dsl] of Object.entries(P.kolom)) cekKolom(k, dsl, o[k], ctx, err);
    semuaString(o).forEach((t) => cekLarangan(t, `${ctx} opsi`, err));
    if (o.latar) ctx.aset.push(["latar", o.latar]);
    for (const x of [].concat(a.aset || [])) ctx.aset.push(["aset", x]);
    for (const [nm, id] of ctx.aset) {
      const e = katalog[id];
      if (!e) { err.push(`${ctx}: aset "${id}" (${nm}) tidak ada di katalog`); continue; }
      if (![spec.brand, "umum"].includes(e.brand)) err.push(`${ctx}: aset "${id}" milik brand ${e.brand}, bukan ${spec.brand}`);
      if (lawan.includes(e.tokoh)) err.push(`${ctx}: aset "${id}" = tokoh utama brand lain (${e.tokoh})`);
      if ((e.tag || []).includes("ada-rupiah")) err.push(`${ctx}: aset "${id}" menampilkan angka rupiah (tag ada-rupiah) — larangan brand`);
    }
    if (o.tokoh && o.tokoh !== "utama" && o.tokoh !== "detektif") {
      // id aset tokoh-pendukung, ATAU nama tokoh (field `tokoh` katalog, mis. "dc-rina") — pemeran tetap 22 Okt
      const e = katalog[o.tokoh] || Object.values(katalog).find((x) => x.tokoh === o.tokoh && [spec.brand, "umum"].includes(x.brand) && ["tokoh-badan", "tokoh-pendukung"].includes(x.jenis));
      if (!e) err.push(`${ctx}: opsi.tokoh "${o.tokoh}" tidak ada di katalog (id aset atau nama tokoh, lihat pemeran.json)`); else if (lawan.includes(e.tokoh)) err.push(`${ctx}: opsi.tokoh = tokoh utama brand lain`);
    }
    if (o.jam && !/^\d{2}[.:]\d{2}$/.test(o.jam)) err.push(`${ctx}: opsi.jam format "07.15"`);
  });
  if (spec.adegan.at(-1).primitif !== "cta") err.push("adegan terakhir wajib primitif cta (ajakan sopan WhatsApp)");
  const hook = String(spec.adegan[0].teks || "");
  if (/^kenalin,? ini/i.test(hook) && spec.konsep !== "K0") warn.push("hook 'Kenalin, ini...' khas K0; konsep lain sebaiknya hook berbeda");
  return { err, peringatan: warn };
}
