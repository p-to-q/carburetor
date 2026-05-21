import assert from 'node:assert/strict';
import test from 'node:test';
import {
  INVARIANTS,
  TRANSITIONS,
  coldStartEvents,
  computeDraw,
  createBusState,
  createCombustorState,
  createComputeState,
  createInitialDeviceState,
  rssiBarsFromSignal,
  roundTiesToEven,
  runHeadless,
  stepBus,
  stepDevice,
} from '../dist/index.js';

test('combustor state machine has at least one exit per phase', () => {
  assert.equal(INVARIANTS.state_machine_totality_required, true);
  for (const [phase, exits] of Object.entries(TRANSITIONS)) {
    assert.ok(exits.length > 0, `${phase} has no exit`);
  }
});

test('cold start reaches warmup but does not skip straight to live', () => {
  const frames = runHeadless(coldStartEvents(5), 8);
  const phases = frames.map((frame) => frame.combustor.phase);

  assert.ok(phases.includes('prime'));
  assert.ok(phases.includes('ignite'));
  assert.ok(phases.includes('warmup'));
  assert.equal(phases.includes('run'), false);
});

test('long cold start eventually gates live on bus voltage', () => {
  const frames = runHeadless(coldStartEvents(5), 80);
  const firstRun = frames.find((frame) => frame.combustor.phase === 'run');

  assert.ok(firstRun);
  assert.ok(firstRun.bus.v_bus_V >= INVARIANTS.warmup_v_bus_threshold_V);
});

function storedBusEnergy_J(frame) {
  return frame.bus.soc_cap_pct * 0.5 + frame.bus.soc_li_pct * 200;
}

test('bus energy accounting includes buffer delta and thermal losses', () => {
  const frames = runHeadless(coldStartEvents(5), 80);
  const initial = frames[0];
  const final = frames.at(-1);

  assert.ok(final);
  const lhs = storedBusEnergy_J(initial) + final.bus.e_in_J;
  const rhs = storedBusEnergy_J(final) + final.bus.e_out_J;
  const tolerance_J = (INVARIANTS.energy_conservation_pct_tolerance / 100) * Math.max(1, lhs);

  assert.ok(Math.abs(lhs - rhs) <= tolerance_J);
  assert.ok(final.bus.thermal_losses_J > final.bus.e_in_J);
  assert.ok(final.bus.v_bus_V <= INVARIANTS.v_bus_max_V);
  assert.ok(final.bus.v_li_V <= INVARIANTS.v_li_max_V);
  assert.ok(final.bus.v_li_V >= INVARIANTS.v_li_min_V);
});

test('compute modes have increasing draw for active states', () => {
  const bus = createBusState();
  const sleep = computeDraw(createComputeState('sleep'), bus).power_W;
  const idle = computeDraw(createComputeState('idle'), bus).power_W;
  const tx = computeDraw(createComputeState('tx'), bus).power_W;

  assert.ok(sleep < idle);
  assert.ok(idle < tx);
});

test('compute signal strength derives rssi bars from mode', () => {
  const idle = createComputeState('idle');
  const tx = createComputeState('tx');
  const sleep = createComputeState('sleep');

  assert.equal(idle.signal_dbm, -105);
  assert.equal(idle.rssi_bars, rssiBarsFromSignal(idle.signal_dbm));
  assert.ok(tx.signal_dbm > idle.signal_dbm);
  assert.equal(sleep.rssi_bars, 0);
  assert.equal(rssiBarsFromSignal(-89), 4);
  assert.equal(rssiBarsFromSignal(-90), 4);
  assert.equal(rssiBarsFromSignal(-105), 3);
  assert.equal(rssiBarsFromSignal(-125), 1);
  assert.equal(rssiBarsFromSignal(-126), 0);
});

test('fuel temperature responds slowly to case heat', () => {
  const final = runHeadless(coldStartEvents(5), 80).at(-1);

  assert.ok(final);
  assert.ok(final.fuel.temperature_C > 25);
  assert.ok(final.fuel.temperature_C < final.bus.t_case_C);
});

