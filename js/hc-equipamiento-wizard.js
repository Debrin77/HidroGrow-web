/**
 * HidroGrow — wizard y panel Medir para equipamiento (marca/modelo → specs → configTorre).
 */
(function () {
  function el(id) {
    return document.getElementById(id);
  }

  function ensureEquipInstalado(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    if (!cfg.equipamientoInstalado || typeof cfg.equipamientoInstalado !== 'object') {
      cfg.equipamientoInstalado = {};
    }
    return cfg.equipamientoInstalado;
  }

  function getPrimeraVariedadCultivo() {
    try {
      const tor = (typeof state !== 'undefined' && state && state.torre) ? state.torre : [];
      for (let n = 0; n < tor.length; n++) {
        const row = tor[n] || [];
        for (let i = 0; i < row.length; i++) {
          if (row[i] && row[i].variedad && typeof getCultivoDB === 'function') {
            return getCultivoDB(row[i].variedad);
          }
        }
      }
    } catch (_) {}
    return null;
  }

  function aplicarEquipamientoASala(item) {
    if (!item || !item.specs) return;
    const s = item.specs;
    const cat = item.categoria;
    if (cat === 'armario') {
      if (el('setupPremiumAnchoM') && s.anchoM != null) el('setupPremiumAnchoM').value = String(s.anchoM);
      if (el('setupPremiumLargoM') && s.largoM != null) el('setupPremiumLargoM').value = String(s.largoM);
      if (el('setupPremiumAltoM') && s.altoM != null) el('setupPremiumAltoM').value = String(s.altoM);
      if (el('growRoomAnchoM') && s.anchoM != null) el('growRoomAnchoM').value = String(s.anchoM);
      if (el('growRoomLargoM') && s.largoM != null) el('growRoomLargoM').value = String(s.largoM);
      if (el('growRoomAltoM') && s.altoM != null) el('growRoomAltoM').value = String(s.altoM);
    }
    if (cat === 'led') {
      if (el('setupPremiumLedW') && s.watts != null) el('setupPremiumLedW').value = String(s.watts);
      if (el('growRoomLedW') && s.watts != null) el('growRoomLedW').value = String(s.watts);
    }
    if (cat === 'extractor') {
      if (el('setupPremiumExtractorM3h') && s.m3h != null) el('setupPremiumExtractorM3h').value = String(s.m3h);
      if (el('growRoomExtractorM3h') && s.m3h != null) el('growRoomExtractorM3h').value = String(s.m3h);
    }
    if (typeof calcularPremiumSala === 'function') calcularPremiumSala();
    if (typeof calcularGrowRoom === 'function') calcularGrowRoom();
  }

  function seleccionarEquipamientoPremium(catId, equipId) {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const inst = ensureEquipInstalado(cfg);
    if (!equipId) {
      delete inst[catId];
    } else {
      const item = typeof getEquipamientoById === 'function' ? getEquipamientoById(equipId) : null;
      if (item) {
        inst[catId] = {
          id: item.id,
          marca: item.marca,
          modelo: item.modelo,
          categoria: item.categoria,
          specs: Object.assign({}, item.specs),
          nota: item.nota || '',
        };
        aplicarEquipamientoASala(item);
      }
    }
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderEquipamientoPremiumUI();
    renderMedirEquipamientoPanel();
  }

  function renderEquipSelect(catId, selectId, onchangeName) {
    const sel = el(selectId);
    if (!sel) return;
    const list = typeof getEquipamientoByCategoria === 'function' ? getEquipamientoByCategoria(catId) : [];
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const cur = (ensureEquipInstalado(cfg)[catId] || {}).id || '';
    sel.innerHTML = '<option value="">— Manual / otro modelo —</option>' +
      list.map(function (e) {
        return '<option value="' + e.id + '"' + (e.id === cur ? ' selected' : '') + '>' +
          e.marca + ' · ' + e.modelo + '</option>';
      }).join('');
    sel.onchange = function () {
      window[onchangeName](catId, sel.value);
    };
  }

  function renderEquipamientoPremiumUI() {
    const host = el('setupPremiumEquipGrid');
    if (!host) return;
    const cats = typeof getEquipCategorias === 'function' ? getEquipCategorias() : {};
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const inst = ensureEquipInstalado(cfg);
    host.innerHTML = Object.keys(cats).map(function (key) {
      const cat = cats[key];
      const cur = inst[key];
      const selId = 'setupPremiumEquip_' + key;
      const visKey = key === 'deshumidificador' ? 'deshumidificador' : key;
      const iconHtml = typeof hcVisualIconSvg === 'function' ? hcVisualIconSvg(visKey, 'hc-visual-ico--sm') : (cat.icon || '');
      return (
        '<div class="equip-catalog-card">' +
        '<div class="equip-catalog-head">' + iconHtml + ' ' + cat.label +
        (cat.indispensable ? ' <span class="equip-catalog-req">indispensable</span>' : '') + '</div>' +
        '<select id="' + selId + '" class="setup-input-city equip-catalog-select"></select>' +
        (cur ? '<p class="equip-catalog-ok">✓ ' + cur.marca + ' ' + cur.modelo + '</p>' : '') +
        '<p class="equip-catalog-hint">' + cat.hint + '</p></div>'
      );
    }).join('');
    Object.keys(cats).forEach(function (key) {
      renderEquipSelect(key, 'setupPremiumEquip_' + key, 'seleccionarEquipamientoPremium');
    });
    renderEquipFaltantesHint();
  }

  function renderEquipFaltantesHint() {
    const hint = el('setupPremiumEquipFaltantes');
    if (!hint) return;
    const falt = getCamposEquipamientoFaltantes();
    if (!falt.length) {
      hint.innerHTML = '<span class="equip-faltantes-ok">✓ Equipamiento indispensable registrado para monitorización.</span>';
      return;
    }
    hint.innerHTML = 'Faltan datos de: <strong>' + falt.map(function (f) { return f.label; }).join(', ') + '</strong>. ' +
      'Selecciona marca/modelo o rellena medidas manualmente.';
  }

  function getCamposEquipamientoFaltantes(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const inst = ensureEquipInstalado(cfg);
    const cats = typeof getEquipCategorias === 'function' ? getEquipCategorias() : {};
    const falt = [];
    Object.keys(cats).forEach(function (key) {
      const cat = cats[key];
      if (!cat.indispensable) return;
      const tieneCatalogo = !!(inst[key] && inst[key].id);
      if (key === 'armario') {
        const ok = Number.isFinite(cfg.growRoomAnchoM || cfg.premiumSetup?.anchoM) &&
          Number.isFinite(cfg.growRoomLargoM || cfg.premiumSetup?.largoM);
        if (!ok && !tieneCatalogo) falt.push(cat);
      } else if (key === 'led') {
        const ok = Number.isFinite(cfg.growRoomLedW || cfg.premiumSetup?.ledW);
        if (!ok && !tieneCatalogo) falt.push(cat);
      } else if (key === 'extractor') {
        const ok = Number.isFinite(cfg.growRoomExtractorM3h || cfg.premiumSetup?.extractorM3h);
        if (!ok && !tieneCatalogo) falt.push(cat);
      } else if (key === 'medidor') {
        if (!tieneCatalogo && !(cfg.sensoresHardware && cfg.sensoresHardware.ec)) falt.push(cat);
      }
    });
    return falt;
  }

  function getEquipamientoResumenHtml(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const inst = ensureEquipInstalado(cfg);
    const lines = [];
    Object.keys(inst).forEach(function (k) {
      const e = inst[k];
      if (!e || !e.marca) return;
      lines.push(e.marca + ' ' + e.modelo);
    });
    return lines.length ? lines.join(' · ') : '';
  }

  function getCorreccionEquipamientoSugerido(tipo) {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const inst = ensureEquipInstalado(cfg);
    if (tipo === 'humidificar' && inst.humidificador) {
      return inst.humidificador.marca + ' ' + inst.humidificador.modelo +
        (inst.humidificador.specs?.capacidadLh ? ' (~' + inst.humidificador.specs.capacidadLh + ' L/h)' : '');
    }
    if (tipo === 'deshumidificar' && inst.deshumidificador) {
      return inst.deshumidificador.marca + ' ' + inst.deshumidificador.modelo;
    }
    if (tipo === 'extractor' && inst.extractor) {
      return inst.extractor.marca + ' ' + inst.extractor.modelo +
        (inst.extractor.specs?.m3h ? ' (' + inst.extractor.specs.m3h + ' m³/h)' : '');
    }
    if (tipo === 'led' && inst.led) {
      return inst.led.marca + ' ' + inst.led.modelo +
        (inst.led.specs?.watts ? ' · ' + inst.led.specs.watts + ' W' : '');
    }
    return '';
  }

  function renderMedirEquipamientoPanel() {
    const card = el('medirEquipamientoCard');
    const panel = el('medirEquipamientoPanel');
    if (!card || !panel) return;
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const interior = String(cfg.ubicacion || cfg.premiumSetup?.entorno || 'interior').toLowerCase() !== 'exterior';
    card.classList.toggle('setup-hidden', !interior);
    if (!interior) return;
    const inst = ensureEquipInstalado(cfg);
    const cats = typeof getEquipCategorias === 'function' ? getEquipCategorias() : {};
    const falt = getCamposEquipamientoFaltantes(cfg);
    let html = '<p class="medir-equip-lead">Marca/modelo registrados alimentan dimensionado de sala, correcciones VPD y protocolo de calibración.</p>';
    if (falt.length) {
      html += '<p class="medir-equip-warn">⚠️ Completa: ' + falt.map(function (f) { return f.label; }).join(', ') + '</p>';
    }
    html += '<ul class="medir-equip-list">';
    Object.keys(cats).forEach(function (key) {
      const cat = cats[key];
      const cur = inst[key];
      html += '<li><strong>' + cat.icon + ' ' + cat.label + ':</strong> ' +
        (cur ? cur.marca + ' ' + cur.modelo : '<span class="medir-equip-muted">sin registrar</span>') +
        (cur && cur.nota ? ' <span class="medir-equip-muted">— ' + cur.nota + '</span>' : '') +
        '</li>';
    });
    html += '</ul>';
    html += '<p class="medir-equip-foot">Los fabricantes publican W reales, m³/h, cobertura y calibración en ficha técnica — la app usa esos datos cuando eliges modelo del catálogo.</p>';
    panel.innerHTML = html;
  }

  function persistEquipamientoToConfig(cfg) {
    if (!cfg) return;
    ensureEquipInstalado(cfg);
    cfg.equipamientoInstalado = JSON.parse(JSON.stringify(cfg.equipamientoInstalado || {}));
  }

  function cargarEquipamientoDesdeConfig(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    renderEquipamientoPremiumUI();
    renderMedirEquipamientoPanel();
  }

  window.seleccionarEquipamientoPremium = seleccionarEquipamientoPremium;
  window.renderEquipamientoPremiumUI = renderEquipamientoPremiumUI;
  window.renderMedirEquipamientoPanel = renderMedirEquipamientoPanel;
  window.persistEquipamientoToConfig = persistEquipamientoToConfig;
  window.cargarEquipamientoDesdeConfig = cargarEquipamientoDesdeConfig;
  window.getCamposEquipamientoFaltantes = getCamposEquipamientoFaltantes;
  window.getEquipamientoResumenHtml = getEquipamientoResumenHtml;
  window.getCorreccionEquipamientoSugerido = getCorreccionEquipamientoSugerido;
})();
