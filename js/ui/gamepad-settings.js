/* Controller artwork: Controllercons, Kieran McClung, SIL OFL 1.1. See assets/controllers/LICENSE-Controllercons.txt. */
G.GamepadSettings = (() => {
  const WORDS = {
    title: ['Configurar mando', 'Gamepad settings', '手把設定'],
    help: ['Pulsa un botón del dibujo para cambiar su función.', 'Click a button on the diagram to change its function.', '點選圖上的按鍵即可更改功能。'],
    play: ['En partida', 'Gameplay', '遊戲操作'], menu: ['En los menús', 'Menus', '選單操作'],
    confirm: ['Confirmar', 'Confirm', '確認'], back: ['Volver', 'Back', '返回'], reroll: ['Cambiar cartas', 'Reroll cards', '重抽卡牌'],
    previous: ['Anterior', 'Previous move', '上一招'], next: ['Siguiente', 'Next move', '下一招'],
    pause: ['Pausa / volver', 'Pause / back', '暫停／返回'], slot1: ['Ataque 1', 'Move 1', '招式 1'], slot2: ['Ataque 2', 'Move 2', '招式 2'],
    slot3: ['Ataque 3', 'Move 3', '招式 3'], slot4: ['Ataque 4', 'Move 4', '招式 4'],
    moveUp: ['Mover: arriba', 'Move up', '移動：上'], moveDown: ['Mover: abajo', 'Move down', '移動：下'], moveLeft: ['Mover: izq.', 'Move left', '移動：左'], moveRight: ['Mover: der.', 'Move right', '移動：右'],
    up: ['Arriba', 'Up', '選單向上'], down: ['Abajo', 'Down', '選單向下'], left: ['Izquierda', 'Left', '選單向左'], right: ['Derecha', 'Right', '選單向右'],
    off: ['Sin asignar', 'Unassigned', '未指定'],
    save: ['Guardar', 'Save', '儲存'], reset: ['Restablecer', 'Reset defaults', '還原預設'], cancel: ['Cancelar', 'Cancel', '取消'],
    capture: ['Ahora pulsa un botón o haz clic en el dibujo.', 'Now press a button or click the diagram.', '現在按下實體按鍵，或點選圖上的按鍵。'],
    waiting: ['Conecta un mando y pulsa un botón.', 'Connect a controller and press a button.', '請連接手把並按一下按鈕。'],
    movementOptions: ['Movimiento', 'Movement', '移動'],
    stickHelp: ['Calibra ambos sticks si se mueven solos o apuntan en una dirección incorrecta.', 'Calibrate both sticks in sequence if either one drifts or points in the wrong direction.', '若搖桿方向錯誤或置中時持續移動，可依序校正左、右搖桿。'],
    calibrate: ['Calibrar sticks', 'Calibrate sticks', '搖桿校正'],
    centerLeft: ['Suelta el stick izquierdo y mantenlo en el centro.', 'Release the left stick and let it return to center.', '先放開左搖桿，讓它回到中央。'],
    pushRightLeft: ['Empuja el stick izquierdo a la derecha.', 'Push the left stick to the right.', '將左搖桿向右推到底。'],
    centerAgainLeft: ['Suelta el stick izquierdo de nuevo.', 'Release the left stick again.', '放開左搖桿，讓它回到中央。'],
    pushDownLeft: ['Empuja el stick izquierdo hacia abajo.', 'Push the left stick down.', '將左搖桿向下推到底。'],
    centerRight: ['Suelta el stick derecho y mantenlo en el centro.', 'Release the right stick and let it return to center.', '接著放開右搖桿，讓它回到中央。'],
    pushRightRight: ['Empuja el stick derecho a la derecha.', 'Push the right stick to the right.', '將右搖桿向右推到底。'],
    centerAgainRight: ['Suelta el stick derecho de nuevo.', 'Release the right stick again.', '放開右搖桿，讓它回到中央。'],
    pushDownRight: ['Empuja el stick derecho hacia abajo.', 'Push the right stick down.', '將右搖桿向下推到底。'],
    calibrated: ['Calibrado; guarda para aplicar.', 'Calibrated; save to apply.', '校正完成；儲存後套用。'],
    cancelCalibration: ['Cancelar calibración', 'Cancel calibration', '取消校正'],
    sensitivity: ['Zona de reposo', 'Resting zone', '搖桿防飄移範圍'],
    calibrationFirst: ['Termina o cancela la calibración antes de guardar.', 'Finish or cancel calibration before saving.', '請先完成或取消搖桿校正，再儲存。'],
    invalid: ['No se pudo guardar la configuración.', 'Could not save the controller settings.', '無法儲存手把設定。'],
    storage: ['No se pudo guardar; se mantiene la configuración anterior.', 'Could not save; previous settings are unchanged.', '無法儲存，保留原設定。'],
    axes: ['Calibra de nuevo: las dos direcciones deben usar entradas distintas.', 'Calibrate again: the two directions need different inputs.', '請重新校正：左右與上下需要使用不同的搖桿輸入。'],
    conflict: ['Hay funciones repetidas en el mismo botón.', 'Some functions share a button in the same context.', '同一操作情境中有功能共用按鍵。'],
    clearAll: ['Vaciar asignaciones', 'Clear all bindings', '清空所有設定'],
    clearBinding: ['Sin función', 'Unassigned', '不指定功能'],
    leftPress: ['LS (pulsar stick izquierdo)', 'LS (left stick press)', 'LS（按下左搖桿）'],
    rightPress: ['RS (pulsar stick derecho)', 'RS (right stick press)', 'RS（按下右搖桿）'],
    close: ['Cerrar', 'Close', '關閉'],
    stickPushHeading: ['Movimiento del stick', 'Stick movement', '搖桿推動'],
    stickPressHeading: ['Pulsar el stick', 'Stick press', '搖桿按下'],
    leftEightWayShort: ['Mov. 8 vías', '8-way move', '八方向移動'],
    leftFourWayShort: ['Mov. 4 vías', '4-way move', '四方向移動'],
    rightEightWayShort: ['Mov. 8 vías', '8-way move', '八方向移動'],
    rightFourWayShort: ['Mov. 4 vías', '4-way move', '四方向移動'],
    rightSkillFourShort: ['Ataques 4 vías', '4-way skills', '四方向選招'],
    leftEightWay: ['Movimiento en 8 direcciones (diagonales)', '8-way movement (diagonals)', '八方向移動（含斜向）'],
    leftFourWay: ['Movimiento en 4 direcciones', '4-way movement', '四方向移動'],
    rightEightWay: ['Movimiento en 8 direcciones (diagonales)', '8-way movement (diagonals)', '八方向移動（含斜向）'],
    rightFourWay: ['Movimiento en 4 direcciones', '4-way movement', '四方向移動'],
    rightSkillFour: ['Selección de habilidades en 4 direcciones', '4-way skill selection', '四方向選招'],
    wizard: ['Asistente de configuración', 'Setup wizard', '設定精靈'],
    wizardPress: ['Pulsa el botón que quieras asignar.', 'Press a controller button directly to assign it.', '直接按下手把上的按鍵來設定。'],
    wizardChoose: ['Cruceta: elegir · A: confirmar', 'D-pad: choose · A: confirm', '十字鍵：選擇 · A：確認'],
    wizardDuplicate: ['Este botón ya está asignado a', 'This button is already assigned to', '此按鍵已指派給'],
    wizardDone: ['Configuración lista; guarda para aplicar.', 'Setup complete; save to apply.', '精靈設定完成；按「儲存」套用。'],
    leftStick: ['Stick izquierdo', 'Left stick', '左搖桿'],
    rightStick: ['Stick derecho', 'Right stick', '右搖桿'],
  };
  const groups = G.GamepadConfig.groups;
  const names = {
    xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'LS', 'RS', '↑', '↓', '←', '→']
  };
  const positions = {
    xbox: { left: [263.7, 300.8], right: [546.8, 413.5], buttons: {
      0:[639.9,352.1], 1:[688.7,303.4], 2:[589.6,303.4], 3:[639.9,253.9],
      8:[397.6,300.8], 9:[503.1,300.8], 10:[263.7,300.8], 11:[546.8,413.5],
      12:[354.6,385.5], 13:[354.6,456], 14:[318.5,421.3], 15:[391.5,421.3]
    } }
  };

  const clone = v => JSON.parse(JSON.stringify(v));
  const t = key => WORDS[key][/^zh/i.test(G.I18n ? G.I18n.lang : document.documentElement.lang || navigator.language) ? 2 : /^es/i.test(G.I18n ? G.I18n.lang : document.documentElement.lang || navigator.language) ? 0 : 1];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const name = n => n < 0 ? t('off') : n === 10 ? t('leftPress') : n === 11 ? t('rightPress') : n >= 12 && n <= 15 ? names.xbox[n] : n >= 32 && n <= 39 ? ['↑','→','↓','←'][(n - 32) % 4] : names.xbox[n] || `Button ${n + 1}`;
  let dialog, draft, context = 'play', lastPad = null, lastHeld = [], captureReady = false, calibration = null, seenIndex = null, wizard = null;
  const isOpen = () => !!dialog && dialog.isConnected && !dialog.classList.contains('hidden');
  function message(text, error = false) {
    const el = dialog.querySelector('[data-pad-message]'); el.textContent = text; el.classList.toggle('is-error', error);
  }
  function close() {
    if (wizard) clearTimeout(wizard.timer);
    if (dialog) dialog.classList.add('hidden');
    calibration = null; wizard = null; lastHeld = []; seenIndex = null;
    if (G.Gamepad) G.Gamepad.reset();
  }
  const bindings = value => G.GamepadConfig.bindings(value);
  const storeBindings = (key, list) => { draft.buttons[key] = list.length > 1 ? list : list.length ? list[0] : -1; };
  function diagram() {
    const pos = positions.xbox;
    const anchors = {...pos.buttons,4:[277,185],5:[623,185],6:[245,137.7],7:[655,137.7]};
    const links = [];
    const targets = Object.entries(anchors).map(([n,[x,y]]) => {
      const stick = +n === 10 || +n === 11, direction = +n >= 12 && +n <= 15;
      const shoulder = +n >= 4 && +n <= 7, center = +n === 8 || +n === 9;
      const radius = stick ? 27 : direction ? 14 : center ? 18 : 16;
      const shape = shoulder ? '<rect class="ps-pad-direct-hit" x="-30" y="-13" width="60" height="26" rx="9"/>' : `<circle class="ps-pad-direct-hit" r="${radius}"/>`;
      let labelWidth = 86, labelX = -labelWidth / 2, labelY = shoulder ? -11 : radius + 3, connectorPath = '';
      if (shoulder) {
        const leftShoulder = +n === 4 || +n === 6;
        labelWidth = 92; labelX = leftShoulder ? 38 : -38 - labelWidth;
        connectorPath = leftShoulder ? `M 30 0 H ${labelX}` : `M -30 0 H ${labelX + labelWidth}`;
      }
      if (direction) {
        const dpad = {
          12:{x:154,y:374.5,w:92,row:385.5},
          14:{x:154,y:410.3,w:92,row:421.3},
          15:{x:154,y:446.1,w:92,row:457.1},
          13:{x:154,y:481.9,w:92,row:492.9}
        }[+n];
        labelX = dpad.x - x; labelY = dpad.y - y; labelWidth = dpad.w;
        const endX = labelX + labelWidth;
        connectorPath = +n === 15 || +n === 13
          ? `M 0 14 V ${dpad.row - y} H ${endX}`
          : `M -14 0 H ${endX}`;
      }
      if (+n < 4) {
        labelWidth = 68; labelX = -labelWidth / 2; labelY = 19;
        connectorPath = '';
      }
      if (center) {
        labelWidth = 104;
        labelX = -labelWidth / 2; labelY = -46;
        connectorPath = `M 0 -18 V ${labelY + 22}`;
      }
      if (connectorPath) links.push(`<path class="ps-pad-label-link" data-pad-link="${n}" transform="translate(${x} ${y})" d="${connectorPath}"/>`);
      const longName = !stick && name(+n).length > 3;
      const stickModeLabel = stick ? `<foreignObject class="ps-pad-mode-label" x="-52" y="-52" width="104" height="20" data-pad-mode-slot="${n}"></foreignObject>` : '';
      return `<g data-pad-button="${n}" class="ps-pad-target ps-pad-direct ${direction ? 'ps-pad-direction' : ''} ${longName ? 'ps-pad-long-name' : ''}" role="button" tabindex="0" aria-label="${esc(name(+n))}" transform="translate(${x} ${y})"><title></title>
        ${shape}${stickModeLabel}<text class="ps-pad-direct-name" y="${stick ? -10 : 4}">${esc(stick ? names.xbox[+n] : name(+n))}</text>
        <foreignObject class="ps-pad-function-label" x="${labelX}" y="${labelY}" width="${labelWidth}" height="22" data-pad-slot="${n}"></foreignObject></g>`;
    }).join('');
    const artwork = G.GamepadArtwork.xbox.replace('<svg ', '<svg x="90" y="60" width="720" height="720" ');
    return `<svg viewBox="140 110 620 410" class="ps-pad-diagram" role="group" aria-label="${esc(t('title'))}">
      <defs><clipPath id="ps-pad-art-crop"><rect x="140" y="110" width="620" height="370"/></clipPath></defs>
      <g class="ps-pad-art" aria-hidden="true" clip-path="url(#ps-pad-art-crop)">${artwork}</g><g aria-hidden="true">${links.join('')}</g>${targets}
      <circle data-pad-stick="left" class="ps-pad-stick-dot" cx="${pos.left[0]}" cy="${pos.left[1]}" r="4"/>
      <circle data-pad-stick="right" class="ps-pad-stick-dot" cx="${pos.right[0]}" cy="${pos.right[1]}" r="4"/>
    </svg>`;
  }
  function controlsSummary() {
    const lang = G.I18n ? G.I18n.lang : document.documentElement.lang;
    const zh = /^zh/i.test(lang), es = lang === 'es';
    const cfg = G.GamepadConfig.get();
    const keys = key => bindings(cfg.buttons[key]).map(n => `<kbd>${esc(name(n))}</kbd>`).join(' / ') || `<span class="sub">${esc(t('off'))}</span>`;
    const movementKeys = key => bindings(cfg.buttons[key]).map(n => `<kbd>${esc(n >= 36 && n <= 39 ? `LS ${name(n)}` : name(n))}</kbd>`).join(' / ') || `<span class="sub">${esc(t('off'))}</span>`;
    const leftMode = cfg.leftStickMode === 'four-way-move' ? t('leftFourWay') : t('leftEightWay');
    const rightMode = cfg.rightStickMode === 'skill-four' ? t('rightSkillFour') : cfg.rightStickMode === 'four-way-move' ? t('rightFourWay') : t('rightEightWay');
    const skillButtons = [...new Set([1,2,3,4].flatMap(n => bindings(cfg.buttons['slot'+n])).filter(n => n < 32))].sort((a,b) => a-b);
    const skillKeys = skillButtons.map(n => `<kbd>${esc(name(n))}</kbd>`).join(' ');
    const skillInputs = [skillKeys, cfg.rightStickMode === 'skill-four' ? '<kbd>R Stick</kbd>' : ''].filter(Boolean).join(' / ') || `<span class="sub">${esc(t('off'))}</span>`;
    return `<div class="keys"><div><kbd>${zh ? '左搖桿' : es ? 'Stick izquierdo' : 'Left stick'}</kbd></div><span>${esc(leftMode)}</span>
      <div>${skillInputs}</div><span>${zh ? '招式選擇 · 右搖桿：' : es ? 'Elegir ataque · Stick derecho: ' : 'Choose move · Right stick: '}${esc(rightMode)}</span>
      <div>${['moveUp','moveRight','moveDown','moveLeft'].map(movementKeys).join(' · ')}</div><span>${zh ? '十字鍵移動' : es ? 'Mover con cruceta' : 'D-pad movement'}</span>
      <div>${keys('previous')} / ${keys('next')}</div><span>${zh ? '上一招 / 下一招' : es ? 'anterior / siguiente' : 'previous / next move'}</span>
      <div>${keys('pause')}</div><span>${zh ? '暫停' : es ? 'pausa' : 'pause'}</span>
      <div>${keys('confirm')} / ${keys('back')}</div><span>${zh ? '選單：確認 / 返回' : es ? 'menús: confirmar / volver' : 'menus: confirm / back'}</span></div>`;
  }
  function stickModeLabel(n) {
    if (n === 10) return t(draft.leftStickMode === 'four-way-move' ? 'leftFourWayShort' : 'leftEightWayShort');
    if (draft.rightStickMode === 'skill-four') return t('rightSkillFourShort');
    return t(draft.rightStickMode === 'four-way-move' ? 'rightFourWayShort' : 'rightEightWayShort');
  }
  function keyboardHeading() {
    const lang = G.I18n ? G.I18n.lang : document.documentElement.lang;
    return `<h4 class="ps-controls-subhead" data-pad-keyboard translate="no">${/^zh/i.test(lang) ? '鍵盤操作' : lang === 'es' ? 'Teclado' : 'Keyboard'}</h4>`;
  }
  function controlsSection(options = {}) {
    const lang = G.I18n ? G.I18n.lang : document.documentElement.lang;
    const zh = /^zh/i.test(lang), es = lang === 'es';
    return `<div class="ps-controls-group" translate="no"><h4 class="ps-controls-subhead">${zh ? '手把操作' : es ? 'Mando' : 'Controller'}</h4><div class="ps-controls-content"><div data-pad-controls-summary>${controlsSummary()}</div><button type="button" class="btn small" data-pad-bindings id="${options.external ? 'ps-controller-keybindings' : 'set-gamepad'}">${zh ? '手把設定' : es ? 'Configurar mando' : 'Gamepad settings'}</button></div></div>`;
  }
  function refreshControls() {
    for (const el of document.querySelectorAll('[data-pad-controls-summary]')) el.innerHTML = controlsSummary();
  }
  function wireControls(root) {
    const button = root.querySelector('[data-pad-bindings]');
    if (button) button.onclick = () => open();
  }
  // Keep the entire wizard transactional: only its completed result becomes the draft.
  function cancelWizard() {
    if (wizard) clearTimeout(wizard.timer);
    wizard = null; captureReady = false;
    dialog.querySelector('[data-pad-picker]').hidden = true;
    dialog.querySelector('[data-pad-wizard]').focus();
  }
  function wizardStep() {
    const step = wizard.steps[wizard.index];
    if (!step) {
      if (wizard.config.rightStickMode === 'skill-four') {
        ['slot1','slot2','slot3','slot4'].forEach((key,n) => {
          wizard.config.buttons[key] = [...bindings(wizard.config.buttons[key]),32+n];
        });
      }
      draft = wizard.config; wizard = null;
      dialog.querySelector('[data-pad-picker]').hidden = true;
      render(); message(t('wizardDone'));
      dialog.querySelector('[data-pad-save]').focus(); return;
    }
    captureReady = false;
    const picker = dialog.querySelector('[data-pad-picker]');
    const mode = step.mode;
    const options = mode === 'leftStickMode'
      ? [['eight-way-move','leftEightWay'],['four-way-move','leftFourWay']]
      : [['eight-way-move','rightEightWay'],['four-way-move','rightFourWay'],['skill-four','rightSkillFour']];
    const phase = step.context || 'play';
    const phaseSteps = wizard.steps.filter(item => (item.context || 'play') === phase);
    const phaseIndex = phaseSteps.indexOf(step) + 1;
    const progress = ['play','menu'].map(key => {
      const total = wizard.steps.filter(item => (item.context || 'play') === key).length;
      const current = key === phase ? phaseIndex : key === 'play' ? total : 0;
      return `<span class="${key === phase ? 'is-current' : ''}" ${key === phase ? 'aria-current="step"' : ''}>${esc(t(key))} (${current}/${total})</span>`;
    }).join('<span aria-hidden="true">→</span>');
    const inputButtons = Array.from({length:Math.max(16,Math.min(32,lastPad?.buttons?.length || 16))},(_,n)=>n).filter(n=>n !== 16).map(n => {
      const assigned = groups[phase].filter(key=>bindings(wizard.config.buttons[key]).includes(n)).map(t).join(' · ');
      return `<div class="ps-pad-wizard-input-row"><button type="button" class="chip" data-wizard-input="${n}" aria-label="${esc(name(n))}">${esc(n === 10 ? 'LS' : n === 11 ? 'RS' : name(n))}</button><span data-wizard-binding="${n}">${esc(assigned)}</span></div>`;
    }).join('');
    picker.innerHTML = `<div class="box ps-pad-picker-card ps-pad-wizard-card"><div class="ps-pad-wizard-heading"><h3>${esc(t('wizard'))}</h3><nav class="ps-pad-wizard-progress" aria-label="${esc(t('wizard'))}">${progress}</nav></div><button type="button" class="ps-pad-picker-close" data-wizard-close aria-label="${esc(t('cancel'))}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.5"/></svg></button><div class="ps-pad-wizard-body ${mode ? 'is-mode' : ''}"><div><span class="ps-pad-wizard-step">${phaseIndex}/${phaseSteps.length}</span><h4 data-wizard-function>${esc(mode ? `${t(mode === 'leftStickMode' ? 'leftStick' : 'rightStick')} · ${t('stickPushHeading')}` : t(step.key))}</h4></div><p data-wizard-prompt role="status" aria-live="polite">${esc(t(mode ? 'wizardChoose' : 'wizardPress'))}</p>${mode ? `<div class="ps-pad-stick-mode-options">${options.map(([value,label])=>`<button type="button" class="chip" data-wizard-mode="${value}">${esc(t(label))}</button>`).join('')}</div>` : `<div class="ps-pad-wizard-inputs" aria-label="${esc(t('capture'))}">${inputButtons}</div>`}</div></div>`;
    picker.hidden = false;
    picker.querySelector('[data-wizard-close]').onclick = cancelWizard;
    for (const button of picker.querySelectorAll('[data-wizard-input]')) button.onclick = () => assignWizard(+button.dataset.wizardInput);
    for (const button of picker.querySelectorAll('[data-wizard-mode]')) button.onclick = () => {
      wizard.config[mode] = button.dataset.wizardMode; wizard.index++; wizardStep();
    };
    (picker.querySelector(`[data-wizard-mode="${wizard.config[mode]}"]`) || picker.querySelector('[data-wizard-close]')).focus();
  }
  function startWizard() {
    cancelCalibration();
    const config = clone(draft);
    for (const key of Object.keys(config.buttons)) config.buttons[key] = -1;
    wizard = {config,index:0,steps:[{mode:'leftStickMode'},{mode:'rightStickMode'},
      ...groups.play.map(key=>({key,context:'play'})),
      ...groups.menu.filter(key=>key !== 'pause').map(key=>({key,context:'menu'}))]};
    message(''); wizardStep();
  }
  function reportWizard(held, usable) {
    if (wizard.pending) return;
    const step = wizard.steps[wizard.index], prompt = dialog.querySelector('[data-wizard-prompt]');
    if (!usable) { captureReady = false; return; }
    if (!held.some(Boolean)) { captureReady = true; prompt.textContent = t(step.mode ? 'wizardChoose' : 'wizardPress'); }
    if (!captureReady) return;
    const pressed = held.findIndex((value,n)=>value && !lastHeld[n]);
    if (pressed < 0) return;
    captureReady = false;
    if (step.mode) {
      const options = [...dialog.querySelectorAll('[data-wizard-mode]')];
      const index = options.indexOf(document.activeElement);
      if ([12,13,14,15,32,33,34,35,36,37,38,39].includes(pressed)) {
        const delta = [12,14,32,35,36,39].includes(pressed) ? -1 : 1;
        options[(Math.max(0,index)+delta+options.length)%options.length].focus();
      } else if (pressed === 0 && index >= 0) options[index].click();
      return;
    }
    // Stick movement is chosen above, never accidentally captured as a button.
    if (pressed >= 32) return;
    assignWizard(pressed);
  }
  function assignWizard(pressed) {
    if (!wizard || wizard.pending || pressed < 0 || pressed > 15) return;
    const step = wizard.steps[wizard.index];
    if (step.mode) return;
    const prompt = dialog.querySelector('[data-wizard-prompt]');
    const relevant = Object.values(groups).filter(group=>group.includes(step.key));
    const duplicate = relevant.flat().find(key=>key !== step.key && bindings(wizard.config.buttons[key]).includes(pressed));
    for (const option of dialog.querySelectorAll('[data-wizard-input]')) option.classList.remove('is-conflict');
    if (duplicate) {
      const button = dialog.querySelector(`[data-wizard-input="${pressed}"]`);
      if (button) {
        // Restart feedback even when the same conflicting input is tried again.
        void button.offsetWidth;
        button.classList.add('is-conflict');
        button.onanimationend = () => button.classList.remove('is-conflict');
      }
      prompt.textContent = `${t('wizardDuplicate')}「${t(duplicate)}」，${t('wizardPress')}`;
      return;
    }
    wizard.config.buttons[step.key] = pressed;
    dialog.querySelector(`[data-wizard-binding="${pressed}"]`).textContent = t(step.key);
    wizard.pending = true; captureReady = false;
    const button = dialog.querySelector(`[data-wizard-input="${pressed}"]`);
    if (button) { button.classList.add('is-assigned'); button.setAttribute('aria-pressed','true'); }
    for (const option of dialog.querySelectorAll('[data-wizard-input]')) option.disabled = true;
    const transaction = wizard;
    wizard.timer = setTimeout(() => {
      if (wizard !== transaction || !isOpen()) return;
      wizard.pending = false; wizard.index++; wizardStep();
    },500);
  }
  function pick(n, heading = name(n)) {
    if (calibration) return;
    const picker = dialog.querySelector('[data-pad-picker]');
    const inputContext = context;
    const columns = inputContext === 'play'
      ? [['previous','next'],['slot1','slot3'],['slot2','slot4'],['pause','off'],['moveUp','moveRight','moveDown','moveLeft']]
      : [['up','down'],['left','right'],['confirm','back'],['reroll','pause','off']];
    const inputGroup = groups[inputContext];
    const stickSide = n === 10 ? 'left' : n === 11 ? 'right' : null;
    const modeKey = stickSide === 'left' ? 'leftStickMode' : 'rightStickMode';
    const modeOptions = stickSide === 'left'
      ? [['eight-way-move','leftEightWay'],['four-way-move','leftFourWay']]
      : [['eight-way-move','rightEightWay'],['four-way-move','rightFourWay'],['skill-four','rightSkillFour']];
    const modePanel = stickSide ? `<section class="ps-pad-stick-mode"><strong>${esc(t('stickPushHeading'))}</strong><div class="ps-pad-stick-mode-options" role="radiogroup" aria-label="${esc(t('stickPushHeading'))}">${modeOptions.map(([value,label]) => `<button type="button" class="chip ${draft[modeKey] === value ? 'on' : ''}" data-stick-mode="${value}" role="radio" aria-checked="${draft[modeKey] === value}">${esc(t(label))}</button>`).join('')}</div></section>` : '';
    const pressHeading = stickSide ? `<h4 class="ps-pad-stick-press-heading">${esc(t('stickPressHeading'))}</h4>` : '';
    const hasBinding = key => key === 'off' ? !inputGroup.some(k => bindings(draft.buttons[k]).includes(n)) : bindings(draft.buttons[key]).includes(n);
    const choice = key => `<button type="button" class="chip ${hasBinding(key) ? 'on' : ''}" role="radio" data-pad-pick="${key}" aria-checked="${hasBinding(key)}">${esc(t(key === 'off' ? 'clearBinding' : key))}</button>`;
    const focusTarget = `[data-pad-button="${n}"]`;
    picker.innerHTML = `<div class="box ps-pad-picker-card"><h3>${esc(heading)}</h3><button type="button" class="ps-pad-picker-close" data-pad-pick-close aria-label="${esc(t('close'))}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>${modePanel}${pressHeading}<div class="chips ps-pad-options" role="radiogroup" aria-label="${esc(heading)}">${columns.map((keys,i) => `<div class="ps-pad-option-group ${inputContext === 'play' && i === 4 ? 'ps-pad-movement-options' : ''}">${inputContext === 'play' && i === 4 ? `<strong>${esc(t('movementOptions'))}</strong>` : ''}${keys.map(choice).join('')}</div>`).join('')}</div></div>`;
    picker.hidden = false;
    for (const button of picker.querySelectorAll('[data-stick-mode]')) button.onclick = () => {
      draft[modeKey] = button.dataset.stickMode;
      for (const option of picker.querySelectorAll('[data-stick-mode]')) {
        const active = option.dataset.stickMode === draft[modeKey];
        option.classList.toggle('on',active); option.setAttribute('aria-checked',String(active));
      }
      paintAssignments();
    };
    for (const button of picker.querySelectorAll('[data-pad-pick]')) button.onclick = () => {
      if (button.dataset.padPick === 'off') {
        for (const key of inputGroup) storeBindings(key,bindings(draft.buttons[key]).filter(b => b !== n));
        paintAssignments();
      } else assign(button.dataset.padPick,n);
      picker.hidden = true; dialog.querySelector(focusTarget).focus();
    };
    picker.querySelector('[data-pad-pick-close]').onclick = () => { picker.hidden = true; dialog.querySelector(focusTarget).focus(); };
    (picker.querySelector('[data-stick-mode][aria-checked=true]') || picker.querySelector('[data-pad-pick][aria-checked=true]')).focus();
  }
  function wireDiagram() {
    for (const el of dialog.querySelectorAll('[data-pad-button]')) {
      el.onclick = () => pick(+el.dataset.padButton);
      el.onkeydown = e => {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault(); e.stopPropagation(); pick(+el.dataset.padButton);
        }
      };
    }
  }
  function calloutLabel(text, className = '') {
    const el = document.createElement('span'); el.className = `ps-pad-chip ${className}`.trim();
    el.innerHTML = `<span class="ps-pad-assigned">${esc(text)}</span>`;
    return el;
  }
  function paintAssignments() {
    for (const el of dialog.querySelectorAll('[data-pad-button]')) {
      const n = +el.dataset.padButton, actions = groups[context].filter(k => bindings(draft.buttons[k]).includes(n));
      const pressLabel = actions.length ? actions.map(t).join(' / ') : t('off');
      const label = n === 10 || n === 11
        ? `${name(n)} · ${t('stickPushHeading')}: ${stickModeLabel(n)} · ${t('stickPressHeading')}: ${pressLabel}`
        : `${name(n)}: ${pressLabel}`;
      el.querySelector('title').textContent = label;
      el.classList.toggle('is-assigned', actions.length > 0); el.setAttribute('aria-label',label);
      const link = dialog.querySelector(`[data-pad-link="${n}"]`);
      if (link) link.classList.toggle('is-assigned', actions.length > 0);
      const slot = el.querySelector('[data-pad-slot]');
      slot.replaceChildren(...(actions.length ? actions.map(key => calloutLabel(t(key))) : (n === 10 || n === 11 ? [calloutLabel(t('off'))] : [])));
      const modeSlot = el.querySelector('[data-pad-mode-slot]');
      if (modeSlot) modeSlot.replaceChildren(calloutLabel(stickModeLabel(n),'ps-pad-mode-chip'));
    }
  }
  function assign(action,n) {
    for (const group of Object.values(groups)) if (group.includes(action)) for (const key of group) {
      if (key !== action) storeBindings(key, bindings(draft.buttons[key]).filter(b => b !== n));
    }
    storeBindings(action,[...new Set([...bindings(draft.buttons[action]),n])]);
    message(''); paintAssignments();
  }
  function render() {
    for (const el of dialog.querySelectorAll('[data-pad-context]')) {
      const active = el.dataset.padContext === context;
      el.setAttribute('aria-pressed',String(active)); el.classList.toggle('on',active);
    }
    paintAssignments();
  }
  function cancelCalibration() { calibration = null; dialog.querySelector('[data-pad-calibrate]').textContent = t('calibrate'); }
  function calibrationPrompt() {
    if (!calibration) return;
    const stick = calibration.stick === 'left' ? 'Left' : 'Right';
    const phase = calibration.phase === 'center' ? 'center' : calibration.phase === 'right' ? 'pushRight' : calibration.phase === 'centerAgain' ? 'centerAgain' : 'pushDown';
    message(t(`${phase}${stick}`));
  }
  function open(options = {}) {
    if (G.Game && G.Game.state === 'playing') {
      if (G.Game.togglePause) G.Game.togglePause(); else if (G.beforeGamepadSettings) G.beforeGamepadSettings();
    }
    if (G.Gamepad) G.Gamepad.reset();
    if (wizard) clearTimeout(wizard.timer);
    wizard = null;
    if (!options.preserve) { draft = G.GamepadConfig.get(); context = 'play'; calibration = null; lastHeld = []; seenIndex = null; }
    if (!dialog) {
      dialog = document.createElement('section'); dialog.id = 'ps-gamepad-dialog'; dialog.className = 'scr dim hidden';
      dialog.setAttribute('translate', 'no'); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-labelledby', 'ps-gamepad-title'); dialog.setAttribute('aria-describedby','ps-gamepad-help');
      document.body.appendChild(dialog);
    }
    dialog.innerHTML = `<div class="box ps-pad-card"><header><div><h2 id="ps-gamepad-title">${esc(t('title'))}</h2><p class="ps-pad-subtitle" id="ps-gamepad-help">${esc(t('help'))}</p></div><div class="ps-pad-header-actions"><button type="button" data-pad-reset>${esc(t('reset'))}</button><button type="button" class="danger" data-pad-clear-all>${esc(t('clearAll'))}</button></div></header>
      <div class="ps-pad-diagram-frame"><div data-pad-picture>${diagram()}</div><nav class="ps-pad-context" aria-label="${esc(t('title'))}"><button type="button" data-pad-context="play">${esc(t('play'))}</button><button type="button" data-pad-context="menu">${esc(t('menu'))}</button></nav><button type="button" class="ps-pad-wizard-launch" data-pad-wizard>${esc(t('wizard'))}</button></div>
      <div class="ps-pad-picker" data-pad-picker hidden></div>
      <div class="ps-pad-stick-row"><button type="button" data-pad-calibrate title="${esc(t('stickHelp'))}">${esc(t('calibrate'))}</button><label class="ps-pad-range">${esc(t('sensitivity'))}<input type="range" data-pad="deadzone" min="0.05" max="0.6" step="0.05" value="${draft.deadzone}"><output data-pad-deadzone>${Math.round(draft.deadzone * 100)}%</output></label></div>
      <footer><p class="ps-pad-message" data-pad-message role="status" aria-live="polite"></p><button type="button" class="ghost" id="ps-pad-close">${esc(t('cancel'))}</button><button type="button" class="ps-pad-save" data-pad-save>${esc(t('save'))}</button></footer></div>`;
    for (const button of dialog.querySelectorAll('button')) { if (button.hasAttribute('data-pad-context')) { button.classList.add('gen-tab'); button.classList.toggle('on',button.getAttribute('aria-pressed') === 'true'); } else button.classList.add('btn','small'); }
    wireDiagram();
    dialog.querySelector('[data-pad-wizard]').onclick = startWizard;
    for (const el of dialog.querySelectorAll('[data-pad-context]')) el.onclick = () => { context = el.dataset.padContext; render(); if (!calibration) message(''); };
    dialog.querySelector('[data-pad-clear-all]').onclick = () => {
      cancelCalibration();
      for (const key of Object.keys(draft.buttons)) draft.buttons[key] = -1;
      paintAssignments(); message('');
    };
    dialog.querySelector('[data-pad-calibrate]').onclick = () => {
      if (calibration) { cancelCalibration(); message(''); return; }
      if (!lastPad || lastPad.mapping !== 'standard') { message(t('waiting'), true); return; }
      paintAssignments();
      calibration = { phase: 'center', stick:'left', count:0, index:lastPad.index, axes:{
        left:{ x:draft.axisX, y:draft.axisY }, right:{ x:draft.axisRX, y:draft.axisRY }
      } };
      dialog.querySelector('[data-pad-calibrate]').textContent = t('cancelCalibration'); calibrationPrompt();
    };
    dialog.querySelector('[data-pad=deadzone]').oninput = e => { draft.deadzone = +e.target.value; dialog.querySelector('[data-pad-deadzone]').textContent = `${Math.round(draft.deadzone * 100)}%`; };
    dialog.querySelector('[data-pad-save]').onclick = () => {
      if (wizard) return;
      if (calibration) { message(t('calibrationFirst'), true); return; }
      draft.enabled = true;
      const result = G.GamepadConfig.set(draft);
      if (result.ok) { refreshControls(); close(); } else message(t(result.error), true);
    };
    dialog.querySelector('[data-pad-reset]').onclick = () => {
      cancelCalibration(); draft = G.GamepadConfig.defaults();
      dialog.querySelector('[data-pad=deadzone]').value = draft.deadzone;
      dialog.querySelector('[data-pad-deadzone]').textContent = `${Math.round(draft.deadzone * 100)}%`;
      render(); message('');
    };
    dialog.querySelector('#ps-pad-close').onclick = () => close();
    render(); message(''); dialog.classList.remove('hidden');
    report(lastPad);
    dialog.querySelector('#ps-pad-close').focus({ preventScroll: true });
  }
  function report(pad) {
    lastPad = pad || null;
    if (!isOpen()) return;
    const usable = pad && pad.connected && pad.mapping === 'standard';
    const held = usable ? G.GamepadConfig.inputState(pad,draft,lastHeld) : [];
    const changedPad = seenIndex !== (usable ? pad.index : null);
    if (changedPad) { seenIndex = usable ? pad.index : null; captureReady = false; lastHeld = held; }
    for (const el of dialog.querySelectorAll('[data-pad-button]')) el.classList.toggle('is-pressed', !!held[+el.dataset.padButton]);
    for (const [which, ax, ay, cx, cy, invX, invY] of [['left', draft.axisX, draft.axisY, ...positions.xbox.left, draft.invertX, draft.invertY], ['right', draft.axisRX, draft.axisRY, ...positions.xbox.right, draft.invertRX, draft.invertRY]]) {
      const el = dialog.querySelector(`[data-pad-stick="${which}"]`);
      el.setAttribute('cx', cx + (usable ? (pad.axes[ax] || 0) * (invX ? -1 : 1) * 17 : 0));
      el.setAttribute('cy', cy + (usable ? (pad.axes[ay] || 0) * (invY ? -1 : 1) * 17 : 0));
    }
    if (wizard) { reportWizard(held,usable); lastHeld = held; return; }
    if (!usable) { if (calibration) { cancelCalibration(); message(t('waiting'), true); } captureReady = false; lastHeld = []; return; }
    if (calibration) {
      const c = calibration, axes = pad.axes.slice(0, 8), stick = c.axes[c.stick], candidates = [stick.x,stick.y];
      if (c.index !== pad.index) { cancelCalibration(); message(t('waiting'), true); }
      else if (c.phase === 'center' || c.phase === 'centerAgain') {
        if (!c.baseline || candidates.some(i => Math.abs(axes[i] - c.baseline[i]) > .08)) { c.baseline = [...axes]; c.count = 0; }
        else c.count++;
        const centered = c.phase === 'center' || Math.abs(axes[stick.x] - c.origin[stick.x]) < .25;
        if (c.count >= 15 && centered) {
          c.origin = [...axes]; c.phase = c.phase === 'center' ? 'right' : 'down'; calibrationPrompt();
        }
      } else {
        const deltas = axes.map((v, i) => candidates.includes(i) && !(i === stick.x && c.phase === 'down') ? v - c.origin[i] : 0);
        const n = deltas.reduce((best, v, i) => Math.abs(v) > Math.abs(deltas[best]) ? i : best, 0);
        if (Math.abs(deltas[n]) > .7) {
          if (c.phase === 'right') {
            stick.x = n; stick.invertX = deltas[n] < 0; c.phase = 'centerAgain'; c.count = 0; c.baseline = null; calibrationPrompt();
          } else {
            stick.y = n; stick.invertY = deltas[n] < 0;
            if (c.stick === 'left') { c.stick = 'right'; c.phase = 'center'; c.count = 0; c.baseline = null; c.origin = null; calibrationPrompt(); }
            else {
              Object.assign(draft,{axisX:c.axes.left.x,axisY:c.axes.left.y,invertX:!!c.axes.left.invertX,invertY:!!c.axes.left.invertY,axisRX:c.axes.right.x,axisRY:c.axes.right.y,invertRX:!!c.axes.right.invertX,invertRY:!!c.axes.right.invertY});
              cancelCalibration(); message(t('calibrated'));
            }
          }
        }
      }
    }
    lastHeld = held;
  }
  document.addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (wizard) { cancelWizard(); } else if (dialog.querySelector('[data-pad-picker]') && !dialog.querySelector('[data-pad-picker]').hidden) { dialog.querySelector('[data-pad-picker]').hidden = true; } else if (calibration) { cancelCalibration(); message(''); } else close(); }
    else if (e.code === 'Tab') {
      const picker = dialog.querySelector('[data-pad-picker]');
      const root = picker && !picker.hidden ? picker : dialog;
      const targets = [...root.querySelectorAll('button:not(:disabled), input, select, [data-pad-button]')].filter(el => !el.closest('[hidden],.hidden') && el.getClientRects().length);
      if (!targets.length) return;
      const index = targets.indexOf(document.activeElement), next = (index + (e.shiftKey ? -1 : 1) + targets.length) % targets.length;
      e.preventDefault(); e.stopImmediatePropagation(); targets[next].focus();
    }
  }, true);
  return { open, close, controlsSection, keyboardHeading, wireControls, refresh: () => { if (isOpen()) open({preserve:true}); }, report, get isOpen() { return isOpen(); } };
})();
