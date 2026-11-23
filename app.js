import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { LEVEL_NAMES, MOUJ_NAMES, Builder, houseGeometry, ownedLotGeometry, emptyLotGeometry, treeGeometry, pineGeometry } from './houses.js';
import { carGeometry, yardGeometry, petGeometry, CAR_SPOT, YARD_SPOT, PET_SPOTS } from './furniture.js';
import { estateGeometry, estateSign, SIGN_Y, civicPlazaGeometry } from './buildings.js';
import { palaceWall, electionHall, drawGovBoard, leaderBoard, drawLeaderBoard } from './civic.js';
import { buildMosque, MOSQUE_VIEWS, MOSQUE_INFO } from './mosque.js';
import { armyBase } from './army-base.js';
import { buildAirport, AIRPORT_VIEWS, AIRPORT_INFO, LAND as APT_LAND } from './airport.js';
import { buildHospital, HOSPITAL_VIEWS, HOSPITAL_INFO } from './hospital.js';
import { buildPort, portViews, PORT_INFO } from './port.js';
import { buildCourt, COURT_VIEWS, COURT_INFO } from './court.js';
import { buildCentralBank, bankViews, BANK_INFO } from './centralbank.js';
import { buildUniversity, universityViews, UNIVERSITY_INFO } from './university.js';
import { buildThemePark, themeparkViews, THEMEPARK_INFO } from './themepark.js';import { buildMinistries, MINISTRY_INFO, ministryView } from './ministries.js';
import { buildMouj, moujView } from './mouj.js';
import { sfx, bindToggle } from './sfx.js';
let CAR_COLORS = [0xf4f4f2];
let ESTATE_T = new Map(); // نوع العقار -> {name, icon}
let estatesGroup = null;
let civicGroup = null, govBoard = null, topBoard = null, mosqueGroup = null; // المعالم العامة واللوحتين والجامع
let moujGroup = null, moujNb = new Set(), viewBounds = null, vacantVillas = null;
const villaByUser = new Map(); // يوزر → قطعة فيلته في الموج
const villaLevel = (p) => (byUser.get(p.villa.u)?.resident?.l) || 1; // منطقة الموج (خارج شكل الجزيرة) وحدود الكاميرا
const houseStyle = (p) => (moujNb.has(p.nb) ? 3 : p.number % 3);
const levelName = (p, l) => (moujNb.has(p.nb) ? MOUJ_NAMES : LEVEL_NAMES)[l]; // أسماء فلل الموج غير البيوت العادية

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const LIVE = params.get('live') === '1'; // وضع التصوير: الكاميرا تلحق كل بيت جديد أو ترقية
const TRAILER = ['1', '2', '3', '4'].includes(params.get('trailer')); // مقطع تعريفي مُبرمج (public/trailer.js و trailer2.js)
const HOUSE_H = [2.5, 6, 6.5, 5.5, 8.8, 8, 10, 9.5, 13.5, 6, 10.5];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const normUser = (s) => String(s || '').trim().replace(/^@+/, '').toLowerCase().replace(/\.+$/, '');

// ---------- المشهد ----------
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe6f5);
scene.fog = new THREE.Fog(0xbfe6f5, 700, 2800);

const camera = new THREE.PerspectiveCamera(32, 1, 4, 5000);
camera.position.set(60, 200, 160);
const controls = new MapControls(camera, canvas);
Object.assign(controls, { enableDamping: true, dampingFactor: 0.1, minDistance: 24, maxDistance: 900, minPolarAngle: 0.3, maxPolarAngle: 1.18, zoomToCursor: true, screenSpacePanning: false, rotateSpeed: 0.5 });

const hemi = new THREE.HemisphereLight(0xffffff, 0xa5c99a, 1.25);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d8, 2.7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.25;
scene.add(sun, sun.target);
const SUN_OFF = new THREE.Vector3(70, 130, 55);
let shadowHalf = 0;

const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
// الوضع الليلي (من بطاقة المطار): سماء داكنة، وإنارة المدرجات والمباني تشتغل
let night = false, airportGroup = null, hospitalGroup = null, portGroup = null, courtGroup = null, ministriesGroup = null, bankGroup = null, uniGroup = null, parkGroup = null;
function setNight(on) {
  night = on;
  const sky = on ? 0x0e1830 : 0xbfe6f5;
  scene.background.set(sky); scene.fog.color.set(sky);
  hemi.intensity = on ? 0.38 : 1.25; hemi.color.set(on ? 0x8fa6d8 : 0xffffff);
  sun.intensity = on ? 0.45 : 2.7; sun.color.set(on ? 0x9db4ff : 0xfff1d8);
  if (airportGroup) airportGroup.userData.setNight(on);
  if (hospitalGroup) hospitalGroup.userData.setNight(on);
  if (portGroup) portGroup.userData.setNight(on);
  if (courtGroup) courtGroup.userData.setNight(on);
  if (bankGroup) bankGroup.userData.setNight(on);
  if (uniGroup) uniGroup.userData.setNight(on);
  if (parkGroup) parkGroup.userData.setNight(on);
  if (ministriesGroup) ministriesGroup.userData.setNight(on);
  dirty = true;
}
const world = new THREE.Group();
const fx = new THREE.Group();
scene.add(world, fx);

let dirty = true;
controls.addEventListener('change', () => { dirty = true; });

// ---------- الحالة ----------
let S = null;                // آخر حالة من الخادم
const plots = new Map();     // id -> قطعة
const byUser = new Map();    // يوزر -> قطعة
const nbNames = new Map();
let houses = null, lotsOwned = null, lotsEmpty = null, rulerPlot = null, rulerMesh = null;
// إطلالة الحاكم: القطع الفاضية قدام القصر ما تنعطى لأحد وتنرسم عشب مفتوح
const isRoyal = (p) => !!S.royal && p.x >= S.royal.x0 && p.x <= S.royal.x1 && p.z >= S.royal.z0 && p.z <= S.royal.z1;
const hOf = (p) => (p.ruler ? 21 : HOUSE_H[p.resident ? p.resident.l : 0]);
let bounds = null, coastline = null;
let selected = null;
const anims = [];
let fly = null, freeCam = false; // freeCam: لقطة تصوير حرة (منخفضة) لين يلمس اللاعب الخريطة

// ---------- بناء العالم ----------
function disposeGroup(g) {
  g.traverse((o) => { if (o.geometry && !o.userData.shared) o.geometry.dispose(); });
  g.clear();
}

function pushTriUp(out, a, b, c) {
  const ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
  if (ny >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
function ribbon(pts, half, y) {
  const out = [], L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[Math.max(0, i - 1)], n = pts[Math.min(pts.length - 1, i + 1)];
    let dx = n[0] - p[0], dz = n[1] - p[1];
    const len = Math.hypot(dx, dz) || 1; dx /= len; dz /= len;
    L.push([pts[i][0] - dz * half, y, pts[i][1] + dx * half]);
    R.push([pts[i][0] + dz * half, y, pts[i][1] - dx * half]);
  }
  for (let i = 0; i < pts.length - 1; i++) { pushTriUp(out, L[i], R[i], R[i + 1]); pushTriUp(out, L[i], R[i + 1], L[i + 1]); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  return g;
}

function segDist(px, pz, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((px - a[0]) * vx + (pz - a[1]) * vz) / (vx * vx + vz * vz || 1)));
  return Math.hypot(px - a[0] - vx * t, pz - a[1] - vz * t);
}

function islandShape(cx, cz, a, b, k) {
  const sh = new THREE.Shape();
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const f = k * (1 + 0.03 * Math.sin(3 * t + 1) + 0.022 * Math.sin(5 * t + 2.2) + 0.014 * Math.sin(9 * t));
    const x = cx + a * f * Math.sign(c) * Math.abs(c) ** 0.6, z = cz + b * f * Math.sign(s) * Math.abs(s) ** 0.6;
    if (i) sh.lineTo(x, -z); else sh.moveTo(x, -z);
  }
  return sh;
}

// ---------- شكل القارة: ساحل واحد متصل ----------
// القارة كانت ثلاث قطع ملصوقة (الجزيرة البيضاوية + شريط الموج + مستطيل المطار). الحين ساحل واحد:
// ساحل الموج نفسه (الشاطئ والمارينا مثل ما هم)، وباقي الساحل يلف حول كل اليابسة بشعاع من المركز، ناعم ومتموّج شوي.
const inPolyXZ = (x, z, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
// blendW = عدد النقاط اللي تلتحم بالطرف الغربي للساحل الثابت (أقل لما يكون فيه ساحل الملاهي عشان ما يسحب ساحل المطار)
function continentOutline({ cx, cz, a, b, n = 2 }, insideExtra, coast, blendW = 14) {
  const inEllipse = (x, z) => (Math.abs(x - cx) / a) ** n + (Math.abs(z - cz) / b) ** n <= 1; // n = 2: دائرة
  const RMAX = Math.max(a, b) * 1.15 + 3000;
  const reachOf = (th, fn) => { const c = Math.cos(th), s = Math.sin(th); let last = 0; for (let r = 0; r < RMAX; r += 8) if (fn(cx + c * r, cz + s * r)) last = r; return last; };
  const ang = (p) => Math.atan2(p[1] - cz, p[0] - cx);
  // القوس اللي يرسمه الشعاع: من نهاية ساحل الموج الشرقية، جنوبًا، لين بدايته الغربية (أو دائرة كاملة لو ما فيه موج)
  let t0 = -Math.PI, t1 = Math.PI;
  if (coast) { t0 = ang(coast.at(-1)); t1 = ang(coast[0]); while (t1 <= t0) t1 += Math.PI * 2; }
  const N = 420, rs = [], rx = [];
  for (let i = 0; i <= N; i++) {
    const th = t0 + ((t1 - t0) * i) / N, ex = reachOf(th, insideExtra); // ex = المعالم الثابتة (الموج، المطار، الميناء، الملاهي)
    rs.push([th, Math.max(reachOf(th, inEllipse), ex) + 28]); rx.push(ex ? ex + 28 : 0);
  }
  for (let pass = 0; pass < 4; pass++) { // تنعيم: يسد الفجوات بين القطع ويخلي الساحل منحني
    const cp = rs.map((r) => r[1]);
    for (let i = 0; i <= N; i++) { let sum = 0, n = 0; for (let k = -6; k <= 6; k++) { const j = Math.min(N, Math.max(0, i + k)); sum += Math.max(cp[j], cp[i] * 0.98); n++; } rs[i][1] = Math.max(cp[i], sum / n); }
  }
  // القارة الكبيرة تقرب بنعومة من طرفي الساحل الثابت (ساحل الموج/الملاهي)، بدون ما تقص أي معلم
  if (coast) {
    const W = 0.55, r0 = Math.hypot(coast.at(-1)[0] - cx, coast.at(-1)[1] - cz), r1 = Math.hypot(coast[0][0] - cx, coast[0][1] - cz);
    const ss = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
    rs.forEach((r, i) => {
      const d0 = r[0] - t0, d1 = t1 - r[0];
      let v = r[1];
      if (d0 < W) v = r0 + (v - r0) * ss(d0 / W);
      if (d1 < W) v = r1 + (v - r1) * ss(d1 / W);
      r[1] = Math.max(v, rx[i]);
    });
  }
  const pts = [];
  rs.forEach(([th, r], i) => {
    const wob = 1 + 0.018 * Math.sin(5 * th + 1.3) + 0.012 * Math.sin(11 * th + 0.4) + 0.007 * Math.sin(23 * th);
    let x = cx + Math.cos(th) * r * wob, z = cz + Math.sin(th) * r * wob;
    if (coast) { // يلتحم بطرفي ساحل الموج بنعومة
      const e = i < 14 ? 1 - i / 14 : i > N - blendW ? 1 - (N - i) / blendW : 0, P = i < N / 2 ? coast.at(-1) : coast[0];
      x += (P[0] - x) * e * e; z += (P[1] - z) * e * e;
    }
    pts.push([x, z]);
  });
  return coast ? [...coast, ...pts.slice(1, -1)] : pts;
}
// إزاحة مضلع للخارج (الرمل والمياه الضحلة حول الساحل). الترتيب: مع عقارب الساعة على الشاشة (الشمال فوق)
function offsetPoly(poly, dist) {
  const n = poly.length, d0 = dist;
  return poly.map((p, i) => {
    const d = typeof d0 === 'function' ? d0(p) : d0;
    const a = poly[(i - 1 + n) % n], b = poly[(i + 1) % n];
    let tx = b[0] - a[0], tz = b[1] - a[1]; const L = Math.hypot(tx, tz) || 1; tx /= L; tz /= L;
    return [p[0] + tz * d, p[1] - tx * d];
  });
}
const shapeOf = (poly) => { const sh = new THREE.Shape(); poly.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z))); return sh; };

