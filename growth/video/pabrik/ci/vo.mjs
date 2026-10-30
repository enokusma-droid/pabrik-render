// CI: VO suara Fola lewat konten /api/tts (env KONTEN_API_KEY), DILANJUTKAN bila job/VO sudah ada di G3.
// Pakai: node vo.mjs <spec.json> <dir kerja>  → <kerja>/vo.wav + naskah.json (blok untuk waktu.py)
// G3 konten/pabrik/kerja/<kode>/: vo.wav + vo.json {hash} (VO jadi, dipakai ulang bila naskah sama), vo.job {id, hash} (job antre → dilanjutkan).
// Antrean TTS bisa lama (kuota akun Google habis = job menunggu): polling sabar s/d PABRIK_TTS_MENIT (default 60) menit.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [, , specF, kerja] = process.argv;
const spec = JSON.parse(fs.readFileSync(specF, "utf8"));
const K = process.env.KONTEN_API_KEY; if (!K) { console.error("env KONTEN_API_KEY kosong"); process.exit(1); }
const U = process.env.KONTEN_URL || "https://konten.nusawebsite.com";
const MENIT = +(process.env.PABRIK_TTS_MENIT || 60);
const PY = process.env.PY || "python3";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(kerja, { recursive: true });
const blok = spec.adegan.map((a, i) => ({ id: "b" + i, teks: String(a.teks).trim() }));
fs.writeFileSync(path.join(kerja, "naskah.json"), JSON.stringify(blok, null, 1));
const teks = blok.map((b) => b.teks).join(" ");
if (/tanpa (maksa|paksa)|tidak (maksa|paksa)|[—–]|rp\s?\d|harga|biaya|cicilan|kredit/i.test(teks)) { console.error("GERBANG: naskah melanggar larangan brand"); process.exit(1); }
// suara per brand (30 Okt 2026): Elite Apron DIKUNCI owner = Nika + gaya hotel ad (brands/konveksi/elite-apron/brand.json vo); brand lain Fola.
const SUARA = { "elite-apron": { voice: "Nika", gaya: "Warm, friendly, professional commercial voiceover speaking natural Bahasa Indonesia, upbeat but elegant, like a hotel brand ad" } };
const VOX = SUARA[spec.brand] || { voice: "Fola", gaya: "" };
const hash = crypto.createHash("sha1").update(teks + "|" + VOX.voice + (VOX.gaya ? "|" + VOX.gaya : "")).digest("hex").slice(0, 16);
const G = (...a) => execFileSync(PY, [path.join(HERE, "g3.py"), ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
const ada = (k) => { try { G("ada", k); return true; } catch { return false; } };
const KEY = `pabrik/kerja/${spec.kode}`, wav = path.join(kerja, "vo.wav");
// 1) VO sudah jadi dengan naskah sama → pakai ulang
if (ada(`${KEY}/vo.json`)) {
  G("unduh", `${KEY}/vo.json`, path.join(kerja, "vo.json"));
  if (JSON.parse(fs.readFileSync(path.join(kerja, "vo.json"), "utf8")).hash === hash && ada(`${KEY}/vo.wav`)) { G("unduh", `${KEY}/vo.wav`, wav); console.log("VO dipakai ulang dari G3", hash); process.exit(0); }
}
const api = async (p, o = {}) => { const r = await fetch(U + p, { ...o, headers: { "x-api-key": K, "content-type": "application/json", ...(o.headers || {}) } }); return r.json(); };
// 2) lanjutkan job yang tersimpan (naskah sama), kalau tidak → job baru
let id = null;
if (ada(`${KEY}/vo.job`)) {
  G("unduh", `${KEY}/vo.job`, path.join(kerja, "vo.job"));
  const j = JSON.parse(fs.readFileSync(path.join(kerja, "vo.job"), "utf8"));
  if (j.hash === hash) { try { const s = await api("/api/tts/" + j.id); if (!["gagal", "failed"].includes(s.status) && s.error !== "not found") id = j.id; } catch {} }
}
if (!id) {
  const s = await api("/api/tts", { method: "POST", body: JSON.stringify({ teks, nama: `pabrik-${spec.kode}`, voice: VOX.voice, gaya: VOX.gaya, potong: 0 }) });
  if (!s.id) { console.error("TTS POST gagal:", JSON.stringify(s).slice(0, 300)); process.exit(1); }
  id = s.id; fs.writeFileSync(path.join(kerja, "vo.job"), JSON.stringify({ id, hash })); G("unggah", path.join(kerja, "vo.job"), `${KEY}/vo.job`, "application/json");
  console.log("job TTS baru", id);
} else console.log("lanjut job TTS", id);
const t0 = Date.now(); let s = {}, n = 0;
while (!s.url && !["gagal", "failed"].includes(s.status)) {
  if (Date.now() - t0 > MENIT * 60e3) { console.error(`TTS belum selesai setelah ${MENIT} mnt (job ${id} tersimpan di G3; jalankan ulang workflow untuk melanjutkan)`); process.exit(3); }
  try { s = await api("/api/tts/" + id); } catch (e) { console.error("poll gagal (jaringan), ulang:", e.cause?.code || e.message); }
  if (!s.url && !["gagal", "failed"].includes(s.status)) { if (n++ % 12 === 0) console.log(`menunggu TTS ${id}: ${s.status || "?"} (${Math.round((Date.now() - t0) / 60e3)} mnt)`); await sleep(10000); }
}
if (!s.url) { console.error("TTS gagal:", s.status, s.error || ""); process.exit(1); }
if (s.suara && s.suara.toLowerCase() !== VOX.voice.toLowerCase()) { console.error("suara salah:", s.suara); process.exit(1); }
const url = /^https?:/.test(s.url) ? s.url : "https://imgq.nusawebsite.com" + s.url;
const mentah = path.join(kerja, "vo.mentah.wav");
fs.writeFileSync(mentah, Buffer.from(await (await fetch(url)).arrayBuffer()));
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", mentah, "-af", "highpass=f=70,afftdn=nr=12:nf=-50:tn=1,agate=threshold=0.003:ratio=3:attack=5:release=120", wav]);
fs.rmSync(mentah);
fs.writeFileSync(path.join(kerja, "vo.json"), JSON.stringify({ hash, job: id }));
G("unggah", wav, `${KEY}/vo.wav`, "audio/wav"); G("unggah", path.join(kerja, "vo.json"), `${KEY}/vo.json`, "application/json");
console.log("VO selesai", execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], { encoding: "utf8" }).trim(), "dtk");
