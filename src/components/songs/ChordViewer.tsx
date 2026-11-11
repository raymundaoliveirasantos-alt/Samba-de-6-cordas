import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Tv,
  Music,
  Sliders,
  Type,
  Youtube,
  Sparkles,
  Upload,
  Edit3,
  ExternalLink,
  Volume2,
  Globe,
  Layers,
} from 'lucide-react';
import type { Song } from '../../types';
import { parseChordPro, transposeChordProContent } from '../../utils/chordPro';
import { ALL_KEYS, calculateKeyDifference, getPlayShapeKeyWithCapo, getSoundingKeyWithCapo } from '../../utils/transposer';
import { ChordDiagramModal } from '../chords/ChordDiagramModal';
import { SvgChordDiagram } from '../chords/SvgChordDiagram';
import { useAppStore } from '../../store';
import { liveSync } from '../../utils/syncChannel';

interface ChordViewerProps {
  song: Song;
  onEditSong?: () => void;
  onImportForSong?: () => void;
  onAiSuggest?: () => void;
  onOpenWebSearch?: () => void;
  onOpenStageMode?: () => void;
  onOpenProjection?: () => void;
  isAutoral?: boolean;
}

export const ChordViewer: React.FC<ChordViewerProps> = ({
  song,
  onEditSong,
  onImportForSong,
  onAiSuggest,
  onOpenWebSearch,
  onOpenStageMode,
  onOpenProjection,
  isAutoral = song.type === 'autoral',
}) => {
  const { preferences, updatePreferences } = useAppStore();

  // Transpose states
  const [currentKey, setCurrentKey] = useState<string>(song.currentKey || song.originalKey || 'G');
  const [capo, setCapo] = useState<number>(song.capo || 0);
  const [selectedChordForModal, setSelectedChordForModal] = useState<string | null>(null);

  // Auto-scroll states
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(preferences.autoScrollSpeed || 3);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const isUserScrollingRef = useRef<boolean>(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube player drawer
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showAllChordsPalette, setShowAllChordsPalette] = useState<boolean>(true);

  // Sync current key if song changes
  useEffect(() => {
    setCurrentKey(song.currentKey || song.originalKey || 'G');
    setCapo(song.capo || 0);
    setIsScrolling(false);
  }, [song.id, song.currentKey, song.originalKey, song.capo]);

  // Semitone difference from original key
  const semitonesFromOriginal = calculateKeyDifference(song.originalKey, currentKey);

  // How to play with capo
  const playShapeKey = getPlayShapeKeyWithCapo(currentKey, capo);

  // Handle Semitone +/-
  const handleSemitoneChange = (delta: number) => {
    const currentIdx = ALL_KEYS.indexOf(currentKey);
    if (currentIdx !== -1) {
      const newIdx = (currentIdx + delta + ALL_KEYS.length) % ALL_KEYS.length;
      setCurrentKey(ALL_KEYS[newIdx]);
    }
  };

  // Auto-scroll loop using requestAnimationFrame
  useEffect(() => {
    if (!isScrolling) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    let lastTime = performance.now();
    const scrollStep = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isUserScrollingRef.current && scrollContainerRef.current) {
        // Speed formula: pixel per second
        const pixelsPerSecond = scrollSpeed * 12;
        scrollContainerRef.current.scrollTop += pixelsPerSecond * delta;

        // Broadcast scroll position to sync channels (demo)
        liveSync.broadcast('SCROLL_SYNC', {
          songId: song.id,
          scrollTop: scrollContainerRef.current.scrollTop,
        });

        // Check if reached bottom
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
          setIsScrolling(false);
          return;
        }
      }

      scrollAnimRef.current = requestAnimationFrame(scrollStep);
    };

    scrollAnimRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isScrolling, scrollSpeed, song.id]);

  // Handle manual scroll detection to pause and resume smoothly
  const handleScroll = () => {
    if (!isScrolling) return;
    isUserScrollingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 1200);
  };

  // Keyboard shortcut listener (Space = play/pause, +/- = speed, F = Stage Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsScrolling((prev) => !prev);
      } else if (e.key === '+' || e.key === '=') {
        setScrollSpeed((prev) => Math.min(10, prev + 1));
      } else if (e.key === '-' || e.key === '_') {
        setScrollSpeed((prev) => Math.max(1, prev - 1));
      } else if (e.key.toLowerCase() === 'f' && onOpenStageMode) {
        onOpenStageMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenStageMode]);

  // Transpose the raw ChordPro content
  const transposedContent = transposeChordProContent(
    song.chordProContent || '',
    semitonesFromOriginal,
    currentKey,
    preferences.useNashvilleNumbers,
    currentKey
  );

  const parsedDoc = parseChordPro(transposedContent);

  // Extract unique chords from song for immediate instrument palette display
  const uniqueChords = useMemo(() => {
    const list: string[] = [];
    parsedDoc.lines.forEach((line) => {
      line.tokens?.forEach((tok) => {
        if (tok.chord && !list.includes(tok.chord)) {
          list.push(tok.chord);
        }
      });
    });
    return list;
  }, [parsedDoc]);

  // Font size mapping
  const fontSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const lineHeightClasses = {
    compact: 'leading-snug space-y-1',
    normal: 'leading-normal space-y-3',
    relaxed: 'leading-relaxed space-y-4',
  };

  // Video embed url helper
  const getEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
  };

  const embedUrl = song.youtubeUrl ? getEmbedUrl(song.youtubeUrl) : null;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* 1. TOP TOOLBAR: Transposition, Capo, Instruments, Stage Mode */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
        {/* Key & Transpose Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Tom:</span>
          <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl overflow-hidden p-0.5">
            <button
              onClick={() => handleSemitoneChange(-1)}
              className="p-1 px-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition"
              title="Abaixar 1 semitom"
              aria-label="Abaixar 1 semitom"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <select
              value={currentKey}
              onChange={(e) => setCurrentKey(e.target.value)}
              className="bg-transparent text-amber-400 font-bold font-mono text-sm px-1.5 focus:outline-none cursor-pointer"
            >
              {ALL_KEYS.map((k) => (
                <option key={k} value={k} className="bg-slate-900 text-slate-100">
                  {k}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleSemitoneChange(1)}
              className="p-1 px-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition"
              title="Subir 1 semitom"
              aria-label="Subir 1 semitom"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {semitonesFromOriginal !== 0 && (
            <button
              onClick={() => setCurrentKey(song.originalKey)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 text-xs transition flex items-center gap-1"
              title="Restaurar tom original"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Original: {song.originalKey}</span>
            </button>
          )}

          {/* Capo Selector */}
          <div className="hidden sm:flex items-center gap-1 ml-2 bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1 text-xs">
            <span className="text-slate-400">Capo:</span>
            <select
              value={capo}
              onChange={(e) => setCapo(parseInt(e.target.value, 10))}
              className="bg-transparent text-amber-400 font-mono font-bold focus:outline-none cursor-pointer"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-100">
                  {c === 0 ? 'Sem capo' : `${c}ª casa`}
                </option>
              ))}
            </select>
            {capo > 0 && (
              <span className="text-[10px] text-emerald-400 ml-1">
                (Tocar: {playShapeKey})
              </span>
            )}
          </div>
        </div>

        {/* View Options & Actions */}
        <div className="flex items-center gap-1.5">
          {/* Nashville numbers toggle */}
          <button
            onClick={() => updatePreferences({ useNashvilleNumbers: !preferences.useNashvilleNumbers })}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
              preferences.useNashvilleNumbers
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Exibir cifras como Graus Harmônicos (Sistema Nashville)"
          >
            Graus 1-7
          </button>

          {/* Instrument Diagram Selector (Violão, Cavaquinho, Contrabaixo, Teclado, Ukulele) */}
          <select
            value={preferences.instrument}
            onChange={(e) => updatePreferences({ instrument: e.target.value as any })}
            className="bg-slate-800 border border-slate-700 text-amber-300 font-semibold text-xs rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            <option value="violao">🎸 Violão (6 cordas)</option>
            <option value="cavaquinho">🪕 Cavaquinho (D-G-B-D)</option>
            <option value="baixo">🎻 Contrabaixo (Tônica + 5ª)</option>
            <option value="teclado">🎹 Teclado</option>
            <option value="ukulele">🌺 Ukulele</option>
          </select>

          {/* Toggle All Chords Palette Button */}
          {uniqueChords.length > 0 && (
            <button
              onClick={() => setShowAllChordsPalette(!showAllChordsPalette)}
              className={`p-1.5 px-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                showAllChordsPalette
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Exibir ou ocultar a paleta de diagramas de acordes desta música"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Acordes ({uniqueChords.length})</span>
            </button>
          )}

          {/* Web Search Button */}
          {onOpenWebSearch && (
            <button
              onClick={onOpenWebSearch}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-amber-200 border border-slate-700 hover:border-amber-500/40 text-xs font-semibold transition"
              title="Buscar cifra na Web (Google & Cifra Club)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Buscar na Web</span>
            </button>
          )}

          {/* YouTube Video Drawer Button */}
          {song.youtubeUrl && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition ${
                showVideo
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Abrir / fechar vídeo do YouTube"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span className="hidden lg:inline">Vídeo</span>
            </button>
          )}

          {/* Projection window button */}
          {onOpenProjection && (
            <button
              onClick={onOpenProjection}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition"
              title="Abrir tela de projeção em segunda janela (BroadcastChannel)"
              aria-label="Abrir tela de projeção"
            >
              <Tv className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Stage Mode */}
          {onOpenStageMode && (
            <button
              onClick={onOpenStageMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              title="Entrar em Modo Palco (Tela Cheia)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo Palco</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded YouTube Player Drawer (Collapsible) */}
      {showVideo && embedUrl && (
        <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-center">
          <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            <iframe
              src={embedUrl}
              title={song.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Unique Chords Horizontal Palette Drawer for the Selected Instrument */}
      {showAllChordsPalette && uniqueChords.length > 0 && (
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-3 shadow-inner animate-in fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  {preferences.instrument === 'cavaquinho'
                    ? '🪕 Cavaquinho (Ré - Sol - Si - Ré)'
                    : preferences.instrument === 'baixo'
                    ? '🎻 Contrabaixo (Tônica, 5ª e 3ª para Baixaria/Walking Bass)'
                    : preferences.instrument === 'violao'
                    ? '🎸 Violão (6 cordas E-A-D-G-B-E)'
                    : `Acordes para ${preferences.instrument}`}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {uniqueChords.length} acordes
                </span>
              </div>

              {/* Quick Instrument Switcher Pills inside the drawer */}
              <div className="flex items-center gap-1 text-[11px] bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => updatePreferences({ instrument: 'violao' })}
                  className={`px-2 py-0.5 rounded transition ${
                    preferences.instrument === 'violao' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Violão
                </button>
                <button
                  type="button"
                  onClick={() => updatePreferences({ instrument: 'cavaquinho' })}
                  className={`px-2 py-0.5 rounded transition ${
                    preferences.instrument === 'cavaquinho' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cavaquinho
                </button>
                <button
                  type="button"
                  onClick={() => updatePreferences({ instrument: 'baixo' })}
                  className={`px-2 py-0.5 rounded transition ${
                    preferences.instrument === 'baixo' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Contrabaixo
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
              {uniqueChords.map((ch) => (
                <div
                  key={ch}
                  onClick={() => setSelectedChordForModal(ch)}
                  className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform p-1 rounded-xl hover:bg-slate-800/80"
                  title={`Clique para ouvir e ver em detalhes: ${ch}`}
                >
                  <SvgChordDiagram
                    chord={ch}
                    instrument={preferences.instrument as any}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN SCROLLABLE CHORD SHEET CONTAINER */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6"
      >
        <div className="max-w-4xl mx-auto">
          {/* Song Header & Metadata */}
          <div className="pb-4 mb-6 border-b border-slate-800/80">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                  {song.title}
                  {isAutoral && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                      Autoral
                    </span>
                  )}
                  {song.status === 'pendente' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase">
                      Pendente de Cifra
                    </span>
                  )}
                </h1>
                <p className="text-base text-slate-400 mt-0.5">{song.artist || 'Artista não informado'}</p>
              </div>

              {/* Badges: BPM, Compass, Instrument soloist */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {song.bpm && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    ♩ {song.bpm} BPM
                  </span>
                )}
                {song.timeSignature && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    {song.timeSignature}
                  </span>
                )}
                {song.instrument && (
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-semibold">
                    🎺 {song.instrument}
                  </span>
                )}
                {song.block && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold">
                    Bloco {song.block}
                  </span>
                )}
              </div>
            </div>

            {song.notes && (
              <div className="mt-3 text-xs bg-slate-900/80 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl">
                <span className="font-semibold text-amber-400">Observação da Banda: </span>
                {song.notes}
              </div>
            )}
          </div>

          {/* 3. CASE A: EMPTY SKELETON SONG (Section 4.1 & 8.1) */}
          {(!song.chordProContent || song.chordProContent.trim().length === 0) ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-8 text-center my-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">
                {isAutoral ? 'Música Autoral da Banda' : 'Cifra ainda não cadastrada'}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
                {isAutoral
                  ? 'Por se tratar de música autoral da banda, o app aguarda o envio do arquivo (.docx ou .pdf) ou digitação manual no editor.'
                  : 'Esta música faz parte do repertório mas ainda não tem letra e acordes cadastrados.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Web Search Button (Google / Cifra Club) */}
                {onOpenWebSearch && (
                  <button
                    onClick={onOpenWebSearch}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    Buscar Cifra na Web
                  </button>
                )}

                {onImportForSong && (
                  <button
                    onClick={onImportForSong}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    Inserir Arquivo (.docx / .pdf)
                  </button>
                )}

                {onEditSong && (
                  <button
                    onClick={onEditSong}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    Digitar no Editor
                  </button>
                )}

                {/* AI Suggestion ONLY for non-autoral songs (Requirement 4.7) */}
                {!isAutoral && onAiSuggest && (
                  <button
                    onClick={onAiSuggest}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-teal-600/30 hover:from-amber-600/40 hover:to-teal-600/40 text-amber-200 border border-amber-500/30 font-semibold text-sm transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Buscar com IA (Revisar)
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* 4. CASE B: PARSED CHORDPRO SHEET DISPLAY */
            <div className={`${fontSizeClasses[preferences.fontSize]} ${lineHeightClasses[preferences.lineHeight]}`}>
              {parsedDoc.lines.map((line, idx) => {
                if (line.type === 'empty') {
                  return <div key={`empty-${idx}`} className="h-4" />;
                }

                if (line.type === 'section_start') {
                  return (
                    <div key={`sec-start-${idx}`} className="pt-4 pb-1">
                      <span className="inline-block px-3 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold uppercase text-xs tracking-wider border border-amber-500/30">
                        {line.sectionName || 'Seção'}
                      </span>
                    </div>
                  );
                }

                if (line.type === 'section_end') {
                  return <div key={`sec-end-${idx}`} className="pb-2 border-b border-slate-850" />;
                }

                if (line.type === 'comment') {
                  return (
                    <div
                      key={`comm-${idx}`}
                      className="text-xs font-semibold text-cyan-400/90 italic bg-cyan-950/30 border-l-2 border-cyan-500 pl-3 py-1 my-1.5 rounded-r"
                    >
                      {line.comment}
                    </div>
                  );
                }

                if (line.type === 'directive') {
                  return null; // directives like {title} are rendered in header
                }

                // Regular chord & lyric line
                return (
                  <div key={`line-${idx}`} className="flex flex-wrap items-end">
                    {line.tokens?.map((token, tIdx) => (
                      <span key={`tok-${tIdx}`} className="inline-flex flex-col mr-1">
                        {/* Chord above syllable */}
                        {preferences.showChords && token.chord ? (
                          <button
                            type="button"
                            onClick={() => setSelectedChordForModal(token.chord || null)}
                            className="font-chord font-bold text-amber-400 hover:text-amber-200 hover:underline cursor-pointer text-left -mb-1 transition"
                            title={`Ver diagrama do acorde ${token.chord}`}
                          >
                            {token.chord}
                          </button>
                        ) : (
                          preferences.showChords && <span className="h-5" />
                        )}
                        {/* Lyric text */}
                        <span className="font-sans text-slate-100 whitespace-pre">
                          {token.lyric || ' '}
                        </span>
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. FLOATING AUTO-SCROLL CONTROL BAR */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between px-4 py-2.5 bg-slate-900/95 backdrop-blur border-t border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScrolling(!isScrolling)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition shadow ${
              isScrolling
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isScrolling ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" /> Pausar Rolagem
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-200" /> Auto-Scroll
              </>
            )}
          </button>

          {/* Speed selector 1 to 10 */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <span className="text-slate-400 font-medium">Vel:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={scrollSpeed}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setScrollSpeed(val);
                updatePreferences({ autoScrollSpeed: val });
              }}
              className="w-16 sm:w-24 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-amber-400 font-bold w-4 text-center">{scrollSpeed}</span>
          </div>
        </div>

        {/* Font size adjustments */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 hidden sm:inline mr-1">Fonte:</span>
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updatePreferences({ fontSize: size })}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                preferences.fontSize === size
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chord Diagram Modal on Click */}
      <ChordDiagramModal
        chord={selectedChordForModal}
        songKey={currentKey}
        defaultInstrument={preferences.instrument}
        onClose={() => setSelectedChordForModal(null)}
      />
    </div>
  );
};
