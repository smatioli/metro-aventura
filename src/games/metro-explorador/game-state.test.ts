import { describe, expect, it } from "vitest";
import {
  facingFor,
  nextStationAnnouncementText,
  rideAnnouncementFor,
  rideProgress,
  SCENE_BOUNDS,
  stepPosition,
  walkZonesFor,
  zoneAt
} from "./game-state";
import { lines } from "../metro-aventura/data";
import { routeFor } from "../metro-aventura/game-state";

describe("station walk zones", () => {
  it("resolves a point inside each zone to that zone's id", () => {
    const zones = walkZonesFor("right");
    for (const zone of zones) {
      const center = { x: zone.rect.x + zone.rect.w / 2, y: zone.rect.y + zone.rect.h / 2 };
      expect(zoneAt(center, zones)).toBe(zone.id);
    }
  });

  it("resolves open space outside every zone to null", () => {
    const zones = walkZonesFor("right");
    expect(zoneAt({ x: 15, y: 45 }, zones)).toBeNull();
  });

  it("resolves the train door hitzone on the correct side", () => {
    expect(zoneAt({ x: 80, y: 15 }, walkZonesFor("right"))).toBe("trem-portas");
    expect(zoneAt({ x: 10, y: 15 }, walkZonesFor("left"))).toBe("trem-portas");
    expect(zoneAt({ x: 80, y: 15 }, walkZonesFor("left"))).not.toBe("trem-portas");
  });
});

describe("stepPosition", () => {
  it("clamps each axis independently at the scene bounds", () => {
    expect(stepPosition({ x: SCENE_BOUNDS.minX, y: 50 }, -1, 0, 20)).toEqual({ x: SCENE_BOUNDS.minX, y: 50 });
    expect(stepPosition({ x: SCENE_BOUNDS.maxX, y: 50 }, 1, 0, 20)).toEqual({ x: SCENE_BOUNDS.maxX, y: 50 });
    expect(stepPosition({ x: 50, y: SCENE_BOUNDS.minY }, 0, -1, 20)).toEqual({ x: 50, y: SCENE_BOUNDS.minY });
    expect(stepPosition({ x: 50, y: SCENE_BOUNDS.maxY }, 0, 1, 20)).toEqual({ x: 50, y: SCENE_BOUNDS.maxY });
  });

  it("clamps a diagonal overshoot on both axes without exceeding bounds", () => {
    const result = stepPosition({ x: SCENE_BOUNDS.maxX, y: SCENE_BOUNDS.maxY }, 1, 1, 50);
    expect(result.x).toBeLessThanOrEqual(SCENE_BOUNDS.maxX);
    expect(result.y).toBeLessThanOrEqual(SCENE_BOUNDS.maxY);
  });

  it("moves a normalized diagonal vector by the requested distance", () => {
    const start = { x: 50, y: 50 };
    const diag = Math.SQRT1_2;
    const result = stepPosition(start, diag, diag, 10);
    const moved = Math.hypot(result.x - start.x, result.y - start.y);
    expect(moved).toBeCloseTo(10, 5);
  });
});

describe("facingFor", () => {
  it("picks the dominant axis", () => {
    expect(facingFor(1, 0, "down")).toBe("right");
    expect(facingFor(-1, 0, "down")).toBe("left");
    expect(facingFor(0, 1, "down")).toBe("down");
    expect(facingFor(0, -1, "down")).toBe("up");
    expect(facingFor(1, 0.2, "down")).toBe("right");
  });

  it("keeps the fallback facing when idle", () => {
    expect(facingFor(0, 0, "left")).toBe("left");
  });
});

describe("ride announcements", () => {
  const route = ["A", "B", "C"];

  it("returns current/next for a mid-route index", () => {
    expect(rideAnnouncementFor(route, 1)).toEqual({ current: "B", next: "C", isTerminal: false });
  });

  it("marks the last index as terminal with no next station", () => {
    expect(rideAnnouncementFor(route, 2)).toEqual({ current: "C", next: null, isTerminal: true });
  });

  it("builds exact announcement copy for both cases", () => {
    expect(nextStationAnnouncementText(route, 0)).toBe("Próxima estação: B.");
    expect(nextStationAnnouncementText(route, 2)).toBe("Fim de linha.");
  });

  it("computes progress from 0 to 1, monotonically, without dividing by zero", () => {
    expect(rideProgress(route, 0)).toBe(0);
    expect(rideProgress(route, 1)).toBeCloseTo(0.5);
    expect(rideProgress(route, 2)).toBe(1);
    expect(rideProgress(["only"], 0)).toBe(1);
  });
});

describe("reused metro-aventura route data", () => {
  it("resolves every station in every line/direction to a valid, unique index", () => {
    for (const line of lines) {
      for (const direction of [1, -1] as const) {
        const route = routeFor(line.stations, direction);
        const seen = new Set<number>();
        for (const station of line.stations) {
          const index = route.indexOf(station);
          expect(index).toBeGreaterThanOrEqual(0);
          expect(seen.has(index)).toBe(false);
          seen.add(index);
        }
      }
    }
  });
});
