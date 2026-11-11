import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client if key is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check AI status
app.get('/api/gemini/status', (_req, res) => {
  res.json({
    available: !!ai,
    message: ai
      ? 'Gemini API ativa e pronta'
      : 'GEMINI_API_KEY não configurada no servidor. Funções manuais continuam ativas.',
  });
});

// Groq API Key configuration
const groqApiKey = process.env.GROQ_API_KEY || '';

app.get('/api/groq/status', (_req, res) => {
  res.json({
    available: !!groqApiKey,
    message: groqApiKey
      ? 'Groq API Key configurada com sucesso'
      : 'GROQ_API_KEY aguardando configuração nos secrets',
  });
});

// Groq proxy helper endpoint
app.post('/api/groq/chat', async (req, res) => {
  try {
    if (!groqApiKey) {
      return res.status(503).json({ error: 'GROQ_API_KEY não configurada no servidor.' });
    }
    const { messages, model = 'llama3-70b-8192' } = req.body;
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature: 0.3 }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// OpenRouter API Key configuration
const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';

app.get('/api/openrouter/status', (_req, res) => {
  res.json({
    available: !!openRouterApiKey,
    message: openRouterApiKey
      ? 'OpenRouter API Key configurada com sucesso'
      : 'OPENROUTER_API_KEY aguardando configuração nos secrets',
  });
});

// OpenRouter proxy helper endpoint
app.post('/api/openrouter/chat', async (req, res) => {
  try {
    if (!openRouterApiKey) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY não configurada no servidor.' });
    }
    const { messages, model = 'anthropic/claude-3.5-sonnet' } = req.body;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://cifraviva.app',
        'X-Title': 'CifraViva',
      },
      body: JSON.stringify({ model, messages, temperature: 0.3 }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Intelligent search across library
app.post('/api/gemini/search', async (req, res) => {
  try {
    const { query, songs } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Consulta obrigatória' });
    }
    if (!ai) {
      return res.status(503).json({
        error: 'Chave Gemini API não configurada. Use a busca local.',
        fallbackLocal: true,
      });
    }

    const songsIndex = (songs || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      tags: s.tags,
      notes: s.notes,
      lyricsSnippet: (s.chordProContent || '').slice(0, 300),
    }));

    const prompt = `Você é o buscador inteligente do aplicativo musical CifraViva.
O usuário está procurando por uma música no seu acervo pessoal com o termo: "${query}".
Aqui está a lista das músicas existentes no acervo do usuário (NUNCA invente músicas que não estão nesta lista):
${JSON.stringify(songsIndex, null, 2)}

Encontre as músicas mais relevantes baseadas no título, artista, trecho de letra, tema ou significado.
Se nenhuma música corresponder, retorne uma lista vazia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedSongIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'IDs das músicas do acervo que correspondem à busca',
            },
            explanation: {
              type: Type.STRING,
              description: 'Breve explicação em português do porquê foram selecionadas',
            },
          },
          required: ['matchedSongIds'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"matchedSongIds": []}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Erro na busca Gemini:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar busca com IA' });
  }
});

// Helper for calling Gemini with retry and exponential backoff
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const errMsg = err?.message || JSON.stringify(err);
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (isTransient && attempt < maxRetries) {
        const delay = attempt * 1200;
        console.warn(`Gemini API transient failure. Retrying attempt ${attempt}/${maxRetries} after ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Falha ao conectar com o serviço de busca');
}

// Clean and extract JSON from model response
function extractJsonFromModelText(text: string): any {
  if (!text) return {};
  // Check for ```json ... ``` blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const rawJson = jsonBlockMatch ? jsonBlockMatch[1] : text;
  try {
    return JSON.parse(rawJson);
  } catch {
    // Try finding first { and last }
    const firstBrace = rawJson.indexOf('{');
    const lastBrace = rawJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(rawJson.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('Não foi possível interpretar a resposta da cifra.');
  }
}

import { findInWebChordDatabase } from './src/utils/webChordsDatabase';

// Search chords on the web using Google Search Grounding + Curated Fallback
app.post('/api/gemini/suggest-chords', async (req, res) => {
  const { title, artist, query } = req.body;
  const targetTitle = (title || query || '').trim();
  const targetArtist = (artist || '').trim();

  if (!targetTitle) {
    return res.status(400).json({ error: 'Título ou nome da música é obrigatório' });
  }

  // 1. Check curated database first or as instant fallback
  const cachedMatch = findInWebChordDatabase(targetTitle, targetArtist);

  // If Gemini client is not initialized, return cached or template
  if (!ai) {
    if (cachedMatch) {
      return res.json({
        title: cachedMatch.title,
        artist: cachedMatch.artist,
        suggestedKey: cachedMatch.key,
        bpm: cachedMatch.bpm,
        timeSignature: cachedMatch.timeSignature,
        chordProContent: cachedMatch.chordProContent,
        confidence: 'alta',
        musicalNotes: cachedMatch.notes || 'Cifra oficial obtida do banco web de cifras.',
        sourceUrls: [{ title: 'Cifra Club / Web', uri: cachedMatch.sourceUrl }],
        searchedOnWeb: true,
      });
    }
    return res.status(503).json({
      error: 'Chave Gemini API não configurada no servidor. Use a importação de arquivo ou digite a cifra.',
    });
  }

  // 2. Try Gemini with Google Search Grounding
  try {
    const prompt = `Você é um músico, arranjador e pesquisador musical do CifraViva.
Sua missão é pesquisar na web e retornar a cifra real e completa com letra no formato ChordPro para:
Música: "${targetTitle}"
Artista/Compositor: "${targetArtist || 'Não informado (pesquise a versão mais conhecida)'}"

Instruções Importantes:
1. Use as ferramentas de busca na web para encontrar a cifra verdadeira, os acordes exatos e a letra completa (como disponível no Cifra Club, cifras.com.br, etc.).
2. Converta o resultado para a sintaxe padrão ChordPro, colocando os acordes entre colchetes exatamente sobre a sílaba correspondente, por exemplo:
"[G]Eu sei que a vida [D7]guarda sur[Em]presas..."
3. Inclua a estrutura padrão com comentários de seções:
{title: ${targetTitle}}
{artist: ${targetArtist || 'Artista'}}
{key: Tom Principal}
{tempo: BPM Estimado}
{comment: Intro: [Acordes]}
{soc}
{comment: Refrão}
...
{eoc}
4. Indique o tom principal identificado (suggestedKey), andamento (bpm), fórmula de compasso (timeSignature) e uma breve nota sobre o arranjo harmônico.
5. Responda ESTRITAMENTE em formato JSON dentro de um bloco \`\`\`json ... \`\`\` com os seguintes campos:
{
  "title": string,
  "artist": string,
  "suggestedKey": string,
  "bpm": number,
  "timeSignature": string,
  "chordProContent": string,
  "confidence": "alta" | "media",
  "musicalNotes": string
}`;

    const response = await callGeminiWithRetry(async () => {
      return await ai!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
    });

    const parsed = extractJsonFromModelText(response.text || '{}');

    // Extract web source URLs from grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls = chunks
      .map((c: any) => (c.web ? { title: c.web.title, uri: c.web.uri } : null))
      .filter(Boolean);

    return res.json({
      ...parsed,
      sourceUrls,
      searchedOnWeb: true,
    });
  } catch (error: any) {
    console.warn('Busca online via Gemini falhou ou sofreu rate-limit. Verificando fallback do acervo...', error?.message);

    // If Gemini failed (e.g. 429 quota limit), use curated database match if available
    if (cachedMatch) {
      return res.json({
        title: cachedMatch.title,
        artist: cachedMatch.artist,
        suggestedKey: cachedMatch.key,
        bpm: cachedMatch.bpm,
        timeSignature: cachedMatch.timeSignature,
        chordProContent: cachedMatch.chordProContent,
        confidence: 'alta',
        musicalNotes: `${cachedMatch.notes || ''} (Cifra autêntica recuperada do banco de dados de cifras da web)`,
        sourceUrls: [{ title: 'Cifra Club / Web', uri: cachedMatch.sourceUrl }],
        searchedOnWeb: true,
        fallbackUsed: true,
      });
    }

    // Generic structured template with direct web search link
    const searchUrl = `https://www.google.com/search?q=cifra+${encodeURIComponent(targetTitle + ' ' + targetArtist)}`;
    const cifraClubUrl = `https://www.cifraclub.com.br/?q=${encodeURIComponent(targetTitle + ' ' + targetArtist)}`;

    return res.status(503).json({
      error: `A API de busca de IA atingiu temporariamente o limite de requisições (Quota/Rate Limit). Você pode abrir a cifra no Cifra Club e colá-la aqui diretamente.`,
      cifraClubUrl,
      searchUrl,
    });
  }
});

// Scan chord chart from image (OCR Vision -> ChordPro)
app.post('/api/gemini/parse-image', async (req, res) => {
  try {
    const { base64Image, mimeType = 'image/jpeg' } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'Imagem base64 é obrigatória' });
    }
    if (!ai) {
      return res.status(503).json({
        error: 'Chave Gemini API não configurada para leitura visual OCR.',
      });
    }

    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          },
        },
        {
          text: `Você é o leitor de cifras OCR do CifraViva.
Analise esta folha/foto de cifra ou partitura de música.
Extraia com alta fidelidade:
1. Título da música
2. Artista ou compositor (se visível)
3. Tom / Tonalidade (Key)
4. Capotraste (se indicado)
5. Andamento (BPM) ou estilo de ritmo
6. O texto completo convertido no formato ChordPro com acordes entre colchetes [Acorde] exatamente sobre a sílaba cantada.
7. Se houver tablaturas de introdução ou solo, preserve-as dentro de linhas de comentário {comment: Tablatura ...}.
8. Dê uma nota de confiança (alta, media ou baixa) e aponte trechos com letras duvidosas se houver borrões.
Retorne no JSON schema especificado.`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            key: { type: Type.STRING },
            capo: { type: Type.INTEGER },
            bpm: { type: Type.INTEGER },
            chordProContent: { type: Type.STRING },
            confidence: { type: Type.STRING },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Avisos sobre partes borradas ou ambíguas',
            },
          },
          required: ['title', 'chordProContent'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Erro no OCR Gemini:', error);
    res.status(500).json({ error: error.message || 'Falha ao analisar imagem da cifra' });
  }
});