function buildWorld() {
  disposeGroup(world);
  plots.clear(); byUser.clear(); nbNames.clear();
  for (const n of S.neighborhoods) nbNames.set(n.id, n.name);
  moujNb = new Set(S.neighborhoods.filter((n) => n.kind === 'mouj').map((n) => n.id));
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [id, number, nb, x, z, rot] of S.plots) {
    plots.set(id, { id, number, nb, x, z, rot, resident: null, mesh: null });
    if (moujNb.has(nb)) continue; // الموج شريط ساحلي له شكله الخاص، ما يدخل في شكل الجزيرة
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
  }
  for (const r of S.roads) if (!r.mouj && !r.airport && !r.port && !r.park) for (const p of r.pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); }
  for (const e of S.estates || []) { x0 = Math.min(x0, e.x - 12); x1 = Math.max(x1, e.x + 12); z0 = Math.min(z0, e.z - 12); }
  for (const r of S.residents) {
    const p = plots.get(r.p);
    if (p) { p.resident = { u: r.u, l: r.l, c: r.c, k: r.k, kc: r.kc, y: r.y, pt: r.pt }; byUser.set(r.u, p); }
  }
  // فلل الموج المشتراة: عقار إضافي، تصميمها حسب لفل صاحبها
  villaByUser.clear();
  for (const v of S.villas || []) { const p = plots.get(v.p); if (p) { p.villa = { u: v.u }; villaByUser.set(v.u, p); } }
  const R = S.ruler;
  x0 = Math.min(x0, R.x - 30); x1 = Math.max(x1, R.x + 30); z0 = Math.min(z0, R.z - 34);
  if (S.civic) { x0 = Math.min(x0, S.civic.board.x - 30); x1 = Math.max(x1, S.civic.hall.x + 30); z0 = Math.min(z0, S.civic.wall.z0 - 10); }
  const MQ = S.civic && S.civic.mosque;
  if (MQ) { x0 = Math.min(x0, MQ.x + MQ.site.x0 - 20); z1 = Math.max(z1, MQ.z + MQ.site.z1 + 20); }
  const AB = S.civic && S.civic.army;
  if (AB) { x0 = Math.min(x0, AB.x0 - 20); z0 = Math.min(z0, AB.z0 - 20); }
  rulerPlot = { ruler: true, id: -1, number: 0, x: R.x, z: R.z, rot: R.rot, scale: R.scale, u: R.u, resident: null };
  // قارة دائرية كبيرة (~5 أضعاف): مركزها جنوب العمران، ونصف قطرها يكفي كل المعالم مع مساحة للأحياء الجاية.
  // الشمال يبقى ساحل ثابت: الملاهي ← الموج ← الميناء.
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2 + 650;
  let RAD = 2500;
  const fit = (x, z) => { RAD = Math.max(RAD, Math.hypot(x - cx, z - cz) + 450); };
  { const A = S.civic && S.civic.airport; if (A) fit(A.x - 780, A.z - 220); const P2 = S.civic && S.civic.port; if (P2) fit(P2.x1, P2.z1); }
  bounds = { x0, x1, z0, z1, cx, cz, a: RAD, b: RAD, n: 2 };
  // حدود تحريك الكاميرا: الجزيرة + منطقة الموج
  viewBounds = { x0, x1, z0, z1 };
  if (S.mouj) for (const [x, z] of S.mouj.land) { viewBounds.x0 = Math.min(viewBounds.x0, x); viewBounds.x1 = Math.max(viewBounds.x1, x); viewBounds.z0 = Math.min(viewBounds.z0, z - 60); }
  // مطار مسقط: شبه جزيرة على الطرف الغربي (خارج شكل الجزيرة)، الكاميرا توصله
  const AP = S.civic && S.civic.airport;
  const aptLocal = AP ? (x, z) => { const c = Math.cos(AP.rot), s = Math.sin(AP.rot), dx = x - AP.x, dz = z - AP.z; return [dx * c - dz * s, dx * s + dz * c]; } : null;
  if (AP) for (const [lx, lz] of [[APT_LAND.x0, APT_LAND.z0], [APT_LAND.x1, APT_LAND.z0], [APT_LAND.x0, APT_LAND.z1], [APT_LAND.x1, APT_LAND.z1]]) {
    const c = Math.cos(AP.rot), s = Math.sin(AP.rot), x = AP.x + lx * c + lz * s, z = AP.z - lx * s + lz * c;
    viewBounds.x0 = Math.min(viewBounds.x0, x); viewBounds.x1 = Math.max(viewBounds.x1, x); viewBounds.z0 = Math.min(viewBounds.z0, z); viewBounds.z1 = Math.max(viewBounds.z1, z);
  }
  controls.maxDistance = Math.max(500, RAD * 2.6); // تقدر تبعد لين تشوف القارة كاملة

  // البحر والجزيرة
  // البحر والمياه الضحلة والرمل ينرسمون قبل اليابسة وبدون كتابة عمق: اليابسة دايمًا فوقهم حتى من بعيد (بدون خطوط متداخلة)
  const flat = (shape, y, color, order = 0) => {
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 1).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color, depthWrite: order >= 0 }));
    m.position.y = y; m.receiveShadow = true; m.renderOrder = order;
    return m;
  };
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x45a9d6, depthWrite: false }));
  sea.position.set(cx, -1.6, cz); sea.renderOrder = -3;
  // ساحل واحد يلف الجزيرة والموج والمطار (بدل ثلاث قطع ملصوقة)
  const aptIn = AP ? (x, z) => { const [lx, lz] = aptLocal(x, z); return lx > APT_LAND.x0 && lx < APT_LAND.x1 && lz > APT_LAND.z0 && lz < APT_LAND.z1; } : () => false;
  const PT = S.civic && S.civic.port; // الميناء على الساحل الشمالي جنب الموج: الساحة يابسة، والرصيف والسفن شمالها
  if (PT) { viewBounds.x1 = Math.max(viewBounds.x1, PT.x1 + 140); viewBounds.z0 = Math.min(viewBounds.z0, PT.z0 - 420); } // الكاميرا توصل للسفن وكاسر الموج
  const portIn = PT ? (x, z) => x > PT.x0 && x < PT.x1 && z > PT.z0 && z < PT.z1 : () => false;
  const TP = S.civic && S.civic.themepark; // مدينة الملاهي: يابسة على الشاطئ الشمالي الغربي غرب الموج
  if (TP) { viewBounds.x0 = Math.min(viewBounds.x0, TP.x0 - 120); viewBounds.z0 = Math.min(viewBounds.z0, TP.z0 - 120); }
  const parkIn = TP ? (x, z) => x > TP.x0 && x < TP.x1 && z > TP.z0 && z < TP.z1 : () => false;
  // ساحل الملاهي (غربها وشمالها) يكمل ساحل الموج من طرفه الغربي، عشان الالتحام ما يقص المجمع ولا المطار
  let coastArr = S.mouj ? S.mouj.coast : null;
  if (TP && coastArr) {
    const m = 26, c0 = coastArr[0], pc = [];
    for (let z = TP.z1 - 10; z > TP.z0 + 40; z -= 30) pc.push([TP.x0 - m, z]);
    for (let i = 0; i <= 6; i++) { const a = Math.PI - (i / 6) * Math.PI / 2; pc.push([TP.x0 + 40 + Math.cos(a) * (40 + m), TP.z0 + 40 - Math.sin(a) * (40 + m)]); } // زاوية مدوّرة
    for (let x = TP.x0 + 70; x < c0[0] - 20; x += 30) pc.push([x, TP.z0 - m - 4 * Math.sin((x - TP.x0) / 60)]);
    coastArr = [...pc, ...coastArr];
  }
  // ساحل الميناء (خط الرصيف) يكمل ساحل الموج من طرفه الشرقي
  if (PT && coastArr) {
    const e = coastArr.at(-1), qz = PT.z0 - 12, pc = [];
    for (let x = Math.max(e[0] + 15, PT.x0 - 10); x <= PT.x1 + 12; x += 30) pc.push([x, qz]);
    pc.push([PT.x1 + 12, qz]); pc.push([PT.x1 + 28, qz + 10]);
    coastArr = [...coastArr, ...pc];
  }
  coastline = continentOutline(bounds, (x, z) => aptIn(x, z) || portIn(x, z) || parkIn(x, z) || (S.mouj ? inPolyXZ(x, z, S.mouj.land) : false), coastArr, TP ? 5 : 14);
  // الرمل والمياه الضحلة تضيق عند رصيف الميناء (السفن على ماء عميق قدامه مباشرة)
  const portW = (x) => (PT ? THREE.MathUtils.clamp(Math.min(x - (PT.x0 - 60), PT.x1 + 60 - x) / 50, 0, 1) : 0);
  const ring = (dd) => (p) => { const w = PT && Math.abs(p[1] - (PT.z0 - 12)) < 30 ? portW(p[0]) : 0; return dd + (Math.min(dd, 4) - dd) * w; };
  world.add(sea, flat(shapeOf(offsetPoly(coastline, ring(60))), -1.2, 0x7fd3e8, -2), flat(shapeOf(offsetPoly(coastline, ring(22))), -0.5, 0xf2e0b0, -1), flat(shapeOf(coastline), 0, 0x93d16c));
  if (S.mouj) S.mouj.noShell = true; // الموج ما يرسم حوافه المستقيمة (الساحل الموحد يغطيها)

  // الطرق والأرصفة
  const rb = new Builder();
  for (const r of S.roads) {
    rb.add(ribbon(r.pts, r.w / 2 + 1.5, 0.05), 0xd9d5cb);
    if (r.cul) rb.cyl(r.cul + 1.5, r.cul + 1.5, 0.01, r.pts.at(-1)[0], 0.04, r.pts.at(-1)[1], 0xd9d5cb, 28);
  }
  for (const r of S.roads) {
    rb.add(ribbon(r.pts, r.w / 2, 0.09), 0x565b64);
    if (r.cul) {
      const e = r.pts.at(-1);
      rb.cyl(r.cul, r.cul, 0.01, e[0], 0.08, e[1], 0x565b64, 28);
      rb.cyl(2.6, 2.6, 0.12, e[0], 0.09, e[1], 0x93d16c, 16);
      rb.ball(1.5, e[0], 2.6, e[1], 0x3d8a45); rb.cyl(0.2, 0.28, 1.8, e[0], 0.1, e[1], 0x7a5230, 6);
    }
    // خط المنتصف المتقطع
    let acc = 0;
    for (let i = 0; i < r.pts.length - 1; i++) {
      const p = r.pts[i], q = r.pts[i + 1], len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      for (let d = (5 - (acc % 5)) % 5; d < len; d += 5) {
        const t = d / len;
        rb.box(0.2, 0.01, 1.8, p[0] + (q[0] - p[0]) * t, 0.092, p[1] + (q[1] - p[1]) * t, r.main ? 0xf3d36a : 0xe9e6dc, Math.atan2(q[0] - p[0], q[1] - p[1]));
      }
      acc += len;
    }
  }
  const roads = new THREE.Mesh(rb.build(), mat);
  roads.receiveShadow = true;
  world.add(roads);

  // قواعد القطع (مسكونة / فاضية)
  const n = plots.size;
  lotsOwned = new THREE.InstancedMesh(ownedLotGeometry(S.c.lotW, S.c.lotD), mat, n);
  lotsEmpty = new THREE.InstancedMesh(emptyLotGeometry(S.c.lotW, S.c.lotD), mat, n);
  // قطع الموج الفاضية: فيلا شاغرة جاهزة (بدل التراب) عشان المنطقة تبان مبنية مثل الموج الحقيقي
  vacantVillas = new THREE.InstancedMesh(houseGeometry(4, 3), mat, Math.max(1, n)); // فيلا بطابقين مثل فلل الموج
  for (const m of [lotsOwned, lotsEmpty, vacantVillas]) { m.frustumCulled = false; m.receiveShadow = true; m.castShadow = true; world.add(m); }
  rebuildLots();

  // البيوت
  houses = new THREE.Group();
  world.add(houses);
  for (const p of plots.values()) if (p.resident) addHouse(p, p.resident.l); else if (p.villa) addHouse(p, villaLevel(p));

  // بيت الحاكم: قصر أكبر من أي بيت، موجود من أول يوم
  rulerMesh = new THREE.Group();
  for (const g of [ownedLotGeometry(S.c.lotW, S.c.lotD), houseGeometry(10, 0)]) {
    const m = new THREE.Mesh(g, mat);
    m.userData.shared = g !== undefined && g === houseGeometry(10, 0);
    m.castShadow = true; m.receiveShadow = true;
    rulerMesh.add(m);
  }
  const fb = new Builder(); // سارية وعلم
  fb.cyl(0.12, 0.16, 9, -6.3, 0.16, 3.5, 0xe8e4da, 8).box(2.6, 1.5, 0.08, -4.95, 7.5, 3.5, 0xc8432f).ball(0.26, -6.3, 9.3, 3.5, 0xd9b23c);
  const flag = new THREE.Mesh(fb.build(), mat);
  flag.castShadow = true;
  rulerMesh.add(flag);

  // ممشى نخيل على طريق القصر لين الجادة
  const pb = new Builder();
  for (let z = R.z + 22; z < -5; z += 6.5) for (const s of [-1, 1]) {
    const x = R.x + s * 6.6;
    pb.cyl(0.9, 0.9, 0.12, x, 0, z, 0x5aa84e, 12);
    for (let i = 0; i < 8; i++) pb.cyl(0.2 - i * 0.012, 0.22 - i * 0.012, 0.6, x, 0.1 + i * 0.58, z, i % 2 ? 0x8a6a42 : 0x7a5a36, 7);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; pb.slab(0.36, 0.06, 2.2, x + Math.sin(a) * 1.0, 4.85, z + Math.cos(a) * 1.0, i % 2 ? 0x3f8f45 : 0x57a84e, { rx: -0.45, ry: a }); }
  }
  const palms = new THREE.Mesh(pb.build(), mat);
  palms.castShadow = true;
  world.add(palms);
  rulerMesh.position.set(R.x, 0, R.z); rulerMesh.rotation.y = R.rot; rulerMesh.scale.setScalar(R.scale);
  world.add(rulerMesh);

  // المعالم العامة: سور القصر، مبنى الانتخابات ولوحة الوزراء، ولوحة المتصدرين
  civicGroup = new THREE.Group();
  if (S.civic) {
    const cv = S.civic;
    civicGroup.add(palaceWall(cv.wall));
    const hall = electionHall(); hall.position.set(cv.hall.x, 0, cv.hall.z); civicGroup.add(hall);
    const lb = leaderBoard(); lb.position.set(cv.board.x, 0, cv.board.z); civicGroup.add(lb);
    govBoard = hall.userData.board; topBoard = lb.userData.board;
    // ممرات مرصوفة من الجادة للمبنى وللوحة
    const pv = new Builder();
    const path = (x, w, zFrom) => pv.box(w, 0.06, -6 - zFrom, x, 0, (zFrom - 6) / 2, 0xd9d5cb); // من zFrom لين حافة الجادة
    path(cv.hall.x, 12, cv.hall.z + 17);
    pv.box(42, 0.06, 32, cv.hall.x, 0, cv.hall.z + 2, 0xe4dfd2);
    path(cv.board.x, 10, cv.board.z + 4);
    const paths = new THREE.Mesh(pv.build(), mat); paths.receiveShadow = true; civicGroup.add(paths);
    drawBoards();
    // جامع السلطان قابوس الأكبر
    if (MQ) { mosqueGroup = buildMosque(mat); mosqueGroup.position.set(MQ.x, 0, MQ.z); civicGroup.add(mosqueGroup); }
    if (AB) civicGroup.add(armyBase(AB, mat)); // قيادة الجيش
  }
  airportGroup = AP ? buildAirport(AP, mat) : null; // مطار مسقط الدولي
  if (airportGroup) { civicGroup.add(airportGroup); airportGroup.userData.setNight(night); }
  ministriesGroup = S.civic && S.civic.ministries ? buildMinistries(S.civic.ministries, mat) : null; // البلدية والمالية والإعلام
  if (ministriesGroup) { civicGroup.add(ministriesGroup); ministriesGroup.userData.setNight(night); }
  courtGroup = S.civic && S.civic.court ? buildCourt(S.civic.court, mat) : null; // المحكمة العليا (مقابل حي الورد)
  if (courtGroup) { civicGroup.add(courtGroup); courtGroup.userData.setNight(night); }
  bankGroup = S.civic && S.civic.bank ? buildCentralBank(S.civic.bank, mat) : null; // البنك المركزي (شرق وزارة الإعلام)
  if (bankGroup) { civicGroup.add(bankGroup); bankGroup.userData.setNight(night); }
  uniGroup = S.civic && S.civic.university ? buildUniversity(S.civic.university, mat) : null; // جامعة قارتنا (مقابل الموج)
  if (uniGroup) { civicGroup.add(uniGroup); uniGroup.userData.setNight(night); }
  parkGroup = S.civic && S.civic.themepark ? buildThemePark(S.civic.themepark, mat) : null; // مدينة الملاهي + أكوا قارتنا (على الشاطئ جنب الموج)
  if (parkGroup) { civicGroup.add(parkGroup); parkGroup.userData.setNight(night); }
  portGroup = PT ? buildPort(PT, mat) : null; // ميناء قارتنا (الساحل الشمالي جنب الموج)
  if (portGroup) { civicGroup.add(portGroup); portGroup.userData.setNight(night); }
  hospitalGroup = S.civic && S.civic.hospital ? buildHospital(S.civic.hospital, mat) : null; // مستشفى قارتنا (مقابل حي فلسطين)
  if (hospitalGroup) { civicGroup.add(hospitalGroup); hospitalGroup.userData.setNight(night); }
  world.add(civicGroup);

  // منطقة الموج: الساحل والمارينا والممشى والغولف (بيوت سكانها تنرسم مع باقي البيوت)
  moujGroup = S.mouj ? buildMouj(S.mouj, mat) : null;
  if (moujGroup) world.add(moujGroup);

  // المنطقة التجارية (العقارات)
  estatesGroup = new THREE.Group();
  world.add(estatesGroup);
  for (const e of S.estates || []) addEstate(e);

  // أشجار خارج القطع والطرق
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  // الشجر على كل يابسة القارة الموحدة (بعيد عن الساحل بشوي)
  const inner = offsetPoly(coastline, -45);
  let tx0 = Infinity, tx1 = -Infinity, tz0 = Infinity, tz1 = -Infinity;
  for (const [x, z] of inner) { tx0 = Math.min(tx0, x); tx1 = Math.max(tx1, x); tz0 = Math.min(tz0, z); tz1 = Math.max(tz1, z); }
  const want = Math.min(4500, Math.max(140, Math.round(((tx1 - tx0) * (tz1 - tz0)) / 700)));
  const spots = [];
  const plotArr = [...plots.values()];
  for (let i = 0; i < want * 5 && spots.length < want; i++) {
    const x = tx0 + rnd() * (tx1 - tx0), z = tz0 + rnd() * (tz1 - tz0);
    if (!inPolyXZ(x, z, inner)) continue;    if (plotArr.some((p) => Math.abs(p.x - x) < 15 && Math.abs(p.z - z) < 15 && Math.hypot(p.x - x, p.z - z) < 14.5)) continue;
    if (Math.hypot(R.x - x, R.z - z) < 36) continue;
    if (S.royal && x > S.royal.x0 && x < S.royal.x1 && z > S.royal.z0 - 4 && z < 4) continue; // ساحة القصر نظيفة
    if (S.mouj && x > S.mouj.origin[0] - 30 && x < S.mouj.origin[0] + S.mouj.len + 30 && z < S.mouj.origin[1] + 50) continue; // منطقة الموج لها تشجيرها
    if (S.civic) { // داخل السور فاضي للحاكم، وما فيه شجر على المعالم
      const w = S.civic.wall, h = S.civic.hall, bd = S.civic.board;
      if (x > w.x0 - 8 && x < w.x1 + 8 && z > w.z0 - 8 && z < w.z1 + 8) continue;
      if (Math.abs(x - h.x) < 30 && z > h.z - 22 && z < 4) continue;
      if (Math.abs(x - bd.x) < 30 && z > bd.z - 12 && z < 4) continue;
      if (AB && x > AB.x0 - 8 && x < AB.x1 + 8 && z > AB.z0 - 8 && z < AB.z1 + 12) continue; // قيادة الجيش
      if ((S.civic.ministries || []).some((M) => x > M.x0 - 6 && x < M.x1 + 6 && z > M.z0 - 6 && z < M.z1 + 4)) continue; // الوزارات
      const CT = S.civic.court;
      if (CT && x > CT.x0 - 6 && x < CT.x1 + 6 && z > CT.z0 - 6 && z < CT.z1 + 4) continue; // المحكمة لها تشجيرها
      const BK = S.civic.bank;
      if (BK && x > BK.x0 - 6 && x < BK.x1 + 6 && z > BK.z0 - 6 && z < BK.z1 + 4) continue; // البنك المركزي
      const UV = S.civic.university;
      if (UV && x > UV.x0 - 6 && x < UV.x1 + 6 && z > UV.z0 - 6 && z < UV.z1 + 6) continue; // الجامعة لها تشجيرها
      const TPk = S.civic.themepark;
      if (TPk && x > TPk.x0 - 60 && x < TPk.x1 + 10 && z > TPk.z0 - 60 && z < TPk.z1 + 10) continue; // الملاهي والشاطئ
      const HS = S.civic.hospital;
      if (HS && x > HS.x0 - 6 && x < HS.x1 + 6 && z > HS.z0 - 6 && z < HS.z1 + 4) continue; // المستشفى له تشجيره
      if (MQ && x > MQ.x + MQ.site.x0 - 6 && x < MQ.x + MQ.site.x1 + 16 && z > MQ.z + MQ.site.z0 - 2 && z < MQ.z + MQ.site.z1 + 6) continue; // الجامع له تشجيره
    }
    if ((S.estates || []).some((e) => Math.abs(e.x - x) < 12.5 && Math.abs(e.z - z) < 12.5)) continue;
    if (PT && x > PT.x0 - 12 && x < PT.x1 + 12 && z > PT.z0 - 12 && z < PT.z1 + 12) continue; // الميناء
    if (aptLocal) { const [lx, lz] = aptLocal(x, z); if (lx > APT_LAND.x0 - 10 && lx < APT_LAND.x1 + 10 && lz > APT_LAND.z0 - 10 && lz < APT_LAND.z1 + 10) continue; } // المطار له تشجيره
    let ok = true;
    for (const r of S.roads) { for (let j = 0; j < r.pts.length - 1 && ok; j++) if (segDist(x, z, r.pts[j], r.pts[j + 1]) < 8.5 + (r.cul || 0) * (j === r.pts.length - 2 ? 1 : 0)) ok = false; if (!ok) break; }
    if (ok) spots.push([x, z, 0.8 + rnd() * 0.7, rnd() * 6.28, rnd() < 0.35]);
  }
  const dummy = new THREE.Object3D();
  for (const [geo, pine] of [[treeGeometry(), false], [pineGeometry(), true]]) {
    const list = spots.filter((s) => s[4] === pine);
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((s, i) => { dummy.position.set(s[0], 0, s[1]); dummy.scale.setScalar(s[2]); dummy.rotation.y = s[3]; dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
    im.frustumCulled = false; im.castShadow = true;
    world.add(im);
  }
  dirty = true;
}

function rebuildLots() {
  const d = new THREE.Object3D();
  let o = 0, e = 0, v = 0;
  const built = estatePlots();
  for (const p of plots.values()) {
    if (built.has(p.id)) continue; // عليها عقار: المبنى له أرضيته الخاصة
    d.position.set(p.x, 0, p.z); d.rotation.y = p.rot; d.updateMatrix();
    if (p.resident || p.villa) lotsOwned.setMatrixAt(o++, d.matrix);
    else if (moujNb.has(p.nb)) { lotsOwned.setMatrixAt(o++, d.matrix); vacantVillas.setMatrixAt(v++, d.matrix); } // فيلا شاغرة في الموج
    else if (!isRoyal(p)) lotsEmpty.setMatrixAt(e++, d.matrix); // قدام القصر: عشب مفتوح بدون قطعة
  }
  lotsOwned.count = o; lotsEmpty.count = e; vacantVillas.count = v;
  for (const m of [lotsOwned, lotsEmpty, vacantVillas]) m.instanceMatrix.needsUpdate = true;
  dirty = true;
}

function addHouse(p, level) {
  const m = new THREE.Mesh(houseGeometry(level, houseStyle(p)), mat);
  m.userData.shared = true; m.userData.plot = p;
  m.position.set(p.x, 0, p.z); m.rotation.y = p.rot;
  m.castShadow = true; m.receiveShadow = true;
  houses.add(m);
  p.mesh = m;
  addDeco(p, level);
  return m;
}

const ESTATE_SCALE = 0.75; // مبنى العقار (20م) على أرض سكنية (15م)
const CIVIC_SCALE = 1.12; // مرفق عام على قطعتين: أكبر بمرة ونص من العقار العادي
const estatePlots = () => new Set((S.estates || []).flatMap((e) => [e.p, e.p2]).filter(Boolean));
function addEstate(e, animate) {
  const g = new THREE.Group();
  const s0 = e.p2 ? CIVIC_SCALE : e.p ? ESTATE_SCALE : 1;
  g.position.set(e.x, 0, e.z); g.rotation.y = e.r; g.scale.setScalar(s0);
  const m = new THREE.Mesh(estateGeometry(e.t), mat);
  m.userData.shared = true; m.userData.estate = e; m.castShadow = true; m.receiveShadow = true;
  g.add(m);
  if (e.p2) { const pz = new THREE.Mesh(civicPlazaGeometry(), mat); pz.userData.shared = true; pz.userData.estate = e; pz.receiveShadow = true; g.add(pz); }
  const t = ESTATE_T.get(e.t) || { name: 'عقار', icon: '🏢' };
  const sign = estateSign(e.u, t.name, t.icon);
  sign.position.set(0, SIGN_Y[e.t] || 6.5, 9.6);
  sign.userData.estate = e;
  g.add(sign);
  estatesGroup.add(g);
  if (animate) {
    g.scale.setScalar(0.001);
    let k = 0;
    anims.push((dt) => { k = Math.min(1, k + dt / 0.9); g.scale.setScalar(Math.max(0.001, easeOutBack(k) * s0)); return k < 1; });
    burst({ x: e.x, z: e.z }, true);
    sfx('cash');
  }
  dirty = true;
}

// السيارة وعنصر الحوش اللي اشتراهم الساكن من المتجر
function addDeco(p, level = p.resident && p.resident.l) {
  if (p.deco) { houses.remove(p.deco); p.deco = null; }
  const r = p.resident;
  if (!r || !level || (!r.k && !r.y && !(r.pt && r.pt.length))) return;
  const g = new THREE.Group();
  g.position.set(p.x, 0, p.z); g.rotation.y = p.rot;
  const put = (geo, x, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, 0.16, z); m.rotation.y = ry; m.castShadow = true; m.userData.shared = true; m.userData.plot = p; g.add(m); };
  if (r.k) put(carGeometry(r.k, CAR_COLORS[r.kc | 0] ?? CAR_COLORS[0]), CAR_SPOT[level][0], CAR_SPOT[level][1]);
  if (r.y) put(yardGeometry(r.y), YARD_SPOT[0], YARD_SPOT[1]);
  (r.pt || []).slice(0, PET_SPOTS.length).forEach((id, i) => put(petGeometry(id), PET_SPOTS[i][0], PET_SPOTS[i][1], PET_SPOTS[i][2]));
  houses.add(g);
  p.deco = g;
  dirty = true;
}

