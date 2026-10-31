// Pustaka animasi K1 (channel YouTube Konveksi: Elite Apron, Garmen Indonesia). Turunan F1 format-jasa (gaya F3: setiap blok VO = satu scene beranimasi).
// Warna di sini = warna DASAR (oranye/navy F1); buat.mjs menukarnya ke palet brand (brand/<slug>.json "warna"). Font "Spartan" = font judul brand, "InterF" = font isi.
// Setiap fungsi: (p, c) => { html, js }
// c = { id, t0, t1, dur, kata(str) -> detik abs | null, at(str, frac) -> detik, kataKe(i, fb), foto(id) -> path aset foto asli, keyword }
// Teks boleh memakai *kata* untuk sorot warna aksen. Area kanan bawah (x > 1440, y > 880) DIKOSONGKAN untuk watermark WA + web.

export const IKON = {
  buku: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  excel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  kertas: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  jam: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  stok: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>',
  laporan: '<path d="M12 20V10M18 20V4M6 20v-4"/>',
  user: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  toko: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  gudang: '<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',
  sekolah: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  klinik: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  kode: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
  hp: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  web: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  cek: '<path d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  kalender: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  gembok: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>',
  roket: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  grafik: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  cari: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  layar: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  layer: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  truk: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  resto: '<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>',
  sync: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  bintang: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  rumah: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  pena: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
};
const ik = (n, warna = "#E8590C", lebar = 2.2) => `<svg viewBox="0 0 24 24" fill="none" stroke="${warna}" stroke-width="${lebar}" stroke-linecap="round" stroke-linejoin="round">${IKON[n] || IKON.layer}</svg>`;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// *sorot* -> span oranye; dipecah per kata (span.w) untuk animasi per kata
const kata = (s) => {
  let on = false;
  return esc(s).split(/\s+/).filter(Boolean).map((w) => {
    const a = w.startsWith("*"), z = /\*[.,!:;]?$/.test(w);
    if (a) on = true;
    const cls = on ? "w or" : "w";
    if (z) on = false;
    return `<span class="${cls}">${w.replace(/\*/g, "")}</span>`;
  }).join(" ");
};
const sorot = (s) => esc(s).replace(/\*([^*]+)\*/g, '<span class="or">$1</span>');
const f = (x) => Number(x).toFixed(2);
const sec = (c, inner, track = 1) => `<section id="${c.id}" class="clip full" data-start="${f(c.t0)}" data-duration="${f(c.dur)}" data-track-index="${track}"><div class="k">${inner}</div></section>`;
const keluar = (c) => `tl.to("#${c.id} .k",{opacity:0,y:-24,duration:.3,ease:"power2.in"},${f(c.t1 - 0.32)});tl.set("#${c.id} .k",{opacity:0},${f(c.t1 - 0.01)});`;
const naik = (sel, t, y = 40, d = 0.6) => `tl.fromTo("${sel}",{opacity:0,y:${y}},{opacity:1,y:0,duration:${d},ease:"power3.out"},${f(t)});`;
const pop = (sel, t, d = 0.45) => `tl.fromTo("${sel}",{opacity:0,scale:.7},{opacity:1,scale:1,duration:${d},ease:"back.out(2)"},${f(t)});`;
const perKata = (sel, t, st = 0.06) => `tl.fromTo("${sel} .w",{opacity:0,y:"0.6em"},{opacity:1,y:0,duration:.5,ease:"power3.out",stagger:${st}},${f(t)});`;

