// موديلات البيوت العشرة + قاعدة القطعة. كل موديل هندسة واحدة بألوان على الرؤوس (رسمة واحدة لكل بيت).
// الإحداثيات المحلية للقطعة: العرض x من -7.5 إلى 7.5، العمق z من -9 إلى 9، والشارع جهة +z.
import * as THREE from 'three';

export const LEVEL_NAMES = [
  '', 'كوخ خشبي', 'بنغل كرافتسمان', 'رانش هاوس', 'كيب كود', 'سبليت ليفل',
  'كولونيال', 'مودرن فارم هاوس', 'فيكتوريان', 'ميد سنشري مودرن', 'القصر',
];

const Y0 = 0.16; // سطح العشب
const K = {
  white: 0xf4f1ea, glass: 0x3d5a73, concrete: 0xcfccc4, stone: 0x8f8b84, brick: 0xa65e44,
  dark: 0x25282c, grass: 0x7cc35a, leaf: 0x3f8f45, leaf2: 0x57a84e, trunk: 0x7a5230, water: 0x3fb7e0, gold: 0xd9b23c,
};

const tmpColor = new THREE.Color();

export class Builder {
  constructor() { this.pos = []; this.col = []; }
  add(geom, color, o = {}) {
    const g = geom.index ? geom.toNonIndexed() : geom;
    if (o.rx) g.rotateX(o.rx);
    if (o.rz) g.rotateZ(o.rz);
    if (o.ry) g.rotateY(o.ry);
    g.translate(o.x || 0, o.y || 0, o.z || 0);
    const p = g.attributes.position.array;
    tmpColor.set(color);
    for (let i = 0; i < p.length; i += 3) {
      this.pos.push(p[i], p[i + 1], p[i + 2]);
      this.col.push(tmpColor.r, tmpColor.g, tmpColor.b);
    }
    g.dispose();
    return this;
  }
  // صندوق قاعدته عند y
  box(w, h, d, x, y, z, color, ry = 0) { return this.add(new THREE.BoxGeometry(w, h, d), color, { x, y: y + h / 2, z, ry }); }
  // لوح مائل مركزه عند y
  slab(w, t, d, x, y, z, color, o = {}) { return this.add(new THREE.BoxGeometry(w, t, d), color, { x, y, z, ...o }); }
  cyl(rt, rb, h, x, y, z, color, seg = 12) { return this.add(new THREE.CylinderGeometry(rt, rb, h, seg), color, { x, y: y + h / 2, z }); }
  ball(r, x, y, z, color, detail = 0) { return this.add(new THREE.IcosahedronGeometry(r, detail), color, { x, y, z }); }
  // سقف جملوني: len على امتداد القمة (محور x)، span العرض (محور z)
  gable(len, h, span, x, y, z, color, ry = 0) {
    const a = len / 2, s = span / 2;
    const A = [-a, 0, s], B = [a, 0, s], C = [a, 0, -s], D = [-a, 0, -s], E = [-a, h, 0], F = [a, h, 0];
    return this.add(poly([[A, B, F], [A, F, E], [C, D, E], [C, E, F], [D, A, E], [B, C, F], [A, C, B], [A, D, C]]), color, { x, y, z, ry });
  }
  // سقف هرمي (hip): w على x، d على z
  hip(w, h, d, x, y, z, color, ry = 0) {
    const a = w / 2, s = d / 2, r = Math.max(0, w - d) / 2;
    const A = [-a, 0, s], B = [a, 0, s], C = [a, 0, -s], D = [-a, 0, -s], E = [-r, h, 0], F = [r, h, 0];
    return this.add(poly([[A, B, F], [A, F, E], [C, D, E], [C, E, F], [D, A, E], [B, C, F], [A, C, B], [A, D, C]]), color, { x, y, z, ry });
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }
}

// مجسم محدّب من مثلثات، مع تصحيح اتجاه الأوجه للخارج تلقائيًا
function poly(tris) {
  const c = [0, 0, 0];
  let n = 0;
  for (const t of tris) for (const p of t) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; n++; }
  c[0] /= n; c[1] /= n; c[2] /= n;
  const out = [];
  for (const [p, q, r] of tris) {
    const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2];
    const vx = r[0] - p[0], vy = r[1] - p[1], vz = r[2] - p[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (p[0] + q[0] + r[0]) / 3 - c[0], my = (p[1] + q[1] + r[1]) / 3 - c[1], mz = (p[2] + q[2] + r[2]) / 3 - c[2];
    if (nx * mx + ny * my + nz * mz >= 0) out.push(...p, ...q, ...r);
    else out.push(...p, ...r, ...q);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  return g;
}

// ---------- عناصر مشتركة ----------
// نافذة على واجهة أمامية (s=1) أو خلفية (s=-1). y = أسفل الزجاج، z = سطح الجدار
function win(b, x, y, z, w = 0.9, h = 1.1, o = {}) {
  const s = o.back ? -1 : 1;
  b.box(w + 0.24, h + 0.24, 0.1, x, y - 0.12, z + s * 0.03, o.frame ?? K.white);
  b.box(w, h, 0.1, x, y, z + s * 0.08, o.glass ?? K.glass);
  if (o.shutters) {
    b.box(0.28, h + 0.1, 0.08, x - w / 2 - 0.28, y - 0.05, z + s * 0.05, o.shutters);
    b.box(0.28, h + 0.1, 0.08, x + w / 2 + 0.28, y - 0.05, z + s * 0.05, o.shutters);
  }
}
// نافذة على جدار جانبي (dir=1 يمين، -1 يسار)
function winSide(b, x, y, z, w = 0.9, h = 1.1, dir = 1, o = {}) {
  b.box(0.1, h + 0.24, w + 0.24, x + dir * 0.03, y - 0.12, z, o.frame ?? K.white);
  b.box(0.1, h, w, x + dir * 0.08, y, z, o.glass ?? K.glass);
}
function door(b, x, y, z, color, w = 0.95, h = 1.95, frame = K.white) {
  b.box(w + 0.26, h + 0.16, 0.1, x, y, z + 0.03, frame);
  b.box(w, h, 0.1, x, y, z + 0.08, color);
  b.box(0.1, 0.1, 0.06, x + w / 2 - 0.16, y + h * 0.48, z + 0.15, K.gold);
}
// ممر سيارات من الشارع (z=10.6) حتى zEnd
function drive(b, x, w, zEnd, color = K.concrete) {
  b.box(w, 0.05, 10.6 - zEnd, x, Y0, (10.6 + zEnd) / 2, color);
}
function path(b, x1, z1, x2, z2, w = 0.9, color = 0xddd8cc) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  b.box(w, 0.045, len, (x1 + x2) / 2, Y0, (z1 + z2) / 2, color, Math.atan2(x2 - x1, z2 - z1));
}
// سقف جملوني مع مثلث الجدار ظاهر في الواجهتين
function gableRoof(b, o) {
  const ov = o.ov ?? 0.45, S = o.span + 2 * ov, ry = o.alongZ ? Math.PI / 2 : 0;
  b.gable(o.len, o.h, S, o.x, o.y, o.z, o.roof, ry);
  if (o.wall !== undefined) {
    const w2 = o.span * 0.94;
    b.gable(o.len + 0.1, (w2 / 2) * (o.h / (S / 2)) * 0.94, w2, o.x, o.y, o.z, o.wall, ry);
  }
}
function bush(b, x, z, r = 0.55, color = K.leaf) { b.ball(r, x, Y0 + r * 0.7, z, color); }
function tree(b, x, z, s = 1) {
  b.cyl(0.16 * s, 0.22 * s, 1.5 * s, x, Y0, z, K.trunk, 6);
  b.ball(1.25 * s, x, Y0 + 2.3 * s, z, K.leaf);
  b.ball(0.85 * s, x + 0.5 * s, Y0 + 3.1 * s, z - 0.2 * s, K.leaf2);
}
function steps(b, x, z, w, n = 2, color = K.concrete) {
  for (let i = 0; i < n; i++) b.box(w, 0.15 * (n - i), 0.35, x, Y0, z + 0.175 + i * 0.35, color);
}

