import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ASSEMBLED_Y } from '../config.js';

const SEG = 64; // circle segments (modest for phones)

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

// Builds every layer as its own Group. Stack axis = Y, face up.
export function buildWatch(M) {
  const group = new THREE.Group();
  const layers = {};

  // 1 — Back case + sensor array (assembled y 0.00)
  {
    const g = new THREE.Group();
    const shellPts = [];
    shellPts.push(new THREE.Vector2(0.001, -0.1));
    shellPts.push(new THREE.Vector2(1.05, -0.1));
    shellPts.push(new THREE.Vector2(1.28, -0.02));
    shellPts.push(new THREE.Vector2(1.32, 0.06));
    shellPts.push(new THREE.Vector2(1.28, 0.1));
    shellPts.push(new THREE.Vector2(0.001, 0.1));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(shellPts, SEG), M.ceramic));
    // sensor window (underside)
    const win = mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.03, SEG), M.sensorGlass, 0, -0.1, 0);
    const ring = mesh(new THREE.TorusGeometry(0.52, 0.035, 16, SEG), M.lensRing, 0, -0.1, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(win, ring);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      g.add(mesh(new THREE.SphereGeometry(0.055, 16, 16), M.ledOn, Math.cos(a) * 0.28, -0.115, Math.sin(a) * 0.28));
    }
    g.add(mesh(new THREE.SphereGeometry(0.09, 24, 24), M.sensorGlass, 0, -0.115, 0));
    g.position.y = ASSEMBLED_Y.back;
    group.add(g);
    layers.back = g;
  }

  // 2 — Battery (0.14)
  {
    const g = new THREE.Group();
    const cell = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.16, 1.1, 4, 0.06), M.foil);
    g.add(cell);
    g.position.set(-0.25, ASSEMBLED_Y.battery, 0);
    group.add(g);
    layers.battery = g;
  }

  // 3 — Haptic motor beside battery (0.14)
  {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 48), M.motor));
    const ring = mesh(new THREE.TorusGeometry(0.24, 0.025, 12, 48), M.motorRing, 0, 0.05, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    g.position.set(0.85, ASSEMBLED_Y.haptic, 0.25);
    group.add(g);
    layers.haptic = g;
  }

  // 4 — Mainboard with chips (0.30)
  {
    const g = new THREE.Group();
    const board = new THREE.Mesh(new RoundedBoxGeometry(1.9, 0.05, 1.7, 4, 0.04), M.pcbTop);
    g.add(board);
    const chipSizes = [[0.5, 0.5], [0.34, 0.3], [0.3, 0.42], [0.24, 0.24], [0.4, 0.22], [0.2, 0.28], [0.26, 0.2]];
    chipSizes.forEach(([w, d], i) => {
      const h = 0.07 + (i % 3) * 0.02;
      const cx = -0.65 + (i % 3) * 0.55 + (i > 4 ? 0.15 : 0);
      const cz = -0.45 + Math.floor(i / 3) * 0.5;
      if (i === 0) {
        g.add(mesh(new THREE.BoxGeometry(w, h, d), M.chip, -0.1, 0.06 + h / 2, -0.2));
        g.add(mesh(new THREE.BoxGeometry(w * 0.96, 0.015, d * 0.96), M.socTop, -0.1, 0.06 + h + 0.008, -0.2));
      } else {
        g.add(mesh(new THREE.BoxGeometry(w, h, d), M.chip, cx, 0.06 + h / 2, cz));
      }
    });
    // gold pads
    for (let i = 0; i < 6; i++) {
      g.add(mesh(new THREE.BoxGeometry(0.12, 0.012, 0.06), M.gold, 0.75, 0.035, -0.6 + i * 0.18));
    }
    g.position.y = ASSEMBLED_Y.board;
    group.add(g);
    layers.board = g;
  }

  // 5 — Display frame: titanium ring + dark gasket (0.46)
  {
    const g = new THREE.Group();
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.42, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 1.22, 0, Math.PI * 2, true);
    ringShape.holes.push(hole);
    const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: SEG });
    ringGeo.rotateX(-Math.PI / 2);
    g.add(new THREE.Mesh(ringGeo, M.titanium));
    const gasket = mesh(new THREE.TorusGeometry(1.22, 0.028, 12, SEG), M.gasket, 0, 0.1, 0);
    gasket.rotation.x = Math.PI / 2;
    g.add(gasket);
    g.position.y = ASSEMBLED_Y.frame;
    group.add(g);
    layers.frame = g;
  }

  // 6 — OLED display (0.54)
  {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.05, SEG),
      [M.displaySide, M.displayFace, M.displaySide]
    );
    // CylinderGeometry groups: side, top, bottom — top (index 1) is the face.
    g.add(disc);
    g.position.y = ASSEMBLED_Y.display;
    group.add(g);
    layers.display = g;
  }

  // 7 — Sapphire glass, slightly domed (0.62)
  {
    const g = new THREE.Group();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.32, SEG, 16, 0, Math.PI * 2, 0, 0.42), M.glass);
    dome.scale.y = 0.35;
    dome.position.y = -0.28;
    g.add(dome);
    const edge = mesh(new THREE.TorusGeometry(1.28, 0.02, 8, SEG), M.titanium, 0, -0.28, 0);
    edge.rotation.x = Math.PI / 2;
    g.add(edge);
    g.position.y = ASSEMBLED_Y.glass;
    group.add(g);
    layers.glass = g;
  }

  // 8 — Crown + side button (right side, slides +X on explode)
  {
    const g = new THREE.Group();
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xc9ccd4, metalness: 1, roughness: 0.32,
      bumpMap: M.knurlBump, bumpScale: 0.6,
    });
    const crown = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 32), crownMat, 0, 0, 0);
    crown.rotation.z = Math.PI / 2;
    const stem = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 16), M.motorRing, -0.16, 0, 0);
    stem.rotation.z = Math.PI / 2;
    const btn = mesh(new RoundedBoxGeometry(0.1, 0.14, 0.3, 2, 0.03), M.titanium, -0.05, -0.34, 0);
    g.add(crown, stem, btn);
    g.position.set(1.42, ASSEMBLED_Y.crown, 0);
    group.add(g);
    layers.crown = g;
  }

  // 9 — Straps slide outward along X
  {
    const mk = (side) => {
      const g = new THREE.Group();
      const band = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.09, 0.95, 4, 0.045), M.strap);
      band.position.x = side * 1.05;
      band.rotation.z = side * -0.1;
      const lug = mesh(new THREE.BoxGeometry(0.3, 0.12, 0.9), M.titanium, side * 0.35, 0, 0);
      const keeper = mesh(new THREE.TorusGeometry(0.42, 0.045, 10, 32), M.strap, side * 1.5, 0.02, 0);
      keeper.rotation.y = Math.PI / 2;
      g.add(band, lug, keeper);
      g.position.y = 0.1;
      group.add(g);
      return g;
    };
    layers.strapL = mk(-1);
    layers.strapR = mk(1);
  }

  return { group, layers };
}
