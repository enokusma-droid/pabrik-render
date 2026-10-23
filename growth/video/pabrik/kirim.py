#!/usr/bin/env python3
# PABRIK REELS — satu perintah untuk agen Claude CLOUD (Linux) atau PC: spec → gerbang → push ke repo CI → dispatch GitHub Actions
# → tunggu → ambil hasil+QC dari G3 → perbarui galeri md.nusawebsite.com → catat konsep/rotasi.json.
# Pakai (dari akar repo rakazo):
#   python3 growth/video/pabrik/kirim.py growth/video/pabrik/spec/dc-k5-007.json [spec lain ...] [--paralel 10] [--kualitas high]
#                                         [--tanpa-tunggu] [--tanpa-galeri] [--tanpa-rotasi] [--ulang]
#   python3 growth/video/pabrik/kirim.py --status <run_id>      → lanjut menunggu run yang sudah berjalan lalu ambil hasilnya
#   python3 growth/video/pabrik/kirim.py --galeri                → hanya bangun ulang galeri md dari semua hasil di G3
# Kredensial HANYA dari env (lihat CLOUD.md): PABRIK_GH_TOKEN, S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET, S3_REGION, MD_PUSH_TOKEN.
# Tidak pernah memposting/menjadwalkan apa pun: hasil hanya di G3 + galeri md untuk dinilai owner.
import argparse, base64, datetime, glob, json, os, shutil, subprocess, sys, time, urllib.request, urllib.error
for _s in (sys.stdout, sys.stderr): _s.reconfigure(encoding="utf-8", errors="replace")  # konsol Windows cp1252

P = os.path.dirname(os.path.abspath(__file__))           # growth/video/pabrik
V = os.path.dirname(P)                                    # growth/video
ROOT = os.path.abspath(os.path.join(V, "..", ".."))       # akar repo rakazo
sys.path.insert(0, os.path.join(P, "ci"))
REPO = os.environ.get("PABRIK_CI_REPO", "repo-ci-lama/tidak-dipakai")
CIDIR = os.path.join(P, "_ci-repo")
WIB = datetime.timezone(datetime.timedelta(hours=7))

def env(k, wajib=True):
    v = os.environ.get(k, "").strip()
    if wajib and not v: sys.exit(f"env {k} belum diisi (lihat growth/video/pabrik/CLOUD.md)")
    return v

def sh(args, cwd=None, cek=True, diam=False):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if not diam and r.stdout.strip(): print(r.stdout.strip()[-2000:])
    if cek and r.returncode:
        aman = " ".join("<auth>" if ("extraheader" in x or "AUTHORIZATION" in x) else x for x in args)  # jangan pernah cetak token
        sys.exit(f"GAGAL: {aman[:200]}\n{r.stderr[-2000:]}")
    return r

def gh(method, path, data=None):
    req = urllib.request.Request(f"https://api.github.com/{path}", method=method, data=json.dumps(data).encode() if data is not None else None,
                                 headers={"Authorization": f"Bearer {env('PABRIK_GH_TOKEN')}", "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"})
    for i in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                b = r.read(); return json.loads(b) if b else {}
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code in (422, 502, 503) and i < 4: print(f"GitHub {e.code} {msg} → ulang"); time.sleep(10); continue
            sys.exit(f"GitHub API {method} {path} → {e.code} {msg}")
        except urllib.error.URLError as e:
            if i < 4: time.sleep(10); continue
            sys.exit(f"GitHub API tak terjangkau: {e}")

def git(*a, cwd=CIDIR, cek=True):
    tok = base64.b64encode(f"x-access-token:{env('PABRIK_GH_TOKEN')}".encode()).decode()
    return sh(["git", "-c", f"http.https://github.com/.extraheader=AUTHORIZATION: basic {tok}", "-c", "user.name=pabrik-reels", "-c", "user.email=ci@nusawebsite.com", *a], cwd=cwd, cek=cek, diam=True)

# ---------- 1. gerbang ----------
def gerbang(spec_f):
    r = sh(["node", os.path.join(P, "bangun.mjs"), spec_f, "--periksa"], cek=False, diam=True)
    if r.returncode: print(r.stderr.strip()); sys.exit(f"GERBANG GAGAL: {spec_f}")
    for l in r.stderr.strip().splitlines(): print("  ", l)
    return json.loads(r.stdout.strip().splitlines()[-1])

