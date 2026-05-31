/**
 * Medición rápida (guardarMedicion) y showToast global.
 * Último bloque de la app; carga tras meteo-alarm-app.js. Siguiente: app-hc-setup-onboarding.js.
 */
async function guardarMedicion() {
  if (typeof sistemaEstaOperativa === 'function' && !sistemaEstaOperativa()) {
    showToast(typeof getMensajeStandbyContinuar === 'function'
      ? getMensajeStandbyContinuar()
      : '⏸ Instalación en stand-by / descanso. Reactiva modo operativa para continuar.', true);
    return;
  }
  const ec    = document.getElementById('inputEC').value.trim();
  const ph    = document.getElementById('inputPH').value.trim();
  const temp  = document.getElementById('inputTemp').value.trim();
  const vol   = document.getElementById('inputVol').value.trim();
  const humS  = '';
  const notas = document.getElementById('inputNotas')?.value.trim() || '';
  const amb   = typeof collectAmbienteMedicion === 'function' ? collectAmbienteMedicion() : {};
  const ambPayload = {
    tempAire: Number.isFinite(amb.tempAire) ? amb.tempAire : '',
    humSala: Number.isFinite(amb.humSala) ? amb.humSala : '',
    vpd: Number.isFinite(amb.vpd) ? amb.vpd : '',
    ppfd: Number.isFinite(amb.ppfd) ? amb.ppfd : '',
    lux: Number.isFinite(amb.lux) ? amb.lux : '',
    tempExt: Number.isFinite(amb.tempExt) ? amb.tempExt : '',
    co2: Number.isFinite(amb.co2) ? amb.co2 : '',
    fase: amb.fase || '',
  };

  if (!ec && !ph && !temp && !vol && !ambPayload.tempAire && !ambPayload.humSala && !ambPayload.vpd && !ambPayload.co2 && !ambPayload.ppfd) {
    showToast('⚠️ Introduce al menos un valor (depósito o ambiente)', true);
    const firstInput = document.getElementById('inputEC');
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
  try { cargarUltimaMedicion(); } catch (_) {}
  try { if (typeof refreshMonitorLive === 'function') refreshMonitorLive(); } catch (_) {}

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


function showToast(msg, error=false) {
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
  t.style.removeProperty('top');
  t.textContent = msg;
  t.setAttribute('aria-live', error ? 'assertive' : 'polite');
  t.style.background = error ? 'var(--red)' : 'var(--green)';
  t.style.color = error ? 'white' : 'var(--bg)';
  t.style.opacity = '0';
  t.style.transform = 'translateX(-50%) translateY(14px)';
  void t.offsetWidth;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  if (t._toastHideId) clearTimeout(t._toastHideId);
  t._toastHideId = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(14px)';
    t._toastHideId = 0;
  }, 3500);
}

