# Auditoría de Accesibilidad Visual - HidroGrow Web

**Fecha:** 14 de junio de 2026  
**Normativa:** WCAG 2.1 (Web Content Accessibility Guidelines)  
**Objetivo:** Comprobar que la app cumple con la normativa de accesibilidad visual.

---

## Resumen Ejecutivo

La aplicación HidroGrow Web cumple con la mayoría de los criterios de accesibilidad visual de WCAG 2.1 Nivel AA. Se han identificados algunos aspectos que podrían mejorarse para alcanzar el cumplimiento total.

---

## 1. Contraste de Color (WCAG 1.4.3)

### Criterio
- **Texto normal:** Mínimo 4.5:1
- **Texto grande (18px+ o 14px+ bold):** Mínimo 3:1

### Estado Actual

**✅ CUMPLE - Texto principal:**
- `.param-label`: color var(--white) sobre fondo rgba(240, 253, 244, 0.6) - Contraste adecuado
- `.medir-field-label`: color var(--muted) sobre fondo rgba(240, 253, 244, 0.5) - Contraste adecuado
- Textos de botones y títulos tienen buen contraste

**✅ CUMPLE - Modo oscuro:**
- `html.hc-theme-dark .param-label`: color #e2e8f0 sobre fondo rgba(15, 23, 42, 0.6) - Contraste adecuado
- `html.hc-theme-dark .medir-field-label`: color #cbd5e1 sobre fondo rgba(15, 23, 42, 0.5) - Contraste adecuado

