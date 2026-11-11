/**
 * Cliente HTTP para as rotas /api do CifraViva.
 *
 * Em produção (Vercel) o backend pode não estar publicado: nesse caso o
 * servidor devolve HTML (404). Sem esse tratamento, o `res.json()` estoura
 * com "Unexpected token '<'" e o usuário não entende o problema.
 */
export async function postJson<T = any>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Não foi possível falar com o servidor. Verifique a conexão e tente novamente.'
    );
  }

  const raw = await res.text();

  try {
    return JSON.parse(raw) as T;
  } catch {
    if (res.status === 404) {
      throw new Error(
        `Servidor de IA não encontrado em ${path} (404). ` +
          'Na Vercel, publique as funções da pasta "api/" e configure a variável GEMINI_API_KEY.'
      );
    }
    throw new Error(
      `O servidor respondeu ${res.status} sem JSON válido. ` +
        'Verifique os logs do backend e a variável GEMINI_API_KEY.'
    );
  }
}
