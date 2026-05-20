import type { CombustorPhase, CombustorState, FuelState, INVARIANTS, UserEvent } from '../types.js';
import { clamp, lerp } from '../math.js';

type Invariants = typeof INVARIANTS;

export const COX_049_WASTE_HEAT_TO_SHAFT_RATIO = 7.0;
export const SHAFT_TO_RAW_ELECTRIC_EFFICIENCY = 0.65;
export const RAW_ELECTRIC_OUTPUT_CAP_W = 7.2;
// Glow fuel: ~75% methanol (15.7 MJ/L) + ~25% nitromethane (12.9 MJ/L),
// displaced ~15-20% by oil. Net volumetric energy density: ~12.5 MJ/L.
// Previous value (18,720) was ~45% too high — see docs/research/parameter-validation-2026-05-20.md
export const GLOW_FUEL_CHEMICAL_W_PER_ML_PER_S = 12_500;
export const COX_049_SHAFT_THERMAL_EFFICIENCY = 0.125;
export const COX_049_RUN_FUEL_BURN_ML_PER_S =
  45 / (GLOW_FUEL_CHEMICAL_W_PER_ML_PER_S * COX_049_SHAFT_THERMAL_EFFICIENCY);

export interface CombustorStepInput {
  combustor: CombustorState;
  fuel: FuelState;
  dt_s: number;
  event?: UserEvent;
  bus_v_bus_V: number;
  warmupHold_s: number;
  invariants: Invariants;
}

export const TRANSITIONS: Record<CombustorPhase, CombustorPhase[]> = {
  off: ['prime'],
  prime: ['ignite', 'off'],
  ignite: ['warmup', 'flameout'],
  warmup: ['run', 'fuel_low', 'thermal_high', 'flameout', 'cooldown'],
  run: ['fuel_low', 'thermal_high', 'flameout', 'cooldown'],
  cooldown: ['off'],
  flameout: ['prime', 'cooldown'],
  fuel_low: ['prime', 'cooldown'],
  thermal_high: ['cooldown'],
};

export function createCombustorState(): CombustorState {
  return {
    kind: 'cox-049',
    running: false,
    rpm: null,
    hot_C: 25,
    cold_C: null,
    exhaust_dB_1m: 0,
    shaft_W: null,
    thermal_W: 0,
    electric_W_raw: 0,
    runtime_s: 0,
    fuel_consumed_mL: 0,
    phase: 'off',
  };
}

export function fuelBurn_mL_per_s(phase: CombustorPhase): number {
  if (phase === 'ignite' || phase === 'warmup') return COX_049_RUN_FUEL_BURN_ML_PER_S * (20 / 45);
  if (phase === 'run') return COX_049_RUN_FUEL_BURN_ML_PER_S;
  return 0;
}

function shaftPowerFromFuelBurn_W(burn_mL_per_s: number): number {
  return burn_mL_per_s * GLOW_FUEL_CHEMICAL_W_PER_ML_PER_S * COX_049_SHAFT_THERMAL_EFFICIENCY;
}

export function stepCombustor({
  combustor,
  fuel,
  dt_s,
  event,
  bus_v_bus_V,
  warmupHold_s,
  invariants,
}: CombustorStepInput): CombustorState {
  let phase = combustor.phase;

  if (event?.kind === 'kill') phase = combustor.running ? 'cooldown' : 'off';
  else if (fuel.volume_mL <= 0 && combustor.running) phase = 'fuel_low';
  else if (phase === 'ignite' && dt_s >= 3 && combustor.rpm === null) phase = 'flameout';
  else if (combustor.hot_C >= 300) phase = 'thermal_high';
  else if (phase === 'off' && event?.kind === 'prime' && event.pumps > 0 && fuel.volume_mL > 0) {
    phase = 'prime';
  } else if (phase === 'prime' && event?.kind === 'crank' && fuel.volume_mL > 0) {
    phase = 'ignite';
  } else if (
    (phase === 'flameout' || phase === 'fuel_low') &&
    event?.kind === 'prime' &&
    event.pumps > 0 &&
    fuel.volume_mL > 0
  ) {
    phase = 'prime';
  } else if (phase === 'ignite' && dt_s > 0) {
    phase = 'warmup';
  } else if (
    phase === 'warmup' &&
    bus_v_bus_V >= invariants.warmup_v_bus_threshold_V &&
    warmupHold_s >= invariants.warmup_v_bus_hold_s
  ) {
    phase = 'run';
  } else if (phase === 'cooldown' && combustor.hot_C <= 45) {
    phase = 'off';
  }

  const running = phase === 'ignite' || phase === 'warmup' || phase === 'run';
  const targetHot_C = running ? (phase === 'run' ? 245 : 210) : 25;
  const hot_C = lerp(combustor.hot_C, targetHot_C, running ? dt_s / 12 : dt_s / 90);
  const rpm = running
    ? Math.round(lerp(combustor.rpm ?? 0, phase === 'run' ? 18_000 : 12_000, dt_s / 5))
    : null;
  const targetShaft_W = shaftPowerFromFuelBurn_W(fuelBurn_mL_per_s(phase));
  const shaft_W = running ? lerp(combustor.shaft_W ?? 0, targetShaft_W, dt_s / 8) : null;
  const thermal_W = running ? Math.max(0, (shaft_W ?? 0) * COX_049_WASTE_HEAT_TO_SHAFT_RATIO) : 0;
  const electric_W_raw = running
    ? clamp((shaft_W ?? 0) * SHAFT_TO_RAW_ELECTRIC_EFFICIENCY, 0, RAW_ELECTRIC_OUTPUT_CAP_W)
    : 0;
  const burn_mL = fuelBurn_mL_per_s(phase) * dt_s;

  return {
    ...combustor,
    phase,
    running,
    rpm,
    hot_C,
    exhaust_dB_1m: running ? 86 : phase === 'cooldown' ? 20 : 0,
    shaft_W,
    thermal_W,
    electric_W_raw,
    runtime_s: combustor.runtime_s + (running ? Math.round(dt_s) : 0),
    fuel_consumed_mL: combustor.fuel_consumed_mL + burn_mL,
  };
}
