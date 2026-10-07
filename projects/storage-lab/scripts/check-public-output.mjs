import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { validatePublic } from './public-schema.mjs';

function fail(code) { throw new Error(code); }
try {
  const snapshot = JSON.parse(readFileSync(new URL('../content/training.json', import.meta.url), 'utf8'));
  validatePublic(snapshot);
  const root = resolve(process.argv[2] || 'out');
  if (!existsSync(root)) fail('PUBLIC_OUTPUT_MISSING');
  const forbidden = /reviewQuestions|scoreEvidence|source_ref|SYNTHETIC_PRIVATE_CANARY|(?:STREAM|DEMO)-\d{3}(?:-R\d+)?|(?:\\?["'])(?:question|answer|reflection|revisions|roundId|exerciseId|sourceHash|previousHash|messageTimestamp|requestEventId|privateUrl|evidenceEventIds)(?:\\?["'])\s*:/;
  let scanned = 0;
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const path = resolve(dir, entry); const stat = lstatSync(path);
      if (stat.isSymbolicLink()) fail('PUBLIC_OUTPUT_LINK_FAILED');
      if (stat.isDirectory()) { walk(path); continue; }
      if (!/\.(?:html|js|mjs|json|map|txt)$/.test(entry)) continue;
      if (forbidden.test(readFileSync(path, 'utf8'))) fail('PUBLIC_OUTPUT_BOUNDARY_FAILED');
      scanned++;
    }
  }
  walk(root);
  // Server bundles are scanned too. Static exports additionally prove that all
  // required routes carry the same publication, including retained old aliases.
  if (existsSync(resolve(root, 'index.html'))) {
    const pages = ['index.html',
      ...snapshot.rounds.map(round => `rounds/${round.id}/index.html`),
      ...Array.from({ length: 12 }, (_, i) => `sessions/${String(i + 1).padStart(2, '0')}/index.html`),
    ];
    for (const page of pages) {
      const filename = resolve(root, page);
      if (!existsSync(filename)) fail('PUBLIC_OUTPUT_ROUTE_MISSING');
      const html = readFileSync(filename, 'utf8');
      if (!html.includes(snapshot.publicationId)) fail('PUBLIC_OUTPUT_VERSION_FAILED');
      if (Object.values(snapshot.summary.assessments).includes('unassessed') && !html.includes('未评估')) fail('PUBLIC_OUTPUT_ASSESSMENT_FAILED');
    }
  }
  console.log(`Public v2 artifact boundary checked: ${scanned} text files.`);
} catch (error) {
  console.error(/^PUBLIC_(?:OUTPUT|SCHEMA)_[A-Z_]+$/.test(error.message) ? error.message : 'PUBLIC_OUTPUT_CHECK_FAILED');
  process.exitCode = 1;
}
