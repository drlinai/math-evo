import { state, load, save, CHAR_IDS, xpNeed, isEvoLevel, formName, drawCards, power, UPGRADES, upInfo, resetChar } from './state.js';
import { charSVG, LINES, formOf, MONSTERS, BOSSES, monsterSVG } from './characters.js';
import { sceneSVG, battleScene } from './scenes.js';
import { speak, stopSpeak, sfx, unlockAudio, toggleMusic } from './audio.js';
import { pickStages, zh } from './questions.js';

const stage = document.getElementById('stage');
const $ = (s) => stage.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// ---- 流程控制：換畫面時舊流程自動停止 ----
let run = 0;
class Abort extends Error {}
function flow(fn) {
  const id = ++run;
  const chk = () => { if (id !== run) throw new Abort(); };
  const w = async (p) => { const v = await p; chk(); return v; };
  fn(w, chk).catch((e) => { if (!(e instanceof Abort)) console.error(e); });
}
function screen(cls, html) {
  stopSpeak();
  stage.className = 'scr-' + cls;
  stage.innerHTML = html;
}

// ---- 版面縮放（邏輯尺寸 1024×768）----
function fit() {
  const k = Math.min(window.innerWidth / 1024, window.innerHeight / 768);
  stage.style.transform = `translate(-50%,-50%) scale(${k})`;
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', () => setTimeout(fit, 200));

function toggleFS() {
  const d = document, e = d.documentElement;
  if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen)?.call(d);
  else (e.requestFullscreen || e.webkitRequestFullscreen)?.call(e);
  setTimeout(fit, 300);
}

