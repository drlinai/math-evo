// 依「自然程度」替裝置上的語音打分數，挑最好的一個（純函式，方便測試）
// 分數由高到低：Edge 神經語音 > Apple 高音質 > Apple 優化音質 > Chrome 的 Google 線上語音 > 一般內建語音
const NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Wobble|Zarvox|Trinoids|Whisper|Superstar|Good News|Jester|Organ|Junior|Ralph|Fred|Kathy|Deranged|Hysterical|Pipe Organ|Princess|Rocko|Eddy|Flo|Grandma|Grandpa|Reed|Sandy|Shelley)\b/i;

export function scoreVoice(v, lang, allowRemote = true) {
  const L = (v.lang || '').replace('_', '-'), n = v.name || '';
  if (!allowRemote && v.localService === false) return -1;
  let s;
  if (lang === 'zh') {
    if (L === 'zh-TW') s = 100;                              // 台灣中文優先
    else if (/^(zh|cmn)/i.test(L) && !/HK|yue/i.test(L)) s = 10; // 其他普通話當備用（不要粵語）
    else return -1;
  } else {
    if (L === 'en-US') s = 100;
    else if (/^en/i.test(L)) s = 50;
    else return -1;
  }
  if (/natural/i.test(n)) s += 40;                 // Edge：Microsoft … Online (Natural)
  else if (/premium|高音質/i.test(n)) s += 35;      // Apple：高音質版（需在裝置設定下載）
  else if (/enhanced|優化|增強/i.test(n)) s += 30;  // Apple：優化音質版（需在裝置設定下載）
  else if (/^Google/i.test(n)) s += 20;            // Chrome：Google 線上語音
  if (lang === 'zh' && /Mei-?Jia|美佳/i.test(n)) s += 5;
  if (lang === 'en' && /Samantha|Ava|Zoe|Allison|Susan|Joelle|Noelle|Nicky/i.test(n)) s += 5;
  if (lang === 'en' && NOVELTY.test(n)) s -= 60;   // 避開搞怪音效型的聲音
  return s;
}

export function chooseVoice(list, lang, allowRemote = true) {
  let best = null, bestScore = 0;
  for (const v of list) {
    const s = scoreVoice(v, lang, allowRemote);
    if (s > bestScore) { best = v; bestScore = s; }
  }
  return best;
}
