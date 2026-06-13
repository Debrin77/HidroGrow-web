/**
 * Barras de Rango Visuales para Mediciones
 * Mejora sustancial: Barras de rango visuales en todas las mediciones
 * Versión: 1.0.0
 */
(function () {
  'use strict';

  /**
   * Obtiene el rango óptimo para un parámetro
   */
  function obtenerRangoOptimo(parametro) {
    try {
      const cfg = state && state.configTorre ? state.configTorre : {};
      
      switch (parametro) {
        case 'ec':
          if (typeof getECOptimaTorre === 'function') {
            const ec = getECOptimaTorre();
            if (ec && ec.min != null && ec.max != null) {
              return { min: ec.min, max: ec.max, unit: 'µS/cm' };
            }
          }
          return { min: 800, max: 1400, unit: 'µS/cm' };
          
        case 'ph':
          if (typeof getNutrienteTorre === 'function' && typeof torreGetPhRangoObjetivo === 'function') {
            const nut = getNutrienteTorre();
            const phR = torreGetPhRangoObjetivo(nut, cfg);
            if (phR && phR.length >= 2) {
              return { min: phR[0], max: phR[1], unit: '' };
            }
          }
          return { min: 5.5, max: 6.5, unit: '' };
          
        case 'temp':
          return { min: 18, max: 24, unit: '°C' };
          
        case 'tempAire':
          return { min: 20, max: 28, unit: '°C' };
          
        case 'humSala':
          return { min: 50, max: 70, unit: '%' };
          
        case 'vpd':
          return { min: 0.8, max: 1.2, unit: 'kPa' };
          
        case 'ppfd':
          return { min: 400, max: 800, unit: 'µmol' };
          
        case 'co2':
          return { min: 400, max: 1200, unit: 'ppm' };
          
        default:
          return null;
      }
    } catch (e) {
      console.error('Error obteniendo rango óptimo:', e);
      return null;
    }
  }

  /**
   * Calcula el porcentaje del valor en el rango
   */
  function calcularPorcentajeEnRango(valor, rango) {
    if (!rango || valor == null) return 0;
    
    const min = rango.min;
    const max = rango.max;
    const margin = (max - min) * 0.2; // 20% de margen
    
    const rangoExtendidoMin = min - margin;
    const rangoExtendidoMax = max + margin;
    const rangoTotal = rangoExtendidoMax - rangoExtendidoMin;
    
    const porcentaje = ((valor - rangoExtendidoMin) / rangoTotal) * 100;
    return Math.max(0, Math.min(100, porcentaje));
  }

  /**
   * Determina el estado del valor (ok, warn, alert)
   */
  function determinarEstado(valor, rango) {
    if (!rango || valor == null) return 'empty';
    
    const min = rango.min;
    const max = rango.max;
    const margin = (max - min) * 0.1; // 10% de margen para advertencia
    
    if (valor < min - margin || valor > max + margin) {
      return 'alert';
    } else if (valor < min || valor > max) {
      return 'warn';
    }
    return 'ok';
  }

  /**
   * Renderiza la barra de rango visual para una tarjeta
   */
  function renderizarBarraRango(cardId, parametro) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const rango = obtenerRangoOptimo(parametro);
    if (!rango) return;
    
    // Obtener valor actual del input
    const inputId = card.querySelector('.param-input')?.id;
    const input = document.getElementById(inputId);
    const valor = input ? parseFloat(input.value) : null;
    
    // Calcular porcentaje y estado
    const porcentaje = valor != null ? calcularPorcentajeEnRango(valor, rango) : 0;
    const estado = valor != null ? determinarEstado(valor, rango) : 'empty';
    
    // Crear barra de rango si no existe
    let barraContainer = card.querySelector('.param-range-bar-container');
    if (!barraContainer) {
      barraContainer = document.createElement('div');
      barraContainer.className = 'param-range-bar-container';
      
      // Insertar después del param-header
      const header = card.querySelector('.param-header');
      if (header) {
        header.insertAdjacentElement('afterend', barraContainer);
      }
    }
    
    // Renderizar barra
    barraContainer.innerHTML = `
      <div class="param-range-bar">
        <div class="param-range-bar-fill ${estado}" style="width: ${porcentaje}%"></div>
      </div>
      <div class="param-range-markers">
        <span>${rango.min}${rango.unit}</span>
        <span>${rango.max}${rango.unit}</span>
      </div>
    `;
    
    // Actualizar clase de la tarjeta según estado
    card.classList.remove('ok', 'warn', 'alert', 'empty');
    if (estado !== 'empty') {
      card.classList.add(estado);
    }
  }

  /**
   * Renderiza barras de rango para todas las tarjetas de parámetros
   */
  function renderizarBarrasRango() {
    // CRÍTICO: Sincronizar con instalación activa para evitar mezclar datos
    try {
      if (typeof sincronizarUltimaMedicionYRecargaDesdeTorreActiva === 'function') {
        sincronizarUltimaMedicionYRecargaDesdeTorreActiva();
      }
    } catch (_) {}

    // Mapeo de card IDs a parámetros
    const cards = [
      { id: 'cardEC', param: 'ec' },
      { id: 'cardPH', param: 'ph' },
      { id: 'cardTemp', param: 'temp' },
      { id: 'cardVol', param: 'vol' },
      { id: 'cardTempAire', param: 'tempAire' },
      { id: 'cardHumSala', param: 'humSala' },
      { id: 'cardVPD', param: 'vpd' },
      { id: 'cardPPFD', param: 'ppfd' },
      { id: 'cardTempExt', param: 'tempExt' },
      { id: 'cardCO2', param: 'co2' }
    ];
    
    cards.forEach(({ id, param }) => {
      renderizarBarraRango(id, param);
    });
  }

  /**
   * Añade listeners a los inputs para actualizar las barras en tiempo real
   */
  function añadirListenersInputs() {
    const inputs = document.querySelectorAll('.param-input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const card = input.closest('.param-card');
        if (card) {
          const cardId = card.id;
          // Determinar parámetro basado en el ID del card
          const paramMap = {
            'cardEC': 'ec',
            'cardPH': 'ph',
            'cardTemp': 'temp',
            'cardVol': 'vol',
            'cardTempAire': 'tempAire',
            'cardHumSala': 'humSala',
            'cardVPD': 'vpd',
            'cardPPFD': 'ppfd',
            'cardTempExt': 'tempExt',
            'cardCO2': 'co2'
          };
          const param = paramMap[cardId];
          if (param) {
            renderizarBarraRango(cardId, param);
          }
        }
      });
    });
  }

  /**
   * Inicializa las barras de rango visuales
   */
  function initBarrasRango() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          renderizarBarrasRango();
          añadirListenersInputs();
        }, 500);
      });
    } else {
      setTimeout(() => {
        renderizarBarrasRango();
        añadirListenersInputs();
      }, 500);
    }
    
    // Actualizar cuando cambie de pestaña a mediciones
    if (typeof goTab === 'function') {
      const originalGoTab = window.goTab;
      window.goTab = function (tabId) {
        originalGoTab(tabId);
        if (tabId === 'mediciones') {
          setTimeout(renderizarBarrasRango, 300);
        }
      };
    }
    
    // Actualizar periódicamente (cada 30 segundos)
    setInterval(renderizarBarrasRango, 30000);
  }

  // Exponer funciones globalmente
  window.renderizarBarrasRango = renderizarBarrasRango;
  window.initBarrasRango = initBarrasRango;

  // Inicializar
  initBarrasRango();

})();
