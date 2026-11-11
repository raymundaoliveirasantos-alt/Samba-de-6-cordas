import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Tv, RefreshCw } from 'lucide-react';
import { liveSync, type SyncMessage } from '../utils/syncChannel';
import { parseChordPro } from '../utils/chordPro';

interface Slide {
  sectionTitle: string;
  lines: string[];
}

export const ProjectionView: React.FC = () => {
  const [songTitle, setSongTitle] = useState('Amazing Grace (Graça Maravilhosa)');
  const [songArtist, setSongArtist] = useState('John Newton');
  const [slides, setSlides] = useState<Slide[]>([
    {
      sectionTitle: 'Verso 1',
      lines: ['Amazing grace, how sweet the sound', 'That saved a wretch like me!', 'I once was lost, but now am found,', 'Was blind, but now I see.'],
    },
    {
      sectionTitle: 'Refrão',
      lines: ["'Twas grace that taught my heart to fear,", 'And grace my fears relieved;', 'How precious did that grace appear', 'The hour I first believed!'],
    },
    {
      sectionTitle: 'Ponte',
      lines: ['Through many dangers, toils and snares', 'I have already come;', "'Tis grace hath brought me safe thus far,", 'And grace will lead me home.'],
    },
  ]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [bgStyle, setBgStyle] = useState<'dark' | 'gradient' | 'navy'>('gradient');

  // Convert ChordPro content into clean lyrics-only section slides
  const buildSlidesFromChordPro = (content: string): Slide[] => {
    if (!content) return [];
    const parsed = parseChordPro(content);
    const result: Slide[] = [];

    let currentSection = 'Verso';
    let currentLines: string[] = [];

    parsed.lines.forEach((line: any) => {
      if (line.type === 'section_start') {
        if (currentLines.length > 0) {
          result.push({ sectionTitle: currentSection, lines: [...currentLines] });
          currentLines = [];
        }
        currentSection = line.sectionName || 'Refrão';
      } else if (line.type === 'section_end') {
        if (currentLines.length > 0) {
          result.push({ sectionTitle: currentSection, lines: [...currentLines] });
          currentLines = [];
        }
        currentSection = 'Verso';
      } else if (line.type === 'chord_lyric') {
        // Extract pure lyric without chords
        const text = line.tokens?.map((t: any) => t.lyric).join('').trim();
        if (text) {
          currentLines.push(text);
        }
      }
    });

    if (currentLines.length > 0) {
      result.push({ sectionTitle: currentSection, lines: currentLines });
    }

    return result.length > 0 ? result : [{ sectionTitle: 'Letra', lines: ['(Letra da música)'] }];
  };

  // Listen to live BroadcastChannel sync events
  useEffect(() => {
    const unsubscribe = liveSync.subscribe((msg: SyncMessage) => {
      if (msg.type === 'CURRENT_SONG_CHANGED') {
        const payload = msg.payload;
        if (payload) {
          setSongTitle(payload.title || 'Música');
          setSongArtist(payload.artist || '');
          if (payload.content) {
            const newSlides = buildSlidesFromChordPro(payload.content);
            setSlides(newSlides);
            setCurrentSlideIdx(0);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Keyboard navigation for projection slides
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.code === 'Space') {
        setCurrentSlideIdx((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIdx((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length]);

  const currentSlide = slides[currentSlideIdx] || slides[0];

  const backgrounds = {
    dark: 'bg-black',
    gradient: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
    navy: 'bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950',
  };

  return (
    <div className={`fixed inset-0 z-50 ${backgrounds[bgStyle]} text-white flex flex-col justify-between p-8 md:p-16 select-none`}>
      {/* Top bar with subtle metadata */}
      <div className="flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
          <Tv className="w-4 h-4" />
          Projeção ao Vivo • {songTitle}
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Background themes */}
          <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg">
            <button
              onClick={() => setBgStyle('dark')}
              className={`px-2 py-0.5 rounded ${bgStyle === 'dark' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Preto
            </button>
            <button
              onClick={() => setBgStyle('gradient')}
              className={`px-2 py-0.5 rounded ${bgStyle === 'gradient' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Cinza
            </button>
            <button
              onClick={() => setBgStyle('navy')}
              className={`px-2 py-0.5 rounded ${bgStyle === 'navy' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Azul
            </button>
          </div>

          <span className="font-mono font-bold text-amber-400">
            Slide {currentSlideIdx + 1} de {slides.length}
          </span>
        </div>
      </div>

      {/* Main Slide Content (Giant Clean Typography) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-8">
        <div className="text-amber-400 font-bold uppercase tracking-widest text-sm md:text-base mb-6 opacity-80">
          {currentSlide?.sectionTitle}
        </div>

        <div className="space-y-4 md:space-y-6 max-w-5xl">
          {currentSlide?.lines.map((line, idx) => (
            <p
              key={idx}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-100 drop-shadow-md"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIdx === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold disabled:opacity-20 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Slide Anterior
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlideIdx(i)}
              className={`w-3 h-3 rounded-full transition ${
                currentSlideIdx === i ? 'bg-amber-400 scale-125' : 'bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlideIdx === slides.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-20 transition"
        >
          Próximo Slide <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
