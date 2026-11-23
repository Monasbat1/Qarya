// جامع السلطان قابوس الأكبر (مسقط) — معلم Low Poly داخل قارتنا.
// المقياس: وحدة اللعبة = 1 متر (نفس مقياس البيوت وسور القصر).
// المراجع: ورقة الحقائق الرسمية (المجمع بين البوابات 166×240م، المصلى 74.4×74.4م، قمة القبة 50م مع الهلال،
// المئذنة الرئيسية 91.5م وقاعدتها 10.9م، المآذن الأربع 45م، الصحن الخارجي مرفوع 1.8م، الأروقة الجانبية 237.2م)
// + صورة قمر صناعي (الشمال فوق): المحور الطويل شرق–غرب، المصلى غربًا وقبته في وسطه، مبنى الصحن الداخلي ومصلى النساء شرقه،
// رواقان طويلان شمال وجنوب، أربع مآذن في الأركان، والمئذنة الكبيرة في منتصف الرواق الشمالي عند المدخل الرئيسي.
// المحاور المحلية: x شرق، z جنوب (نفس اتجاهات خريطة القارة)، الأصل = مركز الصحن المرفوع.
import * as THREE from 'three';
import { Builder } from './houses.js';

const P = 1.8; // ارتفاع الصحن المرفوع
const C = {
  sand: 0xe2cfa8, sandD: 0xcdb487, ivory: 0xf3ead8, marble: 0xf6f2ea, recess: 0xa8916a, deep: 0x5d4a33,
  wood: 0x6e4524, gold: 0xd8a93e, glass: 0x4f7389, blue: 0x2c6a8c, lawn: 0x84c962, lawn2: 0x93d16c, path: 0xe9e1cf,
  asph: 0x5c6068, trunk: 0x7a5a36, leaf: 0x3f8f45, leaf2: 0x57a84e, dome: 0xe8c66e,
};
// أبعاد مرجعية (متر)
export const MOSQUE = {
  podium: { x0: -124, x1: 124, z0: -80, z1: 80 },
  site: { x0: -215, x1: 205, z0: -150, z1: 175 },   // مع الحدائق والمواقف
  hall: { x0: -86, x1: -14, z0: -37, z1: 37 },
  dome: { x: -50, z: 0 },
  inner: { x0: 8, x1: 79, z0: -27, z1: 27 },
  mainMinaret: { x: 0, z: -76 },
  minarets: [[-120, -76], [120, -76], [-120, 76], [120, 76]],
};

