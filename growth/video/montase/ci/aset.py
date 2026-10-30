#!/usr/bin/env python3
# CI: unduh bahan satu spec montase dari G3 → <kerja>/aset/<ID>.<ext>, musik → <kerja>/musik.mp3, SFX pustaka → growth/video/_sfx/.
# Aset disiapkan dulu oleh siapkan.py (Directus → G3 konten/montase/aset/<brand>/<ID>.<ext>).
#   python3 growth/video/montase/ci/aset.py <spec.json> <kerja>
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "pabrik", "ci"))
import g3

V = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))   # growth/video
spec, K = sys.argv[1], sys.argv[2]
S = json.load(open(spec, encoding="utf-8"))
s3 = g3.klien()
ada = {os.path.basename(k): k for k in g3.daftar(s3, f"montase/aset/{S['brand']}/")}
n = 0
for id in sorted({s["aset"] for s in S["shot"]}):
    k = next((ada[id + e] for e in (".mp4", ".jpg", ".png") if id + e in ada), None)
    if not k: sys.exit(f"aset {id} belum ada di G3 montase/aset/{S['brand']}/ (jalankan siapkan.py)")
    g3.unduh(s3, k, os.path.join(K, "aset", os.path.basename(k))); n += 1
g3.unduh(s3, f"montase/audio/musik/{S['musik']}", os.path.join(K, "musik.mp3"))
for k in g3.daftar(s3, "pabrik/audio/sfx/"):
    f = os.path.join(V, "_sfx", os.path.basename(k))
    if k.endswith(".wav") and not os.path.exists(f): g3.unduh(s3, k, f)
print(json.dumps({"aset": n, "musik": S["musik"]}))