test('ritual runtime is zero when engine is off', () => {
  const state = createInitialDeviceState();
  const refueled = stepDevice(state, 0, { kind: 'refuel', volume_mL: 5, t_us: 0 });

  assert.equal(refueled.combustor.running, false);
  assert.equal(refueled.ritual.minutes_runtime_remaining, 0);
  assert.equal(refueled.ritual.minutes_until_refuel, 0);
});

test('run shaft power is derived from coupled fuel burn model', () => {
  const runFrame = runHeadless(coldStartEvents(5), 80).find(
    (frame) => frame.combustor.phase === 'run',
  );

  assert.ok(runFrame);
  assert.ok(runFrame.combustor.shaft_W);
  assert.ok(runFrame.combustor.shaft_W > 15);
  assert.ok(runFrame.combustor.thermal_W > runFrame.combustor.shaft_W * 6.9);
  assert.ok(runFrame.combustor.electric_W_raw <= 7.2);
});

test('fuel exhaustion during run enters fuel_low and decays bus', () => {
  const frames = runHeadless(coldStartEvents(5), 80);
  const firstRun = frames.find((frame) => frame.combustor.phase === 'run');
  const runningFrame = firstRun && {
    ...firstRun,
    fuel: { ...firstRun.fuel, volume_mL: 0.05 },
  };

  assert.ok(runningFrame);
  assert.ok(runningFrame.fuel.volume_mL > 0);
  assert.equal(runningFrame.bus.mppt_locked, true);
  const exhausted = stepDevice(runningFrame, runningFrame.t_us + 5_000_000);
  const bufferOnly = stepDevice(exhausted, exhausted.t_us + 5_000_000);

  assert.equal(exhausted.combustor.phase, 'fuel_low');
  assert.equal(exhausted.combustor.running, false);
  assert.equal(exhausted.bus.mppt_locked, false);
  assert.equal(exhausted.fuel.volume_mL, 0);
  assert.ok(bufferOnly.bus.v_bus_V < exhausted.bus.v_bus_V);
  assert.ok(bufferOnly.bus.soc_cap_pct < exhausted.bus.soc_cap_pct);
});

test('kill during warmup enters cooldown and never run', () => {
  const warmupFrames = runHeadless(coldStartEvents(5), 8);
  const warmup = warmupFrames.at(-1);
  assert.ok(warmup);
  assert.equal(warmup.combustor.phase, 'warmup');
  assert.equal(
    warmupFrames.some((frame) => frame.combustor.phase === 'run'),
    false,
  );

  const killed = stepDevice(warmup, warmup.t_us + 1_000_000, {
    kind: 'kill',
    t_us: warmup.t_us + 1_000_000,
  });
  const afterKill = [killed];
  afterKill.push(stepDevice(afterKill.at(-1), afterKill.at(-1).t_us + 10_000_000));
  afterKill.push(stepDevice(afterKill.at(-1), afterKill.at(-1).t_us + 10_000_000));

  assert.equal(killed.combustor.phase, 'cooldown');
  assert.equal(killed.combustor.running, false);
  assert.equal(
    afterKill.some((frame) => frame.combustor.phase === 'run'),
    false,
  );
});

test('refuel during cooldown increases fuel but does not restart combustor', () => {
  const warmup = runHeadless(coldStartEvents(1), 8).at(-1);
  assert.ok(warmup);
  const cooldown = stepDevice(warmup, warmup.t_us + 1_000_000, {
    kind: 'kill',
    t_us: warmup.t_us + 1_000_000,
  });
  const refueled = stepDevice(cooldown, cooldown.t_us + 1_000_000, {
    kind: 'refuel',
    volume_mL: 5,
    t_us: cooldown.t_us + 1_000_000,
  });

  assert.ok(refueled.fuel.volume_mL > cooldown.fuel.volume_mL);
  assert.equal(refueled.combustor.phase, 'cooldown');
  assert.equal(refueled.combustor.running, false);
  assert.equal(refueled.bus.mppt_locked, false);
});

