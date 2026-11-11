import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { isChord, isChordLine, mergeChordAndLyricLines, parseChordPro } from './chordPro';
import type { Song, SongType, SongStatus } from '../types';

// Configure PDF.js worker to standard cdnjs worker if available or fallback inline
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface ParsedImportedSong {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  capo: number;
  instrument?: string;
  type: SongType;
  status: SongStatus;
  notes?: string;
  block?: 'I' | 'II' | 'III';
  orderInBlock?: number;
  chordProContent: string;
  rawText: string;
  confidence: 'alta' | 'media' | 'baixa';
  warnings: string[];
  isDuplicateOfId?: string;
  action: 'create' | 'replace' | 'ignore';
}

export interface ImportResult {
  fileName: string;
  fileType: string;
  isScannedPdf?: boolean;
  isSongListMode: boolean; // Section 5.8: whether file is a setlist list of titles
  songs: ParsedImportedSong[];
  logs: string[];
}

/**
 * Extracts raw text from File (.docx, .pdf, .txt, .chordpro, .cho)
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; isScanned: boolean }> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'doc') {
    throw new Error('Arquivos .doc antigos não são suportados diretamente. Por favor, salve o arquivo como .docx ou .pdf no Word e envie novamente.');
  }

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    // Word devolve um paragrafo vazio entre cada linha real; sem isso o
    // acorde nunca fica adjacente a letra e a fusao falha.
    const text = result.value
      .replace(/\r\n?/g, '\n')
      .replace(/\u00a0/g, ' ')
      .replace(/\n{2,}/g, '\n');
    return { text, isScanned: false };
  }

  if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = (textContent.items as any[]).filter((it) => it.str && it.str.trim() !== '');

        if (!items.length) {
          fullText += '\n';
          continue;
        }

        // Largura media de caractere: usa o item mais longo como referencia,
        // porque ele tem menos erro relativo de arredondamento.
        const measured = items
          .filter((it) => it.str.trim().length > 1 && it.width > 0)
          .map((it) => it.width / it.str.length)
          .sort((a, b) => a - b);
        const longest = items
          .filter((it) => it.str.trim().length > 2 && it.width > 0)
          .sort((a, b) => b.str.length - a.str.length)[0];
        const charWidth = longest
          ? longest.width / longest.str.length
          : measured.length
            ? measured[Math.floor(measured.length / 2)]
            : 5.4;

        // Agrupa por linha (Y) e reconstroi a coluna X de cada item
        const rows = new Map<number, { x: number; s: string }[]>();
        for (const item of items) {
          const y = Math.round(item.transform[5] / 2) * 2;
          if (!rows.has(y)) rows.set(y, []);
          rows.get(y)!.push({ x: item.transform[4], s: item.str });
        }

        const ys = [...rows.keys()].sort((a, b) => b - a);
        for (const y of ys) {
          const row = rows.get(y)!.sort((a, b) => a.x - b.x);
          const x0 = row[0].x;
          let line = '';
          for (const it of row) {
            const col = Math.max(0, Math.round((it.x - x0) / charWidth));
            if (line.length < col) {
              line += ' '.repeat(col - line.length);
            } else if (line.length > col) {
              line += ' ';
            }
            line += it.s;
          }
          fullText += line.replace(/\s+$/, '') + '\n';
        }
        fullText += '\n';
      }

      // Check if text is extremely short relative to pages (likely scanned PDF)
      const cleanLen = fullText.replace(/\s+/g, '').length;
      const isScanned = cleanLen < 40 * pdf.numPages;
      return { text: fullText.trim(), isScanned };
    } catch (e: any) {
      console.warn('PDF extraction fallback error:', e);
      return { text: '', isScanned: true };
    }
  }

  // Plain text / chordpro formats
  const text = await file.text();
  return { text, isScanned: false };
}

/**
 * Checks if raw text is a repertoire list of song titles (Section 5.8)
 */
