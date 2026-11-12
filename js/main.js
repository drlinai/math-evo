import { state, load, save, CHAR_IDS, xpNeed, isEvoLevel, formName, drawCards, power, UPGRADES, upInfo, resetChar, chooseLang } from './state.js?v=8';
import { charSVG, MONSTERS, BOSSES, monsterSVG, sceneSVG, battleScene, preloadArt } from './sprites.js?v=8';
import { speak, stopSpeak, sfx, unlockAudio, toggleMusic, voiceInfo, resetVoiceProbe } from './audio.js?v=8';
import { pickStages } from './questions.js?v=8';
import { t, getLang, num, monsterName, stageTitle } from './i18n.js?v=8';

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
// 語音唸完之前先鎖住按鈕，避免還沒講完就被切到下一頁
function gate(el, promise) {
  if (!el) return;
  el.classList.add('locked');
  promise.then(() => el.classList.remove('locked'));
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
    <h1 class="logo"><span>${t('title1')}</span><span class="l2">${t('title2')}</span></h1>
    <div class="t-row">${babies}</div>
    <button class="bigbtn" id="go">${t('start')}</button>
    <div class="t-tools"><button class="rbtn" id="lg" aria-label="language">🌐</button><button class="rbtn" id="fs">⛶</button></div>`);
  $('#go').onclick = () => {
    unlockAudio(); sfx.fanfare();
    state.current ? showHome() : showSelect();
  };
  $('#fs').onclick = toggleFS;
  $('#lg').onclick = () => { sfx.tap(); chooseLang(getLang() === 'en' ? 'zh' : 'en'); showTitle(); };
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
  screen('select', `<div class="bg title-bg"></div><div class="stars"></div><h2 class="sel-title">${t('pick')}</h2><div class="sel-row" id="selrow">${cards}</div>`);
  speak(t('pickSay'));
  let picked = false;
  stage.querySelectorAll('.sel-card').forEach((b) => {
    b.onclick = async () => {
      if (picked) return;
      picked = true;
      const my = run;
      sfx.star();
      state.current = b.dataset.id; save();
      b.classList.add('picked');
      await speak(t('go', formName(state.current, cur().level)));
      await sleep(400);
      if (my === run) showHome();
    };
  });
}

// =====================================================================
//  主畫面
// =====================================================================
function showHome() {
  run++;
  const id = state.current, ch = cur(), need = xpNeed(ch.level), pending = ch.xp >= need;
  const badges = UPGRADES.filter((u) => ch.up[u.id]).map((u) => { const i = upInfo(u, id, ch.up[u.id]); return `<span class="badge" style="--c:${u.color}">${i.icon}<b>${ch.up[u.id]}</b></span>`; }).join('');
  const nextEvo = ch.level < 15 ? t('evoIn', 5 - (ch.level % 5)) : t('finalForm');
  screen('home', `<div class="bg">${sceneSVG(id)}</div>
    <div class="topbar"><button class="rbtn" id="sw">🔄<small>${t('sw')}</small></button><span class="grow"></span>
      <button class="rbtn" id="mu">${state.settings.music ? '🎵' : '🔇'}</button><button class="rbtn" id="fs">⛶</button><button class="rbtn" id="st">⚙️</button></div>
    <div class="plate"><div class="lv">Lv.<b>${ch.level}</b></div><div class="nm">${formName(id, ch.level)}</div>
      <div class="xpbar"><i style="width:${Math.min(100, (ch.xp / need) * 100)}%"></i><span>${Math.min(ch.xp, need)} / ${need}</span></div>
      <div class="sub"><span>⚡ ${t('power')} <b>${power(ch)}</b></span><span>🌟 ${nextEvo}</span></div></div>
    <div class="badges">${badges}</div>
    <div class="hero" id="hero">${charSVG(id, ch)}</div>
    <button class="bigbtn ${pending ? 'gold' : ''}" id="start">${pending ? t('levelup') : t('mission')}</button>`);
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
  const L = getLang();
  m.innerHTML = `<div class="mbox"><h3>${t('settings')}</h3>
    <div class="mrow"><span>${t('langLabel')}</span><button class="mbtn half ${L === 'zh' ? 'sel' : ''}" data-l="zh">繁體中文</button><button class="mbtn half ${L === 'en' ? 'sel' : ''}" data-l="en">English</button></div>
    <button class="mbtn" id="vo">${t('voice', state.settings.voice)}</button>
    <button class="mbtn" id="tv">${t('testVoice')}</button><div class="mnote" id="tvr">${t('voiceTip')}</div>
    <button class="mbtn danger" id="rs">${t('reset')}</button>
    <button class="mbtn ok" id="cl">${t('close')}</button></div>`;
  stage.appendChild(m);
  m.querySelectorAll('[data-l]').forEach((b) => { b.onclick = () => { sfx.tap(); chooseLang(b.dataset.l); showHome(); showSettings(); }; });
  m.querySelector('#vo').onclick = (e) => { state.settings.voice = !state.settings.voice; save(); e.currentTarget.textContent = t('voice', state.settings.voice); };
  m.querySelector('#tv').onclick = async () => {
    unlockAudio(); resetVoiceProbe();
    const was = state.settings.voice; state.settings.voice = true;
    const r = m.querySelector('#tvr'); r.textContent = '…';
    await speak(t('testSay'));
    state.settings.voice = was;
    const info = voiceInfo();
    const vn = info[getLang()];
    r.textContent = (info.started ? t('voiceOk') : t('voiceBad')) + (vn ? ` · ${vn}` : '');
  };
  let armed = false;
  m.querySelector('#rs').onclick = (e) => {
    if (!armed) { armed = true; e.currentTarget.textContent = t('resetConfirm'); return; }
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
    const st = plan[si], title = stageTitle(st.id);
    stage.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('on', i === si));
    $('#ptext').innerHTML = ''; $('#qscene').innerHTML = ''; $('#qscene').removeAttribute('data-bg'); $('#answers').innerHTML = '';
    await w(banner(t('stageN', si + 1), `${st.icon} ${title}`, t('stageSay', si + 1, title)));
    for (let qi = 0; qi < PER_STAGE; qi++) {
      $('#pips').innerHTML = Array.from({ length: PER_STAGE }, (_, k) => `<i class="${k < qi ? 'done' : k === qi ? 'now' : ''}"></i>`).join('');
      const q = st.gen(ch.level, qi);
      const ok1 = await w(ask(q));
      total++; if (ok1) first++;
    }
    stage.querySelectorAll('.sdot')[si].classList.add('done');
    sfx.star();
    await w(sleep(500));
  }
  // 結算
  const gain = first * 18 + (total - first) * 9 + 46; // 每組 6 題：全對 154、最少 100（Lv.1 一組必升級）
  ch.xp += gain; ch.missions++; save();
  await w(result(first, total, gain));
  if (ch.xp >= xpNeed(ch.level)) await levelUps(w, chk); else showHome();
}

async function banner(top, main, say) {
  const b = $('#banner');
  b.innerHTML = `<small>${top}</small><b>${main}</b>`;
  b.classList.add('show');
  sfx.card();
  await Promise.all([speak(say), sleep(1600)]); // 等語音唸完（至少停 1.6 秒）
  b.classList.remove('show');
  await sleep(350);
}

function ask(q) {
  return new Promise((resolve) => {
    const scene = $('#qscene'), ans = $('#answers'), mini = $('#mini');
    let tries = 0, locked = false;
    $('#ptext').innerHTML = q.prompt;
    scene.className = 'qscene';
    q.render(scene, { priceTag: t('priceTag', q.answer), trayLabel: t('trayLabel'), walletLabel: t('walletLabel') });
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
      await speak(`${pick(t('praise'))} ${q.eqSay}`); // 等「答對了＋算式」唸完
      await sleep(900);
      eq.classList.remove('show');
      await sleep(350);
      resolve(tries === 0);
    };

    if (q.type === 'pay') {
      ans.innerHTML = `<button class="ans paybtn" id="payok">${t('pay')}</button>`;
      const tray = scene.querySelector('.traycoins'), wallet = scene.querySelector('.walletcoins'), sumEl = scene.querySelector('.traysum');
      const sum = () => [...tray.children].reduce((a, c) => a + +c.dataset.v, 0);
      scene.onclick = (e) => {
        const c = e.target.closest('.coin');
        if (!c || locked) return;
        sfx.coin();
        (c.parentElement === wallet ? tray : wallet).appendChild(c);
        if (tries > 0) sumEl.textContent = t('traySum', sum());
      };
      $('#payok').onclick = () => {
        if (locked) return;
        const s = sum();
        if (s === q.answer) { scene.onclick = null; win($('#payok')); return; }
        tries++; sfx.wrong();
        sumEl.textContent = t('traySum', s);
        scene.classList.add('shake'); setTimeout(() => scene.classList.remove('shake'), 400);
        if (tries === 1) speak(s < q.answer ? t('payLow', s, q.answer) : t('payHigh', s, q.answer));
        else speak(t('tryIt', q.payHint));
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
  q.onHint?.(scene);
  const els = q.countEls(scene);
  let acc = 0;
  els.forEach((el) => { acc += +(el.dataset.v || 1); el.querySelector('b').textContent = acc; el.classList.add('numbered'); });
  if (tries === 1) { speak(t('hint1')); return; }
  if (tries === 2) {
    const vals = []; acc = 0;
    els.forEach((el, i) => { acc += +(el.dataset.v || 1); vals.push(num(acc)); setTimeout(() => { el.classList.add('count'); sfx.pop(); }, 500 + i * 520); });
    speak(t('hint2', vals), { rate: 0.78 });
    return;
  }
  speak(t('hint3', q.answer));
  ans.querySelector(`.ans[data-v="${q.answer}"]`)?.classList.add('glowme');
}

function result(first, total, gain) {
  const stars = first >= total - 1 ? 3 : first >= total - 3 ? 2 : 1;
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="rbox"><h2>${t('done')}</h2>
    <div class="rstars">${[1, 2, 3].map((i) => `<span class="${i <= stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">⭐</span>`).join('')}</div>
    <div class="rline">${t('firstTry', first, total)}</div>
    <div class="rxp">${t('xp')} <b>+${gain}</b></div>
    <button class="bigbtn" id="rok">${t('cont')}</button></div>`;
  stage.appendChild(ov);
  confetti(); sfx.fanfare();
  gate(ov.querySelector('#rok'), speak(t('doneSay', gain)));
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
    let html, opts = [], intro;
    if (evo) {
      html = `<h2 class="c-title gold">${t('evoTitle')}</h2>
        <div class="cards" id="cards"><button class="card goldcard" data-i="0"><div class="shine"></div><div class="c-icon">🌟</div><div class="c-name">${t('evoName')}</div>
        <div class="c-sil">${charSVG(id, { level: newLv, up: {} }, { fit: true })}</div><div class="c-desc">${t('evoDesc')}</div></button></div>`;
      intro = t('evoSay');
    } else {
      opts = drawCards(id);
      html = `<h2 class="c-title">${t('cardTitle', newLv)}</h2><div class="cards" id="cards">` + opts.map((u, i) => {
        const lv = (ch.up[u.id] || 0) + 1;
        return `<button class="card" data-i="${i}" style="--c:${u.color};animation-delay:${i * 0.12}s"><div class="c-icon">${u.icon}</div><div class="c-name">${u.name}</div>
          <div class="c-pips">${Array.from({ length: u.max }, (_, k) => `<i class="${k < lv ? 'on' : ''}"></i>`).join('')}</div><div class="c-desc">${u.desc[lv - 1]}</div></button>`;
      }).join('') + `</div>`;
      intro = t('cardSay');
    }
    screen('cards', `<div class="bg dim2">${sceneSVG(id)}</div>${html}`);
    sfx.levelup();
    gate($('#cards'), speak(intro)); // 說明唸完才能選
    let chosen = false;
    stage.querySelectorAll('.card').forEach((c) => {
      c.onclick = async () => {
        if (chosen) return;
        chosen = true;
        sfx.card();
        stage.querySelectorAll('.card').forEach((o) => o.classList.add(o === c ? 'chosen' : 'fade'));
        const u = evo ? { id: 'evo', name: t('evoName') } : opts[+c.dataset.i];
        await Promise.all([speak(u.name), sleep(1000)]);
        await sleep(400);
        resolve(u);
      };
    });
  });
}

