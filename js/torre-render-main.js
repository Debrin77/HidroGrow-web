/**
 * renderTorre, gestos swipe, bind cestas, compatibilidad grid, updateTorreStats, depósito.
 * Tras torre-render-build.js.
 */
function renderTorre() {
  const cfg = state.configTorre || {};
  try {
    if (typeof hcSyncTorreDesdeGerminacionSiAplica === 'function') {
      hcSyncTorreDesdeGerminacionSiAplica(cfg);
    }
  } catch (_) {}
  const bloquearEsquemaPorFase =
    typeof hcRenderTorreBloqueadoPorFaseCamino === 'function' &&
    hcRenderTorreBloqueadoPorFaseCamino(cfg);
  try {
    if (typeof hcRefreshSistemaFasePanel === 'function') hcRefreshSistemaFasePanel();
  } catch (_) {}
  if (bloquearEsquemaPorFase) {
    try {
      if (
        typeof getSistemaFaseCamino === 'function' &&
        getSistemaFaseCamino(cfg) === 'propagador' &&
        typeof hcRenderPropagadorSvg === 'function'
      ) {
        hcRenderPropagadorSvg(cfg);
      }
    } catch (_) {}
    try {
      if (typeof renderTorreInstalacionPicker === 'function') renderTorreInstalacionPicker();
    } catch (_) {}
    try {
      if (typeof refreshPlantasInstalacionResumen === 'function') refreshPlantasInstalacionResumen();
    } catch (_) {}
    return;
  }
  const tipo =
    typeof tipoInstalacionNormalizado === 'function' ? tipoInstalacionNormalizado(cfg) : 'dwc';
  const esRdwc = tipo === 'rdwc';
  const esDwc = tipo !== 'rdwc' && tipo !== '';

  const chk = document.getElementById('torreChkAnimSuaves');
  if (chk) chk.checked = state.configTorre?.torreAnimSvg !== false;

  const wrap = document.getElementById('torreSVGWrap');
  if (!wrap) return;

  if (typeof disposeNftThreeIfAny === 'function') {
    try {
      disposeNftThreeIfAny(wrap);
    } catch (_) {}
  }
  if (typeof disposeDwcScadaViewport === 'function') {
    try {
      disposeDwcScadaViewport(wrap);
    } catch (_) {}
  }

  if (esDwc) {
    try {
      wrap.innerHTML = typeof generarSVGDwc === 'function' ? generarSVGDwc() : '';
    } catch (eDwcSvg) {
      wrap.innerHTML =
        '<p class="torre-svg-fallback" role="status">No se pudo cargar el esquema DWC. Recarga la página (Ctrl+F5).</p>';
      try {
        console.error('generarSVGDwc', eDwcSvg);
      } catch (_) {}
    }
    if (!wrap.innerHTML || !String(wrap.innerHTML).trim()) {
      wrap.innerHTML =
        '<p class="torre-svg-fallback" role="status">Esquema DWC vacío: revisa filas/macetas o cubos en Cultivo e instalación.</p>';
    }
    const dwcMcAria =
      typeof dwcGetOxigenacionDiseno === 'function' &&
      dwcGetOxigenacionDiseno(state.configTorre) === 'cubos_independientes';
    wrap.setAttribute(
      'aria-label',
      dwcMcAria
        ? 'DWC multiválvula: vista cenital (arriba) y frontal (abajo). Toca una maceta para cultivo o usa Lista.'
        : 'DWC: tapa en vista superior con macetas y esquema frontal del depósito. Toca una maceta para la ficha o usa Lista.'
    );
    try {
      bindTorreCestas(wrap);
    } catch (e2) {}
  } else if (esRdwc) {
    try {
      wrap.innerHTML = typeof generarSVGRdwc === 'function' ? generarSVGRdwc() : '';
    } catch (eRdwcSvg) {
      wrap.innerHTML =
        '<p class="torre-svg-fallback" role="status">No se pudo cargar el esquema RDWC. Recarga la página (Ctrl+F5).</p>';
      try {
        console.error('generarSVGRdwc', eRdwcSvg);
      } catch (_) {}
    }
    if (!wrap.innerHTML || !String(wrap.innerHTML).trim()) {
      wrap.innerHTML =
        '<p class="torre-svg-fallback" role="status">Esquema RDWC vacío: revisa sitios y filas en Cultivo e instalación.</p>';
    }
    wrap.setAttribute(
      'aria-label',
      'RDWC: módulos con recirculación (verde impulsión, azul retorno) y depósito de control. Toca un módulo para su ficha o usa Lista.'
    );
    try {
      bindTorreCestas(wrap);
    } catch (e2) {}
    try {
      bindRdwcLoopHelp(wrap);
    } catch (e3) {}
    try {
      if (typeof disposeDwcScadaViewport === 'function') disposeDwcScadaViewport(wrap);
      if (typeof bindRdwcScadaViewport === 'function') bindRdwcScadaViewport(wrap);
    } catch (eRdwcVp) {
      try {
        console.error('bindRdwcScadaViewport', eRdwcVp);
      } catch (_) {}
    }
  }

  try {
    if (typeof disposeDwcScadaViewport === 'function') disposeDwcScadaViewport(wrap);
    if (typeof bindDwcScadaCestaHover === 'function') bindDwcScadaCestaHover(wrap);
  } catch (_) {}

  actualizarChromePanelEsquemaPorTipo();
  sincronizarTextosPanelInteraccionSistema();

  updateTorreStats();
  calcularRotacion();
  setTimeout(renderCompatGrid, 100);
  actualizarTorreEditarAyuda();

  if (state.configTorre?.torreVistaModo === 'lista') renderTorreLista();
  aplicarVistaTorreUI();
  if (typeof renderTorreSistemaResumenTabla === 'function') {
    try {
      renderTorreSistemaResumenTabla(cfg);
    } catch (eResumen) {
      try {
        console.error('renderTorreSistemaResumenTabla', eResumen);
      } catch (_) {}
    }
  }

  if (document.getElementById('tab-riego')?.classList.contains('active')) {
    actualizarVistaRiegoPorTipoInstalacion();
  }
  try {
    sincronizarSistemaNftMontajeUI();
  } catch (e) {}
  try {
    renderTorreMedirDiagram();
  } catch (_) {}
  try {
    if (typeof refreshPlantasInstalacionResumen === 'function') refreshPlantasInstalacionResumen();
  } catch (ePlantas) {
    try {
      console.error('refreshPlantasInstalacionResumen', ePlantas);
    } catch (_) {}
  }
  try {
    if (typeof hcRefreshSistemaCultivoExtras === 'function') hcRefreshSistemaCultivoExtras();
  } catch (_) {}
  try {
    if (typeof hcRefreshPuestaMarchaUi === 'function') hcRefreshPuestaMarchaUi();
  } catch (_) {}
}

