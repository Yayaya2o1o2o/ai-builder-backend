import { describe, expect, test } from "vitest";
import {
  estimateDistance,
  direction,
  zoneFor,
  formatDistance,
  motionByRegion,
  detectMovement,
  approachSpeed,
  focalLengthPx,
  smoothedDistance,
} from "./logic.js";

describe("estimateDistance", () => {
  test("a person filling half a 480px-tall frame is a few metres away", () => {
    const d = estimateDistance("person", [200, 120, 80, 240], 640, 480);
    const expected = (1.7 * focalLengthPx(640, 480)) / 240;
    expect(d).toBeCloseTo(expected, 5);
    expect(d).toBeGreaterThan(3);
    expect(d).toBeLessThan(4);
  });

  test("bigger on screen means closer", () => {
    const far = estimateDistance("chair", [0, 100, 50, 50], 640, 480);
    const near = estimateDistance("chair", [0, 100, 150, 200], 640, 480);
    expect(near).toBeLessThan(far);
  });

  test("objects cut off by the frame edge use their width instead", () => {
    // Waist-up person, 200px wide, legs below the frame.
    const d = estimateDistance("person", [100, 180, 200, 300], 640, 480);
    expect(d).toBeCloseTo((0.5 * focalLengthPx(640, 480)) / 200, 5);
  });

  test("unknown objects return null", () => {
    expect(estimateDistance("banana", [0, 0, 10, 10], 640, 480)).toBeNull();
  });
});

test("direction", () => {
  expect(direction([0, 0, 50, 50], 640)).toBe("on your left");
  expect(direction([290, 0, 60, 50], 640)).toBe("ahead");
  expect(direction([600, 0, 40, 50], 640)).toBe("on your right");
});

test("zoneFor", () => {
  expect(zoneFor(0.4).name).toBe("danger");
  expect(zoneFor(1).name).toBe("near");
  expect(zoneFor(2).name).toBe("medium");
  expect(zoneFor(3.5).name).toBe("far");
  expect(zoneFor(10)).toBeNull();
  expect(zoneFor(null)).toBeNull();
});

test("formatDistance", () => {
  expect(formatDistance(1.4, "steps")).toBe("2 steps");
  expect(formatDistance(0.5, "steps")).toBe("1 step");
  expect(formatDistance(0.5, "metres")).toBe("less than 1 metre");
  expect(formatDistance(2.2, "metres")).toBe("2 metres");
  expect(formatDistance(1, "feet")).toBe("3 feet");
});

describe("motion", () => {
  const W = 30;
  const H = 10;
  const blank = () => new Uint8Array(W * H);

  test("movement only on the right side is reported as right", () => {
    const prev = blank();
    const curr = blank();
    for (let y = 0; y < H; y++) for (let x = 22; x < 28; x++) curr[y * W + x] = 200;
    expect(detectMovement(motionByRegion(prev, curr, W, H))).toBe("right");
  });

  test("whole frame changing (user walking) is ignored", () => {
    const prev = blank();
    const curr = blank().fill(200);
    expect(detectMovement(motionByRegion(prev, curr, W, H))).toBeNull();
  });

  test("no change means no movement", () => {
    expect(detectMovement(motionByRegion(blank(), blank(), W, H))).toBeNull();
  });
});

test("smoothedDistance ignores a single bad reading", () => {
  const hist = [2, 2.1, 9, 2.2, 1.9].map((distance, t) => ({ t, distance }));
  expect(smoothedDistance(hist)).toBe(2.1);
  expect(smoothedDistance([])).toBeNull();
});

test("approachSpeed", () => {
  const hist = [
    { t: 0, distance: 5 },
    { t: 500, distance: 4.5 },
    { t: 1000, distance: 4 },
  ];
  expect(approachSpeed(hist)).toBeCloseTo(1, 5);
  expect(approachSpeed(hist.slice(0, 2))).toBe(0);
});
