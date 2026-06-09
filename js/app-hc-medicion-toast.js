/**
 * Medición rápida (guardarMedicion) y showToast global.
 * Último bloque de la app; carga tras meteo-alarm-app.js. Siguiente: app-hc-setup-onboarding.js.
 */

function readMedirInputVal(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || '').trim() : '';
}

function buildMedicionGuardadaMsg(ec, ph, temp, vol, ambPayload, medirGermSave) {
  if (medirGermSave) {
    const parts = [];
    if (temp) parts.push('T° agua ' + temp + '°C');
    if (ambPayload.humSala !== '' && ambPayload.humSala != null) {
      parts.push('HR ' + ambPayload.humSala + '%');
    }
    if (vol) parts.push(vol + ' L');
    if (ambPayload.tempAire !== '' && ambPayload.tempAire != null) {
      parts.push('T° aire ' + ambPayload.tempAire + '°C');
    }
    if (ambPayload.vpd !== '' && ambPayload.vpd != null) {
      parts.push('VPD ' + ambPayload.vpd);
    }
    if (ec) parts.push('EC ' + ec);
    if (ph) parts.push('pH ' + ph);
    if (parts.length) return '✅ Medición guardada · ' + parts.join(' · ');
    return '✅ Medición guardada (germinación)';
  }
  const dep = [];
  if (ec) dep.push('EC ' + ec);
  if (ph) dep.push('pH ' + ph);
  if (temp) dep.push('T° agua ' + temp);
  if (vol) dep.push(vol + ' L');
  if (dep.length) return '✅ Medición guardada · ' + dep.join(' · ');
  return '✅ Medición guardada';
}

