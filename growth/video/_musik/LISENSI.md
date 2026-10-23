# Musik latar — lisensi

Semua trek diunduh 21 Okt 2026 dari **YouTube Audio Library** (YouTube Studio channel nusawebsite → Koleksi audio → Musik),
lewat Chrome profil claude-chrome. Kolom "Jenis lisensi" tiap trek = **Lisensi Koleksi Audio YouTube**: "Anda dapat menggunakan
trek audio ini di video Anda mana pun, termasuk video yang dimonetisasi. Atribusi tidak diperlukan." (dicek per baris saat unduh).
Semua instrumental (dicek transkrip faster_whisper: tanpa lirik).

| File | Judul | Artis | Genre / mood (Studio) | Durasi | Dipakai untuk |
|---|---|---|---|---|---|
| cerita-silly-snickerdoodle.mp3 | Silly Snickerdoodle | Joel Cummins | Anak-anak / Gembira | 2:03 | **default `cerita`** (gaya A, lucu/quirky) |
| cerita-goofy-gubbins.mp3 | Goofy Gubbins | Joel Cummins | Anak-anak / Gembira | 1:41 | cadangan cerita |
| promo-shake-it.mp3 | Shake It | Aakash Gandhi | Dance & Elektronik / Gembira | 1:52 | **default `promo`** (gaya B, upbeat) |
| promo-like-it-loud.mp3 | Like It Loud | Dyalla | Dance & Elektronik / Gembira | 2:45 | cadangan promo |
| promo-ticklish.mp3 | Ticklish | Quincas Moreira | Dance & Elektronik / Gembira | 3:39 | cadangan promo |

Sumber: https://studio.youtube.com/channel/UC2nZaufQkgHokf7UdStpB_Q/music (butuh login channel; file diambil dari URL unduhan
yang dibuat tombol "Download"). Bantuan resmi: https://support.google.com/youtube/answer/3376882

Catatan: halaman bantuan YouTube yang dibaca hanya membahas pemakaian di YouTube. Pemakaian di IG/TikTok belum saya temukan
tertulis eksplisit di sumber itu → untuk iklan berbayar di Meta/TikTok, pertimbangkan musik dari pustaka platform itu sendiri.

Pakai: `py -3.10 mix.py --video in.mp4 --keluar out.mp4 --musik cerita|promo|<nama-file-tanpa-.mp3> --vo vo.wav --vo-mulai <AUD> --sfx sfx.json`

## Kandidat Pixabay (21 Okt 2026) — `kandidat/<suasana>/`, uji: `uji-kandidat.py kandidat/daftar.json`

Sumber: **Pixabay Music**, diunduh 21 Okt 2026 (URL unduhan `cdn.pixabay.com/download/audio/...` dari halaman trek).
Lisensi = **Pixabay Content License** (https://pixabay.com/service/license-summary/): gratis, komersial boleh, tanpa atribusi,
boleh diubah; dilarang menjual/mendistribusikan trek berdiri sendiri. FAQ Pixabay (https://pixabay.com/service/faq/) tertulis:
"Yes, you can use Pixabay ... music ... on social media platforms" → IG/TikTok/YouTube OK.
**Content ID**: FAQ Pixabay mengakui sebagian kontributor mendaftarkan trek ke YouTube Content ID (klaim otomatis, bukan strike).
Semua kandidat di bawah dipilih yang halamannya **TIDAK** berlabel "Content ID Registered" (dicek 21 Okt; 85 dari 504 trek yang
diperiksa lolos). Label bisa berubah → cek ulang halaman trek sebelum dipakai produksi. Semua instrumental (cek faster_whisper: tanpa lirik).
BPM = librosa beat_track (±2-3 BPM; pustaka membulatkan ke kisi tempo).

| Kode | File | Judul | Artis | BPM | Sumber |
|---|---|---|---|---|---|
| M01 | ceria/dancing-needles.mp3 | Dancing Needles | ondrosik | 120 | https://pixabay.com/music/comedy-dancing-needles-574917/ |
| M02 | ceria/ukulele-happy.mp3 | Ukulele Happy | 331music | 120 | https://pixabay.com/music/happy-childrens-tunes-ukulele-happy-595411/ |
| M03 | ceria/quirky.mp3 | Quirky | MaksymMalko | 123 | https://pixabay.com/music/eccentric-quirky-quirky-quirky-music-616896/ |
| M04 | ceria/bouncy-mischief.mp3 | Funny Bouncy Cartoon Mischief | alex-morgan | 124 | https://pixabay.com/music/cartoons-funny-bouncy-cartoon-mischief-578469/ |
| M05 | ceria/whimsical-adventure.mp3 | Whimsical Cartoon Adventure | JorisVermeer | 126 | https://pixabay.com/music/cartoons-whimsical-cartoon-adventure-608929/ |
| M06 | upbeat/upbeat-atlas.mp3 | Upbeat | AtlasAudio | 86 | https://pixabay.com/music/beats-upbeat-upbeat-music-576661/ |
| M07 | upbeat/upbeat-mountain.mp3 | Upbeat | The_Mountain | 91 | https://pixabay.com/music/old-school-hip-hop-upbeat-upbeat-music-567445/ |
| M08 | upbeat/corporate-upbeat.mp3 | Corporate Upbeat | The_Mountain | 115 | https://pixabay.com/music/corporate-corporate-upbeat-610127/ |
| M09 | tegang/comedy-detective.mp3 | Comedy Detective | _Music_for_Creators_ | 115 | https://pixabay.com/music/bloopers-comedy-detective-127185/ |
| M10 | tegang/who-ate-cookies.mp3 | Who Ate The Cookies | GoldenSoundLabs | 120 | https://pixabay.com/music/cartoons-who-ate-the-cookies-223665/ |
| M11 | tegang/mystery.mp3 | Mystery | Monume | 120 | https://pixabay.com/music/mystery-mystery-603971/ |
| M12 | tegang/funny-pumpkin.mp3 | Halloween Funny Pumpkin (Cute Horror) | BombinSound | 110 | https://pixabay.com/music/scary-childrens-tunes-halloween-funny-pumpkin-cute-horror-619376/ |
| M13 | tegang/cute-ghost-story.mp3 | A Cute Ghost Story | MMAudio | 115 | https://pixabay.com/music/eccentric-quirky-a-cute-ghost-story-512522/ |
| M14 | haru/emotional-piano-atlas.mp3 | Emotional Piano | AtlasAudio | 118 | https://pixabay.com/music/solo-piano-emotional-piano-621564/ |
| M15 | haru/emotional-piano-pj.mp3 | Emotional Piano | prettyjohn1 | 110 | https://pixabay.com/music/solo-piano-emotional-piano-487334/ |
| M16 | lofi/lofi-pj.mp3 | LoFi | prettyjohn1 | 115 | https://pixabay.com/music/lofi-lofi-lofi-music-587176/ |
| M17 | lofi/lofi-chill.mp3 | Lofi Chill | JonasBlakewood | 92 | https://pixabay.com/music/lofi-lofi-chill-lofi-chill-music-573480/ |

BPM musik lama (diukur sama): Silly Snickerdoodle 99, Goofy Gubbins 152 (≈76 setengah), Shake It / Like It Loud / Ticklish 118-120.
