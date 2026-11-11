import express from 'express';
import dotenv from 'dotenv';
import { registerApiRoutes } from './apiRoutes';

dotenv.config();

/**
 * App Express usado pelas funções serverless da Vercel (pasta `api/`).
 * O `req.url` chega com o caminho completo (/api/gemini/search etc.),
 * por isso as mesmas rotas do servidor local são reaproveitadas.
 */
const app = express();
registerApiRoutes(app);

export default app;
