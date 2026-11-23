// قيادة الجيش: مجمع عسكري بنفس مساحة ساحة الحاكم (164×179) شمال الجادة، بوابته على الجادة.
// قدّام: مبنى القيادة وساحة العرض والأعلام. ورا: مرآب الآليات العسكرية (شاحنات، جيبات، مدرعات، دبابات، مروحية) وساحة التدريب
// (مضمار جري، حواجز، حبال، إطارات، ميدان رماية).
// المحاور المحلية: x شرق، z جنوب (البوابة جهة +z على الجادة)، الأصل = مركز المجمع.
import * as THREE from 'three';
import { Builder } from './houses.js';

const C = {
  wall: 0xb9b08e, wallD: 0x8f876a, wallL: 0xd6cfb0, conc: 0xcfccc4, concD: 0xa9a59b, olive: 0x5f6b38, oliveD: 0x46502a, oliveL: 0x7d8a4c,
  sand: 0xc7ab72, sandD: 0xa88c55, tyre: 0x232527, glass: 0x3d5a73, metal: 0x6d7378, dirt: 0xb99d6c, track: 0xa8573f, grass: 0x84c962,
  white: 0xf4f1ea, red: 0xb83a2c, flagG: 0x2e7d32, yellow: 0xf2c94c, dark: 0x2b2f33, asph: 0x5c6068,
};

// ---------- آليات (Low Poly) — الاتجاه الافتراضي: المقدمة جهة +x ----------
function truck(b, x, z, ry = 0, col = C.olive) {
  const R = (dx, dz) => [x + dx * Math.cos(ry) + dz * Math.sin(ry), z - dx * Math.sin(ry) + dz * Math.cos(ry)];
  const box = (w, h, d, dx, y, dz, c) => { const [px, pz] = R(dx, dz); b.box(w, h, d, px, y, pz, c, ry); };
  box(9.5, 0.6, 2.6, 0, 0.9, 0, C.dark);                 // الشاصي
  box(2.6, 2.4, 2.5, 3.6, 1.5, 0, col);                 // القمرة
  box(0.1, 1, 2.1, 4.92, 2.6, 0, C.glass);               // الزجاج
  box(6.6, 0.5, 2.6, -1.4, 1.5, 0, col);                 // صندوق
  box(6.6, 2.6, 2.6, -1.4, 2, 0, C.oliveD);              // غطاء القماش
  for (const dx of [3.4, -0.4, -3]) for (const dz of [-1.25, 1.25]) { const [px, pz] = R(dx, dz); b.add(new THREE.CylinderGeometry(0.75, 0.75, 0.55, 10), C.tyre, { rx: Math.PI / 2, ry, x: px, y: 0.75, z: pz }); }
}
function jeep(b, x, z, ry = 0, col = C.sand) {
  const R = (dx, dz) => [x + dx * Math.cos(ry) + dz * Math.sin(ry), z - dx * Math.sin(ry) + dz * Math.cos(ry)];
  const box = (w, h, d, dx, y, dz, c) => { const [px, pz] = R(dx, dz); b.box(w, h, d, px, y, pz, c, ry); };
  box(4.6, 1.1, 2.1, 0, 0.6, 0, col); box(2.2, 1, 2, -0.5, 1.7, 0, C.sandD); box(0.1, 0.8, 1.8, 0.62, 1.8, 0, C.glass);
  box(0.4, 0.9, 0.9, -2.45, 1.0, 0, C.tyre); // الإطار الاحتياطي
  for (const dx of [1.5, -1.4]) for (const dz of [-1.05, 1.05]) { const [px, pz] = R(dx, dz); b.add(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 10), C.tyre, { rx: Math.PI / 2, ry, x: px, y: 0.55, z: pz }); }
}
function apc(b, x, z, ry = 0, col = C.olive) {
  const R = (dx, dz) => [x + dx * Math.cos(ry) + dz * Math.sin(ry), z - dx * Math.sin(ry) + dz * Math.cos(ry)];
  const box = (w, h, d, dx, y, dz, c) => { const [px, pz] = R(dx, dz); b.box(w, h, d, px, y, pz, c, ry); };
  box(7.2, 2, 3, 0, 0.8, 0, col); box(1.6, 1.2, 2.6, 3.6, 0.8, 0, col); box(1.6, 0.7, 1.6, -0.5, 2.8, 0, C.oliveD);
  box(2.6, 0.25, 0.25, 1.1, 3.1, 0, C.dark);
  for (const dx of [2.6, 0.9, -0.9, -2.6]) for (const dz of [-1.55, 1.55]) { const [px, pz] = R(dx, dz); b.add(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 10), C.tyre, { rx: Math.PI / 2, ry, x: px, y: 0.7, z: pz }); }
}
function tank(b, x, z, ry = 0, col = C.sand) {
  const R = (dx, dz) => [x + dx * Math.cos(ry) + dz * Math.sin(ry), z - dx * Math.sin(ry) + dz * Math.cos(ry)];
  const box = (w, h, d, dx, y, dz, c) => { const [px, pz] = R(dx, dz); b.box(w, h, d, px, y, pz, c, ry); };
  box(8, 1.2, 1, 0, 0, -1.7, C.dark); box(8, 1.2, 1, 0, 0, 1.7, C.dark);              // الجنازير
  box(7.6, 1.2, 3.6, 0, 1.0, 0, col); box(1.4, 0.6, 3.6, 3.9, 1.0, 0, C.sandD);         // البدن
  box(3.6, 1.1, 3, -0.4, 2.2, 0, C.sandD);                                             // البرج
  const [px, pz] = R(3.6, 0); b.add(new THREE.CylinderGeometry(0.17, 0.2, 5.4, 8), C.dark, { rz: Math.PI / 2, ry, x: px, y: 2.75, z: pz }); // المدفع
  box(0.8, 0.5, 0.8, -1.2, 3.3, -0.7, C.oliveD);
}
function helicopter(b, x, z) {
  b.cyl(9, 9, 0.12, x, 0.04, z, C.concD, 24); b.cyl(7.6, 7.6, 0.14, x, 0.05, z, C.conc, 24);
  b.box(1.2, 0.05, 6.5, x - 2.2, 0.2, z, C.white); b.box(1.2, 0.05, 6.5, x + 2.2, 0.2, z, C.white); b.box(3.2, 0.05, 1.2, x, 0.2, z, C.white); // H
  b.box(5, 2.2, 2.4, x, 0.9, z + 11, C.olive); b.box(0.1, 1.2, 2, x + 2.55, 1.6, z + 11, C.glass);
  b.box(6, 0.7, 0.7, x - 5, 1.6, z + 11, C.oliveD); b.box(0.2, 1.6, 0.9, x - 8, 1.8, z + 11, C.olive);
  b.cyl(0.25, 0.25, 0.8, x, 3.1, z + 11, C.dark, 6); b.box(12, 0.12, 0.5, x, 3.9, z + 11, C.dark); b.box(0.5, 0.12, 12, x, 3.9, z + 11, C.dark);
  for (const dz of [-1, 1]) b.box(4.5, 0.15, 0.2, x, 0.2, z + 11 + dz * 1.1, C.dark);
}

