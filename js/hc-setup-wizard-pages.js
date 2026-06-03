/** Páginas del asistente DWC/RDWC (preview, grid nutrientes). */

function updateNftSetupPreview() {}
function buildNftDraftConfigFromSetupUi() { return { tipoInstalacion: 'dwc' }; }
function refrescarNftCanalesSliderEtiqueta() {}

function renderSetupPage() {
  // Instalación nueva: el último paso es cultivos (6); nunca mostrar spage7 (resumen/«varias torres»).
  const ultimoPasoRender =
    typeof getSetupUltimoPasoIndice === 'function'
      ? getSetupUltimoPasoIndice()
      : setupEsNuevaTorre
        ? SETUP_TOTAL_PAGES - 2
        : SETUP_TOTAL_PAGES - 1;
  if (setupEsNuevaTorre && setupPagina > ultimoPasoRender) {
    setupPagina = ultimoPasoRender;
  }

  // Ocultar todas las páginas
  document.querySelectorAll('.setup-page').forEach(p => p.classList.remove('active'));

  // Mostrar página actual
  const pageId = (typeof SETUP_PAGE_IDS !== 'undefined' && SETUP_PAGE_IDS[setupPagina])
    ? SETUP_PAGE_IDS[setupPagina]
    : ('spage' + setupPagina);
  const curr = document.getElementById(pageId);
  if (curr) curr.classList.add('active');

  const nomWrap = document.getElementById('setupNombreInstalacionWrap');
  const nomInp = document.getElementById('setupNombreInstalacionInput');
  if (nomWrap && nomInp) {
    const showNom = setupEsNuevaTorre && setupPagina === SETUP_PAGE_GEOMETRY;
    nomWrap.classList.toggle('setup-hidden', !showNom);
    if (showNom && document.activeElement !== nomInp) {
      nomInp.value = setupNombreNuevaTorre || '';
    }
  }

  // Acciones específicas por página
  if (
    setupPagina === SETUP_PAGE_WELCOME ||
    setupPagina === SETUP_PAGE_PREMIUM_END ||
    setupPagina === SETUP_PAGE_GEOMETRY
  ) {
    refrescarSetupTipoInstalacionUI();
  }
  if (setupPagina === SETUP_PAGE_GEOMETRY) {
    setTimeout(function () {
      try {
        if (typeof refreshDwcSetupPreview === 'function') refreshDwcSetupPreview();
        if (typeof refreshRdwcSetupPreview === 'function') refreshRdwcSetupPreview();
      } catch (_) {}
    }, 0);
  }
  if (setupPagina === SETUP_PAGE_ORIGEN && typeof refreshCaminoCultivoUI === 'function') {
    setTimeout(refreshCaminoCultivoUI, 0);
  }
  if (setupPagina >= SETUP_PAGE_PREMIUM_START && setupPagina <= SETUP_PAGE_PREMIUM_END) {
    setTimeout(function () {
      if (typeof cargarPremiumSetupUI === 'function') cargarPremiumSetupUI(setupPagina);
      if (
        setupPagina === SETUP_PAGE_PREMIUM_3 &&
        typeof renderEquipamientoPremiumUI === 'function'
      ) {
        renderEquipamientoPremiumUI();
      }
    }, 0);
  }
  if (setupPagina === SETUP_PAGE_EQUIP) {
    refreshSetupEquipEntornoVis();
    refreshSetupEquipamientoCardsDesdeSet();
    cargarSetupSensoresHwUI();
    refreshSetupCalentadorConsignaVis();
    if (typeof renderEquipamientoPremiumUI === 'function') {
      setTimeout(renderEquipamientoPremiumUI, 0);
    }
    if (typeof applySetupFlowCondensedUI === 'function') {
      setTimeout(function () {
        applySetupFlowCondensedUI(SETUP_PAGE_EQUIP);
      }, 0);
    }
  }
  if (setupPagina === SETUP_PAGE_AGUA) {
    setTimeout(function () {
      if (typeof syncSetupDataFromPremium === 'function') syncSetupDataFromPremium();
      if (typeof seleccionarSustrato === 'function') seleccionarSustrato(setupData.sustrato || 'lana', false);
      if (typeof seleccionarAgua === 'function' && setupData.agua) seleccionarAgua(setupData.agua);
      if (typeof applySetupFlowCondensedUI === 'function') applySetupFlowCondensedUI(SETUP_PAGE_AGUA);
    }, 0);
  }
  if (setupPagina === SETUP_PAGE_NUTRIENTES) {
    renderNutrientesGrid();
    setTimeout(renderDosisSetup, 100);
  }
  if (setupPagina === SETUP_PAGE_UBICACION) {
    setTimeout(function () {
      if (typeof applySetupFlowCondensedUI === 'function') applySetupFlowCondensedUI(SETUP_PAGE_UBICACION);
      else if (typeof syncWizardLuzUI === 'function') syncWizardLuzUI();
    }, 0);
  }
  if (setupPagina === SETUP_PAGE_CULTIVOS) {
    setTimeout(function () {
      if (typeof renderSetupPlantasGrid === 'function') renderSetupPlantasGrid();
      if (typeof renderSetupCultivosResumen === 'function') renderSetupCultivosResumen();
    }, 50);
  }
  if (setupPagina === SETUP_PAGE_RESUMEN) setTimeout(actualizarResumenSetup, 50);

  // Dots de progreso (ocultar pasos saltados)
  const skipDots =
    typeof getSetupSkippedPages === 'function' ? getSetupSkippedPages() : new Set();
  for (let i = 0; i < SETUP_TOTAL_PAGES; i++) {
    const dot = document.getElementById('sdot' + i);
    if (!dot) continue;
    if (skipDots.has(i)) {
      dot.style.display = 'none';
      continue;
    }
    dot.style.display = '';
    dot.className = 'setup-step-dot';
    if (i < setupPagina) dot.classList.add('done');
    else if (i === setupPagina) dot.classList.add('active');
  }

  // Labels de cada paso
  const labels = [
    'Bienvenida',           // 0
    'Origen planta',        // 1
    'Objetivo',             // 2
    'Entorno',              // 3
    'Espacio',              // 4
    'Clima y luz',          // 5
    'Genética',             // 6
    'Detalle origen',       // 7
    'Sistema hidro',        // 8
    'Geometría',            // 9
    'Equipamiento',         // 10
    'Agua y fijación',      // 11
    'Nutrientes',           // 12
    'Meteo',                // 13
    'Cultivos',             // 14
    'Resumen',              // 15
  ];
  const labelEl = document.getElementById('setupStepLabel');
  if (labelEl) {
    const flowInfo =
      typeof getSetupDisplayStepInfo === 'function'
        ? getSetupDisplayStepInfo(setupPagina)
        : { step: setupPagina + 1, total: SETUP_TOTAL_PAGES };
    if (setupEsNuevaTorre) {
      const nomLbl = (setupNombreNuevaTorre || '').trim() || 'Nueva instalación';
      labelEl.textContent =
        setupPagina === 0
          ? '🌿 ' + nomLbl + ' — configuración'
          : nomLbl +
            ' · Paso ' +
            flowInfo.step +
            ' de ' +
            flowInfo.total +
            ' — ' +
            (labels[setupPagina] || '');
    } else {
      labelEl.textContent =
        setupPagina === 0
          ? 'Bienvenido'
          : 'Paso ' +
            flowInfo.step +
            ' de ' +
            flowInfo.total +
            ' — ' +
            (labels[setupPagina] || '');
    }
  }

  // Botones navegación
  const back = document.getElementById('setupBtnBack');
  const next = document.getElementById('setupBtnNext');
  if (back) {
    back.style.display =
      setupPagina > (typeof SETUP_PAGE_ORIGEN !== 'undefined' ? SETUP_PAGE_ORIGEN : 1)
        ? 'block'
        : 'none';
  }
  const ultimoPaso =
    typeof getSetupUltimoPasoIndice === 'function'
      ? getSetupUltimoPasoIndice()
      : setupEsNuevaTorre
        ? SETUP_TOTAL_PAGES - 2
        : SETUP_TOTAL_PAGES - 1;
  if (next) {
    if (setupPagina === 0) {
      next.style.display = 'none';
      next.setAttribute('aria-hidden', 'true');
      next.tabIndex = -1;
    } else {
      next.style.display = '';
      next.removeAttribute('aria-hidden');
      next.tabIndex = 0;
      if (setupPagina === ultimoPaso) {
        next.textContent =
          typeof hcSetupEnFaseSalaPreGerm === 'function' && hcSetupEnFaseSalaPreGerm()
            ? '✅ Guardar sala e ir a montaje'
            : typeof hcSetupEnFaseGerminacion === 'function' && hcSetupEnFaseGerminacion()
              ? '✅ Guardar e ir a germinación'
              : '✅ Guardar y empezar';
        next.setAttribute('aria-label', 'Guardar configuración y empezar');
      } else {
        next.textContent = 'Siguiente →';
        next.setAttribute('aria-label', 'Continuar al siguiente paso');
      }
    }
  }
  try {
    if (typeof aplicarSetupWizardExclusividadTorreVertical === 'function') {
      aplicarSetupWizardExclusividadTorreVertical();
    }
  } catch (_) {}
  try {
    if (typeof renderSetupGuiaPanel === 'function') renderSetupGuiaPanel(setupPagina);
  } catch (_) {}
  try {
    if (typeof applySetupFlowCondensedUI === 'function') applySetupFlowCondensedUI(setupPagina);
  } catch (_) {}
}

