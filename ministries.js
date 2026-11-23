// المباني الوزارية (Low Poly): البلدية والمالية والإعلام، شمال الجادة مقابل الأحياء جنب المحكمة العليا.
// كل مبنى بطابعه: البلدية بساعة برج وحدائق، المالية برج زجاجي ذهبي برواق أعمدة، الإعلام مبنى حديث بشاشة وبرج بث.
// إحداثيات عالمية، الواجهة جهة الجادة (+z).
import * as THREE from 'three';
import { Builder } from './houses.js';

export const MINISTRY_INFO = {
  baladiya: { name: 'وزارة البلدية', icon: '🏗️', title: 'وزير البلدية', en: 'MINISTRY OF MUNICIPALITY', color: '#2f7d4f', accent: 0x2f7d4f },
  maliya: { name: 'وزارة المالية', icon: '💰', title: 'وزير المالية', en: 'MINISTRY OF FINANCE', color: '#7a5a12', accent: 0xd9a521 },
  ilam: { name: 'وزارة الإعلام', icon: '📣', title: 'وزير الإعلام', en: 'MINISTRY OF INFORMATION', color: '#1f4f8a', accent: 0x1f4f8a },
  thaqafa: { name: 'وزارة الثقافة', icon: '🎭', title: 'وزير الثقافة', en: 'MINISTRY OF CULTURE', color: '#6b3fa0', accent: 0x6b3fa0 },
  tijara: { name: 'وزارة الصناعة والتجارة', icon: '🏭', title: 'وزير الصناعة والتجارة', en: 'MINISTRY OF INDUSTRY & COMMERCE', color: '#b4531c', accent: 0xc8622a },
  taqa: { name: 'وزارة الطاقة', icon: '⚡', title: 'وزير الطاقة', en: 'MINISTRY OF ENERGY', color: '#0e6f7a', accent: 0x0e7c86 },
};
const K = {
  grass: 0x84c962, paving: 0xe6e1d4, stone: 0xece5d3, stoneD: 0xd2c9b2, white: 0xf6f4ee, glass: 0x5f8fa8, glassG: 0xb9965a,
  dark: 0x2b2f33, lot: 0x676b72, hedge: 0x4f9a48, gold: 0xd9a521, trunk: 0x8a6a42, leaf: 0x3f8f45, leafL: 0x57a84e, pole: 0xc3c8cd,
  water: 0x6cc7e6, red: 0xc8432f, flower: 0xe85d8a,
};
function palm(b, x, z, h = 6) {
  b.cyl(0.22, 0.3, h, x, 0, z, K.trunk, 6);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.45, 0.07, 2.6, x + Math.sin(a) * 1.15, h - 0.2, z + Math.cos(a) * 1.15, i % 2 ? K.leaf : K.leafL, { rx: -0.45, ry: a }); }
}
function signTex(info, w = 1024) {
  const c = document.createElement('canvas'); c.width = w; c.height = 256;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  const draw = () => {
    g.fillStyle = info.color; g.fillRect(0, 0, w, 256); g.fillStyle = '#f3d27a'; g.fillRect(0, 214, w, 10);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.direction = 'rtl'; g.font = '900 104px Tajawal, Tahoma, sans-serif'; g.fillText(info.name, w / 2, 122);
    g.font = '700 40px "Segoe UI", Roboto, sans-serif'; g.direction = 'ltr'; g.fillText(info.en, w / 2, 188);
    tex.needsUpdate = true;
  };
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; draw();
  if (document.fonts) document.fonts.load('900 104px Tajawal').then(draw).catch(() => {});
  return tex;
}
// شاشة الإعلام: «أخبار قارتنا» وشريط أخبار
function screenTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  const draw = () => {
    const gr = g.createLinearGradient(0, 0, 1024, 512); gr.addColorStop(0, '#0f2a4a'); gr.addColorStop(1, '#1f4f8a'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = '#ffd84a'; g.textAlign = 'center'; g.direction = 'rtl'; g.font = '900 120px Tajawal, Tahoma, sans-serif'; g.fillText('أخبار قارتنا 📣', 512, 210);
    g.fillStyle = '#c8322a'; g.fillRect(0, 380, 1024, 90); g.fillStyle = '#fff'; g.font = '800 54px Tajawal, Tahoma, sans-serif'; g.fillText('عاجل: الوظائف مفتوحة في القارة', 512, 442);
    tex.needsUpdate = true;
  };
  tex.colorSpace = THREE.SRGBColorSpace; draw();
  if (document.fonts) document.fonts.load('900 120px Tajawal').then(draw).catch(() => {});
  return tex;
}
const clockTex = () => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#f6f4ee'; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2b2f33'; g.stroke();
  g.fillStyle = '#2b2f33'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillRect(128 + Math.sin(a) * 96 - 5, 128 - Math.cos(a) * 96 - 5, 10, 10); }
  g.lineCap = 'round'; g.lineWidth = 12; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 50, 128 - 30); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 - 10, 128 - 90); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

