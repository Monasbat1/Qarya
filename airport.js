// مطار مسقط الدولي (Low Poly) على الطرف الغربي لقارتنا.
// المرجع: صور القمر الصناعي للمطار ومخطط المطار (مدرجين متوازيين 08/26، مبنى المسافرين بينهم،
// ثلاث أرصفة: شمالي وجنوبي وغربي على شكل Y، والمواقف جهة الشرق).
// المقياس موحد: 1 وحدة = 4 م. الاختصار الوحيد: طول المدرجين 2.8 كم بدل 4 كم، والمسافات الطرفية للحقل.
// المحاور المحلية: x شرق، z جنوب، الأصل = وسط مبنى المسافرين. المجموعة تتلف بزاوية المدرجين (CIVIC.airport.rot).
import * as THREE from 'three';
import { Builder } from './houses.js';

export const AIRPORT_INFO = { name: 'مطار قارتنا الدولي' };

const K = {
  sea: 0x7fd3e8, beach: 0xf2e0b0, grass: 0x93d16c, field: 0xd9c99b, fieldD: 0xcdb987,
  asph: 0x4b4f56, taxi: 0x5d6168, shoulder: 0xa29f95, apron: 0xd8d5ce, paving: 0xe2ddd2, lot: 0x676b72,
  white: 0xf6f4ee, yellow: 0xf2c230, red: 0xc8432f,
  roof: 0xf3f0e8, roofD: 0xdcd6c8, glass: 0x86b9cf, glassD: 0x557f97, steel: 0xc3c8cd, steelD: 0x8e959b,
  conc: 0xcfcac0, dark: 0x2b2f33, tyre: 0x222427, fence: 0x6f757b,
  trunk: 0x8a6a42, trunkD: 0x7a5a36, leaf: 0x3f8f45, leafL: 0x57a84e,
};

// ---------- المخطط ----------
export const RUNWAYS = [
  { z: -235, x0: -660, x1: 40, w: 15, ids: ['08R', '26L'] }, // المدرج الشمالي (الجديد)
  { z: 225, x0: -560, x1: 140, w: 15, ids: ['08L', '26R'] },  // المدرج الجنوبي
];
const TAXI = [
  { z: -200, x0: -660, x1: 40, rz: -235, links: [-660, -500, -330, -170, 40] },
  { z: 190, x0: -560, x1: 140, rz: 225, links: [-560, -400, -230, -60, 140] },
];
const APRON = { x0: -340, x1: 32, z0: -152, z1: 152 };
const LANE = 128;                       // ممرات الساحة الموازية (±z)
const APRON_LINKS = [-315, -150, 12];   // وصلات الساحة بالممرين الموازيين
export const LAND = { x0: -735, x1: 300, z0: -320, z1: 315, r: 90 };
const FIELD = { x0: -705, x1: 50, z0: -292, z1: 287 };
const FIELD_EXT = { x0: 50, x1: 165, z0: 150, z1: 287 }; // الحقل يمتد شرقًا مع المدرج الجنوبي (أطول من الشمالي جهة الشرق مثل الحقيقي)
const CORE = { x0: -22, x1: 40, z0: -34, z1: 34 };
const STEM = { x0: -75, x1: -22, z0: -28, z1: 28 };
// أرصفة الطائرات (خط المنتصف + العرض)
const PIERS = [
  [-26, -34, -26, -110, 12], [-26, 34, -26, 110, 12],       // الرصيف الشمالي والجنوبي
  [-75, -22, -196, -22, 12], [-75, 22, -196, 22, 12],       // ذراعا الرصيف الغربي
  [-190, -22, -245, -77, 12], [-190, 22, -245, 77, 12],     // طرفا الـ Y المائلان
];
const TOWER = { x: 42, z: 118 };

// ---------- الطائرات (3 أنواع، ألوان مستوحاة من الطيران العُماني وسلام إير) ----------
export const TYPES = {
  wb: { L: 16, span: 15, r: 0.72, sweep: 0.52, tailH: 2.5, eng: 0.36, body: 0xf8f8f5, tail: 0x0d5b5b, acc: 0xc9a24a, engC: 0x0d5b5b, wing: 0xe1e5e8 },
  mb: { L: 15.5, span: 15, r: 0.7, sweep: 0.58, tailH: 2.4, eng: 0.38, body: 0xf8f8f5, tail: 0x16706f, acc: 0x16706f, engC: 0xeeeeea, wing: 0xe1e5e8 },
  nb: { L: 10, span: 9, r: 0.5, sweep: 0.45, tailH: 1.6, eng: 0.27, body: 0xffffff, tail: 0x22b3a3, acc: 0x9bcb3c, engC: 0x22b3a3, wing: 0xe6e9eb },
};
const ycOf = (T) => T.r * 1.35 + 0.45; // ارتفاع محور جسم الطائرة عن الأرض

