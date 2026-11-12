// 語音（瀏覽器內建 zh-TW）、音效與背景音樂（WebAudio 合成，不需音檔）
import { state, save } from './state.js';

let ctx = null, voice = null, musicTimer = null, musicStep = 0, master = null;

function pickVoice() {
  const vs = window.speechSynthesis?.getVoices() ?? [];
  voice = vs.find((v) => v.lang === 'zh-TW' && /Mei|美佳/.test(v.name)) || vs.find((v) => v.lang === 'zh-TW') || vs.find((v) => v.lang.startsWith('zh')) || null;
}

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    }
    pickVoice();
    window.speechSynthesis?.addEventListener?.('voiceschanged', pickVoice);
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis?.speak(u); } catch (e) { /* 無語音環境 */ }
  }
  if (ctx?.state === 'suspended') ctx.resume();
  if (state.settings.music) startMusic();
}

export function speak(text, { rate = 0.92 } = {}) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth || !state.settings.voice) return setTimeout(resolve, 350);
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = 'zh-TW'; u.rate = rate; u.pitch = 1.1;
    let done = false;
    const fin = () => { if (!done) { done = true; resolve(); } };
    u.onend = fin; u.onerror = fin;
    synth.speak(u);
    setTimeout(() => { if (!synth.speaking && !synth.pending) fin(); }, 600);
    setTimeout(fin, 1200 + text.length * 330);
  });
}
export const stopSpeak = () => window.speechSynthesis?.cancel();

function tone(freq, dur, delay = 0, type = 'sine', vol = 0.16, slideTo = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, delay = 0, vol = 0.2, hp = 800) {
  if (!ctx) return;
  const t = ctx.currentTime + delay, n = ctx.sampleRate * dur, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = hp; src.buffer = buf; g.gain.value = vol;
  src.connect(f).connect(g).connect(master); src.start(t);
}

export const sfx = {
  tap: () => tone(700, 0.07, 0, 'triangle', 0.1),
  pop: () => tone(520, 0.09, 0, 'sine', 0.14, 900),
  coin: () => { tone(988, 0.08, 0, 'square', 0.06); tone(1319, 0.18, 0.07, 'square', 0.06); },
  correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, i * 0.09, 'triangle', 0.15)),
  wrong: () => { tone(300, 0.16, 0, 'sine', 0.1, 220); },
  star: () => { tone(1175, 0.1, 0, 'triangle', 0.12); tone(1568, 0.2, 0.08, 'triangle', 0.12); },
  card: () => { noise(0.08, 0, 0.1, 2000); tone(440, 0.1, 0.02, 'triangle', 0.08, 660); },
  levelup: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, i * 0.1, 'square', 0.07)),
  hit: () => { noise(0.18, 0, 0.3, 300); tone(160, 0.2, 0, 'sawtooth', 0.14, 60); },
  swing: () => { noise(0.14, 0, 0.12, 1800); },
  defeat: () => { [600, 500, 400, 300, 200].forEach((f, i) => tone(f, 0.12, i * 0.07, 'square', 0.08)); noise(0.5, 0.3, 0.2, 500); },
  charge: () => tone(200, 1.4, 0, 'sawtooth', 0.07, 1400),
  evolve: () => { [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.3, i * 0.12, 'triangle', 0.14)); [523, 659, 784].forEach((f) => tone(f, 1.2, 0.9, 'sine', 0.08)); },
  fanfare: () => { [[523, 0], [523, 0.14], [523, 0.28], [698, 0.42], [659, 0.7], [698, 0.84], [784, 0.98]].forEach(([f, d]) => tone(f, 0.26, d, 'square', 0.07)); },
};

// ---- 背景音樂：輕快的五聲音階小循環 ----
const CHORDS = [[262, 330, 392], [220, 262, 330], [175, 220, 262], [196, 247, 294]];
const MELODY = [784, 0, 659, 784, 880, 0, 784, 659, 587, 0, 523, 587, 659, 0, 587, 0, 698, 0, 587, 698, 784, 0, 698, 587, 523, 0, 587, 659, 587, 0, 523, 0];
function musicTick() {
  const bar = Math.floor(musicStep / 8) % 4, beat = musicStep % 8, ch = CHORDS[bar];
  if (beat % 2 === 0) tone(ch[(beat / 2) % 3], 0.3, 0, 'sine', 0.035);
  if (beat === 0) tone(ch[0] / 2, 0.6, 0, 'triangle', 0.05);
  const m = MELODY[musicStep % 32];
  if (m) tone(m, 0.22, 0, 'triangle', 0.03);
  musicStep++;
}
export function startMusic() {
  if (musicTimer || !ctx) return;
  musicTimer = setInterval(musicTick, 230);
}
export function stopMusic() { clearInterval(musicTimer); musicTimer = null; }
export function toggleMusic() {
  state.settings.music = !state.settings.music; save();
  state.settings.music ? startMusic() : stopMusic();
  return state.settings.music;
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopMusic(); stopSpeak(); } else if (state.settings.music && ctx) startMusic();
});
