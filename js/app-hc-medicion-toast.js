/**
 * Medición rápida (guardarMedicion) y showToast global.
 * Último bloque de la app; carga tras meteo-alarm-app.js. Siguiente: app-hc-setup-onboarding.js.
 */
async function guardarMedicion(payloadOverride) {
  const fromPayload = payloadOverride && typeof payloadOverride === 'object';
  if (!fromPayload) {
    var cfgMed = state && state.configTorre ? state.configTorre : {};
    var medirGerm =
      typeof hcMedirPermiteRegistroGerminacion === 'function' &&
      hcMedirPermiteRegistroGerminacion(cfgMed);
    if (
      typeof medicionesOperativasPermitidas === 'function' &&
      !medicionesOperativasPermitidas() &&
      !medirGerm
    ) {
      showToast(
        'Completa montaje, cultivo y primer llenado antes del seguimiento diario en Medir.',
        true
      );
      try {
        if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
      } catch (_) {}
      return;
    }
    if (typeof sistemaEstaOperativa === 'function' && !sistemaEstaOperativa()) {
      showToast(typeof getMensajeStandbyContinuar === 'function'
        ? getMensajeStandbyContinuar()
        : '⏸ Instalación en stand-by / descanso. Reactiva modo operativa para continuar.', true);
      return;
    }
  } else {
    var cfgMedP = state && state.configTorre ? state.configTorre : {};
    var medirGermP =
      typeof hcMedirPermiteRegistroGerminacion === 'function' &&
      hcMedirPermiteRegistroGerminacion(cfgMedP);
    if (
      typeof medicionesOperativasPermitidas === 'function' &&
      !medicionesOperativasPermitidas() &&
      !medirGermP
    ) {
      showToast(
        'Completa montaje, cultivo y primer llenado antes del seguimiento diario.',
        true
      );
      return;
    }
    if (typeof sistemaEstaOperativa === 'function' && !sistemaEstaOperativa()) {
      showToast(typeof getMensajeStandbyContinuar === 'function'
        ? getMensajeStandbyContinuar()
        : '⏸ Instalación en stand-by. Reactiva modo operativa.', true);
      return;
    }
  }

  const ec = fromPayload && payloadOverride.ec != null
    ? String(payloadOverride.ec).trim()
    : document.getElementById('inputEC').value.trim();
  const ph = fromPayload && payloadOverride.ph != null
    ? String(payloadOverride.ph).trim()
    : document.getElementById('inputPH').value.trim();
  const temp = fromPayload && payloadOverride.temp != null
    ? String(payloadOverride.temp).trim()
    : document.getElementById('inputTemp').value.trim();
  const vol = fromPayload && payloadOverride.vol != null
    ? String(payloadOverride.vol).trim()
    : document.getElementById('inputVol').value.trim();
  const humS = '';
  const notas = fromPayload && payloadOverride.notas != null
    ? String(payloadOverride.notas).trim()
    : (document.getElementById('inputNotas')?.value.trim() || '');

  let ambPayload;
  if (fromPayload && (payloadOverride.tempAire !== undefined || payloadOverride.humSala !== undefined)) {
    ambPayload = {
      tempAire: payloadOverride.tempAire !== '' && payloadOverride.tempAire != null && Number.isFinite(Number(payloadOverride.tempAire))
        ? Number(payloadOverride.tempAire) : '',
      humSala: payloadOverride.humSala !== '' && payloadOverride.humSala != null && Number.isFinite(Number(payloadOverride.humSala))
        ? Number(payloadOverride.humSala) : '',
      vpd: payloadOverride.vpd !== '' && payloadOverride.vpd != null && Number.isFinite(Number(payloadOverride.vpd))
        ? Number(payloadOverride.vpd) : '',
      ppfd: payloadOverride.ppfd !== '' && payloadOverride.ppfd != null && Number.isFinite(Number(payloadOverride.ppfd))
        ? Number(payloadOverride.ppfd) : '',
      lux: payloadOverride.lux !== '' && payloadOverride.lux != null && Number.isFinite(Number(payloadOverride.lux))
        ? Number(payloadOverride.lux) : '',
      tempExt: payloadOverride.tempExt !== '' && payloadOverride.tempExt != null && Number.isFinite(Number(payloadOverride.tempExt))
        ? Number(payloadOverride.tempExt) : '',
      co2: payloadOverride.co2 !== '' && payloadOverride.co2 != null && Number.isFinite(Number(payloadOverride.co2))
        ? Number(payloadOverride.co2) : '',
      fase: payloadOverride.fase || (typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : ''),
    };
  } else {
    const amb = typeof collectAmbienteMedicion === 'function' ? collectAmbienteMedicion() : {};
    ambPayload = {
      tempAire: Number.isFinite(amb.tempAire) ? amb.tempAire : '',
      humSala: Number.isFinite(amb.humSala) ? amb.humSala : '',
      vpd: Number.isFinite(amb.vpd) ? amb.vpd : '',
      ppfd: Number.isFinite(amb.ppfd) ? amb.ppfd : '',
      lux: Number.isFinite(amb.lux) ? amb.lux : '',
      tempExt: Number.isFinite(amb.tempExt) ? amb.tempExt : '',
      co2: Number.isFinite(amb.co2) ? amb.co2 : '',
      fase: amb.fase || '',
    };
  }

  var medirGermSave =
    typeof hcMedirPermiteRegistroGerminacion === 'function' &&
    hcMedirPermiteRegistroGerminacion(state.configTorre || {});
  if (!ec && !ph && !temp && !vol && !ambPayload.tempAire && !ambPayload.humSala && !ambPayload.vpd && !ambPayload.co2 && !ambPayload.ppfd) {
    showToast(
      medirGermSave
        ? '⚠️ Introduce al menos T° y HR del domo (el VPD se calcula solo)'
        : '⚠️ Introduce al menos un valor (depósito o ambiente)',
      true
    );
    const firstInput = document.getElementById(medirGermSave ? 'inputTempAire' : 'inputEC');
    if (firstInput) {
      firstInput.focus();
      firstInput.setAttribute('aria-invalid', 'true');
    }
    return;
  }

  const now   = new Date();
  const dia   = String(now.getDate()).padStart(2,'0');
  const mes   = String(now.getMonth()+1).padStart(2,'0');
  const anyo  = now.getFullYear();
  const fecha = dia + '/' + mes + '/' + anyo;
  const hora  = now.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });

  // ── 1. GUARDAR SIEMPRE EN LOCAL PRIMERO ───────────────────────────────────
  state.ultimaMedicion = { fecha, hora, ec, ph, temp, vol, humSustrato: humS, notas, ...ambPayload };
  if (!state.mediciones) state.mediciones = [];
  state.mediciones.unshift({ fecha, hora, tipo:'medicion', ec, ph, temp, vol, humSustrato: humS, notas, ...ambPayload });
  if (state.mediciones.length > 200)
    state.mediciones = state.mediciones.slice(0, 200);

  if (
    vol &&
    state.configTorre &&
    typeof getVolumenDepositoMaxLitros === 'function'
  ) {
    const volN = parseFloat(String(vol).trim().replace(',', '.'));
    const vmax = getVolumenDepositoMaxLitros(state.configTorre);
    if (Number.isFinite(volN) && volN >= 0.5 && vmax != null && Number.isFinite(vmax) && vmax > 0) {
      const capped = Math.min(vmax, Math.max(0.5, Math.round(volN * 10) / 10));
      if (capped < vmax - 0.05) state.configTorre.volMezclaLitros = capped;
      else delete state.configTorre.volMezclaLitros;
      try {
        if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      } catch (_) {}
    }
  }

  try {
    if (typeof intentarLimpiarEcAvisoTrasMedicion === 'function') intentarLimpiarEcAvisoTrasMedicion(ec);
  } catch (_) {}

  // Línea única en el registro unificado (Historial → Registro)
  addRegistro('medicion', { ec, ph, temp, vol, humSustrato: humS, notas, ...ambPayload, icono: '📊' });

  // Si es una recarga marcada
  if (esRecarga) {
    state.ultimaRecarga = now.toISOString().split('T')[0];
    state.recargaSnoozeHasta = null;
    esRecarga = false;
    const rsw = document.getElementById('recargaSwitch');
    rsw.className = 'toggle-switch';
    rsw.setAttribute('aria-checked', 'false');
    if (!state.recargasLocal) state.recargasLocal = [];
    const _nr = getNutrienteTorre();
    state.recargasLocal.unshift({
      fecha, hora, ecFinal: ec, phFinal: ph, tempFinal: temp, volFinal: vol,
      torreId: getTorreActiva().id != null ? getTorreActiva().id : (state.torreActiva || 0),
      torreNombre: (getTorreActiva().nombre || '').trim() || 'Instalación',
      torreEmoji: getTorreActiva().emoji || '🌿',
      calmagMl: '',
      vegaAMl: String(calcularMlParteNutriente(0)),
      vegaBMl: _nr && _nr.partes >= 2 ? String(calcularMlParteNutriente(1)) : '',
      vegaCMl: _nr && _nr.partes >= 3 ? String(calcularMlParteNutriente(2)) : '',
      phMasMl: '', phMenosMl: '', notas
    });
  }

  saveState(); // Guardar en localStorage SIEMPRE

  // Refrescar historial si está visible
  if (document.getElementById('tab-historial').classList.contains('active')) {
    cargarHistorial();
  }

  // ── 2. ACTUALIZAR UI ──────────────────────────────────────────────────────
  const skipClear = fromPayload && payloadOverride.skipClearInputs === true;
  if (!skipClear) {
  // Limpiar campos
  ['inputEC','inputPH','inputTemp','inputVol','inputNotas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = '';
      if (id !== 'inputNotas') el.removeAttribute('aria-invalid');
    }
  });
  ['statusEC','statusPH','statusTemp','statusVol'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.className = 'param-status'; el.innerHTML = ''; }
  });
  ['cardEC','cardPH','cardTemp','cardVol'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'param-card';
  });
  ['correccionEC','correccionPH','correccionTemp','correccionVol'].forEach(id => {
    showCorreccion(id, '');
  });
  }
  try { cargarUltimaMedicion(); } catch (_) {}
  try {
    if (typeof refreshMonitorLive === 'function') refreshMonitorLive();
  } catch (_) {}
  try {
    if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
  } catch (_) {}

  updateDashboard();
  updateRecargaBar();
  try {
    if (vol && typeof actualizarBadgesNutriente === 'function') actualizarBadgesNutriente();
  } catch (_) {}
  try {
    if (vol) {
      const panSis = document.getElementById('tab-sistema');
      if (panSis && panSis.classList.contains('active') && typeof renderTorre === 'function') renderTorre();
      else if (typeof updateTorreStats === 'function') updateTorreStats();
    }
  } catch (_) {}
  showToast('✅ Medición guardada · EC:' + (ec||'—') + ' pH:' + (ph||'—'));

  try {
    if (typeof refreshDashOperativaHub === 'function') refreshDashOperativaHub();
    if (typeof renderSalaSeguimientoCta === 'function') renderSalaSeguimientoCta();
  } catch (_) {}

  // Alertas unificadas (motor único)
  var evalPayload = {
    ec: ec,
    ph: ph,
    temp: temp,
    vol: vol,
    tempAire: ambPayload.tempAire,
    humSala: ambPayload.humSala,
    vpd: ambPayload.vpd,
    ppfd: ambPayload.ppfd,
    lux: ambPayload.lux,
    tempExt: ambPayload.tempExt,
    co2: ambPayload.co2,
    fase: ambPayload.fase || (typeof getFaseCultivoActual === 'function' ? getFaseCultivoActual() : ''),
  };
  var evalResult =
    typeof evaluarMedicionCompleta === 'function' ? evaluarMedicionCompleta(evalPayload) : null;
  if (evalResult && evalResult.alertas && evalResult.alertas.length) {
    if (typeof showAlertasPostGuardado === 'function') showAlertasPostGuardado(evalResult);
    showToast('⚠️ ' + evalResult.alertas.length + ' valor(es) fuera de rango — revisa avisos', true);
  }

  // ── 3. INTENTAR ENVIAR A GOOGLE SHEETS (opcional) ────────────────────────
  const alertasText =
    evalResult && typeof alertasToTexto === 'function' ? alertasToTexto(evalResult) : '';

  await hcPostSheets({
    action: 'medicion', fecha, hora, ec, ph, temp, volumen: vol,
    humSustrato: humS || null,
    tempAire: ambPayload.tempAire || null,
    humSala: ambPayload.humSala || null,
    vpd: ambPayload.vpd || null,
    ppfd: ambPayload.ppfd || null,
    notas, alertas: alertasText
  });
}


