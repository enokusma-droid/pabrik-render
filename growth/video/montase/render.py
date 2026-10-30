#!/usr/bin/env python3
# MONTASE NARASI (owner 29 Okt 2026, pertama Lava Tour Merapi): video 9:16 dari footage/foto ASLI terkurasi + VO + caption per kata
# + label + end card + SFX + musik. Generik untuk semua brand; isi per video = spec JSON (lihat SPEC.md).
#   python3 render.py <spec.json> --kerja <dir>   (dir berisi vo/vo.wav, cap.ass, cap.json, aset/<ID>.<ext>)
# Menghasilkan <kerja>/visual_cap.mp4 + <kerja>/sfx.json. Audio akhir: _musik/mix.py (dipanggil ci/proses.sh).
# Potongan klip mengikuti waktu kata VO (cap.json): tiap shot mulai di kata jangkarnya.
import argparse, json, os, re, shutil, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_SRC = os.path.join(HERE, "font", "Poppins-Bold.ttf")
CAP_FONTS = os.path.normpath(os.path.join(HERE, "..", "elite-apron", "_alat", "fonts"))
ENC = ["-an", "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30"]


def sh(a, cwd):
    subprocess.run(a, check=True, cwd=cwd)


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec"); ap.add_argument("--kerja", required=True)
    a = ap.parse_args()
    S = json.load(open(a.spec, encoding="utf-8"))
    K = os.path.abspath(a.kerja)
    os.makedirs(os.path.join(K, "seg"), exist_ok=True); os.makedirs(os.path.join(K, "teks"), exist_ok=True)
    shutil.copy(FONT_SRC, os.path.join(K, "font.ttf"))
    FONT = "font.ttf"   # path relatif (cwd = kerja) supaya filter ffmpeg tidak memuat "C:" di Windows
    W = S.get("warna", {}); AKSEN = W.get("aksen", "#FF7A1A"); GELAP = W.get("gelap", "#141414")
    KATA = [w for b in json.load(open(os.path.join(K, "cap.json"), encoding="utf-8")) for w in b]
    kartu_d = float(S.get("kartu", {}).get("detik", 3.5))
    mulai_kartu = round(KATA[-1]["t1"] + 0.4, 2)
    total = round(mulai_kartu + kartu_d, 2)

    def waktu(kata, setelah):
        for w in KATA:
            if norm(w["tampil"]) == norm(kata) and w["t0"] > setelah:
                return w["t0"]
        raise SystemExit(f"kata jangkar '{kata}' tidak ada di cap.json setelah {setelah}s")

    SHOT = S["shot"]
    T0 = [0.0]
    for s in SHOT[1:]:
        T0.append(waktu(s["kata"], T0[-1]))
    T1 = T0[1:] + [mulai_kartu]

    def teks(nama, isi):
        open(os.path.join(K, "teks", nama), "w", encoding="utf-8").write(isi)
        return f"teks/{nama}"

    def aset(id):
        for ext in (".mp4", ".jpg", ".png"):
            f = os.path.join(K, "aset", id + ext)
            if os.path.exists(f): return f"aset/{id}{ext}"
        raise SystemExit(f"aset {id} tidak ada di {K}/aset")

    P = []
    for n, (s, t0, t1) in enumerate(zip(SHOT, T0, T1)):
        dur, f, out = t1 - t0, aset(s["aset"]), f"seg/{n:02d}.mp4"
        if dur <= 0.2: raise SystemExit(f"shot {n} ({s['kata']}) terlalu pendek: {dur:.2f}s")
        if f.endswith(".mp4"):
            # tpad: klip lebih pendek dari shot → tahan frame terakhir (durasi segmen harus pas, kalau tidak caption/VO bergeser)
            vf = f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,tpad=stop_mode=clone:stop_duration={dur:.2f},format=yuv420p"
            sh(["ffmpeg", "-y", "-v", "error", "-ss", str(s.get("ss", 0)), "-i", f, "-t", f"{dur:.3f}", "-vf", vf] + ENC + [out], K)
        else:   # foto: Ken Burns bergantian zoom in/out
            fr = int(dur * 30) + 2
            z = "min(zoom+0.0012,1.12)" if n % 2 == 0 else "if(eq(on,0),1.12,max(zoom-0.0012,1.0))"
            vf = (f"scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':"
                  f"y='ih/2-(ih/zoom/2)':d={fr}:s=1080x1920:fps=30,setsar=1,scale=in_range=pc:out_range=tv,format=yuv420p")
            sh(["ffmpeg", "-y", "-v", "error", "-i", f, "-t", f"{dur:.3f}", "-vf", vf] + ENC + [out], K)
        P.append(out)

    # end card
    kt = S.get("kartu", {})
    baris = kt.get("baris", ["", ""])

    def kt_teks(nm, s, c, y, isi, a0):
        return f"drawtext=fontfile={FONT}:textfile={teks(nm, isi)}:fontsize={s}:fontcolor={c}:x=(w-text_w)/2:y={y}:alpha='min(1,max(0,(t-{a0})/0.3))'"
    vf = [kt_teks("k1.txt", 120, AKSEN, 420, baris[0], 0)]
    if len(baris) > 1 and baris[1]: vf.append(kt_teks("k2.txt", 120, "white", 560, baris[1], 0.1))
    if kt.get("sub"): vf.append(kt_teks("k3.txt", 42, "white", 760, kt["sub"], 0.3))
    if kt.get("cta"):
        vf.append(f"drawtext=fontfile={FONT}:textfile={teks('k4.txt', kt['cta'])}:fontsize=64:fontcolor=white:x=(w-text_w)/2:y=900:"
                  f"box=1:boxcolor={kt.get('cta_warna', AKSEN)}:boxborderw=32:alpha='min(1,max(0,(t-0.7)/0.3))'")
    out = f"seg/{len(P):02d}.mp4"
    sh(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c={GELAP}:s=1080x1920:r=30:d={kartu_d}", "-vf", ",".join(vf)] + ENC + [out], K)
    P.append(out)
    open(os.path.join(K, "seg", "list.txt"), "w").write("".join(f"file '{os.path.basename(p)}'\n" for p in P))
    sh(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-i", "seg/list.txt", "-c", "copy", "seg/visual.mp4"], K)

    # overlay: judul hook, label per shot, progress bar, caption ASS
    def dt(nm, isi, s, c, y, a0, b0, box=False, bw=0):
        x = (f"drawtext=fontfile={FONT}:textfile={teks(nm, isi)}:fontsize={s}:fontcolor={c}:x=(w-text_w)/2:y={y}:"
             f"enable='between(t,{a0},{b0})':alpha='min(1,max(0,(t-{a0})/0.15))'")
        return x + (":borderw=7:bordercolor=black" if not box else f":box=1:boxcolor=#000000B0:boxborderw={bw}")
    T = []
    j = S.get("judul") or []
    hook_akhir = round(T1[0] - 0.05, 2) if S.get("judul_detik") is None else S["judul_detik"]
    for i, (isi, c) in enumerate(zip(j, [AKSEN, "white", "white"])):
        T.append(dt(f"h{i}.txt", isi, 130 if i < 2 else 56, c, 300 + i * 150, 0.1 + i * 0.15, hook_akhir))
    for n, s in enumerate(SHOT):
        if s.get("angka"):
            T.append(dt(f"a{n}.txt", s["angka"], 220, AKSEN, 150, T0[n] + 0.05, T1[n] - 0.06))
        if s.get("label"):
            T.append(dt(f"l{n}.txt", s["label"], 56, AKSEN, 420 if s.get("angka") else 260, T0[n] + 0.08, T1[n] - 0.06, True, 22))
        if s.get("label2"):
            T.append(dt(f"m{n}.txt", s["label2"], 44, "white", 530 if s.get("angka") else 370, T0[n] + 0.18, T1[n] - 0.06, True, 18))
    shutil.rmtree(os.path.join(K, "fonts"), ignore_errors=True); shutil.copytree(CAP_FONTS, os.path.join(K, "fonts"))
    pre = f"[0]{','.join(T)}[a];[a]" if T else "[0]"
    fc = f"{pre}[1]overlay=x='-W+W*t/{total}':y=0:shortest=1,ass=cap.ass:fontsdir=fonts[o]"
    sh(["ffmpeg", "-y", "-v", "error", "-i", "seg/visual.mp4", "-f", "lavfi", "-i", f"color=c={AKSEN}:s=1080x10:r=30:d={total}",
        "-filter_complex", fc, "-map", "[o]"] + ENC + ["visual_cap.mp4"], K)

    # SFX: whoosh tiap potongan, pop di label/angka/hook, ding di kartu akhir
    isi = [{"t": 0.12, "jenis": "pop", "vol": 0.7}]
    isi += [{"t": round(t - 0.05, 2), "jenis": "whoosh", "vol": 0.4} for t in T0[1:]]
    isi += [{"t": round(T0[n] + 0.1, 2), "jenis": "pop", "vol": 0.45} for n, s in enumerate(SHOT) if s.get("label") or s.get("angka")]
    isi += [{"t": e["t"], "jenis": e["jenis"], "vol": e.get("vol", 0.5)} for e in S.get("sfx_tambahan", [])]
    isi += [{"t": mulai_kartu, "jenis": "whoosh", "vol": 0.6}, {"t": mulai_kartu + 0.25, "jenis": "pop", "vol": 0.5},
            {"t": mulai_kartu + 0.75, "jenis": "ding", "vol": 0.5}]
    json.dump({"total": total, "isi": sorted(isi, key=lambda e: e["t"])}, open(os.path.join(K, "sfx.json"), "w"), indent=1)
    json.dump({"total": total, "shot": [{"aset": s["aset"], "t0": round(a, 2), "t1": round(b, 2)} for s, a, b in zip(SHOT, T0, T1)]},
              open(os.path.join(K, "potongan.json"), "w"), indent=1)
    print(json.dumps({"total": total, "shot": len(SHOT)}))


if __name__ == "__main__":
    main()
