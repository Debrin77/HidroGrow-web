/**
 * Estado global, localStorage, backup/import y punto de restauración.
 * Tras hc-bootstrap-config.js; antes de PIN.
 */
// ══════════════════════════════════════════════════
// ESTADO
// ══════════════════════════════════════════════════
// Variables globales — declaradas ANTES de loadState
let currentTab = 'inicio';
let editingCesta = null;
/** Hueco/maceta tocado en el esquema (emoji visible hasta cerrar modal o cambiar). */
let torreDiagramHuecoFocus = null;
/** 'editar' = abrir ficha · 'asignar' = colocar cultivo en cestas (tras elegirlo) */
let torreInteraccionModo = 'editar';
/** false = por defecto: marcar varias cestas y «Aplicar a selección». true = cada toque aplica ya. */
let torreAsignarInstantaneo = false;
let torreCestasMultiSel = new Set();
let modoActual = 'vegetativo';
let state = null; // se inicializa después

/** Elimina copias antiguas (HidroCultivo / v1) — no se importan al estado actual. */
function hidrogrowPurgarStorageLegacySilencioso() {
  try {
    if (typeof window !== 'undefined' && window._hcLegacyStoragePurgado) return;
    if (typeof window !== 'undefined') window._hcLegacyStoragePurgado = true;
    localStorage.removeItem('hidrogrow_v1');
    localStorage.removeItem('cultiva_v1');
  } catch (_) {}
}

function hidrogrowCaminoDesdeCfg(cfg) {
  if (!cfg || typeof cfg !== 'object') return '';
  if (cfg.caminoCultivo) return String(cfg.caminoCultivo);
  if (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) {
    return String(cfg.premiumSetup.caminoCultivo);
  }
  return '';
}

/** Repara configs guardadas como DWC por migración antigua (propagador en germinación). */
function hidrogrowRepararConfigPropagadorMigrada(cfg) {
  if (typeof hidrogrowPropagadorEnFaseGermSinHidro !== 'function') return false;
  if (!hidrogrowPropagadorEnFaseGermSinHidro(cfg)) return false;
  let changed = false;
  const t = String(cfg.tipoInstalacion || '').toLowerCase();
  if (t === 'dwc' || t === 'rdwc') {
    cfg.tipoInstalacion = '';
    changed = true;
  }
  if (cfg.checklistInstalacionConfirmada === true && cfg.hcSetupFase !== 'hidro') {
    cfg.checklistInstalacionConfirmada = false;
    changed = true;
  }
  return changed;
}

/** Al cargar: la ranura activa manda sobre configTorre raíz (evita DWC fantasma en raíz). */
function hidrogrowCfgAlCargar(s) {
  if (!s || typeof s !== 'object') return null;
  const idx = Number.isFinite(s.torreActiva) ? s.torreActiva : 0;
  const slot = Array.isArray(s.torres) && s.torres[idx] ? s.torres[idx] : null;
  if (slot && slot.config && typeof slot.config === 'object' && hidrogrowTorreSlotEsReal(slot)) {
    return slot.config;
  }
  return s.configTorre && typeof s.configTorre === 'object' ? s.configTorre : null;
}

/** Copia instalación activa del slot a state.torre / configTorre (fuente de verdad al abrir). */
function hidrogrowRaizDesincronizadaDeSlot(s, slot) {
  if (!s || !slot) return false;
  const cfgRaiz = s.configTorre && typeof s.configTorre === 'object' ? s.configTorre : {};
  if (hidrogrowSlotNecesitaSync(slot, { torre: s.torre }, cfgRaiz)) return true;
  const sm = s.mediciones;
  const tm = slot.mediciones;
  if (Array.isArray(tm) !== Array.isArray(sm)) return true;
  if (Array.isArray(tm) && tm.length !== (sm ? sm.length : 0)) return true;
  const sr = s.registro;
  const tr = slot.registro;
  if (Array.isArray(tr) !== Array.isArray(sr)) return true;
  if (Array.isArray(tr) && tr.length !== (sr ? sr.length : 0)) return true;
  const umS = s.ultimaMedicion && s.ultimaMedicion.fecha ? s.ultimaMedicion.fecha : '';
  const umT = slot.ultimaMedicion && slot.ultimaMedicion.fecha ? slot.ultimaMedicion.fecha : '';
  if (umS !== umT) return true;
  if ((s.ultimaRecarga ?? null) !== (slot.ultimaRecarga ?? null)) return true;
  if ((s.recargaSnoozeHasta ?? null) !== (slot.recargaSnoozeHasta ?? null)) return true;
  return false;
}

function hidrogrowSincronizarRaizDesdeSlotActivo(s) {
  if (!s || !Array.isArray(s.torres) || !s.torres.length) return false;
  const idx = Number.isFinite(s.torreActiva) ? s.torreActiva : 0;
  const slot = s.torres[idx];
  if (!slot || !hidrogrowTorreSlotEsReal(slot)) return false;
  if (!hidrogrowRaizDesincronizadaDeSlot(s, slot)) return false;
  try {
    if (slot.config && typeof slot.config === 'object') {
      s.configTorre = JSON.parse(JSON.stringify(slot.config));
    }
    if (Array.isArray(slot.torre)) {
      s.torre = JSON.parse(JSON.stringify(slot.torre));
    }
    if (Array.isArray(slot.mediciones)) {
      s.mediciones = JSON.parse(JSON.stringify(slot.mediciones));
    }
    if (Array.isArray(slot.registro)) {
      s.registro = JSON.parse(JSON.stringify(slot.registro));
    }
    s.ultimaMedicion =
      slot.ultimaMedicion && typeof slot.ultimaMedicion === 'object'
        ? { ...slot.ultimaMedicion }
        : null;
    s.ultimaRecarga = slot.ultimaRecarga ?? null;
    s.recargaSnoozeHasta = slot.recargaSnoozeHasta ?? null;
    return true;
  } catch (_) {
    return false;
  }
}

