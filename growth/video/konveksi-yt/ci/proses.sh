#!/usr/bin/env bash
# CI (repo publik pabrik-render, satu job per KODE): spec antrean (naskah + waktu, dari PC) -> bahan G3 (vo.wav + foto asli) ->
# render templat K1 (HyperFrames) -> watermark WA + web -> frame QC -> unggah G3 konten/konveksi-yt/hasil/<KODE>.{mp4,json,-grid.jpg}.
# Pakai dari akar repo CI: bash growth/video/konveksi-yt/ci/proses.sh <KODE>. Butuh env S3_* (G3). Log repo PUBLIK: jangan echo secret.
set -euo pipefail
K="${1:?kode}"; R=growth/video/konveksi-yt; D="$R/produksi/$K"; PY="${PY:-python3}"
G3() { $PY growth/video/pabrik/ci/g3.py "$@"; }
SPEC="$R/antrean/$K.json"
[ -s "$SPEC" ] || { echo "::error::spec $SPEC tidak ada"; exit 1; }
mkdir -p "$D/vo" "$D/foto"
echo "== spec -> naskah.json + waktu.json"
FOTO=$($PY - "$SPEC" "$D" <<'PY'
import json, sys, os
s = json.load(open(sys.argv[1], encoding="utf-8")); d = sys.argv[2]
json.dump(s["naskah"], open(os.path.join(d, "naskah.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(s["waktu"], open(os.path.join(d, "waktu.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(" ".join(s["foto"]))
PY
)
echo "== aset bersama G3 (logo .png + font .woff2/.ttf di-gitignore repo induk)"
for f in logo-ea.png logo-gi.png cormorant.woff2 montserrat.woff2 spartan.woff2 inter.woff2; do [ -s "$R/templat/K1/assets/$f" ] || G3 unduh "konveksi-yt/umum/$f" "$R/templat/K1/assets/$f"; done
[ -s "$R/_bahan/LeagueSpartan-Bold.ttf" ] || G3 unduh "pabrik/umum/font/LeagueSpartan-Bold.ttf" "$R/_bahan/LeagueSpartan-Bold.ttf"
echo "== bahan G3 (vo + ${FOTO// /, })"
G3 unduh "konveksi-yt/$K/vo.wav" "$D/vo/vo.wav"
for id in $FOTO; do G3 unduh "konveksi-yt/$K/foto/$id.jpg" "$D/foto/$id.jpg"; done
echo "== render K1"
CI=1 JASA_CPU=1 node "$R/templat/K1/buat.mjs" "$K"
[ -s "$D/hasil.mp4" ] || { echo "::error::hasil.mp4 tidak ada"; exit 1; }
echo "== unggah G3"
G3 unggah "$D/hasil.mp4" "konveksi-yt/hasil/$K.mp4" video/mp4 || echo "::warning::unggah mp4 ke G3 gagal (G3 penuh?) -> ambil dari artifact"
G3 unggah "$D/frames/_grid.jpg" "konveksi-yt/hasil/$K-grid.jpg" image/jpeg || true
G3 unggah "$D/meta.json" "konveksi-yt/hasil/$K.json" application/json || true
mkdir -p "$R/hasil/$K"; cp "$D/meta.json" "$R/hasil/$K/meta.json"; cp "$D/frames/_grid.jpg" "$R/hasil/$K/qc.jpg"
echo "SELESAI $K -> G3 konten/konveksi-yt/hasil/$K.mp4"