// الأساسيات المشتركة: عشب، ساحة، مواقف، نخيل، سياج أمامي ببوابة، سارية علم، لوحة مدخل
function grounds(b, d, M, info) {
  const cx = (M.x0 + M.x1) / 2;
  b.box(M.x1 - M.x0, 0.04, M.z1 - M.z0, cx, 0, (M.z0 + M.z1) / 2, K.grass);
  b.box(70, 0.06, 44, cx - 15, 0.02, -38, K.paving);
  b.box(42, 0.05, 38, M.x1 - 26, 0.03, -38, K.lot);
  for (let x = M.x1 - 45; x < M.x1 - 6; x += 3) for (const zr of [-52, -24]) {
    b.box(0.15, 0.02, 5, x - 1.5, 0.09, zr, K.white);
    if (((x * 7 + zr * 3) % 10 + 10) % 10 > 3) d.box(1.8, 1.3, 4.1, x, 0.1, zr, [0xffffff, 0xd9dcde, 0x2b2f33, 0x8a9399, 0x3c5a7a][Math.abs(Math.round(x + zr)) % 5]);
  }
  // السور: يلف الوزارة كاملة (قاعدة حجر + سياج حديد + أعمدة بتيجان بلون الوزارة)، والبوابة على الجادة
  const WX0 = M.x0 + 1.2, WX1 = M.x1 - 1.2, WZ0 = M.z0 + 1.2, WZ = M.z1 - 1.5;
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len, ry = Math.atan2(-uz, ux), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    b.box(len, 1, 1, mx, 0, mz, K.stone, ry); b.box(len, 0.22, 1.2, mx, 1, mz, K.stoneD, ry);
    b.box(len, 0.16, 0.16, mx, 3.05, mz, K.dark, ry); b.box(len, 0.12, 0.12, mx, 1.7, mz, K.dark, ry);
    for (let t = 0.5, k = 0; t < len; t += 0.9, k++) { const x = x0 + ux * t, z = z0 + uz * t; b.box(0.09, 2, 0.09, x, 1.2, z, K.dark); if (k % 2 === 0) b.box(0.2, 0.28, 0.2, x, 3.2, z, K.gold); }
    const n = Math.max(1, Math.round(len / 12));
    for (let i = 0; i <= n; i++) { const x = x0 + ux * (len * i) / n, z = z0 + uz * (len * i) / n; b.box(1.5, 3.9, 1.5, x, 0, z, K.stone); b.box(1.9, 0.35, 1.9, x, 3.9, z, K.stoneD); b.ball(0.42, x, 4.6, z, info.accent); }
  };
  run(WX0, WZ, cx - 7, WZ); run(cx + 7, WZ, WX1, WZ);   // الأمام (على الجادة) مع فتحة البوابة
  run(WX1, WZ, WX1, WZ0); run(WX1, WZ0, WX0, WZ0); run(WX0, WZ0, WX0, WZ);
  // البوابة: عمودين كبار وعتبة فوقها بلون الوزارة
  for (const s of [-1, 1]) { b.box(2.6, 7, 2.6, cx + s * 7.6, 0, WZ, K.stoneD); b.box(3, 0.5, 3, cx + s * 7.6, 7, WZ, K.stone); b.ball(0.75, cx + s * 7.6, 8.1, WZ, K.gold); }
  b.box(18, 2.6, 1.6, cx, 7.2, WZ, info.accent); // عتبة البوابة (عليها اسم الوزارة)
  // الأرضية: ساحة حجرية مبلّطة حول المبنى (من ورا المبنى لين ساحة المدخل) بإطار بلون الوزارة،
  // وممشى رئيسي أغمق من الساحة للباب، وعلى جوانبه أحواض نباتات
  const TX0 = cx - 62, TX1 = cx + 62, TZ0 = -146, TZ1 = -60;
  b.box(TX1 - TX0, 0.06, TZ1 - TZ0, cx, 0.03, (TZ0 + TZ1) / 2, 0xe9e3d3);
  for (let x = TX0 + 6; x < TX1; x += 6) b.box(0.22, 0.02, TZ1 - TZ0, x, 0.09, (TZ0 + TZ1) / 2, 0xd6cdb8);
  for (let z = TZ0 + 6; z < TZ1; z += 6) b.box(TX1 - TX0, 0.02, 0.22, cx, 0.09, z, 0xd6cdb8);
  for (const [w, d, x, z] of [[TX1 - TX0, 0.9, cx, TZ0], [TX1 - TX0, 0.9, cx, TZ1], [0.9, TZ1 - TZ0, TX0, (TZ0 + TZ1) / 2], [0.9, TZ1 - TZ0, TX1, (TZ0 + TZ1) / 2]]) b.box(w, 0.05, d, x, 0.08, z, info.accent);
  b.box(13, 0.05, 32, cx, 0.1, -76, 0xcfc6b0);
  for (const s of [-1, 1]) {
    b.box(0.6, 0.05, 32, cx + s * 6.8, 0.12, -76, info.accent);
    for (let z = -64; z >= -76; z -= 6) { b.box(2.4, 0.9, 2.4, cx + s * 9.2, 0.05, z, K.stoneD); b.ball(1.05, cx + s * 9.2, 1.6, z, K.hedge); }
  }
  for (const x of [M.x0 + 8, M.x0 + 28]) for (const z of [-24, -52]) palm(b, x, z);
  for (const z of [-75, -105, -135]) { palm(b, M.x0 + 6, z, 7); palm(b, M.x1 - 6, z, 7); }
  // سارية علم + لوحة المدخل
  b.cyl(0.16, 0.22, 15, cx - 30, 0, -22, K.pole, 8); b.ball(0.35, cx - 30, 15.2, -22, K.gold);
  for (const [i, c] of [[0, 0xffffff], [1, 0xc8322a], [2, 0x2f8a46]]) b.box(5, 1, 0.08, cx - 27.4, 13.6 - i, -22, c);
  return cx;
}
function addSign(root, info, x, y, z, w, h, wide) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(info, wide ? 2048 : 1024), toneMapped: false }));
  m.position.set(x, y, z); root.add(m); return m;
}

