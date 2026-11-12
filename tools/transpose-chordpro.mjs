/**
 * Transpõe uma cifra ChordPro para outro tom.
 *
 *   node tools/transpose-chordpro.mjs <entrada.json> <saida.json>
 *
 * Cada entrada pode ter "targetKey" (o tom da banda, vindo do PDF do
 * repertório) e "fromKey" (o tom real dos acordes publicados — quando difere
 * do campo "key"). Se fromKey === targetKey, a cifra é copiada sem alteração.
 */
import fs from 'node:fs';
import {
  calculateKeyDifference,
  parseChordParts,
  transposeChord,
  prefersFlats,
} from '../src/utils/transposer.ts';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Uso: node tools/transpose-chordpro.mjs <entrada.json> <saida.json>');
  process.exit(1);
}

const entries = JSON.parse(fs.readFileSync(input, 'utf8'));

/** Acorde dentro de colchetes: [C], [Dm7], [F#/Ab], [C#m7(13)] */
const CHORD_TOKEN = /\[([^\]\n]+)\]/g;

function transposeChordPro(content, fromKey, toKey) {
  const semitones = calculateKeyDifference(fromKey, toKey);
  if (!semitones) return { content, semitones: 0 };

  const flat = prefersFlats(toKey);
  const out = content.replace(CHORD_TOKEN, (match, inner) => {
    const chord = inner.trim();
    if (!parseChordParts(chord)) return match;
    return '[' + transposeChord(chord, semitones, flat ? toKey : undefined) + ']';
  });

  // atualiza o cabecalho {key: X}
  const withKey = out.replace(/\{key:\s*([^}]+)\}/i, `{key: ${toKey}}`);
  return { content: withKey, semitones };
}

const result = entries.map((e) => {
  const target = e.targetKey && e.targetKey !== '??' ? e.targetKey : null;
  if (!target) return e;

  const from = e.fromKey || e.key;
  const { content, semitones } = transposeChordPro(e.chordProContent || '', from, target);
  const targetRoot = target.replace(/(m|m7|min)$/i, '');

  return {
    ...e,
    key: target,
    chordProContent: content,
    notes:
      (e.notes ? e.notes + ' ' : '') +
      `[Transposto de ${from} para ${target} (${semitones >= 0 ? '+' : ''}${semitones} semitons) para o tom da lista SSC II (${targetRoot}).]`,
    _fromKey: from,
    _semitones: semitones,
  };
});

fs.writeFileSync(output, JSON.stringify(result, null, 2), 'utf8');
console.log(
  `OK: ${result.length} entradas processadas -> ${result.filter((r) => r._semitones).length} transpostas`
);
for (const r of result) {
  if (r._semitones) console.log(`   ${r.title}: ${r._fromKey} -> ${r.key} (${r._semitones})`);
}
