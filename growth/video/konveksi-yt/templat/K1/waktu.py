# Timing per blok naskah dari VO: faster-whisper (word timestamps) + penjajaran difflib ke teks naskah.
# Pakai: python waktu.py <vo.wav> <blok.json: ["teks blok 1", ...]> <keluar.json>
# Keluar: {"durasi": d, "blok": [{"mulai": s, "selesai": e}], "kata": [{"w": kata_naskah, "b": idx_blok, "t": detik|null}], "sumber": "whisper"}
import json, re, sys, difflib, subprocess

wav, src, out = sys.argv[1:4]
blok = json.load(open(src, encoding="utf-8"))

def norm(w):
    return re.sub(r"[^0-9a-z]", "", w.lower())

kata = []  # (kata_naskah, idx_blok)
for i, t in enumerate(blok):
    for w in t.split():
        if norm(w):
            kata.append((w, i))

durasi = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], text=True).strip())

waktu = [None] * len(kata)
sumber = "whisper"
try:
    from faster_whisper import WhisperModel
    try:  # GPU dulu (owner 17 Okt: maksimalkan GPU), jatuh ke CPU
        m = WhisperModel("small", device="cuda", compute_type="int8_float32")
    except Exception:
        m = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = m.transcribe(wav, language="id", word_timestamps=True, vad_filter=False)
    ww = [(norm(w.word), w.start, w.end) for s in segs for w in (s.words or []) if norm(w.word)]
    a = [norm(k[0]) for k in kata]
    b = [x[0] for x in ww]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for blk in sm.get_matching_blocks():
        for j in range(blk.size):
            waktu[blk.a + j] = ww[blk.b + j][1]
    # isi celah dengan interpolasi linear
    idx = [i for i, t in enumerate(waktu) if t is not None]
    if len(idx) < max(3, len(kata) // 4):
        raise RuntimeError("penjajaran whisper terlalu sedikit (%d/%d)" % (len(idx), len(kata)))
    for i in range(len(waktu)):
        if waktu[i] is None:
            kiri = max([k for k in idx if k < i], default=None)
            kanan = min([k for k in idx if k > i], default=None)
            if kiri is None:
                waktu[i] = max(0.0, waktu[kanan] - 0.3 * (kanan - i))
            elif kanan is None:
                waktu[i] = min(durasi, waktu[kiri] + 0.3 * (i - kiri))
            else:
                waktu[i] = waktu[kiri] + (waktu[kanan] - waktu[kiri]) * (i - kiri) / (kanan - kiri)
except Exception as e:  # cadangan: silencedetect + proporsi jumlah kata
    sumber = "silencedetect (%s)" % e
    log = subprocess.run(["ffmpeg", "-i", wav, "-af", "silencedetect=n=-35dB:d=0.35", "-f", "null", "-"], capture_output=True, text=True).stderr
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
    n = len(blok)
    total = sum(len(t.split()) for t in blok)
    starts, acc = [0.0], 0
    for i in range(n - 1):
        acc += len(blok[i].split())
        target = durasi * acc / total
        starts.append(min(ends, key=lambda x: abs(x - target)) if ends else target)
    k = 0
    for i in range(n):
        ws = [j for j, kk in enumerate(kata) if kk[1] == i]
        e = starts[i + 1] if i + 1 < n else durasi
        for q, j in enumerate(ws):
            waktu[j] = starts[i] + (e - starts[i]) * q / max(1, len(ws))

mulai = []
for i in range(len(blok)):
    ts = [waktu[j] for j, kk in enumerate(kata) if kk[1] == i]
    mulai.append(ts[0] if ts else (mulai[-1] if mulai else 0.0))
res = []
for i in range(len(blok)):
    s = 0.0 if i == 0 else max(0.0, mulai[i] - 0.2)
    e = (mulai[i + 1] - 0.2) if i + 1 < len(blok) else durasi
    res.append({"mulai": round(s, 3), "selesai": round(e, 3)})
json.dump({"durasi": durasi, "blok": res, "kata": [{"w": k[0], "b": k[1], "t": round(t, 3)} for k, t in zip(kata, waktu)], "sumber": sumber}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("waktu", sumber, len(res), "blok", round(durasi, 2), "dtk")