function hcScrollSetupWizardAlFalloGuardado() {
  try {
    const sc = document.querySelector('.setup-content');
    if (sc) sc.scrollTop = 0;
  } catch (_) {}
}

function setupNext() {
  if (setupPagina === SETUP_PAGE_WELCOME) {
    setupPagina =
      typeof setupFlowAdvancePage === 'function' ? setupFlowAdvancePage(1) : SETUP_PAGE_ORIGEN;
    renderSetupPage();
    return;
  }
  if (setupPagina === SETUP_PAGE_PREMIUM_END) {
    if (setupTipoInstalacion !== 'dwc' && setupTipoInstalacion !== 'rdwc') {
      showToast('Elige DWC o RDWC antes de continuar a geometría', true);
      return;
    }
  }
  if (setupEsNuevaTorre && setupPagina === SETUP_PAGE_GEOMETRY) {
    const inpNom = document.getElementById('setupNombreInstalacionInput');
    if (inpNom) setupNombreNuevaTorre = (inpNom.value || '').trim().slice(0, 40);
    if (!setupNombreNuevaTorre) {
      showToast('Escribe un nombre para esta instalación', true);
      inpNom?.focus();
      return;
    }
  }
  if (setupPagina >= SETUP_PAGE_PREMIUM_START && setupPagina <= SETUP_PAGE_PREMIUM_END) {
    if (typeof validarPremiumSetupPaso === 'function' && !validarPremiumSetupPaso(setupPagina)) return;
    if (setupPagina === SETUP_PAGE_PREMIUM_1 && typeof persistConsejosModoSetupToPremium === 'function') {
      persistConsejosModoSetupToPremium();
    }
    if (setupPagina === SETUP_PAGE_PREMIUM_END && typeof syncSetupDataFromPremium === 'function') {
      syncSetupDataFromPremium();
    }
  }
  if (setupPagina === SETUP_PAGE_CULTIVOS && typeof validarPlantasVsSalaPremium === 'function') {
    const nPl = typeof setupPlantasSeleccionadas !== 'undefined' ? setupPlantasSeleccionadas.size : 0;
    const v = validarPlantasVsSalaPremium(nPl);
    if (v && v.ok === false && typeof showToast === 'function') {
      showToast(v.msg, true);
    }
  }
  const ultimoPaso =
    typeof getSetupUltimoPasoIndice === 'function'
      ? getSetupUltimoPasoIndice()
      : setupEsNuevaTorre
        ? SETUP_TOTAL_PAGES - 2
        : SETUP_TOTAL_PAGES - 1;
  if (setupPagina === ultimoPaso && typeof hcSetupEnFaseGerminacion === 'function' && hcSetupEnFaseGerminacion()) {
    const inst = (state.configTorre && state.configTorre.equipamientoInstalado) || {};
    const cam = typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
    if (
      (cam === 'semilla_propagador' || cam === 'semilla_hidro') &&
      !(inst.propagador && inst.propagador.id) &&
      cam === 'semilla_propagador'
    ) {
      showToast('Recomendado: registra un propagador/domo en Espacio y equipamiento', true);
    }
  }
  if (setupPagina < ultimoPaso) {
    setupPagina =
      typeof setupFlowAdvancePage === 'function' ? setupFlowAdvancePage(1) : setupPagina + 1;
    renderSetupPage();
  } else {
    try {
      if (typeof syncSetupDataFromPremium === 'function') syncSetupDataFromPremium();
      if (typeof persistConsejosModoSetupToPremium === 'function') persistConsejosModoSetupToPremium();
      if (typeof window.syncSalaMedidasDesdeEquipamientoInstalado === 'function') {
        window.syncSalaMedidasDesdeEquipamientoInstalado();
      }
    } catch (_) {}
    const ok = guardarSetupYContinuar();
    if (ok !== true) {
      if (typeof hcScrollSetupWizardAlFalloGuardado === 'function') hcScrollSetupWizardAlFalloGuardado();
      if (typeof showToast === 'function' && !window._hcSetupSaveToastShown) {
        showToast(
          'No se pudo guardar. Revisa geometría (paso Hidro), sala (Espacio) o depósito.',
          true,
          { zIndex: 10550, prominent: true, durationMs: 6200 }
        );
      }
      try {
        window._hcSetupSaveToastShown = false;
      } catch (_) {}
    }
  }
}

