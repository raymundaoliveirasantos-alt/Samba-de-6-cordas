import { transposeChord, chordToNashville } from './transposer';

export interface ChordProToken {
  chord?: string;
  lyric: string;
}

export type ChordProLineType =
  | 'chord_lyric'
  | 'directive'
  | 'comment'
  | 'section_start'
  | 'section_end'
  | 'empty';

export interface ChordProLine {
  type: ChordProLineType;
  raw: string;
  tokens?: ChordProToken[];
  sectionName?: string;
  comment?: string;
}

export interface ParsedChordProDocument {
  title?: string;
  artist?: string;
  key?: string;
  capo?: number;
  tempo?: number;
  time?: string;
  lines: ChordProLine[];
  uniqueChords: string[];
}

// Regex to identify if a token is likely a chord name
const CHORD_REGEX = /^[A-G][#b]?(m|maj|min|dim|aug|sus[24]?|add[249]?|[2-9]|1[13]|7M|m7b5)*(\/[A-G][#b]?)?$/;

export function isChord(text: string): boolean {
  if (!text) return false;
  return CHORD_REGEX.test(text.trim());
}

/**
 * Checks if a plain text line contains only chords
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const words = trimmed.split(/\s+/);
  if (words.length === 0) return false;
  const chordCount = words.filter(isChord).length;
  return chordCount / words.length >= 0.7;
}

/**
 * Parses bracket notation like "[G]Amazing [G7]grace" into tokens
 */
export function parseBracketLine(line: string): ChordProToken[] {
  const tokens: ChordProToken[] = [];
  const regex = /\[([^\]]+)\]([^\[]*)/g;
  let match;
  let lastIndex = 0;

  // Check if there is initial text before first chord
  const firstBracket = line.indexOf('[');
  if (firstBracket > 0) {
    tokens.push({
      lyric: line.substring(0, firstBracket),
    });
  } else if (firstBracket === -1) {
    return [{ lyric: line }];
  }

  while ((match = regex.exec(line)) !== null) {
    tokens.push({
      chord: match[1].trim(),
      lyric: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  // Any leftover text
  if (lastIndex < line.length && firstBracket !== -1) {
    const trailing = line.substring(lastIndex);
    if (trailing && tokens.length > 0) {
      tokens[tokens.length - 1].lyric += trailing;
    }
  }

  return tokens;
}

/**
 * Converts two lines (one chord line and one lyric line) into a single bracket ChordPro line
 */
export function mergeChordAndLyricLines(chordLine: string, lyricLine: string): string {
  let result = '';
  const chordMatches: { chord: string; index: number }[] = [];
  const regex = /\S+/g;
  let match;

  while ((match = regex.exec(chordLine)) !== null) {
    chordMatches.push({ chord: match[0], index: match.index });
  }

  if (chordMatches.length === 0) return lyricLine;

  let currentLyricIndex = 0;
  for (let i = 0; i < chordMatches.length; i++) {
    const { chord, index } = chordMatches[i];
    // Add lyrics between current index and chord index
    if (index > currentLyricIndex && index <= lyricLine.length) {
      result += lyricLine.substring(currentLyricIndex, index);
      currentLyricIndex = index;
    }
    result += `[${chord}]`;
  }

  if (currentLyricIndex < lyricLine.length) {
    result += lyricLine.substring(currentLyricIndex);
  }

  return result;
}

/**
 * Full parser for ChordPro documents, supporting directives, bracket chords, and legacy two-line chords
 */
export function parseChordPro(content: string): ParsedChordProDocument {
  if (!content) {
    return { lines: [], uniqueChords: [] };
  }

  const rawLines = content.split(/\r?\n/);
  const processedLines: string[] = [];

  // Pass 1: detect and merge two-line chords if present
  for (let i = 0; i < rawLines.length; i++) {
    const curr = rawLines[i];
    const next = i + 1 < rawLines.length ? rawLines[i + 1] : null;

    if (
      isChordLine(curr) &&
      next !== null &&
      !isChordLine(next) &&
      !next.startsWith('{') &&
      next.trim().length > 0
    ) {
      processedLines.push(mergeChordAndLyricLines(curr, next));
      i++; // Skip the next line since it was merged
    } else {
      processedLines.push(curr);
    }
  }

  let title: string | undefined;
  let artist: string | undefined;
  let key: string | undefined;
  let capo: number | undefined;
  let tempo: number | undefined;
  let time: string | undefined;
  const lines: ChordProLine[] = [];
  const chordsSet = new Set<string>();

  for (const line of processedLines) {
    const trimmed = line.trim();

    if (!trimmed) {
      lines.push({ type: 'empty', raw: '' });
      continue;
    }

    // Directives: {name: value} or {soc}, {eoc}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1).trim();

      if (inner.toLowerCase() === 'soc' || inner.toLowerCase() === 'chorus' || inner.toLowerCase() === 'start_of_chorus') {
        lines.push({ type: 'section_start', raw: line, sectionName: 'Refrão' });
        continue;
      }
      if (inner.toLowerCase() === 'eoc' || inner.toLowerCase() === 'end_of_chorus') {
        lines.push({ type: 'section_end', raw: line, sectionName: 'Refrão' });
        continue;
      }

      const colonIdx = inner.indexOf(':');
      if (colonIdx !== -1) {
        const tag = inner.slice(0, colonIdx).trim().toLowerCase();
        const value = inner.slice(colonIdx + 1).trim();

        if (tag === 'title' || tag === 't') title = value;
        else if (tag === 'artist' || tag === 'a') artist = value;
        else if (tag === 'key' || tag === 'k') key = value;
        else if (tag === 'capo') capo = parseInt(value, 10) || 0;
        else if (tag === 'tempo' || tag === 'bpm') tempo = parseInt(value, 10) || undefined;
        else if (tag === 'time') time = value;
        else if (tag === 'comment' || tag === 'c') {
          lines.push({ type: 'comment', raw: line, comment: value });
          // Extract chords from comment if in brackets
          const bracketMatches = value.match(/\[([^\]]+)\]/g);
          if (bracketMatches) {
            bracketMatches.forEach((m) => chordsSet.add(m.slice(1, -1).trim()));
          }
          continue;
        }

        lines.push({ type: 'directive', raw: line });
        continue;
      }
    }

    // Bracket notation line
    const tokens = parseBracketLine(line);
    tokens.forEach((t) => {
      if (t.chord) chordsSet.add(t.chord);
    });

    lines.push({
      type: 'chord_lyric',
      raw: line,
      tokens,
    });
  }

  return {
    title,
    artist,
    key,
    capo,
    tempo,
    time,
    lines,
    uniqueChords: Array.from(chordsSet),
  };
}

/**
 * Transposes all chords inside a ChordPro string
 */
export function transposeChordProContent(
  content: string,
  semitones: number,
  targetKeyPreference?: string,
  useNashville = false,
  baseKey = 'C'
): string {
  if (!content) return '';
  if (semitones === 0 && !useNashville) return content;

  return content.replace(/\[([^\]]+)\]/g, (_match, chord) => {
    let transposed = transposeChord(chord, semitones, targetKeyPreference);
    if (useNashville) {
      transposed = chordToNashville(transposed, baseKey);
    }
    return `[${transposed}]`;
  });
}
