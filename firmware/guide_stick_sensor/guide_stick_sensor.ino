// Guide Stick distance sensor
// Board: ESP32 (any dev board, e.g. ESP32-C3 SuperMini or ESP32 DevKitC)
// Sensor: HC-SR04 / JSN-SR04T ultrasonic sensor, pointing forward on the cane
//
// Wiring:
//   Sensor VCC  -> 5V (VBUS)
//   Sensor GND  -> GND
//   Sensor TRIG -> GPIO 5
//   Sensor ECHO -> GPIO 18 through a voltage divider (1k / 2k) to bring 5V down to 3.3V
//   Optional vibration motor (via transistor) -> GPIO 4
//
// Sends the distance in centimetres (uint16, little endian) about 10 times a second
// over Bluetooth Low Energy. 0 means nothing in range.

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define TRIG_PIN 5
#define ECHO_PIN 18
#define MOTOR_PIN 4
#define MAX_CM 400

// Must match walking-stick-app/app.js
#define SERVICE_UUID  "a7c0e1b0-5f3e-4c6a-9d2b-1e7f00c0de01"
#define DISTANCE_UUID "a7c0e1b0-5f3e-4c6a-9d2b-1e7f00c0de02"

BLECharacteristic *distanceChar;
bool connected = false;

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *s) override { connected = true; }
  void onDisconnect(BLEServer *s) override {
    connected = false;
    BLEDevice::startAdvertising();
  }
};

uint16_t readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long us = pulseIn(ECHO_PIN, HIGH, 30000);  // ~5 m timeout
  if (us == 0) return 0;
  uint16_t cm = us / 58;
  return cm > MAX_CM ? 0 : cm;
}

// Median of 3 readings removes most random spikes.
uint16_t filteredDistanceCm() {
  uint16_t a = readDistanceCm(); delay(10);
  uint16_t b = readDistanceCm(); delay(10);
  uint16_t c = readDistanceCm();
  return max(min(a, b), min(max(a, b), c));
}

// Buzz the handle directly too, so the stick works even without the phone.
void updateMotor(uint16_t cm) {
  static unsigned long last = 0;
  static bool on = false;
  unsigned long interval;
  if (cm == 0 || cm > 150) { digitalWrite(MOTOR_PIN, LOW); on = false; return; }
  if (cm < 50) interval = 80;
  else if (cm < 100) interval = 200;
  else interval = 400;
  if (millis() - last > interval) {
    on = !on;
    digitalWrite(MOTOR_PIN, on ? HIGH : LOW);
    last = millis();
  }
}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(MOTOR_PIN, OUTPUT);

  BLEDevice::init("GuideStick");
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());
  BLEService *service = server->createService(SERVICE_UUID);
  distanceChar = service->createCharacteristic(
      DISTANCE_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  distanceChar->addDescriptor(new BLE2902());
  service->start();

  BLEAdvertising *adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(SERVICE_UUID);
  adv->setScanResponse(true);
  BLEDevice::startAdvertising();
}

void loop() {
  uint16_t cm = filteredDistanceCm();
  updateMotor(cm);
  if (connected) {
    uint8_t buf[2] = { (uint8_t)(cm & 0xFF), (uint8_t)(cm >> 8) };
    distanceChar->setValue(buf, 2);
    distanceChar->notify();
  }
  delay(60);
}
