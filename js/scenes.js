// 三個角色世界的背景（1024×768，地平線約在 y=580）
const svg = (inner) => `<svg viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="scene-svg">${inner}</svg>`;

function palm(x, y, k = 1, lean = 0) {
  const leaf = (r, len) => `<path d="M0,0 Q${len * 0.5},${-len * 0.35} ${len},${len * 0.1} Q${len * 0.5},${-len * 0.1} 0,0 Z" transform="rotate(${r})"/>`;
  return `<g transform="translate(${x},${y}) scale(${k}) rotate(${lean})">` +
    `<path d="M-8,0 Q-16,-90 4,-170 L18,-168 Q4,-90 12,0 Z" fill="#8a5a2b" stroke="#5a3a18" stroke-width="3"/>` +
    `<g transform="translate(10,-170)"><g fill="#3fae5a" stroke="#1f7a3c" stroke-width="3" class="sway">${leaf(-150, 90)}${leaf(-110, 100)}${leaf(-70, 96)}${leaf(-30, 100)}${leaf(10, 90)}${leaf(-190, 84)}</g></g></g>`;
}
function fern(x, y, k = 1) {
  let s = '';
  for (let i = -3; i <= 3; i++) s += `<path d="M0,0 Q${i * 14},${-40 - Math.abs(i) * 2} ${i * 26},${-58 + Math.abs(i) * 10}" stroke="#2f9a4c" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(${x},${y}) scale(${k})">${s}</g>`;
}
const cloud = (x, y, k, cls = 'drift') => `<g transform="translate(${x},${y}) scale(${k})"><g class="${cls}" fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="60" ry="24"/><ellipse cx="-34" cy="-14" rx="34" ry="24"/><ellipse cx="20" cy="-22" rx="40" ry="30"/><ellipse cx="54" cy="-6" rx="30" ry="18"/></g></g>`;

function dinoScene() {
  return svg(`
  <defs>
    <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a6b"/><stop offset=".45" stop-color="#ffd08a"/><stop offset="1" stop-color="#fff0c4"/></linearGradient>
    <radialGradient id="dsun"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffe680" stop-opacity=".9"/><stop offset="1" stop-color="#ffe680" stop-opacity="0"/></radialGradient>
    <linearGradient id="dgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc95a"/><stop offset="1" stop-color="#3f8f3c"/></linearGradient>
  </defs>
  <rect width="1024" height="768" fill="url(#dsky)"/>
  <circle cx="800" cy="170" r="170" fill="url(#dsun)"/><circle cx="800" cy="170" r="70" fill="#fff8d0"/>
  ${cloud(240, 120, 1)}${cloud(620, 80, 0.7, 'drift2')}
  <path d="M0,520 L120,330 L190,400 L300,250 L420,430 L520,360 L640,480 L760,380 L900,470 L1024,400 L1024,620 L0,620 Z" fill="#c98aa0" opacity=".55"/>
  <!-- 火山 -->
  <path d="M60,560 L230,210 L300,210 L470,560 Z" fill="#8a5a5a"/>
  <path d="M230,210 L300,210 L318,250 Q290,236 270,262 Q250,236 214,246 Z" fill="#ff6a2b"/>
  <path d="M262,258 Q256,330 240,380 M280,256 Q290,320 310,350" stroke="#ff8a3d" stroke-width="8" fill="none" stroke-linecap="round" opacity=".9"/>
  <g class="smoke" fill="#fff" opacity=".7"><circle cx="262" cy="180" r="26"/><circle cx="290" cy="140" r="34"/><circle cx="250" cy="100" r="40"/></g>
  <path d="M0,560 Q200,470 420,540 Q640,600 820,520 Q940,480 1024,520 L1024,768 L0,768 Z" fill="#9bd66a"/>
  ${palm(110, 590, 1.2, -6)}${palm(930, 600, 1.35, 8)}${palm(820, 570, 0.9, -4)}
  <path d="M0,600 Q260,560 520,592 Q780,620 1024,580 L1024,768 L0,768 Z" fill="url(#dgr)"/>
  ${fern(60, 640, 1.3)}${fern(200, 700, 1)}${fern(960, 690, 1.4)}${fern(780, 720, 1)}
  <g fill="#b9c0c9" stroke="#7d8793" stroke-width="3"><ellipse cx="330" cy="716" rx="40" ry="18"/><ellipse cx="700" cy="668" rx="26" ry="12"/></g>
  <g fill="#fff8e6" stroke="#c9b58a" stroke-width="3"><ellipse cx="870" cy="716" rx="16" ry="21"/><ellipse cx="900" cy="722" rx="14" ry="18"/></g>
  <g class="fly" fill="#5a3a4a"><path d="M0,0 q20,-18 40,0 q-10,-6 -20,2 q-10,-8 -20,-2 z" transform="translate(140,220)"/><path d="M0,0 q16,-14 32,0 q-8,-5 -16,2 q-8,-7 -16,-2 z" transform="translate(210,260)"/></g>`);
}

