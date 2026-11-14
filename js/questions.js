// 題目引擎：十以內加減。看得見數得到的東西 + 錢幣 + 純數字算式；繁中 / English
import { getLang, num } from './i18n.js?v=31';
import { icon } from './sprites.js?v=31';

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const em = (n) => `<em>${n}</em>`;
const zhM = (n) => (n === 2 ? '兩' : num(n)); // 中文量詞前的「兩」
const v = (n, s, p) => (n === 1 ? s : p); // 英文單複數
const EN = () => getLang() === 'en';

// ---- 可數物件（zh：地點/增加/減少的說法；en：單複數與句子）----
const ITEMS = {
  apple: { e: 'apple', bg: 'basket', zh: { n: '蘋果', m: '顆', place: '籃子裡', add: '又放進', sub: '吃掉了' }, en: { one: 'apple', many: 'apples', place: 'in the basket', add: (B) => `You put in ${B} more.`, sub: (B) => `You eat ${B}.` } },
  pig: { e: 'pig', bg: 'pen', zh: { n: '小豬', m: '隻', place: '豬圈裡', add: '又跑進來', sub: '跑掉了' }, en: { one: 'pig', many: 'pigs', place: 'in the pen', add: (B, n) => `${B} more ${v(n, 'runs', 'run')} in.`, sub: (B, n) => `${B} ${v(n, 'runs', 'run')} away.` } },
  duck: { e: 'duck', bg: 'pond', zh: { n: '鴨子', m: '隻', place: '池塘裡', add: '又游來了', sub: '游走了' }, en: { one: 'duck', many: 'ducks', place: 'in the pond', add: (B, n) => `${B} more ${v(n, 'swims', 'swim')} over.`, sub: (B, n) => `${B} ${v(n, 'swims', 'swim')} away.` } },
  bird: { e: 'bird', bg: 'tree', zh: { n: '小鳥', m: '隻', place: '樹上', add: '又飛來了', sub: '飛走了' }, en: { one: 'bird', many: 'birds', place: 'in the tree', add: (B, n) => `${B} more ${v(n, 'flies', 'fly')} in.`, sub: (B, n) => `${B} ${v(n, 'flies', 'fly')} away.` } },
  fish: { e: 'fish', bg: 'sea', zh: { n: '小魚', m: '條', place: '海裡', add: '又游來了', sub: '游走了' }, en: { one: 'fish', many: 'fish', place: 'in the sea', add: (B, n) => `${B} more ${v(n, 'swims', 'swim')} over.`, sub: (B, n) => `${B} ${v(n, 'swims', 'swim')} away.` } },
  chick: { e: 'chick', bg: 'pen', zh: { n: '小雞', m: '隻', place: '雞舍裡', add: '又孵出了', sub: '跑出去了' }, en: { one: 'chick', many: 'chicks', place: 'in the coop', add: (B, n) => `${B} more ${v(n, 'hatches', 'hatch')}.`, sub: (B, n) => `${B} ${v(n, 'runs', 'run')} outside.` } },
  frog: { e: 'frog', bg: 'pond', zh: { n: '青蛙', m: '隻', place: '荷葉上', add: '又跳上來', sub: '跳進水裡' }, en: { one: 'frog', many: 'frogs', place: 'on the lily pad', add: (B, n) => `${B} more ${v(n, 'hops', 'hop')} on.`, sub: (B, n) => `${B} ${v(n, 'jumps', 'jump')} into the water.` } },
  butterfly: { e: 'butterfly', bg: 'garden', zh: { n: '蝴蝶', m: '隻', place: '花園裡', add: '又飛來了', sub: '飛走了' }, en: { one: 'butterfly', many: 'butterflies', place: 'in the garden', add: (B, n) => `${B} more ${v(n, 'flies', 'fly')} in.`, sub: (B, n) => `${B} ${v(n, 'flies', 'fly')} away.` } },
  egg: { e: 'dinoegg', bg: 'nest', zh: { n: '恐龍蛋', m: '顆', place: '窩裡', add: '又多了', sub: '孵出了', subM: '隻小恐龍', subTail: '，還剩下幾顆蛋？' }, en: { one: 'dinosaur egg', many: 'dinosaur eggs', place: 'in the nest', add: (B, n) => `${B} more ${v(n, 'appears', 'appear')}.`, sub: (B, n) => `${B} ${v(n, 'hatches', 'hatch')}.` } },
  cookie: { e: 'cookie', bg: 'plate', zh: { n: '餅乾', m: '片', place: '盤子裡', add: '又烤好了', sub: '吃掉了' }, en: { one: 'cookie', many: 'cookies', place: 'on the plate', add: (B, n) => `${B} more ${v(n, 'is', 'are')} baked.`, sub: (B) => `You eat ${B}.` } },
  balloon: { e: 'balloon', bg: 'party', zh: { n: '氣球', m: '顆', place: '派對上', add: '又拿來了', sub: '破掉了' }, en: { one: 'balloon', many: 'balloons', place: 'at the party', add: (B) => `You bring ${B} more.`, sub: (B, n) => `${B} ${v(n, 'pops', 'pop')}.` } },
  car: { e: 'car', bg: 'road', zh: { n: '小汽車', m: '輛', place: '停車場', add: '又開來了', sub: '開走了' }, en: { one: 'car', many: 'cars', place: 'in the parking lot', add: (B, n) => `${B} more ${v(n, 'drives', 'drive')} in.`, sub: (B, n) => `${B} ${v(n, 'drives', 'drive')} away.` } },
  candy: { e: 'candy', bg: 'plate', zh: { n: '糖果', m: '顆', place: '罐子裡', add: '又放進', sub: '吃掉了' }, en: { one: 'candy', many: 'candies', place: 'in the jar', add: (B) => `You put in ${B} more.`, sub: (B) => `You eat ${B}.` } },
};
// 第一欄是圖片名稱（img/*.webp）
const GOODS = [['lollipop', '棒棒糖', 'lollipop', 'a lollipop'], ['cookie', '餅乾', 'cookie', 'a cookie'], ['juice', '果汁', 'juice box', 'a juice box'], ['icecream', '冰淇淋', 'ice cream', 'an ice cream'], ['balloon', '氣球', 'balloon', 'a balloon'], ['teddy', '小熊', 'teddy bear', 'a teddy bear'], ['banana', '香蕉', 'banana', 'a banana'], ['pencil', '鉛筆', 'pencil', 'a pencil']];
const FILLS = [['star', '星星', '顆', 'star', 'stars'], ['egg', '蛋', '顆', 'egg', 'eggs'], ['cupcake', '杯子蛋糕', '個', 'cupcake', 'cupcakes']];
const inl = (name) => icon(name, 'pic inl'); // 句子裡的小圖

