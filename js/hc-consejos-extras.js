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

  function buildConsejoFlujoInstalacion() {
    var lc =
      typeof getInstalacionLifecycle === 'function' ? getInstalacionLifecycle() : null;
    var pct = lc ? lc.porcentaje : 0;
    var fase = lc ? lc.fase : '—';
    var operativa = lc && lc.operativaDiaria;
    var estadoTxt = operativa
      ? '✓ Instalación operativa — rutina diaria en Medir.'
      : 'Instalación al ' + pct + '% · pendiente: ' + (lc && lc.siguientePaso ? lc.siguientePaso.label : '—');
    return (
      '<div class="consejo-flujo-wrap">' +
      '<div class="consejo-titulo consejo-titulo--mb6">Flujo de la app (una vez + cada día)</div>' +
      '<p class="consejo-flujo-estado" role="status">' + escHtml(estadoTxt) + '</p>' +
      '<ol class="consejo-flujo-ol">' +
      '<li><strong>Configurar</strong> — asistente: sistema hidro (DWC/RDWC), depósito, nutriente y <strong>equipamiento</strong> (Top 10 por tipo en catálogo ES).</li>' +
      '<li><strong>Montaje de sala</strong> — checklist en Sala; verifica con guías. Editable hasta el primer llenado del depósito.</li>' +
      '<li><strong>Cultivo en matriz</strong> — variedad y fecha de trasplante al hidro en cada cesta/maceta.</li>' +
      '<li><strong>Primer llenado</strong> — checklist del depósito (nutrientes); dosis guiadas por tu configuración.</li>' +
      '<li><strong>Rutina diaria</strong> — Medir: EC, pH, T°, volumen (manual o IoT) → tareas del día → Historial, Calendario y Meteo.</li>' +
      '</ol>' +
      '<div class="consejo-flujo-actions">' +
      (operativa
        ? '<button type="button" class="btn btn-sm btn-primary" onclick="hcIrRutinaDiaOperativa()">Ir a Medir</button>'
        : '<button type="button" class="btn btn-sm btn-primary" onclick="goTab(\'inicio\')">Ver progreso en Inicio</button>') +
      ' <button type="button" class="btn btn-sm btn-ghost" onclick="goTab(\'ayuda\')">Ayuda — FAQ</button></div></div>'
    );
  }

  function buildConsejoRutinaDiaria() {
    return (
      '<div class="consejo-rutina-wrap">' +
      '<div class="consejo-titulo consejo-titulo--mb6">Rutina diaria (modo operativo)</div>' +
      '<ul class="consejo-rutina-list">' +
      '<li><strong>Medir</strong> — entrada rápida o campos EC/pH/T°/vol. La app compara con rangos de tu instalación.</li>' +
      '<li><strong>Tareas para hoy</strong> — checklist diario/semanal; las mediciones marcan EC/pH automáticamente.</li>' +
      '<li><strong>IoT opcional</strong> — gateway WiFi autocompleta; valida antes de guardar.</li>' +
      '<li><strong>Calendario</strong> — recordatorios de medición, recarga y tareas semanales (calibración medidor, PPFD…).</li>' +
      '<li><strong>Historial</strong> — gráficas y registro unificado.</li>' +
      '<li><strong>Meteo</strong> — exterior: avisos AEMET/MeteoAlarm y contexto para VPD/EC suave.</li>' +
      '</ul>' +
      '<p class="consejo-rutina-foot">Referencia experta: medir EC/pH a la misma hora; calibrar medidor cada 14–30 días; temp. agua 18–22 °C en hidro; oxígeno 24 h en DWC/RDWC.</p>' +
      '<button type="button" class="btn btn-sm btn-secondary" onclick="hcIrRutinaDiaOperativa()">Abrir Medir</button></div>'
    );
  }

  function buildConsejoEquipamientoTop10() {
    var catsFn =
      typeof getEquipCategorias === 'function'
        ? getEquipCategorias
        : function () {
            return window.EQUIP_CATEGORIAS || {};
          };
    var topFn =
      typeof getEquipTopPorCategoria === 'function'
        ? getEquipTopPorCategoria
        : function () {
            return [];
          };
    var cats = catsFn();
    var keys = Object.keys(cats);
    if (!keys.length) return '';
    var blocks = keys
      .map(function (key) {
        var cat = cats[key];
        var list = topFn(key, 10);
        if (!list.length) return '';
        var rows = list
          .map(function (e) {
            return (
              '<tr><td>' +
              (e.rank || '—') +
              '</td><td><strong>' +
              escHtml(e.marca) +
              '</strong></td><td>' +
              escHtml(e.modelo) +
              '</td><td class="consejo-equip-nota">' +
              escHtml(e.nota || '') +
              '</td></tr>'
            );
          })
          .join('');
        return (
          '<details class="consejo-equip-details"><summary>' +
          escHtml(cat.icon + ' ' + cat.label) +
          ' — Top ' +
          list.length +
          ' en España</summary>' +
          '<div class="consejo-equip-scroll"><table class="consejo-equip-table">' +
          '<thead><tr><th>#</th><th>Marca</th><th>Modelo</th><th>Nota</th></tr></thead><tbody>' +
          rows +
          '</tbody></table></div></details>'
        );
      })
      .join('');
    return (
      '<div class="consejo-equip-wrap">' +
      '<div class="consejo-titulo consejo-titulo--mb6">Equipamiento — Top 10 por tipo (España)</div>' +
      '<p class="consejo-equip-lead">Referencia orientativa de modelos habituales en growshops españoles. Elige en el <strong>configurador</strong> (asistente → Espacio y equipamiento); la app rellena W, m³/h, L/min…</p>' +
      blocks +
      '<div class="consejo-equip-actions">' +
      '<button type="button" class="btn btn-sm btn-primary" onclick="typeof abrirSetup===\'function\'&&abrirSetup()">Abrir configurador</button> ' +
      '<button type="button" class="btn btn-sm btn-ghost" onclick="goTabSala(\'agua\')">Ver plano en Sala</button></div>' +
      '<p class="consejo-equip-foot">Si tu modelo no está: elige «Manual / otro» e introduce datos de la ficha técnica del fabricante.</p></div>'
    );
  }

  global.buildConsejoFlujoInstalacion = buildConsejoFlujoInstalacion;
  global.buildConsejoRutinaDiaria = buildConsejoRutinaDiaria;
  global.buildConsejoEquipamientoTop10 = buildConsejoEquipamientoTop10;
})(typeof window !== 'undefined' ? window : globalThis);