function hidrogrowNumSemillasGermCfg(cfg) {
  cfg = cfg || {};
  const g = cfg.germinacionFlow || {};
  if (Number.isFinite(g.numSemillas) && g.numSemillas >= 1) {
    return Math.min(72, Math.round(g.numSemillas));
  }
  const prem = cfg.premiumSetup || {};
  if (Number.isFinite(prem.numSemillasGerm) && prem.numSemillasGerm >= 1) {
    return Math.min(72, Math.round(prem.numSemillasGerm));
  }
  if (Number.isFinite(cfg.numSemillasGerm) && cfg.numSemillasGerm >= 1) {
    return Math.min(72, Math.round(cfg.numSemillasGerm));
  }
  return 0;
}

/** Filas × cestas al cargar (propagador = 1×N; disponible antes de hc-camino-cultivo.js). */
function hidrogrowDimsTorreDesdeConfig(cfg, torre) {
  cfg = cfg || {};
  torre = torre || [];
  if (hidrogrowCaminoDesdeCfg(cfg) === 'semilla_propagador') {
    let c = hidrogrowNumSemillasGermCfg(cfg);
    if (!c || c < 1) {
      let flatLen = 0;
      for (let fi = 0; fi < torre.length; fi++) flatLen += (torre[fi] && torre[fi].length) || 0;
      c = flatLen > 0 ? flatLen : 1;
    }
    return { numNiveles: 1, numCestas: Math.min(72, Math.max(1, c)) };
  }
  return {
    numNiveles: Math.max(1, parseInt(String(cfg.numNiveles || NUM_NIVELES), 10) || NUM_NIVELES),
    numCestas: Math.max(1, parseInt(String(cfg.numCestas || NUM_CESTAS), 10) || NUM_CESTAS),
  };
}

/** Ranura en `state.torres` con datos reales del usuario (no plantilla vacía). */
function hidrogrowTorreSlotEsReal(t) {
  if (!t || typeof t !== 'object') return false;
  const cfg = t.config;
  if (!cfg || typeof cfg !== 'object') return false;
  if (cfg.hcPlantillaAutogenerada) return false;
  if (cfg.caminoCultivo || (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo)) return true;
  if (cfg.salaPreGermConfigAt || cfg.germinacionFlow) return true;
  if (cfg.propagadorMontajeChecks && cfg.propagadorMontajeChecks.completedAt) return true;
  if (cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt) return true;
  if (cfg.checklistInstalacionConfirmada === true) return true;
  if (cfg.nutriente) return true;
  const torre = t.torre;
  if (Array.isArray(torre)) {
    for (let n = 0; n < torre.length; n++) {
      const row = torre[n];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        if (row[c] && String(row[c].variedad || '').trim()) return true;
      }
    }
  }
  const nom = String(t.nombre || '').trim();
  if (nom && nom !== 'Mi instalación' && nom !== 'Instalación') return true;
  return false;
}

/** Instalación real del usuario (no solo plantilla vacía en memoria). */
function hidrogrowInstalacionPersistible(st) {
  if (!st || typeof st !== 'object') return false;
  if (Array.isArray(st.torres) && st.torres.length > 0) {
    return st.torres.some((t) => hidrogrowTorreSlotEsReal(t));
  }
  const cfg = st.configTorre;
  if (!cfg || typeof cfg !== 'object') return false;
  if (cfg.hcPlantillaAutogenerada) return false;
  if (cfg.caminoCultivo || (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo)) return true;
  if (cfg.salaPreGermConfigAt || cfg.propagadorMontajeChecks || cfg.germinacionFlow) return true;
  if (cfg.propagadorMontajeChecks && cfg.propagadorMontajeChecks.completedAt) return true;
  if (cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt) return true;
  if (cfg.checklistInstalacionConfirmada === true) return true;
  const torre = st.torre;
  if (Array.isArray(torre)) {
    for (let n = 0; n < torre.length; n++) {
      const row = torre[n];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        if (row[c] && String(row[c].variedad || '').trim()) return true;
      }
    }
  }
  return false;
}

/** Reconstruye `state.torres[0]` desde config/torre en raíz si el guardado perdió el array. */
function hidrogrowAsegurarTorresSlotEnSnapshot(st) {
  if (!st || typeof st !== 'object') return;
  if (Array.isArray(st.torres) && st.torres.length > 0) return;
  if (!hidrogrowInstalacionPersistible(st)) return;
  const cfg = st.configTorre;
  if (!cfg || typeof cfg !== 'object') return;
  const idx = Number.isFinite(st.torreActiva) ? st.torreActiva : 0;
  const nombre =
    String(cfg.nombreTorre || cfg.nombre || '').trim() ||
    (cfg.caminoCultivo === 'semilla_propagador' ? 'Germinación · propagador' : 'Instalación');
  st.torres = [
    {
      id: cfg.id || Date.now(),
      nombre: nombre,
      emoji: cfg.caminoCultivo === 'semilla_propagador' ? '🫧' : '🌿',
      config: JSON.parse(JSON.stringify(cfg)),
      torre: JSON.parse(JSON.stringify(Array.isArray(st.torre) ? st.torre : [])),
      modoActual: st.modo || 'vegetativo',
      mediciones: Array.isArray(st.mediciones) ? st.mediciones : [],
      registro: Array.isArray(st.registro) ? st.registro : [],
      ultimaMedicion: st.ultimaMedicion || null,
      ultimaRecarga: st.ultimaRecarga != null ? st.ultimaRecarga : null,
      recargaSnoozeHasta: st.recargaSnoozeHasta != null ? st.recargaSnoozeHasta : null,
      notifOpciones: { recarga: false, medicion: false, cosecha: false, esquejes: false },
    },
  ];
  st.torreActiva = idx;
}

