#!/usr/bin/env node
// PABRIK REELS — spec JSON → proyek HyperFrames lengkap (GSAP & font LOKAL) + sfx.json + caption.json + meta.json.
// Pakai:
//   node bangun.mjs <spec.json> [--kerja <dir>] [--aset <dir unduhan G3>] [--umum <dir font>] [--vo vo.wav --waktu waktu.json]
//   node bangun.mjs <spec.json> --periksa      → gerbang + bangun uji (timing perkiraan 1,9 kata/dtk, tanpa aset) — dipakai kirim.py
//   node bangun.mjs --daftar                   → tulis PRIMITIF.md (katalog primitif + kolom opsi)
// Keluaran di <kerja>: proyek/index.html + assets/, sfx.json, caption.json, meta.json. Render & audio = ci/proses.sh (GitHub Actions).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mulai, f2, esc, VW, VH, AUD } from "./lib/inti.mjs";
import * as TEMA from "./lib/tema.mjs";
import { REG } from "./lib/primitif.mjs";
import { periksa, jumlahKata } from "./lib/periksa.mjs";
import * as AT from "./lib/anti-template.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const VID = path.resolve(DIR, "..");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const ada = (n) => process.argv.includes(n);

// ---------- katalog ----------
export function bacaKatalog(dir = arg("--katalog", path.join(DIR, "aset"))) {
  const K = {};
  for (const f of fs.readdirSync(dir).filter((x) => /^katalog-.*\.json$/.test(x)).sort()) {
    for (const e of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) {
      if (K[e.id]) console.warn(`PERINGATAN: id ganda ${e.id} (${f})`);
      K[e.id] = { ...e, nama: e.id + path.extname(e.g3 || ".png").toLowerCase() };
    }
  }
  return K;
}

if (ada("--daftar")) {
  const baris = ["# Primitif adegan pabrik reels", "", "Dibuat otomatis: `node growth/video/pabrik/bangun.mjs --daftar`. Satu adegan = satu blok VO = satu primitif.",
    "Kolom: `teks<=N` (\\n = baris baru), `angka`, `bool`, `aset` (id katalog), `pose`/`wajah` (nama pose/ekspresi tokoh, mis. `panik`, `kaget`), `pilih:a|b`, `daftar<=N:teks<=M` (string atau {teks,kata}); `!` = wajib.",
    "Semua adegan juga menerima: `suasana` (masalah|solusi|malam|gelap|hangat), `latar` (id aset latar), `jam` (K1, \"07.15\"), `hari` (K1, 2 = hari kedua).",
    "Elemen teks boleh `{\"teks\":\"...\",\"kata\":\"<kata VO>\"}` agar muncul tepat saat kata itu diucapkan.", ""];
  for (const [n, p] of Object.entries(REG)) {
    baris.push(`## \`${n}\`${p.konsep ? ` (konsep ${p.konsep.join(", ")})` : " (semua konsep)"}`, "", p.ket, "");
    baris.push("| opsi | tipe |", "|---|---|", ...Object.entries(p.kolom).map(([k, v]) => `| ${k} | \`${v.replace(/\|/g, "\\|")}\` |`), "");
  }
  fs.writeFileSync(path.join(DIR, "PRIMITIF.md"), baris.join("\n"));
  console.log("PRIMITIF.md ditulis:", Object.keys(REG).length, "primitif");
  process.exit(0);
}

