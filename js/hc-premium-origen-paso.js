/**
 * HidroGrow — paso 1 del asistente: origen semilla / clon / madre (antes de sala y equipamiento).
 */
(function () {
  'use strict';

  function el(id) {
    return document.getElementById(id);
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  var RUTAS = {
    semilla: {
      titulo: 'Semilla → floración',
      pasos: [
        'Germinador o domo (22–26 °C)',
        '6 fases en Inicio (rockwool → net pot)',
        'Traslado al DWC/RDWC',
        'Veg → flor (foto o auto)',
      ],
      equip: 'Propagador recomendado en paso Espacio · sala LED completa para veg/flor.',
    },
    clon: {
      titulo: 'Esqueje → floración',
      pasos: [
        'Corte de madre o compra de clon',
        'Domo de enraizado ~7–14 d',
        'Net pot en el depósito',
        'Veg → floración',
      ],
      equip: 'Propagador en paso Espacio · no hace falta semillero ni 6 fases de germinación.',
    },
    madre: {
      titulo: 'Madre → esquejes → floración',
      pasos: [
        'Cubo madre 18/6 permanente',
        'Cortes cada 10–14 d',
        'Enraizado en domo (como clon)',
        'Esquejes al hidro → flor',
      ],
      equip: 'Sala y depósito para madre + zona de esquejes; sin camino de semilla.',
    },
  };

  function renderOrigenFlowDiagram(origen) {
    var host = el('setupPremiumOrigenFlow');
    if (!host) return;
    var r = RUTAS[origen] || RUTAS.semilla;
    host.innerHTML =
      '<div class="hc-origen-ruta-card" role="region" aria-label="Ruta de cultivo">' +
      '<div class="hc-origen-ruta-title">' +
      esc(r.titulo) +
      '</div>' +
      '<ol class="hc-origen-ruta-ol">' +
      r.pasos
        .map(function (s) {
          return '<li>' + esc(s) + '</li>';
        })
        .join('') +
      '</ol>' +
      '<p class="hc-origen-ruta-equip">' +
      esc(r.equip) +
      '</p></div>';
  }

  function persistOrigenASetupData(origen) {
    try {
      if (typeof setupData !== 'undefined') {
        setupData.origenPlanta = origen;
      }
      if (typeof state !== 'undefined' && state && state.configTorre) {
        var cfg = state.configTorre;
        if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = {};
        cfg.premiumSetup.origenPlanta = origen;
        cfg.origenPlanta =
          typeof normalizarOrigenPlanta === 'function'
            ? normalizarOrigenPlanta(origen)
            : origen === 'clon' || origen === 'madre'
              ? origen
              : 'germinacion';
      }
    } catch (_) {}
  }

  function refreshSetupEquipOrigenBanner() {
    var box = el('setupPremiumEquipOrigenBanner');
    if (!box) return;
    var orig =
      typeof getPremiumOrigenPlanta === 'function' ? getPremiumOrigenPlanta() : 'semilla';
    var txt = '';
    if (orig === 'semilla') {
      txt =
        '<strong>Origen: semilla.</strong> Arriba verás el grupo <strong>Germinación</strong> (propagador, mat térmica). ' +
        'La sala completa (LED, extractor) es para cuando la plántula esté en el depósito.';
    } else if (orig === 'clon') {
      txt =
        '<strong>Origen: esqueje.</strong> Prioriza <strong>enraizado</strong> (propagador). ' +
        'El seguimiento día a día del domo está en el paso de detalle de origen y en Inicio.';
    } else if (orig === 'madre') {
      txt =
        '<strong>Origen: madre.</strong> Equipa sala y depósito para la madre (18/6). ' +
        'Los esquejes que tomes seguirán el camino de clon.';
    }
    box.classList.remove('setup-hidden');
    box.innerHTML = txt;
  }

  function refreshPremiumOrigenPasoUI() {
    var orig =
      typeof getPremiumOrigenPlanta === 'function'
        ? getPremiumOrigenPlanta()
        : typeof ensurePremiumSetup === 'function'
          ? ensurePremiumSetup().origenPlanta || 'semilla'
          : 'semilla';
    renderOrigenFlowDiagram(orig);
    if (typeof refreshPremiumOrigenRecoUI === 'function') {
      refreshPremiumOrigenRecoUI(orig, []);
    }
    el('setupPremiumOrigenSemilla')?.classList.toggle('selected', orig === 'semilla');
    el('setupPremiumOrigenClon')?.classList.toggle('selected', orig === 'clon');
    el('setupPremiumOrigenMadre')?.classList.toggle('selected', orig === 'madre');
  }

  window.renderOrigenFlowDiagram = renderOrigenFlowDiagram;
  window.persistOrigenASetupData = persistOrigenASetupData;
  window.refreshSetupEquipOrigenBanner = refreshSetupEquipOrigenBanner;
  window.refreshPremiumOrigenPasoUI = refreshPremiumOrigenPasoUI;
})();