function planeGeo(T, lo) {
  const b = new Builder(), { L, span, r } = T, yc = ycOf(T), hs = span / 2, sw = T.sweep;
  const wy = yc - r * 0.55, xr = -L * 0.02, Ls = hs / Math.cos(sw);
  if (lo) { // مستوى تفصيل منخفض للمسافات البعيدة
    b.box(L * 0.92, r * 2, r * 2, 0, yc - r, 0, T.body);
    b.box(L * 0.17, 0.16, span, xr - L * 0.06, wy, 0, T.wing);
    b.box(L * 0.13, T.tailH, 0.18, -L * 0.42, yc + r * 0.4, 0, T.tail);
    b.box(L * 0.1, 0.12, span * 0.34, -L * 0.42, yc + r * 0.2, 0, T.body);
    return b.build();
  }
  const Ln = L * 0.12, Lt = L * 0.2, Lb = L - Ln - Lt, xb = (Lt - Ln) / 2;
  b.add(new THREE.CylinderGeometry(r, r, Lb, 10), T.body, { rz: Math.PI / 2, x: xb, y: yc });
  b.add(new THREE.CylinderGeometry(r * 0.22, r, Ln, 10), T.body, { rz: -Math.PI / 2, x: L / 2 - Ln / 2, y: yc - r * 0.08 });
  b.add(new THREE.CylinderGeometry(r * 0.28, r, Lt, 10), T.body, { rz: Math.PI / 2, x: -L / 2 + Lt / 2, y: yc + r * 0.12 });
  b.box(Lb * 0.9, r * 0.13, r * 2 + 0.05, xb + 0.2, yc + r * 0.2, 0, 0x2c3a46);          // صف الشبابيك
  b.box(Lb, r * 0.12, r * 2 + 0.04, xb, yc - r * 0.22, 0, T.acc);                       // خط اللون
  b.box(Ln * 0.4, r * 0.22, r * 1.3, L / 2 - Ln * 0.72, yc + r * 0.3, 0, 0x22303a);      // زجاج القمرة
  for (const s of [1, -1]) {
    const seg = (f0, f1, ch) => { const fm = (f0 + f1) / 2; b.add(new THREE.BoxGeometry(ch, 0.13, (f1 - f0) * Ls), T.wing, { ry: -s * sw, x: xr - Math.sin(sw) * fm * Ls, y: wy + fm * 0.35, z: s * (r * 0.6 + Math.cos(sw) * fm * Ls) }); };
    seg(0, 0.5, L * 0.17); seg(0.5, 1, L * 0.095);
    const tx = xr - Math.sin(sw) * Ls * 0.98, tz = s * (r * 0.6 + Math.cos(sw) * Ls * 0.98);
    b.box(L * 0.05, 0.55, 0.08, tx - 0.15, wy + 0.4, tz, T.tail, -s * sw);              // طرف الجناح
    const fe = 0.34, ex = xr - Math.sin(sw) * fe * Ls + L * 0.05, ez = s * (r * 0.6 + Math.cos(sw) * fe * Ls), ey = wy - T.eng * 0.95;
    b.add(new THREE.CylinderGeometry(T.eng, T.eng * 0.82, L * 0.14, 10), T.engC, { rz: Math.PI / 2, x: ex, y: ey, z: ez });
    b.add(new THREE.CylinderGeometry(T.eng * 0.78, T.eng * 0.78, 0.04, 10), 0x24292e, { rz: Math.PI / 2, x: ex + L * 0.07 + 0.02, y: ey, z: ez });
    b.box(L * 0.08, T.eng * 0.7, 0.1, ex - L * 0.02, ey + T.eng * 0.5, ez, T.wing);
    // الذيل الأفقي
    const hl = span * 0.17, hsw = 0.6;
    b.add(new THREE.BoxGeometry(L * 0.085, 0.1, hl / Math.cos(hsw)), T.body, { ry: -s * hsw, x: -L / 2 + Lt * 0.35 - Math.sin(hsw) * hl / 2, y: yc + r * 0.3, z: s * (r * 0.3 + hl / 2) });
    // العجلات الرئيسية
    b.box(0.18, yc - r + 0.05, 0.18, -L * 0.03, 0, s * r * 0.85, K.dark);
    b.box(0.55, 0.36, 0.34, -L * 0.03, 0, s * r * 0.85, K.tyre);
  }
  // الذيل العمودي بلون الشركة + شريط
  const fx = -L / 2 + Lt * 0.5, fy = yc + r * 0.55 + T.tailH / 2;
  b.add(new THREE.BoxGeometry(L * 0.15, T.tailH, 0.15), T.tail, { rz: 0.55, x: fx, y: fy });
  b.add(new THREE.BoxGeometry(L * 0.1, T.tailH * 0.22, 0.17), T.acc === T.tail ? 0xc9a24a : T.acc, { rz: 0.55, x: fx - Math.sin(0.55) * T.tailH * 0.22, y: fy + Math.cos(0.55) * T.tailH * 0.22 });
  b.box(0.12, yc - r + 0.05, 0.12, L * 0.36, 0, 0, K.dark);                                 // عجلة المقدمة
  b.box(0.36, 0.28, 0.24, L * 0.36, 0, 0, K.tyre);
  return b.build();
}

// ---------- مواقف الطائرات ----------
// ry: اتجاه المقدمة (دوران three.js حول y: المقدمة = (cos ry, -sin ry)). face = واجهة الرصيف للجسر
function standList() {
  const S = [], T = TYPES, d = Math.SQRT1_2;
  const add = (type, x, z, ry, face) => S.push({ type, x, z, ry, face });
  const half = (t) => (t ? T[t].L / 2 : 8);
  [['wb', -52], ['mb', -74], ['nb', -96]].forEach(([t, z]) => add(t, -34 - half(t), z, 0, { x: -32, z, nx: -1, nz: 0 }));
  [['nb', -60], ['mb', -90]].forEach(([t, z]) => add(t, -18 + half(t), z, Math.PI, { x: -20, z, nx: 1, nz: 0 }));
  [['mb', 52], ['wb', 74], ['nb', 96]].forEach(([t, z]) => add(t, -34 - half(t), z, 0, { x: -32, z, nx: -1, nz: 0 }));
  [['wb', 60], ['nb', 90]].forEach(([t, z]) => add(t, -18 + half(t), z, Math.PI, { x: -20, z, nx: 1, nz: 0 }));
  [['nb', -95], ['wb', -120], [null, -145], ['mb', -170]].forEach(([t, x]) => add(t, x, -30 - half(t), -Math.PI / 2, { x, z: -28, nx: 0, nz: -1 }));
  [['wb', -95], ['nb', -120], ['mb', -145], [null, -170]].forEach(([t, x]) => add(t, x, 30 + half(t), Math.PI / 2, { x, z: 28, nx: 0, nz: 1 }));
  { const mx = -217.5, mz = -49.5, o = 8 + half('nb'); add('nb', mx + d * o, mz - d * o, -3 * Math.PI / 4, { x: mx + d * 6, z: mz - d * 6, nx: d, nz: -d }); }
  { const mx = -217.5, mz = 49.5, o = 8 + half(null); add(null, mx + d * o, mz + d * o, 3 * Math.PI / 4, { x: mx + d * 6, z: mz + d * 6, nx: d, nz: d }); }
  add('mb', -302, 0, 0, null); // موقف بعيد (الباص يوصل له)
  return S;
}
// الطائرتين المتحركتين: بيتهم موقفين بعيدين
const MOVERS = [
  { type: 'wb', home: [-300, -100], ry: Math.PI / 2, rw: 0, path: [[-300, -100], [-300, -LANE], [-315, -LANE], [-315, TAXI[0].z], [TAXI[0].x0, TAXI[0].z], [RUNWAYS[0].x0, RUNWAYS[0].z], [RUNWAYS[0].x0 + 15, RUNWAYS[0].z]] },
  { type: 'nb', home: [-300, 100], ry: -Math.PI / 2, rw: 1, path: [[-300, 100], [-300, LANE], [-315, LANE], [-315, TAXI[1].z], [TAXI[1].x0, TAXI[1].z], [RUNWAYS[1].x0, RUNWAYS[1].z], [RUNWAYS[1].x0 + 15, RUNWAYS[1].z]] },
];

