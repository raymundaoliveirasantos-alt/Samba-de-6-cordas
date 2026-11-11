import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Lock,
  Unlock,
  X,
  Clock,
  Tv,
  Music,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { Song, Setlist } from '../types';
import { parseChordPro, transposeChordProContent } from '../utils/chordPro';
import { liveSync } from '../utils/syncChannel';
import { useAppStore } from '../store';

interface StageModeViewProps {
  songs: Song[];
  initialSongIndex: number;
  setlistName?: string;
  onExit: () => void;
  onOpenProjection?: () => void;
}

export const StageModeView: React.FC<StageModeViewProps> = ({
  songs,
  initialSongIndex = 0,
  setlistName,
  onExit,
  onOpenProjection,
}) => {
  const { preferences } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(initialSongIndex);
  const [isLocked, setIsLocked] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [currentTime, setCurrentTime] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentSong = songs[currentIndex] || songs[0];
  const nextSong = currentIndex + 1 < songs.length ? songs[currentIndex + 1] : null;

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Broadcast current song to projection window
  useEffect(() => {
    if (currentSong) {
      liveSync.broadcast('CURRENT_SONG_CHANGED', {
        id: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist,
        content: currentSong.chordProContent,
      });
    }
  }, [currentSong]);

  // Keyboard navigation (← and → to switch songs, Space to scroll)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isLocked) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentIndex < songs.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoScrolling((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, songs.length, isLocked]);

  // Auto-scroll loop
  useEffect(() => {
    if (!isAutoScrolling) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed * 15 * delta;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
          setIsAutoScrolling(false);
          return;
        }
      }
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  if (!currentSong) return null;

  const parsedDoc = parseChordPro(currentSong.chordProContent || '');
  const isPending = currentSong.status === 'pendente';
  const isAutoral = currentSong.type === 'autoral';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      {/* 1. TOP STAGE HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800/80 shadow-lg">
        {/* Left: Song Progress & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            disabled={isLocked}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
            title="Sair do Modo Palco"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                {currentIndex + 1}/{songs.length}
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight truncate max-w-sm sm:max-w-md">
                {currentSong.title}
              </h1>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
              <span>{currentSong.artist || (isAutoral ? 'Banda SSC' : '')}</span>
              {currentSong.originalKey && (
                <span className="font-mono font-bold text-amber-400">
                  Tom: {currentSong.originalKey}
                </span>
              )}
              {currentSong.instrument && (
                <span className="text-cyan-300 font-semibold">🎷 {currentSong.instrument}</span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Next Song Preview */}
        {nextSong && (
          <div className="hidden lg:flex flex-col text-right pr-4 border-r border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Próxima Música:</span>
            <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">
              {nextSong.title} ({nextSong.originalKey})
            </span>
          </div>
        )}

        {/* Right: Clock & Lock */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-base font-bold text-amber-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-slate-400" />
            {currentTime}
          </div>

          {/* Accidental touch lock toggle */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`p-2 rounded-xl transition ${
              isLocked
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isLocked ? 'Toque travado (clique para destravar)' : 'Travar tela contra toques acidentais'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN CHORD CANVAS (Ultra High Legibility) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 md:px-12 py-8 bg-slate-950"
      >
        <div className="max-w-4xl mx-auto">
          {isPending || !currentSong.chordProContent ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 my-12">
              <Music className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-slate-200">{currentSong.title}</h2>
              <p className="text-sm text-slate-400 mt-2">
                {isAutoral
                  ? 'Música autoral da banda — Aguardando inclusão da cifra.'
                  : 'Cifra ainda não cadastrada.'}
              </p>
              {currentSong.notes && (
                <div className="mt-4 p-3 rounded-xl bg-slate-950 text-xs text-amber-300 max-w-md mx-auto border border-slate-800">
                  {currentSong.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-xl md:text-2xl leading-relaxed">
              {parsedDoc.lines.map((line: any, idx: number) => {
                if (line.type === 'empty') return <div key={idx} className="h-6" />;
                if (line.type === 'section_start') {
                  return (
                    <div key={idx} className="pt-4 pb-1">
                      <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-sm uppercase tracking-wider border border-amber-500/40">
                        {line.sectionName}
                      </span>
                    </div>
                  );
                }
                if (line.type === 'section_end') {
                  return <div key={idx} className="border-b border-slate-800/80 pb-2" />;
                }
                if (line.type === 'comment') {
                  return (
                    <div key={idx} className="text-sm font-semibold text-cyan-300 italic bg-cyan-950/30 pl-3 py-1 rounded border-l-4 border-cyan-500">
                      {line.comment}
                    </div>
                  );
                }
                return (
                  <div key={idx} className="flex flex-wrap items-end font-sans">
                    {line.tokens?.map((token: any, tIdx: number) => (
                      <span key={tIdx} className="inline-flex flex-col mr-2">
                        {token.chord ? (
                          <span className="font-chord font-black text-amber-400 text-lg md:text-xl -mb-1">
                            {token.chord}
                          </span>
                        ) : (
                          <span className="h-6" />
                        )}
                        <span className="text-slate-100 whitespace-pre">{token.lyric || ' '}</span>
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM STAGE CONTROLS */}
      {!isLocked && (
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-t border-slate-800 shadow-xl">
          <button
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1);
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
              }
            }}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs disabled:opacity-20 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {/* Auto-scroll toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow transition ${
                isAutoScrolling
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isAutoScrolling ? (
                <>
                  <Pause className="w-4 h-4 fill-slate-950" /> Pausar Rolagem
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-200" /> Auto-Scroll
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              if (currentIndex < songs.length - 1) {
                setCurrentIndex((prev) => prev + 1);
                if (scrollRef.current) scrollRef.current.scrollTop = 0;
              }
            }}
            disabled={currentIndex === songs.length - 1}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-20 transition shadow"
          >
            Próxima <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
