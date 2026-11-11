import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sliders, Music, Volume2, Sparkles } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

export const VirtualBand: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drums' | 'piano' | 'guitar'>('drums');

  // --- 1. DRUM SEQUENCER STATE (16 STEPS) ---
  const drumTracks = [
    { id: 'kick', name: 'Bumbo (Kick)', color: 'bg-amber-500' },
    { id: 'snare', name: 'Caixa (Snare)', color: 'bg-teal-500' },
    { id: 'hihat', name: 'Chimbal (Hi-Hat)', color: 'bg-cyan-400' },
    { id: 'clap', name: 'Palma (Clap)', color: 'bg-purple-500' },
    { id: 'tom', name: 'Tom/Surdo', color: 'bg-rose-500' },
  ] as const;

  type DrumTrackId = typeof drumTracks[number]['id'];

  // Initial grid 5 tracks x 16 steps
  const [grid, setGrid] = useState<Record<DrumTrackId, boolean[]>>({
    kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    clap: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    tom: [false, false, false, false, false, false, false, false, false, false, true, false, false, false, true, false],
  });

  const [isPlayingDrums, setIsPlayingDrums] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(105);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle drum play
  const toggleDrumPlay = () => {
    if (isPlayingDrums) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setIsPlayingDrums(false);
      setCurrentStep(0);
    } else {
      audioEngine.getContext();
      setIsPlayingDrums(true);
      setCurrentStep(0);
    }
  };

  useEffect(() => {
    if (!isPlayingDrums) return;

    // 16th notes: interval in ms = (60 / bpm / 4) * 1000
    const stepInterval = (60 / bpm / 4) * 1000;
    let step = 0;

    stepTimerRef.current = setInterval(() => {
      // Play sounds on this step
      (Object.keys(grid) as DrumTrackId[]).forEach((trackId) => {
        if (grid[trackId][step]) {
          audioEngine.playDrumSound(trackId);
        }
      });

      setCurrentStep(step);
      step = (step + 1) % 16;
    }, stepInterval);

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isPlayingDrums, bpm, grid]);

  // Load preset grooves
  const loadPreset = (preset: 'samba' | 'worship' | 'rock') => {
    if (preset === 'samba') {
      setBpm(105);
      setGrid({
        kick: [true, false, true, false, false, true, false, true, true, false, true, false, false, true, false, true],
        snare: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
        hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        tom: [false, true, false, false, false, false, false, true, false, true, false, false, false, false, false, true],
      });
    } else if (preset === 'worship') {
      setBpm(72);
      setGrid({
        kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        clap: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        tom: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
      });
    } else {
      setBpm(120);
      setGrid({
        kick: [true, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        tom: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true],
      });
    }
  };

  // --- 2. VIRTUAL PIANO STATE ---
  const [octaveOffset, setOctaveOffset] = useState(0); // -1, 0, +1
  const pianoKeys = [
    { note: 'C', midi: 60, isBlack: false, keyLabel: 'A' },
    { note: 'C#', midi: 61, isBlack: true, keyLabel: 'W' },
    { note: 'D', midi: 62, isBlack: false, keyLabel: 'S' },
    { note: 'D#', midi: 63, isBlack: true, keyLabel: 'E' },
    { note: 'E', midi: 64, isBlack: false, keyLabel: 'D' },
    { note: 'F', midi: 65, isBlack: false, keyLabel: 'F' },
    { note: 'F#', midi: 66, isBlack: true, keyLabel: 'T' },
    { note: 'G', midi: 67, isBlack: false, keyLabel: 'G' },
    { note: 'G#', midi: 68, isBlack: true, keyLabel: 'Y' },
    { note: 'A', midi: 69, isBlack: false, keyLabel: 'H' },
    { note: 'A#', midi: 70, isBlack: true, keyLabel: 'U' },
    { note: 'B', midi: 71, isBlack: false, keyLabel: 'J' },
    { note: 'C5', midi: 72, isBlack: false, keyLabel: 'K' },
  ];

  // --- 3. VIRTUAL GUITAR & BASS FRETBOARD ---
  const strings = [
    { name: 'E4', num: 1 },
    { name: 'B3', num: 2 },
    { name: 'G3', num: 3 },
    { name: 'D3', num: 4 },
    { name: 'A2', num: 5 },
    { name: 'E2', num: 6 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col max-w-4xl mx-auto">
      {/* Instrument Switcher Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" />
            Banda Virtual & Instrumentos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sons sintetizados em tempo real via Web Audio API. Funcionam 100% offline.
          </p>
        </div>

        <div className="flex gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('drums')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'drums' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bateria (16 Passos)
          </button>
          <button
            onClick={() => setActiveTab('piano')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'piano' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Piano / Teclado
          </button>
          <button
            onClick={() => setActiveTab('guitar')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'guitar' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Braço de Violão
          </button>
        </div>
      </div>

      {/* 1. DRUM SEQUENCER TAB */}
      {activeTab === 'drums' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDrumPlay}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs shadow transition ${
                  isPlayingDrums
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isPlayingDrums ? (
                  <>
                    <Pause className="w-4 h-4 fill-slate-950" /> Pausar Beat
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" /> Tocar Beat
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">BPM:</span>
                <input
                  type="number"
                  min="50"
                  max="180"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-400 font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1 font-medium">Ritmos Prontos:</span>
              <button
                onClick={() => loadPreset('samba')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold border border-slate-700"
              >
                Samba / Choro
              </button>
              <button
                onClick={() => loadPreset('worship')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold border border-slate-700"
              >
                Louvor / Balada
              </button>
              <button
                onClick={() => loadPreset('rock')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700"
              >
                Pop / Rock
              </button>
            </div>
          </div>

          {/* 16-Step Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[650px] space-y-2">
              {/* Step indicator header */}
              <div className="flex items-center gap-1 pl-32">
                {Array.from({ length: 16 }).map((_, stepIdx) => (
                  <div
                    key={stepIdx}
                    className={`flex-1 text-center font-mono text-[10px] py-0.5 rounded ${
                      currentStep === stepIdx && isPlayingDrums
                        ? 'bg-amber-400 text-slate-950 font-bold scale-110'
                        : stepIdx % 4 === 0
                        ? 'text-slate-300 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {stepIdx + 1}
                  </div>
                ))}
              </div>

              {/* Tracks */}
              {drumTracks.map((track) => (
                <div key={track.id} className="flex items-center gap-2">
                  <div className="w-30 text-xs font-semibold text-slate-300 truncate">
                    {track.name}
                  </div>
                  <div className="flex-1 flex gap-1">
                    {grid[track.id].map((active, stepIdx) => {
                      const isCurrent = currentStep === stepIdx && isPlayingDrums;
                      const isQuarterBeat = stepIdx % 4 === 0;

                      return (
                        <button
                          key={stepIdx}
                          type="button"
                          onClick={() => {
                            const updated = { ...grid };
                            updated[track.id][stepIdx] = !updated[track.id][stepIdx];
                            setGrid(updated);
                            if (updated[track.id][stepIdx]) {
                              audioEngine.playDrumSound(track.id);
                            }
                          }}
                          className={`flex-1 h-9 rounded-lg border transition-all ${
                            active
                              ? `${track.color} border-white/30 text-slate-950 shadow-sm`
                              : isQuarterBeat
                              ? 'bg-slate-950 border-slate-700/80 hover:bg-slate-800'
                              : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                          } ${isCurrent ? 'ring-2 ring-white scale-105' : ''}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PIANO TAB */}
      {activeTab === 'piano' && (
        <div className="flex flex-col items-center py-4 space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOctaveOffset((prev) => Math.max(-1, prev - 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              -1 Oitava
            </button>
            <span className="text-xs text-amber-400 font-mono font-bold">
              Oitava {octaveOffset > 0 ? `+${octaveOffset}` : octaveOffset}
            </span>
            <button
              onClick={() => setOctaveOffset((prev) => Math.min(1, prev + 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              +1 Oitava
            </button>
          </div>

          {/* Interactive Keyboard */}
          <div className="relative flex justify-center pb-6 select-none overflow-x-auto max-w-full">
            <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-2xl">
              {pianoKeys.map((key) => {
                const midi = key.midi + octaveOffset * 12;
                if (key.isBlack) {
                  return (
                    <button
                      key={key.note}
                      type="button"
                      onClick={() => audioEngine.playPianoNote(midi)}
                      className="absolute z-10 w-9 h-28 bg-slate-950 hover:bg-slate-800 active:bg-amber-500 rounded-b-md border border-slate-800 -ml-4.5 transition shadow-lg flex flex-col justify-end items-center pb-2"
                      style={{
                        left:
                          key.note === 'C#'
                            ? '68px'
                            : key.note === 'D#'
                            ? '116px'
                            : key.note === 'F#'
                            ? '212px'
                            : key.note === 'G#'
                            ? '260px'
                            : '308px',
                      }}
                    >
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{key.note}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={key.note}
                    type="button"
                    onClick={() => audioEngine.playPianoNote(midi)}
                    className="w-12 h-44 bg-slate-100 hover:bg-slate-200 active:bg-amber-300 rounded-b-xl border border-slate-300 mx-0.5 transition shadow flex flex-col justify-end items-center pb-3 text-slate-900"
                  >
                    <span className="text-xs font-bold font-mono">{key.note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. GUITAR FRETBOARD TAB */}
      {activeTab === 'guitar' && (
        <div className="py-4 space-y-4">
          <div className="text-xs text-slate-400 text-center mb-2">
            Toque nas casas das cordas para dedilhar notas de violão.
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[600px] bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl">
              {/* Frets 0 to 8 */}
              <div className="space-y-3">
                {strings.map((str) => (
                  <div key={str.name} className="flex items-center gap-2">
                    <span className="w-12 font-mono text-xs font-bold text-slate-400">
                      {str.name}
                    </span>
                    <div className="flex-1 flex gap-1 relative">
                      {/* String line behind frets */}
                      <div
                        className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-slate-600 pointer-events-none"
                        style={{ height: `${str.num * 0.5 + 1}px` }}
                      />
                      {Array.from({ length: 9 }).map((_, fret) => (
                        <button
                          key={fret}
                          type="button"
                          onClick={() => audioEngine.playGuitarPluck(str.num, fret)}
                          className={`flex-1 h-8 rounded border z-10 font-mono text-[10px] transition ${
                            fret === 0
                              ? 'bg-slate-800 border-slate-600 text-amber-400 font-bold'
                              : 'bg-slate-900/80 hover:bg-amber-500/20 active:bg-amber-500 active:text-slate-950 border-slate-700/80 text-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {fret === 0 ? 'Solta' : `${fret}ª`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
