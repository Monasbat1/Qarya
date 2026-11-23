// مجسّمات المتجر: أثاث داخلي، سيارات، عناصر الحوش، والشخصيات. نفس أسلوب البيوت (ألوان على الرؤوس).
// الأثاث: مركزه منتصف مساحته (w×d بالمتر) والأرض y=0، والواجهة باتجاه +z.
import * as THREE from 'three';
import { Builder } from './houses.js';

const C = {
  wood: 0x9a6b42, woodD: 0x6b4a32, woodL: 0xc9a274, white: 0xf3f0e8, dark: 0x2a2d33, metal: 0xaab2bb,
  leaf: 0x3f8f45, leaf2: 0x5aa84e, pot: 0xc0704a, gold: 0xd9b23c, red: 0xb83a32, glass: 0x9fd3ea, screen: 0x1b2430,
};

// ---------- الأثاث ----------
const FURN = {
  plant(b) { b.cyl(0.22, 0.17, 0.4, 0, 0, 0, C.pot, 10); b.ball(0.36, 0, 0.7, 0, C.leaf, 1); b.ball(0.25, 0.12, 1.0, -0.05, C.leaf2, 1); },
  bakhoor(b) { b.cyl(0.18, 0.14, 0.3, 0, 0, 0, C.gold, 8); b.cyl(0.08, 0.16, 0.25, 0, 0.3, 0, C.woodD, 8); b.ball(0.07, 0, 0.62, 0, 0xdddddd); },
  rug(b) { b.box(2.8, 0.03, 1.8, 0, 0, 0, 0x9b2f35); b.box(2.4, 0.032, 1.4, 0, 0, 0, 0xd9b26a); b.box(1.6, 0.034, 0.7, 0, 0, 0, 0x2f4a6b); },
  dallah(b) {
    b.box(0.8, 0.35, 0.8, 0, 0, 0, C.woodD);
    b.cyl(0.11, 0.14, 0.24, -0.12, 0.35, 0, C.gold, 10); b.cyl(0.03, 0.08, 0.1, -0.12, 0.59, 0, C.gold, 8);
    b.slab(0.2, 0.04, 0.04, 0.02, 0.5, 0, C.gold, { rz: 0.6 });
    for (const [x, z] of [[0.18, 0.15], [0.25, -0.1], [0.08, -0.22]]) b.cyl(0.045, 0.035, 0.06, x, 0.35, z, C.white, 8);
  },
  fridge(b) { b.box(0.8, 1.85, 0.75, 0, 0, 0, 0xe9ecef); b.box(0.8, 0.02, 0.02, 0, 1.2, 0.38, 0xb8bec6); b.box(0.04, 0.5, 0.05, 0.3, 1.3, 0.39, C.metal); b.box(0.04, 0.4, 0.05, 0.3, 0.6, 0.39, C.metal); },
  bookshelf(b) {
    b.box(1.8, 1.9, 0.4, 0, 0, -0.25, C.wood);
    const cols = [0xc0392b, 0x2f6fb5, 0x2e7d4f, 0xd9a520, 0x7d3c98, 0xe8e2d0];
    for (let s = 0; s < 4; s++) for (let i = 0; i < 9; i++) b.box(0.12, 0.3 + ((i * 7 + s) % 3) * 0.04, 0.26, -0.75 + i * 0.18, 0.12 + s * 0.45, -0.18, cols[(i + s) % cols.length]);
  },
  sofa(b) {
    b.box(1.9, 0.42, 0.85, 0, 0, 0, 0x4c6a8a); b.box(1.9, 0.5, 0.22, 0, 0.42, -0.32, 0x4c6a8a);
    for (const s of [-1, 1]) b.box(0.2, 0.62, 0.85, s * 0.95, 0, 0, 0x3e5a76);
    for (const s of [-0.45, 0.45]) b.box(0.85, 0.12, 0.6, s, 0.42, 0.08, 0x6286ab);
  },
  bed(b) {
    b.box(1.6, 0.35, 1.95, 0, 0, 0, C.woodL); b.box(1.5, 0.2, 1.85, 0, 0.35, 0, C.white);
    b.box(1.5, 0.08, 1.2, 0, 0.55, 0.3, 0x5b7fa6); b.box(1.7, 1.0, 0.12, 0, 0, -0.95, C.wood);
    for (const s of [-0.38, 0.38]) b.box(0.6, 0.14, 0.35, s, 0.55, -0.62, 0xf7f3ea);
  },
  dining(b) {
    b.box(1.3, 0.06, 0.9, 0, 0.72, 0, C.woodL); for (const [x, z] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) b.box(0.07, 0.72, 0.07, x, 0, z, C.woodD);
    for (const [x, z, ry] of [[-0.35, -0.75, 0], [0.35, -0.75, 0], [-0.35, 0.75, Math.PI], [0.35, 0.75, Math.PI]]) {
      b.box(0.42, 0.06, 0.42, x, 0.44, z, C.wood); b.box(0.42, 0.5, 0.05, x, 0.47, z + (ry ? 0.19 : -0.19), C.wood);
      for (const dx of [-0.17, 0.17]) for (const dz of [-0.17, 0.17]) b.box(0.04, 0.44, 0.04, x + dx, 0, z + dz, C.woodD);
    }
    b.cyl(0.08, 0.06, 0.18, 0, 0.78, 0, 0x2f6fb5, 8);
  },
  majlis(b) {
    b.box(2.9, 0.18, 0.8, 0, 0, 0, 0x8c2f2f); b.box(2.9, 0.22, 0.8, 0, 0.18, 0, 0xb5463f);
    b.box(2.9, 0.5, 0.2, 0, 0.25, -0.32, 0x8c2f2f);
    for (let i = 0; i < 4; i++) b.box(0.55, 0.4, 0.14, -1.1 + i * 0.73, 0.45, -0.18, i % 2 ? 0xd9b26a : 0x2f4a6b);
    for (const s of [-1, 1]) b.box(0.25, 0.3, 0.6, s * 1.32, 0.4, 0.05, 0xd9b26a);
  },
  tv(b) { b.box(1.8, 0.45, 0.45, 0, 0, -0.1, C.woodD); b.box(1.5, 0.85, 0.06, 0, 0.62, -0.2, C.dark); b.box(1.4, 0.76, 0.02, 0, 0.665, -0.165, C.screen); b.box(0.3, 0.17, 0.06, 0, 0.45, -0.2, C.dark); },
  kitchen(b) {
    b.box(2.9, 0.9, 0.65, 0, 0, -0.15, 0xf0ece4); b.box(3.0, 0.05, 0.7, 0, 0.9, -0.15, 0x6b6f75);
    b.box(0.6, 0.02, 0.4, -0.7, 0.95, -0.15, C.metal); b.cyl(0.03, 0.03, 0.3, -0.7, 0.95, -0.4, C.metal, 6);
    for (const x of [0.6, 0.95]) b.cyl(0.13, 0.13, 0.02, x, 0.95, -0.15, C.dark, 12);
    b.box(2.9, 0.7, 0.35, 0, 1.55, -0.3, 0xe2dccf);
    for (let i = 0; i < 4; i++) b.box(0.04, 0.12, 0.03, -1.1 + i * 0.73, 0.65, 0.18, C.metal);
  },
  gaming(b) {
    b.box(1.6, 0.05, 0.7, 0, 0.72, -0.1, C.dark); for (const s of [-1, 1]) b.box(0.05, 0.72, 0.65, s * 0.75, 0, -0.1, C.dark);
    for (const x of [-0.42, 0.42]) { b.box(0.7, 0.42, 0.04, x, 0.85, -0.35, C.dark); b.box(0.66, 0.38, 0.02, x, 0.87, -0.33, x < 0 ? 0x5b3db8 : 0x2a8fd1); }
    b.box(0.45, 0.02, 0.15, 0, 0.77, 0.05, 0x333333); b.box(0.6, 0.08, 0.6, 0, 0.42, 0.55, 0xc0392b); b.box(0.6, 0.75, 0.1, 0, 0.5, 0.82, 0xc0392b); b.cyl(0.04, 0.04, 0.42, 0, 0, 0.55, C.dark, 6);
  },
  aquarium(b) { b.box(1.8, 0.75, 0.6, 0, 0, -0.1, C.woodD); b.box(1.7, 0.75, 0.5, 0, 0.75, -0.1, 0x6fc3e0); b.box(1.72, 0.05, 0.52, 0, 1.5, -0.1, C.dark);
    for (const [x, y, c] of [[-0.4, 1.0, 0xf08a2a], [0.2, 1.2, 0xffd84a], [0.5, 0.95, 0xd9567a]]) b.slab(0.16, 0.08, 0.04, x, y, 0.1, c);
    for (const x of [-0.6, 0.1, 0.6]) b.cyl(0.02, 0.06, 0.35, x, 0.75, -0.2, C.leaf, 5); },
  piano(b) { b.box(1.55, 1.25, 0.6, 0, 0, -0.2, 0x15171a); b.box(1.55, 0.06, 0.32, 0, 0.72, 0.22, 0x15171a); b.box(1.4, 0.03, 0.2, 0, 0.75, 0.24, 0xf7f7f2);
    for (let i = 0; i < 14; i++) b.box(0.04, 0.02, 0.12, -0.6 + i * 0.095, 0.78, 0.2, 0x111111); b.box(0.9, 0.45, 0.35, 0, 0, 0.75, 0x15171a); },
};

