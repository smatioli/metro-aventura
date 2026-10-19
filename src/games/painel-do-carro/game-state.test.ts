import { describe, expect, it } from "vitest";
import { gearForSpeed, nextSpeed, rpmForSpeed } from "./game-state";

describe("Painel do carro", () => {
  it("acelera até 80 km/h sem ultrapassar o limite", () => {
    expect(nextSpeed(0, true, 1)).toBe(9);
    expect(nextSpeed(79, true, 1)).toBe(80);
    expect(nextSpeed(80, true, 20)).toBe(80);
  });
  it("desacelera ao soltar e para sem entrar em velocidade negativa", () => {
    expect(nextSpeed(80, false, 1)).toBe(74);
    expect(nextSpeed(3, false, 1)).toBe(0);
    expect(nextSpeed(0, false, 1)).toBe(0);
  });
  it("troca de D1 até D6 e reduz as marchas ao desacelerar", () => {
    expect([0, 12, 25, 40, 55, 70, 80].map(gearForSpeed)).toEqual([1, 2, 3, 4, 5, 6, 6]);
    expect([69, 54, 39, 24, 11, 0].map(gearForSpeed)).toEqual([5, 4, 3, 2, 1, 1]);
  });
  it("aumenta o giro ao acelerar e baixa o giro ao subir de marcha", () => {
    expect(rpmForSpeed(10)).toBeGreaterThan(rpmForSpeed(0));
    expect(rpmForSpeed(12)).toBeLessThan(rpmForSpeed(11));
  });
});
