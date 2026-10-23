// Primitif adegan KHAS KONSEP (K1 kalender, K2 layar terbelah, K3 berita, K4 kartu game, K5 detektif, K6 surat, K7 tutorial, K8 horor).
// Diekstrak dari konsep/K*/buat.mjs (contoh lulus owner 21 Okt 2026). Format sama dengan primitif-umum.mjs.
import { f2, esc, VW, VH } from "./inti.mjs";
import { tx, H, T, L, tokoh, pasangTokoh } from "./primitif-umum.mjs";
import { UNGU } from "./tema.mjs";

const INK = "#16161D";
const box = (V, id, { x, y, w, h, r = 0, bg = "#fff", rad = 28, inner = "", st = "" }) =>
  `<div class="it" id="${id}" data-r="${r}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}"><div class="b b-j" style="background:${bg};border:7px solid ${INK};border-radius:${rad}px;box-shadow:12px 14px 0 ${INK}">${inner}</div></div>`;
const teks = (t, css) => `<div style="position:absolute;${css}">${t}</div>`;
const fsMuat = (s, lebar, maks, min = 30, k = 0.58) => Math.max(min, Math.min(maks, Math.floor(lebar / Math.max(1, Math.max(...String(s).split("\n").map((x) => x.length)) * k))));
const RAR = { COMMON: ["#1E7F4F", "#7CF2B0", "#2ECC71"], RARE: ["#6C2E9C", "#E0B3FF", "#BB6BD9"], EPIC: ["#117A65", "#7DF5DC", "#1ABC9C"], LEGENDARY: ["#B9770E", "#FFD54F", "#FFB300"] };
const TINTA = "#1F3A93";

