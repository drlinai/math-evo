// 小一下 LV3（新加坡 P1 Term 3）：39 種題型。加減法擴到 100（開始用直式）、用公分量長度、乘法的「幾組幾個」。
// 每個題型只是「概念」：數字、東西、人名、顏色每次都隨機換。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, distinct, thing, cnt, who, who2, THINGS, ANIMALS, FOODS } from './core.js?v=23';
import { items, groups, array, row, col, fig, label, pic, seq, bigEq, vsum, blocks, ruler, bars, tallBars, modelPW, modelCmp, svg, COLORS, cname } from './vis.js?v=23';

const T = { add: ['100 以內的加法', 'Addition within 100', '➕'], sub: ['100 以內的減法', 'Subtraction within 100', '➖'], len: ['長度', 'Length', '📏'], mul: ['乘法', 'Multiplication', '✖️'], bonus: ['加分題', 'Bonus', '⭐'] };
const CK = Object.keys(COLORS), INK = '#2b2140';
const U = () => L('公分', 'cm');
const f = (v) => Math.round(v * 10) / 10;
const tx = (x, y, s, size = 22, o = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" font-weight="900" text-anchor="middle" fill="${INK}" ${o}>${s}</text>`;
const fill = (n, v) => Array(n).fill(v);

// ---------- 產生數字 ----------
// 兩位數 + 兩位數：carry 要不要進位；和不超過 max（個位都不是 0）
function addends(carry, max = 99) { let a, b; do { a = rnd(11, max - 11); b = rnd(11, max - a); } while (((a % 10) + (b % 10) >= 10) !== carry || a % 10 === 0 || b % 10 === 0); return [a, b]; }
// 兩位數 − 兩位數：borrow 要不要退位；被減數不超過 max
function minus(borrow, max = 99) { let a, b; do { a = rnd(22, max); b = rnd(11, a - 1); } while ((a % 10 < b % 10) !== borrow || b % 10 === 0 || (!borrow && a % 10 === 0)); return [a, b]; }
// 四個選項：一定包含答案和「常見的錯誤答案」traps，其他用附近的數補滿
const near = (ans, traps, lo, hi) => { const s = new Set([ans, ...traps.filter((v) => v >= lo && v <= hi)]); for (const k of [1, -1, 2, -2, 3, -3, 4, -4]) { if (s.size >= 4) break; if (ans + k >= lo && ans + k <= hi) s.add(ans + k); } return [...s].slice(0, 4); };

// ---------- 應用題的東西 ----------
const STUFF = [{ zh: '郵票', m: '張', en: 'stamp', ens: 'stamps' }, { zh: '貼紙', m: '張', en: 'sticker', ens: 'stickers' }, { zh: '彈珠', m: '顆', en: 'marble', ens: 'marbles' }, { zh: '貝殼', m: '個', en: 'shell', ens: 'shells' },
  { zh: '卡片', m: '張', en: 'card', ens: 'cards' }, { zh: '珠子', m: '顆', en: 'bead', ens: 'beads' }, { zh: '鈕扣', m: '顆', en: 'button', ens: 'buttons' }, { zh: '書', m: '本', en: 'book', ens: 'books' }];
const stuff = () => (chance(0.6) ? pick(STUFF) : thing(['star', 'candy', 'cookie', 'car', 'balloon', 'pencil', 'egg', 'apple']));
const CATS = [[['apple', 'banana'], '水果', '個', 'fruits'], [ANIMALS, '動物', '隻', 'animals'], [['car', 'teddy', 'balloon'], '玩具', '個', 'toys'], [['cookie', 'cupcake', 'candy', 'lollipop'], '點心', '個', 'treats']];
// 可以量長度的東西：[中文, 英文, 最短, 最長]（公分）
const OBJS = [['鈕扣', 'button', 1, 2], ['鉛筆', 'pencil', 10, 15], ['原子筆', 'pen', 11, 15], ['蠟筆', 'crayon', 6, 9], ['橡皮擦', 'eraser', 3, 5], ['鑰匙', 'key', 4, 7], ['迴紋針', 'paper clip', 2, 4],
  ['湯匙', 'spoon', 12, 15], ['膠水', 'glue stick', 7, 10], ['葉子', 'leaf', 5, 10], ['吸管', 'straw', 12, 15], ['梳子', 'comb', 10, 14], ['羽毛', 'feather', 6, 12]];

// ---------- 這個年級自己的圖 ----------
// 算式題的題目區：第一次碰到（d = 0）時在算式上面擺積木；b 不傳就只擺 a
const eqScene = (d, eq, a, b) => (d ? bigEq(eq) : col(b ? row(blocks(a, 1.5), label('+', 'big'), blocks(b, 1.5)) : blocks(a, 1.5), bigEq(eq, 'xs')));
// 直式，可以標出進位／退位：mark 'carry' 在十位上面寫小 1；'borrow' 把被減數劃掉，上面寫退位後的數
function vform(a, b, op, mark) {
  const td = (ch, top = '', cut = false) => `<td style="position:relative;width:.9em">${top === '' ? '' : `<small style="position:absolute;left:0;right:0;top:-.72em;font-size:.36em;line-height:1;color:#e8483f">${top}</small>`}${cut ? `<s style="text-decoration-color:#e8483f;text-decoration-thickness:.08em">${ch}</s>` : ch}</td>`;
  const A = String(a).split(''), B = String(b).split(''), cut = mark === 'borrow', top = mark === 'carry' ? ['1', ''] : cut ? [A[0] - 1, `1${A[1]}`] : ['', ''];
  return `<table class="vsum" style="font-size:70px;margin-top:22px"><tr>${td('')}${td(A[0], top[0], cut)}${td(A[1], top[1], cut)}</tr><tr>${td(op)}${td(B[0])}${td(B[1])}</tr><tr class="line"><td colspan="3"></td></tr><tr><td colspan="3"><span class="nqm">?</span></td></tr></table>`;
}
// 一盤一盤的東西：counts 每盤幾個；s 每個東西的大小；maxW 超過就換行
const plates = (counts, key, s = 42, maxW = 900) => `<div class="vrow wrap" style="gap:8px 10px;max-width:${maxW}px">${counts.map((n) => `<div class="plate2" style="display:grid;grid-template-columns:repeat(${n <= 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : 5},${s}px);gap:2px;${s > 30 ? '' : 'padding:5px;border-width:3px;border-radius:12px'}">${pic(key, s).repeat(n)}</div>`).join('')}</div>`;
// 有名字、有長度的橫條：list = [{ t 左邊的名字, len 長度, c 顏色, v 右邊的字 }]；max 最長的刻度
function lenBars(list, max) {
  const lw = list.some((b) => b.t) ? 130 : 0, k = 500 / max, h = 44, gap = 18;
  return svg(lw + 640, list.length * (h + gap) - gap + 4, list.map((b, i) => { const y = i * (h + gap) + 2, w = b.len * k; return `${b.t ? tx(lw / 2, y + h / 2 + 7, b.t, 20) : ''}<rect x="${lw + 4}" y="${y}" width="${f(w)}" height="${h}" rx="8" fill="${b.c}" stroke="${INK}" stroke-width="4"/>${tx(lw + w + 64, y + h / 2 + 9, b.v, 24)}`; }).join(''));
}
// 尺上面有幾條線（都從 0 開始）：lines = [{ len, c }]
function rulerLines(max, lines) {
  const w = 880, k = (w - 100) / max, x = (v) => 30 + v * k, top = lines.length * 32 + 8;
  let s = `<rect x="6" y="${top}" width="${w - 12}" height="62" rx="8" fill="#ffe9a8" stroke="${INK}" stroke-width="4"/>`;
  for (let v = 0; v <= max; v++) s += `<line x1="${f(x(v))}" y1="4" x2="${f(x(v))}" y2="${top}" stroke="${INK}" stroke-width="2" opacity=".13"/><line x1="${f(x(v))}" y1="${top}" x2="${f(x(v))}" y2="${top + (v % 5 ? 18 : 26)}" stroke="${INK}" stroke-width="3"/>${tx(x(v), top + 50, v, 20)}`;
  lines.forEach((ln, i) => { s += `<rect x="${f(x(0))}" y="${10 + i * 32}" width="${f(ln.len * k)}" height="16" fill="${ln.c}" stroke="${INK}" stroke-width="3"/>`; });
  return svg(w, top + 68, s + tx(w - 36, top + 40, 'cm', 20, 'opacity=".6"'));
}
// 用小東西一個接一個量：上面是要量的東西（n 個單位長、顏色 c、表情符號 e），下面排 total 個 unit（clip block coin eraser）
function unitRow(n, total, c, e, unit) {
  const u = 66, x0 = 12, y = 92;
  const one = { clip: (x) => `<rect x="${x + 3}" y="${y + 8}" width="${u - 6}" height="36" rx="18" fill="none" stroke="#5b6f8c" stroke-width="5"/><rect x="${x + 14}" y="${y + 17}" width="${u - 24}" height="18" rx="9" fill="none" stroke="#5b6f8c" stroke-width="5"/>`,
    block: (x) => `<rect x="${x + 2}" y="${y}" width="${u - 4}" height="52" rx="8" fill="#ffd43a" stroke="${INK}" stroke-width="5"/>`,
    coin: (x) => `<circle cx="${x + u / 2}" cy="${y + 31}" r="${u / 2 - 3}" fill="#f2c94c" stroke="${INK}" stroke-width="5"/><circle cx="${x + u / 2}" cy="${y + 31}" r="${u / 2 - 13}" fill="none" stroke="${INK}" stroke-width="3" opacity=".35"/>`,
    eraser: (x) => `<rect x="${x + 2}" y="${y + 6}" width="${u - 4}" height="42" rx="8" fill="#ff9fc0" stroke="${INK}" stroke-width="5"/><rect x="${x + 20}" y="${y + 6}" width="${u - 40}" height="42" fill="#7fb4ff" stroke="${INK}" stroke-width="4"/>` }[unit];
  const guide = (x) => `<line x1="${x}" y1="2" x2="${x}" y2="160" stroke="${INK}" stroke-width="3" stroke-dasharray="7 7" opacity=".4"/>`;
  return svg(x0 * 2 + total * u, 164, `<rect x="${x0}" y="14" width="${n * u}" height="54" rx="10" fill="${c}" stroke="${INK}" stroke-width="5"/><text x="${x0 + (n * u) / 2}" y="54" font-size="36" text-anchor="middle">${e}</text>${range(0, total - 1).map((i) => one(x0 + i * u)).join('')}${guide(x0)}${guide(x0 + n * u)}`);
}
// 用繩子間接比較：左邊把繩子剪得和第一個東西（長 a）一樣長，右邊把同一條繩子拿去比第二個東西（長 b）
function stringCmp(a, b, ca, cb, na, nb) {
  const k = 34, panel = (x0, len, c, name) => `<text x="${x0 + 16}" y="26" font-size="22" font-weight="900" fill="${INK}">${name}</text><rect x="${x0 + 16}" y="38" width="${len * k}" height="54" rx="8" fill="${c}" stroke="${INK}" stroke-width="5"/><line x1="${x0 + 16}" y1="122" x2="${x0 + 16 + a * k}" y2="122" stroke="#b5651d" stroke-width="8" stroke-linecap="round"/><circle cx="${x0 + 16}" cy="122" r="8" fill="#b5651d" stroke="${INK}" stroke-width="3"/><circle cx="${x0 + 16 + a * k}" cy="122" r="8" fill="#b5651d" stroke="${INK}" stroke-width="3"/>${tx(x0 + 16 + (a * k) / 2, 154, L('繩子', 'string'), 18, 'opacity=".7"')}`;
  return svg(830, 160, `${panel(0, a, ca, na)}<line x1="408" y1="6" x2="408" y2="154" stroke="${INK}" stroke-width="4" stroke-dasharray="8 8" opacity=".35"/>${panel(424, b, cb, nb)}`);
}

export default [
  // ---- 100 以內的加法 ----
  def(T.add, '整十相加', 'Adding tens', (d) => {
    const t = rnd(2, d ? 10 : 6), a = rnd(1, t - 1) * 10, b = t * 10 - a;
    return Q.num({ p: L(`${a} + ${b} 是多少？`, `What is ${a} + ${b}?`), scene: eqScene(d, `${a} + ${b} = □`, a, b), ans: t * 10, ...(t === 2 && { opts: [10, 20, 30, 40] }),
      hint: L(`${a / 10} 個十加 ${b / 10} 個十，是幾個十？`, `${a / 10} ${pl(a / 10, 'ten', 'tens')} and ${b / 10} ${pl(b / 10, 'ten', 'tens')} make how many tens?`), full: `${a} + ${b} = ${t * 10}` });
  }),
  def(T.add, '兩位數加一位數', 'Add ones (no regrouping)', (d) => {
    const u = rnd(1, 8), a = rnd(2, d ? 9 : 5) * 10 + u, b = rnd(1, 9 - u);
    return Q.num({ p: L(`${a} + ${b} 是多少？`, `What is ${a} + ${b}?`), scene: eqScene(d, `${a} + ${b} = □`, a, b), ans: a + b, lo: 20, hi: 99,
      hint: L('十位不變，只要把個位加起來。', 'The tens stay the same. Just add the ones.'), full: `${a} + ${b} = ${a + b}` });
  }),
  def(T.add, '兩位數加整十', 'Add tens to a number', (d) => {
    const t = rnd(1, d ? 8 : 4), a = t * 10 + rnd(1, 9), b = rnd(1, (d ? 9 : 6) - t) * 10;
    return Q.num({ p: L(`${a} + ${b} 是多少？`, `What is ${a} + ${b}?`), scene: eqScene(d, `${a} + ${b} = □`, a, b), ans: a + b, lo: 20, hi: 99,
      hint: L('個位不變，只要把十位加起來。', 'The ones stay the same. Just add the tens.'), full: `${a} + ${b} = ${a + b}` });
  }),
  def(T.add, '加一位數進位', 'Add ones with regrouping', (d) => {
    const u = rnd(2, 9), a = rnd(1, d ? 8 : 4) * 10 + u, b = rnd(11 - u, 9), need = 10 - u;
    return Q.num({ p: L(`${a} + ${b} 是多少？`, `What is ${a} + ${b}?`), scene: eqScene(d, `${a} + ${b} = □`, a, b), ans: a + b, lo: 20, hi: 99,
      hint: L(`先把 ${a} 湊成 ${a + need}，再加剩下的 ${b - need}。`, `Make a ten first: ${a} and ${need} make ${a + need}. Then add ${b - need} more.`), full: `${a} + ${b} = ${a + b}` });
  }),
  def(T.add, '兩位數相加', 'Add two 2-digit numbers', (d) => {
    const [a, b] = addends(false, d ? 99 : 60);
    return Q.num({ p: L(`${a} + ${b} 是多少？`, `What is ${a} + ${b}?`), scene: d ? vsum(a, b, '+') : row(vsum(a, b, '+'), col(blocks(a, 1.25), blocks(b, 1.25))), ans: a + b, lo: 20, hi: 99,
      hint: L('先加個位，再加十位。', 'Add the ones first, then add the tens.'), full: `${a} + ${b} = ${a + b}` });
  }),
  def(T.add, '兩位數相加進位', 'Add with regrouping', (d) => {
    const [a, b] = addends(true, d === 2 ? 100 : d ? 99 : 60);
    return Q.num({ p: L(`${a} + ${b} 是多少？`, `What is ${a} + ${b}?`), scene: vform(a, b, '+', 'carry'), ans: a + b, lo: 20, hi: 100,
      hint: L('個位加起來滿 10，就進 1 到十位。', 'When the ones make 10 or more, carry 1 ten to the tens.'), full: `${a} + ${b} = ${a + b}` });
  }),
  def(T.add, '缺位數', 'Missing digit', (d) => {
    const [a, b] = addends(d ? chance(0.5) : false), s = a + b, at = rnd(0, 1), n = [a, b][at], o = [b, a][at], tens = chance(0.4), ans = tens ? Math.floor(n / 10) : n % 10;
    const box = '<span class="nqm" style="font-size:.7em;min-width:.95em">?</span>', hole = `<span style="display:inline-flex;align-items:center;gap:.05em">${tens ? box + (n % 10) : Math.floor(n / 10) + box}</span>`;
    const part = (x, i) => (i === at ? hole : `<span>${x}</span>`);
    return Q.num({ p: L('格子裡少了哪一個數字？', 'Which digit is missing?'), scene: `<div class="numq sm">${part(a, 0)}<span class="nop">+</span>${part(b, 1)}<span class="nop">=</span><span>${s}</span></div>`, ans, lo: 0, hi: 9,
      hint: tens ? L('先算個位，看看有沒有進位，再想十位。', 'Add the ones first. Is there a ten to carry? Then think about the tens.') : L(`看個位：${o % 10} 加多少，個位會是 ${s % 10}？`, `Look at the ones. ${o % 10} plus what number ends in ${s % 10}?`), full: `${a} + ${b} = ${s}` });
  }),
  def(T.add, '三個一位數相加', 'Add three numbers', (d) => {
    const x = rnd(1, 9), [a, b, c] = d ? [rnd(1, 9), rnd(1, 9), rnd(1, 9)] : shuffle([x, 10 - x, rnd(1, 9)]), s = a + b + c, ten = a + b === 10 || a + c === 10 || b + c === 10;
    return Q.num({ p: L(`${a} + ${b} + ${c} 是多少？`, `What is ${a} + ${b} + ${c}?`), scene: bigEq(`${a} + ${b} + ${c} = □`), ans: s, lo: 3, hi: 27,
      hint: ten ? L('先找兩個數湊成 10，再加第三個。', 'Find two numbers that make 10 first. Then add the third.') : L('先加前面兩個，再加第三個。', 'Add the first two numbers. Then add the third.'), full: `${a} + ${b} + ${c} = ${s}` });
  }),
  def(T.add, '加法應用題', 'Addition word problems', (d) => {
    const [a, b] = addends(d ? chance(0.6) : false, d ? 100 : 60), kind = rnd(0, 2), it = stuff(), [A, B] = who2(), model = modelPW([{ t: a, v: a }, { t: b, v: b }], '?');
    let p, scene = model;
    if (kind === 0) {
      const [keys, zh, m, en] = pick(CATS), [x, y] = sample(keys, 2).map((k) => ({ k, ...THINGS[k] }));
      p = L(`有 ${cnt(a, x)}和 ${cnt(b, y)}。一共有幾${m}${zh}？`, `There are ${cnt(a, x)} and ${cnt(b, y)}. How many ${en} are there altogether?`); scene = row(pic(x.k, 90), model, pic(y.k, 90));
    } else if (kind === 1) p = L(`${A.n}有 ${cnt(a, it)}，${B.n}有 ${b} ${it.m}。兩個人一共有幾${it.m}？`, `${A.n} has ${cnt(a, it)}. ${B.n} has ${cnt(b, it)}. How many ${it.ens} do they have altogether?`);
    else p = L(`${A.n}有 ${cnt(a, it)}，又拿到 ${b} ${it.m}。現在一共有幾${it.m}？`, `${A.n} has ${cnt(a, it)}. ${A.He} gets ${b} more. How many ${it.ens} does ${A.he} have now?`);
    return Q.num({ p, scene, ans: a + b, hint: L('合起來，用加法。', 'Put them together. Add.'), full: `${a} + ${b} = ${a + b}` });
  }),
  // ---- 100 以內的減法 ----
  def(T.sub, '整十相減', 'Subtracting tens', (d) => {
    const a = rnd(2, d === 2 ? 10 : d ? 9 : 6) * 10, b = rnd(1, a / 10 - 1) * 10;
    return Q.num({ p: L(`${a} − ${b} 是多少？`, `What is ${a} − ${b}?`), scene: eqScene(d, `${a} − ${b} = □`, a), ans: a - b, ...(a - b <= 20 && { opts: [10, 20, 30, 40] }),
      hint: L(`${a / 10} 個十拿走 ${b / 10} 個十，還有幾個十？`, `${a / 10} tens take away ${b / 10} ${pl(b / 10, 'ten', 'tens')}. How many tens are left?`), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '兩位數減一位數', 'Subtract ones (no regrouping)', (d) => {
    const u = rnd(2, 9), a = rnd(2, d ? 9 : 5) * 10 + u, b = rnd(1, u);
    return Q.num({ p: L(`${a} − ${b} 是多少？`, `What is ${a} − ${b}?`), scene: eqScene(d, `${a} − ${b} = □`, a), ans: a - b, lo: 10, hi: 99,
      hint: L('十位不變，只要減個位。', 'The tens stay the same. Just subtract the ones.'), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '兩位數減整十', 'Subtract tens from a number', (d) => {
    const t = rnd(2, d ? 9 : 5), a = t * 10 + rnd(1, 9), b = rnd(1, t) * 10;
    return Q.num({ p: L(`${a} − ${b} 是多少？`, `What is ${a} − ${b}?`), scene: eqScene(d, `${a} − ${b} = □`, a), ans: a - b, lo: Math.max(1, a - b - 9), hi: 99,
      hint: L('個位不變，只要減十位。', 'The ones stay the same. Just subtract the tens.'), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '減一位數退位', 'Subtract ones with regrouping', (d) => {
    const u = rnd(d ? 0 : 1, 8), a = rnd(2, d ? 9 : 5) * 10 + u, b = rnd(u + 1, 9);
    return Q.num({ p: L(`${a} − ${b} 是多少？`, `What is ${a} − ${b}?`), scene: eqScene(d, `${a} − ${b} = □`, a), ans: a - b, lo: 10, hi: 99,
      hint: u ? L(`先減 ${u} 變成 ${a - u}，再減剩下的 ${b - u}。`, `Subtract ${u} first to get ${a - u}. Then subtract ${b - u} more.`) : L(`把一個十拆開：10 − ${b} 是多少？`, `Break up one ten. What is 10 − ${b}?`), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '兩位數相減', 'Subtract two 2-digit numbers', (d) => {
    const [a, b] = minus(false, d ? 99 : 60);
    return Q.num({ p: L(`${a} − ${b} 是多少？`, `What is ${a} − ${b}?`), scene: d ? vsum(a, b, '−') : row(vsum(a, b, '−'), blocks(a, 2)), ans: a - b, lo: Math.max(1, a - b - 9), hi: 99,
      hint: L('先減個位，再減十位。', 'Subtract the ones first, then subtract the tens.'), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '兩位數相減退位', 'Subtract with regrouping', (d) => {
    const [a, b] = minus(true, d ? 99 : 60);
    return Q.num({ p: L(`${a} − ${b} 是多少？`, `What is ${a} − ${b}?`), scene: vform(a, b, '−', 'borrow'), ans: a - b, lo: Math.max(1, a - b - 9), hi: 99,
      hint: L('個位不夠減，向十位借 1 個十，換成 10 個一。', 'Not enough ones? Change 1 ten into 10 ones.'), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '用加法驗算', 'Check with addition', (d) => {
    const [a, b] = minus(true, d ? 99 : 60), c = a - b;
    return Q.num({ p: L(`${a} − ${b} = ${c}。用加法驗算：${c} + ${b} = □`, `${a} − ${b} = ${c}. Check: ${c} + ${b} = □`), scene: col(bigEq(`${a} − ${b} = ${c}`, 'tiny'), bigEq(`${c} + ${b} = □`, 'sm')), ans: a, lo: 20, hi: 99,
      hint: L('把減掉的數加回去，會變回原來的數。', 'Add back what you took away. You get the number you started with.'), full: `${c} + ${b} = ${a}` });
  }),
  def(T.sub, '比較應用題', 'How many more? How many fewer?', (d) => {
    let a, b; do { [a, b] = minus(d ? chance(0.6) : false, d ? 99 : 60); } while (a - b < 3);
    const [A, B] = who2(), it = stuff(), more = chance(0.5), flip = chance(0.5);
    const s1 = L(`${A.n}有 ${cnt(a, it)}`, `${A.n} has ${cnt(a, it)}.`), s2 = L(`${B.n}有 ${cnt(b, it)}`, `${B.n} has ${cnt(b, it)}.`), ra = { name: A.n, v: a, t: a }, rb = { name: B.n, v: b, t: b };
    const ask = more ? L(`${A.n}比${B.n}多幾${it.m}？`, `How many more ${it.ens} does ${A.n} have?`) : L(`${B.n}比${A.n}少幾${it.m}？`, `How many fewer ${it.ens} does ${B.n} have?`);
    return Q.num({ p: L(`${flip ? s2 : s1}，${flip ? s1 : s2}。${ask}`, `${flip ? s2 : s1} ${flip ? s1 : s2} ${ask}`), scene: modelCmp(flip ? [rb, ra] : [ra, rb], '?'), ans: a - b, lo: Math.max(1, a - b - 9), hi: 99,
      hint: L('比多少，用大的數減小的數。', 'To compare, subtract the smaller number from the bigger number.'), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '選加或減', 'Add or subtract?', (d) => {
    const kind = pick(['join', 'both', 'give', 'more']), add = kind === 'join' || kind === 'both', [a, b] = add ? addends(chance(0.5)) : minus(chance(0.5)), [A, B] = who2(), it = stuff();
    const story = { join: L(`${A.n}有 ${cnt(a, it)}，又拿到 ${b} ${it.m}。現在一共有幾${it.m}？`, `${A.n} has ${cnt(a, it)}. ${A.He} gets ${b} more. How many ${it.ens} does ${A.he} have now?`),
      both: L(`${A.n}有 ${cnt(a, it)}，${B.n}有 ${b} ${it.m}。兩個人一共有幾${it.m}？`, `${A.n} has ${cnt(a, it)}. ${B.n} has ${cnt(b, it)}. How many ${it.ens} do they have altogether?`),
      give: L(`${A.n}有 ${cnt(a, it)}，送給朋友 ${b} ${it.m}。還剩下幾${it.m}？`, `${A.n} has ${cnt(a, it)}. ${A.He} gives away ${b}. How many ${it.ens} are left?`),
      more: L(`${A.n}有 ${cnt(a, it)}，${B.n}有 ${b} ${it.m}。${A.n}比${B.n}多幾${it.m}？`, `${A.n} has ${cnt(a, it)}. ${B.n} has ${cnt(b, it)}. How many more ${it.ens} does ${A.n} have?`) }[kind];
    const opts = [L('加法 +', 'Add +'), L('減法 −', 'Subtract −')];
    return Q.pick({ p: L(`${story}要用加法還是減法？`, `${story} Do you add or subtract?`), scene: bigEq(`${a} ? ${b}`), right: opts[add ? 0 : 1], wrong: [opts[add ? 1 : 0]],
      hint: L('合起來、變多了用加法；拿走、比多少用減法。', 'Putting together or getting more: add. Taking away or comparing: subtract.'), full: add ? `${a} + ${b} = ${a + b}` : `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '心算四連發', 'Mental sums: ones and tens', (d) => {
    const t = rnd(2, 7), u = rnd(2, 7), n = t * 10 + u, k = rnd(1, Math.min(u, 9 - u, t, 9 - t)), [op, m] = pick([['+', k], ['+', k * 10], ['−', k], ['−', k * 10]]), ans = op === '+' ? n + m : n - m;
    return Q.num({ p: L(`心算：${n} ${op} ${m} 是多少？`, `Work it out in your head. What is ${n} ${op} ${m}?`), scene: bigEq(`${n} ${op} ${m} = □`), ans, lo: Math.max(1, ans - 9), hi: 99,
      hint: m < 10 ? L('十位不變，只算個位。', 'The tens stay the same. Just work on the ones.') : L('個位不變，只算十位。', 'The ones stay the same. Just work on the tens.'), full: `${n} ${op} ${m} = ${ans}` });
  }),
  // ---- 長度 ----
  def(T.len, '直接比長短', 'Longer, shorter, taller', (d) => {
    const mode = pick(['longer', 'shorter', 'taller', 'longest', 'shortest']), n = mode.endsWith('est') ? 3 : 2, lens = d ? distinct(n, 3, 10) : sample([3, 5, 7, 10], n), cs = sample(CK, n);
    const want = mode === 'shorter' || mode === 'shortest' ? Math.min(...lens) : Math.max(...lens), wi = lens.indexOf(want);
    const names = mode === 'taller' ? who2().map((x) => x.n) : sample([['鉛筆', 'pencil'], ['原子筆', 'pen'], ['蠟筆', 'crayon'], ['吸管', 'straw'], ['緞帶', 'ribbon'], ['繩子', 'rope'], ['樹枝', 'stick'], ['湯匙', 'spoon'], ['叉子', 'fork'], ['刷子', 'brush']], n).map(([zh, en]) => L(zh, en));
    const list = lens.map((len, i) => ({ len, c: COLORS[cs[i]].c, t: names[i] })), [x, y] = names, w = names[wi];
    const [p, full] = { longer: [L(`${x}和${y}，哪一個比較長？`, `Which is longer, the ${x} or the ${y}?`), L(`${w}比較長`, `The ${w} is longer`)], shorter: [L(`${x}和${y}，哪一個比較短？`, `Which is shorter, the ${x} or the ${y}?`), L(`${w}比較短`, `The ${w} is shorter`)],
      taller: [L(`${x}和${y}，誰比較高？`, `Who is taller, ${x} or ${y}?`), L(`${w}比較高`, `${w} is taller`)], longest: [L('哪一個最長？', 'Which is the longest?'), L(`${w}最長`, `The ${w} is the longest`)], shortest: [L('哪一個最短？', 'Which is the shortest?'), L(`${w}最短`, `The ${w} is the shortest`)] }[mode];
    return Q.pick({ p, scene: mode === 'taller' ? tallBars(list, { max: 10, h: 250, bw: 70, gap: 90 }) : bars(list, { max: 10, w: 640, h: 40, gap: 20 }), right: w, wrong: names.filter((_, i) => i !== wi), full });
  }),
  def(T.len, '排長短', 'Order by length', (d) => {
    const n = d ? 4 : 3, lens = sample(range(2, 10), n), cs = sample(CK, n), long = chance(0.3), [zh, m, en] = pick([['緞帶', '條', 'ribbons'], ['繩子', '條', 'ropes'], ['鉛筆', '枝', 'pencils'], ['吸管', '根', 'straws'], ['圍巾', '條', 'scarves']]);
    return Q.order({ p: long ? L(`把 ${n} ${m}${zh}由最長排到最短，照順序點。`, `Order the ${n} ${en} from longest to shortest.`) : L(`把 ${n} ${m}${zh}由最短排到最長，照順序點。`, `Order the ${n} ${en} from shortest to longest.`),
      items: lens.map((len, i) => [bars([{ len, c: COLORS[cs[i]].c }], { max: 10, w: n > 3 ? 190 : 250, h: 30 }), len]), desc: long, full: long ? L('最長 → 最短', 'longest → shortest') : L('最短 → 最長', 'shortest → longest') });
  }),
  def(T.len, '用尺量', 'Measure with a ruler', (d) => {
    const max = d ? 15 : 10, [zh, en, lo, hi] = pick(OBJS.filter((o) => o[2] <= max)), n = rnd(lo, Math.min(hi, max));
    return Q.num({ p: L(`${zh}有多長？是幾公分？`, `How long is the ${en}? □ cm`), say: L(`${zh}有多長？是幾公分？`, `How long is the ${en}? How many centimetres?`), scene: ruler(max, { from: 0, to: n, c: COLORS[pick(CK)].c }), ans: n, lo: 1, hi: max, unit: U(),
      hint: L('一頭對齊 0，看另一頭指到哪個數字。', 'One end is at 0. Read the number at the other end.'), full: L(`${zh}長 ${n} 公分`, `The ${en} is ${n} cm long`) });
  }),
  def(T.len, '尺不從 0 開始', 'Not starting from 0', (d) => {
    const from = rnd(1, d ? 6 : 3), n = rnd(2, d ? 9 : 5), to = from + n, [zh, en] = pick(OBJS.filter((o) => o[2] <= n && n <= o[3]));
    return Q.num({ p: L(`${zh}的一頭在 ${from}，另一頭在 ${to}。它有多長？`, `The ${en} starts at ${from} and ends at ${to}. How long is it?`), scene: ruler(15, { from, to, c: COLORS[pick(CK)].c }), ans: n, opts: near(n, [to, from], 1, 15), unit: U(),
      hint: L(`不是從 0 開始喔！從 ${from} 數到 ${to}，一共跳了幾格？`, `It does not start at 0! Count the jumps from ${from} to ${to}.`), full: L(`${to} − ${from} = ${n}（公分）`, `${to} − ${from} = ${n} (cm)`) });
  }),
  def(T.len, '比較公分', 'Compare lengths in cm', (d) => {
    const n = d && chance(0.5) ? 3 : 2, cs = sample(CK, n), longer = chance(0.5);
    let objs; do { objs = sample(OBJS, n).map(([zh, en, lo, hi]) => ({ t: L(zh, en), len: rnd(lo, hi) })); } while (new Set(objs.map((o) => o.len)).size < n);
    const [x, y] = sample(objs, 2), big = x.len > y.len ? x : y, small = x.len > y.len ? y : x, ans = big.len - small.len;
    const tell = L(`${objs[0].t}長 ${objs[0].len} 公分，${objs[1].t}長 ${objs[1].len} 公分。`, `The ${objs[0].t} is ${objs[0].len} cm. The ${objs[1].t} is ${objs[1].len} cm. `);
    const ask = n === 2 ? (longer ? L(`${big.t}比${small.t}長幾公分？`, `How much longer is the ${big.t}?`) : L(`${small.t}比${big.t}短幾公分？`, `How much shorter is the ${small.t}?`))
      : (longer ? L(`看圖，${big.t}比${small.t}長幾公分？`, `Look at the picture. How much longer is the ${big.t} than the ${small.t}?`) : L(`看圖，${small.t}比${big.t}短幾公分？`, `Look at the picture. How much shorter is the ${small.t} than the ${big.t}?`));
    return Q.num({ p: (n === 2 ? tell : '') + ask, scene: lenBars(objs.map((o, i) => ({ t: o.t, len: o.len, c: COLORS[cs[i]].c, v: `${o.len} ${U()}` })), 15), ans, lo: 1, hi: 15, unit: U(),
      hint: L('長的減短的，就知道差幾公分。', 'Subtract the shorter length from the longer length.'), full: `${big.len} − ${small.len} = ${ans}` });
  }),
  def(T.len, '畫線段', 'Lines of a given length', (d) => {
    const max = d ? 15 : 10, n = rnd(d ? 1 : 2, max), cs = sample(CK, 3), lens = shuffle([n, ...sample([n - 2, n - 1, n + 1, n + 2].filter((v) => v >= 1 && v <= max), 2)]), ci = lens.indexOf(n);
    const opt = (c) => `<span class="vcol" style="gap:6px"><span style="display:block;width:96px;height:18px;background:${COLORS[c].c};border:4px solid ${INK}"></span>${cname(c)}</span>`;
    return Q.pick({ p: L(`哪一條線剛好是 ${n} 公分長？`, `Which line is ${n} cm long?`), scene: rulerLines(max, lens.map((len, i) => ({ len, c: COLORS[cs[i]].c }))), right: opt(cs[ci]), wrong: cs.filter((_, i) => i !== ci).map(opt),
      hint: L('每條線都從 0 開始，看線的尾巴對到哪個數字。', 'Every line starts at 0. Look at the number where each line ends.'), full: L(`${cname(cs[ci])}的線是 ${n} 公分`, `The ${cname(cs[ci])} line is ${n} cm long`) });
  }),
  def(T.len, '估計', 'Estimate length', (d) => {
    const [e, zh, en, v] = pick([['🐜', '一隻螞蟻', 'an ant', 1], ['🐞', '一隻瓢蟲', 'a ladybird', 1], ['🐝', '一隻蜜蜂', 'a bee', 1], ['🍚', '一粒米', 'a grain of rice', 1],
      ['✋', '你的手掌', 'your hand', 10], ['🖍️', '一枝蠟筆', 'a crayon', 10], ['🥄', '一根湯匙', 'a spoon', 10], ['📱', '一支手機', 'a mobile phone', 10], ['🥕', '一根紅蘿蔔', 'a carrot', 10],
      ['🎸', '一把吉他', 'a guitar', 100], ['☂️', '一把長雨傘', 'a long umbrella', 100], ['🧹', '一支掃把', 'a broom', 100], ['🏏', '一支球棒', 'a cricket bat', 100]]);
    return Q.pick({ p: L(`${zh}大約有多長？是 1 公分、10 公分，還是 100 公分？`, `About how long is ${en}: 1 cm, 10 cm or 100 cm?`), scene: `<span class="emo" style="font-size:${v === 1 ? 70 : v === 10 ? 130 : 200}px">${e}</span>`, right: `${v} ${U()}`, wrong: [1, 10, 100].filter((x) => x !== v).map((x) => `${x} ${U()}`),
      hint: L('1 公分大約是指甲的寬度；100 公分大約是你張開雙手那麼長。', '1 cm is about as wide as your fingernail. 100 cm is about as long as your arms spread wide.'), full: L(`${zh}大約 ${v} 公分長`, `${en[0].toUpperCase()}${en.slice(1)} is about ${v} cm long`) });
  }),
  def(T.len, '長度應用題', 'Length word problems', (d) => {
    const kind = pick(['longer', 'shorter', 'cut', 'join']), add = kind === 'longer' || kind === 'join', [a, b] = add ? addends(d ? chance(0.6) : false, d ? 100 : 60) : minus(d ? chance(0.6) : false, d ? 99 : 60), ans = add ? a + b : a - b;
    const [c1, c2] = sample(CK, 2), A = who(), [zh, m, en] = pick([['繩子', '條', 'string'], ['緞帶', '條', 'ribbon'], ['紙條', '張', 'paper strip'], ['棍子', '根', 'stick'], ['膠帶', '段', 'tape']]), cm = (v) => `${v} ${U()}`;
    const cmp = () => lenBars([{ len: a, c: COLORS[c1].c, v: cm(a) }, { len: ans, c: COLORS[c2].c, v: '?' }], Math.max(a, ans));
    const [p, scene] = { longer: [L(`${cname(c1)}${zh}長 ${a} 公分，${cname(c2)}${zh}比它長 ${b} 公分。${cname(c2)}${zh}有多長？`, `The ${cname(c1)} ${en} is ${a} cm long. The ${cname(c2)} ${en} is ${b} cm longer. How long is the ${cname(c2)} ${en}?`), cmp],
      shorter: [L(`${cname(c1)}${zh}長 ${a} 公分，${cname(c2)}${zh}比它短 ${b} 公分。${cname(c2)}${zh}有多長？`, `The ${cname(c1)} ${en} is ${a} cm long. The ${cname(c2)} ${en} is ${b} cm shorter. How long is the ${cname(c2)} ${en}?`), cmp],
      cut: [L(`${A.n}有一${m} ${a} 公分長的${zh}，剪掉 ${b} 公分。還剩下多長？`, `${A.n} has a ${en} ${a} cm long. ${A.He} cuts off ${b} cm. How long is the ${en} now?`), () => modelPW([{ t: '?', v: ans }, { t: b, v: b }], cm(a))],
      join: [L(`一${m}${zh}長 ${a} 公分，另一${m}長 ${b} 公分。接起來一共多長？`, `One ${en} is ${a} cm long. Another ${en} is ${b} cm long. What is their total length?`), () => modelPW([{ t: a, v: a }, { t: b, v: b }], '?')] }[kind];
    return Q.num({ p, scene: scene(), ans, lo: Math.max(1, ans - 9), hi: 100, unit: U(), full: `${a} ${add ? '+' : '−'} ${b} = ${ans}` });
  }),
  // ---- 乘法 ----
  def(T.mul, '是不是等組', 'Equal groups?', (d) => {
    const it = thing(), g = rnd(2, d ? 5 : 4), e = rnd(2, d ? 6 : 4), eq = chance(0.5), counts = fill(g, e);
    if (!eq) counts[rnd(0, g - 1)] += e > 2 && chance(0.5) ? -1 : 1;
    return Q.yn({ p: L(`每一組的${it.zh}都一樣多嗎？`, 'Are the groups equal?'), scene: plates(counts, it.k), ans: eq, yes: L('一樣多', 'Yes'), no: L('不一樣', 'No'),
      hint: L('數數看，每一組各有幾個？', 'Count how many are in each group.'), full: eq ? L(`每組都是 ${e} ${it.m}，一樣多`, `Yes. Each group has ${e}.`) : L('有一組不一樣多', 'No. One group is different.') });
  }),
  def(T.mul, '幾組幾個', 'Groups of', (d) => {
    const it = thing(), g = rnd(2, d ? 5 : 4), e = rnd(2, d ? Math.min(10, Math.floor(40 / g)) : 5), askG = chance(0.5);
    return Q.num({ p: askG ? L(`有 □ 組，每組 ${e} ${it.m}。`, `There are □ groups of ${e}.`) : L(`有 ${g} 組，每組 □ ${it.m}。`, `There are ${g} groups of □.`), scene: groups(g, e, it.k), ans: askG ? g : e, opts: near(askG ? g : e, [askG ? e : g], 1, 10),
      hint: askG ? L('一盤就是一組，數數看有幾盤。', 'Each plate is one group. Count the plates.') : L(`數其中一盤，看裡面有幾${it.m}。`, 'Count how many are on one plate.'), full: L(`${g} 組，每組 ${e} ${it.m}`, `${g} groups of ${e}`) });
  }),
  def(T.mul, '連加', 'Repeated addition', (d) => {
    const it = thing(), k = rnd(2, d ? 5 : 3), n = rnd(2, d ? Math.min(10, Math.floor(40 / k)) : 5), terms = fill(k, n).join(' + '), eq = bigEq(`${terms} = □`, terms.replace(/\s/g, '').length > 10 ? 'mini' : '');
    return Q.num({ p: L(`${terms} 是多少？`, `What is ${terms}?`), scene: d ? eq : col(plates(fill(k, n), it.k, 36), eq), ans: k * n, ...(k * n <= 20 && { opts: near(k * n, [n + k, k * n - n, k * n + n], 2, 40) }),
      hint: L(`${n} 個一數，數 ${k} 次。`, `Count in steps of ${n}, ${k} times.`), full: `${terms} = ${k * n}` });
  }),
  def(T.mul, '寫乘法算式', 'Multiplication sentences', (d) => {
    const it = thing(), g = rnd(2, d ? 5 : 3), e = rnd(2, d ? Math.min(10, Math.floor(40 / g)) : 5), ans = g * e;
    return Q.num({ p: L(`${g} 組，每組 ${e} ${it.m}：${g} × ${e} = □`, `${g} groups of ${e} = ${g} × ${e} = □`), scene: col(plates(fill(g, e), it.k, e > 6 ? 30 : 36), bigEq(`${g} × ${e} = □`, 'sm')), ans, ...(ans <= 20 && { opts: near(ans, [g + e, ans - e, ans + e], 2, 40) }),
      hint: L(`${e} 個一數，數 ${g} 次。`, `Count in steps of ${e}, ${g} times.`), full: `${g} × ${e} = ${ans}` });
  }),
  def(T.mul, '陣列', 'Arrays', (d) => {
    const it = thing(), r = rnd(2, d ? 5 : 3), c = pick(range(2, d ? Math.min(8, Math.floor(40 / r)) : 5).filter((v) => v !== r)), ask = pick(d ? ['r', 'c', 't'] : ['r', 'c']), scene = array(r, c, it.k);
    if (ask === 't') return Q.num({ p: L(`${r} 排，每排 ${c} ${it.m}。一共有幾${it.m}${it.zh}？`, `There are ${r} rows of ${c}. How many ${it.ens} are there altogether?`), scene, ans: r * c, ...(r * c <= 20 && { opts: near(r * c, [r + c, r * c - c, r * c + c], 2, 40) }), count: '.it', full: `${r} × ${c} = ${r * c}` });
    return Q.num({ p: ask === 'r' ? L(`${it.zh}排成幾排？`, 'How many rows are there?') : L(`每一排有幾${it.m}${it.zh}？`, 'How many are in each row?'), scene, ans: ask === 'r' ? r : c, opts: near(ask === 'r' ? r : c, [ask === 'r' ? c : r], 1, 10),
      hint: ask === 'r' ? L('橫的一排一排數。', 'A row goes across. Count the rows from top to bottom.') : L('只數最上面那一排。', 'Count along the top row only.'), full: L(`${r} 排，每排 ${c} ${it.m}`, `${r} rows of ${c}`) });
  }),
  def(T.mul, '跳數', 'Skip-counting', (d) => {
    const s = pick([2, 5, 10]), i0 = d ? rnd(1, 6) : 1, n = d ? 5 : 4, miss = d ? rnd(1, n - 1) : n - 1, list = range(i0, i0 + n - 1).map((i) => i * s), ans = list[miss];
    return Q.num({ p: L(`${s} 個一數，少了哪一個數？`, `Count in ${{ 2: 'twos', 5: 'fives', 10: 'tens' }[s]}. What is the missing number?`), say: L(`${s} 個一數：${list.map((v, i) => (i === miss ? '多少' : v)).join('、')}。少了哪一個數？`, `Count in ${{ 2: 'twos', 5: 'fives', 10: 'tens' }[s]}: ${list.map((v, i) => (i === miss ? 'what' : v)).join(', ')}. What is the missing number?`),
      scene: seq(list.map((v, i) => (i === miss ? '?' : v))), ans, ...(ans <= 20 && { opts: near(ans, [ans + 1, ans - 1, ans + s], 1, 30) }), hint: L(`每次都多 ${s}。`, `Add ${s} each time.`), full: list.join(', ') });
  }),
  def(T.mul, '圖配算式', 'Match picture and sentence', (d) => {
    const it = thing(), g = rnd(2, d ? 5 : 4), e = rnd(2, d ? 5 : 4), card = (counts) => plates(counts, it.k, 22, 250);
    const wrong = sample([fill(g, e + 1), fill(g + 1, e), ...(g > 2 ? [fill(g - 1, e)] : []), ...(e > 2 ? [fill(g, e - 1)] : []), ...(g === 2 && e === 2 ? [] : [[g, e]])], 2);
    return Q.tap({ p: L(`哪一張圖是 ${g} × ${e}？`, `Which picture shows ${g} × ${e}?`), right: card(fill(g, e)), wrong: wrong.map(card),
      hint: L(`${g} × ${e} 是 ${g} 組，每組 ${e} 個。`, `${g} × ${e} means ${g} groups of ${e}.`), full: L(`${g} × ${e} 是 ${g} 組，每組 ${e} ${it.m}`, `${g} × ${e} is ${g} groups of ${e}`) });
  }),
  def(T.mul, '交換', 'Turn-around facts', (d) => {
    const [r, c] = distinct(2, 2, d ? 5 : 4), it = thing(), and = label(L('和', 'and'));
    if (d && chance(0.4)) return Q.num({ p: L(`把陣列轉一下，還是一樣多：${r} × ${c} = ${c} × □`, `Turn the array around: ${r} × ${c} = ${c} × □`), scene: row(fig(array(r, c, it.k), `${r} × ${c}`), and, fig(array(c, r, it.k), `${c} × ?`)), ans: r, opts: near(r, [c], 1, 10), full: `${r} × ${c} = ${c} × ${r}` });
    const same = chance(0.6), r2 = same ? r : r + (r > 2 && chance(0.5) ? -1 : 1);
    return Q.yn({ p: L(`${r} × ${c} 和 ${c} × ${r2} 一樣多嗎？`, `Are ${r} × ${c} and ${c} × ${r2} the same?`), scene: row(fig(array(r, c, it.k), `${r} × ${c}`), and, fig(array(c, r2, it.k), `${c} × ${r2}`)), ans: same, yes: L('一樣', 'Yes'), no: L('不一樣', 'No'),
      hint: L('數數看，兩邊各有幾個？', 'Count both pictures. Do they have the same number?'), full: same ? `${r} × ${c} = ${c} × ${r}` : L(`${r} × ${c} = ${r * c}，${c} × ${r2} = ${c * r2}，不一樣`, `${r} × ${c} = ${r * c}, but ${c} × ${r2} = ${c * r2}`) });
  }),
  def(T.mul, '乘法應用題', 'Multiplication word problems', (d) => {
    const it = thing([...FOODS, 'star', 'car', 'balloon', 'pencil']), g = rnd(2, d ? 5 : 3), e = rnd(2, d ? Math.min(10, Math.floor(40 / g)) : 5), [zh, en, ens] = pick([['盤子', 'plate', 'plates'], ['盒子', 'box', 'boxes'], ['袋子', 'bag', 'bags'], ['籃子', 'basket', 'baskets']]);
    return Q.num({ p: L(`有 ${g} 個${zh}，每個${zh}裡有 ${e} ${it.m}${it.zh}。一共有幾${it.m}${it.zh}？`, `There are ${g} ${ens}. Each ${en} has ${e} ${it.ens}. How many ${it.ens} are there altogether?`), scene: groups(g, e, it.k), ans: g * e, ...(g * e <= 20 && { opts: near(g * e, [g + e, g * e - e, g * e + e], 2, 40) }), count: '.it',
      hint: L(`${e} 個一數，數 ${g} 次。`, `Count in steps of ${e}, ${g} times.`), full: `${g} × ${e} = ${g * e}` });
  }),
  def(T.mul, '缺組數', 'How many groups?', (d) => {
    const it = thing(), g = rnd(2, 5), e = d ? rnd(2, Math.min(10, Math.floor(40 / g))) : pick([2, 5, 10].filter((v) => v * g <= 40)), t = g * e;
    return Q.num({ p: L(`□ 組，每組 ${e} ${it.m}，一共是 ${t} ${it.m}。`, `□ groups of ${e} make ${t}.`), scene: row(`<div class="arr">${items(it.k, t, { cols: d ? 10 : e, size: 'xs' })}</div>`, bigEq(`□ × ${e} = ${t}`, 'xs')), ans: g, opts: near(g, [e], 1, 10),
      hint: L(`${e} 個一數，數到 ${t} 要數幾次？`, `Count in steps of ${e} until you reach ${t}. How many steps?`), full: L(`${g} 組，每組 ${e} ${it.m}，一共 ${t} ${it.m}`, `${g} groups of ${e} make ${t}`) });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '用迴紋針量長度', 'Measure with paper clips', (d) => {
    const n = rnd(2, d ? 10 : 6), extra = d ? rnd(0, 2) : 0, [ozh, oen, e] = pick([['書', 'book', '📕'], ['鉛筆', 'pencil', '✏️'], ['筆記本', 'notebook', '📓'], ['湯匙', 'spoon', '🥄'], ['紅蘿蔔', 'carrot', '🥕'], ['水彩筆', 'paintbrush', '🖌️']]);
    const [uzh, um, uen, uens, unit] = pick([['迴紋針', '個', 'paper clip', 'paper clips', 'clip'], ['迴紋針', '個', 'paper clip', 'paper clips', 'clip'], ['積木', '塊', 'block', 'blocks', 'block'], ['硬幣', '個', 'coin', 'coins', 'coin'], ['橡皮擦', '個', 'eraser', 'erasers', 'eraser']]);
    return Q.num({ p: L(`${ozh}和幾${um}${uzh}一樣長？`, `How many ${uens} long is the ${oen}?`), scene: unitRow(n, n + extra, COLORS[pick(CK)].c, e, unit), ans: n, lo: 1, hi: 12,
      hint: L(`從頭到尾，一${um}接一${um}數。只數和${ozh}一樣長的那一段。`, `Count the ${uens} one by one, from one end of the ${oen} to the other.`), full: L(`${ozh}和 ${n} ${um}${uzh}一樣長`, `The ${oen} is ${n} ${pl(n, uen, uens)} long`) });
  }, true),
  def(T.bonus, '用繩子間接比較', 'Compare with a string', (d) => {
    const a = rnd(4, 9), b = chance(0.2) ? a : pick(range(3, 10).filter((v) => v !== a && Math.abs(v - a) >= (d ? 1 : 2))), [c1, c2] = sample(CK, 2), longer = chance(0.5);
    const o = pick([{ zh: '桌子', m: '張', en: 'desk', ens: 'desks' }, { zh: '床', m: '張', en: 'bed', ens: 'beds' }, { zh: '長椅', m: '張', en: 'bench', ens: 'benches' }, { zh: '櫃子', m: '個', en: 'cupboard', ens: 'cupboards' }, { zh: '黑板', m: '塊', en: 'board', ens: 'boards' }]);
    const name = (c) => L(`${cname(c)}的${o.zh}`, `the ${cname(c)} ${o.en}`), cap = (c) => L(`${cname(c)}的${o.zh}`, `${cname(c)} ${o.en}`), opts = [name(c1), name(c2), L('一樣長', 'the same length')], ri = a === b ? 2 : (a > b) === longer ? 0 : 1;
    return Q.pick({ p: longer ? L(`用繩子比比看：哪一${o.m}${o.zh}比較長？`, `Use the string to compare the two ${o.ens}. Which ${o.en} is longer?`) : L(`用繩子比比看：哪一${o.m}${o.zh}比較短？`, `Use the string to compare the two ${o.ens}. Which ${o.en} is shorter?`),
      scene: stringCmp(a, b, COLORS[c1].c, COLORS[c2].c, cap(c1), cap(c2)), right: opts[ri], wrong: opts.filter((_, i) => i !== ri),
      hint: L(`繩子和${cap(c1)}一樣長。${cap(c2)}比繩子長，還是比繩子短？`, `The string is as long as the ${cap(c1)}. Is the ${cap(c2)} longer or shorter than the string?`),
      full: a === b ? L(`兩${o.m}${o.zh}一樣長`, `The two ${o.ens} are the same length`) : longer ? L(`${opts[ri]}比較長`, `The ${cap(ri ? c2 : c1)} is longer`) : L(`${opts[ri]}比較短`, `The ${cap(ri ? c2 : c1)} is shorter`) });
  }, true),
];
