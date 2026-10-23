# pabrik-render

Renderer otomatis video pendek 9:16 (HyperFrames + ffmpeg) di GitHub Actions.

- Spec video: `growth/video/pabrik/antrean/<kode>.json` (skema `growth/video/pabrik/spec.schema.json`).
- Push spec baru ke `main` memicu workflow `pabrik-reels`: VO, penyelarasan kata, susun adegan, render, audio, QC.
- Hasil ringan kembali ke repo ini: `growth/video/pabrik/hasil/<kode>/meta.json` + `qc.jpg`. Video disimpan di penyimpanan objek, bukan di repo.

Repo ini disinkron otomatis dari repo induk. Jangan mengubah berkas langsung di sini; perubahan akan tertimpa.
Pull request dari fork tidak menjalankan workflow apa pun.
