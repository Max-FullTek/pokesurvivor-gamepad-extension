const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const { content } = require('../tools/build_extension.cjs');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function fixture(extension = false, url = 'https://pokesurvivor.com/', storage = null, runtime = null) {
  const w = new JSDOM('<html lang="zh-Hant"><body><canvas id="game"></canvas><section class="scr hidden" id="scr-menu"><button id="play">Play</button></section><section id="scr-settings" class="scr hidden"><button id="set-close">Close</button><div id="set-tabs"><button class="gen-tab on" data-t="sound">Sound</button><button class="gen-tab" data-t="ctl">Controls</button></div><div id="set-body"><div class="keys"><kbd>WASD</kbd><span>move</span></div></div></section></body></html>', { url, runScripts: 'outside-only' }).window;
  const pad = { index: 0, mapping: 'standard', connected: true, axes: [0, 0, 0, 0], buttons: Array.from({ length: 32 }, () => ({ pressed: false })) };
  w.navigator.getGamepads = () => [pad];
  if (storage || runtime) w.chrome = {storage,runtime};
  w.document.hasFocus = () => true;
  Object.defineProperty(w.document, 'hidden', { value: false, configurable: true });
  w.HTMLElement.prototype.getClientRects = function () { return this.closest('.hidden, [hidden]') ? [] : [{ top: 0, left: 0, right: 100, bottom: 20 }]; };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  let callback;
  w.requestAnimationFrame = cb => { callback = cb; return 1; };
  const events = [];
  for (const type of ['keydown', 'keyup']) w.addEventListener(type, e => events.push([type, e.code]));
  for (const tab of w.document.querySelectorAll('#set-tabs button')) tab.onclick = () => {
    for (const other of w.document.querySelectorAll('#set-tabs button')) other.classList.toggle('on',other === tab);
    w.document.getElementById('set-body').innerHTML = `<p>${tab.textContent} settings</p>${tab.dataset.t === "ctl" ? '<div class="keys"><kbd>WASD</kbd><span>move</span></div>' : ""}`;
  };
  w.document.getElementById('set-close').onclick = () => w.document.getElementById('scr-settings').classList.add('hidden');
  if (extension) w.eval(process.env.TEST_BUILT_EXTENSION ? read('dist/controller-extension/content.js') : content());
  else {
    w.G = { Game: { state: 'playing' } };
    w.eval(read('js/core/gamepad-config.js'));
    w.G.GamepadArtwork = { xbox: read('assets/controllers/xbox-one.svg') };
    w.eval(read('js/ui/gamepad-settings.js'));
    w.eval(read('js/core/gamepad.js'));
    callback = n => w.G.Gamepad.poll(n);
  }
  let now = 0;
  return { w, pad, events, tick: () => callback && callback(now += 16) };
}

test('controller settings reject invalid/conflicting mappings and persist only their own key', () => {
  const { w } = fixture(); const c = w.G.GamepadConfig;
  const defaults = c.defaults().buttons;
  assert.deepEqual(Array.from(defaults.slot1),[3,32]); assert.deepEqual(Array.from(defaults.slot2),[1,33]);
  assert.deepEqual(Array.from(defaults.slot3),[0,34]); assert.deepEqual(Array.from(defaults.slot4),[2,35]);
  assert.deepEqual([defaults.moveUp,defaults.moveRight,defaults.moveDown,defaults.moveLeft],[12,15,13,14]);
  assert.equal(c.defaults().leftStickMode,'eight-way-move'); assert.equal(c.defaults().rightStickMode,'skill-four');
  const summary = w.document.createElement('div'); summary.innerHTML = w.G.GamepadSettings.controlsSection();
  const summaryText = summary.textContent;
  assert.match(summaryText,/A\s*B\s*X\s*Y\s*\/\s*R Stick/);
  assert.doesNotMatch(summary.querySelector('.keys').children[2].textContent,/[↑↓←→]/);
  assert.match(summaryText,/↑/); assert.match(summaryText,/十字鍵移動/);
  w.localStorage.setItem('account-save', 'untouched');
  let v = c.defaults(); v.buttons.next = v.buttons.previous;
  assert.equal(c.set(v).error, 'conflict');
  v = c.defaults(); v.axisY = v.axisX;
  assert.equal(c.set(v).error, 'axes');
  v = c.defaults(); v.deadzone = NaN;
  assert.equal(c.set(v).error, 'invalid');
  v = c.defaults(); v.buttons.next = 7; v.deadzone = 0.35;
  assert.equal(c.set(v).ok, true);
  assert.equal(JSON.parse(w.localStorage.getItem('ps.controller.v1')).buttons.next, 7);
  assert.equal(w.localStorage.getItem('account-save'), 'untouched');
  const before = JSON.stringify(c.get());
  w.Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
  assert.equal(c.set(c.defaults()).error, 'storage');
  assert.equal(JSON.stringify(c.get()), before);
  w.close();
});

test('controller profiles discard unknown fields on load and save and recover from malformed data', () => {
  const { w } = fixture();
  const saved = w.G.GamepadConfig.defaults();
  saved.obsoleteLayout = 'ps5'; saved.buttons.obsoleteAction = 16; saved.buttons.next = 7;
  w.localStorage.setItem('account-save','untouched');
  w.localStorage.setItem('ps.controller.v1',JSON.stringify(saved));
  w.eval(read('js/core/gamepad-config.js'));
  const config = w.G.GamepadConfig, loaded = config.get();
  assert.equal(loaded.obsoleteLayout,undefined);
  assert.equal(loaded.buttons.obsoleteAction,undefined);
  assert.equal(loaded.buttons.next,7);
  assert.equal(config.set(saved).ok,true);
  const stored = JSON.parse(w.localStorage.getItem('ps.controller.v1'));
  assert.equal(stored.obsoleteLayout,undefined);
  assert.equal(stored.buttons.obsoleteAction,undefined);
  w.localStorage.setItem('ps.controller.v1','{broken');
  w.eval(read('js/core/gamepad-config.js'));
  assert.equal(JSON.stringify(w.G.GamepadConfig.get()),JSON.stringify(w.G.GamepadConfig.defaults()));
  assert.equal(w.localStorage.getItem('account-save'),'untouched');
  w.close();
});

