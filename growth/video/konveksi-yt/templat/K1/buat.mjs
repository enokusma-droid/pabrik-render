// Generator video YouTube K1 channel Konveksi (Elite Apron = EAnnn, Garmen Indonesia = GInnn; nnn = nomor baris keyword-60-<slug>.csv).
// Turunan format-jasa/templat/F1/buat.mjs: setiap blok VO = satu scene beranimasi, foto ASLI dari manifest Konveksi, palet + font + logo + suara per brand.
// Pakai (dari folder mana pun): node templat/K1/buat.mjs <KODE> [--siapkan] [--ulang-vo] [--ulang-waktu]
//   --siapkan  = gerbang naskah + foto (Directus) + TTS + timing + proyek, TANPA render (PC). Render: CI (ci/proses.sh) atau PC tanpa flag (1 slot).
// Masukan: produksi/<KODE>/naskah.json. Keluaran: produksi/<KODE>/{foto/, vo/, waktu.json, proyek/, hasil.mp4, frames/, meta.json}
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ANIM, CSS } from "./anim.mjs";

const T = path.dirname(fileURLToPath(import.meta.url));           // templat/K1
const ROOT = path.resolve(T, "../..");                              // konveksi-yt
const PY = process.env.JASA_PY || "C:/Users/RIFE/AppData/Local/Programs/Python/Python310/python.exe";
const HF = ["--yes", "hyperframes@0.8.20"];
const OFF = 0.4;                                                    // VO mulai 0,4 dtk
const MANIFEST = process.env.KONVEKSI_MANIFEST || path.resolve(ROOT, "../../../brands/konveksi/manifest-aset.json");
// owner 31 Okt 2026: foto berlogo klien/watermark yang tidak boleh dipakai walau boleh_dipakai=true
const HINDARI = new Set(["GA0751", "GA0819", "GA0824", "HF1332", "HF1349", "HF1498", "GA1023", "FC0087"]);
const args = process.argv.slice(2);
const KODE = (args.find((a) => !a.startsWith("--")) || "").toUpperCase();
const opt = (n) => args.includes(n);
const SIAPKAN = opt("--siapkan") || opt("--tanpa-render");
if (!/^(EA|GI)\d{3}$/.test(KODE)) { console.error("pakai: node buat.mjs <EAnnn|GInnn> [--siapkan] [--ulang-vo] [--ulang-waktu]"); process.exit(1); }

// ---------- brand + keyword ----------
const B = JSON.parse(fs.readFileSync(path.join(ROOT, "brand", KODE.startsWith("EA") ? "elite-apron.json" : "garmen-indonesia.json"), "utf8"));
const no = parseInt(KODE.slice(2), 10);
const csv = fs.readFileSync(path.join(ROOT, B.keyword_csv), "utf8").trim().split(/\r?\n/).map((l) => l.split(","));
const kol = csv[0], row = csv.find((r) => r[0] === String(no));
if (!row) throw new Error(`keyword no ${no} tidak ada di ${B.keyword_csv}`);
const kw = Object.fromEntries(kol.map((k, i) => [k, row[i]]));
const D = path.join(ROOT, "produksi", KODE);
const raw = JSON.parse(fs.readFileSync(path.join(D, "naskah.json"), "utf8"));
const N = Array.isArray(raw) ? { blok: raw } : raw;
const blok = N.blok;
if (N.meta?.keyword && N.meta.keyword.toLowerCase() !== kw.keyword.toLowerCase()) throw new Error(`naskah untuk keyword "${N.meta.keyword}", csv no ${no} = "${kw.keyword}"`);

// ---------- foto: kumpulkan dari param ----------
const fotoSpec = [];
const jelajah = (o) => {
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if ((k === "foto" || k === "foto2") && typeof v === "string") fotoSpec.push(v);
    else if (k === "foto" && Array.isArray(v)) v.forEach((x) => x && x.id && fotoSpec.push(x.id));
    else if (typeof v === "object") jelajah(v);
  }
};
blok.forEach((b) => jelajah(b.param));
const idFoto = (s) => String(s).split(":")[0].toUpperCase();
const fotoId = [...new Set(fotoSpec.map(idFoto))];

