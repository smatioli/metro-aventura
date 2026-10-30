export type Point = readonly [number, number];
export interface Route { id: string; name: string; icon: string; destination: string; points: readonly Point[] }
// Mapas autorais e fictícios: não representam ruas nem instruções de trânsito reais.
export const routes: Route[] = [
  { id: 'parque', name: 'Passeio ao parque', icon: '🌳', destination: 'Parque', points: [[80,300],[220,300],[220,190],[390,190],[390,80]] },
  { id: 'estacao', name: 'Vamos à estação', icon: '🚉', destination: 'Estação', points: [[80,80],[80,190],[240,190],[240,300],[430,300]] },
  { id: 'praia', name: 'Caminho da praia', icon: '🏖️', destination: 'Praia', points: [[70,300],[180,300],[180,200],[310,200],[310,90],[440,90]] },
];