const specF = process.argv[2];
if (!specF || specF.startsWith("--")) { console.error("pakai: node bangun.mjs <spec.json> [--kerja dir] [--periksa]"); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(specF, "utf8"));
// --nilai '<json juri>': simpan hasil sub-agent JURI ke spec (skor, rata, catatan, naskah_hash) — owner 22 Okt (juri naskah)
if (ada("--nilai")) {
  let j; try { const raw = arg("--nilai"); j = JSON.parse(fs.existsSync(raw) ? fs.readFileSync(raw, "utf8") : raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)); } catch (e) { console.error("JSON juri tidak terbaca:", e.message); process.exit(2); }
  const skor = j.skor || j; const sk = Object.fromEntries(AT.BUTIR_JURI.map((b) => [b, Number(skor[b])]));
  if (AT.BUTIR_JURI.some((b) => !(sk[b] >= 0 && sk[b] <= 10))) { console.error("skor juri wajib 0-10 untuk:", AT.BUTIR_JURI.join(", ")); process.exit(2); }
  spec.juri = { skor: sk, rata: f2(AT.BUTIR_JURI.reduce((n, b) => n + sk[b], 0) / AT.BUTIR_JURI.length), catatan: String(j.catatan || "").slice(0, 800), naskah_hash: AT.hashNaskah(spec), waktu: new Date().toISOString().slice(0, 16) };
  // 23 Okt: catat model & mode juri (borongan = 1 sub-agen menilai satu batch) — audit boros token
  const model = j.model || arg("--model"), mode = j.mode || arg("--mode");
  if (model) spec.juri.model = String(model).slice(0, 60);
  if (mode) spec.juri.mode = String(mode).slice(0, 40);
  fs.writeFileSync(specF, JSON.stringify(spec, null, 1) + "\n");
  const kurang = AT.BUTIR_JURI.filter((b) => sk[b] < AT.MIN_JURI);
  console.log(`JURI ${spec.kode}: rata ${spec.juri.rata} ${JSON.stringify(sk)}${kurang.length ? ` → DI BAWAH ${AT.MIN_JURI}: ${kurang.join(", ")} → tulis ulang lalu nilai ulang` : " → lolos juri"}`);
  process.exit(kurang.length ? 1 : 0);
}
const katalog = bacaKatalog();
const cek = periksa(spec, katalog);
cek.peringatan.forEach((w) => console.warn("PERINGATAN:", w));
if (cek.err.length) { console.error("GERBANG GAGAL:\n- " + cek.err.join("\n- ")); process.exit(1); }

const UJI = ada("--periksa") || ada("--juri") || ada("--juri-blok"), KIRA = ada("--perkiraan"); // --perkiraan: timing perkiraan tapi proyek tetap ditulis (pratinjau tata letak tanpa VO)
const KERJA = path.resolve(arg("--kerja", path.join(DIR, "kerja", spec.kode)));
const PRJ = path.join(KERJA, "proyek");
const ASET = path.resolve(arg("--aset", path.join(DIR, "_aset")));
const UMUM = path.resolve(arg("--umum", path.join(ASET, "pabrik", "umum")));
const VO = arg("--vo", path.join(KERJA, "vo.wav")), WAKTU = arg("--waktu", path.join(KERJA, "waktu.json"));
const naskah = spec.adegan.map((a, i) => ({ id: "b" + i, teks: String(a.teks).trim() }));

// waktu kata: dari waktu.py (faster-whisper) atau perkiraan 1,9 kata/dtk (--periksa)
let W;
if (!UJI && !KIRA && fs.existsSync(WAKTU)) W = JSON.parse(fs.readFileSync(WAKTU, "utf8"));
else {
  if (!UJI && !KIRA) { console.error(`waktu.json tidak ada: ${WAKTU} (jalankan waktu.py dulu, atau --periksa untuk uji)`); process.exit(1); }
  let t = 0.1; const kata = [], blok = [];
  naskah.forEach((b, bi) => { const ws = b.teks.split(/\s+/); const s0 = t; ws.forEach((w) => { kata.push({ w: w.toLowerCase().replace(/[^a-z0-9]/g, ""), b: bi, s: f2(t), e: f2(t + 0.42) }); t += 1 / 1.9; }); blok.push({ s: f2(s0), e: f2(t - 0.1) }); t += 0.35; });
  W = { durasi: f2(t), metode: "perkiraan", kata, blok };
}

// ---------- konteks video ----------
const V = mulai({ naskah, W, katalog, brand: spec.brand });
const KONSEP = spec.konsep;
V.konsep = KONSEP; V.adegan = spec.adegan;
V.utama = AT.utamaDari(spec); // owner 22 Okt: tokoh utama dirotasi dari pemeran.json (default lama: dc-sinta / nw-f)
V.aksen = TEMA.AKSEN[spec.brand]; V.solusiWarna = TEMA.SOLUSI[spec.brand];
V.pakaiUtama = 0;
V.adeganKini = 0; V.tokohPakai = {}; V.tokohAdegan = []; V.asetAdegan = []; // gerbang pemeran: tokoh manusia yang benar-benar tampil per adegan
{ const A0 = V.A; V.A = (id) => { const e = A0(id); if (e.tokoh === V.utama) V.pakaiUtama++;
  const i = V.adeganKini; (V.asetAdegan[i] ||= new Set()).add(id);
  if (e.tokoh && ["tokoh-badan", "wajah", "tokoh-pendukung"].includes(e.jenis)) { if (!(e.tokoh in V.tokohPakai)) V.tokohPakai[e.tokoh] = i; (V.tokohAdegan[i] ||= new Set()).add(e.tokoh); }
  return e; }; }
