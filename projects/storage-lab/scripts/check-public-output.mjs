import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { validatePublic } from './public-schema.mjs';
const snapshot = JSON.parse(readFileSync(new URL('../content/training.json', import.meta.url), 'utf8'));
validatePublic(snapshot);
const root = resolve(process.argv[2] || 'out');
if (!existsSync(root)) throw new Error('PUBLIC_OUTPUT_MISSING');
const forbidden = /reviewQuestions|scoreEvidence|source_ref|SYNTHETIC_PRIVATE_CANARY|"(?:question|answer|reflection|revisions|roundId|exerciseId)"\s*:/;
let scanned = 0;
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = resolve(dir, entry);
    if (statSync(path).isDirectory()) { walk(path); continue; }
    if (!/\.(?:html|js|json|map|txt)$/.test(entry)) continue;
    const value = readFileSync(path, 'utf8');
    if (forbidden.test(value)) throw new Error('PUBLIC_OUTPUT_BOUNDARY_FAILED');
    scanned++;
  }
}
walk(root);
if (existsSync(resolve(root, 'index.html'))) {
  for (const page of ['index.html', ...Array.from({ length: 12 }, (_, i) => `sessions/${String(i + 1).padStart(2, '0')}/index.html`)]) {
    const html = readFileSync(resolve(root, page), 'utf8');
    if (!html.includes(snapshot.publicationId) || !html.includes('未评估')) throw new Error('PUBLIC_OUTPUT_VERSION_FAILED');
  }
}
console.log(`Public artifact boundary checked: ${scanned} text files.`);
