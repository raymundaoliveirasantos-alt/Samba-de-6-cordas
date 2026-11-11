// Web Audio API engine for Metronome, Tuner, Worship Pads, Virtual Instruments & Chord Playback

class AudioEngine {
  private ctx: AudioContext | null = null;
  private padGain: GainNode | null = null;
  private padOscillators: OscillatorNode[] = [];
  private currentPadKey: string | null = null;

  // Ensure AudioContext is initialized after user gesture
  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- 1. CHORD STRUMMER (Audio preview of chords) ---
  public playChord(chord: string) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Note frequency map
      const noteFreqs: Record<string, number> = {
        C: 130.81, 'C#': 138.59, Db: 138.59, D: 146.83, 'D#': 155.56, Eb: 155.56,
        E: 164.81, F: 174.61, 'F#': 185.00, Gb: 185.00, G: 196.00, 'G#': 207.65,
        Ab: 207.65, A: 220.00, 'A#': 233.08, Bb: 233.08, B: 246.94
      };

      const rootMatch = chord.match(/^[A-G][#b]?/);
      const root = rootMatch ? rootMatch[0] : 'C';
      const baseFreq = noteFreqs[root] || 130.81;

      // Simple intervals for major, minor, 7, etc.
      let semitones = [0, 4, 7, 12, 16]; // Major chord spread
      if (chord.includes('m') && !chord.includes('maj')) semitones = [0, 3, 7, 12, 15];
      if (chord.includes('7') && !chord.includes('7M')) semitones = [0, 4, 7, 10, 16];
      if (chord.includes('7M') || chord.includes('maj7')) semitones = [0, 4, 7, 11, 16];

      // Strum each note with slight delay (like picking strings)
      semitones.forEach((semi, idx) => {
        const freq = baseFreq * Math.pow(2, semi / 12);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 1.5);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // --- 2. METRONOME CLICK ---
  public playClick(isAccent: boolean) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // High pitch for beat 1 accent, standard pitch for other beats
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);

      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isAccent ? 0.08 : 0.05));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Metronome click error:', e);
    }
  }

  // --- 3. WORSHIP AMBIENT PADS ---
  public startWorshipPad(key: string, volume: number = 0.5) {
    try {
      const ctx = this.getContext();
      this.stopWorshipPad();

      this.currentPadKey = key;
      const now = ctx.currentTime;

      const noteFreqs: Record<string, number> = {
        C: 130.81, 'C#': 138.59, Db: 138.59, D: 146.83, 'D#': 155.56, Eb: 155.56,
        E: 164.81, F: 174.61, 'F#': 185.00, Gb: 185.00, G: 196.00, 'G#': 207.65,
        Ab: 207.65, A: 220.00, 'A#': 233.08, Bb: 233.08, B: 246.94
      };

      const base = noteFreqs[key] || 130.81;
      const fifth = base * 1.4983; // Perfect 5th
      const octave = base * 2.0;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      this.padGain = ctx.createGain();
      this.padGain.gain.setValueAtTime(0.001, now);
      this.padGain.gain.linearRampToValueAtTime(volume * 0.4, now + 2.5); // Warm slow fade-in

      const freqs = [base, base * 1.002, fifth, fifth * 0.998, octave];
      this.padOscillators = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(filter);
        osc.start(now);
        return osc;
      });

      filter.connect(this.padGain);
      this.padGain.connect(ctx.destination);
    } catch (e) {
      console.warn('Pad start error:', e);
    }
  }

  public setPadVolume(volume: number) {
    if (this.padGain && this.ctx) {
      this.padGain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    }
  }

  public stopWorshipPad() {
    if (this.padGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.padGain.gain.linearRampToValueAtTime(0.001, now + 1.2);
      setTimeout(() => {
        this.padOscillators.forEach((osc) => {
          try { osc.stop(); osc.disconnect(); } catch {}
        });
        this.padOscillators = [];
        this.currentPadKey = null;
      }, 1300);
    }
  }

  public getCurrentPadKey(): string | null {
    return this.currentPadKey;
  }

  // --- 4. VIRTUAL INSTRUMENTS (Piano, Guitar, Drum Sequencer) ---

  // Piano single note
  public playPianoNote(midiNote: number, duration: number = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {}
  }

  // Guitar pluck
  public playGuitarPluck(stringNum: number, fret: number) {
    // Standard tuning MIDI: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
    const stringBaseMidi = [64, 59, 55, 50, 45, 40]; // 1 to 6 (high E to low E)
    const base = stringBaseMidi[stringNum - 1] || 40;
    const midi = base + fret;
    this.playPianoNote(midi, 1.2);
  }

  // Drum synthesis: kick, snare, hihat, clap, tom
  public playDrumSound(type: 'kick' | 'snare' | 'hihat' | 'clap' | 'tom') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      if (type === 'kick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'snare') {
        // Noise + tone
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        oscGain.gain.setValueAtTime(0.7, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);

        // White noise burst
        const bufferSize = ctx.sampleRate * 0.18;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'hihat') {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'clap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(350, now);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'tom') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch {}
  }
}

export const audioEngine = new AudioEngine();

// --- 5. TUNER PITCH DETECTION ALGORITHM (Autocorrelation) ---
export interface PitchResult {
  frequency: number;
  note: string;
  octave: number;
  cents: number; // Deviation from in-tune: -50 to +50
  inTune: boolean;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // If too quiet, ignore
  if (rms < 0.012) return -1;

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmedBuf = buf.slice(r1, r2);
  const c = new Array(trimmedBuf.length).fill(0);

  for (let i = 0; i < trimmedBuf.length; i++) {
    for (let j = 0; j < trimmedBuf.length - i; j++) {
      c[i] = c[i] + trimmedBuf[j] * trimmedBuf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < trimmedBuf.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

export function frequencyToPitch(freq: number, a4Ref = 440): PitchResult | null {
  if (freq < 30 || freq > 2500) return null;

  const halfStepsFromA4 = 12 * (Math.log(freq / a4Ref) / Math.log(2));
  const midi = Math.round(halfStepsFromA4) + 69;
  const noteIndex = (midi % 12 + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const idealFreq = a4Ref * Math.pow(2, (midi - 69) / 12);
  const cents = Math.floor(1200 * (Math.log(freq / idealFreq) / Math.log(2)));

  return {
    frequency: Math.round(freq * 10) / 10,
    note: NOTE_NAMES[noteIndex],
    octave,
    cents,
    inTune: Math.abs(cents) <= 4,
  };
}