const boleh = (e) => e && [spec.brand, "umum"].includes(e.brand);
const daftar = (f) => Object.values(katalog).filter((e) => boleh(e) && f(e));
// pose tokoh: id aset langsung, atau nama pose; tidak ada → pose bergiliran (agar tiap adegan beda)
V.pose = (nama, tokoh = V.utama, giliran = 0) => {
  if (nama && katalog[nama]) { if (katalog[nama].tokoh === V.utama) V.pakaiUtama++; return nama; }
  const ps = daftar((e) => ["tokoh-badan", "tokoh-pendukung"].includes(e.jenis) && e.tokoh === tokoh && (e.pose || e.kepala)).sort((a, b) => !!b.kepala - !!a.kepala); // kartun berkepala didahulukan untuk giliran
  if (!ps.length) throw new Error(`tidak ada tokoh-badan untuk tokoh ${tokoh} di katalog`);
  // 22 Okt (pemeran baru 4 pose): pose yang diminta tidak ada → jangan jatuh ke pose bermasalah (panik/pusing/lelah/bingung) untuk adegan netral/senang
  const NEG = ["panik", "pusing", "lelah", "bingung", "stres", "masalah", "cemas"], minta = String(nama || ""), mintaNeg = NEG.some((x) => minta.includes(x));
  const cocokMood = (e) => { const neg = NEG.some((x) => (e.tag || []).includes(x) || String(e.pose || "").includes(x)); return mintaNeg ? neg : !neg; };
  const ber = ps.filter((e) => e.kepala), pool = nama ? (ber.filter(cocokMood).length ? ber.filter(cocokMood) : ber) : ber;
  const p = (nama && ps.find((e) => e.pose === nama)) || (nama && ps.find((e) => (e.tag || []).includes(nama))) || pool[giliran % Math.max(1, pool.length)] || ps[giliran % ps.length];
  if (nama && p.pose !== nama) V.log.push(`pose "${nama}" untuk ${tokoh} tidak ada → pakai ${p.id}`);
  if (tokoh === V.utama) V.pakaiUtama++;
  return p.id;
};
V.wajah = (nama, tokoh = V.utama) => {
  if (nama && katalog[nama]) return nama;
  const ws = daftar((e) => e.jenis === "wajah" && e.tokoh === tokoh);
  if (!ws.length) return null;
  const w = (nama && ws.find((e) => e.ekspresi === nama)) || (nama && ws.find((e) => (e.tag || []).includes(nama)));
  if (!w) { if (nama) V.log.push(`ekspresi "${nama}" untuk ${tokoh} tidak ada → pakai ${ws[0].id}`); return ws.find((e) => e.ekspresi === "senang")?.id || ws[0].id; }
  return w.id;
};
V.fotoUtama = () => daftar((e) => e.tokoh === V.utama && (e.tag || []).includes("foto-utama"))[0]?.id || null;
V.cariTag = (tags, jenis) => daftar((e) => (!jenis || e.jenis === jenis) && tags.every((t) => (e.tag || []).includes(t))).sort((a, b) => (a.brand === "umum") - (b.brand === "umum"))[0]?.id || null;
V.latar = (c, o = {}) => TEMA.latar(V, KONSEP, `${c.sid}bg`, c.bi, { suasana: o.suasana ?? c.o.suasana, aset: o.aset ?? c.o.latar });
const SHEET = TEMA.SHEET_BG[KONSEP] || "#2B2418";
V.scene = (c, layers, { enter = true } = {}) => {
  const s = V.bS[c.bi], e = V.bE[c.bi], last = c.bi === V.N - 1, d = f2(e - s + (last ? 0 : 0.55));
  V.html += `\n<!-- adegan ${c.bi + 1}: ${c.prim} -->\n<div id="${c.sid}" class="clip full" data-start="${s}" data-duration="${d}" data-track-index="${1 + (V.SC.length % 2)}" style="z-index:${V.z++}"><div class="sheet" id="${c.sid}w"><div class="layer" id="${c.sid}cam">${layers}</div></div><div class="full" id="${c.sid}fl" style="background:#fff;opacity:0;pointer-events:none"></div></div>`;
  if (enter && V.SC.length) TEMA.masuk(V, KONSEP, c.sid, s);
  TEMA.gerakLatar(V, KONSEP, `${c.sid}bg`, s, d);
  V.SC.push({ id: c.sid, s, e, d, prim: c.prim });
  return { s, e, d };
};