test('loading an older disabled profile enables support without losing custom bindings', () => {
  const { w } = fixture();
  const previous = w.G.GamepadConfig.defaults(); previous.schemaVersion = 2; previous.enabled = false; previous.buttons.next = 7; previous.deadzone = .35;
  previous.buttons.slot1 = [12,2]; previous.buttons.slot2 = [15,3]; previous.buttons.slot3 = [13,1]; previous.buttons.slot4 = [14,0];
  w.localStorage.setItem('ps.controller.v1',JSON.stringify(previous));
  w.eval(read('js/core/gamepad-config.js'));
  assert.equal(w.G.GamepadConfig.get().enabled,true);
  assert.equal(w.G.GamepadConfig.get().buttons.next,7);
  assert.equal(w.G.GamepadConfig.get().deadzone,.35);
  const buttons = w.G.GamepadConfig.get().buttons;
  assert.deepEqual(Array.from(buttons.slot1),[3,32]); assert.deepEqual(Array.from(buttons.slot2),[1,33]);
  assert.deepEqual(Array.from(buttons.slot3),[0,34]); assert.deepEqual(Array.from(buttons.slot4),[2,35]);
  assert.deepEqual([buttons.moveUp,buttons.moveDown,buttons.moveLeft,buttons.moveRight].map(value => [...value]),[[12],[13],[14],[15]]);
  w.close();
});

test('schema 3 profiles migrate to explicit stick modes and stop routing analog directions through digital bindings', () => {
  const { w } = fixture(); const saved = w.G.GamepadConfig.defaults();
  saved.schemaVersion = 3; saved.buttons.next = [5,7];
  w.localStorage.setItem('ps.controller.v1', JSON.stringify(saved));
  w.eval(read('js/core/gamepad-config.js'));
  const migrated = w.G.GamepadConfig.get();
  assert.equal(migrated.schemaVersion, 5);
  assert.deepEqual(Array.from(migrated.buttons.next), [5,7]);
  assert.deepEqual(Array.from(migrated.buttons.moveUp), [12]);
  assert.equal(migrated.leftStickMode,'eight-way-move'); assert.equal(migrated.rightStickMode,'skill-four');
  assert.equal(w.G.GamepadConfig.validate(migrated), null);
  w.close();
});

test('native remapped buttons, axes, inversion, deadzone and disable affect actual input', () => {
  const { w, pad, tick } = fixture(); const c = w.G.GamepadConfig;
  const v = c.defaults(); v.buttons.next = 7; v.axisX = 2; v.axisY = 3; v.axisRX = 4; v.axisRY = 5; v.invertX = true; v.deadzone = .3;
  c.set(v); tick();
  pad.buttons[5].pressed = true; tick(); assert.equal(w.G.Gamepad.tap('keye'), false);
  pad.buttons[7].pressed = true; pad.axes[2] = .65; tick();
  assert.equal(w.G.Gamepad.tap('keye'), true); assert.ok(Math.abs(w.G.Gamepad.axis()[0] + .5) < 1e-8);
  tick(); assert.equal(w.G.Gamepad.tap('keye'), false);
  pad.axes[2] = .2; tick(); assert.equal(w.G.Gamepad.axis()[0], 0);
  v.enabled = false; c.set(v); pad.axes[2] = 1; tick(); assert.equal(w.G.Gamepad.axis()[0], 0);
  w.close();
});

test('ABXY and the right stick choose the same four skills while the D-pad maps four-way movement', () => {
  const { w, pad, tick } = fixture();
  // Right stick up selects skill 1; the matching Y face button selects it too.
  tick();
  pad.axes[3] = -0.8; tick(); assert.ok(w.G.Gamepad.taps().includes('digit1'));
  pad.axes[3] = 0; tick(); pad.buttons[3].pressed = true; tick(); assert.ok(w.G.Gamepad.taps().includes('digit1'));
  pad.buttons[3].pressed = false; tick(); pad.axes[3] = 0.8; tick(); assert.ok(w.G.Gamepad.taps().includes('digit3'));
  pad.axes[3] = 0; tick(); pad.buttons[0].pressed = true; tick(); assert.ok(w.G.Gamepad.taps().includes('digit3'));
  pad.buttons[0].pressed = false; tick(); pad.buttons[12].pressed = true; tick();
  pad.buttons[12].pressed = false; tick(); pad.buttons[15].pressed = true; tick();
  assert.deepEqual(Array.from(w.G.Gamepad.axis()),[1,0]);
  pad.buttons[15].pressed = false; pad.axes[1] = -0.8; tick();
  assert.equal(w.G.GamepadConfig.inputState(pad,w.G.GamepadConfig.get())[36],true);
  w.close();
});

test('left and right sticks support selectable eight-way and four-way movement without breaking skill mode', () => {
  const { w, pad, tick } = fixture(); const c = w.G.GamepadConfig; tick();
  pad.axes[0] = .8; pad.axes[1] = -.8; tick();
  const diagonal = Array.from(w.G.Gamepad.axis());
  assert.ok(diagonal[0] > .6 && diagonal[1] < -.6, `expected diagonal movement, got ${diagonal}`);
  let cfg = c.get(); cfg.leftStickMode = 'four-way-move'; c.set(cfg); tick();
  const cardinal = Array.from(w.G.Gamepad.axis());
  assert.ok(cardinal[0] === 0 || cardinal[1] === 0, `expected cardinal movement, got ${cardinal}`);
  pad.axes[0] = 0; pad.axes[1] = 0; pad.axes[2] = .8; pad.axes[3] = -.8; tick();
  assert.deepEqual(Array.from(w.G.Gamepad.axis()),[0,0]); // Right stick defaults to four-skill selection.
  cfg = c.get(); cfg.rightStickMode = 'eight-way-move'; c.set(cfg); tick();
  const rightDiagonal = Array.from(w.G.Gamepad.axis());
  assert.ok(rightDiagonal[0] > .6 && rightDiagonal[1] < -.6, `expected right-stick diagonal movement, got ${rightDiagonal}`);
  cfg = c.get(); cfg.rightStickMode = 'four-way-move'; c.set(cfg); tick();
  const rightCardinal = Array.from(w.G.Gamepad.axis());
  assert.ok(rightCardinal[0] === 0 || rightCardinal[1] === 0, `expected right-stick cardinal movement, got ${rightCardinal}`);
  w.close();
});

