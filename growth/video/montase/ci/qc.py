#!/usr/bin/env python3
# Lembar QC (16 frame + waktu) + meta.json hasil montase. Gerbang: durasi, resolusi, audio ada, LUFS mix ±1 dari -14.
#   python3 qc.py <kerja> <kode>
import json, os, subprocess, sys
from PIL import Image, ImageDraw

K, KODE = sys.argv[1], sys.argv[2]
f = os.path.join(K, "final.mp4")
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", f],
                               capture_output=True, text=True, check=True).stdout)
dur = float(pr["format"]["duration"])
v = next(s for s in pr["streams"] if s["codec_type"] == "video")
audio = any(s["codec_type"] == "audio" for s in pr["streams"])
W, H, N = 270, 480, 16
c = Image.new("RGB", (8 * W, 2 * (H + 30)), "white"); d = ImageDraw.Draw(c)
for i in range(N):
    t = round(dur * (i + 0.5) / N, 2); o = os.path.join(K, f"qc{i}.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", f, "-frames:v", "1", "-vf", f"scale={W}:{H}", o], check=True)
    x, y = (i % 8) * W, (i // 8) * (H + 30)
    c.paste(Image.open(o), (x, y)); d.text((x + 5, y + H + 6), f"{t}s", fill="red"); os.remove(o)
c.save(os.path.join(K, "qc.jpg"), quality=85)
mix = {}
try: mix = json.loads(open(os.path.join(K, "mix.json"), encoding="utf-8").read().strip().splitlines()[-1])
except Exception: pass
gerbang = {"resolusi": (v["width"], v["height"]) == (1080, 1920), "audio": audio, "durasi": 10 <= dur <= 90,
           "lufs": abs(float(mix.get("LUFS", -99)) + 14) <= 1}
meta = {"kode": KODE, "detik": round(dur, 2), "w": v["width"], "h": v["height"], "mix": mix, "gerbang": gerbang, "lulus": all(gerbang.values()),
        "potongan": json.load(open(os.path.join(K, "potongan.json"), encoding="utf-8")), "run": os.environ.get("GITHUB_RUN_ID", "")}
json.dump(meta, open(os.path.join(K, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps({k: meta[k] for k in ("kode", "detik", "lulus", "gerbang")}))
if not meta["lulus"]: sys.exit("QC gagal: " + json.dumps(gerbang))
