// SVG Chord diagrams generator for Guitar, Keyboard, Bass, and Ukulele

export interface GuitarChordData {
  frets: (number | 'x')[]; // 6 strings from low E to high E: fret number or 'x' (mute)
  fingers?: (number | 0)[]; // 1=index, 2=middle, 3=ring, 4=pinky
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
  rootString: number; // 1 to 4 (1 = low E, 2 = A, 3 = D, 4 = G)
  rootFret: number;
  rootName: string;
}

// Built-in dictionary of common guitar chords
export const GUITAR_CHORDS: Record<string, GuitarChordData> = {
  C: { frets: ['x', 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  C7: { frets: ['x', 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  C7M: { frets: ['x', 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  Cm: { frets: ['x', 3, 5, 5, 4, 3], barre: { fret: 3, fromString: 2, toString: 6 }, baseFret: 3 },
  Cm7: { frets: ['x', 3, 5, 3, 4, 3], barre: { fret: 3, fromString: 2, toString: 6 }, baseFret: 3 },
  D: { frets: ['x', 'x', 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  D7: { frets: ['x', 'x', 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  D7M: { frets: ['x', 'x', 0, 2, 2, 2], barre: { fret: 2, fromString: 4, toString: 6 } },
  Dm: { frets: ['x', 'x', 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  Dm7: { frets: ['x', 'x', 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  E: { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  E7: { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  Em: { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  Em7: { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0] },
  F: { frets: [1, 3, 3, 2, 1, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  F7: { frets: [1, 3, 1, 2, 1, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  F7M: { frets: ['x', 'x', 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  Fm: { frets: [1, 3, 3, 1, 1, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  Fm7: { frets: [1, 3, 1, 1, 1, 1], barre: { fret: 1, fromString: 1, toString: 6 } },
  'F#m': { frets: [2, 4, 4, 2, 2, 2], barre: { fret: 2, fromString: 1, toString: 6 }, baseFret: 2 },
  'F#m7': { frets: [2, 4, 2, 2, 2, 2], barre: { fret: 2, fromString: 1, toString: 6 }, baseFret: 2 },
  G: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  G7: { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  G7M: { frets: [3, 'x', 0, 0, 0, 2], fingers: [2, 0, 0, 0, 0, 1] },
  Gm: { frets: [3, 5, 5, 3, 3, 3], barre: { fret: 3, fromString: 1, toString: 6 }, baseFret: 3 },
  Gm7: { frets: [3, 5, 3, 3, 3, 3], barre: { fret: 3, fromString: 1, toString: 6 }, baseFret: 3 },
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
  Bbm: { frets: ['x', 1, 3, 3, 2, 1], barre: { fret: 1, fromString: 2, toString: 6 } },
  'C#m': { frets: ['x', 4, 6, 6, 5, 4], barre: { fret: 4, fromString: 2, toString: 6 }, baseFret: 4 },
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
 * Get bass root string and fret for 4-string bass
 */
export function getBassChordInfo(chord: string): BassChordData {
  const rootMatch = chord.match(/^[A-G][#b]?/);
  const root = rootMatch ? rootMatch[0] : 'C';

  // Position on 4-string bass: E(4), A(3), D(2), G(1)
  const bassPositions: Record<string, { string: number; fret: number }> = {
    E: { string: 1, fret: 0 },
    F: { string: 1, fret: 1 },
    'F#': { string: 1, fret: 2 },
    Gb: { string: 1, fret: 2 },
    G: { string: 1, fret: 3 },
    'G#': { string: 1, fret: 4 },
    Ab: { string: 1, fret: 4 },
    A: { string: 2, fret: 0 },
    'A#': { string: 2, fret: 1 },
    Bb: { string: 2, fret: 1 },
    B: { string: 2, fret: 2 },
    C: { string: 2, fret: 3 },
    'C#': { string: 2, fret: 4 },
    Db: { string: 2, fret: 4 },
    D: { string: 3, fret: 0 },
    'D#': { string: 3, fret: 1 },
    Eb: { string: 3, fret: 1 },
  };

  const pos = bassPositions[root] || { string: 2, fret: 3 };
  return { rootString: pos.string, rootFret: pos.fret, rootName: root };
}
