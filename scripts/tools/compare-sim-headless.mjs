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
    '  const final = runHeadless(coldStartEvents(5), 80).at(-1);',
    '  const payload = new Uint8Array(32);',
    '  payload[0] = 1;',
    '  payload[31] = 255;',
    '  const frame = createTelemetryFrame({ seq: 42, t_us: 123456, layer: 3, kind: 0x20, flags: 0b101, payload });',
    '  console.log(JSON.stringify({ final, telemetry_hex: Buffer.from(encodeTelemetryFrame(frame)).toString("hex") }));',
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
      'final = run_headless(cold_start_events(5.0), 80)[-1]',
      'payload = bytes([1] + ([0] * 30) + [255])',
      'frame = create_telemetry_frame(seq=42, t_us=123456, layer=3, kind=0x20, flags=0b101, payload=payload)',
      'print(json.dumps({"final": asdict(final), "telemetry_hex": encode_telemetry_frame(frame).hex()}))',
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

const ts = tsResult.final;
const py = pyResult.final;

const checks = [
  ['t_us', ts.t_us, py.t_us, 0],
  ['combustor.phase', ts.combustor.phase, py.combustor.phase, 0],
  ['bus.v_bus_V', ts.bus.v_bus_V, py.bus.v_bus_V, 0.08],
  ['bus.v_li_V', ts.bus.v_li_V, py.bus.v_li_V, 0.08],
  ['bus.e_in_J', ts.bus.e_in_J, py.bus.e_in_J, 0.5],
  ['bus.e_out_J', ts.bus.e_out_J, py.bus.e_out_J, 0.5],
  ['combustor.hot_C', ts.combustor.hot_C, py.combustor.hot_C, 4.0],
  ['fuel.volume_mL', ts.fuel.volume_mL, py.fuel.volume_mL, 0.01],
  ['ritual.stage', ts.ritual.stage, py.ritual.stage, 0],
  ['telemetry.hex', tsResult.telemetry_hex, pyResult.telemetry_hex, 0],
];

const diffs = [];

for (const [name, left, right, tolerance] of checks) {
  if (typeof left === 'number' && typeof right === 'number') {
    const delta = Math.abs(left - right);
    if (delta > tolerance)
      diffs.push(`${name}: ${left} vs ${right} (delta ${delta.toFixed(4)} > ${tolerance})`);
  } else if (left !== right) {
    diffs.push(`${name}: ${left} vs ${right}`);
  }
}

if (diffs.length > 0) {
  fail(`TS/Python mismatch:\n${diffs.map((line) => `  - ${line}`).join('\n')}`);
  process.exit();
}

console.log('[sim-compare] TS and Python headless + telemetry runs agree within tolerance');
