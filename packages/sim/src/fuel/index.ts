import type { FuelKind, FuelState, UserEvent } from '../types.js';
import { clamp, lerp } from '../math.js';

const VAPOR_PRESSURE_KPA: Record<FuelKind, number> = {
  glow: 13.0,
  butane: 243.0,
  gasoline: 55.0,
};

export interface FuelStepInput {
  fuel: FuelState;
  dt_s: number;
  fuelBurn_mL_per_s: number;
  event?: UserEvent;
  heatSource_C?: number;
  tankCapacity_mL?: number;
}

export function createFuelState(kind: FuelKind = 'glow', volume_mL = 0): FuelState {
  return {
    kind,
    volume_mL,
    temperature_C: 25,
    vapor_pressure_kPa: VAPOR_PRESSURE_KPA[kind],
    contaminant_water_pct: kind === 'glow' ? 0 : undefined,
  };
}

export function stepFuel({
  fuel,
  dt_s,
  fuelBurn_mL_per_s,
  event,
  heatSource_C = 25,
  tankCapacity_mL = 15,
}: FuelStepInput): FuelState {
  const refuel_mL = event?.kind === 'refuel' ? event.volume_mL : 0;
  const volume_mL = clamp(
    fuel.volume_mL + refuel_mL - fuelBurn_mL_per_s * dt_s,
    0,
    tankCapacity_mL,
  );

  const targetTemperature_C = clamp(heatSource_C, 20, 60);
  const temperature_C = lerp(fuel.temperature_C, targetTemperature_C, dt_s / 120);

  return {
    ...fuel,
    volume_mL,
    temperature_C,
    vapor_pressure_kPa: VAPOR_PRESSURE_KPA[fuel.kind],
  };
}