function setupBack() {
  if (setupPagina > SETUP_PAGE_GEOMETRY) {
    setupPagina =
      typeof setupFlowAdvancePage === 'function' ? setupFlowAdvancePage(-1) : setupPagina - 1;
    renderSetupPage();
  } else if (setupPagina === SETUP_PAGE_GEOMETRY) {
    setupPagina = SETUP_PAGE_PREMIUM_END;
    renderSetupPage();
  } else if (setupPagina > SETUP_PAGE_PREMIUM_START && setupPagina <= SETUP_PAGE_PREMIUM_END) {
    setupPagina =
      typeof setupFlowAdvancePage === 'function' ? setupFlowAdvancePage(-1) : setupPagina - 1;
    renderSetupPage();
  }
}

/** Contenedor de vista previa DWC/RDWC en el asistente. */
function getSetupPreviewElement() {
  if (typeof setupTipoInstalacion !== 'undefined' && setupTipoInstalacion === 'dwc') {
    return document.getElementById('setupDwcPreview') || document.getElementById('torrePreview');
  }
  if (typeof setupTipoInstalacion !== 'undefined' && setupTipoInstalacion === 'rdwc') {
    return document.getElementById('setupRdwcPreview') || document.getElementById('torrePreview');
  }
  return document.getElementById('torrePreview');
}

/** Preview multivalvula: N cubos, 1 maceta/cubo (no rejilla filas×cestas en un solo depósito). */
function renderDwcMulticuboSetupPreview(previewEl, numCubos, volLitros, formaDep) {
  previewEl.innerHTML = '';
  previewEl.style.position = 'relative';
  previewEl.style.height = 'auto';
  const n = Math.min(8, Math.max(1, parseInt(String(numCubos), 10) || 1));
  const forma =
    typeof dwcNormalizeDepositoForma === 'function'
      ? dwcNormalizeDepositoForma(formaDep)
      : String(formaDep || 'prismatico');
  const esCyl = forma === 'cilindrico';
  const wrap = document.createElement('div');
  wrap.className =
    'dwc-setup-mc-wrap dwc-setup-mc-wrap--rdwc dwc-setup-mc-wrap--' + (esCyl ? 'cilindrico' : 'prismatico');
  wrap.setAttribute('role', 'img');
  wrap.setAttribute(
    'aria-label',
    n +
      ' cubos estilo RDWC con multiválvula (solo aire a difusoras), una maceta por cubo.'
  );
  const grid =
    typeof hcDistribuirCubosMultivalvula === 'function'
      ? hcDistribuirCubosMultivalvula(n)
      : typeof hcDistribuirFilasColumnas === 'function'
        ? (() => {
            const g = hcDistribuirFilasColumnas(n, 6);
            return { rows: g.rows, cols: g.cols, colsPerRow: [g.cols] };
          })()
        : { cols: n <= 6 ? n : Math.ceil(n / 2), rows: n <= 6 ? 1 : 2, colsPerRow: [Math.ceil(n / 2), Math.floor(n / 2)] };
  if (grid.rows > 1) wrap.classList.add('dwc-setup-mc-wrap--stacked');
  function appendMcCube(parent, idx) {
    const cube = document.createElement('div');
    cube.className = 'dwc-setup-mc-cube dwc-setup-mc-cube--' + (esCyl ? 'cilindrico' : 'prismatico');
    const lid = document.createElement('div');
    lid.className = 'dwc-setup-mc-lid';
    const hole = document.createElement('div');
    hole.className = 'dwc-setup-mc-hole';
    lid.appendChild(hole);
    cube.appendChild(lid);
    const tank = document.createElement('div');
    tank.className = 'dwc-setup-mc-tank';
    tank.title = 'Cubo ' + (idx + 1) + ' · ' + volLitros + ' L útiles';
    cube.appendChild(tank);
    parent.appendChild(cube);
  }
  function makeMcRow(colsInRow) {
    const row = document.createElement('div');
    row.className = 'dwc-setup-mc-grid';
    row.style.gridTemplateColumns = 'repeat(' + colsInRow + ', minmax(0, 1fr))';
    return row;
  }
  if (grid.rows > 1) {
    const rowEls = [];
    for (let r = 0; r < grid.rows; r++) {
      const colsInRow = grid.colsPerRow ? grid.colsPerRow[r] : Math.ceil(n / grid.rows);
      rowEls.push(makeMcRow(colsInRow));
    }
    const airRow = document.createElement('div');
    airRow.className = 'dwc-setup-mc-air-row';
    airRow.setAttribute('aria-hidden', 'true');
    const pump = document.createElement('div');
    pump.className = 'dwc-setup-mc-air-pump';
    pump.title = 'Bomba + multiválvula · manguera a cada difusora';
    airRow.appendChild(pump);
    if (grid.grid && grid.grid.length) {
      for (let r = 0; r < grid.rows; r++) {
        const cells = grid.grid.filter((g) => g.row === r).sort((a, b) => a.col - b.col);
        for (let c = 0; c < cells.length; c++) {
          appendMcCube(rowEls[r], cells[c].idx);
        }
      }
    } else {
      for (let i = 0; i < n; i++) {
        const slot =
          typeof hcMultivalvulaSlotDesdeIdx === 'function'
            ? hcMultivalvulaSlotDesdeIdx(i, grid)
            : { row: i < (grid.colsPerRow[0] || grid.cols) ? 0 : 1 };
        appendMcCube(rowEls[slot.row], i);
      }
    }
    for (let r = 0; r < rowEls.length; r++) {
      wrap.appendChild(rowEls[r]);
    }
    wrap.appendChild(airRow);
  } else {
    const row = makeMcRow(grid.cols || n);
    for (let i = 0; i < n; i++) appendMcCube(row, i);
    wrap.appendChild(row);
    const airRow = document.createElement('div');
    airRow.className = 'dwc-setup-mc-air-row';
    airRow.setAttribute('aria-hidden', 'true');
    const pump = document.createElement('div');
    pump.className = 'dwc-setup-mc-air-pump';
    pump.title = 'Bomba + multiválvula · manguera a cada difusora';
    airRow.appendChild(pump);
    wrap.appendChild(airRow);
  }
  const cap = document.createElement('div');
  cap.className = 'dwc-setup-lid-caption';
  cap.textContent =
    n + ' cubo' + (n === 1 ? '' : 's') + ' (aspecto RDWC) · 1 maceta/cubo · multiválvula (solo aire)';
  wrap.appendChild(cap);
  previewEl.appendChild(wrap);
}

