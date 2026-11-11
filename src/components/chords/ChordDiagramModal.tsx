import React, { useState } from 'react';
import { Volume2, X, Music } from 'lucide-react';
import { SvgChordDiagram } from './SvgChordDiagram';
import { audioEngine } from '../../utils/audioEngine';
import { chordToNashville } from '../../utils/transposer';
import type { SupportedInstrument } from '../../utils/chordDiagrams';

interface ChordDiagramModalProps {
  chord: string | null;
  songKey?: string;
  defaultInstrument?: SupportedInstrument;
  onClose: () => void;
}

export const ChordDiagramModal: React.FC<ChordDiagramModalProps> = ({
  chord,
  songKey = 'C',
  defaultInstrument = 'violao',
  onClose,
}) => {
  const [instrument, setInstrument] = useState<SupportedInstrument>(defaultInstrument);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!chord) return null;

  const handlePlaySound = () => {
    setIsPlaying(true);
    audioEngine.playChord(chord);
    setTimeout(() => setIsPlaying(false), 800);
  };

  const nashvilleDegree = chordToNashville(chord, songKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">{chord}</span>
            {songKey && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Grau {nashvilleDegree} em {songKey}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instrument Switcher Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 my-4 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-medium">
          <button
            onClick={() => setInstrument('violao')}
            className={`py-1.5 rounded-lg transition ${
              instrument === 'violao' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Violão
          </button>
          <button
            onClick={() => setInstrument('cavaquinho')}
            className={`py-1.5 rounded-lg transition ${
              instrument === 'cavaquinho' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cavaco
          </button>
          <button
            onClick={() => setInstrument('baixo')}
            className={`py-1.5 rounded-lg transition ${
              instrument === 'baixo' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Baixo
          </button>
          <button
            onClick={() => setInstrument('teclado')}
            className={`py-1.5 rounded-lg transition ${
              instrument === 'teclado' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Teclado
          </button>
          <button
            onClick={() => setInstrument('ukulele')}
            className={`py-1.5 rounded-lg transition ${
              instrument === 'ukulele' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ukulele
          </button>
        </div>

        {/* SVG Diagram Canvas */}
        <div className="flex justify-center py-2">
          <SvgChordDiagram chord={chord} instrument={instrument} />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={handlePlaySound}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition ${
              isPlaying
                ? 'bg-amber-400 text-slate-950 scale-98 ring-2 ring-amber-300'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:shadow-amber-500/20'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
            {isPlaying ? 'Tocando...' : 'Ouvir Acorde'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
