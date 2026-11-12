# Deploy (Vercel)

## Por que o deploy falhava

```
Error: No more than 12 Serverless Functions can be added to a Deployment on the
Hobby plan. Create a team (Pro plan) to deploy more.
```

A Vercel cria **uma Vercel Function por arquivo** dentro de `api/`. O projeto
tinha **13 arquivos** em `api/` (um para cada rota), ou seja, 13 funções — 1 a
mais do que o limite de 12 do plano Hobby. O build nem começava: a validação
acontece antes da instalação das dependências.

## O que foi mudado

```
api/gemini/[action].ts        1 função -> /api/gemini/status, /search,
                                     /suggest-chords, /parse-image,
                                     /analyze-key, /insights
api/groq/[action].ts          1 função -> /api/groq/status, /chat
api/openrouter/[action].ts    1 função -> /api/openrouter/status, /chat
api/supabase/[action].ts      1 função -> /api/supabase/status, /songs, /sync
server/apiRoutes.ts           todas as rotas /api/* (Gemini, Groq, OpenRouter
                              e Supabase), compartilhadas
server/vercelApp.ts           app Express usado pelas funções serverless
vercel.json                   build do Vite + rewrite do SPA + config das funções
server.ts                     monta as rotas e sobe o Vite/local
```

**13 funções -> 4 funções.** O truque é o segmento dinâmico `[action]`: a
Vercel mapeia `api/gemini/[action].ts` para todas as rotas de um segmento
(`/api/gemini/<qualquer-coisa>`), e o Express continua fazendo o casamento
final das rotas em `server/apiRoutes.ts`. Nenhuma lógica foi duplicada.

> O catch-all `api/[[...path]].ts` **não** funciona na pasta `api/` do
> filesystem da Vercel (ele responde 404). Segmento dinâmico simples
> (`[action]`) funciona.

## Bonus: fallback do SPA

O app abre `/projection` em uma janela separada. Sem rewrite, essa URL
retornaria 404 na Vercel. O `vercel.json` agora tem:

```json
"rewrites": [
  { "source": "/:path((?!api(?:/|$)).*)", "destination": "/index.html" }
]
```

O `api(?:/|$)` deixa `/api` e `/api/...` passarem direto para as funções.

## Variáveis de ambiente na Vercel

Projeto → **Settings → Environment Variables**

| Variável | Obrigatória | Para quê |
|---|---|---|
| `GEMINI_API_KEY` | sim, para IA | busca inteligente, cifra na web, OCR de foto, insights |
| `GROQ_API_KEY` | opcional (servidor) | IA alternativa (Groq) |
| `OPENROUTER_API_KEY` | opcional (servidor) | IA alternativa (OpenRouter) |
| `VITE_GROQ_API_KEY` | opcional (cliente) | contorno quando o servidor /api falha |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | opcional | sincronização entre dispositivos |
| `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | opcional | sincronização entre dispositivos |

Sem a `GEMINI_API_KEY` a busca responde (JSON, 503) com a mensagem
"Chave Gemini API não configurada" — o app continua funcionando no modo manual
(biblioteca, transposição, importação de arquivo, palco, metrônomo).

A chave é gratuita em <https://aistudio.google.com/apikey>.

> As variáveis `VITE_*` precisam ser marcadas para **Production** e **Preview**
> e exigem um **Redeploy** — elas são embutidas no bundle no momento do build.

## Publicar

1. Suba os arquivos alterados no repositório do GitHub.
2. A Vercel reconstrói automaticamente (ou use **Deployments → Redeploy**).
3. Confira em `https://SEU-DOMINIO/api/gemini/status` — deve responder
   `{"available":true,...}`.

> Nota: o repositório usa `package-lock.json` (npm). Se aparecer um `bun.lock`
> novo, remova-o — a Vercel só usa o lockfile do npm para esse projeto.

## Contorno: IA direto no navegador (Groq)

Se as funções serverless da Vercel não estiverem disponíveis, o app pode chamar
o Groq diretamente do navegador. Para ativar:

1. Crie uma conta gratuita em https://console.groq.com/keys e gere uma chave.
2. Na Vercel: **Settings → Environment Variables →** `VITE_GROQ_API_KEY` = `gsk_...`
   (marque Production/Preview/Development) e faça Redeploy.

A chave fica exposta no bundle, então restrinja-a por domínio (HTTP referrer) no
painel do Groq. O app tenta o servidor primeiro e, se falhar (404/500), usa o
Groq automaticamente.

## Rodar localmente

Duplo clique em `iniciar-app.ps1` (na pasta acima) ou:

```powershell
.\run-dev.cmd
# http://localhost:3000
```

Para testar a IA localmente, crie `Samba-de-6-cordas\.env`:

```
GEMINI_API_KEY="sua-chave"
```

Para testar exatamente como a Vercel (inclusive as funções `api/`):

```powershell
npx vercel dev
```

## Limite de funções (plano Hobby)

Máximo de **12 Vercel Functions por deploy** no Hobby. Cada arquivo em `api/`
vira uma função. Ao adicionar um novo grupo de rotas, use o padrão
`api/<grupo>/[action].ts` — nunca um arquivo por rota.
