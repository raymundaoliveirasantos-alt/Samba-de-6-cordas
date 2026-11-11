import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { audioEngine, autoCorrelate, frequencyToPitch, type PitchResult } from '../../utils/audioEngine';

export const Tuner: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [pitchData, setPitchData] = useState<PitchResult | null>(null);
  const [a4Ref, setA4Ref] = useState(440);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [instrumentPreset, setInstrumentPreset] = useState<'violao' | 'baixo' | 'ukulele'>('violao');

  const audioStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const presets = {
    violao: [
      { note: 'E', octave: 2, freq: 82.41, label: '6ª Mi (E2)' },
      { note: 'A', octave: 2, freq: 110.0, label: '5ª Lá (A2)' },
      { note: 'D', octave: 3, freq: 146.83, label: '4ª Ré (D3)' },
      { note: 'G', octave: 3, freq: 196.0, label: '3ª Sol (G3)' },
      { note: 'B', octave: 3, freq: 246.94, label: '2ª Si (B3)' },
      { note: 'E', octave: 4, freq: 329.63, label: '1ª Mi (E4)' },
    ],
    baixo: [
      { note: 'E', octave: 1, freq: 41.2, label: '4ª Mi (E1)' },
      { note: 'A', octave: 1, freq: 55.0, label: '3ª Lá (A1)' },
      { note: 'D', octave: 2, freq: 73.42, label: '2ª Ré (D2)' },
      { note: 'G', octave: 2, freq: 98.0, label: '1ª Sol (G2)' },
    ],
    ukulele: [
      { note: 'G', octave: 4, freq: 392.0, label: '4ª Sol (G4)' },
      { note: 'C', octave: 4, freq: 261.63, label: '3ª Dó (C4)' },
      { note: 'E', octave: 4, freq: 329.63, label: '2ª Mi (E4)' },
      { note: 'A', octave: 4, freq: 440.0, label: '1ª Lá (A4)' },
    ],
  };

  const startListening = async () => {
    setErrorMsg(null);
    try {
      const ctx = audioEngine.getContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);

      const buf = new Float32Array(analyser.fftSize);

      const updatePitch = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, ctx.sampleRate);

        if (freq !== -1) {
          const result = frequencyToPitch(freq, a4Ref);
          if (result) setPitchData(result);
        }

        animFrameRef.current = requestAnimationFrame(updatePitch);
      };

      updatePitch();
    } catch (err: any) {
      console.warn('Erro ao acessar microfone:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Permissão do microfone foi negada. Permita o acesso ao microfone nas configurações do seu navegador para afinar seu instrumento.');
      } else {
        setErrorMsg('Microfone indisponível ou não detectado. Você pode utilizar a referência sonora das cordas abaixo.');
      }
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsListening(false);
    setPitchData(null);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Play reference pitch for a string
  const playReferencePitch = (freq: number) => {
    try {
      const ctx = audioEngine.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.6);
    } catch {}
  };

  // Needle angle (-50 cents = -45 deg, +50 cents = +45 deg)
  const cents = pitchData?.cents ?? 0;
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const needleDeg = (clampedCents / 50) * 45;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col items-center max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full pb-3 border-b border-slate-800 mb-5">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Mic className="w-4 h-4" /> Afinador Cromático
        </span>

        {/* A4 calibration */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-xs">
          <span className="text-slate-400">A4:</span>
          <select
            value={a4Ref}
            onChange={(e) => setA4Ref(parseInt(e.target.value, 10))}
            className="bg-transparent text-amber-300 font-mono font-bold focus:outline-none"
          >
            {[432, 438, 440, 442, 444].map((f) => (
              <option key={f} value={f} className="bg-slate-900">
                {f} Hz
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Needle Gauge / Meter */}
      <div className="relative w-64 h-32 flex flex-col items-center justify-end overflow-hidden mb-2">
        {/* Arc Background */}
        <div className="absolute inset-0 border-t-8 border-slate-800 rounded-t-full" />

        {/* Center In-tune Sweet Spot */}
        <div className="absolute top-0 w-8 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />

        {/* Rotating Needle */}
        <div
          className="absolute bottom-0 w-1.5 h-24 bg-amber-400 rounded-full origin-bottom transition-transform duration-100 ease-out shadow-lg"
          style={{ transform: `rotate(${needleDeg}deg)` }}
        />

        {/* Center Pivot Point */}
        <div className="w-5 h-5 rounded-full bg-slate-950 border-2 border-amber-400 z-10" />
      </div>

      {/* Cents Offset Display */}
      <div className="flex items-center justify-between w-48 text-xs font-mono text-slate-500 mb-4">
        <span>-50¢</span>
        <span className={pitchData?.inTune ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
          {pitchData ? `${pitchData.cents > 0 ? '+' : ''}${pitchData.cents} cents` : '0 cents'}
        </span>
        <span>+50¢</span>
      </div>

      {/* Primary Note Detection Card */}
      <div className="w-full text-center py-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-5">
        {pitchData ? (
          <div>
            <div className="text-5xl font-black font-mono text-amber-400 flex items-center justify-center gap-1">
              {pitchData.note}
              <span className="text-xl text-slate-500 font-normal">{pitchData.octave}</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              {pitchData.frequency} Hz
            </div>
            {pitchData.inTune ? (
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" /> Afinado!
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-400">
                {pitchData.cents > 0 ? 'Aperte a corda (Muito alta)' : 'Afrouxe ou estique (Muito baixa)'}
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 text-slate-500 text-sm italic">
            {isListening ? 'Toque uma corda para detectar...' : 'Microfone desligado'}
          </div>
        )}
      </div>

      {/* Toggle Mic Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-lg transition ${
          isListening
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4" /> Desligar Afinador
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" /> Ligar Microfone
          </>
        )}
      </button>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 text-left">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* String reference sound buttons */}
      <div className="w-full mt-6 pt-5 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400">Ouvir Afinação das Cordas</span>
          <div className="flex gap-1 text-xs">
            {(['violao', 'baixo', 'ukulele'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setInstrumentPreset(p)}
                className={`px-2 py-0.5 rounded capitalize ${
                  instrumentPreset === p
                    ? 'bg-slate-800 text-amber-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {presets[instrumentPreset].map((str) => (
            <button
              key={str.label}
              onClick={() => playReferencePitch(str.freq)}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 text-xs font-mono font-bold transition flex flex-col items-center gap-0.5"
            >
              <span>{str.note}{str.octave}</span>
              <span className="text-[10px] text-slate-500 font-normal">{str.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
