/**
 * HidroGrow — selector top 10 semilleros con perfil editable (aceptar o modificar).
 */
(function () {
  function el(id) {
    return document.getElementById(id);
  }

  function ensureSemilleroState(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    if (!cfg.semillero || typeof cfg.semillero !== 'object') {
      cfg.semillero = { id: '', marca: '', perfil: {}, perfilCustom: {}, aceptadoTalCual: false };
    }
    return cfg.semillero;
  }

  function getPerfilActivo(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    const s = ensureSemilleroState(cfg);
    const cat = s.id && typeof getSemilleroById === 'function' ? getSemilleroById(s.id) : null;
    return typeof mergeSemilleroPerfil === 'function'
      ? mergeSemilleroPerfil(cat, s.perfilCustom)
      : (s.perfil || {});
  }

  function renderSemillerosGrid() {
    const grid = el('setupPremiumSemillerosGrid');
    if (!grid) return;
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const cur = ensureSemilleroState(cfg).id || '';
    const list = typeof getSemillerosTop10ES === 'function' ? getSemillerosTop10ES() : [];
    grid.innerHTML = list.map(function (s) {
      const sel = s.id === cur ? ' hc-semillero-card--selected' : '';
      return (
        '<button type="button" class="hc-semillero-card' + sel + '" onclick="seleccionarSemilleroPremium(\'' + s.id + '\')" ' +
        'style="--sem-color:' + (s.color || '#059669') + '">' +
        '<span class="hc-semillero-rank">#' + (s.rank_es || '') + '</span>' +
        '<span class="hc-semillero-flag">' + (s.bandera || '') + '</span>' +
        '<span class="hc-semillero-name">' + s.nombre + '</span>' +
        '<span class="hc-semillero-pais">' + (s.pais || '') + '</span>' +
        '</button>'
      );
    }).join('');
  }

  function renderSemilleroPerfilPanel() {
    const panel = el('setupPremiumSemilleroPerfil');
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const s = ensureSemilleroState(cfg);
    if (!panel) return;
    if (!s.id) {
      panel.classList.add('setup-hidden');
      panel.innerHTML = '';
      return;
    }
    const cat = typeof getSemilleroById === 'function' ? getSemilleroById(s.id) : null;
    if (!cat) {
      panel.classList.add('setup-hidden');
      return;
    }
    panel.classList.remove('setup-hidden');
    const p = getPerfilActivo(cfg);
    const fld = function (label, id, val, step, min, max) {
      return (
        '<label class="hc-sem-perfil-field"><span>' + label + '</span>' +
        '<input type="number" id="' + id + '" class="setup-input-city" value="' + (val != null ? val : '') + '" ' +
        'step="' + step + '" min="' + min + '" max="' + max + '" onchange="persistSemilleroPerfilCustom()"></label>'
      );
    };
    panel.innerHTML =
      '<div class="hc-sem-perfil-head">' +
      (typeof hcVisualIconSvg === 'function' ? hcVisualIconSvg('semillero') : '🏪') +
      ' <strong>' + cat.nombre + '</strong> · perfil orientativo</div>' +
      '<p class="hc-sem-perfil-lead">' + (cat.nota || '') + '</p>' +
      '<div class="hc-sem-perfil-grid">' +
      fld('Germ. temp. min °C', 'semPerfilGermTempMin', p.germTempMin, 1, 15, 30) +
      fld('Germ. temp. max °C', 'semPerfilGermTempMax', p.germTempMax, 1, 15, 32) +
      fld('Germ. días min', 'semPerfilGermDiasMin', p.germDiasMin, 1, 1, 14) +
      fld('Germ. días max', 'semPerfilGermDiasMax', p.germDiasMax, 1, 1, 21) +
      fld('EC veg min µS', 'semPerfilEcVegMin', p.ecVegMin, 50, 200, 2500) +
      fld('EC veg max µS', 'semPerfilEcVegMax', p.ecVegMax, 50, 200, 3000) +
      fld('EC flor min µS', 'semPerfilEcFlorMin', p.ecFlorMin, 50, 200, 3000) +
      fld('EC flor max µS', 'semPerfilEcFlorMax', p.ecFlorMax, 50, 200, 3500) +
      fld('pH min', 'semPerfilPhMin', p.phMin, 0.1, 5, 7) +
      fld('pH max', 'semPerfilPhMax', p.phMax, 0.1, 5, 7.5) +
      '</div>' +
      '<label class="hc-sem-perfil-text"><span>Nota hidro (semillero)</span>' +
      '<textarea id="semPerfilHidroNota" class="setup-input-city" rows="2" maxlength="300" onchange="persistSemilleroPerfilCustom()">' +
      (p.hidroNota || '') + '</textarea></label>' +
      (p.soportePack ? '<p class="hc-sem-perfil-pack">📦 ' + p.soportePack + '</p>' : '') +
      '<div class="hc-sem-perfil-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="aceptarSemilleroTalCual()">✓ Usar tal cual</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="persistSemilleroPerfilCustom(true)">Guardar mis ajustes</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" onclick="restaurarSemilleroCatalogo()">Restaurar del catálogo</button>' +
      '</div>' +
      (s.aceptadoTalCual
        ? '<p class="hc-sem-perfil-ok">✓ Perfil aceptado' + (Object.keys(s.perfilCustom || {}).length ? ' (con ajustes manuales)' : '') + '</p>'
        : '<p class="hc-sem-perfil-hint">Pulsa «Usar tal cual» o edita y «Guardar mis ajustes».</p>');
  }

  function seleccionarSemilleroPremium(id) {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const s = ensureSemilleroState(cfg);
    const cat = typeof getSemilleroById === 'function' ? getSemilleroById(id) : null;
    if (!cat) return;
    s.id = cat.id;
    s.marca = cat.nombre;
    s.perfilCustom = {};
    s.aceptadoTalCual = false;
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderSemillerosGrid();
    renderSemilleroPerfilPanel();
  }

  function leerPerfilCustomDesdeUI() {
    const num = function (id) {
      const v = parseFloat(String(el(id)?.value || '').replace(',', '.'));
      return Number.isFinite(v) ? v : null;
    };
    return {
      germTempMin: num('semPerfilGermTempMin'),
      germTempMax: num('semPerfilGermTempMax'),
      germDiasMin: num('semPerfilGermDiasMin'),
      germDiasMax: num('semPerfilGermDiasMax'),
      ecVegMin: num('semPerfilEcVegMin'),
      ecVegMax: num('semPerfilEcVegMax'),
      ecFlorMin: num('semPerfilEcFlorMin'),
      ecFlorMax: num('semPerfilEcFlorMax'),
      phMin: num('semPerfilPhMin'),
      phMax: num('semPerfilPhMax'),
      hidroNota: String(el('semPerfilHidroNota')?.value || '').slice(0, 300),
    };
  }

  function persistSemilleroPerfilCustom(showToast) {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const s = ensureSemilleroState(cfg);
    s.perfilCustom = leerPerfilCustomDesdeUI();
    s.perfil = getPerfilActivo(cfg);
    s.aceptadoTalCual = false;
    if (typeof saveState === 'function') saveState();
    if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
    renderSemilleroPerfilPanel();
    if (typeof actualizarBadgesNutriente === 'function') actualizarBadgesNutriente();
    if (showToast && typeof showToast === 'function') showToast('Perfil de semillero guardado con tus ajustes');
  }

  function aceptarSemilleroTalCual() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const s = ensureSemilleroState(cfg);
    s.perfilCustom = {};
    s.perfil = getPerfilActivo(cfg);
    s.aceptadoTalCual = true;
    if (typeof saveState === 'function') saveState();
    renderSemilleroPerfilPanel();
    if (typeof actualizarBadgesNutriente === 'function') actualizarBadgesNutriente();
    if (typeof showToast === 'function') showToast('✓ Perfil de ' + (s.marca || 'semillero') + ' aceptado');
  }

  function restaurarSemilleroCatalogo() {
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : null;
    if (!cfg) return;
    const s = ensureSemilleroState(cfg);
    s.perfilCustom = {};
    s.aceptadoTalCual = false;
    if (typeof saveState === 'function') saveState();
    renderSemilleroPerfilPanel();
    if (typeof showToast === 'function') showToast('Valores restaurados del catálogo');
  }

  function persistSemilleroToConfig(cfg) {
    if (!cfg) return;
    const s = ensureSemilleroState(cfg);
    s.perfil = getPerfilActivo(cfg);
    cfg.semillero = JSON.parse(JSON.stringify(s));
  }

  function getRecomendacionEcPhSemillero(cfg) {
    cfg = cfg || ((typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {});
    if (typeof torreTieneAlgunaVariedadAsignada === 'function' && torreTieneAlgunaVariedadAsignada()) {
      return null;
    }
    const s = ensureSemilleroState(cfg);
    if (!s.id) return null;
    const p = getPerfilActivo(cfg);
    if (!p || p.ecVegMin == null || p.phMin == null) return null;
    const faseRaw = String(
      cfg.faseCultivoAmbiental || cfg.growRoomFase || (cfg.premiumSetup && cfg.premiumSetup.faseSala) || 'vegetativo'
    ).toLowerCase();
    const esFlor = /flor|fruct|bloom|12\/12|12-12/.test(faseRaw);
    return {
      activo: true,
      marca: s.marca || s.id,
      aceptadoTalCual: !!s.aceptadoTalCual,
      fase: esFlor ? 'floracion' : 'vegetativo',
      ec: esFlor
        ? { min: p.ecFlorMin, max: p.ecFlorMax }
        : { min: p.ecVegMin, max: p.ecVegMax },
      ph: { min: p.phMin, max: p.phMax },
      nota: p.hidroNota || '',
      germTemp: { min: p.germTempMin, max: p.germTempMax },
      germDias: { min: p.germDiasMin, max: p.germDiasMax },
    };
  }

  function renderMedirSemilleroPanel() {
    const card = el('medirSemilleroCard');
    const panel = el('medirSemilleroPanel');
    if (!card || !panel) return;
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const s = ensureSemilleroState(cfg);
    if (!s.id) {
      card.classList.add('setup-hidden');
      return;
    }
    card.classList.remove('setup-hidden');
    const p = getPerfilActivo(cfg);
    const sinPlantas = typeof torreTieneAlgunaVariedadAsignada === 'function' && !torreTieneAlgunaVariedadAsignada();
    const recSem = getRecomendacionEcPhSemillero(cfg);
    panel.innerHTML =
      '<p class="medir-sem-lead"><strong>' + (s.marca || s.id) + '</strong>' +
      (s.aceptadoTalCual ? ' · perfil confirmado' : ' · revisa y confirma en asistente') + '</p>' +
      (sinPlantas && recSem
        ? '<p class="medir-sem-ec-link">Sin plantas en la instalación: EC/pH objetivo del depósito toma este perfil (' +
          recSem.fase + ').</p>'
        : '') +
      '<ul class="medir-sem-list">' +
      '<li>🌡️ Germinación: <strong>' + p.germTempMin + '–' + p.germTempMax + ' °C</strong> · ' + p.germDiasMin + '–' + p.germDiasMax + ' d</li>' +
      '<li>⚡ EC veg: <strong>' + p.ecVegMin + '–' + p.ecVegMax + ' µS</strong> · flor: <strong>' + p.ecFlorMin + '–' + p.ecFlorMax + ' µS</strong></li>' +
      '<li>🧪 pH: <strong>' + p.phMin + '–' + p.phMax + '</strong></li>' +
      (p.hidroNota ? '<li>💧 ' + p.hidroNota + '</li>' : '') +
      '</ul>';
  }

  window.seleccionarSemilleroPremium = seleccionarSemilleroPremium;
  window.persistSemilleroPerfilCustom = persistSemilleroPerfilCustom;
  window.aceptarSemilleroTalCual = aceptarSemilleroTalCual;
  window.restaurarSemilleroCatalogo = restaurarSemilleroCatalogo;
  window.renderSemillerosGrid = renderSemillerosGrid;
  window.renderSemilleroPerfilPanel = renderSemilleroPerfilPanel;
  window.renderMedirSemilleroPanel = renderMedirSemilleroPanel;
  window.persistSemilleroToConfig = persistSemilleroToConfig;
  window.getPerfilSemilleroActivo = getPerfilActivo;
  window.getRecomendacionEcPhSemillero = getRecomendacionEcPhSemillero;
})();
