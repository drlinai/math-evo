// 存檔、等級經驗、升級卡池
import { LINES, formOf } from './characters.js';
import { setLang, detectLang, formNameOf, upText } from './i18n.js';

const KEY = 'math-evo-save-v1';
export const CHAR_IDS = ['dino', 'sea', 'boy'];
const blank = () => ({ level: 1, xp: 0, up: {}, missions: 0 });

export const state = {
  current: null,
  chars: { dino: blank(), sea: blank(), boy: blank() },
  settings: { music: true, voice: true, lang: null }, // lang: null = 跟著瀏覽器語言
};

export function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw) {
      state.current = raw.current ?? null;
      CHAR_IDS.forEach((id) => { state.chars[id] = { ...blank(), ...(raw.chars?.[id] || {}) }; });
      Object.assign(state.settings, raw.settings || {});
    }
  } catch (e) { /* 壞檔就用新檔 */ }
  setLang(state.settings.lang || detectLang());
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 隱私模式 */ }
}
export function resetChar(id) { state.chars[id] = blank(); save(); }
export function chooseLang(l) { state.settings.lang = l; setLang(l); save(); }

export const xpNeed = (level) => 100 + (level - 1) * 20;
export const isEvoLevel = (level) => level % 5 === 0 && level <= 15;
export const formName = (id, level) => formNameOf(id, formOf(level));

// ---- 升級卡（三選一）：每種都會改變角色外觀；名稱與說明在 i18n ----
export const UPGRADES = [
  { id: 'strong', icon: '💪', max: 5, color: '#ff7a59' },
  { id: 'tall', icon: '🦒', max: 5, color: '#4fc38a' },
  { id: 'armor', icon: '🛡️', max: 3, color: '#8f9db0' },
  { id: 'weapon', icon: null, max: 3, color: '#e8483f' },
  { id: 'aura', icon: '✨', max: 3, color: '#7fd4ff' },
  { id: 'cape', icon: '🧣', max: 3, color: '#ff5b5b' },
  { id: 'crown', icon: '👑', max: 3, color: '#ffc93c' },
  { id: 'wings', icon: '🪶', max: 3, color: '#9ad7ff' },
  { id: 'fire', icon: '🔥', max: 3, color: '#ff8a3d' },
  { id: 'ice', icon: '❄️', max: 3, color: '#7fd4ff' },
  { id: 'thunder', icon: '⚡', max: 3, color: '#ffd43a' },
  { id: 'pet', icon: '🐣', max: 3, color: '#ff9ecb' },
];
// 取得目前語言的卡片資訊
export function upInfo(u, charId) {
  const tx = upText(u.id, charId);
  return { ...u, name: tx.name, desc: tx.desc, icon: u.icon ?? LINES[charId].weapon.icon };
}
export function drawCards(charId) {
  const ch = state.chars[charId];
  const pool = UPGRADES.filter((u) => (ch.up[u.id] || 0) < u.max);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3).map((u) => upInfo(u, charId));
}
export function power(ch) {
  return ch.level * 10 + Object.values(ch.up).reduce((a, b) => a + b * 8, 0) + formOf(ch.level) * 30;
}
