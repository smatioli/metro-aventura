import { describe, expect, it } from "vitest";
import { categories, items } from "./data";
import { letterChoicesFor, nextLetterIndex } from "./logic";

describe("nextLetterIndex", () => {
  it("skips spaces between words", () => {
    expect(nextLetterIndex("SAO PAULO", 3)).toBe(4);
  });

  it("returns the word length when finished", () => {
    expect(nextLetterIndex("TEO", 3)).toBe(3);
  });
});

describe("letterChoicesFor", () => {
  it("offers the expected letter plus two different ones", () => {
    const choices = letterChoicesFor("K");
    expect(choices).toHaveLength(3);
    expect(choices).toContain("K");
    expect(new Set(choices).size).toBe(3);
  });
});

describe("items", () => {
  it("only uses uppercase letters and spaces in words", () => {
    for (const item of items) expect(item.word, item.id).toMatch(/^[A-Z]+( [A-Z]+)*$/);
  });

  it("has unique ids", () => {
    expect(new Set(items.map(item => item.id)).size).toBe(items.length);
  });

  it("has at least one item in every category", () => {
    for (const category of categories) {
      expect(items.some(item => item.category === category.id), category.id).toBe(true);
    }
  });
});