// ---------- أشكال مشتركة ----------
// لوح فيه قوس مدبّب (مفتوح): عرض w، ارتفاع h، عمق d. القوس يبدأ عند spring ويوصل apex
function archPanel(w, h, d, aw, spring, apex) {
  // شكل واحد يلف حول فتحة القوس (الفتحة مفتوحة من تحت، فما تنفع كـ hole)
  const a = aw / 2, rise = apex - spring, s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(-a, 0); s.lineTo(-a, spring);
  s.bezierCurveTo(-a, spring + rise * 0.55, -a * 0.25, spring + rise * 0.85, 0, apex);
  s.bezierCurveTo(a * 0.25, spring + rise * 0.85, a, spring + rise * 0.55, a, spring);
  s.lineTo(a, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -d / 2);
  return g;
}
// تجويف قوس مدبّب مصمت (للنوافذ والأبواب على الجدران): لوح رقيق بشكل القوس
function archShape(aw, spring, apex, d) {
  const a = aw / 2, rise = apex - spring, s = new THREE.Shape();
  s.moveTo(-a, 0); s.lineTo(-a, spring);
  s.bezierCurveTo(-a, spring + rise * 0.55, -a * 0.25, spring + rise * 0.85, 0, apex);
  s.bezierCurveTo(a * 0.25, spring + rise * 0.85, a, spring + rise * 0.55, a, spring);
  s.lineTo(a, 0); s.lineTo(-a, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -d / 2);
  return g;
}
// قبة صغيرة (نصف كرة مدببة قليلًا) قاعدتها عند y
function smallDome(b, r, x, y, z, color = C.ivory, finial = true) {
  const pts = [];
  for (let i = 0; i <= 6; i++) { const t = i / 6, a = t * Math.PI / 2; pts.push(new THREE.Vector2(r * Math.cos(a) * (1 - 0.08 * t), r * 1.08 * Math.sin(a))); }
  b.cyl(r * 1.04, r * 1.08, r * 0.35, x, y, z, C.sand, 12);
  b.add(new THREE.LatheGeometry(pts, 12), color, { x, y: y + r * 0.35, z });
  if (finial) { b.cyl(0.06 * r + 0.05, 0.08 * r + 0.06, r * 0.5, x, y + r * 1.4, z, C.gold, 6); b.ball(0.12 * r + 0.08, x, y + r * 1.95, z, C.gold); }
}
// شرفات (كرانيش مسننة) على حافة سطح مستطيل
function merlons(b, x0, x1, z0, z1, y, step = 2.2, h = 0.9, color = C.ivory) {
  for (let x = x0 + step / 2; x < x1; x += step) { b.box(1.1, h, 0.6, x, y, z0, color); b.box(1.1, h, 0.6, x, y, z1, color); }
  for (let z = z0 + step / 2; z < z1; z += step) { b.box(0.6, h, 1.1, x0, y, z, color); b.box(0.6, h, 1.1, x1, y, z, color); }
}
// صف أقواس على واجهة: من (x0) إلى (x1) على خط z (أو العكس إذا alongZ)، الواجهة جهة dir
function arcadeRow(b, from, to, line, y, { bay = 4.6, h = 6.4, aw = 3.3, spring = 3.4, apex = 5.4, d = 0.7, alongZ = false, color = C.ivory, back = C.recess, depth = 2.4, dir = 1 } = {}) {
  const n = Math.max(1, Math.round((to - from) / bay)), w = (to - from) / n;
  const panel = archPanel(w, h, d, aw * (w / bay), spring, apex);
  for (let i = 0; i < n; i++) {
    const c = from + w * (i + 0.5);
    if (alongZ) b.add(panel.clone(), color, { x: line, y, z: c, ry: Math.PI / 2 });
    else b.add(panel.clone(), color, { x: c, y, z: line });
  }
  panel.dispose();
  // جدار خلفي غامق داخل الرواق (عمق وظل)
  if (alongZ) b.box(0.3, h - 0.4, to - from, line - dir * depth, y, (from + to) / 2, back);
  else b.box(to - from, h - 0.4, 0.3, (from + to) / 2, y, line + dir * depth, back);
}
// نوافذ/تجاويف مقوسة على جدار مسطح
function archWindows(b, from, to, line, y, { step = 5, aw = 2, spring = 3, apex = 4.4, alongZ = false, color = C.recess, out = 1 } = {}) {
  const g = archShape(aw, spring, apex, 0.25);
  for (let c = from + step / 2; c < to - step / 4; c += step) {
    if (alongZ) b.add(g.clone(), color, { x: line + out * 0.08, y, z: c, ry: Math.PI / 2 });
    else b.add(g.clone(), color, { x: c, y, z: line + out * 0.08 });
  }
  g.dispose();
}