/** Sin instalación guardada: no rehidratar borrador de equipamiento/sistema. */
function hidrogrowLimpiarBorradorSinInstalacion(st) {
  if (!st || typeof st !== 'object') return false;
  if (hidrogrowInstalacionPersistible(st)) return false;
  let changed = false;
  if (Array.isArray(st.torres) && st.torres.length) {
    st.torres = [];
    changed = true;
  }
  if (st.configTorre) {
    delete st.configTorre;
    changed = true;
  }
  if (Array.isArray(st.mediciones) && st.mediciones.length) {
    st.mediciones = [];
    changed = true;
  }
  if (Array.isArray(st.registro) && st.registro.length) {
    st.registro = [];
    changed = true;
  }
  if (st.ultimaMedicion) {
    st.ultimaMedicion = null;
    changed = true;
  }
  if (st.ultimaRecarga != null) {
    st.ultimaRecarga = null;
    changed = true;
  }
  if (st.recargaSnoozeHasta != null) {
    st.recargaSnoozeHasta = null;
    changed = true;
  }
  return changed;
}

/** Snapshot para localStorage: conserva instalación propagador aunque falte el array `torres`. */
function hidrogrowPrepararSnapshotPersistencia(st) {
  if (!st || typeof st !== 'object') return st;
  const clone = JSON.parse(JSON.stringify(st));
  hidrogrowAsegurarTorresSlotEnSnapshot(clone);
  if (!hidrogrowInstalacionPersistible(clone)) {
    hidrogrowLimpiarBorradorSinInstalacion(clone);
  }
  return clone;
}

/** Borra todos los datos de HidroGrow (reset manual). */
function hidrogrowLimpiarAlmacenamientoCompleto(opts) {
  opts = opts || {};
  const explicitKeys = [
    STORAGE_KEY,
    'hidrogrow_v1',
    'cultiva_v1',
    AUTO_RESTORE_POINT_KEY,
    AUTO_RESTORE_POINT_TRANSITION_KEY,
    AUTH_TS_KEY,
    AUTH_REMEMBER_MIN_KEY,
    TUTORIAL_ASIGNAR_LS,
    TUTORIAL_EDITAR_LS,
    TUTORIAL_TORRE_TAB_LS,
    TORRE_SWIPE_HINT_LS,
    'hc_guia_primer_dia_dismiss',
    'hc_onboarding_visit_riego',
    'hc_bienvenida_v2026_6_store',
    'hc_bienvenida_v2026_7_camino',
    'hc_tab_bar_coach_dismiss_v2',
    'hc_welcome_theme_preview',
    'hc_hint_ctx_med',
    'hc_hint_ctx_sala',
    'hc_hint_ctx_sis',
    'hc_hint_ctx_riego',
    'hcMultiSystemCoachDismissed',
    'hcNuevoSistemaPrimerSeen',
    'hcSalasPlan',
    'hcSalasPlanDone',
    'hcDashRecargaOpen',
  ];
  explicitKeys.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch (_) {}
  });
  const explicitSet = {};
  explicitKeys.forEach(function (k) {
    explicitSet[k] = true;
  });
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k || explicitSet[k]) continue;
      if (
        k.indexOf('hc_') === 0 ||
        k.indexOf('hg_') === 0 ||
        k.indexOf('hidrogrow_') === 0 ||
        k.indexOf('cultiva_') === 0
      ) {
        localStorage.removeItem(k);
      }
    }
  } catch (_) {}
  try {
    sessionStorage.clear();
  } catch (_) {}
  if (!opts.skipIndexedDb) {
    try {
      if (typeof indexedDB !== 'undefined' && typeof FOTO_DB_NAME === 'string') {
        indexedDB.deleteDatabase(FOTO_DB_NAME);
      }
    } catch (_) {}
  }
}

/** Evita clonar/guardar el slot activo en cada arranque si ya coincide con la raíz. */
function hidrogrowSlotNecesitaSync(slot, s, cfg) {
  if (!slot || !s || !cfg) return false;
  const sc = slot.config;
  if (!sc || typeof sc !== 'object') return true;
  if (sc.numCestas !== cfg.numCestas || sc.numNiveles !== cfg.numNiveles) return true;
  if (sc.caminoCultivo !== cfg.caminoCultivo) return true;
  const st = slot.torre;
  const rt = s.torre;
  if (!Array.isArray(st) || !Array.isArray(rt)) return true;
  if (st.length !== rt.length) return true;
  for (let i = 0; i < rt.length; i++) {
    const sr = st[i] || [];
    const rr = rt[i] || [];
    if (sr.length !== rr.length) return true;
  }
  return false;
}

function hidrogrowPersistStateIdle(s) {
  const snap = hidrogrowPrepararSnapshotPersistencia(s);
  const persist = function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch (e) {
      console.warn('No se pudo persistir saneamiento de estado', e);
    }
  };
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(persist, { timeout: 3500 });
  } else {
    setTimeout(persist, 0);
  }
}