export const KONSEP = {
  // ================= K1 =================
  kalender: {
    konsep: ["K1"],
    ket: "K1: lembar kalender HARI 1 disobek → HARI 2, latar berganti warna solusi, logo produk muncul. Pasang opsi hari:2 di adegan ini.",
    kolom: { dari: "teks<=8", ke: "teks<=8", logo: "bool", kata: "teks<=20", hari: "angka", jam: "teks<=5" },
    bangun(V, c) {
      const o = c.o, sid = c.sid; V.font.add("SerifB");
      const hal = (id, judul, warna, isi) => V.P(id, { x: 170, y: 330, w: 740, h: 820, r: 0, c: "white", hi: true, inner: `<div style="position:absolute;left:0;right:0;top:0;height:190px;background:${warna};border-radius:14px 14px 0 0"></div>` + V.T(judul, "left:0;right:0;top:62px;text-align:center;font:900 76px/1 'Spartan';color:#fff") + V.T(isi, `left:0;right:0;top:300px;text-align:center;font:900 300px/1 'SerifB';color:${warna}`) });
      const dari = o.dari || "HARI 1", ke = o.ke || "HARI 2";
      const fg = hal(`${sid}k2`, esc(ke), V.aksen, esc(ke.replace(/\D/g, "") || "2")) + hal(`${sid}k1`, esc(dari), "#C62828", esc(dari.replace(/\D/g, "") || "1")) + (o.logo !== false ? V.logo(`${sid}l`, { y: 1000 }) : "");
      const { s, d } = V.scene(c, L(V, c, { suasana: "masalah" }) + `<div class="lay" id="${sid}f">${fg}</div>`);
      V.stick(`#${sid}k1`, s + 0.1, "{dr:-6}", null);
      const tb = Math.min(T(V, c, { teks: "besoknya", kata: o.kata }, 0, 2), s + d * 0.35);
      V.K(`tl.to("#${sid}k1", {y:1400, x:-200, rotation:-38, duration:0.55, ease:K.st("power2.in",0.55)}, ${f2(tb + 0.15)});`); V.sfx(tb + 0.15, "sobek", 0.9);
      V.K(`if(document.querySelector("#${sid}bgc"))tl.to("#${sid}bgc", {backgroundColor:"${V.solusiWarna}", duration:0.6, ease:"none"}, ${f2(tb + 0.2)});`);
      if (o.logo !== false) V.stick(`#${sid}l`, Math.max(tb + 0.7, T(V, c, { teks: V.profil.cue }, 1, 2) - 0.1), "{dr:-10}", "ding");
    },
  },

  // ================= K2 =================
  banding: {
    konsep: ["K2"],
    ket: "K2: layar terbelah garis sobekan. Kiri DULU (kacau, sepia), kanan SEKARANG (rapi, terang); kejadian sama bersamaan. Tiap sisi: pose+wajah+tempelan.",
    kolom: { kiri: "sisi!", kanan: "sisi!", label_kiri: "teks<=10", label_kanan: "teks<=10" },
    bangun(V, c) {
      const o = c.o, sid = c.sid;
      const sisi = (k, cfg, x0) => {
        const tk = tokoh(V, { ...c, o: { ...c.o, ...cfg } }, { pose: cfg.pose ?? (k ? "jempol" : "panik"), wajah: cfg.wajah ?? [k ? "senang" : "panik"] });
        const h = 700, w = V.lebar(tk.pose, h);
        return `<div class="lay" id="${sid}${k}" style="clip-path:inset(0 ${k ? 0 : 540}px 0 ${k ? 540 : 0}px)">` +
          `<div class="full" style="background:${k ? "#F6FBF8" : "#D9C3A0"};filter:url(#grainBg)${k ? "" : ";"}"></div>` +
          (cfg.prop ? V.gambar(`${sid}${k}p`, cfg.prop, { x: x0 + 20, y: 980, h: 380 }) : "") +
          V.orang(`${sid}${k}t`, tk.pose, tk.wajah, { x: Math.round(x0 + 270 - w / 2), y: 760, h }) +
          (cfg.stempel ? V.stempel(`${sid}${k}s`, { x: x0 + 40, y: 560, text: H(cfg.stempel), fs: 56, r: k ? 6 : -8, color: k ? V.aksen : "#C62828" }) : "") +
          (cfg.bubble ? V.bubble(`${sid}${k}b`, { x: x0 + 40, y: 360, w: 460, h: 150, text: H(cfg.bubble), fs: 44, r: k ? 4 : -4 }) : "") + `</div>`;
      };
      const garis = `<svg style="position:absolute;left:500px;top:0;width:80px;height:${VH}px" viewBox="0 0 80 1920"><path d="M40,0 ${Array.from({ length: 24 }, (_, k) => `L${k % 2 ? 62 : 18},${(k + 1) * 80}`).join(" ")}" fill="none" stroke="#FFFDF8" stroke-width="22" stroke-linejoin="round"/></svg>`;
      const lab = V.tag(`${sid}l0`, { x: 270, y: 120, text: H(o.label_kiri || "DULU"), c: "navy", color: "#fff", fs: 60, r: -3, hi: true, anchor: "center" }) + V.tag(`${sid}l1`, { x: 810, y: 120, text: H(o.label_kanan || "SEKARANG"), color: V.aksen, fs: 60, r: 3, hi: true, anchor: "center" });
      const { s, d } = V.scene(c, sisi(0, o.kiri || {}, 0) + sisi(1, o.kanan || {}, 540) + garis + `<div class="lay">${lab}</div>`);
      V.stick(`#${sid}l0`, s + 0.15, "{dr:-10}"); V.stick(`#${sid}l1`, s + 0.3, "{dr:10}", null);
      [0, 1].forEach((k) => {
        const cfg = (k ? o.kanan : o.kiri) || {};
        V.muncul(`#${sid}${k}t`, s + 0.2 + k * 0.15, { y0: 200, bunyi: null }); V.napas(`#${sid}${k}t`, s + 0.8, d - 1, k ? {} : { amp: 0.02, rot: 2.4, per: 0.45 });
        if (cfg.prop) V.muncul(`#${sid}${k}p`, s + 0.3, { y0: 160, bunyi: null });
        if (cfg.bubble) V.stick(`#${sid}${k}b`, T(V, c, cfg.bubble, k, 2), "{dr:-8}", "boing");
        if (cfg.stempel) V.hantam(`#${sid}${k}s`, T(V, c, cfg.stempel, k, 2, 0.5) + 0.1 * k);
      });
    },
  },

  // ================= K3 =================
  studio: {
    konsep: ["K3"],
    ket: "K3: studio berita: reporter (foto potong) + papan BERITA TERKINI + judul berita besar + lower third nama reporter.",
    kolom: { reporter: "aset", judul: "teks<=30!", label: "teks<=16", nama: "teks<=24", jabatan: "teks<=28" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, rep = o.reporter || V.cariTag(["reporter"], "tokoh-pendukung");
      const lt = (id, a, b) => `<div class="it" id="${id}" style="left:40px;top:1120px;width:1000px;height:170px"><div style="position:absolute;left:0;top:0;width:1000px;height:96px;background:#E53935;border-radius:6px 6px 0 0"></div><div style="position:absolute;left:30px;top:22px;font:900 54px/1 'Spartan';color:#fff;white-space:nowrap">${a}</div><div style="position:absolute;left:0;top:96px;width:820px;height:70px;background:#fff"></div><div style="position:absolute;left:30px;top:112px;font:700 38px/1 'InterL';color:#0B1F4A;white-space:nowrap">${b}</div></div>`;
      const fg = `<div class="it" id="${sid}b" style="left:60px;top:150px;padding:18px 34px 12px;background:#E53935;font:900 64px/1 'Spartan';color:#fff;letter-spacing:4px;border-radius:8px">${H(o.label || "BERITA TERKINI")}</div>` +
        `<div class="it" id="${sid}j" style="left:60px;top:280px;width:960px;font:900 ${fsMuat(tx(o.judul).teks, 960 * 2, 84, 50)}px/1.1 'Spartan';color:#fff;text-shadow:0 6px 0 rgba(0,0,0,.4)">${H(o.judul)}</div>` +
        (o.nama ? lt(`${sid}lt`, H(o.nama), H(o.jabatan || "Reporter")) : "");
      const mid = rep ? V.gambar(`${sid}r`, rep, { x: 540 - V.lebar(rep, 860) / 2, y: 520, h: 860 }) : "";
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}m">${mid}</div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.05 }]]);
      V.stick(`#${sid}b`, s + 0.1, "{dr:-6, s0:1.6}", "stamp");
      V.K(`tl.fromTo("#${sid}j", {clipPath:"inset(0 100% 0 0)"}, {clipPath:"inset(0 0% 0 0)", duration:0.6, ease:"power1.out"}, ${f2(s + 0.35)});`); V.sfx(s + 0.35, "whoosh", 0.5);
      if (rep) V.muncul(`#${sid}r`, s + 0.2, { y0: 200, bunyi: null });
      if (o.nama) V.K(`tl.fromTo("#${sid}lt", {x:-1100}, {x:0, duration:0.45, ease:"power3.out"}, ${f2(T(V, c, o.nama, 1, 2))});`);
    },
  },
  wawancara: {
    konsep: ["K3"],
    ket: "K3: wawancara saksi/pakar: foto/tokoh dalam bingkai + lower third nama & keterangan + kutipan gelembung + mikrofon.",
    kolom: { saksi: "aset!", nama: "teks<=22!", ket: "teks<=30", kutipan: "teks<=40", stempel: "teks<=12" },
    bangun(V, c) {
      const o = c.o, sid = c.sid;
      const lt = `<div class="it" id="${sid}lt" style="left:40px;top:1120px;width:1000px;height:170px"><div style="position:absolute;left:0;top:0;width:900px;height:96px;background:#0B1F4A;border-left:16px solid #E53935"></div><div style="position:absolute;left:36px;top:22px;font:900 54px/1 'Spartan';color:#fff;white-space:nowrap">${H(o.nama)}</div><div style="position:absolute;left:0;top:96px;width:820px;height:70px;background:#fff"></div><div style="position:absolute;left:36px;top:112px;font:700 38px/1 'InterL';color:#0B1F4A;white-space:nowrap">${H(o.ket || "Saksi")}</div></div>`;
      const sk = o.saksi, png = /\.png$/i.test(V.A(sk).nama);
      const foto = png ? V.gambar(`${sid}r`, sk, { x: 540 - V.lebar(sk, 900) / 2, y: 280, h: 900 }) :
        `<div class="it" id="${sid}r" style="left:90px;top:200px;width:900px;height:900px;border:12px solid #fff;box-shadow:0 20px 40px rgba(0,0,0,.5);overflow:hidden"><img src="${V.src(sk)}" style="width:100%;height:100%;object-fit:cover;object-position:50% 25%"></div>`;
      const fg = lt + (o.kutipan ? V.bubble(`${sid}q`, { x: 60, y: 150, w: 960, h: 200, text: `“${H(o.kutipan)}”`, fs: fsMuat(tx(o.kutipan).teks, 1700, 56, 36), r: -2 }) : "") + (o.stempel ? V.stempel(`${sid}s`, { x: 560, y: 900, text: H(o.stempel), fs: 70, r: 8 }) : "");
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}m">${foto}</div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.06 }]]);
      V.muncul(`#${sid}r`, s + 0.1, { y0: 160, bunyi: null });
      V.K(`tl.fromTo("#${sid}lt", {x:-1100}, {x:0, duration:0.45, ease:"power3.out"}, ${f2(s + 0.3)});`); V.sfx(s + 0.3, "whoosh", 0.5);
      if (o.kutipan) V.stick(`#${sid}q`, T(V, c, o.kutipan, 0, 2, 0.5), "{dr:-6}", "pop");
      if (o.stempel) V.hantam(`#${sid}s`, T(V, c, o.stempel, 1, 2));
    },
  },

  // ================= K4 =================
  "tipe-hook": {
    konsep: ["K4"],
    ket: "K4 pembuka: angka besar 'N TIPE' + judul + sub + kartu tertutup dibagikan + gelembung 'Kamu yang mana?'.",
    kolom: { jumlah: "angka!", judul: "teks<=18!", sub: "teks<=30", tanya: "teks<=18" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, n = Math.max(2, Math.min(5, +o.jumlah || 4)), lw = Math.min(215, Math.floor(860 / n));
      const pung = (k) => `<div class="kt" id="${sid}c${k}" style="position:absolute;left:${Math.round(540 - (n * lw) / 2 + k * lw + (lw - 200) / 2)}px;top:720px;width:200px;height:290px;border-radius:22px;background:linear-gradient(150deg,#6C3CE1,#2A1660);border:7px solid #FFD54F;box-shadow:0 14px 30px rgba(0,0,0,.5);transform:rotate(${(k - (n - 1) / 2) * 7}deg)"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:900 120px/1 'Spartan';color:#FFD54F">?</div></div>`;
      const fg = `<div id="${sid}a" style="position:absolute;left:0;right:0;top:250px;text-align:center;font:900 190px/1 'Spartan';color:#FFD54F;text-shadow:0 10px 0 #6C3CE1">${n} TIPE</div>
    <div id="${sid}b" style="position:absolute;left:0;right:0;top:450px;text-align:center;font:900 ${fsMuat(tx(o.judul).teks, 1000, 76, 48, 0.62)}px/1 'Spartan';color:#fff;letter-spacing:2px">${H(o.judul)}</div>
    ${o.sub ? `<div id="${sid}u" style="position:absolute;left:0;right:0;top:545px;text-align:center;font:700 40px/1 'InterL';color:#C9B8FF">${H(o.sub)}</div>` : ""}
    ${Array.from({ length: n }, (_, k) => pung(k)).join("")}${V.bubble(`${sid}q`, { x: 300, y: 1080, w: 480, h: 170, text: H(o.tanya || "Kamu yang mana?"), fs: 54, r: -4, color: "#6C3CE1" })}`;
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}f">${fg}</div>`);
      V.K(`tl.fromTo("#${sid}a", {scale:1.7}, {scale:1, duration:0.35, ease:"power4.out"}, ${f2(s)});`); V.sfx(s + 0.05, "boom", 0.6);
      V.K(`tl.fromTo("#${sid}b", {y:60, opacity:0}, {y:0, opacity:1, duration:0.3}, ${f2(Math.min(s + 0.6, T(V, c, o.judul, 0, 3) - 0.1))});`);
      if (o.sub) V.K(`tl.fromTo("#${sid}u", {opacity:0}, {opacity:1, duration:0.3}, ${f2(T(V, c, o.sub, 1, 3) - 0.1)});`);
      const tc = Math.min(s + 0.9, T(V, c, { teks: "tipe" }, 1, 3));
      for (let k = 0; k < n; k++) { const t = f2(tc + k * 0.16); V.K(`tl.fromTo("#${sid}c${k}", {y:1100, x:${((n - 1) / 2 - k) * 200}, opacity:0}, {y:0, x:0, opacity:1, duration:0.4, ease:"power3.out"}, ${t});`); V.sfx(t, "kertas", 0.6); }
      const tq = T(V, c, o.tanya || { teks: "kamu mana" }, 2, 3);
      V.stick(`#${sid}q`, Math.max(tq, tc + n * 0.16 + 0.2), "{dr:-12}");
      V.K(`tl.to([${Array.from({ length: n }, (_, k) => `"#${sid}c${k}"`).join(",")}], {y:-24, duration:0.25, yoyo:true, repeat:3, stagger:0.08, ease:"sine.inOut"}, ${f2(Math.max(tq, tc + n * 0.16 + 0.2) + 0.3)});`);
    },
  },
  "kartu-tipe": {
    konsep: ["K4"],
    ket: "K4: kartu karakter ala game (rarity COMMON/RARE/EPIC/LEGENDARY, foto, 4 bar statistik, SKILL/KELEMAHAN) + 1 gag: turun (bar anjlok), chat (banjir chat), galat (dialog error), notif (notifikasi rapi + Zzz), lupa (gelembung ingatan hilang).",
    kolom: { no: "angka!", nama: "teks<=24!", rarity: "pilih:COMMON|RARE|EPIC|LEGENDARY", foto: "aset!", stat: "stat!", skill: "teks<=34!", lemah: "teks<=34!", gag: "gag" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, id = `${sid}k`, rar = o.rarity || ["COMMON", "RARE", "EPIC", "LEGENDARY"][Math.min(3, (o.no || 1) - 1)];
      const [warna, warna2, wb] = RAR[rar]; const nama = tx(o.nama).teks.toUpperCase();
      const st = [].concat(o.stat).slice(0, 4).map((x) => (Array.isArray(x) ? { label: x[0], nilai: x[1] } : x));
      const bar = (k, { label, nilai }) => `<div style="position:absolute;left:44px;top:${818 + k * 66}px;width:812px;height:52px">
    <div style="position:absolute;left:0;top:10px;width:300px;font:900 ${label.length > 13 ? 28 : 32}px/1 'Spartan';color:#fff;letter-spacing:1px;white-space:nowrap">${esc(label.toUpperCase())}</div>
    <div style="position:absolute;left:310px;top:4px;width:400px;height:40px;border-radius:20px;background:rgba(0,0,0,.45);overflow:hidden"><div id="${id}b${k}" data-v="${nilai}" style="position:absolute;left:0;top:0;bottom:0;width:100%;border-radius:20px;background:${nilai < 30 ? "#F39C12" : wb};transform-origin:0 50%;transform:scaleX(0)"></div></div>
    <div id="${id}n${k}" style="position:absolute;left:728px;top:8px;width:90px;text-align:right;font:900 36px/1 'Spartan';color:${warna2}">0</div></div>`;
      const fa = V.A(o.foto), png = /\.png$/i.test(fa.nama);
      const img = png ? `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,${warna2},${warna})"></div><img id="${id}img" src="${V.src(o.foto)}" style="position:absolute;left:50%;bottom:0;height:96%;transform:translateX(-50%)">`
        : `<img id="${id}img" src="${V.src(o.foto)}" style="position:absolute;left:0;top:-60px;width:820px;height:820px;object-fit:cover">`;
      const kartu = `<div class="kt" id="${id}" style="position:absolute;left:90px;top:120px;width:900px;height:1250px">
  <div style="position:absolute;inset:0;border-radius:40px;background:linear-gradient(160deg,${warna},#120a24 70%);border:10px solid ${warna2};box-shadow:0 0 60px ${warna}, 0 30px 60px rgba(0,0,0,.6)"></div>
  <div style="position:absolute;left:40px;top:34px;padding:12px 22px 6px;border-radius:12px;background:${warna2};font:900 34px/1 'Spartan';color:${UNGU};letter-spacing:4px">${rar}</div>
  <div style="position:absolute;right:44px;top:30px;font:900 52px/1 'Spartan';color:${warna2}">#${o.no}</div>
  <div style="position:absolute;left:40px;right:40px;top:100px;font:900 ${Math.min(64, Math.floor(820 / (nama.length * 0.66)))}px/1.05 'Spartan';color:#fff;white-space:nowrap;text-shadow:0 4px 0 rgba(0,0,0,.4)">${esc(nama)}</div>
  <div style="position:absolute;left:40px;top:190px;width:820px;height:600px;border-radius:24px;overflow:hidden;border:6px solid rgba(255,255,255,.85)">${img}</div>
  ${st.map((x, k) => bar(k, x)).join("")}
  <div style="position:absolute;left:44px;right:44px;top:1090px;font:800 34px/1.25 'InterL';color:#fff"><b style="color:${warna2}">SKILL:</b> ${H(o.skill)}<br><b style="color:#FF6B6B">KELEMAHAN:</b> ${H(o.lemah)}</div></div>`;
      // gag
      const g = o.gag || {}; let gag = "";
      if (g.jenis === "galat") gag = `<div class="it" id="${sid}g" data-r="-3" style="left:150px;top:440px;width:780px;height:330px"><div style="position:absolute;inset:0;border-radius:16px;background:#F3F3F3;border:3px solid #999;box-shadow:0 20px 50px rgba(0,0,0,.6)"></div>
      <div style="position:absolute;left:0;right:0;top:0;height:60px;border-radius:14px 14px 0 0;background:#C0392B"></div><div style="position:absolute;left:24px;top:16px;font:800 32px/1 'InterL';color:#fff">Peringatan</div>
      <div style="position:absolute;left:36px;top:90px;font:900 90px/1 'Spartan';color:#C0392B">⚠</div>
      <div style="position:absolute;left:150px;top:96px;right:30px;font:700 38px/1.25 'InterL';color:#222">${H(g.teks || "File tertimpa.")}</div>
      <div style="position:absolute;right:30px;bottom:24px;padding:14px 40px 10px;border-radius:10px;background:#2471A3;font:800 32px/1 'InterL';color:#fff">OK :(</div></div>`;
      if (g.jenis === "chat") gag = [].concat(g.item || ["Selamat pagi 🌸", "😂😂😂", "[stiker]", "Siap kak", "Oke sip 👍", "Info grup...", "Pagi semua ☀️", "[stiker]"]).slice(0, 10).map((t, k) => `<div class="it" id="${sid}g${k}" style="left:${k % 2 ? 470 : 70}px;top:${300 + (k % 5) * 150}px;padding:22px 30px 18px;border-radius:26px;background:${k % 3 ? "#DCF8C6" : "#fff"};box-shadow:0 8px 20px rgba(0,0,0,.4);font:700 44px/1 'InterL';color:#222;white-space:nowrap">${esc(t)}</div>`).join("");
      if (g.jenis === "lupa") gag = [].concat(g.item || ["pesanan 1", "pesanan 2", "pesanan 3", "pesanan 4"]).slice(0, 4).map((t, k) => V.bubble(`${sid}g${k}`, { x: [40, 740, 60, 720][k], y: [300, 360, 560, 620][k], w: 300, h: 130, text: esc(t), fs: 40, r: k % 2 ? 6 : -6, color: "#6C3CE1", tail: k % 2 ? "right" : "left" })).join("") +
        `<div class="it" id="${sid}gq" style="left:380px;top:300px;width:320px;height:320px"><div class="tx" style="position:absolute;inset:0;text-align:center;font:900 300px/1 'Spartan';color:#FFD54F;text-shadow:0 12px 0 #6C3CE1">?</div></div>`;
      if (g.jenis === "notif") gag = [].concat(g.item || ["Pesanan baru masuk", "Stok terhitung otomatis", "Laporan harian jadi"]).slice(0, 3).map((t, k) => `<div class="it" id="${sid}g${k}" style="left:120px;top:${300 + k * 130}px;width:840px;padding:22px 30px 16px;border-radius:24px;background:rgba(255,255,255,.96);box-shadow:0 10px 26px rgba(0,0,0,.45);font:800 44px/1 'InterL';color:#1A1033;white-space:nowrap"><span style="display:inline-block;width:56px;height:56px;margin-right:18px;vertical-align:-14px;border-radius:14px;background:${V.aksen};color:#fff;text-align:center;font:900 40px/56px 'Spartan'">✓</span>${esc(t)}</div>`).join("") +
        `<div class="it" id="${sid}gz" style="left:700px;top:0px"><div class="tx" style="position:relative;font:900 150px/1 'Spartan';color:#fff;text-shadow:0 8px 0 ${warna}">Zzz</div></div>` + (g.stempel ? V.stempel(`${sid}gs`, { x: 170, y: 860, text: H(g.stempel), r: -8, fs: 80, color: warna }) : "");
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}f">${kartu}${gag}</div>`);
      V.K(`tl.fromTo("#${id}", {rotationY:-100, scale:0.7, opacity:0}, {rotationY:0, scale:1, opacity:1, duration:0.55, ease:"back.out(1.4)"}, ${f2(s + 0.05)});`); V.sfx(s + 0.05, "whoosh", 0.7); V.sfx(s + 0.4, "sparkle", 0.6);
      if (rar === "LEGENDARY") V.K(`tl.fromTo("#${id}", {filter:"brightness(1)"}, {filter:"brightness(1.25)", duration:0.6, yoyo:true, repeat:3, ease:"sine.inOut"}, ${f2(s + 0.7)});`);
      const ti = Math.max(s + 0.6, Math.min(T(V, c, o.skill, 0, 3), s + d * 0.3));
      st.forEach((x, k) => {
        const tk = f2(ti + k * 0.16);
        V.K(`(function(){const n=document.querySelector("#${id}n${k}"),o={v:0};tl.fromTo("#${id}b${k}",{scaleX:0},{scaleX:${Math.max(0.02, x.nilai / 100)},duration:0.45,ease:"power2.out"},${tk});tl.fromTo(o,{v:0},{v:${x.nilai},duration:0.45,ease:"power2.out",onUpdate:()=>{n.textContent=Math.round(o.v);}},${tk});})();`);
        V.sfx(tk, "tik", 0.5);
      });
      const tg = Math.max(ti + 1, T(V, c, { teks: g.teks || o.lemah, kata: g.kata }, 2, 3));
      if (g.jenis === "galat") { V.stick(`#${sid}g`, tg, "{dr:-8, s0:0.3}", "kaget"); V.geleng(`#${sid}g`, tg + 0.35, 14); }
      if (g.jenis === "chat") { const n = Math.min(10, [].concat(g.item || [1, 2, 3, 4, 5, 6, 7, 8]).length); for (let k = 0; k < n; k++) { const t = f2(tg + k * 0.13); V.K(`tl.fromTo("#${sid}g${k}", {y:-500, opacity:0, rotation:${(k % 3 - 1) * 10}}, {y:0, opacity:1, rotation:${(k % 3 - 1) * 4}, duration:0.35, ease:"back.out(1.6)"}, ${t});`); if (k % 2 === 0) V.sfx(t, "pop", 0.55); } }
      if (g.jenis === "lupa") { [0, 1, 2, 3].forEach((k) => V.stick(`#${sid}g${k}`, ti + 0.4 + k * 0.2, `{dr:${k % 2 ? 16 : -16}}`, k ? null : "pop")); V.K(`tl.to(["#${sid}g0","#${sid}g1","#${sid}g2","#${sid}g3"], {scale:0, opacity:0, duration:0.25, stagger:0.05, ease:"power2.in"}, ${f2(tg - 0.25)});`); V.sfx(tg - 0.25, "boing", 0.8); V.stick(`#${sid}gq`, tg, "{dr:-20, s0:0.2}", null); V.geleng(`#${sid}gq`, tg + 0.4, 18); }
      if (g.jenis === "notif") { [0, 1, 2].forEach((k) => V.stick(`#${sid}g${k}`, tg + k * 0.35, "{dr:-6, y0:-120}", "ding")); V.stick(`#${sid}gz`, tg + 1.3, "{dr:-14}", null); V.melayang(`#${sid}gz`, tg + 1.8, d - (tg - s) - 1.9, 20, 0.5); if (g.stempel) V.hantam(`#${sid}gs`, tg + 1.1); }
      if (g.turun != null) { const k = Math.max(0, Math.min(st.length - 1, g.turun)), v = st[k]?.nilai ?? 50, ke = g.ke ?? 0, t = f2(g.kata ? V.waktu(c.bi, { kata: g.kata }) : tg + (g.jenis ? 0.5 : 0));
        V.K(`(function(){const n=document.querySelector("#${id}n${k}"),o={v:${v}};tl.to("#${id}b${k}",{scaleX:${Math.max(ke, 2) / 100},duration:0.7,ease:"power2.in"},${t});tl.fromTo(o,{v:${v}},{v:${ke},duration:0.7,ease:"power2.in",immediateRender:false,onUpdate:()=>{n.textContent=Math.round(o.v);}},${t});})();`);
        V.K(`tl.to("#${id}b${k}", {backgroundColor:"#E74C3C", duration:0.4}, ${f2(t + 0.2)});`); V.sfx(t, "turun", 0.9); }
    },
  },
  "tipe-pilih": {
    konsep: ["K4"],
    ket: "K4 penutup: kartu mini semua tipe (diambil otomatis dari adegan kartu-tipe) + kolom komentar mengetik 'Aku tipe nomor ...'.",
    kolom: { komentar: "teks<=24" },
    bangun(V, c) {
      const o = c.o, sid = c.sid;
      const kartuK = V.adegan.filter((a) => a.primitif === "kartu-tipe").slice(0, 4).map((a) => a.opsi);
      const n = kartuK.length, kol = n <= 2 ? n : 2;
      const mini = (k, a) => { const rar = a.rarity || ["COMMON", "RARE", "EPIC", "LEGENDARY"][Math.min(3, (a.no || k + 1) - 1)], [w, w2] = RAR[rar], png = /\.png$/i.test(V.A(a.foto).nama), nm = tx(a.nama).teks.toUpperCase().replace(/^SI\s+/, "");
        return `<div class="kt" id="${sid}m${k}" style="position:absolute;left:${k % kol ? 560 : 100}px;top:${190 + Math.floor(k / kol) * 480}px;width:420px;height:440px;border-radius:26px;background:${w};border:7px solid #fff;box-shadow:0 14px 34px rgba(0,0,0,.5);overflow:hidden">
    ${png ? `<div style="position:absolute;left:0;top:0;width:406px;height:330px;background:radial-gradient(circle at 50% 40%,${w2},${w})"></div><img src="${V.src(a.foto)}" style="position:absolute;left:50%;top:10px;height:320px;transform:translateX(-50%)">` : `<img src="${V.src(a.foto)}" style="position:absolute;left:0;top:0;width:406px;height:330px;object-fit:cover;object-position:50% 20%">`}
    <div style="position:absolute;left:0;right:0;top:340px;text-align:center;font:900 ${Math.min(34, Math.floor(400 / (nm.length * 0.62)))}px/1.1 'Spartan';color:#fff;white-space:nowrap">${esc(nm)}</div>
    <div style="position:absolute;left:14px;top:14px;width:78px;height:78px;border-radius:50%;background:#fff;text-align:center;font:900 52px/84px 'Spartan';color:${w}">${a.no ?? k + 1}</div></div>`; };
      const fg = kartuK.map((a, k) => mini(k, a)).join("") + `<div class="it" id="${sid}c" style="left:80px;top:1160px;width:920px;height:150px"><div style="position:absolute;inset:0;border-radius:75px;background:#fff;box-shadow:0 12px 30px rgba(0,0,0,.5)"></div>
    <div style="position:absolute;left:30px;top:30px;width:90px;height:90px;border-radius:50%;background:#6C3CE1"></div>
    <div id="${sid}ck" style="position:absolute;left:150px;top:50px;font:700 48px/1 'InterL';color:#1A1033;white-space:nowrap;overflow:hidden;width:0">${H(o.komentar || "Aku tipe nomor ...")}</div></div>`;
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}f">${fg}</div>`);
      kartuK.forEach((_, k) => { const t = f2(s + 0.1 + k * 0.12); V.K(`tl.fromTo("#${sid}m${k}", {scale:0, rotation:${(k - 1.5) * 20}}, {scale:1, rotation:0, duration:0.4, ease:"back.out(1.8)"}, ${t});`); if (!k) V.sfx(t, "kertas", 0.6); });
      const tk = Math.max(s + 0.8, T(V, c, { teks: "tulis komentar" }, 1, 2) - 0.1);
      V.stick(`#${sid}c`, tk, "{dr:-6, y0:120}");
      V.K(`tl.fromTo("#${sid}ck", {width:0}, {width:700, duration:1.1, ease:"steps(18)"}, ${f2(tk + 0.3)});`); V.sfx(tk + 0.3, "tik", 0.6); V.sfx(tk + 0.8, "tik", 0.5);
      V.K(`tl.to([${kartuK.map((_, k) => `"#${sid}m${k}"`).join(",")}], {y:-20, duration:0.22, yoyo:true, repeat:1, stagger:0.12, ease:"sine.inOut"}, ${f2(T(V, c, { teks: "mana" }, 0, 2))});`);
    },
  },

  // ================= K5 =================
  "berkas-kasus": {
    konsep: ["K5"],
    ket: "K5 pembuka noir: map BERKAS KASUS di bawah lampu sorot + tulisan nomor berkas mengetik + polaroid barang bukti + stempel HILANG / LAGI.",
    kolom: { judul: "teks<=14", nomor: "teks<=26!", gambar: "aset!", label: "teks<=12", stempel: "daftar<=2:teks<=10!" },
    bangun(V, c) {
      const o = c.o, sid = c.sid; V.font.add("SerifB");
      const st = [].concat(o.stempel).map(tx);
      const fg = V.P(`${sid}c`, { x: 110, y: 250, w: 860, h: 1060, r: -2, c: "", hi: true, rad: 10, ppst: "background:#B98F55", inner:
        `<div style="position:absolute;left:40px;top:-46px;width:300px;height:70px;background:#B98F55;border-radius:16px 16px 0 0"></div>` +
        V.T(H(o.judul || "BERKAS KASUS"), "left:50px;top:40px;font:900 58px/1 'Spartan';color:#3E2A14;letter-spacing:3px;white-space:nowrap") +
        V.T("RAHASIA", "left:600px;top:46px;font:900 40px/1 'Spartan';color:#7A1F1F;letter-spacing:4px;border:5px solid #7A1F1F;padding:8px 14px 4px") +
        `<div id="${sid}no" class="tx" style="position:absolute;left:50px;top:130px;font:400 50px/1.25 'SerifB';color:#2B2418;white-space:nowrap">${H(o.nomor)}</div>` }) +
        V.polaroid(`${sid}p`, { x: 270, y: 470, w: 540, h: 640, src: o.gambar, cap: H(o.label || ""), r: 3 }) +
        (st[0] ? V.stempel(`${sid}s0`, { x: 150, y: 930, text: esc(st[0].teks), r: -12, fs: st[0].teks.length > 7 ? 110 : 140 }) : "") +
        (st[1] ? V.stempel(`${sid}s1`, { x: 600, y: 1130, text: esc(st[1].teks), r: 9, fs: 96 }) : "");
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}c2" style="transform-origin:540px 800px">${fg}</div>`, { enter: c.bi > 0 });
      V.K(`tl.fromTo("#${sid}c2", {scale:1.25, y:120}, {scale:1, y:0, duration:1.1, ease:"power2.out"}, ${f2(s)});`);
      V.K(`tl.to("#${sid}c2", {scale:1.12, y:-40, duration:${f2(Math.max(0.4, d - 1.2))}, ease:"sine.inOut"}, ${f2(s + 1.2)});`);
      V.sfx(s + 0.05, "tegang", 0.9);
      V.K(`tl.fromTo("#${sid}no", {clipPath:"inset(0 100% 0 0)"}, {clipPath:"inset(0 0% 0 0)", duration:0.9, ease:"none"}, ${f2(s + 0.2)});`); V.sfx(s + 0.25, "tik", 0.6);
      V.stick(`#${sid}p`, s + 0.35, "{dr:-14}", "kertas");
      st.forEach((x, k) => V.hantam(`#${sid}s${k}`, Math.max(s + 0.6 + k * 0.5, T(V, c, x, k, 2, 0.5))));
      if (st[1]) V.geleng(`#${sid}p`, T(V, c, st[1], 1, 2) + 0.05, 10);
    },
  },
  penyelidikan: {
    konsep: ["K5"],
    ket: "K5: papan gabus + detektif wanita + catatan kuning hitungan kasus (turus) + pita garis polisi PENYELIDIKAN meluncur.",
    kolom: { catatan: "teks<=12", jumlah: "angka", sub: "teks<=14", pita: "teks<=16", pose: "pose", wajah: "wajah[]<=2", ganti: "teks<=20" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, n = Math.max(1, Math.min(5, o.jumlah ?? 3));
      const tk = tokoh(V, { ...c, o: { ...o, tokoh: "detektif" } }, { pose: o.pose ?? "kaca-pembesar", wajah: o.wajah ?? ["serius", "curiga"] });
      const tally = `<svg style="position:absolute;left:60px;top:150px;width:360px;height:120px" viewBox="0 0 360 120">${Array.from({ length: n }, (_, k) => `<path class="${sid}tl" d="M${40 + k * 70},10 L${30 + k * 70},110" stroke="#C62828" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>`).join("")}</svg>`;
      const fg = V.P(`${sid}k`, { x: 70, y: 200, w: 470, h: 330, r: -4, c: "", hi: true, ppst: "background:#FFF59D", inner: V.T(H(o.catatan || "KASUS KE-"), "left:40px;top:40px;font:400 62px/1 'Marker';color:#1B2A4A;white-space:nowrap") + tally + V.T(H(o.sub || "minggu ini"), "left:0;right:0;top:250px;text-align:center;font:400 44px/1 'Marker';color:#C62828") }) +
        V.pita(`${sid}pt`, { y: 1180, r: -7, text: H(o.pita || "PENYELIDIKAN") });
      const T1 = pasangTokoh(V, c, `${sid}t`, tk, { x: 1040 - V.lebar(tk.pose, 980), y: 520, h: 980, t0: c.s + 0.15, d: c.d, ganti: o.ganti });
      const papan = V.cariTag(["K5"], "latar");
      const { s, d } = V.scene(c, (papan ? V.bgImg(`${sid}bg`, papan) : L(V, c)) + `<div class="lay" id="${sid}m">${T1.html}</div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { x: 20 }, { x: -30 }], [`#${sid}f`, { x: 0 }, { x: -20 }]]);
      T1.anim(); V.stick(`#${sid}k`, s + 0.25, "{dr:-12}");
      const tt = Math.min(s + d * 0.4, T(V, c, { teks: "kasus ketiga" }, 0, 2) - 0.1);
      V.K(`tl.to(".${sid}tl", {strokeDashoffset:0, duration:0.18, stagger:0.22, ease:"none"}, ${f2(tt)});`); V.sfx(tt, "spidol", 0.7);
      const tp = Math.max(tt + n * 0.22 + 0.2, T(V, c, o.pita || { teks: "penyelidikan" }, 1, 2));
      V.K(`tl.fromTo("#${sid}pt", {x:-1500, rotation:-7}, {x:0, rotation:-7, duration:0.45, ease:K.st("power3.out",0.45)}, ${f2(tp)});`); V.sfx(tp, "whoosh", 0.9);
    },
  },
  tersangka: {
    konsep: ["K5"],
    ket: "K5: polaroid TERSANGKA #n di papan gabus + label nama + catatan kuning + 0-2 stempel (ALIBI KUAT / LACI MACET) + detektif kecil.",
    kolom: { no: "angka!", gambar: "aset!", label: "teks<=18!", catatan: "teks<=30", stempel: "daftar<=2:teks<=14", detektif: "bool" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, st = [].concat(o.stempel || []).map(tx), ok = (x) => /✓|kuat|bersih|aman/i.test(x.teks);
      const papan = V.cariTag(["K5"], "latar");
      let fg = V.polaroid(`${sid}p`, { x: 120, y: 200, w: 640, h: 790, src: o.gambar, cap: `TERSANGKA #${o.no}`, r: -4 }) +
        V.tag(`${sid}g`, { x: 160, y: 1030, text: H(o.label), c: "navy", color: "#fff", fs: 60, r: -3, hi: true });
      if (o.catatan) fg += V.kartu(`${sid}n`, { x: 640, y: 760, w: 380, h: 300, text: H(o.catatan), fs: fsMuat(tx(o.catatan).teks, 900, 58, 40), r: 7, bg: "#FFF59D", color: "#C62828" });
      st.forEach((x, k) => { fg += V.stempel(`${sid}s${k}`, { x: k ? 400 : 110, y: k ? 1170 : 820, text: esc(x.teks), r: k ? 7 : -9, fs: x.teks.length > 10 ? 64 : 80, color: ok(x) ? "#2E9E4F" : "#C62828" }); });
      let mid = "";
      if (o.detektif !== false) { const tk = tokoh(V, { ...c, o: { tokoh: "detektif" } }, { pose: "lipat-tangan", wajah: ["curiga"] }); mid = V.orang(`${sid}t`, tk.pose, tk.wajah, { x: 760, y: 1000, h: 560 }); }
      const { s, d } = V.scene(c, (papan ? V.bgImg(`${sid}bg`, papan, c.bi % 2 ? "filter:brightness(.92)" : "") : L(V, c)) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${mid}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { x: 0, scale: 1 }, { x: -20, scale: 1.03 }]]);
      V.stick(`#${sid}p`, Math.min(T(V, c, { teks: "tersangka" }, 0, 3), s + 0.25), "{dr:-12, y0:-120}", "kertas"); V.sfx(s + 0.3, "tegang", 0.6);
      V.stick(`#${sid}g`, T(V, c, o.label, 0, 3), "{dr:10}");
      if (o.catatan) V.stick(`#${sid}n`, T(V, c, o.catatan, 1, 3), "{dr:14}");
      st.forEach((x, k) => { const t = T(V, c, x, k + 1, 3); V.hantam(`#${sid}s${k}`, t); if (!ok(x)) V.geleng(`#${sid}p`, t, 14); });
      if (mid) { V.muncul(`#${sid}t`, s + 0.5, { y0: 200, bunyi: null }); V.napas(`#${sid}t`, s + 1, d - 1); }
    },
  },
  benang: {
    konsep: ["K5"],
    ket: "K5: 3 polaroid tersangka di papan tersambung benang merah ke kartu '?' di tengah + detektif berpikir (menjelang reveal).",
    kolom: { gambar: "aset[]<=3!", tanya: "teks<=3", ganti: "teks<=20" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, g = [].concat(o.gambar).slice(0, 3), papan = V.cariTag(["K5"], "latar");
      const tk = tokoh(V, { ...c, o: { tokoh: "detektif" } }, { pose: "tunjuk", wajah: ["serius", "curiga"] });
      const pos = [[60, 140, -6], [720, 160, 5], [80, 820, 4]];
      const fg = g.map((a, k) => V.polaroid(`${sid}p${k}`, { x: pos[k][0], y: pos[k][1], w: 300, h: 370, src: a, cap: `#${k + 1}`, r: pos[k][2], capfs: 40 })).join("") +
        V.benang(`${sid}b`, [[210, 150, 560, 520], [870, 170, 560, 520], [230, 830, 560, 520]].slice(0, g.length)) +
        V.P(`${sid}q`, { x: 400, y: 480, w: 320, h: 380, r: -2, c: "", hi: true, ppst: "background:#1B1B1F", inner: V.T(H(o.tanya || "?"), "left:0;right:0;top:60px;text-align:center;font:900 230px/1 'Spartan';color:#FFD600") + V.pin() });
      const T1 = pasangTokoh(V, c, `${sid}t`, tk, { x: 560, y: 820, h: 680, t0: c.s + 0.3, d: c.d, ganti: o.ganti || "pelaku" });
      const { s, d } = V.scene(c, (papan ? V.bgImg(`${sid}bg`, papan) : L(V, c)) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${T1.html}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.04 }, { scale: 1.0 }]]);
      g.forEach((_, k) => V.stick(`#${sid}p${k}`, s + 0.1 + k * 0.15, `{dr:${k % 2 ? 10 : -10}}`, k ? null : "kertas"));
      T1.anim();
      const tb = Math.max(s + 0.7, T(V, c, { teks: "semua benang" }, 0, 3));
      g.forEach((_, k) => { V.tarik(`#${sid}bg${k}`, tb + k * 0.3); V.sfx(tb + k * 0.3, "spidol", 0.5); });
      const tq = Math.max(tb + 0.5, T(V, c, { teks: "satu" }, 1, 3));
      V.stick(`#${sid}q`, tq, "{dr:-16}", "tegang");
      V.K(`tl.fromTo("#${sid}q", {scale:1}, {scale:1.12, duration:0.25, yoyo:true, repeat:3, ease:K.st("sine.inOut",0.25)}, ${f2(tq + 0.5)});`);
    },
  },
  pelaku: {
    konsep: ["K5"],
    ket: "K5 reveal: ledakan + polaroid PELAKU besar + stempel nama pelaku (mis. SISTEM KERTAS) + wajah detektif kaget.",
    kolom: { gambar: "aset!", label: "teks<=10", stempel: "teks<=16!" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, wk = V.wajah("kaget", "detektif");
      const { s, d } = V.scene(c, L(V, c, { suasana: "gelap" }) + `<div class="lay" id="${sid}e">${V.ledak(`${sid}L`, { cx: 540, cy: 760, R: 620 })}</div>` +
        `<div class="lay" id="${sid}m">${V.polaroid(`${sid}p`, { x: 250, y: 260, w: 580, h: 900, src: o.gambar, cap: H(o.label || "PELAKU"), r: -3, capfs: 66 })}</div>` +
        `<div class="lay" id="${sid}f">${V.stempel(`${sid}s`, { x: 70, y: 1170, text: H(o.stempel), r: -6, fs: tx(o.stempel).teks.length > 12 ? 80 : 100 })}${wk ? V.muka(`${sid}k`, wk, { x: 760, y: 120, w: 280, r: 8 }) : ""}</div>`, { enter: false });
      V.K(`tl.fromTo("#${sid}w", {scale:1.3, opacity:0}, {scale:1, opacity:1, duration:0.22, ease:"power2.out"}, ${f2(s)});`);
      V.stick(`#${sid}L`, s + 0.05, `{s0:0.2, dr:-30, dur:0.4, ease:"back.out(2)"}`, "boom");
      V.K(`tl.fromTo("#${sid}L", {rotation:0}, {rotation:14, duration:${f2(d)}, ease:"none"}, ${f2(s + 0.4)});`);
      V.stick(`#${sid}p`, s + 0.1, "{dr:20, s0:1.6}", null);
      const ts = Math.max(s + 0.5, T(V, c, o.stempel, 0, 2));
      V.hantam(`#${sid}s`, ts); if (wk) V.stick(`#${sid}k`, ts + 0.4, "{dr:-20}", "kaget");
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.06 }]]);
    },
  },
  modus: {
    konsep: ["K5", "K0", "K3", "K7", "K8"],
    ket: "3 panel komik bernomor (MODUS OPERANDI / kronologi): tiap panel judul + gambar opsional, muncul mengikuti VO.",
    kolom: { judul: "teks<=18", panel: "panel[]<=3!" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, ps = [].concat(o.panel).slice(0, 3).map((p) => ({ ...tx(p), gambar: p.gambar }));
      const pn = (k, p) => V.P(`${sid}p${k}`, { x: 90, y: 210 + k * 400, w: 900, h: 370, r: k % 2 ? 1.5 : -1.5, c: "white", hi: true, rad: 8, inner:
        `<div style="position:absolute;inset:16px;border:7px solid #1B1B1F;border-radius:4px"></div>` + V.T(`${k + 1}. ${esc(p.teks)}`, `left:50px;top:44px;font:900 ${fsMuat(p.teks + "...", 560, 60, 38)}px/1 'Spartan';color:#1B1B1F;white-space:nowrap`) +
        (p.gambar ? `<img src="${V.src(p.gambar)}" style="position:absolute;right:50px;top:30px;height:310px;max-width:330px;object-fit:contain">` : V.T("? ? ?", "left:560px;top:110px;font:900 140px/1 'Spartan';color:#C62828")) });
      const fg = (o.judul !== "" ? V.tag(`${sid}j`, { x: 540, y: 90, text: H(o.judul || "MODUS OPERANDI"), c: "", color: "#FFD600", fs: 56, r: -2, anchor: "center", bg: "#1B1B1F" }) : "") + ps.map((p, k) => pn(k, p)).join("");
      const { s, d } = V.scene(c, L(V, c, { suasana: "gelap" }) + `<div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0, y: 0 }, { scale: 1.03, y: -20 }]]);
      if (o.judul !== "") V.stick(`#${sid}j`, s + 0.1, "{dr:-8}", null);
      ps.forEach((p, k) => V.stick(`#${sid}p${k}`, k === 0 ? Math.min(s + 0.3, T(V, c, p, 0, 3)) : T(V, c, p, k, 3), `{dr:${k % 2 ? 10 : -10}, y0:120}`, k === 2 ? "boing" : "kertas"));
    },
  },
  vonis: {
    konsep: ["K5"],
    ket: "K5 solusi: stempel VONIS + logo + layar aplikasi (UI asli DC / app HTML NW) dengan kolom cari mengetik + timer detik + stempel KETEMU ✓.",
    kolom: { vonis: "teks<=8", ui: "aset", judul: "teks<=18", cari: "teks<=18", app: "app", detik: "angka", ok: "teks<=12" },
    bangun(V, c) {
      const o = c.o, sid = c.sid;
      let layar;
      if (o.app || !o.ui) layar = V.layarApp(`${sid}a`, { x: 90, y: 600, w: 900, h: 640, r: 2, judul: esc(o.app?.judul || o.judul || "Data"), baris: [].concat(o.app?.baris || [[o.cari || "Hasil", "ditemukan", "✓"]]).slice(0, 2).map((r) => [].concat(r).map(esc)) });
      else layar = V.P(`${sid}a`, { x: 90, y: 600, w: 900, h: 640, r: 2, c: "white", hi: true, rad: 18, inner:
        `<div style="position:absolute;left:18px;top:18px;right:18px;height:64px;background:${V.aksen};border-radius:10px 10px 0 0"></div>` + V.T(H(o.judul || "Data Pasien"), "left:44px;top:30px;font:900 40px/1 'Spartan';color:#fff") +
        `<div style="position:absolute;left:18px;top:82px;right:18px;bottom:18px;overflow:hidden;border-radius:0 0 10px 10px;background:#fff"><img src="${V.src(o.ui)}" style="width:100%;position:absolute;left:0;top:-60px"></div>` +
        (o.cari ? `<div style="position:absolute;left:60px;top:110px;width:600px;height:84px;border-radius:42px;background:#fff;border:6px solid ${V.aksen};box-shadow:0 6px 14px rgba(0,0,0,.2)"></div><div id="${sid}ca" class="tx" style="position:absolute;left:110px;top:132px;font:700 40px/1 'InterL';color:#1B2A4A;white-space:nowrap">Cari: ${H(o.cari)}</div>` : "") });
      const det = Math.max(1, Math.min(9, o.detik ?? 3));
      const fg = V.stempel(`${sid}v`, { x: 80, y: 150, text: H(o.vonis || "VONIS"), r: -8, fs: 100, color: "#1B2A4A" }) + V.logo(`${sid}l`, { x: 300, y: 330, w: 700, h: 230, r: 3 }) + layar +
        V.P(`${sid}tm`, { x: 640, y: 1150, w: 360, h: 190, r: -4, c: "navy", hi: true, inner: `<div id="${sid}tn" class="tx" style="position:absolute;left:0;right:0;top:50px;text-align:center;font:900 100px/1 'Spartan';color:#FFD54F">00:00</div>` }) +
        V.stempel(`${sid}k`, { x: 70, y: 1255, text: H(o.ok || "KETEMU ✓"), r: -5, fs: 74, color: V.aksen });
      const { s, d } = V.scene(c, L(V, c, { suasana: "solusi" }) + `<div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0, y: 0 }, { scale: 1.03, y: -20 }]]);
      V.hantam(`#${sid}v`, Math.min(T(V, c, { teks: "vonisnya" }, 0, 4), s + 0.25));
      V.stick(`#${sid}l`, Math.min(T(V, c, { teks: V.profil.cue }, 1, 4), s + 0.6), "{dr:-10}", "ding");
      const ta = Math.min(s + 1.0, Math.max(s + 0.7, T(V, c, { teks: o.judul || "data" }, 2, 4))); // layar jangan telat (QC uji01: 1,5 dtk kosong)
      V.stick(`#${sid}a`, ta, "{dr:10, y0:200}", "kertas");
      if (o.cari && o.ui && !o.app) { V.K(`tl.fromTo("#${sid}ca", {clipPath:"inset(0 100% 0 0)"}, {clipPath:"inset(0 0% 0 0)", duration:0.6, ease:"none"}, ${f2(ta + 0.3)});`); V.sfx(ta + 0.3, "tik", 0.6); }
      const tt = Math.max(ta + 0.5, T(V, c, { teks: "detik hitungan" }, 3, 4) - 0.3);
      V.stick(`#${sid}tm`, tt, "{dr:12}", null);
      V.hitung(`#${sid}tn`, tt + 0.1, 0, det, 0.7, "detik");
      V.hantam(`#${sid}k`, tt + 0.9);
    },
  },

  // ================= K6 =================
  "surat-buka": {
    konsep: ["K6"],
    ket: "K6 pembuka: kertas surat bergaris, 'Surat Terbuka' tulisan tangan merah + baris untuk/dari + hati + maskot penulis surat.",
    kolom: { judul: "teks<=16", untuk: "teks<=26!", dari: "teks<=26!", maskot: "aset" },
    bangun(V, c) {
      const o = c.o, sid = c.sid; V.font.add("Caveat");
      const bar = (id, { x = 160, y, text, fs = 84, color = TINTA, r = -1 }) => `<div class="tx" id="${id}" style="position:absolute;left:${x}px;top:${y}px;width:880px;font:600 ${fs}px/1.05 'Caveat';color:${color};transform:rotate(${r}deg);white-space:nowrap;clip-path:inset(0 100% 0 0)">${text}</div>`;
      const hati = `<div class="it" id="${sid}h" data-r="12" style="left:880px;top:330px;width:110px;height:110px"><div class="b b-j">${V.svgPP("0 0 100 100", `<path d="M50,88 C20,66 4,48 4,30 C4,14 16,4 30,4 C40,4 47,10 50,18 C53,10 60,4 70,4 C84,4 96,14 96,30 C96,48 80,66 50,88 Z" fill="#E53935"/>`)}</div></div>`;
      const fg = bar(`${sid}1`, { y: 150, text: H(o.judul || "Surat Terbuka"), fs: 150, color: "#B3261E", r: -2 }) + bar(`${sid}2`, { y: 400, text: `untuk: ${H(o.untuk)}`, fs: fsMuat("untuk: " + tx(o.untuk).teks, 880, 84, 56, 0.42) }) +
        bar(`${sid}3`, { y: 520, text: `dari: ${H(o.dari)}`, fs: fsMuat("dari: " + tx(o.dari).teks, 880, 84, 56, 0.42) }) + hati + (o.maskot ? V.gambar(`${sid}x`, o.maskot, { x: 540 - V.lebar(o.maskot, 640) / 2, y: 700, h: 640 }) : "");
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}c2" style="transform-origin:540px 600px">${fg}</div>`, { enter: c.bi > 0 });
      V.K(`tl.fromTo("#${sid}c2", {scale:1.3, y:160}, {scale:1, y:0, duration:1.2, ease:"power2.out"}, ${f2(s)});`);
      V.tulis(`#${sid}1`, s + 0.15, 0.8);
      const t2 = Math.max(s + 0.9, T(V, c, { teks: "untuk" }, 0, 2) - 0.05); V.tulis(`#${sid}2`, t2, 0.7); V.stick(`#${sid}h`, t2 + 0.6, "{dr:30}", "pop");
      V.tulis(`#${sid}3`, Math.max(t2 + 0.8, T(V, c, { teks: "dari" }, 1, 2) - 0.05), 0.9);
      if (o.maskot) { V.muncul(`#${sid}x`, s + 0.3, { y0: 260, bunyi: "boing" }); V.goyang(`#${sid}x`, s + 0.9, d - 1.0, { rot: 3, per: 0.35 }); }
    },
  },
  surat: {
    konsep: ["K6"],
    ket: "K6 isi surat: 1-3 baris tulisan tangan muncul per baris mengikuti VO + opsional angka menghitung besar + maskot/foto/prop + stempel.",
    kolom: { baris: "daftar<=3:teks<=26!", angka: "angka", gambar: "aset", pose: "pose", wajah: "wajah[]<=2", stempel: "teks<=12", tokoh: "teks<=40", suasana: "pilih:masalah|solusi" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, bs = [].concat(o.baris).map(tx).slice(0, 3); V.font.add("Caveat");
      const bar = (id, { y, text, fs, color = TINTA, r = -1, x = 160 }) => `<div class="tx" id="${id}" style="position:absolute;left:${x}px;top:${y}px;width:880px;font:600 ${fs}px/1.05 'Caveat';color:${color};transform:rotate(${r}deg);white-space:nowrap;clip-path:inset(0 100% 0 0)">${text}</div>`;
      let fg = bs.map((b, k) => bar(`${sid}b${k}`, { y: 150 + k * 120 + (o.angka != null && k ? 330 : 0), text: esc(b.teks), fs: fsMuat(b.teks, 880, 88, 56, 0.42), color: k === bs.length - 1 && bs.length > 1 ? "#B3261E" : TINTA, r: k % 2 ? 1 : -1 })).join("");
      if (o.angka != null) fg += `<div class="it" id="${sid}n0" data-r="-4" style="left:120px;top:290px;width:840px;height:300px"><div id="${sid}n" class="tx" style="position:absolute;left:0;right:0;top:0;text-align:center;font:700 270px/1 'Caveat';color:#B3261E">0</div></div>`;
      if (o.stempel) fg += V.stempel(`${sid}s`, { x: 560, y: 760, text: H(o.stempel), r: 8, fs: 80, color: o.suasana === "solusi" ? V.aksen : "#C62828" });
      let mid = "";
      if (o.gambar) mid = V.gambar(`${sid}x`, o.gambar, { x: 540 - V.lebar(o.gambar, 640) / 2, y: 820, h: 640 });
      else if (o.pose) { const tk = tokoh(V, c, {}); mid = V.orang(`${sid}x`, tk.pose, tk.wajah, { x: 540 - V.lebar(tk.pose, 700) / 2, y: 800, h: 700 }); }
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${mid}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0 }, { scale: 1.04 }]]);
      bs.forEach((b, k) => V.tulis(`#${sid}b${k}`, k === 0 ? Math.min(s + 0.15, T(V, c, b, 0, bs.length)) : T(V, c, b, k, bs.length), Math.min(1.0, 0.25 + b.teks.length * 0.035)));
      if (o.angka != null) { const ta = T(V, c, { teks: "" }, 1, 3); V.stick(`#${sid}n0`, ta - 0.1, "{dr:-10}", null); V.hitung(`#${sid}n`, ta, 0, o.angka, 1.0); V.sfx(ta, "tik", 0.7); }
      if (mid) { V.muncul(`#${sid}x`, s + 0.3, { y0: 240, bunyi: "boing" }); V.goyang(`#${sid}x`, s + 0.9, d - 1, { rot: 3, per: 0.45 }); }
      if (o.stempel) V.hantam(`#${sid}s`, Math.max(T(V, c, o.stempel, 1, 2), s + d * 0.5));
    },
  },
  "surat-tutup": {
    konsep: ["K6"],
    ket: "K6 penutup surat: salam + tanda tangan tulisan tangan + maskot pensiun/terharu + stempel (PENSIUN / TERIMA KASIH) + hati.",
    kolom: { salam: "teks<=22", ttd: "teks<=22!", maskot: "aset", stempel: "teks<=14" },
    bangun(V, c) {
      const o = c.o, sid = c.sid; V.font.add("Caveat");
      const bar = (id, { y, text, fs, color = TINTA, r = -1, x = 160 }) => `<div class="tx" id="${id}" style="position:absolute;left:${x}px;top:${y}px;width:880px;font:600 ${fs}px/1.05 'Caveat';color:${color};transform:rotate(${r}deg);white-space:nowrap;clip-path:inset(0 100% 0 0)">${text}</div>`;
      const fg = bar(`${sid}1`, { y: 180, text: H(o.salam || "Salam sayang,"), fs: 90 }) + bar(`${sid}2`, { y: 320, x: 300, text: H(o.ttd), fs: fsMuat(tx(o.ttd).teks, 700, 110, 64, 0.42), color: "#B3261E", r: -4 }) +
        (o.stempel ? V.stempel(`${sid}s`, { x: 560, y: 560, text: H(o.stempel), r: 8, fs: 80, color: V.aksen }) : "") +
        [[140, 600, "#E53935"], [880, 760, "#FFB300"]].map(([x, y, w], k) => V.bintang(`${sid}x${k}`, x, y, 80, w, k * 20)).join("");
      const mid = o.maskot ? V.gambar(`${sid}m0`, o.maskot, { x: 540 - V.lebar(o.maskot, 720) / 2, y: 760, h: 720 }) : "";
      const { s, d } = V.scene(c, L(V, c, { suasana: "solusi" }) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${mid}</div>`);
      V.tulis(`#${sid}1`, s + 0.15, 0.6); V.tulis(`#${sid}2`, Math.max(s + 0.8, T(V, c, o.ttd, 0, 2)), 0.8);
      if (mid) { V.muncul(`#${sid}m0`, s + 0.3, { y0: 260, bunyi: null }); V.lompat(`#${sid}m0`, s + 1.0, 3); }
      const ts = Math.max(s + 1.2, T(V, c, o.stempel, 1, 2));
      if (o.stempel) V.hantam(`#${sid}s`, ts);
      [0, 1].forEach((k) => V.stick(`#${sid}x${k}`, ts + 0.2 + k * 0.12, `{dr:${k ? -50 : 50}, dur:0.4}`, k ? null : "sparkle"));
    },
  },

  // ================= K7 =================
  "tutorial-hook": {
    konsep: ["K7"],
    ket: "K7 pembuka: label ▶ TUTORIAL + kartu judul besar 'CARA BIKIN ... ' + kata kunci raksasa (KACAU) + pil 'N LANGKAH' + tokoh ceria.",
    kolom: { judul: "teks<=24!", kunci: "teks<=10!", jumlah: "angka!", pose: "pose", wajah: "wajah[]<=1" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, tk = tokoh(V, c, { pose: o.pose ?? "presentasi", wajah: o.wajah ?? ["senang"] }), jd = tx(o.judul).teks, ku = tx(o.kunci).teks;
      const fg = box(V, `${sid}y`, { x: 70, y: 150, w: 300, h: 90, r: -4, bg: "#FF3B30", rad: 20, inner: teks("▶ TUTORIAL", `left:0;right:0;top:24px;text-align:center;font:900 44px/1 'Spartan';color:#fff`) }) +
        box(V, `${sid}j`, { x: 60, y: 290, w: 960, h: 470, r: -2, bg: "#fff", rad: 34, inner:
          teks(esc(jd).toUpperCase(), `left:20px;right:20px;top:46px;text-align:center;font:900 ${fsMuat(jd, 1800, 110, 64, 0.62)}px/1.02 'Spartan';color:${INK}`) +
          `<div id="${sid}k" style="position:absolute;left:0;right:0;top:290px;text-align:center;font:900 ${Math.min(150, Math.floor(900 / (ku.length * 0.72)))}px/1 'Spartan';color:#FF4D8D;-webkit-text-stroke:7px ${INK};paint-order:stroke;letter-spacing:6px">${esc(ku).toUpperCase()}</div>` }) +
        box(V, `${sid}n`, { x: 690, y: 700, w: 300, h: 140, r: 8, bg: "#3B82F6", rad: 70, inner: teks(`${o.jumlah} LANGKAH`, `left:0;right:0;top:44px;text-align:center;font:900 50px/1 'Spartan';color:#fff`) }) +
        V.bintang(`${sid}s1`, 80, 790, 110, "#FF4D8D", 12) + V.bintang(`${sid}s2`, 900, 160, 90, "#3B82F6", -16);
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${V.orang(`${sid}t`, tk.pose, tk.wajah, { x: 540 - V.lebar(tk.pose, 780) / 2, y: 860, h: 780 })}</div>`, { enter: c.bi > 0 });
      V.K(`tl.fromTo("#${sid}w", {scale:1.15}, {scale:1, duration:0.6, ease:"power2.out"}, ${f2(s)});`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0 }, { scale: 1.04 }], [`#${sid}m`, { x: 0 }, { x: -20 }]]);
      V.stick(`#${sid}y`, s + 0.05, "{dr:-20}", "pop"); V.stick(`#${sid}j`, s + 0.2, "{s0:0.3, dr:8, dur:0.45}", null);
      const tk2 = Math.min(T(V, c, o.kunci, 0, 3), s + 0.6);
      V.K(`tl.fromTo("#${sid}k", {scale:0.2, opacity:0}, {scale:1, opacity:1, duration:0.4, ease:K.st("back.out(2.4)",0.4)}, ${f2(tk2)});`); V.sfx(tk2, "boing", 0.9);
      V.muncul(`#${sid}t`, s + 0.3, { y0: 260 }); V.napas(`#${sid}t`, s + 0.8, d - 1.2);
      const tn = T(V, c, { teks: "langkah" }, 1, 3);
      V.stick(`#${sid}n`, tn, "{dr:20}", "ding");
      V.stick(`#${sid}s1`, tn + 0.2, "{dr:50, dur:0.4}", null); V.stick(`#${sid}s2`, tn + 0.35, "{dr:-50, dur:0.4}", null);
    },
  },
  langkah: {
    konsep: ["K7"],
    ket: "K7 langkah: progres N segmen + lingkaran nomor besar + kartu judul langkah + prop + tokoh ceria (ironis) + gelembung + cap BERHASIL ✓. bonus:true = langkah bonus (solusi: logo + cap hijau).",
    kolom: { no: "angka!", total: "angka", judul: "teks<=34!", prop: "aset", pose: "pose", wajah: "wajah[]<=2", ganti: "teks<=20", bubble: "teks<=16", cap: "teks<=14", bonus: "bool", tokoh: "teks<=40" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, n = o.no, tot = o.total || Math.max(n, V.adegan.filter((a) => a.primitif === "langkah" && !a.opsi?.bonus).length);
      const aksen = ["#FF4D8D", "#3B82F6", "#12A150", "#FF8A00", "#8B5CF6", "#E11D48"][(n - 1) % 6], jd = tx(o.judul).teks;
      const seg = Array.from({ length: tot }, (_, k) => `<div style="flex:1;height:30px;border:5px solid ${INK};border-radius:15px;background:${o.bonus || k < n - 1 ? aksen : "#fff"};overflow:hidden;position:relative">${!o.bonus && k === n - 1 ? `<div id="${sid}fill" style="position:absolute;inset:0;background:${aksen};transform-origin:0 50%"></div>` : ""}</div>`).join("");
      let fg = `<div style="position:absolute;left:60px;top:70px;width:960px;display:flex;gap:14px">${seg}</div>` +
        box(V, `${sid}no`, { x: 50, y: 175, w: 280, h: 280, r: -6, bg: o.bonus ? V.aksen : aksen, rad: 140, inner: teks(o.bonus ? "BONUS" : "LANGKAH", `left:0;right:0;top:48px;text-align:center;font:900 34px/1 'Spartan';color:#fff;letter-spacing:2px`) + teks(o.bonus ? "★" : String(n), `left:0;right:0;top:86px;text-align:center;font:900 170px/1 'Spartan';color:#fff;-webkit-text-stroke:6px ${INK};paint-order:stroke`) }) +
        box(V, `${sid}jd`, { x: 360, y: 200, w: 670, h: 240, r: 2, bg: "#fff", rad: 24, inner: teks(esc(jd), `left:28px;right:28px;top:50%;transform:translateY(-50%);text-align:center;font:900 ${fsMuat(jd, 1150, 70, 42, 0.6)}px/1.06 'Spartan';color:${INK}`) });
      const tk = tokoh(V, c, { pose: o.pose, wajah: o.wajah ?? (o.bonus ? ["senang"] : ["senang", "kaget"]) });
      const kiriProp = !!o.prop;
      let mid = (o.prop ? V.gambar(`${sid}p`, o.prop, { x: 60, y: 760, h: 620 }) : "") + (o.bonus ? V.logo(`${sid}l`, { x: 90, y: 520, w: 560, h: 220, r: -3 }) : "");
      const T1 = pasangTokoh(V, c, `${sid}t`, tk, { x: kiriProp || o.bonus ? 1040 - V.lebar(tk.pose, 820) : 540 - V.lebar(tk.pose, 820) / 2, y: 700, h: 820, t0: c.s + 0.35, d: c.d, ganti: o.ganti });
      let fg2 = (o.bubble ? V.bubble(`${sid}b`, { x: 560, y: 520, w: 460, h: 160, text: H(o.bubble), fs: fsMuat(tx(o.bubble).teks, 760, 60, 40), r: 6, tail: "right", color: "#FF4D8D" }) : "") +
        (o.cap !== "" ? V.stempel(`${sid}c`, { x: 90, y: 1230, text: H(o.cap || (o.bonus ? "BENAR ✓" : "BERHASIL ✓")), r: -10, fs: 70, color: o.bonus ? V.aksen : "#12A150" }) : "");
      const { s, d } = V.scene(c, L(V, c, { suasana: o.bonus ? "solusi" : undefined }) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${mid}${T1.html}</div><div class="lay" id="${sid}f2">${fg2}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.04 }]]);
      if (!o.bonus) V.K(`tl.fromTo("#${sid}fill", {scaleX:0}, {scaleX:1, duration:0.5, ease:"power2.out"}, ${f2(s + 0.1)});`);
      V.stick(`#${sid}no`, s + 0.05, `{s0:0.2, dr:-30, dur:0.45}`, "pop"); V.stick(`#${sid}jd`, s + 0.25, `{dr:10, x0:200}`, null); V.sfx(s + 0.25, "whoosh", 0.4);
      if (o.prop) V.muncul(`#${sid}p`, Math.min(s + d * 0.4, T(V, c, { teks: jd }, 0, 3)), { y0: 220, bunyi: "thud" });
      if (o.bonus) V.stick(`#${sid}l`, T(V, c, { teks: V.profil.cue }, 0, 3), "{dr:-10}", "ding");
      T1.anim();
      if (o.bubble) V.stick(`#${sid}b`, T(V, c, o.bubble, 1, 3), "{dr:-14}");
      if (o.cap !== "") V.hantam(`#${sid}c`, Math.max(s + d * 0.45, T(V, c, o.cap, 2, 3) + 0.25));
    },
  },

  // ================= K8 =================
  horor: {
    konsep: ["K8"],
    ket: "K8: adegan gelap bergaya CCTV: lampu berkedip, teks menegangkan muncul satu per satu (huruf merah), objek/tokoh dalam remang + getaran.",
    kolom: { teks: "daftar<=2:teks<=18!", gambar: "aset", pose: "pose", wajah: "wajah[]<=2", ganti: "teks<=20", tokoh: "teks<=40", latar: "aset" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, ts = [].concat(o.teks).map(tx).slice(0, 2);
      let mid = "";
      let T1 = null;
      if (o.gambar) mid = V.gambar(`${sid}x`, o.gambar, { x: 540 - V.lebar(o.gambar, 760) / 2, y: 640, h: 760 });
      else { const tk = tokoh(V, c, { pose: o.pose ?? "panik", wajah: o.wajah ?? ["takut", "panik"] }); T1 = pasangTokoh(V, c, `${sid}x`, tk, { x: 540 - V.lebar(tk.pose, 860) / 2, y: 560, h: 860, t0: c.s + 0.3, d: c.d, ganti: o.ganti, napas: { amp: 0.02, rot: 3, per: 0.25 } }); mid = T1.html; }
      const fg = ts.map((t, k) => `<div class="tx" id="${sid}t${k}" style="position:absolute;left:60px;right:60px;top:${200 + k * 170}px;text-align:center;font:900 ${fsMuat(t.teks, 960, 110, 60, 0.6)}px/1 'Spartan';color:${k ? "#FF1744" : "#fff"};text-shadow:0 0 30px rgba(255,23,68,.6),0 6px 0 rgba(0,0,0,.6);opacity:0">${esc(t.teks)}</div>`).join("");
      const latar = o.latar || V.cariTag(["K8"], "latar");
      const { s, d } = V.scene(c, (latar ? V.bgImg(`${sid}bg`, latar, "filter:brightness(.55) saturate(.8)") : L(V, c)) + `<div class="lay" id="${sid}m">${mid}</div><div class="full" id="${sid}gl" style="background:radial-gradient(ellipse at 50% 45%,transparent 35%,rgba(0,0,0,.8))"></div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.08 }]]);
      V.K(`tl.fromTo("#${sid}gl", {opacity:1}, {opacity:0.55, duration:0.07, yoyo:true, repeat:5, ease:"steps(1)"}, ${f2(s + 0.4)});`); V.sfx(s + 0.4, "korslet", 0.5);
      if (T1) T1.anim(); else { V.muncul(`#${sid}x`, s + 0.3, { y0: 120, bunyi: null }); }
      ts.forEach((t, k) => { const tt = T(V, c, t, k, ts.length, 0.2); V.K(`tl.fromTo("#${sid}t${k}", {opacity:0, scale:1.4}, {opacity:1, scale:1, duration:0.25, ease:"power3.out"}, ${f2(tt)});`); V.sfx(tt, k ? "seram" : "tegang", 0.7); if (k) V.geleng(`#${sid}t${k}`, tt + 0.25, 10); });
    },
  },
  kejut: {
    konsep: ["K8"],
    ket: "K8 jump-scare lucu: kilat putih + subjek (kucing/benda) melompat besar + tag lucu ('...cuma kucing') + guncangan kamera.",
    kolom: { subjek: "aset!", teks: "teks<=20!", stempel: "teks<=12" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, h = 1000;
      const { s, d } = V.scene(c, L(V, c, { suasana: "gelap" }) + `<div class="lay" id="${sid}m">${V.gambar(`${sid}x`, o.subjek, { x: 540 - V.lebar(o.subjek, h) / 2, y: 420, h })}</div>` +
        `<div class="lay" id="${sid}f">${V.tag(`${sid}g`, { x: 540, y: 170, text: H(o.teks), color: "#1B2A4A", fs: fsMuat(tx(o.teks).teks, 900, 80, 50), r: -3, hi: true, anchor: "center" })}${o.stempel ? V.stempel(`${sid}s`, { x: 300, y: 1200, text: H(o.stempel), fs: 80, r: -6 }) : ""}</div>`, { enter: false });
      V.K(`tl.fromTo("#${sid}fl", {opacity:1}, {opacity:0, duration:0.4, ease:"power2.out"}, ${f2(s)});`); V.sfx(s, "kaget", 1);
      V.K(`tl.fromTo("#${sid}x", {scale:0.3, y:300, opacity:0}, {scale:1, y:0, opacity:1, duration:0.3, ease:"back.out(2.5)"}, ${f2(s + 0.02)});`);
      V.K(`tl.fromTo("#${sid}cam", {x:0}, {x:22, duration:0.05, yoyo:true, repeat:7, ease:"none"}, ${f2(s + 0.05)});`);
      const tg = Math.max(s + 0.6, T(V, c, o.teks, 0, 2)); V.stick(`#${sid}g`, tg, "{dr:-12}", "boing");
      if (o.stempel) V.hantam(`#${sid}s`, T(V, c, o.stempel, 1, 2));
      V.goyang(`#${sid}x`, s + 0.6, d - 0.8, { rot: 3, per: 0.5 });
    },
  },
};
