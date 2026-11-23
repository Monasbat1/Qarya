// جامعة قارتنا (Low Poly): ورا الصف الحكومي ومقابل الموج. إحداثيات عالمية، المحور الرئيسي شمال-جنوب على x = gateX.
// البوابة الجنوبية على «شارع الجامعة» (من الجادة)، والشمالية على طريق الموج. الساحة الجنوبية فيها نافورة بقبعة تخرّج،
// مبنى الرئاسة بقبة ورواق، المكتبة الزجاجية في الساحة الشمالية، 5 كليات + مركز الطلاب، ملعب ومضمار غربًا، وسكن الطلاب شرقًا.
import * as THREE from 'three';
import { Builder } from './houses.js';

export const UNIVERSITY_INFO = { name: 'جامعة قارتنا' };
const K = {
  stone: 0xeee6d2, stoneD: 0xd8cbab, wall: 0xf5f0e4, brick: 0xb8644a, brickD: 0x8f4a36, roof: 0x6e7175, // roof: رمادي موحد لكل أسطح الجامعة gold: 0xd9a521, purple: 0x4a2f6b,
  glass: 0x5a7f9a, glassL: 0x9fd0e6, paving: 0xe7e0d0, path: 0xd6cdb8, grass: 0x86ca63, grassD: 0x74b955, water: 0x6cc7e6, lot: 0x676b72,
  white: 0xffffff, dark: 0x2a2d33, track: 0xc0533a, hedge: 0x4f9a48, trunk: 0x8a6a42, leaf: 0x3f8f45, leafL: 0x57a84e, pole: 0xc3c8cd,
};
function tree(b, x, z, s = 1) { b.cyl(0.25 * s, 0.35 * s, 2.2 * s, x, 0, z, K.trunk, 6); b.ball(1.9 * s, x, 3.4 * s, z, K.leaf); b.ball(1.3 * s, x + 0.7 * s, 4.5 * s, z - 0.3 * s, K.leafL); }
function palm(b, x, z, h = 6) {
  b.cyl(0.22, 0.3, h, x, 0, z, K.trunk, 6);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.45, 0.07, 2.6, x + Math.sin(a) * 1.15, h - 0.2, z + Math.cos(a) * 1.15, i % 2 ? K.leaf : K.leafL, { rx: -0.45, ry: a }); }
}
function canvasTex(draw, w = 1024, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  const run = () => { g.clearRect(0, 0, w, h); draw(g, w, h); tex.needsUpdate = true; };
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; run();
  if (document.fonts) document.fonts.load('900 100px Tajawal').then(run).catch(() => {});
  return tex;
}
const signTex = (ar, en, bg = '#4a2f6b', w = 2048) => canvasTex((g, W, H) => {
  g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = '#d9a521'; g.fillRect(0, 8, W, 6); g.fillRect(0, H - 14, W, 6);
  g.fillStyle = '#f7e3a0'; g.textAlign = 'center'; g.direction = 'rtl'; g.font = '900 112px Tajawal, "Segoe UI Emoji", Tahoma, sans-serif'; g.fillText(ar, W / 2, 128, W - 40);
  g.font = '700 42px "Segoe UI", Roboto, sans-serif'; g.direction = 'ltr'; g.fillText(en, W / 2, 196, W - 40);
}, w, 256);
const sealTex = () => canvasTex((g, w, h) => { // شعار الجامعة: دائرة ذهبية فيها قبعة تخرّج وكتاب
  g.fillStyle = '#d9a521'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4a2f6b'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f7e3a0';
  g.beginPath(); g.moveTo(128, 64); g.lineTo(214, 102); g.lineTo(128, 140); g.lineTo(42, 102); g.closePath(); g.fill();
  g.fillRect(86, 112, 84, 34); g.fillRect(196, 104, 5, 50); g.beginPath(); g.arc(198, 160, 9, 0, Math.PI * 2); g.fill();
  g.fillRect(70, 168, 54, 30); g.fillRect(132, 168, 54, 30);
}, 256, 256);