/** Reparación pesada de torre/slots — no bloquea el PIN (se agenda en idle). */
function hidrogrowFinishLoadStateRepair(s, ctx) {
  if (!s || !ctx) return;
  let legacyPersist = !!ctx.legacyPersist;
  try {
    if (hidrogrowSincronizarRaizDesdeSlotActivo(s)) legacyPersist = true;
    const cfgLoad = hidrogrowCfgAlCargar(s);
    const dims = hidrogrowDimsTorreDesdeConfig(cfgLoad, s.torre);
    let nivLoad = Math.max(1, dims.numNiveles || NUM_NIVELES);
    const cesLoad = Math.max(1, dims.numCestas || NUM_CESTAS);
    const celdaVacia = function () {
      return {
        variedad: '',
        fecha: '',
        notas: '',
        origenPlanta: '',
        fotos: [],
        fotoKeys: [],
      };
    };
    if (hidrogrowCaminoDesdeCfg(cfgLoad) === 'semilla_propagador') {
      nivLoad = 1;
      const row0 = (s.torre && s.torre[0]) || [];
      const torrePropagadorOk = s.torre.length === 1 && row0.length === cesLoad;
      if (!torrePropagadorOk) {
        const flat = [];
        for (let ni = 0; ni < (s.torre || []).length; ni++) {
          const row = s.torre[ni] || [];
          for (let ci = 0; ci < row.length; ci++) {
            if (row[ci]) flat.push(row[ci]);
          }
        }
        while (flat.length < cesLoad) flat.push(celdaVacia());
        s.torre = [flat.slice(0, cesLoad)];
        legacyPersist = true;
      }
      if (cfgLoad && typeof cfgLoad === 'object') {
        cfgLoad.numNiveles = 1;
        cfgLoad.numCestas = cesLoad;
      }
    }
    while (s.torre.length < nivLoad) {
      s.torre.push([]);
    }
    for (let ni = 0; ni < nivLoad; ni++) {
      if (!s.torre[ni]) s.torre[ni] = [];
      while (s.torre[ni].length < cesLoad) {
        s.torre[ni].push(celdaVacia());
      }
    }
    s.torre.forEach(function (nivel) {
      (nivel || []).forEach(function (cell) {
        asegurarCamposFilaTorre(cell);
      });
    });
    if (cfgLoad && typeof cfgLoad === 'object') {
      cfgLoad.numNiveles = nivLoad;
      cfgLoad.numCestas = cesLoad;
    }
    if (s.configTorre && cfgLoad) {
      s.configTorre.numNiveles = nivLoad;
      s.configTorre.numCestas = cesLoad;
    }
    const idxSlotLoad = Number.isFinite(s.torreActiva) ? s.torreActiva : 0;
    const slotLoad = Array.isArray(s.torres) && s.torres[idxSlotLoad] ? s.torres[idxSlotLoad] : null;
    if (slotLoad && cfgLoad && hidrogrowSlotNecesitaSync(slotLoad, s, cfgLoad)) {
      try {
        slotLoad.config = JSON.parse(JSON.stringify(cfgLoad));
        slotLoad.torre = JSON.parse(JSON.stringify(s.torre));
      } catch (_) {
        slotLoad.config = cfgLoad;
        slotLoad.torre = s.torre;
      }
      legacyPersist = true;
    }
    if (legacyPersist) {
      hidrogrowPersistStateIdle(s);
    }
  } catch (e) {
    try {
      console.warn('hidrogrowFinishLoadStateRepair', e);
    } catch (_) {}
  }
  try {
    if (typeof window !== 'undefined') window._hcLoadStateRepairDone = true;
  } catch (_) {}
}

function hidrogrowInferPropagadorGermAsistenteGuardado(cfg) {
  if (!cfg || typeof cfg !== 'object') return;
  if (hidrogrowCaminoDesdeCfg(cfg) !== 'semilla_propagador') return;
  if (cfg.hcPropagadorGermAsistenteGuardadoAt) return;
  if (cfg.hcSetupFase === 'sala_pre_germ') return;
  try {
    if (
      typeof validarPlanGerminacionCompleto === 'function' &&
      validarPlanGerminacionCompleto(cfg, { requierePropagador: false }).ok
    ) {
      cfg.hcPropagadorGermAsistenteGuardadoAt =
        cfg.hcPropagadorGermAsistenteGuardadoAt || new Date().toISOString();
    }
  } catch (_) {}
}

function loadState() {
  hidrogrowPurgarStorageLegacySilencioso();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (!s.torre || !Array.isArray(s.torre)) {
        console.warn('State corrupto — reiniciando');
        return initState();
      }
      let legacyPersist = false;
      var migKey = 'hc_state_migrated_' + (typeof APP_BUILD_VERSION !== 'undefined' ? APP_BUILD_VERSION : '0');
      var yaMigrado = false;
      try {
        yaMigrado = sessionStorage.getItem(migKey) === '1';
      } catch (_) {}
      if (!yaMigrado && typeof hidrogrowMigrarStateCompleto === 'function') {
        legacyPersist = !!hidrogrowMigrarStateCompleto(s);
        if (legacyPersist) {
          try {
            sessionStorage.setItem(migKey, '1');
          } catch (_) {}
        }
      }
      if (s.configTorre && hidrogrowRepararConfigPropagadorMigrada(s.configTorre)) {
        legacyPersist = true;
      }
      if (Array.isArray(s.torres)) {
        s.torres.forEach((t) => {
          if (t && t.config && hidrogrowRepararConfigPropagadorMigrada(t.config)) {
            legacyPersist = true;
          }
        });
      }
      hidrogrowAsegurarTorresSlotEnSnapshot(s);
      if (Array.isArray(s.torres) && s.torres.length) {
        const nAntes = s.torres.length;
        s.torres = s.torres.filter((t) => hidrogrowTorreSlotEsReal(t));
        if (s.torres.length !== nAntes) legacyPersist = true;
      }
      const cfgLoad = hidrogrowCfgAlCargar(s);
      if (cfgLoad && typeof cfgLoad === 'object') {
        s.configTorre = cfgLoad;
        if (cfgLoad.hcSetupFase === 'sala_pre_germ') {
          cfgLoad.hcSetupFase = 'germinacion';
          legacyPersist = true;
        }
        hidrogrowInferPropagadorGermAsistenteGuardado(cfgLoad);
      }
      if (s.modo) modoActual = s.modo;
      normalizarNotifOpcionesEnState(s);
      if (hidrogrowLimpiarBorradorSinInstalacion(s)) legacyPersist = true;
      const repairCtx = { legacyPersist: legacyPersist };
      const runRepair = function () {
        hidrogrowFinishLoadStateRepair(s, repairCtx);
      };
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(runRepair, { timeout: 2800 });
      } else {
        setTimeout(runRepair, 32);
      }
      return s;
    }
  } catch(e) { console.error('Error loading state:', e); }
  return initState();
}