// ---------- 1: كوخ خشبي ----------
function cabin(b, v) {
  const wood = [0x9b6a3c, 0x8a5a33, 0xa87848][v], roof = [0x3f5d3a, 0x6a3f2c, 0x44505c][v];
  const cx = -1.2, cz = -2.6, w = 5.2, d = 4.4, h = 2.5, zf = cz + d / 2;
  b.box(w, h, d, cx, Y0, cz, wood);
  for (let i = 0; i < 5; i++) b.box(w + 0.1, 0.07, d + 0.1, cx, Y0 + 0.42 + i * 0.5, cz, 0x6b4526);
  gableRoof(b, { len: w + 0.7, h: 2.1, span: d, x: cx, y: Y0 + h, z: cz, roof, wall: wood, ov: 0.5 });
  b.box(0.9, 5, 0.9, cx - w / 2 - 0.3, Y0, cz - 0.4, K.stone);
  b.box(1.1, 0.2, 1.1, cx - w / 2 - 0.3, Y0 + 5, cz - 0.4, 0x6f6b65);
  // البرندة
  b.box(w, 0.3, 1.7, cx, Y0, zf + 0.85, 0x7a5230);
  for (const px of [-w / 2 + 0.2, w / 2 - 0.2]) b.box(0.22, 2.0, 0.22, cx + px, Y0 + 0.3, zf + 1.5, 0x6b4526);
  b.slab(w + 0.7, 0.14, 2.2, cx, Y0 + 2.5, zf + 0.95, roof, { rx: 0.2 });
  b.box(1.9, 0.08, 0.08, cx + 1.55, Y0 + 1.05, zf + 1.5, 0x6b4526);
  b.box(1.4, 0.08, 0.08, cx - 1.8, Y0 + 1.05, zf + 1.5, 0x6b4526);
  steps(b, cx - 0.6, zf + 1.7, 1.2, 1, 0x7a5230);
  door(b, cx - 0.6, Y0 + 0.3, zf, 0x5a3a22, 0.9, 1.8, 0x6b4526);
  win(b, cx + 1.3, Y0 + 1.1, zf, 1.0, 0.9, { frame: 0x6b4526, glass: 0xf2d27a });
  win(b, cx, Y0 + 1.0, cz - d / 2, 1.0, 0.9, { back: true, frame: 0x6b4526 });
  drive(b, 4.9, 2.4, -1.5, 0xcdb994);
  path(b, cx - 0.6, zf + 2.2, 3.7, zf + 4.2, 0.8, 0xcdb994);
  for (let i = 0; i < 4; i++) b.cyl(0.18, 0.18, 1.0, 2.2 + (i % 2) * 0.36, Y0 + Math.floor(i / 2) * 0.33, cz - 1, 0x8a5a33, 6); // حطب
}

// ---------- 2: Craftsman Bungalow ----------
function bungalow(b, v) {
  const wall = [0x8fa37a, 0xc9a36b, 0x7f97ad][v], roof = 0x5b4636, trim = 0xf0e6d2, pier = 0x8a7a6a;
  const cx = -1.1, cz = -3.2, w = 7, d = 5.6, h = 2.8, zf = cz + d / 2, pd = 2.2;
  b.box(w, h, d, cx, Y0, cz, wall);
  b.box(w + 0.06, 0.7, d + 0.06, cx, Y0, cz, pier);
  // سقف واحد بواجهة جملونية يغطي البيت والبرندة
  gableRoof(b, { len: d + pd + 0.3, h: 2.3, span: w, x: cx, y: Y0 + h, z: cz + pd / 2 + 0.1, roof, wall, ov: 0.7, alongZ: true });
  win(b, cx, Y0 + h + 0.55, zf + pd + 0.25, 1.2, 0.6, { frame: trim });
  b.box(w, 0.35, pd, cx, Y0, zf + pd / 2, 0xa39a8c);
  b.box(w + 0.2, 0.34, 0.34, cx, Y0 + h - 0.34, zf + pd - 0.15, trim);
  // الأعمدة الواضحة: قاعدة حجرية وعمود أبيض مسلوب
  for (const px of [-3.15, -1.15, 1.15, 3.15]) {
    b.box(0.72, 1.0, 0.72, cx + px, Y0 + 0.35, zf + pd - 0.4, pier);
    b.cyl(0.19, 0.3, 1.15, cx + px, Y0 + 1.35, zf + pd - 0.4, trim, 4);
  }
  steps(b, cx, zf + pd, 1.6, 2);
  door(b, cx, Y0 + 0.35, zf, [0x7a2e2a, 0x2f4a3a, 0x8a4b22][v], 1.0, 1.95, trim);
  win(b, cx - 2.2, Y0 + 1.1, zf, 1.3, 1.2, { frame: trim });
  win(b, cx + 2.2, Y0 + 1.1, zf, 1.3, 1.2, { frame: trim });
  win(b, cx - 1.8, Y0 + 1.0, cz - d / 2, 1.2, 1.1, { back: true, frame: trim });
  win(b, cx + 1.8, Y0 + 1.0, cz - d / 2, 1.2, 1.1, { back: true, frame: trim });
  winSide(b, cx + w / 2, Y0 + 1.0, cz, 1.2, 1.1, 1, { frame: trim });
  b.box(0.8, 1.6, 0.8, cx + 2, Y0 + h + 0.8, cz - 1, K.brick);
  drive(b, 5.3, 2.6, -3);
  path(b, cx, zf + pd + 0.7, cx, 10.6, 1.0);
  bush(b, cx - 2.6, zf + pd + 0.5); bush(b, cx + 2.6, zf + pd + 0.5);
}

// ---------- 3: Ranch House ----------
function ranch(b, v) {
  const wall = [0xdcc19a, 0xc9977a, 0xbcc6b2][v], roof = [0x6f5a4a, 0x4d4a48, 0x7a4a3a][v], base = 0xa8765a;
  const cx = -2.7, cz = -3.2, w = 9.4, d = 5, h = 2.5, zf = cz + d / 2;
  b.box(w, h, d, cx, Y0, cz, wall);
  b.box(w + 0.06, 0.75, d + 0.06, cx, Y0, cz, base);
  b.hip(w + 1.1, 1.45, d + 1.1, cx, Y0 + h, cz, roof);
  // الكراج الجانبي
  const gx = 4.55, gw = 4.7, gd = 6.2, gz = -2.6, gf = gz + gd / 2;
  b.box(gw, h, gd, gx, Y0, gz, wall);
  b.hip(gd + 1, 1.3, gw + 1, gx, Y0 + h, gz, roof, Math.PI / 2);
  b.box(3.7, 2.05, 0.1, gx, Y0, gf + 0.04, K.white);
  for (let i = 1; i < 4; i++) b.box(3.7, 0.04, 0.06, gx, Y0 + i * 0.5, gf + 0.1, 0xc9c5bb);
  drive(b, gx, 4.0, gf);
  door(b, cx + 2.6, Y0, zf, [0x2f5d7a, 0x7a2e2a, 0x3a3a3a][v]);
  b.box(2.4, 0.12, 1.2, cx + 2.6, Y0, zf + 0.6, K.concrete);
  win(b, cx - 0.3, Y0 + 0.85, zf, 2.6, 1.3);
  b.box(0.08, 1.3, 0.12, cx - 0.3, Y0 + 0.85, zf + 0.09, K.white);
  win(b, cx - 3.3, Y0 + 1.0, zf, 1.3, 1.0, { shutters: base });
  for (const px of [-3, 0, 3]) win(b, cx + px, Y0 + 1.0, cz - d / 2, 1.2, 1.0, { back: true });
  winSide(b, cx - w / 2, Y0 + 1.0, cz, 1.2, 1.0, -1);
  b.box(1.6, 1.3, 0.9, cx - 1.5, Y0 + h + 0.5, cz, K.brick);
  path(b, cx + 2.6, zf + 1.2, 2.6, zf + 3, 0.9);
  for (const px of [-4, -2.3, -0.3]) bush(b, cx + px + 1, zf + 0.7, 0.5);
}