// مبنى كلية: كتلة طابقين-ثلاث بإطار لون الكلية، الواجهة على جهة face (+1 = شرق، -1 = غرب)
function college(b, g, L, root, x, z, w, d, h, accent, face, ar, en, bg) {
  b.box(d, h, w, x, 0, z, K.wall);                                   // نفس لون مبنى الرئاسة. d على محور x (العمق)، w على محور z (عرض الواجهة)
  b.box(d + 1.6, 1, w + 1.6, x, h, z, K.stoneD); b.box(d + 2, 0.6, w + 2, x, h + 1, z, K.roof);
  const xf = x + face * (d / 2);
  for (let f = 0; f < Math.floor(h / 4.2); f++) for (let zz = z - w / 2 + 4; zz <= z + w / 2 - 4; zz += 5) {
    if (Math.abs(zz - z) < 5) continue;
    g.box(0.3, 2.4, 3, xf + face * 0.05, 1.6 + f * 4.2, zz, K.glass); L.box(0.2, 2, 2.6, xf + face * 0.2, 1.8 + f * 4.2, zz, 0xffe6a8);
  }
  b.box(4, h - 1, 10, xf + face * 1.5, 0, z, K.stone);                 // مدخل بارز بلون حجري
  g.box(0.3, 6, 6, xf + face * 3.55, 0.2, z, K.glassL);
  b.box(4.6, 1.2, 11, xf + face * 1.5, h - 1, z, accent);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(16, 2), new THREE.MeshBasicMaterial({ map: signTex(ar, en, bg), toneMapped: false }));
  s.position.set(xf + face * 3.62, h - 3.6, z); s.rotation.y = face * Math.PI / 2; root.add(s);
}

