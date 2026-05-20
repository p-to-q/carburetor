import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const tsBuild = join(root, 'packages', 'sim', 'dist', 'index.js');
const pyPython = join(root, 'python', 'sim_mini', '.venv', 'bin', 'python');
const framePayloadCode = `
const F32_VIEW = new Float32Array(1);
const U32_VIEW = new Uint32Array(F32_VIEW.buffer);
const PHASES = ['off', 'prime', 'ignite', 'warmup', 'run', 'cooldown', 'flameout', 'fuel_low', 'thermal_high'];
function f32ToF16Bits(value) {
  F32_VIEW[0] = value;
  const bits = U32_VIEW[0];
  const sign = (bits >>> 16) & 0x8000;
  let exponent = ((bits >>> 23) & 0xff) - 127 + 15;
  let mantissa = bits & 0x7fffff;
  if (exponent >= 31) return sign | 0x7c00 | (mantissa ? 0x200 : 0);
  if (exponent <= 0) {
    if (exponent < -10) return sign;
    mantissa |= 0x800000;
    const shift = 14 - exponent;
    const half = 1 << (shift - 1);
    const subnormal = mantissa >>> shift;
    const remainder = mantissa & ((1 << shift) - 1);
    const rounded =
      remainder > half || (remainder === half && (subnormal & 1)) ? subnormal + 1 : subnormal;
    return sign | rounded;
  }
  let normal = mantissa >>> 13;
  const remainder = mantissa & 0x1fff;
  if (remainder > 0x1000 || (remainder === 0x1000 && (normal & 1))) normal += 1;
  if (normal === 0x400) {
    exponent += 1;
    normal = 0;
  }
  if (exponent >= 31) return sign | 0x7c00;
  return sign | (exponent << 10) | normal;
}
function setF16LE(view, offset, value) {
  view.setUint16(offset, f32ToF16Bits(value), true);
}
function combustorPayload(frame) {
  const payload = new Uint8Array(32);
  const view = new DataView(payload.buffer);
  view.setUint32(0, frame.combustor.rpm ?? 0, true);
  setF16LE(view, 4, frame.combustor.hot_C);
  setF16LE(view, 8, frame.combustor.exhaust_dB_1m);
  setF16LE(view, 10, frame.combustor.shaft_W ?? 0);
  setF16LE(view, 12, frame.combustor.thermal_W);
  setF16LE(view, 14, frame.combustor.electric_W_raw);
  view.setUint32(16, frame.combustor.runtime_s, true);
  view.setFloat32(20, frame.combustor.fuel_consumed_mL, true);
  const phaseIndex = PHASES.indexOf(frame.combustor.phase);
  if (phaseIndex === -1) throw new Error('unknown combustor phase: ' + frame.combustor.phase);
  payload[24] = phaseIndex;
  return payload;
}`;

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function fail(message) {
  console.error(`[sim-compare] ${message}`);
  process.exitCode = 1;
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`${label} did not return valid JSON: ${error.message}`);
    return null;
  }
}

if (!existsSync(tsBuild)) {
  fail('packages/sim/dist/index.js is missing; run `pnpm build` first');
  process.exit();
}

if (!existsSync(pyPython)) {
  fail(
    'python/sim_mini/.venv/bin/python is missing; run `cd python/sim_mini && python -m venv .venv && pip install -e ".[dev]"`',
  );
  process.exit();
}

const tsOutput = run('node', [
  '-e',
  [
    "import('./packages/sim/dist/index.js').then(({ createTelemetryFrame, encodeTelemetryFrame, runHeadless, coldStartEvents }) => {",
    framePayloadCode,
    '  const frames = runHeadless(coldStartEvents(5), 80);',
    '  const telemetry_hex = frames.map((frame, seq) => Buffer.from(encodeTelemetryFrame(createTelemetryFrame({ seq, t_us: frame.t_us, layer: 2, kind: 0x10, flags: frame.combustor.running ? 3 : 1, payload: combustorPayload(frame) }))).toString("hex")).join("");',
    '  console.log(JSON.stringify({ frames, telemetry_hex }));',
    '});',
  ].join('\n'),
]);

