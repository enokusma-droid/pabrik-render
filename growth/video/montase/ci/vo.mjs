// CI: VO lewat konten /api/tts (AI Studio web). Kunci HANYA dari env KONTEN_API_KEY. Suara/gaya dari env TTS_VOICE / TTS_GAYA.
//   node vo.mjs <naskah.txt> <keluar.wav>
// Job TTS disimpan di <wav>.job supaya dijalankan ulang melanjutkan job yang sama. Suara hasil ≠ TTS_VOICE = gagal (tidak diam-diam ganti suara).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const [, , src, wav] = process.argv;
const K = process.env.KONTEN_API_KEY;
if (!K) { console.error("env KONTEN_API_KEY kosong"); process.exit(1); }
const U = "https://konten.nusawebsite.com";
const VOICE = process.env.TTS_VOICE || "Laomedeia";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const teks = fs.readFileSync(src, "utf8").trim();
if (/tanpa (maksa|paksa)|tidak (maksa|paksa)|[—–]|rp\s?\d|harga|biaya|cicilan|kredit/i.test(teks)) { console.error("GERBANG: naskah melanggar larangan brand"); process.exit(1); }
const get = async (id) => { for (let i = 0; ; i++) { try { return await fetch(`${U}/api/tts/${id}`, { headers: { "x-api-key": K } }).then((r) => r.json()); } catch (e) { if (i > 20) throw e; await sleep(5000); } } };
const jobf = wav + ".job";
let s = null;
if (fs.existsSync(jobf)) { s = await get(fs.readFileSync(jobf, "utf8").trim()); if (["gagal", "failed"].includes(s.status) || s.error === "not found") s = null; }
if (!s) {
  for (let i = 0; !s?.id; i++) {
    try {
      s = await fetch(U + "/api/tts", { method: "POST", headers: { "x-api-key": K, "content-type": "application/json" },
        body: JSON.stringify({ teks, nama: "montase-" + Date.now(), voice: VOICE, gaya: process.env.TTS_GAYA || "", potong: 0 }) }).then((r) => r.json());
    } catch (e) { if (i > 10) throw e; await sleep(5000); }
  }
  fs.mkdirSync(path.dirname(wav), { recursive: true }); fs.writeFileSync(jobf, String(s.id));
}
const id = s.id; console.log("job", id);
const t0 = Date.now();
while (!s.url && !["gagal", "failed"].includes(s.status)) {
  if (Date.now() - t0 > 60 * 60e3) throw new Error("TTS timeout " + id);
  await sleep(8000); s = await get(id);
}
if (!s.url) throw new Error("TTS gagal: " + s.status + " " + (s.error || ""));
if (s.suara && s.suara.toLowerCase() !== VOICE.toLowerCase()) throw new Error("suara salah: " + s.suara);
const url = /^https?:/.test(s.url) ? s.url : "https://imgq.nusawebsite.com" + s.url;
const mentah = wav.replace(/\.wav$/, ".mentah.wav");
fs.writeFileSync(mentah, Buffer.from(await (await fetch(url)).arrayBuffer()));
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", mentah, "-af", "highpass=f=70,afftdn=nr=12:nf=-50:tn=1,agate=threshold=0.003:ratio=3:attack=5:release=120", wav]);
console.log("selesai", execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], { encoding: "utf8" }).trim(), "dtk");
