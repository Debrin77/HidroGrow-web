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
    if (typeof getCaminoCultivo === 'function' && typeof getCaminoDef === 'function') {
      var cam = getCaminoCultivo();
      var def = getCaminoDef(cam);
      if (def && def.orden && def.orden.length) {
        var tituloCamino =
          cam === 'semilla_propagador'
            ? ''
            : '<div class="hc-origen-ruta-title">' + esc((def.icon || '') + ' ' + def.label) + '</div>';
        host.innerHTML =
          '<div class="hc-origen-ruta-card hc-camino-ruta-card" role="region" aria-label="Tu camino">' +
          tituloCamino +
          '<ol class="hc-origen-ruta-ol">' +
          def.orden
            .map(function (s) {
              return '<li>' + s + '</li>';
            })
            .join('') +
          '</ol></div>';
        return;
      }
    }
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

  function ocultarBannerRutaGermAhora() {
    return (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    );
  }

  function refreshSetupEquipOrigenBanner() {
    var box = el('setupPremiumEquipOrigenBanner');
    if (!box) return;
    if (ocultarBannerRutaGermAhora()) {
      box.classList.add('setup-hidden');
      box.innerHTML = '';
      return;
    }
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
    var def = typeof getCaminoDef === 'function' ? getCaminoDef(cam) : null;
    var faseGerm =
      typeof hcSetupEnFaseGerminacion === 'function' && hcSetupEnFaseGerminacion();
    var txt = '';
    if (cam === 'semilla_propagador') {
      txt = faseGerm
        ? '<strong>Ruta: semilla en propagador.</strong> En <strong>Espacio</strong> solo domo y mat térmica → checklist → ' +
          '<strong>6 fases con registro diario</strong>. La sala va <em>después</em> de las 6 fases.'
        : '<strong>Ruta: semilla en propagador.</strong> Domo y mat térmica en Fase 1. Tras el checklist del propagador: ' +
          '<strong>configura la sala</strong>, montaje, <strong>6 fases</strong> en Inicio y luego DWC/RDWC.';
    } else if (cam === 'semilla_hidro') {
      txt = faseGerm
        ? '<strong>Ruta: semilla en hidro.</strong> Equipamiento de <strong>sala + prep cubo</strong> → montaje → ' +
          'DWC/RDWC y <strong>primer llenado</strong> → luego las 6 fases en Inicio.'
        : '<strong>Ruta: semilla en hidro.</strong> Prep en depósito → <strong>sala y montaje</strong> → 6 fases en Inicio. ' +
          'Al terminar solo cierras DWC/RDWC (sin repetir germinación en el depósito).';
    } else if (cam === 'esqueje_hidro') {
      txt =
        '<strong>Ruta: esqueje.</strong> <strong>Propagador</strong> para enraizar + sala y circuito hidro en este asistente.';
    } else if (cam === 'madre_hidro') {
      txt =
        '<strong>Ruta: madre.</strong> Sala y depósito para la madre (18/6); esquejes con checklist de clon.';
    } else if (def) {
      txt = '<strong>' + def.label + '</strong>';
    }
    box.classList.remove('setup-hidden');
    box.innerHTML = txt;
  }

  function refreshPremiumOrigenPasoUI() {
    if (typeof refreshCaminoCultivoUI === 'function') {
      refreshCaminoCultivoUI();
      return;
    }
    var orig =
      typeof getPremiumOrigenPlanta === 'function'
        ? getPremiumOrigenPlanta()
        : 'semilla';
    renderOrigenFlowDiagram(orig);
  }

  window.renderOrigenFlowDiagram = renderOrigenFlowDiagram;
  window.persistOrigenASetupData = persistOrigenASetupData;
  window.refreshSetupEquipOrigenBanner = refreshSetupEquipOrigenBanner;
  window.refreshPremiumOrigenPasoUI = refreshPremiumOrigenPasoUI;
})();
