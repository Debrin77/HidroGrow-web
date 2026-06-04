/**
 * Origen de la luz ↔ equipamiento de sala (catálogo / asistente).
 */
(function (global) {
  'use strict';

  var LUZ_EQUIP_CATS = [
    'led',
    'armario',
    'propagador',
    'mat_termica_germ',
    'extractor',
    'ventilador_circ',
    'humidificador',
  ];

  function el(id) {
    return document.getElementById(id);
  }

  function getCfg() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function resolveCats() {
    try {
      if (typeof global.getEquipCategorias === 'function') return global.getEquipCategorias();
      if (global.EQUIP_CATEGORIAS) return global.EQUIP_CATEGORIAS;
    } catch (_) {}
    return {};
  }

  function inferLuzTipoFromEquip(cfg) {
    cfg = cfg || getCfg();
    var inst = cfg.equipamientoInstalado || {};
    if (inst.led && inst.led.id) {
      var w = Number(inst.led.specs && inst.led.specs.watts);
      if (Number.isFinite(w) && w >= 80) return 'led';
      if (Number.isFinite(w) && w > 0 && w < 40) return 'fluorescente';
      return 'led';
    }
    var ledW = Number(cfg.growRoomLedW || (cfg.premiumSetup && cfg.premiumSetup.ledW));
    if (Number.isFinite(ledW) && ledW >= 80) return 'led';
    if (Number.isFinite(ledW) && ledW > 0 && ledW < 40) return 'fluorescente';
    if (typeof global.inferLuzFromPremium === 'function') {
      return global.inferLuzFromPremium(cfg.premiumSetup);
    }
    return null;
  }

  function tieneEquipLuzRelevante(cfg) {
    cfg = cfg || getCfg();
    var inst = cfg.equipamientoInstalado || {};
    var i;
    for (i = 0; i < LUZ_EQUIP_CATS.length; i++) {
      var k = LUZ_EQUIP_CATS[i];
      if (inst[k] && inst[k].id) return true;
    }
    var p = cfg.premiumSetup || {};
    if (Number.isFinite(Number(cfg.growRoomLedW)) && Number(cfg.growRoomLedW) > 0) return true;
    if (Number.isFinite(Number(p.ledW)) && Number(p.ledW) > 0) return true;
    if (Number.isFinite(Number(cfg.growRoomAnchoM)) && Number(cfg.growRoomAnchoM) > 0) return true;
    return false;
  }

  function fmtSpecsEntry(entry, catDef) {
    if (!entry || !entry.specs) return '';
    var s = entry.specs;
    var bits = [];
    if (catDef && catDef.id === 'led' && s.watts != null) bits.push(s.watts + ' W');
    if (s.coberturaM2 != null) bits.push(s.coberturaM2 + ' m²');
    if (s.m3h != null) bits.push(s.m3h + ' m³/h');
    if (s.anchoM != null && s.largoM != null) {
      bits.push(s.anchoM + '×' + s.largoM + ' m');
    }
    return bits.join(' · ');
  }

  function buildLuzEquipCards(cfg) {
    cfg = cfg || getCfg();
    var inst = cfg.equipamientoInstalado || {};
    var cats = resolveCats();
    var cards = [];
    LUZ_EQUIP_CATS.forEach(function (key) {
      var entry = inst[key];
      if (!entry || !entry.marca) return;
      var cat = cats[key] || { label: key, icon: '💡' };
      cards.push({
        fromCatalog: true,
        key: key,
        icon: cat.icon || '💡',
        label: cat.label || key,
        title: entry.marca + ' ' + entry.modelo,
        detail: fmtSpecsEntry(entry, cat) || entry.nota || '',
      });
    });
    if (!cards.length) {
      var p = cfg.premiumSetup || {};
      var ancho = Number(cfg.growRoomAnchoM || p.anchoM);
      var largo = Number(cfg.growRoomLargoM || p.largoM);
      var ledW = Number(cfg.growRoomLedW || p.ledW);
      var ext = Number(cfg.growRoomExtractorM3h || p.extractorM3h);
      if (Number.isFinite(ancho) && Number.isFinite(largo) && ancho > 0 && largo > 0) {
        cards.push({
          fromCatalog: false,
          key: 'sala',
          icon: '🏠',
          label: 'Sala (asistente)',
          title: Math.round(ancho * 100) / 100 + ' × ' + Math.round(largo * 100) / 100 + ' m',
          detail: 'Dimensiones del configurador',
        });
      }
      if (Number.isFinite(ledW) && ledW > 0) {
        cards.push({
          fromCatalog: false,
          key: 'ledW',
          icon: '💡',
          label: 'Iluminación (asistente)',
          title: ledW + ' W LED',
          detail: 'Potencia indicada en sala de cultivo',
        });
      }
      if (Number.isFinite(ext) && ext > 0) {
        cards.push({
          fromCatalog: false,
          key: 'ext',
          icon: '💨',
          label: 'Ventilación (asistente)',
          title: ext + ' m³/h',
          detail: 'Extractor en configurador',
        });
      }
    }
    return cards;
  }

  function luzTipoLabel(tipo) {
    var map = {
      natural: 'Natural',
      led: 'LED',
      mixto: 'Natural + LED',
      fluorescente: 'T5 / CFL',
      hps: 'HPS / HM',
      sin_luz: 'Sin luz',
    };
    return map[tipo] || tipo;
  }

  function syncLuzDesdeEquipamiento(cfg, opts) {
    opts = opts || {};
    cfg = cfg || getCfg();
    var inferred = inferLuzTipoFromEquip(cfg);
    if (!inferred) return false;
    if (!opts.force && cfg.luz && cfg._luzManual) return false;
    cfg.luz = inferred;
    var p = cfg.premiumSetup;
    if (p && Number.isFinite(Number(p.horasLuz)) && cfg.horasLuz == null) {
      cfg.horasLuz = Math.max(12, Math.min(20, Math.round(Number(p.horasLuz))));
    }
    if (p && p.intensidadLuz && !cfg.interiorIntensidadLuz) {
      cfg.interiorIntensidadLuz = p.intensidadLuz;
    }
    return true;
  }

  function renderLuzOrigenEquipBlock(cfg) {
    cfg = cfg || getCfg();
    var mount = el('luzOrigenEquipMount');
    var manualWrap = el('luzOrigenTipoManualWrap');
    var manualLabel = el('luzOrigenManualLabel');
    var wrap = el('wrapLuzOrigenMediciones');
    if (!mount) return;

    var interior = (cfg.ubicacion || 'exterior') === 'interior';
    if (!interior || (wrap && wrap.style.display === 'none')) {
      mount.innerHTML = '';
      mount.classList.add('setup-hidden');
      if (manualWrap) manualWrap.classList.remove('luz-origen-manual-wrap--collapsed');
      if (manualLabel) manualLabel.classList.add('setup-hidden');
      return;
    }
    mount.classList.remove('setup-hidden');

    var cards = buildLuzEquipCards(cfg);
    var hasEquip = cards.length > 0;
    var inferred = inferLuzTipoFromEquip(cfg);
    var horas =
      cfg.horasLuz != null
        ? cfg.horasLuz
        : cfg.premiumSetup && cfg.premiumSetup.horasLuz != null
          ? cfg.premiumSetup.horasLuz
          : 16;

    if (!hasEquip) {
      mount.innerHTML =
        '<p class="luz-origen-equip-empty">' +
        'Aún no hay equipamiento de sala registrado. Primero <strong>configura la sala y el equipamiento</strong> ' +
        '(asistente o <strong>Sala → Equipamiento</strong>); después el checklist de montaje y aquí verás la luz y el domo que elegiste.</p>';
      if (manualWrap) manualWrap.classList.remove('luz-origen-manual-wrap--collapsed');
      if (manualLabel) manualLabel.classList.add('setup-hidden');
      return;
    }

    var html =
      '<div class="luz-origen-equip-head">' +
      '<span class="luz-origen-equip-kicker">Tu sala configurada</span>' +
      '<p class="luz-origen-equip-lead">Equipamiento elegido al montar la sala (propagador dentro, LED, carpa…). ' +
      'El fotoperiodo de abajo se usa en <strong>Riego</strong> y avisos.</p></div>' +
      '<div class="luz-origen-equip-grid" role="list">';

    cards.forEach(function (c) {
      html +=
        '<div class="luz-origen-equip-card" role="listitem">' +
        '<span class="luz-origen-equip-card-icon" aria-hidden="true">' +
        c.icon +
        '</span>' +
        '<div class="luz-origen-equip-card-body">' +
        '<span class="luz-origen-equip-card-cat">' +
        c.label +
        '</span>' +
        '<strong class="luz-origen-equip-card-title">' +
        c.title +
        '</strong>' +
        (c.detail ? '<span class="luz-origen-equip-card-detail">' + c.detail + '</span>' : '') +
        '</div></div>';
    });

    if (inferred) {
      html +=
        '<p class="luz-origen-equip-infer">Tipo de luz para cálculos: <strong>' +
        luzTipoLabel(inferred) +
        '</strong>' +
        (Number.isFinite(Number(horas)) ? ' · ' + horas + ' h/día' : '') +
        '</p>';
    }

    html += '</div>';
    mount.innerHTML = html;

    var useCatalog = cards.some(function (c) {
      return c.fromCatalog;
    });
    if (manualWrap) {
      manualWrap.classList.toggle('luz-origen-manual-wrap--collapsed', useCatalog);
    }
    if (manualLabel) {
      manualLabel.classList.toggle('setup-hidden', !useCatalog);
      if (useCatalog) {
        manualLabel.innerHTML =
          '<button type="button" class="luz-origen-manual-toggle" onclick="toggleLuzOrigenManual()">' +
          'Cambiar tipo de luz manualmente</button>';
      }
    }
  }

  function toggleLuzOrigenManual() {
    var manualWrap = el('luzOrigenTipoManualWrap');
    if (!manualWrap) return;
    manualWrap.classList.toggle('luz-origen-manual-wrap--collapsed');
    var open = !manualWrap.classList.contains('luz-origen-manual-wrap--collapsed');
    var btn = manualWrap.querySelector('.luz-origen-manual-toggle');
    if (btn) {
      btn.textContent = open ? 'Ocultar selector manual' : 'Cambiar tipo de luz manualmente';
    }
  }

  function refreshLuzOrigenUI(cfg) {
    try {
      cfg = cfg || getCfg();
      syncLuzDesdeEquipamiento(cfg);
      renderLuzOrigenEquipBlock(cfg);
      if (typeof global.cargarInteriorGrowUI === 'function') global.cargarInteriorGrowUI();
    } catch (e) {
      try {
        console.warn('refreshLuzOrigenUI', e);
      } catch (_) {}
    }
  }

  function montajeRecomendadoAplica(cfg) {
    cfg = cfg || getCfg();
    var cam = typeof global.getCaminoCultivo === 'function' ? global.getCaminoCultivo(cfg) : '';
    if (cam !== 'semilla_propagador') return false;
    if (typeof global.hcRecargaCompletaAplicaEnCamino === 'function' && global.hcRecargaCompletaAplicaEnCamino(cfg)) {
      return false;
    }
    if (typeof global.hcMostrarSistemaPropagador === 'function' && global.hcMostrarSistemaPropagador(cfg)) {
      return true;
    }
    if (
      typeof global.hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      global.hcCaminoSemillaPropagadorSetupGerm()
    ) {
      return true;
    }
    return true;
  }

  function renderSalaMontajePrerequisito(cfg) {
    cfg = cfg || getCfg();
    var host = el('salaMontajePrereqOrden');
    if (!host) return;
    var show = montajeRecomendadoAplica(cfg);
    host.classList.toggle('setup-hidden', !show);
    if (!show) {
      host.innerHTML = '';
      return;
    }
    var falt =
      typeof global.getCamposEquipamientoFaltantes === 'function'
        ? global.getCamposEquipamientoFaltantes(cfg)
        : [];
    var warn = '';
    if (falt.length) {
      warn =
        '<p class="sala-montaje-prereq-warn">Falta registrar: <strong>' +
        falt
          .map(function (f) {
            return f.label;
          })
          .join(', ') +
        '</strong>. Sin eso el checklist será genérico y las guías no mostrarán tu marca/modelo.</p>';
    }
    host.innerHTML =
      '<p class="sala-montaje-prereq-title">Orden recomendado</p>' +
      '<ol class="sala-montaje-prereq-steps">' +
      '<li><strong>Configuración de sala</strong> — ubicación, agua, dimensiones (asistente <em>Configurar sala</em> o <strong>Sala → Agua y ubicación</strong>).</li>' +
      '<li><strong>Equipamiento</strong> — carpa, LED, extractor, propagador… (<strong>Sala → Equipamiento</strong> o paso del asistente).</li>' +
      '<li><strong>Checklist de montaje</strong> — comprobar en físico lo que ya elegiste (pasos y mini-guías con tu modelo).</li>' +
      '</ol>' +
      warn;
  }

  function applySalaMontajeRecomendadoUi(cfg) {
    try {
      cfg = cfg || getCfg();
      var det = el('sistemaMontajeChecksDetails');
      if (!det) return;
      var show = montajeRecomendadoAplica(cfg);
      det.classList.toggle('sala-montaje-details--recomendado', show);

      var badge = el('salaMontajeBadgeReco');
      if (badge) badge.classList.toggle('setup-hidden', !show);

      var lead = el('salaMontajeRecoLead');
      if (lead) {
        lead.classList.toggle('setup-hidden', !show);
        if (show) {
          lead.textContent =
            'Montar la sala antes de germinar en el propagador mejora luz, clima y ventilación. ' +
            'Al acabar la germinación, el traslado al hidro será más rápido si ya completaste los pasos 1 y 2 de abajo.';
        }
      }
      renderSalaMontajePrerequisito(cfg);

      if (show && !det.open && !det.dataset.hcMontajeUserClosed) {
        var pm = cfg.puestaMarchaChecks;
        if (!pm || !pm.completedAt) {
          setTimeout(function () {
            try {
              if (!det.dataset.hcMontajeUserClosed) det.open = true;
            } catch (_) {}
          }, 0);
        }
      }
    } catch (e) {
      try {
        console.warn('applySalaMontajeRecomendadoUi', e);
      } catch (_) {}
    }
  }

  global.inferLuzTipoFromEquip = inferLuzTipoFromEquip;
  global.syncLuzDesdeEquipamiento = syncLuzDesdeEquipamiento;
  global.renderLuzOrigenEquipBlock = renderLuzOrigenEquipBlock;
  global.refreshLuzOrigenUI = refreshLuzOrigenUI;
  global.applySalaMontajeRecomendadoUi = applySalaMontajeRecomendadoUi;
  global.toggleLuzOrigenManual = toggleLuzOrigenManual;
  global.tieneEquipLuzRelevante = tieneEquipLuzRelevante;

  /** Equipamiento de sala + checklist de montaje listos (camino propagador). */
  function salaEquipInicioCompleto(cfg) {
    cfg = cfg || getCfg();
    if (typeof global.salaPreGermConfigurada === 'function' && !global.salaPreGermConfigurada(cfg)) {
      return false;
    }
    if (typeof global.getCamposEquipamientoFaltantes === 'function') {
      var falt = global.getCamposEquipamientoFaltantes(cfg);
      if (falt && falt.length) return false;
    }
    if (typeof global.montajeSalaPreGermOk === 'function' && !global.montajeSalaPreGermOk(cfg)) {
      return false;
    }
    return true;
  }

  /** 'equip' = falta configurador · 'montaje' = falta checklist físico */
  function getSalaRecoPasoInicio(cfg) {
    cfg = cfg || getCfg();
    if (typeof global.salaPreGermConfigurada === 'function' && !global.salaPreGermConfigurada(cfg)) {
      return 'equip';
    }
    if (typeof global.getCamposEquipamientoFaltantes === 'function') {
      var falt = global.getCamposEquipamientoFaltantes(cfg);
      if (falt && falt.length) return 'equip';
    }
    if (typeof global.montajeSalaPreGermOk === 'function' && !global.montajeSalaPreGermOk(cfg)) {
      return 'montaje';
    }
    return 'done';
  }

  function hcMostrarRecoEquipSalaInicio(cfg) {
    cfg = cfg || getCfg();
    if (typeof global.getCaminoCultivo !== 'function') return false;
    if (global.getCaminoCultivo(cfg) !== 'semilla_propagador') return false;
    if (
      typeof global.hcTieneInstalacionesUsuario === 'function' &&
      !global.hcTieneInstalacionesUsuario()
    ) {
      return false;
    }
    if (typeof global.hcRecargaCompletaAplicaEnCamino === 'function' && global.hcRecargaCompletaAplicaEnCamino(cfg)) {
      return false;
    }
    if (typeof global.hcGerminacionActiva === 'function' && !global.hcGerminacionActiva(cfg)) {
      return false;
    }
    return !salaEquipInicioCompleto(cfg);
  }

  function renderDashSalaEquipRecoBanner(cfg) {
    var host = el('dashSalaEquipReco');
    if (!host) return;
    var show = hcMostrarRecoEquipSalaInicio(cfg);
    host.classList.toggle('setup-hidden', !show);
    if (!show) {
      host.innerHTML = '';
      return;
    }
    var paso = getSalaRecoPasoInicio(cfg);
    var falt =
      typeof global.getCamposEquipamientoFaltantes === 'function'
        ? global.getCamposEquipamientoFaltantes(cfg)
        : [];
    var faltaTxt =
      falt.length > 0
        ? ' Falta en catálogo: <strong>' +
          falt
            .map(function (f) {
              return f.label;
            })
            .join(', ') +
          '</strong>.'
        : '';
    var onclick =
      paso === 'montaje'
        ? "typeof hcOpenPuestaMarchaChecklist==='function'&&hcOpenPuestaMarchaChecklist()"
        : "typeof abrirConfiguradorEquipamientoSalaPropagador==='function'&&abrirConfiguradorEquipamientoSalaPropagador()";
    var title =
      paso === 'montaje'
        ? 'Completa el checklist de montaje de sala'
        : 'Configura el equipamiento de la sala de cultivo';
    var text =
      paso === 'montaje'
        ? 'El equipamiento ya está registrado. Abre el <strong>checklist de montaje</strong> y marca lo que ya tienes montado en físico (LED, extractor, domo/propagador, ventilación). La pestaña Sala aparece al terminar la germinación.'
        : 'Monta la sala con el <strong>propagador dentro</strong> (carpa, LED, extractor, domo…). Después completa el <strong>checklist de montaje</strong>. Mejora la germinación ahora.';
    var cta = paso === 'montaje' ? 'Abrir checklist de montaje ›' : 'Abrir configurador ›';
    var pasoHint =
      paso === 'montaje'
        ? '<span class="dash-sala-equip-reco-step">Paso 2 de 2 · montaje físico</span>'
        : '<span class="dash-sala-equip-reco-step">Paso 1 de 2 · equipamiento</span>';
    host.innerHTML =
      '<button type="button" class="dash-sala-equip-reco-btn" onclick="' +
      onclick +
      '">' +
      '<span class="dash-sala-equip-reco-badge">RECOMENDADO</span>' +
      pasoHint +
      '<span class="dash-sala-equip-reco-title">' +
      title +
      '</span>' +
      '<span class="dash-sala-equip-reco-text">' +
      text +
      faltaTxt +
      '</span>' +
      '<span class="dash-sala-equip-reco-cta">' +
      cta +
      '</span>' +
      '</button>';
  }

  function refreshDashSalaEquipRecoBanner(cfg) {
    try {
      renderDashSalaEquipRecoBanner(cfg);
    } catch (e) {
      try {
        console.warn('refreshDashSalaEquipRecoBanner', e);
      } catch (_) {}
    }
    try {
      if (
        typeof global.renderCalendario === 'function' &&
        document.getElementById('tab-calendario')?.classList.contains('active')
      ) {
        global.renderCalendario();
      }
    } catch (_) {}
  }

  global.salaEquipInicioCompleto = salaEquipInicioCompleto;
  global.getSalaRecoPasoInicio = getSalaRecoPasoInicio;
  global.hcMostrarRecoEquipSalaInicio = hcMostrarRecoEquipSalaInicio;
  global.refreshDashSalaEquipRecoBanner = refreshDashSalaEquipRecoBanner;
})(
  typeof window !== 'undefined' ? window : this
);
