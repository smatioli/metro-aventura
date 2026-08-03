export type Screen = "linha" | "estacao" | "direcao" | "estacao-livre" | "embarque" | "viagem" | "chegada";

export type ZoneId = "entrada" | "catraca" | "corredor" | "plataforma" | "trem-portas";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WalkZone {
  id: ZoneId;
  rect: Rect;
}

export interface Position {
  x: number;
  y: number;
}

export type Facing = "up" | "down" | "left" | "right";

export interface RideAnnouncement {
  current: string;
  next: string | null;
  isTerminal: boolean;
}

export const SCENE_BOUNDS = { minX: 4, maxX: 96, minY: 6, maxY: 94 };

// Fixed scene geometry for the station walk: a single canonical layout mirrored
// horizontally depending on which side the platform doors open on, so the
// visible platform edge/train always matches platformSideFor's convention.
export function walkZonesFor(platformSide: "left" | "right"): WalkZone[] {
  const trainX = platformSide === "right" ? 76 : 6;
  return [
    { id: "entrada", rect: { x: 38, y: 80, w: 24, h: 14 } },
    { id: "catraca", rect: { x: 40, y: 60, w: 20, h: 14 } },
    { id: "corredor", rect: { x: 24, y: 26, w: 52, h: 36 } },
    { id: "plataforma", rect: { x: 6, y: 8, w: 88, h: 20 } },
    { id: "trem-portas", rect: { x: trainX, y: 8, w: 18, h: 20 } }
  ];
}

export function zoneAt(pos: Position, zones: WalkZone[]): ZoneId | null {
  let found: ZoneId | null = null;
  for (const zone of zones) {
    const { rect } = zone;
    if (pos.x >= rect.x && pos.x <= rect.x + rect.w && pos.y >= rect.y && pos.y <= rect.y + rect.h) found = zone.id;
  }
  return found;
}

export function stepPosition(pos: Position, dx: number, dy: number, distance: number, bounds: typeof SCENE_BOUNDS = SCENE_BOUNDS): Position {
  const x = Math.min(bounds.maxX, Math.max(bounds.minX, pos.x + dx * distance));
  const y = Math.min(bounds.maxY, Math.max(bounds.minY, pos.y + dy * distance));
  return { x, y };
}

export function facingFor(dx: number, dy: number, fallback: Facing): Facing {
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

export function rideAnnouncementFor(route: string[], index: number): RideAnnouncement {
  const isTerminal = index >= route.length - 1;
  return { current: route[index], next: isTerminal ? null : route[index + 1], isTerminal };
}

export function nextStationAnnouncementText(route: string[], index: number): string {
  const { next, isTerminal } = rideAnnouncementFor(route, index);
  return isTerminal ? "Fim de linha." : `Próxima estação: ${next}.`;
}

export function rideProgress(route: string[], index: number): number {
  if (route.length <= 1) return 1;
  return index / (route.length - 1);
}
