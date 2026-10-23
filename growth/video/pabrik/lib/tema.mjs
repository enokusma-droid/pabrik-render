// Tema per konsep K0-K8: latar, transisi antar adegan, posisi subtitle, mode watermark, musik default, HUD (jam K1, ticker K3, REC K8).
// Warna & bentuk diambil dari generator contoh lulus (konsep/K*/buat.mjs). Primitif memanggil V.latar(bi, varian) untuk latar adegan.
import { VW, VH, f2 } from "./inti.mjs";

export const MUSIK = { K0: "ceria", K1: "ceria", K2: "ceria2", K3: "tegang", K4: "ceria", K5: "tegang", K6: "haru", K7: "ceria2", K8: "horor" };
export const NAMA_KONSEP = { K0: "Roasting + twist benda", K1: "Sehari dalam hidup", K2: "Dulu vs Sekarang", K3: "Berita TV", K4: "Tipe-tipe (kartu game)", K5: "Detektif", K6: "Surat terbuka dari benda", K7: "Tutorial salah", K8: "Horor-komedi" };

const grain = (warna, id = "") => `<div class="full" ${id ? `id="${id}"` : ""} style="background:${warna};filter:url(#grainBg)"></div>`;
const cahaya = `<div class="full" style="background:radial-gradient(ellipse at 30% 25%,rgba(255,248,230,.55),transparent 60%),radial-gradient(ellipse at 80% 90%,rgba(60,40,20,.18),transparent 55%)"></div>`;
export const bgKertas = (id, warna = "#EFE6D6") => `<div class="lay" id="${id}">${grain(warna, id + "c")}${cahaya}<div class="tirai" id="${id}t"></div></div>`;
export const bgNoir = (id, warna = "#15171D") => `<div class="lay" id="${id}">${grain(warna)}<div class="full" id="${id}sp" style="background:radial-gradient(circle at 50% 38%,rgba(255,226,160,.42),rgba(255,226,160,.12) 32%,transparent 58%)"></div><div class="full" style="background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.6))"></div></div>`;
export const bgSurat = (id, warna = "#FBF6EA") => `<div class="lay" id="${id}">${grain(warna)}` +
  `<div class="full" style="background:repeating-linear-gradient(180deg,transparent 0 88px,rgba(70,110,190,.28) 88px 91px);background-position:0 40px"></div>` +
  `<div style="position:absolute;left:120px;top:0;width:4px;height:${VH}px;background:rgba(210,60,60,.45)"></div>` +
  `<div class="full" style="background:radial-gradient(circle at 85% 12%,rgba(150,100,40,.16),transparent 14%),radial-gradient(ellipse at 50% 50%,transparent 60%,rgba(90,60,20,.22))"></div><div class="tirai" id="${id}t" style="opacity:.28"></div></div>`;
export const bgPop = (id, warna, titik = "rgba(22,22,29,.13)") => `<div class="lay" id="${id}"><div class="full" style="background:${warna}"></div><div class="full" style="background-image:radial-gradient(${titik} 3.2px, transparent 3.6px);background-size:46px 46px;background-position:12px 12px"></div><div class="full" style="background:radial-gradient(ellipse at 50% 35%,rgba(255,255,255,.35),transparent 65%)"></div></div>`;
export const UNGU = "#1A1033";
export const bgArena = (id, glow) => `<div class="lay" id="${id}" style="background:${UNGU}"><div class="full" style="background:radial-gradient(ellipse at 50% 38%,${glow},transparent 62%)"></div>
  <div class="full" style="background:repeating-linear-gradient(0deg,transparent 0 78px,rgba(255,255,255,.05) 78px 80px),repeating-linear-gradient(90deg,transparent 0 78px,rgba(255,255,255,.05) 78px 80px)"></div>
  <div class="sinar" id="${id}s" style="background:repeating-conic-gradient(from 0deg at 50% 50%,${glow} 0 8deg,transparent 8deg 22deg)"></div></div>`;