function seaScene() {
  let bubbles = '';
  for (let i = 0; i < 16; i++) {
    const x = 40 + ((i * 137) % 960), r = 5 + (i % 4) * 3, d = 6 + (i % 5) * 1.6;
    bubbles += `<circle cx="${x}" cy="780" r="${r}" fill="none" stroke="#dff8ff" stroke-width="2.5" opacity=".8" class="bubble" style="animation-duration:${d}s;animation-delay:${-(i * 0.9)}s"/>`;
  }
  const weed = (x, h, col) => `<path d="M${x},768 Q${x - 24},${768 - h * 0.35} ${x},${768 - h * 0.6} Q${x + 24},${768 - h * 0.85} ${x},${768 - h}" stroke="${col}" stroke-width="14" fill="none" stroke-linecap="round" class="sway2"/>`;
  const coral = (x, y, col, k = 1) => `<g transform="translate(${x},${y}) scale(${k})" stroke="${col}" stroke-width="16" stroke-linecap="round" fill="none"><path d="M0,0 L0,-70 M0,-30 L-30,-60 M0,-44 L28,-78 M-30,-60 L-40,-90 M28,-78 L44,-100 M0,-70 L-6,-104"/></g>`;
  return svg(`
  <defs>
    <linearGradient id="ssea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fe0f2"/><stop offset=".5" stop-color="#1f9fe0"/><stop offset="1" stop-color="#0b3f94"/></linearGradient>
    <linearGradient id="ssand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6ad"/><stop offset="1" stop-color="#e2b36a"/></linearGradient>
  </defs>
  <rect width="1024" height="768" fill="url(#ssea)"/>
  <g fill="#fff" class="rays"><path d="M120,0 L260,0 L80,768 L-120,768 Z" opacity=".1"/><path d="M430,0 L520,0 L560,768 L360,768 Z" opacity=".08"/><path d="M760,0 L900,0 L1100,768 L860,768 Z" opacity=".1"/></g>
  <path d="M0,560 Q120,430 220,520 Q300,440 380,560 L380,768 L0,768 Z" fill="#0d57a8" opacity=".6"/>
  <path d="M700,560 Q800,400 900,500 Q980,440 1024,520 L1024,768 L700,768 Z" fill="#0d57a8" opacity=".6"/>
  <g class="swim" fill="#ffd166"><g transform="translate(180,240)"><ellipse rx="22" ry="11"/><path d="M-20,0 l-18,-12 l0,24 z"/><circle cx="10" cy="-3" r="2.5" fill="#2b2140"/></g><g transform="translate(240,290) scale(.7)"><ellipse rx="22" ry="11"/><path d="M-20,0 l-18,-12 l0,24 z"/><circle cx="10" cy="-3" r="2.5" fill="#2b2140"/></g></g>
  <g class="swim2" fill="#ff8fb0"><g transform="translate(820,180) scale(-.8,.8)"><ellipse rx="22" ry="11"/><path d="M-20,0 l-18,-12 l0,24 z"/><circle cx="10" cy="-3" r="2.5" fill="#2b2140"/></g></g>
  ${weed(70, 260, '#2fbf7a')}${weed(120, 190, '#22a56a')}${weed(940, 280, '#2fbf7a')}${weed(990, 200, '#22a56a')}${weed(640, 150, '#22a56a')}
  <path d="M0,610 Q200,570 430,600 Q700,634 1024,588 L1024,768 L0,768 Z" fill="url(#ssand)"/>
  ${coral(200, 650, '#ff7a9c', 1.1)}${coral(860, 640, '#ff9a4a', 1.2)}${coral(760, 700, '#c77dff', 0.8)}
  <g transform="translate(330,712)"><path d="M0,-22 L7,-7 L23,-7 L10,3 L15,19 L0,9 L-15,19 L-10,3 L-23,-7 L-7,-7 Z" fill="#ff9a4a" stroke="#d96a1c" stroke-width="3"/></g>
  <g transform="translate(700,720)"><path d="M-26,0 Q-26,-30 0,-30 Q26,-30 26,0 Z" fill="#ffd6e8" stroke="#d98aae" stroke-width="3"/><path d="M-14,-2 L-10,-26 M0,-2 L0,-30 M14,-2 L10,-26" stroke="#d98aae" stroke-width="2.5"/></g>
  ${bubbles}`);
}

