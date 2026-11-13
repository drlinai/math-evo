// 小二下 LV4（新加坡 P2 Term 4）：41 種題型。公升、有比例的圖畫統計圖、平面圖形的型式、五種立體，最後總複習。
// 每個題型只是「概念」：容器、主題、人名、顏色、數字每次都隨機換。
import { Q, def, L, pl, rnd, pick, shuffle, sample, range, chance, distinct, who } from './core.js?v=29';
import { row, col, fig, emo, label, seq, bigEq, shape, solid, jug, glass, pgraph, tally, table, svg, COLORS, SOLIDS, cname, sname, solidName } from './vis.js?v=29';

const T = { vol: ['容量', 'Volume', '🥛'], graph: ['圖畫統計圖', 'Picture graphs', '📊'], shape: ['平面圖形', '2D shapes', '🔺'], solid: ['立體', '3D shapes', '🧊'], review: ['總複習', 'Review', '🏁'], bonus: ['加分題', 'Bonus', '⭐'] };
const INK = '#2b2140', CK = Object.keys(COLORS), SK = Object.keys(SOLIDS);
const sh = (k, c, s = 80, rot = 0) => shape(k, { c: COLORS[c].c, s, rot });
const two = (lo, hi) => distinct(2, lo, hi);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const lit = (n) => L(`${n} 公升`, `${n} ${pl(n, 'litre', 'litres')}`);
const LU = () => L('公升', 'L');
// n 個不同的人
const people = (n) => { const r = []; while (r.length < n) { const p = who(); if (!r.some((x) => x.en === p.en)) r.push(p); } return r; };
// 形狀名稱（半圓形的英文用 semicircle）
const nm = (k) => (k === 'semi' ? L('半圓形', 'semicircle') : sname(k));

// ---------- 容量用的資料 ----------
const DRINKS = [['水', 'water', '#6cc6ff'], ['柳橙汁', 'orange juice', '#ffb347'], ['葡萄汁', 'grape juice', '#b58cff'], ['草莓牛奶', 'strawberry milk', '#ff9fc0']];
const POTS = [['🍶', '瓶子', 'bottle'], ['🏺', '花瓶', 'vase'], ['🪣', '水桶', 'pail'], ['🫖', '茶壺', 'teapot'], ['🍯', '罐子', 'jar'], ['🍲', '湯鍋', 'pot']];
const LESS1 = [['☕', '一杯咖啡', 'a cup of coffee'], ['🥛', '一杯牛奶', 'a glass of milk'], ['🧃', '一盒果汁', 'a packet of juice'], ['🥫', '一罐湯', 'a can of soup'], ['🥄', '一湯匙的水', 'a spoonful of water'], ['🍵', '一杯茶', 'a cup of tea']];
const MORE1 = [['🛁', '一缸洗澡水', 'a bathtub of water'], ['🪣', '一大桶水', 'a big pail of water'], ['🐠', '魚缸裡的水', 'the water in a fish tank'], ['🏊', '游泳池的水', 'the water in a swimming pool'], ['🛢️', '一大桶油', 'a big drum of oil']];
const TANKS = [['🚰', '水槽', 'tank'], ['🐠', '魚缸', 'fish tank'], ['🛁', '浴缸', 'bathtub'], ['🏊', '小泳池', 'paddling pool']];
const HOLD = [['🪣', '水桶', 'pail', 'pails'], ['🍶', '瓶子', 'bottle', 'bottles'], ['🍯', '罐子', 'jar', 'jars'], ['🛢️', '大桶子', 'drum', 'drums']];
const SENS = [['🪣', '一個水桶', 'a pail', 10, 500], ['🛁', '一個浴缸', 'a bathtub', 200, 2], ['🐠', '一個魚缸', 'a fish tank', 40, 900], ['🍲', '一個湯鍋', 'a soup pot', 5, 500],
  ['🫖', '一個茶壺', 'a teapot', 1, 100], ['🧴', '一大瓶洗髮精', 'a big bottle of shampoo', 1, 80], ['🚰', '一個洗手台', 'a sink', 8, 800], ['🥤', '一大瓶汽水', 'a big bottle of cola', 2, 200]];

// ---------- 圖畫統計圖用的資料 ----------
// 主題：東西（zh 名稱、m 量詞、en/ens）＋動作（v 中文、vb 英文原形、vp 英文過去式）
const GT = [
  { zh: '書', m: '本', en: 'book', ens: 'books', v: '讀了', vb: 'read', vp: 'read' }, { zh: '貼紙', m: '張', en: 'sticker', ens: 'stickers', v: '收集了', vb: 'collect', vp: 'collected' },
  { zh: '貝殼', m: '個', en: 'shell', ens: 'shells', v: '撿了', vb: 'pick up', vp: 'picked up' }, { zh: '餅乾', m: '片', en: 'cookie', ens: 'cookies', v: '烤了', vb: 'bake', vp: 'baked' },
  { zh: '魚', m: '條', en: 'fish', ens: 'fish', v: '釣了', vb: 'catch', vp: 'caught' }, { zh: '蘋果', m: '顆', en: 'apple', ens: 'apples', v: '摘了', vb: 'pick', vp: 'picked' },
  { zh: '紙飛機', m: '架', en: 'paper plane', ens: 'paper planes', v: '摺了', vb: 'fold', vp: 'folded' }, { zh: '球', m: '顆', en: 'goal', ens: 'goals', v: '踢進了', vb: 'score', vp: 'scored' },
];
const SYMS = [['⭐', '星星', 'star'], ['❤️', '愛心', 'heart'], ['🔵', '圓圈', 'circle'], ['😀', '笑臉', 'smiley'], ['🔺', '三角形', 'triangle']];
// 隨機做一張有比例的圖：o.n 幾類、o.max 一列最多幾個符號、o.ks 可用的比例
function mkGraph(d, o = {}) {
  const th = pick(GT), [sym, szh, sen] = pick(SYMS), k = pick(o.ks ?? (d ? [2, 3, 4, 5, 10] : [2, 5, 10])), n = o.n ?? rnd(3, d ? 5 : 4), ps = people(n), ns = distinct(n, 1, o.max ?? 7);
  const key = L(`每個 ${sym} 代表 ${k} ${th.m}${th.zh}`, `Each ${sym} stands for ${k} ${th.ens}`), title = n <= 4 ? L(`小朋友${th.v}的${th.zh}`, `${cap(th.ens)} the children ${th.vp}`) : '';
  return { th, sym, sn: L(szh, sen), k, n, ps, ns, vals: ns.map((x) => x * k), key, html: pgraph(ps.map((p, i) => ({ t: p.n, n: ns[i] })), { sym, key, title }) };
}
// 讀圖題的選項：正確答案、只數符號沒有乘、多算或少算一個符號
const gopts = (ans, syms, k) => (ans > 20 ? undefined : [...new Set([ans, syms, ans + k, Math.max(1, ans - k), ans + 1, ans + 2])].slice(0, 4));
const CATS = [['🍎', '🍌', '🍇', '🍊', '🍓'], ['🐶', '🐱', '🐟', '🐰', '🐢'], ['⚽', '🏀', '🏸', '🏊', '🚴'], ['🚌', '🚗', '🚲', '🚶', '🚇']];
// 小張的圖畫統計圖（放在選項卡片裡）
const miniGraph = (cats, ns, sym) => `<div style="display:flex;flex-direction:column;gap:1px;font-size:19px;line-height:26px;text-align:left">${cats.map((c, i) => `<div style="display:flex"><span style="width:32px;border-right:3px solid ${INK};margin-right:6px">${c}</span><span>${sym.repeat(ns[i])}</span></div>`).join('')}</div>`;

