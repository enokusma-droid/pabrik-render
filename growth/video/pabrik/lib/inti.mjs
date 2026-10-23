// Inti pabrik reels: timing VO per adegan + pembangun elemen paper cutout + animasi GSAP (seek-safe).
// Diekstrak dari generator contoh lulus owner (gaya-cerita/buat.mjs = K0, konsep/K1..K8/buat.mjs), 21 Okt 2026.
// Dipakai oleh bangun.mjs + lib/tema.mjs + lib/primitif.mjs. Jangan ubah ukuran/posisi tanpa melihat frame hasil.
export const VW = 1080, VH = 1920, AUD = 0.3;
export const f2 = (n) => +(+n).toFixed(2);
export const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, "");
// profil per brand (22 Okt 2026: brand ke-3 Ratu Bawang). logo = id aset katalog; cue = kata VO tempat logo muncul;
// wa = teks tombol CTA; plat = latar pelat logo (logo Ratu Bawang berlatar ivory, bukan transparan); ikon = watermark ikon kanan atas (tanpa nomor).
export const BRAND = {
  dentalcare: { logo: "dc-logo", cue: "DentalCare", wa: "Tanya lewat WhatsApp di profil" },
  nusawebsite: { logo: "nw-logo", cue: "aplikasi", wa: "Tanya lewat WhatsApp di profil" },
  "ratu-bawang": { logo: "rb-logo", cue: "Ratu", wa: "Pesan lewat WhatsApp di profil", plat: "#FAF9F5", ikon: "rb-logo-ikon" },
};
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