export function buildUniversity(S, mat) {
  const root = new THREE.Group(), b = new Builder(), g = new Builder(), d = new Builder(), L = new Builder();
  const X = S.gateX, zS = S.z1, zN = S.z0, cz = (S.z0 + S.z1) / 2;
  // الأرض والممرات
  b.box(S.x1 - S.x0, 0.04, S.z1 - S.z0, (S.x0 + S.x1) / 2, 0, cz, K.grass);
  b.box(14, 0.06, S.z1 - S.z0 - 4, X, 0.02, cz, K.paving);                               // المحور الرئيسي
  for (let z = zN + 4; z < zS - 2; z += 6) b.box(14, 0.02, 0.2, X, 0.09, z, K.path);
  b.box(420, 0.08, 10, X + 26, 0.06, -287, K.paving);                                    // الممر العرضي الجنوبي
  b.box(370, 0.08, 10, X, 0.06, -362, K.paving);                                         // الممر العرضي الشمالي

  // السور: قاعدة طوب + سياج، وبوابتين (جنوب على شارع الجامعة، شمال على الموج)
  const WX0 = S.x0 + 1.2, WX1 = S.x1 - 1.2, WS = zS - 1.5, WN = zN + 1.5;
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len, ry = Math.atan2(-uz, ux), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    b.box(len, 1, 1, mx, 0, mz, K.brick, ry); b.box(len, 0.2, 1.2, mx, 1, mz, K.stoneD, ry);
    b.box(len, 0.14, 0.14, mx, 2.9, mz, K.dark, ry);
    for (let t = 0.5; t < len; t += 0.9) b.box(0.08, 1.8, 0.08, x0 + ux * t, 1.2, z0 + uz * t, K.dark);
    const n = Math.max(1, Math.round(len / 14));
    for (let i = 0; i <= n; i++) { const x = x0 + ux * (len * i) / n, z = z0 + uz * (len * i) / n; b.box(1.6, 3.6, 1.6, x, 0, z, K.brick); b.box(2, 0.3, 2, x, 3.6, z, K.stoneD); }
  };
  for (const W of [WS, WN]) { run(WX0, W, X - 9, W); run(X + 9, W, WX1, W); }
  run(WX0, WS, WX0, WN); run(WX1, WS, WX1, WN);
  for (const [W, dir] of [[WS, 1], [WN, -1]]) {
    for (const s of [-1, 1]) { b.box(3.4, 9, 3.4, X + s * 9.6, 0, W, K.brick); b.box(3.8, 0.6, 3.8, X + s * 9.6, 9, W, K.stoneD); b.ball(0.9, X + s * 9.6, 10.4, W, K.gold); }
    b.box(22.6, 3, 1.8, X, 9.2, W, K.purple);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(18, 2.25), new THREE.MeshBasicMaterial({ map: signTex('جامعة قارتنا', 'QARATNA UNIVERSITY'), toneMapped: false }));
    s.position.set(X, 10.7, W + dir * 0.92); if (dir < 0) s.rotation.y = Math.PI; root.add(s);
  }

  // الساحة الجنوبية: عشب بأحواض + نافورة فيها قبعة تخرّج
  const QZ = -255;
  for (const s of [-1, 1]) { b.box(46, 0.08, 44, X + s * 32, 0.04, QZ, K.grassD); for (let z = QZ - 18; z <= QZ + 18; z += 12) tree(b, X + s * 56, z, 0.9); }
  b.cyl(10, 10.6, 0.9, X, 0.06, QZ, K.stoneD, 28); b.cyl(9.3, 9.3, 0.12, X, 0.95, QZ, K.water, 28);
  b.box(3.4, 4.2, 3.4, X, 0.9, QZ, K.stone); b.cyl(1.9, 2.1, 1.4, X, 5.1, QZ, K.dark, 16);
  b.slab(7.4, 0.5, 7.4, X, 6.8, QZ, K.dark, { ry: Math.PI / 4 }); b.ball(0.45, X, 7.2, QZ, K.gold);
  b.box(0.18, 2.6, 0.18, X + 3.1, 4.4, QZ + 0.2, K.gold); b.ball(0.4, X + 3.1, 4.3, QZ + 0.2, K.gold);
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) b.cyl(0.25, 0.45, 2.4, X + Math.cos(a) * 6.5, 0.9, QZ + Math.sin(a) * 6.5, 0xbfe9f7, 6);

  // مبنى الرئاسة: منصة ودرج، رواق 8 أعمدة، قبة كبيرة على أسطوانة
  const MZ = -330, MF = MZ + 20;                                                           // MF = الواجهة الجنوبية
  b.box(130, 2, 46, X, 0, MZ, K.stoneD); b.box(132, 0.4, 48, X, 2, MZ, K.stone);
  for (let i = 0; i < 4; i++) b.box(44, 2 - i * 0.5, 1.6, X, 0, MF + 4.8 + i * 1.6, K.stone);
  b.box(120, 17, 36, X, 2.4, MZ - 2, K.wall); b.box(124, 1.2, 40, X, 19.4, MZ - 2, K.stoneD); b.box(125, 0.6, 41, X, 20.6, MZ - 2, K.roof);
  for (let f = 0; f < 3; f++) for (let x = X - 54; x <= X + 54; x += 6) if (Math.abs(x - X) > 22) { g.box(3, 3.4, 0.3, x, 4 + f * 5.2, MF - 3.9, K.glass); L.box(2.6, 3, 0.2, x, 4.2 + f * 5.2, MF - 3.7, 0xffe6a8); }
  b.box(48, 0.5, 9, X, 2.4, MF + 0.5, K.stone);
  for (let i = 0; i < 8; i++) { const x = X - 21 + i * 6; b.box(2.2, 0.6, 2.2, x, 2.9, MF + 2.5, K.stoneD); b.cyl(0.85, 0.95, 12.6, x, 3.5, MF + 2.5, K.white, 12); b.box(2.2, 0.6, 2.2, x, 16.1, MF + 2.5, K.stoneD); }
  b.box(48, 3, 9, X, 16.7, MF + 0.5, K.stone); b.gable(9, 6, 50, X, 19.7, MF + 0.5, K.stone, Math.PI / 2);
  g.box(16, 11, 0.3, X, 2.6, MF - 3.85, K.glassL);
  b.cyl(14, 14, 7, X, 21.2, MZ - 4, K.wall, 24); b.cyl(14.6, 14.6, 1, X, 28.2, MZ - 4, K.stoneD, 24);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.box(1.6, 4, 0.3, X + Math.sin(a) * 14.05, 22.6, MZ - 4 + Math.cos(a) * 14.05, K.glass, a); }
  b.add(new THREE.SphereGeometry(13.6, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2), K.roof, { x: X, y: 29.2, z: MZ - 4 });
  b.cyl(1.6, 2, 3, X, 42.6, MZ - 4, K.wall, 10); b.add(new THREE.ConeGeometry(1.8, 3.6, 10), K.gold, { x: X, y: 47.4, z: MZ - 4 }); L.ball(0.9, X, 49.6, MZ - 4, 0xffe6a8);
  // اللوحة على الإفريز والشعار في الجملون
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.75), new THREE.MeshBasicMaterial({ map: signTex('جامعة قارتنا', 'QARATNA UNIVERSITY'), toneMapped: false }));
  sm.position.set(X, 18.2, MF + 5.06);
  const seal = new THREE.MeshBasicMaterial({ map: sealTex(), toneMapped: false });
  const e1 = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), seal); e1.position.set(X, 22.4, MF + 5.06);
  root.add(sm, e1);

  // المكتبة: مكعب زجاجي في الساحة الشمالية
  const LZ = -405;
  b.box(46, 1, 46, X, 0, LZ, K.stoneD);
  b.box(40, 18, 40, X, 1, LZ, K.wall);
  for (let f = 0; f < 4; f++) { g.box(40.4, 3.4, 40.4, X, 2.4 + f * 4.2, LZ, K.glassL); L.box(40.6, 2.6, 40.6, X, 2.8 + f * 4.2, LZ, 0xfff0c0); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(1.6, 18, 1.6, X + sx * 19.4, 1, LZ + sz * 19.4, K.purple);
  b.box(42, 1, 42, X, 19, LZ, K.roof); b.box(16, 4, 16, X, 20, LZ, K.wall); b.box(16.6, 0.5, 16.6, X, 24, LZ, K.roof);
  const ls = new THREE.Mesh(new THREE.PlaneGeometry(16, 2), new THREE.MeshBasicMaterial({ map: signTex('📚 المكتبة المركزية', 'CENTRAL LIBRARY', '#321f4a'), toneMapped: false }));
  ls.position.set(X, 15.2, LZ + 20.75); root.add(ls);
  for (const s of [-1, 1]) for (let z = LZ - 20; z <= LZ + 20; z += 10) tree(b, X + s * 32, z, 0.85);

  // الكليات: 3 غرب المحور (واجهتها شرق) و2 شرق المحور (واجهتها غرب) + مركز الطلاب
  const WXc = X - 120, EXc = X + 120;
  college(b, g, L, root, WXc, -255, 52, 26, 13, 0xc8432f, 1, '🩺 كلية الطب', 'COLLEGE OF MEDICINE', '#8a2a1c');
  college(b, g, L, root, WXc, -320, 52, 26, 13, 0x8a6a3a, 1, '⚖️ كلية الحقوق', 'COLLEGE OF LAW', '#5a4a2c');
  college(b, g, L, root, WXc, -390, 52, 26, 13, 0xd07a1f, 1, '🏗️ كلية الهندسة', 'COLLEGE OF ENGINEERING', '#8a4a10');
  college(b, g, L, root, EXc, -255, 52, 26, 13, 0x0f5a4a, -1, '📊 كلية إدارة الأعمال', 'COLLEGE OF BUSINESS', '#0a3b31');
  college(b, g, L, root, EXc, -320, 52, 26, 13, 0x1f4f8a, -1, '✈️ كلية الطيران', 'COLLEGE OF AVIATION', '#163a66');
  college(b, g, L, root, EXc, -390, 52, 26, 9, 0x4a2f6b, -1, '☕ مركز الطلاب', 'STUDENT CENTER', '#321f4a');
  // طيارة تدريب قدّام كلية الطيران
  const PX = EXc - 32, PZ = -320;
  b.box(1.2, 1.8, 1.2, PX, 0, PZ, K.stoneD);
  d.add(new THREE.CylinderGeometry(0.9, 0.9, 13, 10), K.white, { rx: Math.PI / 2, x: PX, y: 2.6, z: PZ });
  d.add(new THREE.ConeGeometry(0.9, 2.6, 10), K.white, { rx: Math.PI / 2, x: PX, y: 2.6, z: PZ + 7.8 });
  d.box(12, 0.25, 2.6, PX, 2.4, PZ + 0.5, 0x1f4f8a); d.box(4.2, 0.2, 1.4, PX, 2.8, PZ - 5.6, 0x1f4f8a); d.box(0.2, 2.4, 1.6, PX, 3.2, PZ - 5.8, 0x1f4f8a);
  // ممرات من المحور للكليات
  for (const z of [-255, -320, -390]) for (const s of [-1, 1]) b.box(100, 0.08, 6, X + s * 57, 0.06, z, K.path);

  // الملعب والمضمار (غرب)
  const TX = S.x0 + 52, TZ = -335;
  b.box(84, 0.06, 150, TX, 0.02, TZ, K.track);
  b.box(66, 0.08, 104, TX, 0.04, TZ, K.grass);
  for (let i = 0; i < 6; i++) b.box(66, 0.02, 0.15, TX, 0.13, TZ - 52 + i * 20.8, K.grassD);
  for (const s of [-1, 1]) {
    b.add(new THREE.CylinderGeometry(42, 42, 0.07, 32, 1, false, s > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI), K.track, { x: TX, y: 0.03, z: TZ + s * 52 });
    b.add(new THREE.CylinderGeometry(33, 33, 0.09, 32, 1, false, s > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI), K.grass, { x: TX, y: 0.045, z: TZ + s * 52 });
    b.box(0.2, 2.4, 7, TX, 0.1, TZ + s * 50, K.white); b.box(0.2, 0.2, 7, TX, 2.5, TZ + s * 50, K.white);
  }
  b.box(66, 0.02, 0.2, TX, 0.14, TZ, K.white);
  for (let k = 0; k < 4; k++) b.box(5 + k, 0.8, 60, TX + 44 + k * 1.2, k * 0.8, TZ, [0x4a2f6b, 0xf4f1ea][k % 2]); // مدرج شرق الملعب
  for (const [x, z] of [[TX - 44, TZ - 78], [TX + 44, TZ - 78], [TX - 44, TZ + 78], [TX + 44, TZ + 78]]) { b.cyl(0.25, 0.3, 16, x, 0, z, K.pole, 6); b.box(3, 1.4, 0.6, x, 16, z, 0xfff3b0); L.box(2.6, 1.1, 0.8, x, 16.1, z, 0xfff3b0); }

  // سكن الطلاب (شرق): 3 أبراج + مواقف
  const HX = S.x1 - 50;
  for (const [i, z] of [[0, -260], [1, -330], [2, -400]]) {
    b.box(30, 22 + i * 4, 22, HX, 0, z, i % 2 ? K.wall : K.brick);
    b.box(31, 0.8, 23, HX, 22 + i * 4, z, K.roof);
    for (let f = 0; f < 5 + i; f++) for (let x = HX - 12; x <= HX + 12; x += 4) { g.box(2.2, 2, 0.3, x, 2 + f * 4, z + 11.05, K.glass); if ((x + f * 3 + i) % 3) L.box(1.8, 1.6, 0.2, x, 2.2 + f * 4, z + 11.2, 0xffe6a8); }
  }
  for (let z = -240; z >= -430; z -= 19) for (const x of [EXc + 40, EXc + 62]) if (Math.abs(z - -287) > 8) tree(b, x + ((z * 7) % 5), z, 0.95);
  b.box(26, 0.05, 160, S.x1 - 16, 0.03, -330, K.lot);
  for (let z = -405; z <= -255; z += 3.2) { b.box(4.6, 0.02, 0.15, S.x1 - 16, 0.09, z - 1.6, K.white); if (((Math.round(z) * 7) % 10 + 10) % 10 > 4) d.box(4.1, 1.3, 1.8, S.x1 - 16, 0.1, z, [0xffffff, 0xd9dcde, 0x2b2f33, 0x8a9399, 0x4a2f6b][Math.abs(Math.round(z)) % 5]); }

  // نخيل على المحور وإنارة
  for (let z = zS - 12; z >= zN + 12; z -= 18) { if (Math.abs(z - QZ) < 14 || (z < MF + 8 && z > MZ - 26) || Math.abs(z - LZ) < 28) continue; palm(b, X - 9.5, z, 6); palm(b, X + 9.5, z, 6); }
  for (let z = zS - 20; z >= zN + 20; z -= 26) for (const s of [-1, 1]) { b.cyl(0.12, 0.16, 5.5, X + s * 7.6, 0, z, K.dark, 6); b.ball(0.42, X + s * 7.6, 5.7, z, 0xfff3b0); L.ball(0.65, X + s * 7.6, 5.7, z, 0xfff3b0); }
  for (let x = S.x0 + 110; x <= S.x1 - 80; x += 22) { if (Math.abs(x - X) < 30) continue; tree(b, x, zN + 10, 0.9); tree(b, x, zS - 10, 0.9); }

  const glassMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const lights = new THREE.Mesh(L.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })); lights.visible = false;
  const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; };
  root.add(mk(b.build(), mat), mk(g.build(), glassMat), mk(d.build(), mat), lights);
  root.userData = { civic: 'university', setNight(on) { glassMat.emissive.set(on ? 0x4a3a6a : 0x000000); lights.visible = on; } };
  root.traverse((o) => { if (o.isMesh) o.userData.civic = 'university'; });
  return root;
}

export const universityViews = (S) => {
  const X = S.gateX;
  return {
    all: { t: [X, 10, -335], p: [X + 230, 270, -90] },
    front: { t: [X, 20, -315], p: [X, 26, -180] },
    mouj: { t: [X, 12, -360], p: [X - 60, 90, -540] },
  };
};