// ---------- لوحة نصية ----------
function sign(text, w, h) {
  const c = document.createElement('canvas'); c.width = 768; c.height = Math.round(768 * h / w);
  const x = c.getContext('2d'), W = c.width, H = c.height;
  x.fillStyle = '#3d4628'; x.beginPath(); x.roundRect(4, 4, W - 8, H - 8, 24); x.fill(); x.strokeStyle = '#f2c94c'; x.lineWidth = 8; x.stroke();
  x.fillStyle = '#f2c94c'; x.font = `900 ${Math.round(H * 0.5)}px Tajawal, "Segoe UI Emoji", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl';
  x.fillText(text, W / 2, H / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t }));
  document.fonts?.ready.then(() => { x.clearRect(0, 0, W, H); x.fillStyle = '#3d4628'; x.beginPath(); x.roundRect(4, 4, W - 8, H - 8, 24); x.fill(); x.stroke(); x.fillStyle = '#f2c94c'; x.fillText(text, W / 2, H / 2 + 4); t.needsUpdate = true; });
  return m;
}

// ---------- المجمع ----------
// box = { x0, x1, z0, z1, gateX } بإحداثيات الخريطة (نفس شكل سور القصر)
export function armyBase(w, mat) {
  const g = new THREE.Group();
  const cx = (w.x0 + w.x1) / 2, cz = (w.z0 + w.z1) / 2, X0 = w.x0 - cx, X1 = w.x1 - cx, Z0 = w.z0 - cz, Z1 = w.z1 - cz, gx = w.gateX - cx;
  const b = new Builder(), land = new Builder(), veh = new Builder();

  // --- الأرضيات ---
  land.box(X1 - X0 - 3, 0.05, Z1 - Z0 - 3, 0, 0.02, 0, 0xbfae84);                           // تربة المعسكر
  land.box(120, 0.07, 52, 0, 0.03, 54, C.conc);                                               // ساحة العرض (قدّام القيادة)
  for (let x = -54; x <= 54; x += 6) land.box(0.25, 0.02, 44, x, 0.11, 54, 0xe9e6dc);          // خطوط الطابور
  land.box(14, 0.08, Z1 - 80, gx, 0.04, (Z1 + 80) / 2 - 0.5, C.asph);                         // طريق البوابة لساحة العرض
  land.box(X1 - X0 - 8, 0.08, 8, 0, 0.04, -24, C.asph);                                       // طريق خلف القيادة
  land.box(8, 0.08, 64, -6, 0.04, -58, C.asph);                                               // الممر الأوسط بين المرآب والتدريب
  land.box(70, 0.07, 62, -44, 0.03, -58, C.asph);                                             // مرآب الآليات
  for (let x = -76; x <= -12; x += 8) land.box(0.25, 0.02, 10, x, 0.11, -38, 0xf2f2ea);
  for (let x = -76; x <= -12; x += 8) land.box(0.25, 0.02, 10, x, 0.11, -62, 0xf2f2ea);
  land.box(74, 0.06, 64, 42, 0.03, -57, C.grass);                                             // ساحة التدريب (عشب)
  // حديقة صغيرة جنب الساحة
  for (const sx of [-1, 1]) land.box(18, 0.06, 40, sx * 70, 0.03, 54, C.grass);

  // --- السور والأبراج (نفس طراز سور الحاكم لكن خرساني عسكري) ---
  const H = 5.5, T = 1.6;
  const seg = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2, alongX = Math.abs(bx - ax) > Math.abs(bz - az);
    if (alongX) { b.box(len, H, T, mx, 0, mz, C.wall); b.box(len, 0.4, T + 0.4, mx, H, mz, C.wallL); b.box(len, 0.6, T + 0.3, mx, 0, mz, C.wallD); for (let i = 0.5; i < len; i += 6) b.box(0.15, 0.9, 0.15, ax + (bx - ax) * (i / len), H + 0.4, mz, C.metal); b.box(len, 0.08, 0.08, mx, H + 1.25, mz, C.metal); }
    else { b.box(T, H, len, mx, 0, mz, C.wall); b.box(T + 0.4, 0.4, len, mx, H, mz, C.wallL); b.box(T + 0.3, 0.6, len, mx, 0, mz, C.wallD); for (let i = 0.5; i < len; i += 6) b.box(0.15, 0.9, 0.15, mx, H + 0.4, az + (bz - az) * (i / len), C.metal); b.box(0.08, 0.08, len, mx, H + 1.25, mz, C.metal); }
  };
  const watch = (x, z, h = 12) => {
    for (const dx of [-1.6, 1.6]) for (const dz of [-1.6, 1.6]) b.box(0.4, h, 0.4, x + dx, 0, z + dz, C.oliveD);
    b.box(5.2, 0.5, 5.2, x, h, z, C.conc); b.box(5.2, 1.2, 0.3, x, h + 0.5, z - 2.45, C.olive); b.box(5.2, 1.2, 0.3, x, h + 0.5, z + 2.45, C.olive);
    b.box(0.3, 1.2, 5.2, x - 2.45, h + 0.5, z, C.olive); b.box(0.3, 1.2, 5.2, x + 2.45, h + 0.5, z, C.olive);
    for (const dx of [-2.3, 2.3]) for (const dz of [-2.3, 2.3]) b.box(0.25, 1.6, 0.25, x + dx, h + 1.7, z + dz, C.oliveD);
    b.hip(6.4, 1.6, 6.4, x, h + 3.3, z, C.oliveD); b.cyl(0.35, 0.35, 0.6, x, h + 4.9, z, C.yellow, 8);
  };
  const gW = 18, g0 = gx - gW / 2, g1 = gx + gW / 2;
  seg(X0, Z0, X1, Z0); seg(X0, Z0, X0, Z1); seg(X1, Z0, X1, Z1); seg(X0, Z1, g0 - 3, Z1); seg(g1 + 3, Z1, X1, Z1);
  for (const [x, z] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) watch(x, z);
  watch(X0, 0, 10); watch(X1, 0, 10); watch(-35, Z0, 10); watch(35, Z0, 10);
  // البوابة: برجين خرسانيين + جسر علوي + حاجز
  for (const x of [g0 - 3, g1 + 3]) { b.box(6, 9, 6, x, 0, Z1, C.wall); b.box(6.6, 0.5, 6.6, x, 9, Z1, C.wallL); b.box(0.1, 1.6, 2, x + (x < gx ? 3.02 : -3.02), 5.5, Z1, C.glass); }
  b.box(gW, 2.4, T + 1, gx, 7, Z1, C.wall); b.box(gW + 1, 0.4, T + 1.4, gx, 9.4, Z1, C.wallL);
  b.box(gW * 0.45, 0.25, 0.25, gx - gW * 0.23, 1.1, Z1 + 3, C.red); b.box(gW * 0.45, 0.25, 0.25, gx + gW * 0.23, 1.1, Z1 + 3, C.white); // حاجز البوابة
  b.box(3, 3, 3, g1 + 7, 0, Z1 + 4, C.conc); b.box(0.1, 1.2, 2.4, g1 + 5.48, 1.4, Z1 + 4, C.glass); b.box(3.6, 0.3, 3.6, g1 + 7, 3, Z1 + 4, C.oliveD); // كشك الحراسة

  // --- مبنى القيادة (3 طوابق + برج وسطي) ---
  const hz = 12, hw = 74, hd = 22;
  b.box(hw, 13, hd, 0, 0, hz, C.sand);
  b.box(hw + 1, 0.6, hd + 1, 0, 13, hz, C.sandD);
  for (let f = 0; f < 3; f++) for (let x = -hw / 2 + 4; x <= hw / 2 - 4; x += 4) {
    if (Math.abs(x) < 9) continue;
    b.box(2.2, 1.8, 0.1, x, 1.6 + f * 4, hz + hd / 2 + 0.02, C.glass); b.box(2.2, 1.8, 0.1, x, 1.6 + f * 4, hz - hd / 2 - 0.02, C.glass);
  }
  b.box(18, 21, hd + 2, 0, 0, hz, C.sandD);                                                    // البرج الوسطي
  b.box(19, 0.6, hd + 3, 0, 21, hz, C.olive);
  b.box(14, 0.6, 6, 0, 6, hz + hd / 2 + 4, C.oliveD); for (const x of [-6.5, 6.5]) b.box(0.6, 6, 0.6, x, 0, hz + hd / 2 + 6.4, C.sandD); // مظلة المدخل
  b.box(5, 4.2, 0.1, 0, 0, hz + hd / 2 + 1.02, C.dark);                                         // الباب
  for (let i = 0; i < 4; i++) b.box(16 - i * 0.01, 0.4, 2 - i * 0.4, 0, i * 0.4 * 0, hz + hd / 2 + 1.6 + i * 0.4, C.conc); // الدرج
  b.cyl(0.15, 0.2, 6, 0, 21.6, hz, C.metal, 6); b.box(0.1, 1.4, 1.2, 0, 27.6, hz + 0.7, C.red); // هوائي
  // الأعلام قدّام القيادة
  for (const [x, col] of [[-12, C.red], [0, C.flagG], [12, C.red]]) { b.cyl(0.14, 0.18, 12, x, 0, 34, C.white, 8); b.box(0.1, 2.2, 3.6, x, 9.4, 35.9, col); b.ball(0.3, x, 12.2, 34, C.yellow); }
  b.box(8, 1, 4, 0, 0, 40, C.concD); b.box(9, 0.3, 5, 0, 1, 40, C.conc);                         // منصة التحية

  // --- مرآب الآليات (غرب، ورا القيادة) ---
  b.box(64, 6.5, 12, -44, 0, -80, C.olive); b.gable(64, 3, 13, -44, 6.5, -80, C.oliveD);          // هنقر
  for (let x = -70; x <= -18; x += 13) b.box(9, 5, 0.1, x, 0, -73.95, C.oliveD);                  // أبواب الهنقر
  // ثلاث صفوف آليات (مقدمتها للجنوب جهة الطريق)
  for (let i = 0; i < 5; i++) truck(veh, -74 + i * 6.5, -37, -Math.PI / 2, i % 2 ? C.olive : C.sand);
  for (let i = 0; i < 4; i++) jeep(veh, -38 + i * 6, -37, -Math.PI / 2, i % 2 ? C.sand : C.olive);
  for (let i = 0; i < 4; i++) apc(veh, -74 + i * 7, -51, -Math.PI / 2, C.olive);
  for (let i = 0; i < 3; i++) jeep(veh, -42 + i * 6, -51, -Math.PI / 2, C.oliveL);
  for (let i = 0; i < 6; i++) tank(veh, -74 + i * 10, -65, -Math.PI / 2, i % 2 ? C.olive : C.sand);
  helicopter(veh, -66, 46);                                                                     // مهبط مروحية في الحديقة الأمامية الغربية
  // طابور عسكريين في ساحة العرض (6 صفوف × 10)
  for (let r = 0; r < 6; r++) for (let i = 0; i < 10; i++) {
    const x = -27 + i * 6, z = 50 + r * 4.5;
    veh.box(0.9, 1.15, 0.6, x, 0.85, z, C.olive); veh.box(0.32, 0.85, 0.32, x - 0.25, 0, z, C.oliveD); veh.box(0.32, 0.85, 0.32, x + 0.25, 0, z, C.oliveD);
    veh.box(0.5, 0.5, 0.5, x, 2.0, z, 0xc99b75); veh.box(0.62, 0.22, 0.62, x, 2.45, z, C.oliveD);
  }

  // --- ساحة التدريب (شرق، ورا القيادة) ---
  // مضمار جري بيضاوي
  const ox = 42, oz = -50;
  for (let i = 0; i < 48; i++) {
    const a0 = (i / 48) * Math.PI * 2, a1 = ((i + 1) / 48) * Math.PI * 2;
    const p = (a, r) => [ox + Math.cos(a) * r * 1.55, oz + Math.sin(a) * r];
    const [x0, z0] = p(a0, 15), [x1, z1] = p(a1, 15), len = Math.hypot(x1 - x0, z1 - z0);
    land.box(len + 0.4, 0.06, 3.4, (x0 + x1) / 2, 0.05, (z0 + z1) / 2, C.track, -Math.atan2(z1 - z0, x1 - x0));
  }
  // حواجز داخل المضمار: جدران قفز، عوارض، حبال تسلق، إطارات
  for (let i = 0; i < 4; i++) b.box(0.6, 1.4 + i * 0.4, 6, ox - 12 + i * 6, 0, oz - 3, C.conc);
  for (let i = 0; i < 3; i++) { b.box(0.3, 2.2, 0.3, ox - 9 + i * 6, 0, oz + 5, C.oliveD); b.box(0.3, 2.2, 0.3, ox - 9 + i * 6, 0, oz + 9, C.oliveD); b.box(0.25, 0.25, 4.3, ox - 9 + i * 6, 2.2, oz + 7, C.oliveD); }
  for (const dx of [-2.5, 2.5]) b.box(0.5, 9, 0.5, ox + 12 + dx, 0, oz + 2, C.oliveD); b.box(5.5, 0.5, 0.5, ox + 12, 9, oz + 2, C.oliveD);
  for (const dx of [-1, 0, 1]) b.box(0.15, 8.6, 0.15, ox + 12 + dx * 1.4, 0.3, oz + 2, 0xc9b27a);  // حبال
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) b.add(new THREE.TorusGeometry(0.75, 0.3, 6, 10), C.tyre, { rx: Math.PI / 2, x: ox - 6 + i * 2, y: 0.3, z: oz + 13 + r * 2 });
  // ميدان الرماية (شمال ساحة التدريب): أهداف وساتر ترابي
  b.box(60, 3.5, 4, 42, 0, -86, C.dirt);
  for (let i = 0; i < 8; i++) { const x = 16 + i * 7.5; b.box(0.2, 1.4, 0.2, x, 0, -82, C.oliveD); b.cyl(0.9, 0.9, 0.12, x, 1.9, -82, C.white, 14); b.cyl(0.55, 0.55, 0.14, x, 1.9, -82, C.red, 14); }
  for (let i = 0; i < 8; i++) b.box(4, 0.8, 1.2, 16 + i * 7.5, 0, -66, C.sandD);                 // مواقع الرمي
  b.box(16, 4, 8, 64, 0, -28, C.sand); b.gable(16, 2, 9, 64, 4, -28, C.oliveD);                  // مبنى التجهيزات
  // أكياس رمل حول المرآب والتدريب
  for (let x = -78; x <= 78; x += 2.4) if (Math.abs(x + 6) > 6) b.box(2.2, 0.9, 1.2, x, 0, -30, C.sandD);

  // --- الدمج ---
  const body = new THREE.Mesh(b.build(), mat); body.castShadow = true; body.receiveShadow = true;
  const vm = new THREE.Mesh(veh.build(), mat); vm.castShadow = true; vm.receiveShadow = true;
  const ground = new THREE.Mesh(land.build(), mat); ground.receiveShadow = true;
  g.add(ground, body, vm);
  // لوحة فوق البوابة واسم المبنى على البرج
  const s1 = sign('🪖 قيادة الجيش', 16, 2.4); s1.position.set(gx, 8.2, Z1 + T / 2 + 0.55); g.add(s1);
  const s2 = sign('قيادة الجيش', 15, 2.6); s2.position.set(0, 17.5, hz + hd / 2 + 1.06); g.add(s2);
  g.traverse((o) => { if (o.isMesh) o.userData.civic = 'army'; });
  g.position.set(cx, 0, cz);
  return g;
}
