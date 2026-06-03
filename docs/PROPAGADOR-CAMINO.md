# Camino `semilla_propagador` — mapa de pantallas y UX

Referencia para pruebas, soporte y copy. Resumen de los cuatro caminos: [FLUJO-CAMINOS.md](./FLUJO-CAMINOS.md).

---

## Flujo en una línea

```
Asistente (7 pasos, sin sala/DWC)
  → Guardar → checklist propagador
  → Operativa: Inicio (hub germ) + Medir (domo) + Sistema (SVG bandeja)
  → Conclusión germ (días o manual)
  → Asistente DWC/RDWC (un paso)
  → Sala opcional + traslado + depósito
  → Operativa hidro completa
```

---

## Pestañas principales (barra inferior)

| Pestaña | `id` panel | `id` botón | Fase propagador (germ activa, sin DWC) |
|---------|------------|------------|----------------------------------------|
| Inicio | `tab-inicio` | `btn-inicio` | **Principal** — `#dashGerminacionHub` |
| Medir | `tab-mediciones` | `btn-mediciones` | Domo; banner `#medirPropagadorFaseBanner` |
| Sala | `tab-sala` | `btn-sala` | **Oculta** (`hc-tab-camino-oculta`) hasta concluir germ |
| Sistema | `tab-sistema` | `btn-sistema` | Título **Propagador**; panel fase `#hcSistemaFaseHost` |
| Calendario | `tab-calendario` | `btn-calendario` | Hitos + registro diario |
| Riego | `tab-riego` | `btn-riego` | Sin depósito DWC aún (tipo vacío) |
| Meteo | `tab-meteo` | `btn-meteo` | Referencia exterior/interior del asistente |
| Consejos / Ayuda / Historial | `tab-consejos` … | — | Sin bloqueo específico |

Clases en `<body>` durante propagador: `hc-modo-propagador-sistema`, `hc-modo-propagador-sin-sala`, `hc-modo-fase-propagador`.

---

## Inicio (`#tab-inicio`)

| Elemento | ID / selector | Función |
|----------|---------------|---------|
| Hub germinación | `#dashGerminacionHub` | Registro diario, domo, 6 fases (guía), conclusión |
| Banner sala oculta | `#propagadorSalaOcultaBanner` | Explica por qué no hay pestaña Sala |
| Resumen camino | (dash camino, si existe) | `refreshDashCaminoResumen` |
| CTA traslado (post-germ) | `#hcGermTrasladoCta` | Tras `germinacionConcluida` + hidro pendiente |

Acciones clave en el hub:

- `guardarRegistroGerminacionDiario()` — registro del día
- `guardarMedicionDomo()` — T° / HR domo
- `hcGerminacionMarcarConcluida()` — cierre manual antes del día objetivo
- `abrirSetupFaseHidro()` — tras conclusión
- `abrirSetupFaseSala()` — sala opcional (CTA en hub cuando aplica)

---

## Medir (`#tab-mediciones`)

| Elemento | Notas |
|----------|--------|
| `#medirPropagadorFaseBanner` | Enlace a Inicio → Germinación |
| Esquema torre / depósito | **No** es el foco; sin `hidroInstalacionCerrada` |
| Diagrama medir | Puede estar vacío o genérico hasta hidro |

---

## Sistema (`#tab-sistema`)

| Elemento | ID | Contenido fase propagador |
|----------|-----|---------------------------|
| Panel fase camino | `#hcSistemaFaseHost` | Checklist montaje, clima domo, mini bandeja |
| SVG propagador | `#torreSVGWrap` | `hcRenderPropagadorSvg()` — bandeja + celdas |
| Matriz cultivo | (sección matriz) | 1×N alvéolos tras sync plan; etiqueta «Alvéolo» |
| Esquema DWC | Oculto | `getSistemaFaseCamino()` → `'propagador'` |

Modal checklist: `#propagadorMontajeModal`, `#propagadorMontajeBody`.

---

## Asistente premium (modal setup)

Camino: `premiumSetup.caminoCultivo === 'semilla_propagador'`.

