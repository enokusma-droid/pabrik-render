#!/usr/bin/env python3
# CI: unduh semua bahan satu spec dari G3 → aset katalog (_aset/<g3 key>), font (_aset/pabrik/umum/font), musik + SFX (ke folder _musik/_sfx
# di sebelah mix.py/susun.py), font watermark. Daftar aset diambil dari gerbang bangun.mjs --periksa (aset yang benar-benar dipakai).
# Pakai (dari akar repo CI): python3 growth/video/pabrik/ci/aset.py growth/video/pabrik/spec/<kode>.json
import os, sys, json, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import g3
P = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))   # growth/video/pabrik
V = os.path.dirname(P)                                                  # growth/video
ASET = os.path.join(P, "_aset")
spec = sys.argv[1]
r = subprocess.run(["node", os.path.join(P, "bangun.mjs"), spec, "--periksa"], capture_output=True, text=True)
sys.stderr.write(r.stderr)
if r.returncode: sys.exit("gerbang gagal:\n" + r.stdout + r.stderr)
info = json.loads(r.stdout.strip().splitlines()[-1])
s3 = g3.klien(); n = 0
def ambil(key, dst):
    global n
    if os.path.exists(dst) and os.path.getsize(dst) > 0: return
    g3.unduh(s3, key, dst); n += 1
for key in info["aset"]: ambil(key, os.path.join(ASET, key))
for f in ["marker.ttf", "serif-bold.ttf", "caveat.ttf", "spartan.woff2", "inter.woff2"]: ambil(f"pabrik/umum/font/{f}", os.path.join(ASET, "pabrik", "umum", "font", f))
ambil("pabrik/umum/font/LeagueSpartan-Bold.ttf", os.path.join(V, "format-jasa", "_bahan", "LeagueSpartan-Bold.ttf"))
for key in g3.daftar(s3, "pabrik/audio/musik/kandidat/"): ambil(key, os.path.join(V, "_musik", key.split("pabrik/audio/musik/", 1)[1]))
for key in g3.daftar(s3, "pabrik/audio/sfx/"):
    if key.endswith(".wav"): ambil(key, os.path.join(V, "_sfx", os.path.basename(key)))
print(json.dumps({"aset_ok": len(info["aset"]), "diunduh": n, "musik": info["musik"], "wm": info["wm"]}))
