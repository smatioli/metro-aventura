import { describe, expect, it } from 'vitest';
import { fromGeoJSON, streetAt } from './navigation';
import { advance, initialState, position } from './game-state';
const geo=(coordinates:number[][])=>({type:'Feature',geometry:{type:'LineString',coordinates}});
describe('rota geográfica',()=>{
  it('remove pontos repetidos e não transforma pontos colineares em conversões',()=>{
    const route=fromGeoJSON(geo([[-46.56,-23.57],[-46.56,-23.57],[-46.5599,-23.57],[-46.5598,-23.57],[-46.5598,-23.5699]]));
    expect(route.points).toHaveLength(4);
    expect(route.turns).toEqual({1:'left'});
    let state=initialState();
    for(let i=0;i<10;i++)state=advance(route,state,.1);
    expect(state.phase).toBe('turn');
    expect(state.segment).toBe(1);
    expect(position(route,state)).toEqual(route.points[2]);
  });
  it('associa o nome à rua alinhada, evitando rua transversal mais próxima',()=>{
    const route={id:'test',name:'',icon:'',destination:'',points:[[0,0],[100,0]] as const};
    expect(streetAt(route,0,[{name:'Transversal',points:[[50,-50],[50,50]]},{name:'Rua correta',points:[[0,3],[100,3]]}])).toBe('Rua correta');
    expect(streetAt(route,0,[])).toBe('');
  });
  it('reconhece uma conversão desenhada com vários pontos suaves como uma única manobra',()=>{
    const arc=Array.from({length:9},(_,i)=>[12+12*Math.cos(Math.PI+i*Math.PI/16),12+12*Math.sin(Math.PI+i*Math.PI/16)]);
    const points=[[0,60],[0,35],...arc,[35,0],[60,0]];
    const coordinates=points.map(([x,y])=>[-46.56+x/(111320*Math.cos(-23.57*Math.PI/180)),-23.57-y/111320]);
    const route=fromGeoJSON(geo(coordinates));
    expect(Object.values(route.turns!)).toEqual(['right']);
  });
  it('rejeita percurso vazio',()=>expect(()=>fromGeoJSON(geo([]))).toThrow());
});
