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
      semilla:
        'Mantén ~2–3 mm de agua con nutrientes en la bandeja (no seca); humedad en papel/jiffy; T° 22–26 °C.',
      taproot:
        'Misma capa fina en bandeja; no toques la radícula; prepara cubos remojados pH ~5,5.',
      rockwool: 'Bandeja húmeda sin charco; inserta cubos con cuidado.',
      domo: 'Ventila el domo 2× (5 min); comprueba que la bandeja no se haya secado; anota T° y HR.',
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

  function getCaminoGermModoFijo(cfg) {
    cfg = cfg || cfgActiva();
    var cam =
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_hidro') return 'hidro_directo';
    if (cam === 'semilla_propagador') return 'propagador';
    return null;
  }

  function modoGerminacionFijadoPorCamino(cfg) {
    return !!getCaminoGermModoFijo(cfg);
  }

  function getModoGerminacion(cfg, g) {
    cfg = cfg || cfgActiva();
    g = g || ensureGerminacionFlow(cfg);
    var fijo = getCaminoGermModoFijo(cfg);
    if (fijo) return fijo;
    if (g.modo === 'propagador' || g.modo === 'hidro_directo') return g.modo;
    var pref =
      cfg.premiumSetup && cfg.premiumSetup.germinacionModoPreferido
        ? String(cfg.premiumSetup.germinacionModoPreferido)
        : '';
    if (pref === 'hidro_directo' || pref === 'hidro') return 'hidro_directo';
    if (pref === 'propagador') return 'propagador';
    return 'propagador';
  }

  function setModoGerminacion(modo) {
    var cfg = cfgActiva();
    if (modoGerminacionFijadoPorCamino(cfg)) {
      if (typeof showToast === 'function') {
        showToast('El modo viene del camino elegido en el asistente (no se puede cambiar aquí).', false);
      }
      refreshDashGerminacionHub();
      return;
    }
    var g = ensureGerminacionFlow(cfg);
    g.modo = modo === 'hidro_directo' ? 'hidro_directo' : 'propagador';
    persistirGerminacion();
    refreshDashGerminacionHub();
  }

  function pasoDisplay(paso, modo) {
    if (!paso || paso.id !== 'dwc') return paso;
    if (modo === 'hidro_directo') {
      return {
        id: paso.id,
        paso: paso.paso,
        titulo: 'Cerrar germinación · lista para matriz',
        desc:
          'Plántula estable en net pot. Confirma checklist de traslado y asigna la cesta; luego cierra DWC/RDWC en el asistente.',
        icon: '✅',
      };
    }
    return paso;
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

  function diasEnFaseActual(g, idx) {
    if (idx == null || idx < 0) return 0;
    var iso = null;
    if (idx <= 0) {
      iso = g.startedAt;
    } else {
      var prev = g.pasos[PASOS[idx - 1].id];
      iso = (prev && prev.doneAt) || g.startedAt;
    }
    if (!iso) return 0;
    try {
      var a = new Date(iso);
      var b = new Date();
      a.setHours(0, 0, 0, 0);
      b.setHours(0, 0, 0, 0);
      return Math.max(0, Math.round((b - a) / 86400000));
    } catch (_) {
      return 0;
    }
  }

  function renderFasesCalendarioBlock(g, idx, diaN, allDone) {
    if (allDone || typeof renderGerminacionFasesCalendarioHtml !== 'function') return '';
    var ref = g.variedadId || '';
    var paso = idx < PASOS.length ? PASOS[idx] : null;
    return renderGerminacionFasesCalendarioHtml(ref, {
      faseId: paso ? paso.id : '',
      diasEnFase: diasEnFaseActual(g, idx),
      diaSeguimiento: diaN,
    });
  }

  function registroHoyHecho(g) {
    if (!Array.isArray(g.registroDiario)) return false;
    var iso = hoyIso();
    return registroHechoEnFecha(g, iso);
  }

  function registroHechoEnFecha(g, fechaIsoOrDate) {
    if (!Array.isArray(g.registroDiario) || !g.registroDiario.length) return false;
    var iso = '';
    if (typeof fechaIsoOrDate === 'string') {
      iso = fechaIsoOrDate.slice(0, 10);
    } else if (fechaIsoOrDate instanceof Date) {
      iso = fechaIsoOrDate.toISOString().slice(0, 10);
    }
    if (!iso) return false;
    return g.registroDiario.some(function (r) {
      return r && String(r.fechaIso || '').slice(0, 10) === iso;
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
        registroDiario: [],
        checklistTraslado: {},
        checklistTrasladoOk: false,
        numSemillas: 1,
        semillasActivas: 1,
      };
    }
    const g = cfg.germinacionFlow;
    if (!g.pasos || typeof g.pasos !== 'object') g.pasos = {};
    if (!g.equip || typeof g.equip !== 'object') g.equip = {};
    if (!Array.isArray(g.registroDiario)) g.registroDiario = [];
    if (!g.checklistTraslado || typeof g.checklistTraslado !== 'object') {
      g.checklistTraslado = {};
    }
    if (!Number.isFinite(g.numSemillas) || g.numSemillas < 1) g.numSemillas = 1;
    if (!Number.isFinite(g.semillasActivas) || g.semillasActivas < 0) {
      g.semillasActivas = g.numSemillas;
    }
    if (!Array.isArray(g.nutrientesAplicados)) g.nutrientesAplicados = [];
    migrateChecklistLegacy(cfg, g);
    return g;
  }

  function diasObjetivoConclusionGerm(cfg, g) {
    g = g || ensureGerminacionFlow(cfg);
    var hitos =
      g.variedadId && typeof getGerminacionDiasHitos === 'function'
        ? getGerminacionDiasHitos(g.variedadId)
        : null;
    var spec =
      g.variedadId && typeof getGerminacionSpecPorVariedad === 'function'
        ? getGerminacionSpecPorVariedad(g.variedadId)
        : {};
    var plantD = hitos && hitos.planton ? hitos.planton : parseRangoDiasMedio(spec.planton);
    if (plantD > 0) return plantD;
    return 12;
  }

  /** Propagador: conclusión por días (o marca manual). Hidro directo: 6 fases + checklist. */
  function germinacionConcluida(cfg) {
    cfg = cfg || cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    if (g.concluidaAt) return true;
    var cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    if (cam === 'semilla_propagador') {
      if (!g.startedAt) return false;
      var dias = diasDesdeInicio(g) + 1;
      return dias >= diasObjetivoConclusionGerm(cfg, g);
    }
    return fasesCompletadas(g);
  }

  function hcGerminacionMarcarConcluida() {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    g.concluidaAt = new Date().toISOString();
    persistirGerminacion();
    if (typeof showToast === 'function') {
      showToast(
        '✓ Germinación marcada como concluida · configura el sistema hidropónico para el traslado',
        false,
        { durationMs: 6200, prominent: true }
      );
    }
    refreshDashGerminacionHub();
    if (typeof hcGerminacionRefrescarCalendario === 'function') hcGerminacionRefrescarCalendario();
    if (typeof hcRefreshSistemaPropagadorPanel === 'function') hcRefreshSistemaPropagadorPanel();
    if (typeof refreshInstalacionLifecycleUi === 'function') refreshInstalacionLifecycleUi();
    if (typeof actualizarPostSetupChecklistRail === 'function') actualizarPostSetupChecklistRail();
    if (typeof aplicarVisibilidadTabsCamino === 'function') aplicarVisibilidadTabsCamino();
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
    if (!cfg) return;
    var camSync =
      (typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '') ||
      cfg.caminoCultivo ||
      (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) ||
      '';
    if (!origenEsSemilla(cfg)) {
      if (camSync === 'semilla_propagador' || camSync === 'semilla_hidro') {
        cfg.origenPlanta =
          typeof normalizarOrigenPlanta === 'function'
            ? normalizarOrigenPlanta(
                (cfg.premiumSetup && cfg.premiumSetup.origenPlanta) || cfg.origenPlanta || 'semilla'
              )
            : 'germinacion';
        if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = {};
        if (!cfg.premiumSetup.origenPlanta) cfg.premiumSetup.origenPlanta = 'semilla';
      } else {
        if (cfg.germinacionFlow) cfg.germinacionFlow.activo = false;
        return;
      }
    }
    const g = ensureGerminacionFlow(cfg);
    g.modo = getModoGerminacion(cfg, g);
    if (!g.trasladoAt) g.activo = true;
    if (!g.startedAt && g.activo) g.startedAt = hoyIso();
    if (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) {
      g.variedadId = cfg.premiumSetup.variedadGerminacion;
    }
    if (cfg.premiumSetup && Number.isFinite(cfg.premiumSetup.numSemillasGerm)) {
      g.numSemillas = Math.min(72, Math.max(1, Math.round(cfg.premiumSetup.numSemillasGerm)));
      if (!Number.isFinite(g.semillasActivas) || g.semillasActivas < 1 || g.semillasActivas > g.numSemillas) {
        g.semillasActivas = g.numSemillas;
      }
    }
    if (cfg.premiumSetup && cfg.premiumSetup.sustratoGerm) {
      g.sustratoGerm = cfg.premiumSetup.sustratoGerm;
    }
    if (cfg.sustratoGerm) g.sustratoGerm = cfg.sustratoGerm;
    var premN = cfg.premiumSetup || {};
    var nid = String(g.nutrienteId || premN.nutrienteGerm || cfg.nutriente || '').trim();
    if (nid) {
      g.nutrienteId = nid;
      cfg.nutriente = nid;
      if (!cfg.premiumSetup || typeof cfg.premiumSetup !== 'object') cfg.premiumSetup = premN;
      cfg.premiumSetup.nutrienteGerm = nid;
    }
    var volN = Number(
      g.nutrienteGermVolL != null ? g.nutrienteGermVolL : premN.nutrienteGermVolL
    );
    if (Number.isFinite(volN) && volN > 0) {
      g.nutrienteGermVolL = volN;
      cfg.premiumSetup.nutrienteGermVolL = volN;
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

  /** Anillo del hub en propagador: avance por días hacia el objetivo genética (no las 6 fases). */
  function pctProgresoPropagadorDias(cfg, g) {
    g = g || ensureGerminacionFlow(cfg);
    if (!g.startedAt) return 0;
    if (typeof germinacionConcluida === 'function' && germinacionConcluida(cfg)) return 100;
    var obj = diasObjetivoConclusionGerm(cfg, g);
    if (obj < 1) return 0;
    var dias = diasDesdeInicio(g) + 1;
    return Math.min(100, Math.round((dias / obj) * 100));
  }

  function persistirGerminacion() {
    try {
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
    try {
      if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
    } catch (_) {}
    try {
      if (typeof renderCalendario === 'function' && document.getElementById('tab-calendario')?.classList.contains('active')) {
        renderCalendario();
      }
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
    var bloqueo =
      typeof hcGerminacionBloqueada === 'function'
        ? hcGerminacionBloqueada(cfg)
        : typeof hcGerminacionBloqueadaPorMontaje === 'function' && hcGerminacionBloqueadaPorMontaje(cfg)
          ? 'propagador'
          : '';
    if (bloqueo) {
      if (typeof showToast === 'function') {
        if (bloqueo === 'sala_config') {
          showToast('Primero configura la sala en el asistente (carpa, LED, extractor).', true);
          if (typeof abrirSetupFaseSala === 'function') setTimeout(abrirSetupFaseSala, 400);
        } else if (bloqueo === 'sala_montaje') {
          showToast('Completa el checklist de montaje de sala en la pestaña Sala.', true);
          if (typeof hcIrMontajeSala === 'function') setTimeout(hcIrMontajeSala, 400);
        } else if (bloqueo === 'traslado') {
          showToast('Marca el checklist de traslado antes del depósito y del asistente DWC/RDWC.', true);
          if (typeof hcGerminacionAbrirChecklistTraslado === 'function') hcGerminacionAbrirChecklistTraslado();
        } else if (bloqueo === 'hidro_config') {
          showToast('Configura DWC/RDWC en el asistente antes de las 6 fases.', true);
          if (typeof abrirSetupFaseHidro === 'function') setTimeout(abrirSetupFaseHidro, 400);
        } else if (bloqueo === 'deposito_llenado') {
          showToast('Completa el primer llenado del depósito (checklist) para iniciar la germinación.', true);
          if (typeof hcGateChecklistDeposito === 'function' && !hcGateChecklistDeposito({})) {
            if (typeof abrirChecklist === 'function') setTimeout(function () { abrirChecklist(false); }, 400);
          }
        } else if (bloqueo === 'plan_germ') {
          showToast('Define genética, semillas y sustrato en el checklist del propagador.', true);
          if (typeof hcOpenPropagadorMontajeChecklist === 'function') hcOpenPropagadorMontajeChecklist();
        } else {
          showToast('Primero completa el checklist del propagador o prep hidro (arriba).', true);
          if (typeof hcOpenPropagadorMontajeChecklist === 'function') hcOpenPropagadorMontajeChecklist();
        }
      } else if (bloqueo === 'propagador' && typeof hcOpenPropagadorMontajeChecklist === 'function') {
        hcOpenPropagadorMontajeChecklist();
      }
      return;
    }
    const g = ensureGerminacionFlow(cfg);
    const idx = indiceFaseActual(g);
    if (idx >= PASOS.length) {
      if (typeof showToast === 'function') showToast('Todas las fases están completadas', false);
      return;
    }
    const modoAct = getModoGerminacion(cfg, g);
    const paso = PASOS[idx];
    if (paso.id === 'dwc' && !g.checklistTrasladoOk) {
      if (typeof showToast === 'function') {
        showToast('Marca el checklist de traslado antes de cerrar la fase 6.', true);
      }
      if (typeof hcGerminacionAbrirChecklistTraslado === 'function') hcGerminacionAbrirChecklistTraslado();
      return;
    }
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
    var camDone = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfgActiva()) : '';
    if (camDone === 'semilla_propagador' && typeof germinacionConcluida === 'function' && germinacionConcluida(cfgActiva())) {
      if (typeof showToast === 'function') {
        showToast('Germinación concluida · configura el sistema hidropónico en Sistema o el botón del hub', false, {
          durationMs: 6800,
        });
      }
    } else if (fasesCompletadas(g)) {
      setTimeout(function () {
        try {
          document.getElementById('hcGermTrasladoCta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (_) {}
        if (!g.checklistTrasladoOk) hcGerminacionAbrirChecklistTraslado();
      }, 900);
    }
  }

  function syncGerminacionRegistroAHistorial(opts) {
    if (typeof addRegistro !== 'function' || !opts) return;
    var paso = null;
    for (var i = 0; i < PASOS.length; i++) {
      if (PASOS[i].id === opts.faseId) {
        paso = PASOS[i];
        break;
      }
    }
    addRegistro('germinacion', {
      icono: paso ? paso.icon : '🌱',
      faseId: opts.faseId || '',
      fasePaso: paso ? paso.paso : null,
      faseTitulo: paso ? paso.titulo : '',
      diaSeguimiento: opts.dia,
      tempDomo: opts.temp != null ? opts.temp : '',
      hrDomo: opts.hr != null ? opts.hr : '',
      notas: opts.nota || opts.notas || '',
      germSubtipo: opts.subtipo || 'diario',
    });
    if (typeof renderRegistro === 'function') renderRegistro();
  }

  function guardarRegistroGerminacionDiario() {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    var nota = String(document.getElementById('hcGermRegistroNota')?.value || '').trim();
    var t = parseFloat(String(document.getElementById('hcGermDomoTemp')?.value || '').replace(',', '.'));
    var h = parseFloat(String(document.getElementById('hcGermDomoHr')?.value || '').replace(',', '.'));
    var idx = indiceFaseActual(g);
    var faseId = idx < PASOS.length ? PASOS[idx].id : 'dwc';
    var diaN = diasDesdeInicio(g) + 1;
    var nutProd = String(document.getElementById('hcGermNutProducto')?.value || '').trim();
    var nutEc = parseFloat(String(document.getElementById('hcGermNutEc')?.value || '').replace(',', '.'));
    var nutPh = parseFloat(String(document.getElementById('hcGermNutPh')?.value || '').replace(',', '.'));
    var nutMl = parseFloat(String(document.getElementById('hcGermNutMl')?.value || '').replace(',', '.'));
    var entry = {
      fechaIso: hoyIso(),
      fecha: hoyDisplay(),
      hora: horaDisplay(),
      faseId: faseId,
      dia: diaN,
      nota: nota,
      temp: Number.isFinite(t) ? t : null,
      hr: Number.isFinite(h) ? h : null,
      nutProducto: nutProd,
      nutEc: Number.isFinite(nutEc) ? nutEc : null,
      nutPh: Number.isFinite(nutPh) ? nutPh : null,
      nutMl: Number.isFinite(nutMl) ? nutMl : null,
    };
    g.registroDiario.unshift(entry);
    if (nutProd || Number.isFinite(nutEc) || Number.isFinite(nutPh) || Number.isFinite(nutMl)) {
      g.nutrientesAplicados.unshift({
        fechaIso: entry.fechaIso,
        fecha: entry.fecha,
        producto: nutProd,
        ec: entry.nutEc,
        ph: entry.nutPh,
        ml: entry.nutMl,
        nota: nota,
      });
      if (g.nutrientesAplicados.length > 40) g.nutrientesAplicados.length = 40;
    }
    if (g.registroDiario.length > 90) g.registroDiario.length = 90;
    persistirGerminacion();
    syncGerminacionRegistroAHistorial({
      faseId: faseId,
      dia: diaN,
      temp: Number.isFinite(t) ? t : null,
      hr: Number.isFinite(h) ? h : null,
      nota: nota,
      subtipo: 'diario',
    });
    if (typeof showToast === 'function') {
      var toastParts = ['Registro del día guardado · día ' + diaN];
      if (typeof evalGerminacionMedicion === 'function') {
        var vidR = String(g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || '').trim();
        if (Number.isFinite(t)) toastParts.push(evalGerminacionMedicion('temp', t, vidR, faseId, cfg).desfaseTxt);
        if (Number.isFinite(h)) toastParts.push(evalGerminacionMedicion('hr', h, vidR, faseId, cfg).desfaseTxt);
        if (Number.isFinite(nutEc)) toastParts.push(evalGerminacionMedicion('ec', nutEc, vidR, faseId, cfg).desfaseTxt);
        if (Number.isFinite(nutPh)) toastParts.push(evalGerminacionMedicion('ph', nutPh, vidR, faseId, cfg).desfaseTxt);
      }
      showToast(toastParts.join(' · '), false);
    }
    refreshDashGerminacionHub();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof hcRefreshSistemaPropagadorPanel === 'function') hcRefreshSistemaPropagadorPanel();
    if (typeof aplicarVisibilidadTabsCamino === 'function') aplicarVisibilidadTabsCamino();
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
      var toastDomo = ['Registro del domo guardado'];
      if (typeof evalGerminacionMedicion === 'function') {
        var vidD = String(g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || '').trim();
        var faseD = typeof hcGerminacionFaseActualId === 'function' ? hcGerminacionFaseActualId(cfg) : 'semilla';
        if (Number.isFinite(t)) toastDomo.push(evalGerminacionMedicion('temp', t, vidD, faseD, cfg).desfaseTxt);
        if (Number.isFinite(h)) toastDomo.push(evalGerminacionMedicion('hr', h, vidD, faseD, cfg).desfaseTxt);
      }
      showToast(toastDomo.join(' · '), false);
    }
    refreshDashGerminacionHub();
    if (typeof updateDashboard === 'function') updateDashboard();
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
      var camTr =
        typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
      if (
        typeof hcCaminoRequiereConfigHidroPendiente === 'function' &&
        hcCaminoRequiereConfigHidroPendiente(cfg)
      ) {
        setTimeout(function () {
          if (typeof showToast === 'function') {
            showToast(
              camTr === 'semilla_hidro'
                ? 'Fase 2: cierra DWC/RDWC en el asistente (germinación en depósito ya hecha). Luego puntos hidro en montaje.'
                : 'Fase 2: configura DWC/RDWC y puntos de sistema en montaje; sin repetir germinación en el depósito.',
              false,
              { durationMs: 5600 }
            );
          }
          if (typeof abrirSetupFaseHidro === 'function') abrirSetupFaseHidro();
        }, 900);
      } else {
        setTimeout(function () {
          if (typeof goTab === 'function') goTab('sistema');
          if (typeof setTorreInteraccionModo === 'function') setTorreInteraccionModo('editar', { skipTutorial: true });
        }, 400);
      }
    });
  }

  function renderTimeline(g, idxActual, modo) {
    modo = modo || 'propagador';
    return (
      '<div class="hc-germ-rail" role="list" aria-label="Camino semilla a cubo hidro">' +
      PASOS.map(function (p, i) {
        var pd = pasoDisplay(p, modo);
        var done = !!(g.pasos[p.id] && g.pasos[p.id].doneAt);
        var cur = i === idxActual && !done;
        var cls = 'hc-germ-rail-step';
        if (done) cls += ' hc-germ-rail-step--done';
        if (cur) cls += ' hc-germ-rail-step--current';
        return (
          '<div class="' +
          cls +
          '" role="listitem" title="' +
          esc(pd.titulo) +
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
    if (typeof refreshMontajeInicioHubVisibility === 'function') {
      refreshMontajeInicioHubVisibility(cfgActiva());
    }
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
    var camGermHub = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    var pct =
      camGermHub === 'semilla_propagador' ? pctProgresoPropagadorDias(cfg, g) : pctProgreso(g);
    var pctRingLbl =
      camGermHub === 'semilla_propagador'
        ? (typeof germinacionConcluida === 'function' && germinacionConcluida(cfg)
            ? 'OK'
            : 'd' + (diasDesdeInicio(g) + 1))
        : pct + '%';
    var modo = getModoGerminacion(cfg, g);
    var pasoRaw = idx < PASOS.length ? PASOS[idx] : PASOS[PASOS.length - 1];
    var paso = pasoDisplay(pasoRaw, modo);
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
    var nSemHub = 0;
    if (typeof hcNumSemillasGermConfig === 'function') {
      nSemHub = hcNumSemillasGermConfig(cfg);
    }
    if (!nSemHub && typeof getPlanGermEstado === 'function') {
      var stHub = getPlanGermEstado(cfg);
      if (stHub && stHub.numSemillas) nSemHub = stHub.numSemillas;
    }
    if (!nSemHub) {
      nSemHub = Math.min(
        72,
        Math.max(0, Math.round(Number(g.numSemillas || (cfg.premiumSetup && cfg.premiumSetup.numSemillasGerm) || 0)))
      );
    }
    var domo = g.ultimaDomo || {};
    var vidGermHub = String(
      g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || ''
    ).trim();
    var faseGermHub =
      typeof hcGerminacionFaseActualId === 'function' ? hcGerminacionFaseActualId(cfg) : paso.id;
    var rangosGermHub =
      typeof getGerminacionRangosMonitoreo === 'function'
        ? getGerminacionRangosMonitoreo(vidGermHub, faseGermHub, cfg)
        : null;
    var domoHintTxt =
      modo === 'hidro_directo'
        ? 'T° y HR del mini domo o sala'
        : 'T° y HR del propagador (no del depósito)';
    if (rangosGermHub) {
      domoHintTxt +=
        '. Objetivo según genética: <strong>' +
        rangosGermHub.temp.min +
        '–' +
        rangosGermHub.temp.max +
        ' °C</strong> · HR <strong>' +
        rangosGermHub.hr.min +
        '–' +
        rangosGermHub.hr.max +
        ' %</strong>';
      if (
        faseGermHub !== 'semilla' &&
        faseGermHub !== 'taproot' &&
        rangosGermHub.ecAplica &&
        rangosGermHub.ec &&
        Number.isFinite(rangosGermHub.ecObjetivo)
      ) {
        domoHintTxt +=
          ' · EC ~<strong>' +
          rangosGermHub.ecObjetivo +
          ' µS</strong> · pH <strong>' +
          rangosGermHub.phObjetivo +
          '</strong>';
      } else if (rangosGermHub.sustrato && rangosGermHub.sustrato.id === 'papel') {
        domoHintTxt += ' · En papel prioriza humedad; mide pH/EC al pasar a cubo.';
      }
      domoHintTxt += '. Al medir verás el desfase respecto a estos rangos.';
    } else {
      domoHintTxt += '. Ideal 22–26 °C · HR 70–80 %.';
    }
    var rangosPanelHtml =
      typeof renderGerminacionRangosPanelHtml === 'function' ? renderGerminacionRangosPanelHtml(cfg) : '';
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

    var propInline =
      typeof renderPropagadorMontajeInlineHtml === 'function' ? renderPropagadorMontajeInlineHtml() : '';
    var camGerm =
      typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    var bloqueoSala = typeof hcGerminacionBloqueada === 'function' ? hcGerminacionBloqueada(cfg) : '';
    var salaCtaHtml = '';
    if (bloqueoSala === 'hidro_config') {
      salaCtaHtml =
        '<div class="hc-germ-sala-cta setup-field-hint setup-field-hint--banner">' +
        '<strong>' +
        (camGerm === 'semilla_propagador'
          ? 'Germinación concluida · Sistema hidropónico'
          : 'Semilla en hidro · sistema') +
        '</strong> ' +
        (camGerm === 'semilla_propagador'
          ? 'Configura DWC/RDWC para el traslado desde el propagador. La pestaña Sistema mostrará el esquema hidro al guardar.'
          : 'Cierra DWC/RDWC en el asistente antes de las 6 fases.') +
        ' ' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirSetupFaseHidro===\'function\'&&abrirSetupFaseHidro()">Configurar sistema</button></div>';
    } else if (bloqueoSala === 'deposito_llenado') {
      salaCtaHtml =
        '<div class="hc-germ-sala-cta setup-field-hint setup-field-hint--banner">' +
        '<strong>Primer llenado.</strong> Completa el checklist del depósito para iniciar la germinación en el cubo. ' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirChecklist===\'function\'&&abrirChecklist(false)">Checklist depósito</button></div>';
    } else if (bloqueoSala === 'sala_config') {
      salaCtaHtml =
        '<div class="hc-germ-sala-cta setup-field-hint setup-field-hint--banner">' +
        '<strong>' +
        (camGerm === 'semilla_propagador' ? 'Sala (opcional).' : 'Sala.') +
        '</strong> Configura carpa, LED y extractor' +
        (camGerm === 'semilla_propagador' ? ' si quieres antes del traslado' : ' antes de las 6 fases') +
        '. ' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirConfiguradorEquipamientoSalaPropagador===\'function\'?abrirConfiguradorEquipamientoSalaPropagador():(typeof abrirSetupFaseSala===\'function\'&&abrirSetupFaseSala())">Configurar sala</button></div>';
    } else if (bloqueoSala === 'sala_montaje') {
      salaCtaHtml =
        '<div class="hc-germ-sala-cta setup-field-hint setup-field-hint--banner">' +
        '<strong>Montaje de sala.</strong> Verifica el checklist en la pestaña Sala. ' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof hcIrMontajeSala===\'function\'&&hcIrMontajeSala()">Ir a montaje</button></div>';
    } else if (bloqueoSala === 'traslado') {
      salaCtaHtml =
        '<div class="hc-germ-sala-cta setup-field-hint setup-field-hint--banner">' +
        '<strong>Checklist de traslado.</strong> Obligatorio antes del asistente DWC/RDWC y el depósito. ' +
        '<button type="button" class="btn btn-primary btn-sm" onclick="typeof hcGerminacionAbrirChecklistTraslado===\'function\'&&hcGerminacionAbrirChecklistTraslado()">Abrir checklist</button></div>';
    }

    hub.innerHTML =
      '<div class="hc-germ-hub-card">' +
      (propInline || '') +
      salaCtaHtml +
      '<div class="hc-germ-hub-head">' +
      '<div class="hc-germ-hub-badge">Producto inicial</div>' +
      '<div class="hc-germ-hub-pct-ring" style="--hc-germ-pct:' +
      pct +
      '%" aria-hidden="true"><span>' +
      esc(pctRingLbl) +
      '</span></div>' +
      '<div class="hc-germ-hub-titles">' +
      '<h2 class="hc-germ-hub-title">Germinación · camino al cubo</h2>' +
      '<p class="hc-germ-hub-sub">' +
      (camGerm === 'semilla_propagador'
        ? '<strong>App de propagador:</strong> ~2–3 mm agua+nutrientes en bandeja (no seca) · registro diario (T°, HR) → hidro → traslado'
        : 'Prep + sala + sistema + depósito → <strong>6 fases</strong> en el cubo → traslado al ' +
          esc(tipo || 'DWC/RDWC')) +
      '</p>' +
      (cultNombre || (camGerm === 'semilla_propagador' && nSemHub >= 1)
        ? '<p class="hc-germ-hub-var">' +
          (cultNombre ? 'Variedad: ' + esc(cultNombre) : '') +
          (camGerm === 'semilla_propagador' && nSemHub >= 1
            ? (cultNombre ? ' · ' : '') + '<strong>' + nSemHub + ' semilla' + (nSemHub === 1 ? '' : 's') + '</strong>'
            : '') +
          '</p>'
        : '') +
      '<p class="hc-germ-hub-modo"><span class="hc-germ-modo-pill hc-germ-modo-pill--' +
      esc(modo) +
      '">' +
      esc(modoLbl) +
      '</span> · día <strong>' +
      diaN +
      '</strong> del seguimiento</p>' +
      (camGerm === 'semilla_propagador'
        ? '<p class="hc-germ-prop-hint setup-field-hint" role="note">' +
          '<strong>Guía de 6 fases (opcional):</strong> el cierre de germinación va por <strong>días según genética</strong> (~' +
          diasObjetivoConclusionGerm(cfg, g) +
          ') o el botón «Dar por concluida» más abajo. No hace falta marcar todas las fases del rail.</p>'
        : '') +
      (modoGerminacionFijadoPorCamino(cfg)
        ? '<p class="hc-germ-modo-fijo setup-field-hint">Modo fijado por tu camino en el asistente.</p>'
        : '<div class="hc-germ-modo-toggle" role="group" aria-label="Modo de germinación">' +
          '<button type="button" class="hc-germ-modo-btn' +
          (modo === 'propagador' ? ' hc-germ-modo-btn--on' : '') +
          '" onclick="setModoGerminacion(\'propagador\')">Propagador</button>' +
          '<button type="button" class="hc-germ-modo-btn' +
          (modo === 'hidro_directo' ? ' hc-germ-modo-btn--on' : '') +
          '" onclick="setModoGerminacion(\'hidro_directo\')">En el hidro</button></div>') +
      semMarca +
      '</div></div>' +
      renderTimeline(g, idx, modo) +
      renderFasesCalendarioBlock(g, idx, diaN, allDone) +
      (modo === 'propagador' ? renderGermTrayViz(g) : '') +
      '<div class="hc-germ-focus' +
      (allDone ? ' hc-germ-focus--done' : '') +
      '">' +
      '<span class="hc-germ-focus-ico" aria-hidden="true">' +
      (allDone ? '🎉' : paso.icon) +
      '</span>' +
      '<div class="hc-germ-focus-body">' +
      '<div class="hc-germ-focus-kicker">' +
      (allDone
        ? 'Camino completo'
        : camGerm === 'semilla_propagador'
          ? 'Guía opcional · fase ' + paso.paso + ' de ' + PASOS.length
          : 'Fase ' + paso.paso + ' de ' + PASOS.length) +
      '</div>' +
      '<h3 class="hc-germ-focus-title">' +
      esc(allDone ? 'Lista para el hidro' : paso.titulo) +
      '</h3>' +
      '<p class="hc-germ-focus-desc">' +
      esc(allDone ? 'Asigna la plántula en la matriz y prepara el depósito con EC baja.' : pasoDesc) +
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
      '<div class="hc-germ-nut-grid">' +
      '<label class="dash-quick-field"><span class="dash-quick-label">Nutriente / producto</span>' +
      '<input type="text" class="param-input dash-quick-input" id="hcGermNutProducto" placeholder="Ej. CalMag, enraizador…" maxlength="80"></label>' +
      '<label class="dash-quick-field"><span class="dash-quick-label">EC µS/cm</span>' +
      '<input type="number" class="param-input dash-quick-input" id="hcGermNutEc" inputmode="decimal" step="10" placeholder="400"></label>' +
      '<label class="dash-quick-field"><span class="dash-quick-label">pH</span>' +
      '<input type="number" class="param-input dash-quick-input" id="hcGermNutPh" inputmode="decimal" step="0.1" placeholder="5.8"></label>' +
      '<label class="dash-quick-field"><span class="dash-quick-label">ml / L</span>' +
      '<input type="number" class="param-input dash-quick-input" id="hcGermNutMl" inputmode="decimal" step="0.1" placeholder="1"></label></div>' +
      '<p class="setup-field-hint hc-germ-nut-hint">Opcional: lo que añadiste al agua del propagador (no es el depósito DWC).</p>' +
      '<div id="hcGermMedEvalHost" class="hc-germ-med-eval-host" aria-live="polite"></div>' +
      '<button type="button" class="btn btn-primary btn-sm hc-germ-reg-btn" onclick="guardarRegistroGerminacionDiario()">Guardar registro del día</button>' +
      (camGerm === 'semilla_propagador'
        ? '<div class="hc-germ-concluir-block">' +
          (typeof germinacionConcluida === 'function' && germinacionConcluida(cfg)
            ? '<p class="hc-germ-concluir-ok">✓ Germinación concluida' +
              (g.concluidaAt ? ' (marcada manualmente)' : ' (días según genética)') +
              '. Siguiente: <button type="button" class="btn btn-primary btn-sm" onclick="typeof abrirSetupFaseHidro===\'function\'&&abrirSetupFaseHidro()">Configurar DWC/RDWC</button></p>'
            : '<p class="setup-field-hint">Objetivo orientativo: día <strong>' +
              diasObjetivoConclusionGerm(cfg, g) +
              '</strong>. Puedes darla por concluida antes si las plántulas están listas.</p>' +
              '<button type="button" class="btn btn-secondary btn-sm" onclick="hcGerminacionMarcarConcluida()">Dar germinación por concluida</button>') +
          '</div>'
        : '') +
      renderRegistroReciente(g) +
      '</div>' +
      '<div class="hc-germ-domo-block">' +
      '<h4 class="hc-germ-block-lbl">' +
      (modo === 'hidro_directo' ? 'Monitor microclima / agua' : 'Monitor del domo') +
      '</h4>' +
      rangosPanelHtml +
      '<p class="hc-germ-domo-hint">' +
      domoHintTxt +
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
      (camGerm === 'semilla_propagador' &&
      typeof germinacionConcluida === 'function' &&
      germinacionConcluida(cfg) &&
      typeof hcCaminoRequiereConfigHidroPendiente === 'function' &&
      hcCaminoRequiereConfigHidroPendiente(cfg)
        ? '<div class="hc-germ-traslado-block" id="hcGermTrasladoCta">' +
          '<p class="hc-germ-traslado-lead"><strong>Paso siguiente:</strong> configura el sistema hidropónico (cestas según semillas). Luego checklist de traslado.</p>' +
          '<button type="button" class="btn btn-primary btn-lg" onclick="typeof abrirSetupFaseHidro===\'function\'&&abrirSetupFaseHidro()">Configurar DWC/RDWC</button></div>'
        : allDone
          ? '<div class="hc-germ-traslado-block" id="hcGermTrasladoCta">' +
            '<button type="button" class="btn btn-secondary btn-sm" onclick="hcGerminacionAbrirChecklistTraslado()">Checklist mejora al ' +
            esc(tipo) +
            '</button>' +
            '<button type="button" class="btn btn-primary btn-lg hc-germ-traslado-btn" onclick="hcGerminacionAbrirTraslado()">Trasladar al ' +
            esc(tipo) +
            ' →</button>' +
            '<p class="hc-germ-traslado-foot">Siguiente: asistente DWC/RDWC (sin repetir germinación en el depósito) y asignar la cesta.</p></div>'
          : '') +
      '</div>';
    try {
      if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
    } catch (_) {}
    try {
      if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner(cfg);
    } catch (_) {}
    try {
      if (typeof refreshTabsOperativaCamino === 'function') refreshTabsOperativaCamino();
      else if (typeof aplicarVisibilidadTabsCamino === 'function') aplicarVisibilidadTabsCamino();
    } catch (_) {}
    if (typeof hcBindGerminacionMedInputs === 'function') hcBindGerminacionMedInputs(cfg);
    if (typeof hcRefreshGerminacionMedEvaluacion === 'function') hcRefreshGerminacionMedEvaluacion(cfg);
  }

  function renderRegistroReciente(g) {
    var rows = (g.registroDiario || []).slice(0, 8);
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

  function sustratoGermKey(cfg, g) {
    return (
      (g && g.sustratoGerm) ||
      (cfg && cfg.sustratoGerm) ||
      (cfg && cfg.premiumSetup && cfg.premiumSetup.sustratoGerm) ||
      'lana'
    );
  }

  function etiquetaSustratoGermLocal(key) {
    if (typeof etiquetaSustratoGerm === 'function') return etiquetaSustratoGerm(key);
    var map = { lana: 'Lana de roca', esponja: 'Jiffy / esponja', papel: 'Papel húmedo', coco: 'Coco / plug' };
    return map[key] || key || '—';
  }

  function dimsBandejaPropagador(cfg, g, semillas) {
    var prem = (cfg && cfg.premiumSetup) || {};
    var bandeja = prem.bandejaGerm || 'auto';
    var cap = 77;
    if (bandeja === '24') cap = 24;
    else if (bandeja === '84') cap = 84;
    else if (bandeja === '77') cap = 77;
    else if (typeof PROPAGADOR_CAPACIDAD_ES === 'object' && cfg) {
      var inst = cfg.equipamientoInstalado || {};
      var prop = inst.propagador;
      if (prop && prop.id && PROPAGADOR_CAPACIDAD_ES[prop.id]) {
        cap = PROPAGADOR_CAPACIDAD_ES[prop.id].celdas || cap;
      }
    }
    cap = Math.min(84, Math.max(semillas, cap));
    var cols = 11;
    var rows = 7;
    if (cap <= 12) {
      cols = cap;
      rows = 1;
    } else if (cap <= 24) {
      cols = 6;
      rows = 4;
    } else if (cap <= 48) {
      cols = 8;
      rows = 6;
    }
    return { cols: cols, rows: rows, cap: cap };
  }

  function htmlDomoPropagadorSvg() {
    return (
      '<div class="hc-prop-dome-viz" aria-hidden="true">' +
      '<svg class="hc-prop-dome-svg" viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="hcPropDomeGl" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(186,230,253,0.55)"/>' +
      '<stop offset="100%" stop-color="rgba(34,197,94,0.12)"/></linearGradient></defs>' +
      '<ellipse cx="110" cy="88" rx="92" ry="10" fill="rgba(15,23,42,0.08)"/>' +
      '<rect x="28" y="52" width="164" height="36" rx="6" fill="#a8a29e" stroke="#78716c" stroke-width="1.2"/>' +
      '<path d="M36 52 Q110 8 184 52 Z" fill="url(#hcPropDomeGl)" stroke="rgba(34,197,94,0.45)" stroke-width="1.5"/>' +
      '<path d="M44 52 Q110 18 176 52" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>' +
      '</svg></div>'
    );
  }

  function renderGermTrayViz(g, cfgOrOpts, optsIn) {
    var cfg =
      cfgOrOpts && (cfgOrOpts.premiumSetup || cfgOrOpts.germinacionFlow || cfgOrOpts.equipamientoInstalado)
        ? cfgOrOpts
        : cfgActiva();
    var opts = optsIn || (cfgOrOpts && cfgOrOpts.idPrefix ? cfgOrOpts : {});
    var idPre = opts.idPrefix || 'hcGerm';
    var enSistema = idPre.indexOf('hcSis') === 0;
    var sinDomo = !!opts.sinDomo;

    var planN =
      cfg.premiumSetup && Number.isFinite(cfg.premiumSetup.numSemillasGerm)
        ? Math.round(cfg.premiumSetup.numSemillasGerm)
        : 0;
    var total = Math.min(
      72,
      Math.max(1, Math.round(Number(g.numSemillas) || planN || 1))
    );
    var activas = Math.min(total, Math.max(0, Math.round(Number(g.semillasActivas) || total)));
    var subKey = sustratoGermKey(cfg, g);
    var subSafe = String(subKey || 'lana').replace(/[^a-z0-9_-]/gi, '') || 'lana';
    var subLbl = etiquetaSustratoGermLocal(subKey);
    var germinadas = 0;
    var pasoIdx = indiceFaseActual(g);
    if (pasoIdx >= 1) {
      germinadas = Math.min(activas, Math.max(1, Math.round(activas * (pasoIdx / PASOS.length))));
    }
    var dims = dimsBandejaPropagador(cfg, g, total);
    var slots = dims.cap;
    var cols = dims.cols;
    var cells = '';
    for (var i = 0; i < slots; i++) {
      var cls = 'hc-germ-tray-cell';
      if (i < activas) {
        cls += ' hc-germ-tray-cell--sub hc-germ-tray-cell--sub-' + subSafe;
        if (i < germinadas) cls += ' hc-germ-tray-cell--germ';
        else cls += ' hc-germ-tray-cell--sem';
      } else {
        cls += ' hc-germ-tray-cell--empty';
      }
      var title =
        i < activas
          ? 'Alvéolo ' + (i + 1) + ' · ' + subLbl + (i < germinadas ? ' · germinando' : '')
          : 'Alvéolo ' + (i + 1) + ' · vacío';
      cells += '<span class="' + cls + '" title="' + title + '"></span>';
    }
    var cultNombre = '';
    var vid = g.variedadId || (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) || '';
    if (vid && typeof getCultivoDB === 'function') {
      var cu = getCultivoDB(vid);
      if (cu && cu.nombre) cultNombre = cu.nombre;
    }
    return (
      '<div class="hc-germ-tray-block' +
      (enSistema ? ' hc-germ-tray-block--sistema' : '') +
      '">' +
      '<h4 class="hc-germ-block-lbl">Domo y bandeja · ' +
      esc(subLbl) +
      '</h4>' +
      (enSistema && !sinDomo ? htmlDomoPropagadorSvg() : '') +
      (cultNombre
        ? '<p class="hc-germ-tray-variedad"><strong>' + esc(cultNombre) + '</strong></p>'
        : '') +
      '<div class="hc-germ-tray-meta">' +
      '<label class="hc-germ-tray-field"><span>Semillas puestas</span>' +
      '<input type="number" id="' +
      idPre +
      'NumSemillas" class="param-input" min="1" max="72" step="1" value="' +
      total +
      '" onchange="hcGermActualizarNumSemillas(this.value)"></label>' +
      '<label class="hc-germ-tray-field"><span>Activas ahora</span>' +
      '<input type="number" id="' +
      idPre +
      'SemillasActivas" class="param-input" min="0" max="' +
      total +
      '" step="1" value="' +
      activas +
      '" onchange="hcGermActualizarSemillasActivas(this.value)"></label>' +
      '<span class="hc-germ-tray-sustrato-pill hc-germ-tray-sustrato-pill--' +
      subSafe +
      '">' +
      esc(subLbl) +
      '</span></div>' +
      '<div class="hc-germ-tray-legend">' +
      '<span><i class="hc-germ-tray-dot hc-germ-tray-dot--sub-' +
      subSafe +
      '"></i> ' +
      esc(subLbl) +
      '</span>' +
      '<span><i class="hc-germ-tray-dot hc-germ-tray-dot--sem"></i> En curso</span>' +
      '<span><i class="hc-germ-tray-dot hc-germ-tray-dot--germ"></i> Germinando</span>' +
      '<span><i class="hc-germ-tray-dot hc-germ-tray-dot--empty"></i> Vacío</span></div>' +
      '<div class="hc-germ-tray-grid" style="--hc-tray-cols:' +
      cols +
      '" role="img" aria-label="Bandeja ' +
      slots +
      ' alvéolos, ' +
      activas +
      ' con ' +
      subLbl +
      '">' +
      cells +
      '</div>' +
      (enSistema ? '' : renderGermRegistroChart(g)) +
      '</div>'
    );
  }

  function renderGermRegistroChart(g) {
    var rows = (g.registroDiario || []).slice().reverse().slice(-14);
    if (rows.length < 2) {
      return '<p class="hc-germ-chart-empty">Tras 2 días de registro verás la mini-gráfica de T° y HR.</p>';
    }
    var temps = rows.map(function (r) {
      return Number.isFinite(r.temp) ? r.temp : null;
    });
    var hrs = rows.map(function (r) {
      return Number.isFinite(r.hr) ? r.hr : null;
    });
    var w = 100;
    var h = 36;
    function poly(vals, minV, maxV) {
      var pts = [];
      for (var i = 0; i < vals.length; i++) {
        if (!Number.isFinite(vals[i])) continue;
        var x = (i / (vals.length - 1)) * w;
        var y = h - ((vals[i] - minV) / (maxV - minV || 1)) * h;
        pts.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      return pts.join(' ');
    }
    var tVals = temps.filter(function (v) {
      return Number.isFinite(v);
    });
    var hVals = hrs.filter(function (v) {
      return Number.isFinite(v);
    });
    if (!tVals.length && !hVals.length) return '';
    var minT = tVals.length ? Math.min.apply(null, tVals) - 1 : 20;
    var maxT = tVals.length ? Math.max.apply(null, tVals) + 1 : 28;
    var minH = hVals.length ? Math.min.apply(null, hVals) - 5 : 60;
    var maxH = hVals.length ? Math.max.apply(null, hVals) + 5 : 85;
    return (
      '<div class="hc-germ-chart-wrap">' +
      '<span class="hc-germ-chart-lbl">Historial germinación (T° / HR)</span>' +
      '<svg class="hc-germ-chart" viewBox="0 0 ' +
      w +
      ' ' +
      h +
      '" preserveAspectRatio="none" aria-hidden="true">' +
      (tVals.length
        ? '<polyline class="hc-germ-chart-temp" points="' + poly(temps, minT, maxT) + '"></polyline>'
        : '') +
      (hVals.length
        ? '<polyline class="hc-germ-chart-hr" points="' + poly(hrs, minH, maxH) + '"></polyline>'
        : '') +
      '</svg></div>'
    );
  }

  function hcGermActualizarNumSemillas(val) {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    var n = Math.min(72, Math.max(1, parseInt(String(val), 10) || 1));
    g.numSemillas = n;
    if (g.semillasActivas > n) g.semillasActivas = n;
    if (cfg.premiumSetup && typeof cfg.premiumSetup === 'object') {
      cfg.premiumSetup.numSemillasGerm = n;
      cfg.premiumSetup.numSemillasGermManual = true;
    }
    cfg.numSemillasGerm = n;
    persistirGerminacion();
    try {
      if (typeof hcAjustarTorrePropagadorSemillas === 'function') {
        hcAjustarTorrePropagadorSemillas(cfg, n);
      } else if (typeof hcSyncGerminacionPlanCultivo === 'function') {
        hcSyncGerminacionPlanCultivo(cfg);
      }
      if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      if (typeof saveState === 'function') saveState();
    } catch (_) {}
    refreshDashGerminacionHub();
    try {
      if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
      if (typeof hcRenderPropagadorSvg === 'function') hcRenderPropagadorSvg(cfg);
      if (typeof refreshPlantasInstalacionResumen === 'function') refreshPlantasInstalacionResumen();
      if (typeof hcRefreshDashTorreCultivoResumen === 'function') hcRefreshDashTorreCultivoResumen(cfg);
      if (typeof redibujarTorre === 'function') redibujarTorre();
      if (typeof updateDashboard === 'function') updateDashboard();
    } catch (_) {}
  }

  function hcGermActualizarSemillasActivas(val) {
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    var max = Math.min(72, Math.max(1, g.numSemillas || 1));
    var n = Math.min(max, Math.max(0, parseInt(String(val), 10) || 0));
    g.semillasActivas = n;
    persistirGerminacion();
    refreshDashGerminacionHub();
    try {
      if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
      if (typeof hcRenderPropagadorSvg === 'function') hcRenderPropagadorSvg(cfg);
    } catch (_) {}
  }

  function hcGerminacionRefrescarCalendario() {
    try {
      if (typeof renderCalendario === 'function') renderCalendario();
    } catch (_) {}
  }

  function hcGerminacionMarcarCalendarioGrid(addEvento, mes, anio) {
    if (!hcGerminacionActiva()) return;
    var cfg = cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    if (!g.startedAt) return;
    var start = new Date(g.startedAt);
    start.setHours(0, 0, 0, 0);
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var camCal = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    var diasMes = new Date(anio, mes + 1, 0).getDate();
    for (var d = 1; d <= diasMes; d++) {
      var dt = new Date(anio, mes, d);
      dt.setHours(0, 0, 0, 0);
      if (dt < start || dt > hoy) continue;
      var iso = dt.toISOString().slice(0, 10);
      var hecho = registroHechoEnFecha(g, iso);
      if (camCal === 'semilla_propagador') {
        addEvento(
          d,
          'germinacion',
          hecho ? '#059669' : '#ca8a04',
          hecho ? '📊 Medición domo' : '📊 Medir domo (pend.)'
        );
        addEvento(d, 'germinacion', '#10b981', '🌱 Propagador');
      } else {
        addEvento(d, 'germinacion', '#059669', '🌱 Germinación activa');
        if (!hecho && dt.getTime() === hoy.getTime()) {
          addEvento(d, 'germinacion', '#ca8a04', '📝 Registro pendiente');
        }
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

    var camCal = typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
    var objDias = diasObjetivoConclusionGerm(cfg, g);
    var concl = typeof germinacionConcluida === 'function' && germinacionConcluida(cfg);

    if (camCal === 'semilla_propagador' && concl && typeof hcCaminoRequiereConfigHidroPendiente === 'function' && hcCaminoRequiereConfigHidroPendiente(cfg)) {
      if (diff === 0) {
        ev.push({
          tipo: 'germinacion',
          icono: '💧',
          titulo: 'Configurar sistema hidropónico',
          desc: 'Germinación concluida: abre el asistente DWC/RDWC antes del traslado al depósito.',
          action: 'inicio',
        });
      }
    }

    if (
      camCal === 'semilla_propagador' &&
      !concl &&
      typeof hcFaltaConfigurarSalaEquipPropagador === 'function' &&
      hcFaltaConfigurarSalaEquipPropagador(cfg)
    ) {
      var faltSala = ['equipamiento de sala'];
      if (typeof getCamposEquipamientoFaltantes === 'function') {
        var eqF = getCamposEquipamientoFaltantes(cfg);
        if (eqF && eqF.length) {
          faltSala = ['completar catálogo (' + eqF.map(function (x) { return x.label; }).join(', ') + ')'];
        }
      }
      ev.push({
        tipo: 'camino',
        icono: '🏠',
        titulo: 'RECOMENDADO · Sala de cultivo',
        desc:
          'Registra carpa, LED, extractor y propagador en el configurador (Inicio o Sala). ' +
          'Pendiente: ' +
          faltSala.join(' y ') +
          '.',
        action: 'sala_reco',
      });
    }

    if (diff === 0 && paso) {
      if (camCal === 'semilla_propagador') {
        var planMed =
          typeof getGerminacionDashTilesPlan === 'function'
            ? getGerminacionDashTilesPlan(cfg)
            : { tiles: [] };
        var medTxt = (planMed.tiles || [])
          .map(function (t) {
            return t.label + (t.unit ? ' (' + t.unit + ')' : '');
          })
          .join(', ');
        ev.push({
          tipo: 'germinacion',
          icono: '📊',
          titulo: registroHoyHecho(g)
            ? 'Medición domo · registrada hoy'
            : 'Medición diaria · domo propagador',
          desc: registroHoyHecho(g)
            ? 'Tienes registro de hoy en germinación. Puedes volver a medir en Medir si cambia el clima.'
            : 'Registra en <strong>Medir</strong>: ' +
              (medTxt || 'T°, HR, VPD del domo') +
              '. También puedes anotar observaciones en Inicio → Germinación.',
          action: 'medicion',
        });
      }
      ev.push({
        tipo: 'germinacion',
        icono: '🌱',
        titulo:
          camCal === 'semilla_propagador'
            ? 'Propagador · día ' + diaN + ' (guía fase ' + paso.paso + ')'
            : 'Germinación · fase ' + paso.paso + ' (día ' + diaN + ')',
        desc:
          (camCal === 'semilla_propagador'
            ? 'Seguimiento diario; las 6 fases son orientativas. '
            : '') +
          tareaDiaFase(paso.id, modo) +
          (registroHoyHecho(g)
            ? ''
            : camCal === 'semilla_propagador'
              ? ' · Anota el día en Inicio → Germinación.'
              : ' · Registra el día en Inicio → Germinación.'),
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
      if (!registroHoyHecho(g) && camCal !== 'semilla_propagador') {
        ev.push({
          tipo: 'germinacion',
          icono: '📝',
          titulo: 'Registro diario germinación',
          desc: 'Anota T°, HR, nutrientes en agua y observaciones en Inicio.',
          action: 'inicio',
        });
      }
      if (camCal === 'semilla_propagador' && !concl && diaN >= objDias - 1) {
        ev.push({
          tipo: 'germinacion',
          icono: '✅',
          titulo: 'Control · revisar cierre de germinación',
          desc: 'Día ' + diaN + ' / objetivo ~' + objDias + '. Marca conclusión si las plántulas están listas para el hidro.',
          action: 'inicio',
        });
      }
      var domo = g.ultimaDomo || {};
      if (domo.temp != null && (domo.temp < 20 || domo.temp > 28)) {
        ev.push({
          tipo: 'germinacion',
          icono: '🌡️',
          titulo: 'Alerta · T° domo fuera de rango',
          desc: 'Última lectura ' + domo.temp + ' °C · ideal 22–26 °C en propagador.',
        });
      }
      if (domo.hr != null && (domo.hr < 60 || domo.hr > 90)) {
        ev.push({
          tipo: 'germinacion',
          icono: '💧',
          titulo: 'Alerta · HR domo',
          desc: 'Última HR ' + domo.hr + ' % · objetivo 70–80 % bajo domo.',
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
    if (
      typeof hcCaminoSemillaPropagadorSetupGerm === 'function' &&
      hcCaminoSemillaPropagadorSetupGerm()
    ) {
      sec.innerHTML = '';
      return;
    }
    var orig =
      typeof ensurePremiumSetup === 'function' ? ensurePremiumSetup().origenPlanta || 'semilla' : 'semilla';
    if (orig !== 'semilla') {
      if (typeof refreshPremiumGerminacionUI === 'function') refreshPremiumGerminacionUI();
      return;
    }
    sec.innerHTML =
      '<div class="hc-germ-setup-preview setup-box-info" role="note">' +
      '<p><strong>Camino semilla → cubo (6 fases).</strong> No las marques aquí: son días de trabajo real.</p>' +
      '<p><strong>Propagador:</strong> checklist → 6 fases + registro aquí → sala → traslado. <strong>Hidro directo:</strong> prep + sala + sistema + depósito → 6 fases en el cubo.</p>' +
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

  var refreshDashGerminacionHub = renderDashGerminacionHub;

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
  global.registroHechoEnFecha = registroHechoEnFecha;
  global.hcGerminacionMarcarCalendarioGrid = hcGerminacionMarcarCalendarioGrid;
  global.hcGerminacionRefrescarCalendario = hcGerminacionRefrescarCalendario;
  global.setModoGerminacion = setModoGerminacion;
  global.hcGerminacionElegirVariedad = hcGerminacionElegirVariedad;
  global.toggleGermEquip = toggleGermEquip;
  global.guardarMedicionDomo = guardarMedicionDomo;
  global.guardarRegistroGerminacionDiario = guardarRegistroGerminacionDiario;
  global.hcGermActualizarNumSemillas = hcGermActualizarNumSemillas;
  global.hcGermActualizarSemillasActivas = hcGermActualizarSemillasActivas;
  function hcGerminacionFaseActualId(cfg) {
    cfg = cfg || cfgActiva();
    var g = ensureGerminacionFlow(cfg);
    for (var i = 0; i < PASOS.length; i++) {
      if (!g.pasos[PASOS[i].id] || !g.pasos[PASOS[i].id].doneAt) return PASOS[i].id;
    }
    return 'dwc';
  }

  global.ensureGerminacionFlow = ensureGerminacionFlow;
  global.hcGerminacionFaseActualId = hcGerminacionFaseActualId;
  global.germinacionConcluida = germinacionConcluida;
  global.diasObjetivoConclusionGerm = diasObjetivoConclusionGerm;
  global.hcGerminacionMarcarConcluida = hcGerminacionMarcarConcluida;
  global.renderGermTrayViz = renderGermTrayViz;
})();