// ---------- 4: Cape Cod ----------
function capeCod(b, v) {
  const wall = [0xa9b8c4, 0xddd5c0, 0x8fa3a0][v], roof = 0x474c55, sh = [0x2b3a55, 0x2f4a3a, 0x7a2e2a][v];
  const cx = -1.2, cz = -2.9, w = 7.6, d = 5.4, h = 2.7, zf = cz + d / 2, H = 3.5, ov = 0.45;
  b.box(w, h, d, cx, Y0, cz, wall);
  gableRoof(b, { len: w + 0.5, h: H, span: d, x: cx, y: Y0 + h, z: cz, roof, wall, ov });
  // نوافذ بارزة من السقف (dormers) في الواجهة والخلف
  for (const s of [1, -1]) for (const px of [-2, 2]) {
    b.box(1.3, 1.35, 1.7, cx + px, Y0 + h + 0.95, cz + s * 1.0, wall);
    b.gable(1.9, 0.65, 1.7, cx + px, Y0 + h + 2.3, cz + s * 1.05, roof, Math.PI / 2);
    win(b, cx + px, Y0 + h + 1.2, cz + s * 1.85, 0.75, 0.85, { back: s < 0 });
  }
  b.box(1.0, 1.5, 1.0, cx, Y0 + h + H - 0.6, cz, K.brick);
  door(b, cx, Y0 + 0.15, zf, sh);
  steps(b, cx, zf, 1.6, 1);
  for (const px of [-2.6, 2.6]) win(b, cx + px, Y0 + 0.95, zf, 1.0, 1.25, { shutters: sh });
  for (const px of [-2.4, 0, 2.4]) win(b, cx + px, Y0 + 0.95, cz - d / 2, 1.0, 1.2, { back: true });
  winSide(b, cx + w / 2 + 0.25, Y0 + 3.4, cz, 0.8, 0.9, 1);
  winSide(b, cx - w / 2 - 0.25, Y0 + 3.4, cz, 0.8, 0.9, -1);
  drive(b, 5.35, 2.6, -3.5);
  path(b, cx, zf + 0.4, cx, 10.6, 1.0);
  // سياج أبيض قصير
  for (let i = 0; i < 7; i++) b.box(0.12, 0.6, 0.12, cx - 4.4 + i * 0.5, Y0, 8.2, K.white);
  b.box(3.2, 0.08, 0.08, cx - 2.9, Y0 + 0.38, 8.2, K.white);
  bush(b, cx - 1.3, zf + 0.6, 0.45); bush(b, cx + 1.3, zf + 0.6, 0.45);
}

// ---------- 5: Split-Level ----------
function splitLevel(b, v) {
  const siding = [0xe3d3a1, 0xb7c7d6, 0xd9bca6][v], brick = 0xa65e44, roof = 0x5a5148;
  // الكتلة العالية (يسار): نصف طابق سفلي طوب + علوي ألواح
  const tx = -3.7, tz = -3, tw = 5.6, td = 6.2, tf = tz + td / 2;
  b.box(tw, 2.4, td, tx, Y0, tz, brick);
  b.box(tw + 0.35, 2.7, td + 0.35, tx, Y0 + 2.4, tz, siding);
  gableRoof(b, { len: tw + 0.9, h: 1.5, span: td + 0.35, x: tx, y: Y0 + 5.1, z: tz, roof, wall: siding });
  b.box(3.3, 1.95, 0.1, tx, Y0, tf + 0.04, K.white);
  for (let i = 1; i < 4; i++) b.box(3.3, 0.04, 0.06, tx, Y0 + i * 0.48, tf + 0.1, 0xc9c5bb);
  win(b, tx - 1.3, Y0 + 3.2, tf + 0.17, 1.5, 1.2);
  win(b, tx + 1.3, Y0 + 3.2, tf + 0.17, 1.5, 1.2);
  win(b, tx - 1.3, Y0 + 3.2, tz - td / 2 - 0.17, 1.4, 1.2, { back: true });
  win(b, tx + 1.3, Y0 + 3.2, tz - td / 2 - 0.17, 1.4, 1.2, { back: true });
  winSide(b, tx - tw / 2 - 0.17, Y0 + 3.2, tz, 1.3, 1.2, -1);
  // الكتلة المنخفضة (يمين) على منسوب متوسط
  const lx = 2.0, lz = -3.3, lw = 5.8, ld = 5.4, lf = lz + ld / 2;
  b.box(lw, 0.9, ld, lx, Y0, lz, brick);
  b.box(lw, 2.5, ld, lx, Y0 + 0.9, lz, siding);
  gableRoof(b, { len: lw + 0.6, h: 1.4, span: ld, x: lx + 0.1, y: Y0 + 3.4, z: lz, roof, wall: siding });
  win(b, lx + 1.1, Y0 + 1.75, lf, 2.6, 1.3);
  b.box(0.08, 1.3, 0.12, lx + 1.1, Y0 + 1.75, lf + 0.09, K.white);
  win(b, lx + 1, Y0 + 1.8, lz - ld / 2, 2.2, 1.2, { back: true });
  winSide(b, lx + lw / 2, Y0 + 1.8, lz, 1.3, 1.2, 1);
  // المدخل في المنتصف مع درج
  const ex = -0.15;
  door(b, ex, Y0 + 0.9, lf, [0x7a2e2a, 0x2b3a55, 0x2f4a3a][v]);
  b.box(1.9, 0.9, 1.2, ex, Y0, lf + 0.6, K.concrete);
  for (let i = 0; i < 4; i++) b.box(1.5, 0.9 - (i + 1) * 0.2, 0.32, ex, Y0, lf + 1.36 + i * 0.32, K.concrete);
  b.slab(2.3, 0.12, 1.6, ex, Y0 + 3.2, lf + 0.7, roof, { rx: 0.12 });
  for (const px of [-0.85, 0.85]) b.box(0.1, 2.2, 0.1, ex + px, Y0 + 0.9, lf + 1.1, K.dark);
  b.box(0.9, 1.6, 0.9, lx + 1.6, Y0 + 4, lz - 0.5, brick);
  drive(b, tx, 3.6, tf);
  path(b, ex, lf + 2.6, ex, 10.6, 1.0);
  bush(b, lx + 0.8, lf + 0.6, 0.5); bush(b, lx + 2.2, lf + 0.6, 0.5);
}

