// 中班（新加坡 K1）：34 種題型。數字只用 1~10，全部用圖片作答，不寫算式。
// 每個題型只是「概念」：東西、顏色、情境每次都隨機換。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, distinct, thing, things2, cnt, THINGS, ANIMALS, FOODS, TOYS } from './core.js?v=25';
import { items, pile, grp, row, col, fig, emo, ncard, pic, seq, dice, shape, bars, tallBars, posScene, bond, svg, COLORS, SHAPES, BASIC, cname, sname } from './vis.js?v=25';

const T = { count: ['點數', 'Counting', '🔢'], numeral: ['數字', 'Numbers', '7️⃣'], compare: ['比較', 'Comparing', '⚖️'], sort: ['分類', 'Sorting', '🗂️'], match: ['配對', 'Matching', '🧩'],
  order: ['排序', 'Ordering', '📶'], pattern: ['型式', 'Patterns', '🔁'], shape: ['形狀', 'Shapes', '🔺'], pos: ['位置', 'Position', '📍'], bonus: ['加分題', 'Bonus', '⭐'] };
const CK = Object.keys(COLORS);
const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const ZH_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
// 兩個不一樣的數量：gap 最小差距
const two = (lo, hi, gap) => { let a, b; do { a = rnd(lo, hi); b = rnd(lo, hi); } while (Math.abs(a - b) < gap); return [a, b]; };
const sh = (k, c, s = 80, rot = 0) => shape(k, { c: COLORS[c].c, s, rot });

