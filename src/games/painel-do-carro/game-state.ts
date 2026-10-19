import { polo } from "./data";

export function nextSpeed(speed: number, accelerating: boolean, seconds: number): number {
  return Math.max(0, Math.min(polo.maxSpeed, speed + (accelerating ? 9 : -6) * Math.max(0, seconds)));
}

export function gearForSpeed(speed: number): number {
  return 1 + polo.gearThresholds.filter(threshold => speed >= threshold).length;
}

export function rpmForSpeed(speed: number): number {
  const gear = gearForSpeed(speed);
  const start = gear === 1 ? 0 : polo.gearThresholds[gear - 2];
  return 850 + (speed - start) * 95;
}
