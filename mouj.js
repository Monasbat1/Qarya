// رسم منطقة الموج (Low Poly بنفس أسلوب اللعبة) من بيانات lib/mouj.js.
// كل شي ثابت ينبني في هندسة وحدة (رسمة وحدة)، والتفاصيل الصغيرة (قوارب، مظلات، نخيل، إنارة)
// نماذج مشتركة InstancedMesh في مجموعة «detail» تختفي لما الكاميرا تبعد (أداء أحسن على الجوال).
import * as THREE from 'three';
import { Builder, treeGeometry } from './houses.js';

const C = {
  grass: 0x93d16c, sand: 0xf2e0b0, sandDark: 0xe6cf98, shallow: 0x7fd3e8, marina: 0x2f9fd1, lake: 0x45b6dc,
  quay: 0xe9e2d2, pave: 0xe3dccb, rock: 0xb3aa9c, rockTop: 0xcfc7b8, wood: 0xc9a77c, white: 0xf6f3ec, beige: 0xe1cfae,
  glass: 0x6fb0d4, frame: 0x3a3f44, fairway: 0xbdf08e, green: 0x5fc24a, golfRough: 0x86c95e,
};

// مضلع مسطح (x,z) على ارتفاع y
function flat(points, y, color) {
  const sh = new THREE.Shape();
  points.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
  const g = new THREE.ShapeGeometry(sh, 1).rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color }));
  m.position.y = y; m.receiveShadow = true;
  return m;
}
// إزاحة الساحل للخارج (للرمل والمياه الضحلة). الساحل يمشي غرب←شرق والخارج = الشمال
function offsetLine(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1;
    return [p[0] + (tz / l) * d, p[1] - (tx / l) * d];
  });
}
// مضلع أكبر/أصغر حول مركزه (لحافة الرصيف حول الماء)
function grow(poly, d) {
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cz = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  return poly.map(([x, z]) => { const dx = x - cx, dz = z - cz, l = Math.hypot(dx, dz) || 1; return [x + (dx / l) * d, z + (dz / l) * d]; });
}
// صناديق على امتداد خط (حاجز، رصيف…)
function along(b, pts, w, h, y, color, topColor) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], len = Math.hypot(x1 - x0, z1 - z0) + w * 0.6, ry = Math.atan2(x1 - x0, z1 - z0);
    b.box(w, h, len, (x0 + x1) / 2, y, (z0 + z1) / 2, color, ry);
    if (topColor) b.box(w * 0.55, 0.12, len, (x0 + x1) / 2, y + h, (z0 + z1) / 2, topColor, ry);
  }
}