# ---------- 2. sinkron repo CI ----------
SALIN = [("growth/video/_musik/mix.py",) * 2, ("growth/video/_musik/qc.py",) * 2, ("growth/video/_sfx/susun.py",) * 2, ("growth/video/_sfx/peta.json",) * 2,
         ("growth/video/format-jasa/templat/F3/waktu.py",) * 2, ("growth/video/format-jasa/_bahan/watermark.mjs",) * 2,
         ("growth/video/pabrik/ci/pabrik.yml", ".github/workflows/pabrik.yml")]
ABAIKAN = shutil.ignore_patterns("_aset", "kerja", "_ci-repo", "hasil", "spec", "_kerja-*", "gambar", "__pycache__", "*.png", "*.jpg", "*.mp4", "*.wav", "node_modules")

def sinkron(specs):
    if not os.path.isdir(os.path.join(CIDIR, ".git")):
        shutil.rmtree(CIDIR, ignore_errors=True)
        git("clone", "-q", "--depth", "1", f"https://github.com/{REPO}.git", CIDIR, cwd=P)
    else:
        git("fetch", "-q", "--depth", "1", "origin", "main"); git("reset", "-q", "--hard", "FETCH_HEAD")
    dst = os.path.join(CIDIR, "growth/video/pabrik")
    simpan = os.path.join(CIDIR, ".spec-lama")
    if os.path.isdir(os.path.join(dst, "spec")): shutil.move(os.path.join(dst, "spec"), simpan)
    shutil.rmtree(dst, ignore_errors=True)
    shutil.copytree(P, dst, ignore=ABAIKAN)
    os.makedirs(os.path.join(dst, "spec"), exist_ok=True)
    if os.path.isdir(simpan):
        for f in glob.glob(os.path.join(simpan, "*.json")): shutil.copy(f, os.path.join(dst, "spec"))
        shutil.rmtree(simpan)
    for f in specs: shutil.copy(f, os.path.join(dst, "spec", os.path.basename(f)))
    for src, d in SALIN:
        os.makedirs(os.path.dirname(os.path.join(CIDIR, d)), exist_ok=True); shutil.copy(os.path.join(ROOT, src), os.path.join(CIDIR, d))
    gi = os.path.join(CIDIR, ".gitignore"); isi = open(gi).read() if os.path.exists(gi) else ""
    for l in ["growth/video/pabrik/_aset/", "growth/video/pabrik/kerja/", "growth/video/_musik/kandidat/", "growth/video/_sfx/*.wav", "*.ttf", "__pycache__/"]:
        if l not in isi.splitlines(): isi += ("" if isi.endswith("\n") or not isi else "\n") + l + "\n"
    open(gi, "w").write(isi)
    git("add", "-A")
    if git("diff", "--cached", "--quiet", cek=False).returncode:
        git("commit", "-q", "-m", f"pabrik: {', '.join(os.path.basename(f)[:-5] for f in specs)} {datetime.datetime.now(WIB):%Y-%m-%d %H:%M}")
        for i in range(3):
            if git("push", "-q", "origin", "HEAD:main", cek=False).returncode == 0: break
            git("fetch", "-q", "--depth", "1", "origin", "main", cek=False); git("rebase", "-q", "FETCH_HEAD", cek=False)
        else: sys.exit("push ke repo CI gagal (cek PABRIK_GH_TOKEN / koneksi)")
    print(f"repo CI {REPO} tersinkron ({git('rev-parse', '--short', 'HEAD').stdout.strip()})")

# ---------- 3. dispatch & tunggu ----------
def dispatch(kodes, paralel, kualitas):
    t0 = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(seconds=5)
    gh("POST", f"repos/{REPO}/actions/workflows/pabrik.yml/dispatches", {"ref": "main", "inputs": {"kode": ",".join(kodes), "paralel": str(paralel), "kualitas": kualitas}})
    for _ in range(30):
        time.sleep(6)
        runs = gh("GET", f"repos/{REPO}/actions/workflows/pabrik.yml/runs?event=workflow_dispatch&per_page=10").get("workflow_runs", [])
        baru = [r for r in runs if datetime.datetime.fromisoformat(r["created_at"].replace("Z", "+00:00")) >= t0]
        if baru: r = baru[-1]; print(f"run {r['id']} → {r['html_url']}"); return r["id"]
    sys.exit("run workflow tidak muncul (cek tab Actions repo CI)")