export const CSS = `
.k{position:absolute;inset:0}
.H{font-family:"Spartan",sans-serif;font-weight:800;letter-spacing:-0.02em;color:#0F172A;line-height:1.04}
.w{display:inline-block}
.or{color:#E8590C}
.kick{font-weight:700;font-size:26px;letter-spacing:.26em;text-transform:uppercase;color:#D9480F}
.sub{font-size:40px;line-height:1.35;color:#475569;font-weight:500}
.card{position:absolute;background:#fff;border-radius:28px;box-shadow:0 30px 80px rgba(15,23,42,.12),0 2px 0 rgba(15,23,42,.04)}
.ico{width:84px;height:84px;border-radius:22px;background:#FFF1E8;display:flex;align-items:center;justify-content:center}
.ico svg{width:46px;height:46px}
.pillk{display:inline-block;background:#E8590C;color:#fff;font-weight:700;font-size:32px;padding:14px 30px;border-radius:999px;box-shadow:0 14px 30px rgba(232,89,12,.30)}
/* browser frame */
.fb{position:absolute;border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 34px 90px rgba(15,23,42,.20);opacity:0}
.fb .bar{position:absolute;left:0;top:0;right:0;height:44px;background:#F1F5F9;display:flex;align-items:center;gap:9px;padding-left:20px;z-index:2}
.fb .bar i{width:13px;height:13px;border-radius:50%;background:#CBD5E1;display:block}
.fb .bar b{margin-left:18px;font-size:18px;font-weight:600;color:#64748B;background:#fff;border-radius:8px;padding:4px 18px}
.fb .vw{position:absolute;left:0;right:0;top:44px;bottom:0;overflow:hidden}
.fb video,.fb .img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top left}
.lt{position:absolute;display:flex;align-items:center;gap:24px;background:#fff;border-radius:22px;padding:20px 34px 20px 20px;box-shadow:0 24px 60px rgba(15,23,42,.18)}
.lt .n{min-width:84px;height:84px;border-radius:18px;background:#E8590C;color:#fff;font-family:"Spartan";font-weight:800;font-size:44px;display:flex;align-items:center;justify-content:center;padding:0 14px}
.lt .tt{font-family:"Spartan";font-weight:800;font-size:44px;color:#0F172A}
.lt .ts{font-size:26px;color:#475569;margin-top:4px}
.topk{position:absolute;left:140px;top:62px;display:flex;align-items:center;gap:14px}
.topk i{width:14px;height:14px;border-radius:50%;background:#FF8040;display:block}
.ring{position:absolute;border:5px solid #FF8040;border-radius:18px;box-shadow:0 0 0 9999px rgba(15,23,42,.0)}
.ringl{position:absolute;background:#0F172A;color:#fff;font-weight:700;font-size:26px;padding:10px 20px;border-radius:12px;white-space:nowrap}
.strike{position:absolute;left:30px;right:30px;top:50%;height:6px;border-radius:3px;background:#DC2626;transform-origin:left center}
.tag{display:inline-flex;align-items:center;gap:12px;padding:16px 26px;border-radius:999px;background:#FEF2F2;color:#B91C1C;font-weight:700;font-size:30px}
.tag svg{width:30px;height:30px}
.row{display:flex;align-items:center;gap:26px}
.cb{width:62px;height:62px;border-radius:50%;background:#16A34A;display:flex;align-items:center;justify-content:center;flex:none}
.cb svg{width:36px;height:36px}
.chip{display:inline-flex;align-items:center;gap:14px;padding:20px 32px;border-radius:999px;background:#fff;box-shadow:0 14px 36px rgba(15,23,42,.10);font-family:"Spartan";font-weight:800;font-size:38px;color:#0F172A}
.chip svg{width:36px;height:36px}
.chip.on{background:#E8590C;color:#fff}
.btn{display:inline-block;padding:30px 68px;border-radius:999px;background:#E8590C;color:#fff;font-size:46px;font-weight:800;box-shadow:0 24px 50px rgba(232,89,12,.40)}
.mk .or{background-image:linear-gradient(#FFE1D1,#FFE1D1);background-repeat:no-repeat;background-position:0 88%;background-size:0% 38%}
.sk{position:absolute;border-radius:12px;background:#E2E8F0;transform-origin:left center}
.sk.o{background:#FFD3BD}
.phone{position:absolute;border-radius:56px;background:#0F172A;padding:16px;box-shadow:0 34px 80px rgba(15,23,42,.28)}
.phone .scr{width:100%;height:100%;border-radius:42px;overflow:hidden;position:relative;background:#fff}
.phone .scr img{position:absolute;left:0;top:0;width:100%}
/* foto asli (K1) */
.ft{position:absolute;overflow:hidden;border-radius:26px;background:#E2E8F0;box-shadow:0 34px 90px rgba(15,23,42,.20);opacity:0}
.ft img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ftl{position:absolute;left:24px;bottom:24px;background:rgba(255,255,255,.94);color:#0F172A;font-family:"Spartan";font-weight:800;font-size:32px;padding:12px 24px;border-radius:14px}
.nb{display:inline-flex;align-items:center;justify-content:center;min-width:74px;height:74px;border-radius:18px;background:#E8590C;color:#fff;font-family:"Spartan";font-weight:800;font-size:40px;padding:0 12px;margin-right:22px;vertical-align:middle}
.tb{position:absolute;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 30px 80px rgba(15,23,42,.12)}
.tb .tr{display:grid;align-items:center;padding:0 40px;border-top:2px solid #F1F5F9}
.tb .th{background:#0F172A;color:#fff;font-weight:700;font-size:28px;letter-spacing:.06em;text-transform:uppercase;border-top:0}
.tb .tr div{padding:22px 16px;font-size:33px;font-weight:600;color:#334155}
.tb .tr div:first-child{font-family:"Spartan";font-weight:800;color:#0F172A}
.tb .th div,.tb .th div:first-child{color:#fff;font-family:"InterF";font-size:26px;font-weight:700}
`;
const FOT = (c, idf) => `<img src="${c.foto(idf)}" alt=""/>`;

// ---------- 1. hook ----------
export function hook(p, c) {
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:${p.gambar === false ? 300 : 230}px;width:${p.gambar === false ? 1640 : 940}px">
    <div class="pillk" id="${c.id}-p">${esc(p.pill || c.keyword)}</div>
    <div class="H" id="${c.id}-h" style="font-size:${p.ukuran || (p.gambar === false ? 118 : 96)}px;margin-top:34px">${kata(p.judul)}</div>
    <div style="height:10px;width:220px;border-radius:5px;background:#FF8040;margin-top:34px;transform-origin:left" id="${c.id}-u"></div>
    ${p.sub ? `<div class="sub" id="${c.id}-s" style="margin-top:30px">${sorot(p.sub)}</div>` : ""}
  </div>
  ${p.gambar === false ? "" : `<div class="card" id="${c.id}-g" style="left:1230px;top:140px;width:540px;height:700px;overflow:hidden;transform:rotate(-3deg);border:12px solid #fff"><img id="${c.id}-gi" src="${c.foto(p.foto)}" style="width:100%;height:100%;object-fit:cover;object-position:${p.posisi || "50% 30%"}"/></div>
  ${p.foto2 ? `<div class="card" id="${c.id}-g2" style="left:1060px;top:520px;width:300px;height:360px;overflow:hidden;border:10px solid #fff;transform:rotate(5deg)"><img src="${c.foto(p.foto2)}" style="width:100%;height:100%;object-fit:cover"/></div>` : ""}`}`);
  let js = pop(`#${c.id}-p`, c.t0 + 0.1) + perKata(`#${c.id}-h`, c.t0 + 0.3, 0.07)
    + `tl.fromTo("#${c.id}-u",{scaleX:0},{scaleX:1,duration:.6,ease:"power3.out"},${f(c.t0 + 1.1)});`;
  if (p.sub) js += naik(`#${c.id}-s`, c.at(p.sub, 0.45), 24);
  if (p.gambar !== false) js += `tl.fromTo("#${c.id}-g",{opacity:0,x:160,rotation:6},{opacity:1,x:0,rotation:-3,duration:.9,ease:"power3.out"},${f(c.t0 + 0.4)});`
    + `tl.fromTo("#${c.id}-gi",{scale:1.0},{scale:1.12,duration:${f(c.dur)},ease:"sine.inOut"},${f(c.t0)});`
    + (p.foto2 ? `tl.fromTo("#${c.id}-g2",{opacity:0,y:200},{opacity:1,y:0,duration:.8,ease:"back.out(1.4)"},${f(c.t0 + 1.2)});` : "");
  return { html, js: js + keluar(c) };
}

