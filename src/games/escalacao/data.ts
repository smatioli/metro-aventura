import roster from './players.json';

export interface Player {
  id: string; name: string; number: number; position: string; photo: string;
}
export interface Slot {
  id: string; name: string; short: string; x: number; y: number; positions: string[];
}
export const players: Player[] = roster;
export const team = { name: 'São Paulo', crest: '/games/jogo-da-memoria/img/times/sao-paulo.png' };
export const slots: Slot[] = [
  { id: 'gk', name: 'goleiro', short: 'GOL', x: 50, y: 88, positions: ['Goleiro'] },
  { id: 'rb', name: 'lateral direito', short: 'LD', x: 84, y: 70, positions: ['Lateral-direita', 'Lateral'] },
  { id: 'rcb', name: 'zagueiro pela direita', short: 'ZAG', x: 62, y: 73, positions: ['Zagueiro'] },
  { id: 'lcb', name: 'zagueiro pela esquerda', short: 'ZAG', x: 38, y: 73, positions: ['Zagueiro'] },
  { id: 'lb', name: 'lateral esquerdo', short: 'LE', x: 16, y: 70, positions: ['Lateral-esquerda', 'Lateral'] },
  { id: 'dm', name: 'volante', short: 'VOL', x: 50, y: 54, positions: ['Volante', 'Meia'] },
  { id: 'rm', name: 'meio-campista pela direita', short: 'MEI', x: 73, y: 39, positions: ['Meia', 'Volante'] },
  { id: 'lm', name: 'meio-campista pela esquerda', short: 'MEI', x: 27, y: 39, positions: ['Meia', 'Volante'] },
  { id: 'rw', name: 'atacante pela direita', short: 'ATA', x: 81, y: 18, positions: ['Atacante', 'Centro-avante'] },
  { id: 'cf', name: 'centroavante', short: 'ATA', x: 50, y: 13, positions: ['Centro-avante', 'Atacante'] },
  { id: 'lw', name: 'atacante pela esquerda', short: 'ATA', x: 19, y: 18, positions: ['Atacante', 'Centro-avante'] },
];
