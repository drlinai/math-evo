// 小二下 LV3（新加坡 P2 Term 3）：40 種題型。兩步驟應用題、3 和 4 的乘法表、元和分的小數點寫法、分母 12 以內的分數。
// 每個題型只是「概念」：故事、人名、東西、數字每次都隨機換。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, thing, who, who2, sayOf, FOODS } from './core.js?v=19';
import { items, grp, row, col, fig, emo, ncard, pic, seq, bigEq, groups, array, table, note, cash, sgd, change, frac, fr, modelPW, modelCmp, svg, COLORS } from './vis.js?v=19';

const T = { word: ['兩步驟應用題', 'Two-step word problems', '🧩'], times: ['乘法表', 'Times tables', '✖️'], money: ['錢', 'Money', '💰'], frac: ['分數', 'Fractions', '🍕'], bonus: ['加分題', 'Bonus', '⭐'] };
const INK = '#2b2140', CK = Object.keys(COLORS), anyColor = () => COLORS[pick(CK)].c;
const sp = () => L('', ' '); // 句子和句子中間：英文要空一格
const big = (t, px = 46) => `<span class="vlabel" style="font-size:${px}px">${t}</span>`;

// ---------- 兩步驟故事（#1~#7 共用）----------
// 每個故事回傳：s 故事、q 問句、e 表情符號、nums 故事裡的數、ans 答案、eq [第一步, 第二步]、bad 兩個不對的算式、
//   step [先求的, 最後求的, 題目已經給的]（#7 的選項）、extra() 多餘的一句話 [數, 句子]（#6）、sum 完整算式、hint
const OBJ = [
  { zh: '貼紙', m: '張', en: 'sticker', ens: 'stickers', e: '🌟' }, { zh: '彈珠', m: '顆', en: 'marble', ens: 'marbles', e: '🔮' }, { zh: '珠子', m: '顆', en: 'bead', ens: 'beads', e: '📿' },
  { zh: '卡片', m: '張', en: 'card', ens: 'cards', e: '🃏' }, { zh: '郵票', m: '張', en: 'stamp', ens: 'stamps', e: '✉️' }, { zh: '貝殼', m: '個', en: 'shell', ens: 'shells', e: '🐚' },
  { zh: '鈕扣', m: '顆', en: 'button', ens: 'buttons', e: '🧵' }, { zh: '糖果', m: '顆', en: 'sweet', ens: 'sweets', e: '🍬' }, { zh: '氣球', m: '顆', en: 'balloon', ens: 'balloons', e: '🎈' },
];
const BAKE = [{ zh: '麵包', m: '個', en: 'bun', ens: 'buns', e: '🥯' }, { zh: '蛋糕', m: '個', en: 'cake', ens: 'cakes', e: '🧁' }, { zh: '餅乾', m: '片', en: 'cookie', ens: 'cookies', e: '🍪' }];
const SELL = [{ zh: '鉛筆', m: '枝', en: 'pencil', ens: 'pencils', e: '✏️' }, { zh: '氣球', m: '顆', en: 'balloon', ens: 'balloons', e: '🎈' }, { zh: '麵包', m: '個', en: 'bun', ens: 'buns', e: '🥯' }, { zh: '風箏', m: '個', en: 'kite', ens: 'kites', e: '🪁' }];
const DAY2 = [['星期一', '星期二', 'Monday', 'Tuesday'], ['星期三', '星期四', 'Wednesday', 'Thursday'], ['星期六', '星期日', 'Saturday', 'Sunday']];
const eqn = (x, op, y) => `${x} ${op} ${y} = ${op === '+' ? x + y : x - y}`;
const spare = (lo, hi, used) => { let n; do n = rnd(lo, hi); while (used.includes(n)); return n; }; // 和題目裡的數不一樣的數
const age = (p, used) => () => { const n = spare(7, 9, used); return [n, L(`${p.n}今年 ${n} 歲。`, `${p.n} is ${n} years old.`)]; };
const price = (o, used) => () => { const n = spare(2, 9, used); return [n, L(`每${o.m}${o.zh}賣 ${n} 元。`, `Each ${o.en} costs $${n}.`)]; };