// ---------- 2. kartu-coret ----------
export function kartuCoret(p, c) {
  const k = p.kartu || [];
  const w = Math.min(520, (1640 - 40 * (k.length - 1)) / k.length);
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:150px;width:1640px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:80px;margin-top:18px">${kata(p.judul)}</div>
  </div>
  <div style="position:absolute;left:140px;top:450px;width:1640px;display:flex;gap:40px">
    ${k.map((x, i) => `<div class="card" id="${c.id}-c${i}" style="position:relative;width:${w}px;height:300px;padding:44px">
      <div class="ico">${ik(x.ikon)}</div><div class="H" style="font-size:52px;margin-top:28px">${esc(x.judul)}</div>
      <div style="font-size:28px;color:#475569;margin-top:10px">${esc(x.ket || "")}</div><div class="strike" id="${c.id}-x${i}" style="top:57%"></div></div>`).join("")}
  </div>
  ${p.akibat ? `<div id="${c.id}-a" style="position:absolute;left:140px;top:820px;display:flex;gap:20px">${p.akibat.map((a, i) => `<div class="tag" id="${c.id}-a${i}">${ik("alert", "#B91C1C")}${esc(a)}</div>`).join("")}</div>` : ""}`);
  let js = (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.1, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.2);
  k.forEach((x, i) => { js += `tl.fromTo("#${c.id}-c${i}",{opacity:0,y:80,rotation:${i % 2 ? 3 : -3}},{opacity:1,y:0,rotation:0,duration:.6,ease:"back.out(1.5)"},${f(c.at(x.judul, 0.15 + i * 0.12))});`; });
  const tc = c.at(p.coret || (p.akibat && p.akibat[0]) || "", 0.6);
  k.forEach((x, i) => { js += `tl.fromTo("#${c.id}-x${i}",{scaleX:0},{scaleX:1,duration:.35,ease:"power2.out"},${f(tc + i * 0.2)});tl.to("#${c.id}-c${i}",{opacity:.55,filter:"grayscale(1)",duration:.4},${f(tc + i * 0.2 + 0.2)});`; });
  (p.akibat || []).forEach((a, i) => { js += pop(`#${c.id}-a${i}`, Math.max(tc + 0.1, c.at(a, 0.6 + i * 0.1))); });
  return { html, js: js + keluar(c) };
}

// ---------- 3. ikon-masalah ----------
export function ikonMasalah(p, c) {
  const m = p.masalah || [];
  const pos = [[1180, 230], [1420, 470], [1180, 710], [1460, 230]].slice(0, m.length);
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:300px;width:820px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:86px;margin-top:18px">${kata(p.judul)}</div>
    ${p.sub ? `<div class="sub" id="${c.id}-s" style="margin-top:28px">${sorot(p.sub)}</div>` : ""}
  </div>
  <svg style="position:absolute;inset:0" width="1920" height="1080">${pos.map(([x, y], i) => `<line id="${c.id}-l${i}" x1="1040" y1="540" x2="${x + 120}" y2="${y + 50}" stroke="#FCA5A5" stroke-width="4" stroke-dasharray="10 10"/>`).join("")}</svg>
  <div id="${c.id}-o" style="position:absolute;left:940px;top:440px;width:200px;height:200px;border-radius:50%;background:#FEF2F2;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 24px rgba(254,226,226,.6)">${ik(p.ikon || "alert", "#DC2626", 2)}</div>
  ${m.map((x, i) => `<div class="card" id="${c.id}-m${i}" style="left:${pos[i][0]}px;top:${pos[i][1]}px;padding:24px 32px;display:flex;align-items:center;gap:20px"><div class="ico" style="background:#FEF2F2;width:70px;height:70px">${ik(x.ikon || "alert", "#DC2626")}</div><div class="H" style="font-size:38px">${esc(x.teks)}</div></div>`).join("")}`);
  let js = (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.1, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.2) + pop(`#${c.id}-o`, c.t0 + 0.4, 0.6)
    + `tl.fromTo("#${c.id}-o svg",{rotation:-12},{rotation:12,duration:.12,repeat:7,yoyo:true,ease:"sine.inOut"},${f(c.t0 + 1)});`;
  if (p.sub) js += naik(`#${c.id}-s`, c.at(p.sub, 0.5), 20);
  m.forEach((x, i) => {
    const t = c.at(x.teks, 0.2 + i * 0.2);
    js += `tl.fromTo("#${c.id}-l${i}",{opacity:0},{opacity:1,duration:.3},${f(t)});` + pop(`#${c.id}-m${i}`, t + 0.1)
      + `tl.fromTo("#${c.id}-m${i}",{x:-6},{x:6,duration:.08,repeat:5,yoyo:true},${f(t + 0.55)});`;
  });
  return { html, js: js + keluar(c) };
}

