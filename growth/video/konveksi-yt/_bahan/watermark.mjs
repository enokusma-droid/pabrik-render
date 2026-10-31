// Watermark kanan bawah channel Konveksi: "WHATSAPP" + nomor WA + web brand (turunan format-jasa/_bahan/watermark.mjs, nilai dari brand/<slug>.json).
// Pakai: node watermark.mjs <folder produksi/KODE> <brand.json>  → hasil-polos.mp4 (asli) + hasil.mp4 (berwatermark). Aman diulang.
// GPU NVENC dulu (PC), jatuh ke libx264 (CI: env JASA_CPU=1).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const dir = path.resolve(process.argv[2]);
const B = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const polos = path.join(dir, "hasil-polos.mp4"), hasil = path.join(dir, "hasil.mp4");
if (!fs.existsSync(polos)) fs.renameSync(hasil, polos);
const W = { atas: "WHATSAPP", teks: B.wa, web: B.web, margin_x: 60, y_atas: 182, y_teks: 152, y_web: 88, ukuran_web: 30, ukuran_atas: 26, ukuran_teks: 56, warna: B.wm?.warna || "0x111111@0.6", tepi: B.wm?.tepi || "white@0.55" };
fs.copyFileSync(new URL("./LeagueSpartan-Bold.ttf", import.meta.url), path.join(dir, "_wm.ttf"));
const dt = (t, size, yb, bw) => `drawtext=fontfile=_wm.ttf:text='${t}':fontsize=${size}:fontcolor=${W.warna}:borderw=${bw}:bordercolor=${W.tepi}:x=w-tw-${W.margin_x}:y=h-${yb}`;
const vf = `${dt(W.atas, W.ukuran_atas, W.y_atas, 2)},${dt(W.teks, W.ukuran_teks, W.y_teks, 3)},${dt(W.web, W.ukuran_web, W.y_web, 2)}`;
try { if (process.env.JASA_CPU) throw 0; execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "hasil-polos.mp4", "-vf", vf, "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "21", "-b:v", "0", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "hasil.mp4"], { cwd: dir }); }
catch { execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "hasil-polos.mp4", "-vf", vf, "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "hasil.mp4"], { cwd: dir }); }
fs.rmSync(path.join(dir, "_wm.ttf"));
console.log("watermark OK →", hasil);