/** Recordatorios de cultivo (recarga / medición / cosecha): por instalación en `torres[i].notifOpciones`. Solo `panelInicioColapsado` queda en raíz. MeteoAlarm va aparte. */
function normalizarNotifOpcionesEnState(s) {
  if (!s || typeof s !== 'object') return;
  const p = s.notifOpciones && typeof s.notifOpciones === 'object' ? s.notifOpciones : {};
  const panelInicioColapsado = typeof p.panelInicioColapsado === 'boolean' ? p.panelInicioColapsado : false;
  const baseFlags = {
    recarga: typeof p.recarga === 'boolean' ? p.recarga : false,
    medicion: typeof p.medicion === 'boolean' ? p.medicion : false,
    cosecha: typeof p.cosecha === 'boolean' ? p.cosecha : false,
    esquejes: typeof p.esquejes === 'boolean' ? p.esquejes : false,
  };
  if (Array.isArray(s.torres) && s.torres.length) {
    s.torres.forEach((t) => {
      if (!t || typeof t !== 'object') return;
      if (!t.notifOpciones || typeof t.notifOpciones !== 'object') {
        t.notifOpciones = { ...baseFlags };
      } else {
        t.notifOpciones.recarga = !!t.notifOpciones.recarga;
        t.notifOpciones.medicion = !!t.notifOpciones.medicion;
        t.notifOpciones.cosecha = !!t.notifOpciones.cosecha;
        t.notifOpciones.esquejes = !!t.notifOpciones.esquejes;
      }
    });
    s.notifOpciones = { panelInicioColapsado };
  } else {
    s.notifOpciones = {
      ...baseFlags,
      panelInicioColapsado,
    };
  }
}

/** Origen de la planta en ficha: vivero | germinacion | clon | madre | '' */
function normalizarOrigenPlanta(v) {
  const s = String(v == null ? '' : v).trim().toLowerCase();
  if (s === 'germinacion' || s === 'germinación' || s === 'semilla') return 'germinacion';
  if (s === 'vivero') return 'vivero';
  if (s === 'clon' || s === 'esqueje' || s === 'esquejes') return 'clon';
  if (s === 'madre') return 'madre';
  return '';
}

function asegurarCamposFilaTorre(row) {
  if (!row || typeof row !== 'object') return;
  if (!Array.isArray(row.fotos)) row.fotos = [];
  if (!Array.isArray(row.fotoKeys)) row.fotoKeys = [];
  row.origenPlanta = normalizarOrigenPlanta(row.origenPlanta);
}

function hcOrientacionViveroHtml() {
  const inner =
    '<p class="hc-origen-hint-p"><strong>Plántula de vivero</strong>: suele traer algo de sustrato (turba, coco, etc.) en el pan de raíces. ' +
    'En hidroponía conviene <strong>retirar con cuidado lo suelto</strong> o seguir las indicaciones del vivero; evita meter tierra suelta al circuito.</p>' +
    '<p class="hc-origen-hint-p">La <strong>fecha</strong> sigue siendo el día en que entra al sistema. Con «vivero» marcado, la app suma una <strong>media de días en plug</strong> típica de ese cultivo para alinear <strong>EC/pH automáticos</strong>, riego y avisos de cosecha con una edad biológica aproximada (orientativo).</p>';
  return typeof hcWrapOrigenDetails === 'function'
    ? hcWrapOrigenDetails(inner, 'Plántula de vivero · sustrato y raíces', false)
    : inner;
}

function hcOrientacionClonHtml(nombreVariedad) {
  const nom = String(nombreVariedad || '').trim();
  const cult = nom && typeof getCultivoDB === 'function' ? getCultivoDB(nom) : null;
  const dias =
    typeof getDiasPreHidroPorOrigen === 'function'
      ? getDiasPreHidroPorOrigen(cult, 'clon')
      : 10;
  const inner =
    '<p class="hc-origen-hint-p"><strong>Esqueje / clon</strong>: el tejido ya es adulto; no hay fase de germinación. ' +
    'En propagador (18/6, HR alta, 22–26 °C) suelen enraizar en <strong>7–14 días</strong>.</p>' +
    '<p class="hc-origen-hint-p">La <strong>fecha de la ficha</strong> = día que entra al DWC/RDWC (net pot en solución). ' +
    'Con origen <strong>esqueje</strong>, la app suma unos <strong>' + dias + ' d</strong> medios de enraizado previo ' +
    'para alinear EC, riego y avance de ciclo (orientativo).</p>' +
    '<p class="hc-origen-hint-foot">Los primeros ~14 d en hidro siguen protocolo de enraizado (EC baja). Si la fecha es el día del corte, adelántala al traslado real.</p>';
  return typeof hcWrapOrigenDetails === 'function'
    ? hcWrapOrigenDetails(inner, 'Esqueje · enraizado y fecha', false)
    : inner;
}

