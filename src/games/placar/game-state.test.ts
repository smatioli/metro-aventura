import { describe, expect, it } from 'vitest';
import { addGoal, advanceMatch, matchClock, MATCH_DURATION_MS, score } from './game-state';

describe('Placar', () => {
  it('converte quatro minutos reais em noventa e encerra no limite', () => {
    const match = advanceMatch({ elapsed: 0, goals: [] }, MATCH_DURATION_MS + 1000);
    expect(match.elapsed).toBe(MATCH_DURATION_MS);
    expect(matchClock(0)).toBe('00:00');
    expect(matchClock(120000)).toBe('45:00');
    expect(matchClock(match.elapsed)).toBe('90:00');
  });
  it('registra apenas um gol confirmado e preserva o minuto e o adversário', () => {
    const match = addGoal({ elapsed: 120000, goals: [] }, 1, 'Pedro');
    expect(match.goals).toEqual([{ side: 1, player: 'Pedro', minute: 45 }]);
    expect(score(match, 0)).toBe(0);
    expect(score(match, 1)).toBe(1);
  });
  it('não registra gol depois do apito final', () => {
    const match = { elapsed: MATCH_DURATION_MS, goals: [] };
    expect(addGoal(match, 0, 'Pedro')).toBe(match);
  });
});
