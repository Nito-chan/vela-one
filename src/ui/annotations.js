import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COPY } from '../config.js';

// One HTML annotation per layer (chapters 1–6): accent dot + 1px leader
// line + label, projected from 3D each frame. Mobile: fixed slot, no line.
const DEFS = [
  { chapter: 1, layer: 'glass', at: [1.34, -0.05, 0.35], side: 'l' },
  { chapter: 2, layer: 'display', at: [1.22, 0.06, 0.3], side: 'r' },
  { chapter: 3, layer: 'frame', at: [1.44, 0.12, -0.2], side: 'l' },
  { chapter: 4, layer: 'board', at: [-0.1, 0.22, -0.2], side: 'r' },
  { chapter: 5, layer: 'battery', at: [0.55, 0.12, 0.3], side: 'l' },
  { chapter: 6, layer: 'back', at: [0.28, -0.16, 0.28], side: 'r' },
];

export function initAnnotations({ layers, camera }) {
  const root = document.getElementById('annotations');
  const mqMobile = matchMedia('(max-width: 700px), (pointer: coarse)');
  const v = new THREE.Vector3();
  let active = 0;

  const items = DEFS.map((d) => {
    const anchor = new THREE.Object3D();
    anchor.position.set(...d.at);
    layers[d.layer].add(anchor);
    const [name, spec] = COPY.chapters[d.chapter - 1].anno;
    const el = document.createElement('div');
    el.className = `anno side-${d.side}`;
    el.innerHTML = `<i class="dot"></i><i class="leader"></i><span class="tag"><b>${name}</b><em>${spec}</em></span>`;
    root.appendChild(el);
    return { ...d, anchor, el };
  });

  // Chapter sections own the fade window (~30% in, out near end).
  document.querySelectorAll('.chapter[data-chapter]').forEach((sec) => {
    const n = Number(sec.dataset.chapter);
    if (n < 1 || n > 6) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 70%',
      end: 'bottom 35%',
      onToggle: (self) => {
        if (self.isActive) {
          active = n;
          items.forEach((it) => it.el.classList.toggle('is-active', it.chapter === n));
        } else if (active === n) {
          active = 0;
          items.forEach((it) => it.el.classList.remove('is-active'));
        }
      },
    });
  });

  // Only the active annotation is projected; the rest stay hidden (CSS handles fade).
  const tick = () => {
    const it = items.find((i) => i.chapter === active);
    if (it) {
      it.anchor.getWorldPosition(v);
      v.project(camera);
      if (v.z < 1) {
        const x = (v.x * 0.5 + 0.5) * innerWidth;
        const y = (-v.y * 0.5 + 0.5) * innerHeight;
        if (mqMobile.matches) {
          it.el.style.transform = `translate(-50%, 0) translate(${(innerWidth / 2).toFixed(1)}px, ${(innerHeight * 0.42).toFixed(1)}px)`;
        } else {
          it.el.style.transform = `translate(0, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        }
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
