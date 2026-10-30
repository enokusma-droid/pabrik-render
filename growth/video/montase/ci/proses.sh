#!/usr/bin/env bash
# CI (GitHub Actions repo publik pabrik-render, satu job per KODE): spec montase → aset G3 → VO (konten /api/tts) → caption per kata
# → render.py → SFX + musik (mix.py) → lembar QC → unggah G3 konten/montase/hasil/<KODE>.mp4 + -qc.jpg + .json.
#   bash growth/video/montase/ci/proses.sh <KODE>     (dari akar repo; env S3_*, KONTEN_API_KEY)
set -euo pipefail
K="${1:?kode}"; M=growth/video/montase; SPEC="$M/antrean/$K.json"; KER="$M/kerja/$K"; PY="${PY:-python3}"
[ -s "$SPEC" ] || { echo "::error::spec $SPEC tidak ada"; exit 1; }
mkdir -p "$KER/vo"
echo "== aset"; $PY $M/ci/aset.py "$SPEC" "$KER"
echo "== naskah"
$PY - "$SPEC" "$KER" <<'PY'
import json, re, sys
S = json.load(open(sys.argv[1], encoding="utf-8")); K = sys.argv[2]
open(f"{K}/naskah.cap.txt", "w", encoding="utf-8").write(S["naskah"].strip() + "\n")
open(f"{K}/naskah.txt", "w", encoding="utf-8").write(re.sub(r"\{([^|}]+)\|[^}]+\}", r"\1", S["naskah"]).strip() + "\n")
v = S.get("vo", {})
open(f"{K}/vo.env", "w").write(f"TTS_VOICE={json.dumps(v.get('voice', 'Laomedeia'))}\nTTS_GAYA={json.dumps(v.get('gaya', ''))}\n")
PY
echo "== VO"; set -a; . "$KER/vo.env"; set +a
node $M/ci/vo.mjs "$KER/naskah.txt" "$KER/vo/vo.wav"
echo "== caption"
KUNCI=$($PY -c 'import json,sys;print(json.load(open(sys.argv[1],encoding="utf-8")).get("kunci",""))' "$SPEC")
WHISPER_DEVICE=cpu $PY growth/video/elite-apron/_alat/caption.py --wav "$KER/vo/vo.wav" --naskah "$KER/naskah.cap.txt" \
  --out "$KER/cap.ass" --json "$KER/cap.json" ${KUNCI:+--kunci "$KUNCI"}
echo "== render"; $PY $M/render.py "$SPEC" --kerja "$KER"
echo "== audio"
$PY growth/video/_musik/mix.py --video "$KER/visual_cap.mp4" --keluar "$KER/final.mp4" --musik "$KER/musik.mp3" \
  --vo "$KER/vo/vo.wav" --sfx "$KER/sfx.json" | tee "$KER/mix.json"
echo "== QC"; $PY $M/ci/qc.py "$KER" "$K"
echo "== unggah G3"
$PY growth/video/pabrik/ci/g3.py unggah "$KER/final.mp4" "montase/hasil/$K.mp4" video/mp4
$PY growth/video/pabrik/ci/g3.py unggah "$KER/qc.jpg" "montase/hasil/$K-qc.jpg" image/jpeg
$PY growth/video/pabrik/ci/g3.py unggah "$KER/meta.json" "montase/hasil/$K.json" application/json
mkdir -p "$M/hasil/$K"; cp "$KER/meta.json" "$KER/qc.jpg" "$M/hasil/$K/"
echo "SELESAI $K → G3 konten/montase/hasil/$K.mp4"