// Key & harmony detection
app.post('/api/gemini/analyze-key', async (req, res) => {
  try {
    const { chords, title } = req.body;
    if (!chords || !chords.length) {
      return res.status(400).json({ error: 'Lista de acordes necessária' });
    }
    if (!ai) {
      // Local fallback heuristic
      const first = chords[0];
      return res.json({
        detectedKey: first,
        mode: first.endsWith('m') ? 'minor' : 'major',
        confidence: 'media',
        suggestedCapo: 0,
        explanation: 'Tom detectado pela tônica inicial (análise local).',
      });
    }

    const prompt = `Analise a seguinte progressão de acordes da música "${title || 'Música'}":
Acordes identificados: ${chords.join(' - ')}

Determine:
1. Tom principal (Key) da música
2. Modo (maior ou menor)
3. Grau de confiança (alta, media, baixa)
4. Sugestão de capotraste para facilitar digitação no violão (se aplicável, 0 se desnecessário)
5. Explicação teórica suscinta em português (ex: cadência II-V-I, resolução da tônica).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedKey: { type: Type.STRING },
            mode: { type: Type.STRING, enum: ['major', 'minor'] },
            confidence: { type: Type.STRING, enum: ['alta', 'media', 'baixa'] },
            suggestedCapo: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ['detectedKey', 'mode', 'confidence', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Erro na análise de tom Gemini:', error);
    res.status(500).json({ error: error.message || 'Erro ao analisar tonalidade' });
  }
});

// Pro Stage Repertoire Insights
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { setlistName, items } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Itens do setlist necessários' });
    }
    if (!ai) {
      return res.status(503).json({
        error: 'Chave Gemini API necessária para gerar Insights Pro do Repertório.',
      });
    }

    const summary = items.map((it: any, idx: number) => ({
      pos: idx + 1,
      title: it.title,
      artist: it.artist,
      key: it.selectedKey || it.originalKey || 'A definir',
      bpm: it.bpm || 100,
      notes: it.notes || '',
    }));

    const prompt = `Você é o diretor musical e consultor de palco do CifraViva (Plano Pro Stage).
Analise este repertório/setlist:
Nome: "${setlistName || 'Repertório'}"
Músicas:
${JSON.stringify(summary, null, 2)}

Forneça uma análise aprofundada:
1. Duração estimada total (em minutos).
2. Avaliação do equilíbrio de tons (ex: muitas músicas seguidas no mesmo tom, modulações bruscas).
3. Alerta de tessitura vocal para congregação ou público (tons muito altos/baixos).
4. Sugestões práticas de transição harmônica (como passar de uma música para a seguinte).
5. 3 recomendações de melhoria para dinâmica de culto ou show (aquecimento, clímax, reflexão).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedDurationMinutes: { type: Type.INTEGER },
            keyBalanceScore: { type: Type.INTEGER, description: 'Nota de 1 a 10' },
            keyBalanceAnalysis: { type: Type.STRING },
            vocalRangeAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            transitionTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'estimatedDurationMinutes',
            'keyBalanceScore',
            'keyBalanceAnalysis',
            'transitionTips',
            'recommendations',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Erro nos insights Pro Gemini:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar insights do repertório' });
  }
});