// ---------- adegan ----------
spec.adegan.forEach((a, bi) => {
  const c = { bi, sid: "s" + bi, o: a.opsi || {}, konsep: KONSEP, prim: a.primitif, s: V.bS[bi], e: V.bE[bi], d: f2(V.bE[bi] - V.bS[bi]) };
  V.adeganKini = bi;
  try { REG[a.primitif].bangun(V, c); }
  catch (e) { console.error(`GAGAL bangun adegan ${bi + 1} (${a.primitif}): ${e.message}`); process.exit(1); }
});
if (!V.pakaiUtama) { console.error(`GERBANG GAGAL: tokoh utama brand (${V.utama}) tidak muncul di adegan mana pun — pakai minimal satu adegan bertokoh (tokoh/meter/hitung/logo/cta tanpa maskot ...)`); process.exit(1); }
if (KONSEP === "K1") TEMA.hudJam(V, spec.adegan);
if (KONSEP === "K8") TEMA.hudRec(V, spec.adegan);
if (KONSEP === "K3") TEMA.hudTicker(V, spec.ticker);
// watermark IKON brand (Ratu Bawang, 22 Okt 2026): lingkaran ivory tepi emas kanan atas, hilang saat end card (adegan cta). Brand ber-ikon
// TIDAK memakai watermark nomor WA ffmpeg (meta.wm = "TANPA" → ci/proses.sh melewati watermark.mjs). Turun bila pojok dipakai HUD (K3 LIVE, K8 REC); K1 (kartu jam kanan atas) ikon di kiri atas.
if (V.profil.ikon) {
  // K1: kanan atas = kartu jam (ikon di bawahnya menutup stempel, rb-k1-003) → ikon pindah kiri atas selama K1
  const top = { K3: 150, K8: 150 }[KONSEP] || 40, kiri = KONSEP === "K1" ? 40 : VW - 40 - 128, akhir = V.bS[V.N - 1];
  V.html += `
<div id="wmikon" class="clip full" data-start="0" data-duration="${f2(akhir)}" data-track-index="8" style="z-index:850;pointer-events:none"><div style="position:absolute;left:${kiri}px;top:${top}px;width:128px;height:128px;border-radius:50%;background:#F5F1E9;border:5px solid #C6A15B;box-shadow:0 4px 10px rgba(0,0,0,.35);overflow:hidden;opacity:.92"><img src="${V.src(V.profil.ikon)}" style="position:absolute;left:8px;top:8px;width:102px;height:102px;object-fit:contain"></div></div>`;
}

{ // gerbang id ganda (pelajaran 21 Okt: tombol WA "s6w" = id lembar adegan → adegan CTA kosong 4 dtk)
  const ids = [...V.html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) { console.error("GAGAL: id elemen ganda " + [...new Set(dup)].join(",")); process.exit(1); }
}
// ---------- subtitle putih kecil per frasa (gaya referensi) ----------
const SUBTOP = TEMA.SUB_TOP[KONSEP] || 1395;
function potong(bi) {
  const raw = naskah[bi].teks.split(/\s+/), ks = V.kataBlok(bi);
  const chunks = []; let cur = [];
  raw.forEach((w, k) => {
    cur.push([w, k]);
    const pj = cur.map((t) => t[0]).join(" ").length, sisa = raw.length - k - 1;
    if ((/[,.?!]$/.test(w) && cur.length >= 2) || ((cur.length >= 4 || pj >= 24) && sisa > 1) || k === raw.length - 1) { chunks.push(cur); cur = []; }
  });
  return chunks.map((c) => ({ s: f2(Math.max(V.bS[bi] + 0.02, (ks[c[0][1]]?.s ?? V.bS[bi]) + AUD - 0.08)), txt: c.map((t) => t[0]).join(" ") }));
}
const capLog = [];
for (let bi = 0; bi < V.N; bi++) {
  const ch = potong(bi), s = V.bS[bi], d = f2(V.bE[bi] - s + 0.02);
  let inner = "";
  ch.forEach((c, k) => {
    inner += `<div class="sub" id="sb${bi}_${k}">${esc(c.txt)}</div>`;
    const end = k < ch.length - 1 ? ch[k + 1].s : f2(Math.min(V.bE[bi], (V.kataBlok(bi).at(-1)?.e ?? 0) + AUD + 0.5));
    V.K(`tl.fromTo("#sb${bi}_${k}", {opacity:0}, {opacity:1, duration:0.08, ease:"none"}, ${c.s}); tl.set("#sb${bi}_${k}", {opacity:0}, ${f2(Math.max(c.s + 0.2, end))});`);
    capLog.push({ blok: bi, mulai: c.s, teks: c.txt });
  });
  V.html += `\n<div id="cap${bi}" class="clip full" data-start="${s}" data-duration="${d}" data-track-index="${5 + (bi % 2)}" style="z-index:900;pointer-events:none">${inner}</div>`;
}

