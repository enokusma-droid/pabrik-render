# Tambah MUSIK LATAR ke video jadi (tanpa render ulang visual). Dipakai gaya-cerita & gaya-promo (owner 21 Okt 2026).
# Pakai:
#   py -3.10 mix.py --video in.mp4 --keluar out.mp4 [--musik cerita|promo|<nama>|<path.mp3>] [--vo vo.wav --vo-mulai 0.3] [--sfx sfx.json]
#                   [--selisih 6|4] [--duck 6] [--sfx-selisih 3] [--awal-musik 0] [--lufs -14] [--tp -1.5]
# Alur: audio video (VO+SFX) tetap utuh; musik di-loop/potong sepanjang video, fade in 0,5 dtk + fade out 1 dtk di akhir,
#   diset `--selisih` LU di bawah audio video, lalu di-DUCK (sidechaincompress, kunci = VO bila --vo diberikan, kalau tidak
#   = audio video) sehingga turun ±`--duck` dB saat VO bicara; campuran diberi gain ke -14 LUFS + limiter true-peak (4x oversampling) TP -1,5, diukur ulang SETELAH encode AAC.
#   --sfx sfx.json (disarankan): audio video DIABAIKAN, disusun ulang = VO + SFX pustaka ../_sfx (susun.py) + musik.
#   Video di-copy (H.264), audio AAC 192k, +faststart. Laporan loudness akhir + loudness musik saja dicetak di akhir.
# --musik: "cerita"/"promo" = trek default pertama berawalan itu di folder ini; nama tanpa .mp3 juga boleh.
import argparse, json, os, re, subprocess, sys, tempfile, glob

DIR = os.path.dirname(os.path.abspath(__file__))
SFXDIR = os.path.join(os.path.dirname(DIR), "_sfx")
# 21 Okt malam: owner "sulit milih, pilih aja yang relevan" (lofi jelek; ukulele tidak cocok untuk cerita) -> pilihan CEO per suasana/konsep.
# Kunci = suasana (dipakai skill: K0/K1/K4/K7 ceria, K2 ceria2, K3/K5 tegang, K6 haru, K8 horor, promo upbeat). Bukan BPM-pas = jangan dipakai.
DEFAULT = {
    "cerita": "kandidat/ceria/bouncy-mischief.mp3",       # Funny Bouncy Cartoon Mischief 124 BPM
    "ceria": "kandidat/ceria/bouncy-mischief.mp3",
    "ceria2": "kandidat/ceria/quirky.mp3",                # Quirky 123 BPM (variasi agar tidak sama tiap video)
    "promo": "kandidat/upbeat/upbeat-atlas.mp3",          # Upbeat (AtlasAudio) 86 BPM
    "upbeat": "kandidat/upbeat/upbeat-atlas.mp3",
    "tegang": "kandidat/tegang/comedy-detective.mp3",     # Comedy Detective 115 BPM
    "horor": "kandidat/tegang/cute-ghost-story.mp3",      # A Cute Ghost Story 115 BPM
    "haru": "kandidat/haru/emotional-piano-atlas.mp3",    # Emotional Piano (AtlasAudio) 118 BPM
}
PROMO_KUNCI = {"promo", "upbeat"}


def run(args, **kw):
    r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace", **kw)
    if r.returncode:
        sys.exit("GAGAL (%d): %s | %s" % (r.returncode, " ".join(map(str, args))[:300], r.stderr[-2000:]))
    return r


def durasi(f):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).stdout.strip())


def ebur(f):
    """Kembalikan (I LUFS, TP dBTP) lewat filter ebur128."""
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    tail = err[err.rfind("Summary:"):]
    i = float(re.search(r"I:\s+(-?[\d.]+|-inf) LUFS", tail).group(1))
    tp = re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", tail)
    return i, float(tp.group(1)) if tp else None


