// 小一下 LV4（新加坡 P1 Term 4）：35 種題型。除法（只用圖和文字，不出現除號）、時間、錢。
// 每個題型只是「概念」：東西、人名、情境、數字每次都隨機換。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, thing, cnt, who, who2, sayOf, FOODS, TOYS } from './core.js?v=22';
import { items, grp, row, col, fig, emo, label, pic, bigEq, groups, clock, timeStr, digital, coin, note, cash, change, calendar } from './vis.js?v=22';

const T = { div: ['除法', 'Division', '🍪'], time: ['時間', 'Time', '🕐'], money: ['錢', 'Money', '💰'], mix: ['綜合', 'Mixed practice', '🧠'], bonus: ['加分題', 'Bonus', '⭐'] };
const sum = (a) => a.reduce((x, y) => x + y, 0);
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// ---------- 除法用的小工具 ----------
// 分給誰（k 是適合分給他們的東西）、用什麼裝
const KIDS = ['👦', '👧', '🧒'], STUFF = [...FOODS, ...TOYS];
const EATERS = [
  { zh: '小朋友', m: '個', en: 'child', ens: 'children', e: KIDS, k: STUFF }, { zh: '朋友', m: '個', en: 'friend', ens: 'friends', e: KIDS, k: STUFF },
  { zh: '小狗', m: '隻', en: 'puppy', ens: 'puppies', e: ['🐶'], k: ['cookie', 'apple'] }, { zh: '小貓', m: '隻', en: 'kitten', ens: 'kittens', e: ['🐱'], k: ['fish', 'cookie'] },
  { zh: '兔子', m: '隻', en: 'rabbit', ens: 'rabbits', e: ['🐰'], k: ['apple', 'banana'] }, { zh: '猴子', m: '隻', en: 'monkey', ens: 'monkeys', e: ['🐵'], k: ['banana', 'apple'] },
];
const BOXES = [{ zh: '袋子', m: '袋', en: 'bag', ens: 'bags', e: '🛍️' }, { zh: '盒子', m: '盒', en: 'box', ens: 'boxes', e: '📦' }, { zh: '盤子', m: '盤', en: 'plate', ens: 'plates', e: '🍽️' }, { zh: '籃子', m: '籃', en: 'basket', ens: 'baskets', e: '🧺' }];
const faces = (list, g) => range(0, g - 1).map((i) => list[i % list.length]);
// [g 份, 每份 e 個]：總數不超過 max、可以整除
const gePair = (max, gHi = 5, eHi = 5) => pick(range(2, gHi).flatMap((g) => range(2, eHi).filter((e) => g * e <= max).map((e) => [g, e])));
// 一盤 n 個
const plate = (key, n, size) => `<div class="plate2">${items(key, n, { size: size ?? (n > 6 ? 'xs' : 'sm'), cols: n > 6 ? 5 : n > 4 ? 3 : 2 })}</div>`;
// 分好的樣子：counts 每一份幾個；top 每一份上面的表情符號
const shared = (key, counts, top, size) => `<div class="vrow wrap">${counts.map((n, i) => `<div class="vcol" style="gap:0">${top ? emo(top[i], 40) : ''}${plate(key, n, size)}</div>`).join('')}</div>`;
// 還沒分：上面一堆東西，下面是要分給誰／用什麼裝（表情符號）
const unshared = (key, n, top) => col(grp(items(key, n, { size: 'sm', cols: 10 })), top ? `<div class="vrow" style="gap:14px">${top.map((f) => emo(f, 46)).join('')}</div>` : '');

// ---------- 時間用的小工具 ----------
// 時間的唸法：8 點半／half past 8、8 點 25 分／8 25
const tSay = (h, m) => (m === 0 ? L(`${h}點`, `${h} o'clock`) : m === 30 ? L(`${h}點半`, `half past ${h}`) : L(`${h}點${m}分`, `${h} ${m < 10 ? 'oh ' : ''}${m}`));
const nextH = (h) => (h % 12) + 1, prevH = (h) => ((h + 10) % 12) + 1;
// 和 (h, m) 不一樣、容易看錯的 n 個時刻：長短針對調、差一小時、分針差一點
const nearTimes = (h, m, n) => {
  const key = (t) => (t[0] % 12) * 60 + t[1], seen = new Set([key([h, m])]);
  const cand = [[m / 5 || 12, (h % 12) * 5], ...shuffle([[nextH(h), m], [prevH(h), m], [h, (m + 30) % 60], [h, (m + 15) % 60], [h, (m + 45) % 60]])];
  return cand.filter((t) => !seen.has(key(t)) && seen.add(key(t))).slice(0, n);
};
// 只有分針的時鐘（拿掉 clock() 畫的時針）
const minClock = (m, s) => clock(12, m, { s }).replace(/<line [^>]*stroke-width="9"[^>]*\/>/, '');
const PERIODS = [{ zh: '早上', at: 'in the morning', e: '🌅' }, { zh: '下午', at: 'in the afternoon', e: '☀️' }, { zh: '傍晚', at: 'in the evening', e: '🌆' }, { zh: '晚上', at: 'at night', e: '🌙' }];
// 一天的活動：p 時段、h 可能的整點、x 不適合當錯誤選項的時段、a:1 只用在「幾點做什麼」
const DAILY = [
  { p: 0, e: '⏰', zh: '起床', en: 'wake up', h: [6, 7] }, { p: 0, e: '🥣', zh: '吃早餐', en: 'eat breakfast', h: [7, 8] }, { p: 0, e: '🎒', zh: '上學', en: 'go to school', h: [7, 8] },
  { p: 1, e: '🍱', zh: '吃午餐', en: 'eat lunch', h: [1], a: 1 }, { p: 1, e: '🏠', zh: '放學回家', en: 'go home from school', h: [2, 3, 4] },
  { p: 2, e: '🍛', zh: '吃晚餐', en: 'eat dinner', h: [6], x: 3 }, { p: 2, e: '🌇', zh: '看夕陽', en: 'watch the sunset', h: [6] },
  { p: 3, e: '😴', zh: '上床睡覺', en: 'go to bed', h: [9, 10] }, { p: 3, e: '✨', zh: '看星星', en: 'look at the stars', h: [9, 10] },
];
// 兩個人都會做的事（比誰早）：h 可能的小時
const DO = [{ zh: '起床', en: 'wakes up', h: [6, 7] }, { zh: '到學校', en: 'gets to school', h: [7] }, { zh: '回到家', en: 'gets home', h: [1, 2, 3, 4] }, { zh: '吃晚餐', en: 'has dinner', h: [6, 7] }, { zh: '上床睡覺', en: 'goes to bed', h: [8, 9] }];

