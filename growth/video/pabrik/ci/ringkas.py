#!/usr/bin/env python3
# CI: lembar kontak QC (12 frame merata + 1 frame tiap tengah adegan) + hasil.json (meta + qc + mix + durasi + lulus_qc).
# Pakai: python3 ringkas.py <dir kerja> <kode>
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw
ker, k = sys.argv[1], sys.argv[2]
f = os.path.join(ker, "final.mp4")
d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode().strip())
m = json.load(open(os.path.join(ker, "meta.json"), encoding="utf-8"))
akhir = lambda p: json.loads(open(os.path.join(ker, p), encoding="utf-8").read().strip().splitlines()[-1])
q, mx = akhir("qc.json"), akhir("mix.json")
mulai = [a["mulai"] for a in m["adegan"]] + [d]
waktu = [round((mulai[i] + mulai[i + 1]) / 2 + 0.5, 2) for i in range(len(mulai) - 1)]
W, H = 270, 480
with tempfile.TemporaryDirectory() as T:
    ims = []
    for i, t in enumerate(waktu):
        p = os.path.join(T, f"{i}.jpg")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(min(t, d - 0.1)), "-i", f, "-frames:v", "1", "-vf", f"scale={W}:{H}", p], check=True)
        ims.append((t, Image.open(p).convert("RGB")))
    kol = 6; bar = (len(ims) + kol - 1) // kol
    sheet = Image.new("RGB", (kol * (W + 6) + 6, bar * (H + 30) + 6), (34, 34, 34)); dr = ImageDraw.Draw(sheet)
    for i, (t, im) in enumerate(ims):
        x, y = 6 + (i % kol) * (W + 6), 6 + (i // kol) * (H + 30)
        sheet.paste(im, (x, y)); dr.text((x + 4, y + H + 6), f"{i + 1}. {m['adegan'][i]['primitif']} @{t:.1f}s", fill=(255, 220, 0))
    sheet.save(os.path.join(ker, "qc.jpg"), quality=82)
# cocok VO longgar: Whisper sering salah eja kata benar ("pasian", "antrian", "dibuku") → kata transkrip dianggap cocok bila mirip ≥ 0,75 dengan kata naskah
import difflib, re
nk = set(re.findall(r"[a-z0-9]+", " ".join(b["teks"] for b in json.load(open(os.path.join(ker, "naskah.json"), encoding="utf-8"))).lower()))
tk = re.findall(r"[a-z0-9]+", (q.get("transkrip") or "").lower())
q["cocok_longgar_%"] = round(100 * sum(1 for w in tk if w in nk or difflib.get_close_matches(w, nk, 1, 0.75)) / max(1, len(tk)))
lulus = abs((q.get("LUFS") or 0) + 14) <= 1 and (q.get("TP") is None or q["TP"] <= -1.0) and q["cocok_longgar_%"] >= 80 and 36 <= d <= 52
# hash perseptual (dHash 64-bit) 3 frame ±3 dtk pertama → balik.py menandai video yang pembukanya mirip (owner 22 Okt: anti-template)
def dhash(t):
    with tempfile.TemporaryDirectory() as T2:
        p = os.path.join(T2, "f.png"); subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", f, "-frames:v", "1", "-vf", "scale=9:8,format=gray", p], check=True)
        px = list(Image.open(p).convert("L").getdata())
    return "%016x" % sum(1 << i for i in range(64) if px[(i // 8) * 9 + i % 8] > px[(i // 8) * 9 + i % 8 + 1])
try: m["phash_awal"] = [dhash(t) for t in (0.8, 1.8, 2.8)]
except Exception as e: print("phash gagal:", e)
m.update({"durasi": round(d, 2), "qc": q, "mix": mx, "lulus_qc": lulus, "g3": f"pabrik/hasil/{k}.mp4", "run": os.environ.get("GITHUB_RUN_ID")})
json.dump(m, open(os.path.join(ker, "hasil.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("QC", k, "durasi", round(d, 1), "LUFS", q.get("LUFS"), "TP", q.get("TP"), "cocok", q.get("cocok_naskah_%"), "LULUS", lulus)