/** Preview asistente paso 1 — DWC: tapa vista superior con orificios en rejilla. */
function hcRenderSetupPreviewPlaceholder(previewEl, msg) {
  if (!previewEl) return;
  previewEl.classList.add('torre-preview--dwc');
  previewEl.innerHTML =
    '<p class="setup-dwc-preview-fallback setup-dwc-preview-empty" role="status">' +
    (msg ||
      'Indica filas × cestas y las medidas del depósito para ver la vista previa. Cada instalación nueva parte en blanco.') +
    '</p>';
}

function hcSetupPreviewSinDimensiones() {
  if (typeof hcSetupAsistenteInstalacionNueva !== 'function' || !hcSetupAsistenteInstalacionNueva()) {
    return false;
  }
  const mc =
    typeof dwcEsSetupMultivalvula === 'function'
      ? dwcEsSetupMultivalvula()
      : typeof dwcNormalizeOxigenacionDiseno === 'function' &&
        dwcNormalizeOxigenacionDiseno(document.getElementById('setupDwcOxigenacionDiseno')?.value) ===
          'cubos_independientes';
  if (mc) {
    const nRaw = parseInt(String(document.getElementById('setupDwcNumCubos')?.value || '').trim(), 10);
    return !Number.isFinite(nRaw) || nRaw < 1;
  }
  const f = parseInt(String(document.getElementById('sliderNiveles')?.value || '0'), 10);
  const c = parseInt(String(document.getElementById('sliderCestas')?.value || '0'), 10);
  return !Number.isFinite(f) || f < 1 || !Number.isFinite(c) || c < 1;
}

/** Vista previa DWC en asistente: diagrama ilustrado (cenital + alzado), coherente con pestaña Sistema. */
function renderDwcIlloSetupPreview(previewEl, filas, cols, volLitros, draftExtra) {
  if (typeof generarSVGDwc !== 'function' && typeof hcIlloGenerarSVGDwc !== 'function') {
    renderDwcLidSetupPreview(previewEl, filas, cols, volLitros);
    return;
  }
  previewEl.innerHTML = '';
  previewEl.style.position = 'relative';
  previewEl.style.height = 'auto';
  const prevCfg = state.configTorre;
  const prevTorre = state.torre;
  let draft = draftExtra || {};
  if (!draftExtra && typeof buildDwcDraftCfgFromSetupWizardInputs === 'function') {
    try {
      draft = buildDwcDraftCfgFromSetupWizardInputs() || {};
    } catch (_) {}
  }
  draft = Object.assign({ tipoInstalacion: 'dwc' }, draft);
  draft.numNiveles = Math.max(1, filas);
  draft.numCestas = Math.max(1, cols);
  if (typeof buildSetupEquipamientoMerged === 'function') {
    draft = buildSetupEquipamientoMerged(draft);
  } else if (typeof setupEquipamiento !== 'undefined' && setupEquipamiento) {
    draft.equipamiento = [...setupEquipamiento];
  }
  if (volLitros != null && Number(volLitros) > 0) {
    draft.volDeposito = volLitros;
  }
  const emptyCell = () => ({
    variedad: '',
    fecha: '',
    notas: '',
    origenPlanta: '',
    fotos: [],
    fotoKeys: [],
  });
  const torrePreview = [];
  for (let n = 0; n < draft.numNiveles; n++) {
    const row = [];
    for (let c = 0; c < draft.numCestas; c++) row.push(emptyCell());
    torrePreview.push(row);
  }
  state.configTorre = draft;
  state.torre = torrePreview;
  try {
    const renderFn =
      typeof hcIlloGenerarSVGDwc === 'function'
        ? function () {
            return hcIlloGenerarSVGDwc(draft);
          }
        : function () {
            return generarSVGDwc();
          };
    previewEl.innerHTML = renderFn();
    previewEl.classList.add('torre-preview--dwc', 'hc-illo-diagram');
    try {
      if (typeof markSetupDiagramCrisp === 'function') markSetupDiagramCrisp(previewEl);
      if (typeof renderSetupDiagramEquipLegend === 'function') renderSetupDiagramEquipLegend(previewEl);
      if (typeof bindDwcScadaCestaHover === 'function') bindDwcScadaCestaHover(previewEl);
    } catch (_) {}
  } catch (err) {
    renderDwcLidSetupPreview(previewEl, filas, cols, volLitros);
    try {
      console.error('renderDwcIlloSetupPreview', err);
    } catch (_) {}
  } finally {
    state.configTorre = prevCfg;
    state.torre = prevTorre;
  }
}

