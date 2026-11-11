/**
 * Cliente Groq (chamada direta do navegador).
 *
 * Usado como CONTORNO quando as funções serverless da Vercel (/api) não estão
 * disponíveis. A chave fica exposta no bundle, então restrinja-a por domínio
 * (HTTP referrer) no painel do Groq.
 *
 * Para ativar: defina VITE_GROQ_API_KEY no .env (local) ou nas Environment
 * Variables da Vercel.
 */
const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export function isGroqAvailable(): boolean {
  return !!GROQ_API_KEY;
}

export interface GroqChordResult {
  title: string;
  artist: string;
  suggestedKey: string;
  bpm: number;
  chordProContent: string;
  musicalNotes?: string;
}

export async function searchChordsWithGroq(
  title: string,
  artist: string
): Promise<GroqChordResult> {
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY não configurada no cliente.');
  }

  const prompt = `Você é um especialista em cifras de música brasileira (samba, choro, MPB, louvor).
Gere a cifra no formato ChordPro para a música "${title}" de "${artist || 'desconhecido'}".

Responda APENAS com um JSON válido (sem markdown, sem texto extra) no formato:
{
  "title": "...",
  "artist": "...",
  "suggestedKey": "G",
  "bpm": 100,
  "chordProContent": "{title: ...}\\n{artist: ...}\\n\\n[G]letra [C]aqui",
  "musicalNotes": "breve nota musical"
}

Use acordes reais e conhecidos da música. Se não souber a música exata, crie uma cifra
plausível no estilo. O chordProContent deve ter acordes entre colchetes sobre as sílabas.`;

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    // tenta extrair JSON do texto
    const m = content.match(/\{[\s\S]*\}/);
    if (m) parsed = JSON.parse(m[0]);
    else throw new Error('Resposta do Groq não é JSON válido.');
  }

  return {
    title: parsed.title || title,
    artist: parsed.artist || artist,
    suggestedKey: parsed.suggestedKey || 'G',
    bpm: parsed.bpm || 100,
    chordProContent: parsed.chordProContent || '',
    musicalNotes: parsed.musicalNotes,
  };
}