// ---------- الكاميرا ----------
const portrait = () => innerWidth < innerHeight;
function viewFor(target, dist, az, el) {
  const ce = Math.cos(el);
  return { t: target.clone(), p: target.clone().add(new THREE.Vector3(Math.sin(az) * ce, Math.sin(el), Math.cos(az) * ce).multiplyScalar(dist)) };
}
function homeView() {
  const occ = [...plots.values()].filter((p) => p.resident);
  // قارة بلا سكان: نبدأ على بيت الحاكم وأول القطع الفاضية
  if (!occ.length) return viewFor(new THREE.Vector3(rulerPlot.x, 0, rulerPlot.z + 40), portrait() ? 330 : 250, 0.4, 0.8);
  const list = occ;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const p of list) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
  const r = Math.hypot(x1 - x0, z1 - z0) / 2 + 20;
  const fit = r / Math.tan((camera.fov * Math.PI) / 360) / Math.min(1, camera.aspect) * 0.8;
  const dist = Math.min(fit, portrait() ? 250 : 300);
  // على الجوال نبدأ من أول الشارع حيث البيوت العشرة متجاورة
  const t = fit > dist && occ.length ? new THREE.Vector3(x0 + Math.min(r, portrait() ? 40 : 90), 0, z0 + Math.min((z1 - z0) / 2, 30)) : new THREE.Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2);
  return viewFor(t, dist, 0.45, 0.86);
}
function flyTo(view, dur = 1.15) {
  freeCam = false; // أي انتقال ثاني يرجّع الكاميرا العادية
  fly = { t0: controls.target.clone(), p0: camera.position.clone(), t1: view.t, p1: view.p, k: 0, dur };
  controls.enabled = false;
}
function flyToPlot(p, dist) {
  // الكاميرا تقف جهة الشارع حتى تظهر واجهة البيت
  const az = p.rot + 0.5;
  const d = (dist || (portrait() ? 86 : 62)) * (p.ruler ? 1.9 : 1);
  const t = new THREE.Vector3(p.x, 2, p.z);
  if (portrait() && innerWidth < 900) t.add(new THREE.Vector3(Math.sin(az), 0, Math.cos(az)).multiplyScalar(d * 0.17)); // البطاقة تغطي أسفل الشاشة
  flyTo(viewFor(t, d, az, 0.72));
}
function zoomBy(f) {
  const off = camera.position.clone().sub(controls.target);
  const len = THREE.MathUtils.clamp(off.length() * f, controls.minDistance, controls.maxDistance);
  flyTo({ t: controls.target.clone(), p: controls.target.clone().add(off.setLength(len)) }, 0.35);
}