test('settings UI saves edited bindings and cancels without changing preferences', () => {
  const { w } = fixture(); const c = w.G.GamepadConfig;
  const pick = (n,key) => {
    w.document.querySelector(`[data-pad-button="${n}"]`).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    w.document.querySelector(`[data-pad-pick="${key}"]`).click();
  };
  c.open(); assert.equal(c.isOpen,true);
  pick(7,'next'); w.document.querySelector('[data-pad-save]').click();
  assert.deepEqual(Array.from(c.get().buttons.next),[5,7]); assert.equal(c.isOpen,false);
  c.open(); pick(6,'next'); w.document.querySelector('[data-pad-reset]').click();
  assert.equal(w.document.querySelector('[data-pad-button="7"] [data-pad-slot]').textContent,'');
  w.document.querySelector('#ps-pad-close').click();
  assert.deepEqual(Array.from(c.get().buttons.next),[5,7]); w.close();
});

test('real presses highlight SVG positions without navigating, assigning or activating Save', () => {
  const { w,pad,tick } = fixture(); const c=w.G.GamepadConfig; c.open(); tick();
  pad.buttons[7].pressed=true; pad.axes[0]=1; tick();
  assert.ok(w.document.querySelector('[data-pad-button="7"]').classList.contains('is-pressed'));
  assert.equal(w.G.Gamepad.taps().length,0); assert.equal(w.G.Gamepad.axis()[0],0);
  assert.equal(c.isOpen,true); assert.equal(c.get().buttons.next,5);
  assert.equal(w.document.querySelector('[data-pad-button="7"] [data-pad-slot]').textContent,'');
  pad.buttons[7].pressed=false; tick();
  assert.equal(w.document.querySelector('[data-pad-button="7"]').classList.contains('is-pressed'),false);
  w.close();
});

