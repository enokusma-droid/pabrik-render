# QC audio video bermusik: loudness + true peak + transkrip potongan (VO tetap jelas di atas musik/SFX).
# Pakai: py -3.10 qc.py <video.mp4> [--mulai 0] [--durasi 10] [--naskah naskah.json|naskah.txt]
# Lulus bila: LUFS -14 ±1, TP ≤ -1 dBTP, dan kecocokan kata transkrip vs naskah ≥ 80%.
import argparse, json, os, re, subprocess, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mix import ebur  # noqa: E402

norm = lambda t: re.findall(r"[a-z0-9]+", t.lower())

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("--mulai", type=float, default=0); ap.add_argument("--durasi", type=float, default=10)
ap.add_argument("--naskah")
a = ap.parse_args()
I, TP = ebur(a.video)
with tempfile.TemporaryDirectory() as T:
    w = os.path.join(T, "p.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a.mulai), "-t", str(a.durasi), "-i", a.video, "-vn", "-ac", "1", "-ar", "16000", w], check=True)
    from faster_whisper import WhisperModel
    segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(w, language="id", vad_filter=True)
    teks = " ".join(s.text.strip() for s in segs)
cocok = None
if a.naskah:
    raw = open(a.naskah, encoding="utf-8").read()
    if a.naskah.endswith(".json"):
        j = json.loads(raw); raw = " ".join(b["teks"] if isinstance(b, dict) else str(b) for b in j)
    ref = set(norm(raw)); kata = norm(teks)
    cocok = round(sum(k in ref for k in kata) / max(1, len(kata)) * 100)
lulus = abs(I + 14) <= 1 and (TP is None or TP <= -1.0) and (cocok is None or cocok >= 80)
print(json.dumps({"video": os.path.basename(a.video), "LUFS": I, "TP": TP, "transkrip": teks, "cocok_naskah_%": cocok, "LULUS": lulus}, ensure_ascii=False))
