/**
 * Multi-torre (initTorres, …), badges nutriente, notificaciones locales.
 * Tras app-hc-setup-onboarding.js. Siguiente: app-hc-pwa-fotodb.js.
 */
// ══════════════════════════════════════════════════
// SISTEMA MULTI-TORRE
// ══════════════════════════════════════════════════

const MAX_TORRES = 10;

function hcClonePlainData(value, fallback = null) {
  if (value == null) return fallback;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return fallback;
  }
}

function hcEtiquetaTipoInstalacion(tipo) {
  if (tipo === 'rdwc') return 'RDWC';
  return 'DWC';
}

function hcNormalizarConfigSegunTipo(cfg) {
  const c = hcClonePlainData(cfg, {}) || {};
  if (typeof hidrogrowMigrarConfigInstalacion === 'function') hidrogrowMigrarConfigInstalacion(c);
  const tipo = tipoInstalacionNormalizado(c);
  c.tipoInstalacion = tipo;
  const prefixes = [
    { tipo: 'dwc', prefijo: 'dwc' },
    { tipo: 'rdwc', prefijo: 'rdwc' },
  ];
  const removedKeys = [];
  prefixes.forEach(rule => {
    if (rule.tipo === tipo) return;
    Object.keys(c).forEach(k => {
      if (!k || !k.startsWith(rule.prefijo)) return;
      if (c[k] == null || c[k] === '') {
        delete c[k];
        return;
      }
      removedKeys.push(k);
      delete c[k];
    });
  });
  return { tipo, config: c, removedKeys };
}

function hcEvaluarIntegridadGuardadoInstalacion(slot, candidateCfg) {
  const normalized = hcNormalizarConfigSegunTipo(candidateCfg);
  const prevCfg = slot && slot.config && typeof slot.config === 'object' ? slot.config : null;
  const prevTipo =
    prevCfg && prevCfg.tipoInstalacion
      ? tipoInstalacionNormalizado(prevCfg)
      : '';
  const nextTipo =
    normalized.config && normalized.config.tipoInstalacion
      ? tipoInstalacionNormalizado(normalized.config)
      : normalized.tipo;
  const prevConfirmada = !!(prevCfg && prevCfg.checklistInstalacionConfirmada === true);
  const blocked =
    !!(
      prevTipo &&
      nextTipo &&
      prevTipo !== nextTipo &&
      prevConfirmada
    );
  return {
    ok: !blocked,
    prevTipo,
    nextTipo,
    normalizedConfig: normalized.config,
    removedKeys: normalized.removedKeys,
    message: blocked
      ? 'Se bloqueó el guardado para proteger la instalación activa: era ' +
        hcEtiquetaTipoInstalacion(prevTipo) +
        ' y se intentaba guardar como ' +
        hcEtiquetaTipoInstalacion(nextTipo) +
        '.'
      : '',
  };
}

function hcCapturarSnapshotSeguridadTorre(idx, reason) {
  initTorres();
  const i = Number.isFinite(idx) && idx >= 0 ? idx : (state.torreActiva || 0);
  const slot = state.torres && state.torres[i];
  if (!slot) return false;
  const prev = slot.safetySnapshot;
  const now = Date.now();
  const prevTs = prev && prev.capturedAtMs ? Number(prev.capturedAtMs) : 0;
  const prevReason = prev && prev.reason ? String(prev.reason) : '';
  if (prevTs > 0 && now - prevTs < 90000 && prevReason === String(reason || 'manual')) {
    return false;
  }
  const activa = i === (state.torreActiva || 0);
  const cfgRaw = activa ? state.configTorre : slot.config;
  const norm = hcNormalizarConfigSegunTipo(cfgRaw);
  slot.safetySnapshot = {
    capturedAt: new Date(now).toISOString(),
    capturedAtMs: now,
    reason: String(reason || 'manual'),
    tipoInstalacion: norm.tipo,
    nombre: (String(slot.nombre || '').trim() || 'Instalación'),
    config: hcClonePlainData(norm.config, null),
    torre: hcClonePlainData(activa ? state.torre : slot.torre, []),
    modoActual: activa ? modoActual : slot.modoActual,
    fotosSistemaCompleto: hcClonePlainData(
      activa ? state.fotosSistemaCompleto : slot.fotosSistemaCompleto,
      { fotoKeys: [], fotos: [] }
    ),
  };
  return true;
}

function hcCrearNombreInstalacionPorTipo(tipo, ordinal) {
  const base = tipo === 'rdwc' ? 'RDWC' : 'DWC';
  return base + ' ' + ordinal;
}

/** Banner en pestaña Mediciones — oculto (menos ruido visual). */
function refrescarMedirDatosFacilesBanner(cfg) {
  const el = document.getElementById('medirDatosFacilesBanner');
  if (!el) return;
  el.classList.add('setup-hidden');
  el.textContent = '';
}

function hcAppendNuevaInstalacionDesdeEstado(opts) {
  initTorres();
  if (!Array.isArray(state.torres)) state.torres = [];
  if (state.torres.length >= MAX_TORRES) return -1;
  const o = opts || {};
  const tipo = tipoInstalacionNormalizado(state.configTorre || {});
  const nuevaTorre = {
    id: Date.now(),
    nombre: String(o.nombre || hcCrearNombreInstalacionPorTipo(tipo, state.torres.length + 1)).trim(),
    emoji: emojiMigracionPorTipoInstalacion({ tipoInstalacion: tipo }),
    config: hcClonePlainData(hcNormalizarConfigSegunTipo(state.configTorre || {}).config, null),
    torre: hcClonePlainData(state.torre, []),
    modoActual: modoActual || 'vegetativo',
    mediciones: o.clearHistory === false ? hcClonePlainData(state.mediciones, []) : [],
    registro: o.clearHistory === false ? hcClonePlainData(state.registro, []) : [],
    ultimaMedicion: o.clearHistory === false && state.ultimaMedicion ? { ...state.ultimaMedicion } : null,
    ultimaRecarga: o.clearHistory === false ? (state.ultimaRecarga ?? null) : null,
    recargaSnoozeHasta: o.clearHistory === false ? (state.recargaSnoozeHasta ?? null) : null,
    notifOpciones:
      o.notifOpciones && typeof o.notifOpciones === 'object'
        ? {
            recarga: !!o.notifOpciones.recarga,
            medicion: !!o.notifOpciones.medicion,
            cosecha: !!o.notifOpciones.cosecha,
            esquejes: !!o.notifOpciones.esquejes,
          }
        : { recarga: false, medicion: false, cosecha: false },
    fotosSistemaCompleto:
      o.clearHistory === false
        ? hcClonePlainData(state.fotosSistemaCompleto, { fotoKeys: [], fotos: [] })
        : { fotoKeys: [], fotos: [] },
  };
  state.torres.push(nuevaTorre);
  const newIdx = state.torres.length - 1;
  state.torreActiva = newIdx;
  cargarEstadoTorre(newIdx);
  return newIdx;
}

function emojiMigracionPorTipoInstalacion(cfg) {
  const cam =
    cfg &&
    (cfg.caminoCultivo || (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) || '');
  if (cam === 'semilla_propagador') return '🫧';
  const tipo = cfg && cfg.tipoInstalacion ? tipoInstalacionNormalizado(cfg) : '';
  if (typeof emojiSistemaPorTipo === 'function') return emojiSistemaPorTipo(tipo || 'dwc');
  if (!tipo) return '🫧';
  if (tipo === 'dwc') return '🫧';
  if (tipo === 'rdwc') return '♻️';
  return '🫧';
}

function emojiSistemaUiPorTorre(t) {
  const cfg = t && t.config ? t.config : null;
  const tipo = tipoInstalacionNormalizado(cfg);
  if (typeof emojiSistemaPorTipo === 'function') return emojiSistemaPorTipo(tipo);
  return (t && t.emoji) || '🌿';
}

function hcTorreTienePlantasAsignadas(torreMat) {
  if (!Array.isArray(torreMat)) return false;
  return torreMat.some(
    (nivel) =>
      Array.isArray(nivel) && nivel.some((c) => c && String(c.variedad || '').trim())
  );
}

function hcCaminoGermSemillaEnSlot(cfg) {
  const cam =
    cfg &&
    (cfg.caminoCultivo ||
      (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) ||
      '');
  return cam === 'semilla_propagador' || cam === 'semilla_hidro';
}

function hcSlotTienePlanGerminacion(cfg, g, prem) {
  g = g || (cfg && cfg.germinacionFlow) || {};
  prem = prem || (cfg && cfg.premiumSetup) || {};
  return !!(
    String(g.variedadId || g.variedad || prem.variedadGerminacion || '').trim() ||
    (Number.isFinite(g.numSemillas) && g.numSemillas >= 1) ||
    (Number.isFinite(prem.numSemillasGerm) && prem.numSemillasGerm >= 1) ||
    String(prem.fechaSiembraGerm || g.fechaSiembraGerm || g.startedAt || '').trim()
  );
}

function hcSlotTienePrepCaminoSemilla(cfg) {
  if (!cfg || typeof cfg !== 'object') return false;
  return !!(
    cfg.salaPreGermConfigAt ||
    cfg.propagadorMontajeChecks ||
    cfg.preparacionGermHidroChecks ||
    (cfg.puestaMarchaChecks && typeof cfg.puestaMarchaChecks === 'object' && Object.keys(cfg.puestaMarchaChecks).length) ||
    cfg.germinacionFlow ||
    cfg.hcSetupFase === 'germinacion'
  );
}

/** Ranura creada solo por migración/plantilla sin datos reales del usuario. */
function hcEsSlotInstalacionFantasma(t) {
  if (!t || typeof t !== 'object') return true;
  const cfg = t.config;
  if (hcCaminoGermSemillaEnSlot(cfg)) {
    if (cfg.hcPlantillaAutogenerada && !hcTorreTienePlantasAsignadas(t.torre)) {
      const g = cfg.germinacionFlow || {};
      const prem = cfg.premiumSetup || {};
      if (!hcSlotTienePlanGerminacion(cfg, g, prem) && !hcSlotTienePrepCaminoSemilla(cfg)) {
        return true;
      }
    }
    return false;
  }
  if (cfg && cfg.checklistInstalacionConfirmada === true) return false;
  if (cfg && cfg.nutriente && !cfg.hcPlantillaAutogenerada) return false;
  const hasMed = Array.isArray(t.mediciones) && t.mediciones.length > 0;
  const hasRec = !!(t.ultimaRecarga);
  const hasReg =
    Array.isArray(t.registro) && t.registro.some((r) => r && (r.tipo === 'recarga' || r.tipo === 'medicion'));
  if (hasMed || hasRec || hasReg) return false;
  if (hcTorreTienePlantasAsignadas(t.torre)) return false;
  if (cfg && cfg.hcPlantillaAutogenerada) return true;
  const nom = String(t.nombre || '').trim();
  if ((nom === 'Mi instalación' || nom === 'Instalación') && (!cfg || !cfg.nutriente)) return true;
  return false;
}

function hcLegacyMereceMigrarASlot(cfg, st) {
  if (!cfg || typeof cfg !== 'object') return false;
  if (cfg.hcPlantillaAutogenerada && !cfg.checklistInstalacionConfirmada) {
    if (cfg.nutriente) return true;
    if (st && Array.isArray(st.mediciones) && st.mediciones.length > 0) return true;
    if (st && st.ultimaRecarga) return true;
    if (st && hcTorreTienePlantasAsignadas(st.torre)) return true;
    return false;
  }
  const cam =
    cfg.caminoCultivo || (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) || '';
  if (cam === 'semilla_propagador' || cam === 'semilla_hidro') {
    return !!(
      cfg.germinacionFlow ||
      cfg.preparacionGermHidroChecks ||
      cfg.propagadorMontajeChecks ||
      cfg.salaPreGermConfigAt ||
      cfg.nutriente ||
      cfg.checklistInstalacionConfirmada ||
      (st && hcTorreTienePlantasAsignadas(st.torre)) ||
      (st && Array.isArray(st.mediciones) && st.mediciones.length > 0)
    );
  }
  if (cfg.hcSetupFase === 'germinacion' && cam) return true;
  if (cfg.germinacionFlow && typeof cfg.germinacionFlow === 'object') return true;
  if (cfg.salaPreGermConfigAt || cfg.propagadorMontajeChecks || cfg.preparacionGermHidroChecks) return true;
  if (cfg.checklistInstalacionConfirmada === true) return true;
  if (cfg.nutriente) return true;
  return false;
}

