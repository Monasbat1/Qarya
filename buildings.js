// مباني العقارات التجارية: القطعة 20×20 (x و z من -10 إلى 10)، والواجهة باتجاه +z (الجادة).
import * as THREE from 'three';
import { Builder } from './houses.js';

const G = 0.12; // سماكة أرضية القطعة
const K = {
  pave: 0xd6d1c6, pave2: 0xc9c3b6, grass: 0x7cc35a, glass: 0x8fc7de, glassD: 0x3d5a73, white: 0xf4f1ea, dark: 0x2a2d33,
  wood: 0x9a6b42, leaf: 0x3f8f45, leaf2: 0x57a84e, trunk: 0x7a5230, red: 0xc8432f, gold: 0xd9a521, metal: 0xaab2bb,
};
const tree = (b, x, z, s = 1) => { b.cyl(0.16 * s, 0.22 * s, 1.5 * s, x, G, z, K.trunk, 6); b.ball(1.2 * s, x, G + 2.2 * s, z, K.leaf); b.ball(0.8 * s, x + 0.4 * s, G + 3 * s, z - 0.2 * s, K.leaf2); };
const base = (b, col = K.pave) => { b.box(20, G, 20, 0, 0, 0, col); b.box(20, 0.02, 2.2, 0, G, 8.9, K.pave2); };
const awning = (b, w, x, y, z, c1, c2, n = 8) => { for (let i = 0; i < n; i++) b.slab(w / n, 0.08, 1.6, x - w / 2 + (i + 0.5) * (w / n), y, z, i % 2 ? c1 : c2, { rx: 0.35 }); };
const storefront = (b, w, h, x, z, frame = K.dark) => {
  b.box(w, h, 0.12, x, G, z, frame);
  b.box(w - 0.3, h - 0.5, 0.14, x, G + 0.25, z + 0.02, K.glass);
  for (let i = 1; i < 4; i++) b.box(0.08, h - 0.5, 0.16, x - w / 2 + (w / 4) * i, G + 0.25, z + 0.03, frame);
};
const table = (b, x, z, top = K.white, umb) => {
  b.cyl(0.45, 0.45, 0.06, x, G + 0.72, z, top, 10); b.cyl(0.05, 0.05, 0.72, x, G, z, K.dark, 6);
  for (const [dx, dz] of [[0.75, 0], [-0.75, 0]]) { b.box(0.4, 0.05, 0.4, x + dx, G + 0.42, z + dz, K.dark); b.box(0.04, 0.42, 0.04, x + dx, G, z + dz, K.dark); }
  if (umb) { b.cyl(0.03, 0.03, 2.2, x, G, z, K.white, 6); b.cyl(0.02, 1.25, 0.45, x, G + 2.0, z, umb, 10); }
};
const bench = (b, x, z, ry = 0) => b.box(1.6, 0.1, 0.45, x, G + 0.42, z, K.wood, ry).box(0.08, 0.42, 0.4, x - 0.7, G, z, K.dark, ry).box(0.08, 0.42, 0.4, x + 0.7, G, z, K.dark, ry);

