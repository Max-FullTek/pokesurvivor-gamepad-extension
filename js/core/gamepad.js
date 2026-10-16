/* Standard browser Gamepad mapping (Xbox button positions, also used by most
 * PlayStation controllers). Poll once before the game's keyboard handling.
 * Menu actions stay inside the topmost visible panel; gameplay uses Input's
 * existing shortcuts and leaves auto-targeting/combat unchanged. */
G.Gamepad = (() => {
  if (!G.GamepadExternal) document.documentElement.setAttribute('data-ps-gamepad-native', '1');
  let vector = [0, 0], previous = [], index = null, scope = null, focus = null;
  let direction = '', repeatAt = 0, suspended = false;
  const keys = new Set();
  const targets = 'button, a[href], input, select, textarea, .menu-item, .card, .cell:not(.locked), .tab, .chip, .gen-tab';

  function visible(el) {
    return !!el && !el.closest('.hidden, [hidden], [inert]') &&
      getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length > 0;
  }
  function setFocus(el) {
    if (focus) focus.classList.remove('pad-focus');
    focus = el || null;
    if (!focus) return;
    focus.classList.add('pad-focus');
    if (!focus.matches('input, textarea, select')) focus.tabIndex = focus.tabIndex < 0 ? 0 : focus.tabIndex;
    focus.focus({ preventScroll: true });
    focus.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function reset() {
    vector = [0, 0]; previous = []; keys.clear(); index = null;
    direction = ''; repeatAt = 0; scope = null; setFocus(null);
  }
  addEventListener('blur', () => { reset(); suspended = true; });
  document.addEventListener('visibilitychange', () => { reset(); suspended = true; });
  addEventListener('gamepaddisconnected', e => { if (e.gamepad.index === index) reset(); });
  document.addEventListener('pointerdown', () => setFocus(null));

  function panel() {
    const panels = [...document.querySelectorAll('.scr, #tap-start, #pull-fx, #invite-pop, #sound-panel')].filter(visible);
    // DOM order breaks ties, matching the browser's stacking order.
    panels.sort((a, b) => (+getComputedStyle(a).zIndex || 0) - (+getComputedStyle(b).zIndex || 0));
    return panels.at(-1) || null;
  }
  function buttons(root) {
    const list = [...root.querySelectorAll(targets)];
    if (root.id === 'scr-menu') list.push(...document.querySelectorAll('#topbar button, #topbar a[href]'));
    return list.filter(el => visible(el) && !el.disabled &&
      el.getAttribute('aria-disabled') !== 'true' && !el.closest('.cards.done') &&
      !el.matches('input[type=hidden]') && !el.closest('.cell.locked'));
  }
  function navigate(dir, list) {
    if (!list.length) return;
    if (!list.includes(focus)) { setFocus(list[0]); return; }
    if ((dir === 'left' || dir === 'right') && focus.matches('input[type=range], select')) {
      const sign = dir === 'left' ? -1 : 1;
      if (focus.matches('select')) {
        focus.selectedIndex = Math.max(0, Math.min(focus.options.length - 1, focus.selectedIndex + sign));
      } else {
        focus.value = Math.max(+(focus.min || 0), Math.min(+(focus.max || 100), +focus.value + sign * +(focus.step || 1)));
      }
      focus.dispatchEvent(new Event('input', { bubbles: true }));
      focus.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    const a = focus.getBoundingClientRect(), horizontal = dir === 'left' || dir === 'right';
    const sign = dir === 'left' || dir === 'up' ? -1 : 1;
    let best = null, score = Infinity, bestAligned = false;
    for (const el of list) {
      if (el === focus) continue;
      const b = el.getBoundingClientRect();
      const dx = (b.left + b.right - a.left - a.right) / 2;
      const dy = (b.top + b.bottom - a.top - a.bottom) / 2;
      const along = (horizontal ? dx : dy) * sign, cross = Math.abs(horizontal ? dy : dx);
      if (along <= 2) continue;
      const aligned = horizontal
        ? Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top) > 2
        : Math.min(a.right,b.right) - Math.max(a.left,b.left) > 2;
      // Prefer the same visual row/column. Other targets must lie within
      // a 45-degree cone so a tiny horizontal offset cannot mean "right".
      if (!aligned && cross > along) continue;
      const s = along + cross * 3;
      if ((aligned && !bestAligned) || (aligned === bestAligned && s < score)) {
        best = el; score = s; bestAligned = aligned;
      }
    }
    if (best) setFocus(best);
  }
  function back(root) {
    const b = [...root.querySelectorAll('[data-back], [id$="-close"], [id$="-back"], #btn-resume, #legal-ok')]
      .find(el => visible(el) && !el.disabled);
    if (b) b.click();
  }
  function poll(now = performance.now()) {
    keys.clear(); vector = [0, 0];
    const cfg = G.GamepadConfig.get();
    if (document.hidden || !document.hasFocus()) { reset(); suspended = true; return; }
    let pads;
    try { pads = navigator.getGamepads ? [...navigator.getGamepads()] : []; }
    catch (e) { reset(); return; } // Gamepad API unavailable/blocked by browser policy.
    const usable = pads.filter(p => p && p.connected && p.mapping === 'standard');
    const p = usable.find(p => p.index === index) || usable[0];
    G.GamepadConfig.report(p);
    // The mapping editor owns controller presses for preview/capture, never navigation.
    if (G.GamepadConfig.isOpen) { previous = p ? G.GamepadConfig.inputState(p,cfg,previous) : []; return; }
    if (!p) { reset(); return; }
    const held = G.GamepadConfig.inputState(p,cfg,previous);
    if (p.index !== index || suspended) {
      index = p.index; previous = held; suspended = false;
      // Ignore buttons already held on connect/refocus until released.
    }
    const isHeld = action => G.GamepadConfig.bindings(cfg.buttons[action]).some(n => held[n]);
    const tap = action => G.GamepadConfig.bindings(cfg.buttons[action]).some(n => held[n] && !previous[n]);
    if (!cfg.enabled) { reset(); return; }
    const x = (Number.isFinite(p.axes[cfg.axisX]) ? p.axes[cfg.axisX] : 0) * (cfg.invertX ? -1 : 1);
    const y = (Number.isFinite(p.axes[cfg.axisY]) ? p.axes[cfg.axisY] : 0) * (cfg.invertY ? -1 : 1);
    const stickVector = (stickX, stickY, mode) => {
      const length = Math.hypot(stickX, stickY);
      if (length <= cfg.deadzone) return [0,0];
      const strength = (Math.min(1,length) - cfg.deadzone) / (1 - cfg.deadzone);
      if (mode === 'four-way-move') {
        return Math.abs(stickX) > Math.abs(stickY)
          ? [Math.sign(stickX) * strength,0]
          : [0,Math.sign(stickY) * strength];
      }
      const octant = (Math.round(Math.atan2(stickY,stickX) / (Math.PI / 4)) + 8) % 8;
      const diagonal = Math.SQRT1_2;
      const directions = [[1,0],[diagonal,diagonal],[0,1],[-diagonal,diagonal],[-1,0],[-diagonal,-diagonal],[0,-1],[diagonal,-diagonal]];
      return directions[octant].map(value => value * strength);
    };
    const leftVector = stickVector(x,y,cfg.leftStickMode);
    const rightX = (Number.isFinite(p.axes[cfg.axisRX]) ? p.axes[cfg.axisRX] : 0) * (cfg.invertRX ? -1 : 1);
    const rightY = (Number.isFinite(p.axes[cfg.axisRY]) ? p.axes[cfg.axisRY] : 0) * (cfg.invertRY ? -1 : 1);
    const rightVector = ['eight-way-move','four-way-move'].includes(cfg.rightStickMode)
      ? stickVector(rightX,rightY,cfg.rightStickMode) : [0,0];
    const root = panel();
    const playing = G.Game && G.Game.state === 'playing' && !root;
    const leftStickActive = Math.hypot(x,y) > cfg.deadzone;
    const rightStickActive = Math.hypot(rightX,rightY) > cfg.deadzone;
    const tapSkill = action => G.GamepadConfig.bindings(cfg.buttons[action]).some(n =>
      (cfg.rightStickMode === 'skill-four' || n < 32 || n > 35) && held[n] && !previous[n]);
    if (!playing) vector = [0, 0];
    if (playing) {
      setFocus(null);
      vector = leftStickActive ? leftVector : rightStickActive ? rightVector : [0,0];
      // D-pad movement takes priority when it is pressed.
      const horizontal = Number(isHeld('moveRight')) - Number(isHeld('moveLeft'));
      const vertical = Number(isHeld('moveDown')) - Number(isHeld('moveUp'));
      if (['moveUp','moveDown','moveLeft','moveRight'].some(isHeld)) {
        const magnitude = Math.max(1,Math.hypot(horizontal,vertical));
        vector = [horizontal/magnitude,vertical/magnitude];
      }
      ['slot1', 'slot2', 'slot3', 'slot4'].forEach((action, i) => { if (tapSkill(action)) keys.add('digit' + (i + 1)); });
      if (tap('previous')) keys.add('keyq');
      if (tap('next')) keys.add('keye');
      if (tap('pause')) keys.add('escape');
      if (G.Judgment && G.Judgment.cinematic && tap('confirm')) keys.add('enter');
    } else if (root) {
      vector = [0, 0];
      const list = buttons(root);
      if (root !== scope) { setFocus(null); direction = ''; }
      if (!list.includes(focus)) setFocus(list[0]);
      if (root.id === 'tap-start') {
        if (tap('confirm') || tap('pause')) root.click();
      } else {
        const dir = isHeld('up') ? 'up' : isHeld('down') ? 'down' : isHeld('left') ? 'left' : isHeld('right') ? 'right' :
          held[36] ? 'up' : held[38] ? 'down' : held[39] ? 'left' : held[37] ? 'right' : '';
        if (dir && (dir !== direction || now >= repeatAt)) {
          navigate(dir, list); repeatAt = now + (dir === direction ? 130 : 350);
        }
        direction = dir;
        if (tap('confirm')) {
          if (!list.includes(focus)) setFocus(list[0]);
          else if (!focus.matches('input:not([type=checkbox]):not([type=radio]), textarea, select')) focus.click();
        } else if (tap('back') || tap('pause')) back(root);
        else if (tap('reroll') && root.id === 'scr-levelup') {
          const b = root.querySelector('#lvl-reroll'); if (visible(b) && !b.disabled) b.click();
        }
      }
    }
    scope = root;
    previous = held;
  }
  return { poll, reset, axis: () => vector, tap: key => keys.has(key), taps: () => [...keys] };
})();
