# Prueba guiada — camino `semilla_hidro`

Referencia: [SEMILLA-HIDRO-CAMINO.md](./SEMILLA-HIDRO-CAMINO.md) · Tests automáticos: `tests/semilla-hidro-camino.test.mjs`

Ejecutar verificación en consola:

```bash
npm test
```

---

## Checklist manual (UI)

### 1. Asistente único (sala + DWC)

1. Nueva instalación → camino **Semilla en el hidro (6 fases)**.
2. Avanzar el asistente: debe aparecer **Espacio y prep**, **Clima y luz**, **Genética** (paso 6), bloque **semillas/sustrato/fecha**, y página **DWC/RDWC** antes de guardar.
3. Guardar → checklist **prep hidro** (no «solo propagador»).

**Esperado:** no segundo asistente de sala/DWC tras guardar. **Debe abrirse el modal checklist prep hidro** (no ir solo a montaje de sala).

**Regresión corregida (auditoría):** si configuraste sala en el wizard, no debe volver a pedir «Configurar sala» — solo montaje verificado si falta.

### 2. Inicio

1. Pestaña **Sala** visible en la barra (sin banner «sala oculta»).
2. Hub germinación bloqueado hasta prep + sala + depósito (banners según `hcGerminacionBloqueada`).

### 3. Sistema · Prep hidro

1. Pestaña Sistema → título **Prep hidro**.
2. Abrir checklist → ítems prep hidro (`ITEMS_PREP_HIDRO`).

### 4. Desbloqueo del hub

1. Completar prep, configurar sala, verificar montaje, primer llenado depósito.
2. Inicio → hub visible; anillo muestra **%** (no solo «d12»).

### 5. Seis fases y traslado

1. Marcar las **6 fases** del rail (obligatorias).
2. Checklist traslado → Sistema pasa a esquema **DWC/RDWC** completo.

### 6. Medir

1. Pestaña Medir → protocolo/guía del día **visibles** (no ocultos como en propagador).
2. Cards de depósito + sala según equipamiento guardado.

### 7. Fecha siembra

1. Inicio → editar **Fecha de siembra en sustrato** → Guardar.
2. Calendario → día 1 alineado con esa fecha.

---

## Resultado verificación automática (código)

| # | Criterio | Automático |
|---|----------|------------|
| 1 | `hcCaminoSemillaGermEnSetup` + último paso `PREMIUM_END` | `npm test` |
| 2 | Sala no oculta en hidro | `npm test` |
| 3 | `prep_hidro` + `ITEMS_PREP_HIDRO` | `npm test` |
| 4–5 | Hub fases + `pctProgreso` | `npm test` |
| 6 | Medir solo propagador en modo domo | `npm test` |
| 7 | Fecha inicio + calendario | `npm test` |

La UI requiere la pasada manual anterior en navegador (`npm run rpi:serve` → http://localhost:5173).
