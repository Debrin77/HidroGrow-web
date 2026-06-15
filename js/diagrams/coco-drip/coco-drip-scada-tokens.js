/**
 * Tokens visuales — coco coir + goteo DTW (SCADA / tema claro).
 */
(function (global) {
  'use strict';

  var COCO_DRIP_SCADA = {
    bg0: '#fafaf9',
    bg1: '#e7e5e4',
    tentStroke: '#a8a29e',
    tentFill: 'rgba(250,250,249,0.35)',
    ink: '#1c1917',
    inkSoft: '#57534e',
    title: '#292524',
    cocoFill: '#a8a29e',
    cocoDark: '#78716c',
    perliteFill: '#f5f5f4',
    perliteDot: '#d6d3d1',
    fabricStroke: '#57534e',
    potStroke: '#78716c',
    flow: '#0284c7',
    flowLight: '#7dd3fc',
    trayFill: '#cbd5e1',
    trayStroke: '#64748b',
    runoff: '#94a3b8',
    tankFill: '#bae6fd',
    tankStroke: '#0369a1',
    plant: '#16a34a',
    plantDark: '#14532d',
    haloRing: '#0ea5e9',
    accent: '#d97706',
  };

  function f1(n) {
    return Number(n).toFixed(1);
  }

  function cocoDripScadaDefs(uid) {
    uid = uid || 'cocoDrip';
    return (
      '<defs>' +
      '<linearGradient id="' +
      uid +
      'Bg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' +
      COCO_DRIP_SCADA.bg0 +
      '"/>' +
      '<stop offset="100%" stop-color="' +
      COCO_DRIP_SCADA.bg1 +
      '"/>' +
      '</linearGradient>' +
      '<linearGradient id="' +
      uid +
      'Tank" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#e0f2fe"/>' +
      '<stop offset="100%" stop-color="' +
      COCO_DRIP_SCADA.tankFill +
      '"/>' +
      '</linearGradient>' +
      '<pattern id="' +
      uid +
      'Perlite" width="6" height="6" patternUnits="userSpaceOnUse">' +
      '<rect width="6" height="6" fill="' +
      COCO_DRIP_SCADA.perliteFill +
      '"/>' +
      '<circle cx="2" cy="2" r="0.9" fill="' +
      COCO_DRIP_SCADA.perliteDot +
      '"/>' +
      '<circle cx="5" cy="4" r="0.7" fill="' +
      COCO_DRIP_SCADA.perliteDot +
      '"/>' +
      '</pattern>' +
      '</defs>'
    );
  }

  global.COCO_DRIP_SCADA = COCO_DRIP_SCADA;
  global.cocoDripScadaF1 = f1;
  global.cocoDripScadaDefs = cocoDripScadaDefs;
})(typeof window !== 'undefined' ? window : globalThis);
