// 語言：繁體中文 / English（文字與語音台詞都在這裡）
let lang = 'zh';
export const getLang = () => lang;
export function setLang(l) {
  lang = l === 'en' ? 'en' : 'zh';
  if (typeof document === 'undefined') return; // 在 node 裡跑測試時沒有畫面
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
  document.title = lang === 'en' ? 'Math Evo Beasts' : '數學進化獸';
}
// 預設語言看瀏覽器：中文系 → 繁中，其他 → 英文
export const detectLang = () => (/^zh/i.test(navigator.language || (navigator.languages || [])[0] || 'zh') ? 'zh' : 'en');

const ZHN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
// 語音用的數字：中文唸國字，英文直接用數字
export const num = (n) => (lang === 'zh' ? ZHN[n] ?? String(n) : String(n));
const pl = (n, s, p) => (n === 1 ? s : p);

const S = {
  zh: {
    title1: '數學', title2: '進化獸', start: '開始冒險 ▶',
    pick: '選一個夥伴！', pickSay: '選一個夥伴，一起去冒險吧！', go: (n) => `${n}，出發！`,
    sw: '換角色', mission: '開始任務 ▶', levelup: '✨ 升級！', power: '戰力',
    evoIn: (n) => `再 ${n} 級進化`, finalForm: '最終型態',
    fsTitle: '⛶ 全螢幕', fsHelp: '<p>這台裝置的瀏覽器不能直接切換全螢幕（iPhone 都是這樣）。</p><p><b>iPhone／iPad</b>：按瀏覽器的「分享」<span>⬆️</span> →「加入主畫面」。</p><p><b>Android</b>：按右上角 ⋮ →「加到主畫面」。</p><p>之後從主畫面的圖示打開，就是全螢幕。手機記得橫著拿！</p>',
    settings: '設定', voice: (on) => `🗣️ 語音：${on ? '開' : '關'}`, langLabel: '🌐 語言',
    voiceTip: '想要更自然的聲音：到 iPad／Mac 的「設定 → 輔助使用 → 語音內容 → 聲音 → 中文」下載美佳的「優化音質」版',
    testVoice: '🔊 試聽語音', testSay: '語音測試，一、二、三！', voiceOk: '✅ 語音正常', voiceBad: '⚠️ 這台裝置沒有發出語音，請確認音量或換一個瀏覽器',
    demoBtn: '🧪 題型測試', gradeLabel: '📚 年級', demoGo: '跳到', demoD: (d) => `難度 ${d}`, demoDone: (n) => `🎉 ${n} 種題型都看完了！`, demoNth: (g, n) => `${g} 第 ${n} 種`,
    reset: '♻️ 這個角色重新養成', resetConfirm: '⚠️ 再按一次就會回到 Lv.1', close: '關閉',
    stageN: (n) => `第 ${n} 關`, stageSay: (n, title) => `第${num(n)}關，${title}！`,
    praise: ['答對了！', '好棒！', '太厲害了！', '你做到了！'],
    pay: '付錢 ✓', trayLabel: '把錢放這裡', walletLabel: '我的錢包', priceTag: (p) => `${p} 元`,
    traySum: (s) => `盤子裡有 ${s} 元`,
    payLow: (s, a) => `盤子裡有${num(s)}元，還不夠喔，要付${num(a)}元！`,
    payHigh: (s, a) => `盤子裡有${num(s)}元，太多了，只要付${num(a)}元！`,
    tryIt: (h) => `${h}，試試看！`,
    hint1: '再數數看！我幫你標上數字了。', hint2: (list) => `我們一起數：${list.join('、')}。`,
    hint3: (a) => `答案是${num(a)}，點亮亮的那個！`,
    done: '任務完成！', firstTry: (a, b) => `一次就答對 <b>${a}</b> / ${b} 題`, xp: '經驗值', cont: '繼續 ▶',
    doneSay: (g) => `任務完成！得到${g}點經驗值！`,
    cardTitle: (lv) => `升到 Lv.${lv}！選一張升級卡`, cardSay: '升級了！選一張你喜歡的升級卡！',
    evoTitle: '🌟 進化的時刻到了！', evoName: '超進化', evoDesc: '變身成更強的「？？？」',
    evoSay: '哇！出現金色進化卡了！點它就可以進化！',
    appear: (n) => `出現了 <b>${n}</b>！`, bossAppear: (n) => `⚠️ 魔王出現：<b>${n}</b>！`,
    attack: '⚔️ 攻擊！', victory: '🎉 <b>勝利！</b>',
    appearSay: (n) => `出現了${n}！按攻擊打倒牠！`, bossSay: (n) => `小心！${n}出現了！快打倒牠！`, winSay: (n) => `打倒${n}了！你贏了！`,
    evolving: '進化中…', rising: '力量湧出來了…', evoDone: '進化成功！',
    powerUp: (p) => `戰力大提升！⚡ ${p}`, cool: '太酷了！▶', great: '太棒了！▶',
    evoDoneSay: (n) => `進化成功！變成${n}了！`,
    pickGrade: '先選年級', pickGradeSay: '請先選年級，再開始冒險！', learned: (p) => `學會 ${p}%`,
    modeNew: '新題型', modeReview: '複習', modeBonus: '⭐ 加分題', bonusTag: '加分題',
    tryAgain: '再想想看！', tryAgain2: '再試一次，你可以的！', answerIs: (a) => `答案是${a}`, tapGlow: '點亮亮的那個！',
    ok: '確定 ✓', needMore: '還有沒選到的喔！', someWrong: '有選錯的喔，再看看！', nextOne: '點亮亮的那一個！',
    colNow: (s, a) => `現在是 ${s}，要剛好 ${a}`, colNowSay: (s, a) => `現在是${s}，要剛好${a}喔！`, colFewer: '可以用更少個嗎？', padEmpty: '先按數字，再按確定！',
    gradeProg: (name, p) => `${name}　已學會 <b>${p}%</b>`, gradeDone: '🎓 這個年級全部學會了！', gradeDoneSay: '太厲害了！這個年級全部學會了！',
  },
  en: {
    title1: 'Math', title2: 'Evo Beasts', start: 'Start Adventure ▶',
    pick: 'Pick your buddy!', pickSay: "Pick a buddy, and let's go on an adventure!", go: (n) => `${n}, let's go!`,
    sw: 'Switch', mission: 'Start Mission ▶', levelup: '✨ Level Up!', power: 'Power',
    evoIn: (n) => `Evolves in ${n} ${pl(n, 'level', 'levels')}`, finalForm: 'Final form',
    fsTitle: '⛶ Full screen', fsHelp: '<p>This browser cannot switch to full screen (iPhones never can).</p><p><b>iPhone / iPad</b>: tap Share <span>⬆️</span> in the browser → “Add to Home Screen”.</p><p><b>Android</b>: tap ⋮ → “Add to Home screen”.</p><p>Then open the game from the home-screen icon. It will be full screen. Hold your phone sideways!</p>',
    settings: 'Settings', voice: (on) => `🗣️ Voice: ${on ? 'On' : 'Off'}`, langLabel: '🌐 Language',
    voiceTip: 'For a more natural voice: on iPad / Mac go to Settings → Accessibility → Spoken Content → Voices → English and download an Enhanced voice',
    testVoice: '🔊 Test voice', testSay: 'Voice test. One, two, three!', voiceOk: '✅ Voice is working', voiceBad: '⚠️ No voice came out on this device. Check the volume or try another browser.',
    demoBtn: '🧪 Question test', gradeLabel: '📚 Level', demoGo: 'Go', demoD: (d) => `Level ${d}`, demoDone: (n) => `🎉 All ${n} question types done!`, demoNth: (g, n) => `${g} · no. ${n}`,
    reset: '♻️ Restart this character', resetConfirm: '⚠️ Tap again to go back to Lv.1', close: 'Close',
    stageN: (n) => `Stage ${n}`, stageSay: (n, title) => `Stage ${n}. ${title}!`,
    praise: ['Correct!', 'Great job!', 'Awesome!', 'You did it!'],
    pay: 'Pay ✓', trayLabel: 'Put money here', walletLabel: 'My wallet', priceTag: (p) => `$${p}`,
    traySum: (s) => `$${s} on the tray`,
    payLow: (s, a) => `There ${pl(s, 'is', 'are')} ${s} ${pl(s, 'dollar', 'dollars')} on the tray. Not enough! You need ${a} dollars.`,
    payHigh: (s, a) => `There are ${s} dollars on the tray. Too much! You only need ${a} ${pl(a, 'dollar', 'dollars')}.`,
    tryIt: (h) => `${h}. Try it!`,
    hint1: 'Count again! I added numbers to help you.', hint2: (list) => `Let's count together: ${list.join(', ')}.`,
    hint3: (a) => `The answer is ${a}. Tap the glowing one!`,
    done: 'Mission Complete!', firstTry: (a, b) => `First-try correct: <b>${a}</b> / ${b}`, xp: 'XP', cont: 'Continue ▶',
    doneSay: (g) => `Mission complete! You got ${g} experience points!`,
    cardTitle: (lv) => `Level ${lv}! Pick an upgrade card`, cardSay: 'Level up! Pick the upgrade card you like!',
    evoTitle: '🌟 Time to evolve!', evoName: 'Evolution', evoDesc: 'Transform into a stronger "???"',
    evoSay: 'Wow! A golden evolution card! Tap it to evolve!',
    appear: (n) => `A wild <b>${n}</b> appears!`, bossAppear: (n) => `⚠️ Boss: <b>${n}</b>!`,
    attack: '⚔️ Attack!', victory: '🎉 <b>Victory!</b>',
    appearSay: (n) => `A wild ${n} appears! Tap attack to beat it!`, bossSay: (n) => `Watch out! The ${n} is here! Beat it!`, winSay: (n) => `You beat the ${n}! You win!`,
    evolving: 'Evolving…', rising: 'Power is rising…', evoDone: 'Evolution complete!',
    powerUp: (p) => `Power up! ⚡ ${p}`, cool: 'So cool! ▶', great: 'Awesome! ▶',
    evoDoneSay: (n) => `Evolution complete! You are now ${n}!`,
    pickGrade: 'Pick your level', pickGradeSay: 'Pick your level first, then start the adventure!', learned: (p) => `${p}% learned`,
    modeNew: 'New', modeReview: 'Review', modeBonus: '⭐ Bonus', bonusTag: 'Bonus',
    tryAgain: 'Think again!', tryAgain2: 'Try once more. You can do it!', answerIs: (a) => `The answer is ${a}`, tapGlow: 'Tap the glowing one!',
    ok: 'OK ✓', needMore: 'There are more to find!', someWrong: 'Some are not right. Look again!', nextOne: 'Tap the glowing one!',
    colNow: (s, a) => `Now: ${s}. You need exactly ${a}`, colNowSay: (s, a) => `You have ${s} now. You need exactly ${a}!`, colFewer: 'Can you use fewer?', padEmpty: 'Tap the numbers first, then OK!',
    gradeProg: (name, p) => `${name} — <b>${p}%</b> learned`, gradeDone: '🎓 You have learned this whole level!', gradeDoneSay: 'Amazing! You have learned this whole level!',
  },
};
export const t = (key, ...args) => { const v = S[lang][key]; return typeof v === 'function' ? v(...args) : v; };