const MODELS = {
  shop(b) {
    base(b);
    const c = 0xd9b26a;
    b.box(13, 5, 9, 0, G, -2.5, c); b.box(13.3, 0.5, 9.3, 0, G + 5, -2.5, 0xb89148);
    storefront(b, 11, 3.4, 0, 2.05);
    awning(b, 12, 0, G + 3.7, 2.8, K.red, K.white, 10);
    b.box(9, 1.1, 0.2, 0, G + 4.0, 2.1, K.dark);
    for (const x of [-7.5, 7.5]) tree(b, x, 6.5, 0.8);
    b.box(1.6, 0.9, 0.6, 5, G, 4.2, 0x4f7a3a);
  },
  cafe(b) {
    base(b, 0xe2d6c0);
    const c = 0x7a5a3e;
    b.box(10, 4.2, 8, -2, G, -3.5, c); b.hip(11, 1.5, 9, -2, G + 4.2, -3.5, 0x4a3426);
    storefront(b, 8, 3, -2, 0.55, 0x4a3426);
    awning(b, 9, -2, G + 3.3, 1.3, 0x2f7d4f, 0xf4f1ea, 8);
    b.box(2.2, 2.2, 0.15, 5.5, G + 1.4, 0.6, 0x4a3426); b.cyl(0.6, 0.6, 0.18, 5.5, G + 2.4, 0.7, 0xf4f1ea, 12);
    for (const [x, z] of [[-6, 4.5], [-2, 5.5], [2, 4.5], [6, 5.5]]) table(b, x, z, K.white, x % 4 ? 0xc8432f : 0x2f7d4f);
    for (const x of [-9, 9]) b.box(0.6, 0.8, 0.6, x, G, 7, 0x8a5a33).ball(0.5, x, G + 1.2, 7, K.leaf);
  },
  restaurant(b) {
    base(b);
    const c = 0xb5463f;
    b.box(15, 5.5, 10, 0, G, -3, c); b.box(15.4, 0.6, 10.4, 0, G + 5.5, -3, 0x8c2f2f);
    storefront(b, 6, 3.4, -3.5, 2.05, 0x5a2420); storefront(b, 4, 3.4, 4.5, 2.05, 0x5a2420);
    b.box(1.3, 2.4, 0.15, 1.2, G, 2.1, 0x3a1c18);
    b.box(10, 1.5, 0.3, 0, G + 4.0, 2.2, 0xf4f1ea); b.box(9.4, 1.1, 0.32, 0, G + 4.2, 2.2, K.gold);
    b.box(1.2, 2.5, 1.2, 5.5, G + 6.1, -5, 0x8f8b84);
    for (const [x, z] of [[-6, 5.5], [-2.5, 6], [2.5, 6], [6, 5.5]]) table(b, x, z, 0xf7f3ea, 0xb5463f);
  },
  market(b) {
    base(b, 0xdcc9a4);
    const cols = [[0xc8432f, 0xf4f1ea], [0x2f6fb5, 0xf4f1ea], [0xd9a521, 0x7a5230], [0x2f7d4f, 0xf4f1ea], [0x8c2f6f, 0xf4f1ea], [0xe07a2a, 0xf4f1ea]];
    let i = 0;
    for (const z of [-5.5, 1.5]) for (const x of [-6, 0, 6]) {
      const [a, c] = cols[i++ % cols.length];
      b.box(4.6, 0.9, 2.2, x, G, z, K.wood);
      for (const [dx, dz] of [[-2.1, -1], [2.1, -1], [-2.1, 1], [2.1, 1]]) b.box(0.12, 2.6, 0.12, x + dx, G, z + dz, K.wood);
      awning(b, 4.8, x, G + 2.9, z, a, c, 6);
      const fruit = [0xd9342b, 0xf2a93c, 0x5aa84e, 0xf2d24c, 0x8c2f6f][i % 5];
      for (let k = 0; k < 6; k++) b.ball(0.18, x - 1.7 + k * 0.7, G + 1.05, z + 0.4, fruit);
      b.box(0.8, 0.5, 0.6, x + 1.6, G + 0.9, z - 0.4, 0xc89a5a);
    }
    for (const [x, z] of [[-9, 7], [9, 7]]) tree(b, x, z, 0.9);
    b.box(6, 0.12, 2, 0, G, 7.5, 0x9b2f35);
  },
  supermarket(b) {
    base(b, 0x9a9a98);
    for (let i = -3; i <= 3; i++) b.box(0.12, 0.02, 3.6, i * 2.7, G, 5.6, 0xf4f1ea); // مواقف
    b.box(18, 6, 10, 0, G, -4.5, 0xeeeae2); b.box(18.4, 0.7, 10.4, 0, G + 6, -4.5, 0x2f7d4f);
    storefront(b, 12, 3.8, 0, 0.55, 0x2f7d4f);
    b.box(14, 1.6, 0.3, 0, G + 4.2, 0.7, 0x2f7d4f); b.box(13, 1.0, 0.32, 0, G + 4.5, 0.7, 0xf4f1ea);
    b.box(2.6, 1.0, 1.0, 7.5, G, 2.2, 0x6b6f75); for (let k = 0; k < 4; k++) b.box(0.6, 0.6, 0.8, 6.6 + k * 0.6, G + 0.5, 2.2, 0xc0392b);
    b.add(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14), 0x161718, { rz: Math.PI / 2, x: -4, y: G + 0.34, z: 6.5 });
  },
  park(b) {
    base(b, K.grass);
    b.box(20, 0.02, 2.2, 0, G, 8.9, K.pave2);
    b.cyl(5.5, 5.5, 0.03, 0, G, 0, 0xddd2b8, 32); b.cyl(4.3, 4.3, 0.04, 0, G, 0, K.grass, 32);
    b.box(1.6, 0.03, 4.8, 0, G, 6.4, 0xddd2b8);
    b.cyl(1.4, 1.5, 0.5, 0, G, 0, 0xd6d0c4, 18); b.cyl(1.25, 1.25, 0.06, 0, G + 0.46, 0, 0x3fb7e0, 18); b.cyl(0.12, 0.2, 1.1, 0, G + 0.4, 0, 0xd6d0c4, 8); b.cyl(0.02, 0.1, 0.6, 0, G + 1.5, 0, 0xbfeaf8, 6);
    for (const [x, z, ry] of [[-4.8, 0, Math.PI / 2], [4.8, 0, Math.PI / 2], [0, -4.8, 0]]) bench(b, x, z, ry);
    for (const [x, z, s] of [[-7.5, -7, 1.1], [7.5, -7.2, 1.2], [-8, 3, 0.9], [8, 3.5, 1], [-3.5, -8, 0.8], [3.8, -8.2, 0.9]]) tree(b, x, z, s);
    // ألعاب أطفال
    b.box(0.15, 2.2, 0.15, 6.2, G, -1.8, 0xc8432f); b.box(0.15, 2.2, 0.15, 7.6, G, -1.8, 0xc8432f); b.box(1.6, 0.12, 1.2, 6.9, G + 2.2, -1.8, 0xd9a521);
    b.slab(0.9, 0.08, 3.0, 6.9, G + 1.1, -0.2, 0x2f6fb5, { rx: -0.75 });
    for (const [x, z] of [[-7, 7], [7, 7]]) b.cyl(0.05, 0.07, 2.4, x, G, z, K.dark, 6).ball(0.22, x, G + 2.5, z, 0xfff0b8);
    for (let k = 0; k < 10; k++) b.ball(0.18, -2 + (k % 5), G + 0.2, -6.8 + Math.floor(k / 5) * 0.5, k % 2 ? 0xd9567a : 0xf0c23c);
  },
  gas(b) {
    base(b, 0x8a8f96);
    for (const [x, z] of [[-5, -1], [5, -1], [-5, 4], [5, 4]]) b.box(0.5, 5, 0.5, x, G, z, K.white);
    b.box(13, 0.8, 7.5, 0, G + 5, 1.5, K.white); b.box(13.1, 0.4, 7.6, 0, G + 5.1, 1.5, 0xc8432f);
    for (const x of [-2.5, 2.5]) { b.box(0.9, 0.3, 2.4, x, G, 1.5, 0xd6d1c6); b.box(0.7, 1.6, 0.5, x, G + 0.3, 1.5, 0xc8432f); b.box(0.5, 0.4, 0.06, x, G + 1.3, 1.78, 0x1b2430); }
    b.box(7, 3.4, 4.5, 0, G, -6.5, 0xeeeae2); storefront(b, 4, 2.6, 0, -4.2, 0xc8432f);
    b.box(0.35, 6.5, 0.35, 8.6, G, 7.2, K.dark); b.box(2.2, 2.6, 0.3, 8.6, G + 6.5, 7.2, 0xc8432f); for (let k = 0; k < 3; k++) b.box(1.8, 0.5, 0.32, 8.6, G + 6.75 + k * 0.75, 7.22, 0x1b2430);
  },
  mall(b) {
    base(b);
    const c = 0xe9e3d6;
    b.box(19, 9, 13, 0, G, -3.2, c);
    for (const y of [1.0, 5.2]) b.box(17, 3, 0.14, 0, G + y, 3.35, K.glassD);
    for (let i = -4; i <= 4; i++) b.box(0.12, 7.4, 0.18, i * 2.1, G + 0.9, 3.4, 0xcfc8b8);
    b.box(19.4, 0.8, 13.4, 0, G + 9, -3.2, 0x5a6470);
    b.box(7, 0.3, 3, 0, G + 3.6, 5, K.white); for (const x of [-3.2, 3.2]) b.box(0.25, 3.6, 0.25, x, G, 6.2, K.white);
    b.box(10, 1.6, 0.3, 0, G + 9.9, 3.2, 0x2f4a6b); b.box(9.4, 1.1, 0.32, 0, G + 10.15, 3.2, K.gold);
    for (const x of [-8, 8]) tree(b, x, 7, 0.9);
  },
};