// ---------- أدوات ----------
const P2 = (x, z) => new THREE.Vector2(x, -z); // نقاط الأشكال المسطحة (تتلف -90° حول x)
function roundRect(x0, x1, z0, z1, r) {
  const sh = new THREE.Shape(), pts = [], n = 8;
  const corner = (cx, cz, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); pts.push(P2(cx + Math.cos(a) * r, cz + Math.sin(a) * r)); } };
  corner(x1 - r, z1 - r, 0); corner(x0 + r, z1 - r, Math.PI / 2); corner(x0 + r, z0 + r, Math.PI); corner(x1 - r, z0 + r, Math.PI * 1.5);
  sh.setFromPoints(pts);
  return new THREE.ShapeGeometry(sh, 1);
}
const flat = (b, geo, y, color) => b.add(geo, color, { rx: -Math.PI / 2, y });
// صندوق على طول قطعة مستقيمة
function seg(b, x1, z1, x2, z2, w, y, h, color) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  b.box(len, h, w, (x1 + x2) / 2, y, (z1 + z2) / 2, color, Math.atan2(-(z2 - z1), x2 - x1));
}
// مسار بزوايا مدورة + طول تراكمي
function makePath(pts, rad = 8, closed = false) {
  const P = pts.map(([x, z]) => new THREE.Vector2(x, z));
  if (closed) P.push(P[0].clone(), P[1].clone());
  const out = [P[0].clone()];
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], c = P[i], n = P[i + 1];
    const din = c.clone().sub(a), dout = n.clone().sub(c), r = Math.min(rad, din.length() / 2, dout.length() / 2);
    din.normalize(); dout.normalize();
    const p0 = c.clone().addScaledVector(din, -r), p1 = c.clone().addScaledVector(dout, r);
    for (let k = 0; k <= 6; k++) { const t = k / 6; out.push(new THREE.Vector2((1 - t) ** 2 * p0.x + 2 * t * (1 - t) * c.x + t * t * p1.x, (1 - t) ** 2 * p0.y + 2 * t * (1 - t) * c.y + t * t * p1.y)); }
  }
  if (!closed) out.push(P.at(-1).clone());
  const s = [0];
  for (let i = 1; i < out.length; i++) s.push(s[i - 1] + out[i].distanceTo(out[i - 1]));
  const len = s.at(-1);
  return {
    len,
    at(d) {
      d = closed ? ((d % len) + len) % len : Math.max(0, Math.min(len, d));
      let i = 1; while (i < out.length - 1 && s[i] < d) i++;
      const a = out[i - 1], c = out[i], t = (d - s[i - 1]) / (s[i] - s[i - 1] || 1);
      return { x: a.x + (c.x - a.x) * t, z: a.y + (c.y - a.y) * t, yaw: Math.atan2(-(c.y - a.y), c.x - a.x) };
    },
  };
}

// ---------- كتابة أرقام المدرج (خطوط) ----------
const GLYPH = {
  0: [[0, 0, 2, 0], [2, 0, 2, 4], [2, 4, 0, 4], [0, 4, 0, 0]],
  2: [[0, 4, 2, 4], [2, 4, 2, 2], [2, 2, 0, 2], [0, 2, 0, 0], [0, 0, 2, 0]],
  6: [[2, 4, 0, 4], [0, 4, 0, 0], [0, 0, 2, 0], [2, 0, 2, 2], [2, 2, 0, 2]],
  8: [[0, 0, 2, 0], [2, 0, 2, 4], [2, 4, 0, 4], [0, 4, 0, 0], [0, 2, 2, 2]],
  L: [[0, 4, 0, 0], [0, 0, 2, 0]],
  R: [[0, 0, 0, 4], [0, 4, 2, 4], [2, 4, 2, 2], [2, 2, 0, 2], [0.7, 2, 2, 0]],
};
// dir=+1: تنقرا من الغرب (فوق = شرق، يمين = جنوب)؛ dir=-1 من الشرق
function writeRow(b, text, x, z, dir, sc, y) {
  const w = text.length * 2 * sc + (text.length - 1) * sc;
  let cx0 = -w / 2;
  for (const ch of text) {
    for (const [a, c, e, f] of GLYPH[ch] || []) {
      const X = (cx, cy) => [x + dir * cy * sc, z + dir * (cx0 + cx * sc)];
      const [x1, z1] = X(a, c), [x2, z2] = X(e, f);
      seg(b, x1, z1, x2, z2, 0.5, y, 0.02, K.white);
    }
    cx0 += 3 * sc;
  }
}

// ---------- مركبات (المقدمة +x) ----------
function vehGeo(kind) {
  const b = new Builder();
  const wheels = (xs, zw, rr = 0.13) => { for (const x of xs) for (const z of [-zw, zw]) b.add(new THREE.CylinderGeometry(rr, rr, 0.08, 8), K.tyre, { rx: Math.PI / 2, x, y: rr, z }); };
  if (kind === 'bus') { // باص الساحة
    b.box(3.5, 0.7, 0.8, 0, 0.12, 0, 0xf4f4f0); b.box(3.3, 0.25, 0.82, 0, 0.5, 0, 0x2c3a46); b.box(3.5, 0.08, 0.82, 0, 0.82, 0, 0x16706f);
    wheels([1.2, -1.2], 0.38, 0.15);
  } else if (kind === 'tug') { // ساحبة عربات الأمتعة + 3 عربات
    b.box(0.85, 0.35, 0.5, 0, 0.1, 0, K.yellow); b.box(0.35, 0.35, 0.45, -0.15, 0.45, 0, 0x2c3a46);
    wheels([0.28, -0.28], 0.24, 0.11);
    for (let i = 1; i <= 3; i++) {
      const x = -i * 1.05;
      b.box(0.08, 0.04, 0.04, x + 0.47, 0.18, 0, K.dark);
      b.box(0.8, 0.08, 0.5, x, 0.16, 0, K.steelD); b.box(0.7, 0.24, 0.42, x, 0.24, 0, [0x3c5a7a, 0x7a3c3c, 0x3c6b4a][i - 1]);
      wheels([x + 0.25, x - 0.25], 0.22, 0.09);
    }
  } else if (kind === 'fuel') { // صهريج وقود
    b.box(0.7, 0.55, 0.62, 0.95, 0.15, 0, 0xf4f4f0); b.box(0.1, 0.25, 0.55, 1.31, 0.42, 0, 0x2c3a46);
    b.add(new THREE.CylinderGeometry(0.33, 0.33, 1.75, 10), 0xd9dcde, { rz: Math.PI / 2, x: -0.35, y: 0.55 });
    b.box(1.8, 0.12, 0.66, -0.35, 0.12, 0, K.red);
    wheels([0.95, -0.2, -0.9], 0.3, 0.14);
  } else if (kind === 'push') { // ساحبة طائرات
    b.box(1.6, 0.42, 0.78, 0, 0.12, 0, K.yellow); b.box(0.4, 0.3, 0.5, -0.5, 0.54, 0, 0x2c3a46);
    wheels([0.5, -0.5], 0.4, 0.16);
  } else if (kind === 'belt') { // حزام تحميل الشنط
    b.box(1.2, 0.3, 0.5, 0, 0.12, 0, 0xf4f4f0);
    b.add(new THREE.BoxGeometry(1.8, 0.08, 0.32), 0x2b2f33, { rz: 0.42, x: 0.35, y: 0.75 });
    wheels([0.4, -0.4], 0.24, 0.11);
  } else if (kind === 'car') {
    b.box(1.1, 0.32, 0.5, 0, 0.06, 0, 0xffffff); b.box(0.6, 0.22, 0.46, -0.05, 0.38, 0, 0x2c3a46);
  }
  return b.build();
}

