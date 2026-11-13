// 圖片版美術：角色、怪物、升級配件都用 img/*.webp（由 tools/process_art.py 從 art_src 產生）
// 對外介面與舊的 characters.js（程式畫的 SVG）相同，所以遊戲其他部分不用改。
import { ART } from './art-meta.js?v=25';

const AV = 1; // 圖片版本：換圖時 +1，避免瀏覽器用到舊圖
export const src = (name) => `img/${name}.webp?a=${AV}`;
// 小圖示（題目物件、卡片圖示…）
export const pic = (name, cls = 'pic') => `<img class="${cls}" src="${src(name)}" alt="" draggable="false">`;

// 有這張圖就用圖，沒有就照原樣顯示（例如數字題的圓點仍用符號）
export const icon = (e, cls = 'pic') => (ART[e] ? pic(e, cls) : e);
// 背景：三個角色的世界、戰鬥場地
const bg = (name) => `<img class="scene-img" src="${src(name)}" alt="" draggable="false">`;
export const sceneSVG = (id) => bg('bg_' + id);
export const battleScene = () => bg('bg_battle');

let UID = 0;
export function formOf(level) { return Math.min(3, Math.floor(level / 5)); }

// 每個型態：h=顯示高度；head=頭頂位置（放皇冠）；crown=皇冠寬度；back=背部位置（放翅膀/披風）
// 位置都是「佔這張圖寬/高的比例」，從左上角算起
const FORMS = {
  dino: [
    { h: 205, head: [0.57, 0.02], crown: 0.3, back: [0.3, 0.44], tilt: -6 },
    { h: 285, head: [0.72, 0.085], crown: 0.19, back: [0.47, 0.43], tilt: -8 },
    { h: 300, head: [0.73, 0.03], crown: 0.19, back: [0.44, 0.4], tilt: -8 },
    { h: 350, head: [0.64, 0.13], crown: 0.14, back: [0.5, 0.45], tilt: -6 },
  ],
  sea: [
    { h: 200, head: [0.62, 0.02], crown: 0.34, back: [0.52, 0.42], tilt: 0 },
    { h: 290, head: [0.68, 0.08], crown: 0.2, back: [0.62, 0.3], tilt: 0 },
    { h: 320, head: [0.61, 0.15], crown: 0.19, back: [0.58, 0.34], tilt: 0 },
    { h: 345, head: [0.565, 0.03], crown: 0.17, back: [0.55, 0.32], tilt: 0 },
  ],
  boy: [
    { h: 235, head: [0.39, 0.015], crown: 0.27, back: [0.42, 0.52], tilt: 0 },
    { h: 295, head: [0.5, 0.075], crown: 0.215, back: [0.5, 0.58], tilt: 0 },
    { h: 340, head: [0.45, 0.2], crown: 0.18, back: [0.49, 0.6], tilt: 0 },
    { h: 380, head: [0.43, 0.22], crown: 0.17, back: [0.48, 0.62], tilt: 0 },
  ],
};
const aspect = (name) => ART[name][0] / ART[name][1];
const image = (name, x, y, w, h, extra = '') => `<image href="${src(name)}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" ${extra}/>`;

// 夥伴卡：每升一階多一隻；group=整組畫在同一張圖（史萊姆），否則一隻一張圖
const BUDDIES = { pet: { img: 'pets', group: true }, skel: { img: 'skel' }, tree: { img: 'tree' } };
// 這張卡需要的圖都在嗎？（骷髏兵、樹精的圖還沒放進來之前，卡片不會出現）
export const upReady = (upId) => !BUDDIES[upId] || !!ART[BUDDIES[upId].img + '1'];

