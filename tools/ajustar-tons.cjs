const fs = require('fs');

/**
 * Ajusta o JSON de cifras:
 * - `key` passa a ser o tom REAL dos acordes publicados (para o transposer do
 *   app funcionar corretamente);
 * - o tom da lista SSC II vai para as `notes`.
 *
 * Regra: nunca transponho a cifra. A versão publicada é a que o músico
 * encontra na web; se o tom da banda for outro, a nota registra e o app
 * transpõe sob demanda.
 */
const ajustes = {
  // [key real dos acordes, tom da lista SSC II]
  'Tenha Fé': ['Gm', 'Fm'],
  'Gafieira': ['Gm', 'F'],
  'O Criador': ['F#', 'Am7'],
  'Devagar': ['G', 'Em7'],
  'Eclipse Total': ['Em', 'Dm'],
  'Tiro ao Álvaro': ['Bb', 'F7'],
  'Falso Poder': ['Fm', 'Fm'],
  'A Praça': ['C', 'C'],
  'A Flor e o Espinho': ['Dm', 'Dm'],
  'Trem das Onze': ['Am', 'Am'],
  'O Samba da Minha Terra': ['D', 'D'],
  'O Poder da Criação': ['Am', 'Am7'],
};

for (const file of ['chords-bloco1.json', 'chords-bloco3.json']) {
  const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const e of arr) {
    const a = ajustes[e.title];
    if (!a) continue;
    const [realKey, listaKey] = a;
    if (realKey !== listaKey) {
      e.notes =
        `Tom real da cifra publicada: ${realKey}. Lista SSC II indica ${listaKey} — ` +
        `use a transposição do app se a banda tocar em outro tom. ` +
        (e.notes || '');
    }
    e.key = realKey;
    delete e.fromKey;
    delete e.targetKey;
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
  console.log(file, '->', arr.length, 'entradas ajustadas');
}
