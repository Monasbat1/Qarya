// مستشفى قارتنا (Low Poly): شمال الجادة مقابل حي فلسطين. إحداثيات عالمية مباشرة (الواجهة جهة الجادة = +z).
// برج رئيسي 8 طوابق بمهبط مروحية، جناحين 4 طوابق، مبنى خلفي، مظلة دخول على حلقة التوصيل، طوارئ بمدخل إسعاف، ومواقف ونخيل.
import * as THREE from 'three';
import { Builder } from './houses.js';

export const HOSPITAL_INFO = { name: 'مستشفى قارتنا' };
const K = {
  wall: 0xf4f2ec, wallD: 0xdcd8cd, glass: 0x7fc4d6, teal: 0x1d8c7e, tealD: 0x146b60, roof: 0xc9c6bd, paving: 0xe2ddd2,
  lot: 0x676b72, grass: 0x84c962, white: 0xffffff, red: 0xd23b2f, dark: 0x2b2f33, tyre: 0x222427, water: 0x6cc7e6,
  trunk: 0x8a6a42, leaf: 0x3f8f45, leafL: 0x57a84e, hedge: 0x4f9a48, yellow: 0xf2c230,
};

function palm(b, x, z, h = 6) {
  b.cyl(0.22, 0.3, h, x, 0, z, K.trunk, 6);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.45, 0.07, 2.6, x + Math.sin(a) * 1.15, h - 0.2, z + Math.cos(a) * 1.15, i % 2 ? K.leaf : K.leafL, { rx: -0.45, ry: a }); }
}
// مبنى بطوابق: كتلة بيضاء + أشرطة زجاج لكل طابق (الزجاج في Builder منفصل عشان يضوي بالليل)
function block(b, g, x0, x1, z0, z1, floors, fh = 3.2) {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = floors * fh;
  b.box(w, H, d, cx, 0, cz, K.wall);
  for (let f = 0; f < floors; f++) g.box(w + 0.3, fh * 0.55, d + 0.3, cx, f * fh + fh * 0.3, cz, K.glass);
  b.box(w + 0.8, 0.6, d + 0.8, cx, H, cz, K.wallD);                // حافة السطح
  b.box(w - 2, 0.2, d - 2, cx, H + 0.05, cz, K.roof);
  return H;
}
function ambulance(b, x, z, ry) {
  const c = Math.cos(ry), s = Math.sin(ry), P = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
  const box = (w, h, d, dx, y, dz, col) => { const [px, pz] = P(dx, dz); b.box(w, h, d, px, y, pz, col, ry); };
  box(5.6, 2.2, 2.2, 0, 0.45, 0, K.white); box(1.4, 1.3, 2.1, 2.7, 0.45, 0, K.white);
  box(0.1, 0.8, 1.9, 3.42, 1.1, 0, 0x2c3a46);
  box(5.62, 0.35, 2.24, 0, 1.2, 0, K.red);                          // شريط أحمر
  box(0.9, 0.25, 1.6, 1.6, 2.65, 0, 0x3a7bff); box(0.5, 0.25, 1.6, 0.6, 2.65, 0, K.red); // أضواء
  box(0.12, 0.9, 0.9, -2.82, 1.0, 0, K.red); box(0.14, 0.3, 0.9, -2.83, 1.3, 0, K.white); // علامة + خلفية
  for (const dx of [1.9, -1.8]) for (const dz of [-1.05, 1.05]) { const [px, pz] = P(dx, dz); b.add(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 10), K.tyre, { rx: Math.PI / 2, ry, x: px, y: 0.45, z: pz }); }
}
function helicopter(b, x, y, z) {
  b.ball(1.6, x, y + 1.5, z, K.white, 1); b.box(5, 0.7, 0.7, x - 3.2, y + 1.6, z, K.white);
  b.box(1.2, 1.5, 0.2, x - 5.6, y + 1.9, z, K.red); b.box(1.8, 0.3, 3.3, x, y + 0.7, z, K.red);
  b.box(3.2, 0.12, 0.12, x + 0.2, y, z - 1.2, K.dark); b.box(3.2, 0.12, 0.12, x + 0.2, y, z + 1.2, K.dark);
  for (let i = 0; i < 2; i++) b.box(10, 0.06, 0.45, x, y + 3.3, z, K.dark, i * Math.PI / 2 + 0.4);
  b.cyl(0.15, 0.15, 0.4, x, y + 3, z, K.dark, 6);
}
function signTexture(lines, bg, fg = '#fff') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  const draw = () => {
    g.fillStyle = bg; g.fillRect(0, 0, 1024, 256);
    g.fillStyle = fg; g.textAlign = 'center'; g.direction = 'rtl';
    g.font = `900 ${lines[1] ? 104 : 140}px Tajawal, Tahoma, sans-serif`; g.fillText(lines[0], 512, lines[1] ? 118 : 178);
    if (lines[1]) { g.font = '700 44px "Segoe UI", Roboto, sans-serif'; g.direction = 'ltr'; g.fillText(lines[1], 512, 196); }
    tex.needsUpdate = true;
  };
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  draw();
  if (document.fonts) document.fonts.load('900 104px Tajawal').then(draw).catch(() => {});
  return tex;
}

