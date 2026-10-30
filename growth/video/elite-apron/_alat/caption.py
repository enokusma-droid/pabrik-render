# caption.py - caption kekinian gaya Reels/TikTok (ASS) dari VO + naskah. Dipakai ulang semua video Elite Apron.
#
# Pakai (cwd bebas):
#   py caption.py --wav vo/vo.wav --naskah naskah.cap.txt --out cap.ass [--kunci "bordir,custom,..."] [--teks-vo vo/naskah-vo.txt]
# Render: lihat fungsi filter_ass() / cetak "ffmpeg -vf" di bawah. Contoh: ffmpeg -i v.mp4 -vf "ass=cap.ass:fontsdir=fonts" ...
#   (jalankan ffmpeg dengan cwd = folder tempat cap.ass & fonts/ supaya path relatif, hindari "C:" di filter)
#
# Format naskah.cap.txt = naskah yang dibaca VO. Bagian yang dibaca beda dari yang ditampilkan (mis. nomor WA) ditulis
#   {nol delapan lima satu|0851} -> VO membaca "nol delapan lima satu", caption menampilkan "0851".
# --teks-vo menulis versi polos (untuk TTS) tanpa markup.
# Waktu per kata: faster-whisper (word_timestamps). Kata tampilan SELALU dari naskah (whisper hanya untuk waktu).
import argparse, difflib, json, os, re, sys

KUNCI_DEFAULT = "bordir,custom,hotel,resto,kafe,cafe,chef,whatsapp,wa,seragam,apron,horeca,rapi,logo,kompak,profesional,elite"
EMAS = "&H0042C5F5"      # #F5C542 (BGR)
PUTIH = "&H00FFFFFF"
FONT_NAMA = "Montserrat ExtraBold"
FONT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts", "Montserrat-ExtraBold.ttf")
MAX_KAR = 16          # maks karakter per baris caption
LEBAR_MAKS = 930      # px, supaya aman dari tepi
Y_POS = 1480         # ~77% tinggi 1920 (owner 29 Okt: caption diturunkan; UI Reels bawah mulai ~85% = 1630)

def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())

def parse_naskah(teks):
    """-> list token {'tampil': str, 'ucap': [kata...], 'tanda': akhir-kalimat/koma/''}"""
    toks = []
    # pecah: grup {a b|c} atau kata biasa
    for m in re.finditer(r"\{([^|}]+)\|([^}]+)\}([.,;:!?]*)|(\S+)", teks):
        if m.group(1):
            p = m.group(3)
            toks.append({"tampil": m.group(2).strip() + p, "ucap": m.group(1).split(), "tanda": "." if re.search(r"[.!?]", p) else ("," if p else "")})
        else:
            w = m.group(4)
            if not norm(w): continue
            tanda = ""
            if re.search(r"[.!?]$", w): tanda = "."
            elif re.search(r"[,;:]$", w): tanda = ","
            toks.append({"tampil": w, "ucap": [norm(w) and w], "tanda": tanda})
    # tanda baca untuk grup: lihat karakter setelah } (sudah ikut \S+? tidak) - cukup
    return toks

def teks_polos(teks):
    return re.sub(r"\{([^|}]+)\|[^}]+\}", r"\1", teks)

