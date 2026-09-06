import type { FleetId, LineId } from "./data";

export type Screen = "home" | "company" | "fleet" | "line" | "direction" | "journey" | "finished";
export type JourneyPhase = "travelling" | "arriving" | "waiting-open" | "doors-open" | "waiting-close" | "challenge";
export type View = "side" | "interior" | "cab";

export interface SaveGame {
  lineId: LineId;
  fleetId: FleetId;
  direction: 1 | -1;
  stationIndex: number;
}

export const SAVE_KEY = "metro-aventura-save-v1";

export function nextView(view: View, direction: 1 | -1): View {
  const views: View[] = ["side", "interior", "cab"];
  const index = views.indexOf(view);
  return views[(index + direction + views.length) % views.length];
}

export function nextStation(index: number, direction: 1 | -1, total: number): number | null {
  const next = index + direction;
  return next < 0 || next >= total ? null : next;
}

export function routeFor(stations: string[], direction: 1 | -1): string[] {
  return direction === 1 ? [...stations] : [...stations].reverse();
}

export function speedAtProgress(progress: number, maximum = 70): number {
  const safe = Math.max(0, Math.min(1, progress));
  if (safe < 0.25) return Math.round(maximum * (safe / 0.25));
  if (safe < 0.68) return maximum;
  return Math.round(maximum * (1 - (safe - 0.68) / 0.32));
}

export function distinctKeys(pool: string[], firstIndex: number, secondIndex: number): [string, string] {
  const first = pool[firstIndex % pool.length];
  let second = pool[secondIndex % pool.length];
  if (second === first) second = pool[(secondIndex + 1) % pool.length];
  return [first, second];
}

/** Builds a shuffled 3-option touch choice (the correct key plus two decoys) for phones without a keyboard. */
export function driveChoices(pool: string[], correct: string, seed: number): string[] {
  const decoys: string[] = [];
  let i = seed;
  while (decoys.length < 2) {
    const candidate = pool[i % pool.length];
    if (candidate !== correct && !decoys.includes(candidate)) decoys.push(candidate);
    i += 1;
  }
  const options = [correct, ...decoys];
  const rotate = seed % 3;
  return [...options.slice(rotate), ...options.slice(0, rotate)];
}

/** Deterministic Fisher-Yates shuffle (seeded Lehmer RNG) so results are reproducible and testable for a given seed. */
export function shuffleSeeded<T>(items: T[], seed: number): T[] {
  const array = [...items];
  let state = Math.abs(Math.floor(seed)) % 2147483647;
  if (state <= 0) state += 2147483646;
  const next = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** Shuffles `items`, guaranteeing the result is not in the original order whenever that's possible. */
export function shuffleOutOfOrder<T>(items: T[], seed: number): T[] {
  const shuffled = shuffleSeeded(items, seed);
  if (items.length > 1 && shuffled.every((item, index) => item === items[index])) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}