def tunggu(run_id, batas_menit=240):
    t0 = time.time(); last = ""
    while True:
        r = gh("GET", f"repos/{REPO}/actions/runs/{run_id}")
        jobs = gh("GET", f"repos/{REPO}/actions/runs/{run_id}/jobs?per_page=50").get("jobs", [])
        st = " ".join(f"{j['name'].replace('video ', '')}:{j['conclusion'] or j['status']}" for j in jobs if j["name"] != "siapkan")
        if st != last: print(f"[{int((time.time() - t0) / 60)} mnt] {r['status']} {st}"); last = st
        if r["status"] == "completed": return r["conclusion"], jobs
        if time.time() - t0 > batas_menit * 60: sys.exit(f"run {run_id} belum selesai setelah {batas_menit} mnt; lanjutkan: kirim.py --status {run_id}")
        time.sleep(30)

# ---------- 4. hasil ----------
def ambil_hasil(kodes, run_id=None):
    import g3
    s3 = g3.klien(); out = []
    for k in kodes:
        d = os.path.join(P, "hasil", k); os.makedirs(d, exist_ok=True)
        if not g3.ada(s3, f"pabrik/hasil/{k}.json"): out.append({"kode": k, "ok": False, "alasan": "hasil belum ada di G3"}); continue
        g3.unduh(s3, f"pabrik/hasil/{k}.json", os.path.join(d, "hasil.json")); g3.unduh(s3, f"pabrik/hasil/{k}-qc.jpg", os.path.join(d, "qc.jpg"))
        h = json.load(open(os.path.join(d, "hasil.json"), encoding="utf-8"))
        if run_id and str(h.get("run")) != str(run_id): out.append({"kode": k, "ok": False, "alasan": f"hasil di G3 dari run lain ({h.get('run')})"}); continue
        out.append({"kode": k, "ok": True, **{x: h.get(x) for x in ("brand", "konsep", "judul", "durasi", "lulus_qc")}, "LUFS": h["qc"].get("LUFS"), "TP": h["qc"].get("TP"), "cocok_%": h["qc"].get("cocok_naskah_%"), "qc_jpg": os.path.relpath(os.path.join(d, "qc.jpg"), ROOT)})
    return out

def galeri():
    import g3
    s3 = g3.klien(); semua = []
    for key in g3.daftar(s3, "pabrik/hasil/"):
        if key.endswith(".json"):
            f = os.path.join(P, "hasil", "_galeri.json"); os.makedirs(os.path.dirname(f), exist_ok=True); g3.unduh(s3, key, f)
            semua.append(json.load(open(f, encoding="utf-8")))
    kodes = {h["kode"] for h in semua}
    # hanya versi final: buang uji & versi yang sudah punya revisi (<kode>-r2, -r3, ...)
    semua = [h for h in semua if "uji" not in h["kode"] and not any(k.startswith(h["kode"] + "-r") for k in kodes)]
    semua.sort(key=lambda h: h["kode"])
    md = ["# Pabrik Reels: hasil produksi (DentalCare + Nusawebsite)", "",
          f"Diperbarui otomatis oleh `growth/video/pabrik/kirim.py` {datetime.datetime.now(WIB):%d %b %Y %H:%M} WIB. Total {len(semua)} video. Belum ada yang diposting; owner menilai di sini dulu.", ""]
    import html as _html
    def sumber(h):  # Directus (R2, cepat, publik) bila meta.json lokal punya directus_url; selain itu G3 lewat jembatan md
        mf = os.path.join(P, "hasil", h["kode"], "meta.json")
        m = json.load(open(mf, encoding="utf-8")) if os.path.exists(mf) else {}
        return m.get("directus_url") or f"/media/g3/konten/pabrik/hasil/{h['kode']}.mp4", m.get("directus_poster_url")
    def kartu(h):
        src, poster = sumber(h)
        cap = _html.escape(f"{h['kode']} · {h['konsep']} · {h['judul']} · {h.get('durasi', '?')} dtk · {h['qc'].get('LUFS')} LUFS{'' if h.get('lulus_qc') else ' · QC PERIKSA'}")
        pa = f' poster="{_html.escape(poster)}"' if poster else ""
        return f'<figure class="vid"><video controls playsinline preload="none"{pa} src="{_html.escape(src)}" aria-label="{cap}"></video><figcaption>{cap}</figcaption></figure>'
    for b, nm in (("dentalcare", "DentalCare"), ("nusawebsite", "Nusawebsite")):
        hs = [h for h in semua if h["brand"] == b]
        if not hs: continue
        md += [f"## {nm} ({len(hs)} video)", ""]
        # satu blok HTML tanpa baris kosong → grid reader (3 per baris laptop); preload=none + poster = halaman cepat
        md += ['<div class="vid-grid">'] + [kartu(h) for h in hs] + ["</div>", ""]
        md += ["| kode | konsep | judul | durasi | LUFS | TP | cocok VO |", "|---|---|---|---|---|---|---|"]
        md += [f"| {h['kode']} | {h['konsep']} | {h['judul']} | {h.get('durasi')} | {h['qc'].get('LUFS')} | {h['qc'].get('TP')} | {h['qc'].get('cocok_naskah_%')}% |" for h in hs]
        md.append("")
    data = "\n".join(md).encode()
    req = urllib.request.Request("https://md.nusawebsite.com/api/doc/pabrik-reels", method="PUT", data=data, headers={"X-Token": env("MD_PUSH_TOKEN"), "content-type": "text/markdown", "User-Agent": "pabrik-reels/1.0 (curl-compatible)"})  # tanpa UA, Cloudflare menolak urllib (403)
    with urllib.request.urlopen(req, timeout=60) as r: res = json.loads(r.read())
    print("galeri:", res.get("url"))
    return res.get("url")