const KI_COL = ['', ['#ffffff', '#8fd8ff', '#3aa0ff'], ['#fffbe0', '#ffd83a', '#ff9d00'], ['#ffffff', '#ffe14a', '#ff8a00']]; // 白藍 → 金 → 金+閃電
function flamePath(w, h, m, ph) {
  // 火焰外形（水滴狀）：底部中心在 (0,0)，頂端收成尖；兩側各有 m 根往上往外竄的火舌
  const rx = w / 2, f = (v) => v.toFixed(1);
  const wd = (u) => (rx * Math.pow(1 - u, 0.6) * (0.6 + 0.9 * u)) / 0.71; // 高度 u（0~1）處的半寬
  const top = [rx * 0.05 * Math.sin(ph), -h * 1.04];
  const side = (dir, p0) => { // 由下往上的一側：每段是 [控制點, 終點]
    const segs = [];
    let cur = [dir * wd(0) * 0.9, 0];
    for (let i = 0; i < m; i++) {
      const j = 0.75 + 0.25 * Math.sin(i * 2.4 + p0), ut = (i + 0.85) / (m + 0.6), uv = (i + 0.5) / (m + 0.6);
      const T = [dir * (wd(ut) + rx * 0.13 * j), -h * ut - h * 0.08 * j], V = [dir * wd(uv) * 0.8, -h * uv];
      segs.push([[cur[0] + dir * rx * 0.16, (cur[1] + T[1]) / 2 + h * 0.03], T]);       // 外側鼓起來往上竄
      segs.push([[T[0] + (V[0] - T[0]) * 0.8, T[1] + (V[1] - T[1]) * 0.15], V]);          // 火舌尖端勾回來
      cur = V;
    }
    segs.push([[cur[0] + dir * rx * 0.1, (cur[1] + top[1]) / 2], top]);
    return [[dir * wd(0) * 0.9, 0], segs];
  };
  const [startL, L] = side(-1, ph), [startR, R] = side(1, ph + 1.3);
  let d = `M${f(startL[0])},${f(startL[1])}`;
  L.forEach(([c, e]) => { d += ` Q${f(c[0])},${f(c[1])} ${f(e[0])},${f(e[1])}`; });
  for (let i = R.length - 1; i >= 0; i--) { const e = i ? R[i - 1][1] : startR; d += ` Q${f(R[i][0][0])},${f(R[i][0][1])} ${f(e[0])},${f(e[1])}`; }
  return d + ` Q0,${f(h * 0.08)} ${f(startL[0])},${f(startL[1])} Z`;
}
// 氣焰：身體周圍往上竄的火焰狀鬥氣
function kiOv(t, X, Y, W, H, uid) {
  if (!t) return '';
  const [c0, c1, c2] = KI_COL[t], id = 'ki' + uid, k = 1 + (t - 1) * 0.1;
  const w = (W * 1.25 + 90) * k, h = (H * 1.2 + 44) * k;
  let s = `<defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c1}" stop-opacity=".25"/><stop offset=".55" stop-color="${c1}" stop-opacity=".7"/><stop offset="1" stop-color="${c2}" stop-opacity=".9"/></linearGradient></defs>`;
  s += `<g transform="translate(${X},${Y + 8})">`;
  s += `<path class="ki" d="${flamePath(w, h, 4, 0)}" fill="url(#${id})" stroke="${c2}" stroke-width="3" stroke-opacity=".7" stroke-linejoin="round"/>`;
  s += `<path class="ki ki2" d="${flamePath(w * 0.72, h * 0.82, 3, 1.7)}" fill="${c0}" fill-opacity=".5" stroke="${c0}" stroke-width="3" stroke-opacity=".85" stroke-linejoin="round"/>`;
  for (let i = 0; i < 5 + t * 2; i++) { // 往上飄的光點
    const x = ((i * 0.37) % 1 - 0.5) * w * 0.9;
    s += `<rect class="kirise" x="${x.toFixed(0)}" y="${-10 - (i % 3) * 20}" width="5" height="${16 + (i % 3) * 8}" rx="2.5" fill="${c0}" style="--h:${(-h * 0.9).toFixed(0)}px;animation-delay:${-(i * 0.23).toFixed(2)}s"/>`;
  }
  if (t === 3) { // 最高階：身邊竄出閃電
    [[-0.5, -0.55, 1], [0.48, -0.75, -1], [0.42, -0.25, 1], [-0.44, -0.2, -1]].forEach(([fx, fy, dir], i) => {
      const x = fx * w * 0.8, y = fy * h;
      s += `<polyline class="glow" style="animation-delay:${-i * 0.27}s;animation-duration:${0.35 + i * 0.08}s" points="${x},${y} ${x + 12 * dir},${y + 18} ${x - 4 * dir},${y + 24} ${x + 10 * dir},${y + 46}" fill="none" stroke="#bfe8ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
  }
  return s + '</g>';
}

// 升級卡的圖示：依階數顯示對應的圖
export function upIcon(upId, charId, tier = 1) {
  const t = Math.max(1, Math.min(3, tier));
  if (upId === 'clone') { // 分身術：用角色自己的圖疊出殘影
    const n = charId + '0', w = 62, h = w / aspect(n), y = 96 - h;
    return `<svg class="ico" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${image(n, 0, y + 4, w * 0.92, h * 0.92, 'opacity=".35"')}${image(n, 16, y + 2, w * 0.96, h * 0.96, 'opacity=".55"')}${image(n, 36, y, w, h)}</svg>`;
  }
  if (upId === 'ki') {
    const [c0, c1, c2] = KI_COL[t];
    return `<svg class="ico" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50,96)"><path d="${flamePath(70, 84, 3, 0)}" fill="${c1}" stroke="${c2}" stroke-width="5" stroke-linejoin="round"/><path d="${flamePath(40, 52, 2, 1.7)}" fill="${c0}"/></g></svg>`;
  }
  const name = { strong: 'ic_strong', tall: 'ic_tall', aura: 'aura', cape: 'cape' + t, crown: 'crown' + t, wings: 'wings' + t,
    fire: 'fire', ice: 'ice', thunder: 'thunder', pet: 'pets' + t, skel: 'skel' + t, tree: 'tree' + t }[upId];
  return pic(name, 'ico');
}

function auraOv(t, cx, cy, H, uid) {
  if (!t) return '';
  const col = ['', '#7fd4ff', '#c79bff', '#ffd84a'][t], id = 'au' + uid, r = H * 0.72 + 30;
  let s = `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity=".9"/><stop offset=".55" stop-color="${col}" stop-opacity=".42"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs>`;
  if (t >= 2) {
    let rays = '';
    for (let i = 0; i < 12; i++) rays += `<path d="M0,0 L${-r * 0.1},${-r * 1.15} L${r * 0.1},${-r * 1.15} Z" transform="rotate(${i * 30})"/>`;
    s += `<g transform="translate(${cx},${cy})"><g class="spin" fill="${col}" opacity="${t === 3 ? 0.28 : 0.16}">${rays}</g></g>`;
  }
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="url(#${id})" class="pulse"/>`;
  const rw = H * (0.95 + 0.15 * t), rh = rw / aspect('aura');
  s += `<g transform="translate(${cx},${cy + H * 0.1})"><g class="pulse">${image('aura', -rw / 2, -rh / 2, rw, rh)}</g></g>`;
  return s;
}
function orbitOv(up, cx, cy, H) {
  let s = '';
  [['fire', 0, 5.2], ['ice', 1, 6.4], ['thunder', 2, 4.4]].forEach(([k, idx, dur]) => {
    const n = up[k] || 0;
    if (!n) return;
    const Rx = 150 + idx * 22, Ry = 34 + idx * 6, oy = (idx - 1) * H * 0.2, sz = 40 + n * 4;
    for (let i = 0; i < n; i++) {
      s += `<image href="${src(k)}" x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}"><animateMotion dur="${dur}s" begin="-${(dur / n) * i}s" repeatCount="indefinite" path="M ${-Rx},${oy} a ${Rx},${Ry} 0 1,0 ${Rx * 2},0 a ${Rx},${Ry} 0 1,0 ${-Rx * 2},0"/></image>`;
    }
  });
  return s ? `<g transform="translate(${cx},${cy})">${s}</g>` : '';
}