// ---------- gerbang naskah ----------
const semua = blok.map((b) => b.teks).join("\n\n");
const BUKAN_TEKS = new Set(["posisi", "fokus", "foto", "foto2", "id", "ikon", "ikonPusat", "zoom", "ukuran", "sisi", "gambar", "sorot", "kata", "coret", "pemicu"]);
const teksLayar = (o) => (typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(teksLayar) : o && typeof o === "object" ? Object.entries(o).filter(([k]) => !BUKAN_TEKS.has(k)).flatMap(([, v]) => teksLayar(v)) : []);
const layar = blok.flatMap((b) => teksLayar(b.param || {})).join("\n") + "\n" + blok.flatMap((b) => (b.param?.sorot?.label ? [b.param.sorot.label] : [])).join("\n");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tanpaKw = (t) => t.split(new RegExp(esc(kw.keyword), "i")).join(" ").replace(/\bdua ribu\b/gi, " "); // tahun "dua ribu sebelas" bukan harga
const salah = [];
for (const [nm, t] of [["VO", semua], ["teks layar", layar]]) {
  if (/\b(tanpa|tidak|nggak|gak)\s+(maksa|paksa|memaksa|dipaksa)/i.test(t)) salah.push(`${nm}: kata "tanpa/tidak maksa|paksa"`);
  if (/[—–]/.test(t)) salah.push(`${nm}: em/en dash`);
  if (/\brp\.?\s?\d|\bharga\b|\bbiaya\b|\btarif\b|\bmurah\b|\bdiskon\b|\bjuta\b|\bribu\b|\d+\s?rb\b/i.test(tanpaKw(t))) salah.push(`${nm}: harga/biaya`);
  if (/\b(cicilan|kredit|pinjam|pinjaman|bunga|riba|gadai|koperasi)\b/i.test(t)) salah.push(`${nm}: topik riba`);
  if (/\d+\s?%|\bpersen\b/i.test(t)) salah.push(`${nm}: persen (DP/statistik jangan disebut)`);
  if (/getapron|get apron|man group|reseller|\bmitra\b/i.test(t)) salah.push(`${nm}: menyebut mitra produksi/reseller (RAHASIA)`);
  if (/terbesar|termurah|nomor satu|no\.? ?1\b|terbaik/i.test(tanpaKw(t))) salah.push(`${nm}: klaim kosong (terbesar/termurah/terbaik)`);
  for (const [rx, benar] of [[/elite\s*apron/gi, "Elite Apron"], [/garmen\s*indonesia(?!\.com)/gi, "Garmen Indonesia"]])
    for (const m of t.match(rx) || []) if (m !== benar) salah.push(`${nm}: ejaan brand "${m}" (tulis "${benar}")`);
}
if (/https?:|www\.|\.com\b|\b0\d{8,}/i.test(semua)) salah.push("VO: URL/nomor diucapkan");
const kal1 = blok[0].teks.split(/(?<=[.!?])\s/)[0];
if (kal1.includes("?")) salah.push("hook kalimat pertama berupa pertanyaan");
if (!kal1.toLowerCase().includes(kw.keyword.toLowerCase())) salah.push(`keyword "${kw.keyword}" tidak utuh di kalimat pertama`);
if (!semua.includes(B.nama)) salah.push(`nama brand "${B.nama}" tidak disebut di VO`);
for (const [i, b] of blok.entries()) if (!ANIM[b.anim]) salah.push(`blok ${i + 1}: anim "${b.anim}" tidak dikenal`);
if (blok[blok.length - 1].anim !== "cta") salah.push("blok terakhir harus cta");
const nk = semua.split(/\s+/).length;
// foto: hanya boleh_dipakai, bukan Getapron, bukan daftar HINDARI (gerbang penuh hanya di PC; CI tidak membawa manifest)
const MAN = fs.existsSync(MANIFEST) ? Object.fromEntries(JSON.parse(fs.readFileSync(MANIFEST, "utf8")).aset.map((a) => [a.id, a])) : null;
const fotoInfo = [];
for (const id of fotoId) {
  if (HINDARI.has(id)) { salah.push(`foto ${id} masuk daftar HINDARI owner (logo klien/watermark)`); continue; }
  if (!MAN) continue;
  const a = MAN[id];
  if (!a) { salah.push(`foto ${id} tidak ada di manifest`); continue; }
  if (!a.boleh_dipakai || a.getapron || a.jenis !== "foto") salah.push(`foto ${id} tidak boleh dipakai (boleh_dipakai=${a.boleh_dipakai}, getapron=${a.getapron}, jenis=${a.jenis})`);
  if (/poster|desain-mockup/.test(a.adegan) || /Pusat Konveksi/i.test(a.logo_terlihat || "")) salah.push(`foto ${id} = poster/mockup brand lain`);
  fotoInfo.push({ id, directus_id: a.directus_id, logo_terlihat: a.logo_terlihat || "", deskripsi: a.deskripsi });
}
if (salah.length) { console.error("GERBANG NASKAH GAGAL:\n- " + salah.join("\n- ")); process.exit(1); }
if (nk < 260 || nk > 420) console.warn(`PERINGATAN: ${nk} kata (target 280-400 = ±2-3 menit, owner 31 Okt)`);
const berlogo = fotoInfo.filter((x) => x.logo_terlihat && !/^(tidak ada|tidak terbaca|-)?$/i.test(x.logo_terlihat.trim()));
if (berlogo.length) console.warn("CATATAN foto dengan logo klien terlihat (pastikan kecil/tidak terbaca):\n  " + berlogo.map((x) => `${x.id}: ${x.logo_terlihat}`).join("\n  "));

