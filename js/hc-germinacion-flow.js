/**
 * HidroGrow — producto inicial «Germinación» (6 fases → traslado DWC/RDWC).
 * Tras hc-premium-wizard.js; antes de hc-dash-operativa.js.
 */
(function (global) {
  'use strict';

  var PASOS = [
    {
      id: 'semilla',
      paso: 1,
      titulo: 'Germinador (papel o domo)',
      desc: 'Semilla húmeda a 22–26 °C, a oscuras o en domo. Todavía no va al cubo hidro.',
      icon: '🌱',
    },
    {
      id: 'taproot',
      paso: 2,
      titulo: 'Radícula 5–10 mm',
      desc: 'La raíz blanca asoma: momento de pasarla al cubo de lana. No toques la punta.',
      icon: '🌿',
    },
    {
      id: 'rockwool',
      paso: 3,
      titulo: 'Cubo lana de roca 4×4 cm',
      desc: 'Remoja pH 5.5 e inserta la semilla en el hueco central del cubo.',
      icon: '🧊',
    },
    {
      id: 'domo',
      paso: 4,
      titulo: 'Domo húmedo + luz suave 18/6',
      desc: 'Plántula bajo domo (HR 70–80 %). Ventila 2×/día; luz tenue, no intensa.',
      icon: '🫧',
    },
    {
      id: 'netpot',
      paso: 5,
      titulo: 'Net pot + arcilla expandida',
      desc: 'Cuando la raíz sale del cubo, pasa a maceta de malla antes del depósito.',
      icon: '🪴',
    },
    {
      id: 'dwc',
      paso: 6,
      titulo: 'Traslado al cubo DWC/RDWC',
      desc: 'Solo plántula enraizada en net pot. Nunca siembra directa en el depósito · EC 400–600 µS.',
      icon: '💧',
    },
  ];

  var EQUIP_ESENCIAL = [
    { id: 'domo', label: 'Domo / propagador', emoji: '🫧' },
    { id: 'rockwool', label: 'Cubos lana 4×4', emoji: '🧊' },
    { id: 'ph', label: 'pH ~5,5 (cubos)', emoji: '🧪' },
    { id: 'luz', label: 'Luz tenue 18/6', emoji: '💡' },
    { id: 'netpot', label: 'Net pot', emoji: '🪴' },
    { id: 'arcilla', label: 'Arcilla expandida', emoji: '⚪' },
  ];

  var EQUIP_RECOMENDADO = [
    { id: 'termohigro', label: 'Termo-higrómetro', emoji: '🌡️' },
    { id: 'mat', label: 'Mat térmica', emoji: '🔥' },
  ];

  /** Avisos suaves por fase si falta equipamiento marcado (no bloquea). */
  var EQUIP_AVISO_FASE = {
    semilla: { need: ['domo'], msg: 'Sin domo/propagador marcado: germina a 22–26 °C en bandeja húmeda o domo.' },
    taproot: { need: ['domo', 'rockwool'], msg: 'Antes del cubo: ten listos domo y cubos de lana 4×4.' },
    rockwool: { need: ['rockwool', 'ph'], msg: 'Fase cubo: remoja lana a pH ~5,5 (marca pH y cubos si los tienes).' },
    domo: { need: ['domo', 'luz'], msg: 'Bajo domo: luz suave 18/6 y HR 70–80 %; ventila 2×/día.' },
    netpot: { need: ['netpot', 'arcilla'], msg: 'Tras el cubo: net pot + arcilla antes del depósito DWC/RDWC.' },
    dwc: { need: ['netpot', 'arcilla'], msg: 'Al hidro: solo plántula enraizada en net pot; EC baja en el depósito.' },
  };

  var EQUIP_AVISO_FASE_HIDRO = {
    semilla: {
      need: ['rockwool', 'netpot'],
      msg: 'Germinación en el hidro: cubo en net pot + domo mini sobre la maceta. Nunca semilla suelta en el depósito.',
    },
    taproot: { need: ['rockwool', 'netpot'], msg: 'Radícula visible: confirma cubo y net pot; agua del depósito muy baja o solo niebla de raíz.' },
    rockwool: { need: ['rockwool', 'ph'], msg: 'Cubo pH 5,5 en net pot; EC del depósito 200–400 µS hasta que enraice.' },
    domo: { need: ['luz'], msg: 'Domo sobre net pot o HR alta en sala; luz suave 18/6; ventila 2×/día el microclima.' },
    netpot: { need: ['netpot', 'arcilla'], msg: 'Raíz por fuera del cubo: sube nivel de agua poco a poco; sigue EC baja.' },
    dwc: { need: ['netpot'], msg: 'Plántula enraizada: EC 400–600 µS y aireación activa antes de subir nutrición.' },
  };

  /** Descripciones de fase cuando no hay propagador aparte. */
  var PASO_DESC_HIDRO = {
    semilla: 'Semilla en cubo dentro del net pot; domo mini o bandeja sobre el depósito (agua muy baja).',
    taproot: 'Radícula 5–10 mm: mantén el cubo húmedo; la punta no debe sumergirse en el depósito.',
    rockwool: 'Cubo en net pot al borde del DWC/RDWC; EC inicial baja; raíz solo toca niebla o 1–2 cm de agua.',
    domo: 'Microdomo sobre la maceta o HR alta; luz tenue 18/6; controla T° agua 20–24 °C.',
    netpot: 'Sube nivel gradualmente cuando la raíz salga del cubo; arcilla si ya la usas en tu sistema.',
    dwc: 'Plántula estable: confirma checklist de traslado y asigna la cesta en la matriz.',
  };

  var TAREAS_DIA_FASE = {
    propagador: {
      semilla: 'Revisa humedad del papel/jiffy; T° 22–26 °C; anota si asoma humedad en la tapa.',
      taproot: 'No toques la radícula; prepara cubos remojados pH 5,5.',
      rockwool: 'Inserta con cuidado; cubo húmedo sin charco.',
      domo: 'Ventila el domo 2× (5 min); guarda T° y HR; luz suave encendida.',
      netpot: 'Comprueba que la raíz no esté aplastada al meter arcilla.',
      dwc: 'Última revisión del domo antes del checklist al hidro definitivo.',
    },
    hidro_directo: {
      semilla: 'T° agua 20–24 °C; nivel mínimo; confirma que la semilla no cae al depósito.',
      taproot: 'Mantén solo humedad en el cubo; aumenta agua solo cuando la raíz lo pida.',
      rockwool: 'pH cubo 5,5; EC depósito 200–400 µS; burbujas suaves.',
      domo: 'HR alta o mini domo; ventila; medición en Medir si tienes sonda de agua.',
      netpot: 'Sube 1–2 cm el nivel si la raíz blanca asoma por los agujeros.',
      dwc: 'Revisa aireación y luz veg antes del checklist de mejora del sistema.',
    },
  };

  var CHECKLIST_TRASLADO = [
    { id: 'ec', label: 'Depósito con EC baja (400–600 µS) o según ficha de enraizado' },
    { id: 'ph', label: 'pH del agua 5,5–5,8 comprobado' },
    { id: 'aire', label: 'Aireación / difusor activo sin burbujas que golpeen la raíz tierna' },
    { id: 'luz', label: 'Programa de luz vegetativo (18/6 o el de tu sala)' },
    { id: 'cesta', label: 'Cesta vacía elegida en la matriz (Cultivo e instalación)' },
    { id: 'temp', label: 'T° agua 20–24 °C estable antes de sumergir más la raíz' },
  ];

  function getModoGerminacion(cfg, g) {
    cfg = cfg || cfgActiva();
    g = g || ensureGerminacionFlow(cfg);
    if (g.modo === 'propagador' || g.modo === 'hidro_directo') return g.modo;
    var inst = cfg.equipamientoInstalado || {};
    if (inst.propagador && inst.propagador.id) return 'propagador';
    return 'hidro_directo';
  }

  function setModoGerminacion(modo) {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    g.modo = modo === 'hidro_directo' ? 'hidro_directo' : 'propagador';
    persistirGerminacion();
    refreshDashGerminacionHub();
  }

  function descPaso(paso, modo) {
    if (modo === 'hidro_directo' && PASO_DESC_HIDRO[paso.id]) return PASO_DESC_HIDRO[paso.id];
    return paso.desc;
  }

  function avisoEquipFase(pasoId, g, modo) {
    var spec = (modo === 'hidro_directo' ? EQUIP_AVISO_FASE_HIDRO : EQUIP_AVISO_FASE)[pasoId];
    if (!spec || !g || !g.equip) return '';
    var falta = spec.need.filter(function (id) {
      return !g.equip[id];
    });
    if (!falta.length) return '';
    return spec.msg;
  }

  function tareaDiaFase(pasoId, modo, variedadId) {
    if (typeof getGerminacionTareaDia === 'function') {
      return getGerminacionTareaDia(variedadId || '', pasoId, modo);
    }
    var tbl = TAREAS_DIA_FASE[modo === 'hidro_directo' ? 'hidro_directo' : 'propagador'] || TAREAS_DIA_FASE.propagador;
    return tbl[pasoId] || 'Revisa plántula, humedad y temperatura; anota en el registro del día.';
  }

  function hintVariedadFase(variedadId, pasoId) {
    if (!variedadId) return '';
    if (typeof getGerminacionHintFase === 'function') return getGerminacionHintFase(variedadId, pasoId);
    if (typeof getGerminacionSpecPorVariedad !== 'function') return '';
    var spec = getGerminacionSpecPorVariedad(variedadId);
    if (pasoId === 'semilla' || pasoId === 'taproot') return spec.osc || '';
    if (pasoId === 'rockwool' || pasoId === 'domo') return spec.emerg || '';
    if (pasoId === 'netpot' || pasoId === 'dwc') return spec.planton || '';
    return spec.nota || '';
  }

  function hcGerminacionElegirVariedad(variedadId) {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    var vid = String(variedadId || '').trim();
    g.variedadId = vid;
    if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = {};
    cfg.premiumSetup.variedadGerminacion = vid;
    if (typeof setupData !== 'undefined' && setupData.premium) {
      setupData.premium.variedadGerminacion = vid;
    }
    var selSetup = document.getElementById('setupPremiumVariedadGermSelect');
    if (selSetup && selSetup.value !== vid) selSetup.value = vid;
    persistirGerminacion();
    if (typeof saveState === 'function') saveState();
    refreshDashGerminacionHub();
    if (typeof hcGerminacionRefrescarCalendario === 'function') hcGerminacionRefrescarCalendario();
    if (typeof showToast === 'function' && vid) {
      var nom = vid;
      if (typeof getCultivoDB === 'function') {
        var cu = getCultivoDB(vid);
        if (cu && cu.nombre) nom = cu.nombre;
      }
      showToast('Genética: ' + nom, false);
    }
  }

  function hcGerminacionSyncEquipDesdeInstalado(cfg) {
    cfg = cfg || cfgActiva();
    if (!origenEsSemilla(cfg)) return;
    var g = ensureGerminacionFlow(cfg);
    var inst = cfg.equipamientoInstalado || {};
    if (inst.propagador && inst.propagador.id) g.equip.domo = true;
    if (inst.mat_termica_germ && inst.mat_termica_germ.id) g.equip.mat = true;
    if (inst.medidor && inst.medidor.id) g.equip.termohigro = true;
    if (inst.led && inst.led.id) g.equip.luz = true;
    g.modo = getModoGerminacion(cfg, g);
  }

  function diasDesdeInicio(g) {
    if (!g.startedAt) return 0;
    try {
      var a = new Date(g.startedAt);
      var b = new Date();
      a.setHours(0, 0, 0, 0);
      b.setHours(0, 0, 0, 0);
      return Math.max(0, Math.round((b - a) / 86400000));
    } catch (_) {
      return 0;
    }
  }

  function registroHoyHecho(g) {
    if (!Array.isArray(g.registroDiario)) return false;
    var iso = hoyIso();
    return g.registroDiario.some(function (r) {
      return r && r.fechaIso === iso;
    });
  }

  function renderEquipChips(list, g) {
    return list
      .map(function (eq) {
        var on = !!g.equip[eq.id];
        return (
          '<button type="button" class="hc-germ-equip-chip' +
          (on ? ' hc-germ-equip-chip--on' : '') +
          '" onclick="toggleGermEquip(\'' +
          eq.id +
          '\')" aria-pressed="' +
          (on ? 'true' : 'false') +
          '">' +
          '<span aria-hidden="true">' +
          eq.emoji +
          '</span> ' +
          esc(eq.label) +
          '</button>'
        );
      })
      .join('');
  }

  global.HC_GERMINACION_PASOS = PASOS;

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function cfgActiva() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function hoyIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function hoyDisplay() {
    const d = new Date();
    return (
      d.getDate().toString().padStart(2, '0') +
      '/' +
      (d.getMonth() + 1).toString().padStart(2, '0') +
      '/' +
      d.getFullYear()
    );
  }

  function horaDisplay() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function origenEsSemilla(cfg) {
    cfg = cfg || cfgActiva();
    const raw = (cfg.premiumSetup && cfg.premiumSetup.origenPlanta) || cfg.origenPlanta || '';
    if (raw === 'semilla') return true;
    if (typeof normalizarOrigenPlanta === 'function') {
      return normalizarOrigenPlanta(raw) === 'germinacion';
    }
    return raw === 'germinacion';
  }

  function ensureGerminacionFlow(cfg) {
    cfg = cfg || cfgActiva();
    if (!cfg.germinacionFlow || typeof cfg.germinacionFlow !== 'object') {
      cfg.germinacionFlow = {
        activo: false,
        pasos: {},
        equip: {},
        variedadId: '',
        startedAt: '',
        trasladoAt: '',
        ultimaDomo: null,
      };
    }
    const g = cfg.germinacionFlow;
    if (!g.pasos || typeof g.pasos !== 'object') g.pasos = {};
    if (!g.equip || typeof g.equip !== 'object') g.equip = {};
    migrateChecklistLegacy(cfg, g);
    return g;
  }

  function migrateChecklistLegacy(cfg, g) {
    const leg = cfg.premiumSetup && cfg.premiumSetup.germinacionChecklist;
    if (!leg || typeof leg !== 'object') return;
    let moved = false;
    PASOS.forEach(function (p) {
      if (leg[p.id] && !g.pasos[p.id]) {
        g.pasos[p.id] = { doneAt: hoyIso(), fecha: hoyDisplay(), hora: horaDisplay() };
        moved = true;
      }
    });
    if (moved && !g.startedAt) g.startedAt = hoyIso();
  }

  function hcGerminacionSyncDesdePremium(cfg) {
    if (!cfg || !origenEsSemilla(cfg)) {
      if (cfg && cfg.germinacionFlow) cfg.germinacionFlow.activo = false;
      return;
    }
    const g = ensureGerminacionFlow(cfg);
    if (!g.trasladoAt) g.activo = true;
    if (!g.startedAt && g.activo) g.startedAt = hoyIso();
    if (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) {
      g.variedadId = cfg.premiumSetup.variedadGerminacion;
    }
    hcGerminacionSyncEquipDesdeInstalado(cfg);
  }

  function hcGerminacionActiva(cfg) {
    cfg = cfg || cfgActiva();
    if (!origenEsSemilla(cfg)) return false;
    const g = ensureGerminacionFlow(cfg);
    if (g.trasladoAt) return false;
    return !!g.activo;
  }

  function indiceFaseActual(g) {
    for (let i = 0; i < PASOS.length; i++) {
      if (!g.pasos[PASOS[i].id] || !g.pasos[PASOS[i].id].doneAt) return i;
    }
    return PASOS.length;
  }

  function fasesCompletadas(g) {
    return indiceFaseActual(g) >= PASOS.length;
  }

  function pctProgreso(g) {
    let n = 0;
    PASOS.forEach(function (p) {
      if (g.pasos[p.id] && g.pasos[p.id].doneAt) n++;
    });
    return Math.round((n / PASOS.length) * 100);
  }

  function persistirGerminacion() {
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
  }

  function mostrarCelebracionFase(paso, siguiente) {
    var prev = document.getElementById('hcGermCelebracionOverlay');
    if (prev) prev.remove();
    var o = document.createElement('div');
    o.id = 'hcGermCelebracionOverlay';
    o.className = 'hc-germ-celebrate-overlay';
    o.setAttribute('role', 'alertdialog');
    o.setAttribute('aria-label', 'Fase completada');
    var sigTxt = siguiente
      ? '<p class="hc-germ-celebrate-next">Siguiente: <strong>' + esc(siguiente.titulo) + '</strong></p>'
      : '<p class="hc-germ-celebrate-next"><strong>¡Camino completo!</strong> Ya puedes trasladar al hidro.</p>';
    o.innerHTML =
      '<div class="hc-germ-celebrate-card">' +
      '<div class="hc-germ-celebrate-burst" aria-hidden="true"></div>' +
      '<span class="hc-germ-celebrate-ico" aria-hidden="true">' +
      (paso.icon || '✓') +
      '</span>' +
      '<h3 class="hc-germ-celebrate-title">Fase ' +
      paso.paso +
      ' completada</h3>' +
      '<p class="hc-germ-celebrate-sub">' +
      esc(paso.titulo) +
      '</p>' +
      sigTxt +
      '</div>';
    document.body.appendChild(o);
    setTimeout(function () {
      o.classList.add('hc-germ-celebrate-overlay--out');
      setTimeout(function () {
        o.remove();
      }, 420);
    }, 2200);
  }

  function hcGerminacionCompletarFaseActual() {
    const cfg = cfgActiva();
    const g = ensureGerminacionFlow(cfg);
    const idx = indiceFaseActual(g);
    if (idx >= PASOS.length) {
      if (typeof showToast === 'function') showToast('Todas las fases están completadas', false);
      return;
    }
    const paso = PASOS[idx];
    g.pasos[paso.id] = { doneAt: hoyIso(), fecha: hoyDisplay(), hora: horaDisplay() };
    if (!g.startedAt) g.startedAt = hoyIso();
    persistirGerminacion();
    const sig = idx < PASOS.length - 1 ? PASOS[idx + 1] : null;
    mostrarCelebracionFase(paso, sig);
    if (typeof showToast === 'function') {
      showToast(
        sig ? '✓ Fase ' + paso.paso + ' lista · Sigue con: ' + sig.titulo : '✓ Germinación lista para el hidro',
        false
      );
    }
    refreshDashGerminacionHub();
    if (typeof hcGerminacionRefrescarCalendario === 'function') hcGerminacionRefrescarCalendario();
    if (fasesCompletadas(g)) {
      setTimeout(function () {
        try {
          document.getElementById('hcGermTrasladoCta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (_) {}
        if (!g.checklistTrasladoOk) hcGerminacionAbrirChecklistTraslado();
      }, 900);
    }
  }

  function guardarRegistroGerminacionDiario() {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    var nota = String(document.getElementById('hcGermRegistroNota')?.value || '').trim();
    var t = parseFloat(String(document.getElementById('hcGermDomoTemp')?.value || '').replace(',', '.'));
    var h = parseFloat(String(document.getElementById('hcGermDomoHr')?.value || '').replace(',', '.'));
    var idx = indiceFaseActual(g);
    var faseId = idx < PASOS.length ? PASOS[idx].id : 'dwc';
    g.registroDiario.unshift({
      fechaIso: hoyIso(),
      fecha: hoyDisplay(),
      hora: horaDisplay(),
      faseId: faseId,
      dia: diasDesdeInicio(g) + 1,
      nota: nota,
      temp: Number.isFinite(t) ? t : null,
      hr: Number.isFinite(h) ? h : null,
    });
    if (g.registroDiario.length > 90) g.registroDiario.length = 90;
    persistirGerminacion();
    if (typeof showToast === 'function') showToast('Registro del día guardado · día ' + (diasDesdeInicio(g) + 1), false);
    refreshDashGerminacionHub();
    if (typeof hcGerminacionRefrescarCalendario === 'function') hcGerminacionRefrescarCalendario();
  }

  function toggleChecklistTrasladoItem(id) {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    g.checklistTraslado[id] = !g.checklistTraslado[id];
    var all = CHECKLIST_TRASLADO.every(function (it) {
      return !!g.checklistTraslado[it.id];
    });
    g.checklistTrasladoOk = all;
    persistirGerminacion();
    var btn = document.getElementById('hcGermChecklistContinuar');
    if (btn) btn.disabled = !all;
  }

  function hcGerminacionAbrirChecklistTraslado() {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    if (!fasesCompletadas(g)) {
      if (typeof showToast === 'function') showToast('Completa las 6 fases antes del checklist al hidro', true);
      return;
    }
    var prev = document.getElementById('hcGermChecklistOverlay');
    if (prev) prev.remove();
    var tipo =
      typeof etiquetaTipoInstalacion === 'function'
        ? etiquetaTipoInstalacion(cfg)
        : cfg.tipoInstalacion === 'rdwc'
          ? 'RDWC'
          : 'DWC';
    var o = document.createElement('div');
    o.id = 'hcGermChecklistOverlay';
    o.className = 'checklist-pregunta-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    var items = CHECKLIST_TRASLADO.map(function (it) {
      var on = !!g.checklistTraslado[it.id];
      return (
        '<label class="hc-germ-check-item">' +
        '<input type="checkbox" data-hc-germ-cl="' +
        esc(it.id) +
        '"' +
        (on ? ' checked' : '') +
        '> ' +
        esc(it.label) +
        '</label>'
      );
    }).join('');
    o.innerHTML =
      '<div class="checklist-pregunta-sheet hc-germ-checklist-sheet">' +
      '<div class="checklist-pregunta-handle"></div>' +
      '<div class="checklist-pregunta-head">' +
      '<div class="checklist-pregunta-emoji">✅</div>' +
      '<div><div class="checklist-pregunta-title">Checklist · paso al ' +
      esc(tipo) +
      '</div></div></div>' +
      '<p class="checklist-pregunta-nota-pasos">Germinación completada. Confirma que el sistema hidropónico está listo para recibir la plántula (mejora o primer llenado del depósito).</p>' +
      '<div class="hc-germ-checklist-list">' +
      items +
      '</div>' +
      '<div class="checklist-bloqueo-actions">' +
      '<button type="button" id="hcGermChecklistContinuar" class="checklist-pregunta-btn-main"' +
      (g.checklistTrasladoOk ? '' : ' disabled') +
      '>Continuar al traslado</button></div>' +
      '<button type="button" id="hcGermChecklistLater" class="checklist-pregunta-btn-later">Más tarde</button></div>';
    document.body.appendChild(o);
    if (typeof a11yDialogOpened === 'function') a11yDialogOpened(o);
    var cerrar = function () {
      try {
        if (typeof a11yDialogClosed === 'function') a11yDialogClosed(o);
      } catch (_) {}
      o.remove();
    };
    o.querySelectorAll('input[data-hc-germ-cl]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        toggleChecklistTrasladoItem(inp.getAttribute('data-hc-germ-cl'));
      });
    });
    document.getElementById('hcGermChecklistLater').addEventListener('click', cerrar);
    document.getElementById('hcGermChecklistContinuar').addEventListener('click', function () {
      if (!g.checklistTrasladoOk) {
        if (typeof showToast === 'function') showToast('Marca todos los puntos del checklist', true);
        return;
      }
      cerrar();
      hcGerminacionAbrirTraslado(true);
    });
  }

  function toggleGermEquip(id) {
    const cfg = cfgActiva();
    const g = ensureGerminacionFlow(cfg);
    g.equip[id] = !g.equip[id];
    persistirGerminacion();
    refreshDashGerminacionHub();
  }

  function guardarMedicionDomo() {
    const t = parseFloat(String(document.getElementById('hcGermDomoTemp')?.value || '').replace(',', '.'));
    const h = parseFloat(String(document.getElementById('hcGermDomoHr')?.value || '').replace(',', '.'));
    const cfg = cfgActiva();
    const g = ensureGerminacionFlow(cfg);
    const vpd =
      typeof calcVPDkPa === 'function' && Number.isFinite(t) && Number.isFinite(h)
        ? calcVPDkPa(t, h)
        : NaN;
    g.ultimaDomo = {
      fecha: hoyDisplay(),
      hora: horaDisplay(),
      temp: Number.isFinite(t) ? t : null,
      hr: Number.isFinite(h) ? h : null,
      vpd: Number.isFinite(vpd) ? vpd : null,
    };
    persistirGerminacion();
    if (typeof guardarMedicion === 'function' && (Number.isFinite(t) || Number.isFinite(h))) {
      guardarMedicion({
        tempAire: Number.isFinite(t) ? t : '',
        humSala: Number.isFinite(h) ? h : '',
        vpd: Number.isFinite(vpd) ? vpd : '',
        notas: 'Germinación · domo',
        skipClearInputs: true,
        source: 'germ-domo',
      }).catch(function () {});
    } else if (typeof showToast === 'function') {
      showToast('Registro del domo guardado', false);
    }
    refreshDashGerminacionHub();
  }

  function primerCestaVacia() {
    const tor = state.torre || [];
    const numN = (state.configTorre && state.configTorre.numNiveles) || tor.length || 1;
    for (let n = 0; n < numN; n++) {
      const row = tor[n] || [];
      for (let c = 0; c < row.length; c++) {
        if (!row[c] || !row[c].variedad) return { n: n, c: c };
      }
    }
    return null;
  }

  function hcGerminacionAbrirTraslado(skipChecklistGate) {
    const cfg = cfgActiva();
    const g = ensureGerminacionFlow(cfg);
    if (!fasesCompletadas(g)) {
      if (typeof showToast === 'function') {
        showToast('Completa las 6 fases del camino antes del traslado (o marca la fase actual)', true);
      }
      return;
    }
    if (!skipChecklistGate && !g.checklistTrasladoOk) {
      hcGerminacionAbrirChecklistTraslado();
      return;
    }
    var prev = document.getElementById('hcGermTrasladoOverlay');
    if (prev) prev.remove();
    var slot = primerCestaVacia();
    var cultOpts = '';
    try {
      if (typeof CULTIVOS_DB !== 'undefined' && CULTIVOS_DB) {
        CULTIVOS_DB.filter(function (cu) {
          return cu && cu.id && (typeof esCultivoCannabis === 'function' ? esCultivoCannabis(cu) : true);
        }).forEach(function (cu) {
          cultOpts +=
            '<option value="' +
            esc(cu.id) +
            '"' +
            (g.variedadId === cu.id ? ' selected' : '') +
            '>' +
            esc(cu.nombre || cu.id) +
            '</option>';
        });
      }
    } catch (_) {}
    var tipo =
      typeof etiquetaTipoInstalacion === 'function'
        ? etiquetaTipoInstalacion(cfg)
        : cfg.tipoInstalacion === 'rdwc'
          ? 'RDWC'
          : 'DWC';
    var o = document.createElement('div');
    o.id = 'hcGermTrasladoOverlay';
    o.className = 'checklist-pregunta-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.innerHTML =
      '<div class="checklist-pregunta-sheet hc-germ-traslado-sheet">' +
      '<div class="checklist-pregunta-handle"></div>' +
      '<div class="checklist-pregunta-head">' +
      '<div class="checklist-pregunta-emoji">💧</div>' +
      '<div><div class="checklist-pregunta-title">Trasladar al ' +
      esc(tipo) +
      '</div></div></div>' +
      '<p class="checklist-pregunta-nota-pasos">La plántula entra en la matriz con origen <strong>germinación propia</strong> y fecha de hoy. EC inicial baja (400–600 µS) hasta que enraice en el depósito.</p>' +
      '<label class="hc-germ-traslado-lbl">Variedad</label>' +
      '<select id="hcGermTrasladoVar" class="form-select hc-germ-traslado-inp">' +
      '<option value="">— Elige variedad —</option>' +
      cultOpts +
      '</select>' +
      (slot
        ? '<p class="setup-field-hint">Cesta sugerida: nivel ' +
          (slot.n + 1) +
          ', posición ' +
          (slot.c + 1) +
          '</p>'
        : '<p class="setup-box-warn">No hay cesta vacía: libera una en Cultivo e instalación o el traslado la ocupará en la primera libre.</p>') +
      '<div class="checklist-bloqueo-actions">' +
      '<button type="button" id="hcGermTrasladoOk" class="checklist-pregunta-btn-main">Confirmar traslado</button>' +
      '</div>' +
      '<button type="button" id="hcGermTrasladoCancel" class="checklist-pregunta-btn-later">Cancelar</button>' +
      '</div>';
    document.body.appendChild(o);
    if (typeof a11yDialogOpened === 'function') a11yDialogOpened(o);
    var cerrar = function () {
      try {
        if (typeof a11yDialogClosed === 'function') a11yDialogClosed(o);
      } catch (_) {}
      o.remove();
    };
    document.getElementById('hcGermTrasladoCancel').addEventListener('click', cerrar);
    document.getElementById('hcGermTrasladoOk').addEventListener('click', function () {
      var vid = String(document.getElementById('hcGermTrasladoVar')?.value || '').trim();
      if (!vid) {
        if (typeof showToast === 'function') showToast('Elige la variedad', true);
        return;
      }
      var dest = primerCestaVacia();
      if (!dest) {
        if (typeof showToast === 'function') showToast('No hay cesta vacía en el esquema', true);
        return;
      }
      if (typeof aplicarCultivoACestaUna === 'function') {
        var orSel = document.getElementById('torreAssignOrigen');
        if (orSel) orSel.value = 'germinacion';
        aplicarCultivoACestaUna(dest.n, dest.c, vid);
      } else {
        var row = state.torre[dest.n][dest.c];
        row.variedad = vid;
        row.fecha = hoyIso();
        row.origenPlanta = 'germinacion';
      }
      g.variedadId = vid;
      g.trasladoAt = new Date().toISOString();
      g.activo = false;
      persistirGerminacion();
      cerrar();
      refreshDashGerminacionHub();
      if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
      if (typeof updateDashboard === 'function') updateDashboard();
      if (typeof showToast === 'function') showToast('✓ Planta en el ' + tipo + ' · sigue con el primer llenado del depósito', false);
      setTimeout(function () {
        if (typeof goTab === 'function') goTab('sistema');
        if (typeof setTorreInteraccionModo === 'function') setTorreInteraccionModo('editar', { skipTutorial: true });
      }, 400);
    });
  }

  function renderTimeline(g, idxActual) {
    return (
      '<div class="hc-germ-rail" role="list" aria-label="Camino semilla a cubo hidro">' +
      PASOS.map(function (p, i) {
        var done = !!(g.pasos[p.id] && g.pasos[p.id].doneAt);
        var cur = i === idxActual && !done;
        var cls = 'hc-germ-rail-step';
        if (done) cls += ' hc-germ-rail-step--done';
        if (cur) cls += ' hc-germ-rail-step--current';
        return (
          '<div class="' +
          cls +
          '" role="listitem" title="' +
          esc(p.titulo) +
          '">' +
          '<span class="hc-germ-rail-dot" aria-hidden="true">' +
          (done ? '✓' : p.paso) +
          '</span>' +
          '<span class="hc-germ-rail-lbl">' +
          p.paso +
          '</span></div>'
        );
      }).join('') +
      '<div class="hc-germ-rail-fill" style="--hc-germ-pct:' +
      pctProgreso(g) +
      '%" aria-hidden="true"></div></div>'
    );
  }

  function renderDashGerminacionHub() {
    var hub = document.getElementById('dashGerminacionHub');
    if (!hub) return;
    var cfg = cfgActiva();
    if (!hcGerminacionActiva(cfg)) {
      hub.classList.add('setup-hidden');
      hub.innerHTML = '';
      return;
    }
    hub.classList.remove('setup-hidden');
    var g = ensureGerminacionFlow(cfg);
    var idx = indiceFaseActual(g);
    var pct = pctProgreso(g);
    var paso = idx < PASOS.length ? PASOS[idx] : PASOS[PASOS.length - 1];
    var allDone = fasesCompletadas(g);
    var tipo =
      typeof etiquetaTipoInstalacion === 'function'
        ? etiquetaTipoInstalacion(cfg)
        : cfg.tipoInstalacion === 'rdwc'
          ? 'RDWC'
          : 'DWC';
    var cultNombre = '';
    if (g.variedadId && typeof getCultivoDB === 'function') {
      var cu = getCultivoDB(g.variedadId);
      if (cu) cultNombre = cu.nombre || g.variedadId;
    }
    var domo = g.ultimaDomo || {};
    var modo = getModoGerminacion(cfg, g);
    var equipAviso = allDone ? '' : avisoEquipFase(paso.id, g, modo);
    var hintVar = allDone ? '' : hintVariedadFase(g.variedadId, paso.id);
    var tareaHoy = allDone ? '' : tareaDiaFase(paso.id, modo, g.variedadId);
    var diaN = diasDesdeInicio(g) + 1;
    var regHoy = registroHoyHecho(g);
    var pasoDesc = allDone ? '' : descPaso(paso, modo);
    var modoLbl =
      modo === 'hidro_directo'
        ? 'Germinación en el mismo DWC/RDWC'
        : 'Germinación con propagador / domo';
    var semMarca = '';
    try {
      var sem = cfg.semillero;
      if (sem && sem.id && sem.marca && !sem.omitido) {
        semMarca =
          '<p class="hc-germ-hub-sem">Perfil tienda: <strong>' +
          esc(sem.marca) +
          '</strong> · orientativo EC/pH (no es el domo)</p>';
      }
    } catch (_) {}

    hub.innerHTML =
      '<div class="hc-germ-hub-card">' +
      '<div class="hc-germ-hub-head">' +
      '<div class="hc-germ-hub-badge">Producto inicial</div>' +
      '<div class="hc-germ-hub-pct-ring" style="--hc-germ-pct:' +
      pct +
      '%" aria-hidden="true"><span>' +
      pct +
      '%</span></div>' +
      '<div class="hc-germ-hub-titles">' +
      '<h2 class="hc-germ-hub-title">Germinación · camino al cubo</h2>' +
      '<p class="hc-germ-hub-sub">6 fases en orden · luego traslado a <strong>' +
      esc(tipo) +
      '</strong></p>' +
      (cultNombre ? '<p class="hc-germ-hub-var">Variedad: ' + esc(cultNombre) + '</p>' : '') +
      '<p class="hc-germ-hub-modo"><span class="hc-germ-modo-pill hc-germ-modo-pill--' +
      esc(modo) +
      '">' +
      esc(modoLbl) +
      '</span> · día <strong>' +
      diaN +
      '</strong> del seguimiento</p>' +
      '<div class="hc-germ-modo-toggle" role="group" aria-label="Modo de germinación">' +
      '<button type="button" class="hc-germ-modo-btn' +
      (modo === 'propagador' ? ' hc-germ-modo-btn--on' : '') +
      '" onclick="setModoGerminacion(\'propagador\')">Propagador</button>' +
      '<button type="button" class="hc-germ-modo-btn' +
      (modo === 'hidro_directo' ? ' hc-germ-modo-btn--on' : '') +
      '" onclick="setModoGerminacion(\'hidro_directo\')">En el hidro</button></div>' +
      semMarca +
      '</div></div>' +
      renderTimeline(g, idx) +
      '<div class="hc-germ-focus' +
      (allDone ? ' hc-germ-focus--done' : '') +
      '">' +
      '<span class="hc-germ-focus-ico" aria-hidden="true">' +
      (allDone ? '🎉' : paso.icon) +
      '</span>' +
      '<div class="hc-germ-focus-body">' +
      '<div class="hc-germ-focus-kicker">' +
      (allDone ? 'Camino completo' : 'Fase ' + paso.paso + ' de ' + PASOS.length) +
      '</div>' +
      '<h3 class="hc-germ-focus-title">' +
      esc(allDone ? 'Lista para el hidro' : paso.titulo) +
      '</h3>' +
      '<p class="hc-germ-focus-desc">' +
      esc(allDone ? 'Asigna la plántula en la matriz y prepara el depósito con EC baja.' : paso.desc) +
      '</p>' +
      (equipAviso ? '<p class="hc-germ-equip-aviso" role="note">' + esc(equipAviso) + '</p>' : '') +
      (allDone
        ? ''
        : '<button type="button" class="btn btn-primary hc-germ-focus-cta" onclick="hcGerminacionCompletarFaseActual()">Marcar fase completada</button>') +
      '</div></div>' +
      '<div class="hc-germ-equip-block">' +
      '<h4 class="hc-germ-block-lbl">Equipamiento del germinador</h4>' +
      '<p class="hc-germ-equip-lead">Marca lo que tienes en casa · el semillero (breeder) del asistente es aparte.</p>' +
      '<div class="hc-germ-equip-tier">Esencial</div>' +
      '<div class="hc-germ-equip-row">' +
      renderEquipChips(EQUIP_ESENCIAL, g) +
      '</div>' +
      '<div class="hc-germ-equip-tier hc-germ-equip-tier--rec">Recomendado</div>' +
      '<div class="hc-germ-equip-row">' +
      renderEquipChips(EQUIP_RECOMENDADO, g) +
      '</div></div>' +
      '<div class="hc-germ-registro-block">' +
      '<h4 class="hc-germ-block-lbl">Registro diario · día ' +
      diaN +
      '</h4>' +
      (regHoy
        ? '<p class="hc-germ-reg-ok">✓ Ya registraste hoy. Puedes añadir otra nota si hubo cambio.</p>'
        : '<p class="hc-germ-reg-pend">Pendiente: anota lecturas y observaciones (calendario también lo recuerda).</p>') +
      '<label class="hc-germ-reg-lbl">Notas del día (humedad, luz, cambios)</label>' +
      '<textarea id="hcGermRegistroNota" class="param-input hc-germ-reg-textarea" rows="2" placeholder="Ej. ventilé el domo 5 min, cotiledón abierto…"></textarea>' +
      '<button type="button" class="btn btn-primary btn-sm hc-germ-reg-btn" onclick="guardarRegistroGerminacionDiario()">Guardar registro del día</button>' +
      renderRegistroReciente(g) +
      '</div>' +
      '<div class="hc-germ-domo-block">' +
      '<h4 class="hc-germ-block-lbl">' +
      (modo === 'hidro_directo' ? 'Monitor microclima / agua' : 'Monitor del domo') +
      '</h4>' +
      '<p class="hc-germ-domo-hint">' +
      (modo === 'hidro_directo'
        ? 'T° y HR del mini domo o sala; T° agua del depósito en Medir. Ideal 22–26 °C ambiente · HR 70–80 %.'
        : 'T° y HR del propagador (no del depósito). Ideal 22–26 °C · HR 70–80 %.') +
      '</p>' +
      '<div class="hc-germ-domo-grid">' +
      '<label class="dash-quick-field"><span class="dash-quick-label">T° domo °C</span>' +
      '<input type="number" class="param-input dash-quick-input" id="hcGermDomoTemp" inputmode="decimal" step="0.1" value="' +
      (domo.temp != null ? domo.temp : '') +
      '"></label>' +
      '<label class="dash-quick-field"><span class="dash-quick-label">HR %</span>' +
      '<input type="number" class="param-input dash-quick-input" id="hcGermDomoHr" inputmode="numeric" value="' +
      (domo.hr != null ? domo.hr : '') +
      '"></label></div>' +
      (domo.fecha
        ? '<p class="hc-germ-domo-last">Último: ' +
          esc(domo.fecha) +
          ' ' +
          esc(domo.hora || '') +
          (domo.vpd != null ? ' · VPD ' + domo.vpd + ' kPa' : '') +
          '</p>'
        : '') +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="guardarMedicionDomo()">Guardar lectura del domo</button>' +
      '</div>' +
      (allDone
        ? '<div class="hc-germ-traslado-block" id="hcGermTrasladoCta">' +
          '<button type="button" class="btn btn-secondary btn-sm" onclick="hcGerminacionAbrirChecklistTraslado()">Checklist mejora al ' +
          esc(tipo) +
          '</button>' +
          '<button type="button" class="btn btn-primary btn-lg hc-germ-traslado-btn" onclick="hcGerminacionAbrirTraslado()">Trasladar al ' +
          esc(tipo) +
          ' →</button>' +
          '<p class="hc-germ-traslado-foot">Primero el checklist del sistema; luego asignas la cesta en la matriz.</p></div>'
        : '') +
      '</div>';
  }

  function renderRegistroReciente(g) {
    var rows = (g.registroDiario || []).slice(0, 5);
    if (!rows.length) return '';
    return (
      '<ul class="hc-germ-reg-list">' +
      rows
        .map(function (r) {
          return (
            '<li><span class="hc-germ-reg-meta">Día ' +
            esc(String(r.dia || '—')) +
            ' · ' +
            esc(r.fecha || '') +
            '</span> ' +
            esc(r.nota || '(lecturas)') +
            (r.temp != null ? ' · ' + r.temp + '°C' : '') +
            (r.hr != null ? ' · HR ' + r.hr + '%' : '') +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  function hcGerminacionRefrescarCalendario() {
    try {
      if (typeof renderCalendario === 'function') renderCalendario();
    } catch (_) {}
  }

  function hcGerminacionMarcarCalendarioGrid(addEvento, mes, anio) {
    if (!hcGerminacionActiva()) return;
    var g = ensureGerminacionFlow(cfgActiva());
    if (!g.startedAt) return;
    var start = new Date(g.startedAt);
    start.setHours(0, 0, 0, 0);
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var diasMes = new Date(anio, mes + 1, 0).getDate();
    for (var d = 1; d <= diasMes; d++) {
      var dt = new Date(anio, mes, d);
      dt.setHours(0, 0, 0, 0);
      if (dt >= start && dt <= hoy) {
        addEvento(d, 'germinacion', '#059669', '🌱 Germinación activa');
      }
    }
  }

  function hcGerminacionEventosCalendario(fecha, hoy) {
    var ev = [];
    var cfg = cfgActiva();
    if (!hcGerminacionActiva(cfg)) return ev;
    var g = ensureGerminacionFlow(cfg);
    var d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    var h = new Date(hoy);
    h.setHours(0, 0, 0, 0);
    var diff = Math.round((d - h) / 86400000);
    var modo = getModoGerminacion(cfg, g);
    var idx = indiceFaseActual(g);
    var paso = idx < PASOS.length ? PASOS[idx] : null;
    var diaN = diasDesdeInicio(g) + 1;

    if (diff === 0 && paso) {
      ev.push({
        tipo: 'germinacion',
        icono: '🌱',
        titulo: 'Germinación · fase ' + paso.paso + ' (día ' + diaN + ')',
        desc: tareaDiaFase(paso.id, modo) + (registroHoyHecho(g) ? '' : ' · Registra el día en Inicio → Germinación.'),
        action: 'inicio',
      });
      if (paso.id === 'domo' || paso.id === 'semilla' || paso.id === 'taproot') {
        ev.push({
          tipo: 'germinacion',
          icono: '🫧',
          titulo: modo === 'hidro_directo' ? 'Ventilar microdomo / HR' : 'Ventilar domo 2×',
          desc: 'Abre 5 min por la mañana y al atardecer; evita condensación y moho.',
        });
      }
      if (!registroHoyHecho(g)) {
        ev.push({
          tipo: 'germinacion',
          icono: '📝',
          titulo: 'Registro diario germinación',
          desc: 'Anota T°, HR, humedad del cubo y observaciones en Inicio.',
          action: 'inicio',
        });
      }
    }

    if (g.startedAt && g.variedadId) {
      var hitos =
        typeof getGerminacionDiasHitos === 'function'
          ? getGerminacionDiasHitos(g.variedadId)
          : null;
      var spec =
        typeof getGerminacionSpecPorVariedad === 'function'
          ? getGerminacionSpecPorVariedad(g.variedadId)
          : {};
      var start = new Date(g.startedAt);
      start.setHours(0, 0, 0, 0);
      var emergD = hitos && hitos.emerg ? hitos.emerg : parseRangoDiasMedio(spec.emerg);
      var plantD = hitos && hitos.planton ? hitos.planton : parseRangoDiasMedio(spec.planton);
      var nomH = spec.nombreGenetica || g.variedadId;
      if (emergD > 0) {
        pushHito(
          ev,
          start,
          emergD,
          d,
          '🌿',
          'Hito · emergencia (' + nomH + ')',
          spec.emerg || 'Emergencia orientativa'
        );
      }
      if (plantD > 0) {
        pushHito(
          ev,
          start,
          plantD,
          d,
          '🪴',
          'Hito · plantón listo (' + nomH + ')',
          spec.planton || 'Traslado orientativo al net pot'
        );
      }
    }
    return ev;
  }

  function parseRangoDiasMedio(txt) {
    var m = String(txt || '').match(/(\d+)\s*[–-]\s*(\d+)/);
    if (m) return Math.round((parseInt(m[1], 10) + parseInt(m[2], 10)) / 2);
    m = String(txt || '').match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function pushHito(ev, start, offsetDias, d, icono, titulo, desc) {
    var hito = new Date(start);
    hito.setDate(hito.getDate() + offsetDias);
    hito.setHours(0, 0, 0, 0);
    if (hito.getTime() === d.getTime()) {
      ev.push({ tipo: 'germinacion', icono: icono, titulo: titulo, desc: desc });
    }
  }

  function hcGerminacionRenderSetupPreview() {
    var sec = document.getElementById('setupPremiumGerminacionPasos');
    if (!sec) return;
    var orig =
      typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup().origenPlanta || 'semilla' : 'semilla';
    if (orig !== 'semilla') {
      if (typeof refreshPremiumGerminacionUI === 'function') refreshPremiumGerminacionUI();
      return;
    }
    sec.innerHTML =
      '<div class="hc-germ-setup-preview setup-box-info" role="note">' +
      '<p><strong>Camino semilla → cubo (6 fases).</strong> No las marques aquí: son días de trabajo real.</p>' +
      '<p>Al guardar la instalación, <strong>Inicio</strong> activa seguimiento diario (propagador o en el mismo hidro), calendario, registro y checklist al pasar al depósito.</p>' +
      (function () {
        var p = typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup() : {};
        var vid = p && p.variedadGerminacion;
        if (!vid || typeof renderGerminacionGeneticsCardHtml !== 'function') return '';
        return (
          '<p><strong>Genética elegida:</strong></p>' + renderGerminacionGeneticsCardHtml(vid)
        );
      })() +
      '<ol class="hc-germ-setup-ol">' +
      PASOS.map(function (p) {
        return '<li><strong>' + p.paso + '.</strong> ' + esc(p.titulo) + '</li>';
      }).join('') +
      '</ol></div>';
  }

  function hcGerminacionActivarDesdeSetup() {
    var cfg = cfgActiva();
    if (typeof setupData !== 'undefined' && setupData.premium) {
      setupData.premium.origenPlanta = 'semilla';
    }
    hcGerminacionSyncDesdePremium(cfg);
    ensureGerminacionFlow(cfg).activo = true;
    ensureGerminacionFlow(cfg).startedAt = hoyIso();
  }

  global.hcGerminacionActiva = hcGerminacionActiva;
  global.hcGerminacionSyncDesdePremium = hcGerminacionSyncDesdePremium;
  global.hcGerminacionSyncEquipDesdeInstalado = hcGerminacionSyncEquipDesdeInstalado;
  global.refreshDashGerminacionHub = refreshDashGerminacionHub;
  global.hcGerminacionCompletarFaseActual = hcGerminacionCompletarFaseActual;
  global.hcGerminacionAbrirTraslado = hcGerminacionAbrirTraslado;
  global.hcGerminacionAbrirChecklistTraslado = hcGerminacionAbrirChecklistTraslado;
  global.hcGerminacionRenderSetupPreview = hcGerminacionRenderSetupPreview;
  global.hcGerminacionActivarDesdeSetup = hcGerminacionActivarDesdeSetup;
  global.hcGerminacionEventosCalendario = hcGerminacionEventosCalendario;
  global.hcGerminacionMarcarCalendarioGrid = hcGerminacionMarcarCalendarioGrid;
  global.hcGerminacionRefrescarCalendario = hcGerminacionRefrescarCalendario;
  global.setModoGerminacion = setModoGerminacion;
  global.hcGerminacionElegirVariedad = hcGerminacionElegirVariedad;
  global.toggleGermEquip = toggleGermEquip;
  global.guardarMedicionDomo = guardarMedicionDomo;
  global.guardarRegistroGerminacionDiario = guardarRegistroGerminacionDiario;
  global.ensureGerminacionFlow = ensureGerminacionFlow;
})();