// ---------- المئذنة ----------
// main=true: المئذنة الكبيرة 91.5م (قاعدة 10.9م). وإلا: 45م
function minaret(b, x, z, main) {
  const H = main ? 91.5 : 45, base = main ? 10.9 : 6.2, y0 = main ? P : P;
  const sq = main ? 21 : 11;                      // ارتفاع البدن المربع
  b.box(base + 1.2, 1.2, base + 1.2, x, y0, z, C.sandD);            // قاعدة
  b.box(base, sq, base, x, y0 + 1.2, z, C.sand);                     // البدن المربع
  for (const [dx, dz, ry] of [[0, base / 2, 0], [0, -base / 2, 0], [base / 2, 0, Math.PI / 2], [-base / 2, 0, Math.PI / 2]]) {
    const g = archShape(base * 0.42, sq * 0.45, sq * 0.6, 0.3);
    b.add(g, C.recess, { x: x + dx * 1.01, y: y0 + 3, z: z + dz * 1.01, ry });
  }
  b.box(base + 0.8, 0.9, base + 0.8, x, y0 + 1.2 + sq, z, C.ivory);  // حزام
  merlons(b, x - base / 2 - 0.2, x + base / 2 + 0.2, z - base / 2 - 0.2, z + base / 2 + 0.2, y0 + 2.1 + sq, main ? 1.8 : 1.5, 0.8);
  // البدن المثمن بشرفات متدرجة
  const r1 = main ? 4.3 : 2.5, r2 = main ? 3.2 : 1.9, r3 = main ? 2.3 : 1.4;
  const s1 = y0 + 2.1 + sq, l1 = main ? 29 : 13;                     // المثمن الأول
  b.cyl(r1, r1 * 1.05, l1, x, s1, z, C.ivory, 8);
  for (let k = 1; k < (main ? 4 : 2); k++) b.cyl(r1 * 1.07, r1 * 1.07, 0.5, x, s1 + (l1 * k) / (main ? 4 : 2), z, C.sand, 8); // أحزمة زخرفية
  const bal = (y, r) => { b.cyl(r * 1.45, r * 1.05, 1.2, x, y, z, C.sand, 8); b.cyl(r * 1.5, r * 1.5, 0.3, x, y + 1.2, z, C.ivory, 8); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.box(0.35, 1.1, 0.35, x + Math.cos(a) * r * 1.42, y + 1.5, z + Math.sin(a) * r * 1.42, C.ivory); } b.cyl(r * 1.47, r * 1.47, 0.22, x, y + 2.6, z, C.sand, 8); };
  bal(s1 + l1, r1);                                                  // الشرفة الأولى
  const s2 = s1 + l1 + 2.8, l2 = main ? 12 : 5;
  b.cyl(r2, r2, l2, x, s2, z, C.ivory, 8);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; b.box(0.5, l2 * 0.55, 0.12, x + Math.cos(a) * r2 * 0.97, s2 + l2 * 0.25, z + Math.sin(a) * r2 * 0.97, C.recess, -a + Math.PI / 2); }
  bal(s2 + l2, r2);                                                  // الشرفة الثانية
  let top = s2 + l2 + 2.8;
  if (main) { b.cyl(r3, r3, 5, x, top, z, C.ivory, 8); bal(top + 5, r3); top += 7.8; }  // شرفة ثالثة للكبيرة
  // الجوسق العلوي: أعمدة رفيعة + قبة صغيرة + هلال
  const rl = main ? 2.1 : 1.3, hl = main ? 4.2 : 2.6;
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.box(0.3, hl, 0.3, x + Math.cos(a) * rl, top, z + Math.sin(a) * rl, C.ivory); }
  b.cyl(rl * 0.7, rl * 0.7, hl, x, top, z, C.recess, 8);
  b.cyl(rl * 1.15, rl * 1.15, 0.4, x, top + hl, z, C.sand, 8);
  const dTop = top + hl + 0.4, rem = H - dTop;                       // الباقي: قبة + هلال لين الارتفاع الرسمي
  if (rem < 2.5) console.warn('minaret budget', H, dTop);
  const dh = rem * 0.45;
  const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push(new THREE.Vector2(rl * 1.05 * Math.cos(t * Math.PI / 2) * (1 - 0.15 * t), dh * Math.sin(t * Math.PI / 2))); }
  b.add(new THREE.LatheGeometry(pts, 8), C.dome, { x, y: dTop, z });
  b.cyl(0.12, 0.2, rem * 0.4, x, dTop + dh, z, C.gold, 6);
  b.ball(main ? 0.55 : 0.35, x, dTop + dh + rem * 0.42, z, C.gold);
  b.slab(0.12, main ? 1.4 : 0.9, main ? 1.0 : 0.6, x, H - (main ? 0.7 : 0.45), z, C.gold);  // الهلال (مبسّط)
}

// ---------- القبة الكبيرة: نقش هندسي مبسّط على لون ذهبي-عاجي ----------
function domeTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#ead29a'; x.fillRect(0, 0, 512, 256);
  // شبكة معينات (نقش هندسي) + نجوم صغيرة عند التقاطعات
  x.strokeStyle = '#b8892c'; x.lineWidth = 3;
  for (let i = -16; i < 48; i++) { x.beginPath(); x.moveTo(i * 32, 256); x.lineTo(i * 32 + 256, 0); x.stroke(); x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 256, 256); x.stroke(); }
  x.fillStyle = '#2c6a8c';
  for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) { x.beginPath(); x.arc(i * 32 + 16, j * 32 + 16, 3, 0, Math.PI * 2); x.fill(); }
  // أشرطة أفقية عند القاعدة والقمة
  x.fillStyle = '#2c6a8c'; x.fillRect(0, 238, 512, 18);
  x.fillStyle = '#d8a93e'; x.fillRect(0, 230, 512, 8); x.fillRect(0, 0, 512, 10);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function marbleTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#f5f1e8'; x.fillRect(0, 0, 128, 128);
  x.fillStyle = '#e6dccb'; x.fillRect(0, 0, 64, 64); x.fillRect(64, 64, 64, 64);
  x.strokeStyle = '#cdbf9f'; x.lineWidth = 2;
  x.beginPath(); x.moveTo(64, 8); x.lineTo(120, 64); x.lineTo(64, 120); x.lineTo(8, 64); x.closePath(); x.stroke(); // معين
  x.strokeRect(1, 1, 126, 126);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// ---------- المجمع كامل ----------
