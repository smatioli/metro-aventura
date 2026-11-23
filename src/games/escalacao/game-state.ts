import { players, slots, type Player } from './data';
export type Lineup = Record<string, string>;
export function candidates(lineup: Lineup, slotId: string): Player[] {
  const slot = slots.find(s => s.id === slotId);
  if (!slot) return [];
  const used = new Set(Object.entries(lineup).filter(([id]) => id !== slotId).map(([, player]) => player));
  return players.filter(p => slot.positions.includes(p.position) && !used.has(p.id));
}
export function choose(lineup: Lineup, slotId: string, playerId: string): Lineup {
  if (!candidates(lineup, slotId).some(p => p.id === playerId)) return lineup;
  return { ...lineup, [slotId]: playerId };
}
export function nextSlot(lineup: Lineup): string | undefined {
  return slots.find(s => !lineup[s.id])?.id;
}