// ---- 特效 ----
function confetti(n = 46) {
  const cols = ['#ff5b5b', '#ffd43a', '#4fc38a', '#3f8cff', '#c79bff', '#ff9ecb'];
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.cssText = `left:${Math.random() * 100}%;background:${pick(cols)};animation-delay:${Math.random() * 0.6}s;animation-duration:${1.6 + Math.random() * 1.4}s;--r:${Math.random() * 720 - 360}deg;--x:${Math.random() * 160 - 80}px`;
    box.appendChild(p);
  }
  stage.appendChild(box);
  setTimeout(() => box.remove(), 3600);
}
function burst(x, y, emo = '⭐', n = 8) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'burst';
    s.textContent = emo;
    const a = (Math.PI * 2 * i) / n;
    s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * 120}px;--dy:${Math.sin(a) * 120}px`;
    stage.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}
const cur = () => state.chars[state.current];

// =====================================================================
//  標題
// =====================================================================
function showTitle() {
  run++;
  const babies = CHAR_IDS.map((id, i) => `<div class="t-char" style="animation-delay:${-i * 0.3}s">${charSVG(id, { level: 1, up: {} }, { fit: true })}</div>`).join('');
  screen('title', `<div class="bg title-bg"></div><div class="stars"></div>
    <h1 class="logo"><span>數學</span><span class="l2">進化獸</span></h1>
    <div class="t-row">${babies}</div>
    <button class="bigbtn" id="go">開始冒險 ▶</button>
    <button class="rbtn fsbtn" id="fs" aria-label="全螢幕">⛶</button>`);
  $('#go').onclick = () => {
    unlockAudio(); sfx.fanfare();
    state.current ? showHome() : showSelect();
  };
  $('#fs').onclick = toggleFS;
}

// =====================================================================
//  選角色
// =====================================================================
function showSelect() {
  run++;
  const cards = CHAR_IDS.map((id) => {
    const ch = state.chars[id];
    return `<button class="sel-card" data-id="${id}"><div class="sel-scene">${sceneSVG(id)}</div><div class="sel-char">${charSVG(id, ch, { fit: true })}</div>
      <div class="sel-name">${formName(id, ch.level)}</div><div class="sel-lv">Lv.${ch.level}</div></button>`;
  }).join('');
  screen('select', `<div class="bg title-bg"></div><div class="stars"></div><h2 class="sel-title">選一個夥伴！</h2><div class="sel-row">${cards}</div>`);
  speak('選一個夥伴，一起去冒險吧！');
  stage.querySelectorAll('.sel-card').forEach((b) => {
    b.onclick = () => {
      sfx.star();
      state.current = b.dataset.id; save();
      b.classList.add('picked');
      speak(`${formName(state.current, cur().level)}，出發！`);
      setTimeout(showHome, 700);
    };
  });
}

// =====================================================================
//  主畫面
// =====================================================================
function showHome() {
  run++;
  const id = state.current, ch = cur(), need = xpNeed(ch.level), pending = ch.xp >= need;
  const badges = UPGRADES.filter((u) => ch.up[u.id]).map((u) => { const i = upInfo(u, id); return `<span class="badge" style="--c:${u.color}">${i.icon}<b>${ch.up[u.id]}</b></span>`; }).join('');
  const nextEvo = ch.level < 15 ? `再 ${5 - (ch.level % 5)} 級進化` : '最終型態';
  screen('home', `<div class="bg">${sceneSVG(id)}</div>
    <div class="topbar"><button class="rbtn" id="sw">🔄<small>換角色</small></button><span class="grow"></span>
      <button class="rbtn" id="mu">${state.settings.music ? '🎵' : '🔇'}</button><button class="rbtn" id="fs">⛶</button><button class="rbtn" id="st">⚙️</button></div>
    <div class="plate"><div class="lv">Lv.<b>${ch.level}</b></div><div class="nm">${formName(id, ch.level)}</div>
      <div class="xpbar"><i style="width:${Math.min(100, (ch.xp / need) * 100)}%"></i><span>${Math.min(ch.xp, need)} / ${need}</span></div>
      <div class="sub"><span>⚡ 戰力 <b>${power(ch)}</b></span><span>🌟 ${nextEvo}</span></div></div>
    <div class="badges">${badges}</div>
    <div class="hero" id="hero">${charSVG(id, ch)}</div>
    <button class="bigbtn ${pending ? 'gold' : ''}" id="start">${pending ? '✨ 升級！' : '開始任務 ▶'}</button>`);
  $('#sw').onclick = () => { sfx.tap(); showSelect(); };
  $('#mu').onclick = (e) => { e.currentTarget.textContent = toggleMusic() ? '🎵' : '🔇'; };
  $('#fs').onclick = toggleFS;
  $('#st').onclick = showSettings;
  $('#hero').onclick = () => { sfx.pop(); $('#hero').classList.remove('jump'); void $('#hero').offsetWidth; $('#hero').classList.add('jump'); };
  $('#start').onclick = () => { unlockAudio(); sfx.star(); pending ? flow(levelUps) : flow(mission); };
}

function showSettings() {
  sfx.tap();
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="mbox"><h3>設定</h3>
    <button class="mbtn" id="vo">🗣️ 語音：${state.settings.voice ? '開' : '關'}</button>
    <button class="mbtn danger" id="rs">♻️ 這個角色重新養成</button>
    <button class="mbtn ok" id="cl">關閉</button></div>`;
  stage.appendChild(m);
  m.querySelector('#vo').onclick = (e) => { state.settings.voice = !state.settings.voice; save(); e.currentTarget.textContent = `🗣️ 語音：${state.settings.voice ? '開' : '關'}`; };
  let armed = false;
  m.querySelector('#rs').onclick = (e) => {
    if (!armed) { armed = true; e.currentTarget.textContent = '⚠️ 再按一次就會回到 Lv.1'; return; }
    resetChar(state.current); showHome();
  };
  m.querySelector('#cl').onclick = () => m.remove();
}

// =====================================================================
//  任務：3 關 × 每關 PER_STAGE 題
// =====================================================================
const PER_STAGE = 2; // 每關題數
async function mission(w, chk) {
  const id = state.current, ch = cur();
  const plan = pickStages(ch.level);
  let first = 0, total = 0;
  screen('mission', `<div class="bg dim">${sceneSVG(id)}</div>
    <div class="mtop"><button class="rbtn" id="quit">🏠</button>
      <div class="stages">${plan.map((s, i) => `<span class="sdot" data-i="${i}">${s.icon}</span>`).join('<i class="sline"></i>')}</div>
      <div class="pips" id="pips"></div></div>
    <div class="prompt"><button class="rbtn spk" id="spk">🔊</button><div id="ptext"></div></div>
    <div class="qscene" id="qscene"></div>
    <div class="answers" id="answers"></div>
    <div class="mini" id="mini">${charSVG(id, ch, { fit: true })}</div>
    <div class="eq" id="eq"></div><div class="banner" id="banner"></div>`);
  $('#quit').onclick = () => { sfx.tap(); showHome(); };

  for (let si = 0; si < plan.length; si++) {
    const st = plan[si];
    stage.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('on', i === si));
    $('#ptext').innerHTML = ''; $('#qscene').innerHTML = ''; $('#answers').innerHTML = '';
    await w(banner(`第 ${si + 1} 關`, `${st.icon} ${st.title}`, `第${zh(si + 1)}關，${st.title}！`));
    for (let qi = 0; qi < PER_STAGE; qi++) {
      $('#pips').innerHTML = Array.from({ length: PER_STAGE }, (_, k) => k).map((k) => `<i class="${k < qi ? 'done' : k === qi ? 'now' : ''}"></i>`).join('');
      const q = st.gen(ch.level, qi);
      const ok1 = await w(ask(q));
      total++; if (ok1) first++;
    }
    stage.querySelectorAll('.sdot')[si].classList.add('done');
    sfx.star();
  }
  // 結算
  const gain = first * 18 + (total - first) * 9 + 46; // 每組 6 題：全對 154、最少 100（Lv.1 一組必升級）
  ch.xp += gain; ch.missions++; save();
  await w(result(first, total, gain));
  if (ch.xp >= xpNeed(ch.level)) await levelUps(w, chk); else showHome();
}

