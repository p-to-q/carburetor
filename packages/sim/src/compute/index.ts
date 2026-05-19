import type { BusState, ComputeMode, ComputeState, UserEvent } from '../types.js';

export interface ComputeDraw {
  current_A: number;
  power_W: number;
}

const MODE_CURRENTS: Record<ComputeMode, Pick<ComputeState, 'mcu_mA' | 'modem_mA' | 'lcd_uA'>> = {
  sleep: { mcu_mA: 0.002, modem_mA: 0.003, lcd_uA: 10 },
  idle: { mcu_mA: 5, modem_mA: 4, lcd_uA: 50 },
  rx: { mcu_mA: 5, modem_mA: 100, lcd_uA: 175 },
  tx: { mcu_mA: 5, modem_mA: 600, lcd_uA: 175 },
  compose: { mcu_mA: 7, modem_mA: 100, lcd_uA: 250 },
  engine_attn: { mcu_mA: 8, modem_mA: 4, lcd_uA: 250 },
};

const MODE_SIGNAL_DBM: Record<ComputeMode, number> = {
  sleep: -105,
  idle: -89,
  rx: -78,
  tx: -70,
  compose: -82,
  engine_attn: -92,
};

export function rssiBarsFromSignal(signal_dbm: number): 0 | 1 | 2 | 3 | 4 {
  if (signal_dbm >= -70) return 4;
  if (signal_dbm >= -80) return 3;
  if (signal_dbm >= -90) return 2;
  if (signal_dbm >= -100) return 1;
  return 0;
}

export function createComputeState(mode: ComputeMode = 'sleep'): ComputeState {
  return {
    mode,
    ...MODE_CURRENTS[mode],
    signal_dbm: MODE_SIGNAL_DBM[mode],
    rssi_bars: rssiBarsFromSignal(MODE_SIGNAL_DBM[mode]),
    queued_messages: 0,
    uptime_s: 0,
  };
}

export function chooseComputeMode(
  prev: ComputeState,
  bus: BusState,
  event: UserEvent | undefined,
): ComputeMode {
  if (bus.v_bus_V < 4.4 || bus.v_li_V < 3.2) return 'sleep';
  if (event?.kind === 'compose_send') return 'tx';
  if (event?.kind === 'keypress') return 'compose';
  if (prev.mode === 'tx') return 'rx';
  if (prev.mode === 'compose') return 'compose';
  return bus.mppt_locked ? 'idle' : 'engine_attn';
}

export function stepCompute(
  prev: ComputeState,
  bus: BusState,
  dt_s: number,
  event?: UserEvent,
): ComputeState {
  const mode = chooseComputeMode(prev, bus, event);
  const currents = MODE_CURRENTS[mode];
  const queuedDelta =
    event?.kind === 'keypress' ? 1 : event?.kind === 'compose_send' ? -prev.queued_messages : 0;

  return {
    ...prev,
    mode,
    ...currents,
    signal_dbm: MODE_SIGNAL_DBM[mode],
    rssi_bars: rssiBarsFromSignal(MODE_SIGNAL_DBM[mode]),
    queued_messages: Math.max(0, prev.queued_messages + queuedDelta),
    uptime_s: prev.uptime_s + Math.round(dt_s),
  };
}

export function computeDraw(compute: ComputeState, bus: BusState): ComputeDraw {
  const rail_V = Math.max(3.0, bus.v_li_V);
  const mcu_A = compute.mcu_mA / 1000;
  const modem_A = compute.modem_mA / 1000;
  const lcd_A = compute.lcd_uA / 1_000_000;
  const power_W = (mcu_A + modem_A) * rail_V + lcd_A * bus.v_bus_V;

  return {
    current_A: power_W / Math.max(0.1, bus.v_bus_V),
    power_W,
  };
}
