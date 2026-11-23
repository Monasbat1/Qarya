// ميناء قارتنا (Low Poly): على الساحل الشمالي جنب الموج. ينبني في إطار تصميم (البحر جهة +z) ويتلف لموقعه.
// ساحة حاويات وورش ومبنى إدارة على اليابسة، رصيف بحري بطول الساحة، رصيفين داخلين البحر، رافعات عملاقة (STS)
// ورافعات ساحة (RTG)، سفن حاويات وناقلة نفط وناقلة سيارات راسية، كاسرين موج بمنارة، وسفينة تبحر قدام الميناء.
import * as THREE from 'three';
import { Builder } from './houses.js';

export const PORT_INFO = { name: 'ميناء قارتنا' };
const K = {
  yard: 0xcfcbc2, yardLine: 0xf2c230, quay: 0xbdb8ad, wall: 0x6d6a64, dark: 0x2b2f33, rock: 0x8b8a84, rockD: 0x6f6e69,
  crane: 0xc8432f, craneW: 0xf4f1ea, rtg: 0xf2c230, glass: 0x3d5a73, white: 0xf6f4ee, shed: 0x9fb3c2, shedR: 0x7f93a3,
  tyre: 0x222427, fence: 0x6f757b,
};
const BOX = [0xc8432f, 0x2f6fb3, 0x2f9e5b, 0xf2a33a, 0x8b5fbf, 0xe0e0dc, 0x1f8c8c, 0xb83a5e, 0x6b4f2a, 0x3c4a5a];

