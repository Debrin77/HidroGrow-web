# HidroGrow — Gateway IoT local (WiFi + WebSocket)

Guía para conectar sensores de sala a la PWA **sin coste en servidores**: todo ocurre en tu red WiFi.

## Parámetros soportados

| Clave JSON | Medir | Sensor típico |
|------------|-------|---------------|
| `ec` | EC depósito | Medidor combo / sonda EC (µS/cm) |
| `ph` | pH depósito | Medidor combo / sonda pH |
| `temp` | Temp. agua | DS18B20 sumergible |
| `vol` | Volumen L | Ultrasónico HC-SR04 en depósito |
| `tempAire` | Temp. aire sala | DHT22, BME280, SHT31 |
| `humSala` | HR % | DHT22, BME280, higrómetro |
| `ppfd` | PPFD | Sensor PAR / quantum |
| `lux` | Lux (opc.) | Luxómetro analógico / BH1750 |
| `co2` | CO₂ ppm | MH-Z19, SCD40 |
| `tempExt` | Temp. exterior | DS18B20 exterior |

**VPD** no se envía: la app lo calcula con `tempAire` + `humSala`.

## Formato de mensaje

Un objeto JSON por mensaje WebSocket:

```json
{
  "ec": 1420,
  "ph": 6.05,
  "temp": 19.8,
  "vol": 18,
  "tempAire": 25.1,
  "humSala": 62,
  "ppfd": 780,
  "lux": 42400,
  "co2": 920,
  "tempExt": 31.2
}
```

- **EC** siempre en **µS/cm** (1.8 mS/cm → `1800`).
- La app valida rangos físicos y de cultivo antes de autocompletar Medir.

## Conexión desde la PWA

1. Medir → **Sensores IoT** → **Configurar WiFi (paso a paso)**.
2. URL ejemplo: `ws://192.168.1.50:8765` (IP local del ESP32).
3. Probar conexión → lectura de prueba → confirmar parámetros correctos.
4. **Conectar** en uso diario; revisar y **Guardar** medición manualmente.

## Firmware de referencia

Ver `ESP32-hidrogrow-gateway.ino`:

- Servidor WebSocket en puerto **8765**.
- Responde a `{"cmd":"hello"}` y `{"cmd":"read","test":true}`.
- Sustituye `readSensors()` por lecturas reales de tus sondas.

### Librerías Arduino (ESP32)

- WiFi (incluida)
- [WebSockets](https://github.com/Links2004/arduinoWebSockets) by Links2004

### Instalación rápida

1. Edita `WIFI_SSID` y `WIFI_PASS` en el `.ino`.
2. Sube a ESP32; anota la IP en el Monitor Serie.
3. En HidroGrow: `ws://TU_IP:8765`.

## MQTT (opcional)

Si usas Mosquitto con WebSocket (`ws://IP:8083/mqtt`), necesitas un **bridge** que traduzca topics MQTT a JSON plano para la PWA, o ampliar `hc-iot-bridge.js` con cliente MQTT. El firmware incluido usa WebSocket directo (más simple para v1).

## Coste

| Quién | Coste |
|-------|-------|
| HidroGrow (app) | 0 € — sin backend IoT |
| Usuario | ESP32 (~5–15 €) + sensores que ya tenga |