function showToast(msg, error, opts) {
  if (error != null && typeof error === 'object' && !opts) {
    opts = error;
    error = false;
  }
  const isError = error === true;
  opts = opts && typeof opts === 'object' ? opts : {};
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'hc-toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    t.setAttribute('aria-atomic', 'true');
    document.body.appendChild(t);
  } else if (!t.classList.contains('hc-toast')) {
    t.classList.add('hc-toast');
  }
  t.classList.toggle('hc-toast--prominent', !!opts.prominent || opts.zIndex != null);
  t.style.removeProperty('top');
  const setupOpen = !!document.getElementById('setupOverlay')?.classList.contains('open');
  if (setupOpen && opts.zIndex == null) {
    opts.zIndex = 10550;
    if (isError) opts.prominent = true;
  }
  if (opts.zIndex != null) t.style.zIndex = String(opts.zIndex);
  else t.style.removeProperty('z-index');
  var toastHtml = opts.html || (typeof hcToastHtml === 'function' ? hcToastHtml(msg, isError) : null);
  if (toastHtml) t.innerHTML = toastHtml;
  else t.textContent = msg;
  t.setAttribute('aria-live', isError ? 'assertive' : 'polite');
  t.style.background = isError ? 'var(--red)' : 'var(--green)';
  t.style.color = isError ? 'white' : 'var(--bg)';
  t.style.opacity = '0';
  t.style.transform = 'translateX(-50%) translateY(14px)';
  void t.offsetWidth;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  if (t._toastHideId) clearTimeout(t._toastHideId);
  const durationMs = Number.isFinite(opts.durationMs) ? opts.durationMs : 3500;
  t._toastHideId = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(14px)';
    t._toastHideId = 0;
  }, durationMs);
}