// 先減再加：a − b + c
function offOn(d) {
  const [alo, ahi, lo, hi] = [[60, 200, 11, 50], [150, 500, 25, 120], [300, 750, 50, 250]][d];
  const a = rnd(alo, ahi); let b, c; do { b = rnd(lo, hi); c = rnd(lo, hi); } while (b === c);
  const x = a - b, ans = x + c, nums = [a, b, c], k = rnd(0, 3);
  const t = { a, b, c, ans, nums, eq: [eqn(a, '−', b), eqn(x, '+', c)], bad: [eqn(a, '+', b), x > c ? eqn(x, '−', c) : eqn(b, '+', c)], sum: `${a} − ${b} + ${c} = ${ans}`,
    hint: L('先算離開以後剩多少，再加上新來的。', 'First find how many are left. Then add the new ones.') };
  if (k === 0) {
    const [vz, ve, e, w, part, pe, plo, phi] = pick([['火車', 'train', '🚆', '車', '節車廂', 'carriages', 6, 12], ['渡輪', 'ferry', '⛴️', '船', '層甲板', 'decks', 2, 5], ['郵輪', 'cruise ship', '🚢', '船', '層甲板', 'decks', 5, 9]]);
    return { ...t, e, s: L(`${vz}上有 ${a} 人，${b} 人下${w}，又有 ${c} 人上${w}。`, `There were ${a} people on a ${ve}. ${b} got off and ${c} got on.`), q: L(`現在${vz}上有幾人？`, `How many people are on the ${ve} now?`),
      step: [L(`下${w}後剩幾人`, `the people left after ${b} got off`), L(`現在${vz}上有幾人`, `the people on the ${ve} now`), L('一開始有幾人', 'the people at first')],
      extra: () => { const n = spare(plo, phi, nums); return [n, L(`${vz}有 ${n} ${part}。`, `The ${ve} has ${n} ${pe}.`)]; } };
  }
  if (k === 1) return { ...t, e: '📚', s: L(`圖書館有 ${a} 本書，借出 ${b} 本，又還回 ${c} 本。`, `A library had ${a} books. ${b} were borrowed and ${c} were returned.`), q: L('現在圖書館有幾本書？', 'How many books are in the library now?'),
    step: [L('借出後剩幾本', `the books left after ${b} were borrowed`), L('現在有幾本書', 'the books in the library now'), L('一開始有幾本書', 'the books at first')],
    extra: () => { const n = spare(12, 40, nums); return [n, L(`圖書館有 ${n} 張桌子。`, `The library has ${n} tables.`)]; } };
  if (k === 2) {
    const p = who(), o = pick(OBJ);
    return { ...t, e: o.e, s: L(`${p.n}有 ${a} ${o.m}${o.zh}，送出 ${b} ${o.m}，又買了 ${c} ${o.m}。`, `${p.n} had ${a} ${o.ens}. ${p.He} gave away ${b} and bought ${c} more.`), q: L(`${p.n}現在有幾${o.m}${o.zh}？`, `How many ${o.ens} does ${p.he} have now?`),
      step: [L(`送出後剩幾${o.m}`, `the ${o.ens} left after giving away ${b}`), L(`現在有幾${o.m}`, `the ${o.ens} ${p.he} has now`), L(`一開始有幾${o.m}`, `the ${o.ens} at first`)], extra: age(p, nums) };
  }
  return { ...t, e: '🚗', s: L(`停車場有 ${a} 輛車，開走 ${b} 輛，又開進來 ${c} 輛。`, `There were ${a} cars in a car park. ${b} drove away and ${c} drove in.`), q: L('現在停車場有幾輛車？', 'How many cars are in the car park now?'),
    step: [L('開走後剩幾輛', `the cars left after ${b} drove away`), L('現在有幾輛車', 'the cars in the car park now'), L('一開始有幾輛車', 'the cars at first')],
    extra: () => { const n = spare(2, 6, nums); return [n, L(`停車場有 ${n} 層樓。`, `The car park has ${n} levels.`)]; } };
}
// 連減兩次：a − b − c
function minus2(d) {
  const [alo, ahi, lo, hi] = [[80, 200, 15, 60], [200, 500, 40, 180], [400, 1000, 100, 380]][d];
  let a, b, c; do { a = rnd(alo, ahi); if (chance(0.3)) a = Math.round(a / 50) * 50; b = rnd(lo, hi); c = rnd(lo, hi); } while (b === c || a - b - c < 5);
  const x = a - b, ans = x - c, nums = [a, b, c], k = rnd(0, 2), p = who();
  const t = { a, b, c, ans, nums, eq: [eqn(a, '−', b), eqn(x, '−', c)], bad: [eqn(x, '+', c), eqn(a, '+', b)], sum: `${a} − ${b} − ${c} = ${ans}`,
    hint: L('先減掉第一次的，再減掉第二次的。', 'Take away the first number. Then take away the second number.') };
  if (k === 0) {
    const o = pick(OBJ), [vz, ve] = pick([['用掉', 'used'], ['送出', 'gave away'], ['賣出', 'sold']]), [z1, z2, e1, e2] = pick(DAY2);
    return { ...t, e: o.e, s: L(`${p.n}有 ${a} ${o.m}${o.zh}，${z1}${vz} ${b} ${o.m}，${z2}${vz} ${c} ${o.m}。`, `${p.n} had ${a} ${o.ens}. ${p.He} ${ve} ${b} on ${e1} and ${c} on ${e2}.`), q: L(`還剩下幾${o.m}${o.zh}？`, `How many ${o.ens} are left?`),
      step: [L(`${z1}之後剩幾${o.m}`, `the ${o.ens} left after ${e1}`), L(`最後剩幾${o.m}`, `the ${o.ens} left at the end`), L(`一開始有幾${o.m}`, `the ${o.ens} at first`)], extra: age(p, nums) };
  }
  if (k === 1) {
    const o = pick(BAKE);
    return { ...t, e: o.e, s: L(`麵包店做了 ${a} ${o.m}${o.zh}，上午賣出 ${b} ${o.m}，下午賣出 ${c} ${o.m}。`, `A baker made ${a} ${o.ens}. He sold ${b} in the morning and ${c} in the afternoon.`), q: L(`還剩下幾${o.m}${o.zh}？`, `How many ${o.ens} are left?`),
      step: [L(`上午賣完後剩幾${o.m}`, `the ${o.ens} left after the morning`), L(`最後剩幾${o.m}`, `the ${o.ens} left at the end`), L(`一共做了幾${o.m}`, `the ${o.ens} the baker made`)], extra: price(o, nums) };
  }
  return { ...t, e: '📖', s: L(`一本書有 ${a} 頁，${p.n}昨天讀了 ${b} 頁，今天讀了 ${c} 頁。`, `A book has ${a} pages. ${p.n} read ${b} pages yesterday and ${c} pages today.`), q: L('還有幾頁沒讀？', 'How many pages are left to read?'),
    step: [L('昨天讀完後剩幾頁', 'the pages left after yesterday'), L('還有幾頁沒讀', 'the pages left to read'), L('這本書有幾頁', 'the pages in the book')], extra: age(p, nums) };
}
// 先比再合計：a 和「比 a 多（少）k」合起來
function compare(d) {
  const [alo, ahi, lo, hi] = [[40, 120, 10, 35], [100, 300, 20, 90], [200, 450, 25, 150]][d];
  const more = d === 0 || chance(0.5), a = rnd(alo, ahi), k = more ? rnd(lo, hi) : rnd(lo, Math.min(hi, Math.floor(a / 2) - 1)), b = more ? a + k : a - k, ans = a + b, nums = [a, k];
  const t = { a, b, k, more, ans, nums, eq: [eqn(a, more ? '+' : '−', k), eqn(a, '+', b)], bad: more ? [eqn(a, '−', k), eqn(b, '+', k)] : [eqn(a, '+', k), eqn(b, '−', k)],
    sum: `${eqn(a, more ? '+' : '−', k)}${L('，', ', ')}${eqn(a, '+', b)}`, hint: L('先算出第二個是多少，再把兩個加起來。', 'First find the second amount. Then add the two amounts.') };
  if (chance(0.65)) {
    const [A, B] = who2(), o = pick(OBJ);
    return { ...t, e: o.e, names: [A.n, B.n], s: L(`${A.n}有 ${a} ${o.m}${o.zh}，${B.n}比${A.n}${more ? '多' : '少'} ${k} ${o.m}。`, `${A.n} has ${a} ${o.ens}. ${B.n} has ${k} ${more ? 'more' : 'fewer'} ${o.ens} than ${A.n}.`), q: L(`兩人一共有幾${o.m}${o.zh}？`, `How many ${o.ens} do they have altogether?`),
      step: [L(`${B.n}有幾${o.m}`, `${B.n}'s ${o.ens}`), L(`兩人一共有幾${o.m}`, `the ${o.ens} they have altogether`), L(`${A.n}有幾${o.m}`, `${A.n}'s ${o.ens}`)], extra: age(A, nums) };
  }
  const o = pick(SELL);
  return { ...t, e: o.e, names: [L('星期六', 'Sat'), L('星期日', 'Sun')], s: L(`商店星期六賣出 ${a} ${o.m}${o.zh}，星期日比星期六${more ? '多' : '少'}賣 ${k} ${o.m}。`, `A shop sold ${a} ${o.ens} on Saturday. On Sunday it sold ${k} ${more ? 'more' : 'fewer'} than on Saturday.`), q: L(`兩天一共賣出幾${o.m}${o.zh}？`, `How many ${o.ens} did it sell altogether?`),
    step: [L(`星期日賣出幾${o.m}`, `the ${o.ens} sold on Sunday`), L(`兩天一共賣幾${o.m}`, `the ${o.ens} sold altogether`), L(`星期六賣出幾${o.m}`, `the ${o.ens} sold on Saturday`)], extra: price(o, nums) };
}
const TALES = [offOn, minus2, compare];
// 故事卡（放在題目區）：數字標成紅色
const storyBox = (t, e) => `<div class="vrow" style="gap:14px">${e ? emo(e, 76) : ''}<div style="max-width:${e ? 740 : 860}px;padding:8px 20px;font-size:${L(27, 24)}px;font-weight:900;line-height:1.32;text-align:left;background:#fff;border:5px solid ${INK};border-radius:22px;box-shadow:0 5px 0 rgba(0,0,0,.2)">${String(t).replace(/\d+/g, '<b style="color:#e8483f;font-size:1.15em">$&</b>')}</div></div>`;
// 比較模型圖右邊的大括號和問號（兩條合起來是多少）
const braceQ = () => svg(70, 150, `<path d="M6,12 q12,0 12,14 v34 q0,14 12,14 q-12,0 -12,14 v34 q0,14 -12,14" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><text x="50" y="92" font-size="44" font-weight="900" text-anchor="middle" fill="#3f8cff">?</text>`);
// 選項卡片用的小模型圖（寬 250）
const MC = ['#ffd43a', '#7fd4ff', '#b8ffd6'];
const mtx = (x, y, s, size) => `<text x="${Math.round(x)}" y="${y}" font-size="${size}" font-weight="900" text-anchor="middle" fill="${INK}">${s}</text>`;
// 部分—整體：parts = [[格子裡的字, 長度比例], …]，total 大括號下面的字
function miniPW(parts, total) {
  const sum = parts.reduce((s, p) => s + p[1], 0), unit = 240 / (parts.length + 1.2);
  let x = 5, g = '';
  parts.forEach(([t, v], i) => { const w = unit * (1 + (1.2 * v) / sum); g += `<rect x="${Math.round(x)}" y="8" width="${Math.round(w)}" height="56" fill="${MC[i]}" stroke="${INK}" stroke-width="4"/>${mtx(x + w / 2, 45, t, 24)}`; x += w; });
  return svg(250, 136, `${g}<path d="M5,74 v12 H245 v-12" fill="none" stroke="${INK}" stroke-width="4"/>${mtx(125, 126, total, 28)}`);
}
// 比較：rows = [[名字, 長度比例, 條上的字], …]（兩條），diff 短的那條後面虛線框裡的字
function miniCmp(rows, diff) {
  const max = Math.max(rows[0][1], rows[1][1]), short = Math.round(Math.min(168, Math.max(96, (Math.min(rows[0][1], rows[1][1]) / max) * 238)));
  return svg(250, 172, rows.map(([name, v, t], i) => {
    const y = i * 92, w = v === max ? 238 : short;
    return `<text x="6" y="${y + 20}" font-size="19" font-weight="900" fill="${INK}">${name}</text><rect x="6" y="${y + 28}" width="${w}" height="46" fill="${MC[i]}" stroke="${INK}" stroke-width="4"/>${mtx(6 + w / 2, y + 60, t, 24)}`
      + (v === max ? '' : `<rect x="${6 + w}" y="${y + 28}" width="${238 - w}" height="46" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="7 5"/>${mtx(6 + w + (238 - w) / 2, y + 59, diff, 22)}`);
  }).join(''));
}