// ---------- التحديد ----------
const selGroup = new THREE.Group();
selGroup.visible = false;
scene.add(selGroup);
const goldMat = new THREE.MeshBasicMaterial({ color: 0xffc928 });
const pointer = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 4).rotateX(Math.PI), goldMat);
{
  const w = 15.6, d = 18.6, t = 0.5;
  for (const [bw, bd, x, z] of [[w, t, 0, d / 2], [w, t, 0, -d / 2], [t, d, w / 2, 0], [t, d, -w / 2, 0]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.5, bd), goldMat);
    m.position.set(x, 0.3, z);
    selGroup.add(m);
  }
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.22, depthWrite: false }));
  glow.position.y = 0.2;
  selGroup.add(glow, pointer);
}
const selTag = document.createElement('div');
selTag.className = 'tag tag-sel';
selTag.hidden = true;
$('labels').append(selTag);

const rulerTag = document.createElement('div');
rulerTag.className = 'tag tag-ruler';
rulerTag.textContent = '👑 بيت الحاكم';
$('labels').append(rulerTag);

function select(p, { move = true } = {}) {
  selected = p;
  selGroup.visible = !!p;
  selTag.hidden = !p;
  document.body.classList.toggle('has-card', !!p);
  document.body.classList.toggle('compact', !!p);
  if (!p) { $('card').hidden = true; dirty = true; return; }
  if (move) sfx('click');
  const cardWasOpen = !$('card').hidden;
  selGroup.position.set(p.x, 0, p.z);
  selGroup.rotation.y = p.rot;
  selGroup.scale.setScalar(p.ruler ? p.scale : 1);
  closeLb();
  renderCard();
  if (cardWasOpen && move) reanim($('card'));
  if (move) flyToPlot(p);
  renderLb();
  dirty = true;
}

function neighbors(p) {
  const out = [];
  for (const q of plots.values()) {
    if (q === p || !q.resident) continue;
    const d = Math.hypot(q.x - p.x, q.z - p.z);
    if (d < 46) out.push([d, q]);
  }
  return out.sort((a, b) => a[0] - b[0]).slice(0, 5).map((x) => x[1]);
}

// شارة المنصب الحكومي وبيت الأسبوع في بطاقة البيت
function govBadge(u) {
  const g = S.gov || {}, seat = (g.seats || []).find((s) => s.u === u);
  const pill = (bg, fg, text) => `<a href="/gov" style="padding:4px 12px;border-radius:999px;font-weight:900;font-size:14px;text-decoration:none;background:${bg};color:${fg}">${text}</a>`;
  const out = [];
  if (seat) out.push(pill('#1f2a24', '#ffd84a', `${seat.icon} ${esc(seat.title)}`));
  if (g.how === u) out.push(pill('#ffd84a', '#1f2a24', '🏆 بيت الأسبوع'));
  if ((g.police || []).includes(u)) out.push(pill('#1d3f66', '#fff', '👮 شرطي'));
  return out.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 8px">${out.join('')}</div>` : '';
}

function renderCard() {
  const p = selected, card = $('card');
  if (!p) return;
  const where = `بيت رقم <span class="num">${p.number}</span> · ${esc(nbNames.get(p.nb) || '')}`;
  const r = p.resident;
  const head = (inner) => `<div class="card-top">${inner}<button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>`;
  if (p.ruler) {
    selTag.innerHTML = '👑 بيت الحاكم';
    card.innerHTML = head(`<div class="lvl max" style="font-size:28px">👑</div><div class="card-id"><div class="card-where">${esc(S.name)}</div>
      ${p.u ? `<div class="card-user ltr">@${esc(p.u)}</div>` : ''}<div class="card-type" style="font-size:${p.u ? 15 : 20}px">بيت الحاكم</div></div>`) +
      `<p class="card-empty-t">أول بيت في القارة. كل بيت جديد ينبني حواليه: تابع الحساب وعلّق على ريل مشارك وخذ قطعتك.</p>`;
  } else if (!r && p.villa) {
    // فيلا مشتراة في الموج
    const u = p.villa.u, l = villaLevel(p);
    selTag.innerHTML = `🌊 <span class="ltr">@${esc(u)}</span>`;
    card.innerHTML = head(`<div class="lvl ${l === 10 ? 'max' : ''}"><small>LEVEL</small><b>${l}</b></div><div class="card-id"><div class="card-where">فيلا رقم <span class="num">${p.number}</span> · ${esc(nbNames.get(p.nb) || '')}</div><div class="card-user ltr">@${esc(u)}</div><div class="card-type">🌊 ${levelName(p, l)}</div></div>`) +
      `<p class="card-empty-t">فيلا في مدينة الموج يملكها <span class="ltr">@${esc(u)}</span>، وتصميمها يكبر مع لفله. فلل الموج ما تنعطى بالتعليقات، تنشرى من قسم العقار.</p>
      <div class="card-acts">${byUser.has(u) ? `<button type="button" class="go-play" id="toHome">🏡 بيته الأصلي</button>` : ''}<a class="go-shop" href="/estate?g=mouj">🌊 اشترِ فيلتك</a></div>`;
  } else if (!r) {
    const mj = moujNb.has(p.nb), label = mj ? 'فيلا شاغرة' : 'أرض فاضية';
    selTag.innerHTML = `${label} · <span class="num">${p.number}</span>`;
    card.innerHTML = head(`<div class="lvl empty">${mj ? '🌊' : '🪧'}</div><div class="card-id"><div class="card-where">قطعة رقم <span class="num">${p.number}</span> · ${esc(nbNames.get(p.nb) || '')}</div><div class="card-type" style="font-size:19px">${label}</div></div>`) +
      `<p class="card-empty-t">${mj ? 'فيلا في مدينة الموج للبيع من قسم العقار، وسعرها على حسب موقعها (من 🪙 50,000 لين 🪙 125,000 على البحر). لما تشتريها تصير باسمك، وتصميمها يكبر مع لفلك، وبيتك الأصلي يبقى لك.' : 'هذي القطعة تنتظر ساكنها. تابع الحساب وعلّق على ريل مشارك، وبيتك ينبني هنا أو في أقرب قطعة فاضية.'}</p>`;
  } else {
    const left = 10 - r.l;
    selTag.innerHTML = `<span class="ltr">@${esc(r.u)}</span> · <span class="num">${p.number}</span>`;
    const bar = Array.from({ length: 10 }, (_, i) => `<i class="${i < r.l ? 'on' : ''}"></i>`).join('');
    const ns = neighbors(p).map((q) => `<button type="button" class="chip" data-plot="${q.id}"><span class="ltr">@${esc(q.resident.u)}</span><small>بيت <span class="num">${q.number}</span></small></button>`).join('');
    card.innerHTML = head(`<div class="lvl ${r.l === 10 ? 'max' : ''}"><small>LEVEL</small><b>${r.l}</b></div>
      <div class="card-id"><div class="card-where">${where}</div><div class="card-user ltr">@${esc(r.u)}</div><div class="card-type">${r.l === 10 ? '👑 ' : ''}${levelName(p, r.l)}</div></div>`) +
      `${govBadge(r.u)}<div class="bar" aria-hidden="true">${bar}</div>
      <div class="stats">
        <div class="stat"><b class="num">${r.c}</b><span>تعليق معتمد</span></div>
        ${left ? `<div class="stat goal"><b class="num">${left}</b><span>${left === 1 ? 'شخص جديد تمنشنه وتوصل القصر' : 'أشخاص جدد تمنشنهم وتوصل القصر'}</span></div>`
          : `<div class="stat goal done"><b>👑</b><span>وصل القصر — أعلى لفل</span></div>`}
      </div>
      ${ns ? `<div class="neigh"><span class="neigh-t">الجيران</span>${ns}</div>` : ''}
      <div class="card-acts"><a class="go-play" href="/play?u=${encodeURIComponent(r.u)}">🎮 ادخل البيت</a><a class="go-shop" href="/shop?u=${encodeURIComponent(r.u)}">🛒 المتجر</a></div>
      ${villaByUser.has(r.u) ? '<button type="button" class="share" id="toVilla">🌊 فيلته في الموج</button>' : ''}
      <button type="button" class="share" id="shareBtn">🔗 انسخ رابط بيتي</button>`;
  }
  card.hidden = false;
  $('how').hidden = true;
  const sb = $('shareBtn');
  if (sb) sb.onclick = async () => {
    const url = `${location.origin}/home/${r.u}`;
    try {
      if (navigator.share) await navigator.share({ title: document.title, url });
      else { await navigator.clipboard.writeText(url); sb.textContent = '✓ انتسخ الرابط'; }
    } catch { sb.textContent = url; }
  };
  $('cardClose').onclick = () => select(null);
  const tv = $('toVilla'), th = $('toHome');
  if (tv) tv.onclick = () => select(villaByUser.get(r.u));
  if (th) th.onclick = () => select(byUser.get(p.villa.u));
  card.querySelectorAll('.chip').forEach((c) => { c.onclick = () => select(plots.get(Number(c.dataset.plot))); });
}

