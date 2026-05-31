/**
 * HidroGrow — Gateway ESP32 de referencia
 *
 * WebSocket JSON en puerto 8765 para la PWA HidroGrow.
 * Sustituye readSensors() por tus lecturas reales (I2C, UART, analógico…).
 *
 * Librería: WebSockets by Links2004
 *   Arduino IDE → Gestor de librerías → "WebSockets"
 */

#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// ── Configura tu WiFi ──────────────────────────────────────────────────────
const char *WIFI_SSID = "TU_WIFI";
const char *WIFI_PASS = "TU_PASSWORD";

const uint16_t WS_PORT = 8765;
WebSocketsServer webSocket(WS_PORT);

// Valores simulados / cache (sustituir por lecturas reales)
struct SensorData {
  float ec = 1420.0f;      // µS/cm
  float ph = 6.05f;
  float temp = 19.8f;      // °C agua
  float vol = 18.0f;       // L
  float tempAire = 25.1f;
  float humSala = 62.0f;
  float ppfd = 780.0f;
  float lux = 42400.0f;
  float co2 = 920.0f;
  float tempExt = 31.2f;
} sensors;

unsigned long lastBroadcast = 0;
const unsigned long BROADCAST_MS = 30000;

String buildPayloadJson() {
  StaticJsonDocument<512> doc;
  doc["ec"] = sensors.ec;
  doc["ph"] = sensors.ph;
  doc["temp"] = sensors.temp;
  doc["vol"] = sensors.vol;
  doc["tempAire"] = sensors.tempAire;
  doc["humSala"] = sensors.humSala;
  doc["ppfd"] = sensors.ppfd;
  doc["lux"] = sensors.lux;
  doc["co2"] = sensors.co2;
  doc["tempExt"] = sensors.tempExt;
  String out;
  serializeJson(doc, out);
  return out;
}

void readSensors() {
  // TODO: leer hardware real
  // Ejemplo BME280: sensors.tempAire = bme.readTemperature();
  //                 sensors.humSala = bme.readHumidity();
  // Ejemplo MH-Z19: sensors.co2 = mhz19.getCO2();
  // Demo: pequeña variación para ver cambios en prueba
  sensors.tempAire += (random(-10, 11) / 100.0f);
  sensors.humSala = constrain(sensors.humSala + random(-2, 3), 40, 90);
}

void broadcastJson() {
  readSensors();
  String json = buildPayloadJson();
  webSocket.broadcastTXT(json);
  Serial.println("[TX] " + json);
}

void handleWsMessage(uint8_t num, uint8_t *payload, size_t length) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    broadcastJson();
    return;
  }
  const char *cmd = doc["cmd"] | "";
  if (strcmp(cmd, "hello") == 0 || strcmp(cmd, "read") == 0) {
    broadcastJson();
    return;
  }
}

void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[WS] Cliente #%u conectado desde %s\n", num, ip.toString().c_str());
      broadcastJson();
      break;
    }
    case WStype_DISCONNECTED:
      Serial.printf("[WS] Cliente #%u desconectado\n", num);
      break;
    case WStype_TEXT:
      handleWsMessage(num, payload, length);
      break;
    default:
      break;
  }
}

void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP local: ");
  Serial.println(WiFi.localIP());
  Serial.printf("WebSocket: ws://%s:%u\n", WiFi.localIP().toString().c_str(), WS_PORT);
}

void setup() {
  Serial.begin(115200);
  randomSeed(esp_random());
  setupWiFi();
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
  Serial.println("HidroGrow gateway listo.");
}

void loop() {
  webSocket.loop();
  if (millis() - lastBroadcast > BROADCAST_MS) {
    lastBroadcast = millis();
    if (webSocket.connectedClients() > 0) {
      broadcastJson();
    }
  }
}