// ---------- 6: Colonial ----------
function colonial(b, v) {
  const brick = [0x9c4a3a, 0x8b4034, 0xa5553f][v], roof = 0x3a3f47, sh = [0x1f2a30, 0x23402f, 0x1f2a30][v];
  const cx = -1.4, cz = -3.1, w = 8.6, d = 5.4, h = 5.7, zf = cz + d / 2;
  b.box(w, h, d, cx, Y0, cz, brick);
  for (let i = 1; i < 9; i++) b.box(w + 0.04, 0.045, d + 0.04, cx, Y0 + i * 0.63, cz, 0xb8705f); // فواصل الطوب
  b.box(w + 0.35, 0.28, d + 0.35, cx, Y0 + h - 0.1, cz, K.white);
  gableRoof(b, { len: w + 0.5, h: 2.3, span: d, x: cx, y: Y0 + h + 0.18, z: cz, roof, wall: brick });
  for (const s of [-1, 1]) b.box(0.9, h + 3.1, 1.1, cx + s * (w / 2 - 0.35), Y0, cz, 0x8b4034);
  // نوافذ متناظرة: خمس فوق وأربع تحت مع الباب في المنتصف
  for (const px of [-3.1, -1.55, 0, 1.55, 3.1]) {
    win(b, cx + px, Y0 + 3.55, zf, 0.8, 1.3, { shutters: sh });
    win(b, cx + px, Y0 + 3.55, cz - d / 2, 0.8, 1.3, { back: true });
    if (px) {
      win(b, cx + px, Y0 + 0.85, zf, 0.8, 1.4, { shutters: sh });
      win(b, cx + px, Y0 + 0.85, cz - d / 2, 0.8, 1.4, { back: true });
    }
  }
  door(b, cx, Y0 + 0.3, zf, sh, 1.0, 2.0);
  b.box(2.6, 0.3, 1.3, cx, Y0, zf + 0.65, K.concrete);
  for (const px of [-1, 1]) b.cyl(0.13, 0.13, 2.3, cx + px, Y0 + 0.3, zf + 1.1, K.white, 8);
  b.box(2.6, 0.22, 1.3, cx, Y0 + 2.6, zf + 0.65, K.white);
  b.gable(1.3, 0.6, 2.6, cx, Y0 + 2.82, zf + 0.65, K.white, Math.PI / 2);
  steps(b, cx, zf + 1.3, 1.8, 1);
  drive(b, 5.4, 2.7, -4);
  path(b, cx, zf + 1.7, cx, 10.6, 1.1, 0xc98a72);
  for (const px of [-3.4, -2, 2, 3.4]) bush(b, cx + px, zf + 0.6, 0.48, 0x2f7a3b);
}

// ---------- 7: Modern Farmhouse ----------
function farmhouse(b, v) {
  const white = 0xf7f5ef, roof = 0x2b2e33, black = 0x1e2023, wd = [0xb5763a, 0x2b2e33, 0x8a3a2e][v];
  const W = { frame: black };
  // كتلة رئيسية بواجهة جملونية
  const mx = -3.1, mz = -3.3, mw = 5.2, md = 7, mh = 5.3, mf = mz + md / 2;
  b.box(mw, mh, md, mx, Y0, mz, white);
  for (let i = 0; i < 6; i++) b.box(0.07, mh, 0.05, mx - mw / 2 + 0.45 + i * 0.86, Y0, mf + 0.02, 0xdedbd2);
  gableRoof(b, { len: md + 0.6, h: 2.7, span: mw, x: mx, y: Y0 + mh, z: mz, roof, wall: white, alongZ: true });
  win(b, mx, Y0 + 3.3, mf, 1.9, 1.5, W);
  b.box(0.07, 1.5, 0.12, mx, Y0 + 3.3, mf + 0.09, black);
  win(b, mx, Y0 + mh + 0.7, mf + 0.33, 0.7, 0.7, W);
  win(b, mx - 1.3, Y0 + 1.0, mf, 1.0, 1.4, W);
  door(b, mx + 1.1, Y0 + 0.3, mf, wd, 1.05, 2.05, black);
  win(b, mx, Y0 + 3.3, mz - md / 2, 1.6, 1.4, { back: true, ...W });
  win(b, mx, Y0 + 0.9, mz - md / 2, 1.6, 1.4, { back: true, ...W });
  winSide(b, mx - mw / 2, Y0 + 3.3, mz, 1.3, 1.4, -1, W);
  winSide(b, mx - mw / 2, Y0 + 0.9, mz, 1.3, 1.4, -1, W);
  // جناح جانبي
  const sx = 2.3, sz = -3.8, sw = 5.6, sd = 5, shh = 3.2, sf = sz + sd / 2;
  b.box(sw, shh, sd, sx, Y0, sz, white);
  gableRoof(b, { len: sw + 0.5, h: 2.0, span: sd, x: sx + 0.1, y: Y0 + shh, z: sz, roof, wall: white });
  for (const px of [-1.4, 1.2]) win(b, sx + px, Y0 + 1.0, sf, 1.1, 1.4, W);
  for (const px of [-1.4, 1.2]) win(b, sx + px, Y0 + 1.0, sz - sd / 2, 1.1, 1.4, { back: true, ...W });
  winSide(b, sx + sw / 2, Y0 + 1.0, sz, 1.3, 1.4, 1, W);
  b.box(1.4, 1.2, 1.5, sx + 0.3, Y0 + shh + 0.6, sf - 1.2, white);
  b.slab(1.8, 0.1, 1.9, sx + 0.3, Y0 + shh + 1.9, sf - 1.1, roof, { rx: 0.2 });
  win(b, sx + 0.3, Y0 + shh + 0.85, sf - 0.45, 0.9, 0.7, W);
  // البرندة الممتدة على كامل الواجهة بسقف معدني داكن
  const pz = mf + 1.9;
  b.box(mw, 0.3, 1.9, mx, Y0, mf + 0.95, 0x9a8f80);
  b.box(sw, 0.3, pz - sf, sx, Y0, (pz + sf) / 2, 0x9a8f80);
  b.slab(mw + 0.3, 0.12, 2.3, mx, Y0 + 2.75, mf + 1.05, roof, { rx: 0.16 });
  b.slab(sw + 0.3, 0.12, pz - sf + 0.4, sx + 0.1, Y0 + 2.68, (pz + sf) / 2 + 0.1, roof, { rx: 0.1 });
  for (const px of [-5.5, -3.4, -1.3, 0.8, 2.9, 4.9]) b.box(0.16, 2.3, 0.16, px, Y0 + 0.3, pz - 0.2, black);
  steps(b, mx + 1.1, pz, 1.8, 1);
  drive(b, 6.4, 2.1, -5);
  path(b, mx + 1.1, pz + 0.4, mx + 1.1, 10.6, 1.0);
  bush(b, -6.4, pz + 0.5, 0.5); bush(b, 5.6, pz + 0.5, 0.5);
}