// إعادة تشغيل حركة الدخول لما يتغير محتوى لوحة مفتوحة
function reanim(el, cls = 're') { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

// بطاقة العقار التجاري
function showEstate(e) {
  const wasOpen = !$('card').hidden;
  select(null);
  const t = ESTATE_T.get(e.t) || { name: 'عقار', icon: '🏢' };
  const gov = e.u === 'الحكومة';
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">${t.icon}</div>
    <div class="card-id"><div class="card-where">عقار رقم <span class="num">${e.n}</span> · منطقة العقارات</div>
    <div class="card-user ${gov ? '' : 'ltr'}">${gov ? '🏛️ مشروع الحكومة' : '@' + esc(e.u)}</div><div class="card-type">${esc(t.name)}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <p class="card-empty-t">${gov ? `${esc(t.name)} انبنى من خزينة ${esc(S.name)} بتبرعات وضرائب السكان، بعد موافقة الحاكم.` : `${esc(t.name)} يملكه <span class="ltr">@${esc(e.u)}</span> في قلب ${esc(S.name)}.`}</p>
    <div class="card-acts">${gov ? '<a class="go-shop" href="/gov">🏛️ الحكومة</a>' : '<a class="go-shop" href="/estate">🏢 اشترِ عقارك بالعملات</a>'}${byUser.has(e.u) ? `<a class="go-play" href="/home/${encodeURIComponent(e.u)}">🏡 بيته</a>` : ''}</div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  flyTo(viewFor(new THREE.Vector3(e.x, 2, e.z), portrait() ? 110 : 80, e.r + 0.45, 0.7));
  // ربح العقار (مشروع حقيقي يربح كل ساعة)
  fetch('/api/estate/income?id=' + e.id, { cache: 'no-store' }).then((r) => r.json()).then(({ estate }) => {
    const inc = estate && estate.inc;
    if (!inc || card.hidden) return;
    const p = card.querySelector('.card-empty-t');
    if (p) p.insertAdjacentHTML('afterend', `<p class="card-empty-t" style="margin-top:6px;color:#1f5c39;font-weight:800">💰 يربح تقريبًا <span class="num">${inc.perDay.toLocaleString('en-US')}</span> عملة باليوم (${esc(inc.source || '')}) · السوق اليوم ${inc.market >= 100 ? '📈' : '📉'} <span class="num">${inc.market}%</span> · جاب لصاحبه للحين <span class="num">${inc.earned.toLocaleString('en-US')}</span></p>`);
  }).catch(() => {});
}

// ---------- جامع السلطان قابوس الأكبر ----------
// نقاط الكاميرا الثلاث (للتصوير): all | gate | oblique
function mosqueView(name) {
  const MQ = S.civic && S.civic.mosque, v = MOSQUE_VIEWS[name];
  if (!MQ || !v) return null;
  const t = new THREE.Vector3(MQ.x + v.t[0], v.t[1], MQ.z + v.t[2]), ce = Math.cos(v.el);
  const d = v.d * (portrait() ? 1.6 : 1); // الجوال بالطول يحتاج يبعد أكثر عشان يطلع المجمع كامل
  return { t, p: t.clone().add(new THREE.Vector3(Math.sin(v.az) * ce, Math.sin(v.el), Math.cos(v.az) * ce).multiplyScalar(d)) };
}
// لقطة التصوير (منخفضة وهدفها مرتفع) تبقى لين يلمس اللاعب الخريطة، بعدها ترجع كاميرا اللعبة العادية
controls.addEventListener('start', () => { if (!fly && freeCam) { freeCam = false; controls.target.y = 2; } });
function goMosque(name = 'all') { const v = mosqueView(name); if (v) { flyTo(v, 1.6); freeCam = true; } return !!v; }
function showMosque() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">🕌</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)}</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${MOSQUE_INFO.name}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <div class="card-acts" style="grid-template-columns:1fr 1fr 1fr"><button type="button" class="go-shop" data-mv="all">🗺️ المجمع</button><button type="button" class="go-shop" data-mv="gate">🚪 المدخل</button><button type="button" class="go-shop" data-mv="oblique">🕌 القبة</button></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-mv]').forEach((b) => { b.onclick = () => { sfx('click'); goMosque(b.dataset.mv); }; });
  goMosque('oblique');
}

// ---------- رسائل الحاكم الشخصية: تطلع مرة وحدة للساكن الداخل باسمه ----------
async function showNotices() {
  let list = [];
  try { list = (await (await fetch('/api/notices', { cache: 'no-store' })).json()).notices || []; } catch { return; }
  if (!list.length || document.getElementById('noticeBack')) return;
  const n = list[0];
  const back = document.createElement('div');
  back.id = 'noticeBack';
  back.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(10,20,15,.55);display:grid;place-items:center;padding:18px;animation:fadeIn .3s';
  back.innerHTML = `<div style="background:#fffdf7;border-radius:26px;max-width:420px;width:100%;padding:22px 20px 18px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35);border:3px solid #ffd84a">
    <div style="font-size:58px;line-height:1">${esc(n.icon || '📩')}</div>
    <div style="margin-top:6px;color:#8a6a1a;font-weight:800;font-size:14px">👑 رسالة من الحاكم</div>
    <h2 style="margin:6px 0 8px;font-size:23px;font-weight:900;color:#1f2a24">${esc(n.title)}</h2>
    <p style="margin:0;font-size:16.5px;font-weight:700;line-height:1.75;color:#3a463f;white-space:pre-line">${esc(n.text)}</p>
    <div style="display:grid;grid-template-columns:${n.link ? '1fr 1fr' : '1fr'};gap:8px;margin-top:16px">
      ${n.link ? `<a href="${esc(n.link)}" style="height:50px;border-radius:15px;background:#ffd84a;color:#2b1d00;font-weight:900;display:grid;place-items:center;text-decoration:none">${n.link === '/chat' ? '💬 افتح المحادثة' : '🗺️ شوفها'}</a>` : ''}
      <button type="button" style="height:50px;border:0;border-radius:15px;background:#2f7d4f;color:#fff;font-weight:900;font-size:17px">شكرًا 🤍</button></div></div>`;
  document.body.append(back);
  sfx('cash');
  const done = async () => { back.remove(); try { await fetch(`/api/notices/${n.id}/seen`, { method: 'POST' }); } catch { /* تنعرض مرة ثانية بس */ } if (list.length > 1) setTimeout(showNotices, 400); };
  back.querySelector('button').onclick = done;
  const a = back.querySelector('a'); if (a) a.onclick = () => { fetch(`/api/notices/${n.id}/seen`, { method: 'POST' }); };
}

// ---------- مطار مسقط الدولي ----------
// نقاط الكاميرا الأربع: all (علوي كامل) | landside (المبنى من جهة المسافرين) | apron (الأرصفة والطائرات) | takeoff (الإقلاع)
function airportView(name) {
  const v = AIRPORT_VIEWS[name];
  if (!airportGroup || !v) return null;
  airportGroup.updateMatrixWorld(true);
  const t = airportGroup.localToWorld(new THREE.Vector3(...v.t)), p = airportGroup.localToWorld(new THREE.Vector3(...v.p));
  if (portrait()) p.sub(t).multiplyScalar(name === 'all' ? 1.7 : 1.45).add(t); // الجوال بالطول يحتاج يبعد
  return { t, p };
}
function goAirport(name = 'all') {
  const v = airportView(name);
  if (!v) return false;
  if (name === 'takeoff') airportGroup.userData.cueTakeoff();
  flyTo(v, 1.6); freeCam = true;
  return true;
}
function showAirport() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">✈️</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)}</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${AIRPORT_INFO.name}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <div class="card-acts" style="grid-template-columns:1fr 1fr 1fr"><button type="button" class="go-shop" data-av="all">🗺️ المطار</button><button type="button" class="go-shop" data-av="landside">🚖 المبنى</button><button type="button" class="go-shop" data-av="apron">🛬 الساحة</button>
    <button type="button" class="go-shop" data-av="takeoff">🛫 الإقلاع</button><button type="button" class="go-shop" id="aptNight" style="grid-column:span 2">${night ? '☀️ نهار' : '🌙 ليل'}</button>
    <a class="go-play" href="/work/airport" style="grid-column:span 3">🧑‍✈️ وظائف المطار</a></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-av]').forEach((b) => { b.onclick = () => { sfx('click'); goAirport(b.dataset.av); }; });
  $('aptNight').onclick = () => { sfx('click'); setNight(!night); $('aptNight').textContent = night ? '☀️ نهار' : '🌙 ليل'; };
  goAirport('apron');
}

// ---------- المباني الوزارية ----------
function goMinistry(id, name = 'front') {
  const M = (S.civic && S.civic.ministries || []).find((m) => m.id === id);
  if (!M) return false;
  const v = ministryView(M, name), t = new THREE.Vector3(...v.t), p = new THREE.Vector3(...v.p);
  if (portrait()) p.sub(t).multiplyScalar(1.5).add(t);
  flyTo({ t, p }, 1.4); freeCam = true;
  return true;
}
function showMinistry(id) {
  const info = MINISTRY_INFO[id]; if (!info) return;
  const wasOpen = !$('card').hidden;
  select(null);
  const seat = ((S.gov && S.gov.seats) || []).find((s) => s.m === id);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">${info.icon}</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)} · مقابل الأحياء</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${info.name}</div>
    <div class="card-type">${info.title}: ${seat ? `<span class="ltr">@${esc(seat.u)}</span>` : 'شاغر (بالانتخابات)'}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <div class="card-acts" style="grid-template-columns:1fr 1fr"><button type="button" class="go-shop" data-mv="all">🗺️ المبنى</button><button type="button" class="go-shop" data-mv="front">🏛️ الواجهة</button>
    ${seat ? `<a class="go-shop" href="/home/${encodeURIComponent(seat.u)}">🏡 بيت الوزير</a>` : ''}<a class="go-play" href="/gov" style="${seat ? '' : 'grid-column:span 2'}">🏛️ صفحة الحكومة</a></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-mv]').forEach((b) => { b.onclick = () => { sfx('click'); goMinistry(id, b.dataset.mv); }; });
  goMinistry(id, 'front');
}

