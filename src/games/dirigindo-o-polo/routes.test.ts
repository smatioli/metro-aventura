/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { routeDefinitions } from './data';
import { fromGeoJSON } from './navigation';
import { advance, direction, initialState, position, steer } from './game-state';
const assets=import.meta.glob('../../../public/routes/*',{query:'?raw',import:'default',eager:true});
const read=(file:string)=>JSON.parse(assets[`../../../public/routes/${file}`] as string);
describe('passeios cadastrados',()=>{
  it('usa nomes de arquivo portáveis para o deploy Linux',()=>{
    for(const definition of routeDefinitions) expect(definition.file).toMatch(/^[a-z0-9-]+\.geojson$/);
  });
  it.each(routeDefinitions)('$name tem mapa e nomes para todo o trajeto e termina sem centralizar',definition=>{
    const route=fromGeoJSON(read(definition.file),definition);
    const navigation=read(`${definition.id}-navigation.json`);
    const streets=read(`${definition.id}-streets.json`);
    expect(route.id).toBe(definition.id);
    expect(route.destination).toBe(definition.destination);
    expect(navigation.streetNames).toHaveLength(route.points.length-1);
    expect(navigation.streetNames.every((name:string)=>name.trim().length>0)).toBe(true);
    expect(navigation.unmatchedSegments).toEqual([]);
    expect(streets.length).toBeGreaterThan(0);
    expect(streets.every((street:{coordinates:number[][]})=>street.coordinates.length>=2)).toBe(true);
    let state=initialState();
    for(let tick=0;tick<100000 && state.phase!=='arrived';tick++){
      state=advance(route,state,.1);
      if(state.phase==='turn'){
        state=steer(route,state,direction(route,state.segment)==='right'?75:-75);
        expect(state.phase).toBe('driving');
      }
    }
    expect(state.phase).toBe('arrived');
    expect(position(route,state)[0]).toBeCloseTo(route.points.at(-1)![0]);
    expect(position(route,state)[1]).toBeCloseTo(route.points.at(-1)![1]);
  });
});