// ---------- لوحة الاسم (نص عربي على Canvas) ----------
function signTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
  const g = c.getContext('2d');
  const draw = () => {
    g.fillStyle = '#0f4f4f'; g.fillRect(0, 0, 1024, 256);
    g.fillStyle = '#c9a24a'; g.fillRect(0, 214, 1024, 12);
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.direction = 'rtl';
    g.font = '900 104px Tajawal, Tahoma, sans-serif'; g.fillText('مطار قارتنا الدولي', 512, 120);
    g.font = '700 40px "Segoe UI", Roboto, sans-serif'; g.direction = 'ltr'; g.fillText('QARATNA INTERNATIONAL AIRPORT', 512, 190);
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  draw();
  if (document.fonts) document.fonts.load('900 104px Tajawal').then(draw).catch(() => {});
  return tex;
}

// نسخ هندسة ملوّنة جاهزة (مركبة) داخل Builder بموقع ودوران، مع الحفاظ على ألوانها
function stamp(b, geo, x, z, ry, y = 0) {
  const p = geo.attributes.position.array, col = geo.attributes.color.array, c = Math.cos(ry), s = Math.sin(ry);
  for (let i = 0; i < p.length; i += 3) { b.pos.push(x + p[i] * c + p[i + 2] * s, p[i + 1] + y, z - p[i] * s + p[i + 2] * c); b.col.push(col[i], col[i + 1], col[i + 2]); }
}

function palm(b, x, z, h = 4.2) {
  b.cyl(0.18, 0.24, h, x, 0, z, K.trunk, 6);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.34, 0.06, 2, x + Math.sin(a) * 0.9, h - 0.15, z + Math.cos(a) * 0.9, i % 2 ? K.leaf : K.leafL, { rx: -0.45, ry: a }); }
}