Páginas **omitidas** (`getSetupSkippedPagesForCamino`): geometría torre, DWC/RDWC instalación, nutrientes depósito, etc.

Pasos visibles (~7): domo, genética, germinación ahora (semillas + sustrato), clima orientativo, equipamiento, resumen, guardar.

Tras guardar (`faseGermSetup`):

- `hcInicializarTorreGerminacionPropagador`
- `hcSyncGerminacionPlanCultivo`
- `refreshTabsOperativaCamino`
- Checklist propagador (no checklist sala depósito)

Reaperturas:

- `abrirSetupFaseHidro()` — solo sistema hidro
- `abrirSetupFaseSala()` — sala tras germ o en paralelo si concluida

---

## Estados de datos (tres fuentes)

| Fuente | Campos relevantes | Uso |
|--------|-------------------|-----|
| `configTorre.premiumSetup` | `variedadGerminacion`, `numSemillasGerm`, `sustratoGerm`, domo catálogo | Asistente inicial |
| `configTorre.germinacionFlow` | `pasos`, `registroDiario`, `numSemillas`, `concluidaAt` | Hub Inicio |
| `state.torre` (matriz) | celdas 1×N | Pestaña Sistema / Cultivo |

Sincronización: `hcSyncGerminacionPlanCultivo` (al guardar setup y en `initApp`).

---

## Reglas de negocio (copy / UX)

1. **6 fases en el rail** — guía técnica; **no** hace falta marcarlas todas en propagador.
2. **Conclusión** — `germinacionConcluida`: día ≥ objetivo genética **o** `concluidaAt` manual.
3. **% en el anillo del hub** — en propagador refleja **días** hacia el objetivo, no las 6 fases.
4. **Sala oculta** — mientras germ activa y no concluida; evita configurar LED/carpa antes del traslado.
5. **Dos visualizaciones** — SVG en Sistema (montaje) + mini-grid en Inicio (mismo plan; no es duplicado de datos, sí de vista).
6. **Riego / Meteo** — no bloqueados en barra; riego útil tras cerrar DWC; hasta entonces usar Medir + hub.

---

## Lista priorizada de mejoras UX (estado)

| Prioridad | Mejora | Estado |
|-----------|--------|--------|
| P0 | Anillo de progreso por días (no por 6 fases) | Implementado en hub |
| P0 | Aviso «6 fases = guía opcional» en hub | Implementado |
| P0 | Banner Inicio cuando Sala oculta | `#propagadorSalaOcultaBanner` |
| P1 | `title` en botón Sala + toast al pulsar | Ya existía; `title` reforzado |
| P1 | Sync plan ↔ matriz al arranque | `initApp` |
| P1 | Calendario: evento revisar cierre ~día objetivo | Ya en `hcGerminacionEventosCalendario` |
| P2 | Unificar `premiumSetup` + `germinacionFlow` + `torre` en un config | **No** — refactor pendiente si se pide |
| P2 | Banner en Riego «sin depósito hasta hidro» | Documentado; opcional en UI |
| P3 | Reducir mini-grid en Inicio si SVG visible en Sistema | Diseño — valorar feedback real |

---

## Checklist de prueba manual

1. Nuevo camino propagador → asistente sin sala/DWC → guardar.
2. Inicio: hub visible, anillo por días, banner sala si aplica.
3. Sistema: título Propagador, SVG con N celdas = semillas del plan.
4. Cultivo/matriz: variedad en alvéolos, no etiqueta DWC.
5. Marcar conclusión manual → CTA hidro → asistente DWC → sala visible.
6. Móvil: cambiar pestaña sin zoom; misma pestaña no recarga.

---

## Archivos clave

| Área | Archivo |
|------|---------|
| Fase / ocultar sala | `js/hc-camino-fase.js` |
| Pestañas y banners | `js/hc-camino-flujo-ui.js` |
| Hub germinación | `js/hc-germinacion-flow.js` |
| SVG | `js/diagrams/propagador/propagador-diagram.js` |
| Panel Sistema | `js/hc-sistema-fase-camino.js` |
| Setup guardar | `js/hc-setup-calc-core.js` |
| Torre / early return | `js/torre-render-main.js` |