function renderDwcLidSetupPreview(previewEl, filas, cols, volLitros) {
  previewEl.innerHTML = '';
  previewEl.style.position = 'relative';
  previewEl.style.height = 'auto';
  const wrap = document.createElement('div');
  wrap.className = 'dwc-setup-lid-wrap';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute(
    'aria-label',
    'Vista superior de la tapa del cubo DWC: ' +
      filas +
      ' filas de orificios y ' +
      cols +
      ' cestas por fila.'
  );
  const side = Math.min(132, Math.max(84, Math.round(10.5 * Math.max(filas, cols, 4))));
  const plate = document.createElement('div');
  plate.className = 'dwc-setup-lid-plate';
  plate.style.width = side + 'px';
  plate.style.height = side + 'px';
  plate.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
  plate.style.gridTemplateRows = 'repeat(' + filas + ', 1fr)';
  for (let i = 0; i < filas * cols; i++) {
    const hole = document.createElement('div');
    hole.className = 'dwc-setup-lid-hole';
    plate.appendChild(hole);
  }
  const cap = document.createElement('div');
  cap.className = 'dwc-setup-lid-caption';
  cap.textContent = filas + ' filas × ' + cols + ' cestas · tapa';
  const tank = document.createElement('div');
  tank.className = 'dwc-setup-lid-tank';
  tank.title =
    volLitros != null && Number(volLitros) > 0
      ? 'Depósito · ~' + volLitros + ' L de solución'
      : 'Depósito · litros pendientes';
  tank.style.width = Math.min(side + 8, 112) + 'px';
  wrap.appendChild(plate);
  wrap.appendChild(cap);
  wrap.appendChild(tank);
  previewEl.appendChild(wrap);
}

/** Vista previa DWC del asistente (depósito unido o multiválvula); no usa el preview de torre vertical. */
function refreshDwcSetupPreview() {
  if (typeof setupTipoInstalacion === 'undefined' || setupTipoInstalacion !== 'dwc') return;
  const preview =
    (typeof getSetupPreviewElement === 'function' ? getSetupPreviewElement() : null) ||
    document.getElementById('setupDwcPreview');
  if (!preview) return;

  const mc =
    typeof dwcEsSetupMultivalvula === 'function'
      ? dwcEsSetupMultivalvula()
      : typeof dwcNormalizeOxigenacionDiseno === 'function' &&
        dwcNormalizeOxigenacionDiseno(document.getElementById('setupDwcOxigenacionDiseno')?.value) ===
          'cubos_independientes';

  const esNueva =
    typeof hcSetupAsistenteInstalacionNueva === 'function' && hcSetupAsistenteInstalacionNueva();
  let filas = esNueva ? 0 : 2;
  let cols = esNueva ? 0 : 3;
  if (mc) {
    const formaMc =
      typeof dwcNormalizeDepositoForma === 'function'
        ? dwcNormalizeDepositoForma(document.getElementById('setupDwcDepositoForma')?.value)
        : 'prismatico';
    const defNc = esNueva ? 0 : formaMc === 'cilindrico' ? 1 : 4;
    const nRaw = parseInt(String(document.getElementById('setupDwcNumCubos')?.value || '').trim(), 10);
    cols =
      Number.isFinite(nRaw) && nRaw >= 1
        ? Math.min(8, nRaw)
        : defNc > 0
          ? defNc
          : 0;
    filas = cols > 0 ? 1 : 0;
  } else {
    const fRaw = parseInt(String(document.getElementById('sliderNiveles')?.value || (esNueva ? 0 : 2)), 10);
    const cRaw = parseInt(String(document.getElementById('sliderCestas')?.value || (esNueva ? 0 : 3)), 10);
    filas = esNueva
      ? Math.max(0, Math.min(10, Number.isFinite(fRaw) ? fRaw : 0))
      : Math.max(1, Math.min(10, Number.isFinite(fRaw) ? fRaw : 2));
    cols = esNueva
      ? Math.max(0, Math.min(8, Number.isFinite(cRaw) ? cRaw : 0))
      : Math.max(1, Math.min(8, Number.isFinite(cRaw) ? cRaw : 3));
    const vn = document.getElementById('valNiveles');
    const vc = document.getElementById('valCestas');
    if (vn) vn.textContent = String(filas);
    if (vc) vc.textContent = String(cols);
  }

  if (hcSetupPreviewSinDimensiones()) {
    hcRenderSetupPreviewPlaceholder(preview);
    return;
  }

  let vol = esNueva ? 0 : parseInt(String(document.getElementById('sliderVol')?.value || 20), 10) || 20;
  try {
    const draftVol =
      typeof buildDwcDraftCfgFromSetupWizardInputs === 'function'
        ? buildDwcDraftCfgFromSetupWizardInputs()
        : null;
    const vMez =
      draftVol && typeof getVolumenMezclaLitros === 'function' ? getVolumenMezclaLitros(draftVol) : null;
    if (vMez != null && vMez > 0) vol = Math.round(vMez * 10) / 10;
    else vol = 0;
  } catch (_) {}

  preview.classList.add('torre-preview--dwc');
  preview.classList.remove('torre-preview--srf');
  try {
    if (mc) {
      let volMc = vol;
      try {
        const draftMc =
          typeof buildDwcDraftCfgFromSetupWizardInputs === 'function'
            ? buildDwcDraftCfgFromSetupWizardInputs()
            : null;
        const vMc =
          draftMc && typeof dwcLitrosUtilesPorCuboMultivalvula === 'function'
            ? dwcLitrosUtilesPorCuboMultivalvula(draftMc)
            : null;
        if (vMc != null && vMc > 0) volMc = Math.round(vMc * 10) / 10;
      } catch (_) {}
      let draftMc = null;
      try {
        draftMc =
          typeof buildDwcDraftCfgFromSetupWizardInputs === 'function'
            ? buildDwcDraftCfgFromSetupWizardInputs()
            : null;
      } catch (_) {}
      if (typeof hcIlloGenerarSVGDwc === 'function' && draftMc) {
        draftMc.numNiveles = 1;
        draftMc.numCestas = cols;
        renderDwcIlloSetupPreview(preview, 1, cols, volMc, draftMc);
      } else {
        renderDwcMulticuboSetupPreview(
          preview,
          cols,
          volMc,
          document.getElementById('setupDwcDepositoForma')?.value
        );
      }
    } else {
      renderDwcIlloSetupPreview(preview, filas, cols, vol);
    }
  } catch (err) {
    preview.innerHTML =
      '<p class="setup-dwc-preview-fallback" role="status">No se pudo dibujar la vista previa. Prueba Ctrl+F5 o revisa la consola del navegador.</p>';
    try {
      console.error('refreshDwcSetupPreview', err);
    } catch (_) {}
  }
}

