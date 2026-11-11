// Music theory transposer and Nashville Number System engine

export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Key signatures that naturally prefer flats
export const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];

// All valid standard root musical keys
export const ALL_KEYS = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
  'Am', 'A#m', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Abm'
];

// Nashville numbers major scale intervals (semitones: 0, 2, 4, 5, 7, 9, 11)
const NASHVILLE_MAJOR = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

/**
 * Standardize note name to index 0..11
 */
export function noteToSemitone(note: string): number {
  const clean = note.trim();
  const sharpIdx = CHROMATIC_SHARPS.indexOf(clean);
  if (sharpIdx !== -1) return sharpIdx;
  const flatIdx = CHROMATIC_FLATS.indexOf(clean);
  if (flatIdx !== -1) return flatIdx;

  // Enharmonic edge cases
  if (clean === 'E#' || clean === 'Fb') return clean === 'E#' ? 5 : 4;
  if (clean === 'B#' || clean === 'Cb') return clean === 'B#' ? 0 : 11;

  return 0;
}

/**
 * Determine if a key uses flats
 */
export function prefersFlats(key: string): boolean {
  if (!key) return false;
  return FLAT_KEYS.includes(key) || key.includes('b');
}

/**
 * Split a chord string into Root, Suffix, and Bass note (e.g., "F#m7/C#" -> root: "F#", suffix: "m7", bass: "C#")
 */
export function parseChordParts(chord: string): { root: string; suffix: string; bass?: string } | null {
  if (!chord || typeof chord !== 'string') return null;
  const trimmed = chord.trim();
  if (trimmed === '??' || trimmed === '-' || trimmed === 'N.C.') return null;

  const match = trimmed.match(/^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/);
  if (!match) return null;

  return {
    root: match[1],
    suffix: match[2] || '',
    bass: match[3],
  };
}

/**
 * Transpose a single note by semitones
 */
export function transposeNote(note: string, semitones: number, targetKeyPreference?: string): string {
  if (!note) return note;
  const currentSemi = noteToSemitone(note);
  const newSemi = (currentSemi + semitones + 120) % 12;

  const useFlats = targetKeyPreference ? prefersFlats(targetKeyPreference) : false;
  return useFlats ? CHROMATIC_FLATS[newSemi] : CHROMATIC_SHARPS[newSemi];
}

/**
 * Transpose an entire chord string (handles suffixes and bass notes)
 */
export function transposeChord(chord: string, semitones: number, targetKeyPreference?: string): string {
  const parts = parseChordParts(chord);
  if (!parts) return chord;

  const newRoot = transposeNote(parts.root, semitones, targetKeyPreference);
  let result = newRoot + parts.suffix;

  if (parts.bass) {
    const newBass = transposeNote(parts.bass, semitones, targetKeyPreference);
    result += '/' + newBass;
  }

  return result;
}

/**
 * Calculate difference in semitones between two musical keys
 */
export function calculateKeyDifference(fromKey: string, toKey: string): number {
  if (!fromKey || !toKey || fromKey === '??' || toKey === '??') return 0;
  const p1 = parseChordParts(fromKey);
  const p2 = parseChordParts(toKey);
  if (!p1 || !p2) return 0;

  const semi1 = noteToSemitone(p1.root);
  const semi2 = noteToSemitone(p2.root);
  return (semi2 - semi1 + 12) % 12;
}

/**
 * Convert chord to Nashville Number notation relative to a key
 */
export function chordToNashville(chord: string, key: string): string {
  const keyParts = parseChordParts(key);
  const chordParts = parseChordParts(chord);
  if (!keyParts || !chordParts) return chord;

  const keySemi = noteToSemitone(keyParts.root);
  const chordSemi = noteToSemitone(chordParts.root);
  const interval = (chordSemi - keySemi + 12) % 12;

  const num = NASHVILLE_MAJOR[interval];
  let res = num + chordParts.suffix;
  if (chordParts.bass) {
    const bassSemi = noteToSemitone(chordParts.bass);
    const bassInterval = (bassSemi - keySemi + 12) % 12;
    res += '/' + NASHVILLE_MAJOR[bassInterval];
  }
  return res;
}

/**
 * Calculate effective sounding key with Capo
 */
export function getSoundingKeyWithCapo(originalKey: string, capoFret: number): string {
  if (!originalKey || originalKey === '??' || capoFret <= 0) return originalKey;
  return transposeChord(originalKey, capoFret, originalKey);
}

/**
 * Calculate play chord shape key given target sounding key and capo fret
 */
export function getPlayShapeKeyWithCapo(targetSoundingKey: string, capoFret: number): string {
  if (!targetSoundingKey || targetSoundingKey === '??' || capoFret <= 0) return targetSoundingKey;
  return transposeChord(targetSoundingKey, -capoFret, targetSoundingKey);
}
