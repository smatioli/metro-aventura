import type { FleetId, LineId } from "./data";

export type Screen = "home" | "line" | "direction" | "fleet" | "journey" | "finished";
export type JourneyPhase = "travelling" | "arriving" | "waiting-open" | "doors-open" | "waiting-close";
export type View = "side" | "interior" | "cab";

export interface SaveGame {
  lineId: LineId;
  fleetId: FleetId;
  direction: 1 | -1;
  stationIndex: number;
}

export const SAVE_KEY = "metro-aventura-save-v1";

export function nextView(view: View, direction: 1 | -1): View {
  const views: View[] = ["side", "interior", "cab"];
  const index = views.indexOf(view);
  return views[(index + direction + views.length) % views.length];
}

export function nextStation(index: number, direction: 1 | -1, total: number): number | null {
  const next = index + direction;
  return next < 0 || next >= total ? null : next;
}

export function routeFor(stations: string[], direction: 1 | -1): string[] {
  return direction === 1 ? [...stations] : [...stations].reverse();
}

export function speedAtProgress(progress: number, maximum = 70): number {
  const safe = Math.max(0, Math.min(1, progress));
  if (safe < 0.25) return Math.round(maximum * (safe / 0.25));
  if (safe < 0.68) return maximum;
  return Math.round(maximum * (1 - (safe - 0.68) / 0.32));
}