function battle(id, ch, evo) {
  return new Promise((resolve) => {
    const m = evo ? pick(BOSSES) : pick(MONSTERS), maxHp = evo ? 5 : 3, name = monsterName(m.id);
    let hp = maxHp, busy = false;
    const fx = ['💥', ...(ch.up.fire ? ['🔥'] : []), ...(ch.up.ice ? ['❄️'] : []), ...(ch.up.thunder ? ['⚡'] : [])];
    screen('battle', `<div class="bg">${battleScene()}</div>
      <div class="b-title">${evo ? t('bossAppear', name) : t('appear', name)}</div>
      <div class="hpwrap"><span>${name}</span><div class="hpbar"><i id="hp"></i></div></div>
      <div class="b-hero" id="bhero">${charSVG(id, ch, { fit: true })}</div>
      <div class="b-mon ${evo ? 'boss' : ''}" id="bmon">${monsterSVG(m, evo)}</div>
      <button class="bigbtn atk" id="atk">${t('attack')}</button>`);
    const hero = $('#bhero'), mon = $('#bmon'), btn = $('#atk');
    gate(btn, speak(evo ? t('bossSay', name) : t('appearSay', name))); // 介紹唸完才能攻擊
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
      await sleep(480);
      hero.classList.remove('lunge'); mon.classList.remove('hit');
      if (hp > 0) { busy = false; btn.disabled = false; return; }
      sfx.defeat();
      mon.classList.add('defeated');
      btn.style.visibility = 'hidden';
      $('.b-title').innerHTML = t('victory');
      confetti(30);
      hero.classList.add('jump');
      await speak(t('winSay', name)); // 等勝利台詞唸完
      await sleep(900);
      resolve();
    };
  });
}