// ---------- (a) foto asli → produksi/<KODE>/foto/<ID>.jpg ----------
const FD = path.join(D, "foto");
fs.mkdirSync(FD, { recursive: true });
const tokF = path.resolve(ROOT, "../../../.directus-token");
for (const id of fotoId) {
  const f = path.join(FD, id + ".jpg");
  if (fs.existsSync(f) && fs.statSync(f).size > 10000) continue;
  const info = fotoInfo.find((x) => x.id === id);
  const tok = process.env.DIRECTUS_TOKEN || (fs.existsSync(tokF) ? fs.readFileSync(tokF, "utf8").trim() : "");
  if (!info || !tok) throw new Error(`foto ${id} belum ada di ${FD} (CI: diunduh dari G3 oleh ci/proses.sh; PC: butuh manifest + .directus-token)`);
  const r = await fetch(`https://directus.nusawebsite.com/assets/${info.directus_id}?width=1600&quality=86&format=jpg`, { headers: { Authorization: "Bearer " + tok } });
  if (!r.ok) throw new Error(`unduh foto ${id} gagal: HTTP ${r.status}`);
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  console.log("foto", id, (fs.statSync(f).size / 1024).toFixed(0), "KB");
}
if (fotoInfo.length) fs.writeFileSync(path.join(FD, "daftar.json"), JSON.stringify(fotoInfo, null, 1));
if (opt("--cek")) { console.log(`CEK OK ${KODE}: gerbang lolos, ${nk} kata, ${semua.length} huruf, ${blok.length} blok, ${fotoId.length} foto`); process.exit(0); }

// ---------- (b) VO satu job (suara brand) ----------
const voDir = path.join(D, "vo"), wav = path.join(voDir, "vo.wav");
fs.mkdirSync(voDir, { recursive: true });
fs.writeFileSync(path.join(D, "naskah.txt"), semua + "\n");
const hash = crypto.createHash("md5").update(semua + "|" + B.vo.voice).digest("hex");
const hashF = path.join(voDir, "naskah.md5");
if (fs.existsSync(wav) && fs.existsSync(hashF) && fs.readFileSync(hashF, "utf8") !== hash && !opt("--ulang-vo"))
  throw new Error("naskah berubah sejak VO dibuat; jalankan dengan --ulang-vo");
if (!fs.existsSync(wav) || opt("--ulang-vo")) {
  console.log(`TTS (${B.vo.voice}, satu job, ${semua.length} huruf)…`);
  execFileSync("node", [path.join(ROOT, "_bahan/tts.mjs"), path.join(D, "naskah.txt"), wav, B.vo.voice, B.vo.gaya || ""], { stdio: "inherit" });
  fs.writeFileSync(hashF, hash);
  try { fs.unlinkSync(path.join(D, "waktu.json")); } catch {}
}

