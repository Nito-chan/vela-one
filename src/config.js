// ALL tunables live here. Re-skin the page for a client brand without touching logic.
export const BRAND = 'Nitō';
export const PRODUCT = 'VELA One';
export const PORTFOLIO_URL = '#'; // <-- paste real portfolio link here
export const SHOWCASE = {
  title: 'This page is a demo. I build pages like this for your product.',
  automationLine: 'Your message triggers an automation: lead stored, auto-reply sent, I get pinged.',
};

export const PALETTE = {
  bg: '#050506',
  bg2: '#0c0c0f',
  text: '#f5f5f7',
  muted: '#86868b',
  line: 'rgba(255,255,255,0.12)',
  accent: '#2997ff',
};

export const COPY = {
  heroTitleA: 'Everything inside.',
  heroTitleB: 'Nothing missing.',
  heroSub: 'Meet VELA One. Take it apart, see why.',
  scrollHint: 'Scroll',
  chapters: [
    { eyebrow: '01 — Sapphire glass', title: 'Sapphire, cut to 0.8 mm.', body: 'Scratch-resistant to 9 Mohs. Clearer than anything you have worn.',
      specs: [['0.8 mm', 'thin sapphire'], ['9 Mohs', 'scratch resistance'], ['92%', 'light transmission']],
      anno: ['Sapphire crystal', '0.8 mm · 9 Mohs'] },
    { eyebrow: '02 — Display', title: 'A screen that disappears.', body: 'LTPO OLED. 2,000 nits. Black so deep the bezel vanishes.',
      specs: [['2,000 nits', 'peak brightness'], ['1–120 Hz', 'adaptive refresh'], ['0.6 mm', 'panel thinness']],
      anno: ['LTPO OLED', '2,000 nits peak'] },
    { eyebrow: '03 — Frame', title: 'Grade 5 titanium.', body: 'Lighter than steel, twice as tough.',
      specs: [['Ti-6Al-4V', 'grade 5 alloy'], ['32 g', 'case weight'], ['5 ATM', 'water resistance']],
      anno: ['Titanium unibody', 'Grade 5 · 32 g'] },
    { eyebrow: '04 — Mainboard', title: 'One chip. Every beat.', body: 'A custom 4 nm processor, 70 percent of the board’s work in one tiny square.',
      specs: [['4 nm', 'custom silicon'], ['8-core', 'neural engine'], ['70%', 'of tasks on-chip']],
      anno: ['V1 silicon', '4 nm · 8-core NPU'] },
    { eyebrow: '05 — Power', title: 'Three days. Honestly.', body: 'A stacked cell and a haptic engine tuned to feel like a tap, not a buzz.',
      specs: [['2.1 Wh', 'stacked cell'], ['72 h', 'typical use'], ['40 min', 'to 80% charge']],
      anno: ['Stacked cell', '2.1 Wh · 72 h'] },
    { eyebrow: '06 — Sensors', title: 'It listens to your pulse.', body: 'Four-LED optical array reads heart rate, oxygen and sleep from the wrist.',
      specs: [['4-LED', 'optical array'], ['100 Hz', 'sampling rate'], ['SpO₂ + HR', 'always on']],
      anno: ['Optical array', 'HR · SpO₂ · sleep'] },
  ],
  finaleTitleA: 'VELA One.',
  finaleTitleB: 'Reserve yours.',
  finaleCta: 'Reserve yours',
};

export const STAGE = {
  pixelRatioDesktop: 2,
  pixelRatioMobile: 1.5,
};

// Scroll-scrubbed filmstrip (public/frames/frame-001.jpg …).
export const FILM = {
  count: 120,
};

export const MOTION = {
  loaderMinMs: 1200,
};

export const FONTS = {
  stack: '-apple-system, "SF Pro Display", "Inter", system-ui, sans-serif',
};
