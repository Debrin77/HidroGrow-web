/**
 * HidroGrow — breederId y enlace al pack por genética (growshops / web del semillero).
 * Complementa genetics-db.js; prioriza ficha del fabricante sobre datos genéricos de la app.
 */
(function (global) {
  'use strict';

  /** breederId → id en SEMILLEROS_DB. strainPackUrl opcional si hay URL estable del producto. */
  var GENETICS_BREEDER_MAP = {
    northern_lights_auto: { breederId: 'royal_queen' },
    blue_dream: { breederId: 'barneys_farm' },
    og_kush: { breederId: 'dinafem' },
    white_widow: { breederId: 'sensi_seeds' },
    amnesia_haze: { breederId: 'royal_queen' },
    girl_scout_cookies: { breederId: 'barneys_farm' },
    gorilla_glue: { breederId: 'barneys_farm' },
    ak47: { breederId: 'pyramid_seeds' },
    critical_mass: { breederId: 'barneys_farm' },
    cheese: { breederId: 'royal_queen' },
    sour_diesel: { breederId: 'sensi_seeds' },
    jack_herer: { breederId: 'sensi_seeds' },
    purple_haze: { breederId: 'sensi_seeds' },
    durban_poison: { breederId: 'dutch_passion' },
    bruce_banner: { breederId: 'royal_queen' },
    wedding_cake: { breederId: 'barneys_farm' },
    zkittlez_auto: { breederId: 'fast_buds' },
    green_crack: { breederId: 'royal_queen' },
    strawberry_cough: { breederId: 'sensi_seeds' },
    gelato: { breederId: 'barneys_farm' },
    mimosa: { breederId: 'barneys_farm' },
    purple_kush: { breederId: 'sensi_seeds' },
    la_confidential: { breederId: 'dinafem' },
    pineapple_express: { breederId: 'barneys_farm' },
    afghan_kush: { breederId: 'sensi_seeds' },
    charlottes_web: { breederId: 'dutch_passion' },
    harlequin: { breederId: 'philosopher_seeds' },
    moby_dick_auto: { breederId: 'dinafem' },
    forbidden_fruit: { breederId: 'sweet_seeds' },
    skunk1: { breederId: 'sensi_seeds' },
    royal_moby: { breederId: 'royal_queen' },
    purple_queen: { breederId: 'royal_queen' },
    skunk_xl: { breederId: 'royal_queen' },
    super_skunk: { breederId: 'sensi_seeds' },
    big_bud: { breederId: 'sensi_seeds' },
    lemon_haze: { breederId: 'barneys_farm' },
    trainwreck: { breederId: 'barneys_farm' },
    granddaddy_purple: { breederId: 'barneys_farm' },
    bubba_kush: { breederId: 'barneys_farm' },
    dosidos: { breederId: 'barneys_farm' },
    runtz: { breederId: 'barneys_farm' },
    mac1: { breederId: 'barneys_farm' },
    wedding_crasher: { breederId: 'barneys_farm' },
    sunset_sherbet: { breederId: 'barneys_farm' },
    black_diamond: { breederId: 'pyramid_seeds' },
    gelato_auto: { breederId: 'fast_buds' },
    gorilla_auto: { breederId: 'fast_buds' },
    auto_blueberry: { breederId: 'dutch_passion' },
    auto_purple_lemon: { breederId: 'fast_buds' },
    acdc: { breederId: 'dutch_passion' },
    cannatonic: { breederId: 'philosopher_seeds' },
    chocolate_haze: { breederId: 'royal_queen' },
    banana_kush: { breederId: 'barneys_farm' },
    cherry_pie: { breederId: 'barneys_farm' },
    fire_og: { breederId: 'barneys_farm' },
    northern_lights: { breederId: 'sensi_seeds' },
    blue_cheese: { breederId: 'barneys_farm' },
    amnesia_auto: { breederId: 'fast_buds' },
  };

  function getBreederMeta(breederId) {
    if (!breederId || typeof getSemilleroById !== 'function') return null;
    return getSemilleroById(breederId);
  }

  function buildPackSearchUrl(breederId, nombreStrain) {
    var meta = getBreederMeta(breederId);
    if (!meta || !meta.searchUrl || !nombreStrain) return meta && meta.webUrl ? meta.webUrl : null;
    return meta.searchUrl + encodeURIComponent(String(nombreStrain).trim());
  }

  function getGeneticsBreederInfo(cultivo, cfgOpt) {
    if (!cultivo || typeof cultivo !== 'object') return null;
    var cfg = cfgOpt || (typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {});
    var map = GENETICS_BREEDER_MAP[cultivo.id] || {};
    var breederId = cultivo.breederId || map.breederId || null;
    if (!breederId && cfg.semillero && cfg.semillero.id) {
      breederId = cfg.semillero.id;
    }
    var meta = getBreederMeta(breederId);
    var packUrl =
      cultivo.strainPackUrl ||
      map.strainPackUrl ||
      (breederId ? buildPackSearchUrl(breederId, cultivo.nombre || cultivo.id) : null);
    return {
      breederId: breederId,
      breederNombre: meta ? meta.nombre : (breederId || ''),
      breederWeb: meta && meta.webUrl ? meta.webUrl : null,
      strainPackUrl: packUrl,
      strainNombre: cultivo.nombre || cultivo.id || '',
      orientativo: !cultivo.strainPackUrl && !map.strainPackUrl,
    };
  }

  function enrichGeneticsDbBreederFields() {
    if (typeof GENETICS_DB === 'undefined' || !Array.isArray(GENETICS_DB)) return;
    GENETICS_DB.forEach(function (g) {
      var m = GENETICS_BREEDER_MAP[g.id];
      if (!m) return;
      if (!g.breederId && m.breederId) g.breederId = m.breederId;
      if (!g.strainPackUrl && m.strainPackUrl) g.strainPackUrl = m.strainPackUrl;
    });
  }

  function geneticsBreederHtml(cultivo, cfgOpt) {
    var info = getGeneticsBreederInfo(cultivo, cfgOpt);
    if (!info || !info.breederId) return '';
    var esc = function (t) {
      return String(t || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
    };
    var link = info.strainPackUrl
      ? '<a href="' +
        esc(info.strainPackUrl) +
        '" target="_blank" rel="noopener noreferrer" class="hc-gen-breeder-link">Ver en ' +
        esc(info.breederNombre) +
        (info.orientativo ? ' (búsqueda)' : '') +
        ' ↗</a>'
      : info.breederWeb
        ? '<a href="' +
          esc(info.breederWeb) +
          '" target="_blank" rel="noopener noreferrer" class="hc-gen-breeder-link">Web ' +
          esc(info.breederNombre) +
          ' ↗</a>'
        : esc(info.breederNombre);
    return (
      '<div class="hc-gen-breeder-line" role="note">' +
      '🏪 <strong>Semillero ref.:</strong> ' +
      link +
      (info.orientativo
        ? ' <span class="hc-gen-breeder-hint">— confirma pack y ficha en tienda</span>'
        : '') +
      '</div>'
    );
  }

  enrichGeneticsDbBreederFields();

  function renderMedirGeneticaBreederPanel() {
    var card = document.getElementById('medirGeneticaBreederCard');
    var panel = document.getElementById('medirGeneticaBreederPanel');
    if (!card || !panel) return;
    var cfg = typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
    var seen = {};
    var blocks = [];
    try {
      var tor = typeof state !== 'undefined' && state && state.torre ? state.torre : [];
      for (var n = 0; n < tor.length; n++) {
        (tor[n] || []).forEach(function (c) {
          if (!c || !c.variedad || seen[c.variedad]) return;
          seen[c.variedad] = true;
          var cu = typeof getCultivoDB === 'function' ? getCultivoDB(c.variedad) : null;
          if (!cu) return;
          var info = getGeneticsBreederInfo(cu, cfg);
          if (!info || !info.breederId) return;
          blocks.push(
            '<div class="medir-gen-breeder-item">' +
            '<strong>' +
            (cu.nombre || c.variedad) +
            '</strong>' +
            (typeof geneticsBreederHtml === 'function' ? geneticsBreederHtml(cu, cfg) : '') +
            (cu.nota ? '<p class="medir-gen-breeder-nota">' + String(cu.nota).replace(/</g, '&lt;') + '</p>' : '') +
            '</div>'
          );
        });
      }
    } catch (_) {}
    if (!blocks.length) {
      card.classList.add('setup-hidden');
      panel.innerHTML = '';
      return;
    }
    card.classList.remove('setup-hidden');
    panel.innerHTML =
      '<p class="medir-gen-breeder-lead">Enlaces orientativos al semillero habitual de cada variedad. <strong>Confirma siempre</strong> el pack que compraste en tu growshop.</p>' +
      blocks.join('');
  }

  global.GENETICS_BREEDER_MAP = GENETICS_BREEDER_MAP;
  global.getGeneticsBreederInfo = getGeneticsBreederInfo;
  global.geneticsBreederHtml = geneticsBreederHtml;
  global.buildPackSearchUrl = buildPackSearchUrl;
  global.enrichGeneticsDbBreederFields = enrichGeneticsDbBreederFields;
  global.renderMedirGeneticaBreederPanel = renderMedirGeneticaBreederPanel;
})(typeof window !== 'undefined' ? window : globalThis);