// ---------- 6. daftar-centang ----------
export function daftarCentang(p, c) {
  const it = p.item || [];
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:${p.gambar ? 380 : 200}px;width:${p.gambar ? 760 : 1640}px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:80px;margin-top:18px">${kata(p.judul)}</div>
  </div>
  <div class="card" id="${c.id}-c" style="left:${p.gambar ? 980 : 140}px;top:${p.gambar ? Math.max(170, 470 - it.length * 50) : 430}px;width:${p.gambar ? 800 : 1640}px;padding:46px 54px;display:${p.gambar ? "flex" : "grid"};${p.gambar ? "flex-direction:column" : "grid-template-columns:1fr 1fr"};gap:34px">
    ${it.map((x, i) => `<div class="row" id="${c.id}-i${i}"><div class="cb" id="${c.id}-b${i}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path id="${c.id}-pk${i}" d="M20 6L9 17l-5-5" stroke-dasharray="24" stroke-dashoffset="24"/></svg></div><div style="font-size:40px;font-weight:700;color:#0F172A">${sorot(x)}</div></div>`).join("")}
  </div>`);
  let js = (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.1, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.2)
    + `tl.fromTo("#${c.id}-c",{opacity:0,y:60},{opacity:1,y:0,duration:.6,ease:"power3.out"},${f(c.t0 + 0.4)});`;
  it.forEach((x, i) => {
    const t = Math.max(c.t0 + 0.6, c.at(x.replace(/\*/g, ""), 0.2 + i * (0.6 / Math.max(1, it.length))));
    js += `tl.fromTo("#${c.id}-i${i}",{opacity:.25,x:-20},{opacity:1,x:0,duration:.4},${f(t)});` + pop(`#${c.id}-b${i}`, t, 0.35)
      + `tl.to("#${c.id}-pk${i}",{attr:{"stroke-dashoffset":0},duration:.35,ease:"power2.out"},${f(t + 0.2)});`;
  });
  return { html, js: js + keluar(c) };
}

// ---------- 7. chip-niche (hub + orbit) ----------
export function chipNiche(p, c) {
  const ch = p.chip || [];
  const cx = 1340, cy = 560, R = [[-330, -250], [250, -270], [380, 10], [260, 270], [-330, 280], [-430, 10]];
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:260px;width:720px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:82px;margin-top:18px">${kata(p.judul)}</div>
    ${p.sub ? `<div class="sub" id="${c.id}-s" style="margin-top:28px">${sorot(p.sub)}</div>` : ""}
  </div>
  <svg style="position:absolute;inset:0" width="1920" height="1080">${ch.map((x, i) => `<line id="${c.id}-l${i}" x1="${cx}" y1="${cy}" x2="${cx + R[i][0]}" y2="${cy + R[i][1]}" stroke="#FFC9AE" stroke-width="4" stroke-dasharray="600" stroke-dashoffset="600"/>`).join("")}</svg>
  <div id="${c.id}-o" style="position:absolute;left:${cx - 120}px;top:${cy - 120}px;width:240px;height:240px;border-radius:50%;background:#E8590C;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;box-shadow:0 0 0 26px rgba(255,128,64,.15),0 30px 60px rgba(232,89,12,.35)"><svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IKON[p.ikonPusat || "layer"]}</svg><div style="font-family:Spartan;font-weight:800;font-size:30px;margin-top:8px">${esc(p.pusat || "Aplikasi")}</div></div>
  ${ch.map((x, i) => `<div class="chip${i === ch.length - 1 ? " on" : ""}" id="${c.id}-c${i}" style="position:absolute;left:${cx + R[i][0]}px;top:${cy + R[i][1]}px">${ik(x.ikon || "layer", i === ch.length - 1 ? "#fff" : "#E8590C")}${esc(x.teks)}</div>`).join("")}`);
  let js = (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.1, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.2) + pop(`#${c.id}-o`, c.t0 + 0.5, 0.6);
  if (p.sub) js += naik(`#${c.id}-s`, c.at(p.sub, 0.3), 20);
  ch.forEach((x, i) => {
    const t = Math.max(c.t0 + 0.8, c.at(x.teks, 0.3 + i * 0.1));
    js += `tl.to("#${c.id}-l${i}",{attr:{"stroke-dashoffset":0},duration:.4},${f(t)});tl.fromTo("#${c.id}-c${i}",{opacity:0,scale:.5,xPercent:-50,yPercent:-50},{opacity:1,scale:1,xPercent:-50,yPercent:-50,duration:.45,ease:"back.out(2)"},${f(t + 0.2)});`;
  });
  js += `tl.to("#${c.id}-c${ch.length - 1}",{scale:1.08,duration:.5,repeat:3,yoyo:true,ease:"sine.inOut",xPercent:-50,yPercent:-50},${f(c.t1 - 2.4)});`;
  return { html, js: js + keluar(c) };
}

