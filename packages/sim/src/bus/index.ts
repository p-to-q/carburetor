import type { BusState, CombustorState, INVARIANTS } from '../types.js';
import { clamp, lerp } from '../math.js';

type Invariants = typeof INVARIANTS;

const REGULATOR_BUFFER_J = 50;
const LIFEPO4_BUFFER_J = 20_000;

export interface BusStepInput {
  bus: BusState;
  combustor: CombustorState;
  computeLoad_W: number;
  dt_s: number;
  invariants: Invariants;
}

export function createBusState(): BusState {
  return {
    v_bus_V: 4.1,
    i_bus_A: 0,
    v_li_V: liFePO4VoltageFromSoc(45),
    i_li_A: 0,
    soc_li_pct: 45,
    soc_cap_pct: 35,
    t_case_C: 25,
    mppt_locked: false,
    e_in_J: 0,
    e_out_J: 0,
    thermal_losses_J: 0,
  };
}

export function liFePO4VoltageFromSoc(soc_pct: number): number {
  if (soc_pct < 10) return lerp(2.8, 3.2, soc_pct / 10);
  if (soc_pct > 90) return lerp(3.3, 3.5, (soc_pct - 90) / 10);
  return 3.25;
}

export function stepBus({
  bus,
  combustor,
  computeLoad_W,
  dt_s,
  invariants,
}: BusStepInput): BusState {
  const rectified_W = combustor.electric_W_raw * 0.88;
  const eInDelta_J = rectified_W * dt_s;
  const eOutDelta_J = computeLoad_W * dt_s;
  const thermalLossDelta_J = Math.max(0, combustor.thermal_W) * dt_s;
  const net_J = eInDelta_J - eOutDelta_J;
  const capStored_J = (bus.soc_cap_pct / 100) * REGULATOR_BUFFER_J;
  const liStored_J = (bus.soc_li_pct / 100) * LIFEPO4_BUFFER_J;
  let capDelta_J = 0;
  let liDelta_J = 0;

  let overflow_J = 0;
  if (net_J >= 0) {
    capDelta_J = Math.min(net_J, REGULATOR_BUFFER_J - capStored_J);
    liDelta_J = Math.min(net_J - capDelta_J, LIFEPO4_BUFFER_J - liStored_J);
    overflow_J = net_J - capDelta_J - liDelta_J;
  } else {
    const demand_J = -net_J;
    capDelta_J = -Math.min(demand_J, capStored_J);
    liDelta_J = -Math.min(demand_J + capDelta_J, liStored_J);
  }

  const soc_cap_pct = clamp(((capStored_J + capDelta_J) / REGULATOR_BUFFER_J) * 100, 0, 100);
  const soc_li_pct = clamp(((liStored_J + liDelta_J) / LIFEPO4_BUFFER_J) * 100, 0, 100);
  const targetBus_V = clamp(4.0 + soc_cap_pct * 0.014, 4.0, invariants.v_bus_max_V);
  const v_bus_V = lerp(bus.v_bus_V, targetBus_V, dt_s / 4);
  const v_li_V = clamp(
    liFePO4VoltageFromSoc(soc_li_pct),
    invariants.v_li_min_V,
    invariants.v_li_max_V,
  );
  const t_case_C = clamp(
    lerp(bus.t_case_C, 25 + Math.max(0, combustor.hot_C - 25) * 0.11, dt_s / 120),
    20,
    invariants.t_case_max_C,
  );

  return {
    v_bus_V,
    i_bus_A: computeLoad_W / Math.max(0.1, v_bus_V),
    v_li_V,
    i_li_A:
      liDelta_J >= 0
        ? -Math.min(0.45, liDelta_J / Math.max(dt_s, 0.001) / v_li_V)
        : -liDelta_J / Math.max(dt_s, 0.001) / v_li_V,
    soc_li_pct,
    soc_cap_pct,
    t_case_C,
    mppt_locked: rectified_W >= 0.5 && combustor.running,
    e_in_J: bus.e_in_J + eInDelta_J,
    e_out_J: bus.e_out_J + eOutDelta_J,
    thermal_losses_J: bus.thermal_losses_J + thermalLossDelta_J + overflow_J,
  };
}