const itemsHTML = (e, n, cls = '', from = 0) => Array.from({ length: n }, (_, i) => `<span class="it ${cls}" style="--i:${from + i}">${icon(e)}<b></b></span>`).join('');
const coin = (val, extra = '') => `<span class="coin c${val} ${extra}" data-v="${val}"><i>${val}</i><b></b></span>`;
const coinsHTML = (vals, extra = '') => vals.map((x) => coin(x, extra)).join('');

function choices(ans) {
  const s = new Set([ans]);
  const cand = shuffle([ans - 1, ans + 1, ans - 2, ans + 2, ans + 3, ans - 3].filter((x) => x >= 0 && x <= 10));
  for (const c of cand) { if (s.size >= 4) break; s.add(c); }
  return [...s].sort((a, b) => a - b);
}
const maxN = (lv) => (lv <= 1 ? 6 : lv <= 3 ? 8 : 10);
const plusSay = (a, b, t) => (EN() ? `${a} plus ${b} equals ${t}` : `${num(a)}加${num(b)}等於${num(t)}`);
const minusSay = (a, b, r) => (EN() ? `${a} minus ${b} equals ${r}` : `${num(a)}減${num(b)}等於${num(r)}`);
const dollars = (n) => v(n, 'dollar', 'dollars');
const both = (fn) => ({ prompt: fn(em), say: fn((x) => (EN() ? x : zhM(x))) }); // 同一句話產生「畫面版」與「語音版」

