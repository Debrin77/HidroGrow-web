/**
 * Mejora de Checklists con Explicaciones
 * Mejora sustancial: Añade explicaciones del "por qué" a cada ítem del checklist
 * Versión: 1.0.0
 */
(function () {
  'use strict';

  // Base de conocimientos de explicaciones por tipo de paso
  const EXPLICACIONES_CHECKLIST = {
    // Preparación del depósito
    'apagar_bomba': {
      titulo: '¿Por qué apagar la bomba?',
      explicacion: 'Apagar la bomba antes de vaciar evita que se active accidentalmente mientras trabajas, previene daños a la bomba por funcionamiento en seco, y permite un vaciado completo del sistema.',
      prevencion: 'Siempre desconecta eléctricamente antes de manipular el sistema hidráulico.'
    },
    'vaciar_deposito': {
      titulo: '¿Por qué vaciar completamente?',
      explicacion: 'Vaciar completamente elimina sales acumuladas, previene desequilibrios nutricionales, y permite empezar con una solución fresca y equilibrada. Residuos viejos pueden causar bloqueos de nutrientes.',
      prevencion: 'Nunca reutilices solución vieja más de 7-10 días.'
    },
    'limpiar_deposito': {
      titulo: '¿Por qué limpiar el depósito?',
      explicacion: 'Limpiar elimina biofilm, algas y residuos que pueden contaminar la nueva solución. Un depósito limpio previene patógenos y asegura absorción óptima de nutrientes.',
      prevencion: 'Usa agua caliente y jabón neutro. Enjuaga abundantemente.'
    },
    'enjuagar_sistema': {
      titulo: '¿Por qué enjuagar el sistema?',
      explicacion: 'El enjuagado elimina residuos de limpieza y sales acumuladas en tuberías y difusores. Asegura que la nueva solución no se contamine con residuos anteriores.',
      prevencion: 'Enjuaga hasta que el agua salga clara.'
    },
    // Preparación del agua
    'medir_ec_agua_base': {
      titulo: '¿Por qué medir EC del agua base?',
      explicacion: 'Conocer el EC del agua base permite calcular cuánto nutriente añadir para alcanzar el objetivo. Agua dura (alto EC) requiere menos nutriente; agua blanda (bajo EC) requiere más.',
      prevencion: 'Si EC base > 300 µS/cm, considera ósmosis.'
    },
    'ajustar_ph_agua_base': {
      titulo: '¿Por qué ajustar pH del agua base?',
      explicacion: 'El pH del agua base afecta la disponibilidad de nutrientes desde el inicio. Ajustar antes de añadir nutrientes asegura mejor absorción desde el principio.',
      prevencion: 'Ajusta a 5.8-6.0 antes de añadir nutrientes.'
    },
    // Adición de nutrientes
    'anadir_calmag': {
      titulo: '¿Por qué añadir CalMag primero?',
      explicacion: 'CalMag (Calcio y Magnesio) es esencial para estructura celular y fotosíntesis. Añadirlo primero permite que se disuelva completamente antes de otros nutrientes que podrían competir por absorción.',
      prevencion: 'Nunca mezcles CalMag con pH up/down directamente.'
    },
    'anadir_parte_a': {
      titulo: '¿Por qué añadir la parte A primero?',
      explicacion: 'La parte A contiene macronutrientes (N-P-K) que necesitan disolverse primero. Mezclar en orden correcto previene precipitación y bloqueos de nutrientes.',
      prevencion: 'Nunca mezcles partes A y B directamente en el contenedor.'
    },
    'anadir_parte_b': {
      titulo: '¿Por qué añadir la parte B después?',
      explicacion: 'La parte B contiene micronutrientes y secundarios que pueden precipitar si se mezclan directamente con la parte A. El orden asegura disponibilidad completa de todos los nutrientes.',
      prevencion: 'Remueve bien entre cada adición.'
    },
    'remover_nutrientes': {
      titulo: '¿Por qué remover 2-3 minutos?',
      explicacion: 'Remover asegura disolución completa y homogeneización de la solución. Nutrientes no disueltos pueden bloquear sistemas y causar desequilibrios locales.',
      prevencion: 'Usa aireación para acelerar disolución.'
    },
    // Ajuste de pH
    'medir_ph_tras_mezcla': {
      titulo: '¿Por qué medir pH tras mezcla?',
      explicacion: 'El pH cambia tras añadir nutrientes. Medir después permite ajustar al rango óptimo (5.8-6.2) para máxima absorción de todos los nutrientes.',
      prevencion: 'Espera 10-15 minutos para estabilización.'
    },
    'ajustar_ph_final': {
      titulo: '¿Por qué ajustar pH al rango óptimo?',
      explicacion: 'pH 5.8-6.2 es el rango donde todos los nutrientes están disponibles. Fuera de este rango, algunos nutrientes se bloquean causando deficiencias.',
      prevencion: 'Ajusta gradualmente, 0.1-0.2 a la vez.'
    },
    // Operación
    'encender_bomba': {
      titulo: '¿Por qué encender la bomba al final?',
      explicacion: 'Encender al final asegura que la solución esté completamente preparada y homogeneizada antes de circular. Previene bloqueos y asegura distribución uniforme.',
      prevencion: 'Verifica que no haya fugas antes de encender.'
    },
    'verificar_circulacion': {
      titulo: '¿Por qué verificar circulación?',
      explicacion: 'Verificar circulación asegura que todas las plantas reciben solución fresca. Bloqueos pueden causar zonas muertas y problemas localizados.',
      prevencion: 'Revisa difusores y tuberías regularmente.'
    },
    // Seguimiento
    'medir_ec_ph_2h': {
      titulo: '¿Por qué medir a las 2 horas?',
      explicacion: 'A las 2 horas, la solución se estabiliza y puedes verificar que EC/pH se mantienen en rango. Cambios tempranos indican problemas de absorción o calidad del agua.',
      prevencion: 'Registra todas las mediciones para identificar patrones.'
    },
    'medir_ec_ph_24h': {
      titulo: '¿Por qué medir a las 24 horas?',
      explicacion: 'A las 24 horas puedes ver la tendencia real de consumo. EC que sube indica absorción de agua; EC que baja indica absorción de nutrientes.',
      prevencion: 'Ajusta según tendencia, no solo valor absoluto.'
    }
  };

  /**
   * Obtiene explicación para un paso basado en su descripción
   */
  function obtenerExplicacionPaso(descripcion) {
    const desc = String(descripcion).toLowerCase();
    
    // Mapeo basado en palabras clave
    if (desc.includes('apagar') && desc.includes('bomba')) {
      return EXPLICACIONES_CHECKLIST.apagar_bomba;
    }
    if (desc.includes('vaciar') && desc.includes('depósito')) {
      return EXPLICACIONES_CHECKLIST.vaciar_deposito;
    }
    if (desc.includes('limpiar') && desc.includes('depósito')) {
      return EXPLICACIONES_CHECKLIST.limpiar_deposito;
    }
    if (desc.includes('enjuagar')) {
      return EXPLICACIONES_CHECKLIST.enjuagar_sistema;
    }
    if (desc.includes('ec') && desc.includes('agua') && (desc.includes('base') || desc.includes('inicial'))) {
      return EXPLICACIONES_CHECKLIST.medir_ec_agua_base;
    }
    if (desc.includes('ph') && desc.includes('agua') && (desc.includes('base') || desc.includes('inicial'))) {
      return EXPLICACIONES_CHECKLIST.ajustar_ph_agua_base;
    }
    if (desc.includes('calmag') || desc.includes('cal mag')) {
      return EXPLICACIONES_CHECKLIST.anadir_calmag;
    }
    if (desc.includes('parte') && (desc.includes('a') || desc.includes('primera'))) {
      return EXPLICACIONES_CHECKLIST.anadir_parte_a;
    }
    if (desc.includes('parte') && (desc.includes('b') || desc.includes('segunda'))) {
      return EXPLICACIONES_CHECKLIST.anadir_parte_b;
    }
    if (desc.includes('remover') || desc.includes('agitar')) {
      return EXPLICACIONES_CHECKLIST.remover_nutrientes;
    }
    if (desc.includes('ph') && desc.includes('tras') && (desc.includes('mezcla') || desc.includes('nutriente'))) {
      return EXPLICACIONES_CHECKLIST.medir_ph_tras_mezcla;
    }
    if (desc.includes('ph') && (desc.includes('ajustar') || desc.includes('corregir'))) {
      return EXPLICACIONES_CHECKLIST.ajustar_ph_final;
    }
    if (desc.includes('encender') && desc.includes('bomba')) {
      return EXPLICACIONES_CHECKLIST.encender_bomba;
    }
    if (desc.includes('verificar') && desc.includes('circulacion')) {
      return EXPLICACIONES_CHECKLIST.verificar_circulacion;
    }
    if (desc.includes('seguimiento') || desc.includes('ec') && desc.includes('ph')) {
      return EXPLICACIONES_CHECKLIST.medir_ec_ph_24h;
    }
    
    return null;
  }

  /**
   * Genera HTML para el icono de explicación
   */
  function generarIconoExplicacion(explicacion) {
    if (!explicacion) return '';
    return `
      <button type="button" 
              class="checklist-explicacion-icon" 
              data-explicacion-titulo="${esc(explicacion.titulo)}"
              data-explicacion-texto="${esc(explicacion.explicacion)}"
              data-explicacion-prevencion="${esc(explicacion.prevencion || '')}"
              aria-label="Ver explicación"
              title="¿Por qué este paso?">
        ❓
      </button>
    `;
  }

  /**
   * Escapa HTML
   */
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Muestra el modal de explicación
   */
  function mostrarModalExplicacion(titulo, texto, prevencion) {
    // Cerrar modal existente si hay
    const existente = document.getElementById('checklistExplicacionModal');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'checklistExplicacionModal';
    modal.className = 'checklist-explicacion-modal';
    modal.innerHTML = `
      <div class="checklist-explicacion-content">
        <div class="checklist-explicacion-header">
          <h3 class="checklist-explicacion-title">${titulo}</h3>
          <button type="button" class="checklist-explicacion-close" aria-label="Cerrar">×</button>
        </div>
        <div class="checklist-explicacion-body">
          <p class="checklist-explicacion-texto">${texto}</p>
          ${prevencion ? `<div class="checklist-explicacion-prevencion"><strong>💡 Prevención:</strong> ${prevencion}</div>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('.checklist-explicacion-close').addEventListener('click', cerrarModalExplicacion);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModalExplicacion();
    });

    // Accessibility
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
  }

  /**
   * Cierra el modal de explicación
   */
  function cerrarModalExplicacion() {
    const modal = document.getElementById('checklistExplicacionModal');
    if (modal) modal.remove();
  }

  /**
   * Mejora los pasos del checklist añadiendo iconos de explicación
   */
  function mejorarPasosChecklist() {
    // Buscar elementos de pasos del checklist
    const pasos = document.querySelectorAll('[data-checklist-paso]');
    
    pasos.forEach(paso => {
      const descripcion = paso.textContent || paso.getAttribute('data-checklist-desc');
      if (!descripcion) return;

      const explicacion = obtenerExplicacionPaso(descripcion);
      if (!explicacion) return;

      // Añadir icono de explicación si no existe
      if (!paso.querySelector('.checklist-explicacion-icon')) {
        const icono = document.createElement('span');
        icono.innerHTML = generarIconoExplicacion(explicacion);
        paso.appendChild(icono.firstChild);

        // Añadir event listener
        const iconoBtn = paso.querySelector('.checklist-explicacion-icon');
        if (iconoBtn) {
          iconoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mostrarModalExplicacion(
              iconoBtn.getAttribute('data-explicacion-titulo'),
              iconoBtn.getAttribute('data-explicacion-texto'),
              iconoBtn.getAttribute('data-explicacion-prevencion')
            );
          });
        }
      }
    });
  }

  /**
   * Observa cambios en el DOM para mejorar pasos dinámicos
   */
  function observarCambiosChecklist() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              // Si es un paso de checklist, mejorarlo
              if (node.hasAttribute && node.hasAttribute('data-checklist-paso')) {
                const descripcion = node.textContent || node.getAttribute('data-checklist-desc');
                const explicacion = obtenerExplicacionPaso(descripcion);
                if (explicacion) {
                  const icono = document.createElement('span');
                  icono.innerHTML = generarIconoExplicacion(explicacion);
                  node.appendChild(icono.firstChild);

                  const iconoBtn = node.querySelector('.checklist-explicacion-icon');
                  if (iconoBtn) {
                    iconoBtn.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      mostrarModalExplicacion(
                        iconoBtn.getAttribute('data-explicacion-titulo'),
                        iconoBtn.getAttribute('data-explicacion-texto'),
                        iconoBtn.getAttribute('data-explicacion-prevencion')
                      );
                    });
                  }
                }
              }
              
              // Buscar pasos dentro del nodo añadido
              const pasosInternos = node.querySelectorAll ? node.querySelectorAll('[data-checklist-paso]') : [];
              pasosInternos.forEach(pasoInterno => {
                const descInterna = pasoInterno.textContent || pasoInterno.getAttribute('data-checklist-desc');
                const explicacionInterna = obtenerExplicacionPaso(descInterna);
                if (explicacionInterna && !pasoInterno.querySelector('.checklist-explicacion-icon')) {
                  const icono = document.createElement('span');
                  icono.innerHTML = generarIconoExplicacion(explicacionInterna);
                  pasoInterno.appendChild(icono.firstChild);

                  const iconoBtn = pasoInterno.querySelector('.checklist-explicacion-icon');
                  if (iconoBtn) {
                    iconoBtn.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      mostrarModalExplicacion(
                        iconoBtn.getAttribute('data-explicacion-titulo'),
                        iconoBtn.getAttribute('data-explicacion-texto'),
                        iconoBtn.getAttribute('data-explicacion-prevencion')
                      );
                    });
                  }
                }
              });
            }
          });
        }
      });
    });

    // Observar el documento completo
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  /**
   * Inicializa la mejora de checklists
   */
  function initMejoraChecklists() {
    // Mejorar pasos existentes
    mejorarPasosChecklist();

    // Observar cambios para pasos dinámicos
    observarCambiosChecklist();

    // Reintentar mejorar periódicamente (por si el checklist carga más tarde)
    setInterval(mejorarPasosChecklist, 3000);
  }

  // Exponer funciones globalmente
  window.mostrarModalExplicacion = mostrarModalExplicacion;
  window.cerrarModalExplicacion = cerrarModalExplicacion;
  window.initMejoraChecklists = initMejoraChecklists;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMejoraChecklists);
  } else {
    initMejoraChecklists();
  }

})();
