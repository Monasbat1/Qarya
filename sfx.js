// مؤثرات صوتية مولّدة بالكامل في المتصفح (Web Audio) — بدون ملفات صوت.
// المتصفحات تمنع الصوت قبل أول لمسة، فالصوت يشتغل بعد أول ضغطة في الصفحة.
let ctx = null, master = null;
let on = (() => { try { return localStorage.getItem('qsfx') !== '0'; } catch { return true; } })();

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
const unlock = () => ac();
addEventListener('pointerdown', unlock, { capture: true });
addEventListener('keydown', unlock, { capture: true });

export const soundOn = () => on;
export function setSound(v) {
  on = !!v;
  try { localStorage.setItem('qsfx', on ? '1' : '0'); } catch { /* نتجاوز */ }
  if (!on) engine(null);
  for (const b of document.querySelectorAll('[data-sfx-toggle]')) b.textContent = on ? '🔊' : '🔇';
}
// زر كتم/تشغيل: أي عنصر فيه data-sfx-toggle
export function bindToggle(el) {
  el.dataset.sfxToggle = '1';
  el.textContent = on ? '🔊' : '🔇';
  el.setAttribute('aria-label', 'الصوت');
  el.addEventListener('click', () => { setSound(!on); if (on) sfx('click'); });
}

const ready = () => on && ac() && ctx.state === 'running';

function tone(f, t, dur, o = {}) {
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(f, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.slide || dur));
  if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vibAmt || f * 0.03; l.connect(lg).connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
  const v = o.vol ?? 0.2, a = o.attack ?? 0.006;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let out = g;
  if (o.filter) { const fl = ctx.createBiquadFilter(); fl.type = o.filter; fl.frequency.value = o.ff || 1200; fl.Q.value = o.q || 1; g.connect(fl); out = fl; }
  osc.connect(g); out.connect(master);
  osc.start(t); osc.stop(t + dur + 0.05);
}
let noiseBuf = null;
function noise(t, dur, o = {}) {
  if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noiseBuf; src.loop = true;
  fl.type = o.type || 'lowpass'; fl.frequency.setValueAtTime(o.f || 1000, t); fl.Q.value = o.q || 0.8;
  if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  const v = o.vol ?? 0.15;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.attack ?? 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(fl).connect(g).connect(master);
  src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
}
const arp = (t, notes, step, o) => notes.forEach((f, i) => tone(f, t + i * step, o.dur || 0.3, o));

