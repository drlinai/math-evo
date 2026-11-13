// 題目用的圖：全部回傳 HTML／SVG 字串，可以直接放進題目區（約 930×300）或選項卡片裡。
// 卡片內可用空間：Q.tap / Q.multi / Q.order 2 張 ≈ 380×230、3 張 ≈ 260×230、4 張 ≈ 190×230、5 張 ≈ 150×230；有 top 時卡片高約 120。
import { src } from '../sprites.js?v=27';
import { L, rnd, shuffle, range, THINGS } from './core.js?v=27';

const INK = '#2b2140';
const f = (v) => (Math.round(v * 10) / 10).toString();
export const svg = (w, h, inner, extra = '') => `<svg class="vz" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${extra}>${inner}</svg>`;
const img = (k, x, y, w, h) => `<image href="${src(k)}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/>`;
const txt = (x, y, s, size = 22, o = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" font-weight="900" text-anchor="middle" fill="${INK}" ${o}>${s}</text>`;

// ---------- 顏色、形狀、立體的名稱 ----------
export const COLORS = {
  red: { c: '#ff5b5b', zh: '紅色', en: 'red' }, blue: { c: '#3f8cff', zh: '藍色', en: 'blue' }, yellow: { c: '#ffd43a', zh: '黃色', en: 'yellow' },
  green: { c: '#2ec27e', zh: '綠色', en: 'green' }, purple: { c: '#a06bff', zh: '紫色', en: 'purple' }, orange: { c: '#ff9f1c', zh: '橘色', en: 'orange' },
};
export const SHAPES = {
  circle: { zh: '圓形', en: 'circle', sides: 0, corners: 0 }, square: { zh: '正方形', en: 'square', sides: 4, corners: 4 },
  rect: { zh: '長方形', en: 'rectangle', sides: 4, corners: 4 }, tri: { zh: '三角形', en: 'triangle', sides: 3, corners: 3 },
  semi: { zh: '半圓形', en: 'half circle' }, quarter: { zh: '四分之一圓', en: 'quarter circle' },
};
export const BASIC = ['circle', 'square', 'rect', 'tri'];
export const SOLIDS = {
  cube: { zh: '正方體', en: 'cube', roll: false, stack: true, curved: false, flat: 6 }, cuboid: { zh: '長方體', en: 'cuboid', roll: false, stack: true, curved: false, flat: 6 },
  cone: { zh: '圓錐', en: 'cone', roll: true, stack: false, curved: true, flat: 1 }, cylinder: { zh: '圓柱', en: 'cylinder', roll: true, stack: true, curved: true, flat: 2 },
  sphere: { zh: '球', en: 'sphere', roll: true, stack: false, curved: true, flat: 0 },
};
export const cname = (k) => L(COLORS[k].zh, COLORS[k].en);
export const sname = (k) => L(SHAPES[k].zh, SHAPES[k].en);
export const solidName = (k) => L(SOLIDS[k].zh, SOLIDS[k].en);

// ---------- 版面小工具 ----------
export const row = (...h) => `<div class="vrow">${h.join('')}</div>`;
export const col = (...h) => `<div class="vcol">${h.join('')}</div>`;
export const grp = (h, cls = '') => `<div class="grp ${cls}">${h}</div>`;                     // 虛線框住的一堆
export const fig = (h, cap) => `<figure class="fig">${h}<figcaption>${cap}</figcaption></figure>`; // 圖＋下方說明
export const emo = (e, px = 80) => `<span class="emo" style="font-size:${px}px">${e}</span>`;       // 大表情符號
export const ncard = (t, cls = '') => `<span class="ncard ${cls}">${t}</span>`;                    // 數字／單字卡
export const label = (t, cls = '') => `<span class="vlabel ${cls}">${t}</span>`;                   // 一般說明字
export const pic = (k, px = 70) => `<img class="vpic" src="${src(k)}" style="width:${px}px;height:${px}px" alt="" draggable="false">`;

// ---------- 一堆東西 ----------
// 排整齊：key 圖片名（THINGS 的鍵），n 個；cols 每列幾個；size 'md'(70px) | 'sm'(46px) | 'xs'(34px)；cls 加在每個東西上（'drop' 掉下來、'leave' 離開、'gone' 變淡）
export function items(key, n, o = {}) {
  const { cols = 5, size = 'md', cls = '', from = 0 } = o;
  return `<div class="items ${size}" style="--cols:${Math.min(cols, Math.max(n, 1))}">${Array.from({ length: n }, (_, i) => `<span class="it ${cls}" style="--i:${from + i}"><img class="pic" src="${src(key)}" alt="" draggable="false"><b></b></span>`).join('')}</div>`;
}
// 散落一地：w×h 的範圍內隨機擺 n 個（不重疊）
export function pile(key, n, o = {}) {
  const { w = 420, h = 250, s = n > 12 ? 46 : n > 6 ? 58 : 68 } = o;
  const cols = Math.max(1, Math.floor(w / (s + 6))), rows = Math.max(1, Math.floor(h / (s + 6)));
  const cells = shuffle(range(0, cols * rows - 1)).slice(0, n), cw = w / cols, ch = h / rows;
  return `<div class="pile" style="width:${w}px;height:${h}px">${cells.map((c, i) => `<span class="it" style="--i:${i};width:${s}px;height:${s}px;left:${f((c % cols) * cw + rnd(0, Math.max(0, cw - s - 2)))}px;top:${f(Math.floor(c / cols) * ch + rnd(0, Math.max(0, ch - s - 2)))}px"><img class="pic" src="${src(key)}" alt="" draggable="false"><b></b></span>`).join('')}</div>`;
}
// 圓點（用在算式提示、陣列）
export const dots = (n, c = '#3f8cff', o = {}) => `<div class="items ${o.size ?? 'sm'}" style="--cols:${Math.min(o.cols ?? 5, Math.max(n, 1))}">${Array.from({ length: n }, (_, i) => `<span class="it dot ${o.cls ?? ''}" style="--i:${i};--c:${c}"><b></b></span>`).join('')}</div>`;
// 等組：g 盤，每盤 each 個
export const groups = (g, each, key) => `<div class="vrow wrap">${Array.from({ length: g }, () => `<div class="plate2">${items(key, each, { size: each > 6 ? 'xs' : 'sm', cols: each > 6 ? 5 : each > 4 ? 3 : 2 })}</div>`).join('')}</div>`;
// 陣列：r 列 c 行
export const array = (r, c, key) => `<div class="arr">${items(key, r * c, { cols: c, size: c > 7 || r > 4 ? 'xs' : 'sm' })}</div>`;

// ---------- 十格板、骰子、分合圖 ----------
// 十格板：n 個（紅）＋ n2 個（藍）；n 超過 10 自動用兩塊；k 放大倍率
export function tenFrame(n, n2 = 0, k = 1.5) {
  const one = (a, b) => {
    let s = `<rect x="2" y="2" width="236" height="96" rx="8" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
    for (let i = 1; i < 5; i++) s += `<line x1="${2 + i * 47.2}" y1="2" x2="${2 + i * 47.2}" y2="98" stroke="${INK}" stroke-width="3"/>`;
    s += `<line x1="2" y1="50" x2="238" y2="50" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 0; i < a + b; i++) s += `<circle cx="${f(25.6 + (i % 5) * 47.2)}" cy="${i < 5 ? 26 : 74}" r="17" fill="${i < a ? '#ff5b5b' : '#3f8cff'}" stroke="${INK}" stroke-width="3"/>`;
    return `<svg class="vz" width="${240 * k}" height="${100 * k}" viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  };
  if (n + n2 > 10 && k > 1.3) k = 1.3;
  if (n + n2 <= 10) return one(n, n2);
  const a1 = Math.min(n, 10), b1 = 10 - a1;
  return `<div class="vrow">${one(a1, b1)}${one(n - a1, n2 - b1)}</div>`;
}
export function dice(n, s = 110) {
  const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] };
  return `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="90" height="90" rx="18" fill="#fff" stroke="${INK}" stroke-width="5"/>${P[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${INK}"/>`).join('')}</svg>`;
}
// 分合圖：上面是整體 w，下面兩個部分 a、b；傳 '?' 就是要問的那一格
export function bond(w, a, b) {
  const node = (x, y, v) => (v === '?' ? `<rect x="${x - 40}" y="${y - 40}" width="80" height="80" rx="18" fill="#3f8cff" stroke="${INK}" stroke-width="5"/>${txt(x, y + 17, '?', 50, 'fill="#fff"')}` : `<circle cx="${x}" cy="${y}" r="42" fill="#fff8ea" stroke="${INK}" stroke-width="5"/>${txt(x, y + 17, v, String(v).length > 2 ? 34 : 48)}`);
  return svg(300, 240, `<line x1="150" y1="60" x2="72" y2="178" stroke="${INK}" stroke-width="6"/><line x1="150" y1="60" x2="228" y2="178" stroke="${INK}" stroke-width="6"/>${node(150, 52, w)}${node(72, 184, a)}${node(228, 184, b)}`);
}

// ---------- 數字、數列、算式 ----------
// 一排格子（數列、型式）：list 的元素可以是數字、文字或 HTML；'?' 會變成藍色問號格
export const seq = (list, cls = '') => `<div class="seq ${cls} n${list.length}">${list.map((x) => (x === '?' ? '<span class="scell q">?</span>' : `<span class="scell">${x}</span>`)).join('')}</div>`;
// 大算式：'3 + □ = 7'（用空白隔開；□ 或 ? 是要填的格子）。cls 傳 'tiny' 是和圖片放在一起用的小字級
export function bigEq(str, cls = '') {
  const parts = String(str).trim().split(/\s+/), len = String(str).replace(/\s+/g, '').length;
  cls = cls.replace(/\bmini\b/, 'tiny'); // 'mini' 這個 class 名稱已經被主角小圖用掉了
  return `<div class="numq ${len > 9 ? 'xs' : len > 6 ? 'sm' : ''} ${cls}">${parts.map((p) => (p === '□' || p === '?' ? '<span class="nqm">?</span>' : /^[+−×÷=<>]$/.test(p) ? `<span class="nop">${p}</span>` : `<span>${p}</span>`)).join('')}</div>`;
}
// 直式：a op b，res 傳 '?' 或數字（不傳就只畫橫線）
export function vsum(a, b, op = '+', res = '?') {
  const w = Math.max(String(a).length, String(b).length, String(res === '?' ? '' : res).length) + 1;
  const cells = (s, lead = '') => { const d = String(s).split(''); return `<tr>${Array.from({ length: w }, (_, i) => { const k = i - (w - d.length); return `<td>${i === 0 && lead ? lead : k >= 0 ? d[k] : ''}</td>`; }).join('')}</tr>`; };
  return `<table class="vsum">${cells(a)}${cells(b, op)}<tr class="line"><td colspan="${w}"></td></tr>${res === '?' ? `<tr><td colspan="${w}"><span class="nqm">?</span></td></tr>` : cells(res)}</table>`;
}
// 數線：lo~hi，每 step 一格；every 每幾個數標一次數字；mark 箭頭指的數；hide 不寫數字（顯示 ?）的數
export function numLine(lo, hi, o = {}) {
  const { step = 1, every = step, mark = null, hide = [], w = 860 } = o, n = (hi - lo) / step, x = (v) => 40 + ((v - lo) / (hi - lo)) * (w - 80);
  let s = `<line x1="20" y1="70" x2="${w - 20}" y2="70" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  for (let i = 0; i <= n; i++) {
    const v = lo + i * step, big = (v - lo) % every === 0;
    s += `<line x1="${f(x(v))}" y1="${big ? 52 : 60}" x2="${f(x(v))}" y2="${big ? 88 : 80}" stroke="${INK}" stroke-width="${big ? 5 : 3}"/>`;
    if (hide.includes(v)) s += `<rect x="${f(x(v) - 22)}" y="94" width="44" height="34" rx="8" fill="#3f8cff" stroke="${INK}" stroke-width="3"/>${txt(x(v), 120, '?', 24, 'fill="#fff"')}`;
    else if (big) s += txt(x(v), 120, v, n > 20 ? 20 : 26);
  }
  if (mark != null) s += `<path d="M${f(x(mark))},48 l-14,-26 h28 z" fill="#ff5b5b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  return svg(w, 134, s);
}
// 百數表的幾列：from 開始、rows 列；q 那一格顯示問號；hl 塗色的格子
export function hgrid(from, rows = 3, o = {}) {
  let s = '';
  for (let i = 0; i < rows * 10; i++) { const v = from + i; s += `<span class="${v === o.q ? 'q' : (o.hl || []).includes(v) ? 'hl' : ''}">${v === o.q ? '?' : v}</span>`; }
  return `<div class="hgrid">${s}</div>`;
}
// 積木（百板 10×10 格、十條 10 格、單顆 1 格；每格一樣大）；k 放大倍率
export function blocks(n, k = 1) {
  const H = Math.floor(n / 100), T = Math.floor((n % 100) / 10), O = n % 10, U = 10, Y = 6, B = Y + 10 * U;
  const thin = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="1" opacity=".55"/>`;
  let s = '', x = 4;
  for (let i = 0; i < H; i++) {
    s += `<rect x="${x}" y="${Y}" width="${10 * U}" height="${10 * U}" fill="#ffd43a" stroke="${INK}" stroke-width="3"/>`;
    for (let k = 1; k < 10; k++) s += thin(x + k * U, Y, x + k * U, B) + thin(x, Y + k * U, x + 10 * U, Y + k * U);
    x += 10 * U + 8;
  }
  if (H) x += 10;
  for (let i = 0; i < T; i++) {
    s += `<rect x="${x}" y="${Y}" width="${U}" height="${10 * U}" fill="#2ec27e" stroke="${INK}" stroke-width="2.5"/>`;
    for (let k = 1; k < 10; k++) s += `<line x1="${x}" y1="${Y + k * U}" x2="${x + U}" y2="${Y + k * U}" stroke="${INK}" stroke-width="1.4" opacity=".8"/>`;
    x += U + 6;
  }
  if (T) x += 10;
  for (let i = 0; i < O; i++) s += `<rect x="${x + (i % 3) * (U + 5)}" y="${B - U - Math.floor(i / 3) * (U + 5)}" width="${U}" height="${U}" fill="#ff7a59" stroke="${INK}" stroke-width="2.5"/>`;
  if (O) x += 3 * (U + 5);
  const w = Math.max(x + 4, 60), h = B + 6;
  return svg(w, h, s).replace(`width="${w}" height="${h}"`, `width="${f(w * k)}" height="${f(h * k)}"`);
}

// ---------- 形狀與立體 ----------
// kind: circle square rect tri semi quarter star diamond heart；c 顏色；s 大小(px)；rot 旋轉角度
export function shape(kind, o = {}) {
  const { c = '#ff7a59', s = 90, rot = 0 } = o;
  const P = {
    circle: '<circle cx="50" cy="50" r="43"/>', square: '<rect x="9" y="9" width="82" height="82" rx="3"/>', rect: '<rect x="4" y="26" width="92" height="48" rx="3"/>',
    tri: '<polygon points="50,8 94,90 6,90"/>', semi: '<path d="M6,72 A44,44 0 0 1 94,72 Z"/>', quarter: '<path d="M16,86 L16,14 A72,72 0 0 1 88,86 Z"/>',
    star: '<polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38"/>', diamond: '<polygon points="50,5 92,50 50,95 8,50"/>',
    heart: '<path d="M50,90 C10,60 4,36 20,20 C34,8 46,16 50,28 C54,16 66,8 80,20 C96,36 90,60 50,90 Z"/>',
    arrow: '<polygon points="50,6 92,50 66,50 66,94 34,94 34,50 8,50"/>',
  };
  return `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round" transform="rotate(${rot} 50 50)">${P[kind]}</g></svg>`;
}
// 立體：cube cuboid cone cylinder sphere
export function solid(kind, o = {}) {
  const { c = '#7fb4ff', s = 120 } = o, st = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`, dark = 'fill="rgba(0,0,0,.18)"', lite = 'fill="rgba(255,255,255,.35)"';
  const P = {
    cube: `<rect x="14" y="40" width="66" height="66" fill="${c}" ${st}/><polygon points="14,40 40,16 106,16 80,40" fill="${c}" ${st}/><polygon points="14,40 40,16 106,16 80,40" ${lite}/><polygon points="80,40 106,16 106,82 80,106" fill="${c}" ${st}/><polygon points="80,40 106,16 106,82 80,106" ${dark}/>`,
    cuboid: `<rect x="6" y="56" width="84" height="44" fill="${c}" ${st}/><polygon points="6,56 28,36 112,36 90,56" fill="${c}" ${st}/><polygon points="6,56 28,36 112,36 90,56" ${lite}/><polygon points="90,56 112,36 112,80 90,100" fill="${c}" ${st}/><polygon points="90,56 112,36 112,80 90,100" ${dark}/>`,
    cone: `<path d="M18,96 L60,10 L102,96 A42,13 0 0 1 18,96 Z" fill="${c}" ${st}/><path d="M60,10 L102,96 A42,13 0 0 1 60,109 Z" ${dark}/><path d="M18,96 A42,13 0 0 1 102,96" fill="none" ${st} stroke-dasharray="6 6" opacity=".5"/>`,
    cylinder: `<path d="M22,28 V94 A38,13 0 0 0 98,94 V28 Z" fill="${c}" ${st}/><path d="M60,41 V107 A38,13 0 0 0 98,94 V28 Z" ${dark}/><ellipse cx="60" cy="28" rx="38" ry="13" fill="${c}" ${st}/><ellipse cx="60" cy="28" rx="38" ry="13" ${lite}/>`,
    sphere: `<circle cx="60" cy="60" r="46" fill="${c}" ${st}/><path d="M60,14 A46,46 0 0 1 60,106 A30,46 0 0 0 60,14 Z" ${dark}/><ellipse cx="44" cy="40" rx="14" ry="9" fill="rgba(255,255,255,.6)"/>`,
  };
  return `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${P[kind]}</svg>`;
}

// ---------- 時鐘 ----------
// h 時、m 分；s 大小。hands:false 只畫鐘面
export function clock(h, m, o = {}) {
  const { s = 200, hands = true } = o;
  let g = `<circle cx="100" cy="100" r="92" fill="#fff" stroke="${INK}" stroke-width="7"/>`;
  for (let i = 0; i < 60; i++) { const a = (i * 6 * Math.PI) / 180, r1 = i % 5 ? 85 : 80; g += `<line x1="${f(100 + Math.sin(a) * r1)}" y1="${f(100 - Math.cos(a) * r1)}" x2="${f(100 + Math.sin(a) * 89)}" y2="${f(100 - Math.cos(a) * 89)}" stroke="${INK}" stroke-width="${i % 5 ? 1.5 : 3.5}"/>`; }
  for (let i = 1; i <= 12; i++) { const a = (i * 30 * Math.PI) / 180; g += txt(100 + Math.sin(a) * 66, 100 - Math.cos(a) * 66 + 8, i, 21); }
  if (hands) {
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    g += `<line x1="100" y1="100" x2="100" y2="54" stroke="${INK}" stroke-width="9" stroke-linecap="round" transform="rotate(${f(ha)} 100 100)"/><line x1="100" y1="100" x2="100" y2="24" stroke="#e8483f" stroke-width="6" stroke-linecap="round" transform="rotate(${f(ma)} 100 100)"/>`;
  }
  return `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${g}<circle cx="100" cy="100" r="7" fill="${INK}"/></svg>`;
}
// 時間的寫法：新加坡寫 8.25，中文寫 8:25
export const timeStr = (h, m) => `${h}${L(':', '.')}${String(m).padStart(2, '0')}`;
export const digital = (h, m) => `<span class="digital">${h}:${String(m).padStart(2, '0')}</span>`;

// ---------- 長度 ----------
// 尺：0~max 公分；obj = { from, to, c 顏色 } 放在尺上方的東西
export function ruler(max, obj, o = {}) {
  const { w = 840, unit = 'cm' } = o, k = (w - 60) / max, x = (v) => 30 + v * k;
  let s = `<rect x="6" y="70" width="${w - 12}" height="62" rx="8" fill="#ffe9a8" stroke="${INK}" stroke-width="4"/>`;
  for (let v = 0; v <= max; v++) s += `<line x1="${f(x(v))}" y1="70" x2="${f(x(v))}" y2="${v % 5 ? 88 : 96}" stroke="${INK}" stroke-width="3"/>${max <= 20 || v % 5 === 0 ? txt(x(v), 120, v, max > 15 ? 17 : 20) : ''}`;
  s += txt(w - 30, 62, unit, 18, 'opacity=".6"');
  if (obj) s += `<path d="M${f(x(obj.from))},22 H${f(x(obj.to) - 16)} L${f(x(obj.to))},40 L${f(x(obj.to) - 16)},58 H${f(x(obj.from))} Z" fill="${obj.c ?? '#ff7a59'}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  return svg(w, 138, s);
}
// 幾條長短不同的橫條（比長短、排序）：list = [{ len, c, t 左邊的字 }]，max 最長的刻度
export function bars(list, o = {}) {
  const { w = 560, max = Math.max(...list.map((b) => b.len)), h = 34, gap = 18, align = true } = o, lw = list.some((b) => b.t) ? 90 : 0;
  const s = list.map((b, i) => { const off = align ? 0 : (b.off ?? 0); return `${b.t ? txt(lw / 2, i * (h + gap) + h / 2 + 8, b.t, 22) : ''}<rect x="${f(lw + 4 + (off * (w - lw - 8)) / max)}" y="${i * (h + gap) + 2}" width="${f((b.len * (w - lw - 8)) / max)}" height="${h}" rx="8" fill="${b.c ?? '#3f8cff'}" stroke="${INK}" stroke-width="4"/>`; }).join('');
  return svg(w, list.length * (h + gap) - gap + 4, s);
}
// 直立的東西比高矮：list = [{ len, c, t 下面的字, e 表情符號 }]
export function tallBars(list, o = {}) {
  const { h = 220, max = Math.max(...list.map((b) => b.len)), bw = 60, gap = 50 } = o;
  const s = list.map((b, i) => { const bh = (b.len * (h - 40)) / max, x = 10 + i * (bw + gap); return `<rect x="${x}" y="${f(h - 34 - bh)}" width="${bw}" height="${f(bh)}" rx="8" fill="${b.c ?? '#2ec27e'}" stroke="${INK}" stroke-width="4"/>${b.t ? txt(x + bw / 2, h - 8, b.t, 22) : ''}`; }).join('');
  return svg(list.length * (bw + gap) - gap + 20, h, `${s}<line x1="0" y1="${h - 34}" x2="${list.length * (bw + gap)}" y2="${h - 34}" stroke="${INK}" stroke-width="4"/>`);
}

// ---------- 重量、容量 ----------
// 秤：指針指到 v；max 刻度最大值；major 每幾標一個數字；minor 小刻度間隔；unit 單位
export function scale(v, max, unit, o = {}) {
  const { major = max / 5, minor = major / 2, s = 230, top = '' } = o, ang = (x) => -135 + (x / max) * 270;
  let g = `<rect x="40" y="8" width="150" height="12" rx="6" fill="#c9d3e0" stroke="${INK}" stroke-width="4"/><rect x="108" y="18" width="14" height="22" fill="#c9d3e0" stroke="${INK}" stroke-width="4"/><circle cx="115" cy="128" r="92" fill="#fff" stroke="${INK}" stroke-width="7"/>`;
  for (let x = 0; x <= max + 1e-9; x += minor) { const a = (ang(x) * Math.PI) / 180, big = Math.abs(x / major - Math.round(x / major)) < 1e-6; g += `<line x1="${f(115 + Math.sin(a) * (big ? 74 : 80))}" y1="${f(128 - Math.cos(a) * (big ? 74 : 80))}" x2="${f(115 + Math.sin(a) * 88)}" y2="${f(128 - Math.cos(a) * 88)}" stroke="${INK}" stroke-width="${big ? 4 : 2}"/>${big ? txt(115 + Math.sin(a) * 58, 128 - Math.cos(a) * 58 + 7, Math.round(x), max >= 1000 ? 14 : 19) : ''}`; }
  g += `<line x1="115" y1="128" x2="115" y2="52" stroke="#e8483f" stroke-width="6" stroke-linecap="round" transform="rotate(${f(ang(v))} 115 128)"/><circle cx="115" cy="128" r="8" fill="${INK}"/>${txt(115, 178, unit, 22, 'opacity=".7"')}`;
  return `<div class="scalewrap">${top ? `<div class="scaletop">${top}</div>` : ''}<svg class="vz" width="${s}" height="${s}" viewBox="0 0 230 230" xmlns="http://www.w3.org/2000/svg">${g}</svg></div>`;
}
// 天平：left/right 是放在兩邊的 HTML；tilt -1 左邊重、0 一樣重、1 右邊重
export const balance = (left, right, tilt = 0) => `<div class="bal t${tilt + 1}"><div class="balbeam"><div class="balpan l">${left}</div><div class="balpan r">${right}</div></div><div class="balpost"></div></div>`;
// 量杯：水量 v、最大 max；major 每幾標一個數字；unit 單位
export function jug(v, max, o = {}) {
  const { major = 1, w = 150, h = 230, unit = 'L', c = '#6cc6ff' } = o, y = (x) => h - 14 - (x / max) * (h - 44);
  let g = `<rect x="22" y="${f(y(v))}" width="${w - 44}" height="${f(h - 12 - y(v))}" fill="${c}"/><path d="M20,14 V${h - 10} H${w - 20} V14" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
  for (let x = major; x <= max; x += major) g += `<line x1="22" y1="${f(y(x))}" x2="48" y2="${f(y(x))}" stroke="${INK}" stroke-width="3"/>${txt(66, y(x) + 7, x, 18)}`;
  return svg(w, h, g + txt(w - 40, 34, unit, 18, 'opacity=".6"'));
}
// 一杯水：level 0~1 水位；w 杯寬、h 杯高
export function glass(level, o = {}) {
  const { w = 90, h = 150, c = '#6cc6ff' } = o, wy = h - 8 - level * (h - 24);
  return svg(w, h, `<rect x="10" y="${f(wy)}" width="${w - 20}" height="${f(h - 8 - wy)}" fill="${c}"/><path d="M8,8 V${h - 6} H${w - 8} V8" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`);
}

// ---------- 圖表 ----------
// 圖畫統計圖：rows = [{ t 名稱, n 幾個符號 }]；sym 符號（表情符號或 HTML）；key 圖例文字（例如「每個 ⭐ 代表 2 本書」）
export function pgraph(rows, o = {}) {
  const { sym = '⭐', key = '', title = '' } = o;
  return `<div class="pgraph">${title ? `<div class="pgtitle">${title}</div>` : ''}${rows.map((r) => `<div class="pgrow"><span class="pgl">${r.t}</span><span class="pgs">${Array.from({ length: r.n }, () => `<i>${sym}</i>`).join('')}</span></div>`).join('')}${key ? `<div class="pgkey">${key}</div>` : ''}</div>`;
}
// 畫記（正字的英文版：四豎一斜）
export function tally(n) {
  let s = '', x = 6;
  for (let i = 0; i < n; i++) { if (i % 5 === 4) { s += `<line x1="${x - 46}" y1="34" x2="${x - 4}" y2="8" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`; x += 14; } else { s += `<line x1="${x}" y1="6" x2="${x}" y2="36" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`; x += 11; } }
  return svg(Math.max(x + 4, 20), 42, s);
}
// 簡單的表格：rows = [[格子, 格子…], …]，第一列是表頭
export const table = (rows) => `<table class="vtable">${rows.map((r, i) => `<tr>${r.map((c) => (i ? `<td>${c}</td>` : `<th>${c}</th>`)).join('')}</tr>`).join('')}</table>`;

// ---------- 錢 ----------
// 新加坡硬幣：c = 5, 10, 20, 50（分）或 100（1 元）
export const coin = (c) => `<span class="sgc c${c}">${c === 100 ? '$1' : `${c}¢`}</span>`;
// 新加坡紙鈔：d = 2, 5, 10, 50, 100（元）
export const note = (d) => `<span class="sgn n${d}">$${d}</span>`;
// 新台幣硬幣：v = 1, 5, 10, 50
export const twd = (v) => `<span class="twc t${v}">${v}<small>元</small></span>`;
// 金額文字：cents 分 → $3.45
export const sgd = (cents) => `$${(cents / 100).toFixed(2)}`;
// 把金額換成最少的紙鈔／硬幣：回傳面額陣列（分）
export const change = (cents, denoms = [10000, 5000, 1000, 500, 200, 100, 50, 20, 10, 5]) => { const r = []; for (const d of denoms) while (cents >= d) { r.push(d); cents -= d; } return r; };
// 一個面額的 HTML（分）：100 以上的整元用紙鈔（1 元用硬幣）
export const cash = (c) => (c >= 200 ? note(c / 100) : coin(c));

// ---------- 分數 ----------
// n/d 塗色：kind 'bar' 長條 | 'circle' 圓 ；uneven:true 畫成不等分（給「是不是等分」用）
export function frac(n, d, o = {}) {
  const { kind = 'bar', c = '#ff9f1c', s = kind === 'bar' ? 320 : 170, uneven = false } = o;
  if (kind === 'circle') {
    let g = '';
    const cuts = uneven ? unevenCuts(d).map((x) => x * 360) : range(0, d).map((i) => (i * 360) / d);
    for (let i = 0; i < d; i++) { const a0 = ((cuts[i] - 90) * Math.PI) / 180, a1 = ((cuts[i + 1] - 90) * Math.PI) / 180; g += d === 1 ? `<circle cx="100" cy="100" r="90" fill="${n ? c : '#fff'}" stroke="${INK}" stroke-width="5"/>` : `<path d="M100,100 L${f(100 + 90 * Math.cos(a0))},${f(100 + 90 * Math.sin(a0))} A90,90 0 ${cuts[i + 1] - cuts[i] > 180 ? 1 : 0} 1 ${f(100 + 90 * Math.cos(a1))},${f(100 + 90 * Math.sin(a1))} Z" fill="${i < n ? c : '#fff'}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`; }
    return `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
  }
  const cuts = uneven ? unevenCuts(d) : range(0, d).map((i) => i / d), h = Math.round(s * 0.22);
  return svg(s + 8, h + 8, range(0, d - 1).map((i) => `<rect x="${f(4 + cuts[i] * s)}" y="4" width="${f((cuts[i + 1] - cuts[i]) * s)}" height="${h}" fill="${i < n ? c : '#fff'}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`).join(''));
}
function unevenCuts(d) { const w = range(1, d).map(() => 0.5 + Math.random()); w[rnd(0, d - 1)] *= 2.2; const t = w.reduce((a, b) => a + b, 0); let acc = 0; return [0, ...w.map((x) => (acc += x / t))]; }
// 分數的寫法（上下疊）
export const fr = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;

// ---------- 模型圖（bar model）----------
// 部分與整體：parts = [{ t 格子裡的字, v 長度比例 }]，total 下方大括號的字
export function modelPW(parts, total) {
  const W = 560, sum = parts.reduce((a, p) => a + p.v, 0), cols = ['#ffd43a', '#7fd4ff', '#b8ffd6', '#ffb3c7'];
  let x = 10, s = '';
  parts.forEach((p, i) => { const w = Math.max(70, (p.v / sum) * W); s += `<rect x="${f(x)}" y="10" width="${f(w)}" height="60" fill="${cols[i % 4]}" stroke="${INK}" stroke-width="4"/>${txt(x + w / 2, 50, p.t, 28)}`; x += w; });
  s += `<path d="M10,82 v12 H${f(x)} v-12" fill="none" stroke="${INK}" stroke-width="4"/>${txt((10 + x) / 2, 128, total, 28)}`;
  return svg(x + 10, 138, s);
}
// 比較：rows = [{ name, v 長度比例, t 條上的字 }]（兩條）；diff 多出來那一段旁邊的字
export function modelCmp(rows, diff = '') {
  const W = 420, max = Math.max(...rows.map((r) => r.v)), cols = ['#ffd43a', '#7fd4ff'];
  let s = '';
  rows.forEach((r, i) => { const w = Math.max(60, (r.v / max) * W); s += `${txt(60, 44 + i * 74, r.name, 24)}<rect x="124" y="${10 + i * 74}" width="${f(w)}" height="54" fill="${cols[i]}" stroke="${INK}" stroke-width="4"/>${txt(124 + w / 2, 47 + i * 74, r.t, 26)}`; });
  if (diff) { const a = Math.max(60, (Math.min(...rows.map((r) => r.v)) / max) * W), b = Math.max(60, W); s += `<path d="M${f(124 + a)},${rows[0].v < rows[1].v ? 37 : 111} H${f(124 + b)}" stroke="${INK}" stroke-width="4" stroke-dasharray="8 6"/>${txt(124 + (a + b) / 2, rows[0].v < rows[1].v ? 30 : 104, diff, 24)}`; }
  return svg(124 + W + 20, 150, s);
}

// ---------- 其他 ----------
// 月曆：month 1~12、first 這個月 1 號是星期幾（0=日）、days 天數；hl 要圈起來的日期
export function calendar(month, first, days, hl = []) {
  const wd = L(['日', '一', '二', '三', '四', '五', '六'], ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const mn = L(`${month} 月`, ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1]);
  let s = wd.map((d) => `<b>${d}</b>`).join('') + '<i></i>'.repeat(first);
  for (let d = 1; d <= days; d++) s += `<span class="${hl.includes(d) ? 'hl' : ''}">${d}</span>`;
  return `<div class="cal"><div class="calm">${mn}</div><div class="calg">${s}</div></div>`;
}
// 方格地圖：n×n；at=[x,y] 角色在哪（左下角是 0,0）；marks = [{ x, y, h 內容 }] 格子上的東西
export function gridMap(n, at, marks = []) {
  const c = 44, W = n * c, y = (v) => (n - 1 - v) * c;
  let s = '';
  for (let i = 0; i <= n; i++) s += `<line x1="${i * c}" y1="0" x2="${i * c}" y2="${W}" stroke="${INK}" stroke-width="2" opacity=".45"/><line x1="0" y1="${i * c}" x2="${W}" y2="${i * c}" stroke="${INK}" stroke-width="2" opacity=".45"/>`;
  marks.forEach((m) => { s += `<text x="${m.x * c + c / 2}" y="${y(m.y) + c * 0.72}" font-size="${c * 0.62}" text-anchor="middle">${m.h}</text>`; });
  if (at) s += `<circle cx="${at[0] * c + c / 2}" cy="${y(at[1]) + c / 2}" r="${c * 0.34}" fill="#ff5b5b" stroke="${INK}" stroke-width="4"/>`;
  return svg(W, W, `<rect width="${W}" height="${W}" fill="#f4fff0"/>${s}`);
}
// 位置圖：動物（THINGS 的圖片名 k）和一個東西的相對位置
//   rel: 'on' 在上面 | 'under' 在下面 | 'in' 在裡面 | 'out' 在外面 | 'front' 在前面 | 'behind' 在後面 | 'left' 在左邊 | 'right' 在右邊 | 'beside' 在旁邊
//   obj: 'box' 箱子 | 'table' 桌子 | 'tree' 樹
export function posScene(rel, k, obj = 'box', o = {}) {
  const { s = 220 } = o, a = 62;
  const O = {
    box: (op = 1) => `<g opacity="${op}"><rect x="62" y="112" width="96" height="78" rx="6" fill="#d9a066" stroke="${INK}" stroke-width="5"/><line x1="62" y1="136" x2="158" y2="136" stroke="${INK}" stroke-width="4"/></g>`,
    table: () => `<rect x="34" y="104" width="152" height="18" rx="6" fill="#c98a4b" stroke="${INK}" stroke-width="5"/><rect x="48" y="122" width="14" height="72" fill="#c98a4b" stroke="${INK}" stroke-width="5"/><rect x="158" y="122" width="14" height="72" fill="#c98a4b" stroke="${INK}" stroke-width="5"/>`,
    tree: () => `<rect x="98" y="118" width="26" height="76" fill="#8a5a2b" stroke="${INK}" stroke-width="5"/><circle cx="111" cy="78" r="58" fill="#3fae5a" stroke="${INK}" stroke-width="5"/>`,
  };
  const A = (x, y, w = a) => img(k, x, y, w, w), ground = `<ellipse cx="110" cy="196" rx="100" ry="12" fill="rgba(0,0,0,.12)"/>`;
  let g;
  if (rel === 'on') g = O[obj]() + A(79, obj === 'table' ? 46 : obj === 'tree' ? 8 : 54);
  else if (rel === 'under') g = (obj === 'table' ? A(79, 130) + O.table() : O[obj]() + A(79, 150));
  else if (rel === 'in') g = `<rect x="52" y="96" width="116" height="96" rx="6" fill="#b9814a" stroke="${INK}" stroke-width="5"/>${A(79, 78)}<path d="M52,130 H168 V186 a6,6 0 0 1 -6,6 H58 a6,6 0 0 1 -6,-6 Z" fill="#d9a066" stroke="${INK}" stroke-width="5"/>`;
  else if (rel === 'out' || rel === 'beside' || rel === 'right') g = `<g transform="translate(-34,0)">${O[obj]()}</g>${A(140, 132)}`;
  else if (rel === 'left') g = `<g transform="translate(34,0)">${O[obj]()}</g>${A(18, 132)}`;
  else if (rel === 'front') g = O[obj]() + A(79, 136);
  else g = A(obj === 'tree' ? 124 : 79, obj === 'tree' ? 122 : 62) + O[obj](); // behind：被擋住一半
  return `<svg class="vz" width="${s}" height="${s}" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">${ground}${g}</svg>`;
}
// 一排東西排隊（序數、位置詞用）：list = THINGS 圖片名陣列（由左到右）；flag:true 在最左邊畫起點旗子
export const lineup = (list, o = {}) => `<div class="lineup">${o.flag ? '<span class="lflag">🚩</span>' : ''}${list.map((k, i) => `<span class="lu" data-i="${i}">${pic(k, o.s ?? 78)}</span>`).join('')}</div>`;
export { THINGS };
