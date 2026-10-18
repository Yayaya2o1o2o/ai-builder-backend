import {
  estimateDistance,
  direction,
  zoneFor,
  formatDistance,
  spokenName,
  motionByRegion,
  detectMovement,
  approachSpeed,
  smoothedDistance,
} from "./logic.js";

// Bluetooth IDs shared with firmware/guide_stick_sensor/guide_stick_sensor.ino
const STICK_SERVICE = "a7c0e1b0-5f3e-4c6a-9d2b-1e7f00c0de01";
const STICK_DISTANCE_CHAR = "a7c0e1b0-5f3e-4c6a-9d2b-1e7f00c0de02";

const UNITS = ["steps", "metres", "feet"];
const DETECT_EVERY_MS = 250;
const MOTION_W = 64;
const MOTION_H = 48;

const $ = (id) => document.getElementById(id);
const els = {
  status: $("status"),
  detail: $("detail"),
  main: $("main"),
  repeat: $("repeat"),
  units: $("units"),
  stick: $("stick"),
  help: $("help"),
  video: $("video"),
  overlay: $("overlay"),
  preview: document.querySelector(".preview"),
};

const state = {
  running: false,
  unit: loadSetting("unit", "steps"),
  model: null,
  modelLoading: null,
  stream: null,
  wakeLock: null,
  audio: null,
  lastMessage: "Tap the big button to start.",
  lastSpokenAt: 0,
  spokenAt: new Map(), // message key -> time last spoken
  cameraNearest: null, // { distance, label, dir, t }
  stickDistance: null, // { distance, t }
  stickDevice: null,
  history: new Map(), // label -> [{ t, distance }]
  prevFrame: null,
  lastMotionAt: 0,
  detectTimer: null,
  feedbackTimer: null,
};

const motionCanvas = document.createElement("canvas");
motionCanvas.width = MOTION_W;
motionCanvas.height = MOTION_H;
const motionCtx = motionCanvas.getContext("2d", { willReadFrequently: true });

// ---------- Settings ----------

function loadSetting(key, fallback) {
  try {
    return localStorage.getItem("guidestick." + key) || fallback;
  } catch {
    return fallback;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem("guidestick." + key, value);
  } catch {
    // Storage can be blocked; the setting just won't be remembered.
  }
}

// ---------- Speech, sound and vibration ----------

// Automatic messages that aren't urgent wait at least this long after the previous one.
const CALM_GAP_MS = 2500;

function speak(text, { urgent = false, key = text, minGapMs = 0, auto = false } = {}) {
  text = text.charAt(0).toUpperCase() + text.slice(1);
  const now = Date.now();
  const lastForKey = state.spokenAt.get(key) || 0;
  if (now - lastForKey < minGapMs) return;
  if (auto && !urgent && now - state.lastSpokenAt < CALM_GAP_MS) return;
  const canSpeak = "speechSynthesis" in window;
  // Don't pile messages up; a non-urgent one is dropped while another is being spoken.
  if (!urgent && canSpeak && speechSynthesis.speaking) return;
  state.lastMessage = text;
  state.spokenAt.set(key, now);
  state.lastSpokenAt = now;
  showStatus(text);
  if (!canSpeak) return;
  if (urgent) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  u.lang = document.documentElement.lang || "en";
  speechSynthesis.speak(u);
}

function showStatus(text, detail) {
  els.status.textContent = text;
  if (detail !== undefined) els.detail.textContent = detail;
}

function ensureAudio() {
  if (!state.audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) state.audio = new Ctx();
  }
  if (state.audio && state.audio.state === "suspended") state.audio.resume();
}

function beep(freq, ms) {
  const ctx = state.audio;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + ms / 1000);
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// The closest thing we know about right now, from the stick sensor or the camera.
function nearestObstacle() {
  const now = Date.now();
  const candidates = [];
  if (state.stickDistance && now - state.stickDistance.t < 1000) candidates.push(state.stickDistance.distance);
  if (state.cameraNearest && now - state.cameraNearest.t < 1000 && state.cameraNearest.dir === "ahead") {
    candidates.push(state.cameraNearest.distance);
  }
  return candidates.length ? Math.min(...candidates) : null;
}

