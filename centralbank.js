// البنك المركزي (Low Poly): شمال الجادة شرق وزارة الإعلام. إحداثيات عالمية (الواجهة جهة الجادة = +z).
// منصة حجرية بدرج عريض، رواق 10 أعمدة وجملون فيه شعار العملة، مبنى رئيسي، وبرج زجاجي بتاج ذهبي وراه،
// ساحة بنافورة عملة ذهبية، سور ببوابة على الجادة، مواقف ونخيل وأعلام.
import * as THREE from 'three';
import { Builder } from './houses.js';

export const BANK_INFO = { name: 'البنك المركزي' };
const K = {
  stone: 0xece4d0, stoneD: 0xd6c9a8, wall: 0xf4efe2, col: 0xfbf8ef, gold: 0xd9a521, goldL: 0xf0c14b, green: 0x0f5a4a, greenD: 0x0a3b31,
  glass: 0x4f7f8a, glassG: 0x8aa58a, paving: 0xe9e2d1, grass: 0x84c962, water: 0x6cc7e6, lot: 0x676b72, white: 0xffffff, dark: 0x2a2d33,
  hedge: 0x4f9a48, trunk: 0x8a6a42, leaf: 0x3f8f45, leafL: 0x57a84e, pole: 0xc3c8cd,
};

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
const signTex = (w = 2048) => canvasTex((g, W, H) => {
  g.fillStyle = '#0a3b31'; g.fillRect(0, 0, W, H); g.fillStyle = '#d9a521'; g.fillRect(0, 8, W, 6); g.fillRect(0, H - 14, W, 6);
  g.fillStyle = '#f3d27a'; g.textAlign = 'center'; g.direction = 'rtl'; g.font = '900 112px Tajawal, Tahoma, sans-serif'; g.fillText('البنك المركزي', W / 2, 128);
  g.font = '700 42px "Segoe UI", Roboto, sans-serif'; g.direction = 'ltr'; g.fillText('CENTRAL BANK OF QARATNA', W / 2, 196);
}, w, 256);
// شعار العملة: دائرة ذهبية فيها «ق»
const coinTex = () => canvasTex((g, w, h) => {
  g.fillStyle = '#d9a521'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#b8860b'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 26, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffe27a'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 38, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#ffe27a'; g.font = '900 130px Tajawal, Tahoma, sans-serif'; g.textAlign = 'center'; g.fillText('ق', w / 2, h / 2 + 46);
}, 256, 256);
const flagTex = () => canvasTex((g, w, h) => { // علم القارة: أخضر البنك وشريط ذهبي وشعار العملة
  g.fillStyle = '#0f5a4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9a521'; g.fillRect(0, h * 0.42, w, h * 0.16);
  g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(w * 0.22, h / 2, h * 0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0f5a4a'; g.font = `900 ${Math.round(h * 0.42)}px Tajawal, Tahoma, sans-serif`; g.textAlign = 'center'; g.fillText('ق', w * 0.22, h / 2 + h * 0.15);
}, 360, 240);

export function buildCentralBank(S, mat) {
  const root = new THREE.Group(), b = new Builder(), g = new Builder(), d = new Builder(), L = new Builder();
  const cx = (S.x0 + S.x1) / 2;
  // الأرض والساحة
  b.box(S.x1 - S.x0, 0.04, S.z1 - S.z0, cx, 0, (S.z0 + S.z1) / 2, K.grass);
  b.box(170, 0.06, 60, cx, 0.02, -40, K.paving);
  for (let x = cx - 84; x <= cx + 84; x += 7) b.box(0.2, 0.02, 60, x, 0.08, -40, 0xd9d0bb);
  b.box(14, 0.05, 56, cx, 0.1, -40, 0xcfc6b0);
  for (const s of [-1, 1]) b.box(0.7, 0.05, 56, cx + s * 7.3, 0.12, -40, K.green);

  // السور: قاعدة حجر + سياج حديد + أعمدة بتيجان ذهبية، والبوابة على الجادة
  const WX0 = S.x0 + 1.2, WX1 = S.x1 - 1.2, WZ0 = S.z0 + 1.2, WZ = S.z1 - 1.5;
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len, ry = Math.atan2(-uz, ux), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    b.box(len, 1, 1, mx, 0, mz, K.stone, ry); b.box(len, 0.22, 1.2, mx, 1, mz, K.stoneD, ry);
    b.box(len, 0.16, 0.16, mx, 3.05, mz, K.dark, ry); b.box(len, 0.12, 0.12, mx, 1.7, mz, K.dark, ry);
    for (let t = 0.5, k = 0; t < len; t += 0.9, k++) { const x = x0 + ux * t, z = z0 + uz * t; b.box(0.09, 2, 0.09, x, 1.2, z, K.dark); if (k % 2 === 0) b.box(0.2, 0.28, 0.2, x, 3.2, z, K.gold); }
    const n = Math.max(1, Math.round(len / 12));
    for (let i = 0; i <= n; i++) { const x = x0 + ux * (len * i) / n, z = z0 + uz * (len * i) / n; b.box(1.5, 3.9, 1.5, x, 0, z, K.stone); b.box(1.9, 0.35, 1.9, x, 3.9, z, K.stoneD); b.ball(0.42, x, 4.6, z, K.gold); }
  };
  run(WX0, WZ, cx - 8, WZ); run(cx + 8, WZ, WX1, WZ);
  run(WX1, WZ, WX1, WZ0); run(WX1, WZ0, WX0, WZ0); run(WX0, WZ0, WX0, WZ);
  for (const s of [-1, 1]) { b.box(3, 8, 3, cx + s * 8.6, 0, WZ, K.stoneD); b.box(3.4, 0.6, 3.4, cx + s * 8.6, 8, WZ, K.stone); b.ball(0.85, cx + s * 8.6, 9.3, WZ, K.gold); }
  b.box(20.2, 2.8, 1.6, cx, 8.2, WZ, K.green);

  // المنصة والدرج
  b.box(150, 3, 74, cx, 0, -105, K.stoneD);
  b.box(152, 0.4, 76, cx, 3, -105, K.stone);
  for (let i = 0; i < 6; i++) b.box(66, 3 - i * 0.5, 1.6, cx, 0, -67.2 + i * 1.6, K.stone); // درج عريض نازل للساحة
  // المبنى الرئيسي
  b.box(130, 22, 48, cx, 3.4, -112, K.wall);
  b.box(134, 1.4, 52, cx, 25.4, -112, K.stoneD);
  b.box(136, 1, 54, cx, 26.8, -112, K.green);
  for (let f = 0; f < 3; f++) for (let x = cx - 60; x <= cx + 60; x += 7.5) if (Math.abs(x - cx) > 40) { g.box(3.6, 4, 0.3, x, 5.4 + f * 6.6, -87.9, K.glass); L.box(3.2, 3.4, 0.2, x, 5.7 + f * 6.6, -87.7, 0xffe6a8); }
  for (const s of [-1, 1]) for (let z = -130; z <= -95; z += 7.5) for (let f = 0; f < 3; f++) g.box(0.3, 4, 3.6, cx + s * 65.1, 5.4 + f * 6.6, z, K.glass);
  // الرواق: 10 أعمدة + سقف + جملون فيه الشعار
  b.box(84, 0.6, 16, cx, 3.4, -80, K.stone);
  for (let i = 0; i < 10; i++) {
    const x = cx - 36 + i * 8;
    b.box(2.8, 0.8, 2.8, x, 4, -75, K.stoneD); b.cyl(1.05, 1.2, 15.4, x, 4.8, -75, K.col, 12); b.box(2.8, 0.8, 2.8, x, 20.2, -75, K.stoneD);
  }
  b.box(84, 3.4, 16, cx, 21, -80, K.stone); b.box(85, 0.6, 16.6, cx, 24.4, -80, K.stoneD);
  b.gable(16, 9, 86, cx, 25, -80, K.stone, Math.PI / 2);
  g.box(14, 12, 0.3, cx, 4.4, -87.6, K.glassG); b.box(15, 0.8, 0.6, cx, 16.4, -87.4, K.gold);
  for (const x of [cx - 24, cx + 24]) g.box(8, 10, 0.3, x, 5, -87.6, K.glass);
  // البرج الزجاجي (مقر المحافظ) بتاج ذهبي
  b.box(46, 74, 30, cx, 0, -160, K.wall);
  for (let f = 0; f < 18; f++) { g.box(46.4, 2.6, 30.4, cx, 6 + f * 3.8, -160, K.glass); if (f % 3 !== 1) L.box(44, 1.8, 30.6, cx, 6.4 + f * 3.8, -160, 0xffe6a8); }
  for (const s of [-1, 1]) b.box(2.2, 74, 31, cx + s * 22.6, 0, -160, K.green);
  b.box(48, 3, 32, cx, 74, -160, K.gold); b.box(36, 6, 22, cx, 77, -160, K.goldL); b.box(20, 6, 12, cx, 83, -160, K.gold);
  b.cyl(0.25, 0.3, 10, cx, 89, -160, K.dark, 6); b.ball(0.7, cx, 99.5, -160, 0xff4a3a); L.ball(0.9, cx, 99.5, -160, 0xff6a5a);
  // الخزنة: باب دائري ضخم على الجهة الشرقية (زينة)
  b.add(new THREE.CylinderGeometry(6, 6, 1.2, 24), 0x8a9399, { rz: Math.PI / 2, x: cx + 65.8, y: 12, z: -112 });
  b.add(new THREE.CylinderGeometry(4.2, 4.2, 1.4, 24), 0xb9c1c7, { rz: Math.PI / 2, x: cx + 66, y: 12, z: -112 });
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; b.box(0.5, 0.5, 3.4, cx + 66.8, 12 + Math.sin(a) * 1.6, -112 + Math.cos(a) * 1.6, K.gold, a); }

  // نافورة العملة الذهبية في الساحة
  const FZ = -40;
  b.cyl(11, 11.6, 0.9, cx, 0.08, FZ, K.stoneD, 28); b.cyl(10.2, 10.2, 0.12, cx, 0.95, FZ, K.water, 28);
  b.box(4, 4, 2.2, cx, 0.9, FZ, K.stone);
  b.add(new THREE.CylinderGeometry(5, 5, 1.1, 32), K.gold, { rx: Math.PI / 2, x: cx, y: 10, z: FZ });
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) b.cyl(0.25, 0.45, 2.6, cx + Math.cos(a) * 7, 0.9, FZ + Math.sin(a) * 7, 0xbfe9f7, 6);
  // أحواض وأشجار على جانبي الساحة
  for (const s of [-1, 1]) {
    for (let z = -58; z <= -22; z += 9) { b.box(2.6, 0.9, 2.6, cx + s * 22, 0.05, z, K.stoneD); b.ball(1.15, cx + s * 22, 1.7, z, K.hedge); }
    b.box(36, 0.5, 4, cx + s * 54, 0.08, -62, K.hedge);
    for (let i = 0; i < 8; i++) b.ball(0.7, cx + s * 54 - 14 + i * 4, 0.9, -62, i % 2 ? 0xe0567a : 0xf2c230);
  }
  // مواقف (الشرق) وحديقة نخيل وأعلام (الغرب)
  b.box(30, 0.05, 150, S.x1 - 20, 0.03, -95, K.lot);
  for (let z = -165; z <= -25; z += 3.2) for (const x of [S.x1 - 30, S.x1 - 10]) {
    b.box(4.6, 0.02, 0.15, x, 0.09, z - 1.6, K.white);
    if (((Math.round(z) * 7 + Math.round(x)) % 10 + 10) % 10 > 3) d.box(4.1, 1.3, 1.8, x, 0.1, z, [0xffffff, 0xd9dcde, 0x2b2f33, 0x8a9399, 0x3c5a7a][Math.abs(Math.round(x + z)) % 5]);
  }
  for (const z of [-30, -60, -90, -120, -150, -178]) palm(b, S.x0 + 10, z, 7);
  for (const [x, z] of [[S.x0 + 26, -36], [S.x0 + 26, -100], [S.x0 + 40, -150], [S.x0 + 26, -170]]) palm(b, x, z);
  for (const z of [-178]) for (let x = cx - 60; x <= cx + 60; x += 15) palm(b, x, z, 6);
  const flags = [];
  for (let i = 0; i < 3; i++) {
    const x = S.x0 + 28 + i * 10, z = -22;
    b.cyl(0.16, 0.22, 14, x, 0, z, K.pole, 8); b.ball(0.35, x, 14.2, z, K.gold); flags.push([x, z]);
  }
  // إنارة الساحة
  for (const s of [-1, 1]) for (let z = -60; z <= -20; z += 13) { b.cyl(0.12, 0.16, 6, cx + s * 11, 0, z, K.dark, 6); b.ball(0.45, cx + s * 11, 6.2, z, 0xfff3b0); L.ball(0.7, cx + s * 11, 6.2, z, 0xfff3b0); }

  // اللوحات والشعارات
  const sm = new THREE.MeshBasicMaterial({ map: signTex(), toneMapped: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(27.2, 3.4), sm); sign.position.set(cx, 22.7, -71.95);
  const cm = new THREE.MeshBasicMaterial({ map: coinTex(), toneMapped: false });
  const emb = new THREE.Mesh(new THREE.CircleGeometry(3.4, 32), cm); emb.position.set(cx, 28.6, -71.6);
  const tw = new THREE.Mesh(new THREE.CircleGeometry(8, 40), cm); tw.position.set(cx, 62, -144.75);
  const gate = new THREE.Mesh(new THREE.PlaneGeometry(16, 2), sm); gate.position.set(cx, 9.6, WZ + 0.82);
  const c1 = new THREE.Mesh(new THREE.CircleGeometry(4.6, 32), cm); c1.position.set(cx, 10, FZ + 0.57);
  const c2 = c1.clone(); c2.position.set(cx, 10, FZ - 0.57); c2.rotation.y = Math.PI;
  root.add(sign, emb, tw, gate, c1, c2);
  const fm = new THREE.MeshBasicMaterial({ map: flagTex(), side: THREE.DoubleSide, toneMapped: false });
  for (const [x, z] of flags) { const f = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3), fm); f.position.set(x + 2.4, 12.4, z); root.add(f); }

  const glassMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const lights = new THREE.Mesh(L.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })); lights.visible = false;
  const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; };
  root.add(mk(b.build(), mat), mk(g.build(), glassMat), mk(d.build(), mat), lights);
  root.userData = { civic: 'bank', setNight(on) { glassMat.emissive.set(on ? 0x3a6a5a : 0x000000); lights.visible = on; } };
  root.traverse((o) => { if (o.isMesh) o.userData.civic = 'bank'; });
  return root;
}

export const bankViews = (S) => {
  const cx = (S.x0 + S.x1) / 2;
  return {
    all: { t: [cx, 18, -100], p: [cx + 150, 190, 90] },
    front: { t: [cx, 24, -90], p: [cx, 18, 18] },
    tower: { t: [cx, 60, -150], p: [cx + 90, 100, -20] },
  };
};
