// SVG Chord diagrams generator for Guitar (Violão), Cavaquinho, Bass (Contrabaixo), Keyboard, and Ukulele

export type SupportedInstrument = 'violao' | 'cavaquinho' | 'baixo' | 'teclado' | 'ukulele';

export interface GuitarChordData {
  frets: (number | 'x')[]; // 6 strings from low E to high E: fret number or 'x' (mute)
  fingers?: (number | 0)[]; // 1=index, 2=middle, 3=ring, 4=pinky
  barre?: { fret: number; fromString: number; toString: number };
  baseFret?: number;
}

export interface CavaquinhoChordData {
  frets: (number | 'x')[]; // 4 strings from 4th (D) to 1st (D): D, G, B, D
  fingers?: (number | 0)[];
  barre?: { fret: number; fromString: number; toString: number };
  baseFret?: number;
}

export interface UkuleleChordData {
  frets: (number | 'x')[]; // 4 strings: G, C, E, A
  fingers?: number[];
  baseFret?: number;
}

export interface KeyboardChordData {
  activeNotes: number[]; // semitone offset from C (0..23 for 2 octaves)
  rootNote: number;
}

export interface BassChordData {
  rootString: number; // 1 to 4 (1 = E, 2 = A, 3 = D, 4 = G)
  rootFret: number;
  rootName: string;
  fifthString: number;
  fifthFret: number;
  fifthName: string;
  thirdString: number;
  thirdFret: number;
  thirdName: string;
}

