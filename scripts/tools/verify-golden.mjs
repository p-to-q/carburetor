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
}

if (process.exitCode) {
  process.exit();
}

console.log(`[golden] verified ${scenarios.length} scenario manifest(s)`);