const furnCache = new Map();
export function furnitureGeometry(id) {
  if (!furnCache.has(id)) { const b = new Builder(); (FURN[id] || FURN.plant)(b); furnCache.set(id, b.build()); }
  return furnCache.get(id);
}

// ---------- السيارات: طولها على z والمقدمة باتجاه +z ----------
// كل سيارة لها مقطع جانبي حقيقي (كبوت، زجاج مائل، سقف، شنطة) يُبثق على عرضها بحواف مدوّرة.
const GLASS = 0x1d2833, TIRE = 0x161718, RIM = 0xc9ced4, TRIM = 0x26292e, CHROME = 0xdfe3e7;
function side(b, pts, w, color, bevel = 0.05) {
  const s = new THREE.Shape();
  pts.forEach(([z, y], i) => (i ? s.lineTo(-z, y) : s.moveTo(-z, y)));
  const depth = Math.max(0.01, w - 2 * bevel);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 });
  b.add(g, color, { ry: Math.PI / 2, x: -depth / 2 });
}
function wheel(b, x, z, r, w = 0.26) {
  b.add(new THREE.CylinderGeometry(r, r, w, 18), TIRE, { rz: Math.PI / 2, x, y: r, z });
  b.add(new THREE.CylinderGeometry(r * 0.62, r * 0.62, w + 0.02, 12), RIM, { rz: Math.PI / 2, x, y: r, z });
  b.add(new THREE.CylinderGeometry(r * 0.2, r * 0.2, w + 0.04, 8), TRIM, { rz: Math.PI / 2, x, y: r, z });
}
function car(b, c, s) {
  const { L, W, R } = s, half = W / 2, front = L / 2;
  side(b, s.body, W, c);
  side(b, s.glass, W * 0.9, GLASS, 0.02);
  side(b, s.roof, W * 0.93, c, 0.03);
  const top = Math.max(...s.glass.map((p) => p[1])), gb = Math.min(...s.glass.map((p) => p[1]));
  if (s.bz !== undefined) b.box(W * 0.91, top - gb, 0.1, 0, gb, s.bz, c);                       // العمود الأوسط
  for (const x of [-1, 1]) {
    wheel(b, x * (half - 0.12), s.axF, R); wheel(b, x * (half - 0.12), s.axR, R);
    b.box(0.08, 0.1, 0.22, x * (half + 0.06), s.belt - 0.02, s.mz, c);                             // المرايات
    b.box(0.04, 0.09, 0.2, x * (half + 0.09), s.belt - 0.02, s.mz, TRIM);
    for (const z of s.doors) b.box(0.012, s.belt - s.sill, 0.02, x * (half + 0.005), s.sill, z, TRIM); // خطوط الأبواب
    for (const z of s.handles || []) b.box(0.03, 0.04, 0.16, x * (half + 0.02), s.belt - 0.16, z, CHROME);
    // الأنوار الأمامية والخلفية
    b.box(W * 0.24, 0.12, 0.06, x * W * 0.32, s.lightY, front - 0.04, s.round ? CHROME : 0xfff4d2);
    b.box(W * 0.22, 0.12, 0.06, x * W * 0.33, s.lightY + 0.02, -front + 0.03, 0xc81e1e);
  }
  b.box(W * 0.36, 0.14, 0.06, 0, s.lightY - 0.04, front - 0.03, s.grille ?? TRIM);                 // الشبك
  const bump = s.chrome ? CHROME : TRIM;
  b.box(W + 0.04, 0.16, 0.14, 0, s.bumperY, front - 0.02, bump);
  b.box(W + 0.04, 0.16, 0.14, 0, s.bumperY, -front + 0.02, bump);
  b.box(0.44, 0.13, 0.03, 0, s.bumperY + 0.18, front + 0.03, 0xf4f4f0);                            // اللوحات
  b.box(0.44, 0.13, 0.03, 0, s.bumperY + 0.2, -front - 0.03, 0xf4f4f0);
}
const CARS = {
  sedan: (b, c) => car(b, c, {
    L: 4.6, W: 1.8, R: 0.33, axF: 1.4, axR: -1.38, lightY: 0.64, bumperY: 0.3, belt: 0.88, sill: 0.36, bz: -0.36, mz: 0.82, doors: [0.86, -0.36, -1.45], handles: [0.2, -0.95],
    body: [[-2.3, 0.28], [2.3, 0.28], [2.33, 0.58], [2.2, 0.74], [1.0, 0.86], [-1.45, 0.9], [-2.25, 0.86], [-2.33, 0.6]],
    glass: [[0.98, 0.84], [0.22, 1.36], [-0.95, 1.38], [-1.58, 0.88]],
    roof: [[0.24, 1.34], [-0.95, 1.36], [-0.97, 1.42], [0.2, 1.4]],
  }),
  luxury: (b, c) => car(b, c, {
    L: 5.2, W: 1.92, R: 0.36, axF: 1.62, axR: -1.62, lightY: 0.66, bumperY: 0.32, belt: 0.95, sill: 0.4, bz: -0.42, mz: 0.98, doors: [1.02, -0.42, -1.55], handles: [0.25, -1.05], chrome: true, grille: CHROME,
    body: [[-2.6, 0.3], [2.6, 0.3], [2.63, 0.62], [2.5, 0.8], [1.15, 0.93], [-1.65, 0.97], [-2.55, 0.92], [-2.63, 0.62]],
    glass: [[1.12, 0.91], [0.3, 1.43], [-1.18, 1.45], [-1.8, 0.95]],
    roof: [[0.32, 1.41], [-1.18, 1.43], [-1.2, 1.5], [0.3, 1.48]],
  }),
  suv(b, c) {
    car(b, c, {
      L: 4.9, W: 1.96, R: 0.42, axF: 1.5, axR: -1.5, lightY: 0.94, bumperY: 0.46, belt: 1.17, sill: 0.5, bz: -0.55, mz: 1.12, doors: [1.15, -0.55, -1.65], handles: [0.35, -1.25],
      body: [[-2.45, 0.4], [2.45, 0.4], [2.48, 0.84], [2.36, 1.08], [1.25, 1.16], [-2.45, 1.18], [-2.48, 0.8]],
      glass: [[1.2, 1.15], [0.62, 1.82], [-2.25, 1.84], [-2.42, 1.17]],
      roof: [[0.64, 1.8], [-2.28, 1.82], [-2.3, 1.9], [0.6, 1.88]],
    });
    for (const x of [-0.72, 0.72]) b.box(0.06, 0.06, 2.6, x, 1.93, -0.85, TRIM);                    // حامل السقف
    b.add(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 16), TIRE, { rx: Math.PI / 2, y: 0.95, z: -2.6 }); // الاستبنة
    b.add(new THREE.CylinderGeometry(0.22, 0.22, 0.26, 12), c, { rx: Math.PI / 2, y: 0.95, z: -2.6 });
  },
  pickup(b, c) {
    car(b, c, {
      L: 5.3, W: 1.9, R: 0.42, axF: 1.65, axR: -1.6, lightY: 0.9, bumperY: 0.46, belt: 1.13, sill: 0.5, bz: 0.05, mz: 1.25, doors: [1.3, 0.05, -0.72], handles: [0.75, -0.45],
      body: [[-2.65, 0.42], [2.65, 0.42], [2.68, 0.82], [2.5, 1.06], [1.35, 1.12], [-2.65, 1.14], [-2.68, 0.8]],
      glass: [[1.3, 1.11], [0.75, 1.72], [-0.55, 1.74], [-0.7, 1.13]],
      roof: [[0.77, 1.7], [-0.55, 1.72], [-0.57, 1.79], [0.75, 1.77]],
    });
    b.box(1.66, 0.02, 1.85, 0, 1.17, -1.68, 0x2b2b2b);                                             // الصندوق المفتوح
    b.box(1.66, 0.4, 0.06, 0, 0.78, -0.78, 0x1f1f1f);
  },
  sport(b, c) {
    car(b, c, {
      L: 4.4, W: 1.96, R: 0.35, axF: 1.35, axR: -1.35, lightY: 0.48, bumperY: 0.26, belt: 0.74, sill: 0.3, mz: 0.42, doors: [0.5, -0.92], handles: [-0.7],
      body: [[-2.2, 0.24], [2.2, 0.24], [2.25, 0.42], [1.95, 0.58], [0.55, 0.74], [-1.8, 0.82], [-2.2, 0.74], [-2.25, 0.45]],
      glass: [[0.55, 0.72], [-0.15, 1.1], [-0.85, 1.11], [-1.75, 0.8]],
      roof: [[-0.13, 1.08], [-0.85, 1.09], [-0.86, 1.15], [-0.15, 1.14]],
    });
    for (const x of [-0.65, 0.65]) b.box(0.06, 0.16, 0.06, x, 0.82, -1.95, TRIM);                 // الجناح الخلفي
    b.slab(1.7, 0.05, 0.32, 0, 1.0, -1.98, c, { rx: 0.08 });
    for (const x of [-0.4, 0.4]) b.add(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), CHROME, { rx: Math.PI / 2, x, y: 0.3, z: -2.25 });
  },
  classic(b, c) {
    car(b, c, {
      L: 4.9, W: 1.86, R: 0.36, axF: 1.52, axR: -1.5, lightY: 0.68, bumperY: 0.38, belt: 0.88, sill: 0.4, bz: -0.25, mz: 0.92, doors: [0.95, -0.25, -1.45], handles: [0.3, -0.8], chrome: true, round: true, grille: CHROME,
      body: [[-2.45, 0.34], [2.45, 0.34], [2.48, 0.72], [2.38, 0.85], [1.05, 0.88], [-1.95, 0.91], [-2.45, 0.87], [-2.48, 0.7]],
      glass: [[1.0, 0.86], [0.5, 1.36], [-1.0, 1.38], [-1.5, 0.89]],
      roof: [[0.52, 1.34], [-1.0, 1.36], [-1.02, 1.43], [0.5, 1.41]],
    });
    for (const x of [-0.6, 0.6]) b.add(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 14), 0xfff4d2, { rx: Math.PI / 2, x, y: 0.7, z: 2.47 });
    for (const x of [-0.95, 0.95]) b.box(0.02, 0.03, 4.6, x, 0.62, 0, CHROME);                  // خط الكروم الجانبي
  },
  // دبّاب (بيتش باقي): أربع عجلات عريضة، مقعد ومقود
  scooter(b, c) {
    for (const x of [-0.52, 0.52]) for (const z of [-0.62, 0.62]) {
      b.add(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 14), TIRE, { rz: Math.PI / 2, x, y: 0.3, z });
      b.add(new THREE.CylinderGeometry(0.16, 0.16, 0.32, 10), RIM, { rz: Math.PI / 2, x, y: 0.3, z });
    }
    b.box(0.5, 0.25, 1.5, 0, 0.32, 0, TRIM);
    for (const z of [-0.62, 0.62]) b.slab(1.3, 0.08, 0.7, 0, 0.66, z, c, { rx: z > 0 ? -0.15 : 0.15 });
    b.box(0.6, 0.35, 0.9, 0, 0.5, -0.05, c);
    b.box(0.4, 0.12, 0.75, 0, 0.85, -0.2, 0x1b1b1b);
    b.slab(0.06, 0.55, 0.06, 0, 1.0, 0.4, TRIM, { rx: -0.35 });
    b.box(0.8, 0.05, 0.05, 0, 1.22, 0.5, TRIM);
    for (const x of [-0.42, 0.42]) b.box(0.08, 0.08, 0.14, x, 1.19, 0.5, 0x333333);
    b.box(0.3, 0.12, 0.05, 0, 0.72, 0.96, 0xfff4d2);
    b.box(0.9, 0.04, 0.4, 0, 0.74, 0.62, TRIM);
  },
};
const carCache = new Map();
export function carGeometry(id, color) {
  const key = id + ':' + color;
  if (!carCache.has(key)) { const b = new Builder(); (CARS[id] || CARS.sedan)(b, color); carCache.set(key, b.build()); }
  return carCache.get(key);
}

