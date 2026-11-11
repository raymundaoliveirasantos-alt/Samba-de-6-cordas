import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Minus, Volume2, RefreshCw } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface MetronomeProps {
  initialBpm?: number;
  initialTimeSignature?: string;
}

export const Metronome: React.FC<MetronomeProps> = ({
  initialBpm = 100,
  initialTimeSignature = '4/4',
}) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [timeSignature, setTimeSignature] = useState<string>(initialTimeSignature);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  const tapTimesRef = useRef<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Time signature beats
  const beatsPerMeasure = parseInt(timeSignature.split('/')[0], 10) || 4;

  // Toggle metronome
  const togglePlay = () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      audioEngine.getContext(); // Ensure Web Audio is active
      setIsPlaying(true);
      setCurrentBeat(0);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = (60 / bpm) * 1000;
    let beat = 0;

    // Trigger first click immediately
    audioEngine.playClick(true);
    setCurrentBeat(1);

    timerRef.current = setInterval(() => {
      beat = (beat + 1) % beatsPerMeasure;
      const isAccent = beat === 0;
      audioEngine.playClick(isAccent);
      setCurrentBeat(beat + 1);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, beatsPerMeasure]);

  // Tap tempo handler
  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    taps.push(now);

    // Keep last 4 taps
    if (taps.length > 5) taps.shift();

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);

      if (calculatedBpm >= 30 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 flex flex-col items-center max-w-sm mx-auto">
      <div className="flex items-center justify-between w-full pb-3 border-b border-slate-800 mb-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Volume2 className="w-4 h-4" /> Metrônomo Digital
        </span>
        <select
          value={timeSignature}
          onChange={(e) => {
            setTimeSignature(e.target.value);
            setCurrentBeat(0);
          }}
          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-amber-300 focus:outline-none"
        >
          <option value="2/4">2/4 (Samba / Marcha)</option>
          <option value="3/4">3/4 (Valsa)</option>
          <option value="4/4">4/4 (Louvor / Pop)</option>
          <option value="6/8">6/8 (Balada Ternária)</option>
        </select>
      </div>

      {/* Visual Beats Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
          const beatNum = idx + 1;
          const isActive = currentBeat === beatNum && isPlaying;
          const isAccentBeat = idx === 0;

          return (
            <div
              key={idx}
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-75 ${
                isActive
                  ? isAccentBeat
                    ? 'bg-amber-400 text-slate-950 scale-125 shadow-lg shadow-amber-400/50'
                    : 'bg-emerald-400 text-slate-950 scale-110 shadow-md shadow-emerald-400/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {beatNum}
            </div>
          );
        })}
      </div>

      {/* BPM Display & +/- Controls */}
      <div className="flex items-center justify-center gap-4 my-2">
        <button
          onClick={() => setBpm((prev) => Math.max(30, prev - 1))}
          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-lg font-bold transition"
          aria-label="Diminuir BPM"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="text-center w-28">
          <div className="text-5xl font-black font-mono tracking-tight text-slate-100">
            {bpm}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Batidas / Min
          </div>
        </div>

        <button
          onClick={() => setBpm((prev) => Math.min(240, prev + 1))}
          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-lg font-bold transition"
          aria-label="Aumentar BPM"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Slider */}
      <div className="w-full px-4 my-3">
        <input
          type="range"
          min="30"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
          <span>Largo (40)</span>
          <span>Andante (80)</span>
          <span>Moderato (108)</span>
          <span>Allegro (140)</span>
          <span>Presto (180)</span>
        </div>
      </div>

      {/* Action Buttons: Play/Pause and Tap Tempo */}
      <div className="flex items-center gap-3 w-full mt-4">
        <button
          onClick={togglePlay}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition shadow-lg ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300/40'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-slate-950" /> Parar
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" /> Iniciar
            </>
          )}
        </button>

        <button
          onClick={handleTapTempo}
          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 transition"
        >
          Tap Tempo
        </button>
      </div>
    </div>
  );
};