function baladiya(root, b, g, M, info) {
  const cx = (M.x0 + M.x1) / 2, z0 = -128, z1 = -92;
  // مبنى طابقين طويل بأقواس + برج ساعة في الوسط + قبة خضراء
  b.box(110, 13, z1 - z0, cx, 0, (z0 + z1) / 2, K.stone);
  b.box(112, 0.8, z1 - z0 + 2, cx, 13, (z0 + z1) / 2, K.stoneD);
  for (let x = cx - 50; x <= cx + 50; x += 7) { g.box(3.4, 4.6, 0.3, x, 1, z1 + 0.05, K.glass); b.cyl(1.7, 1.7, 0.31, x, 5.5, z1 + 0.05, K.glass, 10); g.box(3, 3.2, 0.3, x, 8, z1 + 0.05, K.glass); }
  b.box(112, 1.2, 1.2, cx, 6.6, z1 + 0.4, info.accent);
  b.box(14, 34, 14, cx, 0, z1 - 4, K.stone); b.box(15, 1, 15, cx, 34, z1 - 4, K.stoneD);
  b.add(new THREE.SphereGeometry(7, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), info.accent, { x: cx, y: 35, z: z1 - 4 });
  b.ball(0.8, cx, 42.6, z1 - 4, K.gold);
  const ct = clockTex();
  for (const [dx, dz, ry] of [[0, 7.05, 0], [7.05, 0, Math.PI / 2], [-7.05, 0, -Math.PI / 2], [0, -7.05, Math.PI]]) {
    const c = new THREE.Mesh(new THREE.CircleGeometry(4.2, 28), new THREE.MeshBasicMaterial({ map: ct, toneMapped: false }));
    c.position.set(cx + dx, 26, z1 - 4 + dz); c.rotation.y = ry; root.add(c);
  }
  b.box(20, 6, 8, cx, 0, z1 + 4, K.stoneD); g.box(8, 5, 0.3, cx, 0.2, z1 + 8.1, K.glass);   // المدخل
  // حديقة ونافورة وأحواض ورد
  b.cyl(5, 5.4, 0.7, cx - 15, 0.08, -48, K.stoneD, 18); b.cyl(4.4, 4.4, 0.1, cx - 15, 0.78, -48, K.water, 18); b.cyl(0.6, 0.9, 2.4, cx - 15, 0.8, -48, K.stoneD, 8);
  for (const s of [-1, 1]) { b.box(16, 0.5, 4, cx + s * 30, 0.08, -70, K.hedge); for (let i = 0; i < 6; i++) b.ball(0.7, cx + s * 30 - 6 + i * 2.4, 0.9, -70, K.flower); }
  addSign(root, info, cx, 16, z1 + 3.06, 13, 1.625, true); // على واجهة برج الساعة
}
function maliya(root, b, g, M, info) {
  const cx = (M.x0 + M.x1) / 2, z0 = -132, z1 = -96;
  // منصة + برج 8 طوابق بزجاج ذهبي + رواق أعمدة قدّام + شعار عملة ذهبية
  b.box(96, 2.5, 50, cx, 0, (z0 + z1) / 2 + 4, K.stoneD);
  for (let i = 0; i < 5; i++) b.box(40, 0.5 * (i + 1), 1.4, cx, 0, z1 + 11 + (4 - i) * 1.4, K.stone);
  b.box(70, 30, z1 - z0, cx, 2.5, (z0 + z1) / 2, K.white);
  for (let f = 0; f < 8; f++) g.box(70.4, 2.2, z1 - z0 + 0.4, cx, 4 + f * 3.4, (z0 + z1) / 2, K.glassG);
  for (const s of [-1, 1]) b.box(4, 30, z1 - z0 + 1, cx + s * 33, 2.5, (z0 + z1) / 2, K.stone);
  b.box(74, 1.4, z1 - z0 + 4, cx, 32.5, (z0 + z1) / 2, info.accent);
  for (let i = 0; i < 6; i++) { const x = cx - 20 + i * 8; b.cyl(1, 1.1, 10, x, 2.5, z1 + 5, K.white, 10); }
  b.box(50, 2.4, 9, cx, 12.5, z1 + 4.5, K.stone); b.box(50, 0.6, 9.4, cx, 14.9, z1 + 4.5, info.accent);
  const coin = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#d9a521'; x.beginPath(); x.arc(128, 128, 124, 0, Math.PI * 2); x.fill(); x.fillStyle = '#b8860b'; x.beginPath(); x.arc(128, 128, 96, 0, Math.PI * 2); x.fill(); x.fillStyle = '#ffe27a'; x.font = '900 120px Tajawal, Tahoma, sans-serif'; x.textAlign = 'center'; x.fillText('ق', 128, 170); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), toneMapped: false }));
  coin.position.set(cx, 24, z1 + 0.25); root.add(coin);
  addSign(root, info, cx, 13.7, z1 + 9.05, 22, 2.75, true);
}
function ilam(root, b, g, M, info) {
  const cx = (M.x0 + M.x1) / 2, z0 = -134, z1 = -96;
  // جناح منخفض عريض + برج زجاجي نحيف + برج بث أحمر وأبيض + صحون فضائية + شاشة كبيرة
  b.box(104, 12, z1 - z0, cx, 0, (z0 + z1) / 2, K.white);
  for (let f = 0; f < 3; f++) g.box(104.4, 2, z1 - z0 + 0.4, cx, 1.5 + f * 3.6, (z0 + z1) / 2, K.glass);
  b.box(106, 0.8, z1 - z0 + 2, cx, 12, (z0 + z1) / 2, info.accent);
  b.box(30, 34, 26, cx + 30, 0, z0 + 16, K.white);
  for (let f = 0; f < 8; f++) g.box(30.4, 1.6, 26.4, cx + 30, 13.6 + f * 2.5, z0 + 16, K.glass);
  for (const s of [-1, 1]) b.box(1.6, 34, 26.8, cx + 30 + s * 14.6, 0, z0 + 16, info.accent); // حواف البرج بلون الوزارة
  const tx = cx + 30, tz = z0 + 16, base = 34;
  for (let i = 0; i < 10; i++) { const w = 3.4 - i * 0.26; b.box(w, 4, w, tx, base + i * 4, tz, i % 2 ? K.red : K.white); }
  b.cyl(0.15, 0.15, 6, tx, base + 40, tz, K.dark, 6);
  for (const [dx, dz, ry] of [[-30, -6, 0.6], [-14, 6, -0.4], [-40, 8, 0.2]]) { b.cyl(0.3, 0.3, 2, cx + dx, 12.8, z0 + 19 + dz, K.dark, 6); b.add(new THREE.SphereGeometry(2.6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.4), K.white, { rx: -1.1, ry, x: cx + dx, y: 15.4, z: z0 + 19 + dz }); }
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshBasicMaterial({ map: screenTex(), toneMapped: false }));
  scr.position.set(cx - 22, 20.7, z1 + 0.25); root.add(scr);
  b.box(32, 17, 1.6, cx - 22, 12.2, z1 - 0.6, K.dark);
  // المدخل في نص الممشى بالضبط
  b.box(16, 5, 6, cx, 0, z1 + 3, info.accent); g.box(10, 4, 0.3, cx, 0.2, z1 + 6.1, K.glass);
  addSign(root, info, cx, 7.6, z1 + 6.2, 16, 2, true);
  b.box(16.6, 2.4, 0.4, cx, 6.4, z1 + 6, info.accent);
}