function hcOrientacionGerminacionHtml(nombreVariedad) {
  if (typeof hcGerminacionPanelHtmlCompleto === 'function') {
    return hcGerminacionPanelHtmlCompleto(nombreVariedad || '');
  }
  const nom = String(nombreVariedad || '').trim();
  const cult = nom && typeof getCultivoDB === 'function' ? getCultivoDB(nom) : null;
  const diasOff =
    typeof getDiasPreHidroPorOrigen === 'function'
      ? getDiasPreHidroPorOrigen(cult, 'germinacion')
      : 0;
  const offTxt =
    diasOff > 0
      ? ' Con «germinación propia» marcada, la app suma unos <strong>' +
        diasOff +
        ' d</strong> medios (domo + rockwool) a los días en hidro para EC y ciclo.'
      : '';
  const fb =
    '<p class="hc-origen-hint-p"><strong>Germinación propia</strong> — referencia orientativa (ajusta según semillero y variedad):</p>' +
    '<ol class="hc-origen-hint-ol">' +
    '<li>Coloca la semilla en <strong>sustrato hidropónico</strong> húmedo (lana de roca, coco, etc.), sin enterrar en exceso.</li>' +
    '<li>Bandeja en germinador <strong>a oscuras</strong> hasta que asome la radícula (suele ser unos <strong>2–4 días</strong> según especie y temperatura).</li>' +
    '<li>Pasa a <strong>luz de crecimiento</strong> (14–18 h/día, intensidad suave al inicio) hasta <strong>2–3 hojas reales</strong> y buen desarrollo radicular.</li>' +
    '<li><strong>Trasplanta al sistema</strong> (DWC o RDWC) y registra la <strong>fecha de entrada al hidro</strong>: es el día desde el que la app cuenta el ciclo.</li>' +
    '</ol>' +
    '<p class="hc-origen-hint-foot">Los días exactos dependen de la variedad y de la temperatura; revisa siempre el sobre del semillero.' +
    offTxt +
    '</p>';
  return typeof hcWrapOrigenDetails === 'function'
    ? hcWrapOrigenDetails(fb, 'Germinación propia · guía rápida', false)
    : fb;
}

function onTorreAssignOrigenChange() {
  const sel = document.getElementById('torreAssignOrigen');
  const box = document.getElementById('torreAssignOrigenHint');
  if (!box) return;
  const v = sel ? normalizarOrigenPlanta(sel.value) : '';
  if (v === 'germinacion') {
    box.classList.remove('setup-hidden');
    const nom = document.getElementById('torreAssignVariedad')?.value?.trim() || '';
    box.innerHTML = hcOrientacionGerminacionHtml(nom);
  } else if (v === 'clon' || v === 'madre') {
    box.classList.remove('setup-hidden');
    const nom = document.getElementById('torreAssignVariedad')?.value?.trim() || '';
    box.innerHTML = hcOrientacionClonHtml(nom);
  } else if (v === 'vivero') {
    box.classList.remove('setup-hidden');
    box.innerHTML = hcOrientacionViveroHtml();
  } else {
    box.classList.add('setup-hidden');
    box.innerHTML = '';
  }
}

function onEditOrigenPlantaChange() {
  const sel = document.getElementById('editOrigenPlanta');
  const box = document.getElementById('editOrigenGerminacionHint');
  if (!box) return;
  const v = sel ? normalizarOrigenPlanta(sel.value) : '';
  if (v === 'germinacion') {
    box.classList.remove('setup-hidden');
    const nom = document.getElementById('editVariedad')?.value?.trim() || '';
    box.innerHTML = hcOrientacionGerminacionHtml(nom);
  } else if (v === 'clon' || v === 'madre') {
    box.classList.remove('setup-hidden');
    const nom = document.getElementById('editVariedad')?.value?.trim() || '';
    box.innerHTML = hcOrientacionClonHtml(nom);
  } else if (v === 'vivero') {
    box.classList.remove('setup-hidden');
    box.innerHTML = hcOrientacionViveroHtml();
  } else {
    box.classList.add('setup-hidden');
    box.innerHTML = '';
  }
}

/** Al cambiar el cultivo en «Asignar», refresca el panel de germinación si está activo. */
function onTorreAssignVariedadGerminHint() {
  const or = document.getElementById('torreAssignOrigen');
  if (!or || normalizarOrigenPlanta(or.value) !== 'germinacion') return;
  const box = document.getElementById('torreAssignOrigenHint');
  if (!box) return;
  const nom = document.getElementById('torreAssignVariedad')?.value?.trim() || '';
  box.innerHTML = hcOrientacionGerminacionHtml(nom);
}

// Inicializar state DESPUÉS de declarar todas las variables
state = loadState();

