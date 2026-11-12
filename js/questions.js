// 題目引擎：十以內加減，全部用看得見、數得到的東西出題
const ZH = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export const zh = (n) => ZH[n] ?? String(n);
const zhM = (n) => (n === 2 ? '兩' : zh(n)); // 量詞前的「兩」
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const em = (n) => `<em>${n}</em>`;

// ---- 可數物件：地點、增加與減少的說法 ----
const ITEMS = {
  apple: { e: '🍎', n: '蘋果', m: '顆', place: '籃子裡', add: '又放進', sub: '吃掉了', bg: 'basket' },
  pig: { e: '🐷', n: '小豬', m: '隻', place: '豬圈裡', add: '又跑進來', sub: '跑掉了', bg: 'pen' },
  duck: { e: '🦆', n: '鴨子', m: '隻', place: '池塘裡', add: '又游來了', sub: '游走了', bg: 'pond' },
  bird: { e: '🐦', n: '小鳥', m: '隻', place: '樹上', add: '又飛來了', sub: '飛走了', bg: 'tree' },
  fish: { e: '🐟', n: '小魚', m: '條', place: '海裡', add: '又游來了', sub: '游走了', bg: 'sea' },
  chick: { e: '🐥', n: '小雞', m: '隻', place: '雞舍裡', add: '又孵出了', sub: '跑出去了', bg: 'pen' },
  frog: { e: '🐸', n: '青蛙', m: '隻', place: '荷葉上', add: '又跳上來', sub: '跳進水裡', bg: 'pond' },
  butterfly: { e: '🦋', n: '蝴蝶', m: '隻', place: '花園裡', add: '又飛來了', sub: '飛走了', bg: 'garden' },
  egg: { e: '🥚', n: '恐龍蛋', m: '顆', place: '窩裡', add: '又多了', sub: '孵出了', subTail: (m) => '，還剩下幾顆蛋？', bg: 'nest' },
  cookie: { e: '🍪', n: '餅乾', m: '片', place: '盤子裡', add: '又烤好了', sub: '吃掉了', bg: 'plate' },
  balloon: { e: '🎈', n: '氣球', m: '顆', place: '派對上', add: '又拿來了', sub: '破掉了', bg: 'party' },
  car: { e: '🚗', n: '小汽車', m: '輛', place: '停車場', add: '又開來了', sub: '開走了', bg: 'road' },
  candy: { e: '🍬', n: '糖果', m: '顆', place: '罐子裡', add: '又放進', sub: '吃掉了', bg: 'plate' },
};
const GOODS = [['🍭', '棒棒糖'], ['🍪', '餅乾'], ['🧃', '果汁'], ['🍦', '冰淇淋'], ['🎈', '氣球'], ['🧸', '小熊'], ['🍌', '香蕉'], ['✏️', '鉛筆']];

const itemsHTML = (e, n, cls = '', from = 0) => Array.from({ length: n }, (_, i) => `<span class="it ${cls}" style="--i:${from + i}">${e}<b></b></span>`).join('');
const coin = (v, extra = '') => `<span class="coin c${v} ${extra}" data-v="${v}"><i>${v}</i><b></b></span>`;
const coinsHTML = (vals, extra = '') => vals.map((v) => coin(v, extra)).join('');

function choices(ans) {
  const s = new Set([ans]);
  const cand = shuffle([ans - 1, ans + 1, ans - 2, ans + 2, ans + 3, ans - 3].filter((v) => v >= 0 && v <= 10));
  for (const c of cand) { if (s.size >= 4) break; s.add(c); }
  return [...s].sort((a, b) => a - b);
}
const maxN = (lv) => (lv <= 1 ? 6 : lv <= 3 ? 8 : 10);

