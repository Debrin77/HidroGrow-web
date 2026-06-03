/**
 * Fase operativa por camino: proceso propio, resultado común (cultivo en casa).
 * null = esquema DWC/RDWC completo en Sistema.
 */
(function (global) {
  'use strict';

  var FASE_UI = {
    propagador: {
      tituloTab: 'Propagador',
      tituloPanel: 'Sistema · propagador',
      icon: '🫧',
      bodyClass: 'hc-modo-fase-propagador',
    },
    prep_hidro: {
      tituloTab: 'Prep hidro',
      tituloPanel: 'Sistema · preparación hidro',
      icon: '💧',
      bodyClass: 'hc-modo-fase-prep-hidro',
    },
    germ_cubo: {
      tituloTab: 'Germinación en cubo',
      tituloPanel: 'Sistema · germinación en cubo',
      icon: '🌱',
      bodyClass: 'hc-modo-fase-germ-cubo',
    },
    enraizado: {
      tituloTab: 'Enraizado',
      tituloPanel: 'Sistema · enraizado de esquejes',
      icon: '🌿',
      bodyClass: 'hc-modo-fase-enraizado',
    },
    madre: {
      tituloTab: 'Cubo madre',
      tituloPanel: 'Sistema · planta madre',
      icon: '👑',
      bodyClass: 'hc-modo-fase-madre',
    },
  };

  function cfgActiva() {
    return typeof state !== 'undefined' && state && state.configTorre ? state.configTorre : {};
  }

  function cam(cfg) {
    return typeof getCaminoCultivo === 'function' ? getCaminoCultivo(cfg) : '';
  }

  function prepGermHidroListo(cfg) {
    return typeof propagadorMontajeCompleto === 'function' && propagadorMontajeCompleto(cfg);
  }

  function salaConfiguradaCamino(cfg) {
    if (typeof salaPreGermConfigurada === 'function' && salaPreGermConfigurada(cfg)) {
      return true;
    }
    var p = cfg.premiumSetup || {};
    if (Number(p.anchoM) > 0 && Number(p.largoM) > 0) return true;
    if (Number(cfg.growRoomAnchoM) > 0 && Number(cfg.growRoomLargoM) > 0) return true;
    var inst = cfg.equipamientoInstalado || {};
    return Object.keys(inst).some(function (k) {
      return inst[k] && (inst[k].marca || inst[k].id);
    });
  }

  function montajeSalaOkCamino(cfg) {
    if (typeof montajeSalaPreGermOk === 'function' && montajeSalaPreGermOk(cfg)) {
      return true;
    }
    if (typeof montajeVerificacionVigente === 'function' && montajeVerificacionVigente(cfg)) {
      return true;
    }
    return !!(cfg.puestaMarchaChecks && cfg.puestaMarchaChecks.completedAt);
  }

  function salaLista(cfg) {
    return salaConfiguradaCamino(cfg) && montajeSalaOkCamino(cfg);
  }

  function hidroCerrado(cfg) {
    return typeof hidroInstalacionCerrada === 'function' && hidroInstalacionCerrada(cfg);
  }

  function depListo(cfg) {
    return typeof depositoListo === 'function' && depositoListo(cfg);
  }

  function matrizLista() {
    if (typeof cultivoMatrizListo === 'function') return cultivoMatrizListo();
    return false;
  }

  /**
   * @returns {null|'propagador'|'prep_hidro'|'germ_cubo'|'enraizado'|'madre'}
   */
  function getSistemaFaseCamino(cfg) {
    cfg = cfg || cfgActiva();
    var c = cam(cfg);

    if (c === 'semilla_propagador') {
      if (!hidroCerrado(cfg)) return 'propagador';
      return null;
    }

    if (c === 'semilla_hidro') {
      if (!prepGermHidroListo(cfg)) return 'prep_hidro';
      if (!salaLista(cfg)) return 'prep_hidro';
      if (!hidroCerrado(cfg)) return 'prep_hidro';
      if (!depListo(cfg)) return 'prep_hidro';
      if (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) {
        return 'germ_cubo';
      }
      var g = cfg.germinacionFlow;
      if (
        g &&
        !g.trasladoAt &&
        typeof germinacionConcluida === 'function' &&
        germinacionConcluida(cfg) &&
        !g.checklistTrasladoOk
      ) {
        return 'germ_cubo';
      }
      return null;
    }

    if (c === 'esqueje_hidro') {
      if (typeof enraizadoMontajeCompleto === 'function' && !enraizadoMontajeCompleto(cfg)) {
        return 'enraizado';
      }
      if (!matrizLista()) return 'enraizado';
      return null;
    }

    if (c === 'madre_hidro') {
      if (!matrizLista()) return 'madre';
      if (!depListo(cfg)) return 'madre';
      return null;
    }

    return null;
  }

  function hcMostrarSistemaFaseCamino(cfg) {
    return !!getSistemaFaseCamino(cfg || cfgActiva());
  }

  function hcMostrarSistemaPropagador(cfg) {
    return getSistemaFaseCamino(cfg) === 'propagador';
  }

  function hcTituloSistemaTab(cfg) {
    var f = getSistemaFaseCamino(cfg);
    if (!f || !FASE_UI[f]) return 'Cultivo e instalación';
    return FASE_UI[f].tituloTab;
  }

  function hcOperativaFaseCamino(cfg) {
    return hcMostrarSistemaFaseCamino(cfg);
  }

  function hcOperativaFasePropagadorGerm(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_propagador') return false;
    return hcMostrarSistemaFaseCamino(cfg);
  }

  /** Subtítulo del banner «Instalación seleccionada» en Inicio (sin L ni nutriente de depósito). */
  function hcDashUsaTilesGerminacion(cfg) {
    cfg = cfg || cfgActiva();
    if (hcMostrarSistemaPropagador(cfg)) return true;
    if (getSistemaFaseCamino(cfg) === 'germ_cubo') return true;
    if (typeof hcGerminacionActiva === 'function' && hcGerminacionActiva(cfg)) return true;
    return false;
  }

  function hcDashTorreInfoPropagador(cfg) {
    cfg = cfg || cfgActiva();
    if (!hcMostrarSistemaPropagador(cfg)) return null;
    var parts = ['Germinación en propagador'];
    if (typeof getPlanGermEstado === 'function') {
      var st = getPlanGermEstado(cfg);
      if (st.numSemillas >= 1) {
        parts.push(st.numSemillas + (st.numSemillas === 1 ? ' semilla' : ' semillas'));
      }
      if (st.nombreVar) parts.push(st.nombreVar);
      if (st.sustrato) {
        var subLbl =
          typeof etiquetaSustratoGerm === 'function'
            ? etiquetaSustratoGerm(st.sustrato)
            : st.sustrato;
        if (subLbl) parts.push(subLbl);
      }
    }
    var op =
      typeof sistemaEstaOperativa === 'function' && sistemaEstaOperativa(cfg)
        ? 'operativa'
        : 'stand-by';
    parts.push(op);
    return parts.join(' · ');
  }

  /** Solo propagador: ocultar Sala hasta concluir germinación. */
  function hcOcultarTabSalaDuranteCamino(cfg) {
    cfg = cfg || cfgActiva();
    if (cam(cfg) !== 'semilla_propagador') return false;
    if (typeof hcGerminacionActiva !== 'function' || !hcGerminacionActiva(cfg)) return false;
    if (typeof germinacionConcluida === 'function' && germinacionConcluida(cfg)) return false;
    return true;
  }

  function hcOcultarTabSalaDuranteGerm(cfg) {
    return hcOcultarTabSalaDuranteCamino(cfg);
  }

  function hcMedirEnfocadoGerminacion(cfg) {
    cfg = cfg || cfgActiva();
    var f = getSistemaFaseCamino(cfg);
    return f === 'propagador' || f === 'germ_cubo' || f === 'prep_hidro';
  }

  global.getSistemaFaseCamino = getSistemaFaseCamino;
  global.hcMostrarSistemaFaseCamino = hcMostrarSistemaFaseCamino;
  global.hcMostrarSistemaPropagador = hcMostrarSistemaPropagador;
  global.hcTituloSistemaTab = hcTituloSistemaTab;
  global.hcOperativaFaseCamino = hcOperativaFaseCamino;
  global.hcOperativaFasePropagadorGerm = hcOperativaFasePropagadorGerm;
  global.hcDashTorreInfoPropagador = hcDashTorreInfoPropagador;
  global.hcDashUsaTilesGerminacion = hcDashUsaTilesGerminacion;
  global.hcOcultarTabSalaDuranteCamino = hcOcultarTabSalaDuranteCamino;
  global.hcOcultarTabSalaDuranteGerm = hcOcultarTabSalaDuranteGerm;
  global.hcMedirEnfocadoGerminacion = hcMedirEnfocadoGerminacion;
  global.salaConfiguradaCamino = salaConfiguradaCamino;
  global.montajeSalaOkCamino = montajeSalaOkCamino;
  global.HC_FASE_UI = FASE_UI;

  /** Alertas de control por camino (esqueje, madre, prep hidro). */
  function hcCaminoFaseEventosCalendario(fecha, hoy) {
    var ev = [];
    var cfg = cfgActiva();
    var f = getSistemaFaseCamino(cfg);
    if (!f) return ev;
    var d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    var h = new Date(hoy);
    h.setHours(0, 0, 0, 0);
    if (d.getTime() !== h.getTime()) return ev;
    var c = cam(cfg);
    if (f === 'prep_hidro') {
      ev.push({
        tipo: 'camino',
        icono: '💧',
        titulo: 'Prep hidro · pasos pendientes',
        desc: 'Revisa la lista en Sistema (checklist, sala, montaje, depósito).',
        action: 'sistema',
      });
    }
    if (f === 'germ_cubo') {
      ev.push({
        tipo: 'camino',
        icono: '🌱',
        titulo: 'Germinación en cubo',
        desc: 'Registro diario en Inicio; esquema tras traslado.',
        action: 'inicio',
      });
    }
    if (f === 'enraizado') {
      ev.push({
        tipo: 'camino',
        icono: '🌿',
        titulo: 'Enraizado de esquejes',
        desc: 'Checklist domo y asignar clones en el esquema.',
        action: 'sistema',
      });
    }
    if (f === 'madre') {
      ev.push({
        tipo: 'camino',
        icono: '👑',
        titulo: 'Cubo madre',
        desc: 'Asigna madre en Sistema y primer llenado del depósito.',
        action: 'sistema',
      });
    }
    if (c === 'esqueje_hidro' && typeof enraizadoMontajeCompleto === 'function' && !enraizadoMontajeCompleto(cfg)) {
      ev.push({
        tipo: 'camino',
        icono: '🫧',
        titulo: 'Ventilar domo de clones',
        desc: '2× al día 5 min; HR 70–80 %.',
      });
    }
    return ev;
  }

  global.hcCaminoFaseEventosCalendario = hcCaminoFaseEventosCalendario;
})(typeof window !== 'undefined' ? window : globalThis);