// ---------- 8. diagram-alur ----------
export function diagramAlur(p, c) {
  const L = p.langkah || [];
  const n = L.length, bw = 300, gap = (1640 - n * bw) / Math.max(1, n - 1);
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:170px;width:1640px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:80px;margin-top:18px">${kata(p.judul)}</div>
  </div>
  <svg style="position:absolute;inset:0" width="1920" height="1080">
    ${L.slice(1).map((_, i) => { const x1 = 140 + (i + 1) * bw + i * gap + 10, x2 = x1 + gap - 20; return `<line id="${c.id}-a${i}" x1="${x1}" y1="620" x2="${x2}" y2="620" stroke="#FF8040" stroke-width="6" stroke-linecap="round" stroke-dasharray="${gap}" stroke-dashoffset="${gap}"/><path id="${c.id}-ah${i}" d="M${x2 - 16} 606 L${x2} 620 L${x2 - 16} 634" fill="none" stroke="#FF8040" stroke-width="6" stroke-linecap="round" opacity="0"/>`; }).join("")}
  </svg>
  ${L.map((x, i) => `<div class="card" id="${c.id}-b${i}" style="left:${140 + i * (bw + gap)}px;top:480px;width:${bw}px;height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;border:4px solid ${i === n - 1 ? "#E8590C" : "#fff"}">
    <div class="ico" style="width:100px;height:100px">${ik(x.ikon || "layer")}</div><div class="H" style="font-size:38px;text-align:center;padding:0 16px">${esc(x.teks)}</div></div>`).join("")}
  <div id="${c.id}-dot" style="position:absolute;left:${140 + bw / 2 - 14}px;top:792px;width:28px;height:28px;border-radius:50%;background:#E8590C;opacity:0"></div>`);
  let js = (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.1, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.2);
  let last = c.t0;
  L.forEach((x, i) => {
    const t = Math.max(c.t0 + 0.5 + i * 0.5, c.at(x.teks, 0.15 + i * (0.65 / n)));
    if (i > 0) js += `tl.to("#${c.id}-a${i - 1}",{attr:{"stroke-dashoffset":0},duration:.4,ease:"power2.out"},${f(t - 0.35)});tl.to("#${c.id}-ah${i - 1}",{opacity:1,duration:.15},${f(t - 0.05)});`;
    js += `tl.fromTo("#${c.id}-b${i}",{opacity:0,y:60},{opacity:1,y:0,duration:.5,ease:"back.out(1.6)"},${f(t)});`;
    last = t;
  });
  const span = (n - 1) * (bw + gap);
  if (c.t1 - last > 1.6) js += `tl.fromTo("#${c.id}-dot",{opacity:1,x:0},{opacity:1,x:${span},duration:${f(Math.min(2.5, c.t1 - last - 0.8))},ease:"power1.inOut"},${f(last + 0.6)});`;
  return { html, js: js + keluar(c) };
}

// ---------- 9. angka-besar ----------
export function angkaBesar(p, c) {
  const num = Number(p.angka);
  const html = sec(c, `
  <svg style="position:absolute;left:150px;top:200px" width="680" height="680"><circle id="${c.id}-cr" cx="340" cy="340" r="300" fill="#FFF1E8" stroke="#FF8040" stroke-width="10" stroke-dasharray="1885" stroke-dashoffset="1885" transform="rotate(-90 340 340)"/></svg>
  <div id="${c.id}-n" class="H" style="position:absolute;left:150px;top:200px;width:680px;height:680px;display:flex;align-items:center;justify-content:center;font-size:380px;color:#E8590C">${Number.isFinite(num) ? "0" : esc(p.angka)}</div>
  <div style="position:absolute;left:940px;top:330px;width:860px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:96px;margin-top:18px">${kata(p.label)}</div>
    ${p.ket ? `<div class="sub" id="${c.id}-s" style="margin-top:28px">${sorot(p.ket)}</div>` : ""}
    ${(p.item || []).length ? `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:34px">${p.item.map((x, i) => `<div class="chip" id="${c.id}-i${i}" style="font-size:32px;padding:16px 26px">${esc(x)}</div>`).join("")}</div>` : ""}
  </div>`);
  let js = `tl.to("#${c.id}-cr",{attr:{"stroke-dashoffset":0},duration:1.1,ease:"power2.inOut"},${f(c.t0 + 0.1)});`
    + `tl.fromTo("#${c.id}-n",{opacity:0,scale:.5},{opacity:1,scale:1,duration:.7,ease:"back.out(1.8)"},${f(c.t0 + 0.2)});`
    + (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.3, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.5);
  if (Number.isFinite(num)) js += `(function(){const o={v:0};const el=document.querySelector("#${c.id}-n");tl.to(o,{v:${num},duration:.9,ease:"power2.out",onUpdate:()=>{el.textContent=Math.round(o.v)}},${f(c.t0 + 0.3)});})();`;
  if (p.ket) js += naik(`#${c.id}-s`, c.at(p.ket, 0.4), 20);
  (p.item || []).forEach((x, i) => { js += pop(`#${c.id}-i${i}`, c.at(x, 0.4 + i * 0.12)); });
  return { html, js: js + keluar(c) };
}

// ---------- 10. perbandingan ----------
export function perbandingan(p, c) {
  const ki = p.kiri || {}, ka = p.kanan || {};
  const kol = (s, d, on) => `<div class="card" id="${c.id}-${s}" style="left:${on ? 1000 : 140}px;top:${p.judul ? 330 : 250}px;width:780px;padding:48px 54px;${on ? "border:5px solid #E8590C" : "background:#F8FAFC"}">
    <div class="H" style="font-size:54px;color:${on ? "#E8590C" : "#64748B"}">${esc(d.judul)}</div>
    <div style="margin-top:30px;display:flex;flex-direction:column;gap:24px">${(d.item || []).map((x, i) => `<div class="row" id="${c.id}-${s}${i}"><div class="cb" style="width:54px;height:54px;background:${on ? "#16A34A" : "#E2E8F0"}">${ik(on ? "cek" : "x", on ? "#fff" : "#94A3B8", 3)}</div><div style="font-size:36px;font-weight:700;color:${on ? "#0F172A" : "#64748B"}">${esc(x)}</div></div>`).join("")}</div></div>`;
  const html = sec(c, `
  ${p.judul ? `<div class="H" id="${c.id}-h" style="position:absolute;left:140px;top:150px;width:1640px;font-size:76px">${kata(p.judul)}</div>` : ""}
  ${kol("L", ki, false)}${kol("R", ka, true)}
  <div id="${c.id}-vs" style="position:absolute;left:900px;top:${p.judul ? 520 : 440}px;width:120px;height:120px;border-radius:50%;background:#0F172A;color:#fff;font-family:Spartan;font-weight:800;font-size:44px;display:flex;align-items:center;justify-content:center;z-index:3">VS</div>`);
  let js = p.judul ? perKata(`#${c.id}-h`, c.t0 + 0.1) : "";
  const tl0 = c.at([ki.judul, ...(ki.item || [])].join(" "), 0.05), tr0 = Math.max(tl0 + 1, Math.min(c.at(p.pemicu || [ka.judul, ...(ka.item || [])].join(" "), 0.5), c.t0 + 0.5 * c.dur));
  js += `tl.fromTo("#${c.id}-L",{opacity:0,x:-80},{opacity:1,x:0,duration:.6,ease:"power3.out"},${f(tl0 + 0.2)});`;
  (ki.item || []).forEach((x, i) => { js += naik(`#${c.id}-L${i}`, Math.min(tr0 - 0.3, c.at(x, 0.15 + i * 0.1)) + 0.3, 16, 0.35); });
  js += `tl.fromTo("#${c.id}-vs",{opacity:0,scale:0,rotation:-180},{opacity:1,scale:1,rotation:0,duration:.6,ease:"back.out(2)"},${f(tr0 - 0.4)});`
    + `tl.fromTo("#${c.id}-R",{opacity:0,x:80},{opacity:1,x:0,duration:.6,ease:"power3.out"},${f(tr0)});tl.to("#${c.id}-L",{opacity:.6,scale:.96,duration:.5},${f(tr0 + 0.3)});tl.to("#${c.id}-R",{y:-14,duration:.5,ease:"power2.out"},${f(tr0 + 0.3)});`;
  (ka.item || []).forEach((x, i) => { js += pop(`#${c.id}-R${i}`, Math.max(tr0 + 0.4 + i * 0.25, c.at(x, 0.6 + i * 0.1)), 0.4); });
  return { html, js: js + keluar(c) };
}

