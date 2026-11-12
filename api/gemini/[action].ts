import app from '../../server/vercelApp.js';

/**
 * Funções serverless da Vercel para /api/gemini/*.
 *
 * O Vercel cria UMA Vercel Function por arquivo dentro de `api/`, e o plano
 * Hobby aceita no máximo 12 funções por deploy. Em vez de um arquivo por
 * rota (o que daria 13 funções e quebraria o deploy), usamos um único
 * segmento dinâmico `[action]` por grupo de rotas:
 *
 *   api/gemini/[action].ts  ->  /api/gemini/status, /api/gemini/search, ...
 *
 * Todas as rotas continuam registradas em `server/apiRoutes.ts`, sem
 * duplicar nenhuma lógica.
 */
export default app;
