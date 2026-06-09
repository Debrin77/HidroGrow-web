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

    var operativaHidro =
      (typeof global.hcSemillaHidroPostAsistenteUi === 'function' &&
        global.hcSemillaHidroPostAsistenteUi(cfg)) ||
      (typeof global.hcSemillaHidroUiOperativaLista === 'function' &&
        global.hcSemillaHidroUiOperativaLista(cfg));

    if (!hasEquip) {
      mount.innerHTML =
        '<p class="luz-origen-equip-empty">' +
        'Aún no hay equipamiento de sala registrado. Primero <strong>configura la sala y el equipamiento</strong> ' +
        '(asistente o <strong>Sala → Equipamiento</strong>); después el checklist de montaje y aquí verás la luz y el domo que elegiste.</p>';
      if (manualWrap) manualWrap.classList.remove('luz-origen-manual-wrap--collapsed');
      if (manualLabel) manualLabel.classList.add('setup-hidden');
      return;
    }

    if (operativaHidro) {
      var ledCard = cards.find(function (c) {
        return /led|luz|hps|fluorescente/i.test(String(c.label || '') + String(c.title || ''));
      }) || cards[0];
      mount.innerHTML =
        '<p class="luz-origen-equip-solo-led"><strong>' +
        (ledCard ? ledCard.title : 'Iluminación') +
        '</strong></p>';
      if (manualWrap) manualWrap.classList.add('luz-origen-manual-wrap--collapsed');
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
      if (typeof global.cargarInteriorGrowUI === 'function') {
        global.cargarInteriorGrowUI({ skipGrowRoom: true });
      }
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
    host.innerHTML = '';
    host.classList.add('setup-hidden');
  }

  /** Sala propagador: solo aviso + checklist hasta verificar montaje; luego resumen equip. */
  function hcSalaPropagadorVistaMinima(cfg) {
    return montajeRecomendadoAplica(cfg);
  }

  function hcSalaPropagadorVistaMinimaSoloMontaje(cfg) {
    if (!hcSalaPropagadorVistaMinima(cfg)) return false;
    return getSalaRecoPasoInicio(cfg) === 'montaje';
  }

  function applySalaPropagadorVistaMinimaChrome(cfg) {
    cfg = cfg || getCfg();
    var activa = hcSalaPropagadorVistaMinima(cfg);
    var paso = getSalaRecoPasoInicio(cfg);
    var mount = el('salaCultivoEquipMount');
    var equipDet = el('sistemaEquipDetails');
    var montajeDet = el('sistemaMontajeChecksDetails');
    var puente = el('salaPropagadorPuenteMontaje');
    var tabShell = document.querySelector('#tab-sala .sala-sub-shell');
    var subTabs = el('salaSubTabs');
    var hint = el('tabContextHintSala');
    var intro = document.querySelector('#tab-sala .medir-sala-intro');
    var eqBadge = el('salaEquipPasoBadge');
    var moBadge = el('salaMontajePasoBadge');
    var recoBadge = el('salaMontajeBadgeReco');
    var lead = el('salaMontajeRecoLead');
    var prereq = el('salaMontajePrereqOrden');

    if (mount) mount.classList.toggle('sala-cultivo-equip-mount--vista-min', activa);
    var tabSala = el('tab-sala');
    if (tabSala) tabSala.classList.toggle('sala-tab--propagador-focus', activa);

    if (!activa) {
      if (equipDet) equipDet.classList.remove('setup-hidden');
      if (montajeDet) montajeDet.classList.remove('setup-hidden');
      if (puente) puente.classList.remove('setup-hidden');
      if (tabShell) tabShell.classList.remove('setup-hidden');
      if (subTabs) subTabs.classList.remove('setup-hidden');
      if (hint) hint.classList.remove('setup-hidden');
      if (intro) intro.classList.remove('setup-hidden');
      return;
    }

    if (puente) {
      puente.classList.add('setup-hidden');
      puente.innerHTML = '';
    }
    if (hint) hint.classList.add('setup-hidden');
    if (intro) intro.classList.add('setup-hidden');
    if (typeof global.ensureSalaCultivoEquipMountEnTabRoot === 'function') {
      global.ensureSalaCultivoEquipMountEnTabRoot();
    }
    if (tabShell) tabShell.classList.remove('setup-hidden');
    if (subTabs) subTabs.classList.add('setup-hidden');
    var panelAgua = el('salaPanelAgua');
    if (panelAgua) {
      panelAgua.classList.remove('setup-hidden');
      panelAgua.setAttribute('aria-hidden', 'false');
    }
    if (mount) mount.classList.remove('setup-hidden');
    if (eqBadge) eqBadge.classList.add('setup-hidden');
    if (moBadge) moBadge.classList.add('setup-hidden');
    if (recoBadge) recoBadge.classList.add('setup-hidden');
    if (lead) lead.classList.add('setup-hidden');
    if (prereq) prereq.classList.add('setup-hidden');

    var pasoListo = paso === 'done';
    var pasoEquip = paso === 'equip';
    var pasoMontaje = paso === 'montaje';

    if (equipDet) {
      equipDet.classList.remove('setup-hidden');
      equipDet.classList.toggle('sala-equip-details--paso-activo', pasoEquip);
      if (pasoListo || pasoMontaje || pasoEquip) {
        equipDet.open = true;
      }
      if (pasoListo) {
        equipDet.classList.remove('sala-equip-details--paso-activo');
      }
    }

    if (montajeDet) {
      montajeDet.classList.toggle('setup-hidden', pasoEquip || pasoListo);
      montajeDet.classList.toggle('sala-montaje-details--paso-activo', pasoMontaje);
      montajeDet.classList.remove('sala-montaje-details--bloqueado');
      if (pasoMontaje && !montajeDet.dataset.hcMontajeUserOpened) {
        montajeDet.open = false;
      } else if (pasoListo) {
        montajeDet.open = false;
      }
      var moTitle = el('salaMontajeSummaryTitleText');
      if (moTitle) {
        moTitle.textContent = pasoListo
          ? 'Montaje verificado (puedes revisar)'
          : pasoMontaje
            ? 'Checklist de montaje físico'
            : 'Checklist de montaje';
      }
    }
  }

  function renderSalaPropagadorFlujoGuiado(cfg) {
    cfg = cfg || getCfg();
    var host = el('salaPropagadorFlujoGuiado');
    var mount = el('salaCultivoEquipMount');
    var puente = el('salaPropagadorPuenteMontaje');
    var equipDet = el('sistemaEquipDetails');
    var montajeDet = el('sistemaMontajeChecksDetails');
    var show = montajeRecomendadoAplica(cfg);
    if (mount) mount.classList.toggle('sala-cultivo-equip-mount--propagador', show);
    if (host) host.classList.toggle('setup-hidden', !show);
    if (!show) {
      applySalaPropagadorVistaMinimaChrome(cfg);
      if (host) host.innerHTML = '';
      if (puente) {
        puente.innerHTML = '';
        puente.classList.add('setup-hidden');
      }
      if (equipDet) equipDet.classList.remove('sala-equip-details--paso-activo');
      if (montajeDet) montajeDet.classList.remove('sala-montaje-details--bloqueado', 'sala-montaje-details--paso-activo');
      return;
    }
    var paso = getSalaRecoPasoInicio(cfg);
    var falt =
      typeof global.getCamposEquipamientoFaltantes === 'function'
        ? global.getCamposEquipamientoFaltantes(cfg)
        : [];
    var salaCfg =
      typeof global.salaPreGermConfigurada === 'function' && global.salaPreGermConfigurada(cfg);
    var vistaMin = hcSalaPropagadorVistaMinima(cfg);

    applySalaPropagadorVistaMinimaChrome(cfg);

    var eqTitle = el('salaEquipSummaryTitleText');
    if (eqTitle) {
      eqTitle.textContent =
        paso === 'done'
          ? 'Equipamiento de sala (indispensable y opcional)'
          : paso === 'equip'
            ? 'Paso 1 · Equipamiento indispensable de la sala'
            : paso === 'montaje'
              ? 'Equipamiento de sala · revisa opcional'
              : 'Equipamiento de la sala (resumen)';
    }

    if (host) {
      if (paso === 'done') {
        host.innerHTML = '';
        host.classList.add('setup-hidden');
      } else if (vistaMin && paso === 'montaje') {
        host.classList.remove('setup-hidden');
        var faltaTxt =
          falt.length > 0
            ? ' Falta indispensable: <strong>' +
              falt
                .map(function (f) {
                  return f.label;
                })
                .join(', ') +
              '</strong>.'
            : '';
        var opcPend = getEquipamientoSalaOpcionalPendiente(cfg);
        var catsOpc =
          typeof global.EQUIP_CATEGORIAS !== 'undefined' && global.EQUIP_CATEGORIAS
            ? global.EQUIP_CATEGORIAS
            : typeof EQUIP_CATEGORIAS !== 'undefined'
              ? EQUIP_CATEGORIAS
              : {};
        var opcTxt =
          opcPend.length > 0
            ? ' Opcional sin registrar: <strong>' +
              opcPend
                .map(function (k) {
                  return catsOpc[k] ? catsOpc[k].label : k;
                })
                .join(', ') +
              '</strong>.'
            : '';
        host.innerHTML =
          '<div class="sala-propagador-flujo-inner sala-propagador-flujo-inner--min">' +
          '<p class="sala-propagador-status-banner sala-propagador-status-banner--ok" role="status">' +
          '✓ <strong>Equipamiento indispensable de sala registrado.</strong>' +
          faltaTxt +
          opcTxt +
          '</p>' +
          '<p class="sala-propagador-flujo-hint">Revisa el <strong>catálogo de equipamiento</strong> (indispensable y opcional) y confirma en el <strong>checklist</strong> que todo está montado y operativo. El circuito <strong>DWC/RDWC</strong> solo tras la germinación.</p>' +
          '<div class="sala-propagador-flujo-actions">' +
          '<button type="button" class="btn btn-primary btn-sm" onclick="typeof hcOpenPuestaMarchaChecklist===\'function\'&&hcOpenPuestaMarchaChecklist()">Abrir checklist de montaje</button> ' +
          '<button type="button" class="btn btn-secondary btn-sm" onclick="typeof abrirConfiguradorEquipamientoSalaPropagador===\'function\'&&abrirConfiguradorEquipamientoSalaPropagador()">Equipamiento opcional</button> ' +
          '<button type="button" class="btn btn-secondary btn-sm" onclick="var d=document.getElementById(\'sistemaMontajeChecksDetails\');if(d){d.open=true;d.scrollIntoView({behavior:\'smooth\',block:\'start\'})}">Ver checklist aquí</button>' +
          '</div></div>';
      } else if (paso === 'equip') {
        host.classList.remove('setup-hidden');
        var propOk =
          typeof global.propagadorMontajeCompleto === 'function' &&
          global.propagadorMontajeCompleto(cfg);
        var faltaEquip =
          falt.length > 0
            ? ' Falta: <strong>' +
              falt
                .map(function (f) {
                  return f.label;
                })
                .join(', ') +
              '</strong>.'
            : '';
        host.innerHTML =
          '<div class="sala-propagador-flujo-inner sala-propagador-flujo-inner--min">' +
          (propOk
            ? '<p class="sala-propagador-status-banner sala-propagador-status-banner--ok" role="status">' +
              '✓ <strong>Propagador verificado.</strong> Siguiente paso: equipamiento de la sala.' +
              '</p>'
            : '') +
          '<p class="sala-propagador-status-banner sala-propagador-status-banner--pending" role="note">' +
          'Configura carpa, LED, extractor y medidas en el <strong>configurador de sala</strong>.' +
          faltaEquip +
          '</p>' +
          '<div class="sala-propagador-flujo-actions">' +
          '<button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirConfiguradorEquipamientoSalaPropagador===\'function\'&&abrirConfiguradorEquipamientoSalaPropagador()">Abrir configurador de sala</button>' +
          '</div></div>';
      } else {
        host.innerHTML = '';
        host.classList.add('setup-hidden');
      }
    }

  }

  function bindSalaMontajeBloqueadoSummary() {
    var det = el('sistemaMontajeChecksDetails');
    if (!det || det.dataset.hcMontajeBloqueadoBound) return;
    var sum = det.querySelector('summary');
    if (!sum) return;
    det.dataset.hcMontajeBloqueadoBound = '1';
    sum.addEventListener('click', function (e) {
      if (!det.classList.contains('sala-montaje-details--bloqueado')) return;
      if (getSalaRecoPasoInicio(getCfg()) !== 'equip') return;
      e.preventDefault();
      try {
        if (typeof global.showToast === 'function') {
          global.showToast(
            'Primero configura el equipamiento de la sala (paso 1). Luego podrás abrir el checklist de montaje.',
            false,
            { durationMs: 5200 }
          );
        }
      } catch (_) {}
      var flujo = el('salaPropagadorFlujoGuiado');
      if (flujo) {
        try {
          flujo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (_) {}
      }
    });
  }

  function applySalaSemillaHidroOperativaChrome(cfg) {
    cfg = cfg || getCfg();
    var simplificar =
      (typeof global.hcSemillaHidroPostAsistenteUi === 'function' &&
        global.hcSemillaHidroPostAsistenteUi(cfg)) ||
      (typeof global.hcSemillaHidroUiOperativaLista === 'function' &&
        global.hcSemillaHidroUiOperativaLista(cfg));
    if (!simplificar) {
      return false;
    }
    var equipDet = el('sistemaEquipDetails');
    var montajeDet = el('sistemaMontajeChecksDetails');
    var flujo = el('salaPropagadorFlujoGuiado');
    var puente = el('salaPropagadorPuenteMontaje');
    if (equipDet) {
      equipDet.classList.remove('setup-hidden');
      equipDet.open = true;
      equipDet.classList.remove('sala-equip-details--paso-activo');
      var eqTitle = el('salaEquipSummaryTitleText');
      if (eqTitle) eqTitle.textContent = 'Equipamiento configurado';
      var eqBadge = el('salaEquipPasoBadge');
      if (eqBadge) eqBadge.classList.add('setup-hidden');
    }
    if (montajeDet) {
      montajeDet.classList.add('setup-hidden');
      montajeDet.open = false;
    }
    if (flujo) {
      flujo.classList.add('setup-hidden');
      flujo.innerHTML = '';
    }
    if (puente) {
      puente.classList.add('setup-hidden');
      puente.innerHTML = '';
    }
    var subTabs = el('salaSubTabs');
    if (subTabs) subTabs.classList.remove('setup-hidden');
    return true;
  }

  function applySalaMontajeRecomendadoUi(cfg) {
    try {
      cfg = cfg || getCfg();
      if (applySalaSemillaHidroOperativaChrome(cfg)) {
        if (typeof global.refreshSistemaEquipResumen === 'function') {
          global.refreshSistemaEquipResumen();
        }
        if (typeof global.renderSalaLayoutPanel === 'function') {
          global.renderSalaLayoutPanel();
        }
        return;
      }
      var det = el('sistemaMontajeChecksDetails');
      if (!det) return;
      bindSalaMontajeBloqueadoSummary();
      var show = montajeRecomendadoAplica(cfg);
      det.classList.toggle('sala-montaje-details--recomendado', show);

      var badge = el('salaMontajeBadgeReco');
      if (badge) badge.classList.toggle('setup-hidden', !show);

      var lead = el('salaMontajeRecoLead');
      if (lead) {
        var vistaMinLead = hcSalaPropagadorVistaMinima(cfg);
        lead.classList.toggle('setup-hidden', !show || vistaMinLead);
        if (show && !vistaMinLead) {
          var paso = getSalaRecoPasoInicio(cfg);
          lead.textContent =
            paso === 'equip'
              ? 'Primero configura el equipamiento de la sala (paso 1). El checklist de abajo se activa cuando el catálogo esté guardado.'
              : 'Marca cada punto del montaje físico. Si ya elegiste carpa, LED y extractor en el configurador, las mini-guías usarán tu marca y modelo.';
        }
      }
      applySalaPropagadorVistaMinimaChrome(cfg);
      renderSalaPropagadorFlujoGuiado(cfg);
      renderSalaMontajePrerequisito(cfg);

      var paso = getSalaRecoPasoInicio(cfg);
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
  global.applySalaSemillaHidroOperativaChrome = applySalaSemillaHidroOperativaChrome;
  global.renderSalaPropagadorFlujoGuiado = renderSalaPropagadorFlujoGuiado;
  global.hcSalaPropagadorVistaMinima = hcSalaPropagadorVistaMinima;
  global.hcSalaPropagadorVistaMinimaSoloMontaje = hcSalaPropagadorVistaMinimaSoloMontaje;
  global.applySalaPropagadorVistaMinimaChrome = applySalaPropagadorVistaMinimaChrome;
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

  var EQUIP_SALA_OPCIONAL_KEYS = [
    'filtro_carbon',
    'ventilador_circ',
    'temporizador',
    'humidificador',
    'deshumidificador',
    'co2',
  ];

  function getEquipamientoSalaOpcionalPendiente(cfg) {
    cfg = cfg || getCfg();
    var inst =
      cfg.equipamientoInstalado && typeof cfg.equipamientoInstalado === 'object'
        ? cfg.equipamientoInstalado
        : {};
    var cats =
      typeof global.EQUIP_CATEGORIAS !== 'undefined' && global.EQUIP_CATEGORIAS
        ? global.EQUIP_CATEGORIAS
        : typeof EQUIP_CATEGORIAS !== 'undefined'
          ? EQUIP_CATEGORIAS
          : {};
    return EQUIP_SALA_OPCIONAL_KEYS.filter(function (key) {
      var cur = inst[key];
      if (cur && (cur.id || cur.marca)) return false;
      return !!cats[key];
    });
  }

  /**
   * Inicio · propagador: ocultar hub de fases / montaje 3 tarjetas / resumen de ruta.
   * El aviso de sala (checklist) queda como guía principal.
   */
  function hcPropagadorInicioOcultarCuadroGermFases(cfg) {
    cfg = cfg || getCfg();
    if (typeof global.getCaminoCultivo !== 'function') return false;
    if (global.getCaminoCultivo(cfg) !== 'semilla_propagador') return false;
    if (typeof global.hcGerminacionActiva === 'function' && !global.hcGerminacionActiva(cfg)) {
      return false;
    }
    if (
      typeof global.propagadorMontajeCompleto === 'function' &&
      !global.propagadorMontajeCompleto(cfg)
    ) {
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

  /** Falta abrir el configurador de equipamiento de sala (no incluye checklist de montaje). */
  function hcFaltaConfigurarSalaEquipPropagador(cfg) {
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
    if (
      typeof global.propagadorMontajeCompleto === 'function' &&
      !global.propagadorMontajeCompleto(cfg)
    ) {
      return false;
    }
    if (typeof global.salaPreGermConfigurada === 'function' && global.salaPreGermConfigurada(cfg)) {
      if (typeof global.getCamposEquipamientoFaltantes === 'function') {
        var faltOk = global.getCamposEquipamientoFaltantes(cfg);
        if (!faltOk || !faltOk.length) return false;
      } else {
        return false;
      }
    }
    if (typeof global.salaConfiguradaCamino === 'function' && global.salaConfiguradaCamino(cfg)) {
      if (typeof global.getCamposEquipamientoFaltantes === 'function') {
        var faltCfg = global.getCamposEquipamientoFaltantes(cfg);
        if (!faltCfg || !faltCfg.length) return false;
      } else {
        return false;
      }
    }
    if (typeof global.salaPreGermConfigurada === 'function' && !global.salaPreGermConfigurada(cfg)) {
      return true;
    }
    if (typeof global.getCamposEquipamientoFaltantes === 'function') {
      var falt = global.getCamposEquipamientoFaltantes(cfg);
      if (falt && falt.length) return true;
    }
    return false;
  }

  /**
   * Inicio · propagador: mostrar aviso mientras falte equipamiento de sala o checklist de montaje.
   * (Tras guardar el configurador el paso pasa a «montaje» — antes el banner desaparecía por error.)
   */
  function hcPropagadorPendienteSalaEnInicio(cfg) {
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
    if (
      typeof global.propagadorMontajeCompleto === 'function' &&
      !global.propagadorMontajeCompleto(cfg)
    ) {
      return false;
    }
    var paso = getSalaRecoPasoInicio(cfg);
    if (paso === 'equip' || paso === 'montaje') return true;
    if (paso === 'done' && getEquipamientoSalaOpcionalPendiente(cfg).length > 0) return true;
    return false;
  }

  /** Reco suave en hub de germinación (no bloquea fases; solo orienta). */
  function hcPropagadorSalaRecoEnGermHub(cfg) {
    cfg = cfg || getCfg();
    if (typeof global.getCaminoCultivo !== 'function') return null;
    if (global.getCaminoCultivo(cfg) !== 'semilla_propagador') return null;
    if (
      typeof global.hcRecargaCompletaAplicaEnCamino === 'function' &&
      global.hcRecargaCompletaAplicaEnCamino(cfg)
    ) {
      return null;
    }
    if (
      typeof global.propagadorMontajeCompleto === 'function' &&
      !global.propagadorMontajeCompleto(cfg)
    ) {
      return null;
    }
    if (typeof global.montajeSalaPreGermOk === 'function' && global.montajeSalaPreGermOk(cfg)) {
      return null;
    }
    var paso = getSalaRecoPasoInicio(cfg);
    if (paso === 'equip') return 'sala_config_soft';
    if (paso === 'montaje') return 'sala_montaje_soft';
    return null;
  }

  function hcMostrarRecoEquipSalaInicio(cfg) {
    return hcPropagadorPendienteSalaEnInicio(cfg);
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
    var opcPend = getEquipamientoSalaOpcionalPendiente(cfg);
    var catsOpc =
      typeof global.EQUIP_CATEGORIAS !== 'undefined' && global.EQUIP_CATEGORIAS
        ? global.EQUIP_CATEGORIAS
        : typeof EQUIP_CATEGORIAS !== 'undefined'
          ? EQUIP_CATEGORIAS
          : {};
    var faltaTxt =
      falt.length > 0
        ? ' Falta indispensable: <strong>' +
          falt
            .map(function (f) {
              return f.label;
            })
            .join(', ') +
          '</strong>.'
        : '';
    var opcTxt =
      paso !== 'equip' && opcPend.length > 0
        ? ' Opcional sin registrar: <strong>' +
          opcPend
            .map(function (k) {
              return catsOpc[k] ? catsOpc[k].label : k;
            })
            .join(', ') +
          '</strong>.'
        : '';
    var onclick =
      paso === 'montaje' || paso === 'done'
        ? paso === 'done' && opcPend.length > 0
          ? "typeof abrirConfiguradorEquipamientoSalaPropagador==='function'&&abrirConfiguradorEquipamientoSalaPropagador()"
          : "typeof hcIrMontajeSala==='function'&&hcIrMontajeSala()"
        : "typeof abrirConfiguradorEquipamientoSalaPropagador==='function'&&abrirConfiguradorEquipamientoSalaPropagador()";
    var title =
      paso === 'done' && opcPend.length > 0
        ? 'Equipamiento opcional de sala'
        : paso === 'montaje'
          ? 'Checklist de montaje de sala (con guías)'
          : 'Configura el equipamiento de la sala de cultivo';
    var text =
      paso === 'done' && opcPend.length > 0
        ? 'Montaje verificado. Puedes registrar <strong>filtro de carbón, circulación, temporizador LED y control de HR</strong> en el configurador. Las <strong>6 fases de germinación</strong> están en <strong>Medir</strong>.'
        : paso === 'montaje'
          ? 'Indispensables guardados. En <strong>Sala</strong> revisa el catálogo (opcional) y marca el <strong>checklist de montaje</strong> en físico. El circuito <strong>DWC/RDWC</strong> solo después de la germinación.'
          : 'En <strong>Sala</strong>: <strong>indispensable</strong> (carpa, LED, extractor) y <strong>opcional</strong> (filtro carbón, circulación, HR…); después el checklist de montaje.';
    var cta =
      paso === 'done' && opcPend.length > 0
        ? 'Abrir configurador opcional ›'
        : paso === 'montaje'
          ? 'Ir al checklist en Sala ›'
          : 'Abrir configurador ›';
    var pasoHint =
      paso === 'done' && opcPend.length > 0
        ? '<span class="dash-sala-equip-reco-step">Opcional · recomendado</span>'
        : paso === 'montaje'
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
      opcTxt +
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
  global.hcFaltaConfigurarSalaEquipPropagador = hcFaltaConfigurarSalaEquipPropagador;
  global.hcPropagadorPendienteSalaEnInicio = hcPropagadorPendienteSalaEnInicio;
  global.hcPropagadorSalaRecoEnGermHub = hcPropagadorSalaRecoEnGermHub;
  global.hcMostrarRecoEquipSalaInicio = hcMostrarRecoEquipSalaInicio;
  global.hcPropagadorInicioOcultarCuadroGermFases = hcPropagadorInicioOcultarCuadroGermFases;
  global.getEquipamientoSalaOpcionalPendiente = getEquipamientoSalaOpcionalPendiente;
  global.refreshDashSalaEquipRecoBanner = refreshDashSalaEquipRecoBanner;
})(
  typeof window !== 'undefined' ? window : this
);