/** Medir: esquema retirado — solo en Cultivo e instalación. */
function renderTorreMedirDiagram() {
  /* noop: #medirInstalacionEsquema eliminado */
}

function bindRdwcLoopHelp(wrap) {
  if (!wrap) return;
  const nodes = wrap.querySelectorAll('.rdwc-loop-help-hit');
  if (!nodes || !nodes.length) return;
  const msg =
    'RDWC — circuito: 1) La bomba de recirculación lleva solución desde el depósito de control (línea verde). ' +
    '2) Cada módulo recibe caudal y retorna por la línea azul. 3) Cierras el anillo en el depósito, donde mides y corriges EC/pH. ' +
    'Montaje (referencia habitual): sitúa la bomba de aire por encima del nivel máximo de líquido; lubrica junta y tubo en racores a presión y empuja con ligero giro; si separas cubos, deja al menos ~3 cm de tubo dentro del lateral; tras el primer llenado, repasa fugas.';
  const onHelp = () => {
    if (typeof showToast === 'function') showToast(msg);
  };
  nodes.forEach((el) => {
    el.style.cursor = 'help';
    el.onclick = onHelp;
    el.onkeydown = (ev) => {
      const k = ev && (ev.key || ev.code);
      if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
        ev.preventDefault();
        onHelp();
      }
    };
  });
}

function torreGetNumCestasParaRot() {
  const cfg = state.configTorre || {};
  return cfg.numCestas || window.NUM_CESTAS_ACTIVO || NUM_CESTAS || 5;
}
function torreSnapRotRad(r) {
  const k = (2 * Math.PI) / Math.max(3, torreGetNumCestasParaRot());
  return Math.round(r / k) * k;
}
function torreNormRotRad(r) {
  const t = 2 * Math.PI;
  let x = r % t;
  if (x < 0) x += t;
  return x;
}
function torrePintarCestasSolo(wrap) {
  if (!wrap || !torreSvgEsTorreVerticalGiratoria()) return;
  const cfg = state.configTorre || {};
  const numNiveles = cfg.numNiveles || window.NUM_NIVELES_ACTIVO || NUM_NIVELES;
  const rot = cfg._torreRotRad || 0;
  const isIllo = !!wrap.querySelector('.hc-illo-torre');
  if (isIllo && typeof hcIlloTorreNivelCestasHTML === 'function' && typeof hcIlloTorreLayout === 'function') {
    const L = hcIlloTorreLayout(cfg);
    const titleEl = wrap.querySelector('svg title');
    const illoU =
      (wrap.dataset && wrap.dataset.illoUid) ||
      (titleEl && titleEl.id ? titleEl.id.replace(/-title$/, '') : 'torre');
    for (let ni = 0; ni < numNiveles; ni++) {
      const g = wrap.querySelector('#hc-baskets-n-' + ni);
      if (g) g.innerHTML = hcIlloTorreNivelCestasHTML(ni, rot, illoU, cfg, L);
    }
    return;
  }
  for (let ni = 0; ni < numNiveles; ni++) {
    const g = wrap.querySelector('#hc-baskets-n-' + ni);
    if (g) g.innerHTML = generarSVGTorreCestasNivelHTML(ni, rot);
  }
}

