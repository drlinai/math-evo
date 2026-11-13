import { state, load, save, CHAR_IDS, xpNeed, isEvoLevel, formName, drawCards, power, UPGRADES, upInfo, resetChar, chooseLang } from './state.js?v=21';
import { charSVG, MONSTERS, BOSSES, monsterSVG, sceneSVG, battleScene, preloadArt } from './sprites.js?v=21';
import { speak, stopSpeak, sfx, unlockAudio, toggleMusic, voiceInfo, resetVoiceProbe } from './audio.js?v=21';
import { GRADES, ALL, gradeOf, progressOf, planMission, NEED } from './q/index.js?v=21';
import { t, getLang, monsterName } from './i18n.js?v=21';

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
const gradeName = (g) => (getLang() === 'en' ? g.en : g.zh);
function showTitle() {
  run++;
  if (!gradeOf(state.grade)) state.grade = null;
  const babies = CHAR_IDS.map((id, i) => `<div class="t-char" style="animation-delay:${-i * 0.3}s">${charSVG(id, { level: 1, up: {} }, { fit: true })}</div>`).join('');
  const grades = GRADES.map((g) => { const p = progressOf(state.prog, g.id); return `<button class="gbtn ${state.grade === g.id ? 'sel' : ''}" data-g="${g.id}">${gradeName(g)}<small>${t('learned', p.pct)}</small><i style="width:${p.pct}%"></i></button>`; }).join('');
  screen('title', `<div class="bg title-bg"></div><div class="stars"></div>
    <h1 class="logo"><span>${t('title1')}</span><span class="l2">${t('title2')}</span></h1>
    <div class="t-row">${babies}</div>
    <div class="gbox" id="gbox"><h3>${t('pickGrade')}</h3><div class="grades">${grades}</div></div>
    <button class="bigbtn ${state.grade ? '' : 'need'}" id="go">${t('start')}</button>
    <div class="t-tools"><button class="rbtn" id="lg" aria-label="language">🌐</button><button class="rbtn" id="fs">⛶</button></div>`);
  // 一定要先選年級，才能開始冒險（選過的會記住）
  stage.querySelectorAll('.gbtn').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      state.grade = b.dataset.g; save();
      stage.querySelectorAll('.gbtn').forEach((o) => o.classList.toggle('sel', o === b));
      $('#go').classList.remove('need'); $('#gbox').classList.remove('need');
    };
  });
  $('#go').onclick = () => {
    unlockAudio();
    if (!state.grade) {
      sfx.wrong(); speak(t('pickGradeSay'));
      const g = $('#gbox'); g.classList.remove('need'); void g.offsetWidth; g.classList.add('need');
      return;
    }
    sfx.fanfare();
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
  const grade = gradeOf(state.grade);
  if (!grade) { showTitle(); return; }
  screen('home', `<div class="bg">${sceneSVG(id)}</div>
    <div class="topbar"><button class="rbtn" id="sw">🔄<small>${t('sw')}</small></button><span class="grow"></span>
      <button class="rbtn" id="mu">${state.settings.music ? '🎵' : '🔇'}</button><button class="rbtn" id="fs">⛶</button><button class="rbtn" id="st">⚙️</button></div>
    <div class="plate"><div class="lv">Lv.<b>${ch.level}</b></div><div class="nm">${formName(id, ch.level)}</div>
      <div class="xpbar"><i style="width:${Math.min(100, (ch.xp / need) * 100)}%"></i><span>${Math.min(ch.xp, need)} / ${need}</span></div>
      <div class="sub"><span>⚡ ${t('power')} <b>${power(ch)}</b></span><span>🌟 ${nextEvo}</span></div></div>
    <button class="gchip" id="gr">📚 ${t('gradeProg', gradeName(grade), progressOf(state.prog, grade.id).pct)}</button>
    <div class="badges">${badges}</div>
    <div class="hero" id="hero">${charSVG(id, ch)}</div>
    <button class="bigbtn ${pending ? 'gold' : ''}" id="start">${pending ? t('levelup') : t('mission')}</button>`);
  $('#sw').onclick = () => { sfx.tap(); showSelect(); };
  $('#gr').onclick = () => { sfx.tap(); showTitle(); };
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
    <button class="mbtn" id="dm">${t('demoBtn')}</button>
    <button class="mbtn danger" id="rs">${t('reset')}</button>
    <button class="mbtn ok" id="cl">${t('close')}</button></div>`;
  stage.appendChild(m);
  m.querySelector('#dm').onclick = () => { unlockAudio(); sfx.tap(); showDemo(state.demoAt); };
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
//  任務：3 關 × 每關 PER_STAGE 題；題型由年級的學習進度決定（js/q/index.js）
// =====================================================================
const PER_STAGE = 2; // 每關題數
async function mission(w, chk) {
  const id = state.current, ch = cur(), grade = gradeOf(state.grade);
  if (!grade) { showTitle(); return; }
  const plan = planMission(state.prog, grade.id), before = progressOf(state.prog, grade.id).pct;
  let first = 0, total = 0;
  screen('mission', `<div class="bg dim">${sceneSVG(id)}</div>
    <div class="mtop"><button class="rbtn" id="quit">🏠</button>
      <div class="stages">${plan.map((s, i) => `<span class="sdot" data-i="${i}">${s.type.topic[2]}</span>`).join('<i class="sline"></i>')}</div>
      <div class="pips" id="pips"></div></div>
    <div class="prompt"><button class="rbtn spk" id="spk">🔊</button><div id="ptext"></div></div>
    <div class="qscene" id="qscene"></div>
    <div class="answers" id="answers"></div>
    <div class="mini" id="mini">${charSVG(id, ch, { fit: true })}</div>
    <div class="eq" id="eq"></div><div class="banner" id="banner"></div>`);
  $('#quit').onclick = () => { sfx.tap(); showHome(); };

  for (let si = 0; si < plan.length; si++) {
    const st = plan[si], tp = st.type, title = getLang() === 'en' ? tp.en : tp.zh;
    stage.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('on', i === si));
    $('#ptext').innerHTML = ''; $('#qscene').innerHTML = ''; $('#qscene').className = 'qscene'; $('#qscene').dataset.bg = 'plain'; $('#answers').innerHTML = '';
    const mode = t(st.mode === 'new' ? 'modeNew' : st.mode === 'bonus' ? 'modeBonus' : 'modeReview');
    await w(banner(`${t('stageN', si + 1)}　${mode}`, `${tp.topic[2]} ${title}`, t('stageSay', si + 1, title)));
    for (let qi = 0; qi < PER_STAGE; qi++) {
      $('#pips').innerHTML = Array.from({ length: PER_STAGE }, (_, k) => `<i class="${k < qi ? 'done' : k === qi ? 'now' : ''}"></i>`).join('');
      const seen = state.prog[grade.id]?.[tp.id] || 0;
      let q;
      try { q = tp.gen(st.mode === 'new' ? Math.min(seen, 1) : 2); } catch (e) { console.error('題型出錯', tp.id, e); continue; }
      if (tp.bonus) q.prompt = `<span class="bonustag">${t('bonusTag')}</span>${q.prompt}`;
      const ok1 = await w(ask(q));
      total++;
      if (ok1) {
        first++;
        // 第一次就答對才算練到；複習關不影響進度
        if (st.mode !== 'review') { (state.prog[grade.id] ||= {})[tp.id] = Math.min(NEED, seen + 1); save(); }
      }
    }
    stage.querySelectorAll('.sdot')[si].classList.add('done');
    sfx.star();
    await w(sleep(500));
  }
  // 結算
  const gain = first * 18 + (total - first) * 9 + 46; // 每組 6 題：全對 154、最少 100（Lv.1 一組必升級）
  ch.xp += gain; ch.missions++; save();
  const now = progressOf(state.prog, grade.id).pct;
  await w(result(first, total, gain, { name: gradeName(grade), pct: now, justDone: now === 100 && before < 100 }));
  if (ch.xp >= xpNeed(ch.level)) await levelUps(w, chk); else showHome();
}

// =====================================================================
//  題型測試（家長用）：照總編號 1~N 一個題型出一題，答對自動跳下一個題型。
//  進入方式：設定 →「題型測試」，或網址加上 ?demo（?demo=120 從第 120 號開始）
// =====================================================================
let demoD = 1; // 測試時用的難度：0 第一次碰到、1 練過、2 複習（完整範圍）
function showDemo(n) {
  n = Math.max(1, Math.min(ALL.length, Math.round(+n) || 1));
  state.demoAt = n; save();
  flow(async (w) => {
    const { grade, type: tp, nth } = ALL[n - 1], en = getLang() === 'en', id = state.current || 'dino';
    screen('mission', `<div class="bg dim">${sceneSVG(id)}</div>
      <div class="mtop demo"><button class="rbtn" id="quit">🏠</button>
        <div class="dno"><b>#${n}</b><small>/ ${ALL.length}</small></div>
        <div class="dinfo"><span>${t('demoNth', gradeName(grade), nth)}</span><b>${tp.topic[2]} ${en ? tp.topic[1] : tp.topic[0]}：${en ? tp.en : tp.zh}</b></div>
        <button class="dbtn" id="dprev">◀</button><button class="dbtn" id="dre">🔁</button><button class="dbtn" id="dnext">▶</button>
        <input class="dinput" id="dnum" type="number" inputmode="numeric" min="1" max="${ALL.length}" placeholder="#"><button class="dbtn wide" id="dgo">${t('demoGo')}</button>
        <button class="dbtn wide" id="dd">${t('demoD', demoD)}</button><button class="dbtn" id="dlang">🌐</button></div>
      <div class="prompt"><button class="rbtn spk" id="spk">🔊</button><div id="ptext"></div></div>
      <div class="qscene" id="qscene"></div><div class="answers" id="answers"></div>
      <div class="mini" id="mini">${charSVG(id, state.chars[id], { fit: true })}</div><div class="eq" id="eq"></div><div class="banner" id="banner"></div>`);
    $('#quit').onclick = () => { sfx.tap(); state.current && gradeOf(state.grade) ? showHome() : showTitle(); };
    $('#dprev').onclick = () => { sfx.tap(); showDemo(n - 1); };
    $('#dnext').onclick = () => { sfx.tap(); showDemo(n + 1); };
    $('#dre').onclick = () => { sfx.tap(); showDemo(n); };
    const go = () => { const v = +$('#dnum').value; if (v >= 1) { sfx.tap(); showDemo(v); } };
    $('#dgo').onclick = go;
    $('#dnum').onkeydown = (e) => { if (e.key === 'Enter') go(); };
    $('#dd').onclick = () => { sfx.tap(); demoD = (demoD + 1) % 3; showDemo(n); };
    $('#dlang').onclick = () => { sfx.tap(); chooseLang(en ? 'zh' : 'en'); showDemo(n); };
    let q;
    try { q = tp.gen(demoD); } catch (e) { console.error('題型出錯', n, tp.id, e); $('#ptext').textContent = `#${n} error: ${e.message}`; return; }
    if (tp.bonus) q.prompt = `<span class="bonustag">${t('bonusTag')}</span>${q.prompt}`;
    await w(ask(q));
    if (n < ALL.length) { showDemo(n + 1); return; }
    $('#ptext').textContent = t('demoDone', ALL.length); $('#qscene').innerHTML = ''; $('#answers').innerHTML = ''; confetti(80); sfx.fanfare();
  });
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