// ---------- الوزارات الجديدة (شرق الجامعة) ----------
function thaqafa(root, b, g, M, info) { // دار ثقافة بأقواس + برج مثمّن بتاج ذهبي + منحوتة أقنعة المسرح
  const cx = (M.x0 + M.x1) / 2, z0 = -132, z1 = -96;
  b.box(108, 2, 44, cx, 0, (z0 + z1) / 2 + 2, K.stoneD);
  b.box(100, 13, z1 - z0, cx, 2, (z0 + z1) / 2, K.white);
  b.box(104, 1, z1 - z0 + 4, cx, 15, (z0 + z1) / 2, info.accent);
  for (let i = 0; i < 9; i++) { // رواق أقواس
    const x = cx - 44 + i * 11;
    b.box(2, 10, 2, x - 5.5, 2, z1 + 3, K.stone); if (i === 8) b.box(2, 10, 2, x + 5.5, 2, z1 + 3, K.stone);
    b.add(new THREE.CylinderGeometry(4.6, 4.6, 2, 12, 1, false, -Math.PI / 2, Math.PI), K.stone, { rx: Math.PI / 2, x, y: 9.2, z: z1 + 3 });
    g.box(7, 6.5, 0.3, x, 2.6, z1 + 0.2, K.glass);
  }
  b.box(100, 2, 4, cx, 12, z1 + 3, K.stone);
  b.cyl(13, 14, 20, cx, 15, (z0 + z1) / 2, K.white, 8); b.cyl(14, 14, 1.4, cx, 35, (z0 + z1) / 2, info.accent, 8);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; g.box(4, 9, 0.3, cx + Math.sin(a) * 12.9, 21, (z0 + z1) / 2 + Math.cos(a) * 12.9, K.glass, a); }
  b.add(new THREE.SphereGeometry(10, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), K.gold, { x: cx, y: 36.4, z: (z0 + z1) / 2 });
  b.cyl(0.4, 0.6, 5, cx, 46, (z0 + z1) / 2, K.gold, 6);
  // منحوتة أقنعة المسرح وسط الساحة
  b.box(4, 4, 4, cx + 24, 0.1, -60, K.stoneD);
  for (const [dx, col, tilt] of [[-1.6, 0xf3d27a, 0.25], [1.6, 0x6b3fa0, -0.25]]) { b.add(new THREE.CylinderGeometry(2.6, 2.2, 0.6, 12), col, { rx: Math.PI / 2, rz: tilt, x: cx + 24 + dx, y: 6.4, z: -60 }); }
  for (const s of [-1, 1]) { b.box(16, 0.5, 4, cx + s * 34, 0.08, -70, K.hedge); for (let i = 0; i < 6; i++) b.ball(0.7, cx + s * 34 - 6 + i * 2.4, 0.9, -70, i % 2 ? 0xb07ad8 : K.flower); }
  addSign(root, info, cx, 13.8, z1 + 4.05, 22, 2.75, true);
}
function tijara(root, b, g, M, info) { // برج زجاجي للتجارة + مصنع بسقف منشاري ومدخنتين + حاويات
  const cx = (M.x0 + M.x1) / 2, z0 = -134, z1 = -96, T = cx, F = cx + 45; // T = البرج والمدخل (على الممشى)، F = المصنع يمينه
  b.box(40, 40, 30, T, 0, (z0 + z1) / 2, K.white);
  for (let f = 0; f < 12; f++) g.box(40.4, 2.2, 30.4, T, 3 + f * 3.1, (z0 + z1) / 2, K.glass);
  for (const s of [-1, 1]) b.box(1.6, 40, 31, T + s * 19.4, 0, (z0 + z1) / 2, info.accent);
  b.box(42, 1.4, 32, T, 40, (z0 + z1) / 2, info.accent);
  // المصنع
  b.box(44, 10, 34, F, 0, (z0 + z1) / 2, 0xd9d4c8);
  for (let i = 0; i < 5; i++) { const x = F - 18 + i * 9; b.slab(9.2, 0.5, 34, x, 13, (z0 + z1) / 2, 0x8f979e, { rz: -0.5 }); g.box(0.3, 4, 34, x + 4.2, 10, (z0 + z1) / 2, K.glass); }
  for (const [x, z] of [[F + 16, z0 + 6], [F + 8, z0 + 6]]) { b.cyl(1.6, 2, 26, x, 0, z, 0xb0a99c, 10); b.cyl(1.8, 1.8, 2, x, 26, z, 0xc8432f, 10); b.cyl(1.8, 1.8, 1.2, x, 20, z, 0xf4f1ea, 10); }
  // حاويات ملوّنة على يسار البرج
  const cols = [0xc8432f, 0x2f6fb5, 0x2f7d4f, 0xd9a521, 0x8c2f6f];
  for (let i = 0; i < 6; i++) for (let t = 0; t < 1 + (i % 3); t++) b.box(10, 2.6, 2.6, cx - 48, 0.1 + t * 2.7, z0 + 6 + i * 3.2, cols[(i + t) % 5]);
  // شعار الترس
  const gear = new THREE.Mesh(new THREE.CircleGeometry(4.2, 24), new THREE.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#c8622a'; x.beginPath(); x.arc(128, 128, 124, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; for (let i = 0; i < 10; i++) { x.save(); x.translate(128, 128); x.rotate((i / 10) * Math.PI * 2); x.fillRect(-12, -98, 24, 26); x.restore(); } x.beginPath(); x.arc(128, 128, 76, 0, Math.PI * 2); x.fill(); x.fillStyle = '#c8622a'; x.beginPath(); x.arc(128, 128, 30, 0, Math.PI * 2); x.fill(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), toneMapped: false }));
  gear.position.set(T, 34, z1 + 0.25); root.add(gear);
  b.box(18, 6, 6, T, 0, z1 + 3, info.accent); g.box(10, 4.6, 0.3, T, 0.2, z1 + 6.1, K.glass);
  addSign(root, info, T, 7.6, z1 + 6.2, 18, 2.25, true);
}
function taqa(root, b, g, M, info) { // مبنى أخضر بسقف ألواح شمسية + حقل ألواح + توربينات رياح
  const cx = (M.x0 + M.x1) / 2, z0 = -130, z1 = -96;
  b.box(90, 14, z1 - z0, cx, 0, (z0 + z1) / 2, K.white);
  for (let f = 0; f < 3; f++) g.box(90.4, 2.4, z1 - z0 + 0.4, cx, 2 + f * 4, (z0 + z1) / 2, 0x7fb6c4);
  b.box(92, 0.8, z1 - z0 + 2, cx, 14, (z0 + z1) / 2, info.accent);
  for (let x = cx - 40; x <= cx + 40; x += 8) for (let z = z0 + 4; z <= z1 - 4; z += 6) b.slab(7, 0.25, 4.6, x, 15.6, z, 0x1f3f6a, { rx: -0.35 });
  // حقل ألواح شمسية على جانبي الساحة
  for (const s of [-1, 1]) for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = cx + s * (30 + c * 7.2), z = -82 + r * 7;
    b.box(0.3, 1.4, 0.3, x, 0.1, z, K.dark); b.slab(6.4, 0.2, 3.4, x, 1.9, z, 0x1f3f6a, { rx: -0.45 });
  }
  // توربينات رياح خلف المبنى
  for (const [x, z, h] of [[cx - 50, z0 - 14, 46], [cx, z0 - 20, 54], [cx + 50, z0 - 14, 46]]) {
    b.cyl(0.9, 1.6, h, x, 0, z, K.white, 10); b.box(2.6, 2.4, 5, x, h, z, K.white);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.4; b.slab(1.4, 18, 0.5, x + Math.sin(a) * 9, h + 1.2 + Math.cos(a) * 9, z + 2.8, K.white, { rz: -a }); }
    b.ball(1, x, h + 1.2, z + 3.2, info.accent);
  }
  b.box(18, 6, 6, cx, 0, z1 + 3, info.accent); g.box(10, 4.6, 0.3, cx, 0.2, z1 + 6.1, K.glass);
  addSign(root, info, cx, 7.6, z1 + 6.2, 18, 2.25, true);
  b.box(18.6, 2.4, 0.4, cx, 6.4, z1 + 6, 0xf2c230);
}

