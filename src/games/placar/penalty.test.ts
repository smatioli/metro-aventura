import { describe, expect, it, vi } from 'vitest';
import { penaltyOutcome, takePenalty } from './penalty';
import { addCard, MATCH_DURATION_MS, type Match } from './game-state';
const initial = (): Match => ({ elapsed: 120000, goals: [], cards: [] });
describe('pênaltis', () => {
  it('respeita os limites de 30% defesa, 10% fora e 60% gol', () => {
    expect([0, .299999, .3, .399999, .4, .999999].map(penaltyOutcome)).toEqual(['saved', 'saved', 'missed', 'missed', 'goal', 'goal']);
    const outcomes = Array.from({ length: 100 }, (_, i) => penaltyOutcome((i + .5) / 100));
    expect(outcomes.filter(o => o === 'saved')).toHaveLength(30);
    expect(outcomes.filter(o => o === 'missed')).toHaveLength(10);
    expect(outcomes.filter(o => o === 'goal')).toHaveLength(60);
  });
  it('só acrescenta gol quando convertido, com batedor, time e minuto', () => {
    const match = initial();
    expect(takePenalty(match, 1, 'Pedro', .5)?.match.goals).toEqual([{ side: 1, player: 'Pedro', minute: 45 }]);
    expect(takePenalty(match, 1, 'Pedro', .1)?.match).toBe(match);
    expect(takePenalty(match, 1, 'Pedro', .35)?.match).toBe(match);
    expect(match.goals).toEqual([]);
  });
  it('faz um novo sorteio em cada cobrança, inclusive para o mesmo batedor', () => {
    const random = vi.spyOn(Math, 'random')
      .mockReturnValueOnce(.1)
      .mockReturnValueOnce(.35)
      .mockReturnValueOnce(.8)
      .mockReturnValueOnce(.9);
    try {
      let match = initial();
      const outcomes = [];
      for (let shot = 0; shot < 4; shot++) {
        const result = takePenalty(match, 0, 'Pedro');
        expect(result).not.toBeNull();
        match = result!.match;
        outcomes.push(result!.outcome);
      }
      expect(random).toHaveBeenCalledTimes(4);
      expect(outcomes).toEqual(['saved', 'missed', 'goal', 'goal']);
      expect(match.goals).toHaveLength(2);
    } finally {
      random.mockRestore();
    }
  });
  it('bloqueia jogadores expulsos, batedor vazio e cobranças após o fim', () => {
    expect(takePenalty(addCard(initial(), 0, 'Pedro', 'red'), 0, 'Pedro', .5)).toBeNull();
    expect(takePenalty(addCard(addCard(initial(), 0, 'Pedro', 'yellow'), 0, 'Pedro', 'yellow'), 0, 'Pedro', .5)).toBeNull();
    expect(takePenalty(initial(), 0, '', .5)).toBeNull();
    expect(takePenalty({ ...initial(), elapsed: MATCH_DURATION_MS }, 0, 'Pedro', .5)).toBeNull();
  });
});
