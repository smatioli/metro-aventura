import { pairsForGroup, type MemoryGroup, type MemoryImage } from "./data";

export interface MemoryCard {
  cardId: number;
  imageId: string;
  src: string;
  alt: string;
  label: string;
  revealed: boolean;
  matched: boolean;
}

export function shuffled<T>(items: T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildBoard(group: MemoryGroup, rng: () => number = Math.random): MemoryCard[] {
  const images: MemoryImage[] = shuffled(group.images, rng).slice(0, pairsForGroup(group));
  const pairs = images.flatMap(image => [image, image]);
  return shuffled(pairs, rng).map((image, index) => ({
    cardId: index,
    imageId: image.id,
    src: image.src,
    alt: image.alt,
    label: image.label,
    revealed: false,
    matched: false
  }));
}

export function columnsForCount(total: number): number {
  return Math.max(2, Math.ceil(Math.sqrt(total)));
}

export function isMatch(a: MemoryCard, b: MemoryCard): boolean {
  return a.cardId !== b.cardId && a.imageId === b.imageId;
}

export function isBoardComplete(board: MemoryCard[]): boolean {
  return board.every(card => card.matched);
}
