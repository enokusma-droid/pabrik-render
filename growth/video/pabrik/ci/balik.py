#!/usr/bin/env python3
# CI rakazo (mode cloud tanpa rahasia): tulis hasil ringan kembali ke repo setelah job video selesai.
# Pakai: python3 balik.py <dir artifact> <kode1,kode2,...> <url run>
#   <dir artifact>/qc-<kode>/{qc.jpg,hasil.json} (dari job video). Kode tanpa hasil.json = gagal → meta.json {gagal:true} agar agen cloud berhenti menunggu.
# Keluaran repo: growth/video/pabrik/hasil/<kode>/qc.jpg (≤300 KB) + meta.json, growth/video/konsep/rotasi.json; galeri md (env MD_PUSH_TOKEN + S3_*).
import json, os, sys, datetime
from PIL import Image
P = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, P); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kirim
art, kodes, run_url = sys.argv[1], [k for k in sys.argv[2].split(",") if k], sys.argv[3]
WIB = datetime.timezone(datetime.timedelta(hours=7))
GALERI = "https://md.nusawebsite.com/d/pabrik-reels"
hasil = []
for k in kodes:
    d = os.path.join(P, "hasil", k); os.makedirs(d, exist_ok=True)
    src = os.path.join(art, f"qc-{k}")
    hj = os.path.join(src, "hasil.json")
    if not os.path.exists(hj):
        json.dump({"kode": k, "gagal": True, "lulus_qc": False, "run": run_url, "waktu": datetime.datetime.now(WIB).isoformat(timespec="minutes"),
                   "pesan": "job video gagal; buka run untuk log (langkah Produksi). Perbaiki spec lalu kirim dengan kode revisi baru (mis. -r2)."},
                  open(os.path.join(d, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        hasil.append({"kode": k, "ok": False}); print("GAGAL", k); continue
    h = json.load(open(hj, encoding="utf-8")); q = h.get("qc", {})
    im = Image.open(os.path.join(src, "qc.jpg")).convert("RGB"); qual, skala = 82, 1.0
    while True:
        im2 = im.resize((int(im.width * skala), int(im.height * skala))) if skala < 1 else im
        im2.save(os.path.join(d, "qc.jpg"), quality=qual)
        if os.path.getsize(os.path.join(d, "qc.jpg")) <= 300_000 or qual < 40: break
        qual -= 8; skala *= 0.9
    meta = {"kode": k, "brand": h["brand"], "konsep": h["konsep"], "judul": h["judul"], "durasi": h.get("durasi"), "LUFS": q.get("LUFS"), "TP": q.get("TP"),
            "cocok_vo_%": q.get("cocok_longgar_%", q.get("cocok_naskah_%")), "cocok_ketat_%": q.get("cocok_naskah_%"), "transkrip_15dtk": q.get("transkrip"), "lulus_qc": h.get("lulus_qc"), "musik": h.get("musik"),
            "g3": f"konten/pabrik/hasil/{k}.mp4", "md_video": f"/media/g3/konten/pabrik/hasil/{k}.mp4", "galeri": GALERI, "run": run_url,
            "waktu": datetime.datetime.now(WIB).isoformat(timespec="minutes"), "catatan_bangun": h.get("catatan", [])}
    # anti-template (owner 22 Okt): bandingkan dHash ±3 dtk pertama dengan semua hasil lain → mirip_awal (jarak rata-rata ≤ 10 dari 64 bit)
    if h.get("phash_awal"):
        meta["phash_awal"] = h["phash_awal"]; mirip = []
        for k2 in sorted(os.listdir(os.path.join(P, "hasil"))):
            f2 = os.path.join(P, "hasil", k2, "meta.json")
            if k2 == k or not os.path.exists(f2): continue
            try: ph2 = json.load(open(f2, encoding="utf-8")).get("phash_awal")
            except Exception: continue
            if not ph2: continue
            jarak = sum(bin(int(a, 16) ^ int(b, 16)).count("1") for a, b in zip(h["phash_awal"], ph2)) / len(ph2)
            if jarak <= 10: mirip.append({"kode": k2, "jarak": round(jarak, 1)})
        meta["mirip_awal"] = sorted(mirip, key=lambda x: x["jarak"])
    json.dump(meta, open(os.path.join(d, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    hasil.append({"kode": k, "ok": True, "brand": h["brand"], "konsep": h["konsep"], "judul": h["judul"]}); print("OK", k, meta["durasi"], meta["LUFS"], meta["lulus_qc"])
kirim.rotasi(hasil)
if any(x["ok"] for x in hasil) and os.environ.get("MD_PUSH_TOKEN"):
    try: kirim.galeri()
    except Exception as e: print("galeri gagal:", e)