// ---------- 8: Victorian ----------
function victorian(b, v) {
  const wall = [0x5f8f8a, 0x8a6fa8, 0xc9706f][v], trim = 0xf3ead7, roof = 0x3b3540, acc = [0x8a3a4a, 0x3d6a6a, 0x3a4a6a][v];
  const W = { frame: trim };
  const cx = -0.3, cz = -3.6, w = 6, d = 6, h = 6, zf = cz + d / 2;
  b.box(w, h, d, cx, Y0, cz, wall);
  b.box(w + 0.12, 0.2, d + 0.12, cx, Y0 + 3, cz, trim);
  gableRoof(b, { len: d + 0.5, h: 3.3, span: w, x: cx, y: Y0 + h, z: cz, roof, wall, alongZ: true, ov: 0.4 });
  gableRoof(b, { len: w + 0.9, h: 2.5, span: d * 0.62, x: cx, y: Y0 + h, z: cz - 0.2, roof, wall, ov: 0.3 });
  b.cyl(0.42, 0.42, 0.1, cx + 0.6, Y0 + h + 1.1, zf + 0.25, trim, 12).box(0.01, 0.01, 0.01, 0, 0, 0, trim);
  // البرج الدائري عند الزاوية
  const tx = cx - w / 2 + 0.2, tz = zf - 0.2, tr = 1.65, th = 8;
  b.cyl(tr, tr, th, tx, Y0, tz, wall, 14);
  for (const ty of [3, 5.9, th - 0.12]) b.cyl(tr + 0.1, tr + 0.1, 0.2, tx, Y0 + ty, tz, trim, 14);
  b.cyl(0.05, tr + 0.45, 3.4, tx, Y0 + th, tz, acc, 14);
  b.cyl(0.05, 0.05, 0.8, tx, Y0 + th + 3.3, tz, K.gold, 6);
  b.ball(0.16, tx, Y0 + th + 4.15, tz, K.gold);
  for (const ang of [0, -0.95, 0.95]) for (const ty of [0.9, 3.7, 6.3]) {
    const o = { x: tx + Math.sin(ang) * (tr + 0.02), z: tz + Math.cos(ang) * (tr + 0.02), ry: ang };
    b.add(new THREE.BoxGeometry(0.72, 1.42, 0.1), trim, { ...o, y: Y0 + ty + 0.6 });
    b.add(new THREE.BoxGeometry(0.5, 1.2, 0.16), K.glass, { ...o, y: Y0 + ty + 0.6 });
  }
  // شرفة تلتف حول الواجهة والجانب الأيمن
  const px0 = tx + tr - 0.1, px1 = cx + w / 2 + 1.7, pz = zf + 1.7;
  b.box(px1 - px0, 0.35, 1.7, (px0 + px1) / 2, Y0, zf + 0.85, 0xb9ae9e);
  b.box(1.7, 0.35, 4.4, px1 - 0.85, Y0, zf - 2.2, 0xb9ae9e);
  b.slab(px1 - px0 + 0.3, 0.12, 2.1, (px0 + px1) / 2, Y0 + 2.85, zf + 0.95, acc, { rx: 0.17 });
  b.slab(2.1, 0.12, 4.7, px1 - 0.9, Y0 + 2.85, zf - 2.2, acc, { rz: -0.17 });
  const posts = [[px0 + 0.5, pz - 0.2], [px0 + 2.2, pz - 0.2], [px0 + 3.9, pz - 0.2], [px1 - 0.2, pz - 0.2], [px1 - 0.2, zf - 1.4], [px1 - 0.2, zf - 2.9], [px1 - 0.2, zf - 4.3]];
  for (const [x, z] of posts) {
    b.box(0.15, 2.35, 0.15, x, Y0 + 0.35, z, trim);
    b.box(0.5, 0.14, 0.5, x, Y0 + 2.5, z, trim);
  }
  b.box(px1 - px0 - 1.6, 0.07, 0.07, (px0 + px1) / 2 + 0.8, Y0 + 1.15, pz - 0.2, trim);
  b.box(0.07, 0.07, 4.2, px1 - 0.2, Y0 + 1.15, zf - 2.3, trim);
  steps(b, cx - 0.3, pz, 1.5, 2);
  door(b, cx - 0.3, Y0 + 0.35, zf, acc, 0.95, 2.05, trim);
  win(b, cx + 1.7, Y0 + 1.0, zf, 0.8, 1.6, W);
  for (const px of [-0.2, 1.5]) win(b, cx + px, Y0 + 3.8, zf, 0.75, 1.6, W);
  for (const px of [-1.6, 1.6]) for (const ty of [1.0, 3.8]) win(b, cx + px, Y0 + ty, cz - d / 2, 0.8, 1.6, { back: true, ...W });
  for (const ty of [1.0, 3.8]) winSide(b, cx - w / 2, Y0 + ty, cz - 1, 0.8, 1.6, -1, W);
  winSide(b, cx + w / 2, Y0 + 3.8, cz, 0.8, 1.6, 1, W);
  b.box(0.8, 3, 0.8, cx + 1.8, Y0 + h + 0.6, cz - 1.6, K.brick);
  drive(b, 6.2, 2.3, -4);
  path(b, cx - 0.3, pz + 0.7, cx - 0.3, 10.6, 1.0, 0xc9b9a6);
  bush(b, cx + 1.2, pz + 0.5, 0.5, 0xc65a8a); bush(b, cx + 2.4, pz + 0.5, 0.45, 0xe0a13c);
}

// ---------- 9: Mid-Century Modern ----------
function midCentury(b, v) {
  const stucco = 0xf2efe6, wood = [0xb07a45, 0x8c5a34, 0xc48a52][v], fascia = 0x2f3236, glass = 0x8fd0e8, acc = [0xe07a3a, 0x2f8a8a, 0xd9b23c][v];
  const cx = -1.0, cz = -4.9, w = 8.4, d = 4.6, h = 2.7, zf = cz + d / 2;
  b.box(w, h, d, cx, Y0, cz, stucco);
  // واجهة زجاجية من الأرض للسقف
  const gx = cx - 1.3, gw = 5.4;
  b.box(gw, 2.35, 0.14, gx, Y0 + 0.1, zf + 0.05, glass);
  for (let i = 0; i <= 5; i++) b.box(0.09, 2.45, 0.2, gx - gw / 2 + i * (gw / 5), Y0 + 0.05, zf + 0.07, fascia);
  b.box(gw + 0.1, 0.09, 0.2, gx, Y0 + 1.3, zf + 0.07, fascia);
  b.box(2.6, h, 0.16, cx + 2.9, Y0, zf + 0.06, wood);
  door(b, cx + 2.6, Y0, zf + 0.1, acc, 1.0, 2.1, fascia);
  // سقف منخفض مائل ببروز كبير
  b.slab(w + 2.6, 0.16, d + 2.6, cx, Y0 + h + 0.42, cz + 0.3, fascia, { rz: 0.06 });
  b.slab(w + 2.8, 0.14, d + 2.8, cx, Y0 + h + 0.56, cz + 0.3, 0xe9e6df, { rz: 0.06 });
  b.box(1.4, 4.3, 1.8, cx - 3.0, Y0, cz - 0.3, 0x9a938a);
  win(b, cx - 1.5, Y0 + 1.5, cz - d / 2, 3.0, 0.7, { back: true, frame: fascia, glass });
  win(b, cx + 2, Y0 + 1.5, cz - d / 2, 2.0, 0.7, { back: true, frame: fascia, glass });
  winSide(b, cx - w / 2, Y0 + 0.4, cz + 1, 1.6, 2.0, -1, { frame: fascia, glass });
  // مظلة سيارات
  const kx = 5.45;
  b.slab(3.9, 0.16, 5.8, kx, Y0 + 2.75, cz + 0.6, 0xe9e6df);
  b.slab(3.7, 0.12, 5.6, kx, Y0 + 2.62, cz + 0.6, fascia);
  for (const z of [cz - 1.8, cz + 3.1]) b.box(0.12, 2.6, 0.12, kx + 1.7, Y0, z, fascia);
  b.box(0.14, 2.6, 2.6, kx - 1.75, Y0, cz + 2.4, wood);
  drive(b, kx, 3.5, cz - 2.2);
  // فناء ومسبح
  b.box(8.6, 0.05, 2.2, cx - 0.1, Y0, zf + 1.1, 0xe2ddd2);
  const pxc = -3.4, pzc = 1.9;
  b.box(5.6, 0.14, 3.5, pxc, Y0, pzc, 0xf1ede4);
  b.box(4.8, 0.16, 2.7, pxc, Y0, pzc, K.water);
  b.box(4.8, 0.17, 0.5, pxc, Y0, pzc - 0.6, 0x6fd0ee);
  for (const dx of [0, 1.3]) {
    b.box(0.7, 0.2, 1.7, 0.6 + dx, Y0 + 0.12, pzc, K.white);
    b.slab(0.7, 0.1, 0.7, 0.6 + dx, Y0 + 0.48, pzc - 0.75, acc, { rx: -0.7 });
  }
  b.cyl(0.05, 0.05, 2.1, 2.9, Y0, pzc - 1.2, K.white, 6);
  b.cyl(0.1, 1.2, 0.45, 2.9, Y0 + 2.0, pzc - 1.2, acc, 8);
  path(b, cx + 2.6, zf + 2.2, cx + 2.6, 10.6, 1.0, 0xe2ddd2);
  for (let i = 0; i < 4; i++) b.cyl(0.02, 0.32, 0.9, -6.6 + i * 0.01, Y0, -0.6 + i * 0.001, 0x4a9a52, 5);
  bush(b, 2.6 + 1.2, 4.6, 0.5, 0x4a9a52);
}

