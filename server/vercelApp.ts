import express from 'express';
import dotenv from 'dotenv';
import { registerApiRoutes } from './apiRoutes.js';

dotenv.config();

/**
 * App Express usado pelas funções serverless da Vercel (a pasta `api/`).
 *
 * O `req.url` chega com o caminho completo (/api/gemini/search etc.),
 * por isso as mesmas rotas do servidor local são reaproveitadas.
 */
const app = express();

/**
 * Normaliza o prefixo `/api`.
 *
 * Dependendo de como a função é roteada pela Vercel (segmento dinâmico,
 * catch-all ou rewrite), o caminho pode chegar com ou sem o prefixo.
 * Como todas as rotas de `server/apiRoutes.ts` começam com `/api`,
 * garantimos o prefixo aqui para o app funcionar em qualquer formato.
 */
app.use((req, _res, next) => {
  if (!req.url.startsWith('/api')) {
    const queryIndex = req.url.indexOf('?');
    const pathname = queryIndex >= 0 ? req.url.slice(0, queryIndex) : req.url;
    const search = queryIndex >= 0 ? req.url.slice(queryIndex) : '';
    req.url = `/api${pathname}${search}`;
  }
  next();
});

/**
 * Índice das rotas — útil para conferir se a função subiu no deploy.
 */
app.get('/api', (_req, res) => {
  res.json({
    name: 'CifraViva API',
    routes: [
      'GET  /api/gemini/status',
      'POST /api/gemini/search',
      'POST /api/gemini/suggest-chords',
      'POST /api/gemini/parse-image',
      'POST /api/gemini/analyze-key',
      'POST /api/gemini/insights',
      'GET  /api/groq/status',
      'POST /api/groq/chat',
      'GET  /api/openrouter/status',
      'POST /api/openrouter/chat',
      'GET  /api/supabase/status',
      'GET  /api/supabase/songs',
      'POST /api/supabase/sync',
    ],
  });
});

registerApiRoutes(app);

export default app;
