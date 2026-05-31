# HidroGrow — arranque del proyecto

Proyecto independiente de **HidroCultivo** (mismo motor hidráulico, otra marca y datos).

## Carpeta y GitHub

| | |
|---|---|
| Carpeta local | `C:\Git\hidroGrow-web` |
| Repositorio | `https://github.com/Debrin77/HidroGrow-web` |
| HidroCultivo (no tocar) | `...\GitHub\HidroCultivo-web` |

## Separación técnica (hecho)

- `STORAGE_KEY`: `hidrogrow_v1` (no comparte cultivos con `cultiva_v1`)
- Backup JSON: `hidrogrowBackup`, `app: "HidroGrow"`, archivos `hidrogrow-backup-*.json`
- Import acepta copias HidroGrow y, por migración, copias antiguas `hidrocultivoBackup`
- PWA: `manifest.json` + service worker `hidrogrow-shell-v1`
- Capacitor: `es.hidrogrow.app` / `HidroGrow`

## Probar en local

```powershell
cd C:\Git\hidroGrow-web
npm run rpi:serve
```

Abre `http://localhost:5173`. Si ves datos viejos: DevTools → Application → borrar datos de `localhost:5173` o usa puerto `5174`.

## Producto HidroGrow (implementado)

1. **30 genéticas** en `js/genetics-db.js` (grupos: índica, sativa, híbrida, auto, CBD).
2. **Nutrientes cannabis** en `js/nutrientes-hidrogrow.js` (sustituye el catálogo hortícola).
3. **Sala de cultivo** en Medir → Configuración: carpa, LED, extractor (`js/hc-grow-room.js`).
4. **Marca** violeta/verde: `css/main.css`, `icons/splash-brand.svg`, tema PWA `#6d28d9`.
5. Herramientas PRO LED ampliadas (veg / preflor / flor).

Regenerar iconos PWA tras cambiar splash:

```powershell
cd C:\Git\hidroGrow-web
node scripts/resize-icons.js
```