// Parking-sensor style feedback: beeps and buzzes get faster as things get closer.
function feedbackLoop() {
  if (!state.running) return;
  const zone = zoneFor(nearestObstacle());
  let wait = 400;
  if (zone) {
    const freq = { danger: 1400, near: 1100, medium: 880, far: 660 }[zone.name];
    beep(freq, zone.name === "danger" ? 90 : 60);
    vibrate(zone.name === "danger" ? 100 : 50);
    wait = zone.beepMs;
  }
  state.feedbackTimer = setTimeout(feedbackLoop, wait);
}

// ---------- Camera, object recognition and motion ----------

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
  state.stream = stream;
  els.video.srcObject = stream;
  await els.video.play();
  els.preview.classList.add("visible");
}

function stopCamera() {
  if (state.stream) state.stream.getTracks().forEach((t) => t.stop());
  state.stream = null;
  els.video.srcObject = null;
  els.preview.classList.remove("visible");
}

function loadModel() {
  if (state.model) return Promise.resolve(state.model);
  if (!state.modelLoading) {
    if (!window.cocoSsd) return Promise.reject(new Error("model library not loaded"));
    state.modelLoading = window.cocoSsd
      .load({ base: "lite_mobilenet_v2" })
      .then((m) => (state.model = m))
      .catch((e) => {
        state.modelLoading = null;
        throw e;
      });
  }
  return state.modelLoading;
}

async function detectLoop() {
  if (!state.running) return;
  const started = performance.now();
  try {
    const v = els.video;
    if (v.readyState >= 2 && v.videoWidth) {
      if (state.model) await handleDetections(await state.model.detect(v, 10, 0.5), v.videoWidth, v.videoHeight);
      handleMotion(v);
    }
  } catch (e) {
    console.error(e);
  }
  const elapsed = performance.now() - started;
  state.detectTimer = setTimeout(detectLoop, Math.max(0, DETECT_EVERY_MS - elapsed));
}

async function handleDetections(predictions, w, h) {
  const now = Date.now();
  const objects = predictions
    .map((p) => ({
      label: p.class,
      bbox: p.bbox,
      distance: estimateDistance(p.class, p.bbox, w, h),
      dir: direction(p.bbox, w),
    }))
    .filter((o) => o.distance != null)
    .sort((a, b) => a.distance - b.distance);

  drawOverlay(objects, w, h);

  // Remember recent distances of the closest object of each type, to smooth out
  // jumpy estimates and to notice things coming closer. Objects are sorted, so the
  // first of each label is the closest.
  const seen = new Set();
  for (const o of objects) {
    if (seen.has(o.label)) continue;
    seen.add(o.label);
    const hist = state.history.get(o.label) || [];
    hist.push({ t: now, distance: o.distance });
    while (hist.length && now - hist[0].t > 3000) hist.shift();
    state.history.set(o.label, hist);
    o.distance = smoothedDistance(hist);
  }

  const nearest = objects.filter((o) => seen.has(o.label)).sort((a, b) => a.distance - b.distance)[0];
  if (!nearest) {
    state.cameraNearest = null;
    showStatus(state.lastMessage, "Path looks clear");
    return;
  }
  state.cameraNearest = { ...nearest, t: now };

  const name = spokenName(nearest.label);
  const dist = formatDistance(nearest.distance, state.unit);
  const zone = zoneFor(nearest.distance);
  els.detail.textContent = `${name}, ${dist}, ${nearest.dir}`;

  if (zone && zone.name === "danger") {
    speak(`Stop. ${name} very close, ${nearest.dir}.`, { urgent: true, key: "danger:" + nearest.label, minGapMs: 4000 });
    return;
  }

  const speed = approachSpeed(state.history.get(nearest.label) || []);
  if (speed > 0.6 && nearest.distance < 6) {
    speak(`${name} coming towards you, ${dist}, ${nearest.dir}.`, { key: "approach:" + nearest.label, minGapMs: 5000, auto: true });
    return;
  }

  if (zone) {
    // Keyed on object and zone only, so small direction wobbles don't trigger repeats.
    speak(`${name}, ${dist}, ${nearest.dir}.`, { key: `obj:${nearest.label}:${zone.name}`, minGapMs: 6000, auto: true });
  }
}

