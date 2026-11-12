/**
 * Configuração de runtime do CifraViva.
 *
 * As variáveis `VITE_*` do Vite são embutidas no bundle do navegador — por
 * isso elas são públicas por natureza (é o mesmo mecanismo do `VITE_GROQ_API_KEY`
 * que o app já usava). Cada valor abaixo pode vir de duas formas:
 *
 *  1. **Variável de ambiente da Vercel** (recomendado):
 *     `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY`, `VITE_GROQ_API_KEY`.
 *  2. **Fallback neste arquivo** (útil para desenvolvimento local).
 *
 * Se a variável de ambiente existir, ela tem precedência.
 */

/** URL do projeto Supabase do CifraViva. */
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://gkjsczfeidefkcunwopq.supabase.co';

/**
 * Chave anon/public do Supabase.
 *
 * Onde pegar: Supabase → Project Settings → API → "anon" / "public".
 * Vazia = sincronização entre dispositivos desativada.
 */
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'COLE_A_CHAVE_ANON_DO_SUPABASE_AQUI';

/**
 * Chave da Groq (fallback de IA direto no navegador).
 *
 * Onde pegar: https://console.groq.com/keys
 * Vazia = a busca de cifras na web depende do servidor (/api).
 */
export const GROQ_API_KEY =
  import.meta.env.VITE_GROQ_API_KEY || 'COLE_A_CHAVE_DA_GROQ_AQUI';

const PLACEHOLDER = 'COLE_A_CHAVE_';

/** O cliente do Supabase está configurado de verdade? */
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.startsWith(PLACEHOLDER)
);

/** O fallback da Groq no navegador está disponível? */
export const isGroqAvailable = Boolean(
  GROQ_API_KEY && !GROQ_API_KEY.startsWith(PLACEHOLDER)
);
