import { describe, expect, it } from 'vitest';
import { players, slots } from './data';
import { candidates, choose, nextSlot, type Lineup } from './game-state';

describe('escalação', () => {
  it('completa onze posições com jogadores distintos e compatíveis', () => {
    let lineup: Lineup = {};
    for (const slot of slots) {
      expect(nextSlot(lineup)).toBe(slot.id);
      const options = candidates(lineup, slot.id);
      expect(options.length).toBeGreaterThan(0);
      lineup = choose(lineup, slot.id, options[0].id);
    }
    expect(nextSlot(lineup)).toBeUndefined();
    expect(new Set(Object.values(lineup)).size).toBe(11);
  });
  it('rejeita jogador de outra posição, posição desconhecida e duplicação', () => {
    const keeper = candidates({}, 'gk')[0];
    expect(choose({}, 'rb', keeper.id)).toEqual({});
    expect(choose({}, 'unknown', keeper.id)).toEqual({});
    const defender = candidates({}, 'rcb')[0];
    const lineup = choose({}, 'rcb', defender.id);
    expect(choose(lineup, 'lcb', defender.id)).toEqual(lineup);
    expect(candidates(lineup, 'rcb')).toContainEqual(defender);
  });
  it('troca um jogador sem apagar o restante do time e libera o anterior', () => {
    const [first, second] = candidates({}, 'rcb');
    const lineup = choose({ gk: candidates({}, 'gk')[0].id }, 'rcb', first.id);
    const changed = choose(lineup, 'rcb', second.id);
    expect(changed.gk).toBe(lineup.gk);
    expect(changed.rcb).toBe(second.id);
    expect(candidates(changed, 'lcb')).toContainEqual(first);
  });
  it('tem fotos locais e identificadores únicos para todo o elenco', () => {
    expect(players).toHaveLength(38);
    expect(new Set(players.map(p => p.id)).size).toBe(players.length);
    expect(players.every(p => p.photo.startsWith('/games/escalacao/img/'))).toBe(true);
  });
});
