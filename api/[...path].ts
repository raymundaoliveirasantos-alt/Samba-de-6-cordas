import app from '../server/vercelApp';

// Funcao serverless catch-all da Vercel: todas as requisicoes /api/* caem
// aqui e o Express (server/apiRoutes.ts) faz o roteamento interno.
export default app;
