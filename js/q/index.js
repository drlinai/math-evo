// 年級與題型總表、學習進度、每次任務要出哪些題型
import { pick, sample } from './core.js?v=31';
import k1 from './k1.js?v=31';
import k2 from './k2.js?v=31';
import p1a from './p1a.js?v=31';
import p1b from './p1b.js?v=31';
import p1c from './p1c.js?v=31';
import p1d from './p1d.js?v=31';
import p2a from './p2a.js?v=31';
import p2b from './p2b.js?v=31';
import p2c from './p2c.js?v=31';
import p2d from './p2d.js?v=31';

// 年級（順序就是標題畫面上按鈕的順序）
export const GRADES = [
  { id: 'k1', zh: '中班', en: 'K1', types: k1 },
  { id: 'k2', zh: '大班', en: 'K2', types: k2 },
  { id: 'p1a', zh: '小一上（LV1）', en: 'P1 · LV1', types: p1a },
  { id: 'p1b', zh: '小一上（LV2）', en: 'P1 · LV2', types: p1b },
  { id: 'p1c', zh: '小一下（LV3）', en: 'P1 · LV3', types: p1c },
  { id: 'p1d', zh: '小一下（LV4）', en: 'P1 · LV4', types: p1d },
  { id: 'p2a', zh: '小二上（LV1）', en: 'P2 · LV1', types: p2a },
  { id: 'p2b', zh: '小二上（LV2）', en: 'P2 · LV2', types: p2b },
  { id: 'p2c', zh: '小二下（LV3）', en: 'P2 · LV3', types: p2c },
  { id: 'p2d', zh: '小二下（LV4）', en: 'P2 · LV4', types: p2d },
];
GRADES.forEach((g) => g.types.forEach((t, i) => { t.id = `${g.id}-${i + 1}`; }));
// 題型總編號 1~N（照年級與文件順序），題型測試畫面用這個編號
export const ALL = GRADES.flatMap((g) => g.types.map((type, i) => ({ grade: g, type, nth: i + 1 })));
ALL.forEach((x, i) => { x.no = i + 1; x.type.no = i + 1; });
export const gradeOf = (id) => GRADES.find((g) => g.id === id) || null;

export const NEED = 2; // 一個題型「第一次就答對」幾題算學會
const got = (prog, gid, t) => (prog[gid]?.[t.id] || 0) >= NEED;
// 學習進度（加分題不算）：{ done, total, pct }
export function progressOf(prog, gid) {
  const core = gradeOf(gid).types.filter((t) => !t.bonus), done = core.filter((t) => got(prog, gid, t)).length;
  return { done, total: core.length, pct: core.length ? Math.round((done / core.length) * 100) : 0 };
}
// 一次任務 3 關：照順序學 2 個還沒學會的題型，第 3 關複習學過的（偶爾換成加分題）
//   回傳 [{ type, mode: 'new' | 'review' | 'bonus' }]
export function planMission(prog, gid) {
  const all = gradeOf(gid).types, core = all.filter((t) => !t.bonus), bonus = all.filter((t) => t.bonus);
  const todo = core.filter((t) => !got(prog, gid, t)), known = core.filter((t) => got(prog, gid, t));
  if (!todo.length) return sample(all, 3).map((type) => ({ type, mode: type.bonus ? 'bonus' : 'review' })); // 全部學會：隨機複習
  const plan = todo.slice(0, 2).map((type) => ({ type, mode: 'new' }));
  const bonusTodo = bonus.filter((t) => !got(prog, gid, t));
  if (known.length >= 3 && bonusTodo.length && Math.random() < 0.3) plan.push({ type: bonusTodo[0], mode: 'bonus' });
  else if (known.length) plan.push({ type: pick(known), mode: 'review' });
  else if (todo[2]) plan.push({ type: todo[2], mode: 'new' });
  while (plan.length < 3) plan.push({ type: pick(all), mode: 'review' });
  return plan;
}