/** Vista previa RDWC en el asistente (diagrama SVG). */
function refreshRdwcSetupPreview() {
  if (typeof setupTipoInstalacion === 'undefined' || setupTipoInstalacion !== 'rdwc') return;
  const preview = document.getElementById('setupRdwcPreview');
  if (!preview) return;
  try {
    const sitesRaw = parseInt(String(document.getElementById('setupRdwcSites')?.value || '').trim(), 10);
    const rowsRaw = parseInt(String(document.getElementById('setupRdwcRows')?.value || '').trim(), 10);
    if (
      (typeof hcSetupAsistenteInstalacionNueva === 'function' && hcSetupAsistenteInstalacionNueva()) &&
      (!Number.isFinite(sitesRaw) || sitesRaw < 2 || !Number.isFinite(rowsRaw) || rowsRaw < 1)
    ) {
      preview.innerHTML =
        '<p class="setup-dwc-preview-fallback setup-dwc-preview-empty" role="status">Indica sitios, filas y medidas de los cubos para ver el diagrama RDWC.</p>';
      preview.classList.remove('torre-preview--rdwc');
      return;
    }
    let draft = {};
    if (typeof applySetupRdwcDesdeFormulario === 'function') {
      draft = applySetupRdwcDesdeFormulario() || {};
    } else if (typeof setupRdwcDraft === 'object' && setupRdwcDraft) {
      draft = setupRdwcDraft;
    }
    if (typeof rdwcEnsureConfigDefaults === 'function') rdwcEnsureConfigDefaults(draft);
    if (typeof buildSetupEquipamientoMerged === 'function') {
      draft = buildSetupEquipamientoMerged(draft);
    }
    const sites = Math.max(2, Math.round(Number(draft.rdwcSites) || 4));
    const rows = Math.max(1, Math.min(4, Math.round(Number(draft.rdwcRows) || 1)));
    const dist =
      typeof rdwcPlanDistribuir === 'function' ? rdwcPlanDistribuir(sites, rows) : { rows: rows, cols: Math.ceil(sites / rows), grid: [] };
    draft.numNiveles = dist.rows;
    draft.numCestas = dist.cols;
    const prevCfg = state.configTorre;
    const prevTorre = state.torre;
    state.configTorre = Object.assign({}, draft, { tipoInstalacion: 'rdwc' });
    const emptyCell = () => ({
      variedad: '',
      fecha: '',
      notas: '',
      origenPlanta: '',
      fotos: [],
      fotoKeys: [],
    });
    const torrePreview = [];
    for (let r = 0; r < dist.rows; r++) {
      const row = [];
      for (let c = 0; c < dist.cols; c++) row.push(emptyCell());
      torrePreview.push(row);
    }
    for (let gi = 0; gi < dist.grid.length; gi++) {
      const g = dist.grid[gi];
      if (torrePreview[g.row] && g.col < dist.cols) {
        torrePreview[g.row][g.col] = emptyCell();
      }
    }
    state.torre = torrePreview;
    if (typeof generarSVGRdwc === 'function') {
      preview.innerHTML = generarSVGRdwc();
      preview.classList.add('torre-preview--rdwc');
      try {
        if (typeof markSetupDiagramCrisp === 'function') markSetupDiagramCrisp(preview);
        if (typeof renderSetupDiagramEquipLegend === 'function') renderSetupDiagramEquipLegend(preview);
        if (typeof disposeDwcScadaViewport === 'function') disposeDwcScadaViewport(preview);
        if (typeof bindDwcScadaCestaHover === 'function') bindDwcScadaCestaHover(preview);
      } catch (_) {}
    }
    state.configTorre = prevCfg;
    state.torre = prevTorre;
  } catch (err) {
    preview.innerHTML =
      '<p class="setup-dwc-preview-fallback" role="status">No se pudo dibujar la vista previa RDWC.</p>';
    try {
      console.error('refreshRdwcSetupPreview', err);
    } catch (_) {}
  }
}