/** Crea `state.torres[0]` desde config guardada si el camino propagador no tenía ranura. */
function hcAsegurarSlotInstalacionDesdeConfig() {
  if (!state || typeof state !== 'object') return;
  if (!Array.isArray(state.torres)) state.torres = [];
  if (state.torres.some((t) => !hcEsSlotInstalacionFantasma(t))) return;
  const cfg = state.configTorre;
  if (!cfg || typeof cfg !== 'object') return;
  if (typeof hidrogrowInstalacionPersistible === 'function' && !hidrogrowInstalacionPersistible(state)) {
    return;
  }
  const cam =
    (typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '') ||
    cfg.caminoCultivo ||
    (cfg.premiumSetup && cfg.premiumSetup.caminoCultivo) ||
    '';
  const nom =
    String(cfg.nombreTorre || cfg.nombreInstalacion || '').trim() ||
    (cam === 'semilla_propagador'
      ? 'Germinación · propagador'
      : cam === 'semilla_hidro'
        ? 'Germinación · hidro'
        : 'Mi instalación');
  state.torres = [
    {
      id: cfg.id || Date.now(),
      nombre: nom,
      emoji: emojiMigracionPorTipoInstalacion(cfg),
      config: hcClonePlainData(cfg, null),
      torre: hcClonePlainData(state.torre, []),
      modoActual: modoActual || 'vegetativo',
      mediciones: hcClonePlainData(state.mediciones, []),
      registro: hcClonePlainData(state.registro, []),
      ultimaMedicion: state.ultimaMedicion ? { ...state.ultimaMedicion } : null,
      ultimaRecarga: state.ultimaRecarga ?? null,
      recargaSnoozeHasta: state.recargaSnoozeHasta ?? null,
      notifOpciones: { recarga: false, medicion: false, cosecha: false, esquejes: false },
      fotosSistemaCompleto: hcClonePlainData(state.fotosSistemaCompleto, { fotoKeys: [], fotos: [] }),
    },
  ];
  state.torreActiva = 0;
  try {
    if (typeof saveState === 'function') saveState();
  } catch (_) {}
}

function hcMigrarLegacyTorresSiProcede() {
  if (!Array.isArray(state.torres)) state.torres = [];
  if (state.torres.length > 0) {
    const antes = state.torres.length;
    state.torres = state.torres.filter((t) => !hcEsSlotInstalacionFantasma(t));
    if (state.torres.length !== antes) {
      if (!state.torres.length) state.torreActiva = 0;
      else if ((state.torreActiva || 0) >= state.torres.length) {
        state.torreActiva = 0;
      }
      saveState();
    }
    return;
  }
  if (!hcLegacyMereceMigrarASlot(state.configTorre, state)) {
    hcAsegurarSlotInstalacionDesdeConfig();
    return;
  }
  const cfg = state.configTorre;
  const camLegacy =
    (typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '') || '';
  const nomLegacy =
    (cfg && String(cfg.nombreInstalacion || cfg.nombreTorre || '').trim()) ||
    (camLegacy === 'semilla_propagador' ? 'Germinación · propagador' : '');
  state.torres = [
    {
      id: Date.now(),
      nombre: nomLegacy || 'Mi instalación',
      emoji: emojiMigracionPorTipoInstalacion(cfg),
      config: hcClonePlainData(cfg, null),
      torre: hcClonePlainData(state.torre, []),
      modoActual: modoActual || 'vegetativo',
      mediciones: hcClonePlainData(state.mediciones, []),
      registro: hcClonePlainData(state.registro, []),
      ultimaMedicion: state.ultimaMedicion ? { ...state.ultimaMedicion } : null,
      ultimaRecarga: state.ultimaRecarga ?? null,
      recargaSnoozeHasta: state.recargaSnoozeHasta ?? null,
      notifOpciones: { recarga: false, medicion: false, cosecha: false, esquejes: false },
      fotosSistemaCompleto: hcClonePlainData(state.fotosSistemaCompleto, { fotoKeys: [], fotos: [] }),
    },
  ];
  state.torreActiva = 0;
  saveState();
}

function hcTieneInstalacionesUsuario() {
  if (!state || typeof state !== 'object') return false;
  if (!Array.isArray(state.torres)) state.torres = [];
  if (!state.torres.length) return false;
  return state.torres.some((t) => !hcEsSlotInstalacionFantasma(t));
}

/** Estado en memoria cuando aún no hay ninguna instalación guardada en `state.torres`. */
function hcPrepararEstadoSinInstalacionEnMemoria() {
  state.torreActiva = 0;
  state.torre = [];
  const nNiv = typeof NUM_NIVELES !== 'undefined' ? NUM_NIVELES : 5;
  const nCes = typeof NUM_CESTAS !== 'undefined' ? NUM_CESTAS : 5;
  for (let n = 0; n < nNiv; n++) {
    state.torre.push([]);
    for (let c = 0; c < nCes; c++) {
      state.torre[n].push({
        variedad: '',
        fecha: '',
        notas: '',
        origenPlanta: '',
        fotos: [],
        fotoKeys: [],
      });
    }
  }
  state.mediciones = [];
  state.registro = [];
  state.ultimaMedicion = null;
  state.ultimaRecarga = null;
  state.recargaSnoozeHasta = null;
  state.configTorre = null;
  state.fotosSistemaCompleto = { fotoKeys: [], fotos: [] };
  try {
    delete state.hcPostSetupChecklistPendiente;
  } catch (_) {}
}

function hcCopyDashSinInstalacion(cfg) {
  return {
    label: 'Primera configuración',
    lead: 'Abre el asistente y elige cómo empiezas el cultivo (semilla, clon o madre).',
    btn: 'Abrir asistente',
  };
}

function hcAbrirPrimeraInstalacion() {
  if (typeof hcAbrirAsistenteCaminoSiSinInstalacion === 'function') {
    hcAbrirAsistenteCaminoSiSinInstalacion();
    return;
  }
  if (typeof abrirSetupNuevaTorre === 'function') {
    abrirSetupNuevaTorre();
    return;
  }
  if (typeof abrirSetup === 'function') abrirSetup();
}

/** Nombre de genética en uso (solo texto, sin rótulos). */
function hcResolverNombreVariedadInstalacion(cfg) {
  cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
  if (typeof getPlanGermEstado === 'function') {
    const st = getPlanGermEstado(cfg);
    const nomPlan = String(st.nombreVar || '').trim();
    if (nomPlan) return nomPlan;
    const vidPlan = String(st.variedad || '').trim();
    if (vidPlan) {
      const cuPlan = typeof getCultivoDB === 'function' ? getCultivoDB(vidPlan) : null;
      if (typeof cultivoNombreLista === 'function') return cultivoNombreLista(cuPlan, vidPlan);
      return vidPlan;
    }
  }
  if (typeof torreVariedadesIdsAsignadas === 'function') {
    const ids = torreVariedadesIdsAsignadas();
    if (ids.length) {
      return ids
        .map(function (id) {
          const cult = typeof getCultivoDB === 'function' ? getCultivoDB(id) : null;
          return typeof cultivoNombreLista === 'function'
            ? cultivoNombreLista(cult, id)
            : String(id);
        })
        .join(' · ');
    }
  }
  const prem = cfg.premiumSetup || {};
  const g = cfg.germinacionFlow || {};
  const vidFallback = String(g.variedadId || prem.variedadGerminacion || '').trim();
  if (vidFallback) {
    const cuFb = typeof getCultivoDB === 'function' ? getCultivoDB(vidFallback) : null;
    if (typeof cultivoNombreLista === 'function') return cultivoNombreLista(cuFb, vidFallback);
    return vidFallback;
  }
  return '';
}

function hcRefreshDashInstalacionVariedad(cfg) {
  cfg = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
  const el = document.getElementById('dashInstalacionVariedad');
  if (!el) return;
  const hay =
    typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario();
  const nombre = hay ? hcResolverNombreVariedadInstalacion(cfg) : '';
  el.textContent = nombre;
  el.classList.toggle('setup-hidden', !hay || !nombre);
}

function hcRefreshDashSinInstalacionUi() {
  const hay = hcTieneInstalacionesUsuario();
  const banner = document.getElementById('dashTorreBanner');
  const label = document.getElementById('dashInstalacionLabel');
  const cta = document.getElementById('dashSinInstalacionCta');
  const leadEl = document.getElementById('dashSinInstalacionLead');
  const btnEl = cta && cta.querySelector('.dash-sin-instalacion-btn');
  const opRow = document.querySelector('.dash-operativa-row');
  const lifecycle = document.getElementById('dashInstalacionLifecycle');
  const rutina = document.getElementById('dashRutinaDia');
  const copy = hcCopyDashSinInstalacion();
  if (banner) banner.classList.toggle('setup-hidden', !hay);
  if (label) {
    label.classList.toggle('setup-hidden', !hay);
    if (hay) label.textContent = 'Instalación seleccionada';
    else label.textContent = copy.label;
  }
  if (cta) cta.classList.toggle('setup-hidden', hay);
  if (!hay) {
    if (leadEl) leadEl.textContent = copy.lead;
    if (btnEl) btnEl.textContent = copy.btn;
  }
  const cfgDashUi = state.configTorre || {};
  const ocultarOpPropag =
    typeof hcSistemaPropagadorSinHidro === 'function' && hcSistemaPropagadorSinHidro(cfgDashUi);
  if (opRow) opRow.classList.toggle('setup-hidden', !hay || ocultarOpPropag);
  if (lifecycle && !hay) lifecycle.classList.add('setup-hidden');
  if (rutina && !hay) rutina.classList.add('setup-hidden');
  try {
    if (typeof refreshDashSalaEquipRecoBanner === 'function') refreshDashSalaEquipRecoBanner();
  } catch (_) {}
  try {
    if (typeof refreshDashPropagadorRutaRail === 'function') refreshDashPropagadorRutaRail(cfgDashUi);
  } catch (_) {}
  hcRefreshDashInstalacionVariedad(cfgDashUi);
}

// Inicializar sistema de torres (sin crear «Mi instalación» por defecto)
function initTorres() {
  if (!state || typeof state !== 'object') {
    try {
      state = typeof initState === 'function' ? initState() : { torres: [], torre: [], torreActiva: 0 };
    } catch (_) {
      state = { torres: [], torre: [], torreActiva: 0 };
    }
  }
  if (!Array.isArray(state.torres)) state.torres = [];
  hcMigrarLegacyTorresSiProcede();
  if (!Array.isArray(state.torres)) state.torres = [];
  let idSeq = Date.now();
  let idsReparados = false;
  let emojisMigrados = false;
  (state.torres || []).forEach(t => {
    if (t.id == null || t.id === '') {
      idSeq += 1;
      t.id = idSeq;
      idsReparados = true;
    }
    if (!t.fotosSistemaCompleto || typeof t.fotosSistemaCompleto !== 'object') {
      t.fotosSistemaCompleto = { fotoKeys: [], fotos: [] };
    } else {
      if (!Array.isArray(t.fotosSistemaCompleto.fotoKeys)) t.fotosSistemaCompleto.fotoKeys = [];
      if (!Array.isArray(t.fotosSistemaCompleto.fotos)) t.fotosSistemaCompleto.fotos = [];
    }
    const tipo = tipoInstalacionNormalizado(t && t.config ? t.config : null);
    if (tipo === 'dwc' && t.emoji === '🌊') {
      t.emoji = '🫧';
      emojisMigrados = true;
    }
  });
  if (idsReparados || emojisMigrados) saveState();
  if (typeof hcAsegurarSlotInstalacionDesdeConfig === 'function') {
    hcAsegurarSlotInstalacionDesdeConfig();
  }
  if (typeof normalizarNotifOpcionesEnState === 'function') normalizarNotifOpcionesEnState(state);
}

function getTorreActiva() {
  initTorres();
  if (!hcTieneInstalacionesUsuario()) return null;
  const idx = state.torreActiva || 0;
  return state.torres[idx] || state.torres[0] || null;
}

/**
 * Alinea `state.ultimaMedicion`, recarga y snooze con el **slot** de la instalación activa.
 * Evita mostrar en Inicio datos de otra instalación si el estado global quedó desincronizado.
 */
