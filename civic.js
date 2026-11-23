// معالم عامة على الخريطة: سور قصر الحاكم، مبنى الانتخابات ولوحة الوزراء فوقه، ولوحة المتصدرين الكبيرة.
import * as THREE from 'three';
import { Builder } from './houses.js';

const SAND = 0xe2c992, SAND_D = 0xc8a96c, SAND_L = 0xeedcb0;

// ---------- سور القصر ----------
// مستطيل كبير (x0..x1, z0..z1) وبوابة على طريق القصر عند gateX في الضلع الأمامي (z1)
export function palaceWall(w) {
  const b = new Builder(), H = 6, T = 2;
  const merlons = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az), n = Math.floor(len / 3.4);
    for (let i = 0; i <= n; i++) {
      const t = (i + 0.5) / (n + 1), x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      b.box(1.5, 1.4, 1.5, x, H, z, SAND_D);
    }
  };
  const seg = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2, alongX = Math.abs(bx - ax) > Math.abs(bz - az);
    if (alongX) { b.box(len, H, T, cx, 0, cz, SAND); b.box(len, 0.35, T + 0.5, cx, H - 0.35, cz, SAND_L); b.box(len, 0.6, T + 0.4, cx, 0, cz, SAND_D); }
    else { b.box(T, H, len, cx, 0, cz, SAND); b.box(T + 0.5, 0.35, len, cx, H - 0.35, cz, SAND_L); b.box(T + 0.4, 0.6, len, cx, 0, cz, SAND_D); }
    merlons(ax, az, bx, bz);
  };
  const tower = (x, z, s = 7, h = 10) => {
    b.box(s, h, s, x, 0, z, SAND); b.box(s + 0.8, 0.5, s + 0.8, x, h - 0.5, z, SAND_L);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) b.box(1.5, 1.5, 1.5, x + dx * (s / 2 - 0.4), h, z + dz * (s / 2 - 0.4), SAND_D);
    for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) b.box(dx ? 0.1 : 1, 2, dz ? 0.1 : 1, x + dx * (s / 2 + 0.02), h - 4.5, z + dz * (s / 2 + 0.02), 0x5a4630); // شبابيك
  };
  const { x0, x1, z0, z1, gateX, gateW } = w, g0 = gateX - gateW / 2, g1 = gateX + gateW / 2;
  seg(x0, z0, x1, z0); seg(x0, z0, x0, z1); seg(x1, z0, x1, z1);
  seg(x0, z1, g0 - 3.5, z1); seg(g1 + 3.5, z1, x1, z1);
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) tower(x, z);
  for (const x of [(x0 + gateX) / 2, (x1 + gateX) / 2]) { tower(x, z0, 5.5, 8.5); tower(x, z1, 5.5, 8.5); }
  for (const z of [(z0 + z1) / 2]) { tower(x0, z, 5.5, 8.5); tower(x1, z, 5.5, 8.5); }
  // البوابة: برجين وقوس فوق الطريق
  tower(g0 - 3.5, z1, 7, 13); tower(g1 + 3.5, z1, 7, 13);
  b.box(gateW, 3, T + 1, gateX, 9.5, z1, SAND); b.box(gateW + 1, 0.5, T + 1.6, gateX, 12.5, z1, SAND_L);
  for (let i = 0; i < 6; i++) b.box(1.5, 1.4, 1.5, g0 + 1 + i * (gateW - 2) / 5, 13, z1, SAND_D);
  const m = new THREE.Mesh(b.build(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  m.castShadow = true; m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m);
  // لوحة فوق البوابة
  const sign = textPlane(18, 3.2, 768, 136, (x, W, H) => {
    x.fillStyle = '#7a1f2b'; rr(x, 4, 4, W - 8, H - 8, 24); x.fill(); x.strokeStyle = '#ffd84a'; x.lineWidth = 8; x.stroke();
    x.fillStyle = '#ffd84a'; x.font = '900 70px Tajawal, "Segoe UI Emoji", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl';
    x.fillText('👑 قصر الحاكم', W / 2, H / 2 + 4);
  });
  sign.position.set(gateX, 11, z1 + T / 2 + 0.6);
  g.add(sign);
  return g;
}

// ---------- أدوات اللوحات ----------
function rr(x, X, Y, W, H, r) { x.beginPath(); x.roundRect(X, Y, W, H, r); }
function textPlane(w, h, cw, ch, draw) {
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  m.userData.redraw = (fn) => { const x = c.getContext('2d'); x.clearRect(0, 0, cw, ch); (fn || draw)(x, cw, ch); tex.needsUpdate = true; };
  m.userData.redraw(draw);
  return m;
}
const F = (w, s) => `${w} ${s}px Tajawal, "Segoe UI Emoji", sans-serif`;
const U = (s) => `700 ${s}px "Segoe UI", Roboto, sans-serif`;