function updateTorreBuilder() {
  if (setupTipoInstalacion === 'rdwc') {
    try {
      if (typeof onSetupRdwcInput === 'function') onSetupRdwcInput();
    } catch (_) {}
    return;
  }
  if (setupTipoInstalacion !== 'dwc') setupTipoInstalacion = 'dwc';
  const esNuevaBuilder =
    typeof hcSetupAsistenteInstalacionNueva === 'function' && hcSetupAsistenteInstalacionNueva();
  const defSlider = esNuevaBuilder ? 0 : 5;
  const niveles = parseInt(document.getElementById('sliderNiveles')?.value || defSlider, 10);
  const cestas = parseInt(document.getElementById('sliderCestas')?.value || defSlider, 10);
  let dwcNivPrev = niveles;
  let dwcCesPrev = cestas;
  if (setupTipoInstalacion === 'dwc') {
    const oxB =
      typeof dwcEsSetupMultivalvula === 'function'
        ? dwcEsSetupMultivalvula()
        : typeof dwcNormalizeOxigenacionDiseno === 'function' &&
          dwcNormalizeOxigenacionDiseno(document.getElementById('setupDwcOxigenacionDiseno')?.value) ===
            'cubos_independientes';
    if (oxB) {
      const formaMc =
        typeof dwcNormalizeDepositoForma === 'function'
          ? dwcNormalizeDepositoForma(document.getElementById('setupDwcDepositoForma')?.value)
          : 'prismatico';
      const nRaw = parseInt(String(document.getElementById('setupDwcNumCubos')?.value || '').trim(), 10);
      const defNc = esNuevaBuilder ? 0 : formaMc === 'cilindrico' ? 1 : 4;
      const nn =
        Number.isFinite(nRaw) && nRaw >= 1
          ? Math.min(8, nRaw)
          : defNc > 0
            ? defNc
            : 0;
      dwcNivPrev = nn > 0 ? 1 : 0;
      dwcCesPrev = nn;
    }
  }
  const volSlider = parseInt(document.getElementById('sliderVol')?.value || (esNuevaBuilder ? 0 : 20), 10);
  const dwcCap = getDwcCapacidadLitrosFromSetupInputs();
  const volDepDwc =
    dwcCap != null && dwcCap > 0 ? Math.round(dwcCap * 10) / 10 : volSlider;

  const elVN = document.getElementById('valNiveles');
  const elVC = document.getElementById('valCestas');
  if (elVN) elVN.textContent = String(dwcNivPrev);
  if (elVC) elVC.textContent = String(dwcCesPrev);
  const snTorre = document.getElementById('sliderNiveles');
  const scTorre = document.getElementById('sliderCestas');
  if (snTorre) snTorre.setAttribute('aria-valuenow', String(dwcNivPrev));
  if (scTorre) scTorre.setAttribute('aria-valuenow', String(dwcCesPrev));
  const elVol = document.getElementById('valVol');
  if (elVol) {
    if (setupTipoInstalacion === 'dwc' && dwcCap != null && dwcCap > 0) {
      let safeHtml = '';
      try {
        const draft = typeof buildDwcDraftCfgFromSetupWizardInputs === 'function' ? buildDwcDraftCfgFromSetupWizardInputs() : null;
        const vSeg =
          draft && typeof getDwcVolumenSeguroMaxLitrosDesdeConfig === 'function'
            ? getDwcVolumenSeguroMaxLitrosDesdeConfig(draft)
            : null;
        if (vSeg != null && vSeg > 0 && Math.abs(vSeg - volDepDwc) > 0.15) {
          safeHtml =
            '<span class="setup-inline-approx"> · op. ~' + Math.round(vSeg * 10) / 10 + ' L</span>';
        }
      } catch (_) {}
      elVol.innerHTML =
        volDepDwc + '<span class="setup-inline-unit-l">L</span>' + safeHtml;
    } else if (setupTipoInstalacion === 'dwc') {
      elVol.innerHTML =
        volSlider +
        '<span class="setup-inline-unit-l">L</span>' +
        '<span class="setup-inline-approx"> (aprox.)</span>';
    } else {
      elVol.textContent = volSlider;
    }
  }

  const preview = getSetupPreviewElement();
  if (!preview) return;

  if (setupTipoInstalacion === 'dwc') {
    try {
      if (typeof refreshDwcSetupPreview === 'function') refreshDwcSetupPreview();
    } catch (eDwcPrev) {
      try {
        console.error('updateTorreBuilder dwc preview', eDwcPrev);
      } catch (_) {}
    }
    try {
      refreshDwcTapHintSetup();
    } catch (eHint) {}
    return;
  }

}

function toggleUbic(tipo) {
  setupUbicacion = tipo;
  setupData.ubicacion = tipo;
}

function toggleEquip(id) {
  if (setupEquipamiento.has(id)) {
    setupEquipamiento.delete(id);
  } else {
    setupEquipamiento.add(id);
  }
  refreshSetupEquipamientoCardsDesdeSet();
  refreshSetupCalentadorConsignaVis();
  try {
    if (typeof refreshDwcSetupPreview === 'function') refreshDwcSetupPreview();
    if (typeof refreshRdwcSetupPreview === 'function') refreshRdwcSetupPreview();
  } catch (_) {}
}

function getSetupEquipCardIds() {
  return {
    difusor: 'eqDifusor',
    calentador: 'eqCalentador',
    bomba: 'eqBomba',
    timer: 'eqTimer',
    medidorEC: 'eqMedidorEC',
    toldo: 'eqToldo',
    co2: 'eqCo2',
    filtroCarbon: 'eqFiltroCarbon',
    circulacion: ['eqCirculacion', 'eqCirculacionExt'],
    tijeras: 'eqTijeras',
    lupa: 'eqLupa',
  };
}

function refreshSetupEquipEntornoVis() {
  const esExt =
    (typeof ensurePremiumSetup === 'function' && ensurePremiumSetup().entorno === 'exterior') ||
    (typeof setupData !== 'undefined' && setupData.ubicacion === 'exterior') ||
    (typeof setupUbicacion !== 'undefined' && setupUbicacion === 'exterior');
  const intSec = document.getElementById('setupEquipSectionInterior');
  const extSec = document.getElementById('setupEquipSectionExterior');
  if (intSec) intSec.classList.toggle('setup-hidden', esExt);
  if (extSec) extSec.classList.toggle('setup-hidden', !esExt);
  refreshSetupEquipamientoCardsDesdeSet();
}

function setupEquipQuickPick(preset) {
  const hydro = ['difusor', 'calentador', 'bomba', 'medidorEC'];
  const interior = hydro.concat(['timer', 'filtroCarbon', 'circulacion', 'tijeras', 'lupa']);
  const exterior = hydro.concat(['toldo', 'circulacion', 'tijeras', 'lupa']);
  let ids = hydro;
  if (preset === 'interior') ids = interior;
  else if (preset === 'exterior') ids = exterior;
  setupEquipamiento = new Set(ids);
  refreshSetupEquipamientoCardsDesdeSet();
  refreshSetupCalentadorConsignaVis();
  try {
    if (typeof refreshDwcSetupPreview === 'function') refreshDwcSetupPreview();
    if (typeof refreshRdwcSetupPreview === 'function') refreshRdwcSetupPreview();
  } catch (_) {}
}

const SETUP_EQUIP_IDS = [
  'difusor', 'calentador', 'bomba', 'timer', 'medidorEC', 'toldo', 'co2',
  'filtroCarbon', 'circulacion', 'tijeras', 'lupa',
];

