# SFX — lisensi

Semua SFX dari **Mixkit** (https://mixkit.co/free-sound-effects/), diunduh 21 Okt 2026 lewat `ambil.py`
(URL `https://assets.mixkit.co/active_storage/sfx/<id>/<id>.wav`), lalu dipotong + diseragamkan levelnya.

Lisensi: **Mixkit Sound Effects Free License** (https://mixkit.co/license/#sfxFree), dibaca 21 Okt 2026:
"Items under the Mixkit Sound Effects Free License can be used in your commercial and non-commercial projects for free."
Daftar pemakaian yang disebut: YouTube videos, Social Media video posts, Online marketing ads, Commercial projects, dll.
Tidak ada kewajiban atribusi. Larangan: menjual/menyebarkan ulang file SFX-nya sendiri (sebagai stok/template), mengklaim
sebagai milik sendiri, atau mendaftarkannya ke layanan Content ID / manajemen hak.

| File | Mixkit id | Judul asli |
|---|---|---|
| whoosh-1.wav | 1490 | Fast whoosh transition |
| whoosh-2.wav | 3115 | Fast transitions swoosh |
| pop-1.wav | 731 | Cartoon bubble pop |
| pop-2.wav | 3069 | Game balloon or bubble pop |
| ding-1.wav | 2870 | Correct answer tone |
| ding-2.wav | 600 | Achievement bell |
| stamp-1.wav | 2182 | Wood hard hit |
| thud-1.wav | 2151 | Soft quick punch |
| boing-1.wav | 2894 | Boing hit sound |
| kertas-1.wav | 1530 | Paper slide |
| kertas-2.wav | 2380 | Paper quick movement |
| spidol-1.wav | 2369 | Writing scribble on paper |
| turun-1.wav | 744 | Trombone disappoint |
| tumpuk-1.wav | 2381 | Pile of paper trash |
| tik-1.wav | 1063 | Fast wall clock ticking |
| tegang-1.wav | 674 | Cartoon suspense |
| boom-1.wav | 3082 | Magic sparkle poof hit |
| byur-1.wav | 2884 | Funny cartoon splash |
| sobek-1.wav | 2384 | Paper quick slice |
| kaget-1.wav | 967 | Cartoon surprise gasp |
| sparkle-1.wav | 3083 | Magic sparkle touch |
| pintu-1.wav | 195 | Creaky door open |
| meong-1.wav | 91 | Cartoon little cat meow |
| jantung-1.wav | 494 | Slow heartbeat |
| horor-1.wav | 773 | Horror impact |
| korslet-1.wav | 2595 | Small electric glitch |
| seram-1.wav | 2482 | Horror ambience |

Peta jenis → file: `peta.json`. Penyusun track: `susun.py` (dipanggil `../_musik/mix.py --sfx sfx.json`).
Tambah jenis: tambah baris di `DAFTAR` pada `ambil.py`, jalankan `py -3.10 ambil.py --hanya <jenis baru...>` (hanya unduh jenis itu, peta.json digabung), tambahkan baris tabel di atas.