function sincronizarUltimaMedicionYRecargaDesdeTorreActiva() {
  initTorres();
  const idx = state.torreActiva || 0;
  const t = state.torres && state.torres[idx];
  if (!t) return;
  const umSlot = t.ultimaMedicion;
  if (umSlot && typeof umSlot === 'object') {
    state.ultimaMedicion = { ...umSlot };
  } else {
    const med0 = (t.mediciones || []).find(m => m && (m.tipo === 'medicion' || !m.tipo));
    state.ultimaMedicion = med0
      ? {
          fecha: med0.fecha,
          hora: med0.hora,
          ec: med0.ec,
          ph: med0.ph,
          temp: med0.temp,
          vol: med0.vol,
          humSustrato: med0.humSustrato,
        }
      : null;
  }
  state.ultimaRecarga = t.ultimaRecarga != null ? t.ultimaRecarga : null;
  state.recargaSnoozeHasta = t.recargaSnoozeHasta != null ? t.recargaSnoozeHasta : null;
}


// Actualizar todos los datos de la torre activa
function actualizarTorreActual() {
  if (state.configTorre) {
    try {
      delete state.configTorre.hcPlantillaAutogenerada;
    } catch (_) {}
    state.configTorre.checklistInstalacionConfirmada = true;
    if (state.configTorre.tipoInstalacion === 'dwc') {
      try {
        dwcPersistSnapshotMaxCestasEnCfg(state.configTorre);
      } catch (eD) {}
    }
  }
  hcCapturarSnapshotSeguridadTorre(state.torreActiva || 0, 'system-update');
  guardarEstadoTorreActual();
  saveState();
  aplicarConfigTorre();
  try {
    if (state.configTorre && state.configTorre.tipoInstalacion === 'dwc') refreshDwcSistemaMedidasUI();
  } catch (eDwUi) {}
  renderTorre();
  updateTorreStats();
  updateDashboard();
  actualizarBadgesNutriente();
  // Recalcular plantas y edad automáticamente
  if (document.getElementById('tab-riego')?.classList.contains('active')) {
    actualizarVistaRiegoPorTipoInstalacion();
    calcularRiego();
  }
  if (document.getElementById('tab-meteo')?.classList.contains('active')) {
    cargarMeteo();
  }
  if (document.getElementById('tab-calendario')?.classList.contains('active')) {
    renderCalendario();
  }
  showToast('🔄 Instalación actualizada · ' + ((getTorreActiva()?.nombre || '').trim() || 'Instalación'));
}

var _hcCambiarTorreGen = 0;

function hcRefrescarUiTrasCambioTorre(tab) {
  tab = tab || (typeof currentTab !== 'undefined' ? currentTab : 'inicio');
  try {
    if (typeof hcInvalidateTabHeavyCache === 'function') hcInvalidateTabHeavyCache();
  } catch (_) {}
  try {
    if (typeof hcSincronizarUiInstalacionActiva === 'function') {
      hcSincronizarUiInstalacionActiva({ soloVisibilidad: tab !== 'inicio' });
    }
  } catch (_) {}
  try {
    if (typeof hcApplyCargarTorreRiegoPendiente === 'function') hcApplyCargarTorreRiegoPendiente();
  } catch (_) {}
  try {
    if (typeof hcApplyCargarTorreUiPendiente === 'function') {
      hcApplyCargarTorreUiPendiente({ tab: tab });
    }
  } catch (_) {}
  if (tab === 'sistema') {
    try {
      if (typeof renderTorre === 'function') renderTorre();
      if (typeof updateTorreStats === 'function') updateTorreStats();
      if (typeof renderCompatGrid === 'function') renderCompatGrid();
    } catch (_) {}
  } else if (tab === 'inicio') {
    try {
      if (typeof updateDashboard === 'function') {
        updateDashboard({ lite: true, forceTorreSwitch: true });
      }
      if (typeof refreshDashGerminacionHub === 'function') refreshDashGerminacionHub();
      if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
      if (typeof hcRefreshDashTorreBanner === 'function') hcRefreshDashTorreBanner();
    } catch (_) {}
  } else if (tab === 'sala') {
    try {
      if (typeof hcInvalidateSalaTabHeavyCache === 'function') hcInvalidateSalaTabHeavyCache();
      if (typeof hcRefreshSalaTab === 'function') {
        hcRefreshSalaTab({ deferHeavy: true, force: true });
      }
    } catch (_) {}
  } else if (tab === 'mediciones') {
    try {
      if (typeof refreshMedirGerminacionUi === 'function') refreshMedirGerminacionUi();
      if (typeof initConfigUI === 'function') initConfigUI();
    } catch (_) {}
  } else if (tab === 'riego') {
    try {
      if (typeof sincronizarInputsRiego === 'function') sincronizarInputsRiego();
      if (typeof actualizarVistaRiegoPorTipoInstalacion === 'function') {
        actualizarVistaRiegoPorTipoInstalacion();
      }
      if (typeof calcularRiego === 'function') calcularRiego({ forceRefresh: true });
    } catch (_) {}
  } else if (tab === 'meteo') {
    try {
      if (typeof cargarMeteo === 'function') cargarMeteo();
    } catch (_) {}
  } else if (tab === 'calendario') {
    try {
      if (typeof renderCalendario === 'function') renderCalendario();
    } catch (_) {}
  }
  try {
    if (typeof actualizarBadgesNutriente === 'function') actualizarBadgesNutriente();
  } catch (_) {}
  try {
    if (typeof refreshDashNotificacionesUI === 'function') refreshDashNotificacionesUI();
  } catch (_) {}
  try {
    if (typeof hcRefreshMultiSystemCoach === 'function') hcRefreshMultiSystemCoach();
  } catch (_) {}
}

function cambiarTorreActiva(idx) {
  idx = Number(idx);
  if (!Number.isFinite(idx) || idx < 0) return;
  if (!state.torres || !state.torres[idx]) return;
  if (idx === (state.torreActiva || 0)) {
    cerrarModalTorres();
    return;
  }

  guardarEstadoTorreActual();
  torreCestasMultiSel.clear();
  torreInteraccionModo = 'editar';

  state.torreActiva = idx;
  cargarEstadoTorre(idx);

  try {
    if (typeof saveState === 'function') saveState({ skipSlotGuard: true });
  } catch (_) {}

  cerrarModalTorres();
  actualizarHeaderTorre();
  try {
    if (typeof renderTorreInstalacionPicker === 'function') renderTorreInstalacionPicker();
  } catch (_) {}
  try {
    renderListaTorres();
  } catch (_) {}

  const _bE = document.getElementById('torreModoEditar');
  const _bA = document.getElementById('torreModoAsignar');
  const _pA = document.getElementById('torreAssignPanel');
  if (_bE) {
    _bE.classList.add('active');
    _bE.setAttribute('aria-pressed', 'true');
  }
  if (_bA) {
    _bA.classList.remove('active');
    _bA.setAttribute('aria-pressed', 'false');
  }
  if (_pA) _pA.style.display = 'none';
  actualizarBarraMultiSel();

  const t = state.torres[idx];
  const nombre = t && t.nombre ? String(t.nombre).trim() : '';
  showToast('🌿 Ahora en: ' + (nombre || 'Instalación'));

  window._meteoObsoleto = true;
  window._riegoObsoleto = true;
  try {
    if (typeof invalidateMeteoNomiCache === 'function') invalidateMeteoNomiCache();
  } catch (_) {}
  try {
    if (typeof hcInvalidateSalaTabHeavyCache === 'function') hcInvalidateSalaTabHeavyCache();
  } catch (_) {}

  const activeTab = typeof currentTab !== 'undefined' ? currentTab : 'inicio';
  try {
    if (typeof hcSincronizarUiInstalacionActiva === 'function') {
      hcSincronizarUiInstalacionActiva({});
    }
  } catch (_) {}
  try {
    if (typeof refreshTabsOperativaCamino === 'function') {
      refreshTabsOperativaCamino({ full: true, inmediato: true, tab: activeTab });
    }
  } catch (_) {}

  const gen = ++_hcCambiarTorreGen;
  const runDeferred = function () {
    if (gen !== _hcCambiarTorreGen) return;
    hcRefrescarUiTrasCambioTorre(activeTab);
  };
  requestAnimationFrame(function () {
    if (gen !== _hcCambiarTorreGen) return;
    setTimeout(runDeferred, 16);
  });
}

/** Cestas con cultivo asignado (para detectar datos de torre más recientes en la raíz del state). */
function contarPlantasEnTorre(torreArr) {
  if (!torreArr || !Array.isArray(torreArr)) return 0;
  let n = 0;
  for (let ni = 0; ni < torreArr.length; ni++) {
    const row = torreArr[ni];
    if (!Array.isArray(row)) continue;
    for (let ci = 0; ci < row.length; ci++) {
      const c = row[ci];
      if (c && String(c.variedad || '').trim() !== '') n++;
    }
  }
  return n;
}

/**
 * Tras versiones antiguas o guardados sin sync, state.torre podía tener plantas y el slot
 * state.torres[idx].torre quedar vacío/obsoleto. Al cargar, se perdía la torre en pantalla.
 * Copia la raíz al slot si la raíz lleva más plantas registradas.
 */
function reconciliarSlotTorreActivaAntesDeCargar() {
  if (!state.torres || !state.torres.length) return;
  const idx = state.torreActiva || 0;
  const t = state.torres[idx];
  if (!t) return;
  const nSlot = contarPlantasEnTorre(t.torre);
  const nRoot = contarPlantasEnTorre(state.torre);
  if (nRoot > nSlot) {
    try {
      t.torre = JSON.parse(JSON.stringify(state.torre));
    } catch (e) {}
  }
  if (!t.config && state.configTorre && typeof state.configTorre === 'object' && Object.keys(state.configTorre).length) {
    try {
      t.config = JSON.parse(JSON.stringify(state.configTorre));
    } catch (e) {}
  }
}

function guardarEstadoTorreActual() {
  if (!state.torres) return;
  const idx = state.torreActiva || 0;
  if (!state.torres[idx]) return;
  const slot = state.torres[idx];
  if (typeof hidrogrowMigrarConfigInstalacion === 'function') {
    hidrogrowMigrarConfigInstalacion(state.configTorre);
  }
  const integrity = hcEvaluarIntegridadGuardadoInstalacion(slot, state.configTorre || null);
  if (!integrity.ok) {
    state.torre = hcClonePlainData(slot.torre, []);
    state.mediciones = hcClonePlainData(slot.mediciones, []);
    state.registro = hcClonePlainData(slot.registro, []);
    state.configTorre = hcClonePlainData(slot.config, null);
    if (slot.ultimaMedicion && typeof slot.ultimaMedicion === 'object') state.ultimaMedicion = { ...slot.ultimaMedicion };
    else state.ultimaMedicion = null;
    state.ultimaRecarga = slot.ultimaRecarga ?? null;
    state.recargaSnoozeHasta = slot.recargaSnoozeHasta ?? null;
    ensureFotosSistemaCompletoState();
    state.fotosSistemaCompleto = hcClonePlainData(slot.fotosSistemaCompleto, { fotoKeys: [], fotos: [] });
    try {
      if (typeof showToast === 'function') showToast(integrity.message, true);
    } catch (_) {}
    return false;
  }
  if (integrity.removedKeys && integrity.removedKeys.length) {
    state.configTorre = hcClonePlainData(integrity.normalizedConfig, null);
  }
  state.torres[idx].torre      = hcClonePlainData(state.torre, []);
  state.torres[idx].modoActual = modoActual;
  state.torres[idx].mediciones = hcClonePlainData(state.mediciones, []);
  state.torres[idx].registro   = hcClonePlainData(state.registro, []);
  state.torres[idx].ultimaMedicion = state.ultimaMedicion
    ? { ...state.ultimaMedicion }
    : null;
  state.torres[idx].ultimaRecarga = state.ultimaRecarga ?? null;
  state.torres[idx].recargaSnoozeHasta = state.recargaSnoozeHasta ?? null;
  state.torres[idx].config     = hcClonePlainData(integrity.normalizedConfig, null);
  ensureFotosSistemaCompletoState();
  state.torres[idx].fotosSistemaCompleto = hcClonePlainData(state.fotosSistemaCompleto, { fotoKeys: [], fotos: [] });
  // Guardar configuración de riego: no machacar con valores por defecto del HTML si el input va vacío o inválido
  const prevR = state.torres[idx].riego || {};
  const nEl = document.getElementById('riegoNPlantas');
  const eEl = document.getElementById('riegoEdad');
  const nRaw = nEl && String(nEl.value || '').trim() !== '' ? parseInt(String(nEl.value).trim(), 10) : NaN;
  const eRaw = eEl && String(eEl.value || '').trim() !== '' ? parseFloat(String(eEl.value).trim().replace(',', '.')) : NaN;
  state.torres[idx].riego = {
    nPlantas: Number.isFinite(nRaw) && nRaw >= 1 ? nRaw : (Number.isFinite(prevR.nPlantas) && prevR.nPlantas >= 1 ? prevR.nPlantas : 15),
    edadSem: Number.isFinite(eRaw) && eRaw > 0 ? eRaw : (Number.isFinite(prevR.edadSem) && prevR.edadSem > 0 ? prevR.edadSem : 4),
    toldo: toldoDesplegado,
    tipoSombra:
      typeof riegoNormalizarTipoSombra === 'function'
        ? riegoNormalizarTipoSombra(riegoTipoSombra)
        : riegoTipoSombra,
    sombraAuto: riegoSombraAuto !== false,
    diaRiego: diaRiego,
  };
  if (!state.configTorre) state.configTorre = {};
  if (!state.configTorre.riego) state.configTorre.riego = {};
  state.configTorre.riego.toldo = !!toldoDesplegado;
  state.configTorre.riego.tipoSombra = state.torres[idx].riego.tipoSombra;
  state.configTorre.riego.sombraAuto = state.torres[idx].riego.sombraAuto;
  state.configTorre.riego.diaRiego = diaRiego === 'manana' ? 'manana' : 'hoy';
  return true;
}