// ---------- 10: القصر ----------
function mansion(b, v) {
  const stone = [0xeadfc8, 0xe8ded2, 0xf0e3c4][v], roof = [0x44556b, 0x3d4a4a, 0x5a4658][v], white = 0xfaf8f2, base = 0xcfc3aa;
  const W = { frame: white };
  const cz = -5.3, cw = 6.4, cd = 6, ch = 6.6, cf = cz + cd / 2;
  // الكتلة الوسطى
  b.box(cw, ch, cd, 0, Y0, cz, stone);
  b.box(cw + 0.1, 0.7, cd + 0.1, 0, Y0, cz, base);
  b.box(cw + 0.4, 0.32, cd + 0.4, 0, Y0 + ch - 0.1, cz, white);
  b.hip(cw + 1, 2.5, cd + 1, 0, Y0 + ch + 0.22, cz, roof);
  b.box(1.6, 0.14, 0.5, 0, Y0 + ch + 2.7, cz, K.gold);
  // الجناحان
  const wx = 5.33, ww = 4.3, wd = 5, wh = 4.7, wz = -5.5, wf = wz + wd / 2;
  for (const s of [-1, 1]) {
    b.box(ww, wh, wd, s * wx, Y0, wz, stone);
    b.box(ww + 0.1, 0.7, wd + 0.1, s * wx, Y0, wz, base);
    b.box(ww + 0.35, 0.28, wd + 0.35, s * wx, Y0 + wh - 0.1, wz, white);
    b.hip(wd + 0.9, 1.9, ww + 0.9, s * wx, Y0 + wh + 0.18, wz, roof, Math.PI / 2);
    for (const px of [-1, 1]) for (const ty of [1.0, 3.0]) {
      win(b, s * wx + px, Y0 + ty, wf, 0.85, 1.25, W);
      win(b, s * wx + px, Y0 + ty, wz - wd / 2, 0.85, 1.25, { back: true, ...W });
    }
    for (const ty of [1.0, 3.0]) winSide(b, s * (wx + ww / 2), Y0 + ty, wz, 1.0, 1.25, s, W);
    b.box(0.8, 2.4, 0.8, s * (cw / 2 - 0.9), Y0 + ch + 0.8, cz - 1.2, stone);
    b.box(3.6, 0.7, 0.7, s * wx, Y0, wf + 0.55, 0x2f7a3b); // سياج نباتي
    b.cyl(0.05, 0.5, 1.5, s * 3.3, Y0, cf + 1.0, 0x2f7a3b, 8);
  }
  // رواق بأعمدة عالية ومثلث علوي
  const pz = cf + 0.95, pw = 5.6;
  b.box(pw, 0.4, 1.9, 0, Y0, pz, base);
  for (const px of [-2.4, -0.95, 0.95, 2.4]) {
    b.box(0.6, 0.2, 0.6, px, Y0 + 0.4, pz + 0.55, white);
    b.cyl(0.24, 0.28, 4.6, px, Y0 + 0.6, pz + 0.55, white, 10);
    b.box(0.6, 0.2, 0.6, px, Y0 + 5.2, pz + 0.55, white);
  }
  b.box(pw, 0.55, 1.9, 0, Y0 + 5.4, pz, white);
  b.gable(1.9, 1.35, pw, 0, Y0 + 5.95, pz, white, Math.PI / 2);
  b.cyl(0.3, 0.3, 0.1, 0, Y0 + 6.2, pz + 0.96, K.gold, 10).box(0.01, 0.01, 0.01, 0, 0, 0, white);
  door(b, 0, Y0 + 0.4, cf, 0x5a3520, 1.5, 2.6, white);
  b.box(0.06, 2.6, 0.12, 0, Y0 + 0.4, cf + 0.1, 0x3a2214);
  for (const px of [-2.2, 2.2]) win(b, px, Y0 + 1.0, cf, 0.9, 1.7, W);
  for (const px of [-2.2, 0, 2.2]) win(b, px, Y0 + 3.9, cf, 0.9, 1.6, W);
  for (const px of [-2.2, 0, 2.2]) for (const ty of [1.0, 3.9]) win(b, px, Y0 + ty, cz - cd / 2, 0.9, 1.6, { back: true, ...W });
  for (let i = 0; i < 3; i++) b.box(pw - 0.6 + i * 0.5, 0.4 - (i + 1) * 0.12, 0.35, 0, Y0, pz + 1.12 + i * 0.35, base);
  // ممر السيارات الدائري والنافورة
  const fz = 3.9, pave = 0xd9d2c2;
  b.cyl(3.9, 3.9, 0.05, 0, Y0, fz, pave, 32);
  b.cyl(2.5, 2.5, 0.08, 0, Y0, fz, K.grass, 28);
  b.box(3.2, 0.05, 2.2, 0, Y0, fz - 3.9 + 0.2, pave);
  for (const s of [-1, 1]) b.box(2.3, 0.05, 4.6, s * 2.6, Y0, 8.3, pave);
  b.cyl(1.55, 1.65, 0.5, 0, Y0, fz, 0xd6d0c4, 18);
  b.cyl(1.35, 1.35, 0.08, 0, Y0 + 0.46, fz, K.water, 18);
  b.cyl(0.2, 0.3, 1.3, 0, Y0 + 0.4, fz, 0xd6d0c4, 8);
  b.cyl(0.85, 0.3, 0.3, 0, Y0 + 1.6, fz, 0xd6d0c4, 12);
  b.cyl(0.72, 0.72, 0.06, 0, Y0 + 1.88, fz, K.water, 12);
  b.cyl(0.03, 0.14, 0.9, 0, Y0 + 1.9, fz, 0xbfeaf8, 6);
  b.ball(0.14, 0, Y0 + 2.85, fz, K.gold);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    bush(b, Math.sin(a) * 2.05, fz + Math.cos(a) * 2.05, 0.3, i % 2 ? 0xd9567a : 0xf0c23c);
  }
  // أعمدة إنارة عند المدخلين
  for (const s of [-1, 1]) {
    b.cyl(0.07, 0.09, 1.9, s * 4.3, Y0, 8.4, K.dark, 6);
    b.ball(0.24, s * 4.3, Y0 + 2.05, 8.4, 0xfff0b8);
  }
}

