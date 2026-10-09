import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { MOTION, STAGE } from './config.js';
import { createStage } from './scene/stage.js';
import { createMaterials } from './scene/materials.js';
import { buildWatch } from './scene/watch.js';
import { buildExplodeTimeline } from './scene/explode.js';
import { initAnnotations } from './ui/annotations.js';
import { initChapters } from './ui/chapters.js';
import { initForm } from './ui/form.js';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('scene');
const loader = document.getElementById('loader');
const bootAt = performance.now();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const { renderer, scene, camera, isMobile, isVisible, setCovered, setLowPower } = createStage(canvas);
const materials = createMaterials();
const { group: watch, layers } = buildWatch(materials);
scene.add(watch);
watch.scale.setScalar(0.94);

// Low-power mode: cheap glass + capped pixel ratio. Triggered by mobile UA,
// few CPU cores, or sustained low FPS. No bloom pass exists to disable.
let lowPower = false;
function enableLowPower() {
  if (lowPower) return;
  lowPower = true;
  layers.glass.children[0].material = materials.glassCheap;
  setLowPower();
}
if (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || (navigator.hardwareConcurrency || 8) <= 4) {
  enableLowPower();
}
// Pause rendering while the solid built-by sheet covers the canvas.
ScrollTrigger.create({
  trigger: '#built-by',
  start: 'top bottom',
  end: 'bottom top',
  onToggle: (self) => setCovered(self.isActive),
});

// Smooth scroll, synced to ScrollTrigger. Native scroll when reduced motion.
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Hero idle spin; scrubbed to 0 once the explode begins, restored at finale.
const spin = { v: reduceMotion ? 0 : MOTION.heroSpin };
const spinHome = reduceMotion ? 0 : MOTION.heroSpin;

buildExplodeTimeline({ layers, camera, spin, spinHome, ledMat: materials.ledOn, reduceMotion });
initAnnotations({ layers, camera });
initChapters({ lenis, reduceMotion });
initForm();

const canHover = matchMedia('(hover: hover)').matches && !isMobile;
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
if (canHover && !reduceMotion) {
  addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });
}

let revealDone = false;
function reveal() {
  if (revealDone) return;
  revealDone = true;
  const wait = Math.max(0, MOTION.loaderMinMs - (performance.now() - bootAt));
  setTimeout(() => {
    loader.classList.add('done');
    document.body.classList.add('is-ready');
    ScrollTrigger.refresh();
    setTimeout(() => loader.remove(), 1000);
  }, wait);
}

let last = performance.now();
let t = 0;
let intro = 0;
let fpsFrames = 0;
let fpsSince = performance.now();
renderer.setAnimationLoop(() => {
  if (!isVisible()) return;
  const now = performance.now();
  const gap = now - last;
  const dt = Math.min(0.05, gap / 1000);
  last = now;
  t += dt;
  intro = Math.min(1, intro + dt * 0.8);
  watch.scale.setScalar(0.94 + 0.06 * intro);

  // Sustained <40fps for 2s → low-power mode. Gap guard avoids false
  // positives after the tab was hidden or the canvas covered.
  fpsFrames += 1;
  if (gap > 250) {
    fpsFrames = 0;
    fpsSince = now;
  } else if (!lowPower && now - fpsSince >= 2000) {
    if (fpsFrames < STAGE.lowFps * 2) enableLowPower();
    fpsFrames = 0;
    fpsSince = now;
  }

  if (!reduceMotion) {
    watch.position.y = Math.sin(t * MOTION.floatSpeed) * MOTION.floatAmp;
    watch.rotation.y += dt * spin.v;
    if (canHover) {
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      const max = (MOTION.parallaxDeg * Math.PI) / 180;
      watch.rotation.x = pointer.y * max * 0.5;
      watch.rotation.z = -pointer.x * max * 0.25;
    }
  }
  renderer.render(scene, camera);
});

// Reveal after first frames + min display time.
requestAnimationFrame(() => requestAnimationFrame(reveal));
addEventListener('load', () => {
  ScrollTrigger.refresh();
  reveal();
});
setTimeout(reveal, 3500);