// ---------- أبراج وعمارات ----------
MODELS.apartments = (b) => {
  base(b, 0x9a9a98);
  for (let i = -3; i <= 3; i++) b.box(0.12, 0.02, 3.4, i * 2.6, G, 6.8, 0xf4f1ea);
  const c = 0xd8c3a5, W2 = 14, D2 = 12, F = 3.2, N = 6, cz = -3;
  b.box(W2, F * N, D2, 0, G, cz, c);
  b.box(W2 + 0.4, 0.6, D2 + 0.4, 0, G + F * N, cz, 0x8a7a6a);
  b.box(3, 2.4, 2, 4.5, G + F * N + 0.6, cz - 2, 0xbfae95); // غرفة السطح
  for (let f = 0; f < N; f++) {
    const y = G + f * F;
    b.box(W2 + 0.1, 0.18, D2 + 0.1, 0, y + F - 0.18, cz, 0xc4ad8e);
    for (let i = 0; i < 4; i++) {
      const x = -5.2 + i * 3.47;
      b.box(1.6, 1.5, 0.1, x, y + 0.9, cz + D2 / 2 + 0.02, K.glassD);
      if (f > 0) { b.box(2.4, 0.15, 1.1, x, y + 0.75, cz + D2 / 2 + 0.55, 0xeeeae2); b.box(2.4, 0.7, 0.06, x, y + 0.9, cz + D2 / 2 + 1.08, 0xb0b6bc); }
    }
    for (const s of [-1, 1]) for (const z of [-2, 1]) b.box(0.1, 1.4, 1.4, s * (W2 / 2 + 0.02), y + 0.9, cz + z, K.glassD);
  }
  b.box(4, 0.25, 2.2, 0, G + 2.6, cz + D2 / 2 + 1.1, K.white); b.box(2.2, 2.4, 0.14, 0, G, cz + D2 / 2 + 0.03, K.glass);
  for (const x of [-8, 8]) tree(b, x, 7.5, 0.8);
};
MODELS.tower = (b) => {
  base(b, 0xcfcac0);
  b.box(18, 4.5, 15, 0, G, -2.5, 0x3a4652); // منصّة
  for (let i = 0; i < 6; i++) b.box(2.4, 3.6, 0.1, -6.5 + i * 2.6, G + 0.4, 5.03, K.glass);
  b.box(8, 0.3, 3, 0, G + 4.3, 6.4, K.white); for (const x of [-3.6, 3.6]) b.box(0.25, 4.3, 0.25, x, G, 7.7, K.white);
  const H = 44, w = 11, d = 10, cz = -3;
  b.box(w, H, d, 0, G + 4.5, cz, 0x5b7f9e);
  for (let f = 0; f < 15; f++) b.box(w + 0.08, 0.22, d + 0.08, 0, G + 4.5 + f * (H / 15), cz, 0xcfd8e0);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    b.box(0.25, H, 0.35, -w / 2 + 1.4 + i * 2.75, G + 4.5, cz + s * (d / 2 + 0.1), 0xdfe6ec);
  }
  b.box(w - 2, 5, d - 2, 0, G + 4.5 + H, cz, 0x4a6680); b.box(w - 1.6, 0.3, d - 1.6, 0, G + 4.5 + H + 5, cz, 0xcfd8e0);
  b.box(4, 3, 4, 0, G + 4.5 + H + 5.3, cz, 0x3a4652);
  b.cyl(0.12, 0.2, 9, 0, G + 4.5 + H + 8.3, cz, 0xdfe6ec, 6); b.ball(0.35, 0, G + 4.5 + H + 17.4, cz, 0xff4d4d);
  for (const x of [-8.5, 8.5]) tree(b, x, 7.6, 0.8);
};