function refreshSetupEquipamientoCardsDesdeSet() {
  const cardIds = getSetupEquipCardIds();
  for (let j = 0; j < SETUP_EQUIP_IDS.length; j++) {
    const eid = SETUP_EQUIP_IDS[j];
    const mapped = cardIds[eid];
    const ids = Array.isArray(mapped) ? mapped : [mapped || ('eq' + eid.charAt(0).toUpperCase() + eid.slice(1))];
    const selected = setupEquipamiento.has(eid);
    for (let k = 0; k < ids.length; k++) {
      const card = document.getElementById(ids[k]);
      if (card) card.className = 'equip-card equip-card--pick' + (selected ? ' selected' : '');
    }
  }
}

function refreshSetupCalentadorConsignaVis() {
  const wrap = document.getElementById('setupCalentadorConsignaWrap');
  if (!wrap) return;
  wrap.classList.toggle('setup-hidden', !setupEquipamiento.has('calentador'));
}

function syncSetupEquipamientoDesdeConfig(cfg) {
  const c = cfg || {};
  setupEquipamiento = new Set();
  const eqSaved = Array.isArray(c.equipamiento) ? c.equipamiento : [];
  for (let i = 0; i < SETUP_EQUIP_IDS.length; i++) {
    if (eqSaved.includes(SETUP_EQUIP_IDS[i])) setupEquipamiento.add(SETUP_EQUIP_IDS[i]);
  }
  if (setupEquipamiento.size === 0) {
    setupEquipamiento = new Set(['difusor']);
  }
  if (typeof refreshSetupEquipEntornoVis === 'function') refreshSetupEquipEntornoVis();
  refreshSetupEquipamientoCardsDesdeSet();
  const ccInp = document.getElementById('setupCalentadorConsignaC');
  if (ccInp) {
    const v = Number(c.calentadorConsignaC);
    ccInp.value =
      Number.isFinite(v) && v >= 10 && v <= 35 ? String(Math.round(v * 10) / 10) : '20';
  }
  refreshSetupCalentadorConsignaVis();
}

function ensureSetupSensoresHardware() {
  if (!setupData.sensoresHardware) {
    setupData.sensoresHardware = { ec: false, ph: false, humedad: false };
  }
  return setupData.sensoresHardware;
}

function cargarSetupSensoresHwUI() {
  const s = ensureSetupSensoresHardware();
  const e = document.getElementById('setupSensHwEC');
  const p = document.getElementById('setupSensHwPH');
  const h = document.getElementById('setupSensHwHum');
  if (e) e.checked = !!s.ec;
  if (p) p.checked = !!s.ph;
  if (h) h.checked = !!s.humedad;
}

function persistSetupSensoresHardware() {
  const s = ensureSetupSensoresHardware();
  s.ec = !!document.getElementById('setupSensHwEC')?.checked;
  s.ph = !!document.getElementById('setupSensHwPH')?.checked;
  s.humedad = !!document.getElementById('setupSensHwHum')?.checked;
}

let _nutrientesMostrarCatalogoCompleto = false;
try { window._nutrientesMostrarCatalogoCompleto = false; } catch (_) {}

function toggleNutrientesCatalogoCompleto() {
  _nutrientesMostrarCatalogoCompleto = !_nutrientesMostrarCatalogoCompleto;
  try { window._nutrientesMostrarCatalogoCompleto = _nutrientesMostrarCatalogoCompleto; } catch (_) {}
  renderNutrientesGrid();
}

function renderNutrienteCardHtml(n) {
  const parNote = n.par_flores && typeof getNutrienteById === 'function'
    ? getNutrienteById(n.par_flores)
    : null;
  const rankBadge = n.top_es && n.rank_es
    ? '<span class="nutriente-top-badge">#' + n.rank_es + ' ES</span>'
    : '';
  const parLine = parNote
    ? '<span class="nutriente-par-flores">+ flor: ' + parNote.nombre + '</span>'
    : '';
  const iconHtml = typeof hcVisualIconSvg === 'function'
    ? '<span class="nutriente-icon" aria-hidden="true">' + hcVisualIconSvg('nutriente') + '</span>'
    : '';
  return (
    '<button type="button" class="nutriente-card ' + (n.id === setupNutriente ? 'selected' : '') + '"' +
    ' id="nut-' + n.id + '" onclick="selNutriente(\'' + n.id + '\')" aria-pressed="' +
    (n.id === setupNutriente ? 'true' : 'false') + '"' +
    ' aria-label="Nutriente ' + n.nombre + (n.buffer ? ', con buffer de pH' : '') + '">' +
    rankBadge +
    iconHtml +
    '<span class="nutriente-bandera" aria-hidden="true">' + n.bandera + '</span>' +
    '<span class="nutriente-info">' +
    '<span class="nutriente-nombre">' + n.nombre + '</span>' +
    '<span class="nutriente-detalle">' + n.detalle + '</span>' +
    parLine +
    '</span>' +
    '<span class="nutriente-buffer ' + (n.buffer ? 'si' : 'no') + '" aria-hidden="true">' +
    (n.buffer ? 'pH buffer' : 'Sin buffer') +
    '</span></button>'
  );
}

function renderNutrientesGrid() {
  const grid = document.getElementById('nutrientesGrid');
  if (!grid) return;
  if (typeof window !== 'undefined' && window._nutrientesMostrarCatalogoCompleto != null) {
    _nutrientesMostrarCatalogoCompleto = !!window._nutrientesMostrarCatalogoCompleto;
  }
  const toggleBtn = document.getElementById('nutrientesToggleCatalogo');
  let list;
  if (_nutrientesMostrarCatalogoCompleto) {
    list = NUTRIENTES_DB.filter(function (n) {
      return n.faseUso !== 'bloom' || !NUTRIENTES_TOP10_ES.some(function (id) {
        const top = NUTRIENTES_DB.find(function (t) { return t.id === id; });
        return top && top.par_flores === n.id;
      });
    });
    if (toggleBtn) toggleBtn.textContent = 'Ver top 10 España';
  } else {
    list = typeof getNutrientesTop10ES === 'function'
      ? getNutrientesTop10ES()
      : NUTRIENTES_DB.filter(function (n) { return n.top_es; });
    if (toggleBtn) toggleBtn.textContent = 'Ver catálogo completo';
  }
  grid.innerHTML = list.map(renderNutrienteCardHtml).join('');
}

