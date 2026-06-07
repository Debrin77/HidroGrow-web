/**
 * Panel Sistema por fase de camino (sustituye esquema DWC/RDWC hasta operativa).
 */
(function (global) {
  'use strict';

  function cfgActiva() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function esc(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function etiquetaSustrato(cfg) {
    var g = cfg.germinacionFlow || {};
    var sg = cfg.sustratoGerm || (cfg.premiumSetup && cfg.premiumSetup.sustratoGerm) || g.sustratoGerm;
    if (sg && typeof etiquetaSustratoGerm === 'function') return etiquetaSustratoGerm(sg);
    var key = cfg.sustrato || cfg.configSustrato || '';
    var map = {
      lana: 'Lana de roca',
      esponja: 'Esponja / jiffy',
      tierra: 'Sustrato ligero',
      coco: 'Coco',
    };
    return map[key] || (key ? String(key) : '—');
  }

  function htmlNutrientesGerm(g, ctxLabel) {
    ctxLabel = ctxLabel || 'germinación';
    var cfg = cfgActiva();
    var planHtml =
      typeof htmlResumenNutrienteGermConfig === 'function'
        ? htmlResumenNutrienteGermConfig(cfg)
        : '';
    var rows = [];
    if (g && Array.isArray(g.nutrientesAplicados)) rows = g.nutrientesAplicados.slice(0, 12);
    if (g && Array.isArray(g.registroDiario)) {
      g.registroDiario.forEach(function (r) {
        if (r.nutProducto || r.nutEc != null || r.nutPh != null) {
          rows.push({
            fecha: r.fecha || r.fechaIso,
            producto: r.nutProducto,
            ec: r.nutEc,
            ph: r.nutPh,
            ml: r.nutMl,
          });
        }
      });
    }
    if (!rows.length) {
      if (planHtml) {
        return (
          planHtml +
          '<p class="hc-sis-prop-nut-empty setup-field-hint">Aún no hay aplicaciones anotadas en el registro diario de ' +
          esc(ctxLabel) +
          '.</p>'
        );
      }
      return (
        '<p class="hc-sis-prop-nut-empty setup-field-hint">Sin nutrientes anotados en el registro diario de ' +
        esc(ctxLabel) +
        '. Configúralo en el asistente (paso Clima y abono) o en el checklist de prep.</p>'
      );
    }
    return (
      (planHtml || '') +
      '<ul class="hc-sis-prop-nut-list">' +
      rows
        .map(function (n) {
          var det = [];
          if (n.producto) det.push(esc(n.producto));
          if (n.ec != null && n.ec !== '') det.push('EC ' + esc(String(n.ec)));
          if (n.ph != null && n.ph !== '') det.push('pH ' + esc(String(n.ph)));
          if (n.ml != null && n.ml !== '') det.push(esc(String(n.ml)) + ' ml');
          return (
            '<li><span class="hc-sis-prop-nut-meta">' +
            esc(n.fecha || '') +
            '</span> ' +
            det.join(' · ') +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  function pasoPrepListo(cfg, id) {
    if (id === 'prep') return typeof propagadorMontajeCompleto === 'function' && propagadorMontajeCompleto(cfg);
    if (id === 'sala') {
      return typeof salaConfiguradaCamino === 'function' && salaConfiguradaCamino(cfg);
    }
    if (id === 'montaje') {
      return typeof montajeSalaOkCamino === 'function' && montajeSalaOkCamino(cfg);
    }
    if (id === 'hidro') {
      return typeof hidroInstalacionCerrada === 'function' && hidroInstalacionCerrada(cfg);
    }
    if (id === 'deposito') {
      return typeof depositoListo === 'function' && depositoListo(cfg);
    }
    return false;
  }

  function htmlPasosPrep(cfg) {
    var pasos = [
      { id: 'prep', label: 'Checklist prep hidro', onclick: 'typeof hcOpenPropagadorMontajeChecklist===\'function\'&&hcOpenPropagadorMontajeChecklist()', btnTxt: 'Checklist' },
      { id: 'sala', label: 'Sala configurada', onclick: 'typeof goTab===\'function\'&&goTab(\'sala\')', btnTxt: 'Sala' },
      { id: 'montaje', label: 'Montaje de sala', onclick: 'typeof hcIrMontajeSala===\'function\'&&hcIrMontajeSala()', btnTxt: 'Montaje' },
      { id: 'hidro', label: 'DWC/RDWC cerrado', onclick: 'typeof abrirSetup===\'function\'&&abrirSetup()', btnTxt: 'Asistente' },
      { id: 'deposito', label: 'Primer llenado (germinar)', onclick: 'typeof abrirChecklist===\'function\'&&abrirChecklist(false)', btnTxt: 'Depósito' },
    ];
    return (
      '<ul class="hc-sis-fase-pasos">' +
      pasos
        .map(function (p) {
          var ok = pasoPrepListo(cfg, p.id);
          return (
            '<li class="hc-sis-fase-paso' +
            (ok ? ' hc-sis-fase-paso--ok' : '') +
            '">' +
            (ok ? '✓ ' : '○ ') +
            esc(p.label) +
            (ok
              ? ''
              : ' <button type="button" class="btn btn-link btn-sm" onclick="' +
                p.onclick +
                '">' +
                esc(p.btnTxt) +
                '</button>') +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  function htmlEnraizadoPasos(cfg) {
    var ok =
      typeof enraizadoMontajeCompleto === 'function' && enraizadoMontajeCompleto(cfg);
    var mat =
      typeof cultivoMatrizListo === 'function' && cultivoMatrizListo();
    return (
      '<ul class="hc-sis-fase-pasos">' +
      '<li class="hc-sis-fase-paso' +
      (ok ? ' hc-sis-fase-paso--ok' : '') +
      '">' +
      (ok ? '✓ ' : '○ ') +
      'Checklist de enraizado (domo, rockwool, higiene)' +
      (ok
        ? ''
        : ' <button type="button" class="btn btn-link btn-sm" onclick="typeof hcOpenPropagadorMontajeChecklist===\'function\'&&hcOpenPropagadorMontajeChecklist()">Abrir</button>') +
      '</li>' +
      '<li class="hc-sis-fase-paso' +
      (mat ? ' hc-sis-fase-paso--ok' : '') +
      '">' +
      (mat ? '✓ ' : '○ ') +
      'Esquejes asignados en el esquema' +
      (mat
        ? ''
        : ' <button type="button" class="btn btn-link btn-sm" onclick="typeof hcIrCultivoMatriz===\'function\'&&hcIrCultivoMatriz(true)">Asignar</button>') +
      '</li></ul>'
    );
  }

  function htmlMadrePasos(cfg) {
    var mat =
      typeof cultivoMatrizListo === 'function' && cultivoMatrizListo();
    var dep = typeof depositoListo === 'function' && depositoListo(cfg);
    return (
      '<ul class="hc-sis-fase-pasos">' +
      '<li class="hc-sis-fase-paso' +
      (mat ? ' hc-sis-fase-paso--ok' : '') +
      '">' +
      (mat ? '✓ ' : '○ ') +
      'Madre asignada en la matriz (18/6)' +
      (mat
        ? ''
        : ' <button type="button" class="btn btn-link btn-sm" onclick="typeof hcIrCultivoMatriz===\'function\'&&hcIrCultivoMatriz(true)">Asignar madre</button>') +
      '</li>' +
      '<li class="hc-sis-fase-paso' +
      (dep ? ' hc-sis-fase-paso--ok' : '') +
      '">' +
      (dep ? '✓ ' : '○ ') +
      'Primer llenado del depósito madre' +
      (dep
        ? ''
        : ' <button type="button" class="btn btn-link btn-sm" onclick="typeof abrirChecklist===\'function\'&&abrirChecklist(false)">Checklist</button>') +
      '</li></ul>'
    );
  }

  function buildPanelHtml(cfg, fase) {
    var ui = global.HC_FASE_UI && global.HC_FASE_UI[fase] ? global.HC_FASE_UI[fase] : {};
    var g = typeof ensureGerminacionFlow === 'function' ? ensureGerminacionFlow(cfg) : {};
    var diaN = typeof diasDesdeInicio === 'function' ? diasDesdeInicio(g) + 1 : 1;
    var tipo =
      typeof etiquetaTipoInstalacion === 'function'
        ? etiquetaTipoInstalacion(cfg)
        : cfg.tipoInstalacion === 'rdwc'
          ? 'RDWC'
          : 'DWC';

    if (fase === 'propagador') {
      var planSt =
        typeof getPlanGermEstado === 'function' ? getPlanGermEstado(cfg) : {};
      var numSem =
        planSt.numSemillas >= 1
          ? planSt.numSemillas
          : Math.min(72, Math.max(1, Math.round(Number(g.numSemillas) || 1)));
      var nombreGen = planSt.nombreVar || '—';
      var concl =
        typeof germinacionConcluida === 'function' && germinacionConcluida(cfg);
      var aviso = '';
      if (!concl) {
        aviso =
          '<div class="hc-sis-prop-alerta setup-field-hint setup-field-hint--banner">Completa el registro diario y marca la germinación concluida en Inicio.</div>';
      } else if (
        typeof hcCaminoRequiereConfigHidroPendiente === 'function' &&
        hcCaminoRequiereConfigHidroPendiente(cfg)
      ) {
        aviso =
          '<div class="hc-sis-prop-alerta hc-sis-prop-alerta--hidro setup-field-hint setup-field-hint--banner">' +
          '<strong>Siguiente:</strong> asistente DWC/RDWC para el traslado.' +
          '<button type="button" class="btn btn-primary btn-sm" style="margin-left:8px" onclick="typeof abrirSetupFaseHidro===\'function\'&&abrirSetupFaseHidro()">Configurar</button></div>';
      }
      return (
        '<section class="hc-sis-prop card">' +
        '<h2 class="hc-sis-prop-title">' +
        esc(ui.icon || '🫧') +
        ' ' +
        esc(ui.tituloPanel) +
        '</h2>' +
        '<p class="hc-sis-prop-lead">El esquema del <strong>domo</strong> está arriba (SVG). Aquí: genética, semillas y nutrientes de la bandeja.</p>' +
        aviso +
        '<div class="hc-sis-prop-grid">' +
        '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Genética</span><strong>' +
        esc(nombreGen) +
        '</strong></div>' +
        '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Semillas</span><strong>' +
        esc(String(numSem)) +
        '</strong></div>' +
        '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Sustrato</span><strong>' +
        esc(etiquetaSustrato(cfg)) +
        '</strong></div>' +
        '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Día</span><strong>' +
        esc(String(diaN)) +
        '</strong></div></div>' +
        '<div class="hc-sis-prop-nut"><h3 class="hc-sis-prop-subtitle">Nutrientes en agua</h3>' +
        htmlNutrientesGerm(g, 'propagador') +
        '</div>' +
        '<p class="hc-sis-prop-foot"><button type="button" class="btn btn-primary btn-sm" onclick="goTab(\'inicio\');setTimeout(function(){document.getElementById(\'dashGerminacionHub\')?.scrollIntoView({behavior:\'smooth\'})},200)">Inicio → Germinación</button></p></section>'
      );
    }

    if (fase === 'prep_hidro') {
      var prepOk =
        typeof propagadorMontajeCompleto === 'function' && propagadorMontajeCompleto(cfg);
      var nextPrep =
        typeof hcSiguientePasoSemillaHidro === 'function' ? hcSiguientePasoSemillaHidro(cfg) : null;
      var footPrep = '';
      if (prepOk && nextPrep && nextPrep.action !== 'irPropagadorMontaje') {
        footPrep =
          '<p class="hc-sis-prop-foot"><button type="button" class="btn btn-primary btn-sm" onclick="typeof hcEjecutarAccionInstalacion===\'function\'&&hcEjecutarAccionInstalacion(\'' +
          nextPrep.action +
          '\')">Siguiente: ' +
          esc(nextPrep.label) +
          '</button></p>';
      } else if (!prepOk) {
        footPrep =
          '<p class="hc-sis-prop-foot"><button type="button" class="btn btn-primary btn-sm" onclick="typeof hcOpenPropagadorMontajeChecklist===\'function\'&&hcOpenPropagadorMontajeChecklist()">Abrir checklist prep hidro</button></p>';
      }
      var guiaPrep =
        typeof renderPrepHidroGuiaGermHtml === 'function' ? renderPrepHidroGuiaGermHtml(cfg) : '';
      return (
        '<section class="hc-sis-prop card">' +
        '<h2 class="hc-sis-prop-title">' +
        esc(ui.icon || '💧') +
        ' ' +
        esc(ui.tituloPanel) +
        '</h2>' +
        '<p class="hc-sis-prop-lead">' +
        (prepOk
          ? 'Prep en cubo listo. Sigue con el <strong>siguiente paso</strong> de la lista (sala, montaje, DWC/RDWC o depósito).'
          : 'Orden: <strong>1 semilla/cubo</strong>, cúpula por cesta, oscuridad 2 días, llenado (cm bajo sustrato) → sala → montaje → <strong>primer llenado</strong> → 6 fases en Inicio.') +
        '</p>' +
        guiaPrep +
        htmlPasosPrep(cfg) +
        footPrep +
        '</section>'
      );
    }

    if (fase === 'germ_cubo') {
      var tray2 =
        typeof renderGermHidroNetPotViz === 'function'
          ? renderGermHidroNetPotViz(g, cfg, { idPrefix: 'hcSisGerm', sistemaPanel: true })
          : typeof renderGermTrayViz === 'function'
            ? renderGermTrayViz(g, cfg, { idPrefix: 'hcSisGerm', sistemaPanel: true, sinDomo: true })
            : '';
      var fasesN =
        typeof contarFasesGermHechas === 'function' ? contarFasesGermHechas(cfg) : 0;
      return (
        '<section class="hc-sis-prop card">' +
        '<h2 class="hc-sis-prop-title">' +
        esc(ui.icon || '🌱') +
        ' ' +
        esc(ui.tituloPanel) +
        '</h2>' +
        '<p class="hc-sis-prop-lead">Semilla en <strong>net pot</strong> sobre ' +
        esc(tipo) +
        ' (no suelta en el depósito). El esquema completo se activa tras la <strong>checklist operativa</strong> y registrar la plántula en la matriz.</p>' +
        '<div class="hc-sis-prop-grid">' +
        '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Fases</span><strong>' +
        fasesN +
        '/6</strong></div>' +
        '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Día</span><strong>' +
        esc(String(diaN)) +
        '</strong></div>' +
        '<div class="hc-sis-prop-stat"><span class="hc-sis-prop-stat-lbl">Depósito</span><strong>' +
        (typeof depositoListo === 'function' && depositoListo(cfg) ? 'Listo' : 'Pendiente') +
        '</strong></div></div>' +
        tray2 +
        '<div class="hc-sis-prop-nut"><h3 class="hc-sis-prop-subtitle">Nutrientes (agua / cubo)</h3>' +
        htmlNutrientesGerm(g, 'cubo') +
        '</div>' +
        '<p class="hc-sis-prop-foot"><button type="button" class="btn btn-primary btn-sm" onclick="goTab(\'inicio\');setTimeout(function(){document.getElementById(\'dashGerminacionHub\')?.scrollIntoView({behavior:\'smooth\'})},200)">Registro en Inicio</button></p></section>'
      );
    }

    if (fase === 'enraizado') {
      return (
        '<section class="hc-sis-prop card">' +
        '<h2 class="hc-sis-prop-title">' +
        esc(ui.icon || '🌿') +
        ' ' +
        esc(ui.tituloPanel) +
        '</h2>' +
        '<p class="hc-sis-prop-lead">Domo de clones → raíz en rockwool → <strong>asignar en el esquema</strong> → primer llenado del depósito.</p>' +
        htmlEnraizadoPasos(cfg) +
        '<p class="hc-sis-prop-foot"><button type="button" class="btn btn-primary btn-sm" onclick="typeof hcOpenPropagadorMontajeChecklist===\'function\'&&hcOpenPropagadorMontajeChecklist()">Checklist enraizado</button></p></section>'
      );
    }

    if (fase === 'madre') {
      return (
        '<section class="hc-sis-prop card">' +
        '<h2 class="hc-sis-prop-title">' +
        esc(ui.icon || '👑') +
        ' ' +
        esc(ui.tituloPanel) +
        '</h2>' +
        '<p class="hc-sis-prop-lead">Una planta en cubo <strong>18/6</strong> permanente. Sesiones de esqueje desde Consejos / registro.</p>' +
        htmlMadrePasos(cfg) +
        '<p class="hc-sis-prop-foot"><button type="button" class="btn btn-secondary btn-sm" onclick="typeof hcIrCultivoMatriz===\'function\'&&hcIrCultivoMatriz(true)">Asignar madre</button></p></section>'
      );
    }

    return '';
  }

  var TORRE_HIDRO_CHROME_IDS = [
    'torreEsquemaSub',
    'torreDiagramToolbar',
    'torreCestaFocusBar',
    'torreInteraccionBar',
    'torreListaVista',
    'torreSistemaResumenWrap',
    'torreQuickTip',
    'sistemaDwcAyudaCard',
  ];

  function setTorreHidroChromeVisible(visible) {
    TORRE_HIDRO_CHROME_IDS.forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.classList.toggle('setup-hidden', !visible);
      if (!visible) {
        node.hidden = true;
        node.setAttribute('aria-hidden', 'true');
      } else {
        node.hidden = false;
        node.removeAttribute('aria-hidden');
      }
    });
    document.querySelectorAll('#tab-sistema .torre-deposito-stack, #tab-sistema .torre-deposito').forEach(function (node) {
      node.classList.toggle('setup-hidden', !visible);
      node.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });
    document.querySelectorAll('#tab-sistema .torre-leyenda-mt').forEach(function (node) {
      node.classList.toggle('setup-hidden', !visible);
    });
    var cont = document.querySelector('#tab-sistema .torre-container');
    if (cont) cont.classList.toggle('torre-container--solo-propagador', !visible);
  }

  function toggleTorreChrome(mostrarFase, cfg, fase) {
    var torreWrap = document.getElementById('torreSVGWrap');
    var torreCard = document.getElementById('torreNombreCard');
    var resumenSup = document.querySelector('#tab-sistema .torre-tab-resumen-superior');
    var dwcCard = document.getElementById('sistemaDwcAyudaCard');
    var ecphCard = document.getElementById('sistemaEcPhStrategyCard');
    var cultivoExtras = document.getElementById('sistemaCultivoExtras');
    var esPropagador = fase === 'propagador';
    var sinHidro =
      esPropagador &&
      typeof hcSistemaPropagadorSinHidro === 'function' &&
      hcSistemaPropagadorSinHidro(cfg || cfgActiva());
    if (mostrarFase) {
      if (torreWrap) {
        if (esPropagador) {
          torreWrap.classList.remove('setup-hidden');
          torreWrap.hidden = false;
          torreWrap.style.display = '';
          if (typeof hcRenderPropagadorSvg === 'function') {
            hcRenderPropagadorSvg(cfg || cfgActiva());
          }
        } else {
          torreWrap.classList.add('setup-hidden');
          if (typeof hcClearPropagadorSvg === 'function') hcClearPropagadorSvg();
        }
      }
      if (torreCard) torreCard.classList.add('setup-hidden');
      if (resumenSup) resumenSup.classList.add('setup-hidden');
      if (dwcCard) {
        dwcCard.style.display = 'none';
        dwcCard.hidden = true;
        dwcCard.classList.add('setup-hidden');
      }
      if (ecphCard) {
        ecphCard.style.display = 'none';
        ecphCard.hidden = true;
        ecphCard.classList.add('setup-hidden');
      }
      if (cultivoExtras) cultivoExtras.classList.add('setup-hidden');
      setTorreHidroChromeVisible(!sinHidro);
    } else {
      if (torreWrap) torreWrap.classList.remove('setup-hidden');
      if (torreCard) torreCard.classList.remove('setup-hidden');
      if (resumenSup) resumenSup.classList.remove('setup-hidden');
      if (dwcCard) {
        dwcCard.classList.remove('setup-hidden');
      }
      if (cultivoExtras) cultivoExtras.classList.remove('setup-hidden');
      setTorreHidroChromeVisible(true);
      try {
        if (typeof sincronizarSistemaNftMontajeUI === 'function') {
          sincronizarSistemaNftMontajeUI();
        }
      } catch (_) {}
      try {
        applySistemaSemillaHidroOperativaChrome(cfg || cfgActiva());
      } catch (_) {}
    }
  }

  function applySistemaSemillaHidroOperativaChrome(cfg) {
    cfg = cfg || cfgActiva();
    if (typeof hcMedirEsSemillaHidro !== 'function' || !hcMedirEsSemillaHidro(cfg)) return;
    var ecphCard = document.getElementById('sistemaEcPhStrategyCard');
    if (ecphCard) {
      ecphCard.style.display = 'none';
      ecphCard.hidden = true;
      ecphCard.classList.add('setup-hidden');
      ecphCard.setAttribute('aria-hidden', 'true');
    }
    try {
      if (typeof applySistemaTipoPanelesColapsablesUI === 'function') {
        applySistemaTipoPanelesColapsablesUI();
      }
    } catch (_) {}
    try {
      if (typeof applySistemaDwcSoloConsultaUi === 'function') {
        applySistemaDwcSoloConsultaUi(cfg);
      }
    } catch (_) {}
    try {
      if (typeof applySistemaEsquemaChromeSemillaHidro === 'function') {
        applySistemaEsquemaChromeSemillaHidro(cfg);
      }
    } catch (_) {}
  }

  function refreshTorreExtrasCaminoUi(cfg) {
    cfg = cfg || cfgActiva();
    var sinHidro =
      typeof hcSistemaPropagadorSinHidro === 'function' && hcSistemaPropagadorSinHidro(cfg);
    var det = document.getElementById('torreVariedadesDetails');
    var tit = det && det.querySelector('.torre-variedades-summary-title');
    var sub = det && det.querySelector('.torre-variedades-summary-sub');
    if (tit) {
      tit.textContent = sinHidro ? 'Resumen por alvéolo (propagador)' : 'Resumen por plaza';
    }
    if (sub) {
      sub.textContent = sinHidro
        ? 'Semillas, fase de germinación y objetivos del domo'
        : 'Variedad, días, estado y EC';
    }
    var compatCard = document.querySelector('#tab-sistema .compat-panel-card');
    if (compatCard) compatCard.classList.toggle('setup-hidden', !!sinHidro);
    try {
      if (typeof sincronizarTextosPanelInteraccionSistema === 'function') {
        sincronizarTextosPanelInteraccionSistema();
      }
    } catch (_) {}
    try {
      if (typeof renderTablaVariedades === 'function') renderTablaVariedades();
    } catch (_) {}
    try {
      if (typeof renderCompatGrid === 'function') renderCompatGrid();
    } catch (_) {}
  }

  function hcRefreshSistemaFasePanel() {
    var cfg = cfgActiva();
    try {
      if (typeof ensureSistemaTorreBanner === 'function') ensureSistemaTorreBanner();
      else if (typeof refreshSistemaTorreBanner === 'function') refreshSistemaTorreBanner();
    } catch (_) {}
    var panel = document.getElementById('hcSistemaPropagadorPanel');
    if (!panel) return;

    var fase =
      typeof getSistemaFaseCamino === 'function' ? getSistemaFaseCamino(cfg) : null;

    document.body.classList.remove(
      'hc-modo-fase-propagador',
      'hc-modo-fase-prep-hidro',
      'hc-modo-fase-germ-cubo',
      'hc-modo-fase-enraizado',
      'hc-modo-fase-madre',
      'hc-modo-propagador-sistema',
      'hc-modo-propagador-sin-sala'
    );

    var ocultarPanelUsuario =
      typeof hcSemillaHidroPostAsistenteUi === 'function' && hcSemillaHidroPostAsistenteUi(cfg);

    if (!fase || ocultarPanelUsuario) {
      panel.classList.add('setup-hidden');
      panel.innerHTML = '';
      toggleTorreChrome(false, cfg, null);
      try {
        if (typeof applySistemaSemillaHidroOperativaChrome === 'function') {
          applySistemaSemillaHidroOperativaChrome(cfg);
        }
      } catch (_) {}
      if (typeof hcClearPropagadorSvg === 'function') hcClearPropagadorSvg();
      try {
        if (typeof hcSyncTorreDesdeGerminacionSiAplica === 'function') {
          hcSyncTorreDesdeGerminacionSiAplica(cfg);
        }
      } catch (_) {}
      try {
        if (
          typeof renderTorre === 'function' &&
          typeof hcRenderTorreBloqueadoPorFaseCamino === 'function' &&
          !hcRenderTorreBloqueadoPorFaseCamino(cfg)
        ) {
          renderTorre();
        }
      } catch (_) {}
      refreshTorreExtrasCaminoUi(cfg);
      return;
    }

    var ui = global.HC_FASE_UI && global.HC_FASE_UI[fase];
    if (ui && ui.bodyClass) document.body.classList.add(ui.bodyClass);
    document.body.classList.add('hc-modo-propagador-sistema');

    panel.classList.remove('setup-hidden');
    panel.hidden = false;
    panel.style.display = '';
    var panelHtml = buildPanelHtml(cfg, fase);
    var panelFp = fase + '|' + (cfg.id || '') + '|' + panelHtml.length;
    if (panel.dataset.hcSisFaseFp !== panelFp) {
      panel.innerHTML = panelHtml;
      panel.dataset.hcSisFaseFp = panelFp;
    }
    toggleTorreChrome(true, cfg, fase);
    try {
      if (typeof renderTorreInstalacionPicker === 'function') renderTorreInstalacionPicker();
    } catch (_) {}
    try {
      if (typeof refreshPlantasInstalacionResumen === 'function') refreshPlantasInstalacionResumen();
    } catch (_) {}
    refreshTorreExtrasCaminoUi(cfg);
  }

  global.hcRefreshSistemaFasePanel = hcRefreshSistemaFasePanel;
  global.applySistemaSemillaHidroOperativaChrome = applySistemaSemillaHidroOperativaChrome;
  global.refreshTorreExtrasCaminoUi = refreshTorreExtrasCaminoUi;
  global.hcRefreshSistemaPropagadorPanel = hcRefreshSistemaFasePanel;
})(typeof window !== 'undefined' ? window : globalThis);
