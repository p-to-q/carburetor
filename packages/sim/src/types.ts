// the architecture, as types.
// see ../../../docs/architecture.md.
// every field has units in its name. every interface is a layer boundary.

// ============ layer 1: fuel ============

export type FuelKind = 'glow' | 'butane' | 'gasoline';

export interface FuelState {
  kind: FuelKind;
  volume_mL: number;
  temperature_C: number;
  vapor_pressure_kPa: number;
  contaminant_water_pct?: number; // glow fuel only
}

// ============ layer 2: combustor ============

export type CombustorKind = 'cox-049' | 'catalytic-teg' | 'stirling';

export type CombustorPhase =
  | 'off'
  | 'prime'
  | 'ignite'
  | 'warmup'
  | 'run'
  | 'cooldown'
  | 'flameout'
  | 'fuel_low'
  | 'thermal_high';

export interface CombustorState {
  kind: CombustorKind;
  running: boolean;
  rpm: number | null;            // mk i only
  hot_C: number;
  cold_C: number | null;         // mk ii only
  exhaust_dB_1m: number;
  shaft_W: number | null;        // mk i only
  thermal_W: number;
  electric_W_raw: number;        // pre-rectifier; feeds bus
  runtime_s: number;
  fuel_consumed_mL: number;
  phase: CombustorPhase;
}

// ============ layer 3: bus ============

export interface BusState {
  v_bus_V: number;
  i_bus_A: number;
  v_li_V: number;
  i_li_A: number;
  soc_li_pct: number;            // li-ion state of charge
  soc_cap_pct: number;            // supercap state of charge
  t_case_C: number;
  mppt_locked: boolean;
  e_in_J: number;                 // cumulative energy in from combustor
  e_out_J: number;                // cumulative energy out to compute
}

// ============ layer 4: compute ============

export type ComputeMode =
  | 'sleep'           // deep sleep, modem psm, lcd holding image
  | 'idle'            // mcu awake, screen on, no traffic
  | 'rx'              // modem registered, listening
  | 'tx'              // modem transmitting
  | 'compose'         // user typing
  | 'engine_attn';    // engine ui (during warmup or refuel)

export interface ComputeState {
  mode: ComputeMode;
  mcu_mA: number;
  modem_mA: number;
  lcd_uA: number;
  signal_dbm: number;
  rssi_bars: 0 | 1 | 2 | 3 | 4;
  queued_messages: number;
  uptime_s: number;
}

// ============ layer 5: ritual ============

export type RitualStage =
  | 'cold'
  | 'priming'
  | 'cranking'
  | 'warmup'
  | 'live'
  | 'cooldown'
  | 'refuel_needed';

export type Scent = 'none' | 'castor' | 'butane';

export interface RitualState {
  stage: RitualStage;
  dB_at_ear: number;
  case_C: number;
  scent: Scent;
  minutes_runtime_remaining: number;
  minutes_until_refuel: number;
  next_user_action: string | null;   // e.g., 'pour 5 mL', 'pull crank', 'wait 38 s'
}

// ============ system snapshot ============
// a complete state of the device at one instant.
// emitted as a telemetry frame at 100 Hz (10 Hz for ritual).
// see docs/codec-protocol.md.

export interface DeviceState {
  t_us: number;                  // monotonic timestamp µs (number is safe through ~285 years)
  fuel: FuelState;
  combustor: CombustorState;
  bus: BusState;
  compute: ComputeState;
  ritual: RitualState;
}

// ============ user events ============
// the only inputs that drive the device.

export type UserEvent =
  | { kind: 'refuel'; volume_mL: number; t_us: number }
  | { kind: 'prime'; pumps: number; t_us: number }
  | { kind: 'crank'; t_us: number }
  | { kind: 'kill'; t_us: number }
  | { kind: 'keypress'; key: string; t_us: number }
  | { kind: 'compose_send'; t_us: number };

// ============ invariants ============
// asserted by `pnpm sim:test`. violations fail ci.
// see docs/hard-constraints.md for the soft/hard distinction.

export const INVARIANTS = {
  // energy conservation: bus output never exceeds combustor input + initial buffer
  // (within 2% for f16 quantization round-trip)
  energy_conservation_pct_tolerance: 2.0,

  // every combustor phase has at least one valid transition out
  state_machine_totality_required: true,

  // bus voltages stay within hardware-safe limits
  v_bus_max_V: 5.5,
  v_li_max_V: 4.2,
  v_li_min_V: 3.0,

  // thermal limit on the user-touchable case
  t_case_max_C: 60,

  // warm-up gate is not skippable (see hard-constraints.md)
  warmup_v_bus_threshold_V: 4.8,
  warmup_v_bus_hold_s: 5,
  warmup_teg_hot_threshold_C: 180,
} as const;

// ============ telemetry frame ============
// see docs/codec-protocol.md for the wire format.

export interface TelemetryFrame {
  sync: 0xCB;
  version: 1;
  seq: number;
  t_us: number;
  layer: 1 | 2 | 3 | 4 | 5;
  kind: number;
  flags: number;
  payload: Uint8Array;            // 32 bytes
  sha256_prefix: Uint8Array;      // 8 bytes
}
