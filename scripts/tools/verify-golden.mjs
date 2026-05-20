import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const goldenRoot = join(root, 'fixtures', 'golden');

function fail(message) {
  console.error(`[golden] ${message}`);
  process.exitCode = 1;
}

function sha256(filePath) {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return `sha256:${hash.digest('hex')}`;
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${relative(root, filePath)} is not valid JSON: ${error.message}`);
    return null;
  }
}

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

function f16ToF32(bits) {
  const sign = bits & 0x8000 ? -1 : 1;
  const exponent = (bits >>> 10) & 0x1f;
  const mantissa = bits & 0x03ff;

  if (exponent === 0) {
    return sign * (mantissa === 0 ? 0 : 2 ** -14 * (mantissa / 1024));
  }
  if (exponent === 31) {
    return mantissa === 0 ? sign * Infinity : NaN;
  }
  return sign * 2 ** (exponent - 15) * (1 + mantissa / 1024);
}

function decodeCombustorFrames(buf) {
  const frameBytes = 64;
  if (buf.length % frameBytes !== 0) {
    fail(`run.cbf byte length ${buf.length} is not divisible by ${frameBytes}`);
    return [];
  }

  const frames = [];
  for (let offset = 0; offset < buf.length; offset += frameBytes) {
    const frame = buf.subarray(offset, offset + frameBytes);
    frames.push({
      phase: PHASES[frame[40]],
      running: (frame[14] & 0b10) !== 0,
      rpm: frame.readUInt32LE(16),
      hot_C: f16ToF32(frame.readUInt16LE(20)),
      cold_C: f16ToF32(frame.readUInt16LE(22)),
      exhaust_dB_1m: f16ToF32(frame.readUInt16LE(24)),
      shaft_W: f16ToF32(frame.readUInt16LE(26)),
      thermal_W: f16ToF32(frame.readUInt16LE(28)),
      electric_W_raw: f16ToF32(frame.readUInt16LE(30)),
      runtime_s: frame.readUInt32LE(32),
      fuel_consumed_mL: frame.readFloatLE(36),
    });
  }
  return frames;
}

function verifyAssertions(name, scenarioPath, assertions) {
  if (!assertions || typeof assertions !== 'object' || Array.isArray(assertions)) return;

  const runPath = join(scenarioPath, 'run.cbf');
  if (!existsSync(runPath)) return;

  const frames = decodeCombustorFrames(readFileSync(runPath));
  const final = frames.at(-1);
  if (!final) {
    fail(`${name}/run.cbf contains no frames`);
    return;
  }

  if (
    typeof assertions.expected_frame_count === 'number' &&
    frames.length !== assertions.expected_frame_count
  ) {
    fail(
      `${name} frame count mismatch: expected ${assertions.expected_frame_count}, got ${frames.length}`,
    );
  }

  if (
    typeof assertions.final_combustor_phase === 'string' &&
    final.phase !== assertions.final_combustor_phase
  ) {
    fail(
      `${name} final combustor phase mismatch: expected ${assertions.final_combustor_phase}, got ${final.phase}`,
    );
  }

  if (typeof assertions.final_running === 'boolean' && final.running !== assertions.final_running) {
    fail(
      `${name} final running mismatch: expected ${assertions.final_running}, got ${final.running}`,
    );
  }

  if (
    typeof assertions.saw_combustor_phase === 'string' &&
    !frames.some((frame) => frame.phase === assertions.saw_combustor_phase)
  ) {
    fail(`${name} never saw combustor phase ${assertions.saw_combustor_phase}`);
  }
}

if (!existsSync(goldenRoot)) {
  fail('fixtures/golden/ is missing');
  process.exit();
}

const scenarios = readdirSync(goldenRoot)
  .map((name) => join(goldenRoot, name))
  .filter((path) => statSync(path).isDirectory());

if (scenarios.length === 0) {
  console.log('[golden] no scenario manifests yet; v0.2 will add the first fixtures');
  process.exit();
}

for (const scenarioPath of scenarios) {
  const name = relative(goldenRoot, scenarioPath);
  const manifestPath = join(scenarioPath, 'manifest.json');
  const readmePath = join(scenarioPath, 'README.md');

  if (!existsSync(readmePath)) {
    fail(`${name}/README.md is missing`);
  }

  if (!existsSync(manifestPath)) {
    fail(`${name}/manifest.json is missing`);
    continue;
  }

  const manifest = readJson(manifestPath);
  if (!manifest) continue;

  if (typeof manifest.seed !== 'number') {
    fail(`${name}/manifest.json must include numeric seed`);
  }

  if (!manifest.inputs || typeof manifest.inputs !== 'object' || Array.isArray(manifest.inputs)) {
    fail(`${name}/manifest.json must include object inputs`);
  }

  if (
    !manifest.outputs ||
    typeof manifest.outputs !== 'object' ||
    Array.isArray(manifest.outputs)
  ) {
    fail(`${name}/manifest.json must include object outputs`);
    continue;
  }

  for (const [outputName, expectedHash] of Object.entries(manifest.outputs)) {
    if (typeof expectedHash !== 'string' || !expectedHash.startsWith('sha256:')) {
      fail(`${name}/manifest.json output ${outputName} must be a sha256: hash`);
      continue;
    }

    const outputPath = join(scenarioPath, outputName);
    if (!existsSync(outputPath)) {
      fail(`${name}/${outputName} is listed in manifest but missing`);
      continue;
    }

    const actualHash = sha256(outputPath);
    if (actualHash !== expectedHash) {
      fail(`${name}/${outputName} hash mismatch: expected ${expectedHash}, got ${actualHash}`);
    }
  }

  verifyAssertions(name, scenarioPath, manifest.assertions);
}

if (process.exitCode) {
  process.exit();
}

console.log(`[golden] verified ${scenarios.length} scenario manifest(s)`);
