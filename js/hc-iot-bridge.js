/**
 * HidroGrow — puente IoT (Bluetooth / WiFi) para sensores.
 * WiFi: WebSocket JSON local (gateway ESP32/Pi). Asistente paso a paso con lectura de prueba.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'hcIotDevices';
  var WIZARD_KEY = 'hcIotWifiWizardDraft';

  var PARAM_DEFS = {
    ec: { label: 'EC', unit: ' µS/cm', field: 'ec', hint: 'Conductividad del nutriente (µS/cm, no mS/cm).' },
    ph: { label: 'pH', unit: '', field: 'ph', hint: 'Acidez del nutriente (0–14).' },
    temp: { label: 'Temp. agua', unit: ' °C', field: 'temp', hint: 'Temperatura del depósito o cubeta.' },
    vol: { label: 'Volumen', unit: ' L', field: 'vol', hint: 'Litros en depósito (si tu sonda lo mide).' },
    tempAire: { label: 'Temp. aire', unit: ' °C', field: 'tempAire', hint: 'Temperatura ambiente en la sala.' },
    humSala: { label: 'HR sala', unit: ' %', field: 'humSala', hint: 'Humedad relativa en la sala.' },
    ppfd: { label: 'PPFD', unit: ' µmol/m²/s', field: 'ppfd', hint: 'Luz útil sobre el dosel.' },
    lux: { label: 'Lux', unit: ' lx', field: 'lux', hint: 'Luxómetro; la app calcula PPFD aprox.' },
    tempExt: { label: 'Temp. exterior', unit: ' °C', field: 'tempExt', hint: 'Sonda exterior o ambiente fuera de sala.' },
    co2: { label: 'CO₂', unit: ' ppm', field: 'co2', hint: 'Dióxido de carbono en la sala.' },
  };

  var PLAUSIBILITY = {
    ec: { min: 0, max: 6000 },
    ph: { min: 0, max: 14 },
    temp: { min: 0, max: 45 },
    vol: { min: 0, max: 10000 },
    tempAire: { min: 5, max: 45 },
    humSala: { min: 10, max: 100 },
    ppfd: { min: 0, max: 2500 },
    lux: { min: 0, max: 150000 },
    tempExt: { min: -15, max: 50 },
    co2: { min: 300, max: 5000 },
  };

  var KEY_ALIASES = {
    ec: ['ec', 'EC', 'conductivity', 'conductividad', 'us', 'uscm'],
    ph: ['ph', 'pH', 'PH'],
    temp: ['temp', 'tempagua', 'temp_agua', 'tempwater', 'water_temp', 'temperature_water'],
    vol: ['vol', 'volume', 'volumen', 'litros', 'liters', 'l'],
    tempAire: ['tempaire', 'temp_aire', 'tempair', 'temp_air', 'airtemp', 'air_temp', 'temperature_air'],
    humSala: ['humsala', 'hum_sala', 'humidity', 'hum', 'hr', 'rh', 'humedad'],
    ppfd: ['ppfd', 'PPFD', 'par'],
    lux: ['lux', 'Lux', 'LUX', 'illuminance'],
    tempExt: ['tempext', 'temp_ext', 'temp exterior', 'tempexterior', 'outdoor_temp', 'outdoortemp'],
    co2: ['co2', 'CO2', 'co2ppm'],
  };

  var activeWs = null;
  var liveDeviceId = null;
  var wizardMode = false;
  var wizardOnReading = null;

  function loadDevices() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveDevices(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
    } catch (_) {}
  }

  function loadWizardDraft() {
    try {
      var raw = sessionStorage.getItem(WIZARD_KEY);
      return raw
        ? JSON.parse(raw)
        : {
            step: 1,
            name: '',
            wsUrl: '',
            topicPrefix: 'hidrogrow/sala1',
            connectionOk: false,
            testReadings: {},
            confirmedParams: {},
          };
    } catch (_) {
      return { step: 1, name: '', wsUrl: '', topicPrefix: 'hidrogrow/sala1', connectionOk: false, testReadings: {}, confirmedParams: {} };
    }
  }

  function saveWizardDraft(draft) {
    try {
      sessionStorage.setItem(WIZARD_KEY, JSON.stringify(draft));
    } catch (_) {}
  }

  function getIotFieldMap() {
    return {
      ec: 'inputEC',
      ph: 'inputPH',
      temp: 'inputTemp',
      tempAire: 'inputTempAire',
      humSala: 'inputHumSala',
      ppfd: 'inputPPFD',
      lux: 'inputLux',
      tempExt: 'inputTempExt',
      co2: 'inputCO2',
      vol: 'inputVol',
    };
  }

  function normalizeKey(k) {
    return String(k || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  function resolveParamId(key) {
    var nk = normalizeKey(key);
    var ids = Object.keys(KEY_ALIASES);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var aliases = KEY_ALIASES[id];
      for (var j = 0; j < aliases.length; j++) {
        if (normalizeKey(aliases[j]) === nk) return id;
      }
    }
    if (PARAM_DEFS[key]) return key;
    return null;
  }

  function num(v) {
    if (v == null || v === '') return NaN;
    var n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  }

  function normalizeEcValue(val) {
    var n = num(val);
    if (!Number.isFinite(n)) return NaN;
    if (n > 0 && n < 20) return Math.round(n * 1000);
    return n;
  }

  function validatePlausibility(paramId, value) {
    var def = PARAM_DEFS[paramId];
    var range = PLAUSIBILITY[paramId];
    if (!def || !range) return { ok: false, msg: 'Parámetro no reconocido.' };
    var v = paramId === 'ec' ? normalizeEcValue(value) : num(value);
    if (!Number.isFinite(v)) return { ok: false, msg: 'Valor no numérico.' };
    if (v < range.min || v > range.max) {
      return {
        ok: false,
        msg: def.label + ' fuera de límites físicos (' + range.min + '–' + range.max + def.unit + '). Revisa escala o mapeo.',
        value: v,
      };
    }
    var cultMsg = '';
    if (typeof evaluarParametro === 'function') {
      var ev = evaluarParametro(paramId, v, {});
      if (ev && ev.estado && ev.estado !== 'ok' && ev.estado !== 'empty') {
        cultMsg = ' Para tu fase actual: ' + (ev.msg || 'fuera de rango de cultivo') + '.';
      }
    }
    return {
      ok: true,
      msg: 'Valor plausible' + cultMsg,
      value: v,
    };
  }

  function parseIncomingPayload(raw) {
    var out = {};
    var data = raw;
    if (typeof raw === 'string') {
      try {
        data = JSON.parse(raw);
      } catch (_) {
        return out;
      }
    }
    if (!data || typeof data !== 'object') return out;

    if (data.topic != null && data.value != null) {
      var topic = String(data.topic);
      var parts = topic.split('/');
      var last = parts[parts.length - 1];
      var pid = resolveParamId(last);
      if (pid) {
        var vv = pid === 'ec' ? normalizeEcValue(data.value) : num(data.value);
        if (Number.isFinite(vv)) out[pid] = { rawKey: last, value: vv };
      }
      return out;
    }

    var readings = data.readings && typeof data.readings === 'object' ? data.readings : data;
    Object.keys(readings).forEach(function (k) {
      if (k === 'readings' || k === 'cmd' || k === 'timestamp') return;
      var pid = resolveParamId(k);
      if (!pid) return;
      var vv = pid === 'ec' ? normalizeEcValue(readings[k]) : num(readings[k]);
      if (Number.isFinite(vv)) out[pid] = { rawKey: k, value: vv };
    });
    return out;
  }

  function applyReadingToMedir(paramId, value, opts) {
    opts = opts || {};
    var map = getIotFieldMap();
    var inputId = map[paramId];
    if (!inputId) return false;
    var inp = document.getElementById(inputId);
    if (!inp) return false;
    var check = validatePlausibility(paramId, value);
    if (!check.ok && !opts.skipValidation) {
      if (typeof showToast === 'function') {
        showToast('IoT: ' + check.msg, true);
      }
      return false;
    }
    inp.value = String(check.value != null ? check.value : value);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    if (paramId === 'lux' && typeof syncLuxPpfd === 'function') syncLuxPpfd('lux');
    if (paramId === 'ppfd' && typeof syncLuxPpfd === 'function') syncLuxPpfd('ppfd');
    if (paramId === 'tempAire' || paramId === 'humSala') {
      if (typeof actualizarVPDEnUI === 'function') actualizarVPDEnUI();
    }
    if (['tempAire', 'humSala', 'ppfd', 'lux', 'tempExt', 'co2'].indexOf(paramId) >= 0 && typeof evalAmbiente === 'function') {
      evalAmbiente();
    }
    if (typeof evalParam === 'function') evalParam();
    return true;
  }

  function applyParsedReadings(parsed, opts) {
    var applied = 0;
    Object.keys(parsed).forEach(function (pid) {
      if (applyReadingToMedir(pid, parsed[pid].value, opts)) applied++;
    });
    if (applied && typeof actualizarVPDEnUI === 'function') actualizarVPDEnUI();
    return applied;
  }

  function handleWsMessage(ev) {
    var parsed = parseIncomingPayload(ev.data);
    if (!Object.keys(parsed).length) return;

    if (wizardMode && wizardOnReading) {
      wizardOnReading(parsed);
      return;
    }

    var allowed = null;
    if (liveDeviceId) {
      var dev = loadDevices().find(function (d) {
        return d.id === liveDeviceId;
      });
      if (dev && dev.verified && dev.paramMap) {
        allowed = Object.keys(dev.paramMap);
      }
    }

    if (allowed && allowed.length) {
      var filtered = {};
      allowed.forEach(function (pid) {
        if (parsed[pid]) filtered[pid] = parsed[pid];
      });
      parsed = filtered;
    }

    var n = applyParsedReadings(parsed, {});
    if (n && typeof showToast === 'function') {
      showToast('IoT: ' + n + ' parámetro(s) actualizado(s) en Medir.');
    }
    renderIotPanel();
  }

  function disconnectWifi() {
    wizardMode = false;
    wizardOnReading = null;
    if (activeWs) {
      try {
        activeWs.close();
      } catch (_) {}
    }
    activeWs = null;
    liveDeviceId = null;
    renderIotPanel();
  }

  function connectWifiWs(wsUrl, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      if (!wsUrl || !/^wss?:\/\//i.test(wsUrl.trim())) {
        reject(new Error('URL WebSocket inválida. Ejemplo: ws://192.168.1.50:8765'));
        return;
      }
      disconnectWifi();
      var ws;
      try {
        ws = new WebSocket(wsUrl.trim());
      } catch (err) {
        reject(err);
        return;
      }
      var settled = false;
      var timer = setTimeout(function () {
        if (!settled) {
          settled = true;
          try {
            ws.close();
          } catch (_) {}
          reject(new Error('Tiempo de espera agotado. ¿Gateway encendido y en la misma WiFi?'));
        }
      }, opts.timeout || 8000);

      ws.onopen = function () {
        settled = true;
        clearTimeout(timer);
        activeWs = ws;
        wizardMode = !!opts.wizardMode;
        wizardOnReading = opts.onReading || null;
        liveDeviceId = opts.deviceId || null;
        try {
          ws.send(JSON.stringify({ cmd: 'hello', app: 'HidroGrow', mode: opts.wizardMode ? 'test' : 'live' }));
        } catch (_) {}
        resolve(ws);
      };
      ws.onmessage = handleWsMessage;
      ws.onerror = function () {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(new Error('Error de conexión WebSocket.'));
        }
      };
      ws.onclose = function () {
        if (activeWs === ws) {
          activeWs = null;
          liveDeviceId = null;
          renderIotPanel();
        }
      };
    });
  }

  function isWebBluetoothAvailable() {
    return !!(navigator.bluetooth && typeof navigator.bluetooth.requestDevice === 'function');
  }

  async function connectBluetoothGeneric() {
    if (!isWebBluetoothAvailable()) {
      if (typeof showToast === 'function') {
        showToast('Bluetooth web no disponible (Chrome/Edge en HTTPS o localhost).', true);
      }
      return null;
    }
    try {
      var device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information', 'environmental_sensing'],
      });
      var server = await device.gatt.connect();
      var entry = {
        id: device.id || 'ble-' + Date.now(),
        name: device.name || 'Sensor BLE',
        type: 'bluetooth',
        verified: false,
        connectedAt: new Date().toISOString(),
      };
      var list = loadDevices();
      list = list.filter(function (d) {
        return d.id !== entry.id;
      });
      list.unshift(entry);
      saveDevices(list.slice(0, 8));
      if (typeof showToast === 'function') showToast('✓ BLE: ' + entry.name + '. Usa el asistente WiFi para validar lecturas.');
      renderIotPanel();
      return { device: device, server: server, entry: entry };
    } catch (err) {
      if (err && err.name === 'NotFoundError') return null;
      if (typeof showToast === 'function') showToast('Bluetooth: ' + (err.message || err), true);
      return null;
    }
  }

  function registerVerifiedWifiDevice(draft) {
    var entry = {
      id: 'wifi-' + Date.now(),
      name: draft.name || 'Gateway WiFi',
      type: 'wifi',
      wsUrl: draft.wsUrl,
      topicPrefix: draft.topicPrefix || 'hidrogrow/sala1',
      protocol: 'websocket-json',
      verified: true,
      verifiedAt: new Date().toISOString(),
      paramMap: draft.confirmedParams || {},
      testSnapshot: draft.testReadings || {},
    };
    var list = loadDevices();
    list.unshift(entry);
    saveDevices(list.slice(0, 8));
    return entry;
  }

  function simulateDemoReading() {
    applyReadingToMedir('tempAire', 24.2);
    applyReadingToMedir('humSala', 58);
    if (typeof actualizarVPDEnUI === 'function') actualizarVPDEnUI();
    if (typeof showToast === 'function') showToast('Demo IoT: temp. aire y HR rellenados.');
  }

  /* ─── Asistente WiFi paso a paso ─── */

  function openWifiWizard() {
    var modal = document.getElementById('modalIotWifi');
    if (!modal) return;
    modal.classList.add('open');
    renderWifiWizard();
  }

  function closeWifiWizard(ev) {
    if (ev && ev.target !== ev.currentTarget) return;
    var modal = document.getElementById('modalIotWifi');
    if (modal) modal.classList.remove('open');
    wizardMode = false;
    wizardOnReading = null;
  }

  function wizardMergeReadings(draft, parsed) {
    Object.keys(parsed).forEach(function (pid) {
      var val = parsed[pid];
      var check = validatePlausibility(pid, val.value);
      draft.testReadings[pid] = {
        rawKey: val.rawKey,
        value: check.value != null ? check.value : val.value,
        plausible: check.ok,
        msg: check.msg,
      };
      draft.confirmedParams[pid] = false;
    });
    saveWizardDraft(draft);
  }

  function renderWifiWizardStepContent(draft) {
    var step = draft.step;
    if (step === 1) {
      return (
        '<div class="hc-iot-wiz-block">' +
        '<p class="hc-iot-wiz-lead"><strong>Sin sensores:</strong> sigues registrando todo manualmente en Medir. No tienes que hacer nada aquí.</p>' +
        '<p class="hc-iot-wiz-lead"><strong>Con gateway WiFi:</strong> un ESP32 o Raspberry en tu sala envía lecturas a esta app por la red local. Solo funciona si el móvil/PC está en la <strong>misma WiFi</strong>.</p>' +
        '<ol class="hc-iot-wiz-steps-list">' +
        '<li>Preparar gateway y sensores en la sala</li>' +
        '<li>Indicar URL WebSocket del gateway</li>' +
        '<li>Probar que hay conexión</li>' +
        '<li>Recibir <strong>lectura de prueba</strong> y comprobar parámetros</li>' +
        '<li>Confirmar que cada valor es el correcto</li>' +
        '</ol></div>'
      );
    }
    if (step === 2) {
      return (
        '<div class="hc-iot-wiz-block">' +
        '<p class="hc-iot-wiz-lead">Antes de continuar, comprueba en tu gateway:</p>' +
        '<ul class="hc-iot-wiz-checklist">' +
        '<li>Gateway encendido y conectado a la WiFi de casa</li>' +
        '<li>Sensores cableados o emparejados al gateway</li>' +
        '<li>Publica JSON por WebSocket, por ejemplo:<br><code class="hc-iot-code">{"ec":1800,"ph":5.9,"temp":20.1,"tempAire":24.2,"humSala":58,"ppfd":650,"lux":35000,"co2":920,"tempExt":31.5,"vol":18}</code></li>' +
        '<li>EC en <strong>µS/cm</strong> (1.8 mS/cm → 1800)</li>' +
        '</ul></div>'
      );
    }
    if (step === 3) {
      return (
        '<div class="hc-iot-wiz-block">' +
        '<label class="ctp-label" for="iotWizName">Nombre del gateway</label>' +
        '<input type="text" id="iotWizName" class="ctp-input" maxlength="40" value="' +
        escHtml(draft.name) +
        '" placeholder="Ej. ESP32 sala principal">' +
        '<label class="ctp-label" for="iotWizWsUrl">URL WebSocket (misma WiFi)</label>' +
        '<input type="text" id="iotWizWsUrl" class="ctp-input" maxlength="200" value="' +
        escHtml(draft.wsUrl) +
        '" placeholder="ws://192.168.1.50:8765">' +
        '<p class="hc-iot-wiz-note">Firmware de ejemplo en <code class="hc-iot-code">docs/iot/ESP32-hidrogrow-gateway.ino</code></p>' +
        '<label class="ctp-label" for="iotWizTopic">Prefijo topic MQTT (opcional)</label>' +
        '<input type="text" id="iotWizTopic" class="ctp-input" maxlength="80" value="' +
        escHtml(draft.topicPrefix) +
        '" placeholder="hidrogrow/sala1">' +
        '</div>'
      );
    }
    if (step === 4) {
      var connTxt = draft.connectionOk
        ? '<p class="hc-iot-wiz-ok">✓ Conexión WebSocket establecida.</p>'
        : '<p class="hc-iot-wiz-warn">Pulsa «Probar conexión» para verificar que la app alcanza el gateway.</p>';
      return (
        '<div class="hc-iot-wiz-block">' +
        connTxt +
        '<p class="hc-iot-wiz-lead">La app enviará un saludo al gateway. Si no responde en 8 s, revisa IP, firewall y que estés en la misma red.</p>' +
        '<button type="button" class="btn btn-secondary btn-sm" onclick="hcIotWizardTestConnection()">🔌 Probar conexión</button>' +
        '</div>'
      );
    }
    if (step === 5) {
      var hasReadings = Object.keys(draft.testReadings || {}).length > 0;
      return (
        '<div class="hc-iot-wiz-block">' +
        '<p class="hc-iot-wiz-lead"><strong>Lectura de prueba:</strong> pide al gateway que envíe valores ahora (o usa la demo si aún no tienes hardware).</p>' +
        '<div class="hc-iot-wiz-actions-row">' +
        '<button type="button" class="btn btn-secondary btn-sm" onclick="hcIotWizardRequestTest()" ' +
        (draft.connectionOk ? '' : 'disabled') +
        '>📥 Esperar lectura del gateway</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" onclick="hcIotWizardSimulateTest()">Demo sin hardware</button>' +
        '</div>' +
        '<p class="hc-iot-wiz-note" id="iotWizTestStatus">' +
        (hasReadings ? 'Lectura recibida. Revisa la tabla en el siguiente paso.' : 'Esperando datos de prueba…') +
        '</p></div>'
      );
    }
    if (step === 6) {
      return renderValidationTable(draft);
    }
    if (step === 7) {
      var verified = countVerifiedParams(draft);
      var total = Object.keys(draft.testReadings || {}).length;
      return (
        '<div class="hc-iot-wiz-block">' +
        '<p class="hc-iot-wiz-lead">Resumen del vínculo WiFi:</p>' +
        '<ul class="hc-iot-wiz-summary">' +
        '<li><strong>Nombre:</strong> ' +
        escHtml(draft.name) +
        '</li>' +
        '<li><strong>URL:</strong> ' +
        escHtml(draft.wsUrl) +
        '</li>' +
        '<li><strong>Parámetros validados:</strong> ' +
        verified +
        '/' +
        total +
        '</li>' +
        '</ul>' +
        '<p class="hc-iot-wiz-lead">Al confirmar, la app solo autocompletará en Medir los parámetros que hayas marcado como correctos. Siempre podrás revisar y editar antes de guardar la medición.</p>' +
        (verified > 0
          ? ''
          : '<p class="hc-iot-wiz-warn">Marca al menos un parámetro como correcto en el paso anterior.</p>') +
        '</div>'
      );
    }
    return '';
  }

  function countVerifiedParams(draft) {
    var n = 0;
    Object.keys(draft.confirmedParams || {}).forEach(function (k) {
      if (draft.confirmedParams[k]) n++;
    });
    return n;
  }

  function renderValidationTable(draft) {
    var keys = Object.keys(draft.testReadings || {});
    if (!keys.length) {
      return '<p class="hc-iot-wiz-warn">Aún no hay lectura de prueba. Vuelve al paso 5 y recibe datos del gateway o usa la demo.</p>';
    }
    var rows = keys
      .map(function (pid) {
        var r = draft.testReadings[pid];
        var def = PARAM_DEFS[pid] || { label: pid, unit: '' };
        var cls = r.plausible ? 'hc-iot-val--ok' : 'hc-iot-val--bad';
        var checked = draft.confirmedParams[pid] ? ' checked' : '';
        return (
          '<tr class="' +
          cls +
          '">' +
          '<td><strong>' +
          def.label +
          '</strong><br><span class="hc-iot-wiz-sub">clave: ' +
          escHtml(r.rawKey) +
          '</span></td>' +
          '<td>' +
          r.value +
          def.unit +
          '</td>' +
          '<td class="hc-iot-val-msg">' +
          escHtml(r.msg) +
          '</td>' +
          '<td><label class="hc-iot-confirm-lbl"><input type="checkbox" data-iot-param="' +
          pid +
          '"' +
          checked +
          ' onchange="hcIotWizardToggleConfirm(\'' +
          pid +
          '\', this.checked)"> Correcto</label></td>' +
          '</tr>'
        );
      })
      .join('');
    return (
      '<div class="hc-iot-wiz-block">' +
      '<p class="hc-iot-wiz-lead">Compara cada valor con tu medidor físico. Solo marca <strong>Correcto</strong> si coincide con lo que ves en pantalla del sensor.</p>' +
      '<div class="hc-iot-val-table-wrap"><table class="hc-iot-val-table">' +
      '<thead><tr><th>Parámetro</th><th>Recibido</th><th>Validación app</th><th>Tú confirmas</th></tr></thead>' +
      '<tbody>' +
      rows +
      '</tbody></table></div></div>'
    );
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var WIZARD_TITLES = [
    '',
    '1 · ¿Usar sensores WiFi?',
    '2 · Requisitos del gateway',
    '3 · Datos de conexión',
    '4 · Probar conexión',
    '5 · Lectura de prueba',
    '6 · Validar parámetros',
    '7 · Confirmar vínculo',
  ];

  function renderWifiWizard() {
    var host = document.getElementById('iotWifiWizardBody');
    var titleEl = document.getElementById('iotWifiWizardTitle');
    if (!host) return;
    var draft = loadWizardDraft();
    if (titleEl) titleEl.textContent = WIZARD_TITLES[draft.step] || 'Asistente WiFi';
    host.innerHTML = renderWifiWizardStepContent(draft);

    var prevBtn = document.getElementById('iotWizBtnPrev');
    var nextBtn = document.getElementById('iotWizBtnNext');
    var finBtn = document.getElementById('iotWizBtnFinish');
    if (prevBtn) prevBtn.style.display = draft.step > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = draft.step < 7 ? '' : 'none';
    if (finBtn) finBtn.style.display = draft.step === 7 ? '' : 'none';
    if (nextBtn) {
      nextBtn.disabled = draft.step === 4 && !draft.connectionOk;
      if (draft.step === 4 && !draft.connectionOk) nextBtn.title = 'Primero prueba la conexión';
      else if (draft.step === 5 && !Object.keys(draft.testReadings || {}).length) {
        nextBtn.disabled = true;
        nextBtn.title = 'Recibe una lectura de prueba';
      } else if (draft.step === 6 && countVerifiedParams(draft) === 0) {
        nextBtn.disabled = true;
        nextBtn.title = 'Marca al menos un parámetro como correcto';
      } else {
        nextBtn.disabled = false;
        nextBtn.title = '';
      }
    }
    if (finBtn) {
      finBtn.disabled = countVerifiedParams(draft) === 0;
    }
  }

  function wizardCollectStep3() {
    var draft = loadWizardDraft();
    var n = document.getElementById('iotWizName');
    var u = document.getElementById('iotWizWsUrl');
    var t = document.getElementById('iotWizTopic');
    if (n) draft.name = n.value.trim();
    if (u) draft.wsUrl = u.value.trim();
    if (t) draft.topicPrefix = t.value.trim();
    saveWizardDraft(draft);
    return draft;
  }

  function wizardNext() {
    var draft = loadWizardDraft();
    if (draft.step === 3) draft = wizardCollectStep3();
    if (draft.step === 3 && (!draft.name || !draft.wsUrl)) {
      if (typeof showToast === 'function') showToast('Indica nombre y URL WebSocket.', true);
      return;
    }
    if (draft.step < 7) {
      draft.step++;
      saveWizardDraft(draft);
      renderWifiWizard();
    }
  }

  function wizardPrev() {
    var draft = loadWizardDraft();
    if (draft.step > 1) {
      draft.step--;
      saveWizardDraft(draft);
      renderWifiWizard();
    }
  }

  function wizardReset() {
    sessionStorage.removeItem(WIZARD_KEY);
    renderWifiWizard();
  }

  async function wizardTestConnection() {
    var draft = wizardCollectStep3();
    if (!draft.wsUrl) {
      if (typeof showToast === 'function') showToast('Indica la URL WebSocket.', true);
      return;
    }
    try {
      await connectWifiWs(draft.wsUrl, { wizardMode: true, timeout: 8000 });
      draft.connectionOk = true;
      saveWizardDraft(draft);
      if (typeof showToast === 'function') showToast('✓ Conexión OK con el gateway.');
      renderWifiWizard();
    } catch (err) {
      draft.connectionOk = false;
      saveWizardDraft(draft);
      if (typeof showToast === 'function') showToast((err && err.message) || 'Sin conexión', true);
      renderWifiWizard();
    }
  }

  function wizardRequestTest() {
    var draft = loadWizardDraft();
    if (!draft.connectionOk || !activeWs) {
      if (typeof showToast === 'function') showToast('Primero establece conexión en el paso 4.', true);
      return;
    }
    var status = document.getElementById('iotWizTestStatus');
    if (status) status.textContent = 'Esperando lectura del gateway (30 s)…';
    wizardMode = true;
    wizardOnReading = function (parsed) {
      wizardMergeReadings(draft, parsed);
      wizardMode = true;
      if (typeof showToast === 'function') showToast('✓ Lectura de prueba recibida.');
      renderWifiWizard();
    };
    try {
      activeWs.send(JSON.stringify({ cmd: 'read', test: true, topic: draft.topicPrefix }));
    } catch (_) {}
    setTimeout(function () {
      draft = loadWizardDraft();
      if (!Object.keys(draft.testReadings || {}).length && status) {
        status.textContent = 'No llegaron datos. Comprueba que el gateway envía JSON al conectar o al recibir cmd read.';
      }
    }, 30000);
  }

  function wizardSimulateTest() {
    var draft = loadWizardDraft();
    var sample = parseIncomingPayload({
      ec: 1.82,
      ph: 5.92,
      temp: 20.1,
      tempAire: 24.3,
      humSala: 57,
      ppfd: 680,
      lux: 37000,
      co2: 915,
      tempExt: 29.4,
      vol: 18,
    });
    wizardMergeReadings(draft, sample);
    if (typeof showToast === 'function') showToast('Demo: lectura de prueba cargada. Compara con tu medidor real en el paso 6.');
    renderWifiWizard();
  }

  function wizardToggleConfirm(paramId, checked) {
    var draft = loadWizardDraft();
    if (!draft.testReadings[paramId]) return;
    if (checked && !draft.testReadings[paramId].plausible) {
      if (typeof showToast === 'function') {
        showToast('Este valor no pasa la validación física. Revisa escala o gateway antes de confirmar.', true);
      }
    }
    draft.confirmedParams[paramId] = !!checked;
    saveWizardDraft(draft);
    renderWifiWizard();
  }

  function wizardFinish() {
    var draft = loadWizardDraft();
    var verified = countVerifiedParams(draft);
    if (!verified) {
      if (typeof showToast === 'function') showToast('Marca al menos un parámetro como correcto.', true);
      return;
    }
    var filtered = {};
    Object.keys(draft.confirmedParams).forEach(function (k) {
      if (draft.confirmedParams[k]) filtered[k] = draft.testReadings[k];
    });
    draft.confirmedParams = Object.keys(filtered).reduce(function (acc, k) {
      acc[k] = true;
      return acc;
    }, {});
    draft.testReadings = filtered;
    var entry = registerVerifiedWifiDevice(draft);
    sessionStorage.removeItem(WIZARD_KEY);
    disconnectWifi();
    closeWifiWizard();
    renderIotPanel();
    if (typeof showToast === 'function') {
      showToast('✓ Gateway «' + entry.name + '» vinculado con ' + verified + ' parámetro(s) verificados.');
    }
  }

  async function connectLiveDevice(id) {
    var list = loadDevices();
    var dev = list.find(function (d) {
      return d.id === id;
    });
    if (!dev || dev.type !== 'wifi' || !dev.wsUrl) return;
    try {
      await connectWifiWs(dev.wsUrl, { deviceId: id, wizardMode: false });
      liveDeviceId = id;
      if (typeof showToast === 'function') showToast('Conectado a «' + dev.name + '». Los valores válidos rellenarán Medir.');
      renderIotPanel();
    } catch (err) {
      if (typeof showToast === 'function') showToast((err && err.message) || 'Error al conectar', true);
    }
  }

  function renderIotPanel() {
    var host = document.getElementById('medirIotPanel');
    if (!host) return;
    var list = loadDevices();
    var bleOk = isWebBluetoothAvailable();
    var live = !!activeWs && !wizardMode;

    host.innerHTML =
      '<p class="hc-iot-hint"><strong>Sin sensores:</strong> ignora este panel y registra en Medir manualmente.</p>' +
      '<p class="hc-iot-hint"><strong>Con gateway WiFi:</strong> EC, pH, temp. agua, vol., temp. aire, HR, PPFD, lux, CO₂ y temp. exterior — asistente con lectura de prueba.</p>' +
      '<div class="hc-iot-actions">' +
      '<button type="button" class="btn btn-sm btn-primary" onclick="hcIotOpenWifiWizard()">🌐 Configurar WiFi (paso a paso)</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" onclick="hcIotConnectBluetooth()" ' +
      (bleOk ? '' : 'disabled title="Chrome/Edge HTTPS"') +
      '>📡 Bluetooth</button>' +
      (live
        ? '<button type="button" class="btn btn-sm btn-ghost" onclick="hcIotDisconnect()">Desconectar</button>'
        : '') +
      '</div>' +
      (live ? '<p class="hc-iot-wiz-ok hc-iot-live-badge">● Recibiendo datos en vivo (solo parámetros validados)</p>' : '') +
      (list.length
        ? '<ul class="hc-iot-list">' +
          list
            .map(function (d) {
              var badge = d.verified ? ' ✓ verificado' : '';
              var liveBtn =
                d.type === 'wifi' && d.verified
                  ? ' <button type="button" class="btn-link hc-iot-link-btn" onclick="hcIotConnectLive(\'' +
                    d.id +
                    "')\">Conectar</button>"
                  : '';
              return (
                '<li><strong>' +
                escHtml(d.name) +
                '</strong> <span class="hc-iot-type">' +
                d.type +
                badge +
                '</span>' +
                liveBtn +
                '</li>'
              );
            })
            .join('') +
          '</ul>'
        : '<p class="hc-iot-empty">Sin dispositivos vinculados.</p>');
  }

  global.hcIotOpenWifiWizard = openWifiWizard;
  global.hcIotCloseWifiWizard = closeWifiWizard;
  global.hcIotWizardNext = wizardNext;
  global.hcIotWizardPrev = wizardPrev;
  global.hcIotWizardReset = wizardReset;
  global.hcIotWizardTestConnection = wizardTestConnection;
  global.hcIotWizardRequestTest = wizardRequestTest;
  global.hcIotWizardSimulateTest = wizardSimulateTest;
  global.hcIotWizardToggleConfirm = wizardToggleConfirm;
  global.hcIotWizardFinish = wizardFinish;
  global.hcIotConnectBluetooth = connectBluetoothGeneric;
  global.hcIotSimulateDemo = simulateDemoReading;
  global.hcIotDisconnect = disconnectWifi;
  global.hcIotConnectLive = connectLiveDevice;
  global.renderIotPanel = renderIotPanel;
  global.hcIotApplyReading = applyReadingToMedir;
  global.hcIotIsBluetoothAvailable = isWebBluetoothAvailable;
  global.hcIotParsePayload = parseIncomingPayload;
  global.hcIotValidateParam = validatePlausibility;

  function getCalendarContext() {
    var list = loadDevices();
    return {
      linked: list.length > 0,
      count: list.length,
      live: !!liveDeviceId,
      primaryName: list[0] && list[0].name ? String(list[0].name) : null,
    };
  }
  global.hcIotGetCalendarContext = getCalendarContext;
})(typeof window !== 'undefined' ? window : globalThis);
