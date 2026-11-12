/**
 * Incorpora cifras levantadas na web ao banco curado (`webChordsDatabase.ts`).
 *
 *   node tools/add-chords.mjs <arquivo.json> [<arquivo.json> ...]
 *
 * O JSON é o array retornado pelos agentes de pesquisa. Entradas com o mesmo
 * título (sem diferenciar maiúsculas/acento) são substituídas.
 */
import fs from 'node:fs';
import path from 'node:path';

const jsonFiles = process.argv.slice(2);
if (!jsonFiles.length) {
  console.error('Uso: node tools/add-chords.mjs <arquivo.json> [...]');
  process.exit(1);
}

const entries = jsonFiles.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
if (!entries.length) {
  console.error('JSON invalido ou vazio');
  process.exit(1);
}

const target = path.resolve('src/utils/webChordsDatabase.ts');
let src = fs.readFileSync(target, 'utf8');

const START = 'export const WEB_CHORDS_DATABASE: WebChordEntry[] = [';
const start = src.indexOf(START);
if (start === -1) throw new Error('array nao encontrado');
const bodyStart = start + START.length;
const bodyEnd = src.indexOf('\n];', bodyStart);
if (bodyEnd === -1) throw new Error('fim do array nao encontrado');

const body = src.slice(bodyStart, bodyEnd);

// Cada entrada comeca com "\n  {\n    title: '" — a unica occurrence confiavel,
// ja que o chordProContent e um template literal com chaves internas.
const ENTRY_MARK = /\r?\n  \{\r?\n    title: '((?:[^'\\]|\\.)*)'/g;
const marks = [];
let m;
while ((m = ENTRY_MARK.exec(body)) !== null) {
  marks.push({ title: m[1].replace(/\\'/g, "'"), index: m.index });
}

const blocks = marks.map((mk, i) => ({
  title: mk.title,
  text: body.slice(mk.index, i + 1 < marks.length ? marks[i + 1].index : body.length),
}));

const norm = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[()]/g, '')
    .trim();

const esc = (s) =>
  String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

function toEntry(e) {
  const content = String(e.chordProContent || '').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  return [
    '  {',
    `    title: '${esc(e.title)}',`,
    `    artist: '${esc(e.artist || '')}',`,
    `    key: '${esc(e.key || 'G')}',`,
    `    bpm: ${Number(e.bpm) || 100},`,
    `    timeSignature: '${esc(e.timeSignature || '2/4')}',`,
    `    sourceUrl: '${esc(e.sourceUrl || '')}',`,
    `    notes: '${esc(e.notes || '')}',`,
    `    chordProContent: \`${content}\`,`,
    '  },',
  ].join('\n');
}

const incoming = new Map();
for (const e of entries) incoming.set(norm(e.title), e);

const out = [];
let added = 0;
let replaced = 0;

for (const block of blocks) {
  const replacement = incoming.get(norm(block.title));
  if (replacement) {
    out.push(toEntry(replacement));
    replaced++;
    incoming.delete(norm(block.title));
  } else {
    out.push(block.text.replace(/^\n/, '').replace(/\s+$/, ''));
  }
}

for (const e of incoming.values()) {
  out.push(toEntry(e));
  added++;
}

const newBody = '\n' + out.join('\n');
src = src.slice(0, bodyStart) + newBody + src.slice(bodyEnd);
fs.writeFileSync(target, src, 'utf8');

console.log(
  `OK: ${added} novas, ${replaced} substituidas, ${out.length} entradas no banco curado`
);
