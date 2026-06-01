/**
 * HidroGrow — wizard y panel Medir para equipamiento (marca/modelo → specs → configTorre).
 */
(function () {
  function el(id) {
    return document.getElementById(id);
  }

  /** Config de equipamiento en asistente: borrador si es instalación nueva (no pisa la torre activa). */
  function getWizardEquipCfg() {
    if (typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre && typeof setupData !== 'undefined') {
      if (!setupData.equipamientoInstaladoDraft || typeof setupData.equipamientoInstaladoDraft !== 'object') {
        setupData.equipamientoInstaladoDraft = {};
      }
      return { equipamientoInstalado: setupData.equipamientoInstaladoDraft };
    }
    return (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
  }

  function ensureEquipInstalado(cfg) {
    cfg = cfg || getWizardEquipCfg();
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

  /** Rellena campos de sala (asistente) desde equipamiento ya elegido en catálogo. */
  function syncSalaMedidasDesdeEquipamientoInstalado(cfg) {
    cfg = cfg || getWizardEquipCfg();
    const inst = cfg.equipamientoInstalado || {};
    Object.keys(inst).forEach(function (key) {
      const entry = inst[key];
      if (!entry || !entry.specs) return;
      const item = typeof getEquipamientoById === 'function' && entry.id
        ? getEquipamientoById(entry.id)
        : { categoria: key, specs: entry.specs };
      if (item && item.specs) aplicarEquipamientoASala(item, { skipRecalc: true });
    });
  }

  function aplicarEquipamientoASala(item, opts) {
    opts = opts || {};
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
    if (!opts.skipRecalc) {
      if (typeof calcularPremiumSala === 'function') calcularPremiumSala();
      if (typeof calcularGrowRoom === 'function') calcularGrowRoom();
    }
  }

  function seleccionarEquipamientoPremium(catId, equipId) {
    const cfg = getWizardEquipCfg();
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
        if (catId === 'medidor' && !cfg.ultimaCalibracionMedidor) {
          const hoy = new Date();
          cfg.ultimaCalibracionMedidor = hoy.getFullYear() + '-' +
            String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
            String(hoy.getDate()).padStart(2, '0');
        }
        aplicarEquipamientoASala(item);
      }
    }
    if (!(typeof setupEsNuevaTorre !== 'undefined' && setupEsNuevaTorre)) {
      if (typeof saveState === 'function') saveState();
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    }
    renderEquipamientoPremiumUI();
    renderMedirEquipamientoPanel();
    try {
      if (typeof renderSetupDiagramEquipLegendForPreviews === 'function') {
        renderSetupDiagramEquipLegendForPreviews();
      }
    } catch (_) {}
  }

  function renderEquipSelect(catId, selectId, onchangeName) {
    const sel = el(selectId);
    if (!sel) return;
    const cfg = getWizardEquipCfg();
    const cur = (ensureEquipInstalado(cfg)[catId] || {}).id || '';
    const limit = typeof EQUIP_TOP_ES_LIMIT !== 'undefined' ? EQUIP_TOP_ES_LIMIT : 10;
    const list = typeof getEquipTopPorCategoria === 'function'
      ? getEquipTopPorCategoria(catId, limit, cur)
      : (typeof getEquipamientoByCategoria === 'function' ? getEquipamientoByCategoria(catId) : []);
    sel.innerHTML = '<option value="">— Manual / otro modelo —</option>' +
      list.map(function (e) {
        return '<option value="' + e.id + '"' + (e.id === cur ? ' selected' : '') + '>' +
          e.marca + ' · ' + e.modelo + '</option>';
      }).join('');
    sel.onchange = function () {
      window[onchangeName](catId, sel.value);
    };
  }

  function renderEquipCatalogInto(host, idPrefix) {
    if (!host) return;
    const cats = typeof getEquipCategorias === 'function' ? getEquipCategorias() : {};
    const cfg = getWizardEquipCfg();
    const inst = ensureEquipInstalado(cfg);
    const prefix = idPrefix || 'setupPremiumEquip_';
    host.innerHTML = Object.keys(cats).map(function (key) {
      const cat = cats[key];
      const cur = inst[key];
      const selId = prefix + key;
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
      renderEquipSelect(key, prefix + key, 'seleccionarEquipamientoPremium');
    });
  }

  function renderEquipamientoPremiumUI() {
    renderEquipCatalogInto(el('setupPremiumEquipGrid'), 'setupPremiumEquip_');
    renderEquipCatalogInto(el('setupEquipCatalogGrid'), 'setupEquipCatalog_');
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
    const p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    const int = !p || p.entorno !== 'exterior';
    hint.innerHTML = 'Faltan datos de: <strong>' + falt.map(function (f) { return f.label; }).join(', ') + '</strong>. ' +
      (int
        ? 'Selecciona marca/modelo en el catálogo y revisa las medidas de sala más abajo.'
        : 'Selecciona marca/modelo en el catálogo (medidor y clima son prioritarios en exterior).');
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

  function getEquipBasicoResumenTexto(cfg) {
    cfg = cfg || {};
    var eq = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
    var labels = {
      difusor: 'Aireador',
      calentador: 'Calentador',
      bomba: 'Bomba recirc.',
      medidorEC: 'Medidor EC/pH',
      timer: 'Timer',
      toldo: 'Toldo / sombra',
    };
    var parts = eq.map(function (id) {
      return labels[id] || id;
    });
    return parts.length ? parts.join(', ') : '';
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
    if (!lines.length) {
      const ancho = Number(cfg.growRoomAnchoM || cfg.premiumSetup?.anchoM);
      const largo = Number(cfg.growRoomLargoM || cfg.premiumSetup?.largoM);
      const ledW = Number(cfg.growRoomLedW || cfg.premiumSetup?.ledW);
      const ext = Number(cfg.growRoomExtractorM3h || cfg.premiumSetup?.extractorM3h);
      if (Number.isFinite(ancho) && Number.isFinite(largo) && ancho > 0 && largo > 0) {
        lines.push(Math.round(ancho * 100) / 100 + '×' + Math.round(largo * 100) / 100 + ' m sala');
      }
      if (Number.isFinite(ledW) && ledW > 0) lines.push(ledW + ' W LED');
      if (Number.isFinite(ext) && ext > 0) lines.push(ext + ' m³/h extractor');
      if (inst.medidor && inst.medidor.marca) lines.push(inst.medidor.marca + ' medidor');
    }
    if (!lines.length) {
      var basico = getEquipBasicoResumenTexto(cfg);
      if (basico) lines.push(basico);
    }
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

  function parseFechaCalibracion(str) {
    if (!str) return null;
    try {
      const parts = String(str).split('-');
      if (parts.length >= 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setHours(0, 0, 0, 0);
        return Number.isFinite(d.getTime()) ? d : null;
      }
      const d2 = new Date(str);
      d2.setHours(0, 0, 0, 0);
      return Number.isFinite(d2.getTime()) ? d2 : null;
    } catch (_) {
      return null;
    }
  }

  function hoyLocal0() {
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
  }

  function getInfoCalibracionMedidor(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const inst = ensureEquipInstalado(cfg);
    const med = inst.medidor;
    if (!med || !med.id) return null;
    const dias = Number(med.specs && med.specs.calibracionDias) || 30;
    const hoy = hoyLocal0();
    const ultima = parseFechaCalibracion(cfg.ultimaCalibracionMedidor) || hoy;
    const proxima = new Date(ultima.getTime() + dias * 86400000);
    proxima.setHours(0, 0, 0, 0);
    const diasRest = Math.round((proxima - hoy) / 86400000);
    return {
      medidor: med,
      diasIntervalo: dias,
      ultima: ultima,
      proxima: proxima,
      diasRestantes: diasRest,
      vencida: diasRest <= 0,
      proximaPronto: diasRest > 0 && diasRest <= 3,
    };
  }

  function registrarCalibracionMedidor() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const hoy = hoyLocal0();
    cfg.ultimaCalibracionMedidor = hoy.getFullYear() + '-' +
      String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoy.getDate()).padStart(2, '0');
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderMedirEquipamientoPanel();
    if (typeof renderCalendario === 'function') renderCalendario();
    if (typeof showToast === 'function') showToast('✓ Calibración registrada hoy');
    if (typeof markMonitorSemanalHecho === 'function') markMonitorSemanalHecho('calibracion');
  }

  function generarEventosCalibracionDia(fechaDia, hoyRef) {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const info = getInfoCalibracionMedidor(cfg);
    if (!info) return [];
    const hoy = hoyRef || hoyLocal0();
    const d = new Date(fechaDia);
    d.setHours(0, 0, 0, 0);
    const nombre = info.medidor.marca + ' ' + info.medidor.modelo;
    const baseDesc = nombre + ' · cada ' + info.diasIntervalo + ' d (solución buffer según manual).';
    if (info.vencida && d.getTime() === hoy.getTime()) {
      return [{
        tipo: 'calibracion',
        icono: '🧪',
        titulo: 'Calibrar medidor EC/pH (vencido)',
        desc: baseDesc + ' La fecha programada ya pasó — calibra antes de confiar en mediciones.',
      }];
    }
    if (d.getTime() !== info.proxima.getTime()) return [];
    const diff = Math.round((d - hoy) / 86400000);
    return [{
      tipo: 'calibracion',
      icono: '🧪',
      titulo: diff === 0 ? 'Calibrar medidor EC/pH hoy' : 'Calibración medidor próxima',
      desc: baseDesc + (diff <= 0 ? ' Ya toca calibrar.' : ' Prepárate con kits 4.01 / 7.01 y EC estándar.'),
    }];
  }

  function marcarCalibracionCalendarioGrid(addEvento, mes, año) {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const info = getInfoCalibracionMedidor(cfg);
    if (!info) return;
    const hoy = hoyLocal0();
    for (let n = 0; n <= 12; n++) {
      const fecha = new Date(info.ultima.getTime() + (n + 1) * info.diasIntervalo * 86400000);
      fecha.setHours(0, 0, 0, 0);
      if (fecha.getMonth() !== mes || fecha.getFullYear() !== año) continue;
      const diff = Math.round((fecha - hoy) / 86400000);
      const label = diff === 0 ? '🧪 Calibrar medidor hoy' : '🧪 Calibración medidor';
      addEvento(fecha.getDate(), 'calibracion', diff <= 0 ? '#dc2626' : '#7c3aed', label);
    }
  }

  function renderMedirEquipamientoPanel() {
    const card = el('medirEquipamientoCard');
    const panel = el('medirEquipamientoPanel');
    if (!panel) return;
    if (card) card.classList.remove('setup-hidden');
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const interior =
      String(cfg.ubicacion || (cfg.premiumSetup && cfg.premiumSetup.entorno) || 'interior').toLowerCase() !==
      'exterior';
    if (!interior) {
      panel.innerHTML =
        '<p class="medir-equip-lead">Instalación en <strong>exterior</strong>: el catálogo de sala (LED, extractor, carpa…) no aplica. Configura ubicación en <strong>Sala → Ubicación, luz y sustrato</strong> si cultivas en interior.</p>';
      if (typeof renderSalaLayoutPanel === 'function') {
        const layHost = el('salaLayoutPanel');
        if (layHost) layHost.innerHTML = '';
      }
      return;
    }
    const inst = ensureEquipInstalado(cfg);
    const cats = typeof getEquipCategorias === 'function' ? getEquipCategorias() : {};
    const falt = getCamposEquipamientoFaltantes(cfg);
    let html =
      '<p class="medir-equip-lead">Resumen del equipamiento guardado en esta instalación (desde el asistente o al reconfigurar). Para cambiar marca/modelo, abre el asistente de configuración.</p>';
    const resumenBreve = getEquipamientoResumenHtml(cfg);
    if (!resumenBreve) {
      html +=
        '<p class="medir-equip-empty">Sin equipamiento registrado aún. Complétalo en el <strong>asistente</strong> (paso Espacio y equipamiento) o indica medidas de sala en la pestaña <strong>Sala</strong>.</p>';
    }
    if (falt.length) {
      html +=
        '<p class="medir-equip-warn">Completa en el asistente: ' +
        falt.map(function (f) {
          return f.label;
        }).join(', ') +
        '</p>';
    }
    html += '<ul class="medir-equip-list">';
    Object.keys(cats).forEach(function (key) {
      const cat = cats[key];
      const cur = inst[key];
      html +=
        '<li><strong>' +
        cat.icon +
        ' ' +
        cat.label +
        ':</strong> ' +
        (cur ? cur.marca + ' ' + cur.modelo : '<span class="medir-equip-muted">sin registrar</span>') +
        (cur && cur.nota ? ' <span class="medir-equip-muted">— ' + cur.nota + '</span>' : '') +
        '</li>';
    });
    html += '</ul>';
    const cal = getInfoCalibracionMedidor(cfg);
    if (cal) {
      const fmt = function (d) {
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
      };
      html += '<div class="medir-equip-cal' + (cal.vencida ? ' medir-equip-cal--warn' : '') + '">';
      html += '<strong>' + (typeof hcVisualIconSvg === 'function' ? hcVisualIconSvg('medidor', 'hc-visual-ico--sm') : '🧪') +
        ' Calibración ' + cal.medidor.marca + ':</strong> ';
      if (cal.vencida) {
        html += 'vencida · ';
      } else if (cal.proximaPronto) {
        html += 'en ' + cal.diasRestantes + ' d · ';
      } else {
        html += 'próxima ' + fmt(cal.proxima) + ' · ';
      }
      html += 'cada ' + cal.diasIntervalo + ' d';
      html += ' <button type="button" class="btn btn-secondary btn-sm" onclick="registrarCalibracionMedidor()">Registrar hoy</button>';
      html += '</div>';
    }
    html += '<p class="medir-equip-foot">Los fabricantes publican W reales, m³/h, cobertura y calibración en ficha técnica — la app usa esos datos cuando eliges modelo del catálogo.</p>';
    panel.innerHTML = html;
    if (typeof renderSalaLayoutPanel === 'function') renderSalaLayoutPanel();
    if (typeof renderIotPanel === 'function') renderIotPanel();
    if (typeof refreshSistemaEquipResumen === 'function') refreshSistemaEquipResumen(cfg);
  }

  function refreshSistemaEquipResumen(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const span = el('sistemaEquipResumen');
    if (!span) return;
    const interior =
      String(cfg.ubicacion || (cfg.premiumSetup && cfg.premiumSetup.entorno) || 'interior').toLowerCase() !==
      'exterior';
    if (!interior) {
      span.textContent = 'Exterior — no aplica';
      return;
    }
    const res = getEquipamientoResumenHtml(cfg);
    const falt = getCamposEquipamientoFaltantes(cfg);
    if (res) {
      span.textContent = res;
    } else if (falt.length) {
      span.textContent = 'Sin registrar · falta ' + falt.map(function (f) { return f.label; }).join(', ');
    } else {
      var basico = getEquipBasicoResumenTexto(cfg);
      span.textContent = basico ? 'Básico: ' + basico : 'Sin registrar — abre el asistente o indica medidas en Sala';
    }
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

  window.getWizardEquipCfg = getWizardEquipCfg;
  window.syncSalaMedidasDesdeEquipamientoInstalado = syncSalaMedidasDesdeEquipamientoInstalado;
  window.salaTieneMedidasDesdeEquipamiento = salaTieneMedidasDesdeEquipamiento;
  window.seleccionarEquipamientoPremium = seleccionarEquipamientoPremium;
  window.renderEquipamientoPremiumUI = renderEquipamientoPremiumUI;
  window.renderMedirEquipamientoPanel = renderMedirEquipamientoPanel;
  window.persistEquipamientoToConfig = persistEquipamientoToConfig;
  window.cargarEquipamientoDesdeConfig = cargarEquipamientoDesdeConfig;
  window.getCamposEquipamientoFaltantes = getCamposEquipamientoFaltantes;
  window.getEquipamientoResumenHtml = getEquipamientoResumenHtml;
  window.refreshSistemaEquipResumen = refreshSistemaEquipResumen;
  window.getCorreccionEquipamientoSugerido = getCorreccionEquipamientoSugerido;
  window.getInfoCalibracionMedidor = getInfoCalibracionMedidor;
  window.registrarCalibracionMedidor = registrarCalibracionMedidor;
  window.generarEventosCalibracionDia = generarEventosCalibracionDia;
  window.marcarCalibracionCalendarioGrid = marcarCalibracionCalendarioGrid;
})();
