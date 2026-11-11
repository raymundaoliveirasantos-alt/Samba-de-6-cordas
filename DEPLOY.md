# Deploy (Vercel)

## Por que aparecia "Erro no servidor (404)"

O deploy publicava **só o front-end** (`dist/`). As rotas `/api/gemini/*` viviam
apenas dentro de `server.ts` (Express), que a Vercel não executa. Resultado: o
navegador chamava `/api/gemini/suggest-chords`, recebia a página HTML de 404 e o
`JSON.parse` falhava.

## O que foi mudado

```
server/apiRoutes.ts   todas as rotas /api/* (Gemini, Groq, OpenRouter e Supabase), compartilhadas
server/vercelApp.ts   app Express usado pelas funções serverless
api/gemini/*.ts       6 funções da Vercel (status, search, suggest-chords, parse-image, analyze-key, insights)
api/groq/*.ts         status + chat (proxy para Groq)
api/openrouter/*.ts   status + chat (proxy para OpenRouter)
api/supabase/*.ts
vercel.json           build do Vite + configuração das funções
server.ts             agora só monta as rotas e sobe o Vite/local
```

Cada arquivo em `api/` é uma função serverless que reaproveita as mesmas rotas —
não há lógica duplicada.

## Variáveis de ambiente na Vercel

Projeto → **Settings → Environment Variables**

| Variável | Obrigatória | Para quê |
|---|---|---|
| `GEMINI_API_KEY` | sim, para IA | busca inteligente, cifra na web, OCR de foto, insights |
| `GROQ_API_KEY` | opcional | IA alternativa (Groq) |
| `OPENROUTER_API_KEY` | opcional | IA alternativa (OpenRouter) |
| `SUPABASE_URL` | opcional | sincronização entre dispositivos |
| `SUPABASE_ANON_KEY` | opcional | sincronização entre dispositivos |

Sem a `GEMINI_API_KEY` a busca responde (JSON, 503) com a mensagem
"Chave Gemini API não configurada" — o app continua funcionando no modo manual
(biblioteca, transposição, importação de arquivo, palco, metrônomo).

A chave é gratuita em <https://aistudio.google.com/apikey>.

## Publicar

1. Suba os arquivos alterados no repositório do GitHub.
2. A Vercel reconstrói automaticamente (ou use **Deployments → Redeploy**).
3. Confira em `https://SEU-DOMINIO/api/gemini/status` — deve responder
   `{"available":true,...}`.

> Nota: o repositório usa `package-lock.json` (npm). Se aparecer um `bun.lock`
> novo, remova-o — o Vercel só usa o lockfile do npm para esse projeto.

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