function aplicarCargarTorreUiDesdeEstado(opts) {
  opts = opts && typeof opts === 'object' ? opts : {};
  const tab =
    opts.tab ||
    (document.getElementById('tab-mediciones')?.classList.contains('active')
      ? 'mediciones'
      : document.getElementById('tab-sala')?.classList.contains('active')
        ? 'sala'
        : document.getElementById('tab-meteo')?.classList.contains('active')
          ? 'meteo'
          : 'inicio');
  if (state.configTorre?.sustrato) state.configSustrato = state.configTorre.sustrato;
  aplicarConfigTorre();
  if (opts.boot && tab === 'inicio') {
    try {
      if (typeof refreshModoInfoText === 'function') refreshModoInfoText();
    } catch (_) {}
    return;
  }
  if (tab === 'mediciones' || tab === 'sala') {
    cargarUbicacionMedicionesUI();
    cargarInteriorGrowUI();
    if (typeof applyMedirCollapseUI === 'function') applyMedirCollapseUI();
    if (typeof initConfigUI === 'function') initConfigUI();
  }
  if (tab === 'meteo' || tab === 'mediciones' || tab === 'sala') {
    cargarLocalidadMeteoUI();
  }
  try {
    refreshUbicacionInstalacionUI();
  } catch (_) {}
  if (tab === 'riego' || tab === 'mediciones') {
    syncRiegoAvanzadoUI();
  }
  if (
    !opts.boot &&
    (document.getElementById('tab-sala')?.classList.contains('active') ||
      document.getElementById('tab-mediciones')?.classList.contains('active'))
  ) {
    if (typeof initConfigUI === 'function') initConfigUI();
  }
  try {
    if (typeof updateRecargaBar === 'function' && (tab === 'inicio' || tab === 'mediciones' || tab === 'sala')) {
      updateRecargaBar();
    }
  } catch (_) {}
  try {
    if (typeof refreshModoInfoText === 'function') refreshModoInfoText();
  } catch (_) {}
  if (!opts.boot) {
    try {
      if (typeof hcSincronizarUiInstalacionActiva === 'function') {
        hcSincronizarUiInstalacionActiva({ soloVisibilidad: true });
      }
    } catch (_) {}
  }
}

function cargarEstadoTorre(idx, opts) {
  const deferUi = !!(opts && opts.deferUi);
  const t = state.torres[idx];
  if (!t) return;
  // Restaurar datos de esta torre
  state.torre       = hcClonePlainData(t.torre, []);
  state.mediciones  = hcClonePlainData(t.mediciones, []);
  state.registro    = hcClonePlainData(t.registro, []);
  try {
    state.configTorre = hcClonePlainData(hcNormalizarConfigSegunTipo(t.config).config, null);
  } catch (eNorm) {
    try {
      console.warn('hcNormalizarConfigSegunTipo', eNorm);
    } catch (_) {}
    state.configTorre = hcClonePlainData(t.config, null);
  }
  if (state.configTorre) {
    if (typeof hidrogrowMigrarConfigInstalacion === 'function') hidrogrowMigrarConfigInstalacion(state.configTorre);
    if (typeof rdwcEnsureConfigDefaults === 'function') rdwcEnsureConfigDefaults(state.configTorre);
  }
  const umSlot = t.ultimaMedicion;
  if (umSlot && typeof umSlot === 'object') {
    state.ultimaMedicion = { ...umSlot };
  } else {
    const med0 = (t.mediciones || []).find(m => m && (m.tipo === 'medicion' || !m.tipo));
    state.ultimaMedicion = med0
      ? {
          fecha: med0.fecha,
          hora: med0.hora,
          ec: med0.ec,
          ph: med0.ph,
          temp: med0.temp,
          vol: med0.vol,
          humSustrato: med0.humSustrato,
        }
      : null;
  }
  state.ultimaRecarga = t.ultimaRecarga != null ? t.ultimaRecarga : null;
  state.recargaSnoozeHasta = t.recargaSnoozeHasta != null ? t.recargaSnoozeHasta : null;
  const fsc = t.fotosSistemaCompleto;
  state.fotosSistemaCompleto =
    fsc && typeof fsc === 'object'
      ? {
          fotoKeys: Array.isArray(fsc.fotoKeys) ? fsc.fotoKeys.slice() : [],
          fotos: Array.isArray(fsc.fotos) ? fsc.fotos.slice() : [],
        }
      : { fotoKeys: [], fotos: [] };
  modoActual = typeof normalizeTorreModoActual === 'function'
    ? normalizeTorreModoActual(t.modoActual)
    : (MODOS_CULTIVO[t.modoActual] ? t.modoActual : 'vegetativo');
  // Asegurar estructura COMPLETA — en propagador 1×N semillas (no 5×5 por defecto)
  let dimsTorre =
    typeof hcDimsTorreDesdeConfig === 'function'
      ? hcDimsTorreDesdeConfig(state.configTorre, state.torre)
      : {
          numNiveles: state.configTorre?.numNiveles || NUM_NIVELES,
          numCestas: state.configTorre?.numCestas || NUM_CESTAS,
        };
  if (
    typeof getCaminoCultivo === 'function' &&
    getCaminoCultivo(state.configTorre) === 'semilla_propagador' &&
    typeof hcNumSemillasGermConfig === 'function'
  ) {
    const nSemC = hcNumSemillasGermConfig(state.configTorre);
    if (nSemC >= 1) {
      dimsTorre = { numNiveles: 1, numCestas: nSemC };
    }
  }
  const nivR = dimsTorre.numNiveles;
  const cesR = dimsTorre.numCestas;
  if (state.configTorre) {
    state.configTorre.numNiveles = nivR;
    state.configTorre.numCestas = cesR;
  }
  if (!state.torre) state.torre = [];
  // Añadir niveles que falten
  while (state.torre.length < nivR) state.torre.push([]);
  // Añadir cestas que falten en cada nivel
  for (let n = 0; n < nivR; n++) {
    if (!state.torre[n]) state.torre[n] = [];
    while (state.torre[n].length < cesR) {
      state.torre[n].push({ variedad:'', fecha:'', notas:'', origenPlanta:'', fotos:[], fotoKeys:[] });
    }
  }
  for (let n = 0; n < nivR; n++) {
    (state.torre[n] || []).forEach(cell => {
      if (typeof asegurarCamposFilaTorre === 'function') asegurarCamposFilaTorre(cell);
    });
  }
  var camCargarTorre =
    typeof getCaminoCultivo === 'function' ? getCaminoCultivo(state.configTorre) : '';
  if (camCargarTorre === 'semilla_propagador' || camCargarTorre === 'semilla_hidro') {
    var runGermTorreSync = function () {
      try {
        if (camCargarTorre === 'semilla_propagador') {
          if (typeof hcRepararSemillasPropagadorAlCargar === 'function') {
            hcRepararSemillasPropagadorAlCargar(state.configTorre);
          } else if (typeof hcAjustarTorrePropagadorSemillas === 'function') {
            hcAjustarTorrePropagadorSemillas(state.configTorre, cesR);
          }
          if (typeof syncPremiumNutrienteGermFromConfig === 'function') {
            syncPremiumNutrienteGermFromConfig(state.configTorre);
          }
        }
        if (camCargarTorre === 'semilla_hidro' && typeof hcRepararGeometriaSemillaHidroAlCargar === 'function') {
          hcRepararGeometriaSemillaHidroAlCargar(state.configTorre);
        }
        if (typeof hcGerminacionSyncDesdePremium === 'function') {
          hcGerminacionSyncDesdePremium(state.configTorre);
        }
      } catch (eGermTorre) {
        try {
          console.warn('runGermTorreSync cargarEstadoTorre', eGermTorre);
        } catch (_) {}
      }
    };
    if (deferUi) {
      setTimeout(runGermTorreSync, 32);
    } else {
      runGermTorreSync();
    }
  }
  // Restaurar toldo / día de riego; plantas y edad vía sincronizarInputsRiego (torre activa + slot guardado)
  if (deferUi) {
    if (typeof window !== 'undefined') {
      window._hcCargarTorreUiPendiente = true;
      window._hcCargarTorreRiegoPendiente = true;
    }
    return;
  }
  try {
    if (typeof riegoCargarToldoDesdeConfig === 'function') riegoCargarToldoDesdeConfig();
  } catch (_) {}
  try {
    if (typeof initDiaRiego === 'function') initDiaRiego();
  } catch (_) {}
  try {
    if (typeof sincronizarInputsRiego === 'function') sincronizarInputsRiego();
  } catch (eRiegoSync) {}
  aplicarCargarTorreUiDesdeEstado();
}

function hcApplyCargarTorreRiegoPendiente() {
  if (typeof window === 'undefined' || !window._hcCargarTorreRiegoPendiente) return;
  window._hcCargarTorreRiegoPendiente = false;
  try {
    if (typeof riegoCargarToldoDesdeConfig === 'function') riegoCargarToldoDesdeConfig();
  } catch (_) {}
  try {
    if (typeof initDiaRiego === 'function') initDiaRiego();
  } catch (_) {}
  try {
    if (typeof sincronizarInputsRiego === 'function') sincronizarInputsRiego();
  } catch (_) {}
}

function hcApplyCargarTorreUiPendiente(opts) {
  if (typeof window === 'undefined' || !window._hcCargarTorreUiPendiente) return;
  window._hcCargarTorreUiPendiente = false;
  aplicarCargarTorreUiDesdeEstado(opts || {});
}

function actualizarHeaderTorre() {
  const t = getTorreActiva();
  const btn = document.getElementById('torreActivaNombre');
  if (btn) {
    if (!t) {
      btn.innerHTML =
        '<span class="torre-activa-nombre-text torre-activa-nombre-text--vacío">Sin instalación</span>';
    } else {
      const nom = typeof t.nombre === 'string' ? t.nombre.trim() : '';
      if (typeof hcSistemaIconMarkup === 'function') {
        btn.innerHTML =
          hcSistemaIconMarkup(tipoInstalacionNormalizado(t.config), 'hc-ico--inline-torre') +
          ' <span class="torre-activa-nombre-text">' +
          (nom || 'Instalación') +
          '</span>';
      } else {
        btn.textContent = emojiSistemaUiPorTorre(t) + ' ' + (nom || 'Instalación');
      }
    }
  }
  try {
    if (typeof hcRefreshDashSinInstalacionUi === 'function') hcRefreshDashSinInstalacionUi();
  } catch (_) {}
  // Mostrar/ocultar botón añadir según límite
  const btnCrear = document.getElementById('btnCrearTorre');
  if (btnCrear) {
    const nTorres = Array.isArray(state.torres) ? state.torres.length : 0;
    btnCrear.style.display = nTorres >= MAX_TORRES ? 'none' : 'block';
  }
  try {
    if (typeof hcRefreshHeaderInstActiva === 'function') hcRefreshHeaderInstActiva();
  } catch (_) {}
}

function sistemaEstaOperativa(cfg) {
  const c = cfg || state.configTorre || {};
  return c.operativa !== false;
}

function getMensajeStandbyContinuar() {
  return '⏸ Instalación en stand-by / descanso. Reactiva modo operativa para continuar.';
}