test('flameout triggers from failed ignition and falls back to buffer', () => {
  const state = createInitialDeviceState();
  const igniting = {
    ...state,
    fuel: { ...state.fuel, volume_mL: 5 },
    combustor: {
      ...state.combustor,
      phase: 'ignite',
      hot_C: 120,
      fuel_consumed_mL: 0.5,
    },
  };
  const flameout = stepDevice(igniting, 3_000_000);
  const noPrime = stepDevice(flameout, 4_000_000, { kind: 'crank', t_us: 4_000_000 });
  const primed = stepDevice(flameout, 4_000_000, {
    kind: 'prime',
    pumps: 3,
    t_us: 4_000_000,
  });
  const cranked = stepDevice(primed, 5_000_000, { kind: 'crank', t_us: 5_000_000 });

  assert.equal(flameout.combustor.phase, 'flameout');
  assert.equal(flameout.combustor.running, false);
  assert.equal(flameout.bus.mppt_locked, false);
  assert.ok(flameout.bus.soc_cap_pct < igniting.bus.soc_cap_pct);
  assert.equal(noPrime.combustor.phase, 'flameout');
  assert.equal(primed.combustor.phase, 'prime');
  assert.equal(cranked.combustor.phase, 'ignite');
});

test('flameout detection accumulates across subsecond steps', () => {
  const state = {
    ...createInitialDeviceState(),
    fuel: { ...createInitialDeviceState().fuel, volume_mL: 5 },
    combustor: {
      ...createInitialDeviceState().combustor,
      phase: 'ignite',
      hot_C: 120,
      fuel_consumed_mL: 0.5,
      phase_elapsed_s: 2.9,
    },
  };

  const flameout = stepDevice(state, 100_000);
  assert.equal(flameout.combustor.phase, 'flameout');
  assert.equal(flameout.combustor.phase_elapsed_s, 0);
});

test('bus recovers from warmup draw once raw electric output is available', () => {
  const frames = runHeadless(coldStartEvents(5), 30);
  const warmup = frames.find((frame) => frame.combustor.phase === 'warmup');
  const charged = frames.at(-1);

  assert.ok(warmup);
  assert.ok(charged);
  assert.ok(charged.bus.e_in_J > warmup.bus.e_in_J);
  assert.ok(charged.bus.soc_cap_pct > warmup.bus.soc_cap_pct);
  assert.equal(charged.bus.mppt_locked, true);
});

test('li-ion current reflects net bus power', () => {
  const bus = createBusState();
  const combustor = {
    ...createCombustorState(),
    running: true,
    electric_W_raw: 1 / 0.88,
  };
  const nearlyBalanced = stepBus({
    bus,
    combustor,
    computeLoad_W: 1.5,
    dt_s: 1,
    invariants: INVARIANTS,
  });
  const charging = stepBus({
    bus,
    combustor: { ...combustor, electric_W_raw: 8 / 0.88 },
    computeLoad_W: 0.5,
    dt_s: 1,
    invariants: INVARIANTS,
  });

  assert.ok(Object.is(nearlyBalanced.i_li_A, 0) || Object.is(nearlyBalanced.i_li_A, -0));
  assert.ok(nearlyBalanced.soc_cap_pct < bus.soc_cap_pct);
  assert.ok(Object.is(charging.i_li_A, 0) || Object.is(charging.i_li_A, -0));
  assert.ok(charging.soc_cap_pct > bus.soc_cap_pct);
});

test('LiFePO4 charges after output capacitor reaches full', () => {
  const bus = { ...createBusState(), soc_cap_pct: 100 };
  const combustor = {
    ...createCombustorState(),
    running: true,
    electric_W_raw: 8 / 0.88,
  };
  const charging = stepBus({
    bus,
    combustor,
    computeLoad_W: 0.5,
    dt_s: 1,
    invariants: INVARIANTS,
  });

  assert.equal(charging.soc_cap_pct, 100);
  assert.ok(charging.soc_li_pct > bus.soc_li_pct);
  assert.equal(charging.i_li_A, -0.45);
});

