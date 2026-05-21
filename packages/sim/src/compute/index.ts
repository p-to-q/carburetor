import type { BusState, ComputeMode, ComputeState, UserEvent } from '../types.js';
import { roundTiesToEven } from '../math.js';

export interface ComputeDraw {
  current_A: number;
  power_W: number;
}

// Power profile: ESP32-S3 MCU + LoRa SX1262 radio + Sharp Memory LCD.
// MCU: deep sleep ~8 µA, radio sleep / 80 MHz idle ~25 mA, active ~35 mA.
// Radio: SX1262 sleep 0.16 µA, RX 4.6 mA, TX +22dBm 118 mA.
// LCD: LS013B7DH03 static ~10 µA, 1Hz refresh ~50 µA, active ~250 µA.
// See docs/research/parameter-validation-2026-05-20.md for sources.
const MODE_CURRENTS: Record<ComputeMode, Pick<ComputeState, 'mcu_mA' | 'radio_mA' | 'lcd_uA'>> = {
  sleep: { mcu_mA: 0.008, radio_mA: 0.00016, lcd_uA: 10 },
  idle: { mcu_mA: 25, radio_mA: 4.6, lcd_uA: 50 },
  rx: { mcu_mA: 25, radio_mA: 4.6, lcd_uA: 175 },
  tx: { mcu_mA: 25, radio_mA: 118, lcd_uA: 175 },
  compose: { mcu_mA: 35, radio_mA: 4.6, lcd_uA: 250 },
  engine_attn: { mcu_mA: 25, radio_mA: 0.00016, lcd_uA: 250 },
};

const MODE_SIGNAL_DBM: Record<ComputeMode, number> = {
  sleep: -130,
  idle: -105,
  rx: -95,
  tx: -85,
  compose: -100,
  engine_attn: -110,
};

export function rssiBarsFromSignal(signal_dbm: number): 0 | 1 | 2 | 3 | 4 {
  if (signal_dbm >= -90) return 4;
  if (signal_dbm >= -105) return 3;
  if (signal_dbm >= -115) return 2;
  if (signal_dbm >= -125) return 1;
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
    uptime_s: prev.uptime_s + roundTiesToEven(dt_s),
  };
}

export function computeDraw(compute: ComputeState, bus: BusState): ComputeDraw {
  const rail_V = Math.max(3.0, bus.v_li_V);
  const mcu_A = compute.mcu_mA / 1000;
  const radio_A = compute.radio_mA / 1000;
  const lcd_A = compute.lcd_uA / 1_000_000;
  const power_W = (mcu_A + radio_A) * rail_V + lcd_A * bus.v_bus_V;

  return {
    current_A: power_W / Math.max(0.1, bus.v_bus_V),
    power_W,
  };
}
