#!/usr/bin/env node
// Bundle @carburetor/sim for browser consumption.
// Produces packages/sim/dist/sim.browser.js — a self-contained ES module
// that vapore (and any future browser surface) can import.

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const result = await build({
  entryPoints: [resolve(root, 'packages/sim/src/browser.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  outfile: resolve(root, 'packages/sim/dist/sim.browser.js'),
  platform: 'browser',
  sourcemap: true,
  minify: false, // keep readable for now
  logLevel: 'info',
});

if (result.errors.length > 0) {
  process.exit(1);
}
