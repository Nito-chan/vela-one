import { FILM, STAGE } from '../config.js';

// Scroll-scrubbed filmstrip: photographic frames on a fixed canvas.
// Frame 0 renders the moment it decodes; the rest stream in behind it.
export function initFilm({ reduceMotion }) {
  const canvas = document.getElementById('film');
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduce = reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
  const dpr = Math.min(devicePixelRatio || 1, coarse ? STAGE.pixelRatioMobile : STAGE.pixelRatioDesktop);

  const N = FILM.count;
  const base = import.meta.env.BASE_URL || '/';
  const frames = new Array(N).fill(null);
  let resolveReady;
  const ready = new Promise((r) => { resolveReady = r; });
  let firstShown = false;

  // Contain-fit: the footage sits on near-black, so letterboxing blends in
  // on ultrawide and portrait screens instead of cropping the watch.
  const draw = (idx) => {
    const img = frames[idx];
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    ctx.fillStyle = '#050506';
    ctx.fillRect(0, 0, cw, ch);
    const s = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  };

  let target = 0;
  let current = 0;
  let shown = -1;
  let covered = false;

  function resize() {
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    if (shown >= 0) draw(shown);
  }

  function tick() {
    if (!covered) {
      current = reduce ? target : current + (target - current) * 0.14;
      if (Math.abs(target - current) < 0.001) current = target;
      const idx = Math.max(0, Math.min(N - 1, Math.round(current)));
      if (idx !== shown) {
        if (frames[idx]) { shown = idx; draw(idx); }
        else if (reduce) { /* wait for the exact frame when reduced motion */ }
      }
    }
    requestAnimationFrame(tick);
  }

  // Fire all requests at once; the browser pipelines them (~4MB total).
  for (let i = 0; i < N; i++) {
    const img = new Image();
    img.decoding = 'async';
    if (i === 0) img.fetchPriority = 'high';
    img.src = `${base}frames/frame-${String(i + 1).padStart(3, '0')}.jpg`;
    img.onload = () => {
      frames[i] = img;
      if (i === 0 && !firstShown) {
        firstShown = true;
        shown = 0;
        draw(0);
        resolveReady();
      } else if (i === shown || Math.round(current) === i) {
        draw(i);
      }
    };
  }

  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(tick);

  return {
    ready,
    setTarget: (p) => { target = Math.max(0, Math.min(N - 1, p * (N - 1))); },
    setCovered: (v) => { covered = v; },
  };
}
