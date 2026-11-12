/**
 * Envia o repertório SSC II (com as cifras) para o Supabase através da rota
 * oficial do app (/api/supabase/sync) e depois lê de volta para conferir.
 *
 *   node push-repertorio.mts
 */
import { initialSongs } from './src/db/seed.js';

const BASE = process.argv[2] || 'https://sambade6.vercel.app';

async function json(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Resposta nao-JSON de ${url}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} em ${url}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

console.log(`Alvo: ${BASE}`);
console.log(`Enviando ${initialSongs.length} musicas do repertorio SSC II...`);

const sync = await json(`${BASE}/api/supabase/sync`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ songs: initialSongs }),
});
console.log('sync ->', JSON.stringify(sync));

console.log('\nLendo de volta do Supabase...');
const { songs } = await json(`${BASE}/api/supabase/songs`);
const byId = new Map(songs.map((s: any) => [s.id, s]));

let ok = 0;
let comCifra = 0;
let divergentes: string[] = [];

for (const seed of initialSongs) {
  const row: any = byId.get(seed.id);
  if (!row) {
    divergentes.push(`${seed.id}: AUSENTE no Supabase`);
    continue;
  }
  const iguais =
    row.title === seed.title &&
    (row.artist || '') === (seed.artist || '') &&
    row.originalKey === seed.originalKey &&
    row.status === seed.status &&
    (row.chordProContent || '') === (seed.chordProContent || '');
  if (iguais) ok++;
  else
    divergentes.push(
      `${seed.id}: divergente (${row.title} | ${row.status} | chords=${(row.chordProContent || '').length} vs ${seed.chordProContent.length})`
    );
  if ((row.chordProContent || '').length > 0) comCifra++;
}

console.log(`\nTotal no Supabase      : ${songs.length}`);
console.log(`Conferidas OK          : ${ok}/${initialSongs.length}`);
console.log(`Com cifra no Supabase  : ${comCifra}`);
console.log(`Divergencias           : ${divergentes.length}`);
divergentes.slice(0, 10).forEach((d) => console.log('   - ' + d));

console.log('\n--- blocos no Supabase (conferindo cifras por bloco) ---');
for (const b of ['I', 'II', 'III']) {
  const ids = initialSongs.filter((s) => s.block === b).map((s) => s.id);
  const withChords = ids.filter((id) => (byId.get(id) as any)?.chordProContent?.length > 0);
  console.log(`BLOCO ${b}: ${withChords.length}/${ids.length} com cifra`);
}

console.log('\n--- amostra lida de volta do Supabase ---');
for (const id of ['ssc-song-3', 'ssc-song-11', 'ssc-song-39']) {
  const row: any = byId.get(id);
  if (!row) continue;
  console.log(
    `${id} | ${row.title} | ${row.artist} | key=${row.originalKey} | status=${row.status} | chords=${(row.chordProContent || '').length}ch | tags=${JSON.stringify(row.tags)} | block=${row.block ?? '-'} | instr=${row.instrument ?? '-'} | ordem=${row.orderInBlock ?? '-'}`
  );
}
