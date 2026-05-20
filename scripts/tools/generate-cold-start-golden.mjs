import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { arch, platform, release } from 'node:os';
import { join } from 'node:path';
import {
  coldStartEvents,
  createTelemetryFrame,
  encodeTelemetryFrame,
  runHeadless,
  stepDevice,
} from '../../packages/sim/dist/index.js';

const root = process.cwd();
const goldenRoot = join(root, 'fixtures', 'golden');
const seed = 42;
const git_sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const lockfile_hash = sha256(readFileSync(join(root, 'pnpm-lock.yaml')));
const pythonVersion = execFileSync(
  join(root, 'python', 'sim_mini', '.venv', 'bin', 'python'),
  ['--version'],
  { encoding: 'utf8' },
).trim();
const F32_VIEW = new Float32Array(1);
const U32_VIEW = new Uint32Array(F32_VIEW.buffer);
const PHASES = [
  'off',
  'prime',
  'ignite',
  'warmup',
  'run',
  'cooldown',
  'flameout',
  'fuel_low',
  'thermal_high',
];

function sha256(buf) {
  return `sha256:${createHash('sha256').update(buf).digest('hex')}`;
}

function f32ToF16Bits(value) {
  F32_VIEW[0] = value;
  const bits = U32_VIEW[0];
  const sign = (bits >>> 16) & 0x8000;
  let exponent = ((bits >>> 23) & 0xff) - 127 + 15;
  let mantissa = bits & 0x7fffff;

  if (exponent >= 31) {
    return sign | 0x7c00 | (mantissa ? 0x200 : 0);
  }
  if (exponent <= 0) {
    if (exponent < -10) return sign;
    mantissa |= 0x800000;
    const shift = 14 - exponent;
    const half = 1 << (shift - 1);
    const subnormal = mantissa >>> shift;
    const remainder = mantissa & ((1 << shift) - 1);
    const rounded =
      remainder > half || (remainder === half && subnormal & 1) ? subnormal + 1 : subnormal;
    return sign | rounded;
  }

  let normal = mantissa >>> 13;
  const remainder = mantissa & 0x1fff;
  if (remainder > 0x1000 || (remainder === 0x1000 && normal & 1)) normal += 1;
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
  if (phaseIndex === -1) {
    throw new Error(`unknown combustor phase: ${frame.combustor.phase}`);
  }
  payload[24] = phaseIndex;
  return payload;
}

function encodeFrames(frames) {
  const encodedFrames = frames.map((frame, index) =>
    encodeTelemetryFrame(
      createTelemetryFrame({
        seq: index,
        t_us: frame.t_us,
        layer: 2,
        kind: 0x10,
        flags: frame.combustor.running ? 0b11 : 0b1,
        payload: combustorPayload(frame),
      }),
    ),
  );
  return Buffer.concat(encodedFrames.map((frame) => Buffer.from(frame)));
}

function writeScenario({ name, description, duration_s, step_s = 1, events, frames, assertions }) {
  const outDir = join(goldenRoot, name);
  const runBytes = encodeFrames(frames);
  const start_us = frames.at(0)?.t_us ?? 0;
  const end_us = frames.at(-1)?.t_us ?? start_us;

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'run.cbf'), runBytes);
  writeFileSync(
    join(outDir, 'manifest.json'),
    `${JSON.stringify(
      {
        git_sha,
        lockfile_hash,
        seed,
        start_us,
        end_us,
        inputs: {
          scenario: name,
          duration_s,
          step_s,
          events,
        },
        assertions,
        outputs: {
          'run.cbf': sha256(runBytes),
        },
        host: {
          os: `${platform()}-${release()}`,
          arch: arch(),
          node: process.version,
          python: pythonVersion.replace(/^Python\s+/, ''),
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(outDir, 'README.md'),
    [
      `# ${name}`,
      '',
      description,
      '',
      'this fixture currently pins combustor-layer telemetry frames only. layer CSV expansion is planned after the decoder/rendering path lands.',
      '',
      '`Q.E.D.`',
      '',
    ].join('\n'),
  );

  console.log(`[golden] wrote ${name}: ${frames.length} frame(s), ${sha256(runBytes)}`);
}

function scenarioFrames(events, duration_s, step_s = 1) {
  return runHeadless(events, duration_s, step_s);
}

function withManualTail(frames, tail) {
  const out = [...frames];
  let state = out.at(-1);
  for (const item of tail) {
    state = stepDevice(state, item.t_us, item.event);
    out.push(state);
  }
  return out;
}

const coldStartEvents15 = coldStartEvents(15);
const coldStartWarmup = scenarioFrames(coldStartEvents15, 60);
const coldStartFinal = coldStartWarmup.at(-1);

writeScenario({
  name: 'cold-start-warmup',
  description:
    'deterministic mk i cold-start fixture: refuel, prime, crank, warm up, and enter live operation.',
  duration_s: 60,
  events: coldStartEvents15,
  frames: coldStartWarmup,
  assertions: {
    expected_frame_count: coldStartWarmup.length,
    final_combustor_phase: coldStartFinal.combustor.phase,
    saw_combustor_phase: 'warmup',
  },
});

const fullBurnEvents = coldStartEvents(5);
const fullBurn = scenarioFrames(fullBurnEvents, 260);
const fullBurnFinal = fullBurn.at(-1);

writeScenario({
  name: 'full-burn',
  description:
    'full-tank burn-down fixture: run until fuel is exhausted and the device asks for refuel.',
  duration_s: 260,
  events: fullBurnEvents,
  frames: fullBurn,
  assertions: {
    expected_frame_count: fullBurn.length,
    final_combustor_phase: fullBurnFinal.combustor.phase,
    saw_combustor_phase: 'run',
  },
});

const killRestartBase = scenarioFrames(coldStartEvents(5), 80);
const killRestartTail = [
  { t_us: 81_000_000, event: { kind: 'kill', t_us: 81_000_000 } },
  { t_us: 400_000_000 },
  { t_us: 401_000_000, event: { kind: 'refuel', volume_mL: 2, t_us: 401_000_000 } },
  { t_us: 402_000_000, event: { kind: 'prime', pumps: 3, t_us: 402_000_000 } },
  { t_us: 403_000_000, event: { kind: 'crank', t_us: 403_000_000 } },
  { t_us: 460_000_000 },
];
const killRestart = withManualTail(killRestartBase, killRestartTail);
const killRestartFinal = killRestart.at(-1);

writeScenario({
  name: 'kill-restart',
  description:
    'kill-switch and restart fixture: stop a warm engine, cool down to off, refuel, prime, crank, and re-enter warmup/run.',
  duration_s: 460,
  events: [...coldStartEvents(5), ...killRestartTail.map((item) => item.event).filter(Boolean)],
  frames: killRestart,
  assertions: {
    expected_frame_count: killRestart.length,
    final_combustor_phase: killRestartFinal.combustor.phase,
    final_running: killRestartFinal.combustor.running,
    saw_combustor_phase: 'cooldown',
  },
});

const lowFuel = scenarioFrames(coldStartEvents(1), 80);
const lowFuelFinal = lowFuel.at(-1);

writeScenario({
  name: 'low-fuel-warning',
  description:
    'low-fuel fixture: small fill reaches refuel-needed path after the engine consumes the tank.',
  duration_s: 80,
  events: coldStartEvents(1),
  frames: lowFuel,
  assertions: {
    expected_frame_count: lowFuel.length,
    final_combustor_phase: lowFuelFinal.combustor.phase,
    saw_combustor_phase: 'run',
  },
});
