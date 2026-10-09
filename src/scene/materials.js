import * as THREE from 'three';
import { PALETTE } from '../config.js';

function canvasTex(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function makeContactShadowTexture() {
  return canvasTex(256, (g, s) => {
    const grad = g.createRadialGradient(s / 2, s / 2, 10, s / 2, s / 2, s / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  });
}

function pcbTexture() {
  return canvasTex(1024, (g, s) => {
    g.fillStyle = '#0b1a14';
    g.fillRect(0, 0, s, s);
    // faint solder-mask noise
    g.fillStyle = 'rgba(255,255,255,0.02)';
    for (let i = 0; i < 400; i++) g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    // right-angle traces
    for (let i = 0; i < 220; i++) {
      const teal = Math.random() > 0.35;
      g.strokeStyle = teal ? 'rgba(64,190,170,0.5)' : 'rgba(212,175,105,0.55)';
      g.lineWidth = Math.random() > 0.8 ? 3 : 1.5;
      g.beginPath();
      let x = Math.random() * s, y = Math.random() * s;
      g.moveTo(x, y);
      for (let k = 0; k < 3; k++) {
        if (Math.random() > 0.5) x += (Math.random() - 0.5) * 220;
        else y += (Math.random() - 0.5) * 220;
        g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = teal ? 'rgba(64,190,170,0.8)' : 'rgba(212,175,105,0.9)';
      g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
    }
    // component outlines
    g.strokeStyle = 'rgba(255,255,255,0.22)';
    g.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const w = 60 + Math.random() * 140, h = 40 + Math.random() * 90;
      g.strokeRect(Math.random() * (s - w), Math.random() * (s - h), w, h);
    }
  });
}

function watchFaceTexture() {
  return canvasTex(1024, (g, s) => {
    const c = s / 2;
    g.fillStyle = '#000';
    g.fillRect(0, 0, s, s);
    // 60 ticks
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const big = i % 5 === 0;
      g.strokeStyle = big ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)';
      g.lineWidth = big ? 7 : 3;
      const r1 = big ? c - 70 : c - 46, r2 = c - 26;
      g.beginPath();
      g.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
      g.lineTo(c + Math.cos(a) * r2, c + Math.sin(a) * r2);
      g.stroke();
    }
    // complications
    g.strokeStyle = PALETTE.accent;
    g.lineWidth = 5;
    [[c - 190, c + 60, 74], [c + 190, c + 60, 74], [c, c - 230, 60]].forEach(([x, y, r]) => {
      g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    });
    // time 10:09
    g.fillStyle = '#fff';
    g.font = '600 210px Inter, system-ui, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('10:09', c, c + 40);
    // seconds hand
    g.strokeStyle = PALETTE.accent;
    g.lineWidth = 8;
    g.beginPath(); g.moveTo(c, c); g.lineTo(c + 250, c - 190); g.stroke();
    g.fillStyle = PALETTE.accent;
    g.beginPath(); g.arc(c, c, 14, 0, 7); g.fill();
  });
}

function batteryLabelTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c9ccd2'; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#6b6f76'; g.fillRect(0, 0, 512, 54);
  g.fillStyle = '#1a1b1e'; g.font = '600 44px Inter, system-ui, sans-serif';
  g.fillText('VELA CELL', 28, 112);
  g.font = '400 30px Inter, system-ui, sans-serif';
  g.fillStyle = '#3a3d42';
  g.fillText('3.87V  2.1Wh  STACKED', 28, 162);
  g.fillText('SN 09-27 · DO NOT BEND', 28, 204);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function knurlBumpTexture() {
  const t = canvasTex(256, (g, s) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#fff';
    for (let x = 0; x < s; x += 16) for (let y = 0; y < s; y += 16) {
      g.save(); g.translate(x + 8, y + 8); g.rotate(Math.PI / 4);
      g.fillRect(-5, -5, 10, 10); g.restore();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 1);
  return t;
}

export function createMaterials() {
  const pcb = pcbTexture();
  const face = watchFaceTexture();
  return {
    titanium: new THREE.MeshPhysicalMaterial({ color: 0xb8bcc4, metalness: 1, roughness: 0.28 }),
    gasket: new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.7, metalness: 0.1 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0x17171b, metalness: 0.2, roughness: 0.35, clearcoat: 1 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.02,
      transmission: 1, thickness: 0.05, ior: 1.5, transparent: true,
    }),
    glassCheap: new THREE.MeshPhysicalMaterial({
      color: 0xcfe6ff, metalness: 0, roughness: 0.05,
      transparent: true, opacity: 0.18, clearcoat: 1,
    }),
    pcbTop: new THREE.MeshStandardMaterial({
      map: pcb, emissiveMap: pcb, emissive: new THREE.Color(0x9ff5e4),
      emissiveIntensity: 0.14, roughness: 0.55, metalness: 0.25,
    }),
    pcbBase: new THREE.MeshStandardMaterial({ color: 0x0b1a14, roughness: 0.6 }),
    chip: new THREE.MeshStandardMaterial({ color: 0x101014, roughness: 0.4, metalness: 0.4 }),
    socTop: new THREE.MeshStandardMaterial({ color: 0xd7dae0, roughness: 0.25, metalness: 1 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd4af69, roughness: 0.3, metalness: 1 }),
    foil: new THREE.MeshStandardMaterial({ map: batteryLabelTexture(), roughness: 0.35, metalness: 0.7 }),
    motor: new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.3, metalness: 1 }),
    motorRing: new THREE.MeshStandardMaterial({ color: 0x2a2b30, roughness: 0.5, metalness: 0.6 }),
    strap: new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.9, metalness: 0 }),
    lensRing: new THREE.MeshStandardMaterial({ color: 0x2e3138, roughness: 0.3, metalness: 0.9 }),
    sensorGlass: new THREE.MeshPhysicalMaterial({ color: 0x0a0f0a, roughness: 0.1, metalness: 0.2, clearcoat: 1 }),
    ledOn: new THREE.MeshStandardMaterial({ color: 0x061006, emissive: new THREE.Color(0x2bff6a), emissiveIntensity: 2.4 }),
    displayFace: new THREE.MeshStandardMaterial({
      color: 0x000000, emissive: new THREE.Color(0xffffff),
      emissiveMap: face, map: face, emissiveIntensity: 1.4, roughness: 0.4,
    }),
    displaySide: new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.5 }),
    knurlBump: knurlBumpTexture(),
  };
}