// ---------- rakit ----------
const KIT = path.join(DIR, "vendor", "kit");
const FONT = { Marker: "marker.ttf", SerifB: "serif-bold.ttf", Caveat: "caveat.ttf" };
(TEMA.FONT_KONSEP[KONSEP] || []).forEach((f) => V.font.add(f));
const css = fs.readFileSync(path.join(KIT, "kit.css"), "utf8") + `
${[...V.font].map((f) => `@font-face { font-family:"${f}"; src:url("assets/${FONT[f]}"); }`).join("\n")}
html, body { background:${SHEET}; }
.full, .layer, .lay, .sheet { position:absolute; left:0; top:0; width:${VW}px; height:${VH}px; }
.sheet { overflow:hidden; box-shadow:-30px 0 40px rgba(30,15,5,.45); background:${SHEET}; perspective:1600px; }
.cut { filter: drop-shadow(8px 16px 12px rgba(40,20,5,.45)); }
.muka { filter: drop-shadow(3px 7px 6px rgba(30,15,5,.45)); }
.kt { transform-style:preserve-3d; }
.sinar { position:absolute; left:-460px; top:-200px; width:2000px; height:2000px; opacity:.35; pointer-events:none; }
.tirai { position:absolute; left:-300px; top:-300px; width:1700px; height:2600px; pointer-events:none; mix-blend-mode:multiply; opacity:.5;
  background:repeating-linear-gradient(115deg, rgba(90,60,30,0) 0 120px, rgba(90,60,30,.35) 160px 230px, rgba(90,60,30,0) 270px 330px); filter:blur(18px); }
.sub { position:absolute; left:60px; right:60px; top:${SUBTOP}px; text-align:center; font:700 50px/1.2 'InterL'; color:#fff; opacity:0;
  text-shadow:0 0 3px rgba(0,0,0,.9), 0 3px 10px rgba(0,0,0,.75), 0 0 22px rgba(0,0,0,.35); }
`;
const out = `<!doctype html>
<html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=${VW}, height=${VH}" />
<title>${esc(spec.kode)}</title>
<script src="assets/gsap.min.js"></script>
<style>${css}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="${V.TOTAL}" data-width="${VW}" data-height="${VH}" data-fps="30">
${fs.readFileSync(path.join(KIT, "defs.html"), "utf8")}
<audio id="vo" src="assets/vo.wav" data-start="${AUD}" data-duration="${f2(W.durasi)}" data-track-index="9" data-volume="1"></audio>
${V.html}
<script>
${fs.readFileSync(path.join(KIT, "kit.js"), "utf8")}
(function(){
const tl = gsap.timeline({ paused: true });
const K = paperKit(tl, { fps: 12 });
${V.js.join("\n")}
K.boil(${V.TOTAL});
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
})();
</script></div></body></html>`;