export const bgGelap = (id, warna = "#0B0F1A") => `<div class="lay" id="${id}">${grain(warna)}<div class="full" style="background:radial-gradient(ellipse at 50% 30%,rgba(120,150,255,.16),transparent 55%),radial-gradient(ellipse at 50% 50%,transparent 45%,rgba(0,0,0,.75))"></div></div>`;
export const bgStudio = (id) => `<div class="lay" id="${id}"><div class="full" style="background:linear-gradient(180deg,#0A1A3A,#122B5C 55%,#0A1630)"></div><div class="full" style="background:repeating-linear-gradient(90deg,transparent 0 118px,rgba(120,180,255,.08) 118px 120px)"></div><div class="full" style="background:radial-gradient(ellipse at 50% 30%,rgba(80,160,255,.35),transparent 60%)"></div></div>`;

const KREM = ["#EFE6D6", "#D9C3A0", "#E3EEF0", "#F1E9DA", "#E8D9BF", "#DCE6EE"];
const PASTEL = ["#FFE45C", "#FFB5D3", "#9EF0D0", "#B5D8FF", "#FFD0A8", "#D9C2FF"];
const GLOW = ["rgba(108,60,225,.55)", "rgba(33,163,102,.5)", "rgba(155,89,182,.55)", "rgba(26,188,156,.5)", "rgba(255,179,0,.55)", "rgba(255,106,26,.5)"];
// warna "solusi" per brand (adegan opsi.suasana = "solusi")
export const SOLUSI = { dentalcare: "#DCEFEC", nusawebsite: "#FFEBDC", "ratu-bawang": "#F3E6CC" };
export const AKSEN = { dentalcare: "#0D9488", nusawebsite: "#FF6A1A", "ratu-bawang": "#780F1B" };
const POP_SOLUSI = { dentalcare: "#9EF0D0", nusawebsite: "#FFD0A8", "ratu-bawang": "#F0D9A8" };

// latar adegan: varian = indeks adegan; suasana: "masalah" (default) | "solusi" | "malam" | "gelap" | "hangat"
export function latar(V, konsep, id, bi, { suasana, aset, varian } = {}) {
  const i = varian ?? bi;
  if (aset) return V.bgImg(id, aset, suasana === "malam" ? "filter:brightness(.82)" : "");
  const sol = suasana === "solusi" ? SOLUSI[V.brand] : null;
  switch (konsep) {
    case "K1": {
      if (sol) return bgKertas(id, sol);
      const p = Math.min(1, bi / Math.max(1, V.N * 0.6)); // krem → oranye senja makin kacau
      const mix = (a, b) => "#" + [0, 2, 4].map((k) => Math.round(parseInt(a.substr(k + 1, 2), 16) * (1 - p) + parseInt(b.substr(k + 1, 2), 16) * p).toString(16).padStart(2, "0")).join("");
      return bgKertas(id, suasana === "malam" ? "#C9A27A" : mix("#F3EBDD", "#E2B07E"));
    }
    case "K4": return bgArena(id, sol ? "rgba(255,179,0,.55)" : GLOW[i % GLOW.length]);
    case "K5": return sol ? bgKertas(id, sol) : bgNoir(id, ["#15171D", "#1B2230", "#20232B", "#1A1012"][i % 4]);
    case "K6": return bgSurat(id, sol ? "#F4FBF2" : "#FBF6EA");
    case "K7": return bgPop(id, sol ? (POP_SOLUSI[V.brand] || "#FFD0A8") : PASTEL[i % PASTEL.length]);
    case "K8": return suasana === "hangat" || sol ? bgKertas(id, sol || "#F3E3C7") : bgGelap(id, ["#0B0F1A", "#0E0B14", "#0A1210"][i % 3]);
    case "K3": return sol ? bgKertas(id, sol) : bgStudio(id);
    default: return bgKertas(id, sol || (suasana === "malam" ? "#C9B08C" : KREM[i % KREM.length]));
  }
}
// gerak latar (tirai cahaya / sinar arena / lampu sorot)
export function gerakLatar(V, konsep, id, s, d) {
  if (konsep === "K4") V.K(`tl.fromTo("#${id}s", {rotation:0}, {rotation:40, duration:${f2(d)}, ease:"none"}, ${f2(s)});`);
  else if (konsep === "K5") V.K(`if(document.querySelector("#${id}sp"))tl.fromTo("#${id}sp", {x:-200, y:-60}, {x:200, y:120, duration:${f2(d)}, ease:"sine.inOut"}, ${f2(s)});`);
  else if (konsep !== "K7" && konsep !== "K3") V.K(`if(document.querySelector("#${id}t"))tl.fromTo("#${id}t", {x:-60, y:-40}, {x:40, y:30, duration:${f2(d)}, ease:"sine.inOut"}, ${f2(s)});`);
}

