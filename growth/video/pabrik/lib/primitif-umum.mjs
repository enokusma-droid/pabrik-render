// Primitif adegan UMUM (dipakai semua konsep; latar ikut tema konsep). Tata letak & gerak = salinan adegan contoh lulus K0 (gaya-cerita).
// Tiap primitif: { ket, kolom (skema opsi, dibaca periksa.mjs), bangun(V, c) }. c = { bi, sid, o: opsi, konsep }.
// Kolom DSL: "teks<=N" (\n = baris baru), "angka", "bool", "aset", "aset[]<=N", "pose", "wajah[]<=N", "pilih:a|b", "daftar<=N:teks<=M" (string atau {teks,kata}); akhiran "!" = wajib.
// Setiap elemen teks boleh diberi waktu muncul lewat kata VO: tulis objek {teks, kata} — tanpa kata, mesin mencari kata teks itu di VO, lalu menyebar otomatis.
import { f2, esc, VW } from "./inti.mjs";

export const tx = (x) => (x == null ? null : typeof x === "object" ? { teks: String(x.teks ?? ""), kata: x.kata } : { teks: String(x) });
export const H = (x) => esc(tx(x)?.teks ?? "");
export const T = (V, c, x, k = 0, n = 1, min) => { const v = tx(x); return V.waktu(c.bi, { kata: v?.kata, teks: v?.teks, k, n, min }); };
export const L = (V, c, o = {}) => V.latar(c, o);

// pose & wajah tokoh: o.tokoh = "utama" (default) | "detektif" | id aset tokoh-pendukung
export function tokoh(V, c, { pose, wajah, def = 0 } = {}) {
  const o = c.o, siapa = o.tokoh && o.tokoh !== "utama" ? o.tokoh : V.utama;
  if (V.katalog[siapa] && V.katalog[siapa].jenis !== "tokoh-badan") return { pose: siapa, wajah: [] }; // pendukung foto potong
  const p = V.pose(pose ?? o.pose, siapa, def + c.bi);
  const w = [].concat(wajah ?? o.wajah ?? []).map((x) => V.wajah(x, siapa)).filter(Boolean);
  if (!w.length && V.katalog[p]?.kepala) w.push(V.wajah("senang", siapa) || V.wajah(null, siapa));
  return { pose: p, wajah: w.filter(Boolean) };
}
// tempel tokoh (badan + wajah), animasi masuk + napas + ganti wajah di kata `o.ganti`
export function pasangTokoh(V, c, id, tk, { x, y, h, flip = false, t0, d, ganti, napas = {} }) {
  const html = V.orang(id, tk.pose, tk.wajah, { x, y, h, flip });
  const anim = () => {
    V.muncul(`#${id}`, t0, { y0: 220, bunyi: null }); V.napas(`#${id}`, t0 + 0.5, d - (t0 - c.s) - 0.6, napas);
    if (tk.wajah.length > 1) {
      const tg = ganti ? V.waktu(c.bi, { kata: ganti }) : V.waktu(c.bi, { k: 1, n: 2 });
      V.goyang(`#${id}f0`, t0 + 0.5, tg - t0 - 0.6, { rot: 3 }); V.gantiMuka(id, 1, tg - 0.1, tk.wajah.length);
    } else if (tk.wajah.length) V.goyang(`#${id}f0`, t0 + 0.5, Math.min(2, d - 1), { rot: 3 });
  };
  return { html, anim };
}