// 把 HTML 變成可以唸的文字
const plain = (h) => String(h).replace(/<[^>]*>/g, ' ').replace(/[✔✘]/g, '').replace(/\s+/g, ' ').trim();

// 出一題、等小朋友答對。回傳「是不是第一次就答對」。
// 題目物件的格式見 js/q/core.js；這裡負責六種作答方式與答錯時的提示。
function ask(q) {
  return new Promise((resolve) => {
    const scene = $('#qscene'), ans = $('#answers'), mini = $('#mini'), pt = $('#ptext');
    let tries = 0, locked = false;
    if (window.__game) window.__game.q = q; // 除錯用：目前這一題
    pt.innerHTML = q.prompt;
    scene.className = `qscene${q.stack ? ' stack' : ''}`;
    scene.dataset.bg = q.bg;
    scene.innerHTML = `<div class="fit">${q.scene}</div>`;
    // 題目文字太長就縮小字級，直到不會蓋到題目區
    const box = pt.parentElement;
    for (const c of ['', 'f2', 'f3', 'f4']) { pt.className = c; if (box.offsetTop + box.offsetHeight <= scene.offsetTop - 8) break; }
    // 題目區的圖比框大時，整個等比例縮小到放得下
    //（圖比框小很多時也稍微放大，小朋友比較看得清楚；卡片題不放大）
    const fitBox = scene.firstElementChild, k = Math.min((scene.clientWidth - 20) / fitBox.offsetWidth, (scene.clientHeight - 12) / fitBox.offsetHeight);
    const big = fitBox.querySelector('.taps, .collect, .numq') ? 1 : Math.min(1.45, k * 0.86);
    if (k < 0.995) fitBox.style.zoom = k.toFixed(3); else if (big > 1.08) fitBox.style.zoom = big.toFixed(3);
    scene.onclick = null; ans.onclick = null; ans.className = 'answers'; ans.innerHTML = '';
    // 唸題目；「數聲音」的題目唸完後再敲 q.beats 下
    let playing = 0;
    const play = async () => {
      const my = ++playing, r = run;
      await speak(q.say);
      for (let i = 0; i < q.beats && my === playing && r === run && !locked; i++) {
        await sleep(i ? 620 : 350);
        if (my !== playing || r !== run || locked) break;
        sfx.hit();
        const d = scene.querySelector('.beat'); if (d) { d.classList.remove('jump'); void d.offsetWidth; d.classList.add('jump'); }
      }
    };
    play();
    $('#spk').onclick = play;

    const win = async (el) => {
      locked = true;
      el?.classList.add('ok');
      sfx.correct();
      mini.classList.remove('jump'); void mini.offsetWidth; mini.classList.add('jump');
      burst(512, 360, '⭐', 10);
      const eq = $('#eq'), full = q.full ?? '✔', len = plain(full).length;
      eq.innerHTML = full;
      eq.className = `eq show ${len > 26 ? 'xs' : len > 15 ? 's' : len > 9 ? 'm' : ''}`;
      await speak(`${pick(t('praise'))} ${q.fullSay || ''}`); // 等「答對了＋完整句子」唸完
      await sleep(900);
      eq.classList.remove('show');
      await sleep(350);
      resolve(tries === 0);
    };
    // 答錯不懲罰：第 1 次給提示（需要的話幫忙標數字），第 2 次鼓勵，第 3 次直接亮出答案。回傳 true 表示該亮答案了
    const miss = (say) => {
      tries++; sfx.wrong();
      if (q.count) { let n = 0; scene.querySelectorAll(q.count).forEach((el) => { const b = el.querySelector('b'); if (b) { b.textContent = ++n; el.classList.add('numbered'); } }); }
      if (tries >= 3) return true;
      speak(say || (tries === 1 ? q.hint || t('tryAgain') : t('tryAgain2')));
      return false;
    };
    const okBtn = () => { ans.innerHTML = `<button class="ans okbtn" id="okb">${t('ok')}</button>`; return $('#okb'); };

    // ---- 單選：下方按鈕 或 題目區的大卡片 ----
    if (q.kind === 'choice' || q.kind === 'tap') {
      const box = q.kind === 'choice' ? ans : scene, sel = q.kind === 'choice' ? '.ans' : '.tapcard';
      if (q.kind === 'choice') {
        ans.classList.add(`n${q.opts.length}`);
        ans.innerHTML = q.opts.map((o) => `<button class="ans ${q.cls}" data-v="${o.v}">${o.h}</button>`).join('');
      }
      box.onclick = (e) => {
        const b = e.target.closest(sel);
        if (!b || locked || b.disabled) return;
        if (b.dataset.v === q.ans) { win(b); return; }
        b.classList.add('no'); b.disabled = true;
        const right = box.querySelector(`${sel}[data-v="${q.ans}"]`), left = [...box.querySelectorAll(sel)].filter((x) => !x.disabled).length;
        if (miss() || left <= 1) { right.classList.add('glowme'); const a = plain(right.innerHTML); speak(a && a.length < 40 ? `${t('answerIs', a)}。${t('tapGlow')}` : t('tapGlow')); }
      };
      return;
    }
    // ---- 多選：選完按確定 ----
    if (q.kind === 'multi') {
      const btn = okBtn();
      scene.onclick = (e) => { const b = e.target.closest('.tapcard'); if (!b || locked) return; sfx.pop(); b.classList.toggle('sel'); b.classList.remove('glowme'); };
      btn.onclick = () => {
        if (locked) return;
        const cards = [...scene.querySelectorAll('.tapcard')];
        const wrong = cards.filter((c) => c.classList.contains('sel') && c.dataset.ok !== '1'), missing = cards.filter((c) => !c.classList.contains('sel') && c.dataset.ok === '1');
        if (!wrong.length && !missing.length) { cards.forEach((c) => { if (c.dataset.ok === '1') c.classList.add('ok'); }); win(btn); return; }
        wrong.forEach((c) => { c.classList.remove('sel'); c.classList.add('bump'); setTimeout(() => c.classList.remove('bump'), 450); });
        if (miss(wrong.length ? t('someWrong') : t('needMore'))) { missing.forEach((c) => c.classList.add('glowme')); speak(t('tapGlow')); }
      };
      return;
    }
    // ---- 依序點 ----
    if (q.kind === 'order') {
      let next = 0;
      const line = scene.querySelector('.orderline');
      scene.onclick = (e) => {
        const b = e.target.closest('.taps .tapcard');
        if (!b || locked) return;
        if (+b.dataset.o === next) {
          sfx.pop(); b.classList.remove('glowme'); line.appendChild(b); next++;
          if (next === q.n) win(null);
          return;
        }
        b.classList.add('bump'); setTimeout(() => b.classList.remove('bump'), 450);
        if (miss()) { scene.querySelector(`.taps .tapcard[data-o="${next}"]`)?.classList.add('glowme'); speak(t('nextOne')); }
      };
      return;
    }
    // ---- 拿東西／付錢：點一下放進盤子，再點一下拿回來 ----
    if (q.kind === 'collect') {
      const btn = okBtn(), tray = scene.querySelector('.traytok'), pool = scene.querySelector('.pool2'), sumEl = scene.querySelector('.traysum');
      const fmt = q.showSum || String, sum = () => [...tray.children].reduce((a, c) => a + +c.dataset.v, 0);
      scene.onclick = (e) => {
        const c = e.target.closest('.tok');
        if (!c || locked) return;
        sfx.coin();
        (c.parentElement === pool ? tray : pool).appendChild(c);
        if (tries > 0) sumEl.textContent = fmt(sum());
      };
      btn.onclick = () => {
        if (locked) return;
        const s = sum(), n = tray.children.length;
        if (s === q.ans && (!q.fewest || n <= q.fewest)) { scene.onclick = null; win(btn); return; }
        sumEl.textContent = fmt(s);
        scene.classList.add('shake'); setTimeout(() => scene.classList.remove('shake'), 400);
        const say = s === q.ans ? t('colFewer') : t('colNowSay', plain(fmt(s)), plain(fmt(q.ans)));
        if (miss(say)) speak(say);
      };
      return;
    }
    // ---- 數字鍵盤 ----
    ans.innerHTML = `<div class="pad"><div class="padscreen" id="pscr"></div><div class="padkeys">${[1, 2, 3, 4, 5, '⌫', 6, 7, 8, 9, 0, '✓'].map((k) => `<button class="${k === '⌫' ? 'del' : k === '✓' ? 'go' : ''}" data-k="${k}">${k}</button>`).join('')}</div></div>`;
    const scr = $('#pscr');
    let val = '';
    const show = () => { scr.classList.remove('hintans'); scr.innerHTML = val === '' ? '' : `${val}${q.unit ? `<small>${q.unit}</small>` : ''}`; };
    ans.onclick = (e) => {
      const b = e.target.closest('.padkeys button');
      if (!b || locked) return;
      const k = b.dataset.k;
      if (k === '⌫') { sfx.tap(); val = val.slice(0, -1); show(); return; }
      if (k !== '✓') { sfx.tap(); if (val.length < 4) val = val === '0' ? k : val + k; show(); return; }
      if (val === '') { speak(t('padEmpty')); return; }
      if (+val === q.ans) { win(scr); return; }
      scr.classList.add('shake'); setTimeout(() => scr.classList.remove('shake'), 400);
      val = '';
      if (miss()) { scr.classList.add('hintans'); scr.textContent = q.ans; speak(t('answerIs', q.ans)); } else show();
    };
  });
}

