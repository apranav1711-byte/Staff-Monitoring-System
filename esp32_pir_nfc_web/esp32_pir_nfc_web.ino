#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_PN532.h>

// ---------- WIFI DETAILS ----------
const char* WIFI_SSID = "Pi(10)";
const char* WIFI_PASS = "3141592653";

// ---------- PIN CONFIG ----------
#define PIR_PIN       33        // PIR OUT pin
#define PN532_IRQ     4         // any free GPIO (required by library)
#define PN532_RESET   -1        // RSTO NOT connected

// NFC object (I2C)
Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET);

// Web server on port 80
WebServer server(80);

// ---------- STATE VARIABLES ----------
bool phoneOnPad = false;
unsigned long lastPhoneChangeMs = 0;
unsigned long lastNfcDetectedMs = 0;  // Track when NFC tag was last successfully detected
const unsigned long NFC_TIMEOUT_MS = 5000;  // 5 seconds - if no detection for this long, consider removed

unsigned long lastMotionMs = 0;
const unsigned long MOTION_WINDOW_MS = 10000;   // 10 seconds

bool nfcInitialized = false;  // Track if PN532 was successfully initialized

// ---------- HTTP HANDLER ----------
void handleStatus() {
  unsigned long now = millis();

  unsigned long phoneAgo = (lastPhoneChangeMs == 0)
                           ? 0
                           : (now - lastPhoneChangeMs) / 1000;
  unsigned long motionAgo = (lastMotionMs == 0)
                            ? 999999
                            : (now - lastMotionMs) / 1000;

  String json = "{";
  json += "\"phoneOnPad\":";
  json += (phoneOnPad ? "true" : "false");
  json += ",\"lastPhoneChangeAgoSec\":";
  json += phoneAgo;
  json += ",\"lastMotionAgoSec\":";
  json += motionAgo;
  json += "}";

  // Allow browser JS to call this (CORS)
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void setupWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println("\n=== ESP32 PIR + NFC + Web API ===");

  // PIR
  pinMode(PIR_PIN, INPUT);

  // WiFi
  setupWiFi();

  // I2C + PN532
  Serial.println("Initializing I2C...");
  Wire.begin(21, 22);  // SDA = 21, SCL = 22 on ESP32
  delay(100);  // Give I2C time to stabilize
  
  Serial.println("Initializing PN532...");
  nfc.begin();
  delay(200);  // Give PN532 time to initialize

  // Try multiple times to detect PN532
  uint32_t versiondata = 0;
  int retryCount = 0;
  const int maxRetries = 5;
  
  while (!versiondata && retryCount < maxRetries) {
    Serial.print("Attempting to detect PN532 (attempt ");
    Serial.print(retryCount + 1);
    Serial.print("/");
    Serial.print(maxRetries);
    Serial.println(")...");
    
    versiondata = nfc.getFirmwareVersion();
    
    if (!versiondata) {
      retryCount++;
      delay(500);  // Wait before retry
    }
  }

  if (!versiondata) {
    Serial.println("ERROR: PN532 not detected after multiple attempts!");
    Serial.println("Troubleshooting:");
    Serial.println("1. Check I2C connections: SDA=GPIO21, SCL=GPIO22");
    Serial.println("2. Verify PN532 is powered (3.3V and GND)");
    Serial.println("3. Check I2C pull-up resistors (usually 4.7kΩ)");
    Serial.println("4. Try power cycling the ESP32 and PN532");
    Serial.println("5. Verify PN532 is in I2C mode (not SPI)");
    Serial.println("Continuing without NFC functionality...");
    nfcInitialized = false;  // Mark as not initialized
  } else {
    Serial.print("PN532 detected! Firmware version: 0x");
    Serial.println((versiondata >> 24) & 0xFF, HEX);
    nfc.SAMConfig();
    Serial.println("PN532 configured successfully.");
    nfcInitialized = true;  // Mark as successfully initialized
  }

  lastMotionMs = 0; // start with no motion (inactive)

  // Web server routes
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain",
                "ESP32 PIR + NFC Status API. Use /status endpoint.");
  });

  server.begin();
  Serial.println("HTTP server started.");
}

void loop() {
  server.handleClient();

  unsigned long now = millis();

  // ---------- A) PIR MOTION (independent) ----------
  static bool lastPirState = LOW;
  bool pirState = digitalRead(PIR_PIN);

  if (pirState == HIGH) {
    // Motion detected - update timestamp whenever PIR is HIGH
    // This ensures continuous monitoring, not just on rising edge
    if (lastPirState == LOW) {
      // Rising edge - new motion detected
      Serial.println("PIR: Motion detected (rising edge).");
    }
    lastMotionMs = now;  // Update timestamp whenever motion is present
  } else if (pirState == LOW && lastPirState == HIGH) {
    // Falling edge - motion stopped
    Serial.println("PIR: Motion ended (falling edge).");
  }
  lastPirState = pirState;

  // ---------- B) NFC PHONE DETECTION (continuous) ----------
  // Only try to read NFC if PN532 was successfully initialized
  if (nfcInitialized) {
    uint8_t success;
    uint8_t uid[7];
    uint8_t uidLength;

    // check for NFC tag with short timeout (non‑blocking)
    success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength, 100);

    if (success) {
      // NFC tag detected - update detection timestamp
      lastNfcDetectedMs = now;
      
      // If phone wasn't on pad, mark it as on pad now
      if (!phoneOnPad) {
        phoneOnPad = true;
        lastPhoneChangeMs = now;
        Serial.println("NFC: Phone/tag placed on pad (phoneOnPad = true).");
      }
    } else {
      // No NFC tag detected - check if it's been more than 5 seconds since last detection
      if (phoneOnPad && (now - lastNfcDetectedMs) > NFC_TIMEOUT_MS) {
        // It's been more than 5 seconds since last detection, mark as removed
        phoneOnPad = false;
        lastPhoneChangeMs = now;
        Serial.println("NFC: Phone/tag removed from pad (no detection for >5s).");
      }
    }
  }

  delay(100); // small delay
}