export const UMUM = {
  tokoh: {
    ket: "Tokoh (badan kartun + wajah foto) di satu sisi + tempelan: judul (tag nama), sub, gelembung, stempel, prop, bintang. Adegan serbaguna (kenalan, keluhan, reaksi).",
    kolom: { pose: "pose", wajah: "wajah[]<=3", ganti: "teks<=20", sisi: "pilih:kanan|kiri", judul: "teks<=20", sub: "teks<=28", bubble: "teks<=16", stempel: "teks<=14", prop: "aset", bintang: "bool", tokoh: "teks<=40", latar: "aset", suasana: "pilih:masalah|solusi|malam|gelap|hangat" },
    bangun(V, c) {
      const o = c.o, kanan = o.sisi !== "kiri", sid = c.sid, tk = tokoh(V, c);
      const h = 960, w = V.lebar(tk.pose, h), tx0 = kanan ? Math.min(560, 1040 - w) : Math.max(20, 40);
      const cx = kanan ? 60 : Math.max(tx0 + w - 40, 520), anc = kanan ? "left" : "left";
      let fg = "";
      if (o.judul) fg += V.tag(`${sid}j`, { x: cx, y: 170, text: H(o.judul), c: "navy", color: "#fff", fs: 74, r: -3, hi: true, anchor: anc });
      if (o.sub) fg += V.tag(`${sid}u`, { x: cx + 30, y: 320, text: H(o.sub), fs: 48, r: 2, anchor: anc });
      if (o.bubble) fg += V.bubble(`${sid}b`, { x: kanan ? 40 : VW - 440, y: 560, w: 400, h: 160, text: H(o.bubble), r: -8, fs: Math.min(66, Math.round(640 / Math.max(6, tx(o.bubble).teks.length))), color: "#C62828", tail: kanan ? "right" : "left" });
      if (o.stempel) fg += V.stempel(`${sid}s`, { x: kanan ? 70 : 560, y: 800, text: H(o.stempel), color: o.suasana === "solusi" ? V.aksen : "#C62828", fs: 80, r: -10 });
      if (o.bintang) fg += V.bintang(`${sid}x1`, kanan ? 880 : 120, 470, 90, "#FFB300", 12) + V.bintang(`${sid}x2`, kanan ? 470 : 560, 560, 64, "#FFB300", -16);
      const mid = (o.prop ? V.gambar(`${sid}p`, o.prop, { x: kanan ? 40 : VW - 40 - V.lebar(o.prop, 500), y: 980, h: 500 }) : "") ;
      const T1 = pasangTokoh(V, c, `${sid}t`, tk, { x: tx0, y: 520, h, flip: !kanan && false, t0: c.s + 0.15, d: c.d, ganti: o.ganti });
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}m">${mid}${T1.html}</div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { x: 20 }, { x: -30 }], [`#${sid}f`, { x: 0 }, { x: -40 }]]);
      T1.anim();
      const el = [["j", o.judul], ["u", o.sub], ["b", o.bubble], ["p", o.prop && { teks: "" }], ["s", o.stempel]].filter((x) => x[1]);
      el.forEach(([k, v], i) => {
        const t = k === "j" ? s + 0.3 : T(V, c, v, i, el.length, 0.3);
        if (k === "s") V.hantam(`#${sid}s`, t); else if (k === "p") V.muncul(`#${sid}p`, t, { y0: 200 }); else V.stick(`#${sid}${k}`, t, `{dr:${i % 2 ? 10 : -12}}`, k === "b" ? "boing" : "pop");
      });
      if (o.bintang) { const tb = T(V, c, o.judul || o.stempel, 0, 1); V.stick(`#${sid}x1`, tb, "{dr:50, dur:0.4}", "sparkle"); V.stick(`#${sid}x2`, tb + 0.15, "{dr:-50, dur:0.4}", null); }
    },
  },

  meter: {
    ket: "Meme meter: 1-2 bar persen (mis. SKILL MERAWAT 100%, SKILL ADMINISTRASI anjlok) + tokoh bingung + tanda tanya.",
    kolom: { meter: "meter!", pose: "pose", wajah: "wajah[]<=2", ganti: "teks<=20", tanya: "bool", tokoh: "teks<=40", suasana: "pilih:masalah|solusi|malam" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, tk = tokoh(V, c, { pose: o.pose ?? "presentasi", wajah: o.wajah ?? ["senang", "kaget"] });
      const ms = [].concat(o.meter).slice(0, 2);
      let fg = ms.map((m, k) => V.meter(`${sid}m${k}`, { x: 150, y: 190 + k * 300, judul: esc(m.judul), r: k ? 1.5 : -2, nilai: m.dari ?? 100, warna: (m.ke ?? 0) > (m.dari ?? 100) ? "#E0A800" : "#2E9E4F" })).join("");
      if (o.tanya !== false) fg += V.bubble(`${sid}q`, { x: 90, y: 860, w: 190, h: 170, text: "?", fs: 110, r: -10, color: "#C62828" }) + V.bubble(`${sid}q2`, { x: 790, y: 830, w: 170, h: 160, text: "?", fs: 100, r: 10, color: "#C62828", tail: "right" });
      const T1 = pasangTokoh(V, c, `${sid}t`, tk, { x: 540 - V.lebar(tk.pose, 700) / 2, y: 820, h: 700, t0: c.s + 0.4, d: c.d, ganti: o.ganti || ms.at(-1)?.kata });
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${T1.html}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0 }, { scale: 1.04 }], [`#${sid}m`, { x: 0 }, { x: -20 }]]);
      T1.anim();
      let tAkhir = s;
      ms.forEach((m, k) => {
        const t0 = k === 0 ? s + 0.25 : T(V, c, { teks: m.judul, kata: m.kata_judul }, k, ms.length + 1);
        V.stick(`#${sid}m${k}`, t0, `{dr:${k ? 10 : -10}}`);
        if (m.ke != null && m.ke !== (m.dari ?? 100)) {
          const t = m.kata ? V.waktu(c.bi, { kata: m.kata }) : Math.max(t0 + 0.7, V.waktu(c.bi, { k: k + 1, n: ms.length + 1 }));
          V.meterKe(`${sid}m${k}`, t, m.dari ?? 100, m.ke, 0.7, m.ke < (m.dari ?? 100) ? "#D32F2F" : "#2E9E4F"); V.sfx(t, m.ke < (m.dari ?? 100) ? "turun" : "sparkle", 0.9);
          tAkhir = Math.max(tAkhir, t);
        }
      });
      if (o.tanya !== false) { V.stick(`#${sid}q`, tAkhir + 0.4, "{dr:-20}"); V.stick(`#${sid}q2`, tAkhir + 0.6, "{dr:20}", null); V.geleng(`#${sid}t`, tAkhir + 0.3, 10); }
    },
  },

  tumpuk: {
    ket: "Benda menumpuk/tumbuh besar (tumpukan berkas, kardus) + tokoh kewalahan + kartu tulisan tangan + tag.",
    kolom: { prop: "aset!", kartu: "teks<=26", tag: "teks<=20", pose: "pose", wajah: "wajah[]<=2", ganti: "teks<=20", tokoh: "teks<=40", latar: "aset", suasana: "pilih:masalah|solusi|malam" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, tk = tokoh(V, c, { pose: o.pose ?? "bawa-berkas", wajah: o.wajah ?? ["kesal"] });
      const T1 = pasangTokoh(V, c, `${sid}t`, tk, { x: 1040 - V.lebar(tk.pose, 900), y: 600, h: 900, t0: c.s + 0.3, d: c.d, ganti: o.ganti, napas: { amp: 0.02, rot: 2.2, per: 0.6 } });
      const dyK = c.konsep === "K1" ? 170 : 0; // 22 Okt (rb-k1-003 "SAMBA..ADA"): kartu jam K1 kanan atas menutup kartu → turun
      const fg = (o.kartu ? V.kartu(`${sid}k`, { x: 470, y: 180 + dyK, w: 540, h: 230, text: H(o.kartu), fs: tx(o.kartu).teks.length > 16 ? 56 : 66, r: 3 }) : "") +
        (o.tag ? V.tag(`${sid}g`, { x: 520, y: 470 + dyK, text: H(o.tag), color: "#C62828", fs: 54, r: -3, hi: true }) : "");
      const { s, d } = V.scene(c, L(V, c, { suasana: o.suasana ?? "masalah", aset: o.latar }) + `<div class="lay" id="${sid}m">${V.gambar(`${sid}p`, o.prop, { x: 70, y: 380, h: 1120 })}${T1.html}</div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0, y: 0 }, { scale: 1.05, y: -20 }], [`#${sid}f`, { x: 0 }, { x: -30 }]]);
      if (o.kartu) V.stick(`#${sid}k`, s + 0.2, "{dr:12}");
      const tp = T(V, c, o.kartu ? { teks: "", kata: o.kata } : null, 0, 2, 0.4);
      V.K(`tl.fromTo("#${sid}p", {scaleY:0.25, opacity:0}, {scaleY:1, opacity:1, duration:1.0, ease:K.st("back.out(1.4)",1.0)}, ${f2(tp)});`); V.sfx(tp, "tumpuk", 0.9);
      T1.anim();
      if (o.tag) V.stick(`#${sid}g`, Math.max(tp + 0.6, T(V, c, o.tag, 1, 2)), "{dr:-14}");
    },
  },

  hitung: {
    ket: "Kartu penghitung besar (CARI BERKAS 00:00 → 15:00, PASIEN 0 → 12, PESANAN 0 → 1.284) + tokoh + kertas beterbangan + gelembung.",
    kolom: { judul: "teks<=16!", dari: "angka", ke: "angka!", format: "pilih:menit|angka|detik|persen", kata: "teks<=20", prop: "aset", terbang: "bool", bubble: "teks<=20", pose: "pose", wajah: "wajah[]<=2", ganti: "teks<=20", tokoh: "teks<=40", latar: "aset", suasana: "pilih:masalah|solusi|malam|gelap" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, tk = tokoh(V, c, { pose: o.pose ?? "presentasi", wajah: o.wajah ?? ["kesal", "lelah"] });
      const fmt = o.format || "angka", awal = fmt === "menit" ? "00:00" : fmt === "detik" ? "00:00" : fmt === "persen" ? `${o.dari ?? 0}%` : String(o.dari ?? 0);
      const T1 = pasangTokoh(V, c, `${sid}t`, tk, { x: 1040 - V.lebar(tk.pose, 820), y: 700, h: 820, t0: c.s + 0.3, d: c.d, ganti: o.ganti, napas: { amp: 0.02, rot: 2.4, per: 0.5 } });
      const warnaN = o.suasana === "solusi" ? V.aksen : "#C62828";
      const kartu = V.P(`${sid}k`, { x: 300, y: 170, w: 480, h: 300, r: -3, c: "white", hi: true, inner: V.T(H(o.judul), "left:0;right:0;top:34px;text-align:center;font:400 46px/1 'Marker';color:#1B2A4A;white-space:nowrap") + `<div id="${sid}n" class="tx" style="position:absolute;left:0;right:0;top:110px;text-align:center;font:900 ${String(o.ke).length > 5 ? 110 : 140}px/1 'Spartan';color:${warnaN}">${awal}</div>` });
      const lem = o.terbang ? [0, 1, 2, 3, 4].map((k) => V.lembar(`${sid}l${k}`, 200 + k * 40, 900, (k - 2) * 14)).join("") : "";
      const bub = o.bubble ? V.bubble(`${sid}b`, { x: 40, y: 560, w: 420, h: 160, text: H(o.bubble), fs: 50, r: -6 }) : "";
      const prop = o.prop ? V.gambar(`${sid}p`, o.prop, { x: 60, y: 900, h: 600 }) : "";
      const { s, d } = V.scene(c, L(V, c, { suasana: o.suasana, aset: o.latar }) + `<div class="lay" id="${sid}m">${prop}${T1.html}</div><div class="lay" id="${sid}f">${kartu}${lem}${bub}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.05 }], [`#${sid}f`, { x: 0 }, { x: -20 }]]);
      if (o.prop) V.muncul(`#${sid}p`, s + 0.15, { y0: 200 });
      T1.anim();
      const tk0 = Math.min(T(V, c, { teks: o.judul, kata: o.kata }, 0, 2), s + d * 0.4);
      V.stick(`#${sid}k`, Math.min(tk0, s + 0.4), "{dr:-10}");
      V.hitung(`#${sid}n`, tk0, o.dari ?? 0, o.ke, Math.min(1.4, d * 0.35), fmt); V.sfx(tk0, "tik", 0.8);
      if (o.terbang) V.terbang(`${sid}l`, 5, s + 0.4);
      if (o.bubble) V.stick(`#${sid}b`, T(V, c, o.bubble, 1, 2), "{dr:16}", "boing");
    },
  },

  "kartu-tanya": {
    ket: "Kartu tulisan tangan besar berisi pertanyaan menegangkan + bayangan maskot/benda turun dari atas (jelang twist).",
    kolom: { teks: "teks<=40!", bayangan: "aset", latar: "aset" },
    bangun(V, c) {
      const o = c.o, sid = c.sid;
      const bay = o.bayangan ? V.gambar(`${sid}y`, o.bayangan, { x: 130, y: 120, h: 1150, imgst: "filter:brightness(0) blur(14px);opacity:.55" }) : "";
      const { s, d } = V.scene(c, L(V, c, { aset: o.latar }) + `<div class="lay" id="${sid}y0">${bay}</div><div class="lay" id="${sid}f">${V.kartu(`${sid}k`, { x: 120, y: 760, w: 840, h: 340, text: H(o.teks), fs: tx(o.teks).teks.length > 26 ? 70 : 84, r: -2 })}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0 }, { scale: 1.06 }]]);
      V.stick(`#${sid}k`, s + 0.2, "{dr:-10}");
      if (o.bayangan) V.K(`tl.fromTo("#${sid}y", {y:-700, opacity:0}, {y:-120, opacity:1, duration:${f2(d - 0.4)}, ease:"power1.out"}, ${f2(s + 0.3)});`);
      V.sfx(V.waktu(c.bi, { k: 1, n: 2 }), "tegang", 0.8);
    },
  },

  reveal: {
    ket: "Kemunculan besar dengan ledakan komik: subjek (maskot/benda/tokoh) + tag teriakan + stempel. Untuk twist 'Iya, AKU.' atau pelaku.",
    kolom: { subjek: "aset!", label: "teks<=14", teks: "teks<=14!", stempel: "teks<=16", wajah: "wajah[]<=1", latar: "aset" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, a = V.A(o.subjek), h = 1000, w = V.lebar(o.subjek, h);
      const subj = V.gambar(`${sid}x`, o.subjek, { x: Math.round(540 - w / 2), y: 360, h, label: o.label, wajah: o.wajah ? [V.wajah(o.wajah[0])] : [] });
      const fg = V.tag(`${sid}g`, { x: 540, y: 140, text: H(o.teks), color: "#C62828", fs: 96, r: -4, hi: true, anchor: "center" }) + (o.stempel ? V.stempel(`${sid}s`, { x: 90, y: 1170, text: H(o.stempel), fs: 92, r: -6 }) : "");
      const { s, d } = V.scene(c, L(V, c, { aset: o.latar }) + `<div class="lay" id="${sid}e">${V.ledak(`${sid}L`, { cx: 540, cy: 820, R: 600 })}</div><div class="lay" id="${sid}m">${subj}</div><div class="lay" id="${sid}f">${fg}</div>`, { enter: false });
      V.K(`tl.fromTo("#${sid}w", {scale:1.25, opacity:0}, {scale:1, opacity:1, duration:0.25, ease:"power2.out"}, ${f2(s)});`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.04 }]]);
      const t0 = Math.min(s + 0.35, T(V, c, o.teks, 0, 2));
      V.stick(`#${sid}L`, s + 0.05, `{s0:0.2, dr:-30, dur:0.4, ease:"back.out(2)"}`, "boom");
      V.K(`tl.fromTo("#${sid}L", {rotation:0}, {rotation:12, duration:${f2(d)}, ease:"none"}, ${f2(s + 0.4)});`);
      V.muncul(`#${sid}x`, s + 0.1, { y0: 420, dur: 0.5, bunyi: null }); V.goyang(`#${sid}x`, s + 0.7, d - 0.8, { rot: 3, per: 0.5 });
      V.stick(`#${sid}g`, t0, "{dr:-16}");
      if (o.stempel) V.hantam(`#${sid}s`, T(V, c, o.stempel, 1, 2));
      void a;
    },
  },

  derita: {
    ket: "Maskot/benda menderita: 1-3 kejadian (stempel / tag / kartu) muncul bergantian + guncangan + prop (kopi tumpah, laci).",
    kolom: { maskot: "aset!", label: "teks<=14", item: "daftar<=3:teks<=16", prop: "aset[]<=2", latar: "aset" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, it = [].concat(o.item || []).map(tx);
      const pos = [{ x: 70, y: 220, r: -10 }, { x: 60, y: 990, r: -4 }, { x: 640, y: 560, r: 8 }];
      let fg = "";
      it.forEach((v, k) => {
        const p = pos[k]; const gaya = v.gaya || ["stempel", "tag", "kartu"][k % 3];
        if (gaya === "stempel") fg += V.stempel(`${sid}i${k}`, { x: p.x, y: p.y, text: esc(v.teks), r: p.r, fs: v.teks.length > 12 ? 56 : 70 });
        else if (gaya === "tag") fg += V.tag(`${sid}i${k}`, { x: p.x, y: p.y, text: esc(v.teks), fs: 46, r: p.r });
        else fg += V.kartu(`${sid}i${k}`, { x: p.x, y: p.y, w: 380, h: 190, text: esc(v.teks), fs: v.teks.length > 10 ? 50 : 66, r: p.r, color: "#C62828" });
      });
      const props = [].concat(o.prop || []).slice(0, 2);
      fg += props.map((p, k) => V.gambar(`${sid}p${k}`, p, { x: k ? 720 : 40, y: k ? 1000 : 640, h: 330 })).join("");
      const { s, d } = V.scene(c, L(V, c, { aset: o.latar }) + `<div class="lay" id="${sid}m">${V.maskot(`${sid}x`, o.maskot, { x: 280, y: 480, h: 980, label: o.label })}</div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.04 }]]);
      V.muncul(`#${sid}x`, s + 0.1, { y0: 200, bunyi: null }); V.goyang(`#${sid}x`, s + 0.6, d - 0.6, { rot: 3, per: 0.6 });
      it.forEach((v, k) => {
        const t = T(V, c, v, k, it.length, 0.3), g = v.gaya || ["stempel", "tag", "kartu"][k % 3];
        if (g === "stempel") V.hantam(`#${sid}i${k}`, t); else V.stick(`#${sid}i${k}`, t, `{dr:${k % 2 ? 14 : -12}}`, g === "kartu" ? "sobek" : "pop");
        V.geleng(`#${sid}x`, t, 14);
      });
      props.forEach((p, k) => { const t = T(V, c, null, k, props.length + 1, 0.4); V.K(`tl.fromTo("#${sid}p${k}", {x:${k ? 400 : -400}, y:-300, rotation:${k ? 60 : -60}, opacity:0}, {x:0, y:0, rotation:0, opacity:1, duration:0.4, ease:K.st("power3.out",0.4)}, ${f2(t)});`); V.sfx(t, k ? "thud" : "byur", 0.8); });
    },
  },

  poster: {
    ket: "Poster DICARI / pengumuman kertas tua berisi gambar + stempel besar (mis. 3 HARI) + tag temuan.",
    kolom: { judul: "teks<=10", gambar: "aset!", label: "teks<=14", keterangan: "teks<=22", stempel: "teks<=10", tag: "teks<=26", latar: "aset" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, g = V.A(o.gambar), gh = 440, gw = Math.min(460, V.lebar(o.gambar, gh));
      const dy = c.konsep === "K1" ? 170 : 0; // 22 Okt: K1 punya kartu jam kanan atas → poster turun agar judul tidak tertutup (dc-k1-032 "TERTID")
      const pos = V.P(`${sid}k`, { x: 250, y: 160 + dy, w: 580, h: 760, r: -3, c: "", hi: true, ppst: "background:#F4E4C1", inner: V.T(H(o.judul || "DICARI"), "left:0;right:0;top:40px;text-align:center;font:900 110px/1 'SerifB';color:#3E2A14") +
        `<img src="${V.src(o.gambar)}" style="position:absolute;left:${Math.round(290 - gw / 2)}px;top:180px;height:${gh}px;max-width:460px;object-fit:contain">` + (o.keterangan ? V.T(H(o.keterangan), "left:0;right:0;top:650px;text-align:center;font:400 46px/1 'Marker';color:#3E2A14;white-space:nowrap") : "") });
      const fg = pos + (o.stempel ? V.stempel(`${sid}s`, { x: 300, y: 640 + dy, text: H(o.stempel), r: -14, fs: 96 }) : "") + (o.tag ? V.tag(`${sid}g`, { x: 540, y: 1060 + dy, text: H(o.tag), color: V.aksen, fs: 50, r: -3, hi: true, anchor: "center" }) : "");
      const { s, d } = V.scene(c, L(V, c, { aset: o.latar }) + `<div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { y: 0, scale: 1 }, { y: -40, scale: 1.04 }]]);
      V.stick(`#${sid}k`, s + 0.2, "{dr:-10}", "kertas");
      if (o.stempel) V.hantam(`#${sid}s`, T(V, c, o.stempel, 0, 2));
      if (o.tag) V.stick(`#${sid}g`, T(V, c, o.tag, 1, 2), "{dr:12}", "boing");
      void g;
    },
  },

  logo: {
    ket: "Titik balik: logo produk + stempel (PINDAH!/AKHIRNYA) + maskot/tokoh melompat senang. Pembuka solusi.",
    kolom: { stempel: "teks<=12", kiri: "aset", label: "teks<=14", pose: "pose", wajah: "wajah[]<=1", kata: "teks<=20", tokoh: "teks<=40" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, tk = tokoh(V, c, { pose: o.pose ?? "sorak", wajah: o.wajah ?? ["senang"] });
      const mid = (o.kiri ? V.gambar(`${sid}k`, o.kiri, { x: 50, y: 830, h: 680, label: o.label }) : "") + V.orang(`${sid}t`, tk.pose, tk.wajah, { x: o.kiri ? 600 : 540 - V.lebar(tk.pose, 820) / 2, y: 680, h: 820 });
      const fg = V.logo(`${sid}l`, { x: 140, y: 230, w: 800, h: 300 }) + (o.stempel ? V.stempel(`${sid}s`, { x: 610, y: 520, text: H(o.stempel), r: 10, fs: 84, color: V.aksen }) : "");
      const { s, d } = V.scene(c, L(V, c, { suasana: "solusi" }) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${mid}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0 }, { scale: 1.04 }], [`#${sid}m`, { x: 0 }, { x: -20 }]]);
      const tl0 = Math.min(T(V, c, { teks: V.profil.cue, kata: o.kata }, 0, 2), s + d * 0.5);
      if (o.kiri) { V.muncul(`#${sid}k`, s + 0.1, { y0: 200, bunyi: null }); V.geleng(`#${sid}k`, s + 0.6, 10); }
      V.muncul(`#${sid}t`, s + 0.3, { y0: 260 }); V.lompat(`#${sid}t`, s + 0.85, 5);
      V.stick(`#${sid}l`, tl0 - 0.1, "{dr:-10}", "ding"); if (o.stempel) V.hantam(`#${sid}s`, tl0 + 0.5);
      V.sfx(s + 0.3, "kaget", 0.6);
    },
  },

  layar: {
    ket: "Solusi: layar aplikasi ASLI. DentalCare = 1-3 screenshot UI (aset ui) berbingkai; Nusawebsite = layar aplikasi HTML (app: judul, baris [nama, ket, status]). + stempel RAPI ✓.",
    kolom: { layar: "layar[]<=3", app: "app", stempel: "teks<=12", pose: "pose", wajah: "wajah[]<=1", tokoh: "teks<=40" },
    bangun(V, c) {
      const o = c.o, sid = c.sid;
      let fg = "", el = [];
      if (o.app) {
        const rows = [].concat(o.app.baris || []).slice(0, 4).map((r) => [].concat(r).map(esc));
        fg += V.layarApp(`${sid}a`, { x: 90, y: 300, w: 900, h: Math.min(940, 190 + rows.length * 190), r: -1.5, judul: esc(o.app.judul || "Pesanan Masuk"), lencana: esc(o.app.lencana || ""), baris: rows });
        el.push(`#${sid}a`); rows.forEach((_, k) => el.push(`#${sid}ar${k}`));
      } else {
        const ls = [].concat(o.layar || []).slice(0, 3); const n = ls.length;
        ls.forEach((l, k) => { const y = n === 1 ? 330 : n === 2 ? 200 + k * 520 : 170 + k * 390; fg += V.layarUI(`${sid}l${k}`, l.ui, { x: 100, y, w: 880, h: n === 1 ? 760 : 600, r: k % 2 ? 2.5 : -3, judul: esc(l.judul || ""), warna: V.aksen, top: l.geser ?? -60 }); el.push(`#${sid}l${k}`); });
      }
      if (o.stempel) fg += V.stempel(`${sid}s`, { x: 560, y: 60, text: H(o.stempel), r: 8, fs: 84, color: V.aksen });
      let mid = "";
      if (o.pose) { const tk = tokoh(V, c, { pose: o.pose, wajah: o.wajah ?? ["senang"] }); mid = V.orang(`${sid}t`, tk.pose, tk.wajah, { x: 700, y: 1060, h: 560 }); }
      const { s, d } = V.scene(c, L(V, c, { suasana: "solusi" }) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${mid}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0, y: 0 }, { scale: 1.04, y: -20 }]]);
      if (o.app) {
        V.stick(el[0], s + 0.15, "{dr:-8, y0:200}", "kertas");
        el.slice(1).forEach((e, k) => V.stick(e, T(V, c, o.app.baris?.[k]?.[0], k, el.length - 1, 0.5), "{dr:-6, s0:0.6, dur:0.3}", "ding"));
      } else {
        el.forEach((e, k) => V.stick(e, k === 0 ? Math.min(s + 0.25, T(V, c, o.layar[k]?.judul, k, el.length)) : T(V, c, o.layar[k]?.judul, k, el.length), `{dr:${k % 2 ? 12 : -12}, y0:200}`, "kertas"));
      }
      if (mid) V.muncul(`#${sid}t`, s + 0.5, { y0: 200, bunyi: null });
      if (o.stempel) V.hantam(`#${sid}s`, Math.max(T(V, c, o.stempel, 1, 2), s + d * 0.55));
    },
  },

  daftar: {
    ket: "Daftar/checklist 2-4 baris (jadwal tersusun, notifikasi rapi, hasil) muncul satu per satu dengan ✓ + stempel + tokoh kecil.",
    kolom: { judul: "teks<=22!", item: "daftar<=4:teks<=26!", stempel: "teks<=14", pose: "pose", wajah: "wajah[]<=1", tokoh: "teks<=40", suasana: "pilih:masalah|solusi" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, it = [].concat(o.item).map(tx).slice(0, 4), sol = (o.suasana ?? "solusi") === "solusi", w = sol ? V.aksen : "#C62828";
      let fg = V.P(`${sid}k`, { x: 100, y: 300, w: 880, h: 200 + it.length * 125, r: 2, c: "white", hi: true, rad: 18, inner: `<div style="position:absolute;left:18px;top:18px;right:18px;height:70px;background:${w};border-radius:10px 10px 0 0"></div>` + V.T(H(o.judul), "left:44px;top:34px;font:900 42px/1 'Spartan';color:#fff;white-space:nowrap") });
      fg += it.map((v, k) => V.P(`${sid}r${k}`, { x: 150, y: 430 + k * 125, w: 780, h: 100, r: 0, c: "", ppst: sol ? "background:#F0FAF8" : "background:#FFF3F0", rad: 12, inner: V.T(esc(v.teks), `left:30px;top:30px;font:700 42px/1 'InterL';color:#1B2A4A;white-space:nowrap`) + V.T(sol ? "✓" : "✗", `left:690px;top:20px;font:900 60px/1 'Spartan';color:${w}`) })).join("");
      // 22 Okt (rb-k5-002 "KASUS DITU"): stempel panjang keluar tepi kanan → huruf mengecil + geser kiri
      const nS = tx(o.stempel)?.teks.length || 0, fsS = nS <= 8 ? 90 : nS <= 11 ? 74 : 62, xS = nS <= 8 ? 520 : nS <= 11 ? 420 : 330;
      if (o.stempel) fg += V.stempel(`${sid}s`, { x: xS, y: 470 + it.length * 125, text: H(o.stempel), r: 8, fs: fsS, color: w });
      const tk = tokoh(V, c, { pose: o.pose ?? (sol ? "sorak" : "bingung"), wajah: o.wajah ?? [sol ? "senang" : "kesal"] });
      const { s, d } = V.scene(c, L(V, c, { suasana: sol ? "solusi" : "masalah" }) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${V.orang(`${sid}t`, tk.pose, tk.wajah, { x: 90, y: 980, h: 560 })}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0 }, { scale: 1.03 }]]);
      V.stick(`#${sid}k`, s + 0.1, "{dr:8}");
      it.forEach((v, k) => V.stick(`#${sid}r${k}`, T(V, c, v, k, it.length, 0.35), "{dr:0, s0:0.6, dur:0.3}", k % 2 ? "tik" : "ding"));
      V.muncul(`#${sid}t`, s + 0.4, { y0: 200, bunyi: null });
      if (o.stempel) V.hantam(`#${sid}s`, Math.max(T(V, c, o.stempel, 1, 2), V.waktu(c.bi, { k: 1, n: 1 })));
    },
  },

  bentrok: {
    ket: "Dua kartu (jadwal/pesanan) meluncur dari kiri-kanan lalu bertabrakan + stempel BENTROK + tokoh kaget.",
    kolom: { kiri: "pasangan!", kanan: "pasangan!", stempel: "teks<=12", pose: "pose", wajah: "wajah[]<=2", ganti: "teks<=20", tokoh: "teks<=40" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, tk = tokoh(V, c, { pose: o.pose ?? "bawa-berkas", wajah: o.wajah ?? ["kesal", "kaget"] });
      const kart = (id, x, y, r, [a, b]) => V.P(id, { x, y, w: 600, h: 190, r, c: "white", hi: true, inner: `<div style="position:absolute;left:0;top:0;bottom:0;width:26px;background:#C62828;border-radius:14px 0 0 14px"></div>` + V.T(esc(a), "left:60px;top:40px;font:900 72px/1 'Spartan';color:#1B2A4A;white-space:nowrap") + V.T(esc(b), "left:290px;top:58px;font:400 54px/1 'Marker';color:#1B2A4A;white-space:nowrap") });
      const fg = kart(`${sid}a`, 60, 360, -3, [].concat(o.kiri)) + kart(`${sid}b`, 420, 520, 3, [].concat(o.kanan)) + (o.stempel ? V.stempel(`${sid}s`, { x: 260, y: 760, text: H(o.stempel), r: -8, fs: 100 }) : "");
      const T1 = pasangTokoh(V, c, `${sid}t`, tk, { x: 540 - V.lebar(tk.pose, 600) / 2, y: 960, h: 600, t0: c.s + 0.3, d: c.d, ganti: o.ganti });
      const { s, d } = V.scene(c, L(V, c) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${T1.html}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0 }, { scale: 1.04 }]]);
      const ta = Math.min(s + 0.4, T(V, c, o.kiri?.[1], 0, 3)), tb = Math.max(ta + 0.5, T(V, c, o.kanan?.[1], 1, 3));
      V.K(`tl.fromTo("#${sid}a", {x:-760}, {x:0, duration:0.45, ease:K.st("power3.out",0.45)}, ${f2(ta)});`); V.sfx(ta, "whoosh", 0.5);
      V.K(`tl.fromTo("#${sid}b", {x:760}, {x:0, duration:0.45, ease:K.st("power3.out",0.45)}, ${f2(tb)});`); V.sfx(tb + 0.4, "thud", 0.9);
      V.geleng(`#${sid}a`, tb + 0.42, 16); V.geleng(`#${sid}b`, tb + 0.42, -16);
      T1.anim();
      if (o.stempel) V.hantam(`#${sid}s`, Math.max(tb + 0.6, T(V, c, o.stempel, 2, 3)));
    },
  },

  chat: {
    ket: "Ponsel berisi chat WhatsApp (2-5 pesan, satu bisa disorot) + tokoh/foto bereaksi + stempel (??? / TENGGELAM).",
    kolom: { judul: "teks<=18", sub: "teks<=20", pesan: "pesan[]<=5!", foto: "aset", pose: "pose", wajah: "wajah[]<=2", ganti: "teks<=20", stempel: "teks<=12", tokoh: "teks<=40", latar: "aset", suasana: "pilih:masalah|malam|gelap" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, ps = [].concat(o.pesan).slice(0, 5).map((p) => ({ ...tx(p), keluar: !!p.keluar, sorot: !!p.sorot }));
      const hp = V.hp(`${sid}h`, { x: 60, y: 180, r: -4, judul: H(o.judul || "PESANAN"), sub: H(o.sub || "grup"), pesan: ps.map((p) => ({ ...p, teks: esc(p.teks) })) });
      let tok;
      if (o.foto) tok = { html: V.gambar(`${sid}t`, o.foto, { x: 520, y: 640, h: 860 }), anim: () => V.muncul(`#${sid}t`, c.s + 0.3, { y0: 220, bunyi: null }) };
      else { const tk = tokoh(V, c, { pose: o.pose ?? "bingung", wajah: o.wajah ?? ["bingung", "kesal"] }); tok = pasangTokoh(V, c, `${sid}t`, tk, { x: 1040 - V.lebar(tk.pose, 860), y: 640, h: 860, t0: c.s + 0.3, d: c.d, ganti: o.ganti }); }
      // 22 Okt (rb-k1-003 "50 KILO?" / "SUDAH B"): stempel > 5 huruf keluar tepi kanan → mengecil + geser kiri
      const nC = tx(o.stempel)?.teks.length || 0, fsC = nC <= 5 ? 100 : nC <= 8 ? 80 : 64, xC = nC <= 5 ? 640 : nC <= 8 ? 560 : 470;
      const fg = o.stempel ? V.stempel(`${sid}s`, { x: xC, y: 300, text: H(o.stempel), r: 10, fs: fsC }) : "";
      const { s, d } = V.scene(c, L(V, c, { suasana: o.suasana, aset: o.latar }) + `<div class="lay" id="${sid}m">${hp}${tok.html}</div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.04 }]]);
      V.stick(`#${sid}h`, s + 0.1, "{dr:-8, y0:200}", null);
      tok.anim();
      ps.forEach((p, k) => V.stick(`#${sid}hc${k}`, T(V, c, p, k, ps.length, 0.3), "{dr:0, s0:0.5, dur:0.3}", p.keluar ? "tik" : "pop"));
      if (o.stempel) V.hantam(`#${sid}s`, Math.max(T(V, c, o.stempel, 1, 2), s + d * 0.5));
    },
  },

  haru: {
    ket: "Penutup cerita hangat: maskot/tokoh terharu + kartu ucapan + tag (PENSIUN TENANG / KASUS DITUTUP) + bintang.",
    kolom: { kartu: "teks<=24", tag: "teks<=18", maskot: "aset", label: "teks<=14", pose: "pose", wajah: "wajah[]<=1", tokoh: "teks<=40", latar: "aset" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, tk = tokoh(V, c, { pose: o.pose ?? "presentasi", wajah: o.wajah ?? ["senang"] });
      const mid = (o.maskot ? V.gambar(`${sid}x`, o.maskot, { x: 90, y: 520, h: 960, label: o.label }) : "") + V.orang(`${sid}t`, tk.pose, tk.wajah, { x: o.maskot ? 690 : 540 - V.lebar(tk.pose, 860) / 2, y: o.maskot ? 900 : 640, h: o.maskot ? 600 : 860, flip: false });
      const fg = (o.kartu ? V.kartu(`${sid}k`, { x: 110, y: 170, w: 860, h: 230, text: H(o.kartu), fs: tx(o.kartu).teks.length > 18 ? 66 : 80, r: -2 }) : "") +
        (o.tag ? V.tag(`${sid}g`, { x: 540, y: 440, text: H(o.tag), c: "navy", color: "#FFD54F", fs: 64, r: 3, hi: true, anchor: "center" }) : "") +
        [[120, 560, "#FFB300"], [900, 520, V.aksen], [820, 760, "#FFB300"], [180, 840, V.aksen]].map(([x, y, w], k) => V.bintang(`${sid}x${k}`, x, y, 70, w, k * 20)).join("");
      const { s, d } = V.scene(c, L(V, c, { suasana: "solusi", aset: o.latar }) + `<div class="lay" id="${sid}m">${mid}</div><div class="lay" id="${sid}f">${fg}</div>`);
      V.kamera(s, d, [[`#${sid}m`, { scale: 1.0 }, { scale: 1.03 }]]);
      if (o.maskot) { V.muncul(`#${sid}x`, s + 0.1, { y0: 220, bunyi: null }); V.napas(`#${sid}x`, s + 0.6, d - 0.6, { amp: 0.02, rot: 1.6, per: 0.7 }); }
      V.muncul(`#${sid}t`, s + 0.3, { y0: 200 }); V.napas(`#${sid}t`, s + 0.8, d - 1);
      if (o.kartu) V.stick(`#${sid}k`, Math.min(s + 0.5, T(V, c, o.kartu, 0, 2)), "{dr:-10}");
      const tg = T(V, c, o.tag, 1, 2);
      if (o.tag) V.stick(`#${sid}g`, tg, "{dr:12}", "ding");
      [0, 1, 2, 3].forEach((k) => V.stick(`#${sid}x${k}`, tg + 0.2 + k * 0.12, `{dr:${k % 2 ? -50 : 50}, dur:0.4}`, k ? null : "sparkle"));
    },
  },

  cta: {
    ket: "Penutup WAJIB (adegan terakhir): logo + kartu ajakan sopan + tombol 'Tanya lewat WhatsApp di profil' berdenyut + maskot/tokoh.",
    kolom: { ajakan: "teks<=40", maskot: "aset", label: "teks<=14", pose: "pose", wajah: "wajah[]<=1", tokoh: "teks<=40" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, dc = V.brand === "dentalcare";
      const aj = o.ajakan ? H(o.ajakan) : dc ? `Mau lihat demo<br><span style='color:${V.aksen}'>DentalCare?</span>` : V.brand === "ratu-bawang" ? `Bawang untuk dapurmu?<br><span style='color:${V.aksen}'>Ratu Bawang</span>` : `Mau aplikasi seperti ini<br><span style='color:${V.aksen}'>untuk bisnismu?</span>`;
      let mid = "";
      if (o.maskot) mid = V.gambar(`${sid}x`, o.maskot, { x: 120, y: 1160, h: 520, label: o.label });
      else { const tk = tokoh(V, c, { pose: o.pose ?? "jempol", wajah: o.wajah ?? ["senang"] }); mid = V.orang(`${sid}x`, tk.pose, tk.wajah, { x: 640, y: 1150, h: 560 }); }
      const fg = V.logo(`${sid}l`, {}) + V.kartu(`${sid}k`, { x: 90, y: 560, w: 900, h: 300, text: aj, fs: dc || o.ajakan ? 80 : 66, r: 1.5 }) + V.tombolWA(`${sid}wa`, { y: 930 });
      const { s, d } = V.scene(c, L(V, c, { suasana: c.konsep === "K4" ? undefined : "solusi" }) + `<div class="lay" id="${sid}f">${fg}</div><div class="lay" id="${sid}m">${mid}</div>`);
      V.kamera(s, d, [[`#${sid}f`, { scale: 1.0 }, { scale: 1.03 }]]);
      V.stick(`#${sid}l`, s + 0.15, "{dr:-10}"); V.stick(`#${sid}k`, Math.min(s + 0.6, T(V, c, { teks: "demo aplikasi" }, 0, 2)), "{dr:10}");
      const tw = Math.max(s + 0.9, T(V, c, { teks: "tanya whatsapp" }, 1, 2));
      V.stick(`#${sid}wa`, tw, "{dr:-8}", "ding"); V.K(`tl.fromTo("#${sid}wa", {scale:1}, {scale:1.05, duration:0.35, yoyo:true, repeat:5, ease:"sine.inOut"}, ${f2(tw + 0.6)});`);
      V.muncul(`#${sid}x`, s + 0.4, { y0: 260, bunyi: null }); V.goyang(`#${sid}x`, s + 0.9, d - 1.2, { rot: 4, per: 0.55 });
    },
  },

  koran: {
    ket: "Hook halaman koran: nama koran, judul besar ('Kenalin, ini drg. Sinta'), subjudul, foto tokoh dilingkari spidol merah, kamera zoom.",
    kolom: { koran: "teks<=14", rubrik: "teks<=16", judul: "teks<=26!", sub: "teks<=56", foto: "aset", kata: "teks<=20" },
    bangun(V, c) {
      const o = c.o, sid = c.sid, foto = o.foto || V.fotoUtama();
      V.font.add("SerifB");
      const garis = (x, y, w, n, gap = 26) => Array.from({ length: n }, (_, k) => `<div style="position:absolute;left:${x}px;top:${y + k * gap}px;width:${k === n - 1 ? w * 0.6 : w}px;height:9px;background:#6B5E4A;opacity:.42;border-radius:3px"></div>`).join("");
      const koran = `<div class="full" style="background:#E9DFC9;filter:url(#grainBg)"></div><div class="full" style="background:radial-gradient(ellipse at 50% 40%,transparent 50%,rgba(70,50,25,.35))"></div>
  <div style="position:absolute;left:60px;top:150px;width:960px;border-top:5px solid #2B2418;border-bottom:2px solid #2B2418;padding:14px 0 8px;text-align:center;font:900 96px/1 'SerifB';color:#2B2418;white-space:nowrap">${H(o.koran || (V.brand === "dentalcare" ? "KABAR KLINIK" : "KABAR USAHA"))}</div>
  <div style="position:absolute;left:60px;top:292px;width:960px;display:flex;justify-content:space-between;font:700 26px/1 'SerifB';color:#4A3F2E;border-bottom:2px solid #2B2418;padding-bottom:10px"><span>EDISI SPESIAL</span><span>${H(o.rubrik || "RUBRIK TOKOH")}</span><span>HALAMAN 1</span></div>
  <div id="${sid}hd" style="position:absolute;left:60px;top:345px;width:960px;font:900 84px/1.08 'SerifB';color:#1F1A12">${H(o.judul)}</div>
  <div style="position:absolute;left:60px;top:540px;width:960px;font:italic 400 32px/1.3 'SerifB';color:#4A3F2E">${H(o.sub || "")}</div>
  ${foto ? `<div style="position:absolute;left:60px;top:640px;width:560px;height:660px;background:#2B2418;padding:10px"><img src="${V.src(foto)}" style="width:540px;height:640px;object-fit:cover;object-position:30% 20%;filter:grayscale(1) sepia(.35) contrast(1.05)"></div>` : ""}
  ${garis(650, 650, 370, 24)}${garis(60, 1340, 450, 14)}${garis(560, 1340, 460, 14)}
  <svg style="position:absolute;left:70px;top:640px;width:540px;height:560px;overflow:visible" viewBox="0 0 540 560"><ellipse id="${sid}ring" cx="250" cy="250" rx="190" ry="235" fill="none" stroke="#D32F2F" stroke-width="11" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-8 250 250)"/></svg>`;
      const { s, d } = V.scene(c, `<div class="lay" id="${sid}c2" style="transform-origin:330px 900px">${koran}</div>`, { enter: c.bi > 0 });
      V.K(`tl.fromTo("#${sid}c2", {scale:1.25, x:120, y:180}, {scale:1, x:0, y:0, duration:1.3, ease:"power2.out"}, ${f2(s)});`);
      V.K(`tl.fromTo("#${sid}hd", {clipPath:"inset(0 100% 0 0)"}, {clipPath:"inset(0 0% 0 0)", duration:0.7, ease:"power1.out"}, ${f2(s + 0.15)});`);
      const tr = Math.max(s + 0.6, T(V, c, { teks: o.judul, kata: o.kata }, 1, 2) - 0.25);
      V.K(`tl.to("#${sid}ring", {strokeDashoffset:0, duration:0.55, ease:"power1.inOut"}, ${f2(tr)});`); V.sfx(tr, "spidol", 0.8);
      V.K(`tl.to("#${sid}c2", {scale:1.9, x:-60, y:-260, duration:${f2(Math.max(0.5, d - 1.6))}, ease:"power2.in"}, ${f2(s + 1.6)});`);
    },
  },
};
