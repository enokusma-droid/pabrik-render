// Watermark nomor WA kanan bawah, identik dengan video DentalCare (formats/app-review-v3.json aturan.watermark, owner 6 Okt + 17 Okt 2026).
// Pakai: node watermark.mjs <folder produksi/KODE>  → hasil-polos.mp4 (asli) + hasil.mp4 (berwatermark). Aman diulang.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const dir = path.resolve(process.argv[2]);
const polos = path.join(dir, "hasil-polos.mp4"), hasil = path.join(dir, "hasil.mp4");
if (!fs.existsSync(polos)) fs.renameSync(hasil, polos);
const W = { atas: "WHATSAPP", teks: "0852-2627-2923", margin_x: 60, y_atas: 182, y_teks: 152, y_web: 88, web: "www.nusawebsite.com", ukuran_web: 30, ukuran_atas: 26, ukuran_teks: 56, warna: "0x0F172A@0.6", tepi: "white@0.55" };
if (process.env.JASA_WM_KONTRAS) Object.assign(W, { warna: "0x0F172A@0.85", tepi: "white@0.9" }); // latar ramai (kayu/kertas) gaya-cerita, 21 Okt 2026
if (process.env.JASA_WM_TERANG) Object.assign(W, { warna: "white@0.75", tepi: "0x0A0F1C@0.6" }); // latar gelap (F5 Reel, 18 Okt)
fs.copyFileSync(new URL("./LeagueSpartan-Bold.ttf", import.meta.url), path.join(dir, "_wm.ttf"));
const dt = (t, size, yb, bw) => `drawtext=fontfile=_wm.ttf:text='${t}':fontsize=${size}:fontcolor=${W.warna}:borderw=${bw}:bordercolor=${W.tepi}:x=w-tw-${W.margin_x}:y=h-${yb}`;
const vf = `${dt(W.atas, W.ukuran_atas, W.y_atas, 2)},${dt(W.teks, W.ukuran_teks, W.y_teks, 3)},${dt(W.web, W.ukuran_web, W.y_web, 2)}`;
// GPU dulu (NVENC GTX 1050 Ti, owner 17 Okt: CPU berat), jatuh ke libx264 bila gagal
try { if (process.env.JASA_CPU) throw 0; execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "hasil-polos.mp4", "-vf", vf, "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "21", "-b:v", "0", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", "hasil.mp4"], { cwd: dir }); }
catch { execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "hasil-polos.mp4", "-vf", vf, "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-c:a", "copy", "-movflags", "+faststart", "hasil.mp4"], { cwd: dir }); }
fs.rmSync(path.join(dir, "_wm.ttf"));
console.log("watermark OK →", hasil);