// ---------- البناء ----------
export function buildAirport(A, mat) {
  const root = new THREE.Group();
  root.position.set(A.x, 0, A.z); root.rotation.y = A.rot;
  const ground = new Builder(), bld = new Builder(), glassB = new Builder(), lightsB = new Builder(), detailB = new Builder();

  // اليابسة (شبه جزيرة) + الشاطئ + المياه الضحلة
  const landB = new Builder();
  flat(landB, roundRect(LAND.x0 - 45, LAND.x1 + 45, LAND.z0 - 45, LAND.z1 + 45, LAND.r + 45), -1.2, K.sea);
  flat(landB, roundRect(LAND.x0 - 16, LAND.x1 + 16, LAND.z0 - 16, LAND.z1 + 16, LAND.r + 16), -0.5, K.beach);
  flat(landB, roundRect(LAND.x0, LAND.x1, LAND.z0, LAND.z1, LAND.r), 0, K.grass);
  // أرض الحقل (رملية مثل مسقط)
  ground.box(FIELD.x1 - FIELD.x0, 0.02, FIELD.z1 - FIELD.z0, (FIELD.x0 + FIELD.x1) / 2, 0.01, (FIELD.z0 + FIELD.z1) / 2, K.field);
  ground.box(FIELD_EXT.x1 - FIELD_EXT.x0 + 0.5, 0.02, FIELD_EXT.z1 - FIELD_EXT.z0, (FIELD_EXT.x0 + FIELD_EXT.x1) / 2 - 0.25, 0.01, (FIELD_EXT.z0 + FIELD_EXT.z1) / 2, K.field);
  // الساحة (خرسانة فاتحة)
  ground.box(APRON.x1 - APRON.x0, 0.02, APRON.z1 - APRON.z0, (APRON.x0 + APRON.x1) / 2, 0.09, 0, K.apron);
  // الممرات (أسفلت) + خطوطها الصفراء
  const tline = (x1, z1, x2, z2) => seg(ground, x1, z1, x2, z2, 0.35, 0.14, 0.02, K.yellow);
  for (const t of TAXI) {
    seg(ground, t.x0 - 4, t.z, t.x1 + 4, t.z, 8, 0.06, 0.02, K.taxi); tline(t.x0, t.z, t.x1, t.z);
    for (const x of t.links) {
      seg(ground, x, t.z, x, t.rz, 8, 0.06, 0.02, K.taxi); tline(x, t.z, x, t.rz);
      const hz = t.rz + Math.sign(t.z - t.rz) * 14; // خط الانتظار قبل المدرج
      for (const o of [-0.5, 0.5]) seg(ground, x - 3.6, hz + o, x + 3.6, hz + o, 0.25, 0.14, 0.02, K.yellow);
    }
  }
  for (const x of APRON_LINKS) for (const sg of [-1, 1]) {
    const t = TAXI[sg < 0 ? 0 : 1];
    seg(ground, x, sg * APRON.z1, x, t.z, 8, 0.06, 0.02, K.taxi); tline(x, sg * (APRON.z1 - 24), x, t.z);
  }
  for (const sg of [-1, 1]) tline(APRON.x0 + 5, sg * LANE, APRON.x1 - 4, sg * LANE);
  tline(-322, -LANE, -322, LANE);
  // المدرجان: كتف + أسفلت + علامات بيضاء
  for (const r of RUNWAYS) {
    const L = r.x1 - r.x0, cx = (r.x0 + r.x1) / 2;
    ground.box(L + 8, 0.02, r.w + 6, cx, 0.05, r.z, K.shoulder);
    ground.box(L, 0.02, r.w, cx, 0.11, r.z, K.asph);
    const W = (x1, z1, x2, z2, w) => seg(ground, x1, z1, x2, z2, w, 0.13, 0.02, K.white);
    for (const s of [-1, 1]) W(r.x0, r.z + s * (r.w / 2 - 0.6), r.x1, r.z + s * (r.w / 2 - 0.6), 0.35);
    for (let x = r.x0 + 40; x < r.x1 - 40; x += 12) W(x, r.z, x + 6, r.z, 0.45);
    for (const [x0, dir] of [[r.x0, 1], [r.x1, -1]]) {
      for (let i = 0; i < 8; i++) { const z = r.z - r.w / 2 + 1.4 + i * ((r.w - 2.8) / 7); if (Math.abs(z - r.z) < 1) continue; W(x0 + dir * 2, z, x0 + dir * 9, z, 0.7); }
      for (const s of [-1, 1]) W(x0 + dir * 44, r.z + s * 3.2, x0 + dir * 54, r.z + s * 3.2, 1.6);       // نقاط التصويب
      for (const d of [72, 96]) for (const s of [-1, 1]) for (const k of [0, 1]) W(x0 + dir * d, r.z + s * (2.4 + k * 1.1), x0 + dir * (d + 5), r.z + s * (2.4 + k * 1.1), 0.5);
      const id = r.ids[dir > 0 ? 0 : 1];
      writeRow(ground, id.slice(2), x0 + dir * 13, r.z, dir, 0.9, 0.13);                // الحرف أقرب للعتبة
      writeRow(ground, id.slice(0, 2), x0 + dir * 19, r.z, dir, 0.9, 0.13);
    }
    // إنارة المدرج (ليل)
    const LT = (x, z, c, s = 0.6) => lightsB.box(s, 0.3, s, x, 0.12, z, c);
    for (let x = r.x0; x <= r.x1; x += 25) for (const s of [-1, 1]) LT(x, r.z + s * (r.w / 2 + 0.7), 0xfff4cc);
    for (let x = r.x0 + 10; x < r.x1; x += 15) LT(x, r.z, 0xffffff, 0.4);
    for (let i = 0; i < 9; i++) { const z = r.z - r.w / 2 + (i * r.w) / 8; LT(r.x0 - 0.8, z, 0x39ff7a); LT(r.x1 + 0.8, z, 0xff4a3a); }
    for (let d = 6; d <= 60; d += 6) { LT(r.x0 - d, r.z, 0xfff4cc, 0.5); bld.box(0.12, 0.4, 0.12, r.x0 - d, 0, r.z, K.steelD); }
    for (const s of [-1, 1]) for (let k = 1; k <= 4; k++) LT(r.x0 - 30, r.z + s * k * 1.4, 0xfff4cc, 0.5);
  }
  for (const t of TAXI) for (let x = t.x0; x <= t.x1; x += 18) for (const s of [-1, 1]) lightsB.box(0.45, 0.25, 0.45, x, 0.1, t.z + s * 4.6, 0x4a7dff);

  // مواقف الطائرات: خط الإرشاد الأصفر + خط التوقف + مربع الأمان
  const stands = standList();
  for (const st of [...stands, ...MOVERS.map((m) => ({ type: m.type, x: m.home[0], z: m.home[1], ry: m.ry }))]) {
    const T = TYPES[st.type || 'wb'], c = Math.cos(st.ry), s = Math.sin(st.ry);
    const P = (lx, lz) => [st.x + lx * c + lz * s, st.z - lx * s + lz * c];
    const [ax, az] = P(T.L / 2 + 0.5, 0), [bx, bz] = P(-T.L / 2 - 14, 0);
    tline(ax, az, bx, bz);
    const [s1x, s1z] = P(T.L / 2 + 0.5, -1.6), [s2x, s2z] = P(T.L / 2 + 0.5, 1.6);
    seg(ground, s1x, s1z, s2x, s2z, 0.3, 0.14, 0.02, K.white);
    const hw = T.span / 2 + 1, hl = T.L / 2 + 1, cn = [P(hl, -hw), P(hl, hw), P(-hl, hw), P(-hl, -hw)];
    for (let i = 0; i < 4; i++) seg(ground, cn[i][0], cn[i][1], cn[(i + 1) % 4][0], cn[(i + 1) % 4][1], 0.2, 0.14, 0.02, K.red);
  }

  // ---------- مبنى المسافرين ----------
  const wave = (x0, x1, z0, z1, y, n) => { // سقف متموج (قبوات منخفضة)
    const sp = (z1 - z0) / n;
    bld.box(x1 - x0, 0.3, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, K.roofD);
    for (let i = 0; i < n; i++) bld.gable(x1 - x0, 0.9 + 0.5 * Math.sin(i * 1.3), sp, (x0 + x1) / 2, y + 0.3 + 0.35 * Math.sin(i * 0.9), z0 + sp * (i + 0.5), K.roof);
  };
  glassB.box(CORE.x1 - CORE.x0, 7, CORE.z1 - CORE.z0, (CORE.x0 + CORE.x1) / 2, 0, 0, K.glass);
  for (let z = CORE.z0; z <= CORE.z1 + 0.1; z += 8.5) bld.box(0.5, 7, 0.5, CORE.x1 + 0.1, 0, z, K.steel); // أعمدة الواجهة
  wave(CORE.x0 - 3, CORE.x1 + 5, CORE.z0 - 3, CORE.z1 + 3, 7, 8);
  glassB.box(STEM.x1 - STEM.x0, 5, STEM.z1 - STEM.z0, (STEM.x0 + STEM.x1) / 2, 0, 0, K.glassD);
  wave(STEM.x0 - 1, STEM.x1, STEM.z0 - 1, STEM.z1 + 1, 5, 6);
  for (const [x1, z1, x2, z2, w] of PIERS) {
    const glass = (a, b2, c2, d2) => { const len = Math.hypot(c2 - a, d2 - b2); glassB.box(len, 3.2, w, (a + c2) / 2, 0, (b2 + d2) / 2, K.glass, Math.atan2(-(d2 - b2), c2 - a)); };
    glass(x1, z1, x2, z2);
    seg(bld, x1, z1, x2, z2, w + 1, 3.2, 0.35, K.roofD);
    const len = Math.hypot(x2 - x1, z2 - z1);
    bld.gable(len, 0.8, w + 1, (x1 + x2) / 2, 3.55, (z1 + z2) / 2, K.roof, Math.atan2(-(z2 - z1), x2 - x1));
  }
  // رصيف التوديع: مظلة + أعمدة + رصيف مشاة
  bld.box(14, 0.25, CORE.z1 - CORE.z0 + 6, CORE.x1 + 7, 0, 0, K.paving);
  bld.box(15, 0.4, CORE.z1 - CORE.z0 + 8, CORE.x1 + 7.5, 4.3, 0, K.roof);
  for (let z = CORE.z0 - 2; z <= CORE.z1 + 2.1; z += 7.2) bld.cyl(0.22, 0.22, 4.3, CORE.x1 + 13.5, 0, z, K.steel, 8);
  // لوحة الاسم على الواجهة + لوحة المدخل
  const tex = signTexture();
  const signMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  // لوحة فوق مظلة التوديع (تطالع الشارع) + لوحة كبيرة عند مدخل المطار (تطالع القادمين من الجادة)
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.5), signMat);
  facade.position.set(CORE.x1 + 15.1, 7.05, 0); facade.rotation.y = Math.PI / 2;
  bld.box(0.4, 5, 19, CORE.x1 + 14.8, 4.7, 0, K.conc);
  const monument = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), signMat);
  monument.position.set(236.65, 4.1, -24); monument.rotation.y = Math.PI / 2;
  bld.box(1.2, 7, 22, 236, 0, -24, K.conc); bld.box(1.6, 0.6, 23, 236, 6.9, -24, 0xc9a24a);
  root.add(facade, monument);

  // برج المراقبة (كابينة زجاجية) — جنوب شرق مبنى المسافرين
  { const { x, z } = TOWER;
    bld.box(10, 3, 10, x, 0, z, K.conc);
    bld.cyl(1.25, 1.7, 21, x, 3, z, 0xe9e5dc, 10);
    bld.cyl(3.1, 1.5, 1.2, x, 22.3, z, K.conc, 10);
    glassB.cyl(3.0, 2.6, 2.4, x, 23.5, z, 0x3d6f8a, 10);
    bld.cyl(3.4, 3.2, 0.5, x, 25.9, z, K.roof, 10);
    bld.cyl(0.1, 0.1, 3.5, x, 26.4, z, K.steelD, 6);
    lightsB.box(0.5, 0.4, 0.5, x, 29.8, z, 0xff3a2a);
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; lightsB.box(0.35, 0.3, 0.35, x + Math.cos(a) * 1.4, 14, z + Math.sin(a) * 1.4, 0xff3a2a); }
  }

  // جسور الركاب (للمواقف اللي على الأرصفة)
  for (const st of stands) {
    const f = st.face; if (!f) continue;
    const T = TYPES[st.type || 'nb'], yc = ycOf(T), c = Math.cos(st.ry), s = Math.sin(st.ry);
    const left = [-s, -c];
    let dx, dz;
    if (st.type) { dx = st.x + (T.L / 2 - T.L * 0.2) * c - (T.r + 0.35) * s; dz = st.z - (T.L / 2 - T.L * 0.2) * s - (T.r + 0.35) * c; }
    else { dx = f.x + f.nx * 4.5; dz = f.z + f.nz * 4.5; } // جسر مطوي (موقف فاضي)
    const along = (dx - f.x) * -f.nz + (dz - f.z) * f.nx;
    const sx = f.x - f.nz * along + (st.type ? left[0] * 3.5 : 0), sz = f.z + f.nx * along + (st.type ? left[1] * 3.5 : 0);
    bld.cyl(0.85, 0.85, yc + 0.5, sx, 0, sz, K.steelD, 8);
    seg(bld, sx, sz, dx, dz, 0.85, yc - 0.45, 0.85, K.steel);
    bld.box(1.15, 1.05, 1.15, dx, yc - 0.55, dz, K.steelD);
    const lx = sx + (dx - sx) * 0.72, lz = sz + (dz - sz) * 0.72;
    bld.box(0.25, yc - 0.45, 0.25, lx, 0, lz, K.dark); bld.box(0.9, 0.3, 0.5, lx, 0, lz, K.tyre);
  }

  // أعمدة إضاءة الساحة
  for (const x of [-330, -230, -130, -40]) for (const sg of [-1, 1]) {
    const z = sg * (APRON.z1 - 1);
    bld.cyl(0.18, 0.25, 7, x, 0, z, K.steelD, 6); bld.box(1.8, 0.4, 0.7, x, 7, z, K.steel);
    lightsB.box(1.7, 0.12, 0.6, x, 6.95, z, 0xffe6a8);
  }
  // سياج حديدي حول الحقل كامل (يلف على امتداد المدرج الجنوبي، والمبنى نفسه هو الحد عند جهة المسافرين)
  // أعمدة وقضبان أفقية دايمًا، والقضبان العمودية تطلع بس عن قرب (توفير للجوال)
  const FENCE = [[FIELD.x1, CORE.z0 - 8], [FIELD.x1, FIELD.z0], [FIELD.x0, FIELD.z0], [FIELD.x0, FIELD.z1], [FIELD_EXT.x1, FIELD.z1], [FIELD_EXT.x1, FIELD_EXT.z0], [FIELD.x1, FIELD_EXT.z0], [FIELD.x1, CORE.z1 + 8]];
  for (let i = 0; i < FENCE.length - 1; i++) {
    const [x1, z1] = FENCE[i], [x2, z2] = FENCE[i + 1], len = Math.hypot(x2 - x1, z2 - z1), ux = (x2 - x1) / len, uz = (z2 - z1) / len;
    for (const y of [0.08, 0.5, 0.92]) seg(bld, x1, z1, x2, z2, 0.07, y, 0.06, 0x6b7177);
    for (let d = 0; d <= len + 0.01; d += 6) bld.box(0.16, 1.15, 0.16, x1 + ux * d, 0, z1 + uz * d, 0x4f555b);
    for (let d = 0.75; d < len; d += 1.5) detailB.box(0.04, 0.98, 0.04, x1 + ux * d, 0, z1 + uz * d, 0x7d848a);
  }
  for (const s of [-1, 1]) { const z = s * (CORE.z1 + 8); bld.box(0.5, 1.4, 0.5, FIELD.x1, 0, z, 0x4f555b); } // أعمدة البوابة عند المبنى

  // ---------- جهة المسافرين: مواقف السيارات والنخيل ----------
  ground.box(126, 0.02, 124, 129, 0.03, 0, K.lot);
  for (const [z0, z1] of [[-58, -12], [12, 58]]) { // مبنيين مواقف متعددة الطوابق
    for (let f = 0; f < 3; f++) bld.box(46, 1.2, z1 - z0, 96, f * 1.4, (z0 + z1) / 2, f % 2 ? K.conc : 0xbdb7ab);
    bld.box(46, 0.25, z1 - z0, 96, 4.2, (z0 + z1) / 2, 0x7fae5a);
  }
  for (let x = 132; x <= 186; x += 9) { // مظلات المواقف المكشوفة
    for (const [z0, z1] of [[-58, -6], [6, 58]]) { bld.box(5.2, 0.15, z1 - z0, x, 1.7, (z0 + z1) / 2, K.white); for (let z = z0 + 3; z < z1; z += 12) bld.box(0.15, 1.7, 0.15, x, 0, z, K.steelD); }
    for (let z = -56; z <= 56; z += 1.8) if (Math.abs(z) > 5 && ((x * 7 + z * 13) % 10) > 3) detailB.add(vehGeo('car'), [0xffffff, 0xd9dcde, 0x2b2f33, 0x8a9399, 0xb83a2c, 0x3c5a7a][Math.abs(Math.round(x + z * 3)) % 6], { x: x + (z % 3.6 > 0 ? -1.5 : 1.5), z, ry: Math.PI / 2 });
  }
  for (let z = -62; z <= 62; z += 9) palm(bld, 66, z);
  for (let x = 211; x <= 247; x += 9) for (const s of [-1, 1]) palm(bld, x, s * 8.5);
  for (let x = 66; x <= 196; x += 13) for (const s of [-1, 1]) palm(bld, x, s * 79);
  for (const z of [-60, -45, -30, 30, 45, 60]) palm(bld, 211, z);
  // إنارة الشوارع
  for (const [x, z] of [[62, -40], [62, 0], [62, 40], [120, -75], [160, -75], [120, 75], [160, 75], [205, -35], [205, 35], [225, 5], [245, 5]]) {
    bld.cyl(0.1, 0.12, 4.5, x, 0, z, K.steelD, 6); bld.box(0.9, 0.18, 0.35, x, 4.4, z, K.steel);
    lightsB.box(0.8, 0.1, 0.3, x, 4.35, z, 0xffe6a8);
  }

  // ---------- مركبات ثابتة عند بعض الطائرات ----------
  const vg = { bus: vehGeo('bus'), tug: vehGeo('tug'), fuel: vehGeo('fuel'), push: vehGeo('push'), belt: vehGeo('belt') };
  stands.filter((st) => st.type && st.face).forEach((st, i) => {
    if (i % 2) return;
    const T = TYPES[st.type], c = Math.cos(st.ry), s = Math.sin(st.ry), P = (lx, lz) => [st.x + lx * c + lz * s, st.z - lx * s + lz * c];
    const [bx, bz] = P(-T.L * 0.22, T.r + 1.0), [tx, tz] = P(-T.L * 0.05, T.r + 2.6), [px, pz] = P(T.L / 2 + 1.6, 0);
    stamp(detailB, vg.belt, bx, bz, st.ry + Math.PI / 2);
    stamp(detailB, vg.tug, tx, tz, st.ry + Math.PI);
    if (i % 4 === 0) stamp(detailB, vg.push, px, pz, st.ry + Math.PI);
  });

  // ---------- تجميع ----------
  const mk = (geo, m, cast, recv) => { const o = new THREE.Mesh(geo, m); o.castShadow = cast; o.receiveShadow = recv; return o; };
  const groundMesh = mk(ground.build(), mat, false, true);
  groundMesh.position.y = 0.06; // الحقل والمدرجات فوق يابسة القارة بشوي (ما يرمش مع أرض الجزيرة في المنظر البعيد)
  root.add(mk(landB.build(), mat, false, true));
  const glassMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const lightMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  const lights = mk(lightsB.build(), lightMat, false, false); lights.visible = false;
  root.add(groundMesh, mk(bld.build(), mat, true, true), mk(glassB.build(), glassMat, true, true), lights);
  const detail = new THREE.Group();
  detail.add(mk(detailB.build(), mat, true, false));
  root.add(detail);

  // الطائرات الواقفة: نسختين (تفصيل عالي/منخفض) لكل نوع، بنفس الهندسة المشتركة
  const hi = new THREE.Group(), lo = new THREE.Group(), dummy = new THREE.Object3D();
  const geos = {};
  for (const [k, T] of Object.entries(TYPES)) {
    geos[k] = { hi: planeGeo(T, false), lo: planeGeo(T, true) };
    const list = stands.filter((s) => s.type === k);
    for (const [lvl, grp] of [['hi', hi], ['lo', lo]]) {
      const im = new THREE.InstancedMesh(geos[k][lvl], mat, list.length);
      list.forEach((s, i) => { dummy.position.set(s.x, 0, s.z); dummy.rotation.set(0, s.ry, 0); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
      im.castShadow = lvl === 'hi'; im.receiveShadow = false;
      grp.add(im);
    }
  }
  lo.visible = false;
  root.add(hi, lo);

  // ---------- الحركة ----------
  // طائرتين: تطلع من الموقف البعيد، تسير على الممر الموازي لعتبة المدرج 08، تنتظر، تقلع شرقًا وتختفي، ثم ترجع
  const CYCLE = 92;
  const movers = MOVERS.map((m, i) => {
    const T = TYPES[m.type], pm = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true });
    const mesh = new THREE.Mesh(geos[m.type].hi, pm);
    mesh.rotation.order = 'YZX'; mesh.castShadow = true;
    root.add(mesh);
    const path = makePath(m.path, 9), V = 9, tTaxi = path.len / V;
    const rw = RUNWAYS[m.rw], xs = rw.x0 + 15;
    const ph = { fade: 2, taxi: 2 + tTaxi, hold: 2 + tTaxi + 3 };
    return { T, mesh, pm, path, rw, xs, ph, t: i * CYCLE / 2 + 4 };
  });
  const A_ROLL = 5, D_ROT = 300, T_ROT = Math.sqrt((2 * D_ROT) / A_ROLL), V_ROT = A_ROLL * T_ROT;
  function poseMover(m) {
    const t = m.t % CYCLE, { ph } = m;
    let x, z, y = 0, yaw = 0, pitch = 0, op = 1;
    if (t < ph.taxi) {
      const p = m.path.at(Math.max(0, t - ph.fade) * 9); x = p.x; z = p.z; yaw = p.yaw;
      if (t < ph.fade) { op = t / ph.fade; yaw = m.path.at(0.5).yaw; }
    } else if (t < ph.hold) { x = m.xs; z = m.rw.z; }
    else {
      const tau = t - ph.hold; z = m.rw.z;
      if (tau < T_ROT) x = m.xs + 0.5 * A_ROLL * tau * tau;
      else {
        const u = tau - T_ROT, d = V_ROT * u + 1.5 * u * u;
        x = m.xs + D_ROT + d; y = d * 0.17; pitch = Math.min(0.17, u * 0.12);
        op = THREE.MathUtils.clamp(1 - (d - 200) / 220, 0, 1);
      }
    }
    m.mesh.visible = op > 0.01;
    m.mesh.position.set(x, y, z); m.mesh.rotation.set(0, yaw, pitch);
    m.pm.opacity = op; m.mesh.castShadow = op > 0.9;
  }

  // مركبات الخدمة: مسارات قصيرة مغلقة
  const loops = [
    { geo: vg.tug, path: makePath([[6, 45], [24, 45], [24, 130], [6, 130]], 4, true), v: 3, d: 0 },
    { geo: vg.fuel, path: makePath([[6, -45], [6, -130], [24, -130], [24, -45]], 4, true), v: 3.5, d: 40 },
    { geo: vg.bus, path: makePath([[-100, -5], [-265, -5], [-265, 5], [-100, 5]], 5, true), v: 5, d: 0 },
  ].map((l) => { const mesh = new THREE.Mesh(l.geo, mat); mesh.castShadow = true; detail.add(mesh); return { ...l, mesh }; });
  function poseLoops() { for (const l of loops) { const p = l.path.at(l.d); l.mesh.position.set(p.x, 0, p.z); l.mesh.rotation.y = p.yaw; } }

  movers.forEach(poseMover); poseLoops();
  const center = new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.localToWorld(center.set(-260, 0, 0));
  let lodFar = false, detailOn = true;

  root.userData = {
    civic: 'airport', center,
    // يرجع true إذا تغير شي يحتاج رسم
    // active = الكاميرا تطالع المطار (الحركة ما تشتغل لما اللاعب في مكان ثاني عشان ما يستهلك الجوال)
    update(dt, camPos, active, paused) {
      const dist = camPos.distanceTo(center);
      let changed = false;
      const far = dist > 1100, near = dist < 750;
      if (far !== lodFar) { lodFar = far; hi.visible = !far; lo.visible = far; changed = true; }
      if (near !== detailOn) { detailOn = near; detail.visible = near; changed = true; }
      if (!paused && active) {
        for (const m of movers) { m.t += dt; poseMover(m); }
        for (const l of loops) l.d += l.v * dt;
        poseLoops();
        changed = true;
      }
      return changed;
    },
    setNight(on) { lights.visible = on; glassMat.emissive.set(on ? 0x8a6a2a : 0x000000); },
    // لقطة الإقلاع: الطائرة الأولى تبدأ من العتبة
    cueTakeoff() { const m = movers[0]; m.t = m.ph.hold + 4.5; poseMover(m); },
    seekTakeoff(tau) { const m = movers[0]; m.t = m.ph.hold + tau; poseMover(m); }, // للتصوير: ثواني بعد بداية الإقلاع
    movers: () => movers.map((m) => ({ x: m.mesh.position.x, y: m.mesh.position.y, z: m.mesh.position.z, op: m.pm.opacity })),
  };
  root.traverse((o) => { if (o.isMesh) o.userData.civic = 'airport'; });
  return root;
}