// ---------- 平面圖形用的圖 ----------
const DIRS = [['上面', 'up'], ['右邊', 'right'], ['下面', 'down'], ['左邊', 'left']];
const B4 = ['circle', 'square', 'tri', 'rect'];
// 由基本形狀拼成的圖形（140×140）：parts 用到的形狀、d 畫法
const FIGS = [
  { parts: ['square', 'tri'], d: '<rect x="35" y="66" width="70" height="70"/><polygon points="70,10 122,66 18,66"/>' }, // 房子
  { parts: ['rect', 'tri'], d: '<rect x="58" y="92" width="24" height="44"/><polygon points="70,8 122,92 18,92"/>' }, // 樹
  { parts: ['circle', 'rect'], d: '<rect x="63" y="84" width="14" height="52"/><circle cx="70" cy="46" r="40"/>' }, // 棒棒糖
  { parts: ['rect', 'circle', 'circle'], d: '<rect x="10" y="36" width="120" height="54"/><circle cx="40" cy="106" r="18"/><circle cx="100" cy="106" r="18"/>' }, // 車子
  { parts: ['tri', 'semi'], d: '<polygon points="30,60 110,60 70,136"/><path d="M30,60 A40,40 0 0 1 110,60 Z"/>' }, // 冰淇淋
  { parts: ['rect', 'semi'], d: '<rect x="40" y="56" width="60" height="80"/><path d="M40,56 A30,30 0 0 1 100,56 Z"/>' }, // 拱門
  { parts: ['rect', 'tri', 'tri', 'tri'], d: '<rect x="50" y="46" width="40" height="72"/><polygon points="70,6 90,46 50,46"/><polygon points="50,86 50,118 22,118"/><polygon points="90,86 90,118 118,118"/>' }, // 火箭
  { parts: ['semi', 'tri'], d: '<path d="M20,86 A50,50 0 0 0 120,86 Z"/><polygon points="66,10 66,86 112,86"/>' }, // 帆船
  { parts: ['square', 'tri', 'tri'], d: '<rect x="30" y="52" width="80" height="80"/><polygon points="30,52 60,52 34,14"/><polygon points="110,52 80,52 106,14"/>' }, // 貓臉
  { parts: ['circle', 'circle', 'rect'], d: '<circle cx="70" cy="98" r="38"/><circle cx="70" cy="42" r="24"/><rect x="48" y="4" width="44" height="16"/>' }, // 雪人
];
const pkey = (parts) => [...parts].sort().join();
const figSvg = (f, c, s = 112) => `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg"><g fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round">${f.d}</g></svg>`;
// 一排拆開的形狀
const pieces = (parts, c, s = 40) => `<div class="vrow" style="gap:6px">${[...parts].sort().map((k) => shape(k, { c, s })).join('')}</div>`;
// 「1 個正方形和 2 個三角形」
const partsDesc = (parts) => [...new Set(parts)].map((k) => { const n = parts.filter((x) => x === k).length; return L(`${n} 個${nm(k)}`, `${n} ${nm(k)}${n > 1 ? 's' : ''}`); }).join(L(' 和 ', ' and '));
// 方格上的圖形（5×5 個格子點）：[原圖, 有一個角畫錯的圖]。每個圖都沒有左右或上下對稱。
const GRIDS = [
  [[[0, 0], [2, 0], [2, 2], [4, 2], [4, 4], [0, 4]], [[0, 0], [2, 0], [2, 3], [4, 3], [4, 4], [0, 4]]],
  [[[0, 0], [0, 4], [3, 4]], [[0, 0], [0, 4], [4, 4]]],
  [[[0, 1], [2, 1], [4, 4], [0, 4]], [[0, 1], [3, 1], [4, 4], [0, 4]]],
  [[[1, 1], [4, 1], [3, 3], [0, 3]], [[1, 1], [4, 1], [3, 4], [0, 4]]],
  [[[0, 0], [3, 0], [4, 1], [3, 4], [0, 4]], [[0, 0], [2, 0], [4, 1], [2, 4], [0, 4]]],
  [[[0, 4], [0, 2], [1, 2], [1, 1], [2, 1], [2, 0], [4, 0], [4, 4]], [[0, 4], [0, 3], [1, 3], [1, 1], [2, 1], [2, 0], [4, 0], [4, 4]]],
  [[[0, 0], [3, 0], [3, 2], [1, 2], [1, 4], [0, 4]], [[0, 0], [4, 0], [4, 2], [1, 2], [1, 4], [0, 4]]],
  [[[1, 0], [4, 1], [1, 4], [0, 1]], [[1, 0], [4, 2], [1, 4], [0, 1]]],
];
function gridFig(pts, c, s = 112) {
  let g = '';
  for (let i = 0; i <= 4; i++) g += `<line x1="${10 + i * 20}" y1="10" x2="${10 + i * 20}" y2="90" stroke="${INK}" stroke-width="1.5" opacity=".35"/><line x1="10" y1="${10 + i * 20}" x2="90" y2="${10 + i * 20}" stroke="${INK}" stroke-width="1.5" opacity=".35"/>`;
  return `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" fill="#fff"/>${g}<polygon points="${pts.map(([x, y]) => `${10 + x * 20},${10 + y * 20}`).join(' ')}" fill="${c}" fill-opacity=".8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
}

// ---------- 立體、總複習、加分題用的資料 ----------
const rc = () => COLORS[pick(CK)].c;
const BOX = ['cube', 'cuboid'];
const OBJ = [['🥫', '罐頭', 'a can', 'cylinder'], ['🔋', '電池', 'a battery', 'cylinder'], ['🕯️', '蠟燭', 'a candle', 'cylinder'], ['🥁', '鼓', 'a drum', 'cylinder'], ['🧻', '捲筒衛生紙', 'a toilet roll', 'cylinder'],
  ['🎲', '骰子', 'a dice', 'cube'], ['🧊', '冰塊', 'an ice cube', 'cube'], ['⚽', '足球', 'a football', 'sphere'], ['🏀', '籃球', 'a basketball', 'sphere'], ['🎾', '網球', 'a tennis ball', 'sphere'], ['🔮', '水晶球', 'a crystal ball', 'sphere'],
  ['📦', '紙箱', 'a box', 'cuboid'], ['🧱', '磚塊', 'a brick', 'cuboid'], ['🧃', '果汁盒', 'a juice box', 'cuboid'], ['📕', '厚厚的書', 'a thick book', 'cuboid']];
// 「cones, cylinders and spheres」
const listEn = (a) => (a.length === 1 ? a[0] : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const solidList = (ks) => L(ks.map(solidName).join('、'), cap(listEn(ks.map((k) => `${solidName(k)}s`))));
const UZ = ['公尺', '公分', '公斤', '公克', '公升'], UE = ['m', 'cm', 'kg', 'g', 'litres'];
// 選單位：[表情符號, 中文句子, 英文句子, 第幾個單位]
const UNITQ = [
  ['🏫', '教室的長度大約是 9 □。', 'A classroom is about 9 □ long.', 0], ['🌳', '一棵大樹大約高 12 □。', 'A tall tree is about 12 □ tall.', 0], ['🚌', '一輛公車大約長 12 □。', 'A bus is about 12 □ long.', 0], ['🏊', '游泳池的長度大約是 50 □。', 'A swimming pool is about 50 □ long.', 0],
  ['✏️', '一枝鉛筆大約長 15 □。', 'A pencil is about 15 □ long.', 1], ['📕', '課本的寬度大約是 20 □。', 'A textbook is about 20 □ wide.', 1], ['🥄', '一根湯匙大約長 14 □。', 'A spoon is about 14 □ long.', 1], ['🖐️', '手掌的寬度大約是 7 □。', 'Your hand is about 7 □ wide.', 1],
  ['🧒', '一個小朋友的體重大約是 25 □。', 'A child has a mass of about 25 □.', 2], ['🍉', '一顆西瓜大約重 4 □。', 'A watermelon has a mass of about 4 □.', 2], ['🐕', '一隻大狗大約重 30 □。', 'A big dog has a mass of about 30 □.', 2], ['🍚', '一大袋米大約重 5 □。', 'A big bag of rice has a mass of about 5 □.', 2],
  ['🥚', '一顆雞蛋大約重 60 □。', 'An egg has a mass of about 60 □.', 3], ['🍎', '一顆蘋果大約重 150 □。', 'An apple has a mass of about 150 □.', 3], ['🍪', '一片餅乾大約重 10 □。', 'A cookie has a mass of about 10 □.', 3], ['🍫', '一片巧克力大約重 100 □。', 'A bar of chocolate has a mass of about 100 □.', 3],
  ['🪣', '一個水桶大約可以裝 10 □的水。', 'A pail holds about 10 □ of water.', 4], ['🛁', '浴缸大約可以裝 200 □的水。', 'A bathtub holds about 200 □ of water.', 4], ['🥛', '一大瓶牛奶大約有 2 □。', 'A big bottle of milk holds about 2 □.', 4], ['🐠', '魚缸大約可以裝 40 □的水。', 'A fish tank holds about 40 □ of water.', 4],
];
// 正 n 邊形
const ngon = (n, c, s = 210) => `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="${range(0, n - 1).map((i) => { const a = (i * 2 * Math.PI) / n - Math.PI / 2; return `${(50 + 44 * Math.cos(a)).toFixed(1)},${(52 + 44 * Math.sin(a)).toFixed(1)}`; }).join(' ')}" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></svg>`;
const tx = (x, y, s, size = 22) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="900" text-anchor="middle" fill="${INK}">${s}</text>`;

export default [
  // ---- 容量 ----
  def(T.vol, '哪杯水多', 'Which glass has more?', (d) => {
    const n = d ? 3 : 2, lv = sample(d === 2 ? range(2, 9) : [1, 3, 5, 7, 9], n), more = chance(0.6), best = more ? Math.max(...lv) : Math.min(...lv), [zh, en, c] = pick(DRINKS);
    const sup = n === 2 ? L(more ? '比較多' : '比較少', more ? 'more' : 'less') : L(more ? '最多' : '最少', more ? 'the most' : 'the least');
    return Q.tap({ p: L(`哪一杯的${zh}${sup}？`, `Which glass has ${sup} ${en}?`), cards: lv.map((v) => [glass(v / 10, { w: 110, h: 190, c }), v === best]),
      hint: L('杯子都一樣大，看看誰的水位比較高。', 'The glasses are the same. Look at the level.'), full: L(`水位${more ? '最高' : '最低'}的那一杯，${zh}${sup}`, `The glass with the ${more ? 'highest' : 'lowest'} level has ${sup} ${en}`) });
  }),
  def(T.vol, '不同容器', 'Different containers', (d) => {
    const [A, B] = sample(POTS, 2), [a, b] = two(2, d ? 6 : 5), more = chance(0.6), win = (a > b) === more ? 0 : 1, W = win ? B : A, sizes = shuffle([70, 100]);
    const cups = (k) => `<div class="vrow" style="gap:4px">${range(1, k).map(() => glass(0.8, { w: 40, h: 54 })).join('')}</div>`;
    return Q.tap({ p: L(`把水倒進一樣的杯子裡。哪一個容器裝的水比較${more ? '多' : '少'}？`, `Pour the water into the same cups. Which one holds ${more ? 'more' : 'less'}?`),
      cards: [[col(emo(A[0], sizes[0]), cups(a)), win === 0], [col(emo(B[0], sizes[1]), cups(b)), win === 1]], hint: L('數數看，各倒滿了幾杯？', 'Count the cups each one fills.'),
      full: L(`${A[1]}倒滿 ${a} 杯，${B[1]}倒滿 ${b} 杯，${W[1]}裝的比較${more ? '多' : '少'}`, `The ${A[2]} fills ${a} cups and the ${B[2]} fills ${b} cups. The ${W[2]} holds ${more ? 'more' : 'less'}.`) });
  }),
  def(T.vol, '用杯數量', 'Measure with cups', (d) => {
    const n = d === 2 ? 3 : 2, ps = sample(POTS, n), ks = distinct(n, 2, d ? 10 : 6), big = chance(0.6), best = big ? Math.max(...ks) : Math.min(...ks), i = ks.indexOf(best);
    const word = n === 2 ? L(big ? '比較大' : '比較小', big ? 'greater' : 'smaller') : L(big ? '最大' : '最小', big ? 'greatest' : 'smallest');
    return Q.pick({ p: L(`${ps.map((P, j) => `${P[1]}可以倒滿 ${ks[j]} 杯`).join('，')}。哪一個的容量${word}？`, `${ps.map((P, j) => `The ${P[2]} fills ${ks[j]} cups.`).join(' ')} Which has the ${word} volume?`),
      scene: row(...ps.map((P, j) => fig(emo(P[0], 110), L(`${ks[j]} 杯`, `${ks[j]} cups`)))), right: L(ps[i][1], ps[i][2]), wrong: ps.filter((_, j) => j !== i).map((P) => L(P[1], P[2])),
      hint: L('倒滿越多杯，容量就越大。', 'More cups means a greater volume.'), full: L(`${ps[i][1]}可以倒滿 ${best} 杯，容量${word}`, `The ${ps[i][2]} fills ${best} cups. It has the ${word} volume.`) });
  }),
  def(T.vol, '和 1 公升比', 'More or less than 1 litre?', (d) => {
    const more = chance(0.5), [e, zh, en] = pick(more ? MORE1 : LESS1);
    return Q.pick({ p: L(`${zh}，比 1 公升多還是少？`, `Is ${en} more than or less than 1 litre?`), scene: row(fig(jug(1, 1, { w: 150, h: 150, unit: LU() }), lit(1)), emo(e, 150)),
      right: L(more ? '比 1 公升多' : '比 1 公升少', more ? 'more' : 'less'), wrong: [L(more ? '比 1 公升少' : '比 1 公升多', more ? 'less' : 'more')],
      hint: L('1 公升大約是一大盒牛奶那麼多。', '1 litre is about one big carton of milk.'), full: L(`${zh}比 1 公升${more ? '多' : '少'}`, `${cap(en)} is ${more ? 'more' : 'less'} than 1 litre`) });
  }),
  def(T.vol, '讀量杯', 'Read the measuring jug', (d) => {
    const max = d ? 10 : 5, v = rnd(1, max), c = pick(DRINKS)[2];
    return Q.num({ p: L('量杯裡的水有幾公升？', 'The volume of water is □ litres.'), say: L('量杯裡的水有幾公升？', 'What is the volume of water in litres?'), scene: jug(v, max, { w: 180, h: 270, unit: LU(), c }), ans: v, lo: 1, hi: max, unit: LU(),
      hint: L('看水面對到哪一條線。', 'Look at the line at the top of the water.'), full: L(`水有 ${v} 公升`, `The volume of water is ${lit(v)}`) });
  }),
  def(T.vol, '比較排序', 'Order by volume', (d) => {
    const ps = sample(POTS, 3), vs = d === 0 ? distinct(3, 1, 10) : d === 1 ? distinct(3, 5, 50) : (() => { const a = rnd(20, 90); return sample(range(a, a + 9), 3); })(), desc = chance(0.3), s = [...vs].sort((a, b) => (desc ? b - a : a - b));
    return Q.order({ p: desc ? L('照容量由最大到最小，依序點 3 個容器。', 'Arrange the 3 containers from the greatest volume to the smallest.') : L('照容量由最小到最大，依序點 3 個容器。', 'Arrange the 3 containers from the smallest volume to the greatest.'),
      items: ps.map((P, i) => [fig(emo(P[0], 70), lit(vs[i])), vs[i]]), desc, full: s.map(lit).join(' → ') });
  }),
  def(T.vol, '加減應用題', 'Volume: add and subtract', (d) => {
    const hi = [20, 100, 1000][d], kind = rnd(0, 3), b = rnd(2, Math.floor(hi * 0.45)), a = kind % 2 ? rnd(2, hi - b) : rnd(b + 2, hi), ans = kind % 2 ? a + b : a - b;
    const w = who(), [e, zh, en] = pick(TANKS), [c1, c2] = sample(CK, 2), [dz, de, dm] = pick([['牛奶', 'milk', '🥛'], ['果汁', 'juice', '🧃'], ['豆漿', 'soya milk', '🥛'], ['紅茶', 'tea', '🍵']]);
    const p = [L(`${zh}裡有 ${a} 公升的水，用掉了 ${b} 公升。還剩下幾公升？`, `A ${en} has ${a} litres of water. ${b} litres are used. How much water is left?`),
      L(`${zh}裡有 ${a} 公升的水，${w.n}又倒進 ${b} 公升。現在有幾公升？`, `A ${en} has ${a} litres of water. ${w.n} pours in ${b} more litres. How much water is there now?`),
      L(`${cname(c1)}水桶有 ${a} 公升的水，${cname(c2)}水桶有 ${b} 公升。${cname(c1)}水桶多了幾公升？`, `The ${cname(c1)} pail has ${a} litres of water. The ${cname(c2)} pail has ${b} litres. How many more litres does the ${cname(c1)} pail have?`),
      L(`店裡早上賣了 ${a} 公升的${dz}，下午賣了 ${b} 公升。一共賣了幾公升？`, `A shop sold ${a} litres of ${de} in the morning and ${b} litres in the afternoon. How many litres did it sell altogether?`)][kind];
    const scene = kind === 2 ? row(fig(emo('🪣', 110), `${cname(c1)}${L('：', ': ')}${lit(a)}`), fig(emo('🪣', 110), `${cname(c2)}${L('：', ': ')}${lit(b)}`)) : kind === 3 ? row(fig(emo(dm, 110), lit(a)), fig(emo(dm, 110), lit(b))) : emo(e, 160);
    return Q.num({ p, scene, ans, lo: Math.max(0, ans - 6), hi: ans + 6, unit: LU(), full: `${a} ${kind % 2 ? '+' : '−'} ${b} = ${ans}` });
  }),
  def(T.vol, '乘除應用題', 'Volume: multiply and divide', (d) => {
    const k = pick(d ? [2, 3, 4, 5, 10] : [2, 5, 10]), n = rnd(2, d ? 10 : 5), t = n * k, [e, zh, en, ens] = pick(HOLD), kind = d ? rnd(0, 2) : 0, w = who();
    const pics = (m) => `<div class="vrow wrap" style="max-width:660px;gap:4px 10px">${range(1, m).map(() => emo(e, 62)).join('')}</div>`;
    if (kind === 0) return Q.num({ p: L(`每個${zh}裝 ${k} 公升的水。${n} 個${zh}一共裝幾公升？`, `Each ${en} holds ${k} litres. How much do ${n} ${ens} hold?`), scene: pics(n), ans: t, lo: Math.max(0, t - 6), hi: t + 6, unit: LU(),
      hint: L(`${k} 個一數，數 ${n} 次。`, `Count in ${k}s, ${n} times.`), full: `${n} × ${k} = ${t}` });
    if (kind === 1) return Q.num({ p: L(`${w.n}把 ${t} 公升的水平分倒進 ${k} 個${zh}。每個${zh}有幾公升？`, `${w.n} pours ${t} litres of water equally into ${k} ${ens}. How many litres are in each ${en}?`), scene: pics(k), ans: n, lo: 1, hi: 12, unit: LU(), full: `${t} ÷ ${k} = ${n}` });
    return Q.num({ p: L(`有 ${t} 公升的水，每個${zh}裝 ${k} 公升。要用幾個${zh}？`, `There are ${t} litres of water. Each ${en} holds ${k} litres. How many ${ens} are needed?`), scene: row(emo(e, 150), label(lit(k), 'big')), ans: n, lo: 1, hi: 12, full: `${t} ÷ ${k} = ${n}` });
  }),
  def(T.vol, '選合理的量', 'A sensible amount', (d) => {
    const [e, zh, en, r, w] = pick(SENS);
    return Q.pick({ p: L(`${zh}大約可以裝多少？`, `About how much does ${en} hold?`), scene: emo(e, 170), right: lit(r), wrong: [lit(w)], hint: L('想想看：1 公升大約是一大盒牛奶。', 'Think: 1 litre is about one big carton of milk.'),
      full: L(`${zh}大約可以裝 ${r} 公升`, `${cap(en)} holds about ${lit(r)}`) });
  }),
  // ---- 圖畫統計圖（一個符號代表好幾個）----
  def(T.graph, '讀有比例的圖', 'Read a graph with a scale', (d) => {
    const g = mkGraph(d), i = rnd(0, g.n - 1), { th, k } = g, P = g.ps[i], ans = g.vals[i];
    return Q.num({ p: L(`每個${g.sn}代表 ${k} ${th.m}${th.zh}。${P.n}${th.v}幾${th.m}${th.zh}？`, `Each ${g.sn} stands for ${k} ${th.ens}. How many ${th.ens} did ${P.n} ${th.vb}?`), scene: g.html, ans, opts: gopts(ans, g.ns[i], k),
      hint: L(`先數${P.n}有幾個${g.sn}，再乘以 ${k}。`, `Count the ${g.sn}s for ${P.n}, then multiply by ${k}.`), full: `${g.ns[i]} × ${k} = ${ans}` });
  }),
  def(T.graph, '最多最少', 'Most and fewest', (d) => {
    const g = mkGraph(d), { th } = g, most = chance(0.5), i = g.ns.indexOf(most ? Math.max(...g.ns) : Math.min(...g.ns)), P = g.ps[i];
    return Q.pick({ p: most ? L(`誰${th.v}最多${th.zh}？`, `Who ${th.vp} the most ${th.ens}?`) : L(`誰${th.v}最少${th.zh}？`, `Who ${th.vp} the fewest ${th.ens}?`), scene: g.html, right: P.n, wrong: g.ps.filter((_, j) => j !== i).map((p) => p.n),
      hint: most ? L('找找看，哪一列的圖案最多？', 'Which row has the most pictures?') : L('找找看，哪一列的圖案最少？', 'Which row has the fewest pictures?'),
      full: L(`${P.n}${th.v} ${g.vals[i]} ${th.m}${th.zh}，${most ? '最多' : '最少'}`, `${P.n} ${th.vp} ${g.vals[i]} ${th.ens}, the ${most ? 'most' : 'fewest'}`) });
  }),
  def(T.graph, '相差多少', 'How many more?', (d) => {
    const g = mkGraph(d), { th, k } = g, [i, j] = sample(range(0, g.n - 1), 2).sort((a, b) => g.ns[b] - g.ns[a]), A = g.ps[i], B = g.ps[j], ans = g.vals[i] - g.vals[j], fewer = d > 0 && chance(0.35);
    return Q.num({ p: fewer ? L(`${B.n}比${A.n}少${th.v}幾${th.m}${th.zh}？`, `How many fewer ${th.ens} did ${B.n} ${th.vb} than ${A.n}?`) : L(`${A.n}比${B.n}多${th.v}幾${th.m}${th.zh}？`, `How many more ${th.ens} did ${A.n} ${th.vb} than ${B.n}?`),
      scene: g.html, ans, opts: gopts(ans, g.ns[i] - g.ns[j], k), hint: L(`先看差了幾個${g.sn}，再乘以 ${k}。`, `Find the difference in ${g.sn}s, then multiply by ${k}.`), full: `${g.vals[i]} − ${g.vals[j]} = ${ans}` });
  }),
  def(T.graph, '總數', 'How many altogether?', (d) => {
    const g = mkGraph(d, { n: d ? rnd(3, 4) : 3, max: 5 }), { th, k } = g, sum = g.ns.reduce((a, b) => a + b, 0), ans = sum * k;
    return Q.num({ p: L(`小朋友一共${th.v}幾${th.m}${th.zh}？`, `How many ${th.ens} did the children ${th.vb} altogether?`), scene: g.html, ans, opts: gopts(ans, sum, k),
      hint: L(`先數一共有幾個${g.sn}，再乘以 ${k}。`, `Count all the ${g.sn}s, then multiply by ${k}.`), full: `${sum} × ${k} = ${ans}` });
  }),
  def(T.graph, '該畫幾個', 'How many pictures to draw?', (d) => {
    const g = mkGraph(d, { n: 3, max: 6 }), { th, k } = g, i = rnd(0, 2), P = g.ps[i], n = g.ns[i], t = n * k;
    return Q.num({ p: L(`${P.n}${th.v} ${t} ${th.m}${th.zh}。每個${g.sn}代表 ${k} ${th.m}${th.zh}。要畫幾個${g.sn}？`, `${P.n} ${th.vp} ${t} ${th.ens}. Each ${g.sn} stands for ${k} ${th.ens}. How many ${g.sn}s do you draw?`),
      scene: pgraph(g.ps.map((p, j) => ({ t: p.n, n: j === i ? 0 : g.ns[j] })), { sym: g.sym, key: g.key }), ans: n, lo: 1, hi: 10, hint: L(`${t} 裡面有幾個 ${k}？`, `How many ${k}s are there in ${t}?`), full: `${t} ÷ ${k} = ${n}` });
  }),
  def(T.graph, '選比例', 'Choose the scale', (d) => {
    let os, k, nums;
    do { os = d ? sample([2, 3, 4, 5, 10], 3).sort((a, b) => a - b) : [2, 5, 10]; k = pick(os); nums = distinct(3, 1, 6).map((x) => x * k); } while (Math.max(...os.filter((o) => nums.every((x) => x % o === 0))) !== k);
    const th = pick(GT), ps = people(3);
    return Q.num({ p: L(`數量是 ${nums.join('、')}。每個圖案代表多少最適合？`, `The numbers are ${nums[0]}, ${nums[1]} and ${nums[2]}. Which scale is best: ${os[0]}, ${os[1]} or ${os[2]}?`),
      scene: table([[L('名字', 'Name'), ...ps.map((p) => p.n)], [L(`${th.zh}（${th.m}）`, cap(th.ens)), ...nums]]), ans: k, opts: os,
      hint: L('每個數量都要剛好分完，而且圖案不要畫太多。', 'Every number must divide exactly, and you should not need too many pictures.'),
      full: L(`每個圖案代表 ${k}，要畫 ${nums.map((x) => x / k).join('、')} 個`, `With a scale of ${k}, you draw ${nums.map((x) => x / k).join(', ')} pictures`) });
  }),
  def(T.graph, '由畫記表做圖', 'From tally chart to picture graph', (d) => {
    const n = d === 2 ? 4 : 3, k = d === 1 ? pick([2, 5]) : 2, cats = sample(pick(CATS), n), ns = distinct(n, 1, k === 5 ? 3 : 5), [sym, szh, sen] = pick(SYMS.slice(0, 4)), big = ns.indexOf(Math.max(...ns));
    const w1 = [...ns], i = rnd(0, n - 1), w2 = [...ns], [a, b] = sample(range(0, n - 1), 2);
    w1[i] += w1[i] > 1 && chance(0.5) ? -1 : 1; [w2[a], w2[b]] = [w2[b], w2[a]];
    return Q.tap({ p: L(`每個${szh}代表 ${k} 票。哪一張圖和畫記表一樣？`, `Each ${sen} stands for ${k} votes. Which picture graph matches the tally chart?`), top: table([cats, ns.map((x) => tally(x * k))]),
      right: miniGraph(cats, ns, sym), wrong: [miniGraph(cats, w1, sym), miniGraph(cats, w2, sym)], hint: L(`先數畫記有幾票，再想：這是幾個 ${k}？`, `Count the tally marks. How many ${k}s is that?`), full: `${ns[big] * k} ÷ ${k} = ${ns[big]}` });
  }),
  def(T.graph, '判斷對錯', 'True or false?', (d) => {
    const g = mkGraph(d, { n: d ? 4 : 3 }), { th, k } = g, kind = rnd(0, 2), ok = chance(0.5), [i, j] = sample(range(0, g.n - 1), 2).sort((a, b) => g.ns[b] - g.ns[a]), A = g.ps[i], B = g.ps[j], M = g.ps[g.ns.indexOf(Math.max(...g.ns))];
    const it = (x) => L(`${x} ${th.m}${th.zh}`, `${x} ${pl(x, th.en, th.ens)}`), real = g.vals[i] - g.vals[j];
    let s, full;
    if (kind === 0) { const x = ok ? real : pick([g.ns[i] - g.ns[j], real + k]); s = L(`${A.n}比${B.n}多${th.v} ${it(x)}`, `${A.n} ${th.vp} ${x} more ${pl(x, th.en, th.ens)} than ${B.n}`); full = L(`${A.n}比${B.n}多${th.v} ${it(real)}`, `${A.n} ${th.vp} ${real} more ${th.ens} than ${B.n}`); }
    else if (kind === 1) { const x = ok ? g.vals[i] : pick([g.ns[i], g.vals[i] + k]); s = `${A.n}${L(th.v, ` ${th.vp}`)} ${it(x)}`; full = `${A.n}${L(th.v, ` ${th.vp}`)} ${it(g.vals[i])}`; }
    else { const X = ok ? M : B; s = L(`${X.n}${th.v}最多${th.zh}`, `${X.n} ${th.vp} the most ${th.ens}`); full = L(`${M.n}${th.v}最多${th.zh}`, `${M.n} ${th.vp} the most ${th.ens}`); }
    return Q.yn({ p: L(`「${s}。」對不對？`, `${s}. True or false?`), scene: g.html, yes: L('對', 'True'), no: L('不對', 'False'), ans: ok, hint: L(`別忘了，每個${g.sn}代表 ${k} ${th.m}。`, `Remember: each ${g.sn} stands for ${k}.`), full });
  }),
  def(T.graph, '兩步驟讀圖', 'Two-step graph questions', (d) => {
    const g = mkGraph(d, { max: 5 }), { th, k } = g, [i, j] = sample(range(0, g.n - 1), 2), A = g.ps[i], B = g.ps[j], ans = g.vals[i] + g.vals[j];
    return Q.num({ p: L(`${A.n}和${B.n}一共${th.v}幾${th.m}${th.zh}？`, `How many ${th.ens} did ${A.n} and ${B.n} ${th.vb} altogether?`), scene: g.html, ans, opts: gopts(ans, g.ns[i] + g.ns[j], k),
      hint: L('先算出每個人的數量，再加起來。', 'Find each number first, then add them.'), full: `${g.vals[i]} + ${g.vals[j]} = ${ans}` });
  }),
  // ---- 平面圖形 ----
  def(T.shape, '認形狀', 'Name the shape', (d) => {
    const all = ['circle', 'square', 'rect', 'tri', 'semi', 'quarter'], k = pick(d ? [...all, 'semi', 'quarter'] : all), c = pick(CK), rot = (x) => (x === 'circle' || x === 'square' ? 0 : x === 'rect' ? pick([0, 90]) : pick([0, 90, 180, 270]));
    const hint = L('半圓形是圓形的一半，四分之一圓是圓形切成 4 等份的其中一份。', 'A semicircle is half of a circle. A quarter circle is one of 4 equal parts of a circle.');
    if (d && chance(0.4)) return Q.tap({ p: L(`哪一個是${nm(k)}？`, `Which one is a ${nm(k)}?`), right: sh(k, c, 150, rot(k)), wrong: sample(all.filter((x) => x !== k), 3).map((x) => sh(x, d === 2 ? pick(CK) : c, 150, rot(x))), hint, full: nm(k) });
    return Q.pick({ p: L('這是什麼形狀？', 'Name the shape.'), scene: sh(k, c, 220, rot(k)), right: nm(k), wrong: sample(all.filter((x) => x !== k), 3).map(nm), hint, full: L(`這是${nm(k)}`, `This is a ${nm(k)}`) });
  }),
  def(T.shape, '圖形由什麼組成', 'What shapes make the figure?', (d) => {
    const f = pick(d ? FIGS : FIGS.filter((x) => x.parts.length === 2)), c = COLORS[pick(CK)].c, out = pick(['circle', 'square', 'rect', 'tri', 'semi'].filter((k) => !f.parts.includes(k))), i = rnd(0, f.parts.length - 1);
    const w1 = f.parts.map((k, j) => (j === i ? out : k)), w2 = [...f.parts, pick(f.parts)];
    return Q.tap({ p: L('這個圖形是用哪些形狀組成的？', 'Which shapes make up this figure?'), top: figSvg(f, c, 140), right: pieces(f.parts, c), wrong: [pieces(w1, c), pieces(w2, c)],
      hint: L('一個一個形狀找，也要數一數各有幾個。', 'Find each shape, and count how many of each.'), full: partsDesc(f.parts) });
  }),
  def(T.shape, '拼圖形', 'Make the figure', (d) => {
    const f = pick(FIGS), c = COLORS[pick(CK)].c, wrong = sample(FIGS.filter((x) => pkey(x.parts) !== pkey(f.parts)), 2);
    return Q.tap({ p: L('用上面這些形狀，可以拼出哪一個圖形？', 'Use these shapes. Which figure can you make?'), top: pieces(f.parts, c, 72), right: figSvg(f, c), wrong: wrong.map((x) => figSvg(x, c)),
      hint: L('每一個形狀都要用到，不能多也不能少。', 'Use every shape, no more and no fewer.'), full: partsDesc(f.parts) });
  }),
  def(T.shape, '方格描圖', 'Copy the figure on the grid', (d) => {
    const [P, alt] = pick(GRIDS), r = rnd(0, 3), c = COLORS[pick(CK)].c, turn = (pts) => { let q = pts; for (let i = 0; i < r; i++) q = q.map(([x, y]) => [4 - y, x]); return q; }, A = turn(P);
    return Q.tap({ p: L('把上面的圖形照樣畫在方格上。哪一張畫得一模一樣？', 'Copy the figure on the grid. Which copy is exactly the same?'), top: gridFig(A, c, 132), right: gridFig(A, c), wrong: [gridFig(A.map(([x, y]) => [4 - x, y]), c), gridFig(turn(alt), c)],
      hint: L('一個角一個角對對看，數數看在第幾格。', 'Check the corners one by one. Count the squares.'), full: L('每個角都要畫在一樣的格子點上', 'Every corner must be on the same point of the grid') });
  }),
  def(T.shape, '形狀型式', 'Shape patterns', (d) => {
    const ks = sample(['circle', 'tri', 'square'], 3), c = pick(CK), u = pick(d ? [[0, 1, 2], [0, 0, 1], [0, 1, 1], [0, 1]] : [[0, 1], [0, 1, 2]]), n = rnd(u.length * 2, u.length * 2 + 2), k = ks[u[n % u.length]], s = n > 6 ? 52 : 64;
    return Q.pick({ p: L('接下來是哪一個？', 'What comes next?'), scene: seq([...range(0, n - 1).map((i) => sh(ks[u[i % u.length]], c, s)), '?'], 'pat'), right: sh(k, c, 96), wrong: ks.filter((x) => x !== k).map((x) => sh(x, c, 96)),
      hint: L('找找看，哪一小段一直重複？', 'Find the part that repeats.'), full: L(`接下來是${sname(k)}`, `Next comes a ${sname(k)}`) });
  }),
  def(T.shape, '大小或顏色型式', 'Size and colour patterns', (d) => {
    const k = pick(['circle', 'square', 'tri', 'star', 'heart']), u = pick(d ? [[0, 1], [0, 0, 1], [0, 1, 1]] : [[0, 1], [0, 0, 1]]), n = rnd(u.length * 2, u.length * 2 + 2), at = (i) => u[i % u.length], p = L('接下來是哪一個？', 'What comes next?');
    if (chance(0.5)) {
      const c = pick(CK), sz = shuffle([64, 34]), big = sz[at(n)] === 64;
      return Q.pick({ p, scene: seq([...range(0, n - 1).map((i) => sh(k, c, sz[at(i)] * (n > 6 ? 0.85 : 1))), '?'], 'pat'), right: sh(k, c, big ? 110 : 56), wrong: [sh(k, c, big ? 56 : 110)],
        hint: L('看大小：哪一小段一直重複？', 'Look at the sizes. Which part repeats?'), full: L(`接下來是${big ? '大' : '小'}的`, `Next comes a ${big ? 'big' : 'small'} one`) });
    }
    const cs = sample(CK, 3), u2 = d && chance(0.3) ? [0, 1, 2] : u, m = u2 === u ? n : rnd(6, 8), c = cs[u2[m % u2.length]];
    return Q.pick({ p, scene: seq([...range(0, m - 1).map((i) => sh(k, cs[u2[i % u2.length]], m > 6 ? 52 : 64)), '?'], 'pat'), right: sh(k, c, 96), wrong: cs.filter((x) => x !== c).map((x) => sh(k, x, 96)),
      hint: L('看顏色：哪一小段一直重複？', 'Look at the colours. Which part repeats?'), full: L(`接下來是${cname(c)}`, `Next comes ${cname(c)}`) });
  }),
  def(T.shape, '方向型式', 'Turning patterns', (d) => {
    const k = d === 2 && chance(0.5) ? pick(['semi', 'quarter', 'tri']) : 'arrow', c = pick(CK), start = rnd(0, 3), step = d && chance(0.4) ? 3 : 1, n = rnd(4, 6), at = (i) => (start + i * step) % 4, a = at(n);
    return Q.pick({ p: k === 'arrow' ? L('下一個箭頭指向哪一邊？', 'Which way does the next arrow point?') : L('接下來是哪一個？', 'What comes next?'), scene: seq([...range(0, n - 1).map((i) => sh(k, c, 62, at(i) * 90)), '?'], 'pat'),
      right: sh(k, c, 96, a * 90), wrong: [1, 2, 3].map((x) => sh(k, c, 96, ((a + x) % 4) * 90)), hint: L('每次都轉四分之一圈。看看是往哪邊轉？', 'It makes a quarter turn each time. Which way does it turn?'),
      full: k === 'arrow' ? L(`每次轉四分之一圈，接下來指向${DIRS[a][0]}`, `A quarter turn each time. Next it points ${DIRS[a][1]}`) : L('每次都轉四分之一圈', 'It makes a quarter turn each time') });
  }),
  def(T.shape, '兩個屬性的型式', 'Shape and colour change together', (d) => {
    const ks = sample(B4, 3), cs = sample(CK, 3), [sp, cp] = d ? pick([[2, 3], [3, 2]]) : [2, 2], n = d ? rnd(6, 8) : rnd(4, 6), el = (i) => [ks[i % sp], cs[i % cp]], [k, c] = el(n), k2 = ks[(n + 1) % sp], c2 = cs[(n + 1) % cp], s = n > 6 ? 52 : 64;
    return Q.pick({ p: L('接下來是哪一個？', 'What comes next?'), scene: seq([...range(0, n - 1).map((i) => sh(...el(i), s)), '?'], 'pat'), right: sh(k, c, 96), wrong: [sh(k, c2, 96), sh(k2, c, 96), sh(k2, c2, 96)],
      hint: L('形狀和顏色分開看，各自找規律。', 'Look at the shapes first, then the colours.'), full: L(`接下來是${cname(c)}的${sname(k)}`, `Next comes the ${cname(c)} ${sname(k)}`) });
  }),
  def(T.shape, '型式找錯', 'Which one breaks the pattern?', (d) => {
    const ks = sample(B4, 3), cs = sample(CK, 3), u = pick([[0, 1], [0, 1, 2], [0, 0, 1]]), el = (j) => [d === 1 ? ks[0] : ks[j], d === 0 ? cs[0] : cs[j]]; // d=0 形狀變、1 顏色變、2 兩個都變
    const bad = u.length === 2 ? rnd(2, 6) : u[1] === 0 ? pick([3, 4, 6]) : rnd(3, 6), good = u[bad % u.length], alt = pick(u.filter((x) => x !== good)), [k, c] = el(good);
    return Q.tap({ p: L('這排型式裡，哪一個排錯了？', 'Which shape breaks the pattern?'), cards: range(0, 7).map((i) => [sh(...el(i === bad ? alt : u[i % u.length]), 70), i === bad]),
      hint: L('先找出一直重複的那一小段。', 'First find the part that repeats.'), full: L(`這裡應該是${cname(c)}的${sname(k)}`, `It should be the ${cname(c)} ${sname(k)}`) });
  }),
  def(T.shape, '自己做型式', 'Make your own pattern', (d) => {
    const AT = [['形狀', 'shape'], ['大小', 'size'], ['顏色', 'colour']], [x, y] = (d ? sample([0, 1, 2], 2) : [0, 1]).sort(), [k1, k2] = sample(['circle', 'square', 'tri'], 2), [c1, c2] = sample(CK, 2), big = chance(0.5);
    // on：哪些屬性會跟著變；order：每一格用第幾種
    const mk = (on, order = [0, 1, 0, 1, 0, 1]) => `<div class="vrow" style="gap:4px">${order.map((b) => sh(on.includes(0) && b ? k2 : k1, on.includes(2) && b ? c2 : c1, on.includes(1) ? ((b === 1) === big ? 38 : 22) : 32)).join('')}</div>`;
    const wrong = d === 2 ? [mk([pick([x, y])]), mk([x, y], [0, 1, 1, 0, 1, 0])] : [mk([x]), mk([y])];
    return Q.tap({ p: L(`哪一排是「${AT[x][0]}和${AT[y][0]}都會變」的型式？`, `Which row is a pattern that changes in ${AT[x][1]} and ${AT[y][1]}?`), right: mk([x, y]), wrong,
      hint: L('型式要一直重複，而且兩樣都要變。', 'A pattern repeats, and both things must change.'), full: L(`${AT[x][0]}和${AT[y][0]}輪流變，重複了 3 次`, `The ${AT[x][1]} and the ${AT[y][1]} both change, and the pattern repeats 3 times`) });
  }),
  // ---- 立體 ----
  def(T.solid, '命名', 'Name the solid', (d) => {
    const k = pick(SK), c = rc(), others = sample(SK.filter((x) => x !== k), 3);
    if (d && chance(0.4)) return Q.tap({ p: L(`哪一個是${solidName(k)}？`, `Which one is a ${solidName(k)}?`), right: solid(k, { c, s: 150 }), wrong: others.map((x) => solid(x, { c: d === 2 ? rc() : c, s: 150 })), full: solidName(k) });
    return Q.pick({ p: L('這是什麼立體？', 'Name the solid.'), scene: solid(k, { c, s: 220 }), right: solidName(k), wrong: others.map(solidName), full: L(`這是${solidName(k)}`, `This is a ${solidName(k)}`) });
  }),
  def(T.solid, '生活物品', 'Solids around us', (d) => {
    const [e, zh, en, k] = pick(OBJ), wrong = sample(SK.filter((x) => x !== k && !(BOX.includes(x) && BOX.includes(k))), 3).map(solidName);
    return Q.pick({ p: L(`${zh}的形狀像哪一種立體？`, `${cap(en)} is a □.`), say: L(`${zh}的形狀像哪一種立體？`, `What solid is ${en}?`), scene: emo(e, 170), right: solidName(k), wrong, full: L(`${zh}是${solidName(k)}`, `${cap(en)} is a ${solidName(k)}`) });
  }),
  def(T.solid, '平面與曲面', 'Flat and curved faces', (d) => {
    const k = pick(SK), S = SOLIDS[k], n = solidName(k), scene = solid(k, { c: rc(), s: 210 }), kind = d ? rnd(0, 2) : rnd(0, 1), yes = L('有', 'Yes'), no = L('沒有', 'No');
    const flat = S.flat ? L(`${n}有 ${S.flat} 個平面`, `A ${n} has ${S.flat} flat ${pl(S.flat, 'face', 'faces')}`) : L(`${n}沒有平面`, `A ${n} has no flat faces`);
    if (kind === 0) return Q.yn({ p: L(`${n}有平平的面嗎？`, `Does a ${n} have a flat face?`), scene, yes, no, ans: S.flat > 0, full: flat });
    if (kind === 1) return Q.yn({ p: L(`${n}有彎彎的曲面嗎？`, `Does a ${n} have a curved face?`), scene, yes, no, ans: S.curved, full: S.curved ? L(`${n}有彎彎的曲面`, `A ${n} has a curved face`) : L(`${n}沒有曲面，每個面都是平的`, `A ${n} has no curved face. All its faces are flat`) });
    return Q.num({ p: L(`${n}有幾個平平的面？`, `How many flat faces does a ${n} have?`), scene, ans: S.flat, opts: [0, 1, 2, 6], hint: L('看不到的背面和底下也要算喔。', 'Remember the faces at the back and underneath.'), full: flat });
  }),
  def(T.solid, '會滾會疊', 'Roll or stack?', (d) => {
    const kind = d === 2 ? rnd(0, 3) : rnd(0, 1), test = [(S) => S.roll, (S) => S.stack, (S) => S.roll && S.stack, (S) => !S.roll][kind], ok = SK.filter((k) => test(SOLIDS[k]));
    const p = [L('哪些立體會滾動？全部找出來。', 'Which solids can roll? Find them all.'), L('哪些立體可以一個一個疊高？全部找出來。', 'Which solids can stack? Find them all.'), L('哪一種立體會滾動，也可以疊高？', 'Which solid can roll and can also stack?'), L('哪些立體不會滾動？全部找出來。', 'Which solids cannot roll? Find them all.')][kind];
    const verb = [L('會滾動', ' can roll'), L('可以疊高', ' can stack'), L('會滾動，也可以疊高', ' can roll and stack'), L('不會滾動', ' cannot roll')][kind];
    return Q.multi({ p, items: SK.map((k) => [solid(k, { c: rc(), s: 120 }), test(SOLIDS[k])]), hint: L('有彎彎的曲面才會滾；上下都是平面才疊得穩。', 'A curved face lets a solid roll. Flat faces on top and bottom let it stack.'), full: solidList(ok) + verb });
  }),
  def(T.solid, '分類', 'Sort the solids', (d) => {
    const flatOnly = chance(0.5), real = d === 2 && chance(0.5), good = (k) => SOLIDS[k].curved !== flatOnly;
    const items = real ? sample(OBJ, 6).map(([e, , , k]) => [emo(e, 84), good(k)]) : [...SK, pick(SK)].map((k) => [solid(k, { c: rc(), s: 100 }), good(k)]);
    if (!items.some(([, ok]) => ok) || items.every(([, ok]) => ok)) items.splice(0, 2, [solid('cube', { c: rc(), s: 84 }), flatOnly], [solid('sphere', { c: rc(), s: 84 }), !flatOnly]);
    const thing = real ? L('東西', 'things') : L('立體', 'solids');
    return Q.multi({ p: flatOnly ? L(`把「只有平面」的${thing}全部找出來。`, `Find all the ${thing} with flat faces only.`) : L(`把「有曲面」的${thing}全部找出來。`, `Find all the ${thing} with a curved face.`), items,
      hint: L('摸摸看：有沒有彎彎的、會滾的面？', 'Is there a curved face that can roll?'), full: solidList(SK.filter(good)) + (flatOnly ? L('只有平面', ' have flat faces only') : L('有曲面', ' have a curved face')) });
  }),
  def(T.solid, '立體型式', 'Solid patterns', (d) => {
    const ks = sample(SK, 3), c = rc(), u = pick(d === 2 ? [[0, 1, 2], [0, 0, 1], [0, 1, 1]] : d ? [[0, 1], [0, 1, 2]] : [[0, 1]]), n = rnd(u.length * 2, u.length * 2 + 2), k = ks[u[n % u.length]], s = n > 6 ? 52 : 64;
    return Q.pick({ p: L('接下來是哪一個？', 'What comes next?'), scene: seq([...range(0, n - 1).map((i) => solid(ks[u[i % u.length]], { c, s })), '?'], 'pat'), right: solid(k, { c, s: 100 }), wrong: ks.filter((x) => x !== k).map((x) => solid(x, { c, s: 100 })),
      hint: L('找找看，哪一小段一直重複？', 'Find the part that repeats.'), full: L(`接下來是${solidName(k)}`, `Next comes a ${solidName(k)}`) });
  }),
  def(T.solid, '面的形狀', 'Shape of the flat face', (d) => {
    const [k, f, wrong] = pick([['cylinder', 'circle', ['square', 'tri', 'rect']], ['cone', 'circle', ['square', 'tri', 'rect']], ['cube', 'square', ['circle', 'tri']], ['cuboid', 'rect', ['circle', 'tri']]]), c = pick(CK), n = solidName(k);
    return Q.pick({ p: L(`${n}平平的面是什麼形狀？`, `What shape is the flat face of a ${n}?`), scene: solid(k, { c: COLORS[c].c, s: 210 }), right: sh(f, c, 100), wrong: wrong.map((x) => sh(x, c, 100)),
      hint: L('想像把平平的面沾上顏料，蓋在紙上。', 'Imagine pressing the flat face onto paper like a stamp.'), full: L(`${n}的平面是${sname(f)}`, `The flat face of a ${n} is a ${sname(f)}`) });
  }),
  // ---- 總複習 ----
  def(T.review, '四則快閃', 'Quick sums', (d) => {
    const op = pick(d ? ['+', '−', '×', '÷'] : ['+', '−', '×']);
    let a, b, ans;
    if (op === '×' || op === '÷') {
      const k = pick(d ? [2, 3, 4, 5, 10] : [2, 5, 10]), n = rnd(1, 10);
      if (op === '×') { [a, b] = chance(0.5) ? [n, k] : [k, n]; ans = n * k; } else { a = n * k; b = k; ans = n; }
    } else {
      const lo = d ? 100 : 10, hi = d ? 999 : 99, step = pick(d ? [1, 10, 100] : [1, 10]);
      b = rnd(1, step === 1 ? 9 : 8) * step; a = op === '+' ? rnd(lo, hi - b) : rnd(Math.max(lo, b + 1), hi); ans = op === '+' ? a + b : a - b;
    }
    return Q.num({ p: L(`${a} ${op} ${b} 是多少？`, `What is ${a} ${op} ${b}?`), scene: bigEq(`${a} ${op} ${b} = □`), ans, lo: Math.max(0, ans - 5), hi: ans + 5, full: `${a} ${op} ${b} = ${ans}` });
  }),
  def(T.review, '兩步驟應用題', 'Two-step word problems', (d) => {
    const w = who(), kind = rnd(0, 3), k = pick(d ? [2, 3, 4, 5, 10] : [2, 5, 10]), n = rnd(2, d ? 9 : 5), sep = L('，', ', '), hint = L('分兩步驟：先算第一步，再用答案算第二步。', 'Work in two steps. Use your first answer to find the second.');
    const opt = (ans) => ({ ans, lo: Math.max(0, ans - 6), hi: ans + 6, hint });
    if (kind === 0) { // 錢：先乘再加
      const [e, zh, m, ens] = pick([['✏️', '鉛筆', '枝', 'pencils'], ['🍞', '麵包', '個', 'buns'], ['🧃', '果汁', '盒', 'packets of juice'], ['📒', '筆記本', '本', 'notebooks']]), [e2, zh2, m2, en2] = pick([['📕', '書', '本', 'a book'], ['🧸', '玩具熊', '隻', 'a teddy bear'], ['🎂', '蛋糕', '個', 'a cake']]), c = rnd(5, d ? 30 : 12), ans = n * k + c;
      return Q.num({ p: L(`${w.n}買了 ${n} ${m}${zh}，每${m} ${k} 元，又買了一${m2} ${c} 元的${zh2}。一共花了幾元？`, `${w.n} buys ${n} ${ens} at $${k} each and ${en2} for $${c}. How much does ${w.he} spend altogether?`), scene: row(emo(e, 120), emo(e2, 120)), ...opt(ans), unit: L('元', ''), full: `${n} × ${k} = ${n * k}${sep}${n * k} + ${c} = ${ans}` });
    }
    if (kind === 1) { // 重量：先加再減
      const [e, zh, en] = pick([['🍚', '米', 'rice'], ['🥔', '馬鈴薯', 'potatoes'], ['🌾', '麵粉', 'flour'], ['🍎', '蘋果', 'apples']]), a = rnd(5, d ? 60 : 12), b = rnd(3, d ? 30 : 8), c = rnd(2, a + b - 2), ans = a + b - c;
      return Q.num({ p: L(`${w.n}家有 ${a} 公斤的${zh}，又買了 ${b} 公斤，後來用掉 ${c} 公斤。還剩下幾公斤？`, `${w.n} has ${a} kg of ${en}. ${w.He} buys ${b} kg more and then uses ${c} kg. How many kilograms of ${en} are left?`), scene: emo(e, 150), ...opt(ans), unit: L('公斤', 'kg'), full: `${a} + ${b} = ${a + b}${sep}${a + b} − ${c} = ${ans}` });
    }
    if (kind === 2) { // 容量：先乘再減
      const c = rnd(2, n * k - 2), ans = n * k - c;
      return Q.num({ p: L(`每個水桶裝 ${k} 公升的水。${w.n}把 ${n} 桶水倒進水槽，再用掉 ${c} 公升。還剩下幾公升？`, `Each pail holds ${k} litres. ${w.n} pours ${n} pails of water into a tank, then uses ${c} litres. How many litres are left?`), scene: row(emo('🪣', 120), emo('🚰', 120)), ...opt(ans), unit: LU(), full: `${n} × ${k} = ${n * k}${sep}${n * k} − ${c} = ${ans}` });
    }
    const [e, zh, en] = pick([['🎀', '緞帶', 'ribbon'], ['🪢', '繩子', 'rope'], ['🔌', '電線', 'wire']]), [uz, ue] = pick([['公分', 'cm'], ['公尺', 'm']]), c = rnd(2, d ? 30 : 10), t = n * k + c; // 長度：先減再除
    return Q.num({ p: L(`一條${zh}長 ${t} ${uz}。${w.n}剪掉 ${c} ${uz}後，把剩下的平分成 ${k} 段。每段長幾${uz}？`, `A ${en} is ${t} ${ue} long. ${w.n} cuts off ${c} ${ue} and cuts the rest into ${k} equal pieces. How long is each piece?`), scene: emo(e, 150), ...opt(n), unit: L(uz, ue), full: `${t} − ${c} = ${n * k}${sep}${n * k} ÷ ${k} = ${n}` });
  }),
  def(T.review, '選單位', 'Choose the unit', (d) => {
    const [e, zh, en, i] = pick(UNITQ);
    return Q.pick({ p: L(`${zh}□ 裡要填哪一個單位？`, `${en} Which unit: m, cm, kg, g or litres?`), say: L(`${zh.replace('□', '什麼')}要填哪一個單位？`, `${en.replace('□', 'what')} Which unit: metres, centimetres, kilograms, grams or litres?`), scene: emo(e, 170),
      right: L(UZ[i], UE[i]), wrong: range(0, 4).filter((j) => j !== i).map((j) => L(UZ[j], UE[j])), hint: L('先想：這是在量長度、重量，還是容量？', 'First think: is it a length, a mass or a volume?'), full: L(zh.replace('□', UZ[i]).replace('。', ''), en.replace('□', UE[i]).replace(/\.$/, '')) });
  }),
  // ---- 加分題（台灣二下）----
  def(T.bonus, '邊、角、頂點', 'Sides, angles and corners', (d) => {
    const [k, n, zh, en] = pick([['tri', 3, '三角形', 'triangle'], ['square', 4, '正方形', 'square'], ['rect', 4, '長方形', 'rectangle'], ...(d ? [[5, 5, '五邊形', 'pentagon'], [6, 6, '六邊形', 'hexagon']] : [])]), c = pick(CK), [wz, we] = pick([['邊', 'sides'], ['角', 'angles'], ['頂點', 'corners']]);
    return Q.num({ p: L(`${zh}有幾個${wz}？`, `How many ${we} does a ${en} have?`), scene: typeof k === 'number' ? ngon(k, COLORS[c].c) : sh(k, c, 210), ans: n, opts: [3, 4, 5, 6], hint: L('用手指一個一個點，邊點邊數。', 'Point and count them one by one.'),
      full: L(`${zh}有 ${n} 個邊、${n} 個角、${n} 個頂點`, `A ${en} has ${n} sides, ${n} angles and ${n} corners`) });
  }, true),
  def(T.bonus, '周長', 'Walk around the shape', (d) => {
    const cm = (v) => `${v} ${L('公分', 'cm')}`, st = `fill="${rc()}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"`, [e, zh, en] = pick([['🐜', '螞蟻', 'An ant'], ['🐞', '瓢蟲', 'A ladybird'], ['🐌', '蝸牛', 'A snail']]), kind = rnd(0, 2), hi = d ? 9 : 5;
    let sides, g;
    if (kind === 0) { const s = rnd(2, hi); sides = [s, s, s, s]; g = `<rect x="125" y="40" width="150" height="150" ${st}/>${tx(200, 30, cm(s))}${tx(200, 216, cm(s))}${tx(82, 122, cm(s))}${tx(318, 122, cm(s))}`; }
    else if (kind === 1) { const [h, w] = two(2, hi + 1).sort((a, b) => a - b); sides = [w, h, w, h]; g = `<rect x="90" y="60" width="220" height="110" ${st}/>${tx(200, 50, cm(w))}${tx(200, 196, cm(w))}${tx(48, 122, cm(h))}${tx(352, 122, cm(h))}`; }
    else { const p = rnd(3, hi), q = rnd(3, hi), [a, b, c] = [p, q, rnd(Math.max(3, Math.abs(p - q) + 1), Math.min(hi + 2, p + q - 1))].sort((x, y) => x - y); sides = [a, b, c]; /* 最長的邊畫在下面 */ g = `<polygon points="200,36 345,190 55,190" ${st}/>${tx(86, 106, cm(a))}${tx(314, 106, cm(b))}${tx(200, 218, cm(c))}`; }
    const ans = sides.reduce((x, y) => x + y, 0);
    return Q.num({ p: L(`${zh}沿著圖形的邊走一圈，一共走了幾公分？`, `${en} walks once around the shape. How long is the path?`), scene: row(emo(e, 70), svg(400, 226, g)), ans, lo: Math.max(0, ans - 5), hi: ans + 5, unit: L('公分', 'cm'),
      hint: L('把每一邊的長度都加起來。', 'Add the lengths of all the sides.'), full: `${sides.join(' + ')} = ${ans}` });
  }, true),
  def(T.bonus, '立體的面邊頂點', 'Faces, edges and corners', (d) => {
    const [zh, en, n] = pick([['面', 'faces', 6], ['邊', 'edges', 12], ['頂點', 'corners', 8]]), obj = d && chance(0.4) ? pick(OBJ.filter((o) => BOX.includes(o[3]))) : null, k = obj ? obj[3] : pick(BOX), s = solidName(k);
    return Q.num({ p: obj ? L(`${obj[1]}是${s}。它有幾個${zh}？`, `${cap(obj[2])} is a ${s}. How many ${en} does it have?`) : L(`${s}有幾個${zh}？`, `How many ${en} does a ${s} have?`), scene: obj ? emo(obj[0], 170) : solid(k, { c: rc(), s: 220 }), ans: n, opts: [4, 6, 8, 12],
      hint: L('看不到的背面和底下也要算喔。', 'Remember the ones at the back and underneath.'), full: L(`${s}有 6 個面、12 個邊、8 個頂點`, `A ${s} has 6 faces, 12 edges and 8 corners`) });
  }, true),
];
