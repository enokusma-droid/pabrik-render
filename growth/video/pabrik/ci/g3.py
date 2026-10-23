#!/usr/bin/env python3
# Klien G3 (S3 di atas Google Drive, bucket `konten`) untuk pabrik reels. Kredensial HANYA dari env:
#   S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET, S3_REGION (opsional, default auto). Di PC boleh G3_ENV=<file .env>.
# CLI: python3 g3.py ada <key> | unduh <key> <file> | unggah <file> <key> [content-type] | daftar <prefix>
import os, sys, time, mimetypes
import boto3
from botocore.config import Config

BUCKET = os.environ.get("G3_BUCKET", "konten")

def klien():
    env = dict(os.environ)
    if env.get("G3_ENV") and os.path.exists(env["G3_ENV"]):
        env.update(dict(l.strip().split("=", 1) for l in open(env["G3_ENV"]) if "=" in l))
    for k in ("S3_ENDPOINT", "S3_ACCESS_KEY", "S3_SECRET"):
        if not env.get(k): sys.exit(f"env {k} belum diisi (lihat growth/video/pabrik/CLOUD.md)")
    return boto3.client("s3", endpoint_url=env["S3_ENDPOINT"], aws_access_key_id=env["S3_ACCESS_KEY"], aws_secret_access_key=env["S3_SECRET"],
                        region_name=env.get("S3_REGION") or "auto", config=Config(s3={"addressing_style": "path"}, retries={"max_attempts": 6, "mode": "standard"}))

def ulang(f, n=5):
    for i in range(n):
        try: return f()
        except Exception as e:
            if i == n - 1: raise
            print("G3 ulang:", str(e)[:120], file=sys.stderr); time.sleep(3 * (i + 1))

def ada(s3, key):
    try: s3.head_object(Bucket=BUCKET, Key=key); return True
    except Exception: return False

def unduh(s3, key, f):
    os.makedirs(os.path.dirname(os.path.abspath(f)), exist_ok=True)
    ulang(lambda: s3.download_file(BUCKET, key, f))

def unggah(s3, f, key, ct=None):
    ct = ct or mimetypes.guess_type(f)[0] or "application/octet-stream"
    ulang(lambda: s3.upload_file(f, BUCKET, key, ExtraArgs={"ContentType": ct}))

def daftar(s3, prefix):
    out, tok = [], None
    while True:
        kw = dict(Bucket=BUCKET, Prefix=prefix)
        if tok: kw["ContinuationToken"] = tok
        r = s3.list_objects_v2(**kw); out += [o["Key"] for o in r.get("Contents", [])]
        if not r.get("IsTruncated"): return out
        tok = r["NextContinuationToken"]

if __name__ == "__main__":
    s3 = klien(); a = sys.argv[1:]
    if a[0] == "ada": sys.exit(0 if ada(s3, a[1]) else 1)
    elif a[0] == "unduh": unduh(s3, a[1], a[2])
    elif a[0] == "unggah": unggah(s3, a[1], a[2], a[3] if len(a) > 3 else None)
    elif a[0] == "daftar": print("\n".join(daftar(s3, a[1])))
    else: sys.exit("perintah: ada|unduh|unggah|daftar")
