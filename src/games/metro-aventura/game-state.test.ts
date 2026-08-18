import { describe, expect, it } from "vitest";
import { distinctKeys, driveChoices, nextStation, nextView, routeFor, speedAtProgress } from "./game-state";
import { connectingLines, cptmFleetMatrix, firstSyllable, firstSyllableFor, lines, platformSideFor, platformSides } from "./data";

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

  it("contains every station in the prototype routes", () => {
    expect(lines.map(line => line.stations.length)).toEqual([23, 14, 18, 11, 17, 17, 22, 21, 15, 17, 13, 3, 11, 7]);
  });

  it("uses the approved fleet matrix", () => {
    expect(lines.map(line => line.fleets)).toEqual([
      ["E", "I", "J", "K", "L"],
      ["I", "J"],
      ["G", "H", "K"],
      ["400"],
      ["500"],
      ["9500"],
      ["8900", "7000"],
      ["8900", "7000"],
      ["8500", "7500", "2070"],
      ["8000", "8500"],
      ["7000", "8500", "9000"],
      ["2500"],
      ["M"],
      ["N"]
    ]);
  });

  it("stores the approved CPTM fleet matrix", () => {
    expect(cptmFleetMatrix).toEqual({
      "7": ["9500"], "8": ["8900", "7000"], "9": ["8900", "7000"],
      "10": ["8500", "7500", "2070"], "11": ["8000", "8500"],
      "12": ["7000", "8500", "9000"], "13": ["2500"]
    });
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

  it("builds a 3-option touch choice that always includes the correct key once", () => {
    const pool = ["A", "S", "D", "F", "J", "K", "L", "P"];
    for (let seed = 0; seed < pool.length; seed++) {
      const options = driveChoices(pool, "A", seed);
      expect(options).toHaveLength(3);
      expect(options.filter(key => key === "A")).toHaveLength(1);
      expect(new Set(options).size).toBe(3);
    }
  });

  it("configures a valid platform side for every station", () => {
    for (const line of lines) {
      expect(Object.keys(platformSides[line.id])).toHaveLength(line.stations.length);
      for (const station of line.stations) expect(["right", "left"]).toContain(platformSideFor(line.id, station));
    }
  });

  it("guesses a reasonable first syllable for known station names", () => {
    expect(firstSyllable("Sé")).toBe("Sé");
    expect(firstSyllable("Luz")).toBe("Luz");
    expect(firstSyllable("Tiradentes")).toBe("Ti");
    expect(firstSyllable("Tucuruvi")).toBe("Tu");
    expect(firstSyllable("Paulista")).toBe("Pau");
    expect(firstSyllable("Higienópolis-Mackenzie")).toBe("Hi");
    expect(firstSyllable("Palmeiras-Barra Funda")).toBe("Pal");
    expect(firstSyllable("Fradique Coutinho")).toBe("Fra");
    expect(firstSyllable("Quitaúna")).toBe("Qui");
    expect(firstSyllable("Ana Rosa")).toBe("A");
  });

  it("produces a non-empty first syllable for every station in the game", () => {
    for (const line of lines) {
      for (const station of line.stations) expect(firstSyllableFor(station).length).toBeGreaterThan(0);
    }
  });

  it("finds the other lines that stop at a shared station", () => {
    const tamanduatei = connectingLines("Tamanduateí", "2");
    expect(tamanduatei.map(item => item.id)).toEqual(["10"]);

    const luz = connectingLines("Luz", "1");
    expect(luz.map(item => item.id).sort()).toEqual(["10", "11", "4"]);
  });

  it("returns no connections for a station served by only one line", () => {
    expect(connectingLines("Jabaquara", "1")).toEqual([]);
  });
});
