#!/usr/bin/env bash
# CI (GitHub Actions, satu job per KODE): spec → aset G3 → VO (TTS lanjut-job) → waktu kata → bangun → render → watermark → SFX+musik → QC → unggah G3.
# Pakai dari akar repo CI: bash growth/video/pabrik/ci/proses.sh <KODE>
# Hasil: G3 konten/pabrik/hasil/<KODE>.mp4, <KODE>-qc.jpg, <KODE>.json (meta + qc). Butuh env S3_*, KONTEN_API_KEY.
set -euo pipefail
K="${1:?kode}"; P=growth/video/pabrik; KER="$P/kerja/$K"; SPEC="${SPEC:-$P/spec/$K.json}"; PY="${PY:-python3}"; export PY
[ -s "$SPEC" ] || { echo "::error::spec $SPEC tidak ada"; exit 1; }
mkdir -p "$KER"; ROOT="$(pwd)"
echo "== gerbang (anti-template + pemeran + juri, owner 22 Okt)"; node $P/bangun.mjs "$SPEC" --periksa | tail -1
echo "== aset"; INFO=$($PY $P/ci/aset.py "$SPEC" | tail -1); echo "$INFO"
MUSIK=$(echo "$INFO" | $PY -c 'import json,sys;print(json.load(sys.stdin)["musik"])')
WM=$(echo "$INFO" | $PY -c 'import json,sys;print(json.load(sys.stdin)["wm"])')
echo "== VO"; node $P/ci/vo.mjs "$SPEC" "$KER"
echo "== waktu kata"; $PY growth/video/format-jasa/templat/F3/waktu.py "$KER/vo.wav" "$KER/naskah.json" "$KER/waktu.json"
echo "== bangun"; node $P/bangun.mjs "$SPEC" --kerja "$KER" --aset "$P/_aset"
echo "== render"; (cd "$KER/proyek" && hyperframes render . -q "${KUALITAS:-high}" -o "$ROOT/$KER/hasil.mp4")
# WM=TANPA: brand dengan watermark ikon di komposisi (Ratu Bawang, tanpa nomor) → JANGAN tempel nomor WA Nusawebsite
if [ "$WM" = "TANPA" ]; then echo "== watermark: ikon brand di komposisi (tanpa nomor)"; else echo "== watermark ($WM)"; env JASA_CPU=1 "JASA_WM_$WM=1" node growth/video/format-jasa/_bahan/watermark.mjs "$KER"; fi
ffmpeg -v error -y -i "$KER/hasil.mp4" -c:v copy -c:a aac -b:a 160k -movflags +faststart "$KER/master.mp4"
echo "== audio (VO + SFX pustaka + musik $MUSIK)"
$PY growth/video/_musik/mix.py --video "$KER/master.mp4" --keluar "$KER/final.mp4" --musik "$MUSIK" --vo "$KER/vo.wav" --vo-mulai 0.3 --sfx "$KER/sfx.json" | tee "$KER/mix.json"
echo "== QC"; $PY growth/video/_musik/qc.py "$KER/final.mp4" --mulai 0 --durasi 15 --naskah "$KER/naskah.json" | tee "$KER/qc.json"
$PY $P/ci/ringkas.py "$KER" "$K"
echo "== unggah G3"
$PY $P/ci/g3.py unggah "$KER/final.mp4" "pabrik/hasil/$K.mp4" video/mp4
$PY $P/ci/g3.py unggah "$KER/qc.jpg" "pabrik/hasil/$K-qc.jpg" image/jpeg
$PY $P/ci/g3.py unggah "$KER/hasil.json" "pabrik/hasil/$K.json" application/json
echo "SELESAI $K → G3 konten/pabrik/hasil/$K.mp4"