test('compute transitions through compose, tx, and rx on user messaging events', () => {
  const live = runHeadless(coldStartEvents(5), 80).find((frame) => frame.ritual.stage === 'live');
  assert.ok(live);

  const composing = stepDevice(live, live.t_us + 1_000_000, {
    kind: 'keypress',
    key: 'q',
    t_us: live.t_us + 1_000_000,
  });
  const sending = stepDevice(composing, composing.t_us + 1_000_000, {
    kind: 'compose_send',
    t_us: composing.t_us + 1_000_000,
  });
  const receiving = stepDevice(sending, sending.t_us + 1_000_000);

  assert.equal(composing.compute.mode, 'compose');
  assert.equal(composing.compute.queued_messages, 1);
  assert.equal(sending.compute.mode, 'tx');
  assert.equal(sending.compute.queued_messages, 0);
  assert.equal(receiving.compute.mode, 'rx');
});

test('low fuel warning appears before full exhaustion', () => {
  const live = runHeadless(coldStartEvents(5), 80).find((frame) => frame.combustor.phase === 'run');
  assert.ok(live);

  const nearlyEmpty = {
    ...live,
    fuel: { ...live.fuel, volume_mL: 0.002 },
  };
  const low = stepDevice(nearlyEmpty, nearlyEmpty.t_us + 1_000_000);

  assert.equal(low.combustor.phase, 'fuel_low');
  assert.equal(low.ritual.stage, 'refuel_needed');
  assert.equal(low.compute.mode, 'engine_attn');
});

test('restart after flameout requires refuel, prime, then crank', () => {
  const live = runHeadless(coldStartEvents(5), 80).find((frame) => frame.combustor.phase === 'run');
  assert.ok(live);
  const emptyRun = { ...live, fuel: { ...live.fuel, volume_mL: 0 } };
  const fuelLow = stepDevice(emptyRun, emptyRun.t_us + 1_000_000);
  const refueled = stepDevice(fuelLow, fuelLow.t_us + 1_000_000, {
    kind: 'refuel',
    volume_mL: 5,
    t_us: fuelLow.t_us + 1_000_000,
  });
  const crankWithoutPrime = stepDevice(refueled, refueled.t_us + 1_000_000, {
    kind: 'crank',
    t_us: refueled.t_us + 1_000_000,
  });
  const primed = stepDevice(refueled, refueled.t_us + 1_000_000, {
    kind: 'prime',
    pumps: 3,
    t_us: refueled.t_us + 1_000_000,
  });
  const cranked = stepDevice(primed, primed.t_us + 1_000_000, {
    kind: 'crank',
    t_us: primed.t_us + 1_000_000,
  });

  assert.equal(fuelLow.combustor.phase, 'fuel_low');
  assert.equal(refueled.combustor.phase, 'fuel_low');
  assert.equal(crankWithoutPrime.combustor.phase, 'fuel_low');
  assert.equal(primed.combustor.phase, 'prime');
  assert.equal(cranked.combustor.phase, 'ignite');
});

test('integer counters use ties-to-even rounding', () => {
  assert.equal(roundTiesToEven(0.5), 0);
  assert.equal(roundTiesToEven(1.5), 2);
  assert.equal(roundTiesToEven(2.5), 2);

  const live = runHeadless(coldStartEvents(5), 80).find((frame) => frame.combustor.phase === 'run');
  assert.ok(live);

  const halfSecond = stepDevice(live, live.t_us + 500_000);

  assert.equal(halfSecond.compute.uptime_s, live.compute.uptime_s);
  assert.equal(halfSecond.combustor.runtime_s, live.combustor.runtime_s);
});
