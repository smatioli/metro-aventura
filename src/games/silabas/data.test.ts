import { describe, expect, it } from "vitest";
import { syllableSets, syllablesForFamily, targetSyllable } from "./data";

describe("conteúdo do jogo Sílabas", () => {
  it("mantém os seis conjuntos e a ordem das famílias", () => {
    expect(syllableSets.map(set => set.families.map(family => family.consonant))).toEqual([
      ["T", "L", "M"], ["F", "B", "R"], ["P", "N", "V"],
      ["S", "D", "J"], ["X", "Z"], ["C", "G"],
    ]);
  });

  it("encontra a sílaba-alvo mesmo em palavras acentuadas", () => {
    expect(targetSyllable("VOVÓ", "V")).toEqual({ syllable: "VO", start: 0 });
    expect(targetSyllable("PAJÉ", "J")).toEqual({ syllable: "JE", start: 2 });
  });

  it("deriva apenas sílabas usadas pela família", () => {
    expect(syllablesForFamily(syllableSets[5].families[0])).toEqual(["CA", "CO", "CU"]);
  });
});
