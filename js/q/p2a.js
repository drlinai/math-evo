// 小二上 LV1（新加坡 P2 Term 1）：38 種題型。數到 1000、三位數加減直式、應用題配模型圖、長度加入公尺。
// 每個題型只是「概念」：數字、東西、人名、情境每次都隨機換。
import { Q, def, L, EN, pl, rnd, pick, shuffle, sample, range, chance, distinct, thing, things2, who, who2 } from './core.js?v=31';
import { row, col, fig, emo, ncard, label, seq, bigEq, vsum, numLine, blocks, ruler, modelPW, modelCmp, svg, COLORS, cname } from './vis.js?v=31';

const T = { num: ['1000 以內的數', 'Numbers to 1000', '🔢'], add: ['1000 以內的加法', 'Addition within 1000', '➕'], sub: ['1000 以內的減法', 'Subtraction within 1000', '➖'], mix: ['加減綜合', 'Addition and subtraction', '🧮'],
  word: ['應用題', 'Word problems', '📖'], len: ['長度', 'Length', '📏'], bonus: ['加分題', 'Bonus', '⭐'] };
const INK = '#2b2140', CK = Object.keys(COLORS);
const J = (list) => list.join(L('、', ', '));
const dg = (n) => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];            // 百位、十位、個位
const PLACE = () => [L('百位', 'hundreds'), L('十位', 'tens'), L('個位', 'ones')];
const tx = (x, y, s, size = 22) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="900" text-anchor="middle" fill="${INK}">${s}</text>`;
// 把 vis.js 的 SVG 放大或縮小到最寬 maxW（最多放大 maxK 倍）
const fit = (h, maxW, maxK = 2) => { const [, w, hh] = h.match(/width="([\d.]+)" height="([\d.]+)"/), k = Math.min(maxK, maxW / w); return h.replace(/width="[\d.]+" height="[\d.]+"/, `width="${Math.round(w * k)}" height="${Math.round(hh * k)}"`); };
const qbox = '<span class="scell q">?</span>';

// ---------- 數字的讀法 ----------
const EN1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'], ZH1 = '零一二三四五六七八九';
const enWord = (n) => { const h = Math.floor(n / 100), r = n % 100, rw = r < 20 ? EN1[r] : EN10[Math.floor(r / 10)] + (r % 10 ? `-${EN1[r % 10]}` : ''); return h ? `${EN1[h]} hundred${r ? ` and ${rw}` : ''}` : rw; };
const zhWord = (n) => { const [h, t, o] = dg(n); return (h ? `${ZH1[h]}百` : '') + (t ? `${h || t > 1 ? ZH1[t] : ''}十` : h && o ? '零' : '') + (o ? ZH1[o] : ''); };
const numWord = (n) => L(zhWord(n), enWord(n));

// ---------- 三位數加減的數字 ----------
// 加法：c1 個位要不要進位、c2 十位要不要進位；和不超過 999
function addPair(c1, c2, hi = 899) {
  for (;;) {
    const a = rnd(101, hi), b = rnd(101, hi), o = (a % 10) + (b % 10) >= 10, t = dg(a)[1] + dg(b)[1] + (o ? 1 : 0) >= 10;
    if (a + b <= 999 && a % 100 && b % 100 && o === c1 && t === c2) return [a, b];
  }
}
// 減法：b1 個位要不要向十位借、b2 十位要不要向百位借
function subPair(b1, b2, hi = 999) {
  for (;;) {
    const a = rnd(201, hi), b = rnd(101, a - 1), o = a % 10 < b % 10, t = dg(a)[1] - (o ? 1 : 0) < dg(b)[1];
    if (b % 100 && o === b1 && t === b2) return [a, b];
  }
}
const addQ = (a, b, vert, hint) => Q.num({ p: L('加加看，答案是多少？', 'Add. What is the answer?'), say: L(`${a} 加 ${b} 等於多少？`, `What is ${a} plus ${b}?`), scene: vert ? vsum(a, b, '+') : bigEq(`${a} + ${b} = □`), ans: a + b, hint, full: `${a} + ${b} = ${a + b}` });
const subQ = (a, b, vert, hint) => Q.num({ p: L('減減看，答案是多少？', 'Subtract. What is the answer?'), say: L(`${a} 減 ${b} 等於多少？`, `What is ${a} minus ${b}?`), scene: vert ? vsum(a, b, '−') : bigEq(`${a} − ${b} = □`), ans: a - b, hint, full: `${a} − ${b} = ${a - b}` });
// 直式（挖掉一個數字）：字串裡的 □ 畫成藍色格子
const BOX = `<span style="display:inline-grid;place-items:center;width:.74em;height:.94em;font-size:.8em;color:#fff;background:linear-gradient(#7fb4ff,#3f8cff);border:5px solid ${INK};border-radius:12px">?</span>`;
function vmiss(a, b, op, res) {
  const cells = (s, lead = '') => `<tr>${range(0, 3).map((i) => { const ch = s[i - (4 - s.length)]; return `<td>${i === 0 && lead ? lead : ch === '□' ? BOX : ch ?? ''}</td>`; }).join('')}</tr>`;
  return `<table class="vsum">${cells(a)}${cells(b, op)}<tr class="line"><td colspan="4"></td></tr>${cells(res)}</table>`;
}

// ---------- 自己畫的圖 ----------
// 兩個兩個一組的圓點：奇數時最後一個落單（紅色）
function pairDots(n, c) {
  let s = '';
  for (let i = 0; i < Math.ceil(n / 2); i++) {
    const x = 6 + i * 52, single = i * 2 + 1 >= n;
    if (!single) s += `<rect x="${x}" y="6" width="44" height="100" rx="20" fill="#fff" stroke="${INK}" stroke-width="3" stroke-dasharray="7 5"/><circle cx="${x + 22}" cy="80" r="16" fill="${c}" stroke="${INK}" stroke-width="4"/>`;
    s += `<circle cx="${x + 22}" cy="32" r="16" fill="${single ? '#ff5b5b' : c}" stroke="${INK}" stroke-width="4"/>`;
  }
  return svg(Math.ceil(n / 2) * 52 + 8, 112, s);
}
// 小張的模型圖（放在選項卡片裡）。部分與整體：左 l、右 r、下方整體 whole；f 左邊佔的比例
function miniPW(l, r, whole, f = 0.5) {
  const W = 236, wl = Math.round(Math.min(W - 70, Math.max(70, f * W)));
  return svg(250, 146, `<rect x="7" y="16" width="${wl}" height="52" fill="#ffd43a" stroke="${INK}" stroke-width="4"/><rect x="${7 + wl}" y="16" width="${W - wl}" height="52" fill="#7fd4ff" stroke="${INK}" stroke-width="4"/>${tx(7 + wl / 2, 51, l, 24)}${tx(7 + wl + (W - wl) / 2, 51, r, 24)}<path d="M7,80 v12 H${7 + W} v-12" fill="none" stroke="${INK}" stroke-width="4"/>${tx(7 + W / 2, 128, whole, 26)}`);
}
// 小張的比較模型：rows = [{ name, v 長度比例, t 條上的字 }]（兩條），diff 多出來那一段的字
function miniCmp(rows, diff) {
  const W = 236, max = Math.max(rows[0].v, rows[1].v), w = rows.map((r) => (r.v === max ? W : Math.round(Math.min(W - 72, Math.max(64, (r.v / max) * W))))), si = w[0] < w[1] ? 0 : 1;
  let s = '';
  rows.forEach((r, i) => { s += `<text x="8" y="${i * 86 + 20}" font-size="19" font-weight="900" fill="${INK}">${r.name}</text><rect x="7" y="${i * 86 + 28}" width="${w[i]}" height="44" fill="${i ? '#7fd4ff' : '#ffd43a'}" stroke="${INK}" stroke-width="4"/>${tx(7 + w[i] / 2, i * 86 + 58, r.t, 22)}`; });
  s += `<path d="M${7 + w[si]},${si * 86 + 62} H${7 + W} M${7 + W},${si * 86 + 52} v20" fill="none" stroke="${INK}" stroke-width="4" stroke-dasharray="7 5"/>${tx(7 + (w[si] + W) / 2, si * 86 + 52, diff, 22)}`;
  return svg(250, 164, s);
}
// 米尺一根接一根：東西長 len 公尺，下面排 n 根 1 公尺的尺
function metreSticks(len, n, c) {
  const k = Math.min(120, 820 / n);
  let s = `<rect x="10" y="12" width="${(len * k).toFixed(1)}" height="34" rx="10" fill="${c}" stroke="${INK}" stroke-width="4"/><line x1="${(10 + len * k).toFixed(1)}" y1="46" x2="${(10 + len * k).toFixed(1)}" y2="70" stroke="${INK}" stroke-width="2" stroke-dasharray="4 5" opacity=".6"/>`;
  for (let i = 0; i < n; i++) s += `<rect x="${(10 + i * k).toFixed(1)}" y="70" width="${k.toFixed(1)}" height="42" fill="${i % 2 ? '#fff' : '#ffe9a8'}" stroke="${INK}" stroke-width="4"/>${tx((10 + i * k + k / 2).toFixed(1), 98, L('1 公尺', '1 m'), k < 80 ? 15 : 19)}`;
  return svg(Math.round(n * k + 20), 120, s);
}
// 尺上方畫幾條線（都從 0 開始）：lines = [{ len, c }]
function rulerLines(max, lines) {
  const w = 840, k = (w - 60) / max, x = (v) => (30 + v * k).toFixed(1), top = lines.length * 28 + 6;
  let s = `<rect x="6" y="${top}" width="${w - 12}" height="62" rx="8" fill="#ffe9a8" stroke="${INK}" stroke-width="4"/>${tx(w - 26, top + 56, 'cm', 15)}`;
  for (let v = 0; v <= max; v++) s += `<line x1="${x(v)}" y1="${top}" x2="${x(v)}" y2="${top + (v % 5 ? 16 : 24)}" stroke="${INK}" stroke-width="3"/>${tx(x(v), top + 46, v, 17)}`;
  lines.forEach((l, i) => { const y = 6 + i * 28; s += `<line x1="${x(l.len)}" y1="${y + 14}" x2="${x(l.len)}" y2="${top}" stroke="${INK}" stroke-width="2" stroke-dasharray="4 5" opacity=".5"/><rect x="${x(0)}" y="${y}" width="${(l.len * k).toFixed(1)}" height="14" fill="${l.c}" stroke="${INK}" stroke-width="3"/>`; });
  return svg(w, top + 66, s);
}
// 一條彎彎的緞帶
const ribbon = (c) => svg(184, 56, ['18" stroke="' + INK, '11" stroke="' + c].map((a) => `<path d="M12,32 q20,-34 40,0 t40,0 t40,0 t40,0" fill="none" stroke-linecap="round" stroke-width="${a}"/>`).join(''));
// 方格紙上的圖形：n 格連在一起
function gridShape(n, c, s = 38, cols = 6, rows = 4) {
  const cells = new Set([rnd(0, cols * rows - 1)]);
  while (cells.size < n) { const k = pick([...cells]), [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), nx = (k % cols) + dx, ny = Math.floor(k / cols) + dy; if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) cells.add(ny * cols + nx); }
  const cell = (i, on) => `<rect x="${2 + (i % cols) * s}" y="${2 + Math.floor(i / cols) * s}" width="${s}" height="${s}" fill="${on ? c : '#fff'}" stroke="${INK}" stroke-width="${on ? 3 : 1.5}" stroke-opacity="${on ? 1 : 0.3}"/>`;
  const all = range(0, cols * rows - 1);
  return svg(cols * s + 4, rows * s + 4, all.filter((i) => !cells.has(i)).map((i) => cell(i, false)).join('') + all.filter((i) => cells.has(i)).map((i) => cell(i, true)).join(''));
}

// ---------- 應用題的故事 ----------
const SHOP = ['balloon', 'car', 'pencil', 'candy', 'lollipop', 'cupcake', 'gift'];
// 部分與整體：a、b 兩個部分，t 整體；part=true 是問其中一個部分（b）。names 是兩個部分的名字
function storyPW(d) {
  const [a, b] = d ? addPair(chance(0.5), chance(0.5)) : addPair(false, false, 450), t = a + b, part = d > 0 && chance(0.4), k = rnd(0, 3);
  let p, names, m;
  if (k === 0) {
    const it = thing(SHOP), [c1, c2] = sample(CK, 2).map(cname); names = [c1, c2]; m = it.m;
    p = part ? L(`商店有 ${t} ${m}${it.zh}，其中 ${a} ${m}是${c1}，其他是${c2}。${c2}的有幾${m}？`, `A shop has ${t} ${it.ens}. ${a} of them are ${c1}. The rest are ${c2}. How many ${c2} ${it.ens} are there?`)
      : L(`商店賣了 ${a} ${m}${c1}${it.zh}和 ${b} ${m}${c2}${it.zh}。一共賣了幾${m}？`, `A shop sold ${a} ${c1} ${it.ens} and ${b} ${c2} ${it.ens}. How many ${it.ens} did it sell altogether?`);
  } else if (k === 1) {
    names = [L('男生', 'boys'), L('女生', 'girls')]; m = '個';
    p = part ? L(`學校有 ${t} 個學生，其中 ${a} 個是男生。女生有幾個？`, `A school has ${t} children. ${a} of them are boys. How many girls are there?`)
      : L(`學校有 ${a} 個男生和 ${b} 個女生。一共有幾個學生？`, `A school has ${a} boys and ${b} girls. How many children are there altogether?`);
  } else if (k === 2) {
    const [x, y] = things2(['pig', 'duck', 'chick']); names = [L(x.zh, x.ens), L(y.zh, y.ens)]; m = '隻';
    p = part ? L(`農場的${x.zh}和${y.zh}一共有 ${t} 隻。${x.zh}有 ${a} 隻。${y.zh}有幾隻？`, `A farm has ${t} ${x.ens} and ${y.ens} altogether. ${a} of them are ${x.ens}. How many ${y.ens} are there?`)
      : L(`農場有 ${a} 隻${x.zh}和 ${b} 隻${y.zh}。一共有幾隻動物？`, `A farm has ${a} ${x.ens} and ${b} ${y.ens}. How many animals are there altogether?`);
  } else {
    const P = who(); names = part ? [L('看過的', 'read'), L('沒看的', 'not read')] : [L('星期六', 'Saturday'), L('星期日', 'Sunday')]; m = '頁';
    p = part ? L(`一本書有 ${t} 頁，${P.n}已經看了 ${a} 頁。還有幾頁沒看？`, `A book has ${t} pages. ${P.n} has read ${a} pages. How many pages has ${P.he} not read yet?`)
      : L(`${P.n}星期六看了 ${a} 頁書，星期日看了 ${b} 頁。兩天一共看了幾頁？`, `${P.n} read ${a} pages on Saturday and ${b} pages on Sunday. How many pages did ${P.he} read altogether?`);
  }
  return { p, a, b, t, part, names, m, ans: part ? b : t, eq: part ? `${t} − ${a} = ${b}` : `${a} + ${b} = ${t}` };
}
// 比較：A 有 x 個；kind 'more' B 比 A 多 k、'fewer' B 比 A 少 k、'diff' 問 A 比 B 多幾個。y 是 B 的數量
const CMP_THINGS = [['貼紙', '張', 'stickers'], ['彈珠', '顆', 'marbles'], ['郵票', '張', 'stamps'], ['卡片', '張', 'cards'], ['珠子', '顆', 'beads'], ['貝殼', '個', 'shells']];
function storyCmp(d) {
  const [A, B] = who2(), [zh, m, en] = pick(CMP_THINGS), kind = pick(d ? ['more', 'fewer', 'diff'] : ['more', 'fewer']);
  let x, k, y;
  do { x = d ? rnd(120, 800) : rnd(12, 40) * 10; k = d ? rnd(25, 400) : rnd(3, 9) * 10; y = kind === 'more' ? x + k : x - k; } while (y < 50 || y > 999 || k * 6 < Math.max(x, y));
  const p = kind === 'diff' ? L(`${A.n}有 ${x} ${m}${zh}，${B.n}有 ${y} ${m}。${A.n}比${B.n}多幾${m}？`, `${A.n} has ${x} ${en}. ${B.n} has ${y} ${en}. How many more ${en} does ${A.n} have than ${B.n}?`)
    : L(`${A.n}有 ${x} ${m}${zh}。${B.n}比${A.n}${kind === 'more' ? '多' : '少'} ${k} ${m}。${B.n}有幾${m}${zh}？`, `${A.n} has ${x} ${en}. ${B.n} has ${k} ${kind === 'more' ? 'more' : 'fewer'} ${en} than ${A.n}. How many ${en} does ${B.n} have?`);
  return { p, A, B, x, y, k, kind, m, ans: kind === 'diff' ? k : y, eq: kind === 'more' ? `${x} + ${k} = ${y}` : kind === 'fewer' ? `${x} − ${k} = ${y}` : `${x} − ${y} = ${k}` };
}

// ---------- 長度用的生活物品：[表情符號, 中文, English, 大約的長度] ----------
const LONG = [['🚪', '門', 'door'], ['🚌', '公車', 'bus'], ['🛏️', '床', 'bed'], ['🚗', '汽車', 'car'], ['🚆', '火車', 'train'], ['🛋️', '沙發', 'sofa'], ['🐊', '鱷魚', 'crocodile'], ['🛶', '小船', 'boat'], ['🚚', '卡車', 'lorry']];
const SHORT = [['✏️', '鉛筆', 'pencil'], ['🥄', '湯匙', 'spoon'], ['📕', '課本', 'book'], ['👟', '鞋子', 'shoe'], ['🪥', '牙刷', 'toothbrush'], ['🔑', '鑰匙', 'key'], ['📱', '手機', 'phone'], ['🥕', '紅蘿蔔', 'carrot'], ['🖍️', '蠟筆', 'crayon'], ['🍌', '香蕉', 'banana']];
const USE_M = [['🏫', '教室', 'classroom', 9], ['🚌', '公車', 'bus', 12], ['🏊', '游泳池', 'swimming pool', 25], ['🏀', '籃球場', 'basketball court', 28], ['🌉', '橋', 'bridge', 80], ['🏟️', '運動場', 'sports field', 100], ['🚚', '卡車', 'lorry', 8], ['🚆', '火車', 'train', 90]];
const USE_CM = [['✏️', '鉛筆', 'pencil', 15], ['📕', '課本', 'book', 25], ['🥄', '湯匙', 'spoon', 15], ['🔑', '鑰匙', 'key', 6], ['🪥', '牙刷', 'toothbrush', 18], ['📱', '手機', 'phone', 14], ['🖍️', '蠟筆', 'crayon', 9], ['👟', '鞋子', 'shoe', 20], ['🍌', '香蕉', 'banana', 18], ['🍃', '葉子', 'leaf', 7]];
const m1 = (s) => s.replace(/\b1 m\b/g, '1 metre');   // 英文語音：1 m 要唸 1 metre

export default [
  // ---- 1000 以內的數 ----
  def(T.num, '一百一百數', 'Count in hundreds', (d) => {
    const back = d > 0 && chance(0.3), a = back ? rnd(4, 10) * 100 : rnd(1, d ? 7 : 4) * 100, list = range(0, 3).map((i) => a + i * (back ? -100 : 100)), miss = d === 2 && chance(0.4) ? rnd(1, 2) : 3;
    const head = back ? L('一百一百倒過來數', 'Count back in hundreds') : L('一百一百數', 'Count in hundreds');
    return Q.num({ p: miss === 3 ? L(`${head}，接下來是多少？`, `${head}. What comes next?`) : L(`${head}，少了哪一個數？`, `${head}. Which number is missing?`), say: miss === 3 ? L(`${head}：${list.slice(0, 3).join('、')}，接下來是多少？`, `${head}: ${list.slice(0, 3).join(', ')}. What comes next?`) : undefined,
      scene: seq(list.map((v, i) => (i === miss ? '?' : v))), ans: list[miss], hint: L('看百位的數字，每次差 1。', 'Look at the hundreds digit. It changes by 1 each time.'), full: list.join(', ') });
  }),
  def(T.num, '十個一數跨百', 'Count on past a hundred', (d) => {
    const hund = d > 0 && chance(0.3), step = hund ? 100 : 10;
    let a; do { a = hund ? rnd(1, 6) * 100 + rnd(1, 9) * 10 : rnd(1, 9) * 100 + (d ? pick([70, 80, 90]) : 70); if (d === 2 && chance(0.4)) a += rnd(1, 9); } while (a + step * 3 > 1000);
    const list = range(0, 3).map((i) => a + i * step);
    return Q.num({ p: L(`每次多 ${step}，接下來是多少？`, `Count on in ${hund ? 'hundreds' : 'tens'}. What comes next?`), say: L(`每次多 ${step}：${list.slice(0, 3).join('、')}，接下來是多少？`, `Count on in ${hund ? 'hundreds' : 'tens'}: ${list.slice(0, 3).join(', ')}. What comes next?`),
      scene: seq([...list.slice(0, 3), '?']), ans: list[3], hint: hund ? L('每次多 100，只有百位會變。', 'Add 100 each time. Only the hundreds digit changes.') : L('十位滿 10 個十，就變成 1 個百。', '10 tens make 1 hundred.'), full: list.join(', ') });
  }),
  def(T.num, '積木讀數', 'Read the blocks', (d) => {
    const n = d === 0 ? rnd(1, 4) * 100 + rnd(1, 6) * 10 + rnd(1, 9) : chance(0.5) ? rnd(1, 9) * 100 + pick([rnd(1, 9), rnd(1, 9) * 10]) : rnd(100, 999), [h, t, o] = dg(n);
    return Q.num({ p: L('積木排出來的數是多少？', 'What number is shown?'), scene: fit(blocks(n), 840, 2), ans: n, hint: L('黃色大板是 100，綠色長條是 10，小方塊是 1。', 'A big yellow square is 100. A green rod is 10. A small cube is 1.'),
      full: L(`${h} 個百、${t} 個十、${o} 個一，是 ${n}`, `${h} ${pl(h, 'hundred', 'hundreds')}, ${t} ${pl(t, 'ten', 'tens')} and ${o} ${pl(o, 'one', 'ones')} make ${n}`) });
  }),
  def(T.num, '數字與單字', 'Numbers and words', (d) => {
    const h = rnd(1, 9), kind = d ? pick(['t0', 't0', 'o0', 'teen', 'full']) : pick(['t0', 'full']);
    const n = h * 100 + (kind === 't0' ? rnd(1, 9) : kind === 'o0' ? rnd(1, 9) * 10 : kind === 'teen' ? rnd(11, 19) : rnd(2, 9) * 10 + rnd(1, 9)), [, t, o] = dg(n), w = numWord(n);
    // 容易搞混的數：十位個位對調、漏掉 0、fifteen／fifty、百位個位對調
    const near = [h * 100 + o * 10 + t, t ? 0 : h * 10 + o, o ? 0 : h * 100 + t, t === 1 ? h * 100 + o * 10 : 0, !o && t > 1 ? h * 100 + 10 + t : 0, o * 100 + t * 10 + h];
    const wrong = [...new Set([...near, ...shuffle([n + 10, n - 10, n + 100, n - 100, n + 1, n - 1])])].filter((v) => v !== n && v >= 10 && v <= 999).slice(0, 3);
    if (chance(0.6)) return Q.pick({ p: L(`「${w}」是哪一個數？`, `Which number is ${w}?`), em: false, scene: `<span class="ncard word gold" style="font-size:${EN() ? 42 : 68}px;padding:0 28px">${w}</span>`, right: n, wrong, sort: true, full: `${w} = ${n}` });
    const card = (v) => `<span class="vlabel" style="font-size:${EN() ? 28 : 50}px;line-height:1.25;text-align:center">${numWord(v)}</span>`;
    return Q.tap({ p: L(`${n} 用國字怎麼寫？`, `How do you write ${n} in words?`), right: card(n), wrong: wrong.slice(0, 2).map(card), full: `${n} = ${w}` });
  }),
  def(T.num, '位值', 'Place value', (d) => {
    let ds; do { ds = distinct(3, d ? 0 : 1, 9); } while (!ds[0]);
    const n = +ds.join(''), i = pick([0, 1, 2].filter((j) => ds[j])), x = ds[i], val = x * [100, 10, 1][i], P = PLACE(), k = d === 0 ? 0 : pick([0, 0, 1, 2]);
    const hi = ncard(`<span>${ds.map((v, j) => (j === i ? `<span style="color:#e8483f">${v}</span>` : v)).join('')}</span>`), hint = L('從右邊數過來：個位、十位、百位。', 'From the right: ones, tens, hundreds.');
    const full = L(`${n} 的 ${x} 在${P[i]}，代表 ${val}`, `In ${n}, the digit ${x} is in the ${P[i]} place. Its value is ${val}.`);
    if (k === 1) return Q.pick({ p: L(`${n} 裡的 ${x} 在哪一位？`, `In ${n}, which place is the digit ${x} in?`), scene: hi, right: P[i], wrong: P.filter((_, j) => j !== i), hint, full });
    if (k === 2) return Q.pick({ p: L(`${n} 的${P[i]}是哪一個數字？`, `Which digit is in the ${P[i]} place of ${n}?`), scene: ncard(n), right: x, wrong: ds.filter((_, j) => j !== i), sort: true, hint, full });
    return Q.pick({ p: L(`${n} 裡的 ${x} 代表多少？`, `What is the value of the digit ${x} in ${n}?`), scene: hi, right: val, wrong: [x, x * 10, x * 100].filter((v) => v !== val), sort: true, hint, full });
  }),
  def(T.num, '展開式', 'Expanded form', (d) => {
    const h = rnd(1, 9), t = d && chance(0.25) ? 0 : rnd(1, 9), o = rnd(1, 9), n = h * 100 + t * 10 + o, terms = [h * 100, t * 10, o].filter(Boolean), full = `${n} = ${terms.join(' + ')}`;
    const p = L('把數拆成百、十、個位。空格是多少？', 'Break the number into hundreds, tens and ones. What is the missing number?');
    if (d === 2 && chance(0.3)) return Q.num({ p, scene: bigEq(`${terms.join(' + ')} = □`), ans: n, full: `${terms.join(' + ')} = ${n}` });
    const i = rnd(0, terms.length - 1), ans = terms[i];
    return Q.num({ p, scene: bigEq(`${n} = ${terms.map((v, j) => (j === i ? '□' : v)).join(' + ')}`), ans, lo: 1, hi: 9, opts: ans === 10 || ans === 20 ? [ans / 10, ans, ans * 10, ans + 10] : undefined,
      hint: L(`想一想：${n} 有幾個百、幾個十、幾個一？`, `How many hundreds, tens and ones are there in ${n}?`), full });
  }),
  def(T.num, '比大小', 'Compare numbers', (d) => {
    // 0 百位不同、1 百位一樣、2 百位十位都一樣、3 同樣三個數字換位置
    const k = d ? pick([1, 2, 3]) : pick([0, 1]);
    let a, b; do { a = rnd(100, 999); b = k === 0 ? rnd(100, 999) : k === 1 ? a - (a % 100) + rnd(0, 99) : k === 2 ? a - (a % 10) + rnd(0, 9) : +shuffle(String(a).split('')).join(''); } while (a === b || b < 100 || (k === 0 && dg(a)[0] === dg(b)[0]) || (k === 1 && dg(a)[1] === dg(b)[1]));
    const big = chance(0.6), ans = big ? Math.max(a, b) : Math.min(a, b), other = a + b - ans;
    return Q.pick({ p: big ? L(`${a} 和 ${b}，哪一個比較大？`, `Which is greater, ${a} or ${b}?`) : L(`${a} 和 ${b}，哪一個比較小？`, `Which is smaller, ${a} or ${b}?`), scene: row(ncard(a), ncard(b)), right: ans, wrong: [other], sort: true,
      hint: L('先比百位；一樣再比十位；再一樣才比個位。', 'Compare the hundreds first, then the tens, then the ones.'), full: big ? L(`${ans} 比 ${other} 大`, `${ans} is greater than ${other}`) : L(`${ans} 比 ${other} 小`, `${ans} is smaller than ${other}`) });
  }),
  def(T.num, '排序', 'Order numbers', (d) => {
    const [x, y, z] = distinct(3, 1, 9), zero = d > 0 && chance(0.5), desc = chance(0.3);
    const pool = zero ? [x * 100 + y, x * 100 + y * 10, y * 100 + x, y * 100 + x * 10, x * 10 + y, y * 10 + x] : [[x, y, z], [x, z, y], [y, x, z], [y, z, x], [z, x, y], [z, y, x]].map((p) => +p.join('')).concat(d ? [x * 10 + y, z * 10 + x] : []);
    const list = sample(pool, d ? 4 : 3), sorted = [...list].sort((a, b) => (desc ? b - a : a - b));
    return Q.order({ p: desc ? L('由大到小，照順序點。', 'Arrange the numbers from greatest to smallest.') : L('由小到大，照順序點。', 'Arrange the numbers from smallest to greatest.'), items: list.map((v) => [ncard(v, 'sm'), v]), desc,
      hint: L('兩位數比三位數小。三位數先比百位。', 'A 2-digit number is smaller than a 3-digit number. Then compare the hundreds.'), full: J(sorted) });
  }),
  def(T.num, '多幾少幾', 'More than and less than', (d) => {
    const k = pick(d ? [1, 10, 100] : [10, 100]), more = chance(0.5), cross = d > 0 && k < 100 && chance(0.5);
    let n; do { const [h, t, o] = dg(rnd(100, 999)); n = h * 100 + (cross && k === 10 ? (more ? 9 : 0) : t) * 10 + (cross && k === 1 ? (more ? 9 : 0) : o); } while (more ? n + k > 1000 : n - k < 100);
    const ans = more ? n + k : n - k, place = PLACE()[k === 100 ? 0 : k === 10 ? 1 : 2];
    return Q.num({ p: more ? L(`比 ${n} 多 ${k} 的數是多少？`, `What is ${k} more than ${n}?`) : L(`比 ${n} 少 ${k} 的數是多少？`, `What is ${k} less than ${n}?`),
      scene: row(ncard(n), col(label(more ? L(`多 ${k}`, `${k} more`) : L(`少 ${k}`, `${k} less`)), emo('➡️', 54)), qbox), ans, hint: L(`先看${place}的數字。`, `Look at the ${place} digit first.`), full: `${n} ${more ? '+' : '−'} ${k} = ${ans}` });
  }),
  def(T.num, '數列規律', 'Number patterns', (d) => {
    const step = pick(d ? [1, 2, 5, 10, 100] : [2, 5, 10]), down = d > 0 && chance(0.4), s = down ? -step : step;
    let a, list; do { a = step === 1 ? rnd(1, 9) * 100 + (down ? rnd(1, 3) : rnd(96, 98)) : step === 5 ? rnd(20, 198) * 5 : rnd(100, 999); list = range(0, 4).map((i) => a + i * s); } while (Math.min(...list) < 1 || Math.max(...list) > 1000);
    const miss = d === 2 && chance(0.35) ? rnd(1, 3) : 4;
    return Q.num({ p: miss === 4 ? L('找出規律，接下來是多少？', 'Look at the pattern. What comes next?') : L('找出規律，少了哪一個數？', 'Look at the pattern. Which number is missing?'), say: miss === 4 ? L(`${list.slice(0, 4).join('、')}，接下來是多少？`, `${list.slice(0, 4).join(', ')}. What comes next?`) : undefined,
      scene: seq(list.map((v, i) => (i === miss ? '?' : v))), ans: list[miss], hint: L('看看每次多多少，或是少多少。', 'How much more or less is it each time?'), full: L(`每次${down ? '少' : '多'} ${step}：${list.join('、')}`, `${down ? 'Subtract' : 'Add'} ${step} each time: ${list.join(', ')}`) });
  }),
  def(T.num, '奇數偶數', 'Odd and even', (d) => {
    const odd = L('奇數', 'odd'), even = L('偶數', 'even');
    if (d === 0) {
      const n = rnd(5, 16), isOdd = n % 2 === 1;
      return Q.pick({ p: L(`${n} 個圓點，兩個兩個一組。${n} 是奇數還是偶數？`, `${n} dots are put in twos. Is ${n} odd or even?`), scene: fit(pairDots(n, COLORS[pick(['blue', 'green', 'yellow', 'purple'])].c), 840, 1.5), right: isOdd ? odd : even, wrong: [isOdd ? even : odd],
        hint: L('剛好分完是偶數；剩下 1 個是奇數。', 'No dot left over means even. One dot left over means odd.'), full: isOdd ? L(`${n} 是奇數（剩下 1 個）`, `${n} is odd (1 left over)`) : L(`${n} 是偶數（剛好分完）`, `${n} is even (none left over)`) });
    }
    const hint = L('看個位數：0、2、4、6、8 是偶數；1、3、5、7、9 是奇數。', 'Look at the ones digit. 0, 2, 4, 6, 8 are even. 1, 3, 5, 7, 9 are odd.');
    if (d === 2 && chance(0.4)) {
      const want = chance(0.5) ? 1 : 0, ans = 2 * rnd(50, 499) + want, wrong = distinct(3, 50, 499).map((v) => 2 * v + 1 - want);
      return Q.pick({ p: want ? L('哪一個是奇數？', 'Which number is odd?') : L('哪一個是偶數？', 'Which number is even?'), scene: row(...shuffle([ans, ...wrong]).map((v) => ncard(v, 'sm'))), right: ans, wrong, sort: true, hint, full: want ? L(`${ans} 是奇數`, `${ans} is odd`) : L(`${ans} 是偶數`, `${ans} is even`) });
    }
    const n = d === 1 ? rnd(10, 99) : rnd(100, 999), isOdd = n % 2 === 1;
    return Q.pick({ p: L(`${n} 是奇數還是偶數？`, `Is ${n} odd or even?`), scene: ncard(d === 1 ? `<span>${Math.floor(n / 10)}<span style="color:#e8483f">${n % 10}</span></span>` : n), right: isOdd ? odd : even, wrong: [isOdd ? even : odd], hint, full: isOdd ? L(`${n} 是奇數`, `${n} is odd`) : L(`${n} 是偶數`, `${n} is even`) });
  }),
  def(T.num, '數線讀數', 'Read the number line', (d) => {
    const step = pick([10, 100]), lo = step === 100 ? 0 : rnd(2, 18) * 50, mark = lo + step * (d ? pick([1, 2, 3, 4, 6, 7, 8, 9]) : rnd(1, 9));
    return Q.num({ p: L('箭頭指的數是多少？', 'Which number is at the arrow?'), scene: numLine(lo, lo + step * 10, d ? { step, every: step * 5, mark } : { step, mark, hide: [mark] }), ans: mark,
      hint: L(`每一小格是 ${step}。一格一格數。`, `Each small step is ${step}. Count on step by step.`), full: L(`箭頭指的是 ${mark}`, `The arrow is at ${mark}`) });
  }),
  def(T.num, '組最大最小', 'Greatest and smallest number', (d) => {
    const ds = distinct(3, d === 2 ? 0 : 1, 9), big = chance(d ? 0.5 : 0.7), s = [...ds].sort((a, b) => a - b);
    const ans = big ? s[2] * 100 + s[1] * 10 + s[0] : s[0] ? s[0] * 100 + s[1] * 10 + s[2] : s[1] * 100 + s[2];
    return Q.num({ p: L(`用 ${ds.join('、')} 排出${big ? '最大' : '最小'}的三位數。`, `Use ${ds[0]}, ${ds[1]} and ${ds[2]} to make the ${big ? 'greatest' : 'smallest'} 3-digit number.`), scene: row(...ds.map((v) => ncard(v))), ans,
      hint: big ? L('最大的數字放在百位。', 'Put the greatest digit in the hundreds place.') : L('最小的數字放在百位，但是 0 不能放最前面。', 'Put the smallest digit in the hundreds place. But 0 cannot come first.'),
      full: big ? L(`最大的三位數是 ${ans}`, `The greatest 3-digit number is ${ans}`) : L(`最小的三位數是 ${ans}`, `The smallest 3-digit number is ${ans}`) });
  }),
  // ---- 1000 以內的加法 ----
  def(T.add, '三位數相加', 'Add without regrouping', (d) => addQ(...addPair(false, false, d ? 899 : 450), d === 0 || chance(0.5), L('個位加個位，十位加十位，百位加百位。', 'Add the ones, then the tens, then the hundreds.'))),
  def(T.add, '個位進位', 'Add: regroup the ones', (d) => addQ(...addPair(true, false, d ? 899 : 450), true, L('個位加起來滿 10，要進 1 到十位。', 'When the ones make 10 or more, regroup 10 ones as 1 ten.'))),
  def(T.add, '十位進位', 'Add: regroup the tens', (d) => addQ(...addPair(false, true, d ? 899 : 600), true, L('十位加起來滿 10，要進 1 到百位。', 'When the tens make 10 or more, regroup 10 tens as 1 hundred.'))),
  def(T.add, '連續進位', 'Add: regroup twice', (d) => addQ(...addPair(true, true, d ? 899 : 600), true, L('個位和十位都會進位，一位一位慢慢加。', 'Regroup the ones, then regroup the tens. Go one column at a time.'))),
  // ---- 1000 以內的減法 ----
  def(T.sub, '三位數相減', 'Subtract without regrouping', (d) => subQ(...subPair(false, false, d ? 999 : 699), d === 0 || chance(0.5), L('個位減個位，十位減十位，百位減百位。', 'Subtract the ones, then the tens, then the hundreds.'))),
  def(T.sub, '十位退位', 'Subtract: regroup a ten', (d) => subQ(...subPair(true, false, d ? 999 : 699), true, L('個位不夠減，向十位借 1 當 10。', 'Not enough ones? Regroup 1 ten as 10 ones.'))),
  def(T.sub, '百位退位', 'Subtract: regroup a hundred', (d) => subQ(...subPair(false, true, d ? 999 : 699), true, L('十位不夠減，向百位借 1 當 10 個十。', 'Not enough tens? Regroup 1 hundred as 10 tens.'))),
  def(T.sub, '跨零減法', 'Subtract across zero', (d) => {
    let a, b; do { a = rnd(2, 9) * 100 + (d && chance(0.5) ? rnd(1, 8) : 0); b = rnd(101, a - 1); } while (b % 10 <= a % 10);
    return subQ(a, b, true, L('十位是 0，要先向百位借，再借給個位。', 'The tens digit is 0. Regroup 1 hundred as 10 tens first, then 1 ten as 10 ones.'));
  }),
  // ---- 加減綜合 ----
  def(T.mix, '心算', 'Mental sums', (d) => {
    const i = rnd(0, 2), m = [100, 10, 1][i], add = d === 0 || chance(0.5);
    let n, k; do { n = rnd(100, 999); k = rnd(1, 8); } while (add ? dg(n)[i] + k > 9 : dg(n)[i] - k < (i ? 0 : 1));
    const ans = add ? n + k * m : n - k * m, op = add ? '+' : '−';
    return Q.num({ p: L('用心算算算看，答案是多少？', 'Work it out in your head. What is the answer?'), say: add ? L(`${n} 加 ${k * m} 等於多少？`, `What is ${n} plus ${k * m}?`) : L(`${n} 減 ${k * m} 等於多少？`, `What is ${n} minus ${k * m}?`), scene: bigEq(`${n} ${op} ${k * m} = □`), ans,
      hint: L(`只有${PLACE()[i]}的數字會變。`, `Only the ${PLACE()[i]} digit changes.`), full: `${n} ${op} ${k * m} = ${ans}` });
  }),
  def(T.mix, '缺位數', 'Missing digit', (d) => {
    const add = chance(0.5);
    let x, y, z; do { [x, y] = add ? addPair(d === 2 && chance(0.5), false) : subPair(false, false); z = add ? x + y : x - y; } while (z < 100);
    const r = d === 2 ? rnd(0, 2) : d ? rnd(0, 1) : 0, pos = d ? rnd(0, 2) : rnd(1, 2), nums = [x, y, z].map(String), ans = +nums[r][pos], op = add ? '+' : '−';
    nums[r] = nums[r].slice(0, pos) + '□' + nums[r].slice(pos + 1);
    return Q.num({ p: L('直式裡有一個數字不見了。藍色格子裡是多少？', 'One digit is missing. Which digit goes in the blue box?'), scene: vmiss(nums[0], nums[1], op, nums[2]), ans, lo: 0, hi: 9,
      hint: L('只看有藍色格子的那一直行。', 'Look at the column with the blue box.'), full: `${x} ${op} ${y} = ${z}` });
  }),
  def(T.mix, '用加法驗算', 'Check by adding', (d) => {
    let a, b;
    do { [a, b] = d ? subPair(chance(0.5), chance(0.5)) : subPair(false, false); } while (a === 2 * b); // 答案和減數一樣的話，選項會重複
    const c = a - b, k = d ? rnd(0, 2) : 0;
    if (k === 1) return Q.pick({ p: L(`${a} − ${b} = ${c}。哪一個加法可以用來驗算？`, `${a} − ${b} = ${c}. Which addition can you use to check?`), scene: vsum(a, b, '−', c), right: `${c} + ${b}`, wrong: [`${a} + ${b}`, `${a} + ${c}`],
      hint: L('把答案和減掉的數加回去，要等於原來的數。', 'Add the answer and the number you took away. You should get the first number.'), full: `${c} + ${b} = ${a}` });
    if (k === 2) {
      const P = who(), ok = chance(0.5); let c2; do { c2 = ok ? c : c + pick([-100, -10, -1, 1, 10, 100]); } while (c2 < 1 || c2 + b > 999);
      return Q.yn({ p: L(`${P.n}算 ${a} − ${b} = ${c2}。驗算：${c2} + ${b} = ${c2 + b}。${P.ta}算對了嗎？`, `${P.n} worked out ${a} − ${b} = ${c2}. Check: ${c2} + ${b} = ${c2 + b}. Is ${P.n} correct?`), scene: row(vsum(a, b, '−', c2), emo('➡️', 56), vsum(c2, b, '+', c2 + b)), ans: ok,
        yes: L('對', 'Yes'), no: L('不對', 'No'), full: ok ? L(`${c2} + ${b} = ${a}，和原來的數一樣，算對了`, `${c2} + ${b} = ${a}. It matches, so it is correct.`) : L(`${c2 + b} 不是 ${a}，算錯了。${a} − ${b} = ${c}`, `${c2 + b} is not ${a}, so it is wrong. ${a} − ${b} = ${c}`) });
    }
    return Q.num({ p: L(`${a} − ${b} = ${c}。用加法驗算：${c} + ${b} 是多少？`, `${a} − ${b} = ${c}. Check by adding: what is ${c} + ${b}?`), scene: row(vsum(a, b, '−', c), emo('➡️', 56), vsum(c, b, '+')), ans: a,
      hint: L('算對的話，加回去會等於原來的數。', 'If it is correct, you get the first number back.'), full: L(`${c} + ${b} = ${a}，算對了！`, `${c} + ${b} = ${a}. It is correct!`) });
  }),
  // ---- 應用題 ----
  def(T.word, '部分與整體', 'Part-whole word problems', (d) => {
    const s = storyPW(d);
    return Q.num({ p: s.p, scene: modelPW([{ t: s.a, v: s.a }, { t: s.part ? '?' : s.b, v: s.b }], s.part ? s.t : '?'), ans: s.ans, unit: L(s.m, ''),
      hint: s.part ? L('整體減掉知道的那一部分。', 'Take the part you know away from the whole.') : L('兩個部分合起來就是整體。', 'Put the two parts together to find the whole.'), full: s.eq });
  }),
  def(T.word, '比較', 'Comparison word problems', (d) => {
    const s = storyCmp(d);
    return Q.num({ p: s.p, scene: modelCmp([{ name: s.A.n, v: s.x, t: s.x }, { name: s.B.n, v: s.y, t: s.kind === 'diff' ? s.y : '?' }], s.kind === 'diff' ? '?' : s.k), ans: s.ans, unit: L(s.m, ''),
      hint: L('看模型圖：誰的比較長？要用加的還是減的？', 'Look at the model. Whose bar is longer? Do you add or subtract?'), full: s.eq });
  }),
  def(T.word, '選模型圖', 'Choose the model', (d) => {
    const ask = L('哪一個模型圖是對的？', 'Which model matches the story?');
    if (chance(0.5)) {
      const s = storyPW(d), { a, b, t, names } = s, big = Math.max(a, b), small = Math.min(a, b);
      const right = s.part ? miniPW(a, '?', t, a / t) : miniPW(a, b, '?', a / t);
      const wrong = s.part ? [miniPW(a, t, '?', a / (a + t)), miniCmp([{ name: names[0], v: a, t: a }, { name: names[1], v: a + t, t: '?' }], t)]
        : [miniPW(small, '?', big, small / big), miniCmp([{ name: names[0], v: a, t: a }, { name: names[1], v: b, t: b }], '?')];
      return Q.tap({ p: `${s.p}${L('', ' ')}${ask}`, right, wrong, hint: s.part ? L('整體已經知道了，要找的是其中一個部分。', 'You know the whole. You need to find one part.') : L('兩個部分都知道了，要找的是整體。', 'You know both parts. You need to find the whole.'), full: s.eq });
    }
    const s = storyCmp(d), { A, B, x, y, k, kind } = s, r = (v, t) => [{ name: A.n, v: x, t: x }, { name: B.n, v, t }];
    const right = kind === 'diff' ? miniCmp(r(y, y), '?') : miniCmp(r(y, '?'), k);
    const wrong = kind === 'diff' ? [miniPW(x, y, '?', x / (x + y)), miniCmp(r(x + y, '?'), y)] : [miniCmp(r(kind === 'more' ? x - k : x + k, '?'), k), kind === 'more' ? miniCmp(r(k, k), '?') : miniPW(x, k, '?', x / (x + k))];
    return Q.tap({ p: `${s.p}${L('', ' ')}${ask}`, right, wrong, hint: L('誰的比較多，誰的長條就比較長。', 'The one who has more gets the longer bar.'), full: s.eq });
  }),
  // ---- 長度 ----
  def(T.len, '和 1 公尺比', 'Longer or shorter than 1 m', (d) => {
    const hint = L('1 公尺大約是你兩手張開那麼長。', '1 m is about as long as your arms stretched out wide.');
    if (d && chance(0.4)) {
      const want = chance(0.6), nl = rnd(2, 3), list = [...sample(LONG, nl).map((o) => [o, true]), ...sample(SHORT, 5 - nl).map((o) => [o, false])], names = J(list.filter(([, long]) => long === want).map(([o]) => L(o[1], o[2])));
      const p = want ? L('哪些東西比 1 公尺長？全部找出來。', 'Which things are longer than 1 m? Find them all.') : L('哪些東西比 1 公尺短？全部找出來。', 'Which things are shorter than 1 m? Find them all.'), full = want ? L(`比 1 公尺長：${names}`, `Longer than 1 m: ${names}`) : L(`比 1 公尺短：${names}`, `Shorter than 1 m: ${names}`);
      return Q.multi({ p, say: EN() ? m1(p) : undefined, items: list.map(([o, long]) => [fig(emo(o[0], 64), L(o[1], o[2])), long === want]), hint, full, fullSay: EN() ? m1(full) : undefined });
    }
    const long = chance(0.5), [e, zh, en] = pick(long ? LONG : SHORT), p = L(`${zh}比 1 公尺長，還是比 1 公尺短？`, `Is the ${en} longer or shorter than 1 m?`), full = long ? L(`${zh}比 1 公尺長`, `The ${en} is longer than 1 m`) : L(`${zh}比 1 公尺短`, `The ${en} is shorter than 1 m`);
    const opts = [L('比 1 公尺長', 'longer than 1 m'), L('比 1 公尺短', 'shorter than 1 m')];
    return Q.pick({ p, say: EN() ? m1(p) : undefined, scene: emo(e, 170), right: opts[long ? 0 : 1], wrong: [opts[long ? 1 : 0]], hint, full, fullSay: EN() ? m1(full) : undefined });
  }),
  def(T.len, '選單位', 'Metres or centimetres?', (d) => {
    const useM = chance(0.5), [e, zh, en, n] = pick(useM ? USE_M : USE_CM), M = L('公尺', 'm'), C = L('公分', 'cm');
    const hint = L('很長的東西用公尺，短短的東西用公分。', 'Use metres for long things. Use centimetres for short things.');
    if (d && chance(0.5)) return Q.pick({ p: L(`${zh}大約長 ${n} 公尺，還是 ${n} 公分？`, `Is the ${en} about ${n} m or ${n} cm long?`), scene: emo(e, 170), right: `${n} ${useM ? M : C}`, wrong: [`${n} ${useM ? C : M}`], hint, full: L(`${zh}大約長 ${n} ${useM ? M : C}`, `The ${en} is about ${n} ${useM ? M : C} long`) });
    return Q.pick({ p: L(`${zh}的長度，用公尺還是公分比較適合？`, `Would you measure the ${en} in m or cm?`), say: L(`${zh}的長度，用公尺還是公分比較適合？`, `Would you measure the ${en} in metres or centimetres?`), scene: emo(e, 170),
      right: useM ? L('公尺', 'metres (m)') : L('公分', 'centimetres (cm)'), wrong: [useM ? L('公分', 'centimetres (cm)') : L('公尺', 'metres (m)')], hint, full: useM ? L(`${zh}的長度用公尺比較適合`, `Measure the ${en} in metres`) : L(`${zh}的長度用公分比較適合`, `Measure the ${en} in centimetres`) });
  }),
  def(T.len, '用尺量公分', 'Measure in centimetres', (d) => {
    const [zh, en] = pick([['緞帶', 'ribbon'], ['鉛筆', 'pencil'], ['吸管', 'straw'], ['蠟筆', 'crayon'], ['繩子', 'string'], ['木棒', 'stick']]), max = [15, 20, 30][d], off = d === 2 && chance(0.3) ? rnd(1, 5) : 0, n = rnd(d ? 6 : 2, max - off - (d === 2 ? 0 : 1));
    return Q.num({ p: off ? L(`${zh}沒有對齊 0。${zh}有幾公分長？`, `The ${en} does not start at 0. How long is the ${en}? □ cm`) : L(`${zh}有幾公分長？`, `How long is the ${en}? □ cm`), say: off ? L(`${zh}沒有對齊 0。${zh}有幾公分長？`, `The ${en} does not start at 0. How many centimetres long is the ${en}?`) : L(`${zh}有幾公分長？`, `How many centimetres long is the ${en}?`),
      scene: ruler(max, { from: off, to: off + n, c: COLORS[pick(CK)].c }), ans: n, lo: Math.max(1, n - 4), hi: n + 4, unit: L('公分', 'cm'),
      hint: off ? L('數數看，從頭到尾一共有幾格。', 'Count the 1-cm steps from one end to the other.') : L(`看${zh}的尾巴對到尺上的哪一個數字。`, `Look at the number at the end of the ${en}.`), full: off ? L(`${off + n} − ${off} = ${n}，${zh}長 ${n} 公分`, `${off + n} − ${off} = ${n}. The ${en} is ${n} cm long.`) : L(`${zh}長 ${n} 公分`, `The ${en} is ${n} cm long`) });
  }),
  def(T.len, '讀公尺', 'Measure in metres', (d) => {
    const [zh, en] = pick([['繩子', 'rope'], ['水管', 'hose'], ['圍籬', 'fence'], ['木板', 'plank'], ['彩帶', 'streamer'], ['布條', 'banner']]), n = rnd(1, d ? 10 : 5), len = d ? n + pick([-0.2, -0.1, 0.1, 0.2]) : n, c = COLORS[pick(CK)].c, tape = d > 0 && chance(0.5);
    return Q.num({ p: d ? L(`${zh}大約有幾公尺長？`, `The ${en} is about □ m long.`) : L(`${zh}有幾公尺長？`, `The ${en} is □ m long.`), say: d ? L(`${zh}大約有幾公尺長？`, `About how many metres long is the ${en}?`) : L(`${zh}有幾公尺長？`, `How many metres long is the ${en}?`),
      scene: tape ? ruler(n > 8 ? 12 : 10, { from: 0, to: len, c }, { unit: L('公尺', 'm') }) : metreSticks(len, Math.min(11, n + rnd(1, 2)), c), ans: n, lo: 1, hi: 12, unit: L('公尺', 'm'),
      hint: tape ? L(`看${zh}的尾巴最靠近哪一個數字。`, `Which number is the end of the ${en} nearest to?`) : L('一根尺是 1 公尺。數數看排了幾根。', 'Each stick is 1 m long. Count the sticks.'), full: d ? L(`${zh}大約長 ${n} 公尺`, `The ${en} is about ${n} m long`) : L(`${zh}長 ${n} 公尺`, `The ${en} is ${n} m long`), fullSay: EN() ? `The ${en} is ${d ? 'about ' : ''}${n} ${pl(n, 'metre', 'metres')} long` : undefined });
  }),
  def(T.len, '比較排序', 'Compare and order lengths', (d) => {
    const cm = chance(0.5), u = cm ? L('公分', 'cm') : L('公尺', 'm'), cs = sample(CK, 3), [zh, en] = pick([['緞帶', 'ribbon'], ['繩子', 'rope'], ['彩帶', 'streamer']]), [x, y, z] = distinct(3, 1, 9), t = rnd(2, 8);
    const vs = d === 0 ? distinct(3, 12, 98) : cm ? sample([[x, y, z], [x, z, y], [y, x, z], [y, z, x], [z, x, y], [z, y, x]].map((p) => +p.join('')), 3) : distinct(3, t * 10, t * 10 + 9), card = (i) => fig(ribbon(COLORS[cs[i]].c), `${vs[i]} ${u}`);
    if (chance(0.5)) {
      const long = chance(0.5), best = long ? Math.max(...vs) : Math.min(...vs), i = vs.indexOf(best);
      return Q.tap({ p: long ? L(`哪一條${zh}最長？`, `Which ${en} is the longest?`) : L(`哪一條${zh}最短？`, `Which ${en} is the shortest?`), cards: [0, 1, 2].map((j) => [card(j), j === i]), hint: L('單位一樣，比數字的大小就可以了。', 'The unit is the same, so just compare the numbers.'),
        full: long ? L(`${cname(cs[i])}的最長：${best} ${u}`, `The ${cname(cs[i])} ${en} is the longest: ${best} ${u}`) : L(`${cname(cs[i])}的最短：${best} ${u}`, `The ${cname(cs[i])} ${en} is the shortest: ${best} ${u}`) });
    }
    const desc = chance(0.3), sorted = [...vs].sort((a, b) => (desc ? b - a : a - b));
    return Q.order({ p: desc ? L(`把${zh}由最長到最短，照順序點。`, `Arrange the ${en}s from longest to shortest.`) : L(`把${zh}由最短到最長，照順序點。`, `Arrange the ${en}s from shortest to longest.`), items: [0, 1, 2].map((j) => [card(j), vs[j]]), desc,
      hint: L('單位一樣，比數字的大小就可以了。', 'The unit is the same, so just compare the numbers.'), full: J(sorted.map((v) => `${v} ${u}`)) });
  }),
  def(T.len, '畫線段', 'Draw a line', (d) => {
    const max = d ? 20 : 12, n = rnd(d ? 5 : 3, max - 1), cs = sample(CK, 3);
    const others = sample(range(n - (d ? 3 : 5), n + (d ? 3 : 5)).filter((v) => v >= 1 && v <= max && Math.abs(v - n) >= (d ? 1 : 2)), 2), lens = shuffle([n, ...others]), i = lens.indexOf(n);
    const opt = (j) => `<span class="vcol" style="gap:6px"><span style="display:block;width:104px;height:20px;background:${COLORS[cs[j]].c};border:4px solid ${INK};border-radius:5px"></span><span>${cname(cs[j])}</span></span>`;
    return Q.pick({ p: L(`要畫一條 ${n} 公分的線。哪一條線畫對了？`, `Draw a line ${n} cm long. Which line is correct?`), scene: rulerLines(max, lens.map((len, j) => ({ len, c: COLORS[cs[j]].c }))), right: opt(i), wrong: [0, 1, 2].filter((j) => j !== i).map(opt),
      hint: L('線從 0 開始，看線的尾巴對到哪一個數字。', 'Each line starts at 0. Look at the number at the end of the line.'), full: L(`${cname(cs[i])}的線是 ${n} 公分`, `The ${cname(cs[i])} line is ${n} cm long`) });
  }),
  def(T.len, '長度加減應用題', 'Length word problems', (d) => {
    const kind = pick(d ? ['tall', 'rope', 'used', 'walk', 'diff'] : ['tall', 'rope', 'used']), M = L('公尺', 'm'), C = L('公分', 'cm');
    let p, scene, ans, eq, u = C;
    if (kind === 'tall' || kind === 'rope') {
      const tall = kind === 'tall', less = chance(0.5); let x, k;
      do { x = tall ? rnd(8, d ? 60 : 20) : rnd(12, d ? 70 : 40) * 10; k = tall ? rnd(2, d ? 25 : 9) : d ? rnd(25, 300) : rnd(3, 9) * 10; } while (k * 6 < x || (less ? x - k < (tall ? 2 : 40) : x + k > 999));
      const y = less ? x - k : x + k; let names;
      if (tall) {
        const [zh, en] = pick([['樹', 'Tree'], ['塔', 'Tower'], ['大樓', 'Building']]); names = [L(`A ${zh}`, `${en} A`), L(`B ${zh}`, `${en} B`)]; u = M;
        p = L(`A ${zh}高 ${x} 公尺。B ${zh}比 A ${zh}${less ? '矮' : '高'} ${k} 公尺。B ${zh}高幾公尺？`, `${en} A is ${x} m tall. ${en} B is ${k} m ${less ? 'shorter' : 'taller'}. How tall is ${en} B?`);
      } else {
        const [zh, en] = pick([['繩子', 'rope'], ['緞帶', 'ribbon'], ['水管', 'hose']]); names = sample(CK, 2).map(cname);
        p = L(`${names[0]}${zh}長 ${x} 公分。${names[1]}${zh}比它${less ? '短' : '長'} ${k} 公分。${names[1]}${zh}長幾公分？`, `The ${names[0]} ${en} is ${x} cm long. The ${names[1]} ${en} is ${k} cm ${less ? 'shorter' : 'longer'}. How long is the ${names[1]} ${en}?`);
      }
      scene = modelCmp([{ name: names[0], v: x, t: x }, { name: names[1], v: y, t: '?' }], k); ans = y; eq = `${x} ${less ? '−' : '+'} ${k} = ${y}`;
    } else if (kind === 'used') {
      const P = who(), x = d ? rnd(200, 900) : rnd(20, 90) * 10, k = d ? rnd(60, x - 60) : rnd(5, x / 10 - 5) * 10;
      p = L(`${P.n}有一條 ${x} 公分的緞帶，用掉 ${k} 公分。還剩幾公分？`, `${P.n} has a ribbon ${x} cm long. ${P.He} uses ${k} cm of it. How long is the ribbon that is left?`);
      scene = modelPW([{ t: k, v: k }, { t: '?', v: x - k }], x); ans = x - k; eq = `${x} − ${k} = ${ans}`;
    } else if (kind === 'walk') {
      const P = who(), [a, b] = addPair(chance(0.5), chance(0.5)), [z1, z2] = sample([['商店', 'shop'], ['公園', 'park'], ['圖書館', 'library'], ['學校', 'school']], 2); u = M;
      p = L(`${P.n}走 ${a} 公尺到${z1[0]}，再走 ${b} 公尺到${z2[0]}。一共走了幾公尺？`, `${P.n} walks ${a} m to the ${z1[1]}. Then ${P.he} walks ${b} m to the ${z2[1]}. How far does ${P.he} walk altogether?`);
      scene = modelPW([{ t: a, v: a }, { t: b, v: b }], '?'); ans = a + b; eq = `${a} + ${b} = ${ans}`;
    } else {
      const [A, B] = who2(); let x, y; do { x = rnd(150, 900); y = rnd(60, x - 30); } while ((x - y) * 6 < x);
      p = L(`${A.n}的繩子長 ${x} 公分，${B.n}的繩子長 ${y} 公分。${A.n}的繩子比${B.n}的長幾公分？`, `${A.n}'s rope is ${x} cm long. ${B.n}'s rope is ${y} cm long. How much longer is ${A.n}'s rope than ${B.n}'s rope?`);
      scene = modelCmp([{ name: A.n, v: x, t: x }, { name: B.n, v: y, t: y }], '?'); ans = x - y; eq = `${x} − ${y} = ${ans}`;
    }
    return Q.num({ p, scene, ans, lo: Math.max(0, ans - 6), hi: ans + 6, unit: u, hint: L('看模型圖，想想要用加的還是減的。', 'Look at the model. Do you add or subtract?'), full: `${eq} ${u}` });
  }),
  def(T.len, '兩段相加', 'Two pieces', (d) => {
    const [one, zh, en] = pick([['一條繩子', '繩子', 'rope'], ['一條緞帶', '緞帶', 'ribbon'], ['一條鐵絲', '鐵絲', 'wire'], ['一條水管', '水管', 'hose'], ['一塊木板', '木板', 'plank']]), cm = chance(0.7), u = cm ? L('公分', 'cm') : L('公尺', 'm'), back = d > 0 && chance(0.3);
    let a, b; do { [a, b] = cm ? (d ? addPair(chance(0.5), chance(0.5)) : addPair(false, false, 450)) : [rnd(12, 60), rnd(12, 60)]; } while (Math.min(a, b) * 3 < Math.max(a, b));
    const t = a + b, ans = back ? b : t;
    return Q.num({ p: back ? L(`${one}長 ${t} ${u}，剪成兩段。其中一段長 ${a} ${u}，另一段長幾${u}？`, `A ${en} ${t} ${u} long is cut into 2 pieces. One piece is ${a} ${u} long. How long is the other piece?`) : L(`${one}剪成兩段：${a} ${u}和 ${b} ${u}。${zh}原本有多長？`, `A ${en} is cut into 2 pieces: ${a} ${u} and ${b} ${u}. How long was the ${en}?`),
      scene: col(emo('✂️', 44), modelPW([{ t: `${a} ${u}`, v: a }, { t: back ? '?' : `${b} ${u}`, v: b }], back ? `${t} ${u}` : '?')), ans, lo: Math.max(0, ans - 6), hi: ans + 6, unit: u,
      hint: back ? L('全長減掉知道的那一段。', 'Take the piece you know away from the whole length.') : L('把兩段的長度加起來。', 'Add the lengths of the two pieces.'), full: back ? `${t} − ${a} = ${b} ${u}` : `${a} + ${b} = ${t} ${u}` });
  }),
  // ---- 加分題（台灣）----
  def(T.bonus, '公尺公分換算', 'Metres and centimetres', (d) => {
    const m = rnd(1, d ? 9 : 5), c = d === 2 ? rnd(1, 99) : rnd(1, 19) * 5, t = m * 100 + c, k = d ? pick([0, 1, 1, 2, 3]) : pick([0, 0, 1]), M = L('公尺', 'm'), C = L('公分', 'cm'), ms = `${m} ${pl(m, 'metre', 'metres')}`;
    if (k === 0) return Q.num({ p: L(`${m} 公尺是幾公分？`, `How many centimetres are there in ${m} m?`), say: L(`${m} 公尺是幾公分？`, `How many centimetres are there in ${ms}?`), scene: bigEq(`${m} ${M} = □ ${C}`, 'xs'), ans: m * 100, unit: C,
      hint: m > 1 ? L('1 公尺是 100 公分。', '1 m is 100 cm.') : undefined, full: `${m} ${M} = ${m * 100} ${C}`, fullSay: EN() ? `${ms} equals ${m * 100} centimetres` : undefined });
    const full = `${m} ${M} ${c} ${C} = ${t} ${C}`, fullSay = EN() ? `${ms} ${c} centimetres equals ${t} centimetres` : undefined, hint = L('1 公尺是 100 公分。', '1 m is 100 cm.');
    if (k === 1) return Q.num({ p: L(`${m} 公尺 ${c} 公分是幾公分？`, `How many centimetres is ${m} m ${c} cm?`), say: L(`${m} 公尺 ${c} 公分是幾公分？`, `How many centimetres is ${ms} ${c} centimetres?`), scene: bigEq(`${m} ${M} ${c} ${C} = □ ${C}`, 'tiny'), ans: t, unit: C, hint, full, fullSay });
    const p = L('1 公尺 = 100 公分。空格是多少？', '1 m = 100 cm. What is the missing number?'), say = L('1 公尺等於 100 公分。空格是多少？', '1 metre equals 100 centimetres. What is the missing number?');
    if (k === 2) return Q.num({ p, say, scene: bigEq(`${t} ${C} = □ ${M} ${c} ${C}`, 'tiny'), ans: m, lo: 1, hi: 9, unit: M, hint: L('看看有幾個 100 公分。', 'How many hundreds of centimetres are there?'), full, fullSay });
    return Q.num({ p, say, scene: bigEq(`${t} ${C} = ${m} ${M} □ ${C}`, 'tiny'), ans: c, lo: 0, hi: 99, unit: C, hint: L(`先拿走 ${m} 公尺，就是 ${m * 100} 公分。`, `Take away ${m} m first. That is ${m * 100} cm.`), full, fullSay });
  }, true),
  def(T.bonus, '面積比較', 'Which covers more squares?', (d) => {
    const n = d === 2 ? 3 : 2, more = chance(0.7), cs = sample(CK, n);
    let ns; do { const b = rnd(4, 9); ns = sample(range(b, b + (d ? 3 : 6)), n); } while (!d && Math.abs(ns[0] - ns[1]) < 2);
    const best = more ? Math.max(...ns) : Math.min(...ns), i = ns.indexOf(best), other = ns[1 - i], g = (j) => gridShape(ns[j], COLORS[cs[j]].c, n === 2 ? 46 : 38);
    const p = n === 2 ? (more ? L('哪一個圖形佔的格子比較多？', 'Which shape covers more squares?') : L('哪一個圖形佔的格子比較少？', 'Which shape covers fewer squares?')) : more ? L('哪一個圖形佔的格子最多？', 'Which shape covers the most squares?') : L('哪一個圖形佔的格子最少？', 'Which shape covers the fewest squares?');
    const full = n === 2 ? (more ? L(`${best} 格比 ${other} 格多`, `${best} squares is more than ${other} squares`) : L(`${best} 格比 ${other} 格少`, `${best} squares is fewer than ${other} squares`)) : more ? L(`${cname(cs[i])}的佔 ${best} 格，最多`, `The ${cname(cs[i])} shape covers ${best} squares, the most`) : L(`${cname(cs[i])}的佔 ${best} 格，最少`, `The ${cname(cs[i])} shape covers ${best} squares, the fewest`);
    return Q.tap({ p, right: g(i), wrong: range(0, n - 1).filter((j) => j !== i).map(g), hint: L('一格一格數，數數看每個圖形有幾格。', 'Count the coloured squares in each shape.'), full });
  }, true),
  def(T.bonus, '加減估算', 'Estimate sums and differences', (d) => {
    const add = d === 0 || chance(0.5), dev = () => pick([-1, 1]) * rnd(1, [5, 12, 20][d]);
    let ra, rb; do { ra = rnd(1, 8) * 100; rb = rnd(1, 7) * 100; } while (add ? ra + rb > 900 : ra - rb < 100);
    const a = ra + dev(), b = rb + dev(), op = add ? '+' : '−', est = add ? ra + rb : ra - rb;
    return Q.pick({ p: L(`${a} ${op} ${b} 大約是多少？`, `About how much is ${a} ${op} ${b}?`), scene: bigEq(`${a} ${op} ${b}`), right: est, wrong: est >= 200 ? [est - 100, est + 100] : [est + 100, est + 200], sort: true,
      hint: L(`先看成整百：${a} 很接近 ${ra}，${b} 很接近 ${rb}。`, `Use hundreds: ${a} is close to ${ra}. ${b} is close to ${rb}.`), full: L(`${ra} ${op} ${rb} = ${est}，大約是 ${est}`, `${ra} ${op} ${rb} = ${est}. It is about ${est}.`) });
  }, true),
];
