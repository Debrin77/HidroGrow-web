/**
 * Motor de Consejos Personalizados
 * Mejora sustancial: Consejos contextuales basados en fase, genética, mediciones y preferencias
 * Versión: 1.0.0
 */
(function () {
  'use strict';

  // Base de conocimientos de consejos
  const BASE_CONSEJOS = {
    vegetativo: {
      general: [
        'En vegetativo, mantén HR 50-60% para prevenir moho y optimizar crecimiento.',
        'El fotoperiodio ideal en vegetativo es 18/6 para máximo crecimiento.',
        'En vegetativo, EC gradual de 1000-1600 µS/cm según genética.',
        'Realiza entrenamiento LST/topping en días 21-28 para mejor estructura.',
        'Mantén temperatura ambiente 22-28°C en vegetativo.',
        'Revisa raíces semanalmente buscando signos de problemas.',
        'En vegetativo, riega cuando el 30% del volumen se haya consumido.'
      ],
      ec_bajo: [
        'Tu EC está bajo. Añade nutriente gradualmente (100-200 µS/cm cada 2 días).',
        'EC bajo en vegetativo puede causar crecimiento lento. Aumenta gradualmente.',
        'Para subir EC, añadir A+B en proporción 1:1 según fabricante.'
      ],
      ec_alto: [
        'Tu EC está alto. Diluye con agua pH ajustado a 5.8-6.0.',
        'EC alto puede causar quemaduras de nutrientes. Diluye gradualmente.',
        'Si EC persiste alto, considera cambio parcial de agua (50%).'
      ],
      ph_bajo: [
        'pH bajo bloquea absorción de macronutrientes. Ajusta con pH up.',
        'pH < 5.8 reduce disponibilidad de N, P, K, Ca, Mg. Ajusta a 5.8-6.0.',
        'Usa pH up (KOH) gradualmente, 0.1-0.2 a la vez.'
      ],
      ph_alto: [
        'pH alto bloquea absorción de micronutrientes. Ajusta con pH down.',
        'pH > 6.2 reduce disponibilidad de Fe, Mn, Zn, Cu. Ajusta a 5.8-6.0.',
        'Usa pH down (ácido fosfórico) gradualmente, 0.1-0.2 a la vez.'
      ],
      temp_agua_baja: [
        'Temperatura de agua baja (<18°C) reduce metabolismo. Considera calentador.',
        'Agua fría reduce absorción de nutrientes y oxigenación.',
        'Si no puedes calentar, reduce EC ligeramente para compensar.'
      ],
      temp_agua_alta: [
        'Temperatura de agua alta (>22°C) reduce oxígeno disuelto. Prioridad alta.',
        'Agua caliente = riesgo de pudrición de raíces. Actúa rápido.',
        'Mejora ventilación del depósito o considera enfriador.'
      ],
      hr_baja: [
        'HR baja (<50%) aumenta transpiración y estrés. Aumenta humedad.',
        'HR baja en vegetativo reduce crecimiento. Usa humidificador.',
        'Si no puedes aumentar HR, reduce temperatura ligeramente.'
      ],
      hr_alta: [
        'HR alta (>60%) en vegetativo puede causar moho. Mejora ventilación.',
        'HR alta + temperatura = riesgo de moho. Ventila más.',
        'Considera deshumidificador si HR persiste alta.'
      ]
    },
    floracion: {
      general: [
        'En floración, baja HR a 40-50% para prevenir moho en cogollos.',
        'El fotoperiodio en floración es 12/12 estricto. Sin fugas de luz.',
        'En floración, EC gradual de 1200-2000 µS/cm según genética.',
        'En días 21-35 de floración, considera defoliación ligera.',
        'Mantén temperatura ambiente 20-26°C en floración.',
        'En floración, riega cuando el 40% del volumen se haya consumido.',
        'Evita entrenamientos agresivos después de semana 3 de floración.'
      ],
      ec_bajo: [
        'Tu EC está bajo para floración. Aumenta gradualmente a 1400-1600.',
        'EC bajo en floración reduce densidad de cogollos. Aumenta nutriente.',
        'Para subir EC en floración, prioriza boosters de P/K.'
      ],
      ec_alto: [
        'Tu EC está alto para floración. Diluye con agua pH ajustado.',
        'EC alto en floración puede quemar cogollos. Diluye gradualmente.',
        'Si EC persiste alto, cambio parcial de agua (30-50%).'
      ],
      ph_bajo: [
        'pH bajo en floración afecta absorción de P/K críticos. Ajusta.',
        'pH < 5.8 reduce disponibilidad de P, K, Ca en floración. Ajusta.',
        'Ajusta pH a 5.8-6.0 para máxima absorción en floración.'
      ],
      ph_alto: [
        'pH alto en floración bloquea micronutrientes esenciales. Ajusta.',
        'pH > 6.2 reduce disponibilidad de Fe, Mn, Zn. Ajusta a 5.8-6.0.',
        'Mantén pH estable en floración para máxima calidad.'
      ],
      temp_agua_baja: [
        'Temperatura de agua baja en floración reduce metabolismo. Calienta.',
        'Agua fría en floración reduce producción de resina. Calienta.',
        'Temperatura óptima: 18-20°C para máxima calidad.'
      ],
      temp_agua_alta: [
        'Temperatura de agua alta en floración es crítico. Actúa rápido.',
        'Agua caliente en floración degrada terpenos y calidad. Enfría.',
        'Prioridad máxima: bajar temperatura del agua.'
      ],
      hr_baja: [
        'HR muy baja (<40%) en floración estresa plantas. Aumenta ligeramente.',
        'HR < 40% reduce transpiración y absorción. Aumenta a 40-45%.',
        'Balance: HR 40-50% en floración para prevenir moho sin estrés.'
      ],
      hr_alta: [
        'HR alta (>50%) en floración es peligroso para cogollos. Baja.',
        'HR alta en floración = moho en cogollos. Baja a 40-45%.',
        'Uso de deshumidificador es casi obligatorio en floración.'
      ]
    },
    germinacion: {
      general: [
        'En germinación, mantén HR 70-80% en domo para éxito.',
        'Temperatura óptima para germinación: 22-25°C.',
        'No añadir nutrientes hasta que aparezcan primeras hojas verdaderas.',
        'Luz suave (18/6) después de que radícula emerja.',
        'pH del agua para germinación: 5.5-6.0.',
        'No manipular semillas después de que radícula aparezca.'
      ],
      temp_agua_baja: [
        'Temperatura baja retrasa germinación. Calienta a 22-25°C.',
        'Germinación lenta por temperatura fría. Usa alfombrilla térmica.'
      ],
      temp_agua_alta: [
        'Temperatura alta puede cocinar semillas. Enfría a 22-25°C.',
        'Temperatura > 28°C en germinación es peligrosa. Enfría.'
      ]
    },
    enraizado: {
      general: [
        'En enraizado, mantén HR 70-80% en domo los primeros 5 días.',
        'Luz tenue (18/6) durante enraizado para evitar estrés.',
        'No añadir nutrientes hasta que raíces toquen el agua.',
        'pH del agua para enraizado: 5.5-6.0.',
        'Ventila domo gradualmente: 30s día 1, aumentando cada día.',
        'No manipular esquejes durante enraizado.'
      ],
      hr_baja: [
        'HR baja en enraizado causa deshidratación. Aumenta a 70-80%.',
        'Sin HR alta, esquejes se marchitan. Mantén domo cerrado.'
      ]
    },
    madre: {
      general: [
        'Planta madre en 18/6 permanente para producción continua.',
        'EC moderado para madre: 800-1200 µS/cm.',
        'Poda madre 14-21 días antes de tomar esquejes.',
        'Renueva planta madre cada 6-12 meses para vitalidad.',
        'Mantén HR 50-60% para madre saludable.',
        'No entrenamientos agresivos en madre.'
      ],
      ec_alto: [
        'EC alto en madre puede causar crecimiento excesivo. Reduce.',
        'Madre no necesita EC alto. Mantén 800-1200 µS/cm.'
      ]
    }
  };

  // Consejos por grupo de genética
  const CONSEJOS_GENETICA = {
    indica: [
      'Las Índicas prefieren EC ligeramente más bajo (1200-1600 µS/cm).',
      'Índicas son más compactas, menos LST necesario.',
      'Índicas toleran mejor temperaturas ligeramente más altas.',
      'Ciclo de Índica más corto (8-10 semanas floración).'
    ],
    sativa: [
      'Las Sativas prefieren EC más alto (1300-2300 µS/cm).',
      'Sativas necesitan más entrenamiento LST por estructura vertical.',
      'Sativas son más sensibles a exceso de nutrientes.',
      'Ciclo de Sativa más largo (10-14 semanas floración).'
    ],
    hibrida: [
      'Las Híbridas son versátiles. Ajusta según fenotipo dominante.',
      'Observa respuesta de la planta para ajustar EC.',
      'Híbridas suelen tener ciclos intermedios (9-11 semanas).'
    ],
    autofloreciente: [
      'Autoflorecientes no necesitan cambio de fotoperiodo (18/6 o 20/4).',
      'EC más bajo para autos (1000-1600 µS/cm máximo).',
      'Autos son más sensibles a trasplantes y estrés.',
      'No entrenamientos agresivos en autoflorecientes.',
      'Ciclo de autos más corto (60-90 días total).'
    ],
    cbd: [
      'Variedades CBD prefieren EC más bajo (1000-1600 µS/cm).',
      'CBD suele tener perfiles más suaves de terpenos.',
      'Mantener condiciones estables para máxima producción de CBD.'
    ]
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
   * Obtiene el grupo de genética
   */
  function getGrupoGenetica() {
    try {
      const cfg = state && state.configTorre ? state.configTorre : {};
      if (cfg.grupoCultivo) return cfg.grupoCultivo;
    } catch (_) {}
    return 'hibrida'; // default
  }

  /**
   * Analiza el estado actual y determina qué consejos aplicar
   */
  function analizarEstado(ultimaMedicion) {
    const um = ultimaMedicion;
    if (!um) return { estado: 'sin_datos' };

    const analisis = {
      ec: Number(um.ec),
      ph: Number(um.ph),
      tempAgua: Number(um.temp),
      hrSala: Number(um.humSala),
      tempAire: Number(um.tempAire)
    };

    const fase = getFaseActual();
    const condiciones = [];

    // Análisis EC
    if (Number.isFinite(analisis.ec)) {
      const rangoEC = fase === 'floracion' ? { min: 1200, max: 2000 } : { min: 1000, max: 1600 };
      if (analisis.ec < rangoEC.min) condiciones.push('ec_bajo');
      else if (analisis.ec > rangoEC.max) condiciones.push('ec_alto');
    }

    // Análisis pH
    if (Number.isFinite(analisis.ph)) {
      if (analisis.ph < 5.8) condiciones.push('ph_bajo');
      else if (analisis.ph > 6.2) condiciones.push('ph_alto');
    }

    // Análisis temperatura agua
    if (Number.isFinite(analisis.tempAgua)) {
      if (analisis.tempAgua < 18) condiciones.push('temp_agua_baja');
      else if (analisis.tempAgua > 22) condiciones.push('temp_agua_alta');
    }

    // Análisis HR sala
    if (Number.isFinite(analisis.hrSala)) {
      const rangoHR = fase === 'floracion' ? { min: 40, max: 50 } : { min: 50, max: 60 };
      if (analisis.hrSala < rangoHR.min) condiciones.push('hr_baja');
      else if (analisis.hrSala > rangoHR.max) condiciones.push('hr_alta');
    }

    return { estado: 'con_datos', condiciones, analisis };
  }

  /**
   * Genera consejo personalizado
   */
  function generarConsejoPersonalizado() {
    const fase = getFaseActual();
    const grupo = getGrupoGenetica();
    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    const analisis = analizarEstado(um);

    let consejos = [];

    // Consejos específicos según condiciones
    if (analisis.estado === 'con_datos' && analisis.condiciones.length > 0) {
      const faseConsejos = BASE_CONSEJOS[fase] || BASE_CONSEJOS.vegetativo;
      analisis.condiciones.forEach(cond => {
        if (faseConsejos[cond]) {
          consejos = consejos.concat(faseConsejos[cond]);
        }
      });
    }

    // Consejos generales de la fase
    const faseConsejos = BASE_CONSEJOS[fase] || BASE_CONSEJOS.vegetativo;
    if (faseConsejos.general) {
      consejos = consejos.concat(faseConsejos.general);
    }

    // Consejos de genética
    if (CONSEJOS_GENETICA[grupo]) {
      consejos = consejos.concat(CONSEJOS_GENETICA[grupo]);
    }

    // Seleccionar consejo aleatorio
    if (consejos.length > 0) {
      return consejos[Math.floor(Math.random() * consejos.length)];
    }

    // Consejo por defecto
    return 'Mantén rutina diaria de medición para optimizar tu cultivo.';
  }

  /**
   * Genera múltiples consejos para mostrar
   */
  function generarConsejosMultiples(cantidad = 3) {
    const fase = getFaseActual();
    const grupo = getGrupoGenetica();
    const um = state && state.ultimaMedicion ? state.ultimaMedicion : null;
    const analisis = analizarEstado(um);

    let consejos = [];
    const usados = new Set();

    // Consejos específicos según condiciones (prioridad alta)
    if (analisis.estado === 'con_datos' && analisis.condiciones.length > 0) {
      const faseConsejos = BASE_CONSEJOS[fase] || BASE_CONSEJOS.vegetativo;
      analisis.condiciones.forEach(cond => {
        if (faseConsejos[cond]) {
          faseConsejos[cond].forEach(consejo => {
            if (!usados.has(consejo) && consejos.length < cantidad) {
              consejos.push({ texto: consejo, prioridad: 'alta', categoria: cond });
              usados.add(consejo);
            }
          });
        }
      });
    }

    // Consejos generales de la fase
    const faseConsejos = BASE_CONSEJOS[fase] || BASE_CONSEJOS.vegetativo;
    if (faseConsejos.general) {
      faseConsejos.general.forEach(consejo => {
        if (!usados.has(consejo) && consejos.length < cantidad) {
          consejos.push({ texto: consejo, prioridad: 'media', categoria: 'general' });
          usados.add(consejo);
        }
      });
    }

    // Consejos de genética
    if (CONSEJOS_GENETICA[grupo] && consejos.length < cantidad) {
      CONSEJOS_GENETICA[grupo].forEach(consejo => {
        if (!usados.has(consejo) && consejos.length < cantidad) {
          consejos.push({ texto: consejo, prioridad: 'baja', categoria: 'genetica' });
          usados.add(consejo);
        }
      });
    }

    return consejos.slice(0, cantidad);
  }

  /**
   * Renderiza el widget de consejos
   */
  function renderConsejosWidget() {
    const container = document.getElementById('consejosMotorContainer');
    if (!container) return;
    
    // Ocultar en semilla_hidro porque los consejos se aplican en rangos/configuración
    const cfg = (typeof state !== 'undefined' && state && state.configTorre) ? state.configTorre : {};
    const cam = cfg && cfg.caminoCultivo ? cfg.caminoCultivo : '';
    if (cam === 'semilla_hidro') {
      container.classList.add('setup-hidden');
      return;
    }

    // CRÍTICO: Sincronizar con instalación activa para evitar mezclar datos
    try {
      if (typeof sincronizarUltimaMedicionYRecargaDesdeTorreActiva === 'function') {
        sincronizarUltimaMedicionYRecargaDesdeTorreActiva();
      }
    } catch (_) {}

    const consejos = generarConsejosMultiples(2);

    if (consejos.length === 0) {
      container.innerHTML = '';
      container.classList.add('setup-hidden');
      return;
    }

    container.classList.remove('setup-hidden');

    let html = '<div class="consejos-motor-wrapper">';
    html += '<h4 class="consejos-titulo">💡 Consejos Personalizados</h4>';
    html += '<div class="consejos-lista">';

    consejos.forEach((consejo, idx) => {
      const prioridadClass = consejo.prioridad === 'alta' ? 'alta' : '';
      html += `<div class="consejo-item ${prioridadClass}">`;
      html += `<div class="consejo-icono">💡</div>`;
      html += `<div class="consejo-texto">${consejo.texto}</div>`;
      html += `<div class="consejo-categoria">${consejo.categoria}</div>`;
      html += `</div>`;
    });

    html += '</div>';
    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Inicializa el motor de consejos
   */
  function initMotorConsejos() {
    // Crear contenedor si no existe
    let container = document.getElementById('consejosMotorContainer');
    if (!container) {
      const dashOperativa = document.getElementById('dashOperativaHub');
      if (dashOperativa) {
        container = document.createElement('div');
        container.id = 'consejosMotorContainer';
        container.className = 'consejos-motor-container';
        dashOperativa.parentNode.insertBefore(container, dashOperativa);
      }
    }

    // Renderizar inicialmente
    renderConsejosWidget();

    // Actualizar cuando cambie el estado
    const originalRefresh = window.refreshDashOperativaHub;
    if (typeof originalRefresh === 'function') {
      window.refreshDashOperativaHub = function () {
        originalRefresh();
        renderConsejosWidget();
      };
    }
  }

  // Exponer funciones globalmente
  window.generarConsejoPersonalizado = generarConsejoPersonalizado;
  window.generarConsejosMultiples = generarConsejosMultiples;
  window.renderConsejosWidget = renderConsejosWidget;
  window.initMotorConsejos = initMotorConsejos;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotorConsejos);
  } else {
    initMotorConsejos();
  }

})();