// ---------- فلل فاخرة (غير بيوت اللفلات) ----------
MODELS.villa_modern = (b) => {
  base(b, K.grass);
  b.box(20, 0.02, 2.2, 0, G, 8.9, K.pave2);
  b.box(19, 1.2, 0.3, 0, G, -9.6, 0xeeeae2); for (const s of [-1, 1]) b.box(0.3, 1.2, 19, s * 9.6, G, 0, 0xeeeae2);
  b.box(12, 3.4, 7, -1, G, -4.8, 0xf6f4ef);               // الدور الأرضي
  b.box(11.6, 2.8, 0.12, -1, G + 0.3, -1.25, K.glass);
  b.box(9, 3.3, 8, 1.5, G + 3.4, -5.3, 0xf6f4ef);          // الدور العلوي البارز
  b.box(8.6, 2.6, 0.12, 1.5, G + 3.7, -1.25, K.glassD);
  b.box(9.4, 0.25, 8.4, 1.5, G + 6.7, -5.3, 0x3a3f45); b.box(12.4, 0.25, 7.4, -1, G + 3.4, -4.8, 0x3a3f45);
  b.box(2.2, 6.7, 0.6, -6.6, G, -1.6, 0x8a7a6a);           // جدار حجري
  // المسبح والسطح
  b.box(14, 0.15, 6.2, 0, G, 3.2, 0xb98a5a);
  b.box(9.5, 0.12, 3.6, -1.2, G + 0.06, 3.2, 0x3fb7e0); b.box(9.9, 0.1, 4.0, -1.2, G + 0.04, 3.2, 0xffffff);
  for (const x of [4.6, 6.0]) { b.slab(0.9, 0.12, 2.0, x, G + 0.5, 3.2, K.white, { rx: -0.2 }); b.box(0.8, 0.35, 1.6, x, G + 0.15, 3.4, 0x6b6f75); }
  b.cyl(0.03, 0.03, 2, 5.3, G, 1.3, K.white, 6); b.cyl(0.02, 1.1, 0.4, 5.3, G + 1.9, 1.3, 0xf2efe6, 10);
  for (const [x, z] of [[-8, 6.5], [8, 6.5]]) { for (let i = 0; i < 6; i++) b.cyl(0.16, 0.18, 0.6, x, G + i * 0.6, z, 0x8a6a42, 7); for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.3, 0.05, 1.7, x + Math.sin(a) * 0.75, G + 3.9, z + Math.cos(a) * 0.75, i % 2 ? K.leaf : K.leaf2, { rx: -0.45, ry: a }); } }
  b.box(5, 0.05, 3, 6, G, 7.3, 0xd6d1c6);
};
MODELS.villa_arabic = (b) => {
  base(b, 0xe8d9b8);
  const sand = 0xe2cfa4, trim = 0xc7ae7c, wood = 0x7a4a2a;
  // سور خارجي وبوابة
  for (const s of [-1, 1]) { b.box(7.5, 2.2, 0.4, s * 6.2, G, 9.4, sand); b.box(0.4, 2.2, 19, s * 9.7, G, 0, sand); }
  b.box(19.8, 2.2, 0.4, 0, G, -9.6, sand);
  for (const s of [-1, 1]) b.box(0.8, 3.0, 0.8, s * 2.4, G, 9.4, trim);
  b.box(4.0, 2.5, 0.12, 0, G, 9.45, wood);
  for (let i = -9; i <= 9; i += 1.2) b.box(0.5, 0.35, 0.5, i, G + 2.2, -9.6, trim);
  // المبنى الرئيسي
  b.box(13, 6.2, 8, 0, G, -4.5, sand);
  b.box(13.4, 0.4, 8.4, 0, G + 6.2, -4.5, trim);
  for (let i = -6.2; i <= 6.2; i += 0.9) b.box(0.45, 0.6, 0.45, i, G + 6.6, -0.5, trim); // شرفات السطح
  // رواق بأقواس
  b.box(13, 0.4, 2.6, 0, G, 0.8, 0xd6c49c);
  for (const x of [-5.4, -2.7, 0, 2.7, 5.4]) {
    b.box(0.6, 3.2, 0.6, x, G + 0.4, 1.8, trim);
    b.cyl(0.32, 0.32, 0.6, x, G + 3.6, 1.8, trim, 8);
  }
  b.box(13, 0.9, 0.7, 0, G + 3.6, 1.8, sand);
  for (const x of [-4.05, -1.35, 1.35, 4.05]) b.add(new THREE.CylinderGeometry(1.1, 1.1, 0.72, 16, 1, false, 0, Math.PI), sand, { rx: Math.PI / 2, rz: Math.PI / 2, x, y: G + 3.6, z: 1.8 });
  b.box(1.6, 2.8, 0.15, 0, G + 0.4, -0.45, wood); b.box(0.15, 0.15, 0.06, 0.5, G + 1.8, -0.36, K.gold);
  for (const x of [-4, 4]) { b.box(1.2, 1.6, 0.1, x, G + 1.2, -0.45, 0x5a6f7a); b.box(1.2, 1.4, 0.1, x, G + 4.2, -0.45, 0x5a6f7a); }
  // برج صغير بقبة
  b.box(3, 3, 3, 4.6, G + 6.2, -6.5, sand); b.ball(1.6, 4.6, G + 9.6, -6.5, 0xd9b26a, 1);
  // خيمة مجلس ونخيل
  b.gable(4, 1.8, 3, -6, G, 5.5, 0x2a2420); b.box(3.8, 0.05, 2.6, -6, G, 5.5, 0x9b2f35);
  for (const [x, z] of [[6.5, 5.5], [7.5, -1], [-7.8, -2]]) { for (let i = 0; i < 6; i++) b.cyl(0.16, 0.18, 0.6, x, G + i * 0.6, z, 0x8a6a42, 7); for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.3, 0.05, 1.7, x + Math.sin(a) * 0.75, G + 3.9, z + Math.cos(a) * 0.75, i % 2 ? K.leaf : K.leaf2, { rx: -0.45, ry: a }); } }
  b.box(2.4, 0.05, 6, 0, G, 5.6, 0xd6c49c);
};

