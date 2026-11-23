// المحكمة العليا (Low Poly): شمال الجادة مقابل حي الورد، شرق المستشفى. إحداثيات عالمية (الواجهة جهة الجادة = +z).
// منصة حجرية بدرج عريض، رواق أعمدة وجملون فوقه شعار الميزان، قاعة رئيسية بقبة كبيرة، جناحين، ساحة بحوض ماء وأعلام ومواقف.
import * as THREE from 'three';
import { Builder } from './houses.js';

export const COURT_INFO = { name: 'المحكمة العليا' };
const K = {
  stone: 0xe8dfc8, stoneD: 0xd2c6a8, wall: 0xf1ead8, col: 0xfaf6ec, roof: 0xcfc4a6, dome: 0xd8c08a, gold: 0xd9a521,
  glass: 0x50708a, paving: 0xe6dfcf, grass: 0x84c962, water: 0x6cc7e6, lot: 0x676b72, white: 0xffffff, hedge: 0x4f9a48,
  trunk: 0x8a6a42, leaf: 0x3f8f45, leafL: 0x57a84e, pole: 0xc3c8cd,
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
const signTex = (wide = false) => canvasTex((g, w, h) => {
  g.fillStyle = '#3b3326'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9a521'; g.fillRect(0, 8, w, 6); g.fillRect(0, h - 14, w, 6);
  g.fillStyle = '#f3d27a'; g.textAlign = 'center'; g.direction = 'rtl'; g.font = '900 112px Tajawal, Tahoma, sans-serif'; g.fillText('المحكمة العليا', w / 2, 128);
  g.font = '700 42px "Segoe UI", Roboto, sans-serif'; g.direction = 'ltr'; g.fillText('SUPREME COURT', w / 2, 196);
}, wide ? 2048 : 1024, 256);
// شعار الميزان (دائرة ذهبية)
const emblemTex = () => canvasTex((g, w, h) => {
  g.fillStyle = '#d9a521'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3b3326'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 22, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#f3d27a'; g.fillStyle = '#f3d27a'; g.lineWidth = 12; g.lineCap = 'round';
  const cx = w / 2, top = 70;
  g.beginPath(); g.moveTo(cx, top); g.lineTo(cx, 200); g.stroke();                     // العمود
  g.beginPath(); g.moveTo(cx - 70, 205); g.lineTo(cx + 70, 205); g.stroke();             // القاعدة
  g.beginPath(); g.moveTo(cx - 80, 95); g.lineTo(cx + 80, 95); g.stroke();               // الذراع
  for (const s of [-1, 1]) {
    const px = cx + s * 80; g.lineWidth = 5;
    g.beginPath(); g.moveTo(px, 95); g.lineTo(px - 24, 150); g.moveTo(px, 95); g.lineTo(px + 24, 150); g.stroke();
    g.beginPath(); g.arc(px, 150, 26, 0, Math.PI); g.fill(); g.lineWidth = 12;
  }
  g.beginPath(); g.arc(cx, top - 6, 10, 0, Math.PI * 2); g.fill();
}, 256, 256);

// ---------- أعلام دول الشرق الأوسط (مرسومة مبسّطة على Canvas) ----------
function star(g, x, y, r, n = 5, inner = 0.45, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, rr = i % 2 ? r * inner : r; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fill();
}
const H3 = (g, a, b, c) => { const W = 360, H = 240; [a, b, c].forEach((col, i) => { g.fillStyle = col; g.fillRect(0, (i * H) / 3, W, H / 3 + 1); }); };
const tri = (g, w, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 120); g.lineTo(0, 240); g.closePath(); g.fill(); };
const serrated = (g, base, depth, n, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, 0); g.lineTo(base, 0); for (let i = 0; i < n; i++) { g.lineTo(base + depth, ((i + 0.5) * 240) / n); g.lineTo(base, ((i + 1) * 240) / n); } g.lineTo(0, 240); g.closePath(); g.fill(); };
const txt = (g, s, y, size, col) => { g.fillStyle = col; g.textAlign = 'center'; g.direction = 'rtl'; g.font = `700 ${size}px Tajawal, Tahoma, sans-serif`; g.fillText(s, 180, y); };
const RED = '#ce1126', GREEN = '#007a3d', BLACK = '#111111', WHITE = '#ffffff';
const FLAGS = [
  ['عُمان', (g) => { g.fillStyle = RED; g.fillRect(0, 0, 360, 240); g.fillStyle = WHITE; g.fillRect(90, 0, 270, 80); g.fillStyle = GREEN; g.fillRect(90, 160, 270, 80); g.strokeStyle = WHITE; g.lineWidth = 6; g.beginPath(); g.moveTo(25, 25); g.lineTo(65, 65); g.moveTo(65, 25); g.lineTo(25, 65); g.stroke(); g.beginPath(); g.arc(45, 48, 14, 0, Math.PI); g.stroke(); }],
  ['السعودية', (g) => { g.fillStyle = '#006c35'; g.fillRect(0, 0, 360, 240); txt(g, 'لا إله إلا الله محمد رسول الله', 105, 30, WHITE); g.fillStyle = WHITE; g.fillRect(80, 160, 200, 7); g.fillRect(262, 150, 7, 27); }],
  ['الإمارات', (g) => { H3(g, '#00732f', WHITE, BLACK); g.fillStyle = RED; g.fillRect(0, 0, 90, 240); }],
  ['قطر', (g) => { g.fillStyle = '#8a1538'; g.fillRect(0, 0, 360, 240); serrated(g, 95, 34, 9, WHITE); }],
  ['البحرين', (g) => { g.fillStyle = RED; g.fillRect(0, 0, 360, 240); serrated(g, 95, 40, 5, WHITE); }],
  ['الكويت', (g) => { H3(g, GREEN, WHITE, RED); g.fillStyle = BLACK; g.beginPath(); g.moveTo(0, 0); g.lineTo(90, 80); g.lineTo(90, 160); g.lineTo(0, 240); g.closePath(); g.fill(); }],
  ['اليمن', (g) => H3(g, RED, WHITE, BLACK)],
  ['العراق', (g) => { H3(g, RED, WHITE, BLACK); txt(g, 'الله أكبر', 134, 40, GREEN); }],
  ['الأردن', (g) => { H3(g, BLACK, WHITE, GREEN); tri(g, 180, RED); g.fillStyle = WHITE; star(g, 62, 120, 20, 7); }],
  ['سوريا', (g) => { H3(g, GREEN, WHITE, BLACK); g.fillStyle = RED; for (const x of [120, 180, 240]) star(g, x, 120, 20); }],
  ['لبنان', (g) => { g.fillStyle = RED; g.fillRect(0, 0, 360, 240); g.fillStyle = WHITE; g.fillRect(0, 60, 360, 120); g.fillStyle = '#00a651'; for (let i = 0; i < 4; i++) { const w = 30 + i * 22, y = 72 + i * 22; g.beginPath(); g.moveTo(180, y); g.lineTo(180 + w, y + 28); g.lineTo(180 - w, y + 28); g.closePath(); g.fill(); } g.fillRect(172, 160, 16, 14); }],
  ['فلسطين', (g) => { H3(g, BLACK, WHITE, GREEN); tri(g, 150, RED); }],
  ['مصر', (g) => { H3(g, RED, WHITE, BLACK); g.fillStyle = '#c09300'; g.beginPath(); g.moveTo(180, 90); g.lineTo(210, 106); g.lineTo(196, 150); g.lineTo(164, 150); g.lineTo(150, 106); g.closePath(); g.fill(); g.beginPath(); g.arc(180, 92, 8, 0, Math.PI * 2); g.fill(); }],
  ['إيران', (g) => { H3(g, '#239f40', WHITE, '#da0000'); g.strokeStyle = '#da0000'; g.lineWidth = 8; g.beginPath(); g.arc(180, 120, 24, 0.5, Math.PI - 0.5, true); g.stroke(); g.fillStyle = '#da0000'; g.fillRect(176, 92, 8, 52); }],
  ['تركيا', (g) => { g.fillStyle = '#e30a17'; g.fillRect(0, 0, 360, 240); g.fillStyle = WHITE; g.beginPath(); g.arc(140, 120, 60, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e30a17'; g.beginPath(); g.arc(156, 120, 48, 0, Math.PI * 2); g.fill(); g.fillStyle = WHITE; star(g, 222, 120, 26, 5, 0.42, Math.PI); }],
];
function flagTex(draw) {
  const c = document.createElement('canvas'); c.width = 360; c.height = 240;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  const run = () => { draw(g); tex.needsUpdate = true; };
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; run();
  if (document.fonts) document.fonts.load('700 30px Tajawal').then(run).catch(() => {});
  return tex;
}
// صفين أعلام: الأمامي أقصر والخلفي أطول عشان يبانون كلهم. b = Builder للأعمدة
function middleEastFlags(root, b, x0, x1, zFront, zBack) {
  const front = FLAGS.slice(0, 8), back = FLAGS.slice(8);
  const row = (list, z, h) => list.forEach(([, draw], i) => {
    const x = x0 + ((x1 - x0) * (i + 0.5)) / list.length - 2.2;
    b.cyl(0.13, 0.18, h, x, 0, z, 0xd9dcde, 8); b.ball(0.3, x, h + 0.2, z, K.gold); b.cyl(0.6, 0.7, 0.4, x, 0, z, K.stoneD, 8);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), new THREE.MeshLambertMaterial({ map: flagTex(draw), side: THREE.DoubleSide }));
    m.position.set(x + 2.15, h - 1.6, z); m.castShadow = true;
    root.add(m);
  });
  row(front, zFront, 10); row(back, zBack, 13);
  // لوحة صغيرة
  b.box(14, 1.4, 0.8, (x0 + x1) / 2, 0, zFront + 5, K.stoneD);
}
export const MIDEAST_FLAGS = FLAGS.map((f) => f[0]);

export function buildCourt(S, mat) {
  const root = new THREE.Group(), b = new Builder(), g = new Builder(), d = new Builder(), L = new Builder();
  const cx = S.gateX;
  // الأرضية: عشب + ساحة حجرية + حوض ماء + سياج نباتي على الجادة
  b.box(S.x1 - S.x0, 0.04, S.z1 - S.z0, (S.x0 + S.x1) / 2, 0, (S.z0 + S.z1) / 2, K.grass);
  b.box(124, 0.06, 56, cx, 0.02, -42, K.paving);
  b.box(44, 0.3, 26, cx, 0.04, -49, K.stoneD); b.box(40, 0.1, 22, cx, 0.3, -49, K.water);
  for (let i = 0; i < 3; i++) b.cyl(0.5, 0.7, 1.6, cx - 12 + i * 12, 0.3, -49, K.stoneD, 8);
  // سور المحكمة: قاعدة حجرية + سياج حديد مشغول + أعمدة حجرية بتيجان ذهبية، وبوابة كبيرة مقوّسة على الجادة
  const WX0 = S.x0 + 1.5, WX1 = S.x1 - 1.5, WZ0 = S.z0 + 1.5, WZ1 = S.z1 - 1.5, GATE = 9;
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len, ry = Math.atan2(-uz, ux);
    const P = (t) => [x0 + ux * t, z0 + uz * t];
    b.box(len, 1.1, 1.1, (x0 + x1) / 2, 0, (z0 + z1) / 2, K.stone, ry);                 // القاعدة
    b.box(len, 0.25, 1.3, (x0 + x1) / 2, 1.1, (z0 + z1) / 2, K.stoneD, ry);
    b.box(len, 0.18, 0.18, (x0 + x1) / 2, 3.35, (z0 + z1) / 2, 0x2b2f33, ry);            // الدرابزين الحديد
    b.box(len, 0.14, 0.14, (x0 + x1) / 2, 1.75, (z0 + z1) / 2, 0x2b2f33, ry);
    for (let t = 0.6, k = 0; t < len; t += 0.8, k++) { const [x, z] = P(t); b.box(0.1, 2.25, 0.1, x, 1.35, z, 0x2b2f33); if (k % 2 === 0) b.box(0.22, 0.32, 0.22, x, 3.55, z, K.gold); }
    const n = Math.max(1, Math.round(len / 12));
    for (let i = 0; i <= n; i++) { const [x, z] = P((len * i) / n); b.box(1.7, 4.4, 1.7, x, 0, z, K.stone); b.box(2.1, 0.4, 2.1, x, 4.4, z, K.stoneD); b.ball(0.45, x, 5.2, z, K.gold); }
  };
  run(WX0, WZ1, cx - GATE, WZ1); run(cx + GATE, WZ1, WX1, WZ1);   // الجنوب (على الجادة) مع فتحة البوابة
  run(WX1, WZ1, WX1, WZ0); run(WX1, WZ0, WX0, WZ0); run(WX0, WZ0, WX0, WZ1);
  // البوابة: عمودين كبار بفوانيس + قوس + لوحة الاسم والشعار + درفتين حديد مفتوحة
  for (const s of [-1, 1]) {
    const x = cx + s * (GATE + 1.4);
    b.box(3.2, 10, 3.2, x, 0, WZ1, K.stone); b.box(3.8, 0.6, 3.8, x, 10, WZ1, K.stoneD); b.box(2.2, 1.2, 2.2, x, 10.6, WZ1, K.stone);
    b.cyl(0.5, 0.7, 1.6, x, 11.8, WZ1, 0x2b2f33, 8); b.ball(0.65, x, 14, WZ1, K.gold); L.box(0.9, 1, 0.9, x, 12.2, WZ1, 0xffe6a8);
    // درفة حديد مفتوحة للداخل
    const hx = cx + s * GATE;
    for (let t = 0.4; t < 7.6; t += 0.7) b.box(0.1, 3.2, 0.1, hx - s * t * Math.cos(1.15), 0.2, WZ1 - t * Math.sin(1.15), 0x2b2f33);
    for (const y of [0.6, 3.3]) b.box(7.8, 0.16, 0.16, hx - s * 3.9 * Math.cos(1.15), y, WZ1 - 3.9 * Math.sin(1.15), 0x2b2f33, -s * 1.15);
  }
  b.box(2 * GATE + 6, 1.6, 2.4, cx, 10.3, WZ1, K.stone);                                  // عتبة القوس
  b.add(new THREE.CylinderGeometry(GATE + 1, GATE + 1, 2.4, 20, 1, false, -Math.PI / 2, Math.PI), K.stoneD, { rx: -Math.PI / 2, x: cx, y: 11.9, z: WZ1 });
  b.add(new THREE.CylinderGeometry(GATE - 0.6, GATE - 0.6, 2.6, 20, 1, false, -Math.PI / 2, Math.PI), K.stone, { rx: -Math.PI / 2, x: cx, y: 11.9, z: WZ1 });
  b.ball(0.9, cx, GATE + 13.6, WZ1, K.gold);
  // المواقف على الجانبين
  for (const [x0, x1] of [[S.x0 + 4, 676], [808, S.x1 - 4]]) {
    b.box(x1 - x0, 0.05, 44, (x0 + x1) / 2, 0.03, -40, K.lot);
    for (let x = x0 + 3; x < x1 - 2; x += 3) for (const zr of [-56, -24]) {
      b.box(0.15, 0.02, 5, x - 1.5, 0.09, zr, K.white);
      if (((x * 5 + zr * 7) % 10 + 10) % 10 > 3) d.box(1.8, 1.3, 4.1, x, 0.1, zr, [0xffffff, 0xd9dcde, 0x2b2f33, 0x8a9399, 0x3c5a7a][Math.abs(Math.round(x * 3 + zr)) % 5]);
    }
  }
  // الأعلام (أحمر/أبيض/أخضر) وأعمدة إنارة ونخيل
  for (const x of [cx - 46, cx - 30, cx + 30, cx + 46]) {
    b.cyl(0.18, 0.24, 14, x, 0, -18, K.pole, 8); b.ball(0.35, x, 14.2, -18, K.gold);
    for (const [i, c] of [[0, 0xffffff], [1, 0xc8322a], [2, 0x2f8a46]]) b.box(5, 1, 0.08, x + 2.6, 12.6 - i, -18, c);
  }
  for (const x of [cx - 60, cx + 60]) for (const z of [-30, -60]) palm(b, x, z);
  for (const x of [S.x0 + 5, S.x1 - 5]) for (let z = -75; z >= -170; z -= 16) palm(b, x, z, 7);
  for (const [x, z] of [[cx - 22, -26], [cx + 22, -26], [cx - 58, -66], [cx + 58, -66]]) { b.cyl(0.12, 0.15, 6, x, 0, z, K.pole, 6); b.ball(0.6, x, 6.2, z, 0xf4efe0); L.ball(0.55, x, 6.2, z, 0xffe6a8); }

  // المنصة والدرج العريض
  b.box(160, 4, 76, cx, 0, -120, K.stone);
  b.box(162, 0.6, 78, cx, 4, -120, K.stoneD);
  for (let i = 0; i < 8; i++) b.box(90, 0.5 * (i + 1), 1.75, cx, 0, -68 - i * 1.75, K.stone);
  for (const s of [-1, 1]) b.box(4, 5, 14.5, cx + s * 47, 0, -75, K.stoneD);
  // القاعة الرئيسية + شبابيك طويلة
  b.box(128, 18, 54, cx, 4.6, -123, K.wall);
  for (let x = cx - 56; x <= cx + 56; x += 10) g.box(3.2, 9, 0.3, x, 8, -95.9, K.glass);
  for (const s of [-1, 1]) for (let z = -144; z <= -102; z += 9) g.box(0.3, 9, 3.2, cx + s * 64.1, 8, z, K.glass);
  b.box(132, 1.4, 58, cx, 22.6, -123, K.stoneD);
  // رواق الأعمدة
  for (let i = 0; i < 10; i++) {
    const x = cx - 52 + i * (104 / 9);
    b.box(3.2, 0.8, 3.2, x, 4.6, -88, K.stoneD); b.cyl(1.15, 1.3, 15, x, 5.4, -88, K.col, 12); b.box(3.2, 1, 3.2, x, 20.4, -88, K.stoneD);
  }
  b.box(118, 3.6, 12, cx, 21.4, -89, K.stone);                  // العتبة (الإفريز)
  b.box(118, 0.6, 12, cx, 25, -89, K.stoneD);
  b.gable(12, 9, 120, cx, 25.6, -89, K.stone, Math.PI / 2);      // الجملون
  b.box(120, 0.5, 12, cx, 25.4, -89, K.stoneD);
  // القبة: أسطوانة بأعمدة صغيرة + قبة + فانوس ذهبي
  b.cyl(17, 17, 2, cx, 24, -125, K.stoneD, 24);
  b.cyl(15, 15, 8, cx, 26, -125, K.wall, 24);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; b.cyl(0.6, 0.6, 8, cx + Math.cos(a) * 15.6, 26, -125 + Math.sin(a) * 15.6, K.col, 8); g.box(2.4, 4, 0.3, cx + Math.cos(a + 0.2) * 15.1, 28, -125 + Math.sin(a + 0.2) * 15.1, K.glass, -(a + 0.2) + Math.PI / 2); }
  b.cyl(16.4, 16.4, 1, cx, 34, -125, K.stoneD, 24);
  b.add(new THREE.SphereGeometry(15.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), K.dome, { x: cx, y: 35, z: -125 });
  b.cyl(2.6, 2.6, 4, cx, 49.6, -125, K.wall, 10); b.add(new THREE.SphereGeometry(2.8, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), K.gold, { x: cx, y: 53.6, z: -125 });
  b.cyl(0.25, 0.25, 3, cx, 56, -125, K.gold, 6); b.ball(0.7, cx, 59.2, -125, K.gold);
  L.box(1.4, 1.4, 1.4, cx, 51, -125, 0xffe6a8);
  // الجناحين
  for (const s of [-1, 1]) {
    const wx = cx + s * 92;
    b.box(54, 14, 52, wx, 0, -130, K.wall); b.box(56, 1.2, 54, wx, 14, -130, K.stoneD);
    for (let f = 0; f < 3; f++) for (let x = wx - 22; x <= wx + 22; x += 8) g.box(3, 2.6, 0.3, x, 2.2 + f * 4, -103.9, K.glass);
    b.box(10, 9, 2, wx, 0, -103.2, K.stoneD); g.box(5, 6, 0.3, wx, 0.4, -102.1, K.glass);          // مدخل الجناح
  }
  // اللوحة على الإفريز والشعار في الجملون
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(27.2, 3.4), new THREE.MeshBasicMaterial({ map: signTex(true), toneMapped: false })); // نسبة 8:1 مثل الصورة
  sign.position.set(cx, 23.2, -82.92);
  const emb = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), new THREE.MeshBasicMaterial({ map: emblemTex(), toneMapped: false }));
  emb.position.set(cx, 29.6, -82.9);
  // أعلام دول الشرق الأوسط: الجهة اليسار (الغرب) داخل السور، بين المواقف والجناح الغربي
  middleEastFlags(root, b, S.x0 + 12, 676, -71, -93);
  // اسم المحكمة والشعار على قوس البوابة (يطالعون الجادة)
  const WZf = S.z1 - 1.5 + 1.35;
  const gate = new THREE.Mesh(new THREE.PlaneGeometry(13.6, 3.4), new THREE.MeshBasicMaterial({ map: signTex(), toneMapped: false }));
  gate.position.set(cx, 13.9, WZf);
  const emb2 = new THREE.Mesh(new THREE.CircleGeometry(2.3, 32), emb.material); emb2.position.set(cx, 18.1, WZf);
  root.add(sign, emb, gate, emb2);

  const glassMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const lights = new THREE.Mesh(L.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })); lights.visible = false;
  const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; };
  root.add(mk(b.build(), mat), mk(g.build(), glassMat), mk(d.build(), mat), lights);
  root.userData = { civic: 'court', setNight(on) { glassMat.emissive.set(on ? 0x7a6a3a : 0x000000); lights.visible = on; } };
  root.traverse((o) => { if (o.isMesh) o.userData.civic = 'court'; });
  return root;
}

export const COURT_VIEWS = {
  all: { t: [742, 10, -100], p: [860, 190, 90] },
  front: { t: [742, 26, -100], p: [742, 16, 14] },
  dome: { t: [742, 42, -125], p: [800, 70, -40] },
};
