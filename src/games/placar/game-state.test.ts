import { describe, expect, it } from 'vitest';
import { addCard, addGoal, advanceMatch, matchClock, MATCH_DURATION_MS, score } from './game-state';

describe('Placar', () => {
  it('converte quatro minutos reais em noventa e encerra no limite', () => {
    const match = advanceMatch({ elapsed: 0, goals: [], cards: [] }, MATCH_DURATION_MS + 1000);
    expect(match.elapsed).toBe(MATCH_DURATION_MS);
    expect(matchClock(0)).toBe('00:00');
    expect(matchClock(120000)).toBe('45:00');
    expect(matchClock(match.elapsed)).toBe('90:00');
  });
  it('registra apenas um gol confirmado e preserva o minuto e o adversário', () => {
    const match = addGoal({ elapsed: 120000, goals: [], cards: [] }, 1, 'Pedro');
    expect(match.goals).toEqual([{ side: 1, player: 'Pedro', minute: 45 }]);
    expect(score(match, 0)).toBe(0);
    expect(score(match, 1)).toBe(1);
  });
  it('registra cartões com jogador, time e minuto sem alterar os gols', () => {
    const initial = { elapsed: 120000, goals: [], cards: [] };
    const yellow = addCard(initial, 0, 'Pedro', 'yellow');
    const red = addCard(yellow, 1, 'João', 'red');
    expect(red.cards).toEqual([
      { side: 0, player: 'Pedro', color: 'yellow', minute: 45 },
      { side: 1, player: 'João', color: 'red', minute: 45 },
    ]);
    expect(red.goals).toEqual([]);
    expect(initial.cards).toEqual([]);
  });
  it('ignora cartões sem jogador ou depois do fim', () => {
    const match = { elapsed: 0, goals: [], cards: [] };
    expect(addCard(match, 0, ' ', 'yellow')).toBe(match);
    const final = { ...match, elapsed: MATCH_DURATION_MS };
    expect(addCard(final, 1, 'Pedro', 'red')).toBe(final);
  });
  it('não registra gol depois do apito final', () => {
    const match = { elapsed: MATCH_DURATION_MS, goals: [], cards: [] };
    expect(addGoal(match, 0, 'Pedro')).toBe(match);
  });
  it.each(['red', 'two-yellows'] as const)('desativa o jogador após %s, preservando gols anteriores e o adversário', reason => {
    let match = addGoal({ elapsed: 120000, goals: [], cards: [] }, 0, 'Pedro');
    match = addCard(match, 0, 'Pedro', reason === 'red' ? 'red' : 'yellow');
    if (reason === 'two-yellows') {
      expect(addGoal(match, 0, 'Pedro').goals).toHaveLength(2);
      match = addCard(match, 0, 'Pedro', 'yellow');
    }
    expect(addGoal(match, 0, 'Pedro')).toBe(match);
    expect(addCard(match, 0, 'Pedro', 'yellow')).toBe(match);
    expect(addCard(match, 0, 'Pedro', 'red')).toBe(match);
    expect(score(match, 0)).toBe(1);
    expect(addGoal(match, 1, 'Pedro').goals).toHaveLength(2);
    const undone = { ...match, cards: match.cards.slice(0, -1) };
    expect(addGoal(undone, 0, 'Pedro').goals).toHaveLength(2);
  });

});