// ===== المرافق العامة (مشاريع البلدية) =====
const dome = (b, r, x, y, z, col) => b.add(new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), col, { x, y, z });
const win = (b, x, y, z, w = 1.2, h = 1.4, col = K.glassD) => b.box(w, h, 0.12, x, y, z, col);
const civicSign = (b, w, x, y, z, col) => { b.box(w, 1.1, 0.22, x, y, z, col); b.box(w - 0.5, 0.6, 0.24, x, y + 0.25, z, K.white); };
const fence = (b, col = 0x5f6b63, gate = 4) => {
  for (const s of [-1, 1]) { b.box(0.15, 1.1, 19.4, s * 9.7, G, 0, col); b.box((19.4 - gate) / 2, 1.1, 0.15, s * (gate / 2 + (19.4 - gate) / 4), G, 9.7, col); }
  b.box(19.4, 1.1, 0.15, 0, G, -9.7, col);
};
const car = (b, x, z, col, ry = 0) => { b.box(1.7, 0.7, 3.6, x, G + 0.25, z, col, ry); b.box(1.5, 0.6, 1.9, x, G + 0.95, z, K.glassD, ry); };
const person = (b, x, z, col) => { b.cyl(0.2, 0.24, 1.0, x, G, z, col, 6); b.ball(0.2, x, G + 1.2, z, 0xc99a74); };