function seeded(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// هيكل سفينة (من فوق: مؤخرة مربعة ومقدمة مدببة) مرفوع عموديًا. الطول على x (المقدمة +x)
function hullGeo(L, B, H, bowF = 0.18) {
  const sh = new THREE.Shape(), a = L / 2, b = B / 2, bow = L * bowF;
  sh.moveTo(-a, -b * 0.92); sh.lineTo(-a + 3, -b); sh.lineTo(a - bow, -b); sh.quadraticCurveTo(a - bow * 0.2, -b * 0.75, a, 0);
  sh.quadraticCurveTo(a - bow * 0.2, b * 0.75, a - bow, b); sh.lineTo(-a + 3, b); sh.lineTo(-a, b * 0.92); sh.lineTo(-a, -b * 0.92);
  return new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false, curveSegments: 4 });
}
// السفينة كاملة في Builder محلي (المقدمة +x، سطح الماء y=0)
function shipGeo(kind, rnd) {
  const b = new Builder();
  if (kind === 'container') {
    const L = 170, B = 26;
    b.add(hullGeo(L, B, 12), 0x1f3550, { rx: -Math.PI / 2, y: -5 });
    b.add(hullGeo(L - 1, B - 1, 0.6), 0xb83a2c, { rx: -Math.PI / 2, y: -1.2 }); // خط الماء
    b.box(L * 0.8, 0.4, B - 3, -2, 7, 0, 0x5a5f66);
    for (let x = -L / 2 + 30; x < L / 2 - 30; x += 13) for (let r = -4; r <= 4; r++) {
      const tiers = 2 + Math.floor(rnd() * 4);
      for (let t = 0; t < tiers; t++) b.box(12.2, 2.5, 2.4, x, 7.4 + t * 2.6, r * 2.6, BOX[Math.floor(rnd() * BOX.length)]);
    }
    b.box(14, 16, B - 4, -L / 2 + 14, 7, 0, K.white); b.box(14.2, 1.6, B - 3.8, -L / 2 + 14, 19, 0, K.glass);
    b.box(16, 1, B + 2, -L / 2 + 14, 22.6, 0, K.white);
    b.box(5, 8, 5, -L / 2 + 6, 23, 0, 0x2b2f33); b.box(5.2, 1.4, 5.2, -L / 2 + 6, 28, 0, 0xc8432f);
  } else if (kind === 'tanker') {
    const L = 160, B = 28;
    b.add(hullGeo(L, B, 11, 0.12), 0x9e2f26, { rx: -Math.PI / 2, y: -5 });
    b.box(L * 0.8, 0.4, B - 3, -2, 6, 0, 0x4f6b4f);
    for (let x = -L / 2 + 34; x < L / 2 - 20; x += 16) b.box(3, 1.6, 3, x, 6.4, 0, 0xd9d5cb);
    b.box(L * 0.62, 1.2, 1.2, 4, 7, 0, 0xd9d5cb); b.box(L * 0.62, 1.2, 1.2, 4, 7, 4, 0xd9d5cb); b.box(L * 0.62, 1.2, 1.2, 4, 7, -4, 0xd9d5cb);
    b.box(16, 14, B - 6, -L / 2 + 14, 6, 0, K.white); b.box(16.2, 1.6, B - 5.8, -L / 2 + 14, 16.5, 0, K.glass);
    b.box(5, 7, 5, -L / 2 + 6, 20, 0, 0x2b2f33);
  } else { // ناقلة سيارات: صندوق عالي أبيض
    const L = 150, B = 30;
    b.add(hullGeo(L, B, 26, 0.1), 0xf4f4f0, { rx: -Math.PI / 2, y: -5 });
    b.add(hullGeo(L - 1, B - 1, 2.2), 0x1f4f8a, { rx: -Math.PI / 2, y: -1.4 });
    b.box(L * 0.95, 0.6, B - 1, -2, 21, 0, 0xdedcd5);
    b.box(10, 3, B - 6, L / 2 - 26, 21.6, 0, K.white); b.box(10.2, 1.4, B - 5.8, L / 2 - 26, 22.4, 0, K.glass);
    b.box(L * 0.7, 2, 0.3, -4, 12, B / 2 + 0.05, 0x1f4f8a); b.box(L * 0.7, 2, 0.3, -4, 12, -B / 2 - 0.05, 0x1f4f8a);
  }
  return b.build();
}
function stamp(b, geo, x, z, ry, y = 0) {
  const p = geo.attributes.position.array, col = geo.attributes.color.array, c = Math.cos(ry), s = Math.sin(ry);
  for (let i = 0; i < p.length; i += 3) { b.pos.push(x + p[i] * c + p[i + 2] * s, p[i + 1] + y, z - p[i] * s + p[i + 2] * c); b.col.push(col[i], col[i + 1], col[i + 2]); }
}
// رافعة رصيف عملاقة (STS): الأرجل على الرصيف (x)، والذراع يمتد فوق السفينة باتجاه dir (±1)
function stsCrane(b, x, z, dir, lights) {
  const H = 42, gauge = 22, w = 14, y0 = 1.4;
  for (const dx of [-gauge / 2, gauge / 2]) for (const dz of [-w / 2, w / 2]) b.box(1.6, H, 1.6, x + dx, y0, z + dz, K.crane);
  for (const dx of [-gauge / 2, gauge / 2]) b.box(1.4, 1.4, w, x + dx, y0 + 12, z, K.craneW);
  b.box(gauge + 2, 2.2, w + 2, x, y0 + H - 1, z, K.crane);
  const bx = x + dir * 26; // الذراع
  b.box(78, 2.4, 3.6, bx, y0 + H + 1.2, z, K.craneW);
  b.box(10, 6, 8, x - dir * 6, y0 + H + 1.4, z, K.craneW);                         // غرفة الآلات
  b.box(2.2, 3, 2.2, x + dir * 30, y0 + H - 2, z, K.dark);                          // عربة الحاوية
  b.box(1.4, 16, 1.4, x, y0 + H + 1.2, z, K.crane);                                 // البرج فوق
  for (const s of [-1, 1]) { const len = Math.hypot(36, 15), ang = Math.atan2(15, 36); b.add(new THREE.BoxGeometry(len, 0.4, 0.4), K.dark, { rz: -s * ang, x: x + s * 18, y: y0 + H + 9.6, z }); }
  lights.box(0.9, 0.9, 0.9, x, y0 + H + 17.4, z, 0xff3a2a); lights.box(0.8, 0.8, 0.8, bx + dir * 38, y0 + H + 2.6, z, 0xff3a2a);
}
function rtg(b, x, z, span) { // رافعة ساحة على عجلات فوق صفوف الحاويات (span على z)
  const H = 17;
  for (const dx of [-9, 9]) for (const dz of [-span / 2, span / 2]) b.box(1.2, H, 1.2, x + dx, 0.2, z + dz, K.rtg);
  for (const dx of [-9, 9]) b.box(1.4, 1.6, span + 2, x + dx, H, z, K.rtg);
  b.box(19, 1.4, 2, x, H + 0.4, z - span / 2, K.rtg); b.box(19, 1.4, 2, x, H + 0.4, z + span / 2, K.rtg);
  b.box(3, 2.4, 3, x, H - 2, z - span / 2 + 3, K.dark);
}
function truck(b, x, z, ry, col) {
  const c = Math.cos(ry), s = Math.sin(ry), P = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
  const box = (w, h, d, dx, y, dz, colr) => { const [px, pz] = P(dx, dz); b.box(w, h, d, px, y, pz, colr, ry); };
  box(3.2, 2.6, 2.6, 6.6, 0.6, 0, 0xf4f4f0); box(0.1, 1, 2.2, 8.25, 1.9, 0, K.glass);
  box(13, 0.4, 2.6, -1.2, 0.8, 0, K.dark); box(12.2, 2.5, 2.4, -1.2, 1.2, 0, col);
}
function signTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  const draw = () => {
    g.fillStyle = '#123a5c'; g.fillRect(0, 0, 1024, 256); g.fillStyle = '#f2c230'; g.fillRect(0, 214, 1024, 12);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.direction = 'rtl'; g.font = '900 120px Tajawal, Tahoma, sans-serif'; g.fillText('ميناء قارتنا', 512, 124);
    g.font = '700 44px "Segoe UI", Roboto, sans-serif'; g.direction = 'ltr'; g.fillText('PORT OF QARATNA', 512, 190);
    tex.needsUpdate = true;
  };
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; draw();
  if (document.fonts) document.fonts.load('900 120px Tajawal').then(draw).catch(() => {});
  return tex;
}