def ebur_gain(f, g, out):
    run(["ffmpeg", "-v", "error", "-y", "-i", f, "-af", f"volume={g:.2f}dB", out])
    return ebur(out)


def cari_musik(m):
    if m in DEFAULT:
        return os.path.join(DIR, DEFAULT[m])
    if os.path.isfile(m):
        return m
    for pola in (m, m + ".mp3", m + "*.mp3"):
        k = sorted(glob.glob(os.path.join(DIR, pola)))
        if k:
            return k[0]
    sys.exit(f"musik tidak ditemukan: {m} (lihat {DIR}/LISENSI.md)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--keluar", required=True)
    ap.add_argument("--musik", default="cerita")
    ap.add_argument("--vo", help="wav VO bersih untuk kunci ducking (lebih akurat dari audio video yang memuat SFX)")
    ap.add_argument("--sfx", help="sfx.json → audio disusun ulang: VO + SFX pustaka _sfx/ + musik (audio video diabaikan)")
    ap.add_argument("--sfx-selisih", type=float, default=3.0, help="puncak SFX N dB di bawah loudness VO (default 3)")
    ap.add_argument("--vo-mulai", type=float, default=0.0, help="offset VO di timeline video (detik)")
    ap.add_argument("--selisih", type=float, help="musik (sebelum duck) N LU di bawah audio video; default cerita 6, promo 4")
    ap.add_argument("--duck", type=float, help="perkiraan turun musik saat VO (dB); default 6")
    ap.add_argument("--awal-musik", type=float, default=0.0, help="mulai dari detik ke-N trek musik")
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--tp", type=float, default=-1.5)
    a = ap.parse_args()

    musik = cari_musik(a.musik)
    # 21 Okt 2026 (diukur): selisih 6/duck 6 (cerita) & 4/6 (promo) -> musik saja ±-24 LUFS di keluaran -14 LUFS
    # 21 Okt malam: owner "musik latar terlalu keras" -> turun 6 dB + duck lebih dalam (musik saja ±-30 LUFS)
    if a.selisih is None:
        a.selisih = 10.0 if (a.musik in PROMO_KUNCI or os.path.basename(musik).startswith(("promo", "upbeat"))) else 12.0
    if a.duck is None:
        a.duck = 9.0
    D = durasi(a.video)
    with tempfile.TemporaryDirectory(prefix="mix-") as T:
        p = lambda n: os.path.join(T, n)
        if a.sfx:
            # 1) MODE SUSUN ULANG: audio video diabaikan; VO bersih + SFX pustaka _sfx/ (Mixkit) dari sfx.json
            if not a.vo:
                sys.exit("--sfx butuh --vo")
            ms = int(round(a.vo_mulai * 1000))
            run(["ffmpeg", "-v", "error", "-y", "-i", a.vo, "-af", f"aresample=48000,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms},apad,atrim=0:{D:.3f}",
                 "-c:a", "pcm_s16le", p("vo.wav")])
            run([sys.executable, os.path.join(SFXDIR, "susun.py"), a.sfx, p("sfx.wav")])
            Lvo, _ = ebur(p("vo.wav"))
            gs = (Lvo - a.sfx_selisih) - (-18.0)  # sampel _sfx dinormalisasi puncak-RMS 50 ms = -18 dBFS
            run(["ffmpeg", "-v", "error", "-y", "-i", p("vo.wav"), "-i", p("sfx.wav"), "-filter_complex",
                 f"[1]volume={gs:.2f}dB[s];[0][s]amix=inputs=2:normalize=0:duration=first[o]", "-map", "[o]", "-c:a", "pcm_s16le", p("a.wav")])
        else:
            # 1) audio video (VO+SFX tertanam) apa adanya
            run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-vn", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", p("a.wav")])
        La, _ = ebur(p("a.wav"))
        # 2) kunci ducking
        if a.vo:
            ms = int(round(a.vo_mulai * 1000))
            run(["ffmpeg", "-v", "error", "-y", "-i", a.vo, "-af", f"aresample=48000,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms},apad,atrim=0:{D:.3f}",
                 "-c:a", "pcm_s16le", p("key.wav")])
        else:
            run(["ffmpeg", "-v", "error", "-y", "-i", p("a.wav"), "-c", "copy", p("key.wav")])
        # 3) musik: loop + potong + fade, lalu set level relatif audio video
        fo = max(0.0, D - 1.0)
        run(["ffmpeg", "-v", "error", "-y", "-stream_loop", "-1", "-ss", str(a.awal_musik), "-i", musik, "-t", f"{D:.3f}",
             "-af", f"aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.5,afade=t=out:st={fo:.3f}:d=1.0",
             "-c:a", "pcm_s16le", p("m0.wav")])
        Lm, _ = ebur(p("m0.wav"))
        gain = (La - a.selisih) - Lm
        # 4) duck: ambang dihitung dari loudness kunci supaya VO biasa melewati ambang cukup untuk turun ±--duck dB (rasio 8)
        Lk, _ = ebur(p("key.wav"))
        ratio = 8.0
        thr = min(0.5, 10 ** ((Lk - a.duck * ratio / (ratio - 1)) / 20))
        run(["ffmpeg", "-v", "error", "-y", "-i", p("m0.wav"), "-i", p("key.wav"), "-filter_complex",
             f"[0]volume={gain:.2f}dB[m];[m][1]sidechaincompress=threshold={thr:.5f}:ratio={ratio}:knee=3:attack=20:release=450[d]",
             "-map", "[d]", "-c:a", "pcm_s16le", p("m.wav")])
        # 5) campur (tanpa normalisasi amix) lalu loudnorm 2 lintasan
        run(["ffmpeg", "-v", "error", "-y", "-i", p("a.wav"), "-i", p("m.wav"), "-filter_complex",
             "[0][1]amix=inputs=2:normalize=0:duration=first[o]", "-map", "[o]", "-c:a", "pcm_f32le", p("mix.wav")])
        # gain ke target lalu limiter true-peak (oversampling 4x); 2 putaran koreksi kecil karena limiter memakan sedikit loudness.
        # Mux AAC + ukur ulang di dalam loop supaya TP setelah encode juga ≤ batas (AAC bisa menaikkan puncak ±0,5 dB).
        Lpre, _ = ebur(p("mix.wav"))
        g = a.lufs - Lpre
        os.makedirs(os.path.dirname(os.path.abspath(a.keluar)), exist_ok=True)
        ceil = a.tp - 0.3
        for _ in range(4):
            lim = 10 ** (ceil / 20)
            run(["ffmpeg", "-v", "error", "-y", "-i", p("mix.wav"), "-af",
                 f"volume={g:.2f}dB,aresample=192000,alimiter=limit={lim:.4f}:attack=1:release=60:level=false,aresample=48000",
                 "-c:a", "pcm_s16le", p("akhir.wav")])
            run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-i", p("akhir.wav"), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
                 "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", a.keluar])
            I, TP = ebur(a.keluar)
            ok_i, ok_tp = abs(I - a.lufs) <= 0.3, (TP is None or TP <= a.tp + 0.4)
            if ok_i and ok_tp:
                break
            if not ok_tp:
                ceil -= (TP - a.tp) + 0.2
            if not ok_i:
                g += a.lufs - I
        Lmusik, _ = ebur_gain(p("m.wav"), g, p("m_akhir.wav"))
    print(json.dumps({"keluar": a.keluar, "musik": os.path.basename(musik), "LUFS": I, "TP": TP, "musik_saja_LUFS": round(Lmusik, 1),
                      "audio_video_awal_LUFS": La, "durasi": round(D, 2)}, ensure_ascii=False))
    if TP is not None and TP > -1.0:
        print("PERINGATAN: true peak > -1 dBTP", file=sys.stderr)


if __name__ == "__main__":
    main()