test('stick indicators are centered and stick clicks bind separately from analog movement', () => {
  const { w, pad, tick } = fixture(); const c = w.G.GamepadConfig;
  c.open(); tick();
  const left = w.document.querySelector('[data-pad-stick=left]');
  const right = w.document.querySelector('[data-pad-stick=right]');
  const center = n => w.document.querySelector(`[data-pad-button="${n}"]`).getAttribute('transform').match(/translate\(([-\d.]+)\s+([-\d.]+)\)/).slice(1).map(Number);
  const [lx,ly]=center(10),[,ry]=center(11);
  assert.equal(+left.getAttribute('cx'),lx);
  assert.equal(+left.getAttribute('cy'),ly);
  assert.equal(+right.getAttribute('cy'),ry);
  pad.axes[0] = 1; pad.axes[3] = -.5; tick();
  assert.equal(+left.getAttribute('cx'),lx+17);
  assert.equal(+left.getAttribute('cy'),ly);
  assert.equal(+right.getAttribute('cy'),ry-8.5);
  w.document.querySelector('[data-pad-button="10"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.match(w.document.querySelector('[data-pad-picker] h3').textContent,/LS/);
  assert.equal(w.document.querySelector('[data-pad-picker] .sub'),null);
  w.document.querySelector('[data-pad-pick=pause]').click();
  w.document.querySelector('[data-pad-save]').click();
  tick();
  assert.ok(w.G.Gamepad.axis()[0] > 0);
  assert.equal(w.G.Gamepad.tap('escape'),false);
  pad.axes[0] = 0; pad.axes[2] = 1; tick();
  assert.equal(w.G.Gamepad.axis()[0],0);
  assert.equal(w.G.Gamepad.axis()[1],0);
  pad.buttons[10].pressed = true; tick();
  assert.equal(w.G.Gamepad.tap('escape'),true);
  assert.deepEqual(Array.from(c.get().buttons.pause),[9,10]);
  w.close();
});

test('button pickers group functions, use an SVG close control, and retain English stick-press titles', () => {
  const { w } = fixture(); w.G.I18n = {lang:'en'};
  w.G.GamepadConfig.open();
  assert.ok(w.document.querySelector('footer [data-pad-message]'));
  w.document.querySelector('[data-pad-button="11"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.equal(w.document.querySelector('[data-pad-picker] h3').textContent,'RS (right stick press)');
  assert.ok(w.document.querySelector('[data-pad-pick-close] svg'));
  assert.equal(w.document.querySelector('[data-pad-pick-close]').getAttribute('aria-label'),'Close');
  const groups = [...w.document.querySelectorAll('.ps-pad-option-group')].map(group => [...group.querySelectorAll('[data-pad-pick]')].map(el => el.dataset.padPick));
  assert.deepEqual(groups,[['previous','next'],['slot1','slot3'],['slot2','slot4'],['pause','off'],['moveUp','moveRight','moveDown','moveLeft']]);
  w.document.querySelector('[data-pad-pick-close]').click();
  assert.equal(w.document.querySelector('[data-pad-picker]').hidden,true);
  assert.equal(w.document.activeElement.dataset.padButton,'11');
  w.close();
});

test('stick picker separates push mode from stick press assignments and shows both labels on the diagram', () => {
  const { w } = fixture(); w.G.I18n = {lang:'zh-Hant'}; w.G.GamepadConfig.open();
  w.document.querySelector('[data-pad-button="10"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const picker = w.document.querySelector('[data-pad-picker]');
  assert.equal(picker.querySelector('.ps-pad-stick-mode > strong').textContent,'搖桿推動');
  assert.equal(picker.querySelector('.ps-pad-stick-press-heading').textContent,'搖桿按下');
  assert.equal(picker.querySelector('.ps-pad-stick-mode small'),null);
  assert.match(picker.textContent,/招式 1/);
  w.document.querySelector('[data-pad-pick=slot1]').click();
  const ls = w.document.querySelector('[data-pad-button="10"]');
  assert.equal(ls.querySelector('[data-pad-mode-slot]').textContent,'八方向移動');
  assert.equal(ls.querySelector('[data-pad-slot]').textContent,'招式 1');
  assert.match(ls.getAttribute('aria-label'),/搖桿推動: 八方向移動.*搖桿按下: 招式 1/);
  const rs = w.document.querySelector('[data-pad-button="11"]');
  assert.equal(rs.querySelector('[data-pad-mode-slot]').textContent,'四方向選招');
  assert.equal(rs.querySelector('[data-pad-slot]').textContent,'未指定');
  w.close();
});

test('diagram labels keep D-pad rows ordered, face labels below and center labels above with orthogonal connectors', () => {
  const { w } = fixture(); w.G.GamepadConfig.open();
  const svg = w.document.querySelector('.ps-pad-diagram');
  const absoluteLabel = index => {
    const group = svg.querySelector(`[data-pad-button="${index}"]`);
    const [, gx, gy] = group.getAttribute('transform').match(/translate\(([-\d.]+)\s+([-\d.]+)\)/);
    const label = group.querySelector('[data-pad-slot]');
    return [+gx + +label.getAttribute('x'), +gy + +label.getAttribute('y')];
  };
  const rows=[12,14,15,13].map(absoluteLabel);
  assert.ok(rows.every(row=>row[0]===rows[0][0]));
  assert.ok(rows.every((row,i)=>i===0||row[1]>rows[i-1][1]));
  for(const n of [0,1,2,3]) {
    assert.ok(+svg.querySelector(`[data-pad-button="${n}"] [data-pad-slot]`).getAttribute('y')>16);
    assert.equal(svg.querySelector(`[data-pad-link="${n}"]`),null);
  }
  for(const n of [8,9]) assert.ok(+svg.querySelector(`[data-pad-button="${n}"] [data-pad-slot]`).getAttribute('y')<-18);
  for (const connector of svg.querySelectorAll('.ps-pad-label-link')) {
    const commands = [...connector.getAttribute('d').matchAll(/([A-Z])\s*([-\d.]+)(?:\s+([-\d.]+))?/g)].map(match => match[1]);
    assert.ok(commands.length >= 2);
    assert.ok(commands.every(command => command === 'M' || command === 'H' || command === 'V'));
    const axes = commands.slice(1);
    let bends = 0;
    for (let i=1;i<axes.length;i++) if (axes[i] !== axes[i-1]) bends++;
    assert.ok(bends <= 2, `${connector.getAttribute('d')} has ${bends} bends`);
  }
  w.close();
});

test('stick calibration learns directions without numeric fields and only commits completed gestures', () => {
  const { w, pad, tick } = fixture(); const c = w.G.GamepadConfig; c.open(); tick();
  assert.equal(w.document.querySelector('[data-pad=axisX]'), null);
  assert.equal(w.document.querySelector('[data-pad=axisY]'), null);
  w.document.querySelector('[data-pad-calibrate]').click();
  for (let i = 0; i < 17; i++) tick();
  assert.match(w.document.querySelector('[data-pad-message]').textContent, /向右/);
  pad.axes[0] = -.95; tick();
  assert.match(w.document.querySelector('[data-pad-message]').textContent, /回到中央/);
  pad.axes[0] = 0; for (let i = 0; i < 17; i++) tick();
  assert.match(w.document.querySelector('[data-pad-message]').textContent, /向下/);
  pad.axes[1] = .95; tick();
  assert.match(w.document.querySelector('[data-pad-message]').textContent, /右搖桿/);
  pad.axes[1] = 0; for (let i = 0; i < 17; i++) tick();
  assert.match(w.document.querySelector('[data-pad-message]').textContent, /向右/);
  pad.axes[2] = .95; tick();
  pad.axes[2] = 0; for (let i = 0; i < 17; i++) tick();
  assert.match(w.document.querySelector('[data-pad-message]').textContent, /向下/);
  pad.axes[3] = -.95; tick();
  assert.match(w.document.querySelector('[data-pad-message]').textContent, /校正完成/);
  assert.equal(c.get().axisX, 0);
  w.document.querySelector('[data-pad-save]').click();
  assert.equal(c.get().axisX, 0); assert.equal(c.get().axisY, 1); assert.equal(c.get().invertX, true);
  assert.equal(c.get().axisRX, 2); assert.equal(c.get().axisRY, 3); assert.equal(c.get().invertRX, false); assert.equal(c.get().invertRY, true);
  pad.axes[1] = 0; c.open(); tick();
  w.document.querySelector('[data-pad-calibrate]').click();
  w.document.querySelector('[data-pad-save]').click();
  assert.equal(c.isOpen, true); assert.match(w.document.querySelector('[data-pad-message]').textContent, /完成或取消/);
  pad.connected = false; tick();
  assert.match(w.document.querySelector('[data-pad-message]').textContent, /連接手把/);
  w.document.querySelector('#ps-pad-close').click(); assert.equal(c.get().axisX, 0);
  w.close();
});

test('keyboard opens a button picker and Escape cancels it before closing settings', () => {
  const {w}=fixture(); const c=w.G.GamepadConfig; c.open();
  w.document.querySelector('[data-pad-button="7"]').dispatchEvent(new w.KeyboardEvent('keydown',{code:'Enter',bubbles:true}));
  assert.equal(w.document.querySelector('[data-pad-picker]').hidden,false);
  w.document.querySelector('[data-pad-pick=next]').click();
  w.document.querySelector('[data-pad-save]').click();
  assert.deepEqual(Array.from(c.get().buttons.next),[5,7]);
  c.open(); w.document.querySelector('[data-pad-button="7"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{code:'Escape',bubbles:true}));
  assert.equal(w.document.querySelector('[data-pad-picker]').hidden,true); assert.equal(c.isOpen,true);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{code:'Escape',bubbles:true}));
  assert.equal(c.isOpen,false); w.close();
});

test('context switch preserves bindings in the other context', () => {
  const {w}=fixture(); const c=w.G.GamepadConfig; c.open();
  assert.equal(w.document.querySelectorAll('.ps-pad-diagram-frame [data-pad-context]').length,2);
  w.document.querySelector('[data-pad-context=menu]').click();
  assert.equal(w.document.querySelector('[data-pad-button="0"]').getAttribute('aria-label'),'A: 確認');
  w.document.querySelector('[data-pad-button="5"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  w.document.querySelector('[data-pad-pick=confirm]').click();
  w.document.querySelector('[data-pad-context=play]').click();
  assert.equal(w.document.querySelector('[data-pad-button="5"]').getAttribute('aria-label'),'RB: 下一招');
  w.document.querySelector('[data-pad-save]').click();
  assert.deepEqual(Array.from(c.get().buttons.confirm),[0,5]); assert.equal(c.get().buttons.next,5);
  assert.equal(c.validate(c.get()),null); w.close();
});

test('all standard devices use the Xbox diagram, ignoring obsolete appearance preferences', () => {
  const { w, pad, tick } = fixture();
  pad.id = 'Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)';
  w.localStorage.setItem('ps.controller.layout.v1','ps5');
  tick(); w.G.GamepadConfig.open();
  assert.ok(w.document.querySelector('.ccsvg--xbox-one'));
  assert.equal(w.document.querySelector('[data-pad-layout]'),null);
  assert.equal(w.document.querySelectorAll('[data-pad-button]').length,16);
  assert.equal(w.document.querySelectorAll('[data-stick-direction]').length,0);
  assert.equal(w.document.querySelectorAll('[data-pad-stick-directions]').length,0);
  w.document.querySelector('[data-pad-button="10"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.equal(w.document.querySelectorAll('[data-stick-mode]').length,2);
  w.document.querySelector('[data-stick-mode="four-way-move"]').click();
  w.document.querySelector('[data-pad-pick-close]').click();
  w.document.querySelector('[data-pad-button="11"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.equal(w.document.querySelectorAll('[data-stick-mode]').length,3);
  assert.equal(w.document.querySelector('[data-stick-mode="skill-four"]').getAttribute('aria-checked'),'true');
  w.document.querySelector('[data-stick-mode="eight-way-move"]').click();
  w.document.querySelector('[data-pad-pick-close]').click();
  assert.ok(w.document.querySelector('[data-pad-clear-all]').closest('header'));
  assert.ok(w.document.querySelector('[data-pad-clear-all]').classList.contains('danger'));
  assert.ok(w.document.querySelector('#ps-pad-close').classList.contains('ghost'));
  pad.buttons[7].pressed = true; tick();
  assert.ok(w.document.querySelector('[data-pad-button="7"]').classList.contains('is-pressed'));
  w.document.querySelector('[data-pad-save]').click();
  assert.equal(w.G.GamepadConfig.get().leftStickMode,'four-way-move');
  assert.equal(w.G.GamepadConfig.get().rightStickMode,'eight-way-move');
  w.G.GamepadConfig.open();
  assert.ok(w.document.querySelector('.ccsvg--xbox-one'));
  w.close();
});

test('reusable functions persist and fire from either binding in native and extension input', () => {
  for (const extension of [false,true]) {
    const { w, pad, tick, events } = fixture(extension);
    if(extension) (w.document.getElementById('scr-settings').classList.remove('hidden'), w.document.getElementById('ps-controller-keybindings').click()); else w.G.GamepadConfig.open();
    w.document.querySelector('[data-pad-button="7"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    w.document.querySelector('[data-pad-pick=next]').click();
    w.document.querySelector('[data-pad-save]').click();
    assert.deepEqual(JSON.parse(w.localStorage.getItem('ps.controller.v1')).buttons.next,[5,7]);
    if(extension) w.document.getElementById('set-close').click();
    tick();
    for(const n of [5,7]) {
      pad.buttons[n].pressed=true; tick();
      if(extension) assert.deepEqual(events.at(-1),['keydown','KeyE']); else assert.equal(w.G.Gamepad.tap('keye'),true);
      pad.buttons[n].pressed=false; tick();
    }
    if(extension) (w.document.getElementById('scr-settings').classList.remove('hidden'), w.document.getElementById('ps-controller-keybindings').click()); else w.G.GamepadConfig.open();
    w.document.querySelector('[data-pad-clear-all]').click();
    assert.equal(w.document.querySelector('[data-pad-button="5"] [data-pad-slot]').textContent,'');
    w.document.querySelector('#ps-pad-close').click();
    assert.deepEqual(JSON.parse(w.localStorage.getItem('ps.controller.v1')).buttons.next,[5,7]);
    w.close();
  }
});

test('isolated extension moves, pulses shortcuts, releases on disconnect and yields to native support', () => {
  const { w, pad, events, tick } = fixture(true);
  assert.equal(w.G, undefined); assert.ok(w.document.getElementById('ps-controller-keybindings'));
  tick(); pad.axes[0] = 1; tick(); assert.deepEqual(events.at(-1), ['keydown', 'KeyD']);
  tick(); assert.equal(events.filter(e => e[0] === 'keydown').length, 1);
  pad.buttons[9].pressed = true; tick(); assert.deepEqual(events.at(-1), ['keydown', 'Escape']);
  tick(); assert.equal(events.filter(e => e[0] === 'keydown' && e[1] === 'Escape').length, 1);
  pad.connected = false; tick(); assert.ok(events.some(e => e[0] === 'keyup' && e[1] === 'KeyD'));
  pad.connected = true; tick();
  const beforeNative = events.length;
  w.document.documentElement.setAttribute('data-ps-gamepad-native', '1'); tick();
  assert.equal(w.document.getElementById('ps-controller-section').hidden, true);
  assert.ok(events.slice(beforeNative).some(e => e[0] === 'keyup' && e[1] === 'KeyD'));
  w.close();
});

function extensionStorage(initial = {}) {
  const values = {...initial}, listeners = [];
  return {
    local: {
      get: async defaults => ({...defaults,...values}),
      set: async update => {
        const changes = {};
        for (const [key,value] of Object.entries(update)) { changes[key] = {oldValue:values[key],newValue:value}; values[key] = value; }
        for (const listener of listeners) listener(changes,'local');
      }
    },
    onChanged: {addListener:listener => listeners.push(listener)}
  };
}

test('extension switch releases input, removes injected controls and restores them without losing bindings', async () => {
  const storage = extensionStorage();
  const { w, pad, events, tick } = fixture(true,'https://pokesurvivor.com/',storage);
  await new Promise(resolve => setTimeout(resolve,0));
  assert.ok(w.document.getElementById('ps-controller-section'));
  tick(); pad.axes[0] = 1; tick();
  assert.deepEqual(events.at(-1),['keydown','KeyD']);
  await storage.local.set({gamepadEnabled:false});
  assert.deepEqual(events.at(-1),['keyup','KeyD']);
  assert.equal(w.document.getElementById('ps-controller-section'),null);
  assert.equal(w.document.querySelector('[data-pad-keyboard]'),null);
  const afterDisable = events.length;
  pad.buttons[0].pressed=true; pad.buttons[9].pressed=true; tick(); tick();
  assert.equal(events.length,afterDisable);
  pad.axes[0]=0; pad.buttons[0].pressed=false; pad.buttons[9].pressed=false;
  await storage.local.set({gamepadEnabled:true}); tick();
  w.document.getElementById('ps-controller-keybindings').click();
  assert.equal(w.document.querySelector('#ps-gamepad-dialog').classList.contains('hidden'),false);
  const saved = w.localStorage.getItem('ps.controller.v1');
  await storage.local.set({gamepadEnabled:false});
  assert.equal(w.document.querySelector('#ps-gamepad-dialog').classList.contains('hidden'),true);
  assert.equal(w.localStorage.getItem('ps.controller.v1'),saved);
  assert.equal(w.document.querySelector('.pad-focus'),null);
  const second = fixture(true,'https://pokesurvivor.com/',storage);
  await new Promise(resolve => setTimeout(resolve,0));
  assert.equal(second.w.document.getElementById('ps-controller-keybindings'),null);
  await storage.local.set({gamepadEnabled:true});
  assert.ok(second.w.document.getElementById('ps-controller-keybindings'));
  w.close(); second.w.close();
});

test('popup switch persists and synchronizes the global setting and rolls back failed saves', async () => {
  const storage = extensionStorage({gamepadEnabled:false});
  const w = new JSDOM(read('extension/popup.html'),{runScripts:'outside-only'}).window;
  w.chrome = {storage}; w.eval(read('extension/popup.js'));
  await new Promise(resolve => setTimeout(resolve,0));
  const toggle = w.document.getElementById('gamepad-enabled');
  assert.equal(toggle.disabled,false); assert.equal(toggle.checked,false);
  toggle.click(); await new Promise(resolve => setTimeout(resolve,0));
  assert.equal((await storage.local.get({})).gamepadEnabled,true);
  await storage.local.set({gamepadEnabled:false}); assert.equal(toggle.checked,false);
  storage.local.set = async () => { throw new Error('storage unavailable'); };
  toggle.click(); await new Promise(resolve => setTimeout(resolve,0));
  assert.equal(toggle.checked,false); assert.equal(toggle.disabled,false);
  assert.match(w.document.getElementById('toggle-status').textContent,/Could not save/);
  w.close();
});

test('popup and controller follow the game language, allow overrides and preserve the game language', async () => {
  const storage = extensionStorage(), listeners = [];
  const runtime = {onMessage:{addListener:listener => listeners.push(listener)}};
  const {w} = fixture(true,'https://pokesurvivor.com/',storage,runtime);
  w.document.documentElement.lang = 'es';
  await new Promise(resolve => setTimeout(resolve,0));
  assert.equal(w.document.getElementById('ps-controller-keybindings').textContent,'Configurar mando');
  w.document.getElementById('ps-controller-keybindings').click();
  assert.equal(w.document.getElementById('ps-gamepad-title').textContent,'Configurar mando');
  assert.match(w.document.querySelector('[data-pad-button="12"]').getAttribute('aria-label'),/Mover: arriba/);
  const popup = new JSDOM(read('extension/popup.html'),{runScripts:'outside-only'}).window;
  popup.chrome = {storage,tabs:{
    query:async options => {assert.deepEqual({...options},{active:true,currentWindow:true}); return [{id:7}];},
    sendMessage:async (id,message) => {
      assert.equal(id,7);
      let response;
      listeners.forEach(listener => listener(message,{},value => {response=value;}));
      return response;
    }
  }};
  popup.eval(read('extension/popup.js'));
  await new Promise(resolve => setTimeout(resolve,0));
  assert.equal(popup.document.documentElement.lang,'es');
  const selector = popup.document.getElementById('interface-language');
  assert.equal(selector.value,'auto');
  assert.equal(popup.document.querySelector('[data-i18n="game"]').textContent,'Web original del juego');
  selector.value='zh-Hant'; selector.dispatchEvent(new popup.Event('change'));
  await new Promise(resolve => setTimeout(resolve,0));
  assert.equal(popup.document.documentElement.lang,'zh-Hant');
  assert.equal(w.document.getElementById('ps-gamepad-title').textContent,'手把設定');
  assert.equal(w.document.documentElement.lang,'es');
  assert.equal(w.document.documentElement.hasAttribute('data-pszh'),false);
  assert.match(popup.document.querySelector('[data-i18n="note"]').textContent,/仍需安裝/);
  await storage.local.set({language:'en'});
  assert.equal(w.document.getElementById('ps-gamepad-title').textContent,'Gamepad settings');
  assert.equal(popup.document.documentElement.lang,'en');
  await storage.local.set({language:'auto'});
  assert.equal(w.document.getElementById('ps-gamepad-title').textContent,'Configurar mando');
  w.document.documentElement.setAttribute('data-pszh','1');
  await new Promise(resolve => setTimeout(resolve,0));
  assert.equal(w.document.getElementById('ps-gamepad-title').textContent,'手把設定');
  w.document.documentElement.removeAttribute('data-pszh'); w.document.documentElement.lang='en';
  await new Promise(resolve => setTimeout(resolve,0));
  assert.equal(w.document.getElementById('ps-gamepad-title').textContent,'Gamepad settings');
  w.close(); popup.close();
});

test('popup defaults to English without a game and keeps a saved language across reopening', async () => {
  const storage = extensionStorage();
  const open = async () => {
    const w = new JSDOM(read('extension/popup.html'),{runScripts:'outside-only'}).window;
    w.chrome = {storage,tabs:{query:async () => [{id:5}],sendMessage:async () => {throw new Error('No game');}}};
    w.eval(read('extension/popup.js'));
    await new Promise(resolve => setTimeout(resolve,0));
    return w;
  };
  const first = await open();
  assert.equal(first.document.documentElement.lang,'en');
  await storage.local.set({language:'es'});
  first.close();
  const second = await open();
  assert.equal(second.document.documentElement.lang,'es');
  assert.equal(second.document.getElementById('interface-language').value,'es');
  second.close();
});

test('extension menus click controls without movement or page namespace access', () => {
  const { w, pad, events, tick } = fixture(true);
  w.document.getElementById('scr-menu').classList.remove('hidden');
  let clicks = 0; w.document.getElementById('play').onclick = () => clicks++;
  tick(); pad.axes[0] = 1; pad.buttons[0].pressed = true; tick();
  assert.equal(clicks, 1); tick(); assert.equal(clicks, 1);
  assert.equal(events.length, 0);
  (w.document.getElementById('scr-settings').classList.remove('hidden'), w.document.getElementById('ps-controller-keybindings').click());
  assert.ok(w.document.getElementById('ps-gamepad-dialog'));
  assert.equal(w.G, undefined); w.close();
});

test('menu navigation follows visual rows and columns and stops at edges in native and extension', () => {
  for (const extension of [false,true]) {
    const { w, pad, tick } = fixture(extension);
    const menu = w.document.getElementById('scr-menu');
    menu.classList.remove('hidden');
    menu.innerHTML = '<button id="a">A</button><button id="below">Below</button><button id="b">B</button><button id="d">D</button>';
    const rects = { a:[0,0], below:[10,50], b:[200,0], d:[210,50] };
    for (const [id,[left,top]] of Object.entries(rects)) w.document.getElementById(id).getBoundingClientRect = () => ({left,top,right:left+100,bottom:top+40});
    const focused = () => w.document.querySelector('.pad-focus').id;
    const press = n => { pad.buttons[n].pressed=true; tick(); pad.buttons[n].pressed=false; tick(); };
    tick(); assert.equal(focused(),'a');
    press(15); assert.equal(focused(),'b'); // A closer diagonal must not beat the same row.
    press(15); assert.equal(focused(),'b'); // No DOM-order fallback to D below.
    press(13); assert.equal(focused(),'d');
    press(13); assert.equal(focused(),'d');
    press(14); assert.equal(focused(),'below');
    press(12); assert.equal(focused(),'a');
    press(12); assert.equal(focused(),'a');
    w.document.getElementById('b').remove();
    press(15); assert.equal(focused(),'d'); // A genuine diagonal remains reachable.
    w.document.getElementById('d').remove();
    tick(); assert.equal(focused(),'a');
    press(15); assert.equal(focused(),'a'); // Below is too far off-axis to mean right.
    w.close();
  }
});

test('menu stick direction stays stable near a diagonal before the next repeat', () => {
  for (const extension of [false,true]) {
    const { w, pad, tick } = fixture(extension);
    const menu = w.document.getElementById('scr-menu');
    menu.classList.remove('hidden');
    menu.innerHTML = '<button id="a">A</button><button id="b">B</button><button id="d">D</button>';
    for (const [id,left,top] of [['a',0,0],['b',200,0],['d',200,100]]) w.document.getElementById(id).getBoundingClientRect = () => ({left,top,right:left+100,bottom:top+40});
    tick(); pad.axes=[.8,.74,0,0]; tick();
    assert.equal(w.document.querySelector('.pad-focus').id,'b');
    pad.axes=[.74,.8,0,0]; tick();
    assert.equal(w.document.querySelector('.pad-focus').id,'b');
    pad.axes=[.4,.9,0,0]; tick();
    assert.equal(w.document.querySelector('.pad-focus').id,'d');
    w.close();
  }
});

test('extension never activates on other hosts or unrelated pages', () => {
  for (const url of ['https://example.com/', 'https://pokesurvivor.com/privacy.html']) {
    const { w } = fixture(true, url);
    assert.equal(w.document.getElementById('ps-controller-keybindings'), null); w.close();
  }
});


test('Controls section follows original styles, opens a click editor, and follows the Chinese patch', async () => {
  const { w } = fixture(true);
  w.document.documentElement.lang = 'en';
  Object.defineProperty(w.navigator,'language',{value:'zh-TW',configurable:true});
  await new Promise(resolve => w.setTimeout(resolve,0));
  const button = w.document.getElementById('ps-controller-keybindings');
  assert.equal(button.textContent,'Gamepad settings');
  assert.equal(w.document.querySelector('[data-pad-enable]'),null);
  assert.equal(w.document.querySelectorAll('#set-tabs button').length,2);
  assert.equal(w.document.querySelector('#ps-controller-section h4').textContent,'Controller');
  assert.equal(w.document.querySelector('[data-pad-keyboard]').textContent,'Keyboard');
  assert.equal(button.closest('.ps-controls-group').querySelector('h4').textContent,'Controller');
  w.document.getElementById('scr-settings').classList.remove('hidden'); button.click();
  assert.equal(w.document.getElementById('ps-gamepad-dialog').getAttribute('role'),'dialog');
  assert.equal(w.document.getElementById('ps-gamepad-title').textContent,'Gamepad settings');
  assert.equal(w.document.querySelector('.ps-pad-warehouse'),null);
  w.document.querySelector('[data-pad-button="7"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.equal(w.document.querySelector('[data-pad-picker]').hidden,false);
  assert.equal(w.document.querySelectorAll('[data-pad-picker] .chip[role=radio]').length,12);
  assert.ok(w.document.querySelector('[data-pad-context=play]').classList.contains('gen-tab'));
  w.document.querySelector('[data-pad-pick=next]').click();
  assert.equal(w.document.querySelector('[data-pad-picker]').hidden,true);
  assert.match(w.document.querySelector('[data-pad-button="7"]').getAttribute('aria-label'),/Next move|下一招/);
  w.document.documentElement.setAttribute('data-pszh','1.3.3');
  w.document.documentElement.lang='zh-Hant';
  await new Promise(resolve => w.setTimeout(resolve,0));
  assert.equal(w.document.getElementById('ps-controller-keybindings').textContent,'手把設定');
  assert.equal(w.document.getElementById('ps-gamepad-title').textContent,'手把設定');
  assert.match(w.document.querySelector('[data-pad-button="7"]').getAttribute('aria-label'),/Next move|下一招/);
  w.document.querySelector('[data-pad-save]').click();
  assert.deepEqual(JSON.parse(w.localStorage.getItem('ps.controller.v1')).buttons.next,[5,7]);
  assert.match(w.document.querySelector('[data-pad-controls-summary]').textContent,/RB.*RT/);
  assert.equal(w.document.getElementById('scr-settings').classList.contains('hidden'),false);
  button.click();
  w.document.querySelector('[data-pad-button="7"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  w.document.querySelector('[data-pad-pick=off]').click();
  w.document.querySelector('[data-pad-save]').click();
  assert.equal(JSON.parse(w.localStorage.getItem('ps.controller.v1')).buttons.next,5);
  w.close();
});

test('setup wizard chooses stick modes, captures every function and saves only on request', () => {
  const {w,pad} = fixture(); const ui=w.G.GamepadSettings;
  const timers=[]; w.setTimeout=(fn,delay)=>{assert.equal(delay,500); timers.push(fn);};
  const advance=()=>timers.shift()?.();
  ui.open(); ui.report(pad);
  const q=s=>w.document.querySelector(s);
  q('[data-pad-wizard]').click();
  const press=n=>{pad.buttons.forEach(b=>b.pressed=false); ui.report(pad); pad.buttons[n].pressed=true; ui.report(pad);};
  // Navigate modes using the controller; A confirms, without assigning A to a function.
  press(15); press(0);
  assert.match(q('[data-wizard-function]').textContent,/搖桿推動/);
  pad.buttons.forEach(b=>b.pressed=false); ui.report(pad);
  q('[data-wizard-mode="skill-four"]').click();
  const play=['previous','next','pause','slot1','slot2','slot3','slot4','moveUp','moveDown','moveLeft','moveRight'];
  const menu=['confirm','back','reroll','up','down','left','right'];
  const assign=n=>{pad.buttons.forEach(b=>b.pressed=false); ui.report(pad); pad.buttons[n].pressed=true; ui.report(pad);};
  assign(4);
  assert.equal(q('[data-wizard-function]').textContent,'上一招');
  assert.ok(q('[data-wizard-input="4"]').classList.contains('is-assigned'));
  ui.report(pad); assert.equal(timers.length,1); advance();
  assert.equal(q('[data-wizard-function]').textContent,'下一招');
  ui.report(pad); assert.equal(q('[data-wizard-function]').textContent,'下一招');
  assign(4); assert.match(q('[data-wizard-prompt]').textContent,/已指派/);
  assert.ok(q('[data-wizard-input="4"]').classList.contains('is-conflict'));
  assert.equal(q('[data-wizard-function]').textContent,'下一招');
  for(let i=1;i<play.length;i++) { assign(i===4?11:i); advance(); }
  // Pause is assigned button 2, so menu assignments avoid 2.
  const menuButtons=[0,1,3,4,5,6,7];
  menuButtons.forEach(n=>{assign(n);advance();});
  assert.equal(q('[data-pad-picker]').hidden,true);
  assert.equal(w.localStorage.getItem('ps.controller.v1'),null);
  q('[data-pad-save]').click();
  const cfg=w.G.GamepadConfig.get();
  assert.equal(cfg.leftStickMode,'four-way-move');
  [...play,...menu].forEach(k=>assert.ok(w.G.GamepadConfig.bindings(cfg.buttons[k]).length,k));
  assert.deepEqual(Array.from(cfg.buttons.slot1),[3,32]); // Chosen skill mode supplies its fixed directional bindings.
  assert.equal(cfg.buttons.previous,4); // Old mappings are replaced, never appended.
  assert.equal(w.G.GamepadConfig.validate(cfg),null);
  w.close();
});

test('setup wizard ignores extra device buttons without a displayed assignment target', () => {
  const {w,pad} = fixture(); const ui = w.G.GamepadSettings;
  ui.open();
  const q = selector => w.document.querySelector(selector);
  q('[data-pad-wizard]').click();
  q('[data-wizard-mode="eight-way-move"]').click();
  q('[data-wizard-mode="skill-four"]').click();
  ui.report(pad);
  pad.buttons[17].pressed = true;
  assert.doesNotThrow(() => ui.report(pad));
  assert.equal(q('[data-wizard-function]').textContent,'上一招');
  assert.equal(q('[data-wizard-input="4"]').disabled,false);
  w.close();
});

test('setup wizard cancellation and disconnect preserve the original draft', () => {
  const {w,pad}=fixture(); const ui=w.G.GamepadSettings;
  ui.open(); ui.report(pad);
  const q=s=>w.document.querySelector(s);
  q('[data-pad-wizard]').click();
  q('[data-wizard-mode="four-way-move"]').click();
  ui.report(null); assert.match(q('[data-wizard-prompt]').textContent,/十字鍵/);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{code:'Escape',bubbles:true}));
  assert.equal(q('[data-pad-picker]').hidden,true);
  q('[data-pad-save]').click();
  assert.equal(w.G.GamepadConfig.get().leftStickMode,'eight-way-move');
  assert.deepEqual(Array.from(w.G.GamepadConfig.get().buttons.slot1),[3,32]);
  w.close();
});



test('setup wizard mouse assignment shows section progress and delays the next step', () => {
  for (const extension of [false,true]) {
    const {w}=fixture(extension); const timers=[];
    const style=w.document.createElement('style'); style.textContent=read('css/controller.css'); w.document.head.appendChild(style);
    w.setTimeout=(fn,delay)=>{assert.equal(delay,500);timers.push(fn);};
    const q=s=>w.document.querySelector(s);
    if (extension) {
      q('#scr-settings').classList.remove('hidden'); q('#ps-controller-keybindings').click();
    } else w.G.GamepadSettings.open();
    q('[data-pad-wizard]').click();
    assert.match(q('.ps-pad-wizard-progress').textContent,/遊戲操作 \(1\/13\).*選單操作 \(0\/7\)/);
    q('[data-wizard-mode="eight-way-move"]').click();
    q('[data-wizard-mode="skill-four"]').click();
    assert.equal(q('[data-wizard-input="16"]'),null);
    assert.equal(q('[data-pad-button="16"]'),null);
    q('[data-wizard-input="4"]').click();
    assert.equal(q('[data-wizard-binding="4"]').textContent,'上一招');
    assert.equal(q('[data-wizard-function]').textContent,'上一招');
    assert.equal(q('[data-wizard-input="4"]').getAttribute('aria-pressed'),'true');
    assert.equal(w.getComputedStyle(q('[data-wizard-input="4"]')).backgroundColor,'rgb(255, 218, 72)');
    assert.equal(q('[data-wizard-input="5"]').disabled,true);
    timers.shift()();
    assert.equal(q('[data-wizard-function]').textContent,'下一招');
    q('[data-wizard-input="4"]').click();
    assert.equal(w.getComputedStyle(q('[data-wizard-input="4"]')).backgroundColor,'rgb(216, 60, 75)');
    assert.equal(q('[data-wizard-function]').textContent,'下一招');
    q('[data-wizard-input="5"]').click();
    q('[data-wizard-close]').click();
    timers.shift()(); // A canceled animation must never reopen or apply the wizard.
    assert.equal(q('[data-pad-picker]').hidden,true);
    q('[data-pad-save]').click();
    assert.deepEqual(JSON.parse(w.localStorage.getItem('ps.controller.v1')).buttons.slot1,[3,32]);
    w.close();
  }
});


test('system Guide button cannot be mapped and legacy bindings are removed', () => {
  const {w,pad}=fixture(); const config=w.G.GamepadConfig;
  const legacy=config.defaults(); legacy.buttons.previous=[4,16];
  assert.equal(config.validate(legacy),'invalid');
  pad.buttons[16].pressed=true;
  assert.equal(config.inputState(pad,config.defaults())[16],false);
  w.localStorage.setItem('ps.controller.v1',JSON.stringify(legacy));
  w.eval(read('js/core/gamepad-config.js'));
  assert.deepEqual(Array.from(w.G.GamepadConfig.get().buttons.previous),[4]);
  w.close();
});