const X = 250, Y = 456; // 角色腳底在畫面上的位置
// 變壯、長高的放大倍率 [寬, 高]：每一階都要看得出差別
const grow = (up) => { const st = up.strong || 0, tl = up.tall || 0; return [1 + 0.08 * st, (1 + 0.07 * tl) * (1 + 0.01 * st)]; }; // 最多 5 階：寬 1.4 倍、高 1.42 倍
// 取景框：身邊的夥伴、分身、氣焰也要入鏡
function camBox(id, form, up, fit) {
  const F = FORMS[id][form], [sx, sy] = grow(up), H = F.h, W = H * aspect(id + form), Hpx = H * sy, Wpx = W * sx;
  const side = Math.max(up.pet ? 150 : 0, up.skel ? 60 + up.skel * 100 : 0, up.tree ? 120 + up.tree * 50 : 0, up.clone ? Wpx * 1.15 : 0, up.ki ? Wpx * 0.3 + 90 : 0);
  const tall = up.ki ? Hpx * 0.5 + 60 : 0;
  const size = fit === 'form' ? Math.max((H + 90) * 1.3 + tall, (W + 70) * 1.3 + side * 0.6) : Math.max(Hpx + 80 + tall, Wpx + 70 + side);
  return `${(X - size / 2).toFixed(0)} ${(Y - size + 30).toFixed(0)} ${size.toFixed(0)} ${size.toFixed(0)}`;
}
// 主畫面的固定鏡頭（500×500）；角色長到快頂出畫面時，鏡頭稍微拉遠
function homeBox(id, form, up) {
  const F = FORMS[id][form], [sx, sy] = grow(up), size = Math.max(500, F.h * sy + 50, F.h * aspect(id + form) * sx + 40);
  return `${(250 - size / 2).toFixed(0)} ${(500 - size).toFixed(0)} ${size.toFixed(0)} ${size.toFixed(0)}`;
}
export function charSVG(id, ch, o = {}) {
  const uid = ++UID;
  const form = o.form ?? formOf(ch.level), up = o.up ?? ch.up ?? {};
  const F = FORMS[id][form], name = id + form;
  const [sx, sy] = grow(up);
  const H = F.h, W = H * aspect(name);            // 還沒放大前的顯示尺寸
  const Hpx = H * sy, Wpx = W * sx, cy = Y - Hpx * 0.5;
  // 取景：fit=貼身（標題/選角/小頭像）；'form'=依型態取景看得出長大；否則固定鏡頭（主畫面）
  //   cam：用「另一個狀態」的取景框來拍（升級前後要疊在一起比對，鏡頭必須一樣）
  const vb = o.fit ? camBox(id, o.cam ? formOf(o.cam.level) : form, o.cam ? o.cam.up || {} : up, o.fit) : homeBox(id, form, up);
  const ax = (fx) => -W / 2 + fx * W, ay = (fy) => -H + fy * H;
  const [bx, by] = [ax(F.back[0]), ay(F.back[1])];
  let s = `<svg viewBox="${vb}" class="char-svg" xmlns="http://www.w3.org/2000/svg" overflow="visible">`;
  s += kiOv(up.ki || 0, X, Y, Wpx, Hpx, uid);
  s += auraOv(up.aura || 0, X, cy, Hpx, uid);
  s += `<ellipse cx="${X}" cy="${Y + 2}" rx="${Wpx * 0.36}" ry="${Wpx * 0.055 + 6}" fill="rgba(0,0,0,.24)"/>`;
  // ---- 後排夥伴：樹精站在兩側後方 ----
  if (up.tree && ART.tree1) {
    [[1, 62], [-1, 62], [1, 128]].slice(0, up.tree).forEach(([dir, off], i) => {
      const n = 'tree' + (i + 1), h = 96, w = h * aspect(n);
      s += `<g transform="translate(${(X + dir * (Wpx / 2 + off)).toFixed(0)},${Y - 34})"><g class="hop" style="animation-delay:${-i * 0.3}s;animation-duration:1.5s">${image(n, -w / 2, -h, w, h)}</g></g>`;
    });
  }
  // ---- 分身術：半透明的自己站在後面 ----
  if (up.clone) {
    [[-0.58, -8, 0.94], [0.58, -8, 0.94], [0, -H * 0.2, 0.9]].slice(0, up.clone).forEach(([fx, dy, k], i) => {
      s += `<g transform="translate(${(X + fx * Wpx).toFixed(0)},${(Y + dy * sy).toFixed(0)}) scale(${(sx * k).toFixed(3)},${(sy * k).toFixed(3)})"><g class="clone" style="animation-delay:${-i * 0.5}s">${image(name, -W / 2, -H, W, H)}</g></g>`;
    });
  }
  s += `<g class="idle" style="transform-origin:${X}px ${Y}px"><g transform="translate(${X},${Y}) scale(${sx.toFixed(3)},${sy.toFixed(3)})">`;
  // ---- 身體後面：翅膀、披風 ----
  if (up.wings) {
    const n = 'wings' + up.wings, ww = Math.min(H * [0, 0.8, 0.95, 1.1][up.wings], 150 + up.wings * 70), wh = ww / aspect(n);
    s += `<g class="wingflap" style="transform-origin:${bx}px ${by}px">${image(n, bx - ww / 2, by - wh * 0.62, ww, wh)}</g>`;
  }
  if (up.cape) {
    // 披風從肩膀垂到腳踝上方，不要拖到地上
    const n = 'cape' + up.cape, chh = Math.min(H * [0, 0.44, 0.48, 0.52][up.cape], (1 - F.back[1]) * H * 1.02), cw = chh * aspect(n);
    s += `<g class="capewave" style="transform-origin:${bx}px ${by}px">${image(n, bx - cw / 2, by - chh * 0.12, cw, chh)}</g>`;
  }
  // ---- 身體 ----
  s += image(name, -W / 2, -H, W, H);
  // ---- 皇冠 ----
  if (up.crown) {
    const n = 'crown' + up.crown, cw = H * F.crown * [0, 0.9, 1, 1.25][up.crown], chh = cw / aspect(n);
    const hx = ax(F.head[0]), hy = ay(F.head[1]);
    s += `<g transform="rotate(${F.tilt} ${hx.toFixed(1)} ${hy.toFixed(1)})">${image(n, hx - cw / 2, hy - chh * 0.7, cw, chh)}</g>`;
  }
  s += `</g></g>`;
  s += orbitOv(up, X, cy, Hpx);
  if (up.pet) {
    const n = 'pets' + up.pet, w = [0, 92, 104, 116][up.pet], h = w / aspect(n);
    s += `<g transform="translate(${(X + Wpx / 2 + w * 0.3).toFixed(0)},${Y})"><g class="hop">${image(n, -w / 2, -h, w, h)}</g></g>`;
  }
  // ---- 前排夥伴：骷髏兵在左邊排排站 ----
  if (up.skel && ART.skel1) {
    for (let i = 0; i < up.skel; i++) {
      const n = 'skel' + (i + 1), h = 88, w = h * aspect(n);
      s += `<g transform="translate(${(X - Wpx / 2 - 30 - i * 58).toFixed(0)},${Y + (i % 2 ? 8 : 0)})"><g class="hop" style="animation-delay:${-i * 0.25}s">${image(n, -w / 2, -h, w, h)}</g></g>`;
    }
  }
  return s + '</svg>';
}

