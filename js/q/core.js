// 題庫引擎：語言、亂數、可數的東西、人名，以及「題目產生器」Q.*
// 每一種題型就是一個函式，回傳一個題目物件（main.js 的 ask() 負責顯示與作答）。
//
// 題目物件（由 Q.* 產生，不要手寫）：
//   kind    'choice' 下方按鈕單選 | 'tap' 題目區大卡片單選 | 'multi' 題目區多選＋確定
//           | 'order' 依序點 | 'collect' 把東西點進盤子＋確定 | 'pad' 數字鍵盤
//   prompt  題目文字（HTML）   say  語音唸的句子   scene  題目區 HTML   bg  題目區底色名稱
//   full    答對後秀出的完整句子（HTML） fullSay  答對後唸的句子
//   hint    第一次答錯時唸的提示  count  答錯時要標上 1、2、3… 的元素（CSS 選擇器）
//   beats   唸完題目後要敲幾下聲音（數聲音的題目）
import { getLang } from '../i18n.js?v=19';
import { icon } from '../sprites.js?v=19';

// ---------- 語言 ----------
export const EN = () => getLang() === 'en';
export const L = (zh, en) => (EN() ? en : zh);        // 依目前語言選一句
export const pl = (n, one, many) => (n === 1 ? one : many); // 英文單複數

// ---------- 亂數 ----------
export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = (arr) => arr[rnd(0, arr.length - 1)];
export const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const sample = (arr, n) => shuffle([...arr]).slice(0, n);
export const range = (a, b, step = 1) => { const r = []; for (let x = a; x <= b; x += step) r.push(x); return r; };
export const chance = (p) => Math.random() < p;
// 取 n 個不重複、介於 lo~hi 的整數
export const distinct = (n, lo, hi) => sample(range(lo, hi), n);

// ---------- 可數的東西（都有圖：img/<key>.webp）----------
// zh 名稱、m 量詞、en 單數、ens 複數
export const THINGS = {
  apple: { zh: '蘋果', m: '顆', en: 'apple', ens: 'apples' },
  pig: { zh: '小豬', m: '隻', en: 'pig', ens: 'pigs' },
  duck: { zh: '鴨子', m: '隻', en: 'duck', ens: 'ducks' },
  bird: { zh: '小鳥', m: '隻', en: 'bird', ens: 'birds' },
  fish: { zh: '小魚', m: '條', en: 'fish', ens: 'fish' },
  chick: { zh: '小雞', m: '隻', en: 'chick', ens: 'chicks' },
  frog: { zh: '青蛙', m: '隻', en: 'frog', ens: 'frogs' },
  butterfly: { zh: '蝴蝶', m: '隻', en: 'butterfly', ens: 'butterflies' },
  dinoegg: { zh: '恐龍蛋', m: '顆', en: 'dinosaur egg', ens: 'dinosaur eggs' },
  cookie: { zh: '餅乾', m: '片', en: 'cookie', ens: 'cookies' },
  balloon: { zh: '氣球', m: '顆', en: 'balloon', ens: 'balloons' },
  car: { zh: '小汽車', m: '輛', en: 'car', ens: 'cars' },
  candy: { zh: '糖果', m: '顆', en: 'sweet', ens: 'sweets' },
  lollipop: { zh: '棒棒糖', m: '根', en: 'lollipop', ens: 'lollipops' },
  juice: { zh: '果汁', m: '盒', en: 'juice box', ens: 'juice boxes' },
  icecream: { zh: '冰淇淋', m: '支', en: 'ice cream', ens: 'ice creams' },
  teddy: { zh: '小熊', m: '隻', en: 'teddy bear', ens: 'teddy bears' },
  banana: { zh: '香蕉', m: '根', en: 'banana', ens: 'bananas' },
  pencil: { zh: '鉛筆', m: '枝', en: 'pencil', ens: 'pencils' },
  star: { zh: '星星', m: '顆', en: 'star', ens: 'stars' },
  cupcake: { zh: '杯子蛋糕', m: '個', en: 'cupcake', ens: 'cupcakes' },
  egg: { zh: '雞蛋', m: '顆', en: 'egg', ens: 'eggs' },
  gift: { zh: '禮物', m: '個', en: 'present', ens: 'presents' },
};
export const ANIMALS = ['pig', 'duck', 'bird', 'fish', 'chick', 'frog', 'butterfly'];
export const FOODS = ['apple', 'cookie', 'candy', 'lollipop', 'icecream', 'banana', 'cupcake', 'egg'];
export const TOYS = ['balloon', 'car', 'teddy', 'pencil', 'star', 'gift'];
// 隨機挑一種東西：回傳 { k, zh, m, en, ens }
export const thing = (keys = Object.keys(THINGS)) => { const k = pick(keys); return { k, ...THINGS[k] }; };
export const things2 = (keys = Object.keys(THINGS)) => sample(keys, 2).map((k) => ({ k, ...THINGS[k] }));
// 「3 顆蘋果」／「3 apples」
export const cnt = (n, it) => L(`${n} ${it.m}${it.zh}`, `${n} ${pl(n, it.en, it.ens)}`);

