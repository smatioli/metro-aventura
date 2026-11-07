import { describe, it, expect } from 'vitest';
import type { Route } from './data';
const routes: Route[]=[
{id:'parque',name:'Parque',icon:'',destination:'Parque',points:[[80,300],[220,300],[220,190],[390,190],[390,80]]},
{id:'estacao',name:'Estação',icon:'',destination:'Estação',points:[[80,80],[80,190],[240,190],[240,300],[430,300]]},
{id:'praia',name:'Praia',icon:'',destination:'Praia',points:[[70,300],[180,300],[180,200],[310,200],[310,90],[440,90]]},
];
import { advance, direction, initialState, position, steer, type State } from './game-state';
describe('viagem guiada', () => {
  it('classifica curvas em ambas as direções', () => { expect(direction(routes[0],0)).toBe('left'); expect(direction(routes[0],1)).toBe('right'); });
  it('espera na curva e ignora o lado incorreto', () => {
    const s: State={segment:0,distance:140,phase:'turn'};
    expect(advance(routes[0],s,10)).toEqual(s);
    expect(steer(routes[0],s,90)).toEqual(s);
    const turned=steer(routes[0],s,-60);
    expect(turned).toEqual({segment:1,distance:0,phase:'driving'});
    expect(advance(routes[0],turned,.1).distance).toBeGreaterThan(0);
  });
  it.each(routes)('completa $name sem ultrapassar o destino', route => {
    let s=initialState();
    for(let i=0;i<2000 && s.phase!=='arrived';i++) {
      s=advance(route,s,.1);
      if(s.phase==='turn') s=steer(route,s,direction(route,s.segment)==='right'?90:-90);
    }
    expect(s.phase).toBe('arrived');
    expect(position(route,s)).toEqual(route.points.at(-1));
    expect(advance(route,s,1)).toEqual(s);
  });
  it('não avança com tempo negativo', () => expect(advance(routes[0],initialState(),-1).distance).toBe(0));
});
