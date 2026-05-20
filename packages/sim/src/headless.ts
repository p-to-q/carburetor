import { type DeviceState, type UserEvent, INVARIANTS } from './types.js';
import { createBusState, stepBus } from './bus/index.js';
import { createCombustorState, fuelBurn_mL_per_s, stepCombustor } from './combustor/index.js';
import { computeDraw, createComputeState, stepCompute } from './compute/index.js';
import { createFuelState, stepFuel } from './fuel/index.js';
import { roundTiesToEven, secondsBetween } from './math.js';
import { createRitualState, stepRitual } from './ritual/index.js';

export function createInitialDeviceState(): DeviceState {
  return {
    t_us: 0,
    fuel: createFuelState('glow', 0),
    combustor: createCombustorState(),
    bus: createBusState(),
    compute: createComputeState('sleep'),
    ritual: createRitualState(),
  };
}

export function stepDevice(prev: DeviceState, next_t_us: number, event?: UserEvent): DeviceState {
  const dt_s = secondsBetween(prev.t_us, next_t_us);
  const warmupHold_s =
    prev.combustor.phase === 'warmup' && prev.bus.v_bus_V >= INVARIANTS.warmup_v_bus_threshold_V
      ? prev.combustor.phase_elapsed_s
      : 0;
  const fuelAfterBurn = stepFuel({
    fuel: prev.fuel,
    dt_s,
    fuelBurn_mL_per_s: fuelBurn_mL_per_s(prev.combustor.phase),
    event,
    heatSource_C: prev.bus.t_case_C,
  });
  const combustor = stepCombustor({
    combustor: prev.combustor,
    fuel: fuelAfterBurn,
    dt_s,
    event,
    bus_v_bus_V: prev.bus.v_bus_V,
    warmupHold_s,
    invariants: INVARIANTS,
  });
  const preCompute = stepCompute(prev.compute, prev.bus, dt_s, event);
  const draw = computeDraw(preCompute, prev.bus);
  const bus = stepBus({
    bus: prev.bus,
    combustor,
    computeLoad_W: draw.power_W,
    dt_s,
    invariants: INVARIANTS,
  });
  const compute =
    event || preCompute.mode !== prev.compute.mode ? preCompute : stepCompute(preCompute, bus, 0);
  const ritual = stepRitual(fuelAfterBurn, combustor, bus.t_case_C);

  return {
    t_us: next_t_us,
    fuel: fuelAfterBurn,
    combustor,
    bus,
    compute,
    ritual,
  };
}

export function runHeadless(events: UserEvent[], duration_s: number, step_s = 1): DeviceState[] {
  let state = createInitialDeviceState();
  const frames: DeviceState[] = [state];
  const sortedEvents = [...events].sort((a, b) => a.t_us - b.t_us);
  let eventIndex = 0;

  for (let t_s = step_s; t_s <= duration_s; t_s += step_s) {
    const t_us = roundTiesToEven(t_s * 1_000_000);
    while (true) {
      const event = sortedEvents[eventIndex];
      if (event === undefined || event.t_us > t_us) break;
      state = stepDevice(state, event.t_us, event);
      eventIndex += 1;
    }
    state = stepDevice(state, t_us);
    frames.push(state);
  }

  return frames;
}

export function coldStartEvents(fill_mL = 5): UserEvent[] {
  return [
    { kind: 'refuel', volume_mL: fill_mL, t_us: 0 },
    { kind: 'prime', pumps: 3, t_us: 1_000_000 },
    { kind: 'crank', t_us: 2_000_000 },
  ];
}
