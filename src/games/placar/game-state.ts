export const MATCH_DURATION_MS = 4 * 60 * 1000;
export type Side = 0 | 1;
export interface Goal { side: Side; player: string; minute: number }
export type CardColor = 'yellow' | 'red';
export interface Card extends Goal { color: CardColor }
export interface Match { elapsed: number; goals: Goal[]; cards: Card[] }
export function matchMinute(elapsed: number): number {
  return Math.min(90, Math.floor(Math.max(0, elapsed) / MATCH_DURATION_MS * 90));
}
export function matchClock(elapsed: number): string {
  const seconds = Math.floor(Math.max(0, Math.min(elapsed, MATCH_DURATION_MS)) / MATCH_DURATION_MS * 90 * 60);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
export function advanceMatch(match: Match, delta: number): Match {
  return { ...match, elapsed: Math.min(MATCH_DURATION_MS, match.elapsed + Math.max(0, delta)) };
}
export function addGoal(match: Match, side: Side, player: string): Match {
  if (match.elapsed >= MATCH_DURATION_MS || !player.trim() || isSentOff(match, side, player)) return match;
  return { ...match, goals: [...match.goals, { side, player, minute: matchMinute(match.elapsed) }] };
}
export function score(match: Match, side: Side): number {
  return match.goals.filter(goal => goal.side === side).length;
}

export function addCard(match: Match, side: Side, player: string, color: CardColor): Match {
  if (match.elapsed >= MATCH_DURATION_MS || !player.trim() || isSentOff(match, side, player)) return match;
  return { ...match, cards: [...match.cards, { side, player, color, minute: matchMinute(match.elapsed) }] };
}

export function isSentOff(match: Match, side: Side, player: string): boolean {
  const cards = match.cards.filter(card => card.side === side && card.player === player);
  return cards.some(card => card.color === 'red') || cards.filter(card => card.color === 'yellow').length >= 2;
}