function hcNotifyMedicionGuardada(msg, extraOpts) {
  const opts = Object.assign({ durationMs: 5200, prominent: true }, extraOpts || {});
  showToast(msg, false, opts);
  const card = document.getElementById('ultimaMedicionCard');
  if (card) {
    card.classList.add('ultima-medicion-card--just-saved');
    setTimeout(function () {
      card.classList.remove('ultima-medicion-card--just-saved');
    }, 2400);
  }
  document.querySelectorAll('.medir-save-btn').forEach(function (btn) {
    if (!(btn instanceof HTMLButtonElement)) return;
    const prev = btn.textContent;
    btn.classList.add('medir-save-btn--saved');
    btn.textContent = '✓ Guardada';
    btn.disabled = true;
    setTimeout(function () {
      btn.classList.remove('medir-save-btn--saved');
      btn.textContent = prev;
      btn.disabled = false;
    }, 1800);
  });
}

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
    if (
      typeof sistemaEstaOperativa === 'function' &&
      !sistemaEstaOperativa() &&
      !medirGerm
    ) {
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
    if (
      typeof sistemaEstaOperativa === 'function' &&
      !sistemaEstaOperativa() &&
      !medirGermP
    ) {
      showToast(typeof getMensajeStandbyContinuar === 'function'
        ? getMensajeStandbyContinuar()
        : '⏸ Instalación en stand-by. Reactiva modo operativa.', true);
      return;
    }
  }

  const ec = fromPayload && payloadOverride.ec != null
    ? String(payloadOverride.ec).trim()
    : readMedirInputVal('inputEC');
  const ph = fromPayload && payloadOverride.ph != null
    ? String(payloadOverride.ph).trim()
    : readMedirInputVal('inputPH');
  const temp = fromPayload && payloadOverride.temp != null
    ? String(payloadOverride.temp).trim()
    : readMedirInputVal('inputTemp');
  const vol = fromPayload && payloadOverride.vol != null
    ? String(payloadOverride.vol).trim()
    : readMedirInputVal('inputVol');
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
        ? '⚠️ Introduce al menos T° del agua, HR o volumen (propagador o cubo)'
        : '⚠️ Introduce al menos un valor (depósito o ambiente)',
      true
    );
    const firstInput = document.getElementById(medirGermSave ? 'inputTemp' : 'inputEC');
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
    !medirGermSave &&
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

  if (medirGermSave) {
    try {
      const cfgGerm = state.configTorre || {};
      if (typeof ensureGerminacionFlow === 'function') {
        const gGerm = ensureGerminacionFlow(cfgGerm);
        const tAgua = temp ? parseFloat(String(temp).replace(',', '.')) : NaN;
        const hDomo =
          ambPayload.humSala !== '' && ambPayload.humSala != null
            ? Number(ambPayload.humSala)
            : NaN;
        let vpdDomo = ambPayload.vpd;
        if (
          (vpdDomo === '' || vpdDomo == null || !Number.isFinite(Number(vpdDomo))) &&
          typeof calcVPDkPa === 'function' &&
          Number.isFinite(tAgua) &&
          Number.isFinite(hDomo)
        ) {
          vpdDomo = calcVPDkPa(tAgua, hDomo);
        }
        gGerm.ultimaDomo = {
          fecha,
          hora,
          temp: Number.isFinite(tAgua) ? tAgua : gGerm.ultimaDomo && gGerm.ultimaDomo.temp != null ? gGerm.ultimaDomo.temp : null,
          hr: Number.isFinite(hDomo) ? hDomo : gGerm.ultimaDomo && gGerm.ultimaDomo.hr != null ? gGerm.ultimaDomo.hr : null,
          vpd: Number.isFinite(Number(vpdDomo)) ? Number(vpdDomo) : null,
          vol: vol ? parseFloat(String(vol).replace(',', '.')) : null,
        };
        if (typeof persistirGerminacion === 'function') persistirGerminacion();
        else if (typeof guardarEstadoTorreActual === 'function') guardarEstadoTorreActual();
      }
    } catch (_) {}
  }

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

  var savedOk = typeof saveState === 'function' ? saveState() : true;
  if (savedOk === false) {
    if (typeof showToast === 'function') {
      showToast('No se pudo guardar en el dispositivo. Revisa espacio o recarga la página.', true);
    }
    return;
  }

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

  var msgOk = buildMedicionGuardadaMsg(ec, ph, temp, vol, ambPayload, medirGermSave);
  if (evalResult && evalResult.alertas && evalResult.alertas.length) {
    msgOk += ' · ' + evalResult.alertas.length + ' aviso(s) fuera de rango';
  }
  hcNotifyMedicionGuardada(msgOk);

  if (evalResult && evalResult.alertas && evalResult.alertas.length) {
    if (typeof showAlertasPostGuardado === 'function') showAlertasPostGuardado(evalResult);
    setTimeout(function () {
      showToast(
        '⚠️ Revisa los valores marcados en Medir (fuera de rango)',
        true,
        { durationMs: 4800, prominent: true }
      );
    }, 700);
  }

  // ── 2. ACTUALIZAR UI (no debe impedir la confirmación) ───────────────────
  try {
    const tabHist = document.getElementById('tab-historial');
    if (tabHist && tabHist.classList.contains('active') && typeof cargarHistorial === 'function') {
      cargarHistorial();
    }
  } catch (errHist) {
    console.warn('guardarMedicion historial', errHist);
  }

  const skipClear = fromPayload && payloadOverride.skipClearInputs === true;
  try {
    if (!skipClear) {
      ['inputEC', 'inputPH', 'inputTemp', 'inputVol', 'inputNotas'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
          el.value = '';
          if (id !== 'inputNotas') el.removeAttribute('aria-invalid');
        }
      });
      ['statusEC', 'statusPH', 'statusTemp', 'statusVol'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
          el.className = 'param-status';
          el.innerHTML = '';
        }
      });
      ['cardEC', 'cardPH', 'cardTemp', 'cardVol'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.className = 'param-card';
      });
      ['correccionEC', 'correccionPH', 'correccionTemp', 'correccionVol'].forEach(function (id) {
        if (typeof showCorreccion === 'function') showCorreccion(id, '');
      });
      [
        'inputTempAire', 'inputHumSala', 'inputVPD', 'inputPPFD', 'inputCO2', 'inputTempExt', 'inputLux',
      ].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
          el.value = '';
          el.removeAttribute('aria-invalid');
        }
      });
      [
        'statusTempAire', 'statusHumSala', 'statusVPD', 'statusPPFD', 'statusCO2', 'statusTempExt',
      ].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
          el.className = 'param-status';
          el.innerHTML = '';
        }
      });
      ['cardTempAire', 'cardHumSala', 'cardVPD', 'cardPPFD', 'cardCO2', 'cardTempExt'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.className = 'param-card';
      });
    }
    if (typeof cargarUltimaMedicion === 'function') cargarUltimaMedicion();
    if (typeof refreshMonitorLive === 'function') refreshMonitorLive();
    if (typeof refreshMedirOperativaUi === 'function') refreshMedirOperativaUi();
    if (typeof updateDashboard === 'function') updateDashboard({ lite: true, skipLifecycle: true });
    if (typeof updateRecargaBar === 'function') updateRecargaBar();
    if (vol && typeof actualizarBadgesNutriente === 'function') actualizarBadgesNutriente();
    if (vol) {
      const panSis = document.getElementById('tab-sistema');
      if (panSis && panSis.classList.contains('active') && typeof renderTorre === 'function') {
        renderTorre();
      } else if (typeof updateTorreStats === 'function') {
        updateTorreStats();
      }
    }
    if (typeof refreshDashOperativaHub === 'function') refreshDashOperativaHub();
    if (typeof renderSalaSeguimientoCta === 'function') renderSalaSeguimientoCta();
  } catch (errUi) {
    console.warn('guardarMedicion UI refresh', errUi);
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
  const soloEquipSala = !!opts.soloEquipSala;
  let msg = nombre ? '✅ «' + nombre + '» guardada' : '✅ Instalación guardada';
  if (salaPre && soloEquipSala) {
    msg = '✅ Equipamiento de sala guardado · checklist en pestaña Sala';
  } else if (salaPre) {
    msg += ' · Montaje de sala y luego las 6 fases';
  } else if (faseGerm && cam === 'semilla_hidro') {
    msg += ' · Prep hidro → sala → 6 fases en Inicio';
  } else if (faseGerm && cam === 'semilla_propagador') {
    msg += ' · Checklist propagador → registro en Inicio (sala cuando quieras)';
  } else if (!faseGerm) {
    msg += ' · Continúa en Sala o Cultivo';
  }
  const delayMs = Number.isFinite(opts.delayMs) ? opts.delayMs : 280;
  setTimeout(function () {
    showToast(msg, false, { durationMs: 8200, zIndex: 10400, prominent: true });
  }, delayMs);
  try {
    if (
      typeof hcMostrarBannerSalaPostSetup === 'function' &&
      !soloEquipSala &&
      (salaPre || !faseGerm || cam === 'semilla_hidro')
    ) {
      hcMostrarBannerSalaPostSetup(nombre, { camino: cam, faseGerm: faseGerm });
    }
  } catch (_) {}
}