Object.assign(MODELS, {
  mosque(b) {
    base(b, 0xe8e1d2);
    const w = 0xf6f1e6, tr = 0xc9a86a, gr = 0x2f7d4f;
    b.box(12, 5, 10, 0, G, -3.5, w); b.box(12.4, 0.5, 10.4, 0, G + 5, -3.5, tr);
    for (let i = -5.4; i <= 5.4; i += 0.9) b.box(0.4, 0.5, 0.4, i, G + 5.5, 1.5, tr);
    b.cyl(3.4, 3.6, 1.2, 0, G + 5.5, -3.5, w, 16); dome(b, 3.4, 0, G + 6.7, -3.5, gr);
    b.cyl(0.08, 0.08, 1.2, 0, G + 10, -3.5, K.gold, 6); b.ball(0.3, 0, G + 11.3, -3.5, K.gold);
    // منارة
    b.cyl(0.9, 1.0, 11, 6.8, G, -6.8, w, 8); b.cyl(1.35, 1.35, 0.5, 6.8, G + 8.5, -6.8, tr, 8); b.cyl(0.7, 0.8, 2.2, 6.8, G + 11, -6.8, w, 8);
    b.add(new THREE.ConeGeometry(0.85, 2, 8), gr, { x: 6.8, y: G + 14.2, z: -6.8 }); b.ball(0.2, 6.8, G + 15.4, -6.8, K.gold);
    // رواق بأقواس
    b.box(12, 0.3, 3, 0, G, 3, 0xd6c9ad);
    for (let i = -2; i <= 2; i++) { b.box(0.5, 3.4, 0.5, i * 2.6, G, 4.2, w); }
    b.box(12, 0.8, 0.6, 0, G + 3.4, 4.2, tr);
    for (let i = -2; i < 2; i++) dome(b, 1.0, i * 2.6 + 1.3, G + 3.1, 1.55, w);
    b.box(2, 3, 0.15, 0, G, 1.52, 0x6b4a2a);
    for (const x of [-4, 4]) win(b, x, G + 1.6, 1.52, 1.2, 2, 0x2f6f5a);
    // ميضأة ونخيل
    b.box(4, 1, 2, -6.5, G, 6.8, 0xd6c9ad); for (let k = 0; k < 3; k++) b.cyl(0.1, 0.1, 0.5, -7.6 + k * 1.1, G + 1, 6.8, K.metal, 6);
    for (const [x, z] of [[-8, -8], [8.5, 4]]) { for (let i = 0; i < 5; i++) b.cyl(0.15, 0.17, 0.6, x, G + i * 0.6, z, 0x8a6a42, 7); for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.3, 0.05, 1.6, x + Math.sin(a) * 0.7, G + 3.3, z + Math.cos(a) * 0.7, i % 2 ? K.leaf : K.leaf2, { rx: -0.45, ry: a }); } }
  },
  school(b) {
    base(b, 0xd8d2c4);
    const c = 0xe9d9b0, tr = 0x2f6fb5;
    // مبنى على شكل L بطابقين
    b.box(16, 6.4, 6, 0, G, -6, c); b.box(16.3, 0.4, 6.3, 0, G + 6.4, -6, tr);
    b.box(5, 6.4, 7, -5.5, G, 0.5, c); b.box(5.3, 0.4, 7.3, -5.5, G + 6.4, 0.5, tr);
    for (const y of [1.2, 4.2]) { for (let i = -1; i <= 6; i++) win(b, -7 + i * 2, G + y, -2.95, 1.3, 1.4); for (let z = -1.5; z <= 2.5; z += 2) b.box(0.12, 1.4, 1.3, -2.95, G + y, z, K.glassD); }
    b.box(1.2, 6.4, 0.4, 0, G, -2.8, tr);
    b.box(2.4, 2.6, 0.15, 3, G, -2.95, 0x6b4a2a); b.box(4, 0.3, 1.6, 3, G + 2.8, -2.2, tr);
    civicSign(b, 7, 3, G + 4.9, -2.85, tr);
    // ساحة الطابور وسارية العلم
    b.box(8, 0.03, 6, 4, G, 3, 0xbfb6a3);
    b.cyl(0.08, 0.1, 7, 8.5, G, 0, K.metal, 6); b.box(1.8, 1.1, 0.05, 9.4, G + 5.7, 0, K.red);
    // ملعب صغير وسلال
    b.box(7, 0.04, 5, 3.5, G, 6.8, 0x3f8f5a); b.box(6.6, 0.02, 0.1, 3.5, G + 0.04, 6.8, K.white);
    for (const x of [0.3, 6.7]) { b.box(0.1, 1.2, 1.4, x, G, 6.8, K.white); }
    // باص المدرسة
    b.box(2.2, 2, 6, -7.5, G + 0.3, 6.5, 0xf2c230); b.box(2.25, 0.7, 5, -7.5, G + 1.3, 6.2, K.glassD);
    for (const z of [4.5, 8.5]) for (const x of [-8.6, -6.4]) b.add(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 10), 0x161718, { rz: Math.PI / 2, x, y: G + 0.4, z });
    for (const [x, z] of [[1, 2], [2, 3.4], [5.5, 2.2], [6.5, 3.6]]) person(b, x, z, [0x2f6fb5, 0xf4f1ea][(x | 0) % 2]);
  },
  clinic(b) {
    base(b, 0xe4e7e6);
    const w = 0xf7f8f6, tl = 0x1f9e8f, red = 0xd23a35;
    b.box(14, 5.5, 9, 0, G, -4, w); b.box(14.3, 0.5, 9.3, 0, G + 5.5, -4, tl);
    b.box(6, 3, 0.2, 0, G + 2.6, 0.6, tl);
    for (let i = -3; i <= 3; i++) if (Math.abs(i) > 1) { win(b, i * 1.9, G + 1.2, 0.55, 1.2, 1.4, 0x8fc7de); win(b, i * 1.9, G + 3.6, 0.55, 1.2, 1.2, 0x8fc7de); }
    b.box(3.2, 2.5, 0.15, 0, G, 0.6, 0x8fc7de); b.box(5, 0.3, 3, 0, G + 2.7, 1.8, w);
    for (const x of [-2.3, 2.3]) b.box(0.25, 2.7, 0.25, x, G, 3.1, w);
    // صليب/هلال أحمر على السطح والواجهة
    b.box(2.6, 0.8, 0.3, 0, G + 3.9, 0.75, red); b.box(0.8, 2.6, 0.3, 0, G + 3, 0.75, red);
    b.box(2, 1.2, 2, 4.5, G + 6, -6, 0xc4c9c7);
    // سيارة إسعاف ومواقف
    b.box(2.2, 2.2, 5, -6.5, G + 0.3, 5.5, w); b.box(2.25, 0.4, 5.05, -6.5, G + 1.2, 5.5, red); b.box(2.1, 0.8, 1.2, -6.5, G + 1.6, 7.6, K.glassD); b.box(0.8, 0.3, 0.5, -6.5, G + 2.5, 6, 0x3a7bd5);
    for (const z of [3.6, 7.4]) for (const x of [-7.6, -5.4]) b.add(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 10), 0x161718, { rz: Math.PI / 2, x, y: G + 0.4, z });
    for (let i = 0; i < 3; i++) b.box(0.1, 0.02, 4, 2.6 + i * 2.6, G, 6.5, K.white);
    car(b, 4, 6.5, 0x8a9aa8); car(b, 6.6, 6.5, K.white);
    for (const x of [-9, 9]) tree(b, x, -0.5, 0.8);
  },
  library(b) {
    base(b, 0xddd3bf);
    const st = 0xcdb58f, dk = 0x7a5230, cl = 0xefe6d2;
    b.box(15, 0.8, 10, 0, G, -3.5, st); b.box(15, 0.4, 1.4, 0, G, 2.2, st);
    b.box(14, 5.5, 8.5, 0, G + 0.8, -4, cl); b.box(14.6, 0.6, 9.1, 0, G + 6.3, -4, dk);
    b.gable(10, 2.2, 3.2, 0, G + 6.9, 0.5, st);
    for (let i = -2; i <= 2; i++) b.cyl(0.38, 0.42, 5.5, i * 2.1, G + 0.8, 1.3, cl, 10);
    b.box(10.6, 0.6, 3.4, 0, G + 6.3, 0.5, dk);
    b.box(2, 3, 0.15, 0, G + 0.8, 0.27, dk);
    for (const x of [-4.2, -2.1, 2.1, 4.2]) win(b, x, G + 2.2, 0.27, 1.1, 2.6, 0x3d5a73);
    // كتاب مفتوح شعار فوق الباب
    b.slab(1.2, 0.08, 0.9, -0.55, G + 4.7, 0.35, K.white, { rz: 0.35 }); b.slab(1.2, 0.08, 0.9, 0.55, G + 4.7, 0.35, K.white, { rz: -0.35 });
    // جلسات قراءة في الحديقة
    for (const x of [-6, 6]) { bench(b, x, 6, 0); tree(b, x, 8, 0.85); }
    b.box(3, 0.05, 5, 0, G, 6.3, 0xc9c3b6);
    person(b, -5.6, 5.4, 0x9b2f35); person(b, 6.4, 5.4, 0x2f6fb5);
  },
  bus(b) {
    base(b, 0x9a9a98);
    // مسار الحافلات
    b.box(20, 0.03, 6, 0, G, 3.5, 0x55585c);
    for (let x = -8; x <= 8; x += 3) b.box(1.6, 0.02, 0.2, x, G + 0.03, 3.5, K.white);
    b.box(20, 0.3, 1.2, 0, G, -0.2, 0xc9c3b6);
    // مظلة انتظار مكيفة
    b.box(12, 0.25, 4, 0, G + 3.2, -2, 0x2f6fb5); b.box(12.4, 0.12, 4.4, 0, G + 3.45, -2, K.white);
    for (const x of [-5.6, 5.6]) for (const z of [-3.7, -0.4]) b.box(0.2, 3.2, 0.2, x, G, z, K.metal);
    b.box(11, 2.6, 0.1, 0, G + 0.3, -3.8, K.glass);
    for (const x of [-3.5, 0, 3.5]) bench(b, x, -2.7, 0);
    b.box(1.6, 2.2, 0.3, 6.5, G, -1.5, K.dark); b.box(1.4, 1.2, 0.32, 6.5, G + 0.8, -1.5, 0x3fb0c8);
    civicSign(b, 5, 0, G + 3.6, -0.1, 0x2f6fb5);
    // حافلة
    b.box(2.5, 2.6, 9, -4, G + 0.4, 3.5, 0xe9e6dd, Math.PI / 2);
    b.box(2.55, 0.9, 8, -4, G + 1.6, 3.5, K.glassD, Math.PI / 2);
    b.box(2.56, 0.35, 9.02, -4, G + 0.9, 3.5, 0x2f6fb5, Math.PI / 2);
    for (const x of [-7.3, -0.9]) for (const z of [2.2, 4.8]) b.add(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 10), 0x161718, { rx: Math.PI / 2, x, y: G + 0.5, z });
    for (const [x, z] of [[2, -2], [3, -1], [-1.5, -1]]) person(b, x, z, [0xc8432f, 0x2f7d4f, 0x8c2f6f][(x + 2 | 0) % 3]);
    for (const x of [-9, 9]) tree(b, x, -7, 0.8);
  },
  fire(b) {
    base(b, 0xcfcac0);
    const r = 0xc0352b, w = 0xf1ece2;
    b.box(14, 6, 9, -1, G, -4.5, w); b.box(14.3, 0.5, 9.3, -1, G + 6, -4.5, r);
    for (const x of [-5, -1, 3]) { b.box(3.2, 4, 0.15, x, G, 0.02, 0x3a3d42); for (let y = 0.6; y < 4; y += 0.6) b.box(3.1, 0.06, 0.17, x, G + y, 0.03, 0x6b6f75); }
    b.box(13, 1.1, 0.2, -1, G + 4.5, 0.05, r); b.box(12, 0.6, 0.22, -1, G + 4.75, 0.05, w);
    // برج التدريب
    b.box(3, 12, 3, 7.6, G, -6, 0xb5463f); b.box(3.4, 0.4, 3.4, 7.6, G + 12, -6, w);
    for (let y = 2; y < 12; y += 2.4) win(b, 7.6, G + y, -4.45, 1.2, 1.2);
    // سيارات إطفاء خارجة
    for (const x of [-5, 3]) {
      b.box(2.4, 1.6, 6, x, G + 0.4, 4.4, r); b.box(2.3, 1.1, 1.6, x, G + 2, 6.4, r); b.box(2.2, 0.7, 0.1, x, G + 2.2, 7.22, K.glassD);
      b.box(0.3, 0.3, 5, x, G + 2.1, 3.6, K.metal); b.box(1.6, 0.25, 0.3, x, G + 3.1, 6.6, 0x3a7bd5);
      for (const z of [2.4, 6.2]) for (const dx of [-1.2, 1.2]) b.add(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 10), 0x161718, { rz: Math.PI / 2, x: x + dx, y: G + 0.5, z });
    }
    b.cyl(0.3, 0.35, 0.9, 8.5, G, 6, r, 8);
  },
  gym(b) {
    base(b, 0xd2cec6);
    const c = 0x3a4048, ac = 0xe07a2a;
    b.box(12, 6, 10, -3, G, -4, c); b.box(12.3, 0.4, 10.3, -3, G + 6, -4, ac);
    b.box(11, 3.8, 0.12, -3, G + 1, 1.02, K.glass);
    for (let i = -2; i <= 2; i++) b.box(0.2, 6, 0.3, -3 + i * 2.75, G, 1.05, ac);
    civicSign(b, 7, -3, G + 4.9, 1.15, ac);
    // أوزان داخل الزجاج
    for (const x of [-6, -3, 0]) { b.box(0.08, 0.08, 1.6, x, G + 1.2, 0, K.metal); for (const z of [-0.8, 0.8]) b.add(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 10), K.dark, { rx: Math.PI / 2, x, y: G + 1.2, z }); }
    // ملعب سلة مكشوف
    b.box(7, 0.04, 10, 6, G, 0, 0x2f6fb5); b.box(6.6, 0.02, 0.08, 6, G + 0.04, 0, K.white);
    b.add(new THREE.TorusGeometry(1.4, 0.06, 4, 20), K.white, { rx: Math.PI / 2, x: 6, y: G + 0.05, z: 0 });
    for (const s of [-1, 1]) { b.box(0.15, 3, 0.15, 6, G, s * 4.6, K.metal); b.box(1.6, 1, 0.08, 6, G + 3, s * 4.3, K.white); b.add(new THREE.TorusGeometry(0.3, 0.04, 4, 12), ac, { rx: Math.PI / 2, x: 6, y: G + 3.1, z: s * 3.95 }); }
    b.ball(0.25, 5, G + 0.25, 1, ac);
    for (const [x, z] of [[5, -1.5], [7, 2]]) person(b, x, z, ac);
    tree(b, -8.5, 7, 0.8); car(b, -4, 6.5, 0xc8432f, Math.PI / 2);
  },
  stadium(b) {
    base(b, 0xbfc4bb);
    // عشب بخطوط
    for (let i = 0; i < 6; i++) b.box(13, 0.06, 2, 0, G, -5 + i * 2, i % 2 ? 0x4fa84a : 0x5cb556);
    const L = (w, d, x, z) => b.box(w, 0.02, d, x, G + 0.07, z, K.white);
    L(13, 0.12, 0, -6); L(13, 0.12, 0, 6); L(0.12, 12, -6.5, 0); L(0.12, 12, 6.5, 0); L(13, 0.1, 0, 0);
    b.add(new THREE.TorusGeometry(1.6, 0.06, 4, 24), K.white, { rx: Math.PI / 2, x: 0, y: G + 0.08, z: 0 });
    for (const s of [-1, 1]) { b.box(0.12, 1.2, 0.12, s * 6.5, G, -1.2, K.white); b.box(0.12, 1.2, 0.12, s * 6.5, G, 1.2, K.white); b.box(0.12, 0.12, 2.5, s * 6.5, G + 1.2, 0, K.white); L(1.6, 3.6, s * 5.7, 0); }
    // مدرجات على الجانبين
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) b.box(15, 0.6, 0.9, 0, G + k * 0.6, s * (7 + k * 0.8), [0xc8432f, 0xf4f1ea, 0x2f7d4f, 0xf4f1ea][k]);
    b.box(9, 0.2, 3.4, 0, G + 3.6, -8.3, K.white); for (const x of [-4.3, 4.3]) b.box(0.2, 3.6, 0.2, x, G, -7.2, K.metal);
    // أبراج إنارة
    for (const [x, z] of [[-8.8, -8.8], [8.8, -8.8], [-8.8, 8.8], [8.8, 8.8]]) { b.cyl(0.15, 0.2, 9, x, G, z, K.metal, 6); b.box(1.8, 1, 0.4, x, G + 9, z, 0xfff3b0); }
    b.ball(0.3, 1, G + 0.3, 1.5, K.white);
    for (const [x, z] of [[-2, 2], [3, -2.5], [-4, -1], [2, 3.5]]) person(b, x, z, (x > 0) ? 0xc8432f : 0x2f6fb5);
  },
  walkway(b) {
    base(b, K.grass);
    // مسار دائري
    b.add(new THREE.RingGeometry(5.4, 7.2, 36), 0xc98a5a, { rx: -Math.PI / 2, y: G + 0.03 });
    b.add(new THREE.RingGeometry(7.2, 7.5, 36), K.white, { rx: -Math.PI / 2, y: G + 0.035 });
    b.box(2.2, 0.03, 3, 0, G, 8.5, 0xc98a5a);
    // نافورة بالوسط
    b.cyl(2.6, 2.8, 0.6, 0, G, 0, 0xd6d1c6, 16); b.cyl(2.3, 2.3, 0.08, 0, G + 0.55, 0, 0x5fb4d6, 16);
    b.cyl(0.3, 0.4, 1.6, 0, G + 0.6, 0, 0xd6d1c6, 8); b.ball(0.5, 0, G + 2.4, 0, 0x8fd3ee);
    // إنارة وجلسات
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, x = Math.sin(a) * 8, z = Math.cos(a) * 8;
      b.cyl(0.07, 0.09, 3, x, G, z, K.dark, 6); b.ball(0.3, x, G + 3.1, z, 0xfff3b0);
      if (i % 2) bench(b, Math.sin(a) * 4.6, Math.cos(a) * 4.6, -a);
    }
    for (const [x, z] of [[-8.5, -8.5], [8.5, -8.5], [-8.5, 3], [8.5, 3], [-3.5, -3.5], [3.5, 3.5]]) tree(b, x, z, 0.8);
    for (const [x, z] of [[6.2, 1], [-1, 6.4], [-6, -2.5]]) person(b, x, z, [0x9b2f35, 0x2f6fb5, 0x8c2f6f][(x + 7 | 0) % 3]);
  },
});