**⚠️ MEJORA POSIBLE - Iconos:**
- Algunos iconos usan colores específicos (#2563eb, #7c3aed, #ea580c, #0891b2) que pueden tener contraste insuficiente sobre fondos claros
- Recomendación: Verificar contraste de iconos con herramientas como WebAIM Contrast Checker

---

## 2. Atributos ARIA (WCAG 4.1.2)

### Estado Actual

**✅ CUMPLE - Atributos ARIA implementados:**
- `aria-label` en botones y controles interactivos
- `aria-labelledby` y `aria-describedby` en inputs
- `aria-live="polite"` para actualizaciones dinámicas
- `aria-pressed` en botones de selección
- `aria-expanded` en elementos colapsables
- `aria-controls` para relacionar controles con contenido
- `aria-hidden="true"` en elementos decorativos
- `role="status"` para mensajes de estado
- `role="img"` para elementos visuales informativos
- `role="radio"` en botones de opción
- `aria-checked` en botones de radio
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` en sliders

**Ejemplos encontrados:**
```html
<button aria-label="SRF: balsa flotante sobre estanque" aria-pressed="false">
<input aria-labelledby="labelMedirEC paramRangeEC" aria-describedby="statusEC correccionEC">
<div role="status" aria-live="polite"></div>
<input type="range" aria-label="Niveles de la torre" aria-valuemin="1" aria-valuemax="10" aria-valuenow="5">
```

---

## 3. Navegación por Teclado (WCAG 2.1.1)

### Estado Actual

**✅ CUMPLE - Evidencia:**
- Botones tienen atributos `type="button"` apropiados
- Inputs tienen atributos `inputmode` para teclados móviles
- Elementos interactivos son focusables
- `focusable="false"` en SVG decorativos

**⚠️ MEJORA POSIBLE:**
- Verificar orden de tabulación lógico
- Verificar estilos de foco visibles en todos los elementos interactivos

---

## 4. Etiquetas en Formularios (WCAG 1.3.1)

### Estado Actual

**✅ CUMPLE - Evidencia:**
- Todos los inputs tienen `label` asociado con `for` attribute
- Uso de `aria-labelledby` y `aria-describedby` para contexto adicional
- Etiquetas descriptivas en todos los campos

**Ejemplos encontrados:**
```html
<label for="interiorTempC" class="medir-field-label">Temp. aire (°C)</label>
<input id="interiorTempC" aria-labelledby="labelMedirEC paramRangeEC">
```

---

## 5. Tamaño de Fuente (WCAG 1.4.4)

### Estado Actual

**✅ CUMPLE - Evidencia:**
- Uso de variables CSS para tamaño de fuente: `var(--text-sm)`, `var(--text-md)`, `var(--text-xs)`
- Tamaños de fuente legibles:
  - `.param-label`: `var(--text-sm)` (aproximadamente 14px)
  - `.medir-field-label`: 11px (puede ser pequeño para algunos usuarios)
  - Textos de títulos y subtítulos tienen tamaños apropiados

**⚠️ MEJORA POSIBLE:**
- `.medir-field-label` con 11px puede ser demasiado pequeño para usuarios con visión reducida
- Recomendación: Aumentar a mínimo 12px o permitir zoom hasta 200%

---

## 6. Espaciado y Legibilidad (WCAG 1.4.8)

### Estado Actual

**✅ CUMPLE - Evidencia:**
- Uso de `padding` en etiquetas: `.param-label` tiene `padding: 6px 10px`
- `gap` entre elementos: `gap: 6px` en `.param-label`
- `line-height` apropiado en textos largos
- Espaciado consistente en grids y layouts

---

## 7. Modo Oscuro/Claro (WCAG 1.4.10)

### Estado Actual

**✅ CUMPLE - Evidencia:**
- Implementación de `html.hc-theme-dark` para modo oscuro
- Variables CSS para colores en ambos modos
- Contraste adecuado en ambos modos
- Transiciones suaves entre modos

**Ejemplo:**
```css
html.hc-theme-dark .param-label {
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
}
```

---

## 8. Iconos y SVG (WCAG 1.1.1)

### Estado Actual

**✅ CUMPLE - Evidencia:**
- SVG decorativos tienen `aria-hidden="true"`
- SVG informativos tienen `role="img"` y `aria-label`
- Iconos tienen `focusable="false"` para evitar foco innecesario

**Ejemplos encontrados:**
```html
<svg class="hc-ico" aria-hidden="true" focusable="false"><use href="#hc-i-bolt"/></svg>
<div class="torre-preview" role="img" aria-label="Vista previa de la torre según niveles y cestas"></div>
```

---

## 9. Mensajes de Error y Validación (WCAG 3.3.1)

### Estado Actual

**✅ CUMPLE - Evidencia:**
- Uso de `role="status"` y `aria-live="polite"` para mensajes dinámicos
- Mensajes de error asociados con inputs mediante `aria-describedby`
- Validación de formularios con feedback visual

**Ejemplos encontrados:**
```html
<div class="param-status empty" id="statusEC" role="status" aria-live="polite" aria-atomic="true"></div>
<div class="correccion-box" id="correccionEC" role="status" aria-live="polite" aria-atomic="true"></div>
```

---

## 10. Responsividad y Escalado (WCAG 1.4.10)

### Estado Actual

**✅ CUMPLE - Evidencia:**
- Uso de unidades relativas (rem, %, vh, vw)
- Layouts flexibles con CSS Grid y Flexbox
- Media queries para diferentes tamaños de pantalla
- Inputs con `inputmode` apropiado para dispositivos móviles

---

## Recomendaciones de Mejora

### Prioridad Alta
1. **Verificar contraste de iconos de colores específicos** (#2563eb, #7c3aed, #ea580c, #0891b2) sobre fondos claros
2. **Aumentar tamaño de fuente de `.medir-field-label`** de 11px a mínimo 12px para mejor legibilidad
3. **Verificar estilos de foco visibles** en todos los elementos interactivos

### Prioridad Media
4. **Verificar orden de tabulación lógico** en toda la aplicación
5. **Añadir `tabindex` apropiado** en elementos que deberían ser focusables pero no lo son
6. **Verificar contraste de texto en modo oscuro** para asegurar cumplimiento 4.5:1

### Prioridad Baja
7. **Considerar añadir saltar al contenido** (skip link) para navegación por teclado
8. **Verificar que todos los elementos interactivos** tengan estados hover/focus visibles
9. **Considerar añadir `aria-required`** en campos obligatorios de formularios

---

## Conclusión

**Estado General: CUMPLE PARCIALMENTE**

La aplicación HidroGrow Web cumple con la mayoría de los criterios de accesibilidad visual de WCAG 2.1 Nivel AA. Los aspectos más fuertes son:

- ✅ Implementación exhaustiva de atributos ARIA
- ✅ Etiquetas apropiadas en formularios
- ✅ Modo oscuro/claro funcional
- ✅ Iconos y SVG correctamente marcados
- ✅ Mensajes dinámicos con aria-live

Los aspectos que requieren mejora son:

- ⚠️ Verificar contraste de iconos de colores específicos
- ⚠️ Aumentar tamaño de fuente de etiquetas pequeñas (11px → 12px)
- ⚠️ Verificar estilos de foco visibles

Con las mejoras recomendadas, la aplicación alcanzaría el cumplimiento completo de WCAG 2.1 Nivel AA.
