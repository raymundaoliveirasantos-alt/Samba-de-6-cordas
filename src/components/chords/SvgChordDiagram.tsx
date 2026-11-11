import React from 'react';
import {
  GUITAR_CHORDS,
  UKULELE_CHORDS,
  getKeyboardChordNotes,
  getBassChordInfo,
} from '../../utils/chordDiagrams';

interface SvgChordDiagramProps {
  chord: string;
  instrument?: 'violao' | 'teclado' | 'baixo' | 'ukulele';
  width?: number;
  height?: number;
}

export const SvgChordDiagram: React.FC<SvgChordDiagramProps> = ({
  chord,
  instrument = 'violao',
  width = 160,
  height = 190,
}) => {
  const cleanChord = chord.split('/')[0].trim();

  // 1. TECLADO / PIANO
  if (instrument === 'teclado') {
    const { activeNotes, rootNote } = getKeyboardChordNotes(cleanChord);
    const whiteKeys = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23];
    const blackKeys = [
      { note: 1, pos: 0.65 },
      { note: 3, pos: 1.65 },
      { note: 6, pos: 3.65 },
      { note: 8, pos: 4.65 },
      { note: 10, pos: 5.65 },
      { note: 13, pos: 7.65 },
      { note: 15, pos: 8.65 },
      { note: 18, pos: 10.65 },
      { note: 20, pos: 11.65 },
      { note: 22, pos: 12.65 },
    ];

    const keyWidth = 14;
    const keyHeight = 70;
    const blackHeight = 44;

    return (
      <div className="flex flex-col items-center">
        <div className="text-sm font-bold text-amber-400 mb-1">{chord} (Teclado)</div>
        <svg width={whiteKeys.length * keyWidth + 4} height={keyHeight + 10} className="bg-slate-900 rounded p-1 border border-slate-700">
          {/* White keys */}
          {whiteKeys.map((note, idx) => {
            const isActive = activeNotes.includes(note % 12) || activeNotes.includes(note);
            const isRoot = (note % 12) === rootNote;
            return (
              <g key={`w-${idx}`}>
                <rect
                  x={idx * keyWidth + 2}
                  y={2}
                  width={keyWidth - 1}
                  height={keyHeight}
                  rx={2}
                  className={
                    isRoot
                      ? 'fill-amber-400 stroke-slate-900'
                      : isActive
                      ? 'fill-amber-200 stroke-slate-900'
                      : 'fill-slate-100 stroke-slate-800'
                  }
                />
                {isActive && (
                  <circle
                    cx={idx * keyWidth + keyWidth / 2}
                    cy={keyHeight - 10}
                    r={3}
                    className={isRoot ? 'fill-slate-950' : 'fill-amber-700'}
                  />
                )}
              </g>
            );
          })}
          {/* Black keys */}
          {blackKeys.map(({ note, pos }) => {
            const isActive = activeNotes.includes(note % 12) || activeNotes.includes(note);
            const isRoot = (note % 12) === rootNote;
            return (
              <rect
                key={`b-${note}`}
                x={pos * keyWidth + 2}
                y={2}
                width={keyWidth * 0.7}
                height={blackHeight}
                rx={1.5}
                className={
                  isRoot
                    ? 'fill-amber-500 stroke-amber-300'
                    : isActive
                    ? 'fill-amber-300 stroke-slate-900'
                    : 'fill-slate-900 stroke-slate-950'
                }
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // 2. BAIXO (4 CORDAS - CIFRA + FUNDAMENTAL)
  if (instrument === 'baixo') {
    const bass = getBassChordInfo(cleanChord);
    return (
      <div className="flex flex-col items-center">
        <div className="text-sm font-bold text-amber-400 mb-1">{chord} (Baixo)</div>
        <div className="text-xs text-slate-400 mb-2">Tônica Fundamental: <span className="text-amber-300 font-bold">{bass.rootName}</span></div>
        <svg width={150} height={120} className="bg-slate-900/90 rounded border border-slate-700 p-2">
          {/* 4 horizontal bass strings */}
          {[1, 2, 3, 4].map((str, idx) => {
            const y = 25 + idx * 22;
            const stringNames = ['E (4ª)', 'A (3ª)', 'D (2ª)', 'G (1ª)'];
            return (
              <g key={`bstr-${str}`}>
                <text x={8} y={y + 4} fill="#94a3b8" fontSize="9" fontWeight="600">{stringNames[idx]}</text>
                <line x1={45} y1={y} x2={140} y2={y} stroke="#64748b" strokeWidth={5 - idx * 0.9} />
              </g>
            );
          })}
          {/* Fret lines */}
          {[45, 68, 92, 116, 140].map((x, idx) => (
            <line key={`bfret-${idx}`} x1={x} y1={25} x2={x} y2={91} stroke="#475569" strokeWidth={idx === 0 ? 3 : 1} />
          ))}
          {/* Root marker */}
          {bass.rootFret === 0 ? (
            <circle cx={40} cy={25 + (bass.rootString - 1) * 22} r={5} fill="none" stroke="#f59e0b" strokeWidth={2} />
          ) : (
            <g>
              <circle
                cx={45 + bass.rootFret * 24 - 12}
                cy={25 + (bass.rootString - 1) * 22}
                r={7}
                fill="#f59e0b"
              />
              <text
                x={45 + bass.rootFret * 24 - 12}
                y={25 + (bass.rootString - 1) * 22 + 3}
                textAnchor="middle"
                fill="#020617"
                fontSize="9"
                fontWeight="bold"
              >
                1
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // 3. UKULELE (4 CORDAS)
  if (instrument === 'ukulele') {
    const data = UKULELE_CHORDS[cleanChord] || { frets: [0, 0, 0, 0] };
    const numStrings = 4;
    const numFrets = 4;
    const fretWidth = 24;
    const fretHeight = 24;
    const startX = 35;
    const startY = 35;

    return (
      <div className="flex flex-col items-center">
        <div className="text-sm font-bold text-amber-400 mb-1">{chord} (Ukulele)</div>
        <svg width={width} height={height} className="bg-slate-900/90 rounded border border-slate-700">
          {/* Nut line */}
          <line
            x1={startX}
            y1={startY}
            x2={startX + (numStrings - 1) * fretWidth}
            y2={startY}
            stroke="#cbd5e1"
            strokeWidth={data.baseFret ? 1 : 4}
          />
          {/* Vertical strings */}
          {Array.from({ length: numStrings }).map((_, i) => (
            <line
              key={`str-${i}`}
              x1={startX + i * fretWidth}
              y1={startY}
              x2={startX + i * fretWidth}
              y2={startY + numFrets * fretHeight}
              stroke="#64748b"
              strokeWidth={1.5}
            />
          ))}
          {/* Horizontal frets */}
          {Array.from({ length: numFrets + 1 }).map((_, i) => (
            <line
              key={`fret-${i}`}
              x1={startX}
              y1={startY + i * fretHeight}
              x2={startX + (numStrings - 1) * fretWidth}
              y2={startY + i * fretHeight}
              stroke="#475569"
              strokeWidth={1}
            />
          ))}
          {/* Dots & Mutes */}
          {data.frets.map((fret, i) => {
            const x = startX + i * fretWidth;
            if (fret === 'x') {
              return (
                <text key={`mark-${i}`} x={x} y={startY - 8} textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">✕</text>
              );
            }
            if (fret === 0) {
              return (
                <circle key={`mark-${i}`} cx={x} cy={startY - 10} r={4} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
              );
            }
            const y = startY + (fret - 0.5) * fretHeight;
            return <circle key={`dot-${i}`} cx={x} cy={y} r={6} fill="#f59e0b" />;
          })}
        </svg>
      </div>
    );
  }

  // 4. VIOLÃO / GUITARRA (DEFAULT)
  const data = GUITAR_CHORDS[cleanChord] || { frets: ['x', 3, 2, 0, 1, 0] };
  const numStrings = 6;
  const numFrets = 5;
  const stringSpacing = 18;
  const fretSpacing = 22;
  const startX = 35;
  const startY = 38;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-bold text-amber-400 mb-1">{chord} (Violão)</div>
      <svg width={width} height={height} className="bg-slate-900/90 rounded border border-slate-700 shadow-md">
        {/* Base fret indication if higher up neck */}
        {data.baseFret && (
          <text x={startX - 15} y={startY + 16} fill="#38bdf8" fontSize="10" fontWeight="bold">
            {data.baseFret}ª
          </text>
        )}

        {/* Nut (Pestana de topo) */}
        <line
          x1={startX}
          y1={startY}
          x2={startX + (numStrings - 1) * stringSpacing}
          y2={startY}
          stroke={data.baseFret ? '#475569' : '#e2e8f0'}
          strokeWidth={data.baseFret ? 1.5 : 4}
        />

        {/* Strings */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`g-str-${i}`}
            x1={startX + i * stringSpacing}
            y1={startY}
            x2={startX + i * stringSpacing}
            y2={startY + numFrets * fretSpacing}
            stroke="#64748b"
            strokeWidth={1.8 - i * 0.2}
          />
        ))}

        {/* Frets */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`g-fret-${i}`}
            x1={startX}
            y1={startY + i * fretSpacing}
            x2={startX + (numStrings - 1) * stringSpacing}
            y2={startY + i * fretSpacing}
            stroke="#475569"
            strokeWidth={1}
          />
        ))}

        {/* Barre if applicable */}
        {data.barre && (
          <rect
            x={startX + (data.barre.fromString - 1) * stringSpacing - 4}
            y={startY + (1 - 0.7) * fretSpacing}
            width={(data.barre.toString - data.barre.fromString) * stringSpacing + 8}
            height={10}
            rx={5}
            fill="#f59e0b"
            opacity={0.9}
          />
        )}

        {/* String markers & Finger dots */}
        {data.frets.map((fret, i) => {
          const x = startX + i * stringSpacing;
          if (fret === 'x') {
            return (
              <text key={`g-mark-${i}`} x={x} y={startY - 8} textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">✕</text>
            );
          }
          if (fret === 0) {
            return (
              <circle key={`g-mark-${i}`} cx={x} cy={startY - 10} r={4} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
            );
          }
          const displayFret = data.baseFret ? fret - data.baseFret + 1 : fret;
          const y = startY + (displayFret - 0.5) * fretSpacing;
          const finger = data.fingers ? data.fingers[i] : null;

          return (
            <g key={`g-dot-${i}`}>
              <circle cx={x} cy={y} r={6.5} fill="#f59e0b" />
              {finger && finger > 0 && (
                <text x={x} y={y + 3.5} textAnchor="middle" fill="#020617" fontSize="9" fontWeight="bold">
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
