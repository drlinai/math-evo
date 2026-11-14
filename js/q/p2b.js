// 小二上 LV2（新加坡 P2 Term 2）：39 種題型。正式用 × 和 ÷，背 2、5、10 的乘法表；重量用公斤、公克；時間讀到 1 分鐘。
// 每個題型只是「概念」：東西、人名、數字、情境每次都隨機換。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, thing, who, who2, sayOf, FOODS, TOYS } from './core.js?v=32';
import { items, groups, array, grp, row, col, fig, emo, ncard, label, pic, seq, bigEq, blocks, clock, timeStr, scale, balance, svg } from './vis.js?v=32';

const T = { md: ['乘除概念', 'Multiply and divide', '✖️'], table: ['乘法表', 'Times tables', '🔢'], word: ['乘除應用題', 'Word problems', '📖'],
  mass: ['重量', 'Mass', '⚖️'], time: ['時間', 'Time', '🕒'], bonus: ['加分題', 'Bonus', '⭐'] };
const INK = '#2b2140';
const TABLES = [2, 5, 10];
const DOTC = ['#ff5b5b', '#3f8cff', '#2ec27e', '#ff9f1c', '#a06bff'];
const KG = () => L('公斤', 'kg'), GR = () => L('公克', 'g');
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const an = (en) => `${/^[aeiou]/.test(en) ? 'an' : 'a'} ${en}`;
const uniq = (list) => [...new Set(list)];
// 2、5、10 乘法表裡的一組數：[t, n]
const fact = (d, lo = 2) => [pick(TABLES), rnd(lo, d ? 10 : 5)];
// 整除的一組小數字（除號第一次出現用）：[幾份, 每份幾個]
const divPair = (d) => { let k, q; do { k = rnd(2, 6); q = rnd(2, 6); } while (k * q > (d ? 24 : 12)); return [k, q]; };
// 純計算題：大算式＋問號
const calc = (eq, ans, o = {}) => Q.num({ p: L('問號是多少？', 'What is the missing number?'), say: sayOf(eq), scene: bigEq(eq), ans, lo: 0, hi: Math.max(12, ans + 4), full: eq.replace('□', ans), ...o });

// ---------- 應用題的材料 ----------
const GOODS = [...FOODS, 'car', 'teddy', 'pencil', 'balloon', 'star'];
const BOX = [{ zh: '盒', en: 'box', ens: 'boxes', e: '📦' }, { zh: '袋', en: 'bag', ens: 'bags', e: '🛍️' }, { zh: '籃', en: 'basket', ens: 'baskets', e: '🧺' }];
// 乘除故事：a 每份幾個、b 幾份（其中一個是 2、5、10）。kind：'mul' 乘法 | 'share' 平分 | 'group' 分裝
function tale(kind, d) {
  const it = thing(GOODS), c = pick(BOX), [t, n] = fact(d), [a, b] = shuffle([t, n]), N = a * b, o = { it, c, a, b, N };
  if (kind === 'mul') return { ...o, ans: N, eq: `${b} × ${a} = ${N}`, zh: `每${c.zh}有 ${a} ${it.m}${it.zh}，有 ${b} ${c.zh}。一共有幾${it.m}${it.zh}？`, en: `Each ${c.en} has ${a} ${it.ens}. There are ${b} ${c.ens}. How many ${it.ens} are there?` };
  if (kind === 'share') return { ...o, ans: a, eq: `${N} ÷ ${b} = ${a}`, zh: `${N} ${it.m}${it.zh}平分給 ${b} 個小朋友，每個小朋友分到幾${it.m}？`, en: `${N} ${it.ens} are shared equally among ${b} children. How many ${it.ens} does each child get?` };
  return { ...o, ans: b, eq: `${N} ÷ ${a} = ${b}`, zh: `有 ${N} ${it.m}${it.zh}，每${c.zh}裝 ${a} ${it.m}。可以裝幾${c.zh}？`, en: `There are ${N} ${it.ens}. Each ${c.en} has ${a} ${it.ens}. How many ${c.ens} are there?` };
}
const erow = (list, max = 700) => `<div class="vrow wrap" style="gap:4px 8px;max-width:${max}px">${list.join('')}</div>`;

// ---------- 重量的材料：[表情符號, 中文, 英文, 天平用的輕重等級] ----------
const obj = ([e, zh, en, w]) => ({ e, zh, en, w });
const LIGHT = [['🍓', '草莓', 'strawberry', 1], ['🥚', '雞蛋', 'egg', 2], ['🍋', '檸檬', 'lemon', 2], ['🥝', '奇異果', 'kiwi', 2]].map(obj);          // 100 公克以內
const FRUIT = [['🍎', '蘋果', 'apple', 3], ['🍊', '橘子', 'orange', 3], ['🍐', '梨子', 'pear', 3], ['🥭', '芒果', 'mango', 4], ['🍌', '香蕉', 'banana', 3]].map(obj); // 500 公克以內
const MID = [['🍍', '鳳梨', 'pineapple', 5], ['🥥', '椰子', 'coconut', 5], ['🥬', '白菜', 'cabbage', 5], ['🍈', '哈密瓜', 'melon', 5]].map(obj);        // 1000 公克以內
const HEAVY = [['🍉', '西瓜', 'watermelon', 7], ['🎃', '南瓜', 'pumpkin', 7], ['🐶', '小狗', 'puppy'], ['🐱', '貓咪', 'cat'], ['🎒', '書包', 'school bag'], ['📦', '箱子', 'box'],
  ['🧳', '行李箱', 'suitcase'], ['🍚', '一袋米', 'bag of rice'], ['🥔', '一袋馬鈴薯', 'sack of potatoes'], ['🐔', '母雞', 'hen']].map(obj);              // 公斤
const PACK = [['🧂', '一包鹽', 'packet of salt'], ['🧀', '一塊起司', 'block of cheese'], ['🍬', '一包糖果', 'packet of sweets'], ['🍪', '一盒餅乾', 'box of biscuits'],
  ['🥜', '一包花生', 'packet of peanuts'], ['🍝', '一包麵條', 'packet of noodles'], ['🍯', '一罐蜂蜜', 'jar of honey'], ['☕', '一罐咖啡', 'jar of coffee']].map(obj);
const BAL = [...LIGHT, ...FRUIT, ...MID, HEAVY[0], HEAVY[1]];
// 一小堆表情符號（放在天平盤子上）
const egrid = (e, n, px = 24) => `<div style="display:flex;flex-wrap:wrap;justify-content:center;width:${Math.min(n, 5) * (px + 4)}px;font-size:${px}px;line-height:1.15">${`<span style="width:${px + 4}px;text-align:center">${e}</span>`.repeat(n)}</div>`;

// ---------- 時間：一律用「從 0 點起算的分鐘數」----------
const hm = (t) => [Math.floor(t / 60) % 12 || 12, t % 60];
const ts = (t) => timeStr(...hm(t));                                   // 7.23／7:23
const tsay = (t) => { const [h, m] = hm(t); return L(m ? `${h} 點 ${m} 分` : `${h} 點`, m === 0 ? `${h} o'clock` : m < 10 ? `${h} oh ${m}` : `${h} ${m}`); }; // 唸法
const ap = (t) => L(`${t < 720 ? '上午' : '下午'} ${ts(t)}`, `${ts(t)} ${t < 720 ? 'a.m.' : 'p.m.'}`);
const apSay = (t) => L(`${t < 720 ? '上午' : '下午'} ${tsay(t)}`, `${hm(t)[1] ? tsay(t) : hm(t)[0]} ${t < 720 ? 'a.m.' : 'p.m.'}`);
const clk = (t, s = 200) => clock(hm(t)[0], hm(t)[1], { s });