// جناحين حدائق على جانبي المرفق العام (يكمّل عرض القطعتين)
let plazaGeo = null;
export function civicPlazaGeometry() {
  if (plazaGeo) return plazaGeo;
  const b = new Builder();
  for (const s of [-1, 1]) {
    const x = s * 12.6;
    b.box(5.2, G, 20, x, 0, 0, K.grass); b.box(5.2, 0.02, 2.2, x, G, 8.9, K.pave2);
    b.box(1.6, 0.03, 15, x, G, -1.5, 0xc9c3b6);
    for (const z of [-7, -1.5, 4]) tree(b, x + s * 1.5, z, 0.9);
    for (const z of [-4.2, 1.2]) bench(b, x - s * 1.4, z, Math.PI / 2);
    b.cyl(0.07, 0.09, 3.2, x - s * 1.5, G, 6.4, K.dark, 6); b.ball(0.32, x - s * 1.5, G + 3.3, 6.4, 0xfff3b0);
    for (let z = -9.5; z <= 9.5; z += 1.9) b.ball(0.45, x + s * 2.3, G + 0.35, z, K.leaf2);
  }
  return (plazaGeo = b.build());
}

const cache = new Map();
export function estateGeometry(type) {
  if (!cache.has(type)) { const b = new Builder(); (MODELS[type] || MODELS.shop)(b); cache.set(type, b.build()); }
  return cache.get(type);
}

