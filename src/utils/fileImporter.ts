import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { isChord, parseChordPro } from './chordPro';
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
    return { text: result.value, isScanned: false };
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
        let lastY: number | null = null;
        let pageStr = '';

        for (const item of textContent.items as any[]) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageStr += '\n';
          }
          pageStr += item.str + ' ';
          lastY = item.transform[5];
        }

        fullText += pageStr + '\n\n';
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
 * Parses full songs from raw text (Word/PDF document with chords and lyrics)
 */
export function parseFullSongDocument(text: string, fileName: string): ParsedImportedSong[] {
  const lines = text.split(/\r?\n/);
  const titleFallback = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  let extractedTitle = '';
  let extractedArtist = '';
  let extractedKey = 'G';
  let extractedCapo = 0;
  let extractedBpm = 100;
  const warnings: string[] = [];

  // Check top lines for metadata
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const tomMatch = line.match(/tom:\s*([A-G][#b]?(m|maj|7|7M|m7)?)/i);
    if (tomMatch) {
      extractedKey = tomMatch[1];
      continue;
    }

    const capoMatch = line.match(/capo(traste)?:\s*(\d+)/i);
    if (capoMatch) {
      extractedCapo = parseInt(capoMatch[2], 10);
      continue;
    }

    const bpmMatch = line.match(/bpm:\s*(\d+)/i);
    if (bpmMatch) {
      extractedBpm = parseInt(bpmMatch[1], 10);
      continue;
    }

    if (!extractedTitle && !line.startsWith('{') && !line.includes(':') && !isChord(line)) {
      extractedTitle = line;
      continue;
    }

    if (extractedTitle && !extractedArtist && !line.startsWith('{') && !line.includes(':') && !isChord(line)) {
      extractedArtist = line;
      continue;
    }
  }

  // Parse using ChordPro parser
  const parsedDoc = parseChordPro(text);
  const finalTitle = parsedDoc.title || extractedTitle || titleFallback;
  const finalArtist = parsedDoc.artist || extractedArtist || '';
  const finalKey = parsedDoc.key || extractedKey;
  const finalCapo = parsedDoc.capo ?? extractedCapo;

  if (parsedDoc.uniqueChords.length === 0) {
    warnings.push('Nenhum acorde identificado no arquivo. Importado como letra sem cifra.');
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
      chordProContent: text,
      rawText: text,
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