// ---------- 錢用的小工具 ----------
const cents = (n) => L(`${n} 分`, `${n} ${pl(n, 'cent', 'cents')}`), dollars = (n) => L(`${n} 元`, `${n} ${pl(n, 'dollar', 'dollars')}`);
const amount = (c) => (c >= 100 ? dollars(c / 100) : cents(c));                     // c 是「分」
const tagC = (n) => L(`${n} 分`, `${n}¢`), tagD = (n) => L(`${n} 元`, `$${n}`);      // 標價
const an = (n) => (/^(8|11|18)/.test(String(n)) ? 'an' : 'a');
const big = (h, k = 1.6) => `<span style="display:inline-block;transform:scale(${k})">${h}</span>`;
const money = (list) => `<div class="moneyrow">${list.map(cash).join('')}</div>`;   // list 的單位是「分」
// 一把硬幣或紙鈔：從 denoms 隨機拿 nLo~nHi 個（由大到小排），總和不超過 max
const purse = (denoms, nLo, nHi, max) => { for (;;) { const list = range(1, rnd(nLo, nHi)).map(() => pick(denoms)).sort((a, b) => b - a); if (sum(list) <= max) return list; } };
const SHOP = [{ e: '🧸', zh: '玩具熊', en: 'teddy bear' }, { e: '🚗', zh: '玩具車', en: 'toy car' }, { e: '🪁', zh: '風箏', en: 'kite' }, { e: '⚽', zh: '足球', en: 'football' }, { e: '📕', zh: '故事書', en: 'storybook' },
  { e: '🎒', zh: '書包', en: 'school bag' }, { e: '🤖', zh: '機器人', en: 'robot' }, { e: '🧩', zh: '拼圖', en: 'puzzle' }, { e: '🖊️', zh: '原子筆', en: 'pen' }, { e: '📒', zh: '筆記本', en: 'notebook' }];
const SMALL = [{ e: '🍬', zh: '糖果', en: 'sweet' }, { e: '🍪', zh: '餅乾', en: 'biscuit' }, { e: '🍭', zh: '棒棒糖', en: 'lollipop' }, { e: '🎈', zh: '氣球', en: 'balloon' }, { e: '✏️', zh: '鉛筆', en: 'pencil' },
  { e: '🍌', zh: '香蕉', en: 'banana' }, { e: '📏', zh: '尺', en: 'ruler' }, { e: '🥚', zh: '茶葉蛋', en: 'tea egg' }];
// 福利社：是不是「剛好花完 B」的買法都一定是一樣喝的＋一樣吃的
const oneEach = (ds, ss, B) => {
  const all = [...ds, ...ss];
  for (let m = 1; m < 1 << all.length; m++) { let s = 0, nd = 0, ns = 0; all.forEach((v, i) => { if ((m >> i) & 1) { s += v; if (i < ds.length) nd++; else ns++; } }); if (s === B && (nd !== 1 || ns !== 1)) return false; }
  return true;
};

// ---------- 月曆、星期 ----------
const WD = [['星期日', 'Sunday'], ['星期一', 'Monday'], ['星期二', 'Tuesday'], ['星期三', 'Wednesday'], ['星期四', 'Thursday'], ['星期五', 'Friday'], ['星期六', 'Saturday']];
const wd = (i) => L(WD[i][0], WD[i][1]);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ORD = [['一', 'first'], ['二', 'second'], ['三', 'third'], ['四', 'fourth']];

