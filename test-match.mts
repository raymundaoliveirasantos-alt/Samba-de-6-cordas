import { findInWebChordDatabase } from './src/utils/webChordsDatabase.js';

const casos: Array<[string, string]> = [
  ['Esperanças Perdidas', 'Os Originais do Samba'],
  ['Esperancas Perdidas', 'Os Originais do Samba'],
  ['Esperanças Perdidas', ''],
  ['Alvorada', 'Cartola'],
  ['Trem das Onze', 'Adoniran Barbosa'],
  ['Le Bolívia', 'Toinho Melodia'],
];

for (const [t, a] of casos) {
  const r = findInWebChordDatabase(t, a);
  console.log(
    `${t.padEnd(24)} | ${a.padEnd(24)} -> ${r ? 'MATCH: ' + r.title + ' / ' + r.artist : 'null'}`
  );
}

// diagnostico de encoding dos titulos do banco
import { WEB_CHORDS_DATABASE } from './src/utils/webChordsDatabase.js';
const e = WEB_CHORDS_DATABASE[0];
console.log('\nprimeira entrada:');
console.log('  title :', JSON.stringify(e.title), '=>', [...e.title].map((c) => c.codePointAt(0)!.toString(16)).join(' '));
console.log('  artist:', JSON.stringify(e.artist));
console.log('\nconsulta:');
console.log('  title :', JSON.stringify('Esperanças Perdidas'), '=>', [...'Esperanças Perdidas'].map((c) => c.codePointAt(0)!.toString(16)).join(' '));
