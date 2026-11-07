import type { Point, Route, RouteDefinition } from './data';
export interface GeoRoute { type: string; geometry: { type: string; coordinates: number[][] } }
export interface Street { name: string; points: Point[] }
const latitude = -23.57;
export function project(coordinate: readonly number[]): Point {
  return [(coordinate[0]+46.56)*111320*Math.cos(latitude*Math.PI/180), (latitude-coordinate[1])*111320 || 0];
}
export function fromGeoJSON(geo: GeoRoute, definition?: RouteDefinition): Route {
  if(geo.type!=='Feature' || geo.geometry.type!=='LineString') throw new Error('A rota precisa ser um LineString.');
  const points=geo.geometry.coordinates.map(c=>{
    if(c.length<2 || !c.every(Number.isFinite)) throw new Error('Coordenada inválida.');
    return project(c);
  }).filter((p,i,a)=>!i || Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>.1);
  if(points.length<2) throw new Error('Rota sem percurso.');
  const turns=detectTurns(points);
  return {...(definition ?? {id:'instituto-tea',name:'Vamos ao Instituto TEA',icon:'💙',destination:'Instituto TEA'}),points,turns};
}
// Compare headings across 25 m, so a rounded corner is one maneuver rather
// than many tiny changes. Nearby detections are grouped at their strongest bend.
function detectTurns(points: readonly Point[]): Record<number,'left'|'right'> {
  const distances=[0];
  for(let i=1;i<points.length;i++) distances.push(distances[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
  const at=(distance:number): Point=>{
    let low=0, high=distances.length-1;
    while(high-low>1){const mid=Math.floor((low+high)/2);if(distances[mid]<=distance)low=mid;else high=mid;}
    const t=(distance-distances[low])/(distances[high]-distances[low]);
    return [points[low][0]+t*(points[high][0]-points[low][0]),points[low][1]+t*(points[high][1]-points[low][1])];
  };
  const turns: Record<number,'left'|'right'>={};
  let cluster: {last:number;index:number;delta:number}|undefined;
  const commit=()=>{if(cluster)turns[cluster.index-1]=cluster.delta>0?'right':'left';};
  for(let i=1;i<points.length-1;i++){
    const a=at(Math.max(0,distances[i]-25)),b=points[i],c=at(Math.min(distances.at(-1)!,distances[i]+25));
    const u=Math.atan2(b[1]-a[1],b[0]-a[0]),v=Math.atan2(c[1]-b[1],c[0]-b[0]);
    const delta=Math.atan2(Math.sin(v-u),Math.cos(v-u))*180/Math.PI;
    if(Math.abs(delta)<42)continue;
    if(cluster && distances[i]-cluster.last<35 && Math.sign(delta)===Math.sign(cluster.delta)){
      cluster.last=distances[i];
      if(Math.abs(delta)>Math.abs(cluster.delta)){cluster.index=i;cluster.delta=delta;}
    }else{commit();cluster={last:distances[i],index:i,delta};}
  }
  commit();
  return turns;
}
export function streetAt(route: Route, segment: number, streets: readonly Street[]): string {
  const a=route.points[segment],b=route.points[segment+1];
  const p: Point=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  let best=22, name='';
  for(const street of streets) for(let i=0;i<street.points.length-1;i++) {
    const c=street.points[i],d=street.points[i+1],dx=d[0]-c[0],dy=d[1]-c[1],l=dx*dx+dy*dy;
    if(!l) continue;
    const alignment=Math.abs(((b[0]-a[0])*dx+(b[1]-a[1])*dy)/(Math.hypot(b[0]-a[0],b[1]-a[1])*Math.sqrt(l)));
    if(alignment<.85) continue;
    const t=Math.max(0,Math.min(1,((p[0]-c[0])*dx+(p[1]-c[1])*dy)/l));
    const distance=Math.hypot(p[0]-c[0]-t*dx,p[1]-c[1]-t*dy);
    if(distance<best){best=distance;name=street.name;}
  }
  return name;
}