// transisi masuk adegan
export function masuk(V, konsep, sid, s) {
  if (konsep === "K4") {
    V.K(`tl.fromTo("#${sid}w", {y:${VH}, rotation:-8, scale:0.85}, {y:0, rotation:0, scale:1, duration:0.42, ease:"power3.out"}, ${f2(s)});`);
    V.K(`tl.fromTo("#${sid}fl", {opacity:0.75}, {opacity:0, duration:0.3, ease:"power1.out"}, ${f2(s + 0.38)});`);
  } else if (konsep === "K8") {
    V.K(`tl.fromTo("#${sid}w", {opacity:0}, {opacity:1, duration:0.08, ease:"none"}, ${f2(s)}); tl.fromTo("#${sid}fl", {opacity:0.9}, {opacity:0, duration:0.35, ease:"power1.out"}, ${f2(s + 0.05)});`);
  } else if (konsep === "K3") {
    V.K(`tl.fromTo("#${sid}w", {x:${-VW - 80}}, {x:0, duration:0.4, ease:K.st("power3.out",0.4)}, ${f2(s)});`);
  } else {
    V.K(`tl.fromTo("#${sid}w", {x:${VW + 120}, rotation:3}, {x:0, rotation:0, duration:0.55, ease:K.st("power3.out",0.55)}, ${f2(s)});`);
  }
  V.sfx(s, "whoosh", 0.7);
}

export const WM = { K4: "TERANG" }; // lainnya KONTRAS (navy pekat + tepi putih terbaca di latar gelap maupun terang; K5/K8/K3 berakhir di latar terang)
export const SUB_TOP = { K4: 1430, K3: 1440 }; // K3: di bawah ticker (1330-1406); 1250 menimpa lower third (1120-1290)
export const SHEET_BG = { K4: UNGU, K5: "#15171D", K8: "#0B0F1A", K3: "#0A1A3A" };
export const FONT_KONSEP = { K0: ["SerifB"], K1: ["SerifB"], K5: ["SerifB"], K6: ["Caveat"], K3: ["SerifB"] };