/** Tras «Guardar y empezar»: toast visible encima del asistente recién cerrado. */
function hcNotifyInstalacionGuardada(opts) {
  opts = opts && typeof opts === 'object' ? opts : {};
  const nombre = String(opts.nombre || '').trim();
  const cam = String(opts.camino || '').trim();
  const faseGerm = !!opts.faseGerm;
  const salaPre = !!opts.salaPreGerm;
  let msg = nombre ? '✅ «' + nombre + '» guardada' : '✅ Instalación guardada';
  if (salaPre) {
    msg += ' · Montaje de sala y luego las 6 fases';
  } else if (faseGerm && cam === 'semilla_hidro') {
    msg += ' · Prep hidro → sala → 6 fases en Inicio';
  } else if (faseGerm && cam === 'semilla_propagador') {
    msg += ' · Checklist propagador → 6 fases (sala después)';
  } else if (!faseGerm) {
    msg += ' · Continúa en Sala o Cultivo';
  }
  const delayMs = Number.isFinite(opts.delayMs) ? opts.delayMs : 280;
  setTimeout(function () {
    showToast(msg, false, { durationMs: 8200, zIndex: 10400, prominent: true });
  }, delayMs);
  try {
    if (typeof hcMostrarBannerSalaPostSetup === 'function' && (salaPre || !faseGerm || cam === 'semilla_hidro')) {
      hcMostrarBannerSalaPostSetup(nombre, { camino: cam, faseGerm: faseGerm });
    }
  } catch (_) {}
}

