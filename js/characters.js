// 角色向量美術：三條進化線 × 4 型態 + 通用升級外觀（盔甲/披風/皇冠/翅膀/光環/元素/夥伴）+ 邪惡怪物
let OUT = '#2b2140';

// ---- 畫風（flat＝扁平貼紙；toy＝3D 軟膠公仔；cel＝精緻卡通雙層陰影；book＝繪本手繪）----
const STYLES = {
  flat: { out: '#2b2140', k: 1, fx: '', whole: '' },
  toy: { out: '#3b2a3a', k: 0, fx: 'filter="url(#fx-toy)"', whole: 'filter="url(#fx-toyshadow)"' },
  cel: { out: '#3a2444', k: 0.62, fx: 'filter="url(#fx-cel)"', whole: '' },
  book: { out: '#5b3b2e', k: 0.6, fx: 'filter="url(#fx-bookfill)"', whole: 'filter="url(#fx-book)"' },
};
let ST = STYLES.flat;
export function setArtStyle(n) { ST = STYLES[n] || STYLES.flat; OUT = ST.out; }
const FX_DEFS = `<defs>
<filter id="fx-toy" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/>
  <feDiffuseLighting in="b" surfaceScale="8" diffuseConstant="1.1" lighting-color="#ffffff" result="d"><feDistantLight azimuth="225" elevation="52"/></feDiffuseLighting>
  <feComposite in="d" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0.14" k4="0" result="lit"/>
  <feColorMatrix in="lit" type="saturate" values="1.35" result="lit2"/>
  <feSpecularLighting in="b" surfaceScale="8" specularConstant="0.62" specularExponent="64" lighting-color="#ffffff" result="sp"><feDistantLight azimuth="225" elevation="60"/></feSpecularLighting>
  <feMorphology in="SourceAlpha" operator="erode" radius="2.4" result="er"/>
  <feComposite in="SourceAlpha" in2="er" operator="out" result="rim"/>
  <feGaussianBlur in="rim" stdDeviation="1.3" result="rimb"/>
  <feFlood flood-color="#3a1408" flood-opacity=".42" result="rc"/><feComposite in="rc" in2="rimb" operator="in" result="rimc"/>
  <feMerge result="m"><feMergeNode in="lit2"/><feMergeNode in="rimc"/><feMergeNode in="sp"/></feMerge>
  <feComposite in="m" in2="SourceAlpha" operator="in"/>
</filter>
<filter id="fx-toyshadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000" flood-opacity=".22"/></filter>
<filter id="fx-cel" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
  <feOffset in="SourceAlpha" dx="-9" dy="-11" result="o1"/>
  <feComposite in="SourceAlpha" in2="o1" operator="out" result="sh"/>
  <feFlood flood-color="#2a0f3a" flood-opacity=".2" result="f1"/><feComposite in="f1" in2="sh" operator="in" result="shade"/>
  <feOffset in="SourceAlpha" dx="7" dy="9" result="o2"/>
  <feComposite in="SourceAlpha" in2="o2" operator="out" result="hl"/>
  <feFlood flood-color="#ffffff" flood-opacity=".3" result="f2"/><feComposite in="f2" in2="hl" operator="in" result="hi"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="hi"/></feMerge>
</filter>
<filter id="fx-bookfill" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.05" result="na"/>
  <feFlood flood-color="#fff" flood-opacity=".42" result="w"/><feComposite in="w" in2="na" operator="in" result="wash"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.9 -0.42" result="grain"/>
  <feMerge result="m"><feMergeNode in="SourceGraphic"/><feMergeNode in="wash"/><feMergeNode in="grain"/></feMerge>
  <feComposite in="m" in2="SourceAlpha" operator="in"/>
</filter>
<filter id="fx-book" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="11" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G"/>
</filter></defs>`;
let UID = 0;

// ---------- SVG 小工具 ----------
const E = (cx, cy, rx, ry, rot = 0) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const P = (d) => `<path d="${d}"/>`;
const R = (x, y, w, h, r = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
// 聯集外框：先畫粗黑邊再蓋上填色，多個形狀會融合成一個輪廓
const U = (shapes, fill, sw = 6) => (ST.k ? `<g stroke="${OUT}" stroke-width="${sw * 2 * ST.k}" stroke-linejoin="round" stroke-linecap="round" fill="${OUT}">${shapes}</g>` : '') + `<g fill="${fill}" ${ST.fx}>${shapes}</g>`;
const F = (shapes, fill, op = 1) => `<g fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}>${shapes}</g>`;
const L = (d, w = 4, col = OUT) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const tri = (x, y, rot, b, h) => `<path d="M${-b / 2},0 L0,${-h} L${b / 2},0 Z" transform="translate(${x},${y}) rotate(${rot})"/>`;
// 管狀身體（粗線條 + 外框）
const tube = (d, w, col) => (ST.k ? `<path d="${d}" stroke="${OUT}" stroke-width="${w + 12 * ST.k}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` : '') + `<path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none" ${ST.fx}/>`;
const tubeIn = (d, w, col, extra = '') => `<path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none" ${extra}/>`;
const star = (cx, cy, r) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1);
  }
  return `<path d="${d}Z"/>`;
};

function eye(x, y, r, o = {}) {
  const px = x + (o.dx ?? r * 0.16), py = y + (o.dy ?? r * 0.06);
  let s = `<g class="blink" style="transform-origin:${x}px ${y}px">`;
  s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${OUT}" stroke-width="4"/>`;
  if (o.iris) s += `<circle cx="${px}" cy="${py}" r="${r * 0.66}" fill="${o.iris}"/>`;
  s += `<circle cx="${px}" cy="${py}" r="${r * (o.iris ? 0.36 : 0.56)}" fill="${OUT}"/>`;
  s += `<circle cx="${px + r * 0.24}" cy="${py - r * 0.28}" r="${r * 0.2}" fill="#fff"/>`;
  s += `<circle cx="${px - r * 0.22}" cy="${py + r * 0.26}" r="${r * 0.1}" fill="#fff"/></g>`;
  return s;
}
const flame = (x, y, rot, k = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k})"><g class="flick">` +
  `<path d="M0,4 Q-20,-16 -6,-36 Q-4,-24 4,-30 Q0,-48 10,-60 Q26,-30 14,0 Z" fill="#ff7a1a" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>` +
  `<path d="M2,0 Q-8,-14 0,-26 Q4,-18 8,-22 Q14,-12 8,0 Z" fill="#ffe14a"/></g></g>`;

// =====================================================================
//  暴龍線（橘黃色小恐龍：大頭、綠眼睛、大爪子）
// =====================================================================
export const LINES = {
  dino: {
    label: '小暴龍', forms: [
      { name: '小暴龍', scale: 0.74 }, { name: '狂牙暴龍', scale: 0.9 },
      { name: '鋼甲暴龍', scale: 1.0 }, { name: '黃金帝王龍', scale: 1.07 }],
    weapon: { name: '利爪強化', icon: '🦖' },
  },
  sea: {
    label: '小海怪', forms: [
      { name: '小海怪', scale: 0.78 }, { name: '浪花海蛇', scale: 0.9 },
      { name: '深海巨蛇', scale: 1.0 }, { name: '海皇大海怪', scale: 1.06 }],
    weapon: { name: '尖牙強化', icon: '🦷' },
  },
  boy: {
    label: '小男孩', forms: [
      { name: '小男孩', scale: 0.76 }, { name: '見習劍士', scale: 0.9 },
      { name: '閃電騎士', scale: 1.0 }, { name: '傳說勇者', scale: 1.07 }],
    weapon: { name: '寶劍強化', icon: '🗡️' },
  },
};

