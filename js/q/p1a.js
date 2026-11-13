// 小一上 LV1（新加坡 P1 Term 1）：47 種題型。10 以內的數、10 以內加減、形狀、第幾個。
// 規格裡要「寫、拖、劃掉、拼字」的題型都改成同一個概念的點選版。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, distinct, thing, things2, cnt, who, who2, THINGS, ANIMALS, FOODS, TOYS } from './core.js?v=22';
import { items, pile, dots, grp, row, col, fig, emo, ncard, pic, seq, bigEq, tenFrame, bond, numLine, shape, solid, clock, bars, tallBars, lineup, svg, COLORS, SHAPES, BASIC, SOLIDS, cname, sname } from './vis.js?v=22';

const T = { num: ['10 以內的數', 'Numbers to 10', '🔢'], add: ['加法', 'Addition', '➕'], sub: ['減法', 'Subtraction', '➖'], shape: ['形狀', 'Shapes', '🔺'], ord: ['第幾個', 'Ordinal numbers', '🏅'], bonus: ['加分題', 'Bonus', '⭐'] };
const CK = Object.keys(COLORS), INK = '#2b2140';
const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const ZH_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const word = (n) => L(ZH_NUM[n], EN_NUM[n]);
// 拼錯的英文單字／長得像的國字（「數字的字怎麼寫」的干擾選項）
const MISSPELL = { 1: ['oen', 'wun', 'onn'], 2: ['tow', 'tuo', 'twoo'], 3: ['thre', 'trhee', 'theer'], 4: ['foru', 'fuor', 'forr'], 5: ['fiev', 'fyve', 'fife'], 6: ['siks', 'sxi', 'sixs'], 7: ['sevn', 'sevan', 'seevn'], 8: ['eigth', 'eihgt', 'eigt'], 9: ['nien', 'nyne', 'ninn'], 10: ['tne', 'tenn', 'tan'] };
const ZH_LIKE = { 1: ['二', '三', '十'], 2: ['一', '三', '工'], 3: ['二', '川', '王'], 4: ['西', '匹', '回'], 5: ['丑', '互', '王'], 6: ['大', '穴', '文'], 7: ['十', '匕', '士'], 8: ['入', '人', '六'], 9: ['丸', '力', '几'], 10: ['七', '千', '土'] };
// 序數：符號（第 3／3rd）與字（第三／third）
const ORD_EN = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const nth = (n) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;
const ordS = (n) => L(`第 ${n}`, nth(n));
const ordW = (n) => L(`第${ZH_NUM[n]}`, ORD_EN[n]);

const sh = (k, c, s = 80, rot = 0) => shape(k, { c: COLORS[c].c, s, rot });
const it2 = (k) => ({ k, ...THINGS[k] });
const uniq = (list) => [...new Map(list.map((v) => [String(v), v])).values()];
const sp = () => L('', ' ');                                                    // 英文句子之間的空白
const eqv = (s) => bigEq(s, s.replace(/\s/g, '').length > 5 ? 'sm' : '');         // 有 10 的算式縮小一點
const ALL6 = ['circle', 'square', 'rect', 'tri', 'semi', 'quarter'];
const ROT = { circle: [0], square: [0], rect: [0, 90], tri: [0, 90, 180], semi: [0, 90, 180, 270], quarter: [0, 90, 180, 270] };
const BALLS = [['球', '顆', 'ball', 'balls'], ['珠子', '顆', 'bead', 'beads'], ['彈珠', '顆', 'marble', 'marbles'], ['鈕扣', '顆', 'button', 'buttons']];
const plate = (h, w = 300) => `<div class="plate2" style="min-width:${w}px;min-height:110px;display:grid;place-items:center;border-radius:60px">${h}</div>`;

