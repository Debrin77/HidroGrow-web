/**
 * Sistema de Alertas Inteligentes
 * Mejora sustancial: Alertas proactivas con contexto y acciones recomendadas
 * Versión: 1.0.0
 */
(function () {
  'use strict';

  // Constantes para umbrales de alerta
  const UMBRALES_ALERTA = {
    tempAgua: {
      critico: 24, // °C - acción inmediata
      advertencia: 22, // °C - revisar pronto
      ideal: { min: 18, max: 20 }
    },
    ph: {
      critico: 0.5, // desviación del rango ideal
      ideal: { min: 5.8, max: 6.2 }
    },
    ec: {
      advertencia: 300, // desviación del rango ideal
      vegetativo: { min: 1000, max: 1600 },
      floracion: { min: 1200, max: 2000 }
    },
    hrSala: {
      advertencia: 10, // desviación del rango ideal
      ideal: { min: 50, max: 60 }
    },
    tiempoSinMedicion: {
      advertencia: 48, // horas
      critico: 72 // horas
    }
  };

  // Almacenamiento de alertas activas
  let alertasActivas = [];
  let alertasDescartadas = new Set();

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
  function verificarRango(valor, rango, umbralAdvertencia = 0) {
    if (!Number.isFinite(valor)) return { ok: false, fuera: false, gravedad: 'desconocido' };
    
    const min = rango.min;
    const max = rango.max;
    const ok = valor >= min && valor <= max;
    
    if (!ok) {
      const desviacion = Math.min(Math.abs(valor - min), Math.abs(valor - max));
      if (desviacion > umbralAdvertencia) {
        return { ok: false, fuera: true, gravedad: 'critico' };
      }
      return { ok: false, fuera: true, gravedad: 'advertencia' };
    }
    
    return { ok: true, fuera: false, gravedad: 'ok' };
  }

  /**
   * Genera alertas basadas en la última medición
   */
  function generarAlertas(ultimaMedicion, config) {
    const alertas = [];
    const um = ultimaMedicion;
    if (!um) return alertas;

    const fase = getFaseActual();

    // Alerta de temperatura del agua
    const tempAgua = Number(um.temp);
    if (Number.isFinite(tempAgua)) {
      if (tempAgua > UMBRALES_ALERTA.tempAgua.critico) {
        alertas.push({
          id: 'temp_agua_critica',
          severidad: 'critica',
          titulo: '🔴 Temperatura del depósito CRÍTICA',
          mensaje: `La temperatura del agua es ${tempAgua}°C, muy por encima del rango ideal (18-20°C).`,
          porque: 'Temperaturas altas reducen el oxígeno disuelto y pueden causar pudrición de raíces en horas.',
          queHacer: 'Verificar enfriador, bomba de aire, y temperatura ambiente. Considerar añadir hielo si es urgente.',
          prevencion: 'Mantener temperatura ambiente < 25°C y asegurar ventilación adecuada del depósito.'
        });
      } else if (tempAgua > UMBRALES_ALERTA.tempAgua.advertencia) {
        alertas.push({
          id: 'temp_agua_advertencia',
          severidad: 'advertencia',
          titulo: '🟡 Temperatura del depósito elevada',
          mensaje: `La temperatura del agua es ${tempAgua}°C, ligeramente por encima del ideal (18-20°C).`,
          porque: 'Temperaturas elevadas reducen oxígeno disuelto y estresan las plantas.',
          queHacer: 'Verificar ventilación del depósito y considerar ajustar temperatura ambiente.',
          prevencion: 'Monitorear temperatura diariamente, especialmente en días calurosos.'
        });
      }
    }

    // Alerta de pH
    const ph = Number(um.ph);
    if (Number.isFinite(ph)) {
      const phCheck = verificarRango(ph, UMBRALES_ALERTA.ph.ideal, UMBRALES_ALERTA.ph.critico);
      if (phCheck.fuera && phCheck.gravedad === 'critico') {
        alertas.push({
          id: 'ph_critico',
          severidad: 'critica',
          titulo: '🔴 pH del depósito CRÍTICO',
          mensaje: `El pH es ${ph}, muy fuera del rango ideal (5.8-6.2).`,
          porque: 'pH extremo bloquea absorción de nutrientes y puede dañar raíces rápidamente.',
          queHacer: 'Ajustar pH inmediatamente usando pH up/down. Corregir gradualmente para no shockear plantas.',
          prevencion: 'Medir pH diariamente y mantener solución buffer adecuada.'
        });
      } else if (phCheck.fuera) {
        alertas.push({
          id: 'ph_advertencia',
          severidad: 'advertencia',
          titulo: '🟡 pH del depósito fuera de rango',
          mensaje: `El pH es ${ph}, fuera del rango ideal (5.8-6.2).`,
          porque: 'pH fuera de rango reduce absorción de nutrientes y afecta crecimiento.',
          queHacer: 'Ajustar pH usando pH up/down según corrección recomendada.',
          prevencion: 'Calibrar medidor de pH mensualmente para precisión.'
        });
      }
    }

    // Alerta de EC según fase
    const ec = Number(um.ec);
    if (Number.isFinite(ec)) {
      const rangoEC = fase === 'floracion' ? UMBRALES_ALERTA.ec.floracion : UMBRALES_ALERTA.ec.vegetativo;
      const ecCheck = verificarRango(ec, rangoEC, UMBRALES_ALERTA.ec.advertencia);
      if (ecCheck.fuera) {
        const accion = ec < rangoEC.min ? 'Añadir nutriente gradualmente' : 'Diluir con agua pH ajustado';
        alertas.push({
          id: 'ec_advertencia',
          severidad: 'advertencia',
          titulo: '🟡 EC del depósito fuera de rango',
          mensaje: `El EC es ${ec} µS/cm, fuera del rango ideal para ${fase} (${rangoEC.min}-${rangoEC.max}).`,
          porque: 'EC incorrecto causa deficiencias o toxicidad de nutrientes.',
          queHacer: accion,
          prevencion: 'Medir EC diariamente y ajustar según fase de cultivo.'
        });
      }
    }

    // Alerta de HR de sala
    const hr = Number(um.humSala);
    if (Number.isFinite(hr)) {
      const hrCheck = verificarRango(hr, UMBRALES_ALERTA.hrSala.ideal, UMBRALES_ALERTA.hrSala.advertencia);
      if (hrCheck.fuera) {
        const accion = hr < UMBRALES_ALERTA.hrSala.ideal.min ? 'Aumentar humedad (humidificador)' : 'Mejorar ventilación/extractor';
        alertas.push({
          id: 'hr_advertencia',
          severidad: 'advertencia',
          titulo: '🟡 HR de sala fuera de rango',
          mensaje: `La HR es ${hr}%, fuera del rango ideal (50-60%).`,
          porque: 'HR inadecuada afecta transpiración y puede causar moho o estrés.',
          queHacer: accion,
          prevencion: 'Monitorear HR diariamente y ajustar ventilación según fase.'
        });
      }
    }

    // Alerta de tiempo sin medición
    const horasDesdeMedicion = um.fecha && um.hora ? 
      (Date.now() - parseMedFechaMs(um.fecha, um.hora)) / 3600000 : Infinity;
    if (Number.isFinite(horasDesdeMedicion)) {
      if (horasDesdeMedicion > UMBRALES_ALERTA.tiempoSinMedicion.critico) {
        alertas.push({
          id: 'sin_medicion_critico',
          severidad: 'critica',
          titulo: '🔴 Sin medición por más de 72 horas',
          mensaje: `Última medición hace ${Math.floor(horasDesdeMedicion)} horas.`,
          porque: 'Sin monitoreo, problemas pueden desarrollarse sin detección.',
          queHacer: 'Medir EC/pH/temperatura del depósito inmediatamente.',
          prevencion: 'Establecer rutina diaria de medición a la misma hora.'
        });
      } else if (horasDesdeMedicion > UMBRALES_ALERTA.tiempoSinMedicion.advertencia) {
        alertas.push({
          id: 'sin_medicion_advertencia',
          severidad: 'advertencia',
          titulo: '🟡 Medición pendiente',
          mensaje: `Última medición hace ${Math.floor(horasDesdeMedicion)} horas.`,
          porque: 'Monitoreo regular es esencial para detectar problemas a tiempo.',
          queHacer: 'Medir EC/pH/temperatura del depósito hoy.',
          prevencion: 'Establecer recordatorio diario para medición.'
        });
      }
    }

    return alertas;
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
   * Renderiza las alertas en el UI
   */
  function renderAlertas() {
    const container = document.getElementById('alertasInteligentesContainer');
    if (!container) return;

    // CRÍTICO: Sincronizar con instalación activa para evitar mezclar datos
    try {
      if (typeof sincronizarUltimaMedicionYRecargaDesdeTorreActiva === 'function') {
        sincronizarUltimaMedicionYRecargaDesdeTorreActiva();
      }
    } catch (_) {}

    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    const config = state && state.configTorre ? state.configTorre : null;

    if (!um) {
      container.innerHTML = '';
      container.classList.add('setup-hidden');
      return;
    }

    const alertas = generarAlertas(um, config);
    
    // Filtrar alertas descartadas
    const alertasFiltradas = alertas.filter(a => !alertasDescartadas.has(a.id));

    if (alertasFiltradas.length === 0) {
      container.innerHTML = '<p class="alertas-sin-problemas">✅ Todo en orden. No hay alertas activas.</p>';
      container.classList.remove('setup-hidden');
      return;
    }

    container.classList.remove('setup-hidden');

    let html = '<div class="alertas-inteligentes-wrapper">';
    html += '<h4 class="alertas-titulo">🔔 Alertas Activas</h4>';
    html += '<div class="alertas-lista">';

    alertasFiltradas.forEach(alerta => {
      const severidadClass = alerta.severidad === 'critica' ? 'critica' : 'advertencia';
      html += `<div class="alerta-item ${severidadClass}" data-alerta-id="${alerta.id}">`;
      html += `<div class="alerta-header">`;
      html += `<h5 class="alerta-titulo">${alerta.titulo}</h5>`;
      html += `<button type="button" class="alerta-descartar" onclick="descartarAlerta('${alerta.id}')">✕</button>`;
      html += `</div>`;
      html += `<p class="alerta-mensaje">${alerta.mensaje}</p>`;
      html += `<div class="alerta-detalles">`;
      html += `<div class="alerta-detalle">`;
      html += `<strong>Por qué:</strong> ${alerta.porque}`;
      html += `</div>`;
      html += `<div class="alerta-detalle">`;
      html += `<strong>Qué hacer:</strong> ${alerta.queHacer}`;
      html += `</div>`;
      html += `<div class="alerta-detalle">`;
      html += `<strong>Prevención:</strong> ${alerta.prevencion}`;
      html += `</div>`;
      html += `</div>`;
      html += `</div>`;
    });

    html += '</div>';
    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Descarta una alerta
   */
  function descartarAlerta(alertaId) {
    alertasDescartadas.add(alertaId);
    renderAlertas();
    
    // Guardar en localStorage
    try {
      const descartadas = Array.from(alertasDescartadas);
      localStorage.setItem('hc_alertas_descartadas', JSON.stringify(descartadas));
    } catch (_) {}
  }

  /**
   * Carga alertas descartadas desde localStorage
   */
  function cargarAlertasDescartadas() {
    try {
      const guardadas = localStorage.getItem('hc_alertas_descartadas');
      if (guardadas) {
        alertasDescartadas = new Set(JSON.parse(gardadas));
      }
    } catch (_) {}
  }

  /**
   * Limpia alertas descartadas (nuevo día)
   */
  function limpiarAlertasDescartadas() {
    const ultimaLimpieza = localStorage.getItem('hc_alertas_ultima_limpieza');
    const hoy = new Date().toDateString();
    
    if (ultimaLimpieza !== hoy) {
      alertasDescartadas.clear();
      localStorage.setItem('hc_alertas_descartadas', JSON.stringify([]));
      localStorage.setItem('hc_alertas_ultima_limpieza', hoy);
    }
  }

  /**
   * Inicializa el sistema de alertas
   */
  function initAlertasInteligentes() {
    // Crear contenedor si no existe
    let container = document.getElementById('alertasInteligentesContainer');
    if (!container) {
      const dashOperativa = document.getElementById('dashOperativaHub');
      if (dashOperativa) {
        container = document.createElement('div');
        container.id = 'alertasInteligentesContainer';
        container.className = 'alertas-inteligentes-container';
        dashOperativa.parentNode.insertBefore(container, dashOperativa);
      }
    }

    // Cargar estado
    cargarAlertasDescartadas();
    limpiarAlertasDescartadas();

    // Renderizar inicialmente
    renderAlertas();

    // Actualizar cuando cambie el estado
    const originalRefresh = window.refreshDashOperativaHub;
    if (typeof originalRefresh === 'function') {
      window.refreshDashOperativaHub = function () {
        originalRefresh();
        renderAlertas();
      };
    }

    // Actualizar periódicamente (cada 5 minutos)
    setInterval(renderAlertas, 5 * 60 * 1000);
  }

  // Exponer funciones globalmente
  window.renderAlertas = renderAlertas;
  window.descartarAlerta = descartarAlerta;
  window.initAlertasInteligentes = initAlertasInteligentes;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAlertasInteligentes);
  } else {
    initAlertasInteligentes();
  }

})();
