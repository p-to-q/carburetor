#!/usr/bin/env node
// edizione I build pipeline.
//
// status: 🧪 v0.1 — pipeline skeleton. paged.js integration TBD.
//
// for now this script concatenates the interior markdown files in spine
// order and writes an HTML scaffold to build/interior.html. running the
// HTML through paged.js + puppeteer to produce the PDF is v0.2 work.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EDIZIONE = dirname(__dirname); // press/edizione/
const BUILD = join(EDIZIONE, 'build');

// the file order matches spine.md. switch '01-manifesto.md' to
// '01-manifesto-draft.md' for an internal proof.
const PAGES = [
  '00-frontispiece.md',
  '00-contents.md',
  '01-manifesto.md',
  '02-architecture.md',
  '03-mk-units.md',
  '06-receipts.md',
  '04-editions.md',
  '05-bom-foldout.md',
  '07-influences.md',
  '08-close.md',
];

async function main() {
  await mkdir(BUILD, { recursive: true });

  console.log('[edizione] reading spine pages...');

  const sections = [];
  for (const p of PAGES) {
    const path = join(EDIZIONE, p);
    if (!existsSync(path)) {
      console.warn(`[edizione] missing: ${p} — skipping`);
      continue;
    }
    const md = await readFile(path, 'utf8');
    sections.push(`<!-- ===== ${p} ===== -->\n${md}`);
  }
  console.log(`[edizione] concatenated ${sections.length} sections`);

  // load template + style
  const template = await readFile(join(__dirname, 'template.html'), 'utf8');
  const style = await readFile(join(__dirname, 'style.css'), 'utf8');

  // crude markdown → HTML escape. v0.2 swaps this for `marked` once
  // dependencies are wired into pnpm workspace.
  const stub = sections
    .join('\n\n')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;');

  const html = template
    .replace('{{STYLE}}', `<style>${style}</style>`)
    .replace(
      '{{BODY}}',
      `<pre style="white-space: pre-wrap; font-family: 'IBM Plex Mono', monospace; font-size: 9pt;">${stub}</pre>\n` +
        `<p style="font-family: 'IBM Plex Mono', monospace; font-size: 8pt; color: #B5944A;">` +
        `[edizione] v0.1 build is a structural preview only. proper markdown → PDF rendering ships at v0.2.</p>`,
    );

  const outHtml = join(BUILD, 'interior.html');
  await writeFile(outHtml, html, 'utf8');
  console.log('[edizione] wrote', outHtml);

  // ---- v0.2 work ----
  // const { spawn } = await import('node:child_process');
  // await new Promise((resolve, reject) => {
  //   const proc = spawn('npx', ['pagedjs-cli', outHtml, '-o', join(BUILD, 'edizione-1-interior.pdf')], {
  //     stdio: 'inherit',
  //   });
  //   proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`pagedjs-cli ${code}`))));
  // });

  // write a build manifest
  const manifest = {
    git_sha: process.env.GITHUB_SHA ?? 'local',
    node: process.version,
    built_at: new Date().toISOString(),
    spine_sections: sections.length,
    note: 'v0.1 build — html only. pdf pipeline pending v0.2.',
  };
  await writeFile(
    join(BUILD, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );

  console.log('[edizione] done.');
  console.log('[edizione] open build/interior.html in a browser to preview.');
}

main().catch((e) => {
  console.error('[edizione] build failed:', e);
  process.exit(1);
});
