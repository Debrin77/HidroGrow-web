/**
 * Onboarding Express - Configuración en 5 minutos
 * Mejora sustancial: Reducir de 15 pasos a 5 pasos esenciales
 * Versión: 1.0.0
 */
(function () {
  'use strict';

  const ONBOARDING_EXPRESS_KEY = 'hc_onboarding_express_completado';
  const ONBOARDING_EXPRESS_STEP_KEY = 'hc_onboarding_express_step';
  
  let expressStep = 0;
  let expressData = {};

  /**
   * Verifica si el usuario ya completó el onboarding express
   */
  function onboardingExpressCompletado() {
    try {
      return localStorage.getItem(ONBOARDING_EXPRESS_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  /**
   * Verifica si debe mostrar el onboarding express
   */
  function debeMostrarOnboardingExpress() {
    if (onboardingExpressCompletado()) return false;
    
    // Solo mostrar si es primera vez y no hay instalaciones
    try {
      if (typeof hcTieneInstalacionesUsuario === 'function' && !hcTieneInstalacionesUsuario()) {
        return true;
      }
    } catch (_) {}
    
    return false;
  }

  /**
   * Inicia el onboarding express
   */
  function iniciarOnboardingExpress() {
    if (!debeMostrarOnboardingExpress()) return;
    
    expressStep = 0;
    expressData = {};
    mostrarPasoExpress(0);
  }

  /**
   * Muestra un paso específico del onboarding express
   */
  function mostrarPasoExpress(paso) {
    expressStep = paso;
    
    // Crear overlay si no existe
    let overlay = document.getElementById('onboardingExpressOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'onboardingExpressOverlay';
      overlay.className = 'onboarding-express-overlay';
      document.body.appendChild(overlay);
    }
    
    overlay.classList.remove('setup-hidden');
    overlay.innerHTML = generarHTMLPaso(paso);
    
    // Guardar paso actual
    try {
      localStorage.setItem(ONBOARDING_EXPRESS_STEP_KEY, String(paso));
    } catch (_) {}
  }

  /**
   * Genera el HTML para cada paso
   */
  function generarHTMLPaso(paso) {
    const pasos = [
      generarPaso1Bienvenida,
      generarPaso2Camino,
      generarPaso3Sistema,
      generarPaso4Sala,
      generarPaso5Confirmacion
    ];
    
    if (paso >= pasos.length) {
      return generarPasoCompletado();
    }
    
    return pasos[paso]();
  }

  /**
   * Paso 1: Bienvenida rápida
   */
  function generarPaso1Bienvenida() {
    return `
      <div class="onboarding-express-content">
        <div class="onboarding-express-header">
          <h2 class="onboarding-express-title">🌿 Bienvenido a HidroGrow</h2>
          <p class="onboarding-express-subtitle">Configura tu cultivo en 5 minutos</p>
        </div>
        
        <div class="onboarding-express-body">
          <div class="onboarding-express-card">
            <div class="onboarding-express-icon">⚡</div>
            <h3 class="onboarding-express-card-title">Modo Express</h3>
            <p class="onboarding-express-card-text">
              Configuración rápida con lo esencial para empezar hoy mismo.
              Podrás ajustar detalles avanzados más tarde.
            </p>
          </div>
          
          <div class="onboarding-express-features">
            <div class="onboarding-express-feature">
              <span class="onboarding-express-feature-icon">✓</span>
              <span>5 pasos simples</span>
            </div>
            <div class="onboarding-express-feature">
              <span class="onboarding-express-feature-icon">✓</span>
              <span>Configuración básica</span>
            </div>
            <div class="onboarding-express-feature">
              <span class="onboarding-express-feature-icon">✓</span>
              <span>Empezar a cultivar hoy</span>
            </div>
          </div>
        </div>
        
        <div class="onboarding-express-footer">
          <button type="button" class="btn btn-secondary" onclick="onboardingExpressSaltar()">
            Configuración completa
          </button>
          <button type="button" class="btn btn-primary" onclick="onboardingExpressSiguiente(1)">
            Comenzar →
          </button>
        </div>
        
        <div class="onboarding-express-progress">
          <div class="onboarding-express-progress-bar" style="width: 20%"></div>
          <span class="onboarding-express-progress-text">Paso 1 de 5</span>
        </div>
      </div>
    `;
  }

  /**
   * Paso 2: Selección de camino de cultivo
   */
  function generarPaso2Camino() {
    return `
      <div class="onboarding-express-content">
        <div class="onboarding-express-header">
          <h2 class="onboarding-express-title">🌱 ¿Cómo quieres empezar?</h2>
          <p class="onboarding-express-subtitle">Elige tu método de cultivo</p>
        </div>
        
        <div class="onboarding-express-body">
          <div class="onboarding-express-camino-grid">
            <div class="onboarding-express-camino-card onboarding-express-camino-card--selected" 
                 data-camino="semilla_propagador" onclick="onboardingExpressSeleccionarCamino('semilla_propagador')">
              <div class="onboarding-express-camino-icon">🫧</div>
              <h3 class="onboarding-express-camino-title">Semilla en Propagador</h3>
              <p class="onboarding-express-camino-desc">
                Domo → DWC/RDWC. Máximo control. Recomendado para principiantes.
              </p>
              <div class="onboarding-express-camino-badge">Recomendado</div>
            </div>
            
            <div class="onboarding-express-camino-card" 
                 data-camino="semilla_hidro" onclick="onboardingExpressSeleccionarCamino('semilla_hidro')">
              <div class="onboarding-express-camino-icon">💧</div>
              <h3 class="onboarding-express-camino-title">Semilla Directo Hidro</h3>
              <p class="onboarding-express-camino-desc">
                Semilla directamente en DWC/RDWC. Más rápido, menos control inicial.
              </p>
            </div>
            
            <div class="onboarding-express-camino-card" 
                 data-camino="esqueje_hidro" onclick="onboardingExpressSeleccionarCamino('esqueje_hidro')">
              <div class="onboarding-express-camino-icon">✂️</div>
              <h3 class="onboarding-express-camino-title">Esqueje Hidro</h3>
              <p class="onboarding-express-camino-desc">
                Clonación en DWC/RDWC. Para cultivadores con experiencia.
              </p>
            </div>
          </div>
        </div>
        
        <div class="onboarding-express-footer">
          <button type="button" class="btn btn-secondary" onclick="onboardingExpressAnterior(0)">
            ← Anterior
          </button>
          <button type="button" class="btn btn-primary" onclick="onboardingExpressSiguiente(2)">
            Siguiente →
          </button>
        </div>
        
        <div class="onboarding-express-progress">
          <div class="onboarding-express-progress-bar" style="width: 40%"></div>
          <span class="onboarding-express-progress-text">Paso 2 de 5</span>
        </div>
      </div>
    `;
  }

  /**
   * Paso 3: Configuración del sistema
   */
  function generarPaso3Sistema() {
    return `
      <div class="onboarding-express-content">
        <div class="onboarding-express-header">
          <h2 class="onboarding-express-title">⚙️ Configura tu sistema</h2>
          <p class="onboarding-express-subtitle">Tipo de instalación hidropónica</p>
        </div>
        
        <div class="onboarding-express-body">
          <div class="onboarding-express-sistema-grid">
            <div class="onboarding-express-sistema-card onboarding-express-sistema-card--selected" 
                 data-sistema="dwc" onclick="onboardingExpressSeleccionarSistema('dwc')">
              <div class="onboarding-express-sistema-icon">🪣</div>
              <h3 class="onboarding-express-sistema-title">DWC</h3>
              <p class="onboarding-express-sistema-desc">
                Deep Water Culture. Un depósito por planta. Simple y efectivo.
              </p>
              <div class="onboarding-express-sistema-badge">Recomendado</div>
            </div>
            
            <div class="onboarding-express-sistema-card" 
                 data-sistema="rdwc" onclick="onboardingExpressSeleccionarSistema('rdwc')">
              <div class="onboarding-express-sistema-icon">🔗</div>
              <h3 class="onboarding-express-sistema-title">RDWC</h3>
              <p class="onboarding-express-sistema-desc">
                Recirculating DWC. Múltiples depósitos conectados. Para sistemas grandes.
              </p>
            </div>
          </div>
          
          <div class="onboarding-express-config-simple">
            <label class="onboarding-express-label">Número de plantas</label>
            <select id="expressNumPlantas" class="onboarding-express-select">
              <option value="1">1 planta</option>
              <option value="2" selected>2 plantas</option>
              <option value="4">4 plantas</option>
              <option value="6">6 plantas</option>
            </select>
          </div>
        </div>
        
        <div class="onboarding-express-footer">
          <button type="button" class="btn btn-secondary" onclick="onboardingExpressAnterior(1)">
            ← Anterior
          </button>
          <button type="button" class="btn btn-primary" onclick="onboardingExpressSiguiente(3)">
            Siguiente →
          </button>
        </div>
        
        <div class="onboarding-express-progress">
          <div class="onboarding-express-progress-bar" style="width: 60%"></div>
          <span class="onboarding-express-progress-text">Paso 3 de 5</span>
        </div>
      </div>
    `;
  }

  /**
   * Paso 4: Configuración de sala (opcional)
   */
  function generarPaso4Sala() {
    return `
      <div class="onboarding-express-content">
        <div class="onboarding-express-header">
          <h2 class="onboarding-express-title">🏠 Tu sala de cultivo</h2>
          <p class="onboarding-express-subtitle">Configuración básica (opcional)</p>
        </div>
        
        <div class="onboarding-express-body">
          <div class="onboarding-express-skip-hint">
            <p>💡 Puedes configurar esto más tarde en la pestaña "Sala"</p>
          </div>
          
          <div class="onboarding-express-config-simple">
            <label class="onboarding-express-label">Tamaño de la sala</label>
            <select id="expressTamanoSala" class="onboarding-express-select">
              <option value="pequena">Pequeña (60x60cm)</option>
              <option value="media" selected>Media (100x100cm)</option>
              <option value="grande">Grande (120x120cm)</option>
            </select>
          </div>
          
          <div class="onboarding-express-config-simple">
            <label class="onboarding-express-label">Tipo de luz</label>
            <select id="expressTipoLuz" class="onboarding-express-select">
              <option value="led">LED</option>
              <option value="cmh">CMH/LEC</option>
              <option value="hps">HPS</option>
            </select>
          </div>
        </div>
        
        <div class="onboarding-express-footer">
          <button type="button" class="btn btn-secondary" onclick="onboardingExpressAnterior(2)">
            ← Anterior
          </button>
          <button type="button" class="btn btn-outline" onclick="onboardingExpressSaltarSala()">
            Saltar sala
          </button>
          <button type="button" class="btn btn-primary" onclick="onboardingExpressSiguiente(4)">
            Siguiente →
          </button>
        </div>
        
        <div class="onboarding-express-progress">
          <div class="onboarding-express-progress-bar" style="width: 80%"></div>
          <span class="onboarding-express-progress-text">Paso 4 de 5</span>
        </div>
      </div>
    `;
  }

  /**
   * Paso 5: Confirmación
   */
  function generarPaso5Confirmacion() {
    const camino = expressData.camino || 'semilla_propagador';
    const sistema = expressData.sistema || 'dwc';
    const numPlantas = expressData.numPlantas || '2';
    
    const caminoNombres = {
      'semilla_propagador': 'Semilla en Propagador',
      'semilla_hidro': 'Semilla Directo Hidro',
      'esqueje_hidro': 'Esqueje Hidro'
    };
    
    return `
      <div class="onboarding-express-content">
        <div class="onboarding-express-header">
          <h2 class="onboarding-express-title">✨ ¡Listo para empezar!</h2>
          <p class="onboarding-express-subtitle">Revisa tu configuración</p>
        </div>
        
        <div class="onboarding-express-body">
          <div class="onboarding-express-resumen">
            <div class="onboarding-express-resumen-item">
              <span class="onboarding-express-resumen-label">Camino de cultivo:</span>
              <span class="onboarding-express-resumen-value">${caminoNombres[camino] || camino}</span>
            </div>
            <div class="onboarding-express-resumen-item">
              <span class="onboarding-express-resumen-label">Sistema:</span>
              <span class="onboarding-express-resumen-value">${sistema.toUpperCase()}</span>
            </div>
            <div class="onboarding-express-resumen-item">
              <span class="onboarding-express-resumen-label">Número de plantas:</span>
              <span class="onboarding-express-resumen-value">${numPlantas}</span>
            </div>
          </div>
          
          <div class="onboarding-express-next-steps">
            <h4 class="onboarding-express-next-title">¿Qué sigue?</h4>
            <ul class="onboarding-express-next-list">
              <li>Configurarás los detalles técnicos en el asistente completo</li>
              <li>Empezarás a medir EC/pH diariamente</li>
              <li>Recibirás consejos personalizados según tu fase</li>
              <li>Tendrás alertas si algo necesita atención</li>
            </ul>
          </div>
        </div>
        
        <div class="onboarding-express-footer">
          <button type="button" class="btn btn-secondary" onclick="onboardingExpressAnterior(3)">
            ← Anterior
          </button>
          <button type="button" class="btn btn-primary" onclick="onboardingExpressCompletar()">
            ¡Empezar a cultivar! 🌿
          </button>
        </div>
        
        <div class="onboarding-express-progress">
          <div class="onboarding-express-progress-bar" style="width: 100%"></div>
          <span class="onboarding-express-progress-text">Paso 5 de 5</span>
        </div>
      </div>
    `;
  }

  /**
   * Pantalla de completado
   */
  function generarPasoCompletado() {
    return `
      <div class="onboarding-express-content onboarding-express-content--success">
        <div class="onboarding-express-success-icon">🎉</div>
        <h2 class="onboarding-express-success-title">¡Configuración completada!</h2>
        <p class="onboarding-express-success-text">
          Ahora configuraremos los detalles técnicos. Esto tomará solo unos minutos más.
        </p>
        <button type="button" class="btn btn-primary btn-lg" onclick="onboardingExpressIrAsistente()">
          Continuar al asistente →
        </button>
      </div>
    `;
  }

  /**
   * Navegación: Siguiente
   */
  function onboardingExpressSiguiente(siguientePaso) {
    // Guardar datos del paso actual
    if (expressStep === 2) {
      const caminoSeleccionado = document.querySelector('.onboarding-express-camino-card--selected');
      if (caminoSeleccionado) {
        expressData.camino = caminoSeleccionado.dataset.camino;
      }
    }
    
    if (expressStep === 3) {
      const sistemaSeleccionado = document.querySelector('.onboarding-express-sistema-card--selected');
      if (sistemaSeleccionado) {
        expressData.sistema = sistemaSeleccionado.dataset.sistema;
      }
      const numPlantas = document.getElementById('expressNumPlantas');
      if (numPlantas) {
        expressData.numPlantas = numPlantas.value;
      }
    }
    
    if (expressStep === 4) {
      const tamanoSala = document.getElementById('expressTamanoSala');
      const tipoLuz = document.getElementById('expressTipoLuz');
      if (tamanoSala) expressData.tamanoSala = tamanoSala.value;
      if (tipoLuz) expressData.tipoLuz = tipoLuz.value;
    }
    
    mostrarPasoExpress(siguientePaso);
  }

  /**
   * Navegación: Anterior
   */
  function onboardingExpressAnterior(pasoAnterior) {
    mostrarPasoExpress(pasoAnterior);
  }

  /**
   * Seleccionar camino de cultivo
   */
  function onboardingExpressSeleccionarCamino(camino) {
    document.querySelectorAll('.onboarding-express-camino-card').forEach(card => {
      card.classList.remove('onboarding-express-camino-card--selected');
    });
    const seleccionado = document.querySelector(`[data-camino="${camino}"]`);
    if (seleccionado) {
      seleccionado.classList.add('onboarding-express-camino-card--selected');
    }
  }

  /**
   * Seleccionar sistema
   */
  function onboardingExpressSeleccionarSistema(sistema) {
    document.querySelectorAll('.onboarding-express-sistema-card').forEach(card => {
      card.classList.remove('onboarding-express-sistema-card--selected');
    });
    const seleccionado = document.querySelector(`[data-sistema="${sistema}"]`);
    if (seleccionado) {
      seleccionado.classList.add('onboarding-express-sistema-card--selected');
    }
  }

  /**
   * Saltar configuración de sala
   */
  function onboardingExpressSaltarSala() {
    expressData.salaOmitida = true;
    onboardingExpressSiguiente(4);
  }

  /**
   * Saltar onboarding express y usar asistente completo
   */
  function onboardingExpressSaltar() {
    cerrarOnboardingExpress();
    try {
      localStorage.setItem(ONBOARDING_EXPRESS_KEY, '1');
    } catch (_) {}
    try {
      if (typeof abrirSetupNuevaTorre === 'function') {
        abrirSetupNuevaTorre();
      } else if (typeof abrirSetup === 'function') {
        abrirSetup();
      }
    } catch (_) {}
  }

  /**
   * Completar onboarding express
   */
  function onboardingExpressCompletar() {
    try {
      localStorage.setItem(ONBOARDING_EXPRESS_KEY, '1');
    } catch (_) {}
    
    // Pre-seleccionar camino en el asistente completo
    if (expressData.camino && typeof seleccionarCaminoCultivo === 'function') {
      try {
        seleccionarCaminoCultivo(expressData.camino);
      } catch (_) {}
    }
    
    mostrarPasoExpress(5); // Mostrar pantalla de éxito
  }

  /**
   * Ir al asistente completo
   */
  function onboardingExpressIrAsistente() {
    cerrarOnboardingExpress();
    try {
      if (typeof abrirSetupNuevaTorre === 'function') {
        abrirSetupNuevaTorre();
      } else if (typeof abrirSetup === 'function') {
        abrirSetup();
      }
    } catch (_) {}
  }

  /**
   * Cerrar onboarding express
   */
  function cerrarOnboardingExpress() {
    const overlay = document.getElementById('onboardingExpressOverlay');
    if (overlay) {
      overlay.classList.add('setup-hidden');
    }
  }

  /**
   * Inicializar onboarding express
   */
  function initOnboardingExpress() {
    // Verificar si debe mostrar
    if (debeMostrarOnboardingExpress()) {
      // Retrasar un poco para que cargue la app
      setTimeout(() => {
        iniciarOnboardingExpress();
      }, 1000);
    }
  }

  // Exponer funciones globalmente
  window.iniciarOnboardingExpress = iniciarOnboardingExpress;
  window.onboardingExpressSiguiente = onboardingExpressSiguiente;
  window.onboardingExpressAnterior = onboardingExpressAnterior;
  window.onboardingExpressSeleccionarCamino = onboardingExpressSeleccionarCamino;
  window.onboardingExpressSeleccionarSistema = onboardingExpressSeleccionarSistema;
  window.onboardingExpressSaltarSala = onboardingExpressSaltarSala;
  window.onboardingExpressSaltar = onboardingExpressSaltar;
  window.onboardingExpressCompletar = onboardingExpressCompletar;
  window.onboardingExpressIrAsistente = onboardingExpressIrAsistente;
  window.cerrarOnboardingExpress = cerrarOnboardingExpress;
  window.initOnboardingExpress = initOnboardingExpress;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnboardingExpress);
  } else {
    initOnboardingExpress();
  }

})();