export function buildMosque(mat) {
  const group = new THREE.Group();
  const b = new Builder();      // الكتل والتفاصيل
  const land = new Builder();   // الأرض والحدائق والمواقف (بدون ظل ملقى)
  const M = MOSQUE, pd = M.podium;

  // --- الأرض المحيطة ---
  land.box(M.site.x1 - M.site.x0, 0.05, M.site.z1 - M.site.z0, (M.site.x0 + M.site.x1) / 2, 0.01, (M.site.z0 + M.site.z1) / 2, C.lawn2);
  // الحدائق الشرقية (حديقة الجامع): مربعات عشب وممرات
  for (let gx = 0; gx < 3; gx++) for (let gz = 0; gz < 5; gz++) land.box(22, 0.06, 26, 138 + gx * 24, 0.03, -62 + gz * 30, (gx + gz) % 2 ? C.lawn : C.lawn2);
  land.box(6, 0.07, 160, 162, 0.04, 0, C.path); land.box(76, 0.07, 5, 162, 0.04, 0, C.path);
  // الممر الرئيسي من الجادة شمالًا للمدخل
  land.box(16, 0.08, 64, 0, 0.04, -114, C.path);
  for (const s of [-1, 1]) land.box(46, 0.06, 60, s * 40, 0.03, -113, C.lawn);
  // مواقف السيارات جنوبًا
  land.box(300, 0.07, 52, 0, 0.04, 140, C.asph);
  for (let x = -146; x <= 146; x += 4) for (const z of [123, 157]) land.box(0.25, 0.02, 9, x, 0.11, z, 0xf2f2ea);
  land.box(300, 0.08, 4, 0, 0.04, 140, C.path); // ممر مشاة وسط المواقف
  land.box(8, 0.08, 30, 0, 0.04, 99, C.path);   // من المواقف للبوابة الجنوبية

  // --- الصحن المرفوع (1.8م) بدرجات ---
  b.box(pd.x1 - pd.x0, P, pd.z1 - pd.z0, 0, 0, 0, C.sandD);
  const steps = (x, z, w, dirx, dirz) => { for (let i = 0; i < 3; i++) { const o = 1 + i * 1.1; b.box(dirz ? w : 1.1, P - i * 0.6, dirx ? w : 1.1, x + dirx * o, 0, z + dirz * o, C.marble); } };
  steps(0, pd.z0 - 8, 22, 0, -1);           // درج المدخل الشمالي
  steps(0, pd.z1 + 8, 16, 0, 1);            // الجنوبي
  steps(pd.x1, 0, 40, 1, 0);                // الشرقي (للحديقة)

  // --- الرواقان الشمالي والجنوبي (237م) ---
  for (const [zo, zi, dir] of [[pd.z0, pd.z0 + 8, 1], [pd.z1, pd.z1 - 8, -1]]) {
    const zc = (zo + zi) / 2, H = 7.6;
    b.box(242, H, 1.2, 0, P, zo + dir * 0.6, C.sand);                         // الجدار الخارجي
    archWindows(b, -118, 118, zo, P + 0.8, { step: 6.5, aw: 1.8, spring: 2.6, apex: 4, out: -dir });
    b.box(242, 0.9, 8.4, 0, P + H, zc, C.ivory);                               // السقف
    merlons(b, -121, 121, zo, zi, P + H + 0.9, 2.4, 0.8);
    arcadeRow(b, -116, 116, zi - dir * 0.35, P, { h: H, dir: -dir, depth: 6.4 }); // الأقواس جهة الصحن
    for (let x = -96; x <= 96; x += 24) if (Math.abs(x) > 6) smallDome(b, 2.2, x, P + H + 0.9, zc);  // قباب صغيرة فوق الرواق
    // البوابات (إيوانات أعلى من الرواق)
    for (const gx of dir > 0 ? [-16, 16] : [0]) {
      b.box(12, 11.5, 10, gx, P, zc, C.sand);
      const g = archShape(7, 6.5, 9.8, 0.4); b.add(g, C.deep, { x: gx, y: P, z: zo - dir * 0.05 }); b.add(archShape(7, 6.5, 9.8, 0.4), C.deep, { x: gx, y: P, z: zi + dir * 0.05 });
      merlons(b, gx - 6, gx + 6, zc - 5, zc + 5, P + 11.5, 1.6, 0.8);
      smallDome(b, 3, gx, P + 11.5, zc, C.dome);
    }
  }
  // طرفا الرواقين (أبراج زوايا تحت المآذن الصغيرة تتولاها المئذنة نفسها)

  // --- المصلى الرئيسي ---
  const h0 = M.hall, hw = h0.x1 - h0.x0, hd = h0.z1 - h0.z0, hx = (h0.x0 + h0.x1) / 2, hz = (h0.z0 + h0.z1) / 2;
  b.box(hw, 16.7 - P, hd, hx, P, hz, C.sand);                                   // الكتلة حتى الشرفة الأولى (16.7م)
  merlons(b, h0.x0, h0.x1, h0.z0, h0.z1, 16.7, 2.4, 1.1);
  archWindows(b, h0.x0 + 2, h0.x1 - 2, h0.z0, P + 1, { step: 6, aw: 3, spring: 6, apex: 9.5, out: -1 });
  archWindows(b, h0.x0 + 2, h0.x1 - 2, h0.z1, P + 1, { step: 6, aw: 3, spring: 6, apex: 9.5, out: 1 });
  archWindows(b, h0.z0 + 2, h0.z1 - 2, h0.x0, P + 1, { step: 6, aw: 3, spring: 6, apex: 9.5, alongZ: true, out: -1 });
  // الواجهة الشرقية (المدخل): رواق أقواس عميق + بوابة كبيرة
  arcadeRow(b, h0.z0 + 3, h0.z1 - 3, h0.x1 + 4, P, { alongZ: true, h: 10, bay: 6, aw: 4.4, spring: 5.4, apex: 8.6, dir: -1, depth: 4 });
  b.box(4.6, 0.8, hd - 6, h0.x1 + 2.3, P + 10, hz, C.ivory);
  b.box(3, 15.5, 16, h0.x1 + 1.5, P, hz, C.sand);
  b.add(archShape(10, 8.5, 13.5, 0.4), C.deep, { x: h0.x1 + 3.05, y: P, z: hz, ry: Math.PI / 2 });
  b.add(archShape(3.6, 4, 6, 0.3), C.wood, { x: h0.x1 + 3.15, y: P, z: hz, ry: Math.PI / 2 });          // الباب الخشبي
  // الطابق الثاني الأوسط حتى 19.3م
  b.box(52, 19.3 - 16.7 + 0.2, 52, M.dome.x, 16.5, M.dome.z, C.ivory);
  merlons(b, M.dome.x - 26, M.dome.x + 26, M.dome.z - 26, M.dome.z + 26, 19.5, 2.2, 1);
  // الرقبة المثمنة (19.3 → 23م) والأسطوانة بنوافذ (23 → 30م)
  b.cyl(19, 19.8, 3.7, M.dome.x, 19.3, M.dome.z, C.sand, 8);
  b.cyl(16.2, 16.6, 6.85, M.dome.x, 23, M.dome.z, C.ivory, 24);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; b.add(archShape(1.9, 2.8, 4.4, 0.3), C.glass, { x: M.dome.x + Math.cos(a) * 16.55, y: 24.2, z: M.dome.z + Math.sin(a) * 16.55, ry: -a + Math.PI / 2 }); }
  b.cyl(16.9, 16.9, 0.6, M.dome.x, 29.85, M.dome.z, C.gold, 24);
  // القبة: من 30.45م إلى 42.85م، والنهاية العلوية (عمود وكرات وهلال) لين 50م
  const R = 16.2, DH = 42.85 - 30.45, dpts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14, a = t * Math.PI / 2; dpts.push(new THREE.Vector2(R * Math.cos(a) * (1 - 0.06 * Math.sin(a * 2)), DH * Math.pow(Math.sin(a), 0.92))); }
  const domeGeo = new THREE.LatheGeometry(dpts, 40);
  const tex = domeTexture(); tex.repeat.set(4, 1);
  const domeMesh = new THREE.Mesh(domeGeo, new THREE.MeshLambertMaterial({ map: tex }));
  domeMesh.position.set(M.dome.x, 30.45, M.dome.z); domeMesh.castShadow = true; domeMesh.receiveShadow = true;
  group.add(domeMesh);
  b.cyl(0.9, 1.4, 1.6, M.dome.x, 42.6, M.dome.z, C.gold, 10);
  b.ball(0.95, M.dome.x, 45.0, M.dome.z, C.gold); b.ball(0.7, M.dome.x, 46.6, M.dome.z, C.gold);
  b.cyl(0.18, 0.25, 2.6, M.dome.x, 44, M.dome.z, C.gold, 6);
  b.slab(0.2, 2.2, 1.6, M.dome.x, 48.8, M.dome.z, C.gold);
  // قباب صغيرة في أركان سطح المصلى
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) smallDome(b, 3.2, hx + sx * (hw / 2 - 5), 16.7 + 1.1, hz + sz * (hd / 2 - 5), C.ivory);

  // --- مبنى الصحن الداخلي ومصلى النساء (شرق المصلى) ---
  const ib = M.inner, iw = ib.x1 - ib.x0, idp = ib.z1 - ib.z0, ix = (ib.x0 + ib.x1) / 2, iz = (ib.z0 + ib.z1) / 2;
  const ring = 9;
  b.box(iw, 10, ring, ix, P, ib.z0 + ring / 2, C.sand); b.box(iw, 10, ring, ix, P, ib.z1 - ring / 2, C.sand);
  b.box(ring, 10, idp - 2 * ring, ib.x0 + ring / 2, P, iz, C.sand); b.box(ring, 10, idp - 2 * ring, ib.x1 - ring / 2, P, iz, C.sand);
  merlons(b, ib.x0, ib.x1, ib.z0, ib.z1, P + 10, 2.2, 0.9);
  arcadeRow(b, ib.x0 + ring, ib.x1 - ring, ib.z0 + ring + 0.35, P, { h: 8, dir: -1, depth: 3 });
  arcadeRow(b, ib.x0 + ring, ib.x1 - ring, ib.z1 - ring - 0.35, P, { h: 8, dir: 1, depth: 3 });
  arcadeRow(b, ib.z0 + ring, ib.z1 - ring, ib.x0 + ring + 0.35, P, { h: 8, alongZ: true, dir: -1, depth: 3 });
  arcadeRow(b, ib.z0 + ring, ib.z1 - ring, ib.x1 - ring - 0.35, P, { h: 8, alongZ: true, dir: 1, depth: 3 });
  archWindows(b, ib.x0 + 1, ib.x1 - 1, ib.z0, P + 1, { step: 5.5, aw: 2.2, spring: 3.5, apex: 5.4, out: -1 });
  archWindows(b, ib.x0 + 1, ib.x1 - 1, ib.z1, P + 1, { step: 5.5, aw: 2.2, spring: 3.5, apex: 5.4, out: 1 });
  archWindows(b, ib.z0 + 1, ib.z1 - 1, ib.x1, P + 1, { step: 5.5, aw: 2.2, spring: 3.5, apex: 5.4, alongZ: true, out: 1 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { b.box(8, 13, 8, ix + sx * (iw / 2 - 4), P, iz + sz * (idp / 2 - 4), C.ivory); smallDome(b, 3, ix + sx * (iw / 2 - 4), P + 13, iz + sz * (idp / 2 - 4), C.dome); }
  // الممر المسقوف بين المصلى والصحن الداخلي (صحن المدخل)
  for (const sz of [-1, 1]) b.box(ib.x0 - h0.x1 - 4, 7, 5, (ib.x0 + h0.x1 + 4) / 2, P, sz * 22, C.ivory);

  // --- مبانٍ ملحقة جنوب الرواق الجنوبي (المكتبة والإدارة) ---
  for (const [x, w] of [[-60, 70], [60, 70]]) { b.box(w, 8, 16, x, 0, pd.z1 + 10, C.sand); merlons(b, x - w / 2, x + w / 2, pd.z1 + 2, pd.z1 + 18, 8, 2.4, 0.8); archWindows(b, x - w / 2 + 2, x + w / 2 - 2, pd.z1 + 18, 1, { step: 5, aw: 1.8, spring: 2.6, apex: 4, out: 1 }); smallDome(b, 3.4, x, 8, pd.z1 + 10, C.dome); }

  // --- المآذن الخمس ---
  minaret(b, M.mainMinaret.x, M.mainMinaret.z, true);
  for (const [x, z] of M.minarets) minaret(b, x, z, false);

  // --- الأرضية الرخامية للصحن الخارجي (نقش هندسي) ---
  const mt = marbleTexture(); mt.repeat.set(62, 40);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(pd.x1 - pd.x0 - 2, pd.z1 - pd.z0 - 2).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: mt }));
  floor.position.y = P + 0.02; floor.receiveShadow = true; group.add(floor);
  // الصحن الداخلي المكشوف (أرضية رخام أفتح)
  land.box(iw - 2 * ring, 0.05, idp - 2 * ring, ix, P + 0.03, iz, 0xfbf8f2);

  // --- التشجير: نخيل على الممر الشمالي والحدائق، أشجار حول المواقف وغربًا ---
  const veg = new Builder();
  const palm = (x, z, h = 7) => {
    for (let i = 0; i < 6; i++) veg.cyl(0.24 - i * 0.015, 0.28 - i * 0.015, h / 6, x, (i * h) / 6, z, i % 2 ? 0x8a6a42 : C.trunk, 6);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; veg.slab(0.42, 0.07, 2.8, x + Math.sin(a) * 1.25, h + 0.1, z + Math.cos(a) * 1.25, i % 2 ? C.leaf : C.leaf2, { rx: -0.45, ry: a }); }
  };
  const tree = (x, z, s = 1) => { veg.cyl(0.25 * s, 0.32 * s, 1.8 * s, x, 0, z, C.trunk, 6); veg.ball(1.9 * s, x, 2.9 * s, z, (Math.abs(x * 7 + z * 3) % 2) < 1 ? C.leaf : C.leaf2); };
  for (let z = -146; z <= -88; z += 7) for (const s of [-1, 1]) palm(s * 11, z, 8);              // ممر النخيل الشمالي
  for (let x = 128; x <= 196; x += 12) for (const z of [-82, 82]) palm(x, z, 7);                // حواف الحديقة
  for (let gx = 0; gx < 3; gx++) for (let gz = 0; gz < 5; gz++) palm(138 + gx * 24, -62 + gz * 30, 6.5);
  for (let x = -146; x <= 146; x += 9) for (const z of [114, 140, 166]) tree(x, z, 0.85);       // صفوف أشجار المواقف
  for (let x = -208; x <= -134; x += 9) for (let z = -140; z <= 160; z += 9) tree(x + ((z / 9) % 2) * 4, z, 0.9); // بستان غربي
  for (const s of [-1, 1]) for (let x = 24; x <= 60; x += 8) for (let z = -144; z <= -86; z += 8) tree(s * x, z, 0.8); // بساتين شمالية

  // --- الدمج ---
  const body = new THREE.Mesh(b.build(), mat); body.castShadow = true; body.receiveShadow = true;
  const ground = new THREE.Mesh(land.build(), mat); ground.receiveShadow = true;
  const plants = new THREE.Mesh(veg.build(), mat); plants.castShadow = true;
  group.add(body, ground, plants);
  group.traverse((o) => { if (o.isMesh) o.userData.civic = 'mosque'; });
  return group;
}

// نقاط الكاميرا (إحداثيات محلية؛ app.js يحوّلها لموقع المجمع): الهدف t، والاتجاه az، والارتفاع el، والمسافة d
export const MOSQUE_VIEWS = {
  // az: اتجاه الكاميرا من الهدف (0 = من الجنوب، π = من الشمال، π/2 = من الشرق)
  all: { t: [0, 10, 5], az: 2.6, el: 0.95, d: 560 },           // المجمع كامل من فوق
  gate: { t: [0, 47, -76], az: Math.PI - 0.24, el: 0.05, d: 205 }, // من الممر الشمالي: البوابة والأقواس والمئذنة الكبيرة كاملة
  oblique: { t: [-20, 16, 0], az: 2.15, el: 0.4, d: 300 },      // مائلة من الشمال الشرقي: القبة والمآذن والأفنية
};
export const MOSQUE_INFO = { name: 'الجامع الأكبر' };
