# Germinación de semilla de cannabis — referencia (todos los caminos)

Documento de **ciencia y práctica**, no sustituye el flujo de cada camino en la app (`semilla_propagador` vs `semilla_hidro` son independientes).

Fuentes consultadas (2025–2026): [Royal Queen Seeds](https://www.royalqueenseeds.com/us/content/45-germinating), [BudTrainer](https://www.budtrainer.com/blogs/learn/how-to-germinate-cannabis-seeds), [Plantation Premium Seeds](https://www.plantationpremiumseeds.com/en/articles/cannabis-seed-germination-guide), [Mavericks Genetics — hidro](https://mavericksgenetics.com/blogs/news/how-to-germinate-cannabis-seeds-for-hydro), [Cannoptikum — luz](https://cannoptikum.com/en/blog/germinate-cannabis-seeds/do-cannabis-seeds-need-light-to-germinate).

---

## ¿Hace falta oscuridad?

**Para que la semilla abra (taproot): no necesita luz.** Lo que dispara la germinación es **humedad + calor + oxígeno**; en naturaleza ocurre bajo sustrato (oscuridad).

| Fase | Luz |
|------|-----|
| Semilla → radícula visible | Oscuridad o luz muy baja; muchos usan papel húmedo, domo cerrado o sustrato cubierto |
| Sale el hipocótilo / cotiledones | **Sí hace falta luz** suave y pronto, o el vástago se estira («leggy») |

Rangos habituales citados por cultivadores:

- T°: **20–26 °C** (algunas fuentes 21–29 °C)
- HR: **70–90 %** en la zona de la semilla
- Tras emergencia: **18 h/día** (o 24 h muy suave los primeros días en algunos protocolos), **PPFD bajo** (~100–300 µmol/m²/s), LED/fluorescente cerca pero sin quemar

**En HidroGrow:** el asistente orienta **18 h / intensidad baja** en clima de sala; el hub de germinación recuerda T°/HR por genética. En **Inicio**, caminos `semilla_propagador` y `semilla_hidro`: aviso **«Oscuridad · días 1–2»** mientras duren los dos primeros días desde la fecha de siembra (sin fecha de siembra no se muestra el contador).

---

## ¿La genética cambia *cómo* germinar?

**El proceso biológico de germinación es el mismo** para autofloreciente, feminizada foto y regular: misma necesidad de humedad, calor y oscuridad hasta que asoma la radícula.

Lo que **sí cambia** es el **manejo después**, no la química de la semilla al hidratar:

| Tipo | Germinación | Después de germinar |
|------|-------------|---------------------|
| **Fotoperiodo** | Igual (papel, vaso, rockwool, directo…) | Más tolerante a trasplantes; maceta pequeña → final; florece con **12/12** |
| **Autofloreciente** | Igual | Ciclo **fijo ~70–90 días**; evitar trasplantes tardíos; muchos plantan en **maceta final** o un solo traslado (plug → final) |
| **Regular** | Igual | Igual que foto; además hay que sexar |

No hay consenso de que una variedad concreta exija otro método de germinación; sí importan semillas **frescas vs viejas** (pre-soak 12–24 h ayuda a las duras).

---

## Métodos habituales (resumen)

1. **Papel húmedo** — control visual del taproot (5–13 mm) antes de plantar.
2. **Vaso de agua** — 12–48 h; útil en semillas viejas; luego a sustrato o plug.
3. **Directo en sustrato / maceta** — menos manipulación de la radícula.
4. **Plug (rockwool, jiffy, rapid rooter)** — muy usado en **hidro/DWC**: rockwool **pH 5.5–5.8** pre-remojado; tras 0,5–1 cm de raíz → cubo en sistema.

---

## Semilla en hidro (DWC/RDWC) — cúpula, oscuridad y llenado

### 1 semilla por sustrato

**Sí:** una semilla por cubo de lana/jiffy dentro de cada net pot. En la app, `numSemillasGerm` = N cubos/cestas.

### Cúpula individual por cesta

- **Mini cúpula / domo sobre cada net pot** (no bandeja propagador): HR alta local los primeros días.
- Checklist prep: `ph_domo_mini`, `ph_quitar_cupula`.
- **Cuándo quitar:** al **brote verde (cotiledón)** → ventilar cúpula **24–48 h** → retirar **por maceta**. Dejarla demasiado en hidro favorece hongos y «wet feet» ([Grow Weed Easy](https://www.growweedeasy.com/how-to-care-for-hydroponic-cannabis-seedlings)).

### Oscuridad (días 1–2 orientativos)

La semilla abre sin luz; al brote, luz tenue. Hub Inicio: banner «Oscuridad · días 1–2» con fecha de siembra.

### Llenado del depósito

Distancia vertical **nutriente → base del sustrato** en la cesta (fase «recién plantada»):

| Sustrato | Rango orientativo |
|----------|-------------------|
| Lana / jiffy / esponja | **0–0,5 cm** |
| Coco | **0 cm** (casi tocando o muy cerca) |

EC **200–400 µS** hasta enraizar. La app calcula cm y litros en checklist prep, **Cultivo e instalación** y primer llenado (`dwcRangoCmPorFaseYFamilia('recien')`).

---

## Cómo encaja cada camino en HidroGrow (sin mezclar)

| Camino | Dónde germina en la app |
|--------|-------------------------|
| `semilla_propagador` | Bandeja/domo → luego hidro |
| `semilla_hidro` | **Net pot en DWC/RDWC** desde el inicio; cúpula opcional en maceta |

Ver [SEMILLA-HIDRO-CAMINO.md](./SEMILLA-HIDRO-CAMINO.md) y [PROPAGADOR-CAMINO.md](./PROPAGADOR-CAMINO.md).