// ---------- مبنى الانتخابات ----------
export function electionHall() {
  const b = new Builder(), CREAM = 0xf1ead8, STONE = 0xd8cdb4, ROOF = 0x7a1f2b;
  b.box(34, 1.2, 26, 0, 0, 0, STONE);                       // منصة
  for (let i = 0; i < 4; i++) b.box(16 - i * 0, 0.4, 2 - i * 0.4, 0, 1.2 + i * 0.4 - 1.2, 13 + 1.8 - i * 0.45, STONE); // درج
  b.box(28, 11, 18, 0, 1.2, -2, CREAM);                     // القاعة
  b.box(29, 0.8, 19, 0, 12.2, -2, STONE);
  for (let i = 0; i < 6; i++) b.cyl(0.75, 0.85, 10.2, -11 + i * 4.4, 1.2, 9, 0xfaf6ea, 14);   // أعمدة
  b.box(27, 1.2, 4, 0, 11.4, 9, STONE);                     // عتبة فوق الأعمدة
  b.gable(27, 4.5, 6, 0, 12.6, 9, ROOF);                    // جبهة مثلثة
  b.cyl(5.2, 5.6, 3, 0, 13, -2, CREAM, 24);                 // رقبة القبة
  b.ball(5.2, 0, 16, -2, 0x3f7fbf, 2);                      // قبة
  b.cyl(0.15, 0.15, 4, 0, 20.5, -2, 0xe8e4da, 6); b.box(2.2, 1.3, 0.08, 1.1, 23.2, -2, 0x2f9e5b);
  for (let i = 0; i < 5; i++) b.box(2, 4, 0.1, -10 + i * 5, 4, 7.05, 0x2d4a6b);          // شبابيك
  b.box(4, 6.5, 0.12, 0, 1.6, 7.08, 0x6b4a2b);              // باب
  // صندوق اقتراع كبير قدام الدرج
  b.box(3.2, 3, 3.2, -11, 0, 17, 0x2f6fb5); b.box(1.6, 0.15, 0.4, -11, 3, 17, 0x1d3f66);
  const m = new THREE.Mesh(b.build(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  m.castShadow = true; m.receiveShadow = true; m.userData.civic = 'gov';
  const g = new THREE.Group(); g.add(m);
  // لوحة الوزراء المنتخبين فوق المبنى
  const posts = new Builder();
  for (const x of [-12, 12]) posts.box(0.8, 12, 0.8, x, 12.6, -4, 0x3a3a3a);
  // (لوحة الوزراء تجلس فوق الأعمدة عند ارتفاع 24)
  const pm = new THREE.Mesh(posts.build(), new THREE.MeshLambertMaterial({ vertexColors: true })); pm.castShadow = true; pm.userData.civic = 'gov';
  g.add(pm);
  const panel = new THREE.Group(); panel.position.set(0, 24, -3.4); panel.rotation.x = -0.5;
  const back = new THREE.Mesh(new THREE.BoxGeometry(31, 14, 0.6).translate(0, 6.5, -0.35), new THREE.MeshLambertMaterial({ color: 0x2b2b2b }));
  back.castShadow = true; back.userData.civic = 'gov';
  const board = textPlane(30, 13, 1200, 520, () => {});
  board.position.set(0, 6.5, 0.02); board.userData.civic = 'gov';
  panel.add(back, board);
  g.add(panel);
  g.userData.board = board;
  return g;
}
export function drawGovBoard(board, gov, cityName) {
  board.userData.redraw((x, W, H) => {
    x.fillStyle = '#1f2a24'; rr(x, 6, 6, W - 12, H - 12, 40); x.fill(); x.strokeStyle = '#ffd84a'; x.lineWidth = 12; x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl';
    x.fillStyle = '#ffd84a'; x.font = F(900, 66); x.fillText('🗳️ مجلس الوزراء', W / 2, 78);
    const seats = (gov && gov.seats) || [];
    // 6 وزارات في عمودين (3 + 3)
    const rows = [['baladiya', '🏗️', 'البلدية'], ['ilam', '📣', 'الإعلام'], ['maliya', '💰', 'المالية'], ['thaqafa', '🎭', 'الثقافة'], ['tijara', '🏭', 'الصناعة والتجارة'], ['taqa', '⚡', 'الطاقة']];
    rows.forEach(([id, icon, title], i) => {
      const col = i < 3 ? 1 : 0, y = 178 + (i % 3) * 96, s = seats.find((q) => q.m === id);
      const cw = (W - 100) / 2, x0 = 40 + col * (cw + 20);
      x.fillStyle = 'rgba(255,255,255,.08)'; rr(x, x0, y - 40, cw, 80, 20); x.fill();
      x.direction = 'rtl'; x.textAlign = 'right'; x.fillStyle = '#fff'; x.font = F(900, 34); x.fillText(`${icon} ${title}`, x0 + cw - 22, y - 12, cw - 40);
      x.direction = 'ltr'; x.textAlign = 'left'; x.fillStyle = s ? '#ffd84a' : '#8fa197'; x.font = s ? U(32) : F(800, 30);
      x.fillText(s ? '@' + s.u : 'شاغر', x0 + 22, y + 22, cw - 44);
    });
    x.direction = 'rtl'; x.textAlign = 'center';
    if (gov && gov.election) { x.fillStyle = '#ff6b5f'; rr(x, W / 2 - 330, H - 88, 660, 64, 32); x.fill(); x.fillStyle = '#fff'; x.font = F(900, 40); x.fillText('🔴 الانتخابات شغالة! صوّت في صفحة الحكومة', W / 2, H - 55); }
    else { x.fillStyle = '#bfd0c5'; x.font = F(800, 36); x.fillText(`حكومة ${cityName || ''} · كل قرار بموافقة الحاكم 👑`, W / 2, H - 55); }
  });
}

// ---------- لوحة المتصدرين الكبيرة ----------
export function leaderBoard() {
  const b = new Builder();
  b.box(46, 1, 8, 0, 0, 0, 0xd9d5cb);                        // قاعدة
  for (const x of [-16, 16]) { b.box(1.4, 12, 1.4, x, 1, -0.8, 0x3a3a3a); b.box(3, 1, 3, x, 0.6, -0.8, 0x555555); }
  const m = new THREE.Mesh(b.build(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  m.castShadow = true; m.receiveShadow = true; m.userData.civic = 'lb';
  const g = new THREE.Group(); g.add(m);
  // اللوحة مايلة لورا شوي عشان تنقرا من فوق (زاوية الكاميرا المعتادة)
  const panel = new THREE.Group(); panel.position.set(0, 12, 0); panel.rotation.x = -0.55;
  const fb = new Builder();
  fb.box(44, 26, 1, 0, -1, -0.6, 0x1f2a24);
  for (let i = 0; i < 6; i++) fb.box(1.6, 1.6, 0.8, -15 + i * 6, 25, -0.3, 0xffd84a);
  const frame = new THREE.Mesh(fb.build(), new THREE.MeshLambertMaterial({ vertexColors: true })); frame.castShadow = true; frame.userData.civic = 'lb';
  const board = textPlane(42, 24, 1260, 720, () => {});
  board.position.set(0, 12, 0.02); board.userData.civic = 'lb';
  panel.add(frame, board);
  g.add(panel);
  g.userData.board = board;
  return g;
}
export function drawLeaderBoard(board, top, cityName) {
  board.userData.redraw((x, W, H) => {
    const grd = x.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#24382c'); grd.addColorStop(1, '#162119');
    x.fillStyle = grd; x.fillRect(0, 0, W, H);
    x.textBaseline = 'middle'; x.textAlign = 'center'; x.direction = 'rtl';
    x.fillStyle = '#ffd84a'; x.font = F(900, 74); x.fillText(`🏆 المتصدرين في ${cityName || 'القارة'}`, W / 2, 80);
    const medal = ['🥇', '🥈', '🥉'];
    top.slice(0, 10).forEach((r, i) => {
      const col = i < 5 ? 0 : 1, row = i % 5, cx = col ? W * 0.27 : W * 0.75, y = 190 + row * 104, w = W * 0.45;
      x.fillStyle = i < 3 ? 'rgba(255,216,74,.16)' : 'rgba(255,255,255,.07)'; rr(x, cx - w / 2, y - 42, w, 84, 22); x.fill();
      x.direction = 'rtl'; x.textAlign = 'right'; x.fillStyle = '#fff'; x.font = F(900, 46);
      x.fillText(medal[i] || String(i + 1), cx + w / 2 - 24, y + 3);
      x.direction = 'ltr'; x.textAlign = 'right'; x.fillStyle = i < 3 ? '#ffd84a' : '#fff'; x.font = U(40);
      x.fillText('@' + r.u, cx + w / 2 - 100, y + 3, w - 250);
      x.textAlign = 'left'; x.fillStyle = r.l === 10 ? '#ffd84a' : '#9fd8b0'; x.font = U(36);
      x.fillText(r.l === 10 ? 'L10 👑' : 'L' + r.l, cx - w / 2 + 22, y + 3);
    });
    if (!top.length) { x.fillStyle = '#bfd0c5'; x.font = F(800, 44); x.fillText('علّق على الريل وكن أول المتصدرين!', W / 2, H / 2); }
  });
}