// ---------- الحوش ----------
const YARD = {
  lantern(b) { b.cyl(0.06, 0.08, 1.4, 0, 0, 0, C.dark, 6); b.box(0.4, 0.5, 0.4, 0, 1.4, 0, C.gold); b.box(0.3, 0.38, 0.42, 0, 1.46, 0, 0xffe7a0); b.cyl(0.02, 0.25, 0.25, 0, 1.9, 0, C.gold, 4); },
  palm(b) {
    for (let i = 0; i < 7; i++) b.cyl(0.2 - i * 0.012, 0.22 - i * 0.012, 0.6, Math.sin(i * 0.3) * 0.08, i * 0.58, 0, i % 2 ? 0x8a6a42 : 0x7a5a36, 7);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.slab(0.35, 0.06, 2.0, Math.sin(a) * 0.9, 4.0, Math.cos(a) * 0.9, i % 2 ? C.leaf : C.leaf2, { rx: -0.45, ry: a }); }
    for (let i = 0; i < 5; i++) b.ball(0.12, Math.sin(i) * 0.25, 3.8, Math.cos(i) * 0.25, 0xc9781e);
  },
  bbq(b) { for (const [x, z] of [[-0.3, -0.2], [0.3, -0.2], [0, 0.25]]) b.box(0.05, 0.8, 0.05, x, 0, z, C.dark); b.cyl(0.42, 0.3, 0.3, 0, 0.8, 0, C.dark, 14); b.cyl(0.4, 0.4, 0.03, 0, 1.08, 0, C.metal, 14); b.ball(0.08, 0.1, 1.15, 0, 0xd9342b); b.ball(0.08, -0.12, 1.15, 0.05, 0xa0522d); },
  swing(b) { for (const s of [-1, 1]) { b.slab(0.1, 2.3, 0.1, s * 1.0, 1.1, -0.45, C.wood, { rx: 0.2 }); b.slab(0.1, 2.3, 0.1, s * 1.0, 1.1, 0.45, C.wood, { rx: -0.2 }); }
    b.box(2.2, 0.12, 0.12, 0, 2.2, 0, C.woodD); for (const s of [-0.3, 0.3]) b.box(0.03, 1.6, 0.03, s, 0.6, 0, 0x555555); b.box(0.75, 0.06, 0.35, 0, 0.55, 0, 0xc0392b); },
  trampoline(b) { for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; b.box(0.06, 0.6, 0.06, Math.sin(a) * 1.3, 0, Math.cos(a) * 1.3, C.dark); } b.cyl(1.4, 1.4, 0.08, 0, 0.6, 0, 0x2f6fb5, 20); b.cyl(1.15, 1.15, 0.09, 0, 0.6, 0, 0x1b1b1b, 20); },
  tent(b) { b.gable(3.2, 1.9, 2.8, 0, 0, 0, 0x2a2420); b.box(3.0, 0.06, 0.06, 0, 1.85, 0, 0xd9b26a); for (let i = 0; i < 3; i++) b.slab(0.6, 0.02, 1.2, -0.9 + i * 0.9, 0.95, 1.38, i % 2 ? 0xd9b26a : 0x8c2f2f, { rx: -0.9 }); b.box(2.6, 0.05, 1.4, 0, 0, 1.6, 0x9b2f35); },
  fountain(b) { b.cyl(1.2, 1.3, 0.45, 0, 0, 0, 0xd6d0c4, 18); b.cyl(1.05, 1.05, 0.06, 0, 0.42, 0, 0x3fb7e0, 18); b.cyl(0.15, 0.22, 1.1, 0, 0.4, 0, 0xd6d0c4, 8); b.cyl(0.55, 0.2, 0.22, 0, 1.4, 0, 0xd6d0c4, 12); b.cyl(0.45, 0.45, 0.05, 0, 1.6, 0, 0x3fb7e0, 12); b.cyl(0.02, 0.1, 0.6, 0, 1.62, 0, 0xbfeaf8, 6); },
  camel(b) {
    const s = 0xc8a06a;
    for (const [x, z] of [[-0.25, -0.6], [0.25, -0.6], [-0.25, 0.6], [0.25, 0.6]]) b.box(0.15, 1.1, 0.15, x, 0, z, s);
    b.box(0.7, 0.6, 1.6, 0, 1.1, 0, s); b.ball(0.45, 0, 1.85, -0.1, s); b.slab(0.22, 1.0, 0.25, 0, 1.95, 0.95, s, { rx: 0.5 }); b.box(0.28, 0.25, 0.5, 0, 2.3, 1.25, s);
    b.box(0.72, 0.1, 0.9, 0, 1.68, 0, 0x8c2f2f); b.box(0.74, 0.06, 0.95, 0, 1.6, 0, 0xd9b26a);
  },
};
const yardCache = new Map();
export function yardGeometry(id) {
  if (!yardCache.has(id)) { const b = new Builder(); (YARD[id] || YARD.palm)(b); yardCache.set(id, b.build()); }
  return yardCache.get(id);
}