// ---------- 應用題的人名（新加坡常見）----------
const PEOPLE = [
  { zh: '阿里', en: 'Ali', g: 'm' }, { zh: '美玲', en: 'Mei Ling', g: 'f' }, { zh: '西蒂', en: 'Siti', g: 'f' }, { zh: '拉朱', en: 'Raju', g: 'm' },
  { zh: '小班', en: 'Ben', g: 'm' }, { zh: '湯姆', en: 'Tom', g: 'm' }, { zh: '琳娜', en: 'Lina', g: 'f' }, { zh: '小肯', en: 'Ken', g: 'm' }, { zh: '艾咪', en: 'Amy', g: 'f' },
];
const person = (p) => ({ ...p, n: L(p.zh, p.en), he: p.g === 'm' ? 'he' : 'she', He: p.g === 'm' ? 'He' : 'She', his: p.g === 'm' ? 'his' : 'her', him: p.g === 'm' ? 'him' : 'her', ta: p.g === 'm' ? '他' : '她' });
export const who = () => person(pick(PEOPLE));                 // 一個人：.n 名字 .he/.He/.his/.him（英文代名詞）.ta（他/她）
export const who2 = () => sample(PEOPLE, 2).map(person);       // 兩個不同的人
export const who3 = () => sample(PEOPLE, 3).map(person);

// ---------- 文字處理 ----------
// 把題目裡的數字標成紅色大字（不動 HTML 標籤裡面的數字）
export const emph = (html) => String(html).split(/(<[^>]*>)/).map((s) => (s.startsWith('<') ? s : s.replace(/\d+(?:[.:]\d+)?/g, '<em>$&</em>'))).join('');
// 題目文字 → 語音唸的句子（去掉標籤、把符號換成唸法）
export function sayOf(html) {
  let s = String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  const en = EN();
  s = s.replace(/□/g, en ? ' what ' : '多少').replace(/\?(?=\s*[+\-−×÷=])/g, en ? ' what ' : '多少')
    .replace(/\s\+\s/g, en ? ' plus ' : '加').replace(/\s[−-]\s/g, en ? ' minus ' : '減')
    .replace(/\s×\s/g, en ? ' times ' : '乘以').replace(/\s÷\s/g, en ? ' divided by ' : '除以').replace(/\s=\s/g, en ? ' equals ' : '等於')
    .replace(/(\d+)\s*\/\s*(\d+)/g, (m, a, b) => (en ? `${a} over ${b}` : `${b}分之${a}`));
  if (en) s = s.replace(/\bcm\b/g, 'centimetres').replace(/\bkg\b/g, 'kilograms').replace(/(\d)\s*g\b/g, '$1 grams').replace(/(\d)\s*m\b/g, '$1 metres').replace(/¢/g, ' cents').replace(/\$(\d+(?:\.\d+)?)/g, '$1 dollars');
  return s.replace(/\s+/g, ' ').trim();
}