// ---------- 11. kutipan-sorot (kata muncul mengikuti VO) ----------
export function kutipanSorot(p, c) {
  const html = sec(c, `
  <div id="${c.id}-q" class="H" style="position:absolute;left:120px;top:150px;font-size:340px;color:#FFD3BD;line-height:1">“</div>
  <div style="position:absolute;left:240px;top:330px;width:1440px">
    <div class="H mk" id="${c.id}-h" style="font-size:${p.ukuran || 84}px;line-height:1.15">${kata(p.teks)}</div>
    ${p.atribusi ? `<div id="${c.id}-a" style="margin-top:44px;display:flex;align-items:center;gap:18px;font-size:32px;font-weight:700;color:#475569"><span style="width:60px;height:5px;background:#FF8040;display:block"></span>${esc(p.atribusi)}</div>` : ""}
  </div>`);
  const ws = p.teks.replace(/\*/g, "").split(/\s+/).filter(Boolean);
  let js = `tl.fromTo("#${c.id}-q",{opacity:0,scale:.4,rotation:-20},{opacity:1,scale:1,rotation:0,duration:.6,ease:"back.out(2)"},${f(c.t0 + 0.05)});`;
  ws.forEach((w, i) => { js += `tl.fromTo(document.querySelectorAll("#${c.id}-h .w")[${i}],{opacity:.12,y:14},{opacity:1,y:0,duration:.3,ease:"power2.out"},${f(Math.max(c.t0 + 0.2 + i * 0.03, c.kataKe(i, c.t0 + 0.3 + (c.dur - 1.2) * i / ws.length)))});`; });
  js += `tl.fromTo("#${c.id}-h .or",{backgroundSize:"0% 38%"},{backgroundSize:"100% 38%",duration:.5,ease:"power2.out"},${f(c.t1 - 1.6)});`;
  if (p.atribusi) js += naik(`#${c.id}-a`, c.t1 - 1.4, 16, 0.4);
  return { html, js: js + keluar(c) };
}

// ---------- 13. fitur-grid ----------
export function fiturGrid(p, c) {
  const ft = p.fitur || [];
  const cols = ft.length > 4 ? 3 : 2, cw = cols === 3 ? 520 : 790;
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:150px;width:1640px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:78px;margin-top:18px">${kata(p.judul)}</div>
  </div>
  <div style="position:absolute;left:140px;top:${ft.length > 4 ? 400 : 420}px;width:1640px;display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:36px 40px">
    ${ft.map((x, i) => `<div class="card" id="${c.id}-t${i}" style="position:relative;padding:34px 38px;display:flex;align-items:center;gap:26px"><div class="ico" id="${c.id}-ic${i}">${ik(x.ikon || "layer")}</div><div><div class="H" style="font-size:42px">${esc(x.teks)}</div>${x.ket ? `<div style="font-size:26px;color:#475569;margin-top:6px">${esc(x.ket)}</div>` : ""}</div></div>`).join("")}
  </div>`);
  let js = (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.1, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.2);
  ft.forEach((x, i) => {
    const t = Math.max(c.t0 + 0.5 + i * 0.25, c.at(x.teks, 0.2 + i * (0.6 / ft.length)));
    js += `tl.fromTo("#${c.id}-t${i}",{opacity:0,y:50,scale:.9},{opacity:1,y:0,scale:1,duration:.5,ease:"back.out(1.6)"},${f(t)});tl.fromTo("#${c.id}-ic${i}",{rotation:-25,scale:.6},{rotation:0,scale:1,duration:.6,ease:"elastic.out(1,.5)"},${f(t + 0.1)});`;
  });
  return { html, js: js + keluar(c) };
}

// ---------- 14. cta ----------
export function cta(p, c) {
  const html = sec(c, `
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    <div class="kick" id="${c.id}-k">${esc(p.kicker || c.keyword)}</div>
    <div class="H" id="${c.id}-h" style="font-size:${p.ukuran || 110}px;margin-top:24px;max-width:1600px">${kata(p.judul)}</div>
    ${p.sub ? `<div class="sub" id="${c.id}-s" style="margin-top:26px">${sorot(p.sub)}</div>` : ""}
    <div class="btn" id="${c.id}-b" style="margin-top:56px">${esc(p.tombol || "Konsultasi gratis")}</div>
    <div id="${c.id}-n" style="margin-top:30px;font-size:32px;font-weight:700;color:#334155">${esc(p.catatan || "Link ada di deskripsi")}</div>
  </div>
  <svg id="${c.id}-cur" style="position:absolute;left:1380px;top:860px;width:64px;height:64px" viewBox="0 0 24 24"><path d="M5 3l14 8-6 2-3 6z" fill="#0F172A" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>
  <div id="${c.id}-rp" style="position:absolute;left:1020px;top:${p.sub ? 660 : 610}px;width:60px;height:60px;border-radius:50%;border:5px solid #FF8040;opacity:0"></div>`);
  const tb = Math.max(c.t0 + 1.2, c.at(p.tombol || "konsultasi", 0.5));
  let js = naik(`#${c.id}-k`, c.t0 + 0.1, 20) + perKata(`#${c.id}-h`, c.t0 + 0.25, 0.07)
    + `tl.fromTo("#${c.id}-b",{opacity:0,scale:.8},{opacity:1,scale:1,duration:.5,ease:"back.out(2)"},${f(tb)});`
    + `tl.fromTo("#${c.id}-cur",{opacity:0,x:0,y:0},{opacity:1,duration:.2},${f(tb + 0.3)});`
    + `tl.to("#${c.id}-cur",{x:-330,y:${p.sub ? -170 : -220},duration:.9,ease:"power2.inOut"},${f(tb + 0.35)});`
    + `tl.to("#${c.id}-b",{scale:.94,duration:.1,yoyo:true,repeat:1},${f(tb + 1.3)});`
    + `tl.fromTo("#${c.id}-rp",{opacity:1,scale:.3},{opacity:0,scale:2.4,duration:.6},${f(tb + 1.3)});`
    + `tl.to("#${c.id}-b",{scale:1.05,duration:.55,repeat:5,yoyo:true,ease:"sine.inOut"},${f(tb + 1.6)});`
    + naik(`#${c.id}-n`, tb + 0.8, 16, 0.4);
  if (p.sub) js += naik(`#${c.id}-s`, c.at(p.sub, 0.3), 20);
  return { html, js };
}

