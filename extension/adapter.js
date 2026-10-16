/* Called by the packager with the same controller engine used by the native
 * game. Runs in the extension's isolated world; never reads the closed G,
 * account data, game saves, or network requests. */
function startControllerExtension(install) {
  'use strict';
  if (!['pokesurvivor.com', 'www.pokesurvivor.com'].includes(location.hostname) ||
      !/^\/(?:index\.html|en\/(?:index\.html)?)?$/.test(location.pathname) ||
      !document.getElementById('game') || document.documentElement.hasAttribute('data-ps-controller-extension')) return;
  document.documentElement.setAttribute('data-ps-controller-extension','1');
  const visible = el => el && !el.closest('.hidden, [hidden]') && el.getClientRects().length > 0;
  const overlay = () => [...document.querySelectorAll('.scr, #boot, #tap-start, #pull-fx, #invite-pop, #sound-panel')].some(visible);
  const codes = {
    keyw: ['KeyW', 'w'], keya: ['KeyA', 'a'], keys: ['KeyS', 's'], keyd: ['KeyD', 'd'],
    keyq: ['KeyQ', 'q'], keye: ['KeyE', 'e'], escape: ['Escape', 'Escape'], enter: ['Enter', 'Enter'],
    digit1: ['Digit1', '1'], digit2: ['Digit2', '2'], digit3: ['Digit3', '3'], digit4: ['Digit4', '4']
  };
  const physical = new Set(), movement = new Set(), pulses = new Map();
  function emit(key, type) {
    const [code, value] = codes[key];
    window.dispatchEvent(new KeyboardEvent(type, { code, key: value, bubbles: true, cancelable: true }));
  }
  function release(key) { if (!physical.has(codes[key][0])) emit(key, 'keyup'); }
  function stop() {
    for (const key of movement) release(key);
    movement.clear();
    for (const [key, timer] of pulses) { clearTimeout(timer); release(key); }
    pulses.clear();
  }
  function pulse(key) {
    if (physical.has(codes[key][0]) || pulses.has(key)) return;
    emit(key, 'keydown');
    pulses.set(key, setTimeout(() => { release(key); pulses.delete(key); }, 50));
  }
  // A real held key keeps ownership when controller input is released.
  addEventListener('keydown', e => { if (e.isTrusted) physical.add(e.code); }, true);
  addEventListener('keyup', e => {
    if (!e.isTrusted) return;
    physical.delete(e.code);
    queueMicrotask(() => {
      if (!document.hidden && document.hasFocus()) {
        for (const key of movement) if (codes[key][0] === e.code) emit(key, 'keydown');
      }
    });
  }, true);
  addEventListener('blur', () => { stop(); physical.clear(); });
  document.addEventListener('visibilitychange', () => { stop(); physical.clear(); });
  addEventListener('pagehide', stop);
  let language = 'auto';
  const gameLanguage = () => document.documentElement.hasAttribute('data-pszh') || /^zh/i.test(document.documentElement.lang)
    ? 'zh-Hant' : /^es/i.test(document.documentElement.lang) ? 'es' : 'en';
  const G = {
    GamepadExternal: true,
    I18n: { get lang() { return language === 'auto' ? gameLanguage() : language; } },
    Game: { get state() { return overlay() ? 'ui' : 'playing'; } },
    // Enter is ignored by normal gameplay, but skips the Arceus cinematic.
    Judgment: { cinematic: true },
    beforeGamepadSettings: () => { stop(); pulse('escape'); }
  };
  install(G);
  const storage = globalThis.chrome?.storage;
  let enabled = !storage?.local;
  let section = null, keyboardHeading = null, lastLanguage = G.I18n.lang;
  function integrateSettings() {
    if (typeof document === 'undefined' || !document.documentElement) return;
    const body = document.getElementById('set-body');
    if (!enabled) {
      if (section) { section.remove(); section = null; }
      if (keyboardHeading) { keyboardHeading.remove(); keyboardHeading = null; }
      return;
    }
    if (document.documentElement.hasAttribute('data-ps-gamepad-native')) {
      if (section) section.hidden = true;
      return;
    }
    if (body && body.querySelector('.keys')) {
      if (!section || !body.contains(section)) {
        section = document.createElement('section'); section.id = 'ps-controller-section';
        section.setAttribute('translate','no'); body.appendChild(section);
      }
      const keyboard = body.querySelector('.keys');
      if (keyboard && !body.querySelector('[data-pad-keyboard]')) {
        keyboard.insertAdjacentHTML('beforebegin',G.GamepadSettings.keyboardHeading());
        keyboardHeading = keyboard.previousElementSibling;
      }
      if (section.dataset.language !== G.I18n.lang) {
        section.dataset.language = G.I18n.lang; section.innerHTML = G.GamepadSettings.controlsSection({external:true});
        if (keyboardHeading && body.contains(keyboardHeading)) {
          keyboardHeading.outerHTML = G.GamepadSettings.keyboardHeading();
          keyboardHeading = body.querySelector('[data-pad-keyboard]');
        }
        G.GamepadSettings.wireControls(section);
      }
    }
    if (lastLanguage !== G.I18n.lang) {
      lastLanguage = G.I18n.lang; G.GamepadSettings.refresh();
    }
  }
  function setEnabled(value) {
    enabled = value !== false;
    if (!enabled) { stop(); G.Gamepad.reset(); G.GamepadConfig.close(); }
    integrateSettings();
  }
  if (storage?.local) {
    const changed = new Set();
    storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes.language) {
        changed.add('language');
        const value = changes.language.newValue;
        language = ['en','es','zh-Hant'].includes(value) ? value : 'auto';
      }
      if (changes.gamepadEnabled) changed.add('gamepadEnabled');
      if (changes.language || changes.gamepadEnabled) setEnabled(changes.gamepadEnabled ? changes.gamepadEnabled.newValue : enabled);
    });
    storage.local.get({gamepadEnabled:true,language:'auto'}).then(values => {
      if (!changed.has('language')) language = ['en','es','zh-Hant'].includes(values.language) ? values.language : 'auto';
      setEnabled(changed.has('gamepadEnabled') ? enabled : values.gamepadEnabled);
    }).catch(() => { if (!changed.has('gamepadEnabled')) setEnabled(true); });
  }
  globalThis.chrome?.runtime?.onMessage.addListener((message, sender, reply) => {
    if (message?.type === 'ps-gamepad-language') reply({language:gameLanguage()});
  });
  new MutationObserver(integrateSettings).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['lang','data-pszh']});
  integrateSettings();
  function poll(now) {
    requestAnimationFrame(poll);
    if (!enabled) return;
    // Future native support takes precedence, even if it loads after this script.
    if (document.documentElement.hasAttribute('data-ps-gamepad-native')) {
      stop(); G.Gamepad.reset(); G.GamepadConfig.close(); if (section) section.hidden = true; return;
    }

    G.Gamepad.poll(now);
    const [x, y] = G.Gamepad.axis();
    const next = new Set();
    // The official build only exposes keyboard input: quantize to 8 directions.
    if (Math.abs(x) > 0.01) next.add(x < 0 ? 'keya' : 'keyd');
    if (Math.abs(y) > 0.01) next.add(y < 0 ? 'keyw' : 'keys');
    for (const key of movement) if (!next.has(key)) { release(key); movement.delete(key); }
    for (const key of next) if (!movement.has(key)) { emit(key, 'keydown'); movement.add(key); }
    for (const key of G.Gamepad.taps()) pulse(key);
  }
  requestAnimationFrame(poll);
  // Extension scripts are unloaded with the document; pagehide releases owned keys.
}
