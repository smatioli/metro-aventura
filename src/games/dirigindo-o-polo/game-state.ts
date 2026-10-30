import type { Point, Route } from './data';
export type Phase = 'driving' | 'turn' | 'center' | 'arrived';
export interface State { segment: number; distance: number; phase: Phase }
export const initialState = (): State => ({ segment: 0, distance: 0, phase: 'driving' });
export function length(a: Point, b: Point): number { return Math.hypot(b[0]-a[0], b[1]-a[1]); }
export function direction(route: Route, segment: number): 'left' | 'right' {
  const [a,b,c] = route.points.slice(segment, segment+3);
  return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]) > 0 ? 'right' : 'left';
}
export function advance(route: Route, state: State, seconds: number): State {
  if (state.phase !== 'driving') return state;
  const limit = length(route.points[state.segment], route.points[state.segment+1]);
  const distance = Math.min(limit, state.distance + Math.max(0, Math.min(seconds, .1))*45);
  return { ...state, distance, phase: distance >= limit ? state.segment === route.points.length-2 ? 'arrived' : 'turn' : 'driving' };
}
export function steer(route: Route, state: State, angle: number): State {
  if (state.phase === 'turn' && (direction(route,state.segment) === 'right' ? angle >= 45 : angle <= -45)) return { ...state, phase: 'center' };
  if (state.phase === 'center' && Math.abs(angle) <= 15) return { segment: state.segment+1, distance: 0, phase: 'driving' };
  return state;
}
export function position(route: Route, state: State): Point {
  const a=route.points[state.segment], b=route.points[state.segment+1];
  const t=state.distance/length(a,b);
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
}