function banner(top, main, say) {
  const b = $('#banner');
  b.innerHTML = `<small>${top}</small><b>${main}</b>`;
  b.classList.add('show');
  sfx.card();
  return Promise.all([speak(say), sleep(1300)]).then(() => b.classList.remove('show'));
}

function ask(q) {
  return new Promise((resolve) => {
    const scene = $('#qscene'), ans = $('#answers'), mini = $('#mini');
    let tries = 0, locked = false;
    $('#ptext').innerHTML = q.prompt;
    scene.className = 'qscene';
    q.render(scene);
    speak(q.say);
    $('#spk').onclick = () => speak(q.say);

    const win = async (btn) => {
      locked = true;
      btn?.classList.add('ok');
      sfx.correct();
      mini.classList.remove('jump'); void mini.offsetWidth; mini.classList.add('jump');
      burst(512, 360, '⭐', 10);
      const eq = $('#eq');
      eq.textContent = q.eq; eq.classList.add('show');
      await speak(`${pick(['答對了！', '好棒！', '太厲害了！', '你做到了！'])}${q.eqSay}`);
      await sleep(450);
      eq.classList.remove('show');
      resolve(tries === 0);
    };

    if (q.type === 'pay') {
      ans.innerHTML = `<button class="ans paybtn" id="payok">付錢 ✓</button>`;
      const tray = scene.querySelector('.traycoins'), wallet = scene.querySelector('.walletcoins'), sumEl = scene.querySelector('.traysum');
      const sum = () => [...tray.children].reduce((a, c) => a + +c.dataset.v, 0);
      scene.onclick = (e) => {
        const c = e.target.closest('.coin');
        if (!c || locked) return;
        sfx.coin();
        (c.parentElement === wallet ? tray : wallet).appendChild(c);
        if (tries > 0) sumEl.textContent = `盤子裡有 ${sum()} 元`;
      };
      $('#payok').onclick = () => {
        if (locked) return;
        const s = sum();
        if (s === q.answer) { scene.onclick = null; win($('#payok')); return; }
        tries++; sfx.wrong();
        sumEl.textContent = `盤子裡有 ${s} 元`;
        scene.classList.add('shake'); setTimeout(() => scene.classList.remove('shake'), 400);
        if (tries === 1) speak(s < q.answer ? `盤子裡有${zh(s)}元，還不夠喔，要付${zh(q.answer)}元！` : `盤子裡有${zh(s)}元，太多了，只要付${zh(q.answer)}元！`);
        else speak(`${q.payHint}，試試看！`);
      };
      return;
    }

    ans.innerHTML = q.choices.map((c) => `<button class="ans" data-v="${c}">${c}</button>`).join('');
    ans.onclick = (e) => {
      const b = e.target.closest('.ans');
      if (!b || locked || b.disabled) return;
      if (+b.dataset.v === q.answer) { win(b); return; }
      tries++; sfx.wrong();
      b.classList.add('no'); b.disabled = true;
      hint(q, scene, ans, tries);
    };
  });
}