function result(first, total, gain, g) {
  const stars = first >= total - 1 ? 3 : first >= total - 3 ? 2 : 1;
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="rbox"><h2>${t('done')}</h2>
    <div class="rstars">${[1, 2, 3].map((i) => `<span class="${i <= stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">⭐</span>`).join('')}</div>
    <div class="rline">${t('firstTry', first, total)}</div>
    <div class="rxp">${t('xp')} <b>+${gain}</b></div>
    <div class="rprog">${g.justDone ? t('gradeDone') : t('gradeProg', g.name, g.pct)}</div>
    <button class="bigbtn" id="rok">${t('cont')}</button></div>`;
  stage.appendChild(ov);
  confetti(); sfx.fanfare();
  gate(ov.querySelector('#rok'), speak(t('doneSay', gain) + (g.justDone ? ` ${t('gradeDoneSay')}` : '')));
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
// 網址有 ?demo 就進題型測試（?demo=120 從第 120 號開始）。先按一下按鈕才開始：瀏覽器要有人點過才能發出語音
const demoArg = new URLSearchParams(location.search).get('demo');
if (demoArg !== null) {
  const n = Math.max(1, Math.min(ALL.length, Math.round(+demoArg) || state.demoAt || 1));
  screen('title', `<div class="bg title-bg"></div><div class="stars"></div><h1 class="logo"><span>${t('title1')}</span><span class="l2">${t('title2')}</span></h1>
    <button class="bigbtn" id="go" style="bottom:300px">${t('demoBtn')}　#${n} ▶</button>`);
  $('#go').onclick = () => { unlockAudio(); sfx.fanfare(); showDemo(n); };
} else showTitle();
// 開發除錯用
window.__game = { state, save, showHome, showSelect, showTitle, chooseLang, levelUps: () => flow(levelUps), mission: () => flow(mission), cur,
  // 直接試某個題型：__game.tryQ('k1', 3) = 中班第 3 種題型（d=難度 0~2）
  tryQ: (gid, n, d = 1) => flow(async (w) => {
    const tp = gradeOf(gid).types[n - 1];
    screen('mission', `<div class="bg dim">${sceneSVG(state.current || 'dino')}</div><div class="mtop"><button class="rbtn" id="quit">🏠</button><div class="stages"></div><div class="pips" id="pips"></div></div>
      <div class="prompt"><button class="rbtn spk" id="spk">🔊</button><div id="ptext"></div></div><div class="qscene" id="qscene"></div><div class="answers" id="answers"></div>
      <div class="mini" id="mini">${charSVG(state.current || 'dino', cur() || { level: 1, up: {} }, { fit: true })}</div><div class="eq" id="eq"></div><div class="banner" id="banner"></div>`);
    $('#quit').onclick = showHome;
    for (;;) await w(ask(tp.gen(d)));
  }) };
