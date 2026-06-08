/**
 * Textos UI en español correcto — corrige etiquetas si el HTML tiene codificación rota.
 */
(function (global) {
  'use strict';

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  function setHtml(id, html) {
    var el = document.getElementById(id);
    if (el && html != null) el.innerHTML = html;
  }

  function hcApplyDashSpanishCopy() {
    setText('dashInstalacionLabel', 'Instalación seleccionada');
    setText('dashQuickMedirTitle', 'Medición rápida');
    setText('meteoAlertTitle', 'Cargando datos meteorológicos...');
    setText(
      'pinFooterHint',
      'Protege tus datos en este dispositivo. Puedes acortar el PIN en Inicio — Más opciones — Seguridad de acceso (recordar sesión o biometría).'
    );
    var standby = document.querySelector('#globalStandbyBanner span:last-child');
    if (standby && standby.textContent.indexOf('MODO DESCANSO') >= 0) {
      standby.innerHTML =
        '<strong>MODO DESCANSO ACTIVO</strong> · Instalación en stand-by. Se bloquean acciones operativas. Reactiva en <strong>Inicio</strong> con el interruptor «Estado operativo».';
    }
    var pinPad = document.getElementById('pinPad');
    if (pinPad) pinPad.setAttribute('aria-label', 'Teclado numérico del PIN');
    document.querySelectorAll('.pin-key[data-digit]').forEach(function (btn) {
      var d = btn.getAttribute('data-digit');
      if (d) btn.setAttribute('aria-label', 'Dígito ' + d);
    });
    var pinDel = document.getElementById('pinDelBtn');
    if (pinDel) {
      pinDel.setAttribute('aria-label', 'Borrar último dígito');
      pinDel.textContent = '⌫';
    }
    if (typeof hcRefreshDashSinInstalacionUi === 'function') {
      try {
        hcRefreshDashSinInstalacionUi();
      } catch (_) {}
    }
  }

  var SETUP_PAGES = {
    spage0: {
      title: 'Asistente de instalación',
      subtitle: 'Configura tu cultivo paso a paso. Elige primero tu ruta y luego el equipamiento.',
    },
    spagePremiumOrigen: {
      title: '¿Cómo empiezas el cultivo?',
      subtitle:
        'Elige una de las cuatro rutas. El asistente adapta pasos, alertas y equipamiento; el sistema hidropónico (DWC, RDWC…) lo configuras cuando toque en tu ruta.',
    },
    spagePremium1: {
      title: 'Objetivo y legalidad',
      subtitle: 'Uso personal responsable. Confirma contexto antes de dimensionar.',
    },
    spagePremium2: { title: 'Entorno de cultivo' },
    spagePremium3: { title: 'Espacio y equipamiento' },
    spagePremium4: { title: 'Clima, luz y fotoperiodo' },
    spagePremium5: { title: 'Genética y método' },
    spagePremium6: { title: 'Detalle según tu origen' },
    spagePremiumEnd: { title: '¿DWC o RDWC?' },
    spage1: { title: 'Tu sistema' },
    spage2: { title: 'Equipamiento' },
    spage3: { title: 'Agua y fijación en cestas' },
    spage4: { title: 'Nutriente' },
    spage5: { title: 'Meteo y preferencias' },
    spage6: { title: '¿Qué vas a cultivar?' },
    spage7: { title: '¿Una o varias instalaciones?' },
  };

  function hcApplySetupPageSpanishCopy(pageId) {
    var copy = SETUP_PAGES[pageId];
    if (!copy) return;
    var page = document.getElementById(pageId);
    if (!page) return;
    var titleEl = page.querySelector('.setup-title');
    if (titleEl && copy.title) {
      var ico = titleEl.querySelector('svg');
      if (ico) {
        titleEl.innerHTML = '';
        titleEl.appendChild(ico);
        titleEl.appendChild(document.createTextNode(' ' + copy.title));
      } else {
        titleEl.textContent = copy.title;
      }
    }
    if (copy.subtitle) {
      var sub = page.querySelector('.setup-subtitle');
      if (sub) sub.innerHTML = copy.subtitle;
    }
    if (pageId === 'spagePremiumOrigen' && typeof renderSetupCaminoCards === 'function') {
      renderSetupCaminoCards();
    }
  }

  function hcApplySetupAllSpanishCopy() {
    Object.keys(SETUP_PAGES).forEach(hcApplySetupPageSpanishCopy);
    document.title = 'HidroGrow — Hidroponía en sala';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'HidroGrow — Autocultivo cannabis en DWC y RDWC: EC, pH, oxígeno, nutrientes, LED y clima por instalación.'
      );
    }
  }

  function hcApplySpanishUiCopy() {
    hcApplyDashSpanishCopy();
    hcApplySetupAllSpanishCopy();
  }

  global.hcApplyDashSpanishCopy = hcApplyDashSpanishCopy;
  global.hcApplySetupPageSpanishCopy = hcApplySetupPageSpanishCopy;
  global.hcApplySetupAllSpanishCopy = hcApplySetupAllSpanishCopy;
  global.hcApplySpanishUiCopy = hcApplySpanishUiCopy;
})(typeof window !== 'undefined' ? window : globalThis);