// ---------- 數字選項 ----------
// 產生「看起來很像」的錯誤答案，連同正確答案排好（由小到大）
export function numOpts(ans, lo = 0, hi = Math.max(10, ans + 5), n = 4) {
  const s = new Set([ans]);
  const big = ans >= 30 ? [10, -10, 1, -1, 2, -2, 20, -20, 100, -100, 5, -5] : [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10];
  const cand = shuffle(big.slice(0, 6)).concat(big.slice(6));
  if (ans >= 12 && ans <= 99 && ans % 11) cand.unshift(+String(ans).split('').reverse().join('') - ans); // 67 ↔ 76
  for (const d of cand) { if (s.size >= n) break; const v = ans + d; if (v >= lo && v <= hi) s.add(v); }
  for (let v = lo; s.size < n && v <= hi; v++) s.add(v);
  return [...s].sort((a, b) => a - b);
}

// ---------- 題目產生器 ----------
const isHtml = (x) => typeof x === 'string' && x.includes('<');
function base(o, kind, extra) {
  const prompt = o.em === false ? o.p : emph(o.p);
  const full = o.full ?? extra.fullDefault;
  return {
    kind, prompt, say: o.say ?? sayOf(o.p), scene: o.scene ?? '', bg: o.bg ?? 'plain',
    full: full == null ? null : String(full), fullSay: o.fullSay ?? (full == null ? '' : sayOf(String(full))),
    hint: o.hint ?? null, count: o.count ?? null, beats: o.beats ?? 0, ...extra, fullDefault: undefined,
  };
}
const optClass = (labels) => {
  if (labels.some(isHtml)) return 'img';
  const len = Math.max(...labels.map((x) => String(x).length));
  if (/^[\d.:$¢ ]+$/.test(labels.join('')) && len <= 3) return len === 3 ? 'd3' : '';
  return len <= 6 ? 'txt' : len <= 12 ? 'txt sm' : 'txt xs';
};

