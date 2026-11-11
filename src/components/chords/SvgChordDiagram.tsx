import React from 'react';
import {
  GUITAR_CHORDS,
  CAVAQUINHO_CHORDS,
  UKULELE_CHORDS,
  getKeyboardChordNotes,
  getBassChordInfo,
  SupportedInstrument,
} from '../../utils/chordDiagrams';

interface SvgChordDiagramProps {
  chord: string;
  instrument?: SupportedInstrument;
  width?: number;
  height?: number;
  compact?: boolean;
}

export const SvgChordDiagram: React.FC<SvgChordDiagramProps> = ({
  chord,
  instrument = 'violao',
  width = 160,
  height = 200,
  compact = false,
}) => {
  const cleanChord = chord.split('/')[0].trim();

  // 1. CAVAQUINHO (4 CORDAS: D - G - B - D / Ré - Sol - Si - Ré)
  if (instrument === 'cavaquinho') {
    const data = CAVAQUINHO_CHORDS[cleanChord] || { frets: [0, 0, 0, 0] };
    const numStrings = 4;
    const numFrets = 4;
    const fretWidth = compact ? 18 : 24;
    const fretHeight = compact ? 18 : 24;
    const startX = compact ? 22 : 32;
    const startY = compact ? 24 : 34;
    const svgW = compact ? 100 : width;
    const svgH = compact ? 120 : height;

    const stringNames = ['D (4ª)', 'G (3ª)', 'B (2ª)', 'D (1ª)'];

    return (
      <div className="flex flex-col items-center">
        {!compact && (
          <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
            <span>{chord}</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">(Cavaquinho D-G-B-D)</span>
          </div>
        )}
        <svg width={svgW} height={svgH} className="bg-slate-900/90 rounded-xl border border-slate-700/80 shadow-md">
          {/* Base fret indication if higher up neck */}
          {data.baseFret && (
            <text x={startX - 14} y={startY + 15} fill="#38bdf8" fontSize="10" fontWeight="bold">
              {data.baseFret}ª
            </text>
          )}

          {/* Nut line */}
          <line
            x1={startX}
            y1={startY}
            x2={startX + (numStrings - 1) * fretWidth}
            y2={startY}
            stroke={data.baseFret ? '#475569' : '#e2e8f0'}
            strokeWidth={data.baseFret ? 1.5 : 4}
          />

          {/* Vertical strings */}
          {Array.from({ length: numStrings }).map((_, i) => (
            <line
              key={`cav-str-${i}`}
              x1={startX + i * fretWidth}
              y1={startY}
              x2={startX + i * fretWidth}
              y2={startY + numFrets * fretHeight}
              stroke="#64748b"
              strokeWidth={1.8 - i * 0.2}
            />
          ))}

          {/* Horizontal frets */}
          {Array.from({ length: numFrets + 1 }).map((_, i) => (
            <line
              key={`cav-fret-${i}`}
              x1={startX}
              y1={startY + i * fretHeight}
              x2={startX + (numStrings - 1) * fretWidth}
              y2={startY + i * fretHeight}
              stroke="#475569"
              strokeWidth={1}
            />
          ))}

          {/* Barre if applicable */}
          {data.barre && (
            <rect
              x={startX + (data.barre.fromString - 1) * fretWidth - 4}
              y={startY + (1 - 0.7) * fretHeight}
              width={(data.barre.toString - data.barre.fromString) * fretWidth + 8}
              height={8}
              rx={4}
              fill="#f59e0b"
              opacity={0.9}
            />
          )}

          {/* String markers & Finger dots */}
          {data.frets.map((fret, i) => {
            const x = startX + i * fretWidth;
            if (fret === 'x') {
              return (
                <text key={`cav-m-${i}`} x={x} y={startY - 6} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">✕</text>
              );
            }
            if (fret === 0) {
              return (
                <circle key={`cav-m-${i}`} cx={x} cy={startY - 8} r={3.5} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
              );
            }
            const displayFret = data.baseFret ? fret - data.baseFret + 1 : fret;
            const y = startY + (displayFret - 0.5) * fretHeight;
            const finger = data.fingers ? data.fingers[i] : null;

            return (
              <g key={`cav-dot-${i}`}>
                <circle cx={x} cy={y} r={compact ? 5 : 6.5} fill="#f59e0b" />
                {!compact && finger && finger > 0 && (
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
  }

  // 2. CONTRABAIXO (4 CORDAS - E-A-D-G COM TÔNICA, QUINTA E TERÇA)
  if (instrument === 'baixo') {
    const bass = getBassChordInfo(cleanChord);
    const svgW = compact ? 130 : 180;
    const svgH = compact ? 110 : 140;

    return (
      <div className="flex flex-col items-center">
        {!compact && (
          <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
            <span>{chord}</span>
            <span className="text-[10px] text-slate-400 font-normal">(Contrabaixo 4 Cordas)</span>
          </div>
        )}

        <svg width={svgW} height={svgH} className="bg-slate-900/90 rounded-xl border border-slate-700/80 p-2 shadow-md">
          {/* 4 horizontal bass strings: E(4ª), A(3ª), D(2ª), G(1ª) */}
          {[1, 2, 3, 4].map((str, idx) => {
            const y = 24 + idx * 20;
            const stringLabels = ['E (4ª)', 'A (3ª)', 'D (2ª)', 'G (1ª)'];
            return (
              <g key={`bstr-${str}`}>
                <text x={4} y={y + 3.5} fill="#94a3b8" fontSize="8" fontWeight="600">{stringLabels[idx]}</text>
                <line x1={36} y1={y} x2={svgW - 12} y2={y} stroke="#64748b" strokeWidth={4.5 - idx * 0.9} />
              </g>
            );
          })}

          {/* Fret lines: Casa 0 (Nut) e Casas 1, 2, 3, 4, 5 */}
          {[36, 62, 88, 114, 140, 166].map((x, idx) => (
            <line
              key={`bfret-${idx}`}
              x1={x}
              y1={24}
              x2={x}
              y2={84}
              stroke={idx === 0 ? '#cbd5e1' : '#475569'}
              strokeWidth={idx === 0 ? 3 : 1}
            />
          ))}

          {/* 1. Fundamental / Tônica (Amber) */}
          {bass.rootFret === 0 ? (
            <circle cx={32} cy={24 + (bass.rootString - 1) * 20} r={5} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
          ) : (
            <g>
              <circle
                cx={36 + bass.rootFret * 26 - 13}
                cy={24 + (bass.rootString - 1) * 20}
                r={compact ? 5.5 : 7}
                fill="#f59e0b"
              />
              <text
                x={36 + bass.rootFret * 26 - 13}
                y={24 + (bass.rootString - 1) * 20 + 3}
                textAnchor="middle"
                fill="#020617"
                fontSize="8"
                fontWeight="bold"
              >
                1
              </text>
            </g>
          )}

          {/* 2. Quinta Justa (Cyan) - Baixaria / Walking Bass */}
          {bass.fifthFret <= 5 && (
            <g>
              <circle
                cx={36 + bass.fifthFret * 26 - 13}
                cy={24 + (bass.fifthString - 1) * 20}
                r={compact ? 4.5 : 6}
                fill="#06b6d4"
              />
              <text
                x={36 + bass.fifthFret * 26 - 13}
                y={24 + (bass.fifthString - 1) * 20 + 2.5}
                textAnchor="middle"
                fill="#020617"
                fontSize="7.5"
                fontWeight="bold"
              >
                5
              </text>
            </g>
          )}

          {/* 3. Terça (Emerald) */}
          {bass.thirdFret <= 5 && bass.thirdFret > 0 && (
            <g>
              <circle
                cx={36 + bass.thirdFret * 26 - 13}
                cy={24 + (bass.thirdString - 1) * 20}
                r={compact ? 4.5 : 5.5}
                fill="#10b981"
              />
              <text
                x={36 + bass.thirdFret * 26 - 13}
                y={24 + (bass.thirdString - 1) * 20 + 2.5}
                textAnchor="middle"
                fill="#020617"
                fontSize="7"
                fontWeight="bold"
              >
                3
              </text>
            </g>
          )}

          {/* Legend */}
          {!compact && (
            <g transform="translate(6, 116)">
              <circle cx={4} cy={0} r={4} fill="#f59e0b" />
              <text x={12} y={3} fill="#cbd5e1" fontSize="8">Tônica: {bass.rootName}</text>
              <circle cx={72} cy={0} r={4} fill="#06b6d4" />
              <text x={80} y={3} fill="#cbd5e1" fontSize="8">5ª: {bass.fifthName}</text>
              <circle cx={124} cy={0} r={4} fill="#10b981" />
              <text x={132} y={3} fill="#cbd5e1" fontSize="8">3ª: {bass.thirdName}</text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // 3. TECLADO / PIANO
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

    const keyWidth = compact ? 10 : 14;
    const keyHeight = compact ? 50 : 70;
    const blackHeight = compact ? 30 : 44;

    return (
      <div className="flex flex-col items-center">
        {!compact && <div className="text-xs font-bold text-amber-400 mb-1">{chord} (Teclado)</div>}
        <svg width={whiteKeys.length * keyWidth + 4} height={keyHeight + 10} className="bg-slate-900 rounded-xl p-1 border border-slate-700 shadow-md">
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
                    cy={keyHeight - 8}
                    r={2.5}
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

  // 4. UKULELE (4 CORDAS: G-C-E-A)
  if (instrument === 'ukulele') {
    const data = UKULELE_CHORDS[cleanChord] || { frets: [0, 0, 0, 0] };
    const numStrings = 4;
    const numFrets = 4;
    const fretWidth = compact ? 18 : 24;
    const fretHeight = compact ? 18 : 24;
    const startX = compact ? 22 : 32;
    const startY = compact ? 24 : 34;

    return (
      <div className="flex flex-col items-center">
        {!compact && <div className="text-xs font-bold text-amber-400 mb-1">{chord} (Ukulele)</div>}
        <svg width={compact ? 100 : width} height={compact ? 120 : height} className="bg-slate-900/90 rounded-xl border border-slate-700 shadow-md">
          <line
            x1={startX}
            y1={startY}
            x2={startX + (numStrings - 1) * fretWidth}
            y2={startY}
            stroke={data.baseFret ? '#475569' : '#cbd5e1'}
            strokeWidth={data.baseFret ? 1 : 4}
          />
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
          {data.frets.map((fret, i) => {
            const x = startX + i * fretWidth;
            if (fret === 'x') {
              return (
                <text key={`mark-${i}`} x={x} y={startY - 6} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">✕</text>
              );
            }
            if (fret === 0) {
              return (
                <circle key={`mark-${i}`} cx={x} cy={startY - 8} r={3.5} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
              );
            }
            const y = startY + (fret - 0.5) * fretHeight;
            return <circle key={`dot-${i}`} cx={x} cy={y} r={compact ? 5 : 6} fill="#f59e0b" />;
          })}
        </svg>
      </div>
    );
  }

  // 5. VIOLÃO / GUITARRA (DEFAULT - 6 CORDAS: E-A-D-G-B-E)
  const data = GUITAR_CHORDS[cleanChord] || { frets: ['x', 3, 2, 0, 1, 0] };
  const numStrings = 6;
  const numFrets = 5;
  const stringSpacing = compact ? 14 : 18;
  const fretSpacing = compact ? 16 : 22;
  const startX = compact ? 24 : 34;
  const startY = compact ? 26 : 38;
  const svgW = compact ? 115 : width;
  const svgH = compact ? 130 : height;

  return (
    <div className="flex flex-col items-center">
      {!compact && (
        <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
          <span>{chord}</span>
          <span className="text-[10px] text-slate-400 font-normal">(Violão 6 Cordas)</span>
        </div>
      )}
      <svg width={svgW} height={svgH} className="bg-slate-900/90 rounded-xl border border-slate-700 shadow-md">
        {data.baseFret && (
          <text x={startX - 14} y={startY + 15} fill="#38bdf8" fontSize="10" fontWeight="bold">
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
            height={compact ? 8 : 10}
            rx={4}
            fill="#f59e0b"
            opacity={0.9}
          />
        )}

        {/* String markers & Finger dots */}
        {data.frets.map((fret, i) => {
          const x = startX + i * stringSpacing;
          if (fret === 'x') {
            return (
              <text key={`g-mark-${i}`} x={x} y={startY - 6} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">✕</text>
            );
          }
          if (fret === 0) {
            return (
              <circle key={`g-mark-${i}`} cx={x} cy={startY - 8} r={3.5} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
            );
          }
          const displayFret = data.baseFret ? fret - data.baseFret + 1 : fret;
          const y = startY + (displayFret - 0.5) * fretSpacing;
          const finger = data.fingers ? data.fingers[i] : null;

          return (
            <g key={`g-dot-${i}`}>
              <circle cx={x} cy={y} r={compact ? 5 : 6.5} fill="#f59e0b" />
              {!compact && finger && finger > 0 && (
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