// إطار التصميم الثابت (البحر جنوب، +z). الميناء ينبني فيه ثم يتلف ويتحرك لموقعه من lib/layout.js: (cx, cz) = وسط خط الرصيف.
const PD = { x0: 1130, x1: 1670, z0: 430, quay: 600, roadX: 1540 };
const PDC = { x: (PD.x0 + PD.x1) / 2, z: PD.quay };
const portToWorld = (P, [x, y, z]) => { const r = P.rot || 0, c = Math.cos(r), s = Math.sin(r), dx = x - PDC.x, dz = z - PDC.z; return [(P.cx ?? PDC.x) + dx * c + dz * s, y, (P.cz ?? PDC.z) - dx * s + dz * c]; };

export function buildPort(Pw, mat) {
  const root = new THREE.Group(), b = new Builder(), d = new Builder(), L = new Builder(), rnd = seeded(41);
  const P = PD;
  const { x0, x1, z0, quay: Q, roadX } = P;
  // الساحة والرصيف البحري
  b.box(x1 - x0, 0.14, Q - z0, (x0 + x1) / 2, 0.02, (z0 + Q) / 2, K.yard);
  b.box(x1 - x0 + 20, 1.4, 24, (x0 + x1) / 2, 0, Q - 2, K.quay);
  b.box(x1 - x0 + 20, 7.4, 2, (x0 + x1) / 2, -6, Q + 10.5, K.wall);
  for (let x = x0 - 6; x <= x1 + 6; x += 15) { b.cyl(0.6, 0.7, 1, x, 1.4, Q + 8, K.dark, 8); b.box(2, 3, 0.8, x + 7, -1.6, Q + 11.6, K.tyre); }
  // خطوط الساحة الصفراء
  for (const z of [482, 522, 562]) b.box(x1 - x0 - 20, 0.02, 0.5, (x0 + x1) / 2, 0.17, z, K.yardLine);
  b.box(0.5, 0.02, Q - z0 - 20, roadX - 9, 0.17, (z0 + Q) / 2, K.yardLine); b.box(0.5, 0.02, Q - z0 - 20, roadX + 9, 0.17, (z0 + Q) / 2, K.yardLine);
  // الرصيفين الداخلين البحر (على أعمدة)
  const PIERS = [[1240, 260], [1540, 260]];
  for (const [px, len] of PIERS) {
    b.box(30, 1.2, len, px, 0.2, Q + len / 2 + 8, K.quay);
    b.box(31, 0.6, len, px, -0.4, Q + len / 2 + 8, K.wall);
    for (let z = Q + 20; z < Q + len + 8; z += 22) for (const dx of [-13, 13]) b.cyl(0.9, 0.9, 6, px + dx, -6, z, K.wall, 8);
    for (let z = Q + 16; z < Q + len + 6; z += 18) for (const dx of [-14.5, 14.5]) b.cyl(0.5, 0.6, 0.9, px + dx, 1.4, z, K.dark, 8);
  }
  // كاسرين الموج (صخور) + منارة على الطرف الشرقي وضوء أخضر على الغربي
  const breakwater = (pts, tip, lampCol, tall) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az), ry = Math.atan2(-(bz - az), bx - ax);
      b.box(len + 6, 5, 16, (ax + bx) / 2, -2.6, (az + bz) / 2, K.rock, ry);
      b.box(len + 4, 1.2, 7, (ax + bx) / 2, 2.4, (az + bz) / 2, K.quay, ry);
      for (let s = 0; s < len; s += 7) for (const side of [-1, 1]) {
        const t = s / len, x = ax + (bx - ax) * t + Math.sin(ry) * side * 7.5, z = az + (bz - az) * t + Math.cos(ry) * side * 7.5;
        b.ball(2 + rnd() * 1.6, x, 0.6 + rnd(), z, rnd() < 0.5 ? K.rock : K.rockD);
      }
    }
    const [tx, tz] = tip;
    if (tall) {
      for (let i = 0; i < 6; i++) b.cyl(2.6 - i * 0.18, 2.8 - i * 0.18, 3.2, tx, 2.4 + i * 3.2, tz, i % 2 ? K.crane : K.white, 12);
      b.cyl(1.9, 1.9, 2.6, tx, 21.6, tz, K.glass, 10); b.cyl(0.4, 2.4, 1.6, tx, 24.2, tz, K.crane, 10);
      L.box(2.2, 2.2, 2.2, tx, 22, tz, lampCol);
    } else { b.cyl(1.4, 1.6, 9, tx, 2.4, tz, lampCol === 0x39ff7a ? 0x2f9e5b : K.white, 10); L.box(1.4, 1.4, 1.4, tx, 11.4, tz, lampCol); }
  };
  breakwater([[x1 + 20, Q + 4], [x1 + 70, Q + 150], [x1 + 30, Q + 290], [x1 - 80, Q + 350]], [x1 - 80, Q + 350], 0xfff2b0, true);
  breakwater([[x0 - 20, Q + 4], [x0 - 50, Q + 140], [x0 + 10, Q + 250]], [x0 + 10, Q + 250], 0x39ff7a, false);

  // السفن الراسية (طولها على z، المقدمة للبحر)
  const ships = [['container', 1283, Q + 140], ['container', 1497, Q + 150], ['tanker', 1196, Q + 130], ['carrier', 1586, Q + 125]];
  const geos = { container: shipGeo('container', rnd), tanker: shipGeo('tanker', rnd), carrier: shipGeo('carrier', rnd) };
  for (const [k, x, z] of ships) stamp(b, geos[k], x, z, -Math.PI / 2);
  // الرافعات العملاقة فوق السفن
  for (const z of [Q + 80, Q + 140, Q + 200]) { stsCrane(b, 1240, z, 1, L); stsCrane(b, 1540, z, -1, L); }

  // ساحة الحاويات: كتل (3 حاويات طول × 8 صفوف) بارتفاعات مختلفة
  const blocks = [];
  for (let i = 0; i < 6; i++) for (const zb of [448, 488, 528]) blocks.push([1218 + i * 50, zb]);
  for (const xb of [1562, 1612]) for (const zb of [488, 528]) blocks.push([xb, zb]);
  for (const [bx, bz] of blocks) for (let c = 0; c < 3; c++) for (let r = 0; r < 8; r++) {
    const tiers = 1 + Math.floor(rnd() * 4);
    for (let t = 0; t < tiers; t++) b.box(12, 2.5, 2.4, bx + 6 + c * 12.6, 0.16 + t * 2.6, bz + 1.5 + r * 2.9, BOX[Math.floor(rnd() * BOX.length)]);
  }
  for (const [bx, bz] of [blocks[1], blocks[7], blocks[11], blocks[19]]) rtg(b, bx + 19, bz + 11.5, 26);
  // شاحنات بحاويات
  for (const [x, z, ry] of [[1530, 470, Math.PI / 2], [1549, 520, -Math.PI / 2], [1300, 575, 0], [1420, 577, Math.PI], [1205, 576, 0]]) truck(d, x, z, ry, BOX[Math.floor(rnd() * BOX.length)]);
  // المستودعات
  for (const zb of [442, 512]) { b.box(56, 9, 54, 1168, 0.1, zb + 27, K.shed); b.gable(56, 4, 56, 1168, 9.1, zb + 27, K.shedR); for (let i = 0; i < 3; i++) b.box(10, 7, 0.4, 1150 + i * 18, 0.1, zb + 54.2, 0x5b6068); }
  // مبنى الإدارة + برج المراقبة البحرية
  b.box(90, 14, 30, 1615, 0, 453, K.white); for (let f = 0; f < 3; f++) b.box(90.4, 2, 30.4, 1615, 3 + f * 4, 453, K.glass);
  b.box(92, 0.8, 32, 1615, 14, 453, 0x123a5c);
  b.cyl(3, 3.6, 34, 1658, 0, 582, K.white, 10); b.cyl(5.4, 4.2, 4, 1658, 34, 582, K.glass, 10); b.cyl(5.8, 5.8, 0.8, 1658, 38, 582, 0x123a5c, 10);
  L.box(1, 1, 1, 1658, 40, 582, 0xff3a2a);
  // البوابة: عمودين ولوحة فوق الطريق + سياج على حد الساحة
  b.box(2, 12, 2, roadX - 14, 0, z0 + 2, 0x123a5c); b.box(2, 12, 2, roadX + 14, 0, z0 + 2, 0x123a5c); b.box(30, 7, 1.2, roadX, 12, z0 + 2, 0x123a5c);
  b.box(0.4, 0.3, 4, roadX - 6, 1.1, z0 + 6, K.crane); b.box(0.4, 0.3, 4, roadX + 6, 1.1, z0 + 6, K.crane);
  for (const [a0, a1] of [[x0, roadX - 15], [roadX + 15, x1]]) { b.box(a1 - a0, 2.2, 0.25, (a0 + a1) / 2, 0, z0, K.fence); for (let x = a0; x <= a1; x += 6) b.box(0.3, 2.6, 0.3, x, 0, z0, 0x4f555b); }
  for (const x of [x0, x1]) { b.box(0.25, 2.2, Q - z0 - 14, x, 0, (z0 + Q - 14) / 2, K.fence); }
  const tex = signTexture(), sm = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const gateSign = new THREE.Mesh(new THREE.PlaneGeometry(27, 6.75), sm); gateSign.position.set(roadX, 15.5, z0 + 1.3); gateSign.rotation.y = Math.PI;
  const bldSign = new THREE.Mesh(new THREE.PlaneGeometry(36, 9), sm); bldSign.position.set(1615, 9.8, 437.85); bldSign.rotation.y = Math.PI;
  root.add(gateSign, bldSign);
  // أعمدة إنارة الساحة
  for (const x of [1200, 1330, 1460, 1600]) for (const z of [470, 545]) { b.cyl(0.25, 0.35, 20, x, 0, z, 0x8e959b, 6); b.box(3, 0.6, 1.2, x, 20, z, 0xc3c8cd); L.box(2.8, 0.15, 1, x, 19.9, z, 0xffe6a8); }

  const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; };
  const lightMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  const lights = new THREE.Mesh(L.build(), lightMat); lights.visible = false;
  const detail = mk(d.build(), mat);
  root.add(mk(b.build(), mat), detail, lights);

  // سفينة تبحر قدام الميناء (حلقة بيضاوية بطيئة) + قاطرة صغيرة داخل الحوض
  const sailer = mk(geos.container, mat); root.add(sailer);
  const tugB = new Builder(); tugB.add(hullGeo(22, 8, 4, 0.3), 0xc8432f, { rx: -Math.PI / 2, y: -2 }); tugB.box(8, 4, 6, -2, 2, 0, K.white); tugB.box(8.2, 1, 6.2, -2, 4.6, 0, K.glass); tugB.box(1.6, 3, 1.6, -5, 6, 0, K.dark);
  const tug = mk(tugB.build(), mat); root.add(tug);
  const C = { x: (x0 + x1) / 2, z: Q + 620, rx: 520, rz: 150 };
  let t = 0;
  const pose = () => {
    const a = t * 0.012, x = C.x + Math.cos(a) * C.rx, z = C.z + Math.sin(a) * C.rz;
    sailer.position.set(x, 0, z); sailer.rotation.y = Math.atan2(-(Math.cos(a) * C.rz), -Math.sin(a) * C.rx);
    const u = t * 0.05, tx = 1390 + Math.sin(u) * 70, tz = Q + 120 + Math.sin(u * 2) * 50;
    tug.position.set(tx, 0, tz); tug.rotation.y = Math.atan2(-(Math.cos(u * 2) * 100), Math.cos(u) * 70);
  };
  pose();
  // نقل الميناء من إطار التصميم لموقعه
  root.position.set(-PDC.x, 0, -PDC.z);
  const outer = new THREE.Group(); outer.add(root);
  outer.rotation.y = Pw.rot || 0; outer.position.set(Pw.cx ?? PDC.x, 0, Pw.cz ?? PDC.z);
  outer.userData = {
    civic: 'port', center: new THREE.Vector3(Pw.cx ?? PDC.x, 0, Pw.cz ?? PDC.z),
    update(dt, camPos, active) { if (!active) return false; t += dt; pose(); return true; },
    setNight(on) { lights.visible = on; },
  };
  outer.traverse((o) => { if (o.isMesh) o.userData.civic = 'port'; });
  return outer;
}

// لقطات الكاميرا (تتحسب في إطار التصميم وتتحول للعالم)
export const portViews = (P) => {
  const v = (t, p) => ({ t: portToWorld(P, t), p: portToWorld(P, p) });
  return {
    all: v([1400, 0, 640], [1400, 700, 1250]),
    cranes: v([1390, 30, 690], [1300, 60, 960]),
    ships: v([1395, 8, 700], [1420, 48, 1010]),
    light: v([1590, 15, 950], [1450, 30, 1060]),
  };
};