// ---------- K1. foto (foto asli + teks/poin) ----------
// p: { foto: "ID" | "ID:x0,y0,x1,y1" (crop pecahan), sisi: "kanan"|"kiri", kicker?, nomor?, judul, ket?, poin?[] (muncul saat kata pertamanya diucapkan),
//      label? (chip di foto), posisi? (object-position, mis. "50% 30%"), fokus? [x%,y%] titik zoom, zoom? (1.06-1.15), sorot? {x,y,w,h (% foto), label} }
export function foto(p, c) {
  const kanan = p.sisi !== "kiri";
  const FX = kanan ? 1060 : 140, TX = kanan ? 140 : 940, FW = 720, FH = 740, FY = 130;
  const po = p.poin || [], fo = p.fokus || [50, 40], s = p.sorot;
  const html = sec(c, `
  <div class="ft" id="${c.id}-f" style="left:${FX}px;top:${FY}px;width:${FW}px;height:${FH}px"><div id="${c.id}-z" style="position:absolute;inset:0;transform-origin:${fo[0]}% ${fo[1]}%"><img src="${c.foto(p.foto)}" style="object-position:${p.posisi || "50% 35%"}"/></div>
    ${p.label ? `<div class="ftl" id="${c.id}-lb">${esc(p.label)}</div>` : ""}</div>
  ${s ? `<div class="ring" id="${c.id}-r" style="left:${FX + FW * s.x / 100}px;top:${FY + FH * s.y / 100}px;width:${FW * s.w / 100}px;height:${FH * s.h / 100}px"></div>
  <div class="ringl" id="${c.id}-rl" style="left:${FX + FW * s.x / 100}px;top:${Math.min(FY + FH - 60, FY + FH * (s.y + s.h) / 100 + 14)}px">${esc(s.label)}</div>` : ""}
  <div style="position:absolute;left:${TX}px;top:${po.length ? 210 : 320}px;width:840px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:${p.ukuran || 80}px;margin-top:18px">${p.nomor != null ? `<span class="nb w">${esc(p.nomor)}</span>` : ""}${kata(p.judul)}</div>
    ${p.ket ? `<div class="sub" id="${c.id}-s" style="margin-top:26px">${sorot(p.ket)}</div>` : ""}
    <div style="margin-top:40px;display:flex;flex-direction:column;gap:24px">${po.map((x, i) => `<div class="row" id="${c.id}-p${i}"><div class="cb" style="width:54px;height:54px">${ik("cek", "#fff", 3)}</div><div style="font-size:38px;font-weight:700;color:#0F172A">${sorot(x)}</div></div>`).join("")}</div>
  </div>`);
  let js = `tl.fromTo("#${c.id}-f",{opacity:0,x:${kanan ? 120 : -120},rotation:${kanan ? 3 : -3}},{opacity:1,x:0,rotation:0,duration:.8,ease:"power3.out"},${f(c.t0 + 0.05)});`
    + `tl.fromTo("#${c.id}-z",{scale:1},{scale:${p.zoom || 1.1},duration:${f(c.dur)},ease:"sine.inOut"},${f(c.t0)});`
    + (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.15, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.25);
  if (p.label) js += pop(`#${c.id}-lb`, c.at(p.label, 0.35));
  if (p.ket) js += naik(`#${c.id}-s`, c.at(p.ket, 0.3), 20);
  po.forEach((x, i) => { js += `tl.fromTo("#${c.id}-p${i}",{opacity:0,x:-40},{opacity:1,x:0,duration:.45,ease:"power3.out"},${f(Math.max(c.t0 + 0.6, c.at(x.replace(/\*/g, ""), 0.3 + i * (0.55 / Math.max(1, po.length)))))});`; });
  if (s) { const t = c.at(s.label, 0.5); js += `tl.fromTo("#${c.id}-r",{opacity:0,scale:1.3},{opacity:1,scale:1,duration:.45,ease:"back.out(2)"},${f(t)});tl.to("#${c.id}-r",{scale:1.04,duration:.5,repeat:3,yoyo:true,ease:"sine.inOut"},${f(t + 0.5)});` + naik(`#${c.id}-rl`, t + 0.2, 16, 0.4); }
  return { html, js: js + keluar(c) };
}

