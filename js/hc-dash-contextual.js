/**
 * Dashboard Contextual Inteligente - Priorización de acciones y consejos personalizados
 * Mejora sustancial: Usuario sabe exactamente qué hacer hoy
 * Versión: 1.0.0
 */
(function () {
  'use strict';

  // Constantes para rangos óptimos
  const RANGOS_OPTIMOS = {
    tempAgua: { min: 18, max: 20, unidad: '°C' },
    ph: { min: 5.8, max: 6.2, unidad: '' },
    ec: { 
      vegetativo: { min: 1000, max: 1600, unidad: 'µS/cm' },
      floracion: { min: 1200, max: 2000, unidad: 'µS/cm' }
    },
    hrSala: { min: 50, max: 60, unidad: '%' },
    tempAire: { min: 20, max: 28, unidad: '°C' }
  };

  /**
   * Obtiene la fase actual del cultivo
   */
  function getFaseActual() {
    try {
      if (typeof getFaseCultivoActual === 'function') {
        return getFaseCultivoActual();
      }
    } catch (_) {}
    return state.modo || 'vegetativo';
  }

  /**
   * Verifica si un valor está fuera de rango
   */
  function estaFueraDeRango(valor, rango) {
    if (!Number.isFinite(valor)) return { ok: false, fuera: false };
    const ok = valor >= rango.min && valor <= rango.max;
    return { ok, fuera: !ok };
  }

  /**
   * Genera acciones prioritarias basadas en el estado actual
   */
  function generarAccionesPrioritarias(ultimaMedicion, config) {
    const acciones = [];
    const um = ultimaMedicion;
    if (!um) return acciones;

    // Verificar temperatura del agua
    const tempAgua = Number(um.temp);
    if (Number.isFinite(tempAgua)) {
      const tempCheck = estaFueraDeRango(tempAgua, RANGOS_OPTIMOS.tempAgua);
      if (tempCheck.fuera) {
        acciones.push({
          prioridad: tempAgua > 24 ? 'critica' : 'alta',
          icono: tempAgua > 24 ? '🔴' : '🟡',
          texto: `Revisar temperatura del depósito (actual: ${tempAgua}°C, ideal: 18-20°C)`,
          accion: 'Verificar enfriador/bomba de aire'
        });
      }
    }

    // Verificar pH
    const ph = Number(um.ph);
    if (Number.isFinite(ph)) {
      const phCheck = estaFueraDeRango(ph, RANGOS_OPTIMOS.ph);
      if (phCheck.fuera) {
        acciones.push({
          prioridad: 'alta',
          icono: '🟡',
          texto: `Ajustar pH del depósito (actual: ${ph}, ideal: 5.8-6.2)`,
          accion: 'Usar pH up/down según corrección'
        });
      }
    }

    // Verificar EC según fase
    const ec = Number(um.ec);
    if (Number.isFinite(ec)) {
      const fase = getFaseActual();
      const rangoEC = fase === 'floracion' ? RANGOS_OPTIMOS.ec.floracion : RANGOS_OPTIMOS.ec.vegetativo;
      const ecCheck = estaFueraDeRango(ec, rangoEC);
      if (ecCheck.fuera) {
        acciones.push({
          prioridad: 'media',
          icono: '🟡',
          texto: `Ajustar EC (actual: ${ec} µS/cm, ideal: ${rangoEC.min}-${rangoEC.max})`,
          accion: ec < rangoEC.min ? 'Añadir nutriente' : 'Diluir con agua'
        });
      }
    }

    // Verificar HR de sala
    const hr = Number(um.humSala);
    if (Number.isFinite(hr)) {
      const hrCheck = estaFueraDeRango(hr, RANGOS_OPTIMOS.hrSala);
      if (hrCheck.fuera) {
        acciones.push({
          prioridad: 'media',
          icono: '🟡',
          texto: `Revisar HR de sala (actual: ${hr}%, ideal: 50-60%)`,
          accion: hr < 50 ? 'Aumentar humedad' : 'Mejorar ventilación'
        });
      }
    }

    // Acción diaria: medición
    const horasDesdeMedicion = um.fecha && um.hora ? 
      (Date.now() - parseMedFechaMs(um.fecha, um.hora)) / 3600000 : Infinity;
    if (horasDesdeMedicion > 24) {
      acciones.push({
        prioridad: 'alta',
        icono: '⚡',
        texto: 'Medir EC/pH del depósito',
        accion: 'Última medición hace más de 24h'
      });
    } else {
      acciones.push({
        prioridad: 'normal',
        icono: '⚡',
        texto: 'Medir EC/pH del depósito',
        accion: 'Rutina diaria'
      });
    }

    // Ordenar por prioridad
    const prioridadOrden = { critica: 0, alta: 1, media: 2, normal: 3 };
    acciones.sort((a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]);

    return acciones.slice(0, 3); // Máximo 3 acciones prioritarias
  }

  /**
   * Parsea fecha de medición a timestamp
   */
  function parseMedFechaMs(fecha, hora) {
    if (!fecha) return NaN;
    try {
      const p = String(fecha).split('/');
      if (p.length >= 3) {
        const d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
        let ms = d.getTime();
        if (hora && String(hora).trim()) {
          const hm = String(hora).match(/(\d{1,2}):(\d{2})/);
          if (hm) ms += (parseInt(hm[1], 10) * 60 + parseInt(hm[2], 10)) * 60000;
        }
        return ms;
      }
    } catch (_) {}
    return NaN;
  }

  /**
   * Genera estado actual con indicadores visuales
   */
  function generarEstadoActual(ultimaMedicion) {
    const estado = [];
    const um = ultimaMedicion;
    if (!um) return estado;

    // EC
    const ec = Number(um.ec);
    if (Number.isFinite(ec)) {
      const fase = getFaseActual();
      const rangoEC = fase === 'floracion' ? RANGOS_OPTIMOS.ec.floracion : RANGOS_OPTIMOS.ec.vegetativo;
      const ecCheck = estaFueraDeRango(ec, rangoEC);
      estado.push({
        parametro: 'EC',
        valor: Math.round(ec),
        unidad: 'µS/cm',
        rango: `${rangoEC.min}-${rangoEC.max}`,
        estado: ecCheck.ok ? 'ok' : 'warning'
      });
    }

    // pH
    const ph = Number(um.ph);
    if (Number.isFinite(ph)) {
      const phCheck = estaFueraDeRango(ph, RANGOS_OPTIMOS.ph);
      estado.push({
        parametro: 'pH',
        valor: ph.toFixed(1),
        unidad: '',
        rango: '5.8-6.2',
        estado: phCheck.ok ? 'ok' : 'warning'
      });
    }

    // Temperatura agua
    const temp = Number(um.temp);
    if (Number.isFinite(temp)) {
      const tempCheck = estaFueraDeRango(temp, RANGOS_OPTIMOS.tempAgua);
      estado.push({
        parametro: 'T° agua',
        valor: temp.toFixed(1),
        unidad: '°C',
        rango: '18-20',
        estado: tempCheck.ok ? 'ok' : temp > 24 ? 'critical' : 'warning'
      });
    }

    // HR sala
    const hr = Number(um.humSala);
    if (Number.isFinite(hr)) {
      const hrCheck = estaFueraDeRango(hr, RANGOS_OPTIMOS.hrSala);
      estado.push({
        parametro: 'HR sala',
        valor: Math.round(hr),
        unidad: '%',
        rango: '50-60',
        estado: hrCheck.ok ? 'ok' : 'warning'
      });
    }

    return estado;
  }

  /**
   * Genera próximos 7 días de tareas
   */
  function generarProximos7Dias(config, ultimaMedicion) {
    const tareas = [];
    if (!config) return tareas;

    const fase = getFaseActual();
    const diasDesdeInicio = config.fechaInicio ? 
      Math.floor((Date.now() - new Date(config.fechaInicio).getTime()) / 86400000) : 0;

    // Tarea de cambio de agua (cada 7 días desde última recarga)
    if (state.ultimaRecarga) {
      const diasRecarga = Math.floor((Date.now() - new Date(state.ultimaRecarga).getTime()) / 86400000);
      const diasProximoCambio = 7 - (diasRecarga % 7);
      if (diasProximoCambio <= 7) {
        tareas.push({
          dias: diasProximoCambio,
          texto: 'Cambio completo de agua',
          tipo: 'mantenimiento'
        });
      }
    }

    // Tareas según fase
    if (fase === 'vegetativo') {
      if (diasDesdeInicio >= 21 && diasDesdeInicio < 28) {
        tareas.push({
          dias: 0,
          texto: 'Considerar entrenamiento LST/topping',
          tipo: 'cultivo'
        });
      }
      if (diasDesdeInicio >= 28) {
        tareas.push({
          dias: 0,
          texto: 'Evaluar transición a floración',
          tipo: 'cultivo'
        });
      }
    }

    // Ordenar por días
    tareas.sort((a, b) => a.dias - b.dias);
    return tareas.slice(0, 3);
  }

  /**
   * Genera consejo del día personalizado
   */
  function generarConsejoDelDia(ultimaMedicion, config) {
    const consejos = [];
    const fase = getFaseActual();
    const um = ultimaMedicion;

    // Consejos según fase
    if (fase === 'vegetativo') {
      consejos.push('En vegetativo, mantén HR 50-60% para prevenir moho y optimizar crecimiento.');
    } else if (fase === 'floracion') {
      consejos.push('En floración, baja HR a 40-50% para prevenir moho en cogollos densos.');
    }

    // Consejos según mediciones
    if (um) {
      const temp = Number(um.temp);
      if (Number.isFinite(temp) && temp < 18) {
        consejos.push('Tu temperatura de agua está baja. Considera un calentador o ajusta la ambiente.');
      }
      if (Number.isFinite(temp) && temp > 22) {
        consejos.push('Temperatura de agua elevada. Vigila oxígeno disuelto y considera enfriador.');
      }

      const hr = Number(um.humSala);
      if (Number.isFinite(hr) && hr > 65) {
        consejos.push('HR alta en sala. Mejora ventilación para prevenir problemas de moho.');
      }
    }

    // Consejo aleatorio de cultivo
    const consejosGenerales = [
      'Revisa tus raíces semanalmente buscando signos de problemas.',
      'Mantén tu depósito opago para prevenir algas.',
      'Limpia tus piedras de aire cada 2-3 meses para mantener oxigenación óptima.',
      'Documenta cada medición para identificar patrones a tiempo.',
      'Calibra tus medidores de pH/EC mensualmente para precisión.'
    ];

    consejos.push(consejosGenerales[Math.floor(Math.random() * consejosGenerales.length)]);

    return consejos[Math.floor(Math.random() * consejos.length)];
  }

  /**
   * Renderiza el dashboard contextual
   */
  function renderDashboardContextual() {
    const container = document.getElementById('dashContextualContainer');
    if (!container) return;

    // CRÍTICO: Sincronizar con instalación activa para evitar mezclar datos
    try {
      if (typeof sincronizarUltimaMedicionYRecargaDesdeTorreActiva === 'function') {
        sincronizarUltimaMedicionYRecargaDesdeTorreActiva();
      }
    } catch (_) {}

    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    const config = state && state.configTorre ? state.configTorre : null;

    if (!um && !config) {
      container.innerHTML = '';
      container.classList.add('setup-hidden');
      return;
    }

    container.classList.remove('setup-hidden');

    const acciones = generarAccionesPrioritarias(um, config);
    const estado = generarEstadoActual(um);
    const proximos = generarProximos7Dias(config, um);
    const consejo = generarConsejoDelDia(um, config);

    let html = '<div class="dash-contextual-wrapper">';

    // Header con información del cultivo - SOLO para caminos que tienen fase de cultivo
    const fase = getFaseActual();
    const diasCultivo = config && config.fechaInicio ? 
      Math.floor((Date.now() - new Date(config.fechaInicio).getTime()) / 86400000) : 0;
    
    // Verificar si el camino de cultivo corresponde para mostrar el header
    let mostrarHeader = false;
    try {
      const camino = typeof getCaminoCultivo === 'function' ? getCaminoCultivo() : '';
      // Solo mostrar header para caminos de semilla/hidro que tienen fase de cultivo
      // NO mostrar para esqueje, madre, u otros caminos especializados
      const caminosConFaseCultivo = ['semilla_hidro', 'semilla_propagador'];
      mostrarHeader = caminosConFaseCultivo.includes(camino) && config && config.fechaInicio;
    } catch (_) {
      mostrarHeader = false;
    }
    
    if (mostrarHeader) {
      html += '<div class="dash-contextual-header">';
      html += `<h3 class="dash-contextual-title">🌿 Mi Cultivo - Día ${diasCultivo} de ${fase.charAt(0).toUpperCase() + fase.slice(1)}</h3>`;
      html += '</div>';
    }

    // Acciones prioritarias
    if (acciones.length > 0) {
      html += '<section class="dash-contextual-section dash-contextual-actions">';
      html += '<h4 class="dash-contextual-section-title">⚡ ACCIÓN HOY (prioridad alta)</h4>';
      html += '<ul class="dash-contextual-actions-list">';
      acciones.forEach(acc => {
        const prioridadClass = acc.prioridad === 'critica' ? 'critical' : acc.prioridad === 'alta' ? 'alta' : '';
        html += `<li class="dash-contextual-action ${prioridadClass}">`;
        html += `<span class="dash-contextual-action-icon">${acc.icono}</span>`;
        html += `<span class="dash-contextual-action-text">${acc.texto}</span>`;
        html += `<span class="dash-contextual-action-hint">${acc.accion}</span>`;
        html += '</li>';
      });
      html += '</ul>';
      html += '</section>';
    }

    // Estado actual
    if (estado.length > 0) {
      html += '<section class="dash-contextual-section dash-contextual-estado">';
      html += '<h4 class="dash-contextual-section-title">📊 ESTADO ACTUAL</h4>';
      html += '<div class="dash-contextual-estado-grid">';
      estado.forEach(est => {
        const estadoIcon = est.estado === 'ok' ? '✅' : est.estado === 'critical' ? '🔴' : '⚠️';
        const estadoClass = est.estado === 'ok' ? 'ok' : est.estado === 'critical' ? 'critical' : 'warning';
        html += `<div class="dash-contextual-estado-item ${estadoClass}">`;
        html += `<span class="dash-contextual-estado-param">${est.parametro}</span>`;
        html += `<span class="dash-contextual-estado-val">${est.valor} <span class="dash-contextual-estado-unit">${est.unidad}</span></span>`;
        html += `<span class="dash-contextual-estado-range">${estadoIcon} (rango: ${est.rango})</span>`;
        html += '</div>';
      });
      html += '</div>';
      html += '</section>';
    }

    // Próximos 7 días
    if (proximos.length > 0) {
      html += '<section class="dash-contextual-section dash-contextual-proximos">';
      html += '<h4 class="dash-contextual-section-title">📅 PRÓXIMOS 7 DÍAS</h4>';
      html += '<ul class="dash-contextual-proximos-list">';
      proximos.forEach(tar => {
        const diaTexto = tar.dias === 0 ? 'Hoy' : tar.dias === 1 ? 'Mañana' : `En ${tar.dias} días`;
        html += `<li class="dash-contextual-proximo">`;
        html += `<span class="dash-contextual-proximo-dia">${diaTexto}</span>`;
        html += `<span class="dash-contextual-proximo-texto">${tar.texto}</span>`;
        html += '</li>';
      });
      html += '</ul>';
      html += '</section>';
    }

    // Consejo del día
    html += '<section class="dash-contextual-section dash-contextual-consejo">';
    html += '<h4 class="dash-contextual-section-title">💡 CONSEJO DEL DÍA</h4>';
    html += `<p class="dash-contextual-consejo-texto">${consejo}</p>`;
    html += '</section>';

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Inicializa el dashboard contextual
   */
  function initDashboardContextual() {
    // Crear contenedor si no existe
    let container = document.getElementById('dashContextualContainer');
    if (!container) {
      const dashOperativa = document.getElementById('dashOperativaHub');
      if (dashOperativa) {
        container = document.createElement('div');
        container.id = 'dashContextualContainer';
        container.className = 'dash-contextual-container';
        dashOperativa.parentNode.insertBefore(container, dashOperativa);
      }
    }

    // Renderizar inicialmente
    renderDashboardContextual();

    // Actualizar cuando cambie el estado
    const originalRefresh = window.refreshDashOperativaHub;
    if (typeof originalRefresh === 'function') {
      window.refreshDashOperativaHub = function () {
        originalRefresh();
        renderDashboardContextual();
      };
    }
  }

  // Exponer funciones globalmente
  window.renderDashboardContextual = renderDashboardContextual;
  window.initDashboardContextual = initDashboardContextual;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboardContextual);
  } else {
    initDashboardContextual();
  }

})();
