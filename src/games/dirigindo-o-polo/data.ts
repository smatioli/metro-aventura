export type Point = readonly [number, number];
export interface Route { id: string; name: string; icon: string; destination: string; points: readonly Point[]; turns?: Record<number, 'left' | 'right'>; streets?: readonly string[] }
export interface RouteDefinition { id: string; name: string; icon: string; destination: string; file: string }
export const routeDefinitions: readonly RouteDefinition[] = [
  {id:'instituto-tea',name:'Vamos ao Instituto TEA',icon:'💙',destination:'Instituto TEA',file:'instituro-tea.geojson'},
  {id:'casa-vo-antonia',name:'Casa da vó Antônia',icon:'🏡',destination:'Casa da vó Antônia',file:'casa da vo\u0301 antonia.geojson'},
  {id:'casa-vo-fatima',name:'Casa da vó Fátima',icon:'🌷',destination:'Casa da vó Fátima',file:'casa da vo\u0301 fatima.geojson'},
  {id:'estadio-morumbi',name:'Estádio Morumbi',icon:'⚽',destination:'Estádio Morumbi',file:'estadio morumbi.geojson'},
];