// ---------- slot PC: whisper + hyperframes check = kerja berat; owner: maks 2 proses berat serentak di PC (beberapa agent paralel) ----------
const SLOT = path.join(ROOT, ".slot");
function berat(nama, fn) {
  if (process.env.CI) return fn();
  fs.mkdirSync(SLOT, { recursive: true });
  for (;;) {
    for (const i of [1, 2]) {
      const d = path.join(SLOT, String(i));
      try { if (fs.existsSync(d) && Date.now() - fs.statSync(d).mtimeMs > 30 * 60e3) fs.rmSync(d, { recursive: true, force: true }); } catch {} // slot basi (proses mati)
      try { fs.mkdirSync(d); } catch { continue; }
      try { fs.writeFileSync(path.join(d, "pemilik"), `${KODE} ${nama} ${process.pid}`); return fn(); } finally { fs.rmSync(d, { recursive: true, force: true }); }
    }
    console.log(`menunggu slot berat PC (${nama})…`); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 15000);
  }
}

// ---------- (c) timing per blok (faster-whisper; CI memakai waktu.json dari PC) ----------
const wJ = path.join(D, "waktu.json");
if (!fs.existsSync(wJ) || opt("--ulang-waktu") || opt("--ulang-vo")) {
  const bj = path.join(D, "blok.json");
  fs.writeFileSync(bj, JSON.stringify(blok.map((b) => b.teks)));
  berat("whisper", () => execFileSync(PY, [path.join(T, "waktu.py"), wav, bj, wJ], { stdio: "inherit" }));
  fs.rmSync(bj, { force: true });
}
const W = JSON.parse(fs.readFileSync(wJ, "utf8"));
if (W.blok.length !== blok.length) throw new Error(`waktu.json ${W.blok.length} blok != naskah ${blok.length}; jalankan --ulang-waktu`);
const norm = (s) => s.toLowerCase().replace(/[^0-9a-z]/g, "");

// ---------- (d) proyek HyperFrames ----------
const P = path.join(D, "proyek"), A = path.join(P, "assets");
fs.rmSync(A, { recursive: true, force: true });
fs.mkdirSync(A, { recursive: true });
for (const f of [B.font_judul, B.font_isi, B.logo]) fs.copyFileSync(path.join(T, "assets", f), path.join(A, f));
fs.copyFileSync(wav, path.join(A, "vo.wav"));
// owner 31 Okt: logo klien yang terbaca DISAMARKAN di video & thumbnail -> naskah meta.samar = { "GA1428": [[x0,y0,x1,y1], ...] } (pecahan foto asli)
const SAMAR = N.meta?.samar || {};
function dasar(ID) {
  const src = path.join(FD, ID + ".jpg");
  if (!fs.existsSync(src)) throw new Error(`foto ${ID} tidak ada (${src})`);
  const kotak = SAMAR[ID];
  if (!kotak || !kotak.length) return src;
  const o = path.join(A, `_samar-${ID}.jpg`);
  if (!fs.existsSync(o)) {
    let fc = "[0]split=" + (kotak.length + 1) + "[v0]" + kotak.map((_, i) => `[c${i}]`).join("") + ";";
    kotak.forEach(([x0, y0, x1, y1], i) => { fc += `[c${i}]crop=iw*${x1 - x0}:ih*${y1 - y0}:iw*${x0}:ih*${y0},boxblur=lr='min(w,h)/4':lp=5:cr='min(cw,ch)/4':cp=5[b${i}];`; });
    let cur = "v0";
    kotak.forEach(([x0, y0], i) => { fc += `[${cur}][b${i}]overlay=W*${x0}:H*${y0}${i === kotak.length - 1 ? "" : `[o${i}]`};`; cur = `o${i}`; });
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-filter_complex", fc.replace(/;$/, ""), "-q:v", "3", o]);
  }
  return o;
}
function foto(spec) {
  const [id, crop] = String(spec).split(":"); const ID = id.toUpperCase();
  const src = dasar(ID);
  if (!crop) { const o = `foto-${ID}.jpg`; if (!fs.existsSync(path.join(A, o))) fs.copyFileSync(src, path.join(A, o)); return "assets/" + o; }
  const [x0, y0, x1, y1] = crop.split(",").map(Number);
  const o = `foto-${ID}-${crypto.createHash("md5").update(crop).digest("hex").slice(0, 6)}.jpg`;
  if (!fs.existsSync(path.join(A, o))) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", `crop=iw*${x1 - x0}:ih*${y1 - y0}:iw*${x0}:ih*${y0}`, "-q:v", "3", path.join(A, o)]);
  return "assets/" + o;
}

