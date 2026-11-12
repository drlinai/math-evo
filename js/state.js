// 存檔、等級經驗、升級卡池
import { LINES, formOf } from './characters.js';

const KEY = 'math-evo-save-v1';
export const CHAR_IDS = ['dino', 'sea', 'boy'];
const blank = () => ({ level: 1, xp: 0, up: {}, missions: 0 });

export const state = {
  current: null,
  chars: { dino: blank(), sea: blank(), boy: blank() },
  settings: { music: true, voice: true },
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
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 隱私模式 */ }
}
export function resetChar(id) { state.chars[id] = blank(); save(); }

export const xpNeed = (level) => 100 + (level - 1) * 20;
export const isEvoLevel = (level) => level % 5 === 0 && level <= 15;
export const formName = (id, level) => LINES[id].forms[formOf(level)].name;

// ---- 升級卡（三選一）：每種都會改變角色外觀 ----
export const UPGRADES = [
  { id: 'strong', name: '變強壯', icon: '💪', max: 5, color: '#ff7a59', desc: ['身體變得更壯！', '肌肉更大了！', '壯得像座山！', '超級大力士！', '無敵壯！'] },
  { id: 'tall', name: '長高高', icon: '🦒', max: 5, color: '#4fc38a', desc: ['長高了一點！', '又長高了！', '越來越高大！', '高人一等！', '巨人等級！'] },
  { id: 'armor', name: '盔甲升級', icon: '🛡️', max: 3, color: '#8f9db0', desc: ['穿上皮革盔甲！', '換成鋼鐵盔甲！', '閃亮的黃金盔甲！'] },
  { id: 'weapon', name: null, icon: null, max: 3, color: '#e8483f', desc: ['變得更銳利！', '閃著金光！', '發出神秘藍光！'] },
  { id: 'aura', name: '能量光環', icon: '✨', max: 3, color: '#7fd4ff', desc: ['身邊出現藍色光環！', '光環變成紫色！', '金色的王者光環！'] },
  { id: 'cape', name: '英雄披風', icon: '🧣', max: 3, color: '#ff5b5b', desc: ['披上紅色披風！', '藍色的騎士披風！', '紫金色的皇家披風！'] },
  { id: 'crown', name: '王者皇冠', icon: '👑', max: 3, color: '#ffc93c', desc: ['戴上小皇冠！', '鑲著紅寶石的銀皇冠！', '閃亮的黃金大皇冠！'] },
  { id: 'wings', name: '飛天翅膀', icon: '🪶', max: 3, color: '#9ad7ff', desc: ['長出小翅膀！', '翅膀變大了！', '黃金大翅膀！'] },
  { id: 'fire', name: '火焰之力', icon: '🔥', max: 3, color: '#ff8a3d', desc: ['一顆火球繞著你轉！', '兩顆火球！', '三顆火球超威風！'] },
  { id: 'ice', name: '冰雪之力', icon: '❄️', max: 3, color: '#7fd4ff', desc: ['一片雪花繞著你轉！', '兩片雪花！', '三片雪花好酷！'] },
  { id: 'thunder', name: '閃電之力', icon: '⚡', max: 3, color: '#ffd43a', desc: ['一道閃電繞著你轉！', '兩道閃電！', '三道閃電劈哩啪啦！'] },
  { id: 'pet', name: '小夥伴', icon: '🐣', max: 3, color: '#ff9ecb', desc: ['來了一個史萊姆夥伴！', '又來一個夥伴！', '會飛的小精靈也來了！'] },
];
export function upInfo(u, charId) {
  if (u.id !== 'weapon') return u;
  return { ...u, name: LINES[charId].weapon.name, icon: LINES[charId].weapon.icon };
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