function handleMotion(video) {
  motionCtx.drawImage(video, 0, 0, MOTION_W, MOTION_H);
  const { data } = motionCtx.getImageData(0, 0, MOTION_W, MOTION_H);
  const gray = new Uint8Array(MOTION_W * MOTION_H);
  for (let i = 0; i < gray.length; i++) {
    gray[i] = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) | 0;
  }
  const prev = state.prevFrame;
  state.prevFrame = gray;
  if (!prev) return;

  const side = detectMovement(motionByRegion(prev, gray, MOTION_W, MOTION_H));
  if (!side) return;
  const now = Date.now();
  // Object announcements are more useful, so motion only speaks when nothing else has recently.
  if (now - state.lastMotionAt < 4000 || now - state.lastSpokenAt < 2500) return;
  state.lastMotionAt = now;
  const where = side === "ahead" ? "ahead of you" : `on your ${side}`;
  speak(`Movement ${where}.`, { key: "motion:" + side, minGapMs: 4000, auto: true });
}

function drawOverlay(objects, w, h) {
  const c = els.overlay;
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 4;
  ctx.font = "bold 20px system-ui";
  for (const o of objects) {
    const [x, y, bw, bh] = o.bbox;
    ctx.strokeStyle = "#ffd400";
    ctx.strokeRect(x, y, bw, bh);
    const text = `${o.label} ${o.distance.toFixed(1)}m`;
    ctx.fillStyle = "#000";
    ctx.fillRect(x, Math.max(0, y - 26), ctx.measureText(text).width + 8, 26);
    ctx.fillStyle = "#ffd400";
    ctx.fillText(text, x + 4, Math.max(20, y - 6));
  }
}

// ---------- Optional stick sensor over Bluetooth ----------

async function connectStick() {
  ensureAudio();
  if (!navigator.bluetooth) {
    speak("This phone or browser can't connect to the stick sensor. Use Chrome on Android. The camera still works without it.", { urgent: true });
    return;
  }
  try {
    speak("Looking for the stick sensor.", { urgent: true });
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [STICK_SERVICE] }, { namePrefix: "GuideStick" }],
      optionalServices: [STICK_SERVICE],
    });
    device.addEventListener("gattserverdisconnected", onStickDisconnected);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(STICK_SERVICE);
    const ch = await service.getCharacteristic(STICK_DISTANCE_CHAR);
    ch.addEventListener("characteristicvaluechanged", onStickReading);
    await ch.startNotifications();
    state.stickDevice = device;
    els.stick.classList.add("on");
    els.stick.textContent = "Stick connected";
    els.stick.setAttribute("aria-label", "Stick sensor connected. Double tap to disconnect.");
    speak("Stick sensor connected.", { urgent: true });
  } catch (e) {
    console.error(e);
    if (e.name !== "NotFoundError") speak("Could not connect to the stick sensor.", { urgent: true });
    else speak("No stick sensor chosen.", { urgent: true });
  }
}

function onStickReading(event) {
  const cm = event.target.value.getUint16(0, true);
  // 0 means nothing in range.
  state.stickDistance = cm > 0 ? { distance: cm / 100, t: Date.now() } : null;
  if (!state.running || !state.stickDistance) return;
  const zone = zoneFor(state.stickDistance.distance);
  if (zone && zone.name === "danger") {
    speak("Stop. Obstacle very close.", { urgent: true, key: "stick:danger", minGapMs: 3000 });
  } else if (zone && zone.name === "near") {
    speak(`Obstacle, ${formatDistance(state.stickDistance.distance, state.unit)}.`, { key: "stick:near", minGapMs: 4000, auto: true });
  }
}

function onStickDisconnected() {
  state.stickDevice = null;
  state.stickDistance = null;
  els.stick.classList.remove("on");
  els.stick.textContent = "Connect stick sensor";
  els.stick.setAttribute("aria-label", "Connect stick sensor. Optional, for more accurate distance.");
  speak("Stick sensor disconnected.", { urgent: true });
}

// ---------- Start / stop ----------

