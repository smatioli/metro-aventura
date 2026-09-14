import { describe, expect, it } from "vitest";
import { lineColors, wildCount } from "./data";
import {
  buildDeck,
  canPlay,
  dealGame,
  drawCard,
  hasPlayableCard,
  isWon,
  playCard,
  shuffled,
  topCard,
  type GameState,
  type UnoCard
} from "./logic";

const noShuffle = () => 0;

describe("buildDeck", () => {
  it("has 11 cards per line color (0-9 + expresso) plus the wild cards", () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(lineColors.length * 11 + wildCount);
    for (const line of lineColors) {
      expect(deck.filter(card => card.color === line.id)).toHaveLength(11);
    }
    expect(deck.filter(card => card.kind === "conexao")).toHaveLength(wildCount);
  });
});

describe("dealGame", () => {
  it("deals a 7-card hand and starts the discard pile with a number card", () => {
    const state = dealGame(noShuffle);
    expect(state.hand).toHaveLength(7);
    expect(state.discardPile).toHaveLength(1);
    expect(topCard(state).kind).toBe("numero");
    expect(state.activeColor).toBe(topCard(state).color);
  });

  it("keeps every card in circulation exactly once", () => {
    const state = dealGame(noShuffle);
    const total = state.hand.length + state.drawPile.length + state.discardPile.length;
    expect(total).toBe(buildDeck().length);
  });
});

describe("canPlay", () => {
  const state: GameState = {
    drawPile: [],
    discardPile: [{ cardId: "azul-n5", color: "azul", kind: "numero", value: 5 }],
    hand: [],
    activeColor: "azul",
    bonusPlay: false,
    cardsPlayed: 0
  };

  it("allows a card matching the active color", () => {
    const card: UnoCard = { cardId: "azul-n2", color: "azul", kind: "numero", value: 2 };
    expect(canPlay(card, state)).toBe(true);
  });

  it("allows a card matching the number, even in another color", () => {
    const card: UnoCard = { cardId: "verde-n5", color: "verde", kind: "numero", value: 5 };
    expect(canPlay(card, state)).toBe(true);
  });

  it("rejects a card that matches neither color nor number", () => {
    const card: UnoCard = { cardId: "verde-n2", color: "verde", kind: "numero", value: 2 };
    expect(canPlay(card, state)).toBe(false);
  });

  it("always allows a conexao (wild) card", () => {
    const card: UnoCard = { cardId: "curinga-0", color: "curinga", kind: "conexao" };
    expect(canPlay(card, state)).toBe(true);
  });

  it("allows any card while bonusPlay is active", () => {
    const bonusState: GameState = { ...state, bonusPlay: true };
    const card: UnoCard = { cardId: "verde-n2", color: "verde", kind: "numero", value: 2 };
    expect(canPlay(card, bonusState)).toBe(true);
  });
});

describe("playCard", () => {
  const baseState: GameState = {
    drawPile: [],
    discardPile: [{ cardId: "azul-n5", color: "azul", kind: "numero", value: 5 }],
    hand: [
      { cardId: "azul-n2", color: "azul", kind: "numero", value: 2 },
      { cardId: "verde-n9", color: "verde", kind: "numero", value: 9 }
    ],
    activeColor: "azul",
    bonusPlay: false,
    cardsPlayed: 0
  };

  it("moves a playable card from hand to the discard pile and updates the active color", () => {
    const next = playCard(baseState, 0);
    expect(next.hand).toHaveLength(1);
    expect(topCard(next).cardId).toBe("azul-n2");
    expect(next.activeColor).toBe("azul");
    expect(next.cardsPlayed).toBe(1);
  });

  it("does nothing when the card is not playable", () => {
    const next = playCard(baseState, 1);
    expect(next).toBe(baseState);
  });

  it("sets bonusPlay when an expresso card is played", () => {
    const state: GameState = {
      ...baseState,
      hand: [{ cardId: "azul-expresso", color: "azul", kind: "expresso" }]
    };
    const next = playCard(state, 0);
    expect(next.bonusPlay).toBe(true);
  });

  it("uses the chosen color when a conexao (wild) card is played", () => {
    const state: GameState = {
      ...baseState,
      hand: [{ cardId: "curinga-0", color: "curinga", kind: "conexao" }]
    };
    const next = playCard(state, 0, "verde");
    expect(next.activeColor).toBe("verde");
  });
});

describe("drawCard", () => {
  it("moves the top card of the draw pile into the hand", () => {
    const state: GameState = {
      drawPile: [{ cardId: "azul-n2", color: "azul", kind: "numero", value: 2 }],
      discardPile: [{ cardId: "azul-n5", color: "azul", kind: "numero", value: 5 }],
      hand: [],
      activeColor: "azul",
      bonusPlay: false,
      cardsPlayed: 0
    };
    const next = drawCard(state);
    expect(next.hand).toHaveLength(1);
    expect(next.drawPile).toHaveLength(0);
  });

  it("reshuffles the discard pile into the draw pile when it runs out", () => {
    const state: GameState = {
      drawPile: [],
      discardPile: [
        { cardId: "azul-n5", color: "azul", kind: "numero", value: 5 },
        { cardId: "verde-n2", color: "verde", kind: "numero", value: 2 }
      ],
      hand: [],
      activeColor: "azul",
      bonusPlay: false,
      cardsPlayed: 0
    };
    const next = drawCard(state, noShuffle);
    expect(next.discardPile).toHaveLength(1);
    expect(topCard(next).cardId).toBe("verde-n2");
    expect(next.hand).toHaveLength(1);
  });
});

describe("hasPlayableCard / isWon", () => {
  it("detects when no card in hand can be played", () => {
    const state: GameState = {
      drawPile: [],
      discardPile: [{ cardId: "azul-n5", color: "azul", kind: "numero", value: 5 }],
      hand: [{ cardId: "verde-n2", color: "verde", kind: "numero", value: 2 }],
      activeColor: "azul",
      bonusPlay: false,
      cardsPlayed: 0
    };
    expect(hasPlayableCard(state)).toBe(false);
  });

  it("is won only when the hand is empty", () => {
    const state = dealGame(noShuffle);
    expect(isWon(state)).toBe(false);
    expect(isWon({ ...state, hand: [] })).toBe(true);
  });
});

describe("shuffled", () => {
  it("keeps all items, only reordering them", () => {
    const items = [1, 2, 3, 4, 5];
    const result = shuffled(items, () => 0.999);
    expect([...result].sort()).toEqual(items);
  });
});