// ---------- عمارة الموج: فلل حديثة بأسقف مسطحة (النسخة 3 من كل لفل) ----------
// كل شي عالي (أكثر من 2.3م) يبقى في z ≤ 3 عشان نقطة الخروج ومكان السيارة قدام البيت تبقى فاضية.
export const MOUJ_NAMES = ['', 'استوديو شاطئي', 'فيلا المظلة', 'فيلا الفناء', 'فيلا الطابقين', 'فيلا المسبح', 'فيلا التراس', 'فيلا الخشب', 'فيلا الأجنحة', 'فيلا البنتهاوس', 'قصر الموج'];
const M = { white: 0xf6f3ec, sand: 0xe6d6b6, beige: 0xd8c29c, wood: 0xa8743f, glass: 0x6fb0d4, frame: 0x3a3f44, pool: 0x3cc6ea, deck: 0xcfae80, pave: 0xe4ddcf, green: 0x6dbb52 };
function mBox(b, w, h, d, x, y, z, color) { b.box(w, h, d, x, y, z, color); b.box(w + 0.2, 0.22, d + 0.2, x, y + h - 0.02, z, M.white); } // كتلة بحافة سطح بيضاء
function glassWall(b, w, h, x, y, z) { b.box(w, h, 0.08, x, y, z + 0.05, M.glass); for (let i = 0; i <= Math.round(w / 1.4); i++) b.box(0.07, h, 0.1, x - w / 2 + (i * w) / Math.round(w / 1.4), y, z + 0.07, M.frame); }
function rail(b, w, x, y, z) { b.box(w, 0.9, 0.05, x, y, z, 0x9fd3ea); b.box(w, 0.06, 0.09, x, y + 0.9, z, M.frame); }
function louvers(b, w, h, x, y, z, n) { for (let i = 0; i < n; i++) b.box(0.12, h, 0.12, x - w / 2 + (i + 0.5) * (w / n), y, z, M.wood); }
function pool(b, w, d, x, z) { b.box(w + 1.2, 0.22, d + 1.2, x, Y0, z, M.deck); b.box(w, 0.06, d, x, Y0 + 0.2, z, M.pool); }
function palm(b, x, z, h = 4.2) {
  for (let i = 0; i < 7; i++) b.cyl(0.17 - i * 0.01, 0.2 - i * 0.01, h / 7, x + Math.sin(i * 0.5) * 0.06, Y0 + (i * h) / 7, z, i % 2 ? 0x8a6a42 : 0x7a5a36, 7);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; b.slab(0.34, 0.06, 2.0, x + Math.sin(a) * 0.9, Y0 + h + 0.1, z + Math.cos(a) * 0.9, i % 2 ? 0x3f8f45 : 0x57a84e, { rx: -0.42, ry: a }); }
}
function moujBase(b, driveX = 4.2) {
  drive(b, driveX, 3, 4, M.pave);
  path(b, -1, 3, -1, 10.6, 1.1, M.pave);
  b.box(15, 0.5, 0.3, 0, Y0, -8.8, M.sand); // سور خلفي منخفض
}
function moujVilla(b, level) {
  const W = M.white, S = M.sand, B = M.beige;
  moujBase(b, level >= 7 ? 4.6 : 4.2);
  const F1 = Y0, h1 = 3.2, h2 = 3.0;
  if (level === 1) {
    mBox(b, 6, h1, 5, -1, F1, -1.5, W); glassWall(b, 3.4, 2.2, -1.6, F1 + 0.3, 1.0); door(b, 1.3, F1, 1.0, M.wood, 0.9, 2.2, M.frame);
    palm(b, -5.6, -3, 3.4);
  } else if (level === 2) {
    mBox(b, 7, h1, 6, -1.2, F1, -2, W); glassWall(b, 4, 2.3, -2, F1 + 0.3, 1.0); door(b, 1.5, F1, 1.0, M.wood, 1, 2.3, M.frame);
    b.box(9, 0.18, 3.2, -0.8, F1 + 3.0, 2.4, M.wood); for (const x of [-4.8, 3.2]) b.box(0.18, 3.0, 0.18, x, F1, 3.8, M.frame);
    b.box(1.2, 0.7, 1.2, -5, F1, 3.6, S); b.ball(0.7, -5, F1 + 1.1, 3.6, M.green);
    palm(b, -6, -5, 3.8);
  } else if (level === 3) {
    mBox(b, 5.5, h1, 6, -3.5, F1, -2, W); mBox(b, 5, h1 - 0.4, 7, 2.6, F1, -2.5, S);
    glassWall(b, 3.6, 2.3, -3.5, F1 + 0.3, 1.0); door(b, 2.6, F1, 1.0, M.wood, 1.1, 2.3, M.frame);
    louvers(b, 2, 2.2, 4.1, F1 + 0.3, 1.1, 6);
    b.box(3.6, 0.05, 3, -0.4, F1, -6.6, M.green); palm(b, -0.4, -6.6, 4);
  } else if (level === 4) {
    mBox(b, 9, h1, 7, -0.8, F1, -2.5, S); mBox(b, 7, h2, 6, -1.6, F1 + h1, -3, W);
    glassWall(b, 5, 2.4, -2.2, F1 + 0.3, 1.0); door(b, 2.4, F1, 1.0, M.wood, 1.1, 2.4, M.frame);
    glassWall(b, 5, 2.2, -1.6, F1 + h1 + 0.3, 0.0); b.box(7, 0.2, 1.4, -1.6, F1 + h1, 0.7, W); rail(b, 7, -1.6, F1 + h1 + 0.2, 1.35);
    palm(b, 5.6, -4, 4.4); palm(b, -6.4, -6, 3.8);
  } else if (level === 5) {
    mBox(b, 9, h1, 7, 0.4, F1, -3, W); mBox(b, 6.5, h2, 6, 1.4, F1 + h1, -3.5, S);
    glassWall(b, 5.5, 2.4, 0.2, F1 + 0.3, 0.5); door(b, 3.6, F1, 0.5, M.wood, 1.1, 2.4, M.frame);
    louvers(b, 6.5, 2.4, 1.4, F1 + h1 + 0.3, -0.4, 14);
    pool(b, 4.2, 2.6, -4.4, 3.4); palm(b, -6.3, -5.5, 4.4); palm(b, 6.5, 1.8, 3.8);
  } else if (level === 6) {
    mBox(b, 10, h1, 6, 0, F1, -4.5, W); mBox(b, 4.5, h1, 5, 3.4, F1, 0.4, B); mBox(b, 6, h2, 6, -2, F1 + h1, -4.5, S);
    glassWall(b, 5, 2.4, -2.4, F1 + 0.3, -1.5); door(b, 3.4, F1, 2.9, M.wood, 1.1, 2.4, M.frame);
    // تراس بمظلة خشب فوق الجناح
    rail(b, 4.5, 3.4, F1 + h1 + 0.2, 2.9); for (let i = 0; i < 6; i++) b.box(4.5, 0.12, 0.14, 3.4, F1 + h1 + 2.3, -1.6 + i * 0.8, M.wood);
    for (const x of [1.3, 5.5]) b.box(0.14, 2.3, 0.14, x, F1 + h1, 2.6, M.frame);
    pool(b, 4.6, 2.4, -3.8, 2.2); palm(b, -6.4, -1.5, 4.6); palm(b, -6.4, -7.2, 4.0);
  } else if (level === 7) {
    mBox(b, 11, h1, 7, -0.5, F1, -4, S); mBox(b, 10, h2, 6.6, 0.2, F1 + h1, -3.2, W);
    glassWall(b, 6, 2.4, -1.6, F1 + 0.3, -0.5); door(b, 3.4, F1, -0.5, M.wood, 1.2, 2.5, M.frame);
    louvers(b, 10, h2 - 0.2, 0.2, F1 + h1 + 0.1, 0.25, 22); // واجهة علوية خشب بارزة
    b.box(5.2, 0.2, 4.6, 4.6, F1 + 2.7, 3.1, W); for (const x of [2.3, 6.9]) b.box(0.16, 2.7, 0.16, x, F1, 5.2, M.frame); // مظلة سيارة
    pool(b, 5.2, 2.6, -3.8, 3.2); palm(b, -6.5, -7, 4.6); palm(b, 6.6, -7, 4.2);
  } else if (level === 8) {
    mBox(b, 8.5, h1, 7.5, -2.8, F1, -4, W); mBox(b, 7.5, h2, 7, -2.8, F1 + h1, -4.3, S); mBox(b, 5, h1, 8, 4.6, F1, -3.4, B);
    glassWall(b, 6, 2.4, -2.8, F1 + 0.3, -0.2); door(b, 4.6, F1, 0.65, M.wood, 1.3, 2.6, M.frame);
    glassWall(b, 6, 2.2, -2.8, F1 + h1 + 0.3, -0.75); rail(b, 5, 4.6, F1 + h1 + 0.2, 0.5);
    for (let i = 0; i < 4; i++) b.box(5, 0.1, 0.5, 4.6, F1 + h1 + 2.2, -6.4 + i * 1.6, 0xf2efe8); // مظلة السطح
    for (const x of [2.4, 6.8]) b.box(0.14, 2.2, 0.14, x, F1 + h1, -0.2, M.frame);
    pool(b, 6, 2.8, -2.6, 3.6); palm(b, -6.6, 1.2, 4.8); palm(b, -6.6, -7.4, 4.4); palm(b, 6.7, 1.6, 4.0);
  } else if (level === 9) {
    mBox(b, 13, h1, 8, 0, F1, -4.2, W); mBox(b, 12, h2, 7.4, -0.5, F1 + h1, -4.5, S); mBox(b, 6, 2.8, 5.5, -3, F1 + h1 + h2, -5.4, W);
    glassWall(b, 9, 2.4, -0.8, F1 + 0.3, -0.2); door(b, 5.0, F1, -0.2, M.wood, 1.3, 2.6, M.frame);
    glassWall(b, 9, 2.3, -0.5, F1 + h1 + 0.3, -0.8); rail(b, 12, -0.5, F1 + h1 + 0.2, -0.2);
    glassWall(b, 5, 2.1, -3, F1 + h1 + h2 + 0.3, -2.65); rail(b, 6, 3.2, F1 + h1 + h2 + 0.2, -1.2);
    louvers(b, 3, 2.3, 4.2, F1 + h1 + 0.3, -0.7, 8);
    pool(b, 9, 2.6, -1.5, 3.4); b.box(9, 0.3, 0.2, -1.5, Y0 + 0.1, 4.9, 0x9fd3ea); // حافة لا نهائية
    palm(b, -6.8, 1.6, 5); palm(b, 6.8, 1.6, 4.6); palm(b, -6.8, -8, 4.4);
  } else {
    // قصر الموج: ثلاث طوابق متدرجة، تراسات، مسبح كبير بسطح خشب، مدخل بمظلة
    mBox(b, 14, h1, 9, 0, F1, -4.4, W); mBox(b, 12.5, h2, 8, 0.4, F1 + h1, -4.8, S); mBox(b, 8, 2.9, 6, 1.6, F1 + h1 + h2, -5.6, W);
    glassWall(b, 10, 2.5, -0.6, F1 + 0.3, 0.1); door(b, 5.2, F1, 0.1, M.wood, 1.6, 2.8, M.frame);
    glassWall(b, 10, 2.3, 0.4, F1 + h1 + 0.3, -0.8); rail(b, 12.5, 0.4, F1 + h1 + 0.2, -0.3);
    glassWall(b, 7, 2.2, 1.6, F1 + h1 + h2 + 0.3, -2.6); rail(b, 8, 1.6, F1 + h1 + h2 + 0.2, -1.2);
    louvers(b, 4, 2.4, -5, F1 + h1 + 0.3, -0.75, 10);
    b.box(4.4, 0.25, 3.2, 5.2, F1 + 2.9, 1.9, M.wood); for (const x of [3.2, 7.2]) b.box(0.2, 2.9, 0.2, x, F1, 3.3, M.frame); // مظلة المدخل
    b.box(0.6, 0.12, 0.12, 5.2, F1 + 3.15, 3.5, K.gold);
    pool(b, 10, 3, -1.2, 4.2); b.box(10, 0.3, 0.2, -1.2, Y0 + 0.1, 5.85, 0x9fd3ea);
    for (const x of [-4, 1.6]) { b.box(1.6, 0.12, 0.7, x, Y0 + 0.22, 6.6, 0xffffff); } // كراسي المسبح
    palm(b, -7, 2.4, 5.2); palm(b, 7, 2.6, 5); palm(b, -7, -8.2, 4.8); palm(b, 7, -8.2, 4.6);
  }
}