// ---------- HUD lintas adegan ----------
// K1: jam pojok dari opsi.jam tiap adegan ("07.15"); adegan pertama ber-jam tampil besar di tengah lalu menyusut ke pojok.
export function hudJam(V, adegan) {
  const seq = []; let hari = 1;
  adegan.forEach((a, bi) => { const o = a.opsi || {}; if (o.hari) hari = +o.hari; if (o.jam) seq.push({ t: bi === 0 ? 0 : f2(V.W.blok[bi].s + 0.3 - 0.05), v: String(o.jam), hari, bi }); });
  if (seq.length < 2) return;
  const jamKe = (v) => { const [h, m] = v.split(/[.:]/).map(Number); return Math.max(0.02, Math.min(1, (h + (m || 0) / 60 - 7) / 16)); };
  const akhir = seq.at(-1).bi, hEnd = f2(V.bE[Math.min(V.N - 1, akhir)] + 0.3);
  const vals = seq.map((x, k) => `<div class="tx" id="hv${k}" style="position:absolute;left:0;right:0;top:66px;text-align:center;font:900 104px/1 'Spartan';color:#1B2A4A;opacity:${k ? 0 : 1};transform-origin:50% 50%">${x.v}</div>`).join("");
  const aks = AKSEN[V.brand] || "#FF6A1A";
  V.html += `\n<div id="hud" class="clip full" data-start="0" data-duration="${hEnd}" data-track-index="7" style="z-index:800;pointer-events:none"><div id="hudw" class="it" style="left:690px;top:56px;width:350px;height:230px;transform-origin:50% 50%">` +
    `<div class="b b-j"><div class="pp white ppH" style="border-radius:22px"></div>` +
    `<div class="tx" id="hd1" style="position:absolute;left:28px;top:22px;font:900 34px/1 'Spartan';color:#C62828;letter-spacing:2px">HARI 1</div><div class="tx" id="hd2" style="position:absolute;left:28px;top:22px;font:900 34px/1 'Spartan';color:${aks};letter-spacing:2px;opacity:0">HARI 2</div>` +
    `<div style="position:absolute;right:26px;top:16px;width:44px;height:44px;border:6px solid #1B2A4A;border-radius:50%"><div id="hjarum" style="position:absolute;left:14px;top:3px;width:5px;height:16px;background:#1B2A4A;transform-origin:50% 100%"></div></div>` +
    `${vals}<div style="position:absolute;left:28px;right:28px;top:186px;height:20px;border-radius:10px;background:#E8E1D5;overflow:hidden"><div id="hbar" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:#FFB300;transform-origin:0 50%"></div></div></div></div></div>`;
  const K = V.K;
  K(`tl.set("#hbar", {scaleX:${f2(jamKe(seq[0].v))}}, 0);`);
  K(`tl.fromTo("#hudw", {x:-345, y:470, scale:2.2, opacity:0}, {opacity:1, duration:0.25, ease:"none"}, 0.05);`);
  K(`tl.fromTo("#hudw", {rotation:-6}, {rotation:0, duration:0.5, ease:K.st("back.out(2)",0.5)}, 0.05);`); V.sfx(0.1, "tik", 0.9);
  K(`tl.to("#hudw", {x:0, y:0, scale:1, duration:0.45, ease:K.st("power3.inOut",0.45)}, ${f2(Math.min(1.8, Math.max(0.6, V.bS[1] - 0.2)))});`); V.sfx(Math.min(1.8, V.bS[1] - 0.2), "whoosh", 0.5); // jam besar maks 1,8 dtk (pratinjau: menutupi tokoh adegan 1)
  let hariNow = seq[0].hari;
  seq.forEach((x, k) => {
    if (!k) return;
    const t = Math.max(x.t, V.bS[x.bi] + 0.05);
    K(`tl.set("#hv${k - 1}", {opacity:0}, ${f2(t)}); tl.set("#hv${k}", {opacity:1}, ${f2(t)}); tl.fromTo("#hv${k}", {scaleY:0.1}, {scaleY:1, duration:0.2, ease:"power2.out"}, ${f2(t)});`);
    const warna = x.hari > 1 ? aks : jamKe(x.v) > 0.7 ? "#D32F2F" : jamKe(x.v) > 0.35 ? "#FB8C00" : "#FFB300";
    K(`tl.to("#hbar", {scaleX:${f2(jamKe(x.v))}, backgroundColor:"${warna}", duration:0.35, ease:"power2.out"}, ${f2(t)});`);
    K(`tl.fromTo("#hjarum", {rotation:${(k - 1) * 70}}, {rotation:${k * 70}, duration:0.3, ease:"power2.out"}, ${f2(t)});`);
    K(`tl.fromTo("#hudw", {rotation:-5}, {rotation:0, duration:0.35, ease:K.st("back.out(3)",0.35)}, ${f2(t)});`); V.sfx(t, "tik", 0.9);
    if (x.hari !== hariNow) { hariNow = x.hari; K(`tl.set("#hd1", {opacity:0}, ${f2(t)}); tl.set("#hd2", {opacity:1}, ${f2(t)}); tl.fromTo("#hd2", {scale:1.6}, {scale:1, duration:0.3, ease:K.st("back.out(2)",0.3)}, ${f2(t)});`); V.sfx(t + 0.05, "stamp", 0.7); }
  });
  K(`tl.to("#hudw", {y:-320, opacity:0, duration:0.3, ease:"power2.in"}, ${f2(hEnd - 0.35)});`);
}
// K8: bingkai kamera CCTV "● REC" + jam berjalan, selama adegan bersuasana gelap
export function hudRec(V, adegan) {
  const gelap = adegan.map((a, bi) => ({ bi, g: !["hangat", "solusi"].includes(a.opsi?.suasana) && a.primitif !== "cta" })).filter((x) => x.g);
  if (!gelap.length) return;
  const s = V.bS[gelap[0].bi], e = V.bE[gelap.at(-1).bi];
  V.html += `\n<div id="rec" class="clip full" data-start="${f2(s)}" data-duration="${f2(e - s)}" data-track-index="7" style="z-index:800;pointer-events:none">` +
    `<div style="position:absolute;left:40px;top:40px;width:1000px;height:1300px;border:4px solid rgba(255,255,255,.55);border-radius:8px"></div>` +
    `<div id="recdot" style="position:absolute;left:80px;top:80px;width:34px;height:34px;border-radius:50%;background:#FF1744;box-shadow:0 0 18px #FF1744"></div>` +
    `<div style="position:absolute;left:130px;top:76px;font:900 44px/1 'Spartan';color:#fff;letter-spacing:3px">REC</div>` +
    `<div id="recjam" style="position:absolute;right:80px;top:80px;font:700 40px/1 'InterL';color:#fff;letter-spacing:2px">23:47:00</div></div>`;
  V.K(`tl.fromTo("#recdot", {opacity:1}, {opacity:0.15, duration:0.5, yoyo:true, repeat:${Math.max(1, Math.floor((e - s) / 0.5) - 1)}, ease:"steps(1)"}, ${f2(s)});`);
  V.K(`(function(){const o={v:0};const n=document.querySelector("#recjam");tl.fromTo(o,{v:0},{v:${Math.round(e - s)},duration:${f2(e - s)},ease:"none",onUpdate:()=>{const x=Math.floor(o.v);n.textContent="23:47:"+(x<10?"0":"")+x;}},${f2(s)});})();`);
}
// K3: ticker berita berjalan + label LIVE (spec.ticker = teks)
export function hudTicker(V, teks) {
  if (!teks) return;
  const e = V.bE[V.N - 2] ?? V.TOTAL;
  V.html += `\n<div id="tick" class="clip full" data-start="0" data-duration="${f2(e)}" data-track-index="7" style="z-index:800;pointer-events:none">` +
    `<div style="position:absolute;left:0;right:0;top:1330px;height:76px;background:#0B1F4A;border-top:5px solid #E53935"></div><div style="position:absolute;left:0;top:1330px;width:210px;height:76px;background:#E53935;font:900 40px/76px 'Spartan';color:#fff;text-align:center">TERKINI</div>` +
    `<div style="position:absolute;left:210px;right:0;top:1330px;height:76px;overflow:hidden"><div id="ticktx" style="position:absolute;left:0;top:18px;white-space:nowrap;font:700 38px/1 'InterL';color:#fff">${(teks + "   •   ").repeat(4)}</div></div>` +
    `<div style="position:absolute;right:50px;top:60px;padding:10px 22px 6px;border-radius:8px;background:#E53935;font:900 40px/1 'Spartan';color:#fff;letter-spacing:3px">● LIVE</div></div>`;
  V.K(`tl.fromTo("#ticktx", {x:0}, {x:-${Math.round(teks.length * 21 + 120)}, duration:${f2(e)}, ease:"none"}, 0);`);
}
