import React, { useState } from 'react';
import { Sliders, Volume2, Mic, Disc } from 'lucide-react';
import { Metronome } from '../components/tools/Metronome';
import { Tuner } from '../components/tools/Tuner';
import { WorshipPads } from '../components/tools/WorshipPads';

export const ToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'metronome' | 'tuner' | 'pads'>('metronome');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Sliders className="w-7 h-7 text-amber-400" />
          Ferramentas para Músicos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Metrônomo preciso com tap tempo, afinador cromático via microfone e pads harmônicos de adoração.
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex justify-center md:justify-start">
        <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1.5 text-xs font-bold gap-1 shadow-lg">
          <button
            onClick={() => setActiveTool('metronome')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition ${
              activeTool === 'metronome'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Metrônomo
          </button>
          <button
            onClick={() => setActiveTool('tuner')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition ${
              activeTool === 'tuner'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            Afinador Cromático
          </button>
          <button
            onClick={() => setActiveTool('pads')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition ${
              activeTool === 'pads'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-4 h-4" />
            Pads de Adoração
          </button>
        </div>
      </div>

      {/* Active Tool Body */}
      <div className="pt-2">
        {activeTool === 'metronome' && <Metronome />}
        {activeTool === 'tuner' && <Tuner />}
        {activeTool === 'pads' && <WorshipPads />}
      </div>
    </div>
  );
};