const MODELS = [null, cabin, bungalow, ranch, capeCod, splitLevel, colonial, farmhouse, victorian, midCentury, mansion];
const cache = new Map();

// variant 0-2: البيوت العادية · variant 3: عمارة الموج
export function houseGeometry(level, variant = 0) {
  const key = level * 10 + variant;
  if (!cache.has(key)) {
    const b = new Builder();
    if (variant === 3) moujVilla(b, level); else MODELS[level](b, variant);
    cache.set(key, b.build());
  }
  return cache.get(key);
}

// قاعدة قطعة مسكونة: عشب + صندوق بريد + شجرة
export function ownedLotGeometry(lotW, lotD) {
  const b = new Builder();
  b.box(lotW, Y0, lotD, 0, 0, 0, K.grass);
  for (const [x, z, w, d] of [[-3, -6.5, 5, 3], [3.5, 5.5, 4, 3], [-4.5, 2, 3, 4]]) b.box(w, 0.012, d, x, Y0, z, 0x86cc62);
  // صندوق البريد عند الرصيف
  b.box(0.13, 0.95, 0.13, 0.75, Y0, lotD / 2 - 0.45, 0x6b4526);
  b.box(0.34, 0.28, 0.55, 0.75, Y0 + 0.95, lotD / 2 - 0.45, 0x2f4a6b);
  b.box(0.05, 0.3, 0.14, 0.95, Y0 + 1.05, lotD / 2 - 0.35, 0xd9342b);
  tree(b, -6.2, 6.7, 0.95);
  return b.build();
}

// أرض فاضية: تراب + أوتاد + لوحة
export function emptyLotGeometry(lotW, lotD) {
  const b = new Builder();
  b.box(lotW, 0.09, lotD, 0, 0, 0, 0xd2bc8c);
  for (const [x, z, w, d] of [[-2, -3, 6, 4], [3, 3, 5, 5], [-4, 5, 3, 3]]) b.box(w, 0.012, d, x, 0.09, z, 0xc4ab78);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.box(0.14, 0.7, 0.14, sx * (lotW / 2 - 0.4), 0.09, sz * (lotD / 2 - 0.4), 0x8a6a42);
    b.box(0.18, 0.14, 0.18, sx * (lotW / 2 - 0.4), 0.79, sz * (lotD / 2 - 0.4), 0xf08a2a);
  }
  b.box(0.12, 1.5, 0.12, 0, 0.09, lotD / 2 - 2, 0x8a6a42);
  b.box(1.7, 0.95, 0.1, 0, 1.0, lotD / 2 - 2, 0xfdfbf5);
  b.box(1.7, 0.25, 0.12, 0, 1.7, lotD / 2 - 2, 0xd9342b);
  for (const [x, z] of [[-5, -5], [4, -6], [5, 0], [-3, 1], [-5.5, 6]]) b.cyl(0.02, 0.22, 0.4, x, 0.09, z, 0x9aa85a, 5);
  return b.build();
}

export function treeGeometry() {
  const b = new Builder();
  b.cyl(0.2, 0.3, 1.8, 0, 0, 0, K.trunk, 6);
  b.ball(1.6, 0, 2.9, 0, 0x3d8a45);
  b.ball(1.1, 0.6, 3.9, -0.3, 0x4f9f4c);
  return b.build();
}

export function pineGeometry() {
  const b = new Builder();
  b.cyl(0.18, 0.26, 1.2, 0, 0, 0, K.trunk, 6);
  b.cyl(0.05, 1.5, 2.2, 0, 1.0, 0, 0x2f6f47, 7);
  b.cyl(0.02, 1.1, 2.0, 0, 2.4, 0, 0x377a4d, 7);
  return b.build();
}