// ── Gestos torre: swipe para rotar con snap ──────────────────────────────────
let _torreGestosInit = false;
function initTorreGestos(wrap) {
  if (_torreGestosInit) return;
  _torreGestosInit = true;

  let startX = 0;
  let startRot = 0;
  let dragging = false;
  let dragRotating = false;
  let moved = 0;
  let raf = 0;

  const getNumCestas = () => {
    const cfg = state.configTorre || {};
    return cfg.numCestas || window.NUM_CESTAS_ACTIVO || NUM_CESTAS || 5;
  };
  const getRot = () => (state.configTorre?._torreRotRad || 0);
  const setRot = (r) => {
    if (!state.configTorre) state.configTorre = {};
    state.configTorre._torreRotRad = r;
  };
  const snapRot = (r) => {
    const k = (2 * Math.PI) / Math.max(3, getNumCestas());
    return Math.round(r / k) * k;
  };
  const normRot = (r) => {
    const twoPi = 2 * Math.PI;
    let x = r % twoPi;
    if (x < 0) x += twoPi;
    return x;
  };

  const pintarSoloCestas = () => torrePintarCestasSolo(wrap);

  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!wrap.isConnected) return;
      if (!torreSvgEsTorreVerticalGiratoria()) return;
      if (dragRotating && wrap.querySelector('#hc-baskets-n-0')) {
        pintarSoloCestas();
      } else {
        wrap.innerHTML =
          typeof hcRenderTorreDiagramHtml === 'function'
            ? hcRenderTorreDiagramHtml()
            : typeof generarSVGTorre === 'function'
              ? generarSVGTorre()
              : '';
        if (!dragRotating) {
          bindTorreCestas(wrap, { suppressTapIfMoved: () => moved > 10 });
          bindTorreRotFlechas(wrap);
        }
      }
    });
  };

  const onDown = (clientX) => {
    if (!torreSvgEsTorreVerticalGiratoria()) return;
    try {
      if (localStorage.getItem(TORRE_SWIPE_HINT_LS) !== '1') {
        localStorage.setItem(TORRE_SWIPE_HINT_LS, '1');
        const h = document.getElementById('torreSwipeHint');
        if (h) h.style.display = 'none';
      }
    } catch (_) {}
    dragging = true;
    dragRotating = false;
    moved = 0;
    startX = clientX;
    startRot = getRot();
  };
  const onMove = (clientX) => {
    if (!dragging) return;
    const dx = clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 1) dragRotating = true;
    const rot = startRot + (dx / 280) * (2 * Math.PI);
    setRot(rot);
    schedule();
  };
  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    if (e && typeof e.pointerId === 'number') {
      try { wrap.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    const didDrag = moved > 10;
    const wasLayerDrag = dragRotating;
    dragRotating = false;
    if (didDrag) {
      setRot(torreNormRotRad(torreSnapRotRad(getRot())));
      saveState();
    }
    if (wasLayerDrag && wrap.querySelector('#hc-baskets-n-0')) {
      pintarSoloCestas();
      bindTorreCestas(wrap, { suppressTapIfMoved: () => moved > 10 });
    } else if (moved > 0 || didDrag) {
      schedule();
    }
    setTimeout(() => { moved = 0; }, 0);
  };

  wrap.addEventListener('pointerdown', (e) => {
    if (e.target.closest && e.target.closest('.hc-cesta')) return;
    if (e.target.closest && e.target.closest('.hc-torre-rot-flecha')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
    onDown(e.clientX);
  }, { passive: true });
  wrap.addEventListener('pointermove', (e) => onMove(e.clientX), { passive: true });
  wrap.addEventListener('pointerup', (e) => onUp(e), { passive: true });
  wrap.addEventListener('pointercancel', (e) => onUp(e), { passive: true });
}

function bindTorreCestas(wrap, opts = {}) {
  const shouldSuppressTap = typeof opts.suppressTapIfMoved === 'function'
    ? opts.suppressTapIfMoved
    : () => false;

  const tipEl = document.getElementById('torreQuickTip');
  const hideTip = () => { if (tipEl) tipEl.classList.add('setup-hidden'); };
  const showTip = (html, x, y) => {
    if (!tipEl) return;
    tipEl.innerHTML = html;
    tipEl.classList.remove('setup-hidden');
    // Offset y clamp simple
    const pad = 10;
    const ww = window.innerWidth || 390;
    const wh = window.innerHeight || 800;
    const w = 270;
    let left = x + 12;
    let top  = y + 14;
    if (left + w + pad > ww) left = Math.max(pad, x - w - 12);
    if (top + 120 + pad > wh) top = Math.max(pad, y - 120);
    tipEl.style.left = left + 'px';
    tipEl.style.top  = top + 'px';
  };

  wrap.querySelectorAll('.hc-cesta').forEach(el => {
    const n = parseInt(el.getAttribute('data-n'));
    const c = parseInt(el.getAttribute('data-c'));

    // Tap
    el.addEventListener('click', () => {
      if (shouldSuppressTap()) return;
      hideTip();
      torreOnCestaActivada(n, c);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (shouldSuppressTap()) return;
      hideTip();
      torreOnCestaActivada(n, c);
    });

    // Long-press preview (móvil)
    let t = 0;
    let startX = 0, startY = 0;
    const clear = () => { if (t) { clearTimeout(t); t = 0; } };

    el.addEventListener('pointerdown', (ev) => {
      clear();
      hideTip();
      el.classList.add('hc-cesta-tapflash');
      setTimeout(() => { try { el.classList.remove('hc-cesta-tapflash'); } catch (_) {} }, 140);
      startX = ev.clientX; startY = ev.clientY;
      t = setTimeout(() => {
        const dat = (state.torre?.[n]?.[c]) || {};
        const _ti = tipoInstalacionNormalizado(state.configTorre);
        const vacioLbl = _ti === 'dwc' ? 'Maceta vacía' : 'Módulo vacío';
        const variedad = dat.variedad || vacioLbl;
        const dias = dat.fecha ? Math.max(0, Math.floor((Date.now() - new Date(dat.fecha)) / 86400000)) : null;
        const fotos = (dat.fotos || []).length;
        const notas = (dat.notas || '').trim();
        const meta = [
          dias !== null ? `${dias} d` : '',
          fotos ? `${fotos} foto${fotos === 1 ? '' : 's'}` : '',
          notas ? 'Notas' : ''
        ].filter(Boolean).join(' · ');

        const cultTip = dat.variedad ? getCultivoDB(dat.variedad) : null;
        const iconTip = dat.variedad
          ? '<span class="torre-tip-icon" aria-hidden="true">' + cultivoEmojiHtml(cultTip, 1.5) + '</span>'
          : '';
        const nomTip = cultivoNombreLista(cultTip, dat.variedad);
        showTip(
          '<div class="torre-tip-head">' + iconTip +
          '<div class="torre-tip-title">' + escHtmlUi(nomTip) + '</div></div>' +
          (meta ? `<div class="torre-tip-meta">${meta}</div>` : `<div class="torre-tip-meta">Toca para editar</div>`),
          ev.clientX, ev.clientY
        );
      }, 420);
    }, { passive: true });

    el.addEventListener('pointermove', (ev) => {
      if (!t) return;
      const dx = Math.abs(ev.clientX - startX);
      const dy = Math.abs(ev.clientY - startY);
      if (dx > 10 || dy > 10) clear();
    }, { passive: true });

    el.addEventListener('pointerup', () => { clear(); setTimeout(hideTip, 50); }, { passive: true });
    el.addEventListener('pointercancel', () => { clear(); hideTip(); }, { passive: true });
    el.addEventListener('pointerleave', () => { clear(); hideTip(); }, { passive: true });

    el.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const pe = window.getComputedStyle(el).pointerEvents;
      if (pe === 'none') return;
      ev.preventDefault();
      el.click();
    });
  });
}

