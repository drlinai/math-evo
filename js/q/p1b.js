// 小一上 LV2（新加坡 P1 Term 2）：41 種題型。數到 100、加減到 20（湊十、從 10 減），第一次出現圖畫統計圖。
// 每個題型只是「概念」：數字、東西、人名、主題每次都隨機換。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, distinct, thing, things2, cnt, who, who2, THINGS, ANIMALS, FOODS, TOYS } from './core.js?v=29';
import { items, pile, grp, row, col, fig, emo, ncard, label, pic, dots, seq, bigEq, tenFrame, bond, numLine, hgrid, blocks, pgraph, tally, table, twd, modelCmp, svg } from './vis.js?v=29';

const T = { n20: ['20 以內的數', 'Numbers to 20', '🔢'], add: ['20 以內的加法', 'Addition within 20', '➕'], sub: ['20 以內的減法', 'Subtraction within 20', '➖'], story: ['應用題', 'Word problems', '📖'],
  graph: ['圖畫統計圖', 'Picture graphs', '📊'], n100: ['100 以內的數', 'Numbers to 100', '💯'], bonus: ['加分題', 'Bonus', '⭐'] };
const INK = '#2b2140', RED = '#ff5b5b', BLUE = '#3f8cff', ORANGE = '#ff9f1c';
const f = (v) => (Math.round(v * 10) / 10).toString();
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const sum = (a) => a.reduce((x, y) => x + y, 0);
// 兩個不一樣的數：差距至少 gap、最多 max
const two = (lo, hi, gap, max = 99) => { let a, b; do { a = rnd(lo, hi); b = rnd(lo, hi); } while (Math.abs(a - b) < gap || Math.abs(a - b) > max); return [a, b]; };

// ---- 數字的字：0~100（英文 sixty-three、中文 六十三）----
const EN1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ZH1 = '零一二三四五六七八九';
const enWord = (n) => (n < 20 ? EN1[n] : n === 100 ? 'one hundred' : EN10[Math.floor(n / 10)] + (n % 10 ? `-${EN1[n % 10]}` : ''));
const zhWord = (n) => (n < 10 ? ZH1[n] : n === 100 ? '一百' : (n < 20 ? '' : ZH1[Math.floor(n / 10)]) + '十' + (n % 10 ? ZH1[n % 10] : ''));
const word = (n) => L(zhWord(n), enWord(n));
// 數列唸法：問號唸成「多少」
const saySeq = (list) => L(`${list.map((v) => (v === '?' ? '多少' : v)).join('、')}。問號是多少？`, `${list.map((v) => (v === '?' ? 'what' : v)).join(', ')}. What is the missing number?`);

