export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(current: number, target: number, alpha: number): number {
  return current + (target - current) * clamp(alpha, 0, 1);
}

export function secondsBetween(prev_t_us: number, next_t_us: number): number {
  return Math.max(0, (next_t_us - prev_t_us) / 1_000_000);
}
