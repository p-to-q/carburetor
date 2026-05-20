import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
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

function sha256(buf) {
  return `sha256:${createHash('sha256').update(buf).digest('hex')}`;
}

function combustorPayload(frame) {
  const payload = new Uint8Array(32);
  const view = new DataView(payload.buffer);
  view.setUint32(0, frame.combustor.rpm ?? 0, true);
  view.setFloat32(4, frame.combustor.hot_C, true);
  view.setFloat32(8, frame.combustor.thermal_W, true);
  view.setFloat32(12, frame.combustor.electric_W_raw, true);
  view.setUint32(16, frame.combustor.runtime_s, true);
  view.setFloat32(20, frame.combustor.fuel_consumed_mL, true);
  payload[24] = [
    'off',
    'prime',
    'ignite',
    'warmup',
    'run',
    'cooldown',
    'flameout',
    'fuel_low',
    'thermal_high',
  ].indexOf(frame.combustor.phase);
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

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'run.cbf'), runBytes);
  writeFileSync(
    join(outDir, 'manifest.json'),
    `${JSON.stringify(
      {
        seed,
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