const DINO_C = [
  { main: '#ffb533', dark: '#f28a1c', belly: '#ffe9a6', spike: '#ff7a3d' },
  { main: '#ff9a2e', dark: '#e06a12', belly: '#ffe3a0', spike: '#d9462b' },
  { main: '#ffa23a', dark: '#e2731a', belly: '#ffe6ad', spike: '#cfd8e3' },
  { main: '#ffc93a', dark: '#f09a14', belly: '#fff0b8', spike: '#ff5a3d' },
];
const STEEL = '#cdd6e1', STEEL_D = '#8794a7', GOLD = '#ffd43a', GOLD_D = '#e2a100';

function claws(x, y, rot, n, len, col) {
  let s = '';
  for (let i = 0; i < n; i++) s += tri(0, (i - (n - 1) / 2) * 9, 90, 9, len);
  return `<g transform="translate(${x},${y}) rotate(${rot})"><g stroke="${OUT}" stroke-width="5" stroke-linejoin="round" fill="${OUT}">${s}</g><g fill="${col}">${s}</g></g>`;
}

function drawDino(form, up, uid) {
  const c = DINO_C[form], w = up.weapon || 0;
  const clawCol = w >= 3 ? '#7df9ff' : w >= 2 ? GOLD : '#fffdf2';
  const cl = 13 + w * 4;
  let s = '';
  if (form === 0) {
    // 寶寶：超大頭、小身體、大爪子
    s += U(P('M-40,-52 Q-98,-46 -112,-100 Q-82,-78 -45,-90 Z') + E(-5, -62, 56, 54) + E(-30, -10, 26, 14), c.main);
    s += F(E(10, -52, 34, 36), c.belly);
    s += U(E(24, -10, 26, 14), c.main);
    s += claws(44, -8, 0, 3, cl - 3, clawCol) + claws(-12, -8, 0, 3, cl - 5, clawCol);
    s += U(E(50, -78, 20, 11, 20), c.main) + claws(66, -72, 18, 3, cl, clawCol);
    s += U(E(18, -150, 82, 68) + E(82, -130, 40, 30), c.main);
    s += F(E(-8, -180, 36, 20, -20), '#fff', 0.25);
    s += eye(46, -160, 24, { iris: '#3ecf6b' });
    s += F(E(66, -122, 13, 8), '#ff7a8a', 0.6);
    s += F(C(104, -142, 3.5) + C(114, -138, 3), OUT);
    s += L('M66,-112 Q92,-98 116,-116', 4);
    s += `<path d="M82,-106 l5,${9 + w * 2} l5,-${8 + w * 2} z M98,-106 l5,${9 + w * 2} l5,-${9 + w * 2} z" fill="#fff" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;
    return { s, A: { head: { cx: 18, cy: -150, rx: 82, ry: 68 }, chest: { cx: 14, cy: -52, w: 48, h: 42 }, back: { x: -40, y: -100 }, top: -216, view: 'side', H: 225 } };
  }
  // ---- 型態 1-3 共用骨架 ----
  const sp = [[2, -252, -15], [-36, -214, -40], [-66, -172, -58], [-86, -126, -74], [-116, -92, -102], [-150, -104, -126]];
  if (form === 3) {
    // 翅膀（身後）
    s += U(P('M-20,-150 Q-90,-300 -210,-292 Q-176,-250 -192,-206 Q-148,-216 -152,-168 Q-108,-180 -98,-132 Q-56,-150 -20,-128 Z'), '#e8452f');
    s += F(P('M-30,-150 Q-90,-270 -180,-272 Q-160,-240 -172,-214 Q-130,-222 -132,-180 Q-96,-190 -86,-146 Z'), '#ffb347', 0.85);
    s += U(P('M20,-190 Q60,-320 150,-322 Q126,-284 134,-250 Q100,-256 92,-218 Q60,-224 40,-186 Z'), '#c9351f');
    s += sp.map(([x, y, r]) => flame(x, y, r, 0.9)).join('');
  } else if (form === 2) {
    s += sp.map(([x, y, r]) => U(tri(x, y, r, 34, 46), STEEL, 5)).join('');
    s += F(sp.map(([x, y, r]) => tri(x, y, r, 12, 30)).join(''), '#fff', 0.5);
  } else {
    s += sp.map(([x, y, r]) => U(tri(x, y, r, 30, 34), c.spike, 5)).join('');
  }
  s += U(P('M-55,-60 Q-152,-44 -180,-130 Q-130,-98 -62,-132 Z') + E(-8, -98, 74, 80) + E(-44, -42, 30, 40) + E(-34, -10, 36, 14), c.main);
  // 條紋
  s += F(P('M-70,-150 l22,6 l-10,22 z') + P('M-84,-108 l24,2 l-8,22 z') + P('M-120,-76 l18,-10 l2,22 z'), c.dark, 0.8);
  s += F(E(14, -92, 44, 58), c.belly);
  s += L('M-16,-116 Q14,-106 46,-116', 3, 'rgba(0,0,0,.14)') + L('M-20,-90 Q14,-80 50,-90', 3, 'rgba(0,0,0,.14)') + L('M-14,-64 Q14,-56 44,-64', 3, 'rgba(0,0,0,.14)');
  if (form === 2) {
    // 鋼甲：胸口核心、護膝、尾錘
    s += U(C(14, -104, 22), STEEL, 5) + `<circle cx="14" cy="-104" r="12" fill="#5ff2ff" class="glow"/>`;
    s += U(C(-180, -130, 18), STEEL, 5) + F(tri(-196, -140, -60, 10, 14) + tri(-180, -150, 0, 10, 14) + tri(-166, -120, 120, 10, 14), STEEL_D);
  }
  if (form === 3) {
    s += U(P('M-22,-136 Q14,-150 50,-136 L44,-86 Q14,-60 -16,-86 Z'), GOLD, 5) + F(star(14, -108, 14), '#ff5a3d');
    s += flame(-180, -134, -70, 1.3);
  }
  s += U(E(30, -42, 30, 40) + E(40, -10, 36, 14), c.main);
  if (form >= 2) s += U(E(32, -50, 22, 15), form === 3 ? GOLD : STEEL, 5) + U(E(-44, -52, 20, 13), form === 3 ? GOLD : STEEL, 5);
  s += claws(66, -8, 0, 3, cl - 2, clawCol) + claws(-6, -8, 0, 3, cl - 5, clawCol);
  // 手臂 + 大爪
  if (form === 2) {
    s += U(E(64, -118, 26, 13, 28), STEEL, 6) + claws(84, -106, 28, 3, cl + 8, w >= 2 ? clawCol : '#eef3f8');
  } else if (form === 3) {
    s += U(E(64, -118, 27, 14, 28), GOLD, 6) + claws(86, -106, 28, 3, cl + 10, clawCol);
  } else {
    s += U(E(62, -118, 24, 12, 28), c.main) + claws(82, -108, 28, 3, cl + 4, clawCol);
  }
  // 角（頭後方）
  if (form === 3) s += U(P('M18,-246 Q0,-304 -44,-310 Q-16,-284 -8,-240 Z') + P('M52,-254 Q52,-306 14,-326 Q32,-294 30,-250 Z'), GOLD);
  if (form === 1) s += U(P('M30,-250 Q24,-282 2,-292 Q14,-270 12,-246 Z'), '#fff3d6', 5);
  s += U(E(40, -205, 62, 50) + E(98, -190, 52, 37), c.main);
  s += F(E(22, -232, 30, 14, -15), '#fff', 0.25);
  if (form === 2) {
    const id = 'dh' + uid;
    s += `<clipPath id="${id}"><rect x="-30" y="-262" width="190" height="42"/></clipPath><g clip-path="url(#${id})">` + U(E(40, -205, 64, 52) + E(98, -190, 54, 39), STEEL, 4) + `</g>`;
    s += F(C(10, -232, 3) + C(40, -244, 3) + C(72, -236, 3) + C(110, -222, 3), STEEL_D);
    s += U(tri(120, -222, 20, 16, 26), STEEL, 4);
  }
  if (form === 3) {
    s += U(P('M-6,-232 Q40,-270 96,-234 L104,-220 Q40,-248 -10,-218 Z'), GOLD, 5) + F(C(44, -246, 6), '#ff5a3d');
    s += U(tri(126, -222, 20, 16, 30), GOLD, 4);
  }
  s += eye(58, -212, 16, { iris: form >= 2 ? '#ffe45c' : '#3ecf6b' });
  s += L('M36,-236 L80,-224', 6);
  s += F(C(136, -202, 4), OUT);
  s += L('M66,-174 Q110,-156 148,-184', 4);
  const tn = 4 + Math.min(w, 2), th = 9 + w * 2;
  for (let i = 0; i < tn; i++) {
    const x = 80 + i * (56 / tn), y = -170 + Math.sin((i / (tn - 1)) * Math.PI) * 5 - (i === tn - 1 ? 4 : 0);
    s += `<path d="M${x},${y} l5,${th} l5,-${th} z" fill="#fff" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  return { s, A: { head: { cx: 40, cy: -205, rx: 62, ry: 50 }, chest: { cx: 14, cy: -98, w: 60, h: 58 }, back: { x: -52, y: -150 }, top: form === 3 ? -318 : -256, view: 'side', H: form === 3 ? 320 : 262 } };
}

// =====================================================================
//  海怪線（長身海蛇：又大又寬的頭、細密牙齒、長長的身體）
// =====================================================================
const SEA_C = [
  { main: '#4fd0c2', dark: '#229c96', belly: '#e9fff6', fin: '#ffd166' },
  { main: '#2fb8b0', dark: '#157f86', belly: '#dffcf2', fin: '#ff9ecb' },
  { main: '#2a5aa8', dark: '#18356e', belly: '#a8f0ff', fin: '#2fe0d0' },
  { main: '#7a56e8', dark: '#4a2fae', belly: '#ffeaa8', fin: '#ffc93c' },
];

function serpentHead(cx, cy, rx, ry, c, form, w) {
  let s = '';
  // 側鰭
  s += U(P(`M${cx - rx + 6},${cy - 6} l-34,-22 q6,16 -6,24 q14,4 12,20 z`) + P(`M${cx + rx - 6},${cy - 6} l34,-22 q-6,16 6,24 q-14,4 -12,20 z`), c.fin, 5);
  s += U(E(cx, cy, rx, ry), c.main);
  s += F(E(cx - rx * 0.3, cy - ry * 0.55, rx * 0.4, ry * 0.22, -8), '#fff', 0.25);
  // 下顎
  s += F(P(`M${cx - rx * 0.86},${cy + ry * 0.2} Q${cx},${cy + ry * 1.05} ${cx + rx * 0.86},${cy + ry * 0.2} Q${cx},${cy + ry * 0.62} ${cx - rx * 0.86},${cy + ry * 0.2} Z`), c.belly);
  // 嘴 + 細密牙齒
  const mx0 = cx - rx * 0.8, mx1 = cx + rx * 0.8, my = cy + ry * 0.22, dip = ry * 0.4;
  s += L(`M${mx0},${my} Q${cx},${my + dip * 2} ${mx1},${my}`, 4);
  const n = form === 0 ? 7 : 11, th = (form === 0 ? 7 : 9) + (form >= 2 ? 3 : 0);
  for (let i = 1; i < n; i++) {
    const t = i / n, x = mx0 + (mx1 - mx0) * t, y = my + dip * 2 * 2 * t * (1 - t);
    s += `<path d="M${x - 4},${y - 1} l4,${th} l4,-${th} z" fill="#fff" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  // 毒牙（武器升級）
  if (w > 0) {
    const fl = 14 + w * 9, fc = w >= 3 ? '#7df9ff' : w >= 2 ? GOLD : '#fff';
    [0.22, 0.78].forEach((t) => {
      const x = mx0 + (mx1 - mx0) * t, y = my + dip * 4 * t * (1 - t);
      s += `<path d="M${x - 7},${y - 2} l7,${fl} l7,-${fl} z" fill="${fc}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"${w >= 3 ? ' class="glow"' : ''}/>`;
    });
  }
  // 眼睛（頭頂兩側）
  const er = form === 0 ? 21 : 17;
  const ex = rx * 0.48, ey = cy - ry * 0.3;
  const iris = form >= 3 ? '#5ff2ff' : form === 2 ? '#ffe45c' : null;
  s += eye(cx - ex, ey, er, { iris, dx: er * 0.12 }) + eye(cx + ex, ey, er, { iris, dx: -er * 0.12 });
  if (form >= 1) s += L(`M${cx - ex - er},${ey - er - 2} L${cx - ex + er * 0.8},${ey - er * 0.5}`, 6) + L(`M${cx + ex + er},${ey - er - 2} L${cx + ex - er * 0.8},${ey - er * 0.5}`, 6);
  s += F(C(cx - 9, cy - ry * 0.02, 3) + C(cx + 9, cy - ry * 0.02, 3), OUT);
  if (form === 0) s += F(E(cx - rx * 0.62, cy + ry * 0.12, 11, 7) + E(cx + rx * 0.62, cy + ry * 0.12, 11, 7), '#ff8fa3', 0.6);
  return s;
}

function drawSea(form, up, uid) {
  const c = SEA_C[form], w = up.weapon || 0;
  let s = '';
  if (form === 0) {
    const d = 'M-112,-22 Q-84,-70 -44,-26 Q-8,12 28,-30 Q46,-62 40,-96';
    s += U(P('M-108,-22 q-30,-26 -40,-4 q14,2 12,18 q14,-2 28,-14 z'), c.fin, 5);
    s += tube(d, 46, c.main) + tubeIn(d, 46, c.dark, 'stroke-dasharray="6 30" opacity=".55"') + tubeIn(d, 16, '#fff', 'opacity=".22"');
    s += serpentHead(44, -138, 76, 52, c, 0, w);
    return { s, A: { head: { cx: 44, cy: -138, rx: 76, ry: 52 }, chest: { cx: 36, cy: -62, w: 40, h: 36 }, back: { x: 4, y: -70 }, top: -190, view: "side", H: 200, helmetFrac: 0.8 } };
  }
  const d = form === 1
    ? 'M-196,-24 Q-166,-96 -116,-42 Q-78,6 -36,-52 Q-4,-100 18,-58 Q34,-24 50,-84 Q60,-150 48,-190'
    : 'M-206,-26 Q-182,-116 -128,-50 Q-92,4 -50,-66 Q-18,-124 8,-70 Q26,-26 46,-90 Q60,-160 50,-208';
  const bw = form === 1 ? 50 : form === 2 ? 58 : 62;
  if (form === 3) {
    // 水流漩渦 + 大鰭
    s += `<ellipse cx="-60" cy="-8" rx="170" ry="26" fill="none" stroke="#9be8ff" stroke-width="7" stroke-dasharray="46 30" stroke-linecap="round" class="swirl" opacity=".9"/>`;
    s += U(P('M30,-170 Q-40,-300 -150,-296 Q-118,-256 -132,-214 Q-92,-226 -92,-182 Q-54,-192 -40,-150 Z'), c.fin);
    s += L('M20,-176 Q-50,-270 -130,-282', 3, 'rgba(0,0,0,.2)') + L('M10,-166 Q-50,-220 -116,-216', 3, 'rgba(0,0,0,.2)');
  }
  // 尾鰭
  s += U(P('M-200,-26 q-34,-34 -50,-6 q18,2 14,22 q18,-2 34,-12 z'), c.fin, 5);
  // 背鰭
  const fins = form === 1 ? [[-150, -78, -20], [-72, -10, 160], [-18, -92, 10], [58, -130, 80]] : [[-164, -92, -15], [-88, -8, 165], [-24, -112, 5], [62, -140, 80], [58, -180, 85]];
  s += fins.map(([x, y, r]) => U(form >= 2 ? tri(x, y, r, 30, 40) : `<path d="M-16,0 Q-6,-36 14,-38 Q8,-16 16,0 Z" transform="translate(${x},${y}) rotate(${r})"/>`, c.fin, 5)).join('');
  s += tube(d, bw, c.main) + tubeIn(d, bw, c.dark, `stroke-dasharray="${form === 3 ? '10 34' : '7 36'}" opacity=".6"`);
  if (form === 3) s += tubeIn(d, bw * 0.34, GOLD, 'stroke-dasharray="1 44" stroke-dashoffset="22"');
  if (form === 2) s += tubeIn(d, 10, c.fin, 'stroke-dasharray="1 30" class="glow"');
  s += tubeIn(d, 18, '#fff', 'opacity=".2"');
  const hy = form === 1 ? -226 : -246, hx = 54, hrx = form === 1 ? 82 : form === 2 ? 90 : 96, hry = form === 1 ? 50 : 54;
  if (form === 2) {
    // 發光誘餌 + 觸鬚
    s += L(`M${hx - 10},${hy - 50} Q${hx + 10},${hy - 110} ${hx + 54},${hy - 96}`, 5) + `<circle cx="${hx + 56}" cy="${hy - 96}" r="11" fill="#fff27a" stroke="${OUT}" stroke-width="4" class="glow"/>`;
  }
  if (form === 3) s += U(tri(hx - 40, hy - 44, -22, 20, 36) + tri(hx, hy - 52, 0, 22, 50) + tri(hx + 40, hy - 44, 22, 20, 36), GOLD, 5) + F(C(hx, hy - 60, 6), '#ff5a8a');
  s += serpentHead(hx, hy, hrx, hry, c, form, w);
  if (form >= 2) s += L(`M${hx - hrx * 0.7},${hy + hry * 0.5} q-22,18 -14,40`, 4) + L(`M${hx + hrx * 0.7},${hy + hry * 0.5} q22,18 14,40`, 4);
  return { s, A: { head: { cx: hx, cy: hy, rx: hrx, ry: hry }, chest: { cx: 50, cy: hy + 96, w: 44, h: 44 }, back: { x: 26, y: hy + 70 }, top: hy - hry - (form === 3 ? 50 : 2), view: "side", helmetFrac: 0.8, H: -hy + hry + (form === 3 ? 50 : 0) } };
}

// =====================================================================
//  男孩線（正面 Q 版）
// =====================================================================
const SKIN = '#ffd9b3', HAIR = '#7a4a21';
const cap = (x1, y1, x2, y2, w, col) => (ST.k ? `<path d="M${x1},${y1} L${x2},${y2}" stroke="${OUT}" stroke-width="${w + 11 * ST.k}" stroke-linecap="round" fill="none"/>` : '') + (ST.fx
  // 直線的外框盒寬度為 0 會讓濾鏡失效，補一個透明矩形撐開範圍
  ? `<g ${ST.fx}><path d="M${x1},${y1} L${x2},${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/><rect x="${Math.min(x1, x2) - w}" y="${Math.min(y1, y2) - w}" width="${Math.abs(x2 - x1) + 2 * w}" height="${Math.abs(y2 - y1) + 2 * w}" fill="none"/></g>`
  : `<path d="M${x1},${y1} L${x2},${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`);

function sword(x, y, ang, len, o) {
  const bw = o.bw || 13;
  let s = `<g transform="translate(${x},${y}) rotate(${ang})">`;
  if (o.glow) s += `<rect x="${-bw / 2 - 8}" y="${-len - 10}" width="${bw + 16}" height="${len + 4}" rx="${bw}" fill="${o.glow}" opacity=".5" class="glow"/>`;
  s += U(P(`M${-bw / 2},-14 L${-bw / 2},${-len + bw} L0,${-len} L${bw / 2},${-len + bw} L${bw / 2},-14 Z`), o.blade, 4);
  s += F(P(`M0,-16 L0,${-len + 3} L${bw / 2 - 1},${-len + bw} L${bw / 2 - 1},-16 Z`), '#000', 0.13);
  s += U(R(-bw * 1.5, -19, bw * 3, 10, 4), o.guard, 4);
  s += U(R(-5, -10, 10, 24, 4), o.grip || '#8a5527', 4) + U(C(0, 17, 6.5), o.guard, 4);
  if (o.gem) s += F(C(0, -14, 4.5), o.gem);
  return s + '</g>';
}

function drawBoy(form, up, uid) {
  const w = up.weapon || 0;
  let s = '';
  const armor = form === 2 ? { a: '#e3e9f0', b: '#8f9db0', t: '#3f8cff' } : form === 3 ? { a: GOLD, b: GOLD_D, t: '#ff5a3d' } : null;
  // 型態自帶披風
  if (form >= 2) {
    const col = form === 2 ? '#3f6fe0' : '#e8413a';
    s += `<g class="capewave" style="transform-origin:0px -138px">` + U(P(`M-46,-140 Q0,-152 46,-140 L${form === 2 ? 66 : 80},-18 Q0,0 ${form === 2 ? -66 : -80},-18 Z`), col) +
      (form === 3 ? L('M-72,-26 Q0,-8 72,-26', 5, GOLD) : '') + `</g>`;
  }
  // 腿與鞋
  const legCol = armor ? armor.a : form === 1 ? '#8a5a2b' : SKIN;
  s += cap(-19, -56, -19, -18, 18, legCol) + cap(19, -56, 19, -18, 18, legCol);
  const shoe = form === 0 ? '#ff5b5b' : form === 1 ? '#6b4423' : armor.b;
  s += U(E(-22, -7, 21, 11) + E(22, -7, 21, 11), shoe);
  if (form === 0) s += F(E(-28, -8, 8, 5) + E(28, -8, 8, 5), '#fff');
  // 身體
  if (form === 0) {
    s += U(R(-37, -78, 74, 34, 12), '#3f7fe8') + U(R(-41, -142, 82, 74, 24), '#ff5b5b') + F(star(0, -104, 17), '#ffd43a');
  } else if (form === 1) {
    s += U(R(-43, -144, 86, 96, 22), '#3fbf6f') + F(P('M-14,-144 L0,-122 L14,-144 Z'), '#fff3d6');
    s += U(R(-45, -92, 90, 13, 4), '#8a5527', 4) + U(R(-9, -95, 18, 19, 4), GOLD, 4);
  } else {
    s += U(R(-44, -146, 88, 98, 22), armor.a);
    s += F(P('M-44,-100 L44,-100 L44,-88 L-44,-88 Z'), armor.b) + F(P('M-8,-146 L8,-146 L8,-56 L-8,-56 Z'), armor.t, 0.9);
    s += F(star(0, -118, 13), form === 3 ? '#fff' : GOLD) + F(R(-36, -140, 14, 40, 7), '#fff', 0.3);
  }
  // 左手 + 盾
  const sleeve = form === 0 ? '#ff5b5b' : form === 1 ? '#3fbf6f' : armor.a;
  s += cap(-48, -128, -62, -90, 17, form === 0 ? SKIN : sleeve);
  if (form === 0) s += U(C(-48, -130, 12), sleeve, 5);
  s += U(C(-63, -86, 10), form >= 2 ? armor.b : SKIN, 5);
  if (form === 1) s += U(C(-70, -100, 27), '#b9783f') + F(C(-70, -100, 9), STEEL) + L('M-70,-127 L-70,-73 M-97,-100 L-43,-100', 3, 'rgba(0,0,0,.25)');
  if (form >= 2) s += U(P('M-100,-134 L-46,-134 L-46,-96 Q-50,-66 -73,-54 Q-96,-66 -100,-96 Z'), form === 2 ? '#3f6fe0' : GOLD) + F(star(-73, -100, 14), form === 2 ? GOLD : '#ff5a3d');
  // 劍 + 右手
  const sl = [62, 86, 104, 122][form] * (1 + 0.16 * w);
  const sopt = [
    { blade: '#e0b072', guard: '#a66a2e', bw: 12 },
    { blade: '#eef3f8', guard: GOLD, bw: 13 },
    { blade: '#f4f8fc', guard: '#3f6fe0', bw: 15, gem: '#ff5a3d' },
    { blade: '#aef6ff', guard: GOLD, bw: 18, gem: '#ff5a3d', glow: '#5ff2ff' },
  ][form];
  if (w >= 3) sopt.glow = '#ffe14a'; else if (w >= 2 && !sopt.glow) sopt.glow = '#9be8ff';
  if (w >= 1) sopt.gem = sopt.gem || '#5ff2ff';
  s += sword(72, -158, 14, sl, sopt);
  s += cap(48, -128, 70, -156, 17, form === 0 ? SKIN : sleeve);
  if (form === 0) s += U(C(48, -130, 12), sleeve, 5);
  s += U(C(72, -160, 11), form >= 2 ? armor.b : SKIN, 5);
  if (form >= 2) s += U(E(-48, -138, 24, 17) + E(48, -138, 24, 17), armor.a) + (form === 3 ? U(tri(-58, -150, -30, 14, 22) + tri(58, -150, 30, 14, 22), GOLD, 4) : '');
  // 頭
  s += U(C(-64, -200, 12) + C(64, -200, 12) + C(0, -206, 66), SKIN);
  s += U(P('M-68,-212 Q-74,-286 0,-284 Q74,-286 68,-212 Q52,-238 36,-226 Q26,-252 6,-232 Q-8,-254 -26,-230 Q-42,-248 -68,-212 Z') + P('M-10,-278 Q2,-310 26,-282 Z'), HAIR);
  s += F(P('M-40,-262 Q-10,-276 20,-268 Q-10,-268 -34,-254 Z'), '#fff', 0.18);
  // 臉
  s += `<g class="blink" style="transform-origin:0px -200px">` + F(E(-24, -200, 10, 14) + E(24, -200, 10, 14), OUT) + F(C(-21, -205, 4) + C(27, -205, 4), '#fff') + `</g>`;
  s += L('M-36,-222 L-14,-220', 5, HAIR) + L('M14,-220 L36,-222', 5, HAIR);
  s += `<path d="M-14,-176 Q0,-158 14,-176 Z" fill="#d6455a" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>`;
  s += F(E(-44, -182, 11, 7) + E(44, -182, 11, 7), '#ff8fa3', 0.55);
  let top = -292;
  if (form === 1) {
    s += U(P('M-68,-232 Q0,-256 68,-232 L68,-216 Q0,-240 -68,-216 Z'), '#e8413a', 5) + U(P('M66,-226 l30,-12 l-6,16 l14,6 l-34,2 z'), '#e8413a', 5);
  }
  if (form === 2) {
    const id = 'bh' + uid;
    s += `<clipPath id="${id}"><rect x="-90" y="-290" width="180" height="56"/></clipPath><g clip-path="url(#${id})">` + U(C(0, -206, 72), armor.a, 5) + F(E(-28, -256, 22, 12, -20), '#fff', 0.45) + `</g>`;
    s += U(R(-76, -242, 152, 12, 5), armor.b, 4);
    s += U(P('M-6,-276 Q-34,-326 10,-340 Q-4,-316 22,-300 Q8,-292 12,-276 Z'), '#e8413a', 5);
    top = -338;
  }
  if (form === 3) {
    s += U(P('M-66,-236 Q0,-262 66,-236 L62,-222 Q0,-246 -62,-222 Z'), GOLD, 5) + U(tri(0, -246, 0, 20, 26), GOLD, 4) + F(C(0, -240, 6), '#3f8cff');
    top = -300;
  }
  return { s, A: { head: { cx: 0, cy: -206, rx: 66, ry: 66 }, chest: { cx: 0, cy: -106, w: 58, h: 54 }, back: { x: 0, y: -140 }, top, view: 'front', H: -top } };
}

const RIGS = { dino: drawDino, sea: drawSea, boy: drawBoy };

// =====================================================================
//  通用升級外觀
// =====================================================================
const ARM = [null, { a: '#c98a4b', b: '#8a5527', t: '#f6d7a8' }, { a: '#e3e9f0', b: '#8f9db0', t: '#ffffff' }, { a: '#ffe066', b: '#e2a400', t: '#fff8cf' }];
function armorOv(t, A, uid) {
  if (!t) return '';
  const m = ARM[t], { cx, cy, w, h } = A.chest, hd = A.head;
  let s = '';
  const d = `M${cx - w / 2},${cy - h / 2} Q${cx},${cy - h / 2 - 9} ${cx + w / 2},${cy - h / 2} L${cx + w / 2},${cy + h * 0.08} Q${cx + w * 0.42},${cy + h * 0.52} ${cx},${cy + h * 0.62} Q${cx - w * 0.42},${cy + h * 0.52} ${cx - w / 2},${cy + h * 0.08} Z`;
  s += U(P(d), m.a, 5) + F(P(`M${cx},${cy - h / 2 - 4} L${cx + w / 2},${cy - h / 2} L${cx + w / 2},${cy + h * 0.08} Q${cx + w * 0.42},${cy + h * 0.52} ${cx},${cy + h * 0.62} Z`), '#000', 0.12);
  s += F(star(cx, cy - h * 0.02, h * 0.24), m.t);
  // 頭盔：蓋住頭頂
  const id = "ah" + uid, frac = A.helmetFrac ?? 0.5, yy = hd.cy - hd.ry * frac;
  s += `<clipPath id="${id}"><rect x="${hd.cx - hd.rx - 16}" y="${hd.cy - hd.ry - 18}" width="${hd.rx * 2 + 32}" height="${hd.ry * (1 - frac) + 18}"/></clipPath>`;
  s += `<g clip-path="url(#${id})">` + U(E(hd.cx, hd.cy, hd.rx + 5, hd.ry + 5), m.a, 4) + F(E(hd.cx - hd.rx * 0.35, hd.cy - hd.ry * 0.72, hd.rx * 0.3, hd.ry * 0.14, -12), '#fff', 0.5) + `</g>`;
  const xw = (hd.rx + 5) * Math.sqrt(Math.max(0, 1 - Math.pow((hd.ry * frac) / (hd.ry + 5), 2)));
  s += U(R(hd.cx - xw - 5, yy - 6, xw * 2 + 10, 12, 5), m.b, 4);
  if (t === 3) s += F(C(hd.cx, yy, 5), '#ff5a3d');
  return s;
}
function crownOv(t, A, hasHelmet) {
  if (!t) return '';
  const w = [0, 22, 28, 36][t], h = [0, 24, 32, 44][t], col = ['', '#e0a060', '#e8eef5', '#ffd84a'][t];
  const x = A.head.cx, y = (hasHelmet ? Math.min(A.top, A.head.cy - A.head.ry - 5) : A.top) + 8, rot = A.view === 'side' ? -8 : 0;
  const d = `M${-w},0 L${-w - 4},${-h * 0.7} L${-w / 2},${-h * 0.35} L0,${-h} L${w / 2},${-h * 0.35} L${w + 4},${-h * 0.7} L${w},0 Z`;
  let s = `<g transform="translate(${x},${y}) rotate(${rot})">` + U(P(d), col, 5) + F(R(-w, -9, 2 * w, 9, 3), '#000', 0.15);
  if (t >= 2) s += F(C(0, -h * 0.42, 5.5), '#ff3d6e');
  if (t === 3) s += F(C(-w * 0.6, -13, 4) + C(w * 0.6, -13, 4), '#3f8cff') + F(C(0, -h - 2, 5) + C(-w - 4, -h * 0.7 - 2, 4) + C(w + 4, -h * 0.7 - 2, 4), '#fff');
  return s + '</g>';
}
function capeOv(t, A) {
  if (!t) return '';
  const col = ['', '#ff5b5b', '#3f8cff', '#8a4bff'][t], len = A.H * [0, 0.36, 0.48, 0.6][t], bx = A.back.x, by = A.back.y;
  let d, trim = '';
  if (A.view === 'front') {
    const ww = 60 + 12 * t;
    d = `M-46,${by} Q0,${by - 12} 46,${by} L${ww},${by + len} Q0,${by + len + 16} ${-ww},${by + len} Z`;
    if (t === 3) trim = L(`M${-ww + 6},${by + len - 8} Q0,${by + len + 6} ${ww - 6},${by + len - 8}`, 5, GOLD);
  } else {
    d = `M${bx + 30},${by - 16} Q${bx - 20},${by - 12} ${bx - 58},${by + len * 0.5} Q${bx - 74},${by + len * 0.85} ${bx - 100},${by + len} Q${bx - 50},${by + len + 8} ${bx - 8},${by + len - 16} Q${bx + 10},${by + len * 0.5} ${bx + 30},${by - 16} Z`;
    if (t === 3) trim = L(`M${bx - 92},${by + len - 4} Q${bx - 50},${by + len + 2} ${bx - 14},${by + len - 20}`, 5, GOLD);
  }
  return `<g class="capewave" style="transform-origin:${bx}px ${by}px">` + U(P(d), col) + trim + (t >= 2 ? F(star(A.view === 'front' ? 0 : bx - 44, by + len * 0.6, 10), t === 3 ? GOLD : '#fff', 0.9) : '') + `</g>`;
}
const WING = 'M0,0 Q-30,-70 -112,-86 Q-92,-58 -104,-36 Q-78,-34 -84,-12 Q-56,-14 -52,6 Q-24,2 0,0 Z';
function wingsOv(t, A) {
  if (!t) return '';
  const k = [0, 0.75, 1.0, 1.3][t], col = ['', '#ffffff', '#dff3ff', '#ffe27a'][t], bx = A.back.x, by = A.back.y;
  const one = (x, y, sx, rot, cls) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sx * k},${k})"><g class="${cls}">` + U(P(WING), col, 5 / k) +
    L('M-10,-6 Q-40,-50 -92,-70', 3 / k, 'rgba(0,0,0,.18)') + L('M-14,0 Q-44,-28 -84,-28', 3 / k, 'rgba(0,0,0,.18)') + `</g></g>`;
  if (A.view === 'front') return one(-28, by + 8, 1, 0, 'flapL') + one(28, by + 8, -1, 0, 'flapR');
  return one(bx + 46, by - 6, -0.8, -24, 'flapR') + one(bx + 8, by - 8, 1, 12, 'flapL');
}
function auraOv(t, cx, cy, H, uid) {
  if (!t) return '';
  const col = ['', '#7fd4ff', '#c79bff', '#ffd84a'][t], id = 'au' + uid, r = H * 0.72 + 30;
  let s = `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity=".95"/><stop offset=".55" stop-color="${col}" stop-opacity=".45"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs>`;
  if (t >= 2) {
    let rays = '';
    for (let i = 0; i < 12; i++) rays += `<path d="M0,0 L${-r * 0.1},${-r * 1.15} L${r * 0.1},${-r * 1.15} Z" transform="rotate(${i * 30})"/>`;
    s += `<g transform="translate(${cx},${cy})"><g class="spin" fill="${col}" opacity="${t === 3 ? 0.4 : 0.22}">${rays}</g></g>`;
  }
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="url(#${id})" class="pulse"/>`;
  return s;
}
function orbitOv(up, cx, cy, H) {
  let s = '';
  const defs = [['fire', '🔥', 0, 5.2], ['ice', '❄️', 1, 6.4], ['thunder', '⚡', 2, 4.4]];
  defs.forEach(([k, emo, idx, dur]) => {
    const n = up[k] || 0;
    if (!n) return;
    const Rx = 150 + idx * 22, Ry = 34 + idx * 6, oy = (idx - 1) * H * 0.2;
    for (let i = 0; i < n; i++) {
      s += `<text font-size="${30 + n * 3}" text-anchor="middle" dominant-baseline="central">${emo}<animateMotion dur="${dur}s" begin="-${(dur / n) * i}s" repeatCount="indefinite" path="M ${-Rx},${oy} a ${Rx},${Ry} 0 1,0 ${Rx * 2},0 a ${Rx},${Ry} 0 1,0 ${-Rx * 2},0"/></text>`;
    }
  });
  return s ? `<g transform="translate(${cx},${cy})">${s}</g>` : '';
}
function petOv(n, X, Y) {
  if (!n) return '';
  const cols = ['#ff9ecb', '#ffe066', '#8ef0c0'], pos = [[X + 176, Y - 4], [X - 186, Y - 4], [X + 210, Y - 96]];
  let s = '';
  for (let i = 0; i < n; i++) {
    const [x, y] = pos[i];
    s += `<g transform="translate(${x},${y})"><g class="hop" style="animation-delay:${-i * 0.35}s">` +
      U(P('M-24,0 Q-28,-34 0,-36 Q28,-34 24,0 Z'), cols[i], 4) + F(E(-8, -26, 8, 4, -20), '#fff', 0.5) +
      F(C(-8, -16, 4) + C(8, -16, 4), OUT) + L('M-5,-8 Q0,-4 5,-8', 2.5) +
      (i === 2 ? U(P('M-20,-22 l-16,-10 l6,14 z') + P('M20,-22 l16,-10 l-6,14 z'), '#fff', 3) : '') + `</g></g>`;
  }
  return s;
}

// =====================================================================
//  組合輸出
// =====================================================================
export function formOf(level) { return Math.min(3, Math.floor(level / 5)); }

export function charSVG(id, ch, o = {}) {
  const uid = ++UID;
  const form = o.form ?? formOf(ch.level), up = o.up ?? ch.up ?? {};
  const rig = RIGS[id](form, up, uid), A = rig.A;
  const fs = LINES[id].forms[form].scale;
  const st = up.strong || 0, tl = up.tall || 0;
  const sx = fs * (1 + 0.05 * st), sy = fs * (1 + 0.045 * tl) * (1 + 0.01 * st);
  const X = 250, Y = 456, Hpx = A.H * sy, cy = Y - Hpx * 0.5;
  const hasHelmet = (up.armor || 0) > 0;
  // fit：貼身取景（標題/選角/小頭像用），否則固定鏡頭（主畫面看得出長大）
  let vb = '0 0 500 500';
  if (o.fit === 'form') {
    // 依型態取景（不含升級放大），看得出變壯/長高
    const size = Math.max(A.H * fs + 90, 330 * fs + 60) * 1.32;
    vb = `${(X - size / 2).toFixed(0)} ${(Y - size + 30).toFixed(0)} ${size.toFixed(0)} ${size.toFixed(0)}`;
  } else if (o.fit) {
    const size = Math.max(Hpx + 90, 330 * sx + 60);
    vb = `${(X - size / 2).toFixed(0)} ${(Y - size + 30).toFixed(0)} ${size.toFixed(0)} ${size.toFixed(0)}`;
  }
  let s = `<svg viewBox="${vb}" class="char-svg${o.cls ? ' ' + o.cls : ''}" xmlns="http://www.w3.org/2000/svg" overflow="visible">`;
  s += auraOv(up.aura || 0, X, cy, Hpx, uid);
  s += `<ellipse cx="${X}" cy="${Y + 4}" rx="${120 * sx}" ry="${16 * sx}" fill="rgba(0,0,0,.22)"/>`;
  if (ST !== STYLES.flat) s += FX_DEFS;
  s += `<g class="idle" style="transform-origin:${X}px ${Y}px"><g transform="translate(${X},${Y}) scale(${sx.toFixed(3)},${sy.toFixed(3)})" ${ST.whole}>`;
  s += wingsOv(up.wings || 0, A) + capeOv(up.cape || 0, A) + rig.s + armorOv(up.armor || 0, A, uid) + crownOv(up.crown || 0, A, hasHelmet);
  s += `</g></g>`;
  s += orbitOv(up, X, cy, Hpx) + petOv(up.pet || 0, X, Y);
  return s + '</svg>';
}

// =====================================================================
//  邪惡怪物（戰鬥用）
// =====================================================================
const angryEyes = (x1, x2, y, r, iris = '#ff3d3d') =>
  `<circle cx="${x1}" cy="${y}" r="${r}" fill="#fff" stroke="${OUT}" stroke-width="4"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#fff" stroke="${OUT}" stroke-width="4"/>` +
  F(C(x1 + 2, y + 2, r * 0.5) + C(x2 - 2, y + 2, r * 0.5), iris) + F(C(x1 + 2, y + 2, r * 0.22) + C(x2 - 2, y + 2, r * 0.22), OUT) +
  L(`M${x1 - r - 4},${y - r - 6} L${x1 + r},${y - r * 0.3}`, 7) + L(`M${x2 + r + 4},${y - r - 6} L${x2 - r},${y - r * 0.3}`, 7);
const fangMouth = (cx, y, w) => `<path d="M${cx - w},${y} Q${cx},${y + w * 0.9} ${cx + w},${y} Z" fill="#5a1030" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>` +
  `<path d="M${cx - w * 0.6},${y + 2} l6,14 l6,-13 z M${cx + w * 0.6},${y + 2} l-6,14 l-6,-13 z" fill="#fff" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>`;

export const MONSTERS = [
  { id: 'slime', name: '暗影史萊姆', draw: () => U(P('M-110,0 Q-130,-150 0,-170 Q130,-150 110,0 Q60,14 0,6 Q-60,14 -110,0 Z'), '#8a4bff') + F(E(-40, -128, 34, 16, -20), '#fff', 0.3) + U(tri(-50, -160, -20, 26, 40) + tri(50, -160, 20, 26, 40), '#4a2fae', 5) + angryEyes(-38, 38, -92, 22) + fangMouth(0, -52, 34) },
  { id: 'bat', name: '尖牙蝙蝠', draw: () => `<g class="flapL" style="transform-origin:-30px -130px">` + U(P('M-30,-130 Q-110,-230 -200,-170 Q-160,-150 -170,-110 Q-130,-130 -120,-90 Q-80,-110 -40,-90 Z'), '#5b3a8c') + `</g><g class="flapR" style="transform-origin:30px -130px">` + U(P('M30,-130 Q110,-230 200,-170 Q160,-150 170,-110 Q130,-130 120,-90 Q80,-110 40,-90 Z'), '#5b3a8c') + `</g>` + U(tri(-34, -180, -15, 30, 50) + tri(34, -180, 15, 30, 50) + C(0, -120, 70), '#7a52b8') + angryEyes(-28, 28, -132, 19, '#ffe14a') + fangMouth(0, -100, 26) + U(E(-20, -44, 12, 8) + E(20, -44, 12, 8), '#5b3a8c', 4) },
  { id: 'imp', name: '搗蛋小惡魔', draw: () => L('M60,-40 Q130,-30 120,-110', 9) + L('M60,-40 Q130,-30 120,-110', 5, '#d9342b') + U(tri(120, -116, 0, 26, 28), '#d9342b', 4) + U(E(-26, -8, 26, 13) + E(26, -8, 26, 13) + R(-52, -110, 104, 100, 40), '#e8483f') + F(E(0, -52, 30, 34), '#ffb199') + U(P('M-40,-200 Q-70,-260 -30,-270 Q-36,-240 -14,-214 Z') + P('M40,-200 Q70,-260 30,-270 Q36,-240 14,-214 Z'), '#fff3d6', 5) + U(C(0, -160, 68), '#e8483f') + angryEyes(-28, 28, -168, 19, '#ffe14a') + fangMouth(0, -136, 30) + cap(-56, -90, -92, -130, 16, '#e8483f') + L('M-96,-60 L-96,-220', 8) + L('M-96,-60 L-96,-220', 4, '#8a5527') + U(P('M-116,-216 L-116,-250 M-96,-216 L-96,-262 M-76,-216 L-76,-250 M-116,-216 L-76,-216'), STEEL, 3) },
  { id: 'golem', name: '岩石巨人', draw: () => U(R(-70, -40, 54, 40, 10) + R(16, -40, 54, 40, 10) + P('M-100,-40 L-110,-150 L-60,-200 L60,-200 L110,-150 L100,-40 Z'), '#8d99a6') + F(P('M-60,-200 L60,-200 L40,-170 L-70,-160 Z'), '#fff', 0.2) + L('M-40,-80 l20,-20 l-10,-20 M50,-70 l-16,-24', 4, 'rgba(0,0,0,.3)') + U(R(-150, -170, 50, 110, 16) + R(100, -170, 50, 110, 16), '#77838f') + U(R(-64, -280, 128, 92, 18), '#9aa6b3') + `<rect x="-46" y="-250" width="34" height="18" rx="4" fill="#5ff2ff" stroke="${OUT}" stroke-width="4" class="glow"/><rect x="12" y="-250" width="34" height="18" rx="4" fill="#5ff2ff" stroke="${OUT}" stroke-width="4" class="glow"/>` + L('M-50,-262 L-10,-252 M50,-262 L10,-252', 7) + L('M-30,-212 L-14,-204 L0,-212 L14,-204 L30,-212', 5) + F(C(-80, -190, 8) + C(84, -60, 7), '#6f9a4a') },
  { id: 'ghost', name: '嚇人幽靈', draw: () => `<g opacity=".93">` + U(P('M-90,-10 Q-104,-230 0,-240 Q104,-230 90,-10 Q70,-34 54,-8 Q36,-34 18,-8 Q0,-34 -18,-8 Q-36,-34 -54,-8 Q-70,-34 -90,-10 Z'), '#bfeee6') + F(E(-36, -196, 30, 14, -20), '#fff', 0.5) + `</g>` + F(E(-32, -150, 18, 26) + E(32, -150, 18, 26), OUT) + F(C(-28, -158, 6) + C(36, -158, 6), '#ff3d3d') + L('M-60,-190 L-16,-176 M60,-190 L16,-176', 7) + `<path d="M-30,-100 Q0,-70 30,-100 Q0,-122 -30,-100 Z" fill="#5a1030" stroke="${OUT}" stroke-width="5"/>` + cap(-88, -120, -124, -150, 18, '#bfeee6') + cap(88, -120, 124, -150, 18, '#bfeee6') },
  { id: 'shroom', name: '毒蘑菇怪', draw: () => U(E(-26, -8, 24, 12) + E(26, -8, 24, 12) + R(-50, -120, 100, 114, 40), '#fff0d6') + angryEyes(-22, 22, -78, 16, '#8a4bff') + fangMouth(0, -52, 22) + U(P('M-130,-110 Q-130,-250 0,-256 Q130,-250 130,-110 Q0,-140 -130,-110 Z'), '#a23ad6') + F(C(-70, -180, 22) + C(10, -214, 26) + C(78, -170, 18) + C(-14, -150, 12), '#f7c9ff') + F(E(-50, -226, 30, 10, -20), '#fff', 0.3) },
];
export const BOSSES = [
  { id: 'king', name: '黑暗魔王', draw: () => U(P('M-120,-200 Q-180,-80 -150,0 L150,0 Q180,-80 120,-200 Z'), '#3a2060') + U(E(-34, -8, 30, 14) + E(34, -8, 30, 14) + R(-78, -170, 156, 160, 44), '#5b2a9e') + F(P('M-40,-150 L40,-150 L26,-60 Q0,-40 -26,-60 Z'), '#2b2140', 0.6) + F(star(0, -104, 22), '#ff3d6e') + U(P('M-56,-260 Q-110,-350 -40,-366 Q-56,-320 -24,-286 Z') + P('M56,-260 Q110,-350 40,-366 Q56,-320 24,-286 Z'), '#ffe14a') + U(C(0, -220, 78), '#6d3ac0') + angryEyes(-32, 32, -228, 22, '#ffe14a') + fangMouth(0, -192, 38) + cap(-84, -140, -130, -90, 22, '#5b2a9e') + cap(84, -140, 130, -90, 22, '#5b2a9e') + U(C(-132, -86, 16) + C(132, -86, 16), '#3a2060', 5) + crownOv(3, { head: { cx: 0, cy: -220, rx: 78, ry: 78 }, top: -300, view: 'front' }, false) },
  { id: 'dragon', name: '暗黑邪龍', draw: () => U(P('M-40,-170 Q-150,-330 -250,-280 Q-200,-250 -220,-200 Q-170,-220 -170,-160 Q-110,-180 -60,-130 Z') + P('M40,-170 Q150,-330 250,-280 Q200,-250 220,-200 Q170,-220 170,-160 Q110,-180 60,-130 Z'), '#4a1d5e') + U(E(-40, -10, 34, 15) + E(40, -10, 34, 15) + E(0, -110, 92, 104), '#2f2a4a') + F(E(0, -96, 54, 72), '#8a4bff', 0.9) + L('M-40,-130 Q0,-118 40,-130 M-44,-98 Q0,-86 44,-98 M-38,-66 Q0,-56 38,-66', 3, 'rgba(0,0,0,.3)') + U(tri(-40, -262, -24, 30, 60) + tri(40, -262, 24, 30, 60), '#ffe14a', 5) + U(E(0, -230, 80, 62) + E(0, -196, 60, 40), '#3a3560') + angryEyes(-34, 34, -246, 20, '#ff3d3d') + F(C(-14, -206, 4) + C(14, -206, 4), OUT) + fangMouth(0, -188, 40) + flame(-110, -30, -80, 1.2) + flame(110, -30, 80, 1.2) },
];
export function monsterSVG(m, boss = false) {
  return `<svg viewBox="0 0 500 500" class="char-svg" xmlns="http://www.w3.org/2000/svg" overflow="visible">` +
    (boss ? `<ellipse cx="250" cy="300" rx="230" ry="230" fill="rgba(120,40,200,.35)" class="pulse"/>` : '') +
    `<ellipse cx="250" cy="460" rx="${boss ? 150 : 110}" ry="16" fill="rgba(0,0,0,.25)"/>` +
    `<g class="idle" style="transform-origin:250px 456px"><g transform="translate(250,456) scale(${boss ? 1.05 : 0.95})">${m.draw()}</g></g></svg>`;
}