export function buildMinistries(list, mat) {
  const all = new THREE.Group();
  const glassMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  for (const Mw of list) {
    const info = MINISTRY_INFO[Mw.id]; if (!info) continue;
    // الوزارات الجديدة تنبني في موقع التصميم (z0 -160 .. z1 -12) وتنزاح dz لموقعها
    const dz = Mw.dz || 0, M = dz ? { ...Mw, z0: Mw.z0 - dz, z1: Mw.z1 - dz } : Mw;
    const root = new THREE.Group(), b = new Builder(), g = new Builder(), d = new Builder();
    root.position.z = dz;
    grounds(b, d, M, info);
    ({ baladiya, maliya, ilam, thaqafa, tijara, taqa })[M.id](root, b, g, M, info);
    addSign(root, info, (M.x0 + M.x1) / 2, 8.5, M.z1 - 1.5 + 0.84, 17, 2.125, true); // اسم الوزارة على عتبة البوابة
    const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; };
    root.add(mk(b.build(), mat), mk(g.build(), glassMat), mk(d.build(), mat));
    root.traverse((o) => { if (o.isMesh) { o.userData.civic = 'ministry'; o.userData.ministry = M.id; } });
    all.add(root);
  }
  all.userData = { setNight(on) { glassMat.emissive.set(on ? 0x7a6a3a : 0x000000); } };
  return all;
}
// لقطة كل وزارة (عالمية) من حدود موقعها
export function ministryView(M, name = 'front') {
  const cx = (M.x0 + M.x1) / 2, dz = M.dz || 0;
  if (name === 'all') return { t: [cx, 8, -80 + dz], p: [cx + 90, 150, 90 + dz] };
  return { t: [cx, 16, -100 + dz], p: [cx + 18, 16, 30 + dz] };
}
