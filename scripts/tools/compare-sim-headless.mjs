import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const tsBuild = join(root, 'packages', 'sim', 'dist', 'index.js');
const pyPython = join(root, 'python', 'sim_mini', '.venv', 'bin', 'python');

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
    '  const frames = runHeadless(coldStartEvents(5), 80);',
    '  const payload = new Uint8Array(32);',
    '  payload[0] = 1;',
    '  payload[31] = 255;',
    '  const frame = createTelemetryFrame({ seq: 42, t_us: 123456, layer: 3, kind: 0x20, flags: 0b101, payload });',
    '  console.log(JSON.stringify({ frames, telemetry_hex: Buffer.from(encodeTelemetryFrame(frame)).toString("hex") }));',
    '});',
  ].join(' '),
]);

const pyOutput = run(
  pyPython,
  [
    '-c',
    [
      'import json',
      'from dataclasses import asdict',
      'from sim_mini.headless import cold_start_events, run_headless',
      'from sim_mini.telemetry import create_telemetry_frame, encode_telemetry_frame',
      'frames = run_headless(cold_start_events(5.0), 80)',
      'payload = bytes([1] + ([0] * 30) + [255])',
      'frame = create_telemetry_frame(seq=42, t_us=123456, layer=3, kind=0x20, flags=0b101, payload=payload)',
      'print(json.dumps({"frames": [asdict(frame) for frame in frames], "telemetry_hex": encode_telemetry_frame(frame).hex()}))',
    ].join('; '),
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
  'compute.mcu_mA': 0.001,
  'compute.modem_mA': 0.001,
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