// 答錯不懲罰：1 標數字 → 2 帶著數 → 3 亮出答案
function hint(q, scene, ans, tries) {
  const els = q.countEls(scene);
  let acc = 0;
  els.forEach((el) => { acc += +(el.dataset.v || 1); el.querySelector('b').textContent = acc; el.classList.add('numbered'); });
  if (tries === 1) { speak('再數數看！我幫你標上數字了。'); return; }
  if (tries === 2) {
    const vals = []; acc = 0;
    els.forEach((el, i) => { acc += +(el.dataset.v || 1); vals.push(zh(acc)); setTimeout(() => { el.classList.add('count'); sfx.pop(); }, 500 + i * 520); });
    speak(`我們一起數：${vals.join('、')}。`, { rate: 0.78 });
    return;
  }
  speak(`答案是${zh(q.answer)}，點亮亮的那個！`);
  ans.querySelector(`.ans[data-v="${q.answer}"]`)?.classList.add('glowme');
}

function result(first, total, gain) {
  const stars = first >= total - 1 ? 3 : first >= total - 3 ? 2 : 1;
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="rbox"><h2>任務完成！</h2>
    <div class="rstars">${[1, 2, 3].map((i) => `<span class="${i <= stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">⭐</span>`).join('')}</div>
    <div class="rline">一次就答對 <b>${first}</b> / ${total} 題</div>
    <div class="rxp">經驗值 <b>+${gain}</b></div>
    <button class="bigbtn" id="rok">繼續 ▶</button></div>`;
  stage.appendChild(ov);
  confetti(); sfx.fanfare();
  speak(`任務完成！得到${gain}點經驗值！`);
  return new Promise((r) => { ov.querySelector('#rok').onclick = () => { sfx.tap(); ov.remove(); r(); }; });
}

// =====================================================================
//  升級：選卡 → 戰鬥 → 升級/進化動畫
// =====================================================================
async function levelUps(w, chk) {
  const id = state.current, ch = cur();
  while (ch.xp >= xpNeed(ch.level)) {
    const newLv = ch.level + 1, evo = isEvoLevel(newLv);
    const card = await w(chooseCard(id, ch, newLv, evo));
    await w(battle(id, ch, evo));
    // 套用
    const before = { level: ch.level, up: { ...ch.up } };
    ch.xp -= xpNeed(ch.level); ch.level = newLv;
    if (!evo) ch.up[card.id] = (ch.up[card.id] || 0) + 1;
    save();
    await w(transform(id, before, ch, evo, card));
  }
  showHome();
}

function chooseCard(id, ch, newLv, evo) {
  return new Promise((resolve) => {
    let html;
    if (evo) {
      const nf = LINES[id].forms[formOf(newLv)];
      html = `<h2 class="c-title gold">🌟 進化的時刻到了！</h2>
        <div class="cards"><button class="card goldcard" data-i="0"><div class="shine"></div><div class="c-icon">🌟</div><div class="c-name">超進化</div>
        <div class="c-sil">${charSVG(id, { level: newLv, up: {} }, { fit: true })}</div><div class="c-desc">變身成更強的「？？？」</div></button></div>`;
      speak('哇！出現金色進化卡了！點它就可以進化！');
    } else {
      const opts = drawCards(id);
      html = `<h2 class="c-title">升到 Lv.${newLv}！選一張升級卡</h2><div class="cards">` + opts.map((u, i) => {
        const lv = (ch.up[u.id] || 0) + 1;
        return `<button class="card" data-i="${i}" style="--c:${u.color};animation-delay:${i * 0.12}s"><div class="c-icon">${u.icon}</div><div class="c-name">${u.name}</div>
          <div class="c-pips">${Array.from({ length: u.max }, (_, k) => `<i class="${k < lv ? 'on' : ''}"></i>`).join('')}</div><div class="c-desc">${u.desc[lv - 1]}</div></button>`;
      }).join('') + `</div>`;
      chooseCard.opts = opts;
      speak(`升級了！選一張你喜歡的升級卡！`);
    }
    screen('cards', `<div class="bg dim2">${sceneSVG(id)}</div>${html}`);
    sfx.levelup();
    stage.querySelectorAll('.card').forEach((c) => {
      c.onclick = () => {
        sfx.card();
        stage.querySelectorAll('.card').forEach((o) => o.classList.add(o === c ? 'chosen' : 'fade'));
        const u = evo ? { id: 'evo', name: '超進化' } : chooseCard.opts[+c.dataset.i];
        if (!evo) speak(u.name);
        setTimeout(() => resolve(u), 900);
      };
    });
  });
}

function battle(id, ch, evo) {
  return new Promise((resolve) => {
    const m = evo ? pick(BOSSES) : pick(MONSTERS), maxHp = evo ? 5 : 3;
    let hp = maxHp, busy = false;
    const fx = ['💥', ...(ch.up.fire ? ['🔥'] : []), ...(ch.up.ice ? ['❄️'] : []), ...(ch.up.thunder ? ['⚡'] : [])];
    screen('battle', `<div class="bg">${battleScene()}</div>
      <div class="b-title">${evo ? '⚠️ 魔王出現：' : '出現了 '}<b>${m.name}</b>！</div>
      <div class="hpwrap"><span>${m.name}</span><div class="hpbar"><i id="hp"></i></div></div>
      <div class="b-hero" id="bhero">${charSVG(id, ch, { fit: true })}</div>
      <div class="b-mon ${evo ? 'boss' : ''}" id="bmon">${monsterSVG(m, evo)}</div>
      <button class="bigbtn atk" id="atk">⚔️ 攻擊！</button>`);
    speak(evo ? `小心！${m.name}出現了！快打倒牠！` : `出現了${m.name}！按攻擊打倒牠！`);
    const hero = $('#bhero'), mon = $('#bmon'), btn = $('#atk');
    btn.onclick = async () => {
      if (busy || hp <= 0) return;
      busy = true; btn.disabled = true;
      sfx.swing();
      hero.classList.add('lunge');
      await sleep(260);
      sfx.hit(); hp--;
      $('#hp').style.width = `${(hp / maxHp) * 100}%`;
      mon.classList.add('hit');
      const d = document.createElement('span');
      d.className = 'dmg'; d.textContent = `${pick(fx)} -${10 + Math.floor(Math.random() * 20) + power(ch)}`;
      mon.appendChild(d);
      setTimeout(() => d.remove(), 900);
      burst(760, 380, pick(fx), 6);
      await sleep(380);
      hero.classList.remove('lunge'); mon.classList.remove('hit');
      if (hp > 0) { busy = false; btn.disabled = false; return; }
      sfx.defeat();
      mon.classList.add('defeated');
      btn.style.visibility = 'hidden';
      $('.b-title').innerHTML = '🎉 <b>勝利！</b>';
      confetti(30);
      hero.classList.add('jump');
      await speak(`打倒${m.name}了！你贏了！`);
      await sleep(500);
      resolve();
    };
  });
}

function transform(id, before, ch, evo, card) {
  return new Promise((resolve) => {
    const name = formName(id, ch.level);
    screen('transform', `<div class="bg dim2">${sceneSVG(id)}</div><div class="rays ${evo ? 'big' : ''}"></div>
      <div class="x-title">${evo ? '進化中…' : '力量湧出來了…'}</div>
      <div class="x-hero charging ${evo ? 'evo' : ''}" id="xhero">${charSVG(id, before, { fit: "form" })}</div>
      <div class="flash" id="flash"></div>
      <div class="x-info" id="xinfo"></div>`);
    sfx.charge();
    (async () => {
      await sleep(evo ? 2400 : 1300);
      $('#flash').classList.add('go');
      evo ? sfx.evolve() : sfx.levelup();
      await sleep(280);
      const h = $('#xhero');
      h.className = 'x-hero reveal';
      h.innerHTML = charSVG(id, ch, { fit: "form" });
      confetti(evo ? 80 : 40);
      $('.x-title').textContent = evo ? '進化成功！' : `Lv.${ch.level}！`;
      const info = $('#xinfo');
      if (evo) {
        info.innerHTML = `<div class="x-name gold">${name}</div><div class="x-desc">戰力大提升！⚡ ${power(ch)}</div><button class="bigbtn gold" id="xok">太酷了！▶</button>`;
        speak(`進化成功！變成${name}了！`);
      } else {
        const lv = ch.up[card.id];
        info.innerHTML = `<div class="x-name">${card.icon} ${card.name} <small>Lv.${lv}</small></div><div class="x-desc">${card.desc[lv - 1]}</div><button class="bigbtn" id="xok">太棒了！▶</button>`;
        speak(`${card.name}！${card.desc[lv - 1]}`);
      }
      info.classList.add('show');
      $('#xok').onclick = () => { sfx.tap(); resolve(); };
    })();
  });
}

// ---- 啟動 ----
load();
fit();
showTitle();
// 開發除錯用
window.__game = { state, save, showHome, showSelect, levelUps: () => flow(levelUps), mission: () => flow(mission), cur };