function initState() {
  const torre = [];
  for (let n = 0; n < NUM_NIVELES; n++) {
    torre.push([]);
    for (let c = 0; c < NUM_CESTAS; c++) {
      torre[n].push({ variedad: '', fecha: '', notas: '', origenPlanta: '', fotos: [], fotoKeys: [] });
    }
  }
  const st = {
    torre,
    torres: [],
    torreActiva: 0,
    modo: 'vegetativo',
    mediciones: [],
    registro: [],
    ultimaMedicion: null,
    ultimaRecarga: null,
    /** epoch ms — oculta aviso urgente de recarga hasta esa hora */
    recargaSnoozeHasta: null,
    configAgua: 'destilada',
    configSustrato: 'esponja',
  };
  normalizarNotifOpcionesEnState(st);
  return st;
}


function saveState() {
  try {
    if (state && typeof hidrogrowAsegurarTorresSlotEnSnapshot === 'function') {
      hidrogrowAsegurarTorresSlotEnSnapshot(state);
    }
    // Multi-torre: la copia en state.torres[idx] es la que se rehidrata al abrir la app.
    // Sin esto, guardar solo state.torre (p. ej. tras editar una cesta) deja el slot obsoleto
    // y al recargar cargarEstadoTorre() sobrescribe la torre vacía → desaparecen plantas y el Diario.
    if (state && state.torres && state.torres.length > 0) {
      const okSaveSlot = guardarEstadoTorreActual();
      if (okSaveSlot === false) return false;
    }
    const snapshot = hidrogrowPrepararSnapshotPersistencia(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    // Verificar que se guardó correctamente
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) console.error('Error: estado no guardado en localStorage');
    return true;
  } catch(e) {
    console.error('Error saving state:', e);
    // Si falla por cuota, intentar limpiar datos antiguos
    if (e.name === 'QuotaExceededError') {
      try {
        // Liberar espacio: eliminar base64 pesados del state (las fotos YA están en IndexedDB)
        compactarStateFotos();
        localStorage.removeItem('hc_auth');
        const snapshotRetry = hidrogrowPrepararSnapshotPersistencia(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshotRetry));
        return true;
      } catch(e2) { console.error('No se pudo guardar:', e2); }
    }
    return false;
  }
}

function compactarStateFotos() {
  try {
    // Cestas: dejar solo keys (fotoKeys) y máximo 1 thumbnail con data
    for (let n = 0; n < (state.torre || []).length; n++) {
      for (let c = 0; c < (state.torre[n] || []).length; c++) {
        const cesta = state.torre[n][c];
        if (!cesta) continue;
        if (Array.isArray(cesta.fotos) && cesta.fotos.length > 0) {
          // Asegurar fotoKeys
          if (!Array.isArray(cesta.fotoKeys)) cesta.fotoKeys = [];
          cesta.fotos.forEach(f => { if (f?.key && !cesta.fotoKeys.includes(f.key)) cesta.fotoKeys.push(f.key); });
          // Mantener solo la última con data (si existe), el resto sin data
          let lastWithData = null;
          for (let i = cesta.fotos.length - 1; i >= 0; i--) {
            if (cesta.fotos[i]?.data) { lastWithData = cesta.fotos[i]; break; }
          }
          cesta.fotos = lastWithData ? [{ ...lastWithData, data: lastWithData.data }] : [];
        }
      }
    }

    // Registro: eliminar fotoData base64, mantener fotoKey
    if (Array.isArray(state.registro)) {
      state.registro.forEach(e => {
        if (e && e.tipo === 'foto' && e.fotoData) delete e.fotoData;
        if (e && e.tipo === 'foto_sistema' && e.fotoData) delete e.fotoData;
      });
    }
    if (state.fotosSistemaCompleto && Array.isArray(state.fotosSistemaCompleto.fotos)) {
      const arr = state.fotosSistemaCompleto.fotos;
      let lastWithData = null;
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i]?.data) {
          lastWithData = arr[i];
          break;
        }
      }
      state.fotosSistemaCompleto.fotos = lastWithData
        ? [{ ...lastWithData, data: lastWithData.data }]
        : [];
    }
  } catch(_) {}
}

/** Claves opcionales de localStorage que acompañan al estado principal */
const LOCALSTORAGE_EXTRA_BACKUP_KEYS = [
  'hc_auth',
  AUTH_REMEMBER_MIN_KEY,
  TUTORIAL_ASIGNAR_LS,
  TUTORIAL_EDITAR_LS,
  TUTORIAL_TORRE_TAB_LS,
  TORRE_SWIPE_HINT_LS,
];

function crearPuntoRestauracionLocal(opts = {}) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length < 2) return false;
    JSON.parse(raw);
    const extraKeys = {};
    LOCALSTORAGE_EXTRA_BACKUP_KEYS.forEach((k) => {
      try {
        const v = localStorage.getItem(k);
        if (v != null && v !== '') extraKeys[k] = v;
      } catch (_) {}
    });
    const snapshot = {
      hidrogrowAutoRestore: true,
      capturedAt: new Date().toISOString(),
      reason: opts.reason || 'version-change',
      fromVersion: opts.fromVersion || null,
      toVersion: opts.toVersion || APP_BUILD_VERSION,
      main: raw,
      extraKeys,
    };
    localStorage.setItem(AUTO_RESTORE_POINT_KEY, JSON.stringify(snapshot));
    if (opts.fromVersion || opts.toVersion) {
      localStorage.setItem(
        AUTO_RESTORE_POINT_TRANSITION_KEY,
        String((opts.fromVersion || 'none') + '->' + (opts.toVersion || APP_BUILD_VERSION))
      );
    }
    return true;
  } catch (_) {
    return false;
  }
}