// لوحة باسم المالك فوق الواجهة (نص على قماش ثنائي الأبعاد)
export function estateSign(user, label, icon) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#1f2a24'; x.beginPath(); x.roundRect(4, 4, 504, 120, 26); x.fill();
  x.strokeStyle = '#ffd84a'; x.lineWidth = 6; x.stroke();
  x.fillStyle = '#ffd84a'; x.font = '800 30px Tajawal, "Segoe UI Emoji", sans-serif'; x.textAlign = 'center'; x.direction = 'rtl';
  x.fillText(`${icon} ${label}`, 256, 46);
  x.fillStyle = '#ffffff'; x.font = '800 40px "Segoe UI", Roboto, sans-serif'; x.direction = 'ltr';
  if (user === 'الحكومة') { x.direction = 'rtl'; x.font = '900 40px Tajawal, "Segoe UI Emoji", sans-serif'; x.fillText('🏛️ مشروع الحكومة', 256, 98, 480); }
  else x.fillText('@' + user, 256, 98, 480);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  m.userData.own = true;
  return m;
}
export const SIGN_Y = { shop: 6.6, cafe: 6.8, restaurant: 7.4, market: 4.6, supermarket: 8.0, park: 3.4, gas: 7.6, mall: 12.4, apartments: 4.2, tower: 6.4, villa_modern: 3.2, villa_arabic: 4.0,
  mosque: 7.2, school: 8.0, clinic: 7.4, library: 9.8, bus: 5.2, fire: 7.8, gym: 7.4, stadium: 5.2, walkway: 4.0 };