export const Q = {
  // 數字答案。小的數字出 4 個選項；大於 20（或 pad:true）改用數字鍵盤。
  //   p 題目文字、scene 題目區、ans 答案；lo/hi 選項的上下限；opts 自訂選項；unit 鍵盤顯示的單位
  num(o) {
    const pad = o.pad ?? (o.opts ? false : o.ans > 20);
    if (pad) return base(o, 'pad', { ans: o.ans, unit: o.unit ?? '', fullDefault: o.ans });
    const vals = o.opts ? [...o.opts] : numOpts(o.ans, o.lo ?? 0, o.hi ?? Math.max(10, o.ans + 4), o.n ?? 4);
    if (!vals.includes(o.ans)) vals.push(o.ans);
    return base(o, 'choice', { opts: vals.sort((a, b) => a - b).map((v) => ({ h: String(v) + (o.unit ? `<small>${o.unit}</small>` : ''), v: String(v) })), ans: String(o.ans), cls: o.unit ? 'u' : Math.max(...vals) > 99 ? 'd3' : '', fullDefault: o.ans });
  },
  // 下方按鈕單選。right 正確的選項、wrong 錯誤的選項（文字、數字或 HTML 都可以）；keep:true 不洗牌（照 [right, ...wrong] 順序）
  pick(o) {
    const labels = [o.right, ...o.wrong];
    const order = o.keep ? labels.map((_, i) => i) : o.sort ? labels.map((_, i) => i).sort((a, b) => labels[a] - labels[b]) : shuffle(labels.map((_, i) => i));
    return base(o, 'choice', { opts: order.map((i) => ({ h: String(labels[i]), v: String(i) })), ans: '0', cls: o.cls ?? optClass(labels), fullDefault: isHtml(o.right) ? null : o.right });
  },
  // 是／不是
  yn(o) {
    const y = o.yes ?? L('是', 'Yes'), n = o.no ?? L('不是', 'No');
    return base(o, 'choice', { opts: [{ h: `✔ ${y}`, v: '1' }, { h: `✘ ${n}`, v: '0' }], ans: o.ans ? '1' : '0', cls: `txt yn${Math.max(String(y).length, String(n).length) > (EN() ? 5 : 3) ? ' sm' : ''}`, fullDefault: o.ans ? y : n });
  },
  // 題目區大卡片單選（圖片選項）。right/wrong 是 HTML（會洗牌）；top 是卡片上方的參考圖
  //   要固定順序時改傳 cards = [[HTML, 是否正確], …]（剛好一張正確）
  tap(o) {
    const cards = o.cards ? o.cards.map(([h, ok]) => [h, ok ? 1 : 0]) : shuffle([[o.right, 1], ...o.wrong.map((h) => [h, 0])]);
    const scene = (o.top ? `<div class="taptop">${o.top}</div>` : '') + `<div class="taps n${cards.length}">${cards.map(([h, ok]) => `<button class="tapcard" data-v="${ok}">${h}</button>`).join('')}</div>`;
    return base({ ...o, scene }, 'tap', { ans: '1', stack: !!o.top, fixed: !!o.cards, fullDefault: null });
  },
  // 多選：items = [[HTML, 是否正確], …]，全部選對後按確定
  multi(o) {
    const cards = o.keep ? o.items : shuffle([...o.items]);
    const scene = (o.top ? `<div class="taptop">${o.top}</div>` : '') + `<div class="taps multi n${cards.length}">${cards.map(([h, ok]) => `<button class="tapcard" data-ok="${ok ? 1 : 0}">${h}</button>`).join('')}</div>`;
    return base({ ...o, scene }, 'multi', { stack: !!o.top, fullDefault: null });
  },
  // 依序點：items = [[HTML, 排序用的數字], …]，由小到大點（desc:true 由大到小）
  order(o) {
    const sorted = [...o.items].sort((a, b) => (o.desc ? b[1] - a[1] : a[1] - b[1]));
    let cards = shuffle(sorted.map(([h], i) => [h, i]));
    if (cards.every(([, i], k) => i === k)) cards = cards.reverse();
    const scene = `<div class="orderwrap"><div class="taps order n${cards.length}">${cards.map(([h, i]) => `<button class="tapcard" data-o="${i}">${h}</button>`).join('')}</div><div class="orderline"></div></div>`;
    return base({ ...o, scene }, 'order', { n: cards.length, fullDefault: null });
  },
  // 拿東西：tokens = [[HTML, 數值], …]，點一下放進盤子，總和等於 ans 再按確定。fewest 指定最少個數（付錢用最少張）
  collect(o) {
    const scene = (o.top ? `<div class="taptop">${o.top}</div>` : '') + `<div class="collect"><div class="tray2"><div class="traylabel">${o.tray ?? L('放這裡', 'Put them here')}</div><div class="traytok"></div><div class="traysum"></div></div>` +
      `<div class="pool2">${o.tokens.map(([h, v]) => `<button class="tok" data-v="${v}">${h}</button>`).join('')}</div></div>`;
    return base({ ...o, scene }, 'collect', { ans: o.ans, fewest: o.fewest ?? null, showSum: o.showSum ?? null, stack: !!o.top, fullDefault: null });
  },
};

// 題型定義：topic=[中文主題, English topic, 圖示]、name=[中文題型名, English name]、gen(d)=產生題目
//   d：0 第一次碰到這個題型（數字小一點）、1 練過了、2 複習（可以用完整範圍）
export const def = (topic, zh, en, gen, bonus = false) => ({ topic, zh, en, gen, bonus });
export { icon };