function gestionarCambioVersionEnArranque() {
  try {
    const prev = localStorage.getItem(APP_BUILD_VERSION_KEY) || '';
    if (prev === APP_BUILD_VERSION) return;

    const transition = String((prev || 'none') + '->' + APP_BUILD_VERSION);
    const yaGuardada = localStorage.getItem(AUTO_RESTORE_POINT_TRANSITION_KEY) === transition;
    localStorage.setItem(APP_BUILD_VERSION_KEY, APP_BUILD_VERSION);
    if (!yaGuardada) {
      const backupOpts = {
        reason: 'before-version-upgrade',
        fromVersion: prev || null,
        toVersion: APP_BUILD_VERSION,
      };
      const runBackup = function () {
        try {
          crearPuntoRestauracionLocal(backupOpts);
        } catch (_) {}
      };
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(runBackup, { timeout: 4000 });
      } else {
        setTimeout(runBackup, 50);
      }
    }
    showToast('ℹ️ Nueva versión detectada. Recomendado: Exportar copia de seguridad ahora.');
  } catch (_) {}
}

async function exportarEstadoHidroCultivo() {
  try {
    if (state && state.torres && state.torres.length > 0) guardarEstadoTorreActual();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length < 2) {
      showToast('No hay datos que exportar', true);
      return;
    }
    JSON.parse(raw);
    const extraKeys = {};
    LOCALSTORAGE_EXTRA_BACKUP_KEYS.forEach((k) => {
      try {
        const v = localStorage.getItem(k);
        if (v != null && v !== '') extraKeys[k] = v;
      } catch (e) {}
    });
    const bundle = {
      hidrogrowBackup: true,
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'HidroGrow',
      main: raw,
      extraKeys,
    };
    const json = JSON.stringify(bundle, null, 2);
    const fname = 'hidrogrow-backup-' + new Date().toISOString().slice(0, 10) + '.json';

    const cap = window.hcCapacitorBackup;
    if (cap && typeof cap.isNative === 'function' && typeof cap.exportAndShare === 'function') {
      try {
        if (await cap.isNative()) {
          await cap.exportAndShare(json, fname);
          showToast('✅ Copia lista (todas las instalaciones) — elige dónde guardarla o compartir');
          return;
        }
      } catch (e) {
        showToast('Compartir (nativo): ' + (e && e.message ? e.message : e) + ' — probando descarga', true);
      }
    }

    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = fname;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ Copia descargada — incluye todas las instalaciones; guárdala en un lugar seguro');
  } catch (e) {
    showToast('Error al exportar: ' + (e && e.message ? e.message : e), true);
  }
}

function importarEstadoHidroCultivoClick() {
  const el = document.getElementById('inputImportEstado');
  if (!el) return;
  try {
    if (typeof el.showPicker === 'function') {
      el.showPicker();
      return;
    }
  } catch (e) {}
  el.click();
}

async function onImportEstadoFileSelected(ev) {
  const input = ev.target;
  const f = input && input.files && input.files[0];
  if (input) input.value = '';
  if (!f) return;
  try {
    const text = await f.text();
    const parsed = JSON.parse(text);
    let mainStr = null;
    if (
      parsed &&
      (parsed.hidrogrowBackup === true || parsed.hidrocultivoBackup === true) &&
      typeof parsed.main === 'string'
    ) {
      mainStr = parsed.main;
    } else if (parsed && Array.isArray(parsed.torre)) {
      mainStr = JSON.stringify(parsed);
    }
    if (!mainStr) {
      showToast('Archivo no reconocido (usa una copia exportada desde esta app o el JSON completo del estado)', true);
      return;
    }
    JSON.parse(mainStr);
    if (!confirm('Se reemplazará todo el estado actual en este navegador (todas las instalaciones, mediciones y ajustes) por la copia. ¿Continuar?')) return;
    if (!confirm('Segunda confirmación — no se puede deshacer.')) return;
    localStorage.setItem(STORAGE_KEY, mainStr);
    if (parsed.extraKeys && typeof parsed.extraKeys === 'object') {
      Object.keys(parsed.extraKeys).forEach((k) => {
        try {
          const v = parsed.extraKeys[k];
          if (v != null && String(v) !== '') localStorage.setItem(k, String(v));
        } catch (e2) {}
      });
    }
    showToast('✅ Copia importada — recargando…');
    setTimeout(() => { location.reload(); }, 500);
  } catch (e) {
    showToast('Error al importar: ' + (e && e.message ? e.message : e), true);
  }
}

function restaurarPuntoAutomaticoLocal() {
  try {
    const raw = localStorage.getItem(AUTO_RESTORE_POINT_KEY);
    if (!raw) {
      showToast('No hay punto automático disponible en este dispositivo', true);
      return;
    }
    const snap = JSON.parse(raw);
    if (!snap || !snap.main || typeof snap.main !== 'string') {
      showToast('Punto automático inválido', true);
      return;
    }
    JSON.parse(snap.main);
    const fecha = snap.capturedAt ? new Date(snap.capturedAt).toLocaleString() : 'fecha desconocida';
    if (!confirm('Se restaurará el último punto automático local (' + fecha + '). ¿Continuar?')) return;
    if (!confirm('Segunda confirmación — reemplazará el estado actual.')) return;
    localStorage.setItem(STORAGE_KEY, snap.main);
    if (snap.extraKeys && typeof snap.extraKeys === 'object') {
      Object.keys(snap.extraKeys).forEach((k) => {
        try {
          const v = snap.extraKeys[k];
          if (v != null && String(v) !== '') localStorage.setItem(k, String(v));
        } catch (_) {}
      });
    }
    showToast('✅ Punto automático restaurado — recargando…');
    setTimeout(() => location.reload(), 500);
  } catch (e) {
    showToast('No se pudo restaurar el punto automático: ' + (e && e.message ? e.message : e), true);
  }
}