const SOUNDS = {
  click: (t) => tone(880, t, 0.06, { to: 620, vol: 0.08 }),
  coin: (t) => { tone(988, t, 0.1, { type: 'square', vol: 0.07 }); tone(1319, t + 0.08, 0.32, { type: 'square', vol: 0.07 }); },
  cash: (t) => { noise(t, 0.08, { type: 'highpass', f: 3000, vol: 0.12 }); tone(1568, t + 0.05, 0.25, { type: 'triangle', vol: 0.12 }); tone(2093, t + 0.12, 0.5, { type: 'triangle', vol: 0.12 }); tone(2637, t + 0.12, 0.6, { vol: 0.05 }); },
  error: (t) => { tone(190, t, 0.14, { type: 'square', vol: 0.06 }); tone(150, t + 0.12, 0.2, { type: 'square', vol: 0.06 }); },
  build: (t) => { noise(t, 0.45, { type: 'bandpass', f: 400, to: 2400, q: 1.2, vol: 0.12 }); arp(t + 0.25, [523, 659, 784, 1047], 0.08, { type: 'triangle', vol: 0.12, dur: 0.35 }); },
  upgrade: (t) => { arp(t, [523, 659, 784, 988, 1175], 0.06, { type: 'triangle', vol: 0.11, dur: 0.3 }); for (let i = 0; i < 4; i++) tone(2400 + i * 300, t + 0.32 + i * 0.05, 0.12, { vol: 0.03 }); },
  palace: (t) => { arp(t, [392, 523, 659, 784], 0.12, { type: 'square', vol: 0.06, dur: 0.5, filter: 'lowpass', ff: 2200 }); tone(1047, t + 0.5, 1.1, { type: 'triangle', vol: 0.14, vib: 5.5 }); tone(784, t + 0.5, 1.1, { type: 'triangle', vol: 0.08 }); noise(t + 0.5, 0.6, { type: 'highpass', f: 5000, vol: 0.04 }); },
  step: (t) => noise(t, 0.05, { f: 700 + Math.random() * 300, vol: 0.06 }),
  stepIn: (t) => { noise(t, 0.045, { f: 420 + Math.random() * 120, vol: 0.08 }); tone(140 + Math.random() * 30, t, 0.05, { vol: 0.03 }); },
  door: (t) => { tone(260, t, 0.18, { to: 170, vol: 0.06, type: 'triangle' }); noise(t + 0.16, 0.06, { f: 600, vol: 0.12 }); },
  place: (t) => { tone(150, t, 0.16, { to: 80, vol: 0.22 }); noise(t, 0.06, { f: 500, vol: 0.1 }); },
  rotate: (t) => tone(1500, t, 0.03, { type: 'square', vol: 0.03 }),
  remove: (t) => tone(500, t, 0.14, { to: 180, vol: 0.1, type: 'triangle' }),
  carDoor: (t) => { noise(t, 0.09, { f: 350, vol: 0.2 }); tone(90, t, 0.12, { vol: 0.15 }); },
  bird: (t) => { const f = 2600 + Math.random() * 1200; tone(f, t, 0.07, { to: f * 1.35, vol: 0.025 }); tone(f * 1.1, t + 0.1, 0.06, { to: f * 1.5, vol: 0.02 }); },
  // الحيوانات
  cat: (t) => tone(520, t, 0.55, { type: 'sawtooth', to: 780, slide: 0.25, vol: 0.06, filter: 'bandpass', ff: 1400, q: 2, vib: 7, vibAmt: 12 }),
  dog: (t) => { for (const d of [0, 0.2]) { tone(330, t + d, 0.12, { type: 'square', to: 190, vol: 0.07, filter: 'lowpass', ff: 1500 }); noise(t + d, 0.08, { type: 'bandpass', f: 900, vol: 0.07 }); } },
  rabbit: (t) => { tone(1800, t, 0.05, { vol: 0.03 }); tone(2000, t + 0.08, 0.05, { vol: 0.03 }); },
  parrot: (t) => { tone(1500, t, 0.12, { type: 'sawtooth', to: 2400, vol: 0.04, filter: 'bandpass', ff: 2000, q: 3 }); tone(2200, t + 0.15, 0.12, { type: 'sawtooth', to: 1400, vol: 0.04, filter: 'bandpass', ff: 2000, q: 3 }); },
  falcon: (t) => tone(2600, t, 0.5, { type: 'sawtooth', to: 1700, vol: 0.05, filter: 'bandpass', ff: 2500, q: 4, vib: 18, vibAmt: 60 }),
  chicken: (t) => { for (let i = 0; i < 3; i++) tone(620 + i * 40, t + i * 0.11, 0.07, { type: 'square', to: 420, vol: 0.05, filter: 'bandpass', ff: 1100 }); },
  sheep: (t) => tone(330, t, 0.7, { type: 'sawtooth', vol: 0.06, filter: 'bandpass', ff: 1000, q: 2, vib: 9, vibAmt: 18 }),
  goat: (t) => tone(420, t, 0.55, { type: 'sawtooth', vol: 0.06, filter: 'bandpass', ff: 1300, q: 2, vib: 11, vibAmt: 25 }),
  horse: (t) => tone(950, t, 0.9, { type: 'sawtooth', to: 420, vol: 0.06, filter: 'bandpass', ff: 1500, q: 2, vib: 14, vibAmt: 50 }),
  live_camel: (t) => tone(140, t, 0.8, { type: 'sawtooth', to: 95, vol: 0.09, filter: 'lowpass', ff: 600, vib: 6, vibAmt: 8 }),
};

export function sfx(name) {
  if (!ready() || !SOUNDS[name]) return;
  SOUNDS[name](ctx.currentTime + 0.01);
}
export const hasSound = (name) => !!SOUNDS[name];

// محرك السيارة: engine(0..1) يشغّل ويغيّر السرعة، engine(null) يطفي
let eng = null;
export function engine(level) {
  if (level === null) {
    if (eng && ctx) { const t = ctx.currentTime; eng.g.gain.cancelScheduledValues(t); eng.g.gain.setTargetAtTime(0.0001, t, 0.12); const e = eng; setTimeout(() => { try { e.a.stop(); e.b.stop(); } catch { /* نتجاوز */ } }, 600); }
    eng = null;
    return;
  }
  if (!ready()) return;
  const t = ctx.currentTime;
  if (!eng) {
    const a = ctx.createOscillator(), b = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    a.type = 'sawtooth'; b.type = 'square'; b.detune.value = 8;
    f.type = 'lowpass'; f.frequency.value = 500; f.Q.value = 2;
    g.gain.value = 0.0001;
    a.connect(f); b.connect(f); f.connect(g).connect(master);
    a.start(); b.start();
    eng = { a, b, f, g };
  }
  const k = Math.min(1, Math.max(0, level));
  eng.a.frequency.setTargetAtTime(42 + k * 95, t, 0.08);
  eng.b.frequency.setTargetAtTime(21 + k * 48, t, 0.08);
  eng.f.frequency.setTargetAtTime(380 + k * 1100, t, 0.1);
  eng.g.gain.setTargetAtTime(0.05 + k * 0.05, t, 0.1);
}
