import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from '../config.js';

gsap.registerPlugin(ScrollTrigger);

// Line reveals (masked rise, 0.08s stagger, once), progress rail, nav blur.
export function initChapters({ lenis, reduceMotion }) {
  const reduce = reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Wrap each headline line for masked reveals.
  document.querySelectorAll('.reveal').forEach((h) => {
    const lines = h.querySelectorAll(':scope > span');
    const targets = lines.length ? [...lines] : [h];
    // If h has no spans, wrap its text nodes.
    if (!lines.length) {
      h.innerHTML = `<span class="line"><span class="line-inner">${h.innerHTML}</span></span>`;
    } else {
      lines.forEach((s) => {
        const mask = document.createElement('span');
        mask.className = 'line';
        s.replaceWith(mask);
        mask.appendChild(s);
        s.classList.add('line-inner');
      });
    }
    const inners = h.querySelectorAll('.line-inner');
    const fades = h.parentElement.querySelectorAll(':scope > .fade');
    if (reduce) return; // simple visible state, no motion
    gsap.set(inners, { yPercent: 110 });
    gsap.set(fades, { opacity: 0, y: 18 });
    const isHero = h.closest('.hero');
    ScrollTrigger.create({
      trigger: h,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline({ delay: isHero ? MOTION.loaderMinMs / 1000 + 0.15 : 0 });
        tl.to(inners, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 });
        tl.to(fades, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.1 }, '-=0.55');
      },
    });
  });

  // Progress rail: 7 dots for chapters 1–7, click scrolls via Lenis.
  const dots = [...document.querySelectorAll('.rail button')];
  const goTo = (n) => {
    const sec = document.querySelector(`[data-chapter="${n}"]`);
    if (!sec) return;
    if (lenis) lenis.scrollTo(sec, { offset: 0, duration: 1.6 });
    else sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  dots.forEach((d) => d.addEventListener('click', () => goTo(Number(d.dataset.target))));

  document.querySelectorAll('[data-chapter]').forEach((sec) => {
    const n = Number(sec.dataset.chapter);
    if (n < 1) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) dots.forEach((d) => d.classList.toggle('is-active', Number(d.dataset.target) === n));
      },
    });
  });

  // Nav becomes a blurred bar after the hero.
  const nav = document.querySelector('.nav');
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'bottom 90%',
    onEnter: () => nav.classList.add('is-scrolled'),
    onLeaveBack: () => nav.classList.remove('is-scrolled'),
  });

  return { goTo };
}