// ---- 遊戲資料的名稱 ----
const D = {
  zh: {
    forms: { dino: ['小暴龍', '狂牙暴龍', '鋼甲暴龍', '黃金帝王龍'], sea: ['小海怪', '浪花海蛇', '深海巨蛇', '海皇大海怪'], boy: ['小男孩', '見習劍士', '閃電騎士', '傳說勇者'] },
    up: {
      strong: ['變強壯', ['身體變得更壯！', '肌肉更大了！', '壯得像座山！', '超級大力士！', '無敵壯！']],
      tall: ['長高高', ['長高了一點！', '又長高了！', '越來越高大！', '高人一等！', '巨人等級！']],
      aura: ['能量光環', ['身邊出現藍色光環！', '光環變成紫色！', '金色的王者光環！']],
      cape: ['英雄披風', ['披上紅色披風！', '藍色的騎士披風！', '紫金色的皇家披風！']],
      crown: ['王者皇冠', ['戴上小皇冠！', '鑲著紅寶石的銀皇冠！', '閃亮的黃金大皇冠！']],
      wings: ['飛天翅膀', ['長出小翅膀！', '翅膀變大了！', '黃金大翅膀！']],
      fire: ['火焰之力', ['一顆火球繞著你轉！', '兩顆火球！', '三顆火球超威風！']],
      ice: ['冰雪之力', ['一片雪花繞著你轉！', '兩片雪花！', '三片雪花好酷！']],
      thunder: ['閃電之力', ['一道閃電繞著你轉！', '兩道閃電！', '三道閃電劈哩啪啦！']],
      pet: ['夥伴：史萊姆', ['來了一個會飛的史萊姆夥伴！', '粉紅色的史萊姆也來了！', '三隻史萊姆到齊了！']],
      skel: ['夥伴：骷髏兵', ['來了一個骷髏兵夥伴！', '又來一個骷髏兵！', '三個骷髏兵到齊了！']],
      tree: ['夥伴：樹精', ['來了一個樹精夥伴！', '又來一個樹精！', '三個樹精到齊了！']],
      clone: ['分身術', ['變出一個分身！', '變出兩個分身！', '三個分身一起上！']],
      ki: ['賽亞人之火', ['全身冒出白色的火焰！', '火焰變成金色！', '金色火焰加上閃電！']],
    },
    monsters: { slime: '暗影史萊姆', bat: '尖牙蝙蝠', imp: '搗蛋小惡魔', golem: '岩石巨人', ghost: '嚇人幽靈', shroom: '毒蘑菇怪', king: '黑暗魔王', dragon: '暗黑邪龍' },
    stages: { apple: '蘋果籃子', pig: '小豬豬圈', duck: '鴨子池塘', bird: '小鳥大樹', fish: '小魚海洋', chick: '小雞雞舍', frog: '青蛙荷葉', butterfly: '蝴蝶花園', egg: '恐龍蛋窩', cookie: '餅乾盤子', balloon: '氣球派對', car: '停車場', candy: '糖果罐', piggy: '存錢筒', count5: '數硬幣', shop: '小商店', change: '買東西找錢', fill: '裝滿盒子', number: '數字算式' },
  },
  en: {
    forms: { dino: ['Baby Rex', 'Fang Rex', 'Steel Rex', 'Golden Emperor Rex'], sea: ['Baby Serpent', 'Wave Serpent', 'Deep-Sea Serpent', 'Sea Emperor'], boy: ['Little Boy', 'Sword Trainee', 'Thunder Knight', 'Legendary Hero'] },
    up: {
      strong: ['Get Stronger', ['Your body gets stronger!', 'Bigger muscles!', 'Strong as a mountain!', 'Super strong!', 'Unbeatable!']],
      tall: ['Grow Taller', ['You grew a little!', 'Even taller!', 'Getting really big!', 'Taller than everyone!', 'Giant size!']],
      aura: ['Energy Aura', ['A blue aura appears!', 'The aura turns purple!', 'A golden royal aura!']],
      cape: ['Hero Cape', ['A red cape!', 'A blue knight cape!', 'A royal purple and gold cape!']],
      crown: ['Royal Crown', ['A little crown!', 'A silver crown with a ruby!', 'A big shiny gold crown!']],
      wings: ['Flying Wings', ['Little wings!', 'Bigger wings!', 'Big golden wings!']],
      fire: ['Power of Fire', ['A fireball circles you!', 'Two fireballs!', 'Three fireballs! So cool!']],
      ice: ['Power of Ice', ['A snowflake circles you!', 'Two snowflakes!', 'Three snowflakes! So cool!']],
      thunder: ['Power of Thunder', ['A lightning bolt circles you!', 'Two lightning bolts!', 'Three lightning bolts! Zap!']],
      pet: ['Buddy: Slime', ['A flying slime buddy joins you!', 'A pink slime joins too!', 'All three slimes are here!']],
      skel: ['Buddy: Skeleton', ['A skeleton buddy joins you!', 'Another skeleton!', 'All three skeletons are here!']],
      tree: ['Buddy: Tree Sprite', ['A tree sprite joins you!', 'Another tree sprite!', 'All three tree sprites are here!']],
      clone: ['Shadow Clones', ['You make one clone!', 'You make two clones!', 'Three clones attack together!']],
      ki: ['Saiyan Fire', ['White flames blaze around you!', 'The flames turn gold!', 'Golden flames with lightning!']],
    },
    monsters: { slime: 'Shadow Slime', bat: 'Fang Bat', imp: 'Naughty Imp', golem: 'Rock Golem', ghost: 'Spooky Ghost', shroom: 'Poison Mushroom', king: 'Dark King', dragon: 'Shadow Dragon' },
    stages: { apple: 'Apple Basket', pig: 'Piggy Pen', duck: 'Duck Pond', bird: 'Bird Tree', fish: 'Fish Sea', chick: 'Chick Coop', frog: 'Frog Pond', butterfly: 'Butterfly Garden', egg: 'Dino Egg Nest', cookie: 'Cookie Plate', balloon: 'Balloon Party', car: 'Parking Lot', candy: 'Candy Jar', piggy: 'Piggy Bank', count5: 'Count Coins', shop: 'Little Shop', change: 'Shopping Change', fill: 'Fill the Box', number: 'Number Math' },
  },
};
export const formNameOf = (id, form) => D[lang].forms[id][form];
export const monsterName = (id) => D[lang].monsters[id];
export const stageTitle = (id) => D[lang].stages[id];
export const upText = (upId) => { const [name, desc] = D[lang].up[upId]; return { name, desc }; };