const total = +(W.durasi + OFF + 1.2).toFixed(2);
const scenes = blok.map((b, i) => {
  const t0 = i === 0 ? 0 : W.blok[i].mulai + OFF;
  const t1 = i === blok.length - 1 ? total : W.blok[i + 1].mulai + OFF;
  return { b, i, t0, t1 };
});
let html = "", js = "";
for (const s of scenes) {
  const kataB = W.kata.filter((k) => k.b === s.i);
  const dur = s.t1 - s.t0;
  if (dur < 1.6) console.warn(`PERINGATAN: blok ${s.i + 1} hanya ${dur.toFixed(1)} dtk (animasi terlalu cepat; gabung dengan blok sebelah)`);
  const jepit = (t) => Math.min(s.t1 - 0.7, Math.max(s.t0 + 0.15, t));
  const c = {
    id: "s" + (s.i + 1), t0: s.t0, t1: s.t1, dur, keyword: kw.keyword, foto,
    kata(str) {
      for (const tok of String(str || "").split(/\s+/).map(norm).filter((x) => x.length >= 3)) {
        const h = kataB.find((k) => norm(k.w) === tok) || (tok.length >= 4 && kataB.find((k) => norm(k.w).length >= 4 && (norm(k.w).startsWith(tok) || tok.startsWith(norm(k.w)))));
        if (h) return h.t + OFF;
      }
      return null;
    },
    at(str, frac) { const t = this.kata(str); return jepit(t ?? s.t0 + frac * dur); },
    kataKe(i, fb) { return kataB[i] ? kataB[i].t + OFF : fb; },
  };
  const r = ANIM[s.b.anim](s.b.param || {}, c);
  html += `\n<!-- blok ${s.i + 1} ${s.b.anim} ${s.t0.toFixed(2)}-${s.t1.toFixed(2)} -->\n` + r.html;
  js += `\n// blok ${s.i + 1} ${s.b.anim}\n` + r.js;
}
// palet brand: tukar warna dasar F1 (oranye/navy) → warna brand
let isi = CSS + "\n<<<HTML>>>\n" + html + "\n<<<JS>>>\n" + js;
for (const [a, z] of Object.entries(B.warna)) isi = isi.split(a).join(z).split(a.toLowerCase()).join(z);
const [cssB, htmlB, jsB] = [isi.split("\n<<<HTML>>>\n")[0], isi.split("\n<<<HTML>>>\n")[1].split("\n<<<JS>>>\n")[0], isi.split("\n<<<JS>>>\n")[1]];
const TEKS = B.warna["#0F172A"] || "#0F172A", L = B.latar;

const index = `<!doctype html>
<html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<title>${KODE} K1 ${kw.keyword}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face{font-family:"Spartan";src:url("assets/${B.font_judul}") format("woff2");font-weight:100 900}
@font-face{font-family:"InterF";src:url("assets/${B.font_isi}") format("woff2");font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:${L[0]}}
body{font-family:"InterF",sans-serif;color:${TEKS}}
#root{position:relative;width:100%;height:100%;overflow:hidden;background:${L[0]}}
.full{position:absolute;inset:0}
.bgb{background:radial-gradient(ellipse at 30% 20%,${L[0]} 0%,${L[1]} 60%,${L[2]} 100%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.045) 1px,transparent 1px);background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse at 50% 50%,#000 25%,transparent 80%);mask-image:radial-gradient(ellipse at 50% 50%,#000 25%,transparent 80%)}
.blob{position:absolute;border-radius:50%}
.b1{width:1000px;height:1000px;left:-360px;top:-420px;background:radial-gradient(circle,${B.blob}.18) 0%,${B.blob}0) 66%)}
.b2{width:1100px;height:1100px;left:1180px;top:420px;background:radial-gradient(circle,${B.blob}.13) 0%,${B.blob}0) 66%)}
.logo{position:absolute;top:44px;right:72px;height:${B.kode === "EA" ? 50 : 56}px;width:auto;z-index:50}
${cssB}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
<div id="bg" class="clip full" data-start="0" data-duration="${total}" data-track-index="0">
  <div class="full bgb"></div><div id="bl1" class="blob b1"></div><div id="bl2" class="blob b2"></div><div class="grid"></div>
  <img class="logo" src="assets/${B.logo}" alt="${B.nama}" />
</div>
<audio id="vo" src="assets/vo.wav" data-start="${OFF}" data-duration="${W.durasi.toFixed(2)}" data-track-index="9" data-volume="1"></audio>
${htmlB}
</div>
<script>
const tl = gsap.timeline({ paused: true });
tl.to("#bl1",{x:120,y:80,duration:${total},ease:"sine.inOut"},0);
tl.to("#bl2",{x:-140,y:-60,duration:${total},ease:"sine.inOut"},0);
${jsB}
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
</script></body></html>
`;
fs.writeFileSync(path.join(P, "index.html"), index);
fs.writeFileSync(path.join(P, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true }, authoringSkill: "general-video" }, null, 1));
fs.writeFileSync(path.join(P, "package.json"), JSON.stringify({ name: KODE.toLowerCase() + "-k1", private: true, type: "module" }, null, 1));
console.log(`proyek ${P} (${blok.length} blok, ${nk} kata, ${total} dtk, waktu: ${W.sumber.slice(0, 40)})`);

