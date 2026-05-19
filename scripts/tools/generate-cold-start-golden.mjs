import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  coldStartEvents,
  createTelemetryFrame,
  encodeTelemetryFrame,
  runHeadless,
} from '../../packages/sim/dist/index.js';

const root = process.cwd();
const scenario = 'cold-start-warmup';
const outDir = join(root, 'fixtures', 'golden', scenario);
const seed = 42;
const duration_s = 60;
const fill_mL = 15;

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

const frames = runHeadless(coldStartEvents(fill_mL), duration_s);
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
const runBytes = Buffer.concat(encodedFrames.map((frame) => Buffer.from(frame)));
const final = frames.at(-1);

if (!final) {
  throw new Error('headless run produced no frames');
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'run.cbf'), runBytes);
writeFileSync(
  join(outDir, 'manifest.json'),
  `${JSON.stringify(
    {
      seed,
      inputs: {
        scenario,
        duration_s,
        step_s: 1,
        events: [
          { kind: 'refuel', volume_mL: fill_mL, t_us: 0 },
          { kind: 'prime', pumps: 3, t_us: 1_000_000 },
          { kind: 'crank', t_us: 2_000_000 },
        ],
      },
      assertions: {
        final_combustor_phase: final.combustor.phase,
        final_ritual_stage: final.ritual.stage,
        final_fuel_mL_min: 12,
        final_bus_v_bus_V_min: 4.8,
      },
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
    '# cold-start-warmup',
    '',
    'deterministic mk i cold-start fixture: refuel, prime, crank, warm up, and enter live operation.',
    '',
    'this fixture currently pins combustor-layer telemetry frames only. layer CSV expansion is planned after the decoder/rendering path lands.',
    '',
    '`Q.E.D.`',
    '',
  ].join('\n'),
);

console.log(`[golden] wrote ${scenario}: ${encodedFrames.length} frame(s), ${sha256(runBytes)}`);
