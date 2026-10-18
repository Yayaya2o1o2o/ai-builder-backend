# Guide Stick

A phone app that works alongside a white cane. It uses the phone's back camera, and an optional
distance sensor on the cane, to warn about obstacles, say how far away things are, and announce
movement.

**This is a mobility aid, not a replacement for a cane, a guide dog, or orientation and mobility training.**
Distances from the camera are estimates.

## What it does

| Feature | How |
| --- | --- |
| **How far away is it** | Recognises common objects (people, cars, bikes, chairs, benches, traffic lights, signs, dogs, tables…) and estimates distance from their size in the picture. Spoken in **steps** (default), metres, or feet. |
| **Something is coming towards you** | Tracks each object's distance over time and warns when it is getting closer quickly. |
| **Movement detection** | Compares camera frames and says "Movement on your left / ahead / on your right". Ignores the picture shifting because you are walking. |
| **Parking-sensor feedback** | Beeps and vibrations get faster and higher pitched as the nearest obstacle ahead gets closer. Under about 60 cm: "Stop" warning. |
| **Accurate distance (optional)** | A cheap ultrasonic sensor on the cane (see `../firmware`) sends exact distance to the phone over Bluetooth, and buzzes the handle by itself. |

## Using it

The screen has one big button and four smaller ones. Everything is spoken aloud, and the buttons are
labelled for VoiceOver and TalkBack.

- **Big button (top half of the screen):** start / stop.
- **What's ahead?:** says the current nearest object and distance.
- **Unit:** switches between steps, metres and feet.
- **Connect stick sensor:** pairs the optional cane sensor.
- **Help:** reads the instructions aloud.

Hold the phone at chest height with the back camera facing forward (a chest harness or lanyard
works well), or clip it to the cane. The screen stays on while guiding.

## Running it

It is a static web app with no build step. Camera access requires **HTTPS** (or `localhost`).

```bash
# Local test
cd walking-stick-app
python3 -m http.server 8080
# open http://localhost:8080
```

To use it on a phone, host the folder on any HTTPS static host (Netlify, Vercel, GitHub Pages,
Cloudflare Pages). On the phone, open the link and choose **Add to Home Screen**. After the first
launch with internet it also works offline, because the app and the recognition model are cached.

Tests for the distance, motion and speech logic:

```bash
npx vitest run walking-stick-app
```

## Phone support

| | Android (Chrome) | iPhone (Safari) |
| --- | --- | --- |
| Camera, object distance, motion, speech, beeps | Yes | Yes |
| Vibration | Yes | **No** (Safari doesn't allow it; beeps and speech still work) |
| Stick sensor (Bluetooth) | Yes | **No** (Safari has no Web Bluetooth; use the sensor's own handle buzzer) |

## Limits to know about

- Camera distances are estimated from typical object sizes, so expect errors of about 20–40%.
  Unusual objects (a child vs. an adult, a toy car) will be off.
- The camera recognises about 25 common object types. It does **not** reliably detect kerbs,
  steps, holes, glass doors, low branches or wires. A cane, or the ultrasonic stick sensor,
  is still needed for these.
- It works best in daylight or good lighting.
- Object recognition runs on the phone, so it uses battery (roughly like recording video).
- The model downloads (~5 MB) the first time the app is opened online.