function boyScene() {
  const tree = (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><rect x="-9" y="-50" width="18" height="54" rx="6" fill="#8a5a2b"/><circle cx="0" cy="-84" r="48" fill="#4fbf5a"/><circle cx="-30" cy="-64" r="30" fill="#45b050"/><circle cx="30" cy="-62" r="32" fill="#58c965"/><circle cx="-14" cy="-98" r="12" fill="#8fe08a" opacity=".7"/></g>`;
  const flower = (x, y, c) => `<g transform="translate(${x},${y})"><path d="M0,0 L0,-22" stroke="#2f9a4c" stroke-width="4"/><g fill="${c}"><circle cx="0" cy="-30" r="7"/><circle cx="8" cy="-24" r="7"/><circle cx="-8" cy="-24" r="7"/><circle cx="5" cy="-16" r="7"/><circle cx="-5" cy="-16" r="7"/></g><circle cx="0" cy="-23" r="5" fill="#ffe14a"/></g>`;
  return svg(`
  <defs>
    <linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb4ff"/><stop offset=".7" stop-color="#bfeaff"/><stop offset="1" stop-color="#eafaff"/></linearGradient>
    <linearGradient id="bgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe06a"/><stop offset="1" stop-color="#46a94a"/></linearGradient>
  </defs>
  <rect width="1024" height="768" fill="url(#bsky)"/>
  <circle cx="150" cy="130" r="56" fill="#fff6b0"/><circle cx="150" cy="130" r="90" fill="#fff6b0" opacity=".3"/>
  ${cloud(420, 110, 1.1)}${cloud(820, 170, 0.8, 'drift2')}${cloud(640, 60, 0.6)}
  <path d="M0,540 L160,360 L280,470 L420,330 L560,500 L1024,540 L1024,640 L0,640 Z" fill="#9db8e8" opacity=".7"/>
  <path d="M130,392 L160,360 L186,388 L168,384 L158,396 L146,384 Z M392,362 L420,330 L446,358 L428,352 L418,366 L406,352 Z" fill="#fff"/>
  <path d="M520,560 Q700,400 900,470 Q980,500 1024,480 L1024,640 L520,640 Z" fill="#7ed46a"/>
  <!-- 城堡 -->
  <g transform="translate(790,440)">
    <rect x="-70" y="-90" width="140" height="100" fill="#d9dee8" stroke="#8f99ab" stroke-width="4"/>
    <rect x="-96" y="-130" width="40" height="140" fill="#e6eaf2" stroke="#8f99ab" stroke-width="4"/><rect x="56" y="-130" width="40" height="140" fill="#e6eaf2" stroke="#8f99ab" stroke-width="4"/>
    <rect x="-22" y="-170" width="44" height="90" fill="#eef1f7" stroke="#8f99ab" stroke-width="4"/>
    <path d="M-104,-130 L-76,-186 L-48,-130 Z M48,-130 L76,-186 L104,-130 Z M-30,-170 L0,-232 L30,-170 Z" fill="#ff5b6b" stroke="#c23a4a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M0,-232 L0,-262" stroke="#8f99ab" stroke-width="4"/><path d="M0,-262 L30,-252 L0,-242 Z" fill="#ffd43a" class="flag"/>
    <path d="M-18,10 L-18,-34 Q0,-54 18,-34 L18,10 Z" fill="#8a5a2b" stroke="#5a3a18" stroke-width="4"/>
    <g fill="#5a6b8a"><rect x="-84" y="-100" width="14" height="22" rx="7"/><rect x="70" y="-100" width="14" height="22" rx="7"/><rect x="-7" y="-150" width="14" height="22" rx="7"/></g>
  </g>
  <path d="M0,600 Q160,520 360,570 Q560,620 760,580 Q900,556 1024,590 L1024,768 L0,768 Z" fill="url(#bgr)"/>
  <path d="M760,584 Q640,640 560,768 L700,768 Q720,660 820,590 Z" fill="#f2dca8" opacity=".9"/>
  ${tree(90, 600, 1.3)}${tree(230, 570, 0.9)}${tree(960, 610, 1.2)}
  ${flower(60, 720, '#ff8fb0')}${flower(170, 690, '#fff')}${flower(300, 740, '#ffb347')}${flower(880, 730, '#ff8fb0')}${flower(980, 700, '#c79bff')}${flower(420, 700, '#fff')}`);
}

const SCENES = { dino: dinoScene, sea: seaScene, boy: boyScene };
export const sceneSVG = (id) => SCENES[id]();

// 戰鬥場景：暗色競技場
export function battleScene() {
  let stars = '';
  for (let i = 0; i < 40; i++) stars += `<circle cx="${(i * 197) % 1024}" cy="${(i * 89) % 420}" r="${1 + (i % 3)}" fill="#fff" opacity="${0.3 + (i % 5) * 0.14}" class="twinkle" style="animation-delay:${-(i % 7) * 0.4}s"/>`;
  return svg(`
  <defs><linearGradient id="bt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1140"/><stop offset=".6" stop-color="#4a2a8a"/><stop offset="1" stop-color="#8a3a8a"/></linearGradient>
  <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a7a"/><stop offset="1" stop-color="#2b1a4a"/></linearGradient></defs>
  <rect width="1024" height="768" fill="url(#bt)"/>${stars}
  <circle cx="512" cy="150" r="80" fill="#fff3c9" opacity=".9"/><circle cx="480" cy="130" r="14" fill="#e8d9a6"/><circle cx="540" cy="176" r="20" fill="#e8d9a6"/>
  <path d="M0,560 L90,380 L170,500 L260,340 L340,520 L430,420 L520,540 L620,400 L720,520 L800,360 L900,500 L960,420 L1024,520 L1024,640 L0,640 Z" fill="#2b1a5a" opacity=".8"/>
  <path d="M0,590 Q512,540 1024,590 L1024,768 L0,768 Z" fill="url(#bg2)"/>
  <ellipse cx="512" cy="660" rx="430" ry="60" fill="none" stroke="#c79bff" stroke-width="4" opacity=".35" stroke-dasharray="20 16"/>`);
}