const meta = {
  kode: spec.kode, brand: spec.brand, konsep: spec.konsep, judul: spec.judul, caption: spec.caption,
  musik: spec.musik || TEMA.MUSIK[KONSEP], wm: V.profil.ikon ? "TANPA" : TEMA.WM[KONSEP] || "KONTRAS", total: V.TOTAL, kata: jumlahKata(spec), metode_waktu: W.metode,
  adegan: V.SC.map((x) => ({ id: x.id, mulai: x.s, primitif: x.prim })), aset: [...V.aset].sort(), font: [...V.font], catatan: V.log,
};
if (UJI || ada("--juri")) {
  // gerbang anti-template + pemeran + juri (owner 22 Okt 2026) — lib/anti-template.mjs
  const ctx = { bank: AT.muatBank(DIR), riwayat: AT.muatRiwayat(DIR), REG, pemeran: AT.muatPemeran(DIR), katalog };
  if (ada("--juri")) { console.log(AT.paketJuri(spec, { ...ctx, tokohAdegan: V.tokohAdegan, asetAdegan: V.asetAdegan })); process.exit(0); }
  // 23 Okt: blok naskah saja (tanpa rubrik) untuk juri BORONGAN (juri.mjs paket)
  if (ada("--juri-blok")) { console.log(AT.blokJuri(spec, { ...ctx, tokohAdegan: V.tokohAdegan, asetAdegan: V.asetAdegan }).join(String.fromCharCode(10))); process.exit(0); }
  const r1 = AT.cekRiwayat(spec, ctx), r2 = AT.cekPemeran(spec, { pemeran: ctx.pemeran, pakai: V.tokohPakai }), r3 = ada("--tanpa-juri") ? { err: [] } : AT.cekJuri(spec); // --tanpa-juri: cek naskah sebelum juri (rakit.mjs)
  r2.warn.forEach((w) => console.warn("PERINGATAN:", w)); r1.info.forEach((w) => console.warn("CATATAN:", w));
  const gagal = [...r1.err, ...r2.err, ...r3.err];
  if (gagal.length) { console.error("GERBANG GAGAL (anti-template/pemeran/juri):\n- " + gagal.join("\n- ")); process.exit(1); }
}
if (UJI) {
  V.log.forEach((l) => console.warn("CATATAN:", l));
  console.log(JSON.stringify({ LULUS: true, kode: spec.kode, kata: meta.kata, perkiraan_dtk: f2(W.durasi), adegan: V.N, sfx: V.SFX.length, musik: meta.musik, wm: meta.wm, aset: meta.aset.map((id) => katalog[id].g3) }));
  process.exit(0);
}
fs.mkdirSync(path.join(PRJ, "assets"), { recursive: true });
fs.writeFileSync(path.join(PRJ, "index.html"), out);
fs.writeFileSync(path.join(PRJ, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { assets: "assets" }, media: { autoProxy: true }, authoringSkill: "general-video" }, null, 2));
// berkas dicari di unduhan G3 (CI) lalu cadangan lokal PC (folder kerja agen aset, font repo)
const pertama = (...k) => k.find((f) => f && fs.existsSync(f));
const salin = (dst, ...kand) => { const src = pertama(...kand); if (!src) throw new Error(`berkas tidak ada: ${kand[0]}`); fs.copyFileSync(src, path.join(PRJ, "assets", dst)); };
const FONT_PC = { "marker.ttf": "gaya-cerita/font/marker.ttf", "serif-bold.ttf": "gaya-cerita/font/serif-bold.ttf", "caveat.ttf": "konsep/K6-surat-grup-wa/font/caveat.ttf", "spartan.woff2": "uji-paper-cutout/assets/spartan.woff2", "inter.woff2": "uji-paper-cutout/assets/inter.woff2" };
salin("gsap.min.js", path.join(DIR, "vendor", "gsap.min.js"));
for (const f of ["spartan.woff2", "inter.woff2", ...[...V.font].map((f) => FONT[f])]) salin(f, path.join(UMUM, "font", f), path.join(VID, FONT_PC[f]));
if (fs.existsSync(VO)) salin("vo.wav", VO); else console.warn("PERINGATAN: vo.wav tidak ada (proyek tetap dibuat)");
for (const id of V.aset) { const e = katalog[id]; salin(e.nama, path.join(ASET, e.g3), path.join(DIR, "aset", `_kerja-${e.brand}`, "final", e.jenis, path.basename(e.g3))); }
fs.writeFileSync(path.join(KERJA, "sfx.json"), JSON.stringify({ total: V.TOTAL, isi: V.SFX.sort((a, b) => a.t - b.t) }, null, 1));
fs.writeFileSync(path.join(KERJA, "caption.json"), JSON.stringify(capLog, null, 1));
fs.writeFileSync(path.join(KERJA, "naskah.json"), JSON.stringify(naskah, null, 1));
fs.writeFileSync(path.join(KERJA, "meta.json"), JSON.stringify(meta, null, 1));
V.log.forEach((l) => console.warn("CATATAN:", l));
console.log("PROYEK OK", JSON.stringify({ kerja: KERJA, total: V.TOTAL, adegan: V.N, sfx: V.SFX.length, aset: meta.aset.length, musik: meta.musik, wm: meta.wm }));
