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
    if (catId === 'propagador' || catId === 'mat_termica_germ') {
      try {
        if (catId === 'propagador' && typeof onPropagadorEquipSeleccionado === 'function') {
          onPropagadorEquipSeleccionado();
        }
        if (typeof hcGerminacionSyncEquipDesdeInstalado === 'function') hcGerminacionSyncEquipDesdeInstalado(cfg);
        if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
        if (typeof saveState === 'function') saveState();
      } catch (_) {}
    }
    try {
      if (typeof renderSetupDiagramEquipLegendForPreviews === 'function') {
        renderSetupDiagramEquipLegendForPreviews();
      }
    } catch (_) {}
  }

  function resolveEquipCategorias() {
    try {
      if (typeof window !== 'undefined') {
        if (typeof window.getEquipCategorias === 'function') {
          const c = window.getEquipCategorias();
          if (c && typeof c === 'object') return c;
        }
        if (window.EQUIP_CATEGORIAS && typeof window.EQUIP_CATEGORIAS === 'object') {
          return window.EQUIP_CATEGORIAS;
        }
      }
    } catch (_) {}
    return {};
  }

  function renderEquipSelect(catId, selectIdOrEl, onchangeName) {
    const sel =
      selectIdOrEl && typeof selectIdOrEl === 'object' && selectIdOrEl.nodeType === 1
        ? selectIdOrEl
        : el(selectIdOrEl);
    if (!sel) return;
    const cfg = getWizardEquipCfg();
    const cur = (ensureEquipInstalado(cfg)[catId] || {}).id || '';
    const limit =
      typeof window !== 'undefined' && window.EQUIP_TOP_ES_LIMIT != null
        ? window.EQUIP_TOP_ES_LIMIT
        : 10;
    const topFn =
      typeof window !== 'undefined' && typeof window.getEquipTopPorCategoria === 'function'
        ? window.getEquipTopPorCategoria
        : null;
    const byCatFn =
      typeof window !== 'undefined' && typeof window.getEquipamientoByCategoria === 'function'
        ? window.getEquipamientoByCategoria
        : null;
    const list = topFn
      ? topFn(catId, limit, cur)
      : byCatFn
        ? byCatFn(catId)
        : [];
    sel.replaceChildren();
    const opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = '— Manual / otro modelo —';
    sel.appendChild(opt0);
    list.forEach(function (e) {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = e.marca + ' · ' + e.modelo;
      if (e.id === cur) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = function () {
      if (typeof window[onchangeName] === 'function') window[onchangeName](catId, sel.value);
    };
  }

  function ensureEquipDisclaimer(host) {
    if (!host || !host.id) return;
    var id = host.id + '_disclaimer';
    var d = document.getElementById(id);
    if (!d) {
      d = document.createElement('p');
      d.id = id;
      d.className = 'setup-field-hint equip-catalog-disclaimer';
      d.textContent =
        'Catálogo orientativo — verifica disponibilidad, precio y ficha técnica en tu growshop antes de comprar.';
      if (host.parentNode) host.parentNode.insertBefore(d, host);
    }
  }

  function resolveSetupEntorno() {
    try {
      if (typeof ensurePremiumSetup === 'function') {
        const p = ensurePremiumSetup();
        if (p && p.entorno === 'exterior') return 'exterior';
      }
    } catch (_) {}
    if (typeof setupData !== 'undefined' && setupData && setupData.ubicacion === 'exterior') return 'exterior';
    if (typeof setupUbicacion !== 'undefined' && setupUbicacion === 'exterior') return 'exterior';
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    if (String(cfg.ubicacion || cfg.premiumSetup?.entorno || '').toLowerCase() === 'exterior') return 'exterior';
    return 'interior';
  }

  function renderEquipCatalogCard(host, cat, key, inst, prefix) {
    const cur = inst[key];
    const selId = prefix + key;
    const visKey = key === 'deshumidificador' ? 'deshumidificador' : key;
    const card = document.createElement('div');
    card.className = 'equip-catalog-card' + (cur && cur.marca ? ' equip-catalog-card--picked' : '');
    const head = document.createElement('div');
    head.className = 'equip-catalog-head';
    if (typeof window.hcVisualIconSvg === 'function') {
      try {
        head.insertAdjacentHTML('afterbegin', window.hcVisualIconSvg(visKey, 'hc-visual-ico--sm'));
      } catch (_) {
        head.appendChild(document.createTextNode(cat.icon || '•'));
      }
    } else {
      head.appendChild(document.createTextNode(cat.icon || '•'));
    }
    head.appendChild(document.createTextNode(' ' + (cat.label || key)));
    if (cat.indispensable) {
      head.appendChild(document.createTextNode(' '));
      const req = document.createElement('span');
      req.className = 'equip-catalog-req';
      req.textContent = 'indispensable';
      head.appendChild(req);
    } else if (cat.recommended) {
      head.appendChild(document.createTextNode(' '));
      const rec = document.createElement('span');
      rec.className = 'equip-catalog-rec';
      var origRec =
        typeof getPremiumOrigenPlanta === 'function' ? getPremiumOrigenPlanta() : 'semilla';
      if (key === 'propagador' && origRec === 'semilla') {
        rec.textContent = 'recomendado con semilla';
        card.classList.add('equip-catalog-card--reco-origen');
      } else if (key === 'propagador' && origRec === 'clon') {
        rec.textContent = 'recomendado con esqueje';
        card.classList.add('equip-catalog-card--reco-origen');
      } else if (key === 'mat_termica_germ' && (origRec === 'semilla' || origRec === 'clon')) {
        rec.textContent = 'recomendado';
        card.classList.add('equip-catalog-card--reco-origen');
      } else {
        rec.textContent = 'recomendado';
      }
      head.appendChild(rec);
    }
    card.appendChild(head);
    const sel = document.createElement('select');
    sel.id = selId;
    sel.className = 'setup-input-city equip-catalog-select';
    sel.setAttribute('aria-label', cat.label || key);
    card.appendChild(sel);
    if (cur && cur.marca) {
      const ok = document.createElement('p');
      ok.className = 'equip-catalog-ok';
      ok.textContent = '✓ ' + cur.marca + ' ' + (cur.modelo || '');
      card.appendChild(ok);
    }
    if (cat.hint) {
      const hintP = document.createElement('p');
      hintP.className = 'equip-catalog-hint';
      hintP.textContent = cat.hint;
      card.appendChild(hintP);
    }
    host.appendChild(card);
    renderEquipSelect(key, sel, 'seleccionarEquipamientoPremium');
  }

  function renderEquipCatalogInto(host, idPrefix) {
    if (!host) return;
    ensureEquipDisclaimer(host);
    const cats = resolveEquipCategorias();
    const cfg = getWizardEquipCfg();
    const inst = ensureEquipInstalado(cfg);
    const prefix = idPrefix || 'setupPremiumEquip_';
    const entorno = resolveSetupEntorno();
    const groupsFn =
      typeof window !== 'undefined' && typeof window.getEquipCatalogGroups === 'function'
        ? window.getEquipCatalogGroups
        : null;
    const groups = groupsFn ? groupsFn(entorno) : [{ id: 'all', label: 'Equipamiento', icon: '🔧', keys: Object.keys(cats) }];
    if (typeof host.replaceChildren === 'function') host.replaceChildren();
    else host.innerHTML = '';
    if (!Object.keys(cats).length) {
      const err = document.createElement('p');
      err.className = 'setup-box-warn';
      err.setAttribute('role', 'alert');
      err.textContent =
        'No se pudo cargar el catálogo de equipamiento. Recarga la página con Ctrl+F5.';
      host.appendChild(err);
      return;
    }
    groups.forEach(function (group) {
      const section = document.createElement('section');
      section.className =
        'equip-catalog-group' +
        (group.required ? ' equip-catalog-group--required' : '') +
        (group.optional ? ' equip-catalog-group--optional' : '');
      section.setAttribute('data-equip-group', group.id || 'all');
      const head = document.createElement('div');
      head.className = 'equip-catalog-group-head';
      head.innerHTML =
        '<span class="equip-catalog-group-icon" aria-hidden="true">' + (group.icon || '•') + '</span>' +
        '<span class="equip-catalog-group-title">' + (group.label || '') + '</span>' +
        (group.required ? '<span class="equip-catalog-group-req">Ahora</span>' : '');
      section.appendChild(head);
      if (group.hint) {
        const hintP = document.createElement('p');
        hintP.className = 'equip-catalog-group-hint';
        hintP.textContent = group.hint;
        section.appendChild(hintP);
      }
      const grid = document.createElement('div');
      grid.className = 'equip-catalog-grid equip-catalog-grid--group';
      (group.keys || []).forEach(function (key) {
        const cat = cats[key];
        if (!cat) return;
        renderEquipCatalogCard(grid, cat, key, inst, prefix);
      });
      if (grid.childNodes.length) {
        section.appendChild(grid);
        host.appendChild(section);
      }
    });
    if (!host.childNodes.length) {
      const err = document.createElement('p');
      err.className = 'setup-box-warn';
      err.setAttribute('role', 'alert');
      err.textContent =
        'No se pudo mostrar el catálogo. Recarga con Ctrl+F5 o revisa la conexión.';
      host.appendChild(err);
    }
  }

  function isGermAhoraPropagadorEquip() {
    return (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    );
  }

  function renderEquipOrigenGermBanner() {
    const banner = el('setupPremiumEquipGermReco');
    if (!banner) return;
    if (isGermAhoraPropagadorEquip()) {
      banner.classList.add('setup-hidden');
      banner.innerHTML = '';
      return;
    }
    const origen =
      typeof getPremiumOrigenPlanta === 'function' ? getPremiumOrigenPlanta() : 'semilla';
    const cfg = getWizardEquipCfg();
    const inst = ensureEquipInstalado(cfg);
    if (origen === 'semilla') {
      banner.classList.remove('setup-hidden');
      const tieneProp = !!(inst.propagador && inst.propagador.id);
      banner.className = tieneProp ? 'setup-box-info setup-mb-8' : 'setup-box-warn setup-mb-8';
      var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {};
      var plan =
        Number.isFinite(p.numSemillasGerm) && p.sustratoGerm
          ? ' Plan: <strong>' +
            p.numSemillasGerm +
            ' semilla(s)</strong> en <strong>' +
            (typeof etiquetaSustratoGerm === 'function' ? etiquetaSustratoGerm(p.sustratoGerm) : p.sustratoGerm) +
            '</strong> (bloque de abajo).'
          : ' Indica <strong>cuántas semillas</strong> y <strong>sustrato</strong> en el bloque de abajo.';
      banner.innerHTML = tieneProp
        ? '<strong>Semilla:</strong> propagador en catálogo.' + plan + ' Seguimiento en <strong>Inicio → Germinación</strong> y <strong>Sistema → Propagador</strong>.'
        : '<strong>Semilla:</strong> marca un <strong>domo / propagador</strong> arriba y completa el plan de semillas/sustrato abajo.';
      return;
    }
    if (origen === 'clon') {
      banner.classList.remove('setup-hidden');
      banner.className = 'setup-box-info setup-mb-8';
      banner.innerHTML =
        '<strong>Esqueje/clon:</strong> recomendado <strong>propagador con domo</strong> en el grupo de enraizado. El calendario día a día está en este mismo paso (bloques de domo).';
      return;
    }
    banner.classList.add('setup-hidden');
    banner.innerHTML = '';
  }

  function renderEquipamientoPremiumUI() {
    renderEquipOrigenGermBanner();
    renderEquipCatalogInto(el('setupPremiumEquipGrid'), 'setupPremiumEquip_');
    renderEquipCatalogInto(el('setupEquipCatalogGrid'), 'setupEquipCatalog_');
    renderEquipFaltantesHint();
    const cam =
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
    const soloPropagador =
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm();
    const salaSec = el('setupPremiumSalaInterior');
    if (salaSec) {
      salaSec.classList.toggle('setup-hidden', !!soloPropagador);
    }
    const equipSec = el('setupPremiumEquipSection');
    if (equipSec) equipSec.classList.remove('setup-hidden');
  }

  function renderEquipFaltantesHint() {
    const hint = el('setupPremiumEquipFaltantes');
    if (!hint) return;
    const cfg = getWizardEquipCfg();
    const inst = ensureEquipInstalado(cfg);
    const falt = getCamposEquipamientoFaltantes(cfg);
    const cam =
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    const faseGerm =
      typeof hcSetupEnFaseGerminacion === 'function' && hcSetupEnFaseGerminacion();
    hint.classList.remove('setup-box-warn', 'setup-box-info', 'setup-hidden');
    const origen =
      typeof getPremiumOrigenPlanta === 'function' ? getPremiumOrigenPlanta() : 'semilla';
    const sinPropagador = (origen === 'semilla' || origen === 'clon') && !(inst.propagador && inst.propagador.id);
    if (isGermAhoraPropagadorEquip()) {
      if (sinPropagador) {
        hint.classList.remove('setup-hidden');
        hint.className = 'setup-field-hint setup-mb-8';
        hint.textContent = 'Falta elegir domo / propagador.';
      } else {
        hint.classList.add('setup-hidden');
        hint.textContent = '';
      }
      return;
    }
    if (
      (typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
        hcCaminoSemillaPropagadorSetupGerm()) &&
      !sinPropagador
    ) {
      hint.classList.remove('setup-hidden');
      hint.classList.add('setup-box-info');
      hint.innerHTML =
        '<span class="equip-faltantes-ok">✓ Germinación registrada.</span> La sala (carpa, LED, extractor…) la completarás en <strong>Configurar sala</strong>, no aquí.';
      return;
    }
    if (!falt.length && !sinPropagador) {
      hint.classList.add('setup-box-info');
      hint.innerHTML = '<span class="equip-faltantes-ok">✓ Equipamiento indispensable registrado para monitorización.</span>';
      return;
    }
    if (!falt.length && sinPropagador) {
      hint.classList.remove('setup-hidden');
      hint.classList.add('setup-box-warn');
      hint.innerHTML =
        (origen === 'semilla'
          ? 'Con <strong>semilla</strong> conviene registrar un <strong>propagador / domo</strong> en el grupo Germinación (arriba). '
          : 'Con <strong>esqueje</strong> conviene registrar un <strong>propagador / domo</strong> en el grupo Enraizado. ') +
        'Puedes seguir sin marcarlo si ya lo tienes.';
      return;
    }
    const p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : null;
    const int = !p || p.entorno !== 'exterior';
    hint.classList.add('setup-box-warn');
    hint.innerHTML = 'Faltan datos de: <strong>' + falt.map(function (f) { return f.label; }).join(', ') + '</strong>. ' +
      (int
        ? 'Selecciona marca/modelo en el catálogo y revisa las medidas de sala más abajo.'
        : 'Selecciona marca/modelo en el catálogo (medidor y clima son prioritarios en exterior).');
  }

  function getCamposEquipamientoFaltantes(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const inst = ensureEquipInstalado(cfg);
    const esExt = resolveSetupEntorno() === 'exterior';
    const cats = resolveEquipCategorias();
    const falt = [];
    Object.keys(cats).forEach(function (key) {
      const cat = cats[key];
      if (!cat.indispensable) return;
      if (cat.entorno === 'interior' && esExt) return;
      if (cat.entorno === 'exterior' && !esExt) return;
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
      timer: 'Temporizador LED',
      toldo: 'Toldo / sombra',
      co2: 'CO₂',
      filtroCarbon: 'Filtro carbón',
      circulacion: 'Circulación',
      tijeras: 'Tijeras poda',
      lupa: 'Lupa tricomas',
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
    if (tipo === 'filtro_carbon' && inst.filtro_carbon) {
      return inst.filtro_carbon.marca + ' ' + inst.filtro_carbon.modelo +
        (inst.filtro_carbon.specs?.m3h ? ' (' + inst.filtro_carbon.specs.m3h + ' m³/h)' : '');
    }
    if (tipo === 'filtro_carbon') {
      const eq = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
      if (eq.indexOf('filtroCarbon') >= 0) return 'Filtro de carbón (marcado en equipamiento)';
    }
    if (tipo === 'circulacion' && inst.ventilador_circ) {
      return inst.ventilador_circ.marca + ' ' + inst.ventilador_circ.modelo;
    }
    if (tipo === 'circulacion') {
      const eq = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
      if (eq.indexOf('circulacion') >= 0) return 'Ventilador circulación (marcado en equipamiento)';
    }
    if (tipo === 'led' && inst.led) {
      return inst.led.marca + ' ' + inst.led.modelo +
        (inst.led.specs?.watts ? ' · ' + inst.led.specs.watts + ' W' : '');
    }
    if (tipo === 'co2' && inst.co2) {
      return inst.co2.marca + ' ' + inst.co2.modelo +
        (inst.co2.specs?.tipo ? ' · ' + inst.co2.specs.tipo : '');
    }
    if (tipo === 'co2') {
      const eq = Array.isArray(cfg.equipamiento) ? cfg.equipamiento : [];
      if (eq.indexOf('co2') >= 0) return 'Enriquecedor CO₂ (marcado en equipamiento)';
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
    const cats = resolveEquipCategorias();
    const falt = getCamposEquipamientoFaltantes(cfg);
    let html =
      '<div class="medir-equip-readonly-banner" role="note">' +
      '<span class="medir-equip-readonly-badge">Solo lectura</span>' +
      '<span>Catálogo elegido en el <strong>configurador</strong> (asistente). Aquí solo ves el resumen; el montaje paso a paso está en el <strong>checklist</strong> de arriba.</span>' +
      '</div>';
    const resumenBreve = getEquipamientoResumenHtml(cfg);
    if (!resumenBreve) {
      html +=
        '<p class="medir-equip-empty">Sin equipamiento registrado. Configúralo en el asistente → paso <strong>Espacio y equipamiento</strong>. Las medidas de carpa/LED de abajo son editables; marca y modelo no.</p>';
    }
    if (falt.length) {
      html +=
        '<p class="medir-equip-warn">Falta en configurador: ' +
        falt.map(function (f) {
          return f.label;
        }).join(', ') +
        '</p>';
    }
    const chips = [];
    Object.keys(cats).forEach(function (key) {
      const cat = cats[key];
      const cur = inst[key];
      if (cur && cur.marca) {
        chips.push(
          '<span class="medir-equip-chip medir-equip-chip--ok">' +
            cat.icon +
            ' ' +
            cat.label +
            ': <strong>' +
            cur.marca +
            ' ' +
            cur.modelo +
            '</strong></span>'
        );
      }
    });
    if (chips.length) {
      html += '<div class="medir-equip-chips">' + chips.join('') + '</div>';
    }
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
    html +=
      '<p class="medir-equip-foot">Para cambiar LED, extractor o medidor del catálogo, abre el configurador de la instalación. ' +
      '<button type="button" class="medir-equip-config-link" onclick="typeof abrirSetup===\'function\'&&abrirSetup()">Abrir configurador</button></p>';
    panel.innerHTML = html;
    if (typeof renderSalaLayoutPanel === 'function') renderSalaLayoutPanel();
    if (typeof renderIotPanel === 'function') renderIotPanel();
    if (typeof refreshSistemaEquipResumen === 'function') refreshSistemaEquipResumen(cfg);
    if (typeof refreshLuzOrigenUI === 'function') refreshLuzOrigenUI(cfg);
    if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner(cfg);
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
