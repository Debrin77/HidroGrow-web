# Cuatro caminos — proceso propio, resultado común

Misma meta: **cultivar en casa**. Cada camino tiene su **fase en Sistema** (sin esquema DWC hasta operativa) y reglas sin repetir pasos del asistente.

Módulo central: `hc-camino-fase.js` · Panel: `hc-sistema-fase-camino.js`

## Resumen por camino

| Camino | Fase en Sistema (pestaña) | Sala en barra | Matriz (esquema) |
|--------|---------------------------|---------------|------------------|
| **Propagador** | Propagador → luego hidro | Oculta hasta concluir germinación | Tras cerrar DWC/RDWC |
| **Semilla en hidro** | Prep hidro → Germinación en cubo | Visible desde el inicio | Tras traslado / fases |
| **Esqueje** | Enraizado | Visible | Tras checklist + clones asignados |
| **Madre** | Cubo madre | Visible | Tras madre asignada + 1.er llenado |

---

## 1. Semilla en propagador (`semilla_propagador`)

- Asistente 7 pasos: domo, genética, **sin sala ni DWC**.
- Operativa: Inicio + Medir (domo) + **Sistema = Propagador** (gráfico bandeja, nutrientes en agua).
- En **Germinación ahora** (paso equipamiento): **cuántas semillas** + **sustrato** (lana/jiffy/papel); sugerencia según propagador del catálogo top 10 ES (77 o 24 celdas).
- El **checklist del propagador** no se puede cerrar sin genética, número de semillas, sustrato y (camino propagador) domo en catálogo.
- Conclusión por **días** o botón manual → **DWC/RDWC** (un paso) → sala opcional → traslado.

---

## 2. Semilla en hidro (`semilla_hidro`)

- Asistente **único** con sala + DWC/RDWC (no vuelve a pedirlo).
- Orden: prep hidro → sala → montaje → **DWC/RDWC ya en asistente inicial** → depósito (EC baja) → **6 fases** en el cubo → checklist **operativa** + registro en matriz (no traslado desde propagador).
- Esquema SVG completo tras registrar la plántula en la matriz.
- Medir: depósito del cubo + microclima.
- Mapa detallado: **[SEMILLA-HIDRO-CAMINO.md](./SEMILLA-HIDRO-CAMINO.md)**.

---

## 3. Esqueje al hidro (`esqueje_hidro`)

- Asistente completo (sala + hidro); **sin** hub de germinación de semilla.
- Sistema = **Enraizado**: checklist domo/rockwool → asignar clones en esquema → depósito.
- Calendario / Medir: orientado a enraizado y luego operativa.

---

## 4. Madre (`madre_hidro`)

- Cubo **18/6** permanente.
- Sistema = **Cubo madre**: asignar madre en matriz → primer llenado → operativa (esquejes aparte).

---

## Clima en el asistente (paso «Clima, luz y fotoperiodo»)

Al elegir el camino se aplican valores orientativos (sin pisar si el usuario ya los cambió a mano):

| Camino | Fase | Horas | Intensidad |
|--------|------|-------|------------|
| Propagador | Esqueje / plántula | 18 | Baja (domo) |
| Semilla hidro | Esqueje / plántula | 18 | Baja |
| Esqueje | Esqueje / plántula | 18 | Baja |
| Madre | Vegetativo | 18 | Media |

La sala LED completa en propagador se configura **después** de las 6 fases.

## Reglas anti-repetición

- **Propagador**: `abrirSetupFaseSala` y `abrirSetupFaseHidro` solo cuando toca (no en el asistente inicial).
- **Semilla hidro**: DWC y sala en el primer asistente; fase prep solo checklist + montaje + depósito.
- **Esqueje / Madre**: sin fases de semilla; matriz bloqueada mientras `getSistemaFaseCamino()` devuelve fase.

## Mapas detallados por camino semilla

| Camino | Documento |
|--------|-----------|
| Propagador | **[PROPAGADOR-CAMINO.md](./PROPAGADOR-CAMINO.md)** |
| Semilla en hidro | **[SEMILLA-HIDRO-CAMINO.md](./SEMILLA-HIDRO-CAMINO.md)** |

## Archivos

| Área | JS |
|------|-----|
| Fases | `hc-camino-fase.js` |
| Panel Sistema | `hc-sistema-fase-camino.js` |
| Caminos / skips | `hc-camino-cultivo.js` |
| UI pestañas | `hc-camino-flujo-ui.js` |
| Germinación | `hc-germinacion-flow.js` |
| Checklists | `hc-propagador-montaje.js` |
