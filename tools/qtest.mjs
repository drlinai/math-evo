// 題庫自動檢查：每個題型在中文、英文、三種難度下各產生很多次，檢查題目物件有沒有問題。
// 用法：node tools/qtest.mjs            檢查全部年級
//       node tools/qtest.mjs p1a p1b    只檢查指定年級
//       node tools/qtest.mjs p1a --show 3   另外印出每個題型的 3 個範例（看文字用）
import fs from 'node:fs';
const v = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8').match(/main\.js\?v=(\d+)/)[1];
const { setLang } = await import(`../js/i18n.js?v=${v}`);
const { GRADES } = await import(`../js/q/index.js?v=${v}`);
const args = process.argv.slice(2), showAt = args.indexOf('--show'), show = showAt >= 0 ? +(args[showAt + 1] || 2) : 0;
const only = args.filter((a, i) => !a.startsWith('--') && i !== showAt + 1 || (showAt < 0 && !a.startsWith('--'))).filter((a) => GRADES.some((g) => g.id === a));
const RUNS = 150, CJK = /[\u3400-\u9fff\u3000-\u303f\uff00-\uffef]/;
const text = (h) => String(h ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const attrs = (h, re) => [...String(h).matchAll(re)].map((m) => m[1]);
let bad = 0, types = 0;
const subsetOk = (vals, target, maxCount) => { // 能不能用這些代幣湊出目標（以及最少幾個）
  const best = new Map([[0, 0]]);
  for (const x of vals) for (const [s, c] of [...best]) { const t = s + x; if (t <= target && (!best.has(t) || best.get(t) > c + 1)) best.set(t, c + 1); }
  return best.has(target) && (!maxCount || best.get(target) <= maxCount);
};
function check(q, lang) {
  const e = [];
  if (!q || typeof q !== 'object') return ['沒有回傳題目物件'];
  const all = [q.prompt, q.say, q.scene, q.full, q.fullSay, q.hint, ...(q.opts || []).map((o) => o.h)].join(' ');
  if (/undefined|NaN|\[object|null|Infinity/.test(all.replace(/<[^>]*>/g, ' '))) e.push('文字裡有 undefined/NaN/null');
  if (/undefined|NaN/.test(String(q.scene))) e.push('題目區 HTML 裡有 undefined/NaN');
  if (!text(q.prompt)) e.push('prompt 是空的');
  if (!String(q.say || '').trim()) e.push('say 是空的');
  if (String(q.say).length > 260) e.push('say 太長');
  if (/[<>]/.test(q.say) || /[<>]/.test(q.fullSay || '')) e.push('say/fullSay 裡有 HTML');
  const vis = [text(q.prompt), q.say, text(q.full), q.fullSay, q.hint || '', ...(q.opts || []).map((o) => text(o.h)), text(q.scene)].join(' ');
  if (lang === 'en' && CJK.test(vis)) e.push(`英文版出現中文：「${(vis.match(/[^\x00-\x7f]{1,12}/g) || []).filter((x) => CJK.test(x)).slice(0, 3).join(' / ')}」`);
  if (lang === 'zh' && !CJK.test(text(q.prompt))) e.push('中文版的 prompt 沒有中文');
  if (q.kind === 'choice') {
    const vs = q.opts.map((o) => o.v), hs = q.opts.map((o) => o.h);
    if (q.opts.length < 2 || q.opts.length > 6) e.push(`選項數量 ${q.opts.length}`);
    if (new Set(vs).size !== vs.length) e.push('選項的值重複');
    if (new Set(hs).size !== hs.length) e.push(`選項的內容重複：${hs.map(text).join(' | ').slice(0, 80)}`);
    if (!vs.includes(q.ans)) e.push('答案不在選項裡');
  } else if (q.kind === 'tap') {
    const v2 = attrs(q.scene, /class="tapcard" data-v="(\d)"/g);
    if (v2.length < 2 || v2.length > 10) e.push(`卡片數量 ${v2.length}`);
    if (v2.filter((x) => x === '1').length !== 1) e.push(`正確的卡片有 ${v2.filter((x) => x === '1').length} 張（要剛好 1 張）`);
    const cards = String(q.scene).split('<button class="tapcard"').slice(1).map((c) => c.replace(/^ data-v="\d">/, '').replace(/--i:\d+|left:[\d.]+px|top:[\d.]+px/g, ''));
    const right = cards[v2.indexOf('1')];
    if (!q.fixed && cards.filter((c) => c === right).length > 1) e.push('有錯誤的卡片和正確的卡片長得一模一樣');
  } else if (q.kind === 'multi') {
    const ok = attrs(q.scene, /data-ok="(\d)"/g);
    if (ok.length < 3) e.push(`多選卡片只有 ${ok.length} 張`);
    if (!ok.includes('1')) e.push('多選沒有正確的卡片');
    if (!ok.includes('0')) e.push('多選全部都是正確的（沒有可以不選的）');
  } else if (q.kind === 'order') {
    const os = attrs(q.scene, /data-o="(\d+)"/g).map(Number).sort((a, b) => a - b);
    if (q.n < 2 || os.length !== q.n || os.some((x, i) => x !== i)) e.push('排序卡片的編號不對');
  } else if (q.kind === 'collect') {
    const vals = attrs(q.scene, /class="tok" data-v="(\d+)"/g).map(Number);
    if (!Number.isInteger(q.ans) || q.ans <= 0) e.push(`collect 的 ans=${q.ans}`);
    else if (!subsetOk(vals, q.ans, q.fewest)) e.push(`代幣湊不出 ${q.ans}${q.fewest ? `（最多 ${q.fewest} 個）` : ''}`);
    if (vals.length > 24) e.push(`代幣太多（${vals.length}）`);
  } else if (q.kind === 'pad') {
    if (!Number.isInteger(q.ans) || q.ans < 0 || q.ans > 9999) e.push(`鍵盤題的 ans=${q.ans}`);
  } else e.push(`不認得的 kind：${q.kind}`);
  return e;
}
for (const g of GRADES) {
  if (only.length && !only.includes(g.id)) continue;
  console.log(`\n== ${g.id} ${g.zh}：${g.types.length} 種題型（加分 ${g.types.filter((t) => t.bonus).length}）`);
  g.types.forEach((tp, i) => {
    types++;
    const errs = new Map(), kinds = new Set();
    if (!tp.zh || !tp.en || !Array.isArray(tp.topic) || tp.topic.length !== 3) errs.set('def() 的 topic/zh/en 不完整', 1);
    if (CJK.test(tp.en) || CJK.test(tp.topic?.[1] || '')) errs.set('英文名稱裡有中文', 1);
    for (const lang of ['zh', 'en']) {
      setLang(lang);
      for (let r = 0; r < RUNS; r++) {
        let q;
        try { q = tp.gen(r % 3); } catch (err) { errs.set(`丟出錯誤：${err.message}`, (errs.get(`丟出錯誤：${err.message}`) || 0) + 1); continue; }
        kinds.add(q?.kind);
        for (const m of check(q, lang)) errs.set(`[${lang}] ${m}`, (errs.get(`[${lang}] ${m}`) || 0) + 1);
        if (show && r < show) console.log(`   #${i + 1} ${lang} d${r % 3} (${q.kind}) ${text(q.prompt)}  →  ${q.kind === 'choice' ? q.opts.map((o) => (o.v === q.ans ? `[${text(o.h) || '圖'}]` : text(o.h) || '圖')).join(' ') : q.ans ?? ''}  ｜ ${text(q.full)}`);
      }
    }
    if (errs.size) { bad++; console.log(`  ✗ #${i + 1} ${tp.zh}`); for (const [m, n] of errs) console.log(`      ${m}  ×${n}`); }
  });
}
console.log(`\n${types} 種題型，${bad} 種有問題`);
process.exit(bad ? 1 : 0);
