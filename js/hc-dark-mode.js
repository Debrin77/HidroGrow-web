/**
 * Sistema de Dark Mode Nativo
 * Mejora sustancial: Dark mode optimizado para grow rooms con poca luz
 * Versión: 1.0.0
 */
(function () {
  'use strict';

  const DARK_MODE_KEY = 'hc_dark_mode_preference';
  const DARK_MODE_CLASS = 'hc-dark-mode';
  
  /**
   * Obtiene la preferencia de dark mode del usuario
   */
  function getDarkModePreference() {
    try {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      if (saved !== null) {
        return saved === 'dark';
      }
    } catch (_) {}
    
    // Por defecto, usar preferencia del sistema
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Guarda la preferencia de dark mode
   */
  function saveDarkModePreference(isDark) {
    try {
      localStorage.setItem(DARK_MODE_KEY, isDark ? 'dark' : 'light');
    } catch (_) {}
  }

  /**
   * Aplica el dark mode al DOM
   */
  function applyDarkMode(isDark) {
    const html = document.documentElement;
    const body = document.body;
    
    if (isDark) {
      html.classList.add(DARK_MODE_CLASS);
      body.classList.add(DARK_MODE_CLASS);
    } else {
      html.classList.remove(DARK_MODE_CLASS);
      body.classList.remove(DARK_MODE_CLASS);
    }
    
    // Actualizar meta theme-color para PWA
    updateMetaThemeColor(isDark);
  }

  /**
   * Actualiza el meta theme-color para la barra de navegador
   */
  function updateMetaThemeColor(isDark) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Color oscuro para dark mode, claro para light mode
      metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#faf6ef');
    }
    
    // También actualizar apple-mobile-web-app-status-bar-style
    const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaStatusBar) {
      metaStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default');
    }
  }

  /**
   * Activa el dark mode
   */
  function enableDarkMode() {
    applyDarkMode(true);
    saveDarkModePreference(true);
    updateDarkModeToggle(true);
  }

  /**
   * Desactiva el dark mode
   */
  function disableDarkMode() {
    applyDarkMode(false);
    saveDarkModePreference(false);
    updateDarkModeToggle(false);
  }

  /**
   * Toggle entre dark y light mode
   */
  function toggleDarkMode() {
    const isDark = document.documentElement.classList.contains(DARK_MODE_CLASS);
    if (isDark) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  }

  /**
   * Actualiza el estado visual del toggle
   */
  function updateDarkModeToggle(isDark) {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    
    toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    toggle.classList.toggle('is-active', isDark);
    
    const icon = toggle.querySelector('.dark-mode-icon');
    if (icon) {
      icon.textContent = isDark ? '☀️' : '🌙';
    }
    
    const label = toggle.querySelector('.dark-mode-label');
    if (label) {
      label.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
    }
  }

  /**
   * Crea el botón de toggle de dark mode
   */
  function createDarkModeToggle() {
    // Verificar si ya existe
    if (document.getElementById('darkModeToggle')) return;
    
    // Buscar un lugar apropiado para el toggle (header o nav)
    const header = document.querySelector('header') || document.querySelector('.app-header') || document.querySelector('#app');
    if (!header) return;
    
    const toggle = document.createElement('button');
    toggle.id = 'darkModeToggle';
    toggle.className = 'dark-mode-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Cambiar entre modo claro y oscuro');
    toggle.setAttribute('aria-pressed', getDarkModePreference() ? 'true' : 'false');
    toggle.innerHTML = `
      <span class="dark-mode-icon">${getDarkModePreference() ? '☀️' : '🌙'}</span>
      <span class="dark-mode-label">${getDarkModePreference() ? 'Modo claro' : 'Modo oscuro'}</span>
    `;
    
    toggle.addEventListener('click', toggleDarkMode);
    
    // Insertar en el header
    const headerContent = header.querySelector('.header-content') || header;
    headerContent.appendChild(toggle);
  }

  /**
   * Inicializa el dark mode
   */
  function initDarkMode() {
    // Aplicar preferencia guardada o del sistema
    const isDark = getDarkModePreference();
    applyDarkMode(isDark);
    
    // Crear toggle después de que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createDarkModeToggle, 500);
      });
    } else {
      setTimeout(createDarkModeToggle, 500);
    }
    
    // Escuchar cambios en preferencia del sistema
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Solo cambiar si el usuario no ha establecido preferencia manual
        const hasManualPreference = localStorage.getItem(DARK_MODE_KEY) !== null;
        if (!hasManualPreference) {
          applyDarkMode(e.matches);
          updateDarkModeToggle(e.matches);
        }
      });
    }
  }

  // Exponer funciones globalmente
  window.enableDarkMode = enableDarkMode;
  window.disableDarkMode = disableDarkMode;
  window.toggleDarkMode = toggleDarkMode;
  window.initDarkMode = initDarkMode;

  // Inicializar inmediatamente
  initDarkMode();

})();