export function mulai({ naskah, W, katalog, brand }) {
  const N = naskah.length;
  const TOTAL = f2(W.durasi + AUD + 1.6);
  // lembar adegan baru masuk SAAT jeda VO (maks 0,5 dtk sebelum kata pertama) — pelajaran 21 Okt (lembar kosong ±0,3 dtk)
  const bS = naskah.map((_, i) => (i === 0 ? 0 : f2(Math.min(W.blok[i].s + AUD - 0.15, Math.max(W.blok[i - 1].e + AUD + 0.1, W.blok[i].s + AUD - 0.5)))));
  const bE = naskah.map((_, i) => (i < N - 1 ? bS[i + 1] : TOTAL));
  const kataBlok = (bi) => W.kata.filter((k) => k.b === bi);
  const V = { profil: BRAND[brand] || BRAND.nusawebsite, N, TOTAL, bS, bE, W, naskah, katalog, brand, html: "", js: [], SFX: [], SC: [], z: 10, aset: new Set(), font: new Set(["Marker"]), log: [] };
  const K = (s) => V.js.push(s);
  const sfx = (t, jenis, vol = 1) => V.SFX.push({ t: f2(t), jenis, vol });
  V.K = K; V.sfx = sfx; V.kataBlok = kataBlok;

  // ---------- waktu ----------
  // cue kata: waktu kata VO di blok bi yang cocok dengan `word` (awalan); null bila tidak ketemu
  V.cariKata = (bi, word, mulaiDari = 0) => {
    const t = norm(word); if (t.length < 2) return null;
    const k = kataBlok(bi).filter((x) => x.s + AUD >= mulaiDari).find((x) => x.w.startsWith(t) || (t.startsWith(x.w) && x.w.length > 3));
    return k ? f2(k.s + AUD - 0.06) : null;
  };
  V.cue = (bi, word, frac = 0.3) => {
    const t = word ? V.cariKata(bi, word) : null;
    if (t != null) return t;
    if (word) V.log.push(`cue tidak ketemu: adegan ${bi} "${word}"`);
    return f2(bS[bi] + (bE[bi] - bS[bi]) * frac);
  };
  // waktu otomatis elemen ke-k dari n: kata (bila diberi) → kata pertama teks elemen yang muncul di VO → sebar 10-62% adegan
  V.waktu = (bi, { kata, teks, k = 0, n = 1, min = 0.15 } = {}) => {
    const s = bS[bi], d = bE[bi] - s;
    let t = kata ? V.cariKata(bi, kata) : null;
    if (t == null && kata) V.log.push(`kata "${kata}" tidak ada di VO adegan ${bi + 1}`);
    if (t == null && teks) {
      for (const w of String(teks).replace(/<[^>]+>/g, " ").split(/\s+/).map(norm).filter((x) => x.length >= 4)) { t = V.cariKata(bi, w); if (t != null) break; }
    }
    if (t == null) t = s + Math.min(0.3, d * 0.1) + (n > 1 ? (k / (n - 1)) * d * 0.52 : d * 0.12);
    return f2(Math.max(s + min, Math.min(t, s + d * 0.8)));
  };
  V.akhirVO = (bi) => f2((kataBlok(bi).at(-1)?.e ?? (bE[bi] - AUD)) + AUD);

  // ---------- aset ----------
  V.A = (id) => {
    const a = katalog[id]; if (!a) throw new Error(`aset tidak ada di katalog: ${id}`);
    V.aset.add(id); return a;
  };
  V.src = (id) => `assets/${V.A(id).nama}`;

  // ---------- pembangun elemen ----------
  const T = (txt, css) => `<div class="tx" style="position:absolute;${css}">${txt}</div>`;
  V.T = T;
  V.P = (id, { x, y, w, h, r = 0, c = "white", rad = 14, hi = false, inner = "", st = "", ppst = "" }) =>
    `<div class="it" id="${id}" data-r="${r}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}"><div class="b b-j"><div class="pp ${c}${hi ? " ppH" : ""}" style="border-radius:${rad}px;${ppst}"></div>${inner}</div></div>`;
  V.kartu = (id, { x, y, w, h, text, r = -2, fs = 76, color = "#1B2A4A", bg = "#FFFDF8", font = "Marker", align = "center", hi = true }) =>
    V.P(id, { x, y, w, h, r, c: "", hi, ppst: `background:${bg}`, inner: T(text, `left:30px;right:30px;top:50%;transform:translateY(-50%);text-align:${align};font:400 ${fs}px/1.12 '${font}';color:${color}`) });
  V.tag = (id, { x, y, text, c = "white", color = "#1B2A4A", fs = 54, r = -2, hi = false, anchor = "left", bg = "" }) => {
    const pos = anchor === "left" ? `left:${x}px` : anchor === "right" ? `right:${VW - x}px` : `left:${x}px;transform:translateX(-50%)`;
    return `<div style="position:absolute;${pos};top:${y}px"><div class="it strip" id="${id}" data-r="${r}" style="position:relative;padding:${Math.round(fs * 0.36)}px ${Math.round(fs * 0.7)}px ${Math.round(fs * 0.28)}px"><div class="b b-j strip" style="position:static"><div class="pp ${c}${hi ? " ppH" : ""}" style="border-radius:12px;${bg ? `background:${bg}` : ""}"></div><div class="tx" style="font-size:${fs}px;color:${color}">${text}</div></div></div></div>`;
  };
  // 22 Okt (nw): stempel panjang terpotong tepi kanan (layar x560 "ANTI DOBEL", wawancara "KULKAS: NOL") -> geser kiri bila perkiraan lebar melewati 1060
  V.stempel = (id, { x, y, text, r = -12, fs = 74, color = "#C62828", latar = "rgba(255,253,246,.93)" }) => (x = Math.round(Math.max(20, Math.min(x, 1060 - (String(text).replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, "x").length * (fs * 0.7 + 3) + 78)))),
    `<div class="it" id="${id}" data-r="${r}" style="left:${x}px;top:${y}px"><div class="tx" style="position:relative;padding:14px 30px 8px;border:9px solid ${color};border-radius:14px;font:900 ${fs}px/1 'Spartan';color:${color};letter-spacing:3px;white-space:nowrap;background:${latar};box-shadow:4px 8px 12px rgba(0,0,0,.3)">${text}</div></div>`);
  V.bubble = (id, { x, y, w = 300, h = 150, text, r = -6, fs = 58, tail = "left", color = "#1B2A4A" }) => V.P(id, { x, y, w, h, r, c: "white", rad: 70, hi: true, inner:
    `<div class="pp white" style="left:${tail === "left" ? 40 : w - 120}px;top:${h - 30}px;width:80px;height:70px;border-radius:${tail === "left" ? "0 0 0 60px" : "0 0 60px 0"}"></div>` + T(text, `left:0;right:0;top:${h / 2 - fs * 0.55}px;text-align:center;font:400 ${fs}px/1.1 'Marker';color:${color}`) });
  V.svgPP = (vb, body, st = "") => `<svg class="pp" viewBox="${vb}" style="overflow:visible;${st}">${body}</svg>`;
  V.bintang = (id, x, y, s, f, r) => `<div class="it" id="${id}" data-r="${r}" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px"><div class="b b-j">${V.svgPP("0 0 100 100", `<path d="M50,4 L62,38 L97,38 L69,59 L80,94 L50,73 L20,94 L31,59 L3,38 L38,38 Z" fill="${f}"/>`)}</div></div>`;
  V.ledak = (id, { cx, cy, R = 560, warna = ["#E53935", "#FFB300", "#FFE082"] }) => {
    const poly = (r1, r2, n, rot) => { const p = []; for (let k = 0; k < n * 2; k++) { const a = (k / (n * 2)) * Math.PI * 2 + rot; const r = k % 2 ? r2 : r1; p.push(`${(r * Math.cos(a)).toFixed(0)},${(r * Math.sin(a)).toFixed(0)}`); } return p.join(" "); };
    return `<div class="it" id="${id}" style="left:${cx - R}px;top:${cy - R}px;width:${2 * R}px;height:${2 * R}px"><div class="b">${V.svgPP(`-${R} -${R} ${2 * R} ${2 * R}`, `<polygon points="${poly(R, R * 0.72, 14, 0)}" fill="${warna[0]}"/><polygon points="${poly(R * 0.86, R * 0.6, 14, 0.12)}" fill="${warna[1]}"/><polygon points="${poly(R * 0.66, R * 0.48, 12, 0.3)}" fill="${warna[2]}"/>`)}</div></div>`;
  };
  // latar foto/gambar (oversize agar kamera bisa geser tanpa tepi)
  V.bgImg = (id, asetId, st = "") => `<div class="lay" id="${id}"><img src="${V.src(asetId)}" style="position:absolute;left:-60px;top:-110px;width:1200px;height:2140px;object-fit:cover;${st}"></div>`;
  // potongan PNG (prop/foto/maskot): tinggi tetap, lebar ikut rasio
  V.cut = (id, asetId, { x, y, h, flip = false, st = "", imgst = "" }) =>
    `<div class="tk" id="${id}" style="position:absolute;left:${x}px;top:${y}px;height:${h}px;transform-origin:50% 100%;${st}"><img class="cut" src="${V.src(asetId)}" style="height:${h}px;display:block;${flip ? "transform:scaleX(-1);" : ""}${imgst}"></div>`;
  V.lebar = (asetId, h) => { const a = V.A(asetId); return f2((a.w / a.h) * h); };
  // tokoh: badan kartun + stiker wajah FOTO asli (beberapa ekspresi, diganti dengan gantiMuka)
  V.orang = (id, pose, wajah, { x, y, h, flip = false, skalaW = 1.42 }) => {
    const a = V.A(pose);
    if (!a.kepala) return V.cut(id, pose, { x, y, h, flip }); // foto potong (tanpa kepala kartun) = tampil apa adanya
    const { x: hx, y: hy, w: hw } = a.kepala, BW = a.w, BH = a.h; const s = h / BH, wB = BW * s;
    const fw = hw * s * skalaW, fl0 = (hx + hw / 2) * s - fw / 2, fl = flip ? wB - fl0 - fw : fl0, ft = hy * s - fw * 0.2;
    const faces = [].concat(wajah || []).map((w, k) => `<img class="muka" id="${id}f${k}" src="${V.src(w)}" style="position:absolute;left:${f2(fl)}px;top:${f2(ft)}px;width:${f2(fw)}px;${k ? "opacity:0;" : ""}transform-origin:50% 90%">`).join("");
    return `<div class="tk" id="${id}" style="position:absolute;left:${x}px;top:${y}px;width:${f2(wB)}px;height:${h}px;transform-origin:50% 100%"><img class="cut" src="${V.src(pose)}" style="height:${h}px;display:block;${flip ? "transform:scaleX(-1);" : ""}">${faces}</div>`;
  };
  V.lebarOrang = (pose, h) => V.lebar(pose, h);
  V.gantiMuka = (id, k, t, n) => { for (let j = 0; j < n; j++) K(`tl.set("#${id}f${j}", {opacity:${j === k ? 1 : 0}}, ${f2(t)});`); };
  // maskot dengan label tulisan (map rekam medis dsb.): katalog.label = kotak label [x,y,w,h,W,H]
  V.maskot = (id, asetId, { x, y, h, label = "", st = "", imgst = "", flip = false }) => {
    const a = V.A(asetId); const s = h / a.h;
    const lab = label && a.label ? (() => { const { x: lx, y: ly, w: lw, h: lh } = a.label; return `<div style="position:absolute;left:${f2(lx * s)}px;top:${f2(ly * s)}px;width:${f2(lw * s)}px;height:${f2(lh * s)}px;display:flex;align-items:center;justify-content:center;font:900 ${f2(Math.min(lh * s * 0.42, (lw * s) / (label.length * 0.62)))}px/1 'Spartan';color:#7A4A1E;letter-spacing:1px;padding-top:4px;white-space:nowrap">${label}</div>`; })() : "";
    return `<div class="tk" id="${id}" style="position:absolute;left:${x}px;top:${y}px;width:${f2(a.w * s)}px;height:${h}px;transform-origin:50% 100%;${st}"><img class="cut" src="${V.src(asetId)}" style="height:${h}px;display:block;${flip ? "transform:scaleX(-1);" : ""}${imgst}">${lab}</div>`;
  };
  // gambar apa pun (tokoh pose → orang tanpa wajah; maskot → maskot; lainnya → cut)
  V.gambar = (id, asetId, o) => { const a = V.A(asetId); return a.jenis === "tokoh-badan" ? V.orang(id, asetId, o.wajah || [], o) : a.jenis === "maskot" ? V.maskot(id, asetId, o) : V.cut(id, asetId, o); };
  V.muka = (id, asetId, { x, y, w, r = 0 }) => `<div class="it" id="${id}" data-r="${r}" style="left:${x}px;top:${y}px;width:${w}px"><img class="muka" src="${V.src(asetId)}" style="width:${w}px;display:block"></div>`;
  // meter meme (SKILL / ENERGI)
  V.meter = (id, { x, y, w = 760, judul, warna = "#2E9E4F", r = -2, nilai = 100 }) => V.P(id, { x, y, w, h: 250, r, c: "white", hi: true, inner:
    T(judul, `left:34px;top:26px;font:400 48px/1 'Marker';color:#1B2A4A;white-space:nowrap`) +
    `<div style="position:absolute;left:34px;top:110px;width:${w - 110}px;height:100px;border:7px solid #1B2A4A;border-radius:16px;background:#fff;overflow:hidden"><div id="${id}bar" style="position:absolute;left:6px;top:6px;bottom:6px;width:calc(100% - 12px);border-radius:8px;background:${warna};transform-origin:0 50%;transform:scaleX(${nilai / 100})"></div><div id="${id}n" class="tx" style="position:absolute;right:22px;top:20px;font:900 62px/1 'Spartan';color:#1B2A4A">${nilai}%</div></div>` +
    `<div style="position:absolute;left:${w - 72}px;top:140px;width:22px;height:40px;border-radius:0 8px 8px 0;background:#1B2A4A"></div>` });
  V.meterKe = (id, t, dari, ke, dur, warnaAkhir) => {
    K(`(function(){const o={v:${dari}};const n=document.querySelector("#${id}n");tl.fromTo(o,{v:${dari}},{v:${ke},duration:${dur},ease:K.st("power2.in",${dur}),onUpdate:()=>{n.textContent=Math.round(o.v)+"%";}},${f2(t)});})();`);
    K(`tl.fromTo("#${id}bar", {scaleX:${Math.max(dari, 2) / 100}}, {scaleX:${Math.max(ke, 2) / 100}, duration:${dur}, ease:K.st("power2.in",${dur})}, ${f2(t)});`);
    if (warnaAkhir) K(`tl.to("#${id}bar", {backgroundColor:"${warnaAkhir}", duration:${f2(dur * 0.6)}, ease:"none"}, ${f2(t + dur * 0.3)});`);
  };
  // pita garis polisi
  V.pita = (id, { y, r, text, warna = "#FFD600" }) => `<div class="it" id="${id}" data-r="${r}" style="left:-160px;top:${y}px;width:1400px;height:112px"><div class="b"><div style="position:absolute;inset:0;background:${warna};box-shadow:0 10px 18px rgba(0,0,0,.45)"></div><div class="tx" style="position:absolute;left:0;top:30px;white-space:nowrap;font:900 56px/1 'Spartan';color:#111;letter-spacing:5px">${(text + "  ✕  ").repeat(6)}</div></div></div>`;
  V.pin = (warna = "#C62828") => `<div style="position:absolute;left:50%;top:-16px;width:44px;height:44px;margin-left:-22px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#FF8A80,${warna} 60%,#5D0F0F);box-shadow:3px 6px 6px rgba(0,0,0,.45);z-index:3"></div>`;
  // foto polaroid berpin; cutout PNG → contain di atas latar krem, foto → cover
  V.polaroid = (id, { x, y, w, h, src, cap, r = 0, capfs = 52 }) => {
    const a = V.A(src), png = /\.png$/i.test(a.nama), fit = png ? "contain" : "cover", imgbg = png ? "#D8CDBA" : "#2E2E33";
    const ch = Math.round(capfs * 2.1);
    return V.P(id, { x, y, w, h, r, c: "white", hi: true, rad: 6, inner:
      `<div style="position:absolute;left:24px;right:24px;top:24px;bottom:${ch}px;background:${imgbg};overflow:hidden"><img src="${V.src(src)}" style="position:absolute;${fit === "cover" ? "left:0;top:0;width:100%;height:100%" : "left:4%;top:4%;width:92%;height:92%"};object-fit:${fit};object-position:50% 25%"></div>` +
      T(cap, `left:0;right:0;bottom:${Math.round(ch * 0.22)}px;text-align:center;font:400 ${capfs}px/1 'Marker';color:#1B2A4A;white-space:nowrap`) + V.pin() });
  };
  V.benang = (id, garis) => `<svg id="${id}" style="position:absolute;left:0;top:0;width:${VW}px;height:${VH}px;overflow:visible;pointer-events:none" viewBox="0 0 ${VW} ${VH}">${garis.map(([x1, y1, x2, y2], k) => `<path id="${id}g${k}" d="M${x1},${y1} Q${(x1 + x2) / 2},${Math.max(y1, y2) + 60} ${x2},${y2}" fill="none" stroke="#D50000" stroke-width="9" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="filter:drop-shadow(3px 6px 4px rgba(0,0,0,.5))"/>`).join("")}</svg>`;
  V.tarik = (sel, t, dur = 0.45) => K(`tl.to("${sel}", {strokeDashoffset:0, duration:${dur}, ease:"power1.inOut"}, ${f2(t)});`);
  // layar aplikasi berbingkai (screenshot asli)
  V.layarUI = (id, asetId, { x, y, w = 880, h = 600, r = 0, judul, warna = "#0D9488", top = -60 }) => V.P(id, { x, y, w, h, r, c: "white", hi: true, rad: 18, inner:
    `<div style="position:absolute;left:18px;top:18px;right:18px;height:64px;background:${warna};border-radius:10px 10px 0 0"></div>` + T(judul, "left:44px;top:30px;font:900 40px/1 'Spartan';color:#fff;white-space:nowrap") +
    `<div style="position:absolute;left:18px;top:82px;right:18px;bottom:18px;overflow:hidden;border-radius:0 0 10px 10px;background:#fff"><img src="${V.src(asetId)}" style="width:100%;position:absolute;left:0;top:${top}px"></div>` });
  // layar aplikasi HTML (Nusawebsite: aplikasi custom; baris [nama, ket, status])
  V.layarApp = (id, { x, y, w = 900, h = 820, r = 0, judul = "Pesanan Masuk", lencana = "", baris = [], warna = "#FF8040" }) => {
    const sc = ["#F59E0B", "#3B82F6", "#16A34A", "#8B5CF6"];
    const rh = Math.min(200, Math.floor((h - 170) / Math.max(1, baris.length)));
    const rows = baris.map(([n, a, s], k) => `<div class="it" id="${id}r${k}" style="left:30px;right:30px;top:${150 + k * rh}px;height:${rh - 24}px"><div style="position:absolute;inset:0;border-radius:22px;background:#fff;box-shadow:0 4px 10px rgba(15,23,42,.12)"></div>` +
      `<div style="position:absolute;left:28px;top:${Math.round(rh * 0.15)}px;font:800 40px/1 'InterL';color:#0F172A;white-space:nowrap">${n}</div><div style="position:absolute;left:28px;top:${Math.round(rh * 0.48)}px;font:500 30px/1 'InterL';color:#475569;white-space:nowrap">${a || ""}</div>` +
      (s ? `<div style="position:absolute;right:26px;top:${Math.round(rh * 0.28)}px;padding:14px 24px 12px;border-radius:30px;background:${sc[k % 4]};font:800 30px/1 'InterL';color:#fff">${s}</div>` : "") + `</div>`).join("");
    return `<div class="it" id="${id}" data-r="${r}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="b"><div style="position:absolute;inset:0;border-radius:34px;background:#F1F5F9;box-shadow:16px 26px 30px rgba(20,10,0,.35);border:14px solid #0F172A"></div>` +
      `<div style="position:absolute;left:14px;right:14px;top:14px;height:110px;border-radius:20px 20px 0 0;background:${warna}"></div><div style="position:absolute;left:50px;top:48px;font:900 44px/1 'Spartan';color:#fff;white-space:nowrap">${judul}</div>` +
      (lencana ? `<div style="position:absolute;right:46px;top:44px;padding:10px 20px 6px;border-radius:24px;background:#fff;font:800 30px/1 'InterL';color:${warna}">${lencana}</div>` : "") + `${rows}</div></div>`;
  };
  // ponsel chat WhatsApp (pesan [{teks, keluar, sorot}])
  V.hp = (id, { x, y, w = 560, h = 1080, r = 0, judul = "PESANAN", sub = "grup", pesan = [] }) => {
    let yy = 40;
    const isi = pesan.map((p, k) => {
      const fs = p.sorot ? 38 : 32, tinggi = Math.ceil(p.teks.length * fs * 0.55 / 380) * fs * 1.3 + 50;
      const el = `<div class="it" id="${id}c${k}" style="${p.keluar ? "right:22px" : "left:22px"};top:${yy}px;max-width:420px"><div style="position:relative;background:${p.keluar ? "#DCF8C6" : "#FFFFFF"};border-radius:${p.keluar ? "20px 4px 20px 20px" : "4px 20px 20px 20px"};padding:14px 20px 26px;font:500 ${fs}px/1.28 'InterL';color:#111;box-shadow:0 2px 3px rgba(0,0,0,.18);${p.sorot ? "border:5px solid #FF8040" : ""}">${p.teks}<span style="position:absolute;right:14px;bottom:6px;font:400 18px/1 'InterL';color:#8A8A8A">21.${40 + k}</span></div></div>`;
      yy += tinggi + 24; return el;
    }).join("");
    return `<div class="it" id="${id}" data-r="${r}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="b"><div style="position:absolute;inset:0;border-radius:64px;background:#15161A;box-shadow:14px 24px 30px rgba(20,10,0,.45)"></div>` +
      `<div style="position:absolute;left:18px;top:18px;right:18px;bottom:18px;border-radius:48px;overflow:hidden;background:#ECE5DD;background-image:radial-gradient(rgba(0,0,0,.05) 2px,transparent 2px);background-size:34px 34px">` +
      `<div style="position:absolute;left:0;right:0;top:130px;bottom:0">${isi}</div>` +
      `<div style="position:absolute;left:0;right:0;top:0;height:130px;background:#0B7A60;z-index:2"><div style="position:absolute;left:28px;top:40px;width:64px;height:64px;border-radius:50%;background:#25D366"></div>` +
      `<div style="position:absolute;left:110px;top:38px;font:800 34px/1 'InterL';color:#fff;white-space:nowrap">${judul}</div><div style="position:absolute;left:110px;top:82px;font:500 24px/1 'InterL';color:#CDEFE5">${sub}</div></div></div></div></div>`;
  };
  // tombol WA CTA
  V.tombolWA = (id, { x = 130, y, w = 820, h = 170, teks = V.profil.wa, fs = 46 }) =>
    V.P(id, { x, y, w, h, r: -1.5, c: "", hi: true, rad: h / 2, ppst: "background:#25D366", inner: T(teks, `left:0;right:0;top:${Math.round(h / 2 - fs * 0.42)}px;text-align:center;font:900 ${fs}px/1 'Spartan';color:#fff;white-space:nowrap`) });
  V.logo = (id, { x = 160, y = 220, w = 760, h = 270, r = -2 }) => {
    const lid = V.profil.logo, plat = V.profil.plat;
    return V.P(id, { x, y, w, h, r, c: plat ? "" : "white", ppst: plat ? `background:${plat}` : "", hi: true, inner: `<img src="${V.src(lid)}" style="position:absolute;left:${Math.round(w * 0.08)}px;top:50%;transform:translateY(-50%);width:${Math.round(w * 0.84)}px;max-height:${h - 40}px;object-fit:contain">` });
  };
  // lembar kertas/berkas terbang
  V.lembar = (id, x, y, r, warna = "#D6A86A") => V.P(id, { x, y, w: 150, h: 110, r, c: "", ppst: `background:${warna}`, inner: `<div style="position:absolute;left:14px;top:-18px;width:60px;height:26px;background:${warna};border-radius:8px 8px 0 0"></div>` });

  // ---------- animasi ----------
  V.kamera = (s, d, lays) => lays.forEach(([sel, from, to]) => K(`tl.fromTo("${sel}", ${JSON.stringify(from)}, {...${JSON.stringify(to)}, duration:${f2(d)}, ease:"sine.inOut"}, ${f2(s)});`));
  V.napas = (sel, s, d, { amp = 0.016, rot = 0.9, per = 1.3 } = {}) => {
    if (d < 0.4) return; const rep = Math.max(1, Math.floor(d / per) - 1);
    K(`tl.fromTo("${sel}", {scaleY:1, scaleX:1, rotation:${-rot / 2}}, {scaleY:${1 + amp}, scaleX:${1 - amp / 3}, rotation:${rot / 2}, duration:${per}, yoyo:true, repeat:${rep}, ease:K.st("sine.inOut",${per})}, ${f2(s)});`);
  };
  V.goyang = (sel, s, d, { rot = 4, per = 0.42 } = {}) => {
    if (d < 0.4) return; const rep = Math.max(1, Math.floor(d / per) - 1);
    K(`tl.fromTo("${sel}", {rotation:${-rot / 2}}, {rotation:${rot / 2}, duration:${per}, yoyo:true, repeat:${rep}, ease:K.st("sine.inOut",${per})}, ${f2(s)});`);
  };
  V.melayang = (sel, s, d, amp = 12, per = 1.1) => { if (d > 0.4) K(`tl.fromTo("${sel}", {y:0}, {y:${-amp}, duration:${per}, yoyo:true, repeat:${Math.max(1, Math.floor(d / per) - 1)}, ease:"sine.inOut"}, ${f2(s)});`); };
  V.muncul = (sel, t, { y0 = 160, dur = 0.55, dr = 0, bunyi = "pop" } = {}) => { K(`tl.fromTo("${sel}", {y:${y0}, opacity:0, rotation:${dr}}, {y:0, opacity:1, rotation:0, duration:${dur}, ease:K.st("back.out(1.6)",${dur})}, ${f2(t)});`); if (bunyi) sfx(t, bunyi, 0.8); };
  V.stick = (sel, t, o = "{}", bunyi = "pop") => { K(`K.stick("${sel}", ${f2(t)}, ${o});`); if (bunyi) sfx(t, bunyi, 0.8); };
  V.hantam = (sel, t) => V.stick(sel, t, `{s0:2.4, dr:10, dur:0.32, ease:"power4.out"}`, "stamp");
  V.geleng = (sel, t, amp = 14) => K(`tl.fromTo("${sel}", {x:0}, {x:${amp}, duration:0.06, yoyo:true, repeat:5, ease:"none"}, ${f2(t)});`);
  V.tirai = (id, s, d) => K(`tl.fromTo("#${id}t", {x:-60, y:-40}, {x:40, y:30, duration:${f2(d)}, ease:"sine.inOut"}, ${f2(s)});`);
  V.lompat = (sel, t, n = 5) => K(`tl.fromTo("${sel}", {y:0}, {y:-40, duration:0.3, yoyo:true, repeat:${n}, ease:K.st("sine.inOut",0.3)}, ${f2(t)});`);
  V.hitung = (sel, t, dari, ke, dur, fmt = "angka") => {
    const f = fmt === "menit" ? `(m=>(m<10?"0":"")+m+":00")(Math.floor(o.v))` : fmt === "detik" ? `"00:"+(Math.round(o.v)<10?"0":"")+Math.round(o.v)` : fmt === "persen" ? `Math.round(o.v)+"%"` : `Math.round(o.v).toLocaleString("id-ID")`;
    K(`(function(){const o={v:${dari}};const n=document.querySelector("${sel}");tl.fromTo(o,{v:${dari}},{v:${ke},duration:${dur},ease:"power1.out",onUpdate:()=>{n.textContent=${f};}},${f2(t)});})();`);
  };
  V.tulis = (sel, t, dur = 0.7, bunyi = true) => { K(`tl.to("${sel}", {clipPath:"inset(0 0% 0 0)", duration:${dur}, ease:"none"}, ${f2(t)});`); if (bunyi) sfx(t, "spidol", 0.45); };
  // kertas beterbangan dari titik (cari berkas)
  V.terbang = (pref, n, t, { gap = 0.35, warna } = {}) => { for (let k = 0; k < n; k++) { const tk = t + k * gap; K(`tl.fromTo("#${pref}${k}", {x:0, y:60, opacity:0, rotation:0}, {x:${(k - (n - 1) / 2) * 120}, y:${-420 - (k % 3) * 120}, opacity:1, rotation:${(k - 2) * 40}, duration:0.6, ease:K.st("power2.out",0.6)}, ${f2(tk)}); tl.to("#${pref}${k}", {y:300, opacity:0, duration:0.5, ease:K.st("power2.in",0.5)}, ${f2(tk + 0.6)}); tl.set("#${pref}${k}", {opacity:0}, ${f2(tk + 1.12)});`); sfx(tk, "kertas", 0.55); } };
  return V;
}
