import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { MOTION } from './config.js';
import { initFilm } from './ui/film.js';
import { initChapters } from './ui/chapters.js';
import { initForm } from './ui/form.js';

gsap.registerPlugin(ScrollTrigger);

const loader = document.getElementById('loader');
const bootAt = performance.now();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll-scrubbed filmstrip replaces the realtime 3D stage.
const film = initFilm({ reduceMotion });

// Smooth scroll, synced to ScrollTrigger. Native scroll when reduced motion.
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Scrub frames 0 → 119 across the whole story; pause work under the sheet.
ScrollTrigger.create({
  trigger: '#top',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => film.setTarget(self.progress),
});
ScrollTrigger.create({
  trigger: '#built-by',
  start: 'top bottom',
  end: 'bottom top',
  onToggle: (self) => film.setCovered(self.isActive),
});

initChapters({ lenis, reduceMotion });
initForm();

let filmLoaded = false;
film.ready.then(() => { filmLoaded = true; reveal(); });

let revealDone = false;
function reveal() {
  if (revealDone || !filmLoaded) return;
  revealDone = true;
  const wait = Math.max(0, MOTION.loaderMinMs - (performance.now() - bootAt));
  setTimeout(() => {
    loader.classList.add('done');
    document.body.classList.add('is-ready');
    ScrollTrigger.refresh();
    setTimeout(() => loader.remove(), 1000);
  }, wait);
}

// Reveal after first frame + min display time (inline failsafe covers errors).
requestAnimationFrame(() => requestAnimationFrame(reveal));
addEventListener('load', () => {
  ScrollTrigger.refresh();
  reveal();
});
setTimeout(reveal, 3500);