def whisper_kata(wav, prompt=""):
    from faster_whisper import WhisperModel
    model_id = os.environ.get("WHISPER_MODEL", "mobiuslabsgmbh/faster-whisper-large-v3-turbo")
    try:
        m = WhisperModel(model_id, device=os.environ.get("WHISPER_DEVICE", "cuda"), compute_type=os.environ.get("WHISPER_COMPUTE", "int8_float32"))
    except Exception as e:
        print("whisper cuda gagal, pakai cpu:", str(e)[:120], file=sys.stderr)
        m = WhisperModel(model_id, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(wav, language="id", word_timestamps=True, beam_size=5, vad_filter=False,
                           initial_prompt=prompt[:400], condition_on_previous_text=False)
    out = []
    for s in segs:
        for w in (s.words or []):
            out.append((norm(w.word), float(w.start), float(w.end)))
    return [x for x in out if x[0]]

def selaraskan(toks, ww, dur):
    """isi toks[i]['t0'],['t1'] dari kata whisper ww memakai kata-ucap naskah sebagai sumber."""
    ucap = []   # (idx_token, kata_norm)
    for i, t in enumerate(toks):
        for u in t["ucap"]:
            ucap.append((i, norm(u)))
    S = [u[1] for u in ucap]; W = [w[0] for w in ww]
    waktu = [None] * len(S)
    sm = difflib.SequenceMatcher(None, S, W, autojunk=False)
    for a, b, n in [(m.a, m.b, m.size) for m in sm.get_matching_blocks()]:
        for k in range(n):
            waktu[a + k] = (ww[b + k][1], ww[b + k][2])
    # blok 'replace' (salah eja whisper): petakan proporsional
    for tag, a1, a2, b1, b2 in sm.get_opcodes():
        if tag == "replace" and b2 > b1:
            n, m_ = a2 - a1, b2 - b1
            for k in range(n):
                j = b1 + min(m_ - 1, int(k * m_ / n))
                waktu[a1 + k] = (ww[j][1], ww[j][2]) if m_ >= n else None
            if m_ < n:  # whisper lebih sedikit kata: bagi rata rentang
                t0, t1 = ww[b1][1], ww[b2 - 1][2]
                for k in range(n):
                    waktu[a1 + k] = (t0 + (t1 - t0) * k / n, t0 + (t1 - t0) * (k + 1) / n)
    # interpolasi yang masih kosong
    n = len(waktu)
    i = 0
    while i < n:
        if waktu[i] is None:
            j = i
            while j < n and waktu[j] is None: j += 1
            t0 = waktu[i - 1][1] if i > 0 else 0.0
            t1 = waktu[j][0] if j < n else dur
            for k in range(i, j):
                waktu[k] = (t0 + (t1 - t0) * (k - i) / (j - i), t0 + (t1 - t0) * (k - i + 1) / (j - i))
            i = j
        else:
            i += 1
    for ti, t in enumerate(toks):
        ws = [waktu[k] for k, (idx, _) in enumerate(ucap) if idx == ti]
        t["t0"] = min(x[0] for x in ws); t["t1"] = max(x[1] for x in ws)
    # pastikan monoton
    for a, b in zip(toks, toks[1:]):
        if b["t0"] < a["t0"]: b["t0"] = a["t0"]
        if a["t1"] > b["t0"]: a["t1"] = max(a["t0"] + 0.05, b["t0"])
    return toks

def kelompok(toks, maxw=3):
    """bagi token jadi chunk 1-3 kata, maks MAX_KAR karakter, putus di tanda baca / jeda panjang."""
    out, cur = [], []
    def tutup():
        nonlocal cur
        if cur: out.append(cur); cur = []
    for t in toks:
        panjang = sum(len(x["tampil"]) for x in cur) + len(cur) + len(t["tampil"])
        if cur and (len(cur) >= maxw or panjang > MAX_KAR or t["t0"] - cur[-1]["t1"] > 0.45):
            tutup()
        cur.append(t)
        if t["tanda"]:
            tutup()
    tutup()
    # gabung chunk 1 kata pendek dengan tetangga bila muat (hindari kedip) - hanya bila tanpa tanda baca di antaranya
    return out

def detik(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def lebar(teks, ukuran):
    from PIL import ImageFont
    f = ImageFont.truetype(FONT_FILE, ukuran)
    return f.getlength(teks)

def tulis_ass(chunks, kunci, out, w=1080, h=1920, ukuran=96, y=Y_POS, huruf_besar=True):
    kunci = {norm(k) for k in kunci}
    hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,{FONT_NAMA},{ukuran},{PUTIH},{PUTIH},&H00000000,&H99000000,0,0,0,0,100,100,0,0,1,9,4,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, Effect, Text
"""
    baris = []
    for ci, ch in enumerate(chunks):
        tampil = [(x["tampil"].upper() if huruf_besar else x["tampil"]) for x in ch]
        penuh = " ".join(tampil)
        fs = ukuran
        while lebar(penuh, fs) > LEBAR_MAKS and fs > 50: fs -= 2
        akhir_chunk = ch[-1]["t1"] + 0.12
        if ci + 1 < len(chunks): akhir_chunk = min(akhir_chunk, chunks[ci + 1][0]["t0"])
        for k, x in enumerate(ch):
            mulai = x["t0"] if k > 0 else x["t0"]
            sampai = ch[k + 1]["t0"] if k + 1 < len(ch) else akhir_chunk
            if sampai <= mulai: sampai = mulai + 0.05
            bagian = []
            for j, y_ in enumerate(ch):
                teks = tampil[j]
                # tanda baca di ujung kata ditampilkan tapi tidak ikut pewarnaan kata kunci
                isi = re.sub(r"[.,;:!?]+$", lambda m: m.group(0) if y_["tanda"] else "", teks)
                kunci_ok = norm(y_["tampil"]) in kunci or any(norm(p) in kunci for p in y_["tampil"].replace("-", " ").split())
                if j == k:
                    bagian.append("{\\c" + EMAS + "\\fscx112\\fscy112\\t(0,130,\\fscx100\\fscy100)}" + isi + "{\\r}")
                elif kunci_ok:
                    bagian.append("{\\c" + EMAS + "}" + isi + "{\\r}")
                else:
                    bagian.append(isi)
            teks_ass = "{\\an5\\pos(540," + str(y) + ")\\fs" + str(fs) + "}" + " ".join(bagian)
            baris.append(f"Dialogue: 0,{detik(mulai)},{detik(sampai)},Main,,,{teks_ass}")
    open(out, "w", encoding="utf-8").write(hdr + "\n".join(baris) + "\n")
    return len(baris)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wav", required=True); ap.add_argument("--naskah", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--kunci", default=KUNCI_DEFAULT); ap.add_argument("--teks-vo"); ap.add_argument("--json")
    ap.add_argument("--y", type=int, default=Y_POS); ap.add_argument("--ukuran", type=int, default=104)
    a = ap.parse_args()
    raw = open(a.naskah, encoding="utf-8").read()
    if a.teks_vo:
        open(a.teks_vo, "w", encoding="utf-8").write(teks_polos(raw).strip() + "\n")
    toks = parse_naskah(raw)
    import subprocess
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.wav]).decode().strip())
    cache = a.out + ".ww.json"   # waktu kata whisper di-cache (hapus file ini bila VO berubah)
    if os.path.exists(cache) and os.path.getmtime(cache) > os.path.getmtime(a.wav):
        ww = [tuple(x) for x in json.load(open(cache))]
    else:
        ww = whisper_kata(a.wav, "Elite Apron, bordir, seragam, HORECA, WhatsApp, kafe, resto, hotel, chef.")
        json.dump(ww, open(cache, "w"))
    toks = selaraskan(toks, ww, dur)
    chunks = kelompok(toks)
    n = tulis_ass(chunks, [k.strip() for k in a.kunci.split(",") if k.strip()], a.out, y=a.y, ukuran=a.ukuran)
    if a.json:
        json.dump([[{k: x[k] for k in ("tampil", "t0", "t1")} for x in ch] for ch in chunks], open(a.json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"ass: {a.out}  chunk={len(chunks)} event={n}  kata whisper={len(ww)} token naskah={len(toks)} durasi VO={dur:.2f}")

if __name__ == "__main__":
    main()