/** Flechas de giro solo en el SVG, a lados del depósito (torre vertical). Mantener pulsado = giro continuo. */
function bindTorreRotFlechas(wrap) {
  if (!wrap || !torreSvgEsTorreVerticalGiratoria()) return;
  wrap.querySelectorAll('.hc-torre-rot-flecha').forEach(g => {
    const dirRaw = parseInt(g.getAttribute('data-rot-dir'), 10);
    const dir = dirRaw === -1 ? -1 : 1;
    let holdIv = 0;
    const dismissHint = () => {
      try {
        if (localStorage.getItem(TORRE_SWIPE_HINT_LS) !== '1') {
          localStorage.setItem(TORRE_SWIPE_HINT_LS, '1');
          const h = document.getElementById('torreSwipeHint');
          if (h) h.style.display = 'none';
        }
      } catch (_) {}
    };
    const spinOnce = () => {
      if (!state.configTorre) state.configTorre = {};
      const delta = 0.042 * dir;
      state.configTorre._torreRotRad = (state.configTorre._torreRotRad || 0) + delta;
      torrePintarCestasSolo(wrap);
    };
    const endHold = (ev) => {
      if (holdIv) {
        clearInterval(holdIv);
        holdIv = 0;
      }
      if (ev && ev.currentTarget && typeof ev.pointerId === 'number') {
        try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (_) {}
      }
      if (!state.configTorre) return;
      state.configTorre._torreRotRad = torreNormRotRad(torreSnapRotRad(state.configTorre._torreRotRad || 0));
      saveState();
      torrePintarCestasSolo(wrap);
      bindTorreCestas(wrap, { suppressTapIfMoved: () => false });
    };
    const startHold = (ev) => {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      try { g.setPointerCapture(ev.pointerId); } catch (_) {}
      dismissHint();
      if (holdIv) return;
      spinOnce();
      holdIv = setInterval(spinOnce, 45);
    };
    g.addEventListener('pointerdown', startHold);
    g.addEventListener('pointerup', endHold);
    g.addEventListener('pointercancel', endHold);
    g.addEventListener('lostpointercapture', endHold);
    g.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      ev.preventDefault();
      rotarTorrePaso(dir);
    });
  });
}

function rotarTorrePaso(dir = 1) {
  if (!torreSvgEsTorreVerticalGiratoria()) return;
  const step = (2 * Math.PI) / Math.max(3, torreGetNumCestasParaRot());
  if (!state.configTorre) state.configTorre = {};
  const cur = state.configTorre._torreRotRad || 0;
  state.configTorre._torreRotRad = torreNormRotRad(torreSnapRotRad(cur + step * (dir >= 0 ? 1 : -1)));
  saveState();
  const wrap = document.getElementById('torreSVGWrap');
  if (wrap && wrap.querySelector('.hc-illo-torre') && wrap.querySelector('#hc-baskets-n-0')) {
    torrePintarCestasSolo(wrap);
    bindTorreCestas(wrap, { suppressTapIfMoved: () => false });
    bindTorreRotFlechas(wrap);
    try {
      renderTorreMedirDiagram();
    } catch (_) {}
    return;
  }
  renderTorre();
}

let _torreKbRotBound = false;
function bindTorreTecladoRotacion() {
  if (_torreKbRotBound) return;
  _torreKbRotBound = true;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (!torreSvgEsTorreVerticalGiratoria()) return;
    const wrap = document.getElementById('torreSVGWrap');
    if (!wrap || !wrap.querySelector('.torre-svg-diagram')) return;
    const tag = e.target && e.target.tagName ? String(e.target.tagName).toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
    e.preventDefault();
    rotarTorrePaso(e.key === 'ArrowRight' ? 1 : -1);
  });
}


function getGrupoCultivo(variedad) {
  // Buscar en CULTIVOS_DB primero
  const cultivo = CULTIVOS_DB.find(c => c.nombre === variedad || c.id === variedad);
  if (cultivo) {
    const grupo = GRUPOS_CULTIVO[cultivo.grupo];
    if (grupo) return { ...grupo, key: cultivo.grupo };
  }
  // Fallback a GRUPOS_CULTIVO_OLD
  for (const [key, grupo] of Object.entries(GRUPOS_CULTIVO_OLD)) {
    if (grupo.plantas.includes(variedad)) return { ...grupo, key };
  }
  return null;
}

function getCultivoDB(variedad) {
  return CULTIVOS_DB.find(c => c.nombre === variedad || c.id === variedad) || null;
}

function getDiasEstimados(variedad) {
  const c = getCultivoDB(variedad);
  return c ? c.dias : 45;
}

function checkNivelCompat(nivel) {
  const variedades = state.torre[nivel].filter(c => c.variedad).map(c => c.variedad);
  if (variedades.length < 2) return null;
  const grupos = [...new Set(variedades.map(v => {
    for (const [k, g] of Object.entries(GRUPOS_CULTIVO)) {
      if (g.plantas.includes(v)) return k;
    }
    return null;
  }).filter(Boolean))];
  if (grupos.length > 1) {
    const combKey1 = grupos[0] + '-' + grupos[1];
    const combKey2 = grupos[1] + '-' + grupos[0];
    const compat = COMPATIBILIDAD[combKey1] || COMPATIBILIDAD[combKey2];
    if (compat && !compat.ok) return 'Mezcla no recomendada';
    if (compat && compat.warn) return 'Ajustar EC al mezclar';
  }
  return null;
}