// أماكن السيارة والحوش داخل القطعة (إحداثيات القطعة، الشارع جهة +z) حسب لفل البيت
export const CAR_SPOT = [null, [4.9, 6.3], [5.3, 6.3], [4.55, 6.4], [5.35, 6.3], [-3.7, 6.3], [5.4, 6.3], [6.3, 6.4], [6.2, 6.3], [5.45, 6.3], [2.6, 6.9]];
export const YARD_SPOT = [-3.9, 6.9];
// أماكن الحيوانات في الحوش الأمامي (x, z, اتجاه)
export const PET_SPOTS = [[-5.9, 3.4, 0.5], [-4.5, 5.0, -0.4], [-6.4, 0.9, 1.0], [-2.4, 8.3, 0.2]];

// ---------- الحيوانات: الوجه باتجاه +z ----------
const legs4 = (b, w, z, h, t, col) => { for (const x of [-w, w]) for (const zz of [-z, z]) b.box(t, h, t, x, 0, zz, col); };
const PETS = {
  cat(b) {
    const o = 0xe08a3c, d = 0xb5652a;
    legs4(b, 0.07, 0.15, 0.14, 0.05, o);
    b.box(0.2, 0.17, 0.42, 0, 0.13, 0, o); for (const z of [-0.1, 0.06]) b.box(0.21, 0.04, 0.05, 0, 0.27, z, d);
    b.box(0.17, 0.15, 0.15, 0, 0.24, 0.25, o); b.box(0.06, 0.04, 0.02, 0, 0.27, 0.33, 0xf2c5a0);
    for (const x of [-0.055, 0.055]) { b.cyl(0.001, 0.035, 0.07, x, 0.39, 0.24, o, 4); b.box(0.025, 0.025, 0.01, x, 0.31, 0.33, 0x2a6a2a); }
    b.slab(0.035, 0.035, 0.32, 0, 0.32, -0.3, o, { rx: 0.9 });
  },
  dog(b) {
    const g = 0xd9a45a, d = 0xa8763a;
    legs4(b, 0.1, 0.2, 0.28, 0.07, g);
    b.box(0.26, 0.24, 0.62, 0, 0.26, 0, g);
    b.box(0.22, 0.22, 0.22, 0, 0.44, 0.36, g); b.box(0.12, 0.1, 0.14, 0, 0.44, 0.52, d); b.box(0.05, 0.04, 0.02, 0, 0.51, 0.59, 0x1b1b1b);
    for (const x of [-0.12, 0.12]) { b.box(0.04, 0.16, 0.09, x, 0.42, 0.33, d); b.box(0.025, 0.025, 0.01, x * 0.45, 0.58, 0.47, 0x1b1b1b); }
    b.slab(0.05, 0.05, 0.28, 0, 0.52, -0.38, g, { rx: 0.7 });
    b.box(0.24, 0.05, 0.04, 0, 0.5, 0.26, 0xc0392b);
  },
  rabbit(b) {
    const w = 0xf4f1ea;
    b.ball(0.15, 0, 0.15, -0.03, w, 1); b.ball(0.1, 0, 0.27, 0.12, w, 1); b.ball(0.05, 0, 0.17, -0.18, 0xffffff);
    for (const x of [-0.04, 0.04]) { b.slab(0.04, 0.22, 0.02, x, 0.44, 0.1, w, { rz: x * 3 }); b.slab(0.02, 0.15, 0.01, x, 0.44, 0.112, 0xf3b6c3, { rz: x * 3 }); }
    b.box(0.03, 0.025, 0.02, 0, 0.27, 0.215, 0xf08a9a);
  },
  parrot(b) {
    b.cyl(0.07, 0.09, 0.26, 0, 0, 0, 0x2e9e4a, 8); b.ball(0.08, 0, 0.32, 0.02, 0xd9342b, 1); b.cyl(0.001, 0.03, 0.06, 0, 0.3, 0.1, 0xf2c94c, 4);
    for (const x of [-0.08, 0.08]) b.slab(0.03, 0.2, 0.12, x, 0.13, -0.01, 0x2f6fb5);
    b.slab(0.06, 0.03, 0.26, 0, 0.0, -0.16, 0x2f6fb5, { rx: 0.5 });
  },
  falcon(b) {
    const br = 0x7a5a3a;
    b.cyl(0.08, 0.1, 0.3, 0, 0, 0, br, 8); b.box(0.12, 0.2, 0.04, 0, 0.04, 0.07, 0xf1e8d6);
    b.ball(0.085, 0, 0.36, 0.02, br, 1); b.cyl(0.001, 0.03, 0.05, 0, 0.33, 0.1, 0x2a2a2a, 4); b.box(0.12, 0.03, 0.03, 0, 0.39, 0.07, 0xf2c94c);
    for (const x of [-0.1, 0.1]) b.slab(0.03, 0.26, 0.16, x, 0.1, -0.02, 0x5a4028);
    b.slab(0.1, 0.03, 0.22, 0, -0.04, -0.15, 0x5a4028, { rx: 0.6 });
  },
  chicken(b) {
    b.ball(0.15, 0, 0.26, 0, 0xf6f2ea, 1); b.ball(0.08, 0, 0.42, 0.1, 0xf6f2ea, 1);
    b.box(0.03, 0.06, 0.08, 0, 0.5, 0.1, 0xd9342b); b.cyl(0.001, 0.03, 0.05, 0, 0.4, 0.18, 0xf2a93c, 4); b.box(0.03, 0.05, 0.02, 0, 0.35, 0.16, 0xd9342b);
    for (const x of [-0.05, 0.05]) b.box(0.02, 0.13, 0.02, x, 0, 0, 0xf2a93c);
    b.slab(0.12, 0.14, 0.06, 0, 0.36, -0.14, 0xf6f2ea, { rx: -0.4 });
  },
  sheep(b) {
    legs4(b, 0.12, 0.22, 0.3, 0.07, 0x2a2a2a);
    for (const [x, y, z] of [[0, 0.45, -0.18], [0, 0.45, 0.12], [-0.12, 0.42, -0.03], [0.12, 0.42, -0.03], [0, 0.56, -0.03]]) b.ball(0.2, x, y, z, 0xf2efe6, 1);
    b.box(0.16, 0.2, 0.22, 0, 0.5, 0.36, 0x2a2a2a); for (const x of [-0.1, 0.1]) b.box(0.1, 0.04, 0.06, x, 0.6, 0.32, 0x2a2a2a);
  },
  goat(b) {
    const c = 0x8a5a36;
    legs4(b, 0.1, 0.22, 0.38, 0.06, c);
    b.box(0.24, 0.26, 0.6, 0, 0.36, 0, c); b.box(0.24, 0.12, 0.3, 0, 0.36, -0.1, 0xf1e8d6);
    b.slab(0.14, 0.32, 0.14, 0, 0.7, 0.3, c, { rx: 0.4 }); b.box(0.16, 0.16, 0.24, 0, 0.78, 0.42, c);
    for (const x of [-0.05, 0.05]) b.slab(0.03, 0.2, 0.03, x, 0.98, 0.36, 0x5a4a3a, { rx: -0.5 });
    b.box(0.04, 0.1, 0.03, 0, 0.66, 0.52, 0xf1e8d6);
    b.slab(0.04, 0.12, 0.04, 0, 0.56, -0.32, c, { rx: -0.6 });
  },
  horse(b) {
    const c = 0x7a4a2a, m = 0x2a1c14;
    legs4(b, 0.16, 0.55, 0.85, 0.11, c);
    for (const x of [-0.16, 0.16]) for (const z of [-0.55, 0.55]) b.box(0.13, 0.08, 0.13, x, 0, z, 0x1b1b1b);
    b.box(0.46, 0.5, 1.45, 0, 0.82, 0, c);
    b.slab(0.28, 0.75, 0.32, 0, 1.45, 0.72, c, { rx: 0.55 }); b.box(0.24, 0.24, 0.55, 0, 1.68, 1.05, c);
    b.slab(0.06, 0.7, 0.14, 0, 1.55, 0.62, m, { rx: 0.55 });
    for (const x of [-0.07, 0.07]) b.cyl(0.001, 0.05, 0.12, x, 1.92, 0.88, c, 4);
    b.slab(0.1, 0.6, 0.1, 0, 0.98, -0.8, m, { rx: -0.35 });
    b.box(0.48, 0.06, 0.55, 0, 1.32, 0.05, 0x8c2f2f);
  },
  live_camel(b) {
    const c = 0xc9a273;
    for (const [x, z] of [[-0.24, -0.62], [0.24, -0.62], [-0.24, 0.62], [0.24, 0.62]]) b.box(0.14, 1.15, 0.14, x, 0, z, c);
    b.box(0.66, 0.58, 1.65, 0, 1.12, 0, c); b.ball(0.46, 0, 1.82, -0.12, c, 1);
    b.slab(0.22, 1.05, 0.26, 0, 1.9, 0.98, c, { rx: 0.55 }); b.box(0.26, 0.26, 0.52, 0, 2.25, 1.3, c);
    for (const x of [-0.08, 0.08]) b.box(0.03, 0.03, 0.01, x, 2.35, 1.57, 0x2a1c14);
    b.slab(0.06, 0.4, 0.06, 0, 1.25, -0.88, 0x8a6a42, { rx: -0.3 });
  },
};
const petCache = new Map();
export function petGeometry(id) {
  if (!petCache.has(id)) { const b = new Builder(); (PETS[id] || PETS.cat)(b); petCache.set(id, b.build()); }
  return petCache.get(id);
}
export const FLYING = new Set(['parrot', 'falcon']);