function setStandbyLockDisabled(el, on) {
  if (!el) return;
  const canDisable =
    (el instanceof HTMLButtonElement) ||
    (el instanceof HTMLInputElement) ||
    (el instanceof HTMLSelectElement) ||
    (el instanceof HTMLTextAreaElement);
  if (!canDisable) return;
  if (on) {
    if (!el.disabled) {
      el.disabled = true;
      el.dataset.standbyLocked = '1';
    }
    if (
      (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
      !el.readOnly
    ) {
      el.readOnly = true;
      el.dataset.standbyReadonly = '1';
    }
    el.classList.add('is-standby-disabled');
    el.setAttribute('aria-disabled', 'true');
    return;
  }
  if (el.dataset.standbyLocked === '1') {
    el.disabled = false;
    delete el.dataset.standbyLocked;
  }
  if (el.dataset.standbyReadonly === '1') {
    el.readOnly = false;
    delete el.dataset.standbyReadonly;
  }
  el.classList.remove('is-standby-disabled');
  el.setAttribute('aria-disabled', el.disabled ? 'true' : 'false');
}

function hcMedirGermPropagadorDesbloqueado() {
  return (
    typeof hcMedirPermiteRegistroGerminacion === 'function' &&
    hcMedirPermiteRegistroGerminacion(state.configTorre || {})
  );
}

function aplicarBloqueosStandbyPorTab(on) {
  const tabMediciones = document.getElementById('tab-mediciones');
  const tabSala = document.getElementById('tab-sala');
  const germMedir = !on && hcMedirGermPropagadorDesbloqueado();
  if (tabMediciones) {
    tabMediciones.querySelectorAll('input, textarea, select').forEach(el => {
      setStandbyLockDisabled(el, germMedir ? false : !on);
    });
    tabMediciones.querySelectorAll('.medir-save-btn').forEach(el => {
      if (!(el instanceof HTMLButtonElement)) return;
      if (germMedir) {
        el.disabled = false;
        delete el.dataset.standbyLocked;
        el.classList.remove('is-standby-disabled');
        el.setAttribute('aria-disabled', 'false');
      } else {
        setStandbyLockDisabled(el, !on);
      }
    });
  }
  if (tabSala) {
    tabSala.querySelectorAll('input, textarea, select, button').forEach(el => {
      if (el.id === 'recargaSwitch') return;
      setStandbyLockDisabled(el, !on);
    });
  }
  const tabSistema = document.getElementById('tab-sistema');
  if (tabSistema) {
    tabSistema.querySelectorAll('button, input, textarea, select').forEach(el => {
      if (el.id === 'sistemaOperativaSwitch') return;
      setStandbyLockDisabled(el, !on);
    });
  }
}

function aplicarEstadoStandbyUI() {
  const on = sistemaEstaOperativa();
  const appRoot = document.getElementById('app');
  if (appRoot) appRoot.classList.toggle('is-standby-active', !on);
  const germMedirUi = hcMedirGermPropagadorDesbloqueado();
  ['tab-inicio', 'tab-mediciones', 'tab-sala', 'tab-sistema', 'tab-riego'].forEach(id => {
    const tab = document.getElementById(id);
    if (!tab) return;
    var standbyTab = !on;
    if (id === 'tab-mediciones' && germMedirUi) standbyTab = false;
    tab.classList.toggle('is-standby', standbyTab);
  });
  const globalStandby = document.getElementById('globalStandbyBanner');
  if (globalStandby) {
    globalStandby.classList.toggle('setup-hidden', on);
  }
  const estadoRow = document.querySelector('.dash-operativa-row');
  if (estadoRow) estadoRow.classList.toggle('is-standby-active', !on);
  const germMedirBtn = hcMedirGermPropagadorDesbloqueado();
  document.querySelectorAll('.medir-save-btn').forEach(function (btn) {
    if (!(btn instanceof HTMLButtonElement)) return;
    var puedeGuardar = on || germMedirBtn;
    btn.disabled = !puedeGuardar;
    btn.setAttribute('aria-disabled', puedeGuardar ? 'false' : 'true');
    if (puedeGuardar) {
      btn.classList.remove('is-standby-disabled');
      delete btn.dataset.standbyLocked;
    }
  });
  const btnRiego = document.getElementById('btnCalcRiego');
  if (btnRiego) {
    btnRiego.disabled = !on;
    btnRiego.setAttribute('aria-disabled', on ? 'false' : 'true');
  }
  const dashSistemaInfo = document.getElementById('dashSistemaInfo');
  if (dashSistemaInfo) {
    dashSistemaInfo.classList.toggle('is-standby-blocked', !on);
    dashSistemaInfo.setAttribute('aria-disabled', on ? 'false' : 'true');
    dashSistemaInfo.setAttribute('tabindex', on ? '0' : '-1');
  }
  ['tileEC', 'tilePH', 'tileTemp', 'tileVol'].forEach(id => {
    const btn = document.getElementById(id);
    if (!(btn instanceof HTMLButtonElement)) return;
    setStandbyLockDisabled(btn, !on);
  });
  aplicarBloqueosStandbyPorTab(on);
  // Reaplicar tras renders diferidos de la pestaña para evitar que otros módulos reactiven campos.
  requestAnimationFrame(() => {
    if (!sistemaEstaOperativa()) aplicarBloqueosStandbyPorTab(false);
  });
  setTimeout(() => {
    if (!sistemaEstaOperativa()) aplicarBloqueosStandbyPorTab(false);
  }, 180);
  const accionesCriticas = [
    '[onclick*="intentarAbrirChecklistDesdeInicio(false)"]',
    '[onclick*="confirmarReposicionDeposito"]',
    '#recargaSwitch',
  ];
  accionesCriticas.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!(el instanceof HTMLButtonElement)) return;
      el.disabled = !on;
      el.classList.toggle('is-standby-disabled', !on);
      el.setAttribute('aria-disabled', on ? 'false' : 'true');
    });
  });
}

function actualizarEstadoOperativaUI() {
  const on = sistemaEstaOperativa();
  const tag = document.getElementById('medirEstadoOperativaTag');
  if (tag) {
    tag.textContent = on ? 'Operativa' : 'Stand-by / descanso';
    tag.classList.toggle('dash-operativa-sub--off', !on);
  }
  const sw = document.getElementById('sistemaOperativaSwitch');
  if (sw) {
    sw.classList.toggle('on', on);
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
  }
  aplicarEstadoStandbyUI();
}

function toggleSistemaOperativa() {
  initTorres();
  if (!state.configTorre) state.configTorre = {};
  const on = sistemaEstaOperativa();
  state.configTorre.operativa = !on;
  guardarEstadoTorreActual();
  saveState();
  actualizarEstadoOperativaUI();
  actualizarBadgesNutriente();
  if (document.getElementById('tab-riego')?.classList.contains('active') && typeof calcularRiego === 'function') {
    calcularRiego({ forceRefresh: true });
  }
  showToast(state.configTorre.operativa === false
    ? '⏸ Instalación en stand-by / descanso'
    : '✅ Instalación en modo operativa');
}

function textoTipoInstalacionTorre(cfg) {
  if (typeof hcMetaListaInstalacionTorre === 'function') {
    const meta = hcMetaListaInstalacionTorre(cfg);
    if (meta && meta.tipoLabel) return meta.tipoLabel;
  }
  return typeof etiquetaSistemaHidroponicoBreve === 'function'
    ? etiquetaSistemaHidroponicoBreve(cfg)
    : cfg && cfg.tipoInstalacion === 'rdwc'
      ? 'RDWC'
      : 'DWC';
}

/** Actualiza el botón de dos líneas (nombre + tipo) de la instalación activa en la pestaña Torre. */
function renderTorreInstalacionPicker() {
  initTorres();
  const btn = document.getElementById('torreInstalacionPickerBtn');
  const elEmoji = document.getElementById('torreInstalacionPickerEmoji');
  const elNom = document.getElementById('torreInstalacionPickerNombre');
  const elTipo = document.getElementById('torreInstalacionPickerTipo');
  if (!btn || !elNom || !elTipo) return;
  const torres = state.torres || [];
  const n = torres.length;
  const activa = n ? Math.min(Math.max(0, state.torreActiva || 0), n - 1) : 0;
  const t = n ? torres[activa] : null;
  const nom = t ? (((t.nombre || '').trim()) || ('Instalación ' + (activa + 1))) : '—';
  const emoji = t ? emojiSistemaUiPorTorre(t) : '🌿';
  const tipoTxt = t ? textoTipoInstalacionTorre(t.config) : '—';
  if (elEmoji) elEmoji.textContent = emoji;
  elNom.textContent = nom;
  elTipo.textContent = tipoTxt;
  btn.setAttribute('aria-label',
    'Instalación actual: ' + nom + ', ' + tipoTxt + '. Abrir lista para elegir otra instalación');
}

function abrirSelectorTorres() {
  try {
    initTorres();
  } catch (eInit) {
    try {
      console.warn('abrirSelectorTorres initTorres', eInit);
    } catch (_) {}
  }
  const torres = Array.isArray(state.torres) ? state.torres : [];
  const visibles = torres.filter((t) => !hcEsSlotInstalacionFantasma(t));
  if (!visibles.length) {
    if (typeof hcTieneInstalacionesUsuario === 'function' && !hcTieneInstalacionesUsuario()) {
      hcAbrirPrimeraInstalacion();
      return;
    }
  }
  const mt = document.getElementById('modalTorres');
  const lista = document.getElementById('listaTorres');
  if (!mt) {
    if (typeof showToast === 'function') {
      showToast('No se pudo abrir el selector de instalaciones. Recarga la página (Ctrl+F5).', true);
    }
    return;
  }
  mt.classList.add('open');
  try {
    if (typeof a11yDialogOpened === 'function') a11yDialogOpened(mt);
  } catch (_) {}
  try {
    renderListaTorres();
  } catch (eList) {
    try {
      console.error('renderListaTorres', eList);
    } catch (_) {}
    if (lista) {
      lista.innerHTML =
        '<p class="setup-field-hint">No se pudo cargar la lista. Recarga la página (Ctrl+F5).</p>';
    }
    if (typeof showToast === 'function') {
      showToast('Error al listar instalaciones. Recarga (Ctrl+F5).', true);
    }
  }
}

function cerrarModalTorres(e) {
  const mt = document.getElementById('modalTorres');
  if (!e || e.target === mt) {
    mt.classList.remove('open');
    a11yDialogClosed(mt);
  }
}