// ---------- 自己畫的圖 ----------
const tx = (x, y, s, size = 20, fill = INK) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" font-weight="900" text-anchor="middle" fill="${fill}">${s}</text>`;
// 圓點陣列（列數很多時用）
const dotGrid = (r, c, color) => { const s = Math.min(40, Math.floor(262 / r)); return svg(c * s, r * s, range(0, r * c - 1).map((i) => `<circle cx="${(i % c) * s + s / 2}" cy="${Math.floor(i / c) * s + s / 2}" r="${(s * 0.36).toFixed(1)}" fill="${color}" stroke="${INK}" stroke-width="${s > 30 ? 3 : 2}"/>`).join('')); };
// 5 的跳數配時鐘面：長針指到 k（1~12），外圈寫出前面的 5、10、15…，k 的位置是問號
function clock5(k) {
  const at = (i, r) => [130 + Math.sin((i * Math.PI) / 6) * r, 130 - Math.cos((i * Math.PI) / 6) * r];
  let g = `<circle cx="130" cy="130" r="84" fill="#fff" stroke="${INK}" stroke-width="6"/>`;
  for (let i = 1; i <= 12; i++) {
    const [x, y] = at(i, 66), [ox, oy] = at(i, 110);
    g += tx(x, y + 7, i, 19);
    if (i === k) g += `<rect x="${(ox - 17).toFixed(1)}" y="${(oy - 17).toFixed(1)}" width="34" height="34" rx="8" fill="#3f8cff" stroke="${INK}" stroke-width="3"/>${tx(ox, oy + 8, '?', 22, '#fff')}`;
    else if (i < k) g += tx(ox, oy + 7, i * 5, 19, '#e8483f');
  }
  return svg(260, 260, `${g}<line x1="130" y1="130" x2="130" y2="84" stroke="#e8483f" stroke-width="6" stroke-linecap="round" transform="rotate(${k * 30} 130 130)"/><circle cx="130" cy="130" r="7" fill="${INK}"/>`);
}
// 倍數的長條圖：上面一條是 1 份（寫 b），下面一條是 k 份；tail 是下面那條後面的字（'?' 或總數）
function timesBar(nameB, nameA, k, b, tail) {
  const w = Math.min(80, Math.floor(540 / k)), box = (x, y, c) => `<rect x="${x}" y="${y}" width="${w}" height="48" fill="${c}" stroke="${INK}" stroke-width="4"/>`;
  let s = tx(60, 44, nameB, 22) + box(124, 12, '#7fd4ff') + tx(124 + w / 2, 45, b, 24) + tx(60, 114, nameA, 22);
  for (let i = 0; i < k; i++) s += box(124 + i * w, 82, '#ffd43a');
  return svg(124 + k * w + 70, 140, s + tx(124 + k * w + 34, 117, tail, 30, '#3f8cff'));
}