// ---------- 乘法表 ----------
// 跳數：k 個 k 個數，少了一個
function skip(k, d) {
  const n = d === 2 ? 5 : 4, s = rnd(1, d === 0 ? 3 : 11 - n), back = d === 2 && chance(0.3), list = range(s, s + n - 1).map((i) => i * k), miss = d === 0 ? n - 1 : d === 1 ? pick([n - 1, n - 1, n - 2]) : rnd(1, n - 1);
  if (back) list.reverse();
  const en = k === 3 ? 'threes' : 'fours';
  return Q.num({ p: back ? L(`${k} 個 ${k} 個倒著數，少了哪一個數？`, `Count back in ${en}. What is the missing number?`) : L(`${k} 個 ${k} 個數，少了哪一個數？`, `Count in ${en}. What is the missing number?`), scene: seq(list.map((v, i) => (i === miss ? '?' : v))), bg: 'num', ans: list[miss], lo: 1, hi: 10 * k,
    hint: back ? L(`每次少 ${k}。`, `Take away ${k} each time.`) : L(`每次多 ${k}。`, `Add ${k} each time.`), full: list.join(', ') });
}
// a × k（k 是 3 或 4）
function timesOf(k, d) {
  const a = rnd(1, d === 0 ? 5 : 10), [x, y] = d > 0 && chance(0.4) ? [k, a] : [a, k], it = thing(FOODS);
  return Q.num({ p: L(`${x} × ${y} 是多少？`, `What is ${x} × ${y}?`), scene: d === 0 ? row(bigEq(`${x} × ${y} = □`, 'sm'), array(a, k, it.k)) : bigEq(`${x} × ${y} = □`), bg: 'num', ans: a * k, lo: 1, hi: 10 * k,
    hint: k === 3 ? L(`3 個 3 個數，數 ${a} 次。`, `Count in threes ${a} ${pl(a, 'time', 'times')}.`) : L(`把 ${a} 變成兩倍，再變成兩倍。`, `Double ${a}. Then double it again.`), full: `${x} × ${y} = ${a * k}` });
}
const qcell = '<b style="display:inline-block;min-width:46px;color:#fff;background:#3f8cff;border-radius:8px">?</b>';
// 一個要付錢、每個都有固定數量的東西：[每個幾個, 表情符號, 題目]
const EACH = [
  [4, '🪑', (n) => L(`有 ${n} 張椅子，每張椅子有 4 隻腳。一共有幾隻腳？`, `There are ${n} chairs. Each chair has 4 legs. How many legs are there altogether?`)],
  [4, '🚗', (n) => L(`有 ${n} 輛汽車，每輛汽車有 4 個輪子。一共有幾個輪子？`, `There are ${n} cars. Each car has 4 wheels. How many wheels are there altogether?`)],
  [2, '🚲', (n) => L(`有 ${n} 輛腳踏車，每輛有 2 個輪子。一共有幾個輪子？`, `There are ${n} bicycles. Each bicycle has 2 wheels. How many wheels are there altogether?`)],
  [3, '🚦', (n) => L(`有 ${n} 座紅綠燈，每座有 3 個燈。一共有幾個燈？`, `There are ${n} traffic lights. Each one has 3 lamps. How many lamps are there altogether?`)],
  [5, '🖐️', (n) => L(`有 ${n} 隻手，每隻手有 5 根手指。一共有幾根手指？`, `There are ${n} hands. Each hand has 5 fingers. How many fingers are there altogether?`)],
  [5, '⭐', (n) => L(`有 ${n} 顆星星，每顆星星有 5 個角。一共有幾個角？`, `There are ${n} stars. Each star has 5 points. How many points are there altogether?`)],
  [10, '📦', (n) => L(`有 ${n} 盒鉛筆，每盒有 10 枝。一共有幾枝鉛筆？`, `There are ${n} boxes of pencils. Each box has 10 pencils. How many pencils are there altogether?`)],
];

// ---------- 錢 ----------
// 金額的唸法：3 元 45 分／3 dollars and 45 cents
const mSay = (c) => { const D = Math.floor(c / 100), C = c % 100; return L([D ? `${D} 元` : '', C || !D ? `${C} 分` : ''].filter(Boolean).join(' '), [D ? `${D} ${pl(D, 'dollar', 'dollars')}` : '', C || !D ? `${C} ${pl(C, 'cent', 'cents')}` : ''].filter(Boolean).join(' and ')); };
const dec = (c) => (c / 100).toFixed(2);
// 題目裡有 $3.45 時：畫面寫 $3.45，語音唸「3 元 45 分」
const mq = (fn) => ({ p: fn(sgd), say: sayOf(fn(mSay)) });
const money = (list) => `<div class="moneyrow">${list.map(cash).join('')}</div>`;
// 金額的錯誤選項：去掉不合理和重複的，挑 3 個
const mwrong = (right, cands) => [...new Set(cands.filter((c) => c > 0 && c !== right))].slice(0, 3).map(sgd);
const swapC = (C) => (C < 10 ? C * 10 : (C % 10) * 10 + Math.floor(C / 10)); // 5 分 → 50 分、45 分 → 54 分
// 商店裡的東西 [中文, 英文, 表情符號]：大的用元、小的用分
const SHOP = [['書包', 'bag', '🎒'], ['機器人', 'robot', '🤖'], ['足球', 'football', '⚽'], ['故事書', 'storybook', '📕'], ['手錶', 'watch', '⌚'], ['風箏', 'kite', '🪁'], ['帽子', 'cap', '🧢'], ['上衣', 'shirt', '👕'], ['玩具車', 'toy car', '🚗'], ['蛋糕', 'cake', '🎂'], ['洋娃娃', 'doll', '🪆']];
const SMALL = [['糖果', 'sweet', '🍬'], ['貼紙', 'sticker', '🌟'], ['鉛筆', 'pencil', '✏️'], ['棒棒糖', 'lollipop', '🍭'], ['餅乾', 'biscuit', '🍪'], ['氣球', 'balloon', '🎈']];

