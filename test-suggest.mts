const base = process.argv[2] || 'https://sambade6.vercel.app';

async function suggest(title: string, artist: string) {
  const res = await fetch(`${base}/api/gemini/suggest-chords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ title, artist }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

const casos: Array<[string, string]> = [
  ['Esperanças Perdidas', 'Os Originais do Samba'],
  ['Alvorada', 'Cartola'],
  ['Trem das Onze', 'Adoniran Barbosa'],
  ['Faixa Amarela', 'Zeca Pagodinho'],
  ['A Flor e o Espinho', 'Nelson Cavaquinho'],
  ['O Samba da Minha Terra', 'Novos Baianos'],
];

for (const [t, a] of casos) {
  const { status, data } = await suggest(t, a);
  const info =
    status === 200
      ? `OK key=${data.suggestedKey} bpm=${data.bpm} chords=${data.chordProContent.length}ch`
      : `ERRO ${JSON.stringify(data).slice(0, 90)}`;
  console.log(`${t.padEnd(26)} | ${a.padEnd(24)} -> ${status} ${info}`);
}