// ---------- المحكمة العليا ----------
function goCourt(name = 'all') {
  const v = COURT_VIEWS[name];
  if (!courtGroup || !v) return false;
  const t = new THREE.Vector3(...v.t), p = new THREE.Vector3(...v.p);
  if (portrait()) p.sub(t).multiplyScalar(1.5).add(t);
  flyTo({ t, p }, 1.5); freeCam = true;
  return true;
}
function showCourt() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">⚖️</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)} · مقابل حي الورد</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${COURT_INFO.name}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <div class="card-acts" style="grid-template-columns:1fr 1fr 1fr"><button type="button" class="go-shop" data-cv="all">🗺️ المحكمة</button><button type="button" class="go-shop" data-cv="front">🏛️ الواجهة</button><button type="button" class="go-shop" data-cv="dome">🕌 القبة</button>
    <a class="go-play" href="/work/court" style="grid-column:span 3">⚖️ وظائف المحكمة (موظف قضائي)</a></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-cv]').forEach((b) => { b.onclick = () => { sfx('click'); goCourt(b.dataset.cv); }; });
  goCourt('front');
}

// ---------- البنك المركزي ----------
function goBank(name = 'all') {
  const v = bankGroup && bankViews(S.civic.bank)[name];
  if (!v) return false;
  const t = new THREE.Vector3(...v.t), p = new THREE.Vector3(...v.p);
  if (portrait()) p.sub(t).multiplyScalar(1.5).add(t);
  flyTo({ t, p }, 1.5); freeCam = true;
  return true;
}
function showBank() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">🏦</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)} · شرق وزارة الإعلام</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${BANK_INFO.name}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <p class="card-empty-t">بنك القارة كلها: حوّل عملات لأي ساكن بيوزره، أو اشتغل فيه موظف بنك.</p>
    <div class="card-acts" style="grid-template-columns:1fr 1fr 1fr"><button type="button" class="go-shop" data-bv="all">🗺️ البنك</button><button type="button" class="go-shop" data-bv="front">🏛️ الواجهة</button><button type="button" class="go-shop" data-bv="tower">🏙️ البرج</button>
    <a class="go-play" href="/bank" style="grid-column:span 3">💸 افتح البنك (تحويل العملات)</a>
    <a class="go-shop" href="/work/bank" style="grid-column:span 3">💼 وظائف البنك (موظف بنك)</a></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-bv]').forEach((b) => { b.onclick = () => { sfx('click'); goBank(b.dataset.bv); }; });
  goBank('front');
}

// ---------- جامعة قارتنا ----------
function goUniversity(name = 'all') {
  const v = uniGroup && universityViews(S.civic.university)[name];
  if (!v) return false;
  const t = new THREE.Vector3(...v.t), p = new THREE.Vector3(...v.p);
  if (portrait()) p.sub(t).multiplyScalar(1.5).add(t);
  flyTo({ t, p }, 1.5); freeCam = true;
  return true;
}
function showUniversity() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">🎓</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)} · مقابل الموج</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${UNIVERSITY_INFO.name}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <p class="card-empty-t">5 كليات: الطب، الحقوق، إدارة الأعمال، الهندسة، الطيران. سجّل وادرس كل يوم وخذ شهادتك 🎓</p>
    <div class="card-acts" style="grid-template-columns:1fr 1fr 1fr"><button type="button" class="go-shop" data-uv="all">🗺️ الحرم</button><button type="button" class="go-shop" data-uv="front">🏛️ الرئاسة</button><button type="button" class="go-shop" data-uv="mouj">🌊 من الموج</button>
    <a class="go-play" href="/university" style="grid-column:span 3">🎓 سجّل في الجامعة</a>
    <a class="go-shop" href="/work/university" style="grid-column:span 3">🧑‍🏫 وظائف هيئة التدريس</a></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-uv]').forEach((b) => { b.onclick = () => { sfx('click'); goUniversity(b.dataset.uv); }; });
  goUniversity('front');
}

// ---------- مدينة الملاهي + أكوا قارتنا ----------
function goThemePark(name = 'all') {
  const v = parkGroup && themeparkViews(S.civic.themepark)[name];
  if (!v) return false;
  const t = new THREE.Vector3(...v.t), p = new THREE.Vector3(...v.p);
  if (portrait()) p.sub(t).multiplyScalar(1.5).add(t);
  flyTo({ t, p }, 1.5); freeCam = true;
  return true;
}
function showThemePark() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">🎡</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)} · على الشاطئ جنب الموج</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${THEMEPARK_INFO.name}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <p class="card-empty-t">عجلة دوّارة عملاقة، أفعوانية، برج سقوط حر، سفينة القراصنة، و🌊 ${THEMEPARK_INFO.water}: حوض أمواج ونهر كسول وزحاليق.</p>
    <div class="card-acts" style="grid-template-columns:1fr 1fr 1fr"><button type="button" class="go-shop" data-tv="all">🗺️ الكل</button><button type="button" class="go-shop" data-tv="wheel">🎡 العجلة</button><button type="button" class="go-shop" data-tv="coaster">🎢 الأفعوانية</button>
    <button type="button" class="go-shop" data-tv="water" style="grid-column:span 2">🌊 الملاهي المائية</button><button type="button" class="go-shop" data-tv="beach">🏖️ الشاطئ</button></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-tv]').forEach((b) => { b.onclick = () => { sfx('click'); goThemePark(b.dataset.tv); }; });
  goThemePark('all');
}

// ---------- ميناء قارتنا ----------
function goPort(name = 'all') {
  const v = S.civic && S.civic.port && portViews(S.civic.port)[name];
  if (!portGroup || !v) return false;
  const t = new THREE.Vector3(...v.t), p = new THREE.Vector3(...v.p);
  if (portrait()) p.sub(t).multiplyScalar(1.5).add(t);
  flyTo({ t, p }, 1.6); freeCam = true;
  return true;
}
function showPort() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">⚓</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)} · على الساحل الشمالي جنب الموج</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${PORT_INFO.name}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <div class="card-acts" style="grid-template-columns:1fr 1fr"><button type="button" class="go-shop" data-pv="all">🗺️ الميناء</button><button type="button" class="go-shop" data-pv="cranes">🏗️ الرافعات</button>
    <button type="button" class="go-shop" data-pv="ships">🚢 السفن</button><button type="button" class="go-shop" data-pv="light">🗼 المنارة</button>
    <a class="go-play" href="/work/port" style="grid-column:span 2">📦 وظائف الميناء (موظف لوجستي)</a></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-pv]').forEach((b) => { b.onclick = () => { sfx('click'); goPort(b.dataset.pv); }; });
  goPort('cranes');
}

// ---------- مستشفى قارتنا ----------
function goHospital(name = 'all') {
  const v = HOSPITAL_VIEWS[name];
  if (!hospitalGroup || !v) return false;
  const t = new THREE.Vector3(...v.t), p = new THREE.Vector3(...v.p);
  if (portrait()) p.sub(t).multiplyScalar(1.5).add(t);
  flyTo({ t, p }, 1.5); freeCam = true;
  return true;
}
function showHospital() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  card.innerHTML = `<div class="card-top"><div class="lvl" style="font-size:28px">🏥</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)} · مقابل حي فلسطين</div><div class="card-user" style="white-space:normal;font-size:20px;line-height:1.3">${HOSPITAL_INFO.name}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <div class="card-acts" style="grid-template-columns:1fr 1fr 1fr"><button type="button" class="go-shop" data-hv="all">🗺️ المستشفى</button><button type="button" class="go-shop" data-hv="er">🚑 الطوارئ</button><button type="button" class="go-shop" data-hv="heli">🚁 المهبط</button>
    <a class="go-play" href="/hospital" style="grid-column:span 3">🩺 وظائف الأطباء</a></div>`;
  card.hidden = false;
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
  card.querySelectorAll('[data-hv]').forEach((b) => { b.onclick = () => { sfx('click'); goHospital(b.dataset.hv); }; });
  goHospital('front');
}

// ---------- قيادة الجيش ----------
function armyView(name = 'all') {
  const A = S.civic && S.civic.army;
  if (!A) return null;
  const cx = (A.x0 + A.x1) / 2, cz = (A.z0 + A.z1) / 2;
  const V = { all: { t: [cx, 4, cz], az: 0.5, el: 0.85, d: 330 }, gate: { t: [A.gateX, 14, A.z1 - 40], az: 0.12, el: 0.18, d: 130 }, back: { t: [cx, 3, cz - 50], az: 2.6, el: 0.55, d: 170 } }[name];
  const t = new THREE.Vector3(V.t[0], V.t[1], V.t[2]), ce = Math.cos(V.el), d = V.d * (portrait() ? 1.5 : 1);
  return { t, p: t.clone().add(new THREE.Vector3(Math.sin(V.az) * ce, Math.sin(V.el), Math.cos(V.az) * ce).multiplyScalar(d)) };
}
function goArmy(name) { const v = armyView(name); if (v) { flyTo(v, 1.5); freeCam = true; } return !!v; }
async function showArmy() {
  const wasOpen = !$('card').hidden;
  select(null);
  const card = $('card');
  const head = (info) => `<div class="card-top"><div class="lvl" style="font-size:28px;background:#3d4628">🪖</div>
    <div class="card-id"><div class="card-where">معلم في ${esc(S.name)}</div><div class="card-user" style="white-space:normal;font-size:20px">قيادة الجيش</div><div class="card-type" style="font-size:15px">${info}</div></div>
    <button type="button" class="x" id="cardClose" aria-label="إغلاق">✕</button></div>
    <div class="card-acts" style="grid-template-columns:1fr 1fr 1fr"><button type="button" class="go-shop" data-av="gate">🚪 البوابة</button><button type="button" class="go-shop" data-av="back">🚛 الآليات والتدريب</button><a class="go-play" href="/gov#armyBox">🪖 انضم</a></div>`;
  const bind = () => {
    $('cardClose').onclick = () => { card.hidden = true; document.body.classList.remove('has-card'); };
    card.querySelectorAll('[data-av]').forEach((b) => { b.onclick = () => { sfx('click'); goArmy(b.dataset.av); }; });
  };
  card.innerHTML = head('ساحة العرض، الآليات، وساحة التدريب'); card.hidden = false; bind();
  if (wasOpen) reanim(card);
  document.body.classList.add('has-card');
  goArmy('all');
  try {
    const a = await (await fetch('/api/army', { cache: 'no-store' })).json();
    if (!card.hidden && card.querySelector('#cardClose')) { card.innerHTML = head(`${a.count} عسكري · رئيس الأركان: ${a.chief ? '<span class="ltr">@' + esc(a.chief) + '</span>' : 'شاغر'}`); bind(); }
  } catch { /* بدون إنترنت: تبقى البطاقة الأساسية */ }
}

// ---------- المتصدرون ----------
// اللوحتين على الخريطة: الوزراء فوق مبنى الانتخابات، وأفضل 10 على اللوحة الكبيرة
function drawBoards() {
  if (govBoard) drawGovBoard(govBoard, S.gov, S.name);
  if (topBoard) drawLeaderBoard(topBoard, [...byUser.values()].sort((a, b) => b.resident.c - a.resident.c || a.number - b.number).slice(0, 10).map((p) => p.resident), S.name);
  dirty = true;
}
document.fonts.ready.then(() => { if (S) drawBoards(); });

