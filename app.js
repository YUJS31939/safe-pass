'use strict';

(function () {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const symbolsDefault = "!@#$%^&*_-+=?";
  const similarChars = new Set(['O','0','l','1','I']);

  // 轻量词表（演示用，后续可替换更大词表）
  const smallWordList = [
    'able','about','above','access','active','add','after','again','agent','agree','ahead','alpha','among','apple','apply','area','argue','array','asset','author',
    'baby','back','basic','beach','beauty','become','before','behind','believe','best','better','beyond','bike','birth','black','blue','board','bonus','brain','bread',
    'build','busy','butter','button','buyer','cable','camera','camp','cancel','candy','capital','captain','carbon','carry','cause','center','chain','chair','chance',
    'change','charge','check','cherry','choice','choose','church','circle','city','class','clean','clear','client','clock','close','cloud','coach','coffee','cold','color',
    'come','common','company','corner','cotton','course','cover','craft','crazy','create','credit','crisp','crowd','dance','danger','dark','data','day','deal','dear',
    'death','debate','decide','deep','degree','deliver','demand','depend','design','desk','detail','develop','device','digital','dinner','direct','discover','doctor','draft','dream',
    'early','earth','east','easy','edge','effect','effort','eight','either','elegant','else','embark','embrace','emerge','emotion','empire','empty','energy','engine','enjoy',
    'enough','enter','entire','equal','equip','escape','estate','even','event','every','exact','expand','expect','expert','explain','extra','face','fact','fair','faith',
    'false','family','famous','fancy','fast','father','feather','fellow','female','fiction','field','fight','final','finger','fire','first','fish','five','flash','floor',
    'flower','follow','food','force','forest','forget','form','forward','frame','free','fresh','friend','front','fruit','future','galaxy','garden','gauge','gentle','giant',
    'gift','girl','glass','global','gold','good','goose','grant','great','green','ground','group','guard','guest','habit','happy','harbor','hard','health','heart',
    'heavy','height','hello','helmet','hero','high','hobby','holiday','home','honest','honor','hope','horse','hotel','hour','house','human','humble','humor','ideal',
    'image','impact','improve','include','income','index','indoor','infant','input','inside','inspire','interest','iron','island','issue','item','ivory','jacket','jelly',
    'jewel','job','join','journey','judge','juice','jump','junior','just','keep','kettle','key','king','kitchen','knee','knife','knock','label','labor','lady',
    'lake','large','laser','last','late','laugh','layer','lead','learn','leave','legal','lemon','level','light','limit','linen','lion','list','little','local',
    'logic','lonely','long','loyal','lucky','lunch','machine','magic','major','maker','manage','maple','market','master','match','matter','maybe','meal','measure','media',
    'memory','merit','metal','middle','might','mighty','minor','minute','mirror','mobile','model','modern','moment','monkey','month','moral','morning','mother','motion',
    'mountain','mouse','movie','music','mystery','narrow','nation','natural','nature','near','neat','need','never','new','night','noble','noise','north','note',
    'novel','nurse','object','ocean','offer','office','often','olive','onion','online','open','operate','opinion','orange','order','organ','other','outdoor','owner',
    'page','paint','pair','panda','paper','parent','party','past','patient','pattern','peace','pearl','people','perfect','phone','photo','piano','piece','pilot',
    'pink','pipe','pitch','place','planet','plant','plate','play','please','plenty','pocket','poem','point','police','policy','popular','position','potato','power',
    'praise','prefer','press','pretty','price','pride','prime','print','prize','problem','process','produce','profit','program','project','protect','proud','public','puzzle',
    'quality','queen','quick','quiet','radio','raise','range','rapid','rare','react','ready','reason','rebel','record','reduce','refer','region','relax','rely',
    'remain','remember','remote','remove','repair','repeat','report','rescue','resist','resort','result','retain','return','reveal','reward','rhythm','ribbon','river',
    'road','robot','rocket','romance','roof','room','round','route','royal','rural','safety','sail','salad','salt','sample','sand','satisfy','sauce','scale','scene',
    'school','science','scout','screen','script','search','season','second','secret','seed','select','senior','sense','series','serve','seven','shadow','shake','shape',
    'share','sharp','sheep','sheet','shelf','shine','ship','shock','shoe','short','shoulder','silent','silver','simple','since','sister','skill','sleep','small',
    'smart','smile','smoke','smooth','snake','snow','soccer','social','soft','solar','solid','solve','song','sound','south','space','speak','speed','spend','spice',
    'spider','spirit','sport','spot','spring','square','stable','stage','stairs','stamp','stand','star','start','state','station','stay','steel','step','still',
    'stone','store','storm','story','street','strong','studio','style','sugar','summer','sun','super','supply','sweet','swift','table','tackle','tale','talent',
    'talk','tall','taste','teacher','team','teeth','tell','tender','term','test','text','thank','theory','think','thirty','though','three','throw','ticket',
    'tight','time','tiring','title','today','toilet','tomato','tongue','tooth','topic','total','touch','tower','track','trade','train','travel','treat','tree',
    'trend','trial','tribe','trick','trophy','truly','trust','truth','twenty','under','union','unique','unit','upper','urban','useful','usual','vacuum','valley',
    'value','velvet','very','video','village','vintage','violin','virtual','vision','visit','visual','voice','volume','wait','walk','wall','warm','warn',
    'water','wealth','weapon','weather','web','wedding','week','welcome','west','whale','wheat','wheel','where','white','whole','wide','wild','will','window',
    'wine','wing','winter','wire','wise','wish','woman','wonder','wood','world','worry','worth','yellow','young','youth','zebra','zero','zone'
  ];

  const STORE_KEYS = {
    presets: 'safe-pass-presets',
    history: 'safe-pass-history',
  };

  function getSecureRandomInt(maxExclusive) {
    if (maxExclusive <= 0 || maxExclusive > 0x7fffffff) throw new Error('非法边界');
    const maxUint32 = 0xffffffff;
    const threshold = (maxUint32 - (maxUint32 % maxExclusive));
    const array = new Uint32Array(1);
    while (true) {
      crypto.getRandomValues(array);
      const v = array[0];
      if (v < threshold) return v % maxExclusive;
    }
  }

  function shuffleCrypto(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      const tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  }

  function buildCharset(options) {
    let pool = '';
    const groups = [];

    if (options.includeLowercase) { groups.push(lower); }
    if (options.includeUppercase) { groups.push(upper); }
    if (options.includeDigits) { groups.push(digits); }
    if (options.includeSymbols) { groups.push(symbolsDefault); }

    for (const g of groups) { pool += g; }

    if (options.avoidSimilar) {
      pool = [...pool].filter(c => !similarChars.has(c)).join('');
    }

    if (options.excludeChars && options.excludeChars.length > 0) {
      const ex = new Set([...options.excludeChars]);
      pool = [...pool].filter(c => !ex.has(c)).join('');
    }

    if (!pool) throw new Error('字符集为空，请调整选项');

    return { pool, groups };
  }

  function generatePassword(options) {
    const { pool, groups } = buildCharset(options);
    const requiredChars = [];

    if (options.requireEachSelectedClass) {
      for (const set of groups) {
        const c = set[getSecureRandomInt(set.length)];
        if (!c) continue;
        if (options.avoidSimilar && similarChars.has(c)) continue;
        if (options.excludeChars && options.excludeChars.includes(c)) continue;
        requiredChars.push(c);
      }
    }

    const passwordChars = [];
    for (const c of requiredChars) { passwordChars.push(c); }

    while (passwordChars.length < options.length) {
      const c = pool[getSecureRandomInt(pool.length)];
      if (passwordChars.length > 0) {
        const last = passwordChars[passwordChars.length - 1];
        if (c === last) continue;
      }
      passwordChars.push(c);
    }

    shuffleCrypto(passwordChars);
    return passwordChars.join('');
  }

  function estimateStrengthBits(charsetSize, length) {
    if (charsetSize <= 1 || length <= 0) return 0;
    const bits = length * Math.log2(charsetSize);
    return Math.round(bits);
  }

  function strengthLabel(bits) {
    if (bits < 40) return { label: '弱', color: 'var(--danger)', percent: 20 };
    if (bits < 60) return { label: '一般', color: 'var(--warning)', percent: 45 };
    if (bits < 80) return { label: '强', color: 'var(--success)', percent: 70 };
    return { label: '很强', color: 'var(--success)', percent: 100 };
  }

  function updateStrengthUI(bits, hintEl, textEl, fillEl) {
    const s = strengthLabel(bits);
    fillEl.style.width = s.percent + '%';
    fillEl.style.background = s.color;
    textEl.textContent = `强度：${s.label}（≈ ${bits} bits）`;
    hintEl.textContent = bits < 60 ? '建议：增加长度或启用更多字符类' : '';
  }

  function onGeneratePassword() {
    try {
      const length = clamp(parseInt($('#length').value, 10), 8, 64);
      const options = {
        length,
        includeLowercase: $('#optLower').checked,
        includeUppercase: $('#optUpper').checked,
        includeDigits: $('#optDigits').checked,
        includeSymbols: $('#optSymbols').checked,
        avoidSimilar: $('#optSimilar').checked,
        excludeChars: $('#excludeChars').value || '',
        requireEachSelectedClass: $('#optRequireEach').checked,
      };

      const { pool } = buildCharset(options);
      const pwd = generatePassword(options);
      $('#resultField').value = pwd;
      updateStrengthUI(estimateStrengthBits(pool.length, options.length), $('#hintText'), $('#strengthText'), $('#strengthFill'));

      addHistory({ mode: 'password', params: maskParams(options) });
    } catch (e) {
      alert(e.message || '生成失败');
    }
  }

  function onCopy(selector) {
    const el = $(selector);
    const value = el.value;
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      toast('已复制');
    }).catch(() => {
      el.select();
      document.execCommand('copy');
      toast('已复制');
    });
  }

  function onToggleVisibility() {
    const field = $('#resultField');
    field.type = field.type === 'password' ? 'text' : 'password';
  }

  // —— 通行短语 ——
  function generatePassphrase(options) {
    const { wordCount, separator, randomCase, capitalize, addNumber, addSymbol } = options;
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      const w = smallWordList[getSecureRandomInt(smallWordList.length)];
      words.push(w);
    }
    let phrase = words.join(separator);

    if (randomCase) {
      phrase = [...phrase].map(ch => {
        if (/[a-z]/i.test(ch)) {
          return getSecureRandomInt(2) === 0 ? ch.toLowerCase() : ch.toUpperCase();
        }
        return ch;
      }).join('');
    } else if (capitalize) {
      phrase = phrase.split(separator).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(separator);
    }

    if (addNumber) {
      const pos = getSecureRandomInt(phrase.length + 1);
      phrase = phrase.slice(0, pos) + String(getSecureRandomInt(10)) + phrase.slice(pos);
    }
    if (addSymbol) {
      const sym = symbolsDefault[getSecureRandomInt(symbolsDefault.length)];
      const pos = getSecureRandomInt(phrase.length + 1);
      phrase = phrase.slice(0, pos) + sym + phrase.slice(pos);
    }

    return phrase;
  }

  function onGeneratePassphrase() {
    const options = {
      wordCount: clamp(parseInt($('#wordCount').value, 10), 3, 8),
      separator: $('#separator').value ?? '-',
      randomCase: $('#ppRandomCase').checked,
      capitalize: $('#ppCapitalize').checked,
      addNumber: $('#ppAddNumber').checked,
      addSymbol: $('#ppAddSymbol').checked,
    };
    const phrase = generatePassphrase(options);
    $('#ppResultField').value = phrase;

    const wordListSize = smallWordList.length;
    const symbolExtra = options.addSymbol ? Math.log2(symbolsDefault.length) : 0;
    const numberExtra = options.addNumber ? Math.log2(10) : 0;
    const bits = Math.round(options.wordCount * Math.log2(wordListSize) + symbolExtra + numberExtra);
    updateStrengthUI(bits, $('#ppHintText'), $('#ppStrengthText'), $('#ppStrengthFill'));

    addHistory({ mode: 'passphrase', params: maskParams(options) });
  }

  // —— 本地存储：预设与历史（不存明文） ——
  function readLocal(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  }
  function writeLocal(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function addHistory(entry) {
    const history = readLocal(STORE_KEYS.history, []);
    history.unshift({ ...entry, id: Date.now(), createdAt: new Date().toISOString() });
    const limited = history.slice(0, 10);
    writeLocal(STORE_KEYS.history, limited);
    renderHistory(limited);
  }

  function maskParams(p) {
    const copy = { ...p };
    if (copy.excludeChars) copy.excludeChars = '*'.repeat(String(copy.excludeChars).length);
    return copy;
  }

  function renderHistory(list = readLocal(STORE_KEYS.history, [])) {
    let el = document.getElementById('historyList');
    if (!el) {
      const about = document.getElementById('about');
      const wrap = document.createElement('section');
      wrap.className = 'about';
      wrap.innerHTML = '<h2>最近记录</h2><div id="historyList"></div>';
      about.parentNode.insertBefore(wrap, about);
      el = wrap.querySelector('#historyList');
    }
    el.innerHTML = '';
    list.forEach(item => {
      const div = document.createElement('div');
      div.style.padding = '8px 0';
      div.style.borderBottom = '1px solid #1f2937';
      const meta = document.createElement('div');
      meta.style.color = '#9ca3af';
      meta.style.fontSize = '12px';
      meta.textContent = `${item.mode} · ${new Date(item.createdAt).toLocaleString()}`;
      const pre = document.createElement('pre');
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.margin = '6px 0 0';
      pre.style.fontSize = '12px';
      pre.textContent = JSON.stringify(item.params, null, 0);
      div.appendChild(meta);
      div.appendChild(pre);
      el.appendChild(div);
    });
  }

  // —— 工具与 UI 绑定 ——
  function $(sel) { return document.querySelector(sel); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function toast(text) {
    const d = document.createElement('div');
    d.textContent = text;
    d.style.position = 'fixed';
    d.style.right = '16px';
    d.style.bottom = '16px';
    d.style.padding = '8px 12px';
    d.style.background = '#1f2937';
    d.style.color = '#fff';
    d.style.borderRadius = '8px';
    d.style.zIndex = '9999';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  }

  function initTabs() {
    const tabPassword = $('#tabPassword');
    const tabPassphrase = $('#tabPassphrase');
    const panelPassword = $('#panelPassword');
    const panelPassphrase = $('#panelPassphrase');

    function activate(which) {
      const isPwd = which === 'pwd';
      tabPassword.classList.toggle('active', isPwd);
      tabPassphrase.classList.toggle('active', !isPwd);
      tabPassword.setAttribute('aria-selected', String(isPwd));
      tabPassphrase.setAttribute('aria-selected', String(!isPwd));
      panelPassword.hidden = !isPwd;
      panelPassphrase.hidden = isPwd;
      panelPassword.classList.toggle('active', isPwd);
      panelPassphrase.classList.toggle('active', !isPwd);
    }

    tabPassword.addEventListener('click', () => activate('pwd'));
    tabPassphrase.addEventListener('click', () => activate('pp'));
  }

  function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    btn?.addEventListener('click', () => {
      document.documentElement.toggleAttribute('data-theme-light');
      const isLight = document.documentElement.hasAttribute('data-theme-light');
      document.querySelector('meta[name="theme-color"]').setAttribute('content', isLight ? '#ffffff' : '#0f172a');
    });
  }

  function bindPasswordEvents() {
    const range = $('#length');
    const num = $('#lengthNum');
    const sync = (from) => {
      if (from === 'range') num.value = range.value; else range.value = num.value;
    };
    range.addEventListener('input', () => sync('range'));
    num.addEventListener('input', () => sync('num'));

    $('#generateBtn').addEventListener('click', onGeneratePassword);
    $('#regenBtn').addEventListener('click', onGeneratePassword);
    $('#copyBtn').addEventListener('click', () => onCopy('#resultField'));
    $('#toggleVisibility').addEventListener('click', onToggleVisibility);

    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === 'g') { e.preventDefault(); onGeneratePassword(); }
      if (e.key.toLowerCase() === 'c') { e.preventDefault(); onCopy('#resultField'); }
      if (e.key.toLowerCase() === 'h') { e.preventDefault(); onToggleVisibility(); }
    });
  }

  function bindPassphraseEvents() {
    $('#ppGenerateBtn').addEventListener('click', onGeneratePassphrase);
    $('#ppRegenBtn').addEventListener('click', onGeneratePassphrase);
    $('#ppCopyBtn').addEventListener('click', () => onCopy('#ppResultField'));
  }

  window.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initThemeToggle();
    bindPasswordEvents();
    bindPassphraseEvents();
    renderHistory();
  });
})();