// ---------- K2. foto-grid (2-4 foto, muncul saat labelnya diucapkan) ----------
// p: { kicker?, judul, foto: [{ id, label, posisi? }] 2-4 }
export function fotoGrid(p, c) {
  const fs_ = p.foto || [], n = fs_.length, gap = 36, w = Math.floor((1640 - gap * (n - 1)) / n), h = n <= 2 ? 520 : 500, top = 340;
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:120px;width:1500px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:76px;margin-top:16px">${kata(p.judul)}</div>
  </div>
  ${fs_.map((x, i) => `<div class="ft" id="${c.id}-f${i}" style="left:${140 + i * (w + gap)}px;top:${top}px;width:${w}px;height:${h}px"><img id="${c.id}-i${i}" src="${c.foto(x.id)}" style="object-position:${x.posisi || "50% 35%"}"/>${x.label ? `<div class="ftl">${esc(x.label)}</div>` : ""}</div>`).join("")}`);
  let js = (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.1, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.2);
  fs_.forEach((x, i) => {
    const t = Math.max(c.t0 + 0.5 + i * 0.35, c.at(x.label || "", 0.2 + i * (0.6 / n)));
    js += `tl.fromTo("#${c.id}-f${i}",{opacity:0,y:80,rotation:${i % 2 ? 3 : -3}},{opacity:1,y:0,rotation:0,duration:.6,ease:"back.out(1.4)"},${f(t)});`
      + `tl.fromTo("#${c.id}-i${i}",{scale:1},{scale:1.08,duration:${f(Math.max(1, c.t1 - t))},ease:"sine.inOut"},${f(t)});`;
  });
  return { html, js: js + keluar(c) };
}

// ---------- K3. foto-lebar (foto dalam bingkai lebar + judul putih di atas foto) ----------
// p: { foto, kicker?, judul, posisi?, zoom?, ukuran? }
export function fotoLebar(p, c) {
  const html = sec(c, `
  <div class="ft" id="${c.id}-f" style="left:140px;top:120px;width:1640px;height:720px"><div id="${c.id}-z" style="position:absolute;inset:0"><img src="${c.foto(p.foto)}" style="object-position:${p.posisi || "50% 40%"}"/></div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.66) 0%,rgba(0,0,0,.3) 48%,rgba(0,0,0,0) 72%)"></div>
    <div style="position:absolute;left:70px;bottom:64px;width:900px">
      ${p.kicker ? `<div class="kick" id="${c.id}-k" style="color:#fff;opacity:.92">${esc(p.kicker)}</div>` : ""}
      <div class="H" id="${c.id}-h" style="font-size:${p.ukuran || 84}px;margin-top:14px;color:#fff">${kata(p.judul)}</div>
    </div></div><style>#${c.id}-h .or{color:#FF8040}</style>`);
  const js = `tl.fromTo("#${c.id}-f",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.7,ease:"power3.out"},${f(c.t0)});`
    + `tl.fromTo("#${c.id}-z",{scale:1.04,x:0},{scale:${p.zoom || 1.12},x:-30,duration:${f(c.dur)},ease:"sine.inOut"},${f(c.t0)});`
    + (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.3, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.4);
  return { html, js: js + keluar(c) };
}

// ---------- K4. tabel (baris muncul saat kata pemicu diucapkan) ----------
// p: { kicker?, judul, kolom: [..] 2-3, baris: [[..], ..] 2-5, kata?: [kata pemicu per baris] (default sel pertama) }
export function tabel(p, c) {
  const k = p.kolom || [], b = p.baris || [], gt = k.length === 3 ? "1.1fr 1.2fr 1.4fr" : "1fr 1.6fr";
  const html = sec(c, `
  <div style="position:absolute;left:140px;top:120px;width:1640px">
    ${p.kicker ? `<div class="kick" id="${c.id}-k">${esc(p.kicker)}</div>` : ""}
    <div class="H" id="${c.id}-h" style="font-size:72px;margin-top:16px">${kata(p.judul)}</div>
  </div>
  <div class="tb" id="${c.id}-t" style="left:140px;top:330px;width:1640px">
    <div class="tr th" style="grid-template-columns:${gt}">${k.map((x) => `<div>${esc(x)}</div>`).join("")}</div>
    ${b.map((r, i) => `<div class="tr" id="${c.id}-r${i}" style="grid-template-columns:${gt}">${r.map((x) => `<div>${sorot(x)}</div>`).join("")}</div>`).join("")}
  </div>`);
  let js = (p.kicker ? naik(`#${c.id}-k`, c.t0 + 0.1, 20) : "") + perKata(`#${c.id}-h`, c.t0 + 0.2)
    + `tl.fromTo("#${c.id}-t",{opacity:0,y:50},{opacity:1,y:0,duration:.6,ease:"power3.out"},${f(c.t0 + 0.4)});`;
  b.forEach((r, i) => {
    const t = Math.max(c.t0 + 0.7 + i * 0.3, c.at((p.kata || [])[i] || String(r[0]).replace(/\*/g, ""), 0.2 + i * (0.6 / Math.max(1, b.length))));
    js += `tl.fromTo("#${c.id}-r${i}",{opacity:0,x:-40},{opacity:1,x:0,duration:.45,ease:"power3.out"},${f(t)});`;
  });
  return { html, js: js + keluar(c) };
}

export const ANIM = {
  "hook": hook, "kartu-coret": kartuCoret, "ikon-masalah": ikonMasalah, "daftar-centang": daftarCentang, "chip-niche": chipNiche,
  "diagram-alur": diagramAlur, "angka-besar": angkaBesar, "perbandingan": perbandingan, "kutipan-sorot": kutipanSorot,
  "fitur-grid": fiturGrid, "cta": cta, "foto": foto, "foto-grid": fotoGrid, "foto-lebar": fotoLebar, "tabel": tabel,
};