async function start() {
  ensureAudio();
  state.running = true;
  els.main.textContent = "STOP";
  els.main.classList.add("running");
  els.main.setAttribute("aria-label", "Stop guiding. Double tap to stop.");
  speak("Starting. Point the phone forward.", { urgent: true });

  try {
    if ("wakeLock" in navigator) state.wakeLock = await navigator.wakeLock.request("screen");
  } catch {
    // Not critical; the screen may turn off.
  }

  let cameraOk = true;
  try {
    await startCamera();
  } catch (e) {
    console.error(e);
    cameraOk = false;
    speak(
      state.stickDevice
        ? "Camera not available. Using the stick sensor only."
        : "Camera not available. Please allow camera access, or connect the stick sensor.",
      { urgent: true }
    );
  }

  feedbackLoop();
  if (!cameraOk) return;
  detectLoop();

  loadModel()
    .then(() => state.running && speak("Ready. I will tell you what is ahead.", { urgent: true }))
    .catch((e) => {
      console.error(e);
      if (state.running) speak("Object names unavailable. Motion and stick sensor still work.", { urgent: true });
    });
}

function stop() {
  state.running = false;
  clearTimeout(state.detectTimer);
  clearTimeout(state.feedbackTimer);
  stopCamera();
  state.prevFrame = null;
  state.cameraNearest = null;
  state.history.clear();
  if (state.wakeLock) state.wakeLock.release().catch(() => {});
  state.wakeLock = null;
  els.main.textContent = "START";
  els.main.classList.remove("running");
  els.main.setAttribute("aria-label", "Start guiding. Double tap to start.");
  showStatus("Stopped", "");
  speak("Stopped.", { urgent: true });
}

// ---------- Buttons ----------

els.main.addEventListener("click", () => (state.running ? stop() : start()));

els.repeat.addEventListener("click", () => {
  ensureAudio();
  let msg = state.lastMessage;
  if (state.running) {
    const near = state.cameraNearest && Date.now() - state.cameraNearest.t < 1500 ? state.cameraNearest : null;
    const stick = state.stickDistance && Date.now() - state.stickDistance.t < 1500 ? state.stickDistance : null;
    const parts = [];
    if (near) parts.push(`${spokenName(near.label)}, ${formatDistance(near.distance, state.unit)}, ${near.dir}`);
    if (stick) parts.push(`stick sensor: obstacle ${formatDistance(stick.distance, state.unit)}`);
    msg = parts.length ? parts.join(". ") + "." : "Nothing detected ahead.";
  }
  speak(msg, { urgent: true });
});

function updateUnitButton() {
  els.units.textContent = `Unit: ${state.unit}`;
  els.units.setAttribute("aria-label", `Distance unit: ${state.unit}. Double tap to change.`);
}

els.units.addEventListener("click", () => {
  ensureAudio();
  state.unit = UNITS[(UNITS.indexOf(state.unit) + 1) % UNITS.length];
  saveSetting("unit", state.unit);
  updateUnitButton();
  speak(`Distances in ${state.unit}.`, { urgent: true });
});

els.stick.addEventListener("click", () => {
  if (state.stickDevice && state.stickDevice.gatt.connected) state.stickDevice.gatt.disconnect();
  else connectStick();
});

els.help.addEventListener("click", () => {
  ensureAudio();
  speak(
    "Guide Stick. The big button at the top half of the screen starts and stops guiding. " +
      "Hold the phone at chest height with the back camera facing forward, or clip it to the stick. " +
      "Beeps and vibrations get faster as you get closer to something. " +
      "I will say what is ahead, how far it is, and if something is moving or coming towards you. " +
      "Below the big button: What's ahead repeats the latest information. Unit changes between steps, metres and feet. " +
      "Connect stick sensor links an optional distance sensor on your cane. " +
      "This app is an aid. Always keep using your cane.",
    { urgent: true }
  );
});

document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible" && state.running && !state.wakeLock && "wakeLock" in navigator) {
    try {
      state.wakeLock = await navigator.wakeLock.request("screen");
    } catch {
      // ignore
    }
  }
  if (document.visibilityState === "hidden") state.wakeLock = null;
});

updateUnitButton();
if (window.cocoSsd) loadModel().catch(() => {}); // warm up early so start is fast

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