function renderLb() {
  if (topBoard) drawBoards();
  const top = [...byUser.values()].sort((a, b) => b.resident.c - a.resident.c || a.number - b.number).slice(0, 30);
  const medals = ['🥇', '🥈', '🥉'];
  $('lbList').innerHTML = top.length ? top.map((p, i) => `<li style="--i:${Math.min(i, 14)}"><button type="button" class="lb-row ${p === selected ? 'me' : ''}" data-plot="${p.id}">
      <span class="lb-rank num ${i < 3 ? 'top3' : ''}">${medals[i] || i + 1}</span>
      <span class="lb-user ltr">@${esc(p.resident.u)}</span>
      <span class="lb-house">بيت <span class="num">${p.number}</span></span>
      <span class="lb-count num">${p.resident.c}<small>تعليق</small></span></button></li>`).join('')
    : '<li class="lb-empty">ما فيه سكان بعد. كن أول واحد!</li>';
  $('brandCount').textContent = byUser.size ? `${byUser.size} ساكن` : '';
}
$('lbList').addEventListener('click', (e) => {
  const row = e.target.closest('.lb-row');
  if (!row) return;
  select(plots.get(Number(row.dataset.plot)));
});
const wide = () => innerWidth >= 900;
function openLb() {
  if (!wide()) select(null);
  $('leaderboard').hidden = false; $('lbToggle').hidden = true; $('lbToggle').setAttribute('aria-expanded', 'true');
  reanim($('lbList'), 'stagger'); clearTimeout(openLb.t); openLb.t = setTimeout(() => $('lbList').classList.remove('stagger'), 1400);
  document.body.classList.add('lb-open');
}
function closeLb(force) {
  if (wide() && !force) return; // على الشاشات العريضة تبقى القائمة مفتوحة بجانب الخريطة
  $('leaderboard').hidden = true; $('lbToggle').hidden = false; $('lbToggle').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('lb-open');
}
$('lbToggle').onclick = openLb;
$('ladder').innerHTML = LEVEL_NAMES.slice(1).map((n, i) => `<div style="--i:${i}"><span class="num">${i + 1}</span>${n}</div>`).join('');
// الجوال: «المزيد» يفتح صف ثاني فيه باقي الأزرار، ويتسكر لما تضغط أي مكان ثاني
$('moreBtn').onclick = (e) => { e.stopPropagation(); const f = document.querySelector('.fabs'), open = f.classList.toggle('open'); $('moreBtn').setAttribute('aria-expanded', open); };
document.addEventListener('pointerdown', (e) => { const f = document.querySelector('.fabs'); if (f.classList.contains('open') && !e.target.closest('.fabs')) { f.classList.remove('open'); $('moreBtn').setAttribute('aria-expanded', 'false'); } });
if ($('howBtn')) $('howBtn').onclick = () => { select(null); closeLb(); $('how').hidden = false; };
$('howClose').onclick = () => { $('how').hidden = true; };
$('lbClose').onclick = () => closeLb(true);

// ---------- البحث ----------
function search(raw, quiet) {
  const u = normUser(raw), msg = $('searchMsg');
  msg.hidden = true;
  if (!u) return;
  const p = byUser.get(u);
  if (!p) {
    if (!quiet) { msg.textContent = 'ما ظهر بيت لهذا اليوزر بعد. تأكد من كتابته أو ارجع بعد اعتماد تعليقك.'; msg.hidden = false; }
    return;
  }
  $('searchInput').blur();
  select(p);
}
$('searchForm').addEventListener('submit', (e) => { e.preventDefault(); search($('searchInput').value); });
$('searchInput').addEventListener('input', () => { $('searchMsg').hidden = true; });

// ---------- الضغط على البيوت ----------
const ray = new THREE.Raycaster();
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let down = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; $('hint').classList.add('off'); });
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || performance.now() - down.t > 600) return;
  ray.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  const hit = ray.intersectObjects(houses.children, false)[0];
  let p = hit ? hit.object.userData.plot : null;
  if (!p && ray.intersectObject(rulerMesh, true).length) p = rulerPlot;
  if (!p && estatesGroup) {
    const eh = ray.intersectObject(estatesGroup, true)[0];
    if (eh && eh.object.userData.estate) return showEstate(eh.object.userData.estate);
  }
  if (!p && civicGroup) {
    const ch = ray.intersectObject(civicGroup, true)[0];
    if (ch && ch.object.userData.civic === 'gov') return void (location.href = '/gov');
    if (ch && ch.object.userData.civic === 'lb') return openLb();
    if (ch && ch.object.userData.civic === 'mosque') return showMosque();
    if (ch && ch.object.userData.civic === 'army') return showArmy();
    if (ch && ch.object.userData.civic === 'airport') return showAirport();
    if (ch && ch.object.userData.civic === 'hospital') return showHospital();
    if (ch && ch.object.userData.civic === 'port') return showPort();
    if (ch && ch.object.userData.civic === 'court') return showCourt();
    if (ch && ch.object.userData.civic === 'bank') return showBank();
    if (ch && ch.object.userData.civic === 'university') return showUniversity();
    if (ch && ch.object.userData.civic === 'themepark') return showThemePark();
    if (ch && ch.object.userData.civic === 'ministry') return showMinistry(ch.object.userData.ministry);
  }
  if (!p) {
    const pt = ray.ray.intersectPlane(ground, new THREE.Vector3());
    if (pt) for (const q of plots.values()) {
      const dx = pt.x - q.x, dz = pt.z - q.z, c = Math.cos(q.rot), s = Math.sin(q.rot);
      if (!q.resident && isRoyal(q)) continue; // العشب قدام القصر ما ينضغط
      if (S.estates && S.estates.some((x) => x.p === q.id)) continue; // أرض عليها عقار
      if (Math.abs(dx * c - dz * s) < 7.5 && Math.abs(dx * s + dz * c) < 9) { p = q; break; }
    }
  }
  if (p) select(p, { move: p !== selected }); else if (selected) select(null);
});
bindToggle($('sndBtn'));
$('zoomIn').onclick = () => zoomBy(0.6);
$('zoomOut').onclick = () => zoomBy(1.6);
$('zoomAll').onclick = () => { select(null); flyTo(homeView()); };
setTimeout(() => $('hint').classList.add('off'), 7000);

// ---------- حركة الترقية ----------
const easeOutBack = (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const CONFETTI = [0xffc928, 0xff5d5d, 0x4fc3f7, 0x7ddc6b, 0xffffff, 0xff8fd0].map((c) => new THREE.Color(c));

function burst(p, big) {
  const n = big ? 220 : 120;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), vel = [];
  for (let i = 0; i < n; i++) {
    pos.set([p.x, 3, p.z], i * 3);
    const a = Math.random() * 6.28, sp = 5 + Math.random() * (big ? 16 : 11);
    vel.push([Math.cos(a) * sp, 12 + Math.random() * (big ? 22 : 14), Math.sin(a) * sp]);
    CONFETTI[i % CONFETTI.length].toArray(col, i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.1, vertexColors: true, transparent: true }));
  pts.frustumCulled = false;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, depthWrite: false }));
  ring.position.set(p.x, 0.4, p.z);
  fx.add(pts, ring);
  let t = 0;
  anims.push((dt) => {
    t += dt;
    for (let i = 0; i < n; i++) {
      const v = vel[i];
      v[1] -= 30 * dt;
      pos[i * 3] += v[0] * dt; pos[i * 3 + 1] = Math.max(0.3, pos[i * 3 + 1] + v[1] * dt); pos[i * 3 + 2] += v[2] * dt;
    }
    g.attributes.position.needsUpdate = true;
    pts.material.opacity = Math.max(0, 1 - Math.max(0, t - 1.5) / 0.8);
    const k = Math.min(1, t / 0.9);
    ring.scale.setScalar(1 + k * (big ? 22 : 15));
    ring.material.opacity = 1 - k;
    if (t < 2.3) return true;
    fx.remove(pts, ring); g.dispose(); ring.geometry.dispose();
    return false;
  });
}

const tags = []; // ملصقات مؤقتة فوق البيوت
function floatTag(p, html, h) {
  if (TRAILER) return; // المقطع التعريفي يرسم ملصقاته بنفسه
  const el = document.createElement('div');
  el.className = 'tag tag-up';
  el.innerHTML = html;
  $('labels').append(el);
  const item = { el, x: p.x, y: h, z: p.z };
  tags.push(item);
  setTimeout(() => { el.remove(); tags.splice(tags.indexOf(item), 1); }, 2700);
}

function playChange(p, level, isNew) {
  const old = p.mesh;
  const neu = addHouse(p, level);
  neu.scale.setScalar(0.001);
  const start = old ? 0.38 : 0.05;
  let t = 0, fired = false;
  anims.push((dt) => {
    t += dt;
    if (old && old.parent) {
      const k = Math.min(1, t / 0.36);
      old.scale.set(1 + k * 0.12, Math.max(0.02, 1 - k), 1 + k * 0.12);
      old.rotation.y = p.rot + Math.sin(t * 60) * 0.03 * (1 - k);
      if (k >= 1) houses.remove(old);
    }
    if (t >= start) {
      if (!fired) {
        fired = true;
        burst(p, level === 10);
        sfx(isNew ? 'build' : level === 10 ? 'palace' : 'upgrade');
        floatTag(p, isNew ? `🏡 بيت جديد · <b>Level ${level}</b>` : `⬆ <b>Level ${level}</b> · ${levelName(p, level)}`, HOUSE_H[level] + 5);
      }
      const k = Math.min(1, (t - start) / 0.95), e = easeOutBack(k);
      neu.scale.set(e, Math.max(0.001, easeOutBack(Math.min(1, k * 1.15))), e);
      neu.rotation.y = p.rot + (1 - k) ** 2 * 1.6;
      if (k >= 1) { neu.scale.setScalar(1); neu.rotation.y = p.rot; return false; }
    }
    return true;
  });
}

// ---------- التحديث المباشر ----------
function applyResident(ev) {
  const r = ev.resident, p = plots.get(r.p);
  if (!p) return reload();
  const prev = p.resident;
  if (prev && prev.u !== r.u) return reload();
  p.resident = { u: r.u, l: r.l, c: r.c, k: prev && prev.k, kc: prev && prev.kc, y: prev && prev.y, pt: prev && prev.pt };
  byUser.set(r.u, p);
  if (!prev) { rebuildLots(); playChange(p, r.l, true); }
  else if (prev.l !== r.l) {
    playChange(p, r.l, false);
    if (villaByUser.has(r.u)) playChange(villaByUser.get(r.u), r.l, false); // فيلته في الموج تكبر معه
  }
  renderLb();
  if (LIVE && (!prev || prev.l !== r.l)) select(p);
  else if (selected === p) renderCard();
}

async function reload() {
  const keep = selected && selected.resident ? selected.resident.u : null;
  const wasRuler = !!(selected && selected.ruler);
  S = await (await fetch('/api/state', { cache: 'no-store' })).json();
  anims.length = 0;
  disposeGroup(fx);
  buildWorld();
  document.title = S.name;
  $('brandName').textContent = S.name;
  selected = null;
  const p = keep ? byUser.get(keep) : wasRuler ? rulerPlot : null;
  if (p) select(p, { move: false }); else select(null);
  renderLb();
}

function connect() {
  const es = new EventSource('/api/events');
  let dropped = false;
  es.onmessage = (e) => {
    const ev = JSON.parse(e.data);
    if (ev.type === 'resident') applyResident(ev);
    else if (ev.type === 'estate') {
      S.estates = S.estates || [];
      if (!S.estates.some((x) => x.id === ev.estate.id)) { S.estates.push(ev.estate); addEstate(ev.estate, true); rebuildLots(); if (LIVE) showEstate(ev.estate); }
    }
    else if (ev.type === 'deco') {
      const p = byUser.get(ev.u);
      if (p && p.resident) { Object.assign(p.resident, { k: ev.k, kc: ev.kc, y: ev.y, pt: ev.pt }); addDeco(p); }
    }
    else if (ev.type === 'airport') { S.airport = { paused: !!ev.paused }; dirty = true; } // الحاكم أوقف/شغّل حركة المطار
    else if (ev.type === 'reload') reload();
  };
  es.onerror = () => { dropped = true; };
  es.onopen = () => { if (dropped) { dropped = false; reload(); } }; // بعد انقطاع: أعد المزامنة
}

// ---------- حلقة الرسم ----------
function resize() {
  if (TRAILER) return; // مقاس ثابت 1080×1920
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  dirty = true;
}
addEventListener('resize', resize);

const v3 = new THREE.Vector3();
function place(el, x, y, z) {
  v3.set(x, y, z).project(camera);
  const vis = v3.z < 1 && Math.abs(v3.x) < 1.2 && Math.abs(v3.y) < 1.2;
  el.style.visibility = vis ? 'visible' : 'hidden';
  if (vis) el.style.transform = `translate(${((v3.x + 1) / 2) * innerWidth}px, ${((1 - v3.y) / 2) * innerHeight}px) translate(-50%, -100%)`;
}