// ---------- الشخصيات: أجزاء منفصلة حتى نحرّك الرجلين والذراعين ----------
const SKIN = 0xd9a77c;
export function avatarParts(type) {
  const body = new Builder(), legL = new Builder(), legR = new Builder(), armL = new Builder(), armR = new Builder();
  const leg = (b, col, shoe) => { b.box(0.16, 0.8, 0.18, 0, -0.8, 0, col); b.box(0.18, 0.1, 0.28, 0, -0.85, 0.04, shoe); };
  const arm = (b, col) => { b.box(0.13, 0.62, 0.14, 0, -0.6, 0, col); b.ball(0.07, 0, -0.66, 0, SKIN); };
  const head = (b) => { b.box(0.34, 0.36, 0.32, 0, 1.47, 0, SKIN); b.box(0.05, 0.05, 0.02, -0.08, 1.67, 0.165, 0x222222); b.box(0.05, 0.05, 0.02, 0.08, 1.67, 0.165, 0x222222); };
  if (type === 'thobe') {
    body.cyl(0.24, 0.3, 1.0, 0, 0.42, 0, 0xf7f7f2, 10); body.box(0.42, 0.06, 0.25, 0, 1.38, 0, 0xf7f7f2); head(body);
    body.box(0.42, 0.12, 0.4, 0, 1.82, 0, 0xffffff); body.slab(0.44, 0.5, 0.06, 0, 1.6, -0.2, 0xd9342b); body.box(0.44, 0.12, 0.4, 0, 1.86, 0, 0xd9342b);
    body.box(0.4, 0.06, 0.38, 0, 1.94, 0, 0x111111);
    for (const b of [legL, legR]) leg(b, 0xf7f7f2, 0x7a5230);
    for (const b of [armL, armR]) arm(b, 0xf7f7f2);
  } else if (type === 'abaya') {
    body.cyl(0.24, 0.34, 1.05, 0, 0.38, 0, 0x16171a, 10); body.box(0.42, 0.08, 0.26, 0, 1.38, 0, 0x16171a); head(body);
    body.box(0.4, 0.42, 0.38, 0, 1.47, -0.02, 0x22232a); body.box(0.42, 0.12, 0.42, 0, 1.85, -0.01, 0x22232a);
    for (const b of [legL, legR]) leg(b, 0x16171a, 0x16171a);
    for (const b of [armL, armR]) arm(b, 0x16171a);
  } else if (type === 'girl') {
    body.box(0.4, 0.55, 0.24, 0, 0.82, 0, 0xe86f9a); body.cyl(0.2, 0.32, 0.4, 0, 0.42, 0, 0x3d6fb3, 10); head(body);
    body.box(0.38, 0.14, 0.36, 0, 1.8, -0.01, 0x5a3520); body.box(0.36, 0.55, 0.1, 0, 1.3, -0.17, 0x5a3520);
    for (const b of [legL, legR]) leg(b, SKIN, 0xffffff);
    for (const b of [armL, armR]) arm(b, 0xe86f9a);
  } else {
    body.box(0.42, 0.62, 0.26, 0, 0.78, 0, 0x2f6fb5); head(body); body.box(0.36, 0.12, 0.34, 0, 1.79, -0.01, 0x2a1f18);
    for (const b of [legL, legR]) leg(b, 0x34465e, 0xffffff);
    for (const b of [armL, armR]) arm(b, 0x2f6fb5);
  }
  return { body: body.build(), legL: legL.build(), legR: legR.build(), armL: armL.build(), armR: armR.build() };
}

export function makeAvatar(type, mat) {
  const p = avatarParts(type), g = new THREE.Group();
  const add = (geo, x, y) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, 0); m.castShadow = true; g.add(m); return m; };
  add(p.body, 0, 0);
  const legL = add(p.legL, -0.1, 0.86), legR = add(p.legR, 0.1, 0.86);
  const armL = add(p.armL, -0.29, 1.36), armR = add(p.armR, 0.29, 1.36);
  let phase = 0;
  g.userData.walk = (speed, dt) => {
    phase += dt * speed * 4.2;
    const a = speed > 0.05 ? Math.sin(phase) * 0.6 : 0;
    legL.rotation.x = a; legR.rotation.x = -a; armL.rotation.x = -a * 0.8; armR.rotation.x = a * 0.8;
    g.children[0].position.y = speed > 0.05 ? Math.abs(Math.sin(phase)) * 0.05 : 0;
  };
  return g;
}
