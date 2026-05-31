/**
 * HidroGrow — Consejos extra: tabla genéticas hidro + bloque IoT.
 */
(function (global) {
  'use strict';

  var GENETICS_TOP_HIDRO_IDS = [
    'northern_lights_auto',
    'white_widow',
    'ak47',
    'critical_mass',
    'cheese',
    'zkittlez_auto',
    'auto_blueberry',
    'blue_dream',
    'og_kush',
    'girl_scout_cookies',
    'wedding_cake',
    'gorilla_glue',
    'skunk1',
    'big_bud',
    'northern_lights',
    'gelato_auto',
    'pineapple_express',
    'purple_kush',
    'jack_herer',
    'bubba_kush',
  ];

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getGeneticsDb() {
    return typeof GENETICS_DB !== 'undefined' && Array.isArray(GENETICS_DB) ? GENETICS_DB : [];
  }

  function resolveTopGenetics() {
    var db = getGeneticsDb();
    var byId = {};
    db.forEach(function (g) {
      byId[g.id] = g;
    });
    var out = [];
    GENETICS_TOP_HIDRO_IDS.forEach(function (id) {
      if (byId[id]) out.push(byId[id]);
    });
    return out;
  }

  function buildConsejoTablaGeneticasHidro() {
    var list = resolveTopGenetics();
    if (!list.length) return '';

    var rows = list
      .map(function (g, i) {
        var tipo = g.tipoFloracion === 'auto' ? 'Auto' : 'Foto';
        var ec =
          (g.ecMin != null ? g.ecMin : '—') + '–' + (g.ecMax != null ? g.ecMax : '—');
        var ph =
          (g.phMin != null ? g.phMin : '—') + '–' + (g.phMax != null ? g.phMax : '—');
        return (
          '<tr>' +
          '<td>' +
          (i + 1) +
          '</td>' +
          '<td><span aria-hidden="true">' +
          (g.emoji || '🌿') +
          '</span> <strong>' +
          escHtml(g.nombre) +
          '</strong></td>' +
          '<td>' +
          tipo +
          '</td>' +
          '<td>' +
          escHtml(g.dificultad || '—') +
          '</td>' +
          '<td>' +
          ec +
          '</td>' +
          '<td>' +
          ph +
          '</td>' +
          '<td>' +
          (g.dias || '—') +
          ' d</td>' +
          '<td class="consejo-gen-nota">' +
          escHtml(g.nota || '') +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    return (
      '<div class="consejo-genetics-wrap">' +
      '<div class="consejo-titulo consejo-titulo--mb6">20 genéticas recomendadas para empezar en hidro</div>' +
      '<p class="consejo-genetics-lead">Referencia orientativa para DWC/RDWC en interior (no ranking comercial). Elige variedad en <strong>Cultivo e instalación</strong> → asignar en cestas.</p>' +
      '<div class="consejo-genetics-scroll">' +
      '<table class="consejo-genetics-table">' +
      '<thead><tr>' +
      '<th>#</th><th>Variedad</th><th>Tipo</th><th>Nivel</th><th>EC µS</th><th>pH</th><th>Ciclo</th><th>Nota</th>' +
      '</tr></thead><tbody>' +
      rows +
      '</tbody></table></div>' +
      '<p class="consejo-genetics-foot">Catálogo completo: ' +
      getGeneticsDb().length +
      ' genéticas en la app. Autos: 18/6 todo el ciclo. Fotos: 18/6 veg → 12/12 flor.</p></div>'
    );
  }

  function buildConsejoBloqueIoT() {
    return (
      '<div class="consejo-iot-wrap">' +
      '<div class="consejo-titulo consejo-titulo--mb6">Sensores e IoT (opcional)</div>' +
      '<ul class="consejo-iot-list">' +
      '<li><strong>Sin sensores:</strong> registra todo manualmente en <strong>Medir</strong>. La app funciona igual.</li>' +
      '<li><strong>Con gateway WiFi</strong> (ESP32 en tu sala): autocompleta EC, pH, temp., HR, PPFD, CO₂… Tras probar conexión y validar lecturas.</li>' +
      '<li><strong>Coste app:</strong> cero en servidores; el gateway es tuyo en la red local.</li>' +
      '</ul>' +
      '<div class="consejo-iot-actions">' +
      '<button type="button" class="btn btn-sm btn-secondary" onclick="goTab(\'mediciones\');setTimeout(function(){if(typeof hcIotOpenWifiWizard===\'function\')hcIotOpenWifiWizard();},400)">Configurar WiFi paso a paso</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" onclick="goTab(\'mediciones\')">Ir a Medir</button>' +
      '</div>' +
      '<p class="consejo-iot-foot">Firmware de ejemplo: <code class="hc-iot-code">docs/iot/ESP32-hidrogrow-gateway.ino</code></p></div>'
    );
  }

  global.buildConsejoTablaGeneticasHidro = buildConsejoTablaGeneticasHidro;
  global.buildConsejoBloqueIoT = buildConsejoBloqueIoT;
  global.GENETICS_TOP_HIDRO_IDS = GENETICS_TOP_HIDRO_IDS;
})(typeof window !== 'undefined' ? window : globalThis);