function toggleCompatPanel() {
  const grid  = document.getElementById('compatGrid');
  const arrow = document.getElementById('compatArrow');
  const btn   = document.getElementById('btnCompatToggle');
  if (!grid) return;

  const isOpen = !grid.classList.contains('setup-hidden');

  if (isOpen) {
    grid.classList.add('setup-hidden');
    grid.style.display = '';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (btn) btn.setAttribute('aria-expanded', 'false');
  } else {
    grid.classList.remove('setup-hidden');
    grid.style.display = 'flex';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (btn) btn.setAttribute('aria-expanded', 'true');
    renderCompatGrid();
  }
}

function renderCompatGrid() {
  const grid = document.getElementById('compatGrid');
  const compatCard = document.querySelector('#tab-sistema .compat-panel-card');
  const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
  const ocultarCompat =
    typeof hcSistemaPropagadorSinHidro === 'function' && hcSistemaPropagadorSinHidro(cfg);
  if (compatCard) compatCard.classList.toggle('setup-hidden', !!ocultarCompat);
  if (!grid) return;
  if (ocultarCompat) {
    grid.classList.add('setup-hidden');
    grid.innerHTML = '';
    return;
  }
  try {

  const nut = getNutrienteTorre();

  // Recoger TODAS las variedades de TODOS los niveles de la torre
  const enTorre = [];
  const totalNiveles = (state.configTorre && state.configTorre.numNiveles) || NUM_NIVELES;

  for (let n = 0; n < totalNiveles; n++) {
    const nivel = state.torre[n] || [];
    nivel.forEach((c, ci) => {
      if (!c || !c.variedad) return;
      const cultivo = getCultivoDB(c.variedad) || { nombre: c.variedad, grupo:'hibrida', ecMin:1200, ecMax:2000 };
      enTorre.push({ variedad: c.variedad, nivel: n+1, cesta: ci+1, cultivo });
    });
  }

  // ── Sin plantas ──────────────────────────────────────────────────────────
  if (enTorre.length === 0) {
    grid.innerHTML =
      '<div class="compat-empty">' +
        '<div class="compat-empty-icon-wrap" aria-hidden="true">' +
        '<span class="compat-empty-icon" aria-hidden="true">🌱</span></div>' +
        '<div class="compat-empty-title">Torre vacía</div>' +
        '<div class="compat-empty-text">' +
          'Pulsa cualquier cesta del diagrama SVG de arriba para añadir una planta.<br>' +
          'Aquí verás si son compatibles entre sí.' +
        '</div>' +
      '</div>';
    return;
  }

  // Grupos únicos
  const gruposMap = new Map();
  enTorre.forEach(p => {
    const gKey = p.cultivo.grupo || 'hibrida';
    if (!gruposMap.has(gKey)) {
      const g = GRUPOS_CULTIVO[gKey] || GRUPOS_CULTIVO.hibrida;
      gruposMap.set(gKey, { ...g, key: gKey, plantas: [] });
    }
    gruposMap.get(gKey).plantas.push(p.variedad);
  });

  let html = '';

  // ── Resumen plantas por grupo ────────────────────────────────────────────
  html += '<div class="compat-grupos-title">Grupos en esta instalación (' + enTorre.length + ' plantas)</div>';

  gruposMap.forEach((g, key) => {
    const unicas = [...new Set(g.plantas)];
    html +=
      '<div class="compat-grupo-card" style="--cg-bg:' + g.color + '18;--cg-bd:' + g.color + '55;--cg-fg:' + g.color + ';--cg-chip-bg:' + g.color + '22">' +
        '<div class="compat-grupo-head">' +
          '<span class="compat-grupo-name">' +
            '<span class="compat-grupo-emoji" aria-hidden="true">' +
            (typeof hcIcon === 'function' && typeof HC_GRUPO_SYM !== 'undefined'
              ? hcIcon(HC_GRUPO_SYM[key] || 'hc-i-sprout', 'hc-ico--grupo')
              : GRUPO_EMOJI_REP[key] || '🌱') +
            '</span>' +
            g.nombre + '</span>' +
          '<span class="compat-grupo-chip">' + unicas.length + ' var.</span>' +
        '</div>' +
        '<div class="compat-grupo-variedades">' +
          unicas.map(function(u) { return escHtmlUi(cultivoNombreLista(getCultivoDB(u), u)); }).join(', ') + '</div>' +
        '<div class="compat-grupo-tags">' +
          '<span class="compat-tag-soft">' +
            (typeof hcMetricLine === 'function' ? hcMetricLine('ec', 'EC ' + g.ec + ' µS/cm') : '⚡ EC ' + g.ec + ' µS/cm') +
            '</span>' +
          '<span class="compat-tag-soft">' +
            (typeof hcMetricLine === 'function' ? hcMetricLine('ph', 'pH ' + g.ph) : '🧪 pH ' + g.ph) +
            '</span>' +
        '</div>' +
        '<div class="compat-grupo-nota">' +
            (typeof hcTextWithLeadingIcons === 'function'
              ? hcTextWithLeadingIcons('💡 ' + (g.nota || ''), 'info')
              : '💡 ' + (g.nota || '')) +
            '</div>' +
      '</div>';
  });

  // ── Análisis compatibilidad ───────────────────────────────────────────────
  if (gruposMap.size > 1) {
    html +=
      '<div class="compat-bloque-title">' +
      (typeof hcTextWithLeadingIcons === 'function'
        ? hcTextWithLeadingIcons('🔬 Compatibilidad entre grupos', 'info')
        : '🔬 Compatibilidad entre grupos') +
      '</div>';

    const keys = [...gruposMap.keys()];
    let hayIncomp = false;

    for (let i = 0; i < keys.length; i++) {
      for (let j = i+1; j < keys.length; j++) {
        const gA = gruposMap.get(keys[i]);
        const gB = gruposMap.get(keys[j]);
        const ecA = gA.ec.split('-').map(Number);
        const ecB = gB.ec.split('-').map(Number);
        const overlap = Math.min(ecA[1], ecB[1]) - Math.max(ecA[0], ecB[0]);
        const ok = overlap >= 100;
        if (!ok) hayIncomp = true;

        html +=
          '<div class="compat-pair-card ' + (ok ? 'compat-pair-card--ok' : 'compat-pair-card--bad') + '">' +
            '<div class="compat-pair-head">' +
              '<span class="compat-pair-icon">' +
              (typeof hcStatusIconMarkup === 'function' ? hcStatusIconMarkup(ok ? 'ok' : 'warn') : ok ? '✅' : '⚠️') +
              '</span>' +
              '<span class="compat-pair-name">' +
                gA.nombre + ' + ' + gB.nombre + '</span>' +
            '</div>' +
            '<div class="compat-pair-text">' +
              (ok
                ? (typeof hcTextWithLeadingIcons === 'function'
                    ? hcTextWithLeadingIcons(
                        '✅ Rango EC compartido: ' + Math.max(ecA[0], ecB[0]) + '–' + Math.min(ecA[1], ecB[1]) + ' µS/cm',
                        'ok'
                      )
                    : '✅ Rango EC compartido: ' + Math.max(ecA[0], ecB[0]) + '–' + Math.min(ecA[1], ecB[1]) + ' µS/cm')
                : (typeof hcTextWithLeadingIcons === 'function'
                    ? hcTextWithLeadingIcons(
                        '⚠️ EC incompatible — ' + gA.nombre + ' (' + gA.ec + ') vs ' + gB.nombre + ' (' + gB.ec + ')',
                        'warn'
                      )
                    : '⚠️ EC incompatible — ' + gA.nombre + ' (' + gA.ec + ') vs ' + gB.nombre + ' (' + gB.ec + ')')) +
            '</div>' +
            (!ok
              ? '<div class="compat-pair-reco">' +
                (typeof hcTextWithLeadingIcons === 'function'
                  ? hcTextWithLeadingIcons(
                      '💡 Recomendación: pon ' + gB.nombre + ' en una torre separada con EC ' + gB.ec + ' µS/cm',
                      'info'
                    )
                  : '💡 Recomendación: pon ' + gB.nombre + ' en una torre separada con EC ' + gB.ec + ' µS/cm') +
                '</div>'
              : '') +
          '</div>';
      }
    }

    if (hayIncomp) {
      html +=
        '<div class="compat-dist-box">' +
          '<div class="compat-dist-title">' +
            (typeof hcTextWithLeadingIcons === 'function'
              ? hcTextWithLeadingIcons('🌿 Distribución óptima entre torres', 'info')
              : '🌿 Distribución óptima entre torres') +
            '</div>' +
          '<div class="compat-dist-text">' +
            '• Torre EC 800–1400: Lechugas + Asiáticas + Albahaca<br>' +
            '• Torre EC 1400–2300: Hojas verdes + Acelga + Rúcula<br>' +
            '• Torre EC 1500–2500: Fresas<br>' +
            '• Torre EC 1800–3500: Frutos (tomate, pimiento, pepino)' +
          '</div>' +
        '</div>';
    }
  }

  // ── EC del nutriente activo ──────────────────────────────────────────────
  html +=
    '<div class="compat-nut-box">' +
      '<div class="compat-nut-title">' +
      (typeof hcMetricLine === 'function' ? hcMetricLine('ec', 'Nutriente activo: ') : '⚡ Nutriente activo: ') +
      (nut ? nut.nombre : 'sin elegir') +
      '</div>' +
      '<div class="compat-nut-text">' +
      (nut
        ? 'EC: ' +
          (nut.ecObjetivo ? nut.ecObjetivo[0] + '–' + nut.ecObjetivo[1] : '900–1400') +
          ' µS/cm · pH: ' +
          (nut.pHRango ? nut.pHRango[0] + '–' + nut.pHRango[1] : '5.5–6.5')
        : 'Elige nutriente en <strong>Cultivo e instalación</strong> o <strong>Medir</strong> para ver rangos orientativos.') +
      '</div>' +
    '</div>';

    grid.innerHTML = html;
  } catch(e) {
    console.error('renderCompatGrid error:', e);
    if (grid) grid.innerHTML = '<div class="compat-error">Error: ' + e.message + '</div>';
  }
  if (grid && grid.classList.contains('setup-hidden')) {
    grid.style.display = '';
  }
}