// ---- 題型產生器 ----
function qAdd(key, lv) {
  const it = ITEMS[key], t = rnd(2, maxN(lv)), a = rnd(1, t - 1), b = t - a;
  return {
    type: 'choice', answer: t, choices: choices(t), unit: it.m,
    prompt: `${it.place}有 ${em(a)} ${it.m}${it.n}，${it.add} ${em(b)} ${it.m}，現在一共有幾${it.m}？`,
    say: `${it.place}有${zhM(a)}${it.m}${it.n}，${it.add}${zhM(b)}${it.m}，現在一共有幾${it.m}？`,
    eq: `${a} + ${b} = ${t}`, eqSay: `${zh(a)}加${zh(b)}等於${zh(t)}`,
    render: (el) => { el.dataset.bg = it.bg; el.innerHTML = `<div class="grp base"><div class="items">${itemsHTML(it.e, a)}</div></div><div class="op">＋</div><div class="grp new"><div class="items">${itemsHTML(it.e, b, 'drop', a)}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.it')],
  };
}
function qSub(key, lv) {
  const it = ITEMS[key], a = rnd(2, maxN(lv)), b = rnd(1, a - 1), r = a - b;
  const tail = it.subTail ? it.subTail(it.m) : `，還剩下幾${it.m}？`;
  const subM = key === 'egg' ? '隻小恐龍' : ` ${it.m}`;
  return {
    type: 'choice', answer: r, choices: choices(r), unit: it.m,
    prompt: `${it.place}有 ${em(a)} ${it.m}${it.n}，${it.sub} ${em(b)}${subM}${tail}`,
    say: `${it.place}有${zhM(a)}${it.m}${it.n}，${it.sub}${zhM(b)}${key === 'egg' ? '隻小恐龍' : it.m}${tail}`,
    eq: `${a} − ${b} = ${r}`, eqSay: `${zh(a)}減${zh(b)}等於${zh(r)}`,
    render: (el) => { el.dataset.bg = it.bg; el.innerHTML = `<div class="grp base wide"><div class="items">${itemsHTML(it.e, r)}${itemsHTML(it.e, b, 'leave', r)}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.it:not(.leave)')],
  };
}
function qCoinAdd(lv) {
  const t = rnd(2, maxN(lv)), a = rnd(1, t - 1), b = t - a;
  return {
    type: 'choice', answer: t, choices: choices(t), unit: '元',
    prompt: `存錢筒裡有 ${em(a)} 元，又存進 ${em(b)} 元，現在一共有幾元？`,
    say: `存錢筒裡有${zh(a)}元，又存進${zh(b)}元，現在一共有幾元？`,
    eq: `${a} + ${b} = ${t}`, eqSay: `${zh(a)}加${zh(b)}等於${zh(t)}`,
    render: (el) => { el.dataset.bg = 'piggy'; el.innerHTML = `<div class="grp base"><div class="items coins">${coinsHTML(Array(a).fill(1))}</div></div><div class="op">＋</div><div class="grp new"><div class="items coins">${coinsHTML(Array(b).fill(1), 'drop')}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.coin')],
  };
}
function qCoinSub(lv) {
  const a = rnd(3, maxN(lv)), b = rnd(1, a - 1), r = a - b, g = pick(GOODS);
  return {
    type: 'choice', answer: r, choices: choices(r), unit: '元',
    prompt: `你有 ${em(a)} 元，買了 ${em(b)} 元的${g[0]}${g[1]}，還剩下幾元？`,
    say: `你有${zh(a)}元，買了${zh(b)}元的${g[1]}，還剩下幾元？`,
    eq: `${a} − ${b} = ${r}`, eqSay: `${zh(a)}減${zh(b)}等於${zh(r)}`,
    render: (el) => { el.dataset.bg = 'shop'; el.innerHTML = `<div class="grp base wide"><div class="items coins">${coinsHTML(Array(r).fill(1))}${coinsHTML(Array(b).fill(1), 'leave')}</div></div><div class="goods">${g[0]}</div>`; },
    countEls: (el) => [...el.querySelectorAll('.coin:not(.leave)')],
  };
}
function qCount5() {
  const two = Math.random() < 0.2, n1 = two ? 0 : rnd(1, 5), vals = two ? [5, 5] : [5, ...Array(n1).fill(1)], t = vals.reduce((x, y) => x + y, 0);
  return {
    type: 'choice', answer: t, choices: choices(t), unit: '元',
    prompt: `數數看，這些硬幣一共是幾元？`, say: `數數看，這些硬幣一共是幾元？五元硬幣是五元喔！`,
    eq: two ? `5 + 5 = 10` : `5 + ${n1} = ${t}`, eqSay: two ? '五加五等於十' : `五加${zh(n1)}等於${zh(t)}`,
    render: (el) => { el.dataset.bg = 'piggy'; el.innerHTML = `<div class="grp base wide"><div class="items coins big">${coinsHTML(vals, 'drop')}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.coin')],
  };
}
function qPay(lv) {
  const price = rnd(2, lv <= 3 ? 7 : 10), g = pick(GOODS);
  const best = price >= 10 ? [5, 5] : price >= 5 ? [5, ...Array(price - 5).fill(1)] : Array(price).fill(1);
  return {
    type: 'pay', answer: price, unit: '元',
    prompt: `${g[0]} ${g[1]}要 ${em(price)} 元，請把剛剛好的錢放到盤子裡！`,
    say: `${g[1]}要${zh(price)}元，請把剛剛好的錢，放到盤子裡！`,
    eq: best.length > 1 ? `${best.join(' + ')} = ${price}` : `${price} 元`, eqSay: `剛剛好${zh(price)}元`,
    payHint: `${zh(price)}元可以用${price >= 10 ? '兩個五元' : price >= 5 ? '一個五元' + (price > 5 ? `，加${zhM(price - 5)}個一元` : '') : `${zhM(price)}個一元`}`,
    render: (el) => {
      el.dataset.bg = 'shop';
      el.innerHTML = `<div class="shopitem"><span class="goods">${g[0]}</span><div class="tag">${price} 元</div></div>` +
        `<div class="tray" id="tray"><div class="traylabel">把錢放這裡</div><div class="traycoins"></div><div class="traysum"></div></div>` +
        `<div class="wallet" id="wallet"><div class="walletlabel">我的錢包</div><div class="walletcoins">${coinsHTML([5, 5, 1, 1, 1, 1, 1])}</div></div>`;
    },
  };
}
function qFill(lv) {
  const t = rnd(3, maxN(lv)), a = rnd(1, t - 1), b = t - a, it = pick([['⭐', '星星', '顆'], ['🥚', '蛋', '顆'], ['🧁', '杯子蛋糕', '個']]);
  return {
    type: 'choice', answer: b, choices: choices(b), unit: it[2],
    prompt: `盒子可以裝 ${em(t)} ${it[2]}${it[1]}，已經放了 ${em(a)} ${it[2]}，還要再放幾${it[2]}才會裝滿？`,
    say: `盒子可以裝${zhM(t)}${it[2]}${it[1]}，已經放了${zhM(a)}${it[2]}，還要再放幾${it[2]}才會裝滿？`,
    eq: `${a} + ${b} = ${t}`, eqSay: `${zh(a)}加${zh(b)}等於${zh(t)}`,
    render: (el) => { el.dataset.bg = 'box'; el.innerHTML = `<div class="grp base wide"><div class="items slots">${itemsHTML(it[0], a)}${Array.from({ length: b }, () => '<span class="it slot"><b></b></span>').join('')}</div></div>`; },
    countEls: (el) => [...el.querySelectorAll('.slot')],
  };
}

// ---- 關卡定義（每關 3 題） ----
const itemStage = (key, icon, title) => ({ id: key, icon, title, min: 1, kind: 'item', gen: (lv, i) => ((i === 0 ? true : i === 1 ? false : Math.random() < 0.5) ? qAdd(key, lv) : qSub(key, lv)) });
export const STAGES = [
  itemStage('apple', '🍎', '蘋果籃子'), itemStage('pig', '🐷', '小豬豬圈'), itemStage('duck', '🦆', '鴨子池塘'),
  itemStage('bird', '🐦', '小鳥大樹'), itemStage('fish', '🐟', '小魚海洋'), itemStage('chick', '🐥', '小雞雞舍'),
  itemStage('frog', '🐸', '青蛙荷葉'), itemStage('butterfly', '🦋', '蝴蝶花園'), itemStage('egg', '🥚', '恐龍蛋窩'),
  itemStage('cookie', '🍪', '餅乾盤子'), itemStage('balloon', '🎈', '氣球派對'), itemStage('car', '🚗', '停車場'), itemStage('candy', '🍬', '糖果罐'),
  { id: 'piggy', icon: '🐖', title: '存錢筒', min: 1, kind: 'money', gen: (lv, i) => (i === 1 ? qCoinSub(lv) : qCoinAdd(lv)) },
  { id: 'count5', icon: '💰', title: '數硬幣', min: 2, kind: 'money', gen: () => qCount5() },
  { id: 'shop', icon: '🛒', title: '小商店', min: 3, kind: 'money', gen: (lv) => qPay(lv) },
  { id: 'change', icon: '🧾', title: '買東西找錢', min: 4, kind: 'money', gen: (lv) => qCoinSub(lv) },
  { id: 'fill', icon: '🎁', title: '裝滿盒子', min: 3, kind: 'special', gen: (lv) => qFill(lv) },
];

// 一次任務 = 3 關：兩關數東西 + 一關錢幣（等級夠高時偶爾換成特別關）
export function pickStages(level) {
  const ok = STAGES.filter((s) => s.min <= level);
  const items = shuffle(ok.filter((s) => s.kind === 'item')).slice(0, 2);
  const money = pick(ok.filter((s) => s.kind === 'money'));
  const special = ok.filter((s) => s.kind === 'special');
  if (special.length && Math.random() < 0.4) items[1] = pick(special);
  return shuffle([...items, money]);
}