def rotasi(hasil):
    f = os.path.join(V, "konsep", "rotasi.json"); j = json.load(open(f, encoding="utf-8"))
    ada = {e.get("kode") for e in j["riwayat"]}; n = 0
    for h in hasil:
        if not h["ok"] or h["kode"] in ada: continue
        j["riwayat"].append({"tanggal": datetime.datetime.now(WIB).strftime("%Y-%m-%d"), "brand": h["brand"], "konsep": h["konsep"], "judul": h["judul"],
                             "kode": h["kode"], "file": f"g3:konten/pabrik/hasil/{h['kode']}.mp4", "catatan": "pabrik reels, belum terbit"}); n += 1
    json.dump(j, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1); print(f"rotasi.json +{n} entri (commit + push repo rakazo setelahnya)")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec", nargs="*"); ap.add_argument("--paralel", type=int, default=10); ap.add_argument("--kualitas", default="high")
    ap.add_argument("--tanpa-tunggu", action="store_true"); ap.add_argument("--tanpa-galeri", action="store_true"); ap.add_argument("--tanpa-rotasi", action="store_true")
    ap.add_argument("--status", help="run id yang sudah berjalan"); ap.add_argument("--kode", help="kode dipisah koma (untuk --status)"); ap.add_argument("--galeri", action="store_true")
    a = ap.parse_args()
    if a.galeri: galeri(); return
    if a.status:
        if not a.kode: sys.exit("--status butuh --kode k1,k2")
        kodes = a.kode.split(",")
        hasil_akhir(a, kodes, a.status); return
    if not a.spec: ap.error("beri minimal satu spec .json")
    if len(a.spec) > 10: sys.exit("maks 10 spec per batch (kuota & paralel GitHub Actions)")
    specs = [os.path.abspath(f) for f in a.spec]
    kodes = []
    for f in specs:
        info = gerbang(f); kodes.append(info["kode"])
        if os.path.basename(f) != info["kode"] + ".json": sys.exit(f"nama berkas spec harus <kode>.json: {f}")
        print(f"LULUS gerbang {info['kode']}: {info['kata']} kata, ±{info['perkiraan_dtk']} dtk, {info['adegan']} adegan, musik {info['musik']}")
    env("PABRIK_GH_TOKEN"); env("S3_ENDPOINT")
    sinkron(specs)
    run = dispatch(kodes, min(10, a.paralel), a.kualitas)
    if a.tanpa_tunggu: print(f"lanjutkan nanti: python3 growth/video/pabrik/kirim.py --status {run} --kode {','.join(kodes)}"); return
    hasil_akhir(a, kodes, run)

def hasil_akhir(a, kodes, run):
    kes, jobs = tunggu(run)
    for j in jobs:
        if j["conclusion"] not in ("success", None) and j["name"] != "siapkan": print(f"GAGAL {j['name']}: {j['html_url']} (log: buka link, langkah gagal)")
    hs = ambil_hasil(kodes, run)
    print(json.dumps(hs, ensure_ascii=False, indent=1))
    if not a.tanpa_rotasi: rotasi(hs)
    if not a.tanpa_galeri and any(h["ok"] for h in hs): galeri()
    if not all(h["ok"] for h in hs): sys.exit(1)

if __name__ == "__main__":
    main()
