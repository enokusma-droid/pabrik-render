# Susun track SFX dari daftar waktu (sfx.json buatan generator) memakai pustaka _sfx/ (Mixkit, bukan sintesis).
# Pakai: py -3.10 susun.py sfx.json keluar.wav
# sfx.json = {"total": dtk, "isi": [{"t": dtk, "jenis": "pop|whoosh|ding|stamp|thud|boing|kertas|spidol|turun|tumpuk|tik|tegang|boom|byur|sobek|kaget|sparkle|pintu|meong|jantung|horor|korslet|seram", "vol": 0..1}]}
# Aturan anti-ramai: jenis sama < 0,12 dtk → yang belakang dibuang; maks 3 SFX mulai dalam jendela 0,3 dtk (vol terbesar menang).
# Varian per jenis bergiliran (pop-1, pop-2, ...) supaya tidak terdengar berulang. Level sampel sudah seragam (ambil.py: puncak-RMS -18 dBFS).
import json, os, subprocess, sys
import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))
SR = 48000
# koreksi telinga per jenis (dB) — whoosh/tik/tegang lebih panjang & berisi, jadi diturunkan
KOREKSI = {"whoosh": -4, "tik": -5, "tegang": -4, "turun": -3, "kaget": -3, "kertas": -2, "spidol": -3, "tumpuk": -2, "sparkle": -2, "boom": -1, "seram": -6, "jantung": -3, "pintu": -2}
ALIAS = {"swoosh": "whoosh", "bubble": "pop", "chime": "ding", "paper": "kertas", "stempel": "stamp"}


def baca(f):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ar", str(SR), "-ac", "2", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def saring(isi):
    isi = sorted(isi, key=lambda e: e["t"])
    out, akhir = [], {}
    for e in isi:
        j = e["jenis"]
        if e["t"] - akhir.get(j, -9) < 0.12:
            continue
        akhir[j] = e["t"]
        out.append(e)
    hasil = []
    for e in out:
        tetangga = [x for x in hasil if e["t"] - x["t"] < 0.3]
        if len(tetangga) >= 3:
            lemah = min(tetangga, key=lambda x: x.get("vol", 1))
            if lemah.get("vol", 1) < e.get("vol", 1):
                hasil.remove(lemah)
            else:
                continue
        hasil.append(e)
    return hasil


def main():
    cfg = json.load(open(sys.argv[1], encoding="utf-8"))
    peta = json.load(open(os.path.join(DIR, "peta.json"), encoding="utf-8"))
    cache, giliran = {}, {}
    out = np.zeros((int((cfg["total"] + 3) * SR), 2))
    isi = saring([{**e, "jenis": ALIAS.get(e["jenis"], e["jenis"])} for e in cfg["isi"]])
    hilang = sorted({e["jenis"] for e in isi if e["jenis"] not in peta})
    if hilang:
        sys.exit(f"jenis SFX tidak ada di peta.json: {hilang}")
    for e in isi:
        var = peta[e["jenis"]]
        k = giliran.get(e["jenis"], 0); giliran[e["jenis"]] = k + 1
        f = var[k % len(var)]["file"]
        if f not in cache:
            cache[f] = baca(os.path.join(DIR, f))
        x = cache[f] * e.get("vol", 1) * 10 ** (KOREKSI.get(e["jenis"], 0) / 20)
        i = max(0, int(e["t"] * SR))
        out[i:i + len(x)] += x[: len(out) - i]
    out = out[: int(cfg["total"] * SR)]
    pk = np.abs(out).max()
    if pk > 0.95:
        out *= 0.95 / pk
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le", sys.argv[2]],
                   input=out.astype(np.float32).tobytes(), check=True)
    print(f"SFX {len(isi)}/{len(cfg['isi'])} dipakai -> {sys.argv[2]}")


if __name__ == "__main__":
    main()