function mostrarCompatDetalle(gKey) {
  const grupo = GRUPOS_CULTIVO[gKey];
  if (!grupo) return;
  showToast(grupo.nombre + ' · EC: ' + (grupo.ecMin||1200) + '-' + (grupo.ecMax||1600) + ' µS/cm · pH: 5.5-6.5');
}


function getDias(fecha) {
  if (!fecha) return 0;
  const diff = Date.now() - new Date(fecha).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

/** Fecha de plantación/trasplante anotada y parseable (no vacía ni inválida). */
function cestaTieneFechaValida(fecha) {
  if (fecha == null) return false;
  const s = String(fecha).trim();
  if (!s) return false;
  const t = new Date(s).getTime();
  return Number.isFinite(t);
}

/** Cesta con cultivo y fecha válida: entra en riego (N plantas, Kc), fases automáticas y medias de días. */
function cestaCuentaParaRiegoYMetricas(c) {
  return !!(c && c.variedad && cestaTieneFechaValida(c.fecha));
}

function contarPlantasTorreConFechaValida() {
  let n = 0;
  getNivelesActivos().forEach(niv => {
    (state.torre[niv] || []).forEach(c => {
      if (cestaCuentaParaRiegoYMetricas(c)) n++;
    });
  });
  return n;
}

function contarPlantasTorreConVariedad() {
  let n = 0;
  getNivelesActivos().forEach(niv => {
    (state.torre[niv] || []).forEach(c => {
      if (c && c.variedad) n++;
    });
  });
  return n;
}

/**
 * Cestas con cultivo elegido pero sin fecha válida (afecta edad auto, riego, días media en inicio).
 * @returns {{ count: number, items: { nivel: number, cesta: number }[] }} índices 1-based para mensajes al usuario
 */
function getCestasVariedadSinFecha() {
  const items = [];
  getNivelesActivos().forEach(n => {
    (state.torre[n] || []).forEach((c, i) => {
      if (c && c.variedad && !cestaTieneFechaValida(c.fecha)) {
        items.push({ nivel: n + 1, cesta: i + 1 });
      }
    });
  });
  return { count: items.length, items };
}

/** Muestra u oculta avisos en Inicio, Torre y Riego si hay cestas sin fecha. */
function actualizarAvisoCestasSinFecha() {
  const { count } = getCestasVariedadSinFecha();
  const inicio = document.getElementById('avisoCestasSinFechaInicio');
  const torre = document.getElementById('avisoCestasSinFechaTorre');
  const riego = document.getElementById('avisoCestasSinFechaRiego');
  const hide = (el) => {
    if (!el) return;
    el.style.display = 'none';
    el.innerHTML = '';
  };
  if (count === 0) {
    hide(inicio);
    hide(torre);
    hide(riego);
    return;
  }
  const pl = count === 1 ? 'cesta' : 'cestas';
  const nStr = '<strong>' + count + '</strong>';
  if (inicio) {
    inicio.style.display = 'block';
    inicio.innerHTML =
      (typeof hcTextWithLeadingIcons === 'function'
        ? hcTextWithLeadingIcons('⚠️ Hay ', 'warn')
        : '⚠️ Hay ') +
      nStr +
      ' ' +
      pl +
      ' con cultivo pero <strong>sin fecha</strong>. No se usan en el riego ni en la media de días (solo cuentan cestas con fecha válida). ' +
      '<button type="button" class="aviso-cestas-ir" onclick="goTab(\'sistema\')">Ir a Cultivo e instalación</button>';
  }
  if (torre) {
    torre.style.display = 'block';
    const avisoTorre =
      count === 1
        ? '⚠️ Una cesta tiene cultivo <strong>sin fecha</strong>. Abre su ficha y marca trasplante o siembra.'
        : '⚠️ ' + nStr + ' cestas tienen cultivo <strong>sin fecha</strong>. Abre cada ficha y completa la fecha.';
    torre.innerHTML =
      typeof hcTextWithLeadingIcons === 'function' ? hcTextWithLeadingIcons(avisoTorre, 'warn') : avisoTorre;
  }
  if (riego) {
    riego.style.display = 'block';
    riego.innerHTML =
      (typeof hcTextWithLeadingIcons === 'function'
        ? hcTextWithLeadingIcons('⚠️ Con ', 'warn')
        : '⚠️ Con ') +
      nStr +
      ' ' +
      pl +
      ' sin fecha, <strong>no entran</strong> en plantas/Kc del riego ni en la media de días del inicio (solo las fechas válidas). ' +
      '<button type="button" class="aviso-cestas-ir" onclick="goTab(\'sistema\')">Completar en Cultivo e instalación</button>';
  }
}

function getEstado(variedad, dias) {
  const base =
    typeof getDiasCosechaVariedad === 'function' ? getDiasCosechaVariedad(variedad) : DIAS_COSECHA[variedad] || 50;
  const total = typeof torreGetDiasCosechaObjetivo === 'function'
    ? torreGetDiasCosechaObjetivo(base, state.configTorre || {})
    : base;
  if (dias < 7) return 'plantula';
  if (dias < total * 0.5) return 'crecimiento';
  if (dias < total * 0.85) return 'madurez';
  return 'cosecha';
}

function getEmoji(estado) {
  if (typeof hcEtapaCultivoIconMarkup === 'function') return hcEtapaCultivoIconMarkup(estado);
  const map = { plantula: '🌱', crecimiento: '🌿', madurez: '🥬', cosecha: '✂️' };
  return map[estado] || '🌱';
}

function refreshHcRevisionMontajeBanner(cfg) {
  const el = document.getElementById('hcRevisionMontajeBanner');
  if (!el) return;
  const c = cfg || (typeof state !== 'undefined' && state && state.configTorre) || {};
  const show = c.hcRequiereRevisionMontaje === true && c.checklistInstalacionConfirmada !== true;
  el.classList.toggle('setup-hidden', !show);
}

function updateTorreStats() {
  try { initTorres(); } catch (_) {}

  const cfg = state.configTorre || {};
  const nut = getNutrienteTorre();
  const hayInst = typeof hcTieneInstalacionesUsuario === 'function' && hcTieneInstalacionesUsuario();
  const rawNombre = hayInst ? (state.torres?.[state.torreActiva || 0]?.nombre || '').trim() : '';
  const torreNombre = rawNombre || (hayInst ? 'Instalación' : '');
  const volMax = getVolumenDepositoMaxLitros(cfg);
  const volMez = getVolumenMezclaLitros(cfg);
  const tipoInst =
    typeof tipoInstalacionNormalizado === 'function' ? tipoInstalacionNormalizado(cfg) : cfg.tipoInstalacion || 'dwc';
  const esDwcCfg = tipoInst === 'dwc';
  const esRdwcCfg = tipoInst === 'rdwc';

  // Título torre
  renderTablaVariedades();
  const locStr = textoLocalidadMeteoCfg(cfg);
  const locCard = document.getElementById('torreNombreCardLocalidad');
  if (locCard) {
    locCard.textContent = locStr ? '📍 ' + locStr : '📍 Sin municipio — configúralo en Medir';
    locCard.classList.toggle('torre-nombre-localidad-line--vacío', !locStr);
  }
  const locBtn = document.getElementById('torreBtnIrMedirMunicipio');
  if (locBtn) locBtn.classList.toggle('setup-hidden', !!locStr);

  // Info depósito (oculto en camino propagador hasta cerrar hidro)
  const depEl = document.getElementById('depositoTitulo');
  const ocultarDepHidro =
    typeof hcSistemaPropagadorSinHidro === 'function' && hcSistemaPropagadorSinHidro(cfg);
  if (depEl && !ocultarDepHidro) {
    const pref = rawNombre ? rawNombre + ' · ' : '';
    if (esRdwcCfg) {
      depEl.textContent = pref + 'Depósito RDWC (control y recirculación)';
    } else {
      depEl.textContent = pref + 'Depósito DWC (capacidad y mezcla)';
    }
  }

  const volHintEl = document.getElementById('torreDepositoVolHint');
  if (volHintEl) {
    if (esDwcCfg) {
      volHintEl.classList.add('setup-hidden');
      volHintEl.textContent = '';
    } else if (esRdwcCfg) {
      volHintEl.classList.remove('setup-hidden');
      volHintEl.innerHTML =
        'En RDWC este bloque es el <strong>reservorio de control</strong> (suele venir en la placa del kit); para nutrientes la app suma los <strong>cubos útiles</strong> configurados arriba.';
    } else {
      volHintEl.classList.add('setup-hidden');
      volHintEl.textContent = '';
    }
  }

  const volDepIn = document.getElementById('torreVolDepositoL');
  if (volDepIn && document.activeElement !== volDepIn) {
    if (volMax != null && Number.isFinite(volMax) && volMax > 0) {
      volDepIn.value = String(Math.max(5, Math.min(800, Math.round(volMax * 10) / 10)));
    } else {
      volDepIn.value = '';
    }
  }
  const volMezIn = document.getElementById('torreVolMezclaL');
  if (volMezIn && document.activeElement !== volMezIn) {
    if (
      volMez != null &&
      volMax != null &&
      Number.isFinite(volMez) &&
      Number.isFinite(volMax) &&
      volMez < volMax - 0.05
    ) {
      volMezIn.value = String(volMez);
    } else {
      volMezIn.value = '';
    }
  }

  if (esDwcCfg) {
    try {
      refreshDwcSistemaMedidasUI();
    } catch (eDwcSysUi) {}
  }

  actualizarAvisoCestasSinFecha();
  refreshHcRevisionMontajeBanner(cfg);
  renderTorreInstalacionPicker();

  try {
    if (typeof updateDashTorre === 'function') updateDashTorre();
  } catch (_) {}
}

/** Editar capacidad máxima y litros de mezcla desde la pestaña Torre. */
function guardarVolDepositoDesdeTorre() {
  const el = document.getElementById('torreVolDepositoL');
  const elM = document.getElementById('torreVolMezclaL');
  if (!el) return;
  let vMax = parseFloat(String(el.value).replace(',', '.'));
  if (!Number.isFinite(vMax)) vMax = VOL_OBJETIVO;
  vMax = Math.round(Math.max(5, Math.min(800, vMax)) * 10) / 10;
  el.value = String(vMax);

  let mezclaRaw = elM ? String(elM.value || '').trim().replace(',', '.') : '';
  let volMezcla = null;
  if (mezclaRaw !== '') {
    const m = parseFloat(mezclaRaw);
    if (Number.isFinite(m) && m > 0) {
      volMezcla = Math.min(vMax, Math.max(0.5, Math.round(m * 10) / 10));
      if (elM) elM.value = String(volMezcla);
    } else if (elM) elM.value = '';
  } else if (elM) elM.value = '';

  initTorres();
  if (!state.configTorre) state.configTorre = {};
  const prevMax = state.configTorre.volDeposito;
  const prevMez = state.configTorre.volMezclaLitros;
  state.configTorre.volDeposito = vMax;
  if (volMezcla != null && volMezcla < vMax - 0.02) state.configTorre.volMezclaLitros = volMezcla;
  else delete state.configTorre.volMezclaLitros;

  if (prevMax === vMax && prevMez === state.configTorre.volMezclaLitros) return;
  guardarEstadoTorreActual();
  saveState();
  aplicarConfigTorre();
  try {
    renderTorreSistemaResumenTabla(state.configTorre);
  } catch (eRes) {}
  actualizarBadgesNutriente();
  updateDashboard();
  updateTorreStats();
  const vm = getVolumenMezclaLitros(state.configTorre);
  showToast(
    'Depósito máx ' + vMax + ' L · cálculos de dosis con ' + vm + ' L' +
      (vm < vMax - 0.05 ? ' (mezcla)' : '')
  );
  refreshConsejosSiVisible();
  const clOv = document.getElementById('checklistOverlay');
  if (clOv && clOv.classList.contains('open') && (state.configTorre || {}).tipoInstalacion === 'dwc') {
    try {
      refrescarDwcDifusorChecklist();
    } catch (eDifCl) {}
  }
}