export default [
  // ---- 乘除概念 ----
  def(T.md, '等組寫乘法', 'Equal groups', (d) => {
    const it = thing(), g = rnd(2, d ? 6 : 4), each = rnd(2, d ? 5 : 3), n = g * each, eq = `${g} × ${each}`, scene = groups(g, each, it.k);
    const hint = L(`一組有 ${each} ${it.m}，一組一組加上去。`, `Each group has ${each}. Add them group by group.`);
    if (d && chance(0.35)) return Q.pick({ p: L(`${g} 組，每組 ${each} ${it.m}。哪一個乘法算式是對的？`, `${g} groups of ${each}. Which multiplication sentence is correct?`), scene,
      right: `${eq} = ${n}`, wrong: [`${g} + ${each} = ${g + each}`, `${g + 1} × ${each} = ${(g + 1) * each}`, `${g} × ${each + 1} = ${g * (each + 1)}`], hint, full: `${eq} = ${n}` });
    return Q.num({ p: L(`${g} 組，每組 ${each} ${it.m}。${eq} = □`, `${g} groups of ${each} = ${eq} = □`), scene, ans: n, lo: 2, hi: n + 6, count: '.it', hint, full: `${eq} = ${n}` });
  }),
  def(T.md, '陣列寫乘法', 'Arrays', (d) => {
    const r = rnd(2, [5, 7, 10][d]), c = pick(d ? TABLES : [2, 5]), n = r * c, big = r > 6, it = thing(), m = big ? '個' : it.m, eq = `${r} × ${c}`;
    const scene = big ? dotGrid(r, c, pick(DOTC)) : array(r, c, it.k), hint = L(`一排有 ${c} ${m}，一排一排加上去。`, `Each row has ${c}. Add them row by row.`);
    if (chance(0.5)) return Q.pick({ p: L(`${r} 排，每排 ${c} ${m}。哪一個乘法算式是對的？`, `${r} rows of ${c}. Which multiplication sentence is correct?`), scene,
      right: `${eq} = ${n}`, wrong: [`${r} + ${c} = ${r + c}`, `${r + 1} × ${c} = ${(r + 1) * c}`, `${eq} = ${n + pick([c, -r])}`], hint, full: `${eq} = ${n}` });
    return Q.num({ p: L(`${r} 排，每排 ${c} ${m}。${eq} = □`, `${r} rows of ${c}. ${eq} = □`), scene, ans: n, lo: 2, hi: n + 6, count: big ? null : '.it', hint, full: `${eq} = ${n}` });
  }),
  def(T.md, '平分寫除法', 'Sharing equally', (d) => {
    const it = thing(), [k, q] = divPair(d), N = k * q, eq = `${N} ÷ ${k}`;
    const scene = d ? col(items(it.k, N, { size: 'sm', cols: 10 }), row(...range(1, k).map(() => '<div class="plate2" style="width:64px;height:36px"></div>'))) : groups(k, q, it.k);
    return Q.num({ p: L(`${N} ${it.m}${it.zh}平分成 ${k} 份，每份幾${it.m}？${eq} = □`, `Share ${N} ${it.ens} equally among ${k}. ${eq} = □`), scene, ans: q, lo: 1, hi: 8,
      hint: L('一份放一個，輪流分完，再數一份有幾個。', 'Give one to each group in turn. Then count one group.'), full: `${eq} = ${q}` });
  }),
  def(T.md, '分裝寫除法', 'Making equal groups', (d) => {
    const it = thing(), [g, s] = divPair(d), N = g * s, eq = `${N} ÷ ${s}`;
    return Q.num({ p: L(`${N} ${it.m}${it.zh}，每 ${s} ${it.m}分一組，可以分成幾組？${eq} = □`, `Put ${N} ${it.ens} into groups of ${s}. ${eq} = □`), scene: d ? items(it.k, N, { size: 'sm', cols: 10 }) : groups(g, s, it.k), ans: g, lo: 1, hi: 8,
      hint: L(`每 ${s} ${it.m}圈一圈，數數看有幾圈。`, `Make groups of ${s}. Count the groups.`), full: `${eq} = ${g}` });
  }),
  def(T.md, '乘除一家', 'Fact family', (d) => {
    const t = pick(TABLES), n = pick(range(2, d ? 10 : 6).filter((x) => x !== t)), p = t * n, [a, b] = shuffle([t, n]), card = (s) => `<span class="vlabel">${s}</span>`;
    const good = [`${a} × ${b} = ${p}`, `${b} × ${a} = ${p}`, `${p} ÷ ${a} = ${b}`, `${p} ÷ ${b} = ${a}`];
    const bad = [`${a} + ${b} = ${p}`, `${p} × ${a} = ${b}`, `${a} ÷ ${b} = ${p}`, `${p} − ${a} = ${b}`, `${b} ÷ ${p} = ${a}`, `${p} + ${b} = ${a}`];
    return Q.multi({ p: L(`用 ${a}、${b}、${p} 這三個數，哪些算式是對的？全部選出來。`, `Use ${a}, ${b} and ${p}. Which sentences are correct? Choose them all.`),
      items: [...sample(good, d ? 4 : 3).map((s) => [card(s), true]), ...sample(bad, d ? 3 : 2).map((s) => [card(s), false])], full: `${a} × ${b} = ${p}${L('，', ', ')}${p} ÷ ${a} = ${b}` });
  }),
  def(T.md, '選乘或除', 'Multiply or divide?', (d) => {
    const kind = pick(['mul', 'share', 'group']), s = tale(kind, d), mul = kind === 'mul', opts = [L('× 乘法', '× multiply'), L('÷ 除法', '÷ divide')];
    return Q.pick({ p: L(`${s.zh}要用乘法還是除法？`, `${s.en} Do you multiply or divide?`), scene: row(ncard('×', 'blue'), label(L('還是', 'or')), ncard('÷', 'gold')), right: opts[mul ? 0 : 1], wrong: [opts[mul ? 1 : 0]],
      hint: L('合起來算一共有多少，用乘法；平分或分裝，用除法。', 'Equal groups put together: multiply. Sharing or grouping: divide.'), full: s.eq });
  }),
  // ---- 乘法表 ----
  def(T.table, '2 的跳數', 'Count in twos', (d) => {
    const a = 2 * rnd(1, d ? 7 : 4), back = d === 2 && chance(0.3), list = range(0, 3).map((i) => a + 2 * i), miss = d ? rnd(1, 3) : 3;
    if (back) list.reverse();
    return Q.num({ p: back ? L('2 個 2 個倒過來數，問號是多少？', 'Count back in twos. What is the missing number?') : L('2 個 2 個往下數，問號是多少？', 'Count in twos. What is the missing number?'),
      scene: seq(list.map((v, i) => (i === miss ? '?' : v))), ans: list[miss], lo: 0, hi: 22, hint: back ? L('每次少 2。', 'Take away 2 each time.') : L('每次多 2。', 'Add 2 each time.'), full: list.join(', ') });
  }),
  def(T.table, '2 的乘法', '2 times table', (d) => {
    const n = rnd(1, d ? 10 : 5), it = thing(), eq = d && chance(0.4) ? `2 × ${n} = □` : `${n} × 2 = □`;
    return calc(eq, 2 * n, { hi: 22, hint: L('2 個 2 個往下數。', 'Count in twos.'), ...(d ? {} : { scene: col(bigEq(eq, 'tiny'), groups(n, 2, it.k)), count: '.it' }) });
  }),
  def(T.table, '雙倍', 'Doubles', (d) => {
    const n = rnd(1, d ? 10 : 5), it = thing(), g = (cls, from) => grp(items(it.k, n, { size: 'sm', cols: 5, from }), cls);
    return Q.num({ p: L(`${n} 的兩倍是多少？`, `Double ${n} is □.`), say: L(`${n} 的兩倍是多少？`, `What is double ${n}?`), scene: row(g('a', 0), g('b', n)), ans: 2 * n, lo: 0, hi: 22, count: '.it',
      hint: L(`兩倍就是 ${n} 再加 ${n}。`, `Double means ${n} and ${n} more.`), full: L(`${n} 的兩倍是 ${2 * n}`, `Double ${n} is ${2 * n}`) });
  }),
  def(T.table, '5 的跳數', 'Count in fives', (d) => {
    const k = rnd(4, [6, 10, 12][d]), list = [k - 3, k - 2, k - 1].map((i) => 5 * i);
    return Q.num({ p: L('5 個 5 個往下數，接下來是多少？', 'Count in fives. What comes next?'), say: L(`5 個 5 個往下數：${list.join('、')}，接下來是多少？`, `Count in fives: ${list.join(', ')}. What comes next?`),
      scene: row(seq([...list, '?']), clock5(k)), ans: 5 * k, lo: 5, hi: 30, hint: L('時鐘上每走一個數字，就多 5 分鐘。', 'Each number on the clock is 5 more minutes.'), full: [...list, 5 * k].join(', ') });
  }),
  def(T.table, '5 的乘法', '5 times table', (d) => {
    const n = rnd(1, d ? 10 : 5), eq = d && chance(0.4) ? `5 × ${n} = □` : `${n} × 5 = □`;
    return calc(eq, 5 * n, { hint: L('5 個 5 個往下數。', 'Count in fives.'), ...(d ? {} : { scene: col(bigEq(eq, 'tiny'), erow(range(1, n).map(() => emo('🖐️', 84)))) }) });
  }),
  def(T.table, '10 的乘法', '10 times table', (d) => {
    const n = rnd(1, d ? 10 : 5), eq = d && chance(0.4) ? `10 × ${n} = □` : `${n} × 10 = □`;
    return calc(eq, 10 * n, { hint: L('10 個 10 個往下數。', 'Count in tens.'), ...(d ? {} : { scene: col(bigEq(eq, 'tiny'), blocks(10 * n, 1.6)) }) });
  }),
  def(T.table, '缺因數', 'Missing factor', (d) => {
    const [t, n] = fact(d), p = t * n, form = rnd(0, d === 2 ? 2 : 1), eq = [`□ × ${t} = ${p}`, `${t} × □ = ${p}`, `${n} × □ = ${p}`][form];
    return calc(eq, form === 2 ? t : n, { lo: 1, hi: 10, hint: L('背背看乘法表，哪一個數乘起來剛剛好？', 'Say the times table. Which number fits?') });
  }),
  def(T.table, '除法事實', 'Division facts', (d) => {
    const [t, n] = fact(d, d ? 1 : 2), p = t * n;
    return calc(`${p} ÷ ${t} = □`, n, { lo: 1, hi: 10, hint: L(`想一想：${t} 乘以多少是 ${p}？`, `Think: ${t} times what number is ${p}?`) });
  }),
  def(T.table, '交換律', 'Swap the numbers', (d) => {
    const t = pick(TABLES), n = pick(range(d ? 1 : 2, d ? 10 : 6).filter((x) => x !== t)), [a, b] = shuffle([t, n]), first = chance(0.5);
    return calc(first ? `${a} × ${b} = □ × ${a}` : `${a} × ${b} = ${b} × □`, first ? b : a, { lo: 1, hi: 10, hint: L('兩個數交換位置，答案還是一樣。', 'You can swap the two numbers. The answer stays the same.') });
  }),
  def(T.table, '找規律', 'Times table patterns', (d) => {
    const kind = pick(d ? ['end5', 'end10', 'even', 'yn', 'yn', 'which'] : ['end5', 'end10', 'even']), a = rnd(1, 5), list = (t) => seq(range(a, a + 5).map((i) => i * t));
    const rule = { 2: L('2 的乘法表都是雙數', 'Numbers in the 2 times table are all even'), 5: L('5 的乘法表，個位數是 0 或 5', 'Numbers in the 5 times table end in 0 or 5'), 10: L('10 的乘法表，個位數都是 0', 'Numbers in the 10 times table end in 0') };
    if (kind === 'end5') return Q.pick({ p: L('5 的乘法表，答案的個位數都是哪兩個數字？', 'Numbers in the 5 times table end in □ or □.'), say: L('5 的乘法表，答案的個位數都是哪兩個數字？', 'Numbers in the 5 times table end in which two digits?'), scene: list(5),
      right: L('0 和 5', '0 or 5'), wrong: [L('0 和 2', '0 or 2'), L('1 和 5', '1 or 5'), L('5 和 10', '5 or 10')], full: rule[5] });
    if (kind === 'end10') return Q.pick({ p: L('10 的乘法表，答案的個位數都是多少？', 'Numbers in the 10 times table end in □.'), say: L('10 的乘法表，答案的個位數都是多少？', 'Numbers in the 10 times table end in which digit?'), scene: list(10),
      right: 0, wrong: [1, 5, 2], sort: true, full: rule[10] });
    if (kind === 'even') return Q.pick({ p: L('2 的乘法表，答案都是單數還是雙數？', 'Are the numbers in the 2 times table odd or even?'), scene: list(2), right: L('雙數', 'even'), wrong: [L('單數', 'odd')], full: rule[2] });
    const t = pick(TABLES), yes = t * rnd(2, 10), no = () => pick(range(t + 1, t * 10 - 1).filter((x) => x % t));
    if (kind === 'yn') { const ok = chance(0.5), N = ok ? yes : no(); return Q.yn({ p: L(`${N} 是 ${t} 的乘法表裡的數嗎？`, `Is ${N} in the ${t} times table?`), scene: ncard(N), ans: ok, hint: L('看看個位數。', 'Look at the ones digit.'), full: ok ? `${N / t} × ${t} = ${N}` : rule[t] }); }
    const wrong = []; while (wrong.length < 3) { const x = no(); if (!wrong.includes(x)) wrong.push(x); }
    return Q.pick({ p: L(`哪一個數在 ${t} 的乘法表裡？`, `Which number is in the ${t} times table?`), scene: bigEq(`□ × ${t}`), right: yes, wrong, sort: true, hint: L('看看個位數。', 'Look at the ones digit.'), full: `${yes / t} × ${t} = ${yes}` });
  }),
  def(T.table, '快閃心算', 'Quick facts', (d) => {
    const [t, n] = fact(d, d ? 1 : 2), p = t * n, form = rnd(0, 3);
    return calc([`${n} × ${t} = □`, `${t} × ${n} = □`, `${p} ÷ ${t} = □`, `${p} ÷ ${t} = □`][form], form < 2 ? p : n, form < 2 ? {} : { lo: 1, hi: 10 });
  }),
  // ---- 乘除應用題 ----
  def(T.word, '乘法應用題', 'Multiplication stories', (d) => {
    const s = tale('mul', d), { it, c, a, b, N } = s, p = who(), day = chance(0.4), card = fig(emo(day ? '📅' : c.e, 52), a);
    return Q.num({ p: day ? L(`${p.n}每天拿到 ${a} ${it.m}${it.zh}。${b} 天一共拿到幾${it.m}？`, `${p.n} gets ${a} ${it.ens} every day. How many ${it.ens} does ${p.he} get in ${b} days?`) : L(s.zh, s.en),
      scene: row(pic(it.k, 80), erow(range(1, b).map(() => card))), ans: N, lo: 2, hi: N + 6, unit: L(it.m, ''), hint: L(`${b} 個 ${a} 是多少？`, `What is ${b} groups of ${a}?`), full: s.eq });
  }),
  def(T.word, '平分應用題', 'Sharing stories', (d) => {
    const s = tale('share', d), { it, c, a, b, N } = s, p = who(), box = chance(0.4);
    return Q.num({ p: box ? L(`${p.n}把 ${N} ${it.m}${it.zh}平分成 ${b} ${c.zh}，每${c.zh}有幾${it.m}？`, `${p.n} puts ${N} ${it.ens} equally into ${b} ${c.ens}. How many ${it.ens} are in each ${c.en}?`) : L(s.zh, s.en),
      scene: row(fig(pic(it.k, 90), `× ${N}`), emo('➡️', 44), erow(range(1, b).map(() => emo(box ? c.e : pick(['🧒', '👧', '👦']), 52)), 400)), ans: a, lo: 1, hi: 12, unit: L(it.m, ''),
      hint: L(`想一想：${b} 乘以多少是 ${N}？`, `Think: ${b} times what number is ${N}?`), full: s.eq });
  }),
  def(T.word, '分裝應用題', 'Grouping stories', (d) => {
    const s = tale('group', d), { it, c, a, b, N } = s, p = who(), friend = chance(0.4);
    return Q.num({ p: friend ? L(`${p.n}有 ${N} ${it.m}${it.zh}，每個朋友分 ${a} ${it.m}。可以分給幾個朋友？`, `${p.n} has ${N} ${it.ens}. ${p.He} gives ${a} ${it.ens} to each friend. How many friends get ${it.ens}?`) : L(s.zh, s.en),
      scene: row(fig(pic(it.k, 90), `× ${N}`), emo('➡️', 44), fig(emo(friend ? '🧒' : c.e, 90), friend ? L(`每人 ${a} ${it.m}`, `${a} each`) : L(`每${c.zh} ${a} ${it.m}`, `${a} in each`)), label('× ?', 'big')),
      ans: b, lo: 1, hi: 12, unit: friend ? L('人', '') : L(c.zh, ''), hint: L(`想一想：${a} 乘以多少是 ${N}？`, `Think: ${a} times what number is ${N}?`), full: s.eq });
  }),
  // ---- 重量 ----
  def(T.mass, '天平比輕重', 'Heavier or lighter?', (d) => {
    const same = d > 0 && chance(0.25); let a, b;
    if (same) { const w = pick([2, 3, 5, 7]); [a, b] = sample(BAL.filter((o) => o.w === w), 2); } else do { [a, b] = sample(BAL, 2); } while (a.w === b.w);
    const scene = balance(emo(a.e, 64), emo(b.e, 64), same ? 0 : a.w > b.w ? -1 : 1), [hv, lt] = a.w > b.w ? [a, b] : [b, a], hint = L('天平往下沉的那一邊比較重。', 'The side that goes down is heavier.');
    if (!same && chance(0.5)) {
      const heavy = chance(0.5), [r, w] = heavy ? [hv, lt] : [lt, hv];
      return Q.pick({ p: heavy ? L('哪一個比較重？', 'Which is heavier?') : L('哪一個比較輕？', 'Which is lighter?'), scene, right: emo(r.e, 90), wrong: [emo(w.e, 90)], hint,
        full: heavy ? L(`${hv.zh}比${lt.zh}重`, `The ${hv.en} is heavier than the ${lt.en}`) : L(`${lt.zh}比${hv.zh}輕`, `The ${lt.en} is lighter than the ${hv.en}`) });
    }
    const opts = [L('比較重', 'heavier than'), L('比較輕', 'lighter than'), L('一樣重', 'as heavy as')], rel = same ? 2 : a.w > b.w ? 0 : 1;
    return Q.pick({ p: L(`${a.zh}和${b.zh}比，${a.zh}是比較重、比較輕，還是一樣重？`, `Is the ${a.en} heavier than, lighter than or as heavy as the ${b.en}?`), scene, right: opts[rel], wrong: opts.filter((_, i) => i !== rel), hint: same ? L('天平兩邊一樣高，就是一樣重。', 'When the two sides are level, they are as heavy as each other.') : hint,
      full: L(same ? `${a.zh}和${b.zh}一樣重` : `${a.zh}比${b.zh}${rel ? '輕' : '重'}`, `The ${a.en} is ${opts[rel]} the ${b.en}`) });
  }),
  def(T.mass, '讀秤（公斤）', 'Read the scale (kg)', (d) => {
    const o = pick(HEAVY), cfg = d === 2 && chance(0.5) ? { max: 10, major: 2 } : { max: pick(d ? [10] : [5, 10]), major: 1 }, v = rnd(1, cfg.max - (d ? 0 : 1));
    return Q.num({ p: L(`${o.zh}重幾公斤？`, `The ${o.en} is □ kg.`), say: L(`${o.zh}重幾公斤？`, `How heavy is the ${o.en}? How many kilograms?`), scene: scale(v, cfg.max, KG(), { major: cfg.major, minor: 1, s: 220, top: emo(o.e, 58) }),
      ans: v, lo: 0, hi: 10, unit: KG(), hint: cfg.major === 2 ? L('兩個數字中間的那一格，是中間的數。', 'A mark between two numbers is the number in between.') : L('看指針指到哪一個數字。', 'Look at the number the pointer shows.'), full: L(`${o.zh}重 ${v} 公斤`, `The ${o.en} is ${v} kg`) });
  }),
  def(T.mass, '讀秤（公克）', 'Read the scale (g)', (d) => {
    const cfg = pick([{ max: 1000, major: 200, minor: 100, pool: MID }, { max: 500, major: 100, minor: 50, pool: FRUIT }, { max: 100, major: 20, minor: 10, pool: LIGHT }]), o = pick(cfg.pool);
    const step = d ? cfg.minor : cfg.major, v = step * rnd(1, cfg.max / step - 1);
    return Q.num({ p: L(`${o.zh}重幾公克？`, `The ${o.en} is □ g.`), say: L(`${o.zh}重幾公克？`, `How heavy is the ${o.en}? How many grams?`), scene: scale(v, cfg.max, GR(), { major: cfg.major, minor: cfg.minor, s: 220, top: emo(o.e, 58) }),
      ans: v, pad: true, unit: GR(), hint: L(`每一小格是 ${cfg.minor} 公克。`, `Each small mark stands for ${cfg.minor} grams.`), full: L(`${o.zh}重 ${v} 公克`, `The ${o.en} is ${v} g`) });
  }),
  def(T.mass, '選單位', 'kg or g?', (d) => {
    const light = [['🥚', '一顆雞蛋', 'an egg'], ['✏️', '一枝鉛筆', 'a pencil'], ['🍓', '一顆草莓', 'a strawberry'], ['🔑', '一把鑰匙', 'a key'], ['🍪', '一片餅乾', 'a biscuit'], ['🍃', '一片葉子', 'a leaf'], ['✉️', '一封信', 'a letter'], ['🍬', '一顆糖果', 'a sweet'], ['🥄', '一根湯匙', 'a spoon']];
    const heavy = [['🧒', '一個小朋友', 'a child'], ['🍚', '一袋米', 'a bag of rice'], ['🍉', '一顆大西瓜', 'a big watermelon'], ['🐕', '一隻大狗', 'a big dog'], ['🪑', '一張椅子', 'a chair'], ['🚲', '一輛腳踏車', 'a bicycle'], ['🧳', '一個行李箱', 'a suitcase'], ['📺', '一台電視', 'a television'], ['🐖', '一頭豬', 'a pig']];
    const kg = chance(0.5), [e, zh, en] = pick(kg ? heavy : light);
    return Q.pick({ p: L(`${zh}有多重，用公斤還是公克比較適合？`, `Would you weigh ${en} in kg or g?`), say: L(`${zh}有多重，用公斤還是公克比較適合？`, `Would you weigh ${en} in kilograms or grams?`), scene: emo(e, 170),
      right: kg ? KG() : GR(), wrong: [kg ? GR() : KG()], hint: L('輕輕的東西用公克，重重的東西用公斤。', 'Use grams for light things and kilograms for heavy things.'), full: L(`${zh}用${kg ? '公斤' : '公克'}比較適合`, `We weigh ${en} in ${kg ? 'kilograms' : 'grams'}`) });
  }),
  def(T.mass, '比較排序', 'Order by mass', (d) => {
    const [e, zh, ens] = pick([['📦', '包裹', 'parcels'], ['🎁', '禮物', 'presents'], ['🧺', '籃子', 'baskets'], ['🎒', '書包', 'bags']]), kg = chance(0.5), u = kg ? KG() : GR(), desc = d > 0 && chance(0.35), base = 50 * rnd(2, 17);
    const ms = kg ? sample(range(1, d ? 50 : 20), 3) : d === 2 ? sample(range(0, 20), 3).map((i) => base + 5 * i) : sample(range(1, 9), 3).map((i) => i * 100 + (d ? 10 * rnd(0, 9) : 0));
    const sorted = [...ms].sort((x, y) => (desc ? y - x : x - y)), txt = (list) => list.map((m) => `${m} ${u}`).join(L('、', ', '));
    return Q.order({ p: desc ? L(`把 3 個${zh}由最重排到最輕，照順序點。`, `Arrange the 3 ${ens} from heaviest to lightest.`) : L(`把 3 個${zh}由最輕排到最重，照順序點。`, `Arrange the 3 ${ens} from lightest to heaviest.`),
      items: ms.map((m) => [fig(emo(e, 80), `${m} ${u}`), m]), desc, full: txt(sorted) });
  }),
  def(T.mass, '重量加減應用題', 'Mass stories: add and subtract', (d) => {
    const kg = chance(0.5), u = kg ? KG() : GR(), [a, b] = sample(kg ? HEAVY : PACK, 2), step = kg ? 1 : d ? 10 : 50, hi = kg ? [10, 15, 20][d] : [10, 50, 99][d], kind = pick(['total', 'heavier', 'lighter']);
    const xs = kind === 'lighter' ? rnd(2, hi) : rnd(1, hi - 1), ys = kind === 'lighter' ? rnd(1, xs - 1) : rnd(1, hi - xs), x = xs * step, y = ys * step, ans = kind === 'lighter' ? x - y : x + y;
    const A = cap(an(a.en)), B = cap(an(b.en));
    const p = kind === 'total' ? L(`${a.zh}重 ${x} ${u}，${b.zh}重 ${y} ${u}。合起來重幾${u}？`, `${A} is ${x} ${u}. ${B} is ${y} ${u}. What is the total mass?`)
      : kind === 'heavier' ? L(`${a.zh}重 ${x} ${u}，${b.zh}比它重 ${y} ${u}。${b.zh}重幾${u}？`, `${A} is ${x} ${u}. ${B} is ${y} ${u} heavier. What is the mass of the ${b.en}?`)
        : L(`${a.zh}重 ${x} ${u}，${b.zh}比它輕 ${y} ${u}。${b.zh}重幾${u}？`, `${A} is ${x} ${u}. ${B} is ${y} ${u} lighter. What is the mass of the ${b.en}?`);
    return Q.num({ p, scene: row(fig(emo(a.e, 100), `${x} ${u}`), fig(emo(b.e, 100), kind === 'total' ? `${y} ${u}` : '?')), ans, lo: Math.max(0, ans - 5), hi: ans + 5, unit: u, full: kind === 'lighter' ? `${x} − ${y} = ${ans}` : `${x} + ${y} = ${ans}` });
  }),
  def(T.mass, '重多少', 'How much heavier?', (d) => {
    const cfg = d && chance(0.5) ? pick([{ max: 1000, major: 200, minor: 100, pool: MID, u: GR() }, { max: 500, major: 100, minor: 50, pool: FRUIT, u: GR() }]) : { max: 10, major: 1, minor: 1, pool: HEAVY, u: KG() };
    const [i, j] = sample(range(1, cfg.max / cfg.minor - (cfg.minor === 1 ? 0 : 1)), 2), x = Math.max(i, j) * cfg.minor, y = Math.min(i, j) * cfg.minor, [hv, lt] = sample(cfg.pool, 2), heavy = chance(0.6);
    const sc = (o, v) => scale(v, cfg.max, cfg.u, { major: cfg.major, minor: cfg.minor, s: 205, top: emo(o.e, 52) });
    return Q.num({ p: heavy ? L(`${hv.zh}比${lt.zh}重幾${cfg.u}？`, `How much heavier is the ${hv.en} than the ${lt.en}?`) : L(`${lt.zh}比${hv.zh}輕幾${cfg.u}？`, `How much lighter is the ${lt.en} than the ${hv.en}?`),
      scene: row(...shuffle([sc(hv, x), sc(lt, y)])), ans: x - y, pad: cfg.minor > 1 ? true : undefined, lo: 1, hi: 9, unit: cfg.u, hint: L('先讀出兩個秤，再用大的減小的。', 'Read both scales. Then subtract.'), full: `${x} − ${y} = ${x - y}` });
  }),
  def(T.mass, '天平推理', 'Balance puzzles', (d) => {
    const A = pick([['⚽', '球', '顆', 'ball', 'balls'], ['🍎', '蘋果', '顆', 'apple', 'apples'], ['🧸', '小熊', '隻', 'teddy bear', 'teddy bears'], ['🍐', '梨子', '顆', 'pear', 'pears']]);
    const U = pick([['🟦', '方塊', '個', 'cube', 'cubes'], ['🔴', '彈珠', '顆', 'marble', 'marbles'], ['🧱', '積木', '塊', 'brick', 'bricks']]);
    const [k, n] = d === 2 && chance(0.4) ? [rnd(2, 9), pick(TABLES)] : [pick(d ? TABLES : [2, 5]), rnd(2, d ? 10 : 5)], ans = k * n;
    return Q.num({ p: L(`1 ${A[2]}${A[1]}和 ${k} ${U[2]}${U[1]}一樣重。${n} ${A[2]}${A[1]}和幾${U[2]}${U[1]}一樣重？`, `1 ${A[3]} is as heavy as ${k} ${U[4]}. ${n} ${A[4]} are as heavy as □ ${U[4]}.`),
      say: L(`1 ${A[2]}${A[1]}和 ${k} ${U[2]}${U[1]}一樣重。${n} ${A[2]}${A[1]}和幾${U[2]}${U[1]}一樣重？`, `1 ${A[3]} is as heavy as ${k} ${U[4]}. ${n} ${A[4]} are as heavy as how many ${U[4]}?`),
      scene: row(balance(egrid(A[0], 1, 40), egrid(U[0], k)), balance(egrid(A[0], n), '<span class="scell q" style="min-width:58px;height:58px;font-size:36px">?</span>')), ans, lo: 2, hi: ans + 6, unit: L(U[2], ''),
      hint: L(`每 1 ${A[2]}${A[1]}都換成 ${k} ${U[2]}${U[1]}。`, `Swap each ${A[3]} for ${k} ${U[4]}.`), full: `${n} × ${k} = ${ans}` });
  }),
  def(T.mass, '重量乘除應用題', 'Mass stories: multiply and divide', (d) => {
    const kg = chance(0.5), u = kg ? KG() : GR(), kind = d ? pick(['mul', 'mul', 'each', 'count']) : 'mul';
    const [e, zh, m, en, ens] = pick(kg ? [['📕', '書', '本', 'book', 'books'], ['🧱', '磚塊', '塊', 'brick', 'bricks'], ['📦', '箱子', '個', 'box', 'boxes'], ['🍉', '西瓜', '顆', 'watermelon', 'watermelons'], ['🎃', '南瓜', '顆', 'pumpkin', 'pumpkins'], ['🍚', '米', '袋', 'bag of rice', 'bags of rice']]
      : [['🍬', '糖果', '顆', 'sweet', 'sweets'], ['🔑', '鑰匙', '把', 'key', 'keys'], ['✏️', '鉛筆', '枝', 'pencil', 'pencils'], ['🍪', '餅乾', '片', 'biscuit', 'biscuits'], ['📎', '迴紋針', '個', 'paper clip', 'paper clips'], ['🔴', '彈珠', '顆', 'marble', 'marbles']]);
    const [t, k] = fact(d), [w, n] = d && chance(0.4) ? [k, t] : [t, k], N = w * n, pics = erow(range(1, n).map(() => emo(e, 56)), 640);
    if (kind === 'each') return Q.num({ p: L(`${n} ${m}一樣重的${zh}，一共重 ${N} ${u}。每${m}重幾${u}？`, `${n} identical ${ens} have a total mass of ${N} ${u}. What is the mass of each ${en}?`), scene: fig(pics, L(`一共 ${N} ${u}`, `${N} ${u} altogether`)),
      ans: w, lo: 1, hi: 12, unit: u, hint: L(`想一想：${n} 乘以多少是 ${N}？`, `Think: ${n} times what number is ${N}?`), full: `${N} ÷ ${n} = ${w}` });
    if (kind === 'count') return Q.num({ p: L(`每${m}${zh}重 ${w} ${u}。幾${m}${zh}合起來重 ${N} ${u}？`, `Each ${en} is ${w} ${u}. How many ${ens} have a total mass of ${N} ${u}?`), scene: row(fig(emo(e, 100), `${w} ${u}`), label('× ?', 'big'), emo('➡️', 44), label(`${N} ${u}`, 'big')),
      ans: n, lo: 1, hi: 12, unit: L(m, ''), hint: L(`想一想：${w} 乘以多少是 ${N}？`, `Think: ${w} times what number is ${N}?`), full: `${N} ÷ ${w} = ${n}` });
    return Q.num({ p: L(`每${m}${zh}重 ${w} ${u}。${n} ${m}${zh}一共重幾${u}？`, `Each ${en} is ${w} ${u}. What is the mass of ${n} ${ens}?`), scene: fig(pics, L(`每${m} ${w} ${u}`, `${w} ${u} each`)), ans: N, lo: 2, hi: N + 6, unit: u,
      hint: L(`${n} 個 ${w} 是多少？`, `What is ${n} groups of ${w}?`), full: `${n} × ${w} = ${N}` });
  }),
  // ---- 時間 ----
  def(T.time, '讀到 1 分鐘', 'Tell time to the minute', (d) => {
    const h = rnd(1, 12), m = d ? rnd(1, 59) : rnd(1, 30), t = h * 60 + m;
    const wrong = uniq(shuffle([[(h % 12) + 1, m], [((h + 10) % 12) + 1, m], [h, (m + 5) % 60], [h, (m + 55) % 60], [Math.round(m / 5) % 12 || 12, (h % 12) * 5]]).map(([a, b]) => timeStr(a, b))).filter((s) => s !== ts(t)).slice(0, 3);
    return Q.pick({ p: L('現在是幾點幾分？', 'What time is it?'), scene: clock(h, m, { s: 250 }), right: ts(t), wrong, hint: L('短針看幾點。長針走一小格是 1 分鐘。', 'The short hand shows the hour. Each small mark is 1 minute.'), full: ts(t), fullSay: tsay(t) });
  }),
  def(T.time, '上午下午', 'a.m. or p.m.?', (d) => {
    const [e, zh, en, pm, lo, hi] = pick([['🥣', '吃早餐', 'eats breakfast', 0, 6, 8], ['⏰', '起床', 'wakes up', 0, 6, 7], ['🎒', '出門上學', 'leaves for school', 0, 6, 7], ['🌅', '看日出', 'watches the sunrise', 0, 5, 6], ['🤸', '做早操', 'does morning exercise', 0, 7, 9],
      ['🍽️', '吃晚餐', 'has dinner', 1, 6, 7], ['🌙', '上床睡覺', 'goes to bed', 1, 8, 9], ['🛁', '睡前洗澡', 'takes a bath before bed', 1, 7, 8], ['🏠', '放學回家', 'comes home from school', 1, 1, 4], ['🍪', '吃下午點心', 'has an afternoon snack', 1, 3, 4], ['⭐', '看星星', 'looks at the stars', 1, 8, 9]]);
    const p = who(), t = rnd(lo, hi) * 60 + (d ? pick([0, 0, 15, 30, 45]) : 0), right = ap(t + (pm ? 720 : 0)), wrong = ap(t + (pm ? 0 : 720)), half = (s) => L(s ? '下午' : '上午', s ? 'p.m.' : 'a.m.');
    const P = (f) => L(`${p.n} ${f(t)} ${zh}，是上午 ${f(t)} 還是下午 ${f(t)}？`, `${p.n} ${en} at ${f(t)}. Is it ${f(t)} a.m. or ${f(t)} p.m.?`);
    return Q.pick({ p: P(ts), say: L(`${p.n} ${tsay(t)} ${zh}，是上午還是下午？`, `${p.n} ${en} at ${tsay(t)}. Is it a.m. or p.m.?`), scene: row(emo(e, 130), clk(t, 210)), right, wrong: [wrong],
      full: L(`${right} ${zh}`, `${p.n} ${en} at ${right}`), fullSay: L(`${half(pm)} ${tsay(t)} ${zh}`, `${p.n} ${en} at ${apSay(t + (pm ? 720 : 0))}`) });
  }),
  def(T.time, '畫指針', 'Show the time', (d) => {
    const h = rnd(1, 12), m = d ? rnd(1, 59) : 5 * rnd(1, 11), t = h * 60 + m, sw = [Math.round(m / 5) % 12 || 12, (h % 12) * 5], s = d === 2 ? 180 : 220;
    const cands = shuffle([[(h % 12) + 1, m], [((h + 10) % 12) + 1, m], [h, (m + 15) % 60], [h, (m + 45) % 60], ...(sw[0] !== h ? [sw] : [])]).slice(0, d === 2 ? 3 : 2);
    const P = (f) => L(`哪一個時鐘是 ${f(t)}？`, `Which clock shows ${f(t)}?`);
    return Q.tap({ p: P(ts), say: P(tsay), right: clock(h, m, { s }), wrong: cands.map(([a, b]) => clock(a, b, { s })), hint: L('先找長針指的分鐘，再看短針在哪兩個數字中間。', 'Find the minutes with the long hand. Then check the short hand.'), full: ts(t), fullSay: tsay(t) });
  }),
  def(T.time, '一小時前後', 'An hour or half an hour before and after', (d) => {
    const h = rnd(1, 12), m = [pick([0, 30]), pick([0, 15, 30, 45, 10, 20, 40, 50]), 5 * rnd(0, 11)][d], t = h * 60 + m;
    const ops = [[60, '1 小時後', '1 hour after'], [-60, '1 小時前', '1 hour before'], [30, '半小時後', 'half an hour after'], [-30, '半小時前', 'half an hour before']], i = rnd(0, d ? 3 : 1), [dt, zh, en] = ops[i];
    const P = (f) => L(`${f(t)} 的${zh}是幾點幾分？`, `What time is ${en} ${f(t)}?`), F = (f) => L(`${f(t)} 的${zh}是 ${f(t + dt)}`, `${cap(en)} ${f(t)} is ${f(t + dt)}`);
    return Q.pick({ p: P(ts), say: P(tsay), scene: clk(t, 240), right: ts(t + dt), wrong: ops.filter((_, j) => j !== i).map((o) => ts(t + o[0])),
      hint: Math.abs(dt) === 60 ? L('過 1 小時，短針走一大格，分鐘不變。', 'In 1 hour the hour changes by 1. The minutes stay the same.') : L('半小時是 30 分鐘。', 'Half an hour is 30 minutes.'), full: F(ts), fullSay: F(tsay) });
  }),
  def(T.time, '經過多久', 'How long?', (d) => {
    let t1, t2;
    if (d && chance(0.5)) { // 同一小時內的分鐘
      const m1 = d === 2 ? rnd(0, 40) : 5 * rnd(0, 8), m2 = d === 2 ? rnd(m1 + 5, 59) : m1 + 5 * rnd(1, (55 - m1) / 5);
      t1 = pick([...range(6, 11), ...range(13, 21)]) * 60 + m1; t2 = t1 - m1 + m2;
      const P = (f) => L(`從${f(t1)}到${f(t2)}，經過幾分鐘？`, `From ${f(t1)} to ${f(t2)} is □ minutes.`), F = (f) => L(`從${f(t1)}到${f(t2)}是 ${m2 - m1} 分鐘`, `From ${f(t1)} to ${f(t2)} is ${m2 - m1} minutes`);
      return Q.num({ p: P(ap), say: L(P(apSay), `How many minutes is it from ${apSay(t1)} to ${apSay(t2)}?`), scene: row(fig(clk(t1, 170), ap(t1)), emo('➡️', 50), fig(clk(t2, 170), ap(t2))), ans: m2 - m1, lo: 5, hi: 30, unit: L('分鐘', 'min'),
        hint: L('長針從哪裡走到哪裡？5 分、5 分往下數。', 'How far does the long hand move? Count in fives.'), full: F(ap), fullSay: F(apSay) });
    }
    const m = d ? pick([0, 0, 30, 15]) : 0, dur = rnd(2, d ? 5 : 3);
    if (d === 2 && chance(0.35)) { t1 = rnd(8, 11) * 60 + m; t2 = rnd(13, 16) * 60 + m; } // 跨過中午
    else { const pm = chance(0.5); t1 = (pm ? rnd(13, 21 - dur) : rnd(6, 11 - dur)) * 60 + m; t2 = t1 + dur * 60; }
    const hrs = (t2 - t1) / 60, P = (f) => L(`從${f(t1)}到${f(t2)}，經過幾小時？`, `From ${f(t1)} to ${f(t2)} is □ hours.`), F = (f) => L(`從${f(t1)}到${f(t2)}是 ${hrs} 小時`, `From ${f(t1)} to ${f(t2)} is ${hrs} hours`);
    return Q.num({ p: P(ap), say: L(P(apSay), `How many hours is it from ${apSay(t1)} to ${apSay(t2)}?`), scene: row(fig(clk(t1, 170), ap(t1)), emo('➡️', 50), fig(clk(t2, 170), ap(t2))), ans: hrs, lo: 1, hi: 9, unit: L('小時', 'h'),
      hint: L('一小時一小時往後數。', 'Count on one hour at a time.'), full: F(ap), fullSay: F(apSay) });
  }),
  def(T.time, '時分換算', 'Hours and minutes', (d) => {
    const H = rnd(1, d ? 3 : 2), M = d ? 5 * rnd(0, 11) : pick([0, 10, 20, 30]), tot = 60 * H + M, form = d ? (M ? rnd(0, 2) : rnd(0, 1)) : 0, hu = L('小時', 'h'), mu = L('分', 'min');
    const hw = `${H} ${pl(H, 'hour', 'hours')}`, hmTxt = M ? `${H} ${hu} ${M} ${mu}` : `${H} ${hu}`;
    const eq = [`${hmTxt} = □ ${mu}`, `${tot} ${mu} = □ ${hu}${M ? ` ${M} ${mu}` : ''}`, `${tot} ${mu} = ${H} ${hu} □ ${mu}`][form], ans = [tot, H, M][form];
    const say = [L(`${H} 小時${M ? ` ${M} 分` : ''}是幾分鐘？`, `${hw}${M ? ` ${M} minutes` : ''} equals how many minutes?`), L(`${tot} 分鐘是幾小時${M ? ` ${M} 分` : ''}？`, `${tot} minutes equals how many hours${M ? ` and ${M} minutes` : ''}?`), L(`${tot} 分鐘是 ${H} 小時幾分？`, `${tot} minutes equals ${hw} and how many minutes?`)][form];
    return Q.num({ p: L('問號是多少？', 'What is the missing number?'), say, scene: bigEq(eq, 'tiny'), ans, lo: 0, hi: form === 1 ? 5 : ans + 10, unit: form === 1 ? hu : mu, hint: L('1 小時是 60 分鐘。', '1 hour is 60 minutes.'),
      full: eq.replace('□', ans), fullSay: form ? L(`${tot} 分鐘是 ${H} 小時${M ? ` ${M} 分` : ''}`, `${tot} minutes equals ${hw}${M ? ` ${M} minutes` : ''}`) : L(`${H} 小時${M ? ` ${M} 分` : ''}是 ${tot} 分鐘`, `${hw}${M ? ` ${M} minutes` : ''} equals ${tot} minutes`) });
  }),
  def(T.time, '排時間順序', 'Put times in order', (d) => {
    const mins = () => [0, pick([0, 30]), 5 * rnd(0, 11)][d]; let list;
    do { const k = rnd(1, 3); list = [...range(1, k).map(() => rnd(6, 11) * 60 + mins()), ...range(1, 4 - k).map(() => rnd(13, 22) * 60 + mins())]; } while (new Set(list).size < 4);
    const sorted = [...list].sort((a, b) => a - b);
    return Q.order({ p: L('把 4 個時間從最早排到最晚，照順序點。', 'Put the 4 times in order. Start with the earliest.'), items: list.map((t) => [`<span class="vlabel">${ap(t)}</span>`, t]),
      hint: L('上午比下午早。', 'a.m. comes before p.m.'), full: sorted.map(ap).join(' → '), fullSay: sorted.map(apSay).join(L('、', ', ')) });
  }),
  def(T.time, '到達時間', 'When does it end?', (d) => {
    const cross = d === 2 && chance(0.6), dur = pick(d ? [10, 15, 20, 25, 30, 40, 45] : [10, 20, 30]), m = 5 * (cross ? rnd((60 - dur) / 5, 11) : rnd(0, (55 - dur) / 5)), t = rnd(1, 11) * 60 + m, R = t + dur, p = who();
    const [e, zh, en] = pick([['🚌', '公車', 'bus'], ['🚆', '火車', 'train'], ['⛴️', '渡輪', 'ferry'], ['🚕', '計程車', 'taxi']]), [e2, zh2, en2] = pick([['🏊', '游泳', 'swimming'], ['🎨', '畫畫', 'drawing'], ['🎹', '練琴', 'piano practice'], ['📖', '看書', 'reading'], ['⚽', '踢球', 'football practice']]), trip = chance(0.6);
    const P = (f) => (trip ? L(`${zh} ${f(t)} 出發，要坐 ${dur} 分鐘。幾點幾分會到？`, `The ${en} leaves at ${f(t)}. The trip takes ${dur} minutes. When does it arrive?`) : L(`${p.n} ${f(t)} 開始${zh2}，${dur} 分鐘後結束。幾點幾分結束？`, `${p.n} starts ${en2} at ${f(t)}. It takes ${dur} minutes. When does ${p.he} finish?`));
    const F = (f) => L(`${f(t)} 再過 ${dur} 分鐘是 ${f(R)}`, `${dur} minutes after ${f(t)} is ${f(R)}`);
    const wrong = uniq([t - dur, cross ? R - 60 : R + 60, ...shuffle([R + 10, R - 10, t + 60])].filter((x) => x !== R && x !== t)).slice(0, 3).map(ts);
    return Q.pick({ p: P(ts), say: P(tsay), scene: row(emo(trip ? e : e2, 110), clk(t, 210), label(`+ ${dur} ${L('分鐘', 'min')}`)), right: ts(R), wrong,
      hint: cross ? L('先走到整點，再加上剩下的分鐘。', 'Go to the next hour first. Then add the minutes left.') : L('把分鐘加起來，幾點不變。', 'Add the minutes. The hour stays the same.'), full: F(ts), fullSay: F(tsay) });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '6、7、8、9 的乘法', '6, 7, 8 and 9 times tables', (d) => {
    const a = rnd(6, 9), b = d ? rnd(2, 9) : rnd(1, 5);
    return calc(chance(0.5) ? `${a} × ${b} = □` : `${b} × ${a} = □`, a * b, { hint: L(`背背看 ${a} 的乘法表。`, `Say the ${a} times table.`) });
  }, true),
  def(T.bonus, '幾倍', 'Times as many', (d) => {
    const [A, B] = who2(), it = thing([...FOODS, ...TOYS]), k = rnd(2, d ? 9 : 5), b = rnd(2, d ? 9 : 5), n = k * b, full = L(`${b} × ${k} = ${n}`, `${k} × ${b} = ${n}`);
    if (d === 2 && chance(0.3)) return Q.num({ p: L(`${B.n}有 ${b} ${it.m}${it.zh}，${A.n}有 ${n} ${it.m}。${A.n}的${it.zh}是${B.n}的幾倍？`, `${B.n} has ${b} ${it.ens}. ${A.n} has ${n} ${it.ens}. ${A.n} has □ times as many ${it.ens} as ${B.n}.`),
      say: L(`${B.n}有 ${b} ${it.m}${it.zh}，${A.n}有 ${n} ${it.m}。${A.n}的${it.zh}是${B.n}的幾倍？`, `${B.n} has ${b} ${it.ens}. ${A.n} has ${n} ${it.ens}. How many times as many ${it.ens} does ${A.n} have?`),
      scene: timesBar(B.n, A.n, k, b, n), ans: k, lo: 1, hi: 10, unit: L('倍', ''), hint: L(`${b} 乘以多少是 ${n}？`, `${b} times what number is ${n}?`), full });
    return Q.num({ p: L(`${B.n}有 ${b} ${it.m}${it.zh}。${A.n}的${it.zh}是${B.n}的 ${k} 倍。${A.n}有幾${it.m}？`, `${A.n} has ${k} times as many ${it.ens} as ${B.n}. ${B.n} has ${b}. How many does ${A.n} have?`),
      scene: timesBar(B.n, A.n, k, b, '?'), ans: n, lo: 2, hi: n + 6, unit: L(it.m, ''), hint: L(`${k} 倍就是 ${k} 個 ${b}。`, `${k} times as many means ${k} groups of ${b}.`), full });
  }, true),
];