// ---------- 分數 ----------
const NW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const DW = ['', '', 'half', 'third', 'quarter', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
// 分數的唸法：8 分之 3／three eighths
const fsay = (n, d) => L(`${d} 分之 ${n}`, `${NW[n]} ${d === 2 ? (n === 1 ? 'half' : 'halves') : DW[d] + (n === 1 ? '' : 's')}`);
const pf = (n, d) => `<b style="color:#e8483f">${fr(n, d)}</b>`; // 題目文字裡的分數（紅色）
// 題目或完整句子裡有分數時：畫面用上下疊的寫法，語音用唸法。fn(F) 用 F(n, d) 放分數
const frq = (fn) => ({ p: fn(pf), say: sayOf(fn(fsay)), em: false });
const frfull = (fn) => ({ full: fn(fr), fullSay: sayOf(fn(fsay)) });
// 分數算式（大字）：parts 裡 '□' 是要填的格子
const frEq = (parts, cls = 'xs') => `<div class="numq ${cls}">${parts.map((p) => (p === '□' ? '<span class="nqm">?</span>' : /^[+−=]$/.test(p) ? `<span class="nop">${p}</span>` : `<span>${p}</span>`)).join('')}</div>`;
// 分數的錯誤選項：cands = [[分子, 分母], …]，去掉不合理的、和正確答案一樣大的、重複的，挑 3 個
function fwrong([rn, rd], cands) {
  const seen = new Set();
  return shuffle(cands).concat([[rn, rd + 1], [rn + 1, rd + 2], [rn + 2, rd + 1]]).filter(([n, d]) => n > 0 && d > 1 && n * rd !== rn * d && !seen.has(`${n}/${d}`) && seen.add(`${n}/${d}`)).slice(0, 3).map(([n, d]) => fr(n, d));
}
// 不等分的圖：一直重畫到「最大的一份至少是最小的 1.8 倍」，確定看得出來不一樣大
function unevenFrac(d, o) {
  let h;
  for (let i = 0; i < 40; i++) {
    h = frac(d, d, { ...o, uneven: true });
    let sz;
    if (o.kind === 'circle') { const a = [...h.matchAll(/L([\d.]+),([\d.]+) A/g)].map((m, j) => (j ? ((Math.atan2(m[2] - 100, m[1] - 100) * 180) / Math.PI + 450) % 360 : 0)); sz = a.map((x, j) => (j + 1 < a.length ? a[j + 1] : 360) - x); }
    else sz = [...h.matchAll(/y="4" width="([\d.]+)"/g)].map((m) => +m[1]);
    if (Math.max(...sz) >= Math.min(...sz) * 1.8) break;
  }
  return h;
}
// 兩個分數比大小的圖：bars 要不要畫長條
const cmpScene = (list, bars) => (bars ? `<div class="vcol" style="align-items:flex-start;gap:14px">${list.map(([n, d], i) => `<div class="vrow">${big(fr(n, d), 50)}${frac(n, d, { s: 480, c: i ? '#3f8cff' : '#ff9f1c' })}</div>`).join('')}</div>` : row(...list.map(([n, d]) => grp(big(fr(n, d), 100)))));
// 分數應用題的東西：[中文（一個…）, 英文（a …）, 英文名, 表情符號, 中文動詞, 英文過去式, 英文原形]
const WHOLE = [['一個披薩', 'a pizza', 'pizza', '🍕', '吃了', 'ate', 'eat'], ['一個蛋糕', 'a cake', 'cake', '🎂', '吃了', 'ate', 'eat'], ['一條巧克力', 'a chocolate bar', 'chocolate bar', '🍫', '吃了', 'ate', 'eat'], ['一個派', 'a pie', 'pie', '🥧', '吃了', 'ate', 'eat'],
  ['一面牆', 'a wall', 'wall', '🧱', '漆了', 'painted', 'paint'], ['一條緞帶', 'a ribbon', 'ribbon', '🎀', '用了', 'used', 'use']];

// ---------- 加分題 ----------
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const mname = (m) => L(`${m} 月`, MONTH[m - 1]);

export default [
  // ---- 兩步驟應用題 ----
  def(T.word, '先減再加', 'Take away, then add', (d) => {
    const t = offOn(d);
    return Q.num({ p: `${t.s}${sp()}${t.q}`, scene: d === 0 ? row(emo(t.e, 110), seq([t.a, `− ${t.b}`, `+ ${t.c}`, '?'], 'wide')) : emo(t.e, 170), bg: 'sky', ans: t.ans, hint: t.hint, full: t.sum });
  }),
  def(T.word, '連減兩次', 'Take away twice', (d) => {
    const t = minus2(d);
    return Q.num({ p: `${t.s}${sp()}${t.q}`, scene: row(emo(t.e, 90), modelPW([{ t: t.b, v: t.b }, { t: t.c, v: t.c }, { t: '?', v: t.ans }], t.a)), bg: 'sky', ans: t.ans, hint: t.hint, full: t.sum });
  }),
  def(T.word, '先比再合計', 'Compare, then find the total', (d) => {
    const t = compare(d);
    return Q.num({ p: `${t.s}${sp()}${t.q}`, scene: row(modelCmp([{ name: t.names[0], v: t.a, t: t.a }, { name: t.names[1], v: t.b, t: '' }], t.k), braceQ()), bg: 'sky', ans: t.ans, hint: t.hint, full: t.sum });
  }),
  def(T.word, '選兩個算式', 'Choose the two number sentences', (d) => {
    let t; do t = pick(TALES)(d); while ([...t.eq, ...t.bad].join(' ').match(/\d+/g).some((n) => n > 1000));
    const ask = L('哪兩個算式可以算出答案？', 'Which two number sentences solve the problem?'), card = (s) => `<span class="vlabel sm">${s}</span>`;
    return Q.multi({ p: ask, say: sayOf(`${t.s} ${t.q} ${ask}`), top: storyBox(`${t.s}${sp()}${t.q}`), items: [...t.eq.map((s) => [card(s), true]), ...t.bad.map((s) => [card(s), false])], bg: 'sky', full: t.eq.join(L('，', ', ')) });
  }),
  def(T.word, '選模型圖', 'Choose the model', (d) => {
    const k = rnd(0, 2), ask = L('哪一個模型圖和故事一樣？', 'Which model matches the story?');
    if (k === 0) {
      const t = compare(d), m = (r1, r2, df) => miniCmp([[t.names[0], ...r1], [t.names[1], ...r2]], df);
      return Q.tap({ p: `${t.s}${sp()}${ask}`, right: m([t.a, t.a], [t.b, '?'], t.k), wrong: [m([t.b, t.a], [t.a, '?'], t.k), m([t.a, t.k], [t.b, '?'], t.a)], bg: 'sky', full: `${t.a} ${t.more ? '+' : '−'} ${t.k} = □`,
        hint: L('誰比較多，誰的那一條就比較長。', 'The one who has more gets the longer bar.') });
    }
    if (k === 1) {
      const { s, a, b, c, ans } = minus2(d);
      return Q.tap({ p: `${s}${sp()}${ask}`, right: miniPW([[b, b], [c, c], ['?', ans]], a), wrong: [miniPW([[a, a], [b, b], [c, c]], '?'), miniPW([[a, a], [c, c], ['?', b]], b)], bg: 'sky', full: `${a} − ${b} − ${c} = □`,
        hint: L('一開始的全部，要寫在大括號下面。', 'The total at the start goes under the brace.') });
    }
    const [alo, ahi, lo, hi] = [[40, 150, 11, 60], [100, 400, 30, 200], [200, 500, 50, 250]][d], a = rnd(alo, ahi), p = who(), o = pick(OBJ), [z1, z2, e1, e2] = pick(DAY2);
    let b, c; do { b = rnd(lo, hi); c = rnd(lo, hi); } while (b === c || b === a || c === a);
    return Q.tap({ p: `${L(`${p.n}有 ${a} ${o.m}${o.zh}，${z1}又買了 ${b} ${o.m}，${z2}再買 ${c} ${o.m}。`, `${p.n} had ${a} ${o.ens}. ${p.He} bought ${b} more on ${e1} and ${c} more on ${e2}.`)}${sp()}${ask}`,
      right: miniPW([[a, a], [b, b], [c, c]], '?'), wrong: [miniPW([[b, b], [c, c], ['?', a]], a), miniPW([[a, a], [b, b], ['?', c]], c)], bg: 'sky', full: `${a} + ${b} + ${c} = □`, hint: L('越買越多，全部合起來才是要找的數。', 'They are all put together. The total is what we must find.') });
  }),
  def(T.word, '找多餘資訊', 'Find the number that is not needed', (d) => {
    const t = pick(TALES)(d), [n, ex] = t.extra(), ask = L('要算出答案，哪一個數用不到？', 'Which number is not needed?'), body = chance(0.5) ? `${ex}${sp()}${t.s}` : `${t.s}${sp()}${ex}`;
    return Q.pick({ p: ask, say: sayOf(`${body} ${t.q} ${ask}`), scene: storyBox(`${body}${sp()}${t.q}`, t.e), bg: 'sky', right: n, wrong: t.nums, sort: true,
      hint: L('問題在問什麼？哪一個數和它沒有關係？', 'What is the question asking? Which number has nothing to do with it?'), full: L(`用不到 ${n}`, `${n} is not needed`) });
  }),
  def(T.word, '先求什麼', 'What to find first', (d) => {
    const t = pick(TALES)(d), ask = L('要先算出什麼？', 'What must you find first?');
    return Q.pick({ p: ask, say: sayOf(`${t.s} ${t.q} ${ask}`), scene: storyBox(`${t.s}${sp()}${t.q}`, t.e), bg: 'sky', right: t.step[0], wrong: [t.step[1], t.step[2]],
      hint: L('要回答問題，得先知道哪一個還不知道的數？', 'Which number do you not know yet, but need for the answer?'), full: L(`先算「${t.step[0]}」：${t.eq[0]}`, `First find ${t.step[0]}: ${t.eq[0]}`) });
  }),
  // ---- 乘法表 ----
  def(T.times, '3 的跳數', 'Count in threes', (d) => skip(3, d)),
  def(T.times, '3 的乘法', 'Times table of 3', (d) => timesOf(3, d)),
  def(T.times, '4 的跳數', 'Count in fours', (d) => skip(4, d)),
  def(T.times, '4 的乘法', 'Times table of 4', (d) => timesOf(4, d)),
  def(T.times, '除法事實', 'Division facts', (d) => {
    const k = pick([3, 4]), q = rnd(1, d === 0 ? 5 : 10), n = q * k;
    return Q.num({ p: L(`${n} ÷ ${k} 是多少？`, `What is ${n} ÷ ${k}?`), scene: bigEq(`${n} ÷ ${k} = □`), bg: 'num', ans: q, lo: 1, hi: 10, hint: L(`想一想：幾乘以 ${k} 是 ${n}？`, `Think: what times ${k} makes ${n}?`), full: `${n} ÷ ${k} = ${q}` });
  }),
  def(T.times, '缺因數', 'Missing factor', (d) => {
    const k = pick([3, 4]), a = rnd(1, d === 0 ? 5 : 10), n = a * k, first = d === 0 || chance(0.5);
    return Q.num({ p: first ? L(`幾 × ${k} = ${n}？`, `□ × ${k} = ${n}. What is the missing number?`) : L(`${k} × 幾 = ${n}？`, `${k} × □ = ${n}. What is the missing number?`), scene: bigEq(first ? `□ × ${k} = ${n}` : `${k} × □ = ${n}`), bg: 'num', ans: a, lo: 1, hi: 10,
      hint: L(`想想 ${k} 的乘法表：${k}、${2 * k}、${3 * k}……`, `Think of the ${k} times table: ${k}, ${2 * k}, ${3 * k}...`), full: first ? `${a} × ${k} = ${n}` : `${k} × ${a} = ${n}` });
  }),
  def(T.times, '五個表混合快閃', 'Mixed tables flash', (d) => {
    const k = pick([2, 3, 4, 5, 10]), a = rnd(1, d === 0 ? 5 : 10), n = a * k, div = d > 0 && chance(0.5), [x, y] = chance(0.5) ? [a, k] : [k, a], eq = div ? `${n} ÷ ${k}` : `${x} × ${y}`, ans = div ? a : n;
    return Q.num({ p: L(`快問快答！${eq} 是多少？`, `Quick! What is ${eq}?`), scene: bigEq(`${eq} = □`), bg: 'num', ans, lo: 1, hi: div ? 10 : 20, full: `${eq} = ${ans}` });
  }),
  def(T.times, '乘法格子表', 'Multiplication grid', (d) => {
    const asc = (x, y) => x - y, rs = sample([2, 3, 4, 5, 10], d === 0 ? 2 : 3).sort(asc), cs = sample(range(1, d === 0 ? 5 : 10), 4).sort(asc), r = pick(rs), c = pick(cs);
    const grid = table([['×', ...cs], ...rs.map((x) => [`<b style="color:#e8483f">${x}</b>`, ...cs.map((y) => (x === r && y === c ? qcell : x * y))])]).replace('class="vtable"', 'class="vtable" style="font-size:36px"');
    return Q.num({ p: L('乘法表裡，問號那一格是多少？', 'What is the missing number in the multiplication grid?'), scene: grid, bg: 'num', ans: r * c, lo: 1, hi: 20,
      hint: L('看問號最左邊的數和最上面的數，把它們乘起來。', 'Look at the number on the left and the number at the top. Multiply them.'), full: `${r} × ${c} = ${r * c}` });
  }),
  def(T.times, '乘除應用題', 'Multiply and divide word problems', (d) => {
    const kind = d === 0 ? pick(['each', 'bag']) : pick(['each', 'bag', 'share', 'group']), it = thing(FOODS);
    if (kind === 'each') {
      const [k, e, text] = pick(EACH), n = rnd(2, d === 0 ? 5 : 10);
      return Q.num({ p: text(n), scene: `<div class="vrow wrap" style="max-width:640px;gap:6px 12px">${emo(e, 70).repeat(n)}</div>`, ans: n * k, lo: 1, hi: 20, hint: L(`${n} 個 ${k}，用乘法。`, `${n} groups of ${k}. Multiply.`), full: `${n} × ${k} = ${n * k}` });
    }
    const k = pick(d === 0 ? [2, 3, 4, 5] : [2, 3, 4, 5, 10]);
    if (kind === 'bag') {
      const n = rnd(2, d === 0 ? 5 : k >= 5 ? 8 : 10);
      return Q.num({ p: L(`有 ${n} 個袋子，每個袋子裝 ${k} ${it.m}${it.zh}。一共有幾${it.m}${it.zh}？`, `There are ${n} bags. Each bag has ${k} ${it.ens}. How many ${it.ens} are there altogether?`), scene: groups(n, k, it.k), ans: n * k, lo: 1, hi: 20, count: '.it',
        hint: L(`${n} 個 ${k}，用乘法。`, `${n} groups of ${k}. Multiply.`), full: `${n} × ${k} = ${n * k}` });
    }
    const q = rnd(2, 10), t = q * k, p = who(), pile = items(it.k, t, { size: 'xs', cols: t > 50 ? 20 : 10 });
    if (kind === 'share') return Q.num({ p: L(`${p.n}有 ${t} ${it.m}${it.zh}，平分給 ${k} 個朋友。每個朋友分到幾${it.m}？`, `${p.n} has ${t} ${it.ens}. ${p.He} shares them equally among ${k} friends. How many ${it.ens} does each friend get?`), scene: pile, ans: q, lo: 1, hi: 12,
      hint: L(`平分成 ${k} 份，用除法。`, `Share equally into ${k} groups. Divide.`), full: `${t} ÷ ${k} = ${q}` });
    return Q.num({ p: L(`有 ${t} ${it.m}${it.zh}，每 ${k} ${it.m}裝一袋。可以裝成幾袋？`, `There are ${t} ${it.ens}. Each bag holds ${k} ${it.ens}. How many bags are needed?`), scene: pile, ans: q, lo: 1, hi: 12,
      hint: L(`每 ${k} 個一袋，看 ${t} 裡面有幾個 ${k}。`, `Make groups of ${k}. How many groups are in ${t}?`), full: `${t} ÷ ${k} = ${q}` });
  }),
  // ---- 錢 ----
  def(T.money, '數元和分', 'Count dollars and cents', (d) => {
    const desc = (x, y) => y - x, notes = (d === 0 ? sample([10, 5, 2, 2], rnd(1, 3)) : sample([50, 10, 10, 5, 2, 2], rnd(2, 4))).sort(desc), coins = (d === 0 ? sample([100, 50, 20, 10], rnd(1, 2)) : sample([100, 50, 50, 20, 20, 10, 10, 5], rnd(2, 4))).sort(desc);
    const t = notes.reduce((s, v) => s + v * 100, 0) + coins.reduce((s, v) => s + v, 0), C = t % 100;
    return Q.pick({ p: L('一共有多少錢？', 'How much money is there?'), scene: col(money(notes.map((v) => v * 100)), money(coins)), right: sgd(t), wrong: mwrong(t, [...shuffle([t + 100, t - 100, t + 10, t - 10, t - C + swapC(C)]), t + 1000, t + 200]),
      hint: L('先數紙鈔是幾元，再數硬幣。', 'Count the notes first. Then count the coins.'), full: sgd(t), fullSay: mSay(t) });
  }),
  def(T.money, '小數點寫法', 'Write money with a dot', (d) => {
    const kind = d === 0 ? 0 : pick([0, 0, 1, 1, 2]), D = kind === 2 ? 0 : rnd(1, d === 2 ? 20 : 9), C = kind === 1 ? 5 : kind === 2 ? pick([5, 5, 20, 45, 60, 85]) : rnd(2, 19) * 5, t = D * 100 + C;
    return Q.pick({ p: L(`${mSay(t)}，用小數點要怎麼寫？`, `${mSay(t)} = $□`), say: L(`${mSay(t)}，用小數點要怎麼寫？`, `How do we write ${mSay(t)}?`), scene: money(change(t)), right: sgd(t),
      wrong: mwrong(t, [D * 100 + swapC(C), +`${D}${C}` * 100, C * 100 + D, t * 10, t + 100, t + 10]), hint: L('小數點前面寫元，後面兩位寫分。', 'Write the dollars before the dot. Write the cents with 2 digits after the dot.'),
      full: `${mSay(t)} = ${sgd(t)}`, fullSay: L(`${mSay(t)}，寫成 ${dec(t)} 元`, `${mSay(t)} is ${dec(t)} dollars`) });
  }),
  def(T.money, '分換成元', 'Cents to dollars', (d) => {
    const c = d === 0 ? rnd(21, 99) * 5 : pick([() => rnd(21, 199) * 5, () => rnd(1, 9) * 100 + 5, () => rnd(1, 19) * 5, () => rnd(1, 9) * 100])(), D = Math.floor(c / 100), C = c % 100;
    return Q.pick({ p: L(`${c} 分是幾元？`, `${c} cents = $□`), say: L(`${c} 分是幾元？`, `How many dollars is ${c} cents?`), scene: `<div class="numq sm"><span>${c}¢</span><span class="nop">=</span><span>$</span><span class="nqm">?</span></div>`, right: sgd(c),
      wrong: mwrong(c, [c * 10, c * 100, D * 100 + swapC(C), Math.round(c / 10), c + 100, c + 10]), hint: L('100 分是 1 元。', '100 cents make 1 dollar.'),
      full: L(`${c} 分 = ${sgd(c)}`, `${c}¢ = ${sgd(c)}`), fullSay: L(`${c} 分等於 ${dec(c)} 元`, `${c} cents is ${dec(c)} dollars`) });
  }),
  def(T.money, '元換成分', 'Dollars to cents', (d) => {
    const D = rnd(1, 9), C = d === 0 ? rnd(2, 19) * 5 : pick([() => rnd(2, 19) * 5, () => rnd(2, 19) * 5, () => 5, () => 5, () => 0])(), t = D * 100 + C, dot = d > 0 && chance(0.5);
    return Q.num({ p: dot ? L(`${sgd(t)} 是多少分？`, `${sgd(t)} = □ cents`) : L(`${mSay(t)}是多少分？`, `${mSay(t)} = □ cents`), say: L(`${mSay(t)}是多少分？`, `How many cents is ${mSay(t)}?`), scene: money(change(t)), ans: t, unit: L('分', '¢'),
      hint: L('1 元是 100 分。', '1 dollar is 100 cents.'), full: L(`${mSay(t)} = ${t} 分`, `${mSay(t)} = ${t} cents`) });
  }),
  def(T.money, '比金額', 'Compare amounts of money', (d) => {
    const D = rnd(1, 9), E = spare(1, 9, [D]), five = (lo, hi) => rnd(lo, hi) * 5;
    const pairs = [() => [D * 100 + five(2, 19), D * 100 + five(0, 19)], () => [D * 100 + rnd(1, 9) * 10, D * 100 + 5], () => [D * 100 + E * 10, E * 100 + D * 10], () => [rnd(10, 20) * 100 + five(0, 4), rnd(5, 9) * 100 + five(15, 19)]];
    let list; do { list = pick(d === 0 ? pairs.slice(0, 2) : pairs)(); if (d > 0 && chance(0.5)) list.push(pick(list) + pick([-100, 100, 50, -50, 105])); } while (new Set(list).size < list.length || list.some((v) => v <= 0));
    shuffle(list);
    const most = d === 0 || chance(0.6), best = most ? Math.max(...list) : Math.min(...list), rest = list.filter((v) => v !== best), two = list.length === 2;
    return Q.pick({ ...(two ? mq((M) => (most ? L(`${M(list[0])} 和 ${M(list[1])}，哪一個比較多？`, `Which is more, ${M(list[0])} or ${M(list[1])}?`) : L(`${M(list[0])} 和 ${M(list[1])}，哪一個比較少？`, `Which is less, ${M(list[0])} or ${M(list[1])}?`)))
      : { p: most ? L('哪一個金額最多？', 'Which amount is the greatest?') : L('哪一個金額最少？', 'Which amount is the smallest?') }), scene: row(...list.map((v) => ncard(sgd(v), 'word'))), right: sgd(best), wrong: rest.map(sgd),
    hint: L('先比元（小數點前面），一樣多再比分。', 'Compare the dollars first. If they are the same, compare the cents.'),
    full: two ? (most ? L(`${sgd(best)} 比 ${sgd(rest[0])} 多`, `${sgd(best)} is more than ${sgd(rest[0])}`) : L(`${sgd(best)} 比 ${sgd(rest[0])} 少`, `${sgd(best)} is less than ${sgd(rest[0])}`)) : most ? L(`${sgd(best)} 最多`, `${sgd(best)} is the greatest`) : L(`${sgd(best)} 最少`, `${sgd(best)} is the smallest`),
    fullSay: two ? (most ? L(`${mSay(best)}比${mSay(rest[0])}多`, `${mSay(best)} is more than ${mSay(rest[0])}`) : L(`${mSay(best)}比${mSay(rest[0])}少`, `${mSay(best)} is less than ${mSay(rest[0])}`)) : most ? L(`${mSay(best)}最多`, `${mSay(best)} is the greatest`) : L(`${mSay(best)}最少`, `${mSay(best)} is the smallest`) });
  }),
  def(T.money, '最少張數', 'Fewest notes and coins', (d) => {
    let amt, opt; do { amt = d === 0 ? rnd(2, 9) * 100 + pick([0, 0, 50]) : d === 1 ? rnd(1, 15) * 100 + rnd(0, 9) * 10 : rnd(1, 19) * 100 + rnd(0, 19) * 5; opt = change(amt); } while (opt.length < 2 || opt.length > 5);
    const pool = [...opt, pick([200, 500]), ...sample([100, 100, 50, 50, 20, 20, 10, 10, 5], 5)].sort((x, y) => y - x);
    return Q.collect({ ...mq((M) => L(`用最少的紙鈔和硬幣，付 ${M(amt)}。`, `Pay ${M(amt)} with the fewest notes and coins.`)), tokens: pool.map((v) => [cash(v), v]), ans: amt, fewest: opt.length, showSum: (v) => sgd(v), tray: L('付錢', 'Pay here'),
      hint: L('從最大的面額開始拿。', 'Start with the biggest note or coin.'), full: `${sgd(amt)} = ${opt.map((v) => (v >= 100 ? `$${v / 100}` : `${v}¢`)).join(' + ')}`, fullSay: L(`${mSay(amt)}，最少要 ${opt.length} 個`, `${mSay(amt)}, with only ${opt.length} notes and coins`) });
  }),
  def(T.money, '夠不夠', 'How much more do you need?', (d) => {
    const [zh, en, e] = pick(SHOP), cost = d === 0 ? rnd(8, 20) : d === 1 ? rnd(20, 60) : rnd(30, 100), more = d === 0 ? rnd(2, Math.min(9, cost - 3)) : d === 1 ? rnd(3, 15) : rnd(5, 28), have = cost - more, p = who();
    return Q.num({ p: chance(0.5) ? L(`${zh}賣 ${cost} 元，你有 ${have} 元。還差幾元？`, `The ${en} costs $${cost}. You have $${have}. How much more money do you need?`) : L(`${p.n}有 ${have} 元，想買 ${cost} 元的${zh}。還差幾元？`, `${p.n} has $${have}. ${p.He} wants a ${en} that costs $${cost}. How much more does ${p.he} need?`),
      scene: row(fig(emo(e, 120), `$${cost}`), fig(emo('👛', 120), `$${have}`)), bg: 'pink', ans: more, lo: 1, hi: 20, unit: L('元', ''), hint: L('用價錢減掉已經有的錢。', 'Take away the money you have from the price.'), full: `${cost} − ${have} = ${more}` });
  }),
  def(T.money, '錢的加減應用題', 'Money word problems', (d) => {
    const cents = d > 0 && chance(0.35), [X, Y] = sample(cents ? SMALL : SHOP, 2), kind = pick(['less', 'more', 'total']), M = (n) => (cents ? L(`${n} 分`, `${n} cents`) : L(`${n} 元`, `$${n}`)), tag = (n) => (cents ? `${n}¢` : `$${n}`), u = cents ? L('分', '元') : L('元', '元');
    const p1 = cents ? rnd(6, 14) * 5 : d === 0 ? rnd(10, 30) : d === 1 ? rnd(15, 50) : rnd(20, 70), k = cents ? rnd(1, 5) * 5 : d === 0 ? rnd(2, 9) : rnd(5, Math.min(25, p1 - 5)), p2 = cents ? rnd(2, Math.min(8, (95 - p1) / 5)) * 5 : rnd(5, d === 0 ? 20 : 30);
    const ans = kind === 'less' ? p1 - k : kind === 'more' ? p1 + k : p1 + p2, unit = cents ? L('分', '¢') : L('元', '');
    const p = kind === 'total' ? L(`${X[0]}賣 ${M(p1)}，${Y[0]}賣 ${M(p2)}。兩樣一共多少${u}？`, `A ${X[1]} costs ${M(p1)}. A ${Y[1]} costs ${M(p2)}. How much do they cost altogether?`)
      : L(`${X[0]}賣 ${M(p1)}，${Y[0]}比${X[0]}${kind === 'less' ? '便宜' : '貴'} ${M(k)}。${Y[0]}賣多少${u}？`, `A ${X[1]} costs ${M(p1)}. A ${Y[1]} costs ${M(k)} ${kind}. How much is the ${Y[1]}?`);
    return Q.num({ p, scene: row(fig(emo(X[2], 120), tag(p1)), fig(emo(Y[2], 120), kind === 'total' ? tag(p2) : '?')), bg: 'pink', ans, lo: 1, hi: 20, unit,
      hint: kind === 'less' ? L('便宜就是比較少，用減的。', 'Less means take away.') : kind === 'more' ? L('貴就是比較多，用加的。', 'More means add.') : L('合起來，用加的。', 'Altogether means add.'), full: kind === 'less' ? `${p1} − ${k} = ${ans}` : `${p1} + ${kind === 'more' ? k : p2} = ${ans}` });
  }),
  def(T.money, '找錢', 'Change', (d) => {
    const [zh, en, e] = pick(SHOP), pay = pick(d === 0 ? [10, 20] : d === 1 ? [20, 50] : [50, 100]), cost = rnd(Math.ceil(pay * 0.3), pay - 1), back = pay - cost, p = who(), an = /^(8|11|18)/.test(String(cost)) ? 'an' : 'a';
    return Q.num({ p: chance(0.5) ? L(`${zh}賣 ${cost} 元，你付了 ${pay} 元。要找回幾元？`, `You pay $${pay} for ${an} $${cost} ${en}. How much change do you get?`) : L(`${p.n}買了 ${cost} 元的${zh}，付了 ${pay} 元。要找回幾元？`, `${p.n} buys a ${en} for $${cost}. ${p.He} pays $${pay}. How much change does ${p.he} get?`),
      scene: row(fig(emo(e, 120), `$${cost}`), emo('⬅️', 50), `<div class="vrow" style="gap:8px">${(pay === 20 ? [10, 10] : [pay]).map(note).join('')}</div>`), bg: 'pink', ans: back, lo: 1, hi: 20, unit: L('元', ''),
      hint: L('用付的錢減掉價錢。', 'Take away the price from the money paid.'), full: `${pay} − ${cost} = ${back}` });
  }),
  // ---- 分數 ----
  def(T.frac, '是不是等分', 'Equal parts or not?', (d) => {
    const n = rnd(2, d === 0 ? 4 : 8), kind = pick(['bar', 'circle']), equal = chance(0.5), o = { kind, c: anyColor(), s: kind === 'bar' ? 560 : 250 };
    return Q.yn({ p: L('這個圖形是不是分成一樣大的幾份？', 'Is the shape cut into equal parts?'), scene: equal ? frac(n, n, o) : unevenFrac(n, o), ans: equal, hint: L('比比看，每一份都一樣大嗎？', 'Look at each part. Are they all the same size?'),
      full: equal ? L(`是，分成 ${n} 等份`, `Yes, ${n} equal parts`) : L('不是，每一份不一樣大', 'No, the parts are not equal') });
  }),
  def(T.frac, '單位分數命名', 'Name the unit fraction', (d) => {
    const n = rnd(2, d === 0 ? 6 : 12), kind = pick(['bar', 'circle']);
    return Q.pick({ p: L('塗色的部分是全部的幾分之幾？', 'What fraction is shaded?'), scene: frac(1, n, { kind, c: anyColor(), s: kind === 'bar' ? 560 : 250 }), right: fr(1, n), wrong: fwrong([1, n], [[1, n + 1], [1, n - 1], [n - 1, n], [n, 1 + n], [2, n]]),
      hint: L('數數看一共分成幾等份，塗了其中 1 份。', 'Count the equal parts. 1 of them is shaded.'), full: fr(1, n), fullSay: fsay(1, n) });
  }),
  def(T.frac, '塗色', 'Shade the fraction', (d) => {
    const dn = rnd(2, d === 0 ? 6 : 12), n = rnd(1, dn - 1), kind = dn > 10 ? 'circle' : pick(['bar', 'circle']), c = anyColor(), g = ([a, b]) => frac(a, b, { kind, c, s: kind === 'bar' ? 236 : 118 });
    const wrong = shuffle([[n + 1, dn], [n - 1, dn], [n, dn + 1], [n, dn - 1], [dn - n, dn]]).filter(([a, b]) => a > 0 && a <= b && b > 1 && a * dn !== n * b).slice(0, 2);
    return Q.tap({ ...frq((F) => L(`哪一個圖塗了 ${F(n, dn)}？`, `Which picture shows ${F(n, dn)} shaded?`)), top: big(fr(n, dn)), right: g([n, dn]), wrong: wrong.map(g),
      hint: L('下面的數是分成幾等份，上面的數是塗色的份數。', 'The bottom number tells how many equal parts. The top number tells how many are shaded.'), ...frfull((F) => F(n, dn)) });
  }),
  def(T.frac, '分子分母', 'Top and bottom numbers', (d) => {
    const dn = rnd(3, d === 0 ? 8 : 12), n = rnd(1, dn - 1), den = chance(0.5), ans = den ? dn : n, opts = [...new Set([n, dn, dn - n, n + dn, dn + 1, n + 1])].slice(0, 4);
    return Q.num({ p: L(den ? `${pf(n, dn)} 是把全部平分成幾等份？` : `${pf(n, dn)} 是塗了其中的幾份？`, den ? `In ${pf(n, dn)}, the whole is cut into □ equal parts.` : `In ${pf(n, dn)}, □ parts are shaded.`), em: false,
      say: L(den ? `${fsay(n, dn)}，是把全部平分成幾等份？` : `${fsay(n, dn)}，是塗了其中的幾份？`, den ? `In ${fsay(n, dn)}, the whole is cut into how many equal parts?` : `In ${fsay(n, dn)}, how many parts are shaded?`),
      scene: d === 0 ? row(big(fr(n, dn), 100), frac(n, dn, { s: 480, c: anyColor() })) : big(fr(n, dn), 110), ans, opts, hint: L('下面的數是分成幾等份，上面的數是塗色的份數。', 'The bottom number tells how many equal parts. The top number tells how many are shaded.'),
      ...frfull((F) => L(`${F(n, dn)}：平分成 ${dn} 等份，塗 ${n} 份`, `${F(n, dn)}: ${dn} equal parts, ${n} shaded`)) });
  }),
  def(T.frac, '讀圖寫分數', 'What fraction is shaded?', (d) => {
    const dn = rnd(3, d === 0 ? 6 : 12), n = rnd(2, dn - 1), kind = pick(['bar', 'circle']);
    return Q.pick({ p: kind === 'bar' ? L('長條塗色的部分是幾分之幾？', 'What fraction of the bar is shaded?') : L('圓形塗色的部分是幾分之幾？', 'What fraction of the circle is shaded?'), scene: frac(n, dn, { kind, c: anyColor(), s: kind === 'bar' ? 560 : 250 }),
      right: fr(n, dn), wrong: fwrong([n, dn], [[dn - n, dn], [dn, n], [n, dn - n], [n, dn + 1], [n + 1, dn], [n - 1, dn]]), hint: L('先數一共幾等份，再數塗色的有幾份。', 'Count all the equal parts. Then count the shaded parts.'), full: fr(n, dn), fullSay: fsay(n, dn) });
  }),
  def(T.frac, '單位分數比大小', 'Compare unit fractions', (d) => {
    const [a, b] = sample(range(2, d === 0 ? 6 : 12), 2), great = d === 0 || chance(0.6), lo = Math.min(a, b), hi = Math.max(a, b), [r, w] = great ? [lo, hi] : [hi, lo];
    return Q.pick({ ...frq((F) => (great ? L(`${F(1, a)} 和 ${F(1, b)}，哪一個比較大？`, `Which is greater, ${F(1, a)} or ${F(1, b)}?`) : L(`${F(1, a)} 和 ${F(1, b)}，哪一個比較小？`, `Which is smaller, ${F(1, a)} or ${F(1, b)}?`))), scene: cmpScene([[1, a], [1, b]], d < 2),
      right: fr(1, r), wrong: [fr(1, w)], hint: L('分成越多份，每一份就越小。', 'The more parts you cut, the smaller each part is.'), ...frfull((F) => (great ? L(`${F(1, r)} 比 ${F(1, w)} 大`, `${F(1, r)} is greater than ${F(1, w)}`) : L(`${F(1, r)} 比 ${F(1, w)} 小`, `${F(1, r)} is smaller than ${F(1, w)}`))) });
  }),
  def(T.frac, '同分母比大小', 'Compare like fractions', (d) => {
    const dn = rnd(3, d === 0 ? 8 : 12), [a, b] = sample(range(1, dn - 1), 2), great = d === 0 || chance(0.6), lo = Math.min(a, b), hi = Math.max(a, b), [r, w] = great ? [hi, lo] : [lo, hi];
    return Q.pick({ ...frq((F) => (great ? L(`${F(a, dn)} 和 ${F(b, dn)}，哪一個比較大？`, `Which is greater, ${F(a, dn)} or ${F(b, dn)}?`) : L(`${F(a, dn)} 和 ${F(b, dn)}，哪一個比較小？`, `Which is smaller, ${F(a, dn)} or ${F(b, dn)}?`))), scene: cmpScene([[a, dn], [b, dn]], d < 2),
      right: fr(r, dn), wrong: [fr(w, dn)], hint: L('每一份一樣大，比比看誰的份數多。', 'The parts are the same size. Which one has more parts?'), ...frfull((F) => (great ? L(`${F(r, dn)} 比 ${F(w, dn)} 大`, `${F(r, dn)} is greater than ${F(w, dn)}`) : L(`${F(r, dn)} 比 ${F(w, dn)} 小`, `${F(r, dn)} is smaller than ${F(w, dn)}`))) });
  }),
  def(T.frac, '排序', 'Order fractions', (d) => {
    const cnt = d === 2 ? 4 : 3, unit = chance(0.5), dn = rnd(cnt + 2, 12), desc = d > 0 && chance(0.3);
    const list = (unit ? sample(range(2, d === 0 ? 8 : 12), cnt).map((x) => [1, x]) : sample(range(1, dn - 1), cnt).map((x) => [x, dn])).sort((x, y) => (x[0] / x[1] - y[0] / y[1]) * (desc ? -1 : 1));
    return Q.order({ p: desc ? L('由大到小，照順序點分數。', 'Tap the fractions in order, from the greatest to the smallest.') : L('由小到大，照順序點分數。', 'Tap the fractions in order, from the smallest to the greatest.'), items: list.map(([n, x]) => [big(fr(n, x)), n / x]), desc,
      hint: unit ? L('分母越大，每一份越小。', 'The bigger the bottom number, the smaller each part.') : L('分母一樣，分子越大就越大。', 'The bottom numbers are the same. A bigger top number means a greater fraction.'),
      full: list.map(([n, x]) => fr(n, x)).join(L('、', ', ')), fullSay: list.map(([n, x]) => fsay(n, x)).join(L('、', ', ')) });
  }),
  def(T.frac, '湊成一個整體', 'Make 1 whole', (d) => {
    const dn = rnd(2, d === 0 ? 8 : 12), n = rnd(1, dn - 1), m = dn - n, pic2 = d < 2;
    return Q.pick({ ...frq((F) => L(`${F(n, dn)} 和多少合起來是 1？`, `${F(n, dn)} and □ make 1 whole.`)), scene: pic2 ? col(frEq([fr(n, dn), '+', '□', '=', '1'], 'tiny'), frac(n, dn, { s: 480, c: anyColor() })) : frEq([fr(n, dn), '+', '□', '=', '1']),
      right: fr(m, dn), wrong: fwrong([m, dn], [[n, dn], [m + 1, dn], [m - 1, dn], [m, dn + 1], [1, dn]]), hint: L(`1 就是 ${dn} 份全部。還少幾份？`, `1 whole is all ${dn} parts. How many more parts do you need?`),
      ...frfull((F) => L(`${F(n, dn)} 和 ${F(m, dn)} 合起來是 1`, `${F(n, dn)} and ${F(m, dn)} make 1 whole`)) });
  }),
  def(T.frac, '同分母加法', 'Add like fractions', (d) => {
    const dn = rnd(3, d === 0 ? 8 : 12), whole = d === 2 && chance(0.15), sum = whole ? dn : rnd(2, dn - 1), a = rnd(1, sum - 1), b = sum - a, eq = [fr(a, dn), '+', fr(b, dn), '=', '□'];
    return Q.pick({ ...frq((F) => L(`${F(a, dn)} + ${F(b, dn)} 是多少？`, `What is ${F(a, dn)} + ${F(b, dn)}?`)), bg: 'num',
      scene: d < 2 ? col(frEq(eq, 'tiny'), `<div class="vrow" style="gap:10px">${frac(a, dn, { s: 300 })}${big('+', 40)}${frac(b, dn, { s: 300, c: '#3f8cff' })}</div>`) : frEq(eq),
      right: whole ? '1' : fr(sum, dn), wrong: fwrong([sum, dn], [[sum, dn * 2], [sum + 1, dn], [sum - 1, dn], [Math.abs(a - b), dn], [sum, dn + 1]]), hint: L('分母不變，把分子加起來。', 'Keep the bottom number. Add the top numbers.'),
      ...frfull((F) => `${F(a, dn)} + ${F(b, dn)} = ${whole ? 1 : F(sum, dn)}`) });
  }),
  def(T.frac, '同分母減法', 'Subtract like fractions', (d) => {
    const dn = rnd(3, d === 0 ? 8 : 12);
    if (d > 0 && chance(0.5)) { // 1 − n/d
      const n = rnd(1, dn - 1), m = dn - n;
      return Q.pick({ ...frq((F) => L(`1 − ${F(n, dn)} 是多少？`, `What is 1 − ${F(n, dn)}?`)), bg: 'num', scene: d < 2 ? col(frEq(['1', '−', fr(n, dn), '=', '□'], 'tiny'), frac(n, dn, { s: 480, c: anyColor() })) : frEq(['1', '−', fr(n, dn), '=', '□']),
        right: fr(m, dn), wrong: fwrong([m, dn], [[n, dn], [m + 1, dn], [m - 1, dn], [n - 1, dn], [1, dn]]), hint: L(`1 就是 ${dn} 份裡的 ${dn} 份。`, `1 whole is ${dn} out of ${dn} parts.`), ...frfull((F) => `1 − ${F(n, dn)} = ${F(m, dn)}`) });
    }
    const a = rnd(2, dn - 1), b = rnd(1, a - 1), m = a - b, eq = [fr(a, dn), '−', fr(b, dn), '=', '□'];
    return Q.pick({ ...frq((F) => L(`${F(a, dn)} − ${F(b, dn)} 是多少？`, `What is ${F(a, dn)} − ${F(b, dn)}?`)), bg: 'num', scene: d < 2 ? col(frEq(eq, 'tiny'), frac(a, dn, { s: 480, c: anyColor() })) : frEq(eq),
      right: fr(m, dn), wrong: fwrong([m, dn], [[a + b <= dn ? a + b : 0, dn], [m + 1, dn], [m - 1, dn], [b, dn], [a, dn]]), hint: L('分母不變，把分子減掉。', 'Keep the bottom number. Subtract the top numbers.'), ...frfull((F) => `${F(a, dn)} − ${F(b, dn)} = ${F(m, dn)}`) });
  }),
  def(T.frac, '分數應用題', 'Fraction word problems', (d) => {
    const [one, aone, en, e, vz, ved, ve] = pick(WHOLE), [A, B] = who2(), dn = rnd(3, d === 0 ? 8 : 12), kind = d === 2 ? pick(['add', 'left', 'more']) : pick(['add', 'left']);
    if (kind === 'left') {
      const n = rnd(1, dn - 1), m = dn - n;
      return Q.pick({ ...frq((F) => L(`${A.n}${vz}${one}的 ${F(n, dn)}。還剩下幾分之幾？`, `${A.n} ${ved} ${F(n, dn)} of ${aone}. What fraction of the ${en} is left?`)), scene: row(emo(e, 130), fig(big(fr(n, dn), 70), A.n)), bg: 'pink',
        right: fr(m, dn), wrong: fwrong([m, dn], [[n, dn], [m + 1, dn], [m - 1, dn], [1, dn]]), hint: L(`全部是 ${dn} 份裡的 ${dn} 份。`, `The whole is ${dn} out of ${dn} parts.`), ...frfull((F) => `1 − ${F(n, dn)} = ${F(m, dn)}`) });
    }
    const add = kind === 'add', hi = rnd(2, dn - 1), lo = rnd(1, hi - 1), [a, b] = add ? [lo, hi - lo] : [hi, lo], m = add ? hi : hi - lo;
    return Q.pick({ ...frq((F) => (add ? L(`${A.n}${vz}${one}的 ${F(a, dn)}，${B.n}${vz} ${F(b, dn)}。兩人一共${vz}幾分之幾？`, `${A.n} ${ved} ${F(a, dn)} of ${aone}. ${B.n} ${ved} ${F(b, dn)} of it. What fraction of the ${en} did they ${ve} altogether?`)
      : L(`${A.n}${vz}${one}的 ${F(a, dn)}，${B.n}${vz} ${F(b, dn)}。${A.n}比${B.n}多${vz}幾分之幾？`, `${A.n} ${ved} ${F(a, dn)} of ${aone}. ${B.n} ${ved} ${F(b, dn)} of it. How much more of the ${en} did ${A.n} ${ve} than ${B.n}?`))),
    scene: row(emo(e, 130), fig(big(fr(a, dn), 70), A.n), fig(big(fr(b, dn), 70), B.n)), bg: 'pink', right: fr(m, dn),
    wrong: fwrong([m, dn], add ? [[m, dn * 2], [m + 1, dn], [m - 1, dn], [Math.abs(a - b), dn]] : [[a + b <= dn ? a + b : 0, dn], [m + 1, dn], [m - 1, dn], [b, dn]]),
    hint: add ? L('合起來用加的：分母不變，分子相加。', 'Altogether means add. Keep the bottom number and add the top numbers.') : L('比多少用減的：分母不變，分子相減。', 'How much more means subtract. Keep the bottom number and subtract the top numbers.'),
    ...frfull((F) => `${F(a, dn)} ${add ? '+' : '−'} ${F(b, dn)} = ${F(m, dn)}`) });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '大月小月', 'Days in a month', (d) => {
    if (d > 0 && chance(0.45)) {
      const days = pick([30, 31]), yes = range(1, 12).filter((m) => MDAYS[m - 1] === days), ms = [...sample(yes, rnd(2, 3)), ...sample(range(1, 12).filter((m) => !yes.includes(m)), 3)].sort((x, y) => x - y), ok = ms.filter((m) => yes.includes(m)).map(mname);
      return Q.multi({ p: L(`哪些月份有 ${days} 天？全部找出來。`, `Which months have ${days} days? Find them all.`), items: ms.map((m) => [`<span class="vlabel">${mname(m)}</span>`, yes.includes(m)]), keep: true,
        full: L(`${ok.join('、')}有 ${days} 天`, `${ok.join(', ')} have ${days} days`) });
    }
    const m = d === 0 ? pick([1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) : rnd(1, 12), n = MDAYS[m - 1];
    return Q.num({ p: m === 2 ? L('2 月通常有幾天？（不是閏年）', 'How many days does February usually have? (not a leap year)') : L(`${m} 月有幾天？`, `How many days are there in ${MONTH[m - 1]}?`), scene: row(emo('📅', 120), ncard(mname(m), 'word gold')), ans: n, opts: [28, 29, 30, 31],
      hint: L('握拳數數看：凸起來的月份是大月，有 31 天。', 'Count on your knuckles: the months on the knuckles have 31 days.'), full: L(`${m} 月有 ${n} 天`, `${MONTH[m - 1]} has ${n} days`) });
  }, true),
  def(T.bonus, '年月週換算', 'Years, months, weeks and days', (d) => {
    const kind = pick(d === 0 ? ['ym', 'wd'] : ['ym', 'wd', 'my', 'dw', 'leap', 'yd']);
    if (kind === 'leap') {
      const leap = chance(0.7);
      return Q.num({ p: leap ? L('閏年的 2 月有幾天？', 'How many days are there in February in a leap year?') : L('不是閏年的時候，2 月有幾天？', 'How many days are there in February when it is not a leap year?'), scene: row(emo('📅', 120), ncard(mname(2), 'word gold')), ans: leap ? 29 : 28, opts: [28, 29, 30, 31],
        hint: L('閏年的 2 月比平常多 1 天。', 'In a leap year, February has 1 more day than usual.'), full: leap ? L('閏年的 2 月有 29 天', 'February has 29 days in a leap year') : L('平年的 2 月有 28 天', 'February usually has 28 days') });
    }
    if (kind === 'yd') {
      const leap = chance(0.5);
      return Q.num({ p: leap ? L('閏年的 2 月多 1 天。閏年一年有幾天？', 'A leap year has 1 extra day. How many days are there in a leap year?') : L('一年有幾天？（不是閏年）', 'How many days are there in 1 year? (not a leap year)'), scene: emo('🗓️', 170), ans: leap ? 366 : 365, unit: L('天', ''),
        hint: L('平常一年有 365 天，閏年多 1 天。', 'A year usually has 365 days. A leap year has 1 more.'), full: leap ? L('閏年有 366 天', 'A leap year has 366 days') : L('一年有 365 天', '1 year has 365 days') });
    }
    const n = kind === 'ym' ? rnd(1, d === 0 ? 1 : 3) : kind === 'wd' ? rnd(1, d === 0 ? 2 : 5) : kind === 'my' ? rnd(2, 3) : rnd(2, 5), year = kind === 'ym' || kind === 'my', k = year ? 12 : 7, big2 = n * k, toSmall = kind === 'ym' || kind === 'wd';
    const U = year ? [L('年', pl(n, 'year', 'years')), L('個月', 'months')] : [L('星期', pl(n, 'week', 'weeks')), L('天', 'days')], eq = (x) => (toSmall ? `${n} ${U[0]} = ${x} ${U[1]}` : `${big2} ${U[1]} = ${x} ${U[0]}`);
    return Q.num({ p: toSmall ? L(`${n} ${U[0]}是幾${U[1]}？`, eq('□')) : L(`${big2} ${U[1]}是幾${U[0]}？`, eq('□')), say: toSmall ? L(`${n} ${U[0]}是幾${U[1]}？`, `How many ${U[1]} are there in ${n} ${U[0]}?`) : L(`${big2} ${U[1]}是幾${U[0]}？`, `${big2} ${U[1]} make how many ${U[0]}?`),
      scene: bigEq(eq('□'), 'tiny'), bg: 'num', ans: toSmall ? big2 : n, lo: 1, hi: 20, hint: toSmall && n === 1 ? (year ? L('想想月曆：一年從 1 月到幾月？', 'Think of a calendar. How many months are there from January to December?') : L('從星期一數到星期日。', 'Count the days from Monday to Sunday.')) : year ? L('1 年有 12 個月。', 'There are 12 months in 1 year.') : L('1 星期有 7 天。', 'There are 7 days in 1 week.'),
      full: eq(toSmall ? big2 : n) });
  }, true),
  def(T.bonus, '先乘再加', 'Multiply, then add', (d) => {
    const it = thing(FOODS), [cz, cen, ce] = pick([['袋', 'bags', '🛍️'], ['盒', 'boxes', '📦'], ['盤', 'plates', '🍽️']]), g = d === 0 ? rnd(2, 4) : rnd(2, d === 1 ? 5 : 9), e = d === 0 ? rnd(2, 5) : pick([2, 3, 4, 5, 10]), r = rnd(1, d === 0 ? 5 : 9), ans = g * e + r;
    const show = e <= 5 && g * (e > 4 ? 172 : 124) <= 560;
    return Q.num({ p: L(`有 ${g} ${cz}${it.zh}，每${cz} ${e} ${it.m}，另外還有 ${r} ${it.m}。一共有幾${it.m}${it.zh}？`, `There are ${g} ${cen} with ${e} ${it.ens} each, and ${r} more ${pl(r, it.en, it.ens)}. How many ${it.ens} are there altogether?`),
      scene: show ? row(groups(g, e, it.k), grp(items(it.k, r, { size: 'xs', cols: 3 }))) : row(emo(ce, 130), pic(it.k, 120)), ans, lo: 1, hi: 20, count: show ? '.it' : null,
      hint: L(`先算${cz}子裡一共有幾${it.m}，再加上另外的。`, `First find how many are in the ${cen}. Then add the extra ones.`), full: `${g} × ${e} + ${r} = ${ans}` });
  }, true),
];
