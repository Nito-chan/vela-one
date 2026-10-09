import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ASSEMBLED_Y, PALETTE, STAGE } from '../config.js';
import { makeContactShadowTexture } from './materials.js';

export function createStage(canvas) {
  const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(new THREE.Color(PALETTE.bg), 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = STAGE.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.bg);

  const camera = new THREE.PerspectiveCamera(STAGE.fov, 1, 0.1, 60);
  camera.position.set(...STAGE.cameraPos);
  camera.lookAt(...STAGE.lookAt);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(3, 5, 2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fb3ff, 1.4);
  rim.position.set(-4, 2.5, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));

  // Cheap soft contact shadow (no shadow maps).
  const shadowTex = makeContactShadowTexture();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = ASSEMBLED_Y.back - 0.42;
  scene.add(shadow);

  let prCap = isMobile ? STAGE.pixelRatioMobile : STAGE.pixelRatioDesktop;
  let lowPower = false;

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? STAGE.pixelRatioLow : prCap));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep watch fitting width with 16px margins on narrow screens.
    camera.zoom = w < 700 ? Math.max(0.62, w / 700) : 1;
    if (w < 700) {
      // Shift the watch into the top ~60% so it clears the bottom text zone.
      camera.setViewOffset(w, h, 0, -h * 0.13, w, h);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  let visible = true;
  let covered = false; // true while the solid built-by sheet covers the canvas
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
  });

  return {
    renderer, scene, camera, isMobile,
    isVisible: () => visible && !covered,
    setCovered: (v) => { covered = v; },
    setLowPower: () => { lowPower = true; resize(); },
  };
}