export default [
  // ---- 點數 ----
  def(T.count, '數一數（排整齊）', 'Count in a line', (d) => {
    const it = thing(), n = rnd(1, 5);
    return Q.num({ p: L(`有幾${it.m}${it.zh}？`, `How many ${it.ens}?`), scene: grp(items(it.k, n)), ans: n, lo: 1, hi: 6, count: '.it', full: cnt(n, it) });
  }),
  def(T.count, '數一數（散落）', 'Count scattered things', (d) => {
    const it = thing(), n = d ? rnd(4, 10) : rnd(2, 6);
    return Q.num({ p: L(`數數看，有幾${it.m}${it.zh}？`, `How many ${it.ens} are there?`), scene: pile(it.k, n, { w: 520, h: 270 }), ans: n, lo: 1, hi: 10, count: '.it', full: cnt(n, it) });
  }),
  def(T.count, '拿出指定數量', 'Give me this many', (d) => {
    const it = thing([...FOODS, ...TOYS]), n = d ? rnd(4, 10) : rnd(1, 5);
    return Q.collect({ p: L(`請拿 ${n} ${it.m}${it.zh}放進籃子。`, `Give me ${n} ${pl(n, it.en, it.ens)}.`), tokens: range(1, 10).map(() => [pic(it.k, 62), 1]), ans: n, tray: L('籃子', 'Basket'), full: cnt(n, it) });
  }),
  def(T.count, '唱數接下一個', 'What number comes next?', (d) => {
    const a = rnd(1, d ? 7 : 4);
    return Q.num({ p: L('接下來是多少？', 'What comes next?'), say: L(`${a}、${a + 1}、${a + 2}，接下來是多少？`, `${a}, ${a + 1}, ${a + 2}. What comes next?`), scene: seq([a, a + 1, a + 2, '?']), ans: a + 3, lo: 1, hi: 10, full: `${a}, ${a + 1}, ${a + 2}, ${a + 3}` });
  }),
  def(T.count, '數聲音', 'Count the sounds', (d) => {
    const n = rnd(1, 5), drum = pick(['🥁', '🔔', '👏']);
    return Q.num({ p: L('聽聽看，敲了幾下？（按 🔊 可以再聽一次）', 'Listen! How many sounds did you hear? (Tap 🔊 to hear again.)'), say: L('聽聽看，敲了幾下？', 'Listen! How many sounds did you hear?'), em: false,
      scene: `<span class="beat">${emo(drum, 170)}</span>`, beats: n, ans: n, lo: 1, hi: 5, full: L(`${n} 下`, `${n} ${pl(n, 'sound', 'sounds')}`) });
  }),
  def(T.count, '骰子點數速認', 'Dots on the dice', (d) => {
    const n = rnd(1, 6);
    return Q.num({ p: L('骰子上有幾點？', 'How many dots?'), scene: dice(n, 200), ans: n, lo: 1, hi: 6 });
  }),
  // ---- 數字 ----
  def(T.numeral, '聽數字點數字', 'Hear it, tap it', (d) => {
    const n = rnd(1, 10), wrong = sample(range(1, 10).filter((x) => x !== n), 3);
    return Q.pick({ p: L('聽聽看，點出你聽到的數字。', 'Listen, then tap the number you hear.'), say: L(`聽聽看，點出你聽到的數字。請點數字${ZH_NUM[n]}。`, `Listen, then tap the number you hear. Tap number ${n}.`), scene: emo('👂', 150), right: n, wrong, full: n });
  }),
  def(T.numeral, '數字配數量', 'Match number and group', (d) => {
    const it = thing(), [n, a, b] = distinct(3, 1, d ? 10 : 6);
    return Q.tap({ p: L(`哪一堆是 ${n} ${it.m}？`, `Which group has ${n}?`), top: ncard(n, 'sm'), right: pile(it.k, n, { w: 250, h: 120, s: 40 }), wrong: [a, b].map((x) => pile(it.k, x, { w: 250, h: 120, s: 40 })), count: '.it', full: cnt(n, it) });
  }),
  def(T.numeral, '場景裡找數字', 'Find the number around you', (d) => {
    const n = rnd(1, 9), others = sample(range(1, 9).filter((x) => x !== n), 3), places = sample(['🚪', '🚌', '🏠', '🛗', '📮', '👕', '🚃', '📱'], 4);
    const card = (e, v) => fig(emo(e, 96), ncard(v, 'sm'));
    return Q.tap({ p: L(`找找看，哪裡有數字 ${n}？`, `Find the number ${n} in the picture.`), say: L(`找找看，哪裡有數字${ZH_NUM[n]}？`, `Find the number ${n}.`), right: card(places[0], n), wrong: others.map((v, i) => card(places[i + 1], v)), full: n });
  }),
  def(T.numeral, '數字的寫法', 'Which one is written the right way?', (d) => {
    const n = pick([2, 3, 4, 5, 6, 7, 9]), w = (css) => `<span class="ncard" style="transform:${css}">${n}</span>`;
    return Q.tap({ p: L(`哪一個「${n}」寫對了？`, `Which ${n} is written the right way?`), right: ncard(n), wrong: [w('scaleX(-1)'), w('rotate(180deg)'), w('scaleY(-1)')], full: n });
  }),
  // ---- 比較 ----
  def(T.compare, '哪邊多', 'Which has more?', (d) => {
    const it = thing(), [a, b] = two(1, 10, d ? 1 : 3);
    return Q.tap({ p: L('哪一邊比較多？', 'Which group has more?'), right: pile(it.k, Math.max(a, b), { w: 370, h: 230 }), wrong: [pile(it.k, Math.min(a, b), { w: 370, h: 230 })], count: '.it', full: L(`${Math.max(a, b)} 比 ${Math.min(a, b)} 多`, `${Math.max(a, b)} is more than ${Math.min(a, b)}`) });
  }),
  def(T.compare, '哪邊少', 'Which has fewer?', (d) => {
    const it = thing(), [a, b] = two(1, 10, d ? 1 : 3);
    return Q.tap({ p: L('哪一邊比較少？', 'Which group has fewer?'), right: pile(it.k, Math.min(a, b), { w: 370, h: 230 }), wrong: [pile(it.k, Math.max(a, b), { w: 370, h: 230 })], count: '.it', full: L(`${Math.min(a, b)} 比 ${Math.max(a, b)} 少`, `${Math.min(a, b)} is fewer than ${Math.max(a, b)}`) });
  }),
  def(T.compare, '一樣多', 'Same number', (d) => {
    const [x, y] = things2(), n = rnd(2, d ? 8 : 5), w = sample([n - 1, n + 1, n + 2, n - 2].filter((v) => v >= 1 && v <= 10), 2);
    return Q.tap({ p: L(`哪一堆和上面的${x.zh}一樣多？`, `Which group has the same number as the ${x.ens}?`), top: grp(items(x.k, n, { size: 'sm', cols: 10 })), right: items(y.k, n, { size: 'sm', cols: 5 }), wrong: w.map((v) => items(y.k, v, { size: 'sm', cols: 5 })), count: '.taptop .it', full: L(`都是 ${n} 個，一樣多`, `Both have ${n}. The same!`) });
  }),
  def(T.compare, '一對一夠不夠', 'One for each?', (d) => {
    const [who, what] = pick([['teddy', 'balloon'], ['pig', 'apple'], ['chick', 'cookie'], ['frog', 'star'], ['duck', 'lollipop'], ['bird', 'cupcake']]), a = rnd(4, 8), b = a - pick([0, 0, 1, 2]);
    const A = THINGS[who], B = THINGS[what];
    return Q.yn({ p: L(`每${A.m}${A.zh}都有一${B.m}${B.zh}嗎？`, `Is there ${/^[aeiou]/.test(B.en) ? 'an' : 'a'} ${B.en} for every ${A.en}?`), scene: col(items(what, b, { size: 'sm', cols: 10 }), items(who, a, { size: 'sm', cols: 10 })), ans: b >= a,
      yes: L('有，剛剛好', 'Yes'), no: L('沒有，不夠', 'No'), full: b >= a ? L('剛剛好，每個都有！', 'Yes! One for each.') : L(`不夠，還少 ${a - b} 個`, `No. ${a - b} more ${pl(a - b, 'is', 'are')} needed.`) });
  }),
  def(T.compare, '比大小', 'Bigger or smaller', (d) => {
    const it = thing(), big = chance(0.5), sizes = d ? [90, 140, 200] : [90, 200], want = big ? Math.max(...sizes) : Math.min(...sizes);
    return Q.tap({ p: big ? L(`點比較大的${it.zh}。`, `Tap the bigger ${it.en}.`) : L(`點比較小的${it.zh}。`, `Tap the smaller ${it.en}.`), right: pic(it.k, want), wrong: sizes.filter((s) => s !== want).map((s) => pic(it.k, s)), full: big ? L('這個比較大', 'This one is bigger') : L('這個比較小', 'This one is smaller') });
  }),
  def(T.compare, '比長短高矮', 'Longer, shorter, taller', (d) => {
    const [a, b] = two(3, 10, 2), cs = sample(CK, 2), tall = chance(0.4), more = chance(0.5), want = more ? Math.max(a, b) : Math.min(a, b);
    const draw = (len, c) => (tall ? tallBars([{ len, c: COLORS[c].c }], { max: 10, h: 230 }) : bars([{ len, c: COLORS[c].c }], { max: 10, w: 340, h: 44, align: true }));
    const p = tall ? (more ? L('哪一個比較高？', 'Which one is taller?') : L('哪一個比較矮？', 'Which one is shorter?')) : (more ? L('哪一條比較長？', 'Which one is longer?') : L('哪一條比較短？', 'Which one is shorter?'));
    const cards = shuffle([[a, cs[0]], [b, cs[1]]]).map(([len, c]) => [draw(len, c), len === want]);
    return Q.tap({ p, cards, full: tall ? (more ? L('這個比較高', 'This one is taller') : L('這個比較矮', 'This one is shorter')) : (more ? L('這條比較長', 'This one is longer') : L('這條比較短', 'This one is shorter')) });
  }),
  // ---- 分類 ----
  def(T.sort, '依顏色分', 'Sort by colour', (d) => {
    const cs = sample(CK, d ? 3 : 2), k = pick(BASIC), list = shuffle(range(1, d ? 9 : 6).map((i) => cs[i % cs.length]));
    return Q.multi({ p: L(`把${cname(cs[0])}的全部找出來。`, `Find all the ${cname(cs[0])} ones.`), items: list.map((c) => [sh(k, c, 74), c === cs[0]]), full: L(`這些都是${cname(cs[0])}`, `These are all ${cname(cs[0])}`) });
  }),
  def(T.sort, '依形狀分', 'Sort by shape', (d) => {
    const ks = sample(BASIC, d ? 3 : 2), list = shuffle(range(1, d ? 9 : 6).map((i) => ks[i % ks.length]));
    return Q.multi({ p: L(`把${sname(ks[0])}全部找出來。`, `Find all the ${sname(ks[0])}s.`), items: list.map((k) => [sh(k, pick(CK), 74), k === ks[0]]), full: L(`這些都是${sname(ks[0])}`, `These are all ${sname(ks[0])}s`) });
  }),
  def(T.sort, '依大小分', 'Sort by size', (d) => {
    const it = thing(), big = chance(0.5), list = shuffle(range(1, d ? 8 : 6).map((i) => i % 2 === 0));
    return Q.multi({ p: big ? L(`把大的${it.zh}全部找出來。`, `Find all the big ${it.ens}.`) : L(`把小的${it.zh}全部找出來。`, `Find all the small ${it.ens}.`), items: list.map((isBig) => [pic(it.k, isBig ? 104 : 54), isBig === big]), full: big ? L('這些是大的', 'These are the big ones') : L('這些是小的', 'These are the small ones') });
  }),
  // ---- 配對 ----
  def(T.match, '找一樣的', 'Find the same one', (d) => {
    const ks = sample(Object.keys(THINGS), 4);
    return Q.tap({ p: L('哪一個和上面的一樣？', 'Find the one that is the same.'), top: pic(ks[0], 120), right: pic(ks[0], 100), wrong: ks.slice(1).map((k) => pic(k, 100)), full: L(`都是${THINGS[ks[0]].zh}`, `They are both ${THINGS[ks[0]].ens}`) });
  }),
  def(T.match, '找不一樣的', 'Which one is different?', (d) => {
    const byColor = chance(0.5), [c1, c2] = sample(CK, 2), [k1, k2] = sample(BASIC, 2);
    const same = sh(k1, c1, 120), odd = byColor ? sh(k1, c2, 120) : sh(k2, c1, 120);
    return Q.tap({ p: L('哪一個和別人不一樣？', 'Which one is different?'), right: odd, wrong: [same, same, same], full: byColor ? L('顏色不一樣', 'The colour is different') : L('形狀不一樣', 'The shape is different') });
  }),
  // ---- 排序 ----
  def(T.order, '由小排到大', 'Smallest to biggest', (d) => {
    const it = thing(), big = chance(0.25), sizes = d ? [60, 100, 150] : [60, 105, 150];
    return Q.order({ p: big ? L('由大到小，照順序點。', 'Tap them in order from biggest to smallest.') : L('由小到大，照順序點。', 'Tap them in order from smallest to biggest.'), items: sizes.map((s) => [pic(it.k, s), s]), desc: big, full: big ? L('大 → 中 → 小', 'big → medium → small') : L('小 → 中 → 大', 'small → medium → big') });
  }),
  def(T.order, '事件順序', 'What comes first?', (d) => {
    const story = pick([['🌰', '🌱', '🌷'], ['🥚', '🐣', '🐔'], ['🛏️', '🪥', '🎒'], ['🌱', '🌿', '🌳'], ['🌅', '☀️', '🌙'], ['👶', '🧒', '🧑'], ['🥣', '🍪', '😋'], ['☁️', '🌧️', '🌈']]);
    return Q.order({ p: L('哪個先？照發生的順序點。', 'What comes first? Tap them in order.'), items: story.map((e, i) => [emo(e, 96), i]), full: story.join(' → ') });
  }),
  // ---- 型式 ----
  def(T.pattern, 'AB 接下一個', 'AB pattern: what comes next?', (d) => {
    const byColor = chance(0.5), [c1, c2] = sample(CK, 2), [k1, k2] = sample(BASIC, 2), [A, B] = byColor ? [sh(k1, c1, 70), sh(k1, c2, 70)] : [sh(k1, c1, 70), sh(k2, c1, 70)], n = rnd(4, 5);
    const list = range(0, n - 1).map((i) => (i % 2 ? B : A)), next = n % 2 ? B : A;
    return Q.pick({ p: L('接下來是哪一個？', 'What comes next?'), scene: seq([...list, '?'], 'pat'), right: next, wrong: [next === A ? B : A, sh(pick(BASIC.filter((k) => k !== k1 && k !== k2)), pick(CK.filter((c) => c !== c1 && c !== c2)), 70)] });
  }),
  def(T.pattern, 'AB 補中間', 'AB pattern: what is missing?', (d) => {
    const [c1, c2] = sample(CK, 2), [k1, k2] = sample(BASIC, 2), both = chance(0.4), A = sh(k1, c1, 70), B = both ? sh(k2, c2, 70) : chance(0.5) ? sh(k1, c2, 70) : sh(k2, c1, 70), miss = rnd(1, 4);
    const list = range(0, 5).map((i) => (i === miss ? '?' : i % 2 ? B : A));
    return Q.pick({ p: L('中間少了哪一個？', 'What is missing?'), scene: seq(list, 'pat'), right: miss % 2 ? B : A, wrong: [miss % 2 ? A : B] });
  }),
  def(T.pattern, '照樣子排', 'Make the same pattern', (d) => {
    const [c1, c2, c3] = sample(CK, 3), k = pick(BASIC), n = d ? 6 : 4, mk = (f) => `<div class="vrow" style="gap:4px">${range(0, n - 1).map((i) => sh(k, f(i), 38)).join('')}</div>`;
    const good = (i) => (i % 2 ? c2 : c1);
    return Q.tap({ p: L('哪一排和上面排得一模一樣？', 'Which row is the same pattern as the one on top?'), top: mk(good), right: mk(good), wrong: [mk((i) => (i % 2 ? c1 : c2)), mk((i) => (i % 2 ? c3 : c1))] });
  }),
  // ---- 形狀 ----
  def(T.shape, '認形狀', 'Name the shape', (d) => {
    const ks = shuffle([...BASIC]), cs = sample(CK, 4);
    return Q.tap({ p: L(`點${sname(ks[0])}。`, `Tap the ${sname(ks[0])}.`), right: sh(ks[0], cs[0], 150), wrong: ks.slice(1).map((k, i) => sh(k, cs[i + 1], 150)), full: sname(ks[0]) });
  }),
  def(T.shape, '形狀放進洞', 'Fit the shape in the hole', (d) => {
    const ks = shuffle([...BASIC]), c = pick(CK);
    return Q.tap({ p: L('哪一個形狀可以剛好放進這個洞？', 'Which shape fits in this hole?'), top: shape(ks[0], { c: '#5a4f78', s: 120 }), right: sh(ks[0], c, 100), wrong: ks.slice(1).map((k) => sh(k, c, 100)), full: sname(ks[0]) });
  }),
  def(T.shape, '生活物品配形狀', 'Shapes around us', (d) => {
    const things = { circle: ['🕐', '⚽', '🍪', '🍩', '🪙'], square: ['🧇', '🖼️', '🟫', '🧊'], rect: ['🚪', '📕', '📱', '✉️'], tri: ['🍕', '⛺', '📐', '🔺'] }, ks = shuffle([...BASIC]);
    return Q.tap({ p: L(`哪一個東西看起來像${sname(ks[0])}？`, `Which one looks like a ${sname(ks[0])}?`), top: sh(ks[0], 'yellow', 100), right: emo(pick(things[ks[0]]), 110), wrong: ks.slice(1).map((k) => emo(pick(things[k]), 110)), full: sname(ks[0]) });
  }),
  // ---- 位置 ----
  def(T.pos, '上下', 'On and under', (d) => {
    const a = thing(ANIMALS), obj = pick(['box', 'table']), on = chance(0.5), o = obj === 'box' ? L('箱子', 'box') : L('桌子', 'table');
    return Q.tap({ p: on ? L(`哪一張圖，${a.zh}在${o}的上面？`, `In which picture is the ${a.en} on the ${o}?`) : L(`哪一張圖，${a.zh}在${o}的下面？`, `In which picture is the ${a.en} under the ${o}?`),
      right: posScene(on ? 'on' : 'under', a.k, obj), wrong: [posScene(on ? 'under' : 'on', a.k, obj), posScene('beside', a.k, obj)], full: on ? L('在上面', 'on') : L('在下面', 'under') });
  }),
  def(T.pos, '前後裡外', 'In front, behind, in, out', (d) => {
    const a = thing(ANIMALS), rel = pick(['front', 'behind', 'in', 'out']), obj = rel === 'in' || rel === 'out' ? 'box' : 'tree', o = obj === 'box' ? L('箱子', 'box') : L('樹', 'tree');
    const word = { front: L('前面', 'in front of'), behind: L('後面', 'behind'), in: L('裡面', 'in'), out: L('外面', 'outside') }[rel], other = { front: 'behind', behind: 'front', in: 'out', out: 'in' }[rel];
    return Q.tap({ p: L(`哪一張圖，${a.zh}在${o}的${word}？`, `In which picture is the ${a.en} ${word} the ${o}?`), right: posScene(rel, a.k, obj), wrong: [posScene(other, a.k, obj)], full: word });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '用積木量長度', 'Measure with blocks', (d) => {
    const n = rnd(1, 6), c = COLORS[pick(CK)].c, u = 86;
    const pic2 = svg(u * 6 + 20, 150, `<path d="M10,14 H${n * u - 14} L${n * u + 8},36 L${n * u - 14},58 H10 Z" fill="${c}" stroke="#2b2140" stroke-width="5" stroke-linejoin="round"/>${range(0, n - 1).map((i) => `<rect x="${10 + i * u}" y="80" width="${u - 4}" height="56" rx="8" fill="#ffd43a" stroke="#2b2140" stroke-width="5"/>`).join('')}`);
    return Q.num({ p: L('鉛筆和幾塊積木一樣長？', 'How many blocks long is the pencil?'), scene: pic2, ans: n, lo: 1, hi: 7, full: L(`${n} 塊積木`, `${n} ${pl(n, 'block', 'blocks')} long`) });
  }, true),
  def(T.bonus, '5 以內分一分', 'Split a small number', (d) => {
    const w = rnd(2, 5), a = rnd(1, w - 1), it = thing(FOODS);
    return Q.num({ p: L(`${w} 可以分成 ${a} 和多少？`, `${w} is ${a} and □.`), scene: row(bond(w, a, '?'), col(grp(items(it.k, a, { size: 'sm' }), 'a'), grp(items(it.k, w - a, { size: 'sm', cls: 'gone' }), 'b'))), ans: w - a, lo: 0, hi: 5, full: L(`${w} 是 ${a} 和 ${w - a}`, `${w} is ${a} and ${w - a}`) });
  }, true),
  def(T.bonus, '合起來是多少', 'How many altogether?', (d) => {
    const it = thing(), t = rnd(3, d ? 10 : 6), a = rnd(1, t - 1), b = t - a;
    return Q.num({ p: L(`${a} ${it.m}${it.zh}和 ${b} ${it.m}${it.zh}，合起來有幾${it.m}？`, `${a} ${pl(a, it.en, it.ens)} and ${b} ${pl(b, it.en, it.ens)}. How many altogether?`), scene: row(grp(items(it.k, a, { size: a > 5 ? 'sm' : 'md' }), 'a'), grp(items(it.k, b, { size: b > 5 ? 'sm' : 'md' }), 'b')), ans: t, lo: 2, hi: 10, count: '.it', full: L(`${a} 和 ${b} 合起來是 ${t}`, `${a} and ${b} make ${t}`) });
  }, true),
];