const pyOutput = run(
  pyPython,
  [
    '-c',
    [
      'import json',
      'import struct',
      'from dataclasses import asdict',
      'from sim_mini.headless import cold_start_events, run_headless',
      'from sim_mini.telemetry import create_telemetry_frame, encode_telemetry_frame',
      'frames = run_headless(cold_start_events(5.0), 80)',
      'phases = ["off", "prime", "ignite", "warmup", "run", "cooldown", "flameout", "fuel_low", "thermal_high"]',
      'def combustor_payload(frame):',
      '    payload = bytearray(32)',
      '    struct.pack_into("<I", payload, 0, frame.combustor.rpm or 0)',
      '    struct.pack_into("<e", payload, 4, frame.combustor.hot_C)',
      '    struct.pack_into("<e", payload, 8, frame.combustor.exhaust_dB_1m)',
      '    struct.pack_into("<e", payload, 10, frame.combustor.shaft_W or 0.0)',
      '    struct.pack_into("<e", payload, 12, frame.combustor.thermal_W)',
      '    struct.pack_into("<e", payload, 14, frame.combustor.electric_W_raw)',
      '    struct.pack_into("<I", payload, 16, frame.combustor.runtime_s)',
      '    struct.pack_into("<f", payload, 20, frame.combustor.fuel_consumed_mL)',
      '    payload[24] = phases.index(frame.combustor.phase)',
      '    return bytes(payload)',
      'telemetry_hex = "".join(encode_telemetry_frame(create_telemetry_frame(seq=seq, t_us=frame.t_us, layer=2, kind=0x10, flags=3 if frame.combustor.running else 1, payload=combustor_payload(frame))).hex() for seq, frame in enumerate(frames))',
      'print(json.dumps({"frames": [asdict(frame) for frame in frames], "telemetry_hex": telemetry_hex}))',
    ].join('\n'),
  ],
  {
    env: {
      ...process.env,
      PYTHONPATH: join(root, 'python'),
    },
  },
);

const tsResult = parseJson(tsOutput, 'typescript runner');
const pyResult = parseJson(pyOutput, 'python runner');

if (!tsResult || !pyResult) process.exit();

const diffs = [];

const tolerances = {
  'fuel.volume_mL': 0.01,
  'fuel.temperature_C': 0.01,
  'fuel.vapor_pressure_kPa': 0.01,
  'combustor.hot_C': 4.0,
  'combustor.exhaust_dB_1m': 0.01,
  'combustor.shaft_W': 0.05,
  'combustor.thermal_W': 0.5,
  'combustor.electric_W_raw': 0.05,
  'combustor.fuel_consumed_mL': 0.01,
  'bus.v_bus_V': 0.08,
  'bus.i_bus_A': 0.01,
  'bus.v_li_V': 0.08,
  'bus.i_li_A': 0.02,
  'bus.soc_li_pct': 0.05,
  'bus.soc_cap_pct': 0.2,
  'bus.t_case_C': 0.1,
  'bus.e_in_J': 0.5,
  'bus.e_out_J': 0.5,
  'bus.thermal_losses_J': 2.0,
  'compute.mcu_mA': 0.001,
  'compute.radio_mA': 0.001,
  'compute.lcd_uA': 0.001,
  'compute.signal_dbm': 0.001,
  'ritual.dB_at_ear': 0.01,
  'ritual.case_C': 0.1,
  'ritual.minutes_runtime_remaining': 0.02,
  'ritual.minutes_until_refuel': 0.02,
};

function compareValue(name, left, right, tolerance = 0) {
  if (typeof left === 'number' && typeof right === 'number') {
    const delta = Math.abs(left - right);
    if (delta > tolerance)
      diffs.push(`${name}: ${left} vs ${right} (delta ${delta.toFixed(4)} > ${tolerance})`);
  } else if (left !== right) {
    diffs.push(`${name}: ${left} vs ${right}`);
  }
}

function compareObject(path, left, right) {
  const keys = new Set([...Object.keys(left ?? {}), ...Object.keys(right ?? {})]);
  for (const key of [...keys].sort()) {
    const name = path ? `${path}.${key}` : key;
    const leftValue = left?.[key];
    const rightValue = right?.[key];
    if (
      leftValue &&
      rightValue &&
      typeof leftValue === 'object' &&
      typeof rightValue === 'object' &&
      !Array.isArray(leftValue) &&
      !Array.isArray(rightValue)
    ) {
      compareObject(name, leftValue, rightValue);
    } else {
      compareValue(
        name,
        leftValue,
        rightValue,
        tolerances[name.replace(/^frames\[\d+\]\./, '')] ?? 0,
      );
    }
  }
}

if (tsResult.frames.length !== pyResult.frames.length) {
  diffs.push(`frame count: ${tsResult.frames.length} vs ${pyResult.frames.length}`);
}

for (let index = 0; index < Math.min(tsResult.frames.length, pyResult.frames.length); index += 1) {
  compareObject(`frames[${index}]`, tsResult.frames[index], pyResult.frames[index]);
}

compareValue('telemetry.hex', tsResult.telemetry_hex, pyResult.telemetry_hex);

if (diffs.length > 0) {
  fail(`TS/Python mismatch:\n${diffs.map((line) => `  - ${line}`).join('\n')}`);
  process.exit();
}

console.log('[sim-compare] TS and Python headless + telemetry runs agree within tolerance');
