// 大班（新加坡 K2）：40 種題型。數到 20、分合到 10，開始認數字的「字」（中文版認國字、英文版認英文單字）。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, distinct, thing, things2, cnt, THINGS, ANIMALS, FOODS, TOYS } from './core.js?v=17';
import { items, pile, grp, row, col, fig, emo, ncard, label, pic, seq, tenFrame, shape, bars, bond, ruler, gridMap, lineup, numLine, svg, COLORS, SHAPES, BASIC, cname, sname } from './vis.js?v=17';

const T = { count: ['點數', 'Counting', '🔢'], numeral: ['數字', 'Numbers', '7️⃣'], word: ['數字的字', 'Number words', '🔤'], seq: ['順序', 'Number order', '➡️'], compare: ['比較', 'Comparing', '⚖️'],
  bond: ['分合', 'Number bonds', '🫧'], pattern: ['型式', 'Patterns', '🔁'], sort: ['分類', 'Sorting', '🗂️'], order: ['排序', 'Ordering', '📶'], shape: ['形狀', 'Shapes', '🔺'], pos: ['位置', 'Position', '📍'], bonus: ['加分題', 'Bonus', '⭐'] };
const CK = Object.keys(COLORS);
const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const ZH_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
const word = (n) => L(ZH_NUM[n], EN_NUM[n]);
const sh = (k, c, s = 80, rot = 0) => shape(k, { c: COLORS[c].c, s, rot });
const two = (lo, hi, gap, max = 99) => { let a, b; do { a = rnd(lo, hi); b = rnd(lo, hi); } while (Math.abs(a - b) < gap || Math.abs(a - b) > max); return [a, b]; };