const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (fly) {
    fly.k = Math.min(1, fly.k + dt / fly.dur);
    const e = fly.k < 0.5 ? 4 * fly.k ** 3 : 1 - (-2 * fly.k + 2) ** 3 / 2;
    controls.target.lerpVectors(fly.t0, fly.t1, e);
    camera.position.lerpVectors(fly.p0, fly.p1, e);
    if (fly.k >= 1) { fly = null; controls.enabled = true; }
    dirty = true;
  }
  if (bounds) {
    const vb = viewBounds || bounds;
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, vb.x0 - 40, vb.x1 + 40);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, vb.z0 - 40, vb.z1 + 40);
    controls.target.y = 0 + (fly || freeCam ? controls.target.y : Math.min(controls.target.y, 2));
  }
  controls.maxPolarAngle = freeCam ? 1.53 : 1.18; // لقطات التصوير تقدر تنزل لمستوى الشارع
  if (controls.update()) dirty = true;
  // الضباب يبعد مع الكاميرا (اللقطات البعيدة للموج ما تطلع باهتة)
  { const dist = camera.position.distanceTo(controls.target); scene.fog.near = Math.max(700, dist * 0.9); scene.fog.far = Math.max(2800, dist * 2.8);
    // مستوى القص القريب يكبر مع بعد الكاميرا: دقة العمق أحسن، فالأرضيات المتراكبة (المطار، الطرق) ما ترمش من بعيد
    const nearWant = THREE.MathUtils.clamp(dist / 150, 4, 40);
    const farWant = Math.max(5000, dist * 3.2); // القارة كبيرة: الساحل البعيد ما ينقص
    if (Math.abs(camera.near - nearWant) > camera.near * 0.15 || Math.abs(camera.far - farWant) > camera.far * 0.15) { camera.near = nearWant; camera.far = farWant; camera.updateProjectionMatrix(); } }
  // تفاصيل الموج الصغيرة (قوارب، مظلات، نخيل، إنارة) تختفي لما الكاميرا تبعد
  if (moujGroup) {
    // قريب = الكاميرا تطالع داخل المنطقة ومب بعيدة عنها
    const t = controls.target, M = S.mouj;
    const inside = t.x > M.origin[0] - 150 && t.x < M.origin[0] + M.len + 150 && t.z < M.origin[1] + 150;
    const near = inside && camera.position.distanceTo(t) < 700;
    if (moujGroup.userData.detail.visible !== near) { moujGroup.userData.detail.visible = near; dirty = true; }
  }
  // المطار: مستوى التفصيل + الحركة (بس لما الكاميرا تطالعه، وما تكون موقوفة من الحاكم)
  if (airportGroup) {
    const c = airportGroup.userData.center, t = controls.target;
    const active = Math.hypot(t.x - c.x, t.z - c.z) < 750 && camera.position.distanceTo(c) < 1700;
    if (airportGroup.userData.update(dt, camera.position, active, !!(S.airport && S.airport.paused))) dirty = true;
  }
  if (parkGroup) { // ألعاب الملاهي تتحرك بس لما الكاميرا قريبة منها
    const c = parkGroup.userData.center, t = controls.target;
    if (parkGroup.userData.update(dt, camera.position, Math.hypot(t.x - c.x, t.z - c.z) < 800 && camera.position.distanceTo(c) < 1500)) dirty = true;
  }
  if (portGroup) { // السفينة والقاطرة تتحرك بس لما الكاميرا تطالع الميناء
    const c = portGroup.userData.center, t = controls.target;
    if (portGroup.userData.update(dt, camera.position, Math.hypot(t.x - c.x, t.z - c.z) < 900 && camera.position.distanceTo(c) < 1800)) dirty = true;
  }
  for (let i = anims.length - 1; i >= 0; i--) if (!anims[i](dt)) anims.splice(i, 1);
  if (anims.length) dirty = true;
  if (selected) {
    const h = hOf(selected) / (selected.ruler ? selected.scale : 1);
    pointer.position.set(0, h + 2.2 + Math.sin(clock.elapsedTime * 3.2) * 0.5, 0);
    pointer.rotation.y = clock.elapsedTime * 1.5;
    dirty = true;
  }
  if (!dirty) return;
  dirty = false;
  renderNow();
  if (selected) place(selTag, selected.x, hOf(selected) + 4.4, selected.z);
  if (rulerPlot) { place(rulerTag, rulerPlot.x, 23, rulerPlot.z); if (selected === rulerPlot && innerWidth >= 900) rulerTag.style.visibility = 'hidden'; }
  for (const t of tags) place(t.el, t.x, t.y, t.z);
}

function renderNow() {
  // الظل يتبع الكاميرا
  const dist = camera.position.distanceTo(controls.target);
  const half = THREE.MathUtils.clamp(dist * 0.62, 45, 420);
  if (Math.abs(half - shadowHalf) > shadowHalf * 0.08) {
    shadowHalf = half;
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 10, far: 500 });
    sun.shadow.camera.updateProjectionMatrix();
  }
  const texel = (shadowHalf * 2) / 2048 * 4;
  sun.target.position.set(Math.round(controls.target.x / texel) * texel, 0, Math.round(controls.target.z / texel) * texel);
  sun.position.copy(sun.target.position).add(SUN_OFF);
  renderer.render(scene, camera);
}

// ---------- البداية ----------
(async function start() {
  resize();
  // المقطع 3 (تحديث) يعيد تمثيل لقطة محفوظة من الموقع اللايف: public/trailer3-state.json
  const snap = /^[a-z0-9-]{1,30}$/.test(params.get('snap') || '') ? params.get('snap') : null; // ?snap=name: لقطة محفوظة للتصوير
  const stateUrl = ['3', '4'].includes(params.get('trailer')) ? `/trailer${params.get('trailer')}-state.json` : snap ? `/trailer-snap-${snap}.json` : '/api/state';
  const [st, cat] = await Promise.all([fetch(stateUrl, { cache: 'no-store' }).then((r) => r.json()), fetch('/api/catalog').then((r) => r.json()).catch(() => null)]);
  S = st;
  if (cat) { CAR_COLORS = cat.carColors; ESTATE_T = new Map((cat.estates || []).map((e) => [e.id, e])); }
  document.title = S.name;
  $('brandName').textContent = S.name;
  if (TRAILER) {
    const real = { residents: S.residents, estates: S.estates || [] };
    if (params.get('trailer') !== '4') { // المقطع 4 يعرض القارة كاملة كما هي
      S.residents = []; // المقطع يبدأ من قارة فاضية إلا من بيت الحاكم، بدون المساس بالبيانات
      S.estates = [];
    }
    buildWorld();
    document.body.classList.add('trailer');
    $('loading').classList.add('off');
    // ?trailer=1 المقطع الأول، ?trailer=2 المقطع الجديد بكل المزايا
    const { runTrailer } = await import({ 2: './trailer2.js', 3: './trailer3.js', 4: './trailer4.js' }[params.get('trailer')] || './trailer.js');
    return runTrailer({ real, civic: () => civicGroup, THREE, scene, camera, renderer, controls, plots, rulerPlot, bounds, anims, playChange, rebuildLots, renderNow, selGroup, pointer, S, LEVEL_NAMES, HOUSE_H, mat, burst });
  }
  buildWorld();
  renderLb();
  const v = homeView();
  controls.target.copy(v.t); camera.position.copy(v.p);
  controls.update();
  if (wide() && byUser.size) openLb();
  frame();
  $('loading').classList.add('off');
  connect();
  const hm = /^\/home\/([^/]+)/.exec(location.pathname);
  const u = params.get('u') || (hm && decodeURIComponent(hm[1]));
  if (u) { $('searchInput').value = u; setTimeout(() => search(u, true), 400); }
  // لقطات الموج الجاهزة للتصوير: ?view=all | marina | promenade | beach | golf
  const moujGo = (name) => { const v = S.mouj && moujView(S.mouj, name); if (v) { select(null); flyTo(v, 1.6); } return !!v; };
  // قائمة «المزيد» فيها بس: الوظائف، الحكومة، الاقتراحات، الإدارة (للحاكم). المعالم تنفتح بالضغط عليها في الخريطة أو برابط ?view=
  if (S.mouj) { const vw = params.get('view'); if (vw) setTimeout(() => moujGo(vw), 300); }
  // ?view=mosque | mosque-gate | mosque-oblique (لقطات الجامع للتصوير)
  const mv = /^mosque(?:-(all|gate|oblique))?$/.exec(params.get('view') || '');
  if (mv) setTimeout(() => { goMosque(mv[1] || 'all'); }, 350);
  const av = /^army(?:-(all|gate|back))?$/.exec(params.get('view') || ''); // ?view=army | army-gate | army-back
  if (av) setTimeout(() => { goArmy(av[1] || 'all'); }, 350);
  const mv2 = /^(baladiya|maliya|ilam|thaqafa|tijara|taqa)(?:-(all|front))?$/.exec(params.get('view') || ''); // ?view=maliya | maliya-all …
  if (mv2) setTimeout(() => { if (mv2[2]) goMinistry(mv2[1], mv2[2]); else showMinistry(mv2[1]); }, 350);
  const cv = /^court(?:-(all|front|dome))?$/.exec(params.get('view') || ''); // ?view=court | court-front | court-dome
  if (cv) setTimeout(() => { if (cv[1]) goCourt(cv[1]); else showCourt(); }, 350);
  const bv = /^bank(?:-(all|front|tower))?$/.exec(params.get('view') || ''); // ?view=bank | bank-front | bank-tower
  if (bv) setTimeout(() => { if (bv[1]) goBank(bv[1]); else showBank(); }, 350);
  const tv = /^themepark(?:-(all|wheel|coaster|water|beach))?$/.exec(params.get('view') || ''); // ?view=themepark | themepark-wheel …
  if (tv) setTimeout(() => { if (tv[1]) goThemePark(tv[1]); else showThemePark(); }, 350);
  const uv = /^university(?:-(all|front|mouj))?$/.exec(params.get('view') || ''); // ?view=university | university-front | university-mouj
  if (uv) setTimeout(() => { if (uv[1]) goUniversity(uv[1]); else showUniversity(); }, 350);
  const pv = /^port(?:-(all|cranes|ships|light))?$/.exec(params.get('view') || ''); // ?view=port | port-cranes | port-ships | port-light
  if (pv) setTimeout(() => { if (pv[1]) goPort(pv[1]); else showPort(); }, 350);
  const hv = /^hospital(?:-(all|front|er|heli))?$/.exec(params.get('view') || ''); // ?view=hospital | hospital-front | hospital-er | hospital-heli
  if (hv) setTimeout(() => { if (hv[1]) goHospital(hv[1]); else showHospital(); }, 350);
  const apv = /^airport(?:-(all|landside|apron|takeoff|night))?$/.exec(params.get('view') || ''); // ?view=airport | airport-landside | airport-apron | airport-takeoff | airport-night
  if (apv) setTimeout(() => { if (apv[1] === 'night') { setNight(true); goAirport('landside'); } else goAirport(apv[1] || 'all'); }, 350);
  const vp = plots.get(Number(params.get('villa'))); // ?villa=<رقم القطعة> من قائمة فلل الموج
  if (vp) setTimeout(() => select(vp), 400);
  const en = Number(params.get('estate'));
  if (en) { const e = (S.estates || []).find((x) => x.n === en); if (e) setTimeout(() => showEstate(e), 400); }
  setTimeout(showNotices, 1200); // رسائل الحاكم الشخصية
  // الحاكم داخل اللعبة: زر لوحة الإدارة (يطلع له بس) + عداد رسائل المسؤولين
  fetch('/api/admin/me', { cache: 'no-store' }).then((r) => r.json()).then(async (a) => {
    if (a.admin !== true) return;
    // الزر ما يكون في الصفحة أصلًا: ينضاف بس لما الخادم يأكد إن هذا الجهاز داخل كحاكم
    const f = document.createElement('a');
    f.className = 'fab fab-link fab-admin more-item'; f.id = 'adminFab'; f.href = a.path; f.innerHTML = '👑 <span>الإدارة</span>';
    $('moreBtn').before(f);
    try { const c = await (await fetch('/api/admin/chats', { cache: 'no-store' })).json(); if (c.unread) { f.querySelector('span').textContent = `الإدارة (${c.unread})`; $('moreBtn').querySelector('span').textContent = `المزيد 🔴`; } } catch { /* اختياري */ }
  }).catch(() => {});
  window.__q = { plots, byUser, select, search, camera, controls, renderer, renderNow, moujView: moujGo, mosqueView: goMosque, armyView: goArmy, airportView: goAirport, hospitalView: goHospital, portView: goPort, courtView: goCourt, bankView: goBank, universityView: goUniversity, themeparkView: goThemePark, get park() { return parkGroup; }, ministryView: goMinistry, get port() { return portGroup; }, setNight, get bounds() { return bounds; }, get coastline() { return coastline; }, get airport() { return airportGroup; }, get mosque() { return mosqueGroup; } }; // للتشخيص والتصوير
})();
