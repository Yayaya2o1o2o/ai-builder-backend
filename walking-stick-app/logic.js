// Pure logic for the walking stick app. No DOM access here so it can be unit tested.

// Typical real-world heights (metres) of objects the camera model can recognise.
// Distance from the camera is estimated from how tall the object looks on screen.
export const OBJECT_HEIGHTS = {
  person: 1.7,
  bicycle: 1.0,
  car: 1.5,
  motorcycle: 1.1,
  bus: 3.0,
  truck: 3.0,
  "traffic light": 1.0,
  "fire hydrant": 0.75,
  "stop sign": 0.75,
  bench: 0.85,
  dog: 0.6,
  cat: 0.3,
  chair: 0.9,
  couch: 0.85,
  "potted plant": 0.6,
  bed: 0.6,
  "dining table": 0.75,
  toilet: 0.75,
  tv: 0.6,
  refrigerator: 1.75,
  suitcase: 0.65,
  backpack: 0.5,
  umbrella: 1.0,
  "parking meter": 1.4,
};

// Typical widths (metres), used when an object is cut off at the top or bottom
// of the picture and its full height can't be seen.
export const OBJECT_WIDTHS = {
  person: 0.5,
  bicycle: 1.7,
  car: 1.8,
  bus: 2.5,
  truck: 2.5,
  bench: 1.5,
  chair: 0.5,
  couch: 1.9,
  "dining table": 1.2,
  refrigerator: 0.8,
  tv: 1.0,
};

// Friendlier spoken names for some model labels.
const SPOKEN_NAMES = {
  "dining table": "table",
  tv: "screen",
  "potted plant": "plant",
  "fire hydrant": "fire hydrant",
};

export function spokenName(label) {
  return SPOKEN_NAMES[label] || label;
}

// Focal length in pixels, assuming a typical phone main camera
// (about 65 degrees across the long side of the image).
export function focalLengthPx(frameWidth, frameHeight, fovDegrees = 65) {
  const longSide = Math.max(frameWidth, frameHeight);
  return longSide / 2 / Math.tan((fovDegrees * Math.PI) / 360);
}

// Estimate distance (metres) to a detected object using the pinhole camera model.
// bbox is [x, y, width, height] in pixels. Returns null if the object type is unknown.
export function estimateDistance(label, bbox, frameWidth, frameHeight) {
  const realHeight = OBJECT_HEIGHTS[label];
  if (!realHeight) return null;
  const [, y, , h] = bbox;
  if (h <= 0) return null;
  const f = focalLengthPx(frameWidth, frameHeight);
  let d = (realHeight * f) / h;
  // If the box is cut off by the top or bottom of the frame the object is taller
  // than it looks, so the height estimate is too far. Use its width instead.
  const cutOff = y <= 2 || y + h >= frameHeight - 2;
  const realWidth = OBJECT_WIDTHS[label];
  if (cutOff && realWidth && bbox[2] > 0) d = Math.min(d, (realWidth * f) / bbox[2]);
  return Math.max(0.2, d);
}

// Where an object is horizontally: "left", "slightly left", "ahead", ...
export function direction(bbox, frameWidth) {
  const centre = (bbox[0] + bbox[2] / 2) / frameWidth;
  if (centre < 0.2) return "on your left";
  if (centre < 0.4) return "slightly left";
  if (centre <= 0.6) return "ahead";
  if (centre <= 0.8) return "slightly right";
  return "on your right";
}

// Distance zones drive beeps and vibration. Closer = faster.
export const ZONES = [
  { name: "danger", max: 0.6, beepMs: 120 },
  { name: "near", max: 1.2, beepMs: 300 },
  { name: "medium", max: 2.5, beepMs: 650 },
  { name: "far", max: 4.0, beepMs: 1200 },
];

export function zoneFor(distance) {
  if (distance == null || !isFinite(distance)) return null;
  return ZONES.find((z) => distance <= z.max) || null;
}

export const STEP_LENGTH_M = 0.7;

// Human friendly spoken distance in the chosen unit.
export function formatDistance(metres, unit = "steps") {
  if (metres == null) return "";
  if (unit === "feet") {
    const ft = Math.max(1, Math.round(metres * 3.281));
    return `${ft} ${ft === 1 ? "foot" : "feet"}`;
  }
  if (unit === "metres") {
    if (metres < 1) return "less than 1 metre";
    const m = metres < 3 ? Math.round(metres * 2) / 2 : Math.round(metres);
    return `${m} ${m === 1 ? "metre" : "metres"}`;
  }
  const steps = Math.max(1, Math.round(metres / STEP_LENGTH_M));
  return `${steps} ${steps === 1 ? "step" : "steps"}`;
}

// Compare two small grayscale frames (Uint8 arrays, same size, row-major)
// and return how much changed in the left, centre and right thirds (0..1).
export function motionByRegion(prev, curr, width, height, threshold = 30) {
  const counts = [0, 0, 0];
  const totals = [0, 0, 0];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const r = x < width / 3 ? 0 : x < (2 * width) / 3 ? 1 : 2;
      totals[r]++;
      if (Math.abs(curr[i] - prev[i]) > threshold) counts[r]++;
    }
  }
  return counts.map((c, i) => c / totals[i]);
}

// Decide whether frame changes mean something is moving in front of the user.
// When the whole picture changes the phone itself is moving (the user is walking),
// so that is ignored. Returns "left" | "ahead" | "right" | null.
export function detectMovement(regions, { minChange = 0.08, globalChange = 0.35 } = {}) {
  const avg = (regions[0] + regions[1] + regions[2]) / 3;
  if (avg > globalChange) return null;
  const max = Math.max(...regions);
  if (max < minChange) return null;
  // Require the moving area to stand out from the background.
  const others = regions.filter((r) => r !== max);
  const otherAvg = others.length ? others.reduce((a, b) => a + b, 0) / others.length : 0;
  if (max < otherAvg * 2 && avg > minChange) return null;
  return ["left", "ahead", "right"][regions.indexOf(max)];
}

// Median of the most recent readings, to stop the estimate jumping between frames.
export function smoothedDistance(history, count = 5) {
  const values = history.slice(-count).map((h) => h.distance).sort((a, b) => a - b);
  if (!values.length) return null;
  const mid = Math.floor(values.length / 2);
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

// Track objects across frames to tell when something is coming towards the user.
// history: array of { t, distance } for one object type, oldest first.
// Returns approach speed in metres/second (positive = getting closer).
export function approachSpeed(history, windowMs = 1500) {
  if (history.length < 3) return 0;
  const latest = history[history.length - 1];
  const recent = history.filter((h) => latest.t - h.t <= windowMs);
  if (recent.length < 3) return 0;
  const first = recent[0];
  const dt = (latest.t - first.t) / 1000;
  if (dt < 0.4) return 0;
  return (first.distance - latest.distance) / dt;
}
