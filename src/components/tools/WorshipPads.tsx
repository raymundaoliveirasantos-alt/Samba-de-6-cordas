import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Disc } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import { useAppStore } from '../../store';

export const WorshipPads: React.FC = () => {
  const { activeWorshipPadKey, setActiveWorshipPadKey } = useAppStore();
  const [volume, setVolume] = useState<number>(0.6);

  const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  const handleKeyClick = (key: string) => {
    if (activeWorshipPadKey === key) {
      // Turn off
      audioEngine.stopWorshipPad();
      setActiveWorshipPadKey(null);
    } else {
      // Switch or start key
      audioEngine.startWorshipPad(key, volume);
      setActiveWorshipPadKey(key);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setPadVolume(newVol);
  };

  const handleStopAll = () => {
    audioEngine.stopWorshipPad();
    setActiveWorshipPadKey(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col items-center max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full pb-3 border-b border-slate-800 mb-5">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Disc className="w-4 h-4 text-amber-400 animate-spin-slow" /> Pads de Adoração (Ambient)
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sustenta a atmosfera harmônica no fundo durante ministração e transições.
          </p>
        </div>
        {activeWorshipPadKey && (
          <button
            onClick={handleStopAll}
            className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 hover:bg-red-500/30 transition"
          >
            Parar Pad
          </button>
        )}
      </div>

      {/* 12 Key Grid */}
      <div className="grid grid-cols-4 gap-2.5 w-full mb-6">
        {keys.map((k) => {
          const isActive = activeWorshipPadKey === k;
          return (
            <button
              key={k}
              onClick={() => handleKeyClick(k)}
              className={`py-3.5 rounded-xl font-mono text-base font-bold transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-amber-500 text-slate-950 scale-105 shadow-xl shadow-amber-500/30 ring-2 ring-amber-300'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              )}
              {k}
            </button>
          );
        })}
      </div>

      {/* Volume Slider */}
      <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
        {volume === 0 ? (
          <VolumeX className="w-5 h-5 text-slate-500" />
        ) : (
          <Volume2 className="w-5 h-5 text-amber-400" />
        )}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Volume do Pad</span>
            <span className="font-mono text-amber-400 font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