function renderListaTorres() {
  const lista = document.getElementById('listaTorres');
  if (!lista) return;
  const torres = Array.isArray(state.torres) ? state.torres : [];
  const activa = state.torreActiva || 0;
  const visibles = torres.filter((t) => !hcEsSlotInstalacionFantasma(t));
  if (!visibles.length) {
    lista.innerHTML =
      '<p class="setup-field-hint">No hay instalaciones guardadas. Pulsa «Nueva instalación» para empezar.</p>';
    return;
  }

  function hcPlantasEnSlotTorre(torreMat) {
    if (!Array.isArray(torreMat)) return 0;
    return torreMat.reduce((sum, nivel) => {
      if (!Array.isArray(nivel)) return sum;
      return sum + nivel.filter((c) => c && c.variedad).length;
    }, 0);
  }

  function hcFilaListaTorreHtml(t, i, activa) {
    const isActiva = i === activa;
    const cfgT = t.config || {};
    const metaInst =
      typeof hcMetaListaInstalacionTorre === 'function' ? hcMetaListaInstalacionTorre(cfgT, t) : null;
    let tipoTag;
    let plantasLine;
    let geomTxt;
    let listIco;
    if (metaInst) {
      tipoTag = metaInst.tipoLabel || 'Propagador';
      plantasLine = metaInst.plantasLabel || '—';
      geomTxt = metaInst.geomLabel || '';
      listIco =
        typeof hcSistemaIconMarkup === 'function' && metaInst.iconTipo
          ? hcSistemaIconMarkup(metaInst.iconTipo, 'hc-ico--torre-list')
          : emojiSistemaUiPorTorre(t);
    } else {
      const plantasCount = hcPlantasEnSlotTorre(t.torre);
      const tipoNorm =
        typeof tipoInstalacionNormalizado === 'function' ? tipoInstalacionNormalizado(cfgT) : 'dwc';
      geomTxt =
        typeof hcGeomTorreFilasCestas === 'function'
          ? hcGeomTorreFilasCestas(cfgT).label
          : tipoNorm === 'rdwc'
            ? (cfgT.rdwcRows || 1) + ' filas × ' + (cfgT.rdwcSites || 4) + ' cubos'
            : (cfgT.numNiveles || 1) + ' filas × ' + (cfgT.numCestas || 1) + ' cubos';
      tipoTag = tipoNorm === 'rdwc' ? 'RDWC' : 'DWC';
      plantasLine = plantasCount + (plantasCount === 1 ? ' planta' : ' plantas');
      listIco =
        typeof hcSistemaIconMarkup === 'function'
          ? hcSistemaIconMarkup(tipoNorm, 'hc-ico--torre-list')
          : emojiSistemaUiPorTorre(t);
    }
    const listIcoHtml = listIco;
    const nTorres = torres.length;

    return `<div class="torre-list-row${isActiva ? ' torre-list-row--active' : ''}">
      <button type="button" class="torre-list-main"
        onclick="cambiarTorreActiva(${i})"
        aria-pressed="${isActiva ? 'true' : 'false'}"
        aria-label="Activar ${String((t.nombre || '').trim() || 'instalación').replace(/"/g, '&quot;')}${isActiva ? ', instalación actual' : ''}">
      <span class="torre-list-emoji" aria-hidden="true">${listIcoHtml}</span>
      <span class="torre-list-body">
        <span class="torre-list-name">${(t.nombre || '').trim() || 'Instalación'}</span>
        <span class="torre-list-meta">
          ${tipoTag} · ${plantasLine}${geomTxt ? ' · ' + geomTxt : ''}
          ${isActiva ? ' · <strong class="torre-list-active-tag">Activa</strong>' : ''}
        </span>
      </span>
      </button>
      <div class="torre-list-actions">
        <button type="button" onclick="editarNombreTorre(${i})"
          class="torre-list-btn-icon" aria-label="Editar nombre de la instalación">${typeof hcIcon === 'function' ? hcIcon('hc-i-pencil', 'hc-ico--btn') : '✏️'}</button>
        ${nTorres > 1 && !isActiva ? `
        <button type="button" onclick="borrarTorre(${i})"
          class="torre-list-btn-del" aria-label="Borrar esta instalación">${typeof hcIcon === 'function' ? hcIcon('hc-i-trash', 'hc-ico--btn') : '🗑'}</button>` : ''}
      </div>
    </div>`;
  }

  lista.innerHTML = torres
    .map((t, i) => {
      if (hcEsSlotInstalacionFantasma(t)) return '';
      try {
        return hcFilaListaTorreHtml(t, i, activa);
      } catch (eRow) {
        try {
          console.warn('renderListaTorres fila', i, eRow);
        } catch (_) {}
        const nom = String((t && t.nombre) || '').trim() || 'Instalación ' + (i + 1);
        return `<div class="torre-list-row">
      <button type="button" class="torre-list-main" onclick="cambiarTorreActiva(${i})">
      <span class="torre-list-body">
        <span class="torre-list-name">${nom}</span>
        <span class="torre-list-meta">Instalación guardada</span>
      </span>
      </button>
    </div>`;
      }
    })
    .join('');

  try {
    actualizarHeaderTorre();
  } catch (eHdr) {
    try {
      console.warn('actualizarHeaderTorre tras lista', eHdr);
    } catch (_) {}
  }
}

function abrirSetupNuevaTorre() {
  try {
    if (typeof hcOcultarOverlaysOnboardingUi === 'function') hcOcultarOverlaysOnboardingUi();
  } catch (_) {}
  setupEsNuevaTorre = true;
  try {
    if (typeof hcResetSetupWizardSession === 'function') hcResetSetupWizardSession({ keepNuevaFlag: true });
  } catch (_) {}
  try {
    if (typeof hcClearSetupSalaPreGermFlags === 'function') hcClearSetupSalaPreGermFlags();
  } catch (_) {}
  try {
    if (typeof hcForzarSetupPaginaCamino === 'function') hcForzarSetupPaginaCamino();
  } catch (_) {}
  try {
    if (typeof hcResetPremiumBorradorNuevaInstalacion === 'function') {
      hcResetPremiumBorradorNuevaInstalacion();
    }
  } catch (_) {}
  setupPagina =
    typeof SETUP_PAGE_ORIGEN !== 'undefined' ? SETUP_PAGE_ORIGEN : 1;
  setupTipoInstalacion = '';
  setupTipoTorre = 'custom';
  setupEquipamiento = new Set(['difusor']);
  refreshSetupEquipamientoCardsDesdeSet();
  const ccNew = document.getElementById('setupCalentadorConsignaC');
  if (ccNew) ccNew.value = '20';
  refreshSetupCalentadorConsignaVis();
  const c2n = document.getElementById('setupCiudad2');
  if (c2n) c2n.value = '';
  document.getElementById('ciudadResultadosSetup')?.classList.add('setup-hidden');
  const csel = document.getElementById('ciudadSeleccionadaSetup');
  if (csel) {
    csel.classList.add('setup-hidden');
    csel.textContent = '';
  }

  const so = document.getElementById('setupOverlay');
  if (!so) return;
  so.classList.add('open');
  try {
    if (typeof hcResetSetupFormForNewInstall === 'function') hcResetSetupFormForNewInstall();
  } catch (_) {}
  renderSetupPage();
  try {
    if (typeof refreshCaminoCultivoUI === 'function') refreshCaminoCultivoUI();
  } catch (_) {}
  a11yDialogOpened(so);
  if (typeof showToast === 'function') {
    showToast(
      'Nueva instalación: elige de nuevo el camino. La instalación anterior sigue en la lista hasta que guardes esta.',
      false,
      { durationMs: 6400 }
    );
  }
  var runSetupHeavy = function () {
    try {
      renderNutrientesGrid();
    } catch (_) {}
    try {
      updateTorreBuilder();
    } catch (_) {}
  };
  setTimeout(runSetupHeavy, 16);

  // Actualizar el título para indicar que es una torre nueva
  setTimeout(() => {
    const titulo = document.querySelector('.setup-header-title');
    if (titulo) titulo.textContent = '🌿 Nueva instalación';
  }, 50);
}


function crearNuevaTorre() {
  if (state.torres.length >= MAX_TORRES) {
    showToast('Máximo ' + MAX_TORRES + ' instalaciones', true); return;
  }
  cerrarModalTorres();
  abrirSetupNuevaTorre();
}

function editarNombreTorre(idx) {
  const t = state.torres[idx];
  const nuevoNombre = prompt('Nombre de la instalación:', t.nombre || '');
  if (nuevoNombre && nuevoNombre.trim()) {
    state.torres[idx].nombre = nuevoNombre.trim().slice(0, 40);
    saveState();
    renderListaTorres();
    actualizarHeaderTorre();
    updateTorreStats();
    updateDashboard();
  }
}

/** Desde la pestaña Torre: abre el diálogo para editar el nombre de la instalación activa. */
function cambiarNombreInstalacionActivaDesdeTorre() {
  initTorres();
  const idx = state.torreActiva || 0;
  if (!state.torres[idx]) return;
  editarNombreTorre(idx);
}

function borrarTorre(idx) {
  if (state.torres.length <= 1) return;
  if (!confirm('¿Borrar ' + state.torres[idx].nombre + '? Se perderán todos sus datos.')) return;
  state.torres.splice(idx, 1);
  if (state.torreActiva >= state.torres.length) {
    state.torreActiva = state.torres.length - 1;
  }
  cargarEstadoTorre(state.torreActiva);
  saveState();
  renderListaTorres();
  renderTorre();
  actualizarHeaderTorre();
  showToast('🗑 Instalación eliminada');
}

// ══════════════════════════════════════════════════
// BADGE NUTRIENTE — visible en dashboard y medir
// ══════════════════════════════════════════════════

/** Banner Inicio/Medir/Sistema de la instalación activa (tras cambiar de sistema). */
function hcRefreshDashTorreBanner(opts) {
  opts = opts && typeof opts === 'object' ? opts : {};
  const cfg = opts.cfg || state.configTorre || {};
  const hayInst =
    typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario();
  const nut =
    opts.nut != null
      ? opts.nut
      : hayInst && typeof getNutrienteTorre === 'function'
        ? getNutrienteTorre()
        : null;
  const dashTorreEmoji = document.getElementById('dashTorreEmoji');
  const dashTorreNombre = document.getElementById('dashTorreNombre');
  const dashTorreInfo = document.getElementById('dashTorreInfo');
  const torre = typeof getTorreActiva === 'function' ? getTorreActiva() : null;
  const medirTorreEmoji = document.getElementById('medirTorreEmoji');
  const medirTorreNombre = document.getElementById('medirTorreNombre');
  try {
    if (typeof hcRefreshDashSinInstalacionUi === 'function') hcRefreshDashSinInstalacionUi();
  } catch (_) {}
  if (!torre) {
    if (dashTorreNombre) dashTorreNombre.textContent = '';
    if (dashTorreInfo) dashTorreInfo.textContent = '';
    if (medirTorreNombre) medirTorreNombre.textContent = 'Sin instalación';
    return;
  }
  if (dashTorreEmoji) {
    if (typeof hcPintarSistemaIconoEnElemento === 'function') {
      hcPintarSistemaIconoEnElemento(dashTorreEmoji, torre, 'hc-ico--dash-torre');
    } else {
      dashTorreEmoji.textContent = emojiSistemaUiPorTorre(torre);
    }
  }
  if (dashTorreNombre) dashTorreNombre.textContent = (torre.nombre || '').trim() || 'Instalación';
  hcRefreshDashInstalacionVariedad(cfg);
  if (dashTorreInfo) {
    const infoPropag =
      typeof hcDashTorreInfoPropagador === 'function' ? hcDashTorreInfoPropagador(cfg) : null;
    if (infoPropag) {
      dashTorreInfo.textContent = infoPropag;
    } else {
      let geomTxt;
      if (typeof hcGeomTorreFilasCestas === 'function') {
        geomTxt = hcGeomTorreFilasCestas(cfg).label;
      } else {
        const niv = cfg.numNiveles || 5;
        const ces = cfg.numCestas || 5;
        geomTxt = niv + ' filas · ' + ces + ' macetas';
      }
      const vMax = getVolumenDepositoMaxLitros(cfg);
      const vMez = getVolumenMezclaLitros(cfg);
      const volTxt =
        vMax != null && Number.isFinite(vMax) && vMax > 0
          ? vMez != null && Number.isFinite(vMez) && vMez < vMax - 0.05
            ? vMax + 'L máx · ' + vMez + 'L mezcla'
            : vMax + 'L'
          : 'L depósito por indicar';
      const nutTxt = nut ? nut.nombre : 'nutriente por elegir';
      const estadoTxt = sistemaEstaOperativa(cfg) ? 'operativa' : 'stand-by';
      dashTorreInfo.textContent = geomTxt + ' · ' + volTxt + ' · ' + nutTxt + ' · ' + estadoTxt;
    }
  }
  if (medirTorreEmoji) {
    if (typeof hcPintarSistemaIconoEnElemento === 'function') {
      hcPintarSistemaIconoEnElemento(medirTorreEmoji, torre, 'hc-ico--dash-torre');
    } else {
      medirTorreEmoji.textContent = emojiSistemaUiPorTorre(torre);
    }
  }
  if (medirTorreNombre) medirTorreNombre.textContent = (torre.nombre || '').trim() || 'Instalación';
  try {
    if (typeof refreshSalaTorreBanner === 'function') refreshSalaTorreBanner();
    if (typeof ensureSistemaTorreBanner === 'function') ensureSistemaTorreBanner();
    else if (typeof refreshSistemaTorreBanner === 'function') refreshSistemaTorreBanner();
  } catch (_) {}
}