// لقطات الكاميرا (محلي): t = الهدف، p = الكاميرا
export const AIRPORT_VIEWS = {
  all: { t: [-250, 0, 0], p: [-250, 1250, 260] },            // منظر علوي كامل
  landside: { t: [20, 6, 0], p: [175, 34, 46] },             // المبنى من جهة المسافرين
  apron: { t: [-110, 2, -70], p: [-222, 78, -196] },         // الأرصفة والطائرات من الساحة
  takeoff: { t: [-140, 16, -183], p: [-253, 9, -330] },      // الإقلاع والبرج والمبنى في الخلفية
};

// فحص التداخل (للتشخيص): الطائرات الواقفة مع بعض ومع المباني، ومسارات الحركة مع الطائرات الواقفة
export function airportSelfCheck() {
  const stands = standList().filter((s) => s.type);
  const rect = (s) => { const T = TYPES[s.type]; return { x: s.x, z: s.z, c: Math.cos(s.ry), sn: Math.sin(s.ry), hl: T.L / 2, hw: T.span / 2 }; };
  const inRect = (r, x, z, pad = 0) => { const dx = x - r.x, dz = z - r.z, lx = dx * r.c - dz * r.sn, lz = dx * r.sn + dz * r.c; return Math.abs(lx) <= r.hl + pad && Math.abs(lz) <= r.hw + pad; };
  const corners = (r) => [[r.hl, r.hw], [r.hl, -r.hw], [-r.hl, r.hw], [-r.hl, -r.hw], [0, r.hw], [0, -r.hw], [r.hl, 0], [-r.hl, 0]].map(([lx, lz]) => [r.x + lx * r.c + lz * r.sn, r.z - lx * r.sn + lz * r.c]);
  const issues = [], R = stands.map(rect);
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) if (corners(R[i]).some(([x, z]) => inRect(R[j], x, z, 0.5)) || corners(R[j]).some(([x, z]) => inRect(R[i], x, z, 0.5))) issues.push(`stand ${i}×${j}`);
  const boxes = [CORE, STEM].map((b) => ({ x: (b.x0 + b.x1) / 2, z: (b.z0 + b.z1) / 2, c: 1, sn: 0, hl: (b.x1 - b.x0) / 2, hw: (b.z1 - b.z0) / 2 }));
  for (const [x1, z1, x2, z2, w] of PIERS) { const a = Math.atan2(-(z2 - z1), x2 - x1); boxes.push({ x: (x1 + x2) / 2, z: (z1 + z2) / 2, c: Math.cos(a), sn: Math.sin(a), hl: Math.hypot(x2 - x1, z2 - z1) / 2, hw: w / 2 }); }
  R.forEach((r, i) => boxes.forEach((b, k) => { if (corners(r).some(([x, z]) => inRect(b, x, z))) issues.push(`stand ${i} × building ${k}`); }));
  for (const m of MOVERS) { const p = makePath(m.path, 9), T = TYPES[m.type]; for (let d = 0; d <= p.len; d += 2) { const q = p.at(d); R.forEach((r, i) => { if (inRect(r, q.x, q.z, T.span / 2)) issues.push(`mover ${m.type} @${d.toFixed(0)} × stand ${i}`); }); boxes.forEach((b, k) => { if (inRect(b, q.x, q.z, T.span / 2)) issues.push(`mover ${m.type} @${d.toFixed(0)} × building ${k}`); }); } }
  return [...new Set(issues)];
}
