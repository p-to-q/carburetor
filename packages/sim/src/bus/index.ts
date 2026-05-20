import type { BusState, CombustorState, INVARIANTS } from '../types.js';
import { clamp, lerp } from '../math.js';

type Invariants = typeof INVARIANTS;

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
    v_li_V: 3.7,
    i_li_A: 0,
    soc_li_pct: 45,
    soc_cap_pct: 35,
    t_case_C: 25,
    mppt_locked: false,
    e_in_J: 0,
    e_out_J: 0,
  };
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
  const net_J = eInDelta_J - eOutDelta_J;
  const cap_J = 600;
  const li_J = 8_000;
  const capPctDelta = (net_J / cap_J) * 100;
  const liPctDelta = (net_J > 0 ? (net_J * 0.25) / li_J : (net_J * 0.7) / li_J) * 100;
  const soc_cap_pct = clamp(bus.soc_cap_pct + capPctDelta, 0, 100);
  const soc_li_pct = clamp(bus.soc_li_pct + liPctDelta, 0, 100);
  const targetBus_V = clamp(4.0 + soc_cap_pct * 0.014, 4.0, invariants.v_bus_max_V);
  const v_bus_V = lerp(bus.v_bus_V, targetBus_V, dt_s / 4);
  const v_li_V = clamp(3.0 + soc_li_pct * 0.012, invariants.v_li_min_V, invariants.v_li_max_V);
  const net_W = net_J / Math.max(dt_s, 0.001);
  const t_case_C = clamp(
    lerp(bus.t_case_C, 25 + Math.max(0, combustor.hot_C - 25) * 0.11, dt_s / 120),
    20,
    invariants.t_case_max_C,
  );

  return {
    v_bus_V,
    i_bus_A: computeLoad_W / Math.max(0.1, v_bus_V),
    v_li_V,
    i_li_A: net_W >= 0 ? -Math.min(0.45, net_W / v_li_V) : -net_W / v_li_V,
    soc_li_pct,
    soc_cap_pct,
    t_case_C,
    mppt_locked: rectified_W >= 0.5 && combustor.running,
    e_in_J: bus.e_in_J + eInDelta_J,
    e_out_J: bus.e_out_J + eOutDelta_J,
  };
}
