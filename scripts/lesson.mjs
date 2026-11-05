import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = new URL('src/pagination.mjs', root);
const good = 'event.id > cursor.id';
const bad = 'event.id >= cursor.id';
const command = process.argv[2];
const code = await readFile(source, 'utf8');
const state = code.includes(good) && !code.includes(bad) ? 'baseline-compatible' :
  code.includes(bad) && !code.includes(good) ? 'regression' : 'unknown';

if (command === 'status') {
  console.log(`Implementation: ${state}`);
  for (const [name, file] of Object.entries({
    'Consumer check': 'test/contract.test.mjs',
    'Review skill': '.claude/skills/review-api-change/SKILL.md',
    'CI workflow': '.github/workflows/ci.yml'
  })) {
    try { await access(new URL(file, root)); console.log(`${name}: installed`); }
    catch { console.log(`${name}: prepared in lesson-assets; not installed`); }
  }
} else if (command === 'regress' || command === 'fix') {
  if (state === 'unknown') throw new Error('Unknown source state; inspect manually. No files changed.');
  const from = command === 'regress' ? good : bad;
  const to = command === 'regress' ? bad : good;
  if (!code.includes(from)) throw new Error('Already in requested state. No files changed.');
  await writeFile(source, code.replace(from, to));
  console.log(command === 'regress' ? 'Seeded the inclusive cursor boundary. Inspect git diff.' : 'Restored the exclusive cursor boundary. Rerun unchanged checks.');
} else {
  const files = {
    'add-contract': ['contract.test.mjs', 'test/contract.test.mjs'],
    'add-skill': ['SKILL.md', '.claude/skills/review-api-change/SKILL.md'],
    'add-ci': ['ci.yml', '.github/workflows/ci.yml']
  };
  if (!files[command]) throw new Error('Use status, regress, fix, add-contract, add-skill or add-ci');
  const [asset, destination] = files[command];
  const target = new URL(destination, root);
  await mkdir(dirname(fileURLToPath(target)), { recursive: true });
  await copyFile(new URL(`lesson-assets/${asset}`, root), target, constants.COPYFILE_EXCL);
  console.log(`Installed prepared lesson file: ${destination}`);
}