// ---- 題型產生器 ----
function qAdd(key, lv) {
  const it = ITEMS[key], t = rnd(2, maxN(lv)), a = rnd(1, t - 1), b = t - a;
  const tx = EN()
    ? both((N) => `There ${v(a, 'is', 'are')} ${N(a)} ${v(a, it.en.one, it.en.many)} ${it.en.place}. ${it.en.add(N(b), b)} How many ${it.en.many} are there now?`)
    : { prompt: `${it.zh.place}有 ${em(a)} ${it.zh.m}${it.zh.n}，${it.zh.add} ${em(b)} ${it.zh.m}，現在一共有幾${it.zh.m}？`, say: `${it.zh.place}有${zhM(a)}${it.zh.m}${it.zh.n}，${it.zh.add}${zhM(b)}${it.zh.m}，現在一共有幾${it.zh.m}？` };
  return {
    type: 'choice', answer: t, choices: choices(t), ...tx,
    eq: `${a} + ${b} = ${t}`, eqSay: plusSay(a, b, t),
    render: (el) => { el.dataset.bg = it.bg; el.innerHTML = `<div class="grp base"><div class="items">${itemsHTML(it.e, a)}</div></div><div class="op">＋</div><div class="grp new"><div class="items">${itemsHTML(it.e, b, 'drop', a)}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.it')],
  };
}
function qSub(key, lv) {
  const it = ITEMS[key], a = rnd(2, maxN(lv)), b = rnd(1, a - 1), r = a - b;
  const z = it.zh, tail = z.subTail || `，還剩下幾${z.m}？`;
  const tx = EN()
    ? both((N) => `There ${v(a, 'is', 'are')} ${N(a)} ${v(a, it.en.one, it.en.many)} ${it.en.place}. ${it.en.sub(N(b), b)} How many ${it.en.many} are left?`)
    : { prompt: `${z.place}有 ${em(a)} ${z.m}${z.n}，${z.sub} ${em(b)}${z.subM || ' ' + z.m}${tail}`, say: `${z.place}有${zhM(a)}${z.m}${z.n}，${z.sub}${zhM(b)}${z.subM || z.m}${tail}` };
  return {
    type: 'choice', answer: r, choices: choices(r), ...tx,
    eq: `${a} − ${b} = ${r}`, eqSay: minusSay(a, b, r),
    render: (el) => { el.dataset.bg = it.bg; el.innerHTML = `<div class="grp base wide"><div class="items">${itemsHTML(it.e, r)}${itemsHTML(it.e, b, 'leave', r)}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.it:not(.leave)')],
  };
}
function qCoinAdd(lv) {
  const t = rnd(2, maxN(lv)), a = rnd(1, t - 1), b = t - a;
  const tx = EN()
    ? both((N) => `The piggy bank has ${N(a)} ${dollars(a)}. You put in ${N(b)} more. How many dollars are there now?`)
    : { prompt: `存錢筒裡有 ${em(a)} 元，又存進 ${em(b)} 元，現在一共有幾元？`, say: `存錢筒裡有${num(a)}元，又存進${num(b)}元，現在一共有幾元？` };
  return {
    type: 'choice', answer: t, choices: choices(t), ...tx,
    eq: `${a} + ${b} = ${t}`, eqSay: plusSay(a, b, t),
    render: (el) => { el.dataset.bg = 'piggy'; el.innerHTML = `<div class="grp base"><div class="items coins">${coinsHTML(Array(a).fill(1))}</div></div><div class="op">＋</div><div class="grp new"><div class="items coins">${coinsHTML(Array(b).fill(1), 'drop')}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.coin')],
  };
}
function qCoinSub(lv) {
  const a = rnd(3, maxN(lv)), b = rnd(1, a - 1), r = a - b, g = pick(GOODS);
  const tx = EN()
    ? both((N) => `You have ${N(a)} dollars. You buy ${g[3]} for ${N(b)} ${dollars(b)}. How many dollars are left?`)
    : { prompt: `你有 ${em(a)} 元，買了 ${em(b)} 元的${inl(g[0])}${g[1]}，還剩下幾元？`, say: `你有${num(a)}元，買了${num(b)}元的${g[1]}，還剩下幾元？` };
  return {
    type: 'choice', answer: r, choices: choices(r), ...tx,
    eq: `${a} − ${b} = ${r}`, eqSay: minusSay(a, b, r),
    render: (el) => { el.dataset.bg = 'shop'; el.innerHTML = `<div class="grp base wide"><div class="items coins">${coinsHTML(Array(r).fill(1))}${coinsHTML(Array(b).fill(1), 'leave')}</div></div><div class="goods">${icon(g[0])}</div>`; },
    countEls: (el) => [...el.querySelectorAll('.coin:not(.leave)')],
  };
}
function qCount5() {
  const two = Math.random() < 0.2, n1 = two ? 0 : rnd(1, 5), vals = two ? [5, 5] : [5, ...Array(n1).fill(1)], t = vals.reduce((x, y) => x + y, 0);
  const tx = EN()
    ? { prompt: 'Count the coins. How many dollars in total?', say: 'Count the coins. How many dollars in total? The big silver coin is 5 dollars.' }
    : { prompt: '數數看，這些硬幣一共是幾元？', say: '數數看，這些硬幣一共是幾元？五元硬幣是五元喔！' };
  return {
    type: 'choice', answer: t, choices: choices(t), ...tx,
    eq: two ? '5 + 5 = 10' : `5 + ${n1} = ${t}`, eqSay: plusSay(5, two ? 5 : n1, t),
    render: (el) => { el.dataset.bg = 'piggy'; el.innerHTML = `<div class="grp base wide"><div class="items coins big">${coinsHTML(vals, 'drop')}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.coin')],
  };
}
function qPay(lv) {
  const price = rnd(2, lv <= 3 ? 7 : 10), g = pick(GOODS);
  const best = price >= 10 ? [5, 5] : price >= 5 ? [5, ...Array(price - 5).fill(1)] : Array(price).fill(1);
  const tx = EN()
    ? {
      ...both((N) => `The ${g[2]} costs ${N(price)} ${dollars(price)}. Put the exact money on the tray!`), prompt: `${inl(g[0])} The ${g[2]} costs ${em(price)} ${dollars(price)}. Put the exact money on the tray!`,
      eqSay: `Exactly ${price} ${dollars(price)}`,
      payHint: `${price} dollars is ${price >= 10 ? 'two 5-dollar coins' : price >= 5 ? 'one 5-dollar coin' + (price > 5 ? ` and ${price - 5} 1-dollar ${v(price - 5, 'coin', 'coins')}` : '') : `${price} 1-dollar ${v(price, 'coin', 'coins')}`}`,
    }
    : {
      prompt: `${inl(g[0])} ${g[1]}要 ${em(price)} 元，請把剛剛好的錢放到盤子裡！`, say: `${g[1]}要${num(price)}元，請把剛剛好的錢，放到盤子裡！`,
      eqSay: `剛剛好${num(price)}元`,
      payHint: `${num(price)}元可以用${price >= 10 ? '兩個五元' : price >= 5 ? '一個五元' + (price > 5 ? `，加${zhM(price - 5)}個一元` : '') : `${zhM(price)}個一元`}`,
    };
  return {
    type: 'pay', answer: price, ...tx, goods: g[0],
    eq: best.length > 1 ? `${best.join(' + ')} = ${price}` : (EN() ? `$${price}` : `${price} 元`),
    render: (el, L) => {
      el.dataset.bg = 'shop';
      el.innerHTML = `<div class="shopitem"><span class="goods">${icon(g[0])}</span><div class="tag">${L.priceTag}</div></div>` +
        `<div class="tray" id="tray"><div class="traylabel">${L.trayLabel}</div><div class="traycoins"></div><div class="traysum"></div></div>` +
        `<div class="wallet" id="wallet"><div class="walletlabel">${L.walletLabel}</div><div class="walletcoins">${coinsHTML([5, 5, 1, 1, 1, 1, 1])}</div></div>`;
    },
  };
}
function qFill(lv) {
  const t = rnd(3, maxN(lv)), a = rnd(1, t - 1), b = t - a, it = pick(FILLS);
  const tx = EN()
    ? both((N) => `The box holds ${N(t)} ${it[4]}. There ${v(a, 'is', 'are')} ${N(a)} inside. How many more to fill it up?`)
    : { prompt: `盒子可以裝 ${em(t)} ${it[2]}${it[1]}，已經放了 ${em(a)} ${it[2]}，還要再放幾${it[2]}才會裝滿？`, say: `盒子可以裝${zhM(t)}${it[2]}${it[1]}，已經放了${zhM(a)}${it[2]}，還要再放幾${it[2]}才會裝滿？` };
  return {
    type: 'choice', answer: b, choices: choices(b), ...tx,
    eq: `${a} + ${b} = ${t}`, eqSay: plusSay(a, b, t),
    render: (el) => { el.dataset.bg = 'box'; el.innerHTML = `<div class="grp base wide"><div class="items slots">${itemsHTML(it[0], a)}${Array.from({ length: b }, () => '<span class="it slot"><b></b></span>').join('')}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.slot')],
  };
}

// ---- 純數字算式：3 + 3 = ?（答錯時才出現圓點幫忙數）----
const numHTML = (parts, dots) => `<div class="numwrap"><div class="numq">${parts.map((p) => (p === '?' ? '<span class="nqm">?</span>' : /[+−=]/.test(p) ? `<span class="nop">${p}</span>` : `<span>${p}</span>`)).join('')}</div><div class="numdots"><div class="items">${dots}</div></div></div>`;
function qNumber(lv, i) {
  const kind = lv >= 6 && Math.random() < 0.3 ? 'miss' : i === 0 ? 'add' : i === 1 ? 'sub' : pick(['add', 'sub']);
  const showDots = (el) => el.querySelector('.numwrap').classList.add('hinted');
  if (kind === 'sub') {
    const a = rnd(2, maxN(lv)), b = rnd(1, a - 1), r = a - b;
    return {
      type: 'choice', answer: r, choices: choices(r),
      prompt: EN() ? `What is ${em(a)} − ${em(b)}?` : `算算看：${em(a)} − ${em(b)} 等於多少？`,
      say: EN() ? `What is ${a} minus ${b}?` : `${num(a)}減${num(b)}，等於多少？`,
      eq: `${a} − ${b} = ${r}`, eqSay: minusSay(a, b, r),
      render: (el) => { el.dataset.bg = 'num'; el.innerHTML = numHTML([a, '−', b, '=', '?'], itemsHTML('🔵', r) + itemsHTML('🔵', b, 'gone', r)); },
      onHint: showDots, countEls: (el) => [...el.querySelectorAll('.it:not(.gone)')],
    };
  }
  const t = rnd(2, maxN(lv)), a = rnd(1, t - 1), b = t - a;
  if (kind === 'miss') {
    return {
      type: 'choice', answer: b, choices: choices(b),
      prompt: EN() ? `${em(a)} plus what equals ${em(t)}?` : `算算看：${em(a)} 加多少會等於 ${em(t)}？`,
      say: EN() ? `${a} plus what equals ${t}?` : `${num(a)}加多少，會等於${num(t)}？`,
      eq: `${a} + ${b} = ${t}`, eqSay: plusSay(a, b, t),
      render: (el) => { el.dataset.bg = 'num'; el.innerHTML = numHTML([a, '+', '?', '=', t], itemsHTML('🔵', a) + Array.from({ length: b }, () => '<span class="it slot"><b></b></span>').join('')); },
      onHint: showDots, countEls: (el) => [...el.querySelectorAll('.slot')],
    };
  }
  return {
    type: 'choice', answer: t, choices: choices(t),
    prompt: EN() ? `What is ${em(a)} + ${em(b)}?` : `算算看：${em(a)} + ${em(b)} 等於多少？`,
    say: EN() ? `What is ${a} plus ${b}?` : `${num(a)}加${num(b)}，等於多少？`,
    eq: `${a} + ${b} = ${t}`, eqSay: plusSay(a, b, t),
    render: (el) => { el.dataset.bg = 'num'; el.innerHTML = numHTML([a, '+', b, '=', '?'], itemsHTML('🔵', a) + itemsHTML('🟠', b, '', a)); },
    onHint: showDots, countEls: (el) => [...el.querySelectorAll('.it')],
  };
}

// ---- 關卡定義 ----
const itemStage = (key) => ({ id: key, icon: icon(ITEMS[key].e), min: 1, kind: 'item', gen: (lv, i) => ((i === 0 ? true : i === 1 ? false : Math.random() < 0.5) ? qAdd(key, lv) : qSub(key, lv)) });
export const STAGES = [
  itemStage('apple'), itemStage('pig'), itemStage('duck'), itemStage('bird'), itemStage('fish'), itemStage('chick'),
  itemStage('frog'), itemStage('butterfly'), itemStage('egg'), itemStage('cookie'), itemStage('balloon'), itemStage('car'), itemStage('candy'),
  { id: 'piggy', icon: icon('piggybank'), min: 1, kind: 'money', gen: (lv, i) => (i === 1 ? qCoinSub(lv) : qCoinAdd(lv)) },
  { id: 'count5', icon: '💰', min: 2, kind: 'money', gen: () => qCount5() },
  { id: 'shop', icon: '🛒', min: 3, kind: 'money', gen: (lv) => qPay(lv) },
  { id: 'change', icon: '🧾', min: 4, kind: 'money', gen: (lv) => qCoinSub(lv) },
  { id: 'fill', icon: icon('gift'), min: 3, kind: 'special', gen: (lv) => qFill(lv) },
  { id: 'number', icon: '🔢', min: 1, kind: 'number', gen: (lv, i) => qNumber(lv, i) },
];

// 一次任務 = 3 關：數東西 → 錢幣（偶爾換成特別關）→ 純數字算式（由具體到抽象）
export function pickStages(level) {
  const ok = STAGES.filter((s) => s.min <= level);
  const item = pick(ok.filter((s) => s.kind === 'item'));
  const special = ok.filter((s) => s.kind === 'special');
  const mid = special.length && Math.random() < 0.3 ? pick(special) : pick(ok.filter((s) => s.kind === 'money'));
  return [item, mid, ok.find((s) => s.kind === 'number')];
}