export default [
  // ---- 點數 ----
  def(T.count, '唱數到 20 接龍', 'Count on to 20', (d) => {
    const a = rnd(d ? 8 : 3, d ? 17 : 12);
    return Q.num({ p: L('接下來是多少？', 'What comes next?'), say: L(`${a}、${a + 1}、${a + 2}，接下來是多少？`, `${a}, ${a + 1}, ${a + 2}. What comes next?`), scene: seq([a, a + 1, a + 2, '?']), ans: a + 3, lo: 1, hi: 20, full: `${a}, ${a + 1}, ${a + 2}, ${a + 3}` });
  }),
  def(T.count, '倒數', 'Count back', (d) => {
    const a = rnd(3, 10);
    return Q.num({ p: L('倒著數，接下來是多少？', 'Count back. What comes next?'), say: L(`倒著數：${a}、${a - 1}、${a - 2}，接下來是多少？`, `Count back: ${a}, ${a - 1}, ${a - 2}. What comes next?`), scene: seq([a, a - 1, a - 2, '?']), ans: a - 3, lo: 0, hi: 10, full: `${a}, ${a - 1}, ${a - 2}, ${a - 3}` });
  }),
  def(T.count, '點數 11~20', 'Count 11 to 20', (d) => {
    const it = thing(), n = rnd(11, d ? 20 : 15), frame = chance(0.5);
    return Q.num({ p: frame ? L('有幾個圓點？', 'How many counters are there?') : L(`有幾${it.m}${it.zh}？`, `How many ${it.ens} are there?`), scene: frame ? tenFrame(n) : col(grp(items(it.k, 10, { size: 'sm', cols: 10 })), grp(items(it.k, n - 10, { size: 'sm', cols: 10, from: 10 }))), ans: n, lo: 10, hi: 20, count: frame ? null : '.it',
      hint: L('一排是 10 個，再往下數。', 'One full row is 10. Count on from 10.'), full: frame ? n : cnt(n, it) });
  }),
  def(T.count, '從中間往上數', 'Count on from a number', (d) => {
    const a = rnd(2, d ? 15 : 8), k = rnd(1, d ? 5 : 3);
    return Q.num({ p: L(`從 ${a} 開始，再往上數 ${k} 個，會數到多少？`, `Start at ${a}. Count on ${k} more. What number do you get?`), scene: numLine(Math.max(0, a - 2), a + 6, { mark: a }), ans: a + k, lo: 1, hi: 20, full: L(`${range(a, a + k).join('、')}`, range(a, a + k).join(', ')) });
  }),
  def(T.count, '數量守恆', 'Still the same number?', (d) => {
    const it = thing(FOODS), n = rnd(5, 10);
    return Q.pick({ p: L(`我把${it.zh}移動了位置。現在是變多、變少，還是一樣多？`, `I moved the ${it.ens}. Are there more, fewer, or the same?`), scene: row(fig(grp(items(it.k, n, { size: 'xs', cols: 10 })), L('原本', 'Before')), emo('➡️', 50), fig(pile(it.k, n, { w: 330, h: 190, s: 44 }), L('移動後', 'After'))),
      right: L('一樣多', 'the same'), wrong: [L('變多', 'more'), L('變少', 'fewer')], keep: true, count: '.pile .it', full: L(`都是 ${n} 個，一樣多`, `Still ${n}. The same!`) });
  }),
  def(T.count, '十格板速認', 'Ten-frame flash', (d) => {
    const n = rnd(1, 10);
    return Q.num({ p: L('十格板上有幾個？試著不要一個一個數！', 'How many? Try not to count one by one!'), scene: tenFrame(n), ans: n, lo: 0, hi: 10, hint: L('上面一排滿了就是 5 個。', 'A full top row is 5.') });
  }),
  def(T.count, '拿出指定數量', 'Give me this many', (d) => {
    const it = thing([...FOODS, 'star']), n = rnd(11, d ? 20 : 15);
    return Q.collect({ p: L(`請拿 ${n} ${it.m}${it.zh}放進盤子。`, `Put ${n} ${it.ens} in the tray.`), tokens: range(1, 20).map(() => [pic(it.k, 42), 1]), ans: n, tray: L('盤子', 'Tray'), showSum: (s) => String(s), full: cnt(n, it) });
  }),
  // ---- 數字 ----
  def(T.numeral, '聽數字點數字', 'Hear it, tap it', (d) => {
    const pairs = [[12, 20], [13, 15], [14, 40], [16, 19], [11, 17], [13, 30]], n = d ? pick(pick(pairs).filter((x) => x <= 20)) : rnd(0, 20);
    const twin = (pairs.find((p) => p.includes(n)) || []).filter((x) => x !== n && x <= 20), wrong = [...new Set([...twin, ...sample(range(0, 20).filter((x) => x !== n), 4)])].slice(0, 3);
    return Q.pick({ p: L('聽聽看，點出你聽到的數字。', 'Listen, then tap the number you hear.'), say: L(`請點數字${ZH_NUM[n]}`, `Tap ${EN_NUM[n]}.`), scene: emo('👂', 150), right: n, wrong, full: n });
  }),
  def(T.numeral, '數字配數量', 'Match number and group', (d) => {
    const it = thing(), n = rnd(d ? 8 : 3, d ? 20 : 12), w = sample([n - 2, n - 1, n + 1, n + 2].filter((v) => v >= 1 && v <= 20), 2);
    const g = (v) => items(it.k, v, { size: 'xs', cols: 5 });
    return Q.tap({ p: L(`哪一堆是 ${n} ${it.m}？`, `Which group has ${n}?`), right: g(n), wrong: w.map(g), count: '.it', hint: L('一排是 5 個。', 'Each row has 5.'), full: cnt(n, it) });
  }),
  def(T.numeral, '數字的寫法', 'Which one is written the right way?', (d) => {
    const n = d ? pick([12, 13, 15, 16, 17, 19, 14]) : pick([2, 3, 5, 6, 7, 9]), flip = String(n).split('').reverse().join(''), w = (css, v = n) => `<span class="ncard" style="transform:${css}">${v}</span>`;
    const wrong = d ? [ncard(flip), w('scaleX(-1)'), w('scaleX(-1)', flip)] : [w('scaleX(-1)'), w('rotate(180deg)'), w('scaleY(-1)')];
    return Q.tap({ p: L(`哪一個是寫對的 ${n}？`, `Which one shows ${n} written the right way?`), say: L(`哪一個是寫對的${ZH_NUM[n]}？`, `Which one shows ${EN_NUM[n]} written the right way?`), right: ncard(n), wrong, full: n });
  }),
  // ---- 數字的字 ----
  def(T.word, '看字找數字', 'Word to number', (d) => {
    const n = rnd(1, 10), wrong = sample(range(1, 10).filter((x) => x !== n), 3);
    return Q.pick({ p: L(`「${word(n)}」是哪一個數字？`, `Which number is ${word(n)}?`), em: false, scene: ncard(word(n), 'word gold'), right: n, wrong, sort: true, full: `${word(n)} = ${n}` });
  }),
  def(T.word, '看數字找字', 'Number to word', (d) => {
    const n = rnd(1, 10), wrong = sample(range(1, 10).filter((x) => x !== n), 2).map(word);
    return Q.pick({ p: L(`${n} 的國字是哪一個？`, `Which word is ${n}?`), scene: ncard(n), right: word(n), wrong, full: `${n} = ${word(n)}` });
  }),
  def(T.word, '字配數量', 'Word and group', (d) => {
    const it = thing(), [n, a, b] = distinct(3, 1, 10), g = (v) => pile(it.k, v, { w: 250, h: 118, s: 38 });
    return Q.tap({ p: L(`哪一堆是「${word(n)}」${it.m}？`, `Tap the group that shows ${word(n)}.`), em: false, top: ncard(word(n), 'word gold'), right: g(n), wrong: [g(a), g(b)], count: '.it', full: `${word(n)} = ${n}` });
  }),
  // ---- 順序 ----
  def(T.seq, '數字排序', 'Put numbers in order', (d) => {
    const a = rnd(1, d ? 16 : 6), n = d ? 5 : 4, list = range(a, a + n - 1);
    return Q.order({ p: L('由小到大，照順序點數字。', 'Tap the numbers in order, from smallest to greatest.'), items: list.map((v) => [ncard(v, 'sm'), v]), full: list.join(', ') });
  }),
  def(T.seq, '前一個後一個', 'Before and after', (d) => {
    const a = rnd(2, d ? 19 : 9), after = chance(0.5), ans = after ? a + 1 : a - 1;
    return Q.num({ p: after ? L(`${a} 的後面是多少？`, `What comes after ${a}?`) : L(`${a} 的前面是多少？`, `What comes before ${a}?`), scene: after ? seq([a - 1, a, '?']) : seq(['?', a, a + 1]), ans, lo: 0, hi: 20, full: after ? `${a}, ${ans}` : `${ans}, ${a}` });
  }),
  def(T.seq, '缺數', 'Missing number', (d) => {
    const a = rnd(1, d ? 17 : 7), miss = rnd(1, 2), list = range(a, a + 3);
    return Q.num({ p: L('少了哪一個數字？', 'Which number is missing?'), say: L('這一排數字，少了哪一個？', 'Which number is missing?'), scene: seq(list.map((v, i) => (i === miss ? '?' : v))), ans: list[miss], lo: 0, hi: 20, full: list.join(', ') });
  }),
  // ---- 比較 ----
  def(T.compare, '兩堆比多少', 'More than, fewer than, same as', (d) => {
    const [x, y] = things2(), a = rnd(2, 10), b = chance(0.25) ? a : rnd(2, 10), rel = a > b ? 0 : a < b ? 1 : 2;
    const opts = [L('比較多', 'more than'), L('比較少', 'fewer than'), L('一樣多', 'the same as')];
    return Q.pick({ p: L(`${x.zh}和${y.zh}比，${x.zh}是比較多、比較少，還是一樣多？`, `Are there more ${x.ens} than ${y.ens}, fewer, or the same?`), scene: col(grp(items(x.k, a, { size: 'sm', cols: 10 }), 'a'), grp(items(y.k, b, { size: 'sm', cols: 10 }), 'b')),
      right: opts[rel], wrong: opts.filter((_, i) => i !== rel), full: L(rel === 2 ? `${a} 和 ${b} 一樣多` : `${a} 比 ${b} ${rel === 0 ? '多' : '少'}`, rel === 2 ? `${a} is the same as ${b}` : `${a} is ${rel === 0 ? 'more' : 'fewer'} than ${b}`) });
  }),
  def(T.compare, '數字比大小', 'Which number is bigger?', (d) => {
    const [a, b] = two(1, 10, 1, d ? 3 : 9), big = chance(0.5), ans = big ? Math.max(a, b) : Math.min(a, b);
    return Q.pick({ p: big ? L(`${a} 和 ${b}，哪一個比較大？`, `Which number is bigger, ${a} or ${b}?`) : L(`${a} 和 ${b}，哪一個比較小？`, `Which number is smaller, ${a} or ${b}?`), scene: row(ncard(a), ncard(b)), right: ans, wrong: [a + b - ans], sort: true,
      full: big ? L(`${ans} 比 ${a + b - ans} 大`, `${ans} is bigger than ${a + b - ans}`) : L(`${ans} 比 ${a + b - ans} 小`, `${ans} is smaller than ${a + b - ans}`) });
  }),
  def(T.compare, '多幾個', 'How many more?', (d) => {
    const [x, y] = sample(ANIMALS, 2).map((k) => ({ k, ...THINGS[k] })), b = rnd(2, 6), k = rnd(1, 3), a = b + k;
    return Q.num({ p: L(`${x.zh}比${y.zh}多幾${x.m}？`, `How many more ${x.ens} than ${y.ens}?`), scene: `<div class="vcol" style="align-items:flex-start">${items(x.k, a, { size: 'sm', cols: 10 })}${items(y.k, b, { size: 'sm', cols: 10 })}</div>`, ans: k, lo: 0, hi: 5,
      hint: L('一個對一個排好，看看多出來幾個。', 'Match them one to one. How many are left over?'), full: L(`${a} 比 ${b} 多 ${k}`, `${a} is ${k} more than ${b}`) });
  }),
  // ---- 分合 ----
  def(T.bond, '5 的分合', 'Number bonds of 5', (d) => {
    const a = rnd(0, 5);
    return Q.num({ p: L(`5 可以分成 ${a} 和多少？`, `5 is ${a} and □.`), scene: row(bond(5, a, '?'), tenFrame(a, 5 - a)), ans: 5 - a, lo: 0, hi: 5, full: L(`5 是 ${a} 和 ${5 - a}`, `5 is ${a} and ${5 - a}`) });
  }),
  def(T.bond, '6~10 的分合', 'Number bonds of 6 to 10', (d) => {
    const w = rnd(6, d ? 10 : 8), a = rnd(1, w - 1);
    return Q.num({ p: L(`${w} 可以分成 ${a} 和多少？`, `${w} is ${a} and □.`), scene: row(bond(w, a, '?'), tenFrame(a, w - a)), ans: w - a, lo: 0, hi: 10, full: L(`${w} 是 ${a} 和 ${w - a}`, `${w} is ${a} and ${w - a}`) });
  }),
  def(T.bond, '湊 10', 'Make 10', (d) => {
    const a = rnd(1, 9);
    return Q.num({ p: L(`${a} 和多少合起來是 10？`, `${a} and □ make 10.`), scene: tenFrame(a), ans: 10 - a, lo: 0, hi: 10, hint: L('數數看，十格板還有幾個空格？', 'Count the empty boxes in the ten-frame.'), full: L(`${a} 和 ${10 - a} 合起來是 10`, `${a} and ${10 - a} make 10`) });
  }),
  def(T.bond, '找出所有分法', 'All the ways to make a number', (d) => {
    const w = rnd(4, d ? 9 : 6), good = sample(range(0, Math.floor(w / 2)), Math.min(3, Math.floor(w / 2) + 1)).map((a) => [a, w - a]);
    const bad = sample(range(1, w), 3).map((a) => [a, w - a + pick([1, -1, 2])]).filter(([a, b]) => b >= 0 && a + b !== w).slice(0, 2);
    const card = ([a, b]) => `<span class="vlabel big">${chance(0.5) ? `${a} ${L('和', 'and')} ${b}` : `${b} ${L('和', 'and')} ${a}`}</span>`;
    return Q.multi({ p: L(`哪些合起來是 ${w}？全部找出來。`, `Which pairs make ${w}? Find them all.`), items: [...good.map((g) => [card(g), true]), ...bad.map((g) => [card(g), false])], full: good.map(([a, b]) => `${a} + ${b}`).join(L('、', ', ')) + ` = ${w}` });
  }),
  def(T.bond, '躲起來幾個', 'How many are hiding?', (d) => {
    const it = thing(ANIMALS.concat('teddy')), w = rnd(5, 10), see = rnd(1, w - 1), hide = pick(['🌳', '📦', '🏠', '🛏️']);
    return Q.num({ p: L(`本來有 ${w} ${it.m}${it.zh}，現在只看到 ${see} ${it.m}。躲起來幾${it.m}？`, `There were ${w} ${it.ens}. You see ${see}. How many are hiding?`), scene: row(grp(items(it.k, see, { size: see > 5 ? 'sm' : 'md' })), emo(hide, 150)), ans: w - see, lo: 0, hi: 10, full: L(`${w} 是 ${see} 和 ${w - see}`, `${w} is ${see} and ${w - see}`) });
  }),
  // ---- 型式 ----
  def(T.pattern, 'ABC 型式', 'ABC patterns', (d) => {
    const cs = sample(CK, 3), k = pick(BASIC), unit = cs.map((c) => sh(k, c, 66)), n = rnd(5, 7);
    return Q.pick({ p: L('接下來是哪一個？', 'What comes next?'), scene: seq([...range(0, n - 1).map((i) => unit[i % 3]), '?'], 'pat'), right: unit[n % 3], wrong: unit.filter((_, i) => i !== n % 3) });
  }),
  def(T.pattern, 'AAB 與 ABB 型式', 'AAB and ABB patterns', (d) => {
    const [k1, k2] = sample(BASIC, 2), [c1, c2] = sample(CK, 2), A = sh(k1, c1, 66), B = sh(k2, c2, 66), unit = chance(0.5) ? [A, A, B] : [A, B, B], n = rnd(5, 7);
    return Q.pick({ p: L('接下來是哪一個？', 'What comes next?'), scene: seq([...range(0, n - 1).map((i) => unit[i % 3]), '?'], 'pat'), right: unit[n % 3], wrong: [unit[n % 3] === A ? B : A] });
  }),
  def(T.pattern, '哪一排有規律', 'Which row is a pattern?', (d) => {
    const cs = sample(CK, 3), k = pick(BASIC), mk = (list) => `<div class="vrow" style="gap:4px">${list.map((c) => sh(k, c, 38)).join('')}</div>`;
    const good = range(0, 5).map((i) => cs[i % 2]), bad1 = [cs[0], cs[1], cs[0], cs[0], cs[1], cs[1]], bad2 = [cs[0], cs[1], cs[2], cs[1], cs[0], cs[0]];
    return Q.tap({ p: L('哪一排是有規律、一直重複的型式？', 'Which row is a repeating pattern?'), right: mk(good), wrong: [mk(bad1), mk(bad2)], full: L('兩個顏色輪流出現', 'The two colours take turns') });
  }),
  def(T.pattern, '型式找錯', 'Find the mistake', (d) => {
    const [c1, c2] = sample(CK, 2), k = pick(BASIC), bad = rnd(1, 6), list = range(0, 7).map((i) => ((i % 2 === 0) !== (i === bad) ? c1 : c2));
    return Q.tap({ p: L('這排型式裡，哪一個排錯了？', 'Which one is wrong in the pattern?'), cards: list.map((c, i) => [sh(k, c, 70), i === bad]) });
  }),
  // ---- 分類 ----
  def(T.sort, '兩個條件', 'Two rules at once', (d) => {
    const [c1, c2] = sample(CK, 2), k = pick(BASIC), list = shuffle([[1, 1], [1, 1], [1, 0], [1, 0], [0, 1], [0, 1], [0, 0], ...(d ? [[1, 1], [0, 0]] : [])]);
    return Q.multi({ p: L(`把「大的」而且是「${cname(c1)}」的全部找出來。`, `Find all the big ${cname(c1)} ones.`), items: list.map(([big, col1]) => [sh(k, col1 ? c1 : c2, big ? 100 : 54), big && col1]), full: L(`又大又是${cname(c1)}`, `big and ${cname(c1)}`) });
  }),
  // ---- 排序 ----
  def(T.order, '依長度排', 'Order by length', (d) => {
    const n = d ? 5 : 4, lens = sample(range(2, 10), n), cs = sample(CK, n), long = chance(0.3);
    return Q.order({ p: long ? L('由最長到最短，照順序點。', 'Tap the ribbons from longest to shortest.') : L('由最短到最長，照順序點。', 'Tap the ribbons from shortest to longest.'), items: lens.map((len, i) => [bars([{ len, c: COLORS[cs[i]].c }], { max: 10, w: 250, h: 30 }), len]), desc: long, full: long ? L('最長 → 最短', 'longest → shortest') : L('最短 → 最長', 'shortest → longest') });
  }),
  def(T.order, '一天的順序', 'Order of the day', (d) => {
    const day = pick([[['🛏️', '起床', 'wake up'], ['🥣', '吃早餐', 'breakfast'], ['🎒', '上學', 'school'], ['🌙', '睡覺', 'bedtime']], [['🪥', '刷牙', 'brush teeth'], ['🏫', '上課', 'lessons'], ['🍱', '吃午餐', 'lunch'], ['🛁', '洗澡', 'bath time']], [['🌅', '早上', 'morning'], ['☀️', '中午', 'noon'], ['🌇', '傍晚', 'evening'], ['🌙', '晚上', 'night']]]);
    const list = d ? day : sample(range(0, 3), 3).sort((a, b) => a - b).map((i) => day[i]);
    return Q.order({ p: L('一天裡先做什麼？照順序點。', 'What do you do first? Tap them in order.'), items: list.map(([e, zh, en], i) => [fig(emo(e, 76), L(zh, en)), i]), full: list.map(([e]) => e).join(' → ') });
  }),
  // ---- 形狀 ----
  def(T.shape, '形狀特徵', 'Sides and corners', (d) => {
    const k = pick(BASIC);
    if (chance(0.3)) return Q.tap({ p: L('哪一個形狀沒有角？', 'Which shape has no corners?'), right: sh('circle', pick(CK), 140), wrong: sample(['square', 'rect', 'tri'], 2).map((x) => sh(x, pick(CK), 140)), full: L('圓形沒有角', 'A circle has no corners') });
    const side = chance(0.5), n = side ? SHAPES[k].sides : SHAPES[k].corners;
    return Q.num({ p: side ? L(`${sname(k)}有幾個邊？`, `How many sides does a ${sname(k)} have?`) : L(`${sname(k)}有幾個角？`, `How many corners does a ${sname(k)} have?`), scene: sh(k, pick(CK), 210), ans: n, opts: [0, 3, 4, 5], full: side ? L(`${sname(k)}有 ${n} 個邊`, `A ${sname(k)} has ${n} ${pl(n, 'side', 'sides')}`) : L(`${sname(k)}有 ${n} 個角`, `A ${sname(k)} has ${n} ${pl(n, 'corner', 'corners')}`) });
  }),
  def(T.shape, '拼形狀', 'Put shapes together', (d) => {
    const c = COLORS[pick(CK)].c, st = `fill="${c}" stroke="#2b2140" stroke-width="5" stroke-linejoin="round"`;
    const [pieces, made, zh, en] = pick([
      [`<polygon points="10,10 10,110 110,110" ${st}/><polygon points="150,10 250,10 250,110" ${st}/>`, 'square', '兩個三角形', '2 triangles'],
      [`<rect x="10" y="20" width="90" height="90" ${st}/><rect x="150" y="20" width="90" height="90" ${st}/>`, 'rect', '兩個正方形', '2 squares'],
      [`<path d="M110,10 A50,50 0 0 0 110,110 Z" ${st}/><path d="M150,10 A50,50 0 0 1 150,110 Z" ${st}/>`, 'circle', '兩個半圓形', '2 half circles'],
    ]);
    return Q.tap({ p: L(`${zh}可以拼成什麼形狀？`, `What shape can you make with ${en}?`), top: svg(260, 120, pieces), right: shape(made, { c, s: 110 }), wrong: BASIC.filter((k) => k !== made).slice(0, 2).map((k) => shape(k, { c, s: 110 })), full: sname(made) });
  }),
  def(T.shape, '圖案裡數形狀', 'Count the shapes in the picture', (d) => {
    const ks = sample(BASIC, 3), ns = [rnd(1, 6), rnd(1, 4), rnd(1, 4)], all = shuffle(ks.flatMap((k, i) => range(1, ns[i]).map(() => k)));
    return Q.num({ p: L(`圖裡有幾個${sname(ks[0])}？`, `How many ${sname(ks[0])}s are in the picture?`), scene: `<div class="vrow wrap" style="max-width:720px">${all.map((k) => sh(k, pick(CK), 76, k === 'circle' ? 0 : pick([0, 0, 90]))).join('')}</div>`, ans: ns[0], lo: 1, hi: 7, full: L(`${ns[0]} 個${sname(ks[0])}`, `${ns[0]} ${sname(ks[0])}${ns[0] === 1 ? '' : 's'}`) });
  }),
  // ---- 位置 ----
  def(T.pos, '左右', 'Left and right', (d) => {
    const ks = sample(ANIMALS, d ? 3 : 2), left = chance(0.5), i = left ? 0 : ks.length - 1;
    return Q.tap({ p: left ? L('點最左邊的動物。', 'Tap the animal on the left.') : L('點最右邊的動物。', 'Tap the animal on the right.'), cards: ks.map((k, j) => [pic(k, 150), j === i]), full: left ? L(`左邊是${THINGS[ks[i]].zh}`, `The ${THINGS[ks[i]].en} is on the left`) : L(`右邊是${THINGS[ks[i]].zh}`, `The ${THINGS[ks[i]].en} is on the right`) });
  }),
  def(T.pos, '遠近', 'Near and far', (d) => {
    const [a, b] = sample(['🌳', '🏠', '⛲', '🚗', '🏫', '🎪'], 2), near = chance(0.5), gap = rnd(1, 2);
    const scene = `<div class="vrow" style="gap:0;align-items:flex-end">${emo('🧒', 110)}<span style="width:${gap * 70}px;border-bottom:8px dashed rgba(43,33,64,.4)"></span>${emo(a, 96)}<span style="width:${(4 - gap) * 110}px;border-bottom:8px dashed rgba(43,33,64,.4)"></span>${emo(b, 96)}</div>`;
    return Q.pick({ p: near ? L('哪一個離小朋友比較近？', 'Which one is nearer to the child?') : L('哪一個離小朋友比較遠？', 'Which one is farther from the child?'), scene, right: near ? emo(a, 90) : emo(b, 90), wrong: [near ? emo(b, 90) : emo(a, 90)], full: near ? L('比較近', 'nearer') : L('比較遠', 'farther') });
  }),
  def(T.pos, '格子地圖指令', 'Follow the map', (d) => {
    const up = rnd(1, 3), right = rnd(1, 3), goal = [right, up], es = sample(['🍎', '⭐', '🎁', '🍪', '🌸', '🔑'], 4);
    const spots = [goal, [up, right === up ? right + 1 : right], [right, 0], [0, up]].map(([x, y], i) => ({ x: Math.min(x, 4), y: Math.min(y, 4), h: es[i] })), seen = new Set(), marks = spots.filter((m) => { const k = `${m.x},${m.y}`; if (seen.has(k)) return false; seen.add(k); return true; });
    return Q.pick({ p: L(`從紅點出發，往上走 ${up} 格，再往右走 ${right} 格，會走到哪裡？`, `Start at the red dot. Go up ${up}, then right ${right}. Where are you?`), scene: gridMap(5, [0, 0], marks), right: emo(marks[0].h, 80), wrong: marks.slice(1).map((m) => emo(m.h, 80)) });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '10 以內分合', 'Number bonds within 10', (d) => {
    const w = rnd(6, 10), a = rnd(1, w - 1), it = thing(FOODS);
    return Q.num({ p: L(`${w} 可以分成 ${a} 和多少？`, `${w} is ${a} and □.`), scene: row(bond(w, a, '?'), col(grp(items(it.k, a, { size: 'sm' }), 'a'), grp(items(it.k, w - a, { size: 'sm', cls: 'gone' }), 'b'))), ans: w - a, lo: 0, hi: 10, full: L(`${w} 是 ${a} 和 ${w - a}`, `${w} is ${a} and ${w - a}`) });
  }, true),
  def(T.bonus, '用尺量長度', 'Measure with a ruler', (d) => {
    const n = rnd(1, 10), what = pick([['蠟筆', 'crayon'], ['鉛筆', 'pencil'], ['緞帶', 'ribbon'], ['吸管', 'straw']]);
    return Q.num({ p: L(`${what[0]}有多長？是幾公分？`, `How long is the ${what[1]}? How many centimetres?`), scene: ruler(12, { from: 0, to: n, c: COLORS[pick(CK)].c }), ans: n, lo: 1, hi: 12, unit: L('公分', 'cm'), full: L(`${n} 公分`, `${n} cm`) });
  }, true),
  def(T.bonus, '生活數字的意義', 'Numbers around us', (d) => {
    const kinds = [['🚌', L('公車號碼', 'bus number'), String(rnd(2, 99))], ['🏷️', L('價錢', 'price'), `$${rnd(2, 20)}`], ['🕐', L('時間', 'time'), `${rnd(1, 12)}:00`], ['🚪', L('門牌號碼', 'door number'), `#${rnd(1, 60)}`]], i = rnd(0, 3);
    const card = ([e, , v]) => fig(emo(e, 90), `<span class="vlabel big">${v}</span>`);
    return Q.tap({ p: L(`哪一個數字是「${kinds[i][1]}」？`, `Which number is the ${kinds[i][1]}?`), em: false, cards: kinds.map((k, j) => [card(k), j === i]), full: kinds[i][1] });
  }, true),
];