// n 個東西排整齊，最後 k 個做記號：'gone' 變淡（拿走了）、'x' 打叉（劃掉）
const CROSS = '<svg viewBox="0 0 10 10" style="position:absolute;left:6%;top:6%;width:88%;height:88%"><path d="M1.5,1.5 L8.5,8.5 M8.5,1.5 L1.5,8.5" stroke="#e8483f" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>';
const marked = (key, n, k, how = 'gone', o = {}) => {
  let i = 0;
  return items(key, n, o).replace(/<span class="it (.*?)<\/span>/g, (m, rest) => (++i <= n - k ? m : how === 'gone' ? `<span class="it gone ${rest}</span>` : `<span class="it x ${rest.replace('class="pic"', 'class="pic" style="opacity:.4"')}${CROSS}</span>`));
};
// 兩堆東西（加法的圖）：兩種顏色的圓點，或兩種不同的東西
const twoGroups = (a, b) => {
  const size = Math.max(a, b) > 5 ? 'sm' : 'md';
  if (chance(0.5)) { const [c1, c2] = sample(CK, 2); return row(grp(dots(a, COLORS[c1].c, { size })), grp(dots(b, COLORS[c2].c, { size }))); }
  const [x, y] = things2();
  return row(grp(items(x.k, a, { size }), 'a'), grp(items(y.k, b, { size }), 'b'));
};

// 會自己來、自己走的東西：at 在哪裡、come 來、go 走（中文／英文複數／英文單數）
const POND = { at: ['池塘裡', 'in the pond'], come: '游來', go: ['游走', 'swim away', 'swims away'] }, FARM = { at: ['農場裡', 'on the farm'], come: '跑來', go: ['跑走', 'run away', 'runs away'] }, FLY = ['飛走', 'fly away', 'flies away'];
const MOVE = { bird: { at: ['樹上', 'on the tree'], come: '飛來', go: FLY }, butterfly: { at: ['花園裡', 'in the garden'], come: '飛來', go: FLY }, duck: POND, fish: POND,
  frog: { at: ['池塘邊', 'at the pond'], come: '跳來', go: ['跳走', 'hop away', 'hops away'] }, pig: FARM, chick: FARM, car: { at: ['停車場裡', 'in the car park'], come: '開來', go: ['開走', 'drive away', 'drives away'] } };
// 加法故事（又來了 b 個）、減法故事（走掉／吃掉／送走 b 個）：回傳 { it 東西, s 故事, q 問句 }；a ≥ 2
function addStory(a, b) {
  if (chance(0.6)) {
    const it = it2(pick(Object.keys(MOVE))), m = MOVE[it.k];
    return { it, s: L(`${m.at[0]}有 ${a} ${it.m}${it.zh}，又${m.come} ${b} ${it.m}。`, `${a} ${it.ens} are ${m.at[1]}. ${b} more ${pl(b, it.en, it.ens)} ${pl(b, 'comes', 'come')}.`), q: L(`現在有幾${it.m}${it.zh}？`, `How many ${it.ens} are there now?`) };
  }
  const it = thing([...FOODS, ...TOYS]), w = who();
  return { it, s: L(`${w.n}有 ${a} ${it.m}${it.zh}，又拿到 ${b} ${it.m}。`, `${w.n} has ${a} ${it.ens}. ${w.He} gets ${b} more.`), q: L(`${w.n}現在有幾${it.m}${it.zh}？`, `How many ${it.ens} does ${w.n} have now?`) };
}
// 「求原本」的故事（走掉 b 個之後剩 c 個，原本有幾個？）：回傳 { it, s, q }
function startStory(b, c) {
  const r = Math.random(), w = who(), left = L(`還剩下 ${c}`, `${c} left`);
  if (r < 0.4) {
    const it = it2(pick(Object.keys(MOVE))), m = MOVE[it.k];
    return { it, s: L(`${m.at[0]}${m.go[0]}了 ${b} ${it.m}${it.zh}後，現在有 ${c} ${it.m}${it.zh}。`, `Some ${it.ens} are ${m.at[1]}. ${b} ${pl(b, it.en, it.ens)} ${pl(b, m.go[2], m.go[1])}. Now there ${pl(c, 'is', 'are')} ${c} ${pl(c, it.en, it.ens)}.`), q: L(`原本有幾${it.m}？`, `How many ${it.ens} were there at first?`) };
  }
  if (r < 0.75) {
    const it = thing(FOODS);
    return { it, s: L(`${w.n}吃掉 ${b} ${it.m}${it.zh}後，${left} ${it.m}。`, `${w.n} eats ${b} ${pl(b, it.en, it.ens)}. Now there ${pl(c, 'is', 'are')} ${left}.`), q: L(`原本有幾${it.m}${it.zh}？`, `How many ${it.ens} were there at first?`) };
  }
  const it = thing(TOYS);
  return { it, s: L(`${w.n}送給朋友 ${b} ${it.m}${it.zh}後，${left} ${it.m}。`, `${w.n} gives away ${b} ${pl(b, it.en, it.ens)}. ${w.He} has ${left}.`), q: L(`${w.n}原本有幾${it.m}${it.zh}？`, `How many ${it.ens} did ${w.n} have at first?`) };
}
function subStory(a, b) {
  const r = Math.random(), w = who();
  if (r < 0.4) {
    const it = it2(pick(Object.keys(MOVE))), m = MOVE[it.k];
    return { it, s: L(`${m.at[0]}有 ${a} ${it.m}${it.zh}，${m.go[0]}了 ${b} ${it.m}。`, `${a} ${it.ens} are ${m.at[1]}. ${b} ${pl(b, m.go[2], m.go[1])}.`), q: L(`還剩下幾${it.m}${it.zh}？`, `How many ${it.ens} are left?`) };
  }
  if (r < 0.75) {
    const it = thing(FOODS);
    return { it, s: L(`有 ${a} ${it.m}${it.zh}，${w.n}吃掉 ${b} ${it.m}。`, `There are ${a} ${it.ens}. ${w.n} eats ${b}.`), q: L(`還剩下幾${it.m}${it.zh}？`, `How many ${it.ens} are left?`) };
  }
  const it = thing(TOYS);
  return { it, s: L(`${w.n}有 ${a} ${it.m}${it.zh}，送給朋友 ${b} ${it.m}。`, `${w.n} has ${a} ${it.ens}. ${w.He} gives away ${b}.`), q: L(`${w.n}還剩下幾${it.m}${it.zh}？`, `How many ${it.ens} does ${w.n} have left?`) };
}

// 小小的分合圖（放在多選卡片裡）
const miniBond = (w, a, b) => {
  const node = (x, y, v) => `<circle cx="${x}" cy="${y}" r="21" fill="#fff8ea" stroke="${INK}" stroke-width="4"/><text x="${x}" y="${y + 9}" font-size="${String(v).length > 1 ? 22 : 26}" font-weight="900" text-anchor="middle" fill="${INK}">${v}</text>`;
  return svg(108, 98, `<line x1="54" y1="26" x2="26" y2="72" stroke="${INK}" stroke-width="4"/><line x1="54" y1="26" x2="82" y2="72" stroke="${INK}" stroke-width="4"/>${node(54, 24, w)}${node(26, 74, a)}${node(82, 74, b)}`);
};
// 用基本形狀拼成的圖（火車、房子、機器人）：回傳 { h 圖, n 各種形狀的數量, zh, en }
function shapePic(d) {
  const n = { circle: 0, square: 0, rect: 0, tri: 0 }, cs = shuffle(CK.map((k) => COLORS[k].c)), st = (c) => `fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
  const C = (x, y, r, c) => { n.circle++; return `<circle cx="${x}" cy="${y}" r="${r}" ${st(c)}/>`; };
  const R = (x, y, w, h, c) => { n[w === h ? 'square' : 'rect']++; return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${st(c)}/>`; };
  const Tr = (x, y, w, h, c) => { n.tri++; return `<polygon points="${x},${y + h} ${x + w / 2},${y} ${x + w},${y + h}" ${st(c)}/>`; };
  const kind = rnd(0, 2);
  let s = '', W, H, zh, en;
  if (kind === 0) { // 火車：車廂（長方形）、輪子（圓形）、窗戶（正方形）、貨物（三角形）
    const cars = rnd(2, d ? 4 : 2), windows = chance(0.6);
    for (let i = 0; i < cars; i++) {
      const x = 6 + i * 190, win = windows ? rnd(0, 2) : 0;
      if (i) s += `<line x1="${x - 30}" y1="150" x2="${x}" y2="150" stroke="${INK}" stroke-width="6"/>`;
      if (chance(0.5)) s += Tr(x + 50, 48, 60, 50, cs[2]);
      s += R(x, 98, 160, 70, cs[0]);
      for (let j = 0; j < win; j++) s += R(x + 26 + j * 74, 110, 34, 34, cs[1]);
      s += C(x + 40, 180, 20, cs[3]) + C(x + 120, 180, 20, cs[3]);
    }
    [W, H, zh, en] = [cars * 190 - 18, 206, '火車', 'train'];
  } else if (kind === 1) { // 房子：牆（正方形）、屋頂（三角形）、門（長方形）、太陽（圓形）、樹
    const win = rnd(0, 2);
    s += `<line x1="4" y1="222" x2="516" y2="222" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` + C(470, 42, 26, '#ffd43a');
    s += R(190, 100, 120, 120, cs[0]) + Tr(170, 30, 160, 70, cs[1]) + R(235, 160, 30, 60, cs[2]);
    for (let j = 0; j < win; j++) s += R(202 + j * 66, 114, 30, 30, cs[3]);
    if (chance(0.5)) s += C(250, 74, 13, cs[3]);
    for (const x of sample([70, 410], rnd(0, 2))) s += R(x - 9, 170, 18, 50, '#c98a4b') + (chance(0.5) ? Tr(x - 40, 92, 80, 84, '#2ec27e') : C(x, 136, 40, '#2ec27e'));
    [W, H, zh, en] = [520, 228, '圖', 'picture'];
  } else { // 機器人：頭（正方形）、身體和手腳（長方形）、眼睛按鈕（圓形）、帽子（三角形）
    const btn = rnd(1, 4);
    if (chance(0.5)) s += Tr(120, 2, 60, 32, cs[4]);
    s += R(115, 34, 70, 70, cs[0]) + C(137, 62, 9, '#fff') + C(163, 62, 9, '#fff') + R(135, 82, 30, 10, cs[1]);
    s += R(95, 108, 110, 76, cs[2]) + R(63, 112, 26, 64, cs[1]) + R(211, 112, 26, 64, cs[1]) + R(112, 188, 28, 44, cs[1]) + R(160, 188, 28, 44, cs[1]);
    for (let j = 0; j < btn; j++) s += C(150 + (j - (btn - 1) / 2) * 25, 146, 10, cs[3]);
    [W, H, zh, en] = [300, 236, '機器人', 'robot'];
  }
  return { h: svg(W, H, s), n, zh, en };
}
// 排成一列、可以直接點的卡片：hit 第幾張是答案（從 0 算）；flag 'l' | 'r' 在那一頭插旗子（'' 不插）
const lineCards = (list, hit, flag = 'l', s = 100) => list.map((k, i) => [`<div class="vcol" style="gap:0"><span style="font-size:30px;line-height:1.1;visibility:${(flag === 'l' && i === 0) || (flag === 'r' && i === list.length - 1) ? 'visible' : 'hidden'}">🚩</span>${pic(k, s)}</div>`, i === hit]);
const lineSize = (n) => (n >= 9 ? 54 : n >= 7 ? 76 : 100);
// 賽跑：list 選手（THINGS 的圖片名），slots 每個選手跑到第幾格（0~7，越大越接近右邊的終點）
const race = (list, slots) => {
  const h = list.length > 4 ? 46 : list.length > 3 ? 58 : 72, s = h - 6;
  return `<div style="position:relative;width:800px">${list.map((k, i) => `<div style="position:relative;height:${h}px;border-bottom:3px dashed rgba(43,33,64,.3)"><span style="position:absolute;left:${slots[i] * 86}px;top:3px">${pic(k, s)}</span></div>`).join('')}` +
    `<div style="position:absolute;right:60px;top:0;bottom:0;width:12px;border:2px solid ${INK};background:repeating-linear-gradient(${INK} 0 8px,#fff 8px 16px)"></div><span style="position:absolute;right:0;top:50%;transform:translateY(-50%);font-size:44px;line-height:1">🏁</span></div>`;
};
// 生活裡的東西像什麼形狀
const OBJ = {
  circle: [['🕐', '時鐘', 'clock'], ['🍪', '餅乾', 'cookie'], ['🪙', '硬幣', 'coin'], ['🍩', '甜甜圈', 'doughnut']], square: [['🧇', '鬆餅', 'waffle'], ['🟨', '便利貼', 'sticky note']],
  rect: [['🚪', '門', 'door'], ['📕', '書', 'book'], ['📱', '手機', 'phone'], ['✉️', '信封', 'envelope']], tri: [['🍙', '三角飯糰', 'rice ball'], ['🍕', '披薩', 'slice of pizza'], ['⛺', '帳篷', 'tent'], ['📐', '三角板', 'set square']],
};
const clash = (k) => (k === 'rect' ? 'square' : k === 'square' ? 'rect' : '');   // 正方形、長方形不要同時當「對」和「錯」
const OBJ3 = { cube: ['🧊', '🎁'], cuboid: ['📦'], cylinder: ['🥫', '🛢️'], sphere: ['⚽', '🏀', '🎾'] };

