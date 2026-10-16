/* Controller preferences are device-local, separate from account/save data.
 * The extension and native implementation use the same versioned format. */
G.GamepadConfig = (() => {
  const KEY = 'ps.controller.v1';
  const DEFAULTS = {
    schemaVersion: 5,
    enabled: true, deadzone: 0.2, axisX: 0, axisY: 1, invertX: false, invertY: false,
    axisRX: 2, axisRY: 3, invertRX: false, invertRY: false,
    leftStickMode: 'eight-way-move', rightStickMode: 'skill-four',
    buttons: { confirm: 0, back: 1, reroll: 2, previous: 4, next: 5, pause: 9,
      slot1: [3,32], slot2: [1,33], slot3: [0,34], slot4: [2,35],
      moveUp: 12, moveRight: 15, moveDown: 13, moveLeft: 14,
      up: [12,32], down: [13,34], left: [14,35], right: [15,33] }
  };
  const groups = {
    play: ['previous','next','pause','slot1','slot2','slot3','slot4','moveUp','moveDown','moveLeft','moveRight'],
    menu: ['confirm','back','pause','reroll','up','down','left','right']
  };
  const bindings = value => (Array.isArray(value) ? value : [value]).filter(n => n !== -1);
  const clone = v => JSON.parse(JSON.stringify(v));
  function clean(value) {
    const next = clone(DEFAULTS);
    for (const key of Object.keys(DEFAULTS)) if (key !== 'buttons') next[key] = value[key];
    for (const key of Object.keys(DEFAULTS.buttons)) next.buttons[key] = clone(value.buttons[key]);
    return next;
  }
  function validate(value) {
    if (!value || typeof value !== 'object' || value.schemaVersion !== 5 || typeof value.enabled !== 'boolean' ||
        !['eight-way-move','four-way-move'].includes(value.leftStickMode) ||
        !['eight-way-move','four-way-move','skill-four'].includes(value.rightStickMode) ||
        !Number.isFinite(value.deadzone) || value.deadzone < 0.05 || value.deadzone > 0.6 ||
        ![value.axisX, value.axisY, value.axisRX, value.axisRY].every(n => Number.isInteger(n) && n >= 0 && n <= 7) ||
        ![value.invertX,value.invertY,value.invertRX,value.invertRY].every(v => typeof v === 'boolean') || !value.buttons) return 'invalid';
    if (new Set([value.axisX,value.axisY,value.axisRX,value.axisRY]).size !== 4) return 'axes';
    for (const key of Object.keys(DEFAULTS.buttons)) {
      const valueForKey = value.buttons[key], list = Array.isArray(valueForKey) ? valueForKey : [valueForKey];
      if (!list.length || list.length > 40 || list.some(n => !Number.isInteger(n) || n < -1 || n > 39 || n === 16) || new Set(list).size !== list.length) return 'invalid';
    }
    for (const group of Object.values(groups)) {
      const values = group.flatMap(k => bindings(value.buttons[k]));
      if (new Set(values).size !== values.length) return 'conflict';
    }
    return null;
  }
  let config = clone(DEFAULTS);
  function migrate(saved) {
    if (!saved || typeof saved !== 'object' || !saved.buttons || saved.schemaVersion === 5) return saved;
    const next = clone(saved);
    if (saved.schemaVersion === 3) {
      for (const [key,n] of [['moveUp',36],['moveRight',37],['moveDown',38],['moveLeft',39]]) {
        next.buttons[key] = [...new Set([...bindings(next.buttons[key] ?? -1), n])];
      }
    } else if (saved.schemaVersion !== 4) {
    const unusedAxes = [0,1,2,3,4,5,6,7].filter(n => n !== next.axisX && n !== next.axisY);
    next.axisRX = unusedAxes.includes(2) ? 2 : unusedAxes[0];
    next.axisRY = unusedAxes.includes(3) && next.axisRX !== 3 ? 3 : unusedAxes.find(n => n !== next.axisRX);
    next.invertRX = false; next.invertRY = false;
    // Move the old D-pad skill defaults to their matching face buttons, add
    // right-stick directions, then give the newly freed D-pad inputs to movement.
    const skillDefaults = [[3,32],[1,33],[0,34],[2,35]];
    for (const [i,key] of ['slot1','slot2','slot3','slot4'].entries()) {
      const existing = bindings(next.buttons[key] ?? -1);
      const hadDpadSkill = existing.some(n => n >= 12 && n <= 15);
      const retained = existing.filter(n => !(n >= 12 && n <= 15) && !(n >= 32 && n <= 35) && !(hadDpadSkill && n >= 0 && n <= 3));
      if (hadDpadSkill) retained.push(skillDefaults[i][0]);
      next.buttons[key] = [...new Set([...retained,skillDefaults[i][1]])];
    }
    const occupied = groups.play.filter(key => !['moveUp','moveDown','moveLeft','moveRight'].includes(key))
      .flatMap(key => key in next.buttons ? bindings(next.buttons[key]) : []);
    for (const [key,n] of [['moveUp',12],['moveDown',13],['moveLeft',14],['moveRight',15]]) {
      if (!(key in next.buttons) || bindings(next.buttons[key]).every(value => value === -1)) next.buttons[key] = occupied.includes(n) ? [-1] : [n];
      next.buttons[key] = [...new Set([...bindings(next.buttons[key]), key === 'moveUp' ? 36 : key === 'moveRight' ? 37 : key === 'moveDown' ? 38 : 39])];
    }
    for (const [key,n] of [['slot1',32],['slot2',33],['slot3',34],['slot4',35],['up',32],['right',33],['down',34],['left',35]]) {
      if (key in next.buttons) next.buttons[key] = [...new Set([...bindings(next.buttons[key]),n])];
    }
    }
    next.leftStickMode = ['eight-way-move','four-way-move'].includes(saved.leftStickMode) ? saved.leftStickMode : 'eight-way-move';
    next.rightStickMode = ['eight-way-move','four-way-move','skill-four'].includes(saved.rightStickMode) ? saved.rightStickMode : 'skill-four';
    for (const key of ['moveUp','moveRight','moveDown','moveLeft']) {
      const retained = bindings(next.buttons[key] ?? -1).filter(n => n < 36 || n > 39);
      next.buttons[key] = retained.length ? [...new Set(retained)] : [-1];
    }
    next.schemaVersion = 5;
    return next;
  }
  try {
    const saved = migrate(JSON.parse(localStorage.getItem(KEY) || 'null'));
    // The system/Guide button is reserved; remove legacy assignments on load.
    if (saved && saved.buttons) for (const key of Object.keys(DEFAULTS.buttons)) {
      if (bindings(saved.buttons[key]).includes(16)) {
        const retained = bindings(saved.buttons[key]).filter(n=>n !== 16);
        saved.buttons[key] = retained.length ? retained : -1;
      }
    }
    if (saved && !validate(saved)) config = {...clean(saved), enabled: true}; // Controller support is always available after loading.
  } catch (e) { /* malformed/unavailable storage: defaults */ }
  // Inputs 0–31 are physical buttons; 32–35 are right-stick and 36–39 left-stick
  // directions (up/right/down/left). Hysteresis avoids jitter and diagonal doubles.
  function inputState(pad, cfg, previous = []) {
    const held = Array(40).fill(false);
    pad.buttons.slice(0,32).forEach((button,n) => { held[n] = n !== 16 && !!button.pressed; });
    const axis = (n,invert) => (Number.isFinite(pad.axes[n]) ? pad.axes[n] : 0) * (invert ? -1 : 1);
    for (const [offset, x, y] of [[32,axis(cfg.axisRX,cfg.invertRX),axis(cfg.axisRY,cfg.invertRY)],[36,axis(cfg.axisX,cfg.invertX),axis(cfg.axisY,cfg.invertY)]]) {
      const values = [-y,x,y,-x], largest = Math.max(...values);
      const old = values.findIndex((value,n) => previous[offset+n] && value >= .4 && value >= largest-.15);
      if (old >= 0) held[offset+old] = true;
      else if (largest >= Math.max(.55,cfg.deadzone)) held[offset+values.indexOf(largest)] = true;
    }
    return held;
  }
  function set(value) {
    const error = validate(value); if (error) return { ok: false, error };
    // Whitelist keys; do not preserve extra or prototype-related properties.
    const next = clean(value);
    try { localStorage.setItem(KEY, JSON.stringify(next)); }
    catch (e) { return { ok: false, error: 'storage' }; }
    config = next;
    if (G.Gamepad) G.Gamepad.reset();
    return { ok: true };
  }
  return { get: () => clone(config), defaults: () => clone(DEFAULTS), validate, set, bindings, inputState, groups,
    open: () => G.GamepadSettings.open(), close: () => G.GamepadSettings.close(),
    report: pad => G.GamepadSettings.report(pad),
    get isOpen() { return G.GamepadSettings.isOpen; } };
})();
