import { addGoal, isSentOff, MATCH_DURATION_MS, type Match, type Side } from './game-state';

export type PenaltyOutcome = 'saved' | 'missed' | 'goal';
export function penaltyOutcome(random: number): PenaltyOutcome {
  if (random < 0.3) return 'saved';
  if (random < 0.4) return 'missed';
  return 'goal';
}
export function takePenalty(match: Match, side: Side, player: string, random?: number): { match: Match; outcome: PenaltyOutcome } | null {
  if (match.elapsed >= MATCH_DURATION_MS || !player.trim() || isSentOff(match, side, player)) return null;
  const outcome = penaltyOutcome(random ?? Math.random());
  return { match: outcome === 'goal' ? addGoal(match, side, player) : match, outcome };
}
