# Timing kata VO + batas blok naskah. Pakai: py -3.10 waktu.py <vo.wav> <naskah.json> <keluar.json>
# Utama: faster-whisper (word timestamps), dicocokkan ke kata naskah (difflib). Cadangan: silencedetect ffmpeg.
import json, re, subprocess, sys, difflib

wav, naskah_f, out_f = sys.argv[1:4]
naskah = json.load(open(naskah_f, encoding="utf-8"))
if isinstance(naskah, dict): naskah = naskah["blok"]  # bentuk {tema, blok}
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
blok_kata = [[norm(w) for w in b["teks"].split() if norm(w)] for b in naskah]
flat, blok_idx = [], []
for i, ws in enumerate(blok_kata):
    flat += ws; blok_idx += [i] * len(ws)

def durasi():
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).decode().strip())

hasil = {"durasi": durasi(), "metode": None, "kata": [], "blok": []}
try:
    from faster_whisper import WhisperModel
    try:
        m = WhisperModel("small", device="cuda", compute_type="int8_float32")
        segs, _ = m.transcribe(wav, language="id", word_timestamps=True, vad_filter=False)
        segs = list(segs)
    except Exception:
        m = WhisperModel("small", device="cpu", compute_type="int8")
        segs, _ = m.transcribe(wav, language="id", word_timestamps=True, vad_filter=False)
        segs = list(segs)
    wk = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]
    sm = difflib.SequenceMatcher(a=flat, b=[w[0] for w in wk], autojunk=False)
    peta = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n): peta[a + k] = b + k
    # waktu tiap kata naskah: kata cocok langsung, sisanya interpolasi tetangga
    t = [None] * len(flat)
    for i in range(len(flat)):
        if i in peta: t[i] = (wk[peta[i]][1], wk[peta[i]][2])
    known = [i for i in range(len(flat)) if t[i]]
    if len(known) < len(flat) * 0.5: raise RuntimeError("cocok kata terlalu sedikit")
    for i in range(len(flat)):
        if not t[i]:
            prev = max([k for k in known if k < i], default=None); nxt = min([k for k in known if k > i], default=None)
            if prev is None: s = t[nxt][0] - 0.3 * (nxt - i)
            elif nxt is None: s = t[prev][1] + 0.3 * (i - prev)
            else: s = t[prev][1] + (t[nxt][0] - t[prev][1]) * (i - prev) / (nxt - prev)
            t[i] = (s, s + 0.25)
    hasil["metode"] = "whisper"
    hasil["kata"] = [{"w": flat[i], "b": blok_idx[i], "s": round(t[i][0], 3), "e": round(t[i][1], 3)} for i in range(len(flat))]
    for bi in range(len(naskah)):
        ks = [k for k in hasil["kata"] if k["b"] == bi]
        hasil["blok"].append({"s": ks[0]["s"], "e": ks[-1]["e"]})
except Exception as ex:
    print("whisper gagal, pakai silencedetect:", ex, file=sys.stderr)
    log = subprocess.run(["ffmpeg", "-i", wav, "-af", "silencedetect=noise=-35dB:d=0.35", "-f", "null", "-"], capture_output=True, text=True).stderr
    sil = [(float(a), float(b)) for a, b in re.findall(r"silence_start: ([\d.]+).*?\n.*?silence_end: ([\d.]+)", log)]
    n = len(naskah)
    terpilih = sorted(sorted(sil, key=lambda x: x[1] - x[0], reverse=True)[: n - 1])
    batas = [0.0] + [b for a, b in terpilih] + [hasil["durasi"]]
    while len(batas) < n + 1: batas.insert(-1, batas[-2] + 1)
    hasil["metode"] = "silencedetect"
    for bi in range(n):
        s, e = batas[bi], batas[bi + 1]
        hasil["blok"].append({"s": s, "e": e})
        ws = blok_kata[bi]
        for j, w in enumerate(ws):
            ts = s + (e - s) * j / max(1, len(ws))
            hasil["kata"].append({"w": w, "b": bi, "s": round(ts, 3), "e": round(ts + 0.25, 3)})
json.dump(hasil, open(out_f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(hasil["metode"], len(hasil["kata"]), "kata", hasil["durasi"], "dtk")
