(() => {
  const toggle = document.getElementById('gamepad-enabled');
  const selector = document.getElementById('interface-language');
  const status = document.getElementById('toggle-status');
  const api = globalThis.chrome, storage = api?.storage;
  const words = {
    en: {
      gamepad:'Gamepad', enable:'Enable gamepad', links:'Related links', language:'Language', auto:'Automatic (game)',
      game:'Original game website', originalRepo:'Original game GitHub', chinese:'Traditional Chinese extension', ourRepo:'Gamepad extension GitHub',
      note:'Language applies to this extension only. Chinese game text requires the Traditional Chinese extension.',
      toolbar:'Open from the extension toolbar.', loadError:'Could not load settings.', saveError:'Could not save settings.'
    },
    es: {
      gamepad:'Mando', enable:'Activar mando', links:'Enlaces', language:'Idioma', auto:'Automático (juego)',
      game:'Web original del juego', originalRepo:'GitHub del juego original', chinese:'Extensión de chino tradicional', ourRepo:'GitHub de esta extensión',
      note:'El idioma solo afecta a esta extensión. Para traducir el juego al chino tradicional, instala la extensión de traducción.',
      toolbar:'Abre desde la barra de extensiones.', loadError:'No se pudo cargar la configuración.', saveError:'No se pudo guardar la configuración.'
    },
    'zh-Hant': {
      gamepad:'手把', enable:'啟用手把', links:'相關連結', language:'語言', auto:'自動（跟隨遊戲）',
      game:'原作者遊戲網站', originalRepo:'遊戲原作者 GitHub', chinese:'繁體中文擴充元件', ourRepo:'本擴充元件 GitHub',
      note:'語言只套用於本擴充元件。遊戲顯示繁體中文，仍需安裝繁體中文擴充元件。',
      toolbar:'請由擴充元件工具列開啟。', loadError:'無法讀取設定。', saveError:'無法儲存設定。'
    }
  };
  const normalize = value => Object.hasOwn(words,value) ? value : 'auto';
  const state = {gamepadEnabled:true,language:'auto'};
  let gameLanguage = 'en', statusKey = '';
  function render() {
    const lang = state.language === 'auto' ? gameLanguage : state.language;
    const copy = words[lang];
    document.documentElement.lang = lang;
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = copy[el.dataset.i18n];
    toggle.setAttribute('aria-label',copy.enable);
    document.querySelector('nav').setAttribute('aria-label',copy.links);
    toggle.checked = state.gamepadEnabled;
    selector.value = state.language;
    status.textContent = statusKey ? copy[statusKey] : '';
    status.hidden = !statusKey;
  }
  function message(key) { statusKey = key; render(); }
  render();
  if (api?.tabs) {
    (async () => {
      try {
        const [tab] = await api.tabs.query({active:true,currentWindow:true});
        if (!tab?.id) return;
        const response = await api.tabs.sendMessage(tab.id,{type:'ps-gamepad-language'});
        gameLanguage = Object.hasOwn(words,response?.language) ? response.language : 'en';
        render();
      } catch { /* No supported game in the active tab: keep English. */ }
    })();
  }
  if (!storage?.local) {
    message('toolbar');
    return;
  }
  const changed = new Set();
  storage.local.get(state).then(values => {
    if (!changed.has('gamepadEnabled')) state.gamepadEnabled = values.gamepadEnabled !== false;
    if (!changed.has('language')) state.language = normalize(values.language);
    render(); toggle.disabled = false; selector.disabled = false;
  }).catch(() => message('loadError'));
  async function save(key,value,control) {
    const previous = state[key];
    state[key] = value;
    control.disabled = true;
    message('');
    try {
      await storage.local.set({[key]:value});
    } catch {
      state[key] = previous;
      message('saveError');
    } finally {
      control.disabled = false;
    }
  }
  toggle.addEventListener('change', () => save('gamepadEnabled',toggle.checked,toggle));
  selector.addEventListener('change', () => save('language',normalize(selector.value),selector));
  storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.gamepadEnabled) { changed.add('gamepadEnabled'); state.gamepadEnabled = changes.gamepadEnabled.newValue !== false; }
    if (changes.language) { changed.add('language'); state.language = normalize(changes.language.newValue); }
    render();
  });
})();