function transform(id, before, ch, evo, card) {
  return new Promise((resolve) => {
    const name = formName(id, ch.level);
    screen('transform', `<div class="bg dim2">${sceneSVG(id)}</div><div class="rays ${evo ? 'big' : ''}"></div>
      <div class="x-title">${evo ? t('evolving') : t('rising')}</div>
      <div class="x-hero charging ${evo ? 'evo' : ''}" id="xhero">${charSVG(id, before, { fit: 'form' })}</div>
      <div class="flash" id="flash"></div>
      <div class="x-info" id="xinfo"></div>`);
    sfx.charge();
    (async () => {
      await sleep(evo ? 2600 : 1600);
      $('#flash').classList.add('go');
      evo ? sfx.evolve() : sfx.levelup();
      await sleep(280);
      const h = $('#xhero');
      h.className = 'x-hero reveal';
      h.innerHTML = charSVG(id, ch, { fit: 'form' });
      confetti(evo ? 80 : 40);
      $('.x-title').textContent = evo ? t('evoDone') : `Lv.${ch.level}！`;
      const info = $('#xinfo');
      let say;
      if (evo) {
        info.innerHTML = `<div class="x-name gold">${name}</div><div class="x-desc">${t('powerUp', power(ch))}</div><button class="bigbtn gold" id="xok">${t('cool')}</button>`;
        say = t('evoDoneSay', name);
      } else {
        const lv = ch.up[card.id];
        info.innerHTML = `<div class="x-name">${card.icon} ${card.name} <small>Lv.${lv}</small></div><div class="x-desc">${card.desc[lv - 1]}</div><button class="bigbtn" id="xok">${t('great')}</button>`;
        say = `${card.name}! ${card.desc[lv - 1]}`;
      }
      info.classList.add('show');
      gate($('#xok'), speak(say)); // 唸完才能按下一步
      $('#xok').onclick = () => { sfx.tap(); resolve(); };
    })();
  });
}

// ---- 啟動 ----
load();
preloadArt();
fit();
showTitle();
// 開發除錯用
window.__game = { state, save, showHome, showSelect, showTitle, chooseLang, levelUps: () => flow(levelUps), mission: () => flow(mission), cur };
