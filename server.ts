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

// Suggest chords & structure for non-autoral songs (or hymns / public domain)
app.post('/api/gemini/suggest-chords', async (req, res) => {
  try {
    const { title, artist, isAutoral } = req.body;
    if (isAutoral) {
      return res.status(400).json({
        error: 'Músicas autorais não são buscadas na internet nem geradas por IA por regra do aplicativo.',
      });
    }
    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }
    if (!ai) {
      return res.status(503).json({
        error: 'Chave Gemini API não configurada. Você pode digitar ou colar a cifra manualmente.',
      });
    }

    const prompt = `Você é um músico e arranjador especialista no app CifraViva.
Gere a estrutura de acordes e letra no formato padrão ChordPro para a canção:
Título: "${title}"
Artista/Referência: "${artist || 'Tradicional'}"

Regras Críticas:
1. Respeite os direitos autorais: se a música for moderna protegida por copyright, use uma versão reduzida/didática com progressão harmônica funcional, ou indique que é uma cifra simplificada de referência harmônica. Se for hino ou domínio público, forneça completo.
2. Use a sintaxe padrão ChordPro com acordes entre colchetes exatamente sobre a sílaba correspondente, ex: "[G]Santo, [D]Santo, [Em]Santo, [C]Deus Onipo[D]tente".
3. Use seções como {title: ...}, {artist: ...}, {key: ...}, {tempo: ...}, {comment: Intro}, {soc} (início de refrão), {eoc} (fim de refrão), [Verso 1], etc.
4. Identifique o tom principal (ex: G, D, Am, etc.), BPM estimado e fórmula de compasso.
5. Retorne os dados estritamente no formato JSON solicitado.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            suggestedKey: { type: Type.STRING },
            bpm: { type: Type.INTEGER },
            timeSignature: { type: Type.STRING },
            chordProContent: { type: Type.STRING },
            confidence: { type: Type.STRING, description: 'alta, média ou baixa' },
            musicalNotes: { type: Type.STRING, description: 'Observações de harmonia e compasso' },
          },
          required: ['title', 'suggestedKey', 'chordProContent'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Erro na sugestão de cifras Gemini:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar sugestão de cifra' });
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