export default [
  // ---- 10 以內的數 ----
  def(T.num, '數一數有幾個', 'Count and tell the number', (d) => {
    const it = thing(), n = d === 0 ? rnd(1, 6) : d === 1 ? rnd(3, 10) : rnd(0, 10);
    return Q.num({ p: L(`數數看，有幾${it.m}${it.zh}？`, `How many ${it.ens} are there?`), scene: grp(pile(it.k, n, { w: 520, h: 232 })), ans: n, lo: 0, hi: 10, count: '.it', hint: L('一個一個慢慢數，數過的不要再數。', 'Count them one by one. Do not count any twice.'), full: cnt(n, it) });
  }),
  def(T.num, '認識 0', 'Zero means none', (d) => {
    const it = thing(FOODS), w = who(), [bz, be, prep] = pick([['盤子', 'plate', 'on'], ['籃子', 'basket', 'in'], ['盒子', 'box', 'in']]), n = chance(d ? 0.6 : 0.75) ? 0 : rnd(1, 3);
    return Q.num({ p: L(`${w.n}吃了一些${it.zh}。${bz}裡還剩下幾${it.m}${it.zh}？`, `${w.n} ate some ${it.ens}. How many ${it.ens} are left ${prep} the ${be}?`), scene: fig(plate(n ? items(it.k, n) : ''), L(bz, be)), ans: n, lo: 0, hi: 5, count: '.it',
      hint: L('什麼都沒有的時候，就是 0。', 'When there is nothing, the number is 0.'), full: n ? L(`還剩下 ${n} ${it.m}`, `${n} ${pl(n, it.en, it.ens)} ${pl(n, 'is', 'are')} left`) : L(`${bz}空空的，是 0 ${it.m}`, `The ${be} is empty. 0 ${it.ens} are left.`) });
  }),
  def(T.num, '數字配國字', 'Match numbers and words', (d) => {
    const n = rnd(0, d ? 10 : 5), others = sample(range(0, 10).filter((x) => x !== n), 3);
    if (chance(0.5)) return Q.pick({ p: L(`${n} 的國字是哪一個？`, `Match ${n} to its word.`), scene: ncard(n), right: word(n), wrong: others.map(word), full: `${n} = ${word(n)}` });
    return Q.pick({ p: L(`「${word(n)}」是哪一個數字？`, `Match the word ${word(n)} to its number.`), em: false, scene: ncard(word(n), 'word gold'), right: n, wrong: others, sort: true, full: `${word(n)} = ${n}` });
  }),
  def(T.num, '數字的字怎麼寫', 'Spell the number word', (d) => {
    const n = rnd(1, 10), wrong = sample(L(ZH_LIKE[n], MISSPELL[n]), d ? 3 : 2);
    return Q.pick({ p: L(`${n} 的國字，哪一個寫對了？`, `Spell the word for ${n}. Which one is correct?`), scene: ncard(n), right: word(n), wrong, hint: L('一筆一筆看清楚。', 'Look at the letters one by one.'), full: `${n} = ${word(n)}` });
  }),
  def(T.num, '一樣多', 'Same number', (d) => {
    const [x, y] = things2(), n = rnd(d ? 4 : 2, d ? 10 : 6), w = sample([n - 1, n + 1, n - 2, n + 2].filter((v) => v >= 1 && v <= 10), 2), g = (v) => pile(y.k, v, { w: 250, h: 116, s: 38 });
    return Q.tap({ p: L(`哪一堆和上面的${x.zh}一樣多？`, `Which group has the same number as the ${x.ens}?`), top: grp(items(x.k, n, { size: 'sm', cols: 10 })), right: g(n), wrong: w.map(g), count: '.taptop .it', hint: L(`先數數看${x.zh}有幾${x.m}。`, `First count the ${x.ens}.`), full: L(`都是 ${n} 個，一樣多`, `Both groups have ${n}`) });
  }),
  def(T.num, '比多少', 'More or fewer', (d) => {
    const k = rnd(d ? 1 : 2, 5), lo = rnd(0, 10 - k), hi = lo + k, more = chance(0.5), [a, b] = shuffle([lo, hi]), ans = more ? hi : lo, [c1, c2] = sample(CK, 2);
    const one = (v, c) => col(ncard(v, 'sm'), d < 2 ? dots(v, COLORS[c].c, { cols: 5 }) : '');
    return Q.pick({ p: more ? L(`${a} 和 ${b}，哪一個比較多？`, `Which is more, ${a} or ${b}?`) : L(`${a} 和 ${b}，哪一個比較少？`, `Which is fewer, ${a} or ${b}?`), scene: `<div class="vrow" style="align-items:flex-start;gap:70px">${one(a, c1)}${one(b, c2)}</div>`, right: ans, wrong: [lo + hi - ans], sort: true,
      full: more ? L(`${hi} 比 ${lo} 多`, `${hi} is more than ${lo}`) : L(`${lo} 比 ${hi} 少`, `${lo} is fewer than ${hi}`) });
  }),
  def(T.num, '多一少一', '1 more, 1 less', (d) => {
    const n = rnd(1, 9), more = chance(0.5), ans = more ? n + 1 : n - 1;
    return Q.num({ p: more ? L(`比 ${n} 多 1 的數是多少？`, `What is 1 more than ${n}?`) : L(`比 ${n} 少 1 的數是多少？`, `What is 1 less than ${n}?`), scene: d === 2 ? ncard(n) : numLine(0, 10, { mark: n, w: 800 }), ans, lo: 0, hi: 10,
      hint: more ? L('多 1，就是往後數一個。', '1 more is the next number when you count on.') : L('少 1，就是往前數一個。', '1 less is the number just before.'), full: more ? L(`比 ${n} 多 1 是 ${ans}`, `1 more than ${n} is ${ans}`) : L(`比 ${n} 少 1 是 ${ans}`, `1 less than ${n} is ${ans}`) });
  }),
  def(T.num, '排順序', 'Arrange the numbers', (d) => {
    const desc = d > 0 && chance(0.4), list = distinct(d ? pick([3, 4]) : 3, 0, 10), sorted = [...list].sort((a, b) => (desc ? b - a : a - b));
    if (list.every((v, i) => v === sorted[i])) list.reverse();
    return Q.order({ p: desc ? L(`把 ${list.join('、')} 由大排到小，照順序點。`, `Arrange ${list.join(', ')} from greatest to smallest.`) : L(`把 ${list.join('、')} 由小排到大，照順序點。`, `Arrange ${list.join(', ')} from smallest to greatest.`), items: list.map((v) => [ncard(v, 'sm'), v]), desc, full: sorted.join(', ') });
  }),
  def(T.num, '缺數', 'Missing number', (d) => {
    const back = chance(d ? 0.5 : 0.3), a = rnd(0, 7), list = back ? range(a, a + 3).reverse() : range(a, a + 3), miss = d ? rnd(0, 3) : rnd(1, 2);
    return Q.num({ p: back ? L('倒過來數，少了哪一個數字？', 'Count back. What is the missing number?') : L('照順序往下數，少了哪一個數字？', 'Count on. What is the missing number?'), scene: seq(list.map((v, i) => (i === miss ? '?' : v))), ans: list[miss], lo: 0, hi: 10, full: list.join(', ') });
  }),
  def(T.num, '十格板速認', 'Ten-frame flash', (d) => {
    const n = rnd(d ? 0 : 1, 10);
    return Q.num({ p: L('十格板上有幾個圓點？試著一眼看出來！', 'How many counters? Try to see it without counting one by one!'), scene: tenFrame(n), ans: n, lo: 0, hi: 10, hint: L('上面一排滿了是 5 個，兩排都滿了是 10 個。', 'A full top row is 5. A full frame is 10.'), full: n });
  }),
  // ---- 加法 ----
  def(T.add, '分合圖填空', 'Number bond: the missing part', (d) => {
    const w = rnd(d ? 4 : 2, d ? 10 : 6), a = d === 2 ? rnd(0, w) : rnd(1, w - 1), b = w - a, left = chance(0.3), known = left ? b : a;
    return Q.num({ p: left ? L(`${w} 可以分成多少和 ${b}？`, `${w} is □ and ${b}.`) : L(`${w} 可以分成 ${a} 和多少？`, `${w} is ${a} and □.`), scene: row(left ? bond(w, '?', b) : bond(w, a, '?'), d ? '' : tenFrame(known, w - known, 1.2)), ans: w - known, lo: 0, hi: 10,
      hint: L(`從 ${known} 往上數到 ${w}，數了幾個？`, `Count on from ${known} to ${w}. How many did you count?`), full: L(`${w} 是 ${a} 和 ${b}`, `${w} is ${a} and ${b}`) });
  }),
  def(T.add, '找出所有分法', 'All the ways to make a number', (d) => {
    const w = rnd(d ? 5 : 3, d ? 10 : 6), good = sample(range(0, w), 3).map((a) => [a, w - a]), bad = [];
    while (bad.length < (d ? 3 : 2)) { const a = rnd(0, w), b = w - a + pick([1, -1, 2, -2]); if (b >= 0 && b <= 10 && !bad.some((x) => x[0] === a && x[1] === b)) bad.push([a, b]); }
    return Q.multi({ p: L(`哪些分法合起來是 ${w}？全部找出來。`, `Find all the ways to make ${w}.`), items: [...good.map(([a, b]) => [miniBond(w, a, b), true]), ...bad.map(([a, b]) => [miniBond(w, a, b), false])],
      hint: L(`下面兩個數合起來，要剛好是 ${w}。`, `The two parts must make ${w}.`), full: L(`${w} 是 ${good.map(([a, b]) => `${a} 和 ${b}`).join('、')}`, `${w} is ${good.map(([a, b]) => `${a} and ${b}`).join(', ')}`) });
  }),
  def(T.add, '湊 10', 'Make 10', (d) => {
    const a = d ? rnd(0, 10) : rnd(1, 9);
    return Q.num({ p: L(`${a} 和多少合起來是 10？`, `${a} and □ make 10.`), scene: d === 2 ? bond(10, a, '?') : tenFrame(a), ans: 10 - a, lo: 0, hi: 10, hint: d === 2 ? L(`從 ${a} 往上數到 10。`, `Count on from ${a} to 10.`) : L('數數看，十格板還有幾個空格？', 'Count the empty boxes in the ten-frame.'), full: L(`${a} 和 ${10 - a} 合起來是 10`, `${a} and ${10 - a} make 10`) });
  }),
  def(T.add, '合起來', 'How many altogether?', (d) => {
    const t = rnd(d ? 4 : 2, d ? 10 : 6), a = rnd(1, t - 1), b = t - a, size = Math.max(a, b) > 5 ? 'sm' : 'md', full = `${a} + ${b} = ${t}`;
    if (chance(0.5)) {
      const [c1, c2] = sample(CK, 2), [zh, m, en, ens] = pick(BALLS);
      return Q.num({ p: L(`有 ${a} ${m}${cname(c1)}的${zh}和 ${b} ${m}${cname(c2)}的${zh}。一共有幾${m}${zh}？`, `There ${pl(a, 'is', 'are')} ${a} ${cname(c1)} ${pl(a, en, ens)} and ${b} ${cname(c2)} ${pl(b, en, ens)}. How many ${ens} are there altogether?`),
        scene: row(grp(dots(a, COLORS[c1].c, { size })), grp(dots(b, COLORS[c2].c, { size }))), ans: t, lo: 0, hi: 10, count: '.it', full });
    }
    const [x, y] = sample(ANIMALS, 2).map(it2);
    return Q.num({ p: L(`有 ${cnt(a, x)}和 ${cnt(b, y)}。一共有幾隻動物？`, `There ${pl(a, 'is', 'are')} ${cnt(a, x)} and ${cnt(b, y)}. How many animals are there altogether?`), scene: row(grp(items(x.k, a, { size }), 'a'), grp(items(y.k, b, { size }), 'b')), ans: t, lo: 0, hi: 10, count: '.it', full });
  }),
  def(T.add, '又來了', 'More come', (d) => {
    const b = rnd(1, d === 2 ? 5 : 3), a = rnd(2, (d ? 10 : 6) - b), st = addStory(a, b), size = a > 5 ? 'sm' : 'md';
    return Q.num({ p: st.s + sp() + st.q, scene: row(grp(items(st.it.k, a, { size })), grp(items(st.it.k, b, { size, cls: 'drop', from: a }), 'new')), ans: a + b, lo: 0, hi: 10, count: '.it', hint: L(`從 ${a} 開始，再往上數 ${b} 個。`, `Start at ${a} and count on ${b} more.`), full: `${a} + ${b} = ${a + b}` });
  }),
  def(T.add, '往上數', 'Count on', (d) => {
    const k = rnd(1, 3), a = rnd(d ? 2 : 1, 10 - k);
    return Q.num({ p: L(`從 ${a} 開始，往上數 ${k}，會數到多少？`, `Start at ${a}. Count on ${k}. What number do you get?`), scene: col(bigEq(`${a} + ${k} = □`, 'tiny'), numLine(0, 10, { mark: a, w: 800 })), ans: a + k, lo: 0, hi: 10,
      hint: L(`手指放在 ${a}，往右邊跳 ${k} 格。`, `Put your finger on ${a}. Jump ${k} ${pl(k, 'step', 'steps')} to the right.`), full: `${a} + ${k} = ${a + k}` });
  }),
  def(T.add, '看圖選加法算式', 'Number sentence for the picture', (d) => {
    const t = rnd(d ? 4 : 3, d ? 10 : 6), a = rnd(1, t - 1), b = t - a, eq = ([x, y, z]) => `${x} + ${y} = ${z}`;
    const wrong = sample([[a, b, t + 1], [a, b, t - 1], [a + 1, b, t + 1], [a, b + 1, t + 1], [a - 1, b, t - 1], [a, b - 1, t - 1]].filter(([x, y, z]) => x >= 1 && y >= 1 && z <= 10), d ? 3 : 2);
    return Q.pick({ p: L('哪一個加法算式和圖一樣？', 'Which number sentence matches the picture?'), scene: twoGroups(a, b), right: eq([a, b, t]), wrong: wrong.map(eq), count: '.it', hint: L('先數左邊，再數右邊，最後數全部。', 'Count the first group, then the second group, then all of them.'), full: eq([a, b, t]) });
  }),
  def(T.add, '缺數加法', 'Missing number in addition', (d) => {
    const t = rnd(d ? 4 : 2, d ? 10 : 7), a = d === 2 ? rnd(0, t) : rnd(1, t - 1), b = t - a, first = d > 0 && chance(0.4), known = first ? b : a;
    return Q.num({ p: L('□ 裡面是多少？', 'What is the missing number?'), say: first ? L(`多少加 ${b} 等於 ${t}？`, `What plus ${b} equals ${t}?`) : L(`${a} 加多少等於 ${t}？`, `${a} plus what equals ${t}?`), scene: eqv(first ? `□ + ${b} = ${t}` : `${a} + □ = ${t}`), ans: t - known, lo: 0, hi: 10,
      hint: L(`從 ${known} 往上數到 ${t}，數了幾個？`, `Count on from ${known} to ${t}. How many did you count?`), full: `${a} + ${b} = ${t}` });
  }),
  def(T.add, '交換順序', 'Add in any order', (d) => {
    let a, b;
    do { a = rnd(d ? 0 : 1, 9); b = rnd(1, 9); } while (a === b || a + b > 10);
    const second = d > 0 && chance(0.5), eq = second ? `${a} + ${b} = □ + ${a}` : `${a} + ${b} = ${b} + □`, [c1, c2] = sample(CK, 2).map((c) => COLORS[c].c), dd = (n, c) => dots(n, c, { size: 'xs' });
    return Q.num({ p: L('□ 裡面是多少？兩邊要一樣多。', 'What is the missing number? Both sides must be equal.'), say: second ? L(`${a} 加 ${b}，等於多少加 ${a}？`, `${a} plus ${b} equals what plus ${a}?`) : L(`${a} 加 ${b}，等於 ${b} 加多少？`, `${a} plus ${b} equals ${b} plus what?`),
      scene: d ? bigEq(eq) : col(bigEq(eq), `<div class="vrow" style="gap:10px">${dd(a, c1)}${dd(b, c2)}<span class="vlabel big">=</span>${dd(b, c2)}${dd(a, c1)}</div>`), ans: second ? b : a, lo: 0, hi: 10,
      hint: L('兩個數交換位置再加，答案還是一樣。', 'You can add in any order. The answer is the same.'), full: `${a} + ${b} = ${b} + ${a}` });
  }),
  def(T.add, '加 0', 'Adding zero', (d) => {
    const a = rnd(d ? 0 : 1, 10), form = d ? rnd(0, 2) : rnd(0, 1), eq = [`${a} + 0 = □`, `0 + ${a} = □`, `${a} + □ = ${a}`][form], it = thing(FOODS), some = plate(items(it.k, a, { size: 'sm' }), 150), none = plate('', 150);
    return Q.num({ p: L('□ 裡面是多少？', 'What is the missing number?'), say: [L(`${a} 加 0 等於多少？`, `${a} plus 0 equals what?`), L(`0 加 ${a} 等於多少？`, `0 plus ${a} equals what?`), L(`${a} 加多少，還是等於 ${a}？`, `${a} plus what equals ${a}?`)][form],
      scene: d ? eqv(eq) : col(bigEq(eq, 'tiny'), form ? row(none, some) : row(some, none)), ans: form === 2 ? 0 : a, lo: 0, hi: 10, hint: L('加 0 就是沒有再多，數字不會變。', 'Adding 0 means nothing more is added. The number stays the same.'), full: form === 1 ? `0 + ${a} = ${a}` : `${a} + 0 = ${a}` });
  }),
  // ---- 減法 ----
  // 圖上不把「拿走的」變淡（不然直接數剩下的就好，不用想）：
  //   一半出「求原本」（圖是現在剩下的），一半出「求剩下」（圖是原本的數量，要自己拿走）
  def(T.sub, '拿走', 'Taking away', (d) => {
    const a = rnd(3, d ? 10 : 6), size = a > 5 ? 'sm' : 'md';
    if (chance(0.5)) {
      const b = rnd(1, a - 1), c = a - b, st = startStory(b, c);
      return Q.num({ p: st.s + sp() + st.q, scene: grp(items(st.it.k, c, { size })), ans: a, lo: 0, hi: 10,
        hint: L(`圖上是現在的 ${c} 個。把不見的 ${b} 個加回來。`, `The picture shows the ${c} that ${pl(c, 'is', 'are')} here now. Put back the ${b} that went away.`), full: `${c} + ${b} = ${a}` });
    }
    const b = rnd(1, d === 2 ? a : a - 1), st = subStory(a, b);
    return Q.num({ p: st.s + sp() + st.q, scene: grp(items(st.it.k, a, { size })), ans: a - b, lo: 0, hi: 10,
      hint: L(`圖上是原本的 ${a} 個。用手遮住 ${b} 個，還看得到幾個？`, `The picture shows all ${a}. Cover ${b} with your hand. How many can you still see?`), full: `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '劃掉再選算式', 'Cross out and subtract', (d) => {
    const it = thing(), a = rnd(3, d ? 10 : 6), b = rnd(1, a - 1), c = a - b, right = `${a} − ${b} = ${c}`;
    const wrong = sample([`${a} − ${b} = ${c + 1}`, `${a} − ${b} = ${c - 1}`, ...(a + b <= 10 ? [`${a} + ${b} = ${a + b}`] : []), ...(c > b ? [`${c} − ${b} = ${c - b}`] : [])], d ? 3 : 2);
    return Q.pick({ p: L(`有 ${a} ${it.m}${it.zh}，劃掉 ${b} ${it.m}。哪一個減法算式和圖一樣？`, `Cross out ${b}. Which number sentence matches the picture?`), scene: grp(marked(it.k, a, b, 'x', { size: a > 5 ? 'sm' : 'md' })), right, wrong, count: '.it:not(.x)',
      hint: L('全部有幾個？劃掉幾個？還剩下幾個？', 'How many in all? How many are crossed out? How many are left?'), full: right });
  }),
  def(T.sub, '往回數', 'Count back', (d) => {
    const k = rnd(1, 3), a = rnd(d ? k : k + 1, 10);
    return Q.num({ p: L(`從 ${a} 開始，往回數 ${k}，會數到多少？`, `Start at ${a}. Count back ${k}. What number do you get?`), scene: col(bigEq(`${a} − ${k} = □`, 'tiny'), numLine(0, 10, { mark: a, w: 800 })), ans: a - k, lo: 0, hi: 10,
      hint: L(`手指放在 ${a}，往左邊跳 ${k} 格。`, `Put your finger on ${a}. Jump ${k} ${pl(k, 'step', 'steps')} to the left.`), full: `${a} − ${k} = ${a - k}` });
  }),
  def(T.sub, '比較：多幾個', 'How many more?', (d) => {
    const [A, B] = who2(), it = thing([...FOODS, ...TOYS]), k = rnd(1, d ? 5 : 3), lo = rnd(1, 10 - k), hi = lo + k, fewer = d > 0 && chance(0.35), rows = shuffle([[A, hi], [B, lo]]); // A 比較多
    const line = ([w, n]) => `<div class="vrow" style="gap:10px"><span class="vlabel sm" style="width:120px;text-align:right">${w.n}</span>${items(it.k, n, { size: 'sm', cols: 10 })}</div>`;
    return Q.num({ p: L(`${rows[0][0].n}有 ${cnt(rows[0][1], it)}，${rows[1][0].n}有 ${rows[1][1]} ${it.m}。${fewer ? `${B.n}比${A.n}少幾${it.m}？` : `${A.n}比${B.n}多幾${it.m}？`}`,
      `${rows[0][0].n} has ${cnt(rows[0][1], it)}. ${rows[1][0].n} has ${rows[1][1]}. ${fewer ? `How many fewer ${it.ens} does ${B.n} have?` : `How many more ${it.ens} does ${A.n} have?`}`),
      scene: `<div class="vcol" style="align-items:flex-start;gap:14px">${rows.map(line).join('')}</div>`, ans: k, lo: 0, hi: 6, hint: L('一個對一個排好，看看多出來幾個。', 'Match them one to one. How many are left over?'), full: `${hi} − ${lo} = ${k}` });
  }),
  def(T.sub, '部分與整體', 'Part and whole', (d) => {
    const w = rnd(d ? 5 : 4, d ? 10 : 7), a = rnd(2, w - 1), b = w - a, kind = rnd(0, 2), kids = (e, n) => `<div style="display:grid;grid-template-columns:repeat(${Math.min(n, 5)},46px);gap:2px">${emo(e, 38).repeat(n)}</div>`;
    let s, q, pa, pb;
    if (kind === 0) {
      const [x, y] = shuffle([['男生', 'boys', '👦'], ['女生', 'girls', '👧']]);
      s = L(`有 ${w} 個小朋友，其中 ${a} 個是${x[0]}。`, `There are ${w} children. ${a} are ${x[1]}.`); q = L(`${y[0]}有幾個？`, `How many are ${y[1]}?`); pa = kids(x[2], a); pb = kids(y[2], b);
    } else if (kind === 1) {
      const [c1, c2] = sample(CK, 2), [zh, m, , ens] = pick(BALLS);
      s = L(`有 ${w} ${m}${zh}，其中 ${a} ${m}是${cname(c1)}的，其他是${cname(c2)}的。`, `There are ${w} ${ens}. ${a} are ${cname(c1)}. The rest are ${cname(c2)}.`); q = L(`${cname(c2)}的有幾${m}？`, `How many are ${cname(c2)}?`);
      pa = dots(a, COLORS[c1].c); pb = dots(b, COLORS[c2].c);
    } else {
      const [x, y] = sample(ANIMALS, 2).map(it2);
      s = L(`有 ${w} 隻動物，其中 ${a} ${x.m}是${x.zh}，其他是${y.zh}。`, `There are ${w} animals. ${a} are ${x.ens}. The rest are ${y.ens}.`); q = L(`${y.zh}有幾${y.m}？`, `How many are ${y.ens}?`);
      pa = items(x.k, a, { size: 'sm' }); pb = items(y.k, b, { size: 'sm' });
    }
    return Q.num({ p: s + sp() + q, scene: d ? row(bond(w, a, '?'), grp(pa)) : row(grp(pa), grp(pb)), ans: b, lo: 0, hi: 10, hint: L(`全部是 ${w}，拿掉 ${a}，還有多少？`, `The whole is ${w}. One part is ${a}. What is the other part?`), full: `${w} − ${a} = ${b}` });
  }),
  def(T.sub, '缺數減法', 'Missing number in subtraction', (d) => {
    const a = rnd(d ? 4 : 2, d ? 10 : 7), b = d === 2 ? rnd(0, a) : rnd(1, a - 1), c = a - b, first = d > 0 && chance(0.5);
    return Q.num({ p: L('□ 裡面是多少？', 'What is the missing number?'), say: first ? L(`多少減 ${b} 等於 ${c}？`, `What minus ${b} equals ${c}?`) : L(`${a} 減多少等於 ${c}？`, `${a} minus what equals ${c}?`), scene: eqv(first ? `□ − ${b} = ${c}` : `${a} − □ = ${c}`), ans: first ? a : b, lo: 0, hi: 10,
      hint: first ? L(`想一想：${c} 加 ${b} 是多少？`, `Think: what is ${c} plus ${b}?`) : L(`從 ${a} 拿走幾個，會剩下 ${c} 個？`, `How many do you take away from ${a} to leave ${c}?`), full: `${a} − ${b} = ${c}` });
  }),
  def(T.sub, '算式一家人', 'Fact family', (d) => {
    let a, b;
    do { a = rnd(1, 4); b = rnd(2, 9); } while (a >= b || a + b > (d ? 10 : 7));
    const c = a + b, good = [`${a} + ${b} = ${c}`, `${b} + ${a} = ${c}`, `${c} − ${a} = ${b}`, `${c} − ${b} = ${a}`], bad = sample([`${c} + ${a} = ${b}`, `${b} − ${a} = ${c}`, `${a} − ${b} = ${c}`, `${c} + ${b} = ${a}`, `${a} + ${c} = ${b}`], d ? 3 : 2);
    return Q.multi({ p: L(`用 ${a}、${b}、${c} 可以寫出哪些正確的算式？全部選出來。`, `Use ${a}, ${b} and ${c}. Tap all the number sentences that are true.`), items: [...good.map((s) => [`<span class="vlabel">${s}</span>`, true]), ...bad.map((s) => [`<span class="vlabel">${s}</span>`, false])],
      hint: L(`加法的答案是最大的 ${c}；減法要從 ${c} 開始減。`, `In addition, the answer is the greatest number, ${c}. In subtraction, start from ${c}.`), full: good.join(L('、', ', ')) });
  }),
  def(T.sub, '選加或減', 'Plus or minus?', (d) => {
    const add = chance(0.5), b = rnd(1, 3), a = add ? rnd(2, (d ? 10 : 7) - b) : rnd(b + 1, d ? 10 : 7), st = add ? addStory(a, b) : subStory(a, b), plus = L('+ 加法', '+ plus'), minus = L('− 減法', '− minus');
    return Q.pick({ p: st.s + sp() + st.q + sp() + L('要用加法還是減法？', 'Plus or minus?'), scene: row(pic(st.it.k, 120), bigEq(`${a} ? ${b}`)), right: add ? plus : minus, wrong: [add ? minus : plus],
      hint: L('變多了用加法，變少了用減法。', 'If there are more now, add. If there are fewer now, subtract.'), full: add ? `${a} + ${b} = ${a + b}` : `${a} − ${b} = ${a - b}` });
  }),
  def(T.sub, '算式對不對', 'True or false?', (d) => {
    const add = chance(0.5), t = rnd(d ? 4 : 2, d ? 10 : 6), a = rnd(d === 2 ? 0 : 1, t - 1), r = add ? t : t - a, ok = chance(0.5), left = add ? `${a} + ${t - a}` : `${t} − ${a}`;
    const shown = ok ? r : pick([r + 1, r - 1, r + 2, r - 2, add ? Math.abs(t - 2 * a) : t + a].filter((v) => v >= 0 && v <= 10 && v !== r)), eq = `${left} = ${shown}`;
    return Q.yn({ p: L(`${eq}，這個算式對不對？`, `Is ${eq} true or false?`), scene: eqv(eq), ans: ok, yes: L('對', 'True'), no: L('不對', 'False'), full: ok ? `${left} = ${r}` : L(`不對，${left} = ${r}`, `False. ${left} = ${r}`) });
  }),
  def(T.sub, '圖配算式', 'Which picture matches?', (d) => {
    if (d > 0 && chance(0.4)) {
      const it = thing(), a = rnd(4, 9), b = rnd(1, a - 1), g = ([x, y]) => marked(it.k, x, y, 'x', { size: 'sm', cols: 5 }), eq = `${a} − ${b} = ${a - b}`;
      const wrong = sample(uniq([[a, b + 1], [a, b - 1], [a + 1, b], [a - 1, b], [a, a - b]]).filter(([x, y]) => y >= 1 && y < x && !(x === a && y === b)), 2);
      return Q.tap({ p: L(`哪一張圖是 ${eq}？`, `Which picture shows ${eq}?`), right: g([a, b]), wrong: wrong.map(g), hint: L(`找找看：全部有 ${a} 個，劃掉 ${b} 個。`, `Look for ${a} in all, with ${b} crossed out.`), full: eq });
    }
    const t = rnd(d ? 4 : 3, d ? 10 : 6), a = rnd(1, t - 1), b = t - a, eq = `${a} + ${b} = ${t}`, [c1, c2] = sample(CK, 2), [x, y] = things2(), useDots = chance(0.5);
    const g = ([m, n]) => (useDots ? col(dots(m, COLORS[c1].c), dots(n, COLORS[c2].c)) : col(items(x.k, m, { size: 'sm' }), items(y.k, n, { size: 'sm' })));
    const wrong = sample(uniq([[a + 1, b], [a, b + 1], [a - 1, b], [a, b - 1], [a + 1, b - 1], [a - 1, b + 1]]).filter(([m, n]) => m >= 1 && n >= 1 && m + n <= 10 && !(m === b && n === a)), 2);
    return Q.tap({ p: L(`哪一張圖是 ${eq}？`, `Which picture shows ${eq}?`), right: g([a, b]), wrong: wrong.map(g), hint: L(`找找看：上面 ${a} 個，下面 ${b} 個。`, `Look for ${a} on top and ${b} below.`), full: eq });
  }),
  // ---- 形狀 ----
  def(T.shape, '認形狀', 'Name the shape', (d) => {
    const k = pick(d ? ALL6 : [...BASIC, 'semi']), wrong = sample(ALL6.filter((x) => x !== k), 3);
    return Q.pick({ p: L('這是什麼形狀？', 'What shape is this?'), scene: sh(k, pick(CK), 210, d ? pick(ROT[k]) : 0), right: sname(k), wrong: wrong.map(sname), full: L(`這是${sname(k)}`, `This is a ${sname(k)}`) });
  }),
  def(T.shape, '找出所有', 'Find all of one shape', (d) => {
    const pool = d ? ALL6 : BASIC, k = pick(pool), rest = pool.filter((x) => x !== k && x !== clash(k)), n = rnd(8, 10), m = rnd(2, 4), list = [...range(1, m).map(() => k), ...range(1, n - m).map(() => pick(rest))];
    return Q.multi({ p: L(`把${sname(k)}全部找出來。`, `Tap all the ${sname(k)}s.`), items: list.map((x) => [sh(x, pick(CK), pick([50, 66, 84]), pick(ROT[x])), x === k]), hint: L('轉了方向、變大變小，還是同一種形狀。', 'A shape is still the same shape when it is turned or when it is bigger or smaller.'),
      full: L(`有 ${m} 個${sname(k)}`, `There are ${m} ${sname(k)}s`) });
  }),
  def(T.shape, '邊與角', 'Sides and corners', (d) => {
    const k = pick([...BASIC, 'square', 'rect', 'tri']), side = k !== 'circle' && chance(0.5), n = side ? SHAPES[k].sides : SHAPES[k].corners;
    return Q.num({ p: side ? L(`${sname(k)}有幾條邊？`, `How many sides does a ${sname(k)} have?`) : L(`${sname(k)}有幾個角？`, `How many corners does a ${sname(k)} have?`), scene: sh(k, pick(CK), 210, d ? pick(ROT[k]) : 0), ans: n, opts: [0, 3, 4, 5],
      hint: side ? L('用手指沿著邊走一圈，數數看有幾條直直的邊。', 'Trace around the shape. Count the straight sides.') : L('尖尖的地方就是角，數數看。', 'A corner is a pointed part. Count them.'),
      full: side ? L(`${sname(k)}有 ${n} 條邊`, `A ${sname(k)} has ${n} sides`) : n ? L(`${sname(k)}有 ${n} 個角`, `A ${sname(k)} has ${n} corners`) : L(`${sname(k)}沒有角`, `A ${sname(k)} has no corners`) });
  }),
  def(T.shape, '分類', 'Sort the shapes', (d) => {
    const by = pick(['colour', 'shape', 'size']), cs = sample(CK, 2), ks = shuffle(pick([['circle', 'square'], ['circle', 'tri'], ['circle', 'rect'], ['square', 'tri'], ['rect', 'tri']])), big = chance(0.5);
    const combos = [0, 1].flatMap((c) => [0, 1].flatMap((k) => [0, 1].map((s) => ({ c, k, s })))), val = (o) => ({ colour: o.c, shape: o.k, size: o.s })[by];
    if (d > 0 && chance(0.5)) {
      const names = { colour: L('照顏色', 'by colour'), shape: L('照形狀', 'by shape'), size: L('照大小', 'by size') }, one = (v) => grp(`<div class="vrow" style="gap:6px">${shuffle(combos.filter((o) => val(o) === v)).map((o) => sh(ks[o.k], cs[o.c], o.s ? 70 : 40)).join('')}</div>`);
      return Q.pick({ p: L('這些形狀分成了兩堆。是照什麼分的？', 'The shapes are sorted into two groups. How are they sorted?'), scene: row(one(0), one(1)), right: names[by], wrong: Object.keys(names).filter((x) => x !== by).map((x) => names[x]),
        hint: L('看看同一堆裡面，什麼地方都一樣？', 'Look at one group. What is the same about all of them?'), full: L(`是${names[by]}分的`, `They are sorted ${names[by]}`) });
    }
    const p = { colour: L(`照顏色分。把${cname(cs[0])}的形狀全部找出來。`, `Sort by colour. Tap all the ${cname(cs[0])} shapes.`), shape: L(`照形狀分。把${sname(ks[0])}全部找出來。`, `Sort by shape. Tap all the ${sname(ks[0])}s.`),
      size: big ? L('照大小分。把大的形狀全部找出來。', 'Sort by size. Tap all the big shapes.') : L('照大小分。把小的形狀全部找出來。', 'Sort by size. Tap all the small shapes.') }[by];
    const full = { colour: L(`這些都是${cname(cs[0])}`, `These are all ${cname(cs[0])}`), shape: L(`這些都是${sname(ks[0])}`, `These are all ${sname(ks[0])}s`), size: big ? L('這些都是大的', 'These are all big') : L('這些都是小的', 'These are all small') }[by];
    return Q.multi({ p, items: combos.map((o) => [sh(ks[o.k], cs[o.c], o.s ? 92 : 50), by === 'size' ? !!o.s === big : val(o) === 0]), full });
  }),
  def(T.shape, '生活物品', 'Shapes around us', (d) => {
    const k = pick(BASIC), others = BASIC.filter((x) => x !== k && x !== clash(k)), [e, zh, en] = pick(OBJ[k]), card = ([e2, z2, n2]) => fig(emo(e2, 96), L(z2, n2)), full = L(`${zh}像${sname(k)}`, `The ${en} looks like a ${sname(k)}`);
    if (d > 0 && chance(0.4)) return Q.pick({ p: L(`${zh}看起來像什麼形狀？`, `What shape does the ${en} look like?`), scene: emo(e, 170), right: sname(k), wrong: others.map(sname), full });
    return Q.tap({ p: L(`哪一個東西看起來像${sname(k)}？`, `Which object looks like a ${sname(k)}?`), right: card([e, zh, en]), wrong: others.map((x) => card(pick(OBJ[x]))), full });
  }),
  def(T.shape, '圖裡數形狀', 'Count the shapes in the picture', (d) => {
    const pic2 = shapePic(d), k = pick(BASIC.filter((x) => pic2.n[x] > 0 && !(x === 'rect' && pic2.n.square > 0))), n = pic2.n[k];
    return Q.num({ p: L(`${pic2.zh}裡有幾個${sname(k)}？`, `How many ${sname(k)}s are in the ${pic2.en}?`), scene: pic2.h, ans: n, lo: 1, hi: 9, hint: L('用手指一個一個點，大的小的都要數。', 'Point to each one as you count. Count the big ones and the small ones.'), full: L(`${n} 個${sname(k)}`, `${n} ${sname(k)}${n === 1 ? '' : 's'}`) });
  }),
  def(T.shape, '拼出圖形', 'Which two pieces make the shape?', (d) => {
    const c = COLORS[pick(CK)].c, st = `fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;
    const P = { tri: `<polygon points="12,12 12,100 100,100" ${st}/><polygon points="130,12 218,12 218,100" ${st}/>`, semi: `<path d="M100,10 A46,46 0 0 0 100,102 Z" ${st}/><path d="M130,10 A46,46 0 0 1 130,102 Z" ${st}/>`,
      quarter: `<path d="M104,100 L104,20 A80,80 0 0 0 24,100 Z" ${st}/><path d="M126,100 L126,20 A80,80 0 0 1 206,100 Z" ${st}/>`, square: `<rect x="14" y="14" width="84" height="84" ${st}/><rect x="132" y="14" width="84" height="84" ${st}/>` };
    const [made, need, zh, en] = pick([['square', 'tri', '兩個三角形', 'Two triangles'], ['circle', 'semi', '兩個半圓形', 'Two half circles'], ['semi', 'quarter', '兩個四分之一圓', 'Two quarter circles'], ...(d ? [['rect', 'square', '兩個正方形', 'Two squares']] : [])]);
    const wrong = sample(Object.keys(P).filter((x) => x !== need && !(made === 'rect' && x === 'tri')), 2);
    return Q.tap({ p: L(`哪兩塊可以拼成上面這個${sname(made)}？`, `Which two pieces make this ${sname(made)}?`), top: shape(made, { c, s: 124 }), right: svg(230, 112, P[need]), wrong: wrong.map((x) => svg(230, 112, P[x])), hint: L('想像把兩塊推在一起，會變成什麼形狀？', 'Imagine pushing the two pieces together. What shape do they make?'),
      full: L(`${zh}可以拼成${sname(made)}`, `${en} make a ${sname(made)}`) });
  }),
  // ---- 第幾個 ----
  def(T.ord, '第幾個', 'Which one is 3rd?', (d) => {
    const n = d === 0 ? 5 : d === 1 ? rnd(5, 7) : rnd(6, 10), animals = n <= 7, list = sample(animals ? ANIMALS : Object.keys(THINGS), n), i = rnd(1, n), it = it2(list[i - 1]);
    return Q.tap({ p: animals ? L(`從旗子這邊開始數，第 ${i} 個是哪一隻動物？`, `Count from the flag. Which animal is ${nth(i)}?`) : L(`從旗子這邊開始數，第 ${i} 個是什麼？`, `Count from the flag. Which one is ${nth(i)}?`), cards: lineCards(list, i - 1, 'l', lineSize(n)),
      hint: L('從旗子開始，第 1、第 2、第 3，一個一個數。', 'Start at the flag and count: 1st, 2nd, 3rd.'), full: L(`第 ${i} 個是${it.zh}`, `The ${it.en} is ${nth(i)}`) });
  }),
  def(T.ord, '排第幾', 'What position?', (d) => {
    const n = d ? rnd(6, 10) : 5, list = sample(n <= 7 ? ANIMALS : Object.keys(THINGS), n), i = rnd(1, n), it = it2(list[i - 1]), wrong = sample(range(1, n).filter((x) => x !== i), 3);
    return Q.pick({ p: L(`從旗子這邊開始數，${it.zh}排第幾？`, `Count from the flag. The ${it.en} is □.`), say: L(`從旗子這邊開始數，${it.zh}排第幾？`, `Count from the flag. What position is the ${it.en}?`), scene: lineup(list, { flag: true, s: n > 7 ? 62 : 78 }), right: ordS(i), wrong: wrong.map(ordS),
      hint: L('從旗子開始，第 1、第 2、第 3，一個一個數。', 'Start at the flag and count: 1st, 2nd, 3rd.'), full: L(`${it.zh}排第 ${i}`, `The ${it.en} is ${nth(i)}`) });
  }),
  def(T.ord, '從左數從右數', 'From the left, from the right', (d) => {
    const n = rnd(5, d ? 8 : 6), list = sample([...ANIMALS, 'teddy'], n), left = chance(0.5), sideZ = left ? '左' : '右', sideE = left ? 'left' : 'right';
    let i;
    do { i = rnd(1, n); } while (2 * i === n + 1);
    const idx = left ? i - 1 : n - i, it = it2(list[idx]), full = L(`從${sideZ}邊開始數，第 ${i} 個是${it.zh}`, `The ${it.en} is ${nth(i)} from the ${sideE}`), hint = L(`從最${sideZ}邊的那一個開始數。`, `Start counting from the one on the far ${sideE}.`);
    if (d > 0 && chance(0.35)) {
      const wrong = [n + 1 - i, ...sample(range(1, n).filter((x) => x !== i && x !== n + 1 - i), 2)];
      return Q.pick({ p: L(`從${sideZ}邊開始數，${it.zh}是第幾個？`, `The ${it.en} is □ from the ${sideE}.`), say: L(`從${sideZ}邊開始數，${it.zh}是第幾個？`, `What position is the ${it.en} from the ${sideE}?`), scene: lineup(list, { s: n > 7 ? 70 : 84 }), right: ordS(i), wrong: wrong.map(ordS), hint, full });
    }
    return Q.tap({ p: L(`從${sideZ}邊開始數，第 ${i} 個是誰？`, `Who is ${nth(i)} from the ${sideE}?`), cards: lineCards(list, idx, d ? '' : left ? 'l' : 'r', lineSize(n)), hint, full });
  }),
  def(T.ord, '序數的字', 'Ordinal words', (d) => {
    const n = rnd(1, d ? 10 : 5), others = sample(range(1, 10).filter((x) => x !== n), 3);
    if (chance(0.5)) return Q.pick({ p: L(`「${ordW(n)}」是哪一個？`, `Match ${ordW(n)} to its number.`), scene: ncard(ordW(n), 'word gold'), right: ordS(n), wrong: others.map(ordS), full: `${ordW(n)} = ${ordS(n)}` });
    return Q.pick({ p: L(`「${ordS(n)}」的國字是哪一個？`, `Match ${ordS(n)} to its word.`), scene: ncard(ordS(n), 'word'), right: ordW(n), wrong: others.map(ordW), full: `${ordS(n)} = ${ordW(n)}` });
  }),
  def(T.ord, '位置詞', 'Position words', (d) => {
    const n = d ? rnd(5, 6) : 5, list = sample([...ANIMALS, 'teddy'], n), A = (j) => it2(list[j]), kind = pick(d ? ['between', 'before', 'after', 'first', 'last', 'next'] : ['between', 'first', 'last', 'next']), front = L('旗子那邊是最前面。', 'The flag is at the front. ');
    let i, p, full;
    if (kind === 'between') { i = rnd(1, n - 2); p = L(`誰在${A(i - 1).zh}和${A(i + 1).zh}的中間？`, `Who is between the ${A(i - 1).en} and the ${A(i + 1).en}?`); full = L(`${A(i).zh}在${A(i - 1).zh}和${A(i + 1).zh}的中間`, `The ${A(i).en} is between the ${A(i - 1).en} and the ${A(i + 1).en}`); }
    else if (kind === 'before') { i = rnd(0, n - 2); p = front + L(`${A(i + 1).zh}的前一個是誰？`, `Who is just before the ${A(i + 1).en}?`); full = L(`${A(i).zh}在${A(i + 1).zh}的前面`, `The ${A(i).en} is just before the ${A(i + 1).en}`); }
    else if (kind === 'after') { i = rnd(1, n - 1); p = front + L(`${A(i - 1).zh}的後一個是誰？`, `Who is just after the ${A(i - 1).en}?`); full = L(`${A(i).zh}在${A(i - 1).zh}的後面`, `The ${A(i).en} is just after the ${A(i - 1).en}`); }
    else if (kind === 'first') { i = 0; p = front + L('誰排第一個？', 'Who is first?'); full = L(`${A(i).zh}排第一個`, `The ${A(i).en} is first`); }
    else if (kind === 'last') { i = n - 1; p = front + L('誰排最後一個？', 'Who is last?'); full = L(`${A(i).zh}排最後一個`, `The ${A(i).en} is last`); }
    else { const end = chance(0.5), x = A(end ? n - 1 : 0); i = end ? n - 2 : 1; p = L(`誰在${x.zh}的旁邊？`, `Who is next to the ${x.en}?`); full = L(`${A(i).zh}在${x.zh}的旁邊`, `The ${A(i).en} is next to the ${x.en}`); }
    return Q.tap({ p, cards: lineCards(list, i, 'l', n > 5 ? 92 : 104), full });
  }),
  def(T.ord, '賽跑名次', 'Places in a race', (d) => {
    const n = d === 0 ? 3 : d === 1 ? rnd(3, 4) : rnd(4, 6), list = sample([...ANIMALS, 'teddy', 'car'], n), slots = distinct(n, 0, 7), rank = (i) => slots.filter((s) => s > slots[i]).length + 1;
    const last = d > 0 && chance(0.2), r = last ? n : rnd(1, Math.min(n, d ? n : 3)), i = range(0, n - 1).find((j) => rank(j) === r), it = it2(list[i]), wrong = sample(list.filter((k) => k !== list[i]), 3);
    return Q.pick({ p: last ? L('賽跑比賽！現在誰是最後一名？', 'Look at the race. Who is last?') : L(`賽跑比賽！現在誰是第 ${r} 名？`, `Look at the race. Who is ${ORD_EN[r]}?`), scene: race(list, slots), right: pic(list[i], 96), wrong: wrong.map((k) => pic(k, 96)),
      hint: L('離終點的旗子最近的，就是第 1 名。', 'The one nearest the finish flag is first.'), full: last ? L(`${it.zh}是最後一名`, `The ${it.en} is last`) : L(`${it.zh}是第 ${r} 名`, `The ${it.en} is ${ORD_EN[r]}`) });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '比長短高矮', 'Longer, shorter, taller', (d) => {
    const n = d ? 3 : 2, cs = sample(CK, n), lens = distinct(n, 3, 10), tall = chance(0.35), most = chance(0.5), i = lens.indexOf(most ? Math.max(...lens) : Math.min(...lens)), skew = !tall && d === 2 && chance(0.6);
    const [zh, m, en] = tall ? pick([['積木塔', '座', 'tower'], ['大樓', '棟', 'building']]) : pick([['緞帶', '條', 'ribbon'], ['鉛筆', '枝', 'pencil'], ['繩子', '條', 'rope']]);
    const wz = (tall ? (most ? '高' : '矮') : most ? '長' : '短'), we = tall ? (most ? 'tall' : 'short') : most ? 'long' : 'short', fz = n === 2 ? `比較${wz}` : `最${wz}`, fe = n === 2 ? `${we}er` : `the ${we}est`;
    const list = lens.map((len, j) => ({ len, c: COLORS[cs[j]].c, off: rnd(0, 10 - len) }));
    return Q.pick({ p: L(`哪一${m}${zh}${fz}？`, `Which ${en} is ${fe}?`), scene: tall ? tallBars(list, { max: 10, h: 250, bw: 70, gap: 70 }) : bars(list, { max: 10, w: 620, h: 44, gap: 26, align: !skew }), right: cname(cs[i]), wrong: cs.filter((_, j) => j !== i).map(cname),
      hint: skew ? L('兩頭都要看清楚，不是只看右邊。', 'Look at both ends, not just one end.') : tall ? L('底下對齊了，看看誰的頭比較高。', 'They start at the same line. Look at the tops.') : L('左邊對齊了，看看右邊誰比較出去。', 'They start at the same line. Look at the other end.'),
      full: L(`${cname(cs[i])}的${zh}${fz}`, `The ${cname(cs[i])} ${en} is ${fe}`) });
  }, true),
  def(T.bonus, '30 以內的數', 'Numbers to 30', (d) => {
    const n = rnd(11, d ? 30 : 20), bead = chance(0.5), it = thing(), c = COLORS[pick(CK)].c, rows = range(0, Math.ceil(n / 10) - 1).map((r) => Math.min(10, n - r * 10));
    return Q.num({ p: bead ? L('數一數，有幾顆珠子？', 'Count the beads. How many are there?') : L(`數一數，有幾${it.m}${it.zh}？`, `Count the ${it.ens}. How many are there?`),
      scene: `<div class="vcol" style="align-items:flex-start;gap:8px">${rows.map((k, r) => (bead ? dots(k, c, { cols: 10 }) : items(it.k, k, { size: 'sm', cols: 10, from: r * 10 }))).join('')}</div>`, ans: n, lo: 10, hi: 30, count: '.it',
      hint: L('一排是 10 個。10、20，再接著往下數。', 'Each full row is 10. Count 10, 20, then count on.'), full: bead ? L(`${n} 顆珠子`, `${n} beads`) : cnt(n, it) });
  }, true),
  def(T.bonus, '立體分類', 'Roll or stack?', (d) => {
    const kind = pick(d === 0 ? ['roll'] : d === 1 ? ['roll', 'stack'] : ['roll', 'stack', 'noroll', 'both']), ks = ['cube', 'cuboid', 'cylinder', 'sphere'], list = shuffle([...ks, pick(ks), pick(ks)]);
    const ok = (k) => ({ roll: SOLIDS[k].roll, stack: SOLIDS[k].stack, noroll: !SOLIDS[k].roll, both: SOLIDS[k].roll && SOLIDS[k].stack })[kind];
    const p = { roll: L('哪些東西可以滾？全部選出來。', 'Which ones can roll? Tap them all.'), stack: L('哪些東西可以疊高高？全部選出來。', 'Which ones can be stacked? Tap them all.'), noroll: L('哪些東西不會滾？全部選出來。', 'Which ones cannot roll? Tap them all.'), both: L('哪些東西可以滾，也可以疊高高？全部選出來。', 'Which ones can roll and can also be stacked? Tap them all.') }[kind];
    const full = { roll: L('圓罐和球可以滾', 'Cans and balls can roll'), stack: L('盒子和圓罐可以疊高高', 'Boxes and cans can be stacked'), noroll: L('方方的盒子不會滾', 'Boxes cannot roll'), both: L('圓罐可以滾，也可以疊高高', 'Cans can roll and can be stacked') }[kind];
    return Q.multi({ p, items: list.map((k) => [chance(0.5) ? solid(k, { c: COLORS[pick(CK)].c, s: 96 }) : emo(pick(OBJ3[k]), 78), ok(k)]), hint: L('圓圓的面會滾，平平的面可以疊。', 'Curved faces can roll. Flat faces can be stacked.'), full });
  }, true),
  def(T.bonus, '整點與半點', "O'clock and half past", (d) => {
    const h = rnd(1, 12), half = d > 0 && chance(0.5), nx = (h % 12) + 1, pv = ((h + 10) % 12) + 1, far = ((h + 5) % 12) + 1, t = (hh, mm) => (mm ? L(`${hh} 點半`, `half past ${hh}`) : L(`${hh} 點`, `${hh} o'clock`)), now = t(h, half ? 30 : 0);
    const hint = half ? L('長針指著 6 是「半」。短針剛走過哪個數字，就是幾點半。', 'The long hand at 6 means half past. The short hand has just passed the hour.') : L('長針指著 12 是整點。短針指著幾，就是幾點。', 'The long hand at 12 means o\'clock. The short hand shows the hour.');
    if (d > 0 && chance(0.4)) return Q.tap({ p: L(`哪一個時鐘是 ${now}？`, `Which clock shows ${now}?`), right: clock(h, half ? 30 : 0, { s: 200 }), wrong: (half ? [[h, 0], [nx, 30]] : [[h, 30], [nx, 0]]).map(([hh, mm]) => clock(hh, mm, { s: 200 })), hint, full: now });
    return Q.pick({ p: L('現在是幾點？', 'What time is it?'), scene: clock(h, half ? 30 : 0, { s: 240 }), right: now, wrong: half ? [t(nx, 30), t(h, 0), t(nx, 0)] : [t(nx, 0), t(pv, 0), d ? t(h, 30) : t(far, 0)], hint, full: now });
  }, true),
];
