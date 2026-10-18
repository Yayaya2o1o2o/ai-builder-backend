# Guide Stick sensor (optional hardware)

An ultrasonic distance sensor mounted on the cane. It gives exact distance (2 cm – 4 m) to whatever
the cane points at, sends it to the Guide Stick app over Bluetooth, and buzzes a motor in the handle
so it also works with no phone at all.

## Parts (about $15)

- ESP32 dev board (ESP32-C3 SuperMini or ESP32 DevKitC)
- HC-SR04 ultrasonic sensor (or JSN-SR04T, the waterproof version — better outdoors)
- Small coin vibration motor + NPN transistor (2N2222) + 1k resistor + diode (optional)
- 1k and 2k resistors for the echo-pin voltage divider
- USB power bank or 3.7 V LiPo with a 5 V boost board

## Wiring

| Sensor | ESP32 |
| --- | --- |
| VCC | 5V |
| GND | GND |
| TRIG | GPIO 5 |
| ECHO | GPIO 18 **through a 1k/2k divider** (the sensor outputs 5 V, the ESP32 takes 3.3 V) |

Vibration motor: GPIO 4 → 1k → transistor base; motor between 3.3 V and collector; emitter to GND;
diode across the motor.

Mount the sensor about a third of the way down the cane, facing forward and slightly upward, so it
catches obstacles at waist and chest height that a cane tip misses.

## Flashing

1. Install the Arduino IDE and add the ESP32 boards (Boards Manager → "esp32" by Espressif).
2. Open `guide_stick_sensor/guide_stick_sensor.ino`, select your board, and upload.
3. In the app, tap **Connect stick sensor** and pick **GuideStick**.

Buzzing pattern in the handle: off beyond 1.5 m, slow pulse under 1.5 m, faster under 1 m, rapid under 50 cm.