// Built-in dictionary of VIOLÃO (Guitar 6-strings E-A-D-G-B-E)
export const GUITAR_CHORDS: Record<string, GuitarChordData> = {
  C: { frets: ['x', 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  C7: { frets: ['x', 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  C7M: { frets: ['x', 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'C7(9)': { frets: ['x', 3, 2, 3, 3, 'x'], fingers: [0, 2, 1, 3, 4, 0] },
  Cm: { frets: ['x', 3, 5, 5, 4, 3], barre: { fret: 3, fromString: 2, toString: 6 }, baseFret: 3 },
  Cm7: { frets: ['x', 3, 5, 3, 4, 3], barre: { fret: 3, fromString: 2, toString: 6 }, baseFret: 3 },
  D: { frets: ['x', 'x', 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  D7: { frets: ['x', 'x', 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'D7(9)': { frets: ['x', 5, 4, 5, 5, 'x'], baseFret: 4 },
  D7M: { frets: ['x', 'x', 0, 2, 2, 2], barre: { fret: 2, fromString: 4, toString: 6 } },
  Dm: { frets: ['x', 'x', 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  Dm7: { frets: ['x', 'x', 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  'Dm7(b5)': { frets: ['x', 'x', 0, 1, 1, 1], barre: { fret: 1, fromString: 4, toString: 6 } },
  E: { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  E7: { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  Em: { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  Em7: { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0] },
  'Em7(b5)': { frets: ['x', 'x', 2, 3, 3, 3], barre: { fret: 3, fromString: 4, toString: 6 }, baseFret: 2 },
  F: { frets: [1, 3, 3, 2, 1, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  F7: { frets: [1, 3, 1, 2, 1, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  F7M: { frets: ['x', 'x', 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  Fm: { frets: [1, 3, 3, 1, 1, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  Fm7: { frets: [1, 3, 1, 1, 1, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  'F#': { frets: [2, 4, 4, 3, 2, 2], barre: { fret: 2, fromString: 1, toString: 6 }, baseFret: 2 },
  'F#7': { frets: [2, 4, 2, 3, 2, 2], barre: { fret: 2, fromString: 1, toString: 6 }, baseFret: 2 },
  'F#m': { frets: [2, 4, 4, 2, 2, 2], barre: { fret: 2, fromString: 1, toString: 6 }, baseFret: 2 },
  'F#m7': { frets: [2, 4, 2, 2, 2, 2], barre: { fret: 2, fromString: 1, toString: 6 }, baseFret: 2 },
  G: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  G7: { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  G7M: { frets: [3, 'x', 0, 0, 0, 2], fingers: [2, 0, 0, 0, 0, 1] },
  Gm: { frets: [3, 5, 5, 3, 3, 3], barre: { fret: 3, fromString: 1, toString: 6 }, baseFret: 3 },
  Gm7: { frets: [3, 5, 3, 3, 3, 3], barre: { fret: 3, fromString: 1, toString: 6 }, baseFret: 3 },
  Gm6: { frets: [3, 'x', 2, 3, 3, 'x'], baseFret: 2 },
  A: { frets: ['x', 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  A7: { frets: ['x', 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
  A7M: { frets: ['x', 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  Am: { frets: ['x', 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  Am7: { frets: ['x', 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  B: { frets: ['x', 2, 4, 4, 4, 2], barre: { fret: 2, fromString: 2, toString: 6 }, baseFret: 2 },
  B7: { frets: ['x', 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  Bm: { frets: ['x', 2, 4, 4, 3, 2], barre: { fret: 2, fromString: 2, toString: 6 }, baseFret: 2 },
  Bm7: { frets: ['x', 2, 4, 2, 3, 2], barre: { fret: 2, fromString: 2, toString: 6 }, baseFret: 2 },
  Bb: { frets: ['x', 1, 3, 3, 3, 1], barre: { fret: 1, fromString: 2, toString: 6 } },
  Bb7: { frets: ['x', 1, 3, 1, 3, 1], barre: { fret: 1, fromString: 2, toString: 6 } },
  Bb7M: { frets: ['x', 1, 3, 2, 3, 1], barre: { fret: 1, fromString: 2, toString: 6 } },
  Bbm: { frets: ['x', 1, 3, 3, 2, 1], barre: { fret: 1, fromString: 2, toString: 6 } },
  Bbm7: { frets: ['x', 1, 3, 1, 2, 1], barre: { fret: 1, fromString: 2, toString: 6 } },
  Eb: { frets: ['x', 6, 8, 8, 8, 6], barre: { fret: 6, fromString: 2, toString: 6 }, baseFret: 6 },
  Eb7M: { frets: ['x', 6, 8, 7, 8, 6], baseFret: 6 },
  Ab: { frets: [4, 6, 6, 5, 4, 4], barre: { fret: 4, fromString: 1, toString: 6 }, baseFret: 4 },
  Ab7M: { frets: [4, 'x', 5, 5, 4, 'x'], baseFret: 4 },
  'C#m': { frets: ['x', 4, 6, 6, 5, 4], barre: { fret: 4, fromString: 2, toString: 6 }, baseFret: 4 },
  'C#7': { frets: ['x', 4, 6, 4, 6, 4], barre: { fret: 4, fromString: 2, toString: 6 }, baseFret: 4 },
};

// Built-in dictionary of CAVAQUINHO (Afinação D - G - B - D / Ré - Sol - Si - Ré)
export const CAVAQUINHO_CHORDS: Record<string, CavaquinhoChordData> = {
  C: { frets: [2, 0, 1, 2], fingers: [2, 0, 1, 3] },
  C7: { frets: [2, 3, 1, 2], fingers: [2, 4, 1, 3] },
  C7M: { frets: [2, 0, 0, 2], fingers: [1, 0, 0, 2] },
  'C7(9)': { frets: [2, 3, 3, 2], barre: { fret: 2, fromString: 1, toString: 4 } },
  Cm: { frets: [1, 0, 1, 1], fingers: [1, 0, 2, 3] },
  Cm7: { frets: [1, 3, 1, 1], barre: { fret: 1, fromString: 1, toString: 4 } },
  D: { frets: [0, 2, 3, 4], fingers: [0, 1, 2, 3] },
  D7: { frets: [0, 2, 1, 0], fingers: [0, 2, 1, 0] },
  D7M: { frets: [0, 2, 2, 0], fingers: [0, 1, 2, 0] },
  Dm: { frets: [0, 2, 3, 3], fingers: [0, 1, 2, 3] },
  Dm7: { frets: [0, 2, 1, 3], fingers: [0, 2, 1, 4] },
  'Dm7(b5)': { frets: [0, 1, 1, 0], fingers: [0, 1, 2, 0] },
  E: { frets: [2, 1, 0, 2], fingers: [2, 1, 0, 3] },
  E7: { frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0] },
  Em: { frets: [2, 0, 0, 2], fingers: [1, 0, 0, 2] },
  Em7: { frets: [2, 0, 3, 2], fingers: [1, 0, 3, 2] },
  'Em7(b5)': { frets: [2, 3, 3, 2], fingers: [1, 2, 3, 1], barre: { fret: 2, fromString: 1, toString: 4 } },
  F: { frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] },
  F7: { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1], barre: { fret: 1, fromString: 3, toString: 4 } },
  F7M: { frets: [3, 2, 1, 2], fingers: [3, 2, 1, 2] },
  Fm: { frets: [3, 1, 1, 3], fingers: [3, 1, 1, 4] },
  Fm7: { frets: [3, 1, 1, 1], barre: { fret: 1, fromString: 2, toString: 4 } },
  'F#': { frets: [4, 3, 2, 4], fingers: [3, 2, 1, 4], baseFret: 2 },
  'F#7': { frets: [4, 3, 2, 2], barre: { fret: 2, fromString: 3, toString: 4 }, baseFret: 2 },
  'F#m': { frets: [4, 2, 2, 4], fingers: [3, 1, 1, 4], baseFret: 2 },
  'F#m7': { frets: [4, 2, 2, 2], barre: { fret: 2, fromString: 2, toString: 4 }, baseFret: 2 },
  G: { frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0] }, // Cordas soltas D-G-B-D formam tríade de Sol Maior perfeita!
  G7: { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
  G7M: { frets: [0, 0, 0, 4], fingers: [0, 0, 0, 4] },
  Gm: { frets: [0, 0, 3, 0], fingers: [0, 0, 3, 0] },
  Gm7: { frets: [3, 3, 3, 3], barre: { fret: 3, fromString: 1, toString: 4 }, baseFret: 3 },
  Gm6: { frets: [2, 3, 3, 2], barre: { fret: 2, fromString: 1, toString: 4 }, baseFret: 2 },
  A: { frets: [2, 2, 2, 2], barre: { fret: 2, fromString: 1, toString: 4 }, baseFret: 2 },
  A7: { frets: [2, 0, 2, 2], fingers: [1, 0, 2, 3] },
  A7M: { frets: [2, 1, 2, 2], fingers: [2, 1, 3, 4] },
  Am: { frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },
  Am7: { frets: [2, 0, 1, 2], fingers: [2, 0, 1, 3] },
  B: { frets: [4, 4, 4, 4], barre: { fret: 4, fromString: 1, toString: 4 }, baseFret: 4 },
  B7: { frets: [1, 2, 0, 1], fingers: [1, 2, 0, 1] },
  Bm: { frets: [4, 4, 3, 4], baseFret: 3 },
  Bm7: { frets: [0, 2, 0, 0], fingers: [0, 2, 0, 0] },
  Bb: { frets: [3, 3, 3, 3], barre: { fret: 3, fromString: 1, toString: 4 }, baseFret: 3 },
  Bb7: { frets: [3, 1, 3, 3], baseFret: 1 },
  Bb7M: { frets: [3, 2, 3, 3], baseFret: 2 },
  Bbm: { frets: [3, 3, 2, 3], baseFret: 2 },
  Bbm7: { frets: [3, 1, 2, 3], baseFret: 1 },
  Eb: { frets: [1, 3, 4, 1], baseFret: 1 },
  Eb7M: { frets: [1, 3, 3, 1], baseFret: 1 },
  Ab: { frets: [1, 1, 1, 1], barre: { fret: 1, fromString: 1, toString: 4 } },
  Ab7M: { frets: [1, 1, 1, 5], baseFret: 1 },
  'C#m': { frets: [2, 1, 2, 2], fingers: [2, 1, 3, 4] },
  'C#7': { frets: [3, 1, 2, 3], baseFret: 1 },
};

// Ukulele dictionary
export const UKULELE_CHORDS: Record<string, UkuleleChordData> = {
  C: { frets: [0, 0, 0, 3] },
  C7: { frets: [0, 0, 0, 1] },
  Cm: { frets: [0, 3, 3, 3] },
  D: { frets: [2, 2, 2, 0] },
  D7: { frets: [2, 2, 2, 3] },
  Dm: { frets: [2, 2, 1, 0] },
  E: { frets: [4, 4, 4, 2], baseFret: 2 },
  E7: { frets: [1, 2, 0, 2] },
  Em: { frets: [0, 4, 3, 2] },
  F: { frets: [2, 0, 1, 0] },
  F7: { frets: [2, 3, 1, 0] },
  Fm: { frets: [1, 0, 1, 3] },
  G: { frets: [0, 2, 3, 2] },
  G7: { frets: [0, 2, 1, 2] },
  Gm: { frets: [0, 2, 3, 1] },
  A: { frets: [2, 1, 0, 0] },
  A7: { frets: [0, 1, 0, 0] },
  Am: { frets: [2, 0, 0, 0] },
  B: { frets: [4, 3, 2, 2], baseFret: 2 },
  B7: { frets: [2, 3, 2, 2] },
  Bm: { frets: [4, 2, 2, 2], baseFret: 2 },
};

/**
 * Get piano active note keys (in semitones relative to C)
 */
export function getKeyboardChordNotes(chord: string): KeyboardChordData {
  const clean = chord.split('/')[0].trim();
  const notesMap: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6,
    G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
  };

  const rootMatch = clean.match(/^[A-G][#b]?/);
  const root = rootMatch ? rootMatch[0] : 'C';
  const rootIdx = notesMap[root] ?? 0;
  const suffix = clean.slice(root.length);

  // Intervals from root
  let intervals = [0, 4, 7]; // Major triad default

  if (suffix.startsWith('m7b5')) intervals = [0, 3, 6, 10];
  else if (suffix.startsWith('m7')) intervals = [0, 3, 7, 10];
  else if (suffix.startsWith('m')) intervals = [0, 3, 7];
  else if (suffix.startsWith('7M') || suffix.startsWith('maj7')) intervals = [0, 4, 7, 11];
  else if (suffix.startsWith('7')) intervals = [0, 4, 7, 10];
  else if (suffix.startsWith('dim')) intervals = [0, 3, 6];
  else if (suffix.startsWith('sus4')) intervals = [0, 5, 7];
  else if (suffix.startsWith('sus2')) intervals = [0, 2, 7];

  const activeNotes = intervals.map((i) => rootIdx + i);
  return { activeNotes, rootNote: rootIdx };
}

/**
 * Get CONTRABAIXO root string, fret, fifth and third for 4-string bass (E-A-D-G)
 */
export function getBassChordInfo(chord: string): BassChordData {
  const rootMatch = chord.match(/^[A-G][#b]?/);
  const root = rootMatch ? rootMatch[0] : 'C';
  const isMinor = chord.includes('m') && !chord.includes('maj') && !chord.includes('7M');

  // Position on 4-string bass: E(4ª), A(3ª), D(2ª), G(1ª)
  // Mapping: string: 1=E, 2=A, 3=D, 4=G
  const bassRoots: Record<string, { string: number; fret: number; fifth: { string: number; fret: number; name: string }; third: { string: number; fret: number; name: string } }> = {
    C: {
      string: 2, fret: 3,
      fifth: { string: 3, fret: 5, name: 'G' },
      third: { string: 3, fret: isMinor ? 1 : 2, name: isMinor ? 'Eb' : 'E' },
    },
    'C#': {
      string: 2, fret: 4,
      fifth: { string: 3, fret: 6, name: 'G#' },
      third: { string: 3, fret: isMinor ? 2 : 3, name: isMinor ? 'E' : 'F' },
    },
    D: {
      string: 3, fret: 0,
      fifth: { string: 2, fret: 0, name: 'A' },
      third: { string: 3, fret: isMinor ? 3 : 4, name: isMinor ? 'F' : 'F#' },
    },
    'D#': {
      string: 3, fret: 1,
      fifth: { string: 2, fret: 1, name: 'A#' },
      third: { string: 4, fret: isMinor ? 0 : 1, name: isMinor ? 'F#' : 'G' },
    },
    Eb: {
      string: 3, fret: 1,
      fifth: { string: 2, fret: 1, name: 'Bb' },
      third: { string: 4, fret: isMinor ? 0 : 1, name: isMinor ? 'Gb' : 'G' },
    },
    E: {
      string: 1, fret: 0,
      fifth: { string: 2, fret: 2, name: 'B' },
      third: { string: 1, fret: isMinor ? 3 : 4, name: isMinor ? 'G' : 'G#' },
    },
    F: {
      string: 1, fret: 1,
      fifth: { string: 2, fret: 3, name: 'C' },
      third: { string: 2, fret: isMinor ? 0 : 1, name: isMinor ? 'Ab' : 'A' },
    },
    'F#': {
      string: 1, fret: 2,
      fifth: { string: 2, fret: 4, name: 'C#' },
      third: { string: 2, fret: isMinor ? 0 : 1, name: isMinor ? 'A' : 'A#' },
    },
    G: {
      string: 1, fret: 3,
      fifth: { string: 2, fret: 5, name: 'D' },
      third: { string: 2, fret: isMinor ? 1 : 2, name: isMinor ? 'Bb' : 'B' },
    },
    'G#': {
      string: 1, fret: 4,
      fifth: { string: 3, fret: 1, name: 'D#' },
      third: { string: 2, fret: isMinor ? 2 : 3, name: isMinor ? 'B' : 'C' },
    },
    Ab: {
      string: 1, fret: 4,
      fifth: { string: 3, fret: 1, name: 'Eb' },
      third: { string: 2, fret: isMinor ? 2 : 3, name: isMinor ? 'B' : 'C' },
    },
    A: {
      string: 2, fret: 0,
      fifth: { string: 3, fret: 2, name: 'E' },
      third: { string: 2, fret: isMinor ? 3 : 4, name: isMinor ? 'C' : 'C#' },
    },
    'A#': {
      string: 2, fret: 1,
      fifth: { string: 3, fret: 3, name: 'F' },
      third: { string: 3, fret: isMinor ? 0 : 1, name: isMinor ? 'C#' : 'D' },
    },
    Bb: {
      string: 2, fret: 1,
      fifth: { string: 3, fret: 3, name: 'F' },
      third: { string: 3, fret: isMinor ? 0 : 1, name: isMinor ? 'Db' : 'D' },
    },
    B: {
      string: 2, fret: 2,
      fifth: { string: 3, fret: 4, name: 'F#' },
      third: { string: 3, fret: isMinor ? 0 : 1, name: isMinor ? 'D' : 'D#' },
    },
  };

  const pos = bassRoots[root] || {
    string: 2, fret: 3,
    fifth: { string: 3, fret: 5, name: 'G' },
    third: { string: 3, fret: 2, name: 'E' },
  };

  return {
    rootString: pos.string,
    rootFret: pos.fret,
    rootName: root,
    fifthString: pos.fifth.string,
    fifthFret: pos.fifth.fret,
    fifthName: pos.fifth.name,
    thirdString: pos.third.string,
    thirdFret: pos.third.fret,
    thirdName: pos.third.name,
  };
}
