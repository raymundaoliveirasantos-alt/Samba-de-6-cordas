import fs from 'node:fs';

const url = process.argv[2];
const html = await (await fetch(url)).text();
const asset = html.match(/src="\/([^"]+\.js)"/)?.[1];
if (!asset) {
  console.log('sem bundle');
  process.exit(1);
}
const js = await (await fetch(new URL(asset, url))).text();
console.log('bundle:', asset, '| tamanho:', js.length);

const achados = {};

// chave do Groq
const groq = js.match(/gsk_[A-Za-z0-9_-]{20,}/);
achados.VITE_GROQ_API_KEY = groq ? groq[0] : null;

// URL do Supabase
const supUrl = js.match(/https:\/\/[a-z0-9]{20}\.supabase\.co/);
achados.VITE_SUPABASE_URL = supUrl ? supUrl[0] : null;

// anon key do Supabase (JWT)
const jwt = js.match(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/);
achados.VITE_SUPABASE_ANON_KEY = jwt ? jwt[0] : null;

for (const [k, v] of Object.entries(achados)) {
  console.log(`${k}: ${v ? v.slice(0, 28) + '...' : 'NAO ENCONTRADO'}`);
}

fs.writeFileSync('env-recuperadas.json', JSON.stringify(achados, null, 2));
console.log('\n--> env-recuperadas.json');