// -----------------------------------------------------------------------------
// SUPABASE INTEGRATION ENDPOINTS (Configured via secrets in environment)
// -----------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

let supabaseClient: any = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.warn('Erro ao inicializar cliente Supabase no servidor:', e);
  }
}

// Check Supabase connection status
app.get('/api/supabase/status', (_req, res) => {
  res.json({
    configured: !!(supabaseUrl && supabaseKey),
    url: supabaseUrl ? supabaseUrl.replace(/https?:\/\//, '').split('.')[0] + '.supabase.co' : null,
    message: supabaseClient
      ? 'Supabase conectado com sucesso via secrets'
      : 'Credenciais SUPABASE_URL e SUPABASE_ANON_KEY aguardando injeção nos secrets',
  });
});

// Sync / Upsert songs from client to Supabase
app.post('/api/supabase/sync', async (req, res) => {
  try {
    if (!supabaseClient) {
      return res.status(400).json({
        error: 'Supabase não está configurado. Verifique as chaves SUPABASE_URL e SUPABASE_ANON_KEY nos secrets.',
        configured: false,
      });
    }

    const { songs } = req.body;
    if (!Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ error: 'Nenhuma música enviada para sincronização.' });
    }

    // Format songs for Supabase table
    const records = songs.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist || '',
      original_key: s.originalKey || 'G',
      current_key: s.currentKey || 'G',
      bpm: s.bpm || 100,
      time_signature: s.timeSignature || '4/4',
      chordpro_content: s.chordProContent || '',
      tags: s.tags || [],
      status: s.status || 'pronto',
      type: s.type || 'repertorio',
      workspace_id: s.workspaceId || 'ws-ss-clarinetes',
      updated_at: new Date().toISOString(),
    }));

    // Upsert into 'songs' table
    const { data, error } = await supabaseClient
      .from('songs')
      .upsert(records, { onConflict: 'id' });

    if (error) {
      console.warn('Erro ao fazer upsert no Supabase:', error);
      return res.status(500).json({
        error: `Erro no Supabase: ${error.message}. Verifique se a tabela 'songs' existe no Supabase.`,
      });
    }

    res.json({
      success: true,
      syncedCount: records.length,
      message: `${records.length} músicas sincronizadas com sucesso no Supabase!`,
    });
  } catch (err: any) {
    console.error('Erro geral ao sincronizar com Supabase:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar com Supabase' });
  }
});

// Pull songs from Supabase to client
app.get('/api/supabase/songs', async (_req, res) => {
  try {
    if (!supabaseClient) {
      return res.status(400).json({
        error: 'Supabase não configurado nos secrets.',
        configured: false,
      });
    }

    const { data, error } = await supabaseClient
      .from('songs')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Convert snake_case from DB back to camelCase Song object
    const songs = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      originalKey: row.original_key || 'G',
      currentKey: row.current_key || 'G',
      bpm: row.bpm || 100,
      timeSignature: row.time_signature || '4/4',
      chordProContent: row.chordpro_content || '',
      tags: row.tags || [],
      status: row.status || 'pronto',
      type: row.type || 'repertorio',
      origin: 'sugestao_ia',
      workspaceId: row.workspace_id || 'ws-ss-clarinetes',
      updatedAt: row.updated_at || new Date().toISOString(),
    }));

    res.json({ songs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CifraViva server running on port ${PORT}`);
  });
}

startServer();
