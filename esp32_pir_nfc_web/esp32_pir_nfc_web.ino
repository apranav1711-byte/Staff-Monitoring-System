#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_PN532.h>

// ---------- WIFI DETAILS ----------
const char* WIFI_SSID = "Pi(10)";
const char* WIFI_PASS = "3141592653";

// Force a static IP so you always hit the same address.
// Updated for your 10.208.80.x network (Gateway: 10.208.80.31)
const IPAddress STATIC_IP(10, 208, 80, 200);      // New Static IP
const IPAddress GATEWAY_IP(10, 208, 80, 31);      // Your Router's Gateway
const IPAddress SUBNET_MASK(255, 255, 255, 0);    // Standard Subnet
const IPAddress DNS_IP(8, 8, 8, 8);

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
  Serial.println(">>> Received GET request on /status");
  IPAddress clientIP = server.client().remoteIP();
  Serial.print(">>> Client IP: ");
  Serial.println(clientIP);
  
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

  // Apply static network settings before connecting.
  // STATIC IP CONFIGURATION (Updated to match your 10.208.80.x network)
  if (!WiFi.config(STATIC_IP, GATEWAY_IP, SUBNET_MASK, DNS_IP)) {
    Serial.println("WARNING: Failed to configure static IP (WiFi.config).");
    Serial.println("ESP32 will use DHCP instead. Check your network settings!");
  } else {
    Serial.println("Static IP configuration applied successfully.");
    Serial.print("Configured IP: ");
    Serial.println(STATIC_IP);
  }

  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  const int maxAttempts = 50; // 20 seconds max (50 * 400ms)
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(400);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("ERROR: Failed to connect to WiFi!");
    Serial.println("Check your SSID and password.");
    return;
  }
  
  Serial.println("WiFi connected!");
  Serial.print("ESP32 IP Address: ");
  IPAddress actualIP = WiFi.localIP();
  Serial.println(actualIP);
  
  // Verify if static IP was actually applied
  if (actualIP != STATIC_IP) {
    Serial.println("⚠️ WARNING: Static IP was NOT applied!");
    Serial.print("Expected IP: ");
    Serial.println(STATIC_IP);
    Serial.print("Actual IP (from DHCP): ");
    Serial.println(actualIP);
    Serial.println("Frontend should connect to the ACTUAL IP shown above!");
  } else {
    Serial.println("✓ Static IP confirmed: matches configured IP");
  }
  
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("Subnet Mask: ");
  Serial.println(WiFi.subnetMask());
  Serial.print("RSSI (Signal Strength): ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
}

void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println("\n=== ESP32 PIR + NFC + Web API ===");

  // PIR - use INPUT (PIR sensors have their own output, no need for pull-up/pull-down)
  pinMode(PIR_PIN, INPUT);
  Serial.println("PIR sensor initialized on GPIO33. Waiting for sensor to stabilize...");
  
  // Check initial pin state
  int initialPinState = digitalRead(PIR_PIN);
  Serial.print("Initial PIR pin state: ");
  Serial.println(initialPinState == HIGH ? "HIGH" : "LOW");
  
  delay(10000);  // 10 second warm-up (reduced from 30)
  Serial.println("PIR sensor ready! Start testing motion detection.");
  
  // Check pin state after warm-up
  int warmupPinState = digitalRead(PIR_PIN);
  Serial.print("PIR pin state after warm-up: ");
  Serial.println(warmupPinState == HIGH ? "HIGH" : "LOW");

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
    Serial.println(">>> Received GET request on /");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain",
                "ESP32 PIR + NFC Status API. Use /status endpoint.");
  });
  
  // Add a simple test endpoint for debugging
  server.on("/test", HTTP_GET, []() {
    Serial.println(">>> Received GET request on /test");
    IPAddress clientIP = server.client().remoteIP();
    Serial.print(">>> Client IP: ");
    Serial.println(clientIP);
    server.sendHeader("Access-Control-Allow-Origin", "*");
    String response = "ESP32 is reachable! Server time: " + String(millis()) + "ms";
    server.send(200, "text/plain", response);
  });
  
  // Add a 404 handler to log all requests
  server.onNotFound([]() {
    Serial.print(">>> Received request for unknown path: ");
    Serial.println(server.uri());
    IPAddress clientIP = server.client().remoteIP();
    Serial.print(">>> Client IP: ");
    Serial.println(clientIP);
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(404, "text/plain", "Not Found");
  });

  server.begin();
  Serial.println("HTTP server started on port 80.");
  Serial.println("Server is ready to accept connections.");
  Serial.println("Test endpoints:");
  Serial.println("  - http://" + WiFi.localIP().toString() + "/");
  Serial.println("  - http://" + WiFi.localIP().toString() + "/test");
  Serial.println("  - http://" + WiFi.localIP().toString() + "/status");
}

void loop() {
  server.handleClient();

  unsigned long now = millis();

  // ---------- A) PIR MOTION (independent) ----------
  static bool lastPirState = LOW;
  static unsigned long lastMotionStatusPrint = 0;
  static unsigned long lastPinChangePrint = 0;
  bool pirState = digitalRead(PIR_PIN);

  // Print pin state change immediately for debugging
  if (pirState != lastPirState) {
    Serial.print("[PIN CHANGE] PIR Pin changed from ");
    Serial.print(lastPirState == HIGH ? "HIGH" : "LOW");
    Serial.print(" to ");
    Serial.println(pirState == HIGH ? "HIGH" : "LOW");
    lastPinChangePrint = now;
  }

  // Update timestamp ONLY on rising edge (when motion first detected)
  if (pirState == HIGH && lastPirState == LOW) {
    // Rising edge - new motion detected
    lastMotionMs = now;
    Serial.print(">>> PIR MOTION DETECTED! Timestamp updated at ");
    Serial.print(now);
    Serial.println(" ms");
  } else if (pirState == LOW && lastPirState == HIGH) {
    // Falling edge - motion stopped
    Serial.println(">>> PIR Motion ended (falling edge).");
  }
  lastPirState = pirState;

  // Print motion status every 2 seconds
  if (now - lastMotionStatusPrint >= 2000) {
    lastMotionStatusPrint = now;
    Serial.print("--- PIR Pin State: ");
    Serial.print(pirState == HIGH ? "HIGH" : "LOW");
    Serial.print(" | GPIO33 = ");
    Serial.println(pirState);
    
    if (lastMotionMs == 0) {
      Serial.println("--- PIR Status: No motion detected yet (INACTIVE).");
    } else {
      unsigned long motionAgo = (now - lastMotionMs) / 1000;
      if (motionAgo <= 10) {
        Serial.print("--- PIR Status: Motion detected ");
        Serial.print(motionAgo);
        Serial.println(" seconds ago (ACTIVE - within 10 sec window).");
      } else {
        Serial.print("--- PIR Status: Last motion was ");
        Serial.print(motionAgo);
        Serial.println(" seconds ago (INACTIVE - outside 10 sec window).");
      }
    }
  }

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