function actualizarBadgesNutriente() {
  const hayInst =
    typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario();
  let nut = hayInst ? getNutrienteTorre() : null;
  const cfg = state.configTorre || {};

  if (typeof actualizarRangosParametrosMedir === 'function') actualizarRangosParametrosMedir(cfg);

  const inputVol = document.getElementById('inputVol');
  if (inputVol && typeof getVolumenDepositoMaxLitros === 'function' && medirPuedeMostrarRangos(cfg)) {
    const vrRaw = getVolumenDepositoMaxLitros(cfg);
    const vr = Math.round(Number(vrRaw) * 10) / 10;
    if (Number.isFinite(vr) && vr > 0) {
      const vm = typeof getVolumenMezclaLitros === 'function' ? getVolumenMezclaLitros(cfg) : vr;
      const ph = Number.isFinite(vm) && vm > 0 ? Math.round(vm * 10) / 10 : vr;
      inputVol.placeholder = String(ph);
      inputVol.setAttribute('max', String(Math.min(800, Math.max(Math.ceil(vr + 2), 20))));
    } else {
      inputVol.placeholder = '—';
      inputVol.removeAttribute('max');
    }
  } else if (inputVol) {
    inputVol.placeholder = '—';
    inputVol.removeAttribute('max');
  }

  try {
    refrescarMedirDatosFacilesBanner(state.configTorre);
  } catch (eMedirBan) {}

  // Dashboard
  const dashNombre  = document.getElementById('dashNutrienteNombre');
  const dashDetalle = document.getElementById('dashNutrienteDetalle');
  const dashEstado = document.getElementById('dashNutrienteEstado');
  const dashTagEstado = document.getElementById('dashNutrienteTagEstado');
  const dashRecomendado = document.getElementById('dashNutrienteRecomendado');
  const dashFuente = document.getElementById('dashNutrienteFuente');
  const dashRazon = document.getElementById('dashNutrienteRazon');
  const dashAviso   = document.getElementById('dashNutrienteAviso');
  const propagDashInicio =
    typeof hcMostrarSistemaPropagador === 'function' && hcMostrarSistemaPropagador(cfg);
  const camDash =
    typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : cfg.caminoCultivo || '';
  const dashSemillaHidroGerm =
    camDash === 'semilla_hidro' &&
    ((typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) ||
      (typeof getSistemaFaseCamino === 'function' &&
        (getSistemaFaseCamino(cfg) === 'prep_hidro' || getSistemaFaseCamino(cfg) === 'germ_cubo')));
  const dashUsaGermNut =
    propagDashInicio ||
    dashSemillaHidroGerm ||
    (typeof hcDashUsaTilesGerminacion === 'function' && hcDashUsaTilesGerminacion(cfg));
  if (dashUsaGermNut) {
    try {
      if (typeof hcSincronizarNutrientePropagadorEnCfg === 'function') {
        hcSincronizarNutrientePropagadorEnCfg(cfg);
      } else if (typeof resolverNutrienteGermBandeja === 'function') {
        resolverNutrienteGermBandeja(cfg);
      }
    } catch (_) {}
    if (!nut && typeof getNutrienteTorre === 'function') {
      nut = getNutrienteTorre();
    }
  }
  const dashNutLabel = document.getElementById('dashNutrienteLabel');
  const dashSisInfo = document.getElementById('dashSistemaInfo');
  if (dashNutLabel) {
    dashNutLabel.classList.toggle('setup-hidden', !hayInst);
    if (hayInst) {
      dashNutLabel.textContent = dashSemillaHidroGerm
        ? 'Nutriente · germinación en cubo'
        : dashUsaGermNut
          ? 'Nutriente · bandeja propagador'
          : 'Nutriente seleccionado';
    }
  }
  if (dashSisInfo) dashSisInfo.classList.toggle('setup-hidden', !hayInst);
  if (dashNombre) {
    dashNombre.textContent = nut
      ? nut.nombre
      : hayInst
        ? dashUsaGermNut
          ? 'Abono sin elegir en configurador'
          : 'Nutriente sin elegir'
        : 'Sin nutriente';
  }
  if (dashDetalle) {
    dashDetalle.textContent = nut
      ? nut.detalle
      : hayInst
        ? dashUsaGermNut
          ? 'Elige abono en el asistente o checklist del propagador'
          : 'Elige marca en Cultivo e instalación o Medir'
        : 'Configura tu instalación en el asistente';
  }
  if (dashEstado || dashRecomendado || dashRazon || dashFuente) {
    if (dashSemillaHidroGerm) {
      var vidGerm =
        (cfg.germinacionFlow && cfg.germinacionFlow.variedadId) ||
        (cfg.premiumSetup && cfg.premiumSetup.variedadGerminacion) ||
        '';
      var faseGermDash =
        typeof hcGerminacionFaseActualId === 'function'
          ? hcGerminacionFaseActualId(cfg)
          : typeof getSistemaFaseCamino === 'function'
            ? getSistemaFaseCamino(cfg)
            : 'germ_cubo';
      var rangosHidro =
        typeof getGerminacionRangosMonitoreo === 'function'
          ? getGerminacionRangosMonitoreo(vidGerm, faseGermDash, cfg)
          : null;
      var ecMin = rangosHidro && rangosHidro.ec ? rangosHidro.ec.min : 400;
      var ecMax = rangosHidro && rangosHidro.ec ? rangosHidro.ec.max : 800;
      if (dashEstado) {
        dashEstado.textContent = nut ? 'Actual: VEG' : 'Actual: —';
      }
      if (dashRecomendado) {
        dashRecomendado.textContent = nut
          ? 'Recomendado ahora: VEG · EC depósito ' + ecMin + '–' + ecMax + ' µS/cm'
          : 'Recomendado ahora: VEG';
      }
      if (dashTagEstado) {
        dashTagEstado.classList.remove('is-mismatch', 'is-germ');
        dashTagEstado.classList.add('is-match');
      }
      if (dashFuente) dashFuente.textContent = 'Fuente: germinación en cubo · línea veg';
      if (dashRazon) {
        dashRazon.textContent = nut
          ? 'Motivo: plántula o semilla en el mismo DWC; la línea es VEG con dosis baja en el depósito.'
          : 'Motivo: elige nutriente en el asistente antes de medir el depósito.';
      }
    } else if (dashUsaGermNut) {
      const volL =
        typeof getNutrienteGermVolLFromCfg === 'function' ? getNutrienteGermVolLFromCfg(cfg) : 2;
      const ecObj =
        typeof getEcObjetivoGermPropagador === 'function'
          ? getEcObjetivoGermPropagador(cfg)
          : { min: 400, max: 800 };
      if (dashEstado) {
        dashEstado.textContent = nut
          ? 'Bandeja: ' + volL + ' L destilada · EC ' + ecObj.min + '–' + ecObj.max + ' µS/cm'
          : 'Actual: —';
      }
      if (dashRecomendado) {
        dashRecomendado.textContent = nut
          ? 'Línea elegida en configurador propagador'
          : 'Recomendado: Canna Aqua Vega u otra línea veg A+B';
      }
      if (dashTagEstado) {
        dashTagEstado.classList.remove('is-germ');
        dashTagEstado.classList.toggle('is-match', !!nut);
      }
      if (dashFuente) dashFuente.textContent = 'Fuente: plan germinación · bandeja domo';
      if (dashRazon) {
        dashRazon.textContent = nut
          ? 'Motivo: abono para la solución fina en la bandeja del propagador (no depósito DWC).'
          : 'Motivo: completa el paso Nutriente del asistente propagador.';
      }
    } else if (!propagDashInicio) {
      if (!hayInst) {
      if (dashEstado) dashEstado.textContent = 'Actual: —';
      if (dashRecomendado) dashRecomendado.textContent = 'Recomendado ahora: —';
      if (dashTagEstado) dashTagEstado.classList.remove('is-match', 'is-mismatch');
      if (dashFuente) dashFuente.textContent = 'Fuente: —';
      if (dashRazon) dashRazon.textContent = 'Motivo: aún no hay instalación configurada.';
    } else {
    const usoRaw =
      nut && typeof hcNutrienteFaseUso === 'function'
        ? hcNutrienteFaseUso(nut)
        : 'unknown';
    const usoMap = { veg: 'VEG', bloom: 'BLOOM', both: 'BOTH', unknown: '—' };
    const usoTxt = usoMap[usoRaw] || '—';
    const ctx = typeof hcGetRecomendacionNutrienteContexto === 'function'
      ? hcGetRecomendacionNutrienteContexto()
      : null;
    const recomendado = ctx ? (ctx.recomendado === 'bloom' ? 'BLOOM' : 'VEG') : 'VEG';
    const recomendadoSub = ctx
      ? (ctx.hayFruto
          ? (ctx.recomendado === 'bloom' ? ' (fruto en fase floral)' : ' (fruto aún en vegetativo)')
          : ' (hoja/vegetativo)')
      : '';
    const faseMap = {
      germinacion: 'germinación',
      plantula: 'plántula',
      vegetativo: 'vegetativo',
      prefloracion: 'prefloración',
      floracion: 'floración',
      fructificacion: 'fructificación',
      manual: 'manual',
    };
    let motivo = 'Motivo: sin datos suficientes aún.';
    let fuente = 'Fuente: estimación general';
    if (ctx) {
      if (!ctx.hayFruto) {
        motivo = 'Motivo: no hay cultivos de fruto activos en esta instalación.';
        fuente = 'Fuente: cultivo activo (sin fruto)';
      } else if (ctx.conFaseReal && ctx.fase) {
        const faseTxt = faseMap[ctx.fase] || ctx.fase;
        motivo = 'Motivo: fase detectada ' + faseTxt + '.';
        fuente = 'Fuente: fase automática por fechas';
      } else {
        motivo = 'Motivo: hay fruto activo, pero aún sin fase real por fechas.';
        fuente = 'Fuente: estimación (faltan fechas)';
      }
      if (ctx.fechaCambioTxt) {
        motivo += ' Cambio sugerido desde: ' + ctx.fechaCambioTxt + '.';
      }
    }

    if (dashEstado) dashEstado.textContent = 'Actual: ' + usoTxt;
    if (dashRecomendado) dashRecomendado.textContent = 'Recomendado ahora: ' + recomendado + recomendadoSub;
    if (dashTagEstado) {
      dashTagEstado.classList.remove('is-match', 'is-mismatch');
      if ((usoRaw === 'veg' || usoRaw === 'bloom') && (recomendado === 'VEG' || recomendado === 'BLOOM')) {
        dashTagEstado.classList.add(usoRaw.toUpperCase() === recomendado ? 'is-match' : 'is-mismatch');
      }
    }
      if (dashFuente) dashFuente.textContent = fuente;
      if (dashRazon) dashRazon.textContent = motivo;
      }
    }
  }
  if (dashAviso && !propagDashInicio && !dashUsaGermNut) {
    const msg =
      typeof hcGetAvisoCambioNutrientePorFase === 'function'
        ? hcGetAvisoCambioNutrientePorFase('inicio')
        : null;
    if (msg) {
      dashAviso.textContent = msg;
      dashAviso.classList.remove('setup-hidden');
    } else {
      dashAviso.textContent = '';
      dashAviso.classList.add('setup-hidden');
    }
  }
  try {
    if (typeof refreshDashCaminoResumen === 'function') refreshDashCaminoResumen();
  } catch (_) {}
  try {
    if (typeof refreshDashPropagadorRutaRail === 'function') {
      refreshDashPropagadorRutaRail(cfg);
    }
  } catch (_) {}
  hcRefreshDashTorreBanner({ cfg: cfg, nut: nut });
  actualizarEstadoOperativaUI();

  try { refreshUbicacionInstalacionUI(); } catch (_) {}

  try {
    if (typeof refreshEcTransicionAvisoAll === 'function') refreshEcTransicionAvisoAll();
  } catch (_) {}

  refreshConsejosSiVisible();

  try {
    if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
  } catch (_) {}
  try {
    if (typeof refreshSistemaEquipResumen === 'function') refreshSistemaEquipResumen();
  } catch (_) {}
  try {
    if (typeof hcReaplicarVistasCaminoUi === 'function') hcReaplicarVistasCaminoUi(cfg);
  } catch (_) {}
}

function cambiarNutriente() {
  // Abrir modal rápido de selección de nutriente
  const overlay = document.createElement('div');
  overlay.className = 'nut-quick-overlay';
  overlay.id = 'nutrienteQuickModal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Nutriente de esta torre');

  const nutCur = typeof getNutrienteTorre === 'function' ? getNutrienteTorre() : null;
  const nutActual = (nutCur && nutCur.id) || '';

  overlay.innerHTML = '<div class="nut-quick-sheet">' +
    '<div class="nut-quick-handle"></div>' +
    '<div class="nut-quick-title">🧪 Nutriente de esta torre</div>' +
    NUTRIENTES_DB.filter(n => n.id !== 'otro').map(n => {
      const activo = n.id === nutActual;
      const check = activo ? '<span class="nut-quick-check">&#10003;</span>' : '';
      return [
        '<div data-nut-id="' + n.id + '" class="nut-quick-row' + (activo ? ' nut-quick-row--active' : '') + '">',
        '<span class="nut-quick-flag">' + n.bandera + '</span>',
        '<div class="nut-quick-body"><div class="nut-quick-name">' + n.nombre + '</div>',
        '<div class="nut-quick-detail">' + n.detalle + '</div></div>',
        check + '</div>'
      ].join('');
    }).join('')
    +
    '<div id="nutOtroBtn" class="nut-quick-otro">' +
      '<span class="nut-quick-flag">🔬</span>' +
      '<div class="nut-quick-body"><div class="nut-quick-name">Otra marca</div>' +
      '<div class="nut-quick-detail">Configurar manualmente</div></div></div>' +
    '<button id="nutCancelarBtn" type="button" class="nut-quick-cancel">' +
      'Cancelar</button>' +
    '</div>';

  const cerrarNutModal = () => {
    a11yDialogClosed(overlay);
    overlay.remove();
  };
  overlay.onclick = (e) => { if (e.target === overlay) cerrarNutModal(); };
  document.body.appendChild(overlay);
  a11yDialogOpened(overlay);
  // Event delegation for nutriente cards
  overlay.querySelectorAll('[data-nut-id]').forEach(el => {
    el.addEventListener('click', function() {
      seleccionarNutrienteRapido(this.getAttribute('data-nut-id'));
    });
  });
  const otroBtn    = document.getElementById('nutOtroBtn');
  const cancelarBtn = document.getElementById('nutCancelarBtn');
  if (otroBtn) otroBtn.addEventListener('click', () => seleccionarNutrienteRapido('otro'));
  if (cancelarBtn) cancelarBtn.addEventListener('click', cerrarNutModal);
}

