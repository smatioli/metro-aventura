import { describe, expect, it } from "vitest";
import { distinctKeys, nextStation, nextView, routeFor, speedAtProgress } from "./game-state";
import { lines } from "./data";

describe("journey rules", () => {
  it("cycles through views in both directions", () => {
    expect(nextView("side", 1)).toBe("interior");
    expect(nextView("side", -1)).toBe("cab");
  });

  it("stops at the end of a route", () => {
    expect(nextStation(1, 1, 3)).toBe(2);
    expect(nextStation(2, 1, 3)).toBeNull();
  });

  it("reverses stations for the opposite direction", () => {
    expect(routeFor(["A", "B", "C"], -1)).toEqual(["C", "B", "A"]);
  });

  it("contains every station in the three prototype routes", () => {
    expect(lines.map(line => line.stations.length)).toEqual([23, 14, 18]);
  });

  it("uses the approved fleet matrix", () => {
    expect(lines.map(line => line.fleets)).toEqual([
      ["E", "I", "J", "K", "L"],
      ["I", "J"],
      ["G", "H", "K"]
    ]);
  });

  it("accelerates, cruises and stops during a segment", () => {
    expect(speedAtProgress(0)).toBe(0);
    expect(speedAtProgress(0.125)).toBe(35);
    expect(speedAtProgress(0.5)).toBe(70);
    expect(speedAtProgress(1)).toBe(0);
  });

  it("always selects two different driving keys", () => {
    expect(distinctKeys(["A", "S", "P"], 0, 0)).toEqual(["A", "S"]);
    expect(distinctKeys(["A", "S", "P"], 1, 2)).toEqual(["S", "P"]);
  });
});
