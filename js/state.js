// 存檔、等級經驗、升級卡池
import { formOf, upIcon, upReady } from './sprites.js?v=8';
import { setLang, detectLang, formNameOf, upText } from './i18n.js?v=8';

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
      CHAR_IDS.forEach((id) => {
        state.chars[id] = { ...blank(), ...(raw.chars?.[id] || {}) };
        Object.keys(state.chars[id].up).forEach((k) => { if (!UPGRADES.some((u) => u.id === k)) delete state.chars[id].up[k]; }); // 已取消的卡（盾牌、武器）
      });
      Object.assign(state.settings, raw.settings || {});
      // 設定版本 2：語音與音樂一律回到「開」（之前可能被關掉）
      if (state.settings.sv !== 2) { state.settings.voice = true; state.settings.music = true; }
    }
  } catch (e) { /* 壞檔就用新檔 */ }
  state.settings.sv = 2;
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
  { id: 'strong', max: 5, color: '#ff7a59' },
  { id: 'tall', max: 5, color: '#4fc38a' },
  { id: 'aura', max: 3, color: '#7fd4ff' },
  { id: 'cape', max: 3, color: '#ff5b5b' },
  { id: 'crown', max: 3, color: '#ffc93c' },
  { id: 'wings', max: 3, color: '#9ad7ff' },
  { id: 'fire', max: 3, color: '#ff8a3d' },
  { id: 'ice', max: 3, color: '#7fd4ff' },
  { id: 'thunder', max: 3, color: '#ffd43a' },
  { id: 'pet', max: 3, color: '#ff9ecb' },
  { id: 'skel', max: 3, color: '#aab6c6' },
  { id: 'tree', max: 3, color: '#6fbf5a' },
  { id: 'clone', max: 3, color: '#9a86ff' },
  { id: 'ki', max: 3, color: '#ffc21a' },
];
// 取得目前語言的卡片資訊；tier=要顯示第幾階的圖（皇冠、翅膀…每一階長得不一樣）
export function upInfo(u, charId, tier = 1) {
  const tx = upText(u.id, charId);
  return { ...u, name: tx.name, desc: tx.desc, icon: upIcon(u.id, charId, tier) };
}
export function drawCards(charId) {
  const ch = state.chars[charId];
  const pool = UPGRADES.filter((u) => (ch.up[u.id] || 0) < u.max && upReady(u.id));
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3).map((u) => upInfo(u, charId, (ch.up[u.id] || 0) + 1));
}
export function power(ch) {
  return ch.level * 10 + Object.values(ch.up).reduce((a, b) => a + b * 8, 0) + formOf(ch.level) * 30;
}