// ---------- نماذج مشتركة ----------
function boatGeo(big) {
  const b = new Builder(), L = big ? 11 : 6.5, Wd = big ? 3.2 : 2.2;
  b.box(Wd, 0.9, L * 0.8, 0, 0, -L * 0.1, 0xffffff);
  b.box(Wd * 0.7, 0.9, L * 0.25, 0, 0, L * 0.38, 0xffffff); // مقدمة أضيق
  b.box(Wd + 0.05, 0.25, L * 0.8, 0, 0.1, -L * 0.1, 0x2f6fb5);
  b.box(Wd * 0.75, big ? 1.4 : 0.9, L * 0.35, 0, 0.9, -L * 0.12, 0xf3f3f3);
  b.box(Wd * 0.78, big ? 0.5 : 0.4, L * 0.2, 0, 0.9 + (big ? 0.6 : 0.35), L * 0.02, 0x3a5a78);
  if (big) b.box(Wd * 0.6, 1.0, L * 0.22, 0, 2.3, -L * 0.18, 0xf3f3f3);
  return b.build();
}
function parasolGeo() {
  const b = new Builder();
  b.cyl(0.08, 0.08, 2.3, 0, 0, 0, 0xffffff, 6);
  b.add(new THREE.ConeGeometry(1.6, 0.7, 8), 0xf2efe8, { y: 2.45 });
  b.cyl(0.6, 0.6, 0.08, 0, 0.75, 0, 0xc9a77c, 10);
  return b.build();
}
function palmGeo() {
  const b = new Builder();
  for (let i = 0; i < 8; i++) b.cyl(0.2 - i * 0.012, 0.22 - i * 0.012, 0.6, Math.sin(i * 0.4) * 0.08, i * 0.58, 0, i % 2 ? 0x8a6a42 : 0x7a5a36, 7);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; b.slab(0.36, 0.06, 2.3, Math.sin(a) * 1.0, 4.75, Math.cos(a) * 1.0, i % 2 ? 0x3f8f45 : 0x57a84e, { rx: -0.45, ry: a }); }
  return b.build();
}
function lampGeo() {
  const b = new Builder();
  b.cyl(0.07, 0.09, 3.2, 0, 0, 0, 0x3a3f44, 6);
  b.ball(0.28, 0, 3.35, 0, 0xfff0b8);
  return b.build();
}
function instances(geo, mat, list) {
  const im = new THREE.InstancedMesh(geo, mat, list.length), d = new THREE.Object3D();
  list.forEach(([x, z, ry = 0, s = 1, y = 0], i) => { d.position.set(x, y, z); d.rotation.set(0, ry, 0); d.scale.setScalar(s); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
  im.castShadow = true; im.frustumCulled = false;
  return im;
}

// ---------- المباني ----------
function block(b, o) {
  const face = o.c === 'beige' ? C.beige : C.white;
  if (o.kind === 'townhouse') {
    // صف تاون هاوس: وحدات متلاصقة بتراسات وفواصل خشب
    const n = Math.max(3, Math.round(o.w / 5)), uw = o.w / n;
    for (let i = 0; i < n; i++) {
      const x = o.x - o.w / 2 + uw * (i + 0.5), h = o.h + (i % 2) * 0.8;
      b.box(uw - 0.2, h, o.d, x, 0, o.z, i % 2 ? face : C.white);
      b.box(uw * 0.7, 2, 0.12, x, 1.0, o.z + o.d / 2 + 0.02, C.glass);
      b.box(uw - 0.2, 0.25, o.d + 0.2, x, h, o.z, 0xffffff);
      b.box(0.15, h, 0.4, x - uw / 2 + 0.1, 0, o.z + o.d / 2 + 0.1, C.wood);
    }
    return;
  }
  if (o.kind === 'terrace') {
    // شقق منخفضة متدرجة بمسبح يطل على البحر
    b.box(o.w, o.h, o.d, o.x, 0, o.z, face);
    b.box(o.w * 0.75, 3, o.d * 0.7, o.x - o.w * 0.1, o.h, o.z + o.d * 0.1, C.white);
    b.box(o.w * 0.9, 1.4, o.d + 0.1, o.x, 1.2, o.z, C.glass);
    b.box(o.w * 0.6, 0.15, 4, o.x, 0.05, o.z - o.d / 2 - 2.5, 0x3cc6ea);
    return;
  }
  const floors = Math.max(2, Math.round(o.h / 3));
  b.box(o.w, o.h, o.d, o.x, 0, o.z, face);
  for (let f = 0; f < floors; f++) {
    const y = 0.9 + f * 3;
    b.box(o.w * 0.86, 1.4, o.d + 0.12, o.x, y, o.z, C.glass); // شريط زجاج أزرق يلف المبنى
    b.box(o.w + 0.12, 1.4, o.d * 0.8, o.x, y, o.z, C.glass);
    if (f > 0) b.box(o.w * 0.9, 0.12, o.d + 1.1, o.x, y - 0.25, o.z, 0xffffff); // شرفات
  }
  b.box(o.w + 0.3, 0.4, o.d + 0.3, o.x, o.h, o.z, 0xffffff); // حافة السطح
  b.box(o.w * 0.3, 1.0, o.d * 0.3, o.x + o.w * 0.2, o.h + 0.4, o.z - o.d * 0.15, 0xd9d4ca);
}
function landmark(b, l) {
  const { x, z } = l;
  if (l.type === 'curveHotel') {
    // المبنى الأبيض المنحني يطل على البحر
    for (let i = 0; i < 9; i++) {
      const a = -0.9 + i * 0.225, r = 34, bx = x + Math.sin(a) * r, bz = z + 18 - Math.cos(a) * r * 0.55;
      b.box(9, 16 - Math.abs(i - 4) * 1.2, 10, bx, 0, bz, C.white, -a * 0.6);
      for (let f = 0; f < 4; f++) b.box(9.2, 0.25, 11.2, bx, 3 + f * 3.4, bz, 0xffffff, -a * 0.6);
      b.box(7.5, 9, 10.2, bx, 2.6, bz, C.glass, -a * 0.6);
    }
    b.cyl(9, 9, 0.2, x, 0.05, z - 6, 0x3cc6ea, 24); // مسبح الفندق
  } else if (l.type === 'waveHotel') {
    // المبنى الأبيض المتموج على الشاطئ (أيقونة الموج): كتل مستديرة متتالية بخط متعرج
    for (let i = 0; i < 12; i++) {
      const bx = x - 33 + i * 6, bz = z + Math.sin(i * 0.9) * 7;
      b.cyl(4.2, 4.6, 10 + (i % 3) * 2, bx, 0, bz, C.white, 12);
      b.cyl(4.4, 4.4, 0.3, bx, 4, bz, 0xffffff, 12);
      b.cyl(4.25, 4.25, 2.6, bx, 5.2, bz, C.glass, 12);
    }
  } else if (l.type === 'towerHotel') {
    b.box(20, 6, 26, x, 0, z, C.beige);
    b.box(12, 36, 18, x, 6, z, C.white);
    for (let f = 0; f < 11; f++) { b.box(12.4, 1.6, 18.4, x, 7 + f * 3.1, z, C.glass); b.box(13, 0.2, 19.6, x, 6.6 + f * 3.1, z, 0xffffff); }
    b.box(13, 1.2, 19, x, 42, z, 0xffffff);
  } else if (l.type === 'clubhouse') {
    b.box(30, 5, 16, x, 0, z, C.beige); b.box(34, 0.6, 20, x, 5, z, 0xffffff);
    b.box(14, 4, 12, x - 4, 5.6, z - 1, C.white); b.box(16, 0.5, 14, x - 4, 9.6, z - 1, 0xffffff);
    b.box(26, 3, 0.2, x, 0.8, z + 8.05, C.glass);
    for (const sx of [-12, -4, 4, 12]) b.box(0.4, 5, 0.4, sx + x, 0, z + 10, 0xffffff);
  } else if (l.type === 'resortHotel') {
    for (let i = 0; i < 3; i++) { b.box(18, 12 - i * 2, 14, x - 20 + i * 20, 0, z - i * 4, C.white); for (let f = 0; f < 3; f++) b.box(18.3, 1.3, 14.3, x - 20 + i * 20, 1.4 + f * 3.4, z - i * 4, C.glass); }
  } else if (l.type === 'mosque') {
    b.box(24, 0.4, 24, x, 0, z, C.pave);
    b.box(16, 7, 16, x, 0.4, z, C.white);
    b.cyl(5.4, 6, 1.4, x, 7.4, z, C.white, 16);
    b.add(new THREE.SphereGeometry(5.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xd9c08a, { x, y: 8.8, z });
    b.cyl(0.2, 0.2, 1.4, x, 14.2, z, 0xd9b23c, 6);
    b.cyl(1.2, 1.4, 20, x + 10, 0.4, z + 8, C.white, 10); b.cyl(1.6, 1.6, 1, x + 10, 15, z + 8, C.beige, 10); b.add(new THREE.ConeGeometry(1.2, 3, 10), 0xd9c08a, { x: x + 10, y: 22, z: z + 8 });
    for (let i = 0; i < 5; i++) b.box(2, 3.5, 0.15, x - 6 + i * 3, 1.5, z + 8.08, 0x2f6a5a);
  }
}

// ---------- البناء ----------
export function buildMouj(M, mat) {
  const g = new THREE.Group(), detail = new THREE.Group();
  g.add(detail); g.userData.detail = detail;
  // الطبقات: مياه ضحلة ← رمل الشاطئ ← اليابسة (كلها تتبع الساحل وتسكّر جنوبًا تحت يابسة القارة)
  const south = M.land.at(-1)[1], e = M.coast.at(-1)[0], w0 = M.coast[0][0];
  const shell = (d) => [...offsetLine(M.coast, d), [e + d, M.coast.at(-1)[1]], [e + d, south], [w0 - d, south], [w0 - d, M.coast[0][1]]];
  if (!M.noShell) { // (القارة ترسم ساحل موحد يشمل الموج، فما نحتاج الحواف المستقيمة)
    g.add(flat(shell(80), -1.15, C.shallow));
    g.add(flat(shell(M.sandWidth || 16), -0.45, C.sand));
  }
  g.add(flat(M.land, 0, C.grass));
  // القناة الغربية والبحيرة حول الجزيرتين (ماء فوق اليابسة، والجزر عشب فوق الماء)
  if (M.canal) {
    const cb = new Builder();
    along(cb, M.canal, M.canalW + 4, 0.05, 0.02, C.sandDark);
    along(cb, M.canal, M.canalW, 0.05, 0.06, C.lake);
    const cm = new THREE.Mesh(cb.build(), mat); cm.receiveShadow = true; g.add(cm);
  }
  if (M.lagoon) {
    // تحت مستوى الطرق (0.05-0.09) عشان شوارع الجزر والجسور تبان فوقها
    g.add(flat(grow(M.lagoon, 3), 0.015, C.sandDark));
    g.add(flat(M.lagoon, 0.025, C.lake));
    for (const isl of M.islands) { g.add(flat(grow(isl, 2.5), 0.032, C.sand)); g.add(flat(isl, 0.04, C.grass)); }
  }

  const b = new Builder();
  // الماء فوق اليابسة: حوض المارينا (مع رصيف حوله) والبحيرات
  g.add(flat(grow(M.marina, 9), 0.05, C.pave));
  g.add(flat(grow(M.marina, 3), 0.07, C.quay));
  g.add(flat(M.marina, 0.09, C.marina));
  for (const L of M.lakes) { g.add(flat(grow(L, 3), 0.05, C.sandDark)); g.add(flat(L, 0.08, C.lake)); }
  // الحواجز البحرية
  for (const bw of M.breakwaters) {
    along(b, bw.pts, 6, 1.6, -0.8, C.rock, C.rockTop);
    if (bw.end) { b.cyl(5, 6, 1.8, bw.end[0], -0.9, bw.end[1], C.rock, 12); b.cyl(0.8, 0.8, 5, bw.end[0], 0.9, bw.end[1], 0xffffff, 8); b.box(1.4, 1, 1.4, bw.end[0], 5.9, bw.end[1], 0x2fa84f); }
  }
  // الحواجز على شكل T في الشاطئ
  for (const gy of M.groynes) {
    along(b, [gy.base, gy.tip], 4, 1.2, -0.6, C.rock, C.rockTop);
    const [tx, tz] = gy.tip; b.box(22, 1.2, 4, tx, -0.6, tz, C.rock); b.box(12, 0.12, 2.2, tx, 0.6, tz, C.rockTop);
  }
  // أرصفة القوارب مع أصابع جانبية
  const boatsS = [], boatsL = [];
  for (const p of M.piers) {
    const [x0, z0] = p.from, [x1, z1] = p.to, len = Math.hypot(x1 - x0, z1 - z0);
    b.box(2.6, 0.35, len, (x0 + x1) / 2, 0.15, (z0 + z1) / 2, C.wood);
    for (let s = 6; s < len - 4; s += 8) for (const side of [-1, 1]) {
      const fz = z0 - s; // الرصيف يمشي شمالًا (z أصغر)
      b.box(7, 0.3, 1.1, x0 + side * 4.8, 0.15, fz, C.wood);
      if ((s / 8 + (side > 0 ? 1 : 0)) % 3 !== 0) (s > len * 0.55 ? boatsL : boatsS).push([x0 + side * (s > len * 0.55 ? 6.5 : 4.6), fz - 3.6, Math.PI / 2 * side, 1, 0.1]);
    }
  }
  // الممشى التجاري والمباني
  for (const o of M.blocks) block(b, o);
  for (const l of M.landmarks) landmark(b, l);
  // بوابة الموج على الطريق
  const gate = M.gate;
  if (gate) { for (const s of [-1, 1]) b.box(2, 7, 2, gate[0] + s * 8, 0, gate[1], C.beige); b.box(18, 2.2, 2.4, gate[0], 7, gate[1], C.white); b.box(14, 1.2, 0.2, gate[0], 7.5, gate[1] + 1.3, 0x2f9fd1); }
  // الغولف
  for (const f of M.golf.fairways) {
    for (let i = 0; i < f.length - 1; i++) {
      const [x0, z0] = f[i], [x1, z1] = f[i + 1], len = Math.hypot(x1 - x0, z1 - z0);
      b.box(22, 0.04, len + 18, (x0 + x1) / 2, 0.01, (z0 + z1) / 2, C.fairway, Math.atan2(x1 - x0, z1 - z0));
    }
  }
  for (const [x, z] of M.golf.greens) { b.cyl(9, 9, 0.06, x, 0.03, z, C.green, 18); b.cyl(0.06, 0.06, 2.6, x + 2, 0.05, z, 0xffffff, 5); b.box(1.2, 0.7, 0.06, x + 2.6, 2.0, z, 0xd9342b); }
  for (const [x, z, r] of M.golf.bunkers) b.cyl(r, r, 0.06, x, 0.04, z, C.sand, 12);
  for (const P of M.golf.ponds) g.add(flat(P, 0.08, C.lake));
  // الحديقة
  b.cyl(M.park.r, M.park.r, 0.06, M.park.x, 0.02, M.park.z, 0x7fcc5a, 20);
  b.box(6, 2.4, 4, M.park.x + 5, 0, M.park.z - 4, 0xf0a83a); b.box(0.3, 3, 0.3, M.park.x - 6, 0, M.park.z + 4, 0xd9342b);
  const solid = new THREE.Mesh(b.build(), mat); solid.castShadow = true; solid.receiveShadow = true;
  g.add(solid);

  // ---------- التفاصيل المشتركة (تختفي لما تبعد الكاميرا) ----------
  detail.add(instances(boatGeo(false), mat, boatsS), instances(boatGeo(true), mat, boatsL));
  // نخيل وإنارة على الممشى حول الحوض، ونخيل على طريق الشاطئ
  const ring = grow(M.marina, 6.5), palms = [], lamps = [], parasols = [];
  for (let i = 0; i < ring.length; i++) {
    const [x0, z0] = ring[i], [x1, z1] = ring[(i + 1) % ring.length], n = Math.max(1, Math.floor(Math.hypot(x1 - x0, z1 - z0) / 12));
    for (let k = 0; k < n; k++) { const t = k / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; (k % 2 ? lamps : palms).push([x, z, 0, 1, 0.07]); }
  }
  for (const r of M.palmLines || []) for (const [x, z] of r) palms.push([x, z, 0, 0.9, 0]);
  // مقاهي بجلسات خارجية على الرصيف الجنوبي والشرقي
  const cafe = [M.marina[0], M.marina[1], M.marina[2], M.marina[3]];
  for (let i = 0; i < cafe.length - 1; i++) for (let k = 0; k < 4; k++) { const t = (k + 0.5) / 4; parasols.push([cafe[i][0] + (cafe[i + 1][0] - cafe[i][0]) * t + 2, cafe[i][1] + (cafe[i + 1][1] - cafe[i][1]) * t + 5, 0, 1, 0.07]); }
  for (const [x, z] of M.beachUmbrellas || []) parasols.push([x, z, 0, 1, -0.45]); // على رمل الشاطئ
  detail.add(instances(palmGeo(), mat, palms), instances(lampGeo(), mat, lamps), instances(parasolGeo(), mat, parasols));
  // أشجار الغولف والحديقة
  const trees = M.golf.trees.map(([x, z, s]) => [x, z, x * 0.37, s, 0]);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; trees.push([M.park.x + Math.sin(a) * (M.park.r - 3), M.park.z + Math.cos(a) * (M.park.r - 3), a, 0.8, 0]); }
  g.add(instances(treeGeometry(), mat, trees));
  return g;
}

// للمشي: هل النقطة في الماء (المارينا، البحيرات، البحر بعد الرمل) أو داخل مبنى؟
const inPoly = (x, z, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
export function moujBlocked(M, x, z) {
  if (x < M.origin[0] - 40 || x > M.origin[0] + M.len + 40 || z > M.origin[1] + 40) return false;
  if (inPoly(x, z, M.marina) || M.lakes.some((L) => inPoly(x, z, L)) || M.golf.ponds.some((P) => inPoly(x, z, P))) return true;
  // البحيرة والقناة: ماء إلا على الجزر والجسور
  const onBridge = (M.bridges || []).some(([a, b]) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z) < 5; });
  if (!onBridge) {
    if (M.lagoon && inPoly(x, z, M.lagoon) && !M.islands.some((I) => inPoly(x, z, I))) return true;
    if (M.canal) for (let i = 0; i < M.canal.length - 1; i++) { const [ax, az] = M.canal[i], [bx, bz] = M.canal[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); if (Math.hypot(ax + dx * t - x, az + dz * t - z) < M.canalW / 2) return true; }
  }
  if (!inPoly(x, z, M.land)) { // برا اليابسة: مسموح على شريط الرمل بس
    let best = Infinity;
    for (let i = 0; i < M.coast.length - 1; i++) {
      const [ax, az] = M.coast[i], [bx, bz] = M.coast[i + 1], dx = bx - ax, dz = bz - az;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
      best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z));
    }
    if (best > 13) return true; // بعد الرمل = بحر
  }
  for (const o of M.blocks) if (Math.abs(x - o.x) < o.w / 2 + 0.4 && Math.abs(z - o.z) < o.d / 2 + 0.4) return true;
  for (const l of M.landmarks) { const r = { curveHotel: 30, towerHotel: 12, clubhouse: 16, resortHotel: 30, mosque: 9, waveHotel: 0 }[l.type] ?? 10; if (Math.hypot(x - l.x, z - l.z) < r && l.type !== 'curveHotel') return true; }
  return false;
}

// إطار كاميرا جاهز لكل لقطة (الكل، المارينا، الممشى، الشاطئ، الغولف)
export function moujView(M, name) {
  const v = M.views[name];
  if (!v) return null;
  const t = new THREE.Vector3(v.t[0], 2, v.t[1]), ce = Math.cos(v.el);
  return { t, p: t.clone().add(new THREE.Vector3(Math.sin(v.az) * ce, Math.sin(v.el), Math.cos(v.az) * ce).multiplyScalar(v.d)) };
}
