import { describe, expect, it } from "vitest";
import { buildBoard, columnsForCount, isBoardComplete, isMatch, shuffled } from "./logic";
import { memoryGroups, pairsForGroup } from "./data";

const noShuffle = () => 0;

describe("shuffled", () => {
  it("keeps all items, only reordering them", () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffled(items, () => 0.999);
    expect(result).toHaveLength(items.length);
    expect([...result].sort()).toEqual(items);
  });

  it("does not mutate the input array", () => {
    const items = [1, 2, 3];
    shuffled(items, () => 0.5);
    expect(items).toEqual([1, 2, 3]);
  });
});

describe("buildBoard", () => {
  it("creates exactly two cards per image, up to the group's pair count", () => {
    for (const group of memoryGroups) {
      const board = buildBoard(group, noShuffle);
      expect(board).toHaveLength(pairsForGroup(group) * 2);
      const counts = new Map<string, number>();
      for (const card of board) counts.set(card.imageId, (counts.get(card.imageId) ?? 0) + 1);
      for (const count of counts.values()) expect(count).toBe(2);
    }
  });

  it("starts every card face-down and unmatched", () => {
    const board = buildBoard(memoryGroups[0], noShuffle);
    expect(board.every(card => !card.revealed && !card.matched)).toBe(true);
  });

  it("gives every card a unique cardId", () => {
    const board = buildBoard(memoryGroups[0], noShuffle);
    expect(new Set(board.map(card => card.cardId)).size).toBe(board.length);
  });
});

describe("columnsForCount", () => {
  it("picks a near-square column count", () => {
    expect(columnsForCount(12)).toBe(4);
    expect(columnsForCount(6)).toBe(3);
    expect(columnsForCount(4)).toBe(2);
  });

  it("never returns fewer than 2 columns", () => {
    expect(columnsForCount(1)).toBe(2);
  });
});

describe("isMatch", () => {
  it("is true only for two different cards with the same image", () => {
    const board = buildBoard(memoryGroups[0], noShuffle);
    const [first] = board;
    const pair = board.find(card => card.imageId === first.imageId && card.cardId !== first.cardId)!;
    expect(isMatch(first, pair)).toBe(true);
    expect(isMatch(first, first)).toBe(false);
  });

  it("is false for two different images", () => {
    const board = buildBoard(memoryGroups[0], noShuffle);
    const other = board.find(card => card.imageId !== board[0].imageId)!;
    expect(isMatch(board[0], other)).toBe(false);
  });
});

describe("isBoardComplete", () => {
  it("is true only when every card is matched", () => {
    const board = buildBoard(memoryGroups[0], noShuffle);
    expect(isBoardComplete(board)).toBe(false);
    const complete = board.map(card => ({ ...card, matched: true }));
    expect(isBoardComplete(complete)).toBe(true);
  });
});