function seleccionarNutrienteRapido(id) {
  if (!state.configTorre) state.configTorre = {};
  state.configTorre.nutriente = id;
  const camR =
    typeof getCaminoCultivo === 'function' ? getCaminoCultivo(state.configTorre) : '';
  const usaBandejaR =
    camR === 'semilla_propagador' ||
    camR === 'semilla_hidro' ||
    (typeof hcMostrarSistemaPropagador === 'function' &&
      hcMostrarSistemaPropagador(state.configTorre));
  if (usaBandejaR) {
    if (!state.configTorre.premiumSetup || typeof state.configTorre.premiumSetup !== 'object') {
      state.configTorre.premiumSetup = {};
    }
    state.configTorre.premiumSetup.nutrienteGerm = id;
    if (typeof ensureGerminacionFlow === 'function') {
      const g = ensureGerminacionFlow(state.configTorre);
      g.nutrienteId = id;
    }
    if (typeof setupData !== 'undefined' && setupData.premium) {
      setupData.premium.nutrienteGerm = id;
    }
    if (typeof setupNutriente !== 'undefined') setupNutriente = id;
  }
  saveState();
  const nutM = document.getElementById('nutrienteQuickModal');
  if (nutM) {
    a11yDialogClosed(nutM);
    nutM.remove();
  }
  aplicarConfigTorre();
  actualizarBadgesNutriente();
  updateDashboard();
  updateTorreStats();
  const nut = getNutrienteTorre();
  showToast(
    nut
      ? 'Nutriente activo: ' + nut.nombre + ' · dosis y checklist actualizados'
      : 'Nutriente guardado'
  );
}

// ══════════════════════════════════════════════════
// NOTIFICACIONES LOCALES
// ══════════════════════════════════════════════════

async function pedirPermisoNotificaciones() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

async function enviarNotificacion(titulo, cuerpo, icono) {
  const ok = await pedirPermisoNotificaciones();
  if (!ok) return;
  new Notification(titulo, {
    body:  cuerpo,
    icon:  icono || '/icon-192.png',
    badge: '/icon-72.png',
    tag:   'hidrogrow-' + Date.now(),
  });
}

function ensureNotifOpciones() {
  if (typeof normalizarNotifOpcionesEnState === 'function') {
    normalizarNotifOpcionesEnState(state);
  }
  if (!state.notifOpciones || typeof state.notifOpciones !== 'object') {
    state.notifOpciones = { panelInicioColapsado: false };
  } else if (typeof state.notifOpciones.panelInicioColapsado !== 'boolean') {
    state.notifOpciones.panelInicioColapsado = false;
  }
}

function persistNotifOpciones() {
  ensureNotifOpciones();
  initTorres();
  const i = state.torreActiva || 0;
  const slot = state.torres && state.torres[i];
  if (!slot) return;
  if (!slot.notifOpciones || typeof slot.notifOpciones !== 'object') {
    slot.notifOpciones = { recarga: false, medicion: false, cosecha: false, esquejes: false };
  }
  const nr = document.getElementById('notifOptRecarga');
  const nm = document.getElementById('notifOptMedicion');
  const nc = document.getElementById('notifOptCosecha');
  const ne = document.getElementById('notifOptEsquejes');
  slot.notifOpciones.recarga = !!(nr && nr.checked);
  slot.notifOpciones.medicion = !!(nm && nm.checked);
  slot.notifOpciones.cosecha = !!(nc && nc.checked);
  slot.notifOpciones.esquejes = !!(ne && ne.checked);
  saveState();
}

function refreshDashNotificacionesUI() {
  ensureNotifOpciones();
  initTorres();
  const fs = document.getElementById('dashNotifPrefsFieldset');
  const hint = document.getElementById('dashNotifPrefsHint');
  const panel = document.getElementById('panelNotifPrefsInicio');
  const btn = document.getElementById('btnNotifPrefsInicio');
  const nr = document.getElementById('notifOptRecarga');
  const nm = document.getElementById('notifOptMedicion');
  const nc = document.getElementById('notifOptCosecha');
  const ne = document.getElementById('notifOptEsquejes');
  const panelCol = !!state.notifOpciones.panelInicioColapsado;
  const i = state.torreActiva || 0;
  const slot = state.torres && state.torres[i];
  const o =
    slot && slot.notifOpciones && typeof slot.notifOpciones === 'object'
      ? slot.notifOpciones
      : { recarga: false, medicion: false, cosecha: false, esquejes: false };
  if (panel) panel.hidden = panelCol;
  if (btn) btn.setAttribute('aria-expanded', panelCol ? 'false' : 'true');
  if (nr) nr.checked = !!o.recarga;
  if (nm) nm.checked = !!o.medicion;
  if (nc) nc.checked = !!o.cosecha;
  if (ne) ne.checked = !!o.esquejes;
  const granted = 'Notification' in window && Notification.permission === 'granted';
  if (fs) fs.disabled = !granted;
  if (hint) hint.classList.toggle('setup-hidden', granted);
}

function programarRecordatorios() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  ensureNotifOpciones();
  initTorres();
  const ahora = new Date();
  const torres = state.torres;
  if (!Array.isArray(torres) || torres.length === 0) return;

  torres.forEach((slot, slotIdx) => {
    if (!slot || !slot.notifOpciones) return;
    const prefs = slot.notifOpciones;
    const nombreTorre = (slot.nombre && String(slot.nombre).trim()) || 'Instalación ' + (slotIdx + 1);
    const cfg = slot.config || {};
    const sis =
      typeof etiquetaSistemaHidroponicoBreve === 'function' ? etiquetaSistemaHidroponicoBreve(cfg) : '';
    const sisTxt = sis ? 'Instalación ' + sis + ': ' : '';

    if (prefs.recarga && slot.ultimaRecarga) {
      const ultima = new Date(slot.ultimaRecarga);
      const diasDesde = Math.floor((ahora - ultima) / 86400000);
      if (diasDesde >= 14) {
        enviarNotificacion(
          '💧 HidroGrow — Recarga pendiente · ' + nombreTorre,
          sisTxt +
            'En «' +
            nombreTorre +
            '» han pasado ' +
            diasDesde +
            ' días desde la última recarga completa (vaciado + mezcla). Revisa el checklist en la app.',
          ''
        );
      }
    }

    if (prefs.medicion && slot.mediciones && slot.mediciones.length > 0) {
      const ultimaMed = slot.mediciones[0];
      const hoy = ahora.toLocaleDateString('es-ES');
      if (ultimaMed.fecha !== hoy) {
        const diasSinMedir = slot.mediciones[0].fecha
          ? Math.floor(
              (ahora - new Date(slot.mediciones[0].fecha.split('/').reverse().join('-'))) / 86400000
            )
          : 0;
        if (diasSinMedir >= 2) {
          enviarNotificacion(
            '📊 HidroGrow — Mide hoy · ' + nombreTorre,
            'En «' +
              nombreTorre +
              '» llevas ' +
              diasSinMedir +
              ' días sin registrar mediciones. Mide EC, pH y temperatura.',
            ''
          );
        }
      }
    }

    if (prefs.cosecha && Array.isArray(slot.torre)) {
      const numN = cfg.numNiveles || (typeof NUM_NIVELES !== 'undefined' ? NUM_NIVELES : 8);
      const numC = cfg.numCestas || (typeof NUM_CESTAS !== 'undefined' ? NUM_CESTAS : 5);
      let cultivosListos = 0;
      const muestras = [];
      for (let n = 0; n < numN && n < slot.torre.length; n++) {
        const row = slot.torre[n] || [];
        for (let ci = 0; ci < Math.min(numC, row.length); ci++) {
          const c = row[ci];
          if (!c || !c.variedad || !c.fecha) continue;
          const cultN = getCultivoDB(c.variedad);
          const dias =
            typeof getDiasEfectivosCicloBiologico === 'function'
              ? getDiasEfectivosCicloBiologico(c, cultN, ahora)
              : Math.floor((ahora - new Date(c.fecha)) / 86400000);
          const diasBase = DIAS_COSECHA[c.variedad] || 50;
          const diasTotal =
            typeof torreGetDiasCosechaObjetivo === 'function'
              ? torreGetDiasCosechaObjetivo(diasBase, cfg)
              : diasBase;
          if (dias >= diasTotal) {
            cultivosListos++;
            if (muestras.length < 2) {
              const labN = cultivoNombreLista(getCultivoDB(c.variedad), c.variedad);
              muestras.push(labN + ' (N' + (n + 1) + '·C' + (ci + 1) + ')');
            }
          }
        }
      }
      if (cultivosListos > 0) {
        const detalle =
          muestras.length > 0
            ? ' Ejemplos: ' + muestras.join(', ') + (cultivosListos > muestras.length ? '…' : '') + '.'
            : '';
        enviarNotificacion(
          '✂️ HidroGrow — Cosecha lista · ' + nombreTorre,
          'En «' +
            nombreTorre +
            '» tienes ' +
            cultivosListos +
            ' cultivo' +
            (cultivosListos === 1 ? '' : 's') +
            ' listos para cosechar.' +
            detalle,
          ''
        );
      }
    }

    if (prefs.esquejes && typeof evaluarAvisosEsquejesNotif === 'function') {
      const avisosEs = evaluarAvisosEsquejesNotif(slot);
      avisosEs.forEach(function (av) {
        enviarNotificacion(av.titulo, av.cuerpo, '');
      });
    }
  });

  if (typeof getRecomendacionEcPhTorre !== 'function') return;
  const prevT = state.torre;
  const prevC = state.configTorre;
  try {
    torres.forEach((slot, i) => {
      if (!slot || !slot.notifOpciones || !slot.notifOpciones.medicion) return;
      if (!slot.config) slot.config = {};
      state.torre = hcClonePlainData(slot.torre, []);
      state.configTorre = hcClonePlainData(hcNormalizarConfigSegunTipo(slot.config).config, {});
      const rec = getRecomendacionEcPhTorre();
      if (!rec || !rec.ec || !rec.ph) return;
      const firma =
        String(rec.faseDominante || 'general') +
        '|' +
        rec.ec.min +
        '-' +
        rec.ec.max +
        '|' +
        rec.ph.min +
        '-' +
        rec.ph.max;
      const prev = slot.config.ecPhRecomendacionFirma || '';
      if (prev && prev !== firma) {
        const nombreTorre = (slot.nombre && String(slot.nombre).trim()) || 'Instalación ' + (i + 1);
        enviarNotificacion(
          '🧪 Ajuste recomendado EC/pH · ' + nombreTorre,
          'En «' +
            nombreTorre +
            '»: nueva etapa detectada (' +
            (rec.faseDominante || 'general') +
            '). EC ' +
            rec.ec.min +
            '–' +
            rec.ec.max +
            ' µS/cm · pH ' +
            rec.ph.min +
            '–' +
            rec.ph.max +
            '.',
          ''
        );
      }
      slot.config.ecPhRecomendacionFirma = firma;
    });
  } finally {
    state.torre = prevT;
    state.configTorre = prevC;
  }
  saveState();
}

// Botón para activar notificaciones en pestaña inicio
function mostrarBtnNotificaciones() {
  if (!('Notification' in window)) return;
  const btn = document.getElementById('btnActivarNotif');
  if (Notification.permission === 'granted') {
    if (btn) btn.style.display = 'none';
  } else if (btn) {
    btn.style.display = 'flex';
  }
  if (typeof refreshDashNotificacionesUI === 'function') refreshDashNotificacionesUI();
}

try {
  refreshDashNotificacionesUI();
} catch (_) {}