export function buildHospital(S, mat) {
  const root = new THREE.Group(), b = new Builder(), g = new Builder(), d = new Builder();
  const cx = (S.x0 + S.x1) / 2;
  // الأرضية: عشب + ممرات وأحواض زرع + سياج نباتي على الجادة
  b.box(S.x1 - S.x0, 0.04, S.z1 - S.z0, cx, 0, (S.z0 + S.z1) / 2, K.grass);
  b.box(150, 0.06, 12, 423, 0.02, -98, K.paving);                       // ساحة قدّام المبنى
  for (const [x0, x1] of [[S.x0 + 2, S.gateX - 7], [S.gateX + 7, S.x1 - 2]]) b.box(x1 - x0, 1.1, 1.2, (x0 + x1) / 2, 0, S.z1 - 1, K.hedge);
  // المواقف
  for (const [x0, x1, z0, z1] of [[326, 392, -96, -20], [454, 514, -66, -20]]) {
    b.box(x1 - x0, 0.05, z1 - z0, (x0 + x1) / 2, 0.03, (z0 + z1) / 2, K.lot);
    for (let x = x0 + 3; x < x1 - 2; x += 3) for (const zr of [z0 + 6, z1 - 6]) {
      b.box(0.15, 0.02, 5, x - 1.5, 0.09, zr, K.white);
      if (((x * 7 + zr * 3) % 10 + 10) % 10 > 3) d.box(1.8, 1.3, 4.1, x, 0.1, zr, [0xffffff, 0xd9dcde, 0x2b2f33, 0x8a9399, 0xb83a2c, 0x3c5a7a][Math.abs(Math.round(x + zr)) % 6]);
    }
    for (let x = x0 + 8; x < x1; x += 16) palm(b, x, (z0 + z1) / 2);
  }
  // حديقة ونافورة داخل حلقة التوصيل
  b.box(36, 0.2, 18, 423, 0.02, -74, K.grass);
  b.cyl(5, 5.4, 0.8, 423, 0.1, -74, K.wallD, 20); b.cyl(4.4, 4.4, 0.1, 423, 0.8, -74, K.water, 20); b.cyl(0.6, 0.9, 2.2, 423, 0.8, -74, K.wallD, 10);
  for (const x of [408, 438]) for (const z of [-80, -68]) palm(b, x, z, 5);
  // نخيل على طريق الدخول
  for (let z = -12; z >= -54; z -= 9) for (const x of [S.gateX - 8, S.gateX + 8]) palm(b, x, z);

  // ---------- المباني ----------
  const H = block(b, g, 383, 463, -137, -103, 8);                       // البرج الرئيسي
  block(b, g, 335, 383, -150, -108, 4);                                 // الجناح الغربي
  block(b, g, 463, 511, -150, -108, 4);                                 // الجناح الشرقي (الطوارئ)
  block(b, g, 395, 451, -172, -137, 5);                                 // المبنى الخلفي
  // خطوط لون المستشفى على زوايا البرج
  for (const x of [383, 463]) b.box(1.6, H, 1.6, x, 0, -103.5, K.teal);
  // مظلة المدخل الرئيسي + أعمدة
  b.box(42, 0.6, 12, 423, 4.6, -98, K.white); b.box(42, 0.3, 0.4, 423, 4.4, -92.2, K.teal);
  for (const x of [404, 414, 432, 442]) b.cyl(0.35, 0.35, 4.6, x, 0, -93.5, K.wallD, 8);
  // علامة طبية خضراء (+) على البرج
  const crossX = 452, crossY = H - 4.5;
  b.box(6, 2, 0.4, crossX, crossY - 1, -102.6, K.white); b.box(2, 6, 0.4, crossX, crossY - 3, -102.6, K.white);
  b.box(5, 1.4, 0.5, crossX, crossY - 0.7, -102.5, 0x2fae66); b.box(1.4, 5, 0.5, crossX, crossY - 2.5, -102.5, 0x2fae66);
  // مهبط المروحية على سطح البرج
  b.cyl(10, 10, 0.4, 423, H + 0.6, -120, 0x5b6068, 24); b.cyl(8.6, 8.6, 0.05, 423, H + 1.0, -120, K.yellow, 24); b.cyl(8.1, 8.1, 0.06, 423, H + 1.0, -120, 0x5b6068, 24);
  b.box(1, 0.08, 7, 420.5, H + 1.05, -120, K.white); b.box(1, 0.08, 7, 425.5, H + 1.05, -120, K.white); b.box(5, 0.08, 1, 423, H + 1.05, -120, K.white);
  helicopter(d, 432, H + 1.1, -129);
  // الطوارئ: ساحة الإسعاف ومظلة وسيارات إسعاف
  b.box(16, 0.06, 32, 520, 0.03, -126, K.paving);
  b.box(17, 0.5, 10, 519.5, 4.4, -137, K.white); b.box(17, 0.8, 0.3, 519.5, 4.9, -132, K.red);
  for (const x of [512, 527]) b.cyl(0.3, 0.3, 4.4, x, 0, -133, K.wallD, 8);
  ambulance(b, 516, -122, Math.PI / 2); ambulance(b, 523, -124, Math.PI / 2);
  ambulance(d, 470, -40, 0);
  // لوحة المدخل
  b.box(12, 3.4, 1, 446, 0, -15, K.wallD); b.box(12.6, 0.5, 1.2, 446, 3.4, -15, K.teal);

  // اللوحات (نص عربي)
  const tex = signTexture(['مستشفى قارتنا', 'QARATNA HOSPITAL'], '#146b60'), sm = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(30, 7.5), sm); top.position.set(413, H - 4.6, -102.55);
  const gate = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.75), sm); gate.position.set(446, 1.8, -14.45);
  const er = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), new THREE.MeshBasicMaterial({ map: signTexture(['طوارئ', 'EMERGENCY'], '#c8322a'), toneMapped: false }));
  er.position.set(528.15, 5.3, -137); er.rotation.y = Math.PI / 2;
  b.box(0.3, 2.6, 9.6, 528, 4, -137, K.white);
  root.add(top, gate, er);

  const glassMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; };
  const detail = mk(d.build(), mat);
  root.add(mk(b.build(), mat), mk(g.build(), glassMat), detail);
  root.userData = {
    civic: 'hospital', detail,
    setNight(on) { glassMat.emissive.set(on ? 0x7a6a3a : 0x000000); },
  };
  root.traverse((o) => { if (o.isMesh) o.userData.civic = 'hospital'; });
  return root;
}

// لقطات الكاميرا (عالمية): t الهدف، p الكاميرا
export const HOSPITAL_VIEWS = {
  all: { t: [423, 6, -95], p: [520, 150, 70] },
  front: { t: [423, 10, -100], p: [440, 26, -20] },
  er: { t: [515, 3, -125], p: [575, 30, -70] },
  heli: { t: [423, 26, -120], p: [470, 70, -40] },
};