// ---- 怪物：名稱在 i18n；flip=原圖朝右，戰鬥時要翻成面向左邊的主角 ----
export const MONSTERS = [
  { id: 'slime', h: 250 }, { id: 'bat', h: 205, lift: 70 }, { id: 'imp', h: 290 },
  { id: 'golem', h: 320, flip: true }, { id: 'ghost', h: 290, flip: true, lift: 24 }, { id: 'shroom', h: 290 },
];
export const BOSSES = [{ id: 'king', h: 410 }, { id: 'dragon', h: 400, flip: true }];
export function monsterSVG(m, boss = false) {
  const n = 'm_' + m.id, h = m.h, w = h * aspect(n), X = 250, Y = 456 - (m.lift || 0);
  return `<svg viewBox="0 0 500 500" class="char-svg" xmlns="http://www.w3.org/2000/svg" overflow="visible">` +
    (boss ? `<defs><radialGradient id="bossglow"><stop offset="0" stop-color="#b04bff" stop-opacity=".75"/><stop offset=".6" stop-color="#8a32dc" stop-opacity=".35"/><stop offset="1" stop-color="#8a32dc" stop-opacity="0"/></radialGradient></defs><ellipse cx="250" cy="280" rx="250" ry="250" fill="url(#bossglow)" class="pulse"/>` : '') +
    `<ellipse cx="250" cy="460" rx="${w * 0.36}" ry="16" fill="rgba(0,0,0,.3)"/>` +
    `<g class="idle" style="transform-origin:250px 456px">${image(n, X - w / 2, Y - h, w, h, m.flip ? 'transform="translate(500,0) scale(-1,1)"' : '')}</g></svg>`;
}

// 先把所有圖抓下來，之後切換畫面才不會有圖片晚一拍才出現
export function preloadArt() {
  Object.keys(ART).forEach((n) => { const i = new Image(); i.src = src(n); });
}