// ---------- (e) check ----------
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const ck = berat("check", () => spawnSync(npx, [...HF, "check"], { cwd: P, encoding: "utf8", shell: true, windowsHide: true }));
const ckOut = (ck.stdout || "") + (ck.stderr || "");
fs.writeFileSync(path.join(D, "check.log"), ckOut);
const err = (ckOut.match(/(\d+)\s+error/i) || [])[1];
console.log("check:", err ? `${err} error` : "lihat check.log", "| exit", ck.status);

// ---------- (f) render + watermark + frame cek ----------
const out = path.join(D, "hasil.mp4");
if (!SIAPKAN) {
  const t0 = Date.now();
  const polos = path.join(D, "hasil-polos.mp4");
  fs.rmSync(polos, { force: true });
  if (process.env.CI) execFileSync(npx, [...HF, "render", "--quiet", "-w", process.env.K1_WORKERS || "auto", "-o", polos, "."], { cwd: P, stdio: "inherit", shell: process.platform === "win32" });
  else berat("render", () => execFileSync("bash", [path.resolve(ROOT, "../format-jasa/_bahan/render-antre.sh"), "npx", ...HF, "render", "--quiet", "-o", polos.replace(/\\/g, "/"), "."], { cwd: P, stdio: "inherit" })); // PC cadangan: slot berat + maks 1 slot render
  execFileSync("node", [path.join(ROOT, "_bahan/watermark.mjs"), D, path.join(ROOT, "brand", B.slug + ".json")], { stdio: "inherit" });
  console.log(`render ${((Date.now() - t0) / 1000).toFixed(0)} dtk → ${out}`);
  const F = path.join(D, "frames");
  fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F);
  const pilih = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => scenes[Math.min(scenes.length - 1, Math.round(k * (scenes.length - 1) / 8))]);
  const ts = pilih.map((s) => +(s.t0 + Math.min(s.t1 - s.t0 - 0.5, (s.t1 - s.t0) * 0.8)).toFixed(1));
  const fs_ = ts.map((t, i) => { const o = path.join(F, `f${i}.jpg`); execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(t), "-i", out, "-frames:v", "1", "-q:v", "3", o]); return o; });
  execFileSync("ffmpeg", ["-v", "error", "-y", ...fs_.flatMap((x) => ["-i", x]), "-filter_complex", "[0][1][2]hstack=3[a];[3][4][5]hstack=3[b];[6][7][8]hstack=3[c];[a][b][c]vstack=3,scale=1920:-1", "-frames:v", "1", "-q:v", "3", path.join(F, "_grid.jpg")]);
  fs_.forEach((x) => fs.rmSync(x));
  if (fs.existsSync(out)) fs.rmSync(polos, { force: true });
}
const durasi = fs.existsSync(out) ? +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], { encoding: "utf8" }).trim() : total;
const M = N.meta || {};
fs.writeFileSync(path.join(D, "meta.json"), JSON.stringify({ kode: KODE, brand: B.nama, channel: B.channel, keyword: kw.keyword, volume: +kw.volume, url_target: kw.url_target, format: "K1", judul: M.judul || "", hook_pola: M.hook_pola || "", durasi: +durasi.toFixed(2), kata: nk, blok: blok.length, foto: fotoId, suara: B.vo.voice, waktu: W.sumber.split(" ")[0] }, null, 1));
console.log("SELESAI", KODE, kw.keyword, durasi.toFixed(1), "dtk", SIAPKAN ? "(siapkan, belum render)" : "");