export function isRepertoireList(text: string): boolean {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 5) return false;

  let numberedOrBulletLines = 0;
  for (const line of lines) {
    if (/^(\d+[\.\-\)]\s*|[•\-*]\s*)/.test(line) || line.toLowerCase().includes('bloco')) {
      numberedOrBulletLines++;
    }
  }

  return numberedOrBulletLines / lines.length > 0.4 || lines.some((l) => l.toLowerCase().includes('repertório') || l.toLowerCase().includes('bloco i'));
}

/**
 * Parses a repertoire list of song titles into skeleton entries (Section 5.8)
 */
export function parseRepertoireList(text: string): ParsedImportedSong[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results: ParsedImportedSong[] = [];

  let currentBlock: 'I' | 'II' | 'III' | undefined;
  let counter = 1;

  for (const line of lines) {
    // Check block header
    if (line.match(/^bloco\s+i\b/i)) {
      currentBlock = 'I';
      continue;
    }
    if (line.match(/^bloco\s+ii\b/i)) {
      currentBlock = 'II';
      continue;
    }
    if (line.match(/^bloco\s+iii\b/i)) {
      currentBlock = 'III';
      continue;
    }

    // Skip generic table headers
    if (line.toLowerCase().startsWith('número') || line.toLowerCase().startsWith('música') || line.toLowerCase().startsWith('#')) {
      continue;
    }

    // Clean numbered prefix: "1. Song Name" or "1 - Song Name"
    let cleanLine = line.replace(/^\d+[\.\-\)]\s*/, '').trim();
    if (!cleanLine) continue;

    // Extract instrument in parentheses: e.g. "(Saxofone)" or "(Flauta)"
    let instrument: string | undefined;
    const instrumentMatch = cleanLine.match(/\((Saxofone|Flauta|Trompete|Trombone|Violão|Teclado|Baixo|Bateria|Clarinete)\)/i);
    if (instrumentMatch) {
      instrument = instrumentMatch[1];
      cleanLine = cleanLine.replace(instrumentMatch[0], '').trim();
    }

    // Extract detected key: e.g. "Tom: Em7", "Em7", "C#m", "??"
    let detectedKey = '??';
    const keyMatch = cleanLine.match(/\b(Tom:\s*)?([A-G][#b]?(m|maj|7|7M|m7|dim|aug|m7b5)?|\?\?)\b/i);
    if (keyMatch) {
      detectedKey = keyMatch[2];
      cleanLine = cleanLine.replace(keyMatch[0], '').trim();
    }

    // Extract artist when separator "-" or "–" exists
    let title = cleanLine;
    let artist = '';
    const sepMatch = cleanLine.match(/^(.*?)\s*[-–—]\s*(.*)$/);
    if (sepMatch) {
      title = sepMatch[1].trim();
      artist = sepMatch[2].trim();
    }

    // Clean any leftover Intro prefix to observation
    let notes: string | undefined;
    if (title.startsWith('(Intro')) {
      notes = title;
    }
    if (instrument) {
      notes = notes ? `${notes} | Instrumento: ${instrument}` : `Instrumento: ${instrument}`;
    }

    // Classification logic (Section 5.8)
    let type: SongType = 'a_definir';
    if (artist && artist !== '—') {
      type = 'repertorio';
    } else if (instrument || title.includes('(Intro)')) {
      type = title.includes('(Intro)') ? 'instrumental' : 'autoral';
    }

    results.push({
      id: `imported-skel-${Date.now()}-${counter}`,
      title,
      artist,
      key: detectedKey === '??' ? '??' : detectedKey,
      bpm: 95,
      capo: 0,
      instrument,
      type,
      status: 'pendente',
      notes,
      block: currentBlock,
      orderInBlock: counter,
      chordProContent: '', // Empty skeleton as required
      rawText: line,
      confidence: detectedKey === '??' ? 'media' : 'alta',
      warnings: detectedKey === '??' ? ['Tom marcado como a definir (??)'] : [],
      action: 'create',
    });

    counter++;
  }

  return results;
}

/**
 * Reconhece rótulos de seção ("Intro", "[Verso 1]", "Refrão:"...).
 * Retorna o nome normalizado ou null.
 */
const SECTION_BRACKET_RE = /^\[(intro|introdução|introducao|verso\s*\d*|refrão|refrao|ponte|solo|final|instrumental|interlúdio|interludio|base|coda|pre[- ]?refrão|pre[- ]?refrao)\b[^\]]*\]$/i;
const SECTION_LINE_RE = /^(intro|introdução|introducao|verso\s*\d*|refrão|refrao|ponte|solo|final|instrumental|interlúdio|interludio|base|coda|pre[- ]?refrão|pre[- ]?refrao)\s*:?\s*$/i;

function sectionLabel(line: string): string | null {
  const raw = line.trim();
  let match = SECTION_BRACKET_RE.exec(raw);
  if (match) {
    const inner = raw.slice(1, -1).trim().replace(/:$/, '');
    return inner.charAt(0).toUpperCase() + inner.slice(1);
  }
  match = SECTION_LINE_RE.exec(raw);
  if (match) {
    const inner = raw.replace(/:$/, '').trim();
    return inner.charAt(0).toUpperCase() + inner.slice(1);
  }
  return null;
}

/**
 * Converte texto "acorde em cima / letra embaixo" em ChordPro ([D]letra),
 * transformando rótulos de seção em {section: X}.
 * `skipLines` permite ignorar linhas já consumidas como metadados.
 */
export function toChordPro(rawText: string, skipLines?: Set<number>): string {
  const text = rawText.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ');
  const lines = text.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (skipLines?.has(i)) continue;

    const line = lines[i].replace(/\s+$/, '');
    const trimmed = line.trim();

    if (!trimmed) {
      out.push('');
      continue;
    }

    const section = sectionLabel(trimmed);
    if (section) {
      out.push(`{section: ${section}}`);
      continue;
    }

    if (/^\{.*\}$/.test(trimmed)) {
      out.push(trimmed);
      continue;
    }

    if (isChordLine(line)) {
      // A letra pode estar separada por até 2 linhas em branco (Word/PDF).
      let j = i + 1;
      let blanks = 0;
      while (j < lines.length && lines[j].trim() === '' && blanks < 2) {
        j++;
        blanks++;
      }
      const nextLine = j < lines.length ? lines[j] : null;

      if (
        nextLine !== null &&
        !skipLines?.has(j) &&
        nextLine.trim() !== '' &&
        !isChordLine(nextLine) &&
        !sectionLabel(nextLine.trim()) &&
        !/^\{.*\}$/.test(nextLine.trim())
      ) {
        out.push(mergeChordAndLyricLines(line, nextLine.replace(/\s+$/, '')));
        i = j;
      } else {
        out.push(trimmed.replace(/\s{2,}/g, '  '));
      }
      continue;
    }

    out.push(line);
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Heurística simples de tom: usa o último acorde do conteúdo.
 */
function detectKeyFromContent(content: string): string {
  const chords = [...content.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]).filter(isChord);
  if (!chords.length) return '';
  const last = chords[chords.length - 1];
  const root = /^([A-G][#b]?)(m)?/.exec(last);
  if (!root) return '';
  return root[1] + (root[2] ? 'm' : '');
}

/**
 * Parses full songs from raw text (Word/PDF document with chords and lyrics)
 */
export function parseFullSongDocument(text: string, fileName: string): ParsedImportedSong[] {
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ');
  const lines = normalized.split('\n');
  const titleFallback = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/^(cifra|cifras|letra)\s*[-–—]\s*/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();

  const warnings: string[] = [];
  const consumed = new Set<number>();

  let extractedTitle = '';
  let extractedArtist = '';
  let extractedKey = '';
  let extractedCapo = 0;
  let extractedBpm = 100;

  // 1) Metadados explícitos (Tom / Capo / BPM)
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const tomMatch = line.match(
      /^(?:tom|tonalidade|key)\s*[:\-]\s*([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[249]?|[2-9]|1[13]|7M|m7b5)*)$/i
    );
    if (tomMatch) {
      extractedKey = tomMatch[1];
      consumed.add(i);
      continue;
    }

    const capoMatch = line.match(/^(?:capo|capotraste)\s*[:\-]?\s*(\d+)/i);
    if (capoMatch) {
      extractedCapo = parseInt(capoMatch[1], 10) || 0;
      consumed.add(i);
      continue;
    }

    const bpmMatch = line.match(/^(?:bpm|andamento|batida)\s*[:\-]\s*(\d+)/i);
    if (bpmMatch) {
      extractedBpm = parseInt(bpmMatch[1], 10) || 100;
      consumed.add(i);
      continue;
    }
  }

  // 2) Título e artista a partir das primeiras linhas "de conteúdo"
  const candidates = lines
    .map((l, i) => ({ text: l.trim(), i }))
    .filter(
      ({ text, i }) =>
        text.length > 0 &&
        !consumed.has(i) &&
        !sectionLabel(text) &&
        !isChordLine(text) &&
        !/^\{.*\}$/.test(text)
    );

  if (candidates.length) {
    const first = candidates[0];
    const split = /^(.{2,}?)\s+[–—|-]\s+(.{1,})$/u.exec(first.text);

    if (split) {
      extractedTitle = split[1].trim();
      extractedArtist = split[2].trim();
      consumed.add(first.i);
    } else {
      extractedTitle = first.text;
      consumed.add(first.i);

      const second = candidates[1];
      if (second && second.i === first.i + 1) {
        const t = second.text;
        const words = t.split(/\s+/).length;
        const looksLikeName =
          t.length >= 2 &&
          t.length <= 40 &&
          words <= 5 &&
          !/[.!?;:]$/.test(t) &&
          !/\d{2,}/.test(t);
        if (looksLikeName) {
          extractedArtist = t;
          consumed.add(second.i);
        }
      }
    }
  }

  const chordProContent = toChordPro(normalized, consumed);

  // Parse usando o parser ChordPro para validar/acrescentar metadados
  const parsedDoc = parseChordPro(chordProContent);
  const finalTitle = parsedDoc.title || extractedTitle || titleFallback || 'Sem título';
  const finalArtist = parsedDoc.artist || extractedArtist || '';
  const finalKey = parsedDoc.key || extractedKey || detectKeyFromContent(chordProContent);
  const finalCapo = parsedDoc.capo ?? extractedCapo;

  if (!parsedDoc.uniqueChords.length) {
    warnings.push('Nenhum acorde identificado no arquivo. Importado como letra sem cifra.');
  }
  if (!extractedTitle && !parsedDoc.title) {
    warnings.push('Título não encontrado no arquivo; usei o nome do arquivo.');
  }

  return [
    {
      id: `imported-song-${Date.now()}`,
      title: finalTitle,
      artist: finalArtist,
      key: finalKey,
      bpm: extractedBpm,
      capo: finalCapo,
      type: 'repertorio',
      status: parsedDoc.uniqueChords.length > 0 ? 'rascunho' : 'pendente',
      chordProContent,
      rawText: normalized,
      confidence: parsedDoc.uniqueChords.length > 0 ? 'alta' : 'media',
      warnings,
      action: 'create',
    },
  ];
}

/**
 * Checks for duplicates against an existing song library
 */
export function matchDuplicates(
  importedSongs: ParsedImportedSong[],
  existingSongs: Song[]
): ParsedImportedSong[] {
  return importedSongs.map((imp) => {
    const cleanImpTitle = imp.title.toLowerCase().trim();
    const cleanImpArtist = imp.artist.toLowerCase().trim();

    const match = existingSongs.find((existing) => {
      const exTitle = existing.title.toLowerCase().trim();
      const exArtist = existing.artist.toLowerCase().trim();

      if (exTitle === cleanImpTitle) {
        if (!cleanImpArtist || !exArtist || cleanImpArtist === exArtist) return true;
      }
      return false;
    });

    if (match) {
      return {
        ...imp,
        isDuplicateOfId: match.id,
        action: 'replace', // Default offer to replace/update skeleton
        warnings: [
          ...imp.warnings,
          `Música já cadastrada no acervo ("${match.title}"). Recomendado: Atualizar existente com nova cifra.`,
        ],
      };
    }

    return imp;
  });
}
