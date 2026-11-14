// 語音（瀏覽器內建 zh-TW）、音效與背景音樂（WebAudio 合成，不需音檔）
import { state, save } from './state.js?v=32';
import { getLang } from './i18n.js?v=32';
import { chooseVoice } from './voices.js?v=32';

let ctx = null, musicTimer = null, musicStep = 0, master = null;
const voices = { zh: null, en: null };
let currentUtter = null; // 保留參照，避免 Safari 把語音物件回收而收不到結束事件
let everStarted = false; // 這次開啟後，語音是否真的開始唸過

let remoteOk = true; // 線上語音（Google / Edge）這次能不能用；失敗過就改用裝置內建的
function pickVoice() {
  const vs = window.speechSynthesis?.getVoices() ?? [];
  voices.zh = chooseVoice(vs, 'zh', remoteOk);
  voices.en = chooseVoice(vs, 'en', remoteOk);
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

// 中文語音的唸法修正：只改「唸出來」的字，畫面上的字不變
//   分數唸「二分之一」（不是「兩分之一」）、「第 2 個」唸「第二個」、量詞前面的 2 唸「兩」（2 星期 → 兩星期）
const ZD = '零一二三四五六七八九';
const zhInt = (n) => { n = +n; return n < 10 ? ZD[n] : n < 20 ? `十${n % 10 ? ZD[n % 10] : ''}` : n < 100 ? `${ZD[Math.floor(n / 10)]}十${n % 10 ? ZD[n % 10] : ''}` : String(n); };
const LIANG = '星期|週|個|隻|顆|條|片|輛|根|盒|支|枝|塊|張|本|位|包|袋|瓶|杯|盤|排|組|份|堆|串|雙|對|種|次|倍|天|年(?!級)|小時|分鐘|公尺|公分|公斤|公克|公升|元|頭|把|封|台|件|朵|棵|層|格|步|圈|人|點|籃|箱|罐|碗|桶|群|列|行|邊|段|節|頁|歲';
const LIANG_RE = new RegExp(`(^|[^\\d.])2\\s*(?=${LIANG})`, 'g');
export const zhSay = (text) => String(text)
  .replace(/(\d+)\s*分之\s*(\d+)/g, (m, b, a) => `${zhInt(b)}分之${zhInt(a)}`)
  .replace(/第\s*2(?![\d.])/g, '第二')
  .replace(LIANG_RE, '$1兩');

// 唸一句話；Promise 會等到「真的唸完」才結束，流程用它來決定何時切換畫面
export function speak(text, { rate } = {}) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth || !state.settings.voice || !text) return setTimeout(resolve, 500);
    const lang = getLang();
    const go = () => {
      const u = new SpeechSynthesisUtterance(lang === 'en' ? text : zhSay(text));
      if (voices[lang]) u.voice = voices[lang];
      u.lang = lang === 'en' ? 'en-US' : 'zh-TW';
      u.rate = rate ?? (lang === 'en' ? 0.92 : 0.95);
      u.pitch = 1; // 用聲音原本的音調最自然（之前調高到 1.1 會有機械感）
      let done = false, started = false, t1 = 0, t2 = 0, poll = 0;
      const fin = () => { if (done) return; done = true; clearTimeout(t1); clearTimeout(t2); clearInterval(poll); if (currentUtter === u) currentUtter = null; resolve(); };
      u.onstart = () => { started = true; everStarted = true; };
      u.onend = fin; u.onerror = fin;
      currentUtter = u;
      synth.speak(u);
      // 有開始唸 → 一定等到唸完（onend 沒來時，用「已不在講話」當備援判斷）
      poll = setInterval(() => { if (started && !synth.speaking && !synth.pending) fin(); }, 300);
      // 3.5 秒都沒開始唸 → 這台裝置的語音不能用，直接放行（之前只等 0.6 秒，iPad 起音慢會被誤判而切斷）
      t1 = setTimeout(() => {
        if (started) return;
        // 線上語音沒反應（例如沒網路）→ 這次改用裝置內建語音
        if (u.voice && u.voice.localService === false) { remoteOk = false; pickVoice(); }
        fin();
      }, 3500);
      // 保險上限：依字數估計，給得很寬鬆
      t2 = setTimeout(fin, 6000 + text.length * (lang === 'en' ? 130 : 450));
    };
    // 先停掉上一句，然後「立刻」唸：Safari / iPad 要求語音必須在點擊當下同步發出，延後就會整個靜音
    synth.cancel();
    go();
  });
}
export const stopSpeak = () => window.speechSynthesis?.cancel();
// 給設定頁的「試聽」用：這台裝置的語音狀況
export function voiceInfo() {
  pickVoice();
  return { supported: !!window.speechSynthesis, count: window.speechSynthesis?.getVoices().length ?? 0, zh: voices.zh?.name || null, en: voices.en?.name || null, started: everStarted };
}
export function resetVoiceProbe() { everStarted = false; }

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
