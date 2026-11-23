// مدينة ملاهي قارتنا + أكوا قارتنا (Low Poly): على الشاطئ الشمالي الشرقي جنب الموج. إحداثيات عالمية (الشمال = -z = البحر).
// الملاهي (غرب splitX): عجلة دوّارة عملاقة، أفعوانية بقطار يتحرك، برج سقوط حر، دوّامة خيول، سفينة القراصنة، فناجين دوّارة، مطاعم.
// الملاهي المائية (شرق splitX): حوض أمواج، نهر كسول بعوّامات، برج زحاليق ملوّنة وحوض سقوط، منطقة أطفال، وشاطئ بمظلات.
import * as THREE from 'three';
import { Builder } from './houses.js';

export const THEMEPARK_INFO = { name: 'مدينة ملاهي قارتنا', water: 'أكوا قارتنا' };
const K = {
  grass: 0x86ca63, grassD: 0x74b955, pave: 0xe9dcc4, pave2: 0xd9c7a6, sand: 0xf2deb0, sandD: 0xe6cc92, water: 0x3fc1e8, waterD: 0x1f9fd0, waterL: 0x8fe3f5,
  white: 0xffffff, dark: 0x2a2d33, steel: 0xb7c0c8, red: 0xe0453a, yellow: 0xf6c533, blue: 0x2f7fd6, green: 0x35a35a, purple: 0x8a4fd0, pink: 0xf07ab0,
  orange: 0xf28a2e, teal: 0x22b3a6, wood: 0x9a6b42, trunk: 0x8a6a42, leaf: 0x3f8f45, leafL: 0x57a84e, roof: 0xd8463a,
};
const BRIGHT = [K.red, K.yellow, K.blue, K.green, K.purple, K.pink, K.orange, K.teal];

function palm(b, x, z, h = 7) {
  b.cyl(0.24, 0.32, h, x, 0, z, K.trunk, 6);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.45, 0.07, 2.8, x + Math.sin(a) * 1.2, h - 0.2, z + Math.cos(a) * 1.2, i % 2 ? K.leaf : K.leafL, { rx: -0.45, ry: a }); }
}
function tree(b, x, z, s = 1) { b.cyl(0.25 * s, 0.35 * s, 2.2 * s, x, 0, z, K.trunk, 6); b.ball(1.9 * s, x, 3.4 * s, z, K.leaf); b.ball(1.3 * s, x + 0.7 * s, 4.5 * s, z - 0.3 * s, K.leafL); }
// أسطوانة بين نقطتين (دعامات، أذرع، قضبان)
function rod(b, a, c, r, col, seg = 6) {
  const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c), d = C.clone().sub(A), L = d.length();
  const g = new THREE.CylinderGeometry(r, r, L, seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  g.translate((A.x + C.x) / 2, (A.y + C.y) / 2, (A.z + C.z) / 2);
  b.add(g, col);
}
function umbrella(b, x, z, col) { b.cyl(0.08, 0.08, 2.6, x, 0, z, K.white, 5); b.add(new THREE.ConeGeometry(2.2, 0.9, 8), col, { x, y: 2.9, z }); }
function lounger(b, x, z, ry = 0) { b.slab(0.9, 0.2, 2.2, x, 0.45, z, K.white, { ry }); b.slab(0.9, 0.2, 0.9, x + Math.sin(ry) * -1.1, 0.8, z + Math.cos(ry) * -1.1, K.white, { rx: 0.7, ry }); }
function canvasTex(draw, w = 1024, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  const run = () => { g.clearRect(0, 0, w, h); draw(g, w, h); tex.needsUpdate = true; };
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; run();
  if (document.fonts) document.fonts.load('900 100px Tajawal').then(run).catch(() => {});
  return tex;
}
const signTex = (ar, en, bg, fg = '#ffffff') => canvasTex((g, W, H) => {
  const gr = g.createLinearGradient(0, 0, W, 0); bg.forEach((c, i) => gr.addColorStop(i / (bg.length - 1), c));
  g.fillStyle = gr; g.beginPath(); g.roundRect(4, 4, W - 8, H - 8, 60); g.fill();
  g.lineWidth = 10; g.strokeStyle = '#ffffff'; g.stroke();
  g.fillStyle = fg; g.textAlign = 'center'; g.direction = 'rtl'; g.font = '900 108px Tajawal, "Segoe UI Emoji", Tahoma, sans-serif'; g.fillText(ar, W / 2, 132, W - 60);
  g.font = '800 40px "Segoe UI", Roboto, sans-serif'; g.direction = 'ltr'; g.fillText(en, W / 2, 205, W - 60);
}, 2048, 256);
const sign = (root, tex, w, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 8), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };

// إطار التصميم الثابت (الشمال والشرق بحر). المجمع ينبني فيه ثم يتلف ويتحرك لموقعه من lib/layout.js (cx, cz, rot).
const D = { x0: 1690, x1: 2300, z0: -600, z1: -240, splitX: 2010, gateZ: -470, roadX: 1850 };
const DC = { x: (D.x0 + D.x1) / 2, z: (D.z0 + D.z1) / 2 };
// نقطة من إطار التصميم → العالم
const toWorld = (P, [x, y, z]) => { const r = P.rot || 0, c = Math.cos(r), s = Math.sin(r), dx = x - DC.x, dz = z - DC.z; return [(P.cx ?? DC.x) + dx * c + dz * s, y, (P.cz ?? DC.z) - dx * s + dz * c]; };

