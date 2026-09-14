import { handSize, lineColors, maxNumber, wildCount, type LineColor } from "./data";

export type CardKind = "numero" | "expresso" | "conexao";

export interface UnoCard {
  cardId: string;
  color: LineColor | "curinga";
  kind: CardKind;
  value?: number;
}

export interface GameState {
  drawPile: UnoCard[];
  discardPile: UnoCard[];
  hand: UnoCard[];
  activeColor: LineColor;
  bonusPlay: boolean;
  cardsPlayed: number;
}

export function shuffled<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  for (const line of lineColors) {
    for (let value = 0; value <= maxNumber; value += 1) {
      deck.push({ cardId: `${line.id}-n${value}`, color: line.id, kind: "numero", value });
    }
    deck.push({ cardId: `${line.id}-expresso`, color: line.id, kind: "expresso" });
  }
  for (let index = 0; index < wildCount; index += 1) {
    deck.push({ cardId: `curinga-${index}`, color: "curinga", kind: "conexao" });
  }
  return deck;
}

export function topCard(state: GameState): UnoCard {
  return state.discardPile[state.discardPile.length - 1];
}

export function canPlay(card: UnoCard, state: GameState): boolean {
  if (state.bonusPlay) return true;
  if (card.kind === "conexao") return true;
  if (card.color === state.activeColor) return true;
  const top = topCard(state);
  if (card.kind === "numero" && top.kind === "numero" && card.value === top.value) return true;
  if (card.kind === "expresso" && top.kind === "expresso") return true;
  return false;
}

export function hasPlayableCard(state: GameState): boolean {
  return state.hand.some(card => canPlay(card, state));
}

export function isWon(state: GameState): boolean {
  return state.hand.length === 0;
}

export function dealGame(rng: () => number = Math.random): GameState {
  const shuffledDeck = shuffled(buildDeck(), rng);
  const startIndex = shuffledDeck.findIndex(card => card.kind === "numero");
  const startCard = shuffledDeck[startIndex];
  const rest = [...shuffledDeck.slice(0, startIndex), ...shuffledDeck.slice(startIndex + 1)];
  const hand = rest.slice(0, handSize);
  const drawPile = rest.slice(handSize);
  return {
    drawPile,
    discardPile: [startCard],
    hand,
    activeColor: startCard.color as LineColor,
    bonusPlay: false,
    cardsPlayed: 0
  };
}

export function playCard(state: GameState, cardIndex: number, chosenColor?: LineColor): GameState {
  const card = state.hand[cardIndex];
  if (!card || !canPlay(card, state)) return state;
  const hand = state.hand.filter((_, index) => index !== cardIndex);
  const discardPile = [...state.discardPile, card];
  const activeColor = card.kind === "conexao" ? (chosenColor ?? state.activeColor) : (card.color as LineColor);
  return {
    ...state,
    hand,
    discardPile,
    activeColor,
    bonusPlay: card.kind === "expresso",
    cardsPlayed: state.cardsPlayed + 1
  };
}

export function drawCard(state: GameState, rng: () => number = Math.random): GameState {
  let drawPile = state.drawPile;
  let discardPile = state.discardPile;
  if (drawPile.length === 0) {
    const top = discardPile[discardPile.length - 1];
    drawPile = shuffled(discardPile.slice(0, -1), rng);
    discardPile = [top];
  }
  if (drawPile.length === 0) return state;
  const [drawn, ...remaining] = drawPile;
  return { ...state, drawPile: remaining, discardPile, hand: [...state.hand, drawn] };
}
