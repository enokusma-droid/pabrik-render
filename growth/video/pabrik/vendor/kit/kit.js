// Paper cutout kit (HyperFrames) — helper animasi seek-safe & deterministik. Lihat ../RESEP.md
// Pakai: const K = paperKit(tl, {fps: 12}); K.stick(el, t, {...}); K.out(el, t, {...}); K.boil(durasi);
function paperKit(tl, o) {
  o = o || {};
  const FPS = o.fps || 12;               // laju "stop-motion" (gerak dikuantisasi ke 12 langkah/dtk)
  const AMP = o.amp || 1.5;              // boil: geser maks ±px
  const ROT = o.rot || 0.7;              // boil: rotasi maks ±derajat
  const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  const st = (base, dur) => { const e = gsap.parseEase(base); const n = Math.max(2, Math.round(dur * FPS)); return (t) => e(Math.round(t * n) / n); };
  const R = (el) => parseFloat(el.dataset.r || 0);
  const q = (x) => (typeof x === "string" ? document.querySelector(x) : x);
  function stick(el, at, p) {
    el = q(el); p = p || {}; const dur = p.dur || 0.5, r = R(el);
    tl.fromTo(el, { scale: p.s0 ?? 0, rotation: r + (p.dr ?? -14), x: p.x0 || 0, y: p.y0 || 0, opacity: 0 },
      { scale: 1, rotation: r, x: 0, y: 0, opacity: 1, duration: dur, ease: st(p.ease || "back.out(2.2)", dur) }, at);
  }
  function out(el, at, p) {
    el = q(el); p = p || {}; const dur = p.dur || 0.4;
    tl.to(el, { x: p.x || 0, y: p.y || 0, rotation: R(el) + (p.dr ?? 20), scale: p.s ?? 1, opacity: p.op ?? 1, duration: dur, ease: st(p.ease || "power3.in", dur) }, at);
  }
  function boil(total) {
    const els = Array.from(document.querySelectorAll(".b-j")); const proxy = { t: 0 };
    tl.fromTo(proxy, { t: 0 }, { t: total, duration: total, ease: "none", onUpdate: () => {
      const f = Math.floor(proxy.t * FPS);
      for (let i = 0; i < els.length; i++) els[i].style.transform =
        `translate(${((rnd(i, f) - 0.5) * 2 * AMP).toFixed(2)}px,${((rnd(i + 99, f) - 0.5) * 2 * AMP).toFixed(2)}px) rotate(${((rnd(i + 199, f) - 0.5) * 2 * ROT).toFixed(2)}deg)`;
    } }, 0);
  }
  return { st, stick, out, boil, rnd, R, FPS };
}
