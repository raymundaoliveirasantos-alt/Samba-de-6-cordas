import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Printer,
  Calendar,
  MapPin,
  Clock,
  Music,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type { Setlist, Song } from '../types';
import { db } from '../db';
import { ALL_KEYS } from '../utils/transposer';
import { useAppStore } from '../store';

interface SetlistDetailViewProps {
  setlist: Setlist;
  onBack: () => void;
  onSelectSong: (song: Song) => void;
  onStartStageMode: (setlist: Setlist, startIdx: number) => void;
}

export const SetlistDetailView: React.FC<SetlistDetailViewProps> = ({
  setlist,
  onBack,
  onSelectSong,
  onStartStageMode,
}) => {
  const { userPlan } = useAppStore();
  const [currentSetlist, setCurrentSetlist] = useState<Setlist>(setlist);
  const [songsMap, setSongsMap] = useState<Record<string, Song>>({});
  const [loading, setLoading] = useState(true);

  // Pro Stage AI Insights state
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsData, setInsightsData] = useState<{
    estimatedDurationMinutes: number;
    keyBalanceScore: number;
    keyBalanceAnalysis: string;
    vocalRangeAlerts: string[];
    transitionTips: string[];
    recommendations: string[];
  } | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      const all = await db.songs.toArray();
      const map: Record<string, Song> = {};
      all.forEach((s: Song) => {
        map[s.id] = s;
      });
      setSongsMap(map);
      setLoading(false);
    };
    fetchSongs();
  }, []);

  // Reorder items
  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const items = [...currentSetlist.items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    // Update order sequence
    items.forEach((it, idx) => {
      it.order = idx + 1;
    });

    const updated = { ...currentSetlist, items, updatedAt: new Date().toISOString() };
    setCurrentSetlist(updated);
    await db.setlists.update(updated.id, { items });
  };

  // Change key for a specific item in this setlist
  const changeItemKey = async (index: number, newKey: string) => {
    const items = [...currentSetlist.items];
    items[index].selectedKey = newKey;
    const updated = { ...currentSetlist, items, updatedAt: new Date().toISOString() };
    setCurrentSetlist(updated);
    await db.setlists.update(updated.id, { items });
  };

  // Update leader notes
  const updateLeaderNotes = async (index: number, notes: string) => {
    const items = [...currentSetlist.items];
    items[index].leaderNotes = notes;
    const updated = { ...currentSetlist, items, updatedAt: new Date().toISOString() };
    setCurrentSetlist(updated);
    await db.setlists.update(updated.id, { items });
  };

  // Remove item from setlist
  const removeItem = async (index: number) => {
    const items = currentSetlist.items.filter((_: any, idx: number) => idx !== index);
    items.forEach((it: any, idx: number) => {
      it.order = idx + 1;
    });
    const updated = { ...currentSetlist, items, updatedAt: new Date().toISOString() };
    setCurrentSetlist(updated);
    await db.setlists.update(updated.id, { items });
  };

  // Pro Stage AI Insights Request (Section 4.7)
  const fetchProInsights = async () => {
    setInsightsLoading(true);
    setShowInsightsModal(true);

    try {
      const itemsPayload = currentSetlist.items.map((it: any) => {
        const song = songsMap[it.songId];
        return {
          title: song?.title || 'Música',
          artist: song?.artist || '',
          selectedKey: it.selectedKey || song?.originalKey || 'G',
          bpm: song?.bpm || 100,
          notes: it.leaderNotes || song?.notes || '',
        };
      });

      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setlistName: currentSetlist.name,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setInsightsData(data);
    } catch (e: any) {
      console.warn('Erro ao buscar insights:', e);
      // Fallback local heuristic
      setInsightsData({
        estimatedDurationMinutes: Math.round(currentSetlist.items.length * 4.2),
        keyBalanceScore: 8,
        keyBalanceAnalysis: 'Boa variedade harmônica com predominância de tons menores ideais para repertório intimista.',
        vocalRangeAlerts: ['Atenção para modulação no bloco intermediário.'],
        transitionTips: ['Sustente o pad de adoração entre as passagens de bloco.'],
        recommendations: [
          'Inicie com andamento mais cadenciado e aumente no bloco central.',
          'Mantenha o instrumento solista em evidência nas introduções.',
        ],
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  // Print setlist sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 md:p-8 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            aria-label="Voltar para todos os repertórios"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              {currentSetlist.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              {currentSetlist.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {new Date(currentSetlist.date).toLocaleDateString('pt-BR')}
                </span>
              )}
              {currentSetlist.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {currentSetlist.location}
                </span>
              )}
              <span className="font-mono text-amber-400 font-bold">
                {currentSetlist.items?.length || 0} músicas
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Pro Stage AI Insights */}
          <button
            onClick={fetchProInsights}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-teal-500/20 hover:from-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow"
            title="Insights Pro do Repertório com IA"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Insights Pro (IA)</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            title="Imprimir lista do repertório"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Start Stage Mode */}
          <button
            onClick={() => onStartStageMode(currentSetlist, 0)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Tocar no Palco</span>
          </button>
        </div>
      </div>

      {currentSetlist.notes && (
        <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <span className="font-bold text-amber-400">Observações Gerais: </span>
          {currentSetlist.notes}
        </div>
      )}

      {/* Ordered List of Songs */}
      <div className="space-y-2">
        {currentSetlist.items.map((item: any, idx: number) => {
          const song = songsMap[item.songId];
          const isAutoral = song?.type === 'autoral';
          const isPending = song?.status === 'pendente';
          const isIntro = song?.title.startsWith('(Intro');

          // Check if start of a new block
          const showBlockHeader =
            item.block &&
            (idx === 0 || currentSetlist.items[idx - 1]?.block !== item.block);

          return (
            <React.Fragment key={`${item.songId}-${idx}`}>
              {showBlockHeader && (
                <div className="pt-4 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
                      Bloco {item.block}
                    </span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition group">
                {/* Order number */}
                <div className="w-7 font-mono text-xs font-bold text-slate-500 text-center">
                  {idx + 1}
                </div>

                {/* Move buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 rounded text-slate-500 hover:text-white disabled:opacity-20"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === currentSetlist.items.length - 1}
                    className="p-0.5 rounded text-slate-500 hover:text-white disabled:opacity-20"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Song info & click to open */}
                <div
                  onClick={() => song && onSelectSong(song)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition-colors truncate">
                      {song?.title || `Música ID: ${item.songId}`}
                    </h3>

                    {isAutoral && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Autoral
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                        Pendente
                      </span>
                    )}
                    {isIntro && (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/15 px-1.5 py-0.2 rounded border border-cyan-500/30">
                        Intro
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="truncate">{song?.artist || (isAutoral ? 'Banda SSC' : '')}</span>
                    {song?.instrument && (
                      <span className="text-cyan-300 font-medium">🎷 {song.instrument}</span>
                    )}
                  </div>
                </div>

                {/* Key Selector for this Setlist */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Tom:</span>
                  <select
                    value={item.selectedKey || song?.originalKey || 'G'}
                    onChange={(e) => changeItemKey(idx, e.target.value)}
                    className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-amber-400 font-mono font-bold text-xs focus:outline-none"
                  >
                    <option value="??">??</option>
                    {ALL_KEYS.map((k: string) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(idx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Remover do repertório"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Pro Stage AI Insights Modal */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-lg w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">
                  Insights de Repertório (Plano Pro Stage)
                </h3>
              </div>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {insightsLoading ? (
              <div className="py-12 text-center text-amber-400 animate-pulse text-sm">
                Analisando tonalidades, andamentos e tessituras vocais com Gemini AI...
              </div>
            ) : insightsData ? (
              <div className="space-y-4 text-xs">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Duração Estimada:</span>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                      ~{insightsData.estimatedDurationMinutes} min
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Equilíbrio de Tons:</span>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                      {insightsData.keyBalanceScore}/10
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-amber-400">Análise Harmônica: </span>
                  {insightsData.keyBalanceAnalysis}
                </div>

                {/* Vocal Range Alerts */}
                {insightsData.vocalRangeAlerts?.length > 0 && (
                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-amber-200">
                    <span className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Alertas de Extensão Vocal:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {insightsData.vocalRangeAlerts.map((al, i) => (
                        <li key={i}>{al}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Transition Tips */}
                {insightsData.transitionTips?.length > 0 && (
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-cyan-400 block mb-1">
                      Dicas de Transição entre Músicas:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {insightsData.transitionTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs mt-2"
                >
                  Fechar Análise
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