export default [
  // ---- 除法（只用圖和文字）----
  def(T.div, '平分', 'Sharing equally', (d) => {
    const r = pick(EATERS), it = thing(r.k), [g, e] = gePair(d ? 20 : 12, 5, 6), t = g * e, done = d === 0 || chance(0.35), top = faces(r.e, g);
    return Q.num({ p: L(`把 ${cnt(t, it)}平分給 ${g} ${r.m}${r.zh}，每${r.m}${r.zh}分到幾${it.m}？`, `Share ${cnt(t, it)} equally ${g === 2 ? 'between' : 'among'} ${g} ${r.ens}. How many ${it.ens} does each ${r.en} get?`),
      scene: done ? shared(it.k, Array(g).fill(e), top) : unshared(it.k, t, top), ans: e, lo: 1, hi: 10, count: done ? '.wrap > .vcol:first-child .it' : null,
      hint: done ? L('數數看，一份有幾個？', 'Count how many are in one group.') : L('一個一個輪流分，分到沒有為止。', 'Give them out one at a time until none are left.'), full: L(`${t} 平分成 ${g} 份，每份是 ${e}`, `${t} shared equally into ${g} groups is ${e} each`) });
  }),
  def(T.div, '分裝', 'Making equal groups', (d) => {
    const b = pick(BOXES), it = thing(STUFF), [g, e] = gePair(d ? 20 : 12), t = g * e, done = d === 0 || chance(0.35);
    return Q.num({ p: L(`有 ${cnt(t, it)}，每 ${e} ${it.m}裝一${b.m}，可以裝成幾${b.m}？`, `There are ${cnt(t, it)}. Put ${e} in each ${b.en}. How many ${b.ens} are there?`),
      scene: done ? shared(it.k, Array(g).fill(e), faces([b.e], g)) : unshared(it.k, t), ans: g, lo: 1, hi: 10, count: done ? null : '.it',
      hint: done ? L(`數數看，有幾${b.m}？`, `Count the ${b.ens}.`) : L(`${e} 個、${e} 個地圈起來，看看有幾圈。`, `Make groups of ${e}. Then count the groups.`), full: L(`${t} ${it.m}，每 ${e} ${it.m}一${b.m}，共 ${g} ${b.m}`, `${t} ${it.ens} in groups of ${e} make ${g} ${b.ens}`) });
  }),
  def(T.div, '是不是平分', 'Is it shared equally?', (d) => {
    const r = pick(EATERS), it = thing(r.k), [g, e] = gePair(d ? 20 : 12, 4, 5), fair = chance(0.5), counts = Array(g).fill(e);
    if (!fair) { const [i, j] = sample(range(0, g - 1), 2); counts[i]--; if (chance(0.6)) counts[j]++; }
    return Q.yn({ p: L(`${g} ${r.m}${r.zh}分${it.zh}。這樣是平分嗎？`, `${g} ${r.ens} share some ${it.ens}. Is this shared equally?`), scene: shared(it.k, counts, faces(r.e, g)), ans: fair, yes: L('是平分', 'Yes'), no: L('不是平分', 'No'),
      hint: L('數數看，每一份是不是一樣多？', 'Count each group. Are they all the same?'), full: fair ? L(`是平分，每${r.m}都是 ${e} ${it.m}`, `Yes. Each ${r.en} gets ${e}.`) : L('不是平分，有的多、有的少', 'No. Some get more and some get fewer.') });
  }),
  def(T.div, '圈一圈', 'Circle equal groups', (d) => {
    const it = thing(), e = rnd(2, 5), g = rnd(2, Math.min(d ? 6 : 4, Math.floor(20 / e))), t = g * e, ring = d === 0 || chance(0.4);
    const scene = ring ? `<div class="vrow wrap">${range(1, g).map(() => grp(items(it.k, e, { size: 'sm', cols: e > 3 ? Math.ceil(e / 2) : e }))).join('')}</div>` : grp(items(it.k, t, { size: 'sm', cols: 10 }));
    return Q.num({ p: ring ? L(`每 ${e} ${it.m}${it.zh}圈成一圈。一共有幾圈？`, `The ${it.ens} are circled in groups of ${e}. How many groups are there?`) : L(`每 ${e} ${it.m}${it.zh}圈一圈，可以圈成幾圈？`, `Circle groups of ${e}. How many groups are there?`),
      scene, ans: g, lo: 1, hi: 10, count: ring ? null : '.it', hint: L(`${e} 個、${e} 個地數。`, `Count in groups of ${e}.`), full: L(`${t} 裡面有 ${g} 個 ${e}`, `${t} is ${g} groups of ${e}`) });
  }),
  def(T.div, '分一半', 'Sharing between two', (d) => {
    const [A, B] = who2(), it = thing(STUFF), half = d ? rnd(1, 10) : rnd(1, 5), t = half * 2, face = (w) => (w.g === 'm' ? '👦' : '👧');
    const scene = d === 0 ? row(fig(grp(items(it.k, half, { size: 'sm' }), 'a'), A.n), fig(grp(items(it.k, half, { size: 'sm' }), 'b'), B.n))
      : col(grp(items(it.k, t, { size: 'sm', cols: 10 })), `<div class="vrow">${fig(emo(face(A), 44), A.n)}${fig(emo(face(B), 44), B.n)}</div>`);
    return Q.num({ p: L(`${A.n}和${B.n}平分 ${cnt(t, it)}，每個人分到幾${it.m}？`, `Share ${cnt(t, it)} equally between ${A.n} and ${B.n}. How many ${it.ens} does each of them get?`), scene, ans: half, lo: 1, hi: 10, count: d === 0 ? '.grp.a .it' : null,
      hint: L('你一個、我一個，輪流分。', 'One for you, one for me. Keep going.'), full: L(`${t} 分成一樣多的 2 份，每份是 ${half}`, `${t} shared equally between 2 is ${half} each`) });
  }),
  def(T.div, '平分還是分裝', 'Match the story to the picture', (d) => {
    const it = thing(FOODS), r = pick(EATERS.slice(0, 2)), b = pick(BOXES), share = chance(0.5);
    let g, e; do { [g, e] = gePair(d ? 20 : 12); } while (g === e);
    const t = g * e, draw = (x, y) => shared(it.k, Array(x).fill(y), null, 'xs');
    return Q.tap({ p: share ? L(`「把 ${cnt(t, it)}平分給 ${g} ${r.m}${r.zh}。」哪一張圖是對的？`, `Share ${cnt(t, it)} equally ${g === 2 ? 'between' : 'among'} ${g} ${r.ens}. Which picture matches the story?`)
      : L(`「${cnt(t, it)}，每 ${e} ${it.m}裝一${b.m}。」哪一張圖是對的？`, `Put ${cnt(t, it)} into ${b.ens} of ${e}. Which picture matches the story?`), right: draw(g, e), wrong: [draw(e, g)],
      hint: L('先看有幾份，再看每一份有幾個。', 'Look at how many groups there are, and how many are in each group.'), full: share ? L(`分成 ${g} 份，每份 ${e} ${it.m}`, `${g} equal groups, ${e} in each group`) : L(`每 ${e} ${it.m}一份，共 ${g} 份`, `Groups of ${e}: there are ${g} groups`) });
  }),
  def(T.div, '乘除配對', 'Groups and sharing go together', (d) => {
    const it = thing(), [g, e] = gePair(d ? 20 : 12), t = g * e, k = rnd(0, d ? 2 : 1);
    const mul = L(`${g} 組，每組 ${e} ${it.m}，合起來是 ${t} ${it.m}。`, `${g} groups of ${e} make ${t}. `);
    const [p, ans, full] = [
      [mul + L(`把 ${t} ${it.m}平分成 ${g} 組，每組幾${it.m}？`, `Share ${t} into ${g} groups: □ in each group.`), e, L(`${t} 平分成 ${g} 組，每組 ${e}`, `${t} shared into ${g} groups is ${e} in each group`)],
      [mul + L(`${t} ${it.m}，每 ${e} ${it.m}一組，可以分成幾組？`, `Put ${t} into groups of ${e}: □ groups.`), g, L(`${t} 裡面有 ${g} 組 ${e}`, `${t} is ${g} groups of ${e}`)],
      [L(`把 ${t} ${it.m}平分成 ${g} 組，每組 ${e} ${it.m}。那麼 ${g} 組 ${e} ${it.m}，合起來是幾${it.m}？`, `Share ${t} into ${g} groups: ${e} in each group. So ${g} groups of ${e} make □.`), t, L(`${g} 組 ${e} 合起來是 ${t}`, `${g} groups of ${e} make ${t}`)],
    ][k];
    return Q.num({ p, say: sayOf(p.replace('□', 'how many')), scene: groups(g, e, it.k), ans, lo: 1, hi: k === 2 ? 20 : 10, full });
  }),
  def(T.div, '除法應用題', 'Sharing word problems', (d) => {
    const w = who(), b = pick(BOXES), it = thing(STUFF), [g, e] = gePair(d ? 20 : 12), t = g * e, k = rnd(0, 2), done = d === 0 || chance(0.4), top = k === 1 ? faces(KIDS, g) : faces([b.e], g);
    const p = [L(`把 ${cnt(t, it)}平分放進 ${g} 個${b.zh}，每個${b.zh}有幾${it.m}？`, `${cnt(t, it)} are put equally into ${g} ${b.ens}. How many ${it.ens} are in each ${b.en}?`),
      L(`${w.n}有 ${cnt(t, it)}，平分給 ${g} 個朋友，每個朋友分到幾${it.m}？`, `${w.n} has ${cnt(t, it)}. ${w.He} gives them equally to ${g} friends. How many ${it.ens} does each friend get?`),
      L(`${w.n}有 ${cnt(t, it)}，每 ${e} ${it.m}裝一個${b.zh}，需要幾個${b.zh}？`, `${w.n} has ${cnt(t, it)}. ${w.He} puts ${e} in each ${b.en}. How many ${b.ens} does ${w.he} need?`)][k];
    return Q.num({ p, scene: done ? shared(it.k, Array(g).fill(e), top) : unshared(it.k, t, k === 2 ? null : top), ans: k === 2 ? g : e, lo: 1, hi: 10,
      hint: k === 2 ? L(`${e} 個、${e} 個地分，看看可以分成幾份。`, `Make groups of ${e}. Then count the groups.`) : L('一個一個輪流分，分到沒有為止。', 'Give them out one at a time until none are left.'),
      full: k === 2 ? L(`${t} 裡面有 ${g} 個 ${e}，需要 ${g} 個${b.zh}`, `${t} is ${g} groups of ${e}, so ${g} ${b.ens}`) : L(`${t} 平分成 ${g} 份，每份 ${e} ${it.m}`, `${t} shared equally into ${g} groups is ${e} each`) });
  }),
  // ---- 時間 ----
  def(T.time, '整點', "O'clock", (d) => {
    const h = rnd(1, 12), [o1, o2] = sample(range(1, 12).filter((x) => x !== h), 2), S = { s: 210 };
    if (d && chance(0.4)) return Q.tap({ p: L(`哪一個時鐘是 ${h} 點？`, `Which clock shows ${h} o'clock?`), right: clock(h, 0, S), wrong: [clock(o1, 0, S), h === 12 ? clock(o2, 0, S) : clock(12, h * 5, S)],
      hint: L('整點的時候，長針指著 12。', "At o'clock, the long hand points to 12."), full: L(`${h} 點`, `${h} o'clock`) });
    return Q.num({ p: L('現在是幾點？', "What time is it? □ o'clock"), say: L('現在是幾點？', 'What time is it?'), scene: clock(h, 0, { s: 250 }), ans: h, lo: 1, hi: 12, unit: L('點', ''),
      hint: L('長針指著 12。看短針指著哪個數字。', 'The long hand is at 12. Look at where the short hand points.'), full: L(`${h} 點`, `${h} o'clock`) });
  }),
  def(T.time, '半點', 'Half past', (d) => {
    const h = rnd(1, 12), words = d > 0 && chance(0.35);
    return Q.pick({ p: L('現在是幾點幾分？', 'What time is it?'), scene: clock(h, 30, { s: 250 }), right: words ? L(`${h} 點半`, `half past ${h}`) : timeStr(h, 30),
      wrong: words ? [L(`${nextH(h)} 點半`, `half past ${nextH(h)}`), L(`${prevH(h)} 點半`, `half past ${prevH(h)}`), L(`${h} 點`, `${h} o'clock`)] : [timeStr(nextH(h), 30), timeStr(h, 0), timeStr(h, 6)],
      hint: L('長針指著 6 就是「半」。短針剛走過哪個數字？', 'The long hand at 6 means half past. Which number has the short hand just passed?'), full: L(`${h} 點半（${timeStr(h, 30)}）`, `${timeStr(h, 30)} (half past ${h})`), fullSay: tSay(h, 30) });
  }),
  def(T.time, '讀到 5 分鐘', 'Telling time to 5 minutes', (d) => {
    const h = rnd(1, 12), k = d ? rnd(1, 11) : rnd(1, 6), m = 5 * k, right = timeStr(h, m);
    const wrong = [...new Set([timeStr(k, (h % 12) * 5), timeStr(h, k), ...shuffle([timeStr(nextH(h), m), timeStr(prevH(h), m), timeStr(h, m === 55 ? 45 : m + 5), timeStr(h, m === 5 ? 15 : m - 5)])])].filter((x) => x !== right).slice(0, 3);
    return Q.pick({ p: L('現在是幾點幾分？', 'What time is it?'), scene: clock(h, m, { s: 250 }), right, wrong, hint: L('長針每走一個數字是 5 分鐘：5、10、15…', 'Count in fives for the long hand: 5, 10, 15…'), full: right, fullSay: tSay(h, m) });
  }),
  def(T.time, '指針鐘配數位鐘', 'Match the clock to the digital time', (d) => {
    const h = rnd(1, 12), m = d ? 5 * rnd(0, 11) : pick([0, 15, 30, 45]), S = { s: 170 };
    const chip = digital(h, m).replace('class="digital"', 'class="digital" style="font-size:30px;padding:0 10px;border-width:3px;border-radius:10px;letter-spacing:1px;vertical-align:middle"');
    return Q.tap({ p: L(`哪一個時鐘和 ${chip} 一樣？`, `Match the clock to ${chip}.`), em: false, say: L(`哪一個時鐘是${tSay(h, m)}？`, `Which clock shows ${tSay(h, m)}?`), right: clock(h, m, S), wrong: nearTimes(h, m, 3).map(([a, b]) => clock(a, b, S)),
      hint: L('先看短針是幾點，再看長針是幾分。', 'Read the short hand for the hour, then the long hand for the minutes.'), full: timeStr(h, m), fullSay: tSay(h, m) });
  }),
  def(T.time, '撥時鐘', 'Show the time on the clock', (d) => {
    const h = rnd(1, 12), m = d ? 5 * rnd(0, 11) : pick([0, 15, 30, 45]), S = { s: 215 }, mk = (f) => L(`請把時鐘撥到 ${f(h, m)}。哪一個撥對了？`, `Show ${f(h, m)} on the clock. Which clock is correct?`);
    return Q.tap({ p: mk(timeStr), say: mk(tSay), right: clock(h, m, S), wrong: nearTimes(h, m, 2).map(([a, b]) => clock(a, b, S)),
      hint: L('短針管「幾點」，長針管「幾分」。', 'The short hand shows the hour. The long hand shows the minutes.'), full: timeStr(h, m), fullSay: tSay(h, m) });
  }),
  def(T.time, '時針在哪裡', 'Where is the hour hand?', (d) => {
    const h = rnd(1, 12), m = chance(0.3) ? 0 : pick([30, 45]), n = nextH(h), v = prevH(h);
    const at = L(`指著 ${h}`, `at ${h}`), mid = L(`在 ${h} 和 ${n} 中間`, `between ${h} and ${n}`), before = L(`在 ${v} 和 ${h} 中間`, `between ${v} and ${h}`), right = m ? mid : at;
    const mk = (f) => (d ? L(`${f(h, m)} 的時候，短針（時針）應該在哪裡？`, `It is ${f(h, m)}. Where is the hour hand?`) : L(`現在是 ${f(h, m)}。時針指著 ${h}，還是在 ${h} 和 ${n} 中間？`, `It is ${f(h, m)}. Is the hour hand at ${h}, or between ${h} and ${n}?`));
    const fu = (f) => L(`${f(h, m)} 的時針${m ? `在 ${h} 和 ${n} 中間` : `指著 ${h}`}`, `At ${f(h, m)}, the hour hand is ${m ? `between ${h} and ${n}` : `at ${h}`}`);
    return Q.pick({ p: mk(timeStr), say: mk(tSay), scene: d ? minClock(m, 250) : clock(h, m, { s: 250 }), right, wrong: d ? [at, mid, before].filter((x) => x !== right) : [m ? at : mid],
      hint: L('長針往前走，短針也會跟著慢慢往前走。', 'When the long hand moves on, the short hand slowly moves on too.'), full: fu(timeStr), fullSay: fu(tSay) });
  }),
  def(T.time, '誰比較早', 'Earlier or later', (d) => {
    const act = d && chance(0.5) ? pick(DO) : null, same = d === 0 || chance(0.5), h = act ? pick(act.h) : rnd(1, same ? 12 : 10), early = d < 2 || chance(0.6);
    const [m1, m2] = same ? sample(range(0, 55, 5), 2).sort((x, y) => x - y) : [5 * rnd(6, 11), 5 * rnd(0, 5)];
    const a = [h, m1], b = [same ? h : h + 1, m2], [x, y] = shuffle([a, b]), [A, B] = who2(), win = early ? a : b, name = (t) => (t === x ? A : B).n, ts = (t) => timeStr(...t), sy = (t) => tSay(...t);
    const mk = (f) => (act ? L(`${A.n} ${f(x)} ${act.zh}，${B.n} ${f(y)} ${act.zh}。誰比較${early ? '早' : '晚'}${act.zh}？`, `${A.n} ${act.en} at ${f(x)}. ${B.n} ${act.en} at ${f(y)}. Who ${act.en} ${early ? 'earlier' : 'later'}?`)
      : early ? L(`${f(x)} 和 ${f(y)}，哪一個時間比較早？`, `Which is earlier, ${f(x)} or ${f(y)}?`) : L(`${f(x)} 和 ${f(y)}，哪一個時間比較晚？`, `Which is later, ${f(x)} or ${f(y)}?`));
    const fu = (f) => (early ? L(`${f(a)} 比 ${f(b)} 早`, `${f(a)} is earlier than ${f(b)}`) : L(`${f(b)} 比 ${f(a)} 晚`, `${f(b)} is later than ${f(a)}`));
    return Q.pick({ p: mk(ts), say: mk(sy), scene: row(fig(clock(x[0], x[1], { s: 190 }), act ? A.n : ts(x)), fig(clock(y[0], y[1], { s: 190 }), act ? B.n : ts(y))), right: act ? name(win) : ts(win), wrong: [act ? name(win === a ? b : a) : ts(win === a ? b : a)],
      hint: L('先比「幾點」，一樣的話再比「幾分」。', 'Compare the hours first. If they are the same, compare the minutes.'), full: fu(ts), fullSay: fu(sy) });
  }),
  def(T.time, '一天的活動', 'Things we do in a day', (d) => {
    const act = pick(d && chance(0.4) ? DAILY.filter((x) => !x.a) : DAILY), P = PERIODS[act.p], h = pick(act.h);
    if (d && !act.a && chance(0.5)) return Q.pick({ p: L(`「${act.zh}」通常是在什麼時候？`, `When do you ${act.en}?`), scene: emo(act.e, 170), right: L(P.zh, P.at), wrong: PERIODS.filter((x, i) => i !== act.p && i !== act.x).map((x) => L(x.zh, x.at)), full: L(`${P.zh}${act.zh}`, `I ${act.en} ${P.at}`) });
    const card = (x) => fig(emo(x.e, 64), `<span style="font-size:20px">${L(x.zh, x.en)}</span>`);
    const wrong = sample(range(0, 3).filter((i) => i !== act.p), 2).map((i) => pick(DAILY.filter((x) => x.p === i)));
    return Q.tap({ p: L(`${P.zh} ${h} 點，你通常在做什麼？`, `What do you do at ${h} o'clock ${P.at}?`), top: row(emo(P.e, 84), clock(h, 0, { s: 124 })), right: card(act), wrong: wrong.map(card), full: L(`${P.zh} ${h} 點${act.zh}`, `At ${h} o'clock ${P.at}, I ${act.en}`) });
  }),
  def(T.time, '排時間順序', 'Put the clocks in order', (d) => {
    const am = chance(0.5), late = d === 2 && chance(0.25), all = (am ? range(6, 11) : range(1, 5)).flatMap((h) => (d === 0 ? [0, 30] : d === 1 ? [0, 15, 30, 45] : range(0, 55, 5)).map((m) => [h, m])), v = (t) => t[0] * 60 + t[1];
    let ts; do { ts = sample(all, 3).sort((a, b) => v(a) - v(b)); } while (v(ts[1]) - v(ts[0]) < 15 || v(ts[2]) - v(ts[1]) < 15);
    if (late) ts.reverse();
    return Q.order({ p: L(`這 3 個時鐘都是同一天${am ? '早上' : '下午'}。從最${late ? '晚' : '早'}到最${late ? '早' : '晚'}，照順序點。`, `All 3 clocks show times on the same ${am ? 'morning' : 'afternoon'}. Tap them in order, from ${late ? 'latest to earliest' : 'earliest to latest'}.`),
      items: ts.map((t) => [clock(t[0], t[1], { s: 112 }), v(t)]), desc: late, hint: L('先比短針（幾點），再比長針（幾分）。', 'Compare the short hands (hours) first, then the long hands (minutes).'), full: ts.map((t) => timeStr(...t)).join(' → '), fullSay: ts.map((t) => tSay(...t)).join(L('、', ', ')) });
  }),
  def(T.time, '分針跳數', 'Minutes in fives', (d) => {
    const k = d ? rnd(1, 11) : rnd(1, 6), ans = 5 * k;
    return Q.num({ p: L(`長針（分針）指著 ${k}，是幾分鐘？`, `The minute hand points to ${k}. How many minutes is that?`), scene: minClock(ans, 250), ans, opts: k === 1 ? [1, 5, 10, 15] : [k, ans - 5, ans, ans + 5], unit: L('分', ''),
      hint: L('從 12 開始，5、10、15… 五個五個數。', 'Start at 12 and count in fives: 5, 10, 15…'), full: L(`分針指著 ${k} 是 ${ans} 分`, `The minute hand at ${k} shows ${ans} minutes`) });
  }),
  // ---- 錢（新加坡幣）----
  def(T.money, '認硬幣', 'Know the coins', (d) => {
    const cs = shuffle([5, 10, 20, 50, 100]), c = cs[0];
    if (d && chance(0.4)) return Q.pick({ p: L('這個硬幣是多少錢？', 'How much is this coin?'), scene: big(coin(c), 2.6), right: amount(c), wrong: cs.slice(1, 4).map(amount), full: amount(c) });
    return Q.tap({ p: L(`哪一個硬幣是 ${amount(c)}？`, `Which coin is ${amount(c)}?`), right: big(coin(c), 1.8), wrong: cs.slice(1, d ? 5 : 4).map((x) => big(coin(x), 1.8)), full: amount(c) });
  }),
  def(T.money, '認紙鈔', 'Know the notes', (d) => {
    const ns = shuffle([2, 5, 10, 50, 100]), n = ns[0], k = d ? 1.2 : 1.5;
    if (d && chance(0.4)) return Q.pick({ p: L('這張紙鈔是多少錢？', 'How much is this note?'), scene: big(note(n), 2.4), right: dollars(n), wrong: ns.slice(1, 4).map(dollars), full: dollars(n) });
    return Q.tap({ p: L(`哪一張紙鈔是 ${dollars(n)}？`, `Which note is ${dollars(n)}?`), right: big(note(n), k), wrong: ns.slice(1, d ? 5 : 4).map((x) => big(note(x), k)), full: dollars(n) });
  }),
  def(T.money, '數硬幣', 'Count the coins', (d) => {
    const list = d === 0 ? Array(rnd(2, 5)).fill(pick([5, 10, 20])) : d === 1 ? purse(sample([50, 20, 10, 5], 2), 3, 5, 100) : purse([50, 20, 10, 10, 5], 3, 6, 100), t = sum(list);
    return Q.num({ p: L('一共是多少分？', 'How much money is there? □ cents'), say: L('一共是多少分？', 'How much money is there? How many cents?'), scene: money(list), ans: t, opts: t <= 20 ? [t - 5, t, t + 5, t + 10] : undefined, unit: L('分', '¢'),
      hint: L('從最大的硬幣開始，一個一個加上去。', 'Start with the biggest coin and count on.'), full: `${list.join(' + ')} = ${t} ${L('分', 'cents')}` });
  }),
  def(T.money, '數紙鈔', 'Count the notes', (d) => {
    const list = d === 0 ? Array(rnd(2, 5)).fill(pick([2, 5, 10])) : d === 1 ? purse(sample([10, 5, 2], 2), 3, 5, 100) : purse([50, 10, 10, 5, 2, 2], 3, 6, 100), t = sum(list);
    return Q.num({ p: L('一共是多少元？', 'How much money is there? □ dollars'), say: L('一共是多少元？', 'How much money is there? How many dollars?'), scene: money(list.map((x) => x * 100)), ans: t, lo: 2, hi: 30, unit: L('元', ''),
      hint: L('從最大的紙鈔開始，一張一張加上去。', 'Start with the biggest note and count on.'), full: `${list.join(' + ')} = ${t} ${L('元', 'dollars')}` });
  }),
  def(T.money, '等值兌換', 'Same value', (d) => {
    // [小的面額, 大的面額]（分）
    const base = [[50, 100], [20, 100], [10, 100], [200, 1000]], more = [[5, 10], [10, 20], [10, 50], [5, 20], [5, 50], [100, 200], [100, 500], [100, 1000], [500, 1000], [1000, 5000], [5000, 10000], [1000, 10000]];
    const [s, b] = pick(d ? [...base, ...more] : base), n = b / s, isNote = s >= 200, adj = s >= 100 ? `${s / 100}-dollar` : `${s}-cent`;
    return Q.num({ p: L(`幾${isNote ? '張' : '個'} ${amount(s)}${isNote ? '紙鈔' : '硬幣'}可以換 ${amount(b)}？`, `How many ${adj} ${isNote ? 'notes' : 'coins'} make ${amount(b)}?`), scene: row(big(cash(s), 1.3), label('× ?', 'big'), label('=', 'big'), big(cash(b), 1.3)), ans: n, lo: 1, hi: 10,
      hint: L('一個一個加上去，看看要幾個才一樣多。', 'Add them one at a time. How many do you need to make the same amount?'), full: L(`${n} ${isNote ? '張' : '個'} ${amount(s)}合起來是 ${amount(b)}`, `${n} ${adj} ${isNote ? 'notes' : 'coins'} make ${amount(b)}`) });
  }),
  def(T.money, '比金額', 'Who has more money?', (d) => {
    const [A, B] = who2(), inC = chance(0.5), more = d === 0 || chance(0.6), ds = inC ? [50, 20, 10, 5] : d === 2 ? [50, 10, 5, 2] : [10, 5, 2], amt = inC ? cents : dollars;
    let a, b; do { a = purse(ds, d ? 2 : 1, d ? 4 : 3, 100); b = purse(ds, d ? 2 : 1, d ? 4 : 3, 100); } while (sum(a) === sum(b));
    const sa = sum(a), sb = sum(b), hi = Math.max(sa, sb), lo = Math.min(sa, sb), card = (w, list) => fig(money(list.map((x) => (inC ? x : x * 100))), w.n);
    return Q.tap({ p: more ? L('誰的錢比較多？', 'Who has more money?') : L('誰的錢比較少？', 'Who has less money?'), cards: [[card(A, a), (sa > sb) === more], [card(B, b), (sb > sa) === more]],
      hint: L('先算出每個人有多少錢，再比一比。', 'Work out how much each person has, then compare.'), full: more ? L(`${amt(hi)}比 ${amt(lo)}多`, `${amt(hi)} is more than ${amt(lo)}`) : L(`${amt(lo)}比 ${amt(hi)}少`, `${amt(lo)} is less than ${amt(hi)}`) });
  }),
  def(T.money, '夠不夠', 'Do you have enough?', (d) => {
    const s = pick(SHOP), w = who(), you = chance(0.5), max = [10, 20, 100][d], price = rnd(d === 2 ? 15 : 3, max), have = chance(0.5) ? (chance(0.25) ? price : rnd(price, max)) : rnd(Math.max(1, price - (d === 2 ? 20 : 5)), price - 1), gap = price - have;
    return Q.yn({ p: you ? L(`${s.zh}賣 ${price} 元，你有 ${have} 元。錢夠不夠？`, `The ${s.en} costs ${dollars(price)}. You have ${dollars(have)}. Do you have enough?`) : L(`${s.zh}賣 ${price} 元，${w.n}有 ${have} 元。${w.n}的錢夠不夠？`, `The ${s.en} costs ${dollars(price)}. ${w.n} has ${dollars(have)}. Does ${w.he} have enough?`),
      scene: row(fig(emo(s.e, 110), tagD(price)), fig(money(change(have * 100, [10000, 5000, 1000, 500, 200, 100])), you ? L('你的錢', 'Your money') : w.n)), ans: gap <= 0, yes: L('夠', 'Yes'), no: L('不夠', 'No'),
      full: gap < 0 ? L(`夠！${have} 元比 ${price} 元多`, `Yes! ${dollars(have)} is more than ${dollars(price)}.`) : gap === 0 ? L(`夠！剛剛好 ${price} 元`, `Yes! That is exactly ${dollars(price)}.`) : L(`不夠，還少 ${gap} 元`, `No. ${dollars(gap)} more ${pl(gap, 'is', 'are')} needed.`) });
  }),
  def(T.money, '剛好付', 'Pay the exact amount', (d) => {
    const s = pick(SMALL), amt = d === 0 ? pick([30, 40, 60, 70]) : d === 1 ? pick([30, 40, 60, 70, 80, 90]) : pick(range(15, 100, 5).filter((x) => x !== 20 && x !== 50)), best = change(amt, [50, 20, 10, 5]);
    return Q.collect({ p: L(`${s.zh}賣 ${amt} 分。請付剛剛好 ${amt} 分。`, `The ${s.en} costs ${amt} cents. Pay ${amt} cents.`), tokens: (d ? [50, 50, 20, 20, 20, 10, 10, 10, 5, 5] : [50, 20, 20, 20, 10, 10, 10]).map((c) => [coin(c), c]), ans: amt,
      tray: `${s.e} ${L(`付 ${amt} 分`, `Pay ${amt}¢`)}`, showSum: tagC, hint: L('先拿大的硬幣，再用小的補到剛剛好。', 'Start with a big coin, then add smaller coins to make the exact amount.'), full: `${best.join(' + ')} = ${amt} ${L('分', 'cents')}` });
  }),
  def(T.money, '錢的加法', 'Adding money', (d) => {
    const inC = d > 0 && chance(0.4), [x, y] = sample(inC ? SMALL : SHOP, 2), tag = inC ? tagC : tagD, amt = inC ? cents : dollars;
    const a = inC ? (d === 2 ? 5 * rnd(1, 10) : 10 * rnd(1, 5)) : d === 0 ? rnd(1, 5) : d === 1 ? rnd(2, 10) : rnd(5, 30), b = inC ? (d === 2 ? 5 * rnd(1, 10) : 10 * rnd(1, 5)) : d === 0 ? rnd(1, 5) : d === 1 ? rnd(2, 10) : rnd(5, 20);
    return Q.num({ p: L(`${x.zh}賣 ${amt(a)}，${y.zh}賣 ${amt(b)}。兩樣一共多少${inC ? '分' : '元'}？`, `A ${x.en} costs ${amt(a)}. A ${y.en} costs ${amt(b)}. How much do they cost altogether?`),
      scene: row(fig(emo(x.e, 100), tag(a)), label('+', 'big'), fig(emo(y.e, 100), tag(b))), ans: a + b, lo: 2, hi: 20, unit: inC ? L('分', '¢') : L('元', ''), full: `${a} + ${b} = ${a + b} ${inC ? L('分', 'cents') : L('元', 'dollars')}` });
  }),
  def(T.money, '找錢', 'Getting change', (d) => {
    const s = pick(SHOP), w = who(), you = chance(0.5), pay = d === 2 ? pick([10, 50, 50, 100]) : pick([5, 10, 10]);
    const price = pay === 100 ? 10 * rnd(1, 9) : pay === 50 ? rnd(30, 49) : d === 0 ? pay - rnd(1, 3) : rnd(1, pay - 1), back = pay - price;
    return Q.num({ p: you ? L(`${s.zh}賣 ${price} 元，你付了 ${pay} 元。要找回多少元？`, `You pay ${dollars(pay)} for ${an(price)} ${price}-dollar ${s.en}. How much change do you get?`) : L(`${w.n}買 ${price} 元的${s.zh}，付了 ${pay} 元。要找回多少元？`, `${w.n} pays ${dollars(pay)} for ${an(price)} ${price}-dollar ${s.en}. How much change does ${w.he} get?`),
      scene: row(fig(emo(s.e, 110), tagD(price)), fig(`<span style="display:grid;place-items:center;width:190px;height:120px">${big(note(pay), 1.5)}</span>`, L('付的錢', 'Paid'))), ans: back, lo: 1, hi: Math.max(10, back + 4), unit: L('元', ''),
      hint: L(`從 ${price} 往上數到 ${pay}，要數幾下？`, `Count on from ${price} to ${pay}.`), full: `${pay} − ${price} = ${back} ${L('元', 'dollars')}` });
  }),
  def(T.money, '福利社買東西', 'Buying at the canteen', (d) => {
    const inC = d > 0 && chance(0.4), u = inC ? 10 : 1, tag = inC ? tagC : tagD;
    let ds = [1, 2], ss = [3, 4], a = 1, b = 4;
    for (let i = 0; i < 200; i++) { const D = sample(range(1, 4), rnd(2, 3)), S = sample(range(1, 6), rnd(2, 3)), x = pick(D), y = pick(S); if (oneEach(D, S, x + y)) { ds = D; ss = S; a = x; b = y; break; } }
    const B = (a + b) * u, de = sample(['🧃', '🥛', '🧋', '🥤', '🍵'], 3), se = sample(['🍪', '🍌', '🥪', '🍩', '🍙', '🍎', '🍞'], 3);
    const tok = (e, v, drink) => [`<span style="display:grid;justify-items:center;padding:2px 10px 4px;background:${drink ? '#dcebff' : '#fff0b0'};border:4px solid #2b2140;border-radius:16px;font-weight:900;font-size:22px;line-height:1.1">${emo(e, 46)}${tag(v * u)}</span>`, v * u];
    return Q.collect({ p: L(`用 ${tag(B)}買一樣喝的和一樣吃的，要剛好把錢花完。`, `Buy one drink and one snack with ${inC ? cents(B) : dollars(B)}. Spend all the money.`), tokens: [...ds.map((v, i) => tok(de[i], v, true)), ...ss.map((v, i) => tok(se[i], v, false))], ans: B,
      tray: L('我要買', 'My tray'), showSum: tag, hint: L('藍色是喝的，黃色是吃的。各選一樣，加起來看看。', 'Blue ones are drinks and yellow ones are snacks. Pick one of each and add the prices.'), full: `${a * u} + ${b * u} = ${B} ${inC ? L('分', 'cents') : L('元', 'dollars')}` });
  }),
  // ---- 綜合 ----
  def(T.mix, '一步驟應用題混合', 'One-step word problems', (d) => {
    const [A, B] = who2(), it = thing(STUFF), b = pick(BOXES), k = rnd(0, 6), N = [20, 50, 100][d];
    const one = fig(pic(it.k, 130), A.n), two = (x, y) => row(fig(pic(it.k, 110), `${A.n} ${x}`), fig(pic(it.k, 110), `${B.n} ${y}`));
    const num = (p, scene, ans, full, o = {}) => Q.num({ p, scene, ans, lo: 1, hi: Math.max(10, ans + 4), full, ...o });
    if (k < 2) { // 加
      const s = rnd(8, N), x = rnd(3, s - 3), y = s - x;
      return k === 0 ? num(L(`${A.n}有 ${cnt(x, it)}，又買了 ${y} ${it.m}，現在有幾${it.m}？`, `${A.n} has ${cnt(x, it)}. ${A.He} buys ${y} more. How many ${it.ens} does ${A.he} have now?`), one, s, `${x} + ${y} = ${s}`)
        : num(L(`${A.n}有 ${cnt(x, it)}，${B.n}有 ${cnt(y, it)}，兩個人一共有幾${it.m}？`, `${A.n} has ${cnt(x, it)}. ${B.n} has ${cnt(y, it)}. How many ${it.ens} do they have altogether?`), two(x, y), s, `${x} + ${y} = ${s}`);
    }
    if (k < 4) { // 減
      const x = rnd(8, N), y = rnd(2, x - 2);
      return k === 2 ? num(L(`${A.n}有 ${cnt(x, it)}，送給朋友 ${y} ${it.m}，還剩幾${it.m}？`, `${A.n} has ${cnt(x, it)}. ${A.He} gives away ${y}. How many ${it.ens} are left?`), one, x - y, `${x} − ${y} = ${x - y}`)
        : num(L(`${A.n}有 ${cnt(x, it)}，${B.n}有 ${cnt(y, it)}。${A.n}比${B.n}多幾${it.m}？`, `${A.n} has ${cnt(x, it)}. ${B.n} has ${cnt(y, it)}. How many more ${it.ens} does ${A.n} have than ${B.n}?`), two(x, y), x - y, `${x} − ${y} = ${x - y}`);
    }
    if (k === 4) { // 乘（40 以內）
      const g = rnd(2, 5), e = rnd(2, d ? 8 : 5), t = g * e;
      return num(L(`有 ${g} 個${b.zh}，每個${b.zh}裝 ${cnt(e, it)}，一共有幾${it.m}？`, `There are ${g} ${b.ens}. Each ${b.en} has ${cnt(e, it)}. How many ${it.ens} are there altogether?`), shared(it.k, Array(g).fill(e)), t, `${g} × ${e} = ${t}`, { count: '.it' });
    }
    const [g, e] = gePair(d ? 20 : 12), t = g * e; // 除（20 以內，不寫除號）
    return k === 5 ? num(L(`${A.n}把 ${cnt(t, it)}平分給 ${g} 個朋友，每個朋友分到幾${it.m}？`, `${A.n} shares ${cnt(t, it)} equally ${g === 2 ? 'between' : 'among'} ${g} friends. How many ${it.ens} does each friend get?`), unshared(it.k, t, faces(KIDS, g)), e, L(`${t} 平分成 ${g} 份，每份是 ${e}`, `${t} shared equally into ${g} groups is ${e} each`))
      : num(L(`有 ${cnt(t, it)}，每 ${e} ${it.m}裝一${b.m}，可以裝成幾${b.m}？`, `There are ${cnt(t, it)}. Put ${e} in each ${b.en}. How many ${b.ens} are there?`), unshared(it.k, t), g, L(`${t} 裡面有 ${g} 個 ${e}`, `${t} is ${g} groups of ${e}`), { count: '.it' });
  }),
  def(T.mix, '心算快閃', 'Quick mental sums', (d) => {
    const add = chance(0.5), s = rnd(d ? 6 : 3, d ? 20 : 10), a = rnd(1, s - 1), eq = add ? `${a} + ${s - a} = □` : `${s} − ${a} = □`, ans = add ? s : s - a;
    return Q.num({ p: L('心算快閃！答案是多少？', 'Quick! What is the answer?'), say: sayOf(eq), scene: bigEq(eq), bg: 'num', ans, lo: 0, hi: 20, full: eq.replace('□', ans) });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '月曆', 'Reading a calendar', (d) => {
    let mo, first; do { mo = rnd(1, 12); first = rnd(0, 6); } while (first + MDAYS[mo - 1] > 35);
    const days = MDAYS[mo - 1], date = (n) => L(`${mo} 月 ${n} 日`, `${n} ${MONTHS[mo - 1]}`);
    if (d === 0 || chance(0.5)) { // 幾月幾日是星期幾
      const n = rnd(1, days), w = (first + n - 1) % 7;
      return Q.pick({ p: L(`${date(n)}是星期幾？`, `What day is ${date(n)}?`), scene: calendar(mo, first, days, d === 0 ? [n] : []), right: wd(w), wrong: sample(range(0, 6).filter((x) => x !== w), 3).map(wd),
        hint: L('找到那一天，再往上看最上面那一排。', 'Find the date, then look up to the top of that column.'), full: L(`${date(n)}是${wd(w)}`, `${date(n)} is a ${wd(w)}`) });
    }
    const w = rnd(0, 6), k = rnd(1, d === 2 ? 4 : 2), n = ((w - first + 7) % 7) + 1 + 7 * (k - 1); // 第 k 個星期 w 是幾日
    return Q.num({ p: L(`這個月的第${ORD[k - 1][0]}個${wd(w)}是幾日？`, `What is the date of the ${ORD[k - 1][1]} ${wd(w)}?`), scene: calendar(mo, first, days), ans: n, lo: 1, hi: days, unit: L('日', ''),
      hint: L(`先找到最上面的「${'日一二三四五六'[w]}」，再由上往下數。`, `Find ${wd(w).slice(0, 3)} at the top, then count down the column.`), full: L(`第${ORD[k - 1][0]}個${wd(w)}是 ${date(n)}`, `The ${ORD[k - 1][1]} ${wd(w)} is ${date(n)}`) });
  }, true),
  def(T.bonus, '昨天今天明天', 'Yesterday, today and tomorrow', (d) => {
    const t = rnd(0, 6), [off, zh, en] = pick([[1, '明天', 'tomorrow'], [-1, '昨天', 'yesterday'], ...(d === 2 ? [[2, '後天', 'the day after tomorrow'], [-2, '前天', 'the day before yesterday']] : [])]), day = (x) => wd((t + x + 14) % 7), step = off > 0 ? 1 : -1;
    const cell = (x) => (x === off ? fig('<span class="scell q" style="min-width:150px">?</span>', L(zh, cap(en))) : fig(`<span class="scell" style="font-size:38px;min-width:150px">${x ? '' : day(0)}</span>`, x ? L(x > 0 ? '明天' : '昨天', x > 0 ? 'Tomorrow' : 'Yesterday') : L('今天', 'Today')));
    return Q.pick({ p: L(`今天是${day(0)}。${zh}是星期幾？`, `Today is ${day(0)}. What day ${off > 0 ? 'is' : 'was'} ${en}?`), scene: row(...range(Math.min(0, off), Math.max(0, off)).map(cell)), right: day(off), wrong: [day(-off), day(0), day(off === step ? 2 * step : step)],
      hint: L('星期一、二、三… 照順序唸唸看。', 'Say the days in order: Monday, Tuesday, Wednesday…'), full: L(`${day(0)}的${zh}是${day(off)}`, `${cap(en)} ${off > 0 ? 'is' : 'was'} ${day(off)}`) });
  }, true),
];
