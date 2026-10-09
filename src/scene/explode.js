import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ASSEMBLED_Y, EXPLODE, STAGE } from '../config.js';

gsap.registerPlugin(ScrollTrigger);

// ONE master timeline drives every layer + the camera. Scrubbed by scroll.
// Chapters: 0 hero → 1 glass → 2 display → 3 frame → 4 board → 5 power → 6 sensors → 7 reassemble.
export function buildExplodeTimeline({ layers, camera, spin, spinHome, ledMat, reduceMotion }) {
  const D2R = Math.PI / 180;
  const G = EXPLODE.gap;

  // Exploded Y targets: each layer ~0.9 above the one below.
  const explodedY = {
    back: ASSEMBLED_Y.back,
    battery: ASSEMBLED_Y.battery + G,
    haptic: ASSEMBLED_Y.haptic + G,
    board: ASSEMBLED_Y.board + G * 2,
    frame: ASSEMBLED_Y.frame + G * 3,
    display: ASSEMBLED_Y.display + G * 4,
    glass: ASSEMBLED_Y.glass + G * 5,
  };

  const cam = { px: STAGE.cameraPos[0], py: STAGE.cameraPos[1], pz: STAGE.cameraPos[2], tx: 0, ty: STAGE.lookAt[1], tz: 0 };
  const applyCam = () => {
    camera.position.set(cam.px, cam.py, cam.pz);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  };
  applyCam();

  const moveCam = (tl, pos, tgt, dur, at) => {
    tl.to(cam, { px: pos[0], py: pos[1], pz: pos[2], duration: dur, ease: 'power2.out', onUpdate: applyCam }, at);
    tl.to(cam, { tx: tgt[0], ty: tgt[1], tz: tgt[2], duration: dur, ease: 'power2.out', onUpdate: applyCam }, at);
  };

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    scrollTrigger: {
      trigger: '#top',
      start: 'top top',
      end: 'bottom bottom',
      scrub: reduceMotion ? true : 1,
    },
  });

  // — 0. Hero hold, assembled, slow push —
  tl.to({}, { duration: 0.6 });
  moveCam(tl, [3.0, 2.2, 4.1], [0, 0.32, 0], 0.6, 0);

  // — 1. Glass lifts + tilts, crown starts out, spin stops —
  tl.to(spin, { v: 0, duration: 0.4, ease: 'power2.out' }, '>');
  tl.to(layers.glass.position, { y: explodedY.glass, duration: 0.9 }, '<');
  tl.to(layers.glass.rotation, { y: 10 * D2R, duration: 0.9 }, '<');
  tl.to(layers.crown.position, { x: 1.75, duration: 0.9 }, '<');
  moveCam(tl, [2.3, 1.3, 3.5], [0, 1.0, 0], 0.9, '<');
  tl.to({}, { duration: 0.35 }); // stillness beat

  // — 2. Display lifts, straps + crown slide out —
  tl.to(layers.display.position, { y: explodedY.display, duration: 0.9 }, '>');
  tl.to(layers.display.rotation, { y: -8 * D2R, duration: 0.9 }, '<');
  tl.to(layers.strapL.position, { x: -0.55, duration: 0.9 }, '<');
  tl.to(layers.strapR.position, { x: 0.55, duration: 0.9 }, '<');
  tl.to(layers.crown.position, { x: 2.0, duration: 0.9 }, '<');
  moveCam(tl, [0.6, 4.6, 1.6], [0, 1.7, 0], 0.9, '<');
  tl.to({}, { duration: 0.35 });

  // — 3. Frame lifts, gasket rides along —
  tl.to(layers.frame.position, { y: explodedY.frame, duration: 0.9 }, '>');
  tl.to(layers.frame.rotation, { y: 7 * D2R, duration: 0.9 }, '<');
  moveCam(tl, [3.6, 2.6, 5.2], [0, 1.9, 0], 0.9, '<');
  tl.to({}, { duration: 0.35 });

  // — 4. Mainboard lifts. Longest beat, push-in toward SoC —
  tl.to(layers.board.position, { y: explodedY.board, duration: 1.2 }, '>');
  tl.to(layers.board.rotation, { y: -10 * D2R, duration: 1.2 }, '<');
  moveCam(tl, [0.9, 3.6, 2.0], [-0.1, 2.1, -0.2], 0.7, '<');
  moveCam(tl, [0.3, 2.9, 1.15], [-0.1, 2.12, -0.2], 0.6, '>');
  tl.to({}, { duration: 0.4 });

  // — 5. Battery + haptic lift. Side-on, layer gaps —
  tl.to(layers.battery.position, { y: explodedY.battery, duration: 0.9 }, '>');
  tl.to(layers.battery.rotation, { y: 6 * D2R, duration: 0.9 }, '<');
  tl.to(layers.haptic.position, { y: explodedY.haptic + 0.12, duration: 0.9 }, '<');
  tl.to(layers.haptic.rotation, { y: -8 * D2R, duration: 0.9 }, '<');
  moveCam(tl, [5.6, 1.6, 1.6], [0, 2.3, 0], 0.9, '<');
  tl.to({}, { duration: 0.35 });

  // — 6. Sensors: orbit under the back case, LEDs pulse —
  tl.to(layers.strapL.position, { x: -1.1, duration: 0.8 }, '>');
  tl.to(layers.strapR.position, { x: 1.1, duration: 0.8 }, '<');
  tl.to(layers.crown.position, { x: 2.3, duration: 0.8 }, '<');
  moveCam(tl, [-2.2, -2.4, 3.6], [0, 0.1, 0], 1.0, '<');
  tl.to(ledMat, { emissiveIntensity: 5, duration: 0.3, ease: 'power2.out' }, '<+0.3');
  tl.to(ledMat, { emissiveIntensity: 2.4, duration: 0.3, ease: 'power2.in' }, '>');
  tl.to(ledMat, { emissiveIntensity: 5, duration: 0.3, ease: 'power2.out' }, '>');
  tl.to(ledMat, { emissiveIntensity: 2.4, duration: 0.3, ease: 'power2.in' }, '>');
  tl.to({}, { duration: 0.4 });

  // — 7. Reassemble: everything home, camera to hero —
  const home = '>';
  tl.to(layers.glass.position, { y: ASSEMBLED_Y.glass, duration: 1.0, ease: 'back.inOut(1.1)' }, home);
  tl.to(layers.glass.rotation, { y: 0, duration: 1.0, ease: 'back.inOut(1.1)' }, '<');
  tl.to(layers.display.position, { y: ASSEMBLED_Y.display, duration: 1.0, ease: 'back.inOut(1.1)' }, '<+0.08');
  tl.to(layers.display.rotation, { y: 0, duration: 1.0 }, '<');
  tl.to(layers.frame.position, { y: ASSEMBLED_Y.frame, duration: 1.0, ease: 'back.inOut(1.1)' }, '<+0.08');
  tl.to(layers.frame.rotation, { y: 0, duration: 1.0 }, '<');
  tl.to(layers.board.position, { y: ASSEMBLED_Y.board, duration: 1.0, ease: 'back.inOut(1.1)' }, '<+0.08');
  tl.to(layers.board.rotation, { y: 0, duration: 1.0 }, '<');
  tl.to(layers.battery.position, { y: ASSEMBLED_Y.battery, duration: 1.0, ease: 'back.inOut(1.1)' }, '<+0.08');
  tl.to(layers.battery.rotation, { y: 0, duration: 1.0 }, '<');
  tl.to(layers.haptic.position, { x: 0.85, y: ASSEMBLED_Y.haptic, z: 0.25, duration: 1.0 }, '<');
  tl.to(layers.haptic.rotation, { y: 0, duration: 1.0 }, '<');
  tl.to(layers.crown.position, { x: 1.42, duration: 1.0 }, '<');
  tl.to(layers.strapL.position, { x: 0, duration: 1.0 }, '<');
  tl.to(layers.strapR.position, { x: 0, duration: 1.0 }, '<');
  moveCam(tl, STAGE.cameraPos, [0, STAGE.lookAt[1], 0], 1.2, home);
  tl.to(spin, { v: spinHome, duration: 0.6, ease: 'power2.out' }, '<+0.5');

  return tl;
}