// ---- 自己畫的圖 ----
const tx = (x, y, s, size = 24, c = INK) => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" font-weight="900" text-anchor="middle" fill="${c}">${s}</text>`;
// 把現成的 SVG 圖放大 k 倍
const zoom = (s, k) => s.replace(/width="([\d.]+)" height="([\d.]+)"/, (m, w, h) => `width="${f(w * k)}" height="${f(h * k)}"`);
// 數線 lo~hi（每格 1）：every 每幾個數寫一次數字；tags = [[數, 字母]] 立在刻度上的牌子；hops = [從, 到] 一格一格跳的弧線；hl 塗黃色的數
function nline(lo, hi, o = {}) {
  const { every = 1, tags = [], hops = null, hl = [], w = 860 } = o, x = (v) => 40 + ((v - lo) / (hi - lo)) * (w - 80), y = 92;
  let s = `<line x1="20" y1="${y}" x2="${w - 20}" y2="${y}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  for (let v = lo; v <= hi; v++) {
    const big = v % every === 0 || hl.includes(v);
    s += `<line x1="${f(x(v))}" y1="${y - (big ? 18 : 10)}" x2="${f(x(v))}" y2="${y + (big ? 18 : 10)}" stroke="${INK}" stroke-width="${big ? 5 : 3}"/>`;
    if (hl.includes(v)) s += `<circle cx="${f(x(v))}" cy="${y + 42}" r="20" fill="#ffd43a" stroke="${INK}" stroke-width="3"/>`;
    if (big) s += tx(x(v), y + 51, v, 25);
  }
  if (hops) for (let v = hops[0]; v < hops[1]; v++) s += `<path d="M${f(x(v))},${y - 22} Q${f((x(v) + x(v + 1)) / 2)},${y - 76} ${f(x(v + 1))},${y - 22}" fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>`;
  tags.forEach(([v, t]) => { s += `<path d="M${f(x(v))},${y - 20} l-11,-16 h22 z" fill="${RED}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="${f(x(v) - 20)}" y="${y - 78}" width="40" height="40" rx="10" fill="#ffd43a" stroke="${INK}" stroke-width="4"/>${tx(x(v), y - 49, t, 27)}`; });
  return svg(w, 152, s);
}
// 十格板（可以劃掉）：n 個圓點（超過 10 用兩塊）；gone 裡的編號（從 0 算）畫成劃掉的樣子；k 放大倍率
function frames(n, gone = [], k = 1) {
  const one = (from, m) => {
    let s = `<rect x="2" y="2" width="236" height="96" rx="8" fill="#fff" stroke="${INK}" stroke-width="4"/><line x1="2" y1="50" x2="238" y2="50" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 1; i < 5; i++) s += `<line x1="${f(2 + i * 47.2)}" y1="2" x2="${f(2 + i * 47.2)}" y2="98" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 0; i < m; i++) {
      const cx = 25.6 + (i % 5) * 47.2, cy = i < 5 ? 26 : 74, x = gone.includes(from + i);
      s += `<circle cx="${f(cx)}" cy="${cy}" r="17" fill="${x ? '#e6e0f2' : RED}" stroke="${INK}" stroke-width="3"${x ? ' opacity=".75"' : ''}/>`;
      if (x) s += `<path d="M${f(cx - 15)},${cy - 15} L${f(cx + 15)},${cy + 15} M${f(cx + 15)},${cy - 15} L${f(cx - 15)},${cy + 15}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    }
    return zoom(svg(240, 100, s), k);
  };
  return n <= 10 ? one(0, n) : row(one(0, 10), one(10, n - 10));
}
// 拆數圖：上面寫「a op b」，把其中一個數（side 0 前面、1 後面）拆成 parts 兩個圈；hi 那一圈塗黃色，再用紅色虛線和另一個數連起來；tag 虛線旁的字
function splitFig(a, op, b, side, parts, hi, tag = '') {
  const X = [90, 250], x0 = X[side], x1 = X[1 - side], cx = [x0 - 50, x0 + 50], sg = x1 < cx[hi] ? 1 : -1;
  let s = tx(90, 62, a, 64) + tx(170, 60, op, 60, '#ff8a00') + tx(250, 62, b, 64);
  cx.forEach((c, i) => { s += `<line x1="${x0}" y1="76" x2="${c}" y2="122" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="${c}" cy="152" r="34" fill="${i === hi ? '#ffd43a' : '#fff8ea'}" stroke="${INK}" stroke-width="5"/>${tx(c, 165, parts[i], 38)}`; });
  s += `<line x1="${x1 + 16 * sg}" y1="80" x2="${cx[hi] - 28 * sg}" y2="128" stroke="${RED}" stroke-width="4" stroke-dasharray="7 6" stroke-linecap="round"/>`;
  if (tag) s += tx((x1 + cx[hi]) / 2 - 24 * sg, 132, tag, 24, RED);
  return svg(340, 192, s);
}
// 一排可以數的東西：最後 gone 個變淡（被拿走的）；size 'sm' | 'xs'
const its = (k, n, o = {}) => `<div class="items ${o.size ?? 'sm'}" style="--cols:${Math.min(o.cols ?? 10, Math.max(n, 1))}">${range(0, n - 1).map((i) => `<span class="it${i >= n - (o.gone ?? 0) ? ' gone' : ''}" style="--i:${i}">${pic(k, o.size === 'xs' ? 34 : 46)}<b></b></span>`).join('')}</div>`;
// 一排可以數的表情符號
const emos = (e, n, cols = 10) => `<div class="items sm" style="--cols:${Math.min(cols, Math.max(n, 1))}">${range(1, n).map(() => `<span class="it">${e}<b></b></span>`).join('')}</div>`;
// 新台幣硬幣（英文版不能有「元」字）
const ntd = (v) => L(twd(v), `<span class="twc t${v}"><small>$</small>${v}</span>`);

// ---- 應用題的故事：回傳 { p 題目, a, b, op, ans, art 可以數的圖, cnt 要數的東西, bd 分合圖／模型圖 } ----
const GOODS = [...FOODS, ...TOYS];
function changeStory(d) {
  const w = who(), it = thing(GOODS), top = d ? 20 : 12, ask = L(`${w.ta}現在有幾${it.m}${it.zh}？`, `How many ${it.ens} does ${w.he} have now?`);
  if (chance(0.4)) { // 變多
    const t = rnd(d ? 11 : 6, top), b = rnd(2, Math.min(9, Math.floor((t - 1) / 2))), a = t - b, [zh, en] = pick([['又買了', `${w.He} buys ${b} more.`], ['又拿到', `${w.He} gets ${b} more.`]]);
    return { a, b, op: '+', ans: t, p: L(`${w.n}有 ${a} ${it.m}${it.zh}，${zh} ${b} ${it.m}。${ask}`, `${w.n} has ${a} ${it.ens}. ${en} ${ask}`),
      art: row(grp(items(it.k, a, { size: 'sm', cols: a > 10 ? 6 : 5 }), 'a'), grp(items(it.k, b, { size: 'sm', cols: 5, from: a }), 'b')), cnt: '.it', bd: row(pic(it.k, 130), bond('?', a, b)) };
  }
  const a = rnd(d ? 11 : 6, top), b = rnd(2, Math.min(9, a - 2)); // 變少
  const [zh, en] = pick([['送給弟弟', `${w.He} gives ${b} to ${w.his} brother.`], ['送給朋友', `${w.He} gives ${b} to ${w.his} friend.`], FOODS.includes(it.k) ? ['吃掉了', `${w.He} eats ${b} of them.`] : ['弄丟了', `${w.He} loses ${b} of them.`]]);
  return { a, b, op: '−', ans: a - b, p: L(`${w.n}有 ${a} ${it.m}${it.zh}，${zh} ${b} ${it.m}。${ask}`, `${w.n} has ${a} ${it.ens}. ${en} ${ask}`), art: grp(its(it.k, a)), cnt: null, bd: row(pic(it.k, 130), bond(a, b, '?')) };
}
// 「求原本」：送走／吃掉 b 個之後剩 c 個，原本有幾個？（圖只畫現在剩下的）
function startStory(d) {
  const w = who(), it = thing(GOODS), a = rnd(d ? 11 : 6, d ? 20 : 12), b = rnd(2, Math.min(9, a - 2)), c = a - b, B = `${b} ${pl(b, it.en, it.ens)}`;
  const [zh, en] = pick([['送給弟弟', `${w.n} gives ${B} to ${w.his} brother.`], ['送給朋友', `${w.n} gives ${B} to ${w.his} friend.`], FOODS.includes(it.k) ? ['吃掉了', `${w.n} eats ${B}.`] : ['弄丟了', `${w.n} loses ${B}.`]]);
  return { a: c, b, op: '+', ans: a, p: L(`${w.n}${zh} ${b} ${it.m}${it.zh}後，還剩下 ${c} ${it.m}。${w.ta}原本有幾${it.m}${it.zh}？`, `${en} ${w.He} has ${c} left. How many ${it.ens} did ${w.he} have at first?`),
    art: grp(its(it.k, c)), cnt: null, bd: row(pic(it.k, 130), bond('?', c, b)) };
}
// 合併型的情境：[圖, 量詞, 中文, 英文複數] ×2 ＋ 合起來叫什麼 [量詞, 中文, 英文]
const JOIN = [
  [['👦', '個', '男生', 'boys'], ['👧', '個', '女生', 'girls'], ['個', '小朋友', 'children']],
  [['🍎', '顆', '蘋果', 'apples'], ['🍌', '根', '香蕉', 'bananas'], ['個', '水果', 'fruits']],
  [['🐱', '隻', '小貓', 'cats'], ['🐶', '隻', '小狗', 'dogs'], ['隻', '動物', 'animals']],
  [['🐥', '隻', '小雞', 'chicks'], ['🦆', '隻', '鴨子', 'ducks'], ['隻', '動物', 'birds']],
  [['🔴', '顆', '紅球', 'red balls'], ['🔵', '顆', '藍球', 'blue balls'], ['顆', '球', 'balls']],
  [['🚗', '輛', '汽車', 'cars'], ['🚌', '輛', '公車', 'buses'], ['輛', '車子', 'vehicles']],
  [['🌹', '朵', '紅花', 'red flowers'], ['🌼', '朵', '黃花', 'yellow flowers'], ['朵', '花', 'flowers']],
];
function joinStory(d) {
  const [A, B, all] = pick(JOIN), t = rnd(d ? 11 : 6, d ? 20 : 12), a = rnd(Math.max(2, t - 10), Math.min(10, t - 2)), b = t - a;
  return { a, b, op: '+', ans: t, p: L(`有 ${a} ${A[1]}${A[2]}和 ${b} ${B[1]}${B[2]}，一共有幾${all[0]}${all[1]}？`, `There are ${a} ${A[3]} and ${b} ${B[3]}. How many ${all[2]} are there altogether?`),
    art: col(grp(emos(A[0], a), 'a'), grp(emos(B[0], b), 'b')), cnt: '.it', bd: row(col(emo(A[0], 76), emo(B[0], 76)), bond('?', a, b)) };
}
function cmpStory(d) {
  const [x, y] = who2(), it = thing(GOODS), a = rnd(d ? 9 : 5, d ? 20 : 12), k = rnd(1, Math.min(9, a - 2)), b = a - k, more = chance(0.5); // x 比較多（a），y 比較少（b）
  const [p1, n1, p2, n2] = chance(0.5) ? [x, a, y, b] : [y, b, x, a], line = (p, n) => `<div class="vrow" style="gap:10px"><span class="vlabel sm" style="width:112px;text-align:right">${p.n}</span>${its(it.k, n, { size: 'xs', cols: 20 })}</div>`;
  return { a, b, op: '−', ans: k, p: L(`${p1.n}有 ${n1} ${it.m}${it.zh}，${p2.n}有 ${n2} ${it.m}。${more ? `${x.n}比${y.n}多幾${it.m}？` : `${y.n}比${x.n}少幾${it.m}？`}`,
    `${p1.n} has ${n1} ${it.ens}. ${p2.n} has ${n2} ${it.ens}. ${more ? `How many more ${it.ens} does ${x.n} have than ${y.n}?` : `How many fewer ${it.ens} does ${y.n} have than ${x.n}?`}`),
    art: `<div class="vcol" style="align-items:flex-start;gap:16px">${line(p1, n1)}${line(p2, n2)}</div>`, cnt: null, bd: modelCmp([{ name: x.n, v: a, t: a }, { name: y.n, v: b, t: b }], '?') };
}

// ---- 圖畫統計圖：主題（每列 [圖, 中文, 英文標籤, 英文句子裡的說法]）----
const GRAPHS = [
  { kind: ['水果', 'fruit'], be: 'are', rows: [['🍎', '蘋果', 'apple', 'apples'], ['🍌', '香蕉', 'banana', 'bananas'], ['🍊', '橘子', 'orange', 'oranges'], ['🍇', '葡萄', 'grapes', 'grapes'], ['🍐', '梨子', 'pear', 'pears'], ['🥭', '芒果', 'mango', 'mangoes'], ['🍑', '桃子', 'peach', 'peaches']] },
  { kind: ['寵物', 'pet'], be: 'are', rows: [['🐱', '小貓', 'cat', 'cats'], ['🐶', '小狗', 'dog', 'dogs'], ['🐰', '兔子', 'rabbit', 'rabbits'], ['🐟', '小魚', 'fish', 'fish'], ['🐦', '小鳥', 'bird', 'birds'], ['🐹', '倉鼠', 'hamster', 'hamsters'], ['🐢', '烏龜', 'turtle', 'turtles']] },
  { kind: ['顏色', 'colour'], be: 'is', rows: [['❤️', '紅色', 'red', 'red'], ['💙', '藍色', 'blue', 'blue'], ['💚', '綠色', 'green', 'green'], ['💛', '黃色', 'yellow', 'yellow'], ['💜', '紫色', 'purple', 'purple'], ['🧡', '橘色', 'orange', 'orange']] },
  { kind: ['運動', 'sport'], be: 'is', rows: [['⚽', '足球', 'football', 'football'], ['🏊', '游泳', 'swimming', 'swimming'], ['🏃', '跑步', 'running', 'running'], ['🎾', '網球', 'tennis', 'tennis'], ['🏸', '羽球', 'badminton', 'badminton'], ['🚴', '騎車', 'cycling', 'cycling']] },
  { kind: ['玩具', 'toy'], be: 'are', rows: [['🚗', '小汽車', 'car', 'toy cars'], ['🤖', '機器人', 'robot', 'robots'], ['🧸', '小熊', 'teddy', 'teddy bears'], ['🧩', '拼圖', 'puzzle', 'puzzles'], ['🏀', '皮球', 'ball', 'balls']] },
];
// counts = 每一類幾個 → { rows: [{ e, zh, en, ens, n, name }], sym, kind, be, pic 圖 }
function graphData(counts) {
  const th = pick(GRAPHS), sym = pick(['🙂', '⭐', '😀']);
  const rows = sample(th.rows, counts.length).map(([e, zh, en, ens], i) => ({ e, zh, en, ens, n: counts[i], name: L(zh, en), t: L(`${e} ${zh}`, `<span style="font-size:${en.length > 6 ? 18 : 22}px">${e} ${en}</span>`) }));
  return { rows, sym, kind: L(th.kind[0], th.kind[1]), be: th.be, pic: pgraph(rows, { sym, key: L(`每個 ${sym} 代表 1 個小朋友`, `Each ${sym} stands for 1 child`) }) };
}
// 小張的圖畫統計圖（放在選項卡片裡）：ns 每列幾個
const miniGraph = (rows, ns, sym) => `<div class="pgraph" style="padding:3px 8px;border-width:4px">${rows.map((r, i) => `<div class="pgrow" style="min-height:34px"><span class="pgl" style="width:40px;margin-right:6px">${r.e}</span><span class="pgs" style="min-width:160px;gap:1px">${`<i style="font-size:21px;width:25px">${sym}</i>`.repeat(ns[i])}</span></div>`).join('')}</div>`;
const likes = (n) => pl(n, 'child likes', 'children like');

export default [
  // ---- 20 以內的數 ----
  def(T.n20, '圈十再數', 'Circle 10, then count', (d) => {
    const it = thing(), n = rnd(11, d ? 20 : 15);
    return Q.num({ p: L(`紅圈裡有 10 ${it.m}。一共有幾${it.m}${it.zh}？`, `There are 10 in the red ring. How many ${it.ens} are there in all?`),
      scene: row(`<div class="grp" style="border:5px solid ${RED};border-radius:40px">${items(it.k, 10, { size: 'sm' })}</div>`, items(it.k, n - 10, { size: 'sm', from: 10 })), ans: n, lo: 10, hi: 20, count: '.it',
      hint: L('紅圈裡是 10，從 10 開始往下數。', 'The ring has 10. Count on from 10.'), full: L(`10 和 ${n - 10} 是 ${n}`, `10 and ${n - 10} make ${n}`) });
  }),
  def(T.n20, '十和幾', 'Ten and ones', (d) => {
    const o = rnd(1, 9), n = 10 + o, whole = d > 0 && chance(0.3);
    return Q.num({ p: whole ? L(`10 加 ${o} 是多少？`, `10 and ${o} make □.`) : L(`10 加多少是 ${n}？`, `10 and □ make ${n}.`), scene: tenFrame(10, o), ans: whole ? n : o, lo: whole ? 10 : 0, hi: whole ? 20 : 10,
      hint: L('一塊十格板放滿是 10 個。', 'A full ten-frame is 10.'), full: L(`10 加 ${o} 是 ${n}`, `10 and ${o} make ${n}`) });
  }),
  def(T.n20, '數字的字', 'Number words to 20', (d) => {
    const n = chance(0.35) ? pick([12, 15]) : rnd(11, 20), twin = n === 12 ? 20 : n === 20 || n === 11 ? 12 : (n - 10) * 10; // 容易搞混的：十二↔二十、fifteen↔fifty
    const others = sample(range(11, 20).filter((x) => x !== n && x !== twin), 2);
    if (d && chance(0.4)) return Q.pick({ p: L(`「${word(n)}」是哪一個數字？`, `Which number is ${word(n)}?`), em: false, scene: ncard(word(n), 'word gold'), right: n, wrong: [twin, ...others], sort: true, full: `${word(n)} = ${n}` });
    return Q.pick({ p: L(`${n} 的國字是哪一個？`, `Which word is ${n}?`), scene: ncard(n), right: word(n), wrong: [word(twin), word(others[0])], full: `${n} = ${word(n)}` });
  }),
  def(T.n20, '比大小', 'Greater or smaller', (d) => {
    const [a, b] = two(d ? 9 : 5, 20, 1, d ? 5 : 15), big = chance(0.5), ans = big ? Math.max(a, b) : Math.min(a, b), other = a + b - ans;
    const card = (v) => (d ? ncard(v) : col(ncard(v, 'sm'), tenFrame(v, 0, 0.6)));
    return Q.pick({ p: big ? L(`${a} 和 ${b}，哪一個比較大？`, `Which is greater, ${a} or ${b}?`) : L(`${a} 和 ${b}，哪一個比較小？`, `Which is smaller, ${a} or ${b}?`), scene: row(card(a), card(b)), right: ans, wrong: [other], sort: true,
      full: big ? L(`${ans} 比 ${other} 大`, `${ans} is greater than ${other}`) : L(`${ans} 比 ${other} 小`, `${ans} is smaller than ${other}`) });
  }),
  def(T.n20, '排序', 'Order numbers to 20', (d) => {
    const list = distinct(d ? 4 : 3, d ? 7 : 3, 20), desc = chance(0.4), sorted = [...list].sort((a, b) => (desc ? b - a : a - b));
    return Q.order({ p: desc ? L('由大到小，照順序點數字。', 'Arrange the numbers from greatest to smallest.') : L('由小到大，照順序點數字。', 'Arrange the numbers from smallest to greatest.'), items: list.map((v) => [ncard(v, 'sm'), v]), desc, full: sorted.join(', ') });
  }),
  def(T.n20, '多幾少幾', 'More than, less than', (d) => {
    const a = rnd(3, d ? 18 : 10), k = rnd(1, 2), more = chance(0.5), ans = more ? a + k : a - k, lo = Math.min(12, Math.max(0, a - 4));
    return Q.num({ p: more ? L(`比 ${a} 多 ${k} 是多少？`, `What is ${k} more than ${a}?`) : L(`比 ${a} 少 ${k} 是多少？`, `What is ${k} less than ${a}?`), scene: numLine(lo, lo + 8, { mark: a, w: 760 }), ans, lo: Math.max(0, ans - 3), hi: Math.min(20, ans + 3),
      hint: more ? L('多，就是在數線上往右邊跳。', 'More means jump to the right on the number line.') : L('少，就是在數線上往左邊跳。', 'Less means jump to the left on the number line.'),
      full: more ? L(`比 ${a} 多 ${k} 是 ${ans}`, `${k} more than ${a} is ${ans}`) : L(`比 ${a} 少 ${k} 是 ${ans}`, `${k} less than ${a} is ${ans}`) });
  }),
  def(T.n20, '數列規律', 'Number patterns', (d) => {
    const s = pick([1, 2]), up = d ? chance(0.6) : true, a = up ? rnd(d ? 4 : 1, 20 - 4 * s) : rnd(4 * s, 20), list = range(0, 4).map((i) => a + (up ? i : -i) * s), miss = rnd(d ? 1 : 2, 4);
    const shown = list.map((v, i) => (i === miss ? '?' : v));
    return Q.num({ p: L('照規律，問號是多少？', 'Look at the pattern. What is the missing number?'), say: saySeq(shown), scene: seq(shown), ans: list[miss], lo: Math.max(0, list[miss] - 4), hi: Math.min(20, list[miss] + 4),
      hint: L('看看是越來越多還是越來越少，每次差多少？', 'Do the numbers go up or down? By how many each time?'), full: list.join(', ') });
  }),
  def(T.n20, '數線定位', 'Find it on the number line', (d) => {
    if (chance(0.5)) { // 給數字，找位置（A、B、C）
      let pts; do { pts = distinct(3, 1, 19).sort((a, b) => a - b); } while (pts[1] - pts[0] < 2 || pts[2] - pts[1] < 2);
      const i = rnd(0, 2), n = pts[i], abc = ['A', 'B', 'C'];
      const q = Q.pick({ p: L(`${n} 在數線上的哪裡？`, `Where is ${n} on the number line?`), scene: nline(0, 20, { every: d ? 5 : 1, tags: pts.map((v, j) => [v, abc[j]]) }), right: abc[i], wrong: abc.filter((_, j) => j !== i),
        hint: L('從 0 開始，一格一格往右數。', 'Start at 0. Count the jumps to the right.'), full: L(`${n} 在 ${abc[i]}`, `${n} is at ${abc[i]}`) });
      q.opts.sort((x, y) => (x.h < y.h ? -1 : 1)); // 選項固定照 A、B、C 排
      return q;
    }
    const n = d ? pick(range(1, 19).filter((v) => v % 5)) : rnd(1, 19); // 給位置，問數字
    return Q.num({ p: d ? L('箭頭指的是多少？', 'Which number is the arrow pointing to?') : L('數線上的問號是多少？', 'What is the missing number on the number line?'), scene: d ? numLine(0, 20, { every: 5, mark: n }) : numLine(0, 20, { hide: [n] }), ans: n, lo: Math.max(0, n - 3), hi: Math.min(20, n + 3),
      hint: d ? L('從最近的數字開始，一格一格數。', 'Start from the nearest number. Count the jumps.') : L('看看問號的前面和後面是多少。', 'Look at the numbers before and after it.'), full: L(`是 ${n}`, `It is ${n}`) });
  }),
  // ---- 20 以內的加法 ----
  def(T.add, '湊十法', 'Make 10 to add', (d) => {
    const a = d ? rnd(5, 9) : rnd(7, 9), b = rnd(11 - a, 9), p1 = 10 - a, p2 = b - p1;
    return Q.num({ p: L(`${a} + ${b} = □，記得要先湊成 10 再數。`, `${a} + ${b} = □. Remember to make 10 first.`), scene: row(splitFig(a, '+', b, 1, [p1, p2], 0, '10'), tenFrame(a, b, 1)), ans: a + b, lo: 10, hi: 20,
      hint: L(`把 ${b} 拆成 ${p1} 和 ${p2}。${a} 和 ${p1} 先湊成 10。`, `Split ${b} into ${p1} and ${p2}. ${a} and ${p1} make 10.`), full: `${a} + ${b} = ${a + b}` });
  }),
  def(T.add, '十幾加幾', 'Teen number plus ones', (d) => {
    const o = rnd(1, d ? 8 : 5), b = rnd(1, 9 - o), a = 10 + o, eq = d && chance(0.35) ? `${b} + ${a} = □` : `${a} + ${b} = □`;
    return Q.num({ p: L(`算算看：${eq}`, eq), scene: col(bigEq(eq, 'tiny'), tenFrame(a, b)), ans: a + b, lo: 10, hi: 20, hint: L(`先算個位：${o} + ${b}，再加上 10。`, `Add the ones first: ${o} + ${b}. Then add the 10.`), full: eq.replace('□', a + b) });
  }),
  def(T.add, '雙倍', 'Doubles', (d) => {
    const it = thing(), a = rnd(1, d ? 10 : 5), eq = `${a} + ${a} = □`, g = (c, from) => grp(items(it.k, a, { size: 'sm', from }), c);
    return Q.num({ p: L(`兩邊一樣多：${eq}`, `Double it! ${eq}`), scene: col(bigEq(eq, 'tiny'), row(g('a', 0), g('b', a))), ans: a + a, lo: 0, hi: 20, count: '.it', hint: L(`兩邊都是 ${a} 個，合起來數數看。`, `Both groups have ${a}. Count them all.`), full: `${a} + ${a} = ${a + a}` });
  }),
  def(T.add, '雙倍加一', 'Doubles plus one', (d) => {
    const a = rnd(1, d ? 9 : 5), [x, y] = chance(0.5) ? [a, a + 1] : [a + 1, a], eq = `${x} + ${y} = □`;
    const line = (n, c) => `<div class="vrow" style="gap:2px">${dots(a, c, { cols: 10 })}${n > a ? dots(1, ORANGE) : ''}</div>`;
    return Q.num({ p: L(`用雙倍來想：${eq}`, `Use doubles to help. ${eq}`), scene: col(bigEq(eq, 'tiny'), `<div class="vcol" style="align-items:flex-start;gap:2px">${line(x, RED)}${line(y, BLUE)}</div>`), ans: x + y, lo: 0, hi: 20, count: '.it',
      hint: L(`先想 ${a} + ${a} 是多少，再多 1。`, `Think of ${a} + ${a} first. Then add 1 more.`), full: `${x} + ${y} = ${x + y}` });
  }),
  def(T.add, '三個數相加', 'Add three numbers', (d) => {
    const x = rnd(1, 9), c = rnd(1, 9), list = d ? shuffle([x, 10 - x, c]) : chance(0.5) ? [x, 10 - x, c] : [c, x, 10 - x], eq = `${list.join(' + ')} = □`;
    return Q.num({ p: L(`先找合起來是 10 的兩個數：${eq}`, `Look for two numbers that make 10. ${eq}`), scene: bigEq(eq), ans: 10 + c, lo: 10, hi: 20, hint: L('哪兩個數合起來是 10？先把它們加起來。', 'Which two numbers make 10? Add them first.'), full: eq.replace('□', 10 + c) });
  }),
  def(T.add, '缺數加法', 'Missing number in addition', (d) => {
    const t = rnd(d ? 11 : 6, d ? 20 : 12), b = rnd(Math.max(2, t - 12), Math.min(9, t - 2)), first = chance(0.5), eq = first ? `□ + ${b} = ${t}` : `${b} + □ = ${t}`;
    return Q.num({ p: L(`空格是多少？${eq}`, eq), say: first ? L(`多少加 ${b} 等於 ${t}？`, `What plus ${b} equals ${t}?`) : L(`${b} 加多少等於 ${t}？`, `${b} plus what equals ${t}?`), scene: row(bigEq(eq, 'xs'), bond(t, first ? '?' : b, first ? b : '?')), ans: t - b, lo: 0, hi: Math.max(10, t - b + 3),
      hint: L(`從 ${b} 往上數到 ${t}，數了幾個？`, `Count on from ${b} to ${t}. How many did you count?`), full: eq.replace('□', t - b) });
  }),
  // ---- 20 以內的減法 ----
  def(T.sub, '十幾減幾', 'Teen number minus ones', (d) => {
    const o = rnd(2, d ? 9 : 6), a = 10 + o, b = rnd(1, o), eq = `${a} − ${b} = □`;
    return Q.num({ p: L(`算算看：${eq}`, eq), scene: col(bigEq(eq, 'tiny'), frames(a, range(a - b, a - 1), 1.3)), ans: a - b, lo: 10, hi: 20, hint: L(`先算個位：${o} − ${b}，10 不用動。`, `Subtract the ones first: ${o} − ${b}. The 10 stays.`), full: eq.replace('□', a - b) });
  }),
  def(T.sub, '從 10 減', 'Subtract from 10', (d) => {
    const o = rnd(1, 8), b = rnd(o + 1, 9), a = 10 + o, r = 10 - b;
    return Q.num({ p: L(`從 10 裡面減：${a} − ${b} = □`, `Subtract from the 10. ${a} − ${b} = □`), scene: row(splitFig(a, '−', b, 0, [o, 10], 1), d ? frames(a, range(r, 9)) : col(frames(a, range(r, 9)), label(`10 − ${b} = ${r} → ${r} + ${o} = ?`))), ans: a - b, lo: 0, hi: 10,
      hint: L(`把 ${a} 分成 10 和 ${o}。先算 10 − ${b}，再加上 ${o}。`, `Split ${a} into 10 and ${o}. Take ${b} from 10. Then add ${o}.`), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '往上數求差', 'Count on to subtract', (d) => {
    const k = rnd(1, d ? 4 : 3), a = rnd(k + 5, 20), b = a - k, eq = `${a} − ${b} = □`;
    return Q.num({ p: L(`往上數數看：${eq}`, `Count on to find the answer. ${eq}`), scene: col(bigEq(eq, 'tiny'), nline(b - 2, Math.min(20, a + 2), { hops: d < 2 ? [b, a] : null, hl: [b, a], w: 760 })), ans: k, lo: 0, hi: 6,
      hint: L(`從 ${b} 往上數到 ${a}，跳了幾格？`, `Count on from ${b} to ${a}. How many jumps?`), full: eq.replace('□', k) });
  }),
  def(T.sub, '缺數減法', 'Missing number in subtraction', (d) => {
    const a = rnd(d ? 11 : 6, d ? 20 : 12), x = rnd(2, Math.min(9, a - 1)), c = a - x;
    if (d && chance(0.25)) { const eq = `□ − ${x} = ${c}`; // 被減數不見了
      return Q.num({ p: L(`空格是多少？${eq}`, eq), say: L(`多少減 ${x} 等於 ${c}？`, `What minus ${x} equals ${c}?`), scene: row(bigEq(eq, 'xs'), bond('?', x, c)), ans: a, lo: 10, hi: 20, hint: L(`把 ${x} 和 ${c} 合起來。`, `Put ${x} and ${c} together.`), full: eq.replace('□', a) }); }
    const eq = `${a} − □ = ${c}`;
    return Q.num({ p: L(`空格是多少？${eq}`, eq), say: L(`${a} 減多少等於 ${c}？`, `${a} minus what equals ${c}?`), scene: row(bigEq(eq, 'xs'), bond(a, '?', c)), ans: x, lo: 0, hi: 10, hint: L(`${a} 可以分成 ${c} 和多少？`, `${a} is ${c} and what?`), full: eq.replace('□', x) });
  }),
  def(T.sub, '加減一家人', 'Fact family', (d) => {
    let a, b; do { a = rnd(2, 9); b = rnd(2, d ? 11 : 6); } while (a === b || a + b > (d ? 20 : 12));
    const c = a + b, good = [`${a} + ${b} = ${c}`, `${b} + ${a} = ${c}`, `${c} − ${a} = ${b}`, `${c} − ${b} = ${a}`], bad = [`${a} − ${b} = ${c}`, `${b} − ${a} = ${c}`, `${c} + ${a} = ${b}`, `${a} + ${c} = ${b}`, `${c} − ${a} = ${a}`, `${c} − ${b} = ${b}`];
    const card = (s) => `<span class="vlabel" style="font-size:42px;white-space:nowrap">${s}</span>`;
    return Q.multi({ p: L(`用 ${a}、${b}、${c} 可以寫出哪些正確的算式？全部選出來。`, `Use ${a}, ${b} and ${c}. Which number sentences are correct? Choose them all.`), items: [...sample(good, d ? 4 : 3).map((s) => [card(s), true]), ...sample(bad, 2).map((s) => [card(s), false])],
      hint: L('每個算式都算算看，對的才選。', 'Work out each one. Choose only the correct ones.'), full: L(`${good[0]}，${good[2]}`, `${good[0]}, ${good[2]}`) });
  }),
  def(T.sub, '算式比大小', 'Compare two sums', (d) => {
    const [v1, v2] = d ? two(5, 19, 1, 3) : two(3, 12, 2, 5), ops = chance(0.7) ? shuffle(['+', '−']) : pick([['+', '+'], ['−', '−']]), big = chance(0.5), want = big ? Math.max(v1, v2) : Math.min(v1, v2);
    const expr = (v, op) => { if (op === '+') { const x = rnd(1, v - 1); return `${x} + ${v - x}`; } const y = rnd(1, Math.min(9, 20 - v)); return `${v + y} − ${y}`; };
    const e1 = expr(v1, ops[0]), e2 = expr(v2, ops[1]), card = (s) => `<span class="vlabel" style="font-size:84px;white-space:nowrap">${s}</span>`;
    return Q.tap({ p: big ? L(`${e1} 和 ${e2}，哪一個比較大？`, `Which is greater, ${e1} or ${e2}?`) : L(`${e1} 和 ${e2}，哪一個比較小？`, `Which is smaller, ${e1} or ${e2}?`), cards: [[card(e1), v1 === want], [card(e2), v2 === want]],
      hint: L('兩個算式都先算出答案，再比一比。', 'Work out both answers first. Then compare.'), full: L(`${e1} = ${v1}，${e2} = ${v2}`, `${e1} = ${v1}, ${e2} = ${v2}`) });
  }),
  // ---- 應用題 ----
  def(T.story, '改變型', 'Change stories', (d) => {
    const start = chance(0.4), s = start ? startStory(d) : changeStory(d);
    return Q.num({ p: s.p, scene: d ? s.bd : s.art, ans: s.ans, lo: Math.max(0, s.ans - 4), hi: Math.min(20, s.ans + 4), count: d ? null : s.cnt,
      hint: start ? L('把不見的加回來，就是原本的。', 'Put back the ones that went away. Add.') : s.op === '+' ? L('變多了，用加的。', 'There are more now. Add.') : L('變少了，用減的。', 'There are fewer now. Subtract.'), full: `${s.a} ${s.op} ${s.b} = ${s.ans}` });
  }),
  def(T.story, '合併型', 'Put-together stories', (d) => {
    const s = joinStory(d);
    return Q.num({ p: s.p, scene: d ? s.bd : s.art, ans: s.ans, lo: Math.max(0, s.ans - 4), hi: Math.min(20, s.ans + 4), count: d ? null : s.cnt, hint: L('「一共」就是把兩邊合起來，用加的。', '"Altogether" means put the two groups together. Add.'), full: `${s.a} + ${s.b} = ${s.ans}` });
  }),
  def(T.story, '比較型', 'Comparing stories', (d) => {
    const s = cmpStory(d);
    return Q.num({ p: s.p, scene: d < 2 ? s.art : s.bd, ans: s.ans, lo: 0, hi: Math.max(8, s.ans + 3), hint: L('比多少，用大的數減小的數。', 'To compare, take the smaller number from the greater number.'), full: `${s.a} − ${s.b} = ${s.ans}` });
  }),
  def(T.story, '選算式', 'Choose the number sentence', (d) => {
    const s = pick([changeStory, joinStory, cmpStory])(d), hi = Math.max(s.a, s.b), lo = Math.min(s.a, s.b);
    const wrong = s.op === '+' ? [`${hi} − ${lo} = □`, `□ + ${lo} = ${hi}`] : [`${s.a} + ${s.b} = □`, `□ − ${s.b} = ${s.a}`];
    return Q.pick({ p: `${s.p}${L('選出對的算式。', ' Choose the number sentence.')}`, say: `${s.p} ${L('哪一個算式是對的？', 'Which number sentence matches the story?')}`, scene: s.art, right: `${s.a} ${s.op} ${s.b} = □`, wrong,
      hint: s.op === '+' ? L('合起來、變多，用加的。', 'Putting together or getting more? Add.') : L('拿走、比多少，用減的。', 'Taking away or comparing? Subtract.'), full: `${s.a} ${s.op} ${s.b} = ${s.ans}` });
  }),
  // ---- 圖畫統計圖 ----
  def(T.graph, '讀數量', 'Read a picture graph', (d) => {
    const counts = range(1, d ? pick([3, 4]) : 3).map(() => rnd(1, d ? 10 : 6));
    if (d && chance(0.15)) counts[0] = 0;
    const g = graphData(counts), r = pick(g.rows);
    return Q.num({ p: L(`幾個小朋友喜歡${r.zh}？`, `How many children like ${r.ens}?`), scene: g.pic, ans: r.n, lo: 0, hi: 10, hint: L(`找到${r.zh}那一排，數數看有幾個 ${g.sym}。`, `Find the row for ${r.en}. Count the ${g.sym} in that row.`), full: L(`${r.n} 個小朋友喜歡${r.zh}`, `${r.n} ${likes(r.n)} ${r.ens}`) });
  }),
  def(T.graph, '最多最少', 'Most and least', (d) => {
    const g = graphData(distinct(d ? pick([3, 4]) : 3, 1, d ? 10 : 7)), most = chance(0.5), r = [...g.rows].sort((x, y) => (most ? y.n - x.n : x.n - y.n))[0], opt = (x) => fig(emo(x.e, 56), x.name);
    return Q.pick({ p: most ? L(`最多人喜歡哪一種${g.kind}？`, `Which ${g.kind} is the most popular?`) : L(`最少人喜歡哪一種${g.kind}？`, `Which ${g.kind} is the least popular?`), scene: g.pic, right: opt(r), wrong: g.rows.filter((x) => x !== r).map(opt),
      hint: most ? L('哪一排最長？', 'Which row is the longest?') : L('哪一排最短？', 'Which row is the shortest?'), full: most ? L(`最多人喜歡${r.zh}`, `Most children like ${r.ens}`) : L(`最少人喜歡${r.zh}`, `The fewest children like ${r.ens}`) });
  }),
  def(T.graph, '相差多少', 'How many more?', (d) => {
    const g = graphData(distinct(d ? pick([3, 4]) : 3, 1, d ? 10 : 7)), pairs = g.rows.flatMap((x) => g.rows.filter((y) => x.n > y.n && x.n - y.n <= 6).map((y) => [x, y])), [A, B] = pick(pairs), more = chance(0.5), k = A.n - B.n;
    return Q.num({ p: more ? L(`喜歡${A.zh}的比喜歡${B.zh}的多幾個人？`, `How many more children like ${A.ens} than ${B.ens}?`) : L(`喜歡${B.zh}的比喜歡${A.zh}的少幾個人？`, `How many fewer children like ${B.ens} than ${A.ens}?`), scene: g.pic, ans: k, lo: 0, hi: 8,
      hint: L('兩排一個對一個，看看多出來幾個。', 'Match the two rows one to one. How many are left over?'), full: `${A.n} − ${B.n} = ${k}` });
  }),
  def(T.graph, '總數', 'How many altogether?', (d) => {
    let counts; do { counts = range(1, d ? pick([3, 4]) : 3).map(() => rnd(1, d ? 8 : 5)); } while (sum(counts) > (d ? 20 : 12) || sum(counts) < 5);
    const g = graphData(counts), t = sum(counts);
    return Q.num({ p: L('一共有幾個小朋友？', 'How many children are there altogether?'), scene: g.pic, ans: t, lo: Math.max(0, t - 4), hi: Math.min(20, t + 4), hint: L('把每一排的數量加起來。', 'Add up all the rows.'), full: `${counts.join(' + ')} = ${t}` });
  }),
  def(T.graph, '動手做圖', 'Make a picture graph', (d) => {
    const g = graphData(distinct(3, 1, d ? 6 : 5)), ns = g.rows.map((r) => r.n), [i, j] = sample([0, 1, 2], 2), swap = [...ns], off = [...ns];
    [swap[i], swap[j]] = [swap[j], swap[i]];
    off[j] += off[j] >= 6 || (off[j] > 1 && chance(0.5)) ? -1 : 1;
    return Q.tap({ p: L('照這張表畫圖，哪一張畫對了？', 'Look at the table. Which picture graph is correct?'), top: table([g.rows.map((r) => `${r.e} ${r.name}`), ns]), right: miniGraph(g.rows, ns, g.sym), wrong: [miniGraph(g.rows, swap, g.sym), miniGraph(g.rows, off, g.sym)],
      hint: L('一排一排對對看，數量要和表上一樣。', 'Check each row. It must match the number in the table.'), full: L(g.rows.map((r) => `${r.zh} ${r.n}`).join('、'), g.rows.map((r) => `${r.en} ${r.n}`).join(', ')) });
  }),
  def(T.graph, '判斷對錯', 'True or false?', (d) => {
    const g = graphData(distinct(d ? pick([3, 4]) : 3, 1, d ? 10 : 6)), [A, B] = sample(g.rows, 2), want = chance(0.5), kind = rnd(1, 3), yes = L('對', 'True'), no = L('不對', 'False');
    let zh, en, fact;
    if (kind === 1) { // 兩類比多少
      const more = chance(0.5), hi = A.n > B.n ? A : B, lo = A.n > B.n ? B : A, [X, Y] = more === want ? [hi, lo] : [lo, hi];
      zh = `喜歡${X.zh}的人比喜歡${Y.zh}的人${more ? '多' : '少'}。`; en = `${more ? 'More' : 'Fewer'} children like ${X.ens} than ${Y.ens}.`; fact = L(`${X.zh} ${X.n} 個，${Y.zh} ${Y.n} 個`, `${X.en} ${X.n}, ${Y.en} ${Y.n}`);
    } else if (kind === 2) { // 某一類有幾個
      const n = want ? A.n : A.n + (A.n > 1 && chance(0.5) ? -1 : 1);
      zh = `有 ${n} 個小朋友喜歡${A.zh}。`; en = `${n} ${likes(n)} ${A.ens}.`; fact = L(`${A.n} 個小朋友喜歡${A.zh}`, `${A.n} ${likes(A.n)} ${A.ens}`);
    } else { // 最多、最少
      const most = chance(0.5), real = [...g.rows].sort((x, y) => (most ? y.n - x.n : x.n - y.n))[0], X = want ? real : pick(g.rows.filter((r) => r !== real));
      zh = `${most ? '最多' : '最少'}人喜歡${X.zh}。`; en = `${cap(X.ens)} ${g.be} the ${most ? 'most' : 'least'} popular ${g.kind}.`; fact = L(`${most ? '最多' : '最少'}人喜歡${real.zh}`, `${cap(real.ens)} ${g.be} the ${most ? 'most' : 'least'} popular ${g.kind}`);
    }
    return Q.yn({ p: L(`「${zh}」對不對？`, `"${en}" True or false?`), scene: g.pic, ans: want, yes, no, hint: L('看圖數一數，再想想這句話對不對。', 'Count on the graph. Then check the sentence.'), full: `${want ? yes : no}${L('：', ': ')}${fact}` });
  }),
  // ---- 100 以內的數 ----
  def(T.n100, '十個一數', 'Count in tens', (d) => {
    const up = d ? chance(0.7) : true, a = (up ? rnd(1, 7) : rnd(6, 10)) * 10, list = range(0, 3).map((i) => a + (up ? i : -i) * 10), miss = d ? rnd(2, 3) : 3, shown = list.map((v, i) => (i === miss ? '?' : v));
    return Q.num({ p: up ? L('十個一數，問號是多少？', 'Count in tens. What is the missing number?') : L('十個一數，倒過來數，問號是多少？', 'Count back in tens. What is the missing number?'), say: saySeq(shown), scene: seq(shown), ans: list[miss],
      hint: up ? L('每次多 10，十位的數字多 1。', 'Add 10 each time. The tens digit goes up by 1.') : L('每次少 10，十位的數字少 1。', 'Take away 10 each time. The tens digit goes down by 1.'), full: list.join(', ') });
  }),
  def(T.n100, '幾個十幾個一', 'Tens and ones', (d) => {
    let n; do { n = rnd(11, 99); } while (d < 2 && n % 10 === 0);
    const t = Math.floor(n / 10), o = n % 10, v = d ? pick(['t', 'o', 'n']) : pick(['t', 'o']), tens = `${t} ${pl(t, 'ten', 'tens')}`, ones = `${o} ${pl(o, 'one', 'ones')}`;
    const p = v === 't' ? L(`${n} 是 □ 個十和 ${o} 個一。`, `${n} is □ tens and ${ones}.`) : v === 'o' ? L(`${n} 是 ${t} 個十和 □ 個一。`, `${n} is ${tens} and □ ones.`) : L(`${t} 個十和 ${o} 個一是多少？`, `${tens} and ${ones} make □.`);
    return Q.num({ p, scene: zoom(blocks(n), 2.3), ans: v === 't' ? t : v === 'o' ? o : n, lo: v === 'n' ? 10 : 0, hi: v === 'n' ? 24 : 9, hint: L('綠色一條是 10，橘色一顆是 1。', 'Each green rod is 10. Each small cube is 1.'), full: L(`${n} 是 ${t} 個十和 ${o} 個一`, `${n} is ${tens} and ${ones}`) });
  }),
  def(T.n100, '拆成十和一', 'Break into tens and ones', (d) => {
    let n; do { n = rnd(11, 99); } while (n % 10 === 0);
    const o = n % 10, t = n - o, v = d ? pick(['o', 't', 'n']) : pick(['o', 't']), eq = v === 'o' ? `${n} = ${t} + □` : v === 't' ? `${n} = □ + ${o}` : `${t} + ${o} = □`, ans = v === 'o' ? o : v === 't' ? t : n;
    return Q.num({ p: L(v === 'n' ? `合起來是多少？${eq}` : `拆成幾十和幾：${eq}`, eq), scene: row(bond(v === 'n' ? '?' : n, v === 't' ? '?' : t, v === 'o' ? '?' : o), bigEq(eq, 'xs')), ans, lo: v === 'o' ? 0 : 10, hi: v === 'o' ? 9 : 24, ...(v === 't' && t <= 20 ? { opts: [o, 10, 20, 30] } : {}),
      hint: L(`${n} 的十位是 ${t / 10}，個位是 ${o}。`, `${n} has ${t / 10} ${pl(t / 10, 'ten', 'tens')} and ${o} ${pl(o, 'one', 'ones')}.`), full: `${n} = ${t} + ${o}` });
  }),
  def(T.n100, '數字的字', 'Number words to 100', (d) => {
    const n = chance(0.12) ? 100 : chance(d ? 0.25 : 0.5) ? rnd(2, 9) * 10 : rnd(21, 99), t = Math.floor(n / 10), o = n % 10;
    const cand = [o && o !== t ? o * 10 + t : 10 + t, n === 100 ? 10 : 10 + t, n - 10, n + 10, n + 1, n - 1, 10 * o + t + 1].filter((v) => v >= 11 && v <= 100 && v !== n), wrong = [...new Set(cand)].slice(0, 3);
    if (d && chance(0.4)) return Q.pick({ p: L(`${n} 的國字是哪一個？`, `Which word is ${n}?`), scene: ncard(n), right: word(n), wrong: wrong.slice(0, 2).map(word), full: `${n} = ${word(n)}` });
    return Q.pick({ p: L(`「${word(n)}」是哪一個數字？`, `Which number is ${word(n)}?`), em: false, scene: ncard(word(n), 'word gold'), right: n, wrong, sort: true, ...([n, ...wrong].some((v) => v >= 100) ? { cls: 'txt' } : {}), full: `${word(n)} = ${n}` });
  }),
  def(T.n100, '兩位數比大小', 'Compare two-digit numbers', (d) => {
    const kind = d ? pick(['rev', 'tens', 'ones', 'any']) : pick(['ones', 'any']), [p, q] = distinct(2, 1, 9), u = rnd(0, 9);
    const [a, b] = kind === 'rev' ? [p * 10 + q, q * 10 + p] : kind === 'tens' ? [p * 10 + q, p * 10 + (q + rnd(1, 9)) % 10] : kind === 'ones' ? [p * 10 + u, q * 10 + u] : two(11, 99, d ? 1 : 8);
    const big = chance(0.5), ans = big ? Math.max(a, b) : Math.min(a, b), other = a + b - ans, card = (v) => (d ? ncard(v) : col(ncard(v, 'sm'), zoom(blocks(v), 1.3)));
    return Q.pick({ p: big ? L(`${a} 和 ${b}，哪一個比較大？`, `Which is greater, ${a} or ${b}?`) : L(`${a} 和 ${b}，哪一個比較小？`, `Which is smaller, ${a} or ${b}?`), scene: row(card(a), card(b)), right: ans, wrong: [other], sort: true,
      hint: L('先比十位；十位一樣，再比個位。', 'Compare the tens first. If they are the same, compare the ones.'), full: big ? L(`${ans} 比 ${other} 大`, `${ans} is greater than ${other}`) : L(`${ans} 比 ${other} 小`, `${ans} is smaller than ${other}`) });
  }),
  def(T.n100, '排序', 'Order two-digit numbers', (d) => {
    const [p, q] = distinct(2, 1, 9), pool = [...new Set([p * 10 + q, q * 10 + p, p * 11, q * 11, rnd(11, 99), rnd(11, 99)])], list = sample(pool, d ? 4 : 3), desc = chance(0.5), sorted = [...list].sort((a, b) => (desc ? b - a : a - b));
    return Q.order({ p: desc ? L('由大到小，照順序點數字。', 'Arrange the numbers from greatest to smallest.') : L('由小到大，照順序點數字。', 'Arrange the numbers from smallest to greatest.'), items: list.map((v) => [ncard(v, 'sm'), v]), desc,
      hint: L('先比十位；十位一樣，再比個位。', 'Compare the tens first. If they are the same, compare the ones.'), full: sorted.join(', ') });
  }),
  def(T.n100, '百數表缺格', 'Hundred chart', (d) => {
    const k = d ? pick([1, -1, 10, -10]) : pick([1, 10]);
    const n = k === 10 ? rnd(11, 90) : k === -10 ? rnd(21, 99) : k === 1 ? (chance(0.4) ? rnd(1, 9) * 10 + 9 : rnd(11, 99)) : chance(0.4) ? rnd(2, 10) * 10 : rnd(12, 99), ans = n + k;
    const from = Math.min(71, Math.max(1, Math.floor((Math.min(n, ans) - 1) / 10) * 10 - 9)); // 上面多放一列，問號和黃色的數一定都看得到
    const p = k === 1 ? L(`${n} 的下一個數是多少？`, `What comes after ${n}?`) : k === -1 ? L(`${n} 的前一個數是多少？`, `What comes before ${n}?`) : k === 10 ? L(`比 ${n} 多 10 是多少？`, `What is 10 more than ${n}?`) : L(`比 ${n} 少 10 是多少？`, `What is 10 less than ${n}?`);
    return Q.num({ p, scene: hgrid(from, 3, { q: ans, hl: [n] }), ans, lo: Math.max(1, ans - 4), hi: ans + 4,
      hint: Math.abs(k) === 10 ? L('多 10 是往下一格，少 10 是往上一格。', '10 more is one row down. 10 less is one row up.') : L('往右一格多 1，往左一格少 1。', 'One box to the right is 1 more. One box to the left is 1 less.'),
      full: k === 1 ? `${n}, ${ans}` : k === -1 ? `${ans}, ${n}` : k === 10 ? L(`比 ${n} 多 10 是 ${ans}`, `10 more than ${n} is ${ans}`) : L(`比 ${n} 少 10 是 ${ans}`, `10 less than ${n} is ${ans}`) });
  }),
  def(T.n100, '數列規律', 'Number patterns to 100', (d) => {
    const s = d ? pick([1, 2, 5, 10]) : pick([2, 5, 10]), up = d ? chance(0.65) : true;
    const a = s === 1 ? rnd(3, 9) * 10 + (up ? -rnd(1, 3) : rnd(1, 2)) : s === 5 ? 5 * (up ? rnd(4, 17) : rnd(8, 20)) : s === 10 ? (up ? rnd(21, 69) : rnd(51, 99)) : up ? rnd(20, 94) : rnd(28, 100);
    const list = range(0, 3).map((i) => a + (up ? i : -i) * s), miss = d ? rnd(1, 3) : 3, shown = list.map((v, i) => (i === miss ? '?' : v));
    return Q.num({ p: L('照規律，問號是多少？', 'Look at the pattern. What is the missing number?'), say: saySeq(shown), scene: seq(shown), ans: list[miss], hint: L('先看旁邊兩個數差多少，每次都差一樣多。', 'Find the difference between two numbers next to each other. It is the same each time.'), full: list.join(', ') });
  }),
  def(T.n100, '先估再數', 'Estimate, then count in tens', (d) => {
    const it = thing();
    if (d && chance(0.35)) { // 先估：不數，選最接近的
      const a = pick([10, 20, 30]), opts = [a, a + 30, a + 60], t = pick(opts), n = t + rnd(-3, 3);
      return Q.pick({ p: L(`不要一個一個數，猜猜看大約有幾${it.m}${it.zh}？`, `About how many ${it.ens} are there? Do not count one by one.`), scene: pile(it.k, n, { w: 860, h: 270, s: 30 }), right: t, wrong: opts.filter((v) => v !== t), sort: true,
        hint: L('先看 10 個大概是多大一堆。', 'Look at how big a group of 10 is first.'), full: L(`大約 ${t} ${it.m}（剛好是 ${n} ${it.m}）`, `About ${t} (there are ${n})`) });
    }
    const g = rnd(2, d ? 10 : 6), o = d === 2 && g < 10 && chance(0.5) ? rnd(1, 9) : 0, n = g * 10 + o, per = g + (o ? 1 : 0) > 5 ? Math.ceil((g + (o ? 1 : 0)) / 2) : 5; // 再數：十個一盤
    const cell = (c) => `<div class="items" style="grid-template-columns:repeat(5,26px);gap:1px;min-height:0">${range(1, c).map(() => `<span class="it" style="width:26px;height:26px">${pic(it.k, 26)}</span>`).join('')}</div>`;
    const scene = `<div class="vrow wrap" style="gap:8px 10px;max-width:${per * 166}px">${range(1, g).map(() => `<div class="plate2" style="padding:4px 6px;border-radius:14px">${cell(10)}</div>`).join('')}${o ? cell(o) : ''}</div>`;
    return Q.num({ p: L(`每一盤有 10 ${it.m}。十個一數，一共有幾${it.m}${it.zh}？`, `Each tray has 10. Count in tens. How many ${it.ens} are there?`), scene, ans: n, ...(n <= 20 ? { opts: [10, 20, 30, 40] } : {}),
      hint: L('一盤是 10：10、20、30… 這樣數。', 'One tray is 10. Count 10, 20, 30…'), full: L(`${g} 個十${o ? `和 ${o} 個一` : ''}是 ${n}`, `${g} tens${o ? ` and ${o} ${pl(o, 'one', 'ones')}` : ''} make ${n}`) });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '統計表畫記', 'Tally marks', (d) => {
    const ks = sample(ANIMALS, 3).map((k) => ({ k, ...THINGS[k] })), a = ks[0];
    if (chance(0.5)) { // 數一數，選對的畫記
      const ns = distinct(3, 2, d ? 7 : 5), n = ns[0], all = shuffle(ks.flatMap((x, i) => range(1, ns[i]).map(() => x.k))), card = (v) => zoom(tally(v), 1.8);
      return Q.tap({ p: L(`數一數${a.zh}有幾${a.m}，哪一個畫記是對的？`, `Count the ${a.ens}. Which tally shows how many?`), top: `<div class="items sm" style="--cols:10">${all.map((k) => `<span class="it${k === a.k ? ' t' : ''}">${pic(k, 46)}<b></b></span>`).join('')}</div>`,
        right: card(n), wrong: sample([n - 2, n - 1, n + 1, n + 2].filter((v) => v >= 1), 2).map(card), count: '.taptop .it.t', hint: L('一條線代表 1 個，第 5 條要斜斜地畫過去。', 'One mark for each one. The 5th mark goes across.'), full: cnt(n, a) });
    }
    const ns = ks.map(() => rnd(d ? 3 : 2, d ? 14 : 9)), order = shuffle([0, 1, 2]); // 看畫記，說出數量
    return Q.num({ p: L(`看畫記，${a.zh}有幾${a.m}？`, `Look at the tally chart. How many ${a.ens} are there?`), scene: table([[L('動物', 'Animal'), L('畫記', 'Tally')], ...order.map((i) => [`<span class="vrow" style="gap:8px">${pic(ks[i].k, 38)}${L(ks[i].zh, ks[i].en)}</span>`, tally(ns[i])])]),
      ans: ns[0], lo: Math.max(0, ns[0] - 4), hi: ns[0] + 4, hint: L('一捆是 5，先 5 個一數，再往下數。', 'Each bundle is 5. Count in fives first. Then count on.'), full: cnt(ns[0], a) });
  }, true),
  def(T.bonus, '新台幣認錢', 'Taiwan coins', (d) => {
    let cs; do { cs = [...range(1, d ? rnd(0, 1) : 0).map(() => 50), ...range(1, rnd(0, d ? 4 : 2)).map(() => 10), ...range(1, rnd(0, d ? 3 : 1)).map(() => 5), ...range(1, rnd(0, 4)).map(() => 1)]; } while (cs.length < 2 || cs.length > 9 || sum(cs) > 100);
    const t = sum(cs);
    return Q.num({ p: L('這些錢一共是多少元？', 'These are Taiwan coins. How many dollars are there in all?'), scene: `<div class="moneyrow">${cs.map(ntd).join('')}</div>`, ans: t, lo: Math.max(0, t - 5), hi: t + 5, unit: L('元', ''),
      hint: L('從最大的錢開始數，再接著往下加。', 'Start with the biggest coin. Then count on.'), full: L(`${t} 元`, `${t} dollars`) });
  }, true),
];
