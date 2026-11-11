import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Play,
  Pause,
  StopCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  X,
  Music,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { db } from '../../db';
import type { Song } from '../../types';

interface BatchWebSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongsUpdated: () => void;
}

interface ProcessItemLog {
  id: string;
  title: string;
  artist: string;
  status: 'pending' | 'processing' | 'success' | 'fallback' | 'skipped' | 'error';
  key?: string;
  source?: string;
  sourceUrl?: string;
  error?: string;
}

export const BatchWebSyncModal: React.FC<BatchWebSyncModalProps> = ({
  isOpen,
  onClose,
  onSongsUpdated,
}) => {
  const [scope, setScope] = useState<'pending' | 'all' | 'repertoire_only'>('pending');
  const [includeAutorais, setIncludeAutorais] = useState<boolean>(true);

  // Execution state
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'cancelled'>('idle');
  const [songsToProcess, setSongsToProcess] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [logs, setLogs] = useState<ProcessItemLog[]>([]);

  // Stats
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // Control refs for loop
  const isCancelledRef = useRef(false);
  const isPausedRef = useRef(false);

  // Load songs on mount or when modal opens
  useEffect(() => {
    if (!isOpen) return;

    db.songs.toArray().then((all) => {
      let targets: Song[] = [];
      if (scope === 'pending') {
        targets = all.filter((s) => s.status === 'pendente' || !s.chordProContent || s.chordProContent.trim().length === 0);
      } else if (scope === 'repertoire_only') {
        targets = all.filter((s) => s.type === 'repertorio');
      } else {
        targets = all;
      }

      if (!includeAutorais) {
        targets = targets.filter((s) => s.type !== 'autoral');
      }

      setSongsToProcess(targets);
      setCurrentIndex(0);
      setStatus('idle');
      setSuccessCount(0);
      setErrorCount(0);

      setLogs(
        targets.map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist || (s.type === 'autoral' ? 'Autoral Banda SSC' : ''),
          status: 'pending',
        }))
      );
    });
  }, [isOpen, scope, includeAutorais]);

  if (!isOpen) return null;

  // Process single song with Google Search Grounding & fallbacks
  const processSong = async (song: Song): Promise<{
    chordProContent: string;
    key: string;
    bpm: number;
    source?: string;
    sourceUrl?: string;
    notes?: string;
  }> => {
    const isAutoral = song.type === 'autoral';
    const isIntro = song.title.startsWith('(Intro');

    // Call server endpoint with real web search grounding
    const res = await fetch('/api/gemini/suggest-chords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: song.title,
        artist: song.artist,
        isAutoral: isAutoral || isIntro,
      }),
    });

    const data = await res.json();
    if (data.error && !data.chordProContent) {
      throw new Error(data.error);
    }

    return {
      chordProContent: data.chordProContent,
      key: data.suggestedKey || song.originalKey || 'G',
      bpm: data.bpm || song.bpm || 100,
      source: data.sourceUrls?.[0]?.title || 'Google Search / Cifra Club',
      sourceUrl: data.sourceUrls?.[0]?.uri,
      notes: data.musicalNotes,
    };
  };

  // Main sync loop
  const startSync = async () => {
    if (songsToProcess.length === 0) return;

    setStatus('running');
    isCancelledRef.current = false;
    isPausedRef.current = false;

    let success = successCount;
    let errors = errorCount;

    for (let i = currentIndex; i < songsToProcess.length; i++) {
      if (isCancelledRef.current) {
        setStatus('cancelled');
        break;
      }

      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 200));
        if (isCancelledRef.current) {
          setStatus('cancelled');
          return;
        }
      }

      const song = songsToProcess[i];
      setCurrentIndex(i);

      // Update log to 'processing'
      setLogs((prev) =>
        prev.map((log) => (log.id === song.id ? { ...log, status: 'processing' } : log))
      );

      try {
        const result = await processSong(song);

        // Save immediately to Dexie database
        await db.songs.update(song.id, {
          chordProContent: result.chordProContent,
          originalKey: result.key,
          currentKey: result.key,
          bpm: result.bpm,
          status: 'pronto',
          origin: 'sugestao_ia',
          updatedAt: new Date().toISOString(),
        });

        success++;
        setSuccessCount(success);

        setLogs((prev) =>
          prev.map((log) =>
            log.id === song.id
              ? {
                  ...log,
                  status: 'success',
                  key: result.key,
                  source: result.source,
                  sourceUrl: result.sourceUrl,
                }
              : log
          )
        );
      } catch (err: any) {
        console.warn(`Erro ao atualizar ${song.title}:`, err);
        errors++;
        setErrorCount(errors);

        setLogs((prev) =>
          prev.map((log) =>
            log.id === song.id
              ? {
                  ...log,
                  status: 'error',
                  error: err.message || 'Falha na conexão com a web',
                }
              : log
          )
        );
      }

      // Small gentle delay between songs to avoid triggering burst rate limits
      await new Promise((r) => setTimeout(r, 400));
    }

    if (!isCancelledRef.current) {
      setStatus('completed');
      setCurrentIndex(songsToProcess.length);
    }

    onSongsUpdated();
  };

  const handlePause = () => {
    isPausedRef.current = true;
    setStatus('paused');
  };

  const handleResume = () => {
    isPausedRef.current = false;
    setStatus('running');
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    setStatus('cancelled');
  };

  const handleFinish = () => {
    onSongsUpdated();
    onClose();
  };

  const progressPercent =
    songsToProcess.length > 0
      ? Math.min(100, Math.round((currentIndex / songsToProcess.length) * 100))
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Atualizar Todas as Músicas na Web
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                  Google Search & Cifra Club
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Busca em lote na internet letras, tonalidades e acordes reais em ChordPro para todo o seu acervo.
              </p>
            </div>
          </div>

          <button
            onClick={status === 'running' ? handleCancel : onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* OPTIONS (Available when idle) */}
          {status === 'idle' && (
            <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Selecione o Escopo da Atualização
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setScope('pending')}
                  className={`p-3 rounded-xl border text-left transition ${
                    scope === 'pending'
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">Músicas Pendentes</div>
                  <div className="text-[11px] opacity-80">
                    Apenas músicas sem acordes cadastrados (Recomendado).
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('repertoire_only')}
                  className={`p-3 rounded-xl border text-left transition ${
                    scope === 'repertoire_only'
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">Repertório Geral</div>
                  <div className="text-[11px] opacity-80">
                    Músicas de compositores conhecidos (Cartola, Bezerra, etc.).
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`p-3 rounded-xl border text-left transition ${
                    scope === 'all'
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">Todas as Músicas</div>
                  <div className="text-[11px] opacity-80">
                    Todo o catálogo do workspace ({songsToProcess.length} músicas).
                  </div>
                </button>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeAutorais"
                  checked={includeAutorais}
                  onChange={(e) => setIncludeAutorais(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="includeAutorais" className="text-xs text-slate-300 cursor-pointer">
                  Incluir também guias harmônicas para músicas autorais e passagens instrumentais
                </label>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center justify-between">
                <span>
                  Total selecionado para atualização:{' '}
                  <strong className="text-amber-400 font-mono text-sm">{songsToProcess.length}</strong> músicas
                </span>
                <span className="text-[11px] text-slate-400">
                  Salvas automaticamente no IndexedDB
                </span>
              </div>
            </div>
          )}

          {/* PROGRESS BAR (Active when running, paused, completed) */}
          {status !== 'idle' && (
            <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  {status === 'running' && (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  )}
                  {status === 'paused' && (
                    <Pause className="w-4 h-4 text-amber-400" />
                  )}
                  {status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {status === 'cancelled' && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  {status === 'running' && 'Atualizando músicas da web em tempo real...'}
                  {status === 'paused' && 'Atualização pausada'}
                  {status === 'completed' && '🎉 Todas as músicas foram atualizadas na web com sucesso!'}
                  {status === 'cancelled' && 'Atualização interrompida'}
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {currentIndex} de {songsToProcess.length} ({progressPercent}%)
                </span>
              </div>

              {/* Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-3 rounded-full transition-all duration-300 ease-out shadow"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-4 text-xs pt-1 text-slate-400">
                <span className="text-emerald-400 font-bold">
                  ✓ {successCount} atualizadas com sucesso
                </span>
                {errorCount > 0 && (
                  <span className="text-red-400 font-bold">
                    ✗ {errorCount} falhas
                  </span>
                )}
              </div>
            </div>
          )}

          {/* REALTIME LIST OF PROCESSED SONGS */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status das Músicas ({logs.length})
            </h4>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {logs.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                    item.status === 'processing'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : item.status === 'success'
                      ? 'bg-slate-950/80 border-slate-800/80 text-slate-200'
                      : item.status === 'error'
                      ? 'bg-red-950/30 border-red-900/50 text-red-300'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[10px] text-slate-500 w-5 text-right">
                      {idx + 1}
                    </span>

                    {item.status === 'processing' && (
                      <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    )}
                    {item.status === 'pending' && (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />
                    )}

                    <div className="truncate">
                      <span className="font-bold text-slate-200">{item.title}</span>
                      {item.artist && (
                        <span className="text-slate-400 ml-1.5 text-[11px]">({item.artist})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {item.key && (
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800 text-[10px]">
                        {item.key}
                      </span>
                    )}
                    {item.source && (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        {item.source}
                      </span>
                    )}
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300"
                        title="Ver no site original"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <button
            onClick={status === 'completed' ? handleFinish : onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            {status === 'completed' ? 'Fechar' : 'Cancelar'}
          </button>

          <div className="flex items-center gap-2">
            {status === 'idle' && (
              <button
                onClick={startSync}
                disabled={songsToProcess.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                Iniciar Atualização na Web ({songsToProcess.length} músicas)
              </button>
            )}

            {status === 'running' && (
              <>
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                >
                  <Pause className="w-3.5 h-3.5" /> Pausar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs font-bold border border-red-500/40 transition"
                >
                  <StopCircle className="w-3.5 h-3.5" /> Interromper
                </button>
              </>
            )}

            {status === 'paused' && (
              <>
                <button
                  onClick={handleResume}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" /> Continuar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Parar
                </button>
              </>
            )}

            {status === 'completed' && (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Concluir e Ver Músicas Atualizadas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