export function buildThemePark(P, mat) {
  const S = D;
  const root = new THREE.Group(), b = new Builder(), g = new Builder(), L = new Builder();
  const lightMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  const lightMeshes = [];
  const mk = (builder, m = mat) => { const o = new THREE.Mesh(builder.build(), m); o.castShadow = true; o.receiveShadow = true; return o; };
  const mkL = (builder) => { const o = new THREE.Mesh(builder.build(), lightMat); o.visible = false; lightMeshes.push(o); return o; };
  const X0 = S.x0, X1 = S.x1, Z0 = S.z0, Z1 = S.z1, SX = S.splitX, BZ = Z0 + 40; // BZ = نهاية الشاطئ الشمالي
  const anim = [];

  // ---------- الأرض: عشب + شاطئ شمالي وشرقي ----------
  b.box(X1 - X0, 0.04, Z1 - Z0, (X0 + X1) / 2, 0, (Z0 + Z1) / 2, K.grass);
  b.box(X1 - X0, 0.08, BZ - Z0 + 30, (X0 + X1) / 2, 0.02, Z0 - 15 + (BZ - Z0) / 2 + 7, K.sand);
  b.box(36, 0.08, Z1 - Z0, X1 - 4, 0.02, (Z0 + Z1) / 2, K.sand);
  for (let x = X0 + 20; x < X1 - 10; x += 26) { umbrella(b, x, Z0 + 14, BRIGHT[Math.round(x / 26) % BRIGHT.length]); lounger(b, x - 2.6, Z0 + 18); lounger(b, x + 2.6, Z0 + 18); }
  for (let z = Z0 + 50; z < Z1 - 20; z += 30) { umbrella(b, X1 - 8, z, BRIGHT[Math.round(-z / 30) % BRIGHT.length]); lounger(b, X1 - 12, z, Math.PI / 2); }
  for (let x = X0 + 8; x < X1; x += 52) palm(b, x, BZ - 2, 8);
  // برج منقذ
  for (const [x, z] of [[1900, Z0 + 8], [2190, Z0 + 8]]) { for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(0.25, 4, 0.25, x + sx * 1.2, 0, z + sz * 1.2, K.white); b.box(3.4, 0.3, 3.4, x, 4, z, K.white); b.box(3, 2.2, 3, x, 4.3, z, K.red); b.box(3.6, 0.3, 3.6, x, 6.5, z, K.white); }

  // ---------- السور والبوابات ----------
  const fence = (x0, z0, x1, z1, col = K.white) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len, ry = Math.atan2(-uz, ux);
    b.box(len, 0.2, 0.2, (x0 + x1) / 2, 1.9, (z0 + z1) / 2, col, ry); b.box(len, 0.2, 0.2, (x0 + x1) / 2, 0.9, (z0 + z1) / 2, col, ry);
    for (let t = 0, k = 0; t <= len; t += 3, k++) b.box(0.35, 2.4, 0.35, x0 + ux * t, 0, z0 + uz * t, BRIGHT[k % BRIGHT.length]);
  };
  const GX = S.roadX, WG = S.gateZ;
  const AEX = SX + 100; // مدخل أكوا قارتنا
  fence(X0, Z1, GX - 14, Z1); fence(GX + 14, Z1, AEX - 19, Z1); fence(AEX + 19, Z1, X1 - 22, Z1);
  fence(X0, BZ, X0, WG - 10); fence(X0, WG + 10, X0, Z1);
  fence(SX, BZ, SX, -440); fence(SX, -425, SX, Z1, K.waterL);
  // البوابة الجنوبية: برجين قلعة بأسقف مخروطية وقوس ملوّن
  for (const s of [-1, 1]) {
    const x = GX + s * 16;
    b.cyl(5, 5.5, 22, x, 0, Z1, s < 0 ? K.purple : K.blue, 10); b.cyl(5.8, 5.8, 1.2, x, 22, Z1, K.yellow, 10);
    b.add(new THREE.ConeGeometry(6.4, 12, 10), K.red, { x, y: 29.2, z: Z1 }); b.cyl(0.12, 0.12, 4, x, 35, Z1, K.dark, 4); b.box(2.4, 1.4, 0.1, x + 1.2, 37.6, Z1, K.yellow);
    for (let i = 0; i < 4; i++) L.ball(0.5, x + Math.sin(i * 1.6) * 5.2, 8 + i * 4, Z1 + Math.cos(i * 1.6) * 5.2, 0xffe08a);
  }
  b.box(28, 4.6, 3, GX, 14, Z1, K.pink); b.box(28.6, 1, 3.4, GX, 18.6, Z1, K.yellow);
  sign(root, signTex('🎡 مدينة ملاهي قارتنا', 'QARATNA THEME PARK', ['#8a4fd0', '#f07ab0', '#f28a2e']), 26, GX, 16.3, Z1 + 1.56);
  for (const s of [-1, 1]) { b.box(6, 3.2, 4, GX + s * 30, 0, Z1 - 6, K.white); b.box(6.6, 0.5, 4.6, GX + s * 30, 3.2, Z1 - 6, BRIGHT[s + 1]); } // شبابيك التذاكر
  // البوابة الغربية (من طريق الموج)
  for (const s of [-1, 1]) { b.cyl(2.4, 2.6, 12, X0, 0, WG + s * 9, K.teal, 8); b.add(new THREE.ConeGeometry(3, 6, 8), K.yellow, { x: X0, y: 15, z: WG + s * 9 }); }
  b.box(3, 3, 20, X0, 9, WG, K.purple);
  sign(root, signTex('🎡 ملاهي قارتنا', 'THEME PARK', ['#22b3a6', '#2f7fd6']), 16, X0 - 1.6, 10.5, WG, -Math.PI / 2);

  // ---------- الممرات والساحة ----------
  b.box(14, 0.08, Z1 - (-500), GX, 0.04, (Z1 - 500) / 2, K.pave);
  b.box(SX - X0 - 20, 0.08, 12, (X0 + SX) / 2, 0.04, -330, K.pave);
  b.box(SX - X0 - 20, 0.08, 12, (X0 + SX) / 2, 0.04, -480, K.pave);
  b.box(14, 0.08, 160, X0 + 24, 0.04, -400, K.pave);
  b.box(14, 0.08, 160, SX - 24, 0.04, -400, K.pave);
  b.cyl(18, 18, 0.1, GX, 0.04, -280, K.pave2, 28); b.cyl(6, 6.4, 1, GX, 0.1, -280, K.white, 20); b.cyl(5.4, 5.4, 0.1, GX, 1.1, -280, K.water, 20); b.ball(1.6, GX, 3.2, -280, K.yellow);
  // مطاعم وأكشاك حول الساحة
  const stall = (x, z, col, ry = 0) => { b.box(6, 3.2, 5, x, 0, z, K.white, ry); for (let i = 0; i < 6; i++) b.slab(1, 0.12, 2.4, x - 2.5 + i, 3.6, z + 1.6, i % 2 ? col : K.white, { rx: 0.35 }); b.box(6.4, 0.4, 5.4, x, 3.2, z, col, ry); };
  [[GX - 34, -268, K.red], [GX - 34, -292, K.yellow], [GX + 34, -268, K.blue], [GX + 34, -292, K.green]].forEach(([x, z, c]) => stall(x, z, c));
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; umbrella(b, GX + Math.cos(a) * 26, -280 + Math.sin(a) * 9, BRIGHT[i]); }

  // ---------- العجلة الدوّارة العملاقة ----------
  const FW = { x: X0 + 70, z: -525, y: 58, R: 48 };
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) rod(b, [FW.x + sx * 22, 0, FW.z + sz * 9], [FW.x, FW.y, FW.z + sz * 3.4], 0.9, K.white, 8);
  b.box(50, 1.4, 22, FW.x, 0, FW.z, K.pave2); b.box(10, 3.2, 6, FW.x, 0, FW.z + 10, K.purple);
  { const hub = new THREE.CylinderGeometry(2.4, 2.4, 9, 12); hub.rotateX(Math.PI / 2); hub.translate(FW.x, FW.y, FW.z); b.add(hub, K.dark); }
  const wheel = new THREE.Group(); wheel.position.set(FW.x, FW.y, FW.z);
  const wb = new Builder(), wl = new Builder();
  for (const sz of [-3.4, 3.4]) {
    const rim = new THREE.TorusGeometry(FW.R, 0.7, 6, 64); rim.translate(0, 0, sz); wb.add(rim, K.white);
    const rim2 = new THREE.TorusGeometry(FW.R - 5, 0.4, 5, 64); rim2.translate(0, 0, sz); wb.add(rim2, K.pink);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; rod(wb, [0, 0, sz], [Math.cos(a) * FW.R, Math.sin(a) * FW.R, sz], 0.32, K.steel, 5); }
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; wl.ball(0.55, Math.cos(a) * FW.R, Math.sin(a) * FW.R, sz * 1.1, BRIGHT[i % BRIGHT.length]); }
  }
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; rod(wb, [Math.cos(a) * FW.R, Math.sin(a) * FW.R, -3.4], [Math.cos(a) * FW.R, Math.sin(a) * FW.R, 3.4], 0.3, K.steel, 5); }
  wheel.add(mk(wb), mkL(wl)); root.add(wheel);
  const cabins = [];
  for (let i = 0; i < 16; i++) {
    const cb = new Builder(), col = BRIGHT[i % BRIGHT.length];
    cb.box(4.2, 3.4, 4.2, 0, -5.6, 0, col); cb.box(4.6, 0.5, 4.6, 0, -2.2, 0, K.white); cb.box(4.3, 1.4, 4.3, 0, -4.4, 0, K.white);
    cb.add(new THREE.ConeGeometry(3.1, 1.4, 4), col, { y: -1.2, ry: Math.PI / 4 }); cb.cyl(0.12, 0.12, 1.2, 0, -1.1, 0, K.dark, 4);
    const m = mk(cb); root.add(m); cabins.push({ m, a: (i / 16) * Math.PI * 2 });
  }
  let wheelA = 0;
  anim.push((dt) => {
    wheelA += dt * 0.12; wheel.rotation.z = wheelA;
    for (const c of cabins) { const a = c.a + wheelA; c.m.position.set(FW.x + Math.cos(a) * FW.R, FW.y + Math.sin(a) * FW.R, FW.z); }
  });

  // ---------- الأفعوانية ----------
  const CP = [
    [1735, 4, -360], [1735, 4, -420], [1760, 8, -455], [1800, 44, -460], [1835, 6, -455], [1870, 30, -450], [1905, 8, -445],
    [1945, 22, -455], [1985, 12, -440], [1990, 26, -400], [1975, 6, -365], [1945, 20, -350], [1905, 5, -355], [1860, 18, -350],
    [1820, 4, -348], [1780, 14, -345], [1750, 6, -345],
  ].map((p) => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(CP, true, 'catmullrom', 0.4);
  b.add(new THREE.TubeGeometry(curve, 420, 0.75, 6, true), K.red);
  const off = new THREE.TubeGeometry(curve, 420, 0.75, 6, true); off.translate(0, -1.4, 0); b.add(off, K.yellow);
  for (let i = 0; i < 140; i++) {
    const p = curve.getPointAt(i / 140);
    if (p.y > 2.6) rod(b, [p.x, 0, p.z], [p.x, p.y - 1.6, p.z], 0.35, K.steel, 5);
  }
  b.box(26, 3, 10, 1736, 0, -390, K.white); b.box(28, 0.6, 12, 1736, 5, -390, K.red); // محطة الأفعوانية
  const train = [];
  for (let i = 0; i < 6; i++) {
    const tb = new Builder(), col = i === 0 ? K.yellow : BRIGHT[(i + 2) % BRIGHT.length];
    tb.box(2.6, 1.4, 3.4, 0, -0.2, 0, col); tb.box(2.2, 0.9, 0.4, 0, 1.2, -1.2, K.dark); tb.ball(0.45, -0.6, 1.5, 0.3, 0xf2c9a0); tb.ball(0.45, 0.6, 1.5, 0.3, 0xf2c9a0);
    const m = mk(tb); root.add(m); train.push(m);
  }
  let tu = 0;
  const UP = new THREE.Vector3(0, 1, 0), M4 = new THREE.Matrix4(), TG = new THREE.Vector3();
  anim.push((dt) => {
    const p0 = curve.getPointAt(tu); tu = (tu + dt * (0.028 + Math.max(0, 40 - p0.y) * 0.0009)) % 1;
    train.forEach((m, i) => {
      const u = (tu - i * 0.009 + 1) % 1, p = curve.getPointAt(u), t = curve.getTangentAt(u);
      m.position.set(p.x, p.y + 1.2, p.z);
      TG.set(p.x + t.x, p.y + 1.2 + t.y, p.z + t.z);
      m.quaternion.setFromRotationMatrix(M4.lookAt(TG, m.position, UP)); // اتجاه محلي (المجمع ملفوف)
    });
  });

  // ---------- برج السقوط الحر ----------
  const DT = { x: SX - 50, z: -525 };
  b.cyl(2.4, 3, 86, DT.x, 0, DT.z, K.white, 12); for (let y = 6; y < 86; y += 8) b.cyl(2.7, 2.7, 0.6, DT.x, y, DT.z, K.blue, 12);
  b.cyl(4, 3, 4, DT.x, 86, DT.z, K.red, 12); b.add(new THREE.ConeGeometry(3, 6, 12), K.yellow, { x: DT.x, y: 93, z: DT.z });
  b.cyl(7, 7.4, 1.2, DT.x, 0, DT.z, K.pave2, 16); L.ball(1.1, DT.x, 97, DT.z, 0xff5a4a);
  const ringB = new Builder(); ringB.cyl(6, 6, 2.4, 0, 0, 0, K.purple, 16); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ringB.box(1.4, 1.6, 1.2, Math.cos(a) * 6.6, 0.4, Math.sin(a) * 6.6, BRIGHT[i % 8], -a); }
  const ring = mk(ringB); ring.position.set(DT.x, 4, DT.z); root.add(ring);
  let dtT = 0;
  anim.push((dt) => {
    dtT = (dtT + dt) % 11; let y;
    if (dtT < 5) y = 4 + 72 * (dtT / 5) ** 1.2; else if (dtT < 6.5) y = 76; else if (dtT < 7.4) y = 76 - 72 * ((dtT - 6.5) / 0.9) ** 2; else y = 4 + 6 * Math.max(0, Math.sin((dtT - 7.4) * 5)) * Math.exp(-(dtT - 7.4) * 2);
    ring.position.y = y;
  });

  // ---------- دوّامة الخيول ----------
  const CR = { x: X0 + 55, z: -290 };
  b.cyl(14, 14.6, 1.2, CR.x, 0, CR.z, K.pave2, 24); b.cyl(1.4, 1.4, 11, CR.x, 1.2, CR.z, K.yellow, 10);
  const carousel = new THREE.Group(); carousel.position.set(CR.x, 0, CR.z);
  const cb2 = new Builder();
  cb2.cyl(13, 13, 0.8, 0, 1.2, 0, K.white, 24); cb2.add(new THREE.ConeGeometry(15, 5, 16), K.red, { y: 14.5 }); cb2.cyl(15, 15, 1.4, 0, 11, 0, K.yellow, 16);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; cb2.slab(4, 1.6, 0.2, Math.cos(a) * 15.1, 11.5, Math.sin(a) * 15.1, i % 2 ? K.red : K.white, { ry: -a + Math.PI / 2 }); }
  const horses = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2, x = Math.cos(a) * 9.5, z = Math.sin(a) * 9.5;
    cb2.cyl(0.14, 0.14, 9.8, x, 2, z, K.yellow, 5);
    const hb = new Builder(), col = [K.white, 0x6b4a2a, K.pink, 0x2a2d33][i % 4];
    hb.box(1, 1.3, 3, 0, 0, 0, col); hb.box(0.9, 1.7, 0.9, 0, 0.9, 1.4, col); hb.box(0.6, 0.6, 1.2, 0, 2.1, 1.9, col); for (const s of [-1, 1]) for (const t of [-1, 1]) hb.box(0.25, 1.4, 0.25, s * 0.3, -1.4, t * 1.1, col);
    const h = mk(hb); h.position.set(x, 4.5, z); h.rotation.y = -a; carousel.add(h); horses.push({ h, ph: i * 1.3 });
  }
  carousel.add(mk(cb2)); root.add(carousel);
  let crT = 0;
  anim.push((dt) => { crT += dt; carousel.rotation.y = crT * 0.5; for (const o of horses) o.h.position.y = 4.5 + Math.sin(crT * 3 + o.ph) * 0.8; });

  // ---------- سفينة القراصنة ----------
  const PS = { x: SX - 60, z: -290, h: 24 };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) rod(b, [PS.x + sx * 14, 0, PS.z + sz * 6], [PS.x, PS.h, PS.z + sz * 3], 0.7, K.blue, 6);
  rod(b, [PS.x, PS.h, PS.z - 4], [PS.x, PS.h, PS.z + 4], 0.9, K.dark, 8);
  b.box(34, 0.8, 16, PS.x, 0, PS.z, K.pave2);
  const swing = new THREE.Group(); swing.position.set(PS.x, PS.h, PS.z);
  const sb = new Builder();
  for (const sz of [-2.6, 2.6]) { rod(sb, [0, 0, sz], [-6, -16, sz], 0.4, K.steel); rod(sb, [0, 0, sz], [6, -16, sz], 0.4, K.steel); }
  sb.box(20, 3.2, 6, 0, -19.5, 0, 0x7a4a26); sb.box(20.6, 0.6, 6.6, 0, -16.6, 0, K.yellow);
  sb.add(new THREE.ConeGeometry(3, 4, 4), 0x7a4a26, { rz: Math.PI / 2, x: 11.5, y: -18, ry: 0 }); sb.add(new THREE.ConeGeometry(3, 4, 4), 0x7a4a26, { rz: -Math.PI / 2, x: -11.5, y: -18 });
  sb.cyl(0.25, 0.25, 9, 0, -16.6, 0, K.wood, 5); sb.slab(6, 5, 0.2, 0, -10.5, 0, K.white); sb.box(1.8, 1.2, 0.1, 0.9, -7.2, 0, K.dark);
  swing.add(mk(sb)); root.add(swing);
  let psT = 0;
  anim.push((dt) => { psT += dt; swing.rotation.z = Math.sin(psT * 0.9) * 0.95 * (0.6 + 0.4 * Math.sin(psT * 0.11) ** 2); });

  // ---------- الفناجين الدوّارة ----------
  const TC = { x: GX + 20, z: -525 };
  b.cyl(15, 15.6, 0.8, TC.x, 0, TC.z, K.pink, 24); b.cyl(3, 3, 3, TC.x, 0.8, TC.z, K.yellow, 12); b.add(new THREE.ConeGeometry(4, 3, 12), K.red, { x: TC.x, y: 5.3, z: TC.z });
  const cups = new THREE.Group(); cups.position.set(TC.x, 0.8, TC.z);
  const cupList = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, cb3 = new Builder(), col = BRIGHT[(i + 3) % 8];
    cb3.cyl(2.6, 1.8, 2.4, 0, 0, 0, col, 12); cb3.cyl(2.2, 2.2, 0.2, 0, 2.3, 0, K.white, 12); cb3.cyl(0.6, 0.6, 1.2, 0, 2.3, 0, K.dark, 6);
    const add = new THREE.TorusGeometry(0.9, 0.25, 4, 10, Math.PI); add.rotateZ(-Math.PI / 2); add.translate(2.7, 1.3, 0); cb3.add(add, col);
    const m = mk(cb3); m.position.set(Math.cos(a) * 9, 0, Math.sin(a) * 9); cups.add(m); cupList.push(m);
  }
  root.add(cups);
  let tcT = 0;
  anim.push((dt) => { tcT += dt; cups.rotation.y = tcT * 0.35; cupList.forEach((m, i) => { m.rotation.y = tcT * (1.4 + i * 0.2) * (i % 2 ? 1 : -1); }); });

  // ---------- القلعة (وسط الأفعوانية) ----------
  const CA = { x: 1880, z: -402 };
  b.box(44, 0.3, 32, CA.x, 0, CA.z, K.pave2);
  b.box(36, 12, 22, CA.x, 0, CA.z, 0xf3c6d8); for (let x = CA.x - 17; x <= CA.x + 17; x += 2.6) b.box(1.3, 1.4, 22.4, x, 12, CA.z, 0xf3c6d8);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = CA.x + sx * 18, z = CA.z + sz * 11; b.cyl(3.6, 3.9, 20, x, 0, z, 0xf7d9e5, 10); b.add(new THREE.ConeGeometry(4.6, 9, 10), K.purple, { x, y: 24.5, z }); b.cyl(0.1, 0.1, 3, x, 29, z, K.dark, 4); b.box(1.8, 1, 0.08, x + 0.9, 31, z, K.yellow); }
  b.cyl(5, 5.4, 30, CA.x, 0, CA.z, 0xf7d9e5, 12); b.add(new THREE.ConeGeometry(6.4, 13, 12), K.blue, { x: CA.x, y: 36.5, z: CA.z }); b.ball(0.8, CA.x, 43.4, CA.z, K.yellow);
  b.box(7, 8, 0.4, CA.x, 0, CA.z + 11.2, 0x7a4a26); b.add(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 12, 1, false, -Math.PI / 2, Math.PI), 0x7a4a26, { rx: Math.PI / 2, x: CA.x, y: 8, z: CA.z + 11.2 });
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { g.box(2, 3, 0.3, CA.x + s * (5 + i * 4.5), 5, CA.z + 11.1, 0x6fb6e0); L.box(1.6, 2.6, 0.2, CA.x + s * (5 + i * 4.5), 5.2, CA.z + 11.3, 0xffe6a8); }
  for (let x = CA.x - 20; x <= CA.x + 20; x += 5) { b.box(3, 0.6, 2, x, 0.3, CA.z + 16, K.green); b.ball(0.6, x, 1.2, CA.z + 16, BRIGHT[Math.round(x) % 8]); }
  // ---------- السيارات المتصادمة ----------
  const BC = { x: 1792, z: -402 };
  b.box(34, 0.5, 24, BC.x, 0, BC.z, 0x55585c); b.box(35, 0.8, 25, BC.x, 0, BC.z, K.yellow); b.box(33, 0.3, 23, BC.x, 0.6, BC.z, 0x4a4d52);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.4, 0.4, 7, BC.x + sx * 16.5, 0.6, BC.z + sz * 11.5, K.white, 6);
  b.box(36, 0.8, 26, BC.x, 7.4, BC.z, K.red); b.add(new THREE.ConeGeometry(22, 4, 4), K.yellow, { x: BC.x, y: 10.2, z: BC.z, ry: Math.PI / 4 });
  sign(root, signTex('🚗 السيارات المتصادمة', 'BUMPER CARS', ['#e0453a', '#f28a2e']), 16, BC.x, 9, BC.z + 13.2);
  const bumpers = [];
  for (let i = 0; i < 8; i++) { const cb4 = new Builder(); cb4.box(2.2, 1, 3, 0, 0, 0, BRIGHT[i]); cb4.box(2.6, 0.5, 3.4, 0, 0, 0, K.dark); cb4.ball(0.45, 0, 1.4, -0.2, 0xf2c9a0); cb4.cyl(0.05, 0.05, 5, 0, 1, 0.9, K.steel, 3); const m = mk(cb4); m.position.set(BC.x, 0.9, BC.z); root.add(m); bumpers.push({ m, a: i * 0.8, ra: 9 + (i % 3) * 2.4, rb: 5 + (i % 2) * 3, sp: 0.5 + (i % 4) * 0.15 }); }
  anim.push((dt) => { for (const c of bumpers) { c.a += dt * c.sp; const x = Math.cos(c.a) * c.ra, z = Math.sin(c.a * 1.3) * c.rb; c.m.position.x = BC.x + x; c.m.position.z = BC.z + z; c.m.rotation.y = Math.atan2(-Math.sin(c.a) * c.ra, Math.cos(c.a * 1.3) * 1.3 * c.rb); } });

  // أشجار وإنارة في الملاهي
  for (let x = X0 + 14; x < SX - 10; x += 18) { tree(b, x, Z1 - 8, 0.9); }
  for (let z = -460; z < -260; z += 22) { tree(b, X0 + 8, z, 0.9); tree(b, SX - 8, z, 0.9); }
  for (let z = Z1 - 10; z > -500; z -= 20) for (const s of [-1, 1]) { b.cyl(0.12, 0.16, 5.5, GX + s * 8, 0, z, K.dark, 6); b.ball(0.45, GX + s * 8, 5.7, z, 0xfff3b0); L.ball(0.7, GX + s * 8, 5.7, z, 0xfff3b0); }
  // بالونات
  for (let i = 0; i < 9; i++) { const x = GX - 6 + (i % 3) * 1.6, z = -262 + Math.floor(i / 3) * 1.4; b.ball(0.8, x, 7 + (i % 2), z, BRIGHT[i % 8]); rod(b, [x, 6.2, z], [GX, 1.5, -262], 0.03, K.white, 3); }

  // ================= أكوا قارتنا (الملاهي المائية) =================
  const AX = (SX + X1) / 2;
  b.box(X1 - SX - 40, 0.08, Z1 - BZ - 10, SX + (X1 - SX - 40) / 2, 0.03, (BZ + Z1) / 2 + 5, K.pave);
  // حوض الأمواج: العمق عند الشمال (جهة البحر)، والشاطئ الرملي جنوبه
  const WP = { x0: SX + 40, x1: X1 - 60, z0: BZ + 6, z1: BZ + 86 };
  b.box(WP.x1 - WP.x0 + 4, 0.5, WP.z1 - WP.z0 + 4, (WP.x0 + WP.x1) / 2, 0, (WP.z0 + WP.z1) / 2, K.white);
  for (let i = 0; i < 4; i++) { const zz = WP.z0 + (i + 0.5) * (WP.z1 - WP.z0) / 4; b.box(WP.x1 - WP.x0, 0.12, (WP.z1 - WP.z0) / 4 + 0.1, (WP.x0 + WP.x1) / 2, 0.5, zz, [K.waterD, K.water, K.water, K.waterL][i]); }
  b.box(WP.x1 - WP.x0, 0.14, 14, (WP.x0 + WP.x1) / 2, 0.5, WP.z1 + 7, K.sand);
  const waves = [];
  for (let i = 0; i < 5; i++) { const wb2 = new Builder(); wb2.box(WP.x1 - WP.x0 - 4, 0.18, 1.6, 0, 0, 0, K.white); const m = mk(wb2); m.position.set((WP.x0 + WP.x1) / 2, 0.62, WP.z0); root.add(m); waves.push({ m, ph: i / 5 }); }
  let wvT = 0;
  anim.push((dt) => { wvT += dt * 0.12; for (const w of waves) { const u = (w.ph + wvT) % 1; w.m.position.z = WP.z0 + 3 + u * (WP.z1 - WP.z0 - 6); w.m.scale.set(1, 1, 1 - u * 0.7); } });
  for (let x = WP.x0 + 6; x < WP.x1; x += 16) { umbrella(b, x, WP.z1 + 22, BRIGHT[Math.round(x / 16) % 8]); lounger(b, x - 2.4, WP.z1 + 25); lounger(b, x + 2.4, WP.z1 + 25); }
  // النهر الكسول: حلقة ماء حول جزيرة نخيل، والعوّامات تدور
  const LR = { x: SX + 92, z: -340, r0: 40, r1: 51 };
  { const rg = new THREE.RingGeometry(LR.r0 - 2, LR.r1 + 2, 48); rg.rotateX(-Math.PI / 2); rg.translate(LR.x, 0.2, LR.z); b.add(rg, K.white); }
  { const rg = new THREE.RingGeometry(LR.r0, LR.r1, 48); rg.rotateX(-Math.PI / 2); rg.translate(LR.x, 0.32, LR.z); b.add(rg, K.water); }
  b.cyl(LR.r0 - 2, LR.r0 - 2, 0.3, LR.x, 0.05, LR.z, K.grassD, 32);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; palm(b, LR.x + Math.cos(a) * 24, LR.z + Math.sin(a) * 24, 7 + (i % 3)); }
  b.cyl(6, 6.5, 0.6, LR.x, 0.3, LR.z, K.sand, 16); b.add(new THREE.ConeGeometry(7, 4, 10), K.wood, { x: LR.x, y: 6, z: LR.z }); for (const s of [-1, 1]) for (const t of [-1, 1]) b.cyl(0.2, 0.2, 4, LR.x + s * 4, 0.6, LR.z + t * 4, K.wood, 5);
  for (const a of [0.3, 2.4, 4.4]) { const x = LR.x + Math.cos(a) * (LR.r1 + 1), z = LR.z + Math.sin(a) * (LR.r1 + 1); rod(b, [x - 3, 2.2, z], [x + 3, 2.2, z], 0.4, K.wood); } // جسور خشب
  const tubes = new THREE.Group(); tubes.position.set(LR.x, 0.5, LR.z);
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = (LR.r0 + LR.r1) / 2 + (i % 2 ? 1.5 : -1.5); const tb2 = new Builder(); tb2.add(new THREE.TorusGeometry(1.2, 0.45, 6, 12), BRIGHT[i % 8], { rx: Math.PI / 2 }); tb2.ball(0.4, 0, 0.6, 0, 0xf2c9a0); const m = mk(tb2); m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); tubes.add(m); }
  root.add(tubes);
  anim.push((dt) => { tubes.rotation.y -= dt * 0.08; });
  // برج الزحاليق: 3 زحاليق حلزونية ملوّنة تنزل لحوض السقوط
  const ST = { x: X1 - 70, z: -420, h: 26 };
  b.box(14, ST.h, 14, ST.x, 0, ST.z, K.teal); b.box(18, 1, 18, ST.x, ST.h, ST.z, K.yellow); b.add(new THREE.ConeGeometry(12, 6, 4), K.red, { x: ST.x, y: ST.h + 6, z: ST.z, ry: Math.PI / 4 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.25, 0.25, 5, ST.x + sx * 8.6, ST.h + 1, ST.z + sz * 8.6, K.white, 4);
  for (let y = 2; y < ST.h; y += 3.2) b.slab(4, 0.3, 2, ST.x - 9, y, ST.z - 6 + (y % 6.4 > 3 ? 4 : 0), K.white, { rz: 0.5 }); // درج
  const SP = { x: X1 - 70, z: -345 };
  b.box(40, 0.5, 26, SP.x, 0, SP.z, K.white); b.box(37, 0.14, 23, SP.x, 0.5, SP.z, K.water);
  const slides = [[K.yellow, -16, 1.6], [K.blue, 0, 1.9], [K.red, 16, 1.35]];
  for (const [col, dx, turns] of slides) {
    const pts = [], cxs = ST.x + dx, czs = ST.z + 20 + Math.abs(dx) * 0.25, r = 6.5;
    pts.push(new THREE.Vector3(ST.x + dx * 0.6, ST.h + 0.8, ST.z + 7));
    const n = 40;
    for (let i = 0; i <= n; i++) { const u = i / n, a = -Math.PI / 2 + u * turns * Math.PI * 2 * (dx >= 0 ? 1 : -1); pts.push(new THREE.Vector3(cxs + Math.cos(a) * r, ST.h - 1 - u * (ST.h - 5), czs - 4 + Math.sin(a) * r)); }
    pts.push(new THREE.Vector3(SP.x + dx, 2.4, SP.z - 6)); pts.push(new THREE.Vector3(SP.x + dx, 0.8, SP.z + 2));
    const sc = new THREE.CatmullRomCurve3(pts);
    b.add(new THREE.TubeGeometry(sc, 160, 1.4, 8, false), col);
    for (let i = 4; i < 40; i += 5) { const p = sc.getPointAt(i / 44); if (p.y > 2) rod(b, [p.x, 0, p.z], [p.x, p.y - 1.4, p.z], 0.3, K.steel, 4); }
  }
  // منطقة الأطفال: نوافير فطر ودلو كبير
  const KZ = { x: X1 - 70, z: -285 };
  b.cyl(16, 16, 0.2, KZ.x, 0.05, KZ.z, K.waterL, 24);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2, x = KZ.x + Math.cos(a) * 9, z = KZ.z + Math.sin(a) * 9; b.cyl(0.4, 0.5, 3, x, 0.2, z, K.white, 6); b.add(new THREE.SphereGeometry(2.4, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), BRIGHT[i], { x, y: 3, z }); }
  for (const s of [-1, 1]) b.box(0.6, 9, 0.6, KZ.x + s * 3, 0.2, KZ.z, K.red); b.box(6.6, 0.6, 0.6, KZ.x, 9.2, KZ.z, K.red);
  b.cyl(2.6, 1.8, 3, KZ.x, 5.4, KZ.z, K.yellow, 10);
  // مدخل أكوا قارتنا
  const AE = { x: SX + 100, z: Z1 };
  b.box(34, 7, 10, AE.x, 0, AE.z - 6, K.white); b.box(36, 1, 12, AE.x, 7, AE.z - 6, K.blue);
  for (let i = 0; i < 7; i++) b.add(new THREE.SphereGeometry(2.6, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? K.teal : K.waterL, { x: AE.x - 15 + i * 5, y: 8, z: AE.z - 6 });
  sign(root, signTex('🌊 أكوا قارتنا', 'AQUA QARATNA WATER PARK', ['#22b3a6', '#2f7fd6', '#1f5fb0']), 24, AE.x, 4.4, AE.z - 0.9);
  for (let x = SX + 14; x < X1 - 30; x += 24) if (Math.abs(x - AE.x) > 22) palm(b, x, Z1 - 6, 7);
  // تعبئة سطح الملاهي المائية: نخيل وجلسات بمظلات بين الألعاب
  for (let x = SX + 22, k = 0; x < X1 - 40; x += 26) for (let z = -440; z < -262; z += 28, k++) {
    const dr = Math.hypot(x - LR.x, z - LR.z);
    if (dr < LR.r1 + 10) continue;                                          // النهر الكسول
    if (x > ST.x - 34 && z < SP.z + 18) continue;                           // برج الزحاليق وحوض السقوط
    if (Math.hypot(x - KZ.x, z - KZ.z) < 22 || Math.abs(x - AE.x) < 24 && z > -270) continue;
    if (k % 2) palm(b, x, z, 6 + (k % 3)); else { umbrella(b, x, z, BRIGHT[k % 8]); lounger(b, x - 2.6, z + 2.5); lounger(b, x + 2.6, z + 2.5); }
  }
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.2, r = LR.r1 + 6; lounger(b, LR.x + Math.cos(a) * r, LR.z + Math.sin(a) * r, -a + Math.PI / 2); }

  // ---------- تجميع ----------
  root.add(mk(b), mk(g), mkL(L));
  // نقل المجمع من إطار التصميم لموقعه
  root.position.set(-DC.x, 0, -DC.z);
  const outer = new THREE.Group(); outer.add(root);
  outer.rotation.y = P.rot || 0; outer.position.set(P.cx ?? DC.x, 0, P.cz ?? DC.z);
  outer.userData = {
    civic: 'themepark', center: new THREE.Vector3(P.cx ?? DC.x, 0, P.cz ?? DC.z),
    update(dt, camPos, active) { if (!active) return false; const d = Math.min(dt, 0.1); for (const f of anim) f(d); return true; },
    setNight(on) { for (const m of lightMeshes) m.visible = on; },
  };
  outer.traverse((o) => { if (o.isMesh) o.userData.civic = 'themepark'; });
  return outer;
}

// لقطات الكاميرا (تتحسب في إطار التصميم وتتحول للعالم)
export const themeparkViews = (P) => {
  const cx = DC.x, v = (t, p) => ({ t: toWorld(P, t), p: toWorld(P, p) });
  return {
    all: v([cx, 0, -430], [cx + 40, 360, -40]),
    wheel: v([D.x0 + 70, 50, -525], [D.x0 + 150, 42, -390]),
    coaster: v([1860, 16, -400], [1880, 60, -250]),
    water: v([(D.splitX + D.x1) / 2, 4, -420], [D.x1 + 60, 130, -230]),
    beach: v([cx, 20, -450], [cx - 40, 110, -800]),
  };
};
