import { describe, expect, it } from 'vitest';
import { teams } from './data';

describe('Escalações do Placar', () => {
  it('oferece vinte clubes diferentes com onze titulares únicos e um goleiro', () => {
    expect(teams).toHaveLength(20);
    expect(new Set(teams.map(team => team.id)).size).toBe(20);
    for (const team of teams) {
      expect(team.players, team.name).toHaveLength(11);
      expect(new Set(team.players.map(player => player.name)).size, team.name).toBe(11);
      expect(team.players.filter(player => player.position === 'GOL'), team.name).toHaveLength(1);
      expect(team.players.every(player => player.name.trim().length > 0)).toBe(true);
      expect(team.source).toMatch(/^https:\/\//);
      expect(team.matchDate).toMatch(/^2026-10-\d{2}$/);
    }
  });
});
